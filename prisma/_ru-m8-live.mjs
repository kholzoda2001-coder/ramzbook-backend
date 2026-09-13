// Санҷиши ЗИНДАИ Модули 8-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m8-live.mjs
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
const m8 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[7];
check('L1', !!m8 && m8.lessons.length === 18, 'API Модули 8-ро бо 18 дарс медиҳад', m8 ? `«${m8.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m8.id}`;
check('L2', m8.contentVersion === db.v && db.v >= 5, `версия: API ${m8.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m8.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 18 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);
const titles = m8.lessons.map((l) => l.title);

// ── R3: калимаи корт = калимаи мисол ──
const W3 = { 'Нужно': 'Мне нужно купить хлеб.', 'Вернуть': 'Я хочу это вернуть.', 'Примерить': 'Можно это примерить?' };
const bad3 = Object.entries(W3).filter(([k, ex]) => w(k)?.example !== ex || !(w(k)?.audioUrl ?? '').includes('/audio/ru/'));
check('C1', !bad3.length && !w('Нуждаться') && !w('Возвращать') && !w('Примерять'),
  'Д10: «Нужно / Вернуть / Примерить» бо мисол ва аудиои худ', bad3.map(([k]) => k).join(', '));
check('C2', w('Покупать').example === 'Я покупаю хлеб.' && w('Платить').example === 'Где платить?'
  && words.filter((x) => x.word === 'Платить').every((x) => x.example === 'Где платить?'), '«Покупать» / «Платить»: мисол бо ҳамон феъл');

// ── R11, F7, F11: мисолҳо ва тарҷумаҳо ──
check('C3', !words.some((x) => /Оставьте|принимаете|покупок|газировки|высокое|меистад/.test(`${x.example} ${x.exampleTrans}`)),
  'мисолҳо бе «Оставьте / принимаете / покупок / газировки / высокое / меистад»');
check('C4', w('Платье').translation === 'Либоси занона' && w('Банка').translation === 'Банка (зарф)', 'тарҷума: «Платье» ≠ «Курта», «Банка»');

// ── R10: эмоҷӣ ──
const EMO = { 'Кассир': '🧑‍💼', 'Количество': '🔢', 'Выход': '🔙', 'Стоить': '💲', 'Бутылка': '🧴', 'Сдача': '🔄', 'Скидка': '➖' };
const badEmo = Object.entries(EMO).filter(([k, v]) => words.filter((x) => x.word === k).some((x) => x.emoji !== v));
check('C5', !badEmo.length, 'эмоҷӣ: кассир, миқдор, баромадгоҳ, арзидан, шиша, бақия, тахфиф', badEmo.map(([k]) => k).join(', '));
const dupEmo = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => x.emoji);
  return new Set(e).size === e.length ? null : `Д${i + 1}`;
}).filter(Boolean);
check('C6', !dupEmo.length, 'ягон эмоҷии такрорӣ дар як дарс нест', dupEmo.join(', '));

// ── R12, R6, R2: унвонҳо ──
check('C7', titles.slice(4, 10).join('|') === 'Одежда|Одежда (2)|Продукты|Продукты (2)|Покупки|Покупки (2)'
  && titles[12] === 'Чтение: В магазине', 'унвонҳои русии Д5–Д10 ва Д13', titles.slice(4, 13).join(' | '));

// ── R1: грамматикаи Д12 ──
async function gram(i) {
  const [l] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m8.lessons[i].id}`;
  return {
    ex: await sql`SELECT prompt,"promptTranslated" pt,answer,options,explanation,"audioUrl" au FROM "GrammarExercise" WHERE "topicId"=${l.g} ORDER BY "order"`,
    examples: await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${l.g} ORDER BY "order"`,
    rules: await sql`SELECT note FROM "GrammarRule" WHERE "topicId"=${l.g}`,
    topic: (await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${l.g}`)[0],
  };
}
const g11 = await gram(10), g12 = await gram(11);
const e1 = g12.ex.find((x) => x.prompt.startsWith('___ ручка моя'));
const e2 = g12.ex.find((x) => x.prompt.startsWith('___ книги новые'));
const e8 = g12.ex.find((x) => x.prompt === 'Ислоҳ кунед: Эти — моя ручка.');
check('C8', !!e1 && e1.answer === 'Эта' && !e1.options.includes('Это') && !!e2 && e2.answer === 'Эти'
  && e8?.answer === 'Это моя ручка.' && !g12.ex.some((x) => /мои друзья|м\.р\., дур|Шакли феъл/.test(`${x.prompt} ${x.pt}`)),
  'Д12: машқҳо бо қоидаи «это»-и хабарӣ зид нестанд');
check('C9', [e1, e2, e8].every((x) => (x?.au ?? '').includes('/audio/gx/ru/')) && g12.ex.every((x) => x.au),
  'Д12: аудиои ҳар 8 машқ (3-тои нав сабт шуд)');
