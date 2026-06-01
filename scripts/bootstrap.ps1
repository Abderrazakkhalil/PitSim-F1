Write-Host "Bootstrap (Windows): créer venv, installer dépendances Python, migrer DB, charger fixtures, générer modèle demo"

$root = Split-Path -Parent $PSScriptRoot + '\..'
Set-Location $root

python -m venv .venv
. .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r pitsim_f1/requirements.txt

Set-Location pitsim_f1
python manage.py migrate
python manage.py init_data
python -m ml.build_demo_model

Write-Host "Bootstrap terminé. Lancez le backend : python manage.py runserver"
