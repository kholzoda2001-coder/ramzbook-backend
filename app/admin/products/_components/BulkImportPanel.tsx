'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud, FileSpreadsheet, Download, CheckCircle2,
  AlertCircle, Trash2, RefreshCw, Eye, FileText, ArrowRight,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface BulkRow {
  emoji: string;
  word: string;
  translation: string;
  trans_TJ: string;
  trans_EN: string;
  transcriptionEn: string;
  transcriptionTj: string;
  exampleEn: string;
  exampleTj: string;
  example: string;
  exampleTranslation: string;
}

interface Props {
  moduleId: string;
  moduleName: string;
  onImportSuccess: (count: number) => void;
}

/* ─── Column mapping (case-insensitive key normalisation) ───────────────── */
function normaliseRow(raw: Record<string, any>, idx: number): BulkRow {
  const g = (keys: string[]) => {
    for (const k of keys) {
      const val = raw[k] ?? raw[k.toLowerCase()] ?? raw[k.toUpperCase()] ?? '';
      if (val !== '' && val !== undefined) return String(val).trim();
    }
    return '';
  };
  return {
    emoji:              g(['emoji', 'Emoji'])              || '💬',
    word:               g(['word', 'Word']),
    translation:        g(['translation', 'Translation']),
    trans_TJ:           g(['trans_TJ', 'Trans_TJ', 'transTJ']),
    trans_EN:           g(['trans_EN', 'Trans_EN', 'transEN']),
    transcriptionEn:    g(['transcriptionEn', 'TranscriptionEn', 'transcription_en']),
    transcriptionTj:    g(['transcriptionTj', 'TranscriptionTj', 'transcription_tj']),
    exampleEn:          g(['exampleEn', 'ExampleEn', 'example_en']),
    exampleTj:          g(['exampleTj', 'ExampleTj', 'example_tj']),
    example:            g(['example', 'Example']),
    exampleTranslation: g(['exampleTranslation', 'ExampleTranslation', 'example_translation']),
  };
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function BulkImportPanel({ moduleId, moduleName, onImportSuccess }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName]     = useState('');
  const [rows, setRows]             = useState<BulkRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mode, setMode]             = useState<'append' | 'replace'>('append');
  const [status, setStatus]         = useState<'idle' | 'parsing' | 'ready' | 'importing' | 'done' | 'error'>('idle');
  const [message, setMessage]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File parsing ────────────────────────────────────────────────────── */
  const parseFile = useCallback(async (file: File) => {
    setStatus('parsing');
    setMessage('');
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = (results.data as Record<string, any>[]).map(normaliseRow);
          const valid  = parsed.filter(r => r.word || r.translation);
          setRows(valid);
          setStatus(valid.length > 0 ? 'ready' : 'error');
          setMessage(valid.length === 0 ? 'No valid rows found in this CSV. Make sure the headers match the template.' : '');
          if (valid.length > 0) setPreviewOpen(true);
        },
        error: (err) => {
          setStatus('error');
          setMessage('CSV parse error: ' + err.message);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const XLSX   = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const wb     = XLSX.read(buffer, { type: 'array' });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        const raw    = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
        const parsed = raw.map(normaliseRow);
        const valid  = parsed.filter(r => r.word || r.translation);
        setRows(valid);
        setStatus(valid.length > 0 ? 'ready' : 'error');
        setMessage(valid.length === 0 ? 'No valid rows found in this Excel file.' : '');
        if (valid.length > 0) setPreviewOpen(true);
      } catch (err: any) {
        setStatus('error');
        setMessage('Excel parse error: ' + err.message);
      }
    } else {
      setStatus('error');
      setMessage('Unsupported file type. Please upload a .csv or .xlsx file.');
    }
  }, []);

  /* ── Drag handlers ───────────────────────────────────────────────────── */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleImport = async () => {
    if (rows.length === 0) return;
    setStatus('importing');
    setMessage('');
    try {
      const res = await fetch('/api/admin/words/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, words: rows, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Unknown server error.');
      } else {
        setStatus('done');
        setMessage(`✅ Successfully imported ${data.inserted} words. Total in module: ${data.total}.`);
        onImportSuccess(data.inserted);
      }
    } catch {
      setStatus('error');
      setMessage('Network error — could not reach the server.');
    }
  };

  /* ── Reset ───────────────────────────────────────────────────────────── */
  const reset = () => {
    setRows([]); setFileName(''); setStatus('idle');
    setMessage(''); setPreviewOpen(false);
  };

  /* ── Template download ───────────────────────────────────────────────── */
  const downloadTemplate = (fmt: 'csv' | 'xlsx') => {
    window.open(`/api/admin/words/template?format=${fmt}`, '_blank');
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const isbusy = status === 'parsing' || status === 'importing';

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header row: title + template buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.06))', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
            📥 Step 1 — Download a template
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Bulk import into <span style={{ color: '#10b981', fontWeight: 700 }}>{moduleName}</span> · Up to 2,000 words per batch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => downloadTemplate('csv')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: '#059669', color: '#fff', border: 'none',
              boxShadow: '0 3px 10px rgba(5,150,105,0.35)', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            title="Download CSV template"
          >
            <Download size={14} /> Download CSV Template
          </button>
          <button
            type="button"
            onClick={() => downloadTemplate('xlsx')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: '#6366f1', color: '#fff', border: 'none',
              boxShadow: '0 3px 10px rgba(99,102,241,0.35)', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            title="Download Excel template"
          >
            <Download size={14} /> Download Excel Template
          </button>
        </div>
      </div>

      {/* ── Drop zone (only shown when idle / error / done) ── */}
      {(status === 'idle' || status === 'error' || status === 'done') && (
        <label
          htmlFor={`bulk-file-${moduleId}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '32px 24px', borderRadius: '14px', cursor: 'pointer',
            border: `2px dashed ${dragActive ? '#10b981' : 'var(--bg-border)'}`,
            background: dragActive ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.2s, background 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: '14px',
            background: dragActive ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            <UploadCloud size={26} color="#10b981" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {dragActive ? 'Release to upload' : 'Drag & drop your file here'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              or <span style={{ color: '#10b981', fontWeight: 600 }}>browse files</span>
              {' '}· CSV and XLSX supported
            </p>
          </div>
          <input
            id={`bulk-file-${moduleId}`}
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </label>
      )}

      {/* ── Parsing spinner ── */}
      {status === 'parsing' && (
        <div style={statusBox('rgba(99,102,241,0.1)', '#6366f1')}>
          <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <span>Parsing <strong>{fileName}</strong>…</span>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div style={statusBox('rgba(239,68,68,0.1)', '#dc2626')}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{message}</span>
          <button type="button" onClick={reset} style={ghostBtn('#dc2626')}>Reset</button>
        </div>
      )}

      {/* ── Success ── */}
      {status === 'done' && (
        <div style={statusBox('rgba(16,185,129,0.1)', '#059669')}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{message}</span>
          <button type="button" onClick={reset} style={ghostBtn('#059669')}>Import another</button>
        </div>
      )}

      {/* ── File ready — options + preview ── */}
      {(status === 'ready' || status === 'importing') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* File badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <FileText size={20} color="#10b981" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {rows.length} valid row{rows.length !== 1 ? 's' : ''} detected
              </p>
            </div>
            <button type="button" onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
              <Trash2 size={15} />
            </button>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Import mode:</p>
            {(['append', 'replace'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  border: mode === m ? 'none' : '1px solid var(--bg-border)',
                  background: mode === m
                    ? (m === 'replace' ? 'rgba(239,68,68,0.8)' : 'rgba(16,185,129,0.8)')
                    : 'var(--bg-elevated)',
                  color: mode === m ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {m === 'append' ? '➕ Append' : '🔄 Replace all'}
              </button>
            ))}
            {mode === 'replace' && (
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                ⚠️ This will overwrite existing words!
              </span>
            )}
          </div>

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreviewOpen(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-from)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Eye size={14} />
            {previewOpen ? 'Hide' : 'Show'} preview (first 10 rows)
          </button>

          {/* Preview table */}
          {previewOpen && (
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--bg-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {['#', 'Emoji', 'Word', 'Translation', 'TransEN', 'TransTJ', 'ExampleEN', 'ExampleTJ'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--bg-border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--bg-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{r.emoji}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-primary)' }}>{r.word}</td>
                      <td style={tdStyle}>{r.translation || r.trans_TJ}</td>
                      <td style={tdStyle}>{r.transcriptionEn}</td>
                      <td style={tdStyle}>{r.transcriptionTj}</td>
                      <td style={tdStyle}>{r.exampleEn || r.example}</td>
                      <td style={tdStyle}>{r.exampleTj || r.exampleTranslation}</td>
                    </tr>
                  ))}
                  {rows.length > 10 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '8px 10px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        … and {rows.length - 10} more row{rows.length - 10 !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleImport}
            disabled={isbusy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
              cursor: isbusy ? 'not-allowed' : 'pointer', opacity: isbusy ? 0.7 : 1,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'opacity 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => { if (!isbusy) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {status === 'importing'
              ? <><RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Importing…</>
              : <><ArrowRight size={15} /> Import {rows.length} word{rows.length !== 1 ? 's' : ''} into module</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Micro style helpers ─────────────────────────────────────────────── */
const templateBtnStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  background: `${color}18`, color, border: `1px solid ${color}40`,
  transition: 'background 0.2s',
  whiteSpace: 'nowrap',
});

const statusBox = (bg: string, color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '12px 16px', borderRadius: '10px',
  background: bg, color, fontSize: '13px', fontWeight: 500,
  flexWrap: 'wrap',
});

const ghostBtn = (color: string): React.CSSProperties => ({
  marginLeft: 'auto', background: 'none', border: `1px solid ${color}60`,
  color, borderRadius: '6px', padding: '3px 10px', fontSize: '11px',
  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
});

const tdStyle: React.CSSProperties = {
  padding: '7px 10px', color: 'var(--text-secondary)',
  maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};
