// Даромадгоҳи курси арабӣ: дарси шиносоӣ + сатҳсанҷӣ — маҳз тавре ки хонанда
// онҳоро мебинад (аз API-и мобилӣ, на аз база).
//
//   node prisma/_ar-entry-check.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);

const BASE = 'https://admin.ramz.tj';
const AR = 'cmqdqfuxi00001rcsseeq42fi';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const P = [];
const bad = (a, m) => P.push(`[${a}] ${m}`);
const HAR = /[ً-ْٰ]/;

// Дарозии клип + вақти ҷавоби шабака (таъхир маҳз ҳамин ду чиз аст).
function mp3Duration(b) {
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let i = 0, d = 0, g = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4 && g++ < 400000) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, layer = (b[i + 1] >> 1) & 3, t = SR[ver];
      if (layer === 1 && t) {
        const br = (ver === 3 ? BR1 : BR2)[(b[i + 2] >> 4) & 15], sr = t[(b[i + 2] >> 2) & 3], pad = (b[i + 2] >> 1) & 1;
        if (br && sr) { const spf = ver === 3 ? 1152 : 576; d += spf / sr; i += Math.floor(spf / 8 * 1000 * br / sr) + pad; continue; }
      }
    }
    i++;
  }
  return d;
}
async function fetchClip(url) {
  const t0 = Date.now();
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  return { ok: r.ok, ms: Date.now() - t0, sec: mp3Duration(buf), kb: buf.length / 1024 };
}

// ── 1. Дарси шиносоӣ ────────────────────────────────────────────────────────
console.log('═'.repeat(70) + '\n1. ДАРСИ ШИНОСОӢ (аввалин чизе, ки хонанда мебинад)\n' + '═'.repeat(70));
const ob = await q(`SELECT * FROM "OnboardingWord" WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
for (const w of ob) {
  const clip = w.audioUrl ? await fetchClip(w.audioUrl) : null;
  console.log(`\n  ${w.emoji} ${w.word}  «${w.translation}»`);
  console.log(`     хониш: ${w.transcriptionTajik}   IPA: ${w.transcription}`);
  console.log(`     мисол: ${w.example} — ${w.exampleTrans}`);
  console.log(`     вариантҳо: ${(w.options ?? []).join(' | ')}`);
  console.log(`     аудио: ${clip ? `${clip.sec.toFixed(2)}с · ${clip.kb.toFixed(0)}KB · ${clip.ms}ms` : 'НЕСТ'}`);
  if (!HAR.test(w.word)) bad('шиносоӣ', `«${w.word}» ҳаракат надорад — аввалин калимаи курс бе садоноки кӯтоҳ`);
  if (w.example && !HAR.test(w.example)) bad('шиносоӣ', `мисоли «${w.word}» ҳаракат надорад`);
  if (!clip?.ok) bad('шиносоӣ', `«${w.word}» аудио дастнорас`);
  if (clip && clip.sec > 2.5) bad('шиносоӣ', `«${w.word}» клип ${clip.sec.toFixed(2)}с — дароз`);
  const opts = w.options ?? [];
  if (opts.length !== 4) bad('шиносоӣ', `«${w.word}»: ${opts.length} вариант`);
  if (!opts.includes(w.translation)) bad('шиносоӣ', `«${w.word}»: ҷавоб дар вариантҳо нест`);
  if (new Set(opts).size !== opts.length) bad('шиносоӣ', `«${w.word}»: варианти такрорӣ`);
}
// Ҷойи ҷавоб дар вариантҳо — ин ҷо ҳам набояд ҳамеша якум бошад.
const pos = ob.map(w => (w.options ?? []).indexOf(w.translation));
console.log(`\n  ҷойи ҷавоби дуруст: ${pos.join(', ')}`);
if (pos.length > 2 && new Set(pos).size === 1) bad('шиносоӣ', `ҷавоб дар ҳама саволҳо дар ҷойи ${pos[0] + 1}`);

// ── 2. Сатҳсанҷӣ ────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70) + '\n2. САТҲСАНҶӢ (аз API — маҳз он чи барнома мегирад)\n' + '═'.repeat(70));
const mob = await (await fetch(`${BASE}/api/mobile/placement?targetLanguageId=${AR}&nativeLanguageId=${TG}`)).json();
const qs = mob.questions ?? [];
console.log(`саволҳо: ${qs.length}`);
const db = await q(`SELECT * FROM "PlacementQuestion" WHERE "targetLanguageId"='${AR}' AND "nativeLanguageId"='${TG}' AND "isActive" ORDER BY "cefrLevel", "order"`);
const byId = new Map(db.map(x => [x.id, x]));
const posn = {};
for (const x of qs) {
  const src = byId.get(x.id);
  const opts = (x.options ?? []).map(String);
  const ans = src?.answer;
  const i = opts.indexOf(ans);
  posn[i] = (posn[i] ?? 0) + 1;
  console.log(`\n  [${x.cefrLevel}/${src?.skill}] ${x.prompt}`);
  console.log(`     тарҷума: ${x.promptTranslated ?? '—'}`);
  console.log(`     ${opts.map((o, k) => (k === i ? '✅ ' : '   ') + o).join('   ')}`);
  console.log(`     тавзеҳ: ${src?.explanation ?? '—'}`);
  if (i < 0) bad('сатҳсанҷӣ', `«${x.prompt}»: ҷавоб дар вариантҳо нест`);
  if (!x.promptTranslated) bad('сатҳсанҷӣ', `«${x.prompt}»: тарҷумаи тоҷикӣ нест`);
  if (x.answer !== undefined) bad('сатҳсанҷӣ', 'ҷавоби дуруст ба муштарӣ мефарояд');
  if (new Set(opts).size !== opts.length) bad('сатҳсанҷӣ', `«${x.prompt}»: варианти такрорӣ`);
  // Саволи A1 набояд аз калимаи берун аз курс бошад.
}
console.log(`\n  ҷойи ҷавоб: ${JSON.stringify(posn)}`);
const levels = qs.reduce((a, x) => ((a[x.cefrLevel] = (a[x.cefrLevel] ?? 0) + 1), a), {});
console.log(`  сатҳҳо: ${JSON.stringify(levels)}`);

// ── Ҷамъбаст ────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70));
if (!P.length) console.log('✓ даромадгоҳ тоза аст.');
else { console.log(`${P.length} мушкил:`); for (const p of P) console.log(`  • ${p}`); }
