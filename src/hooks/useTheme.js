import { useState, useEffect, useCallback } from 'react';

export default function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('pdf-unlocker-theme') || 'system';
  });

  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('pdf-unlocker-theme', theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, applyTheme]);

  const setTheme = (t) => setThemeState(t);

  return { theme, setTheme };
}
