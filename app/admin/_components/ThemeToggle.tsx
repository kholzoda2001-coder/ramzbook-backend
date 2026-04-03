'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      style={{
        width: 36, height: 36, borderRadius: '10px',
        background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isDark ? '#f59e0b' : '#6366f1', cursor: 'pointer',
        transition: 'background 0.2s ease, color 0.2s ease, transform 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
    </button>
  );
}
