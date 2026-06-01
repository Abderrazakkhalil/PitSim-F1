# PitSim-F1

Projet d'optimisation de stratégie de course F1 (pit-stop) combinant :
- Programmation dynamique (optimiseur combinatoire)
- Machine Learning (prédiction de dégradation pneus)
- Clustering des circuits (regroupement sémantique)
- Interface web découpée (React frontend + Django backend)

## Objectif

Fournir un simulateur/optimiseur permettant de déterminer la stratégie de pit-stop optimale (nombre d'arrêts, composition des relais, tours d'arrêt) pour une écurie et un circuit donnés, en tenant compte de la dégradation pneumatique (IA), des conditions météo et des contraintes métier.

## Architecture et fonctionnement

- Frontend (dossier `frontend/`) : application React (Vite) qui fournit un formulaire de configuration et affiche les résultats (graphique, tableau, export CSV). Le frontend appelle les APIs REST exposées par le backend (`/api/initial-data/`, `/api/ecurie-details/`, `/api/circuit-details/`, `/api/optimize/`).
- Backend (dossier `pitsim_f1/`) : projet Django découpé en apps métier : `core`, `race`, `optimizer`, `ml`, `clustering`.
  - Le backend propose une vue unifiée `RaceUnifiedView` (template Django) et plusieurs endpoints JSON pour piloter l'optimisation depuis le frontend.
- Moteurs principaux :
  - `race.simulation_engine.SimulationEngine` — moteur tour-à-tour qui utilise le prédicteur ML comme aide (fallback analytique disponible).
  - `optimizer.dynamic_prog.RaceOptimizer` — implémentation de la programmation dynamique (O(K * N^2)) avec pré-calcul vectorisé des dégradations.
  - `clustering.circuit_clustering.run_clustering_pipeline` — pipeline KMeans pour labelliser les circuits selon des métriques thermiques/virages/météo.
  - `ml.train_model` — pipeline d'entraînement (RandomForest/XGBoost) et export du modèle sous `ml/models/degradation.pkl`.

## Modules / fichiers clés (vue rapide)

- Frontend
  - `frontend/package.json` — dépendances (React, Vite, Chart.js).
  - `frontend/src/App.jsx` — logique principale, appelle `/api/optimize/`.
  - `frontend/src/components/RaceConfigForm.jsx` — formulaire, appelle `/api/initial-data/` et endpoints `ecurie-details`/`circuit-details`.
  - `frontend/src/components/DashboardResults.jsx` — affichage des résultats et export CSV.
  - `frontend/src/components/TelemetryChart.jsx` — rendu Chart.js des séries temporelles.

- Backend (Django)
  - `pitsim_f1/manage.py` — point d'entrée Django.
  - `pitsim_f1/pitsim_f1/settings.py` — configuration (SQLite dev, CORS autorisé, apps installées).
  - `pitsim_f1/core/models.py` — modèles métier : `Ecurie`, `CircuitCluster`, `Pneumatique`.
  - `pitsim_f1/race/views.py` — vues HTML + endpoints JSON (`api_initial_data`, `api_ecurie_details`, `api_circuit_details`, `api_optimize`, `export_csv`).
  - `pitsim_f1/race/simulation_engine.py` — moteur de simulation (utilise `race.ml.degradation_ml.predictor`).
  - `pitsim_f1/optimizer/dynamic_prog.py` — optimiseur DP principal (pré-calcul matriciel, reconstruction stratégie).
  - `pitsim_f1/optimizer/crossover.py` — détection des crossovers météo/thermiques.
  - `pitsim_f1/clustering/circuit_clustering.py` — pipeline KMeans et export JSON (`clustering/results/circuit_clusters.json` existe).
  - `pitsim_f1/ml/train_model.py` — collecte via FastF1 (si disponible) et entraînement des modèles ML.
  - `pitsim_f1/race/ml/degradation_ml.py` — wrapper prédicteur ML + fallback analytique (cherche `ml/models/degradation.pkl`).

## Flux de données (résumé)

1. L'utilisateur saisit une configuration dans l'UI React (`RaceConfigForm`).
2. Le frontend appelle `/api/initial-data/` pour remplir sélecteurs (écuries, circuits, gommes, agressivité).
3. À la soumission, le frontend envoie une requête POST JSON vers `/api/optimize/`.
4. `api_optimize` construit une prévision météo simplifiée, instancie `RaceOptimizer` (qui crée un `SimulationEngine`), puis lance `optimize(weather_forecast)`.
5. `RaceOptimizer` pré-calcul les matrices de dégradation (soit via le modèle ML batch, soit via la formule analytique), calcule les coûts par relais, exécute la DP, reconstruit la stratégie optimale et appelle `CrossoverDetector`.
6. Le backend renvoie JSON enrichi (`result`, `chart_series`) utilisé par le frontend pour afficher graphiques et panneaux.

## Technologies & dépendances

- Frontend : React 18, Vite, Chart.js. (Voir `frontend/package.json`)
- Backend : Python 3.x, Django 4.2, django-cors-headers.
- Data & ML : numpy, pandas, scikit-learn, xgboost, joblib, fastf1 (optionnel pour collecte réelle).
- DB dev : SQLite (config par défaut). Production prévue : PostgreSQL (`psycopg2-binary` est listé).

