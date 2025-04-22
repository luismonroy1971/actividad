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
  
  // Instalar TODAS las dependencias del frontend (incluidas devDependencies)
  console.log('Instalando dependencias del frontend (incluidas devDependencies)...');
  if (!ejecutarComando('npm install --production=false', directorioFrontend)) {
    process.exit(1);
  }
  
  // Instalar específicamente el plugin de React para Vite
  console.log('Instalando plugin de React para Vite...');
  if (!ejecutarComando('npm install @vitejs/plugin-react', directorioFrontend)) {
    console.warn('Advertencia: No se pudo instalar @vitejs/plugin-react, continuando de todos modos...');
  }
  
  // Instalar Vite si no está ya instalado
  console.log('Asegurando que Vite esté instalado...');
  if (!ejecutarComando('npm install vite', directorioFrontend)) {
    console.warn('Advertencia: No se pudo instalar vite, continuando de todos modos...');
  }
  
  // Verificar el contenido del vite.config.js
  console.log('Verificando archivo vite.config.js...');
  const viteConfigPath = path.join(directorioFrontend, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    console.log('Contenido de vite.config.js:');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    console.log(viteConfig);
  } else {
    console.error('¡El archivo vite.config.js no existe!');
  }
  
  // Construir frontend usando npx para asegurar que se use la versión local
  console.log('Construyendo frontend...');
  if (!ejecutarComando('npx vite build', directorioFrontend)) {
    // Intentar método de construcción alternativo usando la ruta exacta
    console.log('Probando método de construcción alternativo...');
    if (!ejecutarComando('node ./node_modules/vite/bin/vite.js build', directorioFrontend)) {
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
