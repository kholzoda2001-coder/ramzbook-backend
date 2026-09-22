// Қоидаҳои талаффузи туркӣ дар услуби АЙНАН олмонӣ: сарлавҳа «Ҳарфи X — N ҳолат»,
// ҳар ҳолат ЯК сатр: `шароит → «садо»:  калима (хониш), калима (хониш)`.
//
// Пештар туркӣ ҳамагӣ 7 қоидаи параграфӣ дошт (олмонӣ 29 сатрӣ). Параграфи
// дароз дар экрани хурд хонда намешавад ва хонанда онро мепартояд.
//
// Хониши ҳар мисол аз `_tr-tajik.mjs` ҳисоб мешавад — на дастӣ навишта, пас
// қоида ва корти калима ҳеҷ гоҳ ба ҳам зид намешаванд.
//
//   node prisma/_tr-alphabet-rules-v2.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { transcribe, selfTest } from './_tr-tajik.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const TR = 'cmqdgus870000c7nfz5z16xbx';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const APPLY = process.argv.includes('--apply');

console.log(`✓ транслитератор: ${selfTest()} худсанҷиш`);

/** «Kitap Ev» → «Kitap (кита́п), Ev (эвэ́)» — хониш ҳамеша ҳисоб мешавад. */
const w = (...words) => words.map(x => `${x} (${transcribe(x).tajik})`).join(', ');

const RULES = [
  // ── general ──────────────────────────────────────────────────────────────
  ['general', 'Туркӣ чӣ тавр навишта шавад, ҳамон тавр хонда мешавад', [
    'Ҳар ҳарф ЯК садо дорад ва он ҳеҷ гоҳ тағйир намеёбад.',
    'Ҳарфи хомӯш нест — ҳар ҳарфро мехонед.',
    'Ду ҳарф якҷоя як садои нав намедиҳанд (мисли англисии «sh» ё олмонии «sch»).',
    `Мисол: ${w('Kitap', 'Masa', 'Pencere')}`,
  ]],
  ['general', 'Зада (урғу) қариб ҳамеша дар ҲИҶОИ ОХИР аст', [
    `${w('Merhaba', 'Öğretmen', 'Arkadaş')}`,
    'Истисно: номи ҷойҳо ва баъзе калимаҳои хориҷӣ — İstanbul, lokanta.',
    'Дар хониши тоҷикӣ зада бо аломати ́ нишон дода шудааст.',
  ]],
  ['general', 'Алифбо 29 ҳарф дорад — 8 садонок ва 21 ҳамсадо', [
    'Дар туркӣ ҳарфҳои Q, W, X НЕСТАНД.',
    'Вале чор ҳарфи нав ҳаст: Ç, Ğ, Ş, ва ду ҷуфти I/İ ва O/Ö, U/Ü.',
  ]],
  ['general', 'Ҳамоҳангии садонокҳо — қоидае, ки ҳама чизро идора мекунад', [
    'Садонокҳои ҒАФС: a, ı, o, u — баъди онҳо бандак ҳам ғафс мешавад (-lar, -da, -dan).',
    'Садонокҳои ТУНУК: e, i, ö, ü — баъди онҳо бандак тунук мешавад (-ler, -de, -den).',
    `Мисол: ${w('Kitaplar')} вале ${w('Evler')}`,
  ]],
  ['general', 'Дар туркӣ ҷинси грамматикӣ ва артикл НЕСТ', [
    '«O» ҳам «ӯ» (мард), ҳам «вай» (зан), ҳам «он» (ашё) аст.',
    'Ҳеҷ як «der/die/das» ё «a/the» вуҷуд надорад — калима худ ба худ меистад.',
  ]],

  // ── vowel ────────────────────────────────────────────────────────────────
  ['vowel', 'Ҳарфи I ва İ — ду ҳарфи ГУНОГУН', [
    'İ (нуқтадор) → «и», айнан мисли тоҷикӣ:  ' + w('İyi', 'Kim', 'Bir'),
    'I (бе нуқта) → «ы», садои ғафс — дар тоҷикӣ нест, вале дар русӣ ҳаст:  ' + w('Kız', 'Hayır', 'Kadın'),
    'Дар шакли хурд: İ → i (бо нуқта), I → ı (БЕ нуқта).',
    'Ин ду ҳарфро омехта кардан маънои калимаро дигар мекунад.',
  ]],
  ['vowel', 'Ҳарфи Ö — садои нави аввал', [
    'Ö → «ё» (лаб ҳалқа, забон дар ҷои «э»):  ' + w('Göz', 'Öğretmen', 'Dört'),
    'Дар тоҷикӣ ин садо нест — лабро мисли «о» ҳалқа кунед, вале «э» гӯед.',
  ]],
  ['vowel', 'Ҳарфи Ü — садои нави дуюм', [
    'Ü → «ю» (лаб ҳалқа, забон дар ҷои «и»):  ' + w('Üç', 'Güzel', 'Süt'),
    'Ü ва U ду садои ҷудоганд: ' + w('Su') + ' вале ' + w('Süt'),
  ]],
  ['vowel', 'E ҳамеша «э» аст, на «е»', [
    'E → «э»:  ' + w('Ev', 'Evet', 'Gece'),
    'Ҳеҷ гоҳ «йэ» хонда намешавад — «й» танҳо вақте ҳаст, ки худи ҳарфи Y бошад.',
  ]],
  ['vowel', 'Ҳашт садонок — ҷадвали пурра', [
    'Ғафс: a → «а», ı → «ы», o → «о», u → «у»',
    'Тунук: e → «э», i → «и», ö → «ё», ü → «ю»',
    `Мисол: ${w('Araba', 'Kız', 'Okul', 'Su')}`,
  ]],

  // ── consonant ────────────────────────────────────────────────────────────
  ['consonant', 'Ҳарфи C — ҳамеша «ҷ»', [
    'C → «ҷ»:  ' + w('Cuma', 'Cadde', 'Gece'),
    'Ҳеҷ гоҳ «к» ё «с» хонда намешавад — ин доми асосии онҳоест, ки англисӣ медонанд.',
  ]],
  ['consonant', 'Ҳарфи Ç — «ч»', [
    'Ç → «ч»:  ' + w('Çay', 'Çocuk', 'Üç'),
    'C ва Ç танҳо бо як думча фарқ мекунанд, вале садояшон тамоман дигар аст.',
  ]],
  ['consonant', 'Ҳарфи Ş — «ш»', [
    'Ş → «ш»:  ' + w('Şehir', 'Şeker', 'Beş'),
    'Дар туркӣ «sh» вуҷуд надорад — ҳамеша як ҳарфи Ş.',
  ]],
  ['consonant', 'Ҳарфи Ğ — садо надорад', [
    'Ğ ҳеҷ гоҳ дар АВВАЛи калима намеояд.',
    'Баъди садонок → садоноки пешинаро ДАРОЗ мекунад:  ' + w('Dağ', 'Sağ', 'Yağmur'),
    'Байни ду садоноки тунук → «й»-и сабук:  ' + w('Değil', 'Eğitim'),
    'Дар хониши тоҷикӣ дарозӣ бо аломати «:» нишон дода мешавад.',
  ]],
  ['consonant', 'Ҳарфи J — «ж»', [
    'J → «ж»:  ' + w('Jile', 'Plaj'),
    'Танҳо дар калимаҳои хориҷӣ вомехӯрад — калимаҳои аслии туркӣ J надоранд.',
  ]],
  ['consonant', 'Ҳарфи Y — ҳамеша «й», ҳеҷ гоҳ садонок нест', [
    'Y → «й»:  ' + w('Yol', 'Ayak', 'Yemek'),
    'Дар англисӣ «y» баъзан садонок аст (my, happy) — дар туркӣ ҳеҷ гоҳ.',
  ]],
  ['consonant', 'Ҳарфи V — «в», на «ф»', [
    'V → «в»:  ' + w('Ev', 'Var', 'Vermek'),
    'Дар охири калима ҳам «в» мемонад — ' + w('Ev') + ', на «эф».',
  ]],
  ['consonant', 'Ҳарфи H — ҳамеша талаффуз мешавад', [
    'H → «ҳ»:  ' + w('Hafta', 'Merhaba', 'Kahve'),
    'Дар туркӣ H хомӯш намешавад — фарқ аз фаронсавӣ ва англисӣ.',
  ]],
  ['consonant', 'Ҳарфи R — сабук, дар охир қариб пичиррос', [
    'R → «р»:  ' + w('Renk', 'Kırmızı', 'Bir'),
    'Дар охири калима R сабук мешавад, вале ҳеҷ гоҳ тамоман намеафтад.',
  ]],
  ['consonant', 'Ҳарфи K ва G пеш аз садоноки тунук нарм мешаванд', [
    'Пеш аз e, i, ö, ü → нарм:  ' + w('Kim', 'Güzel', 'Gitmek'),
    'Пеш аз a, ı, o, u → сахт:  ' + w('Kadın', 'Okul', 'Gün'),
    'Дар хониши тоҷикӣ ҳарду «к» ва «г» навишта мешаванд — фарқ ночиз аст.',
  ]],
  ['consonant', 'Ҳамсадои сахт бандакро тағйир медиҳад', [
    'Агар калима бо p, ç, t, k, s, ş, h, f тамом шавад, «d»-и бандак ба «t» мегузарад.',
    `Мисол: ${w('Kitap')} → kitap**ta** (дар китоб), kitap**tan** (аз китоб)`,
    `Вале: ${w('Ev')} → ev**de**, ev**den**`,
  ]],
  ['consonant', 'Дар туркӣ Q, W, X НЕСТАНД', [
    'Ба ҷои Q → K:  ' + w('Kalem'),
    'Ба ҷои W → V:  ' + w('Vagon'),
    'Ба ҷои X → KS:  ' + w('Taksi'),
  ]],
];

