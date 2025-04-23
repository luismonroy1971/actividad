// Manejador de rutas para archivos estáticos en Vercel
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const baseDir = path.join(__dirname, '..');

// Middleware para servir archivos estáticos desde la carpeta uploads
router.get('/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(baseDir, 'uploads', folder, filename);
  
  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    // Si el archivo no existe, enviar una imagen por defecto o un 404
    const defaultImage = path.join(baseDir, 'uploads', folder, 'no-image.jpg');
    if (fs.existsSync(defaultImage)) {
      return res.sendFile(defaultImage);
    } else {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
  }
});

module.exports = router;