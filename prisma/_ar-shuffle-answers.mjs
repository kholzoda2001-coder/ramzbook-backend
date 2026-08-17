// Ҷойи ҷавоби дурустро дар машқҳои АРАБӢ мепарокандад.
//
// Чаро: се экран — грамматика, матни хониш ва сатҳсанҷӣ — вариантҳоро
// НАМЕОМЕХТАНД, пас тартиби база маҳз ҳамонест, ки хонанда мебинад. Дар курси
// арабӣ 75% ҷавобҳо варианти ЯКУМ буданд (дар англисӣ/русӣ ~30%), ва ҳар 30
// машқи `reorder` пораҳояшро аллакай ба тартиби ҷумла мечиданд — яъне бе
// фикр кардан ҳам пай дар пай пахш карда гузаштан мумкин буд.
//
// Омехтан ДЕТЕРМИНИСТӢ аст (тухмӣ = id-и худи машқ): такрори скрипт натиҷаро
// дигар намекунад, пас бехатар аз нав иҷро мешавад.
//
//   node prisma/_ar-shuffle-answers.mjs --dry   // танҳо нишон медиҳад
//   node prisma/_ar-shuffle-answers.mjs         // менависад
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';
const AR = 'cmqdqfuxi00001rcsseeq42fi';

const gnorm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

// Тухмии устувор аз сатр (FNV-1a) + генератори mulberry32.
function rngFrom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Fisher–Yates бо тухмӣ; агар натиҷа айнан ҳамон тартиб барояд, як бор ҷобаҷо
// мекунем — вагарна «омехтан»-и бетаъсир мемонад.
function shuffled(arr, seed) {
  const r = rngFrom(seed), a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.length > 1 && a.every((x, i) => x === arr[i])) { [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]]; }
  return a;
}

// Ҷавобро ба ҷойи МУАЙЯН мегузорад ва боқиро бо тухмӣ мечинад. Омехтани
// соддаи тасодуфӣ тақсимоти баробар НАМЕДИҲАД (санҷиш: 47% ба ҷои сеюм афтод);
// ин ҷо ҷойҳо давр ба давр тақсим мешаванд, пас ҳар ҷой ҳиссаи баробар мегирад.
function placeAt(opts, correct, target, seed) {
  const rest = shuffled(opts.filter(o => o !== correct), seed);
  const out = [...rest];
  out.splice(Math.min(target, out.length), 0, correct);
  return out;
}
const pos = (arr, val) => arr.map(gnorm).indexOf(gnorm(val));
const tally = a => a.reduce((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {});
const show = (label, before, after) =>
  console.log(`${label.padEnd(22)} пеш ${JSON.stringify(tally(before))}  →  баъд ${JSON.stringify(tally(after))}`);

let writes = 0;

// ── 1. Машқҳои грамматика ───────────────────────────────────────────────────
{
  const rows = (await q(`SELECT e.id, e.type, e.answer, e.options FROM "GrammarExercise" e
    JOIN "GrammarTopic" t ON e."topicId"=t.id WHERE t."courseId"='${COURSE}'`)).sort((a, b) => a.id < b.id ? -1 : 1);
  const before = [], after = [];
  const turn = {};   // ҳисобкунаки давр барои ҳар шумораи вариант
  for (const e of rows) {
    const opts = Array.isArray(e.options) ? e.options.map(String) : null;
    if (!opts || opts.length < 2) continue;
    if (e.type === 'reorder') {
      // Пораҳо: ҷавоб матн аст, пас танҳо тартиби кафчаҳо иваз мешавад.
      const next = shuffled(opts, e.id);
      if (!DRY) await q(`UPDATE "GrammarExercise" SET options=$1::jsonb WHERE id=$2`, [JSON.stringify(next), e.id]);
      writes++;
      continue;
    }
    const i0 = pos(opts, e.answer);
    if (i0 < 0) { console.log(`  ⚠ ҷавоб дар вариантҳо нест, даст нарасонда шуд: ${e.id}`); continue; }
    const k = opts.length;
    const target = (turn[k] = ((turn[k] ?? 0) + 1)) % k;
    const next = placeAt(opts, opts[i0], target, e.id);
    before.push(i0); after.push(pos(next, e.answer));
    if (!DRY) await q(`UPDATE "GrammarExercise" SET options=$1::jsonb WHERE id=$2`, [JSON.stringify(next), e.id]);
    writes++;
  }
  show('грамматика', before, after);
  console.log(`  reorder: ${rows.filter(e => e.type === 'reorder' && Array.isArray(e.options) && e.options.length > 1).length} машқ пораҳояш омехта шуд`);
}

// ── 2. Саволҳои матни хониш ─────────────────────────────────────────────────
{
  const rows = (await q(`SELECT cq.id, cq.options, cq."correctIndex" FROM "ComprehensionQuestion" cq
    JOIN "ComprehensionExercise" c ON cq."exerciseId"=c.id WHERE c."courseId"='${COURSE}'`)).sort((a, b) => a.id < b.id ? -1 : 1);
  const before = [], after = [];
  const turn = {};
  for (const x of rows) {
    const opts = Array.isArray(x.options) ? x.options.map(String) : null;
    if (!opts || opts.length < 2) continue;
    if (x.correctIndex < 0 || x.correctIndex >= opts.length) { console.log(`  ⚠ correctIndex берун аз ҳудуд: ${x.id}`); continue; }
    const correct = opts[x.correctIndex];
    const k = opts.length;
    const target = (turn[k] = ((turn[k] ?? 0) + 1)) % k;
    const next = placeAt(opts, correct, target, x.id);
    const idx = next.indexOf(correct);
    before.push(x.correctIndex); after.push(idx);
    if (!DRY) await q(`UPDATE "ComprehensionQuestion" SET options=$1::jsonb, "correctIndex"=$2 WHERE id=$3`, [JSON.stringify(next), idx, x.id]);
    writes++;
  }
  show('матни хониш', before, after);
}

// ── 3. Сатҳсанҷӣ ────────────────────────────────────────────────────────────
{
  const rows = (await q(`SELECT id, answer, options FROM "PlacementQuestion" WHERE "targetLanguageId"='${AR}'`)).sort((a, b) => a.id < b.id ? -1 : 1);
  const before = [], after = [];
  const turn = {};
  for (const x of rows) {
    const opts = Array.isArray(x.options) ? x.options.map(String) : null;
    if (!opts || opts.length < 2) continue;
    const i0 = pos(opts, x.answer);
    if (i0 < 0) { console.log(`  ⚠ ҷавоб дар вариантҳо нест: ${x.id}`); continue; }
    const k = opts.length;
    const target = (turn[k] = ((turn[k] ?? 0) + 1)) % k;
    const next = placeAt(opts, opts[i0], target, x.id);
    before.push(i0); after.push(pos(next, x.answer));
    if (!DRY) await q(`UPDATE "PlacementQuestion" SET options=$1::jsonb WHERE id=$2`, [JSON.stringify(next), x.id]);
    writes++;
  }
  show('сатҳсанҷӣ', before, after);
}

// ── Версияи мазмун ──────────────────────────────────────────────────────────
// Бе ин тағйир ба хонандагони кэшдор намерасад (ниг. [[ramz-german]]).
if (!DRY) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд.');
}
console.log(DRY ? `\n[--dry] ${writes} сабт тағйир МЕЁФТ.` : `\n${writes} сабт навишта шуд.`);
