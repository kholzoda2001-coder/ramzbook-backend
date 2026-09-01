'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' };
const GHOST: React.CSSProperties = { ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };
const SMALL: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' };
const SMALL_DEL: React.CSSProperties = { ...SMALL, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' };

interface Language { id: string; code: string; name: string; nativeName: string; flag: string; canBeNative: boolean; canBeTarget: boolean; }
interface Category { id: string; title: string; titleTranslated: string; scenario: string | null; emoji: string; isPremium: boolean; isActive: boolean; order: number; requiresCategoryId?: string | null; _count?: { lessons: number }; }
interface Item {
  id: string; kind: string; text: string; translation: string;
  literal: string | null; note: string | null; audioUrl: string | null;
  cue: string | null; cueTranslation: string | null;
  chainOverride?: string[]; swaps?: string[]; wordCount?: number;
}
interface Lesson { id: string; title: string | null; order: number; isActive: boolean; items: Item[]; }
interface CategoryDetail extends Category { lessons: Lesson[]; }

interface Issue { code: string; severity: 'error' | 'warning'; message: string; itemId?: string }
interface PreviewStep { kind: string; badge: string; target?: string; prompt?: string; itemId: string; _stepId: string }
interface Preview { engineVersion: number; steps: PreviewStep[]; issues: Issue[]; lesson: { items: number; usable: number } }

const EMPTY_CATEGORY = { title: '', titleTranslated: '', scenario: '', emoji: '🎙️', isPremium: false, requiresCategoryId: '' };
const EMPTY_ITEM = {
  kind: 'sentence', text: '', translation: '', literal: '', note: '',
  cue: '', cueTranslation: '', audioUrl: '', chainOverride: '', swaps: '',
};
type ItemForm = typeof EMPTY_ITEM;

async function api(url: string, method: string, body?: unknown) {
  const r = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const issues = (d.issues as Issue[] | undefined)?.map((i) => `• ${i.message}`).join('\n');
    throw new Error(issues || d.error || 'Хатогӣ');
  }
  return d;
}
const post = (u: string, b: unknown) => api(u, 'POST', b);
const put = (u: string, b: unknown) => api(u, 'PUT', b);
const del = (u: string) => api(u, 'DELETE');

