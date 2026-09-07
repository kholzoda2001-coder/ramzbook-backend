// Садои НОМИ ҳар ҳарфи алифбои кореягӣ (ko → tg), бо овози ko-KR-SunHiNeural.
//
// Чаро сабти омода, на TTS-и телефон: экрани Алифбо ҳарфҳоро зуд-зуд пахш
// мекунад; TTS-и дастгоҳ ё овоз надорад (дар телефонҳои тоҷикистонӣ забони
// кореягӣ қариб ҳеҷ гоҳ насб нест → ХОМӮШӢ), ё овози шабакавӣ дорад (садо бо
// таъхир меояд). Файли омода фавран менавозад ва ҳамон овозест, ки тамоми
// курс дорад. Ҳамон роҳи `_de-alphabet-audio.mjs` ва `_ar-alphabet-audio.mjs`.
//
// ⚠️ Матни синтез = НОМИ ҳарф бо ИМЛОИ ҲАНГУЛ (기역, 니은), на худи ҳарф.
// Ҷамъи мутобиқати ҳангул (ㄱ) аломати техникист — TTS онро ё намехонад, ё
// ғайричашмдошт мехонад. Барои садонокҳо номи ҳарф худи садои он аст (ㅏ = 아),
// пас он ҷо матн бо сутуни `lowercase`-и база рост меояд.
//
// Навиштани `audioUrl` тавассути SQL-и мустақим (Neon HTTP) меравад, на admin
// API: роути истеҳсолӣ ин майдонро ҳанӯз қабул намекунад.
//
//   node prisma/_ko-alphabet-audio.mjs
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
const KO = 'cmtkb6u4i000pd8149oc';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/ko-alphabet-audio';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

// Ҳарф → номи расмии он бо имлои ҳангул.
// Садонок: номаш = садояш (ㅏ → 아). Ҳамсадо: номи анъанавӣ (ㄱ → 기역), ки
// худи садоро дар аввал ва дар охири ҳиҷо нишон медиҳад — маҳз барои ҳамин
// сохта шудааст. Дукаратаҳо префикси 쌍 («ҷуфт») мегиранд.
const NAME = {
  'ㅏ': '아', 'ㅑ': '야', 'ㅓ': '어', 'ㅕ': '여', 'ㅗ': '오',
  'ㅛ': '요', 'ㅜ': '우', 'ㅠ': '유', 'ㅡ': '으', 'ㅣ': '이',
  'ㄱ': '기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄹ': '리을', 'ㅁ': '미음',
  'ㅂ': '비읍', 'ㅅ': '시옷', 'ㅇ': '이응', 'ㅈ': '지읒', 'ㅊ': '치읓',
  'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗',
  'ㄲ': '쌍기역', 'ㄸ': '쌍디귿', 'ㅃ': '쌍비읍', 'ㅆ': '쌍시옷', 'ㅉ': '쌍지읒',
  'ㅐ': '애', 'ㅒ': '얘', 'ㅔ': '에', 'ㅖ': '예', 'ㅘ': '와',
  'ㅙ': '왜', 'ㅚ': '외', 'ㅝ': '워', 'ㅞ': '웨', 'ㅟ': '위', 'ㅢ': '의',
};

// Дар кореягии имрӯза ин гурӯҳҳо ЯК хел садо медиҳанд. Ин нуқси мо нест —
// ҳамин тавр забон аст, ва қоидаи «ㅐ ва ㅔ имрӯз ЯК хел садо медиҳанд» инро
// ба хонанда мегӯяд. Ин ҷо онҳо номбар шудаанд, то санҷиши поён ҳамсадоии
// онҳоро ҳамчун ХАТО нашуморад ва фарқи онҳоро аз ГУМШУДАНИ файл ҷудо кунад.
const HOMOPHONES = [['ㅐ', 'ㅔ'], ['ㅒ', 'ㅖ'], ['ㅙ', 'ㅚ', 'ㅞ']];

