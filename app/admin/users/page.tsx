'use client';

/**
 * /admin/users/page.tsx
 *
 * Lists all registered users.
 * Each row has a "Manage Access" button that opens a side panel showing
 * every book in the catalog, with the user's current access status
 * and the ability to grant or revoke access instantly.
 *
 * Access is controlled via UserProgress.isPurchased — the exact same
 * field the mobile app reads. No secondary permission system.
 */

import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Users, Search, BookOpen, ShieldCheck, ShieldOff,
  X, Loader2, CheckCircle2, AlertCircle, Lock, Unlock,
  ChevronRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

type BookAccess = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  category: string | null;
  isFree: boolean;
  isPurchased: boolean;
  isManualGrant: boolean;
  isAccessible: boolean;
};

type Toast = { type: 'success' | 'error'; message: string };

// ─── Toast ─────────────────────────────────────────────────────────────────────

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isOk = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12,
      background: isOk ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${isOk ? '#10b98155' : '#ef444455'}`,
      color: isOk ? '#10b981' : '#ef4444',
      fontSize: 13, fontWeight: 600,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'fadeUp 0.2s ease',
    }}>
      {isOk ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.message}
    </div>
  );
}

// ─── Access Panel ───────────────────────────────────────────────────────────────

function AccessPanel({
  user,
  adminKey,
  onClose,
  onToast,
}: {
  user: User;
  adminKey: string;
  onClose: () => void;
  onToast: (t: Toast) => void;
}) {
  const [books, setBooks] = useState<BookAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookSearch, setBookSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/access`, {
        headers: { 'x-admin-api-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setBooks(data.books ?? []);
    } catch (err: unknown) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load books' });
    } finally {
      setLoading(false);
    }
  }, [user.id, adminKey, onToast]);

  useEffect(() => { fetchAccess(); }, [fetchAccess]);

  const toggle = async (book: BookAccess, grant: boolean) => {
    setToggling(book.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-api-key': adminKey },
        body: JSON.stringify({ productId: book.id, grant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onToast({
        type: 'success',
        message: grant
          ? `✅ "${book.title}" — дастрасӣ дода шуд`
          : `🔒 "${book.title}" — дастрасӣ бекор шуд`,
      });
      // Optimistic update
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, isPurchased: grant, isManualGrant: grant, isAccessible: book.isFree || grant } : b
        )
      );
    } catch (err: unknown) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
    } finally {
      setToggling(null);
    }
  };

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      (b.author ?? '').toLowerCase().includes(bookSearch.toLowerCase())
  );

  const granted  = filtered.filter((b) => b.isPurchased);
  const locked   = filtered.filter((b) => !b.isPurchased && !b.isFree);
  const freeList = filtered.filter((b) => b.isFree);

  const BookRow = ({ book }: { book: BookAccess }) => {
    const isGranted = book.isPurchased;
    const isManual = book.isManualGrant;
    const isFree = book.isFree;
    const busy = toggling === book.id;

    let statusColor = '#6b7280';
    let statusLabel = 'Locked';
    let StatusIcon = Lock;

    if (isFree) { statusColor = '#818cf8'; statusLabel = 'Free'; StatusIcon = Unlock; }
    else if (isGranted && isManual) { statusColor = '#a855f7'; statusLabel = 'Manually Granted'; StatusIcon = ShieldCheck; }
    else if (isGranted && !isManual) { statusColor = '#10b981'; statusLabel = 'Purchased'; StatusIcon = ShieldCheck; }

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 10,
        background: isGranted ? 'rgba(16,185,129,0.06)' : 'var(--bg-elevated)',
        border: `1px solid ${isGranted ? 'rgba(16,185,129,0.2)' : 'var(--bg-border)'}`,
        marginBottom: 8, transition: 'all 0.15s ease',
      }}>
        {/* Cover */}
        <div style={{
          width: 36, height: 44, borderRadius: 6, flexShrink: 0, overflow: 'hidden',
          background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {book.coverUrl
            ? <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            : <BookOpen size={14} color="var(--text-muted)" />}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author}</p>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33`,
          flexShrink: 0,
        }}>
          <StatusIcon size={10} />
          {statusLabel}
        </span>

        {/* Action button (not for free books) */}
        {!isFree && (
          <button
            onClick={() => toggle(book, !isGranted)}
            disabled={busy}
            title={isGranted ? 'Revoke access' : 'Grant access'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: busy ? 'wait' : 'pointer',
              background: isGranted ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              color: isGranted ? '#ef4444' : '#10b981',
              transition: 'all 0.15s ease', flexShrink: 0,
              opacity: busy ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!busy) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            {busy
              ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
              : isGranted ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
          </button>
        )}
      </div>
    );
  };

  const Section = ({ title, items, count }: { title: string; items: BookAccess[]; count: number }) =>
    items.length === 0 ? null : (
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          {title} ({count})
        </p>
        {items.map((b) => <BookRow key={b.id} book={b} />)}
      </div>
    );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div style={{
        width: 480, maxWidth: '100vw', height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--bg-border)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 8, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Book search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bg-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input-field"
              placeholder="Китобро ҷустуҷӯ кунед…"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)' }}>
              <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 14 }}>Китобҳо бор мешаванд…</p>
            </div>
          ) : books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={36} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>Китобе ёфт нашуд</p>
            </div>
          ) : (
            <>
              <Section title="Дастрасӣ дода шудааст" items={granted} count={granted.length} />
              <Section title="Қулфшуда" items={locked} count={locked.length} />
              <Section title="Ройгон (ҳамешагӣ кушода)" items={freeList} count={freeList.length} />
            </>
          )}
        </div>

        {/* Footer summary */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{books.filter((b) => b.isPurchased).length} китоб кушода шудааст</span>
          <span>{books.length} китоби умумӣ</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [, startTransition] = useTransition();

  // Admin key — stored in localStorage so we don't re-enter it each time
  const [adminKey, setAdminKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyLocked, setKeyLocked] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ramz-admin-key') ?? '';
    if (stored) { setAdminKey(stored); setKeyLocked(false); }
  }, []);

  const saveKey = () => {
    localStorage.setItem('ramz-admin-key', keyInput.trim());
    setAdminKey(keyInput.trim());
    setKeyLocked(false);
  };

  // Fetch users list
  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Key setup screen ─────────────────────────────────────────────────────────
  if (keyLocked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <ShieldCheck size={36} color="var(--accent-from)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Admin API Key</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Барои идораи дастрасии корбарон, ключи ADMIN_API_KEY-ро ворид кунед.
          </p>
          <input
            type="password"
            className="input-field"
            placeholder="Ключи Adminро ворид кунед…"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && keyInput.trim() && saveKey()}
            style={{ marginBottom: 12 }}
          />
          <button
            onClick={saveKey}
            disabled={!keyInput.trim()}
            className="gradient-btn"
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: keyInput.trim() ? 'pointer' : 'not-allowed', opacity: keyInput.trim() ? 1 : 0.5 }}
          >
            Тасдиқ кардан
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
            Ключ дар localStorage нигоҳ дошта мешавад
          </p>
        </div>
      </div>
    );
  }

  // ── Main users table ─────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px)} to { opacity:1; transform:translateY(0)} }
      `}</style>

      {/* Page header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Users</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {loading ? 'Бор мешавад…' : `${users.length} корбари бақайдгирифташуда`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="input-field"
            placeholder="Ном ё почтаро ҷустуҷӯ кунед…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, height: 40, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card fade-up delay-1" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--text-muted)', gap: 12 }}>
            <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
            <span>Корбарон бор мешаванд…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {search ? 'Корбар ёфт нашуд' : 'Корбаре вуҷуд надорад'}
            </p>
            {!search && <p style={{ fontSize: 13, marginTop: 8 }}>Корбарон пас аз бақайдгирӣ дар замима намоён мешаванд.</p>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  {['Корбар', 'Почтаи электронӣ', 'ID', 'Вазъ', 'Санаи бақайд', ''].map((h) => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--bg-border)' : 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Avatar + Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>

                      {/* ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <code style={{ fontSize: 11, background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-muted)' }}>
                          {user.id.slice(0, 12)}…
                        </code>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: user.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: user.isActive ? '#10b981' : '#ef4444', border: `1px solid ${user.isActive ? '#10b98144' : '#ef444444'}` }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: user.isActive ? '#10b981' : '#ef4444' }} />
                          {user.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(user.createdAt).toLocaleDateString('tg-TJ', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Manage Access button */}
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => startTransition(() => setSelectedUser(user))}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                            color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; }}
                        >
                          <ShieldCheck size={13} />
                          Дастрасӣ
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} корбар</p>
              <button
                onClick={() => { localStorage.removeItem('ramz-admin-key'); setKeyLocked(true); setAdminKey(''); setKeyInput(''); }}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Ключро тоза кардан
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Access side panel */}
      {selectedUser && (
        <AccessPanel
          user={selectedUser}
          adminKey={adminKey}
          onClose={() => setSelectedUser(null)}
          onToast={setToast}
        />
      )}

      {/* Toast */}
      {toast && <ToastBanner toast={toast} onDismiss={dismissToast} />}
    </div>
  );
}
