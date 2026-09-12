// Аудиои бахши ГУФТОР — КОРЕЯГӢ (боби «인사와 소개»).
//
// Чаро ҷудо аз `_speaking-audio.mjs`: он барои англисӣ аст (edge-tts + push ба
// репои `ramz-audio`). Кореягӣ ҳамон қубури КУРСРО истифода мебарад — Google
// `ko-KR-Chirp3-HD-Despina` тавассути `speakReliable` (санҷиши садо + муҳофизи
// САДОНОК, ниг. `_ko-vowel-check.py`) ва боркунӣ ба Vercel Blob. Пас овози
// гуфтор ва овози дарсҳо ЯК хел мешавад.
//
//   node prisma/_ko-speaking-audio.mjs [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `audioUrl` гирифта мешаванд.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';
import { speakReliable, useTrimOrRaw, VOICE } from './_ko-tts-google.mjs';

const DRY = process.argv.includes('--dry');
const KO = 'cmtkb6u4i000pd8149oc';
const BASE = 'https://admin.ramz.tj';
const WORK = 'tmp/ko-speaking-audio';
const TRIM = `${WORK}-trim`;

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const raw = neon(env.DATABASE_URL);
const isNetErr = (e) => /fetch failed|Connect Timeout|ECONNRESET|ETIMEDOUT|UND_ERR/i.test(`${e?.message} ${e?.sourceError?.cause?.code ?? ''}`);
const sql = {
  query: async (text, params) => {
    for (let a = 0; ; a++) {
      try { return await raw.query(text, params); } catch (e) {
        if (a >= 4 || !isNetErr(e)) throw e;
        console.log(`  ↻ шабака (${a + 1}/4)…`);
        await new Promise(r => setTimeout(r, 2000 * (a + 1)));
      }
    }
  },
};

const items = await sql.query(
  `SELECT i.id, i.text, l."order" AS lesson
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1
      AND (i."audioUrl" IS NULL OR i."audioUrl" = '')
    ORDER BY l."order", i."order"`, [KO]);
const [total] = await sql.query(
  `SELECT count(*)::int n FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1`, [KO]);
console.log(`Воҳидҳои гуфтори кореягӣ: ${total.n} · бе аудио: ${items.length}`);
if (!items.length) { console.log('Ҳама аудио доранд.'); process.exit(0); }
if (DRY) { items.forEach(i => console.log(`  L${i.lesson} ${i.text}`)); console.log('--dry: чизе сохта нашуд.'); process.exit(0); }

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
console.log(`\n== Тавлид (${VOICE}) ==`);
mkdirSync(WORK, { recursive: true });
for (const it of items) {
  const { buf, variant, attempts } = await speakReliable(it.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: WORK });
  if (variant !== 'plain' || attempts > 1) console.log(`  ↻ «${it.text}»: ${variant}, ${attempts} кӯшиш`);
  writeFileSync(`${WORK}/${it.id}.mp3`, buf);
}

// ── 2. Буриши хомӯшӣ ────────────────────────────────────────────────────────
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }).trim());
const { still, usedRaw } = useTrimOrRaw(items.map(i => [`${WORK}/${i.id}.mp3`, `${TRIM}/${i.id}.mp3`]));
if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд`);
if (still.length) { console.error('✗ файли хомӯш баъди буриш:', still.join(', ')); process.exit(1); }

// ── 3. Боркунӣ ва сабт ──────────────────────────────────────────────────────
const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
let done = 0;
for (const it of items) {
  const fd = new FormData();
  fd.append('file', new File([readFileSync(`${TRIM}/${it.id}.mp3`)], `ko_speak_${it.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.log(`  ✗ «${it.text}»: upload ${up.status}`); continue; }
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2`, [body.url, it.id]);
  done++;
}
await sql.query(`UPDATE "AppSetting" SET "updatedAt" = now() WHERE key = 'content_version'`);
console.log(`\nсабт шуд: ${done}/${items.length} · content_version ламс шуд`);
