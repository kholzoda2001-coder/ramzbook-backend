import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  // The 4 dialogues corresponding to the 4 modules
  const dialoguesData = [
    {
      moduleIndex: 0,
      lessonIndex: 6, // Lesson 7 (0-indexed)
      title: "Conversation Practice",
      titleTranslated: "Таҷрибаи Гуфтугӯ",
      emoji: "🗣️",
      scenario: "Basic greetings and introductions.",
      lines: [
        { speaker: "Person A", text: "Hello.", translation: "Салом.", isUser: false },
        { speaker: "Person B", text: "Hello.", translation: "Салом.", isUser: true },
        { speaker: "Person A", text: "How Are You?", translation: "Шумо Чӣ Хел Ҳастед?", isUser: false },
        { speaker: "Person B", text: "I Am Fine, Thank You.", translation: "Ман Хубам, Ташаккур.", isUser: true },
        { speaker: "Person A", text: "What Is Your Name?", translation: "Номи Шумо Чист?", isUser: false },
        { speaker: "Person B", text: "My Name Is Ali.", translation: "Номи Ман Алӣ Аст.", isUser: true },
        { speaker: "Person A", text: "Nice To Meet You.", translation: "Аз Шиносоӣ Шодам.", isUser: false },
        { speaker: "Person B", text: "Nice To Meet You Too.", translation: "Ман Ҳам Аз Шиносоӣ Шодам.", isUser: true },
      ]
    },
    {
      moduleIndex: 1,
      lessonIndex: 6, // Lesson 7 (0-indexed)
      title: "Conversation Practice",
      titleTranslated: "Таҷрибаи Гуфтугӯ",
      emoji: "🗣️",
      scenario: "Talking about your country and city.",
      lines: [
        { speaker: "Person A", text: "Hello.", translation: "Салом.", isUser: false },
        { speaker: "Person B", text: "Hello.", translation: "Салом.", isUser: true },
        { speaker: "Person A", text: "What Is Your Name?", translation: "Номи Шумо Чист?", isUser: false },
        { speaker: "Person B", text: "My Name Is Ali.", translation: "Номи Ман Алӣ Аст.", isUser: true },
        { speaker: "Person A", text: "Where Are You From?", translation: "Шумо Аз Куҷо Ҳастед?", isUser: false },
        { speaker: "Person B", text: "I Am From Tajikistan.", translation: "Ман Аз Тоҷикистон Ҳастам.", isUser: true },
        { speaker: "Person A", text: "Where Do You Live?", translation: "Шумо Дар Куҷо Зиндагӣ Мекунед?", isUser: false },
        { speaker: "Person B", text: "I Live In Dushanbe.", translation: "Ман Дар Душанбе Зиндагӣ Мекунам.", isUser: true },
        { speaker: "Person A", text: "Do You Speak English?", translation: "Оё Шумо Бо Англисӣ Гап Мезанед?", isUser: false },
        { speaker: "Person B", text: "Yes, I Speak English.", translation: "Бале, Ман Бо Англисӣ Гап Мезанам.", isUser: true },
      ]
    },
    {
      moduleIndex: 2,
      lessonIndex: 6, // Lesson 7 (0-indexed)
      title: "Conversation Practice",
      titleTranslated: "Таҷрибаи Гуфтугӯ",
      emoji: "🗣️",
      scenario: "Talking about family.",
      lines: [
        { speaker: "Person A", text: "Hello.", translation: "Салом.", isUser: false },
        { speaker: "Person B", text: "Hello.", translation: "Салом.", isUser: true },
        { speaker: "Person A", text: "Who Is He?", translation: "Ӯ Кист?", isUser: false },
        { speaker: "Person B", text: "He Is My Brother.", translation: "Ӯ Бародари Ман Аст.", isUser: true },
        { speaker: "Person A", text: "How Old Is He?", translation: "Ӯ Чандсола Аст?", isUser: false },
        { speaker: "Person B", text: "He Is 15 Years Old.", translation: "Ӯ Понздаҳсола Аст.", isUser: true },
        { speaker: "Person A", text: "Is He Tall?", translation: "Оё Ӯ Қадбаланд Аст?", isUser: false },
        { speaker: "Person B", text: "Yes, He Is Tall.", translation: "Бале, Ӯ Қадбаланд Аст.", isUser: true },
      ]
    },
    {
      moduleIndex: 3,
      lessonIndex: 7, // Module 4 Lesson 8 (0-indexed) is Conversation Practice based on prompt
      title: "Conversation Practice",
      titleTranslated: "Таҷрибаи Гуфтугӯ",
      emoji: "🗣️",
      scenario: "Talking about days, time, and birthdays.",
      lines: [
        { speaker: "Person A", text: "What Day Is Today?", translation: "Имрӯз Чӣ Рӯз Аст?", isUser: false },
        { speaker: "Person B", text: "Today Is Monday.", translation: "Имрӯз Душанбе Аст.", isUser: true },
        { speaker: "Person A", text: "What Time Is It?", translation: "Соат Чанд Аст?", isUser: false },
        { speaker: "Person B", text: "It Is Four O'Clock.", translation: "Соат Чор Аст.", isUser: true },
        { speaker: "Person A", text: "When Is Your Birthday?", translation: "Зодрӯзи Шумо Кай Аст?", isUser: false },
        { speaker: "Person B", text: "My Birthday Is In June.", translation: "Зодрӯзи Ман Дар Моҳи Июн Аст.", isUser: true },
      ]
    }
  ];

  let addedCount = 0;

  for (const item of dialoguesData) {
    const mod = course.modules[item.moduleIndex];
    if (!mod) continue;

    const lesson = mod.lessons[item.lessonIndex];
    if (!lesson) continue;

    console.log(`Processing Module ${item.moduleIndex + 1}, Lesson: ${lesson.title}`);

    // Create Dialogue
    const dialogue = await prisma.dialogue.create({
      data: {
        courseId: course.id,
        cefrLevel: "A1",
        title: item.title,
        titleTranslated: item.titleTranslated,
        emoji: item.emoji,
        scenario: item.scenario,
        lines: {
          create: item.lines.map((line, idx) => ({
            speaker: line.speaker,
            text: line.text,
            translation: line.translation,
            isUser: line.isUser,
            order: idx
          }))
        }
      }
    });

    // Link the dialogue to the lesson and update type
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        type: "dialogue",
        skillType: "speaking",
        dialogueId: dialogue.id
      }
    });
    
    addedCount++;
    console.log(`Created Dialogue ID: ${dialogue.id} and linked to Lesson ID: ${lesson.id}`);
  }

  console.log(`Successfully added ${addedCount} dialogues.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
