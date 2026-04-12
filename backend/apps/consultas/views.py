"""
apps/consultas/views.py

Endpoints:
  GET/POST        /api/consultas/
  GET/PUT/PATCH   /api/consultas/{id}/
  DELETE          /api/consultas/{id}/
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from apps.bitacora.models import AccionBitacora
from apps.citas.models import EstadoCita
from apps.core.utils import get_client_ip, registrar_bitacora

from .models import ConsultaMedica
from .serializers import ConsultaMedicaCreateSerializer, ConsultaMedicaSerializer


class ConsultaMedicaViewSet(viewsets.ModelViewSet):
    """
    CRUD de consultas médicas.
    Al crear una consulta, la Cita asociada pasa automáticamente a ATENDIDA.
    """
    queryset = ConsultaMedica.objects.select_related(
        'id_cita__id_paciente',
        'id_cita__id_especialista__usuario',
        'id_historia_clinica__id_paciente',
        'id_especialista__usuario',
        'registrado_por',
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['id_especialista', 'id_historia_clinica', 'id_cita']
    search_fields = [
        'motivo_consulta',
        'diagnostico',
        'id_historia_clinica__id_paciente__nombres',
        'id_historia_clinica__id_paciente__apellidos',
        'id_historia_clinica__id_paciente__numero_documento',
        'id_especialista__usuario__nombres',
        'id_especialista__usuario__apellidos',
    ]
    ordering_fields = ['fecha_consulta', 'fecha_creacion']
    ordering = ['-fecha_consulta']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ConsultaMedicaCreateSerializer
        return ConsultaMedicaSerializer

    def perform_create(self, serializer):
        consulta = serializer.save(registrado_por=self.request.user)

        # Marcar la cita como ATENDIDA al registrar la consulta
        cita = consulta.id_cita
        if cita.estado != EstadoCita.ATENDIDA:
            cita.estado = EstadoCita.ATENDIDA
            cita.save(update_fields=['estado'])

        registrar_bitacora(
            usuario=self.request.user, modulo='consultas', accion=AccionBitacora.CREAR,
            descripcion=(
                f'Consulta #{consulta.id_consulta} registrada — '
                f'Paciente: {consulta.id_historia_clinica.id_paciente.get_full_name()} | '
                f'Especialista: {consulta.id_especialista.get_full_name()}'
            ),
            tabla_afectada='consultas_medicas',
            id_registro_afectado=consulta.id_consulta,
            ip_origen=get_client_ip(self.request),
        )

    def perform_update(self, serializer):
        consulta = serializer.save()
        registrar_bitacora(
            usuario=self.request.user, modulo='consultas', accion=AccionBitacora.EDITAR,
            descripcion=f'Consulta #{consulta.id_consulta} editada',
            tabla_afectada='consultas_medicas',
            id_registro_afectado=consulta.id_consulta,
            ip_origen=get_client_ip(self.request),
        )

    def perform_destroy(self, instance):
        registrar_bitacora(
            usuario=self.request.user, modulo='consultas', accion=AccionBitacora.ELIMINAR,
            descripcion=f'Consulta #{instance.id_consulta} eliminada',
            tabla_afectada='consultas_medicas',
            id_registro_afectado=instance.id_consulta,
            ip_origen=get_client_ip(self.request),
        )
        instance.delete()
