# Utility_ToolVault — Product Requirements Document

**Version:** 2.0  
**Platform:** Windows / macOS / Linux  
**Framework:** Electron + Node.js + React  
**Status:** In Progress  
**Tagline:** Every tool. One Vault.

---

## 1. Overview

### Problem Statement

Developers, designers, and teams rely on dozens of scattered online tools daily — PDF unlockers, image compressors, JSON formatters, QR generators, and more. These tools require internet access, often ask users to upload sensitive files to unknown servers, and waste time with constant tab-switching.

### Vision

Utility_ToolVault is an offline-first, cross-platform desktop application that consolidates the most commonly used everyday utility tools into a single, fast, private, and beautiful workspace — built for teams and individuals who value speed, privacy, and simplicity.

### Tagline
```
Every tool. One Vault.
```

---

## 2. Goals

### Primary Goal
Build a single desktop application housing all frequently used online utility tools — working 100% offline, with no file uploads to external servers.

### Non-Goals (v2)
- Cloud sync or remote storage
- Mobile application
- Browser extension
- User accounts or authentication

---

## 3. Target Users

| User Type | Use Case |
|---|---|
| Developers | JSON formatting, Base64 encoding, Diff checking, CSV conversion |
| Designers | Image compression, resizing, format conversion, color picker |
| Office / Business users | PDF tools, Excel/CSV conversion, QR & barcode generation |
| Security-conscious teams | Password generation, offline file processing, no data leaks |

---

## 4. Features

---

### 📄 PDF Tools

#### 4.1 PDF Unlocker ✅ *(already built)*
- Remove owner/user password protection from PDFs
- Supports RC4, AES-128, AES-256 encryption
- Drag & drop single or multiple files
- Batch processing with per-file progress
- Output saved as `originalname_unlocked.pdf`
- **Priority:** P1

#### 4.2 PDF to Word / Image Converter
- Convert PDF pages to `.docx` (Word) format
- Convert PDF pages to images — JPG, PNG, WEBP
- Option to select specific page range
- Batch conversion support
- **Priority:** P1

---

### 🖼️ Image Tools

#### 4.3 Image Compressor
- Reduce image file size without visible quality loss
- Supports JPG, PNG, WEBP input
- Adjustable compression level (low / medium / high)
- Shows before/after file size comparison
- Bulk compress multiple images at once
- **Priority:** P1

#### 4.4 Image Converter
- Convert between JPG ↔ PNG ↔ WEBP formats
- Batch conversion support
- Preserves image dimensions unless resizing is also applied
- **Priority:** P1

#### 4.5 Image Resizer
- Resize images to custom width × height dimensions
- Bulk resize multiple images at once
- Options: maintain aspect ratio, exact dimensions, percentage scale
- Supports JPG, PNG, WEBP
- **Priority:** P1

#### 4.6 Background Remover
- Automatically remove background from images using AI
- Output as PNG with transparent background
- Support for portraits, product photos, and objects
- **Priority:** P2

---

### 📝 Text & Code Tools

#### 4.7 JSON Formatter & Validator
- Paste or upload raw JSON
- Auto-format with proper indentation
- Validate JSON and highlight errors with line numbers
- Minify / beautify toggle
- Copy formatted output to clipboard
- **Priority:** P1

#### 4.8 Markdown Previewer
- Split-pane editor: raw Markdown on left, live preview on right
- Supports full CommonMark spec (headings, tables, code blocks, etc.)
- Copy HTML output option
- **Priority:** P2

#### 4.9 Diff Checker
- Compare two blocks of text side by side
- Highlight added, removed, and changed lines
- Supports plain text and code (with syntax awareness)
- **Priority:** P2

---

### 🔐 Security & Encoding Tools

#### 4.10 Password Generator
- Generate strong random passwords
- Configurable: length, uppercase, lowercase, numbers, symbols
- One-click copy to clipboard
- Generate multiple passwords at once
- Strength indicator
- **Priority:** P1

#### 4.11 Base64 Encoder / Decoder
- Encode plain text or files to Base64
- Decode Base64 strings back to text or file
- Supports text and binary file input
- Copy output to clipboard
- **Priority:** P1

---

### 📊 File & Data Tools

#### 4.12 CSV to JSON Converter
- Upload or paste CSV data
- Auto-detect headers from first row
- Output clean, formatted JSON
- Copy or download output as `.json` file
- **Priority:** P1

#### 4.13 Excel to CSV Converter
- Upload `.xlsx` or `.xls` files
- Convert each sheet to a separate CSV file
- Download as individual CSVs or ZIP archive
- **Priority:** P1

#### 4.14 QR Code Generator
- Generate QR code from any text, URL, or data
- Customizable size and error correction level
- Download as PNG or SVG
- **Priority:** P1

#### 4.15 Barcode Generator
- Generate standard barcodes (Code128, EAN-13, EAN-8, UPC-A)
- Input: text or numeric data
- Download as PNG or SVG
- **Priority:** P2

