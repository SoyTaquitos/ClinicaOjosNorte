"""
apps/patients/models.py
Dominio exclusivo de pacientes.
  - Paciente: datos personales, historia clínica y estado de atención.

Los pacientes NO tienen cuenta de usuario en este sistema.
Son creados y gestionados directamente por el personal administrativo.

Especialistas viven en apps/specialists/models.py
"""
from django.db import models
from django.utils import timezone


class EstadoPaciente(models.TextChoices):
    ACTIVO = 'ACTIVO', 'Activo'
    EN_SEGUIMIENTO = 'EN_SEGUIMIENTO', 'En Seguimiento'
    POSTOPERATORIO = 'POSTOPERATORIO', 'Postoperatorio'
    INACTIVO = 'INACTIVO', 'Inactivo'


class Paciente(models.Model):
    """
    Datos generales del paciente y su estado dentro del proceso de atención.
    Creado y gestionado por el personal administrativo — no tiene acceso al sistema.
    """
    SEXO_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    )

    id_paciente = models.BigAutoField(primary_key=True)
    numero_historia = models.CharField(max_length=30, unique=True)
    tipo_documento = models.CharField(max_length=20)
    numero_documento = models.CharField(max_length=30, unique=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(max_length=120, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    contacto_emergencia_nombre = models.CharField(max_length=150, blank=True, null=True)
    contacto_emergencia_telefono = models.CharField(max_length=30, blank=True, null=True)
    estado_paciente = models.CharField(
        max_length=20, choices=EstadoPaciente.choices, default=EstadoPaciente.ACTIVO
    )
    fecha_registro = models.DateTimeField(default=timezone.now)
    observaciones_generales = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'pacientes'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['apellidos', 'nombres']

    def __str__(self):
        return f'{self.nombres} {self.apellidos} [{self.numero_historia}]'

    def get_full_name(self):
        return f'{self.nombres} {self.apellidos}'
