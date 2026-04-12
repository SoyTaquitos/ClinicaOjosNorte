from django.contrib import admin

from .models import ConsultaMedica


@admin.register(ConsultaMedica)
class ConsultaMedicaAdmin(admin.ModelAdmin):
    list_display = [
        'id_consulta',
        'get_paciente',
        'id_especialista',
        'fecha_consulta',
        'get_estado_cita',
    ]
    list_filter = ['id_especialista', 'fecha_consulta']
    search_fields = [
        'id_historia_clinica__id_paciente__nombres',
        'id_historia_clinica__id_paciente__apellidos',
        'id_historia_clinica__id_paciente__numero_documento',
        'motivo_consulta',
        'diagnostico',
    ]
    date_hierarchy = 'fecha_consulta'
    ordering = ['-fecha_consulta']
    raw_id_fields = ['id_cita', 'id_historia_clinica', 'id_especialista']

    @admin.display(description='Paciente')
    def get_paciente(self, obj):
        return obj.id_historia_clinica.id_paciente.get_full_name()

    @admin.display(description='Estado Cita')
    def get_estado_cita(self, obj):
        return obj.id_cita.estado
