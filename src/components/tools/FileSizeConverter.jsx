import React, { useState, useMemo } from 'react';
import ToolLayout, { InputPanel } from '../layout/ToolLayout';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export default function FileSizeConverter() {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('MB');
  const [toUnit, setToUnit] = useState('KB');

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v) || v < 0) return null;
    const fromIdx = UNITS.indexOf(fromUnit);
    const toIdx = UNITS.indexOf(toUnit);
    const bytes = v * Math.pow(1024, fromIdx);
    const converted = bytes / Math.pow(1024, toIdx);
    return { value: converted, unit: toUnit };
  }, [value, fromUnit, toUnit]);

  return (
    <ToolLayout title="File Size Converter" description="Convert between bytes, KB, MB, GB, and TB. Instant calculation as you type.">
      <InputPanel label="Converter">
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Value</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter size..." className="input-field text-sm" />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="input-field text-sm">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="input-field text-sm">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        {result && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {result.value.toLocaleString(undefined, { maximumFractionDigits: 4 })} {result.unit}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              = {result.value.toLocaleString(undefined, { maximumFractionDigits: 4 })} {result.unit}
              {result.unit !== 'B' && ` (${(result.value * 1024).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${UNITS[UNITS.indexOf(result.unit) - 1] || ''})`}
            </p>
          </div>
        )}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {UNITS.map((u, i) => {
            const v = parseFloat(value);
            if (isNaN(v)) return null;
            const bytes = v * Math.pow(1024, UNITS.indexOf(fromUnit));
            const converted = bytes / Math.pow(1024, i);
            return (
              <div key={u} className="text-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700/30">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-gray-400">{u}</p>
              </div>
            );
          })}
        </div>
      </InputPanel>
    </ToolLayout>
  );
}
