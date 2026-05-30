'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
const BTN_GHOST: React.CSSProperties = { ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };

interface Course { id: string; level: string; emoji: string; targetLanguage: { flag: string; name: string }; nativeLanguage: { flag: string; nativeName: string }; }
interface Container { id: string; title: string; titleTranslated?: string }
interface Lang { id: string; name: string; nativeName: string; flag: string; canBeTarget: boolean; canBeNative: boolean }

// type → { label, courseScoped, container API + key, sample item }
const TYPES: Record<string, {
  label: string;
  courseScoped: boolean;
  api?: string;        // container list endpoint (course-scoped)
  key?: string;        // response key holding the array
  containerLabel?: string;
  sample: unknown[];
}> = {
  phrases: {
    label: '💬 Ибораҳо (Phrases) → Маҷмӯа', courseScoped: true, api: '/api/admin/phrases', key: 'collections', containerLabel: 'Маҷмӯа',
    sample: [{ text: 'Good morning', translation: 'Субҳ ба хайр', literal: '', note: '' }],
  },
  dialogue_lines: {
    label: '🎙️ Сатрҳои муколама → Муколама', courseScoped: true, api: '/api/admin/dialogues', key: 'dialogues', containerLabel: 'Муколама',
    sample: [{ speaker: 'Barista', text: 'What can I get you?', translation: 'Чӣ биёрам?', isUser: false }],
  },
  comprehension_questions: {
    label: '📖 Саволҳои дарк → Машқи дарк', courseScoped: true, api: '/api/admin/comprehensions', key: 'comprehensions', containerLabel: 'Машқ',
    sample: [{ question: 'Where did Alex go?', questionTranslated: 'Алекс куҷо рафт?', options: ['Home', 'School', 'Park'], correctIndex: 1, explanation: '' }],
  },
  grammar_examples: {
    label: '🔤 Мисолҳои грамматика → Мавзӯъ', courseScoped: true, api: '/api/admin/grammar', key: 'topics', containerLabel: 'Мавзӯъ',
    sample: [{ sentence: 'She works here.', translation: 'Вай дар ин ҷо кор мекунад.', highlight: 'works' }],
  },
  grammar_rules: {
    label: '🔤 Қоидаҳои грамматика → Мавзӯъ', courseScoped: true, api: '/api/admin/grammar', key: 'topics', containerLabel: 'Мавзӯъ',
    sample: [{ pattern: 'Subject + verb(+s)', note: 'Барои шахси сеюми танҳо -s илова мешавад.' }],
  },
  grammar_exercises: {
    label: '🔤 Машқҳои грамматика → Мавзӯъ', courseScoped: true, api: '/api/admin/grammar', key: 'topics', containerLabel: 'Мавзӯъ',
    sample: [{ type: 'fill_blank', prompt: 'She ___ (work) here.', answer: 'works', explanation: '' }],
  },
  placement: {
    label: '🎯 Саволҳои санҷиши сатҳ → Ҷуфти забон', courseScoped: false,
    sample: [{ cefrLevel: 'A1', skill: 'grammar', prompt: 'I ___ a student.', promptTranslated: '', options: ['am', 'is', 'are'], answer: 'am', explanation: '' }],
  },
};

