// МОДУЛИ 2-и РУСӢ (A1) — Фазаи 1: ислоҳи МАЗМУН (ба аудио даст намезанад).
//
// Асос: `Digital_Students_Report_RU_A1_Module2_v2.md` (11.09.2026). Ҳар банд ба
// рақами он (R1…R14, F1…F20) ишора мекунад.
//
// ДОИРА — ТАНҲО ЗАБОНИ РУСӢ. `_ru-m2-precheck.mjs` исбот кард, ки ҳар грамматика,
// муколама ва машқи фаҳмиш танҳо ба ЯК дарси ҳамин модул тааллуқ дорад. Ин скрипт
// ба муҳаррик, ба забонҳои дигар ва ба модулҳои дигар даст НАМЕЗАНАД.
//
// Матни РУСИИ дорои аудио (passage, DialogueLine.text, GrammarExample.sentence,
// Word.word) ин ҷо иваз НАМЕШАВАД — он дар `_ru-m2-media.mjs` бо аудиояш якҷоя.
//
//   node prisma/_ru-m2-fix.mjs           # dry-run
//   node prisma/_ru-m2-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 2 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${mods[1].id} ORDER BY "order"`;
if (lessons.length !== 15) throw new Error(`Модули 2 бояд 15 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));

let changed = 0, already = 0;
const TABLES = new Set(['ComprehensionQuestion', 'ComprehensionExercise', 'Word', 'GrammarExample', 'GrammarExercise', 'GrammarRule']);
const COLS = new Set(['question', 'questionTranslated', 'explanation', 'correctIndex', 'passageTranslated', 'translation',
  'example', 'exampleTrans', 'ipaTajik', 'emoji', 'partOfSpeech', 'promptTranslated', 'note']);

async function read(table, col, id) {
  const r = await sql.query(`SELECT "${col}" AS v FROM "${table}" WHERE id=$1`, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  return r[0].v;
}

async function set(table, id, col, want, label) {
  if (!TABLES.has(table) || !COLS.has(col)) throw new Error(`иҷозат нест: ${table}.${col}`);
  const have = await read(table, col, id);
  if (have === want) { already++; return; }
  console.log(`  • ${label}\n      буд : ${JSON.stringify(have)}\n      шуд : ${JSON.stringify(want)}`);
  changed++;
  if (!APPLY) return;
  await sql.query(`UPDATE "${table}" SET "${col}"=$1 WHERE id=$2`, [want, id]);
  if ((await read(table, col, id)) !== want) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
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

async function questions(lo, n) {
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[lo].cid} ORDER BY "order", id`;
  if (q.length !== n) throw new Error(`Д${lo + 1}: ${q.length} савол (интизор ${n})`);
  return q;
}
function expectQ(q, oneOf, label) {
  if (!oneOf.includes(q.question)) throw new Error(`${label}: саволи ғайричашмдошт «${q.question}»`);
}
async function word(lo, ru) {
  const w = await sql`SELECT id FROM "Word" WHERE "lessonId"=${L[lo].id} AND word=${ru}`;
  if (w.length !== 1) throw new Error(`«${ru}» дар Д${lo + 1}: ${w.length}`);
  return w[0].id;
}
async function gexample(lo, sentence) {
  const r = await sql`SELECT id FROM "GrammarExample" WHERE "topicId"=${L[lo].gid} AND sentence=${sentence}`;
  if (r.length !== 1) throw new Error(`мисоли «${sentence}»: ${r.length}`);
  return r[0].id;
}

// Шартҳои ЗАРУРӢ — агар мазмун аз дампи санҷидашуда фарқ кунад, скрипт меистад.
const EX = 14, REVIEW = 13, READ = 9;   // order-и база (Д15, Д14, Д10)

// ═══ R1 · R5 — рақам ва шаҳри наомӯхта дар ИМТИҲОН (Д11 дар Фазаи 2, бо аудио) ═══
console.log('\n── R1/R5 · имтиҳон: вариантҳои наомӯхта ──');
{
  const q = await questions(EX, 8);
  expectQ(q[1], ['Сколько лет Анне?'], 'Д15 Q2');
  await setOptions(q[1].id, ['Десять', 'Двадцать', 'Девятнадцать'], 'Д15 Q2 options («Двенадцать» → «Девятнадцать», Д12)');
  await set('ComprehensionQuestion', q[1].id, 'correctIndex', 1, 'Д15 Q2 correctIndex');
  expectQ(q[3], ['Где Карим?'], 'Д15 Q4');
  await setOptions(q[3].id, ['Душанбе', 'Дубай', 'Лондон'], 'Д15 Q4 options («Москва» → «Дубай», Д6)');
  await set('ComprehensionQuestion', q[3].id, 'correctIndex', 0, 'Д15 Q4 correctIndex');
  expectQ(q[7], ['Сколько лет Кариму?'], 'Д15 Q8');
  await setOptions(q[7].id, ['Десять', 'Девятнадцать', 'Двадцать'], 'Д15 Q8 options («Восемнадцать» → «Десять», Д1)');
  await set('ComprehensionQuestion', q[7].id, 'correctIndex', 1, 'Д15 Q8 correctIndex');
}

