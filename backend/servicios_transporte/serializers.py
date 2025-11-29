from rest_framework import serializers
from .models import SolicitudServicio
from gestion_transporte.models import DatasetTurnosIA

class SolicitudServicioSerializer(serializers.ModelSerializer):
    cliente_nombre_completo = serializers.SerializerMethodField()
    transportista_asignado_id = serializers.SerializerMethodField()
    transportista_asignado_nombre = serializers.SerializerMethodField()
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
            'cliente_nombre_completo',
            'transportista_asignado_id',
            'transportista_asignado_nombre',
            'comentario_ia_asignado',
        ]
        read_only_fields = ('cliente',)

    def get_cliente_nombre_completo(self, obj):
        return f"{obj.cliente.last_name} {obj.cliente.first_name}"

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

    def get_comentario_ia_asignado(self, obj):
        turno = self._get_turno(obj)
        return turno.comentario_ia if turno else None


class DatasetTurnosIASerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetTurnosIA
        fields = '__all__'