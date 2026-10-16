// Калиди муҳаррики нутқи «Гуфтор» — бе deploy ва бе Play Store.
//
//   node prisma/_speech-engine.mjs            → режими ҷорӣ
//   node prisma/_speech-engine.mjs off        → Azure хомӯш, гуфтор бо телефон
//   node prisma/_speech-engine.mjs auto       → Azure, агар ҳисоб зинда бошад
//
// Ниг. `lib/speaking/speech-engine.ts`. Драйвери HTTP (Prisma аз ин мошин ба
// Neon намерасад — порти 5432 баста).
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const KEY = 'speech_engine';
const mode = process.argv[2];
//   node prisma/_speech-engine.mjs whisper off → Whisper (Groq) хомӯш, ҳамаи ҳолатро нигоҳ медорад
//   node prisma/_speech-engine.mjs whisper on  → Whisper фаъол (пешфарз)
const whisper = mode === 'whisper' ? process.argv[3] : undefined;

if (mode) {
  if (mode === 'whisper') {
    if (!['on', 'off'].includes(whisper)) throw new Error('Whisper: on | off');
  } else if (!['auto', 'on', 'off'].includes(mode)) {
    throw new Error('Режим: auto | on | off | whisper on|off');
  }
  // Калидҳои дигарро нигоҳ медорем (azure ↔ whisper якдигарро нест накунанд).
  const cur = (await sql.query(`SELECT "valueJson" FROM "AppSetting" WHERE key = $1`, [KEY]))[0];
  let base = {};
  try { base = cur?.valueJson ? JSON.parse(cur.valueJson) : {}; } catch { base = {}; }
  const value = JSON.stringify(mode === 'whisper' ? { ...base, whisper } : { ...base, azure: mode });
  await sql.query(
    `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET "valueJson" = $2, "updatedAt" = now()`,
    [KEY, value],
  );
}
const row = (await sql.query(`SELECT "valueJson", "updatedAt" FROM "AppSetting" WHERE key = $1`, [KEY]))[0];
console.log('speech_engine:', row ? `${row.valueJson} (${row.updatedAt.toISOString?.() ?? row.updatedAt})` : 'нест → auto');
