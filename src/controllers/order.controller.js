const { Order, OrderItem, Table, TableSession, Product, Payment, sequelize } = require('../models');

// Cómo se cobró un pedido — cubre los 3 escenarios reales de un
// restaurante: efectivo, tarjeta por datáfono aparte (no procesamos el
// cobro, solo lo registramos), pasarela en línea (Wompi/ePayco, si el
// restaurante la tiene conectada por fuera), o "otro" para lo que no
// encaje. Esto NO integra Wompi/ePayco de verdad (eso pediría checkout,
// webhooks, llaves de API) — es un registro manual de trazabilidad.
const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER', 'WOMPI', 'EPAYCO', 'OTHER'];

// Estados que todavía están "vivos" — los que ve la mesera/cocina por defecto.
const ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'READY'];

// Secuencia que puede avanzar la COCINA con su único botón.
// PENDING -> PREPARING -> READY. De ahí en adelante, ya no es cosa de cocina.
const KITCHEN_NEXT = { PENDING: 'PREPARING', PREPARING: 'READY' };

const ORDER_INCLUDE = [
  { model: OrderItem, as: 'items' },
  { model: Table, as: 'table', attributes: ['id', 'tableNumber', 'name'] },
];

/** Reutiliza next_order_number(uuid) — la función SQL que ya evita colisiones bajo concurrencia. */
async function nextOrderNumber(restaurantId) {
  const [row] = await sequelize.query('SELECT next_order_number(:restaurantId) AS number', {
    replacements: { restaurantId },
    type: sequelize.QueryTypes.SELECT,
  });
  return row.number;
}

/** GET /api/restaurantes/:slug/orders?status=active|all|<ESTADO> */
async function list(req, res) {
  const where = { restaurantId: req.restaurant.id };
  const statusParam = req.query.status;

  if (!statusParam || statusParam === 'active') {
    where.status = ACTIVE_STATUSES;
  } else if (statusParam !== 'all') {
    where.status = statusParam;
  }

  const orders = await Order.findAll({
    where,
    include: ORDER_INCLUDE,
    order: [['createdAt', 'ASC']],
  });
  return res.json(orders);
}

/**
 * POST /api/restaurantes/:slug/orders
 * body: { tableId, customerName?, items: [{ productId, quantity }] }
 * La mesera arma el pedido: escoge la mesa (obligatoria), el nombre del
 * cliente es opcional. Abre una sesión de mesa sola si no hay una
 * abierta — ella nunca maneja sesiones directamente.
 */
async function create(req, res) {
  const { tableId, customerName, items } = req.body;
  if (!tableId) {
    return res.status(400).json({ error: 'tableId es obligatorio (la mesa no puede faltar).' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido necesita al menos un producto.' });
  }

  const table = await Table.findOne({ where: { id: tableId, restaurantId: req.restaurant.id } });
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada.' });

  let session = await TableSession.findOne({ where: { tableId: table.id, status: 'OPEN' } });
  if (!session) {
    session = await TableSession.create({ restaurantId: req.restaurant.id, tableId: table.id, status: 'OPEN' });
  }

  const orderNumber = await nextOrderNumber(req.restaurant.id);

  const order = await Order.create({
    restaurantId: req.restaurant.id,
    tableId: table.id,
    tableSessionId: session.id,
    customerName: customerName || null,
    createdByUserId: req.user.id,
    orderNumber,
    status: 'PENDING',
  });

  const products = await Product.findAll({
    where: { id: items.map((i) => i.productId), restaurantId: req.restaurant.id },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue; // producto inválido o de otro restaurante: se ignora, no se cae el pedido entero
    const quantity = Math.max(1, Number(item.quantity) || 1);
    await OrderItem.create({
      restaurantId: req.restaurant.id,
      orderId: order.id,
      productId: product.id,
      productName: product.name, // snapshot — ver order_items en pidedeuna_schema.sql
      quantity,
      unitPrice: product.price,
      subtotal: Number(product.price) * quantity,
      status: 'PENDING',
    });
  }

  // El trigger trg_order_items_after_change ya recalculó subtotal/total
  // en la base — volvemos a leer el pedido para traerlos actualizados.
  const fresh = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
  return res.status(201).json(fresh);
}

/** POST /:id/items — agrega un producto a un pedido que ya existe. */
async function addItem(req, res) {
  const order = await Order.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
  if (!ACTIVE_STATUSES.includes(order.status)) {
    return res.status(400).json({ error: 'Este pedido ya no se puede modificar.' });
  }

  const { productId, quantity } = req.body;
  const product = await Product.findOne({ where: { id: productId, restaurantId: req.restaurant.id } });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  const qty = Math.max(1, Number(quantity) || 1);
  await OrderItem.create({
    restaurantId: req.restaurant.id,
    orderId: order.id,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitPrice: product.price,
    subtotal: Number(product.price) * qty,
    status: 'PENDING',
  });

  const fresh = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
  return res.json(fresh);
}

/** DELETE /:id/items/:itemId — quita un producto del pedido. */
async function removeItem(req, res) {
  const order = await Order.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const item = await OrderItem.findOne({ where: { id: req.params.itemId, orderId: order.id } });
  if (!item) return res.status(404).json({ error: 'Producto del pedido no encontrado.' });

  await item.destroy();

  const fresh = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
  return res.json(fresh);
}

/** POST /:id/cancel — la mesera cancela el pedido completo. */
async function cancel(req, res) {
  const order = await Order.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  await order.update({ status: 'CANCELLED', cancelledAt: new Date() });
  return res.json(order);
}

/**
 * POST /:id/advance — el botón único de cocina. PENDING -> PREPARING,
 * o PREPARING -> READY. No puede tocar pedidos en otro estado.
 */
async function advance(req, res) {
  const order = await Order.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const next = KITCHEN_NEXT[order.status];
  if (!next) {
    return res.status(400).json({ error: 'Este pedido ya no lo puede avanzar cocina.' });
  }

  await order.update({ status: next });
  const fresh = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
  return res.json(fresh);
}

/**
 * POST /:id/serve — la mesera cobra y cierra el pedido.
 * body: { paymentMethod, transactionReference? }
 * paymentMethod es obligatorio (CASH|CARD|TRANSFER|WOMPI|EPAYCO|OTHER).
 * transactionReference es OPCIONAL — el número de factura/comprobante
 * que haya quedado del datáfono, de Wompi, de ePayco, o del sistema
 * propio del restaurante. Solo se guarda para trazabilidad, no se
 * valida contra ningún banco ni pasarela real.
 */
async function serve(req, res) {
  const order = await Order.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  if (order.status !== 'READY') {
    return res.status(400).json({ error: 'El pedido todavía no está listo en cocina.' });
  }

  const { paymentMethod, transactionReference } = req.body;
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Elige un método de pago válido.' });
  }

  await Payment.create({
    restaurantId: req.restaurant.id,
    orderId: order.id,
    amount: order.total,
    currency: req.restaurant.currency || 'COP',
    paymentMethod,
    status: 'APPROVED', // lo cobró la mesera en el momento — no hay pasarela real que confirme esto
    transactionReference: transactionReference || null,
    paidAt: new Date(),
  });

  await order.update({ status: 'COMPLETED', completedAt: new Date() });
  const fresh = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
  return res.json(fresh);
}

module.exports = { list, create, addItem, removeItem, cancel, advance, serve };