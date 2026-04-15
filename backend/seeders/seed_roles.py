"""
seeders/seed_roles.py
Pobla la tabla roles con los roles base del sistema.
Idempotente: usa get_or_create.
"""
from apps.roles.models import Rol


ROLES_BASE = [
    {
        'nombre': 'Administrador del Sistema',
        'descripcion': 'Acceso total: usuarios, roles, permisos y auditoría.',
    },
    {
        'nombre': 'Operador IAM',
        'descripcion': 'Gestión de usuarios, roles y permisos según política asignada.',
    },
    {
        'nombre': 'Auditor',
        'descripcion': 'Consulta de bitácora y reportes de actividad.',
    },
    {
        'nombre': 'Usuario estándar',
        'descripcion': 'Acceso mínimo al panel autenticado.',
    },
]


def run():
    creados = 0
    existentes = 0

    for data in ROLES_BASE:
        _, created = Rol.objects.get_or_create(
            nombre=data['nombre'],
            defaults={'descripcion': data['descripcion'], 'activo': True},
        )
        if created:
            creados += 1
        else:
            existentes += 1

    return creados, existentes
