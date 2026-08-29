// ─────────────────────────────────────────────────────────────────────────────
// EN-A1 · Ислоҳи ниҳоии мундариҷа («Final Human-QA Report», 2026-08-23)
//
// ЧОР АМАЛ:
//   A. Рақами «Дарси N:» ба мавқеи ВОҚЕӢ + Title-Case → ҳарфи хурди тоҷикӣ
//   B. Эмоҷӣ: зидду нақиз, бархӯрд ва номувофиқатии фарҳангӣ
//   C. 94 тавзеҳи комилан англисӣ → бо чорчӯбаи тоҷикӣ
//   D. XP-и дарси «Такрор» 30 → 10 (2 пахш 30 хол медод — аз дарси 19-қадама зиёд)
//
// ИҶРО:
//   node prisma/fix-en-a1-content-finale.mjs            → DRY-RUN (ҳеҷ навиштан)
//   node prisma/fix-en-a1-content-finale.mjs --apply    → навиштан + нусхаи эҳтиётӣ
//
// ⚠️ Драйвери HTTP (ниг. [[ramz-db-scripts-local]]): аз мошини корӣ порти 5432
//    баста аст. `UPDATE` рӯйхати ХОЛӢ бармегардонад — `rowCount` НЕСТ, пас ҳар
//    амал бо SELECT-и ҷудогонаи before/after санҷида мешавад.
//
// ⚠️ ИДЕМПОТЕНТ: дубора иҷро кардан «0 тағйирот» медиҳад, на хато. Ҳар амал
//    ҳолати ҶОРИРО мехонад ва танҳо фарқро менависад.
// ─────────────────────────────────────────────────────────────────────────────
import { writeFileSync } from 'fs';
import { connect, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
const COURSE = 'cmqkvhu8p0001o5r7nkbeo4jm'; // en → tg, A1

banner('EN-A1 · Ислоҳи ниҳоии мундариҷа (A: унвон · B: эмоҷӣ · C: тавзеҳ · D: XP)');

// ═══ 0. ҲОЛАТИ ҶОРӢ ═══════════════════════════════════════════════════════════
const modules = await sql`
  SELECT id, title, "titleTranslated" tt, "order"
    FROM "Module" WHERE "courseId" = ${COURSE} ORDER BY "order"`;
const lessons = await sql`
  SELECT l.id, l."moduleId" mid, l.title, l."titleTranslated" tt, l."skillType" st,
         l."xpReward" xp, l."order", l."grammarTopicId" gid, l."dialogueId" did,
         l."comprehensionId" cid, l."phraseCollectionId" pid
    FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
   WHERE m."courseId" = ${COURSE} ORDER BY l."order"`;
const words = await sql`
  SELECT w.id, w."lessonId" lid, w.word, w.translation, w.emoji
    FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId"
    JOIN "Module" m ON m.id = l."moduleId" WHERE m."courseId" = ${COURSE}`;
const comps = await sql`
  SELECT id, "titleTranslated" tt FROM "ComprehensionExercise" WHERE "courseId" = ${COURSE}`;
const topics = await sql`
  SELECT id, "titleTranslated" tt FROM "GrammarTopic" WHERE "courseId" = ${COURSE}`;
const dias = await sql`
  SELECT id, "titleTranslated" tt FROM "Dialogue" WHERE "courseId" = ${COURSE}`;
const colls = await sql`
  SELECT id, "titleTranslated" tt FROM "PhraseCollection" WHERE "courseId" = ${COURSE}`;
const cqs = await sql`
  SELECT q.id, q."exerciseId" eid, q.explanation
    FROM "ComprehensionQuestion" q JOIN "ComprehensionExercise" e ON e.id = q."exerciseId"
   WHERE e."courseId" = ${COURSE}`;
const gxs = await sql`
  SELECT x.id, x."topicId" tid, x.type, x.explanation
    FROM "GrammarExercise" x JOIN "GrammarTopic" t ON t.id = x."topicId"
   WHERE t."courseId" = ${COURSE}`;

const modById = Object.fromEntries(modules.map((m) => [m.id, m]));
const locOf = (l) => `M${modById[l.mid].order + 1}·L${l.order + 1}`;
console.log(`Хонда шуд: ${modules.length} модул · ${lessons.length} дарс · ${words.length} калима · `
  + `${cqs.length} саволи фаҳмиш · ${gxs.length} машқи грамматика\n`);

// ═══ УМУМӢ ════════════════════════════════════════════════════════════════════
const updates = []; // {table, id, field, from, to, why, loc}
const push = (table, id, field, from, to, why, loc) => {
  if (from === to) return;
  updates.push({ table, id, field, from, to, why, loc });
};
const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s || '');

