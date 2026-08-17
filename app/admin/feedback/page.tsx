'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Star, Save, AlertCircle, CheckCircle2,
  Search, Mail, Settings2, Eye, EyeOff,
} from 'lucide-react';

const FACES = ['😠', '🙁', '😐', '🙂', '😍'];

interface FeedbackRow {
  id: string;
  rating: number;
  message: string | null;
  source: string;
  lessonsCompleted: number;
  level: string | null;
  targetLang: string | null;
  platform: string | null;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string | null; phone: string | null } | null;
}

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const [rating, setRating] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

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
      const t = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rating) params.set('rating', String(rating));
      if (q.trim()) params.set('q', q.trim());
      if (unreadOnly) params.set('unreadOnly', '1');
      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setUnread(data.unread ?? 0);
      setAverageRating(data.averageRating ?? null);
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }, [rating, q, unreadOnly]);

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

  async function toggleRead(row: FeedbackRow) {
    try {
      await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, isRead: !row.isRead }),
      });
      setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, isRead: !r.isRead } : r)));
      setUnread((u) => Math.max(0, u + (row.isRead ? 1 : -1)));
    } catch {/* non-critical */}
  }

  return (
    <div className="max-w-6xl">
      <div className="fade-up mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Фикри хонандагон</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {repeat
              ? `Ҳар хонанда пас аз ҳар ${afterLessons} дарс пурсида мешавад (${afterLessons}, ${afterLessons * 2}, ${afterLessons * 3} …), ва ҳар вақт метавонад аз профил нависад.`
              : `Ҳар хонанда як бор — баъди ${afterLessons} дарс — пурсида мешавад, ва ҳар вақт метавонад аз профил нависад.`}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 fade-up delay-1">
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Ҳамагӣ</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Хонданашуда</p>
          <p className="text-2xl font-bold text-amber-500">{unread}</p>
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
          <h2 className="text-base font-semibold mb-5 text-[var(--text-primary)] flex items-center gap-2">
            <Settings2 size={18} className="text-indigo-500" /> Танзимоти пурсиш
          </h2>
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

      {/* Filters */}
      <div className="glass-card p-4 mb-5 fade-up delay-2 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setRating(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${rating === null ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)]'}`}>
            Ҳама
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => setRating(r)}
              className={`px-2.5 py-1.5 rounded-lg text-sm border ${rating === r ? 'bg-indigo-500 border-indigo-500' : 'bg-[var(--bg-surface)] border-[var(--bg-border)]'}`}
              title={`${r}`}>
              {FACES[r - 1]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="w-4 h-4 rounded" />
          Танҳо хонданашуда
        </label>

        <div className="flex-1 min-w-[180px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Ҷустуҷӯ дар матн…"
            className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* List */}
      {loading && <p className="text-sm text-[var(--text-muted)] mb-4">Боркунӣ…</p>}

      {!loading && items.length === 0 && (
        <div className="glass-card p-10 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">Ҳанӯз фикре нест.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((row) => (
          <div key={row.id}
            className={`glass-card p-5 fade-up ${row.isRead ? 'opacity-70' : ''}`}>
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
                <button onClick={() => toggleRead(row)}
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

            <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
              <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--bg-border)]">
                {row.source === 'profile' ? 'аз профил' : 'баъди дарс'}
              </span>
              <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--bg-border)]">
                {row.lessonsCompleted} дарс
              </span>
              {row.level && (
                <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--bg-border)]">{row.level}</span>
              )}
              {row.targetLang && (
                <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--bg-border)]">{row.targetLang}</span>
              )}
              {row.platform && (
                <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--bg-border)]">{row.platform}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
