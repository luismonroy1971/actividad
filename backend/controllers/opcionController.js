const asyncHandler = require('express-async-handler');
const Opcion = require('../models/opcionModel');
const Actividad = require('../models/actividadModel');

// @desc    Obtener todas las opciones
// @route   GET /api/opciones
// @access  Public
const getOpciones = asyncHandler(async (req, res) => {
  let query;

  // Si hay un ID de actividad en los parámetros, filtrar por actividad
  if (req.query.actividad_id) {
    query = Opcion.find({ actividad_id: req.query.actividad_id });
  } else {
    query = Opcion.find().populate({
      path: 'actividad_id',
      select: 'titulo fecha_actividad estado'
    });
  }

  // Ejecutar query
  const opciones = await query;

  res.status(200).json({
    success: true,
    count: opciones.length,
    data: opciones
  });
});

// @desc    Obtener una opción
// @route   GET /api/opciones/:id
// @access  Public
const getOpcion = asyncHandler(async (req, res) => {
  const opcion = await Opcion.findById(req.params.id).populate({
    path: 'actividad_id',
    select: 'titulo fecha_actividad estado'
  });

  if (!opcion) {
    res.status(404);
    throw new Error(`Opción no encontrada con id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: opcion
  });
});

// @desc    Crear nueva opción
// @route   POST /api/opciones
// @access  Private/Admin
const crearOpcion = asyncHandler(async (req, res) => {
  // Verificar que la actividad existe
  const actividad = await Actividad.findById(req.body.actividad_id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.body.actividad_id}`);
  }

  const opcion = await Opcion.create(req.body);

  res.status(201).json({
    success: true,
    data: opcion
  });
});

// @desc    Actualizar opción
// @route   PUT /api/opciones/:id
// @access  Private/Admin
const actualizarOpcion = asyncHandler(async (req, res) => {
  let opcion = await Opcion.findById(req.params.id);

  if (!opcion) {
    res.status(404);
    throw new Error(`Opción no encontrada con id ${req.params.id}`);
  }

  // Si se está actualizando la actividad, verificar que existe
  if (req.body.actividad_id) {
    const actividad = await Actividad.findById(req.body.actividad_id);

    if (!actividad) {
      res.status(404);
      throw new Error(`Actividad no encontrada con id ${req.body.actividad_id}`);
    }
  }

  opcion = await Opcion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: opcion
  });
});

// @desc    Eliminar opción
// @route   DELETE /api/opciones/:id
// @access  Private/Admin
const eliminarOpcion = asyncHandler(async (req, res) => {
  const opcion = await Opcion.findById(req.params.id);

  if (!opcion) {
    res.status(404);
    throw new Error(`Opción no encontrada con id ${req.params.id}`);
  }

  await Opcion.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtener opciones por actividad
// @route   GET /api/actividades/:actividadId/opciones
// @access  Public
const getOpcionesPorActividad = asyncHandler(async (req, res) => {
  const actividad = await Actividad.findById(req.params.actividadId);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.params.actividadId}`);
  }

  const opciones = await Opcion.find({ actividad_id: req.params.actividadId });

  res.status(200).json({
    success: true,
    count: opciones.length,
    data: opciones
  });
});

module.exports = {
  getOpciones,
  getOpcion,
  crearOpcion,
  actualizarOpcion,
  eliminarOpcion,
  getOpcionesPorActividad
};