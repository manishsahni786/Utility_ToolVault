import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import SettingsModal from './components/SettingsModal';
import useTheme from './hooks/useTheme';
import PdfUnlocker from './components/tools/PdfUnlocker';
import PdfConverter from './components/tools/PdfConverter';
import ImageCompressor from './components/tools/ImageCompressor';
import ImageConverter from './components/tools/ImageConverter';
import ImageResizer from './components/tools/ImageResizer';
import BackgroundRemover from './components/tools/BackgroundRemover';
import JsonFormatter from './components/tools/JsonFormatter';
import MarkdownPreviewer from './components/tools/MarkdownPreviewer';
import DiffChecker from './components/tools/DiffChecker';
import PasswordGenerator from './components/tools/PasswordGenerator';
import Base64Tool from './components/tools/Base64Tool';
import CsvToJson from './components/tools/CsvToJson';
import ExcelToCsv from './components/tools/ExcelToCsv';
import QrGenerator from './components/tools/QrGenerator';
import BarcodeGenerator from './components/tools/BarcodeGenerator';
import FileSizeConverter from './components/tools/FileSizeConverter';
import ColorPickerTool from './components/tools/ColorPicker';
import TimestampConverter from './components/tools/TimestampConverter';

const TOOL_COMPONENTS = {
  'pdf-unlocker': PdfUnlocker,
  'pdf-converter': PdfConverter,
  'image-compressor': ImageCompressor,
  'image-converter': ImageConverter,
  'image-resizer': ImageResizer,
  'bg-remover': BackgroundRemover,
  'json-formatter': JsonFormatter,
  'markdown': MarkdownPreviewer,
  'diff-checker': DiffChecker,
  'password-gen': PasswordGenerator,
  'base64': Base64Tool,
  'csv-to-json': CsvToJson,
  'excel-to-csv': ExcelToCsv,
  'qr-generator': QrGenerator,
  'barcode-generator': BarcodeGenerator,
  'file-size': FileSizeConverter,
  'color-picker': ColorPickerTool,
  'timestamp': TimestampConverter,
};

export default function App() {
  const { theme, setTheme } = useTheme();
  const [activeTool, setActiveTool] = useState('pdf-unlocker');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ outputDir: null, theme: 'system' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!window.pdfUnlocker) return;
    window.pdfUnlocker.getSettings().then(setSettings).catch(() => {});
  }, []);

  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  const handleToolSelect = useCallback((toolId) => {
    setActiveTool(toolId);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117]">
      <header className="h-11 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {activeTool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-icon p-1.5" title="Toggle theme">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {theme === 'dark'
                ? <><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></>
                : <><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></>}
            </svg>
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-icon p-1.5" title="Settings">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0d1117]">
          {ActiveComponent ? <ActiveComponent /> : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a tool from the sidebar
            </div>
          )}
        </main>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={async (newSettings) => {
            if (window.pdfUnlocker) {
              await window.pdfUnlocker.setSettings(newSettings);
            }
            setSettings(newSettings);
            if (newSettings.theme) setTheme(newSettings.theme);
            setShowSettings(false);
          }}
          onSelectOutputDir={() => window.pdfUnlocker?.saveOutputDir()}
        />
      )}
    </div>
  );
}
