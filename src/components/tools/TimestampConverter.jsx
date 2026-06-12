import React, { useState, useMemo } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [mode, setMode] = useState('unix-to-date');

  const result = useMemo(() => {
    if (!timestamp.trim()) return null;
    const v = parseFloat(timestamp);
    if (isNaN(v)) return { error: 'Invalid number' };
    try {
      if (mode === 'unix-to-date') {
        const ms = v < 1e12 ? v * 1000 : v;
        const d = new Date(ms);
        if (isNaN(d.getTime())) return { error: 'Invalid timestamp' };
        return {
          utc: d.toUTCString(),
          local: d.toLocaleString(),
          iso: d.toISOString(),
          date: d.toLocaleDateString(),
          time: d.toLocaleTimeString(),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
        };
      } else {
        const d = new Date(v);
        if (isNaN(d.getTime())) return { error: 'Invalid date string' };
        const unix = Math.floor(d.getTime() / 1000);
        const unixMs = d.getTime();
        return { unix, unixMs, iso: d.toISOString() };
      }
    } catch (e) {
      return { error: e.message };
    }
  }, [timestamp, mode]);

  const copy = (val) => navigator.clipboard?.writeText(String(val));
  const now = () => setTimestamp(String(Math.floor(Date.now() / 1000)));

  return (
    <ToolLayout title="Timestamp Converter" description="Convert between Unix timestamps and human-readable date/time formats.">
      <InputPanel label="Input">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button onClick={() => setMode('unix-to-date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'unix-to-date' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
              Unix → Date
            </button>
            <button onClick={() => setMode('date-to-unix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'date-to-unix' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
              Date → Unix
            </button>
          </div>
          {mode === 'unix-to-date' && <button onClick={now} className="btn-secondary text-xs px-3 py-1.5">Now</button>}
        </div>
        <input type="text" value={timestamp} onChange={e => setTimestamp(e.target.value)}
          placeholder={mode === 'unix-to-date' ? 'Enter Unix timestamp (e.g. 1700000000)' : 'Enter date string (e.g. 2024-01-15)'}
          className="input-field text-sm w-full font-mono" />
      </InputPanel>

      {result && !result.error && (
        <OutputPanel label="Converted">
          {mode === 'unix-to-date' ? (
            <div className="space-y-2 text-sm">
              {[
                { label: 'UTC', value: result.utc },
                { label: 'Local', value: result.local },
                { label: 'ISO 8601', value: result.iso },
                { label: 'Date', value: result.date },
                { label: 'Time', value: result.time },
                { label: 'Year', value: result.year },
                { label: 'Month', value: result.month },
                { label: 'Day', value: result.day },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-14">{item.label}</span>
                  <code className="flex-1 text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded">{String(item.value)}</code>
                  <button onClick={() => copy(item.value)} className="text-[10px] text-accent-500 hover:text-accent-600">Copy</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                { label: 'Unix (s)', value: result.unix },
                { label: 'Unix (ms)', value: result.unixMs },
                { label: 'ISO 8601', value: result.iso },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">{item.label}</span>
                  <code className="flex-1 text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded">{String(item.value)}</code>
                  <button onClick={() => copy(item.value)} className="text-[10px] text-accent-500 hover:text-accent-600">Copy</button>
                </div>
              ))}
            </div>
          )}
        </OutputPanel>
      )}

      {result?.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl text-red-600 dark:text-red-400 text-xs">{result.error}</div>
      )}
    </ToolLayout>
  );
}
