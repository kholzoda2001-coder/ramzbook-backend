'use client';

/**
 * «Фикри хонандагон» — ЯК қуттии воридотӣ.
 *
 * Дар ин саҳифа ДУ ҷараёни гуногун ҷамъ мешаванд:
 *   💬 баҳо ва шикоят (`Feedback`) — эмодзӣ + матн;
 *   🚩 хатои мазмун (`ContentReport`) — он чи хонанда дар ДОХИЛИ дарс байрақ
 *      мезанад (тарҷумаи нодуруст, хатои имло, аудиои бад…).
 *
 * Пештар инҳо ду саҳифаи ҷудогона буданд ва савол «хонанда аз чӣ норозӣ аст?»
 * ду бор пурсида мешуд. Ҳоло як рӯйхат, як филтр — ва филтри асосӣ ҶУФТИ
 * ЗАБОН аст: забони модарӣ × забони омӯзишӣ.
 *
 * Гузоришҳо ГУРӮҲБАНДӢ намоиш дода мешаванд (як сатр = `contentId + field`),
 * пас ҳашт шикоят ба як тарҷума як бор ҳал мешаванд.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Star, Save, AlertCircle, CheckCircle2,
  Search, Mail, Settings2, Eye, EyeOff, Flag, Inbox, RotateCcw,
} from 'lucide-react';

const FACES = ['😠', '🙁', '😐', '🙂', '😍'];

const REASON_LABEL: Record<string, string> = {
  wrong_translation: 'Тарҷума нодуруст',
  spelling: 'Хатои имло',
  unnatural: 'Ғайритабиӣ',
  other: 'Чизи дигар',
};

const FIELD_LABEL: Record<string, string> = {
  word_target: 'Калима (омӯзишӣ)',
  word_native: 'Тарҷума (модарӣ)',
  ipa: 'Транскрипсия',
  ipa_native: 'Талаффуз (модарӣ)',
  example_target: 'Мисол (омӯзишӣ)',
  example_native: 'Мисол (тарҷума)',
  audio: 'Аудио',
  emoji: 'Эмодзӣ',
  image: 'Акс',
  note: 'Тавзеҳи грамматикӣ',
  build_sentence_native: 'Ҷумла (модарӣ)',
};

/** Майдонҳои РАҚАМДОР: `option_3` → «Варианти 3». */
const NUMBERED_FIELD: [RegExp, string][] = [
  [/^option_(\d+)$/, 'Варианти'],
  [/^image_(\d+)$/, 'Акси'],
  [/^build_token_(\d+)$/, 'Хишти'],
  [/^match_left_(\d+)$/, 'Мач · чап'],
  [/^match_right_(\d+)$/, 'Мач · рост'],
];

function fieldLabel(field: string): string {
  const known = FIELD_LABEL[field];
  if (known) return known;
  for (const [re, prefix] of NUMBERED_FIELD) {
    const m = re.exec(field);
    if (m) return `${prefix} ${m[1]}`;
  }
  return field;
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Нав',
  fixed: 'Ҳал шуд',
  rejected: 'Рад шуд',
  all: 'Ҳама',
};

interface LangFacet {
  code: string;
  count: number;
  name: string;
  nativeName: string;
  flag: string;
}

interface FeedbackItem {
  kind: 'feedback';
  id: string;
  rowId: string;
  createdAt: string;
  sortAt: string;
  nativeLang: string | null;
  targetLang: string | null;
  rating: number;
  message: string | null;
  source: string;
  lessonsCompleted: number;
  level: string | null;
  platform: string | null;
  isRead: boolean;
  user: { id: string; name: string; email: string | null; phone: string | null } | null;
}

