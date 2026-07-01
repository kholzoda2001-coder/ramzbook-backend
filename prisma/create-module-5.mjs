import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 5
  const mod5 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 5: Daily Routines & Actions",
      titleTranslated: "Модули 5: Корҳои рӯзмарра ва Амалҳо",
      emoji: "🏃",
      order: 5,
      isPremium: false,
    }
  });

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Morning Routine", titleTranslated: "Дарси 1: Корҳои субҳ", emoji: "🌅", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: Work & School", titleTranslated: "Дарси 2: Кор ва Мактаб", emoji: "💼", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Evening Routine", titleTranslated: "Дарси 3: Корҳои шом", emoji: "🌙", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Free Time", titleTranslated: "Дарси 4: Вақти холӣ", emoji: "⚽", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Present Simple (I, You, We, They)", titleTranslated: "Дарси 5: Замони ҳозираи оддӣ 1", emoji: "📝", type: "grammar", skillType: "grammar", order: 5 },
    { title: "Lesson 6: Present Simple (He, She, It)", titleTranslated: "Дарси 6: Замони ҳозираи оддӣ 2", emoji: "📝", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Daily Routine Builder", titleTranslated: "Дарси 7: Сохтмони корҳои рӯзмарра", emoji: "📖", type: "reading", skillType: "reading", order: 7 },
    { title: "Lesson 8: Conversation Practice", titleTranslated: "Дарси 8: Таҷрибаи гуфтугӯ", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod5.id, ...ld }
    });
    lessons.push(l);
  }

  // 3. Insert Vocabulary
  const vocabLists = [
    // L1
    [
      { word: "Wake up", ipa: "/weɪk ʌp/", ipaTajik: "Вэйк ап", translation: "Бедор шудан", emoji: "🥱", example: "I Wake Up Early.", exampleTrans: "Ман Барвақт Бедор Мешавам." },
      { word: "Get up", ipa: "/ɡet ʌp/", ipaTajik: "Гет ап", translation: "Аз ҷой хестан", emoji: "🛏️", example: "I Get Up At 7 O'Clock.", exampleTrans: "Ман Соати 7 Аз Ҷой Мехезам." },
      { word: "Wash", ipa: "/wɒʃ/", ipaTajik: "Вош", translation: "Шустан", emoji: "🧼", example: "I Wash My Face.", exampleTrans: "Ман Рӯямро Мешӯям." },
      { word: "Brush", ipa: "/brʌʃ/", ipaTajik: "Браш", translation: "Мисвок кардан", emoji: "🪥", example: "I Brush My Teeth.", exampleTrans: "Ман Дандонҳоямро Мисвок Мекунам." },
      { word: "Eat", ipa: "/iːt/", ipaTajik: "Иит", translation: "Хӯрдан", emoji: "🍽️", example: "I Eat Breakfast.", exampleTrans: "Ман Наҳорӣ Мехӯрам." },
      { word: "Breakfast", ipa: "/ˈbrek.fəst/", ipaTajik: "Брекфаст", translation: "Наҳорӣ", emoji: "🍳", example: "Breakfast Is Good.", exampleTrans: "Наҳорӣ Нағз Аст." },
      { word: "Go", ipa: "/ɡəʊ/", ipaTajik: "Гоу", translation: "Рафтан", emoji: "🚶", example: "I Go To School.", exampleTrans: "Ман Ба Мактаб Меравам." },
    ],
    // L2
    [
      { word: "Work", ipa: "/wɜːk/", ipaTajik: "Ворк", translation: "Кор кардан", emoji: "💼", example: "I Work Every Day.", exampleTrans: "Ман Ҳар Рӯз Кор Мекунам." },
      { word: "Study", ipa: "/ˈstʌd.i/", ipaTajik: "Стади", translation: "Хондан / Омӯхтан", emoji: "📚", example: "I Study English.", exampleTrans: "Ман Англисиро Меомӯзам." },
      { word: "Read", ipa: "/riːd/", ipaTajik: "Риид", translation: "Китоб хондан", emoji: "📖", example: "I Read A Book.", exampleTrans: "Ман Китоб Мехонам." },
      { word: "Write", ipa: "/raɪt/", ipaTajik: "Райт", translation: "Навиштан", emoji: "✍️", example: "I Write A Letter.", exampleTrans: "Ман Мақтуб Менависам." },
      { word: "Listen", ipa: "/ˈlɪs.ən/", ipaTajik: "Лисн", translation: "Гӯш кардан", emoji: "🎧", example: "I Listen To Music.", exampleTrans: "Ман Мусиқӣ Гӯш Мекунам." },
      { word: "School", ipa: "/skuːl/", ipaTajik: "Скул", translation: "Мактаб", emoji: "🏫", example: "The School Is Big.", exampleTrans: "Мактаб Калон Аст." },
      { word: "Office", ipa: "/ˈɒf.ɪs/", ipaTajik: "Офис", translation: "Идора", emoji: "🏢", example: "He Is In The Office.", exampleTrans: "Ӯ Дар Идора Аст." },
    ],
    // L3
    [
      { word: "Come", ipa: "/kʌm/", ipaTajik: "Кам", translation: "Омадан", emoji: "🚶‍♂️", example: "I Come Home.", exampleTrans: "Ман Ба Хона Меоям." },
      { word: "Cook", ipa: "/kʊk/", ipaTajik: "Кук", translation: "Пухтан", emoji: "🍳", example: "My Mother Cooks Dinner.", exampleTrans: "Модарам Хӯроки Шом Мепазад." },
      { word: "Dinner", ipa: "/ˈdɪn.ər/", ipaTajik: "Динэр", translation: "Хӯроки шом", emoji: "🍲", example: "Dinner Is Ready.", exampleTrans: "Хӯроки Шом Омода Аст." },
      { word: "Watch", ipa: "/wɒtʃ/", ipaTajik: "Воч", translation: "Тамошо кардан", emoji: "📺", example: "I Watch TV.", exampleTrans: "Ман Телевизор Тамошо Мекунам." },
      { word: "Sleep", ipa: "/sliːp/", ipaTajik: "Слип", translation: "Хоб рафтан", emoji: "😴", example: "I Sleep At Night.", exampleTrans: "Ман Шаб Хоб Меравам." },
      { word: "Bed", ipa: "/bed/", ipaTajik: "Бед", translation: "Бистар", emoji: "🛏️", example: "I Go To Bed.", exampleTrans: "Ман Ба Бистар Меравам." },
    ],
    // L4
    [
      { word: "Play", ipa: "/pleɪ/", ipaTajik: "Плэй", translation: "Бозӣ кардан", emoji: "⚽", example: "We Play Football.", exampleTrans: "Мо Футбол Бозӣ Мекунем." },
      { word: "Run", ipa: "/rʌn/", ipaTajik: "Ран", translation: "Давидан", emoji: "🏃", example: "I Run Fast.", exampleTrans: "Ман Тез Медавам." },
      { word: "Walk", ipa: "/wɔːk/", ipaTajik: "Вок", translation: "Қадам задан", emoji: "🚶‍♀️", example: "I Walk In The Park.", exampleTrans: "Ман Дар Парк Қадам Мезанам." },
      { word: "Swim", ipa: "/swɪm/", ipaTajik: "Свим", translation: "Шиноварӣ кардан", emoji: "🏊", example: "I Swim In The Pool.", exampleTrans: "Ман Дар Ҳавз Шиноварӣ Мекунам." },
      { word: "Music", ipa: "/ˈmjuː.zɪk/", ipaTajik: "Мюзик", translation: "Мусиқӣ", emoji: "🎵", example: "I Like Music.", exampleTrans: "Ман Мусиқиро Нағз Мебинам." },
      { word: "Game", ipa: "/ɡeɪm/", ipaTajik: "Гейм", translation: "Бозӣ", emoji: "🎮", example: "This Game Is Fun.", exampleTrans: "Ин Бозӣ Шавқовар Аст." },
    ],
    // L5 (Grammar Vocab)
    [
      { word: "Do", ipa: "/duː/", ipaTajik: "Ду", translation: "Иҷро кардан", emoji: "✔️", example: "I Do My Homework.", exampleTrans: "Ман Вазифаи Хонагиамро Иҷро Мекунам." },
      { word: "Make", ipa: "/meɪk/", ipaTajik: "Мэйк", translation: "Сохтан / Омода кардан", emoji: "🛠️", example: "I Make Breakfast.", exampleTrans: "Ман Наҳорӣ Омода Мекунам." },
      { word: "Like", ipa: "/laɪk/", ipaTajik: "Лайк", translation: "Нағз дидан", emoji: "👍", example: "I Like Apples.", exampleTrans: "Ман Себро Нағз Мебинам." },
      { word: "Want", ipa: "/wɒnt/", ipaTajik: "Вонт", translation: "Хостан", emoji: "💭", example: "I Want Water.", exampleTrans: "Ман Об Мехоҳам." },
    ]
  ];

  for (let i = 0; i < 5; i++) {
    const list = vocabLists[i];
    const lesson = lessons[i];
    for (let j = 0; j < list.length; j++) {
      await prisma.word.create({
        data: {
          lessonId: lesson.id,
          order: j + 1,
          ...list[j]
        }
      });
    }
  }

  // 4. Grammar Topics
  const g1 = await prisma.grammarTopic.create({
    data: {
      courseId: course.id,
      title: "Present Simple (I, You, We, They)",
      titleTranslated: "Замони ҳозираи оддӣ (I, You, We, They)",
      explanation: "Барои сохтани ҷумла дар замони ҳозираи оддӣ бо ҷонишинҳои I, You, We, They, мо танҳо шакли асосии феълро истифода мебарем.\nМасалан:\nI work. (Ман кор мекунам.)\nYou play. (Шумо бозӣ мекунед.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[4].id }, data: { grammarTopicId: g1.id } });

  const g2 = await prisma.grammarTopic.create({
    data: {
      courseId: course.id,
      title: "Present Simple (He, She, It)",
      titleTranslated: "Замони ҳозираи оддӣ (He, She, It)",
      explanation: "Бо ҷонишинҳои He, She, It дар замони ҳозираи оддӣ ба охири феъл ҳарфи 's' ё 'es' илова карда мешавад.\nМасалан:\nHe works. (Ӯ кор мекунад.)\nShe plays. (Ӯ бозӣ мекунад.)\nIt sleeps. (Он хоб меравад.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g2.id } });

  // 5. Comprehension Exercises (Lesson 7, 9)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Reading Practice", titleTranslated: "Таҷрибаи Хониш", cefrLevel: "A1",
      passage: "Every morning, I wake up at seven o'clock. I wash my face and brush my teeth. I eat breakfast and go to school. I study English.",
      passageTranslated: "Ҳар саҳар, ман соати ҳафт бедор мешавам. Ман рӯямро мешӯям ва дандонҳоямро мисвок мекунам. Ман наҳорӣ мехӯрам ва ба мактаб меравам. Ман Англисиро меомӯзам.",
      questions: {
        create: [
          { question: "What time does he wake up?", correctIndex: 1, options: ["Eight o'clock", "Seven o'clock", "Nine o'clock"], order: 0 },
          { question: "What does he do after breakfast?", correctIndex: 2, options: ["He sleeps", "He plays", "He goes to school"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { comprehensionId: comp1.id } });

  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Final Exam for Module 5. Test your knowledge of verbs and daily routines.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 5. Дониши худро оид ба феълҳо ва корҳои рӯзмарра санҷед.",
      questions: {
        create: [
          { question: "Translate 'Ман китоб мехонам':", correctIndex: 0, options: ["I read a book.", "I write a book.", "I study a book."], order: 0 },
          { question: "Choose the correct verb for 'He':", correctIndex: 2, options: ["Work", "Working", "Works"], order: 1 },
          { question: "Translate 'Бедор шудан':", correctIndex: 1, options: ["Sleep", "Wake up", "Walk"], order: 2 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp2.id } });

  // 6. Dialogue (Lesson 8)
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "My Daily Routine", titleTranslated: "Корҳои рӯзмарраи ман", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "Ali", text: "Hi, Umar! What time do you wake up?", translation: "Салом Умар! Ту соати чанд бедор мешавӣ?", audioUrl: "", order: 0 },
          { speaker: "Umar", text: "I wake up at seven o'clock.", translation: "Ман соати ҳафт бедор мешавам.", audioUrl: "", order: 1 },
          { speaker: "Ali", text: "Do you play football?", translation: "Оё ту футбол бозӣ мекунӣ?", audioUrl: "", order: 2 },
          { speaker: "Umar", text: "Yes, I play football in the evening.", translation: "Бале, ман бегоҳӣ футбол бозӣ мекунам.", audioUrl: "", order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { dialogueId: d1.id } });

  console.log("Module 5 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
