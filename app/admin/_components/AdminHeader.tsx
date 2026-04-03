'use client';

import ThemeToggle from './ThemeToggle';
import { Bell, Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[--bg-border] bg-[--bg-surface] px-4 sm:px-7 transition-colors duration-300 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[--bg-border] bg-[--bg-elevated] text-[--text-secondary] hover:bg-[--bg-border] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle />

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <Bell size={16} strokeWidth={2} />
          </div>
          <div style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, background: 'var(--accent-from)',
            borderRadius: '50%', border: '2px solid var(--bg-surface)',
          }} />
        </div>

        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '14px', color: '#fff', cursor: 'pointer',
          boxShadow: '0 2px 10px var(--accent-glow)',
        }}>
          A
        </div>
      </div>
    </header>
  );
}
