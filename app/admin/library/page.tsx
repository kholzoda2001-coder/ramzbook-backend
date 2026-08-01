'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Headphones, Video, FileText, Plus, Save, Trash2,
  AlertCircle, CheckCircle2, X, Eye, EyeOff, ChevronUp, ChevronDown, Sparkles,
} from 'lucide-react';

const TYPES = [
  { key: 'book', label: 'Китоб', icon: BookOpen, color: 'text-teal-500' },
  { key: 'audio', label: 'Аудиокитоб', icon: Headphones, color: 'text-purple-500' },
  { key: 'video', label: 'Видео-курс', icon: Video, color: 'text-red-500' },
  { key: 'template', label: 'Шаблон', icon: FileText, color: 'text-amber-500' },
] as const;

const LEVELS = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface Page {
  id?: string;
  order: number;
  title: string;
  content: string;
  imageUrl: string;
}

interface Item {
  id: string;
  type: string;
  title: string;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  level: string | null;
  targetLang: string | null;
  mediaUrl: string | null;
  durationMin: number | null;
  rating: number | null;
  isPremium: boolean;
  isActive: boolean;
  order: number;
  pageCount?: number;
  pages?: Page[];
}

const EMPTY: Item = {
  id: '', type: 'book', title: '', author: '', description: '', coverUrl: '',
  level: '', targetLang: 'en', mediaUrl: '', durationMin: null, rating: null,
  isPremium: false, isActive: true, order: 0, pages: [],
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [filter, setFilter] = useState<string>('');

  const [editing, setEditing] = useState<Item | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [seeding, setSeeding] = useState(false);
  // Direct-to-Blob upload progress (null = no upload running).
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/library${filter ? `?type=${filter}` : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItems(data.items ?? []);
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function openEdit(id: string) {
    try {
      const res = await fetch(`/api/admin/library/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const it = data.item as Item;
      setEditing({ ...it, author: it.author ?? '', description: it.description ?? '', coverUrl: it.coverUrl ?? '', level: it.level ?? '', targetLang: it.targetLang ?? '', mediaUrl: it.mediaUrl ?? '' });
      setPages((it.pages ?? []).map((p, i) => ({
        order: p.order ?? i, title: p.title ?? '', content: p.content ?? '', imageUrl: p.imageUrl ?? '',
      })));
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  }

  function openNew() {
    setEditing({ ...EMPTY });
    setPages([]);
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) {
      setStatus({ type: 'error', msg: 'Сарлавҳа холӣ буда наметавонад.' });
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        ...editing,
        durationMin: editing.durationMin === null || (editing.durationMin as any) === '' ? null : Number(editing.durationMin),
        rating: editing.rating === null || (editing.rating as any) === '' ? null : Number(editing.rating),
        pages: pages.map((p, i) => ({ ...p, order: i })),
      };
      delete body.pageCount;
      const isNew = !editing.id;
      if (isNew) delete body.id;

      const res = await fetch(isNew ? '/api/admin/library' : `/api/admin/library/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ type: 'success', msg: isNew ? 'Илова шуд.' : 'Сабт шуд.' });
      setEditing(null);
      setPages([]);
      load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Сабт нашуд.' });
    } finally {
      setSaving(false);
    }
  }

  /// Fills the shelf with the demo set. Idempotent server-side — pressing it
  /// twice adds nothing new, so it is safe to click when unsure.
  async function seedDemo() {
    if (!confirm('Мазмуни намунавӣ (5 китоб, шаблон, аудио, видео) илова карда шавад?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/library/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({
        type: 'success',
        msg: `Илова шуд: ${data.created}. Аллакай мавҷуд буд: ${data.skipped}.`,
      });
      load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Илова нашуд.' });
    } finally {
      setSeeding(false);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`«${item.title}»-ро нест кунем? Ин амал бебозгашт аст.`)) return;
    try {
      const res = await fetch(`/api/admin/library/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ type: 'success', msg: 'Нест карда шуд.' });
      if (editing?.id === item.id) setEditing(null);
      load();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    }
  }

  async function toggleActive(item: Item) {
    try {
      await fetch(`/api/admin/library/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)));
    } catch {/* non-critical */}
  }

  function movePage(idx: number, dir: -1 | 1) {
    const next = [...pages];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    setPages(next);
  }

  /**
   * Uploads a big file (EPUB / audio) STRAIGHT from the browser to Blob storage.
   * Going through /api/admin/upload would cap us at Vercel's ~4.5 MB request-body
   * limit; this route only hands out a short-lived token, so the bytes bypass the
   * serverless function entirely.
   */
  async function uploadBig(file: File) {
    if (!editing) return;
    setUploadPct(0);
    try {
      const { upload } = await import('@vercel/blob/client');
      const isEpub = file.name.toLowerCase().endsWith('.epub');
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      const blob = await upload(`${isEpub ? 'books' : 'audio'}/${safe}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload/blob',
        onUploadProgress: (p) => setUploadPct(Math.round(p.percentage)),
      });
      setEditing((prev) => (prev ? { ...prev, mediaUrl: blob.url } : prev));
      setStatus({ type: 'success', msg: 'Файл бор шуд.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e?.message || 'Бор кардан нашуд.' });
    } finally {
      setUploadPct(null);
    }
  }

  /** youtu.be/ID, youtube.com/watch?v=ID and /embed/ID all count as valid. */
  const youtubeOk = (url: string) =>
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/.test(url);

  const isBook = editing?.type === 'book';
  const isAudio = editing?.type === 'audio';
  const isVideo = editing?.type === 'video';
  const hasEpub = isBook && !!editing?.mediaUrl;
  // Hand-written pages only make sense when there is no EPUB file driving the book.
  const hasPages = (isBook && !hasEpub) || editing?.type === 'template';
  const input = 'w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]';
  const label = 'block text-xs text-[var(--text-muted)] mb-1';

  return (
    <div className="max-w-6xl">
      <div className="fade-up mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Китобхона</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Китобҳо, аудиокитобҳо, видео-курсҳо ва шаблонҳо. Ҳама чиз аз ин ҷо идора мешавад — дар барнома ҳеҷ чиз сахткод нашудааст.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={seedDemo} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-primary)] hover:opacity-80 disabled:opacity-50">
            <Sparkles size={16} /> {seeding ? 'Илова…' : 'Мазмуни демо'}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90">
            <Plus size={17} /> Илова кардан
          </button>
        </div>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Editor */}
      {editing && (
        <div className="glass-card p-6 mb-6 fade-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {editing.id ? 'Таҳрир' : 'Воҳиди нав'}
            </h2>
            <button onClick={() => { setEditing(null); setPages([]); }}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:opacity-70"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Навъ</label>
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={input}>
                {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={label}>Сарлавҳа *</label>
              <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={input} />
            </div>

            <div>
              <label className={label}>Муаллиф</label>
              <input type="text" value={editing.author ?? ''} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className={input} />
            </div>
            <div>
              <label className={label}>Сатҳ</label>
              <select value={editing.level ?? ''} onChange={(e) => setEditing({ ...editing, level: e.target.value })} className={input}>
                {LEVELS.map((l) => <option key={l} value={l}>{l || '— ҳама —'}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Забон (мас. en)</label>
              <input type="text" value={editing.targetLang ?? ''} onChange={(e) => setEditing({ ...editing, targetLang: e.target.value })} className={input} placeholder="холӣ = ҳама" />
            </div>

            <div className="md:col-span-3">
              <label className={label}>Тавсиф</label>
              <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className={input} />
            </div>

            <div className="md:col-span-2">
              <label className={label}>URL-и муқова (расм)</label>
              <input type="text" value={editing.coverUrl ?? ''} onChange={(e) => setEditing({ ...editing, coverUrl: e.target.value })} className={input} placeholder="https://…" />
            </div>
            <div>
              <label className={label}>Тартиб</label>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={input} />
            </div>

            {/* ── Файл / истинод вобаста ба навъ ─────────────────────────── */}
            {(isBook || isAudio) && (
              <div className="md:col-span-3">
                <label className={label}>
                  {isBook ? 'Файли китоб (EPUB)' : 'Файли аудио (MP3)'}
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="cursor-pointer px-4 py-2 rounded-lg border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-primary)] hover:opacity-80">
                    {uploadPct === null ? 'Файл интихоб кунед' : `Бор шуда истодааст… ${uploadPct}%`}
                    <input
                      type="file"
                      accept={isBook ? '.epub,application/epub+zip' : 'audio/*,.mp3,.m4a'}
                      disabled={uploadPct !== null}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadBig(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {editing.mediaUrl && (
                    <>
                      <a href={editing.mediaUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-teal-500 underline break-all max-w-[320px]">
                        {editing.mediaUrl.split('/').pop()}
                      </a>
                      <button
                        onClick={() => setEditing({ ...editing, mediaUrl: '' })}
                        className="text-xs text-red-500 hover:opacity-70">
                        нест кардан
                      </button>
                    </>
                  )}
                </div>
                {uploadPct !== null && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div className="h-full bg-teal-500 transition-all" style={{ width: `${uploadPct}%` }} />
                  </div>
                )}
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {isBook
                    ? 'Файли EPUB бор кунед — хонанда онро дар дохили барнома мехонад. Агар EPUB бор кунед, саҳифаҳои дастӣ лозим намешаванд.'
                    : 'Файли MP3 бор кунед — дар барнома плеер мебарояд. То 60MB.'}
                </p>
              </div>
            )}

            {isVideo && (
              <div className="md:col-span-3">
                <label className={label}>Истиноди YouTube *</label>
                <input
                  type="text"
                  value={editing.mediaUrl ?? ''}
                  onChange={(e) => setEditing({ ...editing, mediaUrl: e.target.value })}
                  className={input}
                  placeholder="https://youtu.be/… ё https://youtube.com/watch?v=…"
                />
                <p className={`mt-1.5 text-xs ${
                  !editing.mediaUrl ? 'text-[var(--text-muted)]'
                    : youtubeOk(editing.mediaUrl) ? 'text-green-600' : 'text-red-500'
                }`}>
                  {!editing.mediaUrl
                    ? 'Видеоро ба YouTube ҳамчун «unlisted» бор кунед — трафик ройгон аст ва хонанда онро дар дохили барнома тамошо мекунад.'
                    : youtubeOk(editing.mediaUrl) ? 'Истинод дуруст аст ✓' : 'Ин истиноди YouTube нест — барнома онро бозӣ карда наметавонад.'}
                </p>
              </div>
            )}

            {(isAudio || isVideo) && (
              <div>
                <label className={label}>Давомнокӣ (дақиқа)</label>
                <input type="number" min={0} value={editing.durationMin ?? ''} onChange={(e) => setEditing({ ...editing, durationMin: e.target.value === '' ? null : Number(e.target.value) })} className={input} />
              </div>
            )}

            <div className="flex items-center gap-5 md:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                Фаъол (дар барнома намоён)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
                <input type="checkbox" checked={editing.isPremium} onChange={(e) => setEditing({ ...editing, isPremium: e.target.checked })} className="w-4 h-4 rounded" />
                Танҳо барои Premium
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Баҳо</span>
                <input type="number" step="0.1" min={0} max={5} value={editing.rating ?? ''} onChange={(e) => setEditing({ ...editing, rating: e.target.value === '' ? null : Number(e.target.value) })} className="w-20 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--text-primary)]" />
              </div>
            </div>
          </div>

          {/* Pages */}
          {hasPages && (
            <div className="mt-7 border-t border-[var(--bg-border)] pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Саҳифаҳо ({pages.length})
                </h3>
                <button onClick={() => setPages([...pages, { order: pages.length, title: '', content: '', imageUrl: '' }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--bg-border)] text-xs font-semibold text-[var(--text-primary)] hover:opacity-70">
                  <Plus size={14} /> Саҳифа
                </button>
              </div>

              <div className="space-y-3">
                {pages.map((p, i) => (
                  <div key={i} className="border border-[var(--bg-border)] rounded-xl p-4 bg-[var(--bg-surface)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-[var(--text-muted)] w-8">#{i + 1}</span>
                      <input type="text" value={p.title} placeholder="Сарлавҳаи саҳифа (ихтиёрӣ)"
                        onChange={(e) => setPages(pages.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                        className="flex-1 bg-transparent border-b border-[var(--bg-border)] px-1 py-1 text-sm text-[var(--text-primary)]" />
                      <button onClick={() => movePage(i, -1)} className="p-1.5 text-[var(--text-muted)] hover:opacity-70"><ChevronUp size={15} /></button>
                      <button onClick={() => movePage(i, 1)} className="p-1.5 text-[var(--text-muted)] hover:opacity-70"><ChevronDown size={15} /></button>
                      <button onClick={() => setPages(pages.filter((_, j) => j !== i))} className="p-1.5 text-red-500 hover:opacity-70"><Trash2 size={15} /></button>
                    </div>
                    <textarea value={p.content} rows={5} placeholder="Матни саҳифа…"
                      onChange={(e) => setPages(pages.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))}
                      className={input} />
                    <input type="text" value={p.imageUrl} placeholder="URL-и расми саҳифа (ихтиёрӣ)"
                      onChange={(e) => setPages(pages.map((x, j) => (j === i ? { ...x, imageUrl: e.target.value } : x)))}
                      className={`${input} mt-2`} />
                  </div>
                ))}
                {pages.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] py-4 text-center">Ҳанӯз саҳифа нест.</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => { setEditing(null); setPages([]); }}
              className="px-5 py-2.5 rounded-xl border border-[var(--bg-border)] text-sm font-semibold text-[var(--text-secondary)]">
              Бекор
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Сабт…' : 'Сабт кардан'}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5 fade-up delay-1">
        <button onClick={() => setFilter('')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${filter === '' ? 'bg-teal-500 text-white border-teal-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)]'}`}>
          Ҳама
        </button>
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${filter === t.key ? 'bg-teal-500 text-white border-teal-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)] mb-4">Боркунӣ…</p>}

      {!loading && items.length === 0 && (
        <div className="glass-card p-10 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">Ҳанӯз чизе нест — «Илова кардан»-ро пахш кунед.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((it) => {
          const t = TYPES.find((x) => x.key === it.type) ?? TYPES[0];
          const Icon = t.icon;
          return (
            <div key={it.id} className={`glass-card p-4 flex items-center gap-4 fade-up ${it.isActive ? '' : 'opacity-50'}`}>
              {it.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg border border-[var(--bg-border)]" />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center justify-center">
                  <Icon size={20} className={t.color} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon size={14} className={t.color} />
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{it.title}</p>
                  {it.isPremium && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600">PREMIUM</span>}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {[t.label, it.author, it.level, it.targetLang,
                    it.pageCount ? `${it.pageCount} саҳифа` : null,
                    it.durationMin ? `${it.durationMin} дақ` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>

              <button onClick={() => toggleActive(it)} title={it.isActive ? 'Пинҳон кардан' : 'Фаъол кардан'}
                className="p-2 rounded-lg border border-[var(--bg-border)] text-[var(--text-muted)] hover:opacity-70">
                {it.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button onClick={() => openEdit(it.id)}
                className="px-3 py-2 rounded-lg border border-[var(--bg-border)] text-xs font-semibold text-[var(--text-primary)] hover:opacity-70">
                Таҳрир
              </button>
              <button onClick={() => remove(it)}
                className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:opacity-70">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
