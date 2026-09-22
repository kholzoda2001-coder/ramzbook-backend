// `Word.partOfSpeech` барои ҳамаи калимаҳои туркӣ.
//
// ЧАРО муҳим: барнома расми калимаро ТАНҲО вақте нишон медиҳад, ки
// `partOfSpeech == 'noun'` бошад (`unit_lesson_screen.dart` → `_isPicturable`).
// Ҳамаи 527 калимаи туркӣ ин майдонро холӣ доштанд → ҳатто агар акс мебуд,
// ҳеҷ гоҳ намоён намешуд.
//
// Ду қабат:
//  1. Қоидаи туркӣ — феъл ҳамеша бо -mak/-mek тамом мешавад, ибора фосила
//     дорад, шумора ва ҷонишин рӯйхати пӯшида доранд.
//  2. Он чи қоида надонист — аз рӯи ТАРҶУМАИ ТОҶИКӢ бо курсҳои en/ru/de
//     муқоиса мешавад: агар «Себ» дар англисӣ `noun` бошад, туркии «Elma» ҳам
//     ҳамон аст. Ҳамин усул барои расм ҳам кор мекунад.
//
//   node prisma/_tr-pos.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const APPLY = process.argv.includes('--apply');

const low = (s) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

const NUM = new Set(['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on',
  'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan', 'yüz', 'bin',
  'sıfır', 'on bir', 'on iki', 'birinci', 'ikinci', 'üçüncü']);
const PRON = new Set(['ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'benim', 'senin', 'onun',
  'bizim', 'sizin', 'onların', 'bu', 'şu', 'kim', 'ne', 'nerede', 'nereye', 'nereden',
  'kaç', 'hangi', 'niçin', 'neden', 'nasıl', 'ne zaman', 'beni', 'seni', 'onu']);
const ADJ = new Set(['büyük', 'küçük', 'uzun', 'kısa', 'yeni', 'eski', 'güzel', 'çirkin',
  'iyi', 'kötü', 'sıcak', 'soğuk', 'ılık', 'temiz', 'kirli', 'ucuz', 'pahalı', 'kolay',
  'zor', 'hızlı', 'yavaş', 'genç', 'yaşlı', 'mutlu', 'üzgün', 'yorgun', 'hasta', 'sağlıklı',
  'aç', 'tok', 'dolu', 'boş', 'açık', 'kapalı', 'kırmızı', 'mavi', 'yeşil', 'sarı',
  'siyah', 'beyaz', 'kahverengi', 'turuncu', 'mor', 'pembe', 'gri', 'lezzetli', 'rahat',
  'ağır', 'hafif', 'zengin', 'fakir', 'doğru', 'yanlış', 'serin', 'yumuşak', 'sert']);
const ADV = new Set(['şimdi', 'sonra', 'önce', 'bugün', 'yarın', 'dün', 'her zaman', 'bazen',
  'asla', 'hiç', 'sık sık', 'nadiren', 'çok', 'az', 'biraz', 'erken', 'geç', 'birlikte',
  'yine', 'hemen', 'yakında', 'hep', 'daha', 'en']);
const INTERJ = new Set(['merhaba', 'evet', 'hayır', 'lütfen', 'tamam', 'tabii', 'afiyet olsun',
  'afedersiniz', 'özür dilerim', 'hoşça kal', 'güle güle', 'selam']);

// Доми туркӣ: -mak/-mek ҳамеша феъл НЕСТ. «ekmek» нон аст, «yemek» хӯрок.
// Барои инҳо қоидаи феъл гузаронида намешавад ва тарҷума ҳал мекунад.
const NOT_VERB = new Set(['ekmek', 'yemek', 'kaymak', 'çakmak', 'ilmek', 'demek']);

function byRule(word) {
  const w = low(word).trim();
  if (INTERJ.has(w)) return 'interjection';
  if (NUM.has(w)) return 'numeral';
  if (PRON.has(w)) return 'pronoun';
  if (ADJ.has(w)) return 'adjective';
  if (ADV.has(w)) return 'adverb';
  // Шакли луғавии феъл дар туркӣ ҳамеша -mak/-mek аст — ғайр аз истиснои боло.
  if (/(mak|mek)$/.test(w) && !w.includes(' ') && !NOT_VERB.has(w)) return 'verb';
  // Ибора: якчанд калима ё аломати савол/қавс.
  if (/\s/.test(w) || /[()?/]/.test(word)) return 'phrase';
  return null;
}

// ── Қабати 2: аз рӯи тарҷумаи тоҷикӣ ────────────────────────────────────────
const trKey = (t) => String(t).toLowerCase().replace(/\(.*?\)/g, '').split('/')[0]
  .replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();
const others = await q(
  `SELECT DISTINCT w.translation, w."partOfSpeech" pos FROM "Word" w
   JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   JOIN "Course" c ON m."courseId"=c.id JOIN "Language" lg ON c."targetLanguageId"=lg.id
   WHERE lg.code IN ('en','ru','de') AND w."partOfSpeech" IS NOT NULL AND w."partOfSpeech" <> ''`);
const posByTr = new Map();
for (const o of others) {
  const k = trKey(o.translation);
  if (!posByTr.has(k)) posByTr.set(k, o.pos);
}
console.log(`манбаи муқоиса: ${posByTr.size} тарҷумаи ягона аз en/ru/de`);

const words = await q(
  `SELECT w.id, w.word, w.translation, w."partOfSpeech" pos FROM "Word" w
   JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"=$1`, [COURSE]);

const plan = [];
const stat = {};
for (const w of words) {
  // Шакли ТАСРИФШУДАИ феъл (Aldım, Gideceğim) на -mak дорад, на дар рӯйхат аст —
  // вале тарҷумаи тоҷикиаш ҳамеша бо «Ман …» ё «Хоҳад …» сар мешавад.
  const conjugated = /^(Ман |Ту |Ӯ |Мо |Шумо |Онҳо |Хоҳад )/.test(w.translation);
  const pos = byRule(w.word) ?? (conjugated ? 'verb' : null)
    ?? posByTr.get(trKey(w.translation)) ?? 'noun';
  stat[pos] = (stat[pos] ?? 0) + 1;
  if (w.pos !== pos) plan.push({ id: w.id, word: w.word, tr: w.translation, pos });
}
console.log('таснифот: ' + Object.entries(stat).map(([k, v]) => `${k}=${v}`).join(' · '));
console.log(`тағйир лозим: ${plan.length}/${words.length}`);
console.log('\nнамунаи исмҳо (расм танҳо ба инҳо меояд):');
console.log('  ' + plan.filter(p => p.pos === 'noun').slice(0, 16).map(p => p.word).join(' · '));
console.log('намунаи феълҳо:');
console.log('  ' + plan.filter(p => p.pos === 'verb').slice(0, 16).map(p => p.word).join(' · '));

if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(0); }

for (let i = 0; i < plan.length; i += 100) {
  const chunk = plan.slice(i, i + 100);
  const values = chunk.map((_, k) => `($${k * 2 + 1}, $${k * 2 + 2})`).join(',');
  await q(`UPDATE "Word" t SET "partOfSpeech" = v.p FROM (VALUES ${values}) AS v(id, p) WHERE t.id = v.id`,
    chunk.flatMap(p => [p.id, p.pos]));
}
await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${plan.length} калима таснифот гирифт`);
