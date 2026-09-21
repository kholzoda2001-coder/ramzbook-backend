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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  type AdminUserRow, type UserFilters,
  matchesFilters, sortUsers, allTargetLangs, allLevels,
  userLangs, userLevel, displayContact,
} from '@/lib/admin/userFilters';
import {
  Users, Search, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, Filter, ChevronDown, LayoutDashboard,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Сатри ҷадвал = ҳамон чизе, ки `/api/admin/users` мефиристад.
 *
 * Навъ ва тамоми мантиқи филтр дар `lib/admin/userFilters.ts` зиндагӣ
 * мекунанд — то онҳоро vitest санҷида тавонад. Пештар филтрҳо рост дар JSX
 * буданд ва ҳеҷ гоҳ санҷида намешуданд; маҳз он ҷо ду хатои ҷиддӣ пинҳон
 * монда буд (забони NULL ва сатҳи ҳамеша-A1).
 */
type User = AdminUserRow;

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
  
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

  // Пахши сатр → ДАШБОРДИ пурраи хонанда (`/admin/users/[id]`). Пештар ин ҷо
  // як панели паҳлӯӣ мекушод, ки забонҳоро аз ҷадвали МУРДАИ `UserLanguage`
  // мегирифт ва ҳамеша рӯйхати холӣ нишон медод.
  const open = useCallback((id: string) => router.push(`/admin/users/${id}`), [router]);

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

  const filters: UserFilters = useMemo(() => ({
    search,
    nativeLang: filterNativeLang,
    targetLang: filterTargetLang,
    minXp: filterMinXp,
    maxXp: filterMaxXp,
    minStreak: filterMinStreak,
    maxStreak: filterMaxStreak,
    level: filterLevel,
    premium: filterPremium,
    isTest: filterIsTest,
    lastActive: filterLastActive,
  }), [search, filterNativeLang, filterTargetLang, filterMinXp, filterMaxXp,
       filterMinStreak, filterMaxStreak, filterLevel, filterPremium,
       filterIsTest, filterLastActive]);

  // `now` ЯК БОР дар як рендер: агар ҳар сатр `new Date()`-и худро созад,
  // марзи «имрӯз» дар мобайни рӯйхат метавонад ҷаҳад.
  const sorted = useMemo(() => {
    const now = new Date();
    return sortUsers(users.filter((u) => matchesFilters(u, filters, now)), sortConfig);
  }, [users, filters, sortConfig]);
  const filtered = sorted;

  const uniqueNativeLangs = useMemo(
    () => Array.from(new Set(users.map((u) => u.interfaceLang).filter(Boolean))).sort(),
    [users]);
  const uniqueTargetLangs = useMemo(() => allTargetLangs(users), [users]);
  const uniqueLevels = useMemo(() => allLevels(users), [users]);

  // The Dashboard/sidebar counters exclude test/robo accounts, so a bare
  // total here contradicted the number shown everywhere else. `isTest` is
  // computed server-side from the single definition in
  // lib/admin/realUser.ts. Rows are never hidden — only counted separately.
  const testCount = sorted.filter((u) => u.isTest).length;
  const realCount = sorted.length - testCount;
  // Оё филтр умуман чизе бурида истодааст? Пештар сарлавҳа ҲАМЕША рақами
  // умумиро нишон медод — филтр «tr» мезадӣ, ҷадвал 2 сатр дошт, вале боло
  // ҳамон «228 корбари воқеӣ» меистод.
  const isFiltered = sorted.length !== users.length;

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
                : `${realCount} корбари воқеӣ${testCount ? ` · ${testCount} ҳисоби тестӣ` : ''}${isFiltered ? ` · аз ${users.length}` : ''}`}
            </p>
          </div>
        </div>

        {/* Search and Filters Toggle */}
        <div style={{ display: 'flex', gap: 12, flex: '1 1 240px', maxWidth: 440, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="var(--text2)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input-field"
              placeholder="Ном, почта, телефон ё ID…"
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
              <option value="premium">Premium (ҳама)</option>
              <option value="paid">Танҳо пулакӣ</option>
              <option value="promo">Танҳо промо</option>
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
              <option value="today">Имрӯз (рӯзи Душанбе)</option>
              <option value="3days">3 рӯзи охир</option>
              <option value="7days">7 рӯзи охир</option>
              <option value="30days">30 рӯзи охир</option>
              <option value="inactive">Ғайрифаъол (30+ рӯз)</option>
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
              <option value="lastActiveAt-desc">Фаъолияти охирин (Навтарин)</option>
              <option value="lastActiveAt-asc">Фаъолияти охирин (Кӯҳнатарин)</option>
              <option value="name-asc">Ном (А→Я)</option>
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
                      onClick={() => open(user.id)}
                      style={{ borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s ease', cursor: 'pointer' }}
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
                        {/* Забонҳои ВОҚЕИИ хондашуда — ҳамон чизе, ки филтр
                            меҷӯяд. Пештар ин ҷо `targetLang` буд ва барои 2/3
                            корбарон «—» менавишт, ҳол он ки онҳо садҳо дарс
                            хонда буданд. */}
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {userLangs(user).length
                            ? userLangs(user).map((l) => l.toUpperCase()).join(', ')
                            : '—'}
                        </span>
                        <span style={{ margin: '0 4px', opacity: 0.5 }}>/</span>
                        {(user.interfaceLang ?? '—').toUpperCase()}
                        <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--card2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 6, color: 'var(--text)' }}>
                          {userLevel(user)}
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
                          onClick={(e) => { e.stopPropagation(); open(user.id); }}
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
                          <LayoutDashboard size={13} />
                          Дашборд
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{filtered.length} корбар · сатрро пахш кунед, то дашборди пурра кушода шавад</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <ToastBanner toast={toast} onDismiss={dismissToast} />}
    </div>
  );
}
