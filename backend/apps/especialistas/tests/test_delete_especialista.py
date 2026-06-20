from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.citas.models import Cita
from apps.especialistas.models import Especialista
from apps.pacientes.models import Paciente
from apps.users.models import Usuario


class DeleteEspecialistaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_user(
            username='admin.esp',
            email='admin.esp@mail.com',
            password='R4ndomXa',
            nombres='Admin',
            apellidos='Esp',
            tipo_usuario='ADMIN',
            estado='ACTIVO',
        )
        self.client.force_authenticate(user=self.admin)

    def _create_especialista(self, username='esp.user'):
        user = Usuario.objects.create_user(
            username=username,
            email=f'{username}@mail.com',
            password='R4ndomXa',
            nombres='Esp',
            apellidos='User',
            tipo_usuario='ESPECIALISTA',
            estado='ACTIVO',
        )
        return Especialista.objects.create(
            id_usuario=user,
            especialidad='Oftalmologia',
            registro_profesional=f'RP-{username}',
            activo=True,
        )

    def test_delete_especialista_without_dependencies(self):
        esp = self._create_especialista('esp.nodeps')
        res = self.client.delete(f'/api/especialistas/{esp.id_especialista}')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_especialista_with_citas_returns_409(self):
        esp = self._create_especialista('esp.withcita')
        paciente = Paciente.objects.create(
            nombres='Pac',
            apellidos='Uno',
            documento_identidad='CI-ESP-409',
            fecha_nacimiento='1990-01-01',
            sexo='M',
        )
        inicio = timezone.now() + timedelta(days=2)
        Cita.objects.create(
            id_paciente=paciente,
            id_especialista=esp,
            fecha_hora_inicio=inicio,
            fecha_hora_fin=inicio + timedelta(minutes=30),
            motivo='Control',
            estado='PROGRAMADA',
            registrado_por=self.admin,
        )

        res = self.client.delete(f'/api/especialistas/{esp.id_especialista}')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('error', res.data)
