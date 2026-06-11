import React, { useState } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

export default function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState(',');

  const convert = () => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const lines = input.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 1) throw new Error('No data rows found');
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
      const result = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
      });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => navigator.clipboard?.writeText(output);

  return (
    <ToolLayout title="CSV to JSON Converter" description="Paste CSV data and convert it to clean, formatted JSON.">
      <InputPanel label="CSV Input">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8}
          className="input-field text-xs font-mono w-full resize-none" placeholder='name,email,age&#10;John,john@example.com,30&#10;Jane,jane@example.com,25' spellCheck={false} />
        <div className="flex items-center gap-3 mt-3">
          <label className="text-xs text-gray-500">Delimiter:</label>
          <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="input-field text-sm w-20">
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe</option>
          </select>
          <button onClick={convert} className="btn-primary text-sm px-5 py-2">Convert</button>
        </div>
      </InputPanel>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl text-red-600 dark:text-red-400 text-xs">{error}</div>
      )}

      {output && (
        <OutputPanel label="JSON Output" onCopy={copy}>
          <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/30">{output}</pre>
        </OutputPanel>
      )}
    </ToolLayout>
  );
}
