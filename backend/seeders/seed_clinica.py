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
    {
        'username': 'dr.luis',
        'email': 'luis.medico@oftalmologia.local',
        'nombres': 'Luis',
        'apellidos': 'Alvarez',
        'tipo_usuario': TipoUsuario.MEDICO,
        'telefono': '70033333',
        'password': 'medico123',
    },
    {
        'username': 'dra.paola',
        'email': 'paola.especialista@oftalmologia.local',
        'nombres': 'Paola',
        'apellidos': 'Herrera',
        'tipo_usuario': TipoUsuario.ESPECIALISTA,
        'telefono': '70044444',
        'password': 'especialista123',
    },
    {
        'username': 'dr.renzo',
        'email': 'renzo.medico@oftalmologia.local',
        'nombres': 'Renzo',
        'apellidos': 'Ortiz',
        'tipo_usuario': TipoUsuario.MEDICO,
        'telefono': '70055555',
        'password': 'medico123',
    },
    {
        'username': 'dra.sofia',
        'email': 'sofia.especialista@oftalmologia.local',
        'nombres': 'Sofia',
        'apellidos': 'Ribera',
        'tipo_usuario': TipoUsuario.ESPECIALISTA,
        'telefono': '70066666',
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
    {
        'nombres': 'Valeria',
        'apellidos': 'Torrez',
        'documento_identidad': 'CI-1001003',
        'fecha_nacimiento': datetime(1995, 3, 21).date(),
        'sexo': 'F',
        'telefono': '72100003',
        'email': 'valeria.torrez@example.com',
        'direccion': 'Barrio Norte #45',
        'activo': True,
    },
    {
        'nombres': 'Jose',
        'apellidos': 'Guzman',
        'documento_identidad': 'CI-1001004',
        'fecha_nacimiento': datetime(1979, 8, 9).date(),
        'sexo': 'M',
        'telefono': '72100004',
        'email': 'jose.guzman@example.com',
        'direccion': 'Av. Grigota #210',
        'activo': True,
    },
    {
        'nombres': 'Camila',
        'apellidos': 'Arias',
        'documento_identidad': 'CI-1001005',
        'fecha_nacimiento': datetime(2001, 1, 30).date(),
        'sexo': 'F',
        'telefono': '72100005',
        'email': 'camila.arias@example.com',
        'direccion': 'Zona Equipetrol #12',
        'activo': True,
    },
    {
        'nombres': 'Daniel',
        'apellidos': 'Lopez',
        'documento_identidad': 'CI-1001006',
        'fecha_nacimiento': datetime(1983, 12, 5).date(),
        'sexo': 'M',
        'telefono': '72100006',
        'email': 'daniel.lopez@example.com',
        'direccion': 'Calle Suarez Arana #77',
        'activo': True,
    },
    {
        'nombres': 'Natalia',
        'apellidos': 'Rivera',
        'documento_identidad': 'CI-1001007',
        'fecha_nacimiento': datetime(1990, 10, 12).date(),
        'sexo': 'F',
        'telefono': '72100007',
        'email': 'natalia.rivera@example.com',
        'direccion': 'Av. Busch #501',
        'activo': True,
    },
    {
        'nombres': 'Pablo',
        'apellidos': 'Vargas',
        'documento_identidad': 'CI-1001008',
        'fecha_nacimiento': datetime(1975, 4, 18).date(),
        'sexo': 'M',
        'telefono': '72100008',
        'email': 'pablo.vargas@example.com',
        'direccion': 'Plan 3000, mz 9',
        'activo': True,
    },
    {
        'nombres': 'Mariana',
        'apellidos': 'Salazar',
        'documento_identidad': 'CI-1001009',
        'fecha_nacimiento': datetime(1998, 7, 7).date(),
        'sexo': 'F',
        'telefono': '72100009',
        'email': 'mariana.salazar@example.com',
        'direccion': 'Av. Santos Dumont #811',
        'activo': True,
    },
    {
        'nombres': 'Ricardo',
        'apellidos': 'Mendez',
        'documento_identidad': 'CI-1001010',
        'fecha_nacimiento': datetime(1986, 9, 14).date(),
        'sexo': 'M',
        'telefono': '72100010',
        'email': 'ricardo.mendez@example.com',
        'direccion': 'Canal Isuto #320',
        'activo': True,
    },
    {
        'nombres': 'Gabriela',
        'apellidos': 'Pinto',
        'documento_identidad': 'CI-1001011',
        'fecha_nacimiento': datetime(1993, 2, 25).date(),
        'sexo': 'F',
        'telefono': '72100011',
        'email': 'gabriela.pinto@example.com',
        'direccion': 'Av. Beni #930',
        'activo': True,
    },
    {
        'nombres': 'Sergio',
        'apellidos': 'Quispe',
        'documento_identidad': 'CI-1001012',
        'fecha_nacimiento': datetime(1981, 5, 3).date(),
        'sexo': 'M',
        'telefono': '72100012',
        'email': 'sergio.quispe@example.com',
        'direccion': 'Barrio Hamacas #66',
        'activo': True,
    },
]

