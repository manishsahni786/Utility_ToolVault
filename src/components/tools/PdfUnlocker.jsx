import React, { useState, useCallback, useEffect, useRef } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

export default function PdfUnlocker() {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressList, setProgressList] = useState([]);
  const [qpdfStatus, setQpdfStatus] = useState({ checking: true, available: false });
  const [outputDir, setOutputDir] = useState('');
  const [showDownloadBanner, setShowDownloadBanner] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!window.pdfUnlocker) return;
    window.pdfUnlocker.checkQpdf()
      .then(s => setQpdfStatus({ checking: false, ...s }))
      .catch(() => setQpdfStatus({ checking: false, available: false }));
    window.pdfUnlocker.getSettings().then(s => setOutputDir(s.outputDir || '')).catch(() => {});
  }, []);

  useEffect(() => {
    if (!window.pdfUnlocker) return;
    const cleanup = window.pdfUnlocker.onUnlockProgress((data) => {
      setProgressList(prev => {
        const idx = prev.findIndex(p => p.index === data.index);
        if (idx >= 0) { const c = [...prev]; c[idx] = data; return c; }
        return [...prev, data];
      });
    });
    return cleanup;
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const pdfFiles = Array.from(e.dataTransfer.files)
      .filter(f => f.name.toLowerCase().endsWith('.pdf'))
      .map(f => ({ path: f.path, name: f.name, size: f.size }));
    if (pdfFiles.length) setFiles(prev => [...prev, ...pdfFiles.filter(f => !prev.some(p => p.path === f.path))]);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const pdfFiles = Array.from(e.target.files)
      .filter(f => f.name.toLowerCase().endsWith('.pdf'))
      .map(f => ({ path: f.path, name: f.name, size: f.size }));
    if (pdfFiles.length) setFiles(prev => [...prev, ...pdfFiles.filter(f => !prev.some(p => p.path === f.path))]);
    e.target.value = '';
  }, []);

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const clearAll = () => { setFiles([]); setProgressList([]); setShowDownloadBanner(false); };

  const handleUnlock = useCallback(async () => {
    if (!files.length || processing || !qpdfStatus.available) return;
    setProcessing(true);
    setShowDownloadBanner(false);
    const initial = files.map((f, i) => ({ index: i, total: files.length, file: f.name, status: 'queued' }));
    setProgressList(initial);
    const batchFiles = files.map(f => ({ filePath: f.path, password }));
    try { await window.pdfUnlocker.unlockBatch(batchFiles); } catch (err) { console.error(err); }
    setProcessing(false);
  }, [files, processing, qpdfStatus, password]);

  useEffect(() => {
    if (!processing && progressList.length > 0) {
      const allDone = progressList.every(p => p.status === 'success' || p.status === 'error');
      if (allDone) setShowDownloadBanner(true);
    }
  }, [processing, progressList]);

  const successCount = progressList.filter(p => p.status === 'success').length;
  const allComplete = showDownloadBanner;

  const saveToFolder = async () => {
    const dest = await window.pdfUnlocker.saveOutputDir();
    if (dest) {
      const paths = progressList.filter(p => p.outputPath).map(p => p.outputPath);
      if (paths.length) {
        await window.pdfUnlocker.copyFiles(paths, dest);
        window.pdfUnlocker.openOutputDir(dest);
      }
    }
  };

  const openFolder = () => {
    if (outputDir) window.pdfUnlocker.openOutputDir(outputDir);
  };

  const formatSize = (b) => {
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  };

  return (
    <ToolLayout title="PDF Unlocker" description="Remove password protection from PDF files. Supports batch unlocking with drag & drop.">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="drop-zone mb-4 p-8 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Drop PDF files here</p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
      </div>
      <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileSelect} />

      {!qpdfStatus.checking && !qpdfStatus.available && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
          QPDF engine not detected. Ensure qpdf.exe is in the binaries/ folder or in your system PATH.
        </div>
      )}

      {files.length > 0 && (
        <InputPanel label={`Queue (${files.length})`}>
          <div className="max-h-48 overflow-y-auto mb-3 space-y-1">
            {files.map((f, i) => {
              const prog = progressList.find(p => p.index === i);
              const status = prog?.status || 'pending';
              return (
                <div key={i} className="flex items-center gap-3 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/20">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    status === 'processing' ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {status === 'success' ? 'OK' : status === 'error' ? '!' : status === 'processing' ? '...' : ''}
                  </span>
                  <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                  <span className="text-[11px] text-gray-400">{formatSize(f.size)}</span>
                  {!processing && (status === 'pending' || status === 'queued') && (
                    <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="relative mb-3">
            <input type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter PDF password" disabled={processing}
              className="input-field text-sm pr-10" />
            <button onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {showPassword ? (
                  <><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></>
                ) : (
                  <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                )}
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton onClick={handleUnlock} disabled={processing || !files.length || !qpdfStatus.available}>
              {processing ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processing...</>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
              {processing ? 'Processing...' : `Unlock ${files.length > 1 ? `All (${files.length})` : 'PDF'}`}
            </ActionButton>
            {!processing && <button onClick={clearAll} className="btn-ghost text-sm">Clear</button>}
          </div>
        </InputPanel>
      )}

      {progressList.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
            <span className="text-xs text-gray-400">{progressList.filter(p => p.status === 'success' || p.status === 'error').length}/{progressList.length}</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {progressList.map(p => (
              <div key={p.index} className="flex items-center gap-2.5 text-sm py-1">
                <span className={`w-2 h-2 rounded-full ${
                  p.status === 'success' ? 'bg-emerald-500' :
                  p.status === 'error' ? 'bg-red-500' :
                  p.status === 'processing' ? 'bg-accent-500 animate-pulse' : 'bg-gray-300'
                }`} />
                <span className="flex-1 truncate text-gray-600 dark:text-gray-400 text-[13px]">{p.file}</span>
                <span className={`text-[11px] font-medium ${
                  p.status === 'success' ? 'text-emerald-500' :
                  p.status === 'error' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {p.status === 'success' ? 'Done' : p.status === 'error' ? (p.error || 'Failed') : p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allComplete && (
        <div className="card p-5 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-900/10 dark:to-blue-900/10 border-emerald-200/50 dark:border-emerald-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{successCount} file{successCount !== 1 ? 's' : ''} unlocked successfully</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Files saved to output folder</p>
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
        </div>
      )}
    </ToolLayout>
  );
}
