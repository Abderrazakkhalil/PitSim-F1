import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from core.models import Ecurie, Pneumatique, CircuitCluster
from race.ml.degradation_ml import predictor
from race.simulation_engine import SimulationEngine
from optimizer.crossover import CrossoverDetector

class RaceOptimizer:
    """
    Moteur F3 : Détermination de la stratégie optimale de course 
    par Programmation Dynamique en O(K * N^2).
    """

    def __init__(self, ecurie_nom: str, circuit_nom: str, N: int = 70, t_base: float = 90.0, beta_essence: float = 0.05):
        self.N = N
        self.K_max = 3
        
        # Initialisation du moteur F2
        self.engine = SimulationEngine(ecurie_nom, circuit_nom, t_base, beta_essence)
        
        # Temps perdu dans les stands (T_pit = T_pitlane + T_immob_ecurie)
        # On suppose que T_pitlane est d'environ 20s (constante métier standard) 
        # et que T_immob vient de l'écurie
        self.t_pit = 20.0 + self.engine.ecurie.T_pit

        # Types de gommes disponibles
        self.gommes_dispos = list(self.engine.gommes.keys())
        
        # Mémorisation des coûts pré-calculés
        # stint_cost[m][n] = (cout_minimal, type_gomme)
        self.stint_cost_cache = {}

    def _precompute_degradation_matrix(self) -> Dict[str, np.ndarray]:
        """
        Optimisation algorithmique cruciale :
        Au lieu d'appeler l'IA pour chaque tour de chaque combinaison de relais 
        (> 12 000 inférences impliquant la création de DataFrames, très lent),
        nous vectorisons la prédiction pour toutes les gommes et tous les n_stint.
        """
        deg_matrix = {gomme: np.zeros(self.N + 1) for gomme in self.gommes_dispos}
        
        # On vérifie si on doit utiliser le mode ML batch ou le fallback
        if predictor._is_model_loaded and predictor._model is not None:
            # Construction d'un DataFrame géant pour l'inférence batch
            rows = []
            for gomme in self.gommes_dispos:
                for n_stint in range(1, self.N + 1):
                    rows.append({
                        'n': n_stint,
                        'TrackTemp': self.engine.circuit.temp_piste_moy,
                        'Sconduite': 'moyen', # fixe pour l'optimisation
                        'Ccircuit': self.engine.circuit.nom_circuit,
                        'type__gomme': gomme,
                        '_gomme_ref': gomme,
                        '_n_ref': n_stint
                    })
                    
            df_batch = pd.DataFrame(rows)
            # Prédiction en une seule passe (ultra rapide)
            try:
                preds = predictor._model.predict(df_batch.drop(columns=['_gomme_ref', '_n_ref']))
                for i, row in df_batch.iterrows():
                    deg_matrix[row['_gomme_ref']][row['_n_ref']] = max(0.0, float(preds[i]))
                return deg_matrix
            except Exception as e:
                print(f"[F3] Erreur d'inférence batch, passage au fallback analytique : {e}")
                
        # Mode Fallback analytique (calcul matriciel direct)
        for gomme in self.gommes_dispos:
            pneu = self.engine.gommes[gomme]
            alpha = pneu.alpha
            gamma = self.engine.ecurie.gamma
            delta = self.engine.ecurie.delta
            
            # Vectorisation NumPy de l'équation : alpha * gamma * n^delta
            n_array = np.arange(1, self.N + 1)
            deg_array = alpha * gamma * np.power(n_array, delta)
            
            # On stocke dans le dictionnaire en commençant à l'index 1
            deg_matrix[gomme][1:] = deg_array
            
        return deg_matrix

    def _precompute_stints(self, weather_forecast: List[str]):
        """
        Calcule la matrice des coûts optimaux pour n'importe quel relais allant
        du tour m+1 au tour n. Complexité = O(G * N^2) mais ultra rapide car O(1) par cellule.
        """
        # Pré-calcul batch de la dégradation
        deg_matrix = self._precompute_degradation_matrix()
        
        # Table pour stocker le coût d'un relais de (m) à (n)
        # stint_cost[m][n] = (min_time, best_gomme)
        self.stint_cost_cache = {}
        
        # Pour accélérer le calcul de t_base - beta*n_total, on pré-calcule le cumul du carburant
        # fuel_gain(n) = beta * n. Cumul_fuel(m, n) = sum(beta * i) = beta * (n*(n+1) - m*(m+1))/2
        # On va le calculer incrémentalement.

        for m in range(self.N):
            self.stint_cost_cache[m] = {}
            
            # Initialiser les accumulateurs pour chaque gomme
            acc_cost_gomme = {g: 0.0 for g in self.gommes_dispos}
            
            for n in range(m + 1, self.N + 1):
                n_total = n
                n_stint = n - m
                meteo = weather_forecast[n - 1]
                
                # Gain carburant pour ce tour
                fuel_gain = self.engine.beta_essence * n_total
                
                best_g = None
                best_cost_for_n = float('inf')
                
                for gomme in self.gommes_dispos:
                    # Pénalité météo
                    penalite = self.engine._calculate_meteo_penalty(gomme, meteo, n_stint)
                    
                    # Dégradation pré-calculée
                    deg = deg_matrix[gomme][n_stint]
                    
                    # Temps du tour
                    t_tour = self.engine.t_base - fuel_gain + deg + penalite
                    
                    # Accumulation du temps pour le relais
                    acc_cost_gomme[gomme] += t_tour
                    
                    # Est-ce que cette gomme respecte la durée de vie maximale ?
                    duree_max = self.engine.gommes[gomme].duree_max_tours
                    if n_stint <= duree_max:
                        if acc_cost_gomme[gomme] < best_cost_for_n:
                            best_cost_for_n = acc_cost_gomme[gomme]
                            best_g = gomme
                            
                self.stint_cost_cache[m][n] = (best_cost_for_n, best_g)

    def optimize(self, weather_forecast: List[str]) -> Dict[str, Any]:
        """
        Exécute la programmation dynamique.
        T[k][n] = min_{m < n} ( T[k-1][m] + T_pit + Cost(m, n) )
        """
        assert len(weather_forecast) == self.N
        
        # 1. Pré-calcul
        self._precompute_stints(weather_forecast)
        
        # 2. Initialisation DP
        # T[k][n] stocke le temps minimal
        T = np.full((self.K_max + 1, self.N + 1), float('inf'))
        # P[k][n] stocke le tour m de l'arrêt précédent pour reconstruire le chemin
        P = np.zeros((self.K_max + 1, self.N + 1), dtype=int)
        
        # Cas de base: 0 arrêt (k=0)
        # Si un pneu peut faire toute la course, on met le coût. Sinon inf.
        for n in range(1, self.N + 1):
            cost, _ = self.stint_cost_cache[0][n]
            T[0][n] = cost
            
        # 3. Récurrence DP
        for k in range(1, self.K_max + 1):
            for n in range(1, self.N + 1):
                # On teste tous les tours d'arrêts m précédents
                for m in range(k, n): # Il faut au moins k tours pour k arrêts
                    cost_stint, _ = self.stint_cost_cache[m][n]
                    if cost_stint == float('inf'):
                        continue
                        
                    candidate_cost = T[k-1][m] + self.t_pit + cost_stint
                    if candidate_cost < T[k][n]:
                        T[k][n] = candidate_cost
                        P[k][n] = m
                        
        # 4. Reconstruction des stratégies et formatage JSON
        result = {
            "status": "success",
            "comparatif_strategies": {},
            "meilleure_strategie_globale": None,
            "crossovers_detectes": [] # Rempli plus tard via module dédié
        }
        
        best_global_time = float('inf')
        best_global_k = -1
        
        # On va évaluer les stratégies à 1, 2 et 3 arrêts
        for k in range(1, self.K_max + 1):
            if T[k][self.N] == float('inf'):
                continue
                
            temps_total = T[k][self.N]
            
            # Reconstruction du chemin (Backtracking)
            relais = []
            curr_n = self.N
            curr_k = k
            
            while curr_k >= 0:
                prev_n = P[curr_k][curr_n] if curr_k > 0 else 0
                _, gomme = self.stint_cost_cache[prev_n][curr_n]
                
                relais.append({
                    "num_relais": curr_k + 1,
                    "tour_depart": int(prev_n + 1),
                    "tour_fin": int(curr_n),
                    "gomme": gomme
                })
                
                curr_n = prev_n
                curr_k -= 1
                
            relais.reverse() # Remettre dans l'ordre chronologique
            
            tours_arret = [r["tour_depart"] - 1 for r in relais if r["tour_depart"] > 1]
            gommes = [r["gomme"] for r in relais]
            
            strat_key = f"{k}_arret{'s' if k > 1 else ''}"
            result["comparatif_strategies"][strat_key] = {
                "temps_total_s": round(temps_total, 2),
                "tours_arret": tours_arret,
                "gommes": gommes
            }
            
            if temps_total < best_global_time:
                best_global_time = temps_total
                best_global_k = k
                result["meilleure_strategie_globale"] = {
                    "nombre_arrets": k,
                    "temps_total_s": round(temps_total, 2),
                    "relais": relais
                }
                
        if result["meilleure_strategie_globale"] is None:
            result["status"] = "error_no_viable_strategy"
        else:
            # 5. Détection des crossovers pour la stratégie optimale
            detector = CrossoverDetector(self.engine)
            result["crossovers_detectes"] = detector.get_all_crossovers(
                weather_forecast, 
                result["meilleure_strategie_globale"]["relais"]
            )
            
        return result