PACIENTES_GENERADOS_OBJETIVO = 60


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

    especialista_3, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0003',
        defaults={
            'id_usuario': usuarios['dr.luis'],
            'especialidad': 'Glaucoma',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    especialista_4, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0004',
        defaults={
            'id_usuario': usuarios['dra.paola'],
            'especialidad': 'Córnea y superficie ocular',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    especialista_5, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0005',
        defaults={
            'id_usuario': usuarios['dr.renzo'],
            'especialidad': 'Oftalmologia pediátrica',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    especialista_6, created = Especialista.objects.get_or_create(
        registro_profesional='REG-OFT-0006',
        defaults={
            'id_usuario': usuarios['dra.sofia'],
            'especialidad': 'Neuro-oftalmología',
            'activo': True,
        },
    )
    creados += int(created)
    existentes += int(not created)

    # 3) Pacientes base
    pacientes = []
    for data in PACIENTES_BASE:
        paciente, created = Paciente.objects.get_or_create(
            documento_identidad=data['documento_identidad'],
            defaults=data,
        )
        creados += int(created)
        existentes += int(not created)
        pacientes.append(paciente)

    # 3b) Pacientes generados para volumen de reportes (idempotente)
    nombres = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabian', 'Gloria', 'Hugo', 'Ines', 'Javier']
    apellidos = ['Lozano', 'Mora', 'Paredes', 'Vargas', 'Quiroga', 'Soto', 'Roca', 'Molina', 'Paz', 'Gomez']
    sexo_cycle = ['F', 'M']

    # Genera desde 2000001 para no colisionar con dataset base.
    for idx in range(1, PACIENTES_GENERADOS_OBJETIVO + 1):
        doc = f'CI-200{idx:04d}'
        defaults = {
            'nombres': nombres[idx % len(nombres)],
            'apellidos': f"{apellidos[idx % len(apellidos)]} {apellidos[(idx + 3) % len(apellidos)]}",
            'fecha_nacimiento': datetime(1970 + (idx % 30), ((idx % 12) + 1), ((idx % 28) + 1)).date(),
            'sexo': sexo_cycle[idx % 2],
            'telefono': f'73{idx:06d}'[:8],
            'email': f'paciente{idx}@example.com',
            'direccion': f'Zona demo #{idx}',
            'activo': True,
        }
        paciente, created = Paciente.objects.get_or_create(
            documento_identidad=doc,
            defaults=defaults,
        )
        creados += int(created)
        existentes += int(not created)
        pacientes.append(paciente)

    # 4) Horarios
    horarios_seed = [
        {'id_especialista': especialista_1, 'dia_semana': 0, 'hora_inicio': time(8, 0), 'hora_fin': time(12, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_1, 'dia_semana': 2, 'hora_inicio': time(14, 0), 'hora_fin': time(18, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_2, 'dia_semana': 1, 'hora_inicio': time(9, 0), 'hora_fin': time(13, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_3, 'dia_semana': 3, 'hora_inicio': time(8, 30), 'hora_fin': time(12, 30), 'duracion_slot_min': 30},
        {'id_especialista': especialista_4, 'dia_semana': 4, 'hora_inicio': time(14, 0), 'hora_fin': time(18, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_5, 'dia_semana': 0, 'hora_inicio': time(13, 0), 'hora_fin': time(17, 0), 'duracion_slot_min': 30},
        {'id_especialista': especialista_6, 'dia_semana': 2, 'hora_inicio': time(9, 0), 'hora_fin': time(13, 0), 'duracion_slot_min': 30},
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
