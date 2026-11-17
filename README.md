# Bitácora de control de mercancía

Aplicación full-stack para registrar recepciones de mercancía, consultar órdenes de compra y dar seguimiento al ingreso de las entradas en el ERP.

## Funcionalidades

### Frontend

- Inicio de sesión con mensaje de bienvenida y redirección automática.
- Barra de navegación con acceso a Dashboard, Usuarios, Informes y Catálogos, nombre de usuario y cierre de sesión.
- Administración de usuarios con tabla, registro, edición, activación/desactivación y eliminación de cuentas.
- Dashboard con métricas del mes: total de entradas, entradas pendientes e ingresadas al ERP, con filtro por fecha.
- Tabla de entradas con filtro por rango de fechas y acceso al mes actual.
- Catálogos administrables de proveedores (NIT y razón social) y productos, con alta, edición y activación/desactivación.
- Búsqueda de proveedores por NIT o razón social al registrar y editar una entrada.
- Registro de recepciones con un proveedor seleccionado y múltiples productos, cada uno con su propia cantidad.
- Edición de entradas desde una página dedicada; al guardar, confirma el cambio y vuelve al dashboard.
- Eliminación con confirmación antes de ejecutar la acción.
- Datos de cada entrada: fecha, proveedor, productos y cantidades, hora, orden de compra, estado ERP y observaciones.
- Mensajes de éxito, error y confirmación con SweetAlert2.
- Modo de prueba con datos de ejemplo persistidos en el almacenamiento local del navegador (`localStorage`).
- En modo de prueba, las contraseñas de usuarios se derivan con PBKDF2 antes de guardarse en `localStorage`.
- Interfaz adaptable a móviles basada en CSS Grid y utilidades de Tailwind CSS.

### Backend

- API REST desarrollada con NestJS, con prefijo `/api`.
- Inicio de sesión con generación de JWT.
- CRUD de usuarios con contraseñas protegidas mediante scrypt y respuestas que no exponen hashes.
- Endpoints de entradas para crear, listar, consultar, actualizar y eliminar registros.
- Endpoints para consultar y administrar los catálogos de proveedores y productos.
- Endpoint de resumen para las métricas del dashboard.
- Validación de datos de entrada con DTOs y `class-validator`.
- Protección de las rutas de entradas y dashboard con autenticación JWT.
- Persistencia con TypeORM y MySQL.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Frontend | Angular 18, TypeScript, Ionic 9, Tailwind CSS 3.4, RxJS, SweetAlert2 |
| Backend | NestJS 12, TypeScript, Passport, JWT, `class-validator` |
| Base de datos | MySQL, TypeORM, `mysql2` |
| Comunicación | API REST sobre HTTP/JSON |

## Estructura del proyecto

```text
bitacora/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── components/navbar/ # Navegación y sesión del usuario
│       │   ├── guards/            # Protección de rutas
│       │   ├── interceptors/
│       │   ├── models/
│       │   ├── pages/
│       │   │   ├── bitacora/       # Registro de una entrada con varios productos
│       │   │   ├── catalogs/       # Administración de proveedores y productos
│       │   │   ├── dashboard/      # Resumen, filtros y tabla CRUD
│       │   │   ├── edit-entry/     # Edición de una entrada
│       │   │   ├── login/          # Inicio de sesión
│       │   │   ├── reports/        # Espacio inicial para informes
│       │   │   ├── user-form/      # Alta y edición de usuarios
│       │   │   └── users/          # Tabla de usuarios
│       │   └── services/           # API, autenticación y datos mock
│       └── environments/
├── backend/
│   └── src/
│       ├── auth/                   # Login, contraseñas y estrategia JWT
│       ├── dashboard/              # Métricas
│       ├── catalogs/               # Catálogos de proveedores y productos
│       ├── entries/                # Entradas con múltiples líneas de producto
│       └── users/                  # CRUD de usuarios
└── README.md
```

## Requisitos

- Node.js 22.22.3+, 24.15.0+ o 26+, y npm. Las versiones compatibles están declaradas en `backend/package.json`.
- Para ejecutar el backend con persistencia, una instancia de MySQL.

## Ejecutar el frontend en modo de prueba

