const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { checkQpdf, unlockPdf } = require('./pdf-service');

const IPC_CHANNELS = {
  CHECK_QPDF: 'check-qpdf',
  UNLOCK_PDF: 'unlock-pdf',
  UNLOCK_BATCH: 'unlock-batch',
  SELECT_OUTPUT_DIR: 'select-output-dir',
  OPEN_OUTPUT_DIR: 'open-output-dir',
  GET_SETTINGS: 'get-settings',
  SET_SETTINGS: 'set-settings',
  GET_HISTORY: 'get-history',
  ADD_HISTORY: 'add-history',
  CLEAR_HISTORY: 'clear-history',
  SAVE_OUTPUT_DIR: 'save-output-dir',
  COPY_FILES: 'copy-files',
};

const store = new Store({
  defaults: {
    theme: 'system',
    outputDir: null,
    useSamePassword: true,
    history: [],
  },
});

let mainWindow = null;

function getDefaultOutputDir() {
  const docsPath = app.getPath('documents');
  const dir = path.join(docsPath, 'Unlocked PDFs');
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
  return dir;
}

function getOutputDir() {
  return store.get('outputDir') || getDefaultOutputDir();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 940,
    height: 720,
    minWidth: 680,
    minHeight: 520,
    title: 'Manish PDF Unlocker',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#f8fafc',
  });

  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(() => {
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  if (!isDev) {
    const { session } = require('electron');
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' file:; script-src 'self' 'unsafe-inline' file:; style-src 'self' 'unsafe-inline'; img-src 'self' data: file:; font-src 'self' data:;",
          ],
        },
      });
    });
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle(IPC_CHANNELS.CHECK_QPDF, async () => {
  return await checkQpdf();
});

ipcMain.handle(IPC_CHANNELS.UNLOCK_PDF, async (_event, { filePath, password }) => {
  const outDir = getOutputDir();
  const finalOutput = path.join(outDir, path.basename(filePath, '.pdf') + '_unlocked.pdf');
  await unlockPdf({ filePath, password, outputPath: finalOutput });

  const history = store.get('history', []);
  history.unshift({ file: path.basename(filePath), output: finalOutput, timestamp: new Date().toISOString(), status: 'success' });
  store.set('history', history.slice(0, 100));

  return { success: true, outputPath: finalOutput };
});

ipcMain.handle(IPC_CHANNELS.UNLOCK_BATCH, async (event, { files }) => {
  const outDir = getOutputDir();
  const results = [];
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const { filePath, password } = files[i];
    const finalOutput = path.join(outDir, path.basename(filePath, '.pdf') + '_unlocked.pdf');

    event.sender.send('unlock-progress', { index: i, total: files.length, file: path.basename(filePath), status: 'processing' });

    try {
      await unlockPdf({ filePath, password, outputPath: finalOutput });

      const history = store.get('history', []);
      history.unshift({ file: path.basename(filePath), output: finalOutput, timestamp: new Date().toISOString(), status: 'success' });
      store.set('history', history.slice(0, 100));

      event.sender.send('unlock-progress', { index: i, total: files.length, file: path.basename(filePath), status: 'success', outputPath: finalOutput });
      results.push({ file: path.basename(filePath), success: true, outputPath: finalOutput });
    } catch (error) {
      event.sender.send('unlock-progress', { index: i, total: files.length, file: path.basename(filePath), status: 'error', error: error.message });
      results.push({ file: path.basename(filePath), success: false, error: error.message });
    }
  }
  return results;
});

ipcMain.handle(IPC_CHANNELS.SELECT_OUTPUT_DIR, async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle(IPC_CHANNELS.SAVE_OUTPUT_DIR, async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle(IPC_CHANNELS.OPEN_OUTPUT_DIR, async (_event, dirPath) => {
  shell.openPath(dirPath);
});

ipcMain.handle(IPC_CHANNELS.COPY_FILES, async (_event, { files, destDir }) => {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const results = [];
  for (const file of files) {
    try {
      const dest = path.join(destDir, path.basename(file));
      fs.copyFileSync(file, dest);
      results.push({ file: path.basename(file), success: true, dest });
    } catch (e) {
      results.push({ file: path.basename(file), success: false, error: e.message });
    }
  }
  return results;
});

ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => store.store);

ipcMain.handle(IPC_CHANNELS.SET_SETTINGS, (_event, settings) => {
  store.set(settings);
  return store.store;
});

ipcMain.handle(IPC_CHANNELS.GET_HISTORY, () => store.get('history', []));

ipcMain.handle(IPC_CHANNELS.CLEAR_HISTORY, () => store.set('history', []));
