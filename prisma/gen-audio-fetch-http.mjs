import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// Ҳамон кори `gen-audio-fetch.mjs`, вале тавассути драйвери HTTP-и Neon.
//
// ЧАРО ЛОЗИМ ШУД: дар баъзе шабакаҳо (провайдер/VPN) порти 5432 «кушода»
// менамояд — TCP пайваст мешавад — вале сӯҳбати воқеии Postgres бурида
// мешавад, ва Prisma «Can't reach database server» медиҳад. Дар ҳамон
// шабака порти 443 бенуқсон кор мекунад.
//
// Драйвери HTTP-и Neon SQL-ро тавассути HTTPS мефиристад, пас 5432 умуман
// лозим нест. Натиҷа айнан ҳамон `tmp/audio-items.json` аст, ки
// `gen-all-audio.mjs` интизор аст.
//
// Истифода:
//   node prisma/gen-audio-fetch-http.mjs           → ҳамаи сатҳҳо
//   node prisma/gen-audio-fetch-http.mjs A2 B1     → танҳо инҳо
// ─────────────────────────────────────────────────────────────────────────────

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
// Сатри ФАЪОЛ (бе `#` дар аввал). Дар .env якчанд вариант ҳаст — кӯҳнаҳо
// шарҳ шудаанд, пас маҳз сатри бешарҳро мегирем.
const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
if (!raw) throw new Error('DATABASE_URL дар .env ёфт нашуд');

// Хости МУСТАҚИМ, на `-pooler`.
//
// Дар ин шабака эндпоинти HTTP-и pooler ба таври ҷиддӣ timeout медиҳад
// (санҷида шуд: 25с бе ҷавоб), дар ҳоле ки хости мустақим фавран ҷавоб
// медиҳад. Драйвери HTTP ба pgbouncer эҳтиёҷ надорад — он ҳар дархостро
// алоҳида мефиристад, пас гум кардани pooler ҳеҷ чизро вайрон намекунад.
// Параметрҳои пул низ барои HTTP бемаъноянд.
const url = raw
    .replace('-pooler.', '.')
    .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, '');

const sql = neon(url);

const LEVELS = process.argv.slice(2).filter(Boolean);
console.log(LEVELS.length ? `Сатҳҳо: ${LEVELS.join(', ')}` : 'Сатҳҳо: ҲАМА');

// `sql(...)` танҳо ҳамчун tagged-template кор мекунад; барои $1/$2 бояд
// `sql.query(...)` даъват шавад.
const rows = async (q, ...p) => await sql.query(q, p);

async function main() {
  const [en] = await rows('SELECT id FROM "Language" WHERE code = $1', 'en');
  const [tg] = await rows('SELECT id FROM "Language" WHERE code = $1', 'tg');
  if (!en || !tg) throw new Error('забони en/tg ёфт нашуд');

  const courses = LEVELS.length
    ? await rows(
        'SELECT id, level FROM "Course" WHERE "targetLanguageId" = $1 AND "nativeLanguageId" = $2 AND level = ANY($3)',
        en.id, tg.id, LEVELS,
      )
    : await rows(
        'SELECT id, level FROM "Course" WHERE "targetLanguageId" = $1 AND "nativeLanguageId" = $2',
        en.id, tg.id,
      );
  const cids = courses.map((c) => c.id);
  console.log(`Курсҳо: ${courses.map((c) => c.level).join(', ') || '(нест)'}`);
  if (!cids.length) throw new Error('курс ёфт нашуд');

  const items = [];

  // Калимаҳо: Word → Lesson → Module → Course
  (await rows(
    `SELECT w.id, w.word AS text FROM "Word" w
       JOIN "Lesson" l ON l.id = w."lessonId"
       JOIN "Module" m ON m.id = l."moduleId"
      WHERE w."audioUrl" IS NULL AND m."courseId" = ANY($1)`, cids,
  )).forEach((r) => items.push({ id: r.id, text: r.text, model: 'word' }));

  // Мисолҳои грамматика: GrammarExample → GrammarTopic → Course
  (await rows(
    `SELECT g.id, g.sentence AS text FROM "GrammarExample" g
       JOIN "GrammarTopic" t ON t.id = g."topicId"
      WHERE g."audioUrl" IS NULL AND t."courseId" = ANY($1)`, cids,
  )).forEach((r) => items.push({ id: r.id, text: r.text, model: 'grammarExample' }));

  // Сатрҳои муколама: DialogueLine → Dialogue → Course
  (await rows(
    `SELECT d.id, d.text AS text FROM "DialogueLine" d
       JOIN "Dialogue" dl ON dl.id = d."dialogueId"
      WHERE d."audioUrl" IS NULL AND dl."courseId" = ANY($1)`, cids,
  )).forEach((r) => items.push({ id: r.id, text: r.text, model: 'dialogueLine' }));

  // Матнҳои фаҳмиш: бевосита ба Course
  (await rows(
    `SELECT c.id, c.passage AS text FROM "ComprehensionExercise" c
      WHERE c."audioUrl" IS NULL AND c."courseId" = ANY($1)`, cids,
  )).forEach((r) => items.push({ id: r.id, text: r.text, model: 'comprehensionExercise' }));

  const valid = items.filter((it) => (it.text || '').trim().length > 0);
  const byModel = valid.reduce((a, it) => ((a[it.model] = (a[it.model] || 0) + 1), a), {});

  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });
  writeFileSync('tmp/audio-items.json', JSON.stringify(valid));

  // Арзиши тахминии OpenAI TTS ($0.015 / 1000 ҳарф — gpt-4o-mini-tts).
  const chars = valid.reduce((n, it) => n + it.text.trim().length, 0);
  console.log(`✅ ${valid.length} айтем → tmp/audio-items.json ${JSON.stringify(byModel)}`);
  console.log(`   ҳарфҳо: ${chars} · арзиши тахминӣ: $${(chars / 1000 * 0.015).toFixed(2)}`);
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
