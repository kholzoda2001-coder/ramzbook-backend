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
interface Dialogue { id: string; title: string; titleTranslated: string; emoji: string; cefrLevel: string | null; isPremium: boolean; isActive: boolean; order: number; _count?: { lines: number }; }
interface Line { id: string; speaker: string; text: string; translation: string; audioUrl: string | null; isUser: boolean; }
interface DialogueDetail extends Dialogue { scenario: string | null; lines: Line[]; }

const EMPTY_DIALOGUE = { title: '', titleTranslated: '', scenario: '', cefrLevel: '', emoji: '🎙️', isPremium: false };

function DialoguesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_DIALOGUE);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<DialogueDetail | null>(null);

  const fetchCourses = useCallback(async () => {
    try { const r = await fetch('/api/admin/courses'); const d = await r.json(); setCourses(d.courses ?? []); } catch {}
  }, []);
  const fetchDialogues = useCallback(async () => {
    if (!courseId) { setDialogues([]); return; }
    setLoading(true);
    try { const r = await fetch(`/api/admin/dialogues?courseId=${courseId}`); const d = await r.json(); setDialogues(d.dialogues ?? []); }
    catch { setDialogues([]); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchDialogues(); setDetail(null); }, [fetchDialogues]);

  async function createDialogue(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch('/api/admin/dialogues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, courseId, cefrLevel: form.cefrLevel || null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setForm(EMPTY_DIALOGUE); setShowForm(false); fetchDialogues();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteDialogue(id: string, title: string) {
    if (!confirm(`Муколамаи "${title}" нест карда шавад? Ҳамаи сатрҳои он низ нест мешаванд.`)) return;
    try { const r = await fetch(`/api/admin/dialogues/${id}`, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } if (detail?.id === id) setDetail(null); fetchDialogues(); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/dialogues/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.dialogue); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) openDetail(detail.id); fetchDialogues(); }

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>🎙️ Муколамаҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Муколамаҳои воқеӣ бо сатрҳои навбатӣ — барои ҳар курс</p>
        </div>
        {courseId && (
          <button onClick={() => setShowForm(!showForm)} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Муколамаи нав</button>
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
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Муколамаи нав</h3>
          <form onSubmit={createDialogue}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ordering Coffee" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={form.titleTranslated} onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Фармоиши қаҳва" style={FIELD} /></div>
              <div><label style={LABEL}>Эмоҷи</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🎙️" style={FIELD} /></div>
              <div><label style={LABEL}>Сатҳи CEFR</label>
                <select value={form.cefrLevel} onChange={e => setForm(f => ({ ...f, cefrLevel: e.target.value }))} style={FIELD}>
                  <option value="">↪ Аз курс мерос мегирад</option>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={LABEL}>Сенария / вазъият (ба забони модарӣ, ихтиёрӣ)</label>
              <textarea value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} rows={3} placeholder="Шумо ба қаҳвахона даромадед ва мехоҳед қаҳва фармоиш диҳед…" style={{ ...FIELD, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_DIALOGUE); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
            </div>
          </form>
        </div>
      )}

      {!courseId ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗨️</div>
          <p>Барои дидани муколамаҳо як курс интихоб кунед.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.4fr' : '1fr', gap: '20px' }}>
          {/* Dialogues list */}
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : dialogues.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон муколама нест.</div>
            ) : dialogues.map(d => (
              <div key={d.id} onClick={() => openDetail(d.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: detail?.id === d.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '20px' }}>{d.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.title} {d.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{d.titleTranslated} · {d.cefrLevel ?? '—'} · 🗨️{d._count?.lines ?? 0}</div>
                </div>
                <button onClick={ev => { ev.stopPropagation(); deleteDialogue(d.id, d.title); }} style={SMALL_DEL}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Detail editor */}
          {detail && <DialogueEditor key={detail.id} detail={detail} onChange={reloadDetail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </div>
  );
}

function DialogueEditor({ detail, onChange, onClose }: { detail: DialogueDetail; onChange: () => void; onClose: () => void }) {
  const [lForm, setLForm] = useState({ speaker: '', text: '', translation: '', isUser: false });

  async function post(url: string, body: unknown) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ'); return d;
  }
  async function del(url: string) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } }

  async function addLine() {
    try { await post('/api/admin/dialogues/lines', { dialogueId: detail.id, ...lForm }); setLForm(f => ({ speaker: f.speaker, text: '', translation: '', isUser: f.isUser })); onChange(); }
    catch (e: any) { alert(e.message); }
  }

  const H: React.CSSProperties = { fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' };

  return (
    <div className="glass-card fade-up" style={{ padding: '20px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{detail.emoji} {detail.title}</h2>
        <button onClick={onClose} style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>✕ Пӯшидан</button>
      </div>

      {detail.scenario && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '13px' }}>📋 {detail.scenario}</div>
      )}

      <div style={{ marginBottom: '22px' }}>
        <div style={H}>🗨️ Сатрҳо ({detail.lines.length})</div>
        {detail.lines.map(l => (
          <div key={l.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                <span style={{ fontSize: '11px', color: l.isUser ? '#4ADE80' : '#A78BFA' }}>[{l.isUser ? 'Ман' : l.speaker}]</span> {l.text}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{l.translation}</div>
            </div>
            <button onClick={async () => { try { await del(`/api/admin/dialogues/lines/${l.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr 1.3fr', gap: '8px', marginTop: '10px' }}>
          <input value={lForm.speaker} onChange={e => setLForm(f => ({ ...f, speaker: e.target.value }))} placeholder="Гӯянда: Barista" style={FIELD} />
          <input value={lForm.text} onChange={e => setLForm(f => ({ ...f, text: e.target.value }))} placeholder="What can I get you?" style={FIELD} />
          <input value={lForm.translation} onChange={e => setLForm(f => ({ ...f, translation: e.target.value }))} placeholder="Чӣ биёрам?" style={FIELD} />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={lForm.isUser} onChange={e => setLForm(f => ({ ...f, isUser: e.target.checked }))} /> Сатри корбар (Ман)
          </label>
          <button onClick={addLine} disabled={!lForm.speaker || !lForm.text || !lForm.translation} style={BTN}>+ Илова</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDialoguesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>⏳ Бор мешавад…</div>}>
      <DialoguesContent />
    </Suspense>
  );
}
