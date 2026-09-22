import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

async function clean() {
  const COURSE = 'cmqdhwb5q00021z597df2767m'; // A1 German
  const MOD_ORDER = 10; // Module 10

  const modules = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE} AND "order"=${MOD_ORDER}`;
  if (modules.length > 0) {
    const modId = modules[0].id;
    console.log(`Cleaning module ${modId}...`);
    
    await sql`DELETE FROM "Word" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=${modId})`;
    await sql`DELETE FROM "GrammarRule" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=${modId})`;
    await sql`DELETE FROM "GrammarExample" WHERE "ruleId" IN (SELECT id FROM "GrammarRule" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=${modId}))`;
    await sql`DELETE FROM "GrammarTopic" WHERE "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=${modId})`;
    await sql`DELETE FROM "Lesson" WHERE "moduleId"=${modId}`;
    await sql`DELETE FROM "Module" WHERE id=${modId}`;
    console.log('Cleaned lessons!');
  } else {
    console.log('Module not found for cleaning lessons.');
  }
}

clean();
