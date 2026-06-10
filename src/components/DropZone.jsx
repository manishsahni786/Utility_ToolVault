import React, { useState, useCallback, useRef } from 'react';

export default function DropZone({ onFilesAdded }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files)
        .filter((f) => f.name.toLowerCase().endsWith('.pdf'))
        .map((f) => ({ path: f.path, name: f.name, size: f.size }));
      if (pdfFiles.length > 0) onFilesAdded(pdfFiles);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e) => {
    const pdfFiles = Array.from(e.target.files)
      .filter((f) => f.name.toLowerCase().endsWith('.pdf'))
      .map((f) => ({ path: f.path, name: f.name, size: f.size }));
    if (pdfFiles.length > 0) onFilesAdded(pdfFiles);
    e.target.value = '';
  }, [onFilesAdded]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto animate-fade-in">
      <div
        className={`drop-zone w-full ${dragging ? 'drop-zone-active' : ''}`}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
        onDragOver={handleDragOver} onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-100 to-blue-100 dark:from-accent-900/30 dark:to-blue-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">Drop PDFs here</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or select files or folders below</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Select Files
        </button>
        <button onClick={() => folderInputRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          Select Folder
        </button>
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-3">Supports PDF files &amp; folders — all processing is local</p>

      <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} />
      <input ref={folderInputRef} type="file" webkitdirectory="" multiple className="hidden" onChange={handleFileInput} />
    </div>
  );
}
