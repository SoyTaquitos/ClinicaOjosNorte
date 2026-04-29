# CURRENT STATE

## Estado actual del proyecto
**Oftalmología SI1 — Clínica de Ojos Norte.** Backend Django + frontend Next.js (panel web IAM y auditoría). Modelo SI1: paciente = datos sin login; sin app móvil; sin registro público.

## Backend
- **TIME_ZONE:** `America/La_Paz` (Bolivia, UTC-4, sin horario de verano). Las fechas se almacenan en UTC (`USE_TZ = True`).
- **Usuario:** tipos `ADMIN`, `ADMINISTRATIVO`, `MEDICO`, `ESPECIALISTA` (sin `PACIENTE`).
- **Bloqueo temporal por login:** tras N intentos fallidos con la misma clave (email en minúsculas o username tal cual), el login devuelve **429** con `retry_after_seconds`. Umbrales en BD: `configuracion_login_seguridad` (fila única); estado por clave en `bloqueo_intento_login`. **Solo ADMIN:** `GET/PATCH /api/security/login-config/`. Panel: `/dashboard/seguridad-login`. Independiente del estado manual `BLOQUEADO` del usuario.
- **Paciente:** sin FK a `usuarios`.
- **Consultas médicas:** `apps.consultas` — `consultas_medicas` (OneToOne con `citas`, FK a `pacientes` y `especialistas`); al crear consulta, la cita pasa a `ATENDIDA`.
- **Fix backend consultas (2026-04-29):** corregida validación en `ConsultaMedicaSerializer.validate` para comparar objetos FK correctamente (`id_paciente`/`id_especialista`) y evitar `KeyError: 'id_paciente_id'` al registrar consulta.
- **API bajo** `/api/` (sin prefijo `v1` en `config/urls.py`). Incluye `apps.core`, **`apps.auth`**, **`apps.security`**, **`apps.users`**, `roles`, `permisos`, `bitacora`, `pacientes`, `especialistas`, `citas`, `consultas`.
- **Documentacion API (OpenAPI):**
  - `GET /api/schema/` (spec OpenAPI)
  - `GET /api/docs/` (Swagger UI)
  - `GET /api/redoc/` (ReDoc)
  - Implementado con `drf-spectacular`.
- **Nuevos endpoints clínicos (backend):**
  - `pacientes`: CRUD `GET/POST /api/pacientes`, `GET/PATCH/DELETE /api/pacientes/{id}`.
  - `especialistas`: CRUD `GET/POST /api/especialistas`, `GET/PATCH/DELETE /api/especialistas/{id}`.
  - `horarios`: CRUD `GET/POST /api/horarios-especialista`, `GET/PATCH/DELETE /api/horarios-especialista/{id}`.
  - `citas`: CRUD base + acciones `POST /api/citas/{id}/reprogramar`, `POST /api/citas/{id}/cancelar`.
  - `agenda`: `GET /api/agenda-medica` (solo lectura por rol médico/admin).
  - `consultas`: CRUD `GET/POST /api/consultas-medicas`.
- **Bitácora:** `GET /api/bitacora/` (lectura; permisos según rol); escritura desde el backend en operaciones que registren eventos.
- **Seed unificado:** `python manage.py seed` en `apps/core/management/commands/seed.py` — ejecuta `seeders.seed_admin`, `seeders.seed_roles`, `seeders.seed_permisos`, `seeders.seed_clinica`, `seeders.seed_consultas_demo`. Opción `--only admin|roles|permisos|clinica|consultas-demo`.
- **Seeder clínico (`--only clinica`):** crea datos base idempotentes para demo (usuarios clínicos, especialistas, pacientes, horarios y cita futura).
- **Seeder consultas demo (`--only consultas-demo`):** crea consultas médicas idempotentes a partir de citas `PROGRAMADA/CONFIRMADA` y marca esas citas como `ATENDIDA`.
- **Robustez seed consultas demo:** si ya no hay citas `PROGRAMADA/CONFIRMADA`, el seeder genera una cita futura mínima con datos clínicos existentes y luego crea la consulta demo (evita fallar el `seed` completo).
- **Recuperación de contraseña:** `POST /api/auth/reset-password/` (email) envía correo con código numérico; `POST /api/auth/reset-password/verify-code/` (`email`, `codigo`); `POST /api/auth/reset-password/confirm/` (`email`, `codigo`, `password_nuevo`, `password_nuevo2`). TTL y longitud: `PASSWORD_RESET_CODE_TTL_SECONDS` (por defecto **180 s**, ~3 min), `PASSWORD_RESET_CODE_LENGTH` en `settings`/`.env`. Tras **verify-code** válido, el backend **renueva `expira_en`** del mismo token para que confirmar no falle por tiempo consumido entre pasos. Correo vía `EMAIL_HOST` (p. ej. MailHog `mailhog:1025` en Docker).

