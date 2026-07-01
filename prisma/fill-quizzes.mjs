import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } }
      }
    }
  });

  if (!course) return;

  const data = [
    // Module 1: Lesson 8 (Review + Exam)
    {
      modIdx: 0, lessonIdx: 7, type: "quiz", skillType: "review",
      passage: "Review of Module 1: Greetings, Polite Words, and Introductions.",
      passageTranslated: "Такрори Модули 1: Саломҳо, Калимаҳои Эҳтиромона ва Муаррифӣ.",
      questions: [
        { text: "How do you say 'Салом' in English?", options: ["Goodbye", "Hello", "Sorry"], correct: 1 },
        { text: "What is the translation of 'Thank You'?", options: ["Лутфан", "Ташаккур", "Мебахшед"], correct: 1 },
        { text: "Choose the correct pronoun for 'Ман':", options: ["He", "She", "I"], correct: 2 }
      ]
    },
    // Module 2: Lesson 6 (Personal Info Builder)
    {
      modIdx: 1, lessonIdx: 5, type: "quiz", skillType: "reading",
      passage: "My name is Rustam. I am from Tajikistan. I live in Dushanbe. I speak Tajik and English.",
      passageTranslated: "Номи ман Рустам аст. Ман аз Тоҷикистон ҳастам. Ман дар Душанбе зиндагӣ мекунам. Ман бо забонҳои тоҷикӣ ва англисӣ гап мезанам.",
      questions: [
        { text: "Where is Rustam from?", options: ["America", "Tajikistan", "England"], correct: 1 },
        { text: "What languages does he speak?", options: ["Tajik and Russian", "English and Russian", "Tajik and English"], correct: 2 }
      ]
    },
    // Module 2: Lesson 8 (Review)
    {
      modIdx: 1, lessonIdx: 7, type: "quiz", skillType: "review",
      passage: "Review of Module 2: Ages, Numbers 1-20, Countries, Cities, and Languages.",
      passageTranslated: "Такрори Модули 2: Синну сол, Рақамҳои 1-20, Кишварҳо, Шаҳрҳо ва Забонҳо.",
      questions: [
        { text: "How do you ask 'Шумо аз куҷо ҳастед?'", options: ["Where are you from?", "How old are you?", "What is your name?"], correct: 0 },
        { text: "Which word means 'Шаҳр'?", options: ["Country", "Place", "City"], correct: 2 }
      ]
    },
    // Module 2: Lesson 9 (Final Exam)
    {
      modIdx: 1, lessonIdx: 8, type: "quiz", skillType: "test",
      passage: "Final Exam for Module 2. Test your knowledge of personal information.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 2. Дониши худро оид ба маълумоти шахсӣ санҷед.",
      questions: [
        { text: "Translate 'Ман бистсола ҳастам':", options: ["I am twenty years old.", "I am ten years old.", "I have twenty years."], correct: 0 },
        { text: "Translate 'Забон':", options: ["Country", "Language", "City"], correct: 1 },
        { text: "Translate 'Ман Англисиро меомӯзам':", options: ["I speak English.", "I live in England.", "I learn English."], correct: 2 }
      ]
    },
    // Module 3: Lesson 6 (Family Builder)
    {
      modIdx: 2, lessonIdx: 5, type: "quiz", skillType: "reading",
      passage: "This is my family. My father is tall and strong. My mother is nice. I have one brother and one sister.",
      passageTranslated: "Ин оилаи ман аст. Падари ман қадбаланд ва қувватманд аст. Модари ман нағз аст. Ман як бародар ва як хоҳар дорам.",
      questions: [
        { text: "How is the father described?", options: ["Short and happy", "Tall and strong", "Young and nice"], correct: 1 },
        { text: "How many brothers does the person have?", options: ["One", "Two", "Three"], correct: 0 }
      ]
    },
    // Module 3: Lesson 8 (Review)
    {
      modIdx: 2, lessonIdx: 7, type: "quiz", skillType: "review",
      passage: "Review of Module 3: Family, Relatives, and Descriptions.",
      passageTranslated: "Такрори Модули 3: Оила, Хешовандон ва Тавсифҳо.",
      questions: [
        { text: "What does 'Grandfather' mean?", options: ["Падар", "Бобо", "Амак"], correct: 1 },
        { text: "Translate 'Қадпаст':", options: ["Tall", "Strong", "Short"], correct: 2 }
      ]
    },
    // Module 3: Lesson 9 (Final Exam)
    {
      modIdx: 2, lessonIdx: 8, type: "quiz", skillType: "test",
      passage: "Final Exam for Module 3. Test your knowledge of family and adjectives.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 3. Дониши худро оид ба оила ва сифатҳо санҷед.",
      questions: [
        { text: "Translate 'Ӯ бародари ман аст':", options: ["He is my friend.", "He is my brother.", "She is my sister."], correct: 1 },
        { text: "Translate 'Кӯдак хушбахт аст':", options: ["The child is happy.", "The baby is small.", "The boy is sad."], correct: 0 },
        { text: "Which word means 'Хешовандон / Амакбача'?", options: ["Nephew", "Niece", "Cousin"], correct: 2 }
      ]
    },
    // Module 4: Lesson 7 (Time Builder)
    {
      modIdx: 3, lessonIdx: 6, type: "quiz", skillType: "reading",
      passage: "Today is Monday. It is eight o'clock in the morning. My birthday is in July.",
      passageTranslated: "Имрӯз Душанбе аст. Соат ҳашти субҳ аст. Зодрӯзи ман дар Июл аст.",
      questions: [
        { text: "What day is today?", options: ["Tuesday", "Monday", "Sunday"], correct: 1 },
        { text: "What time is it?", options: ["Eight o'clock", "Nine o'clock", "Ten o'clock"], correct: 0 },
        { text: "In which month is the birthday?", options: ["June", "July", "August"], correct: 1 }
      ]
    },
    // Module 4: Lesson 9 (Final Exam)
    {
      modIdx: 3, lessonIdx: 8, type: "quiz", skillType: "test",
      passage: "Final Exam for Module 4. Test your knowledge of numbers, days, and time.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 4. Дониши худро оид ба рақамҳо, рӯзҳо ва вақт санҷед.",
      questions: [
        { text: "Translate 'Ҳаштод':", options: ["Eighty", "Ninety", "Eighteen"], correct: 0 },
        { text: "Translate 'Чоршанбе':", options: ["Tuesday", "Wednesday", "Thursday"], correct: 1 },
        { text: "Translate 'Шаб ба хайр':", options: ["Good afternoon", "Good evening", "Good night"], correct: 2 }
      ]
    }
  ];

  let addedCount = 0;

  for (const item of data) {
    const mod = course.modules[item.modIdx];
    if (!mod) continue;
    const lesson = mod.lessons[item.lessonIdx];
    if (!lesson) continue;

    console.log(`Processing Module ${item.modIdx + 1}, Lesson: ${lesson.title}`);

    // Create ComprehensionExercise
    const comp = await prisma.comprehensionExercise.create({
      data: {
        courseId: course.id,
        cefrLevel: "A1",
        title: item.type === 'quiz' ? "Quiz / Review" : "Reading Practice",
        titleTranslated: item.type === 'quiz' ? "Санҷиш / Такрор" : "Таҷрибаи Хониш",
        passage: item.passage,
        passageTranslated: item.passageTranslated,
        questions: {
          create: item.questions.map((q, qIdx) => ({
            question: q.text,
            options: q.options,
            correctIndex: q.correct,
            order: qIdx
          }))
        }
      }
    });

    // Update lesson
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        type: item.type,
        skillType: item.skillType,
        comprehensionId: comp.id
      }
    });

    addedCount++;
    console.log(`-> Added quiz and updated lesson to ${item.skillType}`);
  }

  console.log(`\nSuccessfully created ${addedCount} quizzes/comprehension exercises.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
