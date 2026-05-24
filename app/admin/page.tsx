import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalUsers, premiumUsers, lessonsToday, monthlyPayments, topUsers, languages, recentUsers, recentPayments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.userProgress.count({ where: { completedAt: { gte: startOfDay } } }),
      prisma.payment.findMany({ where: { status: 'success', createdAt: { gte: startOfMonth } } }),
      prisma.user.findMany({ orderBy: { totalXp: 'desc' }, take: 5 }),
      prisma.language.findMany({ include: { _count: { select: { userLanguages: true } } }, orderBy: { order: 'asc' } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
      prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 2 }),
    ]);

    const monthlyIncome = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalEnrolls = languages.reduce((sum, l) => sum + l._count.userLanguages, 0);
    const langStats = languages.map(l => ({
      id: l.id, name: l.name, flag: l.flag,
      count: l._count.userLanguages,
      percent: totalEnrolls > 0 ? Math.round((l._count.userLanguages / totalEnrolls) * 100) : 0
    }));
    const activities = [
      ...recentUsers.map(u => ({ title: `Корбари нав: ${u.name} ба қайд гирифт`, date: u.createdAt, color: 'var(--teal)' })),
      ...recentPayments.map(p => ({ title: `${p.user?.name || 'Корбар'} Premium обуна шуд — $${p.amount.toFixed(2)}`, date: p.createdAt, color: 'var(--gold)' }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    const colors = ['var(--teal)', 'var(--blue)', 'var(--purple)', 'var(--gold)', 'var(--orange)', 'var(--red)'];

    return (
      <div className="page active" id="page-dashboard">
        <div className="sr">
          <div className="sc t">
            <div className="sh"><div className="si si-t">👥</div><span className="tr up">↑ Актив</span></div>
            <div className="sv">{totalUsers.toLocaleString()}</div>
            <div className="sl">Ҳамаи корбарон</div>
          </div>
          <div className="sc g">
            <div className="sh"><div className="si si-g">👑</div><span className="tr up">PRO</span></div>
            <div className="sv">{premiumUsers.toLocaleString()}</div>
            <div className="sl">Premium</div>
          </div>
          <div className="sc b">
            <div className="sh"><div className="si si-b">📚</div><span className="tr up">Имрӯз</span></div>
            <div className="sv">{lessonsToday.toLocaleString()}</div>
            <div className="sl">Дарсҳои хондашуда</div>
          </div>
          <div className="sc r">
            <div className="sh"><div className="si si-r">💰</div><span className="tr up">↑ Даромад</span></div>
            <div className="sv">${monthlyIncome.toFixed(2)}</div>
            <div className="sl">Даромади ин моҳ</div>
          </div>
        </div>

        <div className="two">
          <div className="sec">
            <div className="shd">
              <div className="st">🏆 Top корбарон (аз рӯи XP)</div>
              <Link href="/admin/users" className="btn bg2b" style={{ textDecoration: 'none' }}>Ҳама →</Link>
            </div>
            <div className="sb2">
              {topUsers.length === 0 && <div style={{ color: 'var(--text3)', padding: '20px' }}>Корбарон ёфт нашуданд.</div>}
              {topUsers.map((u, idx) => (
                <div className="mli" key={u.id}>
                  <div className="avatar" style={{ background: colors[idx % colors.length] }}>
                    {u.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mln">{u.name || 'Корбари Номаълум'}</div>
                    <div className="mls">🔥 {u.streak} рӯз • {u.totalXp.toLocaleString()} XP</div>
                  </div>
                  {u.isPremium ? <span className="pill pp">Premium</span> : <span className="pill pa">Free</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <div className="shd"><div className="st">🌍 Забонҳои интихобшуда</div></div>
            <div className="sb2">
              {langStats.length === 0 && <div style={{ color: 'var(--text3)', padding: '20px' }}>Забонҳо ёфт нашуданд.</div>}
              {langStats.map((l, idx) => {
                const c = colors[idx % colors.length];
                return (
                  <div className="ub" key={l.id}>
                    <span className="ul">{l.flag} {l.name}</span>
                    <div className="ut"><div className="uf" style={{ width: `${l.percent}%`, background: c }}></div></div>
                    <span className="uv" style={{ color: c }}>{l.percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sec">
          <div className="shd">
            <div className="st">⚡ Охирин фаъолиятҳо</div>
            <span style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 700 }}>● Live</span>
          </div>
          <div className="sb2">
            {activities.length === 0 && <div style={{ color: 'var(--text3)', padding: '20px' }}>Фаъолиятҳо ёфт нашуданд.</div>}
            {activities.map((act, i) => {
              const diffMin = Math.floor((new Date().getTime() - act.date.getTime()) / 60000);
              const timeText = diffMin < 60 ? `${diffMin} дақиқа пеш` : `${Math.floor(diffMin / 60)} соат пеш`;
              return (
                <div className="noti" key={i}>
                  <div className="ndot" style={{ background: act.color }}></div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{act.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{timeText}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('DASHBOARD ERROR:', error?.message);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Базаи додаҳо пайваст нест</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
          {error?.message || 'Database connection failed'}
        </p>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>
          Лутфан DATABASE_URL-ро дар Vercel Environment Variables тафтиш кунед.
        </p>
      </div>
    );
  }
}
