import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Module 13 (12th content module, order 11): Nature, School And Feelings ───
// Step 2 of "above international A1": +74 unique words → 450 → 524 (target 500-600).
const MODULE = { title: 'Module 12: Nature, School And Feelings', titleTranslated: 'Модули 12: Табиат, Мактаб ва Ҳиссиёт', emoji: '🌍', color: '#22C55E' };

const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos = 'noun') =>
  ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos });

const VOCAB = {
  'Lesson 1: Weather And Seasons': { tt: 'Дарси 1: Обу ҳаво ва Фаслҳо', emoji:'🌤️', words: [
    W('Weather','/ˈweðə/','уэзер','Обу ҳаво','🌤️','The weather is good today.','Имрӯз обу ҳаво хуб аст.'),
    W('Sun','/sʌn/','сан','Офтоб','☀️','The sun is hot.','Офтоб гарм аст.'),
    W('Rain','/reɪn/','рейн','Борон','🌧️','I don\'t like rain.','Ман боронро дӯст намедорам.'),
    W('Snow','/snəʊ/','сноу','Барф','❄️','There is snow in winter.','Дар зимистон барф ҳаст.'),
    W('Wind','/wɪnd/','уинд','Шамол','💨','The wind is strong today.','Имрӯз шамол сахт аст.'),
    W('Cloud','/klaʊd/','клауд','Абр','☁️','I can see a big cloud.','Ман абри калонро мебинам.'),
    W('Sky','/skaɪ/','скай','Осмон','🌌','The sky is blue.','Осмон кабуд аст.'),
    W('Air','/eə/','эйр','Ҳаво','🌬️','The air is clean here.','Ҳаво дар ин ҷо тоза аст.'),
    W('Season','/ˈsiːzən/','сизен','Фасл','📅','Spring is my favourite season.','Баҳор фасли дӯстдоштаи ман аст.'),
    W('Hot','/hɒt/','ҳот','Хеле гарм','🥵','It is hot in summer.','Дар тобистон хеле гарм аст.','adjective'),
    W('Warm','/wɔːm/','уорм','Гарм','🌞','The water is warm.','Об гарм аст.','adjective'),
    W('Spring','/sprɪŋ/','спринг','Баҳор','🌸','Flowers open in spring.','Гулҳо дар баҳор мешукуфанд.'),
    W('Summer','/ˈsʌmə/','саммер','Тобистон','🏖️','We swim in summer.','Мо дар тобистон оббозӣ мекунем.'),
    W('Autumn','/ˈɔːtəm/','отем','Тирамоҳ','🍂','Leaves fall in autumn.','Баргҳо дар тирамоҳ мерезанд.'),
    W('Winter','/ˈwɪntə/','уинтер','Зимистон','⛄','Winter is cold.','Зимистон хунук аст.'),
  ]},
  'Lesson 2: Farm Animals And Pets': { tt: 'Дарси 2: Ҳайвоноти хонагӣ', emoji:'🐄', words: [
    W('Animal','/ˈænɪməl/','энимел','Ҳайвон','🐾','I like animals.','Ман ҳайвонотро дӯст медорам.'),
    W('Pet','/pet/','пет','Ҳайвони хонагӣ','🐕','Have you got a pet?','Ту ҳайвони хонагӣ дорӣ?'),
    W('Cat','/kæt/','кэт','Гурба','🐱','The cat is on the bed.','Гурба болои кат аст.'),
    W('Dog','/dɒɡ/','дог','Саг','🐶','My dog is big.','Саги ман калон аст.'),
    W('Bird','/bɜːd/','бёрд','Парранда','🐦','The bird can sing.','Парранда суруд хонда метавонад.'),
    W('Horse','/hɔːs/','ҳорс','Асп','🐴','The horse is fast.','Асп тез аст.'),
    W('Cow','/kaʊ/','кау','Гов','🐄','The cow gives milk.','Гов шир медиҳад.'),
    W('Sheep','/ʃiːp/','шип','Гӯсфанд','🐑','The sheep are white.','Гӯсфандҳо сафеданд.'),
    W('Goat','/ɡəʊt/','гоут','Буз','🐐','The goat eats grass.','Буз алаф мехӯрад.'),
    W('Duck','/dʌk/','дак','Мурғобӣ','🦆','The duck is in the water.','Мурғобӣ дар об аст.'),
    W('Donkey','/ˈdɒŋki/','донки','Хар','🫏','The donkey is slow.','Хар суст аст.'),
    W('Farm','/fɑːm/','фарм','Хоҷагӣ (ферма)','🚜','There are cows on the farm.','Дар ферма говҳо ҳастанд.'),
  ]},
  'Lesson 3: Wild Animals': { tt: 'Дарси 3: Ҳайвоноти ваҳшӣ', emoji:'🦁', words: [
    W('Lion','/ˈlaɪən/','лайен','Шер','🦁','The lion is strong.','Шер зӯр аст.'),
    W('Elephant','/ˈelɪfənt/','элифент','Фил','🐘','The elephant is very big.','Фил хеле калон аст.'),
    W('Monkey','/ˈmʌŋki/','манки','Маймун','🐵','The monkey eats a banana.','Маймун банан мехӯрад.'),
    W('Bear','/beə/','беэр','Хирс','🐻','The bear sleeps in winter.','Хирс дар зимистон хоб меравад.'),
    W('Wolf','/wʊlf/','вулф','Гург','🐺','The wolf lives in the forest.','Гург дар ҷангал зиндагӣ мекунад.'),
    W('Snake','/sneɪk/','снейк','Мор','🐍','I am afraid of snakes.','Ман аз морҳо метарсам.'),
    W('Rabbit','/ˈræbɪt/','рэбит','Харгӯш','🐰','The rabbit is fast.','Харгӯш тез аст.'),
    W('Mouse','/maʊs/','маус','Муш','🐭','The mouse is small.','Муш хурд аст.'),
    W('Camel','/ˈkæməl/','кэмел','Шутур','🐪','The camel is tall.','Шутур баланд аст.'),
  ]},
  'Lesson 4: Nature: Land And Plants': { tt: 'Дарси 4: Табиат: Замин ва Растаниҳо', emoji:'🌳', words: [
    W('Tree','/triː/','три','Дарахт','🌳','The tree is tall.','Дарахт баланд аст.'),
    W('Flower','/ˈflaʊə/','флауэр','Гул','🌸','This flower is beautiful.','Ин гул зебо аст.'),
    W('Grass','/ɡrɑːs/','грас','Алаф','🌱','The grass is green.','Алаф сабз аст.'),
    W('Leaf','/liːf/','лиф','Барг','🍃','The leaf is yellow.','Барг зард аст.'),
    W('Forest','/ˈfɒrɪst/','форист','Ҷангал','🌲','There are many trees in the forest.','Дар ҷангал дарахтони зиёд ҳастанд.'),
    W('Mountain','/ˈmaʊntən/','маунтен','Кӯҳ','⛰️','The mountain is high.','Кӯҳ баланд аст.'),
    W('Hill','/hɪl/','ҳил','Теппа','🏞️','Our house is on a hill.','Хонаи мо болои теппа аст.'),
    W('Stone','/stəʊn/','стоун','Санг','🪨','The stone is heavy.','Санг вазнин аст.'),
  ]},
  'Lesson 5: Nature: Water And Sky': { tt: 'Дарси 5: Табиат: Об ва Осмон', emoji:'🌊', words: [
    W('River','/ˈrɪvə/','ривер','Дарё','🏞️','The river is long.','Дарё дароз аст.'),
    W('Lake','/leɪk/','лейк','Кӯл','🛶','We swim in the lake.','Мо дар кӯл оббозӣ мекунем.'),
    W('Sea','/siː/','си','Баҳр','🌊','The sea is blue.','Баҳр кабуд аст.'),
    W('Beach','/biːtʃ/','бич','Соҳил','🏖️','We play on the beach.','Мо дар соҳил бозӣ мекунем.'),
    W('Moon','/muːn/','мун','Моҳ','🌙','The moon is in the sky.','Моҳ дар осмон аст.'),
    W('Star','/stɑː/','стар','Ситора','⭐','I can see the stars.','Ман ситораҳоро мебинам.'),
    W('Earth','/ɜːθ/','ёрс','Замин (сайёра)','🌍','The Earth is our home.','Замин хонаи мост.'),
    W('World','/wɜːld/','уорлд','Ҷаҳон','🗺️','The world is big.','Ҷаҳон калон аст.'),
  ]},
  'Lesson 6: School And Classroom': { tt: 'Дарси 6: Мактаб ва Синфхона', emoji:'🏫', words: [
    W('Teacher','/ˈtiːtʃə/','тичер','Муаллим','👩‍🏫','The teacher is kind.','Муаллим меҳрубон аст.'),
    W('Student','/ˈstjuːdənt/','стюдент','Талаба','🧑‍🎓','I am a student.','Ман талаба ҳастам.'),
    W('Class','/klɑːs/','клас','Синф','📚','Our class is big.','Синфи мо калон аст.'),
    W('Classroom','/ˈklɑːsruːm/','класрум','Синфхона','🏫','The classroom is clean.','Синфхона тоза аст.'),
    W('Board','/bɔːd/','борд','Тахтаи синф','📋','Look at the board, please.','Лутфан ба тахта нигоҳ кунед.'),
    W('Lesson','/ˈlesən/','лесен','Дарс','📖','The English lesson starts at nine.','Дарси англисӣ соати нӯҳ сар мешавад.'),
    W('Homework','/ˈhəʊmwɜːk/','ҳоумуорк','Вазифаи хонагӣ','📝','I do my homework every day.','Ман ҳар рӯз вазифаи хонагӣ иҷро мекунам.'),
    W('Paper','/ˈpeɪpə/','пейпер','Коғаз','📄','I need paper and a pen.','Ба ман коғаз ва ручка лозим аст.'),
    W('Word','/wɜːd/','уорд','Калима','🔤','This word is new.','Ин калима нав аст.'),
    W('Answer','/ˈɑːnsə/','ансер','Ҷавоб','✅','My answer is correct.','Ҷавоби ман дуруст аст.'),
    W('Exam','/ɪɡˈzæm/','игзэм','Имтиҳон','🎯','The exam is on Monday.','Имтиҳон рӯзи душанбе аст.'),
    W('Fun','/fʌn/','фан','Шавқовар','🎉','School is fun.','Мактаб шавқовар аст.','adjective'),
  ]},
  'Lesson 7: Feelings': { tt: 'Дарси 7: Ҳиссиёт', emoji:'😊', words: [
    W('Feel','/fiːl/','фил','Ҳис кардан','💭','I feel good today.','Ман имрӯз худро хуб ҳис мекунам.','verb'),
    W('Love','/lʌv/','лав','Дӯст доштан','❤️','I love my family.','Ман оилаамро дӯст медорам.','verb'),
    W('Smile','/smaɪl/','смайл','Табассум','😊','She has a beautiful smile.','Ӯ табассуми зебо дорад.'),
    W('Laugh','/lɑːf/','лаф','Хандидан','😂','The children laugh a lot.','Кӯдакон бисёр механданд.','verb'),
    W('Cry','/kraɪ/','край','Гиря кардан','😢','The baby cries at night.','Кӯдак шабона гиря мекунад.','verb'),
    W('Angry','/ˈæŋɡri/','энгри','Асабонӣ','😠','He is angry now.','Ӯ ҳоло асабонӣ аст.','adjective'),
    W('Afraid','/əˈfreɪd/','эфрейд','Тарсида','😨','I am afraid of dogs.','Ман аз сагҳо метарсам.','adjective'),
    W('Surprised','/səˈpraɪzd/','сепрайзд','Ҳайрон','😲','She is surprised.','Ӯ ҳайрон аст.','adjective'),
    W('Sleepy','/ˈsliːpi/','слипи','Хоболуд','😪','I am sleepy in the evening.','Ман бегоҳӣ хоболуд мешавам.','adjective'),
    W('Weak','/wiːk/','уик','Заиф','😮‍💨','I feel weak today.','Ман имрӯз худро заиф ҳис мекунам.','adjective'),
  ]},
};

