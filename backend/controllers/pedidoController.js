const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Pedido = require('../models/pedidoModel');
const Actividad = require('../models/actividadModel');
const Cliente = require('../models/clienteModel');
const Opcion = require('../models/opcionModel');

// @desc    Obtener todos los pedidos
// @route   GET /api/pedidos
// @access  Private/Admin
const getPedidos = asyncHandler(async (req, res) => {
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

  // Encontrar pedidos
  query = Pedido.find(JSON.parse(queryStr))
    .populate([
      { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
      { path: 'cliente_id', select: 'nombre_completo telefono correo' },
      { path: 'opcion_id', select: 'nombre precio' }
    ]);

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
    query = query.sort('-fecha_pedido');
  }

  // Paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Pedido.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Ejecutar query
  const pedidos = await query;

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
    count: pedidos.length,
    pagination,
    data: pedidos
  });
});

// @desc    Obtener un pedido
// @route   GET /api/pedidos/:id
// @access  Private
const getPedido = asyncHandler(async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
    .populate([
      { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
      { path: 'cliente_id', select: 'nombre_completo telefono correo' },
      { path: 'opcion_id', select: 'nombre precio' }
    ]);

  if (!pedido) {
    res.status(404);
    throw new Error(`Pedido no encontrado con id ${req.params.id}`);
  }

  // Solo administradores o el propio cliente pueden ver sus pedidos
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== pedido.cliente_id._id.toString())) {
    res.status(403);
    throw new Error('No autorizado para acceder a este recurso');
  }

  res.status(200).json({
    success: true,
    data: pedido
  });
});

// @desc    Crear nuevo pedido
// @route   POST /api/pedidos
// @access  Private
const crearPedido = asyncHandler(async (req, res) => {
  // Verificar que la actividad existe
  const actividad = await Actividad.findById(req.body.actividad_id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.body.actividad_id}`);
  }

  // Verificar que la actividad está activa
  if (actividad.estado !== 'Activa') {
    res.status(400);
    throw new Error('No se pueden crear pedidos para actividades no activas');
  }

  // Verificar que el cliente existe
  const cliente = await Cliente.findById(req.body.cliente_id);

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.body.cliente_id}`);
  }

  // Verificar que la opción existe y pertenece a la actividad
  const opcion = await Opcion.findOne({
    _id: req.body.opcion_id,
    actividad_id: req.body.actividad_id
  });

  if (!opcion) {
    res.status(404);
    throw new Error(`Opción no encontrada con id ${req.body.opcion_id} para la actividad ${req.body.actividad_id}`);
  }

  // Si no es admin, verificar que el cliente es el mismo que está autenticado
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== req.body.cliente_id)) {
    res.status(403);
    throw new Error('No autorizado para crear pedidos para este cliente');
  }
  
  // Verificar si ya existe un pedido con la misma combinación de actividad, cliente y opción
  const pedidoExistente = await Pedido.findOne({
    actividad_id: req.body.actividad_id,
    cliente_id: req.body.cliente_id,
    opcion_id: req.body.opcion_id
  });
  
  // Si existe un pedido con la misma combinación, actualizar la cantidad en lugar de crear uno nuevo
  if (pedidoExistente) {
    // Actualizar la cantidad y recalcular el costo total
    const nuevaCantidad = pedidoExistente.cantidad + parseInt(req.body.cantidad);
    const costoTotal = nuevaCantidad * opcion.precio;
    
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      pedidoExistente._id,
      { 
        cantidad: nuevaCantidad,
        costo_total: costoTotal
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
      { path: 'cliente_id', select: 'nombre_completo telefono correo' },
      { path: 'opcion_id', select: 'nombre precio' }
    ]);
    
    return res.status(200).json({
      success: true,
      data: pedidoActualizado,
      message: 'Se actualizó la cantidad del pedido existente'
    });
  }
  
  // Verificar si el cliente ya tiene pedidos para esta actividad pero con diferentes opciones
  const pedidosCliente = await Pedido.find({
    actividad_id: req.body.actividad_id,
    cliente_id: req.body.cliente_id
  });
  
  // Informativo: el cliente ya tiene otros pedidos para esta actividad con diferentes opciones
  const tienePedidosConOtrasOpciones = pedidosCliente.length > 0;

  // Establecer costo unitario desde la opción
  req.body.costo_unitario = opcion.precio;
  
  // Calcular costo total
  req.body.costo_total = req.body.cantidad * opcion.precio;

  const pedido = await Pedido.create(req.body);

  // Poblar el pedido creado para devolver información completa
  const pedidoCompleto = await Pedido.findById(pedido._id).populate([
    { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
    { path: 'cliente_id', select: 'nombre_completo telefono correo' },
    { path: 'opcion_id', select: 'nombre precio' }
  ]);

  res.status(201).json({
    success: true,
    data: pedidoCompleto
  });
});

