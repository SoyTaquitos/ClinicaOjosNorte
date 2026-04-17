# CURRENT STATE

## Estado actual del proyecto
**Oftalmología SI1 — Clínica de Ojos Norte.** Backend Django + frontend Next.js (panel web IAM y auditoría). Modelo SI1: paciente = datos sin login; sin app móvil; sin registro público.

## Backend
- **TIME_ZONE:** `America/La_Paz` (Bolivia, UTC-4, sin horario de verano). Las fechas se almacenan en UTC (`USE_TZ = True`).
- **Usuario:** tipos `ADMIN`, `ADMINISTRATIVO`, `MEDICO`, `ESPECIALISTA` (sin `PACIENTE`).
- **Bloqueo temporal por login:** tras N intentos fallidos con la misma clave (email en minúsculas o username tal cual), el login devuelve **429** con `retry_after_seconds`. Umbrales en BD: `configuracion_login_seguridad` (fila única); estado por clave en `bloqueo_intento_login`. **Solo ADMIN:** `GET/PATCH /api/security/login-config/`. Panel: `/dashboard/seguridad-login`. Independiente del estado manual `BLOQUEADO` del usuario.
- **Paciente:** sin FK a `usuarios`.
- **Consultas médicas:** `apps.consultas` — `consultas_medicas` (OneToOne con `citas`, FK a `historias_clinicas` y `especialistas`); al crear consulta, la cita pasa a `ATENDIDA`.
- **API bajo** `/api/` (sin prefijo `v1` en `config/urls.py`). Incluye `apps.core`, `users`, `roles`, `permisos`, `bitacora`.
- **Bitácora:** `GET /api/bitacora/` (lectura; permisos según rol); escritura desde el backend en operaciones que registren eventos.
- **Seed unificado:** `python manage.py seed` en `apps/core/management/commands/seed.py` — ejecuta `seeders.seed_admin`, `seeders.seed_roles`, `seeders.seed_permisos`. Opción `--only admin|roles|permisos`. Variables opcionales: `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRES`, `ADMIN_APELLIDOS`.
- **Recuperación de contraseña:** `POST /api/auth/reset-password/` (email) envía correo con código numérico; `POST /api/auth/reset-password/verify-code/` (`email`, `codigo`); `POST /api/auth/reset-password/confirm/` (`email`, `codigo`, `password_nuevo`, `password_nuevo2`). TTL y longitud: `PASSWORD_RESET_CODE_TTL_SECONDS`, `PASSWORD_RESET_CODE_LENGTH` en `settings`/`.env`. Correo vía `EMAIL_HOST` (p. ej. MailHog `mailhog:1025` en Docker).

## Frontend (Next.js)
- **Proxy API:** `next.config.js` reescribe `/api/:path*` → base interna (`INTERNAL_API_URL` o `NEXT_PUBLIC_API_URL` o `http://localhost:8000/api`) para evitar CORS en desarrollo y en Docker (servidor Next → `http://backend:8000/api`).
- **Auth:** Login (`/login`) hace `POST /api/auth/login/` con body `{ login, password }`; guarda `access` y `refresh` en **localStorage** (`src/lib/auth.ts`). Cliente Axios (`src/lib/api.ts`) adjunta `Authorization: Bearer` y ante **401** limpia tokens y redirige a `/login`. Logout llama `POST /api/auth/logout/` con refresh cuando existe.
- **Dashboard:** `layout.tsx` redirige a `/login` si no hay access token en cliente.
- **Rutas panel:** `/dashboard` (panel), `/dashboard/usuarios`, `/dashboard/roles`, `/dashboard/permisos`, `/dashboard/seguridad-login` (solo menú si `tipo_usuario === 'ADMIN'`), `/dashboard/contrasena` (cambio de contraseña con sesión; enlace en menú usuario del navbar), `/dashboard/bitacora`. Sidebar + navbar; estilos compartidos IAM en `iam.module.css`.
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
| `apps.users` | Usuario, auth JWT, TokenRecuperacion |
| `apps.roles`, `apps.permisos` | RBAC |
| `apps.bitacora` | auditoría |
| `apps.pacientes` | Paciente |
| `apps.especialistas` | Especialista |
| `apps.historial_clinico` + subapps | historia clínica |
| `apps.citas` | citas, tipos, disponibilidades |
| `apps.consultas` | ConsultaMedica |

## Pendientes inmediatos
- Flujo **refresh token** en el cliente (hoy 401 → logout directo; no reintenta con `/api/auth/token/refresh/`).
- Formularios IAM en frontend: alta/edición usuarios, asignación roles, edición catálogo permisos (si aplica a la API).
- CRUD frontend dominio clínico: pacientes, citas, consultas, historias (listados/detalle según prioridad).
- Endurecer almacenamiento de sesión (p. ej. cookies **http-only**) si se exige para producción.
- Módulo reportes (fuera de alcance corto según decisión previa).

---
*(Actualizado: 2026-04-17)*
