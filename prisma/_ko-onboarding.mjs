// Дарси шиносоии кореягӣ (ko → tg) — 3 калима, мисли ja/zh/tr:
// Салом · Ташаккур · Бале. (Қарори корбар 2026-09-10: 3 калима басанда аст —
// чоруми «Аъло»-и арабӣ/олмонӣ қасдан нест.)
//
// Ҷараён (ҳамон роҳи `_de-onboarding-*.mjs` + қадами буриши `_ko-alphabet-audio.mjs`):
//   1) матн тавассути admin API (POST нав / PUT мавҷуда) — миёнабури `lib/prisma.ts`
//      `content_version`-ро худаш мебардорад, SQL-и дастӣ лозим нест
//   2) аудио: Google Cloud TTS Chirp3-HD (ҳамон оилае, ки курси русӣ дорад) →
//      `_ar-trim.py` (хомӯшии сару охир) → `POST /api/admin/upload` → PUT audioUrl.
//      Таърих: edge-tts SunHi → Google Kore → Google Despina (ниг. `VOICE`).
//   3) санҷиш: майдонҳо, вариантҳо, ҳангул, хониши тоҷикӣ, аудио (HTTP, давомнокӣ,
//      такрор), ва ниҳоят ҷавоби `GET /api/mobile/onboarding` — ҳамон чизе, ки барнома мегирад
//
// Идемпотент: калима аз рӯи `word` ёфта мешавад; аудио танҳо барои калимаи БЕ
// аудио сохта мешавад (`--reaudio` — ҳамаро аз нав).
//
//   node prisma/_ko-onboarding.mjs            # сохтан + санҷиш
//   node prisma/_ko-onboarding.mjs --check    # танҳо санҷиш
//   node prisma/_ko-onboarding.mjs --reaudio  # аудиоро аз нав
import { SignJWT } from 'jose';
import { hangulToTajik } from './_ko-tajik.mjs';
import { speakReliable, useTrimOrRaw } from './_ko-tts-google.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const BASE = 'https://admin.ramz.tj';
const KO = 'cmtkb6u4i000pd8149oc';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/ko-onboarding-audio';
const CHECK_ONLY = process.argv.includes('--check');
const REAUDIO = process.argv.includes('--reaudio');

