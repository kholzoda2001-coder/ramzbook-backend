// ═══════════════════════════════════════════════════════════════════════════
// «Наҷоти Russian A1» — кушодани 41%-и курс + тозакунӣ.
// Манбаъ: `Russian_A1_Initial_Human_QA_Report.md` (2026-08-23).
//
//   1. Бархӯрди тарҷума (M8·Д6 — блоки марговар; M3 ва M11 — хатари SRS)
//   2. 23 `ipaTajik` бо ҳарфҳои ғайритоҷикӣ (ь ы щ ц)
//   3. XP-и 12 такрори модул 30→10 + ислоҳи вергул + як тарҷумаи нодақиқ
//
// ТАКРОРШАВАНДА: ҳар банд шарти «танҳо агар ҳанӯз хароб бошад» дорад.
//
//   node prisma/fix-ru-a1-rescue.mjs            # хушк
//   node prisma/fix-ru-a1-rescue.mjs --apply    # менависад
//
// ═══════ ЧОР ФАРҚ АЗ ДАСТУРИ АСЛӢ (ҳама аз рӯи маълумоти ВОҚЕӢ) ════════════
//
// ① `Рубашка` → «Курта (ҷомаи мардона)», НА «Курта (мардона)».
//    Сабаб: худи ҳамин курс дар **M10·Д5** аллакай «Курта (ҷомаи мардона)»
//    менависад. Ҳамон ибораро гирифтан ду фоида дорад: дар курс ЯК гзагон
//    мемонад ва хонанда ҳамон шарҳро ду бор мебинад.
//
// ② `Пациент` → «Бемор (назди духтур)», НА «Бемор (табиб)».
//    ⚠ «Табиб» дар тоҷикӣ ДУХТУР маъно дорад, на бемор. «Бемор (табиб)»
//    мегуфт: «бемор = духтур» — хатои маъноӣ дар худи ислоҳ.
//
// ③ Ҳашт «фосила пеш аз аломат» ислоҳ НАМЕШАВАНД — ҳамаашон ХАБАРИ БАРДУРӮҒ.
//    Дар онҳо `?` ва `...` АЛОМАТИ ОМӮЗИШӢ мебошанд, на китобат:
//        «Танҳо ? илова мешавад.»      → «Танҳо? илова мешавад.» БЕМАЪНӢ
//        «Тартиби оддии калима + ?.»   → `+ ?` ишораи «савол» аст
//        «Осенью ... листья падают.»   → `...` ҷои холии машқ аст
//    Гузориши аввалӣ инҳоро ҳамчун нуқс сабт карда буд — он ХАТО буд.
//
// ④ Аз ду «ҷумлаи такрорӣ» танҳо ЯКЕ нуқс аст:
//    • «Ман бо тоҷикӣ гап мезанам.» ×3 — матни РУСӢ дар ҳар се ЯК хел аст
//      («Я говорю на таджикском.»). Як мисол барои се калима — нуқс НЕСТ.
//    • «Ман соати ҳафт бедор мешавам.» ×2 — матни русӣ ФАРҚ мекунад:
//      `Я встаю` (мехезам) ва `Я просыпаюсь` (бедор мешавам). Ду феъли
//      гуногун як тарҷума гирифтаанд. ИН нуқс аст ва ислоҳ мешавад.
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
const COURSE = 'cmq95o7ic0001qsy5l76202bw'; // Russian A1 → тоҷикӣ

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('═'.repeat(78)); say(t); say('═'.repeat(78)); };
let total = 0;

// ── 1 · Бархӯрди тарҷума ───────────────────────────────────────────────────
head('1 · Бархӯрди тарҷума — кушодани M8·Д6');

// Ҳар сатр: калимаи русӣ + модул + тарҷумаи КӮҲНА → тарҷумаи НАВ.
// Модул дар шарт ҳаст, то нусхаи ҳамон калима дар модули дигар даст нахӯрад
// (M10·Д5 аллакай дуруст аст ва бояд бетағйир монад).
const COLLISIONS = [
  { word: 'Рубашка', mod: 8, from: 'Курта', to: 'Курта (ҷомаи мардона)',
    why: 'блоки марговар: Платье низ «Курта» буд → бозии мач қулф мешуд' },
  { word: 'Малыш', mod: 3, from: 'Кӯдак', to: 'Кӯдак (хурдсол)',
    why: 'хатари SRS: Ребёнок низ «Кӯдак»' },
  { word: 'Пациент', mod: 11, from: 'Бемор', to: 'Бемор (назди духтур)',
    why: 'хатари SRS: Больной низ «Бемор»' },
];

