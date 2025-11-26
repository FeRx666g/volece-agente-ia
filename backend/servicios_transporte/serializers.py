from rest_framework import serializers
from .models import SolicitudServicio
from gestion_transporte.models import DatasetTurnosIA

class SolicitudServicioSerializer(serializers.ModelSerializer):
    cliente_nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudServicio
        fields = [
            'id', 'cliente', 'origen', 'destino', 'tipo_carga', 'fecha_solicitud', 'estado',
            'cliente_nombre_completo'
        ]
        read_only_fields = ('cliente',)

    def get_cliente_nombre_completo(self, obj):
        return f"{obj.cliente.last_name} {obj.cliente.first_name}"


class DatasetTurnosIASerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetTurnosIA
        fields = '__all__'
