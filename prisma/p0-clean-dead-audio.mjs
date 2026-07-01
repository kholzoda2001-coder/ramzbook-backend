import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const c = await p.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
// Dead relative URLs like "/audio/en/hello.mp3" 404 everywhere → null them so the
// app skips a failed network fetch and goes straight to device-TTS fallback.
const dead = await p.word.findMany({ where:{ lesson:{module:{courseId:c.id}}, audioUrl:{ startsWith:'/audio/' } }, select:{id:true} });
let n=0;
for(const w of dead){ await p.word.update({ where:{id:w.id}, data:{ audioUrl:null } }); n++; }
console.log('URL-ҳои мурдаи аудио null карда шуд:', n);
// also clear dead grammar-example / dialogue-line relative urls if any
const gx = await p.grammarExample.updateMany({ where:{ topic:{courseId:c.id}, audioUrl:{ startsWith:'/audio/' } }, data:{audioUrl:null} });
const dl = await p.dialogueLine.updateMany({ where:{ dialogue:{courseId:c.id}, audioUrl:{ startsWith:'/audio/' } }, data:{audioUrl:null} });
console.log('grammarExample:', gx.count, '| dialogueLine:', dl.count);
await p.$disconnect();
