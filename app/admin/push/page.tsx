'use client';

/**
 * /admin/push — маркази огоҳиҳо.
 *
 * Се бахш:
 *  1. Кампанияҳои АВТОМАТӢ — ҷадвал (вақти маҳаллӣ), сегмент, матн бо забонҳо;
 *  2. Фиристодани ДАСТӢ — ҳамон сегмент + матн, як бор;
 *  3. Таърих — чӣ фиристода шуд ва чаро нашуд.
 *
 * Қоидаи асосӣ: ҳеҷ чиз бе «Санҷиш» нарасад — ҳар фиристодан аввал ҳамчун
 * dry-run иҷро мешавад ва матни аслии як хонандаи воқеиро нишон медиҳад.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell, Plus, Play, Send, Trash2, Save, X, Users, Clock, AlertCircle,
  CheckCircle2, History, Megaphone, Loader2, Power,
} from 'lucide-react';

// ── Типҳо ────────────────────────────────────────────────────────────────────

type Texts = Record<string, { title: string; body: string }>;

interface Campaign {
  id: string;
  name: string;
  kind: string;
  isActive: boolean;
  hour: number;
  minute: number;
  tzOffsetMin: number;
  weekdays: string | null;
  langs: string | null;
  tier: string | null;
  studiedToday: string | null;
  minStreak: number | null;
  maxStreak: number | null;
  minInactiveDays: number | null;
  maxInactiveDays: number | null;
  levels: string | null;
  countries: string | null;
  texts: Texts;
  route: string;
  countdownToHour: number | null;
  priority: number;
  cooldownHours: number;
  lastRunAt: string | null;
  lastRunSent: number;
  audience?: number;
  due?: boolean;
}

interface Placeholder { key: string; desc: string }

interface RunResult {
  matched: number; sent: number; skipped: number; failed: number;
  sample?: { userId: string; title: string; body: string } | null;
  dryRun: boolean;
}

interface HistoryRow {
  id: string; title: string; body: string; status: string; reason: string | null;
  campaignKey: string | null; createdAt: string;
  user: { id: string; name: string; email: string | null; interfaceLang: string } | null;
}

// ── Доимӣ ────────────────────────────────────────────────────────────────────

const LANGS = [
  { code: 'tg', label: 'Тоҷикӣ' },
  { code: 'ru', label: 'Русӣ' },
  { code: 'en', label: 'Англисӣ' },
];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const WEEKDAYS = [
  { v: '1', l: 'Дш' }, { v: '2', l: 'Сш' }, { v: '3', l: 'Чш' }, { v: '4', l: 'Пш' },
  { v: '5', l: 'Ҷм' }, { v: '6', l: 'Шн' }, { v: '7', l: 'Яш' },
];
const TIMEZONES = [
  { v: 300, l: 'Душанбе (UTC+5)' },
  { v: 180, l: 'Москва (UTC+3)' },
  { v: 360, l: 'Остона (UTC+6)' },
  { v: 0, l: 'UTC' },
];
const ROUTES = [
  { v: 'lesson', l: 'Дарси навбатӣ' },
  { v: 'roadmap', l: 'Роҳнамо' },
  { v: 'home', l: 'Асосӣ' },
];

const splitList = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

function emptyDraft(): Partial<Campaign> {
  return {
    name: '',
    kind: 'scheduled',
    isActive: true,
    hour: 19,
    minute: 0,
    tzOffsetMin: 300,
    weekdays: null,
    langs: 'tg',
    tier: null,
    studiedToday: 'no',
    minStreak: null,
    maxStreak: null,
    minInactiveDays: null,
    maxInactiveDays: null,
    levels: null,
    countries: null,
    texts: { tg: { title: '', body: '' } },
    route: 'lesson',
    countdownToHour: null,
    priority: 0,
    cooldownHours: 20,
  };
}

// ── Ҷузъҳои хурд ─────────────────────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
        active
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
          : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-secondary)] hover:opacity-80'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]';

// ── Муҳаррири сегмент (ҳам барои кампания, ҳам барои broadcast) ─────────────

function SegmentEditor({
  draft, set, audience, loadingCount,
}: {
  draft: any;
  set: (patch: any) => void;
  audience: number | null;
  loadingCount: boolean;
}) {
  const langs = splitList(draft.langs);
  const levels = splitList(draft.levels);

  const toggle = (field: 'langs' | 'levels', value: string) => {
    const cur = splitList(draft[field]);
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    set({ [field]: next.length ? next.join(',') : null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Users size={15} className="text-indigo-500" /> Кӣ мегирад
        </h3>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center gap-2">
          {loadingCount ? <Loader2 size={13} className="animate-spin" /> : null}
          {audience != null ? `${audience} хонанда` : '—'}
        </span>
      </div>

      <Field label="Забони интерфейс" hint="Ҳеҷ кадом интихоб нашуд = ҳама забонҳо">
        <div className="flex gap-2 flex-wrap">
          {LANGS.map((l) => (
            <Chip key={l.code} active={langs.includes(l.code)} onClick={() => toggle('langs', l.code)}>
              {l.label}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Обуна">
          <select className={inputCls} value={draft.tier ?? ''} onChange={(e) => set({ tier: e.target.value || null })}>
            <option value="">Ҳама</option>
            <option value="free">Бе обуна (free)</option>
            <option value="premium">Обунадор (premium)</option>
          </select>
        </Field>

        <Field label="Имрӯз дарс хондааст?" hint="«Нахондааст» — маҳз онҳое, ки бояд бедор карда шаванд">
          <select
            className={inputCls}
            value={draft.studiedToday ?? ''}
            onChange={(e) => set({ studiedToday: e.target.value || null })}
          >
            <option value="">Фарқ надорад</option>
            <option value="no">Имрӯз НАХОНДААСТ</option>
            <option value="yes">Имрӯз хондааст</option>
          </select>
        </Field>

        <Field label="Силсила аз (рӯз)">
          <input type="number" min={0} className={inputCls} value={draft.minStreak ?? ''}
            onChange={(e) => set({ minStreak: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
        <Field label="Силсила то (рӯз)">
          <input type="number" min={0} className={inputCls} value={draft.maxStreak ?? ''}
            onChange={(e) => set({ maxStreak: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>

        <Field label="Ғайрифаъол аз (рӯз)" hint="Мас. 3 = се рӯз ва бештар нахондааст">
          <input type="number" min={0} className={inputCls} value={draft.minInactiveDays ?? ''}
            onChange={(e) => set({ minInactiveDays: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
        <Field label="Ғайрифаъол то (рӯз)">
          <input type="number" min={0} className={inputCls} value={draft.maxInactiveDays ?? ''}
            onChange={(e) => set({ maxInactiveDays: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
      </div>

      <Field label="Сатҳ">
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((lv) => (
            <Chip key={lv} active={levels.includes(lv)} onClick={() => toggle('levels', lv)}>{lv}</Chip>
          ))}
        </div>
      </Field>

      <Field label="Кишварҳо (ISO, бо вергул)" hint="Мас. TJ,RU — холӣ = ҳама">
        <input className={inputCls} value={draft.countries ?? ''}
          onChange={(e) => set({ countries: e.target.value.trim() || null })} placeholder="TJ,RU" />
      </Field>
    </div>
  );
}

// ── Муҳаррири матн бо забонҳо ───────────────────────────────────────────────

function TextsEditor({
  texts, setTexts, placeholders,
}: {
  texts: Texts;
  setTexts: (t: Texts) => void;
  placeholders: Placeholder[];
}) {
  const [openLang, setOpenLang] = useState<string>(Object.keys(texts)[0] ?? 'tg');

  const upd = (lang: string, key: 'title' | 'body', value: string) => {
    const cur = texts[lang] ?? { title: '', body: '' };
    setTexts({ ...texts, [lang]: { ...cur, [key]: value } });
  };
  const toggleLang = (lang: string) => {
    if (texts[lang]) {
      const next = { ...texts };
      delete next[lang];
      setTexts(next);
      if (openLang === lang) setOpenLang(Object.keys(next)[0] ?? 'tg');
    } else {
      setTexts({ ...texts, [lang]: { title: '', body: '' } });
      setOpenLang(lang);
    }
  };

  const insert = (ph: string) => {
    const cur = texts[openLang] ?? { title: '', body: '' };
    upd(openLang, 'body', `${cur.body}${cur.body.endsWith(' ') || !cur.body ? '' : ' '}${ph}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Матн (барои ҳар забон алоҳида)</h3>

      <div className="flex gap-2 flex-wrap">
        {LANGS.map((l) => (
          <Chip key={l.code} active={!!texts[l.code]} onClick={() => toggleLang(l.code)}>
            {l.label} {texts[l.code] ? '✓' : '+'}
          </Chip>
        ))}
      </div>

      {Object.keys(texts).length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {Object.keys(texts).map((code) => (
            <button key={code} type="button" onClick={() => setOpenLang(code)}
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                openLang === code ? 'bg-[var(--text-primary)] text-[var(--bg-surface)]' : 'text-[var(--text-muted)]'
              }`}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {texts[openLang] && (
        <div className="space-y-3">
          <Field label="Сарлавҳа">
            <input className={inputCls} value={texts[openLang].title}
              onChange={(e) => upd(openLang, 'title', e.target.value)}
              placeholder="{name}, вақти дарс расид 📚" />
          </Field>
          <Field label="Матн">
            <textarea rows={3} className={inputCls} value={texts[openLang].body}
              onChange={(e) => upd(openLang, 'body', e.target.value)}
              placeholder="Дарси «{lesson}» — ҳамагӣ {minutes} дақиқа." />
          </Field>
        </div>
      )}

      <div>
        <p className="text-[10px] text-[var(--text-muted)] mb-2">
          Ҷойгузорҳо — барои ҳар хонанда бо маълумоти худаш пур мешаванд:
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {placeholders.map((p) => (
            <button key={p.key} type="button" title={p.desc} onClick={() => insert(p.key)}
              className="px-2 py-1 rounded-md text-[10px] font-mono bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:opacity-70">
              {p.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Натиҷаи иҷро ────────────────────────────────────────────────────────────

function ResultBox({ r }: { r: RunResult }) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
      <div className="flex gap-4 flex-wrap text-xs font-semibold mb-3">
        <span className="text-[var(--text-secondary)]">Мувофиқ: {r.matched}</span>
        <span className="text-emerald-600">Фиристода: {r.sent}</span>
        <span className="text-amber-600">Гузашт: {r.skipped}</span>
        <span className="text-red-500">Хато: {r.failed}</span>
        {r.dryRun && <span className="text-indigo-500">САНҶИШ (ҳеҷ чиз нафиристод)</span>}
      </div>
      {r.sample ? (
        <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)]">
          <p className="text-[10px] text-[var(--text-muted)] mb-1">Намуна барои як хонандаи воқеӣ:</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{r.sample.title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{r.sample.body}</p>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">Ҳеҷ хонанда ба ин сегмент мувофиқ нест.</p>
      )}
    </div>
  );
}

// ── Саҳифа ──────────────────────────────────────────────────────────────────

export default function AdminPushPage() {
  const [tab, setTab] = useState<'campaigns' | 'broadcast' | 'history'>('campaigns');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pushConfigured, setPushConfigured] = useState(true);

  const [items, setItems] = useState<Campaign[]>([]);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);

  const [draft, setDraft] = useState<Partial<Campaign> | null>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/push/campaigns');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItems(data.items ?? []);
      setPlaceholders(data.placeholders ?? []);
      setPushConfigured(data.pushConfigured !== false);
      if (data.seeded > 0) {
        setStatus({ type: 'success', msg: `${data.seeded} кампанияи оғозӣ сохта шуд — онҳоро таҳрир кунед.` });
      }
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!draft?.name?.trim()) { setStatus({ type: 'error', msg: 'Ном лозим аст' }); return; }
    setSaving(true);
    try {
      const isNew = !draft.id;
      const res = await fetch(isNew ? '/api/admin/push/campaigns' : `/api/admin/push/campaigns/${draft.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          langs: splitList(draft.langs ?? null),
          levels: splitList(draft.levels ?? null),
          countries: splitList(draft.countries ?? null),
          weekdays: splitList(draft.weekdays ?? null),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ type: 'success', msg: 'Сабт шуд.' });
      setDraft(null);
      setResult(null);
      load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Campaign) {
    try {
      await fetch(`/api/admin/push/campaigns/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
    } catch {/* non-critical */}
  }

  async function remove(c: Campaign) {
    if (!confirm(`«${c.name}» нест карда шавад?`)) return;
    try {
      const res = await fetch(`/api/admin/push/campaigns/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Нашуд');
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      setStatus({ type: 'success', msg: 'Нест шуд.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed' });
    }
  }

  async function run(c: Campaign, dryRun: boolean) {
    if (!dryRun && !confirm(`ВОҚЕАН фиристода шавад? Тахминан ${c.audience ?? '?'} хонанда push мегирад.`)) return;
    setRunning(c.id);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/push/campaigns/${c.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data.result);
      setStatus({
        type: 'success',
        msg: dryRun ? 'Санҷиш иҷро шуд — ҳеҷ чиз фиристода нашуд.' : `Фиристода шуд: ${data.result.sent}`,
      });
      if (!dryRun) load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed' });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="fade-up mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <Bell size={22} className="text-emerald-500" /> Огоҳиҳо (Push)
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Кампанияҳои автоматӣ ва фиристодани дастӣ. Матн барои ҳар хонанда бо маълумоти худаш
            ва бо забони худаш пур мешавад.
          </p>
        </div>
        {tab === 'campaigns' && (
          <button onClick={() => { setDraft(emptyDraft()); setResult(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:opacity-90">
            <Plus size={16} /> Кампанияи нав
          </button>
        )}
      </div>

      {!pushConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-start gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            <b>FIREBASE_SERVICE_ACCOUNT</b> дар Vercel гузошта нашудааст — ҳеҷ push намеравад.
            Санҷиш (dry-run) кор мекунад, фиристодани воқеӣ не.
          </p>
        </div>
      )}

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${
          status.type === 'error'
            ? 'bg-red-500/10 border border-red-500/20 text-red-600'
            : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Ҷадвалҳо */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          ['campaigns', 'Кампанияҳои автоматӣ', <Clock key="c" size={15} />],
          ['broadcast', 'Фиристодани дастӣ', <Megaphone key="b" size={15} />],
          ['history', 'Таърих', <History key="h" size={15} />],
        ] as const).map(([key, label, icon]) => (
          <button key={key} onClick={() => { setTab(key as any); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              tab === key
                ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-transparent'
                : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-secondary)]'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <>
          {draft && (
            <CampaignEditor
              draft={draft}
              setDraft={setDraft}
              placeholders={placeholders}
              onSave={save}
              saving={saving}
              onCancel={() => { setDraft(null); setResult(null); }}
            />
          )}

          {loading && items.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">Бор шуда истодааст…</p>
          )}

          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="glass-card p-5 fade-up">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{c.name}</h3>
                      {!c.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] font-semibold">
                          ХОМӮШ
                        </span>
                      )}
                      {c.due && c.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 font-semibold">
                          вақташ расид
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {String(c.hour).padStart(2, '0')}:{String(c.minute).padStart(2, '0')}{' '}
                      · {TIMEZONES.find((t) => t.v === c.tzOffsetMin)?.l ?? `UTC+${c.tzOffsetMin / 60}`}
                      {c.langs ? ` · ${c.langs}` : ' · ҳама забонҳо'}
                      {c.tier ? ` · ${c.tier}` : ''}
                      {c.studiedToday === 'no' ? ' · имрӯз нахондаанд' : ''}
                      {c.minInactiveDays != null ? ` · ғайрифаъол ${c.minInactiveDays}${c.maxInactiveDays != null ? `–${c.maxInactiveDays}` : '+'} рӯз` : ''}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      <b className="text-[var(--text-secondary)]">{c.audience ?? 0}</b> хонанда мувофиқ
                      {c.lastRunAt && ` · охирин: ${new Date(c.lastRunAt).toLocaleString('ru-RU')} (${c.lastRunSent})`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(c)} title={c.isActive ? 'Хомӯш кардан' : 'Фаъол кардан'}
                      className={`p-2 rounded-lg border ${c.isActive
                        ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                        : 'border-[var(--bg-border)] text-[var(--text-muted)]'}`}>
                      <Power size={15} />
                    </button>
                    <button onClick={() => run(c, true)} disabled={running === c.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--bg-border)] text-xs font-semibold text-[var(--text-secondary)] hover:opacity-80">
                      {running === c.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Санҷиш
                    </button>
                    <button onClick={() => run(c, false)} disabled={running === c.id || !pushConfigured}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40">
                      <Send size={14} /> Фиристодан
                    </button>
                    <button onClick={() => { setDraft({ ...c }); setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-3 py-2 rounded-lg border border-[var(--bg-border)] text-xs font-semibold text-[var(--text-secondary)]">
                      Таҳрир
                    </button>
                    <button onClick={() => remove(c)} className="p-2 rounded-lg border border-red-500/30 text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result && !draft && <ResultBox r={result} />}
        </>
      )}

      {tab === 'broadcast' && <BroadcastTab placeholders={placeholders} pushConfigured={pushConfigured} setStatus={setStatus} />}
      {tab === 'history' && <HistoryTab />}
    </div>
  );
}

// ── Муҳаррири кампания ──────────────────────────────────────────────────────

function CampaignEditor({
  draft, setDraft, placeholders, onSave, saving, onCancel,
}: {
  draft: Partial<Campaign>;
  setDraft: (d: Partial<Campaign>) => void;
  placeholders: Placeholder[];
  onSave: () => void;
  saving: boolean;
  onCancel: () => void;
}) {
  const set = (patch: any) => setDraft({ ...draft, ...patch });
  const [audience, setAudience] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const weekdays = splitList(draft.weekdays ?? null);

  const segKey = useMemo(() => JSON.stringify([
    draft.langs, draft.tier, draft.studiedToday, draft.minStreak, draft.maxStreak,
    draft.minInactiveDays, draft.maxInactiveDays, draft.levels, draft.countries, draft.tzOffsetMin,
  ]), [draft]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCount(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/push/segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            langs: splitList(draft.langs ?? null),
            tier: draft.tier, studiedToday: draft.studiedToday,
            minStreak: draft.minStreak, maxStreak: draft.maxStreak,
            minInactiveDays: draft.minInactiveDays, maxInactiveDays: draft.maxInactiveDays,
            levels: splitList(draft.levels ?? null),
            countries: splitList(draft.countries ?? null),
            tzOffsetMin: draft.tzOffsetMin ?? 300,
          }),
        });
        const data = await res.json();
        if (!cancelled) setAudience(data.count ?? 0);
      } catch { if (!cancelled) setAudience(null); }
      finally { if (!cancelled) setLoadingCount(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [segKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass-card p-6 mb-6 fade-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {draft.id ? 'Таҳрири кампания' : 'Кампанияи нав'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-lg text-[var(--text-muted)] hover:opacity-70">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        <Field label="Ном (танҳо барои панел)">
          <input className={inputCls} value={draft.name ?? ''} onChange={(e) => set({ name: e.target.value })}
            placeholder="Огоҳии қавӣ 21:30 — тоҷикӣ" />
        </Field>

        {/* Ҷадвал */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" /> Кай мефиристад
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Соат">
              <input type="number" min={0} max={23} className={inputCls} value={draft.hour ?? 19}
                onChange={(e) => set({ hour: Number(e.target.value) })} />
            </Field>
            <Field label="Дақиқа">
              <input type="number" min={0} max={59} className={inputCls} value={draft.minute ?? 0}
                onChange={(e) => set({ minute: Number(e.target.value) })} />
            </Field>
            <Field label="Минтақаи вақт">
              <select className={inputCls} value={draft.tzOffsetMin ?? 300}
                onChange={(e) => set({ tzOffsetMin: Number(e.target.value) })}>
                {TIMEZONES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </Field>
            <Field label="Такрор нашавад (соат)" hint="Ҳамон кампания ба ҳамон корбар">
              <input type="number" min={0} className={inputCls} value={draft.cooldownHours ?? 20}
                onChange={(e) => set({ cooldownHours: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Рӯзҳои ҳафта" hint="Ҳеҷ кадом = ҳаррӯза">
              <div className="flex gap-2 flex-wrap">
                {WEEKDAYS.map((d) => (
                  <Chip key={d.v} active={weekdays.includes(d.v)}
                    onClick={() => {
                      const next = weekdays.includes(d.v) ? weekdays.filter((x) => x !== d.v) : [...weekdays, d.v];
                      set({ weekdays: next.length ? next.join(',') : null });
                    }}>
                    {d.l}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="h-px bg-[var(--bg-border)]" />

        <SegmentEditor draft={draft} set={set} audience={audience} loadingCount={loadingCount} />

        <div className="h-px bg-[var(--bg-border)]" />

        <TextsEditor texts={(draft.texts ?? {}) as Texts} setTexts={(t) => set({ texts: t })} placeholders={placeholders} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Тап → куҷо барад">
            <select className={inputCls} value={draft.route ?? 'lesson'} onChange={(e) => set({ route: e.target.value })}>
              {ROUTES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
          </Field>
          <Field label="{countdown} то соати" hint="24 = нимишаби маҳаллӣ; холӣ = ҳисоби вақт нест">
            <input type="number" min={0} max={24} className={inputCls} value={draft.countdownToHour ?? ''}
              onChange={(e) => set({ countdownToHour: e.target.value === '' ? null : Number(e.target.value) })} />
          </Field>
          <Field label="Навбат (хурдтар = аввалтар)">
            <input type="number" className={inputCls} value={draft.priority ?? 0}
              onChange={(e) => set({ priority: Number(e.target.value) })} />
          </Field>
        </div>

        <div className="flex gap-3">
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сабт
          </button>
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-secondary)]">
            Бекор
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Фиристодани дастӣ ───────────────────────────────────────────────────────

function BroadcastTab({
  placeholders, pushConfigured, setStatus,
}: {
  placeholders: Placeholder[];
  pushConfigured: boolean;
  setStatus: (s: { type: 'error' | 'success'; msg: string } | null) => void;
}) {
  const [draft, setDraft] = useState<any>({
    langs: 'tg', tier: null, studiedToday: null,
    minStreak: null, maxStreak: null, minInactiveDays: null, maxInactiveDays: null,
    levels: null, countries: null, tzOffsetMin: 300,
    route: 'home', force: false,
  });
  const [texts, setTexts] = useState<Texts>({ tg: { title: '', body: '' } });
  const [audience, setAudience] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const set = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  const segKey = useMemo(() => JSON.stringify(draft), [draft]);
  useEffect(() => {
    let cancelled = false;
    setLoadingCount(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/push/segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...draft,
            langs: splitList(draft.langs), levels: splitList(draft.levels), countries: splitList(draft.countries),
          }),
        });
        const data = await res.json();
        if (!cancelled) setAudience(data.count ?? 0);
      } catch { if (!cancelled) setAudience(null); }
      finally { if (!cancelled) setLoadingCount(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [segKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(dryRun: boolean) {
    if (!dryRun && !confirm(`ВОҚЕАН фиристода шавад? Тахминан ${audience ?? '?'} хонанда push мегирад.`)) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: {
            langs: splitList(draft.langs), tier: draft.tier, studiedToday: draft.studiedToday,
            minStreak: draft.minStreak, maxStreak: draft.maxStreak,
            minInactiveDays: draft.minInactiveDays, maxInactiveDays: draft.maxInactiveDays,
            levels: splitList(draft.levels), countries: splitList(draft.countries),
          },
          texts, route: draft.route, dryRun, force: draft.force,
          tzOffsetMin: draft.tzOffsetMin, label: 'broadcast',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data.result);
      setStatus({
        type: 'success',
        msg: dryRun ? 'Санҷиш иҷро шуд — ҳеҷ чиз фиристода нашуд.' : `Фиристода шуд: ${data.result.sent}`,
      });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card p-6 fade-up space-y-5">
      <SegmentEditor draft={draft} set={set} audience={audience} loadingCount={loadingCount} />
      <div className="h-px bg-[var(--bg-border)]" />
      <TextsEditor texts={texts} setTexts={setTexts} placeholders={placeholders} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Тап → куҷо барад">
          <select className={inputCls} value={draft.route} onChange={(e) => set({ route: e.target.value })}>
            {ROUTES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer mt-6">
          <input type="checkbox" checked={draft.force} onChange={(e) => set({ force: e.target.checked })} className="w-4 h-4 rounded" />
          <span className="text-sm text-[var(--text-primary)]">
            Лимити рӯзонаро вайрон кун <span className="text-[var(--text-muted)]">(бо эҳтиёт)</span>
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={() => send(true)} disabled={busy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-secondary)]">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Санҷиш
        </button>
        <button onClick={() => send(false)} disabled={busy || !pushConfigured}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40">
          <Send size={16} /> Фиристодан
        </button>
      </div>

      {result && <ResultBox r={result} />}
    </div>
  );
}

// ── Таърих ──────────────────────────────────────────────────────────────────

function HistoryTab() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/push/history?limit=150');
        const data = await res.json();
        setRows(data.items ?? []);
        setStats(data.stats ?? null);
      } catch {/* silent */}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up">
          <div className="glass-card p-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">Фиристода (24с)</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.sentToday}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">Фиристода (7 рӯз)</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.sentWeek}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">Гузашт (24с)</p>
            <p className="text-2xl font-bold text-amber-500">{stats.skippedToday}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">Хато (24с)</p>
            <p className="text-2xl font-bold text-red-500">{stats.failedToday}</p>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-[var(--text-muted)]">Бор шуда истодааст…</p>}

      <div className="glass-card p-0 overflow-hidden fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs border-b border-[var(--bg-border)]">
                <th className="px-4 py-3">Вақт</th>
                <th className="px-4 py-3">Хонанда</th>
                <th className="px-4 py-3">Кампания</th>
                <th className="px-4 py-3">Матн</th>
                <th className="px-4 py-3">Ҳолат</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--bg-border)] last:border-0">
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                    {r.user?.name ?? '—'}
                    {r.user?.interfaceLang && <span className="ml-1 text-[var(--text-muted)]">({r.user.interfaceLang})</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{r.campaignKey ?? '—'}</td>
                  <td className="px-4 py-3 max-w-md">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{r.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{r.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${
                      r.status === 'sent' ? 'bg-emerald-500/15 text-emerald-600'
                        : r.status === 'skipped' ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-red-500/15 text-red-500'}`}>
                      {r.status}{r.reason ? ` · ${r.reason}` : ''}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">Ҳанӯз ҳеҷ чиз фиристода нашудааст.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
