# NEXT STEPS

Lista priorizada de los siguientes pasos a realizar en el proyecto Oftalmología SI1.

## Inmediato
- [ ] Levantar Docker (`docker-compose up --build`) y verificar que las migraciones corren sin errores.
- [ ] Ejecutar seeders: `docker-compose exec backend python manage.py seed`
- [ ] Conectar `/dashboard/bitacora` a `GET /api/bitacora/` (JWT + permisos admin/administrativo).

## Corto Plazo
- [x] Frontend: Login y dashboard con sidebar + navbar (hecho; falta auth real con API).
- [ ] Frontend: Auth Provider, almacenamiento de tokens, guards de ruta.
- [ ] Frontend: Módulo de gestión de Pacientes (tabla, alta, edición).

## Mediano Plazo
- [ ] Frontend: Módulo de Citas (agenda, confirmación, cancelación, reprogramación).
- [ ] Frontend: Módulo de Historias Clínicas (anamnesis, diagnósticos, tratamientos, recetas).
- [ ] Frontend: Módulo de Especialistas y disponibilidades.
- [ ] Frontend: Gestión de Usuarios y Roles (solo Admin).

## Largo Plazo
- [ ] Reportes y estadísticas (citas por período, pacientes por estado, etc.).
- [ ] Manejo de imágenes oftalmológicas (storage local o S3).
- [ ] Despliegue en Servidores Nube (VM/VPS con Nginx invertido y volúmenes Docker remotos).

## Pendientes Técnicos
- Definir política de permisos granulares por rol para el frontend.
- Evaluar necesidad de paginación y filtros avanzados en listas grandes.
