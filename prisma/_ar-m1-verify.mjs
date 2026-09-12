// Санҷиши ниҳоии Модули 1-и арабӣ — он чизҳое, ки аудити мазмун намебинад:
// аудио воқеан садо медиҳад, ҷавоби дуруст воқеан дуруст аст, ва хонандаи
// кэшдор мазмуни навро мегирад.
//
//   node prisma/_ar-m1-verify.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? '\n     ' + detail : ''}`);
};

const [course] = await q(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await q(`SELECT id, "contentVersion" FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await q(`SELECT id, "order", "skillType", "dialogueId", "comprehensionId"
  FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const lids = lessons.map((l) => l.id);
const compIds = lessons.map((l) => l.comprehensionId).filter(Boolean);
const dlgIds = lessons.map((l) => l.dialogueId).filter(Boolean);

// ── V1: ҳар аудио воқеан кушода мешавад ────────────────────────────────
{
  const urls = [];
  for (const r of await q(`SELECT "audioUrl" u, word t FROM "Word" WHERE "lessonId"=ANY($1)`, [lids]))
    urls.push([r.u, `калима ${r.t}`]);
  for (const r of await q(`SELECT "audioUrl" u, "titleTranslated" t FROM "ComprehensionExercise" WHERE id=ANY($1)`, [compIds]))
    urls.push([r.u, `матн ${r.t}`]);
  if (dlgIds.length) {
    for (const r of await q(`SELECT "audioUrl" u, text t FROM "DialogueLine" WHERE "dialogueId"=ANY($1)`, [dlgIds]))
      urls.push([r.u, `муколама ${r.t}`]);
  }
  const missing = urls.filter(([u]) => !u);
  const bad = [];
  let checked = 0;
  for (const [u, label] of urls) {
    if (!u) continue;
    try {
      const res = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-64' } });
      if (!res.ok && res.status !== 206) bad.push(`${label} → HTTP ${res.status}`);
      checked++;
    } catch (e) { bad.push(`${label} → ${e.message}`); }
  }
  check('V1', missing.length === 0 && bad.length === 0,
    `ҳар аудио кушода мешавад (санҷида шуд: ${checked})`,
    [...missing.map(([, l]) => `${l}: аудио НЕСТ`), ...bad].join('\n     '));
}

// ── V2: ҷавоби дуруст дар байни вариантҳо ҳаст ва ЯГОНА аст ────────────
{
  const bad = [];
  for (const ex of await q(`SELECT id, "titleTranslated" t FROM "ComprehensionExercise" WHERE id=ANY($1)`, [compIds])) {
    const qs = await q(`SELECT question, options, "correctIndex" ci, "order" o
      FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [ex.id]);
    if (!qs.length) { bad.push(`«${ex.t}»: ягон савол нест`); continue; }
    for (const x of qs) {
      const o = x.options ?? [];
      if (o.length < 2) bad.push(`«${ex.t}» с${x.o}: ${o.length} вариант`);
      if (x.ci < 0 || x.ci >= o.length) bad.push(`«${ex.t}» с${x.o}: correctIndex=${x.ci}, вале ${o.length} вариант`);
      const dup = o.filter((v, i) => o.indexOf(v) !== i);
      if (dup.length) bad.push(`«${ex.t}» с${x.o}: варианти ТАКРОРӢ «${dup[0]}»`);
    }
  }
  check('V2', bad.length === 0, 'ҳар савол вариантҳои дуруст ва беназир дорад', bad.join('\n     '));
}

// ── V3: муколама сатри «ман» дорад (микрофон) ──────────────────────────
{
  const bad = [];
  for (const d of dlgIds) {
    const [r] = await q(`SELECT count(*) FILTER (WHERE "isUser") u, count(*) n
      FROM "DialogueLine" WHERE "dialogueId"=$1`, [d]);
    if (Number(r.u) === 0) bad.push(`муколама бе сатри «ман» (${r.n} сатр)`);
  }
  check('V3', bad.length === 0, 'муколама сатри гӯяндаи «ман» дорад', bad.join('\n     '));
}

// ── V4: калимаи такрорӣ дар як дарс нест ───────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const ws = await q(`SELECT word FROM "Word" WHERE "lessonId"=$1`, [l.id]);
    const t = ws.map((w) => w.word);
    const dup = t.filter((v, i) => t.indexOf(v) !== i);
    if (dup.length) bad.push(`Д${l.order}: «${[...new Set(dup)].join('», «')}»`);
  }
  check('V4', bad.length === 0, 'дар як дарс калимаи такрорӣ нест', bad.join('\n     '));
}

// ── V5: дарси холӣ нест ────────────────────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const [{ n }] = await q(`SELECT count(*) n FROM "Word" WHERE "lessonId"=$1`, [l.id]);
    const hasComp = !!l.comprehensionId, hasDlg = !!l.dialogueId;
    const [g] = await q(`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=$1`, [l.id]);
    if (Number(n) === 0 && !hasComp && !hasDlg && !g.g) bad.push(`Д${l.order} [${l.skillType}] холӣ`);
  }
  check('V5', bad.length === 0, 'ҳар дарс мазмун дорад', bad.join('\n     '));
}

// ── V6: версияи бахш боло рафт (хонандаи кэшдор мазмуни навро мегирад) ─
{
  const [s] = await q(`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`);
  check('V6', mod.contentVersion > 1,
    `версияи бахш боло рафт (contentVersion=${mod.contentVersion})`,
    mod.contentVersion > 1 ? `глобалӣ: ${s?.v ?? '—'}`
      : 'бе ин, хонандае ки бахшро офлайн гирифтааст ҲАМОН матни кӯҳнаро мебинад');
}

console.log(`\n${fail === 0 ? '🎉 ҲАМА ТОЗА' : `⚠️  ${fail} банд`}`);
process.exit(fail === 0 ? 0 : 1);
