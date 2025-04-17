const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// File Upload
app.use(fileUpload());

// Crear directorio de uploads si no existe
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/actividades');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar carpeta de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/actividades', require('./routes/actividadRoutes'));
app.use('/api/opciones', require('./routes/opcionRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en puerto ${PORT}`.yellow.bold);
});