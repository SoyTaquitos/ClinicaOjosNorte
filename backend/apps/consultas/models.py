"""
apps/consultas/models.py
Dominio de consultas médicas oftalmológicas.

  ConsultaMedica: evento central que cierra el ciclo clínico.
  Vincula una Cita (programada) con la HistoriaClinica del paciente,
  registrando lo ocurrido durante la atención: motivo, observaciones,
  diagnóstico e indicaciones.

  Al crear una ConsultaMedica, la Cita asociada pasa automáticamente
  al estado ATENDIDA.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone


class ConsultaMedica(models.Model):
    """
    Registro de la atención médica realizada durante una cita.
    Una Cita genera como máximo una ConsultaMedica (OneToOne).
    """
    id_consulta = models.BigAutoField(primary_key=True)

    id_cita = models.OneToOneField(
        'citas.Cita',
        on_delete=models.PROTECT,
        db_column='id_cita',
        related_name='consulta',
        help_text='Cita que originó esta consulta médica.',
    )
    id_historia_clinica = models.ForeignKey(
        'historial_clinico.HistoriaClinica',
        on_delete=models.CASCADE,
        db_column='id_historia_clinica',
        related_name='consultas',
    )
    id_especialista = models.ForeignKey(
        'especialistas.Especialista',
        on_delete=models.PROTECT,
        db_column='id_especialista',
        related_name='consultas',
    )
    fecha_consulta = models.DateTimeField(default=timezone.now)
    motivo_consulta = models.TextField()
    observaciones = models.TextField(blank=True, null=True)
    diagnostico = models.TextField(blank=True, null=True)
    indicaciones = models.TextField(blank=True, null=True)
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        db_column='registrado_por',
        related_name='consultas_registradas',
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultas_medicas'
        verbose_name = 'Consulta Médica'
        verbose_name_plural = 'Consultas Médicas'
        ordering = ['-fecha_consulta']

    def __str__(self):
        return (
            f'Consulta #{self.id_consulta} — '
            f'{self.id_historia_clinica.id_paciente} '
            f'[{self.fecha_consulta:%Y-%m-%d}]'
        )
