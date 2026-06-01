.PHONY: bootstrap backend frontend demo-model init-data

bootstrap:
	@bash scripts/bootstrap.sh

init-data:
	python pitsim_f1/manage.py migrate
	python pitsim_f1/manage.py init_data

demo-model:
	python -m pitsim_f1.ml.build_demo_model

backend:
	python pitsim_f1/manage.py runserver

frontend:
	cd frontend && npm install && npm run dev