for (const c of COLLISIONS) {
  const rows = await q(
    `SELECT w.id, w.translation, m."order"+1 mn, l."order"+1 ln
     FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
     WHERE m."courseId"='${COURSE}' AND w.word=$1 AND m."order"=$2 AND w.translation=$3`,
    [c.word, c.mod - 1, c.from]);
  say(`  ${c.word} (M${c.mod}) — ${c.why}`);
  if (!rows.length) { say(`      ✔ аллакай ислоҳшуда (ё ёфт нашуд)`); continue; }
  for (const r of rows) {
    say(`      M${r.mn}·Д${r.ln}  «${r.translation}»  →  «${c.to}»`);
    if (APPLY) await q('UPDATE "Word" SET translation=$1 WHERE id=$2', [c.to, r.id]);
    total++;
  }
}

// ── 2 · ipaTajik ───────────────────────────────────────────────────────────
head('2 · `ipaTajik` — ҳарфҳое, ки дар алифбои тоҷикӣ НЕСТАНД');

// Ҳарфи русӣ → муодили тоҷикӣ. Танҳо ҳамин чор ҳарф иваз мешавад; аломати
// зада (◌́) ва ҳамаи ҳарфҳои дигар бетағйир мемонанд.
//   щ → шч   (мущина → мушчина)
//   ц → тс   (улица  → улитса)
//   ы → и    (старый → старий)
//   ь → ''   (мальчик → малчик, жыть → жит)
const MAP = [[/щ/g, 'шч'], [/Щ/g, 'Шч'], [/ц/g, 'тс'], [/Ц/g, 'Тс'],
             [/ы/g, 'и'], [/Ы/g, 'И'], [/ь/g, ''], [/Ь/g, '']];
const fixIpa = (s) => MAP.reduce((acc, [re, to]) => acc.replace(re, to), s);

const ipaRows = await q(
  `SELECT w.id, w.word, w.translation, w."ipaTajik" ipa, m."order"+1 mn, l."order"+1 ln
   FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND w."ipaTajik" ~ '[ьыщцЬЫЩЦ]'
   ORDER BY m."order", l."order", w."order"`);
say(`  ёфт шуд: ${ipaRows.length}`);
for (const r of ipaRows) {
  const after = fixIpa(r.ipa);
  say(`  M${r.mn}·Д${r.ln} ${r.word.padEnd(14)} «${r.ipa}»  →  «${after}»`);
  if (APPLY) await q('UPDATE "Word" SET "ipaTajik"=$1 WHERE id=$2', [after, r.id]);
  total++;
}

// ── 3 · XP ─────────────────────────────────────────────────────────────────
head('3a · XP — такрори модул 30 → 10');

const before = await q(
  `SELECT l."xpReward" xp, COUNT(*)::int n FROM "Lesson" l
   JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND l."skillType"='review' GROUP BY 1 ORDER BY 1`);
const stale = await q(
  `SELECT COUNT(*)::int n FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND l."skillType"='review' AND l."xpReward" <> 10`);
say(`  ҳозир: ${before.map((r) => `${r.n}×${r.xp}XP`).join(', ')} · иваз мешавад: ${stale[0].n}`);
if (APPLY && stale[0].n) {
  await q(`UPDATE "Lesson" SET "xpReward"=10
           WHERE id IN (SELECT l.id FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
                        WHERE m."courseId"='${COURSE}' AND l."skillType"='review')
             AND "xpReward" <> 10`);
}
total += stale[0].n;

// ── 3b · Вергул бе фосила ──────────────────────────────────────────────────
head('3b · Баъди вергул фосила нест (рӯйхати ҳарфҳо)');

// Танҳо ҳолати «ҳарф,ҳарф» — рақамҳо ва «1,5» даст намехӯранд.
const commaFix = (s) => s.replace(/,(?=[^\s\d])/g, ', ');
for (const spec of [
  { t: 'GrammarTopic', col: 'explanation',
    where: `"courseId"='${COURSE}'` },
  { t: 'GrammarRule', col: 'note',
    where: `"topicId" IN (SELECT id FROM "GrammarTopic" WHERE "courseId"='${COURSE}')` },
]) {
  const rows = await q(
    `SELECT id, "${spec.col}" v FROM "${spec.t}" WHERE ${spec.where} AND "${spec.col}" ~ ',[^ 0-9]'`);
  for (const r of rows) {
    const after = commaFix(r.v);
    if (after === r.v) continue;
    const i = r.v.search(/,[^ 0-9]/);
    say(`  ${spec.t}.${spec.col}`);
    say(`      …${r.v.slice(Math.max(0, i - 30), i + 40)}…`);
    say(`   →  …${after.slice(Math.max(0, i - 30), i + 48)}…`);
    if (APPLY) await q(`UPDATE "${spec.t}" SET "${spec.col}"=$1 WHERE id=$2`, [after, r.id]);
    total++;
  }
  say(`  ${spec.t}.${spec.col}: ${rows.length}`);
}

