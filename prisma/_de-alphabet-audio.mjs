// Садои НОМИ ҳар ҳарфи алифбои олмонӣ (de → tg), бо овози de-DE-KatjaNeural.
//
// Чаро сабти омода, на TTS-и телефон: экрани Алифбо ҳарфҳоро зуд-зуд пахш
// мекунад; TTS-и дастгоҳ ё овоз надорад (дар бисёр телефонҳо забони олмонӣ
// насб нест → хомӯшӣ), ё овози шабакавӣ дорад (садо бо таъхир меояд). Файли
// омода фавран менавозад ва ҳамон овозест, ки тамоми курс дорад.
//
// Матни синтез = НОМИ ҳарф бо имлои олмонӣ («Beh», «Zeh», «Vau»), на худи
// ҳарф — вагарна TTS метавонад ҳарфро ҳамчун калима хонад.
//
// Навиштани `audioUrl` тавассути SQL-и мустақим (Neon HTTP) меравад, на admin
// API: роути истеҳсолӣ ин майдонро ҳанӯз қабул намекунад (тағйираш дар код ҳаст,
// вале деплой нашудааст).
//
//   node prisma/_de-alphabet-audio.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';

const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = Object.fromEntries(
  raw.split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/de-alphabet-audio';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

// Ҳарф → номи он бо имлои олмонӣ, то TTS маҳз номро талаффуз кунад.
const NAME = {
  A: 'A', B: 'Beh', C: 'Zeh', D: 'Deh', E: 'E', F: 'Eff', G: 'Geh', H: 'Ha',
  I: 'I', J: 'Jot', K: 'Ka', L: 'Ell', M: 'Emm', N: 'Enn', O: 'O', P: 'Peh',
  Q: 'Kuh', R: 'Err', S: 'Ess', T: 'Teh', U: 'U', V: 'Vau', W: 'Weh', X: 'Iks',
  Y: 'Ypsilon', Z: 'Zett', 'Ä': 'Ä', 'Ö': 'Ö', 'Ü': 'Ü', 'ẞ': 'Eszett',
};

const letters = await sql.query(
  `SELECT id, uppercase, lowercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${DE}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
console.log(`Ҳарфҳо дар база: ${letters.length}`);

const missing = letters.filter(l => !NAME[l.uppercase]);
if (missing.length) { console.error('Номи ин ҳарфҳо маълум нест:', missing.map(m => m.uppercase).join(' ')); process.exit(1); }

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`,
  JSON.stringify(letters.map(l => ({ id: l.id, text: NAME[l.uppercase] })), null, 1));
console.log('\n== Қадами 1: тавлид (edge-tts, de-DE-KatjaNeural) ==');
const out = execFileSync('python', ['prisma/_de-tts.py', WORK, `${WORK}/items.json`],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-2).join('\n'));

// ── 2. Бор кардан ва сабт ───────────────────────────────────────────────────
console.log('\n== Қадами 2: бор кардан ва сабт ==');
let done = 0;
for (const l of letters) {
  const buf = readFileSync(`${WORK}/${l.id}.mp3`);
  const fd = new FormData();
  fd.append('file', new File([buf], `de_letter_${l.lowercase}_${l.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
  });
  const body = await up.json();
  if (!up.ok || !body.url) { console.log(`  ✗ ${l.uppercase}: upload ${up.status}`); continue; }
  await sql.query(`UPDATE "AlphabetLetter" SET "audioUrl"='${body.url}' WHERE id='${l.id}'`);
  done++;
}
console.log(`  сабт шуд: ${done}/${letters.length}`);

// Кэши мазмун: ҳарфҳо тавассути SQL иваз шуданд, пас миёнабури `lib/prisma.ts`
// кор накард. Версияро худи `updatedAt`-и ин сатр муайян мекунад (ниг.
// `/api/mobile/content-version`), пас онро ламс мекунем — вагарна тағйир ба
// хонандагони кэшдор то тамом шудани TTL намерасад.
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
const [cv] = await sql.query(`SELECT "updatedAt" FROM "AppSetting" WHERE key='content_version'`);
console.log(`  content_version → ${new Date(cv.updatedAt).getTime()}`);

// ── 3. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n== Қадами 3: санҷиш ==');
const RATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
function duration(b) {
  let i = 0, frames = 0, sr = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, br = RATES[(b[i + 2] >> 4) & 0xF];
      let s = [44100, 48000, 32000][(b[i + 2] >> 2) & 3];
      const pad = (b[i + 2] >> 1) & 1;
      if (!br || !s) { i++; continue; }
      if (ver === 2) s /= 2;
      i += Math.floor(144000 * br / s) + pad; frames++; sr = s;
    } else i++;
  }
  return sr ? frames * 1152 / sr : 0;
}

const rows = await sql.query(
  `SELECT uppercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${DE}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
const seen = new Map();
let bad = 0;
const line = [];
for (const r of rows) {
  if (!r.audioUrl) { console.log(`  ✗ ${r.uppercase}: audioUrl нест`); bad++; continue; }
  const res = await fetch(r.audioUrl);
  if (!res.ok) { console.log(`  ✗ ${r.uppercase}: HTTP ${res.status}`); bad++; continue; }
  const b = Buffer.from(await res.arrayBuffer());
  const md5 = createHash('md5').update(b).digest('hex').slice(0, 8);
  const sec = duration(b);
  if (seen.has(md5)) { console.log(`  ✗ ${r.uppercase}: айнан ба ${seen.get(md5)} баробар`); bad++; }
  seen.set(md5, r.uppercase);
  // Номи ҳарф кӯтоҳ аст; берун аз ин доира = TTS чизи дигар хондааст.
  if (sec < 0.35 || sec > 1.6) { console.log(`  ✗ ${r.uppercase}: ${sec.toFixed(2)}s — берун аз меъёр`); bad++; }
  line.push(`${r.uppercase}:${sec.toFixed(2)}`);
}
console.log(`  ${line.join('  ')}`);
console.log(`\nМушкилот: ${bad}`);
