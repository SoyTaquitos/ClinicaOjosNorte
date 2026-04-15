"""
Oftalmología SI1 — Clínica de Ojos Norte — URL Configuration
=============================================================
Todas las rutas del proyecto bajo /api/
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

api_patterns = [
    # Core — Health check
    path('', include('apps.core.urls')),

    # Auth + Usuarios
    path('', include('apps.users.urls')),

    # Roles y asignaciones usuario-rol
    path('', include('apps.roles.urls')),

    # Permisos granulares
    path('', include('apps.permisos.urls')),

    # Bitácora (app separada — solo lectura via API)
    path('', include('apps.bitacora.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include((api_patterns, 'api'))),
]

# Media y static en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
