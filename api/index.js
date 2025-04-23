// Importa las dependencias necesarias
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('../backend/config/db');
const { errorHandler } = require('../backend/middleware/errorMiddleware');
const { initializeUploadDirectories } = require('../backend/utils/initUploads');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

// Inicializar directorios de uploads
const baseDir = path.join(__dirname, '..');
initializeUploadDirectories(baseDir);

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de File Upload - solo se aplicará a rutas específicas
const fileUploadMiddleware = fileUpload({
  createParentPath: true,  // Crea automáticamente directorios padre si no existen
  limits: { 
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB por defecto o lo que se configure
  },
  abortOnLimit: true,      // Aborta la subida si se excede el límite
  useTempFiles: true,      // Usa archivos temporales para mejorar el rendimiento
  tempFileDir: path.join(baseDir, '/uploads/temp/'), // Directorio temporal
  debug: process.env.NODE_ENV === 'development' // Modo debug en desarrollo
});

// Función para aplicar el middleware solo cuando sea necesario
const applyFileUpload = (req, res, next) => {
  // Verificar si la ruta actual necesita manejar archivos
  // Solo aplicar a rutas POST o PUT que probablemente suban archivos
  if ((req.method === 'POST' || req.method === 'PUT') && 
      (req.originalUrl.includes('/api/actividades') || 
       req.originalUrl.includes('/api/usuarios/perfil'))) {
    return fileUploadMiddleware(req, res, next);
  }
  next();
};

// Aplicar el middleware condicionalmente
app.use(applyFileUpload);

// Configurar carpeta de uploads
// En entorno de desarrollo, usar express.static
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(baseDir, '/uploads')));
} else {
  // En producción (Vercel), usar el router personalizado
  app.use('/uploads', require('./uploads'));
}

// Rutas
app.use('/api/usuarios', require('../backend/routes/usuarioRoutes'));
app.use('/api/actividades', require('../backend/routes/actividadRoutes'));
app.use('/api/opciones', require('../backend/routes/opcionRoutes'));
app.use('/api/clientes', require('../backend/routes/clienteRoutes'));
app.use('/api/pedidos', require('../backend/routes/pedidoRoutes'));
app.use('/api/gastos', require('../backend/routes/gastoRoutes'));
app.use('/api/grupos', require('../backend/routes/grupoRoutes'));

// Middleware de manejo de errores
app.use(errorHandler);

// Exportar la aplicación para Vercel serverless
module.exports = app;