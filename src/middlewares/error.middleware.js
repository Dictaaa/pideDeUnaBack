/**
 * Envuelve un controller async para que cualquier excepción caiga
 * en el error handler de abajo, sin tener que poner try/catch en
 * cada función de cada controller.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof Object && err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }
  if (err instanceof Object && err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos únicos.' });
  }
  if (err && err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { asyncHandler, errorHandler };
