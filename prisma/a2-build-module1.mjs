import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
const prisma = new PrismaClient();

// ─── A2 · Module 1: Past Events And Stories (full 12-lesson build) ───
// 5 vocab lessons (~10 words each) + 2 grammar (Past Simple) + listening +
// speaking + reading + review + exam. Idempotent: wipes & rebuilds the module.

const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos) =>
  ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos });

const VOCAB = {
  'Lesson 1: Life Events': { tt: 'Дарси 1: Ҳодисаҳои зиндагӣ', emoji: '📖', words: [
    W('Born','/bɔːn/','борн','Таваллуд шудан','👶','I was born in 2005.','Ман соли 2005 таваллуд шудам.','verb'),
    W('Grow up','/ɡrəʊ ʌp/','гроу ап','Калон шудан','🧒','She grew up in a village.','Ӯ дар деҳа калон шуд.','verb'),
    W('Move','/muːv/','мув','Кӯчидан','📦','We moved to a new city.','Мо ба шаҳри нав кӯчидем.','verb'),
    W('Graduate','/ˈɡrædʒueɪt/','грэдюейт','Хатм кардан','🎓','He graduated from university.','Ӯ донишгоҳро хатм кард.','verb'),
    W('Marry','/ˈmæri/','мэри','Издивоҷ кардан','💍','They married two years ago.','Онҳо ду сол пеш издивоҷ карданд.','verb'),
    W('Retire','/rɪˈtaɪə/','ритайер','Ба нафақа баромадан','👴','My father retired last year.','Падарам соли гузашта ба нафақа баромад.','verb'),
    W('Become','/bɪˈkʌm/','биком','Шудан','🌟','She became a teacher.','Ӯ муаллим шуд.','verb'),
    W('Travel','/ˈtrævəl/','трэвел','Сафар кардан','✈️','We travelled a lot.','Мо бисёр сафар кардем.','verb'),
    W('Leave','/liːv/','лив','Тарк кардан / рафтан','🚪','I left home at eighteen.','Ман дар ҳаждаҳсолагӣ аз хона рафтам.','verb'),
    W('Meet','/miːt/','мит','Вохӯрдан','🤝','I met him at work.','Ман бо ӯ дар кор вохӯрдам.','verb'),
  ]},
  'Lesson 2: Past Time Expressions': { tt: 'Дарси 2: Ибораҳои замони гузашта', emoji: '⏳', words: [
    W('Yesterday','/ˈjestədeɪ/','йестердей','Дирӯз','📅','I saw her yesterday.','Ман ӯро дирӯз дидам.','adverb'),
    W('Ago','/əˈɡəʊ/','эгоу','Пеш (замон)','⏳','Two years ago.','Ду сол пеш.','adverb'),
    W('Then','/ðen/','зен','Он гоҳ / баъд','➡️','First we ate, then we left.','Аввал хӯрдем, баъд рафтем.','adverb'),
    W('Before','/bɪˈfɔː/','бифор','Пеш аз','◀️','I called before I came.','Ман пеш аз омадан занг задам.','adverb'),
    W('After','/ˈɑːftə/','афтер','Баъд аз','▶️','After lunch, we walked.','Баъд аз хӯрок, мо сайр кардем.','adverb'),
    W('Once','/wʌns/','ванс','Як бор / боре','1️⃣','I met him once.','Ман ӯро як бор вохӯрдам.','adverb'),
    W('Recently','/ˈriːsntli/','рисентли','Ба наздикӣ','🕐','I saw that film recently.','Ман он филмро ба наздикӣ дидам.','adverb'),
    W('Suddenly','/ˈsʌdənli/','саденли','Ногаҳон','⚡','Suddenly, it started to rain.','Ногаҳон борон борид.','adverb'),
    W('Finally','/ˈfaɪnəli/','файнали','Ниҳоят','🏁','Finally, we arrived.','Ниҳоят, мо расидем.','adverb'),
    W('Later','/ˈleɪtə/','лейтер','Баъдтар','⏰','He came back later.','Ӯ баъдтар баргашт.','adverb'),
  ]},
  'Lesson 3: Everyday Verbs': { tt: 'Дарси 3: Феълҳои ҳаррӯза', emoji: '🔤', words: [
    W('See','/siː/','си','Дидан','👀','We saw a film.','Мо филм дидем.','verb'),
    W('Take','/teɪk/','тейк','Гирифтан','✋','He took a taxi.','Ӯ таксӣ гирифт.','verb'),
    W('Ride','/raɪd/','райд','Савор шудан','🚲','We rode our bikes to school.','Мо бо велосипед ба мактаб рафтем.','verb'),
    W('Give','/ɡɪv/','гив','Додан','🎁','He gave me a gift.','Ӯ ба ман тӯҳфа дод.','verb'),
    W('Tell','/tel/','тел','Гуфтан','🗣️','She told a story.','Ӯ ҳикоя гуфт.','verb'),
    W('Win','/wɪn/','уин','Ғолиб шудан','🏆','Our team won.','Дастаи мо ғолиб шуд.','verb'),
    W('Lose','/luːz/','луз','Бохтан / гум кардан','❌','We lost the game.','Мо бозиро бохтем.','verb'),
    W('Bring','/brɪŋ/','бринг','Овардан','📥','She brought some food.','Ӯ каме хӯрок овард.','verb'),
    W('Catch','/kætʃ/','кэч','Доштан / гирифтан','🫳','He caught the ball.','Ӯ тӯбро дошт.','verb'),
    W('Choose','/tʃuːz/','чуз','Интихоб кардан','✔️','I chose the blue one.','Ман кабудро интихоб кардам.','verb'),
  ]},
  'Lesson 4: Feelings And Reactions': { tt: 'Дарси 4: Ҳиссиёт ва Вокунишҳо', emoji: '😃', words: [
    W('Excited','/ɪkˈsaɪtɪd/','иксайтид','Ҳаяҷонзада','🤩','I was excited about the trip.','Ман аз сафар ҳаяҷонзада будам.','adjective'),
    W('Bored','/bɔːd/','борд','Дилгир','😑','The film was long and I was bored.','Филм дароз буд ва ман дилгир шудам.','adjective'),
    W('Nervous','/ˈnɜːvəs/','нёрвес','Асабӣ / ба ташвиш','😰','She was nervous before the exam.','Ӯ пеш аз имтиҳон ба ташвиш буд.','adjective'),
    W('Proud','/praʊd/','прауд','Ифтихорманд','😌','He was proud of his work.','Ӯ аз кораш ифтихор мекард.','adjective'),
    W('Worried','/ˈwʌrid/','уорид','Нигарон','😟','I was worried about you.','Ман барои ту нигарон будам.','adjective'),
    W('Embarrassed','/ɪmˈbærəst/','имбэрест','Хиҷолатзада','😳','She felt embarrassed.','Ӯ хиҷолат кашид.','adjective'),
    W('Relaxed','/rɪˈlækst/','рилэкст','Осуда / ором','😌','We felt relaxed on holiday.','Мо дар таътил осуда будем.','adjective'),
    W('Calm','/kɑːm/','каам','Ором','😇','Please stay calm.','Лутфан ором бош.','adjective'),
    W('Confident','/ˈkɒnfɪdənt/','конфидент','Бо эътимод','💪','He felt confident.','Ӯ бо эътимод буд.','adjective'),
    W('Lonely','/ˈləʊnli/','лоунли','Танҳо / дилтанг','😔','She felt lonely at first.','Ӯ аввал худро танҳо ҳис кард.','adjective'),
  ]},
  'Lesson 5: Story And Narrative': { tt: 'Дарси 5: Ҳикоя ва Ривоят', emoji: '📚', words: [
    W('Story','/ˈstɔːri/','стори','Ҳикоя','📖','She told a funny story.','Ӯ ҳикояи хандаовар гуфт.','noun'),
    W('Adventure','/ədˈventʃə/','адвенчер','Саргузашт','🗺️','It was a great adventure.','Ин саргузашти олӣ буд.','noun'),
    W('Holiday','/ˈhɒlədeɪ/','ҳолидей','Таътил','🏖️','We went on holiday.','Мо ба таътил рафтем.','noun'),
    W('Memory','/ˈmeməri/','мемори','Хотира','💭','I have a good memory of that day.','Ман аз он рӯз хотираи хуб дорам.','noun'),
    W('Childhood','/ˈtʃaɪldhʊd/','чайлдҳуд','Кӯдакӣ','🧸','My childhood was happy.','Кӯдакии ман хушбахтона буд.','noun'),
    W('Event','/ɪˈvent/','ивент','Ҳодиса / чорабинӣ','🎉','It was a big event.','Ин чорабинии калон буд.','noun'),
    W('Moment','/ˈməʊmənt/','моумент','Лаҳза','⏱️','It was a special moment.','Ин лаҳзаи махсус буд.','noun'),
    W('Past','/pɑːst/','паст','Гузашта','⏮️','In the past, life was different.','Дар гузашта зиндагӣ дигар буд.','noun'),
    W('Dream','/driːm/','дрим','Орзу / хоб','💤','I had a strange dream.','Ман хоби аҷиб дидам.','noun'),
    W('Trip','/trɪp/','трип','Сафар (кӯтоҳ)','🧳','We took a trip to the mountains.','Мо ба кӯҳҳо сафар кардем.','noun'),
  ]},
};

