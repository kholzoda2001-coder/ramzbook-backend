const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile();

function tuneDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;
  const url = new URL(process.env.DATABASE_URL);
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1');
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '60');
  process.env.DATABASE_URL = url.toString();
}

tuneDatabaseUrl();

const prisma = new PrismaClient();
const TARGET_CODE = process.argv[2] || 'en';
const NATIVE_CODE = process.argv[3] || 'tg';
const LEVEL = 'A1';

const MODULE_ORDER = [
  'Alphabet & Sounds',
  'Greetings & Introductions',
  'Numbers, Time & Dates',
  'Me & Family',
  'Colors, Objects & Classroom',
  'Food & Drink',
  'My Day',
  'Home & Rooms',
  'Clothes & Weather',
  'Transport & Travel',
  'Health & Help',
  'Work & School',
  'Places & Directions',
  'Ability & Now',
  'Writing & Listening',
  'Shopping & Review',
];

const EXPANSION_MODULES = [
  {
    title: 'Home & Rooms',
    titleTranslated: 'Хона ва ҳуҷраҳо',
    emoji: '🏠',
    color: '#22C55E',
    grammar: {
      key: 'home_prepositions',
      title: 'Prepositions in the room',
      titleTranslated: 'Пешояндҳо дар ҳуҷра',
      explanation: 'Барои гуфтани ҷойи ашё дар A1 аз **in**, **on**, **under**, **next to** ва **behind** истифода мекунем.',
      examples: [
        ['The book is on the table.', 'Китоб рӯи миз аст.', 'on'],
        ['The bag is under the chair.', 'Халта зери курсӣ аст.', 'under'],
        ['The bed is next to the window.', 'Кат назди тиреза аст.', 'next to'],
      ],
      rules: [
        ['In + place', 'Дар дохили чизе: in the room, in the bag.'],
        ['On + surface', 'Рӯи чизе: on the table, on the bed.'],
        ['Under / behind / next to', 'Барои ҷойи содда дар ҳуҷра.'],
      ],
      exercises: [
        ['choose', 'The lamp is ___ the table.', 'Чароғ рӯи миз аст.', 'on', ['in', 'on', 'under'], 'Рӯи миз → on.'],
        ['choose', 'The shoes are ___ the bed.', 'Пойафзолҳо зери катанд.', 'under', ['on', 'under', 'next to'], 'Зери кат → under.'],
      ],
    },
    reading: {
      title: 'Reading: My room',
      titleTranslated: 'Хониш: Ҳуҷраи ман',
      passage: 'My room is small. There is a bed, a desk, and a chair. My bag is under the desk. My books are on the shelf.',
      passageTranslated: 'Ҳуҷраи ман хурд аст. Дар он кат, миз ва курсӣ ҳаст. Халтаи ман зери миз аст. Китобҳои ман рӯи раф ҳастанд.',
      questions: [
        ['Is the room big?', ['Yes, it is', 'No, it is small', 'It is a shop'], 1, 'Дар матн гуфта шудааст: small.'],
        ['Where is the bag?', ['On the bed', 'Under the desk', 'Near the door'], 1, 'Bag is under the desk.'],
      ],
    },
    lessons: [
      ['vocab', 'Home places', 'Ҷойҳои хона', '🏠', [['House', 'Хона'], ['Room', 'Ҳуҷра'], ['Kitchen', 'Ошхона'], ['Bedroom', 'Хонаи хоб'], ['Bathroom', 'Ҳаммом'], ['Living room', 'Меҳмонхона'], ['Door', 'Дар'], ['Window', 'Тиреза'], ['Floor', 'Фарш'], ['Wall', 'Девор'], ['Roof', 'Бом'], ['Garden', 'Боғча']]],
      ['vocab', 'Furniture', 'Мебел', '🛏️', [['Table', 'Миз'], ['Chair', 'Курсӣ'], ['Bed', 'Кат'], ['Sofa', 'Диван'], ['Shelf', 'Раф'], ['Lamp', 'Чароғ'], ['Cupboard', 'Ҷевон'], ['Mirror', 'Оина'], ['Carpet', 'Қолин'], ['Desk', 'Мизи корӣ'], ['Clock', 'Соат'], ['Key', 'Калид']]],
      ['grammar', 'Room prepositions', 'Пешояндҳои ҳуҷра', '📍'],
      ['listening', 'Listen: My room', 'Шунавоӣ: Ҳуҷраи ман', '🎧', [['My room is small', 'Ҳуҷраи ман хурд аст'], ['The chair is near the table', 'Курсӣ назди миз аст'], ['The book is on the shelf', 'Китоб рӯи раф аст'], ['Open the door', 'Дарро кушоед'], ['Close the window', 'Тирезаро пӯшед'], ['Where is the key?', 'Калид дар куҷост?']]],
      ['speaking', 'Speak: Describe a room', 'Гуфтор: Ҳуҷраро тасвир кунед', '🎤', [['This is my room', 'Ин ҳуҷраи ман аст'], ['There is a bed', 'Кат ҳаст'], ['The desk is near the window', 'Миз назди тиреза аст'], ['My bag is under the chair', 'Халтаи ман зери курсӣ аст'], ['The room is clean', 'Ҳуҷра тоза аст'], ['I like my home', 'Ман хонаи худро дӯст медорам']]],
      ['reading', 'Reading: My room', 'Хониш: Ҳуҷраи ман', '📖'],
      ['writing', 'Write: My home', 'Навиштан: Хонаи ман', '✍️', [['My home is small', 'Хонаи ман хурд аст'], ['There is a kitchen', 'Ошхона ҳаст'], ['My room has a bed', 'Дар ҳуҷраи ман кат ҳаст'], ['The table is near the window', 'Миз назди тиреза аст'], ['I like my room', 'Ман ҳуҷраи худро дӯст медорам'], ['This is my house', 'Ин хонаи ман аст']]],
      ['review', 'Checkpoint: Home mission', 'Санҷиш: Хона', '🎯', [['House', 'Хона'], ['Kitchen', 'Ошхона'], ['Bedroom', 'Хонаи хоб'], ['Table', 'Миз'], ['Chair', 'Курсӣ'], ['The book is on the table', 'Китоб рӯи миз аст'], ['There is a bed', 'Кат ҳаст'], ['Where is the key?', 'Калид дар куҷост?']]],
    ],
  },
  {
    title: 'Clothes & Weather',
    titleTranslated: 'Либос ва ҳаво',
    emoji: '🌦️',
    color: '#38BDF8',
    grammar: {
      key: 'weather_it_is',
      title: 'It is / It is not',
      titleTranslated: 'It is / It is not',
      explanation: 'Барои ҳаво ва ҳолати умумӣ дар A1 аз **It is** ва **It is not** истифода мекунем: It is cold. It is not hot.',
      examples: [
        ['It is sunny today.', 'Имрӯз офтобӣ аст.', 'It is'],
        ['It is not cold.', 'Ҳаво хунук нест.', 'not'],
        ['My jacket is blue.', 'Куртаи ман кабуд аст.', 'is'],
      ],
      rules: [
        ['It is + adjective', 'Барои ҳаво: It is hot/cold/sunny.'],
        ['It is not + adjective', 'Инкор: It is not rainy.'],
      ],
      exercises: [
        ['choose', 'It ___ cold today.', 'Имрӯз ҳаво хунук аст.', 'is', ['am', 'is', 'are'], 'Барои weather → It is.'],
        ['choose', 'It is ___ sunny.', 'Офтобӣ нест.', 'not', ['no', 'not', 'am'], 'Инкор бо not.'],
      ],
    },
    reading: {
      title: 'Reading: A rainy day',
      titleTranslated: 'Хониш: Рӯзи боронӣ',
      passage: 'Today it is rainy and cold. I wear a jacket and black shoes. My sister wears a red dress. We take an umbrella.',
      passageTranslated: 'Имрӯз ҳаво боронӣ ва хунук аст. Ман курта ва пойафзоли сиёҳ мепӯшам. Хоҳари ман куртаи сурх мепӯшад. Мо чатр мегирем.',
      questions: [
        ['What is the weather like?', ['Sunny and hot', 'Rainy and cold', 'Windy and warm'], 1, 'Rainy and cold.'],
        ['What do they take?', ['An umbrella', 'A ticket', 'A bottle'], 0, 'Онҳо umbrella мегиранд.'],
      ],
    },
    lessons: [
      ['vocab', 'Clothes', 'Либосҳо', '👕', [['Shirt', 'Курта'], ['T-shirt', 'Футболка'], ['Dress', 'Куртаи занона'], ['Jacket', 'Куртка'], ['Coat', 'Палто'], ['Trousers', 'Шим'], ['Skirt', 'Юбка'], ['Shoes', 'Пойафзол'], ['Hat', 'Кулоҳ'], ['Socks', 'Ҷӯроб'], ['Scarf', 'Шарф'], ['Gloves', 'Дастпӯшак']]],
      ['vocab', 'Weather', 'Ҳаво', '☀️', [['Weather', 'Ҳаво'], ['Sunny', 'Офтобӣ'], ['Rainy', 'Боронӣ'], ['Cloudy', 'Абрнок'], ['Windy', 'Шамолнок'], ['Snowy', 'Барфӣ'], ['Hot', 'Гарм'], ['Cold', 'Хунук'], ['Warm', 'Гарм/мулоим'], ['Cool', 'Салқин'], ['Umbrella', 'Чатр'], ['Today', 'Имрӯз']]],
      ['grammar', 'Weather with it is', 'Ҳаво бо it is', '🌡️'],
      ['listening', 'Listen: Weather report', 'Шунавоӣ: Хабари ҳаво', '🎧', [['It is sunny today', 'Имрӯз офтобӣ аст'], ['It is cold in the morning', 'Саҳар ҳаво хунук аст'], ['Take your umbrella', 'Чатратро гир'], ['Wear a jacket', 'Куртка пӯш'], ['My shoes are black', 'Пойафзоли ман сиёҳ аст'], ['The dress is red', 'Курта сурх аст']]],
      ['speaking', 'Speak: Clothes and weather', 'Гуфтор: Либос ва ҳаво', '🎤', [['It is cold today', 'Имрӯз ҳаво хунук аст'], ['I wear a jacket', 'Ман куртка мепӯшам'], ['My shoes are black', 'Пойафзоли ман сиёҳ аст'], ['I need an umbrella', 'Ба ман чатр лозим аст'], ['It is not hot', 'Ҳаво гарм нест'], ['This shirt is blue', 'Ин курта кабуд аст']]],
      ['reading', 'Reading: A rainy day', 'Хониш: Рӯзи боронӣ', '📖'],
      ['writing', 'Write: Weather today', 'Навиштан: Ҳавои имрӯз', '✍️', [['Today it is sunny', 'Имрӯз офтобӣ аст'], ['It is not cold', 'Ҳаво хунук нест'], ['I wear a shirt', 'Ман курта мепӯшам'], ['My jacket is blue', 'Курткаи ман кабуд аст'], ['I take an umbrella', 'Ман чатр мегирам'], ['The weather is good', 'Ҳаво хуб аст']]],
      ['review', 'Checkpoint: Weather mission', 'Санҷиш: Либос ва ҳаво', '🎯', [['Sunny', 'Офтобӣ'], ['Rainy', 'Боронӣ'], ['Jacket', 'Куртка'], ['Shoes', 'Пойафзол'], ['It is cold', 'Ҳаво хунук аст'], ['Wear a coat', 'Палто пӯш'], ['Take an umbrella', 'Чатр гир'], ['Today it is warm', 'Имрӯз ҳаво гарм аст']]],
    ],
  },
  {
    title: 'Transport & Travel',
    titleTranslated: 'Нақлиёт ва сафар',
    emoji: '🚌',
    color: '#F59E0B',
    grammar: {
      key: 'want_need',
      title: 'I want / I need',
      titleTranslated: 'I want / I need',
      explanation: 'Дар A1 барои хоҳиш ва зарурат аз **I want** ва **I need** истифода мекунем: I need a ticket. I want water.',
      examples: [
        ['I need a ticket.', 'Ба ман билет лозим аст.', 'need'],
        ['I want a taxi.', 'Ман таксӣ мехоҳам.', 'want'],
        ['We need the bus station.', 'Ба мо истгоҳи автобус лозим аст.', 'need'],
      ],
      rules: [
        ['I need + noun', 'Зарурат: I need a ticket.'],
        ['I want + noun', 'Хоҳиш: I want a taxi.'],
      ],
      exercises: [
        ['choose', 'I ___ a ticket.', 'Ба ман билет лозим аст.', 'need', ['need', 'am', 'is'], 'Зарурат → need.'],
        ['choose', 'I ___ a taxi.', 'Ман таксӣ мехоҳам.', 'want', ['want', 'are', 'does'], 'Хоҳиш → want.'],
      ],
    },
    reading: {
      title: 'Reading: At the bus station',
      titleTranslated: 'Хониш: Дар истгоҳи автобус',
      passage: 'Ali is at the bus station. He needs a ticket to Dushanbe. The bus leaves at nine o’clock. The ticket is cheap.',
      passageTranslated: 'Алӣ дар истгоҳи автобус аст. Ба ӯ билет ба Душанбе лозим аст. Автобус соати нӯҳ меравад. Билет арзон аст.',
      questions: [
        ['Where is Ali?', ['At school', 'At the bus station', 'At home'], 1, 'Ali is at the bus station.'],
        ['What does he need?', ['A ticket', 'A jacket', 'A doctor'], 0, 'He needs a ticket.'],
      ],
    },
    lessons: [
      ['vocab', 'Transport', 'Нақлиёт', '🚌', [['Bus', 'Автобус'], ['Taxi', 'Таксӣ'], ['Car', 'Мошин'], ['Train', 'Қатора'], ['Plane', 'Ҳавопаймо'], ['Bicycle', 'Велосипед'], ['Metro', 'Метро'], ['Station', 'Истгоҳ'], ['Airport', 'Фурудгоҳ'], ['Ticket', 'Билет'], ['Road', 'Роҳ'], ['Driver', 'Ронанда']]],
      ['vocab', 'Travel words', 'Калимаҳои сафар', '🎫', [['Travel', 'Сафар'], ['Trip', 'Сафар'], ['Map', 'Харита'], ['Bag', 'Халта'], ['Passport', 'Шиноснома'], ['Hotel', 'Меҳмонхона'], ['Street', 'Кӯча'], ['Address', 'Суроға'], ['Left', 'Чап'], ['Right', 'Рост'], ['Near', 'Наздик'], ['Far', 'Дур']]],
      ['grammar', 'Want and need', 'Want ва need', '🎫'],
      ['listening', 'Listen: Buying a ticket', 'Шунавоӣ: Харидани билет', '🎧', [['I need a ticket', 'Ба ман билет лозим аст'], ['One ticket to Dushanbe', 'Як билет ба Душанбе'], ['The bus is here', 'Автобус ин ҷост'], ['The taxi is outside', 'Таксӣ берун аст'], ['How much is the ticket?', 'Билет чанд пул аст?'], ['The station is near', 'Истгоҳ наздик аст']]],
      ['speaking', 'Speak: Travel help', 'Гуфтор: Кӯмак дар сафар', '🎤', [['I need a ticket', 'Ба ман билет лозим аст'], ['Where is the station?', 'Истгоҳ дар куҷост?'], ['I want a taxi', 'Ман таксӣ мехоҳам'], ['Is it far?', 'Ин дур аст?'], ['Turn right', 'Ба рост гардед'], ['Thank you for your help', 'Барои кӯмак ташаккур']]],
      ['reading', 'Reading: At the bus station', 'Хониш: Дар истгоҳи автобус', '📖'],
      ['writing', 'Write: Travel notes', 'Навиштан: Қайдҳои сафар', '✍️', [['I need a ticket', 'Ба ман билет лозим аст'], ['The bus is at nine', 'Автобус соати нӯҳ аст'], ['The station is near', 'Истгоҳ наздик аст'], ['I have a map', 'Ман харита дорам'], ['The taxi is here', 'Таксӣ ин ҷост'], ['My bag is small', 'Халтаи ман хурд аст']]],
      ['review', 'Checkpoint: Travel mission', 'Санҷиш: Сафар', '🎯', [['Bus', 'Автобус'], ['Taxi', 'Таксӣ'], ['Ticket', 'Билет'], ['Station', 'Истгоҳ'], ['I need a ticket', 'Ба ман билет лозим аст'], ['Where is the station?', 'Истгоҳ дар куҷост?'], ['Turn right', 'Ба рост гардед'], ['The bus is here', 'Автобус ин ҷост']]],
    ],
  },
  {
    title: 'Health & Help',
    titleTranslated: 'Саломатӣ ва кӯмак',
    emoji: '🩺',
    color: '#EF4444',
    grammar: {
      key: 'feel_have_pain',
      title: 'I feel / I have',
      titleTranslated: 'I feel / I have',
      explanation: 'Барои саломатӣ дар A1 ҷумлаҳои кӯтоҳ истифода мешаванд: **I feel sick**, **I have a headache**, **I need help**.',
      examples: [
        ['I feel sick.', 'Ман худро бемор ҳис мекунам.', 'feel'],
        ['I have a headache.', 'Сарам дард мекунад.', 'have'],
        ['I need help.', 'Ба ман кӯмак лозим аст.', 'need'],
      ],
      rules: [
        ['I feel + adjective', 'Ҳолат: I feel tired/sick.'],
        ['I have + pain/problem', 'Дард: I have a headache.'],
      ],
      exercises: [
        ['choose', 'I ___ sick.', 'Ман худро бемор ҳис мекунам.', 'feel', ['feel', 'am have', 'does'], 'Feel + adjective.'],
        ['choose', 'I ___ a headache.', 'Сарам дард мекунад.', 'have', ['have', 'feel', 'are'], 'Have + headache.'],
      ],
    },
    reading: {
      title: 'Reading: At the doctor',
      titleTranslated: 'Хониш: Назди духтур',
      passage: 'Mina feels sick. She has a headache and a sore throat. She goes to the doctor. The doctor says, “Drink water and rest.”',
      passageTranslated: 'Мина худро бемор ҳис мекунад. Сараш ва гулӯяш дард мекунад. Ӯ назди духтур меравад. Духтур мегӯяд: “Об нӯш ва истироҳат кун.”',
      questions: [
        ['How does Mina feel?', ['Happy', 'Sick', 'Hungry'], 1, 'Mina feels sick.'],
        ['What does the doctor say?', ['Run fast', 'Drink water and rest', 'Buy a ticket'], 1, 'Drink water and rest.'],
      ],
    },
    lessons: [
      ['vocab', 'Body and health', 'Бадан ва саломатӣ', '🩺', [['Head', 'Сар'], ['Eye', 'Чашм'], ['Ear', 'Гӯш'], ['Mouth', 'Даҳон'], ['Hand', 'Даст'], ['Foot', 'Пой'], ['Stomach', 'Шикам'], ['Back', 'Пушт'], ['Doctor', 'Духтур'], ['Medicine', 'Дору'], ['Hospital', 'Беморхона'], ['Pain', 'Дард']]],
      ['vocab', 'Feelings and help', 'Ҳиссиёт ва кӯмак', '🆘', [['Sick', 'Бемор'], ['Tired', 'Хаста'], ['Hungry', 'Гурусна'], ['Thirsty', 'Ташна'], ['Better', 'Беҳтар'], ['Help', 'Кӯмак'], ['Rest', 'Истироҳат'], ['Drink', 'Нӯшидан'], ['Call', 'Занг задан'], ['Please', 'Лутфан'], ['Emergency', 'Ҳолати фавқулода'], ['Pharmacy', 'Дорухона']]],
      ['grammar', 'I feel and I have', 'I feel ва I have', '🤒'],
      ['listening', 'Listen: I need help', 'Шунавоӣ: Ба ман кӯмак лозим аст', '🎧', [['I feel sick', 'Ман худро бемор ҳис мекунам'], ['I have a headache', 'Сарам дард мекунад'], ['I need a doctor', 'Ба ман духтур лозим аст'], ['Drink water', 'Об нӯш'], ['Please help me', 'Лутфан ба ман кӯмак кунед'], ['I am tired', 'Ман хаста ҳастам']]],
      ['speaking', 'Speak: Health help', 'Гуфтор: Кӯмаки саломатӣ', '🎤', [['I need help', 'Ба ман кӯмак лозим аст'], ['I feel sick', 'Ман худро бемор ҳис мекунам'], ['My head hurts', 'Сарам дард мекунад'], ['Where is the doctor?', 'Духтур дар куҷост?'], ['I need medicine', 'Ба ман дору лозим аст'], ['Thank you, doctor', 'Ташаккур, духтур']]],
      ['reading', 'Reading: At the doctor', 'Хониш: Назди духтур', '📖'],
      ['writing', 'Write: Health message', 'Навиштан: Паёми саломатӣ', '✍️', [['I feel sick', 'Ман худро бемор ҳис мекунам'], ['I have a headache', 'Сарам дард мекунад'], ['I need help', 'Ба ман кӯмак лозим аст'], ['I am tired', 'Ман хаста ҳастам'], ['Drink water', 'Об нӯш'], ['Call the doctor', 'Ба духтур занг зан']]],
      ['review', 'Checkpoint: Health mission', 'Санҷиш: Саломатӣ', '🎯', [['Doctor', 'Духтур'], ['Medicine', 'Дору'], ['Hospital', 'Беморхона'], ['I feel sick', 'Ман бемор ҳастам'], ['I need help', 'Ба ман кӯмак лозим аст'], ['I have a headache', 'Сарам дард мекунад'], ['Drink water', 'Об нӯш'], ['Please help me', 'Лутфан ба ман кӯмак кунед']]],
    ],
  },
  {
    title: 'Work & School',
    titleTranslated: 'Кор ва мактаб',
    emoji: '🎒',
    color: '#8B5CF6',
    grammar: {
      key: 'want_to_be',
      title: 'I want to be',
      titleTranslated: 'I want to be',
      explanation: 'Барои гуфтани орзу ё касб дар A1: **I want to be a doctor**, **She is a teacher**, **He works at school**.',
      examples: [
        ['I want to be a teacher.', 'Ман мехоҳам муаллим шавам.', 'want to be'],
        ['She is a doctor.', 'Ӯ духтур аст.', 'is'],
        ['He works at a shop.', 'Ӯ дар мағоза кор мекунад.', 'works'],
      ],
      rules: [
        ['I want to be + job', 'Орзу/мақсад: I want to be a doctor.'],
        ['Subject + work/works', 'I work, he works, she works.'],
      ],
      exercises: [
        ['choose', 'I want to ___ a teacher.', 'Ман мехоҳам муаллим шавам.', 'be', ['be', 'am', 'is'], 'Want to be.'],
        ['choose', 'She ___ at school.', 'Ӯ дар мактаб кор мекунад.', 'works', ['work', 'works', 'working'], 'She/he/it + works.'],
      ],
    },
    reading: {
      title: 'Reading: My school day',
      titleTranslated: 'Хониш: Рӯзи мактабии ман',
      passage: 'I am a student. I go to school at eight o’clock. I study English and math. My teacher is kind. After school, I do homework.',
      passageTranslated: 'Ман донишҷӯ ҳастам. Соати ҳашт ба мактаб меравам. Англисӣ ва математика мехонам. Муаллими ман меҳрубон аст. Баъди мактаб вазифаи хонагӣ мекунам.',
      questions: [
        ['What does the person study?', ['English and math', 'Only music', 'Medicine'], 0, 'English and math.'],
        ['What does the person do after school?', ['Buy shoes', 'Do homework', 'Take a taxi'], 1, 'After school, I do homework.'],
      ],
    },
    lessons: [
      ['vocab', 'Jobs', 'Касбҳо', '👩‍🏫', [['Teacher', 'Муаллим'], ['Student', 'Донишҷӯ'], ['Doctor', 'Духтур'], ['Driver', 'Ронанда'], ['Shop assistant', 'Фурӯшанда'], ['Cook', 'Ошпаз'], ['Farmer', 'Деҳқон'], ['Engineer', 'Муҳандис'], ['Nurse', 'Ҳамшира'], ['Worker', 'Коргар'], ['Police officer', 'Корманди полис'], ['Office', 'Идора']]],
      ['vocab', 'School and work words', 'Калимаҳои мактаб ва кор', '📚', [['School', 'Мактаб'], ['Class', 'Синф'], ['Lesson', 'Дарс'], ['Homework', 'Вазифаи хонагӣ'], ['Exam', 'Имтиҳон'], ['Book', 'Китоб'], ['Notebook', 'Дафтар'], ['Computer', 'Компютер'], ['Work', 'Кор'], ['Job', 'Касб'], ['Busy', 'Машғул'], ['Free', 'Озод']]],
      ['grammar', 'Want to be', 'Want to be', '💼'],
      ['listening', 'Listen: At school', 'Шунавоӣ: Дар мактаб', '🎧', [['I am a student', 'Ман донишҷӯ ҳастам'], ['My teacher is kind', 'Муаллими ман меҳрубон аст'], ['I have homework', 'Ман вазифаи хонагӣ дорам'], ['The lesson starts now', 'Дарс ҳоло сар мешавад'], ['I want to be a doctor', 'Ман мехоҳам духтур шавам'], ['He works at a shop', 'Ӯ дар мағоза кор мекунад']]],
      ['speaking', 'Speak: Work and school', 'Гуфтор: Кор ва мактаб', '🎤', [['I am a student', 'Ман донишҷӯ ҳастам'], ['I go to school', 'Ман ба мактаб меравам'], ['I study English', 'Ман англисӣ мехонам'], ['My teacher is kind', 'Муаллими ман меҳрубон аст'], ['I want to be a doctor', 'Ман мехоҳам духтур шавам'], ['I do homework', 'Ман вазифаи хонагӣ мекунам']]],
      ['reading', 'Reading: My school day', 'Хониш: Рӯзи мактабии ман', '📖'],
      ['writing', 'Write: School day', 'Навиштан: Рӯзи мактаб', '✍️', [['I am a student', 'Ман донишҷӯ ҳастам'], ['I go to school', 'Ман ба мактаб меравам'], ['I study English', 'Ман англисӣ мехонам'], ['I have homework', 'Ман вазифаи хонагӣ дорам'], ['My teacher is kind', 'Муаллими ман меҳрубон аст'], ['I want to be a teacher', 'Ман мехоҳам муаллим шавам']]],
      ['review', 'Checkpoint: School mission', 'Санҷиш: Кор ва мактаб', '🎯', [['Teacher', 'Муаллим'], ['Student', 'Донишҷӯ'], ['Homework', 'Вазифаи хонагӣ'], ['Job', 'Касб'], ['I study English', 'Ман англисӣ мехонам'], ['I want to be a doctor', 'Ман мехоҳам духтур шавам'], ['The lesson starts now', 'Дарс ҳоло сар мешавад'], ['He works at a shop', 'Ӯ дар мағоза кор мекунад']]],
    ],
  },
];