#### 4.16 File Size Converter
- Convert between bytes, KB, MB, GB, TB
- Instant calculation as you type
- **Priority:** P2

---

### ⏱️ Everyday Utility

#### 4.17 Color Picker & HEX/RGB Converter
- Visual color picker wheel
- Convert between HEX ↔ RGB ↔ HSL
- Copy any format to clipboard with one click
- Save a palette of recently used colors
- **Priority:** P1

#### 4.18 Timestamp Converter
- Convert Unix timestamp ↔ human-readable date & time
- Supports local timezone and UTC
- "Use current time" button for quick reference
- **Priority:** P2

---

## 5. Feature Priority Summary

| Priority | Features |
|---|---|
| **P1 — Must Have (v2)** | PDF Unlocker, PDF to Word/Image, Image Compressor, Image Converter, Image Resizer, JSON Formatter, Password Generator, Base64 Encoder/Decoder, CSV to JSON, Excel to CSV, QR Code Generator, Color Picker |
| **P2 — Should Have** | Background Remover, Markdown Previewer, Diff Checker, Barcode Generator, File Size Converter, Timestamp Converter |

---

## 6. App Structure & Navigation

```
Utility_ToolVault
├── 📄 PDF Tools
│   ├── PDF Unlocker
│   └── PDF to Word / Image Converter
├── 🖼️ Image Tools
│   ├── Image Compressor
│   ├── Image Converter
│   ├── Image Resizer
│   └── Background Remover
├── 📝 Text & Code Tools
│   ├── JSON Formatter & Validator
│   ├── Markdown Previewer
│   └── Diff Checker
├── 🔐 Security & Encoding
│   ├── Password Generator
│   └── Base64 Encoder / Decoder
├── 📊 File & Data Tools
│   ├── CSV to JSON Converter
│   ├── Excel to CSV Converter
│   ├── QR Code Generator
│   ├── Barcode Generator
│   └── File Size Converter
└── ⏱️ Everyday Utility
    ├── Color Picker & HEX/RGB Converter
    └── Timestamp Converter
```

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Electron (latest stable) |
| UI Layer | React + Tailwind CSS |
| PDF Engine | `node-qpdf` + `pdf-lib` |
| Image Processing | `sharp` (compression, resize, convert) |
| Background Removal | `@imgly/background-removal` (offline AI model) |
| Excel/CSV | `xlsx` (SheetJS) |
| QR Code | `qrcode` npm package |
| Barcode | `bwip-js` npm package |
| JSON / Text tools | Native JS |
| Base64 | Native Node.js `Buffer` |
| IPC | Electron `contextBridge` |
| Build & Package | `electron-builder` |
| Local Storage | `electron-store` |
| Auto-updater | `electron-updater` via GitHub Releases |

---

## 8. Security & Privacy

- All file processing happens **locally on the user's machine**
- No files, text, or data are uploaded to any external server
- No analytics or telemetry without explicit user opt-in
- Bundled binaries (QPDF, etc.) must be code-signed on macOS and Windows
- No internet connection required after installation *(except Background Remover first-time model download)*

---

## 9. UI / UX Guidelines

- **Sidebar navigation** — category icons on the left, tool list expands on hover/click
- **Dark / Light theme** — follows OS preference, manual toggle in settings
- **Drag & drop** supported on all file-based tools
- **Copy to clipboard** button on all output fields
- **History log** — last 20 operations per tool, clearable
- Consistent layout: Input panel (left) → Output panel (right) for all tools

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Tools shipped in v2 | 18 utilities across 6 categories |
| Offline operation | 100% for all tools except Background Remover |
| App startup time | Under 3 seconds on mid-range hardware |
| Installer size | Under 150 MB |
| Crash rate | Zero crashes on normal tool usage |
| PDF processing speed | 20-page PDF under 2 seconds |
| Image compression | 1MB image compressed in under 1 second |

---

## 11. Milestones

| Milestone | Deliverable |
|---|---|
| **M1 — Scaffold** ✅ | Electron + React setup, sidebar navigation, routing |
| **M2 — PDF Tools** ✅ | PDF Unlocker complete, PDF Converter in progress |
| **M3 — Image Tools** | Compressor, Converter, Resizer, Background Remover |
| **M4 — Text & Code Tools** | JSON Formatter, Markdown Previewer, Diff Checker |
| **M5 — Security & Data Tools** | Password Gen, Base64, CSV/Excel, QR, Barcode |
| **M6 — Everyday Utilities** | Color Picker, Timestamp Converter, File Size Converter |
| **M7 — Polish & Release** | Themes, history log, code signing, packaging, GitHub Release |

---

## 12. Future Scope (v3+)

- PDF Merger & Splitter
- PDF Compressor
- Unit Converter (length, weight, temperature)
- Regex Tester
- Hash Generator (MD5, SHA256)
- Cron Expression Builder
- Word & Character Counter
- Lorem Ipsum Generator

---

*Product: Utility_ToolVault | Owner: Manish | Version: 2.0 | Last updated: June 2026*
