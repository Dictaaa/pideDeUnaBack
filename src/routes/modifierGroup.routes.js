const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/modifierGroup.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.patch('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

router.post('/:groupId/options', asyncHandler(ctrl.addOption));
router.patch('/:groupId/options/:optionId', asyncHandler(ctrl.updateOption));
router.delete('/:groupId/options/:optionId', asyncHandler(ctrl.removeOption));

module.exports = router;
