const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dictionary = {
  // Greetings
  "Hello": { ipa: "/həˈloʊ/", ipaTajik: "Ҳеллоу", trans: "Салом" },
  "Good morning": { ipa: "/ɡʊd ˈmɔːrnɪŋ/", ipaTajik: "Гуд монинг", trans: "Субҳ ба хайр" },
  "Thank you": { ipa: "/θæŋk juː/", ipaTajik: "Сэнк ю", trans: "Ташаккур" },
  "Goodbye": { ipa: "/ˌɡʊdˈbaɪ/", ipaTajik: "Гудбай", trans: "Хайр" },
  "Yes": { ipa: "/jɛs/", ipaTajik: "Йес", trans: "Ҳа" },
  "No": { ipa: "/noʊ/", ipaTajik: "Ноу", trans: "Не" },
  "Good": { ipa: "/ɡʊd/", ipaTajik: "Гуд", trans: "Хуб" },

  // Write: First words
  "Cat": { ipa: "/kæt/", ipaTajik: "Кэт", trans: "Гурба" },
  "Dog": { ipa: "/dɔːɡ/", ipaTajik: "Дог", trans: "Саг" },
  "Sun": { ipa: "/sʌn/", ipaTajik: "Сан", trans: "Офтоб" },
  "Book": { ipa: "/bʊk/", ipaTajik: "Бук", trans: "Китоб" },
  "Water": { ipa: "/ˈwɔːtər/", ipaTajik: "Уотэр", trans: "Об" },
  
  // Family
  "Mother": { ipa: "/ˈmʌðər/", ipaTajik: "Мазэр", trans: "Модар" },
  "Father": { ipa: "/ˈfɑːðər/", ipaTajik: "Фазэр", trans: "Падар" },
  "Sister": { ipa: "/ˈsɪstər/", ipaTajik: "Систэр", trans: "Хоҳар" },
  "Brother": { ipa: "/ˈbrʌðər/", ipaTajik: "Бразэр", trans: "Бародар" },
  "Family": { ipa: "/ˈfæməli/", ipaTajik: "Фэмили", trans: "Оила" },

  // Verbs & Shopping
  "Money": { ipa: "/ˈmʌni/", ipaTajik: "Мани", trans: "Пул" },
  "Price": { ipa: "/praɪs/", ipaTajik: "Прайс", trans: "Нарх" },
  "Cheap": { ipa: "/tʃiːp/", ipaTajik: "Чип", trans: "Арзон" },
  "Expensive": { ipa: "/ɪkˈspɛnsɪv/", ipaTajik: "Икспенсив", trans: "Қимат" },
  "Buy": { ipa: "/baɪ/", ipaTajik: "Бай", trans: "Харидан" },
  "Sell": { ipa: "/sɛl/", ipaTajik: "Сел", trans: "Фурӯхтан" },
  "Shirt": { ipa: "/ʃɜːrt/", ipaTajik: "Шёрт", trans: "Ҷома" },
  "Shoes": { ipa: "/ʃuːz/", ipaTajik: "Шуз", trans: "Пойафзол" },
  
  // Others
  "Friend": { ipa: "/frɛnd/", ipaTajik: "Френд", trans: "Дӯст" },
  "School": { ipa: "/skuːl/", ipaTajik: "Скул", trans: "Мактаб" },
  "Big": { ipa: "/bɪɡ/", ipaTajik: "Биг", trans: "Калон" },
  "Happy": { ipa: "/ˈhæpi/", ipaTajik: "Ҳэпи", trans: "Хушҳол" },
  "Today": { ipa: "/təˈdeɪ/", ipaTajik: "Тудей", trans: "Имрӯз" },
  "Bread": { ipa: "/brɛd/", ipaTajik: "Бред", trans: "Нон" },
  "shop / store": { ipa: "/ʃɑːp/ / /stɔːr/", ipaTajik: "Шоп / Стор", trans: "Дӯкон" },
  "the cashier": { ipa: "/ðə kæˈʃɪr/", ipaTajik: "Зэ кэшир", trans: "Хазинадор" },
  "change": { ipa: "/tʃeɪndʒ/", ipaTajik: "Чейнҷ", trans: "Бақия" },
  "a bag": { ipa: "/ə bæɡ/", ipaTajik: "Э бэг", trans: "Халта" },
  
  // Sentences
  "How much is it?": { ipa: "/haʊ mʌtʃ ɪz ɪt/", ipaTajik: "Ҳау мач из ит?", trans: "Ин чанд пул аст?" },
  "It's too expensive.": { ipa: "/ɪts tuː ɪkˈspɛnsɪv/", ipaTajik: "Итс ту икспенсив", trans: "Хеле қимат аст." },
  "It's cheap.": { ipa: "/ɪts tʃiːp/", ipaTajik: "Итс чип", trans: "Арзон аст." },
  "Can I have…?": { ipa: "/kæn aɪ hæv/", ipaTajik: "Кэн ай ҳав...", trans: "Оё ман ... метавонам гирам?" },
  "I'll take it.": { ipa: "/aɪl teɪk ɪt/", ipaTajik: "Айл тейк ит", trans: "Ман инро мегирам." },
  "Listen!": { ipa: "/ˈlɪsən/", ipaTajik: "Лисн!", trans: "Гӯш кун!" },
  "Look!": { ipa: "/lʊk/", ipaTajik: "Лук!", trans: "Нигоҳ кун!" },
  "Come here!": { ipa: "/kʌm hɪr/", ipaTajik: "Кам ҳир!", trans: "Ин ҷо биё!" },
  "Sit down.": { ipa: "/sɪt daʊn/", ipaTajik: "Сит даун.", trans: "Биншин." },
  "Stand up.": { ipa: "/stænd ʌp/", ipaTajik: "Стэнд ап.", trans: "Хез." },
};

