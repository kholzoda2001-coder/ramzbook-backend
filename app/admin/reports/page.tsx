'use client';

import React, { useCallback, useEffect, useState } from 'react';

/**
 * Панели гузоришҳои хатои мазмун.
 *
 * ЯК САТР = ЯК ҶУФТИ `contentId + field`, на як гузориш. Ҳашт хонанда, ки
 * ҳамон тарҷумаро гузориш додаанд, як сатранд ва як бор ҳал мешаванд.
 */

type Group = {
  contentId: string;
  field: string;
  status: string;
  lessonId: string;
  moduleId: string | null;
  exerciseTypes: string[];
  reportedValue: string;
  currentValue: string | null;
  reportCount: number;
  userCount: number;
  rewardedCount: number;
  reasons: Record<string, number>;
  suggestions: { text: string; at: string }[];
  firstAt: string;
  lastAt: string;
  course: string | null;
  context: {
    word: string;
    translation: string;
    lessonTitle: string | null;
    moduleTitle: string | null;
  } | null;
};

const REASON_LABEL: Record<string, string> = {
  wrong_translation: 'Тарҷума нодуруст',
  spelling: 'Хатои имло',
  unnatural: 'Ғайритабиӣ',
  other: 'Чизи дигар',
};

const CARD: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 16,
  marginBottom: 12,
  background: 'rgba(255,255,255,0.03)',
};

const BTN: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 10,
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

export default function ReportsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${status}`);
      const data = await res.json();
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(g: Group, what: 'resolve' | 'reject') {
    const key = `${g.contentId}::${g.field}`;
    setBusy(key);
    try {
      const res = await fetch(
        `/api/admin/reports/${encodeURIComponent(g.contentId)}/${encodeURIComponent(g.field)}/${what}`,
        { method: 'PATCH' },
      );
      const data = await res.json();
      if (what === 'resolve') {
        // ⚠️ `newlyRewarded` — маҳз он рақамест, ки идемпотентиро нишон
        // медиҳад: зеркунии ДУЮМ 0 медиҳад, чунки ҳамаи сатрҳо аллакай
        // `rewarded = true` шудаанд ва алмоси такрорӣ дода намешавад.
        setNote(
          `Ҳал шуд: ${data.groupSize} гузориш · мукофоти НАВ: ${data.newlyRewarded} ` +
            `(×${data.gemsEach} алмос) · огоҳӣ ба ${data.usersNotified} корбар`,
        );
      } else {
        setNote(`Рад шуд: ${data.rejected} гузориш · алмос дода нашуд, огоҳӣ нарафт`);
      }
      await load();
    } catch (e: any) {
      setNote(`Хатогӣ: ${e?.message ?? e}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        Гузоришҳои хатои мазмун
      </h1>
      <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 18 }}>
        Ҳар сатр як МАЙДОНИ мушаххас аст. Ҳашт гузориш дар як сатр — як бор ҳал
        мешавад.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['new', 'fixed', 'rejected', 'all'].map((st) => (
          <button
            key={st}
            onClick={() => setStatus(st)}
            style={{
              ...BTN,
              background: status === st ? 'var(--accent, #C89B3C)' : 'transparent',
              color: status === st ? '#12121F' : 'var(--text-secondary)',
              border: status === st ? 'none' : '1px solid var(--border)',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {note && (
        <div
          style={{
            ...CARD,
            borderColor: '#4FBF8B',
            color: '#4FBF8B',
            fontSize: 13,
          }}
        >
          {note}
        </div>
      )}

      {loading && <div style={{ color: 'var(--text3)' }}>Боркунӣ…</div>}
      {!loading && groups.length === 0 && (
        <div style={{ color: 'var(--text3)' }}>Ҳеҷ гузориш нест.</div>
      )}

      {groups.map((g) => {
        const key = `${g.contentId}::${g.field}`;
        const changed =
          g.currentValue !== null && g.currentValue !== g.reportedValue;
        return (
          <div key={key + g.status} style={CARD}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <code
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 7,
                  background: 'rgba(200,155,60,0.16)',
                  color: '#C89B3C',
                }}
              >
                {g.field}
              </code>
              <strong style={{ fontSize: 16 }}>{g.reportedValue}</strong>
              <span style={{ color: 'var(--text3)', fontSize: 12 }}>
                {g.userCount} корбар · {g.reportCount} гузориш
              </span>
              {g.rewardedCount > 0 && (
                <span style={{ color: '#4FBF8B', fontSize: 12 }}>
                  {g.rewardedCount} аллакай мукофот гирифт
                </span>
              )}
            </div>

            {g.context && (
              <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 6 }}>
                {g.context.word} → {g.context.translation}
                {g.context.moduleTitle ? ` · ${g.context.moduleTitle}` : ''}
                {g.context.lessonTitle ? ` · ${g.context.lessonTitle}` : ''}
                {g.course ? ` · ${g.course}` : ''}
                {` · ${g.exerciseTypes.join(', ')}`}
              </div>
            )}

            {/* Қимати ҶОРӢ дар база — агар аз гузоришшуда фарқ кунад, хато
                аллакай ислоҳ шудааст ва гурӯҳро танҳо бастан лозим аст. */}
            {g.currentValue !== null && (
              <div style={{ fontSize: 12, marginTop: 6, color: changed ? '#4FBF8B' : 'var(--text3)' }}>
                Ҳоло дар база: <strong>{g.currentValue}</strong>
                {changed ? ' — аллакай тағйир ёфт' : ' — бетағйир'}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {Object.entries(g.reasons).map(([r, n]) => (
                <span
                  key={r}
                  style={{
                    fontSize: 11.5,
                    padding: '4px 9px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {REASON_LABEL[r] ?? r} · {n}
                </span>
              ))}
            </div>

            {g.suggestions.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                  ПЕШНИҲОДҲО ({g.suggestions.length})
                </div>
                {g.suggestions.map((sg, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13,
                      padding: '7px 10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      marginBottom: 4,
                    }}
                  >
                    {sg.text}
                  </div>
                ))}
              </div>
            )}

            {g.status === 'new' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => act(g, 'resolve')}
                  disabled={busy === key}
                  style={{ ...BTN, background: '#4FBF8B', color: '#0A0A14' }}
                >
                  {busy === key ? '…' : 'Ҳал шуд · +5 алмос'}
                </button>
                <button
                  onClick={() => act(g, 'reject')}
                  disabled={busy === key}
                  style={{
                    ...BTN,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Рад кардан
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
