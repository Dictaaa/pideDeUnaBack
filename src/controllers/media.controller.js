const { Product, ProductMedia } = require('../models');
const storageService = require('../services/storage.service');

/**
 * POST /api/restaurantes/:slug/products/:productId/media
 * multipart/form-data, campo "file" — puede ser imagen O video,
 * storage.service.js decide cuál es por el mimetype.
 * body opcional: isPrimary=true|false
 */
async function upload(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.productId, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  if (!req.file) {
    return res.status(400).json({ error: 'Falta el archivo (campo "file").' });
  }

  const folder = `${req.restaurant.slug}/products/${product.id}`;

  let mediaType, url;
  try {
    ({ mediaType, url } = await storageService.uploadProductMedia(req.file, folder));
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;

  // Si este archivo va a ser el principal, desmarca cualquier otro
  // media principal de este producto (solo puede haber uno).
  if (isPrimary) {
    await ProductMedia.update({ isPrimary: false }, { where: { productId: product.id } });
  }

  const media = await ProductMedia.create({
    restaurantId: req.restaurant.id,
    productId: product.id,
    mediaType,
    url,
    altText: req.body.altText || null,
    sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
    isPrimary,
  });

  return res.status(201).json(media);
}

/** DELETE /api/restaurantes/:slug/products/:productId/media/:mediaId */
async function remove(req, res) {
  const media = await ProductMedia.findOne({
    where: {
      id: req.params.mediaId,
      productId: req.params.productId,
      restaurantId: req.restaurant.id,
    },
  });
  if (!media) return res.status(404).json({ error: 'Archivo no encontrado.' });

  await storageService.deleteProductMedia(media.url);
  await media.destroy();

  return res.status(204).send();
}

module.exports = { upload, remove };
