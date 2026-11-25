import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('bodeko.theme') as Theme) ?? 'light'; } catch { return 'light'; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('bodeko.theme', theme); } catch { /* noop */ }
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) };
}
