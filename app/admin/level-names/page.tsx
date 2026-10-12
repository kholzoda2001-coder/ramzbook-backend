import { prisma } from '@/lib/prisma';
import { cleanLevelLabels } from '@/lib/levelLabels';
import LevelNamesRow from './LevelNamesRow';

export const dynamic = 'force-dynamic';

/**
 * «Номҳои сатҳ» — барои ҳар забони омӯзишӣ номи худи он: кореягӣ «TOPIK I»,
 * ҷопонӣ «N5»… (11.10.2026). Код (A1…C1) дар мантиқ мемонад; барнома танҳо
 * матни намоиширо иваз мекунад. Майдони холӣ = худи код.
 */
export default async function LevelNamesPage() {
  try {
    const languages = await prisma.language.findMany({
      where: { canBeTarget: true },
      orderBy: { order: 'asc' },
      select: {
        id: true, code: true, name: true, nativeName: true, flag: true, isActive: true, levelLabels: true,
        coursesAsTarget: { where: { isActive: true }, select: { level: true } },
      },
    });

    return (
      <div>
        <div className="fade-up" style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Номҳои сатҳ</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', lineHeight: 1.6 }}>
            Ҳар забон сатҳҳоро бо номи худаш нишон медиҳад: кореягӣ — <b>TOPIK I</b>, ҷопонӣ — <b>N5</b>.
            Майдони холӣ = худи код (A1). Дар барнома баъди аз нав кушодан пайдо мешавад.
          </p>
        </div>

        <div className="glass-card fade-up">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text3)', fontWeight: 600 }}>Забон</th>
                  {['A1', 'A2', 'B1', 'B2', 'C1'].map((c) => (
                    <th key={c} style={{ padding: '14px 10px', color: 'var(--text3)', fontWeight: 600 }}>{c}</th>
                  ))}
                  <th style={{ padding: '14px 16px' }} />
                </tr>
              </thead>
              <tbody>
                {languages.map((l) => (
                  <LevelNamesRow
                    key={l.id}
                    id={l.id}
                    title={`${l.flag} ${l.nativeName || l.name}`}
                    code={l.code}
                    inactive={!l.isActive}
                    courseLevels={Array.from(new Set(l.coursesAsTarget.map((c) => c.level.toUpperCase())))}
                    initial={cleanLevelLabels(l.levelLabels)}
                  />
                ))}
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
