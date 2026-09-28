// Санҷиши ЗИНДАИ Azure барои забони нав (28.09.2026, туркӣ).
//
// Ҳар ибора: edge-tts → WAV 16 кГц → REST-и Azure бо Pronunciation Assessment
// (ҳамон параметрҳои `lib/ai/pronunciation.ts`). Чоп мекунад:
//   • Display — он чи Azure дар экран менависад (рақамҳо, ҳарфи калон, апостроф);
//   • Lexical — шакли калимаӣ;
//   • холҳо ва калимаҳои сурх (ErrorType ≠ None).
// Калиди Azure дар .env-и маҳаллӣ НЕСТ → токен аз `/api/mobile/speech/token`
// бо JWT-и корбар (`JWT_SECRET` аз .env).
//
//   node --dns-result-order=ipv4first prisma/_speaking-azure-live.mjs --lang=tr [--voice=…] [--neg] "ибора 1" …
//   (бе ибора — рӯйхати пешфарзи забон)

import { readFileSync, mkdirSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d}`).split('=').slice(1).join('=');
const LANG = arg('lang', 'tr');
const LOCALES = { tr: 'tr-TR', en: 'en-US', ru: 'ru-RU', ar: 'ar-SA', ko: 'ko-KR', de: 'de-DE' };
const VOICES = { tr: 'tr-TR-EmelNeural', en: 'en-US-AriaNeural', ru: 'ru-RU-SvetlanaNeural', ar: 'ar-SA-ZariyahNeural', ko: 'ko-KR-SunHiNeural', de: 'de-DE-KatjaNeural' };
const VOICE = arg('voice', VOICES[LANG]);
const LOCALE = LOCALES[LANG];
const API = 'https://admin.ramz.tj';
const PYTHON = process.env.PYTHON || 'C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe';
const TMP = join('tmp', `azure-live-${LANG}`);

const DEFAULTS = {
  tr: [
    'İyi günler, ben Ali.', 'Işık yanmıyor.', 'Beş yüz lira lütfen.', 'Saat yedide başlıyoruz.',
    'Üçüncü katta çalışıyorum.', 'On iki metre kablo lazım.', 'Yüzde elli indirim var mı?',
    'Bin beş yüz lira maaş alıyorum.', 'İki kilo çimento getir.', 'Dördüncü kata çık.',
    'Evet.', 'Tamam.', 'Hayır.', 'Dört saat çalıştım.', 'Yarın sabah sekizde gel.',
    'İstanbul\u2019a gidiyorum.', 'Kaç lira?', 'Kırk beş dakika bekledim.', 'Hâlâ bekliyorum.',
    'Yirmi üç yaşındayım.', 'Usta, merdiven nerede?', 'İş güvenliği önemli.',
  ],
};

const env = () => Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));

async function userAccess() {
  const { default: jwt } = await import('jsonwebtoken');
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(env().DATABASE_URL);
  const [u] = await sql`SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1`;
  return jwt.sign({ userId: u.id, tokenType: 'access' }, env().JWT_SECRET,
    { subject: u.id, issuer: 'ramz-api', audience: 'ramz-mobile', expiresIn: '30m' });
}

async function azureToken(access) {
  const r = await fetch(`${API}/api/mobile/speech/token`, { headers: { Authorization: `Bearer ${access}` } });
  if (!r.ok) throw new Error(`token ${r.status} ${await r.text()}`);
  return r.json();
}

// ffmpeg дар PATH нест — бинарӣ аз `imageio_ffmpeg` (мисли `_speaking-audio-lang.mjs`).
let ffmpeg = null;
const FF = () => (ffmpeg ??= spawnSync(PYTHON, ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'])
  .stdout.toString().trim());

function wavOf(text, i) {
  mkdirSync(TMP, { recursive: true });
  const mp3 = join(TMP, `${i}.mp3`), wav = join(TMP, `${i}.wav`);
  const key = join(TMP, `${i}.txt`);
  if (!(existsSync(wav) && existsSync(key) && readFileSync(key, 'utf8') === `${VOICE}|${text}`)) {
    const py = spawnSync(PYTHON, ['-m', 'edge_tts', '--voice', VOICE, '--text', text, '--write-media', mp3],
      { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    if (py.status !== 0) throw new Error(`edge-tts: ${py.stderr}`);
    // 0.4 с хомӯшӣ дар сар ва охир — мисли микрофон, то Azure калимаи аввал/охирро набурад.
    spawnSync(FF(), ['-y', '-loglevel', 'error', '-i', mp3, '-af', 'adelay=400,apad=pad_dur=0.4',
      '-ar', '16000', '-ac', '1', '-sample_fmt', 's16', wav]);
    spawnSync('node', ['-e', `require('fs').writeFileSync(${JSON.stringify(key)}, ${JSON.stringify(`${VOICE}|${text}`)})`]);
  }
  return readFileSync(wav);
}

async function assess(tok, audio, reference) {
  const params = Buffer.from(JSON.stringify({
    ReferenceText: reference, GradingSystem: 'HundredMark', Granularity: 'Phoneme',
    Dimension: 'Comprehensive', EnableMiscue: true,
  }), 'utf8').toString('base64');
  const url = `https://${tok.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${LOCALE}&format=detailed`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok.token}`, 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': params, Accept: 'application/json' },
    body: new Uint8Array(audio),
  });
  const body = await r.text();
  if (!r.ok) return { error: `${r.status} ${body.slice(0, 200)}` };
  return JSON.parse(body);
}

const phrases = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const neg = process.argv.includes('--neg'); // назорати манфӣ: аудиои ибораи i бо матни ибораи i+1
const list = phrases.length ? phrases : DEFAULTS[LANG];
const clip = wavOf;
const access = await userAccess();
const tok = await azureToken(access);
console.log(`${LOCALE} · ${list.length} ибора${neg ? ' · НАЗОРАТИ МАНФӢ' : ''}
`);
for (let i = 0; i < list.length; i++) {
  const ref = neg ? list[(i + 1) % list.length] : list[i];
  const res = await assess(tok, clip(i), ref);
  if (res.error) { console.log(`✗ «${list[i]}» → ${res.error}`); continue; }
  const b = res.NBest?.[0];
  if (!b) { console.log(`✗ «${list[i]}» → ${res.RecognitionStatus}`); continue; }
  const pa = b.PronunciationAssessment ?? b;
  const words = (b.Words ?? []).map((w) => {
    const e = (w.PronunciationAssessment ?? w).ErrorType;
    const s = (w.PronunciationAssessment ?? w).AccuracyScore;
    return e && e !== 'None' ? `❌${w.Word}(${e}:${s ?? '-'})` : `${w.Word}:${s ?? '-'}`;
  }).join(' ');
  console.log(`«${ref}»
   Display: ${res.DisplayText}
   Lexical: ${b.Lexical} · ITN: ${b.ITN}
   PA acc ${pa.AccuracyScore} · compl ${pa.CompletenessScore} · pron ${pa.PronScore}
   ${words}
`);
}