function rows(words) {
  return words.map(([word, translation], order) => ({
    word,
    translation,
    emoji: null,
    ipa: null,
    example: word,
    exampleTrans: translation,
    difficulty: 1,
    order,
  }));
}

async function resolveCourse() {
  const target = await prisma.language.findUnique({ where: { code: TARGET_CODE } });
  const native = await prisma.language.findUnique({ where: { code: NATIVE_CODE } });
  if (!target || !native) throw new Error(`Language pair not found: ${NATIVE_CODE} -> ${TARGET_CODE}`);
  const course = await prisma.course.findUnique({
    where: {
      targetLanguageId_nativeLanguageId_level: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: LEVEL,
      },
    },
  });
  if (!course) throw new Error(`A1 course not found for ${NATIVE_CODE} -> ${TARGET_CODE}`);
  return course;
}

async function ensureModule(courseId, spec) {
  const order = MODULE_ORDER.indexOf(spec.title);
  const existing = await prisma.module.findFirst({ where: { courseId, title: spec.title } });
  const data = {
    titleTranslated: spec.titleTranslated,
    emoji: spec.emoji,
    color: spec.color,
    order: order >= 0 ? order : 99,
    isPremium: false,
    isActive: true,
  };
  if (existing) {
    return prisma.module.update({ where: { id: existing.id }, data });
  }
  return prisma.module.create({
    data: {
      courseId,
      title: spec.title,
      ...data,
    },
  });
}

