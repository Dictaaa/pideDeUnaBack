const { Permission } = require('../models');

/** GET /api/permissions */
async function list(req, res) {
  const permissions = await Permission.findAll({ order: [['code', 'ASC']] });
  return res.json(permissions);
}

/** POST /api/permissions — body: { code, description? } */
async function create(req, res) {
  const { code, description } = req.body;
  if (!code) return res.status(400).json({ error: 'code es obligatorio.' });

  try {
    const permission = await Permission.create({ code, description });
    return res.status(201).json(permission);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ese permiso ya existe.' });
    }
    throw err;
  }
}

module.exports = { list, create };
