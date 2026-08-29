import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
for(const r of await sql`
 SELECT c.title ct,c.level lv,m."order" mo,l."order" lo,dl.text tx,dl.translation tr
 FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id
 JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId"
 JOIN "Course" c ON c.id=m."courseId"
 WHERE dl.translation ~ 'Меарзад' ORDER BY c.title,m."order"`)
  console.log(`  🟠 «${r.ct}» (${r.lv}) M${r.mo+1}#${r.lo}: «${r.tx}» → «${r.tr}»`);
