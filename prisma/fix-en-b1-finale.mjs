// ═══════════════════════════════════════════════════════════════════════════
// «Финали B1» — сайқали ниҳоии МАЗМУНИ English B1.
// Манбаъ: `English_B1_Initial_Human_QA_Report.md` (2026-08-23).
//
//   1. Иқтисоди XP      — 12 дарси ибора 20→5, 12 такрори модул 30→10
//   2. Title Case       — унвонҳои модул + 1 мавзӯи грамматика
//   3. 199 тавзеҳи механикӣ + 1 promptTranslated + 2 фосилаи дукарата
//   4. 96 теги муаллифӣ → ҷумлаи ПЕДАГОГИИ тоҷикӣ
//   5. 8 сенарияи муколама → тоҷикӣ
//
// ТАКРОРШАВАНДА. Ҳар банд шарти «танҳо агар ҳанӯз хароб бошад» дорад:
// XP аз рӯи `<> қимат`, матнҳо аз рӯи «ягон ҳарфи кириллӣ надорад», унвонҳо
// аз рӯи регекси ҳарфи КАЛОН. Иҷрои дуюм 0 тағйирот медиҳад.
//
//   node prisma/fix-en-b1-finale.mjs            # хушк
//   node prisma/fix-en-b1-finale.mjs --apply    # менависад
//
// ═══════ СЕ ФАРҚ АЗ ДАСТУРИ АСЛӢ (ҳар се аз рӯи маълумоти ВОҚЕӢ) ═══════════
//
// ① `skillType = 'phrase'` ВУҶУД НАДОРАД. Дар B1 ҳам дарси ибора, ҳам
//    муколама, ҳам «Сухани озод» `skillType='speaking'` доранд (12+12+12=36).
//    Ягона нишони боэътимод — `phraseCollectionId IS NOT NULL`, худи ҳамон
//    предикате, ки дар A2 (фазаи 1) истифода шуд.
// ② Се тег танҳо «purpose.» мегӯянд ва ба ҳеҷ яке аз СЕ нақшаи додашуда
//    намеафтанд. Барои онҳо нақшаи ЧОРУМ илова шуд — вагарна се тавзеҳ
//    англисӣ мемонд ва «96» ба 93 мефаромад.
// ③ B1 навъи машқи `error_correction` дорад (14 дона), ки дар A2 набуд, пас
//    луғати сиғаи A2 барои он ҷавоб надорад. «Ислоҳ: » илова шуд — ҳамон
//    феъле, ки худи саволҳо истифода мебаранд («…ёбед ва ислоҳ кунед»).
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
const COURSE = 'cmrjtyqkb0001nzwfu2pobutk'; // English B1 → тоҷикӣ
const NOCYR_SQL = "!~ '[\\u0400-\\u04FF]'";
const HAS_CYR = /[Ѐ-ӿ]/;

const say = (s = '') => console.log(s);
const head = (t) => { say(); say('═'.repeat(76)); say(t); say('═'.repeat(76)); };

let total = 0;

// ── 1 · Иқтисоди XP ────────────────────────────────────────────────────────
head('1 · XP — дарси ибора ва такрори модул');

const XP_JOBS = [
  { name: 'дарси ибора', xp: 5, where: 'l."phraseCollectionId" IS NOT NULL' },
  { name: 'такрори модул', xp: 10, where: `l."skillType"='review'` },
];

for (const j of XP_JOBS) {
  const before = await q(
    `SELECT l."xpReward" xp, COUNT(*)::int n FROM "Lesson" l
     JOIN "Module" m ON m.id=l."moduleId"
     WHERE m."courseId"='${COURSE}' AND ${j.where} GROUP BY 1 ORDER BY 1`);
  const stale = await q(
    `SELECT COUNT(*)::int n FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
     WHERE m."courseId"='${COURSE}' AND ${j.where} AND l."xpReward" <> ${j.xp}`);
  say(`  ${j.name} → ${j.xp} XP · ҳозир: ${before.map(r => `${r.n}×${r.xp}`).join(', ')} · иваз: ${stale[0].n}`);
  if (APPLY && stale[0].n) {
    await q(`UPDATE "Lesson" SET "xpReward"=${j.xp}
             WHERE id IN (SELECT l.id FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
                          WHERE m."courseId"='${COURSE}' AND ${j.where})
               AND "xpReward" <> ${j.xp}`);
  }
  total += stale[0].n;
}

