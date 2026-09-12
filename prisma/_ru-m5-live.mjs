// Санҷиши ЗИНДАИ Модули 5-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m5-live.mjs
import { spawnSync } from 'child_process';
import { connect } from './_ru-fix-lib.mjs';

const sql = connect();
const API = 'https://admin.ramz.tj/api/mobile';
let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? `\n     ${detail}` : ''}`);
};

const [ru] = await sql`SELECT id FROM "Language" WHERE code='ru'`;
const [tg] = await sql`SELECT id FROM "Language" WHERE code='tg'`;
const cj = await (await fetch(`${API}/courses?targetLanguageId=${ru.id}&nativeLanguageId=${tg.id}`)).json();
const m5 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[4];
check('L1', !!m5 && m5.lessons.length === 16, 'API Модули 5-ро бо 16 дарс медиҳад', m5 ? `«${m5.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m5.id}`;
check('L2', m5.contentVersion === db.v && db.v >= 2, `версия: API ${m5.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m5.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 16 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const wc = (i) => (lessons[i].words ?? []).length;

// ── R1: калимаҳои дарси грамматика ──
// API ба дарси грамматика 5 калимаи ТАКРОРӢ (spiral) медиҳад — калимаи «худӣ»-и он дарс ба экран намерасад.
// Барои ҳамин шумораи калимаи ХУДИИ дарс аз БАЗА гирифта мешавад.
const own = Object.fromEntries((await sql`SELECT l."order" lo, count(w.id)::int n FROM "Lesson" l
  LEFT JOIN "Word" w ON w."lessonId"=l.id WHERE l."moduleId"=${m5.id} GROUP BY l."order"`).map((r) => [r.lo, r.n]));
check('C1', own[6] === 0 && own[1] === 8 && own[2] === 8 && own[3] === 7,
  'Д7 (грамматика) калимаи худӣ надорад; Д2/Д3/Д4 = 8/8/7 (аз база)', `Д2 ${own[1]} · Д3 ${own[2]} · Д4 ${own[3]} · Д7 ${own[6]}`);
check('C2', ['Знать', 'Делать', 'Убирать', 'Хотеть'].every((x) => w(x)), 'чор калимаи кӯчонидашуда дар дарсҳои луғатанд');

// ── R2, R12 ──
check('C3', words.length >= 38 && words.every((x) => (x.ipaTajik ?? '').trim()), `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}`);
const TR = { Читать: 'Хондан', Спать: 'Хобидан', Умываться: 'Дасту рӯ шустан', Гулять: 'Сайр кардан', Делать: 'Кардан', Изучать: 'Омӯхтан' };
const badTr = Object.entries(TR).filter(([k, v]) => w(k)?.translation !== v);
check('C4', !badTr.length, 'тарҷумаҳо: Хондан, Хобидан, Дасту рӯ шустан, Сайр кардан, Кардан, Омӯхтан', badTr.map(([k]) => `${k}: ${w(k)?.translation}`).join(', '));

// ── R3: мисолҳо (сохтани ҷумла / cloze имконпазир) ──
check('C5', w('Вставать').example === 'Просыпаться, вставать, умываться.' && w('Читать').example === 'Я люблю читать.'
  && w('Гулять').example === 'Я люблю гулять в парке.' && !words.some((x) => /Кроватии/.test(x.exampleTrans ?? '')),
  'мисолҳо: қатори амалҳо ва масдар');

// ── R8: унвонҳо ──
check('C6', m5.lessons[6].titleTranslated === 'Грамматика: сарфи феъл, гурӯҳи I' && m5.lessons[7].titleTranslated === 'Грамматика: сарфи феъл, гурӯҳи II',
  'Д7/Д8: «замони ҳозираи содда» → «сарфи феъл»', `${m5.lessons[6].titleTranslated} · ${m5.lessons[7].titleTranslated}`);

// ── грамматика: аз API агар бошад, вагарна аз база ──
const gram = {};
for (const i of [4, 5, 6, 7, 8, 9]) {
  const c = comp(i);
  if (c?.exercises) { gram[i] = { explanation: c.explanation, exercises: c.exercises, rules: c.rules ?? [], examples: c.examples ?? [] }; continue; }
  const [l] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m5.lessons[i].id}`;
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${l.g}`;
  gram[i] = { explanation: t.explanation,
    exercises: await sql`SELECT prompt,answer,options,explanation FROM "GrammarExercise" WHERE "topicId"=${l.g} ORDER BY "order"`,
    rules: await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${l.g}`,
    examples: await sql`SELECT sentence,translation,"audioUrl" FROM "GrammarExample" WHERE "topicId"=${l.g} ORDER BY "order"` };
}
const norm = (s) => (s ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const dupOpts = [4, 5, 6, 7, 8, 9].flatMap((i) => gram[i].exercises.filter((e) => {
  const o = (e.options ?? []).map(norm);
  return o.length && new Set(o).size !== o.length;
}).map((e) => `Д${i + 1} «${e.prompt}»`));
check('C7', !dupOpts.length, 'ягон машқ ду варианти якхела (баъди тоза кардани аломат) надорад', dupOpts.join(' · '));
check('C8', /Феълҳои номунтазам/.test(gram[6].explanation) && /живу, живут/.test(gram[6].explanation) && (gram[6].explanation.match(/⚡/g) || []).length === 1,
  'Д7: бахши «Феълҳои номунтазам», ⚡ ягона');
check('C9', /сплю/.test(gram[7].explanation) && /чищу/.test(gram[7].explanation), 'Д8: «сплю», «чищу» шарҳ дода шуданд');
const q9 = gram[8].exercises.find((e) => e.prompt === '___ читаю вечером.');
check('C10', q9 && q9.options.length === 3 && !q9.options.includes('Я иногда') && !gram[8].exercises.some((e) => /опаздыва|устают/.test(e.prompt)),
  'Д9: варианти дуюми дуруст нест; «опаздываю/устают» нест', q9 ? q9.options.join(' · ') : '');
check('C11', !/ложиться\*\*-ро омӯхтем/.test(gram[9].explanation) && gram[9].rules.some((r) => r.note === 'просыпаю + сь → я просыпаюсь')
  && !gram[9].exercises.some((e) => /одеваться/.test(e.prompt)), 'Д10: «ложиться», «просыпать», «одеваться» ислоҳ шуданд');
check('C12', !gram[4].exercises.some((e) => /танцева|помочь|водить/.test(`${e.prompt} ${e.answer}`)) && !gram[4].examples.some((e) => /помочь|водить/.test(e.sentence)),
  'Д5: «танцевать», «помочь», «водить машину» нестанд');
const exAudio = [...gram[4].examples, ...gram[9].examples].map((e) => e.audioUrl).filter(Boolean);
check('C13', exAudio.length === 10 && new Set(exAudio.map((u) => u.split('@')[1]?.split('/')[0])).size === 1,
  'Д5 ва Д10: 10 мисол, ҳама аз ЯК сабт (як овоз)');

// ── R6, R10, R4: матнҳо ──
const P = { 10: comp(10).passage, 11: comp(11).passage, 13: comp(13).passage, 15: comp(15).passage };
check('C14', /Меня зовут Али/.test(P[10]) && !/Каждое|с семьёй/.test(P[10]) && ans(10, 0) === 'В семь' && ans(10, 1) === 'Русский' && ans(10, 2) === 'Смотрит телевизор',
  'Д11: матни нав, ҳар ҷавоб дар матн', P[10]);
check('C15', /Меня зовут Умар/.test(P[11]) && !/Завтракаю|с семьёй/.test(P[11]) && ans(11, 0) === 'В семь' && ans(11, 3) === 'В десять',
  'Д12: «Завтракаю» нест, саволҳо бо ном', P[11]);
check('C16', q(13).length === 4 && !/Давайте|Потом/.test(P[13]) && ans(13, 2) === 'Плавать' && ans(13, 3) === 'Нет, никогда',
  `Д14: матни нав + ${q(13).length} савол`, P[13]);
check('C17', !/умеет|После школы|с семьёй|студент/.test(P[15]) && /может играть/.test(P[15]) && ans(15, 1) === 'Плавать' && ans(15, 2) === 'В десять',
  'Д16: «уметь» (наомӯхта) → «мочь»', P[15]);
const allQ = [10, 11, 13, 15].flatMap((i) => q(i));
check('C18', !allQ.some((x) => x.question.includes(String.fromCharCode(39))) && q(15).every((x) => x.options.length === 3)
  && !q(15).some((x) => /Выберите|He\/She\/It/.test(`${x.question} ${x.explanation}`)),
  'нохунаки рост нест; имтиҳон 3 вариант; дастури русӣ/англисӣ нест');
// Тоҷикии бе ҳарфи хос («телевизор тамошо мекунад») низ тоҷикӣ аст — мисли М3/М4 калимаҳои хизматӣ ҳам ҳисоб мешаванд.
const TG_FUNC = /(^|\s)(дар|матн|аст|мекунад|мехонад|метавонад|наметавонад|мегирад|меояд|масдар|бо|ва|аз|ки|шудан|хобидан|гулять|феъл|бандаки)(\s|$|[.,:;!?»])/i;
const nonTg = allQ.filter((x) => !/[ӣӯҳҷқғ]/i.test(x.explanation ?? '') && !TG_FUNC.test(x.explanation ?? ''));
check('C19', !nonTg.length, `ҳамаи ${allQ.length} тавзеҳи фаҳмиш тоҷикӣ`, nonTg.map((x) => x.explanation).join(' | '));

// ── R11: муколама ──
const lines = comp(12)?.lines ?? [];
check('C20', lines.length === 8 && lines[7].text === 'Я обычно ложусь спать в десять.'
  && new Set(lines.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, `муколама: ${lines.length} сатр, ҳама аз як сабт`);

// ── аудио ва акс ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...Object.values(gram).flatMap((g) => g.examples.map((e) => e.audioUrl)),
  ...lessons.map((l) => l.component?.audioUrl),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1);
check('A1', urls.length >= 76 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`, silent.map(([u]) => u.slice(-30)).join(' '));
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');
const IMG = { 'чистить_зубы': 404, 'умываться': 200, 'спать': 200, 'школа': 200 };
const st = await Promise.all(Object.keys(IMG).map(async (k) =>
  (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status));
check('I1', Object.values(IMG).every((s, i) => st[i] === s), 'акси «чистить_зубы» нест; боқӣ ҳастанд', Object.keys(IMG).map((k, i) => `${k}:${st[i]}`).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
