'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };

export default function NewLanguagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', nativeName: '', code: '', flag: '',
    canBeNative: true, canBeTarget: true,
    badge: '', learnerCount: '', order: 0, isActive: true,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, badge: form.badge || null, learnerCount: form.learnerCount || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      router.push('/admin/languages');
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
        <Link href="/admin/languages" style={{ color: 'var(--text3)' }}>Забонҳои Модарӣ</Link> › Забони нав
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Забони нав</h1>

      <form onSubmit={submit} className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
          <div><label style={LABEL}>Ном (англисӣ)</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Kazakh" style={FIELD} /></div>
          <div><label style={LABEL}>Номи бумӣ (endonym)</label><input required value={form.nativeName} onChange={e => setForm(f => ({ ...f, nativeName: e.target.value }))} placeholder="Қазақ" style={FIELD} /></div>
          <div><label style={LABEL}>Код (ISO)</label><input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="kk" style={FIELD} /></div>
          <div><label style={LABEL}>Парчам (эмоҷи)</label><input required value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇰🇿" style={FIELD} /></div>
          <div>
            <label style={LABEL}>Нишон (badge)</label>
            <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} style={FIELD}>
              <option value="">Ҳеҷ</option><option value="HOT">HOT</option><option value="LIVE">LIVE</option><option value="SOON">SOON</option>
            </select>
          </div>
          <div><label style={LABEL}>Шумораи омӯзандагон</label><input value={form.learnerCount} onChange={e => setForm(f => ({ ...f, learnerCount: e.target.value }))} placeholder="1.5B learners" style={FIELD} /></div>
          <div><label style={LABEL}>Тартиб</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} style={FIELD} /></div>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginTop: '18px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.canBeNative} onChange={e => setForm(f => ({ ...f, canBeNative: e.target.checked }))} /> Метавонад модарӣ бошад (UI)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.canBeTarget} onChange={e => setForm(f => ({ ...f, canBeTarget: e.target.checked }))} /> Метавонад омӯхта шавад
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Фаъол
          </label>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳…' : '✅ Сохтан'}
          </button>
          <Link href="/admin/languages" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', textDecoration: 'none' }}>Бекор кардан</Link>
        </div>
      </form>
    </div>
  );
}
