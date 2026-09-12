// ПЕШ АЗ ИСЛОҲ (танҳо хониш): оё ҳар ҷузъи модул ТАНҲО ба ҳамин модули РУСӢ тааллуқ дорад?
// + нусхаи эҳтиётии пурраи модул.  node prisma/_ru-mod-precheck.mjs <индекс>
import { writeFileSync } from 'fs';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const idx = Number(process.argv[2]);
const mods = await sql`SELECT id,"order" FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const M = mods[idx];
const L = await sql`SELECT id,"order","grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid,"phraseCollectionId" pid FROM "Lesson" WHERE "moduleId"=${M.id} ORDER BY "order"`;
let bad = 0;
console.log(`модули ${idx + 1}: ${M.id} · дарсҳо: ${L.length}`);
for (const [col, key, label] of [['grammarTopicId', 'gid', 'GrammarTopic'], ['dialogueId', 'did', 'Dialogue'], ['comprehensionId', 'cid', 'ComprehensionExercise'], ['phraseCollectionId', 'pid', 'PhraseCollection']]) {
  for (const l of L) {
    const id = l[key];
    if (!id) continue;
    const refs = await sql.query(`SELECT l.id, m."courseId" cid FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId" WHERE l."${col}"=$1`, [id]);
    const foreign = refs.filter((r) => r.cid !== COURSE_RU_A1);
    const ok = refs.length === 1 && !foreign.length;
    if (!ok) bad++;
    console.log(`  ${ok ? '✓' : '✗'} ${label} Д${l.order + 1}: ${refs.length} дарс${foreign.length ? `, курси ДИГАР: ${foreign.length}` : ''}`);
  }
}
const gt = await sql`SELECT id,"courseId" FROM "GrammarTopic" WHERE id = ANY(${L.map((l) => l.gid).filter(Boolean)})`;
for (const g of gt) { const ok = !g.courseId || g.courseId === COURSE_RU_A1; if (!ok) bad++; console.log(`  ${ok ? '✓' : '✗'} GrammarTopic.courseId`); }
const ce = await sql`SELECT id,"courseId" FROM "ComprehensionExercise" WHERE id = ANY(${L.map((l) => l.cid).filter(Boolean)})`;
for (const c of ce) { const ok = !c.courseId || c.courseId === COURSE_RU_A1; if (!ok) bad++; console.log(`  ${ok ? '✓' : '✗'} ComprehensionExercise.courseId`); }
const snap = { lessons: L };
const ids = (k) => L.map((l) => l[k]).filter(Boolean);
snap.words = await sql`SELECT * FROM "Word" WHERE "lessonId" = ANY(${L.map((l) => l.id)})`;
snap.grammarTopics = await sql`SELECT * FROM "GrammarTopic" WHERE id = ANY(${ids('gid')})`;
snap.grammarExamples = await sql`SELECT * FROM "GrammarExample" WHERE "topicId" = ANY(${ids('gid')})`;
snap.grammarExercises = await sql`SELECT * FROM "GrammarExercise" WHERE "topicId" = ANY(${ids('gid')})`;
snap.grammarRules = await sql`SELECT * FROM "GrammarRule" WHERE "topicId" = ANY(${ids('gid')})`;
snap.dialogueLines = await sql`SELECT * FROM "DialogueLine" WHERE "dialogueId" = ANY(${ids('did')})`;
snap.comprehension = await sql`SELECT * FROM "ComprehensionExercise" WHERE id = ANY(${ids('cid')})`;
snap.questions = await sql`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId" = ANY(${ids('cid')})`;
snap.module = await sql`SELECT * FROM "Module" WHERE id=${M.id}`;
const out = `../../tmp/ru-m${idx + 1}-BACKUP-2026-09-11.json`;
writeFileSync(out, JSON.stringify(snap, null, 1));
console.log(`\nнусхаи эҳтиётӣ: tmp/ru-m${idx + 1}-BACKUP-2026-09-11.json (${snap.words.length} калима, ${snap.grammarExercises.length} машқ, ${snap.questions.length} савол, ${snap.dialogueLines.length} сатри муколама)`);
console.log(bad ? `\n⛔ ${bad} мушкили моликият` : `\n✅ ҳар ҷузъ танҳо ба Модули ${idx + 1}-и русӣ тааллуқ дорад`);
