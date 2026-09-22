import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function checkTurkish() {
  const sql = neon(env.DATABASE_URL);
  
  const courses = await sql`SELECT c.id, c.title, lt.code as target, ln.code as native FROM "Course" c JOIN "Language" lt ON c."targetLanguageId" = lt.id JOIN "Language" ln ON c."nativeLanguageId" = ln.id`;
  console.log("Courses:", courses);
  
  const trCourses = courses.filter(c => c.target === 'tr');
  if (trCourses.length > 0) {
    const courseId = trCourses[0].id;
    const modules = await sql`SELECT "order", "titleTranslated" FROM "Module" WHERE "courseId" = ${courseId} ORDER BY "order"`;
    console.log(`Modules for course ${courseId}: ${modules.length}`);
    modules.forEach(m => console.log(` - Module ${m.order + 1}: ${m.titleTranslated}`));
    
    const lessons = await sql`SELECT COUNT(*) as count FROM "Lesson" WHERE "moduleId" IN (SELECT id FROM "Module" WHERE "courseId" = ${courseId})`;
    console.log(`Lessons for course ${courseId}: ${lessons[0].count}`);
  }
}

checkTurkish().catch(console.error);
