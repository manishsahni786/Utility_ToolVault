export const CATEGORIES = [
  {
    id: 'pdf',
    label: 'PDF Tools',
    icon: 'pdf',
    tools: [
      { id: 'pdf-unlocker', label: 'PDF Unlocker', icon: 'unlock', p1: true },
      { id: 'pdf-converter', label: 'PDF to Word / Image', icon: 'convert', p1: true },
    ],
  },
  {
    id: 'image',
    label: 'Image Tools',
    icon: 'image',
    tools: [
      { id: 'image-compressor', label: 'Image Compressor', icon: 'compress', p1: true },
      { id: 'image-converter', label: 'Image Converter', icon: 'img-convert', p1: true },
      { id: 'image-resizer', label: 'Image Resizer', icon: 'resize', p1: true },
      { id: 'bg-remover', label: 'Background Remover', icon: 'bg', p1: false },
    ],
  },
  {
    id: 'text',
    label: 'Text & Code Tools',
    icon: 'text',
    tools: [
      { id: 'json-formatter', label: 'JSON Formatter & Validator', icon: 'json', p1: true },
      { id: 'markdown', label: 'Markdown Previewer', icon: 'markdown', p1: false },
      { id: 'diff-checker', label: 'Diff Checker', icon: 'diff', p1: false },
    ],
  },
  {
    id: 'security',
    label: 'Security & Encoding',
    icon: 'security',
    tools: [
      { id: 'password-gen', label: 'Password Generator', icon: 'password', p1: true },
      { id: 'base64', label: 'Base64 Encoder / Decoder', icon: 'base64', p1: true },
    ],
  },
  {
    id: 'data',
    label: 'File & Data Tools',
    icon: 'data',
    tools: [
      { id: 'csv-to-json', label: 'CSV to JSON Converter', icon: 'csv', p1: true },
      { id: 'excel-to-csv', label: 'Excel to CSV Converter', icon: 'excel', p1: true },
      { id: 'qr-generator', label: 'QR Code Generator', icon: 'qr', p1: true },
      { id: 'barcode-generator', label: 'Barcode Generator', icon: 'barcode', p1: false },
      { id: 'file-size', label: 'File Size Converter', icon: 'file-size', p1: false },
    ],
  },
  {
    id: 'utility',
    label: 'Everyday Utility',
    icon: 'utility',
    tools: [
      { id: 'color-picker', label: 'Color Picker & Converter', icon: 'color', p1: true },
      { id: 'timestamp', label: 'Timestamp Converter', icon: 'timestamp', p1: false },
    ],
  },
];

export function getTool(id) {
  for (const cat of CATEGORIES) {
    for (const tool of cat.tools) {
      if (tool.id === id) return tool;
    }
  }
  return null;
}
