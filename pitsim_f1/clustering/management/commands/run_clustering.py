from django.core.management.base import BaseCommand
from core.models import CircuitCluster
import sys
from pathlib import Path

# Ajout du chemin parent pour pouvoir importer clustering si nécessaire
# (Normalement géré par Django si clustering est une app installée)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent))

from clustering.circuit_clustering import run_clustering_pipeline

class Command(BaseCommand):
    help = "Exécute l'algorithme K-Means pour le clustering des circuits et met à jour la base de données."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Démarrage du pipeline de clustering (IA-2)..."))

        try:
            # Exécution de la pipeline IA-2
            df_clusters = run_clustering_pipeline()
            
            self.stdout.write(self.style.SUCCESS("Clustering terminé. Mise à jour de la base de données..."))
            
            # Mise à jour ou création en DB
            for index, row in df_clusters.iterrows():
                circuit, created = CircuitCluster.objects.update_or_create(
                    nom_circuit=row['nom_circuit'],
                    defaults={
                        'temp_ambiante_moy': row['temp_ambiante_moy'],
                        'temp_piste_moy': row['temp_piste_moy'],
                        'nb_virages_lents': row['nb_virages_lents'],
                        'nb_virages_rapides': row['nb_virages_rapides'],
                        'degen_moy': row['degen_moy'],
                        'freq_safety_car': row['freq_safety_car'],
                        'proba_pluie': row['proba_pluie'],
                        'cluster_label': row['cluster_label'],
                    }
                )
                action = "Créé" if created else "Mis à jour"
                self.stdout.write(f" - {row['nom_circuit']} -> {row['cluster_label']} ({action})")
                
            self.stdout.write(self.style.SUCCESS("✓ Base de données mise à jour avec succès !"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Une erreur est survenue lors du clustering : {e}"))
