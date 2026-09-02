const { MenuCategory } = require('../models');

/** GET /api/restaurantes/:slug/categories — vista de administrador (incluye inactivas) */
async function list(req, res) {
  const categories = await MenuCategory.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['sortOrder', 'ASC']],
  });
  return res.json(categories);
}

/** POST /api/restaurantes/:slug/categories */
async function create(req, res) {
  const { name, description, imageUrl, sortOrder, isActive } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name es obligatorio.' });
  }

  const category = await MenuCategory.create({
    restaurantId: req.restaurant.id,
    name,
    description,
    imageUrl,
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
  });

  return res.status(201).json(category);
}

/** PATCH /api/restaurantes/:slug/categories/:id */
async function update(req, res) {
  const category = await MenuCategory.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });

  const EDITABLE = ['name', 'description', 'imageUrl', 'sortOrder', 'isActive'];
  const updates = {};
  for (const field of EDITABLE) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await category.update(updates);
  return res.json(category);
}

/** DELETE /api/restaurantes/:slug/categories/:id — soft delete (paranoid: true en el modelo) */
async function remove(req, res) {
  const category = await MenuCategory.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });

  await category.destroy();
  return res.status(204).send();
}

module.exports = { list, create, update, remove };
