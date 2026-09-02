const { AuditLog, User } = require('../models');

/**
 * GET /api/restaurantes/:slug/audit-logs?limit=50&entityType=Product
 * Solo lectura — los registros los crea el propio backend en cada
 * acción sensible (eso se conecta cuando exista el middleware de
 * autenticación, que es quien sabe qué usuario hizo qué).
 */
async function list(req, res) {
  const where = { restaurantId: req.restaurant.id };
  if (req.query.entityType) where.entityType = req.query.entityType;

  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const logs = await AuditLog.findAll({
    where,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
  });
  return res.json(logs);
}

module.exports = { list };
