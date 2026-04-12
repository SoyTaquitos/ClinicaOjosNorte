# CURRENT STATE

## Estado actual del proyecto
**Oftalmología SI1 — Clínica de Ojos Norte.** Backend Django + frontend Next.js (panel web). Modelo SI1: paciente = datos sin login; sin app móvil; sin registro público.

## Backend
- **TIME_ZONE:** `America/La_Paz` (Bolivia, UTC-4, sin horario de verano). Las fechas se almacenan en UTC (`USE_TZ = True`).
- **Usuario:** tipos `ADMIN`, `ADMINISTRATIVO`, `MEDICO`, `ESPECIALISTA` (sin `PACIENTE`).
- **Paciente:** sin FK a `usuarios`.
- **Consultas médicas:** `apps.consultas` — `consultas_medicas` (OneToOne con `citas`, FK a `historias_clinicas` y `especialistas`); al crear consulta, la cita pasa a `ATENDIDA`.
- **Bitácora:** `GET /api/bitacora/` (solo lectura, admin/administrativo); escritura desde el sistema.

## Frontend (Next.js)
- **Landing** pública (`/`) con paleta violeta, navbar, secciones informativas, ilustración fundoscopia (SVG).
- **Login** (`/login`) con animaciones; demo local `admin@clinica.com` / `admin123` → `/dashboard`.
- **Dashboard** con sidebar (colapsable / hamburguesa móvil) + navbar superior.
- **Bitácora** (`/dashboard/bitacora`): tabla, filtros, paginación, KPIs; **todas las marcas de hora mostradas en hora Bolivia** vía `src/lib/timezone.ts` (`America/La_Paz`, locale `es-BO`).
- **Responsive:** landing, login, dashboard y bitácora ajustados para escritorio y móvil.

## Esquema de base de datos (referencia)
El archivo **`BaseDeDatos.sql`** (DBML para dbdiagram.io) está alineado con SI1:
- `tipo_usuario` sin `PACIENTE`.
- Tabla `pacientes` **sin** `id_usuario`.
- Tabla **`consultas_medicas`** y relaciones con `citas`, `historias_clinicas`, `especialistas`, `usuarios` (`registrado_por`).

## Apps Django (resumen)
| App | Rol |
|-----|-----|
| `apps.core` | permisos, health |
| `apps.users` | Usuario, TokenRecuperacion |
| `apps.roles`, `apps.permisos` | RBAC |
| `apps.bitacora` | auditoría |
| `apps.pacientes` | Paciente |
| `apps.especialistas` | Especialista |
| `apps.historial_clinico` + subapps | historia, antecedentes, diagnósticos, etc. |
| `apps.citas` | citas, tipos, disponibilidades |
| `apps.consultas` | ConsultaMedica |

## Pendientes inmediatos
- Conectar la página de bitácora (y demás módulos) a la API real con JWT.
- CRUD frontend: pacientes, citas, consultas, etc.
- Módulo reportes (fuera de alcance actual según decisión previa).

---
*(Actualizado: 2026-03-30)*
