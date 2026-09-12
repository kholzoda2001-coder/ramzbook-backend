// Санҷиши ЗИНДАИ Модули 2-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m2-live.mjs
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
const a1 = (cj.courses ?? cj).find((c) => c.level === 'A1');
const m2 = a1?.modules?.[1];
check('L1', !!m2 && m2.lessons.length === 15, 'API Модули 2-ро бо 15 дарс медиҳад', m2 ? `«${m2.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m2.id}`;
check('L2', m2.contentVersion === db.v && db.v >= 2, `версия: API ${m2.contentVersion} = база ${db.v}`);

const lessons = [];
for (const l of m2.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 15 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const words = lessons.flatMap((l) => l.words ?? []);
const w = (i, ru) => (lessons[i].words ?? []).find((x) => x.word === ru);

// ── R1/R5: ҳеҷ рақам/шаҳри наомӯхта дар вариантҳо ──
const allOpts = [9, 10, 13, 14].flatMap((i) => q(i).flatMap((x) => x.options));
const BANNED = ['Пять', 'Пятнадцать', 'Пятьдесят', 'Двенадцать', 'Восемнадцать', 'Москва', 'Праздник'];
const found = BANNED.filter((b) => allOpts.includes(b));
check('C1', !found.length, 'дар вариантҳо рақам/шаҳри наомӯхта нест', found.join(', '));
check('C2', !/пятнадцать/i.test(comp(10).passage) && comp(10).passage.includes('Мне десять лет') && comp(10).passage.includes('Рустам'),
  'Д11 матни нав', comp(10).passage);
check('C3', q(10).every((x) => !/Карим/.test(x.question)) && q(10)[1].options[q(10)[1].correctIndex] === 'Мне десять лет.',
  'Д11 саволҳо ба матни нав мувофиқ', q(10).map((x) => `${x.question} → ${x.options[x.correctIndex]}`).join(' · '));
// Ҷавоби ҳар саволи Д11 воқеан дар матн ҳаст
const p11 = comp(10).passage;
const ans11 = q(10).map((x) => x.options[x.correctIndex]);
check('C4', ans11[0] === 'Таджикистан' && p11.includes('из Таджикистана') && ans11[2] === 'Душанбе' && p11.includes('в Душанбе')
  && ans11[3] === 'Таджикский и русский' && p11.includes('на таджикском и русском'), 'Д11 ҳар ҷавоб дар матн тасдиқ мешавад');
check('C5', q(14)[1].options[q(14)[1].correctIndex] === 'Двадцать' && q(14)[7].options[q(14)[7].correctIndex] === 'Девятнадцать'
  && q(14)[3].options[q(14)[3].correctIndex] === 'Душанбе', 'имтиҳон: ҷавобҳои дуруст ҳамон мондаанд (20, 19, Душанбе)');

// ── R4: тавзеҳҳо тоҷикӣ ──
const tgWords = new Set(words.flatMap((x) => (x.translation ?? '').toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i)).filter((s) => s.length >= 3));
// «Дар матн: … Анна бистсола аст.» — тоҷикӣ, вале бе ҳарфи хос: калимаҳои пайвандакӣ ҳам санҷида мешаванд.
const TG_FUNC = new Set(['аст', 'дар', 'матн', 'ва', 'бо', 'аз', 'ман', 'ӯ', 'пас', 'на']);
const isTg = (e) => /[ӣӯҳҷқғ]/i.test(e) || e.toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i).some((t) => tgWords.has(t) || TG_FUNC.has(t));
const expl = [9, 10, 13, 14].flatMap((i) => q(i).map((x) => ({ i, e: x.explanation || '' })));
const nonTg = expl.filter((x) => !isTg(x.e));
check('C6', !nonTg.length, `ҳамаи ${expl.length} тавзеҳ тоҷикӣ`, nonTg.map((x) => `Д${x.i + 1}: ${x.e}`).join('\n     '));

// ── R6, R7, R8, R9, R10 ──
const ex9 = comp(8).examples.map((e) => e.translation).join(' | ');
check('C7', !/(^|\. )Он (калон|ҷолиб|нав) аст/.test(ex9) && comp(7).examples.some((e) => e.translation === 'Ин мард кист?'),
  'Д8–Д9: «Он»-и тоҷикӣ ба ҷои ҷонишин нест', ex9);
const noOwn = words.filter((x) => {
  const key = x.word.toLowerCase().slice(0, 4);
  return x.example && !x.example.toLowerCase().includes(key);
}).map((x) => x.word);
check('C8', ['Возраст', 'Старый', 'Молодой', 'Страна', 'Город', 'Язык'].every((k) => !noOwn.includes(k)),
  '6 мисоли ислоҳшуда калимаи худро доранд', noOwn.length ? `ҳанӯз бе калима (шакли сарфшуда): ${[...new Set(noOwn)].join(', ')}` : '');
check('C9', !/Повторение Модуля/.test(comp(13).passage) && comp(13).passage.split('.').length >= 6, 'Д14 матни воқеӣ дорад', comp(13).passage);
check('C10', comp(11).lines.slice(0, 2).every((l) => l.text === 'Привет!') && !comp(11).lines.some((l) => /Здравствуйте/.test(l.text)),
  'Д12 муколама: бе «Здравствуйте»');
check('C11', q(14)[5].question.includes('Я из Таджикистана') && !/откуда, не где/.test(q(14)[5].question) && q(14)[5].options.includes('Где'),
  'Д15 Q6 ҷавобро дар худ намегӯяд', `${q(14)[5].question} [${q(14)[5].options.join(' / ')}]`);

// ── R11, R13, R14 ──
const dupEmoji = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => (x.emoji ?? '').replace('️', ''));
  return new Set(e).size !== e.length ? `Д${i + 1}` : null;
}).filter(Boolean);
check('C12', !dupEmoji.length && w(3, 'Продавец').emoji === '🏪' && w(12, 'Англия').emoji === '🇬🇧' && w(0, 'Сегодня').emoji === '☀️', 'эмоҷӣ: такрор нест, 🏪, 🇬🇧, ☀️', dupEmoji.join(', '));
const tgAll = [9, 10, 13, 14].map((i) => comp(i).passageTranslated).join(' ');
check('C13', !/(Номи|Дӯсти) ман [А-ЯЁӢӮҲҶҚҒ][а-яёӣӯҳҷқғ]+\./.test(tgAll) && !/\S+ сола /.test(tgAll), 'тарҷумаи матнҳо: «аст» ҳаст, «бистсола» якҷоя');
check('C14', !words.some((x) => /^Вай /.test(x.exampleTrans ?? '')), 'мисолҳои шахс: «Ӯ», на «Вай»');
check('C15', ![...q(13), ...q(14)].some((x) => x.question.includes("'")), 'нохунаки рост дар саволҳо нест');
check('C16', words.every((x) => (x.ipaTajik ?? '').trim()) && w(3, 'Холост').ipaTajik === 'хало́ст',
  `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}, «Холост» = хало́ст`);
check('C17', w(0, 'Сегодня').partOfSpeech === 'adverb' && w(5, 'Здесь').partOfSpeech === 'adverb', '«Сегодня», «Здесь» = зарф');

// ── Аудио: ҳар URL аз API садо дорад ──
const urls = [...new Set([
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...lessons.map((l) => l.component?.audioUrl),
].filter(Boolean))];
const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1);
check('A1', urls.length === 78 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`);
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
