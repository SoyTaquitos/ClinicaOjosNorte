"""
seeders/seed_consultas_demo.py
Genera datos demo de consultas medicas a partir de citas existentes.

Reglas:
- Idempotente: no duplica consulta por cita (OneToOne).
- Solo usa citas con estado PROGRAMADA o CONFIRMADA.
- Al crear consulta, actualiza cita a ATENDIDA.
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.citas.models import Cita, EstadoCita
from apps.consultas.models import ConsultaMedica
from apps.especialistas.models import Especialista
from apps.pacientes.models import Paciente
from apps.users.models import TipoUsuario, Usuario


CONSULTAS_OBJETIVO = 2


def _usuario_registrador():
    candidato = (
        Usuario.objects.filter(tipo_usuario__in=[TipoUsuario.MEDICO, TipoUsuario.ESPECIALISTA, TipoUsuario.ADMIN])
        .order_by('id')
        .first()
    )
    return candidato


@transaction.atomic
def run():
    creados = 0
    existentes = 0

    registrador = _usuario_registrador()
    if not registrador:
        raise ValueError('No existe usuario registrador (MEDICO/ESPECIALISTA/ADMIN). Ejecuta seed_clinica primero.')

    citas_disponibles = (
        Cita.objects.select_related('id_paciente', 'id_especialista')
        .filter(estado__in=[EstadoCita.PROGRAMADA, EstadoCita.CONFIRMADA])
        .order_by('-fecha_hora_inicio')
    )

    if not citas_disponibles.exists():
        paciente = Paciente.objects.order_by('id_paciente').first()
        especialista = Especialista.objects.order_by('id_especialista').first()
        if not paciente or not especialista:
            raise ValueError(
                'No hay datos clínicos base para generar consultas demo. Ejecuta seed --only clinica primero.'
            )

        inicio = timezone.now() + timedelta(days=1)
        inicio = inicio.replace(hour=10, minute=0, second=0, microsecond=0)
        fin = inicio + timedelta(minutes=30)

        nueva_cita, created = Cita.objects.get_or_create(
            id_paciente=paciente,
            id_especialista=especialista,
            fecha_hora_inicio=inicio,
            defaults={
                'fecha_hora_fin': fin,
                'motivo': 'Cita generada por seeder consultas-demo',
                'estado': EstadoCita.PROGRAMADA,
                'registrado_por': registrador,
            },
        )
        if created:
            creados += 1
        else:
            existentes += 1

        citas_disponibles = Cita.objects.filter(id_cita=nueva_cita.id_cita)

    for idx, cita in enumerate(citas_disponibles[:CONSULTAS_OBJETIVO], start=1):
        consulta, created = ConsultaMedica.objects.get_or_create(
            id_cita=cita,
            defaults={
                'id_paciente': cita.id_paciente,
                'id_especialista': cita.id_especialista,
                'motivo_consulta': f'Control oftalmologico de seguimiento #{idx}',
                'anamnesis': 'Paciente refiere vision borrosa intermitente y fatiga visual.',
                'hallazgos': 'Agudeza visual corregida estable; sin signos de alarma en biomicroscopia.',
                'diagnostico': 'Astenopia asociada a esfuerzo visual prolongado.',
                'plan_tratamiento': 'Higiene visual, lubricante ocular y control en 30 dias.',
                'registrado_por': registrador,
            },
        )

        if created:
            creados += 1
            cita.estado = EstadoCita.ATENDIDA
            if not cita.fecha_hora_fin:
                cita.fecha_hora_fin = cita.fecha_hora_inicio + timedelta(minutes=30)
            cita.fecha_actualizacion = timezone.now()
            cita.save(update_fields=['estado', 'fecha_hora_fin', 'fecha_actualizacion'])
        else:
            existentes += 1

    return creados, existentes
