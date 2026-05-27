import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { target?: string; native?: string; level?: string };
}) {
  try {
    const where: any = {};
    if (searchParams.target) where.targetLanguageId = searchParams.target;
    if (searchParams.native) where.nativeLanguageId = searchParams.native;
    if (searchParams.level) where.level = searchParams.level;

    const [courses, targetLangs, nativeLangs] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          targetLanguage: true,
          nativeLanguage: true,
          _count: { select: { modules: true } },
        },
        orderBy: [{ order: 'asc' }, { level: 'asc' }],
      }),
      prisma.language.findMany({ where: { canBeTarget: true }, orderBy: { order: 'asc' } }),
      prisma.language.findMany({ where: { canBeNative: true }, orderBy: { order: 'asc' } }),
    ]);

    const selTarget = targetLangs.find(l => l.id === searchParams.target);
    const selNative = nativeLangs.find(l => l.id === searchParams.native);
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    const labelInput = { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' };

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Забонҳои Омӯзишӣ</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {selTarget || selNative
                ? `Забонҳои ${selTarget ? selTarget.flag + ' ' + selTarget.name : 'ҳама'} барои ${selNative ? selNative.flag + ' ' + selNative.nativeName : 'ҳама'} (${courses.length})`
                : `Ҳамаи забонҳои омӯзишӣ (${courses.length})`}
            </p>
          </div>
          <Link href="/admin/courses/new" style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            + Иловаи забони омӯзишӣ
          </Link>
        </div>

        {/* Filters */}
        <form method="GET" className="fade-up" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <select name="target" defaultValue={searchParams.target ?? ''} style={labelInput}>
            <option value="">Ҳамаи забонҳои омӯзишӣ</option>
            {targetLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
          </select>
          <select name="native" defaultValue={searchParams.native ?? ''} style={labelInput}>
            <option value="">Ҳамаи забонҳои модарӣ</option>
            {nativeLangs.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
          </select>
          <select name="level" defaultValue={searchParams.level ?? ''} style={labelInput}>
            <option value="">Ҳамаи сатҳҳо</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit" style={{ ...labelInput, cursor: 'pointer', fontWeight: 600 }}>Филтр</button>
          <Link href="/admin/courses" style={{ ...labelInput, textDecoration: 'none', color: 'var(--text3)' }}>Тоза кардан</Link>
        </form>

        {courses.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Ягон забон ёфт нашуд</h3>
            <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Забони нави омӯзишӣ илова кунед ё филтрро тағйир диҳед.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <Link key={course.id} href={`/admin/modules?courseId=${course.id}`} className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', borderTop: `4px solid ${course.color}`, textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '32px' }}>{course.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{course.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      {course.targetLanguage.flag} {course.targetLanguage.name} → {course.nativeLanguage.flag} {course.nativeLanguage.nativeName}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>Сатҳ: {course.level}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{course._count.modules} Модул</span>
                  <span className={`pill ${course.isActive ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                    {course.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани курсҳо</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}
