// Санҷиши ЗИНДАИ Модули 6-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m6-live.mjs
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
const m6 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[5];
check('L1', !!m6 && m6.lessons.length === 17, 'API Модули 6-ро бо 17 дарс медиҳад', m6 ? `«${m6.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m6.id}`;
check('L2', m6.contentVersion === db.v && db.v >= 2, `версия: API ${m6.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m6.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 17 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);

// ── R1, R10 ──
check('C1', words.length >= 56 && words.every((x) => (x.ipaTajik ?? '').trim()), `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}`);
check('C2', w('Пить').translation === 'Нӯшидан' && w('Хочу пить').translation === 'Ташна будан', 'тарҷумаҳо: «Нӯшидан», «Ташна будан»');

// ── R13, R11: мисолҳо ──
check('C3', w('Банан').example === 'Яблоко, банан, виноград.' && w('Обед').example === 'Завтрак, обед, ужин.'
  && w('Молоко').example === 'Вода, молоко, чай.', 'мисолҳои қаторӣ (сохтани ҷумла имконпазир)');
const tg2 = words.map((x) => x.exampleTrans ?? '').join(' | ');
check('C4', !/нағз мебин|Маска ба ман|як афлесун|ба ту писанд аст/.test(tg2), 'тоҷикӣ: «дӯст медорам», «Равғани маска», бе «як афлесун»');

// ── R12 ──
check('C5', w('Капуста').emoji === '🥬' && w('Салат').emoji === '🥗', 'эмоҷӣ: карам 🥬, коҳу 🥗', `${w('Капуста').emoji} ${w('Салат').emoji}`);

// ── грамматика (аз API ё база) ──
const gram = {};
for (const i of [9, 10]) {
  const c = comp(i);
  if (c?.exercises) { gram[i] = { exercises: c.exercises, rules: c.rules ?? [], examples: c.examples ?? [] }; continue; }
  const [l] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m6.lessons[i].id}`;
  gram[i] = {
    exercises: await sql`SELECT prompt,answer,options,explanation FROM "GrammarExercise" WHERE "topicId"=${l.g} ORDER BY "order"`,
    rules: await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${l.g}`,
    examples: await sql`SELECT sentence,translation,"audioUrl" FROM "GrammarExample" WHERE "topicId"=${l.g} ORDER BY "order"`,
  };
}
const gramTxt = [9, 10].map((i) => JSON.stringify(gram[i])).join(' ');
check('C6', !/денег|сахар|кашу|покупает|Нам нужно/.test(gramTxt), 'Д10/Д11: «денег», «сахара», «кашу», «покупает», «Нам нужно» нестанд');
check('C7', gram[9].examples.some((e) => e.translation === 'Шир нест.') && gram[9].examples.some((e) => e.translation === 'Ту об дорӣ?'),
  'Д10 тарҷумаҳо: «Шир нест», «Ту об дорӣ?»');
const exAudio = [...gram[9].examples, ...gram[10].examples].map((e) => e.audioUrl).filter(Boolean);
check('C8', exAudio.length === 10 && new Set(exAudio.map((u) => u.split('@')[1]?.split('/')[0])).size === 1,
  'Д10 ва Д11: 10 мисол, ҳама аз ЯК сабт (як овоз)');

// ── R4, R5, R7, R2, R8: матнҳо ──
const P = { 11: comp(11).passage, 12: comp(12).passage, 14: comp(14).passage, 16: comp(16).passage };
check('C9', q(11)[0].question === 'Что у него есть?' && q(11)[1].question === 'Что он не любит?' && ans(11, 1) === 'Кофе',
  'Д12: ду саволи такрории грамматика → фаҳмиши матн');
check('C10', /Меня зовут Нигина/.test(P[12]) && !/очень|фрукты|после|любимая|мясом/.test(P[12])
  && ans(12, 0) === 'Хлеб и яйцо' && ans(12, 3) === 'Воду', 'Д13: матни нав бе калимаи наомӯхта', P[12]);
check('C11', q(14).length === 4 && !/Давайте|фрукты/.test(P[14]) && ans(14, 2) === 'Воду' && ans(14, 3) === 'немного',
  `Д15: матни нав + ${q(14).length} савол (нӯшокӣ ва грамматика дохил)`, P[14]);
check('C12', !/кухне|каждое|картофелем|морковью|луком|с молоком/.test(P[16]) && /Мяса нет/.test(P[16])
  && ans(16, 0) === 'Нет' && ans(16, 1) === 'Яблоко и банан' && ans(16, 2) === 'Суп и рис',
  'Д17: падежи творительнӣ ва «кухне» нестанд', P[16]);
const allQ = [11, 12, 14, 16].flatMap((i) => q(i));
check('C13', !allQ.some((x) => x.question.includes(String.fromCharCode(39)))
  && !allQ.some((x) => /Выберите|напиток|Чего|Яйца/.test(x.question + JSON.stringify(x.options)))
  && q(16).every((x) => x.options.length === 3),
  'нохунаки рост, «Выберите», «напиток», «Чего», «Яйца» нестанд; имтиҳон 3 вариант');
// Тоҷикии бе ҳарфи хос («ва охири исм иваз мешавад») низ тоҷикӣ аст — рӯйхати васеи калимаҳои хизматӣ.
const TG_FUNC = /(^|\s)(дар|матн|аст|ва|ё|бе|бо|аз|ки|ин|он|мехӯрад|менӯшад|мепазанд|надоранд|дорад|дорем|нест|нестанд|шумурда|намешавад|мешавад|иваз|охири|исм|калима|вариант|ҷавоб|қоида|нон|об|гӯшт|шир)(\s|$|[.,:;!?»])/i;
const nonTg = allQ.filter((x) => !/[ӣӯҳҷқғ]/i.test(x.explanation ?? '') && !TG_FUNC.test(x.explanation ?? ''));
check('C14', !nonTg.length, `ҳамаи ${allQ.length} тавзеҳи фаҳмиш тоҷикӣ`, nonTg.map((x) => x.explanation).join(' | '));

// ── R6, R15: муколама ──
const lines = comp(13)?.lines ?? [];
check('C15', lines.length === 8 && !lines.some((l) => /Я бы хотел/.test(l.text)) && lines[3].text === 'Да, пожалуйста.'
  && new Set(lines.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1,
  `муколама: ${lines.length} сатр, «Я бы хотел» нест, ҳама аз як сабт`);

// ── аудио (аз ҷумла сатри пештар ХОМӮШ) ва акс ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...Object.values(gram).flatMap((g) => g.examples.map((e) => e.audioUrl)),
  ...lessons.map((l) => l.component?.audioUrl),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1 || v.speech < 0.1);
check('A1', urls.length >= 75 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`, silent.map(([u]) => u.slice(-28)).join(' '));
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
