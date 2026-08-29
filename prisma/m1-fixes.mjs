// ═══════════════════════════════════════════════════════════════════════════
//  English A1 · Module 1 — remediation from `English_A1_Module1_QA_Report.md`
//
//  Seven fix groups, all idempotent. Dry-run by default; pass --apply to write.
//    node prisma/m1-fixes.mjs            # show the diff, touch nothing
//    node prisma/m1-fixes.mjs --apply    # execute
//    node prisma/m1-fixes.mjs --sql      # also emit prisma/out/m1-fixes.sql
//
//  DRIVER: Neon HTTP (@neondatabase/serverless), not Prisma — TCP 5432 is
//  blocked from the workstation. See [[ramz-db-scripts-local]]. Three traps
//  honoured here:
//    1. UPDATE returns an EMPTY array over HTTP — there is no rowCount. Every
//       group is verified with a separate SELECT taken before and after.
//    2. jsonb (ComprehensionQuestion.options) must be sent as
//       `${JSON.stringify(arr)}::jsonb`, never as a JS array — the driver
//       would encode it as a Postgres array and Postgres rejects it.
//    3. Re-running must be a no-op, not an error.
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { Agent, setGlobalDispatcher } from 'undici';

setGlobalDispatcher(new Agent({ connect: { timeout: 45000 } }));

const APPLY = process.argv.includes('--apply');
const EMIT_SQL = process.argv.includes('--sql');

