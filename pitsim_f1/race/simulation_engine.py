from typing import Dict, Any, List
from core.models import Ecurie, Pneumatique, CircuitCluster
from race.ml.degradation_ml import predictor

class SimulationEngine:
    """
    Moteur de simulation tour par tour (F2).
    Intègre le Machine Learning, l'allègement de la monoplace, et 
    les pénalités météorologiques dynamiques.
    """
    
    def __init__(self, 
                 ecurie_nom: str, 
                 circuit_nom: str, 
                 t_base: float, 
                 beta_essence: float = 0.05):
        """
        Initialise le moteur en pré-chargeant les variables de la BDD 
        pour garantir un temps d'exécution minimal (<= 5ms/tour).
        
        Args:
            ecurie_nom: Nom de l'écurie.
            circuit_nom: Nom du circuit.
            t_base: Temps de référence au tour (sans dégradation).
            beta_essence: Facteur d'allègement carburant (gain de temps par tour).
        """
        self.t_base = t_base
        self.beta_essence = beta_essence
        
        # Pré-chargement Ecurie
        try:
            self.ecurie = Ecurie.objects.get(nom=ecurie_nom)
        except Ecurie.DoesNotExist:
            raise ValueError(f"L'écurie '{ecurie_nom}' n'existe pas en base.")
            
        # Pré-chargement Circuit
        try:
            self.circuit = CircuitCluster.objects.get(nom_circuit=circuit_nom)
        except CircuitCluster.DoesNotExist:
            raise ValueError(f"Le circuit '{circuit_nom}' n'existe pas en base.")
            
        # Pré-chargement des gommes dans un dictionnaire rapide
        self.gommes: Dict[str, Pneumatique] = {}
        for pneu in Pneumatique.objects.all():
            self.gommes[pneu.type_gomme] = pneu
            
    def _calculate_meteo_penalty(self, type_gomme: str, meteo_actuelle: str, n_stint: int) -> float:
        """
        Calcule la pénalité de temps due aux conditions météorologiques (Équation 4).
        
        Args:
            type_gomme: Type de pneu utilisé.
            meteo_actuelle: Conditions actuelles ('Sec chaud', 'Pluie forte', etc.).
            n_stint: Nombre de tours passés sur ce relais.
            
        Returns:
            Pénalité en secondes.
        """
        pneu = self.gommes.get(type_gomme)
        if not pneu:
            return 0.0
            
        # Si la condition de piste matche exactement (ou est compatible) avec le pneu
        # On pourrait avoir une logique plus complexe pour "Sec chaud" vs "Sec froid"
        # Pour simplifier, si le mot clé de condition du pneu est dans la météo, c'est adapté
        condition_principale = pneu.conditions.split(' ')[0].lower() # 'Sec', 'Piste', 'Pluie'
        
        if condition_principale in meteo_actuelle.lower():
            return 0.0
            
        # Pénalités réalistes pour mauvaises gommes
        est_piste_seche = "sec" in meteo_actuelle.lower() or "chaud" in meteo_actuelle.lower()
        est_piste_pluie = "pluie" in meteo_actuelle.lower() or "humide" in meteo_actuelle.lower()
        
        est_pneu_pluie = "pluie" in condition_principale or "inter" in condition_principale
        est_pneu_sec = not est_pneu_pluie
        
        if est_piste_seche and est_pneu_pluie:
            # Pneus pluie sur le sec : surchauffe massive, très lent
            return 15.0 + (1.0 * n_stint)
            
        if est_piste_pluie and est_pneu_sec:
            # Slicks sous la pluie : glissade, extrêmement lent
            return 25.0 + (2.0 * n_stint)
            
        # Fallback pour d'autres cas (ex: pneu Intermédiaire sous Pluie forte)
        lambda_inadapte = pneu.penalite_hors_cond
        mu = 0.5 # Facteur d'aggravation plus fort
        
        return lambda_inadapte * (1 + (mu * n_stint))

    def simulate_lap(self, 
                     n_total: int, 
                     n_stint: int, 
                     type_gomme: str, 
                     meteo_actuelle: str, 
                     sconduite: str = 'moyen') -> float:
        """
        Simule le temps d'un seul tour.
        Équation: t(n) = t_base - beta_essence * n_total + f_ML(inputs) + delta_t_meteo(n_stint)
        """
        # 1. Gain lié à l'allègement carburant
        gain_essence = self.beta_essence * n_total
        
        # 2. Pénalité météorologique
        penalite_meteo = self._calculate_meteo_penalty(type_gomme, meteo_actuelle, n_stint)
        
        # 3. Prédiction de la dégradation ML (ou fallback analytique)
        pneu = self.gommes.get(type_gomme)
        alpha = pneu.alpha if pneu else 0.05
        
        degradation = predictor.predict(
            n=n_stint,
            track_temp=self.circuit.temp_piste_moy,
            sconduite=sconduite,
            ccircuit=self.circuit.nom_circuit,
            type_gomme=type_gomme,
            alpha=alpha,
            gamma=self.ecurie.gamma,
            delta=self.ecurie.delta
        )
        
        # 4. Assemblage final
        temps_tour = self.t_base - gain_essence + degradation + penalite_meteo
        return temps_tour
        
    def simulate_stint(self, 
                       n_tours: int, 
                       type_gomme: str, 
                       meteo: str, 
                       tour_depart: int = 1) -> List[float]:
        """
        Simule un relais complet et retourne la liste des temps au tour.
        """
        temps_relais = []
        for i in range(n_tours):
            n_total = tour_depart + i
            n_stint = i + 1
            t_tour = self.simulate_lap(n_total, n_stint, type_gomme, meteo)
            temps_relais.append(t_tour)
        return temps_relais
