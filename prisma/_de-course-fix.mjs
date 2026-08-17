// Ислоҳи чор мушкили курси олмонӣ, ки аудит ёфт (`_de-audit.mjs`):
//   1. тартиби модулҳо сӯрохӣ дошт (0,1,2,3,4,6,7,8,9)
//   2. «sie» ва «Sie» ҳарду «Шумо»-ро мегуфтанд — машқ ҷавоби дуҳела медод
//   3. ҳамаи 167 калима хониши тоҷикӣ (`ipaTajik`) надоштанд
//   4. ҳамаи 167 калима аудио надоштанд
//
// Хониши тоҷикӣ аз IPA-и худи калима ҳосил мешавад, на дастӣ: IPA барои ҳар
// 167 калима аллакай ҳаст ва дуруст аст, пас табдили механикӣ аз навиштани
// дастӣ ҳам дақиқтар аст, ҳам якхела. Ҳар аломати ношинос хато медиҳад ва
// скрипт меистад — ҳеҷ чиз нимкора ба база намеравад.
//
// Услуби транскрипсия ҳамон аст, ки дар қоидаҳои алифбо шарҳ дода шуд:
// «:» = садоноки дароз, «́» = зада.
//
//   node prisma/_de-course-fix.mjs [--dry]
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
const BASE = 'https://admin.ramz.tj';
const COURSE = 'cmqdhwb5q00021z597df2767m';
const WORK = 'tmp/de-word-audio';
const DRY = process.argv.includes('--dry');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// ── IPA → хатти тоҷикӣ ──────────────────────────────────────────────────────
const ACUTE = '́';          // аломати зада, баъди ҳарфи садонок мешинад
const NONSYL = '̯';         // ̯ — ҷузъи дуюми дифтонг
const VOWEL = 'аэиоуюё';

// Тартиб МУҲИМ аст: аввал аломатҳои дароз, баъд кӯтоҳ.
const MAP = [
  // дифтонгҳо (аломати ̯ пеш аз ин ҳазф шудааст)
  ['aɪ', 'ай'], ['aʊ', 'ау'], ['ɔʏ', 'ой'], ['ɔɪ', 'ой'],
  ['eɪ', 'эй'], ['oʊ', 'оу'],  // дар калимаҳои иқтибосӣ: Okay /oˈkeɪ̯/
  // аффрикатҳо
  ['t͡s', 'ц'], ['ts', 'ц'], ['t͡ʃ', 'ч'], ['tʃ', 'ч'],
  ['p͡f', 'пф'], ['pf', 'пф'], ['d͡ʒ', 'ҷ'], ['dʒ', 'ҷ'],
  // садонокҳои дароз
  ['aː', 'а:'], ['ɛː', 'э:'], ['eː', 'э:'], ['iː', 'и:'], ['oː', 'о:'],
  ['uː', 'у:'], ['yː', 'ю:'], ['øː', 'ё:'], ['ɔː', 'о:'], ['œː', 'ё:'],
  // садонокҳои кӯтоҳ
  ['a', 'а'], ['ɑ', 'а'], ['ɛ', 'э'], ['e', 'э'], ['ɪ', 'и'], ['i', 'и'],
  ['ɔ', 'о'], ['o', 'о'], ['ʊ', 'у'], ['u', 'у'], ['ʏ', 'ю'], ['y', 'ю'],
  ['œ', 'ё'], ['ø', 'ё'], ['ə', 'э'], ['ɐ', 'а'],
  // ҳамсадоҳо
  // ŋ пеш аз ҳамсадои дигар — «г»-и иловагӣ нанависем: danke → данкэ (на
  // «дангкэ»), Orange → оранжэ (на «орангжэ»). «нг» танҳо вақте меояд, ки ŋ
  // дар охири ҳиҷо/калима бошад: Wohnung → во́:нунг.
  ['ŋk', 'нк'], ['ŋɡ', 'нг'], ['ŋg', 'нг'], ['ŋʒ', 'нж'], ['ŋʃ', 'нш'],
  ['ŋs', 'нс'], ['ŋt', 'нт'], ['ŋ', 'нг'],
  ['ç', 'хь'], ['ʃ', 'ш'], ['ʒ', 'ж'], ['ʁ', 'р'], ['ɡ', 'г'],
  ['p', 'п'], ['b', 'б'], ['t', 'т'], ['d', 'д'], ['k', 'к'], ['g', 'г'],
  ['f', 'ф'], ['v', 'в'], ['s', 'с'], ['z', 'з'], ['x', 'х'], ['h', 'ҳ'],
  ['m', 'м'], ['n', 'н'], ['l', 'л'], ['r', 'р'], ['j', 'й'],
  // сарфи назар
  ['ˌ', ''], ['ʔ', ''], ['̃', ''], ['͡', ''], ['.', ''],
  [' ', ' '], ['-', '-'],
];

