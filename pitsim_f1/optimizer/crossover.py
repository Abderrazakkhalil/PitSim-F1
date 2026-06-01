from typing import List, Dict, Any
from race.simulation_engine import SimulationEngine

class CrossoverDetector:
    """
    Détecteur d'opportunités stratégiques (Crossover).
    Analyse dynamiquement les dégradations thermiques et les changements 
    météorologiques pour identifier la fenêtre de pit-stop idéale.
    """

    def __init__(self, engine: SimulationEngine):
        self.engine = engine

    def detect_weather_crossovers(self, weather_forecast: List[str]) -> List[Dict[str, Any]]:
        """
        Analyse les transitions météorologiques.
        Retourne la liste des tours où la piste change radicalement d'état.
        """
        crossovers = []
        for i in range(1, len(weather_forecast)):
            meteo_prev = weather_forecast[i - 1].lower()
            meteo_curr = weather_forecast[i].lower()
            
            # Détection d'un changement d'état majeur (ex: sec -> pluie)
            if "sec" in meteo_prev and "pluie" in meteo_curr:
                crossovers.append({
                    "tour": i + 1,
                    "raison": "Transition Météo : Piste Sèche vers Pluie (Risque d'aquaplaning)"
                })
            elif "pluie" in meteo_prev and "sec" in meteo_curr:
                crossovers.append({
                    "tour": i + 1,
                    "raison": "Transition Météo : Piste Séchante (Opportunité Slicks)"
                })
                
        return crossovers

    def detect_thermal_crossover(self, 
                                 gomme_actuelle: str, 
                                 gomme_cible: str, 
                                 tour_actuel: int, 
                                 tours_sur_gomme: int, 
                                 meteo: str) -> bool:
        """
        Vérifie s'il y a un crossover thermique au tour donné.
        Un crossover thermique se produit lorsque le temps au tour avec 
        la gomme actuelle dégradée devient supérieur au temps au tour avec 
        la gomme cible (neuve), y compris si on amortit mentalement la perte.
        """
        # Temps au tour si on reste sur la gomme actuelle (dégradée)
        t_actuel = self.engine.simulate_lap(
            n_total=tour_actuel, 
            n_stint=tours_sur_gomme, 
            type_gomme=gomme_actuelle, 
            meteo_actuelle=meteo
        )
        
        # Temps au tour immédiat avec la nouvelle gomme cible (n_stint = 1)
        t_cible = self.engine.simulate_lap(
            n_total=tour_actuel, 
            n_stint=1, 
            type_gomme=gomme_cible, 
            meteo_actuelle=meteo
        )
        
        # En Formule 1, le crossover pur est l'instant où t_actuel > t_cible.
        # Toutefois, pour que l'arrêt soit "rentable", il faut que l'accumulation 
        # du delta de temps sur les tours restants compense le T_pit.
        # Ici, la logique de détection stricte se limite au croisement des courbes.
        
        return t_actuel > t_cible

    def get_all_crossovers(self, 
                           weather_forecast: List[str], 
                           strategie_relais: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        S'intègre avec les résultats de l'optimiseur pour générer 
        des descriptions humaines des crossovers détectés.
        """
        crossovers = self.detect_weather_crossovers(weather_forecast)
        
        # Ajout des crossovers thermiques basés sur la stratégie optimale fournie
        for i in range(len(strategie_relais) - 1):
            relais_actuel = strategie_relais[i]
            relais_suivant = strategie_relais[i + 1]
            
            tour_arret = relais_suivant["tour_depart"] - 1
            gomme_sortante = relais_actuel["gomme"]
            gomme_entrante = relais_suivant["gomme"]
            
            # On vérifie si ce tour d'arrêt correspondait à un croisement thermique
            # ou simplement à l'expiration de la durée de vie du pneu.
            tours_usure = tour_arret - relais_actuel["tour_depart"] + 1
            meteo = weather_forecast[tour_arret - 1]
            
            is_thermal = self.detect_thermal_crossover(gomme_sortante, gomme_entrante, tour_arret, tours_usure, meteo)
            
            duree_max = self.engine.gommes[gomme_sortante].duree_max_tours
            
            if tours_usure >= duree_max:
                raison = f"Fin de vie maximale atteinte pour la gomme {gomme_sortante}"
            elif is_thermal:
                raison = f"Dégradation thermique Gomme {gomme_sortante} (Croisement des temps avec {gomme_entrante})"
            else:
                raison = f"Opportunité stratégique globale : bascule vers {gomme_entrante}"
                
            # Vérifier s'il n'y a pas déjà un événement météo à ce tour
            if not any(c["tour"] == tour_arret for c in crossovers):
                crossovers.append({
                    "tour": tour_arret,
                    "raison": raison
                })
                
        # Tri chronologique
        return sorted(crossovers, key=lambda x: x["tour"])
