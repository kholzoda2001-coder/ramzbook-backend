// Санҷиши ЗИНДАИ Модули 3-и русӣ аз API-и продакшн — айнан он чи телефон мегирад.
//   node prisma/_ru-m3-live.mjs
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
const m3 = (cj.courses ?? cj).find((c) => c.level === 'A1')?.modules?.[2];
check('L1', !!m3 && m3.lessons.length === 17, 'API Модули 3-ро бо 17 дарс медиҳад', m3 ? `«${m3.titleTranslated}»` : '');
const [db] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m3.id}`;
check('L2', m3.contentVersion === db.v && db.v >= 2, `версия: API ${m3.contentVersion} = база ${db.v}`);
const lessons = [];
for (const l of m3.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 17 дарс HTTP 200');
const comp = (i) => lessons[i].component;
const q = (i) => comp(i).questions;
const ans = (i, n) => q(i)[n].options[q(i)[n].correctIndex];
const words = lessons.flatMap((l) => l.words ?? []);
const w = (i, ru) => (lessons[i].words ?? []).find((x) => x.word === ru);
const COMP = [11, 12, 15, 16];

// ── R1/R3: рақам, касб ва шакли номи наомӯхта ──
const opts = COMP.flatMap((i) => q(i).flatMap((x) => x.options));
const BANNED = ['Один', 'Два', 'Три', 'Врач', 'Медсестра', 'Учительница', 'Анны', 'Карима', 'Сары'];
check('C1', !BANNED.some((b) => opts.includes(b)), 'дар вариантҳо рақам/касб/шакли наомӯхта нест', BANNED.filter((b) => opts.includes(b)).join(', '));
const p13 = comp(12).passage, p17 = comp(16).passage;
check('C2', !/врач|один|учительница/i.test(p13) && p13.includes('инженер'), 'Д13 (шунавоӣ): матни нав', p13);
check('C3', !/врач|два брата|одна сестра/i.test(p17), 'Д17 (имтиҳон): матни нав', p17);
check('C4', p13.includes('подруга Сара') && ans(12, 0) === 'Сара' && p13.includes('мать учитель') && ans(12, 1) === 'Учитель'
  && p13.includes('брат и сестра') && ans(12, 2) === 'Брат и сестра' && p13.includes('высокий и сильный') && ans(12, 3) === 'Высокий и сильный',
  'Д13: ҳар ҷавоби дуруст дар матн тасдиқ мешавад');
check('C5', p17.includes('отец учитель') && ans(16, 1) === 'Учитель' && p17.includes('мать инженер') && ans(16, 2) === 'Инженер'
  && p17.includes(ans(16, 3).replace('.', '').replace('У меня есть ', '')) && ans(16, 7) === 'братья',
  'Д17: ҷавобҳои дуруст ба матн мувофиқ', q(16).map((x) => `${x.question} → ${x.options[x.correctIndex]}`).join(' · '));

// ── R4 / R6: тавзеҳ, такрор, ҷавоб дар савол, нохунак ──
const tgWords = new Set(words.flatMap((x) => (x.translation ?? '').toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i)).filter((s) => s.length >= 3));
const TG_FUNC = new Set(['аст', 'дар', 'матн', 'ва', 'бо', 'аз', 'ман', 'ӯ', 'пас', 'на']);
const isTg = (e) => /[ӣӯҳҷқғ]/i.test(e) || e.toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i).some((t) => tgWords.has(t) || TG_FUNC.has(t));
const expl = COMP.flatMap((i) => q(i).map((x) => ({ i, e: x.explanation || '' })));
const nonTg = expl.filter((x) => !isTg(x.e));
check('C6', !nonTg.length, `ҳамаи ${expl.length} тавзеҳ тоҷикӣ`, nonTg.map((x) => `Д${x.i + 1}: ${x.e}`).join('\n     '));
check('C7', !/Повторение Модуля/.test(comp(15).passage) && q(15).length === 4, `Д16 матни воқеӣ + ${q(15).length} савол`, comp(15).passage);
check('C8', !/\(братья/.test(q(16)[7].question) && !COMP.some((i) => q(i).some((x) => x.question.includes("'"))),
  'ҷавоб дар савол нест, нохунаки рост нест');

// ── R2, R8, R9, R10 ──
check('C9', words.every((x) => (x.ipaTajik ?? '').trim()), `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}`);
const dup = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => (x.emoji ?? '').replace('️', ''));
  return new Set(e).size !== e.length ? `Д${i + 1}` : null;
}).filter(Boolean);
check('C10', !dup.length && w(6, 'Близнецы').emoji === '👶👶' && w(5, 'Высокий').emoji.startsWith('⬆'), 'эмоҷӣ: такрор нест, 👶👶, ⬆️', dup.join(', '));
check('C11', w(1, 'Жена').translation === 'Зан, ҳамсар' && w(5, 'Хороший').translation === 'Хуб' && w(5, 'Хороший').example === 'Он хороший.',
  'тарҷумаҳо: «Зан, ҳамсар», «Хуб»');
const ownEx = [[1, 'Семья'], [1, 'Родители'], [4, 'Незнакомец'], [5, 'Хороший'], [6, 'Близнецы'], [14, 'Семья']]
  .filter(([i, ru]) => !w(i, ru).example.toLowerCase().includes(ru.toLowerCase())).map(([i, ru]) => `Д${i + 1} ${ru}`);
check('C12', !ownEx.length, 'мисолҳои ислоҳшуда калимаи худро доранд', ownEx.join(', '));
check('C13', !/нағз/.test(comp(11).passageTranslated), 'Д12 тарҷума: «хуб»');

// ── R5: грамматика (аз API агар бошад, вагарна аз база) ──
let gramOk, gramSrc;
const ex8 = comp(8)?.exercises, ex9 = comp(9)?.exercises, ex10 = comp(10)?.exercises;
if (ex8 && ex9 && ex10) {
  gramSrc = 'API';
  gramOk = !ex8.some((e) => /имеет/.test(e.prompt)) && !ex9.some((e) => /[A-Za-z]/.test(e.explanation ?? ''))
    && !ex10.some((e) => /бист сола/.test(e.promptTranslated ?? '')) && !/бист сола/.test(comp(10).explanation ?? '')
    && comp(9).explanation.includes('**дом→дома** — истисно');
} else {
  gramSrc = 'база';
  const ids = [8, 9, 10].map((i) => m3.lessons[i].id);
  const g = await sql`SELECT e.prompt, e."promptTranslated" pt, e.explanation ex FROM "GrammarExercise" e JOIN "Lesson" l ON l."grammarTopicId"=e."topicId" WHERE l.id = ANY(${ids})`;
  const t = await sql`SELECT t.explanation ex FROM "GrammarTopic" t JOIN "Lesson" l ON l."grammarTopicId"=t.id WHERE l.id = ANY(${ids})`;
  gramOk = !g.some((e) => /имеет/.test(e.prompt) || /[A-Za-z]/.test(e.ex ?? '') || /бист сола/.test(e.pt ?? ''))
    && !t.some((x) => /бист сола/.test(x.ex)) && t.some((x) => x.ex.includes('**дом→дома** — истисно'));
}
check('C14', gramOk, `грамматика: бе «имеет», бе англисӣ, «бистсола», «дом→дома — истисно» (${gramSrc})`);

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
check('A1', urls.length === 75 && !silent.length, `аудио: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`);
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');
const IMG = ['семья', 'тётя', 'команда', 'близнецы', 'родители', 'бабушка_и_дедушка'];
const st = await Promise.all(IMG.map(async (k) =>
  (await fetch(`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ru/${encodeURIComponent(k)}.png`, { method: 'HEAD' })).status));
check('I1', st.every((s) => s === 404), '6 акси нодуруст аз CDN нопадид', IMG.map((k, i) => `${k}:${st[i]}`).join(' '));

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
