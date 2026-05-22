import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 1. Basic Stats
  const totalUsers = await prisma.user.count();
  const premiumUsers = await prisma.user.count({ where: { isPremium: true } });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Lessons today (completed or active UserProgress)
  const lessonsToday = await prisma.userProgress.count({
    where: { updatedAt: { gte: startOfDay } }
  });

  // Monthly income
  const payments = await prisma.payment.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }
  });
  const monthlyIncome = payments.reduce((acc, p) => acc + p.amount, 0);

  // 2. Top Users
  const topUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 5
  });

  // 3. Language Distribution
  const languages = await prisma.language.findMany({
    include: { _count: { select: { users: true } } }
  });
  
  const totalEnrolls = languages.reduce((sum, lang) => sum + lang._count.users, 0);
  const langStats = languages.map(l => ({
    id: l.id,
    name: l.name,
    code: l.code,
    flag: l.flagIcon || '🌐',
    count: l._count.users,
    percent: totalEnrolls > 0 ? Math.round((l._count.users / totalEnrolls) * 100) : 0
  })).sort((a, b) => b.percent - a.percent);

  // 4. Recent Activities (Merge recent users and payments)
  const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  const recentPayments = await prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 2 });
  
  const activities = [
    ...recentUsers.map(u => ({
      type: 'USER', 
      title: `Корбари нав: ${u.name || 'Номаълум'} ба қайд гирифт`, 
      date: u.createdAt,
      color: 'var(--teal)'
    })),
    ...recentPayments.map(p => ({
      type: 'PAYMENT', 
      title: `${p.user?.name || 'Корбар'} Premium обуна шуд — $${p.amount.toFixed(2)}`, 
      date: p.createdAt,
      color: 'var(--gold)'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Colors for languages
  const colors = ['var(--teal)', 'var(--blue)', 'var(--purple)', 'var(--gold)', 'var(--orange)', 'var(--red)'];

  return (
    <div className="page active" id="page-dashboard">
      <div className="sr">
        <div className="sc t">
          <div className="sh">
            <div className="si si-t">👥</div>
            <span className="tr up">↑ Актив</span>
          </div>
          <div className="sv">{totalUsers.toLocaleString()}</div>
          <div className="sl">Ҳамаи корбарон</div>
        </div>
        <div className="sc g">
          <div className="sh">
            <div className="si si-g">👑</div>
            <span className="tr up">PRO</span>
          </div>
          <div className="sv">{premiumUsers.toLocaleString()}</div>
          <div className="sl">Premium</div>
        </div>
        <div className="sc b">
          <div className="sh">
            <div className="si si-b">📚</div>
            <span className="tr up">Имрӯз</span>
          </div>
          <div className="sv">{lessonsToday.toLocaleString()}</div>
          <div className="sl">Дарсҳои хондашуда</div>
        </div>
        <div className="sc r">
          <div className="sh">
            <div className="si si-r">💰</div>
            <span className="tr up">↑ Даромад</span>
          </div>
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
            {topUsers.length === 0 && <div style={{ color: 'var(--text3)' }}>Корбарон ёфт нашуданд.</div>}
            {topUsers.map((u, idx) => (
              <div className="mli" key={u.id}>
                <div className="avatar" style={{ background: colors[idx % colors.length] }}>
                  {u.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mln">{u.name || 'Корбари Номаълум'}</div>
                  <div className="mls">🔥 {u.streak} рӯз • {u.xp.toLocaleString()} XP</div>
                </div>
                {u.isPremium ? (
                  <span className="pill pp">Premium</span>
                ) : (
                  <span className="pill pa">Free</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="sec">
          <div className="shd"><div className="st">🌍 Забонҳои интихобшуда</div></div>
          <div className="sb2">
            {langStats.length === 0 && <div style={{ color: 'var(--text3)' }}>Забонҳо ёфт нашуданд.</div>}
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
          {activities.length === 0 && <div style={{ color: 'var(--text3)' }}>Фаъолиятҳо ёфт нашуданд.</div>}
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
}
