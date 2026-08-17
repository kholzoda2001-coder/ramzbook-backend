// `Word.partOfSpeech` барои ҳамаи калимаҳои олмонӣ.
//
// ЧАРО ин муҳим аст: барнома расми калимаро танҳо вақте нишон медиҳад, ки
// `partOfSpeech == 'noun'` бошад (`unit_lesson_screen.dart` → `_isPicturable`,
// `_showIntroPhoto`). Ҳамаи 193 калимаи олмонӣ ин майдонро холӣ доштанд, яъне
// ҳатто агар расм дар CDN мебуд, ҳеҷ гоҳ намоён намешуд. Англисӣ онро пурра
// дорад (477 исм) — маҳз барои ҳамин дар англисӣ расм кор мекунад.
//
// Таснифот аз рӯи худи олмонӣ, на аз рӯи забони дигар:
//   • артикли der/die/das → ИСМ (қоидаи мутлақи олмонӣ)
//   • ҳарфи калон дар аввал → ИСМ (дар олмонӣ ҳамаи исмҳо бо ҳарфи калон)
//   • -en/-eln/-ern дар охири калимаи хурдҳарф → ФЕЪЛ
//   • боқӣ аз рӯйхатҳои ошкоро
//
//   node prisma/_de-pos.mjs [--dry]
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = 'https://admin.ramz.tj';
const COURSE = 'cmqdhwb5q00021z597df2767m';
const DRY = process.argv.includes('--dry');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// Калимаҳое ки қоида онҳоро нодуруст тасниф мекунад.
const OVERRIDE = {
  // Ибораҳо — як калима нестанд, пас на исм ва на феъл.
  'Auf Wiedersehen': 'phrase', 'Guten Morgen': 'phrase', 'Guten Tag': 'phrase',
  'Guten Abend': 'phrase', 'Gute Nacht': 'phrase', 'Gut, danke': 'phrase',
  'Wie geht es Ihnen': 'phrase', 'Wie geht es dir': 'phrase', 'Kein Problem': 'phrase',
  'Ich lerne Deutsch': 'phrase', 'Ich verstehe nicht': 'phrase', 'Ich weiß nicht': 'phrase',
  'Können Sie helfen': 'phrase', 'Viel Glück': 'phrase', 'Wie viel': 'phrase',
  'Wie viel kostet das': 'phrase', 'Gern geschehen': 'phrase', 'Alles klar': 'phrase',
  'ich bin': 'phrase', 'Freut mich': 'phrase', 'Wie heißt du': 'phrase',
  'Wie heißen Sie': 'phrase', 'Ich heiße': 'phrase', 'Wer ist das': 'phrase',
  'Sehr gut': 'phrase', 'Natürlich': 'adverb', 'Okay': 'interjection',
  // Нидоҳо ва ҷавобҳо
  'Hallo': 'interjection', 'Tschüss': 'interjection', 'Willkommen': 'interjection',
  'Danke': 'interjection', 'Bitte': 'interjection', 'Entschuldigung': 'interjection',
  'Ja': 'interjection', 'Nein': 'interjection',
  // Ҷонишинҳо
  ich: 'pronoun', du: 'pronoun', er: 'pronoun', sie: 'pronoun', es: 'pronoun',
  wir: 'pronoun', ihr: 'pronoun', Sie: 'pronoun', mein: 'pronoun', dein: 'pronoun',
  // Калимаҳои саволӣ
  Wie: 'pronoun', Was: 'pronoun', Wer: 'pronoun', Wo: 'pronoun', Wann: 'pronoun',
  Warum: 'pronoun', Welche: 'pronoun',
  // Феъли номунтазам ва ёридиҳанда
  ist: 'verb',
  // Зарфҳо
  heute: 'adverb', morgen: 'adverb', gestern: 'adverb', jetzt: 'adverb',
  oben: 'adverb', unten: 'adverb', links: 'adverb', rechts: 'adverb',
  geradeaus: 'adverb', 'gegenüber': 'adverb', nah: 'adverb', weit: 'adverb',
  // «-en» дар охир, вале феъл нест — қоидаи умумӣ инро феъл мешуморад.
  zusammen: 'adverb',
  // Моҳҳо ва рӯзҳо исманд, вале расм намегиранд — ҳамчун исм мемонанд,
  // рӯйхати расм онҳоро худаш намегирад (prompt барояшон навишта намешавад).
};

// Сифатҳо (шакли луғавӣ, бе бандак).
const ADJ = new Set([
  'alt', 'neu', 'gut', 'schlecht', 'groß', 'klein', 'kurz', 'lang', 'warm',
  'billig', 'teuer', 'schön', 'rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß',
  'braun', 'rosa', 'lila', 'orange', 'grau', 'verheiratet', 'ledig', 'jung',
]);

// Шумора.
const NUM = new Set([
  'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
  'zehn', 'elf', 'zwölf', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig',
  'siebzig', 'achtzig', 'hundert',
]);

function classify(word) {
  const w = word.trim();
  if (OVERRIDE[w]) return OVERRIDE[w];
  if (ADJ.has(w.toLowerCase())) return 'adjective';
  if (NUM.has(w.toLowerCase())) return 'numeral';
  // Қоидаи мутлақи олмонӣ: артикл → исм.
  if (/^(der|die|das)\s+/i.test(w)) return 'noun';
  // Калимаи якка бо ҳарфи калон → исм (дар олмонӣ ҳамаи исмҳо чунинанд).
  if (!w.includes(' ') && /^[A-ZÄÖÜ]/.test(w)) return 'noun';
  // Феъл: шакли масдар.
  if (!w.includes(' ') && /^[a-zäöüß].*(en|eln|ern|n)$/.test(w)) return 'verb';
  if (w.includes(' ')) return 'phrase';
  return 'other';
}

const words = await sql.query(
  `SELECT w.id, w.word, w."partOfSpeech", w.emoji, l.title AS lesson, m."order" AS mod
   FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order", w."order"`);

const byPos = {};
const plan = [];
for (const w of words) {
  const pos = classify(w.word);
  byPos[pos] = (byPos[pos] ?? 0) + 1;
  if (w.partOfSpeech !== pos) plan.push({ ...w, pos });
}
console.log('Таснифот:', Object.entries(byPos).map(([k, v]) => `${k}=${v}`).join('  '));
console.log(`Тағйир лозим: ${plan.length}/${words.length}`);

// Чизе ки «other» шуд — қоида онро нафаҳмид, бояд дастӣ дида шавад.
const unknown = words.filter(w => classify(w.word) === 'other');
if (unknown.length) console.log('\n⚠ номаълум:', unknown.map(w => w.word).join(', '));

console.log('\nНамунаи исмҳо (расм танҳо ба инҳо меояд):');
console.log('  ' + words.filter(w => classify(w.word) === 'noun').slice(0, 14).map(w => w.word).join(' · '));
console.log('\nНамунаи феълҳо:');
console.log('  ' + words.filter(w => classify(w.word) === 'verb').map(w => w.word).join(' · '));

if (!DRY) {
  let ok = 0;
  for (const p of plan) {
    const res = await fetch(`${BASE}/api/admin/words/${p.id}`, {
      method: 'PUT', headers: H, body: JSON.stringify({ partOfSpeech: p.pos }),
    });
    if (res.ok) ok++; else console.log(`  ✗ ${p.word}: ${(await res.text()).slice(0, 90)}`);
  }
  console.log(`\nСабт шуд: ${ok}/${plan.length}`);
}
