const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function removeBackground(filePath, outPath) {
  const meta = await sharp(filePath).metadata();
  const { width, height } = meta;

  // Sample corners to find background color
  const cornerSize = Math.min(5, Math.floor(Math.min(width, height) / 4));
  const corners = [
    { left: 0, top: 0 },
    { left: width - cornerSize, top: 0 },
    { left: 0, top: height - cornerSize },
    { left: width - cornerSize, top: height - cornerSize },
  ];

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (const c of corners) {
    const buf = await sharp(filePath)
      .extract({ left: c.left, top: c.top, width: cornerSize, height: cornerSize })
      .raw()
      .toBuffer();
    const channels = buf.length / (cornerSize * cornerSize);
    for (let i = 0; i < buf.length; i += channels) {
      rSum += buf[i]; gSum += buf[i + 1]; bSum += buf[i + 2];
      count++;
    }
  }

  const bgR = Math.round(rSum / count);
  const bgG = Math.round(gSum / count);
  const bgB = Math.round(bSum / count);

  const rgbaBuffer = await sharp(filePath).ensureAlpha().raw().toBuffer();
  const outputBuffer = Buffer.alloc(rgbaBuffer.length);
  let threshold = 50;

  // Calculate variance for adaptive threshold
  let varianceSum = 0;
  const sampleCount = Math.min(100, count);
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.floor(Math.random() * count) * 3;
    const dr = Math.abs(rgbaBuffer[idx * 4] - bgR);
    const dg = Math.abs(rgbaBuffer[idx * 4 + 1] - bgG);
    const db = Math.abs(rgbaBuffer[idx * 4 + 2] - bgB);
    varianceSum += Math.sqrt(dr * dr + dg * dg + db * db);
  }
  threshold = Math.max(30, Math.min(80, varianceSum / sampleCount * 1.5));

  for (let i = 0; i < rgbaBuffer.length; i += 4) {
    const dr = Math.abs(rgbaBuffer[i] - bgR);
    const dg = Math.abs(rgbaBuffer[i + 1] - bgG);
    const db = Math.abs(rgbaBuffer[i + 2] - bgB);
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < threshold) {
      outputBuffer[i] = rgbaBuffer[i];
      outputBuffer[i + 1] = rgbaBuffer[i + 1];
      outputBuffer[i + 2] = rgbaBuffer[i + 2];
      outputBuffer[i + 3] = Math.max(0, Math.min(255, Math.round((dist / threshold) * 255)));
    } else {
      outputBuffer[i] = rgbaBuffer[i];
      outputBuffer[i + 1] = rgbaBuffer[i + 1];
      outputBuffer[i + 2] = rgbaBuffer[i + 2];
      outputBuffer[i + 3] = 255;
    }
  }

  await sharp(outputBuffer, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
  return { success: true, outputPath: outPath };
}

module.exports = { removeBackground };