// ── 2 · Title Case ─────────────────────────────────────────────────────────
head('2 · Title Case дар унвонҳо');

// Калимаҳое, ки ҳатто баъд аз пайвандак ХУРД НАМЕШАВАНД.
//   ВАО      — ИХТИСОРА (Воситаҳои ахбори омма). «вао» бемаънист.
//   Зист     — бо дархости соҳиби маҳсулот нигоҳ дошта мешавад (M4).
//              ⚠ Он баъд аз ИЗОФА меистад, на баъд аз пайвандак, пас қоидаи
//              зерин ба он ҳеҷ гоҳ намерасад — ин сипар дуҷониба аст.
//   боқӣ     — номи ҷой/шахс, барои эҳтиёт.
const PROTECTED = new Set([
  'ВАО', 'Зист',
  'Тоҷикистон', 'Душанбе', 'Хуҷанд', 'Русия', 'Англия', 'Амрико',
  'Лондон', 'Москва', 'Париж', 'Дубай', 'Ҳиндустон', 'Туркия',
  'Аврупо', 'Осиё', 'Африқо',
]);
const CONJ = ['ва', 'ё'];
const CONJ_RE = new RegExp(
  `(^|[\\s(«"'])(${CONJ.join('|')})(\\s+)([(«"']*)([А-ЯЁҒҲҚҶӢӮЪЎ])`, 'gu');

/// Ҳарфи калонро баъд аз пайвандак хурд мекунад; [PROTECTED] дахлнопазир.
function fixTitle(title) {
  const changed = [], skipped = [];
  const after = title.replace(CONJ_RE, (m, pre, c, sp, open, letter, offset, whole) => {
    const rest = whole.slice(offset + m.length);
    const word = letter + (rest.match(/^[^\s]*/u) || [''])[0].replace(/[)»"'“”.,?!:;]+$/u, '');
    if (PROTECTED.has(word)) { skipped.push(word); return m; }
    changed.push(word);
    return pre + c + sp + open + letter.toLowerCase();
  });
  return { after, changed, skipped };
}

for (const spec of [
  { t: 'Module', label: 'Модул',
    sel: `SELECT id, "titleTranslated" tt, 'M'||("order"+1) tag FROM "Module"
          WHERE "courseId"='${COURSE}' ORDER BY "order"` },
  { t: 'GrammarTopic', label: 'Мавзӯи грамматика',
    sel: `SELECT id, "titleTranslated" tt, 'GT'||"order" tag FROM "GrammarTopic"
          WHERE "courseId"='${COURSE}' ORDER BY "order"` },
]) {
  let n = 0;
  for (const r of await q(spec.sel)) {
    const { after, changed, skipped } = fixTitle(r.tt || '');
    if (skipped.length) say(`  ⊘ ${r.tag} НИГОҲ ДОШТА ШУД: ${JSON.stringify(skipped)} — «${r.tt}»`);
    if (after === r.tt) continue;
    say(`  ${r.tag}  «${r.tt}»`);
    say(`       →  «${after}»`);
    if (APPLY) await q(`UPDATE "${spec.t}" SET "titleTranslated"=$1 WHERE id=$2`, [after, r.id]);
    n++;
  }
  say(`  ${spec.label}: ${n} ислоҳ`);
  total += n;
}

// ── 3 · Тавзеҳҳо ───────────────────────────────────────────────────────────
head('3+4 · Тавзеҳҳои англисӣ — 199 механикӣ + 96 тег');

const P_TEXT = 'Матн: ';
const P_ANSWER = 'Ҷавоби дуруст: ';
const BY_TYPE = {
  reorder: 'Тартиби дуруст: ',
  transform: 'Табдил: ',
  fill_blank: 'Шакли дуруст: ',
  choose: 'Қоида: ',
  error_correction: 'Ислоҳ: ', // ниг. фарқи ③ дар сарлавҳа
};

// ── Нақшаи ТЕГҲО (банди 4) ──
// Тартиби санҷиш МУҲИМ аст: «vocab-in-context» аввал, чунки тегҳои омехта
// («inference/purpose», «attitude/inference») бояд ба ҷумлаи ХУЛОСАВӢ афтанд.
const TAG_MAP = [
  { re: /vocab-in-context/i,
    tj: 'Маънои ин калима аз ҷумлаҳои атроф маълум мешавад.' },
  { re: /gist/i,
    tj: 'Ҷавоби дуруст хулосаи умумии ин матн мебошад.' },
  { re: /inference|attitude/i,
    tj: 'Ин ҷавобро аз мазмуни матн ва мантиқ фаҳмидан мумкин аст.' },
  // ⚠ Нақшаи ЧОРУМ — дар дастури аслӣ набуд. Се тег танҳо «purpose.» доранд
  // ва ба ҳеҷ яке аз се нақшаи боло намеафтанд.
  { re: /purpose/i,
    tj: 'Ҷавоби дуруст мақсади муаллифи матнро нишон медиҳад.' },
];
const TAG_HEAD = /^(gist|inference|vocab-in-context|detail|attitude|purpose|main idea|reference|tone|opinion|scanning|skimming)\b/i;

const norm = (s) => (s || '')
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/…/g, '...').replace(/\s+/g, ' ').trim().toLowerCase();

