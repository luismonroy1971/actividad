const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usuarioSchema = mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: false
  },
  nombre_usuario: {
    type: String,
    required: [true, 'Por favor ingrese un nombre de usuario'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['superadmin', 'admin', 'admin_actividad', 'cliente'],
    default: 'cliente'
  },
  actividades_administradas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Actividad'
  }],
  ultimo_acceso: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  }
});

// Encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar contraseña
usuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar token JWT
usuarioSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('Usuario', usuarioSchema);