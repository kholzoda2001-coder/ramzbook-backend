import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Status = 'ok' | 'warn' | 'fail';
interface Check { label: string; status: Status; detail: string }

const BADGE: Record<Status, React.CSSProperties> = {
  ok: { background: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
  warn: { background: 'rgba(251,191,36,0.14)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' },
  fail: { background: 'rgba(239,68,68,0.14)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
};
const ICON: Record<Status, string> = { ok: '✅', warn: '⚠️', fail: '❌' };
const TEXT: Record<Status, string> = { ok: 'Тайёр', warn: 'Огоҳӣ', fail: 'Нокифоя' };

function Badge({ s }: { s: Status }) {
  return <span style={{ ...BADGE[s], padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{ICON[s]} {TEXT[s]}</span>;
}

function Section({ title, checks }: { title: string; checks: Check[] }) {
  return (
    <div className="sec">
      <div className="shd"><div className="st">{title}</div></div>
      <div className="sb2">
        {checks.length === 0 ? (
          <div style={{ color: 'var(--text3)', padding: '12px' }}>—</div>
        ) : checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '9px 2px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{c.detail}</div>
            </div>
            <Badge s={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminLaunchPage() {
  try {
    const [languages, courses] = await Promise.all([
      prisma.language.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.course.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          targetLanguage: { select: { id: true, flag: true, name: true } },
          nativeLanguage: { select: { id: true, flag: true, nativeName: true } },
          _count: { select: { modules: true } },
        },
      }),
    ]);

    const targets = languages.filter(l => l.canBeTarget);
    const natives = languages.filter(l => l.canBeNative);

    // ── Global checks ──
    const globalChecks: Check[] = [
      { label: 'Забони модарӣ (Native / UI)', status: natives.length ? 'ok' : 'fail', detail: `${natives.length} забони модарии фаъол` },
      { label: 'Забони омӯзишӣ (Target)', status: targets.length ? 'ok' : 'fail', detail: `${targets.length} забони омӯзишии фаъол` },
      { label: 'Курси фаъол', status: courses.length ? 'ok' : 'fail', detail: `${courses.length} курси фаъол` },
    ];

    // ── Per target-language config (drives language-agnostic TTS/STT/RTL) ──
    const langChecks: Check[] = targets.map(l => {
      const issues: string[] = [];
      if (!l.ttsLocale) issues.push('ttsLocale нест (TTS кор намекунад)');
      if (!l.sttLocale) issues.push('sttLocale нест (Гӯиш кор намекунад)');
      if (!l.flag) issues.push('flag нест');
      const badDir = l.direction !== 'ltr' && l.direction !== 'rtl';
      if (badDir) issues.push(`direction нодуруст («${l.direction}»)`);
      const status: Status = badDir ? 'fail' : issues.length ? 'warn' : 'ok';
      return {
        label: `${l.flag} ${l.name}`,
        status,
        detail: issues.length ? issues.join(' · ') : `tts:${l.ttsLocale} · stt:${l.sttLocale} · ${l.direction}`,
      };
    });

    // ── Per course (pair) content coverage ──
    const courseData = await Promise.all(courses.map(async (c) => {
      const [lessons, words, placement, descriptors] = await Promise.all([
        prisma.lesson.count({ where: { module: { courseId: c.id } } }),
        prisma.word.count({ where: { lesson: { module: { courseId: c.id } } } }),
        prisma.placementQuestion.count({ where: { targetLanguageId: c.targetLanguageId, nativeLanguageId: c.nativeLanguageId } }),
        prisma.cefrDescriptor.count({ where: { targetLanguageId: c.targetLanguageId, nativeLanguageId: c.nativeLanguageId } }),
      ]);
      return { c, modules: c._count.modules, lessons, words, placement, descriptors };
    }));

    const courseChecks: Check[] = courseData.map(({ c, modules, lessons, words, placement, descriptors }) => {
      const issues: string[] = [];
      let status: Status = 'ok';
      if (modules === 0) { issues.push('ягон модул нест'); status = 'fail'; }
      else if (lessons === 0) { issues.push('ягон дарс нест'); status = 'fail'; }
      if (status !== 'fail') {
        if (words === 0) { issues.push('ягон вожа нест'); status = 'warn'; }
        if (placement === 0) { issues.push('санҷиши сатҳ нест'); status = 'warn'; }
        if (descriptors === 0) { issues.push('CEFR-дескриптор нест'); status = 'warn'; }
      }
      return {
        label: `${c.emoji} ${c.targetLanguage.flag} ${c.targetLanguage.name} → ${c.nativeLanguage.flag} ${c.nativeLanguage.nativeName} · ${c.level}`,
        status,
        detail: issues.length ? issues.join(' · ') : `📦${modules} · 📚${lessons} · 📝${words} · 🎯${placement} · 🎓${descriptors}`,
      };
    });

    // ── Overall verdict ──
    const all = [...globalChecks, ...langChecks, ...courseChecks];
    const fails = all.filter(c => c.status === 'fail').length;
    const warns = all.filter(c => c.status === 'warn').length;
    const overall: Status = fails ? 'fail' : warns ? 'warn' : 'ok';
    const verdict = fails
      ? `Тайёр нест — ${fails} масъалаи ҳалталаб`
      : warns
        ? `Қобили нашр, вале ${warns} огоҳӣ ҳаст`
        : 'Ҳама чиз тайёр аст 🚀';

    return (
      <div className="page active">
        <div className="fade-up" style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>🚀 Омодагӣ ба нашр</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Санҷиши худкори он, ки барои ҳар забон ва ҷуфт ҳамаи унсурҳои зарурӣ мавҷуданд.
          </p>
        </div>

        {/* Verdict banner */}
        <div className="sec" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '34px' }}>{ICON[overall]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{verdict}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '3px' }}>
                {all.length - fails - warns} тайёр · {warns} огоҳӣ · {fails} нокифоя
              </div>
            </div>
            <Badge s={overall} />
          </div>
        </div>

        <Section title="🌐 Танзимоти умумӣ" checks={globalChecks} />
        <Section title="🗣️ Танзимоти забонҳои омӯзишӣ (TTS / STT / RTL)" checks={langChecks} />
        <Section title="🗂️ Фарогирии мундариҷа аз рӯи курс" checks={courseChecks} />

        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px', lineHeight: 1.6 }}>
          ℹ️ <b>Нокифоя (❌)</b> — пеш аз нашр ҳатман бартараф шавад (масъалан, курс бе дарс).{' '}
          <b>Огоҳӣ (⚠️)</b> — тавсия мешавад, вале ҳатмӣ нест (масъалан, набудани санҷиши сатҳ).{' '}
          Endpoint-и саломатӣ: <code>/api/health</code>.
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('LAUNCH READINESS ERROR:', error?.message);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Санҷиш бор нашуд</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{error?.message || 'Database error'}</p>
      </div>
    );
  }
}