// ═══ R4 · тавзеҳи танҳо-русӣ дар имтиҳон (Д11 дар Фазаи 2) ═══
console.log('\n── R4 · имтиҳон: тавзеҳ бо тоҷикӣ ──');
{
  const q = await questions(EX, 8);
  const T = [
    [0, 'Дар матн: «Я из Англии» — Анна аз Англия аст.'],
    [1, 'Дар матн: «Мне двадцать лет» — Анна бистсола аст.'],
    [2, 'Дар матн: «Я говорю по-английски и по-русски» — Анна бо англисӣ ва русӣ гап мезанад.'],
    [3, 'Дар матн: «Он в Душанбе» — Карим дар Душанбе аст.'],
    [6, '«Окно» бо -о тамом мешавад → ҷинси бетараф (средний) → «моё».'],
    [7, 'Дар матн: «Ему девятнадцать лет» — Карим нуздаҳсола аст.'],
  ];
  for (const [i, t] of T) await set('ComprehensionQuestion', q[i].id, 'explanation', t, `Д15 Q${i + 1} explanation`);
}

// ═══ R10 · ҷавоб дар худи савол ═══
console.log('\n── R10 · Д15 Q6: ҷавоб дар қавс ──');
{
  const q = await questions(EX, 8);
  expectQ(q[5], ['Дополните: ___ ты? (откуда, не где)', 'Дополните: ___ ты? — Я из Таджикистана.'], 'Д15 Q6');
  await set('ComprehensionQuestion', q[5].id, 'question', 'Дополните: ___ ты? — Я из Таджикистана.', 'Д15 Q6 question');
  await set('ComprehensionQuestion', q[5].id, 'questionTranslated', 'Калимаи саволиро пур кунед.', 'Д15 Q6 questionTranslated');
  // «Где»-ро ҳамчун варианти рақиб илова мекунем — маҳз фарқи «Где ↔ Откуда», ки дарси 8 меомӯзонад.
  await setOptions(q[5].id, ['Где', 'Кто', 'Откуда'], 'Д15 Q6 options');
  await set('ComprehensionQuestion', q[5].id, 'correctIndex', 2, 'Д15 Q6 correctIndex');
  await set('ComprehensionQuestion', q[5].id, 'explanation',
    'Ҷавоб «Я из Таджикистана» пайдоишро мегӯяд → «Откуда» (аз куҷо). «Где» = дар куҷо.', 'Д15 Q6 explanation');
}

// ═══ «Ему / Ей … лет» — дар қоидаи Д8, пеш аз имтиҳон ═══
console.log('\n── Д8 · қоидаи «Сколько тебе лет?» → «Мне/Тебе/Ему/Ей … лет» ──');
{
  const r = await sql`SELECT id FROM "GrammarRule" WHERE "topicId"=${L[7].gid} AND pattern=${'Сколько тебе лет? = Чандсолаӣ?'}`;
  if (r.length !== 1) throw new Error(`қоидаи «Сколько тебе лет?»: ${r.length}`);
  await set('GrammarRule', r[0].id, 'note',
    'Барои синну сол. Ҷавоб: «Мне … лет» (ман), «Тебе … лет» (ту), «Ему … лет» (ӯ — мард), «Ей … лет» (ӯ — зан). Мисол: «Мне десять лет» = Ман даҳсола ҳастам.',
    'Д8 қоидаи 3 note');
}

