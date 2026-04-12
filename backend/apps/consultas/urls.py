"""
apps/consultas/urls.py

GET/POST        /api/consultas/
GET/PUT/PATCH   /api/consultas/{id}/
DELETE          /api/consultas/{id}/
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ConsultaMedicaViewSet

router = DefaultRouter()
router.register('consultas', ConsultaMedicaViewSet, basename='consultas')

urlpatterns = [
    path('', include(router.urls)),
]
