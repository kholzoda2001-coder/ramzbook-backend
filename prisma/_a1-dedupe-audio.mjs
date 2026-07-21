// Аудиои студиявӣ барои 31 калимаи нави A1 (баъд аз бартарафи такрор).
// Ҳамон пайплайни курс: OpenAI TTS → {wordId}.mp3 → ramz-audio → jsDelivr.
// (Аудио бо OpenAI аст, чун тамоми 3900 файли курс ҳамин овоз — nova — аст;
// овози дигар дар байни дарс ноҷур мешуд. Расмҳо ройгонанд, ин ҷо ҳарф дигар.)
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const REPO = process.argv[2];
if (!REPO) { console.error('роҳи репои ramz-audio лозим'); process.exit(1); }

const words = JSON.parse(readFileSync(new URL('./_a1-dedupe-new.json', import.meta.url), 'utf8'));
const dir = `${REPO}/audio/en`;
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

let ok = 0, fail = 0;
for (const w of words) {
  const dest = `${dir}/${w.id}.mp3`;
  if (existsSync(dest)) { console.log(`  skip ${w.word}`); ok++; continue; }
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts', voice: 'nova', input: w.word, response_format: 'mp3',
      instructions: 'Speak this single English word clearly and slowly, as a pronunciation model for a complete beginner. Neutral, friendly tone.',
    }),
  });
  if (!res.ok) { console.log(`  ✗ ${w.word}: ${res.status} ${(await res.text()).slice(0, 90)}`); fail++; continue; }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  ok++; console.log(`  ✓ ${w.word}`);
}
console.log(`\nАудио: ${ok} тайёр | ${fail} хато`);
