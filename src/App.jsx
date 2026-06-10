import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import PasswordInput from './components/PasswordInput';
import ProgressPanel from './components/ProgressPanel';
import SettingsModal from './components/SettingsModal';
import useTheme from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [files, setFiles] = useState([]);
  const [qpdfStatus, setQpdfStatus] = useState({ checking: true, available: false, version: null });
  const [useSamePassword, setUseSamePassword] = useState(true);
  const [globalPassword, setGlobalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressList, setProgressList] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ outputDir: null, theme: 'system' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [outputDir, setOutputDir] = useState('');

  useEffect(() => {
    if (!window.pdfUnlocker) {
      setQpdfStatus({ checking: false, available: false, version: null, error: 'IPC bridge not loaded' });
      return;
    }
    window.pdfUnlocker.checkQpdf()
      .then((status) => setQpdfStatus({ checking: false, ...status }))
      .catch(() => setQpdfStatus({ checking: false, available: false }));
    window.pdfUnlocker.getSettings().then((s) => {
      setSettings(s);
      setOutputDir(s.outputDir || '');
    }).catch(() => {});
    window.pdfUnlocker.getHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    if (!window.pdfUnlocker) return;
    const cleanup = window.pdfUnlocker.onUnlockProgress((data) => {
      setProgressList((prev) => {
        const idx = prev.findIndex((p) => p.index === data.index);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = data;
          return copy;
        }
        return [...prev, data];
      });
    });
    return cleanup;
  }, []);

  const addFiles = useCallback((newFiles) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.path));
      const unique = newFiles.filter((f) => !existing.has(f.path));
      return [...prev, ...unique.map((f) => ({
        path: f.path, name: f.name, size: f.size, password: '', status: 'pending',
      }))];
    });
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setFiles([]);
    setProgressList([]);
  }, []);

  const updateFilePassword = useCallback((index, password) => {
    setFiles((prev) => prev.map((f, i) => i === index ? { ...f, password } : f));
  }, []);

  const handleUnlock = useCallback(async () => {
    if (files.length === 0 || processing) return;
    if (!qpdfStatus.available) {
      alert('QPDF engine is not available on your system.');
      return;
    }

    setProcessing(true);
    setProgressList(files.map((f, i) => ({ index: i, total: files.length, file: f.name, status: 'queued' })));

    const batchFiles = files.map((f) => ({
      filePath: f.path,
      password: useSamePassword ? globalPassword : f.password,
    }));

    try {
      await window.pdfUnlocker.unlockBatch(batchFiles);
    } catch (error) {
      console.error('Batch unlock failed:', error);
    }

    setProcessing(false);
    window.pdfUnlocker.getHistory().then(setHistory);
  }, [files, processing, qpdfStatus, useSamePassword, globalPassword]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117]">
      <Header
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSettingsClick={() => setShowSettings(true)}
        onHistoryClick={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
        qpdfAvailable={qpdfStatus.available}
        qpdfChecking={qpdfStatus.checking}
      />

      <main className="flex-1 px-6 py-5 max-w-2xl mx-auto w-full">
        {!qpdfStatus.checking && !qpdfStatus.available && (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5 animate-fade-in">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>QPDF engine not detected. Download from <a href="https://github.com/qpdf/qpdf/releases" target="_blank" rel="noreferrer" className="underline font-medium">github.com/qpdf/qpdf</a></span>
          </div>
        )}

        {showHistory && (
          <div className="mb-4 card p-4 max-h-56 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">History</span>
              {history.length > 0 && (
                <button onClick={() => { window.pdfUnlocker.clearHistory(); setHistory([]); }}
                        className="text-[11px] text-gray-400 hover:text-red-400 font-medium">Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No files processed yet.</p>
            ) : (
              history.map((entry, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/20 last:border-0">
                  <span className={entry.status === 'success' ? 'text-emerald-500' : 'text-red-500'}>
                    {entry.status === 'success' ? '\u2713' : '\u2717'}
                  </span>
                  <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{entry.file}</span>
                  <span className="text-[11px] text-gray-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {files.length === 0 ? (
          <div className="flex items-center justify-center min-h-[420px]">
            <DropZone onFilesAdded={addFiles} />
          </div>
        ) : (
          <div className="space-y-3.5">
            <FileList
              files={files} onRemove={removeFile} onClear={clearQueue}
              formatSize={formatSize} progressList={progressList}
              processing={processing} outputDir={outputDir}
            />
            <PasswordInput
              useSame={useSamePassword} onUseSameChange={setUseSamePassword}
              globalPassword={globalPassword} onGlobalPasswordChange={setGlobalPassword}
              showPassword={showPassword} onToggleShow={() => setShowPassword(!showPassword)}
              files={files} onFilePasswordChange={updateFilePassword} processing={processing}
            />
            <div className="flex items-center gap-2.5 pt-1">
              <button onClick={handleUnlock} disabled={processing || files.length === 0 || !qpdfStatus.available}
                      className="btn-primary flex items-center gap-2 text-sm px-7 py-2.5">
                {processing ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>Unlock {files.length > 1 ? `All (${files.length})` : 'PDF'}</>
                )}
              </button>
              {!processing && (
                <button onClick={clearQueue} className="btn-ghost text-sm">Clear</button>
              )}
            </div>
            {progressList.length > 0 && <ProgressPanel progressList={progressList} />}
          </div>
        )}
      </main>
    </div>
  );
}
