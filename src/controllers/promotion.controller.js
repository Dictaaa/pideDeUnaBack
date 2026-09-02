const { Promotion, Product } = require('../models');

async function list(req, res) {
  const promotions = await Promotion.findAll({
    where: { restaurantId: req.restaurant.id },
    include: [{ model: Product, as: 'products', through: { attributes: [] } }],
  });
  return res.json(promotions);
}

async function create(req, res) {
  const { name, promoType } = req.body;
  if (!name || !promoType) return res.status(400).json({ error: 'name y promoType son obligatorios.' });

  const CREATABLE = [
    'name', 'description', 'promoType', 'percentage', 'fixedAmount', 'buyQuantity', 'getQuantity',
    'startDate', 'endDate', 'startTime', 'endTime', 'daysOfWeek', 'maxUses', 'isActive',
  ];
  const data = { restaurantId: req.restaurant.id };
  for (const f of CREATABLE) if (req.body[f] !== undefined) data[f] = req.body[f];

  const promotion = await Promotion.create(data);

  if (Array.isArray(req.body.productIds) && req.body.productIds.length) {
    await promotion.setProducts(req.body.productIds);
  }

  const fresh = await Promotion.findByPk(promotion.id, {
    include: [{ model: Product, as: 'products', through: { attributes: [] } }],
  });
  return res.status(201).json(fresh);
}

async function update(req, res) {
  const promotion = await Promotion.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!promotion) return res.status(404).json({ error: 'Promoción no encontrada.' });

  const EDITABLE = [
    'name', 'description', 'percentage', 'fixedAmount', 'buyQuantity', 'getQuantity',
    'startDate', 'endDate', 'startTime', 'endTime', 'daysOfWeek', 'maxUses', 'isActive',
  ];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  await promotion.update(updates);
  return res.json(promotion);
}

/** PUT /api/restaurantes/:slug/promotions/:id/products — body: { productIds: [...] } */
async function setProducts(req, res) {
  const promotion = await Promotion.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!promotion) return res.status(404).json({ error: 'Promoción no encontrada.' });

  await promotion.setProducts(req.body.productIds || []);
  const fresh = await Promotion.findByPk(promotion.id, {
    include: [{ model: Product, as: 'products', through: { attributes: [] } }],
  });
  return res.json(fresh.products);
}

async function remove(req, res) {
  const promotion = await Promotion.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!promotion) return res.status(404).json({ error: 'Promoción no encontrada.' });

  await promotion.update({ isActive: false }); // se desactiva, no se borra (por si ya se usó en pedidos)
  return res.json(promotion);
}

module.exports = { list, create, update, setProducts, remove };
