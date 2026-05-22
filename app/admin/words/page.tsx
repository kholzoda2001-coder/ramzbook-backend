import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminWordsPage() {
  try {
    const words = await prisma.word.findMany({
      include: {
        lessons: {
          select: { lesson: { select: { title: true } } }
        }
      },
      take: 200
    });

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Калимаҳо</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Луғати барнома — нишон дода мешавад: {words.length}
            </p>
          </div>
        </div>

        <div className="glass-card fade-up">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Забон</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Калима</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Тарҷума</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Дарс</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Мушкилӣ</th>
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
                      <td style={{ padding: '12px 20px' }}>
                        <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '11px' }}>
                          {word.langFrom} → {word.langTo}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                        {word.emoji && <span style={{ marginRight: '8px' }}>{word.emoji}</span>}
                        {word.word}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>
                        {word.translation}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: '12px' }}>
                        {word.lessons.map(lw => lw.lesson.title).join(', ') || '—'}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} style={{ color: star <= word.difficulty ? 'var(--gold)' : 'rgba(255,255,255,0.1)', fontSize: '12px' }}>★</span>
                          ))}
                        </div>
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
  } catch (error: any) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани калимаҳо</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}
