from django.db import models
import math

class Ecurie(models.Model):
    """
    Représente une écurie de Formule 1 avec ses paramètres de performance 
    et de temps d'arrêt aux stands.
    """
    nom = models.CharField(max_length=100, unique=True, verbose_name="Nom de l'écurie")
    gamma = models.FloatField(verbose_name="Facteur multiplicateur de l'écurie (γ)")
    T_pit = models.FloatField(verbose_name="Temps moyen aux stands (s)")
    delta = models.FloatField(verbose_name="Exposant de dégradation (δ)")
    profil = models.CharField(max_length=100, verbose_name="Profil stratégique")
    caracteristique = models.TextField(verbose_name="Caractéristique principale")

    def __str__(self) -> str:
        return f"{self.nom} (γ={self.gamma})"


class CircuitCluster(models.Model):
    """
    Stocke les métadonnées des circuits ainsi que leur appartenance à un cluster
    déterminée par l'algorithme d'apprentissage non supervisé (IA-2).
    """
    nom_circuit = models.CharField(max_length=150, unique=True, verbose_name="Nom du circuit")
    temp_ambiante_moy = models.FloatField(verbose_name="Température ambiante moyenne (°C)")
    temp_piste_moy = models.FloatField(verbose_name="Température de piste moyenne (°C)")
    nb_virages_lents = models.IntegerField(verbose_name="Nombre de virages lents")
    nb_virages_rapides = models.IntegerField(verbose_name="Nombre de virages rapides")
    degen_moy = models.FloatField(verbose_name="Dégradation moyenne")
    freq_safety_car = models.FloatField(verbose_name="Fréquence historique de Safety Car (%)")
    proba_pluie = models.FloatField(verbose_name="Probabilité de pluie historique (%)")
    cluster_label = models.CharField(max_length=100, blank=True, null=True, verbose_name="Label du cluster")
    # Longueur du circuit en kilomètres (ex: Monaco ~3.337)
    length_km = models.FloatField(blank=True, null=True, verbose_name="Longueur du circuit (km)")
    # Distance cible de la course en km (par défaut ~305 km, Monaco special-case handled in property)
    race_distance_km = models.FloatField(default=305.0, verbose_name="Distance officielle de la course (km)")

    def __str__(self) -> str:
        return f"{self.nom_circuit} - {self.cluster_label or 'Non classifié'}"

    @property
    def official_laps(self) -> int:
        """
        Calcule le nombre officiel de tours selon la longueur du circuit et
        la règle FIA (~305 km pour la plupart des Grands Prix, ~260 km pour Monaco).
        Retourne None si `length_km` est absent.
        """
        if not self.length_km or self.length_km <= 0:
            return None

        # Monaco special-case: shorter target distance
        target = 260.0 if "monaco" in self.nom_circuit.lower() else (self.race_distance_km or 305.0)
        return math.ceil(target / self.length_km)


class Pneumatique(models.Model):
    """
    Représente les caractéristiques des 5 composés de gommes disponibles.
    """
    TYPE_GOMME_CHOICES = [
        ('Soft', 'Soft (S)'),
        ('Medium', 'Medium (M)'),
        ('Hard', 'Hard (H)'),
        ('Inter', 'Intermédiaire (I)'),
        ('Wet', 'Pluie (W)'),
    ]

    type_gomme = models.CharField(max_length=10, choices=TYPE_GOMME_CHOICES, unique=True, verbose_name="Type de gomme")
    alpha = models.FloatField(verbose_name="Taux de dégradation de base (α)")
    duree_max_tours = models.IntegerField(verbose_name="Durée de vie maximale (tours)")
    conditions = models.CharField(max_length=50, verbose_name="Conditions optimales")
    penalite_hors_cond = models.FloatField(verbose_name="Pénalité hors conditions (s/tour)")
    usage = models.CharField(max_length=100, verbose_name="Usage typique")

    def __str__(self) -> str:
        return f"Pneu {self.type_gomme} (α={self.alpha})"