// @desc    Actualizar pedido
// @route   PUT /api/pedidos/:id
// @access  Private/Admin
const actualizarPedido = asyncHandler(async (req, res) => {
  let pedido = await Pedido.findById(req.params.id);

  if (!pedido) {
    res.status(404);
    throw new Error(`Pedido no encontrado con id ${req.params.id}`);
  }

  // Solo administradores pueden actualizar pedidos
  if (req.usuario.rol !== 'admin') {
    res.status(403);
    throw new Error('No autorizado para actualizar pedidos');
  }

  // Si se está actualizando la opción, recalcular costos
  if (req.body.opcion_id && req.body.opcion_id !== pedido.opcion_id.toString()) {
    const opcion = await Opcion.findById(req.body.opcion_id);
    
    if (!opcion) {
      res.status(404);
      throw new Error(`Opción no encontrada con id ${req.body.opcion_id}`);
    }
    
    req.body.costo_unitario = opcion.precio;
    req.body.costo_total = (req.body.cantidad || pedido.cantidad) * opcion.precio;
  } else if (req.body.cantidad && req.body.cantidad !== pedido.cantidad) {
    // Si solo se actualiza la cantidad, recalcular costo total
    req.body.costo_total = req.body.cantidad * pedido.costo_unitario;
  }

  // Si se actualiza el estado a Pagado, establecer fecha de pago
  if (req.body.estado_pago === 'Pagado' && pedido.estado_pago !== 'Pagado') {
    req.body.fecha_pago = Date.now();
  }

  pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate([
    { path: 'actividad_id', select: 'titulo fecha_actividad lugar' },
    { path: 'cliente_id', select: 'nombre_completo telefono correo' },
    { path: 'opcion_id', select: 'nombre precio' }
  ]);

  res.status(200).json({
    success: true,
    data: pedido
  });
});

// @desc    Eliminar pedido
// @route   DELETE /api/pedidos/:id
// @access  Private/Admin
const eliminarPedido = asyncHandler(async (req, res) => {
  const pedido = await Pedido.findById(req.params.id);

  if (!pedido) {
    res.status(404);
    throw new Error(`Pedido no encontrado con id ${req.params.id}`);
  }

  // Solo administradores pueden eliminar pedidos
  if (req.usuario.rol !== 'admin') {
    res.status(403);
    throw new Error('No autorizado para eliminar pedidos');
  }

  await Pedido.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });}
);

// @desc    Subir comprobante de pago
// @route   PUT /api/pedidos/:id/comprobante
// @access  Private
const subirComprobante = asyncHandler(async (req, res) => {
  const pedido = await Pedido.findById(req.params.id);

  if (!pedido) {
    res.status(404);
    throw new Error(`Pedido no encontrado con id ${req.params.id}`);
  }

  // Solo administradores o el propio cliente pueden subir comprobantes
  if (req.usuario.rol !== 'admin' && 
      (!req.usuario.cliente_id || req.usuario.cliente_id.toString() !== pedido.cliente_id.toString())) {
    res.status(403);
    throw new Error('No autorizado para subir comprobantes para este pedido');
  }

  if (!req.files) {
    res.status(400);
    throw new Error('Por favor suba un archivo');
  }

  const file = req.files.file;

  // Verificar que es una imagen
  if (!file.mimetype.startsWith('image')) {
    res.status(400);
    throw new Error('Por favor suba una imagen');
  }

  // Verificar tamaño
  if (file.size > process.env.MAX_FILE_SIZE) {
    res.status(400);
    throw new Error(`Por favor suba una imagen menor a ${process.env.MAX_FILE_SIZE / 1000000} MB`);
  }

  // Crear nombre de archivo personalizado
  file.name = `comprobante_${pedido._id}${path.parse(file.name).ext}`;

  // Mover archivo
  file.mv(`${process.env.FILE_UPLOAD_PATH}/comprobantes/${file.name}`, async err => {
    if (err) {
      console.error(err);
      res.status(500);
      throw new Error('Problema al subir el archivo');
    }

    // Eliminar imagen anterior si existe
    if (pedido.imagen_comprobante !== 'no-image.jpg') {
      const imagePath = `${process.env.FILE_UPLOAD_PATH}/comprobantes/${pedido.imagen_comprobante}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Actualizar pedido con la imagen y cambiar estado a Pagado si es cliente
    const updateData = { imagen_comprobante: file.name };
    
    // Si es un cliente quien sube el comprobante, cambiar estado a Pagado
    if (req.usuario.rol === 'cliente') {
      updateData.estado_pago = 'Pagado';
      updateData.fecha_pago = Date.now();
    }

    await Pedido.findByIdAndUpdate(req.params.id, updateData);

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Obtener resumen de pedidos por actividad
// @route   GET /api/pedidos/resumen
// @access  Private/Admin
const getResumenPedidos = asyncHandler(async (req, res) => {
  const resumen = await Pedido.aggregate([
    {
      $lookup: {
        from: 'actividades',
        localField: 'actividad_id',
        foreignField: '_id',
        as: 'actividad'
      }
    },
    {
      $unwind: '$actividad'
    },
    {
      $group: {
        _id: '$actividad_id',
        actividad: { $first: '$actividad.titulo' },
        total_pedidos: { $sum: 1 },
        total_pagados: {
          $sum: {
            $cond: [{ $eq: ['$estado_pago', 'Pagado'] }, 1, 0]
          }
        },
        total_pendientes: {
          $sum: {
            $cond: [{ $eq: ['$estado_pago', 'Pendiente'] }, 1, 0]
          }
        },
        ingresos_totales: { $sum: '$costo_total' },
        ingresos_confirmados: {
          $sum: {
            $cond: [{ $eq: ['$estado_pago', 'Pagado'] }, '$costo_total', 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        actividad: 1,
        total_pedidos: 1,
        total_pagados: 1,
        total_pendientes: 1,
        ingresos_totales: 1,
        ingresos_confirmados: 1,
        porcentaje_pagados: {
          $multiply: [
            { $divide: ['$total_pagados', '$total_pedidos'] },
            100
          ]
        }
      }
    },
    {
      $sort: { actividad: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: resumen.length,
    data: resumen
  });
});

module.exports = {
  getPedidos,
  getPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  subirComprobante,
  getResumenPedidos
};