function connect() {
  const env = Object.fromEntries(
    readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL not found in .env');
  return neon(env.DATABASE_URL);
}
const sql = connect();

const LESSON_TOBE = 'cmqqkhw04001zwyp45xyaky44';   // Д7 «Грамматика: Феъли To Be»
const LESSON_PRON = 'cmqqkhm69000zwyp4mg0lvce5';   // Д8 «Грамматика: Ҷонишинҳои фоилӣ»

const sqlLines = [];
const rec = (s) => sqlLines.push(s);
const q = (s) => String(s).replace(/'/g, "''");

const changed = [];   // {group, table, id, column, before, after}
const skipped = [];   // already correct

// ── generic single-column update, idempotent ────────────────────────────────
async function setCol(group, table, id, column, after, label = '') {
  const rows = await sql.query(`SELECT "${column}" AS v FROM "${table}" WHERE id = $1`, [id]);
  if (!rows.length) { skipped.push({ group, table, id, column, why: 'ROW NOT FOUND' }); return; }
  const before = rows[0].v;
  if (before === after) { skipped.push({ group, table, id, column, why: 'already correct' }); return; }
  rec(`UPDATE "${table}" SET "${column}" = '${q(after)}' WHERE id = '${id}';`);
  if (APPLY) await sql.query(`UPDATE "${table}" SET "${column}" = $1 WHERE id = $2`, [after, id]);
  changed.push({ group, table, id, column, before, after, label });
}

// ═══ 1. Sequence swap: Pronouns (Д8) before Verb To Be (Д7) ════════════════
async function group1() {
  const rows = await sql.query(
    `SELECT id, "order", title FROM "Lesson" WHERE id = ANY($1) ORDER BY "order"`,
    [[LESSON_TOBE, LESSON_PRON]],
  );
  const tobe = rows.find((r) => r.id === LESSON_TOBE);
  const pron = rows.find((r) => r.id === LESSON_PRON);
  if (!tobe || !pron) { skipped.push({ group: 1, why: 'one or both grammar lessons not found' }); return; }
  if (pron.order < tobe.order) { skipped.push({ group: 1, why: `already swapped (Pronouns=${pron.order}, ToBe=${tobe.order})` }); return; }

  // Three-step swap through a free slot — "order" carries no unique constraint
  // today, but going through -1 keeps this correct if one is ever added.
  rec(`UPDATE "Lesson" SET "order" = -1 WHERE id = '${LESSON_PRON}';`);
  rec(`UPDATE "Lesson" SET "order" = ${pron.order} WHERE id = '${LESSON_TOBE}';`);
  rec(`UPDATE "Lesson" SET "order" = ${tobe.order} WHERE id = '${LESSON_PRON}';`);
  if (APPLY) {
    await sql.query(`UPDATE "Lesson" SET "order" = -1 WHERE id = $1`, [LESSON_PRON]);
    await sql.query(`UPDATE "Lesson" SET "order" = $1 WHERE id = $2`, [pron.order, LESSON_TOBE]);
    await sql.query(`UPDATE "Lesson" SET "order" = $1 WHERE id = $2`, [tobe.order, LESSON_PRON]);
  }
  changed.push({ group: 1, table: 'Lesson', id: LESSON_PRON, column: 'order', before: pron.order, after: tobe.order, label: 'Subject Pronouns' });
  changed.push({ group: 1, table: 'Lesson', id: LESSON_TOBE, column: 'order', before: tobe.order, after: pron.order, label: 'Verb To Be' });
}

// ═══ 2. ipaTajik — one convention for word-initial /j/, disambiguate «уу» ═══
// Tajik е/ё/ю/я are ALREADY iotated: «ес» is /jes/, so «йес» is a double yod.
// «уу» already means long /uː/ elsewhere in the course (туутҳ, суупэмаакит),
// so /w/+/ʊ/ must not reuse it.
const IPA_FIXES = [
  ['cmqngcvui0007ee518emegklh', 'ес',        'Д1 Yes'],
  ['cmrge2tov00055nnrc5xnjp7g', 'ес',        'Д13 Yes'],
  ['cmqngcvui000nee51mhsec3hf', 'ёр',        'Д4 Your'],
  ['cmqngcvui000dee51vhqacj5l', 'ё уэлкам',  'Д2 You’re welcome'],
  ['cmrge2uoi00095nnrt1204qm9', 'ё уэлкам',  'Д13 You’re welcome'],
  ['cmqngcvui000tee518qgfwr20', 'вуман',     'Д5 Woman'],
];
async function group2() {
  for (const [id, after, label] of IPA_FIXES) await setCol(2, 'Word', id, 'ipaTajik', after, label);
}

// ═══ 3. The seven explanations that contained no Tajik at all ══════════════
// Pattern matches what script 05 already applied elsewhere: «Матн: <source
// line>» plus a Tajik gloss, so the learner sees BOTH the evidence and its
// meaning.
const EXPL_FIXES = [
  ['GrammarExercise',      'cmqqkmwen001pdvu25ov6fel8', 'Тартиб: фоил (I) → феъл (am) → артикл (a) → исм (teacher).', 'Д7 reorder'],
  ['ComprehensionQuestion','cmsd0vth7000910cpwj5mmr22', 'Матн: His name is Karim. — Номи ӯ Карим аст.',              'Д9 q1'],
  ['ComprehensionQuestion','cmsd0vto6000b10cp206zhgv1', 'Матн: He is a teacher. — Ӯ муаллим аст.',                   'Д9 q2'],
  ['ComprehensionQuestion','cmr4vkr3h0002g4jrap7ns4tm', 'Матн: My name is Anna. — Номи ман Анна аст.',               'Д10 q1'],
  ['ComprehensionQuestion','cmr4vkr3h0003g4jrtu0yrf0t', 'Матн: I am a teacher. — Ман муаллим ҳастам.',               'Д10 q2'],
  ['ComprehensionQuestion','cmr4vkr3h0004g4jr627ww62e', 'Матн: This is my friend Tom. — Ин дӯсти ман Том аст.',      'Д10 q3'],
  ['ComprehensionQuestion','cmr4vkr3i0005g4jroopmkhu7', 'Матн: He is a student. — Ӯ донишҷӯ аст.',                   'Д10 q4'],
];
async function group3() {
  for (const [table, id, after, label] of EXPL_FIXES) await setCol(3, table, id, 'explanation', after, label);
}

// ═══ 4. Register: ту → шумо, the 3 rows script 07 never applied ════════════
// NOT touched: the Д7 topic explanation, which quotes «ту ҳастӣ» because the
// Tajik paradigm IS the thing being taught (trap #10 in the QA toolkit).
const REGISTER_FIXES = [
  ['Word',            'cmqngcvui000nee51mhsec3hf', 'exampleTrans',     'Номи шумо чист?',            'Д4 Your — example'],
  ['GrammarExample',  'cmqqkmt3h0017dvu2arrr34ps', 'translation',      'Шумо дӯсти ман ҳастед.',     'Д7 example 2'],
  ['GrammarExercise', 'cmqqkmvns001ldvu2107onc77', 'promptTranslated', 'Шумо дӯсти ман ҳастед.',     'Д7 exercise 4'],
];
async function group4() {
  for (const [table, id, col, after, label] of REGISTER_FIXES) await setCol(4, table, id, col, after, label);
}

// ═══ 5. Emoji — remove the three in-lesson collisions ══════════════════════
// Chosen from Unicode 6.0/9.0 only: 🫵-class glyphs (Unicode 14) still render
// as tofu on the older Android builds much of the audience is on.
// Verified against _kPickBlockedEmojis / _isPicturable: every word below is a
// pronoun, determiner or interjection, so NONE of these newly enables the
// «Ин чист?» picture exercise (the hazard noted for a1-fixes script 04).
const EMOJI_FIXES = [
  ['cmqngcvui000aee51frg8p545', '🥺', 'Д2 Please   (was 🙏 — collided with Thank you)'],
  ['cmrge2u6p00075nnrwywph27o', '🥺', 'Д13 Please  (kept in step with Д2)'],
  ['cmqngcvui000hee51q64il1e9', '👉', 'Д3 You      (was 👤)'],
  ['cmqngcvui000iee5122xmnta7', '🎒', 'Д3 My       (was 👤)'],
  ['cmrge2v6c000b5nnrir750cif', '👉', 'Д13 You     (kept in step with Д3)'],
  ['cmqngcvui000nee51mhsec3hf', '👜', 'Д4 Your     (was 👤 — freed so 👤 means only «I», in Д3)'],
  ['cmqngcvui000pee511kolgzra', '🤷', 'Д4 Who      (was ❔ — indistinguishable from What ❓)'],
];
async function group5() {
  for (const [id, after, label] of EMOJI_FIXES) await setCol(5, 'Word', id, 'emoji', after, label);
}

// ═══ 6. Dialogue speakers — «Person A/B» were untranslated placeholders ════
// Named by ROLE rather than А/Б: line.isUser already marks which side the
// learner speaks, so the labels can say so.
const SPEAKER_FIXES = [
  ['cmqp81u210002v8u46aueyr6x', 'Ҳамсуҳбат'], ['cmqp81u210003v8u44cp7nae7', 'Шумо'],
  ['cmqp81u210004v8u4s2gz5s0c', 'Ҳамсуҳбат'], ['cmqp81u210005v8u4aafp0uvi', 'Шумо'],
  ['cmqp81u210006v8u433gabe4i', 'Ҳамсуҳбат'], ['cmqp81u210007v8u41k16pb87', 'Шумо'],
  ['cmqp81u210008v8u4d68035jj', 'Ҳамсуҳбат'], ['cmqp81u210009v8u4dyi90fv2', 'Шумо'],
];
async function group6() {
  for (const [id, after] of SPEAKER_FIXES) await setCol(6, 'DialogueLine', id, 'speaker', after, 'Д11 line');
}

// ═══ 7. Final exam — only Module 1 vocabulary ══════════════════════════════
// Every option and every English question below is built from words Module 1
// actually teaches, plus the proper names already in the passage (Ali, Sara)
// and the am/is/are + He/She/It forms taught by the two grammar lessons.
// correctIndex is deliberately spread across 0/1/2 — the previous set could be
// cleared by always tapping the first option.
const EXAM = [
  { id: 'cmqqxlbgj0001a32fyv4gc4ei',
    question: 'My name is ___.', tj: 'Номи ман чист? (аз матн)',
    options: ['Ali', 'Sara', 'Hello'], ci: 0,
    expl: 'Матн: My name is Ali. — Номи ман Алӣ аст.' },
  { id: 'cmqqxlc010003a32fhl5p3gzo',
    question: 'I am a ___.', tj: 'Ман кистам? (аз матн)',
    options: ['Girl', 'Woman', 'Boy'], ci: 2,
    expl: 'Матн: I am a boy. — Ман писар ҳастам.' },
  { id: 'cmqqxlcd50005a32fmdebdw0y',
    question: 'Sara is a ___.', tj: 'Сара кист? (аз матн)',
    options: ['Man', 'Girl', 'Boy'], ci: 1,
    expl: 'Матн: She is a girl. — Сара духтар аст.' },
  { id: 'cmqqxlcq40007a32fj651bjke',
    question: 'Sara is a girl. ___ is my friend.', tj: 'Ҷонишин барои зан кадом аст?',
    options: ['He', 'It', 'She'], ci: 2,
    expl: 'Сара зан аст → She. (Ҷонишинҳои фоилӣ: She = ӯ, барои зан)' },
  { id: 'cmqqxld330009a32fcpig35ew',
    question: 'I ___ Ali.', tj: 'Феъли to be: бо I кадом шакл меояд?',
    options: ['is', 'am', 'are'], ci: 1,
    expl: 'Бо I ҳамеша am меояд. (Феъли To Be)' },
  { id: 'cmqqxldfy000ba32fbq06x3j4',
    question: 'Салом = ?', tj: '«Салом» ба англисӣ чист?',
    options: ['Hello', 'Please', 'Goodbye'], ci: 0,
    expl: 'Салом = Hello.' },
  { id: 'cmqqxldt1000da32fwrf5q5nq',
    question: 'Ташаккур = ?', tj: '«Ташаккур» ба англисӣ чист?',
    options: ['Sorry', "You're welcome", 'Thank you'], ci: 2,
    expl: 'Ташаккур = Thank you.' },
  { id: 'cmqqxle5z000fa32fz24zbcuz',
    question: 'Субҳ ба хайр = ?', tj: '«Субҳ ба хайр» ба англисӣ чист?',
    options: ['Good night', 'Good morning', 'Good evening'], ci: 1,
    expl: 'Субҳ ба хайр = Good morning.' },
];

async function group7() {
  for (const e of EXAM) {
    const rows = await sql.query(
      `SELECT question, "questionTranslated" AS tj, options, "correctIndex" AS ci, explanation
         FROM "ComprehensionQuestion" WHERE id = $1`, [e.id]);
    if (!rows.length) { skipped.push({ group: 7, table: 'ComprehensionQuestion', id: e.id, why: 'ROW NOT FOUND' }); continue; }
    const b = rows[0];
    const sameOpts = JSON.stringify(b.options) === JSON.stringify(e.options);
    if (b.question === e.question && b.tj === e.tj && sameOpts && b.ci === e.ci && b.explanation === e.expl) {
      skipped.push({ group: 7, table: 'ComprehensionQuestion', id: e.id, why: 'already correct' });
      continue;
    }
    rec(`UPDATE "ComprehensionQuestion" SET question='${q(e.question)}', "questionTranslated"='${q(e.tj)}', ` +
        `options='${q(JSON.stringify(e.options))}'::jsonb, "correctIndex"=${e.ci}, explanation='${q(e.expl)}' ` +
        `WHERE id='${e.id}';`);
    if (APPLY) {
      // options is jsonb — it MUST go through ::jsonb from a JSON string, or
      // the driver sends a Postgres array and Postgres raises
      // "invalid input syntax for type json".
      await sql.query(
        `UPDATE "ComprehensionQuestion"
            SET question = $1, "questionTranslated" = $2, options = $3::jsonb,
                "correctIndex" = $4, explanation = $5
          WHERE id = $6`,
        [e.question, e.tj, JSON.stringify(e.options), e.ci, e.expl, e.id]);
    }
    changed.push({ group: 7, table: 'ComprehensionQuestion', id: e.id, column: 'question+options+correctIndex+explanation',
                   before: `${b.question} ${JSON.stringify(b.options)} ci=${b.ci}`,
                   after: `${e.question} ${JSON.stringify(e.options)} ci=${e.ci}`, label: 'Д14 exam' });
  }
}

// ═══ run ═══════════════════════════════════════════════════════════════════
const GROUPS = [
  ['1 · Sequence swap (Pronouns before Verb To Be)', group1],
  ['2 · ipaTajik (word-initial /j/, «уу» overload)', group2],
  ['3 · Explanations translated into Tajik',         group3],
  ['4 · Register ту → шумо',                          group4],
  ['5 · Emoji collisions',                            group5],
  ['6 · Dialogue speaker names',                      group6],
  ['7 · Final exam rebuilt on taught vocabulary',     group7],
];

console.log('\n' + '═'.repeat(78));
console.log('  English A1 · Module 1 — remediation');
console.log(`  Mode: ${APPLY ? '🔴 APPLY (writing to the database)' : '🟢 DRY-RUN (nothing is written)'}`);
console.log('═'.repeat(78));

for (const [name, fn] of GROUPS) {
  console.log(`\n── ${name}`);
  const before = changed.length;
  await fn();
  const mine = changed.slice(before);
  if (!mine.length) console.log('   (no change needed)');
  for (const c of mine) {
    console.log(`   ${c.table}.${c.column}  ${c.id}${c.label ? '  [' + c.label + ']' : ''}`);
    console.log(`     − ${String(c.before).replace(/\n/g, ' ⏎ ').slice(0, 110)}`);
    console.log(`     + ${String(c.after).replace(/\n/g, ' ⏎ ').slice(0, 110)}`);
  }
}

// ── verification: read every touched row BACK from the database ────────────
if (APPLY) {
  console.log('\n── verification (re-read from the database) ──');
  let ok = 0, bad = 0;
  for (const c of changed) {
    if (c.group === 7) {
      const [r] = await sql.query(`SELECT question, options, "correctIndex" AS ci FROM "ComprehensionQuestion" WHERE id = $1`, [c.id]);
      const e = EXAM.find((x) => x.id === c.id);
      const good = r && r.question === e.question && JSON.stringify(r.options) === JSON.stringify(e.options) && r.ci === e.ci;
      good ? ok++ : bad++;
      if (!good) console.log(`   ✗ ${c.table} ${c.id}`);
      continue;
    }
    if (c.group === 1) {
      const [r] = await sql.query(`SELECT "order" FROM "Lesson" WHERE id = $1`, [c.id]);
      (r && r.order === c.after) ? ok++ : bad++;
      if (!r || r.order !== c.after) console.log(`   ✗ Lesson ${c.id} order=${r?.order} expected ${c.after}`);
      continue;
    }
    const [r] = await sql.query(`SELECT "${c.column}" AS v FROM "${c.table}" WHERE id = $1`, [c.id]);
    (r && r.v === c.after) ? ok++ : bad++;
    if (!r || r.v !== c.after) console.log(`   ✗ ${c.table}.${c.column} ${c.id}`);
  }
  console.log(`   ${ok} row(s) confirmed, ${bad} mismatch(es).`);
}

if (EMIT_SQL || !APPLY) {
  mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  const path = new URL('./out/m1-fixes.sql', import.meta.url);
  writeFileSync(path, [
    '-- English A1 · Module 1 remediation',
    `-- generated ${new Date().toISOString()} · ${sqlLines.length} statement(s)`,
    '-- Take a backup before running. Idempotent: safe to re-run.',
    'BEGIN;', '', ...sqlLines, '', 'COMMIT;', '',
  ].join('\n'), 'utf8');
  console.log(`\n   SQL written to prisma/out/m1-fixes.sql (${sqlLines.length} statements)`);
}

console.log('\n' + '─'.repeat(78));
console.log(`  ${changed.length} row-column change(s) ${APPLY ? 'APPLIED' : 'PENDING'} · ${skipped.length} skipped`);
for (const s of skipped) console.log(`    skip: g${s.group} ${s.table ?? ''} ${s.id ?? ''} — ${s.why}`);
if (!APPLY) console.log('\n  Nothing was written. Re-run with --apply to execute.');
console.log('─'.repeat(78) + '\n');
