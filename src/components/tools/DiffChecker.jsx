import React, { useState, useMemo } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

let Diff;
try { Diff = require('diff'); } catch (e) {}

export default function DiffChecker() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');

  const diffs = useMemo(() => {
    if (!left && !right) return [];
    try {
      return Diff?.diffLines(left || '', right || '') || [];
    } catch { return []; }
  }, [left, right]);

  const renderDiff = () => {
    let lineLeft = 1, lineRight = 1;
    return diffs.map((part, i) => {
      const lines = part.value.split('\n');
      const count = lines.length - 1;
      if (!count) return null;
      const bg = part.added ? 'bg-green-50 dark:bg-green-900/20' : part.removed ? 'bg-red-50 dark:bg-red-900/20' : '';
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      const color = part.added ? 'text-green-600 dark:text-green-400' : part.removed ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';
      const startLeft = lineLeft;
      const startRight = lineRight;
      if (!part.added) lineLeft += count;
      if (!part.removed) lineRight += count;
      return (
        <div key={i} className={`flex font-mono text-xs ${bg}`}>
          <div className="w-12 text-right pr-2 text-gray-400 select-none border-r border-gray-200 dark:border-gray-700 py-0.5">{part.added ? '' : `${startLeft}${count > 1 ? `-${lineLeft - 1}` : ''}`}</div>
          <div className="w-12 text-right pr-2 text-gray-400 select-none border-r border-gray-200 dark:border-gray-700 py-0.5">{part.removed ? '' : `${startRight}${count > 1 ? `-${lineRight - 1}` : ''}`}</div>
          <div className={`flex-1 px-2 py-0.5 whitespace-pre ${color}`}>{prefix}{part.value.replace(/\n$/, '')}</div>
        </div>
      );
    });
  };

  return (
    <ToolLayout title="Diff Checker" description="Compare two blocks of text side by side with highlighted additions, removals, and changes.">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputPanel label="Original Text">
          <textarea value={left} onChange={e => setLeft(e.target.value)} rows={10}
            className="input-field text-xs font-mono w-full resize-none" placeholder="Paste original text..." spellCheck={false} />
        </InputPanel>
        <InputPanel label="Modified Text">
          <textarea value={right} onChange={e => setRight(e.target.value)} rows={10}
            className="input-field text-xs font-mono w-full resize-none" placeholder="Paste modified text..." spellCheck={false} />
        </InputPanel>
      </div>

      {diffs.length > 0 && (
        <OutputPanel label="Differences">
          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/50">
            {renderDiff()}
          </div>
        </OutputPanel>
      )}
    </ToolLayout>
  );
}
