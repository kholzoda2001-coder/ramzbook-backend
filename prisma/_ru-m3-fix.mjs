// МОДУЛИ 3-и РУСӢ (A1) «Оила ва одамон» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module3_v2.md` (11.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 2` исбот кард, ки ҳар ҷузъ танҳо ба ЯК
// дарси ҳамин модул тааллуқ дорад. Ба муҳаррик ва забонҳои дигар даст намезанад.
// Матнҳои дорои аудио (Д13, Д16, Д17 ва саволҳои ба онҳо вобаста) — дар `_ru-m3-media.mjs`.
//
//   node prisma/_ru-m3-fix.mjs           # dry-run
//   node prisma/_ru-m3-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 3 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${mods[2].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 3 бояд 17 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));

let changed = 0, already = 0;
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'ipaTajik', 'emoji'],
  GrammarExample: ['translation'],
  GrammarExercise: ['prompt', 'promptTranslated', 'explanation'],
  GrammarTopic: ['explanation'],
  ComprehensionExercise: ['passageTranslated'],
  ComprehensionQuestion: ['question', 'questionTranslated', 'explanation', 'correctIndex'],
};

async function read(table, col, id) {
  const r = await sql.query(`SELECT "${col}" AS v FROM "${table}" WHERE id=$1`, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  return r[0].v;
}
async function set(table, id, col, want, label) {
  if (!ALLOW[table]?.includes(col)) throw new Error(`иҷозат нест: ${table}.${col}`);
  const have = await read(table, col, id);
  if (have === want) { already++; return; }
  console.log(`  • ${label}\n      буд : ${JSON.stringify(have)}\n      шуд : ${JSON.stringify(want)}`);
  changed++;
  if (!APPLY) return;
  await sql.query(`UPDATE "${table}" SET "${col}"=$1 WHERE id=$2`, [want, id]);
  if ((await read(table, col, id)) !== want) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}
/** Иваз кардани ПОРАИ матн — пора бояд дақиқан як бор бошад (ё аллакай иваз шуда бошад). */
async function replaceIn(table, id, col, oldPart, newPart, label) {
  const have = await read(table, col, id);
  if (!have.includes(oldPart)) {
    if (have.includes(newPart)) { already++; return; }
    throw new Error(`${label}: пораи «${oldPart}» ёфт нашуд`);
  }
  if (have.split(oldPart).length !== 2) throw new Error(`${label}: пора якчанд бор`);
  await set(table, id, col, have.replace(oldPart, newPart), label);
}
async function setOptions(id, want, label) {
  const [r] = await sql`SELECT options v FROM "ComprehensionQuestion" WHERE id=${id}`;
  if (JSON.stringify(r.v) === JSON.stringify(want)) { already++; return; }
  console.log(`  • ${label}\n      буд : ${JSON.stringify(r.v)}\n      шуд : ${JSON.stringify(want)}`);
  changed++;
  if (!APPLY) return;
  await sql`UPDATE "ComprehensionQuestion" SET options=${JSON.stringify(want)}::jsonb WHERE id=${id}`;
  const [a] = await sql`SELECT options v FROM "ComprehensionQuestion" WHERE id=${id}`;
  if (JSON.stringify(a.v) !== JSON.stringify(want)) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}
async function questions(lo) {
  return sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[lo].cid} ORDER BY "order", id`;
}
function expectQ(q, oneOf, label) {
  if (!q || !oneOf.includes(q.question)) throw new Error(`${label}: саволи ғайричашмдошт «${q?.question}»`);
}
async function word(lo, ru) {
  const w = await sql`SELECT id FROM "Word" WHERE "lessonId"=${L[lo].id} AND word=${ru}`;
  if (w.length !== 1) throw new Error(`«${ru}» дар Д${lo + 1}: ${w.length}`);
  return w[0].id;
}
async function gex(lo, prompt) {
  const r = await sql`SELECT id FROM "GrammarExercise" WHERE "topicId"=${L[lo].gid} AND prompt=${prompt}`;
  if (r.length !== 1) throw new Error(`машқи «${prompt}» дар Д${lo + 1}: ${r.length}`);
  return r[0].id;
}

// ═══ R2 · транскрипсияи тоҷикӣ — 43 аз 43 холӣ буд (конвенсияи М1–М2: о→а бе зада, ы→и, ц→тс, щ→шч) ═══
console.log('\n── R2 · транскрипсия ──');
const IPA = {
  0: { Отец: 'ате́тс', Мать: 'мат', Сын: 'син', Дочь: 'доч', Малыш: 'мали́ш' },
  1: { Семья: 'симйа́', Муж: 'муш', Жена: 'жина́', Родители: 'ради́тили' },
  2: { Брат: 'брат', Сестра: 'систра́', Дедушка: 'де́душка', Бабушка: 'ба́бушка', Дядя: 'дя́дя' },
  3: { Тётя: 'тётя', 'Двоюродный брат': 'дваю́радний брат', Племянник: 'плимя́нник', Племянница: 'плимя́ннитса' },
  4: { Коллега: 'калле́га', Группа: 'гру́ппа', Команда: 'кама́нда', Все: 'фсе', Человек: 'чилаве́к', Незнакомец: 'низнако́митс' },
  5: { Высокий: 'висо́кий', Низкий: 'ни́ский', Сильный: 'си́лний', Счастливый: 'шчисли́вий', Грустный: 'гру́сний', Хороший: 'харо́ший' },
  6: { Подросток: 'падро́стак', 'Бабушка и дедушка': 'ба́бушка и де́душка', Ребёнок: 'рибёнак', Взрослый: 'взро́слий', Пожилой: 'пажило́й', Близнецы: 'близнитси́' },
  14: { Отец: 'ате́тс', Мать: 'мат', Брат: 'брат', Сестра: 'систра́', Семья: 'симйа́', Дедушка: 'де́душка', Друг: 'друк' },
};
for (const [lo, map] of Object.entries(IPA)) {
  for (const [ru, t] of Object.entries(map)) await set('Word', await word(Number(lo), ru), 'ipaTajik', t, `Д${Number(lo) + 1} «${ru}».ipaTajik`);
}

// ═══ R9 · тарҷумаҳо ═══
console.log('\n── R9 · тарҷумаҳо ──');
await set('Word', await word(1, 'Жена'), 'translation', 'Зан, ҳамсар', 'Д2 «Жена» («ҳамсар» = ҳам зан, ҳам шавҳар)');
await set('Word', await word(5, 'Хороший'), 'translation', 'Хуб', 'Д6 «Хороший» (дар М1–М2 «хуб»)');
await set('Word', await word(5, 'Сильный'), 'translation', 'Қавӣ, қувватманд', 'Д6 «Сильный» (дар матнҳо «қавӣ»)');
await set('Word', await word(3, 'Племянник'), 'translation', 'Ҷиян (писар)', 'Д4 «Племянник»');
await set('Word', await word(3, 'Племянница'), 'translation', 'Ҷиян (духтар)', 'Д4 «Племянница»');

// ═══ R8 · мисолҳое ки калимаи худро надоштанд / шакли муаннас ═══
console.log('\n── R8 · мисолҳо ──');
for (const [lo, ru, ex, tr] of [
  [1, 'Семья', 'Это моя семья.', 'Ин оилаи ман аст.'],
  [14, 'Семья', 'Это моя семья.', 'Ин оилаи ман аст.'],
  [1, 'Родители', 'Мои родители здесь.', 'Волидони ман ин ҷоянд.'],
  [4, 'Незнакомец', 'Этот человек — незнакомец.', 'Ин шахс бегона аст.'],
  [5, 'Хороший', 'Он хороший.', 'Ӯ хуб аст.'],
  [6, 'Близнецы', 'Они близнецы.', 'Онҳо дугоникҳоянд.'],   // буд «Мои кузены…» — «кузены» ҳеҷ ҷо нест
]) {
  const id = await word(lo, ru);
  await set('Word', id, 'example', ex, `Д${lo + 1} «${ru}».example`);
  await set('Word', id, 'exampleTrans', tr, `Д${lo + 1} «${ru}».exampleTrans`);
}

// ═══ R10 · эмоҷӣ ═══
console.log('\n── R10 · эмоҷӣ ──');
for (const [lo, ru, e] of [
  [1, 'Родители', '👫'],          // бо «Семья» 👪 якхела буд
  [3, 'Племянник', '🧒'],         // бо «Двоюродный брат» 👦 якхела буд
  [5, 'Высокий', '⬆️'],           // 📏 ва 📏 — ду маънои муқобил бо як эмоҷӣ
  [5, 'Низкий', '⬇️'],
  [4, 'Группа', '👥'],            // буд 👨‍👩‍👦 (оила)
  [6, 'Близнецы', '👶👶'],         // буд 👯 (одамон бо гӯшҳои харгӯш)
  [14, 'Семья', '👪'],            // дар Д2 — 👪
]) await set('Word', await word(lo, ru), 'emoji', e, `Д${lo + 1} «${ru}».emoji`);

// ═══ R5 · грамматика: «имеет», истиснои «дом», англисӣ, «бист сола» ═══
console.log('\n── R5 · грамматика ──');
{
  // Идемпотент: агар машқ аллакай иваз шуда бошад, ҷустуҷӯи матни кӯҳна хато НАМЕДИҲАД.
  const OLD = 'Али имеет машину. ___ машина новая.', NEW = 'У Али есть машина. ___ машина новая.';
  const r = await sql`SELECT id,prompt FROM "GrammarExercise" WHERE "topicId"=${L[8].gid} AND prompt = ANY(${[OLD, NEW]})`;
  if (r.length !== 1) throw new Error(`Д9 машқи «Али … машина»: ${r.length}`);
  await set('GrammarExercise', r[0].id, 'prompt', NEW, 'Д9 машқ: «Али имеет машину» → «У Али есть машина» (Д8 меомӯзонад, ки феъли «доштан» нест)');
}
{
  const [t10] = await sql`SELECT id FROM "GrammarTopic" WHERE id=${L[9].gid}`;
  await replaceIn('GrammarTopic', t10.id, 'explanation', 'стол→столы, дом→дома', 'стол→столы (**дом→дома** — истисно)', 'Д10 тавзеҳ: «дом→дома» ҳамчун истисно');
  await set('GrammarExercise', await gex(9, 'брат → ___'), 'explanation', 'Истисно: брат → братья. Инро алоҳида ёд гиред.', 'Д10 машқ «брат» (буд: brother→brothers)');
  await set('GrammarExercise', await gex(9, 'ребёнок → ___'), 'explanation', 'Истисно: ребёнок → дети — калимаи тамоман дигар.', 'Д10 машқ «ребёнок» (буд: child→children)');
  const [t11] = await sql`SELECT id FROM "GrammarTopic" WHERE id=${L[10].gid}`;
  await replaceIn('GrammarTopic', t11.id, 'explanation', '«**Ман** бист сола ҳастам»', '«**Ман** бистсола ҳастам»', 'Д11 тавзеҳ: «бистсола»');
  const [e11] = await sql`SELECT id FROM "GrammarExample" WHERE "topicId"=${L[10].gid} AND sentence=${'Мне двадцать лет.'}`;
  await set('GrammarExample', e11.id, 'translation', 'Ман бистсола ҳастам.', 'Д11 мисол «Мне двадцать лет.»');
  await set('GrammarExercise', await gex(10, '___ двадцать лет.'), 'promptTranslated', 'Ман бистсола ҳастам.', 'Д11 машқ «___ двадцать лет.»');
  await set('GrammarExercise', await gex(10, 'Ҷумларо созед:'), 'promptTranslated', 'Ман бистсола ҳастам.', 'Д11 машқ «Ҷумларо созед»');
}

// ═══ R1 · Д12 (хониш): рақами наомӯхта дар савол; тарҷума ═══
console.log('\n── R1 · Д12 ──');
{
  const q = await questions(11);
  expectQ(q[1], ['Сколько братьев у автора?', 'Дополните: У меня есть ___.'], 'Д12 Q2');
  await set('ComprehensionQuestion', q[1].id, 'question', 'Дополните: У меня есть ___.', 'Д12 Q2 question');
  await set('ComprehensionQuestion', q[1].id, 'questionTranslated', 'Аз матн пур кунед.', 'Д12 Q2 questionTranslated');
  await setOptions(q[1].id, ['брат и сестра', 'сын и дочь', 'муж и жена'], 'Д12 Q2 options (буд: Один/Два/Три)');
  await set('ComprehensionQuestion', q[1].id, 'correctIndex', 0, 'Д12 Q2 correctIndex');
  await set('ComprehensionQuestion', q[1].id, 'explanation',
    'Дар матн: «У меня есть один брат и одна сестра» — як бародар ва як хоҳар.', 'Д12 Q2 explanation');
  const [c] = await sql`SELECT id FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
  await replaceIn('ComprehensionExercise', c.id, 'passageTranslated', 'Модари ман нағз аст.', 'Модари ман хуб аст.', 'Д12 тарҷума «нағз» → «хуб»');
}

