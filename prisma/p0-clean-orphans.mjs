import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const c = await p.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
let dDlg=0, dComp=0;
const dlg = await p.dialogue.findMany({ where:{courseId:c.id}, include:{lessons:true} });
for(const d of dlg) if(d.lessons.length===0){ await p.dialogue.delete({where:{id:d.id}}); dDlg++; console.log('нест шуд (диалог):', d.title); }
const comps = await p.comprehensionExercise.findMany({ where:{courseId:c.id}, include:{lessons:true} });
for(const x of comps) if(x.lessons.length===0){ await p.comprehensionExercise.delete({where:{id:x.id}}); dComp++; console.log('нест шуд (comprehension):', x.title); }
console.log(`\nНест шуд: ${dDlg} диалог, ${dComp} comprehension`);
await p.$disconnect();
