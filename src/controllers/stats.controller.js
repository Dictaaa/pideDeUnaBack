const { sequelize } = require('../models');

// Un pedido cuenta como "venta" cuando llegó al final del camino feliz.
// CANCELLED se cuenta aparte (para saber cuánto se está perdiendo),
// y todo lo demás (PENDING/PREPARING/READY) todavía está en curso —
// no es ni venta ni cancelación, no debe sumar a ninguna de las dos.
const COMPLETED_STATUSES = "('SERVED','COMPLETED')";

/** Traduce el período pedido a una fecha de inicio (o null = todo el histórico). */
function rangeForPeriod(period) {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const from = new Date(now);
      from.setDate(now.getDate() - now.getDay());
      from.setHours(0, 0, 0, 0);
      return from;
    }
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
      return null;
    case 'month':
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

/**
 * GET /api/restaurantes/:slug/stats/summary?period=today|week|month|year|all
 * Los números principales de la parte de arriba del dashboard.
 */
async function summary(req, res) {
  const period = req.query.period || 'month';
  const from = rangeForPeriod(period);

  const [salesRow] = await sequelize.query(
    `SELECT COUNT(*)::int AS orders_count, COALESCE(SUM(total),0)::numeric AS revenue
     FROM orders
     WHERE restaurant_id = :restaurantId
       AND status IN ${COMPLETED_STATUSES}
       ${from ? 'AND created_at >= :from' : ''}`,
    { replacements: { restaurantId: req.restaurant.id, from }, type: sequelize.QueryTypes.SELECT }
  );

  const [cancelledRow] = await sequelize.query(
    `SELECT COUNT(*)::int AS cancelled_count
     FROM orders
     WHERE restaurant_id = :restaurantId
       AND status = 'CANCELLED'
       ${from ? 'AND created_at >= :from' : ''}`,
    { replacements: { restaurantId: req.restaurant.id, from }, type: sequelize.QueryTypes.SELECT }
  );

  const ordersCount = salesRow.orders_count;
  const revenue = Number(salesRow.revenue);

  return res.json({
    period,
    ordersCount,
    revenue,
    avgTicket: ordersCount > 0 ? revenue / ordersCount : 0,
    cancelledCount: cancelledRow.cancelled_count,
  });
}

/**
 * GET /api/restaurantes/:slug/stats/timeseries?groupBy=day|month&period=...
 * Para la gráfica de barras — ventas agrupadas por día o por mes.
 */
async function timeseries(req, res) {
  const groupBy = req.query.groupBy === 'month' ? 'month' : 'day';
  const period = req.query.period || (groupBy === 'month' ? 'year' : 'month');
  const from = rangeForPeriod(period);

  const rows = await sequelize.query(
    `SELECT date_trunc('${groupBy}', created_at) AS bucket,
            COUNT(*)::int AS orders_count,
            COALESCE(SUM(total),0)::numeric AS revenue
     FROM orders
     WHERE restaurant_id = :restaurantId
       AND status IN ${COMPLETED_STATUSES}
       ${from ? 'AND created_at >= :from' : ''}
     GROUP BY bucket
     ORDER BY bucket ASC`,
    { replacements: { restaurantId: req.restaurant.id, from }, type: sequelize.QueryTypes.SELECT }
  );

  return res.json(
    rows.map((r) => ({ bucket: r.bucket, ordersCount: r.orders_count, revenue: Number(r.revenue) }))
  );
}

/**
 * GET /api/restaurantes/:slug/stats/top-products?limit=5&period=...
 * Qué se está vendiendo más — por cantidad, no por plata (para ver
 * qué preparar más, no solo qué es más caro).
 */
async function topProducts(req, res) {
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const period = req.query.period || 'month';
  const from = rangeForPeriod(period);

  const rows = await sequelize.query(
    `SELECT oi.product_name,
            SUM(oi.quantity)::int AS quantity_sold,
            SUM(oi.subtotal)::numeric AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.restaurant_id = :restaurantId
       AND o.status IN ${COMPLETED_STATUSES}
       ${from ? 'AND o.created_at >= :from' : ''}
     GROUP BY oi.product_name
     ORDER BY quantity_sold DESC
     LIMIT :limit`,
    { replacements: { restaurantId: req.restaurant.id, from, limit }, type: sequelize.QueryTypes.SELECT }
  );

  return res.json(
    rows.map((r) => ({ productName: r.product_name, quantitySold: r.quantity_sold, revenue: Number(r.revenue) }))
  );
}

module.exports = { summary, timeseries, topProducts };