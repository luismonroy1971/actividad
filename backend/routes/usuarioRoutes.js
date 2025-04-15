const express = require('express');
const {
  registrarUsuario,
  loginUsuario,
  getPerfilUsuario,
  actualizarPerfilUsuario,
  getUsuarios,
  eliminarUsuario,
  getUsuarioPorId,
  actualizarUsuario,
  loginCliente,
  validarCliente,
  asignarActividadesAdmin,
  getAdminsPorActividad,
  getActividadesAdministradas
} = require('../controllers/usuarioController');
const { protect, admin, superadmin, adminActividad } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.post('/', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/login-cliente', loginCliente);
router.post('/validar-cliente', validarCliente);

// Rutas protegidas para todos los usuarios autenticados
router.route('/perfil')
  .get(protect, getPerfilUsuario)
  .put(protect, actualizarPerfilUsuario);

// Rutas para administradores de actividades
router.route('/admin-actividad/:actividadId')
  .get(protect, admin, getAdminsPorActividad);

// Rutas protegidas solo para administradores
router.route('/')
  .get(protect, admin, getUsuarios);

router.route('/:id')
  .get(protect, admin, getUsuarioPorId)
  .put(protect, admin, actualizarUsuario)
  .delete(protect, admin, eliminarUsuario);

// Rutas protegidas solo para superadministradores
router.route('/:id/actividades')
  .put(protect, superadmin, asignarActividadesAdmin)
  .get(protect, admin, getActividadesAdministradas);

module.exports = router;