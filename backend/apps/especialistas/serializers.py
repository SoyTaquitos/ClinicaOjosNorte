from rest_framework import serializers

from apps.users.models import TipoUsuario

from .models import Especialista


class EspecialistaSerializer(serializers.ModelSerializer):
    nombre_usuario = serializers.CharField(source='id_usuario.get_full_name', read_only=True)

    class Meta:
        model = Especialista
        fields = [
            'id_especialista',
            'id_usuario',
            'nombre_usuario',
            'especialidad',
            'registro_profesional',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id_especialista', 'fecha_creacion', 'fecha_actualizacion', 'nombre_usuario']

    def validate_id_usuario(self, value):
        if value.tipo_usuario not in (TipoUsuario.MEDICO, TipoUsuario.ESPECIALISTA, TipoUsuario.ADMIN):
            raise serializers.ValidationError(
                'El usuario debe ser MEDICO, ESPECIALISTA o ADMIN para registrar perfil especialista.'
            )
        return value
