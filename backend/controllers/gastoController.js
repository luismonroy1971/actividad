const asyncHandler = require('express-async-handler');
const Gasto = require('../models/gastoModel');
const Actividad = require('../models/actividadModel');
const Pedido = require('../models/pedidoModel');

// @desc    Crear un nuevo gasto
// @route   POST /api/gastos
// @access  Private/Admin/AdminActividad
const crearGasto = asyncHandler(async (req, res) => {
  const { actividad_id, concepto, monto, fecha_gasto, tipo, descripcion } = req.body;

  // Verificar que la actividad exista
  const actividad = await Actividad.findById(actividad_id);
  if (!actividad) {
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && !req.usuario.actividades_administradas.includes(actividad_id)) {
    res.status(403);
    throw new Error('No tiene permiso para administrar esta actividad');
  }

  const gasto = await Gasto.create({
    actividad_id,
    concepto,
    monto,
    fecha_gasto: fecha_gasto || Date.now(),
    tipo,
    descripcion,
    registrado_por: req.usuario._id
  });

  res.status(201).json({
    success: true,
    data: gasto
  });
});

// @desc    Obtener todos los gastos de una actividad
// @route   GET /api/gastos/actividad/:actividadId
// @access  Private/Admin/AdminActividad
const getGastosPorActividad = asyncHandler(async (req, res) => {
  const { actividadId } = req.params;

  // Verificar que la actividad exista
  const actividad = await Actividad.findById(actividadId);
  if (!actividad) {
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && !req.usuario.actividades_administradas.includes(actividadId)) {
    res.status(403);
    throw new Error('No tiene permiso para administrar esta actividad');
  }

  const gastos = await Gasto.find({ actividad_id: actividadId })
    .populate('registrado_por', 'nombre_usuario')
    .sort({ fecha_gasto: -1 });

  res.json({
    success: true,
    count: gastos.length,
    data: gastos
  });
});

// @desc    Obtener un gasto por ID
// @route   GET /api/gastos/:id
// @access  Private/Admin/AdminActividad
const getGastoById = asyncHandler(async (req, res) => {
  const gasto = await Gasto.findById(req.params.id)
    .populate('registrado_por', 'nombre_usuario')
    .populate('actividad_id', 'titulo');

  if (!gasto) {
    res.status(404);
    throw new Error('Gasto no encontrado');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && 
      !req.usuario.actividades_administradas.includes(gasto.actividad_id._id.toString())) {
    res.status(403);
    throw new Error('No tiene permiso para ver este gasto');
  }

  res.json({
    success: true,
    data: gasto
  });
});

// @desc    Actualizar un gasto
// @route   PUT /api/gastos/:id
// @access  Private/Admin/AdminActividad
const actualizarGasto = asyncHandler(async (req, res) => {
  let gasto = await Gasto.findById(req.params.id);

  if (!gasto) {
    res.status(404);
    throw new Error('Gasto no encontrado');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && 
      !req.usuario.actividades_administradas.includes(gasto.actividad_id.toString())) {
    res.status(403);
    throw new Error('No tiene permiso para actualizar este gasto');
  }

  gasto = await Gasto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: gasto
  });
});

// @desc    Eliminar un gasto
// @route   DELETE /api/gastos/:id
// @access  Private/Admin/AdminActividad
const eliminarGasto = asyncHandler(async (req, res) => {
  const gasto = await Gasto.findById(req.params.id);

  if (!gasto) {
    res.status(404);
    throw new Error('Gasto no encontrado');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && 
      !req.usuario.actividades_administradas.includes(gasto.actividad_id.toString())) {
    res.status(403);
    throw new Error('No tiene permiso para eliminar este gasto');
  }

  await gasto.remove();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Obtener resumen financiero de una actividad
// @route   GET /api/gastos/resumen/:actividadId
// @access  Private/Admin/AdminActividad
const getResumenFinanciero = asyncHandler(async (req, res) => {
  const { actividadId } = req.params;

  // Verificar que la actividad exista
  const actividad = await Actividad.findById(actividadId);
  if (!actividad) {
    res.status(404);
    throw new Error('Actividad no encontrada');
  }

  // Si es admin_actividad, verificar que tenga permiso para esta actividad
  if (req.usuario.rol === 'admin_actividad' && 
      !req.usuario.actividades_administradas.some(id => id.toString() === actividadId.toString())) {
    res.status(403);
    throw new Error('No tiene permiso para ver esta información');
  }

  // Calcular total de gastos
  const gastosFijos = await Gasto.aggregate([
    { $match: { actividad_id: mongoose.Types.ObjectId(actividadId), tipo: 'Fijo' } },
    { $group: { _id: null, total: { $sum: '$monto' } } }
  ]);
  
  const gastosVariables = await Gasto.aggregate([
    { $match: { actividad_id: mongoose.Types.ObjectId(actividadId), tipo: 'Variable' } },
    { $group: { _id: null, total: { $sum: '$monto' } } }
  ]);

  const gastosFijosTotal = gastosFijos.length > 0 ? gastosFijos[0].total : 0;
  const gastosVariablesTotal = gastosVariables.length > 0 ? gastosVariables[0].total : 0;
  const gastosTotales = gastosFijosTotal + gastosVariablesTotal;

  // Calcular total de ingresos (pedidos pagados)
  const ingresos = await Pedido.aggregate([
    {
      $match: { 
        actividad_id: mongoose.Types.ObjectId(actividadId),
        estado_pago: 'Pagado'
      }
    },
    {
      $group: {
        _id: null,
        totalIngresos: { $sum: '$costo_total' },
        cantidadPedidos: { $sum: 1 }
      }
    }
  ]);

  const ingresos_totales = ingresos.length > 0 ? ingresos[0].totalIngresos : 0;
  const cantidad_pedidos = ingresos.length > 0 ? ingresos[0].cantidadPedidos : 0;

  // Calcular punto de equilibrio y rentabilidad
  let punto_equilibrio = 0;
  if (ingresos_totales > 0 && gastosVariablesTotal > 0) {
    const margen_contribucion = 1 - (gastosVariablesTotal / ingresos_totales);
    punto_equilibrio = margen_contribucion > 0 ? gastosFijosTotal / margen_contribucion : 0;
  } else if (gastosFijosTotal > 0) {
    punto_equilibrio = gastosFijosTotal; // Si no hay ingresos o gastos variables, el punto de equilibrio es igual a los gastos fijos
  }
  
  const balance = ingresos_totales - gastosTotales;
  const rentabilidad_porcentaje = ingresos_totales > 0 ? (balance / ingresos_totales) * 100 : 0;

  res.json({
    success: true,
    ingresos_totales,
    gastos_totales: gastosTotales,
    gastos_fijos: gastosFijosTotal,
    gastos_variables: gastosVariablesTotal,
    cantidad_pedidos,
    punto_equilibrio,
    balance,
    rentabilidad_porcentaje
  });
});
;

module.exports = {
  crearGasto,
  getGastosPorActividad,
  getGastoById,
  actualizarGasto,
  eliminarGasto,
  getResumenFinanciero
};