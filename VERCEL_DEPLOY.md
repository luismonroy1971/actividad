# Guía de Despliegue en Vercel

Esta guía proporciona los pasos necesarios para desplegar correctamente esta aplicación MERN en Vercel.

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (o cualquier otro proveedor de MongoDB)
- Git instalado en tu máquina local

## Pasos para el Despliegue

### 1. Preparar el Repositorio

- Asegúrate de que todos los cambios estén confirmados en tu repositorio Git
- Los archivos de configuración (`vercel.json`, `api/index.js`) ya han sido actualizados para el despliegue

### 2. Configurar Variables de Entorno en Vercel

Antes de desplegar, necesitas configurar las siguientes variables de entorno en el panel de control de Vercel:

| Variable | Descripción |
|----------|-------------|
| `MONGO_URI` | URL de conexión a tu base de datos MongoDB |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT |
| `NODE_ENV` | Debe ser `production` |
| `JWT_EXPIRE` | Tiempo de expiración de los tokens JWT (ej. `30d`) |
| `FILE_UPLOAD_PATH` | Ruta para subir archivos (ej. `./uploads`) |
| `MAX_FILE_SIZE` | Tamaño máximo de archivos en bytes (ej. `1000000`) |

### 3. Desplegar en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio Git
4. Configura el proyecto:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`
5. En la sección "Environment Variables", añade todas las variables mencionadas anteriormente
6. Haz clic en "Deploy"

### 4. Configurar Almacenamiento de Archivos

Para manejar correctamente las subidas de archivos en Vercel:

1. Considera usar un servicio de almacenamiento en la nube como AWS S3, Cloudinary o Firebase Storage
2. Actualiza la lógica de subida de archivos en tu aplicación para usar estos servicios
3. Alternativamente, puedes usar el sistema de archivos de Vercel, pero ten en cuenta que:
   - Los archivos subidos se perderán en cada nuevo despliegue
   - Es mejor para entornos de desarrollo o demostración

### 5. Verificar el Despliegue

Una vez completado el despliegue:

1. Verifica que la aplicación se cargue correctamente
2. Prueba las funcionalidades principales (registro, inicio de sesión, creación de pedidos, etc.)
3. Verifica que las rutas de API funcionen correctamente
4. Comprueba que las imágenes y archivos estáticos se carguen correctamente

## Solución de Problemas

### Problemas con las Rutas de API

Si las rutas de API no funcionan correctamente:

1. Verifica las rutas en `vercel.json`
2. Asegúrate de que `api/index.js` esté configurado correctamente
3. Revisa los logs de Vercel para identificar errores específicos

### Problemas con la Base de Datos

1. Verifica que la variable `MONGO_URI` esté correctamente configurada
2. Asegúrate de que la IP desde donde se conecta Vercel esté en la lista blanca de MongoDB Atlas
3. Comprueba que el usuario de MongoDB tenga los permisos necesarios

### Problemas con Archivos Estáticos

1. Verifica las rutas en `vercel.json`
2. Asegúrate de que la carpeta `uploads` esté correctamente configurada
3. Considera migrar a un servicio de almacenamiento en la nube

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de despliegue de aplicaciones Express en Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com/)