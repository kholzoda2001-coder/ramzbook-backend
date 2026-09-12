// QA-1: рӯйхати ҳамаи URL-ҳои аудио ва матни хом барои Модули 1
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const [M1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const L = await sql`SELECT id,"order",type,"skillType" st,"grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const out = [];
for (const l of L) {
  const ws = await sql`SELECT word,translation,"audioUrl" au,emoji,"order" FROM "Word" WHERE "lessonId"=${l.id} ORDER BY "order"`;
  for (const w of ws) out.push({kind:'word', lesson:l.order, text:w.word, tr:w.translation, url:w.au, emoji:w.emoji});
  if (l.gid) {
    const ex = await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${l.gid} ORDER BY "order"`;
    for (const e of ex) out.push({kind:'gex', lesson:l.order, text:e.sentence, url:e.au});
  }
  if (l.did) {
    const ln = await sql`SELECT text,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${l.did} ORDER BY "order"`;
    for (const x of ln) out.push({kind:'dlg', lesson:l.order, text:x.text, url:x.au});
  }
  if (l.cid) {
    const [c] = await sql`SELECT passage,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${l.cid}`;
    out.push({kind:'passage', lesson:l.order, text:(c.passage||''), url:c.au});
  }
}
console.log(JSON.stringify(out,null,1));
