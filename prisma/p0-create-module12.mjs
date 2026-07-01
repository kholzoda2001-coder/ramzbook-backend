import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Module 12 (11th content module, order 10): Health & Real-Life Communication ───
const MODULE = { title: 'Module 11: Health And Real-Life Communication', titleTranslated: 'Модули 11: Тандурустӣ ва Муоширати Воқеӣ', emoji: '🏥', color: '#EF4444' };

const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans) =>
  ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans });

const VOCAB = {
  'Lesson 1: Body Parts': { tt: 'Дарси 1: Узвҳои бадан', emoji:'🧍', words: [
    W('Head','/hed/','ҳед','Сар','🗣️','My head hurts.','Сари ман дард мекунад.'),
    W('Eye','/aɪ/','ай','Чашм','👁️','I have two eyes.','Ман ду чашм дорам.'),
    W('Ear','/ɪər/','иер','Гӯш','👂','My ear is red.','Гӯши ман сурх аст.'),
    W('Nose','/nəʊz/','ноуз','Бинӣ','👃','Her nose is small.','Бинии ӯ хурд аст.'),
    W('Mouth','/maʊθ/','маус','Даҳон','👄','Open your mouth, please.','Лутфан даҳонатро кушо.'),
    W('Tooth','/tuːθ/','тус','Дандон','🦷','My tooth hurts.','Дандони ман дард мекунад.'),
    W('Hand','/hænd/','ҳэнд','Даст','✋','Wash your hands.','Дастҳоятро бишӯй.'),
    W('Arm','/ɑːm/','аам','Бозу','💪','His arm is strong.','Бозуи ӯ қавӣ аст.'),
    W('Leg','/leɡ/','лег','Пой (соқ)','🦵','My leg is tired.','Пои ман монда шуд.'),
    W('Foot','/fʊt/','фут','Пой (кафи по)','🦶','My foot hurts.','Кафи пои ман дард мекунад.'),
    W('Stomach','/ˈstʌmək/','стамак','Шикам','🩹','My stomach hurts.','Шиками ман дард мекунад.'),
    W('Back','/bæk/','бэк','Пушт','🔙','My back is sore.','Пушти ман дард мекунад.'),
  ]},
  'Lesson 2: Health Problems': { tt: 'Дарси 2: Мушкилоти саломатӣ', emoji:'🤒', words: [
    W('Sick','/sɪk/','сик','Бемор','🤢','I am sick today.','Ман имрӯз беморам.'),
    W('Ill','/ɪl/','ил','Бетоб','🤧','She is ill.','Ӯ бетоб аст.'),
    W('Pain','/peɪn/','пейн','Дард','😖','I have a pain here.','Дар ин ҷо дард дорам.'),
    W('Headache','/ˈhedeɪk/','ҳедэйк','Дарди сар','🤕','I have a headache.','Ман дарди сар дорам.'),
    W('Stomachache','/ˈstʌməkeɪk/','стамакэйк','Дарди шикам','😣','He has a stomachache.','Ӯ дарди шикам дорад.'),
    W('Toothache','/ˈtuːθeɪk/','тусэйк','Дарди дандон','😫','She has a toothache.','Ӯ дарди дандон дорад.'),
    W('Fever','/ˈfiːvə/','фивер','Таб','🌡️','I have a fever.','Ман таб дорам.'),
    W('Cough','/kɒf/','коф','Сулфа','😷','I have a cough.','Ман сулфа дорам.'),
    W('Cold','/kəʊld/','коулд','Шамолхӯрӣ','🥶','I have a cold.','Ман шамол хӯрдаам.'),
    W('Sore throat','/sɔː θrəʊt/','сор сроут','Гулударди','🗣️','I have a sore throat.','Гулӯи ман дард мекунад.'),
    W('Tired','/ˈtaɪəd/','тайерд','Монда','😴','I am very tired.','Ман хеле монда шудаам.'),
    W('Hurt','/hɜːt/','ҳёрт','Дард кардан','🤚','My arm hurts.','Бозуи ман дард мекунад.'),
  ]},
  'Lesson 3: Doctor Visit': { tt: 'Дарси 3: Ташрифи духтур', emoji:'🩺', words: [
    W('Doctor','/ˈdɒktə/','доктер','Духтур','👨‍⚕️','The doctor is here.','Духтур ин ҷост.'),
    W('Nurse','/nɜːs/','нёрс','Ҳамшира','👩‍⚕️','The nurse is kind.','Ҳамшира меҳрубон аст.'),
    W('Clinic','/ˈklɪnɪk/','клиник','Дармонгоҳ','🏥','I go to the clinic.','Ман ба дармонгоҳ меравам.'),
    W('Patient','/ˈpeɪʃənt/','пейшент','Бемор (мариз)','🛏️','The patient is resting.','Бемор истироҳат мекунад.'),
    W('Appointment','/əˈpɔɪntmənt/','эпойнтмент','Вохӯрии муайяншуда','📅','I have an appointment.','Ман вохӯрӣ дорам.'),
    W('Medicine','/ˈmedsɪn/','медсин','Дору','💊','Take this medicine.','Ин доруро гир.'),
    W('Prescription','/prɪˈskrɪpʃən/','прискрипшен','Дорунома','📝','The doctor writes a prescription.','Духтур дорунома менависад.'),
    W('Examine','/ɪɡˈzæmɪn/','игзэмин','Муоина кардан','🔍','The doctor examines me.','Духтур маро муоина мекунад.'),
    W('Healthy','/ˈhelθi/','ҳелси','Солим','💚','I am healthy now.','Ман ҳоло солим ҳастам.'),
    W('Rest','/rest/','рест','Истироҳат','🛌','You need rest.','Ту истироҳат лозим дорӣ.'),
  ]},
  'Lesson 4: Pharmacy': { tt: 'Дарси 4: Дорухона', emoji:'💊', words: [
    W('Pharmacist','/ˈfɑːməsɪst/','фаамесист','Дорусоз','🧑‍⚕️','The pharmacist helps me.','Дорусоз ба ман кӯмак мекунад.'),
    W('Pill','/pɪl/','пил','Ҳаб','💊','Take one pill a day.','Рӯзе як ҳаб гир.'),
    W('Tablet','/ˈtæblət/','тэблет','Лавҳача (дору)','💊','This tablet is white.','Ин лавҳача сафед аст.'),
    W('Syrup','/ˈsɪrəp/','сируп','Шарбати дору','🍯','The syrup is sweet.','Шарбат ширин аст.'),
    W('Bandage','/ˈbændɪdʒ/','бэндиҷ','Бандина','🩹','I need a bandage.','Ман бандина лозим дорам.'),
    W('Cream','/kriːm/','крим','Малҳам','🧴','Use this cream.','Ин малҳамро истифода бар.'),
    W('Drops','/drɒps/','дропс','Қатраҳо','💧','These are eye drops.','Инҳо қатраҳои чашм ҳастанд.'),
    W('Mask','/mɑːsk/','маск','Ниқоб','😷','Wear a mask, please.','Лутфан ниқоб пӯш.'),
    W('Thermometer','/θəˈmɒmɪtə/','сермометер','Ҳароратсанҷ','🌡️','Where is the thermometer?','Ҳароратсанҷ дар куҷост?'),
    W('Plaster','/ˈplɑːstə/','пластер','Лейкопластир','🩹','I have a plaster.','Ман лейкопластир дорам.'),
  ]},
  'Lesson 5: Emergency Situations': { tt: 'Дарси 5: Ҳолатҳои фавқулодда', emoji:'🚨', words: [
    W('Emergency','/ɪˈmɜːdʒənsi/','имёрҷенси','Фавқулодда','🚨','This is an emergency.','Ин ҳолати фавқулодда аст.'),
    W('Ambulance','/ˈæmbjələns/','эмбюленс','Ёрии таъҷилӣ','🚑','Call an ambulance!','Ёрии таъҷилиро ҷеғ зан!'),
    W('Help','/help/','ҳелп','Кӯмак','🆘','Help me, please!','Лутфан ба ман кӯмак кун!'),
    W('Accident','/ˈæksɪdənt/','эксидент','Садама','💥','There is an accident.','Як садама рӯй дод.'),
    W('Fire','/ˈfaɪə/','файер','Сӯхтор','🔥','There is a fire!','Сӯхтор аст!'),
    W('Call','/kɔːl/','кол','Занг задан','📞','Call the doctor.','Ба духтур занг зан.'),
    W('Danger','/ˈdeɪndʒə/','дейнҷер','Хатар','⚠️','It is dangerous here.','Ин ҷо хатарнок аст.'),
    W('Safe','/seɪf/','сейф','Бехатар','✅','Now I am safe.','Ҳоло ман бехатар ҳастам.'),
  ]},
};

