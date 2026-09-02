const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/auditLog.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));

module.exports = router;
