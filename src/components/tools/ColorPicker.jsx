import React, { useState, useCallback } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#6366f1');
  const [palette, setPalette] = useState(['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#3b82f6']);

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const updateFromHex = (val) => {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) { setHex(val); }
    else { setHex(val); }
  };

  const updateFromRgb = (r, g, b) => {
    r = Math.min(255, Math.max(0, parseInt(r) || 0));
    g = Math.min(255, Math.max(0, parseInt(g) || 0));
    b = Math.min(255, Math.max(0, parseInt(b) || 0));
    setHex(rgbToHex(r, g, b));
  };

  const updateFromHsl = (h, s, l) => {
    h = Math.min(360, Math.max(0, parseInt(h) || 0));
    s = Math.min(100, Math.max(0, parseInt(s) || 0));
    l = Math.min(100, Math.max(0, parseInt(l) || 0));
    const { r, g, b } = hslToRgb(h, s, l);
    setHex(rgbToHex(r, g, b));
  };

  const addToPalette = () => {
    if (!palette.includes(hex)) setPalette(prev => [hex, ...prev].slice(0, 10));
  };

  const copy = (val) => navigator.clipboard?.writeText(val);

  return (
    <ToolLayout title="Color Picker & Converter" description="Pick colors visually and convert between HEX, RGB, and HSL formats with one-click copy.">
      <div className="grid grid-cols-2 gap-4">
        <InputPanel label="Color Picker">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-40 rounded-xl border-2 border-gray-200 dark:border-gray-700" style={{ backgroundColor: hex }}>
              <input type="color" value={hex} onChange={e => setHex(e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={hex} onChange={e => updateFromHex(e.target.value)}
              className="input-field text-sm font-mono w-32 text-center" />
            <button onClick={addToPalette} className="btn-secondary text-xs px-3 py-1.5">Add to Palette</button>
          </div>
        </InputPanel>
        <div className="space-y-4">
          <InputPanel label="RGB">
            <div className="space-y-2">
              {['R', 'G', 'B'].map((ch, i) => (
                <div key={ch} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 w-4">{ch}</span>
                  <input type="number" min={0} max={255} value={[rgb.r, rgb.g, rgb.b][i]}
                    onChange={e => {
                      const vals = [rgb.r, rgb.g, rgb.b];
                      vals[i] = e.target.value;
                      updateFromRgb(vals[0], vals[1], vals[2]);
                    }}
                    className="input-field text-sm w-full" />
                  <button onClick={() => copy(String([rgb.r, rgb.g, rgb.b][i]))} className="text-xs text-accent-500 hover:text-accent-600">Copy</button>
                </div>
              ))}
              <button onClick={() => copy(`${rgb.r}, ${rgb.g}, ${rgb.b}`)} className="text-xs font-medium text-accent-600 hover:text-accent-700">Copy all RGB</button>
            </div>
          </InputPanel>
          <InputPanel label="HSL">
            <div className="space-y-2">
              {['H', 'S', 'L'].map((ch, i) => (
                <div key={ch} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 w-4">{ch}</span>
                  <input type="number" min={0} max={i === 0 ? 360 : 100} value={[hsl.h, hsl.s, hsl.l][i]}
                    onChange={e => {
                      const vals = [hsl.h, hsl.s, hsl.l];
                      vals[i] = e.target.value;
                      updateFromHsl(vals[0], vals[1], vals[2]);
                    }}
                    className="input-field text-sm w-full" />
                  <button onClick={() => copy(String([hsl.h, hsl.s, hsl.l][i]))} className="text-xs text-accent-500 hover:text-accent-600">Copy</button>
                </div>
              ))}
              <button onClick={() => copy(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)} className="text-xs font-medium text-accent-600 hover:text-accent-700">Copy all HSL</button>
            </div>
          </InputPanel>
        </div>
      </div>

      <div className="mt-4 card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Palette</h3>
        <div className="flex gap-2 flex-wrap">
          {palette.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <button onClick={() => setHex(c)}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }} title={c} />
              <span className="text-[9px] text-gray-400 font-mono">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