// ═══ АМАЛИ A · УНВОНҲО ════════════════════════════════════════════════════════
// Калимаҳое ки ҲАРФИ КАЛОНРО НИГОҲ МЕДОРАНД. Ҳар вожаи ЛОТИНӢ низ нигоҳ дошта
// мешавад — «To Be», «Have got», «Present Continuous» истилоҳи англисианд.
const PROPER = new Set([
  'Тоҷикистон', 'Душанбе', 'Лондон', 'Англия', 'Русия', 'Амрико', 'Дубай',
  'Сэм', 'Карим', 'Анна', 'Том', 'Алӣ', 'Соро', 'Мадина', 'Умар', 'Амир', 'Сара',
  // ⚠️ «Модул»/«Модули»/«Дарси» ҚАСДАН ин ҷо НЕСТАНД: онҳо ҳамеша калимаи
  // ЯКУМИ унвонанд ва ҳамин тавр ҳам даст намехӯранд. Дар рӯйхат гузоштани
  // онҳо «Такрори Модул»-ро ҳифз мекард — маҳз ҳамон Title-Case-е, ки
  // бояд бартараф шавад.
  'RAMZ', 'AI',
]);
const stripPunct = (w) => w.replace(/[(),.!?«»"„“]/g, '');

/** Title-Case-и англисӣ → ҳарфи хурди тоҷикӣ. Идемпотент. */
function sentenceCase(s) {
  const toks = s.split(/(\s+)/);
  let prev = null;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/^\s*$/.test(t)) continue;
    if (prev === null) { prev = t; continue; }          // калимаи ЯКУМ
    if (/[:—–-]$/.test(prev)) { prev = t; continue; }   // баъди «:» меъёр аст
    const bare = stripPunct(t);
    if (bare.length > 1 && /^[А-ЯЁЎҚҒҲҶӢӮ]/.test(bare)
        && !/[A-Za-z]/.test(bare) && !PROPER.has(bare)) {
      toks[i] = t.replace(bare, bare[0].toLowerCase() + bare.slice(1));
    }
    prev = t;
  }
  return toks.join('');
}
/** «Дарси 13:» → «Дарси 15:» — рақам ба мавқеи ВОҚЕӢ. Идемпотент. */
const renumber = (s, pos) =>
  s.replace(/^(\s*)(Дарси|Lesson)(\s*)(\d+)(\s*:)/, (_, a, w, b, __, c) => `${a}${w}${b}${pos}${c}`);

for (const m of modules) push('Module', m.id, 'titleTranslated', m.tt, sentenceCase(m.tt), 'title-case', `M${m.order + 1}`);
for (const l of lessons) {
  const loc = locOf(l), pos = l.order + 1;
  const ttNum = renumber(l.tt, pos);
  push('Lesson', l.id, 'titleTranslated', l.tt, sentenceCase(ttNum),
    (ttNum !== l.tt ? 'рақам' : '') + (sentenceCase(ttNum) !== ttNum ? (ttNum !== l.tt ? '+' : '') + 'title-case' : ''), loc);
  push('Lesson', l.id, 'title', l.title, renumber(l.title, pos), 'рақам (en)', loc);
}
// Унвони компонент = он чи дар САРИ ЭКРАН намоиш мешавад (`compTitle`).
const compSeen = new Set();
for (const l of lessons) {
  const loc = locOf(l);
  for (const [tbl, id, rows] of [
    ['GrammarTopic', l.gid, topics], ['Dialogue', l.did, dias],
    ['ComprehensionExercise', l.cid, comps], ['PhraseCollection', l.pid, colls],
  ]) {
    if (!id || compSeen.has(tbl + id)) continue;
    compSeen.add(tbl + id);
    const r = rows.find((x) => x.id === id);
    if (r) push(tbl, r.id, 'titleTranslated', r.tt, sentenceCase(r.tt), 'title-case', loc);
  }
}

