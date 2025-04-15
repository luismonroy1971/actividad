const mongoose = require('mongoose');

const opcionSchema = mongoose.Schema({
  actividad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    required: [true, 'Por favor ingrese la actividad a la que pertenece esta opción']
  },
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese un nombre para la opción'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'Por favor ingrese el precio de la opción'],
    min: [0, 'El precio no puede ser negativo']
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  }
});

module.exports = mongoose.model('Opcion', opcionSchema);