const letters = await sql.query(
  `SELECT id, uppercase, lowercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${KO}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
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
console.log('\n== Қадами 1: тавлид (edge-tts, ko-KR-SunHiNeural) ==');
const out = execFileSync('python', ['prisma/_ko-tts.py', WORK, `${WORK}/items.json`],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-2).join('\n'));

// ── 2. Буридани хомӯшӣ ──────────────────────────────────────────────────────
// edge-tts ҳар клипро бо ~0.19с хомӯшии САР ва ~1.2с хомӯшии ОХИР медиҳад:
// ҳар 40 файл АЙНАН 1.78с баромад, дар ҳоле ки садо ~0.4с аст. Хомӯшии сар
// маҳз ҳамон таъхирест, ки хонанда ҳангоми пахши ҳарф ҳис мекунад, ва экрани
// Алифбо ҳарфҳоро зуд-зуд пахш мекунад. Ҳамон қадами арабӣ (ниг.
// `_ar-audio-snappy.mjs`); олмонӣ пеш аз пайдо шудани ин қадам сохта шудааст
// ва то ҳол хомӯшии худро дорад.
console.log('\n== Қадами 2: буридани хомӯшӣ ==');
const TRIM = `${WORK}-trim`;
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }).trim());

// ── 3. Бор кардан ва сабт ───────────────────────────────────────────────────
console.log('\n== Қадами 3: бор кардан ва сабт ==');
let done = 0;
for (const l of letters) {
  const buf = readFileSync(`${TRIM}/${l.id}.mp3`);
  const fd = new FormData();
  // Номи файл ASCII нигоҳ дошта мешавад: ҳангул дар роҳи Blob лозим нест ва
  // танҳо кодкунии URL-ро мушкил мекунад. `order` ҳарфро ягона мекунад.
  fd.append('file', new File([buf], `ko_letter_${l.id}.mp3`, { type: 'audio/mpeg' }));
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
// кор накард — версияро дастӣ ламс мекунем (ниг. `/api/mobile/content-version`).
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
const [cv] = await sql.query(`SELECT "updatedAt" FROM "AppSetting" WHERE key='content_version'`);
console.log(`  content_version → ${new Date(cv.updatedAt).getTime()}`);

// ── 4. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n== Қадами 4: санҷиш ==');
// ⚠️ Нусхаи ин функсия дар `_de-alphabet-audio.mjs`/`_ar-alphabet-audio.mjs`
// ХАТО аст ва рақами бемаъно медиҳад: он танҳо ҷадвали битрейти MPEG-1-ро
// медонад, вале edge-tts MPEG-2 Layer III (24 кГц) мебарорад. Дар натиҷа
// дарозии фрейм калон ҳисоб мешуд, парсер аз ҷои худ мебаромад ва барои
// файлҳои АЙНАН ҲАМАНДОЗА давомнокии гуногун (0.47–1.01s) чоп мекард.
// Ин ҷо ҳар се версия дуруст кор карда мешавад.
const RATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const RATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
function duration(b) {
  let i = 0, frames = 0, sr = 0, spf = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
      const br = (ver === 3 ? RATES_V1 : RATES_V2)[(b[i + 2] >> 4) & 0xF];
      let s = [44100, 48000, 32000][(b[i + 2] >> 2) & 3];
      const pad = (b[i + 2] >> 1) & 1;
      if (!br || !s || ver === 1) { i++; continue; }
      if (ver === 2) s /= 2;
      else if (ver === 0) s /= 4;
      // Layer III: MPEG-1 = 1152 сэмпл дар фрейм, MPEG-2/2.5 = 576.
      spf = ver === 3 ? 1152 : 576;
      i += Math.floor((spf / 8) * br * 1000 / s) + pad;
      frames++; sr = s;
    } else i++;
  }
  return sr ? frames * spf / sr : 0;
}

const homoOf = (u) => HOMOPHONES.findIndex(g => g.includes(u));

const rows = await sql.query(
  `SELECT uppercase, "audioUrl" FROM "AlphabetLetter"
   WHERE "targetLanguageId"='${KO}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
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
  if (seen.has(md5)) {
    const other = seen.get(md5);
    // Ҳамсадоии ҳамовозҳо интизорист; такрори БАЙНИ гурӯҳҳо хатои воқеист.
    if (homoOf(r.uppercase) !== -1 && homoOf(r.uppercase) === homoOf(other)) {
      console.log(`  ℹ ${r.uppercase} = ${other}: файли якхела — ҳамовозанд, интизор буд`);
    } else {
      console.log(`  ✗ ${r.uppercase}: айнан ба ${other} баробар`); bad++;
    }
  }
  seen.set(md5, r.uppercase);
  // Номи ҳарф 1–3 ҳиҷо аст; берун аз ин доира = TTS чизи дигар хондааст.
  if (sec < 0.30 || sec > 2.0) { console.log(`  ✗ ${r.uppercase}: ${sec.toFixed(2)}s — берун аз меъёр`); bad++; }
  line.push(`${r.uppercase}:${sec.toFixed(2)}`);
}
console.log(`  ${line.join('  ')}`);
console.log(`\nМушкилот: ${bad}`);