async function normalizeModuleOrder(courseId) {
  let changed = 0;
  for (const [order, title] of MODULE_ORDER.entries()) {
    const module = await prisma.module.findFirst({ where: { courseId, title } });
    if (module && module.order !== order) {
      await prisma.module.update({ where: { id: module.id }, data: { order } });
      changed += 1;
    }
  }
  return changed;
}

async function ensureGrammar(courseId, spec) {
  const existing = await prisma.grammarTopic.findFirst({ where: { courseId, title: spec.title } });
  if (existing) return existing;
  return prisma.grammarTopic.create({
    data: {
      courseId,
      cefrLevel: LEVEL,
      title: spec.title,
      titleTranslated: spec.titleTranslated,
      explanation: spec.explanation,
      emoji: '🔤',
      order: 900,
      isPremium: false,
      isActive: true,
      examples: {
        create: spec.examples.map(([sentence, translation, highlight], order) => ({
          sentence,
          translation,
          highlight,
          order,
        })),
      },
      rules: {
        create: spec.rules.map(([pattern, note], order) => ({
          pattern,
          note,
          order,
        })),
      },
      exercises: {
        create: spec.exercises.map(([type, prompt, promptTranslated, answer, options, explanation], order) => ({
          type,
          prompt,
          promptTranslated,
          answer,
          options,
          explanation,
          order,
        })),
      },
    },
  });
}

