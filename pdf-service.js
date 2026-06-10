const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

function getQpdfPath() {
  const bundledPath = path.join(process.resourcesPath || __dirname, 'binaries', 'qpdf');
  if (fs.existsSync(bundledPath)) return bundledPath;
  if (process.platform === 'win32') {
    const winBundled = path.join(process.resourcesPath || __dirname, 'binaries', 'qpdf.exe');
    if (fs.existsSync(winBundled)) return winBundled;
  }
  return 'qpdf';
}

function checkQpdf() {
  return new Promise((resolve) => {
    const qpdfPath = getQpdfPath();
    execFile(qpdfPath, ['--version'], (error, stdout) => {
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
    const args = [
      '--decrypt',
      `--password=${password}`,
      filePath,
      outputPath,
    ];

    execFile(qpdfPath, args, (error, stdout, stderr) => {
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
