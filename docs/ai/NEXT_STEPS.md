# NEXT STEPS

Lista priorizada de los siguientes pasos a realizar en el proyecto Oftalmología SI1.

## Inmediato
- [ ] Levantar Docker (`docker-compose up --build`) y verificar migraciones sin errores.
- [ ] Ejecutar seed: `docker-compose exec backend python manage.py seed` (o `docker compose` según tu CLI).
- [ ] Cliente Next: interceptar 401 → intentar `POST /api/auth/token/refresh/` con refresh guardado; solo si falla, limpiar sesión y mandar a `/login`.

## Corto Plazo
- [x] Frontend + API: flujo «olvidé contraseña» con código por correo (`/forgot-password`, MailHog en dev); TTL configurable, renovación de vigencia al verificar código, avisos UI tipo «info».
- [x] Frontend: Login contra API real; tokens en localStorage; Axios + Bearer; logout API.
- [x] Frontend: Guard de rutas `/dashboard/*` (redirección si no hay access token).
- [x] Frontend: Bitácora conectada a `GET /api/bitacora/` (paginación y filtros).
- [x] Frontend: Listados IAM (usuarios, roles, permisos) contra API.
- [ ] Frontend: Formularios y acciones de escritura IAM (crear/editar usuario, roles, etc.) según endpoints y permisos.
- [ ] Frontend: Módulo de gestión de Pacientes (tabla, alta, edición).

## Mediano Plazo
- [ ] Frontend: Módulo de Citas (agenda, confirmación, cancelación, reprogramación).
- [ ] Frontend: Módulo de Historias Clínicas (rutas anidadas bajo historial; diagnósticos, recetas, etc.).
- [ ] Frontend: Módulo de Especialistas y disponibilidades.
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
