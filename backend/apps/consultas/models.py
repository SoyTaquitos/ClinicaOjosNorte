from django.conf import settings
from django.db import models
from django.utils import timezone


class ConsultaMedica(models.Model):
    id_consulta = models.BigAutoField(primary_key=True)
    id_cita = models.OneToOneField(
        'citas.Cita',
        on_delete=models.PROTECT,
        db_column='id_cita',
        related_name='consulta_medica',
    )
    id_paciente = models.ForeignKey(
        'pacientes.Paciente',
        on_delete=models.PROTECT,
        db_column='id_paciente',
        related_name='consultas_medicas',
    )
    id_especialista = models.ForeignKey(
        'especialistas.Especialista',
        on_delete=models.PROTECT,
        db_column='id_especialista',
        related_name='consultas_medicas',
    )
    motivo_consulta = models.TextField()
    anamnesis = models.TextField(blank=True, null=True)
    hallazgos = models.TextField(blank=True, null=True)
    diagnostico = models.TextField()
    plan_tratamiento = models.TextField(blank=True, null=True)
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='registrado_por',
        related_name='consultas_registradas',
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultas_medicas'
        ordering = ['-fecha_creacion']
