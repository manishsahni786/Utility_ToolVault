import React, { useState, useCallback } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

function generatePassword(length, useUpper, useLower, useNumbers, useSymbols) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let chars = '';
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;
  if (!chars) chars = lower + numbers;
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 16) score++;
  if (score >= 5) return { label: 'Very Strong', color: 'text-emerald-500', bar: 'bg-emerald-500', pct: 100 };
  if (score >= 4) return { label: 'Strong', color: 'text-green-500', bar: 'bg-green-500', pct: 80 };
  if (score >= 3) return { label: 'Good', color: 'text-yellow-500', bar: 'bg-yellow-500', pct: 60 };
  if (score >= 2) return { label: 'Weak', color: 'text-orange-500', bar: 'bg-orange-500', pct: 40 };
  return { label: 'Very Weak', color: 'text-red-500', bar: 'bg-red-500', pct: 20 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const generate = useCallback(() => {
    const pws = Array.from({ length: count }, () => generatePassword(length, useUpper, useLower, useNumbers, useSymbols));
    setPasswords(pws);
    setCopiedIndex(-1);
  }, [length, useUpper, useLower, useNumbers, useSymbols, count]);

  const copy = async (pw, i) => {
    await navigator.clipboard?.writeText(pw);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(-1), 1500);
  };

  const strength = passwords.length > 0 ? calcStrength(passwords[0]) : null;

  return (
    <ToolLayout title="Password Generator" description="Generate strong, random passwords with configurable options and strength indicator.">
      <InputPanel label="Options">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Length: {length}</label>
            <input type="range" min={4} max={64} value={length} onChange={e => setLength(parseInt(e.target.value))} className="w-full accent-accent-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Uppercase (A-Z)', checked: useUpper, set: setUseUpper },
              { label: 'Lowercase (a-z)', checked: useLower, set: setUseLower },
              { label: 'Numbers (0-9)', checked: useNumbers, set: setUseNumbers },
              { label: 'Symbols (!@#)', checked: useSymbols, set: setUseSymbols },
            ].map(cfg => (
              <label key={cfg.label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={cfg.checked} onChange={e => cfg.set(e.target.checked)} className="rounded accent-accent-500" />
                {cfg.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Count:</label>
            <input type="number" min={1} max={50} value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} className="input-field text-sm w-20" />
            <button onClick={generate} className="btn-primary text-sm px-5 py-2">Generate</button>
          </div>
        </div>
      </InputPanel>

      {passwords.length > 0 && (
        <OutputPanel label="Generated Passwords">
          {strength && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${strength.color}`}>Strength: {strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.bar}`} style={{ width: `${strength.pct}%` }} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
                <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 truncate">{pw}</code>
                <button onClick={() => copy(pw, i)} className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 whitespace-nowrap">
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </OutputPanel>
      )}
    </ToolLayout>
  );
}
