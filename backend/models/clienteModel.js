const mongoose = require('mongoose');

const clienteSchema = mongoose.Schema({
  nombre_completo: {
    type: String,
    required: [true, 'Por favor ingrese el nombre completo'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'Por favor ingrese un correo electrónico'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un correo electrónico válido'
    ]
  },
  documento_identidad: {
    type: String,
    required: [true, 'Por favor ingrese el documento de identidad'],
    unique: true,
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'Por favor ingrese un número de teléfono'],
    unique: true,
    trim: true
  },
  pregunta_validacion: {
    type: String,
    required: [true, 'Por favor ingrese una pregunta de validación']
  },
  respuesta_validacion: {
    type: String,
    required: [true, 'Por favor ingrese la respuesta a la pregunta de validación']
  },
  grupo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    default: null
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
clienteSchema.virtual('pedidos', {
  ref: 'Pedido',
  localField: '_id',
  foreignField: 'cliente_id',
  justOne: false
});

// Cascade delete usuario when a cliente is deleted
clienteSchema.pre('remove', async function(next) {
  await this.model('Usuario').deleteMany({ cliente_id: this._id });
  next();
});

module.exports = mongoose.model('Cliente', clienteSchema);