import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
// Имзои олудагии қолабӣ: ҲАМОН тарҷумаи тоҷикӣ дар ДУ курси гуногун, дар
// мавқеи ЯКХЕЛА, вале матни манбаъ маънои ДИГАР дорад. «Меарзад» ҳамин тавр
// ёфт шуд. Ин ҷо ҳамаи чунин ҷуфтҳо дар муколамаҳо ҷустуҷӯ мешаванд.
const rows = await sql`
 SELECT c.id cid,c.title ct,m."order" mo,l."order" lo,dl."order" dlo,dl.text tx,dl.translation tr
 FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id
 JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId"
 JOIN "Course" c ON c.id=m."courseId" WHERE c.level='A1'`;
const byKey={};
for(const r of rows){ const k=`M${r.mo+1}#${r.lo}:${r.dlo}`; (byKey[k]||=[]).push(r); }
let n=0;
for(const [k,v] of Object.entries(byKey)){
  if(v.length<2) continue;
  const ru = v.find(x=>x.cid===C); if(!ru) continue;
  for(const other of v){
    if(other.cid===C) continue;
    if(other.tr===ru.tr && other.tx!==ru.tx){
      // тарҷума якхела, вале манбаъ дигар — метавонад дуруст бошад (салом=hello),
      // пас танҳо вақте гузориш дода мешавад, ки матнҳо маънои ГУНОГУН доранд.
      n++;
      console.log(`  ${k}`);
      console.log(`     [русӣ]   «${ru.tx}»  → «${ru.tr}»`);
      console.log(`     [${other.ct}] «${other.tx}» → «${other.tr}»`);
    }
  }
}
console.log(`\n  Ҷуфтҳои якхелаи тарҷума дар мавқеи якхела: ${n}`);
