// Añade esta función a tu script build.js
// Coloca esta función antes de la función construirProyecto()

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