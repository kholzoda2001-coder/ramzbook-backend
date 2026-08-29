// ═══════════════════════════════════════════════════════════════════════════
// Фазаи 2-и «наҷоти A2» · банди 1 — 397 тавзеҳи комилан АНГЛИСӢ.
//
// Аудит (§2.2) рақами 397-ро дод, вале онро ба як ҷадвал нисбат дод. Дар
// амал 397 = ДУ ҷадвал:
//     279  ComprehensionQuestion  (хониш · шунавоӣ · такрор · имтиҳон)
//     118  GrammarExercise        (машқҳои грамматика)
// «0/264 машқи грамматика бе тавзеҳ» дуруст буд — вале 118-тои он тавзеҳ
// доранд, ки ЯГОН ҳарфи тоҷикӣ надорад. Ҳарду ин ҷо ислоҳ мешавад.
//
// ТАРҶУМА НАМЕКУНЕМ. Матни англисӣ иқтибоси АЙНӢ аз матни дарс аст ва
// пайванди педагогӣ маҳз дар ҳамин айният аст — хонанда бояд ҳамон сатрро
// дар матн ёфта тавонад. Мо танҳо СИҒАИ тоҷикӣ пеш мегузорем.
//
// СИҒА АЗ ХУДИ БАЗА ИНТИХОБ МЕШАВАД, на аз рӯи тахмин:
//   • агар иқтибос воқеан ДАР МАТН бошад → «Матн: …»
//     (маҳз ҳамон конвенсияи A1: 93 хониш + 48 шунавоӣ = 141 ҷо. A1 барои
//      шунавоӣ ҳам «Матн:» мегӯяд, пас мо ҳам ҷудо намекунем.)
//   • агар набошад, вале намунаи грамматикӣ бошад («enjoy + -ing») → «Қоида: »
//   • вагарна → «Ҷавоби дуруст: » (конвенсияи дуюми A1, 11 ҷо)
// Барои GrammarExercise сиға аз НАВЪИ машқ меояд, боз бо луғати худи A1:
//   reorder → «Тартиби дуруст: » · transform → «Табдил: »
//   fill_blank → «Шакли дуруст: » · choose → «Қоида: »
//
// ЧАРО ИН МУҲИМ АСТ: «Матн:» дурӯғ намегӯяд. Ҳафт тавзеҳ ҳаст, ки иқтибос
// НЕСТ (аз ҷумла ду намунаи софи грамматикӣ — «enjoy + -ing.»); ба онҳо
// «Матн:» гузоштан хонандаро ба ҷустуҷӯи сатре мефиристод, ки вуҷуд надорад.
//
// ТАКРОРШАВАНДА: детектор «тавзеҳ ягон ҳарфи кириллӣ надорад» аст. Баъди
// иҷро ҳар тавзеҳ сиғаи тоҷикӣ дорад, пас дубора иҷро 0 тағйирот медиҳад.
//
//   node prisma/fix-en-a2-phase2-explanations.mjs            # хушк
//   node prisma/fix-en-a2-phase2-explanations.mjs --apply    # менависад
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

// Детектори «комилан англисӣ» = ягон ҳарфи кириллӣ нест. Ҳамин як шарт ҳам
// ҷустуҷӯ, ҳам муҳофизати такрорро таъмин мекунад.
const NOCYR_SQL = "!~ '[\\u0400-\\u04FF]'";
const HAS_CYR = /[Ѐ-ӿ]/;

const P_TEXT = 'Матн: ';
const P_ANSWER = 'Ҷавоби дуруст: ';
const P_RULE = 'Қоида: ';
const P_ORDER = 'Тартиби дуруст: ';
const P_TRANSFORM = 'Табдил: ';
const P_FORM = 'Шакли дуруст: ';

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('─'.repeat(76)); say(t); say('─'.repeat(76)); };

/// Муқоисаи «нарм»: нохунакҳои каҷ, сепопунктаи Юникод ва фосилаҳои дугона
/// набояд ба натиҷа таъсир кунанд.
const norm = (s) => (s || '')
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/…/g, '...').replace(/\s+/g, ' ').trim().toLowerCase();

/// Оё тавзеҳ иқтибоси АЙНӢ аз матн аст?
/// Сепопункта ҷои партофташударо нишон медиҳад, пас ҳар пораро ҶУДО
/// месанҷем: «the weather was beautiful ... the sky was clear» ду порааш
/// бояд дар матн бошад, вале зарур нест паси ҳам оянд.
function isQuoteOf(expl, passage) {
  const p = norm(passage);
  if (!p) return false;
  const frags = norm(expl)
    .split('...')
    .map((s) => s.replace(/^[.,!?;:\s]+|[.,!?;:\s]+$/g, '').trim())
    .filter(Boolean);
  return frags.length > 0 && frags.every((f) => p.includes(f));
}

/// Намунаи софи грамматикӣ, на ҷумлаи матн: «enjoy + -ing.», «She → has + V3.»,
/// «will not = won't.», «y → ied.», «turn on ↔ turn off.»
const RULE_SHAPE = /[→↔]|(^|\s)\+(\s|$)|(^|\s)=(\s|$)|V-ing|V3|-ing\b/;
const looksLikeRule = (s) => RULE_SHAPE.test(s);

let totalChanged = 0;

// ── ① ComprehensionQuestion ────────────────────────────────────────────────
head('① ComprehensionQuestion — тавзеҳҳои комилан англисӣ');

