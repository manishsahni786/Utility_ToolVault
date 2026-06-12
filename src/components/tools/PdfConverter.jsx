import React, { useState, useRef, useCallback } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

export default function PdfConverter() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('png');
  const [pageRange, setPageRange] = useState('');
  const [converting, setConverting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const addFiles = useCallback((e) => {
    const pdfs = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setFiles(prev => [...prev, ...pdfs.filter(f => !prev.some(p => p.path === f.path)).map(f => ({ path: f.path, name: f.name, size: f.size }))]);
    e.target.value = '';
  }, []);

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const convert = useCallback(async () => {
    if (!files.length) return;
    setConverting(true);
    setError('');
    setResults(null);
    const allResults = [];
    let hasError = false;
    for (const f of files) {
      try {
        const { ok, result, error } = await window.pdfUnlocker.convertPdf({ filePath: f.path, format, pageRange });
        if (ok) {
          allResults.push({ ...result, inputName: f.name, fileSuccess: true });
        } else {
          allResults.push({ inputName: f.name, fileSuccess: false, error, files: [] });
          hasError = true;
        }
      } catch (err) {
        allResults.push({ inputName: f.name, fileSuccess: false, error: err.message, files: [] });
        hasError = true;
      }
    }
    if (allResults.length === 1) {
      setResults(allResults[0]);
      if (!allResults[0].fileSuccess) setError(allResults[0].error);
    } else {
      const batchFiles = [];
      let firstOutputDir = null;
      for (const res of allResults) {
        if (res.fileSuccess && res.files) {
          batchFiles.push(...res.files);
          if (!firstOutputDir && res.outputDir) {
            firstOutputDir = res.outputDir;
          }
        }
      }
      setResults({ batch: true, items: allResults, outputDir: firstOutputDir, files: batchFiles });
    }
    if (hasError && allResults.length > 1) setError('Some files failed to convert. See details below.');
    setConverting(false);
  }, [files, format, pageRange]);

  const saveToFolder = async (dir) => {
    if (results?.files?.length) {
      const dest = await window.pdfUnlocker.saveOutputDir();
      if (dest) {
        await window.pdfUnlocker.copyFiles(results.files, dest);
        window.pdfUnlocker.openOutputDir(dest);
      }
    }
  };

  const openFolder = () => {
    if (results?.outputDir) window.pdfUnlocker.openOutputDir(results.outputDir);
  };

  const formatSize = (b) => {
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  };

  return (
    <ToolLayout title="PDF to Word / Image" description="Convert PDF pages to PNG, JPG, WEBP images or DOCX (Word) format. Select specific pages or convert all.">
      <InputPanel label="Upload PDF">
        <div onClick={() => fileRef.current?.click()} className="drop-zone p-6 text-center cursor-pointer mb-3">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5l3.75-3.75m0 0L16.5 7.5M12.75 3v13.5m-6 0l-3.75 3.75M3 13.5h13.5" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to select a PDF file</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden" onChange={addFiles} />
        {files.length > 0 && (
          <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/20">
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Output Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="input-field text-sm">
              <option value="png">PNG Image</option>
              <option value="jpg">JPG Image</option>
              <option value="webp">WEBP Image</option>
              <option value="docx">Word (DOCX)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Page Range <span className="text-gray-400 font-normal">(optional, e.g. 1-5, 8, 11-13)</span></label>
            <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)}
              placeholder="All pages" className="input-field text-sm" />
          </div>
          <ActionButton onClick={convert} disabled={converting || !files.length} className="mb-px">
            {converting ? 'Converting...' : 'Convert'}
          </ActionButton>
        </div>
      </InputPanel>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Conversion Error</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
          <p className="text-[11px] text-red-400 dark:text-red-500 mt-1.5">
            Make sure the PDF file is valid and not corrupted. For DOCX output, advanced PDF rendering support is required.
          </p>
        </div>
      )}

      {results && !results.batch && results.fileSuccess === false && (
        <div className="card p-5 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/10 dark:to-orange-900/10 border-red-200/50 dark:border-red-700/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Conversion failed</p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{results.error}</p>
            </div>
          </div>
        </div>
      )}
      {results && !results.batch && results.fileSuccess !== false && (
        <div className="card p-5 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-900/10 dark:to-blue-900/10 border-emerald-200/50 dark:border-emerald-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {results.pages} page{results.pages !== 1 ? 's' : ''} converted to {results.format?.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{results.inputName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveToFolder} className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Save To...
              </button>
              <button onClick={openFolder} className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                Open Folder
              </button>
            </div>
          </div>
          {results.files && results.files.length <= 10 && (
            <div className="mt-3 pt-3 border-t border-emerald-200/30 dark:border-emerald-700/20">
              <p className="text-[11px] text-gray-400 font-medium mb-1.5">Output files:</p>
              <div className="space-y-1">
                {results.files.map((fp, i) => (
                  <p key={i} className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">{fp}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {results && results.batch && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-750/30">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Results</h3>
            {results.files && results.files.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={saveToFolder} className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Save To...
                </button>
                <button onClick={openFolder} className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  Open Folder
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {results.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                <span className={item.fileSuccess ? 'text-emerald-500' : 'text-red-500'}>
                  {item.fileSuccess ? 'OK' : 'X'}
                </span>
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{item.inputName}</span>
                {item.fileSuccess && <span className="text-xs text-gray-400">{item.pages} pages</span>}
                {!item.fileSuccess && <span className="text-xs text-red-400 truncate max-w-[180px]">{item.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
