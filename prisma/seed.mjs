// ─────────────────────────────────────────────────────────────────────────────
// RAMZ seed — pair-aware (native + target) learning content.
// Run locally:  node prisma/seed.mjs
// Produces prisma/seed-data.json (consumed by /api/admin/seed for re-seeding).
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Languages ─────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'tg', name: 'Tajik',   nativeName: 'Тоҷикӣ',   flag: '🇹🇯', canBeNative: true,  canBeTarget: true,  badge: null,   learnerCount: '8.2M',  order: 1 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский',  flag: '🇷🇺', canBeNative: true,  canBeTarget: true,  badge: 'LIVE', learnerCount: '258M',  order: 2 },
  { code: 'uz', name: 'Uzbek',   nativeName: "O'zbek",   flag: '🇺🇿', canBeNative: true,  canBeTarget: false, badge: null,   learnerCount: '35M',   order: 3 },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی',    flag: '🇮🇷', canBeNative: true,  canBeTarget: false, badge: null,   learnerCount: '80M',   order: 4 },
  { code: 'en', name: 'English', nativeName: 'English',  flag: '🇬🇧', canBeNative: false, canBeTarget: true,  badge: 'HOT',  learnerCount: '1.5B',  order: 5 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe',   flag: '🇹🇷', canBeNative: false, canBeTarget: true,  badge: 'SOON', learnerCount: '88M',   order: 6 },
  { code: 'ar', name: 'Arabic',  nativeName: 'العربية',  flag: '🇸🇦', canBeNative: false, canBeTarget: true,  badge: 'SOON', learnerCount: '420M',  order: 7 },
];

// ── 2. Course levels (target=en, native=tg) ──────────────────────────────────
const LEVELS = [
  { level: 'A1', title: 'Забони англисӣ — A1', emoji: '🌱', color: '#14B8A6', description: 'Калимаҳои оддӣ ва ибораҳои ҳаррӯза' },
  { level: 'A2', title: 'Забони англисӣ — A2', emoji: '📗', color: '#60A5FA', description: 'Муоширати оддӣ дар ҳолатҳои гуногун' },
  { level: 'B1', title: 'Забони англисӣ — B1', emoji: '📘', color: '#A78BFA', description: 'Мавзӯъҳои васеътар ва гуфтугӯи равон' },
  { level: 'B2', title: 'Забони англисӣ — B2', emoji: '📙', color: '#FB923C', description: 'Мавзӯъҳои мураккаб ва касбӣ' },
  { level: 'C1', title: 'Забони англисӣ — C1', emoji: '📕', color: '#F472B6', description: 'Сатҳи пешрафта ва мафҳумҳои абстрактӣ' },
];

