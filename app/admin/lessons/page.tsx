import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLessonsPage() {
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: {
          lessons: {
            include: {
              _count: { select: { words: true } }
            }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      language: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Дарсҳо ва Модулҳо</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {courses.length} курс ёфт шуд
          </p>
        </div>
        <button className="gradient-btn" style={{ padding: '10px 20px', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          + Иловаи Курс
        </button>
      </div>

      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courses.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Дар айни замон ягон курс вуҷуд надорад.
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="avatar" style={{ background: 'var(--teal)', fontSize: '24px', width: 48, height: 48 }}>
                    {course.language.flagIcon || '📚'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{course.title}</h2>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {course.language.name} • {course.units.length} Модул
                    </div>
                  </div>
                </div>
                <button className="btn bg2b">Таҳрир</button>
              </div>

              {course.units.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  Ин курс модул надорад
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {course.units.map((unit, index) => (
                    <div key={unit.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Модули {index + 1}: {unit.title}
                        </h3>
                        <span className="pill" style={{ background: 'var(--purple-dark)', color: 'var(--purple-light)', fontSize: '11px' }}>
                          {unit.lessons.length} Дарс
                        </span>
                      </div>
                      
                      {unit.lessons.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {unit.lessons.map(lesson => (
                            <div key={lesson.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--gold)' }}>★ {lesson.xpReward} XP</span>
                              <span>{lesson.title}</span>
                              <span style={{ color: 'var(--text3)', fontSize: '11px' }}>({lesson._count.words} калима)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
