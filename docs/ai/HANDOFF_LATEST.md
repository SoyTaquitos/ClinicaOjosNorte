# HANDOFF LATEST

*Sincronización de documentación con el código en repo.*

## Fecha
2026-04-17

## Resumen
1. **App `apps.security`:** modelos `ConfiguracionLoginSeguridad`, `BloqueoIntentoLogin`, `TokenRecuperacion` + `login_lockout.py`, `tokens.py`, `emails.py` + admin; `apps.users` queda con `Usuario`, managers, serializers/views de CRUD. Migraciones `security.0001` (estado ORM, sin tocar BD) y `users.0005` (saca esos modelos del estado de `users`). `INSTALLED_APPS`: `users` → `security` → `auth`.
2. **Modularización auth:** nueva app `apps.auth` (vistas en `apps/auth/views/`: login, logout, perfil, reset password, seguridad login); `apps.users` queda en modelo + CRUD usuarios. Rutas API sin cambio de path. `AuthConfig.label = 'oftalmologia_auth'` para no chocar con `django.contrib.auth`.
3. **Olvidé contraseña (código por correo):** backend envía código numérico (MailHog/SMTP); `verify-code` + `confirm` con `email` + `codigo`; TTL/longitud por env (`PASSWORD_RESET_CODE_TTL_SECONDS` default **180 s** (~3 min), `PASSWORD_RESET_CODE_LENGTH`). Tras `verify-code` válido se **renueva** `expira_en` del token. Migración `users.0004_alter_tokenrecuperacion_token` (quita `unique` en `token`). Frontend: `/forgot-password` con avisos tipo info (MailHog) y éxito verde; enlace desde login.
4. **Bloqueo temporal por login:** backend cuenta intentos fallidos por clave de login (no por IP); 429 + `retry_after_seconds`; config `max_intentos_fallidos` / `minutos_bloqueo` editable por ADMIN en `GET/PATCH /api/security/login-config/` y página `/dashboard/seguridad-login`. Migración `users.0003_login_lockout_security`.
5. **Auth + API en frontend:** login contra Django vía proxy `/api/*`; tokens JWT en localStorage; Axios con interceptor; guard de dashboard por token; logout con endpoint de revocación cuando hay refresh. Cambio de contraseña con sesión: `POST /api/auth/change-password/`, página `/dashboard/contrasena` y enlace en el menú usuario del navbar.
6. **Panel IAM:** rutas `/dashboard/usuarios`, `/roles`, `/permisos` con tablas paginadas contra `GET /api/users/`, `/api/roles/`, `/api/permisos/`.
7. **Bitácora:** `/dashboard/bitacora` ya usa **`GET /api/bitacora/`** (sin mock); filtros, orden y paginación servidor; UI en hora Bolivia.
8. **Infra Next:** `next.config.js` — `rewrites` hacia base interna (`INTERNAL_API_URL` en Docker compose → `backend:8000`); `output: 'standalone'` para imagen Docker.
9. **Seed:** comando `manage.py seed` unificado con `--only admin|roles|permisos`; seeders en `backend/seeders/`.
10. **`config/urls.py`:** API montada en `path('api/', …)` incluyendo `permisos` y demás apps listadas en `api_patterns`.

## Contexto anterior (sigue válido)
- `BaseDeDatos.sql`, modelo SI1 (sin paciente como usuario), `consultas_medicas`, timezone Bolivia — ver `CURRENT_STATE.md` y `DECISIONS_LOG.md` registros previos.

## Próximos pasos sugeridos
- Implementar refresh automático de access token antes de forzar logout.
- Completar flujos de escritura IAM desde el panel (alineados a permisos backend).
- Extender frontend a módulos clínicos (pacientes, citas, consultas) según prioridad del producto.
