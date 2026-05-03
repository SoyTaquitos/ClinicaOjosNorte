"""
seeders/seed_clinica.py
Puebla datos base de dominio clínico para entorno dev:
- usuarios médicos/especialistas
- especialistas
- pacientes
- horarios de especialista
- cita de ejemplo futura

Idempotente por claves naturales (username, documento, registro, bloque horario).
"""

from datetime import datetime, time, timedelta

from django.db import transaction
from django.utils import timezone

from apps.citas.models import Cita, EstadoCita, HorarioEspecialista
from apps.especialistas.models import Especialista
from apps.pacientes.models import Paciente
from apps.users.models import EstadoUsuario, TipoUsuario, Usuario


USUARIOS_MEDICOS = [
    {
        'username': 'dr.carlos',
        'email': 'carlos.medico@oftalmologia.local',
        'nombres': 'Carlos',
        'apellidos': 'Mendoza',
        'tipo_usuario': TipoUsuario.MEDICO,
        'telefono': '70011111',
        'password': 'medico123',
    },
    {
        'username': 'dra.andrea',
        'email': 'andrea.especialista@oftalmologia.local',
        'nombres': 'Andrea',
        'apellidos': 'Suarez',
        'tipo_usuario': TipoUsuario.ESPECIALISTA,
        'telefono': '70022222',
        'password': 'especialista123',
    },
]

PACIENTES_BASE = [
    {
        'nombres': 'Lucia',
        'apellidos': 'Fernandez',
        'documento_identidad': 'CI-1001001',
        'fecha_nacimiento': datetime(1992, 6, 14).date(),
        'sexo': 'F',
        'telefono': '72100001',
        'email': 'lucia.fernandez@example.com',
        'direccion': 'Av. Banzer #1234',
        'activo': True,
    },
    {
        'nombres': 'Miguel',
        'apellidos': 'Rojas',
        'documento_identidad': 'CI-1001002',
        'fecha_nacimiento': datetime(1987, 11, 2).date(),
        'sexo': 'M',
        'telefono': '72100002',
        'email': 'miguel.rojas@example.com',
        'direccion': 'Calle Libertad #89',
        'activo': True,
    },
]


def _next_business_day_start(hour=10, minute=0):
    base = timezone.localtime(timezone.now())
    candidate = base + timedelta(days=1)
    while candidate.weekday() >= 5:  # 5=sabado, 6=domingo
        candidate += timedelta(days=1)
    return candidate.replace(hour=hour, minute=minute, second=0, microsecond=0)


@transaction.atomic
def run():
    creados = 0
    existentes = 0

    # 1) Usuarios clínicos base
    usuarios = {}
    for data in USUARIOS_MEDICOS:
        user, created = Usuario.objects.get_or_create(
            username=data['username'],
            defaults={
                'email': data['email'],
                'nombres': data['nombres'],
                'apellidos': data['apellidos'],
                'tipo_usuario': data['tipo_usuario'],
                'telefono': data['telefono'],
                'estado': EstadoUsuario.ACTIVO,
                'is_staff': False,
                'is_active': True,
            },
        )
        if created:
            user.set_password(data['password'])
            user.save(update_fields=['password'])
            creados += 1
        else:
            existentes += 1
        usuarios[data['username']] = user

    # 2) Especialistas
    especialista_1, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0001',
        defaults={
            'id_usuario': usuarios['dr.carlos'],
            'especialidad': 'Oftalmologia general',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    especialista_2, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0002',
        defaults={
            'id_usuario': usuarios['dra.andrea'],
            'especialidad': 'Retina y vitreo',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    # 3) Pacientes
    pacientes = []
    for data in PACIENTES_BASE:
        paciente, created = Paciente.objects.get_or_create(
            documento_identidad=data['documento_identidad'],
            defaults=data,
        )
        creados += int(created)
        existentes += int(not created)
        pacientes.append(paciente)

    # 4) Horarios
    horarios_seed = [
        {'id_especialista': especialista_1, 'dia_semana': 0, 'hora_inicio': time(8, 0), 'hora_fin': time(12, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_1, 'dia_semana': 2, 'hora_inicio': time(14, 0), 'hora_fin': time(18, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_2, 'dia_semana': 1, 'hora_inicio': time(9, 0), 'hora_fin': time(13, 0), 'duracion_slot_min': 30},
    ]
    for item in horarios_seed:
        _, created = HorarioEspecialista.objects.get_or_create(
            id_especialista=item['id_especialista'],
            dia_semana=item['dia_semana'],
            hora_inicio=item['hora_inicio'],
            hora_fin=item['hora_fin'],
            defaults={'duracion_slot_min': item['duracion_slot_min'], 'activo': True},
        )
        creados += int(created)
        existentes += int(not created)

    # 5) Cita futura de ejemplo
    inicio_local = _next_business_day_start(hour=10, minute=0)
    inicio = timezone.make_aware(inicio_local.replace(tzinfo=None), timezone.get_current_timezone()) if timezone.is_naive(inicio_local) else inicio_local
    fin = inicio + timedelta(minutes=30)

    _, created = Cita.objects.get_or_create(
        id_paciente=pacientes[0],
        id_especialista=especialista_1,
        fecha_hora_inicio=inicio,
        defaults={
            'fecha_hora_fin': fin,
            'motivo': 'Control de agudeza visual (seed)',
            'estado': EstadoCita.PROGRAMADA,
            'registrado_por': usuarios['dr.carlos'],
        },
    )
    creados += int(created)
    existentes += int(not created)

    return creados, existentes
