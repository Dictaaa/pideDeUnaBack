const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/promotion.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.patch('/:id', asyncHandler(ctrl.update));
router.put('/:id/products', asyncHandler(ctrl.setProducts));
router.delete('/:id', asyncHandler(ctrl.remove));

module.exports = router;