// ЧАРО Despina, на Kore-и курси русӣ (2026-09-10): корбар овози «фаҳмо, тоза, нарм,
// дилнишин» хост ва интихобро ба ман вогузошт. 9 овози Chirp3-HD × 3 калима × 3
// такрор чен карда шуд; Despina: оҳистатарин (0.165 с/ҳиҷо — Kore 0.144),
// нармтарин (маркази спектр 376 — Kore 912, сахттарин), басомади баланди кам.
// Тавсифи худи Google: Despina = «Smooth», Kore = «Firm». Ҷои дуюм: Erinome («Clear»).
const VOICE = 'ko-KR-Chirp3-HD-Despina';
const TAKES = 3;
if (!CHECK_ONLY && !env.GOOGLE_TTS_KEY) { console.error('GOOGLE_TTS_KEY нест'); process.exit(1); }
async function googleTts(text) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ko-KR', name: VOICE },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    if (a === 3) throw new Error(`TTS ${res.status}: ${JSON.stringify(d).slice(0, 160)}`);
    await new Promise(r => setTimeout(r, 1500 * (a + 1)));
  }
}
// Chirp3-HD ҳамеша CBR 32 kbps аст, пас дарозӣ = байт × 8 / 32000.
const secOf = (b) => b.length * 8 / 32000;

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// ── Мазмун ──────────────────────────────────────────────────────────────────
// `transcription` = IPA (мисли en/ru/de ва сутуни `ipa`-и алифбои кореягӣ).
// `transcriptionTajik` БЕ аломати зада: дар кореягӣ задаи луғавӣ нест —
// ҳиҷоҳо баробар гуфта мешаванд, пас «́» маълумоти бардурӯғ медод.
// Хониш аз рӯи қоидаҳои алифбо: «камсаҳамнида» (ㄱ дар сари калима «к»),
// ㅔ = «э», ㅇ дар таг = «нг» — «аннёнгҳасэё», «нэ».
//
// ⚠️ 네 = «Бале», вале садояш ба «не»-и тоҷикӣ (= «нест») монанд аст — доми
// маҳз барои тоҷик. Хониш «нэ» навишта мешавад (ㅔ = «э», мисли алифбо), то бо
// «не» чашм омехта накунад, ва «Не» қасдан дар вариантҳо истодааст.
//
// Ҷои ҷавоби дуруст дар `options` паҳн: 1 · 3 · 0.
const WORDS = [
  {
    word: '안녕하세요', translation: 'Салом', emoji: '👋',
    transcription: '/an.njʌŋ.ha.se.jo/', transcriptionTajik: 'аннёнгҳасэё',
    example: '안녕하세요, 선생님!', exampleTrans: 'Салом, муаллим!',
    options: ['Хайр', 'Салом', 'Бале', 'Ташаккур'], order: 0,
  },
  {
    word: '감사합니다', translation: 'Ташаккур', emoji: '🙏',
    transcription: '/kam.sa.ham.ni.da/', transcriptionTajik: 'камсаҳамнида',
    example: '정말 감사합니다!', exampleTrans: 'Бисёр ташаккур!',
    options: ['Салом', 'Бале', 'Не', 'Ташаккур'], order: 1,
  },
  {
    word: '네', translation: 'Бале', emoji: '✅',
    transcription: '/ne/', transcriptionTajik: 'нэ',
    example: '네, 알겠습니다.', exampleTrans: 'Бале, фаҳмидам.',
    options: ['Бале', 'Не', 'Шояд', 'Хайр'], order: 2,
  },
];

// Хониш бояд АЙНАН ба транслитератор (`_ko-tajik.mjs`) баробар бошад — ҳамон ки
// корти калимаи курс ва қоидаҳои алифбо истифода мебаранд. Пештар ин ҷо «аннёнҳасэё»
// буд, дар курс «аннёнгҳасэё» (ㅇ дар таг ҳамеша «нг») — як калима, ду навишт.
const KNOWN_READING = Object.fromEntries(WORDS.map(w => [w.word, hangulToTajik(w.word)]));

