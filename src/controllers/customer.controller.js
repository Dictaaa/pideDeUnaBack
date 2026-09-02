const { Customer } = require('../models');

async function list(req, res) {
  const customers = await Customer.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['createdAt', 'DESC']],
  });
  return res.json(customers);
}

/** POST /api/restaurantes/:slug/customers — body: { name?, phone?, email? } (todo opcional, ver customers en el schema) */
async function create(req, res) {
  const { name, phone, email } = req.body;
  const customer = await Customer.create({ restaurantId: req.restaurant.id, name, phone, email });
  return res.status(201).json(customer);
}

async function update(req, res) {
  const customer = await Customer.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!customer) return res.status(404).json({ error: 'Cliente no encontrado.' });

  const EDITABLE = ['name', 'phone', 'email'];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  await customer.update(updates);
  return res.json(customer);
}

module.exports = { list, create, update };
