# DECISIONS LOG

Este archivo documenta todas las decisiones técnicas arquitectónicas importantes tomadas en la evolución del proyecto.

## Formato de Registro
- **Fecha:** YYYY-MM-DD
- **Decisión:** Resumen de la decisión técnica.
- **Motivo:** ¿Por qué se tomó y qué alternativas se consideraron?
- **Impacto:** ¿Qué consecuencias operativas o de código implica?

---

---

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
