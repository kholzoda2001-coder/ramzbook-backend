// ═══════════════════════════════════════════════════════════════════════════
// Фазаи 1-и «наҷоти A2» — се ислоҳи МАЗМУН аз аудити English A2 (2026-08-23).
//
//   ① §2.1  хатти арабӣ дар тарҷумаи тоҷикӣ (M4·Д3, «Spice»)
//   ② §4.1 / §4.2 / §4.5  иқтисоди XP: дарсҳои ибора ва такрори модул
//   ③ §5.4  Саволи 6-и ҳар 14 имтиҳон бе ягон тавзеҳ (`explanation = null`)
//
// ТАКРОРШАВАНДА (idempotent): ҳар се банд шарти «танҳо агар ҳанӯз хароб
// бошад» доранд, пас дубора иҷро кардан ҳеҷ чизро дигар намекунад ва 0
// тағйирот мегӯяд. Пешфарз ХУШК аст — барои навиштан `--apply` лозим.
//
//   node prisma/fix-en-a2-phase1.mjs            # хушк, чизе намеояд
//   node prisma/fix-en-a2-phase1.mjs --apply    # менависад
//
// ЧАРО ДРАЙВЕРИ HTTP, НА PRISMA: аз мошини кории мо TCP-и 5432 баста аст ва
// `new PrismaClient()` бо «Can't reach database server» меафтад; `neon()` аз
// болои HTTPS/443 кор мекунад. Ҳамон намунаи `_ar-dialogue-isuser.mjs`.
//
// ДОМИ ДРАЙВЕР: `sql.query()` барои `UPDATE` массиви ХОЛӢ бармегардонад —
// `rowCount` НЕСТ. Бинобар ин ҳар банд шумораи худро ПЕШ аз навиштан аз
// рӯи `SELECT` мегирад ва БАЪД аз навиштан бо худсанҷии алоҳида тасдиқ мекунад.
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const APPLY = process.argv.includes('--apply');
const COURSE = 'cmrdzoby700018vk3td9vuag3'; // English A2 → тоҷикӣ

// Нархи нави қадамҳои БЕ санҷиш ва қадамҳои хеле кӯтоҳ. Ҳадаф на «ҷазо»,
// балки бартараф кардани ихтилофе, ки дарси 32-қадамаи луғат 15 XP медод ва
// варақ задани рӯйхати ибора 20 XP — яъне кор кардан аз кор накардан камтар
// меарзид (§4.1: 0.47 XP/қадам бар зидди 6.27).
const XP_PHRASE = 5;   // 8–9 ибора, ҳеҷ савол, ҳеҷ балл  (буд 20)
const XP_REVIEW = 10;  // 5 савол                          (буд 30)

// Тавзеҳи Саволи 6. Агар ҷуфти «калимаи тоҷикӣ → ҷавоби дуруст» хонда шавад,
// тавзеҳ АНИҚ мешавад; вагарна ба сатри умумӣ мефарояд.
const FALLBACK_EXPL = 'Ин калимаро аз дарсҳои гузаштаи ҳамин модул ба хотир биёред.';
const explFor = (tj, en) =>
  tj && en
    ? `«${tj}» ба забони англисӣ «${en}» аст. Ин калима дар дарсҳои луғати ҳамин модул омӯхта шуд — барои мустаҳкам кардан ба такрори модул баргардед.`
    : FALLBACK_EXPL;

// Ҳама блокҳои Юникоди хатти арабӣ (арабӣ, иловагӣ, шаклҳои пешниҳодӣ).
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const ARABIC_RUN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g;

// Ҳамон доира барои Postgres. Диққат: ин сатр ба SQL дохил мешавад, пас
// бояд гурезҳо ДУКАРАТА бошанд — `\\u0600` дар JS сатри `؀` мешавад.
const ARABIC_SQL = "~ '[\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]'";

/// Хатти арабиро мебарорад ва ҷудокунандаи овораро тоза мекунад.
/// «Хушбӯй / ادويه» → «Хушбӯй»  ·  «ادويه / Хушбӯй» → «Хушбӯй»
function stripArabic(s) {
  if (!s) return s;
  return s
    .replace(ARABIC_RUN, '')
    .replace(/\s*[/|،,;]\s*$/, '')          // ҷудокунандаи охири сатр
    .replace(/^\s*[/|،,;]\s*/, '')          // ҷудокунандаи оғози сатр
    .replace(/\s*[/|]\s*[/|]\s*/g, ' / ')   // ду ҷудокунанда паси ҳам
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .trim();
}

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('─'.repeat(74)); say(t); say('─'.repeat(74)); };