const GRAMMAR = [
  {
    lessonTitle: 'Lesson 6: Grammar — Past Simple (Regular Verbs)',
    lessonTitleTg: 'Дарси 6: Грамматика — Замони гузашта (феълҳои қоидавӣ)',
    title: 'Past Simple — Regular Verbs',
    titleTranslated: 'Замони гузашта — феълҳои қоидавӣ',
    emoji: '⏪',
    explanation:
`Замони гузаштаи содда (Past Simple) барои амалҳои дар гузашта ТАМОМШУДА. Феълҳои қоидавӣ бо **-ed** сохта мешаванд ва барои ҲАМА шахс як хеланд:
- work → **worked**, play → **played**, watch → **watched**
- Феъли бо **-e**: like → **liked**, live → **lived**
- Ҳамсадо + **y**: study → **studied**, marry → **married**
- Садоноки кӯтоҳ + ҳамсадо: stop → **stopped**, plan → **planned**

Мисол: *I worked yesterday. She lived in Khujand.*`,
    rules: [
      { pattern: 'V + ed', note: 'worked, played, watched' },
      { pattern: 'V(-e) + d', note: 'liked, lived, moved' },
      { pattern: 'consonant + y → ied', note: 'studied, married, tried' },
      { pattern: 'Ҳама шахс як хел', note: 'I/you/he/we/they worked' },
    ],
    examples: [
      { sentence: 'I worked yesterday.', translation: 'Ман дирӯз кор кардам.', highlight: 'worked' },
      { sentence: 'She lived in Khujand.', translation: 'Ӯ дар Хуҷанд зиндагӣ мекард.', highlight: 'lived' },
      { sentence: 'They studied English.', translation: 'Онҳо англисӣ омӯхтанд.', highlight: 'studied' },
      { sentence: 'We played football.', translation: 'Мо футбол бозӣ кардем.', highlight: 'played' },
      { sentence: 'He watched TV last night.', translation: 'Ӯ дишаб телевизор тамошо кард.', highlight: 'watched' },
    ],
    exercises: [
      { type:'choose', prompt:'I ___ (work) all day yesterday.', promptTranslated:'Ман дирӯз тамоми рӯз кор кардам.', options:['worked','work','working','works'], answer:'worked', explanation:'work → worked (+ed).' },
      { type:'choose', prompt:'She ___ (live) in Dushanbe.', promptTranslated:'Ӯ дар Душанбе зиндагӣ мекард.', options:['lived','lifed','livd','live'], answer:'lived', explanation:'live → lived (+d).' },
      { type:'choose', prompt:'They ___ (study) hard.', promptTranslated:'Онҳо бисёр таҳсил карданд.', options:['studied','studyed','studed','study'], answer:'studied', explanation:'y → ied.' },
      { type:'fill_blank', prompt:'We ___ (play) in the park. (past)', promptTranslated:'Мо дар боғ бозӣ кардем.', answer:'played', explanation:'play → played.' },
      { type:'fill_blank', prompt:'He ___ (watch) a film last night.', promptTranslated:'Ӯ дишаб филм тамошо кард.', answer:'watched', explanation:'watch → watched.' },
      { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман дирӯз кор кардам.', options:['worked','I','yesterday'], answer:'I worked yesterday.', explanation:'I + worked + yesterday.' },
      { type:'transform', prompt:'Ба гузашта гузаронед: I play football.', promptTranslated:'Ба замони гузашта гузаронед.', answer:'I played football.', explanation:'play → played.' },
      { type:'transform', prompt:'Ислоҳ кунед: She studyed English.', promptTranslated:'Шакл ғалат.', answer:'She studied English.', explanation:'study → studied (y→ied).' },
    ],
  },
  {
    lessonTitle: 'Lesson 7: Grammar — Past Simple (Questions & Negatives)',
    lessonTitleTg: 'Дарси 7: Грамматика — Замони гузашта (Савол ва Инкор)',
    title: 'Past Simple — Questions and Negatives',
    titleTranslated: 'Замони гузашта — Савол ва Инкор',
    emoji: '❓',
    explanation:
`Барои ИНКОР ва САВОЛ дар замони гузашта аз **did** истифода мебарем, ва феъл ба ШАКЛИ АСОСӢ бармегардад:
- Инкор: I **didn't** (did not) go. — Ман нарафтам.
- Савол: **Did** you go? — Ту рафтӣ?
- Wh-савол: What **did** you do? — Ту чӣ кор кардӣ?

⚠️ Диққат: баъди **did/didn't** феъл БЕ -ed мешавад:
*didn't went ❌ → didn't go ✅ · Did you played? ❌ → Did you play? ✅*`,
    rules: [
      { pattern: "didn't + феъли асосӣ", note: "I didn't go. She didn't work." },
      { pattern: 'Did + шахс + феъли асосӣ?', note: 'Did you go? Did he play?' },
      { pattern: 'Wh + did + шахс + феъл?', note: 'What did you do? Where did they go?' },
    ],
    examples: [
      { sentence: "I didn't go to school.", translation: 'Ман ба мактаб нарафтам.', highlight: "didn't go" },
      { sentence: 'Did you see the film?', translation: 'Ту филмро дидӣ?', highlight: 'Did you see' },
      { sentence: 'What did she say?', translation: 'Ӯ чӣ гуфт?', highlight: 'did she say' },
      { sentence: "They didn't come.", translation: 'Онҳо наомаданд.', highlight: "didn't come" },
      { sentence: 'Where did he live?', translation: 'Ӯ дар куҷо зиндагӣ мекард?', highlight: 'did he live' },
    ],
    exercises: [
      { type:'choose', prompt:'I ___ go to work yesterday.', promptTranslated:'Ман дирӯз ба кор нарафтам.', options:["didn't","don't","wasn't","not"], answer:"didn't", explanation:'Инкори гузашта → didn\'t + феъл.' },
      { type:'choose', prompt:'___ you see her?', promptTranslated:'Ту ӯро дидӣ?', options:['Did','Do','Was','Are'], answer:'Did', explanation:'Савол дар гузашта → Did.' },
      { type:'choose', prompt:"She didn't ___ the answer.", promptTranslated:'Ӯ ҷавобро намедонист.', options:['know','knew','knows','knowed'], answer:'know', explanation:'Баъди didn\'t → феъли асосӣ.' },
      { type:'fill_blank', prompt:'What ___ you do last weekend?', promptTranslated:'Ту ҳафтаи гузашта чӣ кор кардӣ?', answer:'did', explanation:'Wh-савол → did.' },
      { type:'fill_blank', prompt:"They ___ come to the party. (negative)", promptTranslated:'Онҳо ба базм наомаданд.', answer:"didn't", explanation:'Инкор → didn\'t come.' },
      { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ту филмро дидӣ?', options:['Did','see','you','the','film'], answer:'Did you see the film?', explanation:'Did + you + see + the + film?' },
      { type:'transform', prompt:'Ба савол гузаронед: You went home.', promptTranslated:'Хабарӣ → саволӣ.', answer:'Did you go home?', explanation:'Did + you + go (асосӣ)?' },
      { type:'transform', prompt:'Ба инкор гузаронед: He saw the film.', promptTranslated:'Хабарӣ → инкорӣ.', answer:"He didn't see the film.", explanation:'didn\'t + see (асосӣ).' },
    ],
  },
];

const LISTENING = {
  lessonTitle: 'Lesson 8: Listening — A Trip to the Mountains',
  lessonTitleTg: 'Дарси 8: Шунавоӣ — Сафар ба кӯҳҳо',
  title: 'A Trip to the Mountains', titleTranslated: 'Сафар ба кӯҳҳо', emoji: '⛰️', kind: 'listening',
  passage: 'Last summer, my family and I went on a trip to the mountains. We left early in the morning. The weather was sunny and warm. We walked for three hours and saw a beautiful lake. In the evening, we made a fire and my father told funny stories. I felt very happy. It was one of the best days of my life.',
  passageTranslated: 'Тобистони гузашта ман бо оилаам ба кӯҳҳо сафар кардем. Мо субҳи барвақт баромадем. Обу ҳаво офтобӣ ва гарм буд. Мо се соат роҳ рафтем ва кӯли зеборо дидем. Бегоҳӣ мо оташ афрӯхтем ва падарам ҳикояҳои хандаовар гуфт. Ман хеле хушҳол будам. Ин яке аз беҳтарин рӯзҳои умрам буд.',
  questions: [
    { question:'When did they go on the trip?', questionTranslated:'Онҳо кай ба сафар рафтанд?', options:['Last summer','Last winter','Yesterday'], correctIndex:0, explanation:'Last summer ... went on a trip.' },
    { question:'What time did they leave?', questionTranslated:'Онҳо соати чанд баромаданд?', options:['In the evening','Early in the morning','At noon'], correctIndex:1, explanation:'We left early in the morning.' },
    { question:'What did they see?', questionTranslated:'Онҳо чӣ диданд?', options:['A river','A city','A lake'], correctIndex:2, explanation:'... saw a beautiful lake.' },
    { question:'What did the father do in the evening?', questionTranslated:'Падар бегоҳӣ чӣ кор кард?', options:['Told stories','Cooked dinner','Slept'], correctIndex:0, explanation:'my father told funny stories.' },
    { question:'How did the writer feel?', questionTranslated:'Нависанда чӣ ҳис кард?', options:['Bored','Happy','Tired'], correctIndex:1, explanation:'I felt very happy.' },
  ],
};

const DIALOGUE = {
  lessonTitle: 'Lesson 9: Speaking — My Weekend',
  lessonTitleTg: 'Дарси 9: Гуфтугӯ — Ҳафтаи истироҳати ман',
  title: 'My Weekend', titleTranslated: 'Ҳафтаи истироҳати ман', emoji: '🗣️',
  scenario: 'Ду дӯст дар бораи ҳафтаи истироҳати гузаштаи худ гап мезананд (замони гузашта).',
  lines: [
    { speaker:'Sammy', text:'Hi! How was your weekend?', translation:'Салом! Ҳафтаи истироҳатат чӣ хел буд?', isUser:false },
    { speaker:'You', text:'It was great! I visited my grandparents.', translation:'Олӣ буд! Ман ба назди бобою бибиям рафтам.', isUser:true },
    { speaker:'Sammy', text:'Nice! What did you do there?', translation:'Хуб! Ту дар он ҷо чӣ кор кардӣ?', isUser:false },
    { speaker:'You', text:'We had dinner and I played with my cousins.', translation:'Мо хӯроки шом хӯрдем ва ман бо ҷиянҳоям бозӣ кардам.', isUser:true },
    { speaker:'Sammy', text:'Did you go anywhere?', translation:'Ту ба ягон ҷо рафтӣ?', isUser:false },
    { speaker:'You', text:'Yes, we went to the park in the afternoon.', translation:'Ҳа, мо баъдаззуҳр ба боғ рафтем.', isUser:true },
    { speaker:'Sammy', text:'Sounds fun! I stayed home and watched films.', translation:'Шавқовар аст! Ман дар хона мондам ва филм тамошо кардам.', isUser:false },
    { speaker:'You', text:'That sounds relaxing too!', translation:'Ин ҳам оромбахш будааст!', isUser:true },
  ],
};

const READING = {
  lessonTitle: 'Lesson 10: Reading — My Childhood',
  lessonTitleTg: 'Дарси 10: Хониш — Кӯдакии ман',
  title: 'My Childhood', titleTranslated: 'Кӯдакии ман', emoji: '🧸', kind: 'reading',
  passage: 'When I was a child, I lived in a small village with my grandparents. Every morning I helped my grandfather in the garden. In the afternoon, I played with my friends near the river. We didn\'t have phones, but we were very happy. In the evening, my grandmother told us old stories. I still remember those days with a smile.',
  passageTranslated: 'Вақте ки ман кӯдак будам, дар деҳаи хурд бо бобою бибиям зиндагӣ мекардам. Ҳар субҳ ба бобоям дар боғ кӯмак мекардам. Баъдаззуҳр бо дӯстонам дар назди дарё бозӣ мекардам. Мо телефон надоштем, вале хеле хушбахт будем. Бегоҳӣ бибиям ба мо ҳикояҳои кӯҳна нақл мекард. Ман ҳанӯз он рӯзҳоро бо табассум ба ёд меорам.',
  questions: [
    { question:'Where did the writer live as a child?', questionTranslated:'Нависанда дар кӯдакӣ дар куҷо зиндагӣ мекард?', options:['In a city','In a small village','At the seaside'], correctIndex:1, explanation:'... lived in a small village.' },
    { question:'Who did the writer help in the morning?', questionTranslated:'Нависанда субҳ ба кӣ кӯмак мекард?', options:['Grandfather','Grandmother','Friends'], correctIndex:0, explanation:'I helped my grandfather.' },
    { question:'Did they have phones?', questionTranslated:'Онҳо телефон доштанд?', options:['Yes','No','Only one'], correctIndex:1, explanation:"We didn't have phones." },
    { question:'Who told stories in the evening?', questionTranslated:'Бегоҳӣ кӣ ҳикоя мегуфт?', options:['Grandfather','Grandmother','The writer'], correctIndex:1, explanation:'my grandmother told us old stories.' },
  ],
};

const REVIEW = {
  title: 'Module Review', titleTranslated: 'Такрори модул', emoji: '📖', kind: 'reading',
  passage: 'Karim had a busy day yesterday. He woke up at seven and went to work by bus. At work, he met a new colleague and they talked about their weekend. After work, he bought some food and cooked dinner. In the evening, he watched a football match. His team won! He felt very happy and went to bed late.',
  passageTranslated: 'Карим дирӯз рӯзи серкоре дошт. Ӯ соати ҳафт бедор шуд ва бо автобус ба кор рафт. Дар кор бо ҳамкори нав вохӯрд ва онҳо дар бораи ҳафтаи истироҳаташон гап заданд. Баъди кор ӯ каме хӯрок харид ва хӯроки шом пухт. Бегоҳӣ ӯ бозии футболро тамошо кард. Дастаи ӯ ғолиб шуд! Ӯ хеле хушҳол шуд ва дер хоб рафт.',
  questions: [
    { question:'When did Karim have a busy day?', questionTranslated:'Карим кай рӯзи серкор дошт?', options:['Today','Yesterday','Last week'], correctIndex:1, explanation:'... a busy day yesterday.' },
    { question:'How did he go to work?', questionTranslated:'Ӯ бо чӣ ба кор рафт?', options:['By bus','By car','On foot'], correctIndex:0, explanation:'... went to work by bus.' },
    { question:'Who did he meet at work?', questionTranslated:'Ӯ дар кор бо кӣ вохӯрд?', options:['A new colleague','A friend','His boss'], correctIndex:0, explanation:'... met a new colleague.' },
    { question:'What did he do in the evening?', questionTranslated:'Ӯ бегоҳӣ чӣ кор кард?', options:['Cooked dinner','Watched football','Went shopping'], correctIndex:1, explanation:'... watched a football match.' },
    { question:'How did he feel?', questionTranslated:'Ӯ чӣ ҳис кард?', options:['Tired','Sad','Happy'], correctIndex:2, explanation:'He felt very happy.' },
  ],
};

const EXAM = {
  title: 'Final Exam', titleTranslated: 'Имтиҳони ниҳоӣ', emoji: '🏆', kind: 'reading',
  passage: 'Last year, Nigora finished school and started university. It was a big change. At first, she felt nervous because everything was new and she didn\'t know anyone. But after a few weeks, she made new friends. She joined a music club and learned to play the guitar. By the end of the year, she felt confident and happy. She said it was the best year of her life.',
  passageTranslated: 'Соли гузашта Нигора мактабро тамом кард ва ба донишгоҳ дохил шуд. Ин тағйироти калон буд. Дар аввал ӯ ба ташвиш буд, зеро ҳама чиз нав буд ва ӯ ҳеҷ касро намешинохт. Аммо баъди чанд ҳафта ӯ дӯстони нав пайдо кард. Ӯ ба маҳфили мусиқӣ дохил шуд ва навохтани гитараро омӯхт. То охири сол ӯ бо эътимод ва хушҳол шуд. Ӯ гуфт, ки ин беҳтарин соли умраш буд.',
  questions: [
    { question:'What did Nigora do last year?', questionTranslated:'Нигора соли гузашта чӣ кард?', options:['Started a job','Finished school and started university','Moved abroad','Got married'], correctIndex:1, explanation:'... finished school and started university.' },
    { question:'How did she feel at first?', questionTranslated:'Ӯ дар аввал чӣ ҳис кард?', options:['Excited','Bored','Nervous','Proud'], correctIndex:2, explanation:'... she felt nervous.' },
    { question:'Why was she nervous?', questionTranslated:'Чаро ӯ ба ташвиш буд?', options:['Everything was new','She was ill','It was far','She had no money'], correctIndex:0, explanation:'... everything was new and she didn\'t know anyone.' },
    { question:'What did she learn?', questionTranslated:'Ӯ чӣ омӯхт?', options:['To drive','To play the guitar','To cook','To swim'], correctIndex:1, explanation:'... learned to play the guitar.' },
    { question:'How did she feel by the end of the year?', questionTranslated:'То охири сол ӯ чӣ ҳис кард?', options:['Lonely','Worried','Confident and happy','Bored'], correctIndex:2, explanation:'... she felt confident and happy.' },
  ],
};

async function main() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const course = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' } });
  if (!course) throw new Error('Курси A2 нест — аввал бисозед.');

  // QC: no duplicates vs A1 or within this module
  const a1set = new Set(JSON.parse(readFileSync('tmp/a1-words.json', 'utf8')));
  const seen = new Set(); const dupA1 = []; const dupSelf = [];
  for (const ls of Object.values(VOCAB)) for (const w of ls.words) {
    const k = w.word.toLowerCase().trim();
    if (a1set.has(k)) dupA1.push(w.word);
    if (seen.has(k)) dupSelf.push(w.word); seen.add(k);
  }
  if (dupA1.length) console.log('⚠️ Такрор бо A1:', dupA1.join(', '));
  if (dupSelf.length) console.log('⚠️ Такрори дохилӣ:', dupSelf.join(', '));

  // Wipe & rebuild Module 1
  let mod = await prisma.module.findFirst({ where: { courseId: course.id, title: 'Module 1: Past Events And Stories' } });
  if (mod) {
    const ls = await prisma.lesson.findMany({ where: { moduleId: mod.id }, select: { id: true, grammarTopicId: true, dialogueId: true, comprehensionId: true } });
    for (const l of ls) {
      if (l.grammarTopicId) await prisma.grammarTopic.delete({ where: { id: l.grammarTopicId } }).catch(() => {});
      if (l.dialogueId) await prisma.dialogue.delete({ where: { id: l.dialogueId } }).catch(() => {});
      if (l.comprehensionId) await prisma.comprehensionExercise.delete({ where: { id: l.comprehensionId } }).catch(() => {});
    }
    await prisma.lesson.deleteMany({ where: { moduleId: mod.id } });
  } else {
    mod = await prisma.module.create({ data: { courseId: course.id, title: 'Module 1: Past Events And Stories', titleTranslated: 'Модули 1: Ҳодисаҳои гузашта ва Ҳикоятҳо', emoji: '📖', color: '#3B82F6', order: 0, isActive: true } });
  }

  const XP = { vocabulary: 15, grammar: 20, listening: 20, speaking: 20, review: 30, test: 50 };
  let order = 0, wordsCreated = 0;

  // 1-5: vocab
  for (const [title, data] of Object.entries(VOCAB)) {
    const lesson = await prisma.lesson.create({ data: { moduleId: mod.id, title, titleTranslated: data.tt, type: 'vocab', skillType: 'vocabulary', cefrLevel: 'A2', emoji: data.emoji, xpReward: XP.vocabulary, duration: 5, order: order++ } });
    let wo = 0;
    for (const w of data.words) {
      await prisma.word.create({ data: { lessonId: lesson.id, word: w.word, translation: w.translation, emoji: w.emoji, ipa: w.ipa, ipaTajik: w.ipaTajik, example: w.example, exampleTrans: w.exampleTrans, partOfSpeech: w.pos, frequencyRank: 3000 + wordsCreated, order: wo++ } });
      wordsCreated++;
    }
  }

  // 6-7: grammar
  for (const g of GRAMMAR) {
    const topic = await prisma.grammarTopic.create({ data: { courseId: course.id, cefrLevel: 'A2', title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji, order: 60 + order } });
    let go = 0; for (const r of g.rules) await prisma.grammarRule.create({ data: { topicId: topic.id, pattern: r.pattern, note: r.note, order: go++ } });
    go = 0; for (const e of g.examples) await prisma.grammarExample.create({ data: { topicId: topic.id, sentence: e.sentence, translation: e.translation, highlight: e.highlight, order: go++ } });
    go = 0; for (const x of g.exercises) await prisma.grammarExercise.create({ data: { topicId: topic.id, type: x.type, prompt: x.prompt, promptTranslated: x.promptTranslated, answer: x.answer, options: x.options ?? undefined, explanation: x.explanation, order: go++ } });
    await prisma.lesson.create({ data: { moduleId: mod.id, title: g.lessonTitle, titleTranslated: g.lessonTitleTg, type: 'grammar', skillType: 'grammar', cefrLevel: 'A2', emoji: g.emoji, xpReward: XP.grammar, duration: 5, order: order++, grammarTopicId: topic.id } });
  }

  // 8: listening
  const listen = await prisma.comprehensionExercise.create({ data: { courseId: course.id, cefrLevel: 'A2', kind: LISTENING.kind, title: LISTENING.title, titleTranslated: LISTENING.titleTranslated, passage: LISTENING.passage, passageTranslated: LISTENING.passageTranslated, emoji: LISTENING.emoji, order: 60 } });
  let qo = 0; for (const q of LISTENING.questions) await prisma.comprehensionQuestion.create({ data: { exerciseId: listen.id, question: q.question, questionTranslated: q.questionTranslated, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, order: qo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: LISTENING.lessonTitle, titleTranslated: LISTENING.lessonTitleTg, type: 'quiz', skillType: 'listening', cefrLevel: 'A2', emoji: '🎧', xpReward: XP.listening, duration: 5, order: order++, comprehensionId: listen.id } });

  // 9: speaking dialogue
  const dlg = await prisma.dialogue.create({ data: { courseId: course.id, cefrLevel: 'A2', title: DIALOGUE.title, titleTranslated: DIALOGUE.titleTranslated, scenario: DIALOGUE.scenario, emoji: DIALOGUE.emoji, order: 60 } });
  let lo = 0; for (const ln of DIALOGUE.lines) await prisma.dialogueLine.create({ data: { dialogueId: dlg.id, speaker: ln.speaker, text: ln.text, translation: ln.translation, isUser: ln.isUser, order: lo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: DIALOGUE.lessonTitle, titleTranslated: DIALOGUE.lessonTitleTg, type: 'vocab', skillType: 'speaking', cefrLevel: 'A2', emoji: '🗣️', xpReward: XP.speaking, duration: 5, order: order++, dialogueId: dlg.id } });

  // 10: reading
  const read = await prisma.comprehensionExercise.create({ data: { courseId: course.id, cefrLevel: 'A2', kind: READING.kind, title: READING.title, titleTranslated: READING.titleTranslated, passage: READING.passage, passageTranslated: READING.passageTranslated, emoji: READING.emoji, order: 61 } });
  qo = 0; for (const q of READING.questions) await prisma.comprehensionQuestion.create({ data: { exerciseId: read.id, question: q.question, questionTranslated: q.questionTranslated, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, order: qo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: READING.lessonTitle, titleTranslated: READING.lessonTitleTg, type: 'quiz', skillType: 'reading', cefrLevel: 'A2', emoji: '📖', xpReward: XP.review, duration: 5, order: order++, comprehensionId: read.id } });

  // 11: review
  const rev = await prisma.comprehensionExercise.create({ data: { courseId: course.id, cefrLevel: 'A2', kind: REVIEW.kind, title: REVIEW.title, titleTranslated: REVIEW.titleTranslated, passage: REVIEW.passage, passageTranslated: REVIEW.passageTranslated, emoji: REVIEW.emoji, order: 62 } });
  qo = 0; for (const q of REVIEW.questions) await prisma.comprehensionQuestion.create({ data: { exerciseId: rev.id, question: q.question, questionTranslated: q.questionTranslated, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, order: qo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: 'Lesson 11: Module Review', titleTranslated: 'Дарси 11: Такрори модул', type: 'quiz', skillType: 'review', cefrLevel: 'A2', emoji: '📖', xpReward: XP.review, duration: 5, order: order++, comprehensionId: rev.id } });

  // 12: exam
  const exam = await prisma.comprehensionExercise.create({ data: { courseId: course.id, cefrLevel: 'A2', kind: EXAM.kind, title: EXAM.title, titleTranslated: EXAM.titleTranslated, passage: EXAM.passage, passageTranslated: EXAM.passageTranslated, emoji: EXAM.emoji, order: 63 } });
  qo = 0; for (const q of EXAM.questions) await prisma.comprehensionQuestion.create({ data: { exerciseId: exam.id, question: q.question, questionTranslated: q.questionTranslated, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, order: qo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: 'Lesson 12: Final Exam', titleTranslated: 'Дарси 12: Имтиҳони ниҳоӣ', type: 'quiz', skillType: 'test', cefrLevel: 'A2', emoji: '🏆', xpReward: XP.test, duration: 5, order: order++, comprehensionId: exam.id } });

  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });

  console.log('\n=== A2 · Модули 1 сохта шуд ===');
  console.log(JSON.stringify({ lessons: order, newWords: wordsCreated, grammarLessons: GRAMMAR.length, listeningQ: LISTENING.questions.length, dialogueLines: DIALOGUE.lines.length, readingQ: READING.questions.length, reviewQ: REVIEW.questions.length, examQ: EXAM.questions.length }, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
