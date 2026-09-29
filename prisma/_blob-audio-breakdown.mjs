// Аудиои Blob (403) аз рӯи ҷадвал × забон + номи файл (префикс = скрипти сабткунанда). Танҳо хондан.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const B = `LIKE '%blob.vercel-storage.com%'`;
const lang = (alias) => `(SELECT code FROM "Language" WHERE id = ${alias})`;
const Q = {
  Word: `SELECT ${lang('c."targetLanguageId"')} l, w."audioUrl" u FROM "Word" w JOIN "Lesson" le ON le.id=w."lessonId" JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE w."audioUrl" ${B}`,
  DialogueLine: `SELECT ${lang('c."targetLanguageId"')} l, x."audioUrl" u FROM "DialogueLine" x JOIN "Dialogue" d ON d.id=x."dialogueId" JOIN "Course" c ON c.id=d."courseId" WHERE x."audioUrl" ${B}`,
  GrammarExample: `SELECT ${lang('c."targetLanguageId"')} l, e."audioUrl" u FROM "GrammarExample" e JOIN "GrammarTopic" t ON t.id=e."topicId" JOIN "Course" c ON c.id=t."courseId" WHERE e."audioUrl" ${B}`,
  ComprehensionExercise: `SELECT ${lang('c."targetLanguageId"')} l, x."audioUrl" u FROM "ComprehensionExercise" x JOIN "Course" c ON c.id=x."courseId" WHERE x."audioUrl" ${B}`,
  AlphabetLetter: `SELECT ${lang('a."targetLanguageId"')} l, a."audioUrl" u FROM "AlphabetLetter" a WHERE a."audioUrl" ${B}`,
  OnboardingWord: `SELECT ${lang('o."targetLanguageId"')} l, o."audioUrl" u FROM "OnboardingWord" o WHERE o."audioUrl" ${B}`,
};
for (const [t, s] of Object.entries(Q)) {
  const rows = await sql.query(s);
  const g = {};
  for (const r of rows) {
    const pre = r.u.split('/').slice(-2).join('/').replace(/c[a-z0-9]{20,}.*$/, '*');
    const k = `${r.l} · ${pre}`;
    g[k] = (g[k] || 0) + 1;
  }
  console.log(t, JSON.stringify(g, null, 1));
}