## Frontend (Next.js)
- **Proxy API:** `next.config.js` reescribe `/api/:path*` → base interna (`INTERNAL_API_URL` o `NEXT_PUBLIC_API_URL` o `http://localhost:8000/api`) para evitar CORS en desarrollo y en Docker (servidor Next → `http://backend:8000/api`).
- **Auth:** Login (`/login`) hace `POST /api/auth/login/` con body `{ login, password }`; guarda `access` y `refresh` en **localStorage** (`src/lib/auth.ts`). Cliente Axios (`src/lib/api.ts`) adjunta `Authorization: Bearer` y ante **401** intenta `POST /api/auth/token/refresh/`; si renueva, reintenta la solicitud original; si falla, limpia sesión y redirige a `/login`. Logout llama `POST /api/auth/logout/` con refresh cuando existe.
- **Dashboard:** `layout.tsx` redirige a `/login` si no hay access token en cliente.
- **Rutas panel:** `/dashboard` (panel), `/dashboard/usuarios`, `/dashboard/roles`, `/dashboard/permisos`, `/dashboard/seguridad-login` (solo menú si `tipo_usuario === 'ADMIN'`), `/dashboard/contrasena` (cambio de contraseña con sesión; enlace en menú usuario del navbar), `/dashboard/bitacora`, `/dashboard/pacientes`, `/dashboard/especialistas`, `/dashboard/citas`, `/dashboard/agenda-medica`, `/dashboard/consultas`.
- **Dashboard KPI (frontend):** nueva ruta `/dashboard/kpi` totalmente responsiva (desktop/tablet/mobile) con tarjetas estratégicas, tabla de estados mensuales, operativo diario por especialista y alertas.
- **Módulo Pacientes (frontend):** ruta `/dashboard/pacientes` conectada a `/api/pacientes` con listado paginado, búsqueda, filtros (`sexo`, `activo`), alta, edición y eliminación; feedback visual y diseño alineado a tokens de paleta violeta.
- **Módulo Especialistas + Horarios (frontend):** ruta `/dashboard/especialistas` conectada a `/api/especialistas` y `/api/horarios-especialista` con alta y eliminación base.
- **Módulo Citas (frontend):** ruta `/dashboard/citas` conectada a `/api/citas` con programación y acciones `cancelar`/`reprogramar`.
- **Módulo Agenda médica (frontend):** ruta `/dashboard/agenda-medica` en modo lectura contra `/api/agenda-medica`.
- **Módulo Consultas médicas (frontend):** ruta `/dashboard/consultas` conectada a `/api/consultas-medicas` para registrar consulta y listar historial.
- **Endpoints KPI (backend):**
  - `GET /api/kpi/summary` (headline mensual + distribución de estados + datos tácticos).
  - `GET /api/kpi/operativo` (métricas de hoy + carga por especialista + alertas operativas).
  - `GET /api/kpi/citas-drilldown` (detalle de citas por estado, filtrable por rango de fechas).
