import React, { useState } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('encode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const process = async () => {
    if (!input) { setOutput(''); setError(''); return; }
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        try {
          setOutput(atob(input));
        } catch {
          setError('Invalid Base64 input string');
          setOutput('');
        }
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => navigator.clipboard?.writeText(output);

  return (
    <ToolLayout title="Base64 Encoder / Decoder" description="Encode text to Base64 or decode Base64 strings back to text.">
      <InputPanel label={mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={6}
          className="input-field text-xs font-mono w-full resize-none" placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'} spellCheck={false} />
        <div className="flex items-center gap-2 mt-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'encode' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Encode</button>
            <button onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'decode' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Decode</button>
          </div>
          <button onClick={process} className="btn-primary text-sm px-5 py-2">Convert</button>
        </div>
      </InputPanel>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 rounded-xl text-red-600 dark:text-red-400 text-xs">{error}</div>
      )}

      {output && (
        <OutputPanel label={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'} onCopy={copy}>
          <textarea value={output} readOnly rows={4}
            className="input-field text-xs font-mono w-full resize-none bg-gray-50 dark:bg-gray-900/50" />
        </OutputPanel>
      )}
    </ToolLayout>
  );
}
