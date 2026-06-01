"""
seeders/seed_dashboard_demo.py
Genera volumen de citas históricas y futuras para poblar métricas y reportes.

Requisitos:
- Deben existir al menos 1 paciente, 1 especialista y 1 usuario activo.

Características:
- Idempotente por combinación (especialista, fecha_hora_inicio) usando get_or_create.
- Genera estados variados: PROGRAMADA, CONFIRMADA, ATENDIDA, CANCELADA, REPROGRAMADA.
- Cubre ~6 meses de historial (semanal) + ventana corta futura.
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.citas.models import Cita, EstadoCita
from apps.especialistas.models import Especialista
from apps.pacientes.models import Paciente
from apps.users.models import Usuario


ACTIVE_SLOT_STATES = (EstadoCita.PROGRAMADA, EstadoCita.CONFIRMADA)


@transaction.atomic
def run():
    pacientes = list(Paciente.objects.filter(activo=True).order_by('id_paciente')[:40])
    especialistas = list(Especialista.objects.filter(activo=True).order_by('id_especialista')[:4])
    registrado_por = Usuario.objects.filter(estado='ACTIVO').order_by('id').first()

    if not pacientes or not especialistas or not registrado_por:
        return 0, 0

    creados = 0
    existentes = 0

    now = timezone.localtime(timezone.now())
    base = now.replace(hour=9, minute=0, second=0, microsecond=0)

    # Distribucion intencional para generar señal en dashboard y reportes.
    # 6 meses hacia atrás con granularidad semi-semanal, + ventana futura.
    weekly_pattern = [
        EstadoCita.ATENDIDA,
        EstadoCita.CANCELADA,
        EstadoCita.ATENDIDA,
        EstadoCita.REPROGRAMADA,
        EstadoCita.ATENDIDA,
        EstadoCita.CONFIRMADA,
        EstadoCita.PROGRAMADA,
        EstadoCita.ATENDIDA,
    ]

    windows = []
    for week_idx, day_offset in enumerate(range(-180, 1, 3)):
        windows.append((day_offset, weekly_pattern[week_idx % len(weekly_pattern)]))

    windows.extend(
        [
            (1, EstadoCita.CONFIRMADA),
            (3, EstadoCita.PROGRAMADA),
            (7, EstadoCita.PROGRAMADA),
            (14, EstadoCita.CONFIRMADA),
            (21, EstadoCita.PROGRAMADA),
            (28, EstadoCita.CONFIRMADA),
        ]
    )

    for i, (day_offset, estado) in enumerate(windows):
        for j, especialista in enumerate(especialistas):
            paciente = pacientes[(i + j) % len(pacientes)]
            start = base + timedelta(days=day_offset, hours=j)
            end = start + timedelta(minutes=30)

            # Evita violar la restriccion unica de slots activos por especialista+inicio.
            if estado in ACTIVE_SLOT_STATES and Cita.objects.filter(
                id_especialista=especialista,
                fecha_hora_inicio=start,
                estado__in=ACTIVE_SLOT_STATES,
            ).exists():
                existentes += 1
                continue

            defaults = {
                'fecha_hora_fin': end,
                'motivo': f'Dashboard demo #{i + 1}-{j + 1}',
                'estado': estado,
                'registrado_por': registrado_por,
                'motivo_cancelacion': 'Conflicto de agenda' if estado == EstadoCita.CANCELADA else None,
                'motivo_reprogramacion': 'Ajuste de disponibilidad' if estado == EstadoCita.REPROGRAMADA else None,
                'observaciones': 'Dato de prueba para métricas de dashboard.',
            }

            _, created = Cita.objects.get_or_create(
                id_paciente=paciente,
                id_especialista=especialista,
                fecha_hora_inicio=start,
                defaults=defaults,
            )
            if created:
                creados += 1
            else:
                existentes += 1

    return creados, existentes
