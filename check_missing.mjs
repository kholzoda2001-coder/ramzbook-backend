import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('./.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
async function run() {
  const words = await sql.query(`SELECT word FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='cmqdhwb5q00021z597df2767m' AND m."order" IN (5, 6, 7) AND w."partOfSpeech"='noun'`);
  let missing = [];
  for (const {word} of words) {
    const key = word.toLowerCase().trim().replace(/['’.,!?]/g, '').replace(/\s+/g, '_');
    if (!fs.existsSync(`C:/Users/ASUS1/Desktop/ramz-audio/images/de/${key}.png`)) missing.push(word);
  }
  missing = [...new Set(missing)];
  console.log('Missing count:', missing.length);
  console.log('Missing:', missing.join(', '));
}
run();