// ═══ R6 · «Он»-и тоҷикӣ ба ҷои ҷонишин (шахс → Ӯ/Ин, ашё → Вай) ═══
console.log('\n── R6 · «Он»-и тоҷикӣ (Д8, Д9) ──');
await set('GrammarExample', await gexample(7, 'Кто этот мужчина?'), 'translation', 'Ин мард кист?', 'Д8 мисол «Кто этот мужчина?»');
{
  const r = await sql`SELECT id FROM "GrammarExercise" WHERE "topicId"=${L[7].gid} AND prompt=${'___ эта женщина?'}`;
  if (r.length !== 1) throw new Error('машқи «___ эта женщина?»');
  await set('GrammarExercise', r[0].id, 'promptTranslated', 'Ин зан кист?', 'Д8 машқ «___ эта женщина?»');
}
await set('GrammarExample', await gexample(8, 'Это стол. Он большой.'), 'translation', 'Ин миз аст. Вай калон аст.', 'Д9 «Это стол. Он большой.»');
await set('GrammarExample', await gexample(8, 'Это книга. Она интересная.'), 'translation', 'Ин китоб аст. Вай ҷолиб аст.', 'Д9 «Это книга. Она интересная.»');
await set('GrammarExample', await gexample(8, 'Это окно. Оно новое.'), 'translation', 'Ин тиреза аст. Вай нав аст.', 'Д9 «Это окно. Оно новое.»');
await set('GrammarExample', await gexample(8, 'Это мой дом.'), 'translation', 'Ин хонаи ман аст. (дом — муздаккар)', 'Д9 «Это мой дом.» (F12)');
await set('GrammarExample', await gexample(8, 'Это моя подруга.'), 'translation', 'Ин дугонаи ман аст.', 'Д9 «Это моя подруга.» (F13)');

// ═══ R7 · 6 мисол, ки калимаи худро надоштанд (Word.example аудио надорад) ═══
console.log('\n── R7 · мисолҳо ──');
for (const [lo, ru, ex, tr] of [
  [0, 'Возраст', 'Напишите ваш возраст.', 'Синну соли худро нависед.'],
  [0, 'Старый', 'Мой дедушка старый.', 'Бобои ман пир аст.'],
  [0, 'Молодой', 'Он молодой.', 'Ӯ ҷавон аст.'],
  [4, 'Страна', 'Таджикистан — красивая страна.', 'Тоҷикистон кишвари зебо аст.'],
  [5, 'Город', 'Это мой город.', 'Ин шаҳри ман аст.'],
  [6, 'Язык', 'Мой родной язык — таджикский.', 'Забони модарии ман тоҷикӣ аст.'],
]) {
  const id = await word(lo, ru);
  await set('Word', id, 'example', ex, `Д${lo + 1} «${ru}».example`);
  await set('Word', id, 'exampleTrans', tr, `Д${lo + 1} «${ru}».exampleTrans`);
}

// ═══ R11 · эмоҷӣ ва навъи калима ═══
console.log('\n── R11 · эмоҷӣ ──');
for (const [lo, ru, e] of [
  [3, 'Продавец', '🏪'],          // буд 🧑‍🌾 (деҳқон) — бо «Фермер» якхела
  [0, 'Сегодня', '☀️'],           // буд 🎉 (ҷашн). 🗓️ НЕ — бо 📅-и «День рождения»-и ҳамин дарс монанд аст
  [4, 'Из', '🛫'],                // буд 🏠 (хона)
  [3, 'Холост', '🧍'],            // буд 🙋
  [12, 'Англия', '🇬🇧'],          // буд 🏴 (парчами СИЁҲ); дар Д5 — 🇬🇧
  [12, 'Душанбе', '🌆'],          // буд 🏙️ — бо «Лондон» якхела; дар Д6 — 🌆
  [12, 'Лондон', '💂'],           // буд 🏙️
  [12, 'Английский', '🔤'],       // буд 💬 — бо «Таджикский» якхела; 🇬🇧 дар ин дарс аз они «Англия»
  [12, 'Таджикский', '🗣️'],       // буд 💬; 🇹🇯 дар ин дарс аз они «Таджикистан»
]) await set('Word', await word(lo, ru), 'emoji', e, `Д${lo + 1} «${ru}».emoji`);
// «Сегодня» ва «Здесь» зарф ҳастанд, на исм/пешоянд. Исм будани «Сегодня» бо эмоҷии
// нав онро ба машқи «Ин чист?» мекашид (🗓️ ↔ «Сегодня» — саргум).
await set('Word', await word(0, 'Сегодня'), 'partOfSpeech', 'adverb', 'Д1 «Сегодня».partOfSpeech');
await set('Word', await word(5, 'Здесь'), 'partOfSpeech', 'adverb', 'Д6 «Здесь».partOfSpeech');