function ipaToTajik(ipaRaw) {
  const s = ipaRaw.trim().replace(/^\/|\/$/g, '').replace(/^\[|\]$/g, '')
    // Аломати ̯ («ҷузъи ғайриҳиҷоӣ») танҳо мегӯяд, ки садонок ҷузъи дифтонг
    // аст — дар транскрипсияи тоҷикӣ ифода намеёбад. Ҳазфи он ҷадвалро содда
    // мекунад: ҳар дифтонг як сатр мемонад, на ду.
    .replace(new RegExp(NONSYL, 'g'), '');
  let out = '';
  let stressPending = false;
  let i = 0;
  while (i < s.length) {
    if (s[i] === 'ˈ') { stressPending = true; i++; continue; }
    const hit = MAP.find(([from]) => s.startsWith(from, i));
    if (!hit) throw new Error(`аломати ношинос «${s[i]}» (U+${s.codePointAt(i).toString(16).toUpperCase()}) дар ${ipaRaw}`);
    let [from, to] = hit;
    if (stressPending && to) {
      // Зада ба ПАСИ аввалин ҳарфи садонок мешинад: «а́:», на «:а́».
      const vi = [...to].findIndex(ch => VOWEL.includes(ch));
      if (vi >= 0) {
        to = to.slice(0, vi + 1) + ACUTE + to.slice(vi + 1);
        stressPending = false;
      }
    }
    out += to;
    i += from.length;
  }
  return out.trim();
}

// Ҳосили тайёр бояд танҳо ҳарфи тоҷикӣ ва аломатҳои иҷозатдодашуда дошта бошад.
// «ь» ҳарфи тоҷикӣ нест, вале мо онро қасдан барои садои нарми ç («хь»)
// истифода мебарем — ҳамон тавре ки дар қоидаҳои алифбо шарҳ дода шуд.
const ALLOWED = /^[абвгдеёжзийклмнопрстуфхцчшъьэюяғқўҳҷӣӯ:́ \-]+$/i;

// ── 0. Худсанҷии транслитератор ─────────────────────────────────────────────
{
  const cases = [
    ['/ˈhalo/', 'ҳа́ло'],
    ['/ˈdaŋkə/', 'да́нкэ'],
    ['/ˈzɪŋən/', 'зи́нгэн'],
    ['/ɔˈʁaŋʒə/', 'ора́нжэ'],
    ['/ˈvoːnʊŋ/', 'во́:нунг'],
    // «й» ҳамеша /j/-ро ифода мекунад, то «ю» ва «ё» танҳо ба Ü ва Ö монанд —
    // ҳамин ду садо барои хонандаи тоҷик навтарин ва душвортаринанд.
    ['/jʊŋ/', 'йунг'],
    ['/tyːp/', 'тю:п'],
    ['/oˈkeɪ̯/', 'окэ́й'],
    ['/biːɐ̯/', 'би:а'],
    ['/ˈfaːtɐ/', 'фа́:та'],
    ['/naɪn/', 'найн'],
    ['/dɔʏtʃ/', 'дойч'],
    ['/ˈʃuːlə/', 'шу́:лэ'],
    ['/ɪç/', 'ихь'],
    ['/buːx/', 'бу:х'],
    ['/tsaɪt/', 'цайт'],
    ['/fʏnf/', 'фюнф'],
  ];
  let bad = 0;
  for (const [ipa, want] of cases) {
    const got = ipaToTajik(ipa);
    if (got !== want) { console.log(`  ⚠ ${ipa}: гирифтем «${got}», интизор «${want}»`); bad++; }
  }
  console.log(bad ? `Худсанҷиш: ${cases.length - bad}/${cases.length}` : `✓ Худсанҷиши транслитератор: ${cases.length}/${cases.length}`);
}

