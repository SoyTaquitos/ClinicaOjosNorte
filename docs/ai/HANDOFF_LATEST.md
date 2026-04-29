# HANDOFF LATEST

*Sincronización de documentación con el código en repo.*

## Fecha
2026-04-29

## Resumen
1. **KPI pro implementado:** drilldown con paginación (`page/page_size`) + export CSV (`/api/kpi/citas-drilldown/export`).
2. **UX de análisis acelerada:** presets rápidos de período (`Hoy`, `7d`, `30d`, `Mes`) en `/dashboard/kpi`.
3. **Integración completa frontend-backend:** filtros/presets afectan `summary`, `operativo` y `drilldown` de forma consistente.
4. **Validación técnica:** `manage.py check` y `npm run build` OK.

## Resumen previo (sigue válido)
1. **KPI con filtros y drilldown:** `/dashboard/kpi` ahora permite filtrar por rango (`date_from/date_to`) y abrir detalle de citas por estado.
2. **Nuevo endpoint de detalle:** `GET /api/kpi/citas-drilldown` para listado de citas (estado, paciente, especialista, fecha).
3. **Performance backend:** `kpi/summary` y `kpi/operativo` usan snapshot cacheado (TTL 5 min).
4. **Validación:** `python manage.py check` y `npm run build` ejecutados OK tras mejoras.

## Resumen previo (sigue válido)
1. **Dashboard KPI implementado end-to-end:** backend + frontend con ruta `/dashboard/kpi` y diseño totalmente responsivo.
2. **API KPI agregada:** `GET /api/kpi/summary` (mensual) y `GET /api/kpi/operativo` (diario), con indicadores estratégicos/tácticos/operativos.
3. **Navegación actualizada:** Sidebar incorpora acceso a KPI.
4. **Validación técnica:** `python manage.py check` y `npm run build` ejecutados con éxito tras cambios.

## Resumen previo (sigue válido)
1. **Fix de seeding global:** `seed_consultas_demo` ya no rompe `manage.py seed` cuando no hay citas `PROGRAMADA/CONFIRMADA`.
2. **Fallback automático:** en ese caso crea una cita futura mínima (si existen datos de `clinica`) y luego registra la consulta demo.
3. **Validación:** `docker compose exec backend python manage.py seed` ejecutado OK tras fix.

## Resumen previo (sigue válido)
1. **Seeder de consultas demo agregado:** nuevo `seeders.seed_consultas_demo` integrado en `manage.py seed` con `--only consultas-demo`.
2. **Flujo clínico semilla completo:** el seeder crea consulta sobre cita existente y actualiza automáticamente estado de cita a `ATENDIDA`.
3. **Validación de ejecución:** `docker compose exec backend python manage.py seed --only consultas-demo` ejecutado con éxito (`1 creado, 0 existentes`).

## Resumen previo (sigue válido)
1. **Nuevos seeders clínicos:** agregado `seeders.seed_clinica` e integrado al comando `manage.py seed` con opción `--only clinica`.
2. **Datos demo de dominio:** el seeder clínico crea registros idempotentes de usuarios clínicos, especialistas, pacientes, horarios y una cita futura.
3. **Validación de ejecución:** `docker compose exec backend python manage.py seed --only clinica` ejecutado con éxito (`10 creados, 0 existentes`).

## Resumen previo (sigue válido)
1. **Fix crítico en registro de consultas:** corregido `apps/consultas/serializers.py` para evitar error 500 (`KeyError: 'id_paciente_id'`) durante `POST /api/consultas-medicas`.
2. **Validación alineada a DRF ModelSerializer:** ahora se compara `attrs['id_paciente'].id_paciente` y `attrs['id_especialista'].id_especialista` contra la cita.
3. **Verificación backend:** `python manage.py check` ejecutado sin errores.

