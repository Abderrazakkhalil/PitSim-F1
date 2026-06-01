#!/usr/bin/env bash
set -euo pipefail

echo "Bootstrap (Unix): créer venv, installer dépendances Python et Node, migrer DB, charger fixtures, générer modèle demo"

ROOT=$(dirname "$0")/..
pushd "$ROOT" > /dev/null

python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r pitsim_f1/requirements.txt

cd pitsim_f1
python manage.py migrate
python manage.py init_data
python -m ml.build_demo_model
popd > /dev/null

echo "Bootstrap terminé. Démarrer le backend: (cd pitsim_f1; .venv/bin/python manage.py runserver)"
