'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  emoji: string;
  level: string;
  targetLanguage: { flag: string; name: string };
  nativeLanguage: { flag: string; nativeName: string };
}

interface Module {
  id: string;
  title: string;
  titleTranslated: string;
  emoji: string;
  courseId: string;
}

interface Lesson {
  id: string;
  title: string;
  titleTranslated: string;
  type: string;
  emoji: string;
  xpReward: number;
  duration: number;
  order: number;
  isActive: boolean;
  isPremium: boolean;
  moduleId: string;
  module?: {
    id: string;
    title: string;
    course: { id: string; title: string; emoji: string; level: string; targetLanguage: { flag: string }; nativeLanguage: { flag: string } };
  };
  _count?: { words: number };
}

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};

const EMPTY_FORM = {
  formCourseId: '', moduleId: '', title: '', titleTranslated: '',
  type: 'vocab', emoji: '📝', xpReward: 60, duration: 5, order: '',
};

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Derived: modules for filter bar (filtered by courseFilter)
  const filterModules = courseFilter
    ? allModules.filter(m => m.courseId === courseFilter)
    : allModules;

  // Derived: modules for create form (filtered by form course)
  const formModules = form.formCourseId
    ? allModules.filter(m => m.courseId === form.formCourseId)
    : allModules;

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {}
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/modules');
      const data = await res.json();
      setAllModules(data.modules ?? []);
    } catch {}
  }, []);

  const fetchLessons = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let url = '/api/admin/lessons?limit=500';
      if (moduleFilter) url = `/api/admin/lessons?moduleId=${moduleFilter}`;
      else if (courseFilter) url = `/api/admin/lessons?courseId=${courseFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setLessons(data.lessons ?? []);
      setTotal(data.total ?? (data.lessons?.length ?? 0));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [courseFilter, moduleFilter]);

  useEffect(() => { fetchCourses(); fetchModules(); }, [fetchCourses, fetchModules]);
  useEffect(() => {
    setModuleFilter(''); // reset module filter when course changes
  }, [courseFilter]);
  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        moduleId: form.moduleId,
        title: form.title,
        titleTranslated: form.titleTranslated || form.title,
        type: form.type,
        emoji: form.emoji || '📝',
        xpReward: Number(form.xpReward),
        duration: Number(form.duration),
      };
      if (form.order !== '') payload.order = Number(form.order);
      const res = await fetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchLessons();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Дарси "${title}" нест карда шавад? Ҳамаи калимаҳо низ нест мешаванд.`)) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Хатогӣ'); }
      fetchLessons();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function handleToggleActive(lesson: Lesson) {
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !lesson.isActive }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Хатогӣ'); }
      fetchLessons();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Дарсҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {courseFilter || moduleFilter ? `Филтр шуда — ${lessons.length} дарс` : `Ҳамаи дарсҳо — ${total || lessons.length}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg, var(--teal, #14B8A6), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Дарси нав
        </button>
      </div>

      {/* Filters */}
      <div className="fade-up" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          style={{ ...FIELD, maxWidth: 280 }}
        >
          <option value="">🌐 Ҳамаи курсҳо</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.targetLanguage.flag} {c.targetLanguage.name} → {c.nativeLanguage.flag} {c.nativeLanguage.nativeName} · {c.level}
            </option>
          ))}
        </select>
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          disabled={filterModules.length === 0}
          style={{ ...FIELD, maxWidth: 260 }}
        >
          <option value="">📦 Ҳамаи модулҳо</option>
          {filterModules.map(m => (
            <option key={m.id} value={m.id}>{m.emoji} {m.title}</option>
          ))}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Дарси нав</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Course (cascade) */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Курс (барои филтри модул)</label>
                <select
                  value={form.formCourseId}
                  onChange={e => setForm(f => ({ ...f, formCourseId: e.target.value, moduleId: '' }))}
                  style={FIELD}
                >
                  <option value="">Курс интихоб кунед</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.targetLanguage.name} → {c.nativeLanguage.nativeName} · {c.level}
                    </option>
                  ))}
                </select>
              </div>
              {/* Module */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Модул *</label>
                <select
                  required
                  value={form.moduleId}
                  onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
                  style={FIELD}
                >
                  <option value="">Модул интихоб кунед</option>
                  {formModules.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.title}</option>
                  ))}
                </select>
              </div>
              {/* Title */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Унвон (омӯзишӣ) *</label>
                <input required type="text" placeholder="Greetings" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={FIELD} />
              </div>
              {/* Title Translated */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Унвон (модарӣ)</label>
                <input type="text" placeholder="Салому алейк" value={form.titleTranslated}
                  onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} style={FIELD} />
              </div>
              {/* Type */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Намуд</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={FIELD}>
                  <option value="vocab">📚 vocab</option>
                  <option value="quiz">🧠 quiz</option>
                </select>
              </div>
              {/* Emoji */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Эмоҷи</label>
                <input type="text" placeholder="📝" value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={FIELD} />
              </div>
              {/* XP */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>XP мукофот</label>
                <input type="number" min={0} value={form.xpReward}
                  onChange={e => setForm(f => ({ ...f, xpReward: parseInt(e.target.value) || 60 }))} style={FIELD} />
              </div>
              {/* Duration */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Давомнокӣ (дақ.)</label>
                <input type="number" min={1} value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 5 }))} style={FIELD} />
              </div>
              {/* Order */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Тартиб (ихтиёрӣ)</label>
                <input type="number" min={0} placeholder="автоматӣ" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))} style={FIELD} />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving}
                style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Сохтан…' : '✅ Сохтан'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                Бекор
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#EF4444', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Lessons table */}
      <div className="glass-card fade-up">
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Дарсҳо бор мешаванд…</div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p>Дарсе ёфт нашуд. Курс ё модулро тағйир диҳед.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text3)', fontWeight: 600 }}>#</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Дарс</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Намуд</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Модул / Курс</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Калимаҳо</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>XP</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Дақ.</th>
                  <th style={{ padding: '14px 8px', color: 'var(--text3)', fontWeight: 600 }}>Ҳолат</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text3)', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {lessons.map(lesson => (
                  <tr key={lesson.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--text3)' }}>{lesson.order}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{lesson.emoji}</span>
                        <div>
                          <Link href={`/admin/words?lessonId=${lesson.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                            {lesson.title}
                          </Link>
                          {lesson.titleTranslated && lesson.titleTranslated !== lesson.title && (
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{lesson.titleTranslated}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: lesson.type === 'quiz' ? 'rgba(139,92,246,0.15)' : 'rgba(20,184,166,0.15)', color: lesson.type === 'quiz' ? '#A78BFA' : '#2DD4BF', fontWeight: 600 }}>
                        {lesson.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text3)', fontSize: '12px' }}>
                      {lesson.module ? (
                        <span>
                          {lesson.module.course.emoji} {lesson.module.course.targetLanguage.flag} {lesson.module.course.level}
                          <span style={{ color: 'var(--text3)', opacity: 0.5 }}> › </span>
                          {lesson.module.title}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text3)' }}>
                      {lesson._count?.words ?? 0}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#FBBF24', fontWeight: 600 }}>⚡ {lesson.xpReward}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text3)' }}>⏱️ {lesson.duration}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => handleToggleActive(lesson)}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: lesson.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', color: lesson.isActive ? '#4ADE80' : '#F87171', fontWeight: 600 }}
                      >
                        {lesson.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Link href={`/admin/words?lessonId=${lesson.id}`}
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        💬 Калимаҳо
                      </Link>
                      <button onClick={() => handleDelete(lesson.id, lesson.title)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
