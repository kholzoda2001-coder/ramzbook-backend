// Санҷиши ЗИНДАИ Модули 12-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m12-live.mjs
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
const m12 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[11];
check('L1', !!m12 && m12.lessons.length === 20, 'API Модули 12-ро бо 20 дарс медиҳад', m12 ? `«${m12.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m12.id}`;
check('L2', m12.contentVersion === db.v && db.v >= 5, `версия: API ${m12.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m12.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 20 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const titles = m12.lessons.map((l) => l.title);

// ── R6: калима ──
check('C1', !w('Кабинет') && (w('Парта')?.audioUrl ?? '').includes('/audio/ru/') && w('Парта').translation === 'Парта',
  '«Кабинет» (дубора «синфхона») → «Парта» бо аудио');
const prior = new Set((await sql`SELECT lower(w.word) k FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND m."order" < 11 AND l."skillType" <> 'writing'`).map((r) => r.k));
const dupNow = [...new Set(lessons.slice(0, 12).flatMap((l) => l.words ?? []).map((x) => x.word).filter((x) => prior.has(x.toLowerCase())))];
check('C2', !dupNow.length, 'ягон калимаи Д1–Д12 дар М1–М11 корт нест', dupNow.join(', '));

// ── F1, F2, R5: тарҷумаҳо ва мисолҳо ──
check('C3', w('Птица').translation === 'Парранда' && words.filter((x) => x.word === 'Весёлый').every((x) => x.translation === 'Шод (хурсанд)'),
  'тоҷикӣ: «Парранда», «Весёлый» = «Шод (хурсанд)»');
const BAD = /(^|[\s«])(вижу|умеет|даёт|боюсь|раскрываются|падают|плаваем|Посмотрите|начинается|каждый|свою|Дети|Ребёнок|правильный|слабость)([\s.,!?»]|$)/;
check('C4', !words.some((x) => BAD.test(x.example ?? '')) && w('Испуганный').example === 'Кошка испуганная.' && w('Слабый').example === 'Он слабый.',
  'мисолҳо бе калимаҳои наомӯхта; «Испуганный» ва «Слабый» мисоли худро доранд');

// ── R10: эмоҷӣ, R7: унвонҳо ──
const dupEmo = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => x.emoji);
  return new Set(e).size === e.length ? null : `Д${i + 1}`;
}).filter(Boolean);
check('C5', !dupEmo.length && w('Питомец').emoji === '🐹', 'эмоҷӣ: такрор дар як дарс нест; «Питомец» 🐹', dupEmo.join(', '));
const [dt] = await sql`SELECT title FROM "Dialogue" WHERE id=(SELECT "dialogueId" FROM "Lesson" WHERE id=${m12.lessons[16].id})`;
check('C6', titles[12] === 'Грамматика: Описание вещей' && titles[14] === 'Чтение: В зоопарке' && dt.title === 'Разговор о погоде',
  'унвонҳо: грамматика, хониш, муколама — русӣ', `${titles[12]} | ${titles[14]} | ${dt.title}`);

// ── R8: грамматика ──
const [lg] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m12.lessons[12].id}`;
const [lg2] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m12.lessons[13].id}`;
const gEx = await sql`SELECT prompt,answer,"audioUrl" au FROM "GrammarExercise" WHERE "topicId" IN (${lg.g}, ${lg2.g})`;
check('C7', !gEx.some((x) => x.prompt === 'Я ___.') && gEx.some((x) => x.prompt === 'Он ___.' && (x.au ?? '').includes('/audio/gx/ru/')) && gEx.every((x) => x.au),
  'Д13: «Я ___.» (ду ҷавоб) → «Он ___.» бо аудио; ҳамаи машқҳо аудио доранд');

// ── R1–R4: матнҳо ──
const P = Object.fromEntries([14, 15, 17, 19].map((i) => [i, comp(i).passage]));
check('C8', new Set(Object.values(P)).size === 4 && !Object.values(P).some((t) => /После|учебный|встаёт|себя|потому|больше всего|своей|каждое|гуляют/.test(t)),
  'чор матни ГУНОГУН, бе «После / учебный / чувствует себя / потому что / своей семьёй»');
check('C9', ans(14, 0) === 'В зоопарке' && ans(15, 2) === 'Дождь и ветер' && q(17).length === 4 && ans(19, 6) === 'идёт',
  'ҷавобҳо: Д15 боғи ҳайвонот, Д16 фаслҳо, Д18 4 савол, Д20 «Мадина идёт в школу»');
const allQ = [14, 15, 17, 19].flatMap((i) => q(i));
check('C10', !allQ.some((x) => /Выберите|Как будет|видит|себя|говорящий|Скучный|Трудный|мало/.test(`${x.question} ${x.options.join(' ')}`))
  && !allQ.some((x) => x.question.includes(String.fromCharCode(39))) && allQ.every((x) => x.options.length === 3),
  `ҳамаи ${allQ.length} савол бе калимаҳои наомӯхта ва дастури русӣ; ҳама 3 вариант`);
const TG = /[ӣӯҳҷқғ]|(^|\s)(аст|дар|ба|бо|ва|матн)(\s|$|[.,:;!?»])/i;
check('C11', allQ.every((x) => TG.test(x.explanation ?? '')), 'ҳамаи тавзеҳҳо тоҷикӣ', allQ.filter((x) => !TG.test(x.explanation ?? '')).map((x) => x.explanation).join(' | '));

// ── R9: муколама ──
const dl = comp(16)?.lines ?? [];
check('C12', dl.length === 8 && !dl.some((l) => /Солнечно|Пойдём/.test(l.text))
  && new Set(dl.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, 'муколама: 8 сатр бе «Солнечно / Пойдём», ҳама аз як сабт');

// ── R6: аксҳо ──
const st = async (k) => (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status;
const gone = await Promise.all(['экзамен', 'улыбка'].map(st)), kept = await Promise.all(['корова', 'класс', 'бумага'].map(st));
check('C13', gone.every((s) => s === 404) && kept.every((s) => s === 200), `аксҳо: «Экзамен», «Улыбка» нест (${gone.join(',')}); дигарон боқӣ (${kept.join(',')})`);

// ── аудио ──
const gExm = await sql`SELECT "audioUrl" au FROM "GrammarExample" WHERE "topicId" IN (${lg.g}, ${lg2.g})`;
const urls = [...new Set([
  ...words.map((x) => x.audioUrl), ...dl.map((x) => x.audioUrl),
  ...[14, 15, 17, 19].map((i) => comp(i).audioUrl),
  ...gEx.map((x) => x.au), ...gExm.map((x) => x.au),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const textOf = Object.fromEntries(words.map((x) => [x.audioUrl, x.word]));
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
const silent = Object.entries(m).filter(([u, v]) => v.error || v.peak < 0.1
  || (textOf[u] ? v.speech < (letters(textOf[u]) <= 3 ? 0.12 : letters(textOf[u]) <= 6 ? 0.15 : 0.2) : v.speech < 0.1));
check('A1', urls.length >= 110 && !silent.length, `аудио: ${urls.length} файл, хомӯш/қариб хомӯш: ${silent.length}`, silent.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-24)}`).join(' '));
const clip = Object.entries(m).filter(([, v]) => v.peak >= 0.99);
check('A2', !clip.length && !/error/i.test(r.stderr), 'ягон аудио бе клиппинг, дешифргар хато надод', clip.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-28)}`).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
