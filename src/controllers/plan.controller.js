const { Plan } = require('../models');

/** GET /api/plans — catálogo global (FREE, BASIC, PRO, PREMIUM) */
async function list(req, res) {
  const plans = await Plan.findAll({ where: { isActive: true }, order: [['priceMonthly', 'ASC']] });
  return res.json(plans);
}

/** POST /api/plans — poco frecuente, para cuando PideDeUna agrega un plan nuevo */
async function create(req, res) {
  const { code, name, priceMonthly } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code y name son obligatorios.' });

  try {
    const plan = await Plan.create({ ...req.body, code, name, priceMonthly: priceMonthly ?? 0 });
    return res.status(201).json(plan);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un plan con ese code.' });
    }
    throw err;
  }
}

module.exports = { list, create };
