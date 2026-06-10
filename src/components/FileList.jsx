import React from 'react';

export default function FileList({ files, onRemove, onClear, formatSize, progressList, processing, outputDir }) {
  const getFileStatus = (index) => {
    const prog = progressList.find((p) => p.index === index);
    return prog?.status || 'pending';
  };

  const allComplete = files.length > 0 && files.every((_, i) => {
    const s = getFileStatus(i);
    return s === 'success' || s === 'error';
  });

  const successCount = progressList.filter((p) => p.status === 'success').length;

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700/40">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Queue</h3>
          <span className="text-xs font-bold text-accent-500 bg-accent-50 dark:bg-accent-900/20 px-2 py-0.5 rounded-md">{files.length}</span>
        </div>
        {!processing && files.length > 0 && (
          <button onClick={onClear} className="text-[11px] text-gray-400 hover:text-red-400 font-medium transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {files.map((file, i) => {
          const status = getFileStatus(i);
          const prog = progressList.find((p) => p.index === i);
          const errorMsg = prog?.error;
          return (
            <div key={i} className="file-row border-b border-gray-50 dark:border-gray-700/20 last:border-0 group">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center flex-shrink-0">
                {status === 'processing' && <svg className="w-4 h-4 text-accent-500 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {status === 'success' && <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                {status === 'error' && <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                {(status === 'pending' || status === 'queued') && <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-5">{file.name}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatSize(file.size)}</p>
                {status === 'error' && errorMsg && <p className="text-[11px] text-red-500 mt-0.5">{errorMsg}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {status === 'success' && prog?.outputPath && (
                  <button onClick={() => window.pdfUnlocker.openOutputDir(outputDir)}
                          className="text-[11px] font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700">
                    Open
                  </button>
                )}
                {!processing && (status === 'pending' || status === 'queued') && (
                  <button onClick={() => onRemove(i)}
                          className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allComplete && (
        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700/40 bg-gradient-to-r from-accent-50/50 to-blue-50/50 dark:from-accent-900/10 dark:to-blue-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{successCount} file{successCount !== 1 ? 's' : ''} unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={async () => {
                  const dest = await window.pdfUnlocker.saveOutputDir();
                  if (dest) {
                    const paths = progressList.filter(p => p.outputPath).map(p => p.outputPath);
                    await window.pdfUnlocker.copyFiles(paths, dest);
                    window.pdfUnlocker.openOutputDir(dest);
                  }
                }}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Save To...
              </button>
              <button onClick={() => window.pdfUnlocker.openOutputDir(outputDir)}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                Open Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
