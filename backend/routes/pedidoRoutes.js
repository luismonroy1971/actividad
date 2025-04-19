const express = require('express');
const {
  getPedidos,
  getPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  subirComprobante,
  getResumenPedidos,
  getPedidosByCliente // Añadir este controlador
} = require('../controllers/pedidoController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas protegidas para todos los usuarios autenticados
router.post('/', protect, crearPedido);
router.get('/mispedidos', protect, getPedidosByCliente);

// Rutas protegidas solo para administradores
router.get('/', protect, admin, getPedidos);
router.get('/resumen', protect, admin, getResumenPedidos);

// Rutas con parámetros
router.get('/:id', protect, getPedido);
router.put('/:id', protect, admin, actualizarPedido);
router.delete('/:id', protect, admin, eliminarPedido);
router.put('/:id/comprobante', protect, subirComprobante);


module.exports = router;