const tot = g12.examples.find((x) => x.sentence === 'Тот дом большой.');
check('C10', !!tot && tot.au.includes('/audio/ru/') && !g12.examples.some((x) => x.sentence === 'То большой дом.')
  && g12.topic.explanation.includes('**Эта ручка моя.**'), 'Д12: мисоли «Тот дом большой.» + муқоисаи «Эта ручка моя ↔ Это моя ручка»');

// ── R9: Д11 ──
check('C11', !JSON.stringify(g11.ex).match(/стоил|Саволро тоҷикӣ|Шумориданашаванда|лозим ҷамъ/)
  && !g11.rules.some((r) => /much|many/.test(r.note ?? '')) && g11.topic.explanation.includes('долларов'),
  'Д11: бе «стоил/стоило», «much/many», имлои «шумурда»; «долларов» шарҳ дода шуд');

// ── R6, R8, R7, R4: матнҳо ──
const P = Object.fromEntries([12, 13, 15, 17].map((i) => [i, comp(i).passage]));
check('C12', !/даёт|его|ему/.test(P[12] + JSON.stringify(q(12))) && ans(12, 3) === 'Картой' && !q(12).some((x) => /Дополните/.test(x.question)),
  'Д13: «даёт / его / ему / Дополните» нестанд', P[12]);
check('C13', !/даёт|находится/.test(P[13] + JSON.stringify(q(13))) && ans(13, 3) === 'Чёрные брюки', 'Д14: «даёт», «находится» нестанд; савол дар бораи дӯст');
check('C14', q(15).length === 4 && !/Давайте|одежда|Куда|Зелёную|больницу/.test(P[15] + JSON.stringify(q(15))), `Д16: матни нав + ${q(15).length} савол`, P[15]);
check('C15', !/мамой|спрашивает|мальчик|Фрукты|Менеджер|Выберите|Как будет/.test(P[17] + JSON.stringify(q(17)))
  && q(17).length === 8 && q(17).every((x) => x.options.length === 3), 'Д18: бе шаклҳои наомӯхта ва дастурҳои русӣ; ҳама 3 вариант', P[17]);
const allQ = [12, 13, 15, 17].flatMap((i) => q(i));
check('C16', !allQ.some((x) => x.question.includes(String.fromCharCode(39))) && allQ.every((x) => /[ӣӯҳҷқғ]/i.test(`${x.explanation} ${x.questionTranslated}`)),
  `ҳамаи ${allQ.length} савол: бе нохунаки рост, тавзеҳ/тарҷумаи тоҷикӣ`);
const trAll = [12, 13, 15, 17].map((i) => comp(i).passageTranslated ?? '').join(' | ');
check('C17', !/меистад|курти |пакетам|Вай даҳ| чек /.test(trAll), 'тоҷикӣ: «меистад», «курти», «пакетам», «чек» нестанд');

// ── R2: муколама ──
const dl = comp(14)?.lines ?? [];
check('C18', dl.length === 8 && dl[4].text === 'Хорошо. Я плачу картой.' && dl[5].text === 'Вот ваш чек.'
  && new Set(dl.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, `муколама: ${dl.length} сатр, ҳама аз як сабт`);
const [dt] = await sql`SELECT title FROM "Dialogue" WHERE id=(SELECT "dialogueId" FROM "Lesson" WHERE id=${m8.lessons[14].id})`;
check('C19', dt.title === 'Разговор в магазине', `унвони муколама: «${dt.title}»`);

// ── R5: аксҳо ──
const IMG = ['доллар', 'наличные', 'упаковка', 'чек', 'список', 'карта', 'футболка'];
const keep = ['деньги', 'коробка', 'кредитная_карта'];
const st = async (k) => (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status;
const gone = await Promise.all(IMG.map(st)), kept = await Promise.all(keep.map(st));
check('C20', gone.every((s) => s === 404) && kept.every((s) => s === 200), `аксҳо: 7 нест (${gone.join(',')}), «Деньги / Коробка / Кредитная карта» боқӣ (${kept.join(',')})`);

// ── аудио ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...dl.map((x) => x.audioUrl),
  ...[12, 13, 15, 17].map((i) => comp(i).audioUrl),
  ...g11.examples.map((x) => x.au), ...g12.examples.map((x) => x.au),
  ...g11.ex.map((x) => x.au), ...g12.ex.map((x) => x.au),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1 || v.speech < 0.1);
check('A1', urls.length >= 90 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`, silent.map(([u]) => u.slice(-28)).join(' '));
const clip = Object.entries(m).filter(([u, v]) => v.peak > 0.99 && !u.includes('e05ed2b8'));
check('A2', !clip.length && !/error/i.test(r.stderr), 'аудиои нав бе клиппинг, дешифргар хато надод', clip.map(([u]) => u.slice(-28)).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
