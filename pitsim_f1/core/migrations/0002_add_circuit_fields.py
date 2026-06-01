from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='circuitcluster',
            name='length_km',
            field=models.FloatField(blank=True, null=True, verbose_name='Longueur du circuit (km)'),
        ),
        migrations.AddField(
            model_name='circuitcluster',
            name='race_distance_km',
            field=models.FloatField(default=305.0, verbose_name='Distance officielle de la course (km)'),
        ),
    ]
