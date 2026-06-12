const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let hiddenWin = null;
let initPromise = null;

async function init() {
  if (hiddenWin && !hiddenWin.isDestroyed() && initPromise) {
    await initPromise;
    return;
  }
  initPromise = (async () => {
    hiddenWin = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    });
    await hiddenWin.loadURL('about:blank');
    await hiddenWin.webContents.executeJavaScript(`
      require('pdfjs-dist/build/pdf.worker.entry');
      const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      const fs = require('fs');
      const path = require('path');
      window._execSafe = function(fn) {
        try {
          return fn().catch(function(e) {
            return { __error: true, message: e.message };
          });
        } catch(e) {
          return { __error: true, message: e.message };
        }
      };
      window._getPageCount = function(filePath) {
        return pdfjsLib.getDocument({ data: new Uint8Array(fs.readFileSync(filePath)) }).promise.then(function(doc) {
          return doc.numPages;
        });
      };
      window._renderPagesToFiles = async function(filePath, outDir, baseName, pageNums, scale) {
        const data = new Uint8Array(fs.readFileSync(filePath));
        const doc = await pdfjsLib.getDocument({ data }).promise;
        const files = [];
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        for (const p of pageNums) {
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, viewport.width, viewport.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const outPath = path.join(outDir, baseName + '_page_' + String(p).padStart(3, '0') + '.png');
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
          files.push(outPath);
        }
        return files;
      };
      true;
    `);
  })();
  await initPromise;
}

async function getPageCount(filePath) {
  await init();
  const result = await hiddenWin.webContents.executeJavaScript(
    `_execSafe(function(){return _getPageCount(${JSON.stringify(filePath)})})`
  );
  if (result && result.__error) throw new Error(result.message);
  return result;
}

async function renderPdfPages(filePath, outDir, baseName, pageNums, scale = 2) {
  await init();
  const result = await hiddenWin.webContents.executeJavaScript(
    `_execSafe(function(){return _renderPagesToFiles(${JSON.stringify(filePath)}, ${JSON.stringify(outDir)}, ${JSON.stringify(baseName)}, ${JSON.stringify(pageNums)}, ${scale})})`
  );
  if (result && result.__error) throw new Error(result.message);
  return result || [];
}

function destroy() {
  if (hiddenWin && !hiddenWin.isDestroyed()) {
    hiddenWin.destroy();
    hiddenWin = null;
    initPromise = null;
  }
}

module.exports = { getPageCount, renderPdfPages, destroy };