// ═══ АМАЛИ B · ЭМОҶӢ ══════════════════════════════════════════════════════════
// Формат: [loc, калимаи англисӣ, эмоҷии нав, сабаб]
const EMOJI = [
  // зидду нақиз — як расм барои ду маънои МУҚОБИЛ
  ['M3·L6', 'Tall', '🦒', 'зидду нақиз: Tall ва Short ҳарду 📏 буданд'],
  ['M3·L6', 'Short', '🐁', 'зидду нақиз: Tall ва Short ҳарду 📏 буданд'],
  ['M10·L10', 'Short', '✂️', 'зидду нақиз: Long ва Short ҳарду 📏 буданд'],
  ['M10·L10', 'Loose', '🥼', 'зидду нақиз: Tight ва Loose ҳарду 👕 буданд'],
  // бархӯрд дар як дарс, ки АКС онро наҷот намедиҳад
  ['M1·L2', 'Thank you', '🙌', 'бо Please ҳарду 🙏; ҳеҷ кадом акс надорад'],
  ['M1·L3', 'I', '🙋', 'I / You / My ҳар се 👤 буданд'],
  ['M1·L3', 'You', '👉', 'I / You / My ҳар се 👤 буданд'],
  ['M1·L3', 'My', '🤲', 'I / You / My ҳар се 👤 буданд'],
  ['M2·L13', 'Tajik', '🗣️', 'бо English ҳарду 💬 буданд'],
  // номувофиқатии фарҳангӣ / мантиқӣ
  ['M10·L10', 'Ugly', '☹️', '👺 ниқоби деви ҷопонӣ — бегона ва тарсовар'],
  ['M4·L6', 'Wednesday', '📅', '🐪 шутур = шӯхии идоравии амрикоӣ «hump day»'],
  ['M11·L2', 'Stomach', '🫃', '🍔 гамбургер барои узви бадан'],
  ['M7·L4', 'Shelf', '📚', '🧸 хирси бозича барои «раф»'],
  ['M7·L4', 'Table', '🍽️', '🪵 кундаи чӯб барои «миз»'],
  ['M7·L9', 'Closet', '🗄️', '🛒 аробачаи харид барои «ҷевон»'],
  ['M10·L7', 'Hat', '👒', '👑 тоҷ барои «кулоҳ»; M8·L6 аллакай 👒 дорад'],
  ['M5·L1', 'Wake up', '⏰', '🥱 хамёза = хоболудӣ, на бедор шудан'],
  ['M5·L1', 'Get up', '🧍', '🛏️ кат = ба ҷойгаҳ рафтан, на аз он хестан'],
  // ҷуфти ИВАЗШУДА ва «як калима — ду эмоҷӣ»
  ['M2·L1', 'Birthday', '🎂', 'Birthday ва Age ҷойҳояшон иваз шуда буданд'],
  ['M2·L1', 'Age', '🔢', 'Birthday ва Age ҷойҳояшон иваз шуда буданд'],
  ['M2·L1', 'Years', '📆', 'ҷойро барои Age холӣ мекунад'],
  ['M2·L1', 'Today', '📅', '🎉 таркиши идона барои «имрӯз»'],
  ['M6·L9', 'Dinner', '🍲', '🌙 моҳ; M5·L3 ҳамон калимаро 🍲 дорад'],
  ['M2·L13', 'England', '🇬🇧', '🏴 парчами сиёҳи холӣ; M2·L5 аллакай 🇬🇧 дорад'],
];
const wordsByLoc = {};
for (const l of lessons) wordsByLoc[locOf(l)] = words.filter((w) => w.lid === l.id);
let emojiMissing = 0;
for (const [loc, en, emoji, why] of EMOJI) {
  const w = (wordsByLoc[loc] || []).find((x) => x.word.toLowerCase() === en.toLowerCase());
  if (!w) { console.log(`❌ ЁФТ НАШУД: ${loc} «${en}» — эмоҷӣ иваз намешавад`); emojiMissing++; continue; }
  push('Word', w.id, 'emoji', w.emoji, emoji, why, `${loc} «${w.word}»`);
}

