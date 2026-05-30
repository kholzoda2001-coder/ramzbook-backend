import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const COLORS = ['var(--teal)', 'var(--blue)', 'var(--purple)', 'var(--gold)', 'var(--orange)', 'var(--green)', 'var(--red)'];

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const SKILL_LABEL: Record<string, string> = {
  vocab: 'Луғат', grammar: 'Грамматика', reading: 'Хониш', listening: 'Шунавоӣ',
  speaking: 'Гӯиш', writing: 'Навиштан', review: 'Такрор', test: 'Санҷиш',
};

export default async function AdminAnalyticsPage() {
  try {
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const d14 = new Date(now); d14.setDate(d14.getDate() - 13); d14.setHours(0, 0, 0, 0);

    const [
      totalUsers, active7, new7, premiumUsers, completions7, completions30, accuracyAgg,
      recentSignups, recentCompletions, lessonsBySkill, courses, placementGroups, languages,
      wordTotal, grammarExTotal, phraseTotal, dialogueLineTotal, comprQTotal, placementTotal,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: d7 } } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.user.count({ where: { OR: [{ subscriptionTier: 'premium' }, { isPremium: true }] } }),
      prisma.userProgress.count({ where: { isCompleted: true, completedAt: { gte: d7 } } }),
      prisma.userProgress.count({ where: { isCompleted: true, completedAt: { gte: d30 } } }),
      prisma.userProgress.aggregate({ _avg: { accuracy: true }, where: { isCompleted: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: d14 } }, select: { createdAt: true } }),
      prisma.userProgress.findMany({ where: { isCompleted: true, completedAt: { gte: d14 } }, select: { completedAt: true } }),
      prisma.lesson.groupBy({ by: ['skillType'], _count: { _all: true } }),
      prisma.course.findMany({
        orderBy: { order: 'asc' },
        include: {
          targetLanguage: { select: { flag: true, name: true } },
          nativeLanguage: { select: { flag: true, nativeName: true } },
          _count: { select: { modules: true, grammarTopics: true, phraseCollections: true, dialogues: true, comprehensions: true } },
        },
      }),
      prisma.placementQuestion.groupBy({ by: ['targetLanguageId', 'nativeLanguageId'], _count: { _all: true } }),
      prisma.language.findMany({ select: { id: true, flag: true, name: true, nativeName: true } }),
      prisma.word.count(),
      prisma.grammarExercise.count(),
      prisma.phrase.count(),
      prisma.dialogueLine.count(),
      prisma.comprehensionQuestion.count(),
      prisma.placementQuestion.count(),
    ]);

    // words per course (bounded N — admin has few courses)
    const wordsPerCourse = await Promise.all(
      courses.map(c => prisma.word.count({ where: { lesson: { module: { courseId: c.id } } } }))
    );

    const avgAccuracy = Math.round(accuracyAgg._avg.accuracy ?? 0);

    // ── 14-day buckets ──
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); days.push(dayKey(d)); }
    const signupByDay: Record<string, number> = Object.fromEntries(days.map(k => [k, 0]));
    const completeByDay: Record<string, number> = Object.fromEntries(days.map(k => [k, 0]));
    recentSignups.forEach(u => { const k = dayKey(u.createdAt); if (k in signupByDay) signupByDay[k]++; });
    recentCompletions.forEach(p => { if (p.completedAt) { const k = dayKey(p.completedAt); if (k in completeByDay) completeByDay[k]++; } });
    const maxSignup = Math.max(1, ...days.map(k => signupByDay[k]));
    const maxComplete = Math.max(1, ...days.map(k => completeByDay[k]));

    // ── skill breakdown ──
    const totalLessons = lessonsBySkill.reduce((a, s) => a + s._count._all, 0);
    const skills = lessonsBySkill
      .map(s => ({ skill: s.skillType, count: s._count._all, percent: totalLessons ? Math.round((s._count._all / totalLessons) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    // ── placement coverage per pair ──
    const langName = (id: string) => languages.find(l => l.id === id);
    const placementByPair = placementGroups.map(g => {
      const t = langName(g.targetLanguageId); const n = langName(g.nativeLanguageId);
      return { label: `${t?.flag ?? ''} ${t?.name ?? '—'} → ${n?.flag ?? ''} ${n?.nativeName ?? '—'}`, count: g._count._all };
    }).sort((a, b) => b.count - a.count);

    const TH: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.3px', borderBottom: '1px solid var(--border)' };
    const TD: React.CSSProperties = { padding: '8px 10px', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' };

    const contentTotals = [
      { label: 'Луғат (вожаҳо)', icon: '📝', n: wordTotal },
      { label: 'Машқҳои грамматика', icon: '🔤', n: grammarExTotal },
      { label: 'Ибораҳо', icon: '💬', n: phraseTotal },
      { label: 'Сатрҳои муколама', icon: '🎙️', n: dialogueLineTotal },
      { label: 'Саволҳои дарк', icon: '📖', n: comprQTotal },
      { label: 'Саволҳои санҷиши сатҳ', icon: '🎯', n: placementTotal },
    ];

    return (
      <div className="page active">
        <div className="fade-up" style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>📈 Аналитика</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Афзоиш, фаъолияти омӯзиш ва фарогирии мундариҷа</p>
        </div>

        {/* KPIs */}
        <div className="sr">
          <div className="sc t"><div className="sh"><div className="si si-t">👥</div></div><div className="sv">{totalUsers.toLocaleString()}</div><div className="sl">Ҳамаи корбарон</div></div>
          <div className="sc b"><div className="sh"><div className="si si-b">🟢</div><span className="tr up">7 рӯз</span></div><div className="sv">{active7.toLocaleString()}</div><div className="sl">Корбарони фаъол</div></div>
          <div className="sc g"><div className="sh"><div className="si si-g">✨</div><span className="tr up">7 рӯз</span></div><div className="sv">{new7.toLocaleString()}</div><div className="sl">Корбарони нав</div></div>
          <div className="sc r"><div className="sh"><div className="si si-r">👑</div><span className="tr up">PRO</span></div><div className="sv">{premiumUsers.toLocaleString()}</div><div className="sl">Premium</div></div>
        </div>
        <div className="sr">
          <div className="sc b"><div className="sh"><div className="si si-b">📚</div><span className="tr up">7 рӯз</span></div><div className="sv">{completions7.toLocaleString()}</div><div className="sl">Дарсҳои анҷомёфта</div></div>
          <div className="sc t"><div className="sh"><div className="si si-t">📅</div><span className="tr up">30 рӯз</span></div><div className="sv">{completions30.toLocaleString()}</div><div className="sl">Дарсҳои анҷомёфта</div></div>
          <div className="sc g"><div className="sh"><div className="si si-g">🎯</div></div><div className="sv">{avgAccuracy}%</div><div className="sl">Дақиқии миёна</div></div>
          <div className="sc r"><div className="sh"><div className="si si-r">🏗️</div></div><div className="sv">{courses.length.toLocaleString()}</div><div className="sl">Курсҳо</div></div>
        </div>

        {/* Time-series charts */}
        <div className="two">
          <div className="sec">
            <div className="shd"><div className="st">✨ Корбарони нав (14 рӯз)</div></div>
            <div className="sb2">
              {days.map((k, i) => (
                <div className="ub" key={k}>
                  <span className="ul">{k.slice(5)}</span>
                  <div className="ut"><div className="uf" style={{ width: `${Math.round((signupByDay[k] / maxSignup) * 100)}%`, background: COLORS[i % COLORS.length] }}></div></div>
                  <span className="uv">{signupByDay[k]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sec">
            <div className="shd"><div className="st">📚 Дарсҳои анҷомёфта (14 рӯз)</div></div>
            <div className="sb2">
              {days.map((k, i) => (
                <div className="ub" key={k}>
                  <span className="ul">{k.slice(5)}</span>
                  <div className="ut"><div className="uf" style={{ width: `${Math.round((completeByDay[k] / maxComplete) * 100)}%`, background: COLORS[(i + 1) % COLORS.length] }}></div></div>
                  <span className="uv">{completeByDay[k]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill composition + content totals */}
        <div className="two">
          <div className="sec">
            <div className="shd"><div className="st">🧩 Дарсҳо аз рӯи маҳорат</div></div>
            <div className="sb2">
              {skills.length === 0 && <div style={{ color: 'var(--text3)', padding: '12px' }}>Дарсҳо нестанд.</div>}
              {skills.map((s, i) => (
                <div className="ub" key={s.skill}>
                  <span className="ul">{SKILL_LABEL[s.skill] ?? s.skill}</span>
                  <div className="ut"><div className="uf" style={{ width: `${s.percent}%`, background: COLORS[i % COLORS.length] }}></div></div>
                  <span className="uv">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sec">
            <div className="shd"><div className="st">📦 Миқдори умумии мундариҷа</div></div>
            <div className="sb2">
              {contentTotals.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.icon} {c.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.n.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content coverage per course */}
        <div className="sec">
          <div className="shd"><div className="st">🗂️ Фарогирии мундариҷа аз рӯи курс</div></div>
          <div className="sb2" style={{ overflowX: 'auto' }}>
            {courses.length === 0 ? (
              <div style={{ color: 'var(--text3)', padding: '12px' }}>Курсҳо нестанд.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={TH}>Курс</th>
                    <th style={TH}>Сатҳ</th>
                    <th style={TH}>📝 Вожа</th>
                    <th style={TH}>🔤 Грам.</th>
                    <th style={TH}>💬 Ибора</th>
                    <th style={TH}>🎙️ Мукол.</th>
                    <th style={TH}>📖 Дарк</th>
                    <th style={TH}>📦 Модул</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => (
                    <tr key={c.id}>
                      <td style={TD}>{c.emoji} {c.targetLanguage.flag} {c.targetLanguage.name} → {c.nativeLanguage.flag} {c.nativeLanguage.nativeName}</td>
                      <td style={TD}>{c.level}</td>
                      <td style={TD}>{wordsPerCourse[i].toLocaleString()}</td>
                      <td style={TD}>{c._count.grammarTopics}</td>
                      <td style={TD}>{c._count.phraseCollections}</td>
                      <td style={TD}>{c._count.dialogues}</td>
                      <td style={TD}>{c._count.comprehensions}</td>
                      <td style={TD}>{c._count.modules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Placement coverage */}
        <div className="sec">
          <div className="shd"><div className="st">🎯 Фарогирии санҷиши сатҳ (аз рӯи ҷуфти забон)</div></div>
          <div className="sb2">
            {placementByPair.length === 0 ? (
              <div style={{ color: 'var(--text3)', padding: '12px' }}>Ягон саволи санҷиши сатҳ илова нашудааст.</div>
            ) : placementByPair.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.count} савол</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('ANALYTICS ERROR:', error?.message);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Аналитика бор нашуд</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{error?.message || 'Database error'}</p>
      </div>
    );
  }
}
