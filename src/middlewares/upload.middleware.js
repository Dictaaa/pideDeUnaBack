const multer = require('multer');

// memoryStorage: el archivo llega como buffer en memoria (req.file.buffer),
// que es justo lo que storage.service.js espera para subirlo a Supabase.
// El límite aquí es el techo absoluto (el más grande, video); el service
// aplica límites más finos por tipo (imagen vs. video vs. documento).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB techo duro
});

module.exports = upload;