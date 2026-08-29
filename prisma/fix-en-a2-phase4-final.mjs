// ═══════════════════════════════════════════════════════════════════════════
// Фазаи 4-и «наҷоти A2» — ду банди охирини мазмун (аудити ниҳоӣ, §4.2 ва §4.3).
//
//   A. 6 машқи грамматика, ки `promptTranslated`-и КОМИЛАН англисӣ доранд.
//   B. Матни M8·L11 — омехтаи «ту» ва «шумо» дар ЯК матн.
//
// ТАКРОРШАВАНДА: ҳар ду банд шарти «танҳо агар ҳанӯз хароб бошад» доранд.
//
//   node prisma/fix-en-a2-phase4-final.mjs            # хушк
//   node prisma/fix-en-a2-phase4-final.mjs --apply    # менависад
//
// Драйвери HTTP — ниг. тавзеҳи `fix-en-a2-phase1.mjs` (порти 5432 баста аст).
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
const COURSE = 'cmrdzoby700018vk3td9vuag3';
const NOCYR_SQL = "!~ '[\\u0400-\\u04FF]'";

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('─'.repeat(76)); say(t); say('─'.repeat(76)); };

let total = 0;

// ── A. §4.2 · `promptTranslated`-и комилан англисӣ ─────────────────────────
//
// Ҳар шаш машқ навъи `transform` доранд ва `promptTranslated`-и онҳо на
// ТАРҶУМА, балки ИШОРАИ намунавӣ аст («She → has.»). Ҳамин ки майдон холӣ
// нест, фазаи 2 онро надид — фазаи 2 танҳо `explanation`-ро тоза кард.
//
// ЧАРО «Қоида: », на «Табдил: »: `explanation`-и ҳамин машқҳо аллакай
// «Табдил: …» аст (фазаи 2 онро аз рӯи навъи машқ гузошт). Агар ин ҷо низ
// «Табдил» гузорем, хонанда ду майдони АЙНАН якхеларо мебинад. «Қоида» =
// қонуни забон, «Табдил» = амале, ки бояд иҷро шавад — ду чизи гуногун.
head('A · §4.2 — 6 машқи грамматика бо дастури комилан англисӣ');

const P_RULE = 'Қоида: ';

const six = await q(
  `SELECT ge.id, ge.type, ge.prompt, ge."promptTranslated" pt, ge.explanation,
          ge."order" o, m."order"+1 mn, l."order"+1 ln
   FROM "GrammarExercise" ge
   JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   JOIN "Lesson" l ON l."grammarTopicId"=gt.id
   JOIN "Module" m ON m.id=l."moduleId"
   WHERE gt."courseId"='${COURSE}' AND ge."promptTranslated" ${NOCYR_SQL}
   ORDER BY m."order", ge."order"`);

say(`  ёфт шуд: ${six.length}`);
let aCount = 0;
for (const r of six) {
  const before = r.pt.trim();
  const after = P_RULE + before;
  say(`  M${r.mn}·Д${r.ln} машқ #${r.o + 1} [${r.type}]`);
  say(`      prompt : «${r.prompt}»`);
  say(`      «${before}»  →  «${after}»`);
  say(`      (тавзеҳ ҳамин тавр мемонад: «${r.explanation}»)`);
  if (APPLY) await q('UPDATE "GrammarExercise" SET "promptTranslated"=$1 WHERE id=$2', [after, r.id]);
  aCount++;
}
say(`  ${APPLY ? '✔ навишта шуд' : '[хушк] навишта МЕШУД'}: ${aCount}`);
total += aCount;

