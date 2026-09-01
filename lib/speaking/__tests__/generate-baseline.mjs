/**
 * M0b — снапшоти вазъи ҲОЗИРАи тавлиди машқҳо.
 *
 * ЧАРО ин скрипт мантиқро ТАКРОР НАМЕНАВИСАД:
 * baseline бояд рафтори коди ВОҚЕИРО сабт кунад. Агар ман сатрҳои
 * 146–265-ро аз нав менавиштам, як хатои чопӣ кифоя буд, ки baseline
 * ғалат шавад — ва M0 «сабз» шавад дар ҳоле ки рефакторинг рафторро
 * иваз кардааст. Бинобар ин сатрҳо аз худи файл МЕХАНИКӢ бароварда
 * мешаванд ва айнан иҷро мегарданд.
 *
 * Ягона тағйир — як аннотатсияи TypeScript дар сатри 153 (JS онро
 * намефаҳмад). Он ошкоро тасдиқ карда мешавад: агар шакли сатр иваз
 * шавад, скрипт МЕАФТАД, на ки хомӯшона натиҷаи нодуруст диҳад.
 *
 * Иҷро:  node lib/speaking/__tests__/generate-baseline.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');           // backend/
const OUT = path.join(HERE, '__snapshots__', 'baseline');
const ROUTE = path.join(ROOT, 'app/api/ai/speaking/lesson/route.ts');

// ── 1. Мантиқи ҶОРӢ аз route.ts бароварда мешавад ────────────────────────
const SRC_FROM = 146; // `const items = lesson.items.filter(`
const SRC_TO = 265;   // `}` -и ҳалқаи recall
const routeSrc = readFileSync(ROUTE, 'utf8');
const lines = routeSrc.split(/\r?\n/);

// Сатри 22 — ягона доимии берунӣ, ки минтақа истифода мебарад.
const l22 = lines[21];
if (!/^const MAX_SLOT_WORDS = 8;$/.test(l22.trim())) {
  throw new Error(`Сатри 22 иваз шудааст: «${l22}»`);
}

const region = lines.slice(SRC_FROM - 1, SRC_TO).join('\n');
const regionSha = createHash('sha256').update(region).digest('hex');

// Ҳудудҳо тасдиқ мешаванд — вагарна баровардан хомӯшона каҷ мешавад.
if (!lines[SRC_FROM - 1].includes('const items = lesson.items.filter(')) {
  throw new Error(`Сатри ${SRC_FROM} интизорнашуда: «${lines[SRC_FROM - 1]}»`);
}
if (lines[SRC_TO - 1].trim() !== '}') {
  throw new Error(`Сатри ${SRC_TO} интизорнашуда: «${lines[SRC_TO - 1]}»`);
}

// Ягона аннотатсияи TS. Мавҷудияташ ҲАТМӢ тасдиқ мешавад.
const TS_ANNOTATION = 'const exercises: Record<string, unknown>[] = ';
if (!region.includes(TS_ANNOTATION)) {
  throw new Error('Аннотатсияи интизоршудаи сатри 153 ёфт нашуд.');
}
const js = region.replace(TS_ANNOTATION, 'const exercises = ');

// Ба ғайр аз ҳамон як ҷо, ҳеҷ чиз тағйир наёфт.
if (js.replace('const exercises = ', TS_ANNOTATION) !== region) {
  throw new Error('Тағйири ғайричашмдошт ҳангоми стрип кардани TS.');
}

const MAX_SLOT_WORDS = 8;
const generate = new Function(
  'lesson',
  'doneIds',
  'MAX_SLOT_WORDS',
  `${js}\n; return exercises;`,
);
const runCurrent = (lesson, doneIds) => generate(lesson, doneIds, MAX_SLOT_WORDS);

// ── 2. Манбаъҳои мазмун ──────────────────────────────────────────────────
// Танҳо ин 9 майдон ба мантиқ мерасанд — айнан `select`-и route (79–93).
const pick = (i) => ({
  id: i.id,
  kind: i.kind,
  text: i.text,
  translation: i.translation,
  literal: i.literal ?? null,
  note: i.note ?? null,
  audioUrl: i.audioUrl ?? null,
  cue: i.cue ?? null,
  cueTranslation: i.cueTranslation ?? null,
});

function env() {
  return Object.fromEntries(
    readFileSync(path.join(ROOT, '.env'), 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
}

async function fromDb(sql, categoryTitle, lessonOrder) {
  const rows = await sql.query(
    `SELECT l.id AS "lessonId", l.title AS "lessonTitle", l."order" AS "lessonOrder",
            c.title AS "categoryTitle",
            i.id, i.kind, i.text, i.translation, i.literal, i.note,
            i."audioUrl", i.cue, i."cueTranslation", i."order"
       FROM "SpeakingItem" i
       JOIN "SpeakingLesson" l   ON l.id = i."lessonId"
       JOIN "SpeakingCategory" c ON c.id = l."categoryId"
      WHERE c.title = $1 AND l."order" = $2
      ORDER BY i."order" ASC`,
    [categoryTitle, lessonOrder],
  );
  if (rows.length === 0) throw new Error(`DB: "${categoryTitle}" дарси ${lessonOrder} ёфт нашуд`);
  return {
    source: 'db',
    categoryTitle: rows[0].categoryTitle,
    lessonId: rows[0].lessonId,
    lessonTitle: rows[0].lessonTitle,
    lessonOrder: rows[0].lessonOrder,
    items: rows.map(pick),
  };
}

function fromPack(slug, lessonOrder) {
  const pack = JSON.parse(
    readFileSync(path.join(ROOT, 'content/speaking', `${slug}.json`), 'utf8'),
  );
  const L = pack.lessons.find((l) => l.order === lessonOrder);
  if (!L) throw new Error(`Pack ${slug}: дарси ${lessonOrder} нест`);
  const items = [...L.items].sort((a, b) => a.order - b.order);
  return {
    source: `pack:${slug}.json`,
    categoryTitle: pack.category.title,
    // ID-ҳои СИНТЕТИКӢ: ин боб ҳанӯз ба база гузошта нашудааст.
    // Устувор ва хондашаванда — то baseline такроршаванда бошад.
    lessonId: `seed:${slug}:L${lessonOrder}`,
    lessonTitle: L.title ?? null,
    lessonOrder,
    items: items.map((i) => pick({ ...i, id: `seed:${slug}:L${lessonOrder}:I${i.order}` })),
  };
}

/**
 * Дарси СУНЪӢ — ягона роҳи пӯшонидани шохаи `lesson/route.ts:214–221`.
 *
 * Дар ҳамаи 37 дарси ҳамаи 7 баста ЯГОН ҷумлаи аз 8 калима дарозтар нест,
 * пас «ҷумлаи дароз → say» бо мазмуни воқеӣ фризз шуда наметавонад.
 *
 * Ҳамчунин ин ягона ҷоест, ки `audioUrl` -и НОХОЛӢ санҷида мешавад: дар
 * тамоми база ва бастаҳо `audioUrl` ҳамеша `null` аст.
 */
