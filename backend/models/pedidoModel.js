const mongoose = require('mongoose');

const pedidoSchema = mongoose.Schema({
  actividad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad',
    required: [true, 'Por favor seleccione una actividad']
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'Por favor seleccione un cliente']
  },
  opcion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opcion',
    required: [true, 'Por favor seleccione una opción']
  },
  cantidad: {
    type: Number,
    required: [true, 'Por favor ingrese la cantidad'],
    min: [1, 'La cantidad debe ser al menos 1']
  },
  costo_unitario: {
    type: Number,
    required: [true, 'Por favor ingrese el costo unitario']
  },
  costo_total: {
    type: Number,
    required: [true, 'Por favor ingrese el costo total']
  },
  estado_pago: {
    type: String,
    enum: ['Pendiente', 'Pagado'],
    default: 'Pendiente'
  },
  imagen_comprobante: {
    type: String,
    default: 'no-image.jpg'
  },
  fecha_pedido: {
    type: Date,
    default: Date.now
  },
  fecha_pago: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'fecha_pedido',
    updatedAt: 'fecha_actualizacion'
  }
});

// Middleware para calcular el costo total antes de guardar
pedidoSchema.pre('save', function(next) {
  this.costo_total = this.cantidad * this.costo_unitario;
  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);