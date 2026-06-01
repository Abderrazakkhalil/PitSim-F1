from django.core.management.base import BaseCommand
from django.core import management
from pathlib import Path


class Command(BaseCommand):
    help = "Init data: charge fixtures initiales ou crée des objets de démonstration"

    def handle(self, *args, **options):
        base = Path(__file__).resolve().parents[3]
        fixture = base / 'core' / 'fixtures' / 'initial_data.json'
        if fixture.exists():
            self.stdout.write(f"Chargement des fixtures depuis: {fixture}")
            management.call_command('loaddata', str(fixture))
            self.stdout.write(self.style.SUCCESS('Fixtures chargées avec succès.'))
            return

        # Fallback : création programmatique minimale
        from core.models import Ecurie, CircuitCluster, Pneumatique

        if not Ecurie.objects.exists():
            Ecurie.objects.create(nom='Scuderia Demo', gamma=1.02, T_pit=2.5, delta=0.9, profil='Attaque-Equilibre', caracteristique='Demo')
            Ecurie.objects.create(nom='Team Conserv', gamma=0.98, T_pit=3.5, delta=1.05, profil='Conservation', caracteristique='Demo')

        if not CircuitCluster.objects.exists():
            CircuitCluster.objects.create(nom_circuit='Bahrain', temp_ambiante_moy=28.0, temp_piste_moy=32.0, nb_virages_lents=6, nb_virages_rapides=9, degen_moy=0.25, freq_safety_car=30.0, proba_pluie=5.0, cluster_label='Haute Usure Thermique')
            CircuitCluster.objects.create(nom_circuit='Monaco', temp_ambiante_moy=23.0, temp_piste_moy=45.0, nb_virages_lents=12, nb_virages_rapides=7, degen_moy=0.10, freq_safety_car=80.0, proba_pluie=15.0, cluster_label='Urbain / Forte Traction')

        if not Pneumatique.objects.exists():
            Pneumatique.objects.create(type_gomme='Soft', alpha=0.035, duree_max_tours=22, conditions='Sec', penalite_hors_cond=2.0, usage='Attaque')
            Pneumatique.objects.create(type_gomme='Medium', alpha=0.02, duree_max_tours=30, conditions='Sec', penalite_hors_cond=1.0, usage='Polyvalent')
            Pneumatique.objects.create(type_gomme='Hard', alpha=0.015, duree_max_tours=40, conditions='Sec', penalite_hors_cond=1.5, usage='Endurance')

        self.stdout.write(self.style.SUCCESS('Données de démonstration créées.'))
from django.core.management.base import BaseCommand
from core.models import Ecurie, Pneumatique

class Command(BaseCommand):
    help = "Initialise la base de données avec les écuries et les pneumatiques du cahier des charges."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Début de l'initialisation des données..."))

        # Initialisation des écuries
        ecuries_data = [
            {"nom": "Red Bull Racing", "gamma": 0.95, "T_pit": 2.0, "delta": 1.4, "profil": "Élite", "caracteristique": "Arrêts ultra-rapides"},
            {"nom": "McLaren", "gamma": 0.92, "T_pit": 2.1, "delta": 1.3, "profil": "Optimal", "caracteristique": "Préservation maximale"},
            {"nom": "Ferrari", "gamma": 1.08, "T_pit": 2.3, "delta": 1.7, "profil": "Agressif", "caracteristique": "Surchauffe thermique"},
            {"nom": "Haas F1 Team", "gamma": 1.15, "T_pit": 2.6, "delta": 1.8, "profil": "Dégradant", "caracteristique": "Forte usure sur tendres"},
            {"nom": "Mercedes", "gamma": 1.00, "T_pit": 2.4, "delta": 1.5, "profil": "Neutre", "caracteristique": "Comportement médian"},
            {"nom": "Aston Martin", "gamma": 1.05, "T_pit": 2.5, "delta": 1.6, "profil": "Variable", "caracteristique": "Dégrade par haute temp."},
        ]

        for data in ecuries_data:
            Ecurie.objects.update_or_create(nom=data['nom'], defaults=data)
            self.stdout.write(f" Écurie ajoutée/mise à jour : {data['nom']}")

        # Initialisation des pneumatiques
        pneumatiques_data = [
            {"type_gomme": "Soft", "alpha": 0.09, "duree_max_tours": 22, "conditions": "Sec chaud", "penalite_hors_cond": 7.0, "usage": "Quali / relais court"},
            {"type_gomme": "Medium", "alpha": 0.05, "duree_max_tours": 32, "conditions": "Sec neutre", "penalite_hors_cond": 6.0, "usage": "Relais principal"},
            {"type_gomme": "Hard", "alpha": 0.025, "duree_max_tours": 40, "conditions": "Sec froid", "penalite_hors_cond": 5.0, "usage": "Long relais final"},
            {"type_gomme": "Inter", "alpha": 0.06, "duree_max_tours": 28, "conditions": "Piste humide", "penalite_hors_cond": 4.0, "usage": "Transition météo"},
            {"type_gomme": "Wet", "alpha": 0.03, "duree_max_tours": 35, "conditions": "Pluie forte", "penalite_hors_cond": 8.0, "usage": "Aquaplaning"},
        ]

        for data in pneumatiques_data:
            Pneumatique.objects.update_or_create(type_gomme=data['type_gomme'], defaults=data)
            self.stdout.write(f" Pneumatique ajouté/mis à jour : {data['type_gomme']}")

        self.stdout.write(self.style.SUCCESS(" Données initiales importées avec succès !"))