function SpeakingContent() {
  const searchParams = useSearchParams();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [targetId, setTargetId] = useState(searchParams.get('targetLanguageId') || '');
  const [nativeId, setNativeId] = useState(searchParams.get('nativeLanguageId') || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<CategoryDetail | null>(null);

  const pairChosen = Boolean(targetId && nativeId);

  const fetchLanguages = useCallback(async () => {
    try { const r = await fetch('/api/admin/languages'); const d = await r.json(); setLanguages(d.languages ?? []); } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!targetId || !nativeId) { setCategories([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/speaking?targetLanguageId=${targetId}&nativeLanguageId=${nativeId}`);
      const d = await r.json(); setCategories(d.categories ?? []);
    } catch { setCategories([]); } finally { setLoading(false); }
  }, [targetId, nativeId]);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);
  useEffect(() => { fetchCategories(); setDetail(null); }, [fetchCategories]);

  async function submitCategory(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...form, requiresCategoryId: form.requiresCategoryId || null };
      if (editingCat) await put(`/api/admin/speaking/${editingCat}`, body);
      else await post('/api/admin/speaking', { ...body, targetLanguageId: targetId, nativeLanguageId: nativeId });
      setForm(EMPTY_CATEGORY); setShowForm(false); setEditingCat(null);
      fetchCategories();
      if (detail) openDetail(detail.id);
    } catch (e: any) { alert('Хатогӣ:\n' + e.message); } finally { setSaving(false); }
  }

  function startEditCategory(c: Category) {
    setEditingCat(c.id);
    setForm({
      title: c.title, titleTranslated: c.titleTranslated, scenario: c.scenario ?? '',
      emoji: c.emoji, isPremium: c.isPremium, requiresCategoryId: c.requiresCategoryId ?? '',
    });
    setShowForm(true);
  }

  async function deleteCategory(id: string, title: string) {
    if (!confirm(`Категорияи "${title}" нест карда шавад? Ҳамаи калима/ҷумлаҳои он низ нест мешаванд.`)) return;
    try { await del(`/api/admin/speaking/${id}`); if (detail?.id === id) setDetail(null); fetchCategories(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function toggleCategoryActive(c: Category) {
    try { await put(`/api/admin/speaking/${c.id}`, { isActive: !c.isActive }); fetchCategories(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/speaking/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.category); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) await openDetail(detail.id); fetchCategories(); }

  const targets = languages.filter(l => l.canBeTarget);
  const natives = languages.filter(l => l.canBeNative);

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>🎙️ Спикинг</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Категорияҳои машқи гуфтор — бахши мустақил. Ба дарсҳои роҳнамо (A1–B1) ҳеҷ таъсир намерасонад.
          </p>
        </div>
        {pairChosen && (
          <button onClick={() => { setShowForm(!showForm); setEditingCat(null); setForm(EMPTY_CATEGORY); }} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Категорияи нав</button>
        )}
      </div>

      <div className="fade-up" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ ...FIELD, maxWidth: 260 }}>
          <option value="">📚 Забони омӯзишӣ…</option>
          {targets.map(l => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
        </select>
        <select value={nativeId} onChange={e => setNativeId(e.target.value)} style={{ ...FIELD, maxWidth: 260 }}>
          <option value="">🏠 Забони модарӣ…</option>
          {natives.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
        </select>
      </div>

      {showForm && pairChosen && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>
            {editingCat ? '✏️ Таҳрири категория' : '➕ Категорияи нави спикинг'}
          </h3>
          <form onSubmit={submitCategory}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ordering a drink" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={form.titleTranslated} onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Фармоиши нӯшокӣ" style={FIELD} /></div>
              <div><label style={LABEL}>Эмоҷи</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🥤" style={FIELD} /></div>
              <div>
                <label style={LABEL}>🔒 То кушода шудан лозим</label>
                <select value={form.requiresCategoryId} onChange={e => setForm(f => ({ ...f, requiresCategoryId: e.target.value }))} style={FIELD}>
                  <option value="">— озод —</option>
                  {categories.filter(c => c.id !== editingCat).map(c => <option key={c.id} value={c.id}>{c.emoji} {c.titleTranslated || c.title}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><label style={LABEL}>Вазъият (модарӣ, ихтиёрӣ)</label><input value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} placeholder="Шумо дар кафе ҳастед ва нӯшокӣ фармоиш медиҳед." style={FIELD} /></div>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : editingCat ? '✅ Нигоҳ доштан' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingCat(null); setForm(EMPTY_CATEGORY); }} style={GHOST}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!pairChosen ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗣️</div>
          <p>Ҷуфти забонро интихоб кунед — мас. англисӣ (омӯзишӣ) ← тоҷикӣ (модарӣ).</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.6fr' : '1fr', gap: '20px' }}>
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон категория нест. «+ Категорияи нав»-ро пахш кунед.</div>
            ) : categories.map((cat, i) => (
              <div key={cat.id} onClick={() => openDetail(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', opacity: cat.isActive ? 1 : 0.45, background: detail?.id === cat.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text3)', fontSize: '12px', minWidth: '18px' }}>{i + 1}</span>
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.title} {cat.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}
                    {cat.requiresCategoryId && <span title="қулфшуда" style={{ fontSize: '11px' }}> 🔒</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{cat.titleTranslated} · 📚{cat._count?.lessons ?? 0} дарс</div>
                </div>
                <button onClick={ev => { ev.stopPropagation(); toggleCategoryActive(cat); }} style={SMALL} title="Фаъол/хомӯш">{cat.isActive ? '👁' : '🚫'}</button>
                <button onClick={ev => { ev.stopPropagation(); startEditCategory(cat); }} style={SMALL}>✏️</button>
                <button onClick={ev => { ev.stopPropagation(); deleteCategory(cat.id, cat.title); }} style={SMALL_DEL}>🗑️</button>
              </div>
            ))}
          </div>

          {detail && <CategoryEditor key={detail.id} detail={detail} onChange={reloadDetail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </div>
  );
}

function CategoryEditor({ detail, onChange, onClose }: { detail: CategoryDetail; onChange: () => void; onClose: () => void }) {
  const [openLesson, setOpenLesson] = useState<string | null>(detail.lessons[0]?.id ?? null);

  async function addLesson() {
    const title = prompt('Унвони дарс (метавонед холӣ гузоред):') ?? '';
    try { await post('/api/admin/speaking/lessons', { categoryId: detail.id, title }); onChange(); }
    catch (e: any) { alert(e.message); }
  }
  async function renameLesson(l: Lesson) {
    const title = prompt('Унвони нави дарс:', l.title ?? '');
    if (title === null) return;
    try { await put(`/api/admin/speaking/lessons/${l.id}`, { title }); onChange(); }
    catch (e: any) { alert(e.message); }
  }
  async function toggleLesson(l: Lesson) {
    try { await put(`/api/admin/speaking/lessons/${l.id}`, { isActive: !l.isActive }); onChange(); }
    catch (e: any) { alert(e.message); }
  }
  async function deleteLesson(id: string, n: number) {
    if (!confirm(`Дарси ${n} нест карда шавад? Ҳамаи калима/ҷумлаҳои он низ нест мешаванд.`)) return;
    try { await del(`/api/admin/speaking/lessons/${id}`); onChange(); }
    catch (e: any) { alert(e.message); }
  }

  const H: React.CSSProperties = { fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' };

  return (
    <div className="glass-card fade-up" style={{ padding: '20px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.emoji} {detail.title}</h2>
        <button onClick={onClose} style={SMALL}>✕ Пӯшидан</button>
      </div>

      {detail.scenario && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{detail.scenario}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={H}>📚 Дарсҳо ({detail.lessons.length})</div>
        <button onClick={addLesson} style={BTN}>+ Дарси нав</button>
      </div>

      {detail.lessons.length === 0 && (
        <p style={{ color: 'var(--text3)', fontSize: '13px', padding: '16px 0' }}>
          Ҳанӯз дарсе нест. «+ Дарси нав» — баъд ба ҳар дарс 3–5 калима ва ҷумлаҳои онҳоро андозед.
        </p>
      )}

      {detail.lessons.map((lesson, i) => {
        const words = lesson.items.filter(x => x.kind === 'word').length;
        const open = openLesson === lesson.id;
        return (
          <div key={lesson.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden', opacity: lesson.isActive ? 1 : 0.5 }}>
            <div onClick={() => setOpenLesson(open ? null : lesson.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', cursor: 'pointer', background: open ? 'rgba(20,184,166,0.10)' : 'transparent' }}>
              <span style={{ color: 'var(--text3)', fontSize: '12px' }}>{open ? '▾' : '▸'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{lesson.title || `Дарси ${i + 1}`}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>🔤 {words} калима · 🗣️ {lesson.items.length} машқ</div>
              </div>
              <button onClick={ev => { ev.stopPropagation(); toggleLesson(lesson); }} style={SMALL} title="Фаъол/хомӯш">{lesson.isActive ? '👁' : '🚫'}</button>
              <button onClick={ev => { ev.stopPropagation(); renameLesson(lesson); }} style={SMALL}>✏️</button>
              <button onClick={ev => { ev.stopPropagation(); deleteLesson(lesson.id, i + 1); }} style={SMALL_DEL}>🗑️</button>
            </div>
            {open && <LessonEditor lesson={lesson} onChange={onChange} />}
          </div>
        );
      })}
    </div>
  );
}

function LessonEditor({ lesson, onChange }: { lesson: Lesson; onChange: () => void }) {
  const [iForm, setIForm] = useState<ItemForm>(EMPTY_ITEM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pvLoading, setPvLoading] = useState(false);

  const body = () => ({
    kind: iForm.kind,
    text: iForm.text,
    translation: iForm.translation,
    literal: iForm.literal,
    note: iForm.note,
    cue: iForm.cue,
    cueTranslation: iForm.cueTranslation,
    audioUrl: iForm.audioUrl,
    chainOverride: iForm.chainOverride.split('\n').map(s => s.trim()).filter(Boolean),
    swaps: iForm.swaps.split(',').map(s => s.trim()).filter(Boolean),
  });

  async function save() {
    setBusy(true);
    try {
      if (editingId) await put(`/api/admin/speaking/items/${editingId}`, body());
      else await post('/api/admin/speaking/items', { lessonId: lesson.id, ...body() });
      setIForm(EMPTY_ITEM); setEditingId(null); onChange(); setPreview(null);
    } catch (e: any) { alert('Валидатор рад кард:\n\n' + e.message); }
    finally { setBusy(false); }
  }

  function startEdit(it: Item) {
    setEditingId(it.id);
    setIForm({
      kind: it.kind, text: it.text, translation: it.translation,
      literal: it.literal ?? '', note: it.note ?? '',
      cue: it.cue ?? '', cueTranslation: it.cueTranslation ?? '',
      audioUrl: it.audioUrl ?? '',
      chainOverride: (it.chainOverride ?? []).join('\n'),
      swaps: (it.swaps ?? []).join(', '),
    });
  }

  async function loadPreview() {
    setPvLoading(true);
    try {
      const r = await fetch(`/api/admin/speaking/preview?lessonId=${lesson.id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPreview(d);
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
    finally { setPvLoading(false); }
  }

  const autoChain = () => {
    const chain = buildChain(iForm.text, DEFAULT_CONFIG);
    if (chain.length === 0) { alert('Занҷир сохта нашуд — ҷумла бояд камаш 3 калима дошта бошад.'); return; }
    setIForm(f => ({ ...f, chainOverride: chain.join('\n') }));
  };

  const errors = preview?.issues.filter(i => i.severity === 'error').length ?? 0;
  const warns = preview?.issues.filter(i => i.severity === 'warning').length ?? 0;
  const lamp = errors ? '🔴' : warns ? '🟡' : '🟢';

  return (
    <div style={{ padding: '4px 12px 14px' }}>
      {lesson.items.map(it => (
        <div key={it.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: editingId === it.id ? 'rgba(20,184,166,0.10)' : undefined }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)', minWidth: '52px' }}>{it.kind === 'word' ? '🔤 калима' : '💬 ҷумла'}</span>
          <div style={{ flex: 1 }}>
            {it.cue ? <div style={{ color: 'var(--text3)', fontSize: '12px' }}>🗣️ {it.cue}</div> : null}
            <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
              {it.text}
              {it.audioUrl ? <span title="садо ҳаст"> 🔊</span> : null}
              {(it.chainOverride?.length ?? 0) > 0 ? <span title="занҷири дастӣ"> ⛓</span> : null}
              {(it.swaps?.length ?? 0) > 0 ? <span title="вариантҳои иваз"> 🔁</span> : null}
            </div>
            <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{it.translation}{it.literal ? ` · «${it.literal}»` : ''}</div>
          </div>
          <button onClick={() => startEdit(it)} style={SMALL}>✏️</button>
          <button onClick={async () => { if (!confirm('Нест карда шавад?')) return; try { await del(`/api/admin/speaking/items/${it.id}`); onChange(); setPreview(null); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
        </div>
      ))}

      <div style={{ marginTop: '12px', padding: '12px', border: '1px dashed var(--border)', borderRadius: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          {editingId ? '✏️ Таҳрири воҳид' : '➕ Воҳиди нав'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px' }}>
          <select value={iForm.kind} onChange={e => setIForm(f => ({ ...f, kind: e.target.value }))} style={{ ...FIELD, width: 'auto' }}>
            <option value="word">🔤 Калима</option>
            <option value="sentence">💬 Ҷумла</option>
          </select>
          <input value={iForm.text} onChange={e => setIForm(f => ({ ...f, text: e.target.value }))} placeholder="coffee  /  I would like a coffee." style={FIELD} />
          <input value={iForm.translation} onChange={e => setIForm(f => ({ ...f, translation: e.target.value }))} placeholder="қаҳва  /  Ман қаҳва мехоҳам." style={FIELD} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <input value={iForm.literal} onChange={e => setIForm(f => ({ ...f, literal: e.target.value }))} placeholder="Талаффуз (ихтиёрӣ)" style={FIELD} />
          <input value={iForm.note} onChange={e => setIForm(f => ({ ...f, note: e.target.value }))} placeholder="Эзоҳ (ихтиёрӣ)" style={FIELD} />
          <input value={iForm.audioUrl} onChange={e => setIForm(f => ({ ...f, audioUrl: e.target.value }))} placeholder="🔊 URL-и садо (ихтиёрӣ)" style={FIELD} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <input value={iForm.cue} onChange={e => setIForm(f => ({ ...f, cue: e.target.value }))} placeholder="🗣️ Ҳамсӯҳбат мегӯяд (ихтиёрӣ)" style={FIELD} />
          <input value={iForm.cueTranslation} onChange={e => setIForm(f => ({ ...f, cueTranslation: e.target.value }))} placeholder="Тарҷумаи ҷумлаи ҳамсӯҳбат" style={FIELD} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', marginTop: '8px', alignItems: 'start' }}>
          <div>
            <label style={LABEL}>⛓ Занҷир (як сатр = як зина, аз кӯтоҳ ба дароз)</label>
            <textarea value={iForm.chainOverride} onChange={e => setIForm(f => ({ ...f, chainOverride: e.target.value }))} rows={3} placeholder={'is Muhammad\nname is Muhammad'} style={{ ...FIELD, fontFamily: 'monospace' }} />
          </div>
          <button type="button" onClick={autoChain} style={{ ...GHOST, marginTop: 24, whiteSpace: 'nowrap' }}>⚙️ Худкор сохтан</button>
          <div>
            <label style={LABEL}>🔁 Вариантҳои иваз (бо вергул)</label>
            <input value={iForm.swaps} onChange={e => setIForm(f => ({ ...f, swaps: e.target.value }))} placeholder="Sitora, Karim" style={FIELD} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <button onClick={save} disabled={busy || !iForm.text || !iForm.translation} style={BTN}>
            {busy ? '⏳…' : editingId ? '✅ Нигоҳ доштан' : '+ Илова'}
          </button>
          {editingId && <button onClick={() => { setEditingId(null); setIForm(EMPTY_ITEM); }} style={GHOST}>Бекор</button>}
          <div style={{ flex: 1 }} />
          <button onClick={loadPreview} disabled={pvLoading} style={{ ...BTN, background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
            {pvLoading ? '⏳…' : '👁 Пешнамоиш'}
          </button>
        </div>
      </div>

      {preview && (
        <div style={{ marginTop: '14px', padding: '14px', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>{lamp}</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
              {preview.steps.length} қадам · {errors} хато · {warns} огоҳӣ
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>муҳаррик v{preview.engineVersion}</span>
            <button onClick={() => setPreview(null)} style={SMALL}>✕</button>
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.7 }}>
            {preview.steps.map((s, i) => (
              <div key={s._stepId} style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text3)' }}>{String(i + 1).padStart(2, ' ')}.</span>{' '}
                <span style={{ color: '#14B8A6', fontWeight: 700 }}>{s.kind.padEnd(9, ' ')}</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{s.target || s.prompt}</span>
                {s.badge !== 'none' && <span style={{ color: '#FBBF24', fontSize: '11px' }}> [{s.badge}]</span>}
              </div>
            ))}
          </div>

          {preview.issues.length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px', maxHeight: 200, overflowY: 'auto' }}>
              {preview.issues.map((is, i) => (
                <div key={i} style={{ fontSize: '12.5px', color: is.severity === 'error' ? '#EF4444' : '#FBBF24', marginBottom: 4 }}>
                  {is.severity === 'error' ? '🔴' : '🟡'} <b>{is.code}</b> — {is.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSpeakingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <SpeakingContent />
    </Suspense>
  );
}
