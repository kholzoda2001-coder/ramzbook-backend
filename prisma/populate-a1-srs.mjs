// Санҷиши он ки қадамҳои ГРАММАТИКА ва МУКОЛАМАи «Англисӣ — A1» акнун ба
// навбати такрор (SRS) маълумот медиҳанд.
//
// ЧАРО ин скрипт чизе НАМЕНАВИСАД:
//   `Word.lessonId` муносибати як-ба-бисёр аст — як калима ба ЯК дарс тааллуқ
//   дорад. Пас «пайваст кардани калимаҳои мавҷуд» ба дарси грамматика дар амал
//   маънои КӮЧОНИДАНи онҳоро дорад, яъне аз дарси луғавии худ гирифтан. Ба ҷои
//   ин, манбаи ҳавзи SRS дар API ислоҳ шуд:
//   `app/api/mobile/lessons/[lessonId]/route.ts` — агар қадам компонент дошта
//   бошад ва калимаи худӣ надошта бошад, то 5 калимаи ҲАМИН МОДУЛ бармегардад.
//   Пас ягон сатри нав сохта намешавад ва ягон калима такрор намешавад.
//
// Ин ҷо ҳамон мантиқ такрор карда мешавад ва натиҷа санҷида мешавад.
//
//   node prisma/populate-a1-srs.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const A1 = 'cmqkvhu8p0001o5r7nkbeo4jm';   // Англисӣ — A1 (en → tg)
const LIMIT = 5;                          // = SRS_FALLBACK_LIMIT дар route.ts

// Ҳамон тартиб, ки route.ts истифода мебарад: frequencyRank ASC (дар Postgres
// NULL-ҳо дар ASC охир меоянд), баъд order, баъд id — то натиҷа устувор бошад.
async function fallbackPool(moduleId, lessonOrder) {
  const rows = await q(
    `SELECT w.id, w.word, w.translation, w."frequencyRank" fr
       FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId"
      WHERE l."moduleId" = $1
      ORDER BY w."frequencyRank" ASC, w."order" ASC, w.id ASC`, [moduleId]);
  const seen = new Set();
  const deduped = rows.filter(r => {
    const k = r.word.trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // Ҳамон гардиш, ки route.ts дорад: ҳар қадам тирезаи ДИГАРи калимаҳо мегирад,
  // вагарна ҳар 3–4 қадами як модул айнан ҳамон панҷ калимаро такрор мекард.
  const start = deduped.length ? (lessonOrder * LIMIT) % deduped.length : 0;
  return [...deduped.slice(start), ...deduped.slice(0, start)].slice(0, LIMIT);
}

const lessons = await q(
  `SELECT m."order" mo, m.id mid, l.id lid, l.title, l."order" lo,
          CASE WHEN l."grammarTopicId" IS NOT NULL THEN 'grammar'
               WHEN l."dialogueId"     IS NOT NULL THEN 'dialogue' END kind,
          (SELECT COUNT(*)::int FROM "Word" w WHERE w."lessonId" = l.id) own
     FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
    WHERE m."courseId" = $1
      AND (l."grammarTopicId" IS NOT NULL OR l."dialogueId" IS NOT NULL)
    ORDER BY m."order", l."order"`, [A1]);

console.log(`Қадамҳои грамматика/муколамаи A1: ${lessons.length}\n`);

let empty = 0;
for (const l of lessons) {
  if (l.own > 0) {
    console.log(`M${String(l.mo + 1).padStart(2)} ${l.kind.padEnd(8)} «${l.title.slice(0, 40)}» — ${l.own} калимаи ХУДӢ (fallback лозим нест)`);
    continue;
  }
  const pool = await fallbackPool(l.mid, l.lo);
  if (pool.length === 0) empty++;
  console.log(`M${String(l.mo + 1).padStart(2)} ${l.kind.padEnd(8)} «${l.title.slice(0, 40)}» → ${pool.length} калима: ${pool.map(p => p.word).join(', ')}`);
}

console.log(`\n${empty === 0 ? '✓' : '✗'} ҳавзи холӣ: ${empty} (ҳар қадам акнун ба SRS маълумот медиҳад)`);

// Домаи таъсир: ягон сатри Word тағйир наёфт.
const total = await q(
  `SELECT COUNT(*)::int n FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
     JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=$1`, [A1]);
console.log(`Ҳамагӣ калимаҳои A1: ${total[0].n} — скрипт ягон сатр насохт ва накӯчонид.`);

// Такрори калима дар дохили як ҳавз (боиси ду корти SRS барои як калима).
const dupes = [];
for (const l of lessons) {
  if (l.own > 0) continue;
  const pool = await fallbackPool(l.mid, l.lo);
  const words = pool.map(p => p.word.toLowerCase());
  if (new Set(words).size !== words.length) dupes.push(l.title);
}
console.log(`${dupes.length === 0 ? '✓' : '✗'} такрори калима дар ҳавзҳо: ${dupes.length}`);
