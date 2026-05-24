import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: { courseId?: string };
}) {
  try {
    const courses = await prisma.course.findMany({
      where: searchParams.courseId ? { id: searchParams.courseId } : {},
      include: {
        targetLanguage: true,
        nativeLanguage: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { words: true, progress: true } } },
            },
          },
        },
      },
      orderBy: [{ order: 'asc' }, { level: 'asc' }],
    });

    const totalLessons = courses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0), 0);

    return (
      <div>
        <div className="fade-up" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Дарсҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Ҳамаи дарсҳо — Ҷамъ: {totalLessons}</p>
        </div>

        {courses.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Ягон дарс ёфт нашуд</h3>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="glass-card fade-up" style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{course.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{course.title}</div>
                  {/* Breadcrumb: target → native → level */}
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {course.targetLanguage.flag} {course.targetLanguage.name} → {course.nativeLanguage.flag} {course.nativeLanguage.nativeName} • {course.level}
                  </div>
                </div>
              </div>

              {course.modules.map(module => (
                <div key={module.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{module.emoji}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {module.title} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>· {module.titleTranslated}</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: 'auto' }}>{module.lessons.length} дарс</span>
                  </div>

                  {module.lessons.length === 0 ? (
                    <div style={{ padding: '16px 40px', color: 'var(--text3)', fontSize: '13px' }}>Дарс нест</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <tbody>
                        {module.lessons.map(lesson => (
                          <tr key={lesson.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '12px 40px', width: '40px' }}>{lesson.emoji}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <Link href={`/admin/words?lessonId=${lesson.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{lesson.title}</Link>
                            </td>
                            <td style={{ padding: '12px 8px', color: 'var(--text3)' }}>💬 {lesson._count.words} калима</td>
                            <td style={{ padding: '12px 8px', color: 'var(--text3)' }}>⚡ {lesson.xpReward} XP</td>
                            <td style={{ padding: '12px 8px', color: 'var(--text3)' }}>⏱️ {lesson.duration} дақ</td>
                            <td style={{ padding: '12px 20px' }}>
                              <span className={`pill ${lesson.isActive ? 'pp' : 'pa'}`} style={{ padding: '3px 8px', fontSize: '10px' }}>{lesson.isActive ? 'Фаъол' : 'Ғайрифаъол'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани дарсҳо</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}
