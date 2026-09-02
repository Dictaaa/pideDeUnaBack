const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/product.controller');
const mediaCtrl = require('../controllers/media.controller');
const upload = require('../middlewares/upload.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.getOne));
router.patch('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

router.put('/:id/ingredients', asyncHandler(ctrl.setIngredients));
router.put('/:id/allergens', asyncHandler(ctrl.setAllergens));
router.put('/:id/modifier-groups', asyncHandler(ctrl.setModifierGroups));

// multipart/form-data, campo "file" — storage.service.js decide si es
// imagen o video según el mimetype, no hace falta un endpoint por tipo.
router.post('/:productId/media', upload.single('file'), asyncHandler(mediaCtrl.upload));
router.delete('/:productId/media/:mediaId', asyncHandler(mediaCtrl.remove));

module.exports = router;