const cq = await q(
  `SELECT cq.id, cq.explanation e, ce.passage, ce.kind,
          COALESCE((SELECT l."skillType" FROM "Lesson" l WHERE l."comprehensionId"=ce.id LIMIT 1), '?') skill
   FROM "ComprehensionExercise" ce
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
   WHERE ce."courseId"='${COURSE}' AND cq.explanation ${NOCYR_SQL}
   ORDER BY ce."order", cq."order"`);

say(`  ёфт шуд: ${cq.length}`);
const tally = { [P_TEXT]: 0, [P_ANSWER]: 0, [P_RULE]: 0 };
const notQuote = [];

for (const r of cq) {
  const e = r.e.trim();
  if (HAS_CYR.test(e)) continue; // муҳофизати такрор
  let prefix;
  if (isQuoteOf(e, r.passage)) prefix = P_TEXT;
  else if (looksLikeRule(e)) prefix = P_RULE;
  else prefix = P_ANSWER;
  if (prefix !== P_TEXT) notQuote.push({ ...r, prefix });
  tally[prefix]++;
  if (APPLY) await q('UPDATE "ComprehensionQuestion" SET explanation=$1 WHERE id=$2', [prefix + e, r.id]);
  totalChanged++;
}

for (const [k, v] of Object.entries(tally)) say(`      «${k.trim()}» → ${v}`);
say(`\n  Ҳафт ҳолати «иқтибос НЕСТ» (аз ин рӯ «Матн:» нагирифтанд):`);
for (const r of notQuote) say(`      [${r.skill}] «${r.prefix}${r.e.slice(0, 62)}»`);
say(`\n  ${APPLY ? '✔ навишта шуд' : '[хушк] навишта МЕШУД'}: ${cq.length}`);

// ── ② GrammarExercise ──────────────────────────────────────────────────────
head('② GrammarExercise — тавзеҳҳои комилан англисӣ');

const BY_TYPE = {
  reorder: P_ORDER,
  transform: P_TRANSFORM,
  fill_blank: P_FORM,
  choose: P_RULE,
};

const ge = await q(
  `SELECT ge.id, ge.explanation e, ge.type, gt."titleTranslated" topic
   FROM "GrammarExercise" ge JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge.explanation ${NOCYR_SQL}
   ORDER BY gt."order", ge."order"`);

say(`  ёфт шуд: ${ge.length}`);
const gTally = {};
let gChanged = 0;
for (const r of ge) {
  const e = r.e.trim();
  if (HAS_CYR.test(e)) continue;
  const prefix = BY_TYPE[r.type] || P_RULE;
  gTally[prefix] = (gTally[prefix] || 0) + 1;
  if (APPLY) await q('UPDATE "GrammarExercise" SET explanation=$1 WHERE id=$2', [prefix + e, r.id]);
  gChanged++;
}
for (const [k, v] of Object.entries(gTally)) say(`      «${k.trim()}» → ${v}`);
say(`  ${APPLY ? '✔ навишта шуд' : '[хушк] навишта МЕШУД'}: ${gChanged}`);
totalChanged += gChanged;

say('\n  Намуна (аз рӯи навъ):');
for (const t of Object.keys(BY_TYPE)) {
  const s = ge.find((r) => r.type === t);
  if (s) say(`      ${t.padEnd(11)} «${BY_TYPE[t]}${s.e.slice(0, 52)}»`);
}

// ── content_version ────────────────────────────────────────────────────────
if (APPLY && totalChanged) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ (аз база хонда мешавад)');

const leftCq = await q(`SELECT COUNT(*)::int n FROM "ComprehensionExercise" ce
  JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
  WHERE ce."courseId"='${COURSE}' AND cq.explanation ${NOCYR_SQL}`);
const leftGe = await q(`SELECT COUNT(*)::int n FROM "GrammarExercise" ge
  JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
  WHERE gt."courseId"='${COURSE}' AND ge.explanation ${NOCYR_SQL}`);
const nulls = await q(`SELECT
    (SELECT COUNT(*)::int FROM "ComprehensionExercise" ce
       JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
       WHERE ce."courseId"='${COURSE}' AND cq.explanation IS NULL) a,
    (SELECT COUNT(*)::int FROM "GrammarExercise" ge JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
       WHERE gt."courseId"='${COURSE}' AND ge.explanation IS NULL) b`);

say(`  ComprehensionQuestion бе тоҷикӣ: ${leftCq[0].n}   (ҳадаф 0)`);
say(`  GrammarExercise бе тоҷикӣ:       ${leftGe[0].n}   (ҳадаф 0)`);
say(`  тавзеҳи холӣ (NULL):             ${nulls[0].a} + ${nulls[0].b}   (ҳадаф 0)`);

const dist = await q(`SELECT split_part(cq.explanation, ':', 1) pfx, COUNT(*)::int n
  FROM "ComprehensionExercise" ce JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
  WHERE ce."courseId"='${COURSE}' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`);
say('\n  Тақсимоти сиға дар ComprehensionQuestion:');
for (const r of dist) say(`      ${String(r.n).padStart(4)}  «${r.pfx}»`);

say();
say(APPLY
  ? `✔ ТАМОМ — ${totalChanged} тавзеҳ сиғаи тоҷикӣ гирифт.`
  : `[хушк] ${totalChanged} тавзеҳ иваз МЕШУД. Барои навиштан: --apply`);
