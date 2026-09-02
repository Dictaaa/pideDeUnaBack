const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/auth.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.post('/login', asyncHandler(ctrl.loginStaff));

module.exports = router;
