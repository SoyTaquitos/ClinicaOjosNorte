"""
apps/users/urls.py
Solo auth y CRUD de usuarios. No hay registro público.
Los usuarios son creados por el administrador del sistema.
Roles → apps/roles/urls.py
Permisos → apps/permisos/urls.py

Auth:
  POST  /api/v1/auth/login/
  POST  /api/v1/auth/logout/
  GET   /api/v1/auth/me/
  PATCH /api/v1/auth/me/
  POST  /api/v1/auth/change-password/
  POST  /api/v1/auth/reset-password/
  POST  /api/v1/auth/reset-password/confirm/
  POST  /api/v1/auth/token/refresh/
  POST  /api/v1/auth/token/verify/

Gestión:
  /api/v1/users/
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    ChangePasswordView,
    LoginSeguridadConfigView,
    LoginView,
    LogoutView,
    MeView,
    ResetPasswordConfirmView,
    ResetPasswordView,
    UsuarioViewSet,
)

router = DefaultRouter(trailing_slash=False)
router.register('users', UsuarioViewSet, basename='users')

urlpatterns = [
    path('security/login-config/', LoginSeguridadConfigView.as_view(), name='security-login-config'),
    path('security/login-config', LoginSeguridadConfigView.as_view()),
    # Auth (con y sin slash final: el proxy de Next puede enviar POST sin `/` y
    # APPEND_SLASH no puede redirigir manteniendo el body → RuntimeError 500).
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/login', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/logout', LogoutView.as_view()),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/me', MeView.as_view()),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('auth/change-password', ChangePasswordView.as_view()),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('auth/reset-password', ResetPasswordView.as_view()),
    path('auth/reset-password/confirm/', ResetPasswordConfirmView.as_view(), name='auth-reset-confirm'),
    path('auth/reset-password/confirm', ResetPasswordConfirmView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/token/refresh', TokenRefreshView.as_view()),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('auth/token/verify', TokenVerifyView.as_view()),
    # CRUD Users
    path('', include(router.urls)),
]
