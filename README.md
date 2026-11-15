# Bitácora de control de mercancía

Aplicación full-stack para registrar recepciones de mercancía, consultar órdenes de compra y dar seguimiento al ingreso de las entradas en el ERP.

## Funcionalidades

### Frontend

- Inicio de sesión con mensaje de bienvenida y redirección automática.
- Dashboard con métricas del mes: total de entradas, proveedor más activo, entradas pendientes y entradas ingresadas al ERP.
- Tabla de entradas con filtro por rango de fechas y acceso al mes actual.
- Registro de una nueva recepción desde una página independiente.
- Edición de entradas desde una página dedicada; al guardar, confirma el cambio y vuelve automáticamente al dashboard después de cinco segundos.
- Eliminación con confirmación antes de ejecutar la acción.
- Datos de cada entrada: fecha, proveedor, producto recibido, cantidad, hora, orden de compra, estado ERP y observaciones.
- Mensajes de éxito, error y confirmación con SweetAlert2.
- Modo de prueba con datos de ejemplo persistidos en el almacenamiento local del navegador (`localStorage`).

### Backend

- API REST desarrollada con NestJS, con prefijo `/api`.
- Inicio de sesión con generación de JWT.
- Endpoints de entradas para crear, listar, consultar, actualizar y eliminar registros.
- Endpoint de resumen para las métricas del dashboard.
- Validación de datos de entrada con DTOs y `class-validator`.
- Protección de las rutas de entradas y dashboard con autenticación JWT.
- Persistencia con TypeORM y MySQL.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Frontend | Angular 18, TypeScript, Ionic 9, RxJS, SweetAlert2 |
| Backend | NestJS 12, TypeScript, Passport, JWT, `class-validator` |
| Base de datos | MySQL, TypeORM, `mysql2` |
| Comunicación | API REST sobre HTTP/JSON |

## Estructura del proyecto

```text
bitacora/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── interceptors/
│       │   ├── models/
│       │   ├── pages/
│       │   │   ├── bitacora/       # Registro de una entrada
│       │   │   ├── dashboard/      # Resumen, filtros y tabla CRUD
│       │   │   ├── edit-entry/     # Edición de una entrada
│       │   │   └── login/          # Inicio de sesión
│       │   └── services/           # API, autenticación y datos mock
│       └── environments/
├── backend/
│   └── src/
│       ├── auth/                   # Login y estrategia JWT
│       ├── dashboard/              # Métricas
│       └── entries/                # CRUD, entidad y DTOs
└── README.md
```

## Requisitos

- Node.js 22 LTS y npm en una versión compatible con las dependencias del backend NestJS 12.
- Para ejecutar el backend con persistencia, una instancia de MySQL.

## Ejecutar el frontend en modo de prueba

El entorno de desarrollo tiene `useMockData: true`. En este modo, el login y el CRUD usan datos locales y no requieren que el backend o MySQL estén activos.

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

Los cambios de las entradas mock se guardan en `localStorage` con la clave `bitacora.mock.entries`. Para volver a cargar la muestra inicial, elimina esa clave desde las herramientas de desarrollo del navegador y recarga la página.

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

El backend de demostración también acepta las credenciales `admin` / `123456`; actualmente el usuario está definido en el servicio de autenticación y no se administra desde una tabla de usuarios.

## Usar el frontend con la API real

Para que el frontend use el backend, establece `useMockData: false` en el entorno que vayas a ejecutar y configura `apiUrl` para que apunte al servidor, por ejemplo `http://localhost:3000/api`. La configuración de producción tiene el modo mock desactivado; reemplaza la URL de ejemplo por la dirección real de tu API antes de desplegar.

## Rutas del frontend

| Ruta | Pantalla |
| --- | --- |
| `/login` | Inicio de sesión |
| `/dashboard` | Dashboard y gestión de entradas |
| `/bitacora` | Registro de una nueva entrada |
| `/editar/:id` | Edición de una entrada existente |

## Endpoints principales

Las rutas protegidas requieren el token JWT en el encabezado `Authorization: Bearer <token>`.

| Método | Endpoint | Acción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener JWT |
| `GET` | `/api/dashboard` | Obtener las métricas del mes |
| `GET` | `/api/entries` | Listar entradas |
| `GET` | `/api/entries/:id` | Consultar una entrada |
| `POST` | `/api/entries` | Registrar una entrada |
| `PATCH` | `/api/entries/:id` | Actualizar una entrada |
| `DELETE` | `/api/entries/:id` | Eliminar una entrada |
| `GET` | `/api/entries/verify-po/:ordenCompra` | Consultar una orden de compra |
