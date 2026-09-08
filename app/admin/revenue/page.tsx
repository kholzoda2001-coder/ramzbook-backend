import { prisma } from '@/lib/prisma';
import { startOfMonthTJ } from '@/lib/admin-time';

export const dynamic = 'force-dynamic';

/**
 * ⚠️ This page used to read the `Payment` model. That model is DEAD — nothing
 * in the codebase writes to it any more (real Google Play purchases, promo
 * gifts and admin grants all write `PaymentTransaction`), and the 8 rows still
 * sitting in it are (a) duplicates of PaymentTransaction rows, matched by the
 * same `GPA.…` order id, and (b) five seeded "Test User" rows worth a fake
 * $149.95. Summing it therefore showed both stale and invented money.
 * Everything below reads `PaymentTransaction`, the same source the Dashboard,
 * Subscriptions page and /api/admin/stats/dashboard already use.
 */

const TYPE_LABEL: Record<string, string> = {
  subscription: 'Обуна',
  promo: 'Промо (тӯҳфа)',
  gems: 'Гемҳо',
  trial: 'Санҷишӣ',
};
const PLAN_LABEL: Record<string, string> = {
  monthly: 'Моҳона',
  sixmonths: '6-моҳа',
  yearly: 'Солона',
  lifetime: 'Якумрӣ',
};
const STATUS: Record<string, { label: string; cls: string }> = {
  success: { label: 'Муваффақ', cls: 'pp' },
  pending: { label: 'Дар интизор', cls: 'pa' },
  failed: { label: 'Ноком', cls: 'pa' },
  refunded: { label: 'Баргардонида', cls: 'pa' },
};

export default async function AdminRevenuePage() {
  try {
    // Local (Dushanbe) month start — the server clock is UTC. See lib/admin-time.ts.
    const startOfMonth = startOfMonthTJ();

    const transactions = await prisma.paymentTransaction.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Only `success` rows are money. Pending/failed ones are shown in the
    // table (so a broken gateway is visible) but never summed.
    const paid = transactions.filter(t => t.status === 'success');
    const totalRevenue = paid.reduce((sum, t) => sum + t.amount, 0);
    const monthlyRevenue = paid
      .filter(t => t.createdAt >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    // A $0 "success" row is a promo gift / admin grant, not a sale. Counting
    // those as purchases is what made 46 free gifts look like transactions.
    const realPurchases = paid.filter(t => t.amount > 0).length;
    const freeGrants = paid.length - realPurchases;

    const KPI: React.CSSProperties = { padding: '24px', borderRadius: '16px' };
    const KPI_LABEL: React.CSSProperties = { fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' };
    const TH: React.CSSProperties = { padding: '14px 20px', color: 'var(--text3)', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' };
    const TD: React.CSSProperties = { padding: '14px 20px', color: 'var(--text-secondary)' };

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Даромад (Молия)</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Таърихи пардохтҳо ва ҳисоботи молиявӣ
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="glass-card fade-up" style={KPI}>
            <div style={KPI_LABEL}>Даромади умумӣ</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold)' }}>${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="glass-card fade-up" style={{ ...KPI, animationDelay: '0.1s' }}>
            <div style={KPI_LABEL}>Даромади ин моҳ</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)' }}>${monthlyRevenue.toFixed(2)}</div>
          </div>
          <div className="glass-card fade-up" style={{ ...KPI, animationDelay: '0.2s' }}>
            <div style={KPI_LABEL}>Хариди пулакӣ</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{realPurchases}</div>
          </div>
          <div className="glass-card fade-up" style={{ ...KPI, animationDelay: '0.3s' }}>
            <div style={KPI_LABEL}>Тӯҳфа / промо ($0)</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{freeGrants}</div>
          </div>
        </div>

        <div className="glass-card fade-up" style={{ animationDelay: '0.4s' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Ҳамаи амалиётҳо</span>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{transactions.length} сабт</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={TH}>Сана</th>
                  <th style={TH}>Корбар</th>
                  <th style={TH}>Навъ</th>
                  <th style={TH}>Нақша</th>
                  <th style={TH}>Дарвоза</th>
                  <th style={TH}>Маблағ</th>
                  <th style={TH}>Ҳолат</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                      Ягон пардохт ёфт нашуд
                    </td>
                  </tr>
                ) : (
                  transactions.map(t => {
                    const st = STATUS[t.status] ?? { label: t.status, cls: 'pa' };
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={TD}>{t.createdAt.toISOString().split('T')[0]}</td>
                        <td style={{ ...TD, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.user?.name || t.user?.email || 'Корбари номаълум'}
                        </td>
                        <td style={{ ...TD, color: 'var(--gold)', fontWeight: 600 }}>
                          {TYPE_LABEL[t.type] ?? t.type}
                        </td>
                        <td style={TD}>{t.plan ? (PLAN_LABEL[t.plan] ?? t.plan) : '—'}</td>
                        <td style={TD}>{t.provider}</td>
                        <td style={{ ...TD, fontWeight: 700, color: t.amount > 0 ? 'var(--teal)' : 'var(--text3)' }}>
                          ${t.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className={`pill ${st.cls}`} style={{ padding: '4px 10px', fontSize: '11px' }}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани маълумот</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}
