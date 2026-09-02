const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/user.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.patch('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));
router.put('/:id/roles', asyncHandler(ctrl.setRoles));

module.exports = router;
