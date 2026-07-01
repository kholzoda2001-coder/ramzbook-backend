import { PrismaClient } from '@prisma/client';
const p=new PrismaClient();
const c=await p.course.findFirst({where:{targetLanguage:{code:'en'},nativeLanguage:{code:'tg'},level:'A1'}});
const m=await p.module.findFirst({where:{courseId:c.id,order:0},include:{lessons:{orderBy:{order:'asc'}}}});
const l9=m.lessons[m.lessons.length-1];

// 1. lesson → real graded final exam
await p.lesson.update({where:{id:l9.id},data:{
  title:'Final Exam', titleTranslated:'Имтиҳони ниҳоӣ', type:'quiz', skillType:'test', xpReward:50, cefrLevel:'A1'
}});

// 2. real A1 passage (uses Module 1 vocab + basic to-be/pronouns)
const passage = "Hello! My name is Ali. I am a boy. This is my friend Sara. She is a girl. Sara is my friend. Good morning, teacher!";
const passageTr = "Салом! Номи ман Алӣ аст. Ман писар ҳастам. Ин дӯсти ман Сара аст. Ӯ духтар аст. Сара дӯсти ман аст. Субҳ ба хайр, муаллим!";
await p.comprehensionExercise.update({where:{id:l9.comprehensionId},data:{
  title:'Final Exam', titleTranslated:'Имтиҳони ниҳоӣ', kind:'reading', emoji:'🏆',
  passage, passageTranslated:passageTr,
}});

// 3. replace questions with 8 (reading + vocab + grammar)
await p.comprehensionQuestion.deleteMany({where:{exerciseId:l9.comprehensionId}});
const Q=[
  {question:"What is the boy's name?", questionTranslated:"Номи писар чист?", options:["Sara","Ali","Karim"], correctIndex:1, explanation:"Матн: My name is Ali."},
  {question:"Is Sara a boy or a girl?", questionTranslated:"Сара писар аст ё духтар?", options:["A boy","A girl","A man"], correctIndex:1, explanation:"Матн: She is a girl."},
  {question:"Who is Sara?", questionTranslated:"Сара кист?", options:["His teacher","His friend","His sister"], correctIndex:1, explanation:"Матн: Sara is my friend."},
  {question:"How do you say 'Салом' in English?", questionTranslated:"«Салом» ба англисӣ?", options:["Goodbye","Hello","Please"], correctIndex:1, explanation:"Салом = Hello."},
  {question:"'Ташаккур' in English is:", questionTranslated:"«Ташаккур» ба англисӣ?", options:["Sorry","Please","Thank you"], correctIndex:2, explanation:"Ташаккур = Thank you."},
  {question:"Complete: I ___ a student.", questionTranslated:"Феъли to be: I ___", options:["is","am","are"], correctIndex:1, explanation:"Бо I → am."},
  {question:"Sara is a girl. ___ is happy.", questionTranslated:"Ҷонишин барои зан?", options:["He","She","It"], correctIndex:1, explanation:"зан → She."},
  {question:"What does 'Goodbye' mean?", questionTranslated:"«Goodbye» чӣ маъно дорад?", options:["Салом","Хайр","Бале"], correctIndex:1, explanation:"Goodbye = Хайр."},
];
let o=0; for(const q of Q) await p.comprehensionQuestion.create({data:{exerciseId:l9.comprehensionId,...q,order:o++}});

console.log('L9 → Имтиҳони ниҳоӣ (test), '+Q.length+' савол, остонаи 80% фаъол.');
console.log('Барои гузаштан: ≥7/8 дуруст (87.5%); 6/8=75% → нагузашт.');
await p.$disconnect();
