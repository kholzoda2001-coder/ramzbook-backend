'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
interface Comprehension { id: string; title: string; titleTranslated: string; kind: string; emoji: string; cefrLevel: string | null; isPremium: boolean; isActive: boolean; order: number; _count?: { questions: number }; }
interface Question { id: string; question: string; questionTranslated: string | null; options: string[]; correctIndex: number; explanation: string | null; }
interface ComprehensionDetail extends Comprehension { passage: string; passageTranslated: string | null; audioUrl: string | null; questions: Question[]; }

const EMPTY = { title: '', titleTranslated: '', passage: '', passageTranslated: '', kind: 'reading', audioUrl: '', cefrLevel: '', emoji: '📖', isPremium: false };

function ComprehensionsContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [items, setItems] = useState<Comprehension[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<ComprehensionDetail | null>(null);

  const fetchCourses = useCallback(async () => {
    try { const r = await fetch('/api/admin/courses'); const d = await r.json(); setCourses(d.courses ?? []); } catch {}
  }, []);
  const fetchItems = useCallback(async () => {
    if (!courseId) { setItems([]); return; }
    setLoading(true);
    try { const r = await fetch(`/api/admin/comprehensions?courseId=${courseId}`); const d = await r.json(); setItems(d.comprehensions ?? []); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchItems(); setDetail(null); }, [fetchItems]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch('/api/admin/comprehensions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, courseId, cefrLevel: form.cefrLevel || null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setForm(EMPTY); setShowForm(false); fetchItems();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteItem(id: string, title: string) {
    if (!confirm(`Машқи "${title}" нест карда шавад? Ҳамаи саволҳои он низ нест мешаванд.`)) return;
    try { const r = await fetch(`/api/admin/comprehensions/${id}`, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } if (detail?.id === id) setDetail(null); fetchItems(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/comprehensions/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.comprehension); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) openDetail(detail.id); fetchItems(); }

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>📖 Дарк (Хониш/Шунавоӣ)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Матн ё клипи шунавоӣ + саволҳои дарк — барои ҳар курс</p>
        </div>
        {courseId && (
          <button onClick={() => setShowForm(!showForm)} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Машқи нав</button>
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
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Машқи нав</h3>
          <form onSubmit={createItem}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="A Day at the Market" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={form.titleTranslated} onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Як рӯз дар бозор" style={FIELD} /></div>
              <div><label style={LABEL}>Навъ</label>
                <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))} style={FIELD}>
                  <option value="reading">📖 Хониш</option>
                  <option value="listening">🎧 Шунавоӣ</option>
                </select>
              </div>
              <div><label style={LABEL}>Эмоҷи</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="📖" style={FIELD} /></div>
              <div><label style={LABEL}>Сатҳи CEFR</label>
                <select value={form.cefrLevel} onChange={e => setForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  <option value="">↪ Аз курс мерос мегирад</option>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {form.kind === 'listening' && (
                <div><label style={LABEL}>Аудио URL (ихтиёрӣ)</label><input value={form.audioUrl} onChange={e => setForm(f => ({ ...f, audioUrl: e.target.value }))} placeholder="https://…/clip.mp3" style={FIELD} /></div>
              )}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Матн / транскрипт (ба забони омӯзишӣ) *</label>
              <textarea required value={form.passage} onChange={e => setForm(f => ({ ...f, passage: e.target.value }))} rows={4} placeholder="Yesterday I went to the market to buy some fresh vegetables…" style={{ ...FIELD, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Тарҷумаи матн (ба забони модарӣ, ихтиёрӣ)</label>
              <textarea value={form.passageTranslated} onChange={e => setForm(f => ({ ...f, passageTranslated: e.target.value }))} rows={3} placeholder="Дирӯз ман ба бозор рафтам то сабзавоти тоза харам…" style={{ ...FIELD, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!courseId ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
          <p>Барои дидани машқҳои дарк як курс интихоб кунед.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.4fr' : '1fr', gap: '20px' }}>
          {/* List */}
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон машқ нест.</div>
            ) : items.map(it => (
              <div key={it.id} onClick={() => openDetail(it.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: detail?.id === it.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '20px' }}>{it.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{it.title} {it.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{it.titleTranslated} · {it.kind === 'listening' ? '🎧' : '📖'} · {it.cefrLevel ?? '—'} · ❓{it._count?.questions ?? 0}</div>
                </div>
                <button onClick={ev => { ev.stopPropagation(); deleteItem(it.id, it.title); }} style={SMALL_DEL}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Detail editor */}
          {detail && <ComprehensionEditor key={detail.id} detail={detail} onChange={reloadDetail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </div>
  );
}

const EMPTY_Q = { question: '', questionTranslated: '', options: ['', ''], correctIndex: 0, explanation: '' };

function ComprehensionEditor({ detail, onChange, onClose }: { detail: ComprehensionDetail; onChange: () => void; onClose: () => void }) {
  const [q, setQ] = useState(EMPTY_Q);

  async function post(url: string, body: unknown) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ'); return d;
  }
  async function del(url: string) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } }

  function setOption(i: number, v: string) { setQ(s => ({ ...s, options: s.options.map((o, idx) => idx === i ? v : o) })); }
  function addOption() { setQ(s => ({ ...s, options: [...s.options, ''] })); }
  function removeOption(i: number) { setQ(s => ({ ...s, options: s.options.filter((_, idx) => idx !== i), correctIndex: s.correctIndex >= s.options.length - 1 ? 0 : s.correctIndex })); }

  async function addQuestion() {
    try {
      await post('/api/admin/comprehensions/questions', { exerciseId: detail.id, ...q });
      setQ(EMPTY_Q); onChange();
    } catch (e: any) { alert(e.message); }
  }

  const H: React.CSSProperties = { fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' };
  const validOptions = q.options.filter(o => o.trim().length > 0).length;

  return (
    <div className="glass-card fade-up" style={{ padding: '20px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.emoji} {detail.title} <span style={{ fontSize: '13px', color: 'var(--text3)' }}>· {detail.kind === 'listening' ? '🎧 Шунавоӣ' : '📖 Хониш'}</span></h2>
        <button onClick={onClose} style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>✕ Пӯшидан</button>
      </div>

      <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{detail.passage}</div>
        {detail.passageTranslated && <div style={{ color: 'var(--text3)', fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{detail.passageTranslated}</div>}
        {detail.audioUrl && <div style={{ color: '#A78BFA', fontSize: '12px', marginTop: '8px' }}>🎧 {detail.audioUrl}</div>}
      </div>

      <div style={{ marginBottom: '22px' }}>
        <div style={H}>❓ Саволҳо ({detail.questions.length})</div>
        {detail.questions.map(qq => (
          <div key={qq.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{qq.question}</div>
              {qq.questionTranslated && <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{qq.questionTranslated}</div>}
              <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {qq.options.map((o, i) => (
                  <span key={i} style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', background: i === qq.correctIndex ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)', color: i === qq.correctIndex ? '#4ADE80' : 'var(--text-secondary)' }}>{i === qq.correctIndex ? '✓ ' : ''}{o}</span>
                ))}
              </div>
              {qq.explanation && <div style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>💡 {qq.explanation}</div>}
            </div>
            <button onClick={async () => { try { await del(`/api/admin/comprehensions/questions/${qq.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}

        <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input value={q.question} onChange={e => setQ(s => ({ ...s, question: e.target.value }))} placeholder="Савол: Where did the writer go?" style={FIELD} />
            <input value={q.questionTranslated} onChange={e => setQ(s => ({ ...s, questionTranslated: e.target.value }))} placeholder="Тарҷума (ихтиёрӣ)" style={FIELD} />
          </div>
          <div style={{ marginTop: '10px' }}>
            {q.options.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <input type="radio" name="correct" checked={q.correctIndex === i} onChange={() => setQ(s => ({ ...s, correctIndex: i }))} title="Ҷавоби дуруст" />
                <input value={o} onChange={e => setOption(i, e.target.value)} placeholder={`Вариант ${i + 1}`} style={FIELD} />
                {q.options.length > 2 && <button type="button" onClick={() => removeOption(i)} style={SMALL_DEL}>✕</button>}
              </div>
            ))}
            <button type="button" onClick={addOption} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 12px' }}>+ Вариант</button>
          </div>
          <input value={q.explanation} onChange={e => setQ(s => ({ ...s, explanation: e.target.value }))} placeholder="Шарҳ (ихтиёрӣ): чаро ин ҷавоб дуруст аст" style={{ ...FIELD, marginTop: '10px' }} />
          <div style={{ marginTop: '10px' }}>
            <button onClick={addQuestion} disabled={!q.question.trim() || validOptions < 2} style={BTN}>+ Илова кардани савол</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminComprehensionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <ComprehensionsContent />
    </Suspense>
  );
}
