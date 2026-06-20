"""Compat: modelos de roles movidos a `apps.Usuarios.roles.models`."""

from apps.Usuarios.roles.models import Rol, RolPermiso, UsuarioRol

__all__ = ['Rol', 'UsuarioRol', 'RolPermiso']
