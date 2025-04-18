const asyncHandler = require('express-async-handler');
const Grupo = require('../models/grupoModel');
const Cliente = require('../models/clienteModel');

// @desc    Obtener todos los grupos
// @route   GET /api/grupos
// @access  Private/Admin
const getGrupos = asyncHandler(async (req, res) => {
  // Filtrar por actividad si se proporciona
  let query = {};
  if (req.query.actividad) {
    query.actividad_id = req.query.actividad;
  }

  // Encontrar grupos
  const grupos = await Grupo.find(query).populate('actividad_id', 'titulo fecha_actividad');

  res.status(200).json({
    success: true,
    count: grupos.length,
    data: grupos
  });
});

// @desc    Obtener un grupo
// @route   GET /api/grupos/:id
// @access  Private/Admin
const getGrupo = asyncHandler(async (req, res) => {
  const grupo = await Grupo.findById(req.params.id)
    .populate('actividad_id', 'titulo fecha_actividad')
    .populate('clientes');

  if (!grupo) {
    res.status(404);
    throw new Error(`Grupo no encontrado con id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: grupo
  });
});

// @desc    Crear un grupo
// @route   POST /api/grupos
// @access  Private/Admin
const crearGrupo = asyncHandler(async (req, res) => {
  const grupo = await Grupo.create(req.body);

  res.status(201).json({
    success: true,
    data: grupo
  });
});

// @desc    Actualizar un grupo
// @route   PUT /api/grupos/:id
// @access  Private/Admin
const actualizarGrupo = asyncHandler(async (req, res) => {
  let grupo = await Grupo.findById(req.params.id);

  if (!grupo) {
    res.status(404);
    throw new Error(`Grupo no encontrado con id ${req.params.id}`);
  }

  grupo = await Grupo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: grupo
  });
});

// @desc    Eliminar un grupo
// @route   DELETE /api/grupos/:id
// @access  Private/Admin
const eliminarGrupo = asyncHandler(async (req, res) => {
  const grupo = await Grupo.findById(req.params.id);

  if (!grupo) {
    res.status(404);
    throw new Error(`Grupo no encontrado con id ${req.params.id}`);
  }

  // Actualizar clientes que pertenecen a este grupo
  await Cliente.updateMany({ grupo_id: req.params.id }, { grupo_id: null });

  await Grupo.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Agregar cliente a un grupo
// @route   PUT /api/grupos/:id/clientes/:clienteId
// @access  Private/Admin
const agregarClienteAGrupo = asyncHandler(async (req, res) => {
  const grupo = await Grupo.findById(req.params.id);
  const cliente = await Cliente.findById(req.params.clienteId);

  if (!grupo) {
    res.status(404);
    throw new Error(`Grupo no encontrado con id ${req.params.id}`);
  }

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.clienteId}`);
  }

  // Actualizar el cliente con el grupo asignado
  cliente.grupo_id = grupo._id;
  await cliente.save();

  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Quitar cliente de un grupo
// @route   DELETE /api/grupos/:id/clientes/:clienteId
// @access  Private/Admin
const quitarClienteDeGrupo = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.clienteId);

  if (!cliente) {
    res.status(404);
    throw new Error(`Cliente no encontrado con id ${req.params.clienteId}`);
  }

  // Verificar que el cliente pertenezca al grupo especificado
  if (cliente.grupo_id && cliente.grupo_id.toString() !== req.params.id) {
    res.status(400);
    throw new Error('El cliente no pertenece a este grupo');
  }

  // Quitar el cliente del grupo
  cliente.grupo_id = null;
  await cliente.save();

  res.status(200).json({
    success: true,
    data: cliente
  });
});

module.exports = {
  getGrupos,
  getGrupo,
  crearGrupo,
  actualizarGrupo,
  eliminarGrupo,
  agregarClienteAGrupo,
  quitarClienteDeGrupo
};