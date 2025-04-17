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

  await Actividad.deleteOne({ _id: req.params.id });

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

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
    res.status(400);
    throw new Error('Por favor suba un archivo');
  }

  const file = req.files.file;

  // Verificar que es una imagen
  if (!file.mimetype.startsWith('image')) {
    res.status(400);
    throw new Error('Por favor suba una imagen');
  }

  // Verificar tamaño (se configura en server.js con fileUpload middleware)
  const MAX_SIZE = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB por defecto
  if (file.size > MAX_SIZE) {
    res.status(400);
    throw new Error(`Por favor suba una imagen menor a ${MAX_SIZE / 1000000} MB`);
  }

  try {
    // Crear nombre de archivo personalizado con timestamp para evitar conflictos
    const timestamp = Date.now();
    const fileExt = path.parse(file.name).ext;
    const fileName = `actividad_${actividad._id}_${timestamp}${fileExt}`;
    
    // Directorio destino
    const uploadPath = path.join(__dirname, '../../uploads/actividades');
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Ruta completa del archivo
    const filePath = path.join(uploadPath, fileName);
    
    // Intentar eliminar imagen anterior si existe
    if (actividad.imagen_promocional && actividad.imagen_promocional !== 'no-photo.jpg') {
      const oldImagePath = path.join(uploadPath, actividad.imagen_promocional);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log(`Imagen anterior eliminada: ${actividad.imagen_promocional}`);
        } catch (unlinkErr) {
          console.error(`No se pudo eliminar imagen anterior: ${unlinkErr.message}`);
          // Continuar con el proceso aunque falle la eliminación
        }
      }
    }
    
    // Mover el archivo usando una promesa para mejor manejo de errores
    await new Promise((resolve, reject) => {
      file.mv(filePath, (err) => {
        if (err) {
          console.error('Error al mover el archivo:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    // Actualizar referencia en la base de datos
    actividad.imagen_promocional = fileName;
    await actividad.save();
    
    res.status(200).json({
      success: true,
      data: fileName
    });
    
  } catch (error) {
    console.error('Error en subirImagenActividad:', error);
    res.status(500);
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }
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