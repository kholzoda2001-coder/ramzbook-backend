import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
    },
    orderBy: {
      startedAt: 'desc'
    }
  });

  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  
  const payments = await prisma.payment.findMany({
    where: { status: 'success' }
  });
  
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Обунаҳо (Premium)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {activeCount} обунаҳои фаъол аз {subscriptions.length} умумӣ
          </p>
        </div>
        <div className="glass-card" style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
          <div style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>Умумии даромад</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="glass-card fade-up" style={{ animationDelay: '0.1s' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600, width: '30%' }}>Корбар</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Нақша (Plan)</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Ҳолат (Status)</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar" style={{ background: 'var(--gold)', width: 32, height: 32, fontSize: 14 }}>
                          {sub.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.user.name || 'Беном'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{sub.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--gold)' }}>
                      {sub.plan}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`pill ${sub.status === 'ACTIVE' ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {sub.startedAt.toISOString().split('T')[0]}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {sub.expiresAt ? sub.expiresAt.toISOString().split('T')[0] : 'Беохир (Lifetime)'}
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
