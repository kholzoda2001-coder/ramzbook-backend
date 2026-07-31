'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
interface Letter {
  id: string; uppercase: string; lowercase: string; ipa: string | null;
  tajikTranscription: string | null; category: string; order: number;
}

const EMPTY = { uppercase: '', lowercase: '', ipa: '', tajikTranscription: '', category: 'vowel', order: 0 };

const CATEGORY_LABEL: Record<string, string> = { vowel: 'Садонок', consonant: 'Ҳамсадо', sign: 'Аломат' };

interface Rule { id: string; category: string; title: string; body: string; order: number; }
const EMPTY_RULE = { category: 'vowel', title: '', body: '', order: 0 };
// The app shows 'general' rules on the combined Алфавит tab, 'vowel' on the
// Садонокҳо tab and 'consonant' on the Ҳамсадоҳо tab.
const RULE_CATEGORY_LABEL: Record<string, string> = { vowel: 'Садонокҳо', consonant: 'Ҳамсадоҳо', general: 'Умумӣ (Алфавит)' };

function AlphabetContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const targetId = params.languageId as string;
  const initialNativeId = searchParams.get('native') || '';

  const [languages, setLanguages] = useState<Language[]>([]);
  const [nativeId, setNativeId] = useState(initialNativeId);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // ── Rules (pronunciation/spelling notes shown above the letter grid) ──
  const [rules, setRules] = useState<Rule[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE);
  const [ruleSaving, setRuleSaving] = useState(false);
  const [ruleEditId, setRuleEditId] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    try { const r = await fetch('/api/admin/languages'); const d = await r.json(); setLanguages(d.languages ?? []); } catch {}
  }, []);

  const fetchLetters = useCallback(async () => {
    if (!targetId || !nativeId) { setLetters([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/alphabet?targetLanguageId=${targetId}&nativeLanguageId=${nativeId}`);
      const d = await r.json(); setLetters(d.letters ?? []);
    } catch { setLetters([]); } finally { setLoading(false); }
  }, [targetId, nativeId]);

  const fetchRules = useCallback(async () => {
    if (!targetId || !nativeId) { setRules([]); return; }
    try {
      const r = await fetch(`/api/admin/alphabet-rules?targetLanguageId=${targetId}&nativeLanguageId=${nativeId}`);
      const d = await r.json(); setRules(d.rules ?? []);
    } catch { setRules([]); }
  }, [targetId, nativeId]);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);
  useEffect(() => { fetchLetters(); }, [fetchLetters]);
  useEffect(() => { fetchRules(); }, [fetchRules]);

  const targetLang = languages.find(l => l.id === targetId);
  const natives = languages.filter(l => l.canBeNative);

  function resetForm() { setForm(EMPTY); setShowForm(false); setEditId(null); }

  async function saveLetter() {
    if (!form.uppercase || !form.lowercase || !nativeId) return alert('Fill required fields and select native language');
    setSaving(true);
    try {
      const payload = {
        targetLanguageId: targetId, nativeLanguageId: nativeId,
        uppercase: form.uppercase, lowercase: form.lowercase, ipa: form.ipa,
        tajikTranscription: form.tajikTranscription, category: form.category, order: form.order,
      };

      const m = editId ? 'PUT' : 'POST';
      const b = editId ? { id: editId, ...payload } : payload;

      const r = await fetch('/api/admin/alphabet', {
        method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b)
      });
      if (r.ok) { resetForm(); fetchLetters(); }
      else { const d = await r.json(); alert(d.error || 'Error saving'); }
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  async function deleteLetter(id: string) {
    if (!confirm('Ҳатман нест мекунед?')) return;
    try {
      const r = await fetch(`/api/admin/alphabet?id=${id}`, { method: 'DELETE' });
      if (r.ok) fetchLetters();
      else alert('Error deleting');
    } catch (e: any) { alert(e.message); }
  }

  function editL(l: Letter) {
    setForm({
      uppercase: l.uppercase, lowercase: l.lowercase, ipa: l.ipa || '',
      tajikTranscription: l.tajikTranscription || '', category: l.category, order: l.order,
    });
    setEditId(l.id); setShowForm(true);
  }

  function resetRuleForm() { setRuleForm(EMPTY_RULE); setShowRuleForm(false); setRuleEditId(null); }

  async function saveRule() {
    if (!ruleForm.title || !ruleForm.body || !nativeId) return alert('Fill title and body and select native language');
    setRuleSaving(true);
    try {
      const payload = {
        targetLanguageId: targetId, nativeLanguageId: nativeId,
        category: ruleForm.category, title: ruleForm.title, body: ruleForm.body, order: ruleForm.order,
      };
      const m = ruleEditId ? 'PUT' : 'POST';
      const b = ruleEditId ? { id: ruleEditId, ...payload } : payload;
      const r = await fetch('/api/admin/alphabet-rules', {
        method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b)
      });
      if (r.ok) { resetRuleForm(); fetchRules(); }
      else { const d = await r.json(); alert(d.error || 'Error saving'); }
    } catch (e: any) { alert(e.message); } finally { setRuleSaving(false); }
  }

  async function deleteRule(id: string) {
    if (!confirm('Ҳатман нест мекунед?')) return;
    try {
      const r = await fetch(`/api/admin/alphabet-rules?id=${id}`, { method: 'DELETE' });
      if (r.ok) fetchRules();
      else alert('Error deleting');
    } catch (e: any) { alert(e.message); }
  }

  function editR(r: Rule) {
    setRuleForm({ category: r.category, title: r.title, body: r.body, order: r.order });
    setRuleEditId(r.id); setShowRuleForm(true);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href={`/admin/courses/${targetId}`} style={{ color: 'var(--text3)', textDecoration: 'none' }}>← Бозгашт</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Алифбо</h1>
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
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Ҳарфҳо ({letters.length})</h2>
            <button style={BTN} onClick={() => { resetForm(); setShowForm(true); }}>+ Иловаи ҳарф</button>
          </div>

          {showForm && (
            <div className="fade-up" style={{ background: 'rgba(20,184,166,0.03)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{editId ? 'Таҳрири ҳарф' : 'Ҳарфи нав'}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>Ҳарфи калон*</span><input style={FIELD} value={form.uppercase} onChange={e => setForm({...form, uppercase: e.target.value})} placeholder="e.g. A / Б / Ç" /></div>
                <div><span style={LABEL}>Ҳарфи хурд*</span><input style={FIELD} value={form.lowercase} onChange={e => setForm({...form, lowercase: e.target.value})} placeholder="e.g. a / б / ç" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><span style={LABEL}>IPA (байналмилалӣ)</span><input style={FIELD} value={form.ipa} onChange={e => setForm({...form, ipa: e.target.value})} placeholder="e.g. /eɪ/" /></div>
                <div><span style={LABEL}>Транскрипсияи тоҷикӣ</span><input style={FIELD} value={form.tajikTranscription} onChange={e => setForm({...form, tajikTranscription: e.target.value})} placeholder="e.g. Эй" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={LABEL}>Навъ</span>
                  <select style={FIELD} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="vowel">Садонок</option>
                    <option value="consonant">Ҳамсадо</option>
                    <option value="sign">Аломат (ъ/ь)</option>
                  </select>
                </div>
                <div><span style={LABEL}>Order</span><input type="number" style={FIELD} value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)||0})} /></div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ ...BTN, background: 'rgba(255,255,255,0.1)' }} onClick={resetForm}>Бекор кардан</button>
                <button style={BTN} onClick={saveLetter} disabled={saving}>{saving ? 'Сабт мешавад...' : 'Сабт кардан'}</button>
              </div>
            </div>
          )}

          {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {letters.map(l => (
                <div key={l.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '20px', fontWeight: 800 }}>
                    {l.uppercase}{l.lowercase}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--teal)' }}>{CATEGORY_LABEL[l.category] || l.category}</span>
                      {l.ipa && <span style={{ color: 'var(--text3)', fontSize: '12px', fontFamily: 'monospace' }}>{l.ipa}</span>}
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                      {l.tajikTranscription ? `[${l.tajikTranscription}]` : '—'}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '12px' }}>order: {l.order}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none' }} onClick={() => editL(l)}>Таҳрир</button>
                    <button style={SMALL_DEL} onClick={() => deleteLetter(l.id)}>Нест кардан</button>
                  </div>
                </div>
              ))}
              {letters.length === 0 && !showForm && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  Ҳанӯз ягон ҳарф илова нашудааст.
                </div>
              )}
            </div>
          )}

          {/* ── Rules section ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Қоидаҳо ({rules.length})</h2>
            <button style={BTN} onClick={() => { resetRuleForm(); setShowRuleForm(true); }}>+ Иловаи қоида</button>
          </div>

          {showRuleForm && (
            <div className="fade-up" style={{ background: 'rgba(20,184,166,0.03)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{ruleEditId ? 'Таҳрири қоида' : 'Қоидаи нав'}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={LABEL}>Гурӯҳ (кадом таб)</span>
                  <select style={FIELD} value={ruleForm.category} onChange={e => setRuleForm({...ruleForm, category: e.target.value})}>
                    <option value="general">Умумӣ (таби Алфавит)</option>
                    <option value="vowel">Садонокҳо</option>
                    <option value="consonant">Ҳамсадоҳо</option>
                  </select>
                </div>
                <div><span style={LABEL}>Order</span><input type="number" style={FIELD} value={ruleForm.order} onChange={e => setRuleForm({...ruleForm, order: parseInt(e.target.value)||0})} /></div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={LABEL}>Сарлавҳа*</span>
                <input style={FIELD} value={ruleForm.title} onChange={e => setRuleForm({...ruleForm, title: e.target.value})} placeholder="мас. «e»-и хомӯш" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={LABEL}>Матни қоида* (бо забони модарии хонанда)</span>
                <textarea style={{ ...FIELD, minHeight: '80px', resize: 'vertical' }} value={ruleForm.body} onChange={e => setRuleForm({...ruleForm, body: e.target.value})} placeholder="мас. Агар калима бо «e» тамом шавад, он садо намедиҳад, вале садоноки пешинро дароз мекунад: hat → hate." />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ ...BTN, background: 'rgba(255,255,255,0.1)' }} onClick={resetRuleForm}>Бекор кардан</button>
                <button style={BTN} onClick={saveRule} disabled={ruleSaving}>{ruleSaving ? 'Сабт мешавад...' : 'Сабт кардан'}</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rules.map(r => (
              <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--teal)' }}>{RULE_CATEGORY_LABEL[r.category] || r.category}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{r.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>{r.body}</div>
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '12px' }}>order: {r.order}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...SMALL_DEL, background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none' }} onClick={() => editR(r)}>Таҳрир</button>
                  <button style={SMALL_DEL} onClick={() => deleteRule(r.id)}>Нест кардан</button>
                </div>
              </div>
            ))}
            {rules.length === 0 && !showRuleForm && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                Ҳанӯз ягон қоида илова нашудааст.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AlphabetPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
      <AlphabetContent />
    </Suspense>
  );
}
