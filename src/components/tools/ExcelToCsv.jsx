import React, { useState, useRef, useCallback } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

export default function ExcelToCsv() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [results, setResults] = useState([]);
  const fileRef = useRef(null);

  const addFiles = (e) => {
    const xls = Array.from(e.target.files).filter(f => /\.(xlsx|xls)$/i.test(f.name));
    setFiles(prev => [...prev, ...xls.filter(f => !prev.some(p => p.path === f.path)).map(f => ({ path: f.path, name: f.name }))]);
    e.target.value = '';
  };

  const convert = useCallback(async () => {
    if (!files.length) return;
    setConverting(true);
    setResults([]);
    const out = [];
    for (const f of files) {
      try {
        const r = await window.pdfUnlocker.excelToCsv({ filePath: f.path });
        out.push({ name: f.name, ...r, success: true });
      } catch (err) {
        out.push({ name: f.name, success: false, error: err.message });
      }
    }
    setResults(out);
    setConverting(false);
  }, [files]);

  return (
    <ToolLayout title="Excel to CSV Converter" description="Convert .xlsx and .xls files to CSV format. Each sheet becomes a separate CSV file.">
      <InputPanel label="Upload Excel Files">
        <div onClick={() => fileRef.current?.click()} className="drop-zone p-6 text-center cursor-pointer mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to select Excel files (.xlsx / .xls)</p>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" multiple className="hidden" onChange={addFiles} />
        {files.length > 0 && (
          <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ))}
          </div>
        )}
        <ActionButton onClick={convert} disabled={converting || !files.length}>
          {converting ? 'Converting...' : `Convert ${files.length > 1 ? `(${files.length} files)` : ''}`}
        </ActionButton>
      </InputPanel>

      {results.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Results</h3>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={r.success ? 'text-emerald-500' : 'text-red-500'}>{r.success ? 'OK' : 'X'}</span>
                <span className="flex-1 truncate text-gray-600 dark:text-gray-400">{r.name}</span>
                {r.success && <span className="text-xs text-gray-400">{r.sheets} sheet{r.sheets > 1 ? 's' : ''} → {r.csvCount} CSV{r.csvCount > 1 ? 's' : ''}</span>}
                {r.error && <span className="text-xs text-red-400 truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