// ── 3. Module themes (6 per level → 30 total). Words split across 2 lessons. ──
// w = word (English), t = translation (Tajik), e = emoji, ipa, ex/exT = example
const MODULES = [
  // ===== A1 =====
  { lvl: 'A1', title: 'Greetings', tt: 'Саломҳо', emoji: '👋', words: [
    { w: 'Hello', t: 'Салом', e: '👋', ipa: '/həˈloʊ/', ex: 'Hello, how are you?', exT: 'Салом, чӣ хелед?' },
    { w: 'Goodbye', t: 'Хайр', e: '👋', ipa: '/ɡʊdˈbaɪ/', ex: 'Goodbye, see you tomorrow.', exT: 'Хайр, то фардо.' },
    { w: 'Thank you', t: 'Ташаккур', e: '🙏', ipa: '/θæŋk juː/', ex: 'Thank you very much.', exT: 'Ташаккури зиёд.' },
    { w: 'Please', t: 'Лутфан', e: '✨', ipa: '/pliːz/', ex: 'Please help me.', exT: 'Лутфан ба ман кӯмак кунед.' },
    { w: 'Sorry', t: 'Бубахшед', e: '😔', ipa: '/ˈsɒri/', ex: 'Sorry, I am late.', exT: 'Бубахшед, ман дер кардам.' },
    { w: 'Yes', t: 'Бале', e: '👍', ipa: '/jes/', ex: 'Yes, of course.', exT: 'Бале, албатта.' },
    { w: 'No', t: 'Не', e: '👎', ipa: '/noʊ/', ex: 'No, thank you.', exT: 'Не, ташаккур.' },
    { w: 'Welcome', t: 'Хуш омадед', e: '🤗', ipa: '/ˈwelkəm/', ex: 'Welcome to our home.', exT: 'Ба хонаи мо хуш омадед.' },
  ]},
  { lvl: 'A1', title: 'Numbers', tt: 'Рақамҳо', emoji: '🔢', words: [
    { w: 'One', t: 'Як', e: '1️⃣', ipa: '/wʌn/', ex: 'I have one brother.', exT: 'Ман як бародар дорам.' },
    { w: 'Two', t: 'Ду', e: '2️⃣', ipa: '/tuː/', ex: 'Two apples, please.', exT: 'Ду себ, лутфан.' },
    { w: 'Three', t: 'Се', e: '3️⃣', ipa: '/θriː/', ex: 'Three books are here.', exT: 'Се китоб ин ҷост.' },
    { w: 'Four', t: 'Чор', e: '4️⃣', ipa: '/fɔːr/', ex: 'Four seasons.', exT: 'Чор фасл.' },
    { w: 'Five', t: 'Панҷ', e: '5️⃣', ipa: '/faɪv/', ex: 'Five fingers.', exT: 'Панҷ ангушт.' },
    { w: 'Ten', t: 'Даҳ', e: '🔟', ipa: '/ten/', ex: 'Ten minutes.', exT: 'Даҳ дақиқа.' },
    { w: 'Hundred', t: 'Сад', e: '💯', ipa: '/ˈhʌndrəd/', ex: 'One hundred years.', exT: 'Сад сол.' },
    { w: 'Zero', t: 'Сифр', e: '0️⃣', ipa: '/ˈzɪroʊ/', ex: 'Zero problems.', exT: 'Сифр мушкилот.' },
  ]},
  { lvl: 'A1', title: 'Family', tt: 'Оила', emoji: '👨‍👩‍👧‍👦', words: [
    { w: 'Mother', t: 'Модар', e: '👩', ipa: '/ˈmʌðər/', ex: 'My mother is kind.', exT: 'Модари ман меҳрубон аст.' },
    { w: 'Father', t: 'Падар', e: '👨', ipa: '/ˈfɑːðər/', ex: 'My father works hard.', exT: 'Падари ман сахт кор мекунад.' },
    { w: 'Brother', t: 'Бародар', e: '👦', ipa: '/ˈbrʌðər/', ex: 'I have a brother.', exT: 'Ман бародар дорам.' },
    { w: 'Sister', t: 'Хоҳар', e: '👧', ipa: '/ˈsɪstər/', ex: 'My sister is a student.', exT: 'Хоҳари ман донишҷӯ аст.' },
    { w: 'Son', t: 'Писар', e: '👶', ipa: '/sʌn/', ex: 'Their son is young.', exT: 'Писари онҳо хурд аст.' },
    { w: 'Daughter', t: 'Духтар', e: '👧', ipa: '/ˈdɔːtər/', ex: 'A clever daughter.', exT: 'Духтари боақл.' },
    { w: 'Family', t: 'Оила', e: '👨‍👩‍👧‍👦', ipa: '/ˈfæməli/', ex: 'A big family.', exT: 'Оилаи калон.' },
    { w: 'Child', t: 'Кӯдак', e: '🧒', ipa: '/tʃaɪld/', ex: 'The child is happy.', exT: 'Кӯдак хушбахт аст.' },
  ]},
  { lvl: 'A1', title: 'Food', tt: 'Хӯрок', emoji: '🍽️', words: [
    { w: 'Bread', t: 'Нон', e: '🍞', ipa: '/bred/', ex: 'Fresh bread.', exT: 'Нони тоза.' },
    { w: 'Water', t: 'Об', e: '💧', ipa: '/ˈwɔːtər/', ex: 'Cold water.', exT: 'Оби хунук.' },
    { w: 'Tea', t: 'Чой', e: '🍵', ipa: '/tiː/', ex: 'Green tea.', exT: 'Чойи сабз.' },
    { w: 'Meat', t: 'Гӯшт', e: '🥩', ipa: '/miːt/', ex: 'I like meat.', exT: 'Ман гӯштро дӯст медорам.' },
    { w: 'Fruit', t: 'Мева', e: '🍎', ipa: '/fruːt/', ex: 'Sweet fruit.', exT: 'Меваи ширин.' },
    { w: 'Rice', t: 'Биринҷ', e: '🍚', ipa: '/raɪs/', ex: 'A plate of rice.', exT: 'Як табақ биринҷ.' },
    { w: 'Milk', t: 'Шир', e: '🥛', ipa: '/mɪlk/', ex: 'A glass of milk.', exT: 'Як стакан шир.' },
    { w: 'Apple', t: 'Себ', e: '🍎', ipa: '/ˈæpəl/', ex: 'A red apple.', exT: 'Себи сурх.' },
  ]},
  { lvl: 'A1', title: 'Colors', tt: 'Рангҳо', emoji: '🎨', words: [
    { w: 'Red', t: 'Сурх', e: '🔴', ipa: '/red/', ex: 'A red car.', exT: 'Мошини сурх.' },
    { w: 'Blue', t: 'Кабуд', e: '🔵', ipa: '/bluː/', ex: 'The blue sky.', exT: 'Осмони кабуд.' },
    { w: 'Green', t: 'Сабз', e: '🟢', ipa: '/ɡriːn/', ex: 'Green grass.', exT: 'Алафи сабз.' },
    { w: 'Yellow', t: 'Зард', e: '🟡', ipa: '/ˈjeloʊ/', ex: 'The yellow sun.', exT: 'Офтоби зард.' },
    { w: 'Black', t: 'Сиёҳ', e: '⚫', ipa: '/blæk/', ex: 'A black cat.', exT: 'Гурбаи сиёҳ.' },
    { w: 'White', t: 'Сафед', e: '⚪', ipa: '/waɪt/', ex: 'White snow.', exT: 'Барфи сафед.' },
    { w: 'Orange', t: 'Норинҷӣ', e: '🟠', ipa: '/ˈɒrɪndʒ/', ex: 'An orange flower.', exT: 'Гули норинҷӣ.' },
    { w: 'Brown', t: 'Қаҳваранг', e: '🟤', ipa: '/braʊn/', ex: 'Brown bread.', exT: 'Нони қаҳваранг.' },
  ]},
  { lvl: 'A1', title: 'Time & Days', tt: 'Вақт ва рӯзҳо', emoji: '⏰', words: [
    { w: 'Day', t: 'Рӯз', e: '☀️', ipa: '/deɪ/', ex: 'A good day.', exT: 'Рӯзи хуб.' },
    { w: 'Night', t: 'Шаб', e: '🌙', ipa: '/naɪt/', ex: 'A quiet night.', exT: 'Шаби ором.' },
    { w: 'Today', t: 'Имрӯз', e: '📅', ipa: '/təˈdeɪ/', ex: 'Today is Monday.', exT: 'Имрӯз душанбе аст.' },
    { w: 'Tomorrow', t: 'Фардо', e: '➡️', ipa: '/təˈmɒroʊ/', ex: 'See you tomorrow.', exT: 'То фардо.' },
    { w: 'Week', t: 'Ҳафта', e: '🗓️', ipa: '/wiːk/', ex: 'Next week.', exT: 'Ҳафтаи оянда.' },
    { w: 'Month', t: 'Моҳ', e: '📆', ipa: '/mʌnθ/', ex: 'This month.', exT: 'Ин моҳ.' },
    { w: 'Year', t: 'Сол', e: '🎉', ipa: '/jɪr/', ex: 'Happy New Year.', exT: 'Соли нав муборак.' },
    { w: 'Hour', t: 'Соат', e: '⏰', ipa: '/ˈaʊər/', ex: 'One hour.', exT: 'Як соат.' },
  ]},
  // ===== A2 =====
  { lvl: 'A2', title: 'Travel', tt: 'Сафар', emoji: '✈️', words: [
    { w: 'Airport', t: 'Фурудгоҳ', e: '✈️', ipa: '/ˈerpɔːrt/', ex: 'The airport is big.', exT: 'Фурудгоҳ калон аст.' },
    { w: 'Ticket', t: 'Чипта', e: '🎫', ipa: '/ˈtɪkɪt/', ex: 'One ticket, please.', exT: 'Як чипта, лутфан.' },
    { w: 'Hotel', t: 'Меҳмонхона', e: '🏨', ipa: '/hoʊˈtel/', ex: 'A clean hotel.', exT: 'Меҳмонхонаи тоза.' },
    { w: 'Passport', t: 'Шиноснома', e: '🛂', ipa: '/ˈpæspɔːrt/', ex: 'Show your passport.', exT: 'Шиносномаатонро нишон диҳед.' },
    { w: 'Map', t: 'Харита', e: '🗺️', ipa: '/mæp/', ex: 'A city map.', exT: 'Харитаи шаҳр.' },
    { w: 'Car', t: 'Мошин', e: '🚗', ipa: '/kɑːr/', ex: 'A fast car.', exT: 'Мошини тез.' },
    { w: 'Train', t: 'Қатор', e: '🚆', ipa: '/treɪn/', ex: 'The train is late.', exT: 'Қатор дер кард.' },
    { w: 'Road', t: 'Роҳ', e: '🛣️', ipa: '/roʊd/', ex: 'A long road.', exT: 'Роҳи дароз.' },
  ]},
  { lvl: 'A2', title: 'Shopping', tt: 'Харид', emoji: '🛒', words: [
    { w: 'Money', t: 'Пул', e: '💰', ipa: '/ˈmʌni/', ex: 'I have money.', exT: 'Ман пул дорам.' },
    { w: 'Price', t: 'Нарх', e: '🏷️', ipa: '/praɪs/', ex: 'What is the price?', exT: 'Нарх чанд аст?' },
    { w: 'Shop', t: 'Мағоза', e: '🏪', ipa: '/ʃɒp/', ex: 'A new shop.', exT: 'Мағозаи нав.' },
    { w: 'Buy', t: 'Харидан', e: '🛍️', ipa: '/baɪ/', ex: 'I want to buy bread.', exT: 'Ман нон харидан мехоҳам.' },
    { w: 'Sell', t: 'Фурӯхтан', e: '💵', ipa: '/sel/', ex: 'They sell fruit.', exT: 'Онҳо мева мефурӯшанд.' },
    { w: 'Market', t: 'Бозор', e: '🛒', ipa: '/ˈmɑːrkɪt/', ex: 'The market is busy.', exT: 'Бозор серодам аст.' },
    { w: 'Cheap', t: 'Арзон', e: '📉', ipa: '/tʃiːp/', ex: 'This is cheap.', exT: 'Ин арзон аст.' },
    { w: 'Expensive', t: 'Қиммат', e: '📈', ipa: '/ɪkˈspensɪv/', ex: 'That is expensive.', exT: 'Он қиммат аст.' },
  ]},
  { lvl: 'A2', title: 'Home', tt: 'Хона', emoji: '🏠', words: [
    { w: 'House', t: 'Хона', e: '🏠', ipa: '/haʊs/', ex: 'A big house.', exT: 'Хонаи калон.' },
    { w: 'Door', t: 'Дар', e: '🚪', ipa: '/dɔːr/', ex: 'Open the door.', exT: 'Дарро кушоед.' },
    { w: 'Window', t: 'Тиреза', e: '🪟', ipa: '/ˈwɪndoʊ/', ex: 'Close the window.', exT: 'Тирезаро банд кунед.' },
    { w: 'Table', t: 'Миз', e: '🪑', ipa: '/ˈteɪbəl/', ex: 'A wooden table.', exT: 'Мизи чӯбин.' },
    { w: 'Chair', t: 'Курсӣ', e: '🪑', ipa: '/tʃer/', ex: 'Sit on the chair.', exT: 'Болои курсӣ нишинед.' },
    { w: 'Bed', t: 'Кат', e: '🛏️', ipa: '/bed/', ex: 'A soft bed.', exT: 'Кати нарм.' },
    { w: 'Kitchen', t: 'Ошхона', e: '🍳', ipa: '/ˈkɪtʃɪn/', ex: 'A clean kitchen.', exT: 'Ошхонаи тоза.' },
    { w: 'Room', t: 'Утоқ', e: '🚪', ipa: '/ruːm/', ex: 'A bright room.', exT: 'Утоқи равшан.' },
  ]},
  { lvl: 'A2', title: 'Weather', tt: 'Обу ҳаво', emoji: '🌤️', words: [
    { w: 'Sun', t: 'Офтоб', e: '☀️', ipa: '/sʌn/', ex: 'The sun is hot.', exT: 'Офтоб гарм аст.' },
    { w: 'Rain', t: 'Борон', e: '🌧️', ipa: '/reɪn/', ex: 'Heavy rain.', exT: 'Борони сахт.' },
    { w: 'Snow', t: 'Барф', e: '❄️', ipa: '/snoʊ/', ex: 'White snow.', exT: 'Барфи сафед.' },
    { w: 'Wind', t: 'Шамол', e: '💨', ipa: '/wɪnd/', ex: 'A cold wind.', exT: 'Шамоли хунук.' },
    { w: 'Cloud', t: 'Абр', e: '☁️', ipa: '/klaʊd/', ex: 'A grey cloud.', exT: 'Абри хокистарӣ.' },
    { w: 'Hot', t: 'Гарм', e: '🔥', ipa: '/hɒt/', ex: 'A hot day.', exT: 'Рӯзи гарм.' },
    { w: 'Cold', t: 'Хунук', e: '🥶', ipa: '/koʊld/', ex: 'Cold weather.', exT: 'Ҳавои хунук.' },
    { w: 'Warm', t: 'Гармак', e: '♨️', ipa: '/wɔːrm/', ex: 'Warm clothes.', exT: 'Либоси гармак.' },
  ]},
  { lvl: 'A2', title: 'Body & Health', tt: 'Бадан ва саломатӣ', emoji: '🩺', words: [
    { w: 'Head', t: 'Сар', e: '🧠', ipa: '/hed/', ex: 'My head hurts.', exT: 'Сарам дард мекунад.' },
    { w: 'Hand', t: 'Даст', e: '✋', ipa: '/hænd/', ex: 'Wash your hands.', exT: 'Дастонатонро шӯед.' },
    { w: 'Eye', t: 'Чашм', e: '👁️', ipa: '/aɪ/', ex: 'Beautiful eyes.', exT: 'Чашмони зебо.' },
    { w: 'Heart', t: 'Дил', e: '❤️', ipa: '/hɑːrt/', ex: 'A kind heart.', exT: 'Дили меҳрубон.' },
    { w: 'Doctor', t: 'Духтур', e: '👨‍⚕️', ipa: '/ˈdɒktər/', ex: 'Call the doctor.', exT: 'Ба духтур занг занед.' },
    { w: 'Medicine', t: 'Дору', e: '💊', ipa: '/ˈmedsən/', ex: 'Take the medicine.', exT: 'Доруро қабул кунед.' },
    { w: 'Sick', t: 'Бемор', e: '🤒', ipa: '/sɪk/', ex: 'He is sick.', exT: 'Ӯ бемор аст.' },
    { w: 'Healthy', t: 'Солим', e: '💪', ipa: '/ˈhelθi/', ex: 'Stay healthy.', exT: 'Солим бошед.' },
  ]},
  { lvl: 'A2', title: 'Work', tt: 'Кор', emoji: '💼', words: [
    { w: 'Job', t: 'Кор', e: '💼', ipa: '/dʒɒb/', ex: 'A good job.', exT: 'Кори хуб.' },
    { w: 'Office', t: 'Идора', e: '🏢', ipa: '/ˈɒfɪs/', ex: 'At the office.', exT: 'Дар идора.' },
    { w: 'Salary', t: 'Маош', e: '💵', ipa: '/ˈsæləri/', ex: 'A high salary.', exT: 'Маоши баланд.' },
    { w: 'Boss', t: 'Сардор', e: '👔', ipa: '/bɒs/', ex: 'My boss is busy.', exT: 'Сардори ман банд аст.' },
    { w: 'Meeting', t: 'Вохӯрӣ', e: '🤝', ipa: '/ˈmiːtɪŋ/', ex: 'A long meeting.', exT: 'Вохӯрии дароз.' },
    { w: 'Email', t: 'Почта', e: '📧', ipa: '/ˈiːmeɪl/', ex: 'Send an email.', exT: 'Почта фиристед.' },
    { w: 'Phone', t: 'Телефон', e: '📱', ipa: '/foʊn/', ex: 'Answer the phone.', exT: 'Ба телефон ҷавоб диҳед.' },
    { w: 'Computer', t: 'Компютер', e: '💻', ipa: '/kəmˈpjuːtər/', ex: 'A new computer.', exT: 'Компютери нав.' },
  ]},
  // ===== B1 =====
  { lvl: 'B1', title: 'Education', tt: 'Таҳсил', emoji: '🎓', words: [
    { w: 'School', t: 'Мактаб', e: '🏫', ipa: '/skuːl/', ex: 'A good school.', exT: 'Мактаби хуб.' },
    { w: 'Teacher', t: 'Муаллим', e: '👨‍🏫', ipa: '/ˈtiːtʃər/', ex: 'A kind teacher.', exT: 'Муаллими меҳрубон.' },
    { w: 'Student', t: 'Донишҷӯ', e: '🎓', ipa: '/ˈstuːdənt/', ex: 'A hard-working student.', exT: 'Донишҷӯи меҳнатӣ.' },
    { w: 'Book', t: 'Китоб', e: '📖', ipa: '/bʊk/', ex: 'An interesting book.', exT: 'Китоби ҷолиб.' },
    { w: 'Lesson', t: 'Дарс', e: '📝', ipa: '/ˈlesən/', ex: 'Today’s lesson.', exT: 'Дарси имрӯза.' },
    { w: 'Exam', t: 'Имтиҳон', e: '✍️', ipa: '/ɪɡˈzæm/', ex: 'A hard exam.', exT: 'Имтиҳони душвор.' },
    { w: 'Knowledge', t: 'Дониш', e: '💡', ipa: '/ˈnɒlɪdʒ/', ex: 'Knowledge is power.', exT: 'Дониш қудрат аст.' },
    { w: 'University', t: 'Донишгоҳ', e: '🏛️', ipa: '/ˌjuːnɪˈvɜːrsəti/', ex: 'A famous university.', exT: 'Донишгоҳи машҳур.' },
  ]},
  { lvl: 'B1', title: 'Technology', tt: 'Технология', emoji: '💻', words: [
    { w: 'Internet', t: 'Интернет', e: '🌐', ipa: '/ˈɪntərnet/', ex: 'Fast internet.', exT: 'Интернети тез.' },
    { w: 'Software', t: 'Нармафзор', e: '💾', ipa: '/ˈsɔːftwer/', ex: 'New software.', exT: 'Нармафзори нав.' },
    { w: 'Screen', t: 'Экран', e: '🖥️', ipa: '/skriːn/', ex: 'A bright screen.', exT: 'Экрани равшан.' },
    { w: 'Password', t: 'Рамзи махфӣ', e: '🔑', ipa: '/ˈpæswɜːrd/', ex: 'A strong password.', exT: 'Рамзи махфии қавӣ.' },
    { w: 'Data', t: 'Маълумот', e: '📊', ipa: '/ˈdeɪtə/', ex: 'Important data.', exT: 'Маълумоти муҳим.' },
    { w: 'Network', t: 'Шабака', e: '🔗', ipa: '/ˈnetwɜːrk/', ex: 'A social network.', exT: 'Шабакаи иҷтимоӣ.' },
    { w: 'Device', t: 'Дастгоҳ', e: '📲', ipa: '/dɪˈvaɪs/', ex: 'A smart device.', exT: 'Дастгоҳи ҳушманд.' },
    { w: 'Code', t: 'Код', e: '👨‍💻', ipa: '/koʊd/', ex: 'Clean code.', exT: 'Коди тоза.' },
  ]},
  { lvl: 'B1', title: 'Nature', tt: 'Табиат', emoji: '🌳', words: [
    { w: 'Tree', t: 'Дарахт', e: '🌳', ipa: '/triː/', ex: 'A tall tree.', exT: 'Дарахти баланд.' },
    { w: 'Flower', t: 'Гул', e: '🌸', ipa: '/ˈflaʊər/', ex: 'A red flower.', exT: 'Гули сурх.' },
    { w: 'River', t: 'Дарё', e: '🏞️', ipa: '/ˈrɪvər/', ex: 'A wide river.', exT: 'Дарёи васеъ.' },
    { w: 'Mountain', t: 'Кӯҳ', e: '⛰️', ipa: '/ˈmaʊntən/', ex: 'A high mountain.', exT: 'Кӯҳи баланд.' },
    { w: 'Sea', t: 'Баҳр', e: '🌊', ipa: '/siː/', ex: 'The deep sea.', exT: 'Баҳри чуқур.' },
    { w: 'Sky', t: 'Осмон', e: '🌌', ipa: '/skaɪ/', ex: 'A clear sky.', exT: 'Осмони соф.' },
    { w: 'Animal', t: 'Ҳайвон', e: '🐾', ipa: '/ˈænɪməl/', ex: 'A wild animal.', exT: 'Ҳайвони ваҳшӣ.' },
    { w: 'Bird', t: 'Парранда', e: '🐦', ipa: '/bɜːrd/', ex: 'A small bird.', exT: 'Паррандаи хурд.' },
  ]},
  { lvl: 'B1', title: 'Emotions', tt: 'Эҳсосот', emoji: '😊', words: [
    { w: 'Happy', t: 'Хушбахт', e: '😊', ipa: '/ˈhæpi/', ex: 'I am happy.', exT: 'Ман хушбахтам.' },
    { w: 'Sad', t: 'Ғамгин', e: '😢', ipa: '/sæd/', ex: 'Why are you sad?', exT: 'Чаро ғамгинӣ?' },
    { w: 'Angry', t: 'Хашмгин', e: '😠', ipa: '/ˈæŋɡri/', ex: 'Don’t be angry.', exT: 'Хашмгин нашав.' },
    { w: 'Afraid', t: 'Тарсон', e: '😨', ipa: '/əˈfreɪd/', ex: 'I am not afraid.', exT: 'Ман наметарсам.' },
    { w: 'Love', t: 'Муҳаббат', e: '❤️', ipa: '/lʌv/', ex: 'Love is beautiful.', exT: 'Муҳаббат зебо аст.' },
    { w: 'Hope', t: 'Умед', e: '🌟', ipa: '/hoʊp/', ex: 'Never lose hope.', exT: 'Ҳеҷ гоҳ умедро гум накун.' },
    { w: 'Fear', t: 'Тарс', e: '😰', ipa: '/fɪr/', ex: 'Fear is normal.', exT: 'Тарс муқаррарӣ аст.' },
    { w: 'Joy', t: 'Шодӣ', e: '😄', ipa: '/dʒɔɪ/', ex: 'Pure joy.', exT: 'Шодии холис.' },
  ]},
  { lvl: 'B1', title: 'City', tt: 'Шаҳр', emoji: '🏙️', words: [
    { w: 'City', t: 'Шаҳр', e: '🏙️', ipa: '/ˈsɪti/', ex: 'A big city.', exT: 'Шаҳри калон.' },
    { w: 'Street', t: 'Кӯча', e: '🛣️', ipa: '/striːt/', ex: 'A quiet street.', exT: 'Кӯчаи ором.' },
    { w: 'Building', t: 'Бино', e: '🏢', ipa: '/ˈbɪldɪŋ/', ex: 'A tall building.', exT: 'Бинои баланд.' },
    { w: 'Park', t: 'Боғ', e: '🌳', ipa: '/pɑːrk/', ex: 'A green park.', exT: 'Боғи сабз.' },
    { w: 'Bridge', t: 'Пул', e: '🌉', ipa: '/brɪdʒ/', ex: 'An old bridge.', exT: 'Пули кӯҳна.' },
    { w: 'Bank', t: 'Бонк', e: '🏦', ipa: '/bæŋk/', ex: 'Go to the bank.', exT: 'Ба бонк равед.' },
    { w: 'Hospital', t: 'Беморхона', e: '🏥', ipa: '/ˈhɒspɪtl/', ex: 'A new hospital.', exT: 'Беморхонаи нав.' },
    { w: 'Library', t: 'Китобхона', e: '📚', ipa: '/ˈlaɪbreri/', ex: 'A quiet library.', exT: 'Китобхонаи ором.' },
  ]},
  { lvl: 'B1', title: 'Hobbies', tt: 'Шуғлҳо', emoji: '🎨', words: [
    { w: 'Music', t: 'Мусиқӣ', e: '🎵', ipa: '/ˈmjuːzɪk/', ex: 'I love music.', exT: 'Ман мусиқиро дӯст медорам.' },
    { w: 'Sport', t: 'Варзиш', e: '⚽', ipa: '/spɔːrt/', ex: 'Play sport.', exT: 'Бо варзиш машғул шавед.' },
    { w: 'Game', t: 'Бозӣ', e: '🎮', ipa: '/ɡeɪm/', ex: 'A fun game.', exT: 'Бозии шавқовар.' },
    { w: 'Film', t: 'Филм', e: '🎬', ipa: '/fɪlm/', ex: 'A good film.', exT: 'Филми хуб.' },
    { w: 'Dance', t: 'Рақс', e: '💃', ipa: '/dæns/', ex: 'Let’s dance.', exT: 'Биё рақс кунем.' },
    { w: 'Travel', t: 'Сайёҳат', e: '🧳', ipa: '/ˈtrævəl/', ex: 'I like to travel.', exT: 'Ман сайёҳатро дӯст медорам.' },
    { w: 'Painting', t: 'Наққошӣ', e: '🎨', ipa: '/ˈpeɪntɪŋ/', ex: 'A beautiful painting.', exT: 'Наққошии зебо.' },
    { w: 'Reading', t: 'Хониш', e: '📖', ipa: '/ˈriːdɪŋ/', ex: 'Reading is useful.', exT: 'Хониш муфид аст.' },
  ]},
  // ===== B2 =====
  { lvl: 'B2', title: 'Business', tt: 'Тиҷорат', emoji: '📈', words: [
    { w: 'Company', t: 'Ширкат', e: '🏢', ipa: '/ˈkʌmpəni/', ex: 'A big company.', exT: 'Ширкати калон.' },
    { w: 'Profit', t: 'Фоида', e: '💰', ipa: '/ˈprɒfɪt/', ex: 'High profit.', exT: 'Фоидаи баланд.' },
    { w: 'Market', t: 'Бозор', e: '📊', ipa: '/ˈmɑːrkɪt/', ex: 'The world market.', exT: 'Бозори ҷаҳонӣ.' },
    { w: 'Contract', t: 'Шартнома', e: '📜', ipa: '/ˈkɒntrækt/', ex: 'Sign the contract.', exT: 'Шартномаро имзо кунед.' },
  ]},
  { lvl: 'B2', title: 'Science', tt: 'Илм', emoji: '🔬', words: [
    { w: 'Science', t: 'Илм', e: '🔬', ipa: '/ˈsaɪəns/', ex: 'Modern science.', exT: 'Илми муосир.' },
    { w: 'Energy', t: 'Энергия', e: '⚡', ipa: '/ˈenərdʒi/', ex: 'Solar energy.', exT: 'Энергияи офтобӣ.' },
    { w: 'Theory', t: 'Назария', e: '📐', ipa: '/ˈθɪəri/', ex: 'A new theory.', exT: 'Назарияи нав.' },
    { w: 'Research', t: 'Тадқиқот', e: '🧪', ipa: '/rɪˈsɜːrtʃ/', ex: 'Scientific research.', exT: 'Тадқиқоти илмӣ.' },
  ]},
  { lvl: 'B2', title: 'Culture', tt: 'Фарҳанг', emoji: '🎭', words: [
    { w: 'Culture', t: 'Фарҳанг', e: '🎭', ipa: '/ˈkʌltʃər/', ex: 'A rich culture.', exT: 'Фарҳанги бой.' },
    { w: 'History', t: 'Таърих', e: '📜', ipa: '/ˈhɪstri/', ex: 'Ancient history.', exT: 'Таърихи қадим.' },
    { w: 'Tradition', t: 'Анъана', e: '🎎', ipa: '/trəˈdɪʃən/', ex: 'An old tradition.', exT: 'Анъанаи кӯҳна.' },
    { w: 'Art', t: 'Санъат', e: '🖼️', ipa: '/ɑːrt/', ex: 'Modern art.', exT: 'Санъати муосир.' },
  ]},
  { lvl: 'B2', title: 'Media', tt: 'Расона', emoji: '📰', words: [
    { w: 'News', t: 'Хабар', e: '📰', ipa: '/njuːz/', ex: 'Good news.', exT: 'Хабари хуш.' },
    { w: 'Article', t: 'Мақола', e: '📄', ipa: '/ˈɑːrtɪkəl/', ex: 'A long article.', exT: 'Мақолаи дароз.' },
    { w: 'Report', t: 'Гузориш', e: '📋', ipa: '/rɪˈpɔːrt/', ex: 'A weekly report.', exT: 'Гузориши ҳафтаина.' },
    { w: 'Story', t: 'Ҳикоя', e: '📖', ipa: '/ˈstɔːri/', ex: 'A true story.', exT: 'Ҳикояи воқеӣ.' },
  ]},
  { lvl: 'B2', title: 'Law & Politics', tt: 'Қонун ва сиёсат', emoji: '⚖️', words: [
    { w: 'Law', t: 'Қонун', e: '⚖️', ipa: '/lɔː/', ex: 'Obey the law.', exT: 'Қонунро риоя кунед.' },
    { w: 'Government', t: 'Ҳукумат', e: '🏛️', ipa: '/ˈɡʌvərnmənt/', ex: 'The government decided.', exT: 'Ҳукумат қарор қабул кард.' },
    { w: 'Right', t: 'Ҳуқуқ', e: '✊', ipa: '/raɪt/', ex: 'Human rights.', exT: 'Ҳуқуқи инсон.' },
    { w: 'Freedom', t: 'Озодӣ', e: '🕊️', ipa: '/ˈfriːdəm/', ex: 'Freedom of speech.', exT: 'Озодии сухан.' },
  ]},
  { lvl: 'B2', title: 'Environment', tt: 'Муҳити зист', emoji: '🌍', words: [
    { w: 'Earth', t: 'Замин', e: '🌍', ipa: '/ɜːrθ/', ex: 'Protect the Earth.', exT: 'Заминро ҳифз кунед.' },
    { w: 'Climate', t: 'Иқлим', e: '🌡️', ipa: '/ˈklaɪmət/', ex: 'Climate change.', exT: 'Тағйири иқлим.' },
    { w: 'Pollution', t: 'Ифлосшавӣ', e: '🏭', ipa: '/pəˈluːʃən/', ex: 'Air pollution.', exT: 'Ифлосшавии ҳаво.' },
    { w: 'Future', t: 'Оянда', e: '🔮', ipa: '/ˈfjuːtʃər/', ex: 'A bright future.', exT: 'Ояндаи дурахшон.' },
  ]},
  // ===== C1 =====
  { lvl: 'C1', title: 'Abstract Ideas', tt: 'Мафҳумҳои абстрактӣ', emoji: '💭', words: [
    { w: 'Idea', t: 'Андеша', e: '💭', ipa: '/aɪˈdɪə/', ex: 'A brilliant idea.', exT: 'Андешаи олӣ.' },
    { w: 'Truth', t: 'Ҳақиқат', e: '💡', ipa: '/truːθ/', ex: 'Tell the truth.', exT: 'Ҳақиқатро бигӯ.' },
    { w: 'Meaning', t: 'Маъно', e: '📖', ipa: '/ˈmiːnɪŋ/', ex: 'The meaning of life.', exT: 'Маънои ҳаёт.' },
    { w: 'Reason', t: 'Сабаб', e: '🤔', ipa: '/ˈriːzən/', ex: 'The main reason.', exT: 'Сабаби асосӣ.' },
  ]},
  { lvl: 'C1', title: 'Academic', tt: 'Илмӣ', emoji: '📚', words: [
    { w: 'Analysis', t: 'Таҳлил', e: '📊', ipa: '/əˈnæləsɪs/', ex: 'A deep analysis.', exT: 'Таҳлили амиқ.' },
    { w: 'Argument', t: 'Баҳс', e: '🗣️', ipa: '/ˈɑːrɡjumənt/', ex: 'A strong argument.', exT: 'Баҳси қавӣ.' },
    { w: 'Concept', t: 'Мафҳум', e: '🧩', ipa: '/ˈkɒnsept/', ex: 'An abstract concept.', exT: 'Мафҳуми абстрактӣ.' },
    { w: 'Evidence', t: 'Далел', e: '🔍', ipa: '/ˈevɪdəns/', ex: 'Clear evidence.', exT: 'Далели равшан.' },
  ]},
  { lvl: 'C1', title: 'Literature', tt: 'Адабиёт', emoji: '📖', words: [
    { w: 'Poem', t: 'Шеър', e: '📜', ipa: '/ˈpoʊɪm/', ex: 'A famous poem.', exT: 'Шеъри машҳур.' },
    { w: 'Novel', t: 'Роман', e: '📕', ipa: '/ˈnɒvəl/', ex: 'A long novel.', exT: 'Романи дароз.' },
    { w: 'Writer', t: 'Нависанда', e: '✍️', ipa: '/ˈraɪtər/', ex: 'A great writer.', exT: 'Нависандаи бузург.' },
    { w: 'Poetry', t: 'Назм', e: '🪶', ipa: '/ˈpoʊətri/', ex: 'Classical poetry.', exT: 'Назми классикӣ.' },
  ]},
  { lvl: 'C1', title: 'Philosophy', tt: 'Фалсафа', emoji: '🧠', words: [
    { w: 'Wisdom', t: 'Хирад', e: '🦉', ipa: '/ˈwɪzdəm/', ex: 'Ancient wisdom.', exT: 'Хиради қадим.' },
    { w: 'Soul', t: 'Рӯҳ', e: '🌬️', ipa: '/soʊl/', ex: 'A pure soul.', exT: 'Рӯҳи пок.' },
    { w: 'Mind', t: 'Ақл', e: '🧠', ipa: '/maɪnd/', ex: 'A sharp mind.', exT: 'Ақли тез.' },
    { w: 'Belief', t: 'Эътиқод', e: '🙏', ipa: '/bɪˈliːf/', ex: 'A strong belief.', exT: 'Эътиқоди қавӣ.' },
  ]},
  { lvl: 'C1', title: 'Society', tt: 'Ҷомеа', emoji: '👥', words: [
    { w: 'Society', t: 'Ҷомеа', e: '👥', ipa: '/səˈsaɪəti/', ex: 'Modern society.', exT: 'Ҷомеаи муосир.' },
    { w: 'People', t: 'Мардум', e: '🧑‍🤝‍🧑', ipa: '/ˈpiːpəl/', ex: 'Kind people.', exT: 'Мардуми меҳрубон.' },
    { w: 'Community', t: 'Ҷамоат', e: '🏘️', ipa: '/kəˈmjuːnəti/', ex: 'A small community.', exT: 'Ҷамоати хурд.' },
    { w: 'Nation', t: 'Миллат', e: '🌐', ipa: '/ˈneɪʃən/', ex: 'A proud nation.', exT: 'Миллати ифтихорманд.' },
  ]},
  { lvl: 'C1', title: 'Achievement', tt: 'Дастовард', emoji: '🏆', words: [
    { w: 'Success', t: 'Муваффақият', e: '🏆', ipa: '/səkˈses/', ex: 'Great success.', exT: 'Муваффақияти бузург.' },
    { w: 'Goal', t: 'Ҳадаф', e: '🎯', ipa: '/ɡoʊl/', ex: 'Reach your goal.', exT: 'Ба ҳадафатон бирасед.' },
    { w: 'Effort', t: 'Кӯшиш', e: '💪', ipa: '/ˈefərt/', ex: 'Great effort.', exT: 'Кӯшиши зиёд.' },
    { w: 'Victory', t: 'Ғалаба', e: '🥇', ipa: '/ˈvɪktəri/', ex: 'A sweet victory.', exT: 'Ғалабаи ширин.' },
  ]},
];

