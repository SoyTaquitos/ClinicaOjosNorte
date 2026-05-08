# HANDOFF LATEST

*Sincronización de documentación con el código en repo.*

## Fecha
2026-05-07

## Resumen
1. **Citas UX refinado (Fase 1):** `/dashboard/citas` reemplaza `window.prompt` por modales de cancelación y reprogramación con campos explícitos (fecha, hora, motivo).
2. **Hardening post-review:** se añadió protección contra doble envío en confirmar cancelar/reprogramar, validación de fecha/hora inválida y mínimo de caracteres en motivo.
3. **Accesibilidad + feedback:** modales con `ESC`, foco inicial, trampa de foco, atributos ARIA y mensajes inline por campo.
4. **Control por rol transversal en módulos clínicos (UI):** política reusable con `canWriteModule` aplicada en `Pacientes`, `Especialistas/Horarios`, `Citas` y `Consultas`.
5. **Matriz actual de escritura:**
   - `pacientes`, `especialistas`, `citas` => `ADMIN`, `ADMINISTRATIVO`
   - `consultas` => `ADMIN`, `MEDICO`, `ESPECIALISTA`
6. **Visibilidad de rutas en Sidebar por rol:** integración de `canViewRoute` para ocultar navegación no permitida según perfil.
7. **Guardas de lectura por URL directa:** validación de vista aplicada en `agenda-medica`, `pacientes`, `especialistas`, `citas`, `consultas` y `kpi`.
8. **Tabla de citas enriquecida:** visualización de paciente y especialista por nombre (fallback a ID si no está en caché local).
9. **Permisos efectivos en frontend (fase 1):** `DashboardUserContext` carga `permissionCodes` y `authorization.ts` usa esos códigos para evaluar vista/escritura con fallback por rol cuando no hay datos.
10. **Permisos efectivos en backend (fase 2):** nuevo endpoint `GET /api/auth/permissions` para devolver permisos/roles de la sesión en una sola llamada.
11. **Validación técnica Docker:** `docker compose up -d --build`, `makemigrations`, `migrate`, `seed` y `manage.py check` ejecutados OK.
12. **Cierre de hallazgo RBAC:** agregado seeder `rbac` para `rol_permiso` + `usuario_rol` y revalidado endpoint `/api/auth/permissions/` con respuesta no vacía por usuario.
13. **Refactor frontend RBAC:** `DashboardUserContext` elimina fallback legacy de múltiples endpoints y consume únicamente `/api/auth/permissions` para cargar permisos efectivos.
14. **Permisos clínicos finos:** catálogo backend ampliado con permisos explícitos por módulo clínico y asignaciones RBAC actualizadas por rol.
15. **Enforcement explícito en frontend:** autorización de vista/escritura ahora se basa en códigos concretos (`modulo.accion`) en lugar de matching heurístico.
16. **Validación técnica:** `seed --only permisos`, `seed --only rbac`, verificación de `/api/auth/permissions` y `npm run build` OK.
17. **Política clínica refinada:** se introdujeron roles clínicos dedicados (`Recepción Clínica`, `Médico Clínico`, `Especialista Clínico`) y se reasignaron usuarios seed clínicos para no mezclar privilegios IAM.
18. **Verificación de separación de privilegios:** `dr.carlos` (Médico Clínico) no posee `users.crear`; `dra.andrea` (Especialista Clínico) sí mantiene `consultas.crear`.
19. **Ajuste fino por acción en Citas:** recepción ya no recibe `citas.cancelar`; frontend diferencia permisos de crear/reprogramar/cancelar con controles independientes.
20. **Ajuste de visibilidad estratégica:** roles clínicos médicos/especialistas quedan sin `kpi.ver` por defecto.
21. **Nuevo contrato de diseño para agentes:** se creó `docs/ai/DESIGN.md` para estandarizar diseño por tipo de sistema y salidas esperadas de subagentes UI/UX.
22. **Base de continuidad de skills/prompts UI:** se agregaron `docs/ai/SKILLS_REGISTRY.md` y `docs/ai/PROMPTS_LIBRARY.md` con definición inicial del subagente `design-orchestrator`.
23. **Política de contraseña alfanumérica estricta:** backend ahora exige mayúscula + minúscula + número y bloquea símbolos/espacios en cambio y recuperación de contraseña.
24. **UX alineada en formularios de contraseña:** se actualizaron textos de ayuda en `/dashboard/contrasena` y `/forgot-password` para reflejar la nueva política.
25. **Pruebas backend añadidas:** nuevos tests para política de contraseña, creación de usuario con password válido/inválido y endpoint `GET /api/auth/permissions`.
26. **ESLint frontend estabilizado:** configuración `frontend/.eslintrc.json` evita prompt interactivo en `npm run lint`.
27. **Fix módulo Especialistas (delete):** `DELETE /api/especialistas/{id}` ahora captura `ProtectedError` y devuelve `409` con error funcional cuando existen citas/consultas asociadas.
28. **Cobertura de fix:** nuevos tests en `apps/especialistas/tests/test_delete_especialista.py` validan caso sin dependencias (`204`) y con dependencias (`409`).
29. **UX de recuperación ante `409` en frontend:** en `Pacientes` y `Especialistas`, si falla delete por historial protegido, se ofrece desactivar registro en el mismo flujo.
30. **Nueva acción operacional:** botones `Desactivar` agregados en tablas de pacientes/especialistas (`PATCH activo=false`) para evitar bloqueos de operación por integridad referencial.
31. **Calidad frontend estabilizada:** se corrigieron warnings `react-hooks/exhaustive-deps` en `Citas` y `KPI`; lint queda limpio.
32. **Rename funcional KPI -> Dashboard:** UI ahora usa nombre `Dashboard` (sin palabra KPI), con ruta principal `/dashboard` para analítica y `/dashboard/inicio` para panel rápido administrativo.
33. **Backend modular dashboard:** nueva app `apps.dashboard` con endpoints `/api/dashboard/*` (`summary`, `operativo`, `citas-drilldown`, `export`).
34. **RBAC actualizado:** nuevo permiso `dashboard.ver` agregado en seeders y asignaciones RBAC actualizadas; frontend acepta compatibilidad temporal con `kpi.ver`.
35. **Retiro de legado completado:** se eliminó compatibilidad temporal `kpi.ver`, ruta frontend `/dashboard/kpi`, estilos/archivos KPI y módulo backend legacy `apps.core.kpi_views`.
36. **Hardening API dashboard:** `citas-drilldown` ahora valida `page`/`page_size` como enteros positivos y retorna `400` en parámetros inválidos.
37. **Pruebas dashboard añadidas:** `apps/dashboard/tests/test_dashboard_endpoints.py` cubre rango inválido en `summary`, paginación inválida en `drilldown` y export CSV en `citas-drilldown/export`.
38. **Compose frontend saneado:** `docker-compose.yml` deja de interpolar variables de app en `environment` y delega carga a `env_file`, mitigando warning de `INTERNAL_API_URL` no seteada en shell.
39. **Sidebar simplificado:** removida opción duplicada `Dashboard clínico`; navegación principal queda en `Dashboard` + `Inicio`.
40. **Validación técnica reciente:** `manage.py test apps.dashboard.tests`, `npm run lint` y `npm run build` ejecutados OK.
41. **URL canónica dashboard aplicada:** `/dashboard/dashboard` ahora redirige a `/dashboard`; la vista analítica se mantiene en componente dedicado reutilizable.
42. **Validación frontend tras redirección:** `npm run lint` y `npm run build` nuevamente en verde.
43. **Playwright incorporado para E2E:** se añadió setup mínimo (`@playwright/test`, `playwright.config.ts`, script `test:e2e`) y caso de prueba para ruta legacy dashboard.
44. **E2E dashboard en verde:** `npm run test:e2e` pasa validando que no se conserva `/dashboard/dashboard` como URL final.
45. **Guard de sesión cubierto en E2E:** se agregan pruebas para `/dashboard` sin token (redirige a `/login`) y con token presente (se mantiene en `/dashboard`).
46. **Suite E2E ampliada en verde:** `npm run test:e2e` ejecuta 3 casos y todos pasan.
47. **RBAC navegación E2E:** se suman 2 casos de Sidebar por rol con mocks de `/api/auth/me` y `/api/auth/permissions` (ADMIN ve `Usuarios/Roles/Permisos`; MEDICO no).
48. **Suite E2E actual:** `npm run test:e2e` ejecuta 5 casos y todos pasan.
49. **Refactor de pruebas E2E:** separación en archivos por propósito (`auth-guard.spec.ts` y `rbac-sidebar.spec.ts`) para mejor mantenibilidad.
50. **Validación tras refactor E2E:** suite completa mantiene 5/5 casos en verde.
51. **Seeder dashboard agregado:** nuevo `--only dashboard-demo` para poblar volumen analítico de citas con estados mezclados.
52. **Verificación dashboard post-reset:** `seed --only dashboard-demo` ejecutado OK y endpoints `/api/dashboard/summary`, `/api/dashboard/operativo`, `/api/dashboard/citas-drilldown` y export CSV responden correctamente.

## Resumen previo (sigue válido)
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
