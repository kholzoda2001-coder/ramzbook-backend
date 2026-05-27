'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
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
  color: string;
  order: number;
  isActive: boolean;
  isPremium: boolean;
  isBoss: boolean;
  courseId: string;
  course: {
    id: string; title: string; emoji: string; level: string;
    targetLanguage: { flag: string; name: string };
    nativeLanguage: { flag: string; nativeName: string };
  };
  _count: { lessons: number };
}

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};

const EMPTY_FORM = {
  courseId: '', title: '', titleTranslated: '',
  emoji: '🎯', color: '#10B981', order: '',
  isPremium: false, isBoss: false,
};

function ModulesContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState(initialCourseId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, courseId: initialCourseId });

  // Update form if filter changes
  useEffect(() => {
    setForm(f => ({ ...f, courseId: courseFilter }));
  }, [courseFilter]);

  const [saving, setSaving] = useState(false);

  const filtered = courseFilter ? modules.filter(m => m.courseId === courseFilter) : modules;

  // Group filtered modules by course
  const byCourse: Record<string, { course: Module['course']; mods: Module[] }> = {};
  for (const m of filtered) {
    if (!byCourse[m.courseId]) byCourse[m.courseId] = { course: m.course, mods: [] };
    byCourse[m.courseId].mods.push(m);
  }

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {}
  }, []);

  const fetchModules = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/modules');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setModules(data.modules ?? []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); fetchModules(); }, [fetchCourses, fetchModules]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        courseId: form.courseId,
        title: form.title,
        titleTranslated: form.titleTranslated || form.title,
        emoji: form.emoji || '🎯',
        color: form.color || '#10B981',
        isPremium: form.isPremium,
        isBoss: form.isBoss,
      };
      if (form.order !== '') payload.order = Number(form.order);
      const res = await fetch('/api/admin/modules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchModules();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Модули "${title}" нест карда шавад? Ҳамаи дарсҳо ва калимаҳо низ нест мешаванд.`)) return;
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Хатогӣ'); }
      fetchModules();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function handleToggleActive(mod: Module) {
    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !mod.isActive }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Хатогӣ'); }
      fetchModules();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Модулҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {courseFilter ? `${filtered.length} модул` : `Ҳамаи модулҳо — ${modules.length}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg, var(--teal, #14B8A6), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Модули нав
        </button>
      </div>

      {/* Course filter */}
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ ...FIELD, maxWidth: 320 }}>
          <option value="">🌐 Ҳамаи курсҳо</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.targetLanguage.flag} {c.targetLanguage.name} → {c.nativeLanguage.flag} {c.nativeLanguage.nativeName} · {c.level}
            </option>
          ))}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Модули нав</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Курс *</label>
                <select required value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} style={FIELD}>
                  <option value="">Курс интихоб кунед</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.targetLanguage.name} → {c.nativeLanguage.nativeName} · {c.level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Унвон (омӯзишӣ) *</label>
                <input required type="text" placeholder="Foundations" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={FIELD} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Унвон (модарӣ)</label>
                <input type="text" placeholder="Асосҳо" value={form.titleTranslated}
                  onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} style={FIELD} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Эмоҷи</label>
                <input type="text" placeholder="🎯" value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={FIELD} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Ранг (hex)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ ...FIELD }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Тартиб (ихтиёрӣ)</label>
                <input type="number" min={0} placeholder="автоматӣ" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))} style={FIELD} />
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '24px' }}>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} />
                  👑 Premium
                </label>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <input type="checkbox" checked={form.isBoss} onChange={e => setForm(f => ({ ...f, isBoss: e.target.checked }))} />
                  🏆 Boss
                </label>
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

      {/* Modules list grouped by course */}
      {loading ? (
        <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Модулҳо бор мешаванд…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p>Модуле ёфт нашуд.</p>
        </div>
      ) : (
        Object.values(byCourse).map(({ course, mods }) => (
          <div key={course.id} className="glass-card fade-up" style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Course header */}
            <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{course.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{course.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                  {course.targetLanguage.flag} {course.targetLanguage.name} → {course.nativeLanguage.flag} {course.nativeLanguage.nativeName} · {course.level}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text3)' }}>{mods.length} модул</span>
            </div>
            {/* Modules table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {mods.map(mod => (
                  <tr key={mod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 20px', width: '32px', color: 'var(--text3)' }}>{mod.order}</td>
                    <td style={{ padding: '12px 8px', width: '36px' }}>
                      <span style={{ fontSize: '20px' }}>{mod.emoji}</span>
                    </td>
                    <td style={{ padding: '12px 8px', minWidth: '160px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{mod.title}</div>
                      {mod.titleTranslated && mod.titleTranslated !== mod.title && (
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{mod.titleTranslated}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: mod.color, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link href={`/admin/lessons?moduleId=${mod.id}`} style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600, background: 'rgba(20,184,166,0.1)', padding: '6px 12px', borderRadius: '6px' }}>
                        📚 {mod._count.lessons} дарс →
                      </Link>
                    </td>
                    <td style={{ padding: '12px 8px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {mod.isPremium && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontWeight: 600 }}>👑 Premium</span>}
                      {mod.isBoss && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: 'rgba(239,68,68,0.15)', color: '#F87171', fontWeight: 600 }}>🏆 Boss</span>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button onClick={() => handleToggleActive(mod)}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: mod.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', color: mod.isActive ? '#4ADE80' : '#F87171', fontWeight: 600 }}>
                        {mod.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <button onClick={() => handleDelete(mod.id, mod.title)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminModulesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад...</div>}>
      <ModulesContent />
    </Suspense>
  );
}