- **KPI filtros y cache:** `summary` y `operativo` aceptan `date_from` y `date_to` (`YYYY-MM-DD`) y usan snapshot cacheado (TTL 5 minutos) para reducir carga de consultas repetidas.
- **KPI drilldown avanzado:** `GET /api/kpi/citas-drilldown` ahora soporta paginación (`page`, `page_size`) y estado; nuevo `GET /api/kpi/citas-drilldown/export` para descarga CSV del detalle filtrado.
- **KPI UX filtros rápidos:** frontend `/dashboard/kpi` incluye presets de período (`Hoy`, `7d`, `30d`, `Mes`) + filtros personalizados por fecha.
- **Login:** respuesta **429** por bloqueo temporal; UI muestra cuenta atrás aproximada (`retry_after_seconds`).
- **IAM (listados):** páginas consumen API paginada: `GET /api/users/`, `GET /api/roles/`, `GET /api/permisos/`; manejo de 403 con mensaje al usuario.
- **Bitácora:** datos reales vía `GET /api/bitacora/` con filtros, orden, búsqueda y paginación; KPIs y horas en **Bolivia** (`src/lib/timezone.ts`, `America/La_Paz`, locale `es-BO`).
- **Landing** pública (`/`), **login** y **`/forgot-password`** (flujo en 3 pasos: correo → código → nueva contraseña) con UI alineada al login.

## Esquema de base de datos (referencia)
El archivo **`BaseDeDatos.sql`** (DBML para dbdiagram.io) debe mantenerse alineado con SI1:
- `tipo_usuario` sin `PACIENTE`.
- Tabla `pacientes` **sin** `id_usuario`.
- Tabla **`consultas_medicas`** y relaciones con `citas`, `historias_clinicas`, `especialistas`, `usuarios` (`registrado_por`).

## Apps Django (resumen)
| App | Rol |
|-----|-----|
| `apps.core` | health, comando `seed` |
| `apps.users` | modelo `Usuario` (AUTH_USER_MODEL), CRUD `/api/users/` |
| `apps.security` | bloqueo por intentos de login, config umbral, tokens recuperación contraseña |
| `apps.auth` | login, logout, JWT, `/auth/me`, reset password, `security/login-config` |
| `apps.roles`, `apps.permisos` | RBAC |
| `apps.bitacora` | auditoría |
| `apps.pacientes` | Paciente |
| `apps.especialistas` | Especialista |
| `apps.historial_clinico` + subapps | historia clínica |
| `apps.citas` | citas, tipos, disponibilidades |
| `apps.consultas` | ConsultaMedica |

## Pendientes inmediatos
- Formularios IAM en frontend: alta/edición usuarios, asignación roles, edición catálogo permisos (si aplica a la API).
- CRUD frontend dominio clínico: pacientes, especialistas/horarios, citas, agenda, consultas (base implementada); falta endurecer UX/validaciones de escritura y nombres enriquecidos en tablas.
- Endurecer almacenamiento de sesión (p. ej. cookies **http-only**) si se exige para producción.
- Módulo reportes (fuera de alcance corto según decisión previa).

## Sistema de agentes local (`.agents/agents`)
- Se definió un **agente principal `orchestrator`** para enrutar solicitudes a especialistas por dominio.
- Agentes especialistas creados: `backend`, `frontend`, `architecture`, `architect-planner`, `code-review`, `qa-testing`, `infra`.
- Cada agente tiene prompt operativo dedicado en `.agents/agents/*.md` con alcance, reglas y entregables.
- `orchestrator` contempla invocación de skills (`caveman`, `deploy-to-vercel`, `find-skills` cuando disponible) según tipo de solicitud.
- Registro índice: `.agents/agents/README.md`.
- Formato adoptado: **híbrido** (frontmatter machine-readable + cuerpo detallado de operación) para compatibilidad con runners de agentes y legibilidad humana.

## Setup VS Code (`.vscode/`)
- Se agregó `.vscode/settings.json` para flujo consistente en equipo (PowerShell, format on save, exclusiones de búsqueda/archivos, pestañas persistentes).
- Se agregó `.vscode/tasks.json` con tareas operativas rápidas: abrir docs/ai clave, `docker compose up --build`, `migrate`, `seed`, `git status`.
- Objetivo: reducir pasos manuales y estandarizar ejecución del flujo agente-first.

---
*(Actualizado: 2026-04-29)*
