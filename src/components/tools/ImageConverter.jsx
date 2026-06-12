import React, { useState, useRef, useCallback } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

const FORMATS = ['png', 'jpg', 'webp'];

export default function ImageConverter() {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('png');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const fileRef = useRef(null);

  const addFiles = (e) => {
    const imgs = Array.from(e.target.files).filter(f => /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(f.name));
    setFiles(prev => [...prev, ...imgs.filter(f => !prev.some(p => p.path === f.path)).map(f => ({ path: f.path, name: f.name }))]);
    e.target.value = '';
  };

  const convert = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    setResults([]);
    const out = [];
    for (const f of files) {
      try {
        const r = await window.pdfUnlocker.convertImage({ filePath: f.path, format: targetFormat });
        out.push({ name: f.name, ...r, success: true });
      } catch (err) {
        out.push({ name: f.name, success: false, error: err.message });
      }
    }
    setResults(out);
    setProcessing(false);
  }, [files, targetFormat]);

  const saveTo = async () => {
    const dest = await window.pdfUnlocker.saveOutputDir();
    if (!dest) return;
    const paths = results.filter(r => r.success).map(r => r.outputPath);
    if (paths.length) await window.pdfUnlocker.copyFiles(paths, dest);
    window.pdfUnlocker.openOutputDir(dest);
  };

  const openFolder = () => {
    const r = results.find(r => r.success);
    if (r?.outputPath) window.pdfUnlocker.openOutputDir(r.outputPath.substring(0, r.outputPath.lastIndexOf('\\')));
  };

  return (
    <ToolLayout title="Image Converter" description="Convert images between JPG, PNG, WEBP and other formats. Batch conversion supported.">
      <InputPanel label="Upload Images">
        <div onClick={() => fileRef.current?.click()} className="drop-zone p-6 text-center cursor-pointer mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to select images</p>
        </div>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.bmp,.gif" multiple className="hidden" onChange={addFiles} />
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
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500">Convert to:</span>
          {FORMATS.map(f => (
            <button key={f} onClick={() => setTargetFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${targetFormat === f ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              .{f}
            </button>
          ))}
        </div>
        <ActionButton onClick={convert} disabled={processing || !files.length}>
          {processing ? 'Converting...' : `Convert ${files.length > 1 ? `(${files.length})` : ''}`}
        </ActionButton>
      </InputPanel>

      {results.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Results</h3>
            <div className="flex items-center gap-1.5">
              {results.some(r => r.success) && (
                <>
                  <button onClick={saveTo} className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Save To...
                  </button>
                  <button onClick={openFolder} className="btn-primary text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                    Open Folder
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={r.success ? 'text-emerald-500' : 'text-red-500'}>{r.success ? 'OK' : 'X'}</span>
                <span className="flex-1 truncate text-gray-600 dark:text-gray-400">{r.name}</span>
                {r.success && <span className="text-xs text-gray-400">→ .{r.outputFormat}</span>}
                {r.error && <span className="text-xs text-red-400 truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
