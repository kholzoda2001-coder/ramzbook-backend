'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CEFR_LEVELS, SKILL_TYPES } from '@/lib/cefr';

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
  cefrLevel?: string | null;
  skillType?: string;
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
  // The single linked component (at most one), for badges + the link editor.
  grammarTopic?: { id: string; title: string } | null;
  phraseCollection?: { id: string; title: string } | null;
  dialogue?: { id: string; title: string } | null;
  comprehension?: { id: string; title: string } | null;
}

type LinkType = 'grammar' | 'phrases' | 'dialogue' | 'comprehension';
interface CompOption { id: string; title: string; titleTranslated?: string }
type CompMap = Record<LinkType, CompOption[]>;
const EMPTY_COMP: CompMap = { grammar: [], phrases: [], dialogue: [], comprehension: [] };

// Component link kinds offered in the picker.
const LINK_TYPES: { value: '' | LinkType; label: string }[] = [
  { value: '', label: '— Бе компонент (танҳо калима)' },
  { value: 'grammar', label: '🔤 Грамматика' },
  { value: 'phrases', label: '💬 Ибораҳо' },
  { value: 'dialogue', label: '🎙️ Муколама' },
  { value: 'comprehension', label: '📖 Дарк' },
];
const LINK_LABEL: Record<LinkType, string> = {
  grammar: '🔤 Грамматика', phrases: '💬 Ибора', dialogue: '🎙️ Муколама', comprehension: '📖 Дарк',
};

// Which component (if any) a lesson is currently linked to.
function linkedOf(l: Lesson): { type: LinkType; id: string; title: string } | null {
  if (l.grammarTopic) return { type: 'grammar', id: l.grammarTopic.id, title: l.grammarTopic.title };
  if (l.phraseCollection) return { type: 'phrases', id: l.phraseCollection.id, title: l.phraseCollection.title };
  if (l.dialogue) return { type: 'dialogue', id: l.dialogue.id, title: l.dialogue.title };
  if (l.comprehension) return { type: 'comprehension', id: l.comprehension.id, title: l.comprehension.title };
  return null;
}

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};

const EMPTY_FORM = {
  formCourseId: '', moduleId: '', title: '', titleTranslated: '',
  type: 'vocab', cefrLevel: '', skillType: 'vocab', emoji: '📝', xpReward: 60, duration: 5, order: '',
  linkType: '' as '' | LinkType, linkId: '',
};

// Icons per skill type for compact table display.
const SKILL_EMOJI: Record<string, string> = {
  vocab: '📚', grammar: '🔤', reading: '📖', listening: '🎧',
  speaking: '🗣️', writing: '✍️', review: '🔁', test: '📝',
};

