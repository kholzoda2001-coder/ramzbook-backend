'use client';

/**
 * /admin/users/[id] — ДАШБОРДИ як хонанда.
 *
 * Ҳама чизи як корбар дар як саҳифа: кадом забонҳоро мехонад ва аз ҳар яке
 * чанд дарс, чанд калима ёд гирифт, кадом китобро кушод ва то кадом саҳифа
 * расид, кадом рӯз ва кадом СОАТ машғул шуд, гуфтор, дастовардҳо, пардохтҳо,
 * пушҳо — ва се амал: манъ кардан, обуна додан, пуши шахсӣ фиристодан.
 *
 * Маълумот аз `/api/admin/users/[id]/dashboard` (як дархост).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, ShieldCheck, ShieldOff, Send, Crown,
  CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react';

// ─── Навъҳо ───────────────────────────────────────────────────────────────

type Lang = {
  code: string; name: string; flag: string;
  lessons: number; xp: number; minutes: number; accuracy: number;
  heartsLost: number; level: string; words: number; lastAt: string | null;
  byLevel: Record<string, number>; bySkill: Record<string, number>;
};
type Daily = { date: string; lessons: number; xp: number; minutes: number };
type Book = {
  title: string; type: string; level: string | null;
  position: number; total: number; pagesRead: number; percent: number;
  lastReadAt: string | null;
};
type Dash = {
  user: any;
  totals: any;
  languages: Lang[];
  speaking: { code: string; category: string; lessons: number; xp: number; minutes: number; lastAt: string | null }[];
  books: Book[];
  daily: Daily[];
  syncBursts: { date: string; lessons: number; seconds: number }[];
  hours: number[];
  weekdays: number[];
  achievements: { code: string; name: string; emoji: string; rarity: string; earnedAt: string }[];
  payments: any[];
  paywall: Record<string, number>;
  pushes: { title: string; body: string; status: string; reason: string | null; createdAt: string; openedAt: string | null }[];
  recent: { title: string; skill: string; level: string; code: string; accuracy: number; xp: number; sec: number; at: string }[];
};
type Toast = { type: 'success' | 'error'; message: string };

// ─── Хурдакориҳо ──────────────────────────────────────────────────────────

const SKILL_TJ: Record<string, string> = {
  vocab: 'Луғат', grammar: 'Грамматика', listening: 'Шунавоӣ',
  reading: 'Хониш', writing: 'Навиштан', speaking: 'Гуфтор',
  test: 'Имтиҳон', review: 'Такрор', other: 'Дигар',
};
const WEEKDAY_TJ = ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шн', 'Як'];

/** Вақти ДУШАНБЕ — тамоми панел бо ҳамин вақт кор мекунад. */
function fmt(d: string | null | undefined, withTime = true): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  const s = new Date(dt.getTime() + 300 * 60000).toISOString();
  return withTime ? `${s.slice(0, 10)} · ${s.slice(11, 16)}` : s.slice(0, 10);
}
const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('ru-RU');
const hhmm = (sec: number) => {
  const m = Math.round((sec ?? 0) / 60);
  return m >= 60 ? `${Math.floor(m / 60)} соат ${m % 60} дақ` : `${m} дақ`;
};

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--card2)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text2)', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: tone ?? 'var(--text)', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, color, background: bg, border: `1px solid ${color}44` }}>
      {text}
    </span>
  );
}

