// Санҷиши ЗИНДАИ Модули 7-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m7-live.mjs
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
const m7 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[6];
check('L1', !!m7 && m7.lessons.length === 17, 'API Модули 7-ро бо 17 дарс медиҳад', m7 ? `«${m7.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m7.id}`;
check('L2', m7.contentVersion === db.v && db.v >= 3, `версия: API ${m7.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m7.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 17 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (x) => words.find((y) => y.word === x);

// ── R2: калимаи такрорӣ ──
check('C1', !w('Дом / Родина') && !!w('Стена') && w('Стена').translation === 'Девор' && words.filter((x) => x.word === 'Дом').length >= 1,
  'Д2: «Дом / Родина» (такрори «Дом») → «Стена» = «Девор»');
check('C2', (w('Стена').audioUrl ?? '').includes('/audio/ru/') && (w('Стена').example ?? '') === 'Это стена.',
  'Д2 «Стена»: мисол ва аудиои худ дорад');

// ── R8, R11: тарҷумаҳо ──
const TR = { 'Ручка': 'Ручка', 'Карандаш': 'Қалам', 'Над': 'Болои (дар ҳаво)', 'Ниже': 'Пасттар аз', 'На': 'Дар болои' };
const badTr = Object.entries(TR).filter(([k, v]) => w(k)?.translation !== v);
check('C3', !badTr.length, 'тарҷумаҳо: Ручка / Қалам, «Над» ва «На» дигар як хел нестанд', badTr.map(([k]) => `${k}: ${w(k)?.translation}`).join(', '));
check('C4', w('Ниже').example === 'Полка ниже окна.', '«Ниже»: мисоли табиӣ («Коробка ниже окна» дигар нест)', w('Ниже').example);

// ── R12: мисолҳои қаторӣ ──
check('C5', w('Комната').example === 'Дом, комната, кухня.' && w('Стул').example === 'Кровать, стул, диван.'
  && w('Растение').example === 'Картина, растение, сад.', 'мисолҳои қаторӣ (сохтани ҷумла имконпазир)');

// ── R9: эмоҷӣ ──
const EMO = { 'Гардероб': '🧥', 'Растение': '🪴', 'Тетрадь': '📓', 'Часы': '🕰', 'Стол': '🍽' };
const badEmo = Object.entries(EMO).filter(([k, v]) => w(k)?.emoji !== v);
check('C6', !badEmo.length, 'эмоҷӣ: 🧥 гардероб, 🪴 растанӣ, 📓 дафтар, 🕰 соат, 🍽 миз', badEmo.map(([k]) => `${k}: ${w(k)?.emoji}`).join(', '));

// ── R13: дистракторҳои Д11 ──
let gram11 = comp(10);
if (!gram11?.exercises) {
  const [l] = await sql`SELECT "grammarTopicId" g FROM "Lesson" WHERE id=${m7.lessons[10].id}`;
  gram11 = { exercises: await sql`SELECT prompt,answer,options FROM "GrammarExercise" WHERE "topicId"=${l.g} ORDER BY "order"` };
}
const opts11 = JSON.stringify(gram11.exercises.map((e) => e.options ?? []));
check('C7', !/суть|являются|Является/.test(opts11), 'Д11: дистракторҳои «суть / являются / Является» нестанд', opts11.slice(0, 120));

// ── R7: хониш ──
check('C8', q(11)[0].question === 'Что есть в моей спальне?' && q(11)[1].question === 'Где мои книги?'
  && ans(11, 1) === 'На письменном столе', 'Д12: саволи грамматикӣ ва «Сколько спален» → фаҳмиши матн');

// ── R3, R5, R4: матнҳо ──
const P = { 12: comp(12).passage, 14: comp(14).passage, 16: comp(16).passage };
check('C9', !/в нём|На полу/.test(P[12] + JSON.stringify(q(12))) && ans(12, 0) === 'Телевизор' && ans(12, 3) === 'На столе',
  'Д13: «в нём», «там», «На полу» нестанд', P[12]);
check('C10', q(14).length === 4 && !/Давайте/.test(P[14]) && ans(14, 2) === 'Рядом с кроватью' && ans(14, 3) === 'В спальне',
  `Д15: матни нав + ${q(14).length} савол (пешояндҳо ва «нет»)`, P[14]);
check('C11', !/стоит/.test(P[16]) && /есть два стула/.test(P[16]) && ans(16, 2) === 'Под письменным столом'
  && !q(16).some((x) => /Сколько стульев/.test(x.question)), 'Д17: «стоит» ва «Сколько стульев» нестанд', P[16]);
const allQ = [11, 12, 14, 16].flatMap((i) => q(i));
check('C12', !allQ.some((x) => x.question.includes(String.fromCharCode(39)))
  && !allQ.some((x) => /Выберите|Как будет/.test(x.question))
  && q(16).every((x) => x.options.length === 3), 'нохунаки рост, «Выберите», «Как будет» нестанд; имтиҳон 3 вариант');
const TG_FUNC = /(^|\s)(дар|матн|аст|ва|бе|бо|аз|ки|ин|он|ҳаст|нест|инкор|пас|тоза|ифлос|мизи|болои|зери|паҳлӯи|хона|ҳуҷра|китоб|чароғ|телевизор)(\s|$|[.,:;!?»])/i;
const nonTg = allQ.filter((x) => !/[ӣӯҳҷқғ]/i.test(x.explanation ?? '') && !TG_FUNC.test(x.explanation ?? ''));
check('C13', !nonTg.length, `ҳамаи ${allQ.length} тавзеҳи фаҳмиш тоҷикӣ`, nonTg.map((x) => x.explanation).join(' | '));

// ── R10: тоҷикӣ ──
const trAll = [comp(11), comp(12), comp(14), comp(16)].map((c) => c.passageTranslated ?? '').join(' | ');
check('C14', !/хобгоҳ|Сумкаи|Ашёҳоро|хоби ман, як/.test(trAll), 'тоҷикӣ: «хобгоҳ», «Сумкаи ман», «Ашёҳоро», вергули зиёдатӣ нестанд');

// ── R6: муколама ──
const lines = comp(13)?.lines ?? [];
check('C15', lines.length === 8 && lines[7].text === 'Нет, компьютера нет.'
  && new Set(lines.map((l) => l.audioUrl?.split('@')[1]?.split('/')[0])).size === 1, `муколама: ${lines.length} сатр, ҳама аз як сабт`);

// ── аудио ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...lessons.map((l) => l.component?.audioUrl),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1 || v.speech < 0.1);
check('A1', urls.length >= 74 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`, silent.map(([u]) => u.slice(-28)).join(' '));
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
