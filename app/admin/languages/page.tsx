import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLanguagesPage() {
  try {
    const languages = await prisma.language.findMany({
      include: {
        _count: { select: { courses: true, userLanguages: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Забонҳо</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Идоракунии забонҳои дар барнома мавҷудбуда ({languages.length} забон)
            </p>
          </div>
          <a href="/admin/languages/new" style={{ 
            background: 'linear-gradient(135deg, var(--teal), #0d9488)', 
            color: '#fff', 
            padding: '10px 20px', 
            borderRadius: '10px', 
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)'
          }}>
            <span style={{ fontSize: '18px' }}>+</span> Забони Нав
          </a>
        </div>

        <div className="glass-card fade-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Парчам</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Ном</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Код</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Курсҳо</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Корбарон</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 }}>Ҳолат</th>
                </tr>
              </thead>
              <tbody>
                {languages.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                      Ягон забон ёфт нашуд. Лутфан аввал маълумот ворид кунед.
                    </td>
                  </tr>
                ) : (
                  languages.map(lang => (
                    <tr key={lang.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '24px' }}>{lang.flag}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang.name} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({lang.nativeName})</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {lang.code}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{lang._count.courses}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{lang._count.userLanguages}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`pill ${lang.isActive ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                          {lang.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                        </span>
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
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Хатогӣ дар бор кардани забонҳо</h2>
        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{error?.message}</p>
      </div>
    );
  }
}
