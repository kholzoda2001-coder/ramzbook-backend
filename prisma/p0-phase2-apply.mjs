import { PrismaClient } from '@prisma/client';
import { TOPICS } from './p0-grammar-data.mjs';
const prisma = new PrismaClient();

async function ensureGrammarLesson(module, title, titleTranslated, emoji, topicId){
  // find existing by title in this module
  let lesson = await prisma.lesson.findFirst({ where:{ moduleId: module.id, title } });
  if(lesson){
    await prisma.lesson.update({ where:{id:lesson.id}, data:{ skillType:'grammar', type:'grammar', grammarTopicId:topicId, titleTranslated, emoji, cefrLevel:'A1', xpReward:20 } });
    return { lesson, created:false };
  }
  // create, inserting right after the last vocabulary lesson
  const lessons = await prisma.lesson.findMany({ where:{ moduleId: module.id }, orderBy:{ order:'asc' } });
  let insertAt = 0;
  for(let i=0;i<lessons.length;i++){ if(lessons[i].skillType==='vocabulary') insertAt = i+1; }
  // shift orders of everything at/after insertAt up by 1
  for(let i=lessons.length-1;i>=insertAt;i--){
    await prisma.lesson.update({ where:{id:lessons[i].id}, data:{ order: lessons[i].order+1 } });
  }
  lesson = await prisma.lesson.create({ data:{
    moduleId: module.id, title, titleTranslated, type:'grammar', skillType:'grammar',
    cefrLevel:'A1', emoji, xpReward:20, duration:5, order: insertAt, grammarTopicId: topicId,
  }});
  return { lesson, created:true };
}

async function main(){
  const course = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});
  const modules = await prisma.module.findMany({ where:{courseId:course.id}, orderBy:{order:'asc'} });
  const modByOrder = Object.fromEntries(modules.map(m=>[m.order,m]));

  let topicsTouched=0, lessonsCreated=0, rulesIns=0, exIns=0, exerIns=0, order=0;
  for(const t of TOPICS){
    // find topic: by match-title or canonical title
    let topic = await prisma.grammarTopic.findFirst({ where:{ courseId:course.id, title: t.match || t.title } });
    if(!topic) topic = await prisma.grammarTopic.findFirst({ where:{ courseId:course.id, title: t.title } });
    if(topic){
      await prisma.grammarTopic.update({ where:{id:topic.id}, data:{ title:t.title, titleTranslated:t.titleTranslated, explanation:t.explanation, emoji:t.emoji, cefrLevel:'A1', order } });
    } else {
      topic = await prisma.grammarTopic.create({ data:{ courseId:course.id, title:t.title, titleTranslated:t.titleTranslated, explanation:t.explanation, emoji:t.emoji, cefrLevel:'A1', order } });
    }
    order++;
    topicsTouched++;

    // wipe & reinsert content
    await prisma.grammarRule.deleteMany({ where:{ topicId: topic.id } });
    await prisma.grammarExample.deleteMany({ where:{ topicId: topic.id } });
    await prisma.grammarExercise.deleteMany({ where:{ topicId: topic.id } });

    let o=0; for(const r of (t.rules||[])){ await prisma.grammarRule.create({ data:{ topicId:topic.id, pattern:r.pattern, note:r.note||null, order:o++ } }); rulesIns++; }
    o=0; for(const e of (t.examples||[])){ await prisma.grammarExample.create({ data:{ topicId:topic.id, sentence:e.sentence, translation:e.translation, highlight:e.highlight||null, order:o++ } }); exIns++; }
    o=0; for(const x of (t.exercises||[])){ await prisma.grammarExercise.create({ data:{ topicId:topic.id, type:x.type, prompt:x.prompt, promptTranslated:x.promptTranslated||null, answer:x.answer, options:x.options??undefined, explanation:x.explanation||null, order:o++ } }); exerIns++; }

    // linkage
    if(t.link?.reuseExistingLessonForMatch){
      // already linked to lesson(s); nothing to create
    } else if(t.link && typeof t.link.moduleOrder==='number'){
      const mod = modByOrder[t.link.moduleOrder];
      if(!mod){ console.log(`  !! module order ${t.link.moduleOrder} not found for ${t.title}`); }
      else { const r = await ensureGrammarLesson(mod, t.link.lessonTitle, t.link.lessonTitleTranslated, t.emoji, topic.id); if(r.created) lessonsCreated++; }
    }
    console.log(`  ✓ ${t.title}  (r${(t.rules||[]).length}/e${(t.examples||[]).length}/x${(t.exercises||[]).length})`);
  }

  console.log('\n=== PHASE 2 SUMMARY ===');
  console.log(JSON.stringify({ topicsTouched, grammarLessonsCreated:lessonsCreated, rulesInserted:rulesIns, examplesInserted:exIns, exercisesInserted:exerIns }, null, 2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
