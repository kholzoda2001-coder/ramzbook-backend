// Садои НОМИ ҳар ҳарфи алифбои арабӣ (ar → tg).
//
// Чаро сабти омода, на TTS-и телефон: экрани Алифбо ҳарфҳоро зуд-зуд пахш
// мекунад; TTS-и дастгоҳ ё овози арабӣ надорад (дар аксари телефонҳои мо насб
// нест → хомӯшӣ), ё овози шабакавӣ дорад (садо бо таъхир меояд). Ҳамин мушкил
// дар олмонӣ ҳал шуда буд — ин ҷо ҳамон роҳ.
//
// Матни синтез = НОМИ арабии ҳарф («ألف», «باء»), на худи ҳарф — вагарна TTS
// ҳарфро ҳамчун садо ё калима мехонад.
//
//   node prisma/_ar-alphabet-audio.mjs [--voice ar-SA-ZariyahNeural] [--check]
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const CHECK = process.argv.includes('--check');
const vArg = process.argv.indexOf('--voice');
const VOICE = vArg > -1 ? process.argv[vArg + 1] : 'ar-SA-ZariyahNeural';
const BASE = 'https://admin.ramz.tj';
const AR = 'cmqdqfuxi00001rcsseeq42fi';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/ar-alphabet-audio';

// Ҳарф → номи арабии он. Ҳамза ва тои марбута ҳарфи пурра нестанд, вале дар
// шабакаи алифбо ҳастанд ва номи худро доранд.
const NAME = {
  'ا': 'أَلِف', 'ب': 'بَاء', 'ت': 'تَاء', 'ث': 'ثَاء', 'ج': 'جِيم', 'ح': 'حَاء',
  'خ': 'خَاء', 'د': 'دَال', 'ذ': 'ذَال', 'ر': 'رَاء', 'ز': 'زَاي', 'س': 'سِين',
  'ش': 'شِين', 'ص': 'صَاد', 'ض': 'ضَاد', 'ط': 'طَاء', 'ظ': 'ظَاء', 'ع': 'عَيْن',
  'غ': 'غَيْن', 'ف': 'فَاء', 'ق': 'قَاف', 'ك': 'كَاف', 'ل': 'لَام', 'م': 'مِيم',
  'ن': 'نُون', 'ه': 'هَاء', 'و': 'وَاو', 'ي': 'يَاء', 'ء': 'هَمْزَة', 'ة': 'تَاء مَرْبُوطَة',
};

const letters = await sql.query(
  `SELECT id, uppercase, lowercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
console.log(`Ҳарфҳо дар база: ${letters.length} · овоз: ${VOICE}`);

const missing = letters.filter(l => !NAME[l.uppercase]);
if (missing.length) { console.error('Номи ин ҳарфҳо маълум нест:', missing.map(m => m.uppercase).join(' ')); process.exit(1); }

// ── Ченкунӣ (MPEG-2 Layer III @24 kHz — edge-tts ҳамин медиҳад) ─────────────
function duration(b) {
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let i = 0, d = 0, g = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4 && g++ < 400000) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, layer = (b[i + 1] >> 1) & 3, t = SR[ver];
      if (layer === 1 && t) {
        const br = (ver === 3 ? BR1 : BR2)[(b[i + 2] >> 4) & 15], sr = t[(b[i + 2] >> 2) & 3], pad = (b[i + 2] >> 1) & 1;
        if (br && sr) { const spf = ver === 3 ? 1152 : 576; d += spf / sr; i += Math.floor(spf / 8 * 1000 * br / sr) + pad; continue; }
      }
    }
    i++;
  }
  return d;
}

// ── Санҷиши он чи аллакай ҳаст ──────────────────────────────────────────────
async function verify() {
  const rows = await sql.query(
    `SELECT uppercase, "audioUrl" FROM "AlphabetLetter"
     WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
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
    // «تاء مربوطة» ду калима аст, пас ҳадди боло каме васеътар.
    if (sec < 0.4 || sec > 2.2) { console.log(`  ✗ ${r.uppercase}: ${sec.toFixed(2)}s — берун аз меъёр`); bad++; }
    line.push(`${r.uppercase}:${sec.toFixed(2)}`);
  }
  console.log(`  ${line.join('  ')}`);
  console.log(`\nМушкилот: ${bad}`);
  return bad;
}

if (CHECK) { process.exit(await verify() ? 1 : 0); }

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`,
  JSON.stringify(letters.map(l => ({ id: l.id, text: NAME[l.uppercase] })), null, 1));
console.log(`\n== Қадами 1: тавлид (edge-tts, ${VOICE}) ==`);
const out = execFileSync('python', ['prisma/_ar-tts.py', WORK, `${WORK}/items.json`, VOICE],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-2).join('\n'));

// ── 2. Бор кардан ва сабт ───────────────────────────────────────────────────
const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

console.log('\n== Қадами 2: бор кардан ва сабт ==');
let done = 0;
for (const l of letters) {
  const buf = readFileSync(`${WORK}/${l.id}.mp3`);
  // Номи файл лотинӣ нигоҳ дошта мешавад: тартиби ҳарф + id — вагарна дар
  // URL ҳарфи арабӣ пайдо мешавад ва он кодкунии фоизӣ талаб мекунад.
  const fd = new FormData();
  fd.append('file', new File([buf], `ar_letter_${letters.indexOf(l)}_${l.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
  });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.log(`  ✗ ${l.uppercase}: upload ${up.status}`); continue; }
  await sql.query(`UPDATE "AlphabetLetter" SET "audioUrl"=$1 WHERE id=$2`, [body.url, l.id]);
  done++;
}
console.log(`  сабт шуд: ${done}/${letters.length}`);

// Кэши мазмун: ҳарфҳо тавассути SQL иваз шуданд, пас миёнабури `lib/prisma.ts`
// кор накард — версияро худамон ламс мекунем (ниг. [[ramz-german]]).
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
const [cv] = await sql.query(`SELECT "updatedAt" FROM "AppSetting" WHERE key='content_version'`);
console.log(`  content_version → ${new Date(cv.updatedAt).getTime()}`);

// ── 3. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n== Қадами 3: санҷиш ==');
await verify();