function fromSynthetic() {
  const id = (n) => `synthetic:long-sentence:I${n}`;
  return {
    source: 'synthetic',
    categoryTitle: 'Booking a table (synthetic)',
    lessonId: 'synthetic:long-sentence',
    lessonTitle: 'Ҷумлаи дароз (сунъӣ)',
    lessonOrder: 0,
    items: [
      // Зинаи калима — то шоха 186–211 дар ҳамин файл ҳам бошад.
      { id: id(0), kind: 'word', text: 'tonight', translation: 'имшаб',
        literal: 'тунайт', note: null, audioUrl: null, cue: null, cueTranslation: null },
      // 11 калима → `words.length > MAX_SLOT_WORDS` → `kind: 'say'`.
      // `audioUrl` НОХОЛӢ — ягона ҷои санҷиши `item.audioUrl ?? ''`.
      { id: id(1), kind: 'sentence',
        text: 'I would like to book a table for two people tonight.',
        translation: 'Ман мехоҳам барои ду нафар барои имшаб миз фармоиш диҳам.',
        literal: null, note: 'Ибораи хушмуомила барои фармоиш.',
        audioUrl: 'https://cdn.jsdelivr.net/gh/ramz/audio@main/en/book-a-table.mp3',
        cue: null, cueTranslation: null },
      // Се ҷумлаи кӯтоҳ → recallPool = 3 (маҳз сарҳади `>= 3`).
      { id: id(2), kind: 'sentence', text: 'Do you have a free table?',
        translation: 'Мизи холӣ доред?', literal: null, note: null, audioUrl: null,
        cue: 'Good evening! How can I help you?', cueTranslation: 'Шоми хуш! Чӣ хизмат?' },
      { id: id(3), kind: 'sentence', text: 'For two people, please.',
        translation: 'Барои ду нафар, лутфан.', literal: null, note: null,
        audioUrl: null, cue: null, cueTranslation: null },
      { id: id(4), kind: 'sentence', text: 'Thank you very much.',
        translation: 'Ташаккури зиёд.', literal: null, note: null,
        audioUrl: null, cue: null, cueTranslation: null },
    ].map(pick),
  };
}