interface ReportItem {
  kind: 'report';
  id: string;
  createdAt: string;
  sortAt: string;
  nativeLang: string | null;
  targetLang: string | null;
  contentId: string;
  field: string;
  status: string;
  lessonId: string;
  moduleId: string | null;
  exerciseTypes: string[];
  reportedValue: string;
  currentValue: string | null;
  reportCount: number;
  userCount: number;
  rewardedCount: number;
  reasons: Record<string, number>;
  suggestions: { text: string; at: string }[];
  firstAt: string;
  lastAt: string;
  course: string | null;
  appVersions: string[];
  level: string | null;
  context: {
    word: string;
    translation: string;
    lessonTitle: string | null;
    moduleTitle: string | null;
  } | null;
}

type InboxItem = FeedbackItem | ReportItem;

const PAGE = 50;

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [items, setItems] = useState<InboxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ feedback: 0, reports: 0, reportsRaw: 0 });
  const [unreadFeedback, setUnreadFeedback] = useState(0);
  const [openReports, setOpenReports] = useState(0);
  const [feedbackAll, setFeedbackAll] = useState(0);
  const [reportsAll, setReportsAll] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [facets, setFacets] = useState<{ native: LangFacet[]; target: LangFacet[] }>({
    native: [], target: [],
  });
  const [truncated, setTruncated] = useState(false);

  // ── Филтрҳо ─────────────────────────────────────────────────────────────
  const [type, setType] = useState<'all' | 'feedback' | 'report'>('all');
  const [nativeLang, setNativeLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [reportStatus, setReportStatus] = useState('new');
  const [rating, setRating] = useState<number | null>(null);
  const [q, setQ] = useState('');
  /// Дархост ба ҳар ҳарф не — қуттӣ ду ҷадвалро мехонад ва гурӯҳбандӣ мекунад.
  const [qDebounced, setQDebounced] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [take, setTake] = useState(PAGE);

  const [busy, setBusy] = useState<string | null>(null);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [afterLessons, setAfterLessons] = useState(6);
  const [repeat, setRepeat] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [thanks, setThanks] = useState('');

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Линкҳои кӯҳна ба `/admin/reports` ин ҷо бо `?type=report` меоянд.
  // ⚠️ Аз `window.location` хонда мешавад, на аз `useSearchParams`: он охирӣ
  // дар Next 14 ҳудуди `Suspense` талаб мекунад ва билди саҳифаро мешиканад.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('type');
    if (t === 'report' || t === 'feedback' || t === 'all') setType(t);
    const n = sp.get('nativeLang');
    if (n) setNativeLang(n.toLowerCase());
    const g = sp.get('targetLang');
    if (g) setTargetLang(g.toLowerCase());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', type);
      params.set('take', String(take));
      if (nativeLang) params.set('nativeLang', nativeLang);
      if (targetLang) params.set('targetLang', targetLang);
      if (type !== 'feedback') params.set('status', reportStatus);
      if (rating) params.set('rating', String(rating));
      if (qDebounced.trim()) params.set('q', qDebounced.trim());
      if (unreadOnly) params.set('unreadOnly', '1');

      const res = await fetch(`/api/admin/inbox?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setCounts(data.counts ?? { feedback: 0, reports: 0, reportsRaw: 0 });
      setUnreadFeedback(data.unreadFeedback ?? 0);
      setOpenReports(data.openReports ?? 0);
      setFeedbackAll(data.feedbackAll ?? 0);
      setReportsAll(data.reportsAll ?? 0);
      setAverageRating(data.averageRating ?? null);
      setFacets(data.facets ?? { native: [], target: [] });
      setTruncated(data.truncated === true);
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [type, take, nativeLang, targetLang, reportStatus, rating, qDebounced, unreadOnly]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/feedback-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const c = data.config;
      setEnabled(c.enabled);
      setAfterLessons(c.afterLessons);
      setRepeat(c.repeat !== false);
      setTitle(c.title);
      setMessage(c.message);
      setPlaceholder(c.placeholder);
      setThanks(c.thanks);
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Ҳар тағйири филтр саҳифаро аз аввал сар мекунад — вагарна «бештар»-и
  // қаблӣ ба натиҷаи нав мечаспид ва рӯйхат нофаҳмо мешуд.
  const resetPage = () => setTake(PAGE);

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/feedback-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { enabled, afterLessons, repeat, title, message, placeholder, thanks } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setAfterLessons(data.config.afterLessons);
      setStatus({ type: 'success', msg: 'Танзимот сабт шуд — дар барнома фавран амал мекунад.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleRead(row: FeedbackItem) {
    try {
      await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.rowId, isRead: !row.isRead }),
      });
      setItems((prev) =>
        prev.map((r) => (r.id === row.id && r.kind === 'feedback' ? { ...r, isRead: !r.isRead } : r)),
      );
      setUnreadFeedback((u) => Math.max(0, u + (row.isRead ? 1 : -1)));
    } catch {/* non-critical */}
  }

  async function actOnReport(g: ReportItem, what: 'resolve' | 'reject') {
    setBusy(g.id);
    try {
      const res = await fetch(
        `/api/admin/reports/${encodeURIComponent(g.contentId)}/${encodeURIComponent(g.field)}/${what}`,
        { method: 'PATCH' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (what === 'resolve') {
        // `newlyRewarded` маҳз он рақамест, ки идемпотентиро нишон медиҳад:
        // зеркунии ДУЮМ 0 медиҳад — алмоси такрорӣ дода намешавад.
        setStatus({
          type: 'success',
          msg: `Ҳал шуд: ${data.groupSize} гузориш · мукофоти НАВ: ${data.newlyRewarded} `
            + `(×${data.gemsEach} алмос) · огоҳӣ ба ${data.usersNotified} хонанда`,
        });
      } else {
        setStatus({ type: 'success', msg: `Рад шуд: ${data.rejected} гузориш · алмос дода нашуд` });
      }
      await load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e?.message ?? 'Хатогӣ' });
    } finally {
      setBusy(null);
    }
  }

  function langLabel(code: string | null, list: LangFacet[]) {
    if (!code) return null;
    const f = list.find((x) => x.code === code);
    return f ? `${f.flag} ${f.name}` : code;
  }

  const hasFilters =
    !!nativeLang || !!targetLang || !!q.trim() || rating !== null || unreadOnly
    || type !== 'all' || reportStatus !== 'new';

  function clearFilters() {
    setType('all');
    setNativeLang('');
    setTargetLang('');
    setReportStatus('new');
    setRating(null);
    setQ('');
    setQDebounced('');
    setUnreadOnly(false);
    resetPage();
  }

  return (
    <div className="max-w-6xl">
      <div className="fade-up mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Фикри хонандагон</h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl">
            Ҳама чизе, ки хонанда ба мо мефиристад — баҳо, шикоят ва хатоҳое, ки ӯ дар
            дохили дарс байрақ мезанад. Филтр аз рӯи ҷуфти забон нишон медиҳад,
            хато аз кадом забони модарӣ ва кадом забони омӯзишӣ омадааст.
          </p>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:opacity-80"
        >
          <Settings2 size={16} /> Танзимот
        </button>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-up delay-1">
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Ҳамагӣ дар қуттӣ</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{feedbackAll + reportsAll}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {feedbackAll} баҳо · {reportsAll} гузориш
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Фикри хонданашуда</p>
          <p className="text-2xl font-bold text-amber-500">{unreadFeedback}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Хатои ҳалнашуда</p>
          <p className="text-2xl font-bold text-rose-500">{openReports}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Баҳои миёна</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            {averageRating != null ? averageRating.toFixed(2) : '—'}
            <Star size={18} className="text-amber-400 fill-amber-400" />
          </p>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="glass-card p-6 mb-6 fade-up">
          <h2 className="text-base font-semibold mb-2 text-[var(--text-primary)] flex items-center gap-2">
            <Settings2 size={18} className="text-indigo-500" /> Танзимоти пурсиши баҳо
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            {repeat
              ? `Ҳар хонанда пас аз ҳар ${afterLessons} дарс пурсида мешавад (${afterLessons}, ${afterLessons * 2}, ${afterLessons * 3} …), ва ҳар вақт метавонад аз профил нависад.`
              : `Ҳар хонанда як бор — баъди ${afterLessons} дарс — пурсида мешавад, ва ҳар вақт метавонад аз профил нависад.`}
            {' '}Байрақи хатои мазмун ба ин танзимот вобаста НЕСТ — он ҳамеша дар дарс ҳаст.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer md:col-span-2">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Пурсиш фаъол {enabled ? '' : '— дар барнома нишон дода намешавад'}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer md:col-span-2">
              <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Такрорӣ {repeat ? '— пас аз ҳар ' + afterLessons + ' дарс' : '— танҳо як бор дар умр'}
              </span>
            </label>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                {repeat ? 'Фосила: пас аз ҳар чанд дарс' : 'Баъди чанд дарс пурсем'}
              </label>
              <input type="number" min={1} max={500} value={afterLessons}
                onChange={(e) => setAfterLessons(Number(e.target.value))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Матни майдон (placeholder)</label>
              <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Сарлавҳа</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Паём</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Матни ташаккур</label>
              <input type="text" value={thanks} onChange={(e) => setThanks(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={saveSettings} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Сабт…' : 'Сабт кардан'}
            </button>
          </div>
        </div>
      )}

      {/* ── Филтрҳо ───────────────────────────────────────────────────────── */}
      <div className="glass-card p-4 mb-5 fade-up delay-2 space-y-3">
        {/* Навъи паём */}
        <div className="flex flex-wrap items-center gap-2">
          {([
            ['all', <Inbox key="i" size={14} />, 'Ҳама'],
            ['feedback', <MessageSquare key="m" size={14} />, 'Баҳо ва шикоят'],
            ['report', <Flag key="f" size={14} />, 'Хатои мазмун'],
          ] as const).map(([value, icon, label]) => (
            <button
              key={value}
              onClick={() => { setType(value as typeof type); resetPage(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${type === value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)]'}`}
            >
              {icon} {label}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-[var(--bg-border)]" />

          {/* Ҷуфти забон — сабаби асосии ин саҳифа */}
          <select
            value={nativeLang}
            onChange={(e) => { setNativeLang(e.target.value); resetPage(); }}
            className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)]"
            title="Забони модарии хонанда"
          >
            <option value="">Забони модарӣ: ҳама</option>
            {facets.native.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.count})</option>
            ))}
          </select>

          <span className="text-[var(--text-muted)] text-xs">→</span>

          <select
            value={targetLang}
            onChange={(e) => { setTargetLang(e.target.value); resetPage(); }}
            className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)]"
            title="Забоне, ки хонанда меомӯзад"
          >
            <option value="">Забони омӯзишӣ: ҳама</option>
            {facets.target.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.count})</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--bg-border)] text-[var(--text-secondary)] hover:opacity-70"
            >
              <RotateCcw size={13} /> Тоза кардан
            </button>
          )}
        </div>

        {/* Филтрҳои дохилӣ */}
        <div className="flex flex-wrap items-center gap-3">
          {type !== 'feedback' && (
            <select
              value={reportStatus}
              onChange={(e) => { setReportStatus(e.target.value); resetPage(); }}
              className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)]"
              title="Ҳолати гузоришҳои хатои мазмун"
            >
              {['new', 'fixed', 'rejected', 'all'].map((s) => (
                <option key={s} value={s}>Гузориш: {STATUS_LABEL[s]}</option>
              ))}
            </select>
          )}

          {type !== 'report' && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setRating(null); resetPage(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${rating === null ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)]'}`}>
                Баҳо: ҳама
              </button>
              {[5, 4, 3, 2, 1].map((r) => (
                <button key={r} onClick={() => { setRating(r); resetPage(); }}
                  className={`px-2.5 py-1.5 rounded-lg text-sm border ${rating === r ? 'bg-indigo-500 border-indigo-500' : 'bg-[var(--bg-surface)] border-[var(--bg-border)]'}`}
                  title={`${r}`}>
                  {FACES[r - 1]}
                </button>
              ))}
            </div>
          )}

          {type !== 'report' && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
              <input type="checkbox" checked={unreadOnly}
                onChange={(e) => { setUnreadOnly(e.target.checked); resetPage(); }}
                className="w-4 h-4 rounded" />
              Танҳо хонданашуда
            </label>
          )}

          <div className="flex-1 min-w-[180px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text" value={q}
              onChange={(e) => { setQ(e.target.value); resetPage(); }}
              placeholder="Ҷустуҷӯ дар матн, калима ва пешниҳод…"
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Натиҷа */}
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-muted)]">
        <span>
          {loading ? 'Боркунӣ…' : `${total} сатр · ${counts.feedback} баҳо · ${counts.reports} хато`}
          {counts.reportsRaw > counts.reports && ` (аз ${counts.reportsRaw} гузориш)`}
        </span>
        {truncated && <span className="text-amber-500">Танҳо навтарин 3000 сатр сканер шуд.</span>}
      </div>

      {!loading && items.length === 0 && (
        <div className="glass-card p-10 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            Бо ин филтр ҳеҷ чиз ёфт нашуд.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((row) =>
          row.kind === 'feedback' ? (
            <FeedbackCard
              key={row.id}
              row={row}
              onToggleRead={toggleRead}
              nativeLabel={langLabel(row.nativeLang, facets.native)}
              targetLabel={langLabel(row.targetLang, facets.target)}
            />
          ) : (
            <ReportCard
              key={row.id}
              row={row}
              busy={busy === row.id}
              onAct={actOnReport}
              nativeLabel={langLabel(row.nativeLang, facets.native)}
              targetLabel={langLabel(row.targetLang, facets.target)}
            />
          ),
        )}
      </div>

      {items.length < total && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setTake((t) => t + PAGE)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] hover:opacity-80 disabled:opacity-50"
          >
            Бештар нишон додан ({total - items.length})
          </button>
        </div>
      )}
    </div>
  );
}