const GRAMMAR = {
  title: 'Health: Asking for Help (Can / Have got / Question Formation)',
  titleTranslated: 'Тандурустӣ: Дархости кӯмак (Can / Have got / Савол)',
  emoji: '🩺',
  explanation:
`Дар ҳолатҳои саломатӣ грамматикаи A1-ро якҷоя истифода мебарем:
- **Can you help me?** — Метавонӣ ба ман кӯмак кунӣ? (Can)
- **I have got a headache.** — Ман дарди сар дорам. (have got)
- **What is the problem?** — Мушкилӣ чист? (савол)
- **I am taking medicine.** — Ман дору хӯрда истодаам. (Present Continuous)`,
  rules: [
    { pattern: 'Can you help me?', note: 'Дархости кӯмак бо Can.' },
    { pattern: 'I have got a + мушкилӣ', note: 'I have got a cough.' },
    { pattern: "What's wrong? / What is the problem?", note: 'Пурсиши мушкилӣ.' },
  ],
  examples: [
    { sentence: 'Can you help me?', translation: 'Метавонӣ ба ман кӯмак кунӣ?', highlight: 'Can' },
    { sentence: 'I have got a headache.', translation: 'Ман дарди сар дорам.', highlight: 'have got' },
    { sentence: 'What is the problem?', translation: 'Мушкилӣ чист?', highlight: 'What' },
    { sentence: 'She has got a fever.', translation: 'Ӯ таб дорад.', highlight: 'has got' },
    { sentence: 'I am taking medicine.', translation: 'Ман дору хӯрда истодаам.', highlight: 'am taking' },
  ],
  exercises: [
    { type:'choose', prompt:'___ you help me, please?', promptTranslated:'Дархости кӯмак.', options:['Can','Do','Are','Is'], answer:'Can', explanation:'Дархост → Can.' },
    { type:'choose', prompt:'I ___ got a cough.', promptTranslated:'Ман сулфа дорам.', options:['have','has','am','do'], answer:'have', explanation:'Бо I → have got.' },
    { type:'choose', prompt:'She ___ got a fever.', promptTranslated:'Ӯ таб дорад.', options:['have','has','is','do'], answer:'has', explanation:'Бо She → has got.' },
    { type:'fill_blank', prompt:'___ is the problem? — A headache.', promptTranslated:'Мушкилӣ чист?', answer:'What', explanation:'Пурсиш → What.' },
    { type:'fill_blank', prompt:'I am ___ medicine now. (take)', promptTranslated:'Ман дору хӯрда истодаам.', answer:'taking', explanation:'take → taking (Present Continuous).' },
    { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман дарди сар дорам.', options:['have','I','a','headache','got'], answer:'I have got a headache.', explanation:'I + have got + a + headache.' },
    { type:'transform', prompt:'Ислоҳ кунед: She have got a cold.', promptTranslated:'Шакл ғалат.', answer:'She has got a cold.', explanation:'Бо She → has got.' },
    { type:'transform', prompt:'Ба савол гузаронед: You can help me.', promptTranslated:'Хабарӣ → саволӣ.', answer:'Can you help me?', explanation:'Can-ро дар аввал гузор.' },
  ],
};

const DIALOGUE = {
  title: 'At the Doctor', titleTranslated: 'Назди духтур', emoji:'🩺',
  scenario: 'Бемор назди духтур меравад ва мушкилии худро мегӯяд.',
  lines: [
    { speaker:'Doctor', text:'Hello. What is the problem?', translation:'Салом. Мушкилӣ чист?', isUser:false },
    { speaker:'Patient', text:'I have got a headache and a fever.', translation:'Ман дарди сар ва таб дорам.', isUser:true },
    { speaker:'Doctor', text:'How long have you been sick?', translation:'Чанд вақт боз беморед?', isUser:false },
    { speaker:'Patient', text:'Since yesterday.', translation:'Аз дирӯз.', isUser:true },
    { speaker:'Doctor', text:'Open your mouth, please. Let me examine you.', translation:'Лутфан даҳонатонро кушоед. Бигзоред муоина кунам.', isUser:false },
    { speaker:'Patient', text:'OK. Is it serious?', translation:'Хуб. Ҷиддӣ аст?', isUser:true },
    { speaker:'Doctor', text:'No. Take this medicine and rest.', translation:'Не. Ин доруро гиред ва истироҳат кунед.', isUser:false },
    { speaker:'Patient', text:'Thank you, doctor.', translation:'Ташаккур, духтур.', isUser:true },
  ],
};

const REVIEW = {
  title: 'Module Review', titleTranslated: 'Такрори модул', emoji:'📖', kind:'reading',
  passage: 'Ali is sick. He has got a headache and a cough. He goes to the clinic. The doctor examines him. The doctor writes a prescription. Ali buys medicine at the pharmacy. He goes home and rests. Now Ali is healthy.',
  passageTranslated: 'Алӣ бемор аст. Ӯ дарди сар ва сулфа дорад. Ӯ ба дармонгоҳ меравад. Духтур ӯро муоина мекунад. Духтур дорунома менависад. Алӣ дар дорухона дору мехарад. Ӯ ба хона рафта истироҳат мекунад. Ҳоло Алӣ солим аст.',
  questions: [
    { question:'What is wrong with Ali?', questionTranslated:'Алӣ чӣ мушкилӣ дорад?', options:['A headache and a cough','A toothache','A stomachache','Nothing'], correctIndex:0, explanation:'Матн: headache and a cough.' },
    { question:'Where does Ali go?', questionTranslated:'Алӣ ба куҷо меравад?', options:['To school','To the clinic','To the park','To the store'], correctIndex:1, explanation:'Матн: he goes to the clinic.' },
    { question:'Where does Ali buy medicine?', questionTranslated:'Алӣ дору аз куҷо мехарад?', options:['At the clinic','At home','At the pharmacy','At the market'], correctIndex:2, explanation:'Матн: at the pharmacy.' },
  ],
};

const EXAM = {
  title: 'Final Exam', titleTranslated: 'Имтиҳони ниҳоӣ', emoji:'🏆', kind:'reading',
  passage: 'Sara has got a toothache. She calls the clinic and makes an appointment. The nurse is kind. The doctor examines her tooth and gives her medicine. "Take one pill a day and rest," says the doctor. Sara feels better now.',
  passageTranslated: 'Сара дарди дандон дорад. Ӯ ба дармонгоҳ занг зада, вохӯрӣ таъин мекунад. Ҳамшира меҳрубон аст. Духтур дандони ӯро муоина карда, ба ӯ дору медиҳад. «Рӯзе як ҳаб гиред ва истироҳат кунед», мегӯяд духтур. Ҳоло Сара худро беҳтар ҳис мекунад.',
  questions: [
    { question:'What problem has Sara got?', questionTranslated:'Сара чӣ мушкилӣ дорад?', options:['A headache','A toothache','A fever','A cold'], correctIndex:1, explanation:'Матн: a toothache.' },
    { question:'Who is kind?', questionTranslated:'Кӣ меҳрубон аст?', options:['The doctor','The pharmacist','The nurse','The patient'], correctIndex:2, explanation:'Матн: the nurse is kind.' },
    { question:'How many pills a day?', questionTranslated:'Рӯзе чанд ҳаб?', options:['One','Two','Three','Four'], correctIndex:0, explanation:'Матн: one pill a day.' },
    { question:'How does Sara feel now?', questionTranslated:'Сара ҳоло чӣ хел аст?', options:['Worse','The same','Better','Sick'], correctIndex:2, explanation:'Матн: feels better now.' },
  ],
};

async function main(){
  const course = await prisma.course.findFirst({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, level:'A1' }});

  // QC: existing unique vocab to prevent duplicates
  const existing = new Set((await prisma.word.findMany({ where:{ lesson:{ module:{ courseId:course.id } } }, select:{word:true} })).map(w=>w.word.toLowerCase().trim()));
  const dupCheck = [];
  for(const ls of Object.values(VOCAB)) for(const w of ls.words){ if(existing.has(w.word.toLowerCase().trim())) dupCheck.push(w.word); }
  if(dupCheck.length){ console.log('⚠️ DUPLICATE VOCAB vs existing course:', dupCheck); }

  // idempotent: if module exists, wipe its lessons + linked content
  let mod = await prisma.module.findFirst({ where:{ courseId:course.id, title:MODULE.title } });
  if(mod){
    const ls = await prisma.lesson.findMany({ where:{moduleId:mod.id}, select:{id:true,grammarTopicId:true,dialogueId:true,comprehensionId:true} });
    for(const l of ls){
      if(l.grammarTopicId) await prisma.grammarTopic.delete({where:{id:l.grammarTopicId}}).catch(()=>{});
      if(l.dialogueId) await prisma.dialogue.delete({where:{id:l.dialogueId}}).catch(()=>{});
      if(l.comprehensionId) await prisma.comprehensionExercise.delete({where:{id:l.comprehensionId}}).catch(()=>{});
    }
    await prisma.lesson.deleteMany({ where:{moduleId:mod.id} });
    await prisma.module.update({ where:{id:mod.id}, data:{ ...MODULE } });
  } else {
    const maxOrder = (await prisma.module.aggregate({ where:{courseId:course.id}, _max:{order:true} }))._max.order ?? -1;
    mod = await prisma.module.create({ data:{ courseId:course.id, ...MODULE, order:maxOrder+1, isActive:true } });
  }

  const XP = { vocabulary:15, grammar:20, reading:20, speaking:20, review:30, test:50 };
  let order = 0, wordsCreated = 0;

  // 1-5: vocab lessons
  for(const [title, data] of Object.entries(VOCAB)){
    const lesson = await prisma.lesson.create({ data:{ moduleId:mod.id, title, titleTranslated:data.tt, type:'vocab', skillType:'vocabulary', cefrLevel:'A1', emoji:data.emoji, xpReward:XP.vocabulary, duration:5, order:order++ } });
    let wo=0;
    for(const w of data.words){
      await prisma.word.create({ data:{ lessonId:lesson.id, word:w.word, translation:w.translation, emoji:w.emoji, ipa:w.ipa, ipaTajik:w.ipaTajik, example:w.example, exampleTrans:w.exampleTrans, partOfSpeech:'noun', frequencyRank:2000+wordsCreated, order:wo++ } });
      wordsCreated++;
    }
  }

  // 6: grammar builder
  const topic = await prisma.grammarTopic.create({ data:{ courseId:course.id, cefrLevel:'A1', title:GRAMMAR.title, titleTranslated:GRAMMAR.titleTranslated, explanation:GRAMMAR.explanation, emoji:GRAMMAR.emoji, order:50 } });
  let go=0; for(const r of GRAMMAR.rules) await prisma.grammarRule.create({ data:{ topicId:topic.id, pattern:r.pattern, note:r.note, order:go++ } });
  go=0; for(const e of GRAMMAR.examples) await prisma.grammarExample.create({ data:{ topicId:topic.id, sentence:e.sentence, translation:e.translation, highlight:e.highlight, order:go++ } });
  go=0; for(const x of GRAMMAR.exercises) await prisma.grammarExercise.create({ data:{ topicId:topic.id, type:x.type, prompt:x.prompt, promptTranslated:x.promptTranslated, answer:x.answer, options:x.options??undefined, explanation:x.explanation, order:go++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 6: Grammar Builder', titleTranslated:'Дарси 6: Сохтмони грамматикӣ', type:'grammar', skillType:'grammar', cefrLevel:'A1', emoji:'🩺', xpReward:XP.grammar, duration:5, order:order++, grammarTopicId:topic.id } });

  // 7: doctor conversation (dialogue)
  const dlg = await prisma.dialogue.create({ data:{ courseId:course.id, cefrLevel:'A1', title:DIALOGUE.title, titleTranslated:DIALOGUE.titleTranslated, scenario:DIALOGUE.scenario, emoji:DIALOGUE.emoji, order:50 } });
  let lo=0; for(const ln of DIALOGUE.lines) await prisma.dialogueLine.create({ data:{ dialogueId:dlg.id, speaker:ln.speaker, text:ln.text, translation:ln.translation, isUser:ln.isUser, order:lo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 7: Doctor Conversation', titleTranslated:'Дарси 7: Муколамаи духтур', type:'vocab', skillType:'speaking', cefrLevel:'A1', emoji:'🗣️', xpReward:XP.speaking, duration:5, order:order++, dialogueId:dlg.id } });

  // 8: module review (reading comprehension)
  const rev = await prisma.comprehensionExercise.create({ data:{ courseId:course.id, cefrLevel:'A1', kind:REVIEW.kind, title:REVIEW.title, titleTranslated:REVIEW.titleTranslated, passage:REVIEW.passage, passageTranslated:REVIEW.passageTranslated, emoji:REVIEW.emoji, order:50 } });
  let qo=0; for(const q of REVIEW.questions) await prisma.comprehensionQuestion.create({ data:{ exerciseId:rev.id, question:q.question, questionTranslated:q.questionTranslated, options:q.options, correctIndex:q.correctIndex, explanation:q.explanation, order:qo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 8: Module Review', titleTranslated:'Дарси 8: Такрори модул', type:'quiz', skillType:'review', cefrLevel:'A1', emoji:'📖', xpReward:XP.review, duration:5, order:order++, comprehensionId:rev.id } });

  // 9: final exam (reading comprehension)
  const exam = await prisma.comprehensionExercise.create({ data:{ courseId:course.id, cefrLevel:'A1', kind:EXAM.kind, title:EXAM.title, titleTranslated:EXAM.titleTranslated, passage:EXAM.passage, passageTranslated:EXAM.passageTranslated, emoji:EXAM.emoji, order:51 } });
  qo=0; for(const q of EXAM.questions) await prisma.comprehensionQuestion.create({ data:{ exerciseId:exam.id, question:q.question, questionTranslated:q.questionTranslated, options:q.options, correctIndex:q.correctIndex, explanation:q.explanation, order:qo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 9: Final Exam', titleTranslated:'Дарси 9: Имтиҳони ниҳоӣ', type:'quiz', skillType:'test', cefrLevel:'A1', emoji:'🏆', xpReward:XP.test, duration:5, order:order++, comprehensionId:exam.id } });

  console.log('=== MODULE 12 (order '+mod.order+') CREATED ===');
  console.log(JSON.stringify({ module:MODULE.title, lessons:order, newWords:wordsCreated, duplicates:dupCheck.length, grammarExercises:GRAMMAR.exercises.length, dialogueLines:DIALOGUE.lines.length, reviewQ:REVIEW.questions.length, examQ:EXAM.questions.length }, null, 2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
