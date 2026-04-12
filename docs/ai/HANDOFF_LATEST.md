# HANDOFF LATEST

*Última sincronización de documentación y esquema de BD.*

## Fecha
2026-03-30

## Resumen
1. **`BaseDeDatos.sql`** actualizado para reflejar el modelo SI1 y el módulo de consultas médicas.
2. **`docs/ai/CURRENT_STATE.md`** reescrito con frontend, timezone Bolivia, bitácora UI y referencia al SQL.
3. Decisiones de timezone y bitácora registradas en **`DECISIONS_LOG.md`**.

## Cambios en `BaseDeDatos.sql`
- Cabecera: proyecto Oftalmología SI1 — Clínica de Ojos Norte; notas SI1 y zona horaria (aplicación).
- **`tipo_usuario`:** eliminado `PACIENTE`; orden explícito con `ADMIN` primero.
- **`usuarios`:** nota aclara que solo hay personal autorizado.
- **`pacientes`:** eliminada columna y relación `id_usuario` → `usuarios`.
- **Nueva tabla `consultas_medicas`:** `id_consulta`, `id_cita` (unique), `id_historia_clinica`, `id_especialista`, campos clínicos, `registrado_por`, auditoría de fechas.
- **Relaciones nuevas:** `consultas_medicas` → `citas`, `historias_clinicas`, `especialistas`, `usuarios`.

## Contexto ya existente (no repetido aquí)
- Implementación Django de `ConsultaMedica`, limpieza Si2→SI1, landing/login/dashboard — ver historial de commits y `CURRENT_STATE.md`.

## Próximos pasos sugeridos
- Integrar `GET /api/bitacora/` en `/dashboard/bitacora` (reemplazar mock).
- Asegurar que eventos de bitácora sigan registrándose en operaciones críticas del backend.
- Revisar que seeds y migraciones coincidan con el esquema documentado.
