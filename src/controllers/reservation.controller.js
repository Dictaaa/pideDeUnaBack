const { Reservation } = require('../models');

/** GET /api/restaurantes/:slug/reservations?date=YYYY-MM-DD (opcional) */
async function list(req, res) {
  const where = { restaurantId: req.restaurant.id };
  if (req.query.date) where.reservationDate = req.query.date;

  const reservations = await Reservation.findAll({
    where,
    order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']],
  });
  return res.json(reservations);
}

async function create(req, res) {
  const { customerName, reservationDate, reservationTime, guestCount } = req.body;
  if (!customerName || !reservationDate || !reservationTime) {
    return res.status(400).json({ error: 'customerName, reservationDate y reservationTime son obligatorios.' });
  }

  const CREATABLE = ['customerId', 'tableId', 'customerName', 'customerPhone', 'reservationDate', 'reservationTime', 'guestCount', 'notes'];
  const data = { restaurantId: req.restaurant.id };
  for (const f of CREATABLE) if (req.body[f] !== undefined) data[f] = req.body[f];
  if (guestCount === undefined) data.guestCount = 1;

  const reservation = await Reservation.create(data);
  return res.status(201).json(reservation);
}

async function update(req, res) {
  const reservation = await Reservation.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

  const EDITABLE = ['tableId', 'customerName', 'customerPhone', 'reservationDate', 'reservationTime', 'guestCount', 'status', 'notes'];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  await reservation.update(updates);
  return res.json(reservation);
}

async function remove(req, res) {
  const reservation = await Reservation.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

  await reservation.update({ status: 'CANCELLED' }); // no se borra, se marca cancelada (historial)
  return res.json(reservation);
}

module.exports = { list, create, update, remove };
