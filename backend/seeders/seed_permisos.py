"""
seeders/seed_permisos.py
Pobla la tabla permisos con los permisos granulares del sistema (IAM).
Idempotente: usa get_or_create.

Convención: '<modulo>.<accion>'
Módulos vigentes: users, bitacora, roles, permisos
"""
from apps.permisos.models import Permiso


PERMISOS = [
    # Usuarios
    {'codigo': 'users.listar',    'nombre': 'Listar usuarios',       'modulo': 'users'},
    {'codigo': 'users.ver',       'nombre': 'Ver usuario',            'modulo': 'users'},
    {'codigo': 'users.crear',     'nombre': 'Crear usuario',          'modulo': 'users'},
    {'codigo': 'users.editar',    'nombre': 'Editar usuario',         'modulo': 'users'},
    {'codigo': 'users.eliminar',  'nombre': 'Eliminar usuario',       'modulo': 'users'},

    # Bitácora
    {'codigo': 'bitacora.ver', 'nombre': 'Ver bitácora de auditoría', 'modulo': 'bitacora'},

    # Roles y permisos
    {'codigo': 'roles.listar',    'nombre': 'Listar roles',    'modulo': 'roles'},
    {'codigo': 'roles.crear',     'nombre': 'Crear rol',       'modulo': 'roles'},
    {'codigo': 'roles.editar',    'nombre': 'Editar rol',      'modulo': 'roles'},
    {'codigo': 'roles.eliminar',  'nombre': 'Eliminar rol',    'modulo': 'roles'},
    {'codigo': 'permisos.listar', 'nombre': 'Listar permisos', 'modulo': 'permisos'},
    {'codigo': 'permisos.crear',  'nombre': 'Crear permiso',   'modulo': 'permisos'},
    {'codigo': 'permisos.editar', 'nombre': 'Editar permiso',  'modulo': 'permisos'},
]


def run():
    creados = 0
    existentes = 0

    for data in PERMISOS:
        _, created = Permiso.objects.get_or_create(
            codigo=data['codigo'],
            defaults={
                'nombre': data['nombre'],
                'modulo': data['modulo'],
            },
        )
        if created:
            creados += 1
        else:
            existentes += 1

    return creados, existentes
