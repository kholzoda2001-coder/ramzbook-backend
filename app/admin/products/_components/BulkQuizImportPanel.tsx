'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud, FileSpreadsheet, Download, CheckCircle2,
  AlertCircle, Trash2, RefreshCw, Eye, FileText, ArrowRight, ListChecks
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface BulkQuizRow {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

interface Props {
  moduleId: string;
  moduleName: string;
  onClientImport: (rows: BulkQuizRow[], mode: 'append' | 'replace') => void;
}

/* ─── Column mapping (case-insensitive key normalisation) ───────────────── */
function normaliseRow(raw: Record<string, any>, idx: number): BulkQuizRow | null {
  const g = (keys: string[]) => {
    for (const k of keys) {
      const val = raw[k] ?? raw[k.toLowerCase()] ?? raw[k.toUpperCase()] ?? '';
      if (val !== '' && val !== undefined) return String(val).trim();
    }
    return '';
  };

  const question = g(['Question', 'question', 'Савол', 'савол']);
  const opt1 = g(['Option 1', 'option 1', 'Option A', 'option A', 'Варианти 1']);
  const opt2 = g(['Option 2', 'option 2', 'Option B', 'option B', 'Варианти 2']);
  const opt3 = g(['Option 3', 'option 3', 'Option C', 'option C', 'Варианти 3']);
  const opt4 = g(['Option 4', 'option 4', 'Option D', 'option D', 'Варианти 4']);
  
  const correctRaw = g(['Correct Option Index', 'Correct Option', 'Correct', 'Ҷавоби дуруст', 'Ҷавоб']);
  
  if (!question) return null;

  // Parse correct index. If they typed "1", it means index 0.
  // If they typed "A", it means index 0.
  let correctIndex = 0;
  if (/^[aA1]$/.test(correctRaw)) correctIndex = 0;
  else if (/^[bB2]$/.test(correctRaw)) correctIndex = 1;
  else if (/^[cC3]$/.test(correctRaw)) correctIndex = 2;
  else if (/^[dD4]$/.test(correctRaw)) correctIndex = 3;
  // fallback to 0 if not understood

  return {
    question,
    options: [opt1, opt2, opt3, opt4],
    correctIndex
  };
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function BulkQuizImportPanel({ moduleId, moduleName, onClientImport }: Props) {
  const [stagedCount, setStagedCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName]     = useState('');
  const [rows, setRows]             = useState<BulkQuizRow[]>([]);
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
          const parsed = (results.data as Record<string, any>[])
            .map((r, i) => normaliseRow(r, i))
            .filter(Boolean) as BulkQuizRow[];
            
          setRows(parsed);
          if (parsed.length === 0) {
            setStatus('error');
            setMessage('No valid questions found in this CSV. Make sure the headers match the template.');
            return;
          }
          setPreviewOpen(true);
          
          // Auto stage
          console.log(`[BulkQuizImport] Auto-staging ${parsed.length} quizzes (mode: append) for module ${moduleId}`);
          onClientImport(parsed, 'append');
          setStagedCount(parsed.length);
          setStatus('ready');
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
        
        const parsed = raw
          .map((r, i) => normaliseRow(r, i))
          .filter(Boolean) as BulkQuizRow[];

        if (parsed.length === 0) {
          setStatus('error');
          setMessage('No valid questions found in this Excel file.');
          return;
        }
        setRows(parsed);
        setPreviewOpen(true);

        // Auto stage
        console.log(`[BulkQuizImport] Auto-staging ${parsed.length} quizzes (mode: append) for module ${moduleId}`);
        onClientImport(parsed, 'append');
        setStagedCount(parsed.length);
        setStatus('ready');
      } catch (err: any) {
        setStatus('error');
        setMessage('Excel parse error: ' + err.message);
      }
    } else {
      setStatus('error');
      setMessage('Unsupported file type. Please upload a .csv or .xlsx file.');
    }
  }, [moduleId, onClientImport]);

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

    onClientImport(rows, mode);
    setStatus('done');
    setMessage(`✅ Successfully staged ${rows.length} quizzes in this draft module.`);
  };

  /* ── Reset ───────────────────────────────────────────────────────────── */
  const reset = () => {
    setRows([]); setFileName(''); setStatus('idle');
    setMessage(''); setPreviewOpen(false);
  };

  /* ── Template download ───────────────────────────────────────────────── */
  const downloadTemplate = (fmt: 'csv' | 'xlsx') => {
    window.open(`/api/admin/quizzes/template?format=${fmt}`, '_blank');
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const isbusy = status === 'parsing' || status === 'importing';

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header row: title + template buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(245,158,11,0.06))', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
            📥 Step 1 — Download a template
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Bulk import quizzes into <span style={{ color: '#ef4444', fontWeight: 700 }}>{moduleName}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => downloadTemplate('csv')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: '#ef4444', color: '#fff', border: 'none',
              boxShadow: '0 3px 10px rgba(239,68,68,0.35)', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            <Download size={14} /> Download CSV
          </button>
          <button
            type="button"
            onClick={() => downloadTemplate('xlsx')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: '#f59e0b', color: '#fff', border: 'none',
              boxShadow: '0 3px 10px rgba(245,158,11,0.35)', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            <Download size={14} /> Download Excel
          </button>
        </div>
      </div>

      {/* ── Drop zone ── */}
      {(status === 'idle' || status === 'error' || status === 'done') && (
        <label
          htmlFor={`bulk-quiz-${moduleId}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '32px 24px', borderRadius: '14px', cursor: 'pointer',
            border: `2px dashed ${dragActive ? '#ef4444' : 'var(--bg-border)'}`,
            background: dragActive ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.2s, background 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: '14px',
            background: dragActive ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            <UploadCloud size={26} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {dragActive ? 'Release to upload' : 'Drag & drop quiz file here'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              or <span style={{ color: '#ef4444', fontWeight: 600 }}>browse files</span>
            </p>
          </div>
          <input
            id={`bulk-quiz-${moduleId}`}
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
        <div style={statusBox('rgba(245,158,11,0.1)', '#d97706')}>
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

          {/* Auto-staged banner */}
          {stagedCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
              fontSize: '12px', fontWeight: 700, color: '#059669',
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>✅ {stagedCount} questions auto-staged — click <strong>"Update Book"</strong> to save permanently.</span>
            </div>
          )}

          {/* File badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <ListChecks size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {rows.length} valid question{rows.length !== 1 ? 's' : ''} detected
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
                    ? (m === 'replace' ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.8)')
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
                ⚠️ This will overwrite existing quizzes!
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
            {previewOpen ? 'Hide' : 'Show'} preview (first 10 questions)
          </button>

          {/* Preview table */}
          {previewOpen && (
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--bg-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {['#', 'Question', 'Opt 1', 'Opt 2', 'Opt 3', 'Opt 4', 'Correct'].map(h => (
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
                      <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-primary)' }}>{r.question}</td>
                      <td style={tdStyle}>{r.options[0]}</td>
                      <td style={tdStyle}>{r.options[1]}</td>
                      <td style={tdStyle}>{r.options[2]}</td>
                      <td style={tdStyle}>{r.options[3]}</td>
                      <td style={{ ...tdStyle, color: '#10b981', fontWeight: 700 }}>Opt {r.correctIndex + 1}</td>
                    </tr>
                  ))}
                  {rows.length > 10 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '8px 10px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        … and {rows.length - 10} more question{rows.length - 10 !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit / re-stage button */}
          <button
            type="button"
            onClick={handleImport}
            disabled={isbusy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
              cursor: isbusy ? 'not-allowed' : 'pointer', opacity: isbusy ? 0.7 : 1,
              background: stagedCount > 0
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
              transition: 'opacity 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => { if (!isbusy) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {status === 'importing'
              ? <><RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Staging…</>
              : stagedCount > 0
                ? <><RefreshCw size={15} /> Re-stage with {mode} mode ({rows.length} questions)</>
                : <><ArrowRight size={15} /> Stage {rows.length} question{rows.length !== 1 ? 's' : ''}</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Micro style helpers ─────────────────────────────────────────────── */
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
