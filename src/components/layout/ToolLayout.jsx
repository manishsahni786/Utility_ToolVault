import React from 'react';

export default function ToolLayout({ title, description, children }) {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700/30">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>
    </div>
  );
}

export function InputPanel({ children, label }) {
  return (
    <div className="card p-4 mb-4">
      {label && <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{label}</h3>}
      {children}
    </div>
  );
}

export function OutputPanel({ children, label, onCopy }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        {label && <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</h3>}
        {onCopy && (
          <button onClick={onCopy} className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ActionButton({ children, onClick, disabled, className = '' }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`btn-primary flex items-center gap-2 text-sm px-6 py-2.5 ${className}`}>
      {children}
    </button>
  );
}
