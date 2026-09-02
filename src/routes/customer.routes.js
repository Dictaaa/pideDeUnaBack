const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/customer.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.patch('/:id', asyncHandler(ctrl.update));

module.exports = router;
