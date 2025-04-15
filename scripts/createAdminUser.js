/**
 * Script para crear un usuario administrador inicial en la base de datos
 * 
 * Ejecutar con: node scripts/createAdminUser.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Usuario = require('../backend/models/usuarioModel');
const colors = require('colors');

// Conectar a la base de datos
const connectDB = require('../backend/config/db');
connectDB();

// Datos del administrador
const adminData = {
  nombre_usuario: 'admin',
  password: 'admin123',  // Cambiar por una contraseña segura
  rol: 'admin'
};

// Función para crear el administrador
const createAdmin = async () => {
  try {
    // Verificar si ya existe un administrador
    const adminExists = await Usuario.findOne({ rol: 'admin' });
    
    if (adminExists) {
      console.log('\nYa existe un usuario administrador en la base de datos.'.yellow.bold);
      console.log(`Nombre de usuario: ${adminExists.nombre_usuario}`.cyan);
      process.exit();
    }
    
    // Crear el administrador
    const admin = await Usuario.create(adminData);
    
    console.log('\nUsuario administrador creado exitosamente:'.green.bold);
    console.log(`Nombre de usuario: ${admin.nombre_usuario}`.cyan);
    console.log(`Contraseña: ${adminData.password}`.cyan);
    console.log('\nPor favor, cambie la contraseña después de iniciar sesión.'.yellow);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Ejecutar la función
createAdmin();