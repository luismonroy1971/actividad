const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para el desarrollador
  console.log(err.stack.red);

  // Mongoose error de ID inválido
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose error de validación
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose error de duplicado
  if (err.code === 11000) {
    const message = 'Valor duplicado ingresado';
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor'
  });
};

module.exports = { errorHandler };