const rows = RULES.map(([category, title, lines], i) => ({
  category, title, body: lines.join('\n'), order: i,
}));

const have = await q(`SELECT id, category, title FROM "AlphabetRule" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [TR, TG]);
console.log(`дар база: ${have.length} қоида · нав: ${rows.length}`);
const byCat = {};
rows.forEach(r => { byCat[r.category] = (byCat[r.category] ?? 0) + 1; });
console.log('тақсим:', JSON.stringify(byCat));
const tooLong = rows.flatMap(r => r.body.split('\n').filter(l => l.length > 130).map(l => `${r.title}: ${l.slice(0, 60)}…`));
if (tooLong.length) { console.error('⛔ сатри аз 130 аломат дарозтар:'); tooLong.forEach(t => console.error('  ' + t)); process.exit(1); }
console.log('\nнамуна:');
rows.slice(5, 7).forEach(r => console.log(`  [${r.category}] ${r.title}\n${r.body.split('\n').map(l => '      ' + l).join('\n')}`));

if (!APPLY) { console.log('\n(нақша) --apply — қоидаҳои кӯҳна иваз мешаванд'); process.exit(0); }

await q(`DELETE FROM "AlphabetRule" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [TR, TG]);
for (const r of rows) {
  await q(
    `INSERT INTO "AlphabetRule" (id, "targetLanguageId", "nativeLanguageId", category, title, body, "order", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW())`,
    [TR, TG, r.category, r.title, r.body, r.order]);
}
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${rows.length} қоида навишта шуд`);
