'use client';

import React, { useState, useEffect } from 'react';
import { Save, DollarSign } from 'lucide-react';


export default function PricingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    TJ: { currency: 'TJS', symbol: 'сом.', monthly: 59, sixmonths: 239, yearly: 399, yearlyOld: 708, lifetime: 799, lifetimeOld: 1200 },
    RU: { currency: 'RUB', symbol: '₽', monthly: 299, sixmonths: 1190, yearly: 1990, yearlyOld: 3588, lifetime: 3990, lifetimeOld: 5990 },
    default: { currency: 'USD', symbol: '$', monthly: 2.99, sixmonths: 6.99, yearly: 10.99, yearlyOld: 16.99, lifetime: 54.99, lifetimeOld: 99.99 }
  });

  useEffect(() => {
    fetch('/api/admin/settings/pricing')
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setConfig(data.config);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load pricing config');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Pricing config saved successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (country: string, field: string, value: string | number) => {
    setConfig((prev: any) => ({
      ...prev,
      [country]: {
        ...prev[country],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-muted)] animate-pulse">Loading settings...</div>;
  }

  const countries = ['TJ', 'RU', 'default'];
  const labels: Record<string, string> = { TJ: 'Tajikistan (TJS)', RU: 'Russia (RUB)', default: 'Rest of World (USD)' };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-8 fade-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Web Pricing Settings</h1>
        <p className="text-[var(--text-muted)]">Configure the subscription prices shown on the website (ramz.tj). These do NOT affect the Google Play mobile app.</p>
      </div>

      <div className="space-y-6 fade-up delay-1">
        {countries.map(country => (
          <div key={country} className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-500" /> {labels[country]}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Currency</label>
                <input type="text" value={config[country]?.currency || ''} onChange={(e) => updateField(country, 'currency', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Symbol</label>
                <input type="text" value={config[country]?.symbol || ''} onChange={(e) => updateField(country, 'symbol', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Monthly</label>
                <input type="number" step="0.01" value={config[country]?.monthly || 0} onChange={(e) => updateField(country, 'monthly', parseFloat(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">6 Months</label>
                <input type="number" step="0.01" value={config[country]?.sixmonths || 0} onChange={(e) => updateField(country, 'sixmonths', parseFloat(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Yearly</label>
                <input type="number" step="0.01" value={config[country]?.yearly || 0} onChange={(e) => updateField(country, 'yearly', parseFloat(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Lifetime</label>
                <input type="number" step="0.01" value={config[country]?.lifetime || 0} onChange={(e) => updateField(country, 'lifetime', parseFloat(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Prices'}
        </button>
      </div>
    </div>
  );
}