// ── Тамғаи забон ────────────────────────────────────────────────────────────

function Chip({ children, tone = 'plain' }: { children: React.ReactNode; tone?: 'plain' | 'lang' }) {
  return (
    <span
      className={`px-2 py-1 rounded-md border text-[11px] ${
        tone === 'lang'
          ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500 font-semibold'
          : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-muted)]'
      }`}
    >
      {children}
    </span>
  );
}

function LangPair({ native, target }: { native: string | null; target: string | null }) {
  if (!native && !target) return <Chip>забон номаълум</Chip>;
  return <Chip tone="lang">{native ?? '—'} → {target ?? '—'}</Chip>;
}

// ── Кортҳо ──────────────────────────────────────────────────────────────────

function FeedbackCard({
  row, onToggleRead, nativeLabel, targetLabel,
}: {
  row: FeedbackItem;
  onToggleRead: (r: FeedbackItem) => void;
  nativeLabel: string | null;
  targetLabel: string | null;
}) {
  return (
    <div className={`glass-card p-5 fade-up ${row.isRead ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{FACES[row.rating - 1] ?? '❓'}</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {row.user?.name ?? 'Корбари номаълум'}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Mail size={11} />
              {row.user?.email || row.user?.phone || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {new Date(row.createdAt).toLocaleString()}
          </span>
          <button onClick={() => onToggleRead(row)}
            title={row.isRead ? 'Хонданашуда кардан' : 'Хондашуда кардан'}
            className="p-1.5 rounded-lg border border-[var(--bg-border)] text-[var(--text-muted)] hover:opacity-70">
            {row.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {row.message ? (
        <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-3">
          {row.message}
        </p>
      ) : (
        <p className="text-sm text-[var(--text-muted)] italic mb-3">(танҳо баҳо, бе матн)</p>
      )}

      <div className="flex flex-wrap gap-2">
        <LangPair native={nativeLabel} target={targetLabel} />
        <Chip>{row.source === 'profile' ? 'аз профил' : 'баъди дарс'}</Chip>
        <Chip>{row.lessonsCompleted} дарс</Chip>
        {row.level && <Chip>{row.level}</Chip>}
        {row.platform && <Chip>{row.platform}</Chip>}
      </div>
    </div>
  );
}

function ReportCard({
  row, busy, onAct, nativeLabel, targetLabel,
}: {
  row: ReportItem;
  busy: boolean;
  onAct: (r: ReportItem, what: 'resolve' | 'reject') => void;
  nativeLabel: string | null;
  targetLabel: string | null;
}) {
  // Агар қимати ҶОРИИ база аз он чи хонанда дида буд фарқ кунад, хато аллакай
  // ислоҳ шудааст — гурӯҳро танҳо бастан лозим аст.
  const changed = row.currentValue !== null && row.currentValue !== row.reportedValue;

  return (
    <div className="glass-card p-5 fade-up border-l-2 border-l-rose-500/50">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[11px] font-bold">
            <Flag size={11} /> ХАТОИ МАЗМУН
          </span>
          <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-500 text-[11px] font-bold">
            {fieldLabel(row.field)}
          </span>
          <strong className="text-base text-[var(--text-primary)]">{row.reportedValue}</strong>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date(row.lastAt).toLocaleString()}
        </span>
      </div>

      {row.context && (
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          {row.context.word} → {row.context.translation}
          {row.context.moduleTitle ? ` · ${row.context.moduleTitle}` : ''}
          {row.context.lessonTitle ? ` · ${row.context.lessonTitle}` : ''}
        </p>
      )}

      {row.currentValue !== null && (
        <p className={`text-xs mb-3 ${changed ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
          Ҳоло дар база: <strong>{row.currentValue}</strong>
          {changed ? ' — аллакай тағйир ёфт' : ' — бетағйир'}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <LangPair native={nativeLabel} target={targetLabel} />
        <Chip>{row.userCount} хонанда · {row.reportCount} гузориш</Chip>
        {row.level && <Chip>{row.level}</Chip>}
        {row.exerciseTypes.length > 0 && <Chip>{row.exerciseTypes.join(', ')}</Chip>}
        {row.rewardedCount > 0 && <Chip>{row.rewardedCount} мукофот дода шуд</Chip>}
        <Chip>{STATUS_LABEL[row.status] ?? row.status}</Chip>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(row.reasons).map((r) => (
          <span key={r}
            className="px-2.5 py-1 rounded-lg border border-[var(--bg-border)] text-[11.5px] text-[var(--text-secondary)]">
            {REASON_LABEL[r] ?? r} · {row.reasons[r]}
          </span>
        ))}
      </div>

      {row.suggestions.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] text-[var(--text-muted)] mb-1.5">
            ПЕШНИҲОДИ ХОНАНДАГОН ({row.suggestions.length})
          </p>
          <div className="space-y-1">
            {row.suggestions.map((s, i) => (
              <div key={i}
                className="text-sm px-3 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {s.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {row.status === 'new' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAct(row, 'resolve')}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-green-500 text-[#0A0A14] text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            {busy ? '…' : 'Ҳал шуд · +5 алмос'}
          </button>
          <button
            onClick={() => onAct(row, 'reject')}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-secondary)] hover:opacity-80 disabled:opacity-50"
          >
            Рад кардан
          </button>
        </div>
      )}
    </div>
  );
}
