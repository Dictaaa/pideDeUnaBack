const { RestaurantArea } = require('../models');

async function list(req, res) {
  const areas = await RestaurantArea.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['sortOrder', 'ASC']],
  });
  return res.json(areas);
}

async function create(req, res) {
  const { name, description, sortOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio.' });

  const area = await RestaurantArea.create({
    restaurantId: req.restaurant.id,
    name,
    description,
    sortOrder: sortOrder ?? 0,
  });
  return res.status(201).json(area);
}

async function update(req, res) {
  const area = await RestaurantArea.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!area) return res.status(404).json({ error: 'Área no encontrada.' });

  const EDITABLE = ['name', 'description', 'sortOrder', 'status'];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  await area.update(updates);
  return res.json(area);
}

async function remove(req, res) {
  const area = await RestaurantArea.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!area) return res.status(404).json({ error: 'Área no encontrada.' });

  await area.destroy();
  return res.status(204).send();
}

module.exports = { list, create, update, remove };
