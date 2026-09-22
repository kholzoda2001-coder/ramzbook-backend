// Дарси шиносоии туркӣ (OnboardingWord) — чор калимаи аввал, ки корбар пеш аз
// сабти ном мебинад.
//
// То ин ҷо туркӣ се калима дошт ва ҳеҷ кадом ҷумлаи намунавӣ надошт — дар ҳоле
// ки олмонӣ чор калима бо мисол дорад. Чорумӣ ҳамтои `Super`/`Best` аст:
// калимаи мусбат, ки корбар онро фавран шинохта, ҳиссиёти хуб мегирад.
//
//   node prisma/_tr-onboarding.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { transcribe } from './_tr-tajik.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const TR = 'cmqdgus870000c7nfz5z16xbx';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const APPLY = process.argv.includes('--apply');

const WORDS = [
  { word: 'Merhaba', translation: 'Салом', emoji: '👋', order: 0,
    example: 'Merhaba, nasılsın?', exampleTrans: 'Салом, аҳволат чӣ тавр?',
    options: ['Салом', 'Хайр', 'Бале', 'Ташаккур'] },
  { word: 'Teşekkürler', translation: 'Ташаккур', emoji: '🙏', order: 1,
    example: 'Çok teşekkürler!', exampleTrans: 'Бисёр ташаккур!',
    options: ['Ташаккур', 'Салом', 'Бале', 'Не'] },
  { word: 'Evet', translation: 'Бале', emoji: '✅', order: 2,
    example: 'Evet, anlıyorum.', exampleTrans: 'Бале, ман мефаҳмам.',
    options: ['Бале', 'Не', 'Шояд', 'Хайр'] },
  { word: 'Harika', translation: 'Аъло', emoji: '🏆', order: 3,
    example: 'Sen harikasın!', exampleTrans: 'Ту аъло ҳастӣ!',
    options: ['Аъло', 'Бадтарин', 'Хурд', 'Калон'] },
];

const have = await q(`SELECT id, word, "order" FROM "OnboardingWord" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [TR, TG]);
const byWord = new Map(have.map(h => [h.word, h]));
console.log(`дар база: ${have.length} калима (${have.map(h => h.word).join(', ')})`);
for (const w of WORDS) {
  const { ipa, tajik } = transcribe(w.word);
  console.log(`  ${byWord.has(w.word) ? 'навсозӣ' : 'НАВ    '} ${w.word.padEnd(12)} ${ipa.padEnd(18)} ${tajik.padEnd(16)} «${w.example}»`);
}
if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(0); }

for (const w of WORDS) {
  const { ipa, tajik } = transcribe(w.word);
  const cur = byWord.get(w.word);
  if (cur) {
    await q(
      `UPDATE "OnboardingWord" SET translation=$1, transcription=$2, "transcriptionTajik"=$3,
         emoji=$4, example=$5, "exampleTrans"=$6, options=$7::jsonb, "order"=$8 WHERE id=$9`,
      [w.translation, ipa, tajik, w.emoji, w.example, w.exampleTrans, JSON.stringify(w.options), w.order, cur.id]);
  } else {
    await q(
      `INSERT INTO "OnboardingWord" (id, "targetLanguageId", "nativeLanguageId", word, translation,
         transcription, "transcriptionTajik", emoji, example, "exampleTrans", options, "order", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, NOW())`,
      [TR, TG, w.word, w.translation, ipa, tajik, w.emoji, w.example, w.exampleTrans, JSON.stringify(w.options), w.order]);
  }
}
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
const after = await q(`SELECT word, "order" FROM "OnboardingWord" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 ORDER BY "order"`, [TR, TG]);
console.log(`✓ ${after.length} калима: ${after.map(a => a.word).join(', ')}`);
console.log('  ⚠ калимаи нав ҳанӯз садо надорад → node prisma/_tr-audio.mjs --gen --push --apply');
