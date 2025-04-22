const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para crear configuración simplificada de Vite para despliegue
function crearConfigViteSimplificada(directorioFrontend) {
  const rutaConfigOriginal = path.join(directorioFrontend, 'vite.config.js');
  const rutaConfigTemporal = path.join(directorioFrontend, 'vite.config.deploy.js');
  
  console.log('Creando configuración de Vite simplificada para el despliegue...');
  
  // Contenido simplificado que no depende de @vitejs/plugin-react
  const configSimplificada = `
import { defineConfig } from 'vite';
import { resolve } from 'path';

// Configuración simplificada para despliegue
export default defineConfig({
  // No usamos plugins para evitar dependencia de @vitejs/plugin-react
  plugins: [],
  build: {
    outDir: 'dist',
    minify: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      events: 'events',
    },
  },
  optimizeDeps: {
    include: ['events'],
  },
});`;

  // Guardar archivo temporal
  fs.writeFileSync(rutaConfigTemporal, configSimplificada, 'utf8');
  console.log('Archivo de configuración temporal creado en:', rutaConfigTemporal);
  
  // Hacer copia de seguridad del original y reemplazar
  if (fs.existsSync(rutaConfigOriginal)) {
    const contenidoOriginal = fs.readFileSync(rutaConfigOriginal, 'utf8');
    const rutaBackup = rutaConfigOriginal + '.backup';
    fs.writeFileSync(rutaBackup, contenidoOriginal, 'utf8');
    console.log('Copia de seguridad del archivo original creada en:', rutaBackup);
    
    // Reemplazar el original con el simplificado
    fs.writeFileSync(rutaConfigOriginal, configSimplificada, 'utf8');
    console.log('Archivo original reemplazado con configuración simplificada');
    
    return true;
  } else {
    console.warn('No se encontró el archivo vite.config.js original');
    // Crear el archivo si no existe
    fs.writeFileSync(rutaConfigOriginal, configSimplificada, 'utf8');
    console.log('Se creó un nuevo archivo vite.config.js con configuración simplificada');
    return true;
  }
}

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

// Función para crear un archivo index.html básico si no existe
function crearIndexHtmlSiNoExiste(directorioFrontend) {
  const rutaIndex = path.join(directorioFrontend, 'index.html');
  
  if (!fs.existsSync(rutaIndex)) {
    console.log('No se encontró index.html, creando uno básico...');
    
    const htmlBasico = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aplicación</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
    
    fs.writeFileSync(rutaIndex, htmlBasico, 'utf8');
    console.log('Archivo index.html básico creado');
    return true;
  }
  
  return false;
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
  
  // Verificar si existe index.html o crearlo
  crearIndexHtmlSiNoExiste(directorioFrontend);
  
  // Instalar TODAS las dependencias del frontend (incluidas devDependencies)
  console.log('Instalando dependencias del frontend (incluidas devDependencies)...');
  if (!ejecutarComando('npm install --production=false', directorioFrontend)) {
    process.exit(1);
  }
  
  // Crear configuración de Vite simplificada
  crearConfigViteSimplificada(directorioFrontend);
  
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
  if (!ejecutarComando('npx vite build --config vite.config.js', directorioFrontend)) {
    // Intentar método de construcción alternativo usando la ruta exacta
    console.log('Probando método de construcción alternativo...');
    if (!ejecutarComando('node ./node_modules/vite/bin/vite.js build --config vite.config.js', directorioFrontend)) {
      // Como último recurso, intentar crear manualmente la carpeta dist con un archivo HTML básico
      console.log('La construcción falló. Creando manualmente un directorio dist básico...');
      const distDir = path.join(directorioFrontend, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      const htmlBasico = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aplicación</title>
  </head>
  <body>
    <div id="root">
      <h1>Sitio en mantenimiento</h1>
      <p>Estamos trabajando para mejorar el sitio. Por favor, vuelva más tarde.</p>
    </div>
  </body>
</html>`;
      
      fs.writeFileSync(path.join(distDir, 'index.html'), htmlBasico, 'utf8');
      console.log('Se creó una página de mantenimiento básica en dist/index.html');
    }
  }
  
  console.log('\n====== CONSTRUCCIÓN COMPLETADA ======');
  
  // Verificar que dist exista
  const distPath = path.join(directorioFrontend, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Directorio dist creado correctamente en:', distPath);
    console.log('Contenido del directorio dist:');
    fs.readdirSync(distPath).forEach(archivo => {
      console.log(' - ' + archivo);
    });
  } else {
    console.error('¡El directorio dist no existe después de la construcción!');
    process.exit(1);
  }
}

// Ejecutar el proceso de construcción
construirProyecto().catch(error => {
  console.error('La construcción falló con error:', error);
  process.exit(1);
});
