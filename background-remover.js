const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let hiddenWin = null;
let ready = false;
let pendingResolve = null;
let pendingReject = null;
let listenerReady = false;

const CHANNEL = '__bg_remove_result';

function ensureListener() {
  if (listenerReady) return;
  ipcMain.on(CHANNEL, (_event, result) => {
    if (result.__error) {
      if (pendingReject) pendingReject(new Error(result.message));
    } else {
      if (pendingResolve) pendingResolve(result.outPath);
    }
    pendingResolve = null;
    pendingReject = null;
  });
  listenerReady = true;
}

async function init() {
  if (hiddenWin && !hiddenWin.isDestroyed()) {
    if (!ready) await new Promise(r => setTimeout(r, 100));
    return;
  }
  hiddenWin = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  await hiddenWin.loadURL('about:blank');
  await hiddenWin.webContents.executeJavaScript(`
    const { removeBackground } = require('@imgly/background-removal');
    const fs = require('fs');
    const { ipcRenderer } = require('electron');
    window._processFile = async function(filePath, outPath) {
      try {
        const blob = await removeBackground(filePath);
        const buf = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(outPath, buf);
        ipcRenderer.send('${CHANNEL}', { outPath });
      } catch(e) {
        ipcRenderer.send('${CHANNEL}', { __error: true, message: e.message || 'Unknown error' });
      }
    };
  `);
  ready = true;
}

async function removeBackground(filePath, outPath) {
  await init();
  ensureListener();
  return new Promise((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    hiddenWin.webContents.executeJavaScript(
      `window._processFile(${JSON.stringify(filePath)}, ${JSON.stringify(outPath)})`
    );
    setTimeout(() => {
      if (pendingResolve) {
        pendingResolve = null;
        pendingReject = null;
        reject(new Error('Background removal timed out'));
      }
    }, 60000);
  });
}

function destroy() {
  if (hiddenWin && !hiddenWin.isDestroyed()) {
    hiddenWin.destroy();
    hiddenWin = null;
    ready = false;
  }
}

module.exports = { removeBackground, destroy };
