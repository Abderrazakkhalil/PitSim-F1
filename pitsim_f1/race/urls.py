from django.urls import path
from race import views

app_name = "race"

urlpatterns = [
    path("",               views.RaceUnifiedView.as_view(),  name="dashboard"),
    path("export/csv/",    views.export_csv,                name="export_csv"),
    path("api/initial-data/",    views.api_initial_data,    name="api_initial_data"),
    path("api/optimize/",        views.api_optimize,        name="api_optimize"),
    path("api/ecurie-details/",  views.api_ecurie_details,  name="api_ecurie"),
    path("api/circuit-details/", views.api_circuit_details, name="api_circuit"),
]
