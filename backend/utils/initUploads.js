const fs = require('fs');
const path = require('path');

/**
 * Inicializa los directorios necesarios para uploads
 * @param {string} baseDir - Directorio base desde donde se crearán las carpetas
 */
const initializeUploadDirectories = (baseDir) => {
  console.log('Inicializando directorios para uploads...'.cyan);
  
  // Lista de subdirectorios necesarios
  const directories = [
    '/uploads',
    '/uploads/actividades',
    '/uploads/perfiles',
    '/uploads/documentos',
    // Añadir más subdirectorios según sea necesario
  ];
  
  // Crear cada directorio si no existe
  directories.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Directorio creado: ${fullPath}`.green);
      } catch (error) {
        console.error(`❌ Error al crear directorio ${fullPath}: ${error.message}`.red);
      }
    } else {
      console.log(`✓ Directorio ya existe: ${fullPath}`.cyan);
    }
  });
  
  console.log('Inicialización de directorios completada'.green);
};

module.exports = { initializeUploadDirectories };