// ── B. §4.3 · M8·L11 — «ту» ва «шумо» дар ЯК матн ─────────────────────────
//
// ⚠ ИН АЗ «ЯК ИБОРА» КАЛОНТАР АСТ. Матн аз аввал то охир бо шакли ТУ навишта
// шудааст ва танҳо ҶУМЛАИ ОХИР бо ШУМО аст. Иваз кардани танҳо «Аввал, ту
// бояд…» матнро БИСЁРТАР омехта мекард, на камтар. Барои ҳамин ҳамаи ҳашт
// шакли феълӣ ба ШУМО гузаронида мешавад — ҳамон ҷумлаи охир меъёр аст.
//
// Матни англисӣ «you» дорад, ки бетараф аст, пас ШУМО тарҷумаи содиқ аст ва
// бо оҳанги тамоми барнома (плеери дарс 24/24 ШУМО) мувофиқ меояд.
head('B · §4.3 — M8·Д11 «Зиндагии солим»: ту → шумо');

// Ҷуфтҳои ДАҚИҚ, на regex-и умумӣ: ҳар кадомаш дида баромада шудааст.
// Тартиб муҳим аст — сатрҳои дарозтар аввал, то қисман иваз нашаванд.
const TU_TO_SHUMO = [
  ['Аввал, ту бояд парҳези хуб бо меваю сабзавоти тару тоза дошта бошӣ.',
   'Аввал, шумо бояд парҳези хуб бо меваю сабзавоти тару тоза дошта бошед.'],
  ['Набояд хӯроки тез ё шакари зиёд хӯрӣ.',
   'Набояд хӯроки тез ё шакари зиёд хӯред.'],
  ['Дуюм, ту бояд мунтазам машқ кунӣ, то мушакҳоят қавӣ монанд.',
   'Дуюм, шумо бояд мунтазам машқ кунед, то мушакҳоятон қавӣ монанд.'],
  ['ту бояд шабе тақрибан ҳашт соат хоб равӣ.',
   'шумо бояд шабе тақрибан ҳашт соат хоб равед.'],
  ['Набояд фаромӯш кунӣ, ки ором шавӣ,',
   'Набояд фаромӯш кунед, ки ором шавед,'],
  ['Ба ту лозим нест, ки марафон давӣ',
   'Ба шумо лозим нест, ки марафон давед'],
  ['Агар ин маслиҳатро риоя кунӣ, худро қавитар ва хушбахттар ҳис мекунӣ.',
   'Агар ин маслиҳатро риоя кунед, худро қавитар ва хушбахттар ҳис мекунед.'],
];

const [passage] = await q(
  `SELECT ce.id, ce."titleTranslated" tt, ce."passageTranslated" ptr
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   JOIN "ComprehensionExercise" ce ON ce.id=l."comprehensionId"
   WHERE m."courseId"='${COURSE}' AND m."order"=7 AND l."order"=10`);

if (!passage) {
  say('  ⚠ матн ёфт нашуд — M8·Д11 ҷои худро иваз кардааст?');
} else {
  let text = passage.ptr;
  let hits = 0;
  for (const [from, to] of TU_TO_SHUMO) {
    if (!text.includes(from)) continue;
    text = text.replace(from, to);
    hits++;
  }
  say(`  «${passage.tt}»`);
  say(`  ҷуфтҳои иваз мешуда: ${hits} аз ${TU_TO_SHUMO.length}`);
  if (hits === 0) {
    say('  ✔ аллакай тоза (такрори иҷро чизе намекунад)');
  } else {
    say('\n  --- ПЕШ ---');
    say('  ' + passage.ptr);
    say('\n  --- БАЪД ---');
    say('  ' + text);
    if (APPLY) {
      await q('UPDATE "ComprehensionExercise" SET "passageTranslated"=$1 WHERE id=$2',
        [text, passage.id]);
    }
    total += 1;
  }
  // Худсанҷӣ: пас аз иваз ягон шакли ТУ намонад.
  const left = [...text.matchAll(/(^|\s)(ту|туро)(\s|[.,!?])/gu)].map(m => m[2]);
  const verbs = [...text.matchAll(/\b\w*(кунӣ|бошӣ|хӯрӣ|равӣ|шавӣ|давӣ|мекунӣ)\b/gu)].map(m => m[0]);
  say(`\n  боқимондаи «ту»: ${left.length}   феъли шакли ту: ${verbs.length}   (ҳадаф 0 / 0)`);
  if (verbs.length) say(`      ${verbs.join(', ')}`);
}