// ── 3. Дарсҳои интихобшуда ───────────────────────────────────────────────
// Интихоб аз рӯи ПӮШИШИ ШОХАҲОи мантиқи 153–265, на тасодуфӣ.
const PLAN = [
  { file: '01-words-only-no-recall',   db: ['Meeting someone', 0], repeat: false },
  { file: '02-sentences-only-recall',  db: ['Meeting someone', 2], repeat: false },
  { file: '03-mixed-repeat-boundary',  db: ['Meeting someone', 3], repeat: true  },
  { file: '04-ordering-food-with-cue', pack: ['ordering_food_en_tg', 2], repeat: false },
  { file: '05-largest-mixed-cue',      pack: ['family_people_en_tg', 0], repeat: false },
  { file: '06-long-sentence-synthetic', synthetic: true, repeat: false },
];

const sql = neon(env().DATABASE_URL);
mkdirSync(OUT, { recursive: true });

const summary = [];
for (const spec of PLAN) {
  const src = spec.synthetic
    ? fromSynthetic()
    : spec.db
      ? await fromDb(sql, ...spec.db)
      : fromPack(...spec.pack);
  const lesson = { id: src.lessonId, title: src.lessonTitle, items: src.items };
  const doneIds = new Set(spec.repeat ? [src.lessonId] : []);
  const exercises = runCurrent(lesson, doneIds);

  const words = src.items.filter((i) => i.kind === 'word').length;
  const recallPool = src.items.filter(
    (i) => i.kind !== 'word' && i.text.trim().split(/\s+/).filter(Boolean).length <= MAX_SLOT_WORDS,
  ).length;

  const doc = {
    meta: {
      note: 'M0b baseline — хуруҷи мантиқи ҶОРИИ тавлид. Дастӣ таҳрир НАКУНЕД.',
      generator: 'lib/speaking/__tests__/generate-baseline.mjs',
      sourceFile: 'app/api/ai/speaking/lesson/route.ts',
      sourceLines: `${SRC_FROM}-${SRC_TO}`,
      sourceSha256: regionSha,
      contentSource: src.source,
      repeat: spec.repeat,
      maxSlotWords: MAX_SLOT_WORDS,
    },
    input: {
      categoryTitle: src.categoryTitle,
      lessonId: src.lessonId,
      lessonTitle: src.lessonTitle,
      lessonOrder: src.lessonOrder,
      doneIds: [...doneIds],
      items: src.items,
    },
    output: { exercises },
  };

  writeFileSync(path.join(OUT, `${spec.file}.json`), JSON.stringify(doc, null, 2) + '\n', 'utf8');

  const kinds = {};
  for (const e of exercises) kinds[e.kind] = (kinds[e.kind] ?? 0) + 1;
  summary.push({
    file: `${spec.file}.json`,
    source: src.source,
    category: src.categoryTitle,
    lesson: src.lessonTitle,
    items: src.items.length,
    words,
    sentences: src.items.length - words,
    cues: src.items.filter((i) => i.cue).length,
    recallPool,
    repeat: spec.repeat,
    steps: exercises.length,
    kinds,
  });
}

writeFileSync(
  path.join(OUT, 'INDEX.json'),
  JSON.stringify({ generatedFrom: `${SRC_FROM}-${SRC_TO}`, sourceSha256: regionSha, baselines: summary }, null, 2) + '\n',
  'utf8',
);

console.log(`source sha256: ${regionSha}\n`);
for (const s of summary) {
  console.log(
    `${s.file.padEnd(34)} ${String(s.steps).padStart(3)} қадам  ` +
      `(воҳид=${s.items} калима=${s.words} ҷумла=${s.sentences} cue=${s.cues} ` +
      `recallPool=${s.recallPool} repeat=${s.repeat})  ` +
      Object.entries(s.kinds).map(([k, v]) => `${k}:${v}`).join(' '),
  );
}
