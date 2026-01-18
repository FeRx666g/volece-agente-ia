from rest_framework import serializers
from .models import Finanza, TipoFinanza

class TipoFinanzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoFinanza
        fields = '__all__'

class FinanzaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    tipo_detalle = TipoFinanzaSerializer(source='tipo', read_only=True)

    class Meta:
        model = Finanza
        fields = ['id', 'usuario', 'usuario_nombre', 'tipo', 'tipo_nombre', 'tipo_detalle', 'monto', 'fecha', 'descripcion', 'created_at']