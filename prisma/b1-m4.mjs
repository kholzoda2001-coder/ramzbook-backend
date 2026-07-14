import { W, buildModule, refreshExisting, bumpVersion, done } from './b1-module-builder.mjs';

const M = {
  order: 4, title: 'Module 4: Environment and Nature', titleTranslated: 'Модули 4: Муҳити Зист ва Табиат',
  emoji: '🌍', color: '#10B981',
  vocab: [
    { title: 'Lesson 1: Our Planet', tt: 'Дарси 1: Сайёраи мо', emoji: '🌎', words: [
      W('Environment','/ɪnˈvaɪrənmənt/','инвайрэнмэнт','Муҳити зист','🌳','We must protect the environment.','Мо бояд муҳити зистро муҳофизат кунем.','noun'),
      W('Pollution','/pəˈluːʃn/','пэлушн','Ифлосшавӣ','🏭','Air pollution is a huge problem in cities.','Ифлосшавии ҳаво дар шаҳрҳо мушкили бузург аст.','noun'),
      W('Climate','/ˈklaɪmət/','клаймэт','Иқлим / обу ҳаво','☀️','The climate is getting warmer every year.','Иқлим ҳар сол гармтар шуда истодааст.','noun'),
      W('Global warming','/ˈɡləʊbl ˈwɔːmɪŋ/','глоубл воминг','Гармшавии глобалӣ','🌡️','Global warming melts the ice at the poles.','Гармшавии глобалӣ яхро дар қутбҳо об мекунад.','noun'),
      W('Recycle','/ˌriːˈsaɪkl/','рисайкл','Аз нав коркард кардан','♻️','Please recycle your plastic bottles.','Лутфан шишаҳои пластикии худро аз нав коркард кунед.','verb'),
      W('Rubbish','/ˈrʌbɪʃ/','рабиш','Партов / ахлот','🗑️','Don\'t throw your rubbish on the street.','Партови худро ба кӯча напартоед.','noun'),
      W('Protect','/prəˈtekt/','прэтект','Муҳофизат кардан','🛡️','We need laws to protect animals.','Барои муҳофизати ҳайвонот ба мо қонунҳо лозиманд.','verb'),
      W('Destroy','/dɪˈstrɔɪ/','дистрой','Вайрон кардан / нест кардан','💥','The fire destroyed the forest.','Оташ ҷангалро нест кард.','verb'),
      W('Resource','/rɪˈsɔːs/','рисос','Манбаъ / сарват','💧','Water is a precious natural resource.','Об сарвати пурарзиши табиӣ аст.','noun'),
      W('Energy','/ˈenədʒi/','енэҷӣ','Энергия / нерӯ','⚡','Solar power is clean energy.','Нерӯи офтобӣ энергияи тоза аст.','noun'),
    ]},
    { title: 'Lesson 2: Animals and Plants', tt: 'Дарси 2: Ҳайвонот ва наботот', emoji: '🐘', words: [
      W('Wildlife','/ˈwaɪldlaɪf/','вайлдлайф','Олами ҳайвоноти ваҳшӣ','🦁','The park is full of beautiful wildlife.','Боғ пур аз олами ҳайвоноти ваҳшии зебо аст.','noun'),
      W('Species','/ˈspiːʃiːz/','спишиз','Намуд / ҷинс (биологӣ)','🦋','Many species of birds live in this jungle.','Бисёр намудҳои паррандагон дар ин ҷангал зиндагӣ мекунанд.','noun'),
      W('Endangered','/ɪnˈdeɪndʒəd/','индейнҷэд','Дар зери хатари нобудшавӣ','⚠️','The panda is an endangered animal.','Панда ҳайвони зери хатари нобудшавӣ аст.','adjective'),
      W('Habitat','/ˈhæbɪtæt/','ҳэбитэт','Макони зист (табиӣ)','🏞️','The forest is the natural habitat of the bear.','Ҷангал макони зисти табиии хирс аст.','noun'),
      W('Extinct','/ɪkˈstɪŋkt/','икстинкт','Нобудшуда (насл)','🦖','Dinosaurs became extinct millions of years ago.','Динозаврҳо миллионҳо сол пеш нобуд шудаанд.','adjective'),
      W('Insect','/ˈɪnsekt/','инсект','Ҳашарот','🐞','Ants and bees are insects.','Мӯрчаҳо ва занбӯрҳо ҳашаротанд.','noun'),
      W('Agriculture','/ˈæɡrɪkʌltʃə(r)/','эгрикалчэ','Кишоварзӣ','🚜','Agriculture is important for our economy.','Кишоварзӣ барои иқтисодиёти мо муҳим аст.','noun'),
      W('Crop','/krɒp/','кроп','Ҳосил / зироат','🌾','Farmers had a good crop of wheat this year.','Деҳқонон имсол ҳосили хуби гандум доштанд.','noun'),
      W('Seed','/siːd/','сид','Тухмӣ / дона','🌱','Plant the seed in the soil and water it.','Тухмиро дар хок шинонед ва ба он об диҳед.','noun'),
      W('Roots','/ruːts/','рутс','Решаҳо','🌲','The tree has very deep roots.','Дарахт решаҳои хеле чуқур дорад.','noun'),
    ]},
    { title: 'Lesson 3: Natural Disasters', tt: 'Дарси 3: Офатҳои табиӣ', emoji: '🌪️', words: [
      W('Disaster','/dɪˈzɑːstə(r)/','дизастэ','Офат / фалокат','🌋','The earthquake was a terrible disaster.','Заминҷунбӣ фалокати даҳшатнок буд.','noun'),
      W('Earthquake','/ˈɜːθkweɪk/','ёрсквейк','Заминҷунбӣ','🫨','The earthquake shook the whole city.','Заминҷунбӣ тамоми шаҳрро ларзонд.','noun'),
      W('Flood','/flʌd/','флад','Обхезӣ / сел','🌊','The heavy rain caused a massive flood.','Борони сахт сабаби обхезии азим шуд.','noun'),
      W('Hurricane','/ˈhʌrɪkən/','ҳэрикэн','Тӯфон (дарёӣ)','🌀','The hurricane destroyed many houses near the beach.','Тӯфон бисёр хонаҳои назди соҳилро вайрон кард.','noun'),
      W('Drought','/draʊt/','драут','Хушксолӣ','🏜️','Plants die quickly during a long drought.','Дар давраи хушксолии дароз растаниҳо зуд мемиранд.','noun'),
      W('Volcano','/vɒlˈkeɪnəʊ/','волкейно','Вулқон','🌋','The volcano erupted and sent ash into the sky.','Вулқон оташфишонӣ кард ва хокистарро ба осмон фиристод.','noun'),
      W('Rescue','/ˈreskjuː/','рескю','Наҷот додан','🚁','Helicopters came to rescue the trapped people.','Чархболҳо барои наҷот додани одамони дармонда омаданд.','verb'),
      W('Damage','/ˈdæmɪdʒ/','дэмиҷ','Зарар / хисорот','🏚️','The storm caused a lot of damage to the roof.','Тӯфон ба бом хисороти зиёд расонд.','noun'),
      W('Survive','/səˈvaɪv/','сэвайв','Зинда мондан','💪','Only a few animals survived the fire.','Танҳо чанд ҳайвон аз оташ зинда монданд.','verb'),
      W('Emergency','/iˈmɜːdʒənsi/','имёҷэнси','Ҳолати фавқулодда','🚑','In an emergency, call 911.','Дар ҳолати фавқулодда ба 911 занг занед.','noun'),
    ]},
    { title: 'Lesson 4: Nature Phrasal Verbs', tt: 'Дарси 4: Феълҳои таркибии табиат', emoji: '🌿', words: [
      W('Cut down','/kʌt daʊn/','кат даун','Буридан (дарахтро)','🪓','They cut down the old tree in the park.','Онҳо дарахти кӯҳнаро дар боғ буриданд.','verb'),
      W('Die out','/daɪ aʊt/','дай аут','Нобуд шудан (пурра)','💀','Dinosaurs died out a long time ago.','Динозаврҳо кайҳо пеш нобуд шуданд.','verb'),
      W('Clear up','/klɪər ʌp/','клиэр ап','Тоза кардан / кушода шудан (ҳаво)','🌤️','I hope the weather clears up later.','Умедворам, ки ҳаво дертар кушода мешавад.','verb'),
      W('Clean up','/kliːn ʌp/','клин ап','Тоза кардан (аз партов)','🧹','Volunteers helped to clean up the beach.','Ихтиёриён ба тоза кардани соҳил кумак карданд.','verb'),
      W('Throw away','/θrəʊ əˈweɪ/','сроу эвей','Партофтан','🗑️','Don\'t throw away paper; recycle it!','Қоғазро напартоед; онро коркард кунед!','verb'),
      W('Use up','/juːz ʌp/','юз ап','Тамом кардан / пурра истифода бурдан','🪫','We have used up all the hot water.','Мо тамоми оби гармро истифода кардем.','verb'),
      W('Dry up','/draɪ ʌp/','драй ап','Хушк шудан (дарё/кӯл)','🏜️','The river dries up completely in the summer.','Дарё дар тобистон пурра хушк мешавад.','verb'),
      W('Wash away','/wɒʃ əˈweɪ/','вош эвей','Шуста бурдан (об)','🌊','The flood washed away the small bridge.','Обхезӣ пули хурдро шуста бурд.','verb'),
      W('Run out of','/rʌn aʊt ɒv/','ран аут ов','Тамом шудан (захира)','⛽','The car ran out of petrol.','Бензини мошин тамом шуд.','verb'),
      W('Put out','/pʊt aʊt/','пут аут','Хомӯш кардан (оташро)','🧯','It took hours to put out the forest fire.','Хомӯш кардани оташи ҷангал соатҳо вақт гирифт.','verb'),
    ]}
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 5: Grammar — First Conditional', lessonTitleTg: 'Дарси 5: Грамматика — Шарти якум (Воқеӣ)',
      title: 'First Conditional (Real Future)', titleTranslated: 'Шарти якум (Ояндаи воқеӣ)', emoji: '🔮',
      explanation:
`Мо **First Conditional** (Шарти якум)-ро барои ҳодисаҳои эҳтимолӣ ва воқеӣ дар оянда истифода мебарем. Яъне, "Агар ин кор шавад, он кор хоҳад шуд."

**Сохтор: If + Present Simple, [Subject] + will + V1**

Дар қисми "If" мо ҳеҷ гоҳ "will"-ро истифода намебарем, гарчанде маънои оянда дорад! Мо замони ҳозира (Present Simple)-ро истифода мебарем. Дар қисми асосӣ "will" меояд.

Мисолҳо:
* *If it **rains** tomorrow, I **will stay** at home.* (Агар пагоҳ борон борад, ман дар хона мемонам).
* *If we **don't protect** tigers, they **will die out**.* (Агар мо палангҳоро муҳофизат накунем, онҳо нобуд хоҳанд шуд).
* *She **will pass** the exam if she **studies** hard.* (Ӯ имтиҳонро месупорад, агар сахт хонад). (Дар ин ҷо "If" дар мобайн омадааст, китеб (вергул) лозим нест).

Калимаи **Unless** (агар... на):
Unless маънои "if not"-ро дорад. Баъди unless мо феъли мусбатро мемонем, чунки худи unless аллакай манфӣ аст.
* *Unless we act now, the planet will get hotter.* = *If we don't act now, the planet will get hotter.* (Агар мо ҳозир амал накунем, сайёра гармтар хоҳад шуд).`,
      rules: [
        { pattern: 'If + Present, ... will + V1', note: 'If it rains, we will stay home.' },
        { pattern: 'will + V1 ... if + Present', note: 'They will win if they play well.' },
        { pattern: 'Unless = If not', note: 'Unless you hurry, you will be late.' },
      ],
      examples: [
        { sentence: 'If we recycle paper, we will save trees.', translation: 'Агар мо қоғазро коркард кунем, мо дарахтҳоро наҷот медиҳем.', highlight: 'recycle ... will save' },
        { sentence: 'The water will run out if it doesn\'t rain soon.', translation: 'Агар ба зудӣ борон наборад, об тамом хоҳад шуд.', highlight: 'will run out ... doesn\'t rain' },
        { sentence: 'If she doesn\'t hurry, she will miss the bus.', translation: 'Агар ӯ шитоб накунад, ӯ аз автобус дер мемонад.', highlight: 'doesn\'t hurry ... will miss' },
        { sentence: 'Animals will lose their homes unless we stop cutting down trees.', translation: 'Ҳайвонҳо хонаҳои худро гум хоҳанд кард, агар мо буридани дарахтонро бас накунем.', highlight: 'will lose ... unless we stop' },
      ],
      exercises: [
        { type:'choose', prompt:'If I ___ time, I will help you clean up the park.', promptTranslated:'Агар ман вақт дошта бошам, ман дар тоза кардани боғ ба ту кумак мекунам.', options:['have','will have','had','has'], answer:'have', explanation:'Дар қисми "If" замони ҳозира (have) меояд.' },
        { type:'choose', prompt:'We will go to the beach tomorrow if the weather ___ nice.', promptTranslated:'Пагоҳ мо ба соҳил меравем, агар ҳаво хуб бошад.', options:['is','will be','was','be'], answer:'is', explanation:'Дар қисми "if" замони ҳозира: is.' },
        { type:'choose', prompt:'___ we use less plastic, the oceans will be cleaner.', promptTranslated:'Агар мо пластикаи камтар истифода барем, уқёнусҳо тозатар хоҳанд шуд.', options:['If','Unless','When','Because'], answer:'If', explanation:'"If" (Агар) маъно медиҳад.' },
        { type:'fill_blank', prompt:'Unless you study hard, you ___ (намегузарӣ) the exam.', promptTranslated:'Агар сахт нахонӣ, ту имтиҳонро намегузарӣ.', answer:'will not pass', explanation:'Қисми асосӣ бо will (манфӣ: won\'t pass ё will not pass) меояд.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Агар борон борад, мо дар хона мемонем.', options:['If','it','rains','we will','stay home'], answer:'If it rains we will stay home.', explanation:'If it rains we will stay home.' },
        { type:'transform', prompt:'Ислоҳ кунед: If he will come, I will be happy.', promptTranslated:'Дар қисми if "will" намешавад.', answer:'If he comes, I will be happy.', explanation:'If he comes, I will be happy.' },
      ],
    },
    {
      lessonTitle: 'Lesson 6: Grammar — Second Conditional', lessonTitleTg: 'Дарси 6: Грамматика — Шарти дуюм (Ғайривоқеӣ)',
      title: 'Second Conditional (Unreal Present/Future)', titleTranslated: 'Шарти дуюм (Орзу ва хаёли ғайривоқеӣ)', emoji: '💭',
      explanation:
`Мо **Second Conditional** (Шарти дуюм)-ро барои орзуҳо, хаёлҳо ё ҳолатҳои **ғайривоқеӣ** дар замони ҳозира ва оянда истифода мебарем. Яъне, "Агар чунин мебуд, ман фалон корро мекардам" (аммо дар асл чунин нест).

**Сохтор: If + Past Simple, [Subject] + would + V1**

Эҳтиёт шавед: Гарчанде мо феъли гузаштаро истифода мебарем, маънои он барои замони **ҳозира ё оянда** аст! Ин танҳо як "хаёл" аст.

Мисолҳо:
* *If I **had** a million dollars, I **would travel** the world.* (Агар ман як миллион доллар медоштам (надорам), ман ҷаҳонро саёҳат мекардам).
* *If she **knew** the answer, she **would tell** us.* (Агар ӯ ҷавобро медонист, ба мо мегуфт (намедонад)).
* *We **would buy** an electric car if they **were** cheaper.* (Мо мошини барқӣ мехаридем, агар онҳо арзонтар мебуданд).

Дар шарти дуюм, ба ҷои "was" барои ҳама шахсҳо (I, he, she, it) аксар вақт аз **were** истифода мебарем:
* *If I **were** you, I wouldn't do that.* (Агар ман ба ҷои ту мебудам, он корро намекардам).`,
      rules: [
        { pattern: 'If + Past, ... would + V1', note: 'If I won the lottery, I would buy a house.' },
        { pattern: 'would + V1 ... if + Past', note: 'She would help if she had time.' },
        { pattern: 'If I were you...', note: 'If I were you, I would study harder.' },
      ],
      examples: [
        { sentence: 'If animals could talk, they would ask us to protect them.', translation: 'Агар ҳайвонҳо гап зада метавонистанд, онҳо аз мо хоҳиш мекарданд, ки ҳифзашон кунем.', highlight: 'could talk ... would ask' },
        { sentence: 'I would ride a bike to work if I lived closer.', translation: 'Ман ба кор бо дучарха мерафтам, агар наздиктар зиндагӣ мекардам.', highlight: 'would ride ... lived' },
        { sentence: 'If I were the president, I would ban plastic bags.', translation: 'Агар ман президент мебудам, ман халтаҳои пластикиро манъ мекардам.', highlight: 'were ... would ban' },
        { sentence: 'What would you do if you saw a bear?', translation: 'Агар шумо хирсро медидед, чӣ кор мекардед?', highlight: 'would you do ... saw' },
      ],
      exercises: [
        { type:'choose', prompt:'If I ___ rich, I would travel around the world.', promptTranslated:'Агар ман сарватманд мебудам, ман дар саросари ҷаҳон саёҳат мекардам.', options:['were','am','will be','been'], answer:'were', explanation:'Дар шарти дуюм барои ҳама шахсҳо "were" (ё was) истифода мешавад.' },
        { type:'choose', prompt:'She would buy that car if she ___ enough money.', promptTranslated:'Ӯ он мошинро мехарид, агар пули кофӣ медошт.', options:['had','has','have','having'], answer:'had', explanation:'If + Past Simple (had).' },
        { type:'choose', prompt:'If people didn\'t drive so much, there ___ less pollution.', promptTranslated:'Агар одамон ин қадар зиёд мошин намеронданд, ифлосшавӣ камтар мешуд.', options:['would be','will be','is','was'], answer:'would be', explanation:'Дар қисми асосӣ would + V1 (be) меояд.' },
        { type:'fill_blank', prompt:'What ___ you do (шумо чӣ кор мекардед) if you found a wallet on the street?', promptTranslated:'Агар дар кӯча ҳамёнро меёфтед, чӣ кор мекардед?', answer:'would', explanation:'Савол дар шарти дуюм: What would you do?' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Агар ман ҷавобро медонистам, ба ту мегуфтам.', options:['If','I','knew the answer','I would','tell you'], answer:'If I knew the answer I would tell you.', explanation:'If I knew the answer I would tell you.' },
        { type:'transform', prompt:'Ислоҳ кунед: If I have a car, I would drive to work.', promptTranslated:'Дар қисми if гузашта лозим аст.', answer:'If I had a car, I would drive to work.', explanation:'have -> had.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 7: Listening — The Rainforest Rescue', lessonTitleTg: 'Дарси 7: Шунавоӣ — Наҷоти Ҷангали Боронӣ',
    title: 'The Rainforest Rescue', titleTranslated: 'Наҷоти Ҷангали Боронӣ', emoji: '🌳',
    passage: 'Deep in the Amazon rainforest, a group of scientists were studying rare insects. The environment was hot and humid. Suddenly, they noticed smoke rising in the distance. A large forest fire had started and was spreading quickly. If the fire continued, it would destroy the habitat of hundreds of endangered species. The leader of the team immediately called emergency services using a satellite phone. Helicopters arrived within two hours and dropped thousands of litres of water to put out the flames. Although some trees were damaged, the quick action saved the wildlife in that area. The scientists later explained that if the helicopters hadn\'t arrived so fast, the disaster would have been much worse. They warned that global warming makes these fires more frequent.',
    passageTranslated: 'Дар умқи ҷангали борони Амазонка як гурӯҳ олимон ҳашароти нодирро меомӯхтанд. Муҳити зист гарм ва намнок буд. Ногаҳон онҳо пайхас карданд, ки дар масофа дуд баланд мешавад. Сӯхтори калони ҷангал сар шуда, зуд паҳн мешуд. Агар сӯхтор идома меёфт, он макони зисти садҳо намудҳои зери хатари нобудшавиро нест мекард. Роҳбари даста фавран тавассути телефони моҳворагӣ ба хадамоти ёрии таъҷилӣ занг зад. Чархболҳо дар давоми ду соат расиданд ва ҳазорҳо литр обро барои хомӯш кардани оташ партофтанд. Гарчанде ки баъзе дарахтон хисорот диданд, амали зуд олами ҳайвоноти ваҳшии он минтақаро наҷот дод. Олимон баъдтар фаҳмонданд, ки агар чархболҳо ин қадар зуд намерасиданд, фалокат хеле бадтар мешуд. Онҳо ҳушдор доданд, ки гармшавии глобалӣ ин сӯхторҳоро бештар мекунад.',
    questions: [
      { question:'What were the scientists doing in the Amazon?', correctIndex:0, questionTranslated:'Олимон дар Амазонка чӣ кор мекарданд?', options:['Studying rare insects','Planting trees','Hunting animals'], explanation:'a group of scientists were studying rare insects.' },
      { question:'What danger did they notice?', correctIndex:1, questionTranslated:'Онҳо кадом хатарро пайхас карданд?', options:['A flood','A forest fire','A hurricane'], explanation:'A large forest fire had started.' },
      { question:'How did they call for help?', correctIndex:2, questionTranslated:'Онҳо чӣ гуна ба кӯмак занг заданд?', options:['By shouting loudly','Using a mobile phone','Using a satellite phone'], explanation:'called emergency services using a satellite phone.' },
      { question:'What did the helicopters do?', correctIndex:0, questionTranslated:'Чархболҳо чӣ кор карданд?', options:['Dropped water to put out the fire','Rescued the scientists','Took photos'], explanation:'dropped thousands of litres of water to put out the flames.' },
      { question:'What is making these fires more frequent?', correctIndex:1, questionTranslated:'Чӣ ин сӯхторҳоро бештар мекунад?', options:['Insects','Global warming','Helicopters'], explanation:'They warned that global warming makes these fires more frequent.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 8: Speaking — Discussing Climate Change', lessonTitleTg: 'Дарси 8: Гуфтугӯ — Муҳокимаи Тағйирёбии Иқлим',
    title: 'Discussing Climate Change', titleTranslated: 'Муҳокимаи Тағйирёбии Иқлим', emoji: '🌡️',
    scenario: 'Шумо ва ҳамкоратон дар бораи муҳити зист ва ифлосшавӣ сӯҳбат мекунед.',
    lines: [
      { speaker:'Colleague', text:'Did you watch the documentary about global warming last night?', translation:'Оё ту дирӯз бегоҳ филми ҳуҷҷатиро дар бораи гармшавии глобалӣ тамошо кардӣ?', isUser:false },
      { speaker:'You', text:'Yes, I did. It is really scary to see how fast the ice is melting.', translation:'Бале, тамошо кардам. Дидани он ки чӣ гуна ях босуръат об шуда истодааст, воқеан даҳшатнок аст.', isUser:true },
      { speaker:'Colleague', text:'I agree. If we don\'t change our habits, many coastal cities will flood.', translation:'Ман розӣ ҳастам. Агар мо одатҳои худро иваз накунем, бисёр шаҳрҳои соҳилӣ зери об мемонанд.', isUser:false },
      { speaker:'You', text:'Exactly. If I were the president, I would ban single-use plastic completely.', translation:'Маҳз ҳамин тавр. Агар ман президент мебудам, ман пластикаи якдафъаинаро пурра манъ мекардам.', isUser:true },
      { speaker:'Colleague', text:'That is a good idea. But individuals also need to do their part, like recycling.', translation:'Ин фикри хуб аст. Аммо шахсони алоҳида низ бояд саҳми худро гузоранд, ба монанди коркарди дубора.', isUser:false },
      { speaker:'You', text:'True. We use up too much energy. I try to walk instead of driving when possible.', translation:'Дуруст аст. Мо энергияи аз ҳад зиёдро тамом мекунем. Ман кӯшиш мекунам, ки ҳангоми имконпазир будан ба ҷои рондан пиёда равам.', isUser:true },
      { speaker:'Colleague', text:'I should start doing that too. It reduces air pollution.', translation:'Ман ҳам бояд ин корро оғоз кунам. Он ифлосшавии ҳаворо кам мекунад.', isUser:false },
      { speaker:'You', text:'Yes, every small action helps to protect our environment.', translation:'Бале, ҳар як амали хурд ба муҳофизати муҳити зисти мо кӯмак мекунад.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 9: Reading — The Plastic Problem', lessonTitleTg: 'Дарси 9: Хониш — Мушкилоти Пластик',
    title: 'The Plastic Problem', titleTranslated: 'Мушкилоти Пластик', emoji: '🥤',
    passage: 'Plastic pollution is one of the most serious environmental disasters of our time. Every year, millions of tonnes of plastic rubbish are thrown away. A large amount of this plastic ends up in our oceans. Marine animals, such as turtles and birds, often mistake small pieces of plastic for food. If they eat it, they can become very sick or die. Furthermore, plastic does not disappear quickly; it can take hundreds of years to break down. To solve this problem, many countries are encouraging citizens to recycle more and use alternatives like paper bags or glass bottles. Some supermarkets have stopped providing free plastic bags. However, unless global companies change their packaging methods, these small steps won\'t be enough. Everyone needs to work together to clean up the oceans and protect endangered marine life before it is too late.',
    passageTranslated: 'Ифлосшавии пластикӣ яке аз ҷиддитарин фалокатҳои экологии замони мост. Ҳар сол миллионҳо тонна партовҳои пластикӣ партофта мешаванд. Миқдори зиёди ин пластик дар уқёнусҳои мо меафтад. Ҳайвонҳои баҳрӣ, ба монанди сангпуштҳо ва паррандагон, аксар вақт пораҳои хурди пластикро бо ғизо иштибоҳ мекунанд. Агар онҳо онро бихӯранд, метавонанд сахт бемор шаванд ё бимиранд. Илова бар ин, пластик зуд нест намешавад; барои таҷзия шудан садҳо сол лозим мешавад. Барои ҳалли ин мушкилот, бисёр кишварҳо шаҳрвандонро ташвиқ мекунанд, ки бештар коркарди дубора кунанд ва аз алтернативаҳо ба монанди халтаҳои қоғазӣ ё шишаҳои шишагӣ истифода баранд. Баъзе супермаркетҳо пешниҳоди халтаҳои пластикии ройгонро бас карданд. Бо вуҷуди ин, агар ширкатҳои ҷаҳонӣ усулҳои бастабандии худро иваз накунанд, ин қадамҳои хурд кофӣ нахоҳанд буд. Ҳама бояд якҷоя кор кунанд, то уқёнусҳоро тоза кунанд ва ҳаёти баҳрии зери хатари нобудшавиро муҳофизат кунанд, пеш аз он ки хеле дер шавад.',
    questions: [
      { question:'Where does a large amount of plastic end up?', correctIndex:0, questionTranslated:'Миқдори зиёди пластик дар куҷо меафтад?', options:['In the oceans','In the forest','In the mountains'], explanation:'A large amount of this plastic ends up in our oceans.' },
      { question:'What do marine animals often mistake plastic for?', correctIndex:1, questionTranslated:'Ҳайвонҳои баҳрӣ аксар вақт пластикро бо чӣ иштибоҳ мекунанд?', options:['Toys','Food','Other animals'], explanation:'mistake small pieces of plastic for food.' },
      { question:'How long does it take for plastic to break down?', correctIndex:2, questionTranslated:'Барои таҷзия шудани пластик чӣ қадар вақт лозим аст?', options:['A few days','A few months','Hundreds of years'], explanation:'it can take hundreds of years to break down.' },
      { question:'What are some supermarkets doing to help?', correctIndex:0, questionTranslated:'Баъзе супермаркетҳо барои кӯмак чӣ кор карда истодаанд?', options:['Stopped providing free plastic bags','Selling more plastic','Giving away free fish'], explanation:'Some supermarkets have stopped providing free plastic bags.' },
      { question:'What is needed for these small steps to be enough?', correctIndex:1, questionTranslated:'Барои он ки ин қадамҳои хурд кофӣ бошанд, чӣ лозим аст?', options:['More plastic bags','Global companies changing packaging methods','More supermarkets'], explanation:'unless global companies change their packaging methods, these small steps won\'t be enough.' },
    ],
  },
  review: {
    passage: 'Our planet is facing several challenges. The climate is changing, causing global warming and extreme weather like floods and droughts. Forests are being destroyed, which threatens the habitat of many wildlife species. However, there is still hope. If people start to recycle more and use renewable energy, we will reduce pollution. Many young people are protesting to force governments to take action. If I had the power, I would plant a million trees and protect the oceans. Remember, we only have one Earth, and it is our responsibility to look after it for future generations.',
    passageTranslated: 'Сайёраи мо бо якчанд мушкилот рӯбарӯ аст. Иқлим тағйир ёфта, боиси гармшавии глобалӣ ва обу ҳавои шадид ба монанди обхезиҳо ва хушксолиҳо мегардад. Ҷангалҳо нобуд карда мешаванд, ки ба макони зисти бисёр намудҳои ҳайвоноти ваҳшӣ таҳдид мекунад. Бо вуҷуди ин, ҳанӯз ҳам умед ҳаст. Агар одамон бештар коркарди дубораро оғоз кунанд ва энергияи барқароршавандаро истифода баранд, мо ифлосшавиро кам хоҳем кард. Бисёре аз ҷавонон эътироз мекунанд, то ҳукуматҳоро маҷбур кунанд, ки чора бинанд. Агар ман қудрат медоштам, ман як миллион дарахт мешинондам ва уқёнусҳоро муҳофизат мекардам. Дар хотир доред, ки мо танҳо як Замин дорем ва нигоҳубини он барои наслҳои оянда масъулияти мост.',
    questions: [
      { question:'What is global warming causing?', correctIndex:0, questionTranslated:'Гармшавии глобалӣ сабаби чӣ мегардад?', options:['Extreme weather like floods and droughts','Colder winters everywhere','More fish in the sea'], explanation:'causing global warming and extreme weather like floods and droughts.' },
      { question:'What threatens the habitat of wildlife?', correctIndex:1, questionTranslated:'Чӣ ба макони зисти ҳайвоноти ваҳшӣ таҳдид мекунад?', options:['Planting trees','Forests being destroyed','Recycling'], explanation:'Forests are being destroyed, which threatens the habitat...' },
      { question:'How can we reduce pollution?', correctIndex:1, questionTranslated:'Мо чӣ гуна метавонем ифлосшавиро кам кунем?', options:['By driving more cars','By recycling more and using renewable energy','By cutting down trees'], explanation:'If people start to recycle more and use renewable energy, we will reduce pollution.' },
      { question:'What would the writer do if they had the power?', correctIndex:2, questionTranslated:'Нависанда агар қудрат медошт, чӣ кор мекард?', options:['Build more factories','Go to the moon','Plant trees and protect the oceans'], explanation:'If I had the power, I would plant a million trees and protect the oceans.' },
      { question:'Whose responsibility is it to look after the Earth?', correctIndex:0, questionTranslated:'Нигоҳубини Замин масъулияти кист?', options:['Our responsibility','Only the government\'s responsibility','Aliens'], explanation:'it is our responsibility to look after it.' },
    ],
  },
  exam: {
    passage: 'Imagine a world where the air is clean, the rivers run clear, and endangered species thrive in their natural habitats. This vision can become a reality if we take climate change seriously. Currently, we use up natural resources faster than the Earth can replace them. The continued burning of fossil fuels creates pollution that damages the atmosphere. Unless we transition to clean energy like solar or wind power, temperatures will continue to rise. If every community cleaned up its local environment and reduced waste, the global impact would be massive. Environmentalists argue that we cannot afford to wait. We must act now, because if we were to lose our beautiful planet, we would have nowhere else to go.',
    passageTranslated: 'Ҷаҳонеро тасаввур кунед, ки дар он ҳаво тоза аст, дарёҳо соф ҷорӣ мешаванд ва намудҳои зери хатари нобудшавӣ дар макони зисти табиии худ рушд мекунанд. Ин биниш метавонад ба воқеият табдил ёбад, агар мо тағйирёбии иқлимро ҷиддӣ қабул кунем. Дар айни замон, мо захираҳои табииро зудтар аз он ки Замин онҳоро иваз карда тавонад, тамом мекунем. Сӯзондани давомдори сӯзишвории истихроҷшуда ифлосшавиеро ба вуҷуд меорад, ки ба атмосфера зарар мерасонад. Агар мо ба энергияи тоза ба монанди нерӯи офтоб ё шамол нагузарем, ҳарорат боло рафтанро идома медиҳад. Агар ҳар як ҷомеа муҳити маҳаллии худро тоза мекард ва партовҳоро кам мекард, таъсири глобалӣ азим мешуд. Экологҳо баҳс мекунанд, ки мо наметавонем интизор шавем. Мо бояд ҳоло амал кунем, зеро агар мо сайёраи зебои худро аз даст медодем, мо ҷои дигаре барои рафтан намедоштем.',
    questions: [
      { question:'What happens if we take climate change seriously?', correctIndex:0, questionTranslated:'Агар мо тағйирёбии иқлимро ҷиддӣ қабул кунем, чӣ мешавад?', options:['The vision of a clean world can become a reality','Everything will be destroyed','People will stop travelling'], explanation:'This vision can become a reality if we take climate change seriously.' },
      { question:'What is the problem with how we use natural resources?', correctIndex:1, questionTranslated:'Дар тарзи истифодаи захираҳои табиӣ аз ҷониби мо кадом мушкил вуҷуд дорад?', options:['We don\'t use enough','We use them faster than the Earth can replace them','We only use renewable resources'], explanation:'we use up natural resources faster than the Earth can replace them.' },
      { question:'What damages the atmosphere?', correctIndex:0, questionTranslated:'Чӣ ба атмосфера зарар мерасонад?', options:['Burning fossil fuels','Using solar power','Planting trees'], explanation:'The continued burning of fossil fuels creates pollution that damages the atmosphere.' },
      { question:'What will happen unless we transition to clean energy?', correctIndex:2, questionTranslated:'Агар мо ба энергияи тоза нагузарем, чӣ мешавад?', options:['The Earth will freeze','Prices will drop','Temperatures will continue to rise'], explanation:'Unless we transition to clean energy... temperatures will continue to rise.' },
      { question:'Why must we act now according to environmentalists?', correctIndex:1, questionTranslated:'Тибқи гуфтаи экологҳо чаро мо бояд ҳоло амал кунем?', options:['Because it is cheap','Because we have nowhere else to go if we lose the planet','Because they are bored'], explanation:'if we were to lose our beautiful planet, we would have nowhere else to go.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 4 (B1) тайёр.');