// ── 4. UI translations (50+ keys × tg/ru/uz/en) ──────────────────────────────
const UI = {
  'common.continue':        { tg: 'Идома', ru: 'Продолжить', uz: 'Davom etish', en: 'Continue' },
  'common.back':            { tg: 'Бозгашт', ru: 'Назад', uz: 'Orqaga', en: 'Back' },
  'common.start':           { tg: 'Шурӯъ', ru: 'Начать', uz: 'Boshlash', en: 'Start' },
  'common.next':            { tg: 'Баъдӣ', ru: 'Далее', uz: 'Keyingi', en: 'Next' },
  'common.cancel':          { tg: 'Бекор кардан', ru: 'Отмена', uz: 'Bekor qilish', en: 'Cancel' },
  'common.save':            { tg: 'Захира кардан', ru: 'Сохранить', uz: 'Saqlash', en: 'Save' },
  'common.loading':         { tg: 'Боргузорӣ...', ru: 'Загрузка...', uz: 'Yuklanmoqda...', en: 'Loading...' },
  'common.error':           { tg: 'Хатогӣ рӯй дод', ru: 'Произошла ошибка', uz: 'Xatolik yuz berdi', en: 'An error occurred' },
  'common.retry':           { tg: 'Аз нав кӯшиш кунед', ru: 'Повторить', uz: 'Qayta urinish', en: 'Retry' },
  'onboarding.step1.title':    { tg: 'Кадом забонро медонед?', ru: 'Какой язык вы знаете?', uz: 'Qaysi tilni bilasiz?', en: 'Which language do you know?' },
  'onboarding.step1.subtitle': { tg: 'Забони модарии худро интихоб кунед', ru: 'Выберите ваш родной язык', uz: 'Ona tilingizni tanlang', en: 'Choose your native language' },
  'onboarding.step2.title':    { tg: 'Кадомро меомӯзед?', ru: 'Что хотите изучать?', uz: 'Nimani o‘rganmoqchisiz?', en: 'What do you want to learn?' },
  'onboarding.step2.subtitle': { tg: 'Забони омӯзишро интихоб кунед', ru: 'Выберите язык для изучения', uz: 'O‘rganish tilini tanlang', en: 'Choose a language to learn' },
  'onboarding.step3.title':    { tg: 'Сатҳи донишатон чӣ гуна аст?', ru: 'Какой у вас уровень?', uz: 'Darajangiz qanday?', en: 'What is your level?' },
  'onboarding.step3.subtitle': { tg: 'Аз ҳар куҷо шурӯъ кардан мумкин', ru: 'Можно начать с любого уровня', uz: 'Istalgan darajadan boshlash mumkin', en: 'You can start at any level' },
  'home.title':             { tg: 'Хона', ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' },
  'home.daily_goal':        { tg: 'Ҳадафи рӯзона', ru: 'Дневная цель', uz: 'Kunlik maqsad', en: 'Daily goal' },
  'home.streak':            { tg: 'Силсила', ru: 'Серия', uz: 'Ketma-ketlik', en: 'Streak' },
  'home.continue_learning': { tg: 'Идома диҳед', ru: 'Продолжить обучение', uz: 'O‘rganishni davom ettiring', en: 'Continue learning' },
  'home.xp':                { tg: 'Таҷриба', ru: 'Опыт', uz: 'Tajriba', en: 'XP' },
  'home.hearts':            { tg: 'Дилҳо', ru: 'Сердца', uz: 'Yuraklar', en: 'Hearts' },
  'lesson.complete':        { tg: 'Дарс тамом шуд', ru: 'Урок завершён', uz: 'Dars tugadi', en: 'Lesson complete' },
  'lesson.continue':        { tg: 'Идома додан', ru: 'Продолжить', uz: 'Davom etish', en: 'Continue' },
  'lesson.practice_again':  { tg: 'Аз нав машқ кунед', ru: 'Повторить', uz: 'Yana mashq qilish', en: 'Practice again' },
  'lesson.lives_empty':     { tg: 'Дилҳо тамом шуданд', ru: 'Сердца закончились', uz: 'Yuraklar tugadi', en: 'Out of hearts' },
  'lesson.new_word':        { tg: 'Калимаи нав', ru: 'Новое слово', uz: 'Yangi so‘z', en: 'New word' },
  'lesson.choose_translation': { tg: 'Тарҷумаро интихоб кунед', ru: 'Выберите перевод', uz: 'Tarjimani tanlang', en: 'Choose the translation' },
  'lesson.listen':          { tg: 'Гӯш кунед', ru: 'Слушайте', uz: 'Tinglang', en: 'Listen' },
  'lesson.speak':           { tg: 'Гӯед', ru: 'Говорите', uz: 'Gapiring', en: 'Speak' },
  'lesson.type_answer':     { tg: 'Ҷавобро нависед', ru: 'Введите ответ', uz: 'Javobni yozing', en: 'Type the answer' },
  'lesson.correct':         { tg: 'Дуруст!', ru: 'Верно!', uz: 'To‘g‘ri!', en: 'Correct!' },
  'lesson.wrong':           { tg: 'Хато шуд', ru: 'Неверно', uz: 'Noto‘g‘ri', en: 'Wrong' },
  'lesson.streak_days':     { tg: 'рӯзи паиҳам', ru: 'дней подряд', uz: 'kun ketma-ket', en: 'day streak' },
  'profile.title':          { tg: 'Профил', ru: 'Профиль', uz: 'Profil', en: 'Profile' },
  'profile.settings':       { tg: 'Танзимот', ru: 'Настройки', uz: 'Sozlamalar', en: 'Settings' },
  'profile.logout':         { tg: 'Баромадан', ru: 'Выйти', uz: 'Chiqish', en: 'Log out' },
  'profile.change_native':  { tg: 'Иваз кардани забони интерфейс', ru: 'Сменить язык интерфейса', uz: 'Interfeys tilini o‘zgartirish', en: 'Change interface language' },
  'profile.change_target':  { tg: 'Иваз кардани забони ёдгирӣ', ru: 'Сменить язык изучения', uz: 'O‘rganish tilini o‘zgartirish', en: 'Change learning language' },
  'nav.home':               { tg: 'Хона', ru: 'Главная', uz: 'Bosh', en: 'Home' },
  'nav.learn':              { tg: 'Омӯзиш', ru: 'Учёба', uz: 'O‘rganish', en: 'Learn' },
  'nav.leaderboard':        { tg: 'Рейтинг', ru: 'Рейтинг', uz: 'Reyting', en: 'Leaderboard' },
  'nav.profile':            { tg: 'Профил', ru: 'Профиль', uz: 'Profil', en: 'Profile' },
  'level.beginner':         { tg: 'Навомӯз', ru: 'Начинающий', uz: 'Boshlang‘ich', en: 'Beginner' },
  'level.elementary':       { tg: 'Ибтидоӣ', ru: 'Элементарный', uz: 'Elementar', en: 'Elementary' },
  'level.intermediate':     { tg: 'Миёна', ru: 'Средний', uz: 'O‘rta', en: 'Intermediate' },
  'level.upper':            { tg: 'Болотар аз миёна', ru: 'Выше среднего', uz: 'O‘rtadan yuqori', en: 'Upper-intermediate' },
  'level.advanced':         { tg: 'Пешрафта', ru: 'Продвинутый', uz: 'Ilg‘or', en: 'Advanced' },
  'course.locked':          { tg: 'Баста', ru: 'Заблокировано', uz: 'Qulflangan', en: 'Locked' },
  'course.unlock_premium':  { tg: 'Бо Premium кушоед', ru: 'Откройте с Premium', uz: 'Premium bilan oching', en: 'Unlock with Premium' },
  'words.learned':          { tg: 'Калимаҳои омӯхташуда', ru: 'Изучено слов', uz: 'O‘rganilgan so‘zlar', en: 'Words learned' },
  'achievements.title':     { tg: 'Дастовардҳо', ru: 'Достижения', uz: 'Yutuqlar', en: 'Achievements' },
};

// ── Build the resolved course tree (for JSON export + DB insert) ──────────────
function buildCourseTree() {
  return LEVELS.map((lvl) => {
    const themes = MODULES.filter((m) => m.lvl === lvl.level);
    return {
      ...lvl,
      modules: themes.map((theme) => {
        const half = Math.ceil(theme.words.length / 2);
        const parts = [theme.words.slice(0, half), theme.words.slice(half)];
        return {
          title: theme.title,
          titleTranslated: theme.tt,
          emoji: theme.emoji,
          lessons: parts.map((words, i) => ({
            title: `${theme.title} · Part ${i + 1}`,
            titleTranslated: `${theme.tt} · Қисми ${i + 1}`,
            type: 'vocab',
            emoji: theme.emoji,
            words,
          })),
        };
      }),
    };
  });
}

async function main() {
  const courseTree = buildCourseTree();
  const seedData = { languages: LANGUAGES, courses: courseTree, ui: UI };

  // Persist for the HTTP re-seed route.
  writeFileSync(join(__dirname, 'seed-data.json'), JSON.stringify(seedData, null, 2), 'utf8');

  // 1. Languages (upsert by code)
  const langByCode = {};
  for (const l of LANGUAGES) {
    const lang = await prisma.language.upsert({
      where: { code: l.code },
      create: l,
      update: l,
    });
    langByCode[l.code] = lang;
  }

  // 2. Wipe existing content (idempotent re-seed)
  await prisma.userProgress.deleteMany({});
  await prisma.word.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});

  const target = langByCode['en'];
  const native = langByCode['tg'];

  let courseN = 0, moduleN = 0, lessonN = 0, wordN = 0;

  // 3. Courses → Modules → Lessons → Words
  for (let ci = 0; ci < courseTree.length; ci++) {
    const c = courseTree[ci];
    const course = await prisma.course.create({
      data: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: c.level,
        title: c.title,
        description: c.description,
        emoji: c.emoji,
        color: c.color,
        order: ci,
        isActive: true,
      },
    });
    courseN++;

    for (let mi = 0; mi < c.modules.length; mi++) {
      const m = c.modules[mi];
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: m.title,
          titleTranslated: m.titleTranslated,
          emoji: m.emoji,
          order: mi,
          isPremium: ci > 0, // A1 free, rest premium
          isActive: true,
        },
      });
      moduleN++;

      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: l.title,
            titleTranslated: l.titleTranslated,
            type: l.type,
            emoji: l.emoji,
            xpReward: 60,
            duration: 5,
            order: li,
            isPremium: ci > 0,
            isActive: true,
          },
        });
        lessonN++;

        await prisma.word.createMany({
          data: l.words.map((w, wi) => ({
            lessonId: lesson.id,
            word: w.w,
            translation: w.t,
            emoji: w.e ?? null,
            ipa: w.ipa ?? null,
            example: w.ex ?? null,
            exampleTrans: w.exT ?? null,
            difficulty: 1,
            order: wi,
          })),
        });
        wordN += l.words.length;
      }
    }
  }

  // 4. UI translations for native-capable languages
  let uiN = 0;
  for (const code of ['tg', 'ru', 'uz', 'en']) {
    const lang = langByCode[code];
    if (!lang) continue;
    for (const [key, vals] of Object.entries(UI)) {
      const value = vals[code] ?? vals.en ?? key;
      await prisma.uiTranslation.upsert({
        where: { languageId_key: { languageId: lang.id, key } },
        create: { languageId: lang.id, key, value },
        update: { value },
      });
      uiN++;
    }
  }

  console.log(JSON.stringify({
    languages: LANGUAGES.length,
    courses: courseN, modules: moduleN, lessons: lessonN, words: wordN,
    uiTranslations: uiN,
  }));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
