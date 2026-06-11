const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const sharp = require('sharp');
const { getPageCount, renderPdfPages } = require('./pdf-renderer');

function getQpdfPath() {
  const bases = [process.resourcesPath, __dirname].filter(Boolean);
  for (const base of bases) {
    for (const name of ['qpdf', 'qpdf.exe']) {
      const candidate = path.join(base, 'binaries', name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return 'qpdf';
}

function getQpdfDir() {
  const p = getQpdfPath();
  return p !== 'qpdf' ? path.dirname(p) : null;
}

function checkQpdf() {
  return new Promise((resolve) => {
    const qpdfPath = getQpdfPath();
    const opts = getQpdfDir() ? { cwd: getQpdfDir() } : {};
    execFile(qpdfPath, ['--version'], opts, (error, stdout) => {
      if (error) resolve({ available: false, version: null, path: qpdfPath });
      else resolve({ available: true, version: stdout.trim(), path: qpdfPath });
    });
  });
}

function unlockPdf({ filePath, password, outputPath }) {
  return new Promise((resolve, reject) => {
    const qpdfPath = getQpdfPath();
    const opts = getQpdfDir() ? { cwd: getQpdfDir() } : {};
    const args = ['--decrypt', `--password=${password}`, filePath, outputPath];
    execFile(qpdfPath, args, opts, (error, stdout, stderr) => {
      if (error) {
        const errMsg = stderr || error.message;
        if (errMsg.includes('incorrect password') || errMsg.includes('invalid password'))
          return reject(new Error('Incorrect password. Please try again.'));
        if (errMsg.includes('not encrypted'))
          return reject(new Error('This PDF is not password-protected.'));
        if (errMsg.includes('no such file') || errMsg.includes('No such file'))
          return reject(new Error('File not found. Please check the file path.'));
        return reject(new Error(`Failed to unlock PDF: ${errMsg}`));
      }
      resolve({ success: true, outputPath });
    });
  });
}

function parsePageRange(rangeStr, totalPages) {
  if (!rangeStr || !rangeStr.trim()) return null;
  const pages = new Set();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [s, e] = trimmed.split('-').map(Number);
      const start = Math.max(1, Math.min(s || 1, totalPages));
      const end = Math.min(e || totalPages, totalPages);
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const p = Number(trimmed);
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
  }
  return pages.size > 0 ? [...pages].sort((a, b) => a - b) : null;
}

async function convertPdf({ filePath, format, pageRange }) {
  if (!fs.existsSync(filePath)) throw new Error('File not found. Please check the file path.');
  const baseName = path.basename(filePath, '.pdf');
  const outDir = path.join(path.dirname(filePath), baseName + '_converted');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const totalPages = await getPageCount(filePath);
  if (totalPages === 0) throw new Error('PDF has no pages.');
  const pagesToConvert = parsePageRange(pageRange, totalPages) || Array.from({ length: totalPages }, (_, i) => i + 1);

  if (format === 'docx') {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = require('docx');
    const pngFiles = await renderPdfPages(filePath, outDir, baseName, pagesToConvert, 2);
    const children = [];
    for (let idx = 0; idx < pagesToConvert.length; idx++) {
      const pageNum = pagesToConvert[idx];
      const buf = fs.readFileSync(pngFiles[idx]);
      if (idx > 0) children.push(new Paragraph({ spacing: { before: 400 } }));
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Page ${pageNum}`, size: 16, color: '888888' })],
        }),
      );
      const meta = await sharp(buf).metadata();
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: buf,
              transformation: {
                width: Math.min(600, meta.width),
                height: Math.min(780, meta.height),
              },
            }),
          ],
        }),
      );
    }
    const wordDoc = new Document({ sections: [{ children }] });
    const docxPath = path.join(outDir, baseName + '.docx');
    const buffer = await Packer.toBuffer(wordDoc);
    fs.writeFileSync(docxPath, buffer);
    return { success: true, pages: pagesToConvert.length, outputDir, format: 'docx', files: [docxPath] };
  }

  const outFormat = format;
  const pngFiles = await renderPdfPages(filePath, outDir, baseName, pagesToConvert, 2);
  const finalFiles = [];
  for (let idx = 0; idx < pagesToConvert.length; idx++) {
    const pngPath = pngFiles[idx];
    const pageNum = pagesToConvert[idx];
    const outName = `${baseName}_page_${String(pageNum).padStart(3, '0')}.${outFormat}`;
    const outPath = path.join(outDir, outName);
    if (outFormat === 'png') {
      finalFiles.push(pngPath);
    } else {
      await sharp(fs.readFileSync(pngPath))[outFormat]({ quality: 90 }).toFile(outPath);
      fs.unlinkSync(pngPath);
      finalFiles.push(outPath);
    }
  }
  return { success: true, pages: finalFiles.length, outputDir, format: outFormat, files: finalFiles };
}

module.exports = { checkQpdf, unlockPdf, convertPdf };
