# Manish PDF Unlocker — Product Requirements Document

**Version:** 1.0  
**Platform:** Windows / macOS / Linux  
**Framework:** Electron + Node.js  
**Status:** Draft  

---

## 1. Overview

### Problem Statement

Users frequently receive password-protected PDFs (invoices, reports, forms) where they know the password but find it cumbersome to re-enter it every time, or need to share the file freely. No simple, offline, privacy-respecting desktop tool exists to strip PDF passwords quickly without uploading files to third-party servers.

### Vision

A lightweight, offline-first desktop application that lets users remove password protection from PDF files in seconds — with a clean drag-and-drop interface and zero data leaving the user's machine.

---

## 2. Goals

### Primary Goal
Allow users to remove owner/user passwords from PDF files using a simple drag-and-drop desktop UI, entirely offline with no data uploaded to any server.

### Non-Goals (v1)
- Brute-force cracking of unknown passwords
- PDF editing, annotation, or merging
- Cloud sync or remote storage
- Mobile application

---

## 3. User Stories

| # | As a user, I can… |
|---|---|
| 1 | Drag and drop a PDF onto the app window and see it listed immediately |
| 2 | Enter the known password for a protected PDF and click Unlock |
| 3 | Process multiple PDFs in a batch (bulk unlock queue) |
| 4 | Choose the output folder where unlocked files are saved |
| 5 | Receive a clear success or error message for each file processed |
| 6 | Be confident my files never leave my machine — all processing is local |

---

## 4. Features

### P1 — Must Have

#### Drag & Drop Input
- Drop single or multiple PDFs onto the app window
- Also supports a Browse button using the native OS file picker
- Accepted file type: `.pdf` only; invalid files show a clear error

#### Password Entry
- Text field with show/hide toggle
- Checkbox: "Use same password for all files" (for batch mode)
- Option to assign individual passwords per file in the queue

#### Unlock & Save
- Removes owner restrictions and user password from the PDF
- Saves a new unlocked copy — original file is **never** overwritten
- Output filename format: `originalname_unlocked.pdf`

#### Batch Processing
- Queue multiple PDFs and unlock all with one click
- Per-file progress indicator
- Continues processing remaining files even if one fails

---

### P2 — Should Have

#### Output Folder Selector
- Default: same directory as the original file
- Option to set a global output directory in settings
- "Open output folder" button after processing completes

#### History Log
- Session log listing processed files, timestamps, and pass/fail status
- Clearable with one click
- Persisted between sessions via local storage

#### Dark / Light Theme
- Follows OS preference automatically on launch
- Manual toggle available in settings

---

### P3 — Nice to Have

#### Auto-Updater
- Checks for new releases on launch via GitHub Releases
- Non-blocking notification; user chooses when to update

#### Drag Reorder in Queue
- Reorder files in the batch queue before processing

---

## 5. User Flow

```
Launch app
    │
    ▼
Welcome screen with large drop zone
    │
    ▼
Add files (drag & drop or Browse button)
    │  → Files appear in list: name, size, lock status icon
    ▼
Enter password
    │  → "Use same for all" checkbox for batch mode
    ▼
Click Unlock
    │  → Progress bar runs per file
    │  → Success: green check ✓
    │  → Wrong password: red × with message
    ▼
Open output folder button
    │  → Reveals unlocked PDFs in OS file explorer
    ▼
Done
```

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Electron (latest stable) — cross-platform desktop shell |
| UI Layer | React + Tailwind CSS (renderer process) |
| PDF Engine | `node-qpdf` (wraps QPDF CLI) or `pdf-lib` for pure JS fallback |
| IPC | Electron `contextBridge` — renderer ↔ main process communication |
| Build & Package | `electron-builder` (NSIS for Windows, DMG for macOS, AppImage for Linux) |
| Auto-updater | `electron-updater` via GitHub Releases |
| Local Storage | `electron-store` (JSON) for settings and history |

### PDF Library Options (in order of recommendation)

1. **node-qpdf** — wraps the battle-tested QPDF CLI binary; handles RC4, AES-128, AES-256 encryption reliably
2. **pdf-lib** — pure JavaScript, no binary dependency; limited support for some encrypted PDFs
3. **hummus-recipe** — alternative for edge cases

---

## 7. Security & Privacy Constraints

- All PDF processing must happen in the **main Node.js process** — never send file bytes to any remote API
- The renderer process may only receive success/failure status and output paths via IPC — not raw file buffers
- No analytics or telemetry without explicit opt-in from the user
- Bundled QPDF binary must be **code-signed** on macOS and Windows
- No internet connection required after installation

---

## 8. UI Screens (v1)

### Screen 1 — Main / Drop Zone
- App logo + name top-left
- Large centered drop zone with dashed border: "Drop PDF files here"
- Browse button below
- Settings icon top-right

### Screen 2 — File Queue
- List of added files: filename, file size, lock icon, status badge
- Password input field (with show/hide toggle)
- "Use same password for all" checkbox
- Unlock button (primary CTA)
- Clear queue button

### Screen 3 — Processing / Results
- Per-file progress bars
- Status icons: processing (spinner), success (green ✓), error (red ✗)
- Error message displayed inline per failed file
- "Open output folder" button on completion

---

## 9. Success Metrics

### v1 Launch Criteria

| Metric | Target |
|---|---|
| Encryption support | RC4, AES-128, AES-256 owner & user passwords |
| Processing speed | 20-page PDF unlocked in under 2 seconds |
| Batch stability | Zero crashes on 100 consecutive files |
| Installer size | Under 80 MB on all three platforms |
| Offline operation | 100% — no network calls during PDF processing |

---

## 10. Milestones

| Milestone | Deliverable |
|---|---|
| M1 — Scaffold | Electron + React project setup, IPC bridge, QPDF integration |
| M2 — Core unlock | Single file drag, password entry, unlock & save working |
| M3 — Batch + UI | Batch queue, progress UI, output folder selector |
| M4 — Polish | Dark/light theme, history log, error handling |
| M5 — Release | Code signing, electron-builder packaging, GitHub Release |

---

*Document owner: Manish | Last updated: June 2026*
