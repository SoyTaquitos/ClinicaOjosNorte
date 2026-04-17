# DECISIONS LOG

Este archivo documenta todas las decisiones técnicas arquitectónicas importantes tomadas en la evolución del proyecto.

## Formato de Registro
- **Fecha:** YYYY-MM-DD
- **Decisión:** Resumen de la decisión técnica.
- **Motivo:** ¿Por qué se tomó y qué alternativas se consideraron?
- **Impacto:** ¿Qué consecuencias operativas o de código implica?

---

### Registro 9

**Fecha:** 2026-04-17
**Decisión:** Nueva app **`apps.security`** (`label=oftalmologia_security`) con modelos `ConfiguracionLoginSeguridad`, `BloqueoIntentoLogin`, `TokenRecuperacion` (mismos `db_table`), más `login_lockout.py`, `tokens.py`, `emails.py` y admin asociado. **`apps.users`** reduce a `Usuario` + CRUD + managers. Migración **`security.0001_initial`** con `SeparateDatabaseAndState` (solo estado); **`users.0005`** elimina esos modelos del estado de `users` sin `DROP TABLE`.
**Motivo:** Menos ruido en la app de usuario; agrupar políticas de acceso y recuperación en un módulo coherente.
**Impacto:** Imports actualizados en `apps.auth`; orden `INSTALLED_APPS`: `users` → `security` → `auth`.

### Registro 8

**Fecha:** 2026-04-17
**Decisión:** Extraer autenticación HTTP a la app Django **`apps.auth`** (paquete `apps/auth/` con submódulos `views/login.py`, `logout.py`, `profile.py`, `password_change.py`, `password_reset.py`, `security.py` + `serializers.py` + `urls.py`). `apps.users` conserva modelos (`Usuario`, recuperación, bloqueo login), `tokens.py`, `emails.py`, `login_lockout.py` y solo el **ViewSet** de usuarios. `INSTALLED_APPS`: `apps.auth` con `AppConfig.label = 'oftalmologia_auth'` para no colisionar con `django.contrib.auth`.
**Motivo:** Modularidad por responsabilidad; `users` dejaba de ser solo “dominio usuario”.
**Impacto:** `config/urls.py` incluye `apps.auth.urls` antes de `apps.users.urls`. Rutas `/api/auth/*` y `/api/security/login-config` sin cambio de path.

### Registro 7

**Fecha:** 2026-04-17
**Decisión:** Recuperación de contraseña por **código numérico** enviado por correo (MailHog/SMTP), con vigencia **`PASSWORD_RESET_CODE_TTL_SECONDS`** (por defecto 30 s, acotado 10–3600 s en código) y longitud **`PASSWORD_RESET_CODE_LENGTH`** (4–12 dígitos). Flujo API: `POST /api/auth/reset-password/` → `POST .../verify-code/` → `POST .../confirm/` con `email` + `codigo` + nueva contraseña. Se quitó `unique` global en `tokens_recuperacion.token` para permitir el mismo patrón numérico en distintos usuarios (búsqueda por usuario + código).
**Motivo:** Pedido de producto: verificación tipo OTP en pantalla dedicada (`/forgot-password`) sin depender de enlaces con token largo.
**Impacto:** Migración `users.0004_alter_tokenrecuperacion_token`; variables nuevas en `.env.example`; **breaking** para clientes que usaban `POST .../confirm/` solo con campo `token` — ahora requieren `email` y `codigo`.

### Registro 6

**Fecha:** 2026-04-16
**Decisión:** Bloqueo temporal por **clave de login** (email normalizado en minúsculas o username sin `@`) con umbrales en BD editables solo por **ADMIN** (`ConfiguracionLoginSeguridad` + `BloqueoIntentoLogin`); sin librería externa.
**Motivo:** Cumplir requisito de bloqueo tras intentos fallidos y duración configurable desde el panel; la fuente de verdad debe ser el backend (no el navegador). Se descartó bloqueo por IP para alinear con el alcance acordado.
**Impacto:** `LoginView` devuelve **429** con `retry_after_seconds`; `GET/PATCH /api/security/login-config/`; página `/dashboard/seguridad-login`; login UI muestra cuenta atrás. No altera el campo `estado=BLOQUEADO` administrativo del usuario.