const GRAMMAR = {
  title: 'Describing Things (It is + adjective / I am + adjective)',
  titleTranslated: 'Тасвир кардан (It is + сифат / I am + сифат)',
  emoji: '🌤️',
  explanation:
`Барои тасвири обу ҳаво, ҳиссиёт ва ашё дар A1 сохти **be + сифат**-ро истифода мебарем:
- **It is cold.** — Хунук аст. (обу ҳаво/ашё → It is)
- **I am happy.** — Ман хушҳолам. (ҳиссиёт → I am)
- **The sky is blue.** — Осмон кабуд аст. (исм + is)
- **The sheep are white.** — Гӯсфандҳо сафеданд. (ҷамъ → are)

Дар бораи обу ҳаво ҳамеша бо **It** сар мекунем: *It is hot. It is windy.*`,
  rules: [
    { pattern: 'It is + сифат', note: 'Обу ҳаво ва ашё: It is cold. It is warm.' },
    { pattern: 'I am / He is / They are + сифат', note: 'Ҳиссиёт: I am happy. He is angry.' },
    { pattern: 'Исм + is/are + сифат', note: 'The tree is tall. The stars are beautiful.' },
  ],
  examples: [
    { sentence: 'It is cold in winter.', translation: 'Дар зимистон хунук аст.', highlight: 'is cold' },
    { sentence: 'I am sleepy.', translation: 'Ман хоболудам.', highlight: 'am sleepy' },
    { sentence: 'The sky is blue.', translation: 'Осмон кабуд аст.', highlight: 'is blue' },
    { sentence: 'The lions are strong.', translation: 'Шерҳо зӯранд.', highlight: 'are strong' },
    { sentence: 'She is surprised.', translation: 'Ӯ ҳайрон аст.', highlight: 'is surprised' },
  ],
  exercises: [
    { type:'choose', prompt:'It ___ hot in summer.', promptTranslated:'Дар тобистон хеле гарм аст.', options:['is','are','am','be'], answer:'is', explanation:'Обу ҳаво → It is.' },
    { type:'choose', prompt:'I ___ afraid of snakes.', promptTranslated:'Ман аз морҳо метарсам.', options:['is','are','am','be'], answer:'am', explanation:'Бо I → am.' },
    { type:'choose', prompt:'The sheep ___ white.', promptTranslated:'Гӯсфандҳо сафеданд.', options:['is','are','am','be'], answer:'are', explanation:'Ҷамъ → are.' },
    { type:'choose', prompt:'___ is windy today.', promptTranslated:'Имрӯз шамол аст.', options:['It','He','I','They'], answer:'It', explanation:'Обу ҳаво → It.' },
    { type:'fill_blank', prompt:'The mountain ___ high.', promptTranslated:'Кӯҳ баланд аст.', answer:'is', explanation:'Исми танҳо → is.' },
    { type:'fill_blank', prompt:'We ___ happy at the beach.', promptTranslated:'Мо дар соҳил хушҳолем.', answer:'are', explanation:'Бо We → are.' },
    { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Осмон кабуд аст.', options:['sky','is','The','blue'], answer:'The sky is blue.', explanation:'The + sky + is + blue.' },
    { type:'transform', prompt:'Ислоҳ кунед: It are cold in winter.', promptTranslated:'Шакл ғалат.', answer:'It is cold in winter.', explanation:'Бо It → is.' },
  ],
};

const LISTENING = {
  title: 'Listening: The Four Seasons', titleTranslated: 'Шунавоӣ: Чор фасли сол', emoji:'🍂', kind:'listening',
  passage: 'There are four seasons in a year. In spring, the weather is warm and flowers open. In summer, it is hot and the sky is blue. In autumn, the wind is strong and leaves fall. In winter, it is cold and there is snow. I like summer best.',
  passageTranslated: 'Дар як сол чор фасл ҳаст. Дар баҳор обу ҳаво гарм аст ва гулҳо мешукуфанд. Дар тобистон хеле гарм аст ва осмон кабуд аст. Дар тирамоҳ шамол сахт аст ва баргҳо мерезанд. Дар зимистон хунук аст ва барф меборад. Ман тобистонро аз ҳама бештар дӯст медорам.',
  questions: [
    { question:'How many seasons are there in a year?', questionTranslated:'Дар як сол чанд фасл ҳаст?', options:['Three','Four','Five'], correctIndex:1, explanation:'There are four seasons in a year.' },
    { question:'When is it hot?', questionTranslated:'Кай хеле гарм аст?', options:['In summer','In winter','In spring'], correctIndex:0, explanation:'In summer, it is hot.' },
    { question:'What falls in autumn?', questionTranslated:'Дар тирамоҳ чӣ мерезад?', options:['Snow','Rain','Leaves'], correctIndex:2, explanation:'In autumn ... leaves fall.' },
    { question:'Which season does the speaker like best?', questionTranslated:'Гӯянда кадом фаслро бештар дӯст медорад?', options:['Winter','Summer','Autumn'], correctIndex:1, explanation:'I like summer best.' },
  ],
};

const DIALOGUE = {
  title: 'Talking About The Weather', titleTranslated: 'Сӯҳбат дар бораи обу ҳаво', emoji:'🌦️',
  scenario: 'Ду дӯст дар бораи обу ҳаво ва фасли дӯстдоштаи худ сӯҳбат мекунанд.',
  lines: [
    { speaker:'Amir', text:'What is the weather like today?', translation:'Имрӯз обу ҳаво чӣ хел аст?', isUser:false },
    { speaker:'You', text:'It is sunny and warm.', translation:'Офтобӣ ва гарм аст.', isUser:true },
    { speaker:'Amir', text:'Do you like hot weather?', translation:'Ту ҳавои гармро дӯст медорӣ?', isUser:false },
    { speaker:'You', text:'Yes, I do. Summer is my favourite season.', translation:'Ҳа. Тобистон фасли дӯстдоштаи ман аст.', isUser:true },
    { speaker:'Amir', text:'I like winter. I love snow.', translation:'Ман зимистонро дӯст медорам. Барфро нағз мебинам.', isUser:false },
    { speaker:'You', text:'It is very cold in winter!', translation:'Дар зимистон хеле хунук аст!', isUser:true },
    { speaker:'Amir', text:'Yes, but it is beautiful.', translation:'Ҳа, аммо зебо аст.', isUser:false },
    { speaker:'You', text:'Let\'s go to the park now.', translation:'Биё ҳозир ба боғ равем.', isUser:true },
  ],
};

const REVIEW = {
  title: 'Module Review', titleTranslated: 'Такрори модул', emoji:'📖', kind:'reading',
  passage: 'Aziz lives on a farm with his family. He has got a dog, two cows and many sheep. In spring, the grass is green and the weather is warm. Aziz and his dog walk to the river every morning. In the evening, he does his homework and looks at the stars in the sky.',
  passageTranslated: 'Азиз бо оилааш дар ферма зиндагӣ мекунад. Ӯ як саг, ду гов ва гӯсфандони зиёд дорад. Дар баҳор алаф сабз аст ва обу ҳаво гарм аст. Азиз бо сагаш ҳар субҳ то дарё сайр мекунад. Бегоҳӣ ӯ вазифаи хонагиро иҷро карда, ба ситораҳои осмон нигоҳ мекунад.',
  questions: [
    { question:'Where does Aziz live?', questionTranslated:'Азиз дар куҷо зиндагӣ мекунад?', options:['In a city','On a farm','At the beach','In the forest'], correctIndex:1, explanation:'Матн: lives on a farm.' },
    { question:'What animals has he got?', questionTranslated:'Ӯ кадом ҳайвонҳо дорад?', options:['A cat and birds','Lions and bears','A dog, cows and sheep','Horses and ducks'], correctIndex:2, explanation:'Матн: a dog, two cows and many sheep.' },
    { question:'What does Aziz do in the evening?', questionTranslated:'Азиз бегоҳӣ чӣ кор мекунад?', options:['Swims in the lake','Does his homework','Goes to school','Plays football'], correctIndex:1, explanation:'Матн: he does his homework.' },
  ],
};

const EXAM = {
  title: 'Final Exam', titleTranslated: 'Имтиҳони ниҳоӣ', emoji:'🏆', kind:'reading',
  passage: 'Today is a school day. Madina gets up early and looks at the sky. The weather is good — it is warm and sunny. At school, the teacher writes new words on the board. The lesson is fun. After school, Madina plays with her cat and does her homework. At night, she sees the moon and many stars. She feels happy.',
  passageTranslated: 'Имрӯз рӯзи мактаб аст. Мадина барвақт бедор шуда, ба осмон нигоҳ мекунад. Обу ҳаво хуб аст — гарм ва офтобӣ. Дар мактаб муаллим калимаҳои навро дар тахта менависад. Дарс шавқовар аст. Баъди мактаб Мадина бо гурбааш бозӣ карда, вазифаи хонагиашро иҷро мекунад. Шабона ӯ моҳ ва ситораҳои зиёдро мебинад. Ӯ худро хушҳол ҳис мекунад.',
  questions: [
    { question:'What is the weather like?', questionTranslated:'Обу ҳаво чӣ хел аст?', options:['Cold and rainy','Warm and sunny','Windy and cloudy','Snowy'], correctIndex:1, explanation:'Матн: it is warm and sunny.' },
    { question:'Where does the teacher write new words?', questionTranslated:'Муаллим калимаҳои навро дар куҷо менависад?', options:['On paper','In a book','On the board','On the wall'], correctIndex:2, explanation:'Матн: on the board.' },
    { question:'What does Madina do after school?', questionTranslated:'Мадина баъди мактаб чӣ кор мекунад?', options:['Plays with her cat and does homework','Watches TV','Goes to the farm','Swims in the sea'], correctIndex:0, explanation:'Матн: plays with her cat and does her homework.' },
    { question:'How does Madina feel at night?', questionTranslated:'Мадина шабона худро чӣ гуна ҳис мекунад?', options:['Sad','Angry','Sleepy','Happy'], correctIndex:3, explanation:'Матн: She feels happy.' },
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

  const XP = { vocabulary:15, grammar:20, listening:20, speaking:20, review:30, test:50 };
  let order = 0, wordsCreated = 0;

  // 1-7: vocab lessons
  for(const [title, data] of Object.entries(VOCAB)){
    const lesson = await prisma.lesson.create({ data:{ moduleId:mod.id, title, titleTranslated:data.tt, type:'vocab', skillType:'vocabulary', cefrLevel:'A1', emoji:data.emoji, xpReward:XP.vocabulary, duration:5, order:order++ } });
    let wo=0;
    for(const w of data.words){
      await prisma.word.create({ data:{ lessonId:lesson.id, word:w.word, translation:w.translation, emoji:w.emoji, ipa:w.ipa, ipaTajik:w.ipaTajik, example:w.example, exampleTrans:w.exampleTrans, partOfSpeech:w.pos, frequencyRank:2100+wordsCreated, order:wo++ } });
      wordsCreated++;
    }
  }

  // 8: grammar builder
  const topic = await prisma.grammarTopic.create({ data:{ courseId:course.id, cefrLevel:'A1', title:GRAMMAR.title, titleTranslated:GRAMMAR.titleTranslated, explanation:GRAMMAR.explanation, emoji:GRAMMAR.emoji, order:52 } });
  let go=0; for(const r of GRAMMAR.rules) await prisma.grammarRule.create({ data:{ topicId:topic.id, pattern:r.pattern, note:r.note, order:go++ } });
  go=0; for(const e of GRAMMAR.examples) await prisma.grammarExample.create({ data:{ topicId:topic.id, sentence:e.sentence, translation:e.translation, highlight:e.highlight, order:go++ } });
  go=0; for(const x of GRAMMAR.exercises) await prisma.grammarExercise.create({ data:{ topicId:topic.id, type:x.type, prompt:x.prompt, promptTranslated:x.promptTranslated, answer:x.answer, options:x.options??undefined, explanation:x.explanation, order:go++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 8: Grammar Builder', titleTranslated:'Дарси 8: Сохтмони грамматикӣ', type:'grammar', skillType:'grammar', cefrLevel:'A1', emoji:'🌤️', xpReward:XP.grammar, duration:5, order:order++, grammarTopicId:topic.id } });

  // 9: listening
  const listen = await prisma.comprehensionExercise.create({ data:{ courseId:course.id, cefrLevel:'A1', kind:LISTENING.kind, title:LISTENING.title, titleTranslated:LISTENING.titleTranslated, passage:LISTENING.passage, passageTranslated:LISTENING.passageTranslated, emoji:LISTENING.emoji, order:60 } });
  let qo=0; for(const q of LISTENING.questions) await prisma.comprehensionQuestion.create({ data:{ exerciseId:listen.id, question:q.question, questionTranslated:q.questionTranslated, options:q.options, correctIndex:q.correctIndex, explanation:q.explanation, order:qo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 9: Listening: The Four Seasons', titleTranslated:'Дарси 9: Шунавоӣ: Чор фасли сол', type:'quiz', skillType:'listening', cefrLevel:'A1', emoji:'🎧', xpReward:XP.listening, duration:5, order:order++, comprehensionId:listen.id } });

  // 10: weather conversation (dialogue)
  const dlg = await prisma.dialogue.create({ data:{ courseId:course.id, cefrLevel:'A1', title:DIALOGUE.title, titleTranslated:DIALOGUE.titleTranslated, scenario:DIALOGUE.scenario, emoji:DIALOGUE.emoji, order:52 } });
  let lo=0; for(const ln of DIALOGUE.lines) await prisma.dialogueLine.create({ data:{ dialogueId:dlg.id, speaker:ln.speaker, text:ln.text, translation:ln.translation, isUser:ln.isUser, order:lo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 10: Weather Conversation', titleTranslated:'Дарси 10: Муколамаи обу ҳаво', type:'vocab', skillType:'speaking', cefrLevel:'A1', emoji:'🗣️', xpReward:XP.speaking, duration:5, order:order++, dialogueId:dlg.id } });

  // 11: module review (reading comprehension)
  const rev = await prisma.comprehensionExercise.create({ data:{ courseId:course.id, cefrLevel:'A1', kind:REVIEW.kind, title:REVIEW.title, titleTranslated:REVIEW.titleTranslated, passage:REVIEW.passage, passageTranslated:REVIEW.passageTranslated, emoji:REVIEW.emoji, order:52 } });
  qo=0; for(const q of REVIEW.questions) await prisma.comprehensionQuestion.create({ data:{ exerciseId:rev.id, question:q.question, questionTranslated:q.questionTranslated, options:q.options, correctIndex:q.correctIndex, explanation:q.explanation, order:qo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 11: Module Review', titleTranslated:'Дарси 11: Такрори модул', type:'quiz', skillType:'review', cefrLevel:'A1', emoji:'📖', xpReward:XP.review, duration:5, order:order++, comprehensionId:rev.id } });

  // 12: final exam (reading comprehension)
  const exam = await prisma.comprehensionExercise.create({ data:{ courseId:course.id, cefrLevel:'A1', kind:EXAM.kind, title:EXAM.title, titleTranslated:EXAM.titleTranslated, passage:EXAM.passage, passageTranslated:EXAM.passageTranslated, emoji:EXAM.emoji, order:53 } });
  qo=0; for(const q of EXAM.questions) await prisma.comprehensionQuestion.create({ data:{ exerciseId:exam.id, question:q.question, questionTranslated:q.questionTranslated, options:q.options, correctIndex:q.correctIndex, explanation:q.explanation, order:qo++ } });
  await prisma.lesson.create({ data:{ moduleId:mod.id, title:'Lesson 12: Final Exam', titleTranslated:'Дарси 12: Имтиҳони ниҳоӣ', type:'quiz', skillType:'test', cefrLevel:'A1', emoji:'🏆', xpReward:XP.test, duration:5, order:order++, comprehensionId:exam.id } });

  console.log('=== MODULE 13 (order '+mod.order+') CREATED ===');
  console.log(JSON.stringify({ module:MODULE.title, lessons:order, newWords:wordsCreated, duplicates:dupCheck.length, grammarExercises:GRAMMAR.exercises.length, listeningQ:LISTENING.questions.length, dialogueLines:DIALOGUE.lines.length, reviewQ:REVIEW.questions.length, examQ:EXAM.questions.length }, null, 2));
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
