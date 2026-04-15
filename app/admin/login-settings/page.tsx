'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, LayoutGrid, KeyRound, MonitorSmartphone, Smartphone } from 'lucide-react';

export default function AdminLoginSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [googleClientId, setGoogleClientId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState('');
  const [allowMockSocial, setAllowMockSocial] = useState(false);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  async function loadConfig() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/login-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      
      const cfg = data.config;
      setGoogleClientId(cfg.googleClientId);
      setTelegramBotToken(cfg.telegramBotToken);
      setWhatsappSupportNumber(cfg.whatsappSupportNumber ?? '');
      setAllowMockSocial(cfg.allowMockSocial);
      
      setStatus({ type: 'success', msg: 'Login configurations loaded successfully.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        googleClientId,
        telegramBotToken,
        whatsappSupportNumber,
        allowMockSocial,
      };

      const res = await fetch('/api/admin/login-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      
      setStatus({ type: 'success', msg: 'Settings saved successfully.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="fade-up mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Social Login Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Configure API keys for third-party authenticators natively bypassing `.env`.
        </p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Auth Control Removed */}
      <div className="glass-card p-6 mb-8 fade-up delay-1">
        <h2 className="text-base font-semibold mb-4 text-[var(--text-primary)]">Admin Session State</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <p className="flex-1 text-sm text-[var(--text-muted)] flex items-center">
            You are securely authenticated via middleware. Load or save your configurations below.
          </p>
          <button
            onClick={loadConfig}
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-[var(--text-primary)] text-sm font-semibold rounded-lg hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Config'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up delay-2">
        {/* Google Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#ea4335]" /> Google OAuth
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Google Client ID</label>
              <input type="text" value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="xxxx.apps.googleusercontent.com" />
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Google sign-in verifies device tokens sent by Flutter and checks the email scope. Ensure the App&lsquo;s Client ID matches this exact identifier natively.
            </p>
          </div>
        </div>


        {/* Telegram Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <MonitorSmartphone size={18} className="text-[#24A1DE]" /> Telegram Bot
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Bot Token (BotFather)</label>
              <input type="password" value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Used strictly for validation hashing of the Telegram Login Widget payload. Safe since hashing occurs server-side.
            </p>
          </div>
        </div>

        {/* WhatsApp Support Number Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Smartphone size={18} className="text-green-500" /> WhatsApp Support
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">WhatsApp Number</label>
              <input type="text" value={whatsappSupportNumber} onChange={(e) => setWhatsappSupportNumber(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="+992000000000" />
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              The phone number used for the "Subscribe via WhatsApp" button in the mobile app. Format should be international e.g. +992...
            </p>
          </div>
        </div>

        {/* Development Controls */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-500" /> Development Overrides
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={allowMockSocial} 
                onChange={(e) => setAllowMockSocial(e.target.checked)}
                className="w-4 h-4 text-indigo-500 bg-[var(--bg-surface)] border-[var(--bg-border)] rounded"
              />
              <span className="text-sm font-medium text-[var(--text-primary)]">Allow mock social identifiers</span>
            </label>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Checking this bypasses SDK checks and safely auto-creates accounts for mock identifiers. <strong className="text-red-400">WARNING: Highly destructive in open production without VPNs.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
