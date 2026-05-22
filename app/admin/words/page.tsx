import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminWordsPage() {
  const words = await prisma.word.findMany({
    include: {
      lessons: {
        select: { lesson: { select: { title: true } } }
      }
    },
    take: 100 // Limit to latest 100 words for performance in MVP
  });
  
  const totalWords = await prisma.word.count();

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Калимаҳо (Луғат)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Ҷамъи калимаҳо: {totalWords.toLocaleString()} (100 охирин нишон дода шудааст)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn bg2b">Воридот (CSV)</button>
          <button className="gradient-btn" style={{ padding: '10px 20px', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            + Калимаи Нав
          </button>
        </div>
      </div>

      <div className="glass-card fade-up" style={{ animationDelay: '0.1s' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Забон</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Калима</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Тарҷума</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Қисми нутқ</th>
                <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Дарсҳо</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                    Ягон калима ёфт нашуд
                  </td>
                </tr>
              ) : (
                words.map(word => (
                  <tr key={word.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                        {word.langTo.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {word.word}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {word.translation}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="pill" style={{ background: 'var(--blue-dark)', color: 'var(--blue-light)', fontSize: '11px' }}>
                        {word.partOfSpeech || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {word.lessons.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {word.lessons.slice(0, 2).map((l, i) => (
                            <span key={i} className="pill" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)' }}>
                              {l.lesson.title}
                            </span>
                          ))}
                          {word.lessons.length > 2 && (
                            <span className="pill" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)' }}>
                              +{word.lessons.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
