import React, { useState, useRef, useCallback } from 'react';
import ToolLayout, { InputPanel, ActionButton } from '../layout/ToolLayout';

const FORMATS = [
  { value: 'code128', label: 'Code 128' },
  { value: 'ean13', label: 'EAN-13' },
  { value: 'ean8', label: 'EAN-8' },
  { value: 'upca', label: 'UPC-A' },
];

export default function BarcodeGenerator() {
  const [text, setText] = useState('');
  const [format, setFormat] = useState('code128');
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    setError('');
    try {
      const bwipjs = require('bwip-js');
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: format,
        text: text.trim(),
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: 'center',
      });
      setBarcodeDataUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError(e.message || 'Invalid input for this barcode format');
    }
  }, [text, format]);

  const download = () => {
    if (!barcodeDataUrl) return;
    const link = document.createElement('a');
    link.href = barcodeDataUrl;
    link.download = `barcode-${format}.png`;
    link.click();
  };

  return (
    <ToolLayout title="Barcode Generator" description="Generate standard barcodes including Code 128, EAN-13, EAN-8, and UPC-A.">
      <InputPanel label="Input">
        <div className="flex items-center gap-3 mb-3">
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter barcode data..." className="input-field text-sm flex-1" />
          <select value={format} onChange={e => setFormat(e.target.value)} className="input-field text-sm w-28">
            {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <ActionButton onClick={generate} disabled={!text.trim()}>Generate</ActionButton>
        </div>
      </InputPanel>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 rounded-xl text-red-600 text-xs">{error}</div>}

      {barcodeDataUrl && (
        <div className="card p-6 flex flex-col items-center">
          <img src={barcodeDataUrl} alt="Barcode" className="rounded-xl shadow-sm max-w-full" />
          <div className="flex items-center gap-3 mt-4">
            <button onClick={download} className="btn-primary text-sm px-4 py-2">Download PNG</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
