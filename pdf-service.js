const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

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
      if (error) {
        resolve({ available: false, version: null, path: qpdfPath });
      } else {
        resolve({ available: true, version: stdout.trim(), path: qpdfPath });
      }
    });
  });
}

function unlockPdf({ filePath, password, outputPath }) {
  return new Promise((resolve, reject) => {
    const qpdfPath = getQpdfPath();
    const opts = getQpdfDir() ? { cwd: getQpdfDir() } : {};
    const args = [
      '--decrypt',
      `--password=${password}`,
      filePath,
      outputPath,
    ];

    execFile(qpdfPath, args, opts, (error, stdout, stderr) => {
      if (error) {
        const errMsg = stderr || error.message;
        if (errMsg.includes('incorrect password') || errMsg.includes('invalid password')) {
          reject(new Error('Incorrect password. Please try again.'));
        } else if (errMsg.includes('not encrypted')) {
          reject(new Error('This PDF is not password-protected.'));
        } else {
          reject(new Error(`Failed to unlock PDF: ${errMsg}`));
        }
        return;
      }
      resolve({ success: true, outputPath });
    });
  });
}

module.exports = { checkQpdf, unlockPdf };
