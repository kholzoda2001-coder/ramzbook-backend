'use client';

import { useCallback, useEffect, useState } from 'react';

type Claim = {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  claimedAt: string;
  grantedDays: number | null;
  expiresAt: string | null;
  stillPromo: boolean;
  isActive: boolean;
};

function fmt(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TH: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.3px', borderBottom: '1px solid var(--border)' };
const TD: React.CSSProperties = { padding: '8px 10px', fontSize: '13px', color: 'var(--text)', borderBottom: '1px solid var(--border)' };

export default function PromoClaimsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(0);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [daysInput, setDaysInput] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promo-claims');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setTotal(data.total);
      setActive(data.active);
      setExpired(data.expired);
      setClaims(data.claims);
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function adjust(userId: string, action: 'extend' | 'shorten' | 'cancel') {
    const days = Number(daysInput[userId] || 7);
    if (action !== 'cancel' && (!days || days <= 0)) return;
    if (action === 'cancel' && !confirm('Обунаи промои ин корбар пурра бекор карда шавад?')) return;
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/promo-claims/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, days: action === 'cancel' ? undefined : days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to adjust');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="sr">
        <div className="sc t"><div className="sh"><div className="si si-t">🎁</div></div><div className="sv">{total}</div><div className="sl">Промо гирифтаанд</div></div>
        <div className="sc b"><div className="sh"><div className="si si-b">🟢</div></div><div className="sv">{active}</div><div className="sl">Ҳоло фаъол</div></div>
        <div className="sc r"><div className="sh"><div className="si si-r">⚪</div></div><div className="sv">{expired}</div><div className="sl">Тамом шуда</div></div>
      </div>

      <div className="sec">
        <div className="shd"><div className="st">🎁 Гирандагони тӯҳфаи 2-моҳа</div></div>
        <div className="sb2" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ color: 'var(--text3)', padding: '12px' }}>Бор шуда истодааст…</div>
          ) : error ? (
            <div style={{ color: 'var(--red)', padding: '12px' }}>{error}</div>
          ) : claims.length === 0 ? (
            <div style={{ color: 'var(--text3)', padding: '12px' }}>Ҳанӯз ҳеҷ кас промо нагирифтааст.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr>
                  <th style={TH}>Ном</th>
                  <th style={TH}>Почта</th>
                  <th style={TH}>Гирифт</th>
                  <th style={TH}>Рӯз дода шуд</th>
                  <th style={TH}>Анҷом</th>
                  <th style={TH}>Ҳолат</th>
                  <th style={TH}>Амал</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.userId}>
                    <td style={TD}>{c.name}</td>
                    <td style={TD}>{c.email || '—'}</td>
                    <td style={TD}>{fmt(c.claimedAt)}</td>
                    <td style={TD}>{c.grantedDays ?? '—'}</td>
                    <td style={TD}>{fmt(c.expiresAt)}</td>
                    <td style={TD}>
                      {!c.stillPromo ? (
                        <span style={{ color: 'var(--text3)' }}>иваз шуд</span>
                      ) : c.isActive ? (
                        <span style={{ color: 'var(--green)', fontWeight: 700 }}>Фаъол</span>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontWeight: 700 }}>Тамом шуд</span>
                      )}
                    </td>
                    <td style={TD}>
                      {!c.stillPromo ? (
                        <span style={{ color: 'var(--text3)' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="number"
                            min={1}
                            value={daysInput[c.userId] ?? '7'}
                            onChange={(e) => setDaysInput((s) => ({ ...s, [c.userId]: e.target.value }))}
                            style={{ width: 52, background: 'var(--bg, #0F1525)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 6px', fontSize: 12, color: 'var(--text)' }}
                          />
                          <button
                            disabled={busyId === c.userId}
                            onClick={() => adjust(c.userId, 'extend')}
                            title="Дароз кардан"
                            style={{ fontSize: 11, fontWeight: 700, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--green)', cursor: 'pointer' }}
                          >
                            +рӯз
                          </button>
                          <button
                            disabled={busyId === c.userId}
                            onClick={() => adjust(c.userId, 'shorten')}
                            title="Кам кардан"
                            style={{ fontSize: 11, fontWeight: 700, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer' }}
                          >
                            −рӯз
                          </button>
                          <button
                            disabled={busyId === c.userId}
                            onClick={() => adjust(c.userId, 'cancel')}
                            title="Бекор кардан"
                            style={{ fontSize: 11, fontWeight: 700, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--red)', cursor: 'pointer' }}
                          >
                            Бекор
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
