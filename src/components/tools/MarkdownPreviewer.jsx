import React, { useState, useMemo } from 'react';
import ToolLayout, { InputPanel, OutputPanel } from '../layout/ToolLayout';

let marked;
try { marked = require('marked'); } catch (e) { /* marked not available */ }

export default function MarkdownPreviewer() {
  const [input, setInput] = useState('# Hello\n\nType **Markdown** here...');

  const html = useMemo(() => {
    if (!input) return '<p style="color:#999">Preview will appear here</p>';
    try {
      return marked?.parse?.(input) || input;
    } catch { return input; }
  }, [input]);

  const copyHtml = () => {
    navigator.clipboard?.writeText(html);
  };

  return (
    <ToolLayout title="Markdown Previewer" description="Write Markdown on the left, see the rendered HTML preview live on the right.">
      <div className="grid grid-cols-2 gap-4 h-[500px]">
        <InputPanel label="Markdown Input">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={16}
            className="input-field text-xs font-mono w-full h-full resize-none" spellCheck={false} />
        </InputPanel>
        <OutputPanel label="Preview" onCopy={copyHtml}>
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs overflow-y-auto h-[420px] p-3 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/30"
            dangerouslySetInnerHTML={{ __html: html }} />
        </OutputPanel>
      </div>
    </ToolLayout>
  );
}
