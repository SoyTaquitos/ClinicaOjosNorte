# Generated manually — apps.consultas 0001_initial

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('citas', '0002_initial'),
        ('especialistas', '0002_initial'),
        ('historial_clinico', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ConsultaMedica',
            fields=[
                ('id_consulta', models.BigAutoField(primary_key=True, serialize=False)),
                (
                    'id_cita',
                    models.OneToOneField(
                        db_column='id_cita',
                        help_text='Cita que originó esta consulta médica.',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='consulta',
                        to='citas.cita',
                    ),
                ),
                (
                    'id_historia_clinica',
                    models.ForeignKey(
                        db_column='id_historia_clinica',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='consultas',
                        to='historial_clinico.historiaclinica',
                    ),
                ),
                (
                    'id_especialista',
                    models.ForeignKey(
                        db_column='id_especialista',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='consultas',
                        to='especialistas.especialista',
                    ),
                ),
                (
                    'registrado_por',
                    models.ForeignKey(
                        blank=True,
                        db_column='registrado_por',
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='consultas_registradas',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ('fecha_consulta', models.DateTimeField(default=django.utils.timezone.now)),
                ('motivo_consulta', models.TextField()),
                ('observaciones', models.TextField(blank=True, null=True)),
                ('diagnostico', models.TextField(blank=True, null=True)),
                ('indicaciones', models.TextField(blank=True, null=True)),
                ('fecha_creacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Consulta Médica',
                'verbose_name_plural': 'Consultas Médicas',
                'db_table': 'consultas_medicas',
                'ordering': ['-fecha_consulta'],
            },
        ),
    ]
