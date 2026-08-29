import { prisma } from '@/lib/prisma';
import DeleteLanguageBtn from './_components/DeleteLanguageBtn';
import ToggleNativeBtn from './_components/ToggleNativeBtn';

export const dynamic = 'force-dynamic';

const TH: React.CSSProperties = { padding: '16px 20px', color: 'var(--text3)', fontWeight: 600 };
const TD: React.CSSProperties = { padding: '14px 20px' };

export default async function AdminLanguagesPage() {
  try {
    // ⚠️ ҲАМАИ забонҳо гирифта мешаванд, на танҳо `canBeNative: true`.
    //
    // Худи ҳамин парчам акнун калиди ФАЪОЛ/ХОМӮШ аст. Агар мо мисли пештара
    // бо `where: { canBeNative: true }` филтр мекардем, забони хомӯшшуда аз
    // ҳамин саҳифа нопадид мешуд ва онро дигар ҳеҷ гоҳ баргардонида
    // наметавонистем — доми якраҳа.
    const languages = await prisma.language.findMany({
      include: {
        _count: { select: { coursesAsTarget: true, coursesAsNative: true, userLanguages: true } },
        // Забонҳои ОМӮЗИШИИ тобеи ҳамин забони модарӣ — маҳз ҳамонҳое, ки
        // ҳангоми хомӯш кардан пинҳон мешаванд.
        coursesAsNative: {
          where: { isActive: true },
          select: {
            targetLanguage: { select: { id: true, flag: true, name: true, nativeName: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Забонҳое, ки ба нақши МОДАРӢ дахл доранд: ё ҳоло фаъоланд, ё курс
    // доранд (яъне пештар фаъол буданд). Боқимонда — номзадҳо.
    const isNativeRole = (l: (typeof languages)[number]) =>
      l.canBeNative || l._count.coursesAsNative > 0;
    const nativeLangs = languages.filter(isNativeRole);
    const candidates = languages.filter((l) => !isNativeRole(l));
    const activeCount = languages.filter((l) => l.canBeNative).length;

    const uniqueTargets = (l: (typeof languages)[number]) => {
      const seen = new Map<string, { flag: string; name: string }>();
      for (const c of l.coursesAsNative) {
        const t = c.targetLanguage;
        if (!seen.has(t.id)) seen.set(t.id, { flag: t.flag, name: t.nativeName || t.name });
      }
      // `Array.from`, на `[...map.values()]`: tsconfig-и лоиҳа
      // `downlevelIteration` надорад ва spread-и iterator хато медиҳад.
      return Array.from(seen.values());
    };

    const renderRow = (lang: (typeof languages)[number]) => {
      const targets = uniqueTargets(lang);
      const off = !lang.canBeNative;
      return (
        <tr
          key={lang.id}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            // Сатри хомӯш хира — то дар як нигоҳ фарқ кунад.
            opacity: off ? 0.55 : 1,
          }}
        >
          <td style={{ ...TD, fontSize: '24px' }}>{lang.flag}</td>
          <td style={{ ...TD, fontWeight: 600, color: 'var(--text-primary)' }}>
            {lang.name}{' '}
            <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({lang.nativeName})</span>
          </td>
          <td style={TD}>
            <span
              className="pill"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '12px' }}
            >
              {lang.code}
            </span>
          </td>
          <td style={TD}>
            <span
              className="pill"
              style={{
                background: lang.canBeNative ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                color: lang.canBeNative ? '#22C55E' : '#FBBF24',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {lang.canBeNative ? 'ФАЪОЛ' : 'ХОМӮШ'}
            </span>
            {lang.canBeTarget && (
              <span
                className="pill"
                style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', fontSize: '10px', marginLeft: 4 }}
                title="Ин забон ҳамзамон забони омӯзишӣ аст — хомӯш кардани нақши модарӣ ба он даст намерасонад"
              >
                + Омӯзишӣ
              </span>
            )}
          </td>
          <td style={{ ...TD, color: 'var(--text-secondary)', fontSize: '13px' }}>
            {targets.length === 0 ? (
              <span style={{ color: 'var(--text3)' }}>—</span>
            ) : (
              <span title={off ? 'Ҳоло пинҳонанд, чунки забони модарӣ хомӯш аст' : undefined}>
                {targets.map((t) => `${t.flag} ${t.name}`).join(' · ')}
                {off && <span style={{ color: '#FBBF24', marginLeft: 6 }}>(пинҳон)</span>}
              </span>
            )}
          </td>
          <td style={{ ...TD, color: 'var(--text-secondary)' }}>{lang._count.coursesAsNative}</td>
          <td style={TD}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <ToggleNativeBtn
                id={lang.id}
                name={lang.nativeName || lang.name}
                canBeNative={lang.canBeNative}
                targetCount={targets.length}
              />
              <DeleteLanguageBtn id={lang.id} name={lang.name} />
            </div>
          </td>
        </tr>
      );
    };

    const head = (
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <th style={TH}>Парчам</th>
          <th style={TH}>Ном</th>
          <th style={TH}>Код</th>
          <th style={TH}>Ҳолат</th>
          <th style={TH}>Забонҳои омӯзишии тобеъ</th>
          <th style={TH}>Курсҳо</th>
          <th style={TH}>Амалҳо</th>
        </tr>
      </thead>
    );

    return (
      <div>
        <div
          className="fade-up"
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}
        >
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Забонҳои Модарӣ</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {activeCount} фаъол аз {nativeLangs.length}
            </p>
          </div>
          <a
            href="/admin/languages/new"
            style={{ background: 'linear-gradient(135deg, var(--teal), #0d9488)', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
          >
            + Забони нав
          </a>
        </div>

        <div
          className="fade-up"
          style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}
        >
          🌍 Забони модарӣ ду вазифа дорад: <b>забони интерфейси барнома</b> ва{' '}
          <b>аудиторияи курсҳо</b>. Хомӯш кардани он забонро аз онбординг ва профил
          мебарорад ва <b>ҳамаи забонҳои омӯзишии тобеи онро низ пинҳон мекунад</b>.
          Ҳеҷ чиз нест намешавад — ҳар лаҳза баргардонида мешавад.
        </div>

        <div className="glass-card fade-up">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              {head}
              <tbody>
                {nativeLangs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                      Ягон забони модарӣ нест.
                    </td>
                  </tr>
                ) : (
                  nativeLangs.map(renderRow)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {candidates.length > 0 && (
          <>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text3)', margin: '28px 0 10px' }}>
              Номзадҳо — ҳанӯз ҳамчун забони модарӣ истифода нашудаанд
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.6 }}>
              Инҳо забонҳои омӯзишианд. Фаъол кардани яке аз онҳо интерфейсро ба он
              забон дастрас мекунад — вале аввал бояд тарҷумаҳои UI дар саҳифаи
              «Тарҷумаҳои UI» пур карда шаванд, вагарна барнома ба англисӣ бармегардад.
            </p>
            <div className="glass-card fade-up">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  {head}
                  <tbody>{candidates.map(renderRow)}</tbody>
                </table>
              </div>
            </div>
          </>
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
