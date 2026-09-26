// Қадами охирини `_ru-speaking-audio.mjs`, агар push-и репои аудио ноком шуда
// бошад (26.09.2026: GitHub коммитҳои навтар дошт → rebase → push дастӣ).
// Файлҳои коммити додашударо мехонад ва URL-ро ба база менависад — ТАНҲО ба
// майдонҳои холӣ. `<id>.mp3` → `audioUrl`, `<id>_cue.mp3` → `cueAudioUrl`.
//
//   node prisma/_ru-speaking-audio-apply.mjs <ramz-audio dir> <sha>
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const [REPO, SHA] = process.argv.slice(2);
if (!REPO || !SHA) throw new Error('Истифода: node prisma/_ru-speaking-audio-apply.mjs <ramz-audio dir> <sha>');
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const files = execSync(`git show --name-only --format= ${SHA}`, { cwd: REPO })
  .toString().split('\n').map((l) => l.trim()).filter((l) => /^audio\/ru\/[^/]+\.mp3$/.test(l));
console.log(`файлҳо дар ${SHA.slice(0, 7)}: ${files.length}`);

// Пеш аз навиштан — файл дар CDN воқеан ҳаст? (як намуна)
const cdn = (f) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${SHA}/${f}`;
const probe = await fetch(cdn(files[0]), { method: 'HEAD' });
if (!probe.ok) throw new Error(`CDN ${probe.status} барои ${files[0]} — бас`);

let items = 0, cues = 0, skipped = 0;
for (const f of files) {
  const name = f.split('/').pop().replace(/\.mp3$/, '');
  const isCue = name.endsWith('_cue');
  const id = isCue ? name.slice(0, -4) : name;
  const col = isCue ? 'cueAudioUrl' : 'audioUrl';
  const r = await sql.query(
    `UPDATE "SpeakingItem" SET "${col}" = $1 WHERE id = $2 AND coalesce("${col}", '') = '' RETURNING id`,
    [cdn(f), id]);
  if (r.length) { if (isCue) cues++; else items++; } else skipped++;
}
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`сабт шуд: ибора ${items} · ҳамсӯҳбат ${cues} · гузаронда ${skipped} · content_version ламс шуд`);
