const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hardcodedDict = {
  // Pronouns & Basics
  "i": "Ай", "you": "Ю", "he": "Ҳи", "she": "Ши", "it": "Ит", "we": "Ви", "they": "Зей",
  "am": "Ам", "is": "Из", "are": "Ар", "was": "Воз", "were": "Вёр",
  "do": "Ду", "does": "Даз", "did": "Дид", "have": "Ҳав", "has": "Ҳаз", "had": "Ҳад",
  "the": "Зэ", "this": "Зис", "that": "Зат", "these": "Зиз", "those": "Зоуз",
  "who": "Ҳу", "what": "Уот", "where": "Уэр", "when": "Уэн", "why": "Уай", "how": "Ҳау",
  
  // Greetings & Common
  "hello": "Ҳеллоу", "hi": "Ҳай", "good morning": "Гуд монинг", "good evening": "Гуд ивнинг",
  "good afternoon": "Гуд афтернун", "goodnight": "Гуд найт", "goodbye": "Гудбай", "bye": "Бай",
  "please": "Плиз", "thank you": "Сэнк ю", "thanks": "Сэнкс", "sorry": "Сори", "yes": "Йес", "no": "Ноу",
  "ok": "Окей", "excuse me": "Икскюз ми",

  // Tricky A1 words
  "one": "Ван", "two": "Ту", "three": "Сри", "four": "Фор", "five": "Файв",
  "six": "Сикс", "seven": "Севен", "eight": "Эйт", "nine": "Найн", "ten": "Тен",
  "mother": "Мазэр", "father": "Фазэр", "brother": "Бразэр", "sister": "Систэр",
  "family": "Фэмили", "boy": "Бой", "girl": "Гёрл", "child": "Чайлд", "children": "Чилдрен",
  "man": "Мэн", "woman": "Вумэн", "women": "Вимен", "friend": "Френд",
  
  "go": "Гоу", "come": "Кам", "eat": "Ит", "drink": "Дринк", "sleep": "Слип",
  "work": "Вёрк", "play": "Плей", "listen": "Лисн", "look": "Лук", "watch": "Уотч",
  "read": "Рид", "write": "Райт", "speak": "Спик", "talk": "Ток", "say": "Сей",
  "know": "Ноу", "think": "Сингк", "feel": "Фил", "buy": "Бай", "sell": "Сел",

  "water": "Уотэр", "food": "Фуд", "bread": "Бред", "tea": "Ти", "coffee": "Кофи",
  "milk": "Милк", "apple": "Эпл", "meat": "Мит", "chicken": "Чикен", "fish": "Фиш",
  
  "house": "Ҳаус", "home": "Ҳоум", "room": "Рум", "door": "Дор", "window": "Уиндоу",
  "school": "Скул", "teacher": "Тичер", "student": "Студент", "book": "Бук", "pen": "Пен",
  
  "money": "Мани", "price": "Прайс", "cheap": "Чип", "expensive": "Икспенсив",
  "shop": "Шоп", "store": "Стор", "bag": "Бэг", "change": "Чейнҷ",
  
  "good": "Гуд", "bad": "Бэд", "big": "Биг", "small": "Смол", "hot": "Ҳот", "cold": "Колд",
  "happy": "Ҳэпи", "sad": "Сэд", "tired": "Тайерд", "angry": "Энгри", "hungry": "Ҳангри",

  // Numbers 11-20
  "eleven": "Илевен", "twelve": "Туэлв", "thirteen": "Сётин", "fourteen": "Фортин",
  "fifteen": "Фифтин", "sixteen": "Сикстин", "seventeen": "Севентин",
  "eighteen": "Эйтин", "nineteen": "Найтин", "twenty": "Твенти",
  
  // Days
  "monday": "Мандей", "tuesday": "Тюзей", "wednesday": "Венздей", "thursday": "Сёрздей",
  "friday": "Фрайдей", "saturday": "Сэтердей", "sunday": "Сандей",
  
  // Months
  "january": "Ҷэнюэри", "february": "Февруэри", "march": "Марч", "april": "Эйприл",
  "may": "Мей", "june": "Ҷун", "july": "Ҷулай", "august": "Огуст",
  "september": "Септембер", "october": "Октобер", "november": "Новембер", "december": "Дисембер",

  // Phrases
  "how much is it?": "Ҳау мач из ит?",
  "it's too expensive.": "Итс ту икспенсив.",
  "it's cheap.": "Итс чип.",
  "can i have…?": "Кэн ай ҳав...?",
  "i'll take it.": "Айл тейк ит.",
  "here you are.": "Ҳир ю ар.",
  "sit down.": "Сит даун.",
  "stand up.": "Стэнд ап.",
  "open the door.": "Оупен зэ дор.",
  "give me…": "Гив ми...",
  "don't…": "Донт...",
  "come here!": "Кам ҳир!",
  
  "a discount": "Э дискаунт",
  "the cashier": "Зэ кэшир",
  "where is the…?": "Уэр из зэ...?",
  
  // Letters
  "n": "Эн", "o": "Оу", "p": "Пи", "q": "Кю", "r": "Ар",
  "sit": "Сит", "seat": "Сиит", "ship": "Шип", "sheep": "Шиип"
};

