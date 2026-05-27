'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lang { id: string; name: string; nativeName: string; flag: string; }

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };

export default function NewCoursePage() {
  const router = useRouter();
  const [natives, setNatives] = useState<Lang[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    targetName: '', targetCode: '', targetFlag: '', 
    nativeLanguageId: '', level: 'A1',
    title: '', description: '', emoji: '📚', color: '#14B8A6', order: 0,
  });

  useEffect(() => {
    fetch('/api/admin/languages').then(r => r.json()).then(d => {
      const langs: any[] = d.languages ?? [];
      setNatives(langs.filter(l => l.canBeNative));
    });
  }, []);

  const native = natives.find(l => l.id === form.nativeLanguageId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      router.push('/admin/courses');
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
        <Link href="/admin/courses" style={{ color: 'var(--text3)' }}>Забонҳои Омӯзишӣ</Link> › Забони нави омӯзишӣ
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Забони нави омӯзишӣ</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        Аввал ҷуфти забонро интихоб кунед (забоне ки меомӯзанд + забони модарии онҳо), сипас тафсилотро пур кунед.
      </p>

      {form.targetName && native && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '14px' }}>
          Омӯзиши <b>{form.targetFlag} {form.targetName}</b> барои тоифаи <b>{native.flag} {native.nativeName}</b>
        </div>
      )}

      <form onSubmit={submit} className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
          <div>
            <label style={LABEL}>1. Забони омӯзишӣ (Мас: English)</label>
            <input required value={form.targetName} onChange={e => setForm(f => ({ ...f, targetName: e.target.value }))} placeholder="English" style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>Коди забон (Мас: en)</label>
            <input required value={form.targetCode} onChange={e => setForm(f => ({ ...f, targetCode: e.target.value }))} placeholder="en" style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>Парчами забон (Мас: 🇬🇧)</label>
            <input required value={form.targetFlag} onChange={e => setForm(f => ({ ...f, targetFlag: e.target.value }))} placeholder="🇬🇧" style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>2. Забони модарӣ (Бо кадом забон мефаҳмонед?)</label>
            <select required value={form.nativeLanguageId} onChange={e => setForm(f => ({ ...f, nativeLanguageId: e.target.value }))} style={FIELD}>
              <option value="">Интихоб кунед…</option>
              {natives.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Сатҳ</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={FIELD}>
              {['A1', 'A2', 'B1', 'B2', 'C1'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Сарлавҳа (бо забони модарӣ)</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Забони англисӣ — A1" style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>Эмоҷи</label>
            <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>Ранг (hex)</label>
            <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={FIELD} />
          </div>
          <div>
            <label style={LABEL}>Тартиб</label>
            <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} style={FIELD} />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={LABEL}>Тавсиф</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...FIELD, resize: 'vertical' }} />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳…' : '✅ Сохтан'}
          </button>
          <Link href="/admin/courses" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', textDecoration: 'none' }}>
            Бекор кардан
          </Link>
        </div>
      </form>
    </div>
  );
}
