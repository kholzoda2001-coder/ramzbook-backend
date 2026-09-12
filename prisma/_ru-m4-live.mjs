// Санҷиши ЗИНДАИ Модули 4-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m4-live.mjs
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
const m4 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[3];
check('L1', !!m4 && m4.lessons.length === 17, 'API Модули 4-ро бо 17 дарс медиҳад', m4 ? `«${m4.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m4.id}`;
check('L2', m4.contentVersion === db.v && db.v >= 2, `версия: API ${m4.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m4.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 17 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (i, ru) => (lessons[i].words ?? []).find((x) => x.word === ru);

// ── R2, R3 ──
// API калимаҳоро дар дарсҳои такрор/имтиҳон низ такрор медиҳад (М3: 88 барои 43 сатр) — пас шумора ≥ 61.
check('C1', words.length >= 61 && words.every((x) => (x.ipaTajik ?? '').trim()), `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}`);
check('C2', w(8, 'День').translation === 'Рӯз' && w(1, 'Девять').translation === 'Нӯҳ', 'тарҷумаҳо: «Рӯз», «Нӯҳ»');

// ── R1/R9: мисолҳои қобили «сохтани ҷумла» ва бе шаклҳои наомӯхта ──
const exs = words.map((x) => x.example ?? '');
check('C3', !exs.some((e) => /Моему|Моей|две |в январе|в апреле/.test(e)) && w(8, 'Время').example === 'Сколько сейчас времени?',
  'мисолҳо: бе «Моему/Моей», «две», «в январе»; «Время» — ибораи Д12/Д14');
check('C4', w(0, 'Два').example === 'Один, два, три.' && w(2, 'Двенадцать').example.startsWith('Одиннадцать, двенадцать') && w(8, 'Утро').example === 'Утро, день, вечер, ночь.',
  'қаторҳо: «Один, два, три», «Одиннадцать, двенадцать…», «Утро, день, вечер, ночь»');

// ── R8 ──
const emo = (i) => (lessons[i].words ?? []).map((x) => x.emoji);
check('C5', !emo(3).includes('🔢') && !emo(4).includes('🔢') && !emo(15).includes('🔢') && w(4, 'Сто').emoji === '💯',
  'рақамҳо бе 🔢', `${emo(3).join(' ')} · ${emo(4).join(' ')}`);
check('C6', [...emo(6), ...emo(7)].every((e) => e === emo(6)[0]) && w(15, 'Август').emoji === emo(6)[0], 'моҳҳо — як эмоҷӣ', [...emo(6), ...emo(7)].join(' '));

// ── R12 ──
check('C7', lessons[4].title === 'Числа 30-100' || m4.lessons[4].title === 'Числа 30-100', 'Д5 унвон «30-100»');

// ── R4/R7: Д10 (API ё база) ──
let g10 = comp(9), gSrc = 'API';
if (!g10?.exercises) {
  gSrc = 'база';
  const [lid] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m4.lessons[9].id}`;
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${lid.g}`;
  g10 = { explanation: t.explanation, exercises: await sql`SELECT prompt,answer,options FROM "GrammarExercise" WHERE "topicId"=${lid.g}`,
    rules: await sql`SELECT pattern,note FROM "GrammarRule" WHERE "topicId"=${lid.g}` };
}
const gx = g10.exercises;
const inV = gx.filter((e) => /^в /.test(e.answer)).length;
const untaught = gx.flatMap((e) => e.options).filter((o) => /^(на|к|до)( |$)/.test(o));
check('C8', gx.length === 8 && inV === 4 && !untaught.length && gx.every((e) => e.options.includes(e.answer)),
  `Д10: «в …» ${inV}/8, дистракторҳои наомӯхта: ${untaught.length} (${gSrc})`);
check('C9', /\*\*5–20\*\* → \*часов\*/.test(g10.explanation) && /рӯзона, бегоҳӣ/.test(g10.explanation) && (g10.explanation.match(/⚡/g) || []).length === 1
  && /август → в августе/.test(g10.explanation) && /пятница → в пятницу/.test(g10.explanation),
  'Д10 тавзеҳ: «час / часа / часов», шаклҳои зарф, охири «-е/-у», як блоки ⚡');

// ── R5, R6, R13: фаҳмиш ──
const COMP = [11, 12, 14, 16];
const p13 = comp(12).passage, p15 = comp(14).passage, p17 = comp(16).passage;
check('C10', !/заканчивается|утра/.test(p13) && q(12).every((x) => !/Во сколько|говорящему/.test(x.question)), 'Д13: бе «заканчивается», «Во сколько», «говорящему»', p13);
check('C11', ans(12, 0) === 'Понедельник' && p13.includes('Сегодня понедельник') && ans(12, 1) === 'В десять' && p13.includes('в десять')
  && ans(12, 2) === 'В мае' && p13.includes('в мае') && ans(12, 3) === 'Двенадцать' && p13.includes('двенадцать лет'), 'Д13: ҳар ҷавоб дар матн');
check('C12', q(14).length === 4 && !/Давайте/.test(p15) && ans(14, 0) === 'Среда' && p15.includes('Сегодня среда') && ans(14, 1) === 'Вторник'
  && p15.includes('Вчера был вторник') && ans(14, 2) === 'В августе' && p15.includes('в августе') && ans(14, 3) === 'Тридцать' && p15.includes('тридцать лет'),
  `Д15: матни нав + ${q(14).length} савол, ҳар ҷавоб дар матн`, p15);
check('C13', !/свободен|семьёй|утра/.test(p17) && ans(16, 0) === 'Двадцать' && p17.includes('двадцать лет') && ans(16, 1) === 'В восемь'
  && p17.includes('начинается в восемь') && ans(16, 2) === 'Воскресенье' && p17.includes('было воскресенье'), 'Д17: матни нав, ҷавобҳо дар матн', p17);
const allQ = COMP.flatMap((i) => q(i));
check('C14', !allQ.some((x) => x.question.includes("'")) && q(16).every((x) => x.options.length === 3)
  && q(16).slice(3).every((x) => /«.+»/.test(x.questionTranslated ?? x.question)), 'нохунаки рост нест, имтиҳон 3 вариант, тарҷумаи савол бо калима');
const isTg = (e) => /[ӣӯҳҷқғ]/i.test(e);
const nonTg = allQ.filter((x) => !isTg(x.explanation ?? ''));
check('C15', !nonTg.length, `ҳамаи ${allQ.length} тавзеҳи фаҳмиш тоҷикӣ`, nonTg.map((x) => x.explanation).join(' | '));
check('C16', !/сола/.test(`${comp(14).passageTranslated} ${comp(16).passageTranslated}`.replace(/\S+сола/g, '')) && /бистсола/.test(comp(16).passageTranslated),
  'F4/F5: «-сола» якҷоя');

// ── R14: муколама ──
const lines = comp(13)?.lines ?? [];
check('C17', lines.length === 8 && lines[7].text === 'Вчера было воскресенье.' && lines.every((l) => l.audioUrl?.includes('9b690ce')),
  `муколама: ${lines.length} сатр, ҳама аз як сабт`);

// ── Аудио ва аксҳо ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...lessons.map((l) => l.component?.audioUrl),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1);
check('A1', urls.length === 83 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`);
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');
const IMG = { день: 404, утро: 404, вечер: 200, ночь: 200 };
const st = await Promise.all(Object.keys(IMG).map(async (k) =>
  (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status));
check('I1', Object.values(IMG).every((s, i) => st[i] === s), 'аксҳо: «день», «утро» нест; «вечер», «ночь» боқӣ', Object.keys(IMG).map((k, i) => `${k}:${st[i]}`).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