function isQuoteOf(expl, passage) {
  const p = norm(passage);
  if (!p) return false;
  const frags = norm(expl).split('...')
    .map((s) => s.replace(/^[«»"'.,!?;: ]+|[«»"'.,!?;: ]+$/g, '').trim()).filter(Boolean);
  return frags.length > 0 && frags.every((f) => p.includes(f));
}

const cq = await q(
  `SELECT cq.id, cq.explanation e, ce.passage,
          m."order"+1 mn, l."order"+1 ln, cq."order" o
   FROM "ComprehensionExercise" ce
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
   LEFT JOIN "Lesson" l ON l."comprehensionId"=ce.id
   LEFT JOIN "Module" m ON m.id=l."moduleId"
   WHERE ce."courseId"='${COURSE}' AND cq.explanation ${NOCYR_SQL}
   ORDER BY m."order", l."order", cq."order"`);

const tally = { tag: 0, quote: 0, para: 0 };
const perTag = {};
const unmapped = [];

for (const r of cq) {
  const e = r.e.trim();
  if (HAS_CYR.test(e)) continue;
  let out;
  if (TAG_HEAD.test(e)) {
    const hit = TAG_MAP.find((m) => m.re.test(e));
    if (!hit) { unmapped.push(`M${r.mn}·L${r.ln} q#${r.o + 1} ${JSON.stringify(e)}`); continue; }
    out = hit.tj;
    // Шаш тег иқтибоси ВОҚЕИИ матнро дар нохунак доранд. Он лангари
    // педагогист — ҷумлаи тоҷикӣ УСУЛРО мегӯяд, иқтибос ДАЛЕЛРО нишон
    // медиҳад. Теги англисӣ пурра меравад, иқтибос мемонад.
    const quoted = e.match(/[“"«]([^”"»]+)[”"»]/);
    if (quoted && quoted[1].trim()) out += ` Матн: «${quoted[1].trim()}».`;
    tally.tag++;
    perTag[hit.tj] = (perTag[hit.tj] || 0) + 1;
  } else if (isQuoteOf(e, r.passage)) {
    out = P_TEXT + e; tally.quote++;
  } else {
    out = P_ANSWER + e; tally.para++;
  }
  if (APPLY) await q('UPDATE "ComprehensionQuestion" SET explanation=$1 WHERE id=$2', [out, r.id]);
  total++;
}

say(`  ComprehensionQuestion: ${cq.length}`);
say(`      «Матн: »            → ${tally.quote}`);
say(`      «Ҷавоби дуруст: »   → ${tally.para}`);
say(`      теги муаллифӣ       → ${tally.tag}`);
for (const [k, v] of Object.entries(perTag)) say(`          ${String(v).padStart(3)}  ${k}`);
if (unmapped.length) {
  say(`  ⚠ ${unmapped.length} ТЕГ ба ҳеҷ нақша НАЙОФТ — даст нахӯрд:`);
  unmapped.forEach((u) => say(`      ${u}`));
}

const ge = await q(
  `SELECT ge.id, ge.explanation e, ge.type FROM "GrammarExercise" ge
   JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge.explanation ${NOCYR_SQL}
   ORDER BY gt."order", ge."order"`);
const gTally = {};
for (const r of ge) {
  const e = r.e.trim();
  if (HAS_CYR.test(e)) continue;
  const pfx = BY_TYPE[r.type] || 'Қоида: ';
  gTally[pfx] = (gTally[pfx] || 0) + 1;
  if (APPLY) await q('UPDATE "GrammarExercise" SET explanation=$1 WHERE id=$2', [pfx + e, r.id]);
  total++;
}
say(`  GrammarExercise: ${ge.length}`);
for (const [k, v] of Object.entries(gTally)) say(`      «${k.trim()}» → ${v}`);

// ── 4b · Тегҳои НИМА-тоҷикӣ ────────────────────────────────────────────────
//
// ⚠ ИН ДАР ДАСТУР НАБУД ва аудит ҳам онро гум карда буд. Ҳарду аз ЯК
// детектор кор мегирифтанд — «тавзеҳ ягон ҳарфи кириллӣ надорад». Вале шаш
// тавзеҳ бо ТЕГИ англисӣ сар мешаванд ва баъд ба тоҷикӣ мегузаранд:
//
//     "gist — сафари вазнин, вале хушанҷом."
//     "vocab-in-context: exhausted = хеле хаста."
//
// Онҳо кириллӣ ДОРАНД, пас филтри `NOCYR` онҳоро ҳеҷ гоҳ намебинад — вале
// Олим ҳанӯз ҳам калимаи «gist»-ро мехонад. Теги англисиро мебарорем ва
// шарҳи тоҷикии мавҷударо ҳамчун ДАЛЕЛ нигоҳ медорем.
head('4b · тегҳои НИМА-тоҷикӣ (филтри NOCYR онҳоро намебинад)');

const half = await q(
  `SELECT cq.id, cq.explanation e, m."order"+1 mn, l."order"+1 ln, cq."order" o
   FROM "ComprehensionExercise" ce
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
   LEFT JOIN "Lesson" l ON l."comprehensionId"=ce.id
   LEFT JOIN "Module" m ON m.id=l."moduleId"
   WHERE ce."courseId"='${COURSE}'
     AND cq.explanation ~* '^(gist|inference|vocab-in-context|attitude|purpose)'
     AND cq.explanation ~ '[\u0400-\u04FF]'
   ORDER BY m."order", l."order", cq."order"`);

let halfN = 0;
for (const r of half) {
  const e = r.e.trim();
  const hit = TAG_MAP.find((m) => m.re.test(e));
  if (!hit) { say(`  ⚠ нақша нест: ${JSON.stringify(e)}`); continue; }
  // Теги пешоянд то аввалин «:» ё «—» бурида мешавад.
  let rest = e.replace(/^[^:—]*[:—]\s*/u, '').trim();
  if (rest) rest = rest[0].toUpperCase() + rest.slice(1);
  const out = rest ? `${hit.tj} ${rest}` : hit.tj;
  say(`  M${r.mn}·Д${r.ln} q#${r.o + 1}`);
  say(`      «${e}»`);
  say(`   →  «${out}»`);
  if (APPLY) await q('UPDATE "ComprehensionQuestion" SET explanation=$1 WHERE id=$2', [out, r.id]);
  halfN++; total++;
}
say(`  нима-тоҷикӣ: ${halfN}`);

// ── 3b · promptTranslated ва фосилаи дукарата ─────────────────────────────
head('3b · promptTranslated + фосилаи дукарата');

const pt = await q(
  `SELECT ge.id, ge."promptTranslated" pt, ge.prompt FROM "GrammarExercise" ge
   JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge."promptTranslated" ${NOCYR_SQL}`);
for (const r of pt) {
  const out = 'Қоида: ' + r.pt.trim();
  say(`  «${r.pt}»  →  «${out}»   (савол: ${r.prompt})`);
  if (APPLY) await q('UPDATE "GrammarExercise" SET "promptTranslated"=$1 WHERE id=$2', [out, r.id]);
  total++;
}
say(`  promptTranslated: ${pt.length}`);

const dbl = await q(
  `SELECT gr.id, gr.pattern, gr.note FROM "GrammarRule" gr
   JOIN "GrammarTopic" gt ON gt.id=gr."topicId"
   WHERE gt."courseId"='${COURSE}' AND (gr.note LIKE '%  %' OR gr.pattern LIKE '%  %')`);
for (const r of dbl) {
  // ⚠ Ин ду фосила ТАСОДУФӢ набуданд — онҳо намунаи ДУРУСТ ва НОДУРУСТРО
  // ҷудо мекарданд («✓ when I arrive␣␣✗ when I will arrive»). Flutter
  // фосилаҳои паиҳамро ҷамъ НАМЕКУНАД, пас дар экран фосилаи васеъ менамуд.
  // Ба як фосила фишурдан ҷумларо ба ҳам мечаспонад ва хонданашро БАДТАР
  // мекунад. Барои ҳамин ҷудокунандаи ошкоро « · » гузошта мешавад: ҳам
  // фосилаи дукарата меравад, ҳам ҷудоӣ мемонад.
  const sep = (s) => (s || '').replace(/ {2,}(?=✗)/g, ' · ').replace(/ {2,}/g, ' ');
  const note = sep(r.note);
  const pat = sep(r.pattern);
  say(`  note: «${r.note}»  →  «${note}»`);
  if (APPLY) await q('UPDATE "GrammarRule" SET note=$1, pattern=$2 WHERE id=$3', [note, pat, r.id]);
  total++;
}
say(`  қоидаи бо фосилаи дукарата: ${dbl.length}`);

// ── 5 · Сенарияҳои муколама ────────────────────────────────────────────────
head('5 · Сенарияи муколама → тоҷикӣ');

// Тарҷумаи дастӣ, ҷумла ба ҷумла. Ҳар сатр бо унвони муколама санҷида шуд.
const SCENARIOS = {
  'A customer asks the pharmacist for help with cold symptoms.':
    'Харидор аз дорусоз барои табобати аломатҳои шамолхӯрӣ маслиҳат мепурсад.',
  'A customer calls tech support because the internet is not working.':
    'Муштарӣ ба хидмати дастгирии техникӣ занг мезанад, зеро интернет кор намекунад.',
  'A customer returns a faulty jacket to a shop.':
    'Харидор куртаи нуқсондорро ба мағоза бармегардонад.',
  'Two friends apologise and make up after a disagreement.':
    'Ду дӯст пас аз баҳс узр мепурсанд ва оштӣ мекунанд.',
  'A customer orders a meal at a restaurant.':
    'Меҳмон дар тарабхона хӯрок фармоиш медиҳад.',
  'A visitor asks a guide about the exhibits at a science museum.':
    'Боздидкунанда дар осорхонаи илм аз роҳнамо дар бораи ашёи намоишӣ мепурсад.',
  'Two friends from different countries compare their festivals.':
    'Ду дӯст аз кишварҳои гуногун ҷашнҳои худро муқоиса мекунанд.',
  'A candidate answers questions at a job interview.':
    'Довталаб дар мусоҳибаи корӣ ба саволҳо ҷавоб медиҳад.',
};

const scen = await q(
  `SELECT d.id, d.scenario, d."titleTranslated" tt, m."order"+1 mn, l."order"+1 ln
   FROM "Dialogue" d LEFT JOIN "Lesson" l ON l."dialogueId"=d.id
   LEFT JOIN "Module" m ON m.id=l."moduleId"
   WHERE d."courseId"='${COURSE}' AND d.scenario ${NOCYR_SQL} AND d.scenario <> ''
   ORDER BY m."order"`);
let sc = 0;
for (const r of scen) {
  const tj = SCENARIOS[r.scenario.trim()];
  if (!tj) { say(`  ⚠ M${r.mn}·L${r.ln} тарҷума НЕСТ: ${JSON.stringify(r.scenario)}`); continue; }
  say(`  M${r.mn}·Д${r.ln} «${r.tt}»`);
  say(`      «${r.scenario}»`);
  say(`   →  «${tj}»`);
  if (APPLY) await q('UPDATE "Dialogue" SET scenario=$1 WHERE id=$2', [tj, r.id]);
  sc++; total++;
}
say(`  сенария: ${sc} аз ${scen.length}`);

// ── content_version ────────────────────────────────────────────────────────
if (APPLY && total) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  say('\ncontent_version ламс шуд.');
}

// ── Худсанҷӣ ───────────────────────────────────────────────────────────────
head('Худсанҷӣ (аз база хонда мешавад)');

const chk = async (label, text, params = []) => {
  const r = await q(text, params);
  say(`  ${label.padEnd(46)} ${String(r[0].n).padStart(4)}   (ҳадаф 0)`);
  return r[0].n;
};

let bad = 0;
bad += await chk('ComprehensionQuestion бе тоҷикӣ',
  `SELECT COUNT(*)::int n FROM "ComprehensionExercise" ce
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
   WHERE ce."courseId"='${COURSE}' AND cq.explanation ${NOCYR_SQL}`);
bad += await chk('GrammarExercise бе тоҷикӣ',
  `SELECT COUNT(*)::int n FROM "GrammarExercise" ge JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge.explanation ${NOCYR_SQL}`);
bad += await chk('promptTranslated бе тоҷикӣ',
  `SELECT COUNT(*)::int n FROM "GrammarExercise" ge JOIN "GrammarTopic" gt ON gt.id=ge."topicId"
   WHERE gt."courseId"='${COURSE}' AND ge."promptTranslated" ${NOCYR_SQL}`);
bad += await chk('сенарияи муколама бе тоҷикӣ',
  `SELECT COUNT(*)::int n FROM "Dialogue"
   WHERE "courseId"='${COURSE}' AND scenario <> '' AND scenario ${NOCYR_SQL}`);
bad += await chk('теги муаллифӣ («gist»/«inference»…) боқӣ',
  `SELECT COUNT(*)::int n FROM "ComprehensionExercise" ce
   JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=ce.id
   WHERE ce."courseId"='${COURSE}'
     AND cq.explanation ~* '^(gist|inference|vocab-in-context|attitude|purpose)'`);
bad += await chk('қоидаи бо фосилаи дукарата',
  `SELECT COUNT(*)::int n FROM "GrammarRule" gr JOIN "GrammarTopic" gt ON gt.id=gr."topicId"
   WHERE gt."courseId"='${COURSE}' AND (gr.note LIKE '%  %' OR gr.pattern LIKE '%  %')`);
bad += await chk('унвон бо ҳарфи калон баъди ва/ё (ғайри ВАО)',
  `SELECT COUNT(*)::int n FROM "Module"
   WHERE "courseId"='${COURSE}' AND "titleTranslated" ~ '(^| )(ва|ё) +[А-ЯЁҒҲҚҶӢӮЪЎ]'
     AND "titleTranslated" !~ '(ва|ё) +ВАО'`);

say();
const xpNow = await q(
  `SELECT CASE WHEN l."phraseCollectionId" IS NOT NULL THEN 'ибора'
               WHEN l."skillType"='review' THEN 'такрор' END k,
          l."xpReward" xp, COUNT(*)::int n
   FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
   WHERE m."courseId"='${COURSE}'
     AND (l."phraseCollectionId" IS NOT NULL OR l."skillType"='review')
   GROUP BY 1,2 ORDER BY 1,2`);
for (const r of xpNow) say(`  XP · ${r.k}: ${r.n} дарс × ${r.xp} XP`);

say(`\n  ВАО нигоҳ дошта шуд? ${(await q(`SELECT "titleTranslated" tt FROM "Module"
   WHERE "courseId"='${COURSE}' AND "order"=2`))[0].tt}`);
say(`  «Муҳити Зист»?        ${(await q(`SELECT "titleTranslated" tt FROM "Module"
   WHERE "courseId"='${COURSE}' AND "order"=3`))[0].tt}`);

say();
say(APPLY
  ? `✔ ТАМОМ — ${total} тағйирот навишта шуд. Хатоҳои боқимонда: ${bad}`
  : `[хушк] ${total} тағйирот МЕШУД. Барои навиштан: --apply`);