export default function AdminImportPage() {
  const [type, setType] = useState<keyof typeof TYPES>('phrases');
  const cfg = TYPES[type];

  // course-scoped selectors
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [containers, setContainers] = useState<Container[]>([]);
  const [parentId, setParentId] = useState('');

  // placement selectors
  const [langs, setLangs] = useState<Lang[]>([]);
  const [targetLanguageId, setTargetLanguageId] = useState('');
  const [nativeLanguageId, setNativeLanguageId] = useState('');

  const [raw, setRaw] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── load courses + languages once ──
  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(d => setCourses(d.courses ?? [])).catch(() => {});
    fetch('/api/admin/languages').then(r => r.json()).then(d => setLangs(d.languages ?? [])).catch(() => {});
  }, []);

  // ── load containers when course/type changes ──
  const fetchContainers = useCallback(async () => {
    setParentId('');
    if (!cfg.courseScoped || !cfg.api || !courseId) { setContainers([]); return; }
    try {
      const r = await fetch(`${cfg.api}?courseId=${courseId}`);
      const d = await r.json();
      setContainers((d[cfg.key as string] ?? []) as Container[]);
    } catch { setContainers([]); }
  }, [cfg, courseId]);
  useEffect(() => { fetchContainers(); }, [fetchContainers]);

  // reset selections when type switches between scoped/placement
  useEffect(() => { setMsg(null); }, [type]);

  // ── parse + count preview ──
  const parsed = useMemo<{ items: unknown[]; error: string | null }>(() => {
    const txt = raw.trim();
    if (!txt) return { items: [], error: null };
    try {
      const j = JSON.parse(txt);
      if (!Array.isArray(j)) return { items: [], error: 'JSON бояд массив ([ … ]) бошад.' };
      return { items: j, error: null };
    } catch (e: any) {
      return { items: [], error: 'JSON нодуруст: ' + (e?.message ?? '') };
    }
  }, [raw]);

  const targetLangs = useMemo(() => langs.filter(l => l.canBeTarget), [langs]);
  const nativeLangs = useMemo(() => langs.filter(l => l.canBeNative), [langs]);

  const ready = parsed.items.length > 0 && !parsed.error && (
    cfg.courseScoped ? !!parentId : (!!targetLanguageId && !!nativeLanguageId)
  );

  function loadSample() { setRaw(JSON.stringify(cfg.sample, null, 2)); }

  async function runImport() {
    if (!ready) return;
    setBusy(true); setMsg(null);
    try {
      const body: Record<string, unknown> = { type, mode, items: parsed.items };
      if (cfg.courseScoped) body.parentId = parentId;
      else { body.targetLanguageId = targetLanguageId; body.nativeLanguageId = nativeLanguageId; }
      const r = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setMsg({ ok: true, text: `✅ ${d.inserted} сабт ворид шуд (${mode === 'replace' ? 'ҷойгузин' : 'илова'}). Ҳозир ҳамагӣ: ${d.total}.` });
      setRaw('');
    } catch (e: any) {
      setMsg({ ok: false, text: '❌ ' + e.message });
    } finally { setBusy(false); }
  }

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>📥 Воридоти оммавӣ</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Мундариҷаро ба таври JSON ба як контейнер ё ҷуфти забон ворид кунед. «Ҷойгузин» сабтҳои кӯҳнаро нест мекунад.
        </p>
      </div>

      <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', maxWidth: 900 }}>
        {/* type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Навъи мундариҷа</label>
          <select value={type} onChange={e => { setType(e.target.value as keyof typeof TYPES); setParentId(''); setRaw(''); }} style={FIELD}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* destination */}
        {cfg.courseScoped ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Курс</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} style={FIELD}>
                <option value="">🌐 Курсро интихоб кунед…</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.targetLanguage.flag} {c.targetLanguage.name} → {c.nativeLanguage.flag} {c.nativeLanguage.nativeName} · {c.level}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL}>{cfg.containerLabel}</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} style={FIELD} disabled={!courseId}>
                <option value="">{courseId ? `${cfg.containerLabel}-ро интихоб кунед…` : 'Аввал курс'}</option>
                {containers.map(c => <option key={c.id} value={c.id}>{c.title}{c.titleTranslated ? ` — ${c.titleTranslated}` : ''}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Забони омӯзишӣ (Target)</label>
              <select value={targetLanguageId} onChange={e => setTargetLanguageId(e.target.value)} style={FIELD}>
                <option value="">Интихоб кунед…</option>
                {targetLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Забони модарӣ (Native)</label>
              <select value={nativeLanguageId} onChange={e => setNativeLanguageId(e.target.value)} style={FIELD}>
                <option value="">Интихоб кунед…</option>
                {nativeLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* JSON */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...LABEL, marginBottom: 0 }}>Маълумот (массиви JSON)</label>
            <button type="button" onClick={loadSample} style={{ ...BTN_GHOST, padding: '4px 12px', fontSize: '12px' }}>📋 Намунаро бор кун</button>
          </div>
          <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={12}
            placeholder={'[\n  { … }\n]'}
            style={{ ...FIELD, fontFamily: 'ui-monospace, monospace', fontSize: '13px', resize: 'vertical' }} />
          <div style={{ fontSize: '12px', marginTop: '6px', color: parsed.error ? '#EF4444' : 'var(--text3)' }}>
            {parsed.error ? parsed.error : raw.trim() ? `✓ ${parsed.items.length} сабт хонда шуд` : 'Массиви JSON ворид кунед ё намунаро бор кунед.'}
          </div>
        </div>

        {/* mode + run */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
            <input type="radio" name="mode" checked={mode === 'append'} onChange={() => setMode('append')} /> ➕ Илова
          </label>
          <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
            <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} /> ♻️ Ҷойгузин (нест + ворид)
          </label>
          <button onClick={runImport} disabled={!ready || busy} style={{ ...BTN, opacity: !ready || busy ? 0.5 : 1, cursor: !ready || busy ? 'not-allowed' : 'pointer' }}>
            {busy ? '⏳ Ворид мешавад…' : '📥 Ворид кардан'}
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
            background: msg.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: msg.ok ? '#10B981' : '#EF4444', border: `1px solid ${msg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