const words = await sql.query(
  `SELECT w.id, w.word, w.translation, w.ipa, w."ipaTajik", w."audioUrl", l.title AS lesson
   FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order", w."order"`);

// ── 1. Тартиби модулҳо ──────────────────────────────────────────────────────
console.log('\n== 1. Тартиби модулҳо ==');
const mods = await sql.query(`SELECT id, "order", title FROM "Module" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
console.log(`  буд: ${mods.map(m => m.order).join(',')}`);
if (!DRY) {
  for (let i = 0; i < mods.length; i++) {
    if (mods[i].order === i) continue;
    const res = await fetch(`${BASE}/api/admin/modules/${mods[i].id}`, {
      method: 'PUT', headers: H, body: JSON.stringify({ order: i }),
    });
    if (!res.ok) console.log(`  ✗ ${mods[i].title}: ${(await res.text()).slice(0, 100)}`);
  }
  const after = await sql.query(`SELECT "order" FROM "Module" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
  console.log(`  шуд: ${after.map(m => m.order).join(',')}`);
}

// ── 2. sie / Sie ────────────────────────────────────────────────────────────
console.log('\n== 2. «sie» ва «Sie» ==');
const sieLower = words.find(w => w.word === 'sie');
if (sieLower && sieLower.translation.includes('Шумо')) {
  // Хурдаш ҳеҷ гоҳ «Шумо»-и расмӣ намешавад — «Sie»-и расмӣ ҲАМЕША бо ҳарфи
  // калон навишта мешавад. Ҳамин фарқ маҳз он чизест, ки бояд омӯхта шавад.
  const fixed = 'Вай (занона) / Онҳо';
  console.log(`  «sie»: «${sieLower.translation}» → «${fixed}»`);
  if (!DRY) {
    const res = await fetch(`${BASE}/api/admin/words/${sieLower.id}`, {
      method: 'PUT', headers: H, body: JSON.stringify({ translation: fixed }),
    });
    console.log(res.ok ? '  ✓ ислоҳ шуд' : `  ✗ ${(await res.text()).slice(0, 100)}`);
  }
} else console.log('  аллакай тоза');

// ── 2б. Хониши дарси шиносоӣ — ба ҳамон услуб ───────────────────────────────
// Он чор калима дастӣ навишта шуда буданд («да́нке», «зу́па»), пас аз услуби
// курс каме фарқ мекарданд. Ҳамон транслитераторро мегузаронем, то хонанда дар
// ҳама ҷои барнома як хел транскрипсия бинад.
console.log('\n== 2б. Хониши дарси шиносоӣ ==');
const obw = await sql.query(
  `SELECT id, word, transcription, "transcriptionTajik" FROM "OnboardingWord"
   WHERE "targetLanguageId"='cmqdhvfj200001z591mfrnj4z' ORDER BY "order"`);
for (const w of obw) {
  const want = ipaToTajik(w.transcription);
  if (want === w.transcriptionTajik) { console.log(`  = ${w.word}: ${want}`); continue; }
  console.log(`  ${w.word}: «${w.transcriptionTajik}» → «${want}»`);
  if (!DRY) {
    const cur = await (await fetch(
      `${BASE}/api/admin/onboarding?targetLanguageId=cmqdhvfj200001z591mfrnj4z&nativeLanguageId=cmpk1cr9o0000bo0h1mheyoad`,
      { headers: H })).json();
    const rec = (cur.words ?? []).find(x => x.id === w.id);
    const res = await fetch(`${BASE}/api/admin/onboarding`, {
      method: 'PUT', headers: H, body: JSON.stringify({ ...rec, transcriptionTajik: want }),
    });
    if (!res.ok) console.log(`    ✗ ${(await res.text()).slice(0, 90)}`);
  }
}

