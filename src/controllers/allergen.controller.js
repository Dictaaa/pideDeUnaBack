const { Allergen } = require('../models');

/** GET /api/alergenos — catálogo global, compartido entre todos los restaurantes */
async function list(req, res) {
  const allergens = await Allergen.findAll({ order: [['name', 'ASC']] });
  return res.json(allergens);
}

/**
 * POST /api/alergenos — body: { name, iconUrl? }
 * Poco frecuente (el catálogo ya trae los comunes desde el seed),
 * pero útil si un restaurante necesita uno que no está en la lista.
 */
async function create(req, res) {
  const { name, iconUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio.' });

  try {
    const allergen = await Allergen.create({ name, iconUrl });
    return res.status(201).json(allergen);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ese alérgeno ya existe en el catálogo.' });
    }
    throw err;
  }
}

module.exports = { list, create };
