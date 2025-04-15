const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Actividad = require('../models/actividadModel');
const Opcion = require('../models/opcionModel');

// @desc    Obtener todas las actividades
// @route   GET /api/actividades
// @access  Public
const getActividades = asyncHandler(async (req, res) => {
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

  // Encontrar actividades
  query = Actividad.find(JSON.parse(queryStr));

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
  const total = await Actividad.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Ejecutar query
  const actividades = await query;

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
    count: actividades.length,
    pagination,
    data: actividades
  });
});

// @desc    Obtener una actividad
// @route   GET /api/actividades/:id
// @access  Public
const getActividad = asyncHandler(async (req, res) => {
  const actividad = await Actividad.findById(req.params.id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: actividad
  });
});

// @desc    Crear nueva actividad
// @route   POST /api/actividades
// @access  Private/Admin
const crearActividad = asyncHandler(async (req, res) => {
  const actividad = await Actividad.create(req.body);

  res.status(201).json({
    success: true,
    data: actividad
  });
});

// @desc    Actualizar actividad
// @route   PUT /api/actividades/:id
// @access  Private/Admin
const actualizarActividad = asyncHandler(async (req, res) => {
  let actividad = await Actividad.findById(req.params.id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.params.id}`);
  }

  actividad = await Actividad.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: actividad
  });
});

// @desc    Eliminar actividad
// @route   DELETE /api/actividades/:id
// @access  Private/Admin
const eliminarActividad = asyncHandler(async (req, res) => {
  const actividad = await Actividad.findById(req.params.id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.params.id}`);
  }

  // Eliminar opciones asociadas
  await Opcion.deleteMany({ actividad_id: req.params.id });

  await actividad.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Subir imagen para actividad
// @route   PUT /api/actividades/:id/imagen
// @access  Private/Admin
const subirImagenActividad = asyncHandler(async (req, res) => {
  const actividad = await Actividad.findById(req.params.id);

  if (!actividad) {
    res.status(404);
    throw new Error(`Actividad no encontrada con id ${req.params.id}`);
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
  file.name = `actividad_${actividad._id}${path.parse(file.name).ext}`;

  // Mover archivo
  file.mv(`${process.env.FILE_UPLOAD_PATH}/actividades/${file.name}`, async err => {
    if (err) {
      console.error(err);
      res.status(500);
      throw new Error('Problema al subir el archivo');
    }

    // Eliminar imagen anterior si existe
    if (actividad.imagen_promocional !== 'no-photo.jpg') {
      const imagePath = `${process.env.FILE_UPLOAD_PATH}/actividades/${actividad.imagen_promocional}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Actividad.findByIdAndUpdate(req.params.id, { imagen_promocional: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Obtener actividades con opciones
// @route   GET /api/actividades/con-opciones
// @access  Public
const getActividadesConOpciones = asyncHandler(async (req, res) => {
  const actividades = await Actividad.find({ estado: 'Activa' }).populate('opciones');

  res.status(200).json({
    success: true,
    count: actividades.length,
    data: actividades
  });
});

module.exports = {
  getActividades,
  getActividad,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  subirImagenActividad,
  getActividadesConOpciones
};