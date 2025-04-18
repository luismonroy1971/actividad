const asyncHandler = require('express-async-handler');
const Usuario = require('../models/usuarioModel');
const Cliente = require('../models/clienteModel');
const Actividad = require('../models/actividadModel');

// @desc    Registrar un nuevo usuario
// @route   POST /api/usuarios
// @access  Public
const registrarUsuario = asyncHandler(async (req, res) => {
  const { nombre_usuario, password, rol, cliente_id, actividades_administradas } = req.body;

  // Verificar si el usuario ya existe
  const usuarioExiste = await Usuario.findOne({ nombre_usuario });

  if (usuarioExiste) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Si es un usuario cliente, verificar que el cliente exista
  if (rol === 'cliente' && cliente_id) {
    const clienteExiste = await Cliente.findById(cliente_id);
    if (!clienteExiste) {
      res.status(400);
      throw new Error('Cliente no encontrado');
    }
  }

  // Si es un administrador de actividad, verificar que las actividades existan
  if (rol === 'admin_actividad' && actividades_administradas && actividades_administradas.length > 0) {
    for (const actividadId of actividades_administradas) {
      const actividadExiste = await Actividad.findById(actividadId);
      if (!actividadExiste) {
        res.status(400);
        throw new Error(`Actividad con ID ${actividadId} no encontrada`);
      }
    }
  }

  // Crear usuario
  const usuario = await Usuario.create({
    nombre_usuario,
    password,
    rol,
    cliente_id: rol === 'cliente' ? cliente_id : null,
    actividades_administradas: rol === 'admin_actividad' ? actividades_administradas : []
  });

  if (usuario) {
    res.status(201).json({
      _id: usuario._id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
      actividades_administradas: usuario.actividades_administradas,
      token: usuario.getSignedJwtToken()
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar usuario y obtener token
// @route   POST /api/usuarios/login
// @access  Public
const loginUsuario = asyncHandler(async (req, res) => {
  const { identificacion, password } = req.body;

  // Verificar si es un correo electrónico o nombre de usuario
  let usuario = null;
  
  // Primero buscar por nombre de usuario
  usuario = await Usuario.findOne({ nombre_usuario: identificacion });
  
  // Si no se encuentra, buscar por correo electrónico en clientes
  if (!usuario) {
    const cliente = await Cliente.findOne({ correo: identificacion });
    if (cliente) {
      usuario = await Usuario.findOne({ cliente_id: cliente._id });
    }
  }

  if (usuario && (await usuario.matchPassword(password))) {
    // Actualizar último acceso
    usuario.ultimo_acceso = Date.now();
    await usuario.save();

    res.json({
      _id: usuario._id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
      token: usuario.getSignedJwtToken()
    });
  } else {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }
});

// @desc    Obtener perfil de usuario
// @route   GET /api/usuarios/perfil
// @access  Private
const getPerfilUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.usuario._id);

  if (usuario) {
    res.json({
      _id: usuario._id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
      ultimo_acceso: usuario.ultimo_acceso
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Actualizar perfil de usuario
// @route   PUT /api/usuarios/perfil
// @access  Private
const actualizarPerfilUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.usuario._id);

  if (usuario) {
    usuario.nombre_usuario = req.body.nombre_usuario || usuario.nombre_usuario;
    
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    const usuarioActualizado = await usuario.save();

    res.json({
      _id: usuarioActualizado._id,
      nombre_usuario: usuarioActualizado.nombre_usuario,
      rol: usuarioActualizado.rol,
      cliente_id: usuarioActualizado.cliente_id,
      token: usuarioActualizado.getSignedJwtToken()
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private/Admin
const getUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find({});
  res.json(usuarios);
});

// @desc    Eliminar usuario
// @route   DELETE /api/usuarios/:id
// @access  Private/Admin
const eliminarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);

  if (usuario) {
    await Usuario.deleteOne({ _id: req.params.id });
    res.json({ message: 'Usuario eliminado' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Obtener usuario por ID
// @route   GET /api/usuarios/:id
// @access  Private/Admin
const getUsuarioPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id).select('-password');
  
  if (usuario) {
    res.json(usuario);
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Private/Admin
const actualizarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);

  if (usuario) {
    usuario.nombre_usuario = req.body.nombre_usuario || usuario.nombre_usuario;
    usuario.rol = req.body.rol || usuario.rol;
    
    // Actualizar actividades administradas si se proporcionan
    if (req.body.actividades_administradas && usuario.rol === 'admin_actividad') {
      // Verificar que las actividades existan
      for (const actividadId of req.body.actividades_administradas) {
        const actividadExiste = await Actividad.findById(actividadId);
        if (!actividadExiste) {
          res.status(400);
          throw new Error(`Actividad con ID ${actividadId} no encontrada`);
        }
      }
      usuario.actividades_administradas = req.body.actividades_administradas;
    }
    
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    const usuarioActualizado = await usuario.save();

    res.json({
      _id: usuarioActualizado._id,
      nombre_usuario: usuarioActualizado.nombre_usuario,
      rol: usuarioActualizado.rol,
      cliente_id: usuarioActualizado.cliente_id,
      actividades_administradas: usuarioActualizado.actividades_administradas
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Login de cliente con teléfono
// @route   POST /api/usuarios/login-cliente
// @access  Public
const loginCliente = asyncHandler(async (req, res) => {
  const { telefono } = req.body;

  // Buscar cliente por teléfono
  const cliente = await Cliente.findOne({ telefono });

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Buscar usuario asociado al cliente
  let usuario = await Usuario.findOne({ cliente_id: cliente._id });

  // Si no existe usuario para este cliente, crear uno
  if (!usuario) {
    // Crear nombre de usuario basado en el teléfono
    const nombre_usuario = `cliente_${telefono}`;
    // Crear contraseña aleatoria (en producción debería enviarse por SMS)
    const password = Math.random().toString(36).slice(-8);

    usuario = await Usuario.create({
      nombre_usuario,
      password,
      rol: 'cliente',
      cliente_id: cliente._id
    });
  }

  // Actualizar último acceso
  usuario.ultimo_acceso = Date.now();
  await usuario.save();

  res.json({
    _id: usuario._id,
    nombre_usuario: usuario.nombre_usuario,
    rol: usuario.rol,
    cliente_id: usuario.cliente_id,
    cliente: {
      _id: cliente._id,
      nombre_completo: cliente.nombre_completo,
      telefono: cliente.telefono,
      correo: cliente.correo
    },
    token: usuario.getSignedJwtToken()
  });
});

// @desc    Validar respuesta de cliente
// @route   POST /api/usuarios/validar-cliente
// @access  Public
const validarCliente = asyncHandler(async (req, res) => {
  const { cliente_id, respuesta } = req.body;

  const cliente = await Cliente.findById(cliente_id);

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Verificar respuesta
  if (cliente.respuesta_validacion.toLowerCase() === respuesta.toLowerCase()) {
    res.json({ success: true, mensaje: 'Validación exitosa' });
  } else {
    res.status(400);
    throw new Error('Respuesta incorrecta');
  }
});

// @desc    Asignar actividades a un administrador
// @route   PUT /api/usuarios/:id/actividades
// @access  Private/SuperAdmin
const asignarActividadesAdmin = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);

  if (!usuario) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  // Verificar que el usuario sea un administrador de actividad
  if (usuario.rol !== 'admin_actividad') {
    res.status(400);
    throw new Error('Solo se pueden asignar actividades a administradores de actividad');
  }

  // Verificar que las actividades existan
  if (req.body.actividades_administradas && req.body.actividades_administradas.length > 0) {
    for (const actividadId of req.body.actividades_administradas) {
      const actividadExiste = await Actividad.findById(actividadId);
      if (!actividadExiste) {
        res.status(400);
        throw new Error(`Actividad con ID ${actividadId} no encontrada`);
      }
    }
    usuario.actividades_administradas = req.body.actividades_administradas;
  } else {
    // Si se envía un array vacío, eliminar todas las actividades asignadas
    usuario.actividades_administradas = [];
  }
  
  const usuarioActualizado = await usuario.save();

  res.json({
    success: true,
    data: {
      _id: usuarioActualizado._id,
      nombre_usuario: usuarioActualizado.nombre_usuario,
      rol: usuarioActualizado.rol,
      actividades_administradas: usuarioActualizado.actividades_administradas
    }
  });
});

// @desc    Obtener administradores por actividad
// @route   GET /api/usuarios/admin-actividad/:actividadId
// @access  Private/Admin
const getAdminsPorActividad = asyncHandler(async (req, res) => {
  const { actividadId } = req.params;

  // Verificar que la actividad exista
  const actividad = await Actividad.findById(actividadId);
  if (!actividad) {
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Buscar usuarios que administran esta actividad
  const admins = await Usuario.find({
    rol: 'admin_actividad',
    actividades_administradas: actividadId
  }).select('-password');

  res.json(admins);
});

// @desc    Obtener actividades administradas por un usuario
// @route   GET /api/usuarios/:id/actividades
// @access  Private/Admin
const getActividadesAdministradas = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id).select('-password');

  if (!usuario) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  // Si el usuario no es admin_actividad, no tiene actividades asignadas
  if (usuario.rol !== 'admin_actividad') {
    return res.json({
      _id: usuario._id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      actividades_administradas: []
    });
  }

  // Obtener detalles de las actividades administradas
  const actividades = await Actividad.find({
    _id: { $in: usuario.actividades_administradas }
  }).select('titulo fecha_actividad lugar estado');

  res.json({
    _id: usuario._id,
    nombre_usuario: usuario.nombre_usuario,
    rol: usuario.rol,
    actividades_administradas: usuario.actividades_administradas,
    actividades_detalles: actividades
  });
});

module.exports = {
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
};