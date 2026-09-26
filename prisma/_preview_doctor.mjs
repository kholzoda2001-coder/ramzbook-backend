// Танҳо хондан: «Назди духтур» аз пешнамоиши зиндаи сервер — қадамҳо ва аудио.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const lessons = await sql.query(`
  SELECT l.id, l."order", l.stage, l.title FROM "SpeakingLesson" l
    JOIN "SpeakingCategory" c ON c.id = l."categoryId"
   WHERE c."titleTranslated" = $1 AND l."isActive" ORDER BY l."order"`, [process.argv[2] ?? 'Назди духтур']);
for (const l of lessons) {
  const r = await fetch(`https://admin.ramz.tj/api/admin/speaking/preview?lessonId=${l.id}&ev=3`, {
    headers: { 'x-admin-api-key': env.ADMIN_API_KEY },
  });
  const j = await r.json();
  const st = j.steps ?? j.exercises ?? [];
  const noAudio = st.filter((s) => s.target && !s.audioUrl && !String(s.target).includes('___')).map((s) => `${s.kind}:${s.target}`);
  const cue = st.filter((s) => s.cue).length;
  const cueA = st.filter((s) => s.cue && s.cueAudioUrl).length;
  const lines = st.flatMap((s) => s.lines ?? []);
  const linesA = lines.filter((x) => x.audioUrl).length;
  console.log(`#${l.order + 1} [${l.stage}] ${l.title} — ${st.length} қадам: ${st.map((s) => s.kind).join(',')}`);
  console.log(`    бе аудио: ${noAudio.length ? noAudio.join(' | ') : 'ҳеҷ'} · ҳамсӯҳбат ${cueA}/${cue} · муколама ${linesA}/${lines.length}${j.errors?.length ? ' · ХАТО ' + JSON.stringify(j.errors) : ''}`);
}
