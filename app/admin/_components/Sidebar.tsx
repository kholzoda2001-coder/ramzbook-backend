'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar({ onClose, staticMode }: { onClose: () => void, staticMode?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } finally {
      router.push('/admin/login');
    }
  }

  const isActive = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

  return (
    <aside className="sidebar w-full h-full">
      <div className="logo-area">
        <div className="logo-mark">R</div>
        <div>
          <div className="logo-text">RAMZ</div>
          <div className="logo-sub">Admin Panel</div>
        </div>
      </div>
      
      <nav className="nav-wrap">
        <div className="nav-sec">Асосӣ</div>
        <Link href="/admin" className={`ni ${isActive('/admin') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">📊</span>Dashboard<span className="live"></span>
        </Link>
        <Link href="/admin/analytics" className={`ni ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">📈</span>Аналитика
        </Link>
        <Link href="/admin/users" className={`ni ${isActive('/admin/users') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">👥</span>Корбарон<span className="nb nb-r">12K</span>
        </Link>
        <Link href="/admin/subscriptions" className={`ni ${isActive('/admin/subscriptions') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">👑</span>Обунаҳо<span className="nb nb-y">2.4K</span>
        </Link>
        
        <div className="sh">МУНДАРИҶА</div>
        <Link href="/admin/languages" className={`ni ${isActive('/admin/languages') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🌍</span>Забонҳои Модарӣ
        </Link>
        <Link href="/admin/courses" className={`ni ${isActive('/admin/courses') || isActive('/admin/modules') || isActive('/admin/lessons') || isActive('/admin/words') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🏗️</span>Забонҳои Омӯзишӣ
        </Link>
        <Link href="/admin/grammar" className={`ni ${isActive('/admin/grammar') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🔤</span>Грамматика
        </Link>
        <Link href="/admin/phrases" className={`ni ${isActive('/admin/phrases') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">💬</span>Ибораҳо
        </Link>
        <Link href="/admin/dialogues" className={`ni ${isActive('/admin/dialogues') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🎙️</span>Муколамаҳо
        </Link>
        <Link href="/admin/comprehensions" className={`ni ${isActive('/admin/comprehensions') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">📖</span>Дарк (Хониш/Шунавоӣ)
        </Link>
        <Link href="/admin/placement" className={`ni ${isActive('/admin/placement') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🎯</span>Санҷиши сатҳбандӣ
        </Link>
        <Link href="/admin/ui-translations" className={`ni ${isActive('/admin/ui-translations') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🌐</span>Тарҷумаҳои UI
        </Link>
        <Link href="/admin/import" className={`ni ${isActive('/admin/import') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">📥</span>Воридоти оммавӣ
        </Link>

        <div className="sh">МОЛИЯ</div>
        <Link href="/admin/revenue" className={`ni ${isActive('/admin/revenue') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">💰</span>Даромад
        </Link>
        
        <div className="sh">СИСТЕМА</div>
        <Link href="/admin/launch" className={`ni ${isActive('/admin/launch') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🚀</span>Омодагӣ ба нашр
        </Link>
        <Link href="/admin/settings/otp" className={`ni ${isActive('/admin/settings/otp') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">⚙️</span>OTP Settings
        </Link>
        <Link href="/admin/settings/login" className={`ni ${isActive('/admin/settings/login') ? 'active' : ''}`} onClick={staticMode ? undefined : onClose}>
          <span className="ni-icon">🔑</span>Login Settings
        </Link>
        <button onClick={handleLogout} className="ni w-full text-left bg-transparent border-none">
          <span className="ni-icon">🚪</span>Баромад
        </button>
      </nav>
      
      <div className="sf">
        <div className="ac">
          <div className="avi" style={{ background: 'var(--grad)' }}>А</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>Admin RAMZ</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Super Admin</div>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text3)', cursor: 'pointer' }}>⚙️</span>
        </div>
      </div>
    </aside>
  );
}
