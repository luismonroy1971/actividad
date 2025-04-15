# Aplicación de Gestión de Actividades Pro-Fondos

Aplicación web para la gestión completa de actividades pro-fondos, incluyendo administración de actividades, opciones, pedidos, clientes y usuarios.

## Descripción General

Esta aplicación permite gestionar actividades para recaudación de fondos, con un sistema completo que incluye:

- Gestión de actividades y sus opciones
- Sistema de pedidos para clientes
- Panel de administración
- Área de cliente para seguimiento de pedidos
- Gestión de usuarios y permisos

## Tecnologías Utilizadas

### Backend
- **Node.js** con **Express**: Framework para el servidor
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Encriptación de contraseñas

### Frontend
- **React**: Biblioteca para interfaces de usuario
- **Redux Toolkit**: Gestión de estado
- **React Router**: Navegación
- **Tailwind CSS**: Framework de estilos
- **Vite**: Herramienta de construcción
- **Axios**: Cliente HTTP

## Estructura del Proyecto

El proyecto sigue una arquitectura MERN (MongoDB, Express, React, Node.js) con una clara separación entre backend y frontend.

### Estructura de Directorios

```
/
├── backend/                # Servidor Express
│   ├── config/            # Configuración (DB, etc.)
│   ├── controllers/       # Controladores de la API
│   ├── middleware/        # Middleware personalizado
│   ├── models/            # Modelos de Mongoose
│   ├── routes/            # Rutas de la API
│   └── server.js          # Punto de entrada del servidor
│
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Layouts de la aplicación
│   │   ├── pages/         # Páginas por rol (admin, cliente, público)
│   │   ├── store/         # Estado global con Redux
│   │   └── App.jsx        # Componente principal
│   └── ...
│
├── uploads/               # Archivos subidos (imágenes, etc.)
└── scripts/               # Scripts de utilidad
```

## Características Principales

### Gestión de Actividades
- Creación, edición y eliminación de actividades
- Asignación de opciones a cada actividad
- Seguimiento de gastos por actividad

### Sistema de Pedidos
- Creación de pedidos por parte de clientes
- Selección de opciones y cantidades
- Diferentes estados de pedido (pendiente, confirmado, completado, cancelado)
- Historial de pedidos para clientes

### Panel de Administración
- Dashboard con estadísticas
- Gestión de usuarios y permisos
- Administración de clientes
- Control de pedidos y cambios de estado

### Área de Cliente
- Registro y login de clientes
- Perfil de usuario editable
- Historial y seguimiento de pedidos

## Modelos de Datos

### Usuario
- Administración de usuarios del sistema
- Roles y permisos

### Cliente
- Información de clientes que realizan pedidos
- Datos de contacto y dirección

### Actividad
- Eventos o actividades para recaudación
- Fechas, ubicación, descripción

### Opción
- Opciones disponibles para cada actividad
- Precios y detalles

### Pedido
- Registro de pedidos realizados
- Relación con cliente, actividad y opciones seleccionadas
- Estados y seguimiento

## Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- MongoDB
- npm o yarn

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=tu_conexion_mongodb
JWT_SECRET=tu_clave_secreta
```

### Instalación

1. **Clonar el repositorio e instalar dependencias**

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del frontend
cd frontend
npm install
```

2. **Ejecutar en desarrollo**

```bash
# Ejecutar backend y frontend concurrentemente
npm run dev

# O ejecutar por separado
npm run server  # Solo backend
npm run client  # Solo frontend
```

3. **Construir para producción**

```bash
# Construir el frontend
cd frontend
npm run build

# Ejecutar en producción (desde la raíz)
npm start
```

## Uso de la API

La API REST está disponible en `/api` con los siguientes endpoints principales:

- `/api/usuarios`: Gestión de usuarios
- `/api/actividades`: Gestión de actividades
- `/api/opciones`: Gestión de opciones
- `/api/clientes`: Gestión de clientes
- `/api/pedidos`: Gestión de pedidos

## Flujo de Trabajo

1. **Administrador**: Crea actividades y opciones disponibles
2. **Cliente**: Se registra, explora actividades y realiza pedidos
3. **Administrador**: Gestiona los pedidos, actualiza estados
4. **Cliente**: Sigue el estado de sus pedidos

## Contribución

Para contribuir al proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

ISC - Ver archivo LICENSE para más detalles.