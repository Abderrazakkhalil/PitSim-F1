import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import fastf1

RESULTS_DIR = Path('clustering/results')
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

def collect_circuit_features() -> pd.DataFrame:
    """
    Simule la collecte des données pour le calendrier.
    En production, on lirait les archives FastF1 (météo, virages, safety car)
    pour chaque événement de l'année.
    """
    # Pour l'exercice, nous générons un dataset factice structuré selon le CdC.
    # Dans un environnement réel, on utiliserait fastf1.get_event_schedule(2025)
    # puis pour chaque event on analyserait telemetry et weather.
    
    circuits_data = [
        {"nom_circuit": "Bahrain", "temp_ambiante_moy": 28.0, "temp_piste_moy": 32.0, "nb_virages_lents": 6, "nb_virages_rapides": 9, "degen_moy": 0.25, "freq_safety_car": 30.0, "proba_pluie": 5.0},
        {"nom_circuit": "Monaco", "temp_ambiante_moy": 23.0, "temp_piste_moy": 45.0, "nb_virages_lents": 12, "nb_virages_rapides": 7, "degen_moy": 0.10, "freq_safety_car": 80.0, "proba_pluie": 15.0},
        {"nom_circuit": "Silverstone", "temp_ambiante_moy": 19.0, "temp_piste_moy": 26.0, "nb_virages_lents": 4, "nb_virages_rapides": 14, "degen_moy": 0.18, "freq_safety_car": 40.0, "proba_pluie": 60.0},
        {"nom_circuit": "Spa-Francorchamps", "temp_ambiante_moy": 16.0, "temp_piste_moy": 22.0, "nb_virages_lents": 5, "nb_virages_rapides": 15, "degen_moy": 0.15, "freq_safety_car": 60.0, "proba_pluie": 75.0},
        {"nom_circuit": "Suzuka", "temp_ambiante_moy": 21.0, "temp_piste_moy": 28.0, "nb_virages_lents": 4, "nb_virages_rapides": 14, "degen_moy": 0.22, "freq_safety_car": 35.0, "proba_pluie": 45.0},
        {"nom_circuit": "Interlagos", "temp_ambiante_moy": 24.0, "temp_piste_moy": 35.0, "nb_virages_lents": 5, "nb_virages_rapides": 10, "degen_moy": 0.20, "freq_safety_car": 55.0, "proba_pluie": 50.0},
        {"nom_circuit": "Singapore", "temp_ambiante_moy": 30.0, "temp_piste_moy": 36.0, "nb_virages_lents": 15, "nb_virages_rapides": 8, "degen_moy": 0.30, "freq_safety_car": 100.0, "proba_pluie": 20.0},
        {"nom_circuit": "Las Vegas", "temp_ambiante_moy": 14.0, "temp_piste_moy": 16.0, "nb_virages_lents": 8, "nb_virages_rapides": 9, "degen_moy": 0.12, "freq_safety_car": 40.0, "proba_pluie": 0.0},
    ]
    return pd.DataFrame(circuits_data)

def assign_semantic_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Assigne un label sémantique compréhensible à chaque cluster en fonction de
    la moyenne de ses caractéristiques (ex: Haute Usure Thermique).
    """
    cluster_means = df.groupby('cluster_id').mean(numeric_only=True)
    labels = {}
    
    for cluster_id, row in cluster_means.iterrows():
        if row['temp_piste_moy'] > 30 and row['degen_moy'] > 0.22:
            labels[cluster_id] = "Haute Usure Thermique"
        elif row['temp_ambiante_moy'] < 20 and row['proba_pluie'] < 30:
            labels[cluster_id] = "Circuit Froid"
        elif row['nb_virages_lents'] >= 10:
            labels[cluster_id] = "Urbain / Forte Traction"
        elif row['proba_pluie'] > 50:
            labels[cluster_id] = "Risque Pluie / Changeant"
        else:
            labels[cluster_id] = "Équilibré / Tout-temps"
            
    df['cluster_label'] = df['cluster_id'].map(labels)
    return df

def run_clustering_pipeline():
    """
    Exécute le pipeline de clustering complet (IA-2).
    Retourne le DataFrame enrichi des clusters.
    """
    df = collect_circuit_features()
    
    # Features pour le clustering
    features = [
        'temp_ambiante_moy', 'temp_piste_moy', 'nb_virages_lents',
        'nb_virages_rapides', 'degen_moy', 'freq_safety_car', 'proba_pluie'
    ]
    
    X = df[features]
    
    # Normalisation
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Recherche du K optimal (entre 3 et 6)
    best_k = 3
    best_score = -1
    best_model = None
    
    # On limite max k à len(df)-1 (pour les très petits datasets de dev)
    max_k = min(6, len(df) - 1) 
    
    if max_k >= 3:
        for k in range(3, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X_scaled)
            score = silhouette_score(X_scaled, labels)
            
            print(f"K={k} -> Silhouette Score = {score:.4f}")
            
            if score > best_score:
                best_score = score
                best_k = k
                best_model = kmeans
                
        print(f"Meilleur K trouvé : {best_k} avec un score de {best_score:.4f}")
    else:
        # Fallback pour tout petit dataset
        best_k = 2
        best_model = KMeans(n_clusters=best_k, random_state=42, n_init=10).fit(X_scaled)

    # Application du meilleur modèle
    df['cluster_id'] = best_model.labels_
    
    # Labellisation
    df = assign_semantic_labels(df)
    
    # Export JSON
    results = df.to_dict(orient='records')
    json_path = RESULTS_DIR / 'circuit_clusters.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
        
    print(f"Résultats de clustering sauvegardés dans : {json_path}")
    return df

if __name__ == "__main__":
    run_clustering_pipeline()
