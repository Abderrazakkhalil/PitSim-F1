import json
import csv
from typing import List, Dict, Any
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from core.models import Ecurie, CircuitCluster, Pneumatique
from race.forms import RaceConfigForm
from optimizer.dynamic_prog import RaceOptimizer



def _format_time(seconds: float) -> str:
    """Convertit des secondes en format 'Xm Y.Zs'."""
    mins = int(seconds // 60)
    secs = seconds % 60
    return f"{mins}m {secs:.2f}s"


def _build_weather_forecast(meteo_initiale: str, nombre_tours: int, tour_pluie) -> List[str]:
    forecast = [meteo_initiale] * nombre_tours
    if tour_pluie and 1 <= int(tour_pluie) <= nombre_tours:
        for i in range(int(tour_pluie) - 1, nombre_tours):
            forecast[i] = "Pluie forte"
    return forecast


def _enrich_result(result: Dict[str, Any]) -> Dict[str, Any]:
    """Ajoute des champs pré-formatés pour le template Django."""
    if result.get("status") != "success":
        return result

    for strat_key, strat in result.get("comparatif_strategies", {}).items():
        strat["temps_total_formate"] = _format_time(strat["temps_total_s"])
        nb = strat_key.split("_")[0]
        strat["label_lisible"] = f"{nb} Arrêt{'s' if int(nb) > 1 else ''}"

    best = result.get("meilleure_strategie_globale")
    if best:
        best["temps_total_formate"] = _format_time(best["temps_total_s"])
        # Durée en tours de chaque relais (pour la barre flex)
        for relais in best.get("relais", []):
            relais["duree"] = int(relais["tour_fin"]) - int(relais["tour_depart"]) + 1

    return result


def _build_chart_series(result: Dict[str, Any], N: int) -> List[Dict[str, Any]]:
    COLORS = {
        "1_arret":  {"border": "rgba(239,68,68,1)",   "bg": "rgba(239,68,68,0.08)"},
        "2_arrets": {"border": "rgba(59,130,246,1)",  "bg": "rgba(59,130,246,0.08)"},
        "3_arrets": {"border": "rgba(34,197,94,1)",   "bg": "rgba(34,197,94,0.08)"},
    }
    series = []
    for strat_key, strat_data in result.get("comparatif_strategies", {}).items():
        laps_data = _reconstruct_lap_times(strat_data, N)
        nb = strat_key.split("_")[0]
        label = f"{nb} Arrêt{'s' if int(nb) > 1 else ''}"
        color = COLORS.get(strat_key, {"border": "#999", "bg": "rgba(153,153,153,0.08)"})
        series.append({
            "label":            label,
            "data":             laps_data["times"],
            "borderColor":      color["border"],
            "backgroundColor":  color["bg"],
            "borderWidth":      2,
            "pointRadius":      2,
            "pointHoverRadius": 5,
            "tension":          0.3,
            "fill":             True,
        })
    return series


def _reconstruct_lap_times(strat_data: Dict[str, Any], N: int) -> Dict:
    times = []
    tours_arret = strat_data.get("tours_arret", [])
    gommes_list = strat_data.get("gommes", ["Medium"])
    temps_total = strat_data.get("temps_total_s", N * 90)
    bornes = [0] + tours_arret + [N]
    t_moy_global = temps_total / N

    for segment_idx, (start, end) in enumerate(zip(bornes, bornes[1:])):
        longueur = max(1, end - start)
        for n_stint in range(1, longueur + 1):
            times.append(round(t_moy_global + 0.05 * n_stint, 3))

    return {"times": times[:N]}


# ── Vues ─────────────────────────────────────────────────────

class RaceUnifiedView(View):
    template_name = "race/dashboard_unified.html"

    def get(self, request):
        return render(request, self.template_name, {"form": RaceConfigForm()})

    def post(self, request):
        form = RaceConfigForm(request.POST)
        if not form.is_valid():
            return render(request, self.template_name, {"form": form, "error": "Formulaire invalide"})

        ecurie     = form.cleaned_data["ecurie"]
        circuit    = form.cleaned_data["circuit"]
        N          = form.cleaned_data["nombre_tours"]
        t_base     = form.cleaned_data["t_base"]
        meteo_idx  = form.cleaned_data["meteo_initiale"]
        tour_pluie = form.cleaned_data.get("tour_pluie") or None

        if tour_pluie == 0:
            tour_pluie = None

        meteo_init = form.METEO_CHOICES.get(meteo_idx, "Sec chaud")
        weather_forecast = _build_weather_forecast(meteo_init, N, tour_pluie)

        try:
            optimizer = RaceOptimizer(ecurie.nom, circuit.nom_circuit, N, t_base)
            result = optimizer.optimize(weather_forecast)
            result = _enrich_result(result)
        except Exception as e:
            import traceback
            result = {"status": "error", "message": str(e), "trace": traceback.format_exc()}

        chart_series = _build_chart_series(result, N) if result.get("status") == "success" else []

        # Session : on stocke uniquement les éléments JSON-sérialisables
        try:
            request.session["last_result"] = result
            request.session["last_N"] = N
        except Exception:
            pass

        return render(request, self.template_name, {
            "form":              form,
            "result":            result,
            "chart_series_json": json.dumps(chart_series),
            "N":                 N,
            "ecurie_nom":        ecurie.nom,
            "circuit_nom":       circuit.nom_circuit,
            "tour_pluie":        tour_pluie,
        })


# ── APIs ─────────────────────────────────────────────────────

def api_ecurie_details(request):
    ecurie_id = request.GET.get("ecurie")
    if not ecurie_id:
        return JsonResponse({"error": "id manquant"}, status=400)
    try:
        ecurie = Ecurie.objects.get(pk=ecurie_id)
        return JsonResponse({
            "gamma": ecurie.gamma, "t_pit": ecurie.T_pit,
            "delta": ecurie.delta, "profil": ecurie.profil,
            "caracteristique": ecurie.caracteristique,
        })
    except Ecurie.DoesNotExist:
        return JsonResponse({"error": "Introuvable"}, status=404)


def api_circuit_details(request):
    circuit_id = request.GET.get("circuit")
    if not circuit_id:
        return JsonResponse({"error": "id manquant"}, status=400)
    try:
        circuit = CircuitCluster.objects.get(pk=circuit_id)
        similaires = list(
            CircuitCluster.objects
            .filter(cluster_label=circuit.cluster_label)
            .exclude(pk=circuit_id)
            .values_list("nom_circuit", flat=True)[:3]
        )
        return JsonResponse({
            "cluster_label":  circuit.cluster_label,
            "temp_piste_moy": circuit.temp_piste_moy,
            "proba_pluie":    circuit.proba_pluie,
            "similaires":     similaires,
        })
    except CircuitCluster.DoesNotExist:
        return JsonResponse({"error": "Introuvable"}, status=404)


def export_csv(request):
    result = request.session.get("last_result", {})
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="pitsim_strategie_optimale.csv"'
    response.write("\ufeff")
    writer = csv.writer(response)
    writer.writerow(["Tour", "Relais", "Gomme", "Tour_Départ", "Tour_Fin"])
    meilleure = result.get("meilleure_strategie_globale", {})
    for relais in meilleure.get("relais", []):
        for tour in range(relais["tour_depart"], relais["tour_fin"] + 1):
            writer.writerow([tour, relais["num_relais"], relais["gomme"],
                             relais["tour_depart"], relais["tour_fin"]])
    return response


def api_initial_data(request):
    """Retourne les écuries, circuits et choix pour alimenter le React frontend."""
    ecuries = list(Ecurie.objects.all().order_by('nom').values('id', 'nom'))
    circuits = list(CircuitCluster.objects.all().order_by('nom_circuit').values('id', 'nom_circuit'))
    gomme_choices = [
        {'value': 'Soft', 'label': '🔴 Soft – Tendres (18–22 tours)'},
        {'value': 'Medium', 'label': '🟡 Medium – Médium (26–32 tours)'},
        {'value': 'Hard', 'label': '⚪ Hard – Dur (35–40 tours)'},
        {'value': 'Inter', 'label': '🟢 Inter – Intermédiaires (20–28 tours)'},
        {'value': 'Wet', 'label': '🔵 Wet – Pluie (25–35 tours)'},
    ]
    agressivite_choices = [
        {'value': 'faible', 'label': '🟢 Faible – Préservation maximale'},
        {'value': 'moyen', 'label': '🟡 Moyen – Équilibré'},
        {'value': 'eleve', 'label': '🔴 Élevé – Attaque maximale'},
    ]
    return JsonResponse({
        "ecuries": ecuries,
        "circuits": circuits,
        "gommes": gomme_choices,
        "agressivite": agressivite_choices
    })


@csrf_exempt
def api_optimize(request):
    """Reçoit une configuration JSON, lance l'optimiseur et retourne les résultats."""
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    ecurie_id = data.get("ecurie")
    circuit_id = data.get("circuit")
    N = int(data.get("nombre_tours", 55))
    t_base = float(data.get("t_base", 90.0))
    meteo_idx = int(data.get("meteo_initiale", 1))
    tour_pluie = data.get("tour_pluie")

    if tour_pluie == 0 or not tour_pluie:
        tour_pluie = None
    else:
        tour_pluie = int(tour_pluie)

    try:
        ecurie = Ecurie.objects.get(pk=ecurie_id)
        circuit = CircuitCluster.objects.get(pk=circuit_id)
    except (Ecurie.DoesNotExist, CircuitCluster.DoesNotExist):
        return JsonResponse({"error": "Écurie ou circuit introuvable"}, status=404)

    meteo_init = {1: "Sec chaud", 2: "Piste humide", 3: "Pluie forte"}.get(meteo_idx, "Sec chaud")
    weather_forecast = _build_weather_forecast(meteo_init, N, tour_pluie)

    try:
        optimizer = RaceOptimizer(ecurie.nom, circuit.nom_circuit, N, t_base)
        result = optimizer.optimize(weather_forecast)
        result = _enrich_result(result)
    except Exception as e:
        import traceback
        return JsonResponse({"status": "error", "message": str(e), "trace": traceback.format_exc()}, status=500)

    chart_series = _build_chart_series(result, N) if result.get("status") == "success" else []

    return JsonResponse({
        "status": "success",
        "result": result,
        "chart_series": chart_series,
        "N": N,
        "ecurie_nom": ecurie.nom,
        "circuit_nom": circuit.nom_circuit,
        "tour_pluie": tour_pluie,
    })

