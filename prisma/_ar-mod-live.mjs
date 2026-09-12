// Санҷиши ЗИНДА — аз API-и продакшн, ҳамон тавре ки барнома мебинад.
// Ин охирин ҳалқа: агар кэши Vercel ё сохтори ҷавоб чизе гум кунад, ин ҷо
// маълум мешавад.
//
//   node prisma/_ar-mod-live.mjs 1
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const API = 'https://admin.ramz.tj/api/mobile';
const ORDER = Number(process.argv[2] ?? 0);

const [ar] = await sql.query(`SELECT id FROM "Language" WHERE code='ar'`);
const [tg] = await sql.query(`SELECT id FROM "Language" WHERE code='tg'`);
const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [dbMod] = await sql.query(
  `SELECT "contentVersion" v, "titleTranslated" t FROM "Module" WHERE "courseId"=$1 AND "order"=$2`,
  [course.id, ORDER]);

let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? '\n     ' + detail : ''}`);
};

const cJson = await (await fetch(`${API}/courses?targetLanguageId=${ar.id}&nativeLanguageId=${tg.id}`)).json();
const courses = cJson.courses ?? cJson;
const a1 = (Array.isArray(courses) ? courses : []).find((c) => c.level === 'A1');
check('L1', !!a1, 'API курси A1-и арабиро медиҳад');
if (!a1) process.exit(1);

const m = (a1.modules ?? []).find((x) => x.order === ORDER) ?? (a1.modules ?? [])[ORDER];
check('L2', !!m, `API бахши №${ORDER}-ро медиҳад`,
  m ? `«${m.titleTranslated}» · ${(m.lessons ?? []).length} дарс` : '');
if (!m) process.exit(1);

check('L3', (m.contentVersion ?? 0) >= dbMod.v,
  `версия ба барнома мерасад (API ${m.contentVersion} · база ${dbMod.v})`,
  (m.contentVersion ?? 0) >= dbMod.v ? '' : 'кэши Vercel нусхаи кӯҳнаро медиҳад');
check('L4', !!(m.canDoStatement ?? '').trim(), 'ваъдаи бахш мерасад', m.canDoStatement ?? '(холӣ)');

let words = [], passages = [], lines = [];
for (const id of (m.lessons ?? []).map((l) => l.id)) {
  const r = await fetch(`${API}/lessons/${id}`);
  if (!r.ok) { check('L5', false, `дарси ${id} → HTTP ${r.status}`); continue; }
  const j = await r.json();
  const L = j.lesson ?? j;
  words = words.concat(L.words ?? []);
  const comp = L.component ?? j.component;
  if (comp?.passage) passages.push(comp);
  if (comp?.lines) lines = lines.concat(comp.lines);
}
const [{ n: dbWords }] = await sql.query(
  `SELECT count(*)::int n FROM "Word" WHERE "lessonId" IN
     (SELECT id FROM "Lesson" WHERE "isActive" AND "moduleId" IN
       (SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=$2))`, [course.id, ORDER]);
check('L5', words.length >= dbWords, `калимаҳо аз API: ${words.length} (база ${dbWords})`);

const HAR = (t) => {
  const l = ((t ?? '').match(/[ء-ي]/g) ?? []).length;
  const k = ((t ?? '').match(/[ً-ْٰ]/g) ?? []).length;
  return l ? k / l : 1;
};
const lowP = passages.filter((p) => HAR(p.passage) < 0.3);
check('L8', passages.length > 0 && lowP.length === 0,
  `матнҳо ҳаракатдор мерасанд (${passages.length})`,
  lowP.map((p) => `${p.titleTranslated}: ${HAR(p.passage).toFixed(2)}`).join(', '));

const lowD = lines.filter((s) => HAR(s.text) < 0.3);
check('L9', lines.length === 0 || lowD.length === 0,
  `муколама ҳаракатдор мерасад (${lines.length} сатр)`, lowD.map((s) => s.text).join(' | '));

check('L10', words.every((w) => w.audioUrl), 'ҳар калима аз API аудио дорад',
  words.filter((w) => !w.audioUrl).map((w) => w.word).join(' '));

console.log(`\n${fail === 0 ? '🎉 API-и ЗИНДА ТОЗА' : `⚠️  ${fail} банд`}`);
process.exit(fail === 0 ? 0 : 1);