### Registro 5

**Fecha:** 2026-04-15
**Decisión:** Proxy de API en Next.js (`rewrites` `/api/*` → Django) y JWT en cliente vía localStorage + Axios.
**Motivo:** El navegador llama al mismo origen (`/api/...`); el servidor Next reenvía a la URL interna del backend (en Docker `http://backend:8000/api` vía `INTERNAL_API_URL`), evitando CORS y simplificando dev. Los tokens se adjuntan en el cliente con interceptor estándar.
**Impacto:**
- `frontend/next.config.js`: `internalApiBase()`, rewrites, `output: 'standalone'`.
- `frontend/src/lib/auth.ts`, `api.ts`: persistencia access/refresh, logout con body `refresh`.
- Login y páginas dashboard consumen API real (IAM + bitácora).

### Registro 4

**Fecha:** 2026-03-30
**Decisión:** Zona horaria de negocio Bolivia (`America/La_Paz`) y documentación del esquema en `BaseDeDatos.sql`.
**Motivo:** El software lo usa personal en Santa Cruz / Bolivia; la hora mostrada debe ser coherente (UTC-4). El archivo DBML debía reflejar SI1 + `consultas_medicas` y la eliminación de `pacientes.id_usuario`.
**Impacto:**
- Django: `TIME_ZONE = 'America/La_Paz'` en `settings.py`.
- Frontend: utilidades en `frontend/src/lib/timezone.ts` y UI de bitácora/dashboard usando `Intl` con `America/La_Paz`.
- `BaseDeDatos.sql`: tabla `consultas_medicas`, `tipo_usuario` sin PACIENTE, `pacientes` sin FK a usuarios.

### Registro 3

**Fecha:** 2026-03-30
**Decisión:** Bitácora en frontend como página dedicada (`/dashboard/bitacora`) con datos mock hasta conectar API.
**Motivo:** La bitácora es crítica para auditoría; se necesita vista operativa con hora Bolivia antes del cableado JWT completo.
**Impacto:** Nueva ruta en App Router; Sidebar ya enlazaba a `/dashboard/bitacora`.

**Actualización 2026-04-15:** La página consume `GET /api/bitacora/` con autenticación JWT; se mantiene el criterio de hora Bolivia en UI.

---

### Registro 2

**Fecha:** 2026-03-29
**Decisión:** Adaptación del proyecto Si2 al modelo SI1 — eliminar paciente como actor del sistema y eliminar la app mobile.
**Motivo:** El SI1 es un Sistema de Información/Gestión de uso exclusivo del personal interno. Los pacientes son entidades de datos, no usuarios. No existe interfaz móvil.
**Impacto:**
- `TipoUsuario.PACIENTE` eliminado del enum.
- FK `pacientes.id_usuario` eliminada del modelo y su migración (`0002_initial.py`) borrada.
- `RegisterView` (registro público) y `RegistroSerializer` eliminados.
- Endpoint `POST /auth/register/` removido de URLs.
- Rol 'Paciente' eliminado del seeder.
- Carpeta `/mobile` eliminada del monorepo.


**Fecha:** 2026-03-21
**Decisión:** Purga intensiva (Lienzo en Blanco) para Frontend Web, App Mobile y Backend en el Scaffold inicial.
**Motivo:** Evitar arrastrar configuraciones boilerplate basuras o vistas dummy de ejemplo que limiten o confundan el stack real a construir paso a paso. Se optó por un control hiper-granular por el Arquitecto Humano en el ecosistema multiplataforma (Web + Mobile).
**Impacto:** El Backend tiene comentadas sus `LOCAL_APPS`. El Frontend Web es un cascarón Next.js limpio. La app Mobile Flutter fue inicializada pero espera sus directivas de ui/theming. Todo se construirá bajo demanda estricta.
