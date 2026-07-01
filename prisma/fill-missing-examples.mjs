import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  const updates = [
    // Module 1 Missing
    { word: "Good Afternoon", example: "Good Afternoon, Teacher.", exampleTrans: "Нимаи Рӯз Ба Хайр, Муаллим." },
    { word: "Good Evening", example: "Good Evening, Friend.", exampleTrans: "Шом Ба Хайр, Дӯст." },
    { word: "Good Night", example: "Good Night, Mother.", exampleTrans: "Шаб Ба Хайр, Модар." },
    { word: "Please", example: "Please, Come Here.", exampleTrans: "Лутфан, Ба Ин Ҷо Биёед." },
    { word: "Thank You", example: "Thank You Very Much.", exampleTrans: "Ташаккури Зиёд." },
    { word: "Sorry", example: "I Am Sorry.", exampleTrans: "Ман Мебахшед." },
    { word: "Excuse Me", example: "Excuse Me, Teacher.", exampleTrans: "Мебахшед, Муаллим." },
    { word: "I", example: "I Am A Student.", exampleTrans: "Ман Донишҷӯ Ҳастам." },
    { word: "You", example: "You Are My Friend.", exampleTrans: "Шумо Дӯсти Ман Ҳастед." },
    { word: "He", example: "He Is Tall.", exampleTrans: "Ӯ Қадбаланд Аст." },
    { word: "She", example: "She Is A Teacher.", exampleTrans: "Ӯ Муаллима Аст." },
    { word: "We", example: "We Are Family.", exampleTrans: "Мо Оила Ҳастем." },
    { word: "They", example: "They Are Students.", exampleTrans: "Онҳо Донишҷӯёнанд." },
    { word: "Am", example: "I Am Happy.", exampleTrans: "Ман Хушбахтам." },
    { word: "Is", example: "It Is A Book.", exampleTrans: "Ин Китоб Аст." },
    { word: "Are", example: "You Are Nice.", exampleTrans: "Шумо Нағз Ҳастед." },
    { word: "Have", example: "I Have A Book.", exampleTrans: "Ман Китоб Дорам." },
    { word: "Has", example: "He Has A Car.", exampleTrans: "Ӯ Мошин Дорад." },
    { word: "Do", example: "I Do My Homework.", exampleTrans: "Ман Вазифаи Хонагиамро Иҷро Мекунам." },
    { word: "What", example: "What Is Your Name?", exampleTrans: "Номи Шумо Чист?" },
    { word: "Who", example: "Who Is That Man?", exampleTrans: "Он Мард Кист?" },
    { word: "Where", example: "Where Are You From?", exampleTrans: "Шумо Аз Куҷо Ҳастед?" },
    { word: "When", example: "When Is Your Birthday?", exampleTrans: "Зодрӯзи Шумо Кай Аст?" },
    { word: "Why", example: "Why Are You Sad?", exampleTrans: "Чаро Шумо Ғамгинед?" },
    { word: "How", example: "How Are You?", exampleTrans: "Шумо Чӣ Хел Ҳастед?" },
    { word: "Name", example: "My Name Is Ali.", exampleTrans: "Номи Ман Алӣ Аст." },
    { word: "Friend", example: "He Is My Friend.", exampleTrans: "Ӯ Дӯсти Ман Аст." },
    { word: "Teacher", example: "She Is A Teacher.", exampleTrans: "Ӯ Муаллима Аст." },
    { word: "Student", example: "I Am A Student.", exampleTrans: "Ман Донишҷӯ Ҳастам." },
    { word: "School", example: "This Is My School.", exampleTrans: "Ин Мактаби Ман Аст." },
    { word: "Book", example: "I Have A Book.", exampleTrans: "Ман Китоб Дорам." },
    { word: "Good", example: "It Is A Good Book.", exampleTrans: "Ин Китоби Хуб Аст." },
    { word: "Bad", example: "It Is A Bad Day.", exampleTrans: "Ин Рӯзи Бад Аст." },
    { word: "Big", example: "It Is A Big City.", exampleTrans: "Ин Шаҳри Калон Аст." },
    { word: "Small", example: "It Is A Small Room.", exampleTrans: "Ин Ҳуҷраи Хурд Аст." },
    { word: "Hot", example: "The Tea Is Hot.", exampleTrans: "Чой Гарм Аст." },
    { word: "Cold", example: "The Water Is Cold.", exampleTrans: "Об Хунук Аст." },

    // Module 2 Missing
    { word: "Number", example: "What Is Your Phone Number?", exampleTrans: "Рақами Телефони Шумо Чист?" },
    { word: "Year", example: "I Am 20 Years Old.", exampleTrans: "Ман Бистсола Ҳастам." },
    { word: "Old", example: "How Old Are You?", exampleTrans: "Шумо Чандсолаед?" },
    { word: "Many", example: "How Many Brothers Do You Have?", exampleTrans: "Шумо Чанд Бародар Доред?" },
    { word: "Live", example: "I Live In Dushanbe.", exampleTrans: "Ман Дар Душанбе Зиндагӣ Мекунам." },
    { word: "From", example: "I Am From Tajikistan.", exampleTrans: "Ман Аз Тоҷикистон Ҳастам." },
    { word: "Tajikistan", example: "Tajikistan Is Beautiful.", exampleTrans: "Тоҷикистон Зебо Аст." },
    { word: "Uae", example: "I Work In Uae.", exampleTrans: "Ман Дар Амороти Муттаҳидаи Араб Кор Мекунам." },
    { word: "America", example: "He Lives In America.", exampleTrans: "Ӯ Дар Амрико Зиндагӣ Мекунад." },
    { word: "England", example: "She Is From England.", exampleTrans: "Ӯ Аз Англия Аст." },
    { word: "Here", example: "I Am Here.", exampleTrans: "Ман Дар Ин Ҷо Ҳастам." },
    { word: "Dushanbe", example: "Dushanbe Is A Big City.", exampleTrans: "Душанбе Шаҳри Калон Аст." },
    { word: "Dubai", example: "Dubai Is Hot.", exampleTrans: "Дубай Гарм Аст." },
    { word: "Place", example: "It Is A Nice Place.", exampleTrans: "Ин Ҷои Нағз Аст." },
    { word: "English", example: "I Speak English.", exampleTrans: "Ман Бо Англисӣ Гап Мезанам." },
    { word: "Tajik", example: "I Speak Tajik.", exampleTrans: "Ман Бо Тоҷикӣ Гап Мезанам." },
    { word: "Russian", example: "I Learn Russian.", exampleTrans: "Ман Забони Русиро Меомӯзам." },
    { word: "Speak", example: "Do You Speak English?", exampleTrans: "Оё Шумо Бо Англисӣ Гап Мезанед?" },
    { word: "Learn", example: "I Learn English.", exampleTrans: "Ман Англисиро Меомӯзам." },

    // Module 3 Missing
    { word: "Son", example: "He Is My Son.", exampleTrans: "Ӯ Писари Ман Аст." },
    { word: "Daughter", example: "She Is My Daughter.", exampleTrans: "Ӯ Духтари Ман Аст." },
    { word: "Baby", example: "The Baby Is Small.", exampleTrans: "Кӯдак Хурд Аст." },
    { word: "Family", example: "I Love My Family.", exampleTrans: "Ман Оилаамро Дӯст Медорам." },
    { word: "Grandfather", example: "My Grandfather Is Old.", exampleTrans: "Бобои Ман Пир Аст." },
    { word: "Grandmother", example: "My Grandmother Is Nice.", exampleTrans: "Бибии Ман Нағз Аст." },
    { word: "Uncle", example: "He Is My Uncle.", exampleTrans: "Ӯ Амаки Ман Аст." },
    { word: "Aunt", example: "She Is My Aunt.", exampleTrans: "Ӯ Холаи Ман Аст." },
    { word: "Boy", example: "The Boy Is Happy.", exampleTrans: "Писарбача Хушбахт Аст." },
    { word: "Girl", example: "The Girl Is Tall.", exampleTrans: "Духтарбача Қадбаланд Аст." },
    { word: "Person", example: "He Is A Nice Person.", exampleTrans: "Ӯ Шахси Нағз Аст." },
    { word: "Short", example: "He Is Short.", exampleTrans: "Ӯ Қадпаст Аст." },
    { word: "Strong", example: "My Brother Is Strong.", exampleTrans: "Бародари Ман Қувватманд Аст." },
    { word: "Sad", example: "Why Are You Sad?", exampleTrans: "Чаро Шумо Ғамгинед?" },
    { word: "Nice", example: "She Is Nice.", exampleTrans: "Ӯ Нағз Аст." },
    { word: "Child", example: "The Child Is Happy.", exampleTrans: "Кӯдак Хушбахт Аст." },
    { word: "Adult", example: "I Am An Adult.", exampleTrans: "Ман Калонсол Ҳастам." },
    { word: "Elderly", example: "The Elderly Man Is Here.", exampleTrans: "Марди Куҳансол Дар Ин Ҷост." },

    // Module 4 Missing
    { word: "One", example: "I Have One Brother.", exampleTrans: "Ман Як Бародар Дорам." },
    { word: "Two", example: "I Have Two Sisters.", exampleTrans: "Ман Ду Хоҳар Дорам." },
    { word: "Three", example: "It Is Three O'Clock.", exampleTrans: "Соат Се Аст." },
    { word: "Four", example: "I Have Four Books.", exampleTrans: "Ман Чор Китоб Дорам." },
    { word: "Six", example: "I Am Six Years Old.", exampleTrans: "Ман Шашсола Ҳастам." },
    { word: "Eleven", example: "He Is Eleven Years Old.", exampleTrans: "Ӯ Ёздаҳсола Аст." },
    { word: "Twelve", example: "It Is Twelve O'Clock.", exampleTrans: "Соат Дувоздаҳ Аст." },
    { word: "Thirteen", example: "She Is Thirteen Years Old.", exampleTrans: "Ӯ Сездаҳсола Аст." },
    { word: "Fourteen", example: "He Is Fourteen.", exampleTrans: "Ӯ Чордаҳсола Аст." },
    { word: "Fifteen", example: "I Am Fifteen Years Old.", exampleTrans: "Ман Понздаҳсола Ҳастам." },
    { word: "Thirty", example: "I Am Thirty Years Old.", exampleTrans: "Ман Сисола Ҳастам." },
    { word: "Forty", example: "My Father Is Forty.", exampleTrans: "Падари Ман Чилсола Аст." },
    { word: "Fifty", example: "My Mother Is Fifty.", exampleTrans: "Модари Ман Панҷоҳсола Аст." },
    { word: "Sixty", example: "My Grandfather Is Sixty.", exampleTrans: "Бобои Ман Шастсола Аст." },
    { word: "Seventy", example: "He Is Seventy Years Old.", exampleTrans: "Ӯ Ҳафтодсола Аст." },
    { word: "One Hundred", example: "I Have One Hundred Books.", exampleTrans: "Ман Як Сад Китоб Дорам." },
    { word: "Tuesday", example: "Today Is Tuesday.", exampleTrans: "Имрӯз Сешанбе Аст." },
    { word: "Wednesday", example: "Today Is Wednesday.", exampleTrans: "Имрӯз Чоршанбе Аст." },
    { word: "Thursday", example: "Today Is Thursday.", exampleTrans: "Имрӯз Панҷшанбе Аст." },
    { word: "Friday", example: "Tomorrow Is Friday.", exampleTrans: "Фардо Ҷумъа Аст." },
    { word: "Saturday", example: "Today Is Saturday.", exampleTrans: "Имрӯз Шанбе Аст." },
    { word: "Sunday", example: "Sunday Is A Good Day.", exampleTrans: "Якшанбе Рӯзи Хуб Аст." },
    { word: "January", example: "My Birthday Is In January.", exampleTrans: "Зодрӯзи Ман Дар Январ Аст." },
    { word: "February", example: "February Is Cold.", exampleTrans: "Феврал Хунук Аст." },
    { word: "March", example: "March Is Nice.", exampleTrans: "Март Нағз Аст." },
    { word: "April", example: "My Birthday Is In April.", exampleTrans: "Зодрӯзи Ман Дар Апрел Аст." },
    { word: "May", example: "May Is A Good Month.", exampleTrans: "Май Моҳи Хуб Аст." },
    { word: "Morning", example: "Good Morning!", exampleTrans: "Субҳ Ба Хайр!" },
    { word: "Afternoon", example: "Good Afternoon!", exampleTrans: "Нимаи Рӯз Ба Хайр!" },
    { word: "Evening", example: "Good Evening!", exampleTrans: "Шом Ба Хайр!" },
    { word: "Night", example: "Good Night!", exampleTrans: "Шаб Ба Хайр!" }
  ];

  let updateCount = 0;

  for (const update of updates) {
    const res = await prisma.word.updateMany({
      where: {
        word: update.word,
        lesson: {
          module: {
            courseId: course.id
          }
        },
        // Only update if it doesn't already have an example
        example: null
      },
      data: {
        example: update.example,
        exampleTrans: update.exampleTrans
      }
    });
    updateCount += res.count;
    if (res.count > 0) {
      console.log(`Updated word: ${update.word} (Count: ${res.count})`);
    }
  }

  console.log(`Total missing examples updated: ${updateCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
