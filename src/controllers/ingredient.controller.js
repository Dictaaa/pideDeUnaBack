const { Ingredient } = require('../models');

/** GET /api/restaurantes/:slug/ingredients */
async function list(req, res) {
  const ingredients = await Ingredient.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['name', 'ASC']],
  });
  return res.json(ingredients);
}

/** POST /api/restaurantes/:slug/ingredients — body: { name } */
async function create(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio.' });

  try {
    const ingredient = await Ingredient.create({ restaurantId: req.restaurant.id, name });
    return res.status(201).json(ingredient);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ese ingrediente ya existe en este restaurante.' });
    }
    throw err;
  }
}

/** DELETE /api/restaurantes/:slug/ingredients/:id */
async function remove(req, res) {
  const ingredient = await Ingredient.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!ingredient) return res.status(404).json({ error: 'Ingrediente no encontrado.' });

  await ingredient.destroy();
  return res.status(204).send();
}

module.exports = { list, create, remove };
