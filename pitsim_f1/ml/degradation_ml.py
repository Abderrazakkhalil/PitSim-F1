import joblib
import pandas as pd
from pathlib import Path
from typing import Optional

# Chemin absolu/relatif vers le modèle sérialisé
MODEL_PATH = Path(__file__).resolve().parent / "models" / "degradation.pkl"

class DegradationModel:
    """
    Classe singleton pour charger et inférer le modèle de dégradation ML (IA-1).
    Permet de prédire la perte de temps au tour en fonction des paramètres.
    """
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DegradationModel, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Charge le modèle depuis le disque si existant."""
        try:
            if MODEL_PATH.exists():
                self._model = joblib.load(MODEL_PATH)
            else:
                print(f"[Avertissement] Fichier {MODEL_PATH} introuvable. Fallback analytique requis.")
        except Exception as e:
            print(f"[Erreur] Impossible de charger le modèle ML : {e}")

    def predict_degradation(self, n: int, track_temp: float, sconduite: str, ccircuit: str, type_gomme: str) -> float:
        """
        Prédit la perte de temps due à la dégradation (en secondes).

        Args:
            n (int): Nombre de tours depuis le dernier arrêt.
            track_temp (float): Température de la piste en °C.
            sconduite (str): Niveau d'agressivité de conduite ('faible', 'moyen', 'élevé').
            ccircuit (str): Identifiant/Nom du circuit.
            type_gomme (str): Type de gomme ('Soft', 'Medium', 'Hard', 'Inter', 'Wet').

        Returns:
            float: La dégradation en secondes (>= 0).
        """
        if self._model is None:
            # Mode dégradé (fallback sur une équation analytique simple)
            # D'après le cahier des charges, c'est l'équation alpha * gamma * n^delta
            # Ici on renvoie une valeur arbitraire pour l'exemple
            return 0.1 * n
        
        # Préparation du DataFrame pour l'inférence (nécessaire pour le pipeline)
        input_data = pd.DataFrame([{
            'n': n,
            'TrackTemp': track_temp,
            'Sconduite': sconduite,
            'Ccircuit': ccircuit,
            'type__gomme': type_gomme
        }])

        try:
            pred = self._model.predict(input_data)[0]
            # La dégradation ne peut pas être négative
            return max(0.0, float(pred))
        except Exception as e:
            print(f"[Erreur d'inférence ML] {e}")
            return 0.1 * n

# Instance globale à utiliser dans le Moteur de Simulation (F2)
degradation_predictor = DegradationModel()
