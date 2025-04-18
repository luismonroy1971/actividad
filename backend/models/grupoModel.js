const mongoose = require('mongoose');

const grupoSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese un nombre para el grupo'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  descripcion: {
    type: String,
    trim: true
  },
  actividad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    required: [true, 'Por favor seleccione una actividad']
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals - clientes en este grupo
grupoSchema.virtual('clientes', {
  ref: 'Cliente',
  localField: '_id',
  foreignField: 'grupo_id',
  justOne: false
});

module.exports = mongoose.model('Grupo', grupoSchema);