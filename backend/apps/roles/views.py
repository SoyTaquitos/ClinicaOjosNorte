"""Compat: views de roles movidas a `apps.Usuarios.roles.views`."""

from apps.Usuarios.roles.views import RolViewSet, UsuarioRolViewSet

__all__ = ['RolViewSet', 'UsuarioRolViewSet']
