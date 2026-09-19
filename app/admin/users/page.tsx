'use client';

/**
 * /admin/users/page.tsx
 *
 * Lists all registered users.
 * Each row has a "Дастрасӣ" button that opens a side panel for manually
 * granting/revoking Premium — the same four plans the app actually sells
 * (monthly / sixmonths / yearly / lifetime, see PlanIds in
 * frontend/lib/services/billing_service.dart) — for support/promo/trial
 * cases, per Google Play policy.
 *
 * Protected by the admin session (cookie-based) — no API key required.
 */

import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Users, Search, ShieldCheck,
  X, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, Filter, ChevronDown,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  isPremium: boolean;
  premiumPlan: string | null;
  totalXp: number;
  streak: number;
  createdAt: string;
  lastActiveAt: string | null;
  interfaceLang: string;
  targetLang: string | null;
  level: string;
  country: string | null;
  /** Seed/robo account — see lib/admin/realUser.ts (computed by the API). */
  isTest?: boolean;
};

/** Returns the display contact: phone number if it's a phone-registered user, else email */
function displayContact(user: User): string {
  if (user.phone) return user.phone;
  // Hide shadow emails (e.g. 992xxx@ramzbook.tj) — show cleaned phone instead
  if (user.email && user.email.endsWith('@ramzbook.tj')) {
    return '+' + user.email.replace('@ramzbook.tj', '');
  }
  return user.email || 'Номаълум';
}

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

// ─── User Profile Panel ──────────────────────────────────────────────────────────