/** Сутунчаҳои оддӣ — бе ягон китобхонаи график. */
function Bars({ data, labels, height = 90, color = '#818cf8' }: {
  data: number[]; labels?: string[]; height?: number; color?: string;
}) {
  const max = Math.max(1, ...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}
             title={`${labels?.[i] ?? i}: ${v}`}>
          <div style={{
            width: '100%', minWidth: 3,
            height: `${Math.max(v > 0 ? 3 : 1, (v / max) * (height - 16))}px`,
            background: v > 0 ? color : 'var(--border)',
            borderRadius: 3, transition: 'height 0.2s',
          }} />
          {labels && <span style={{ fontSize: 9, color: 'var(--text2)' }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = { padding: '11px 12px', fontSize: 13, color: 'var(--text)' };

// ─── Саҳифа ───────────────────────────────────────────────────────────────

export default function UserDashboardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${id}/dashboard?_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'Хато');
      setD(j);
    } catch (e: any) {
      setToast({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const act = async (url: string, body: any, okMsg: string) => {
    setBusy(true);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'Хато');
      setToast({ type: 'success', message: okMsg });
      return j;
    } catch (e: any) {
      setToast({ type: 'error', message: e.message });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const toggleBlock = async () => {
    const next = !d!.user.isActive;
    if (!next && !window.confirm(`${d!.user.name}-ро манъ кунем? Ҳамаи ҷаласаҳои кушодаи ӯ бекор мешаванд.`)) return;
    const j = await act(`/api/admin/users/${id}/status`, { isActive: next },
      next ? 'Дастрасӣ баргардонида шуд' : 'Ҳисоб манъ шуд');
    if (j) load();
  };

  const grant = async (action: string) => {
    if (action === 'revoke' && !window.confirm('Обунаро пурра бекор кунем?')) return;
    const j = await act(`/api/admin/users/${id}/access`, { action }, 'Обуна нав шуд');
    if (j) load();
  };

  const sendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      setToast({ type: 'error', message: 'Сарлавҳа ва матн лозим аст' });
      return;
    }
    const j = await act('/api/admin/push/manual-user',
      { userId: id, title: pushTitle.trim(), body: pushBody.trim() }, 'Пуш фиристода шуд');
    if (j) { setPushTitle(''); setPushBody(''); load(); }
  };

  const last30 = useMemo(() => (d ? d.daily.slice(-30) : []), [d]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 100, gap: 12, color: 'var(--text2)' }}>
        <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
        Дашборд бор мешавад…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!d) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text2)' }}>
        Маълумот гирифта нашуд. <Link href="/admin/users" style={{ color: '#818cf8' }}>Бозгашт</Link>
      </div>
    );
  }

  const u = d.user;
  const t = d.totals;

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Сарлавҳа ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Корбарон
        </Link>
        <div style={{ flex: 1 }} />
        <button onClick={load} disabled={busy}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Нав кардан
        </button>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #14B8A6, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
          {u.avatarUrl
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (u.name ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{u.name ?? '—'}</h1>
            {u.isActive
              ? <Pill text="Фаъол" color="#10b981" bg="rgba(16,185,129,0.12)" />
              : <Pill text="МАНЪ ШУДААСТ" color="#ef4444" bg="rgba(239,68,68,0.12)" />}
            {u.isPremium && <Pill text={u.premiumPlan === 'promo' ? 'Промо' : `Premium · ${u.premiumPlan}`} color="#ca8a04" bg="rgba(234,179,8,0.12)" />}
            {u.isTest && <Pill text="Ҳисоби тестӣ" color="#818cf8" bg="rgba(99,102,241,0.12)" />}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            {u.phone || u.email || '—'}
            {u.country && <> · 🌍 {u.country}</>}
            {' · '}<code style={{ fontSize: 11 }}>{u.id}</code>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            Бақайдгирӣ: {fmt(u.createdAt)} · Охирин фаъолият: {fmt(u.lastActiveAt)}
            {u.devices?.length ? ` · ${u.devices.length} дастгоҳ (${u.devices[0].platform})` : ' · дастгоҳ нест'}
          </div>
        </div>
      </div>

      {/* ── Амалҳо ─────────────────────────────────────────────────────── */}
      <Card title="Амалҳо">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={toggleBlock} disabled={busy}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: u.isActive ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              color: u.isActive ? '#ef4444' : '#10b981',
              border: `1px solid ${u.isActive ? '#ef444444' : '#10b98144'}` }}>
            {u.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
            {u.isActive ? 'Манъ кардан' : 'Дастрасиро баргардонидан'}
          </button>

          {[['grant_monthly', '1 моҳ'], ['grant_sixmonths', '6 моҳ'], ['grant_yearly', '1 сол'], ['grant_lifetime', 'Якумрӣ']].map(([a, label]) => (
            <button key={a} onClick={() => grant(a)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'rgba(234,179,8,0.10)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Crown size={14} /> {label}
            </button>
          ))}
          {u.isPremium && (
            <button onClick={() => grant('revoke')} disabled={busy}
              style={{ height: 38, padding: '0 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'var(--card2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
              Обунаро бекор кардан
            </button>
          )}
        </div>

        {/* Пуши ШАХСӢ — танҳо ба ҳамин хонанда */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'center' }}>
          <input className="input-field" placeholder="Сарлавҳаи пуш" value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)} maxLength={60}
            style={{ height: 38, fontSize: 13 }} />
          <input className="input-field" placeholder="Матни пуш" value={pushBody}
            onChange={(e) => setPushBody(e.target.value)} maxLength={180}
            style={{ height: 38, fontSize: 13 }} />
          <button onClick={sendPush} disabled={busy}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}>
            <Send size={14} /> Фиристодан
          </button>
        </div>
        {!u.devices?.length && (
          <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
            ⚠️ Ин корбар ягон дастгоҳи сабтшуда надорад — пуш намерасад.
          </div>
        )}
      </Card>

      {/* ── Рақамҳои асосӣ ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Stat label="XP" value={num(u.totalXp)} sub={`ҳафта: ${num(u.weeklyXp)}`} />
        <Stat label="Дарсҳо" value={num(t.lessons)} sub={`дақиқӣ ${t.accuracy}%`} />
        <Stat label="Калимаҳо" value={num(t.words)} sub={`SRS: ${num(t.srsCards)} корт`} />
        <Stat label="Вақт" value={`${num(t.minutes)} дақ`} sub={`≈ ${(t.minutes / 60).toFixed(1)} соат`} />
        <Stat label="Рӯзҳои фаъол" value={`${t.activeDays} / 90`} sub={`беҳтарин силсила: ${t.bestDayStreak} рӯз`} />
        <Stat label="Стрик" value={`🔥 ${u.streak}`} sub={u.streak !== u.streakStored ? `дар база ${u.streakStored} (мурда)` : `дарозтарин ${u.longestStreak}`} tone={u.streak > 0 ? '#f59e0b' : undefined} />
        <Stat label="Дил / Алмос" value={`${u.hearts} / ${num(u.gems)}`} sub={`freeze: ${u.streakFreezesAvailable ?? 0}`} />
        <Stat label="Дастовардҳо" value={num(t.achievements)} sub={`даъват: ${t.invites}`} />
      </div>

      {/* ── Забонҳо ────────────────────────────────────────────────────── */}
      <Card title={`Забонҳои омӯхташуда (${d.languages.length})`}>
        {d.languages.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Ҳанӯз ягон дарс нахондааст.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Забон', 'Сатҳ', 'Дарсҳо', 'Аз рӯи сатҳ', 'Маҳоратҳо', 'Калима', 'XP', 'Вақт', 'Дақиқӣ', 'Охирин'].map((h) => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {d.languages.map((l) => (
                  <tr key={l.code} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...TD, fontWeight: 700 }}>{l.flag} {l.name} <span style={{ color: 'var(--text2)', fontWeight: 400 }}>({l.code})</span></td>
                    <td style={TD}><Pill text={l.level} color="#818cf8" bg="rgba(99,102,241,0.12)" /></td>
                    <td style={{ ...TD, fontWeight: 700 }}>{num(l.lessons)}</td>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>
                      {Object.entries(l.byLevel).sort().map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                    </td>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>
                      {Object.entries(l.bySkill).sort((a, b) => b[1] - a[1]).slice(0, 4)
                        .map(([k, v]) => `${SKILL_TJ[k] ?? k} ${v}`).join(' · ')}
                    </td>
                    <td style={TD}>{num(l.words)}</td>
                    <td style={TD}>{num(l.xp)}</td>
                    <td style={TD}>{l.minutes} дақ</td>
                    <td style={TD}>{l.accuracy}%</td>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>{fmt(l.lastAt, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {d.syncBursts?.length > 0 && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
            ⚠️ Таркиши синхронизатсия — ин рақамҳоро ҳамчун «хондан» нахонед
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.6 }}>
            {d.syncBursts.map((b) => (
              <div key={b.date}>
                <b style={{ color: 'var(--text)' }}>{b.date}</b>: {b.lessons} дарс дар {b.seconds} сония
                — ин як бор ба сервер рехтани прогресси офлайн/кӯҳна аст, на дарси воқеӣ.
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Фаъолият ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <Card title="30 рӯзи охир (дарс дар як рӯз)">
          <Bars data={last30.map((x) => x.lessons)} labels={last30.map((x) => x.date.slice(8))} />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
            Дар 90 рӯз: {t.activeDays} рӯзи фаъол · {num(d.daily.reduce((s, x) => s + x.lessons, 0))} дарс · {num(d.daily.reduce((s, x) => s + x.xp, 0))} XP
          </div>
        </Card>

        <Card title="Кадом СОАТ машғул мешавад (вақти Душанбе)">
          <Bars data={d.hours} labels={d.hours.map((_, i) => (i % 3 === 0 ? String(i) : ''))} color="#14b8a6" />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
            Соати дӯстдошта: <b style={{ color: 'var(--text)' }}>
              {d.hours.indexOf(Math.max(...d.hours))}:00–{d.hours.indexOf(Math.max(...d.hours)) + 1}:00
            </b>
          </div>
        </Card>

        <Card title="Рӯзҳои ҳафта">
          <Bars data={d.weekdays} labels={WEEKDAY_TJ} color="#f59e0b" />
        </Card>
      </div>

      {/* ── Гуфтор ─────────────────────────────────────────────────────── */}
      <Card title={`Дарсҳои ГУФТОР (${d.speaking.reduce((s, x) => s + x.lessons, 0)})`}>
        {d.speaking.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Дарси гуфтор нахондааст.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Забон', 'Боб', 'Дарс', 'XP', 'Вақт', 'Охирин'].map((h) => <th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {d.speaking.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={TD}>{s.code.toUpperCase()}</td>
                  <td style={TD}>{s.category}</td>
                  <td style={{ ...TD, fontWeight: 700 }}>{s.lessons}</td>
                  <td style={TD}>{num(s.xp)}</td>
                  <td style={TD}>{s.minutes} дақ</td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>{fmt(s.lastAt, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {t.speakingMistakes > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
            Хатоҳои талаффуз дар навбати такрор: <b style={{ color: 'var(--text)' }}>{t.speakingMistakes}</b>
          </div>
        )}
      </Card>

      {/* ── Китобхона ──────────────────────────────────────────────────── */}
      <Card title={`Китобхона (${d.books.length})`}>
        {d.books.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Ягон китоб накушодааст.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Ном', 'Навъ', 'Сатҳ', 'Хондааст', 'Пешрафт', 'Охирин хониш'].map((h) => <th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {d.books.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...TD, fontWeight: 600 }}>{b.title}</td>
                  <td style={TD}>{b.type}</td>
                  <td style={TD}>{b.level ?? '—'}</td>
                  <td style={TD}>{b.pagesRead}{b.total ? ` / ${b.total}` : ''} саҳифа</td>
                  <td style={{ ...TD, minWidth: 120 }}>
                    <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, b.percent)}%`, background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{b.percent}%</span>
                  </td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>{fmt(b.lastReadAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── 20 дарси охирин ────────────────────────────────────────────── */}
      <Card title="20 дарси охирин">
        {d.recent.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Ҳанӯз ҳеҷ чиз.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Вақт', 'Забон', 'Сатҳ', 'Дарс', 'Маҳорат', 'Дақиқӣ', 'XP', 'Вақт'].map((h) => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {d.recent.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...TD, fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(r.at)}</td>
                    <td style={TD}>{r.code.toUpperCase()}</td>
                    <td style={TD}>{r.level}</td>
                    <td style={{ ...TD, fontWeight: 600 }}>{r.title}</td>
                    <td style={TD}>{SKILL_TJ[r.skill] ?? r.skill}</td>
                    <td style={{ ...TD, color: r.accuracy >= 80 ? '#10b981' : r.accuracy >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{r.accuracy}%</td>
                    <td style={TD}>{r.xp}</td>
                    <td style={TD}>{hhmm(r.sec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Дастовардҳо + Пардохтҳо ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <Card title={`Дастовардҳо (${d.achievements.length})`}>
          {d.achievements.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>Ҳанӯз нест.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {d.achievements.map((a) => (
                <span key={a.code} title={`${a.name} · ${fmt(a.earnedAt, false)}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 10, background: 'var(--card2)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text)' }}>
                  {a.emoji} {a.name}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card title="Пардохтҳо ва пейвол">
          {d.payments.length === 0
            ? <p style={{ color: 'var(--text2)', fontSize: 13 }}>Пардохт нест.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Сана', 'План', 'Маблағ', 'Провайдер', 'Вазъ'].map((h) => <th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {d.payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ ...TD, fontSize: 12 }}>{fmt(p.createdAt, false)}</td>
                      <td style={TD}>{p.plan ?? '—'}</td>
                      <td style={TD}>{num(p.amount)} {p.currency}</td>
                      <td style={TD}>{p.provider}</td>
                      <td style={TD}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          {Object.keys(d.paywall).length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 12 }}>
              Пейвол: {Object.entries(d.paywall).map(([k, v]) => `${k} ${v}`).join(' · ')}
            </div>
          )}
        </Card>
      </div>

      {/* ── Пушҳо ──────────────────────────────────────────────────────── */}
      <Card title={`Пушҳои фиристодашуда (${d.pushes.length})`}>
        {d.pushes.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Ҳанӯз пуш нагирифтааст.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Сана', 'Сарлавҳа', 'Матн', 'Вазъ', 'Кушод'].map((h) => <th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {d.pushes.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...TD, fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(p.createdAt)}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{p.title}</td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--text2)' }}>{p.body}</td>
                  <td style={TD}>{p.status}{p.reason ? ` (${p.reason})` : ''}</td>
                  <td style={{ ...TD, fontSize: 12 }}>{p.openedAt ? fmt(p.openedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#10b98155' : '#ef444455'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
