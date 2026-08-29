import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
// РЕГИСТРИ ФЕЪЛИ АМРӢ — доме, ки санҷиши «ты↔Шумо» НАМЕБИНАД.
// Феъли амрӣ ҷонишин надорад, пас `ты/тебя` дар матн нест ва checkPair хомӯш
// мемонад. Вале русӣ ду шакл дорад — «Иди» (бетакаллуф) ва «Идите» (расмӣ) —
// ва тоҷикӣ низ: «рав» ↔ «равед».
const RU_INF = /(^|[^А-Яа-яЁё])(иди|поверни|остановись|сверни|скажи|дай|возьми|смотри|слушай|открой|закрой|покажи|извини|подожди|садись|приходи)($|[^А-Яа-яЁё])/i;
const RU_FML = /(^|[^А-Яа-яЁё])(идите|поверните|остановитесь|сверните|скажите|дайте|возьмите|смотрите|слушайте|откройте|закройте|покажите|извините|подождите|садитесь|приходите)($|[^А-Яа-яЁё])/i;
// Тоҷикӣ: амри расмӣ бо «-ед/-ад» тамом мешавад (равед, гардед, кунед, диҳед)
const TG_FML = /(^|[^А-Яа-яЁёӣӯқғҳҷ])(равед|гардед|истед|кунед|диҳед|гиред|бинед|шинед|биёед|нигаред|кушоед|пӯшед|гӯед|бигӯед|нависед|хонед)($|[^А-Яа-яЁёӣӯқғҳҷ])/i;
const TG_INF = /(^|[^А-Яа-яЁёӣӯқғҳҷ])(рав|гард|ист|кун|деҳ|гир|бин|шин|биё|нигар|кушо|пӯш|гӯ|бигӯ|навис|хон)($|[^А-Яа-яЁёӣӯқғҳҷ])/i;

const src=[];
for(const r of await sql`SELECT 'Dialogue' k,c.title ct,m."order" mo,l."order" lo,dl.text ru,dl.translation tg FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE c.id=${C}`) src.push(r);
for(const r of await sql`SELECT 'GrEx' k,c.title ct,m."order" mo,l."order" lo,ge.sentence ru,ge.translation tg FROM "GrammarExample" ge JOIN "GrammarTopic" g ON ge."topicId"=g.id JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE c.id=${C}`) src.push(r);
for(const r of await sql`SELECT 'Passage' k,c.title ct,m."order" mo,l."order" lo,ce.passage ru,ce."passageTranslated" tg FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE c.id=${C}`) src.push(r);

let a=0,b=0;
console.log('### русӣ БЕТАКАЛЛУФ ↔ тоҷикӣ РАСМӢ ###');
for(const r of src){ if(!r.tg) continue;
  if(RU_INF.test(r.ru) && TG_FML.test(r.tg) && !RU_FML.test(r.ru)){ a++;
    console.log(`  🔴 M${r.mo+1} #${r.lo} ${r.k}: «${r.ru}» → «${r.tg}»`); } }
console.log(`  ҳамагӣ: ${a}`);
console.log('\n### русӣ РАСМӢ ↔ тоҷикӣ БЕТАКАЛЛУФ ###');
for(const r of src){ if(!r.tg) continue;
  if(RU_FML.test(r.ru) && TG_INF.test(r.tg) && !TG_FML.test(r.tg)){ b++;
    console.log(`  🟠 M${r.mo+1} #${r.lo} ${r.k}: «${r.ru}» → «${r.tg}»`); } }
console.log(`  ҳамагӣ: ${b}`);
