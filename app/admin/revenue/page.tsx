import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminRevenuePage() {
  const payments = await prisma.payment.findMany({
    where: { status: 'success' },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const monthlyRevenue = payments
    .filter(p => p.createdAt >= thisMonth)
    .reduce((sum, p) => sum + p.amount, 0);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            Даромади Умумӣ
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold)' }}>
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', animationDelay: '0.1s' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            Даромади Ин Моҳ
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)' }}>
            ${monthlyRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="glass-card fade-up" style={{ animationDelay: '0.2s' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontSize: '18px', fontWeight: 600 }}>
          Охирин Пардохтҳо
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Сана</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Корбар</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Нақша (Plan)</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Маблағ</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Ҳолат</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                    Ягон пардохт ёфт нашуд
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {payment.createdAt.toISOString().split('T')[0]}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {payment.user?.name || payment.user?.email || 'Корбари Номаълум'}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--gold)', fontWeight: 600 }}>
                      {payment.plan}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--teal)' }}>
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="pill pp" style={{ padding: '4px 10px', fontSize: '11px' }}>
                        Муваффақ
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
