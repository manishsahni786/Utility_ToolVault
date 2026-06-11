const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pdfUnlocker', {
  checkQpdf: () => ipcRenderer.invoke('check-qpdf'),
  unlockPdf: (filePath, password) => ipcRenderer.invoke('unlock-pdf', { filePath, password }),
  unlockBatch: (files) => ipcRenderer.invoke('unlock-batch', { files }),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  saveOutputDir: () => ipcRenderer.invoke('save-output-dir'),
  convertPdf: (opts) => ipcRenderer.invoke('convert-pdf', opts),
  openOutputDir: (dirPath) => ipcRenderer.invoke('open-output-dir', dirPath),
  copyFiles: (files, destDir) => ipcRenderer.invoke('copy-files', { files, destDir }),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  onUnlockProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('unlock-progress', listener);
    return () => ipcRenderer.removeListener('unlock-progress', listener);
  },

  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  saveFileDialog: (opts) => ipcRenderer.invoke('save-file-dialog', opts),
  compressImage: (opts) => ipcRenderer.invoke('compress-image', opts),
  convertImage: (opts) => ipcRenderer.invoke('convert-image', opts),
  resizeImage: (opts) => ipcRenderer.invoke('resize-image', opts),
  removeBackground: (opts) => ipcRenderer.invoke('remove-background', opts),
  excelToCsv: (opts) => ipcRenderer.invoke('excel-to-csv', opts),
});
