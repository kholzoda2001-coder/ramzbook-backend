// Садои НОМИ ҳар ҳарфи алифбои русӣ (ru → tg) аз нав, бо ru-RU-SvetlanaNeural.
//
// Чаро аз нав: партияи кӯҳна аз муҳоҷирати оммавӣ ба jsDelivr мондааст —
// 32 kbps ва 14 ҳарф аз 33-то дар 0.26–0.34 сония тамом мешаванд. Ин аз
// меъёри худи лоиҳа (≥0.35s, ниг. _de-alphabet-audio.mjs) поинтар аст ва дар
// баландгӯяки телефон ҳамчун «садо намеояд» ҳис мешавад. Барои муқоиса:
// ҳамон «А»-и олмонӣ бо edge-tts 0.86s / 10.4KB аст, русии кӯҳна 0.29s / 1.1KB.
//
// Матни синтез = НОМИ ҳарф бо имлои русӣ («Бэ», «Эль», «твёрдый знак»), на худи
// ҳарф — вагарна TTS метавонад ҳарфро ҳамчун калима хонад.
//
// Ҳамон хатти олмонӣ/арабӣ: тавлид → санҷиши МАҲАЛЛӢ → бор кардан → сабт.
// Агар ягон файл аз меъёр берун барояд, ҳеҷ чиз бор карда намешавад.
//
//   node prisma/_ru-alphabet-audio.mjs --dry   # тавлид + ченак, бе бор кардан
//   node prisma/_ru-alphabet-audio.mjs
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

const DRY = process.argv.includes('--dry');
const BASE = 'https://admin.ramz.tj';
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/ru-alphabet-audio';

// Меъёр — ҳамон ки скрипти олмонӣ истифода мебарад. Номи ҳарф кӯтоҳ аст;
// берун аз ин доира = TTS чизи дигар хондааст ё файл бурида шудааст.
// Ҳадди боло каме васеътар аст: «твёрдый знак» аз «Eszett» дарозтар.
const MIN_SEC = 0.35;
const MAX_SEC = 2.0;

// Ҳарф → номи он бо имлои русӣ, то TTS маҳз номро талаффуз кунад.
const NAME = {
  'А': 'А', 'Б': 'Бэ', 'В': 'Вэ', 'Г': 'Гэ', 'Д': 'Дэ', 'Е': 'Е', 'Ё': 'Ё',
  'Ж': 'Жэ', 'З': 'Зэ', 'И': 'И', 'Й': 'И краткое', 'К': 'Ка', 'Л': 'Эль',
  'М': 'Эм', 'Н': 'Эн', 'О': 'О', 'П': 'Пэ', 'Р': 'Эр', 'С': 'Эс', 'Т': 'Тэ',
  'У': 'У', 'Ф': 'Эф', 'Х': 'Ха', 'Ц': 'Цэ', 'Ч': 'Че', 'Ш': 'Ша', 'Щ': 'Ща',
  'Ъ': 'твёрдый знак', 'Ы': 'Ы', 'Ь': 'мягкий знак', 'Э': 'Э', 'Ю': 'Ю', 'Я': 'Я',
};

// ── Ченаки муддат аз сарлавҳаи фрейми MP3 (бе ffmpeg) ───────────────────────
const RATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
function duration(b) {
  let i = 0, frames = 0, sr = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {
    i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  }
  while (i < b.length - 4) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, br = RATES_V1[(b[i + 2] >> 4) & 0xF];
      let s = [44100, 48000, 32000][(b[i + 2] >> 2) & 3];
      const pad = (b[i + 2] >> 1) & 1;
      if (!br || !s) { i++; continue; }
      if (ver === 2) s /= 2;
      i += Math.floor(144000 * br / s) + pad; frames++; sr = s;
    } else i++;
  }
  return sr ? frames * 1152 / sr : 0;
}

const letters = await sql.query(
  `SELECT id, uppercase, lowercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${RU}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
console.log(`Ҳарфҳо дар база: ${letters.length}`);

const missing = letters.filter(l => !NAME[l.uppercase]);
if (missing.length) {
  console.error('Номи ин ҳарфҳо маълум нест:', missing.map(m => m.uppercase).join(' '));
  process.exit(1);
}

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`,
  JSON.stringify(letters.map(l => ({ id: l.id, text: NAME[l.uppercase] })), null, 1));
