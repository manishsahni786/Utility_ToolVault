import React from 'react';

export default function ProgressPanel({ progressList }) {
  const completed = progressList.filter((p) => p.status === 'success' || p.status === 'error').length;
  const total = progressList.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const successCount = progressList.filter((p) => p.status === 'success').length;
  const errorCount = progressList.filter((p) => p.status === 'error').length;

  return (
    <div className="card p-5 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {completed}/{total} files
        </span>
        <div className="flex items-center gap-3 text-xs">
          {successCount > 0 && <span className="text-emerald-500 font-medium">{successCount} done</span>}
          {errorCount > 0 && <span className="text-red-500 font-medium">{errorCount} failed</span>}
          <span className="text-gray-400 tabular-nums">{pct}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-accent-500 to-blue-600 transition-all duration-500 ease-out"
             style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-0.5 max-h-36 overflow-y-auto mt-2">
        {progressList.map((p) => (
          <div key={p.index} className="flex items-center gap-2.5 py-1.5 text-sm">
            <span className="w-4 flex justify-center shrink-0">
              {p.status === 'processing' && <svg className="w-3.5 h-3.5 text-accent-500 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {p.status === 'success' && <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              {p.status === 'error' && <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
              {p.status === 'queued' && <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </span>
            <span className="flex-1 truncate text-gray-600 dark:text-gray-400 text-[13px]">{p.file}</span>
            {p.status === 'error' && p.error && (
              <span className="text-[11px] text-red-400 truncate max-w-[180px]" title={p.error}>{p.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