function autoTransliterate(word) {
  let w = word.toLowerCase();
  
  // Diphthongs & rules
  w = w.replace(/tion/g, 'шн').replace(/sion/g, 'жн');
  w = w.replace(/ight/g, 'айт').replace(/igh/g, 'ай');
  w = w.replace(/ought/g, 'от').replace(/aught/g, 'от');
  w = w.replace(/ch/g, 'ч').replace(/sh/g, 'ш').replace(/ph/g, 'ф').replace(/th/g, 'с');
  w = w.replace(/ee/g, 'и').replace(/ea/g, 'и').replace(/oo/g, 'у');
  w = w.replace(/ou/g, 'ау').replace(/ow/g, 'ау').replace(/aw/g, 'о');
  w = w.replace(/ay/g, 'ей').replace(/ey/g, 'и').replace(/oy/g, 'ой');
  w = w.replace(/kn/g, 'н').replace(/wr/g, 'р');
  
  // Single vowels
  w = w.replace(/a/g, 'э').replace(/e/g, 'е').replace(/i/g, 'и').replace(/o/g, 'о').replace(/u/g, 'а').replace(/y/g, 'й');
  
  // Consonants
  w = w.replace(/b/g, 'б').replace(/c/g, 'к').replace(/d/g, 'д').replace(/f/g, 'ф').replace(/g/g, 'г').replace(/h/g, 'ҳ');
  w = w.replace(/j/g, 'ҷ').replace(/k/g, 'к').replace(/l/g, 'л').replace(/m/g, 'м').replace(/n/g, 'н').replace(/p/g, 'п');
  w = w.replace(/q/g, 'к').replace(/r/g, 'р').replace(/s/g, 'с').replace(/t/g, 'т').replace(/v/g, 'в').replace(/w/g, 'у').replace(/x/g, 'кс').replace(/z/g, 'з');
  
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function guessTajik(word) {
  if (!word) return "";
  let clean = word.toLowerCase().trim();
  if (hardcodedDict[clean]) return hardcodedDict[clean];
  
  // Multi-word fallback
  if (clean.includes(" ")) {
    return clean.split(" ").map(w => hardcodedDict[w] || autoTransliterate(w)).join(" ");
  }
  
  return autoTransliterate(clean);
}

async function main() {
  const a1 = await prisma.course.findFirst({
    where: { level: 'A1' },
    include: {
      modules: {
        include: {
          lessons: {
            include: { words: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  if (!a1) return console.log("A1 not found");
  
  for (const mod of a1.modules) {
    let lessonIndex = 0;
    for (const lesson of mod.lessons) {
      lessonIndex++;
      if (lessonIndex % 5 === 0) console.log(`Processing module ${mod.title}, lesson ${lessonIndex}`);
      let keepCount = 0;
      
      for (const w of lesson.words) {
        if (keepCount >= 5) {
          try {
            await prisma.srsCard.deleteMany({ where: { itemId: w.id } });
            await prisma.word.delete({ where: { id: w.id } });
          } catch(e) { /* ignore if already deleted or constraints */ }
          continue;
        }
        
        let ipaTajik = guessTajik(w.word);
        
        await prisma.word.update({
          where: { id: w.id },
          data: { ipaTajik: ipaTajik }
        });
        
        keepCount++;
      }
      
      // Update lesson title if it's the old Alphabet one
      if (lesson.title.toLowerCase().includes("alphabet")) {
         await prisma.lesson.update({
             where: { id: lesson.id },
             data: { title: "Basic Intro" }
         });
      }
    }
  }

  console.log("A1 Lessons completely organized and fixed!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