// ═══ R13 · тоҷикӣ (F1–F4, F6, F14–F18) ═══
console.log('\n── R13 · тоҷикӣ ──');
{
  const [c10] = await sql`SELECT id,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${L[READ].cid}`;
  await set('ComprehensionExercise', c10.id, 'passageTranslated',
    'Номи ман Рустам аст. Ман аз Тоҷикистон ҳастам. Ман дар Душанбе зиндагӣ мекунам. Ман бо тоҷикӣ ва русӣ гап мезанам.',
    'Д10 passageTranslated (F1)');
  const [c15] = await sql`SELECT id FROM "ComprehensionExercise" WHERE id=${L[EX].cid}`;
  await set('ComprehensionExercise', c15.id, 'passageTranslated',
    'Салом! Номи ман Анна аст. Ман аз Англия ҳастам. Ман дар Лондон ҳастам. Ман бистсола ҳастам. Ман бо англисӣ ва русӣ гап мезанам. Дӯсти ман Карим аст. Ӯ аз Тоҷикистон аст. Ӯ дар Душанбе аст. Ӯ нуздаҳсола аст. Ӯ бо тоҷикӣ ва русӣ гап мезанад.',
    'Д15 passageTranslated (F3, F4, F6)');
}
for (const [lo, ru, tr] of [
  [1, 'Менеджер', 'Ӯ мудир аст.'],
  [2, 'Инженер', 'Ӯ муҳандис аст.'],
  [3, 'Продавец', 'Ӯ фурӯшанда аст.'],
  [3, 'Одноклассник', 'Ӯ ҳамсинфи ман аст.'],
  [5, 'Место', 'Ин ҷои хуб аст.'],
]) await set('Word', await word(lo, ru), 'exampleTrans', tr, `Д${lo + 1} «${ru}».exampleTrans (F14/F17)`);
await set('Word', await word(0, 'Старый'), 'translation', 'Пир, кӯҳна', 'Д1 «Старый».translation (F15)');
await set('Word', await word(0, 'Лет'), 'translation', 'Сол (баъди рақам)', 'Д1 «Лет».translation (F16)');
{
  const q = await questions(REVIEW, 6);
  const F18 = [
    [0, ["Как спросить: 'Ту аз куҷо ҳастӣ?'", 'Как спросить: «Ту аз куҷо ҳастӣ?»'], 'Как спросить: «Ту аз куҷо ҳастӣ?»'],
    [1, ["Какое слово означает 'Шаҳр'?", 'Какое слово означает «Шаҳр»?'], 'Какое слово означает «Шаҳр»?'],
    [2, ["Как сказать 'Зодрӯз' по-русски?", 'Как сказать «Зодрӯз» по-русски?'], 'Как сказать «Зодрӯз» по-русски?'],
    [4, ["Что означает слово 'Язык'?", 'Что означает слово «Язык»?'], 'Что означает слово «Язык»?'],
    [5, ["Переведите: 'Ман даҳсола ҳастам.'", 'Переведите: «Ман даҳсола ҳастам.»'], 'Переведите: «Ман даҳсола ҳастам.»'],
  ];
  for (const [i, oneOf, want] of F18) {
    expectQ(q[i], oneOf, `Д14 Q${i + 1}`);
    await set('ComprehensionQuestion', q[i].id, 'question', want, `Д14 Q${i + 1} question (F18)`);
  }
  // «Праздник» ҳеҷ ҷо таълим нашудааст → «Возраст» (Д1)
  await setOptions(q[2].id, ['Возраст', 'День рождения', 'Сегодня'], 'Д14 Q3 options («Праздник» → «Возраст»)');
  await set('ComprehensionQuestion', q[2].id, 'correctIndex', 1, 'Д14 Q3 correctIndex');
  const e = await questions(EX, 8);
  expectQ(e[4], ["'Кишвар' по-русски:", '«Кишвар» по-русски:'], 'Д15 Q5');
  await set('ComprehensionQuestion', e[4].id, 'question', '«Кишвар» по-русски:', 'Д15 Q5 question (F18)');
}

// ═══ R14 · транскрипсия ═══
console.log('\n── R14 · транскрипсияи тоҷикӣ ──');
for (const [lo, ru, t] of [
  [0, 'Лет', 'лет'], [1, 'Гость', 'гост'], [4, 'ОАЭ', 'о-а-э'], [5, 'Здесь', 'здес'], [3, 'Холост', 'хало́ст'],
]) await set('Word', await word(lo, ru), 'ipaTajik', t, `Д${lo + 1} «${ru}».ipaTajik`);

console.log(`\n  Аллакай дуруст: ${already}`);
done(changed, APPLY ? 'Навбатӣ: _ru-m2-media.mjs' : '');
