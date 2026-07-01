import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u)=> typeof u==='string' && u.trim().length>0;

// ── Official CEFR A1 targets (Cambridge/Oxford English Profile reference) ──
const TARGET = {
  vocabulary: 500,      // A1 productive vocabulary ~500 words
  grammar: 18,          // 18 core A1 structures
  reading: 10,          // short reading texts/tasks
  listening: 10,        // listening items (audio-backed)
  speaking: 10,         // dialogue/speaking scenarios
  writing: 8,           // guided writing tasks
  reallife: 12,         // real-life communication scenarios
};

async function main(){
  const c = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});

  const modules = await prisma.module.count({ where:{courseId:c.id} });
  const lessons = await prisma.lesson.findMany({ where:{module:{courseId:c.id}}, select:{skillType:true, words:{select:{id:true}}} });
  const bySkill = {}; for(const l of lessons) bySkill[l.skillType]=(bySkill[l.skillType]||0)+1;

  // vocabulary
  const words = await prisma.word.findMany({ where:{lesson:{module:{courseId:c.id}}}, select:{word:true,ipa:true,ipaTajik:true,translation:true,emoji:true,example:true,exampleTrans:true,audioUrl:true,partOfSpeech:true,frequencyRank:true} });
  const uniqueWords = new Set(words.map(w=>w.word.toLowerCase().trim())).size;
  const fullFields = words.filter(w=>has(w.ipa)&&has(w.ipaTajik)&&has(w.translation)&&has(w.emoji)&&has(w.example)&&has(w.exampleTrans)).length;

  // grammar
  const topics = await prisma.grammarTopic.findMany({ where:{courseId:c.id}, include:{exercises:true} });
  const topicsWithEx = topics.filter(t=>t.exercises.length>0).length;
  const grammarExercises = topics.reduce((a,t)=>a+t.exercises.length,0);

  // comprehension (reading vs listening)
  const comps = await prisma.comprehensionExercise.findMany({ where:{courseId:c.id}, include:{questions:true} });
  const reading = comps.filter(x=>x.kind==='reading');
  const listening = comps.filter(x=>x.kind==='listening');
  const compQuestions = comps.reduce((a,x)=>a+x.questions.length,0);

  // dialogues (speaking + real-life)
  const dialogues = await prisma.dialogue.findMany({ where:{courseId:c.id}, include:{lines:true} });
  const dialogueLines = dialogues.reduce((a,d)=>a+d.lines.length,0);

  // exams / reviews
  const examLessons = lessons.filter(l=>l.skillType==='test').length;
  const reviewLessons = lessons.filter(l=>l.skillType==='review').length;

  // writing: explicit writing lessons + productive grammar exercises (reorder/transform = writing practice)
  const writingLessons = lessons.filter(l=>l.skillType==='writing').length;
  const productiveEx = topics.reduce((a,t)=>a+t.exercises.filter(e=>e.type==='reorder'||e.type==='transform').length,0);

  // listening: audio-backed items
  const wordsAudio = words.filter(w=>has(w.audioUrl)).length;
  const dlAudio = (await prisma.dialogueLine.findMany({where:{dialogue:{courseId:c.id}},select:{audioUrl:true}})).filter(x=>has(x.audioUrl)).length;
  const listeningItems = listening.length + (dlAudio>0?1:0); // audio-backed listening surfaces

  // placement / descriptors
  const desc = await prisma.cefrDescriptor.count({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, cefrLevel:'A1' } });
  const placement = await prisma.placementQuestion.count({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, cefrLevel:'A1' } });

  // ── coverage % vs target (capped 100) ──
  const pct = (x,t)=> Math.min(100, Math.round(x/t*100));
  const cov = {
    vocabulary: pct(uniqueWords, TARGET.vocabulary),
    grammar:    pct(topicsWithEx, TARGET.grammar),
    reading:    pct(reading.length, TARGET.reading),
    listening:  pct(listeningItems, TARGET.listening),
    speaking:   pct(dialogues.length, TARGET.speaking),
    writing:    pct(writingLessons + Math.floor(productiveEx/8), TARGET.writing), // productive exercises as proxy
    reallife:   pct(dialogues.length, TARGET.reallife),
  };
  // overall weighted (CEFR weights skills roughly equally; vocab+grammar core)
  const W = { vocabulary:0.20, grammar:0.20, reading:0.13, listening:0.13, speaking:0.12, writing:0.10, reallife:0.12 };
  const overall = Object.entries(cov).reduce((a,[k,v])=>a+v*W[k],0);

  const R = {
    structure: { modules, lessons: lessons.length, bySkill, examLessons, reviewLessons, writingLessons },
    vocabulary: { total: words.length, unique: uniqueWords, fullSevenFields: fullFields, withAudio: wordsAudio },
    grammar: { topics: topics.length, topicsWithExercises: topicsWithEx, grammarExercises },
    reading: { exercises: reading.length, questions: reading.reduce((a,x)=>a+x.questions.length,0) },
    listening: { listeningComprehensions: listening.length, dialogueLinesWithAudio: dlAudio, audioBackedItems: listeningItems },
    speaking: { dialogues: dialogues.length, dialogueLines },
    writing: { writingLessons, productiveGrammarExercises: productiveEx },
    exams: { finalExams: examLessons, moduleReviews: reviewLessons },
    comprehensionQuestionsTotal: compQuestions,
    framework: { cefrDescriptorsA1: desc, placementA1: placement },
    TARGET,
    coveragePct: cov,
    overallA1Pct: Math.round(overall*10)/10,
  };
  console.log(JSON.stringify(R, null, 2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