// ── ТАСДИҚ: бархӯрди НАВ пайдо нашавад ──
const normE = (e) => (e || '').replace(/️/g, '').trim();
const emojiFor = (w) => {
  const u = updates.find((x) => x.table === 'Word' && x.id === w.id && x.field === 'emoji');
  return normE(u ? u.to : w.emoji);
};
let newCollisions = 0, collAfter = 0;
for (const l of lessons) {
  const ws = words.filter((w) => w.lid === l.id);
  const group = (fn) => {
    const g = {};
    for (const w of ws) { const e = fn(w); if (e) (g[e] ??= []).push(w.word); }
    return Object.entries(g).filter(([, v]) => v.length > 1);
  };
  const before = group((w) => normE(w.emoji));
  const after = group(emojiFor);
  collAfter += after.length;
  for (const [e, ws2] of after) {
    if (!before.some(([e2]) => e2 === e)) {
      console.log(`❌ БАРХӮРДИ НАВ: ${locOf(l)} ${e} → ${ws2.join(' × ')}`);
      newCollisions++;
    }
  }
}

// ═══ АМАЛИ C · ТАВЗЕҲҲОИ КОМИЛАН АНГЛИСӢ ══════════════════════════════════════
// Матни англисӣ ҲИФЗ мешавад — маҳз ҳамон шакли англисӣ чизест, ки таълим дода
// мешавад. Чизе ки намерасид, чорчӯбаи ТОҶИКӢ буд: хонанда бояд бидонад, ки ба
// ЧӢ нигоҳ мекунад. Ҳамин услуб дар 83 тавзеҳи дигари курс аллакай ҳаст
// («Матн: He is a teacher.»), пас ин ҷо ҳамон меъёр паҳн мешавад.
const GX_LEAD = {
  reorder: 'Тартиби дуруст',
  transform: 'Табдил',
  fill_blank: 'Шакли дуруст',
  choose: 'Қоида',
};
const topicToLoc = {};
for (const l of lessons) if (l.gid) topicToLoc[l.gid] = locOf(l);
const compToLoc = {};
for (const l of lessons) if (l.cid) compToLoc[l.cid] = locOf(l);

for (const q of cqs) {
  const e = (q.explanation || '').trim();
  if (!e || hasCyrillic(e)) continue; // аллакай тоҷикӣ дорад → нарасон
  // «She/He/It → has got.» қоидаи грамматикист, на иқтибос аз матн.
  const lead = /→/.test(e) ? 'Қоида' : 'Матн';
  push('ComprehensionQuestion', q.id, 'explanation', e, `${lead}: ${e}`,
    'тавзеҳи комилан англисӣ', compToLoc[q.eid] || '?');
}
for (const x of gxs) {
  const e = (x.explanation || '').trim();
  if (!e || hasCyrillic(e)) continue;
  const lead = GX_LEAD[x.type] || 'Қоида';
  push('GrammarExercise', x.id, 'explanation', e, `${lead}: ${e}`,
    `тавзеҳи комилан англисӣ (${x.type})`, topicToLoc[x.tid] || '?');
}

// ═══ АМАЛИ D · XP-и ДАРСИ «ТАКРОР» ════════════════════════════════════════════
// Дарси «Такрор» 2–3 савол дорад, вале 30 XP медод — аз дарси луғавии
// 19-қадама (15 XP) ДУ баробар зиёд. Тимур маҳз ҳаминро «ферма» мекард.
const REVIEW_XP = 10;
for (const l of lessons) {
  if (l.st !== 'review') continue;
  if (l.xp === REVIEW_XP) continue;
  push('Lesson', l.id, 'xpReward', l.xp, REVIEW_XP, 'XP-и «Такрор» мутавозин шуд', locOf(l));
}

