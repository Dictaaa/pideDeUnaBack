const { ModifierGroup, Modifier } = require('../models');

/** GET /api/restaurantes/:slug/modifier-groups — con sus opciones anidadas */
async function list(req, res) {
  const groups = await ModifierGroup.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['sortOrder', 'ASC']],
    include: [{ model: Modifier, as: 'modifiers', order: [['sortOrder', 'ASC']] }],
  });
  return res.json(groups);
}

/**
 * POST /api/restaurantes/:slug/modifier-groups
 * body: { name, minSelections?, maxSelections?, required?, sortOrder?,
 *         options?: [{ name, price, sortOrder? }, ...] }
 * Permite crear el grupo y sus opciones en un solo request, que es
 * como se arma normalmente desde el panel ("Término de cocción" +
 * sus 3 opciones de una vez).
 */
async function create(req, res) {
  const { name, minSelections, maxSelections, required, sortOrder, options } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio.' });

  const group = await ModifierGroup.create({
    restaurantId: req.restaurant.id,
    name,
    minSelections: minSelections ?? 0,
    maxSelections: maxSelections ?? 1,
    required: required ?? false,
    sortOrder: sortOrder ?? 0,
  });

  if (Array.isArray(options) && options.length) {
    await Modifier.bulkCreate(
      options.map((opt, i) => ({
        restaurantId: req.restaurant.id,
        modifierGroupId: group.id,
        name: opt.name,
        price: opt.price ?? 0,
        sortOrder: opt.sortOrder ?? i,
      }))
    );
  }

  const fresh = await ModifierGroup.findByPk(group.id, {
    include: [{ model: Modifier, as: 'modifiers' }],
  });
  return res.status(201).json(fresh);
}

/** PATCH /api/restaurantes/:slug/modifier-groups/:id — solo datos del grupo, no sus opciones */
async function update(req, res) {
  const group = await ModifierGroup.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });

  const EDITABLE = ['name', 'minSelections', 'maxSelections', 'required', 'sortOrder'];
  const updates = {};
  for (const field of EDITABLE) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  try {
    await group.update(updates);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    throw err;
  }

  return res.json(group);
}

/** DELETE /api/restaurantes/:slug/modifier-groups/:id — borra el grupo y en cascada sus opciones */
async function remove(req, res) {
  const group = await ModifierGroup.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });

  await group.destroy();
  return res.status(204).send();
}

/** POST /api/restaurantes/:slug/modifier-groups/:groupId/options — agrega UNA opción al grupo */
async function addOption(req, res) {
  const group = await ModifierGroup.findOne({
    where: { id: req.params.groupId, restaurantId: req.restaurant.id },
  });
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });

  const { name, price, sortOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio.' });

  const option = await Modifier.create({
    restaurantId: req.restaurant.id,
    modifierGroupId: group.id,
    name,
    price: price ?? 0,
    sortOrder: sortOrder ?? 0,
  });

  return res.status(201).json(option);
}

/** PATCH /api/restaurantes/:slug/modifier-groups/:groupId/options/:optionId */
async function updateOption(req, res) {
  const option = await Modifier.findOne({
    where: {
      id: req.params.optionId,
      modifierGroupId: req.params.groupId,
      restaurantId: req.restaurant.id,
    },
  });
  if (!option) return res.status(404).json({ error: 'Opción no encontrada.' });

  const EDITABLE = ['name', 'price', 'isActive', 'sortOrder'];
  const updates = {};
  for (const field of EDITABLE) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await option.update(updates);
  return res.json(option);
}

/** DELETE /api/restaurantes/:slug/modifier-groups/:groupId/options/:optionId */
async function removeOption(req, res) {
  const option = await Modifier.findOne({
    where: {
      id: req.params.optionId,
      modifierGroupId: req.params.groupId,
      restaurantId: req.restaurant.id,
    },
  });
  if (!option) return res.status(404).json({ error: 'Opción no encontrada.' });

  await option.destroy();
  return res.status(204).send();
}

module.exports = { list, create, update, remove, addOption, updateOption, removeOption };