let totalChanged = 0;

// ── ① §2.1 · хатти арабӣ дар матни тоҷикӣ ──────────────────────────────────
// Ҷустуҷӯ на танҳо дар як сатр: ҳамон навъи ифлосӣ метавонад дар ҳар ҷадвале
// бошад, ки тарафи ТОҶИКИИ курсро нигоҳ медорад. Агар танҳо ҳамон як сатри
// «Spice» бошад, ин ҷустуҷӯ ҳам ҳамон якро мебарорад — васеъ кардани доира
// нест, кафолати «ҷои дигари ифлос нест» аст.
head('① §2.1 · хатти арабӣ дар тарафи тоҷикии English A2');

const scans = [
  { t: 'Word', cols: ['translation', 'exampleTrans', 'ipaTajik'],
    from: '"Word" x JOIN "Lesson" l ON l.id=x."lessonId" JOIN "Module" m ON m.id=l."moduleId"',
    where: `m."courseId"='${COURSE}'`,
    label: `'M'||(m."order"+1)||'·Д'||(l."order"+1)||' · '||x.word` },
  { t: 'Phrase', cols: ['translation', 'literal', 'note'],
    from: '"Phrase" x JOIN "PhraseCollection" pc ON pc.id=x."collectionId"',
    where: `pc."courseId"='${COURSE}'`, label: 'LEFT(x.text, 40)' },
  { t: 'DialogueLine', cols: ['translation'],
    from: '"DialogueLine" x JOIN "Dialogue" d ON d.id=x."dialogueId"',
    where: `d."courseId"='${COURSE}'`, label: 'LEFT(x.text, 40)' },
  { t: 'ComprehensionQuestion', cols: ['questionTranslated', 'explanation'],
    from: '"ComprehensionQuestion" x JOIN "ComprehensionExercise" ce ON ce.id=x."exerciseId"',
    where: `ce."courseId"='${COURSE}'`, label: 'LEFT(x.question, 40)' },
  { t: 'ComprehensionExercise', cols: ['titleTranslated', 'passageTranslated'],
    from: '"ComprehensionExercise" x', where: `x."courseId"='${COURSE}'`,
    label: 'LEFT(x.title, 40)' },
  { t: 'Lesson', cols: ['titleTranslated'],
    from: '"Lesson" x JOIN "Module" m ON m.id=x."moduleId"',
    where: `m."courseId"='${COURSE}'`, label: 'LEFT(x.title, 40)' },
  { t: 'Module', cols: ['titleTranslated'],
    from: '"Module" x', where: `x."courseId"='${COURSE}'`, label: 'LEFT(x.title, 40)' },
];

let arabicFixed = 0;
for (const s of scans) {
  const cond = s.cols.map((c) => `x."${c}" ${ARABIC_SQL}`).join(' OR ');
  const rows = await q(
    `SELECT x.id, ${s.label} AS label, ${s.cols.map((c) => `x."${c}"`).join(', ')}
     FROM ${s.from} WHERE ${s.where} AND (${cond})`);
  if (!rows.length) { say(`  ${s.t}: тоза`); continue; }
  for (const r of rows) {
    for (const c of s.cols) {
      const before = r[c];
      if (!before || !ARABIC_RE.test(before)) continue;
      const after = stripArabic(before);
      if (after === before) continue;
      say(`  ${s.t}.${c} · ${r.label}`);
      say(`      «${before}»  →  «${after}»`);
      if (!after) { say('      ⚠ натиҷа ХОЛӢ мешавад — гузашт, дастӣ дида шавад'); continue; }
      if (APPLY) await q(`UPDATE "${s.t}" SET "${c}"=$1 WHERE id=$2`, [after, r.id]);
      arabicFixed++;
    }
  }
}
say(`  ${APPLY ? '✔ ислоҳ шуд' : '[хушк] ислоҳ МЕШУД'}: ${arabicFixed} майдон`);
totalChanged += arabicFixed;

// ── ② §4.2 / §4.5 · иқтисоди XP ────────────────────────────────────────────
head('② §4.1–4.5 · XP-и дарсҳои ибора ва такрори модул');

// Дарсҳои ибора бо ВУҶУДИ `phraseCollectionId` муайян мешаванд, на бо
// `skillType`: дар A2 ҳам дарси ибора, ҳам дарси муколама `skillType =
// 'speaking'` доранд (14 + 14). Танҳо дарси ибора бе санҷиш аст —
// `DialogueRolePlayScreen` микрофон талаб мекунад, пас он КОР аст.
const xpJobs = [
  { name: 'дарси ибора (§4.2)', xp: XP_PHRASE, where: 'l."phraseCollectionId" IS NOT NULL' },
  { name: 'такрори модул (§4.5)', xp: XP_REVIEW, where: `l."skillType"='review'` },
];

