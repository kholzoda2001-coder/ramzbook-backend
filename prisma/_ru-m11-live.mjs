// Санҷиши ЗИНДАИ Модули 11-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m11-live.mjs
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
const m11 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[10];
check('L1', !!m11 && m11.lessons.length === 16, 'API Модули 11-ро бо 16 дарс медиҳад', m11 ? `«${m11.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m11.id}`;
check('L2', m11.contentVersion === db.v && db.v >= 5, `версия: API ${m11.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m11.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 16 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const titles = m11.lessons.map((l) => l.title);

// ── R4: калимаҳо ──
const OLD = ['Кисть', 'Нездоровый', 'Пилюля', 'Экстренная ситуация'];
const NEW = ['Палец', 'Насморк', 'Шприц', 'Полиция'];
check('C1', !OLD.some((x) => w(x)) && NEW.every((x) => (w(x)?.audioUrl ?? '').includes('/audio/ru/')),
  'калимаҳои кӯҳна нестанд; «Палец / Насморк / Шприц / Полиция» бо аудио', NEW.filter((x) => !w(x)).join(', '));
check('C2', words.filter((x) => x.word === 'Таблетка').every((x) => x.translation === 'Ҳаб') && (lessons[14].words ?? []).some((x) => x.word === 'Палец'),
  '«Таблетка» = «Ҳаб» (Д7 ва Д15); нусхаи «Палец» дар дарси навиштан');
const prior = new Set((await sql`SELECT lower(w.word) k FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND m."order" < 10 AND l."skillType" <> 'writing'`).map((r) => r.k));
const dupNow = [...new Set(lessons.slice(0, 9).flatMap((l) => l.words ?? []).map((x) => x.word).filter((x) => prior.has(x.toLowerCase())))];
check('C3', !dupNow.length, 'ягон калимаи Д1–Д9 дар М1–М10 корт нест', dupNow.join(', '));

// ── F2–F7: тарҷумаҳо, R5: мисолҳо ──
check('C4', w('Фармацевт').translation === 'Дорухонадор' && w('Сироп').translation === 'Шарбати дору' && w('Бинт').translation === 'Бинт (дока)'
  && !words.some((x) => /Бозуи|Лавҳача/.test(`${x.translation} ${x.exampleTrans}`)), 'тоҷикӣ: дорухонадор, шарбати дору, бинт; «бозу» ва «лавҳача» нестанд');
check('C5', !words.some((x) => /(^|\s)(Прими|Используй|Вызови|Произошла|Позвони|Помогите|Дайте)(\s|[.,!?]|$)/.test(x.example ?? '')),
  'мисолҳо бе «Прими / Используй / Вызови / Произошла / Позвони / Помогите»');

// ── R10: эмоҷӣ, R7: унвонҳо ──
const dupEmo = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => x.emoji);
  return new Set(e).size === e.length ? null : `Д${i + 1}`;
}).filter(Boolean);
check('C6', !dupEmo.length && w('Живот').emoji !== '🩹', 'эмоҷӣ: такрор дар як дарс нест; «Живот» 🩹 нест', dupEmo.join(', '));
const [dt] = await sql`SELECT title FROM "Dialogue" WHERE id=(SELECT "dialogueId" FROM "Lesson" WHERE id=${m11.lessons[12].id})`;
check('C7', titles[9] === 'Грамматика: У меня болит…' && titles[10] === 'Чтение: В аптеке' && dt.title === 'Разговор с врачом'
  && m11.lessons[15].titleTranslated !== 'Дандони соро дард мекунад', 'унвонҳо: грамматика, хониш, муколама русӣ; «соро» ислоҳ', `${titles[9]} | ${titles[10]} | ${dt.title}`);

// ── R9: грамматика ──
const [lg] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m11.lessons[9].id}`;
const gEx = await sql`SELECT prompt,answer,"audioUrl" au FROM "GrammarExercise" WHERE "topicId"=${lg.g}`;
check('C8', !gEx.some((x) => x.answer === 'Ты можешь мне помочь?') && gEx.some((x) => x.answer === 'У неё болит голова.' && (x.au ?? '').includes('/audio/gx/ru/'))
  && gEx.every((x) => x.au), 'Д10: машқи «ҷавоб = савол» нест; машқи нав бо аудио');

// ── R1–R3, R6: матнҳо ──
const P = Object.fromEntries([10, 11, 13, 15].map((i) => [i, comp(i).passage]));
check('C9', new Set(Object.values(P)).size === 4 && !Object.values(P).some((t) => /намного|себя|должна|Выздоравливайте|записывается|горячий чай/.test(t)),
  'чор матни ГУНОГУН, бе «намного лучше / чувствую себя / Выздоравливайте / записывается»');
check('C10', ans(10, 0) === 'В аптеке' && ans(11, 0) === 'Авария' && q(13).length === 4 && ans(15, 6) === 'болит',
  'ҷавобҳо: Д11 дорухона, Д12 садама, Д14 4 савол, Д16 «У меня болит зуб»');
const allQ = [10, 11, 13, 15].flatMap((i) => q(i));
check('C11', !allQ.some((x) => /Куда|К кому|Выберите|Как будет|являются|Счастливо|Уставшей/.test(`${x.question} ${x.options.join(' ')}`))
  && !allQ.some((x) => x.question.includes(String.fromCharCode(39)) || x.options.includes('—')) && allQ.every((x) => x.options.length === 3),
  `ҳамаи ${allQ.length} савол бе калимаҳои наомӯхта ва дастури русӣ; ҳама 3 вариант`);
const TG = /[ӣӯҳҷқғ]|(^|\s)(аст|дар|ба|бо|ва|матн)(\s|$|[.,:;!?»])/i;
check('C12', allQ.every((x) => TG.test(x.explanation ?? '')), 'ҳамаи тавзеҳҳо тоҷикӣ', allQ.filter((x) => !TG.test(x.explanation ?? '')).map((x) => x.explanation).join(' | '));

// ── R8: муколама ──
const dl = comp(12)?.lines ?? [];
check('C13', dl.length === 8 && dl[3].text === 'Два дня.' && !dl.some((l) => /Дайте я|вчерашнего|серьёзно/.test(l.text))
  && new Set(dl.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, 'муколама: 8 сатр бо ҷумлаҳои A1, ҳама аз як сабт');

// ── R12: акс ──
const st = async (k) => (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status;
const gone = await st('пожар'), kept = await Promise.all(['скорая_помощь', 'термометр', 'врач'].map(st));
check('C14', gone === 404 && kept.every((s) => s === 200), `акс: «Пожар» (гулхан) нест (${gone}); дигарон боқӣ (${kept.join(',')})`);

// ── аудио ──
const gExm = await sql`SELECT "audioUrl" au FROM "GrammarExample" WHERE "topicId"=${lg.g}`;
const urls = [...new Set([
  ...words.map((x) => x.audioUrl), ...dl.map((x) => x.audioUrl),
  ...[10, 11, 13, 15].map((i) => comp(i).audioUrl),
  ...gEx.map((x) => x.au), ...gExm.map((x) => x.au),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const textOf = Object.fromEntries(words.map((x) => [x.audioUrl, x.word]));
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
const silent = Object.entries(m).filter(([u, v]) => v.error || v.peak < 0.1
  || (textOf[u] ? v.speech < (letters(textOf[u]) <= 3 ? 0.12 : letters(textOf[u]) <= 6 ? 0.15 : 0.2) : v.speech < 0.1));
check('A1', urls.length >= 80 && !silent.length, `аудио: ${urls.length} файл, хомӯш/қариб хомӯш: ${silent.length}`, silent.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-24)}`).join(' '));
const clip = Object.entries(m).filter(([, v]) => v.peak >= 0.99);
check('A2', !clip.length && !/error/i.test(r.stderr), 'ягон аудио бе клиппинг, дешифргар хато надод', clip.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-28)}`).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