// ── 3. Хониши тоҷикӣ ────────────────────────────────────────────────────────
console.log('\n== 3. Хониши тоҷикӣ (ipaTajik) ==');
const tj = [];
const tjErrors = [];
for (const w of words) {
  if (!w.ipa?.trim()) { tjErrors.push(`${w.word}: IPA надорад`); continue; }
  let out;
  try { out = ipaToTajik(w.ipa); }
  catch (e) { tjErrors.push(`${w.word}: ${e.message}`); continue; }
  if (!ALLOWED.test(out)) { tjErrors.push(`${w.word}: натиҷаи шубҳанок «${out}»`); continue; }
  tj.push({ ...w, tajik: out });
}
// Ҳама ё ҳеҷ: агар як калима нашавад, база нимкора намемонад.
if (tjErrors.length) {
  console.error(`  ✗ ${tjErrors.length} калима табдил нашуд:`);
  for (const e of tjErrors.slice(0, 20)) console.error(`     ${e}`);
  throw new Error('транслитератсия нопурра — чизе навишта нашуд');
}
console.log('  намунаи 12-то:');
for (const x of tj.slice(0, 12)) console.log(`    ${x.word.padEnd(16)} ${x.ipa.padEnd(20)} → ${x.tajik}`);
if (!DRY) {
  let ok = 0;
  for (const x of tj) {
    const res = await fetch(`${BASE}/api/admin/words/${x.id}`, {
      method: 'PUT', headers: H, body: JSON.stringify({ ipaTajik: x.tajik }),
    });
    if (res.ok) ok++; else console.log(`  ✗ ${x.word}: ${(await res.text()).slice(0, 90)}`);
  }
  console.log(`  сабт шуд: ${ok}/${tj.length}`);
}

// ── 4. Аудио ────────────────────────────────────────────────────────────────
console.log('\n== 4. Аудиои калимаҳо ==');
const need = words.filter(w => !w.audioUrl?.trim());
console.log(`  бе аудио: ${need.length}`);
if (!DRY && need.length) {
  mkdirSync(WORK, { recursive: true });
  writeFileSync(`${WORK}/items.json`, JSON.stringify(need.map(w => ({ id: w.id, text: w.word })), null, 1));
  const out = execFileSync('python', ['prisma/_de-tts.py', WORK, `${WORK}/items.json`],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 1 << 24 });
  console.log('  ' + out.trim().split('\n').slice(-1)[0]);

  let ok = 0;
  for (const w of need) {
    const buf = readFileSync(`${WORK}/${w.id}.mp3`);
    const fd = new FormData();
    fd.append('file', new File([buf], `de_word_${w.id}.mp3`, { type: 'audio/mpeg' }));
    const up = await fetch(`${BASE}/api/admin/upload`, {
      method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
    });
    const body = await up.json();
    if (!up.ok || !body.url) { console.log(`  ✗ ${w.word}: upload ${up.status}`); continue; }
    const res = await fetch(`${BASE}/api/admin/words/${w.id}`, {
      method: 'PUT', headers: H, body: JSON.stringify({ audioUrl: body.url }),
    });
    if (res.ok) ok++; else console.log(`  ✗ ${w.word}: ${(await res.text()).slice(0, 90)}`);
  }
  console.log(`  пайваст шуд: ${ok}/${need.length}`);
}

// ── 5. Санҷиши аудио ────────────────────────────────────────────────────────
if (!DRY) {
  console.log('\n== 5. Санҷиши аудио ==');
  const rows = await sql.query(
    `SELECT w.id, w.word, w."audioUrl" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
     JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}'`);
  const seen = new Map();
  let bad = 0, checked = 0;
  for (const r of rows) {
    if (!r.audioUrl) { console.log(`  ✗ ${r.word}: аудио нест`); bad++; continue; }
    const res = await fetch(r.audioUrl);
    if (!res.ok) { console.log(`  ✗ ${r.word}: HTTP ${res.status}`); bad++; continue; }
    const b = Buffer.from(await res.arrayBuffer());
    const md5 = createHash('md5').update(b).digest('hex');
    // Ду калимаи гуногун бо файли айнан якхела = ё хато дар пайвастан, ё
    // TTS барои ҳарду як чиз хондааст.
    if (seen.has(md5) && seen.get(md5).toLowerCase() !== r.word.toLowerCase()) {
      console.log(`  ✗ ${r.word}: файлаш ба «${seen.get(md5)}» айнан баробар`); bad++;
    }
    seen.set(md5, r.word);
    if (b.length < 2000) { console.log(`  ✗ ${r.word}: файл хеле хурд (${b.length}b)`); bad++; }
    checked++;
  }
  console.log(`  санҷида шуд: ${checked} · мушкил: ${bad}`);
}
