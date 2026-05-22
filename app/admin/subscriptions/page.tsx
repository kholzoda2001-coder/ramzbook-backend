import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  try {
    const [subscriptions, payments] = await Promise.all([
      prisma.subscription.findMany({
        include: { user: true },
        orderBy: { startedAt: 'desc' }
      }),
      prisma.payment.findMany({ where: { status: 'success' } })
    ]);

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Обунаҳо</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Идоракунии обунаҳои Premium
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Ҳамаи Обунаҳо</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{subscriptions.length}</div>
          </div>
          <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', animationDelay: '0.1s' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Фаъол</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)' }}>{activeCount}</div>
          </div>
          <div className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', animationDelay: '0.2s' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Умумии Даромад</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold)' }}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card fade-up" style={{ animationDelay: '0.3s' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontSize: '18px', fontWeight: 600 }}>
            Рӯйхати Обунаҳо
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Корбар</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Нақша</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Ҳолат</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Оғоз</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Анҷом</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                      Ягон обуна ёфт нашуд
                    </td>
                  </tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.user?.name || 'Номаълум'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{sub.user?.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--gold)' }}>
                        {sub.plan}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`pill ${sub.status === 'active' ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {sub.startedAt.toISOString().split('T')[0]}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {sub.expiresAt ? sub.expiresAt.toISOString().split('T')[0] : 'Беохир'}
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
