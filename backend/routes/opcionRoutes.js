const express = require('express');
const {
  getOpciones,
  getOpcion,
  crearOpcion,
  actualizarOpcion,
  eliminarOpcion
} = require('../controllers/opcionController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', getOpciones);
router.get('/:id', getOpcion);

// Rutas protegidas solo para administradores
router.post('/', protect, admin, crearOpcion);
router.put('/:id', protect, admin, actualizarOpcion);
router.delete('/:id', protect, admin, eliminarOpcion);

module.exports = router;