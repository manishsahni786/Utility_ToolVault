const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { removeBackground: bgRemove } = require('./background-remover');

function getOutputPath(filePath, suffix, ext) {
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  return path.join(dir, `${name}_${suffix}.${ext}`);
}

async function compressImage({ filePath, level }) {
  const qualityMap = { low: 40, medium: 65, high: 85 };
  const quality = qualityMap[level] || 65;
  const ext = path.extname(filePath).toLowerCase();
  const outPath = getOutputPath(filePath, `compressed_${level}`, ext.replace('.', '') || 'jpg');
  const originalSize = fs.statSync(filePath).size;
  let img = sharp(filePath);
  const meta = await img.metadata();
  if (ext === '.png') {
    img = img.png({ quality, compressionLevel: level === 'high' ? 9 : level === 'medium' ? 6 : 3 });
  } else if (ext === '.webp') {
    img = img.webp({ quality });
  } else {
    img = img.jpeg({ quality, mozjpeg: true });
  }
  await img.toFile(outPath);
  const compressedSize = fs.statSync(outPath).size;
  const savings = `${Math.round((1 - compressedSize / originalSize) * 100)}%`;
  return { success: true, outputPath: outPath, originalSize, compressedSize, savings };
}

async function convertImage({ filePath, format }) {
  const outPath = getOutputPath(filePath, `converted`, format);
  const img = sharp(filePath);
  if (format === 'png') await img.png().toFile(outPath);
  else if (format === 'webp') await img.webp().toFile(outPath);
  else await img.jpeg({ mozjpeg: true }).toFile(outPath);
  return { success: true, outputPath: outPath, outputFormat: format };
}

async function resizeImage({ filePath, width, height, mode }) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'jpg';
  const outPath = getOutputPath(filePath, `resized_${width}x${height || 'auto'}`, ext);
  let img = sharp(filePath);
  const meta = await img.metadata();
  let opts = {};
  if (mode === 'aspect') {
    opts = { width: width || undefined, height: height || undefined, fit: 'inside' };
  } else if (mode === 'exact') {
    opts = { width: width || undefined, height: height || undefined, fit: 'fill' };
  } else if (mode === 'percent') {
    const pct = (width || 100) / 100;
    opts = { width: Math.round(meta.width * pct), fit: 'inside' };
  }
  const result = await img.resize(opts).toFile(outPath);
  return { success: true, outputPath: outPath, outputWidth: result.width, outputHeight: result.height };
}

async function removeBackground({ filePath }) {
  const outPath = getOutputPath(filePath, 'no-bg', 'png');
  try {
    await bgRemove(filePath, outPath);
    return { success: true, outputPath: outPath };
  } catch (e) {
    throw new Error(`Background removal failed: ${e.message}`);
  }
}

module.exports = { compressImage, convertImage, resizeImage, removeBackground };