function UserProfilePanel({
  user,
  onClose,
  onToast,
}: {
  user: User;
  onClose: () => void;
  onToast: (t: Toast) => void;
}) {
  const [activeTab, setActiveTab] = useState<'stats' | 'access'>('stats');
  
  // Access State
  const [vipExpiresAt, setVipExpiresAt] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  
  // Stats State
  const [stats, setStats] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accessRes, statsRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}/access`),
        fetch(`/api/admin/users/${user.id}/stats`)
      ]);
      
      const accessData = await accessRes.json();
      const statsData = await statsRes.json();
      
      if (!accessRes.ok) throw new Error(accessData.error ?? 'Failed to load access');
      if (!statsRes.ok) throw new Error(statsData.error ?? 'Failed to load stats');
      
      setVipExpiresAt(accessData.user?.vipExpiresAt ?? null);
      setSubscriptionPlan(accessData.user?.subscriptionPlan ?? null);
      setStats(statsData);
      
    } catch (err: unknown) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load' });
    } finally {
      setLoading(false);
    }
  }, [user.id, onToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const executeAction = async (action: string) => {
    if (action === 'revoke' && !window.confirm(`Premium-и ${user.name}-ро пурра бекор кунем?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onToast({ type: 'success', message: data.message ?? 'Success' });
      await fetchData();
    } catch (err: unknown) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  };

  const PLANS = [
    { key: 'monthly',   action: 'grant_monthly',   label: 'Моҳона',  sub: '1 моҳ',  color: '#10b981' },
    { key: 'sixmonths', action: 'grant_sixmonths', label: 'Шашмоҳа', sub: '6 моҳ',  color: '#06b6d4' },
    { key: 'yearly',    action: 'grant_yearly',    label: 'Солона',  sub: 'Беҳтарин интихоб', color: '#3b82f6' },
    { key: 'lifetime',  action: 'grant_lifetime',  label: 'Якумра',  sub: 'Доимӣ — як бор', color: '#a855f7' },
  ] as const;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex',
    }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      <div style={{
        width: 540, maxWidth: '100vw', height: '100%',
        background: 'var(--card)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {(user.name ?? '?').split(' ').map((n) => n[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{displayContact(user)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', borderRadius: 8, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px', gap: 24 }}>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: activeTab === 'stats' ? 'var(--text)' : 'var(--text2)',
              borderBottom: activeTab === 'stats' ? '2px solid #14B8A6' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Омор ва Муваффақият
          </button>
          <button
            onClick={() => setActiveTab('access')}
            style={{
              padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: activeTab === 'access' ? 'var(--text)' : 'var(--text2)',
              borderBottom: activeTab === 'access' ? '2px solid #14B8A6' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Дастрасӣ ва Обуна
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: 'var(--text2)' }}>
              <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 14 }}>Бор мешавад…</p>
            </div>
          ) : activeTab === 'stats' && stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: 'var(--card2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Забони модарӣ</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{(stats.user.interfaceLang ?? '—').toUpperCase()}</p>
                </div>
                <div style={{ background: 'var(--card2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Стрик (Рӯз)</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>🔥 {stats.user.streak}</p>
                </div>
                <div style={{ background: 'var(--card2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Ҳамаи XP</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>⚡ {stats.user.totalXp.toLocaleString()}</p>
                </div>
              </div>

              {/* Languages Learned */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 12 }}>Забонҳои омӯхташаванда</p>
                {stats.languagesLearned.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>Ҳеҷ забоне оғоз накардааст.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stats.languagesLearned.map((ul: any) => (
                      <div key={ul.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{ul.language.emoji || '🌐'}</span>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ul.language.nativeName}</p>
                            <p style={{ fontSize: 12, color: 'var(--text2)' }}>Сатҳ: {ul.currentLevel}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#14B8A6' }}>{ul.xp} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ background: 'var(--card2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Спикинг (Speaking)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Дарсҳо: {stats.speakingStats.lessonsCompleted}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Вақт: {Math.round(stats.speakingStats.timeSpent / 60)} дақиқа</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Холи спикинг: {stats.speakingStats.totalXp} XP</p>
                  </div>
                </div>
                <div style={{ background: 'var(--card2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Калимаҳо (Луғат)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Дарсҳои хатмшуда: {stats.progress.lessonsCompleted}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Ёдгирии калимаҳо: ~{stats.wordsLearned}</p>
                  </div>
                </div>
              </div>

              {/* Library Books */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 12 }}>Китобхона (Library)</p>
                {stats.libraryProgress.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>Дар китобхона чизе нахондааст.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stats.libraryProgress.map((lp: any, i: number) => (
                      <div key={i} style={{ background: 'var(--card2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{lp.title}</p>
                            <p style={{ fontSize: 12, color: 'var(--text2)' }}>{lp.format === 'book' ? 'Китоб' : 'Мақола'} • Сатҳи {lp.difficulty}</p>
                          </div>
                          <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {lp.position} / {lp.total} саҳифа
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registration & Activity */}
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700 }}>Санаи бақайдгирӣ</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 4 }}>{new Date(stats.user.createdAt).toLocaleDateString('tj-TJ', { dateStyle: 'long' })}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700 }}>Охирин бор фаъол</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 4 }}>{stats.user.lastActiveAt ? new Date(stats.user.lastActiveAt).toLocaleString('tj-TJ', { dateStyle: 'long', timeStyle: 'short' }) : 'Номаълум'}</p>
                </div>
              </div>

            </div>
          ) : activeTab === 'access' && (
            <div>
              <div style={{ padding: '10px 16px', background: 'rgba(234, 179, 8, 0.15)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', color: '#ca8a04', fontSize: 12, fontWeight: 500, borderRadius: 8, marginBottom: 20 }}>
                ⚠️ <b>Огоҳӣ:</b> Ин ҷо танҳо барои дастгирии техникӣ ва давраҳои озмоишӣ мебошад. Барои фурӯши муқаррарӣ истифода набаред.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {PLANS.map((p) => {
                  const active = subscriptionPlan === p.key;
                  const otherActive = !!subscriptionPlan && !active;
                  return (
                    <div key={p.key} style={{
                      padding: '16px', borderRadius: 16,
                      background: active ? `${p.color}0d` : 'var(--card2)',
                      border: `1px solid ${active ? p.color : 'var(--border)'}`,
                      display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: active ? p.color : 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShieldCheck size={16} color={active ? p.color : 'var(--text2)'} /> {p.label}
                        </h4>
                        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                          {active && p.key === 'lifetime'
                            ? 'Фаъол — доимӣ'
                            : active && vipExpiresAt
                            ? `Фаъол то: ${new Date(vipExpiresAt).toLocaleDateString()}`
                            : p.sub}
                        </p>
                      </div>
                      {active ? (
                        <button
                          onClick={() => executeAction('revoke')}
                          disabled={busy}
                          style={{
                            padding: '8px 0', width: '100%', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', border: 'none',
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          }}
                        >
                          {busy ? <Loader2 size={14} className="spin" /> : 'Қатъ кардан'}
                        </button>
                      ) : otherActive ? (
                        <div style={{ fontSize: 11, color: 'var(--text2)', padding: '8px 0', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>Дигар обуна фаъол аст</div>
                      ) : (
                        <button
                          onClick={() => executeAction(p.action)}
                          disabled={busy}
                          style={{
                            padding: '8px 0', width: '100%', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', border: 'none',
                            background: `${p.color}1a`, color: p.color,
                          }}
                        >
                          {busy ? <Loader2 size={14} className="spin" /> : 'Иҷозат додан'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterNativeLang, setFilterNativeLang] = useState('');
  const [filterTargetLang, setFilterTargetLang] = useState('');
  const [filterMinXp, setFilterMinXp] = useState('');
  const [filterMaxXp, setFilterMaxXp] = useState('');
  const [filterMinStreak, setFilterMinStreak] = useState('');
  const [filterMaxStreak, setFilterMaxStreak] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterPremium, setFilterPremium] = useState('all');
  const [filterIsTest, setFilterIsTest] = useState('real'); // default to showing only real users
  const [filterLastActive, setFilterLastActive] = useState('all'); // all, today, 3days, 7days, 30days, inactive
  const [sortConfig, setSortConfig] = useState('createdAt-desc'); // format: field-order
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [, startTransition] = useTransition();

  // Seed the filter from `?q=` so the header's search box actually lands
  // somewhere (it used to be a decorative input that did nothing).
  // Read from `window.location` rather than `useSearchParams` to avoid
  // needing a Suspense boundary around this page.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearch(q);
  }, []);

  // Fetch users list on mount
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      displayContact(u).toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterNativeLang && u.interfaceLang !== filterNativeLang) return false;
    if (filterTargetLang && u.targetLang !== filterTargetLang) return false;
    
    if (filterMinXp && u.totalXp < parseInt(filterMinXp, 10)) return false;
    if (filterMaxXp && u.totalXp > parseInt(filterMaxXp, 10)) return false;
    
    if (filterMinStreak && u.streak < parseInt(filterMinStreak, 10)) return false;
    if (filterMaxStreak && u.streak > parseInt(filterMaxStreak, 10)) return false;
    
    if (filterLevel && u.level !== filterLevel) return false;
    
    if (filterPremium === 'premium' && !u.isPremium) return false;
    if (filterPremium === 'free' && u.isPremium) return false;
    
    if (filterIsTest === 'real' && u.isTest) return false;
    if (filterIsTest === 'test' && !u.isTest) return false;

    if (filterLastActive !== 'all') {
      if (!u.lastActiveAt) return false;
      const lastActive = new Date(u.lastActiveAt);
      const now = new Date();
      const diffDays = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
      
      if (filterLastActive === 'today' && diffDays > 1) return false;
      if (filterLastActive === '3days' && diffDays > 3) return false;
      if (filterLastActive === '7days' && diffDays > 7) return false;
      if (filterLastActive === '30days' && diffDays > 30) return false;
      if (filterLastActive === 'inactive' && diffDays <= 30) return false;
    }

    return true;
  });

  const uniqueNativeLangs = Array.from(new Set(users.map(u => u.interfaceLang).filter(Boolean)));
  const uniqueTargetLangs = Array.from(new Set(users.map(u => u.targetLang).filter(Boolean)));
  const uniqueLevels = Array.from(new Set(users.map(u => u.level).filter(Boolean)));

  const sorted = [...filtered].sort((a, b) => {
    const [field, order] = sortConfig.split('-');
    const multiplier = order === 'desc' ? -1 : 1;
    
    if (field === 'totalXp') return (a.totalXp - b.totalXp) * multiplier;
    if (field === 'streak') return (a.streak - b.streak) * multiplier;
    if (field === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
    
    return 0;
  });

  // The Dashboard/sidebar counters exclude test/robo accounts, so a bare
  // total here contradicted the number shown everywhere else. `isTest` is
  // computed server-side from the single definition in
  // lib/admin/realUser.ts. Rows are never hidden — only counted separately.
  const testCount = users.filter((u) => u.isTest).length;
  const realCount = users.length - testCount;

  const dismissToast = useCallback(() => setToast(null), []);

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
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>Users</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {loading
                ? 'Бор мешавад…'
                : `${realCount} корбари воқеӣ${testCount ? ` · ${testCount} ҳисоби тестӣ` : ''}`}
            </p>
          </div>
        </div>

        {/* Search and Filters Toggle */}
        <div style={{ display: 'flex', gap: 12, flex: '1 1 240px', maxWidth: 440, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="var(--text2)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input-field"
              placeholder="Ном ё почтаро ҷустуҷӯ кунед…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 40, fontSize: 13, width: '100%' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 40, padding: '0 16px', borderRadius: 10,
              background: showFilters ? 'rgba(99,102,241,0.15)' : 'var(--card2)',
              border: `1px solid ${showFilters ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              color: showFilters ? '#818cf8' : 'var(--text)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={14} /> Филтрҳо
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-card fade-up" style={{ padding: '20px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          
          {/* Native Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Забони модарӣ</label>
            <select className="input-field" value={filterNativeLang} onChange={e => setFilterNativeLang(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="">Ҳама</option>
              {uniqueNativeLangs.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Target Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Забони омӯзишӣ</label>
            <select className="input-field" value={filterTargetLang} onChange={e => setFilterTargetLang(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="">Ҳама</option>
              {uniqueTargetLangs.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Сатҳ</label>
            <select className="input-field" value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="">Ҳама</option>
              {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Premium Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Обуна</label>
            <select className="input-field" value={filterPremium} onChange={e => setFilterPremium(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="all">Ҳама</option>
              <option value="premium">Premium</option>
              <option value="free">Ройгон</option>
            </select>
          </div>

          {/* User Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Намуди ҳисоб</label>
            <select className="input-field" value={filterIsTest} onChange={e => setFilterIsTest(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="all">Ҳама (Воқеӣ + Тестӣ)</option>
              <option value="real">Фақат воқеӣ</option>
              <option value="test">Фақат тестӣ</option>
            </select>
          </div>

          {/* XP Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Холҳо (XP)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" className="input-field" placeholder="Аз" value={filterMinXp} onChange={e => setFilterMinXp(e.target.value)} style={{ fontSize: 13, height: 36, width: '100%' }} />
              <input type="number" className="input-field" placeholder="То" value={filterMaxXp} onChange={e => setFilterMaxXp(e.target.value)} style={{ fontSize: 13, height: 36, width: '100%' }} />
            </div>
          </div>

          {/* Streak Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Стрик (Аловакҳо)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" className="input-field" placeholder="Аз" value={filterMinStreak} onChange={e => setFilterMinStreak(e.target.value)} style={{ fontSize: 13, height: 36, width: '100%' }} />
              <input type="number" className="input-field" placeholder="То" value={filterMaxStreak} onChange={e => setFilterMaxStreak(e.target.value)} style={{ fontSize: 13, height: 36, width: '100%' }} />
            </div>
          </div>

          {/* Last Active */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Вақти фаъолият</label>
            <select className="input-field" value={filterLastActive} onChange={e => setFilterLastActive(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="all">Ҳама вақт</option>
              <option value="today">Имрӯз</option>
              <option value="3days">3 рӯзи охир</option>
              <option value="7days">7 рӯзи охир</option>
              <option value="30days">30 рӯзи охир</option>
              <option value="inactive">Ғайрифаъол (&gt;30 рӯз)</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Мураттабсозӣ</label>
            <select className="input-field" value={sortConfig} onChange={e => setSortConfig(e.target.value)} style={{ fontSize: 13, height: 36 }}>
              <option value="createdAt-desc">Санаи бақайдгирӣ (Навтарин)</option>
              <option value="createdAt-asc">Санаи бақайдгирӣ (Кӯҳнатарин)</option>
              <option value="totalXp-desc">Холҳо (Зиёд ба кам)</option>
              <option value="totalXp-asc">Холҳо (Кам ба зиёд)</option>
              <option value="streak-desc">Стрик (Зиёд ба кам)</option>
              <option value="streak-asc">Стрик (Кам ба зиёд)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <button
              onClick={() => {
                setFilterNativeLang(''); setFilterTargetLang('');
                setFilterMinXp(''); setFilterMaxXp('');
                setFilterMinStreak(''); setFilterMaxStreak('');
                setFilterLevel(''); setFilterPremium('all'); setFilterIsTest('real');
                setFilterLastActive('all');
                setSortConfig('createdAt-desc');
              }}
              style={{
                height: 36, padding: '0 16px', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%'
              }}
            >
              Тоза кардан
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card fade-up delay-1" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--text2)', gap: 12 }}>
            <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
            <span>Корбарон бор мешаванд…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text2)' }}>
            <Users size={40} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)' }}>
              {search ? 'Корбар ёфт нашуд' : 'Корбаре вуҷуд надорад'}
            </p>
            {!search && <p style={{ fontSize: 13, marginTop: 8 }}>Корбарон пас аз бақайдгирӣ дар замима намоён мешаванд.</p>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Корбар', 'Почта/Телефон', 'Курс/Сатҳ', 'XP', 'Тариф', 'ID', 'Вазъ', 'Санаи бақайд', ''].map((h) => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((user, idx) => {
                  const initials = (user.name ?? '?').split(' ').map((n) => n[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Avatar + Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #14B8A6, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
                        </div>
                      </td>

                      {/* Email / Phone */}
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {user.phone || user.email?.endsWith('@ramzbook.tj') ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', flexShrink: 0 }}>📱</span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', flexShrink: 0 }}>✉️</span>
                          )}
                          {displayContact(user)}
                        </div>
                      </td>

                      {/* Course / Level */}
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                           {(user.targetLang ?? '—').toUpperCase()}
                        </span>
                        <span style={{ margin: '0 4px', opacity: 0.5 }}>/</span>
                        {(user.interfaceLang ?? '—').toUpperCase()}
                        <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--card2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 6, color: 'var(--text)' }}>
                          {user.level}
                        </span>
                      </td>

                      {/* XP + streak */}
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {user.totalXp.toLocaleString()} XP
                        {user.streak > 0 && <span style={{ color: 'var(--text2)', fontSize: 12 }}> · 🔥{user.streak}</span>}
                      </td>

                      {/* Premium / Free */}
                      <td style={{ padding: '16px 20px' }}>
                        {user.isPremium ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(234,179,8,0.12)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
                            👑 {user.premiumPlan === 'promo' ? 'Промо' : 'Premium'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Ройгон</span>
                        )}
                      </td>

                      {/* ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <code style={{ fontSize: 11, background: 'var(--card2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 6, color: 'var(--text2)' }}>
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
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
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

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{filtered.length} корбар</p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Panel */}
      {selectedUser && (
        <UserProfilePanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToast={setToast}
        />
      )}

      {/* Toast */}
      {toast && <ToastBanner toast={toast} onDismiss={dismissToast} />}
    </div>
  );
}
