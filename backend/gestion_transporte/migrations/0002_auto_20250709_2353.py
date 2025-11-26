from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('gestion_transporte', '0001_initial'),  # Asegúrate de que dependa de la migración anterior
    ]

    operations = [
        migrations.CreateModel(
            name='DatasetTurnosIA',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fecha_turno', models.DateField()),
                ('estado_vehiculo', models.CharField(max_length=20, choices=[('activo', 'Activo'), ('inactivo', 'Inactivo'), ('mantenimiento', 'Mantenimiento')])),
                ('vehiculo_operativo', models.BooleanField()),
                ('estado_solicitud', models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('asignado', 'Asignado'), ('rechazado', 'Rechazado'), ('completado', 'Completado')])),
                ('transportista', models.ForeignKey(on_delete=models.CASCADE, limit_choices_to={'rol': 'TRANSP'}, to='gestion_usuarios.usuario')),
                ('vehiculo', models.ForeignKey(on_delete=models.CASCADE, to='gestion_vehiculos.vehiculo')),
                ('solicitud', models.ForeignKey(on_delete=models.CASCADE, to='servicios_transporte.solicitudservicio')),
            ],
        ),
    ]
