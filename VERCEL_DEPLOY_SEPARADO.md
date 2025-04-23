# Guía de Despliegue Separado en Vercel

Esta guía proporciona los pasos necesarios para desplegar por separado el backend y frontend de esta aplicación MERN en Vercel.

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (o cualquier otro proveedor de MongoDB)
- Git instalado en tu máquina local

## Ventajas del Despliegue Separado

- Mayor flexibilidad para escalar cada componente independientemente
- Posibilidad de usar diferentes planes de Vercel para backend y frontend según necesidades
- Separación clara de responsabilidades y dominios
- Facilidad para implementar CI/CD específico para cada componente

## Pasos para el Despliegue

### 1. Preparar los Repositorios

Para un despliegue separado, es recomendable tener dos repositorios distintos:

- **Repositorio Backend**: Contiene solo el código del servidor (carpeta `backend` y `api`)
- **Repositorio Frontend**: Contiene solo el código del cliente (carpeta `frontend`)

Si actualmente tienes un solo repositorio, puedes:

1. Crear dos nuevos repositorios
2. Copiar los archivos correspondientes a cada uno
3. Configurar cada repositorio con su propio `.gitignore` y `package.json`

### 2. Configurar el Backend

#### 2.1 Estructura del Repositorio Backend

Asegúrate de que tu repositorio backend tenga esta estructura básica:

```
/
├── api/
│   └── index.js       # Punto de entrada para Vercel
├── backend/           # Tu código de backend actual
├── package.json       # Dependencias del backend
├── vercel.json        # Configuración para Vercel
└── .env               # Variables de entorno (no incluir en git)
```

#### 2.2 Crear archivo vercel.json para Backend

Crea un archivo `vercel.json` específico para el backend:

```json
{
  "version": 2,
  "buildCommand": "npm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production",
    "MONGO_URI": "@mongo_uri",
    "JWT_SECRET": "@jwt_secret",
    "JWT_EXPIRE": "30d",
    "FILE_UPLOAD_PATH": "./uploads",
    "MAX_FILE_SIZE": "1000000"
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/api/uploads.js"
    }
  ]
}
```

#### 2.3 Configurar CORS en el Backend

Modifica el archivo `api/index.js` para permitir solicitudes desde el dominio del frontend:

```javascript
// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ['https://tu-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

#### 2.4 Configurar Variables de Entorno en Vercel (Backend)

Configura las siguientes variables de entorno en el panel de control de Vercel para el proyecto backend:

| Variable | Descripción |
|----------|-------------|
| `MONGO_URI` | URL de conexión a tu base de datos MongoDB |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT |
| `NODE_ENV` | Debe ser `production` |
| `JWT_EXPIRE` | Tiempo de expiración de los tokens JWT (ej. `30d`) |
| `FILE_UPLOAD_PATH` | Ruta para subir archivos (ej. `./uploads`) |
| `MAX_FILE_SIZE` | Tamaño máximo de archivos en bytes (ej. `1000000`) |

### 3. Configurar el Frontend

#### 3.1 Estructura del Repositorio Frontend

Asegúrate de que tu repositorio frontend tenga esta estructura básica:

```
/
├── public/            # Archivos estáticos
├── src/               # Código fuente
├── index.html         # Archivo HTML principal
├── package.json       # Dependencias del frontend
├── vite.config.js     # Configuración de Vite
└── vercel.json        # Configuración para Vercel
```

#### 3.2 Crear archivo vercel.json para Frontend

Crea un archivo `vercel.json` específico para el frontend:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.+\\.[a-z0-9]+)$",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 3.3 Actualizar las URLs de la API en el Frontend

Modifica las URLs de las peticiones API en tu frontend para que apunten al dominio del backend:

```javascript
// Ejemplo en un archivo de configuración (src/config.js o similar)
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://tu-backend.vercel.app/api'
  : 'http://localhost:5000/api';
```

#### 3.4 Configurar Variables de Entorno en Vercel (Frontend)

Configura las siguientes variables de entorno en el panel de control de Vercel para el proyecto frontend:

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL completa de tu API backend (ej. `https://tu-backend.vercel.app/api`) |

### 4. Desplegar el Backend en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio Git del backend
4. Configura el proyecto:
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: Dejar en blanco
   - **Install Command**: `npm install`
5. En la sección "Environment Variables", añade todas las variables mencionadas anteriormente para el backend
6. Haz clic en "Deploy"

### 5. Desplegar el Frontend en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio Git del frontend
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. En la sección "Environment Variables", añade la variable `VITE_API_URL` con la URL de tu backend
6. Haz clic en "Deploy"

### 6. Configurar Almacenamiento de Archivos

Para manejar correctamente las subidas de archivos en un despliegue separado:

1. **Opción recomendada**: Usa un servicio de almacenamiento en la nube como AWS S3, Cloudinary o Firebase Storage
   - Actualiza la lógica de subida de archivos en tu backend para usar estos servicios
   - Configura las variables de entorno necesarias para la conexión con estos servicios

2. **Alternativa**: Si prefieres seguir usando el sistema de archivos de Vercel:
   - Ten en cuenta que los archivos subidos se perderán en cada nuevo despliegue
   - Esta opción es mejor solo para entornos de desarrollo o demostración

## Verificar el Despliegue

Una vez completados ambos despliegues:

1. Verifica que el backend responda correctamente accediendo a una ruta de API (ej. `https://tu-backend.vercel.app/api/usuarios`)
2. Verifica que el frontend se cargue correctamente y pueda comunicarse con el backend
3. Prueba las funcionalidades principales (registro, inicio de sesión, creación de pedidos, etc.)
4. Comprueba que las imágenes y archivos estáticos se carguen correctamente

## Solución de Problemas

### Problemas con CORS

Si el frontend no puede comunicarse con el backend debido a errores de CORS:

1. Verifica la configuración de CORS en `api/index.js`
2. Asegúrate de que el dominio del frontend esté correctamente incluido en la lista de orígenes permitidos
3. Comprueba que las peticiones incluyan las cabeceras correctas

### Problemas con las Rutas de API

Si las rutas de API no funcionan correctamente:

1. Verifica las rutas en `vercel.json` del backend
2. Asegúrate de que `api/index.js` esté configurado correctamente
3. Revisa los logs de Vercel para identificar errores específicos

### Problemas con la Base de Datos

1. Verifica que la variable `MONGO_URI` esté correctamente configurada
2. Asegúrate de que la IP desde donde se conecta Vercel esté en la lista blanca de MongoDB Atlas
3. Comprueba que el usuario de MongoDB tenga los permisos necesarios

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de despliegue de aplicaciones Express en Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guía de CORS para APIs](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)