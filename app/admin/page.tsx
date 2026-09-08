import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { startOfDayTJ, startOfMonthTJ } from '@/lib/admin-time';
import { realUserSql, realUserWhere } from '@/lib/admin/realUser';
import { liveStreak } from '@/lib/streakDisplay';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Human-readable "time ago". The old inline version only had two branches
 * (minutes, then hours forever), so a six-week-old payment rendered as
 * "1015 соат пеш" — technically true, unreadable in practice.
 */
function relTime(date: Date, now: Date): string {
  const min = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (min < 1) return 'ҳозир';
  if (min < 60) return `${min} дақиқа пеш`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} соат пеш`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} рӯз пеш`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} моҳ пеш`;
  return `${Math.floor(months / 12)} сол пеш`;
}

export default async function AdminDashboardPage() {
  try {
    const now = new Date();
    // Vercel runs in UTC, so plain setHours(0,0,0,0) meant 05:00 Dushanbe —
    // "Имрӯз" was off by five hours every single day.
    const startOfDay = startOfDayTJ(now);
    const startOfMonth = startOfMonthTJ(now);

    // ЯГОНА таърифи «корбари воқеӣ» — lib/admin/realUser.ts. Нусхаи дастии
    // ин ҷо танҳо `Test User%`-ро медонист, пас Dashboard 204 ва Аналитика
    // 163 нишон медоданд: роботҳои Google дар ин саҳифа ҳамчун корбар
    // ҳисоб мешуданд.
    const realUser = realUserWhere;
    // Ҳамон шарт барои ду `$queryRaw`-и поён, бо алиаси `u`.
    const realUserRaw = Prisma.raw(realUserSql('u'));

    const [totalUsers, premiumUsers, premiumByPlan, lessonsToday, monthlyPayments, topUsers, languages, recentUsers, recentPayments, learnerRows, activeLearnerRows] = await Promise.all([
      prisma.user.count({ where: realUser }),
      // "Premium" must mean CURRENTLY premium. `isPremium` only gets lazily
      // cleared on expiry when a user happens to hit one of a few specific
      // routes (see lib/premium.ts checkAndUpdatePremium) — reading it
      // directly over-counts anyone who has EVER had premium, including
      // long-expired ones. Recompute the real answer from the expiry date.
      prisma.user.count({
        where: { ...realUser, isPremium: true, OR: [{ premiumPlan: 'lifetime' }, { premiumExpiresAt: { gte: now } }] },
      }),
      // …and split it by plan. Almost every "Premium" account right now is a
      // free promo gift (premiumPlan:'promo'), so a bare "48" reads as 48
      // paying customers when only a couple of them actually paid.
      prisma.user.groupBy({
        by: ['premiumPlan'],
        where: { ...realUser, isPremium: true, OR: [{ premiumPlan: 'lifetime' }, { premiumExpiresAt: { gte: now } }] },
        _count: { _all: true },
      }),
      prisma.userProgress.count({ where: { isCompleted: true, completedAt: { gte: startOfDay }, user: realUser } }),
      // ⚠️ The `Payment` model is DEAD — no code anywhere still writes to it
      // (real purchases + the promo gift both write to `PaymentTransaction`,
      // same table /api/admin/stats/dashboard already uses correctly). This
      // page was never updated when that migration happened, so "income"
      // silently showed $0.00 forever regardless of real revenue.
      prisma.paymentTransaction.findMany({ where: { status: 'success', createdAt: { gte: startOfMonth } } }),
      prisma.user.findMany({ where: realUser, orderBy: { totalXp: 'desc' }, take: 5 }),
      prisma.language.findMany({
        select: { id: true, name: true, flag: true, code: true },
        orderBy: { order: 'asc' },
      }),
      prisma.user.findMany({ where: realUser, orderBy: { createdAt: 'desc' }, take: 3 }),
      // Real paid purchases only (type:'subscription') — promo/trial grants
      // are $0 and read oddly under the "Premium обуна шуд — $0.00" wording
      // below, which specifically describes a PAID subscription event.
      prisma.paymentTransaction.findMany({
        where: { status: 'success', type: 'subscription' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 2,
      }),
      // ⚠️ "Забонҳои интихобшуда" used to count rows in `UserLanguage` — a
      // table NOTHING in the codebase ever inserts into (grep: only findMany /
      // updateMany / deleteMany). The app saves the learner's choice on
      // `User.targetLang` via /api/mobile/preferences, so that table is empty
      // in production and EVERY language sat at a permanent 0%.
      //
      // A user counts toward a language if they picked it as their target OR
      // have progress in one of that language's courses (older accounts were
      // created before `targetLang` was written, so the progress signal is the
      // only evidence they exist). UNION dedupes, so one user is counted at
      // most once per language.
      prisma.$queryRaw<Array<{ lid: string; n: number }>>`
        SELECT lid, COUNT(*)::int AS n FROM (
          SELECT DISTINCT c."targetLanguageId" AS lid, up."userId" AS uid
            FROM "UserProgress" up
            JOIN "Lesson"  le ON le.id = up."lessonId"
            JOIN "Module"  m  ON m.id  = le."moduleId"
            JOIN "Course"  c  ON c.id  = m."courseId"
            JOIN "User"    u  ON u.id  = up."userId"
           WHERE ${realUserRaw}
          UNION
          SELECT l.id AS lid, u.id AS uid
            FROM "User" u
            JOIN "Language" l ON l.code = u."targetLang"
           WHERE ${realUserRaw}
        ) t GROUP BY lid`,
      // How many of those accounts ever finished a lesson — a registration
      // total alone says nothing about whether anyone actually studies.
      prisma.$queryRaw<Array<{ n: number }>>`
        SELECT COUNT(DISTINCT up."userId")::int AS n
          FROM "UserProgress" up
          JOIN "User" u ON u.id = up."userId"
         WHERE up."isCompleted" = true
           AND ${realUserRaw}`,
    ]);

    const monthlyIncome = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
    const activeLearners = Number(activeLearnerRows[0]?.n ?? 0);
    const promoPremium = premiumByPlan
      .filter(g => g.premiumPlan === 'promo')
      .reduce((s, g) => s + g._count._all, 0);
    const paidPremium = premiumUsers - promoPremium;

    const learnersByLang = new Map(learnerRows.map(r => [r.lid, Number(r.n)]));
    const totalEnrolls = languages.reduce((sum, l) => sum + (learnersByLang.get(l.id) ?? 0), 0);
    const langStats = languages
      .map(l => {
        const count = learnersByLang.get(l.id) ?? 0;
        return {
          id: l.id, name: l.name, flag: l.flag, count,
          percent: totalEnrolls > 0 ? Math.round((count / totalEnrolls) * 100) : 0,
        };
      })
      // Biggest first — the old fixed `order` listing buried the real answer
      // under languages nobody is learning yet.
      .sort((a, b) => b.count - a.count);
    const activities = [
      ...recentUsers.map(u => ({ title: `Корбари нав: ${u.name} ба қайд гирифт`, date: u.createdAt, color: 'var(--teal)' })),
      ...recentPayments.map(p => ({ title: `${p.user?.name || 'Корбар'} Premium обуна шуд — $${p.amount.toFixed(2)}`, date: p.createdAt, color: 'var(--gold)' }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    const colors = ['var(--teal)', 'var(--blue)', 'var(--purple)', 'var(--gold)', 'var(--orange)', 'var(--red)'];

    // "Premium" pill on the top-XP list — same freshness rule as the KPI
    // above, computed per-row instead of trusting the raw stored flag.
    const isReallyPremium = (u: { isPremium: boolean; premiumPlan: string | null; premiumExpiresAt: Date | null }) =>
      u.isPremium && (u.premiumPlan === 'lifetime' || (!!u.premiumExpiresAt && u.premiumExpiresAt >= now));

    return (
      <div className="page active" id="page-dashboard">
        <div className="sr">
          <div className="sc t">
            <div className="sh"><div className="si si-t">👥</div><span className="tr up">↑ Актив</span></div>
            <div className="sv">{totalUsers.toLocaleString()}</div>
            <div className="sl">Ҳамаи корбарон · {activeLearners} дарс хондаанд</div>
          </div>
          <div className="sc g">
            <div className="sh"><div className="si si-g">👑</div><span className="tr up">PRO</span></div>
            <div className="sv">{premiumUsers.toLocaleString()}</div>
            <div className="sl">Premium · {paidPremium} пулакӣ · {promoPremium} тӯҳфа</div>
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
                    {/* Силсилаи ЗИНДА — ниг. lib/streakDisplay.ts. Майдони хом
                        рақами касеро нишон медод, ки моҳҳо пеш рафтааст. */}
                    <div className="mls">🔥 {liveStreak(u, now)} рӯз • {u.totalXp.toLocaleString()} XP</div>
                  </div>
                  {isReallyPremium(u) ? <span className="pill pp">Premium</span> : <span className="pill pa">Free</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <div className="shd">
              <div className="st">🌍 Забонҳои интихобшуда</div>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{totalEnrolls} интихоб</span>
            </div>
            <div className="sb2">
              {langStats.length === 0 && <div style={{ color: 'var(--text3)', padding: '20px' }}>Забонҳо ёфт нашуданд.</div>}
              {langStats.map((l, idx) => {
                const c = colors[idx % colors.length];
                return (
                  <div className="ub" key={l.id}>
                    <span className="ul">{l.flag} {l.name}</span>
                    <div className="ut"><div className="uf" style={{ width: `${l.percent}%`, background: c }}></div></div>
                    {/* `.uv` is a fixed 34px column — too narrow now that the
                        raw learner count sits next to the percentage. */}
                    <span className="uv" style={{ color: c, whiteSpace: 'nowrap', width: 'auto', minWidth: 66 }}>
                      {l.count} · {l.percent}%
                    </span>
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
              const timeText = relTime(act.date, now);
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
