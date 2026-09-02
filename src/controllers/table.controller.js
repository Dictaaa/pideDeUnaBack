const { Table, TableQrCode, RestaurantArea } = require('../models');

async function list(req, res) {
  const tables = await Table.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['tableNumber', 'ASC']],
    include: [
      { model: RestaurantArea, as: 'area' },
      { model: TableQrCode, as: 'qrCodes', where: { isActive: true }, required: false },
    ],
  });
  return res.json(tables);
}

/** POST /api/restaurantes/:slug/tables — crea la mesa Y su primer QR de una vez */
async function create(req, res) {
  const { tableNumber, name, areaId, capacity } = req.body;
  if (!tableNumber) return res.status(400).json({ error: 'tableNumber es obligatorio.' });

  let table;
  try {
    table = await Table.create({
      restaurantId: req.restaurant.id,
      tableNumber,
      name,
      areaId,
      capacity: capacity ?? 4,
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una mesa con ese número en este restaurante.' });
    }
    throw err;
  }

  const qr = await TableQrCode.create({ restaurantId: req.restaurant.id, tableId: table.id });

  return res.status(201).json({ ...table.toJSON(), qrCodes: [qr] });
}

async function update(req, res) {
  const table = await Table.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada.' });

  const EDITABLE = ['tableNumber', 'name', 'areaId', 'capacity', 'status'];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  try {
    await table.update(updates);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una mesa con ese número en este restaurante.' });
    }
    throw err;
  }
  return res.json(table);
}

async function remove(req, res) {
  const table = await Table.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada.' });

  await table.destroy(); // soft delete (paranoid: true)
  return res.status(204).send();
}

/**
 * POST /api/restaurantes/:slug/tables/:id/qr/regenerate
 * Desactiva el QR activo actual (sin borrarlo, queda como historial)
 * y crea uno nuevo — la mesa sigue siendo la misma, solo cambia el token.
 */
async function regenerateQr(req, res) {
  const table = await Table.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada.' });

  await TableQrCode.update({ isActive: false }, { where: { tableId: table.id, isActive: true } });
  const qr = await TableQrCode.create({ restaurantId: req.restaurant.id, tableId: table.id });

  return res.status(201).json(qr);
}

module.exports = { list, create, update, remove, regenerateQr };
