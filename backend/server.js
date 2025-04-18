const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initializeUploadDirectories } = require('./utils/initUploads');
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

// File Upload - configuración mejorada
app.use(fileUpload({
  createParentPath: true,  // Crea automáticamente directorios padre si no existen
  limits: { 
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB por defecto o lo que se configure
  },
  abortOnLimit: true,      // Aborta la subida si se excede el límite
  useTempFiles: true,      // Usa archivos temporales para mejorar el rendimiento
  tempFileDir: path.join(baseDir, '/uploads/temp/'), // Directorio temporal
  debug: process.env.NODE_ENV === 'development' // Modo debug en desarrollo
}));

// Configurar carpeta de uploads
app.use('/uploads', express.static(path.join(baseDir, '/uploads')));

// Rutas
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/actividades', require('./routes/actividadRoutes'));
app.use('/api/opciones', require('./routes/opcionRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/gastos', require('./routes/gastoRoutes'));
app.use('/api/grupos', require('./routes/grupoRoutes'));

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en puerto ${PORT}`.yellow.bold);
});