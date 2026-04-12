'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Mail, MessageSquare, Server, Send } from 'lucide-react';

type EmailProvider = 'mock' | 'smtp' | 'rabbitmq';
type PhoneProvider = 'mock' | 'twilio' | 'rabbitmq';

export default function AdminOtpSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const [activeEmail, setActiveEmail] = useState<EmailProvider>('mock');
  const [activePhone, setActivePhone] = useState<PhoneProvider>('mock');

  const [smtp, setSmtp] = useState({ host: '', port: 465, secure: true, user: '', pass: '', fromName: '' });
  const [twilio, setTwilio] = useState({ accountSid: '', authToken: '', messagingServiceSid: '', fromNumber: '' });
  const [rabbitmq, setRabbitmq] = useState({ host: 'localhost', port: 5672, username: '', password: '', exchange: '', routingKey: '', routingKeyPhone: '' });

  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [testSmsTarget, setTestSmsTarget] = useState('');
  const [testLoading, setTestLoading] = useState(false);

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
      const res = await fetch('/api/admin/auth-providers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const cfg = data.config;
      setActiveEmail(cfg.activeEmailProvider);
      setActivePhone(cfg.activePhoneProvider);
      setSmtp({ ...smtp, ...cfg.smtp });
      setTwilio({ ...twilio, ...cfg.twilio });
      setRabbitmq({ ...rabbitmq, ...cfg.rabbitmq });

      setStatus({ type: 'success', msg: 'Configuration loaded successfully.' });
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
        activeEmailProvider: activeEmail,
        activePhoneProvider: activePhone,
        smtp: { ...smtp, port: Number(smtp.port) },
        twilio,
        rabbitmq: { ...rabbitmq, port: Number(rabbitmq.port) }
      };

      const res = await fetch('/api/admin/auth-providers', {
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

  async function handleTestEmail() {
    if (!testEmailTarget) return setStatus({ type: 'error', msg: 'Please provide a target email address.' });
    setTestLoading(true);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeEmail, to: testEmailTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ type: 'success', msg: data.message || 'Test email sent.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setTestLoading(false);
    }
  }

  async function handleTestSms() {
    if (!testSmsTarget) return setStatus({ type: 'error', msg: 'Please provide a target phone number.' });
    setTestLoading(true);
    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activePhone, to: testSmsTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ type: 'success', msg: data.message || 'Test SMS sent.' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="fade-up mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">OTP Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Configure email and SMS delivery mechanisms for OTP codes.
        </p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-up ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-600' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Removed Admin Session Control since middleware handles auth */}

      <div className="glass-card p-6 mb-8 fade-up delay-1">
        <h2 className="text-base font-semibold mb-4 text-[var(--text-primary)]">Admin Session State</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <p className="flex-1 text-sm text-[var(--text-muted)] flex items-center">
            You are securely authenticated. Load or save configuration parameters.
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
        {/* Active Providers */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Server size={18} className="text-indigo-500" /> Active Providers
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email OTP Provider</label>
              <select
                value={activeEmail}
                onChange={(e) => setActiveEmail(e.target.value as EmailProvider)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500"
              >
                <option value="mock">Mock Delivery</option>
                <option value="smtp">SMTP / Hostinger</option>
                <option value="rabbitmq">RabbitMQ Queue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Phone OTP Provider</label>
              <select
                value={activePhone}
                onChange={(e) => setActivePhone(e.target.value as PhoneProvider)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500"
              >
                <option value="mock">Mock Delivery</option>
                <option value="twilio">Twilio SMS</option>
                <option value="rabbitmq">RabbitMQ Queue</option>
              </select>
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <Mail size={18} className="text-indigo-500" /> SMTP Config (Email)
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Host</label>
                <input type="text" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="smtp.hostinger.com" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Port</label>
                <input type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">User / From Email</label>
              <input type="text" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Password</label>
              <input type="password" value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">From Name</label>
              <input type="text" value={smtp.fromName} onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
          </div>
        </div>

        {/* Twilio Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" /> Twilio Config (SMS)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Account SID</label>
              <input type="text" value={twilio.accountSid} onChange={(e) => setTwilio({ ...twilio, accountSid: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Auth Token</label>
              <input type="password" value={twilio.authToken} onChange={(e) => setTwilio({ ...twilio, authToken: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">From Number / Messaging SID</label>
              <input type="text" value={twilio.fromNumber} onChange={(e) => setTwilio({ ...twilio, fromNumber: e.target.value })} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="+1234567890" />
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <Send size={18} className="text-indigo-500" /> Connection Tests
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
              Test your active providers directly from the server. Ensure you have loaded and saved your configuration before testing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Test Email Target..." value={testEmailTarget} onChange={(e) => setTestEmailTarget(e.target.value)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleTestEmail} disabled={testLoading} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50">Email</button>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Test SMS Target..." value={testSmsTarget} onChange={(e) => setTestSmsTarget(e.target.value)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleTestSms} disabled={testLoading} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50">SMS</button>
            </div>
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
