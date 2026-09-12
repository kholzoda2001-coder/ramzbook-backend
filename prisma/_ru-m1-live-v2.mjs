// Санҷиши ЗИНДА — на аз база, балки аз API-и продакшн, айнан ҳамон ки барнома
// дар телефон мегирад. Ҳалқаи охир: кэши Vercel ё сохтори ҷавоб чизеро гум
// накардааст. Намуна: `_ar-m1-live.mjs`.
//
//   node prisma/_ru-m1-live-v2.mjs
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
const m1 = a1?.modules?.[0];
check('L1', !!m1 && m1.lessons.length === 14, 'API Модули 1-ро бо 14 дарс медиҳад', m1 ? `«${m1.titleTranslated}»` : '');
const [dbMod] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m1.id}`;
check('L2', m1.contentVersion === dbMod.v, `версияи бахш дар API = база (${m1.contentVersion} / ${dbMod.v})`);

const lessons = [];
for (const l of m1.lessons) {
  const r = await fetch(`${API}/lessons/${l.id}`);
  lessons.push(r.ok ? await r.json() : null);
}
check('L3', lessons.every(Boolean), 'ҳамаи 14 дарс HTTP 200');
const words = lessons.flatMap((l) => l.words ?? []);
const comp = (i) => lessons[i].component;

// ── Мазмун ───────────────────────────────────────────────────────────────────
const q = (i) => comp(i).questions;
const opts = (i, n) => q(i)[n].options.join(' / ');
check('C1', !JSON.stringify(lessons.map((l) => l.component?.questions ?? [])).includes('Врач'),
  'дар ягон вариант «Врач» нест');
check('C2', q(9)[1].question === 'Кто Анна?' && q(9)[3].options[2] === 'Студент' && q(9)[3].correctIndex === 2,
  '#9 саволҳо нав', `Q2: ${q(9)[1].question} [${opts(9, 1)}] · Q4: [${opts(9, 3)}]`);
check('C3', q(13)[2].question === 'Дополните: ___, учитель!' && q(13)[2].options[q(13)[2].correctIndex] === 'Доброе утро',
  '#13 саволи 3 нав ва ҷавоб дуруст', `[${opts(13, 2)}]`);
// Тавзеҳ «тоҷикӣ» аст, агар ҳарфи хоси тоҷикӣ, ё калимаи «матн», ё ТАРҶУМАИ тоҷикии
// калимаи модул дошта бошад («Салом = Здравствуйте.», «зан → Она.» — ҳарфи хос
// надоранд, вале тоҷикианд). Айби аслӣ тавзеҳе буд, ки ТАНҲО ҷумлаи русӣ буд
// («Он учитель.»).
const tgWords = new Set(words.flatMap((x) => (x.translation ?? '').toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i)).filter((s) => s.length >= 3));
const isTajik = (e) => /[ӣӯҳҷқғ]/i.test(e) || /матн/i.test(e)
  || e.toLowerCase().split(/[^а-яёӣӯҳҷқғ]+/i).some((t) => tgWords.has(t));
const allExpl = [8, 9, 11, 13].flatMap((i) => q(i).map((x) => ({ i, e: x.explanation || '' })));
const nonTg = allExpl.filter((x) => !isTajik(x.e));
check('C4', !nonTg.length, `ҳамаи ${allExpl.length} тавзеҳи фаҳмиш тоҷикӣ`, nonTg.map((x) => `#${x.i}: ${x.e}`).join('\n     '));
check('C5', comp(9).passage.includes('До свидания!') && !comp(9).passage.includes('познакомиться'),
  '#9 матни нав', comp(9).passage);
check('C6', !comp(13).passage.includes('подруга'), '#13 матн бе «подруга»', comp(13).passage);
check('C7', comp(10).lines[0].text === 'Привет.' && comp(10).lines[1].text === 'Привет.' &&
  comp(10).lines.every((l) => l.speaker !== 'Анна'), '#10 муколама: «Привет», Сара',
  comp(10).lines.map((l) => `${l.speaker}: ${l.text}`).join(' · '));
check('C8', comp(7).rules.some((r) => r.pattern.startsWith('Его зовут')), '#7 қоидаи «Его/Её зовут»');
check('C9', comp(7).examples.find((e) => e.sentence.startsWith('Вот окно')).translation.includes('Вай'),
  '#7 «Оно большое» = «Вай калон аст»');
const w = (i, ru) => (lessons[i].words ?? []).find((x) => x.word === ru);
check('C10', w(1, 'Не за что').exampleTrans.startsWith('Ташаккур') && w(12, 'Не за что').exampleTrans.startsWith('Ташаккур'),
  '«Не за что» = «Ташаккур!» дар ҳарду дарс');
check('C11', w(3, 'Кто').example === 'Кто это?' && w(3, 'Как').example === 'Как дела?', '#3 мисолҳои нав');
check('C12', words.every((x) => (x.ipaTajik ?? '').trim()), `транскрипсия: ${words.filter((x) => (x.ipaTajik ?? '').trim()).length}/${words.length}`);
const dupEmoji = lessons.map((l, i) => {
  const e = (l.words ?? []).map((x) => (x.emoji ?? '').replace('️', ''));
  return new Set(e).size !== e.length ? i : null;
}).filter((x) => x !== null);
check('C13', !dupEmoji.length, 'дар ягон дарс эмоҷии такрорӣ нест', dupEmoji.length ? `дарсҳо: ${dupEmoji}` : '');
const emo = (ru) => [...new Set(words.filter((x) => x.word === ru).map((x) => x.emoji))];
check('C14', emo('Ты').length === 1 && emo('Пожалуйста').length === 1, 'як калима = як эмоҷӣ дар тамоми модул',
  `Ты ${emo('Ты')} · Пожалуйста ${emo('Пожалуйста')}`);

// ── Аудио: ҳар URL-и API зинда ва садодор ────────────────────────────────────
const urls = [
  ...words.map((x) => x.audioUrl),
  ...lessons.flatMap((l) => l.component?.lines?.map((x) => x.audioUrl) ?? []),
  ...lessons.flatMap((l) => l.component?.examples?.map((x) => x.audioUrl) ?? []),
  ...lessons.map((l) => l.component?.audioUrl).filter(Boolean),
].filter(Boolean);
// API калимаҳои модулро дар ҷавоби чанд дарс такрор мекунад — ҳар файл як бор.
const unique = [...new Set(urls)];
console.log(`     (URL дар ҷавобҳо: ${urls.length}, беназир: ${unique.length})`);
urls.length = 0;
urls.push(...unique);
const r = spawnSync('python', ['../tools/audio_check.py', ...urls],
  { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
const m = JSON.parse(r.stdout);
const silent = Object.entries(m).filter(([, v]) => v.error || v.peak < 0.1);
check('A1', urls.length === 61 && !silent.length, `аудио аз API: ${urls.length} файл, хомӯш/шикаста: ${silent.length}`,
  silent.map(([u, v]) => `${u.split('/').pop()} ${v.error ?? 'peak ' + v.peak}`).join('\n     '));
check('A2', !/error/i.test(r.stderr), 'дешифргар ҳеҷ хато надод');

console.log(`\n${fail ? `❌ ${fail} санҷиш ноком` : '✅ ҲАМАИ САНҶИШҲО ГУЗАШТАНД'}`);
process.exit(fail ? 1 : 0);
