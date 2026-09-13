// Санҷиши ЗИНДАИ Модули 9-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m9-live.mjs
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
const m9 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[8];
check('L1', !!m9 && m9.lessons.length === 17, 'API Модули 9-ро бо 17 дарс медиҳад', m9 ? `«${m9.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m9.id}`;
check('L2', m9.contentVersion === db.v && db.v >= 5, `версия: API ${m9.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m9.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 17 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const titles = m9.lessons.map((l) => l.title);

// ── R2: калимаҳо ──
const W2 = { 'Повернуть': 'Поверните налево.', 'Близко': 'Банк близко.', 'Минута': 'Идите пять минут.', 'Найти': 'Я не могу найти банк.', 'Спросить': 'Можно спросить?' };
const bad2 = Object.entries(W2).filter(([k, ex]) => w(k)?.example !== ex || !(w(k)?.audioUrl ?? '').includes('/audio/ru/'));
check('C1', !bad2.length && !['Поворачивать', 'Идти пешком', 'Местоположение', 'Находить', 'Прибывать'].some((x) => w(x)),
  'калимаҳои нав бо мисол ва аудиои худ; кортҳои кӯҳна нестанд', bad2.map(([k]) => k).join(', '));
check('C2', words.filter((x) => x.word === 'Ехать').every((x) => x.translation === 'Рафтан (бо нақлиёт)' && x.example === 'Я еду на автобусе.'),
  '«Ехать» = «Рафтан (бо нақлиёт)», мисол бо автобус');

// ── F1–F3: тарҷумаҳо ──
check('C3', w('Мост').translation === 'Купрук' && words.filter((x) => x.word === 'Поезд').every((x) => x.translation === 'Қатора')
  && w('Вокзал').translation === 'Вокзал (истгоҳи қатора)', 'тарҷума: купрук, қатора, вокзал');

// ── R7: мисолҳо ──
// ⚠️ `\b` бо кириллӣ кор намекунад — «жду» дар «между» пайдо мешуд (13.09.2026) → марзи дастӣ.
check('C4', !words.some((x) => /(^|[\s«])(езжу|вожу|берём|путешествую|жду|отправляю|Перейди|Аэропорт|посещаем|Поверни|Иди|Остановись)([\s.,!?»]|$)/.test(x.example ?? '')),
  'мисолҳо бе «езжу / вожу / берём / путешествую / жду / Перейди / Аэропорт…» ва бе шакли «ту»');

// ── R11: эмоҷӣ ва унвонҳо ──
check('C5', w('Угол').emoji === '📍' && w('Напротив').emoji === '↕️', 'эмоҷӣ: «Угол» 📍 (на 📐), «Напротив» ↕️');
const dupEmo = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => x.emoji);
  return new Set(e).size === e.length ? null : `Д${i + 1}`;
}).filter(Boolean);
check('C6', !dupEmo.length, 'ягон эмоҷии такрорӣ дар як дарс нест', dupEmo.join(', '));
check('C7', titles[11] === 'Чтение: Где вокзал?' && titles[16] === 'Где аптека?', 'унвонҳо: Д12 «Чтение: Где вокзал?», Д17 «Где аптека?»', `${titles[11]} | ${titles[16]}`);

// ── R1, R10: грамматикаи Д11 ──
const [lg] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m9.lessons[10].id}`;
const gEx = await sql`SELECT prompt,answer,options,"audioUrl" au FROM "GrammarExercise" WHERE "topicId"=${lg.g} ORDER BY "order"`;
const gExm = await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${lg.g} ORDER BY "order"`;
const [gT] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${lg.g}`;
const gR = await sql`SELECT note FROM "GrammarRule" WHERE "topicId"=${lg.g}`;
check('C8', gT.explanation.includes('**Идите** прямо') && gT.explanation.includes('Не поворачивай')
  && !JSON.stringify([gEx, gR, gExm]).match(/сворачивай|Идущий|Повернувший/), 'Д11: шакли расмӣ дар шарҳ; «сворачивай», «Идущий», «Повернувший» нестанд');
check('C9', gEx.some((x) => x.answer === 'Идите прямо.' && (x.au ?? '').includes('/audio/gx/ru/')) && gEx.every((x) => x.au)
  && gExm.some((x) => x.sentence === 'Идите прямо, пожалуйста.' && x.au) && gExm.some((x) => x.sentence === 'Не поворачивай направо.' && x.au),
  'Д11: машқи расмӣ ва ду мисол бо аудио; ҳамаи машқҳо аудио доранд');

// ── R4–R6, R3: матнҳо ──
const P = Object.fromEntries([11, 12, 14, 16].map((i) => [i, comp(i).passage]));
check('C10', new Set(Object.values(P)).size === 4 && !Object.values(P).some((t) => /Если|садись|хочешь|Иди |Поверни /.test(t)),
  'чор матни ГУНОГУН, бе «Если / садись / хочешь» ва бе шакли «ту»');
check('C11', ans(11, 0) === 'Нет, далеко' && ans(12, 3) === 'Мост' && q(14).length === 4 && ans(16, 7) === 'Идите прямо',
  'ҷавобҳо: Д12 «Нет, далеко», Д13 «Мост», Д15 4 савол, Д17 «Рост равед» → «Идите прямо»');
const allQ = [11, 12, 14, 16].flatMap((i) => q(i));
check('C12', !allQ.some((x) => /ищет|какую сторону|первое|добраться|находится|Выберите|Как будет|Ходи|Назад/.test(`${x.question} ${x.options.join(' ')}`))
  && !allQ.some((x) => x.question.includes(String.fromCharCode(39))) && q(16).every((x) => x.options.length === 3),
  `ҳамаи ${allQ.length} савол бе калимаҳои наомӯхта ва дастури русӣ; имтиҳон 3 вариант`);
const TG = /[ӣӯҳҷқғ]|(^|\s)(аст|дар|ба|бо|ва|матн)(\s|$|[.,:;!?»])/i;
check('C13', allQ.every((x) => TG.test(x.explanation ?? '')), 'ҳамаи тавзеҳҳо тоҷикӣ', allQ.filter((x) => !TG.test(x.explanation ?? '')).map((x) => x.explanation).join(' | '));

// ── R1: муколама ──
const dl = comp(13)?.lines ?? [];
check('C14', dl.length === 8 && dl[1].text === 'Идите прямо.' && dl[3].text === 'Потом поверните направо.'
  && !dl.some((l) => /^(Иди|Поверни) /.test(l.text)) && new Set(dl.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1,
  'муколама: 8 сатр, шакли расмӣ, ҳама аз як сабт');

// ── R8: аксҳо ──
const st = async (k) => (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status;
const gone = await Promise.all(['банк', 'отель'].map(st)), kept = await Promise.all(['музей', 'аптека', 'автобус'].map(st));
check('C15', gone.every((s) => s === 404) && kept.every((s) => s === 200), `аксҳо: «Банк», «Отель» нест (${gone.join(',')}); дигарон боқӣ (${kept.join(',')})`);

// ── аудио ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl), ...dl.map((x) => x.audioUrl),
  ...[11, 12, 14, 16].map((i) => comp(i).audioUrl),
  ...gEx.map((x) => x.au), ...gExm.map((x) => x.au),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const textOf = Object.fromEntries(words.map((x) => [x.audioUrl, x.word]));
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
const silent = Object.entries(m).filter(([u, v]) => v.error || v.peak < 0.1
  || (textOf[u] ? v.speech < (letters(textOf[u]) <= 3 ? 0.12 : letters(textOf[u]) <= 6 ? 0.15 : 0.2) : v.speech < 0.1));
check('A1', urls.length >= 75 && !silent.length, `аудио: ${urls.length} файл, хомӯш/қариб хомӯш: ${silent.length}`, silent.map(([u]) => `${textOf[u] ?? ''} ${u.slice(-24)}`).join(' '));
const clip = Object.entries(m).filter(([u, v]) => v.peak >= 0.99 && !u.includes('@670d6de'));
check('A2', !clip.length && !/error/i.test(r.stderr), 'аудиои нав бе клиппинг, дешифргар хато надод', clip.map(([u]) => u.slice(-28)).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
