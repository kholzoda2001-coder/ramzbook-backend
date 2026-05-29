'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { CEFR_LEVELS } from '@/lib/cefr';
import { GRAMMAR_EXERCISE_TYPES } from '@/lib/grammar';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' };
const SMALL_DEL: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' };

interface Course { id: string; level: string; emoji: string; targetLanguage: { flag: string; name: string }; nativeLanguage: { flag: string; nativeName: string }; }
interface Topic { id: string; title: string; titleTranslated: string; emoji: string; cefrLevel: string | null; isPremium: boolean; isActive: boolean; order: number; _count?: { examples: number; rules: number; exercises: number }; }
interface Example { id: string; sentence: string; translation: string; highlight: string | null; audioUrl: string | null; }
interface Rule { id: string; pattern: string; note: string | null; }
interface Exercise { id: string; type: string; prompt: string; promptTranslated: string | null; answer: string; options: unknown; explanation: string | null; }
interface TopicDetail extends Topic { explanation: string; examples: Example[]; rules: Rule[]; exercises: Exercise[]; }

const EMPTY_TOPIC = { title: '', titleTranslated: '', explanation: '', cefrLevel: '', emoji: '🔤', isPremium: false };

function GrammarContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [topicForm, setTopicForm] = useState(EMPTY_TOPIC);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<TopicDetail | null>(null);

  const fetchCourses = useCallback(async () => {
    try { const r = await fetch('/api/admin/courses'); const d = await r.json(); setCourses(d.courses ?? []); } catch {}
  }, []);
  const fetchTopics = useCallback(async () => {
    if (!courseId) { setTopics([]); return; }
    setLoading(true);
    try { const r = await fetch(`/api/admin/grammar?courseId=${courseId}`); const d = await r.json(); setTopics(d.topics ?? []); }
    catch { setTopics([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchTopics(); setDetail(null); }, [fetchTopics]);

  async function createTopic(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch('/api/admin/grammar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...topicForm, courseId, cefrLevel: topicForm.cefrLevel || null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setTopicForm(EMPTY_TOPIC); setShowForm(false); fetchTopics();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteTopic(id: string, title: string) {
    if (!confirm(`Мавзӯи "${title}" нест карда шавад? Ҳамаи мисолҳо, қоидаҳо ва машқҳо низ нест мешаванд.`)) return;
    try { const r = await fetch(`/api/admin/grammar/${id}`, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } if (detail?.id === id) setDetail(null); fetchTopics(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/grammar/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.topic); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) openDetail(detail.id); fetchTopics(); }

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>🔤 Грамматика</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Мавзӯъҳои грамматикӣ, мисолҳо, қоидаҳо ва машқҳо — барои ҳар курс</p>
        </div>
        {courseId && (
          <button onClick={() => setShowForm(!showForm)} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Мавзӯи нав</button>
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
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Мавзӯи грамматикии нав</h3>
          <form onSubmit={createTopic}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={topicForm.title} onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))} placeholder="Present Simple" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={topicForm.titleTranslated} onChange={e => setTopicForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Замони ҳозираи содда" style={FIELD} /></div>
              <div><label style={LABEL}>Эмоҷи</label><input value={topicForm.emoji} onChange={e => setTopicForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🔤" style={FIELD} /></div>
              <div><label style={LABEL}>Сатҳи CEFR</label>
                <select value={topicForm.cefrLevel} onChange={e => setTopicForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  <option value="">↪ Аз курс мерос мегирад</option>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Тавзеҳ (Markdown, ба забони модарӣ)</label>
              <textarea value={topicForm.explanation} onChange={e => setTopicForm(f => ({ ...f, explanation: e.target.value }))} rows={5} placeholder="Замони ҳозираи содда барои амалҳои такрорӣ ва ҳақиқатҳо истифода мешавад…" style={{ ...FIELD, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={topicForm.isPremium} onChange={e => setTopicForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setTopicForm(EMPTY_TOPIC); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!courseId ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📘</div>
          <p>Барои дидани мавзӯъҳои грамматикӣ як курс интихоб кунед.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.4fr' : '1fr', gap: '20px' }}>
          {/* Topics list */}
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : topics.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон мавзӯъ нест.</div>
            ) : topics.map(t => (
              <div key={t.id} onClick={() => openDetail(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: detail?.id === t.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title} {t.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{t.titleTranslated} · {t.cefrLevel ?? '—'} · 📝{t._count?.examples ?? 0} 📐{t._count?.rules ?? 0} 🎯{t._count?.exercises ?? 0}</div>
                </div>
                <button onClick={ev => { ev.stopPropagation(); deleteTopic(t.id, t.title); }} style={SMALL_DEL}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Detail editor */}
          {detail && <TopicEditor key={detail.id} detail={detail} onChange={reloadDetail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </div>
  );
}

function TopicEditor({ detail, onChange, onClose }: { detail: TopicDetail; onChange: () => void; onClose: () => void }) {
  const [exForm, setExForm] = useState({ sentence: '', translation: '', highlight: '' });
  const [ruleForm, setRuleForm] = useState({ pattern: '', note: '' });
  const [qForm, setQForm] = useState({ type: 'fill_blank', prompt: '', answer: '', promptTranslated: '', options: '', explanation: '' });

  async function post(url: string, body: unknown) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ'); return d;
  }
  async function del(url: string) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } }

  async function addExample() { try { await post('/api/admin/grammar/examples', { topicId: detail.id, ...exForm }); setExForm({ sentence: '', translation: '', highlight: '' }); onChange(); } catch (e: any) { alert(e.message); } }
  async function addRule() { try { await post('/api/admin/grammar/rules', { topicId: detail.id, ...ruleForm }); setRuleForm({ pattern: '', note: '' }); onChange(); } catch (e: any) { alert(e.message); } }
  async function addExercise() {
    try {
      const options = qForm.options.trim() ? qForm.options.split('|').map(s => s.trim()).filter(Boolean) : undefined;
      await post('/api/admin/grammar/exercises', { topicId: detail.id, ...qForm, options });
      setQForm({ type: 'fill_blank', prompt: '', answer: '', promptTranslated: '', options: '', explanation: '' }); onChange();
    } catch (e: any) { alert(e.message); }
  }

  const SECTION: React.CSSProperties = { marginBottom: '22px' };
  const H: React.CSSProperties = { fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' };

  return (
    <div className="glass-card fade-up" style={{ padding: '20px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.emoji} {detail.title}</h2>
        <button onClick={onClose} style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>✕ Пӯшидан</button>
      </div>

      {/* Examples */}
      <div style={SECTION}>
        <div style={H}>📝 Мисолҳо ({detail.examples.length})</div>
        {detail.examples.map(ex => (
          <div key={ex.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}><div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{ex.sentence}</div><div style={{ color: 'var(--text3)', fontSize: '12px' }}>{ex.translation}</div></div>
            <button onClick={async () => { try { await del(`/api/admin/grammar/examples/${ex.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr auto', gap: '8px', marginTop: '10px' }}>
          <input value={exForm.sentence} onChange={e => setExForm(f => ({ ...f, sentence: e.target.value }))} placeholder="She goes to school." style={FIELD} />
          <input value={exForm.translation} onChange={e => setExForm(f => ({ ...f, translation: e.target.value }))} placeholder="Ӯ ба мактаб меравад." style={FIELD} />
          <input value={exForm.highlight} onChange={e => setExForm(f => ({ ...f, highlight: e.target.value }))} placeholder="goes" style={FIELD} />
          <button onClick={addExample} disabled={!exForm.sentence} style={BTN}>+</button>
        </div>
      </div>

      {/* Rules */}
      <div style={SECTION}>
        <div style={H}>📐 Қоидаҳо ({detail.rules.length})</div>
        {detail.rules.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}><div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{r.pattern}</div>{r.note && <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{r.note}</div>}</div>
            <button onClick={async () => { try { await del(`/api/admin/grammar/rules/${r.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '10px' }}>
          <input value={ruleForm.pattern} onChange={e => setRuleForm(f => ({ ...f, pattern: e.target.value }))} placeholder="Subject + verb(+s) + object" style={FIELD} />
          <input value={ruleForm.note} onChange={e => setRuleForm(f => ({ ...f, note: e.target.value }))} placeholder="Барои шахси сеюм -s илова мешавад" style={FIELD} />
          <button onClick={addRule} disabled={!ruleForm.pattern} style={BTN}>+</button>
        </div>
      </div>

      {/* Exercises */}
      <div style={SECTION}>
        <div style={H}>🎯 Машқҳо ({detail.exercises.length})</div>
        {detail.exercises.map(q => (
          <div key={q.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}><span style={{ fontSize: '11px', color: '#A78BFA' }}>[{q.type}]</span> {q.prompt}</div>
              <div style={{ color: '#4ADE80', fontSize: '12px' }}>✓ {q.answer}{Array.isArray(q.options) && q.options.length ? ` · [${(q.options as string[]).join(', ')}]` : ''}</div>
            </div>
            <button onClick={async () => { try { await del(`/api/admin/grammar/exercises/${q.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.4fr 1fr', gap: '8px', marginTop: '10px' }}>
          <select value={qForm.type} onChange={e => setQForm(f => ({ ...f, type: e.target.value }))} style={FIELD}>
            {GRAMMAR_EXERCISE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={qForm.prompt} onChange={e => setQForm(f => ({ ...f, prompt: e.target.value }))} placeholder="She ___ (go) to school." style={FIELD} />
          <input value={qForm.answer} onChange={e => setQForm(f => ({ ...f, answer: e.target.value }))} placeholder="goes" style={FIELD} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '8px' }}>
          <input value={qForm.options} onChange={e => setQForm(f => ({ ...f, options: e.target.value }))} placeholder="вариантҳо: go | goes | going" style={FIELD} />
          <input value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Шарҳ (ихтиёрӣ)" style={FIELD} />
          <button onClick={addExercise} disabled={!qForm.prompt || !qForm.answer} style={BTN}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGrammarPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <GrammarContent />
    </Suspense>
  );
}
