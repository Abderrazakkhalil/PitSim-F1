import math
import joblib
import pandas as pd
from pathlib import Path
from typing import Optional

# Chemin vers le modèle (en supposant que le modèle est généré dans pitsim_f1/ml/models/degradation.pkl)
# On navigue dans l'arborescence pour pointer vers le dossier ml à la racine du projet
MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "models" / "degradation.pkl"

class DegradationPredictor:
    """
    Classe singleton gérant la prédiction de la dégradation ML avec un 
    mécanisme de fallback robuste sur l'équation analytique v2.0.
    """
    _instance = None
    _model = None
    _is_model_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DegradationPredictor, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Charge le modèle ML sérialisé s'il existe."""
        if MODEL_PATH.exists():
            try:
                self._model = joblib.load(MODEL_PATH)
                self._is_model_loaded = True
            except Exception as e:
                print(f"[IA-1] Erreur de chargement du modèle : {e}. Fallback activé.")
                self._is_model_loaded = False
        else:
            print(f"[IA-1] Fichier {MODEL_PATH} introuvable. Fallback activé.")
            self._is_model_loaded = False

    def predict(self, 
                n: int, 
                track_temp: float, 
                sconduite: str, 
                ccircuit: str, 
                type_gomme: str,
                # Paramètres de fallback pré-chargés depuis l'ORM
                alpha: float,
                gamma: float,
                delta: float) -> float:
        """
        Prédit la perte de temps due à la dégradation.
        
        Args:
            n (int): Tours passés sur la gomme actuelle (stint).
            track_temp (float): Température de la piste.
            sconduite (str): Agressivité ('faible', 'moyen', 'élevé').
            ccircuit (str): Identifiant du circuit.
            type_gomme (str): Composé du pneu ('Soft', 'Medium', etc.).
            alpha, gamma, delta (float): Paramètres analytiques des modèles ORM.
            
        Returns:
            float: Temps perdu (en secondes).
        """
        if n <= 0:
            return 0.0

        # Si le modèle est chargé et prêt, on tente l'inférence
        if self._is_model_loaded:
            try:
                # Création DataFrame single-row pour la pipeline (pandas est optimisé en interne 
                # mais instancier un df par itération peut être lourd. Si on doit simuler
                # de grands batches, une modification pour accepter des arrays serait idéale).
                df_input = pd.DataFrame([{
                    'n': n,
                    'TrackTemp': track_temp,
                    'Sconduite': sconduite,
                    'Ccircuit': ccircuit,
                    'type__gomme': type_gomme
                }])
                pred = self._model.predict(df_input)[0]
                return max(0.0, float(pred))
            except Exception as e:
                # Capture de toute erreur (ex: feature catégorielle inconnue)
                # print(f"[IA-1] Erreur d'inférence, basculement en mode dégradé : {e}")
                pass

        # Mode dégradé (Fallback) - Équation analytique (v2.0)
        # Degradation = alpha_gomme * gamma_ecurie * n ^ delta_ecurie
        try:
            degradation = alpha * gamma * math.pow(n, delta)
            return max(0.0, float(degradation))
        except Exception:
            return 0.0

# Instance unique pour éviter les rechargements inutiles
predictor = DegradationPredictor()
