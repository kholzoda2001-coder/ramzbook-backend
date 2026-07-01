import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: {
      targetLanguage: { code: 'en' },
      nativeLanguage: { code: 'tg' },
      level: 'A1'
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  const moduleData = {
    module_title_en: "Greetings & Basics",
    module_title_tg: "Салом ва Шиносоӣ",
    lessons: [
      {
        lesson_title_tg: "Салом ва хайрбод",
        lesson_title_en: "Greetings",
        vocabulary: [
          { word: "Hello", translation: "Салом", ipa: "Ҳеллоу", example: "Hello, my friend.", exampleTrans: "Салом, дӯсти ман." },
          { word: "Hi", translation: "Салом (ғайрирасмӣ)", ipa: "Ҳай", example: "Hi, how are you?", exampleTrans: "Салом, аҳволат чӣ гуна аст?" },
          { word: "Bye", translation: "Хайр", ipa: "Бай", example: "Bye, see you later.", exampleTrans: "Хайр, то дидор." },
          { word: "Yes", translation: "Бале", ipa: "Йес", example: "Yes, please.", exampleTrans: "Бале, лутфан." },
          { word: "No", translation: "Не", ipa: "Ноу", example: "No, thank you.", exampleTrans: "Не, ташаккур." }
        ]
      },
      {
        lesson_title_tg: "Пурсидани аҳвол",
        lesson_title_en: "Asking Wellbeing",
        vocabulary: [
          { word: "How", translation: "Чӣ гуна / Чӣ тавр", ipa: "Ҳау", example: "How are you?", exampleTrans: "Шумо чӣ хел ҳастед?" },
          { word: "Are", translation: "Ҳастед", ipa: "Ар", example: "You are my friend.", exampleTrans: "Ту дӯсти ман ҳастӣ." },
          { word: "You", translation: "Шумо / Ту", ipa: "Ю", example: "You are good.", exampleTrans: "Шумо хуб ҳастед." },
          { word: "Fine", translation: "Хуб / Нағз", ipa: "Файн", example: "I am fine.", exampleTrans: "Ман хубам." },
          { word: "Thanks", translation: "Ташаккур / Раҳмат", ipa: "Сенкс", example: "Fine, thanks.", exampleTrans: "Хуб, ташаккур." }
        ]
      },
      {
        lesson_title_tg: "Муаррифӣ",
        lesson_title_en: "Introduction",
        vocabulary: [
          { word: "I", translation: "Ман", ipa: "Ай", example: "I am Ali.", exampleTrans: "Ман Алӣ ҳастам." },
          { word: "My", translation: "Ман (аз они ман)", ipa: "Май", example: "My name is Ali.", exampleTrans: "Номи ман Алӣ аст." },
          { word: "Name", translation: "Ном", ipa: "Нейм", example: "My name is good.", exampleTrans: "Номи ман хуб аст." },
          { word: "Is", translation: "Аст", ipa: "Из", example: "He is my friend.", exampleTrans: "Ӯ дӯсти ман аст." },
          { word: "What", translation: "Чӣ", ipa: "Уот", example: "What is this?", exampleTrans: "Ин чист?" },
          { word: "Your", translation: "Шумо (аз они шумо / ту)", ipa: "Йор", example: "What is your name?", exampleTrans: "Номи шумо чист?" }
        ]
      },
      {
        lesson_title_tg: "Рақамҳои 1-10",
        lesson_title_en: "Numbers 1-10",
        vocabulary: [
          { word: "One", translation: "Як", ipa: "Уан", example: "One book.", exampleTrans: "Як китоб." },
          { word: "Two", translation: "Ду", ipa: "Ту", example: "Two books.", exampleTrans: "Ду китоб." },
          { word: "Three", translation: "Се", ipa: "Сри", example: "Three pens.", exampleTrans: "Се қалам." },
          { word: "Four", translation: "Чор", ipa: "Фор", example: "Four cars.", exampleTrans: "Чор мошин." },
          { word: "Five", translation: "Панҷ", ipa: "Файв", example: "Five days.", exampleTrans: "Панҷ рӯз." },
          { word: "Six", translation: "Шаш", ipa: "Сикс", example: "Six boys.", exampleTrans: "Шаш писар." },
          { word: "Seven", translation: "Ҳафт", ipa: "Севн", example: "Seven girls.", exampleTrans: "Ҳафт духтар." },
          { word: "Eight", translation: "Ҳашт", ipa: "Эйт", example: "Eight names.", exampleTrans: "Ҳашт ном." },
          { word: "Nine", translation: "Нӯҳ", ipa: "Найн", example: "Nine friends.", exampleTrans: "Нӯҳ дӯст." },
          { word: "Ten", translation: "Даҳ", ipa: "Тен", example: "Ten years.", exampleTrans: "Даҳ сол." }
        ]
      }
    ]
  };

  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: moduleData.module_title_en,
      titleTranslated: moduleData.module_title_tg,
      emoji: '👋',
      color: '#8B5CF6', // Purple
      order: 3, // fourth module
      isPremium: false,
      isActive: true,
      lessons: {
        create: moduleData.lessons.map((lesson, idx) => ({
          title: lesson.lesson_title_en,
          titleTranslated: lesson.lesson_title_tg,
          type: 'vocab',
          cefrLevel: 'A1',
          skillType: 'vocab',
          emoji: '📝',
          xpReward: 60,
          duration: 5,
          order: idx,
          words: {
            create: lesson.vocabulary.map(word => ({
              word: word.word,
              translation: word.translation,
              emoji: '💬',
              audioUrl: `/audio/en/${word.word.toLowerCase()}.mp3`,
              ipaTajik: word.ipa,
              example: word.example,
              exampleTrans: word.exampleTrans
            }))
          }
        }))
      }
    }
  });

  console.log("JSON lessons added to the database!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
