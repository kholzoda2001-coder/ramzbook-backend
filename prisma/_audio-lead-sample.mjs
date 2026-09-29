// Тишина в начале аудио курсов (lead): по N случайных файлов на язык и таблицу, прямо с CDN. Только чтение.
//   node prisma/_audio-lead-sample.mjs [N]
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const N = Number(process.argv[2] ?? 10);
const q = (t) => `SELECT l.code lang, x."audioUrl" u FROM ${t} WHERE x."audioUrl" LIKE 'https://cdn.jsdelivr%' ORDER BY random()`;
const sets = {
  Word: q(`"Word" x JOIN "Lesson" le ON le.id=x."lessonId" JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId" JOIN "Language" l ON l.id=c."targetLanguageId"`),
  DialogueLine: q(`"DialogueLine" x JOIN "Dialogue" d ON d.id=x."dialogueId" JOIN "Course" c ON c.id=d."courseId" JOIN "Language" l ON l.id=c."targetLanguageId"`),
};
for (const [t, s] of Object.entries(sets)) {
  const rows = await sql.query(s);
  const by = {};
  for (const r of rows) { (by[r.lang] ??= []); if (by[r.lang].length < N) by[r.lang].push(r.u); }
  for (const [lang, urls] of Object.entries(by)) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...urls], { encoding: 'utf8', maxBuffer: 1 << 26 });
    const m = Object.values(JSON.parse(r.stdout || '{}')).filter((x) => x && !x.error);
    const leads = m.map((x) => x.lead).sort((a, b) => a - b);
    const med = leads[Math.floor(leads.length / 2)];
    console.log(`${t.padEnd(12)} ${lang}  n=${leads.length}  lead: мин ${leads[0]?.toFixed(2)} · миёна ${med?.toFixed(2)} · макс ${leads.at(-1)?.toFixed(2)} с`);
  }
}
