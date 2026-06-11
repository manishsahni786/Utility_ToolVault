# UtilVault — Every Tool. One Vault.

An offline-first, cross-platform desktop application that brings together 18 essential utility tools into a single, fast, private workspace. Built with Electron + React + Tailwind CSS.

## Tools

### 📄 PDF Tools
- **PDF Unlocker** — Remove password protection from PDFs (batch, drag & drop)
- **PDF to Word / Image** — Convert PDF pages to PNG, JPG, WEBP, or DOCX

### 🖼️ Image Tools
- **Image Compressor** — Reduce file size with adjustable quality levels
- **Image Converter** — Convert between JPG, PNG, WEBP formats
- **Image Resizer** — Resize to custom dimensions with aspect ratio options
- **Background Remover** — Remove backgrounds from images (outputs PNG with transparency)

### 📝 Text & Code Tools
- **JSON Formatter & Validator** — Format, validate, minify/beautify JSON
- **Markdown Previewer** — Live split-pane Markdown editor with HTML preview
- **Diff Checker** — Side-by-side text comparison with highlighted changes

### 🔐 Security & Encoding
- **Password Generator** — Strong random passwords with strength indicator
- **Base64 Encoder / Decoder** — Encode/decode text to/from Base64

### 📊 File & Data Tools
- **CSV to JSON Converter** — Paste CSV data and get formatted JSON
- **Excel to CSV Converter** — Convert .xlsx/.xls files to CSV
- **QR Code Generator** — Generate QR codes with custom size and error correction
- **Barcode Generator** — Code 128, EAN-13, EAN-8, UPC-A
- **File Size Converter** — Convert between B, KB, MB, GB, TB

### ⏱️ Everyday Utility
- **Color Picker & Converter** — Visual color picker with HEX, RGB, HSL conversion
- **Timestamp Converter** — Convert between Unix timestamps and human-readable dates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 28 |
| UI | React 18, Tailwind CSS 3, Webpack 5 |
| PDF | qpdf, pdf-lib |
| Images | sharp |
| Excel/CSV | SheetJS (xlsx) |
| QR/Barcode | qrcode, bwip-js |
| Text | marked, diff |
| Storage | electron-store |
| Build | electron-builder |

## Development

```bash
# Install dependencies
npm install

# Dev mode (hot reload)
npm run dev

# Production build
npm run build:renderer && npm start

# Build installer
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```