// ═══ Д16 (такрор): нохунак · Д17 (имтиҳон): саволҳое ки ба матни нав вобаста НЕСТАНД ═══
console.log('\n── Д16 · Д17 ──');
{
  const r = await questions(15);
  expectQ(r[0], ["Что означает слово 'Дедушка'?", 'Что означает слово «Дедушка»?'], 'Д16 Q1');
  await set('ComprehensionQuestion', r[0].id, 'question', 'Что означает слово «Дедушка»?', 'Д16 Q1 нохунак');
  expectQ(r[1], ["Переведите 'Қадпаст':", 'Переведите «Қадпаст»:'], 'Д16 Q2');
  await set('ComprehensionQuestion', r[1].id, 'question', 'Переведите «Қадпаст»:', 'Д16 Q2 нохунак');

  const e = await questions(16);
  expectQ(e[0], ['Насколько большая семья?', 'Какая семья?'], 'Д17 Q1');
  await set('ComprehensionQuestion', e[0].id, 'question', 'Какая семья?', 'Д17 Q1 question («Насколько» наомӯхта)');
  await set('ComprehensionQuestion', e[0].id, 'questionTranslated', 'Оила чӣ гуна аст?', 'Д17 Q1 questionTranslated');
  await set('ComprehensionQuestion', e[0].id, 'explanation', 'Дар матн: «У меня есть большая семья» — оила калон аст.', 'Д17 Q1 explanation');
  expectQ(e[4], ["'Хоҳар' по-русски:", '«Хоҳар» по-русски:'], 'Д17 Q5');
  await set('ComprehensionQuestion', e[4].id, 'question', '«Хоҳар» по-русски:', 'Д17 Q5 нохунак');
  expectQ(e[5], ['Дополните: У меня ___ брат.'], 'Д17 Q6');
  await set('ComprehensionQuestion', e[5].id, 'questionTranslated', 'Сохти соҳибият: «У меня ___ брат».', 'Д17 Q6 questionTranslated (буд «У меня: ___»)');
  await set('ComprehensionQuestion', e[5].id, 'explanation',
    'Дар русӣ феъли «доштан» нест: «У меня есть брат» = Ман бародар дорам.', 'Д17 Q6 explanation');
  expectQ(e[7], ['Дополните: Это мои ___. (братья, мн.ч.)', 'Дополните: Это мои ___.'], 'Д17 Q8');
  await set('ComprehensionQuestion', e[7].id, 'question', 'Дополните: Это мои ___.', 'Д17 Q8 question (ҷавоб дар қавс буд)');
  await set('ComprehensionQuestion', e[7].id, 'questionTranslated', '«Мои» ҷамъ аст — исми ҷамъро интихоб кунед.', 'Д17 Q8 questionTranslated');
}

console.log(`\n  Аллакай дуруст: ${already}`);
done(changed, APPLY ? 'Навбатӣ: _ru-m3-media.mjs' : '');
