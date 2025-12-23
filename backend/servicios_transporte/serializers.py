from rest_framework import serializers
from .models import SolicitudServicio
from gestion_transporte.models import DatasetTurnosIA
from gestion_vehiculos.models import Vehiculo

class SolicitudServicioSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.SerializerMethodField()
    transportista_asignado_id = serializers.SerializerMethodField()
    transportista_asignado_nombre = serializers.SerializerMethodField()
    vehiculo_asignado_placa = serializers.SerializerMethodField()
    comentario_ia_asignado = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudServicio
        fields = [
            'id',
            'cliente',
            'origen',
            'destino',
            'tipo_vehiculo',
            'tipo_carga',
            'fecha_solicitud',
            'estado',
            'cliente_nombre',
            'transportista_asignado_id',
            'transportista_asignado_nombre',
            'vehiculo_asignado_placa',
            'comentario_ia_asignado',
        ]
        read_only_fields = ('cliente',)

    def get_cliente_nombre(self, obj):
        if obj.cliente:
            return f"{obj.cliente.first_name} {obj.cliente.last_name}"
        return "Cliente Desconocido"

    def _get_turno(self, obj):
        return DatasetTurnosIA.objects.filter(solicitud=obj).first()

    def get_transportista_asignado_id(self, obj):
        turno = self._get_turno(obj)
        return turno.transportista_id if turno else None

    def get_transportista_asignado_nombre(self, obj):
        turno = self._get_turno(obj)
        if turno and turno.transportista:
            return f"{turno.transportista.first_name} {turno.transportista.last_name}"
        return None

    def get_vehiculo_asignado_placa(self, obj):
        turno = self._get_turno(obj)
        if turno and turno.vehiculo:
            return f"{turno.vehiculo.placa} ({turno.vehiculo.modelo})"
        return None

    def get_comentario_ia_asignado(self, obj):
        turno = self._get_turno(obj)
        return turno.comentario_ia if turno else None

class VehiculoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['id', 'placa', 'marca', 'modelo', 'tipo', 'foto']

class DatasetTurnosIASerializer(serializers.ModelSerializer):
    solicitud_data = SolicitudServicioSerializer(source='solicitud', read_only=True)
    vehiculo_data = VehiculoSimpleSerializer(source='vehiculo', read_only=True)

    class Meta:
        model = DatasetTurnosIA
        fields = '__all__'