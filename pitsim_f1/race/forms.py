from django import forms
from core.models import Ecurie, CircuitCluster, Pneumatique


class RaceConfigForm(forms.Form):
    """
    Formulaire de configuration de la course (Module F1).
    Alimente les listes déroulantes depuis l'ORM.
    """

    # --- Choix de l'Écurie ---
    ecurie = forms.ModelChoiceField(
        queryset=Ecurie.objects.all().order_by('nom'),
        empty_label="-- Sélectionnez une écurie --",
        label="Écurie",
        widget=forms.Select(attrs={
            'id': 'id_ecurie',
            'class': 'form-select',
            'hx-get': '/api/ecurie-details/',
            'hx-target': '#ecurie-details-panel',
            'hx-trigger': 'change',
        })
    )

    # --- Choix du Circuit ---
    circuit = forms.ModelChoiceField(
        queryset=CircuitCluster.objects.all().order_by('nom_circuit'),
        empty_label="-- Sélectionnez un circuit --",
        label="Circuit",
        widget=forms.Select(attrs={
            'id': 'id_circuit',
            'class': 'form-select',
            'hx-get': '/api/circuit-details/',
            'hx-target': '#circuit-details-panel',
            'hx-trigger': 'change',
        })
    )

    # --- Composé de départ ---
    GOMME_CHOICES = [
        ('Soft', '🔴 Soft – Tendres (18–22 tours)'),
        ('Medium', '🟡 Medium – Médium (26–32 tours)'),
        ('Hard', '⚪ Hard – Dur (35–40 tours)'),
        ('Inter', '🟢 Inter – Intermédiaires (20–28 tours)'),
        ('Wet', '🔵 Wet – Pluie (25–35 tours)'),
    ]
    gomme_depart = forms.ChoiceField(
        choices=GOMME_CHOICES,
        label="Composé de départ",
        initial='Medium',
        widget=forms.Select(attrs={'class': 'form-select', 'id': 'id_gomme_depart'})
    )

    # --- Météo initiale (Slider 1 à 3) ---
    METEO_CHOICES = {
        1: 'Sec chaud',
        2: 'Piste humide',
        3: 'Pluie forte',
    }
    meteo_initiale = forms.IntegerField(
        label="Météo Initiale",
        initial=1,
        widget=forms.NumberInput(attrs={
            'type': 'range',
            'min': '1', 'max': '3', 'step': '1',
            'class': 'form-range custom-slider',
            'id': 'id_meteo_initiale',
            'oninput': 'updateMeteoLabel(this.value)'
        })
    )

    # --- Injection d'événement pluie ---
    tour_pluie = forms.IntegerField(
        required=False,
        initial=0,
        label="Injection Pluie",
        widget=forms.NumberInput(attrs={
            'type': 'range',
            'min': '0', 'max': '78', 'step': '1',
            'class': 'form-range custom-slider',
            'id': 'id_tour_pluie',
            'oninput': 'document.getElementById("tour_pluie_val").innerText = this.value == 0 ? "Aucune" : "Tour " + this.value;'
        })
    )

    # --- Niveau d'agressivité ---
    AGRESSIVITE_CHOICES = [
        ('faible', '🟢 Faible – Préservation maximale'),
        ('moyen', '🟡 Moyen – Équilibré'),
        ('eleve', '🔴 Élevé – Attaque maximale'),
    ]
    agressivite = forms.ChoiceField(
        choices=AGRESSIVITE_CHOICES,
        label="Agressivité de conduite",
        initial='moyen',
        widget=forms.RadioSelect(attrs={'class': 'agressivite-radio', 'id': 'id_agressivite'})
    )

    # --- Nombre de tours ---
    # `nombre_tours` is computed server-side from circuit metadata and therefore
    # intentionally removed from the user-editable form.

    # --- Temps de base (t_base) ---
    t_base = forms.FloatField(
        min_value=60.0,
        max_value=150.0,
        initial=90.0,
        label="Temps de référence au tour (secondes)",
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'id': 'id_t_base',
            'step': '0.1',
        })
    )