// ═══ ҲИСОБОТ ══════════════════════════════════════════════════════════════════
const byWhy = {};
for (const u of updates) {
  const k = u.table + '.' + u.field;
  (byWhy[k] ??= []).push(u);
}
console.log('── НАҚША ──');
for (const [k, v] of Object.entries(byWhy)) console.log(`  ${k.padEnd(38)} ${v.length}`);
console.log(`  ${'ҲАМАГӢ'.padEnd(38)} ${updates.length}\n`);
if (emojiMissing || newCollisions) {
  console.log(`⛔ ИСТОД: ${emojiMissing} калимаи ёфтнашуда, ${newCollisions} бархӯрди нав.`);
  process.exit(1);
}
console.log(`✔ тасдиқ: бархӯрди эмоҷӣ баъди татбиқ = ${collAfter} (ҳамааш бо АКС наҷот меёбад), бархӯрди НАВ = 0\n`);

for (const u of updates) {
  console.log(`[${u.table}.${u.field}] ${u.loc}  (${u.why})`);
  console.log(`    - ${JSON.stringify(u.from)}`);
  console.log(`    + ${JSON.stringify(u.to)}`);
}

if (!updates.length) {
  console.log('\n✔ Ҳеҷ тағйирот лозим нест — база аллакай дуруст аст (идемпотент).');
  process.exit(0);
}
if (!APPLY) {
  console.log(`\n🟢 DRY-RUN — ҳеҷ чиз навишта нашуд. Барои татбиқ: --apply`);
  process.exit(0);
}

// ═══ НАВИШТАН ═════════════════════════════════════════════════════════════════
// ⚠️ Номи нусха бо ВАҚТ — вагарна иҷрои дуюм нусхаи аввалро болонавис
// мекунад ва роҳи бозгашт гум мешавад (маҳз ҳамин ҳангоми татбиқ рӯй дод).
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = new URL(`./_backup-en-a1-finale-${stamp}.json`, import.meta.url);
writeFileSync(backupPath, JSON.stringify({
  takenAt: new Date().toISOString(), courseId: COURSE,
  rows: updates.map(({ table, id, field, from, loc }) => ({ table, id, field, value: from, loc })),
}, null, 1));
console.log(`\n💾 Нусхаи эҳтиётӣ: ${backupPath.pathname.replace(/^\//, '')} (${updates.length} сатр)`);

let done = 0;
for (const u of updates) {
  // Идентификаторҳо аз рӯйхати САХТИ дохилӣ меоянд (на аз вуруди корбар),
  // пас ин ҷо ҷойгузории бехатари сатр аст, на SQL аз берун.
  const t = u.table, f = u.field;
  if (f === 'xpReward') {
    await sql.query(`UPDATE "${t}" SET "${f}" = $1 WHERE id = $2`, [u.to, u.id]);
  } else {
    await sql.query(`UPDATE "${t}" SET "${f}" = $1 WHERE id = $2`, [u.to, u.id]);
  }
  done++;
  if (done % 40 === 0) console.log(`   … ${done}/${updates.length}`);
}
console.log(`   … ${done}/${updates.length}`);

// ═══ ТАСДИҚИ БАЪДИ НАВИШТАН ═══════════════════════════════════════════════════
// ⚠️ Драйвери HTTP барои UPDATE массиви ХОЛӢ бармегардонад — `rowCount` НЕСТ.
//    Бинобар ин ҳар сатр АЗ НАВ хонда мешавад.
console.log('\n── ТАСДИҚ (аз нав аз база хонда мешавад) ──');
let ok = 0, fail = 0;
const byTable = {};
for (const u of updates) (byTable[u.table] ??= []).push(u);
for (const [table, rows] of Object.entries(byTable)) {
  const ids = rows.map((r) => r.id);
  const cols = [...new Set(rows.map((r) => r.field))];
  const sel = cols.map((c) => `"${c}"`).join(', ');
  const got = await sql.query(`SELECT id, ${sel} FROM "${table}" WHERE id = ANY($1)`, [ids]);
  const map = Object.fromEntries(got.map((g) => [g.id, g]));
  for (const r of rows) {
    const cur = map[r.id]?.[r.field];
    if (String(cur) === String(r.to)) ok++;
    else { fail++; console.log(`❌ ${table}.${r.field} ${r.loc}: интизор ${JSON.stringify(r.to)}, ҳаст ${JSON.stringify(cur)}`); }
  }
}
console.log(`\n${fail ? '⛔' : '✔'} тасдиқ шуд: ${ok}/${updates.length} дуруст, ${fail} номувофиқ`);
process.exit(fail ? 1 : 0);
