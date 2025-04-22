const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar comandos y registrar salida
function ejecutarComando(comando, directorioTrabajo = null) {
  console.log(`Ejecutando comando: ${comando}`);
  try {
    const opciones = {
      stdio: 'inherit',
      shell: true
    };
    
    if (directorioTrabajo) {
      opciones.cwd = directorioTrabajo;
    }
    
    execSync(comando, opciones);
    return true;
  } catch (error) {
    console.error(`Error al ejecutar el comando: ${comando}`);
    console.error(error.toString());
    return false;
  }
}

// Función principal de construcción
async function construirProyecto() {
  console.log('Iniciando proceso de construcción...');
  console.log('Directorio actual:', process.cwd());
  
  // Paso 1: Instalar dependencias raíz
  console.log('\n====== INSTALANDO DEPENDENCIAS RAÍZ ======');
  if (!ejecutarComando('npm install')) {
    process.exit(1);
  }
  
  // Paso 2: Instalar dependencias del frontend y construir
  console.log('\n====== CONSTRUYENDO FRONTEND ======');
  const directorioFrontend = path.join(process.cwd(), 'frontend');
  
  console.log('Directorio del frontend:', directorioFrontend);
  if (!fs.existsSync(directorioFrontend)) {
    console.error('¡El directorio frontend no existe!');
    fs.readdirSync(process.cwd()).forEach(archivo => {
      console.log(' - ' + archivo);
    });
    process.exit(1);
  }
  
  // Instalar dependencias del frontend
  console.log('Instalando dependencias del frontend...');
  if (!ejecutarComando('npm install', directorioFrontend)) {
    process.exit(1);
  }
  
  // Instalar Vite globalmente para asegurar que esté disponible
  console.log('Instalando Vite globalmente...');
  if (!ejecutarComando('npm install -g vite')) {
    console.warn('Advertencia: No se pudo instalar Vite globalmente, continuando de todos modos...');
  }
  
  // Mover Vite de devDependencies a dependencies si es necesario
  console.log('Asegurando que Vite esté en las dependencias...');
  if (!ejecutarComando('npm install --save vite', directorioFrontend)) {
    console.warn('Advertencia: No se pudo instalar Vite como dependencia, continuando de todos modos...');
  }
  
  // Construir frontend con ruta explícita a vite
  console.log('Construyendo frontend...');
  if (!ejecutarComando('npx vite build', directorioFrontend)) {
    // Intentar método de construcción alternativo
    console.log('Probando método de construcción alternativo...');
    if (!ejecutarComando('./node_modules/.bin/vite build', directorioFrontend)) {
      console.error('¡La construcción del frontend falló!');
      process.exit(1);
    }
  }
  
  console.log('\n====== CONSTRUCCIÓN COMPLETADA CON ÉXITO ======');
}

// Ejecutar el proceso de construcción
construirProyecto().catch(error => {
  console.error('La construcción falló con error:', error);
  process.exit(1);
});