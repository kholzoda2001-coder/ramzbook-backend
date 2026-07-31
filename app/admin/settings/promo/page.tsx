'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, CheckCircle2, Gift, Clock, Type, Eye } from 'lucide-react';

const PRESETS = [
  { label: '2 months', days: 60 },
  { label: '1 month', days: 30 },
  { label: '14 days', days: 14 },
  { label: '7 days', days: 7 },
];

export default function AdminPromoSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState(60);
  const [eligibleWithinDays, setEligibleWithinDays] = useState(14);
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [cta, setCta] = useState('');
  const [preview, setPreview] = useState<{ badge: string; title: string; message: string; cta: string } | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/promo-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const cfg = data.config;
      setEnabled(cfg.enabled);
      setDays(cfg.days);
      setEligibleWithinDays(cfg.eligibleWithinDays);
      setBadge(cfg.badge);
      setTitle(cfg.title);
      setMessage(cfg.message);
      setCta(cfg.cta);
      setPreview(data.preview ?? null);
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  async function saveConfig() {
    setSaving(true);
    setStatus(null);
    try {
      const payload = { enabled, days, eligibleWithinDays, badge, title, message, cta };
      const res = await fetch('/api/admin/promo-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const cfg = data.config;
      setDays(cfg.days);
      setEligibleWithinDays(cfg.eligibleWithinDays);
      setPreview(data.preview ?? null);
      setStatus({ type: 'success', msg: 'Promo saved — live in the app immediately, no redeploy.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  const months = Math.max(1, Math.round(days / 30));

  return (
    <div className="max-w-5xl">
      <div className="fade-up mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Тӯҳфаи оғоз — Premium ройгон</h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          A gift of full Premium for new users, shown on <strong>every</strong> paywall and on the Premium shop screen.
          This is granted by our own server — not a Google Play trial — which is exactly why the length can be changed
          (or the whole thing switched off) from here without a new app release.
        </p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up delay-1">
        {/* Switch + length */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Gift size={18} className="text-amber-500" /> Offer
          </h2>
          <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Promo enabled {enabled ? '' : '— hidden everywhere'}
              </span>
            </label>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-2">Gift length (days)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setDays(p.days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      days === p.days
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--bg-border)] hover:border-amber-500/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                = {months} month{months === 1 ? '' : 's'} of full Premium (unlimited hearts, unlimited AI, streak freezes).
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Who counts as “new”
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Days after registration (0 = everyone)</label>
              <input
                type="number"
                min={0}
                max={365}
                value={eligibleWithinDays}
                onChange={(e) => setEligibleWithinDays(Number(e.target.value))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <ul className="text-xs text-[var(--text-muted)] leading-relaxed list-disc pl-4 space-y-1">
              <li>Users who are already Premium never see the gift.</li>
              <li>Each user can claim <strong>once, ever</strong> — even after it expires.</li>
              <li>Set to <code>0</code> to open the gift to every non-premium user (useful for a launch week).</li>
            </ul>
          </div>
        </div>

        {/* Copy */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Type size={18} className="text-purple-500" /> Copy (Tajik)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Badge</label>
              <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Button (CTA)</label>
              <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            Placeholders <code>{'{months}'}</code> and <code>{'{days}'}</code> are substituted from the length above — so
            changing 60 → 30 days rewrites “2 моҳ” to “1 моҳ” everywhere by itself. Always use them instead of typing the
            number.
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div className="glass-card p-6 lg:col-span-2">
            <h2 className="text-base font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
              <Eye size={18} className="text-emerald-500" /> What the user sees {enabled ? '' : '(currently hidden — promo is off)'}
            </h2>
            <div className={`rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-400/15 to-transparent p-5 ${enabled ? '' : 'opacity-40'}`}>
              <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[11px] font-black tracking-wide">
                {preview.badge}
              </span>
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{preview.title}</p>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{preview.message}</p>
              <div className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-black">
                🎁 {preview.cta}
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Saved values are shown here — edit a field above and press Save to refresh the preview.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {loading && <span className="text-sm text-[var(--text-muted)]">Loading…</span>}
        <button
          onClick={saveConfig}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Promo'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Gift size={14} /> Changes apply live — the app reads this on every paywall open, no redeploy or app update needed.
      </div>
    </div>
  );
}