for (const j of xpJobs) {
  const before = await q(
    `SELECT l."xpReward" xp, COUNT(*)::int n
     FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
     WHERE m."courseId"='${COURSE}' AND ${j.where} GROUP BY 1 ORDER BY 1`);
  const stale = await q(
    `SELECT COUNT(*)::int n FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
     WHERE m."courseId"='${COURSE}' AND ${j.where} AND l."xpReward" <> ${j.xp}`);
  say(`  ${j.name} → ${j.xp} XP`);
  say(`      ҳозир: ${before.map((r) => `${r.n}×${r.xp}XP`).join(', ')}`);
  say(`      ${APPLY ? 'иваз шуд' : '[хушк] иваз МЕШУД'}: ${stale[0].n} дарс`);
  if (APPLY && stale[0].n) {
    await q(`UPDATE "Lesson" SET "xpReward"=${j.xp}
             WHERE id IN (SELECT l.id FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
                          WHERE m."courseId"='${COURSE}' AND ${j.where})
               AND "xpReward" <> ${j.xp}`);
  }
  totalChanged += stale[0].n;
}

// ── ③ §5.4 · Саволи 6-и имтиҳон бе тавзеҳ ──────────────────────────────────
head('③ §5.4 · тавзеҳи Саволи 6-и ҳар имтиҳон');

const q6 = await q(
  `SELECT cq.id, cq.question, cq.options, cq."correctIndex" ci,
          m."order"+1 mod, l."order"+1 les
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=l."comprehensionId"
   WHERE m."courseId"='${COURSE}' AND l."skillType"='test' AND cq.explanation IS NULL
   ORDER BY m."order", cq."order"`);

say(`  саволҳои бе тавзеҳ: ${q6.length}`);
let filled = 0;
for (const r of q6) {
  // «What Is 'Хатм кардан' In English?» → калимаи тоҷикӣ дар нохунак
  const mTj = r.question.match(/['"«‘“]([^'"«»’”]+)['"»’”]/);
  const opts = Array.isArray(r.options) ? r.options : [];
  const en = opts[r.ci];
  const expl = explFor(mTj && mTj[1], typeof en === 'string' ? en : null);
  say(`  M${r.mod}·Д${r.les}: ${expl.slice(0, 88)}${expl.length > 88 ? '…' : ''}`);
  if (APPLY) await q('UPDATE "ComprehensionQuestion" SET explanation=$1 WHERE id=$2', [expl, r.id]);
  filled++;
}
say(`  ${APPLY ? '✔ пур шуд' : '[хушк] пур МЕШУД'}: ${filled} савол`);
totalChanged += filled;

// ── content_version ────────────────────────────────────────────────────────
if (APPLY && totalChanged) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд — мизоҷҳо мазмунро аз нав мегиранд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ (аз база хонда мешавад)');

const leftArabic = await q(
  `SELECT COUNT(*)::int n FROM "Word" x
   JOIN "Lesson" l ON l.id=x."lessonId" JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND x.translation ${ARABIC_SQL}`);
const leftQ6 = await q(
  `SELECT COUNT(*)::int n FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=l."comprehensionId"
   WHERE m."courseId"='${COURSE}' AND l."skillType"='test' AND cq.explanation IS NULL`);
const xpNow = await q(
  `SELECT CASE WHEN l."phraseCollectionId" IS NOT NULL THEN 'ибора'
               WHEN l."skillType"='review' THEN 'такрор' END k,
          l."xpReward" xp, COUNT(*)::int n
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND (l."phraseCollectionId" IS NOT NULL OR l."skillType"='review')
   GROUP BY 1,2 ORDER BY 1,2`);

say(`  тарҷумаи тоҷикӣ бо хатти арабӣ: ${leftArabic[0].n}   (ҳадаф 0)`);
say(`  Саволи имтиҳон бе тавзеҳ:       ${leftQ6[0].n}   (ҳадаф 0)`);
for (const r of xpNow) say(`  XP · ${r.k}: ${r.n} дарс × ${r.xp} XP`);

say();
say(APPLY
  ? `✔ ТАМОМ — ${totalChanged} тағйирот навишта шуд.`
  : `[хушк] ${totalChanged} тағйирот МЕШУД. Барои навиштан: --apply`);
