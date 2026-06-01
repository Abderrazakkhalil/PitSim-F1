import time
import pytest
from core.models import Ecurie, CircuitCluster, Pneumatique
from race.ml.degradation_ml import predictor
from race.simulation_engine import SimulationEngine

@pytest.fixture
def setup_data():
    """Prépare les données de test dans l'ORM en mémoire."""
    Ecurie.objects.create(nom="Test Ecurie", gamma=1.0, T_pit=2.0, delta=1.5, profil="Neutre", caracteristique="N/A")
    CircuitCluster.objects.create(nom_circuit="Test Circuit", temp_ambiante_moy=25.0, temp_piste_moy=30.0, 
                                  nb_virages_lents=5, nb_virages_rapides=5, degen_moy=0.2, 
                                  freq_safety_car=10.0, proba_pluie=0.0, cluster_label="Neutre")
    Pneumatique.objects.create(type_gomme="Soft", alpha=0.1, duree_max_tours=20, conditions="Sec chaud", penalite_hors_cond=7.0, usage="Test")
    Pneumatique.objects.create(type_gomme="Wet", alpha=0.05, duree_max_tours=40, conditions="Pluie forte", penalite_hors_cond=8.0, usage="Test")

@pytest.mark.django_db
def test_fallback_mode(setup_data):
    """
    Simule l'absence du modèle ML (fallback) et vérifie que 
    la dégradation respecte l'équation analytique : alpha * gamma * n^delta
    """
    # Forcer le mode dégradé
    predictor._is_model_loaded = False
    predictor._model = None
    
    engine = SimulationEngine(ecurie_nom="Test Ecurie", circuit_nom="Test Circuit", t_base=90.0)
    
    # Validation du calcul pur
    # Pour n=2, alpha=0.1, gamma=1.0, delta=1.5
    # Deg = 0.1 * 1.0 * (2^1.5) = 0.1 * 2.828 = 0.2828
    tour1 = engine.simulate_lap(n_total=1, n_stint=2, type_gomme="Soft", meteo_actuelle="Sec")
    
    # Sans météo pénalité (car "Sec" est dans "Sec chaud")
    # t_tour = t_base - beta_essence*1 + deg
    # t_tour = 90.0 - 0.05*1 + 0.2828 = 90.2328
    assert round(tour1, 2) == 90.23

@pytest.mark.django_db
def test_meteo_penalty(setup_data):
    """Valide qu'un pneu Soft sous la pluie prend bien la pénalité cumulée."""
    engine = SimulationEngine(ecurie_nom="Test Ecurie", circuit_nom="Test Circuit", t_base=90.0)
    
    # Pénalité: lambda=7.0, mu=0.1. Pour n_stint=1 -> 7.0 * (1 + 0.1) = 7.7
    # Pour n_stint=2 -> 7.0 * (1 + 0.2) = 8.4
    tour_pneu_wet = engine.simulate_lap(n_total=1, n_stint=1, type_gomme="Wet", meteo_actuelle="Pluie forte")
    tour_pneu_soft = engine.simulate_lap(n_total=1, n_stint=1, type_gomme="Soft", meteo_actuelle="Pluie forte")
    
    # Le pneu Soft devrait être beaucoup plus lent (pénalité +7.7s appliquée)
    assert tour_pneu_soft > tour_pneu_wet + 7.0

@pytest.mark.django_db
def test_performance_inference(setup_data):
    """
    Chronomètre le temps d'inférence/simulation unitaire pour 
    valider l'exigence des <= 5 ms par tour.
    """
    engine = SimulationEngine(ecurie_nom="Test Ecurie", circuit_nom="Test Circuit", t_base=90.0)
    
    start = time.perf_counter()
    engine.simulate_lap(n_total=10, n_stint=5, type_gomme="Soft", meteo_actuelle="Sec chaud")
    end = time.perf_counter()
    
    duree_ms = (end - start) * 1000
    
    # On autorise un léger overhead dans les tests, mais la cible métier est <= 5.0
    # On met l'assert à 5.0ms (si l'env local le permet, sinon ajuster)
    assert duree_ms <= 5.0, f"Performance non respectée: {duree_ms:.2f} ms > 5.0 ms"
