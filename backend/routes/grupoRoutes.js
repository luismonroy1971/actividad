const express = require('express');
const {
  getGrupos,
  getGrupo,
  crearGrupo,
  actualizarGrupo,
  eliminarGrupo,
  agregarClienteAGrupo,
  quitarClienteDeGrupo
} = require('../controllers/grupoController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas protegidas solo para administradores
router.route('/')
  .get(protect, admin, getGrupos)
  .post(protect, admin, crearGrupo);

router.route('/:id')
  .get(protect, admin, getGrupo)
  .put(protect, admin, actualizarGrupo)
  .delete(protect, admin, eliminarGrupo);

// Rutas para gestionar clientes en grupos
router.route('/:id/clientes/:clienteId')
  .put(protect, admin, agregarClienteAGrupo)
  .delete(protect, admin, quitarClienteDeGrupo);

module.exports = router;