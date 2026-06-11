import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
};

function uniqueLevels(courses: { level: string }[]) {
  return Array.from(new Set(courses.map(c => c.level).filter(Boolean))).sort();
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { native?: string; q?: string };
}) {
  try {
    const nativeFilter = searchParams.native;
    const query = (searchParams.q ?? '').trim().toLowerCase();

    const [languages, nativeLangs] = await Promise.all([
      prisma.language.findMany({
        where: {
          canBeTarget: true,
          ...(query
            ? {
                OR: [
                  { name: { contains: query } },
                  { nativeName: { contains: query } },
                  { code: { contains: query } },
                ],
              }
            : {}),
        },
        include: {
          coursesAsTarget: {
            where: nativeFilter ? { nativeLanguageId: nativeFilter } : {},
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
                select: { _count: { select: { lessons: true } } },
              },
            },
            orderBy: [{ order: 'asc' }, { level: 'asc' }],
          },
          _count: { select: { coursesAsTarget: true, userLanguages: true } },
        },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.language.findMany({ where: { canBeNative: true }, orderBy: { order: 'asc' } }),
    ]);

    const visibleLanguages = languages.filter(lang => !nativeFilter || lang.coursesAsTarget.length > 0);

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Забонҳои Омӯзишӣ</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Ҳамаи забонҳое, ки донишҷӯ метавонад омӯзад ({visibleLanguages.length})
            </p>
          </div>
          <Link href="/admin/courses/new" style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            + Иловаи забони омӯзишӣ
          </Link>
        </div>

        <form method="GET" className="fade-up" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Ҷустуҷӯи забон..." style={{ ...selectStyle, minWidth: 220 }} />
          <select name="native" defaultValue={nativeFilter ?? ''} style={selectStyle}>
            <option value="">Ҳамаи забонҳои модарӣ</option>
            {nativeLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
          </select>
          <button type="submit" style={{ ...selectStyle, cursor: 'pointer', fontWeight: 600 }}>Филтр</button>
          <Link href="/admin/courses" style={{ ...selectStyle, textDecoration: 'none', color: 'var(--text3)' }}>Тоза кардан</Link>
        </form>

        {visibleLanguages.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Ягон забони омӯзишӣ ёфт нашуд</h3>
            <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Забони нав илова кунед ё филтрро тағйир диҳед.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {visibleLanguages.map(lang => {
              const courses = lang.coursesAsTarget;
              const levels = uniqueLevels(courses);
              const moduleCount = courses.reduce((sum, c) => sum + c._count.modules, 0);
              const lessonCount = courses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m._count.lessons, 0), 0);
              const grammarCount = courses.reduce((sum, c) => sum + c._count.grammarTopics, 0);
              const componentCount = courses.reduce((sum, c) => sum + c._count.phraseCollections + c._count.dialogues + c._count.comprehensions, 0);
              const nativeNames = Array.from(new Set(courses.map(c => `${c.nativeLanguage.flag} ${c.nativeLanguage.nativeName}`)));

              return (
                <Link key={lang.id} href={`/admin/courses/${lang.id}`} className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', borderTop: '4px solid var(--teal)', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'rgba(20,184,166,0.12)', fontSize: '28px' }}>{lang.flag}</div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '18px' }}>{lang.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{lang.nativeName} · {lang.code}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    <Stat label="Курс" value={courses.length} />
                    <Stat label="Модул" value={moduleCount} />
                    <Stat label="Дарс" value={lessonCount} />
                    <Stat label="Грамматика" value={grammarCount} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {levels.length ? levels.map(level => (
                      <span key={level} className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>{level}</span>
                    )) : (
                      <span style={{ color: 'var(--text3)', fontSize: '12px' }}>Ҳоло курс надорад</span>
                    )}
                    {componentCount > 0 && (
                      <span className="pill" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', fontSize: '12px' }}>{componentCount} мавод</span>
                    )}
                  </div>

                  {nativeNames.length > 0 && (
                    <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text3)' }}>
                      Барои: {nativeNames.slice(0, 3).join(', ')}{nativeNames.length > 3 ? ` +${nativeNames.length - 3}` : ''}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани забонҳо</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800 }}>{value}</div>
      <div style={{ color: 'var(--text3)', fontSize: '11px' }}>{label}</div>
    </div>
  );
}
