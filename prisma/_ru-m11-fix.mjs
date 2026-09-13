// МОДУЛИ 11-и РУСӢ (A1) «Здоровье и общение» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module11_v2.md` (13.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 10` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09).
// Калимаҳои иваз мешуда (R4), «Таблетка» = «Ҳаб», матнҳо, муколама ва сабтҳо — `_ru-m11-media.mjs`.
// ⚠️ «Таблетка» ин ҷо иваз НАМЕШАВАД: «Пилюля» ҳоло «Ҳаб» аст → ду «Ҳаб» дар Д7 бозии мувофиқатро
//    қулф мекард (ниг. хотираи ramz-translation-collision). Ҳарду дар як скрипт, баъд аз иваз.
//
//   node prisma/_ru-m11-fix.mjs           # dry-run
//   node prisma/_ru-m11-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const sql = connect();
banner('RU · A1 · Модули 11 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[10].id;
const lessons = await sql`SELECT id,"order",title,"titleTranslated" tt,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 16) throw new Error(`Модули 11 бояд 16 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[9].gid || !L[10].cid || !L[11].cid || !L[12].did || !L[13].cid || !L[15].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const regen = [];
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  ComprehensionExercise: ['title', 'titleTranslated'],
  Dialogue: ['title'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation', 'audioUrl'],
};
const JSONCOLS = new Set(['options']);

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
const set = (t, id, c, v, label) => setRow(t, id, { [c]: v }, label);
const norm = (s) => (s ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
  WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 60) throw new Error(`модул: ${allWords.length} калима`);
const REPLACED = new Set(['Кисть', 'Нездоровый', 'Пилюля', 'Экстренная ситуация', 'Таблетка']);
const byWord = (w) => {
  if (REPLACED.has(w)) throw new Error(`«${w}» дар media иваз мешавад`);
  const r = allWords.filter((x) => x.word === w);
  if (!r.length) throw new Error(`калима нест: ${w}`);
  return r;
};

// ═══ F2–F4, F7 · тарҷумаҳо ═══
console.log('\n── тарҷумаҳо ──');
const TR = {
  'Фармацевт': 'Дорухонадор',          // буд «Дорусоз» (истеҳсолкунандаи дору)
  'Сироп': 'Шарбати дору',              // буд «Шарбат» (нӯшокӣ)
  'Бинт': 'Бинт (дока)',                // буд «Бандина»
  'Приём': 'Навбат (назди духтур)',     // буд «Вохӯрӣ»
};
for (const [w, t] of Object.entries(TR)) for (const row of byWord(w)) await set('Word', row.id, 'translation', t, `Д${row.lo + 1} «${w}» → «${t}»`);

// ═══ R5 · F5 · F6 · мисолҳо ═══
console.log('\n── R5 · мисолҳо ──');
const EX = {
  'Рот': ['Откройте рот, пожалуйста.', 'Лутфан, даҳонатонро кушоед.'],
  'Лекарство': ['Где лекарство?', 'Дору дар куҷост?'],
  'Крем': ['Крем белый.', 'Малҳам сафед аст.'],
  'Скорая помощь': ['Скорая помощь едет.', 'Ёрии таъҷилӣ меояд.'],
  'Помощь': ['Нужна помощь!', 'Кӯмак лозим аст!'],
  'Авария': ['Там авария.', 'Он ҷо садама аст.'],
  'Звонить': ['Я звоню врачу.', 'Ман ба духтур занг мезанам.'],
  'Опасность': ['Опасность!', 'Хатар!'],
  'Безопасный': ['Это безопасное место.', 'Ин ҷои бехатар аст.'],
  'Усталый': ['Он усталый.', 'Ӯ монда аст.'],
};
for (const [w, [ex, tr]] of Object.entries(EX)) {
  const toks = norm(ex).split(' ');
  for (const part of w.toLowerCase().split(' ')) {
    if (!toks.some((t) => t.startsWith(part.slice(0, 4)))) throw new Error(`мисол калимаи худро надорад: ${w}`);
  }
  if (toks.some((t) => /^(прими|используй|вызови|произошл|позвони|помогите)/.test(t))) throw new Error(`«${w}»: феъли наомӯхта`);
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}
const EXTR = {
  'Рука': 'Дасти ӯ қавӣ аст.',              // буд «Бозуи ӯ»
  'Болеть': 'Дасти ман дард мекунад.',     // буд «Бозуи ман»
  'Отдых': 'Ба ту истироҳат лозим аст.',   // буд «Ту истироҳат лозим дорӣ»
  'Приём': 'Ман назди духтур навбат дорам.',
};
for (const [w, t] of Object.entries(EXTR)) for (const row of byWord(w)) await set('Word', row.id, 'exampleTrans', t, `Д${row.lo + 1} «${w}».exampleTrans`);

// ═══ R10 · эмоҷӣ ═══
// «Живот» ва «Боль в горле» дар `_kNonPicturableWords` / эмоҷии манъ — савол фаъол намешавад.
console.log('\n── R10 · эмоҷӣ ──');
const EMO = { 'Живот': '🧍', 'Боль в горле': '🤒', 'Температура': '🥵' };
for (const [w, e] of Object.entries(EMO)) for (const row of byWord(w)) await set('Word', row.id, 'emoji', e, `Д${row.lo + 1} «${w}».emoji`);

// ═══ R7 · F8 · унвонҳо ═══
console.log('\n── R7 · унвонҳо ──');
{
  if (!['Сохтмони грамматикӣ', 'Грамматика: У меня болит…'].includes(L[9].title)) throw new Error(`Д10 унвон: «${L[9].title}»`);
  await set('Lesson', L[9].id, 'title', 'Грамматика: У меня болит…', 'Д10 унвони русӣ (буд «Сохтмони грамматикӣ»)');
  const w11 = { title: 'Чтение: В аптеке', titleTranslated: 'Хониш: дар дорухона' };
  if (!['Сохтани ҷумлаҳои саломатӣ', w11.title].includes(L[10].title)) throw new Error(`Д11 унвон: «${L[10].title}»`);
  await setRow('Lesson', L[10].id, w11, 'Д11 унвони дарс');
  await setRow('ComprehensionExercise', L[10].cid, w11, 'Д11 унвони машқи хониш');
  const w12 = { title: 'Аудирование: Авария', titleTranslated: 'Шунавоӣ: садама' };
  if (!['Аудирование: У врача', w12.title].includes(L[11].title)) throw new Error(`Д12 унвон: «${L[11].title}»`);
  await setRow('Lesson', L[11].id, w12, 'Д12 унвони дарс (матни нав — садама)');
  await setRow('ComprehensionExercise', L[11].cid, w12, 'Д12 унвони машқи шунавоӣ');
  const [d] = await sql`SELECT title FROM "Dialogue" WHERE id=${L[12].did}`;
  if (!['At the Doctor', 'Разговор с врачом'].includes(d.title)) throw new Error(`Д13 унвон: «${d.title}»`);
  await set('Dialogue', L[12].did, 'title', 'Разговор с врачом', 'Д13 унвони муколама (англисӣ → русӣ)');
  await set('Lesson', L[15].id, 'titleTranslated', 'Дандони Сара дард мекунад', 'Д16 унвон: имлои «соро»');
}

// ═══ R9 · Д10 машқи 8 ═══
console.log('\n── R9 · Д10 ──');
{
  const oldPrompt = 'Ба савол гузаронед: Ты можешь мне помочь.';
  const want = {
    prompt: 'Ба «у неё» гузаронед: У меня болит голова.',
    promptTranslated: 'у меня → у неё.',
    answer: 'У неё болит голова.',
    explanation: '«У меня» → «у неё». Феъли «болит» тағйир намеёбад — он ба «голова» мувофиқ аст.',
  };
  const r = await sql`SELECT id,type,prompt,answer FROM "GrammarExercise" WHERE "topicId"=${L[9].gid} AND prompt = ANY(${[oldPrompt, want.prompt]})`;
  if (r.length !== 1) throw new Error(`Д10 машқи 8: ${r.length}`);
  const before = exerciseSentence(r[0], 'ru').text;
  const after = exerciseSentence({ type: r[0].type, prompt: want.prompt, answer: want.answer }, 'ru');
  if (!after.text) throw new Error(`Д10 машқи 8: ҷумлаи аудио сохта намешавад (${after.reason})`);
  if (before !== after.text) {
    regen.push(r[0].id);
    console.log(`      (аудио: «${before}» → «${after.text}» — аз нав сабт мешавад)`);
    await setRow('GrammarExercise', r[0].id, { ...want, audioUrl: null }, 'Д10 машқи 8: ҷавоб ба худи савол баробар буд');
  } else await setRow('GrammarExercise', r[0].id, want, 'Д10 машқи 8');
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
if (regen.length) console.log(`аудиои машқ аз нав: node prisma/_grammar-ex-audio.mjs --gen --lang ru --regen ${regen.join(',')}`);