const get = async () => {
  const r = await fetch(`${BASE}/api/admin/onboarding?targetLanguageId=${KO}&nativeLanguageId=${TG}`, { headers: H });
  if (!r.ok) throw new Error(`GET onboarding ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return (await r.json()).words.sort((a, b) => a.order - b.order);
};
const put = (w) => fetch(`${BASE}/api/admin/onboarding`, { method: 'PUT', headers: H, body: JSON.stringify(w) });

if (!CHECK_ONLY) {
  // ── 1. Матн ─────────────────────────────────────────────────────────────────
  console.log('== Қадами 1: матн ==');
  let existing = await get();
  const stray = existing.filter(e => !WORDS.some(w => w.word === e.word));
  if (stray.length) console.log(`  ℹ калимаҳои берун аз нақша (даст нарасид): ${stray.map(s => s.word).join(', ')}`);
  for (const w of WORDS) {
    const cur = existing.find(e => e.word === w.word);
    const res = cur
      ? await put({ ...cur, ...w, targetLanguageId: KO, nativeLanguageId: TG })
      : await fetch(`${BASE}/api/admin/onboarding`, {
          method: 'POST', headers: H,
          body: JSON.stringify({ ...w, targetLanguageId: KO, nativeLanguageId: TG }),
        });
    console.log(res.ok ? `  ✓ ${cur ? 'навсозӣ' : 'сохта шуд'}: ${w.word} = ${w.translation}`
                       : `  ✗ ${w.word}: ${res.status} ${(await res.text()).slice(0, 160)}`);
  }

  // ── 2. Аудио ────────────────────────────────────────────────────────────────
  existing = await get();
  const need = existing.filter(w => REAUDIO || !w.audioUrl);
  console.log(`\n== Қадами 2: аудио (${need.length} калима) ==`);
  if (need.length) {
    mkdirSync(WORK, { recursive: true });
    for (const w of need) {
      // Chirp3-HD детерминистӣ НЕСТ: ҳар дафъа клипи дигар (хомӯшии сар 0.04–0.7с,
      // дарозӣ ±20%). Аз се такрор МИЁНАро аз рӯи дарозӣ мегирем — на тезтарин
      // (метавонад ҳиҷоро фурӯ барад), на сусттарин.
      // Садои ВОҚЕӢ санҷида мешавад: «миёна аз рӯи дарозӣ» барои 네 нусхаи
      // хомӯшро интихоб карда буд (2026-09-11). Ниг. `_ko-tts-google.mjs`.
      const { buf, variant, attempts } = await speakReliable(w.word, { apiKey: env.GOOGLE_TTS_KEY, workDir: WORK });
      writeFileSync(`${WORK}/${w.id}.mp3`, buf);
      console.log(`  ${w.word}: ${variant}, ${attempts} кӯшиш`);
    }
    const pyEnv = { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } };
    const TRIM = `${WORK}-trim`;
    console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], pyEnv).trim().split('\n').slice(-1)[0]);
    const { still: silent, usedRaw } = useTrimOrRaw(need.map(w => [`${WORK}/${w.id}.mp3`, `${TRIM}/${w.id}.mp3`]));
    if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд (буриш садоро мехӯрд)`);
    if (silent.length) { console.error('✗ файли хомӯш баъди буриш — ҳеҷ чиз бор нашуд:', silent.join(', ')); process.exit(1); }
    for (const w of need) {
      const fd = new FormData();
      // Номи файл ASCII — ҳангул дар роҳи Blob танҳо кодкунии URL-ро мушкил мекунад.
      fd.append('file', new File([readFileSync(`${TRIM}/${w.id}.mp3`)], `ko_onboarding_${w.id}.mp3`, { type: 'audio/mpeg' }));
      const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
      const body = await up.json().catch(() => ({}));
      if (!up.ok || !body.url) { console.log(`  ✗ ${w.word}: upload ${up.status}`); continue; }
      const res = await put({ ...w, audioUrl: body.url });
      console.log(res.ok ? `  ✓ ${w.word}` : `  ✗ ${w.word}: ${(await res.text()).slice(0, 120)}`);
    }
  }
}

// ── 3. Санҷиш ─────────────────────────────────────────────────────────────────
console.log('\n== Қадами 3: санҷиш ==');
// Давомнокии MP3 — MPEG-1 ВА MPEG-2 (edge-tts 24 кГц = MPEG-2); ниг. `_ko-alphabet-audio.mjs`.
const RATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const RATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
function duration(b) {
  let i = 0, frames = 0, sr = 0, spf = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3;
      const br = (ver === 3 ? RATES_V1 : RATES_V2)[(b[i + 2] >> 4) & 0xF];
      let s = [44100, 48000, 32000][(b[i + 2] >> 2) & 3];
      const pad = (b[i + 2] >> 1) & 1;
      if (!br || !s || ver === 1) { i++; continue; }
      if (ver === 2) s /= 2; else if (ver === 0) s /= 4;
      spf = ver === 3 ? 1152 : 576;
      i += Math.floor((spf / 8) * br * 1000 / s) + pad;
      frames++; sr = s;
    } else i++;
  }
  return sr ? frames * spf / sr : 0;
}

