# NEXT STEPS

Lista priorizada de los siguientes pasos a realizar en el proyecto Oftalmología SI1.

## Inmediato
- [ ] Levantar Docker (`docker-compose up --build`) y verificar migraciones sin errores.
- [ ] Regenerar entorno backend para instalar `drf-spectacular` y validar `/api/docs/` + `/api/schema/`.
- [ ] Ejecutar migraciones nuevas de dominio clínico (`pacientes`, `especialistas`, `citas`, `consultas`) y validar constraints de horarios/solapamiento.
- [ ] Ejecutar seed: `docker-compose exec backend python manage.py seed` (o `docker compose` según tu CLI).
- [x] Ejecutar seed clínico base: `docker compose exec backend python manage.py seed --only clinica`.
- [x] Ejecutar seed consultas demo: `docker compose exec backend python manage.py seed --only consultas-demo`.
- [x] Cliente Next: interceptar 401 → intentar `POST /api/auth/token/refresh/` con refresh guardado; solo si falla, limpiar sesión y mandar a `/login`.
- [ ] Probar flujo de trabajo con `orchestrator` + agentes especialistas en casos reales (backend/frontend/arquitectura/review/testing).
- [ ] Probar tareas VS Code (`Run Task`) para validar comandos rápidos en entorno real.
- [ ] Validar que runtime/agente que uses interpreta correctamente frontmatter en `.agents/agents/*.md`.
- [ ] Probar routing del `orchestrator` con casos que deban escalar a `architect-planner` e `infra`.

## Corto Plazo
- [x] Frontend: conectar módulos clínicos al backend nuevo (pacientes, especialistas, horarios, citas, agenda, consulta) en versión base operativa.
- [x] Frontend: formularios base para programar/reprogramar/cancelar cita con feedback de error API.
- [x] Frontend + API: flujo «olvidé contraseña» con código por correo (`/forgot-password`, MailHog en dev); TTL configurable, renovación de vigencia al verificar código, avisos UI tipo «info».
- [x] Frontend: Login contra API real; tokens en localStorage; Axios + Bearer; logout API.
- [x] Frontend: Guard de rutas `/dashboard/*` (redirección si no hay access token).
- [x] Frontend: Bitácora conectada a `GET /api/bitacora/` (paginación y filtros).
- [x] Frontend: Listados IAM (usuarios, roles, permisos) contra API.
- [ ] Frontend: Formularios y acciones de escritura IAM (crear/editar usuario, roles, etc.) según endpoints y permisos.
- [x] Frontend: Módulo de gestión de Pacientes (tabla, alta, edición, eliminación, filtros y búsqueda).

## Mediano Plazo
- [x] Dashboard KPI inicial (`/dashboard/kpi`) con endpoints agregados backend (`/api/kpi/summary`, `/api/kpi/operativo`) y diseño responsivo.
- [x] KPI avanzado: filtros por rango de fechas, drilldown por estado y snapshot cacheado en backend.
- [x] KPI pro: paginación de drilldown, export CSV y presets rápidos de período.
- [ ] Frontend: Endurecer UX de Citas (picker de fecha/hora mejorado, mensajes por campo, estados avanzados y confirmación contextual).
- [ ] Frontend: Módulo de Historias Clínicas (rutas anidadas bajo historial; diagnósticos, recetas, etc.).
- [ ] Frontend: Mejorar módulo de Especialistas/Disponibilidades con edición inline y validaciones de conflictos por bloque.
- [ ] Revisión seguridad sesión: cookies http-only / CSRF si el despliegue lo exige.

## Largo Plazo
- [ ] Reportes y estadísticas (citas por período, pacientes por estado, etc.).
- [ ] Manejo de imágenes oftalmológicas (storage local o S3).
- [ ] Despliegue en nube (VM/VPS con Nginx reverso y volúmenes Docker).

## Pendientes Técnicos
- [x] Bloqueo temporal configurable por intentos fallidos de login (clave de login; ADMIN edita umbrales).
- [x] Permisos granulares expuestos en backend (`apps.permisos`); frontend ya distingue 403 en listados IAM/bitácora.
- [ ] Política explícita en UI: qué ve cada rol (ocultar rutas o deshabilitar acciones según permisos del JWT o `/api/auth/me/`).
- [ ] Evaluar paginación y filtros avanzados en listas grandes de dominio clínico.
- [ ] Estandarizar plantilla para nuevos agentes en `.agents/agents/` (scope, guardrails, output contract).
