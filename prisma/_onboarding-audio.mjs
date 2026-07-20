// Қадами 2: аудиои студиявӣ барои калимаҳои онбординг (шаш забон).
// Пайплайн ҳамон аст, ки барои англисӣ/русӣ истифода шуд: OpenAI TTS →
// {recordId}.mp3 → репои ramz-audio → jsDelivr. Калид аз .env хонда мешавад ва
// ҳеҷ гоҳ чоп/сабт намешавад.
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
if (!env.OPENAI_API_KEY) { console.error('OPENAI_API_KEY нест'); process.exit(1); }

const BASE = 'https://admin.ramz.tj';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const REPO = process.argv[2]; // роҳи клони ramz-audio
if (!REPO) { console.error('роҳи репо лозим'); process.exit(1); }

const LANGS = {
  'cmpqk40yz00009rhl1uazdfi3': { code: 'ru', name: 'Russian' },
  'cmqdse2sw0000p7emq64xbcy5': { code: 'zh', name: 'Mandarin Chinese' },
  'cmqdgus870000c7nfz5z16xbx': { code: 'tr', name: 'Turkish' },
  'cmqdhvfj200001z591mfrnj4z': { code: 'de', name: 'German' },
  'cmqdqfuxi00001rcsseeq42fi': { code: 'ar', name: 'Modern Standard Arabic' },
  'cmqe2wgkn0000mja0v7o9ehvb': { code: 'ja', name: 'Japanese' },
};

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const made = [];
for (const [langId, { code, name }] of Object.entries(LANGS)) {
  const data = await (await fetch(`${BASE}/api/admin/onboarding?targetLanguageId=${langId}&nativeLanguageId=${TG}`, { headers: H })).json();
  const words = data.words || data;
  const dir = `${REPO}/audio/${code}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  for (const w of words) {
    if (w.audioUrl && w.audioUrl.trim()) { console.log(`  ${code}/${w.word}: аудио дорад — гузашт`); continue; }
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'nova',
        input: w.word,
        response_format: 'mp3',
        // Як калимаи ягона барои НАВОМӮЗ: равшан, оҳиста, бо талаффузи дурусти
        // ҳамон забон — на суръати гуфтугӯи табиӣ.
        instructions: `Speak this single ${name} word clearly and slowly, as a pronunciation model for a complete beginner. Natural native accent, neutral friendly tone.`,
      }),
    });
    if (!res.ok) { console.log(`  ✗ ${code}/${w.word}: TTS ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(`${dir}/${w.id}.mp3`, buf);
    made.push({ id: w.id, code, word: w.word, langId, rec: w, bytes: buf.length });
    console.log(`  ✓ ${code}/${w.word} → ${w.id}.mp3 (${(buf.length / 1024).toFixed(1)}KB)`);
  }
}

writeFileSync(new URL('./_onboarding-audio-made.json', import.meta.url),
  JSON.stringify(made.map(({ id, code, word, langId, rec }) => ({ id, code, word, langId, rec })), null, 1));
console.log(`\nСохта шуд: ${made.length} файл. Акнун репоро push кунед, баъд қадами 3.`);
