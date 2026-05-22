import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        language: true,
        _count: { select: { units: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Курс / Модулҳо</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Рӯйхати ҳамаи курсҳо ({courses.length})
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Ягон курс ёфт нашуд</h3>
            <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
              Лутфан тавассути API seed маълумот ворид кунед.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <div key={course.id} className="glass-card fade-up" style={{ padding: '24px', borderRadius: '16px', borderTop: `4px solid ${course.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px' }}>{course.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{course.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{course.language?.flag} {course.language?.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Сатҳ: {course.level}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text3)' }}>
                    {course._count.units} Модул
                  </span>
                  <span className={`pill ${course.isActive ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                    {course.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                  </span>
                </div>
              </div>
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