## Resumen previo (sigue válido)
1. **Plan por fases implementado (frontend clínico):** módulos base activos para `pacientes`, `especialistas`, `horarios`, `citas`, `agenda-medica` y `consultas-medicas`.
2. **Refresh automático de sesión:** interceptor Axios ahora intenta `POST /api/auth/token/refresh/` en 401 y reintenta la request original; solo cierra sesión si refrescar falla.
3. **Navegación clínica ampliada:** Sidebar incorpora accesos a `/dashboard/especialistas`, `/dashboard/citas`, `/dashboard/agenda-medica` y `/dashboard/consultas`.
4. **UI consistente de módulos clínicos:** nuevo estilo compartido `dashboard/clinic.module.css` (hero, toolbar, tabla, feedback), alineado a la paleta/tokens actuales.
5. **Validación técnica:** `npm run build` exitoso con nuevas rutas generadas en Next.js.

## Resumen previo (sigue válido)
1. **Swagger/OpenAPI habilitado:** se integró `drf-spectacular` en backend para documentar endpoints automáticamente.
2. **Nuevas rutas docs:** `/api/schema/` (OpenAPI), `/api/docs/` (Swagger UI), `/api/redoc/` (ReDoc).
3. **Configuración DRF:** `DEFAULT_SCHEMA_CLASS` activado y metadata base (`TITLE`, `VERSION`, `DESCRIPTION`) definida en `SPECTACULAR_SETTINGS`.
4. **Dependencias:** `drf-spectacular` agregado en `backend/requirements/base.txt`.

## Resumen previo (sigue válido)
1. **Backend clínico implementado:** nuevas apps `apps.pacientes`, `apps.especialistas`, `apps.citas`, `apps.consultas` con modelos, serializers, viewsets, rutas y migraciones iniciales.
2. **Pacientes:** CRUD completo para registrar, editar y gestionar directorio (`/api/pacientes`).
3. **Especialistas y horarios:** CRUD de especialistas (`/api/especialistas`) y horarios por bloque (`/api/horarios-especialista`) con validación de bloque.
4. **Citas y agenda:** programación de citas con control de disponibilidad/solapamiento + acciones de negocio `reprogramar` y `cancelar`; agenda médica de lectura (`/api/agenda-medica`).
5. **Consulta médica:** registro de consulta vinculada a cita (`/api/consultas-medicas`) con transición automática de estado de cita a `ATENDIDA`.
6. **Integración de proyecto:** `config/settings.py` y `config/urls.py` actualizados para registrar módulos clínicos nuevos bajo `/api/`.

## Resumen previo (sigue válido)
1. **Sistema de agentes local:** se creó estructura en `.agents/agents/` con prompts dedicados para `orchestrator`, `backend`, `frontend`, `architecture`, `code-review` y `qa-testing`.
2. **Orquestación por dominio:** `orchestrator` ahora define reglas explícitas de enrutamiento por tipo de tarea (API/DB, UI/UX, arquitectura, revisión, pruebas) y consolidación de salida.
3. **Integración con skills:** `orchestrator` documenta uso de skills disponibles (`caveman`, `deploy-to-vercel`, `find-skills`) cuando corresponde por intención del usuario.
4. **Registro de agentes:** nuevo índice `.agents/agents/README.md` para descubrimiento y flujo de ejecución.
5. **Setup VS Code:** añadidos `.vscode/settings.json` y `.vscode/tasks.json` para estandarizar entorno local y comandos recurrentes del proyecto.
6. **Formato híbrido de agentes:** todos los prompts en `.agents/agents/*.md` ahora incluyen frontmatter (`name`, `description`, `tools`, `triggers`, `output_schema`) + cuerpo técnico detallado.
7. **Nuevos agentes:** agregados `architect-planner` (planificación arquitectónica por fases) e `infra` (Docker/entornos/deploy) en formato híbrido y registrados en `.agents/agents/README.md`.

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
- Validar uso operativo de `orchestrator` como punto único de entrada para tareas multi-dominio.
