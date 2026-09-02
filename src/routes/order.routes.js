const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/order.controller');
const { authorize } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// authenticate + requireSameRestaurant ya se aplicaron en restaurant.routes.js
// antes de montar este router — acá solo falta decidir QUÉ ROL puede cada cosa.

router.get('/', authorize('WAITER', 'KITCHEN', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.list));

// Armar/editar el pedido: solo la mesera (o un admin).
router.post('/', authorize('WAITER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.create));
router.post('/:id/items', authorize('WAITER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.addItem));
router.delete('/:id/items/:itemId', authorize('WAITER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.removeItem));
router.post('/:id/cancel', authorize('WAITER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.cancel));
router.post('/:id/serve', authorize('WAITER', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.serve));

// Avanzar el estado en cocina: solo cocina (o un admin).
router.post('/:id/advance', authorize('KITCHEN', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), asyncHandler(ctrl.advance));

module.exports = router;