// ── 3c · Тарҷумаи нодақиқ (ниг. фарқи ④) ──────────────────────────────────
head('3c · «Я встаю» ≠ «Я просыпаюсь» — ду феъл, як тарҷума');

const DUP = {
  from: 'Ман соати ҳафт бедор мешавам.',
  ru: 'Я встаю в семь часов.',
  to: 'Ман соати ҳафт мехезам.',
};
const dupRows = await q(
  `SELECT ge.id, ge.sentence ru, ge.translation tj, gt."titleTranslated" topic
   FROM "GrammarExample" ge JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge.translation=$1 AND ge.sentence=$2`,
  [DUP.from, DUP.ru]);
for (const r of dupRows) {
  say(`  «${r.topic}»`);
  say(`      ru «${r.ru}»`);
  say(`      «${r.tj}»  →  «${DUP.to}»   (встать = хестан, проснуться = бедор шудан)`);
  if (APPLY) await q('UPDATE "GrammarExample" SET translation=$1 WHERE id=$2', [DUP.to, r.id]);
  total++;
}
say(`  ислоҳ: ${dupRows.length}`);

// ── content_version ────────────────────────────────────────────────────────
if (APPLY && total) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ (аз база хонда мешавад)');

// ① Бархӯрди МАТНИ ХОМ дар як дарс — маҳз он чизе, ки мачро мекушт.
const collide = await q(
  `SELECT m."order"+1 mn, l."order"+1 ln, lower(trim(w.translation)) k,
          COUNT(DISTINCT lower(w.word))::int nwords, COUNT(*)::int n
   FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}'
   GROUP BY 1,2,3 HAVING COUNT(*) > 1 AND COUNT(DISTINCT lower(w.word)) > 1
   ORDER BY 1,2`);
say(`  бархӯрди матни ХОМ дар як дарс: ${collide.length}   (ҳадаф 0)`);
collide.forEach((r) => say(`      ⚠ M${r.mn}·Д${r.ln} «${r.k}»`));

// ② Ҳамон санҷиш дар доираи МОДУЛ (хатари SRS)
const modCollide = await q(
  `SELECT m."order"+1 mn, lower(trim(w.translation)) k,
          COUNT(DISTINCT lower(w.word))::int nwords
   FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}'
   GROUP BY 1,2 HAVING COUNT(DISTINCT lower(w.word)) > 1 ORDER BY 1`);
say(`  бархӯрд дар доираи модул:       ${modCollide.length}   (ҳадаф 0)`);
modCollide.forEach((r) => say(`      ⚠ M${r.mn} «${r.k}» — ${r.nwords} калимаи гуногун`));

const left = async (label, text) => {
  const r = await q(text);
  say(`  ${label.padEnd(40)} ${String(r[0].n).padStart(4)}   (ҳадаф 0)`);
  return r[0].n;
};
await left('ipaTajik бо ь ы щ ц',
  `SELECT COUNT(*)::int n FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
   JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND w."ipaTajik" ~ '[ьыщцЬЫЩЦ]'`);
await left('такрори модул бо XP <> 10',
  `SELECT COUNT(*)::int n FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND l."skillType"='review' AND l."xpReward" <> 10`);
await left('вергул бе фосила (GrammarRule)',
  `SELECT COUNT(*)::int n FROM "GrammarRule"
   WHERE "topicId" IN (SELECT id FROM "GrammarTopic" WHERE "courseId"='${COURSE}')
     AND note ~ ',[^ 0-9]'`);

say('\n  ── M8·Д6 пас аз ислоҳ ──');
for (const r of await q(
  `SELECT w.word, w.translation FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
   JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' AND m."order"=7 AND l."order"=5 ORDER BY w."order"`))
  say(`      ${r.word.padEnd(12)} → «${r.translation}»`);

say();
say(APPLY ? `✔ ТАМОМ — ${total} тағйирот навишта шуд.`
          : `[хушк] ${total} тағйирот МЕШУД. Барои навиштан: --apply`);
