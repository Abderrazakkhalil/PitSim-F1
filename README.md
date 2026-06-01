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

**PitSim‑F1 — README concis et complet**

Objectif
 - PitSim‑F1 est un simulateur hybride destiné à produire des stratégies de course réalistes en Formule 1. Il combine :
   - un module de Machine Learning pour prédire la dégradation pneumatique, 
   - un moteur de simulation tour‑à‑tour qui assemble fuel, météo et dégradation,
   - un optimiseur (programmation dynamique) qui décide les arrêts et gommes,
   - un pipeline de clustering offline pour labelliser les circuits.

Pourquoi ce projet existe
 - En stratégie F1, la décision optimale (où s'arrêter, quelles gommes) dépend d'effets physiques, de données historiques et d'un problème combinatoire. PitSim‑F1 donne une réponse reproductible et traçable en agrégeant apprentissage statistique, simulation et optimisation.

Principes d'utilisation (flux en une lecture)
 - L'utilisateur sélectionne une écurie et un circuit dans l'interface.
 - Le backend calcule le nombre officiel de tours à partir des métadonnées du circuit (voir section suivante).
 - Le serveur construit une prévision météo simplifiée, pré‑calcule la matrice de dégradation (ML ou fallback analytique),
   calcule les coûts des relais, exécute la programmation dynamique et renvoie la stratégie optimale (arrêts, gommes, temps estimés).

Calcul du nombre officiel de tours
 - Règle simple et conforme : la distance cible d'une course est ~305 km, sauf Monaco (~260 km). Le Backend expose cette logique de manière centralisée dans le modèle `CircuitCluster` (propriété `official_laps`).
 - Formule utilisée : si `length_km` est disponible :

    official_laps = ceil(target_race_distance_km / length_km)

 - Le front-end affiche `official_laps` fourni par l'API et ne propose plus de champ libre pour `nombre_tours`. L'API accepte toutefois un override optionnel pour compatibilité tests.

Principaux fichiers et où regarder
 - Modèles métier : [pitsim_f1/core/models.py](pitsim_f1/core/models.py)
 - Vues / API : [pitsim_f1/race/views.py](pitsim_f1/race/views.py)
 - Moteur de simulation : [pitsim_f1/race/simulation_engine.py](pitsim_f1/race/simulation_engine.py)
 - Optimiseur (DP) : [pitsim_f1/optimizer/dynamic_prog.py](pitsim_f1/optimizer/dynamic_prog.py)
 - Prédicteur dégradation (ML) : [pitsim_f1/race/ml/degradation_ml.py](pitsim_f1/race/ml/degradation_ml.py)
 - Pipeline de clustering (offline) : [pitsim_f1/clustering/circuit_clustering.py](pitsim_f1/clustering/circuit_clustering.py)
 - Frontend formulaire : [frontend/src/components/RaceConfigForm.jsx](frontend/src/components/RaceConfigForm.jsx)

Composants et rôles (en langage métier, lisible)
 - Clustering (offline) : regroupe les circuits selon leurs caractéristiques (température, usure, virages). Cela aide à interpréter rapidement un circuit et peut servir plus tard comme feature pour l'IA.
 - Machine Learning : prédit la perte de performance (s/tour) liée à l'usure des pneus, en tenant compte du tour sur le relais, température et type de gomme. Fournit une fonction pragmatique : entrée = (n, temp, circuit, gomme) → sortie = dégradation (s).
 - Simulation : combine la prédiction ML (ou le modèle analytique de secours) avec l'effet carburant et les pénalités météo pour produire des temps au tour réalistes par relais.
 - Optimisation : résout le problème combinatoire global (qui minimise le temps total ?) en testant les partitions de la course en relais et en choisissant gommes + arrêts via programmation dynamique.

Pourquoi ces choix sont raisonnables
 - L'approche hybride sépare les responsabilités : ML capture les patterns locaux et non linéaires; la simulation assemble la physique et l'ordonnancement temporel; la DP garantit une stratégie globale optimale sous contraintes (durée maxi des gommes, pit time). Le clustering apporte lisibilité et stabilité statistique en grouping offline.

Données — ce qui entre et sort à chaque étape (lecture unique)
 - Entrée utilisateur : `ecurie_id`, `circuit_id`, `t_base`, `meteo_initiale`, `tour_pluie` (optionnel).
 - Backend charge : paramètres d'écurie (`Ecurie`), caractéristiques de circuit (`CircuitCluster`), définitions pneus (`Pneumatique`).
 - ML reçoit : `n (tour sur stint)`, `TrackTemp`, `Sconduite`, `Ccircuit`, `type__gomme` → produit `degradation (s)`.
 - Simulation reçoit : `t_base`, `beta_essence`, `degradation`, `penalite_meteo` → produit `t_tour` pour chaque tour.
 - Optimiseur reçoit : matrice des coûts relais (m→n) → produit la stratégie optimale (arrêts, gommes, temps total) et séries pour affichage.

Exécution locale — commandes rapides
 - Installer dépendances Python :

```bash
pip install -r pitsim_f1/requirements.txt
```

 - Générer et appliquer migrations, charger fixtures :

```bash
python pitsim_f1/manage.py makemigrations core
python pitsim_f1/manage.py migrate
python pitsim_f1/manage.py loaddata core/fixtures/initial_data.json
```

 - Lancer le backend :

```bash
python pitsim_f1/manage.py runserver
```

 - Frontend (dans `frontend/`) :

```bash
cd frontend
npm install
npm run dev
```

Tests unitaires
 - Tests ciblés sur le moteur de simulation :

```bash
PYTHONPATH=. DJANGO_SETTINGS_MODULE=pitsim_f1.settings pytest pitsim_f1/race/tests/test_simulation.py -q
```

Décisions d'architecture et justification accessible
 - FAI : la logique du calcul des tours est centralisée dans le backend pour garantir conformité métier et éviter des divergences UI/back‑end.
 - ML vs analytique : le code implémente un fallback analytique (alpha * gamma * n^delta) pour garantir robustesse quand le modèle ML n'est pas disponible.
 - Clustering offline : pas exécuté en runtime critique — il enrichit les métadonnées et l'UX.

Limitations et travaux recommandés
 - Backfill des `length_km` pour tous les circuits (important pour `official_laps`).
 - Retrain ML avec données fastf1 complètes et cross‑validation par circuit (leave‑one‑circuit‑out) pour tester généralisation.
 - Ajouter tests d'intégration couvrant `api_optimize` end‑to‑end.
 - Optionnel : utiliser `cluster_label` comme feature ML ou regrouper pour increase data pooling.

Qui contacter / suite
 - Pour déploiement ou tests, exécutez les commandes ci‑dessus et envoyez moi les logs d'erreur si une étape échoue.

---
Cette page vise à fournir une compréhension complète et opérationnelle du projet en une lecture. Si vous voulez, je peux transformer cette version en une page plus courte pour présentation exécutive ou en mode tutoriel pas‑à‑pas.
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