async function ensureReading(courseId, spec) {
  const existing = await prisma.comprehensionExercise.findFirst({ where: { courseId, title: spec.title } });
  if (existing) return existing;
  return prisma.comprehensionExercise.create({
    data: {
      courseId,
      cefrLevel: LEVEL,
      kind: 'reading',
      title: spec.title,
      titleTranslated: spec.titleTranslated,
      passage: spec.passage,
      passageTranslated: spec.passageTranslated,
      emoji: '📖',
      order: 900,
      isPremium: false,
      isActive: true,
      questions: {
        create: spec.questions.map(([question, options, correctIndex, explanation], order) => ({
          question,
          questionTranslated: null,
          options,
          correctIndex,
          explanation,
          order,
        })),
      },
    },
  });
}

async function appendLesson(module, spec, links) {
  const title = spec[1];
  const existing = await prisma.lesson.findFirst({ where: { moduleId: module.id, title } });
  if (existing) return false;
  const maxOrder = await prisma.lesson.aggregate({ where: { moduleId: module.id }, _max: { order: true } });
  const [skillType, , titleTranslated, emoji, words] = spec;
  await prisma.lesson.create({
    data: {
      moduleId: module.id,
      title,
      titleTranslated,
      type: skillType === 'review' ? 'quiz' : 'vocab',
      cefrLevel: LEVEL,
      skillType,
      emoji,
      xpReward: skillType === 'review' ? 115 : 80,
      duration: 6,
      order: (maxOrder._max.order ?? -1) + 1,
      isPremium: false,
      isActive: true,
      ...links,
      words: { create: rows(words || []) },
    },
  });
  return true;
}

async function addExpansionModule(courseId, spec) {
  const module = await ensureModule(courseId, spec);
  const grammar = await ensureGrammar(courseId, spec.grammar);
  const reading = await ensureReading(courseId, spec.reading);
  let addedLessons = 0;
  for (const lesson of spec.lessons) {
    const skillType = lesson[0];
    const links = {};
    if (skillType === 'grammar') links.grammarTopicId = grammar.id;
    if (skillType === 'reading') links.comprehensionId = reading.id;
    if (await appendLesson(module, lesson, links)) addedLessons += 1;
  }
  return addedLessons;
}

async function main() {
  console.log(`Expanding A1 to full CEFR-style coverage: ${NATIVE_CODE} -> ${TARGET_CODE}`);
  const course = await resolveCourse();
  let addedLessons = 0;
  for (const spec of EXPANSION_MODULES) {
    addedLessons += await addExpansionModule(course.id, spec);
  }
  const reordered = await normalizeModuleOrder(course.id);
  console.log(`Added lessons: ${addedLessons}`);
  console.log(`Reordered modules: ${reordered}`);
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
