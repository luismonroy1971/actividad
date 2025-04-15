const express = require('express');
const {
  crearGasto,
  getGastosPorActividad,
  getGastoById,
  actualizarGasto,
  eliminarGasto,
  getResumenFinanciero
} = require('../controllers/gastoController');
const { protect, admin, adminActividad } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas protegidas para administradores y administradores de actividad
router.route('/')
  .post(protect, adminActividad, crearGasto);

router.route('/actividad/:actividadId')
  .get(protect, adminActividad, getGastosPorActividad);

router.route('/resumen/:actividadId')
  .get(protect, adminActividad, getResumenFinanciero);

router.route('/:id')
  .get(protect, adminActividad, getGastoById)
  .put(protect, adminActividad, actualizarGasto)
  .delete(protect, adminActividad, eliminarGasto);

module.exports = router;