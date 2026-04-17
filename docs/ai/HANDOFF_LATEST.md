# HANDOFF LATEST

*Sincronización de documentación con el código en repo.*

## Fecha
2026-04-17

## Resumen
1. **Olvidé contraseña (código por correo):** backend envía código numérico (MailHog/SMTP); `verify-code` + `confirm` con `email` + `codigo`; TTL/longitud por env (`PASSWORD_RESET_CODE_TTL_SECONDS`, `PASSWORD_RESET_CODE_LENGTH`). Migración `users.0004_alter_tokenrecuperacion_token` (quita `unique` en `token`). Frontend: `/forgot-password`, enlace desde login.
2. **Bloqueo temporal por login:** backend cuenta intentos fallidos por clave de login (no por IP); 429 + `retry_after_seconds`; config `max_intentos_fallidos` / `minutos_bloqueo` editable por ADMIN en `GET/PATCH /api/security/login-config/` y página `/dashboard/seguridad-login`. Migración `users.0003_login_lockout_security`.
3. **Auth + API en frontend:** login contra Django vía proxy `/api/*`; tokens JWT en localStorage; Axios con interceptor; guard de dashboard por token; logout con endpoint de revocación cuando hay refresh. Cambio de contraseña con sesión: `POST /api/auth/change-password/`, página `/dashboard/contrasena` y enlace en el menú usuario del navbar.
4. **Panel IAM:** rutas `/dashboard/usuarios`, `/roles`, `/permisos` con tablas paginadas contra `GET /api/users/`, `/api/roles/`, `/api/permisos/`.
5. **Bitácora:** `/dashboard/bitacora` ya usa **`GET /api/bitacora/`** (sin mock); filtros, orden y paginación servidor; UI en hora Bolivia.
6. **Infra Next:** `next.config.js` — `rewrites` hacia base interna (`INTERNAL_API_URL` en Docker compose → `backend:8000`); `output: 'standalone'` para imagen Docker.
7. **Seed:** comando `manage.py seed` unificado con `--only admin|roles|permisos`; seeders en `backend/seeders/`.
8. **`config/urls.py`:** API montada en `path('api/', …)` incluyendo `permisos` y demás apps listadas en `api_patterns`.

## Contexto anterior (sigue válido)
- `BaseDeDatos.sql`, modelo SI1 (sin paciente como usuario), `consultas_medicas`, timezone Bolivia — ver `CURRENT_STATE.md` y `DECISIONS_LOG.md` registros previos.

## Próximos pasos sugeridos
- Implementar refresh automático de access token antes de forzar logout.
- Completar flujos de escritura IAM desde el panel (alineados a permisos backend).
- Extender frontend a módulos clínicos (pacientes, citas, consultas) según prioridad del producto.
