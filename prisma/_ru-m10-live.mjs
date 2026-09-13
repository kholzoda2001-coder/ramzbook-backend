// Санҷиши ЗИНДАИ Модули 10-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m10-live.mjs
import { spawnSync } from 'child_process';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';

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
const m10 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[9];
check('L1', !!m10 && m10.lessons.length === 18, 'API Модули 10-ро бо 18 дарс медиҳад', m10 ? `«${m10.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m10.id}`;
check('L2', m10.contentVersion === db.v && db.v >= 5, `версия: API ${m10.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m10.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 18 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const titles = m10.lessons.map((l) => l.title);

// ── R1: калимаҳои такрорӣ ──
const OLD = ['Рубашка', 'Брюки', 'Обувь', 'Куртка', 'Платье', 'Носки', 'Кепка', 'Сумка', 'Рюкзак', 'Шляпа', 'Кошелёк', 'Старый', 'Чистый', 'Грязный', 'Чёрно-синий'];
const NEW = ['Блузка', 'Пиджак', 'Туфли', 'Майка', 'Халат', 'Тапочки', 'Сандалии', 'Браслет', 'Чемодан', 'Шапка', 'Пуговица', 'Модный', 'Мягкий', 'Лёгкий', 'Голубой'];
check('C1', !OLD.some((x) => w(x)) && NEW.every((x) => (w(x)?.audioUrl ?? '').includes('/audio/ru/')),
  '15 калимаи такрорӣ нестанд; калимаҳои нав бо аудио', NEW.filter((x) => !w(x)).join(', '));
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const prior = new Set((await sql`SELECT lower(w.word) k FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND m."order" < 9 AND l."skillType" <> 'writing'`).map((r) => r.k));
const dupNow = [...new Set(lessons.slice(0, 10).flatMap((l) => l.words ?? []).map((x) => x.word).filter((x) => prior.has(x.toLowerCase())))];
check('C2', !dupNow.length, 'ягон калимаи Д1–Д10 дар М1–М9 корт нест', dupNow.join(', '));
const copies = (lessons[16].words ?? []).map((x) => x.word);
check('C3', ['Голубой', 'Туфли', 'Чемодан', 'Мягкий'].every((x) => copies.includes(x)) && !copies.some((x) => OLD.includes(x)),
  'дарси навиштан: нусхаҳо ҳам нав', copies.join(', '));

// ── R8, F5–F7: мисолҳо ва тарҷумаҳо ──
const early = lessons.slice(0, 10).flatMap((l) => l.words ?? []);
check('C4', !early.some((x) => /(^|\s)(нош|носи)/i.test(x.example ?? '')) && !words.some((x) => /зимой|летом|Рукава|бегаю|Ей нравится/.test(x.example ?? '')),
  'мисолҳои Д1–Д10 бе «носить» ва бе «зимой / летом / Рукава / бегаю»');
check('C5', w('Приятный').translation === 'Форам' && !words.some((x) => /^Курта зебо|куртаи гулобӣ/.test(x.exampleTrans ?? '')),
  'тоҷикӣ: «Приятный» = «Форам»; «платье» ≠ «курта» дар мисолҳо');

// ── R9: эмоҷӣ ──
const dupEmo = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => x.emoji);
  return new Set(e).size === e.length ? null : `Д${i + 1}`;
}).filter(Boolean);
check('C6', !dupEmo.length && !words.some((x) => ['👑', '🥋', '👺', '🧵'].includes(x.emoji)), 'эмоҷӣ: такрор дар як дарс нест; 👑 🥋 👺 🧵 нестанд', dupEmo.join(', '));
check('C7', titles[12] === 'Чтение: Моя семья' && titles[17] === 'Сара и Али', 'унвонҳо: Д13, Д18', `${titles[12]} | ${titles[17]}`);

// ── R7: грамматикаи Д11 ──
const [lg] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m10.lessons[10].id}`;
const gR = await sql`SELECT note FROM "GrammarRule" WHERE "topicId"=${lg.g}`;
const gEx = await sql`SELECT prompt,answer,"audioUrl" au FROM "GrammarExercise" WHERE "topicId"=${lg.g}`;
const gEm = await sql`SELECT sentence,translation FROM "GrammarExample" WHERE "topicId"=${lg.g}`;
check('C8', !gR.some((r) => /[A-Za-z]{3,}/.test(r.note ?? '')) && !gEx.some((x) => x.answer === 'Ты работаешь?')
  && gEx.some((x) => x.answer === 'Мы читаем книгу.' && (x.au ?? '').includes('/audio/gx/ru/')) && gEx.every((x) => x.au)
  && gEm.find((x) => x.sentence === 'Я ношу синюю рубашку.')?.translation === 'Ман куртаи кабуд мепӯшам.',
  'Д11: қоидаҳо бе англисӣ, машқи нав бо аудио, тарҷумаи замони ҳозира');

// ── R3–R5: матнҳо ──
const P = Object.fromEntries([12, 13, 15, 17].map((i) => [i, comp(i).passage]));
check('C9', new Set(Object.values(P)).size === 4 && !Object.values(P).some((t) => /Давайте|Посмотрите|держит|поэтому|Омар|Погода|моего/.test(t)),
  'чор матни ГУНОГУН, бе калимаҳои наомӯхтаи пешина');
check('C10', ans(12, 0) === 'Серый костюм' && ans(13, 1) === 'Футболку и синие шорты' && q(15).length === 4 && ans(17, 5) === 'Новая рубашка',
  'ҷавобҳо: Д13, Д14, Д16 (4 савол), Д18 «Куртаи нав» → «Новая рубашка»');
const allQ = [12, 13, 15, 17].flatMap((i) => q(i));
check('C11', !allQ.some((x) => /Какого цвета|Выберите|Как будет|носят/.test(`${x.question} ${x.options.join(' ')}`))
  && !allQ.some((x) => x.question.includes(String.fromCharCode(39))) && q(17).every((x) => x.options.length === 3),
  `ҳамаи ${allQ.length} савол бе дастури русӣ ва калимаҳои наомӯхта; имтиҳон 3 вариант`);
const TG = /[ӣӯҳҷқғ]|(^|\s)(аст|дар|ба|бо|ва|матн)(\s|$|[.,:;!?»])/i;
check('C12', allQ.every((x) => TG.test(x.explanation ?? '')) && !allQ.some((x) => /Кафш/.test(`${x.explanation} ${x.questionTranslated}`)),
  'ҳамаи тавзеҳҳо тоҷикӣ; «кафш» нест', allQ.filter((x) => !TG.test(x.explanation ?? '')).map((x) => x.explanation).join(' | '));

// ── R6: муколама ──
const dl = comp(14)?.lines ?? [];
check('C13', dl.length === 8 && dl[7].text === 'Да, вот большой.' && !dl[7].isUser
  && new Set(dl.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, `муколама: ${dl.length} сатр, ҳама аз як сабт`);

// ── R2: акс ──
const st = async (k) => (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status;
const gone = await st('наручные_часы'), kept = await Promise.all(['шарф', 'галстук', 'кольцо'].map(st));
check('C14', gone === 404 && kept.every((s) => s === 200), `акс: «Наручные часы» нест (${gone}); дигарон боқӣ (${kept.join(',')})`);

// ── аудио ──
const [lg2] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m10.lessons[11].id}`;
const gEx2 = await sql`SELECT "audioUrl" au FROM "GrammarExercise" WHERE "topicId"=${lg2.g}`;
const gExm = await sql`SELECT "audioUrl" au FROM "GrammarExample" WHERE "topicId" IN (${lg.g}, ${lg2.g})`;
const urls = [...new Set([
  ...words.map((x) => x.audioUrl), ...dl.map((x) => x.audioUrl),
  ...[12, 13, 15, 17].map((i) => comp(i).audioUrl),
  ...gEx.map((x) => x.au), ...gEx2.map((x) => x.au), ...gExm.map((x) => x.au),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const textOf = Object.fromEntries(words.map((x) => [x.audioUrl, x.word]));
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
const silent = Object.entries(m).filter(([u, v]) => v.error || v.peak < 0.1
  || (textOf[u] ? v.speech < (letters(textOf[u]) <= 3 ? 0.12 : letters(textOf[u]) <= 6 ? 0.15 : 0.2) : v.speech < 0.1));
check('A1', urls.length >= 90 && !silent.length, `аудио: ${urls.length} файл, хомӯш/қариб хомӯш: ${silent.length}`, silent.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-24)}`).join(' '));
const clip = Object.entries(m).filter(([u, v]) => v.peak >= 0.99 && !u.includes('@ec21a24') && !u.includes('@14cfa62'));
check('A2', !clip.length && !/error/i.test(r.stderr), 'аудиои нав бе клиппинг, дешифргар хато надод', clip.map(([u]) => u.slice(-28)).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
