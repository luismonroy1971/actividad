const express = require('express');
const {
  getClientes,
  getCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  verificarCliente,
  validarRespuesta,
  getPedidosCliente
} = require('../controllers/clienteController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.post('/verificar', verificarCliente);
router.post('/validar', validarRespuesta);
router.post('/', crearCliente); // Permitir registro público de clientes

// Rutas protegidas para todos los usuarios autenticados
router.get('/:id', protect, getCliente);
router.put('/:id', protect, actualizarCliente);
router.get('/:id/pedidos', protect, getPedidosCliente);

// Rutas protegidas solo para administradores
router.get('/', protect, admin, getClientes);
router.delete('/:id', protect, admin, eliminarCliente);

module.exports = router;