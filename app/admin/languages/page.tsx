import { prisma } from '@/lib/prisma';
import DeleteLanguageBtn from './_components/DeleteLanguageBtn';

export const dynamic = 'force-dynamic';

const TH: React.CSSProperties = { padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 };
const TD: React.CSSProperties = { padding: '14px 20px' };

export default async function AdminLanguagesPage() {
  try {
    const languages = await prisma.language.findMany({
      include: { _count: { select: { coursesAsTarget: true, coursesAsNative: true, userLanguages: true } } },
      orderBy: { order: 'asc' },
    });

    return (
      <div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Забонҳо</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Идоракунии забонҳо ({languages.length})
            </p>
          </div>
          <a href="/admin/languages/new" style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            + Забони нав
          </a>
        </div>

        <div className="glass-card fade-up">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={TH}>Парчам</th>
                  <th style={TH}>Ном</th>
                  <th style={TH}>Код</th>
                  <th style={TH}>Нақш</th>
                  <th style={TH}>Нишон</th>
                  <th style={TH}>Курсҳо</th>
                  <th style={TH}>Ҳолат</th>
                  <th style={TH}>Амалҳо</th>
                </tr>
              </thead>
              <tbody>
                {languages.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>Ягон забон нест.</td></tr>
                ) : (
                  languages.map(lang => (
                    <tr key={lang.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ ...TD, fontSize: '24px' }}>{lang.flag}</td>
                      <td style={{ ...TD, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang.name} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({lang.nativeName})</span>
                      </td>
                      <td style={TD}>
                        <span className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}>{lang.code}</span>
                      </td>
                      <td style={TD}>
                        {lang.canBeNative && <span className="pill" style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA', fontSize: '10px', marginRight: 4 }}>Модарӣ</span>}
                        {lang.canBeTarget && <span className="pill" style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', fontSize: '10px' }}>Омӯзишӣ</span>}
                      </td>
                      <td style={{ ...TD, color: 'var(--text3)', fontSize: '12px' }}>{lang.badge ?? '—'}</td>
                      <td style={{ ...TD, color: 'var(--text-secondary)' }}>{lang._count.coursesAsTarget} омӯзишӣ / {lang._count.coursesAsNative} модарӣ</td>
                      <td style={TD}>
                        <span className={`pill ${lang.isActive ? 'pp' : 'pa'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>{lang.isActive ? 'Фаъол' : 'Ғайрифаъол'}</span>
                      </td>
                      <td style={TD}>
                        <DeleteLanguageBtn id={lang.id} name={lang.name} />
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
