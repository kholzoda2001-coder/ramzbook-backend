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

const SKILLS = ['overall', 'grammar', 'vocab', 'reading', 'listening', 'speaking', 'writing'];

interface Language { id: string; code: string; name: string; nativeName: string; flag: string; canBeTarget: boolean; canBeNative: boolean; }
interface Question {
  id: string; cefrLevel: string; skill: string; prompt: string; promptTranslated: string | null;
  options: string[]; answer: string; explanation: string | null; audioUrl: string | null;
  order: number; isActive: boolean;
}

const EMPTY = {
  cefrLevel: 'A1', skill: 'grammar', prompt: '', promptTranslated: '',
  options: ['', ''] as string[], correctIndex: 0, explanation: '', audioUrl: '', order: 0,
};

function PlacementContent() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [targetId, setTargetId] = useState('');
  const [nativeId, setNativeId] = useState('');
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    try { const r = await fetch('/api/admin/languages'); const d = await r.json(); setLanguages(d.languages ?? []); } catch {}
  }, []);
  const fetchItems = useCallback(async () => {
    if (!targetId || !nativeId) { setItems([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/placement?targetLanguageId=${targetId}&nativeLanguageId=${nativeId}`);
      const d = await r.json(); setItems(d.questions ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [targetId, nativeId]);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const targets = languages.filter(l => l.canBeTarget);
  const natives = languages.filter(l => l.canBeNative);
  const pairReady = targetId && nativeId;

  function resetForm() { setForm(EMPTY); setShowForm(false); setEditId(null); }

  function startEdit(q: Question) {
    const ci = Math.max(0, q.options.indexOf(q.answer));
    setForm({
      cefrLevel: q.cefrLevel, skill: q.skill, prompt: q.prompt, promptTranslated: q.promptTranslated ?? '',
      options: q.options.length >= 2 ? [...q.options] : ['', ''], correctIndex: ci < 0 ? 0 : ci,
      explanation: q.explanation ?? '', audioUrl: q.audioUrl ?? '', order: q.order,
    });
    setEditId(q.id); setShowForm(true);
  }

  function setOption(i: number, v: string) { setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? v : o) })); }
  function addOption() { setForm(f => ({ ...f, options: [...f.options, ''] })); }
  function removeOption(i: number) {
    setForm(f => {
      const options = f.options.filter((_, idx) => idx !== i);
      const correctIndex = f.correctIndex >= options.length ? 0 : (i < f.correctIndex ? f.correctIndex - 1 : f.correctIndex);
      return { ...f, options, correctIndex };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const opts = form.options.map(o => o.trim()).filter(o => o.length > 0);
    const answer = (form.options[form.correctIndex] ?? '').trim();
    const payload = {
      targetLanguageId: targetId, nativeLanguageId: nativeId,
      cefrLevel: form.cefrLevel, skill: form.skill, prompt: form.prompt,
      promptTranslated: form.promptTranslated, options: opts, answer,
      explanation: form.explanation, audioUrl: form.audioUrl, order: form.order,
    };
    try {
      const url = editId ? `/api/admin/placement/${editId}` : '/api/admin/placement';
      const r = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      resetForm(); fetchItems();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    if (!confirm('Ин савол нест карда шавад?')) return;
    try { const r = await fetch(`/api/admin/placement/${id}`, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } fetchItems(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  // Group questions by level for an at-a-glance overview.
  const byLevel: Record<string, Question[]> = {};
  for (const q of items) (byLevel[q.cefrLevel] ??= []).push(q);
  const validOptions = form.options.filter(o => o.trim().length > 0).length;
  const answerSet = (form.options[form.correctIndex] ?? '').trim().length > 0;

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>🎯 Санҷиши сатҳбандӣ</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Саволҳои бисёрвариантӣ бо тег аз рӯи сатҳ (A1…C2) — барои ҳар ҷуфти забон</p>
        </div>
        {pairReady && (
          <button onClick={() => { editId ? resetForm() : setShowForm(!showForm); }} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>{showForm ? '✕ Бекор' : '+ Саволи нав'}</button>
        )}
      </div>

      <div className="fade-up" style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ ...FIELD, maxWidth: 280 }}>
          <option value="">🎓 Забони омӯзишӣ…</option>
          {targets.map(l => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
        </select>
        <select value={nativeId} onChange={e => setNativeId(e.target.value)} style={{ ...FIELD, maxWidth: 280 }}>
          <option value="">🗣️ Забони модарӣ…</option>
          {natives.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
        </select>
      </div>

      {showForm && pairReady && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>{editId ? '✏️ Таҳрири савол' : '➕ Саволи нав'}</h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Сатҳи CEFR *</label>
                <select value={form.cefrLevel} onChange={e => setForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><label style={LABEL}>Малака</label>
                <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} style={FIELD}>
                  {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={LABEL}>Тартиб</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} style={FIELD} /></div>
              {form.skill === 'listening' && (
                <div><label style={LABEL}>Аудио URL (ихтиёрӣ)</label><input value={form.audioUrl} onChange={e => setForm(f => ({ ...f, audioUrl: e.target.value }))} placeholder="https://…/clip.mp3" style={FIELD} /></div>
              )}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Савол *</label>
              <textarea required value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} rows={2} placeholder="She ___ to school every day." style={{ ...FIELD, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Ишора / тарҷума (ба забони модарӣ, ихтиёрӣ)</label>
              <input value={form.promptTranslated} onChange={e => setForm(f => ({ ...f, promptTranslated: e.target.value }))} placeholder="Шакли дурусти феълро интихоб кунед" style={FIELD} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Вариантҳо (радиоро ба ҷавоби дуруст гузоред) *</label>
              {form.options.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm(f => ({ ...f, correctIndex: i }))} title="Ҷавоби дуруст" />
                  <input value={o} onChange={e => setOption(i, e.target.value)} placeholder={`Вариант ${i + 1}`} style={FIELD} />
                  {form.options.length > 2 && <button type="button" onClick={() => removeOption(i)} style={SMALL_DEL}>✕</button>}
                </div>
              ))}
              <button type="button" onClick={addOption} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 12px' }}>+ Вариант</button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Шарҳ (ихтиёрӣ): чаро ин ҷавоб дуруст аст</label>
              <input value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="«goes» — феъли шахси сеюми танҳо" style={FIELD} />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="submit" disabled={saving || !form.prompt.trim() || validOptions < 2 || !answerSet} style={BTN}>{saving ? '⏳…' : (editId ? '💾 Нигоҳ доштан' : '✅ Сохтан')}</button>
              <button type="button" onClick={resetForm} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!pairReady ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <p>Барои дидани саволҳои санҷиш ҷуфти забон (омӯзишӣ → модарӣ)-ро интихоб кунед.</p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон савол нест. Якчанд саволро дар ҳар сатҳ илова кунед.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {CEFR_LEVELS.filter(l => byLevel[l]?.length).map(level => (
            <div key={level} className="glass-card fade-up" style={{ padding: '14px 16px', borderRadius: '14px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{level} <span style={{ fontSize: '12px', color: 'var(--text3)' }}>· {byLevel[level].length} савол</span></div>
              {byLevel[level].map(q => (
                <div key={q.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: q.isActive ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{q.prompt} <span style={{ fontSize: '11px', color: 'var(--text3)' }}>· {q.skill}</span></div>
                    {q.promptTranslated && <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{q.promptTranslated}</div>}
                    <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {q.options.map((o, i) => (
                        <span key={i} style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', background: o === q.answer ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)', color: o === q.answer ? '#4ADE80' : 'var(--text-secondary)' }}>{o === q.answer ? '✓ ' : ''}{o}</span>
                      ))}
                    </div>
                    {q.explanation && <div style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>💡 {q.explanation}</div>}
                  </div>
                  <button onClick={() => startEdit(q)} style={{ ...SMALL_DEL, background: 'rgba(20,184,166,0.1)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.2)' }}>✏️</button>
                  <button onClick={() => deleteItem(q.id)} style={SMALL_DEL}>🗑️</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPlacementPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <PlacementContent />
    </Suspense>
  );
}
