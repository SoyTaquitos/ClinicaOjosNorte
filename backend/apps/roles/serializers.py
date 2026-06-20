"""Compat: serializers de roles movidos a `apps.Usuarios.roles.serializers`."""

from apps.Usuarios.roles.serializers import RolPermisoSerializer, RolSerializer, UsuarioRolSerializer

__all__ = ['RolSerializer', 'RolPermisoSerializer', 'UsuarioRolSerializer']