Fichier des dépendances Python : `pitsim_f1/requirements.txt`.

## Installation & exécution (déduction depuis le projet)

1. Créer un environnement Python et installer les dépendances :

```bash
python -m venv .venv
source .venv/bin/activate   # ou `.venv\\Scripts\\activate` sous Windows
pip install -r pitsim_f1/requirements.txt
```

2. Initialiser la DB (si nécessaire) et charger des données minimales :

```bash
cd pitsim_f1
python manage.py migrate
# (optionnel) python manage.py loaddata <fixtures> ou utiliser les commandes de management si fournies
```

3. Lancer le backend Django (dev):

```bash
python manage.py runserver
```

4. Démarrer le frontend (depuis `frontend/`) :

```bash
cd frontend
npm install
npm run dev
```

Le frontend attend le backend sur `http://localhost:8000` (constante `API_BASE` dans `App.jsx`).

## Exemples d'utilisation

- Depuis l'UI React : choisir une écurie, un circuit, régler météo/nombre de tours, cliquer sur "Calculer Stratégie Optimale" — le frontend affichera les résultats et proposera un export CSV.
- API : envoyer un POST JSON à `/api/optimize/` avec les clefs attendues (`ecurie`, `circuit`, `nombre_tours`, `meteo_initiale`, `tour_pluie`, `t_base`).

## État d'implémentation — Ce qui est fait / partiel / manquant

- Déjà implémenté et fonctionnel (vérifiable dans le code) :
  - Frontend React complet pour configuration et affichage (`frontend/src/*`).
  - Endpoints backend principaux et liaison frontend ↔ backend (`race/views.py`).
  - Moteur de simulation tour-à-tour (`race/simulation_engine.py`) avec intégration du prédicteur et fallback.
  - Optimiseur par programmation dynamique (`optimizer/dynamic_prog.py`) avec vectorisation et reconstruction de stratégie.
  - Pipeline de clustering fonctionnel (`clustering/circuit_clustering.py`) et export JSON (`clustering/results/circuit_clusters.json` existe).
  - Pipeline d'entraînement ML (`ml/train_model.py`) qui écrit `ml/models/degradation.pkl` quand exécuté avec des données.

- Partiellement implémenté (nécessite données ou configuration) :
  - `race.ml.degradation_ml.DegradationPredictor` : wrapper prêt, mais dépend d'un modèle pré-entraîné `ml/models/degradation.pkl`. Si absent, le code bascule sur le fallback analytique (implémenté).
  - `ml/train_model.py` : collecte reliant à `fastf1` — la collecte réelle dépend de l'accès aux archives FastF1 et au cache (le script contient beaucoup de garde-fous et de fallback mock).

- Prévu mais absent / éléments à terminer ou vérifier :
  - Données initiales en base : le projet s'appuie sur enregistrements `Ecurie`, `CircuitCluster`, `Pneumatique` en base SQLite; il n'y a pas de fixtures visibles fournies pour un peupler automatiquement la DB (sauf éventuels scripts de management non lus). Hypothèse : l'équipe doit fournir des fixtures ou `init_data` management commands.
  - Modèle ML sérialisé `ml/models/degradation.pkl` : souvent manquant après clonage. Sans ce fichier, l'optimiseur fonctionnera mais en mode analytique fallback.
  - Tests automatisés : il y a une structure `race/tests/` mais couverture et fixtures à vérifier.

## Incohérences / points d'attention identifiés

- `pitsim_f1/pitsim_f1/settings.py` expose `DEBUG = True` et `ALLOWED_HOSTS = ["*"]` — pratiques OK pour dev, à durcir pour prod.
- Le frontend suppose `API_BASE = 'http://localhost:8000'` en dur ; il faudra rendre cette variable configurable en production.
- `ml/train_model.py` et `clustering/circuit_clustering.py` s'appuient sur FastF1 : sans cache local (fastf1_cache/) ou accès réseau, ils créent ou utilisent des données mock — comportement documenté dans les scripts mais nécessite validation sur des données réelles.
- Aucun `README` existant pour expliquer comment peupler la base (fixtures) ou lancer des commandes management custom (si présents). Hypothèse : la commande `core/management/commands/init_data.py` pourrait exister (à vérifier) — si elle existe, elle devrait être documentée.

## Recommandations & prochaines étapes

1. Ajouter des fixtures/commande de peuplement pour `Ecurie`, `CircuitCluster`, `Pneumatique` afin de permettre des tests rapides en local.
2. Fournir (ou générer) `ml/models/degradation.pkl` via `python pitsim_f1/ml/train_model.py` ou inclure un modèle de démonstration pour tests rapides.
3. Rendre `API_BASE` configurable (fichier `.env` ou variable d'environnement injectée durant le build Vite).
4. Ajouter un petit script `Makefile` ou `scripts/bootstrap.sh` pour automatiser l'installation dev (venv, pip install, migrate, npm install).

---

Si vous voulez, j'écris :
- des fixtures d'exemple pour la DB (Ecurie/Circuit/Pneumatique),
- un script `bootstrap` (Windows + Unix) pour démarrer rapidement,
- ou j'exécute `ml/train_model.py` localement (si vous autorisez l'installation des dépendances). Dites-moi quelle action prioriser.
