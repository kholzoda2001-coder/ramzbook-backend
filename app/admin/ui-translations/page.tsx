'use client';
import { useEffect, useState, useCallback } from 'react';

interface Lang { id: string; name: string; nativeName: string; flag: string; canBeNative: boolean; }
interface Row { key: string; value: string; }

const FIELD: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '14px' };

export default function AdminUiTranslationsPage() {
  const [langs, setLangs] = useState<Lang[]>([]);
  const [langId, setLangId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    fetch('/api/admin/languages').then(r => r.json()).then(d => {
      const native: Lang[] = (d.languages ?? []).filter((l: Lang) => l.canBeNative);
      setLangs(native);
      if (native[0]) setLangId(native[0].id);
    });
  }, []);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ui-translations?languageId=${id}`);
      const data = await res.json();
      setRows((data.translations ?? []).map((t: any) => ({ key: t.key, value: t.value })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(langId); }, [langId, load]);

  async function saveRow(key: string, value: string) {
    setSavingKey(key);
    try {
      await fetch('/api/admin/ui-translations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId: langId, key, value }),
      });
    } finally { setSavingKey(null); }
  }

  async function addRow() {
    if (!newKey.trim()) return;
    await saveRow(newKey.trim(), newVal);
    setNewKey(''); setNewVal('');
    load(langId);
  }

  function exportCsv() {
    const csv = ['key,value', ...rows.map(r => `"${r.key}","${(r.value ?? '').replace(/"/g, '""')}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const code = langs.find(l => l.id === langId)?.name ?? 'lang';
    a.href = url; a.download = `ui-translations-${code}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const translations: Record<string, string> = {};
    for (let i = 0; i < lines.length; i++) {
      if (i === 0 && /^\s*key\s*,\s*value/i.test(lines[i])) continue;
      const m = lines[i].match(/^\s*"?([^",]+)"?\s*,\s*"?(.*?)"?\s*$/);
      if (m) translations[m[1].trim()] = m[2].replace(/""/g, '"');
    }
    if (Object.keys(translations).length === 0) { alert('CSV холӣ ё нодуруст'); return; }
    const res = await fetch('/api/admin/ui-translations/bulk', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId: langId, translations }),
    });
    const data = await res.json();
    if (!res.ok) { alert('Хатогӣ: ' + (data.error ?? '')); return; }
    alert(`${data.count} калид ворид шуд`);
    load(langId);
  }

  const filtered = rows.filter(r => !search || r.key.includes(search) || (r.value ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Тарҷумаҳои интерфейс (UI)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Сатрҳои интерфейс барои ҳар забон — {rows.length} калид</p>
      </div>

      <div className="fade-up" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <select value={langId} onChange={e => setLangId(e.target.value)} style={FIELD}>
          {langs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
        </select>
        <input placeholder="🔍 Ҷустуҷӯ…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...FIELD, flex: 1, minWidth: 180 }} />
        <button onClick={exportCsv} style={{ ...FIELD, cursor: 'pointer', fontWeight: 600 }}>⬇ Export CSV</button>
        <label style={{ ...FIELD, cursor: 'pointer', fontWeight: 600 }}>
          ⬆ Import CSV
          <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])} />
        </label>
      </div>

      {/* Add new key */}
      <div className="glass-card fade-up" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input placeholder="key (e.g. home.title)" value={newKey} onChange={e => setNewKey(e.target.value)} style={{ ...FIELD, flex: 1, minWidth: 160 }} />
        <input placeholder="value" value={newVal} onChange={e => setNewVal(e.target.value)} style={{ ...FIELD, flex: 2, minWidth: 200 }} />
        <button onClick={addRow} style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Илова</button>
      </div>

      <div className="glass-card fade-up">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>⏳ Бор мешавад…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text3)', fontWeight: 600, width: '40%' }}>Калид</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text3)', fontWeight: 600 }}>Қимат</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Калид нест.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '12px' }}>{r.key}</td>
                    <td style={{ padding: '8px 20px' }}>
                      <input
                        defaultValue={r.value}
                        onBlur={e => { if (e.target.value !== r.value) saveRow(r.key, e.target.value); }}
                        style={{ ...FIELD, width: '100%', background: savingKey === r.key ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.05)' }}
                      />
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