const HANGUL = /[가-힣]/;
const TAJIK_ONLY = /^[а-яёғӣқӯҳҷ\s-]+$/i;
const words = await get();
const seen = new Map();
const positions = [];
let bad = 0;
for (const w of words) {
  const P = [];
  for (const f of ['translation', 'transcription', 'transcriptionTajik', 'emoji', 'example', 'exampleTrans', 'audioUrl'])
    if (!w[f] || !String(w[f]).trim()) P.push(`${f} холӣ`);
  const opts = w.options ?? [];
  if (opts.length !== 4) P.push(`options = ${opts.length}, на 4`);
  if (new Set(opts).size !== opts.length) P.push('варианти такрорӣ');
  const pos = opts.indexOf(w.translation);
  if (pos < 0) P.push('ҷавоби дуруст дар options нест'); else positions.push(pos);
  if (!HANGUL.test(w.word)) P.push('калима ҳангул нест');
  if (w.example && !w.example.includes(w.word)) P.push('мисол худи калимаро надорад');
  if (w.transcriptionTajik && !TAJIK_ONLY.test(w.transcriptionTajik)) P.push(`хониш аломати бегона дорад: «${w.transcriptionTajik}»`);
  if (KNOWN_READING[w.word] && KNOWN_READING[w.word] !== w.transcriptionTajik)
    P.push(`хониш ба китоб/алифбо зид: «${w.transcriptionTajik}» ≠ «${KNOWN_READING[w.word]}»`);
  if (w.transcriptionTajik === w.translation.toLowerCase()) P.push('хониш = тарҷума');

  let audio = '—';
  if (w.audioUrl) {
    let r;
    for (let k = 0; k < 3 && !(r?.ok); k++) r = await fetch(w.audioUrl).catch(() => null);
    if (!r?.ok) P.push(`аудио HTTP ${r?.status ?? 'шабака'}`);
    else {
      const b = Buffer.from(await r.arrayBuffer());
      const md5 = createHash('md5').update(b).digest('hex').slice(0, 8);
      const sec = duration(b);
      if (seen.has(md5)) P.push(`аудио айнан ба «${seen.get(md5)}» баробар`);
      seen.set(md5, w.word);
      // 네 як ҳиҷо (~0.3с), 안녕하세요 панҷ ҳиҷо (~1с); берун аз ин = TTS чизи дигар хондааст.
      if (sec < 0.25 || sec > 2.0) P.push(`аудио ${sec.toFixed(2)}с — берун аз меъёр`);
      audio = `${sec.toFixed(2)}с · ${(b.length / 1024).toFixed(1)}KB · md5=${md5}`;
    }
  }
  if (P.length) bad++;
  console.log(`#${w.order} ${w.emoji} ${w.word} = ${w.translation}
     ${w.transcription}  [${w.transcriptionTajik}]
     «${w.example}» — «${w.exampleTrans}»
     options: ${JSON.stringify(opts)}  (дуруст: ${pos})
     аудио: ${audio}${P.length ? `\n     ⚠ ${P.join(' · ')}` : ''}`);
}
if (words.length !== WORDS.length) { console.log(`  ✗ дар база ${words.length} калима, интизор ${WORDS.length}`); bad++; }
if (new Set(positions).size < Math.min(positions.length, 4)) { console.log(`  ✗ ҷои ҷавоби дуруст паҳн нест: ${positions}`); bad++; }

// Ҳамон чизе, ки барнома мегирад — роути мобилӣ, на админ.
const mob = await (await fetch(`${BASE}/api/mobile/onboarding?targetLanguageId=${KO}&nativeLanguageId=${TG}`)).json();
const mobWords = (mob.words ?? []).map(w => w.word);
console.log(`\nAPI-и мобилӣ: ${mobWords.length} калима → ${mobWords.join(' · ')}`);
if (mobWords.join('|') !== WORDS.map(w => w.word).join('|')) { console.log('  ✗ роути мобилӣ бо нақша рост намеояд'); bad++; }

console.log(`\nМушкилот: ${bad}`);
process.exit(bad ? 1 : 0);
