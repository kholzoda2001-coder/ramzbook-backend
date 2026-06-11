import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteCourseBtn from '../_components/DeleteCourseBtn';

export const dynamic = 'force-dynamic';

const controlStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
};

export default async function AdminLearningLanguagePage({
  params,
  searchParams,
}: {
  params: { languageId: string };
  searchParams: { native?: string; level?: string };
}) {
  try {
    const where = {
      targetLanguageId: params.languageId,
      ...(searchParams.native ? { nativeLanguageId: searchParams.native } : {}),
      ...(searchParams.level ? { level: searchParams.level } : {}),
    };

    const [language, courses, nativeLangs] = await Promise.all([
      prisma.language.findUnique({
        where: { id: params.languageId },
        include: { _count: { select: { coursesAsTarget: true, userLanguages: true } } },
      }),
      prisma.course.findMany({
        where,
        include: {
          nativeLanguage: true,
          _count: {
            select: {
              modules: true,
              grammarTopics: true,
              phraseCollections: true,
              dialogues: true,
              comprehensions: true,
            },
          },
          modules: {
            select: {
              id: true,
              title: true,
              emoji: true,
              order: true,
              _count: { select: { lessons: true } },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: [{ order: 'asc' }, { level: 'asc' }],
      }),
      prisma.language.findMany({ where: { canBeNative: true }, orderBy: { order: 'asc' } }),
    ]);

    if (!language || !language.canBeTarget) notFound();

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const moduleCount = courses.reduce((sum, c) => sum + c._count.modules, 0);
    const lessonCount = courses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m._count.lessons, 0), 0);
    const grammarCount = courses.reduce((sum, c) => sum + c._count.grammarTopics, 0);

    return (
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
          <Link href="/admin/courses" style={{ color: 'var(--text3)' }}>Забонҳои Омӯзишӣ</Link> › {language.flag} {language.name}
        </div>

        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 58, height: 58, borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'rgba(20,184,166,0.12)', fontSize: '32px' }}>{language.flag}</div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{language.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                {language.nativeName} · {courses.length} курс · {moduleCount} модул · {lessonCount} дарс · {grammarCount} грамматика
              </p>
            </div>
          </div>
          <Link href={`/admin/courses/new?targetLanguageId=${language.id}`} style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            + Курси нав дар ин забон
          </Link>
        </div>

        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px', marginBottom: '22px' }}>
          <MiniStat label="Курсҳо" value={courses.length} />
          <MiniStat label="Модулҳо" value={moduleCount} />
          <MiniStat label="Дарсҳо" value={lessonCount} />
          <MiniStat label="Грамматика" value={grammarCount} />
        </div>

        <form method="GET" className="fade-up" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <select name="native" defaultValue={searchParams.native ?? ''} style={controlStyle}>
            <option value="">Ҳамаи забонҳои модарӣ</option>
            {nativeLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
          </select>
          <select name="level" defaultValue={searchParams.level ?? ''} style={controlStyle}>
            <option value="">Ҳамаи сатҳҳо</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit" style={{ ...controlStyle, cursor: 'pointer', fontWeight: 600 }}>Филтр</button>
          <Link href={`/admin/courses/${language.id}`} style={{ ...controlStyle, textDecoration: 'none', color: 'var(--text3)' }}>Тоза кардан</Link>
        </form>

        {courses.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Дар ин забон ҳоло курс нест</h3>
            <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '18px' }}>Аввал курс созед, баъд дар дохили он модул, дарс, грамматика ва дигар маводро илова кунед.</p>
            <Link href={`/admin/courses/new?targetLanguageId=${language.id}`} style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              + Сохтани курси аввал
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
            {courses.map(course => {
              const lessonTotal = course.modules.reduce((sum, m) => sum + m._count.lessons, 0);
              const extraTotal = course._count.phraseCollections + course._count.dialogues + course._count.comprehensions;

              return (
                <div key={course.id} className="glass-card fade-up" style={{ padding: '22px', borderRadius: '16px', borderTop: `4px solid ${course.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '30px' }}>{course.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '17px' }}>{course.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {language.flag} {language.name} → {course.nativeLanguage.flag} {course.nativeLanguage.nativeName}
                      </div>
                    </div>
                    <span className={`pill ${course.isActive ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                      {course.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>Сатҳ: {course.level}</span>
                    <span className="pill" style={{ background: 'rgba(20,184,166,0.12)', color: '#2DD4BF', fontSize: '12px' }}>{course._count.modules} модул</span>
                    <span className="pill" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', fontSize: '12px' }}>{lessonTotal} дарс</span>
                    <span className="pill" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', fontSize: '12px' }}>{course._count.grammarTopics} грамматика</span>
                    {extraTotal > 0 && <span className="pill" style={{ background: 'rgba(168,85,247,0.12)', color: '#C084FC', fontSize: '12px' }}>{extraTotal} мавод</span>}
                  </div>

                  {course.modules.length > 0 && (
                    <div style={{ marginBottom: '16px', display: 'grid', gap: '8px' }}>
                      {course.modules.slice(0, 3).map(mod => (
                        <Link key={mod.id} href={`/admin/lessons?moduleId=${mod.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.035)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px' }}>
                          <span>{mod.emoji} {mod.title}</span>
                          <span>{mod._count.lessons} дарс</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link href={`/admin/modules?courseId=${course.id}`} style={actionStyle}>Модулҳо</Link>
                    <Link href={`/admin/lessons?courseId=${course.id}`} style={actionStyle}>Дарсҳо</Link>
                    <Link href={`/admin/grammar?courseId=${course.id}`} style={actionStyle}>Грамматика</Link>
                    <DeleteCourseBtn id={course.id} title={course.title} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_NOT_FOUND')) throw error;
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани дохили забон</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}

const actionStyle: React.CSSProperties = {
  background: 'rgba(20,184,166,0.1)',
  color: 'var(--teal)',
  border: '1px solid rgba(20,184,166,0.18)',
  borderRadius: '7px',
  padding: '7px 10px',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '12px',
};

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card" style={{ padding: '14px', borderRadius: '12px' }}>
      <div style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800 }}>{value}</div>
      <div style={{ color: 'var(--text3)', fontSize: '12px' }}>{label}</div>
    </div>
  );
}
