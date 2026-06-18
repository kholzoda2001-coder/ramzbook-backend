'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' };
const SMALL_DEL: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' };

interface Language { id: string; code: string; name: string; nativeName: string; flag: string; canBeTarget: boolean; canBeNative: boolean; }
interface Word {
  id: string; word: string; translation: string; transcription: string | null; transcriptionTajik: string | null;
  emoji: string | null; example: string | null; exampleTrans: string | null; options: string[]; audioUrl: string | null; order: number;
}

const EMPTY = {
  word: '', translation: '', transcription: '', transcriptionTajik: '', emoji: '', example: '', exampleTrans: '', options: ['', '', '', ''] as string[], correctIndex: 0, audioUrl: '', order: 0
};

function OnboardingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const targetId = params.languageId as string;
  const initialNativeId = searchParams.get('native') || '';

  const [languages, setLanguages] = useState<Language[]>([]);
  const [nativeId, setNativeId] = useState(initialNativeId);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    try { const r = await fetch('/api/admin/languages'); const d = await r.json(); setLanguages(d.languages ?? []); } catch {}
  }, []);

  const fetchWords = useCallback(async () => {
    if (!targetId || !nativeId) { setWords([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/onboarding?targetLanguageId=${targetId}&nativeLanguageId=${nativeId}`);
      const d = await r.json(); setWords(d.words ?? []);
    } catch { setWords([]); } finally { setLoading(false); }
  }, [targetId, nativeId]);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);
  useEffect(() => { fetchWords(); }, [fetchWords]);

  const targetLang = languages.find(l => l.id === targetId);
  const natives = languages.filter(l => l.canBeNative);

  function resetForm() { setForm(EMPTY); setShowForm(false); setEditId(null); }

  async function saveWord() {
    if (!form.word || !form.translation || !nativeId) return alert('Fill required fields and select native language');
    setSaving(true);
    try {
      const opts = form.options.map(o => o.trim()).filter(o => o.length > 0);
      const payload = {
        targetLanguageId: targetId, nativeLanguageId: nativeId,
        word: form.word, translation: form.translation, transcription: form.transcription, transcriptionTajik: form.transcriptionTajik,
        emoji: form.emoji, example: form.example, exampleTrans: form.exampleTrans, options: opts, audioUrl: form.audioUrl, order: form.order,
      };

      const m = editId ? 'PUT' : 'POST';
      const b = editId ? { id: editId, ...payload } : payload;

      const r = await fetch('/api/admin/onboarding', {
        method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b)
      });
      if (r.ok) { resetForm(); fetchWords(); }
      else { const d = await r.json(); alert(d.error || 'Error saving'); }
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  async function deleteWord(id: string) {
    if (!confirm('Ҳатман нест мекунед?')) return;
    try {
      const r = await fetch(`/api/admin/onboarding?id=${id}`, { method: 'DELETE' });
      if (r.ok) fetchWords();
      else alert('Error deleting');
    } catch (e: any) { alert(e.message); }
  }

  function editW(w: Word) {
    const opts = [...w.options];
    while(opts.length < 4) opts.push('');
    let cIdx = opts.indexOf(w.translation);
    if(cIdx < 0 && opts.length > 0) {
        opts[0] = w.translation;
        cIdx = 0;
    }
    setForm({
      word: w.word, translation: w.translation, transcription: w.transcription || '', transcriptionTajik: w.transcriptionTajik || '',
      emoji: w.emoji || '', example: w.example || '', exampleTrans: w.exampleTrans || '', options: opts, correctIndex: cIdx < 0 ? 0 : cIdx,
      audioUrl: w.audioUrl || '', order: w.order
    });
    setEditId(w.id); setShowForm(true);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href={`/admin/courses/${targetId}`} style={{ color: 'var(--text3)', textDecoration: 'none' }}>← Бозгашт</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Дарси Шиносоӣ (Zero-Lesson)</h1>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <span style={LABEL}>Забони Омӯзишӣ</span>
          <div style={{ ...FIELD, background: 'rgba(255,255,255,0.02)', color: 'var(--text3)' }}>
            {targetLang ? `${targetLang.flag} ${targetLang.name}` : 'Loading...'}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <span style={LABEL}>Забони Модарӣ</span>
          <select style={FIELD} value={nativeId} onChange={e => {
            setNativeId(e.target.value);
            const u = new URL(window.location.href);
            u.searchParams.set('native', e.target.value);
            window.history.replaceState({}, '', u.toString());
          }}>
            <option value="">-- Интихоб кунед --</option>
            {natives.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
          </select>
        </div>
      </div>

      {nativeId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Калимаҳо ({words.length})</h2>
            <button style={BTN} onClick={() => { resetForm(); setShowForm(true); }}>+ Иловаи калима</button>
          </div>

          {showForm && (
            <div className="fade-up" style={{ background: 'rgba(20,184,166,0.03)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{editId ? 'Таҳрири калима' : 'Калимаи нав'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>Калима (Забони омӯзишӣ)*</span><input style={FIELD} value={form.word} onChange={e => setForm({...form, word: e.target.value})} placeholder="e.g. Hello" /></div>
                <div><span style={LABEL}>Тарҷума (Забони модарӣ)*</span><input style={FIELD} value={form.translation} onChange={e => {
                    const newTrans = e.target.value;
                    const newOpts = [...form.options];
                    newOpts[form.correctIndex] = newTrans;
                    setForm({...form, translation: newTrans, options: newOpts});
                }} placeholder="e.g. Салом" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>Транскрипсия (IPA)</span><input style={FIELD} value={form.transcription} onChange={e => setForm({...form, transcription: e.target.value})} placeholder="e.g. /həˈloʊ/" /></div>
                <div><span style={LABEL}>Транскрипсияи Тоҷикӣ</span><input style={FIELD} value={form.transcriptionTajik} onChange={e => setForm({...form, transcriptionTajik: e.target.value})} placeholder="e.g. Ҳелоу" /></div>
                <div><span style={LABEL}>Эмоҷи</span><input style={FIELD} value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} placeholder="👋" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>Ҷумлаи намуна</span><input style={FIELD} value={form.example} onChange={e => setForm({...form, example: e.target.value})} placeholder="Hello, friend!" /></div>
                <div><span style={LABEL}>Тарҷумаи намуна</span><input style={FIELD} value={form.exampleTrans} onChange={e => setForm({...form, exampleTrans: e.target.value})} placeholder="Салом, дӯстам!" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>Audio URL</span><input style={FIELD} value={form.audioUrl} onChange={e => setForm({...form, audioUrl: e.target.value})} /></div>
                <div><span style={LABEL}>Order</span><input type="number" style={FIELD} value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)||0})} /></div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={LABEL}>Вариантҳои ҷавоб барои тест (4 дона, ҷавоби дурустро интихоб кунед)</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="radio" checked={form.correctIndex === i} onChange={() => setForm({...form, correctIndex: i, translation: form.options[i]})} />
                      <input style={FIELD} placeholder={`Варианти ${i+1}`} value={form.options[i]} onChange={e => {
                        const newOpts = [...form.options];
                        newOpts[i] = e.target.value;
                        if (form.correctIndex === i) {
                            setForm({...form, options: newOpts, translation: e.target.value});
                        } else {
                            setForm({...form, options: newOpts});
                        }
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ ...BTN, background: 'rgba(255,255,255,0.1)' }} onClick={resetForm}>Бекор кардан</button>
                <button style={BTN} onClick={saveWord} disabled={saving}>{saving ? 'Сабт мешавад...' : 'Сабт кардан'}</button>
              </div>
            </div>
          )}

          {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {words.map(w => (
                <div key={w.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '20px' }}>{w.emoji || '📝'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{w.word}</span>
                      {w.transcriptionTajik && <span style={{ color: 'var(--text3)', fontSize: '12px' }}>[{w.transcriptionTajik}]</span>}
                    </div>
                    <div style={{ color: 'var(--teal)', fontSize: '14px', fontWeight: 600 }}>{w.translation}</div>
                  </div>
                  <div style={{ flex: 2, color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {w.example && <div><i>{w.example}</i></div>}
                    {w.exampleTrans && <div style={{ color: 'var(--text3)' }}>{w.exampleTrans}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none' }} onClick={() => editW(w)}>Таҳрир</button>
                    <button style={SMALL_DEL} onClick={() => deleteWord(w.id)}>Нест кардан</button>
                  </div>
                </div>
              ))}
              {words.length === 0 && !showForm && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  Ҳануз ягон калима илова нашудааст.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
