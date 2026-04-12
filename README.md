# Oftalmología SI1 — Clínica de Ojos Norte

Sistema de Información para la Gestión de Consultas, Citas e Historial para la Clínica de Ojos Norte.

## Stack Tecnológico

| Capa          | Tecnología              | Puerto Dev |
| ------------- | ----------------------- | ---------- |
| Backend       | Django 5 + DRF          | :8000      |
| Frontend      | Next.js 14 (App Router) | :3000      |
| Base de Datos | PostgreSQL 16           | :5432      |
| Email (dev)   | Mailhog                 | :8025      |
| Contenedores  | Docker + Docker Compose | —          |

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git
- (Opcional) Python 3.12+, Node.js 20+ — solo si quieres desarrollo sin Docker

## Setup Rápido

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd Oftalmologia-SI1

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores reales (contraseñas y secret key)

# 3. Construir y levantar los contenedores
docker-compose up --build

# 4. Generar y aplicar migraciones (primera vez o al modificar modelos)
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# 5. Poblar base de datos (crea superusuario 'admin', roles, permisos y tipos de cita)
docker-compose exec backend python manage.py seed
```

## Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/
- **Mailhog (emails dev):** http://localhost:8025

## Estructura del Proyecto

```
Oftalmologia-SI1/
├── backend/          # Django + DRF (API REST)
├── frontend/         # Next.js (Panel web administrativo)
├── docs/             # Documentación del proyecto
├── docker-compose.yml
├── .env.example
└── README.md
```

## Módulos del Sistema

| Módulo            | Descripción                                                     |
| ----------------- | --------------------------------------------------------------- |
| Usuarios          | Gestión de acceso (Admin, Administrativo, Médico, Especialista) |
| Pacientes         | Registro y administración de datos de pacientes                 |
| Especialistas     | Perfil y disponibilidad horaria de médicos                      |
| Citas             | Programación, confirmación, cancelación y reprogramación        |
| Consultas Médicas | Registro de la atención (motivo, diagnóstico, indicaciones)     |
| Historial Clínico | Antecedentes, diagnósticos, tratamientos, evoluciones, recetas  |
| Bitácora          | Registro de auditoría de acciones del sistema                   |

## Comandos Esenciales Backend

```bash
# Levantar todos los servicios
docker compose up

# Levantar solo backend + base de datos
docker compose up backend db

# Ver logs en tiempo real
docker compose logs -f backend

# Parar servicios
docker compose down

# Reconstruir después de cambios en requirements
docker compose up -d --build
```

```bash
# Crear nuevas migraciones (tras cambiar models.py)
docker compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker compose exec backend python manage.py migrate

# Ver estado de migraciones
docker compose exec backend python manage.py showmigrations

# Poblar datos iniciales (admin, roles, permisos, tipos de cita)
docker compose exec backend python manage.py seed

# Abrir shell de Django
docker compose exec backend python manage.py shell

# Recolectar archivos estáticos
docker compose exec backend python manage.py collectstatic --noinput
```

## Licencia

Proyecto académico — Uso educativo. Clínica de Ojos Norte.
