from rest_framework import serializers
from .models import Vehiculo, Mantenimiento, TipoVehiculo
from gestion_usuarios.models import Usuario

class TipoVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVehiculo
        fields = '__all__'

class TransportistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name']

class VehiculoSerializer(serializers.ModelSerializer):
    transportista = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        write_only=True
    )

    transportista_detalle = TransportistaSerializer(source='transportista', read_only=True)
    tipo_nombre = serializers.ReadOnlyField(source='tipo_vehiculo.nombre')

    class Meta:
        model = Vehiculo
        fields = '__all__'

class VehiculoTransportistaSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo_vehiculo.nombre')
    
    class Meta:
        model = Vehiculo
        fields = [
            'id', 'tipo', 'tipo_nombre', 'marca', 'modelo', 'placa', 'anio',
            'color', 'kilometraje_actual', 'tonelaje', 'combustible', 'estado', 
            'foto',
        ]

class MantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mantenimiento
        fields = ['id', 'vehiculo', 'tipo', 'kilometraje_actual', 'kilometraje_proximo', 'fecha_mantenimiento', 'observaciones']