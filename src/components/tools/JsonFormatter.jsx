import React, { useState } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [minified, setMinified] = useState(false);

  const process = () => {
    if (!input.trim()) { setOutput(''); setError(''); setIsValid(false); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minified ? 0 : 2));
      setError('');
      setIsValid(true);
    } catch (e) {
      setError(e.message);
      setOutput('');
      setIsValid(false);
    }
  };

  const handleInputChange = (val) => {
    setInput(val);
    setIsValid(false);
    setError('');
  };

  const copy = () => navigator.clipboard?.writeText(output);

  return (
    <ToolLayout title="JSON Formatter & Validator" description="Format, validate, and beautify raw JSON data with error highlighting.">
      <InputPanel label="Input JSON">
        <textarea value={input} onChange={e => handleInputChange(e.target.value)} rows={8}
          className="input-field text-xs font-mono w-full resize-none" placeholder='Paste your JSON here...' spellCheck={false} />
        <div className="flex items-center gap-2 mt-3">
          <button onClick={process} className="btn-primary text-sm px-5 py-2">Format & Validate</button>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={minified} onChange={e => setMinified(e.target.checked)} className="rounded" />
            Minify
          </label>
        </div>
      </InputPanel>

      {isValid && !error && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          JSON is valid!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-mono flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <span className="font-semibold block mb-0.5">Invalid JSON:</span>
            <span>{error}</span>
          </div>
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