console.log('\n== Қадами 1: тавлид (edge-tts, ru-RU-SvetlanaNeural) ==');
const out = execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/items.json`],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-1).join('\n'));

// ── 2. Санҷиши МАҲАЛЛӢ пеш аз бор кардан ────────────────────────────────────
// Файли бад ҳеҷ гоҳ ба продакшн намеравад: аввал ҳамаро дар диск месанҷем ва
// танҳо ҳангоми тоза будани ҳама қадами навбатӣ иҷро мешавад.
console.log('\n== Қадами 2: санҷиши маҳаллӣ ==');
let bad = 0;
const local = [];
for (const l of letters) {
  const buf = readFileSync(`${WORK}/${l.id}.mp3`);
  const sec = duration(buf);
  const ok = sec >= MIN_SEC && sec <= MAX_SEC;
  if (!ok) { console.log(`  ✗ ${l.uppercase} («${NAME[l.uppercase]}»): ${sec.toFixed(2)}s — берун аз меъёр`); bad++; }
  local.push({ ...l, buf, sec });
}
console.log(`  ${local.map(x => `${x.uppercase}:${x.sec.toFixed(2)}`).join('  ')}`);
const short = local.filter(x => x.sec < MIN_SEC).length;
console.log(`  меъёр ${MIN_SEC}–${MAX_SEC}s · берун аз меъёр: ${bad} (аз ҳад кӯтоҳ: ${short})`);
if (bad) { console.error('\n⛔ Бор карда нашуд — аввал номи ҳарфҳоро дуруст кунед.'); process.exit(1); }

if (DRY) {
  console.log('\n--dry: файлҳо дар ' + WORK + ' тайёранд, вале ҳеҷ чиз бор/сабт нашуд.');
  process.exit(0);
}

// ── 3. Бор кардан ва сабт ───────────────────────────────────────────────────
// Ҳамон ҷое, ки олмонӣ ва арабӣ истодаанд (Vercel Blob) — на партияи кӯҳнаи
// jsDelivr, ки маҳз мушкили ҳозира аз он аст.
const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

console.log('\n== Қадами 3: бор кардан ва сабт ==');
let done = 0;
for (const l of local) {
  const fd = new FormData();
  fd.append('file', new File([l.buf], `ru_letter_${l.lowercase}_${l.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
  });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.log(`  ✗ ${l.uppercase}: upload ${up.status}`); continue; }
  await sql.query(`UPDATE "AlphabetLetter" SET "audioUrl"='${body.url}' WHERE id='${l.id}'`);
  done++;
}
console.log(`  сабт шуд: ${done}/${letters.length}`);

// Кэши мазмун: ҳарфҳо тавассути SQL иваз шуданд, пас миёнабури `lib/prisma.ts`
// кор накард. Бе ин ламс тағйир ба хонандагони кэшдор то тамом шудани TTL
// намерасад — яъне садои нав дар телефон дарҳол пайдо намешавад.
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
const [cv] = await sql.query(`SELECT "updatedAt" FROM "AppSetting" WHERE key='content_version'`);
console.log(`  content_version → ${new Date(cv.updatedAt).getTime()}`);

// ── 4. Санҷиши ниҳоӣ аз CDN ─────────────────────────────────────────────────
console.log('\n== Қадами 4: санҷиш аз CDN ==');
const rows = await sql.query(
  `SELECT uppercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${RU}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
const seen = new Map();
let bad2 = 0;
const line = [];
for (const r of rows) {
  if (!r.audioUrl) { console.log(`  ✗ ${r.uppercase}: audioUrl нест`); bad2++; continue; }
  const res = await fetch(r.audioUrl);
  if (!res.ok) { console.log(`  ✗ ${r.uppercase}: HTTP ${res.status}`); bad2++; continue; }
  const b = Buffer.from(await res.arrayBuffer());
  const md5 = createHash('md5').update(b).digest('hex').slice(0, 8);
  const sec = duration(b);
  // Ду ҳарфи гуногун бо файли АЙНАН якхела = хатои сабт, на садои шабеҳ.
  if (seen.has(md5)) { console.log(`  ✗ ${r.uppercase}: айнан ба ${seen.get(md5)} баробар`); bad2++; }
  seen.set(md5, r.uppercase);
  if (sec < MIN_SEC || sec > MAX_SEC) { console.log(`  ✗ ${r.uppercase}: ${sec.toFixed(2)}s — берун аз меъёр`); bad2++; }
  line.push(`${r.uppercase}:${sec.toFixed(2)}`);
}
console.log(`  ${line.join('  ')}`);
console.log(`\nМушкилот: ${bad2}`);
