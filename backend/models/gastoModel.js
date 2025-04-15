const mongoose = require('mongoose');

const gastoSchema = mongoose.Schema({
  actividad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    required: [true, 'Por favor seleccione una actividad']
  },
  concepto: {
    type: String,
    required: [true, 'Por favor ingrese el concepto del gasto'],
    trim: true
  },
  monto: {
    type: Number,
    required: [true, 'Por favor ingrese el monto del gasto'],
    min: [0, 'El monto no puede ser negativo']
  },
  fecha_gasto: {
    type: Date,
    default: Date.now,
    required: [true, 'Por favor ingrese la fecha del gasto']
  },
  tipo: {
    type: String,
    enum: ['Fijo', 'Variable'],
    required: [true, 'Por favor seleccione el tipo de gasto']
  },
  comprobante: {
    type: String,
    default: 'no-image.jpg'
  },
  descripcion: {
    type: String,
    trim: true
  },
  registrado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'Por favor indique quién registra el gasto']
  }
}, {
  timestamps: {
    createdAt: 'fecha_registro',
    updatedAt: 'fecha_actualizacion'
  }
});

// Método estático para calcular el total de gastos por actividad
gastoSchema.statics.calcularTotalGastos = async function(actividadId) {
  const result = await this.aggregate([
    {
      $match: { actividad_id: mongoose.Types.ObjectId(actividadId) }
    },
    {
      $group: {
        _id: '$actividad_id',
        totalGastos: { $sum: '$monto' },
        gastosFijos: { $sum: { $cond: [{ $eq: ['$tipo', 'Fijo'] }, '$monto', 0] } },
        gastosVariables: { $sum: { $cond: [{ $eq: ['$tipo', 'Variable'] }, '$monto', 0] } }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { totalGastos: 0, gastosFijos: 0, gastosVariables: 0 };
};

module.exports = mongoose.model('Gasto', gastoSchema);