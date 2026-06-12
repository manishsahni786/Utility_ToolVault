import React, { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    setError('');
    try {
      const QRCode = require('qrcode');
      const url = await QRCode.toDataURL(text, { width: size, errorCorrectionLevel: errorLevel, margin: 2 });
      setQrDataUrl(url);
    } catch (e) {
      setError(e.message);
    }
  }, [text, size, errorLevel]);

  const download = (format) => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    if (format === 'svg') {
      QRCode.toString(text, { type: 'svg', width: size, errorCorrectionLevel: errorLevel })
        .then(svg => {
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          link.href = URL.createObjectURL(blob);
          link.download = 'qrcode.svg';
          link.click();
        });
    } else {
      link.href = qrDataUrl;
      link.download = 'qrcode.png';
      link.click();
    }
  };

  return (
    <ToolLayout title="QR Code Generator" description="Generate QR codes from any text, URL, or data. Customizable size and error correction.">
      <InputPanel label="Input">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
          className="input-field text-sm w-full resize-none" placeholder="Enter text or URL to encode..." />
        <div className="flex items-center gap-3 mt-3 mb-3 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Size</label>
            <select value={size} onChange={e => setSize(parseInt(e.target.value))} className="input-field text-sm w-24">
              <option value={128}>128px</option>
              <option value={256}>256px</option>
              <option value={512}>512px</option>
              <option value={1024}>1024px</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Correction</label>
            <select value={errorLevel} onChange={e => setErrorLevel(e.target.value)} className="input-field text-sm w-24">
              <option value="L">Low (L)</option>
              <option value="M">Medium (M)</option>
              <option value="Q">Quartile (Q)</option>
              <option value="H">High (H)</option>
            </select>
          </div>
          <ActionButton onClick={generate} disabled={!text.trim()} className="mt-4">Generate QR Code</ActionButton>
        </div>
      </InputPanel>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 rounded-xl text-red-600 text-xs">{error}</div>}

      {qrDataUrl && (
        <div className="card p-6 flex flex-col items-center">
          <img src={qrDataUrl} alt="QR Code" className="rounded-xl shadow-sm" style={{ width: size, height: size, maxWidth: '100%' }} />
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => download('png')} className="btn-primary text-sm px-4 py-2">Download PNG</button>
            <button onClick={() => download('svg')} className="btn-secondary text-sm px-4 py-2">Download SVG</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
