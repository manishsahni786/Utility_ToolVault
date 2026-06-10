import React, { useState } from 'react';

export default function SettingsModal({ settings, onClose, onSave, onSelectOutputDir }) {
  const [local, setLocal] = useState({ ...settings });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-fade-in"
         onClick={onClose}>
      <div className="card-highlight p-6 w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="btn-icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Theme</label>
            <div className="flex gap-2">
              {[
                { key: 'system', label: 'System' },
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ].map((t) => (
                <button key={t.key} onClick={() => setLocal({ ...local, theme: t.key })}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          (local.theme || 'system') === t.key
                            ? 'bg-accent-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Output Folder</label>
            <div className="flex items-center gap-2">
              <input type="text" value={local.outputDir || ''} readOnly
                     placeholder="Use default (~/Documents/Unlocked PDFs)"
                     className="input-field text-xs flex-1 truncate" />
              <button onClick={onSelectOutputDir} className="btn-secondary text-xs whitespace-nowrap">Browse</button>
            </div>
            {local.outputDir && (
              <button onClick={() => setLocal({ ...local, outputDir: null })}
                      className="text-[11px] text-red-400 hover:text-red-500 mt-1.5 font-medium transition-colors">
                Reset to default
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/40">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={() => onSave(local)} className="btn-primary text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
