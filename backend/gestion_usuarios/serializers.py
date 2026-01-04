from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message='Este correo electrónico ya está registrado.')]
    )
    cedula_ruc = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message='Esta Cédula/RUC ya está registrada.')]
    )

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'cedula_ruc',
            'telefono', 
            'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        rol_recibido = validated_data.get('rol', 'CLIENTE')

        request = self.context.get('request')
        current_user_rol = getattr(request.user, 'rol', None) if request and request.user.is_authenticated else None

        rol_final = rol_recibido if current_user_rol == 'ADMIN' else 'CLIENTE'
        
        validated_data.pop('rol', None)

        user = Usuario(**validated_data)
        user.set_password(password)
        user.rol = rol_final
        user.save()
        return user
    
class UsuarioEdicionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['first_name', 'last_name', 'rol', 'cedula_ruc', 'telefono']