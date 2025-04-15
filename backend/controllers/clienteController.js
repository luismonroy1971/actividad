const asyncHandler = require('express-async-handler');
const Cliente = require('../models/clienteModel');
const Usuario = require('../models/usuarioModel');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private/Admin
const getClientes = asyncHandler(async (req, res) => {
  // Construir query
  let query;

  // Copiar req.query
  const reqQuery = { ...req.query };

  // Campos a excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Eliminar campos excluidos de reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Crear query string
  let queryStr = JSON.stringify(reqQuery);

  // Crear operadores ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Encontrar clientes
  query = Cliente.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-fecha_creacion');
  }

  // Paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Cliente.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Ejecutar query
  const clientes = await query;

  // Paginación resultado
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: clientes.length,
    pagination,
    data: clientes
  });
});

// @desc    Obtener un cliente
// @route   GET /api/clientes/:id
// @access  Private
const getCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.id}`);
  }

  // Solo administradores o el propio cliente pueden ver sus datos
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== cliente._id.toString())) {
    res.status(403);
    throw new Error('No autorizado para acceder a este recurso');
  }

  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Crear nuevo cliente
// @route   POST /api/clientes
// @access  Public/Admin
const crearCliente = asyncHandler(async (req, res) => {
  // Verificar si ya existe un cliente con el mismo correo o teléfono
  const clienteExiste = await Cliente.findOne({
    $or: [
      { correo: req.body.correo },
      { telefono: req.body.telefono },
      { documento_identidad: req.body.documento_identidad }
    ]
  });

  if (clienteExiste) {
    res.status(400);
    throw new Error('Ya existe un cliente con ese correo, teléfono o documento de identidad');
  }

  const cliente = await Cliente.create(req.body);

  // Si el cliente se creó correctamente y no se está creando desde el panel de admin (no hay token)
  // crear automáticamente un usuario asociado
  if (!req.headers.authorization) {
    try {
      // Generar una contraseña aleatoria si no se proporciona
      const password = req.body.password || Math.random().toString(36).slice(-8);
      
      // Crear usuario con rol cliente
      await Usuario.create({
        nombre_usuario: req.body.correo, // Usar el correo como nombre de usuario
        password,
        rol: 'cliente',
        cliente_id: cliente._id
      });
    } catch (error) {
      console.error('Error al crear usuario automáticamente:', error.message);
      // No interrumpir el flujo si falla la creación del usuario
    }
  }

  res.status(201).json({
    success: true,
    data: cliente
  });
});

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
const actualizarCliente = asyncHandler(async (req, res) => {
  let cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.id}`);
  }

  // Solo administradores o el propio cliente pueden actualizar sus datos
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== cliente._id.toString())) {
    res.status(403);
    throw new Error('No autorizado para actualizar este recurso');
  }

  // Si se está actualizando correo, teléfono o documento, verificar que no exista otro cliente con esos datos
  if (req.body.correo || req.body.telefono || req.body.documento_identidad) {
    const query = { _id: { $ne: req.params.id } };
    
    if (req.body.correo) {
      query.correo = req.body.correo;
    }
    
    if (req.body.telefono) {
      query.telefono = req.body.telefono;
    }
    
    if (req.body.documento_identidad) {
      query.documento_identidad = req.body.documento_identidad;
    }
    
    const clienteExiste = await Cliente.findOne(query);
    
    if (clienteExiste) {
      res.status(400);
      throw new Error('Ya existe un cliente con ese correo, teléfono o documento de identidad');
    }
  }

  cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Eliminar cliente
// @route   DELETE /api/clientes/:id
// @access  Private/Admin
const eliminarCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.id}`);
  }

  // Eliminar usuario asociado al cliente
  await Usuario.deleteMany({ cliente_id: req.params.id });

  await cliente.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Verificar cliente por teléfono
// @route   POST /api/clientes/verificar
// @access  Public
const verificarCliente = asyncHandler(async (req, res) => {
  const { telefono } = req.body;

  if (!telefono) {
    res.status(400);
    throw new Error('Por favor proporcione un número de teléfono');
  }

  const cliente = await Cliente.findOne({ telefono });

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  res.status(200).json({
    success: true,
    data: {
      _id: cliente._id,
      nombre_completo: cliente.nombre_completo,
      pregunta_validacion: cliente.pregunta_validacion
    }
  });
});

// @desc    Validar respuesta de cliente
// @route   POST /api/clientes/validar
// @access  Public
const validarRespuesta = asyncHandler(async (req, res) => {
  const { cliente_id, respuesta } = req.body;

  if (!cliente_id || !respuesta) {
    res.status(400);
    throw new Error('Por favor proporcione el ID del cliente y la respuesta');
  }

  const cliente = await Cliente.findById(cliente_id);

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Verificar respuesta
  if (cliente.respuesta_validacion.toLowerCase() === respuesta.toLowerCase()) {
    res.status(200).json({
      success: true,
      mensaje: 'Validación exitosa',
      data: {
        _id: cliente._id,
        nombre_completo: cliente.nombre_completo,
        correo: cliente.correo,
        telefono: cliente.telefono
      }
    });
  } else {
    res.status(400);
    throw new Error('Respuesta incorrecta');
  }
});

// @desc    Obtener pedidos de un cliente
// @route   GET /api/clientes/:id/pedidos
// @access  Private
const getPedidosCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id).populate({
    path: 'pedidos',
    populate: [
      { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
      { path: 'opcion_id', select: 'nombre precio' }
    ]
  });

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.id}`);
  }

  // Solo administradores o el propio cliente pueden ver sus pedidos
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== cliente._id.toString())) {
    res.status(403);
    throw new Error('No autorizado para acceder a este recurso');
  }

  res.status(200).json({
    success: true,
    count: cliente.pedidos.length,
    data: cliente.pedidos
  });
});

module.exports = {
  getClientes,
  getCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  verificarCliente,
  validarRespuesta,
  getPedidosCliente
};