El entorno de desarrollo tiene `useMockData: true`. En este modo, el login y los CRUD de entradas y usuarios usan datos locales y no requieren que el backend o MySQL estén activos.

Credenciales de prueba:

- Usuario: `admin`
- Contraseña: `123456`

Desde una terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

Los cambios de las entradas, usuarios y catálogos mock se guardan en `localStorage` con las claves `bitacora.mock.entries`, `bitacora.mock.users`, `bitacora.mock.suppliers` y `bitacora.mock.products`. Para volver a cargar los datos de muestra, elimina la clave correspondiente desde las herramientas de desarrollo del navegador y recarga la página.

## Ejecutar el backend con MySQL

1. Crea una base de datos llamada `bitacora` en MySQL.
2. Desde una terminal, instala las dependencias y copia el archivo de entorno de ejemplo:

```bash
cd backend
npm install
copy .env.example .env
```

3. Ajusta las credenciales de base de datos y el secreto JWT en `backend/.env`.
4. Inicia el servidor:

```bash
npm run start:dev
```

La API se ejecuta en `http://localhost:3000/api`.

Variables esperadas en `backend/.env`:

```env
PORT=3000
JWT_SECRET=bitacora-secret
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=bitacora
DB_SYNCHRONIZE=true
```

> `DB_SYNCHRONIZE=true` permite a TypeORM sincronizar el esquema automáticamente durante el desarrollo. Para producción, se recomienda usar migraciones y desactivar la sincronización automática.

Si la tabla de usuarios está vacía, el backend crea una cuenta inicial: `admin` / `123456`. Las contraseñas de cuentas nuevas se almacenan derivadas con scrypt; el hash no forma parte de las respuestas de la API.

## Usar el frontend con la API real

Para que el frontend use el backend, establece `useMockData: false` en el entorno que vayas a ejecutar y configura `apiUrl` para que apunte al servidor, por ejemplo `http://localhost:3000/api`. La configuración de producción tiene el modo mock desactivado; reemplaza la URL de ejemplo por la dirección real de tu API antes de desplegar.

## Rutas del frontend

| Ruta | Pantalla |
| --- | --- |
| `/login` | Inicio de sesión |
| `/dashboard` | Dashboard y gestión de entradas |
| `/usuarios` | Lista y gestión de usuarios |
| `/usuarios/nuevo` | Registro de usuario |
| `/usuarios/editar/:id` | Edición de usuario |
| `/informes` | Espacio inicial para informes |
| `/catalogos` | Administración de proveedores y productos |
| `/bitacora` | Registro de una nueva entrada |
| `/editar/:id` | Edición de una entrada existente |

## Endpoints principales

Las rutas protegidas requieren el token JWT en el encabezado `Authorization: Bearer <token>`.

| Método | Endpoint | Acción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener JWT |
| `GET` | `/api/users` | Listar usuarios |
| `GET` | `/api/users/:id` | Consultar un usuario |
| `POST` | `/api/users` | Registrar un usuario |
| `PATCH` | `/api/users/:id` | Actualizar un usuario |
| `DELETE` | `/api/users/:id` | Eliminar un usuario |
| `GET` | `/api/dashboard` | Obtener las métricas del mes |
| `GET` | `/api/entries` | Listar entradas |
| `GET` | `/api/entries/:id` | Consultar una entrada |
| `POST` | `/api/entries` | Registrar una entrada |
| `PATCH` | `/api/entries/:id` | Actualizar una entrada |
| `DELETE` | `/api/entries/:id` | Eliminar una entrada |
| `GET` | `/api/entries/verify-po/:ordenCompra` | Consultar una orden de compra |
| `GET` | `/api/catalogs/suppliers` | Listar proveedores |
| `POST` | `/api/catalogs/suppliers` | Crear proveedor con NIT y razón social |
| `PATCH` | `/api/catalogs/suppliers/:id` | Editar o activar/desactivar proveedor |
| `GET` | `/api/catalogs/products` | Listar productos |
| `POST` | `/api/catalogs/products` | Crear producto |
| `PATCH` | `/api/catalogs/products/:id` | Editar o activar/desactivar producto |
