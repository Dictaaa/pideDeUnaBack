// src/routes/index.js
const { Router } = require('express');
const router = Router();

const menuRoutes         = require('./menu.routes');

// ── Módulos con prefijo ───────────────────────────────────
router.use('/restaurantes', menuRoutes);


// ── 404 ──────────────────────────────────────────────────
router.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = router;