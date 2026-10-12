'use client';
import { useState } from 'react';
import { LEVEL_CODES, MAX_LABEL_LEN, type LevelLabels } from '@/lib/levelLabels';

/** Як сатри ҷадвали «Номҳои сатҳ»: панҷ майдон + «Сабт». */
export default function LevelNamesRow({
  id,
  title,
  code,
  inactive,
  courseLevels,
  initial,
}: {
  id: string;
  title: string;
  code: string;
  inactive: boolean;
  /** Сатҳҳое, ки ин забон курси фаъол дорад — онҳо равшан, боқӣ хира. */
  courseLevels: string[];
  initial: LevelLabels;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(LEVEL_CODES.map((c) => [c, initial[c] ?? ''])),
  );
  const [saved, setSaved] = useState<Record<string, string>>(values);
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const dirty = LEVEL_CODES.some((c) => (values[c] ?? '') !== (saved[c] ?? ''));

  async function save() {
    setStatus('saving');
    try {
      const res = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelLabels: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      // Сервер тоза мекунад (фосила, дарозӣ) — ҳамонро нишон медиҳем.
      const clean = (data.language?.levelLabels ?? {}) as Record<string, string>;
      const next = Object.fromEntries(LEVEL_CODES.map((c) => [c, clean[c] ?? '']));
      setValues(next);
      setSaved(next);
      setStatus('ok');
    } catch (e: any) {
      setStatus('err');
      alert(`Сабт нашуд: ${e?.message ?? e}`);
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: inactive ? 0.6 : 1 }}>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
        {title}{' '}
        <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: '12px' }}>({code})</span>
        {inactive && <span style={{ color: '#FBBF24', fontSize: '11px', marginLeft: 6 }}>хомӯш</span>}
      </td>
      {LEVEL_CODES.map((c) => {
        const hasCourse = courseLevels.includes(c);
        return (
          <td key={c} style={{ padding: '8px 6px' }}>
            <input
              value={values[c]}
              maxLength={MAX_LABEL_LEN}
              placeholder={c}
              title={hasCourse ? `Курси ${c} ҳаст` : `Курси ${c} ҳанӯз нест`}
              onChange={(e) => {
                setValues((v) => ({ ...v, [c]: e.target.value }));
                setStatus('idle');
              }}
              style={{
                width: '110px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1px solid ${hasCourse ? 'var(--border)' : 'rgba(255,255,255,0.06)'}`,
                background: hasCourse ? 'rgba(255,255,255,0.04)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13px',
                opacity: hasCourse ? 1 : 0.6,
              }}
            />
          </td>
        );
      })}
      <td style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
        <button
          onClick={save}
          disabled={!dirty || status === 'saving'}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: dirty ? 'pointer' : 'default',
            background: dirty ? 'linear-gradient(135deg, var(--teal), #0d9488)' : 'rgba(255,255,255,0.06)',
            color: dirty ? '#fff' : 'var(--text3)',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {status === 'saving' ? '…' : 'Сабт'}
        </button>
        {status === 'ok' && !dirty && <span style={{ color: '#22C55E', marginLeft: 8, fontSize: '12px' }}>✓</span>}
      </td>
    </tr>
  );
}
