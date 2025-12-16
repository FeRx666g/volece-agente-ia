from rest_framework import serializers
from .models import Finanza

class FinanzaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Finanza
        fields = '__all__'