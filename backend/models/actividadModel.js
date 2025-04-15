const mongoose = require('mongoose');

const actividadSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Por favor ingrese un título para la actividad'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    trim: true
  },
  fecha_actividad: {
    type: Date,
    required: [true, 'Por favor ingrese la fecha de la actividad']
  },
  lugar: {
    type: String,
    required: [true, 'Por favor ingrese el lugar de la actividad'],
    trim: true
  },
  estado: {
    type: String,
    enum: ['Activa', 'Finalizada', 'Cancelada'],
    default: 'Activa'
  },
  imagen_promocional: {
    type: String,
    default: 'no-photo.jpg'
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete opciones when an actividad is deleted
actividadSchema.pre('remove', async function(next) {
  await this.model('Opcion').deleteMany({ actividad_id: this._id });
  next();
});

// Reverse populate with virtuals
actividadSchema.virtual('opciones', {
  ref: 'Opcion',
  localField: '_id',
  foreignField: 'actividad_id',
  justOne: false
});

module.exports = mongoose.model('Actividad', actividadSchema);