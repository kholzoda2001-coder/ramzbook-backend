'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, CheckCircle2, Bot, KeyRound, Gauge, MessageSquare } from 'lucide-react';

export default function AdminAiSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [freeLimit, setFreeLimit] = useState(3);
  const [premiumLimit, setPremiumLimit] = useState(20);
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

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
      const res = await fetch('/api/admin/ai-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const cfg = data.config;
      setEnabled(cfg.enabled);
      setFreeLimit(cfg.freeLimit);
      setPremiumLimit(cfg.premiumLimit);
      setModel(cfg.model);
      setApiKey(cfg.apiKey); // masked ('***MASKED***') if a key is stored
      setSystemPrompt(cfg.systemPrompt);
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
      const payload = { enabled, freeLimit, premiumLimit, model, apiKey, systemPrompt };
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      // Re-sync from the masked response so the key field shows the mask, not raw input.
      const cfg = data.config;
      setApiKey(cfg.apiKey);
      setStatus({ type: 'success', msg: 'AI settings saved successfully.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="fade-up mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">AI Tutor Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Configure the OpenAI-powered chat tutor: daily limits, model, API key and persona.
        </p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up delay-1">
        {/* Availability + limits */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Gauge size={18} className="text-indigo-500" /> Availability &amp; Limits
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-[var(--text-primary)]">AI Tutor enabled</span>
            </label>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Free messages / day</label>
              <input type="number" min={0} value={freeLimit} onChange={(e) => setFreeLimit(Number(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Premium messages / day</label>
              <input type="number" min={0} value={premiumLimit} onChange={(e) => setPremiumLimit(Number(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
          </div>
        </div>

        {/* Model + key */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <KeyRound size={18} className="text-emerald-500" /> OpenAI
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="gpt-4o-mini" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="sk-..." />
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Stored server-side and masked on read. Leave the mask (***MASKED***) untouched to keep the existing key.
                Falls back to the <code>OPENAI_API_KEY</code> env var if empty.
              </p>
            </div>
          </div>
        </div>

        {/* Persona */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-500" /> System Prompt (persona)
          </h2>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
          />
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            Placeholders <code>{'{target}'}</code>, <code>{'{native}'}</code>, <code>{'{level}'}</code> are substituted per user at call time.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {loading && <span className="text-sm text-[var(--text-muted)]">Loading…</span>}
        <button
          onClick={saveConfig}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Bot size={14} /> Bot replies use these settings live — no redeploy needed for limit/model/prompt changes.
      </div>
    </div>
  );
}
