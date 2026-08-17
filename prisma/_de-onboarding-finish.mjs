// Дарси шиносоии олмонӣ (de → tg) — ба меъёри англисӣ/русӣ/арабӣ мерасонад:
//  1) ба се калимаи мавҷуда ҷумлаи намунавӣ ва транскрипсияи IPA мебандад
//  2) калимаи чорумро («Super» — ҳамтои `Best` / `ممتاز`) месозад
//  3) аудиои ҳар чор калимаро БО ЯК ОВОЗ аз нав тавлид мекунад
//
// Чаро овоз иваз мешавад: се файли мавҷуда бо OpenAI `nova` сохта шуда буданд,
// вале кредити OpenAI тамом шуд (429 insufficient_quota), пас калимаи нав ва
// тамоми аудиои минбаъдаи курси олмонӣ аз Google меояд. Дарси шиносоӣ бояд бо
// як овоз садо диҳад, аз ин рӯ ҳар чор аз нав сохта мешаванд.
// `de-DE-Neural2-F` — ҳамтои олмонии `en-US-Neural2-F`: занона, барои калимаи
// алоҳида равшан (ниг. эзоҳи gen-all-audio-google.mjs).
//
// URL-ҳои кӯҳна дар jsDelivr дастнорас намешаванд — бозгашт мумкин аст.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const KEY = env.GOOGLE_TTS_KEY;
if (!KEY) { console.error('GOOGLE_TTS_KEY нест'); process.exit(1); }

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const VOICE = 'de-DE-Neural2-F';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// Транскрипсия: IPA дар майдони асосӣ (мисли en/ru), хониши тоҷикӣ бо аломати
// зада дар майдони дуюм — экран ҳардуро чун «/ipa/ [тоҷикӣ]» нишон медиҳад.
const PATCH = {
  Hallo: {
    transcription: '/ˈhalo/', transcriptionTajik: 'ҳа́ло',
    example: 'Hallo, mein Freund!', exampleTrans: 'Салом, дӯсти ман!',
  },
  Danke: {
    transcription: '/ˈdaŋkə/', transcriptionTajik: 'да́нке',
    example: 'Danke schön!', exampleTrans: 'Бисёр ташаккур!',
  },
  Ja: {
    transcription: '/jaː/', transcriptionTajik: 'йа',
    example: 'Ja, ich verstehe.', exampleTrans: 'Бале, ман мефаҳмам.',
  },
};

const NEW_WORD = {
  targetLanguageId: DE, nativeLanguageId: TG,
  word: 'Super', translation: 'Аъло', emoji: '🏆',
  // Дар олмонӣ «s» пеш аз садонок ҳамчун [z] хонда мешавад — маҳз барои ҳамин
  // транскрипсия ба навомӯз лозим аст.
  transcription: '/ˈzuːpɐ/', transcriptionTajik: 'зу́па',
  example: 'Du bist super!', exampleTrans: 'Шумо аъло ҳастед!',
  options: ['Аъло', 'Бадтарин', 'Хурд', 'Калон'],
  order: 3,
};

const get = async () => (await (await fetch(
  `${BASE}/api/admin/onboarding?targetLanguageId=${DE}&nativeLanguageId=${TG}`, { headers: H })).json()).words;

async function tts(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'de-DE', name: VOICE },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const { audioContent } = await res.json();
  if (!audioContent) throw new Error('ҷавоб бе audioContent');
  return Buffer.from(audioContent, 'base64');
}

async function upload(buf, name) {
  const fd = new FormData();
  fd.append('file', new File([buf], name, { type: 'audio/mpeg' }));
  const res = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
  });
  const body = await res.json();
  if (!res.ok || !body.url) throw new Error(`upload ${res.status}: ${JSON.stringify(body).slice(0, 160)}`);
  return body.url;
}

// ── 1. Матни се калимаи мавҷуда ─────────────────────────────────────────────
console.log('== Қадами 1: ҷумла ва IPA ==');
let words = await get();
for (const w of words) {
  const patch = PATCH[w.word];
  if (!patch) { console.log(`  ? ${w.word}: дар нақша нест — даст нарасид`); continue; }
  const res = await fetch(`${BASE}/api/admin/onboarding`, {
    method: 'PUT', headers: H, body: JSON.stringify({ ...w, ...patch }),
  });
  console.log(res.ok ? `  ✓ ${w.word} — «${patch.example}»` : `  ✗ ${w.word}: ${(await res.text()).slice(0, 120)}`);
}

// ── 2. Калимаи чорум ────────────────────────────────────────────────────────
console.log('\n== Қадами 2: калимаи чорум «Super» ==');
words = await get();
if (words.some(w => w.word === NEW_WORD.word)) {
  console.log('  аллакай ҳаст — гузашт');
} else {
  const res = await fetch(`${BASE}/api/admin/onboarding`, {
    method: 'POST', headers: H, body: JSON.stringify(NEW_WORD),
  });
  console.log(res.ok ? '  ✓ сохта шуд' : `  ✗ ${(await res.text()).slice(0, 160)}`);
}

// ── 3. Аудиои ягона барои ҳар чор ───────────────────────────────────────────
console.log(`\n== Қадами 3: аудио (${VOICE}) ==`);
words = (await get()).sort((a, b) => a.order - b.order);
for (const w of words) {
  try {
    const buf = await tts(w.word);
    const url = await upload(buf, `de_onboarding_${w.id}.mp3`);
    const res = await fetch(`${BASE}/api/admin/onboarding`, {
      method: 'PUT', headers: H, body: JSON.stringify({ ...w, audioUrl: url }),
    });
    console.log(res.ok
      ? `  ✓ ${w.word}: ${(buf.length / 1024).toFixed(1)}KB → ${url.split('/').pop()}`
      : `  ✗ ${w.word}: сабт нашуд — ${(await res.text()).slice(0, 120)}`);
  } catch (e) {
    console.log(`  ✗ ${w.word}: ${e.message}`);
  }
}

// ── 4. Санҷиши ниҳоӣ ────────────────────────────────────────────────────────
console.log('\n== Қадами 4: санҷиш ==');
words = (await get()).sort((a, b) => a.order - b.order);
let problems = 0;
for (const w of words) {
  const miss = ['translation', 'transcription', 'transcriptionTajik', 'emoji', 'example', 'exampleTrans', 'audioUrl']
    .filter(f => !w[f] || !String(w[f]).trim());
  if ((w.options ?? []).length !== 4) miss.push('options(4)');
  if (w.options && !w.options.includes(w.translation)) miss.push('ҷавоби дуруст дар options нест');
  let audio = '—';
  if (w.audioUrl) {
    const h = await fetch(w.audioUrl, { method: 'HEAD' });
    audio = h.ok ? `${h.status}, ${h.headers.get('content-length')}b` : `✗ ${h.status}`;
    if (!h.ok) miss.push('audio-unreachable');
  }
  if (miss.length) problems++;
  console.log(`#${w.order} ${w.word} = ${w.translation} ${w.emoji}
    ${w.transcription} [${w.transcriptionTajik}]
    «${w.example}» / «${w.exampleTrans}»
    options: ${JSON.stringify(w.options)}
    audio: ${audio}${miss.length ? `\n    ⚠ нокомил: ${miss.join(', ')}` : ''}`);
}
console.log(`\nҲамагӣ ${words.length} калима · мушкилот: ${problems}`);
