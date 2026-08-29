// ═══════════════════════════════════════════════════════════════════════════
// Фазаи 3-и «наҷоти A2» — §5.3, рақамгузории дарсҳо.
//
// Дарси «Writing Practice» бе префикси «Дарси N:» дохил карда шуда буд ва
// дарсҳои баъдтар аз нав рақамгузорӣ НАШУДАНД. Натиҷа дар ҳар 14 модул:
//
//   мавқеи 15  «Машқи навиштан»          ← умуман рақам надорад
//   мавқеи 16  «Дарси 15: Имтиҳони ниҳоӣ» ← як камтар
//
// Яъне рақамгузорӣ аввал МЕҶАҲАД, баъд худашро ИНКОР мекунад. Хонанда
// «Дарси 15»-ро мебинад, вале он дарси 16-ум аст.
//
// ҚОИДАИ ЯГОНА: префикси рақамӣ ҲАМЕША ба мавқеи ВОҚЕӢ (`order + 1`) баробар
// аст. Скрипт на «як илова мекунад», балки рақамро аз нав МЕҲИСОБАД — пас
// агар баъдтар боз дарсе дохил шавад, ҳамин скрипт худаш ҳамаро рост мекунад.
// Маҳз аз ҳамин сабаб такроршаванда (idempotent) аст.
//
// ДОИРА: ТАНҲО English A2.
//   • B1 тоза аст (0 бе префикс, 0 нодуруст) — коре нест.
//   • A1 конвенсияи ДИГАР дорад: 86 дарс умуман префикс надорад, вале ягон
//     рақами НОДУРУСТ ҳам надорад. Илова кардани префикс ба A1 тағйири
//     услуб мебуд, на ислоҳи хато — бинобар ин даст намерасонем.
//
//   node prisma/fix-en-a2-phase3-cleanup.mjs            # хушк
//   node prisma/fix-en-a2-phase3-cleanup.mjs --apply    # менависад
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

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('─'.repeat(76)); say(t); say('─'.repeat(76)); };

/// Префикси рақамиро ба `pos` мерасонад: агар бошад — иваз мекунад,
/// агар набошад — пеш мегузорад. Ҳарду ҳолат ба ЯК натиҷа меоварад, пас
/// дубора иҷро кардан чизе намеояд.
function renumber(title, pos, word) {
  const re = new RegExp(`^${word}\\s+\\d+\\s*:\\s*`, 'u');
  const body = title.replace(re, '');
  return `${word} ${pos}: ${body}`;
}

head('§5.3 · рақами дарс = мавқеи воқеӣ (English A2)');

const rows = await q(
  `SELECT l.id, m."order"+1 mn, l."order"+1 pos, l.title, l."titleTranslated" tt, l."skillType" sk
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order"`);

let changed = 0, added = 0, fixed = 0;
for (const r of rows) {
  const newTt = renumber(r.tt, r.pos, 'Дарси');
  const newEn = renumber(r.title, r.pos, 'Lesson');
  if (newTt === r.tt && newEn === r.title) continue;

  const hadPrefix = /^Дарси\s+\d+\s*:/u.test(r.tt);
  if (hadPrefix) fixed++; else added++;
  say(`  M${r.mn}·мавқеи ${r.pos} [${r.sk}]  ${hadPrefix ? 'рақами нодуруст' : 'умуман бе рақам'}`);
  say(`      «${r.tt}»`);
  say(`   →  «${newTt}»`);
  if (newEn !== r.title) say(`      en: «${r.title}»  →  «${newEn}»`);

  if (APPLY) {
    await q('UPDATE "Lesson" SET "titleTranslated"=$1, title=$2 WHERE id=$3', [newTt, newEn, r.id]);
  }
  changed++;
}

say();
say(`  дарсҳои дида баромада: ${rows.length}`);
say(`  рақами нодуруст рост шуд: ${fixed}`);
say(`  рақами нав гузошта шуд:   ${added}`);
say(`  ${APPLY ? '✔ навишта шуд' : '[хушк] навишта МЕШУД'}: ${changed}`);

if (APPLY && changed) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ (аз база хонда мешавад)');

const after = await q(
  `SELECT m."order"+1 mn, l."order"+1 pos, l.title, l."titleTranslated" tt
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order"`);

let badTj = 0, badEn = 0, noneTj = 0;
const perModule = new Map();
for (const r of after) {
  const mt = r.tt.match(/^Дарси\s+(\d+)\s*:/u);
  const me = r.title.match(/^Lesson\s+(\d+)\s*:/iu);
  if (!mt) noneTj++; else if (+mt[1] !== r.pos) badTj++;
  if (me && +me[1] !== r.pos) badEn++;
  // Ҳар дарс як хона мегирад — ҳатто агар префикс НАДОШТА бошад (`null`).
  // Вагарна дарси бе рақам аз занҷир ғоиб мешуд ва санҷиш онро НАМЕДИД:
  // рӯйхати [1..15] барои 16 дарс «дуруст» менамуд.
  if (!perModule.has(r.mn)) perModule.set(r.mn, []);
  perModule.get(r.mn).push(mt ? +mt[1] : null);
}
say(`  бе префикси «Дарси N:» : ${noneTj}   (ҳадаф 0)`);
say(`  рақами тоҷикӣ нодуруст : ${badTj}   (ҳадаф 0)`);
say(`  рақами англисӣ нодуруст: ${badEn}   (ҳадаф 0)`);

// Ҳар модул бояд занҷири ПУРРАИ 1..N дошта бошад — бе ҷаҳиш, бе такрор.
let broken = 0;
for (const [mn, nums] of [...perModule.entries()].sort((a, b) => a[0] - b[0])) {
  // Интизор: маҳз 1..N барои N дарси ҲАҚИҚИИ модул, бе ҷаҳиш, бе такрор,
  // бе ягон `null`.
  const ok = nums.every((v, i) => v === i + 1);
  if (!ok) { broken++; say(`  ⚠ M${mn} (${nums.length} дарс): ${JSON.stringify(nums)}`); }
}
say(`  модулҳои бо занҷири шикаста: ${broken}   (ҳадаф 0)`);

say('\n  Модули 1 пас аз ислоҳ:');
after.filter((r) => r.mn === 1).forEach((r) => say(`      ${r.tt}`));

say();
say(APPLY ? `✔ ТАМОМ — ${changed} унвон рост шуд.`
          : `[хушк] ${changed} унвон рост МЕШУД. Барои навиштан: --apply`);
