from django.db import models
from gestion_usuarios.models import Usuario  # Relación con el modelo de transportistas
from gestion_vehiculos.models import Vehiculo  # Relación con el modelo de vehículos
from servicios_transporte.models import SolicitudServicio  # Relación con el modelo de solicitudes

class DatasetTurnosIA(models.Model):
    # Relaciones con los transportistas, vehículos y solicitudes
    transportista = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'TRANSP'})
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(SolicitudServicio, on_delete=models.CASCADE)

    # Características del turno
    fecha_turno = models.DateField()
    
    # Estado del vehículo (activo, inactivo, mantenimiento)
    estado_vehiculo = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('mantenimiento', 'Mantenimiento')
    ])
    
    # Si el vehículo está operativo
    vehiculo_operativo = models.BooleanField()
    
    # Estado de la solicitud (pendiente, asignado, rechazado, completado)
    estado_solicitud = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('asignado', 'Asignado'),
        ('rechazado', 'Rechazado'),
        ('completado', 'Completado')
    ])

    def __str__(self):
        return f"Turno para {self.transportista} con vehículo {self.vehiculo} el {self.fecha_turno}"
