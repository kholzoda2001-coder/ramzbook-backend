'use client';
import { useEffect, useState, useCallback } from 'react';

interface Word {
  id: string;
  word: string;
  translation: string;
  ipa?: string | null;
  emoji?: string | null;
  example?: string | null;
  exampleTrans?: string | null;
  difficulty: number;
  order: number;
  lesson?: { id: string; title: string } | null;
}

interface Lesson {
  id: string;
  title: string;
  moduleTitle?: string;
  module?: { title: string; course: { title: string; level: string } };
}

export default function AdminWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [lessonFilter, setLessonFilter] = useState<string>('');
  const [form, setForm] = useState({
    lessonId: '', word: '', translation: '', ipa: '', emoji: '', example: '', exampleTrans: '', difficulty: 1,
  });

  // Pre-select lesson from ?lessonId=
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('lessonId');
    if (id) { setLessonFilter(id); setForm(f => ({ ...f, lessonId: id })); }
  }, []);

  const fetchWords = useCallback(async (lessonId: string) => {
    setLoading(true); setError(null);
    try {
      const url = lessonId ? `/api/admin/words?lessonId=${lessonId}` : '/api/admin/words?limit=300';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setWords(data.words ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/lessons');
      const data = await res.json();
      setLessons(data.lessons ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchWords(lessonFilter); }, [fetchWords, lessonFilter]);
  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/words', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setForm(f => ({ ...f, word: '', translation: '', ipa: '', emoji: '', example: '', exampleTrans: '', difficulty: 1 }));
      setShowForm(false);
      fetchWords(lessonFilter);
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function handleDelete(id: string, word: string) {
    if (!confirm(`Калима "${word}" нест карда шавад?`)) return;
    try {
      const res = await fetch(`/api/admin/words/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Хатогӣ'); }
      fetchWords(lessonFilter);
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function handleSeed() {
    if (!confirm('Ҳамаи мундариҷа нест карда шуда, аз нав ворид мешавад. Идома?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      alert(`Тайёр! Курс: ${data.courses}, модул: ${data.modules}, дарс: ${data.lessons}, калима: ${data.words}`);
      fetchWords('');
      setLessonFilter('');
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSeeding(false); }
  }

  const difficultyStars = (n: number) =>
    [1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= n ? 'var(--gold, #F59E0B)' : 'rgba(255,255,255,0.1)', fontSize: '12px' }}>★</span>);

  const FIELD: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' };
  const lessonLabel = (l: Lesson) => `${l.module ? `${l.module.course.level} › ${l.module.title} › ` : ''}${l.title}`;

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Калимаҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Луғат — Ҷамъ: {total}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, var(--teal, #14B8A6), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>+ Калимаи нав</button>
          <button onClick={handleSeed} disabled={seeding} style={{ background: seeding ? '#555' : 'rgba(239,68,68,0.15)', color: seeding ? '#aaa' : '#EF4444', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 600, fontSize: '14px', cursor: seeding ? 'not-allowed' : 'pointer' }}>{seeding ? '⏳ Ворид…' : '🔄 Seed'}</button>
        </div>
      </div>

      {/* Lesson filter */}
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <select value={lessonFilter} onChange={e => setLessonFilter(e.target.value)} style={{ ...FIELD, maxWidth: 420 }}>
          <option value="">Ҳамаи калимаҳо</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{lessonLabel(l)}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Калимаи нав</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Дарс</label>
                <select required value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))} style={FIELD}>
                  <option value="">Дарс интихоб кунед</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{lessonLabel(l)}</option>)}
                </select>
              </div>
              {[
                { key: 'word', label: 'Калима (омӯзишӣ)', placeholder: 'Hello', required: true },
                { key: 'translation', label: 'Тарҷума (модарӣ)', placeholder: 'Салом' },
                { key: 'ipa', label: 'IPA', placeholder: '/həˈloʊ/' },
                { key: 'emoji', label: 'Эмоҷи', placeholder: '👋' },
                { key: 'example', label: 'Мисол (омӯзишӣ)', placeholder: 'Hello, how are you?' },
                { key: 'exampleTrans', label: 'Тарҷумаи мисол (модарӣ)', placeholder: 'Салом, чӣ хел?' },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>{label}</label>
                  <input type="text" required={required} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={FIELD} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Мушкилӣ (1-5)</label>
                <input type="number" min={1} max={5} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: parseInt(e.target.value) || 1 }))} style={FIELD} />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>✅ Сохтан</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#EF4444', marginBottom: '20px' }}>⚠️ {error}</div>}

      <div className="glass-card fade-up">
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Калимаҳо бор мешаванд…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Калима</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Тарҷума</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>IPA</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Дарс</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Мушкилӣ</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {words.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон калима нест.</td></tr>
                ) : (
                  words.map(word => (
                    <tr key={word.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                        {word.emoji && <span style={{ marginRight: '8px' }}>{word.emoji}</span>}{word.word}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{word.translation}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: '12px', fontFamily: 'monospace' }}>{word.ipa || '—'}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: '12px' }}>{word.lesson?.title || '—'}</td>
                      <td style={{ padding: '12px 20px' }}><div style={{ display: 'flex', gap: '2px' }}>{difficultyStars(word.difficulty)}</div></td>
                      <td style={{ padding: '12px 20px' }}>
                        <button onClick={() => handleDelete(word.id, word.word)} title="Нест кардан" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' }}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
