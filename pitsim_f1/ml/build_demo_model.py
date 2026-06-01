"""Script minimal pour générer un modèle de démonstration `ml/models/degradation.pkl`.

Ce script crée un petit dataset synthétique, entraîne un pipeline simple
et sauvegarde le modèle via joblib. Utile pour que `race.ml.degradation_ml`
charge un modèle lors des tests locaux sans collecte FastF1.
"""
import joblib
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def make_synthetic(n=500):
    rng = np.random.RandomState(42)
    df = pd.DataFrame({
        'n': rng.randint(1, 40, size=n),
        'TrackTemp': rng.uniform(15, 45, size=n),
        'Sconduite': rng.choice(['faible', 'moyen', 'eleve'], size=n),
        'Ccircuit': rng.choice(['Bahrain', 'Monaco', 'Silverstone'], size=n),
        'type__gomme': rng.choice(['Soft', 'Medium', 'Hard', 'Inter', 'Wet'], size=n),
    })

    # Target: simple function with noise
    df['Cible'] = (
        0.02 * (df['n'] ** 1.05)
        + 0.001 * (df['TrackTemp'] - 25.0)
        + df['type__gomme'].map({'Soft': 0.0, 'Medium': 0.2, 'Hard': 0.4, 'Inter': 0.3, 'Wet': 0.6}).values
        + rng.normal(0, 0.05, size=n)
    )
    return df


def build_and_save(path: Path):
    df = make_synthetic(600)
    X = df[['n', 'TrackTemp', 'Sconduite', 'Ccircuit', 'type__gomme']]
    y = df['Cible']

    numeric = ['n', 'TrackTemp']
    categorical = ['Sconduite', 'Ccircuit', 'type__gomme']

    pre = ColumnTransformer([
        ('num', StandardScaler(), numeric),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical)
    ])

    model = Pipeline([('pre', pre), ('rf', RandomForestRegressor(n_estimators=50, random_state=42))])
    model.fit(X, y)

    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)
    print(f"Modèle demo sauvegardé dans : {path}")


if __name__ == '__main__':
    out = Path(__file__).resolve().parent.parent / 'ml' / 'models' / 'degradation.pkl'
    build_and_save(out)
