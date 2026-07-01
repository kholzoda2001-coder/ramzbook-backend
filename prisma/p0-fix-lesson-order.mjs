import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const PRIO = { vocabulary:0, grammar:1, reading:2, listening:3, speaking:4, review:5, test:6 };

async function main(){
  const c = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
  const mods = await prisma.module.findMany({ where:{courseId:c.id}, orderBy:{order:'asc'}, include:{ lessons:true } });
  let changed=0;
  for(const m of mods){
    // stable sort: by current order, tie-break by pedagogical priority
    const sorted = [...m.lessons].sort((a,b)=> (a.order-b.order) || ((PRIO[a.skillType]??9)-(PRIO[b.skillType]??9)) );
    for(let i=0;i<sorted.length;i++){
      if(sorted[i].order!==i){ await prisma.lesson.update({ where:{id:sorted[i].id}, data:{order:i} }); changed++; }
    }
  }
  console.log('lessons reordered:', changed);
  // re-verify module 4
  const m4 = await prisma.module.findFirst({ where:{courseId:c.id, order:4}, include:{lessons:{orderBy:{order:'asc'}, select:{order:true,skillType:true,title:true}}} });
  console.log(`\nMODULE 4: ${m4.title}`);
  for(const l of m4.lessons) console.log(`  ${l.order} [${l.skillType}] ${l.title}`);
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
