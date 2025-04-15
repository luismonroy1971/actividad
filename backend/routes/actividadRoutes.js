const express = require('express');
const {
  getActividades,
  getActividad,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  subirImagenActividad,
  getActividadesConOpciones
} = require('../controllers/actividadController');
const { getOpcionesPorActividad } = require('../controllers/opcionController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', getActividades);
router.get('/con-opciones', getActividadesConOpciones);
router.get('/:id', getActividad);

// Incluir rutas de opciones por actividad
router.get('/:actividadId/opciones', getOpcionesPorActividad);

// Rutas protegidas solo para administradores
router.post('/', protect, admin, crearActividad);
router.put('/:id', protect, admin, actualizarActividad);
router.delete('/:id', protect, admin, eliminarActividad);
router.put('/:id/imagen', protect, admin, subirImagenActividad);

module.exports = router;