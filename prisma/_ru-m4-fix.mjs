// МОДУЛИ 4-и РУСӢ (A1) «Рақамҳо ва вақт» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module4_v2.md` (11.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 3` исбот кард, ки ҳар ҷузъ танҳо ба ЯК
// дарси ҳамин модул тааллуқ дорад. Ба муҳаррик ва забонҳои дигар даст намезанад.
// Мисолҳои калима аудио надоранд (`Word` сутуни аудиои мисол надорад) — бехатар иваз мешаванд.
// Матнҳои дорои аудио (Д13, Д15, Д17, муколама) — дар `_ru-m4-media.mjs`.
//
//   node prisma/_ru-m4-fix.mjs           # dry-run
//   node prisma/_ru-m4-fix.mjs --apply
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 4 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${mods[3].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 4 бояд 17 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[9].gid || !L[10].gid || !L[11].cid || !L[13].did || !L[16].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'ipaTajik', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  GrammarTopic: ['explanation'],
  GrammarRule: ['note'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation'],
  ComprehensionExercise: ['passageTranslated'],
  ComprehensionQuestion: ['question', 'questionTranslated', 'options', 'correctIndex', 'explanation'],
  DialogueLine: ['translation'],
};
const JSONCOLS = new Set(['options']);
const cuidLike = () => {
  const a = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = '';
  for (const b of randomBytes(16)) s += a[b % 36];
  return `c${Date.now().toString(36).slice(-8)}${s}`;
};

/** Як ё якчанд сутуни ЯК сатр бо ЯК UPDATE (answer + options + correctIndex ҳамеша якҷоя). */
async function setRow(table, id, want, label) {
  const cols = Object.keys(want);
  for (const c of cols) if (!ALLOW[table]?.includes(c)) throw new Error(`иҷозат нест: ${table}.${c}`);
  const sel = `SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM "${table}" WHERE id=$1`;
  const r = await sql.query(sel, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  const same = (row, c) => JSON.stringify(row[c]) === JSON.stringify(want[c]);
  if (cols.every((c) => same(r[0], c))) { already++; return; }
  console.log(`  • ${label}`);
  for (const c of cols) if (!same(r[0], c)) console.log(`      ${c}: ${JSON.stringify(r[0][c])}\n         → ${JSON.stringify(want[c])}`);
  changed++;
  if (!APPLY) return;
  const sets = cols.map((c, i) => `"${c}"=$${i + 2}${JSONCOLS.has(c) ? '::jsonb' : ''}`).join(', ');
  await sql.query(`UPDATE "${table}" SET ${sets} WHERE id=$1`, [id, ...cols.map((c) => (JSONCOLS.has(c) ? JSON.stringify(want[c]) : want[c]))]);
  const [a] = await sql.query(sel, [id]);
  if (!cols.every((c) => same(a, c))) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}
const set = (table, id, col, val, label) => setRow(table, id, { [col]: val }, label);
async function word(lo, ru) {
  const w = await sql`SELECT id FROM "Word" WHERE "lessonId"=${L[lo].id} AND word=${ru}`;
  if (w.length !== 1) throw new Error(`«${ru}» дар Д${lo + 1}: ${w.length}`);
  return w[0].id;
}
async function questions(lo) {
  return sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[lo].cid} ORDER BY "order", id`;
}
function expectQ(q, oneOf, label) {
  if (!q || !oneOf.includes(q.question)) throw new Error(`${label}: саволи ғайричашмдошт «${q?.question}»`);
}

// ═══ R2 · транскрипсияи тоҷикӣ — 61 аз 61 холӣ буд ═══
// Конвенсияи М1–М3: зада бо «◌́», ь намеояд (мат, гост), о/е бе зада → а/и, ы → и, ц → тс,
// -я-и охири бе зада → а (и́ма), ия/ию → ийа/ийу, ҳарфи дугона мемонад (гру́ппа), ҷарангнок дар охир → беҷаранг.
// «-дцать» = «-тсат»: ҳамин транскрипсия ба хонанда нишон медиҳад, ки «д» шунида намешавад.
console.log('\n── R2 · транскрипсия ──');
const IPA = {
  0: { Один: 'ади́н', Два: 'два', Три: 'три', Четыре: 'чити́ри', Пять: 'пят' },
  1: { Шесть: 'шест', Семь: 'сем', Восемь: 'во́сим', Девять: 'де́вит', Десять: 'де́сит' },
  2: { Одиннадцать: 'ади́ннатсат', Двенадцать: 'двина́тсат', Тринадцать: 'трина́тсат', Четырнадцать: 'чити́рнатсат', Пятнадцать: 'питна́тсат' },
  3: { Шестнадцать: 'шисна́тсат', Семнадцать: 'симна́тсат', Восемнадцать: 'васимна́тсат', Девятнадцать: 'дивитна́тсат', Двадцать: 'два́тсат' },
  4: { Тридцать: 'три́тсат', Сорок: 'со́рак', Пятьдесят: 'пидися́т', Шестьдесят: 'шиздися́т', Семьдесят: 'се́мдисит', Восемьдесят: 'во́симдисит', Девяносто: 'дивино́ста', Сто: 'сто' },
  5: { Понедельник: 'паниде́лник', Вторник: 'фто́рник', Среда: 'срида́', Четверг: 'читве́рк', Пятница: 'пя́тнитса', Суббота: 'суббо́та', Воскресенье: 'васкрисе́нйи' },
  6: { Январь: 'йинва́р', Февраль: 'фивра́л', Март: 'март', Апрель: 'апре́л', Май: 'май', Июнь: 'ийу́н' },
  7: { Июль: 'ийу́л', Август: 'а́вгуст', Сентябрь: 'синтя́бр', Октябрь: 'актя́бр', Ноябрь: 'найа́бр', Декабрь: 'дика́бр' },
  8: { Час: 'час', Время: 'вре́ма', День: 'ден', Вечер: 'ве́чир', Ночь: 'ноч', Утро: 'у́тра' },
};
const flat = Object.assign({}, ...Object.values(IPA));
IPA[15] = Object.fromEntries(['Один', 'Семь', 'Тринадцать', 'Восемнадцать', 'Семьдесят', 'Среда', 'Февраль', 'Август'].map((w) => [w, flat[w]]));
// Муҳофиз: ҳар калимаи бисёрҳиҷоӣ ДАҚИҚАН як зада, якҳиҷоӣ — бе зада.
for (const [w, t] of Object.entries(flat)) {
  const vowels = (t.replace(/́/g, '').match(/[аеёиоуыэюя]/g) || []).length;
  const acc = (t.match(/́/g) || []).length;
  if ((vowels > 1 && acc !== 1) || (vowels <= 1 && acc !== 0)) throw new Error(`зада нодуруст: ${w} → ${t} (садонок ${vowels}, зада ${acc})`);
}
const [m3] = await sql`SELECT w."ipaTajik" t FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" WHERE l."moduleId"=${mods[2].id} AND w.word='Отец' LIMIT 1`;
if (!m3.t.includes('́')) throw new Error('конвенсияи зада дар М3 дигар аст — санҷед');
for (const [lo, map] of Object.entries(IPA)) {
  for (const [ru, t] of Object.entries(map)) await set('Word', await word(Number(lo), ru), 'ipaTajik', t, `Д${Number(lo) + 1} «${ru}».ipaTajik`);
}

// ═══ R3 · тарҷумаҳо (+ F2) ═══
console.log('\n── R3 · тарҷумаҳо ──');
await set('Word', await word(8, 'День'), 'translation', 'Рӯз', 'Д9 «День» (буд «Баъд аз зӯҳр»; «Добрый день» = «Рӯз ба хайр»)');
await set('Word', await word(1, 'Девять'), 'translation', 'Нӯҳ', 'Д2 «Девять» (мисолаш «нӯҳсола»)');

// ═══ R4 · R9 · R10 · мисолҳо ═══
// Калимаи дуюм ва шашуми ҳар дарс дар зинаи growing навбати «сохтани ҷумла»-ро мегирад: ҷумла
// бояд 3–8 калима бошад ва ҳадди аксар ЯК калима берун аз калимаҳои ҳамин дарс. Қатори
// «Один, два, три.» маҳз ҳамин аст ва тартиби рақам/рӯз/моҳро машқ мекунад. Ҳамзамон
// навиштани пай дар пайи «Одиннадцать» → «Двенадцать» (сабаби рафтани Lola) аз байн меравад.
console.log('\n── R4/R9/R10 · мисолҳо ──');
const EX = [
  [0, 'Два', 'Один, два, три.', 'Як, ду, се.'],                                   // буд «две сестры» — «две» ҳеҷ ҷо
  [1, 'Семь', 'Шесть, семь, восемь.', 'Шаш, ҳафт, ҳашт.'],
  [2, 'Двенадцать', 'Одиннадцать, двенадцать, тринадцать.', 'Ёздаҳ, дувоздаҳ, сездаҳ.'],
  [2, 'Четырнадцать', 'Ему четырнадцать лет.', 'Ӯ чордаҳсола аст.'],
  [3, 'Шестнадцать', 'Ему шестнадцать лет.', 'Ӯ шонздаҳсола аст.'],
  [3, 'Семнадцать', 'Шестнадцать, семнадцать, восемнадцать.', 'Шонздаҳ, ҳабдаҳ, ҳаждаҳ.'],
  [3, 'Девятнадцать', 'Ей девятнадцать лет.', 'Ӯ нуздаҳсола аст.'],
  [4, 'Сорок', 'Тридцать, сорок, пятьдесят.', 'Сӣ, чил, панҷоҳ.'],               // буд «Моему отцу»
  [4, 'Пятьдесят', 'Мне пятьдесят лет.', 'Ман панҷоҳсола ҳастам.'],               // буд «Моей матери»
  [4, 'Шестьдесят', 'Ей шестьдесят лет.', 'Ӯ шастсола аст.'],                     // буд «Моему дедушке»
  [4, 'Восемьдесят', 'Семьдесят, восемьдесят, девяносто.', 'Ҳафтод, ҳаштод, навад.'],
  [5, 'Вторник', 'Понедельник, вторник, среда.', 'Душанбе, сешанбе, чоршанбе.'],
  [5, 'Среда', 'Сегодня среда, завтра четверг.', 'Имрӯз чоршанбе, пагоҳ панҷшанбе.'],
  [5, 'Суббота', 'Пятница, суббота, воскресенье.', 'Ҷумъа, шанбе, якшанбе.'],
  [6, 'Январь', 'Январь — холодный месяц.', 'Январ моҳи сард аст.'],             // буд «в январе» — пеш аз қоида
  [6, 'Февраль', 'Январь, февраль, март.', 'Январ, феврал, март.'],
  [6, 'Апрель', 'Сейчас апрель.', 'Ҳоло апрел аст.'],
  [6, 'Июнь', 'Апрель, май, июнь.', 'Апрел, май, июн.'],
  [7, 'Август', 'Июль, август, сентябрь.', 'Июл, август, сентябр.'],
  [7, 'Сентябрь', 'Сентябрь — хороший месяц.', 'Сентябр моҳи хуб аст.'],
  [7, 'Декабрь', 'Октябрь, ноябрь, декабрь.', 'Октябр, ноябр, декабр.'],
  [8, 'Час', 'У меня один час.', 'Ман як соат вақт дорам.'],                      // буд «три часа» — «час» дар мисол набуд
  // «Время» ҚАСДАН дар ин ҷо нест: «Сколько сейчас времени?» мемонад — ибораи Д12/Д14 (ниг. `_ru-m4-fix2.mjs`).
  [8, 'Утро', 'Утро, день, вечер, ночь.', 'Субҳ, рӯз, шом, шаб.'],
];
const byWord = Object.fromEntries(EX.map(([, w, e, t]) => [w, [e, t]]));
for (const w of ['Семь', 'Среда', 'Февраль', 'Август']) EX.push([15, w, ...byWord[w]]); // нусхаҳои дарси навиштан
for (const [lo, ru, ex, tr] of EX) {
  if (!ex.toLowerCase().replace(/[^а-яё\s]/g, ' ').split(/\s+/).includes(ru.toLowerCase())) throw new Error(`мисол калимаи худро надорад: ${ru}`);
  await setRow('Word', await word(lo, ru), { example: ex, exampleTrans: tr }, `Д${lo + 1} «${ru}».example`);
}

// ═══ R8 · эмоҷӣ ═══
// Рақамҳо — keycap (ҳамон шакли «1️⃣1️⃣»-и Д3). Рақам исм нест → машқи «Ин чист?» ҳеҷ гоҳ намеояд.
// Моҳҳо — ҳамаашон ЯК 🗓 (Д8 ва Д16 📅 доштанд). Эмоҷии фаслии ягона қасдан НЕ: «Март/Май/Август»
// дар рӯйхатҳои манъи акс нестанд, эмоҷии ягона машқи «Ин чист?»-ро мекушод (🍉 → «Август»).
// Рӯзҳо 📅 мемонанд: рамзи ростқавл нест, рақам бо номи тоҷикӣ мухолиф аст («Душанбе» = «ду»).
console.log('\n── R8 · эмоҷӣ ──');
const [k11] = await sql`SELECT emoji FROM "Word" WHERE "lessonId"=${L[2].id} AND word='Одиннадцать'`;
const SUF = k11.emoji === '1️⃣1️⃣' ? '️⃣' : k11.emoji === '1⃣1⃣' ? '⃣' : null;
if (!SUF) throw new Error(`шакли keycap-и Д3 шинохта нашуд: ${JSON.stringify(k11.emoji)}`);
const kc = (n) => [...String(n)].map((d) => d + SUF).join('');
const [jan] = await sql`SELECT emoji FROM "Word" WHERE "lessonId"=${L[6].id} AND word='Январь'`;
if (!['🗓', '🗓️'].includes(jan.emoji)) throw new Error(`эмоҷии «Январь» ғайричашмдошт: ${jan.emoji}`);
const CAL = jan.emoji;
const EMO = [
  [3, 'Шестнадцать', kc(16)], [3, 'Семнадцать', kc(17)], [3, 'Восемнадцать', kc(18)], [3, 'Девятнадцать', kc(19)],
  [4, 'Тридцать', kc(30)], [4, 'Сорок', kc(40)], [4, 'Пятьдесят', kc(50)], [4, 'Шестьдесят', kc(60)],
  [4, 'Семьдесят', kc(70)], [4, 'Восемьдесят', kc(80)], [4, 'Девяносто', kc(90)], [4, 'Сто', '💯'],
  [15, 'Восемнадцать', kc(18)], [15, 'Семьдесят', kc(70)],
  ...['Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'].map((w) => [7, w, CAL]),
  [15, 'Февраль', CAL], [15, 'Август', CAL],
];
for (const [lo, ru, e] of EMO) await set('Word', await word(lo, ru), 'emoji', e, `Д${lo + 1} «${ru}».emoji`);

// ═══ R12 · унвони Д5 ═══
console.log('\n── R12 · унвон ──');
{
  const [l] = await sql`SELECT title FROM "Lesson" WHERE id=${L[4].id}`;
  if (!['Числа 21-100', 'Числа 30-100'].includes(l.title)) throw new Error(`унвони Д5: «${l.title}»`);
  await setRow('Lesson', L[4].id, { title: 'Числа 30-100', titleTranslated: 'Рақамҳо 30-100' }, 'Д5 унвон (танҳо даҳҳо 30…100 ва «сто»)');
}

// ═══ R4 · R7 · F3 · Д10 «пешояндҳои вақт» ═══
console.log('\n── R4/R7 · Д10 грамматика ──');
{
  const gid = L[9].gid;
  const SECTION = '**Соат ва рақам:** шакли калимаи «час» ба рақам вобаста аст:\n\n'
    + '- **1** → *час* (один час)\n'
    + '- **2, 3, 4** → *часа* (три часа, четыре часа)\n'
    + '- **5–20** → *часов* (восемь часов, двенадцать часов)\n\n'
    + 'Ҳамин қоида барои калимаҳои дигар низ: *четыре книги*, вале *семь книг*.';
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${gid}`;
  let ex = t.explanation;
  if (!ex.includes(SECTION)) {
    const OLD = '*утром, днём, вечером, ночью* (субҳ, рӯз, шом, шабона)\n';
    if (ex.split(OLD).length !== 2) throw new Error('Д10: сатри «утром, днём…» ёфт нашуд');
    // Бахши нав ҲАМЧУН банди алоҳида ПЕШ АЗ блоки ⚡ — `splitContrastBlocks` блокро то сатри холӣ мегирад.
    ex = ex.replace(OLD, '*утром, днём, вечером, ночью* (субҳ, рӯзона, бегоҳӣ, шабона)\n\n' + SECTION + '\n');
  }
  if ((ex.match(/⚡/g) || []).length !== 1) throw new Error('Д10: блоки ⚡ бояд ягона монад');
  await set('GrammarTopic', gid, 'explanation', ex, 'Д10 тавзеҳ: шаклҳои зарф + бахши «час / часа / часов»');

  const rules = await sql`SELECT id,pattern,note,"order" FROM "GrammarRule" WHERE "topicId"=${gid} ORDER BY "order"`;
  const adv = rules.filter((r) => ['субҳ, рӯз, шом, шабона', 'субҳ, рӯзона, бегоҳӣ, шабона'].includes(r.note));
  if (adv.length !== 1) throw new Error(`Д10: қоидаи «утром…» ${adv.length}`);
  await set('GrammarRule', adv[0].id, 'note', 'субҳ, рӯзона, бегоҳӣ, шабона', 'Д10 қоида: шаклҳои зарф');
  const PAT = '1 час · 2–4 часа · 5–20 часов';
  if (!rules.some((r) => r.pattern === PAT)) {
    const ord = Math.max(...rules.map((r) => r.order)) + 1;
    console.log(`  • Д10 қоидаи НАВ (order ${ord}): «${PAT}»`);
    changed++;
    if (APPLY) {
      await sql`INSERT INTO "GrammarRule" (id,"topicId",pattern,note,"order") VALUES (${cuidLike()},${gid},${PAT},${'Шакли «час» ба рақам вобаста аст.'},${ord})`;
      const n = await sql`SELECT id FROM "GrammarRule" WHERE "topicId"=${gid} AND pattern=${PAT}`;
      if (n.length !== 1) throw new Error('ТАСДИҚ НАШУД: қоидаи нав');
    }
  } else already++;

  // Пештар ҷавоб дар 6 аз 8 «в» буд ва дистракторҳо («на / к / до») ҳеҷ гоҳ омӯзонида нашуда буданд.
  // Акнун: 4 × «в + …», 4 × қисми рӯз бе пешоянд; дистракторҳо танҳо аз маводи ҳамин дарс.
  const GX = [
    { old: 'Школа начинается ___ восемь часов.', prompt: 'Школа начинается ___.', pt: 'Мактаб соати ҳашт сар мешавад.',
      answer: 'в восемь часов', options: ['восемь часов', 'утром', 'в восемь часов'], ex: 'Соат → «в»: «в восемь часов». Бе «в» ҷумла нодуруст аст.' },
    { old: 'Мы идём в парк ___ воскресенье.', prompt: 'Мы идём в парк ___.', pt: 'Мо бегоҳӣ ба боғ меравем.',
      answer: 'вечером', options: ['вечером', 'в вечер', 'вечер'], ex: 'Қисми рӯз — бе пешоянд, шакли махсус: «вечером» (бегоҳӣ).' },
    { old: 'Мой день рождения ___ мае.', prompt: 'Мой день рождения ___.', pt: 'Зодрӯзи ман моҳи май аст.',
      answer: 'в мае', options: ['в мае', 'май', 'днём'], ex: 'Моҳ → «в»: «в мае».' },
    { old: 'Я делаю уроки ___.', prompt: 'Я делаю уроки ___.', pt: 'Ман вазифаро рӯзона иҷро мекунам.',
      answer: 'днём', options: ['день', 'днём', 'в день'], ex: 'Қисми рӯз — бе пешоянд, шакли махсус: «днём» (рӯзона).' },
    { old: 'Урок начинается ___ девять.', prompt: 'Я встаю ___.', pt: 'Ман субҳ мехезам.',
      answer: 'утром', options: ['в утро', 'утро', 'утром'], ex: 'Қисми рӯз — бе пешоянд, шакли махсус: «утром» (субҳ).' },
    { old: 'Экзамен ___ пятницу.', prompt: 'Экзамен ___.', pt: 'Имтиҳон рӯзи ҷумъа аст.',
      answer: 'в пятницу', options: ['пятница', 'в пятницу', 'ночью'], ex: 'Рӯзи ҳафта → «в»: «в пятницу».' },
    { old: 'Звёзды красивы ___.', prompt: 'Звёзды красивы ___.', pt: 'Ситораҳо шабона зебоянд.',
      answer: 'ночью', options: ['ночь', 'ночью', 'в ночь'], ex: 'Қисми рӯз — бе пешоянд, шакли махсус: «ночью» (шабона).' },
    { old: 'Холодно ___ феврале.', prompt: 'Холодно ___.', pt: 'Моҳи феврал хунук аст.',
      answer: 'в феврале', options: ['в феврале', 'февраль', 'вечером'], ex: 'Моҳ → «в»: «в феврале».' },
  ];
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
  for (const g of GX) {
    if (g.options.filter((o) => norm(o) === norm(g.answer)).length !== 1) throw new Error(`ҷавоб дар вариантҳо: ${g.prompt}`);
    if (new Set(g.options.map(norm)).size !== g.options.length) throw new Error(`варианти такрорӣ: ${g.prompt}`);
    const r = await sql`SELECT id,type FROM "GrammarExercise" WHERE "topicId"=${gid} AND prompt = ANY(${[g.old, g.prompt]})`;
    if (r.length !== 1 || r[0].type !== 'choose') throw new Error(`Д10 машқи «${g.old}»: ${r.length} ${r[0]?.type}`);
    await setRow('GrammarExercise', r[0].id, { prompt: g.prompt, promptTranslated: g.pt, answer: g.answer, options: g.options, explanation: g.ex },
      `Д10 «${g.prompt}» → «${g.answer}»`);
  }
}

// ═══ F6 · Д11 ═══
console.log('\n── F6 · Д11 ──');
{
  const r = await sql`SELECT id FROM "GrammarExercise" WHERE "topicId"=${L[10].gid} AND prompt=${'Ислоҳ кунед: Я была счастлив. (мард)'}`;
  if (r.length !== 1) throw new Error(`Д11 transform: ${r.length}`);
  await set('GrammarExercise', r[0].id, 'promptTranslated', 'Шакл нодуруст аст.', 'Д11 transform: «ғалат» → «нодуруст»');
}

// ═══ Д12 (хониш): саволи 3 + F9 ═══
console.log('\n── Д12 хониш ──');
{
  const [c] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
  if (!c.passage.includes('Мой день рождения в июле')) throw new Error('Д12: матн ғайричашмдошт');
  const q = await questions(11);
  expectQ(q[2], ['В каком месяце день рождения?', 'Когда день рождения?'], 'Д12 Q3');
  await setRow('ComprehensionQuestion', q[2].id, { question: 'Когда день рождения?', questionTranslated: 'Зодрӯз кай аст?',
    options: ['В июне', 'В августе', 'В июле'], correctIndex: 2 }, 'Д12 Q3: «В каком месяце» (шаклҳои наомӯхта) → «Когда»');
  const [p] = await sql`SELECT "passageTranslated" t FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
  if (!p.t.includes('Зодрӯзи ман моҳи июл аст.')) {
    if (p.t.split('Зодрӯзи ман дар июл аст.').length !== 2) throw new Error('Д12 тарҷума: пора ёфт нашуд');
    await set('ComprehensionExercise', L[11].cid, 'passageTranslated', p.t.replace('Зодрӯзи ман дар июл аст.', 'Зодрӯзи ман моҳи июл аст.'), 'Д12 тарҷума «дар июл» → «моҳи июл»');
  } else already++;
}

// ═══ R13 · F10 · F11 · имтиҳон Q4–Q8 (ба матн вобаста нестанд) ═══
console.log('\n── R13 · имтиҳон ──');
{
  const q = await questions(16);
  if (q.length !== 8) throw new Error(`имтиҳон: ${q.length} савол`);
  const EXQ = [
    [3, "Переведите 'Ҳаштод':", { question: 'Переведите «Ҳаштод»:' }],
    [4, "Переведите 'Чоршанбе':", { question: 'Переведите «Чоршанбе»:' }],
    [5, "Переведите 'Шаб ба хайр':", { question: 'Переведите «Шаб ба хайр»:' }],
    [6, "Переведите 'Понздаҳ':", { question: 'Переведите «Понздаҳ»:', questionTranslated: '«Понздаҳ»-ро тарҷума кунед.',
      options: ['Пятьдесят', 'Четырнадцать', 'Пятнадцать'], correctIndex: 2,
      explanation: 'Понздаҳ = пятнадцать (15). Диққат: четырнадцать = 14, пятьдесят = 50.' }],
    [7, "Переведите 'Ҷумъа':", { question: 'Переведите «Ҷумъа»:', questionTranslated: '«Ҷумъа»-ро тарҷума кунед.',
      options: ['Пятница', 'Суббота', 'Воскресенье'], correctIndex: 0,
      explanation: 'Ҷумъа = пятница. Диққат: суббота = шанбе, воскресенье = якшанбе.' }],
  ];
  for (const [i, old, want] of EXQ) {
    expectQ(q[i], [old, want.question], `имтиҳон Q${i + 1}`);
    await setRow('ComprehensionQuestion', q[i].id, want, `имтиҳон Q${i + 1}`);
  }
}

// ═══ F9 · муколама ═══
console.log('\n── F9 · муколама ──');
{
  const r = await sql`SELECT id FROM "DialogueLine" WHERE "dialogueId"=${L[13].did} AND text=${'Мой день рождения в июне.'}`;
  if (r.length !== 1) throw new Error(`муколама: ${r.length}`);
  await set('DialogueLine', r[0].id, 'translation', 'Зодрӯзи ман моҳи июн аст.', 'Д14: «дар моҳи июн» → «моҳи июн»');
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
