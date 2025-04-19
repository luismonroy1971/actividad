const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Usuario = require('../models/usuarioModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.usuario = await Usuario.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

const admin = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'admin' || req.usuario.rol === 'superadmin' || req.usuario.rol === 'admin_actividad')) {
    next();
  } else {
    res.status(403);
    throw new Error('No autorizado como administrador');
  }
};

const superadmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'superadmin') {
    next();
  } else {
    res.status(403);
    throw new Error('No autorizado como superadministrador');
  }
};

const adminActividad = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'admin' || req.usuario.rol === 'superadmin')) {
    next();
  } else if (req.usuario && req.usuario.rol === 'admin_actividad') {
    // Verificar si el usuario administra la actividad solicitada
    const actividadId = req.params.actividadId || req.params.id || req.body.actividad_id;
    
    if (!actividadId) {
      // Si no hay ID de actividad en la solicitud, permitir acceso a rutas generales
      // como la creación de gastos donde el ID viene en el body
      next();
    } else if (req.usuario.actividades_administradas.some(id => id.toString() === actividadId.toString())) {
      next();
    } else {
      res.status(403);
      throw new Error('No autorizado para administrar esta actividad');
    }
  } else {
    res.status(403);
    throw new Error('No autorizado');
  }
};

const cliente = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'cliente' || req.usuario.rol === 'admin' || req.usuario.rol === 'superadmin')) {
    next();
  } else {
    res.status(403);
    throw new Error('No autorizado como cliente');
  }
};

module.exports = { protect, admin, superadmin, adminActividad, cliente };