'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { CEFR_LEVELS } from '@/lib/cefr';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' };
const SMALL_DEL: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' };

interface Course { id: string; level: string; emoji: string; targetLanguage: { flag: string; name: string }; nativeLanguage: { flag: string; nativeName: string }; }
interface Collection { id: string; title: string; titleTranslated: string; category: string | null; emoji: string; cefrLevel: string | null; isPremium: boolean; isActive: boolean; order: number; _count?: { phrases: number }; }
interface Phrase { id: string; text: string; translation: string; literal: string | null; note: string | null; audioUrl: string | null; }
interface CollectionDetail extends Collection { phrases: Phrase[]; }

const EMPTY_COLLECTION = { title: '', titleTranslated: '', category: '', cefrLevel: '', emoji: '💬', isPremium: false };

function PhrasesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COLLECTION);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<CollectionDetail | null>(null);

  const fetchCourses = useCallback(async () => {
    try { const r = await fetch('/api/admin/courses'); const d = await r.json(); setCourses(d.courses ?? []); } catch {}
  }, []);
  const fetchCollections = useCallback(async () => {
    if (!courseId) { setCollections([]); return; }
    setLoading(true);
    try { const r = await fetch(`/api/admin/phrases?courseId=${courseId}`); const d = await r.json(); setCollections(d.collections ?? []); }
    catch { setCollections([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchCollections(); setDetail(null); }, [fetchCollections]);

  async function createCollection(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch('/api/admin/phrases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, courseId, cefrLevel: form.cefrLevel || null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setForm(EMPTY_COLLECTION); setShowForm(false); fetchCollections();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteCollection(id: string, title: string) {
    if (!confirm(`Маҷмӯаи "${title}" нест карда шавад? Ҳамаи ибораҳои он низ нест мешаванд.`)) return;
    try { const r = await fetch(`/api/admin/phrases/${id}`, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } if (detail?.id === id) setDetail(null); fetchCollections(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/phrases/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.collection); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) openDetail(detail.id); fetchCollections(); }

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>💬 Ибораҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Маҷмӯаҳои ибораҳои тайёр (саломҳо, сафар…) — барои ҳар курс</p>
        </div>
        {courseId && (
          <button onClick={() => setShowForm(!showForm)} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Маҷмӯаи нав</button>
        )}
      </div>

      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{ ...FIELD, maxWidth: 360 }}>
          <option value="">🌐 Курсро интихоб кунед…</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.targetLanguage.flag} {c.targetLanguage.name} → {c.nativeLanguage.flag} {c.nativeLanguage.nativeName} · {c.level}</option>
          ))}
        </select>
      </div>

      {showForm && courseId && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Маҷмӯаи ибораҳои нав</h3>
          <form onSubmit={createCollection}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="At the Restaurant" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={form.titleTranslated} onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Дар тарабхона" style={FIELD} /></div>
              <div><label style={LABEL}>Категория</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="travel" style={FIELD} /></div>
              <div><label style={LABEL}>Эмоҷи</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="💬" style={FIELD} /></div>
              <div><label style={LABEL}>Сатҳи CEFR</label>
                <select value={form.cefrLevel} onChange={e => setForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  <option value="">↪ Аз курс мерос мегирад</option>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_COLLECTION); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!courseId ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗂️</div>
          <p>Барои дидани маҷмӯаҳои ибораҳо як курс интихоб кунед.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.4fr' : '1fr', gap: '20px' }}>
          {/* Collections list */}
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : collections.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон маҷмӯа нест.</div>
            ) : collections.map(col => (
              <div key={col.id} onClick={() => openDetail(col.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: detail?.id === col.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '20px' }}>{col.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{col.title} {col.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{col.titleTranslated} · {col.cefrLevel ?? '—'}{col.category ? ` · ${col.category}` : ''} · 💬{col._count?.phrases ?? 0}</div>
                </div>
                <button onClick={ev => { ev.stopPropagation(); deleteCollection(col.id, col.title); }} style={SMALL_DEL}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Detail editor */}
          {detail && <CollectionEditor key={detail.id} detail={detail} onChange={reloadDetail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </div>
  );
}

function CollectionEditor({ detail, onChange, onClose }: { detail: CollectionDetail; onChange: () => void; onClose: () => void }) {
  const [pForm, setPForm] = useState({ text: '', translation: '', literal: '', note: '' });

  async function post(url: string, body: unknown) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ'); return d;
  }
  async function del(url: string) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } }

  async function addPhrase() {
    try { await post('/api/admin/phrases/items', { collectionId: detail.id, ...pForm }); setPForm({ text: '', translation: '', literal: '', note: '' }); onChange(); }
    catch (e: any) { alert(e.message); }
  }

  const H: React.CSSProperties = { fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' };

  return (
    <div className="glass-card fade-up" style={{ padding: '20px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.emoji} {detail.title}</h2>
        <button onClick={onClose} style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>✕ Пӯшидан</button>
      </div>

      <div style={{ marginBottom: '22px' }}>
        <div style={H}>💬 Ибораҳо ({detail.phrases.length})</div>
        {detail.phrases.map(p => (
          <div key={p.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{p.text}</div>
              <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{p.translation}{p.literal ? ` · «${p.literal}»` : ''}</div>
            </div>
            <button onClick={async () => { try { await del(`/api/admin/phrases/items/${p.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
          <input value={pForm.text} onChange={e => setPForm(f => ({ ...f, text: e.target.value }))} placeholder="Could I have the menu, please?" style={FIELD} />
          <input value={pForm.translation} onChange={e => setPForm(f => ({ ...f, translation: e.target.value }))} placeholder="Лутфан, менюро диҳед." style={FIELD} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '8px' }}>
          <input value={pForm.literal} onChange={e => setPForm(f => ({ ...f, literal: e.target.value }))} placeholder="Тарҷумаи таҳтуллафзӣ (ихтиёрӣ)" style={FIELD} />
          <input value={pForm.note} onChange={e => setPForm(f => ({ ...f, note: e.target.value }))} placeholder="Эзоҳ (ихтиёрӣ)" style={FIELD} />
          <button onClick={addPhrase} disabled={!pForm.text || !pForm.translation} style={BTN}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPhrasesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <PhrasesContent />
    </Suspense>
  );
}