function guessTajik(word) {
  let w = word.toLowerCase();
  w = w.replace(/sh/g, 'ш').replace(/ch/g, 'ч').replace(/th/g, 'з');
  w = w.replace(/a/g, 'а').replace(/e/g, 'е').replace(/i/g, 'и').replace(/o/g, 'о').replace(/u/g, 'у').replace(/y/g, 'й');
  w = w.replace(/b/g, 'б').replace(/c/g, 'к').replace(/d/g, 'д').replace(/f/g, 'ф').replace(/g/g, 'г').replace(/h/g, 'ҳ');
  w = w.replace(/j/g, 'ҷ').replace(/k/g, 'к').replace(/l/g, 'л').replace(/m/g, 'м').replace(/n/g, 'н').replace(/p/g, 'п');
  w = w.replace(/q/g, 'к').replace(/r/g, 'р').replace(/s/g, 'с').replace(/t/g, 'т').replace(/v/g, 'в').replace(/w/g, 'в').replace(/x/g, 'кс').replace(/z/g, 'з');
  return w.charAt(0).toUpperCase() + w.slice(1);
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
    for (const lesson of mod.lessons) {
      let keepCount = 0;
      
      for (const w of lesson.words) {
        if (keepCount >= 5) {
          await prisma.word.delete({ where: { id: w.id } });
          continue;
        }
        
        let updateData = {};
        const dictEntry = dictionary[w.word];
        
        if (dictEntry) {
          updateData.ipa = dictEntry.ipa;
          updateData.ipaTajik = dictEntry.ipaTajik;
        } else {
          if (!w.ipaTajik) updateData.ipaTajik = guessTajik(w.word);
        }
        
        if (w.translation) updateData.translation = w.translation.trim();
        
        if (Object.keys(updateData).length > 0) {
          await prisma.word.update({
            where: { id: w.id },
            data: updateData
          });
        }
        
        keepCount++;
      }
      
      if (lesson.title.toLowerCase().includes("alphabet")) {
         await prisma.lesson.update({
             where: { id: lesson.id },
             data: { title: "Basic Intro" }
         });
      }
    }
  }

  console.log("A1 Lessons updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
