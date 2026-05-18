'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageNames: Record<string, string> = {
  '/admin': '📊 Dashboard',
  '/admin/users': '👥 Корбарон',
  '/admin/subs': '👑 Обунаҳо',
  '/admin/languages': '🌍 Забонҳо',
  '/admin/categories': '🗺️ Курс / Модулҳо',
  '/admin/products': '📚 Дарсҳо',
  '/admin/words': '💬 Калимаҳо',
  '/admin/otp-settings': '⚙️ OTP Settings',
  '/admin/login-settings': '🔑 Login Settings',
};

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || '📊 Dashboard';

  return (
    <header className="topbar">
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-[--border] bg-[--card] text-[--text2] mr-2"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>
      <div className="pt">{pageName}</div>
      <div className="sb hidden sm:flex">
        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>🔍</span>
        <input placeholder="Ҷустуҷӯ..." />
      </div>
      <div className="tbb" title="Огоҳномаҳо">🔔</div>
      <div className="tbb" title="Навсозӣ">🔄</div>
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
        <div className="avi" style={{ background: 'var(--grad)', width: '28px', height: '28px' }}>А</div>
        <span className="hidden sm:inline" style={{ fontSize: '12px', fontWeight: 700 }}>Admin</span>
      </div>
    </header>
  );
}
