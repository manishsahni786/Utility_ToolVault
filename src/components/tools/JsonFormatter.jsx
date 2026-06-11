import React, { useState } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [minified, setMinified] = useState(false);

  const process = () => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minified ? 0 : 2));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => navigator.clipboard?.writeText(output);

  return (
    <ToolLayout title="JSON Formatter & Validator" description="Format, validate, and beautify raw JSON data with error highlighting.">
      <InputPanel label="Input JSON">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8}
          className="input-field text-xs font-mono w-full resize-none" placeholder='Paste your JSON here...' spellCheck={false} />
        <div className="flex items-center gap-2 mt-3">
          <button onClick={process} className="btn-primary text-sm px-5 py-2">Format & Validate</button>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={minified} onChange={e => setMinified(e.target.checked)} className="rounded" />
            Minify
          </label>
        </div>
      </InputPanel>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {output && (
        <OutputPanel label="Formatted JSON" onCopy={copy}>
          <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/30">{output}</pre>
        </OutputPanel>
      )}
    </ToolLayout>
  );
}