// ── content_version ────────────────────────────────────────────────────────
if (APPLY && total) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ва ЁДДОШТ ────────────────────────────────────────────────────
head('Худсанҷӣ');

const leftPt = await q(`SELECT COUNT(*)::int n FROM "GrammarExercise" ge
  JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
  WHERE gt."courseId"='${COURSE}' AND ge."promptTranslated" ${NOCYR_SQL}`);
say(`  promptTranslated-и комилан англисӣ: ${leftPt[0].n}   (ҳадаф 0)`);

// ⚠ ҶУСТУҶӮИ ҶОНИШИН КИФОЯ НЕСТ. Ин матн «шумо»-и алоҳида НАДОШТ — ҷумлаи
// охираш танҳо бо ФЕЪЛИ шакли шумо буд («сар кунед… нигоҳ доред»). Пас
// шарти `~ 'шумо'` онро «омехта» намешумурд ва 0 бармегардонд, гӯё ҳама
// чиз хуб бошад. Маҳз барои ҳамин `d-tajik` онро ёфт, вале ин пурсиш не.
// Санҷиш бояд ба ШАКЛИ ФЕЪЛ такя кунад — ҳамон рӯйхати детектор.
const TU_V = "(кунӣ|бошӣ|хӯрӣ|равӣ|шавӣ|давӣ|мекунӣ|дорӣ|ҳастӣ|нависӣ|бинӣ|гӯӣ)";
const SH_V = "(кунед|бошед|хӯред|равед|шавед|давед|мекунед|доред|ҳастед|нависед|бинед|гӯед)";
const mixed = await q(
  `SELECT m."order"+1 mn, l."order"+1 ln, ce."titleTranslated" tt
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   JOIN "ComprehensionExercise" ce ON ce.id=l."comprehensionId"
   WHERE m."courseId"='${COURSE}'
     AND (ce."passageTranslated" ~ '(^|[[:space:]])(ту|туро)([[:space:]]|[.,!?])'
          OR ce."passageTranslated" ~ '${TU_V}([[:space:]]|[.,!?]|$)')
     AND (ce."passageTranslated" ~ '(^|[[:space:]])(шумо|шуморо)([[:space:]]|[.,!?])'
          OR ce."passageTranslated" ~ '${SH_V}([[:space:]]|[.,!?]|$)')
   ORDER BY m."order"`);
say(`  матни бо ҳар ДУ шакл (ОМЕХТА, аз рӯи феъл): ${mixed.length}   (ҳадаф 0)`);
mixed.forEach(r => say(`      M${r.mn}·Д${r.ln} «${r.tt}»`));

// Матнҳои ЯКСОН бо шакли ту — на «омехта», вале бо оҳанги барнома мухолиф.
const tuOnly = await q(
  `SELECT m."order"+1 mn, l."order"+1 ln, ce."titleTranslated" tt
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   JOIN "ComprehensionExercise" ce ON ce.id=l."comprehensionId"
   WHERE m."courseId"='${COURSE}'
     AND ce."passageTranslated" ~ '(^|[[:space:]])(ту|туро)([[:space:]]|[.,!?])'
   ORDER BY m."order", l."order"`);
if (tuOnly.length) {
  say(`\n  ЁДДОШТ: боз ${tuOnly.length} матн шакли «ту»-ро ЯКСОН истифода мебарад.`);
  say('  Инҳо ОМЕХТА нестанд, пас доираи ин скрипт нест — вале бо оҳанги');
  say('  ШУМО-и тамоми барнома мухолифанд. Қарори худи соҳиби маҳсулот:');
  tuOnly.forEach(r => say(`      M${r.mn}·Д${r.ln} «${r.tt}»`));
}

say();
say(APPLY ? `✔ ТАМОМ — ${total} тағйирот навишта шуд.`
          : `[хушк] ${total} тағйирот МЕШУД. Барои навиштан: --apply`);
