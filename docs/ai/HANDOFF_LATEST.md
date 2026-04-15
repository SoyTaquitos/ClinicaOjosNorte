# HANDOFF LATEST

*Sincronización de documentación con el código en repo.*

## Fecha
2026-04-15

## Resumen
1. **Auth + API en frontend:** login contra Django vía proxy `/api/*`; tokens JWT en localStorage; Axios con interceptor; guard de dashboard por token; logout con endpoint de revocación cuando hay refresh.
2. **Panel IAM:** rutas `/dashboard/usuarios`, `/roles`, `/permisos` con tablas paginadas contra `GET /api/users/`, `/api/roles/`, `/api/permisos/`.
3. **Bitácora:** `/dashboard/bitacora` ya usa **`GET /api/bitacora/`** (sin mock); filtros, orden y paginación servidor; UI en hora Bolivia.
4. **Infra Next:** `next.config.js` — `rewrites` hacia base interna (`INTERNAL_API_URL` en Docker compose → `backend:8000`); `output: 'standalone'` para imagen Docker.
5. **Seed:** comando `manage.py seed` unificado con `--only admin|roles|permisos`; seeders en `backend/seeders/`.
6. **`config/urls.py`:** API montada en `path('api/', …)` incluyendo `permisos` y demás apps listadas en `api_patterns`.

## Contexto anterior (sigue válido)
- `BaseDeDatos.sql`, modelo SI1 (sin paciente como usuario), `consultas_medicas`, timezone Bolivia — ver `CURRENT_STATE.md` y `DECISIONS_LOG.md` registros previos.

## Próximos pasos sugeridos
- Implementar refresh automático de access token antes de forzar logout.
- Completar flujos de escritura IAM desde el panel (alineados a permisos backend).
- Extender frontend a módulos clínicos (pacientes, citas, consultas) según prioridad del producto.
