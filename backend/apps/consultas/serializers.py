"""
apps/consultas/serializers.py
"""
from rest_framework import serializers

from .models import ConsultaMedica


class ConsultaMedicaSerializer(serializers.ModelSerializer):
    """Serializer completo — usado para GET (detalle y lista)."""
    paciente = serializers.SerializerMethodField()
    especialista_detalle = serializers.SerializerMethodField()
    fecha_cita = serializers.SerializerMethodField()

    class Meta:
        model = ConsultaMedica
        fields = [
            'id_consulta',
            'id_cita',
            'id_historia_clinica',
            'id_especialista',
            'especialista_detalle',
            'paciente',
            'fecha_cita',
            'fecha_consulta',
            'motivo_consulta',
            'observaciones',
            'diagnostico',
            'indicaciones',
            'registrado_por',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id_consulta', 'registrado_por',
            'fecha_creacion', 'fecha_actualizacion',
        ]

    def get_paciente(self, obj):
        paciente = obj.id_historia_clinica.id_paciente
        return {
            'id_paciente': paciente.id_paciente,
            'nombre_completo': paciente.get_full_name(),
            'numero_historia': paciente.numero_historia,
        }

    def get_especialista_detalle(self, obj):
        return {
            'id_especialista': obj.id_especialista.id_especialista,
            'nombre_completo': obj.id_especialista.get_full_name(),
            'especialidad': obj.id_especialista.especialidad,
        }

    def get_fecha_cita(self, obj):
        return obj.id_cita.fecha_hora_inicio


class ConsultaMedicaCreateSerializer(serializers.ModelSerializer):
    """Serializer de escritura — usado para POST/PUT/PATCH."""

    class Meta:
        model = ConsultaMedica
        fields = [
            'id_cita',
            'id_historia_clinica',
            'id_especialista',
            'fecha_consulta',
            'motivo_consulta',
            'observaciones',
            'diagnostico',
            'indicaciones',
        ]

    def validate_id_cita(self, cita):
        """Valida que la cita no esté cancelada ni ya tenga consulta asignada."""
        from apps.citas.models import EstadoCita
        if cita.estado == EstadoCita.CANCELADA:
            raise serializers.ValidationError(
                'No se puede registrar una consulta para una cita cancelada.'
            )
        if hasattr(cita, 'consulta'):
            raise serializers.ValidationError(
                'Esta cita ya tiene una consulta médica registrada.'
            )
        return cita

    def validate(self, data):
        """Valida que la HistoriaClinica pertenezca al mismo paciente de la Cita."""
        cita = data.get('id_cita')
        historia = data.get('id_historia_clinica')
        if cita and historia:
            if cita.id_paciente_id != historia.id_paciente_id:
                raise serializers.ValidationError(
                    'La historia clínica no corresponde al paciente de la cita.'
                )
        return data
