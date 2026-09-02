const router = require('express').Router();
const ctrl = require('../controllers/role.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.put('/:id/permissions', asyncHandler(ctrl.setPermissions));

module.exports = router;
