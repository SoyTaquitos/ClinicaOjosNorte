from django.db import transaction
from rest_framework import serializers

from apps.citas.models import EstadoCita

from .models import ConsultaMedica


class ConsultaMedicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultaMedica
        fields = [
            'id_consulta',
            'id_cita',
            'id_paciente',
            'id_especialista',
            'motivo_consulta',
            'anamnesis',
            'hallazgos',
            'diagnostico',
            'plan_tratamiento',
            'registrado_por',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id_consulta', 'registrado_por', 'fecha_creacion', 'fecha_actualizacion']

    def validate(self, attrs):
        cita = attrs['id_cita']
        paciente = attrs['id_paciente']
        especialista = attrs['id_especialista']
        if cita.estado in (EstadoCita.CANCELADA, EstadoCita.ATENDIDA):
            raise serializers.ValidationError('La cita está cancelada o ya fue atendida.')
        if paciente.id_paciente != cita.id_paciente_id:
            raise serializers.ValidationError('El paciente no coincide con la cita.')
        if especialista.id_especialista != cita.id_especialista_id:
            raise serializers.ValidationError('El especialista no coincide con la cita.')
        return attrs

    def create(self, validated_data):
        validated_data['registrado_por'] = self.context['request'].user
        with transaction.atomic():
            consulta = super().create(validated_data)
            cita = consulta.id_cita
            cita.estado = EstadoCita.ATENDIDA
            cita.save(update_fields=['estado', 'fecha_actualizacion'])
        return consulta
