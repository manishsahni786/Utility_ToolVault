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
  SELECT_FILE: 'select-file',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  CONVERT_PDF: 'convert-pdf',
  COMPRESS_IMAGE: 'compress-image',
  CONVERT_IMAGE: 'convert-image',
  RESIZE_IMAGE: 'resize-image',
  REMOVE_BACKGROUND: 'remove-background',
  EXCEL_TO_CSV: 'excel-to-csv',
};

module.exports = { IPC_CHANNELS };
