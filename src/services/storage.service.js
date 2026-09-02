// src/services/storage.service.js
const path = require('path');
const { supabase } = require('../config/supabase');

const BUCKET = process.env.SUPABASE_BUCKET || 'pide-de-una-images';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

/**
 * Sube un archivo de multer (memoryStorage) al bucket
 * y devuelve la URL pública.
 * @param {object} file   req.file de multer
 * @param {string} folder
 */
exports.uploadImage = async (file, folder) => {
  if (!file) return null;

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    const err = new Error('Formato no permitido. Usa JPG, PNG o WebP');
    err.status = 400;
    throw err;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    const err = new Error(`La imagen no puede superar ${MAX_SIZE_MB} MB`);
    err.status = 400;
    throw err;
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filePath = `${folder}/${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    const err = new Error('No se pudo subir la imagen');
    err.status = 500;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

/** Elimina una imagen a partir de su URL pública */
exports.deleteImage = async (publicUrl) => {
  if (!publicUrl) return;

  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const filePath = publicUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) console.error('Supabase delete error:', error);
};

// ---------------------------------------------------------------
// Video — mismo patrón que uploadImage/deleteImage, pero con sus
// propios mimetypes permitidos y un límite de tamaño más generoso
// (los videos de producto pesan mucho más que una foto).
// ---------------------------------------------------------------

const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_SIZE_MB = 50;

/**
 * Sube un video de multer (memoryStorage) al bucket
 * y devuelve la URL pública. Mismo contrato que uploadImage.
 */
exports.uploadVideo = async (file, folder) => {
  if (!file) return null;

  if (!ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
    const err = new Error('Formato no permitido. Usa MP4, WebM o MOV');
    err.status = 400;
    throw err;
  }

  if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    const err = new Error(`El video no puede superar ${MAX_VIDEO_SIZE_MB} MB`);
    err.status = 400;
    throw err;
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
  const filePath = `${folder}/${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    const err = new Error('No se pudo subir el video');
    err.status = 500;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

/** Elimina un video a partir de su URL pública */
exports.deleteVideo = async (publicUrl) => {
  // Misma ruta física (mismo bucket), así que reutiliza deleteImage.
  return exports.deleteImage(publicUrl);
};

/**
 * Punto de entrada único para "sube lo que sea que el admin haya
 * elegido para un producto" — decide IMAGE vs VIDEO mirando el
 * mimetype y delega en la función correcta. Esto es lo que usa
 * media.controller.js: el front manda un solo input de archivo,
 * no dos formularios separados.
 * @returns {{ mediaType: 'IMAGE'|'VIDEO', url: string }}
 */
exports.uploadProductMedia = async (file, folder) => {
  if (!file) {
    const err = new Error('No se recibió ningún archivo.');
    err.status = 400;
    throw err;
  }

  if (ALLOWED_MIMES.includes(file.mimetype)) {
    const url = await exports.uploadImage(file, folder);
    return { mediaType: 'IMAGE', url };
  }

  if (ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
    const url = await exports.uploadVideo(file, folder);
    return { mediaType: 'VIDEO', url };
  }

  const err = new Error(
    `Formato no permitido (${file.mimetype}). Imágenes: JPG/PNG/WebP. Videos: MP4/WebM/MOV.`
  );
  err.status = 400;
  throw err;
};

/** Elimina cualquier media de producto (imagen o video) por su URL pública. */
exports.deleteProductMedia = async (publicUrl) => {
  return exports.deleteImage(publicUrl); // mismo bucket, misma lógica de borrado
};

// ---------------------------------------------------------------
// Archivos (documentos) — sin cambios respecto a lo que ya tenías.
// ---------------------------------------------------------------

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const MAX_DOC_SIZE_MB = 10;

/**
 * Sube un documento (PDF o imagen) al bucket
 * y devuelve la URL pública.
 */
exports.uploadFile = async (file, folder) => {
  if (!file) return null;

  if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
    const err = new Error('Formato no permitido. Usa PDF, JPG o PNG');
    err.status = 400;
    throw err;
  }

  if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
    const err = new Error(`El archivo no puede superar ${MAX_DOC_SIZE_MB} MB`);
    err.status = 400;
    throw err;
  }

  const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    const err = new Error('No se pudo subir el archivo');
    err.status = 500;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

/** Elimina un archivo a partir de su URL pública */
exports.deleteFile = async (publicUrl) => {
  if (!publicUrl) return;

  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const filePath = publicUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) console.error('Supabase delete error:', error);
};