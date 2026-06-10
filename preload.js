const { contextBridge, ipcRenderer } = require('electron');

const IPC_CHANNELS = {
  CHECK_QPDF: 'check-qpdf',
  UNLOCK_PDF: 'unlock-pdf',
  UNLOCK_BATCH: 'unlock-batch',
  SELECT_OUTPUT_DIR: 'select-output-dir',
  SAVE_OUTPUT_DIR: 'save-output-dir',
  OPEN_OUTPUT_DIR: 'open-output-dir',
  COPY_FILES: 'copy-files',
  GET_SETTINGS: 'get-settings',
  SET_SETTINGS: 'set-settings',
  GET_HISTORY: 'get-history',
  ADD_HISTORY: 'add-history',
  CLEAR_HISTORY: 'clear-history',
};

contextBridge.exposeInMainWorld('pdfUnlocker', {
  checkQpdf: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_QPDF),
  unlockPdf: (filePath, password) =>
    ipcRenderer.invoke(IPC_CHANNELS.UNLOCK_PDF, { filePath, password }),
  unlockBatch: (files) =>
    ipcRenderer.invoke(IPC_CHANNELS.UNLOCK_BATCH, { files }),
  selectOutputDir: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_OUTPUT_DIR),
  saveOutputDir: () => ipcRenderer.invoke(IPC_CHANNELS.SAVE_OUTPUT_DIR),
  openOutputDir: (dirPath) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_OUTPUT_DIR, dirPath),
  copyFiles: (files, destDir) => ipcRenderer.invoke(IPC_CHANNELS.COPY_FILES, { files, destDir }),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  setSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SET_SETTINGS, settings),
  getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HISTORY),
  clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_HISTORY),
  onUnlockProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('unlock-progress', listener);
    return () => ipcRenderer.removeListener('unlock-progress', listener);
  },
});