function LessonsContent() {
  const searchParams = useSearchParams();
  const initialModuleId = searchParams.get('moduleId') || '';
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [courseFilter, setCourseFilter] = useState(initialCourseId);
  const [moduleFilter, setModuleFilter] = useState(initialModuleId);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, formCourseId: initialCourseId, moduleId: initialModuleId });
  const [saving, setSaving] = useState(false);

  // Component options (per course) shared by the create form + link editor.
  const [comp, setComp] = useState<CompMap>(EMPTY_COMP);
  const [compCourseId, setCompCourseId] = useState('');
  const [compLoading, setCompLoading] = useState(false);

  // Per-row link editor modal.
  const [linkEditor, setLinkEditor] = useState<{ lesson: Lesson; linkType: '' | LinkType; linkId: string } | null>(null);
  const [linkSaving, setLinkSaving] = useState(false);

  const loadComponents = useCallback(async (courseId: string) => {
    if (!courseId) { setComp(EMPTY_COMP); setCompCourseId(''); return; }
    setCompLoading(true);
    try {
      const [g, p, d, c] = await Promise.all([
        fetch(`/api/admin/grammar?courseId=${courseId}`).then(r => r.json()),
        fetch(`/api/admin/phrases?courseId=${courseId}`).then(r => r.json()),
        fetch(`/api/admin/dialogues?courseId=${courseId}`).then(r => r.json()),
        fetch(`/api/admin/comprehensions?courseId=${courseId}`).then(r => r.json()),
      ]);
      const pick = (rows: any[]): CompOption[] =>
        (rows ?? []).map((t) => ({ id: t.id, title: t.title, titleTranslated: t.titleTranslated }));
      setComp({
        grammar: pick(g.topics),
        phrases: pick(p.collections),
        dialogue: pick(d.dialogues),
        comprehension: pick(c.comprehensions),
      });
      setCompCourseId(courseId);
    } catch { /* ignore */ } finally { setCompLoading(false); }
  }, []);

  // Auto-fill courseId in form and filter when initialModuleId is present
  useEffect(() => {
    if (initialModuleId && allModules.length > 0) {
      const mod = allModules.find(m => m.id === initialModuleId);
      if (mod) {
        setCourseFilter(mod.courseId);
        setForm(f => ({ ...f, formCourseId: mod.courseId, moduleId: initialModuleId }));
      }
    }
  }, [initialModuleId, allModules]);

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

  // Load this course's components for the create form's picker.
  useEffect(() => {
    if (showForm && form.formCourseId) loadComponents(form.formCourseId);
  }, [showForm, form.formCourseId, loadComponents]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        moduleId: form.moduleId,
        title: form.title,
        titleTranslated: form.titleTranslated || form.title,
        type: form.type,
        cefrLevel: form.cefrLevel || null,
        skillType: form.skillType,
        emoji: form.emoji || '📝',
        xpReward: Number(form.xpReward),
        duration: Number(form.duration),
      };
      if (form.linkType) { payload.linkType = form.linkType; payload.linkId = form.linkId || null; }
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

  function openLinkEditor(lesson: Lesson) {
    const cur = linkedOf(lesson);
    setLinkEditor({ lesson, linkType: cur?.type ?? '', linkId: cur?.id ?? '' });
    const cid = lesson.module?.course?.id;
    if (cid) loadComponents(cid);
  }

  async function handleSaveLink() {
    if (!linkEditor) return;
    setLinkSaving(true);
    try {
      const res = await fetch(`/api/admin/lessons/${linkEditor.lesson.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkType: linkEditor.linkType || '', linkId: linkEditor.linkType ? (linkEditor.linkId || null) : null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Хатогӣ');
      setLinkEditor(null);
      fetchLessons();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setLinkSaving(false); }
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
                  onChange={e => setForm(f => ({ ...f, formCourseId: e.target.value, moduleId: '', linkType: '', linkId: '' }))}
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
              {/* CEFR level */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Сатҳи CEFR</label>
                <select value={form.cefrLevel} onChange={e => setForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  <option value="">↪ Аз курс мерос мегирад</option>
                  {CEFR_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </div>
              {/* Skill type */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Навъи маҳорат</label>
                <select value={form.skillType} onChange={e => setForm(f => ({ ...f, skillType: e.target.value }))} style={FIELD}>
                  {SKILL_TYPES.map(s => <option key={s} value={s}>{SKILL_EMOJI[s] ?? ''} {s}</option>)}
                </select>
              </div>
              {/* Component link type */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Компоненти пайваст</label>
                <select
                  value={form.linkType}
                  onChange={e => setForm(f => ({ ...f, linkType: e.target.value as '' | LinkType, linkId: '' }))}
                  disabled={!form.formCourseId}
                  style={FIELD}
                >
                  {LINK_TYPES.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
                </select>
              </div>
              {/* Component target */}
              {form.linkType && (
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                    {LINK_LABEL[form.linkType]} {compLoading ? '⏳' : ''}
                  </label>
                  <select
                    value={form.linkId}
                    onChange={e => setForm(f => ({ ...f, linkId: e.target.value }))}
                    style={FIELD}
                  >
                    <option value="">Интихоб кунед…</option>
                    {comp[form.linkType].map(o => (
                      <option key={o.id} value={o.id}>{o.title}{o.titleTranslated && o.titleTranslated !== o.title ? ` — ${o.titleTranslated}` : ''}</option>
                    ))}
                  </select>
                  {comp[form.linkType].length === 0 && !compLoading && (
                    <div style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>
                      Дар ин курс ягон {LINK_LABEL[form.linkType]} нест.
                    </div>
                  )}
                </div>
              )}
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(20,184,166,0.15)', color: '#2DD4BF', fontWeight: 600 }}>
                          {SKILL_EMOJI[lesson.skillType ?? 'vocab'] ?? ''} {lesson.skillType ?? lesson.type}
                        </span>
                        {lesson.cefrLevel && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '5px', background: 'rgba(139,92,246,0.15)', color: '#A78BFA', fontWeight: 700 }}>
                            {lesson.cefrLevel}
                          </span>
                        )}
                        {(() => {
                          const lk = linkedOf(lesson);
                          return lk ? (
                            <span title={lk.title} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '5px', background: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontWeight: 700, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              🔗 {LINK_LABEL[lk.type]}: {lk.title}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text3)', fontSize: '12px' }}>
                      {lesson.module?.course ? (
                        <span>
                          {lesson.module.course.emoji} {lesson.module.course.targetLanguage?.flag ?? ''} {lesson.module.course.level}
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
                      <button onClick={() => openLinkEditor(lesson)}
                        style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        🔗 Пайванд
                      </button>
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

      {/* Link editor modal */}
      {linkEditor && (
        <div
          onClick={() => !linkSaving && setLinkEditor(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
        >
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ padding: 24, borderRadius: 16, width: 'min(460px, 100%)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>🔗 Компоненти пайваст</h3>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
              {linkEditor.lesson.emoji} {linkEditor.lesson.title}
            </p>

            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>Намуд</label>
            <select
              value={linkEditor.linkType}
              onChange={e => setLinkEditor(le => le ? { ...le, linkType: e.target.value as '' | LinkType, linkId: '' } : le)}
              style={{ ...FIELD, marginBottom: 14 }}
            >
              {LINK_TYPES.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
            </select>

            {linkEditor.linkType && (
              <>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>
                  {LINK_LABEL[linkEditor.linkType]} {compLoading ? '⏳' : ''}
                </label>
                <select
                  value={linkEditor.linkId}
                  onChange={e => setLinkEditor(le => le ? { ...le, linkId: e.target.value } : le)}
                  style={FIELD}
                >
                  <option value="">Интихоб кунед…</option>
                  {comp[linkEditor.linkType].map(o => (
                    <option key={o.id} value={o.id}>{o.title}{o.titleTranslated && o.titleTranslated !== o.title ? ` — ${o.titleTranslated}` : ''}</option>
                  ))}
                </select>
                {comp[linkEditor.linkType].length === 0 && !compLoading && (
                  <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>
                    Дар ин курс ягон {LINK_LABEL[linkEditor.linkType]} нест.
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
              <button
                onClick={handleSaveLink}
                disabled={linkSaving || (!!linkEditor.linkType && !linkEditor.linkId)}
                style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: linkSaving ? 'not-allowed' : 'pointer', opacity: (!!linkEditor.linkType && !linkEditor.linkId) ? 0.5 : 1 }}>
                {linkSaving ? '⏳ Нигоҳ доштан…' : '✅ Нигоҳ доштан'}
              </button>
              <button type="button" onClick={() => setLinkEditor(null)} disabled={linkSaving}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}>
                Бекор
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLessonsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад...</div>}>
      <LessonsContent />
    </Suspense>
  );
}
