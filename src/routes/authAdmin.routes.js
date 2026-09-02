const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

// Login único de la plataforma — solo correo y contraseña, sin slug
// (el email ya es único globalmente). Sirve para staff y SUPER_ADMIN.
router.post('/login', asyncHandler(ctrl.login));

module.exports = router;
