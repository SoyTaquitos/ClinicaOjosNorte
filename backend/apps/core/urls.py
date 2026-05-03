from django.urls import path
from .views import health_check
from .kpi_views import kpi_citas_drilldown, kpi_citas_drilldown_export, kpi_operativo, kpi_summary

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('kpi/summary', kpi_summary, name='kpi-summary'),
    path('kpi/operativo', kpi_operativo, name='kpi-operativo'),
    path('kpi/citas-drilldown', kpi_citas_drilldown, name='kpi-citas-drilldown'),
    path('kpi/citas-drilldown/export', kpi_citas_drilldown_export, name='kpi-citas-drilldown-export'),
]
