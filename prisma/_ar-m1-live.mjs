// Санҷиши ЗИНДА — на аз база, балки аз API-и продакшн, ҳамон тавре ки
// барнома дар телефон мебинад. Ин охирин ҳалқа аст: агар кэши Vercel ё
// сохтори ҷавоб чизеро гум кунад, ин ҷо маълум мешавад.
//
//   node prisma/_ar-m1-live.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const API = 'https://admin.ramz.tj/api/mobile';

const [ar] = await sql.query(`SELECT id FROM "Language" WHERE code='ar'`);
const [tg] = await sql.query(`SELECT id FROM "Language" WHERE code='tg'`);

let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? '\n     ' + detail : ''}`);
};

// ── 1. Курс ва бахш аз API ─────────────────────────────────────────────
const cRes = await fetch(`${API}/courses?targetLanguageId=${ar.id}&nativeLanguageId=${tg.id}`);
const cJson = await cRes.json();
const courses = cJson.courses ?? cJson;
const a1 = (Array.isArray(courses) ? courses : []).find((c) => c.level === 'A1');
check('L1', !!a1, 'API курси A1-и арабиро медиҳад', a1 ? `«${a1.title}»` : JSON.stringify(cJson).slice(0, 160));
if (!a1) process.exit(1);

const mods = a1.modules ?? [];
const m1 = mods[0];
check('L2', !!m1, 'API бахши якумро медиҳад', m1 ? `«${m1.titleTranslated}» · ${(m1.lessons ?? []).length} дарс` : '');

// ── 2. Версия ва ваъдаи бахш ба барнома мерасанд ───────────────────────
check('L3', (m1?.contentVersion ?? 0) >= 4,
  `версияи бахш ба барнома мерасад (contentVersion=${m1?.contentVersion ?? '—'})`,
  (m1?.contentVersion ?? 0) >= 4 ? '' : 'кэши Vercel ҳанӯз нусхаи кӯҳнаро медиҳад');
check('L4', !!(m1?.canDoStatement ?? '').trim(),
  'ваъдаи бахш (canDo) ба барнома мерасад', m1?.canDoStatement ?? '(холӣ)');

// ── 3. Мазмуни ислоҳшуда воқеан дар ҷавоб ҳаст ─────────────────────────
const lessonIds = (m1?.lessons ?? []).map((l) => l.id);
let allWords = [];
let passages = [];
let dialogueLines = [];
for (const id of lessonIds) {
  const r = await fetch(`${API}/lessons/${id}`);
  if (!r.ok) { check('L5', false, `дарси ${id} → HTTP ${r.status}`); continue; }
  const j = await r.json();
  const L = j.lesson ?? j;
  allWords = allWords.concat(L.words ?? []);
  // ⚠️ API ҳар компонентро дар як майдони `component` медиҳад
  // (бо `type`), на бо номҳои ҷудогона — санҷида шуд.
  const comp = L.component ?? j.component;
  if (comp?.passage) passages.push(comp);
  if (comp?.lines) dialogueLines = dialogueLines.concat(comp.lines);
}
check('L5', allWords.length >= 43,
  `калимаҳо аз API: ${allWords.length}`, allWords.length >= 43 ? '' : 'калимаҳои нав нарасидаанд');

const byText = (t) => allWords.find((w) => (w.word ?? '').includes(t));
check('L6', !!byText('مُعَلِّم') && !!byText('تَشَرَّفْنَا') && !!byText('كَيْفَ حَالُكَ'),
  'калимаҳои НАВ ба барнома мерасанд',
  ['مُعَلِّم', 'تَشَرَّفْنَا', 'كَيْفَ حَالُكَ', 'طَالِب', 'أَيْضاً']
    .map((t) => `${byText(t) ? '✓' : '✗'} ${t}`).join(' · '));

const kiWord = allWords.find((w) => w.translation === 'Кӣ');
check('L7', !!kiWord && (kiWord.example ?? '').startsWith('مَنْ'),
  'хатои مِن↔مَنْ дар API ислоҳ аст', kiWord ? kiWord.example : 'калима нест');

const HAR = (t) => {
  const l = (t.match(/[ء-ي]/g) ?? []).length;
  const m = (t.match(/[ً-ْٰ]/g) ?? []).length;
  return l ? m / l : 1;
};
const lowP = passages.filter((p) => HAR(p.passage) < 0.3);
check('L8', passages.length > 0 && lowP.length === 0,
  `матнҳо ҳаракатдор мерасанд (${passages.length} матн)`,
  lowP.map((p) => `${p.titleTranslated}: ${HAR(p.passage).toFixed(2)}`).join(', '));

const lowD = dialogueLines.filter((s) => HAR(s.text) < 0.3);
check('L9', dialogueLines.length > 0 && lowD.length === 0,
  `муколама ҳаракатдор мерасад (${dialogueLines.length} сатр)`,
  lowD.map((s) => s.text).join(' | '));

console.log(`\n${fail === 0 ? '🎉 API-и ЗИНДА ТОЗА' : `⚠️  ${fail} банд`}`);
process.exit(fail === 0 ? 0 : 1);
