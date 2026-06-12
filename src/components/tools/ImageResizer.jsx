import React, { useState, useRef, useCallback } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

const MOBILE_PRESETS = [
  { label: 'iPhone 15', w: 1179, h: 2556 },
  { label: 'Samsung S24', w: 1080, h: 2340 },
  { label: 'Pixel 8', w: 1080, h: 2400 },
  { label: 'iPad Pro', w: 2048, h: 2732 },
  { label: 'Instagram', w: 1080, h: 1080 },
];

export default function ImageResizer() {
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [mode, setMode] = useState('aspect');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const fileRef = useRef(null);

  const addFiles = (e) => {
    const imgs = Array.from(e.target.files).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name));
    setFiles(prev => [...prev, ...imgs.filter(f => !prev.some(p => p.path === f.path)).map(f => ({ path: f.path, name: f.name }))]);
    e.target.value = '';
  };

  const applyPreset = (w, h) => {
    setWidth(String(w));
    setHeight(String(h));
  };

  const resize = useCallback(async () => {
    if (!files.length || !width) return;
    setProcessing(true);
    setResults([]);
    const out = [];
    for (const f of files) {
      try {
        const r = await window.pdfUnlocker.resizeImage({ filePath: f.path, width: parseInt(width), height: parseInt(height || '0'), mode });
        out.push({ name: f.name, ...r, success: true });
      } catch (err) {
        out.push({ name: f.name, success: false, error: err.message });
      }
    }
    setResults(out);
    setProcessing(false);
  }, [files, width, height, mode]);

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
    <ToolLayout title="Image Resizer" description="Resize images to custom dimensions. Supports bulk resize with aspect ratio options.">
      <InputPanel label="Upload Images">
        <div onClick={() => fileRef.current?.click()} className="drop-zone p-6 text-center cursor-pointer mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to select images</p>
        </div>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={addFiles} />
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
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div><label className="text-xs text-gray-500 mb-1 block">Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="800" className="input-field text-sm" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Auto" className="input-field text-sm" /></div>
        </div>
        {mode !== 'percent' && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Mobile Resolutions</label>
            <div className="flex flex-wrap gap-1">
              {MOBILE_PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p.w, p.h)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors">
                  {p.label} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          {['aspect', 'exact', 'percent'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === m ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {m === 'aspect' ? 'Aspect ratio' : m === 'exact' ? 'Exact' : 'Percentage'}
            </button>
          ))}
        </div>
        {mode === 'percent' && <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="50" className="input-field text-sm w-24 mb-3" />}
        <ActionButton onClick={resize} disabled={processing || !files.length || !width}>
          {processing ? 'Resizing...' : `Resize ${files.length > 1 ? `(${files.length})` : ''}`}
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
                {r.success && <span className="text-xs text-gray-400">{r.outputWidth}x{r.outputHeight}px</span>}
                {r.error && <span className="text-xs text-red-400 truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
