// Аудио барои 31 калимаи нави A1 — тавассути Google TTS (РОЙГОН, бе калид).
//
// Чаро на OpenAI: квотаи OpenAI тамом шуд маҳз баъд аз он ки калимаҳо дар
// базаи ЗИНДА иваз шуданд. Файли аудио бо ID-и калима ном дорад, пас файлҳои
// кӯҳна калимаи КӮҲНА-ро мегуфтанд («Name» дидан, «One» шунидан) — ин аз
// фарқи ночизи овоз хеле бадтар аст. Овози Google каме фарқ мекунад, вале
// калима ДУРУСТ аст. Баъдтар, вақте квота нав шуд, метавон бо ҳамон
// _a1-dedupe-audio.mjs дубора бо овози «nova» сохт.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const REPO = process.argv[2];
if (!REPO) { console.error('роҳи репо лозим'); process.exit(1); }
const dir = `${REPO}/audio/en`;
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const words = JSON.parse(readFileSync(new URL('./_a1-dedupe-new.json', import.meta.url), 'utf8'));
let ok = 0, fail = 0;

for (const w of words) {
  const dest = `${dir}/${w.id}.mp3`;
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8' +
    `&q=${encodeURIComponent(w.word)}&tl=en&client=tw-ob`;
  try {
    // curl, не fetch: fetch-и Node дар Windows дар ин хост овезон мешавад.
    execFileSync('curl', ['-s', '-o', dest, '--max-time', '45',
      '-A', 'Mozilla/5.0', url], { stdio: 'ignore' });
    const size = readFileSync(dest).length;
    if (size < 1000) throw new Error(`хеле хурд (${size}b)`);
    ok++; console.log(`  ✓ ${w.word.padEnd(15)} ${(size / 1024).toFixed(1)}KB`);
  } catch (e) {
    fail++; console.log(`  ✗ ${w.word}: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 700)); // мулоим бо хост
}
console.log(`\nАудио: ${ok} тайёр | ${fail} хато`);
