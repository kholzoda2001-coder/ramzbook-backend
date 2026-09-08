'use client';

import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Page titles keyed by route PREFIX (longest match wins).
 *
 * The previous map was keyed by exact paths that mostly no longer exist
 * (`/admin/subs`, `/admin/categories`, `/admin/products`, `/admin/otp-settings`,
 * `/admin/login-settings`), so every page except the Dashboard fell through to
 * the "📊 Dashboard" default — the header lied about where you were.
 */
const PAGE_NAMES: Array<[string, string]> = [
  ['/admin/analytics', '📈 Аналитика'],
  ['/admin/users', '👥 Корбарон'],
  ['/admin/subscriptions', '👑 Обунаҳо'],
  ['/admin/languages', '🌍 Забонҳои модарӣ'],
  ['/admin/courses', '🏗️ Забонҳои омӯзишӣ'],
  ['/admin/modules', '📦 Модулҳо'],
  ['/admin/lessons', '📚 Дарсҳо'],
  ['/admin/words', '💬 Калимаҳо'],
  ['/admin/grammar', '🔤 Грамматика'],
  ['/admin/phrases', '🗣️ Ибораҳо'],
  ['/admin/dialogues', '🎙️ Муколамаҳо'],
  ['/admin/comprehensions', '📖 Дарки матн'],
  ['/admin/placement', '🎯 Санҷиши сатҳ'],
  ['/admin/speaking', '🎙️ Спикинг'],
  ['/admin/library', '📚 Китобхона'],
  ['/admin/ui-translations', '🌐 Тарҷумаҳои UI'],
  ['/admin/import', '📥 Воридоти оммавӣ'],
  ['/admin/revenue', '💰 Даромад'],
  ['/admin/feedback', '💌 Фикри хонандагон'],
  ['/admin/push', '🔔 Огоҳиномаҳо'],
  ['/admin/launch', '🚀 Омодагӣ ба нашр'],
  ['/admin/settings', '⚙️ Танзимот'],
  ['/admin', '📊 Dashboard'],
];

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageName = PAGE_NAMES.find(([p]) => pathname === p || pathname.startsWith(p + '/'))?.[1] ?? '📊 Dashboard';

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // Real "work left" badge on the bell: unread feedback + open content/user
  // reports. Previously the bell was a decorative emoji that did nothing.
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/inbox?take=1')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const n =
          (d?.unreadFeedback ?? 0) + (d?.openReports ?? 0) + (d?.openUserReports ?? 0);
        if (Number.isFinite(n)) setPending(n);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/admin/users?q=${encodeURIComponent(q)}`);
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }

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
      <form className="sb hidden sm:flex" onSubmit={submitSearch}>
        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>🔍</span>
        <input
          placeholder="Ҷустуҷӯи корбар…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <button
        className="tbb"
        title="Фикри хонандагон"
        onClick={() => router.push('/admin/feedback')}
        style={{ position: 'relative', padding: 0 }}
      >
        🔔
        {pending !== null && pending > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
            padding: '0 4px', borderRadius: 99, background: 'var(--red, #ef4444)',
            color: '#fff', fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {pending > 99 ? '99+' : pending}
          </span>
        )}
      </button>
      <button
        className="tbb"
        title="Навсозӣ"
        onClick={refresh}
        style={{ padding: 0, opacity: refreshing ? 0.5 : 1 }}
      >
        🔄
      </button>
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div className="avi" style={{ background: 'var(--grad)', width: '28px', height: '28px' }}>А</div>
        <span className="hidden sm:inline" style={{ fontSize: '12px', fontWeight: 700 }}>Admin</span>
      </div>
    </header>
  );
}
