// ПЕШ АЗ ИСЛОҲ (танҳо хониш): оё ҳар сатри ивазшаванда ТАНҲО ба Модули 2-и РУСӢ тааллуқ дорад?
import { writeFileSync } from 'fs';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const mods = await sql`SELECT id,"order" FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const M2 = mods[1];
const L = await sql`SELECT id,"order","grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${M2.id} ORDER BY "order"`;
let bad = 0;
const [course] = await sql`SELECT c.id, t.code tc, n.code nc, c.level FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE c.id=${COURSE_RU_A1}`;
console.log(`курс: ${course.tc}→${course.nc} ${course.level} · модули 2: ${M2.id} · дарсҳо: ${L.length}`);
for (const [col, label] of [['grammarTopicId', 'GrammarTopic'], ['dialogueId', 'Dialogue'], ['comprehensionId', 'ComprehensionExercise']]) {
  for (const l of L) {
    const id = l[{ grammarTopicId: 'gid', dialogueId: 'did', comprehensionId: 'cid' }[col]];
    if (!id) continue;
    const refs = await sql.query(`SELECT l.id, m."courseId" cid FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId" WHERE l."${col}"=$1`, [id]);
    const foreign = refs.filter((r) => r.cid !== COURSE_RU_A1);
    const ok = refs.length === 1 && !foreign.length;
    if (!ok) bad++;
    console.log(`  ${ok ? '✓' : '✗'} ${label} Д${l.order + 1}: ${refs.length} дарс истифода мебарад${foreign.length ? `, аз курси ДИГАР: ${foreign.length}` : ''}`);
  }
}
// Грамматика ва фаҳмиш метавонанд берун аз дарс ҳам бо courseId пайваст бошанд
const gt = await sql`SELECT g.id, g."courseId" FROM "GrammarTopic" g WHERE g.id = ANY(${L.map((l) => l.gid).filter(Boolean)})`;
for (const g of gt) { const ok = !g.courseId || g.courseId === COURSE_RU_A1; if (!ok) bad++; console.log(`  ${ok ? '✓' : '✗'} GrammarTopic.courseId = ${g.courseId}`); }
const ce = await sql`SELECT c.id, c."courseId" FROM "ComprehensionExercise" c WHERE c.id = ANY(${L.map((l) => l.cid).filter(Boolean)})`;
for (const c of ce) { const ok = !c.courseId || c.courseId === COURSE_RU_A1; if (!ok) bad++; console.log(`  ${ok ? '✓' : '✗'} ComprehensionExercise.courseId = ${c.courseId}`); }
// Калимаҳое ки аз ду акси нестшаванда истифода мебаранд (калид = матни калима)
const w = await sql`SELECT w.word, l."order" lo, m."order" mo, c.id cid, t.code tc FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" JOIN "Language" t ON t.id=c."targetLanguageId"
  WHERE lower(w.word) IN ('таджикистан','англия')`;
console.log('\nкалимаҳо бо акси images/ru/таджикистан|англия:');
for (const r of w) console.log(`  ${r.tc} М${r.mo + 1}·Д${r.lo + 1} «${r.word}»`);
// Нусхаи эҳтиётии ПУРРАИ модул (ҳар сатре ки метавонад иваз шавад)
const snap = {};
snap.lessons = L;
snap.words = await sql`SELECT * FROM "Word" WHERE "lessonId" = ANY(${L.map((l) => l.id)})`;
snap.grammarExamples = await sql`SELECT * FROM "GrammarExample" WHERE "topicId" = ANY(${L.map((l) => l.gid).filter(Boolean)})`;
snap.grammarExercises = await sql`SELECT * FROM "GrammarExercise" WHERE "topicId" = ANY(${L.map((l) => l.gid).filter(Boolean)})`;
snap.grammarRules = await sql`SELECT * FROM "GrammarRule" WHERE "topicId" = ANY(${L.map((l) => l.gid).filter(Boolean)})`;
snap.dialogueLines = await sql`SELECT * FROM "DialogueLine" WHERE "dialogueId" = ANY(${L.map((l) => l.did).filter(Boolean)})`;
snap.comprehension = await sql`SELECT * FROM "ComprehensionExercise" WHERE id = ANY(${L.map((l) => l.cid).filter(Boolean)})`;
snap.questions = await sql`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId" = ANY(${L.map((l) => l.cid).filter(Boolean)})`;
snap.module = await sql`SELECT * FROM "Module" WHERE id=${M2.id}`;
writeFileSync('../../tmp/ru-m2-BACKUP-2026-09-11.json', JSON.stringify(snap, null, 1));
console.log(`\nнусхаи эҳтиётӣ: tmp/ru-m2-BACKUP-2026-09-11.json (${snap.words.length} калима, ${snap.questions.length} савол, ${snap.dialogueLines.length} сатри муколама)`);
console.log(bad ? `\n⛔ ${bad} мушкили моликият` : '\n✅ ҳар ҷузъ танҳо ба Модули 2-и русӣ тааллуқ дорад');
