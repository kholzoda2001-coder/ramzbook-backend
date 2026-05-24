'use client';
import { useEffect, useState, useCallback } from 'react';

interface Word {
  id: string;
  word: string;
  translation: string;
  ipa?: string | null;
  emoji?: string | null;
  example?: string | null;
  exampleTranslation?: string | null;
  difficulty: number;
  langFrom: string;
  langTo: string;
  lessons?: Array<{ lesson: { id: string; title: string } }>;
}

interface Lesson {
  id: string;
  title: string;
  unitTitle?: string;
  unit?: { title: string; course: { title: string; level: string } };
}

export default function AdminWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form, setForm] = useState({
    lessonId: '',
    word: '',
    translation: '',
    ipa: '',
    emoji: '',
    example: '',
    exampleTranslation: '',
    difficulty: 1,
  });

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/words?limit=200');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setWords(data.words ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/lessons');
      const data = await res.json();
      setLessons(data.lessons ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchWords();
    fetchLessons();
  }, [fetchWords, fetchLessons]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setForm({ lessonId: '', word: '', translation: '', ipa: '', emoji: '', example: '', exampleTranslation: '', difficulty: 1 });
      setShowForm(false);
      fetchWords();
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    }
  }

  async function handleDelete(id: string, word: string) {
    if (!confirm(`Калима "${word}" нест карда шавад?`)) return;
    try {
      const res = await fetch(`/api/admin/words/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Хатогӣ');
      }
      fetchWords();
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    }
  }

  async function handleResetAndSeed() {
    if (!confirm('Ҳамаи калимаҳо нест карда шуда, маълумоти нав ворид карда мешавад. Идома диҳед?')) return;
    setResetting(true);
    try {
      // Delete all words and related data then re-seed
      const seedRes = await fetch('/api/admin/seed?reset=true');
      const seedData = await seedRes.json();
      alert(seedData.results ? seedData.results.join('\n') : JSON.stringify(seedData));
      fetchWords();
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setResetting(false);
    }
  }

  const difficultyStars = (n: number) =>
    [1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ color: s <= n ? 'var(--gold, #F59E0B)' : 'rgba(255,255,255,0.1)', fontSize: '12px' }}>★</span>
    ));

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Калимаҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Луғати барнома — Ҷамъ: {total}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: 'linear-gradient(135deg, var(--teal, #14B8A6), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Калимаи Нав
          </button>
          <button
            onClick={handleResetAndSeed}
            disabled={resetting}
            style={{ background: resetting ? '#555' : 'rgba(239,68,68,0.15)', color: resetting ? '#aaa' : '#EF4444', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 600, fontSize: '14px', cursor: resetting ? 'not-allowed' : 'pointer' }}
          >
            {resetting ? '⏳ Ворид мешавад…' : '🔄 Seed маълумот'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Калимаи нав илова кунед</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Дарс (Lesson)</label>
                <select
                  value={form.lessonId}
                  onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '14px' }}
                >
                  <option value="">Дарс интихоб накунед</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.unit ? `${l.unit.course.level} › ${l.unit.title} › ` : ''}{l.title}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { key: 'word', label: 'Калима (Англисӣ)', placeholder: 'Hello', required: true },
                { key: 'translation', label: 'Тарҷума (Тоҷикӣ)', placeholder: 'Салом' },
                { key: 'ipa', label: 'IPA / Транскрипция', placeholder: '/həˈloʊ/' },
                { key: 'emoji', label: 'Эмоҷи', placeholder: '👋' },
                { key: 'example', label: 'Мисол (Англисӣ)', placeholder: 'Hello, how are you?' },
                { key: 'exampleTranslation', label: 'Тарҷумаи мисол', placeholder: 'Салом, чӣ хел?' },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>{label}</label>
                  <input
                    type="text"
                    required={required}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Мушкилӣ (1-5)</label>
                <input
                  type="number"
                  min={1} max={5}
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                ✅ Сохтан
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                Бекор кардан
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#EF4444', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Words Table */}
      <div className="glass-card fade-up">
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            Калимаҳо бор мешаванд…
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Забон</th>
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
                  <tr>
                    <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                      Ягон калима ёфт нашуд. Маълумот ворид кунед ё «Seed маълумот» тугмаро пахш кунед.
                    </td>
                  </tr>
                ) : (
                  words.map(word => (
                    <tr key={word.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                          {word.langFrom} → {word.langTo}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                        {word.emoji && <span style={{ marginRight: '8px' }}>{word.emoji}</span>}
                        {word.word}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>
                        {word.translation}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: '12px', fontFamily: 'monospace' }}>
                        {word.ipa || '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: '12px' }}>
                        {word.lessons?.map(lw => lw.lesson.title).join(', ') || '—'}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {difficultyStars(word.difficulty)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <button
                          onClick={() => handleDelete(word.id, word.word)}
                          title="Нест кардан"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' }}
                        >
                          🗑️
                        </button>
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
