import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync('./.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const COURSE = 'cmqdhwb5q00021z597df2767m'; // A1 course

async function run() {
  const mods = await sql.query('SELECT id, "order", title, "titleTranslated" FROM "Module" WHERE "courseId"=$1 ORDER BY "order"', [COURSE]);
  let totalLessons = 0;
  let totalWords = 0;
  console.log('Модул | Дарсҳо | Калимаҳо | Ном');
  console.log('------|--------|----------|----');
  for (const m of mods) {
    const lessons = await sql.query('SELECT id, title, "skillType" FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"', [m.id]);
    const lessonIds = lessons.map(l => l.id);
    let wordsCount = 0;
    if (lessonIds.length > 0) {
      const words = await sql.query('SELECT COUNT(*) as c FROM "Word" WHERE "lessonId" = ANY($1)', [lessonIds]);
      wordsCount = parseInt(words[0].c, 10);
    }
    console.log(`${m.order.toString().padEnd(5)} | ${lessons.length.toString().padEnd(6)} | ${wordsCount.toString().padEnd(8)} | ${m.title} (${m.titleTranslated})`);
    totalLessons += lessons.length;
    totalWords += wordsCount;
  }
  console.log('------|--------|----------|----');
  console.log(`Total | ${totalLessons.toString().padEnd(6)} | ${totalWords.toString().padEnd(8)} |`);
}
run();
