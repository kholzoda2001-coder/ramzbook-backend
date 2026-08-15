'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const FIELD: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };
const BTN: React.CSSProperties = { background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' };
const SMALL_DEL: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' };

interface Language { id: string; code: string; name: string; nativeName: string; flag: string; canBeNative: boolean; canBeTarget: boolean; }
interface Category { id: string; title: string; titleTranslated: string; scenario: string | null; emoji: string; isPremium: boolean; isActive: boolean; order: number; _count?: { items: number }; }
interface Item { id: string; kind: string; text: string; translation: string; literal: string | null; note: string | null; audioUrl: string | null; }
interface CategoryDetail extends Category { items: Item[]; }

const EMPTY_CATEGORY = { title: '', titleTranslated: '', scenario: '', emoji: '🎙️', isPremium: false };
const EMPTY_ITEM = { kind: 'sentence', text: '', translation: '', literal: '', note: '' };

function SpeakingContent() {
  const searchParams = useSearchParams();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [targetId, setTargetId] = useState(searchParams.get('targetLanguageId') || '');
  const [nativeId, setNativeId] = useState(searchParams.get('nativeLanguageId') || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_CATEGORY);
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

  async function createCategory(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch('/api/admin/speaking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, targetLanguageId: targetId, nativeLanguageId: nativeId }),
      });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ');
      setForm(EMPTY_CATEGORY); setShowForm(false); fetchCategories();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); } finally { setSaving(false); }
  }

  async function deleteCategory(id: string, title: string) {
    if (!confirm(`Категорияи "${title}" нест карда шавад? Ҳамаи калима/ҷумлаҳои он низ нест мешаванд.`)) return;
    try {
      const r = await fetch(`/api/admin/speaking/${id}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      if (detail?.id === id) setDetail(null);
      fetchCategories();
    } catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }

  async function openDetail(id: string) {
    try { const r = await fetch(`/api/admin/speaking/${id}`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setDetail(d.category); }
    catch (e: any) { alert('Хатогӣ: ' + e.message); }
  }
  async function reloadDetail() { if (detail) openDetail(detail.id); fetchCategories(); }

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
          <button onClick={() => setShowForm(!showForm)} style={{ ...BTN, padding: '10px 20px', fontSize: '14px' }}>+ Категорияи нав</button>
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
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>➕ Категорияи нави спикинг</h3>
          <form onSubmit={createCategory}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
              <div><label style={LABEL}>Унвон (омӯзишӣ) *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ordering a drink" style={FIELD} /></div>
              <div><label style={LABEL}>Унвон (модарӣ)</label><input value={form.titleTranslated} onChange={e => setForm(f => ({ ...f, titleTranslated: e.target.value }))} placeholder="Фармоиши нӯшокӣ" style={FIELD} /></div>
              <div><label style={LABEL}>Эмоҷи</label><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🥤" style={FIELD} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={LABEL}>Вазъият (модарӣ, ихтиёрӣ)</label><input value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} placeholder="Шумо дар кафе ҳастед ва нӯшокӣ фармоиш медиҳед." style={FIELD} /></div>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} /> Премиум
              </label>
              <button type="submit" disabled={saving} style={BTN}>{saving ? '⏳…' : '✅ Сохтан'}</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_CATEGORY); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Бекор</button>
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
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1.4fr' : '1fr', gap: '20px' }}>
          <div className="glass-card fade-up" style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>📭 Ягон категория нест. «+ Категорияи нав»-ро пахш кунед.</div>
            ) : categories.map((cat, i) => (
              <div key={cat.id} onClick={() => openDetail(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: detail?.id === cat.id ? 'rgba(20,184,166,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text3)', fontSize: '12px', minWidth: '18px' }}>{i + 1}</span>
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.title} {cat.isPremium && <span style={{ fontSize: '11px', color: '#FBBF24' }}>👑</span>}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{cat.titleTranslated} · 🗣️{cat._count?.items ?? 0}</div>
                </div>
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
  const [iForm, setIForm] = useState(EMPTY_ITEM);

  async function post(url: string, body: unknown) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error ?? 'Хатогӣ'); return d;
  }
  async function del(url: string) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } }

  async function addItem() {
    try { await post('/api/admin/speaking/items', { categoryId: detail.id, ...iForm }); setIForm(EMPTY_ITEM); onChange(); }
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{detail.scenario}</p>
      )}

      <div style={{ marginBottom: '22px' }}>
        <div style={H}>🗣️ Калима ва ҷумлаҳо ({detail.items.length})</div>
        {detail.items.map(it => (
          <div key={it.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text3)', minWidth: '52px' }}>{it.kind === 'word' ? '🔤 калима' : '💬 ҷумла'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{it.text}</div>
              <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{it.translation}{it.literal ? ` · «${it.literal}»` : ''}</div>
            </div>
            <button onClick={async () => { try { await del(`/api/admin/speaking/items/${it.id}`); onChange(); } catch (e: any) { alert(e.message); } }} style={SMALL_DEL}>🗑️</button>
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px', marginTop: '10px' }}>
          <select value={iForm.kind} onChange={e => setIForm(f => ({ ...f, kind: e.target.value }))} style={{ ...FIELD, width: 'auto' }}>
            <option value="sentence">💬 Ҷумла</option>
            <option value="word">🔤 Калима</option>
          </select>
          <input value={iForm.text} onChange={e => setIForm(f => ({ ...f, text: e.target.value }))} placeholder="I would like a coffee." style={FIELD} />
          <input value={iForm.translation} onChange={e => setIForm(f => ({ ...f, translation: e.target.value }))} placeholder="Ман қаҳва мехоҳам." style={FIELD} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '8px' }}>
          <input value={iForm.literal} onChange={e => setIForm(f => ({ ...f, literal: e.target.value }))} placeholder="Талаффуз / таҳтуллафзӣ (ихтиёрӣ)" style={FIELD} />
          <input value={iForm.note} onChange={e => setIForm(f => ({ ...f, note: e.target.value }))} placeholder="Эзоҳ (ихтиёрӣ)" style={FIELD} />
          <button onClick={addItem} disabled={!iForm.text || !iForm.translation} style={BTN}>+</button>
        </div>
      </div>
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
