import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 10, title: 'Module 11: Weather And Nature', titleTranslated: 'Модули 11: Обу ҳаво ва Табиат',
  emoji: '🌦️', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Weather', tt: 'Дарси 1: Обу ҳаво', emoji: '🌤️', words: [
      W('Cloudy','/ˈklaʊdi/','клауди','Абрнок','☁️','The sky is cloudy today.','Осмон имрӯз абрнок аст.','adjective'),
      W('Windy','/ˈwɪndi/','винди','Шамолнок / бодхез','💨','It is very windy outside.','Дар берун хеле бодхез аст.','adjective'),
      W('Foggy','/ˈfɒɡi/','фоги','Тумоннок','🌫️','The morning was foggy.','Субҳ тумоннок буд.','adjective'),
      W('Stormy','/ˈstɔːmi/','стоми','Тӯфонӣ','⛈️','It was a stormy night.','Шаби тӯфонӣ буд.','adjective'),
      W('Thunder','/ˈθʌndə/','сандер','Раъд','🌩️','I heard loud thunder.','Ман раъди баландро шунидам.','noun'),
      W('Lightning','/ˈlaɪtnɪŋ/','лайтнинг','Барқ / чақмоқ','⚡','Lightning lit up the sky.','Барқ осмонро равшан кард.','noun'),
      W('Rainbow','/ˈreɪnbəʊ/','рейнбоу','Тирукамон','🌈','A rainbow appeared after the rain.','Баъди борон тирукамон пайдо шуд.','noun'),
      W('Shower','/ˈʃaʊə/','шауер','Борони кӯтоҳ','🌦️','We had a light shower.','Мо борони сабуки кӯтоҳ доштем.','noun'),
      W('Breeze','/briːz/','бриз','Насим / боди мулоим','🍃','A cool breeze is nice.','Насими салқин форам аст.','noun'),
      W('Freezing','/ˈfriːzɪŋ/','фризинг','Яхбандон / сард','🥶','It is freezing this morning.','Ин субҳ яхбандон аст.','adjective'),
    ]},
    { title: 'Lesson 2: Landscape', tt: 'Дарси 2: Манзараи табиат', emoji: '🏞️', words: [
      W('Forest','/ˈfɒrɪst/','форест','Ҷангал','🌲','We walked through the forest.','Мо аз ҷангал гузаштем.','noun'),
      W('Hill','/hɪl/','ҳил','Теппа','⛰️','There is a house on the hill.','Дар теппа хона ҳаст.','noun'),
      W('Valley','/ˈvæli/','вэли','Водӣ / дара','🏞️','The valley is green in spring.','Водӣ дар баҳор сабз аст.','noun'),
      W('Desert','/ˈdezət/','дезерт','Биёбон','🏜️','The desert is hot and dry.','Биёбон гарм ва хушк аст.','noun'),
      W('Lake','/leɪk/','лейк','Кӯл','🏞️','We swam in the lake.','Мо дар кӯл шино кардем.','noun'),
      W('Waterfall','/ˈwɔːtəfɔːl/','вотерфол','Шаршара','🌊','The waterfall is very tall.','Шаршара хеле баланд аст.','noun'),
      W('Cave','/keɪv/','кейв','Ғор','🕳️','Bats live in the cave.','Кӯршапаракҳо дар ғор зиндагӣ мекунанд.','noun'),
      W('Cliff','/klɪf/','клиф','Кӯҳпора / ҷарӣ','🧗','Don\'t stand near the cliff.','Дар назди ҷарӣ наист.','noun'),
      W('Field','/fiːld/','филд','Дала / киштзор','🌾','The farmer works in the field.','Деҳқон дар дала кор мекунад.','noun'),
      W('Stream','/striːm/','стрим','Ҷӯй / рӯдча','💧','A small stream runs here.','Дар ин ҷо ҷӯйи хурд ҷорист.','noun'),
    ]},
    { title: 'Lesson 3: Plants And Wildlife', tt: 'Дарси 3: Наботот ва Ҳайвоноти ваҳшӣ', emoji: '🦋', words: [
      W('Leaf','/liːf/','лиф','Барг','🍃','The leaf fell from the tree.','Барг аз дарахт афтод.','noun'),
      W('Branch','/brɑːntʃ/','бранч','Шоха','🌿','A bird sat on the branch.','Парранда дар шоха нишаст.','noun'),
      W('Root','/ruːt/','рут','Реша','🌱','The roots are deep.','Решаҳо чуқур ҳастанд.','noun'),
      W('Seed','/siːd/','сид','Тухмӣ','🌰','Plant the seeds in spring.','Тухмиҳоро дар баҳор шинон.','noun'),
      W('Insect','/ˈɪnsekt/','инсект','Ҳашарот','🐜','Bees are useful insects.','Занбӯрҳо ҳашароти муфиданд.','noun'),
      W('Butterfly','/ˈbʌtəflaɪ/','батерфлай','Шапалак','🦋','A butterfly landed on the flower.','Шапалак ба гул нишаст.','noun'),
      W('Bee','/biː/','би','Занбӯри асал','🐝','The bee makes honey.','Занбӯр асал месозад.','noun'),
      W('Nest','/nest/','нест','Лона / ошёна','🪹','The bird built a nest.','Парранда лона сохт.','noun'),
      W('Feather','/ˈfeðə/','федер','Пар','🪶','I found a bird\'s feather.','Ман пари паррандаро ёфтам.','noun'),
      W('Wild','/waɪld/','вайлд','Ваҳшӣ / худрӯй','🐺','Wild animals live in the forest.','Ҳайвоноти ваҳшӣ дар ҷангал зиндагӣ мекунанд.','adjective'),
    ]},
    { title: 'Lesson 4: The Environment', tt: 'Дарси 4: Муҳити зист', emoji: '♻️', words: [
      W('Pollution','/pəˈluːʃən/','полюшн','Ифлосшавӣ / олудагӣ','🏭','Air pollution is a big problem.','Олудагии ҳаво мушкили калон аст.','noun'),
      W('Rubbish','/ˈrʌbɪʃ/','рабиш','Ахлот','🗑️','Don\'t throw rubbish here.','Ин ҷо ахлот напарто.','noun'),
      W('Recycle','/ˌriːˈsaɪkl/','рисайкл','Коркарди дубора','♻️','We recycle paper and plastic.','Мо коғаз ва пластикро дубора коркард мекунем.','verb'),
      W('Plastic','/ˈplæstɪk/','пластик','Пластик','🧴','Plastic is bad for nature.','Пластик барои табиат бад аст.','noun'),
      W('Climate','/ˈklaɪmət/','клаймет','Иқлим','🌡️','The climate is changing.','Иқлим тағйир ёфта истодааст.','noun'),
      W('Environment','/ɪnˈvaɪrənmənt/','инвайронмент','Муҳити зист','🌍','We must protect the environment.','Мо бояд муҳити зистро ҳифз кунем.','noun'),
      W('Protect','/prəˈtekt/','протект','Ҳифз кардан','🛡️','We should protect the forests.','Мо бояд ҷангалҳоро ҳифз кунем.','verb'),
      W('Waste','/weɪst/','вейст','Исроф / партов','🚮','Don\'t waste water.','Обро исроф накун.','verb'),
      W('Fuel','/ˈfjuːəl/','фюел','Сӯзишворӣ','⛽','Cars need less fuel now.','Мошинҳо ҳоло сӯзишвории камтар лозим доранд.','noun'),
      W('Planet','/ˈplænɪt/','планет','Сайёра','🌎','We have only one planet.','Мо танҳо як сайёра дорем.','noun'),
    ]},
    { title: 'Lesson 5: Describing Nature', tt: 'Дарси 5: Тавсифи табиат', emoji: '🌿', words: [
      W('Natural','/ˈnætʃrəl/','натурал','Табиӣ','🌿','I like natural food.','Ман хӯроки табииро дӯст медорам.','adjective'),
      W('Gentle','/ˈdʒentl/','ҷентл','Мулоим / нарм','🕊️','A gentle wind was blowing.','Боди мулоим мевазид.','adjective'),
      W('Rough','/rʌf/','раф','Ноҳамвор / дурушт','🪨','The sea was rough today.','Баҳр имрӯз ноором буд.','adjective'),
      W('Steep','/stiːp/','стип','Нишеб / тик','⛰️','The path is very steep.','Пайроҳа хеле нишеб аст.','adjective'),
      W('Deep','/diːp/','дип','Чуқур','🌊','The lake is very deep.','Кӯл хеле чуқур аст.','adjective'),
      W('Shallow','/ˈʃæləʊ/','шэлоу','Наонқадар чуқур / рӯяки','💧','The river is shallow here.','Дарё дар ин ҷо начандон чуқур аст.','adjective'),
      W('Muddy','/ˈmʌdi/','мади','Лойолуд','🟤','The road was muddy after rain.','Роҳ баъди борон лойолуд буд.','adjective'),
      W('Icy','/ˈaɪsi/','айси','Яхбаста','🧊','The roads are icy in winter.','Роҳҳо дар зимистон яхбастаанд.','adjective'),
      W('Damp','/dæmp/','дэмп','Нам / намнок','💦','The grass is damp in the morning.','Алаф субҳ намнок аст.','adjective'),
      W('Endless','/ˈendləs/','эндлес','Бепоён','🌌','The desert looked endless.','Биёбон бепоён менамуд.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — used to', lessonTitleTg: 'Дарси 6: Грамматика — used to (одати гузашта)',
      title: 'used to (past habits)', titleTranslated: 'used to — одат/ҳолати гузашта', emoji: '⏮️',
      explanation:
`**used to + феъли асосӣ** барои амал ё ҳолате, ки дар **гузашта** одат буд, вале **ҳоло не**:
- *I **used to** play outside every day.* (Пеш ҳамарӯза берун бозӣ мекардам — ҳоло не)
- *She **used to** live in a village.* (Пеш дар деҳа зиндагӣ мекард)

Манфӣ: **didn't use to** (бе -d): *I **didn't use to** like tea.*
Савол: **Did you use to...?** *Did you use to walk to school?*
Диққат: дар манфӣ ва савол — **use to** (бе -d), зеро did аллакай гузаштаро нишон медиҳад.`,
      rules: [
        { pattern: 'used to + феъли асосӣ', note: 'I used to smoke.' },
        { pattern: "манфӣ: didn't use to", note: "He didn't use to exercise." },
        { pattern: 'савол: Did + subject + use to?', note: 'Did you use to live here?' },
        { pattern: 'маъно', note: 'гузаштаи одатӣ, ки ҳоло нест' },
      ],
      examples: [
        { sentence: 'I used to play football every day.', translation: 'Ман пеш ҳар рӯз футбол бозӣ мекардам.', highlight: 'used to play' },
        { sentence: 'She used to live near the sea.', translation: 'Ӯ пеш дар назди баҳр зиндагӣ мекард.', highlight: 'used to live' },
        { sentence: "We didn't use to have a car.", translation: 'Мо пеш мошин надоштем.', highlight: "didn't use to" },
        { sentence: 'Did you use to walk to school?', translation: 'Ту пеш пиёда ба мактаб мерафтӣ?', highlight: 'Did you use to' },
        { sentence: 'This town used to be very small.', translation: 'Ин шаҳр пеш хеле хурд буд.', highlight: 'used to be' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ play in this park as a child.', promptTranslated:'Ман дар кӯдакӣ дар ин боғ бозӣ мекардам.', options:['used to','use to','used','am used to'], answer:'used to', explanation:'used to + феъл.' },
        { type:'choose', prompt:'She used to ___ in a village.', promptTranslated:'Ӯ пеш дар деҳа зиндагӣ мекард.', options:['live','lived','lives','living'], answer:'live', explanation:'used to + феъли асосӣ.' },
        { type:'choose', prompt:'We ___ use to have internet.', promptTranslated:'Мо пеш интернет надоштем.', options:["didn't",'did','not','use'], answer:"didn't", explanation:"манфӣ → didn't use to." },
        { type:'choose', prompt:'___ you use to walk to school?', promptTranslated:'Ту пеш пиёда ба мактаб мерафтӣ?', options:['Did','Do','Are','Were'], answer:'Did', explanation:'савол → Did ... use to.' },
        { type:'fill_blank', prompt:'This place ___ ___ be a forest. (гузашта)', promptTranslated:'Ин ҷо пеш ҷангал буд.', answer:'used to', explanation:'used to be.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман пеш чойро дӯст намедоштам.', options:['I','use','to','like','tea',"didn't"], answer:"I didn't use to like tea.", explanation:"I didn't use to like tea." },
        { type:'transform', prompt:'Ислоҳ кунед: I use to play here.', promptTranslated:'мусбат → used to.', answer:'I used to play here.', explanation:'used to (бо -d).' },
        { type:'transform', prompt:'Савол созед: You used to smoke.', promptTranslated:'ба савол.', answer:'Did you use to smoke?', explanation:'Did you use to ...?' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Adverbs of Manner', lessonTitleTg: 'Дарси 7: Грамматика — Зарфҳои тарз',
      title: 'Adverbs of Manner (-ly)', titleTranslated: 'Зарфҳои тарз (чӣ гуна)', emoji: '🏃',
      explanation:
`**Зарфи тарз** нишон медиҳад, ки амал **чӣ гуна** иҷро мешавад. Аксаран аз сифат + **-ly** сохта мешавад:
- quick → **quickly**, slow → **slowly**, careful → **carefully**, quiet → **quietly**
- сифати ба y тамомшаванда → **ily**: happy → **happily**, easy → **easily**

Истиснои муҳим: good → **well**, fast → **fast**, hard → **hard** (бе -ly)
Зарф баъди феъл меояд: *She sings **beautifully**. He drives **carefully**.*`,
      rules: [
        { pattern: 'сифат + ly', note: 'quick→quickly, slow→slowly' },
        { pattern: 'y → ily', note: 'happy→happily, easy→easily' },
        { pattern: 'good→well, fast→fast, hard→hard', note: 'истиснои муҳим' },
        { pattern: 'ҷойгоҳ', note: 'зарф аксаран баъди феъл' },
      ],
      examples: [
        { sentence: 'She speaks English fluently.', translation: 'Ӯ англисиро равон гап мезанад.', highlight: 'fluently' },
        { sentence: 'He drives very carefully.', translation: 'Ӯ хеле бодиққат ронандагӣ мекунад.', highlight: 'carefully' },
        { sentence: 'The children played happily.', translation: 'Кӯдакон шодмонона бозӣ карданд.', highlight: 'happily' },
        { sentence: 'She sings well.', translation: 'Ӯ хуб месарояд.', highlight: 'well' },
        { sentence: 'Please walk quietly.', translation: 'Лутфан оҳиста роҳ рав.', highlight: 'quietly' },
      ],
      exercises: [
        { type:'choose', prompt:'She sings very ___ (beautiful).', promptTranslated:'Ӯ хеле зебо месарояд.', options:['beautifully','beautiful','beauty','beautifuly'], answer:'beautifully', explanation:'beautiful → beautifully.' },
        { type:'choose', prompt:'He speaks English ___ (good).', promptTranslated:'Ӯ англисиро хуб гап мезанад.', options:['well','goodly','good','gooder'], answer:'well', explanation:'good → well (истисно).' },
        { type:'choose', prompt:'Please drive ___ (careful).', promptTranslated:'Лутфан бодиққат ронандагӣ кун.', options:['carefully','careful','carefuly','care'], answer:'carefully', explanation:'careful → carefully.' },
        { type:'choose', prompt:'The bird flew ___ (quick).', promptTranslated:'Парранда тез парвоз кард.', options:['quickly','quick','quickcly','quicker'], answer:'quickly', explanation:'quick → quickly.' },
        { type:'fill_blank', prompt:'She finished the test ___ (easy).', promptTranslated:'Ӯ имтиҳонро ба осонӣ тамом кард.', answer:'easily', explanation:'easy → easily (y→ily).' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Кӯдак ором хобид.', options:['The','slept','baby','quietly'], answer:'The baby slept quietly.', explanation:'The baby slept quietly.' },
        { type:'transform', prompt:'Сифатро ба зарф гардонед: careful → ...', promptTranslated:'зарфи тарз.', answer:'carefully', explanation:'careful + ly.' },
        { type:'transform', prompt:'Ислоҳ кунед: He runs quick.', promptTranslated:'зарф лозим.', answer:'He runs quickly.', explanation:'quick → quickly.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — A Day In The Mountains', lessonTitleTg: 'Дарси 8: Шунавоӣ — Як рӯз дар кӯҳҳо',
    title: 'A Day In The Mountains', titleTranslated: 'Як рӯз дар кӯҳҳо', emoji: '⛰️',
    passage: 'Last summer we went for a long walk in the mountains. In the morning the weather was beautiful. A gentle breeze was blowing and the sky was clear. We walked slowly up the steep path, past a green forest and a small stream. Suddenly, the sky became cloudy and we heard thunder. It started to rain heavily, so we ran quickly to a cave. We waited quietly until the storm passed. Then a beautiful rainbow appeared over the valley. It was a wonderful day, and nature showed us all its power and beauty.',
    passageTranslated: 'Тобистони гузашта мо ба сайри дарози кӯҳҳо рафтем. Субҳ обу ҳаво зебо буд. Насими мулоим мевазид ва осмон соф буд. Мо оҳиста аз пайроҳаи нишеб, аз паҳлӯи ҷангали сабз ва ҷӯйи хурд боло рафтем. Ногаҳон осмон абрнок шуд ва мо раъдро шунидем. Борони сахт борид, бинобар ин мо зуд ба ғор давидем. Мо ором интизор шудем, то тӯфон гузашт. Баъд тирукамони зебо болои водӣ пайдо шуд. Рӯзи аҷоиб буд ва табиат ба мо тамоми қувва ва зебоии худро нишон дод.',
    questions: [
      { question:'How was the weather in the morning?', questionTranslated:'Субҳ обу ҳаво чӣ гуна буд?', options:['Beautiful and clear','Foggy','Stormy'], correctIndex:0, explanation:'the weather was beautiful ... the sky was clear.' },
      { question:'How did they walk up the path?', questionTranslated:'Онҳо аз пайроҳа чӣ тавр боло рафтанд?', options:['Slowly','Quickly','Never'], correctIndex:0, explanation:'walked slowly up the steep path.' },
      { question:'What did they hear suddenly?', questionTranslated:'Онҳо ногаҳон чиро шуниданд?', options:['Music','A bird','Thunder'], correctIndex:2, explanation:'we heard thunder.' },
      { question:'Where did they run?', questionTranslated:'Онҳо ба куҷо давиданд?', options:['To a cave','To the lake','To a house'], correctIndex:0, explanation:'ran quickly to a cave.' },
      { question:'What appeared after the storm?', questionTranslated:'Баъди тӯфон чӣ пайдо шуд?', options:['The moon','Snow','A rainbow'], correctIndex:2, explanation:'a beautiful rainbow appeared.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — How Life Has Changed', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Чӣ тавр ҳаёт тағйир ёфт',
    title: 'How Life Has Changed', titleTranslated: 'Чӣ тавр ҳаёт тағйир ёфт', emoji: '💬',
    scenario: 'Набера аз бибияш дар бораи табиат ва ҳаёти пеш мепурсад.',
    lines: [
      { speaker:'Grandma', text:'When I was young, this place used to be a green field.', translation:'Вақте ман ҷавон будам, ин ҷо далаи сабз буд.', isUser:false },
      { speaker:'You', text:'Really? What did you use to do here?', translation:'Ҷиддӣ? Шумо ин ҷо чӣ кор мекардед?', isUser:true },
      { speaker:'Grandma', text:'We used to play near the stream every day.', translation:'Мо ҳар рӯз дар назди ҷӯй бозӣ мекардем.', isUser:false },
      { speaker:'You', text:'Was the air cleaner than now?', translation:'Ҳаво аз ҳозира тозатар буд?', isUser:true },
      { speaker:'Grandma', text:'Yes, there was no pollution. The water was clean.', translation:'Бале, ифлосӣ набуд. Об тоза буд.', isUser:false },
      { speaker:'You', text:'That is sad. We should protect nature better.', translation:'Ин ғамангез аст. Мо бояд табиатро беҳтар ҳифз кунем.', isUser:true },
      { speaker:'Grandma', text:'You are right. We must recycle and not waste.', translation:'Ҳақ ба ҷониби туст. Мо бояд коркарди дубора кунем ва исроф накунем.', isUser:false },
      { speaker:'You', text:'I promise to take care of our planet.', translation:'Ман ваъда медиҳам, ки аз сайёраамон ғамхорӣ кунам.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — The Four Seasons', lessonTitleTg: 'Дарси 10: Хониш — Чор фасл',
    title: 'The Four Seasons', titleTranslated: 'Чор фасл', emoji: '🍂',
    passage: 'Nature changes beautifully through the four seasons. In spring, the weather is gentle and warm. New leaves grow on the branches, and butterflies fly happily over the flowers. In summer, the days are long and sometimes very hot. People swim in cool lakes and rivers. In autumn, the leaves turn yellow and fall slowly to the ground. The air becomes fresh and a little foggy. In winter, everything is cold and quiet. Snow covers the fields and the roads are often icy. Each season has its own beauty, and together they show us the amazing power of nature.',
    passageTranslated: 'Табиат тавассути чор фасл зебо тағйир меёбад. Дар баҳор обу ҳаво мулоим ва гарм аст. Баргҳои нав дар шохаҳо мерӯянд ва шапалакҳо шодмонона болои гулҳо парвоз мекунанд. Дар тобистон рӯзҳо дароз ва баъзан хеле гарманд. Одамон дар кӯлу дарёҳои салқин шино мекунанд. Дар тирамоҳ баргҳо зард мешаванд ва оҳиста ба замин меафтанд. Ҳаво тару тоза ва каме тумоннок мешавад. Дар зимистон ҳама чиз сард ва ором аст. Барф далаҳоро мепӯшонад ва роҳҳо аксаран яхбастаанд. Ҳар фасл зебоии худро дорад ва якҷоя онҳо ба мо қуввати аҷоиби табиатро нишон медиҳанд.',
    questions: [
      { question:'What happens in spring?', questionTranslated:'Дар баҳор чӣ мешавад?', options:['Snow falls','Leaves turn yellow','New leaves grow'], correctIndex:2, explanation:'New leaves grow on the branches.' },
      { question:'What do people do in summer?', questionTranslated:'Одамон дар тобистон чӣ мекунанд?', options:['Ski','Stay inside','Swim in lakes and rivers'], correctIndex:2, explanation:'swim in cool lakes and rivers.' },
      { question:'What happens to leaves in autumn?', questionTranslated:'Дар тирамоҳ бо баргҳо чӣ мешавад?', options:['They stay green','They turn yellow and fall','They grow'], correctIndex:1, explanation:'the leaves turn yellow and fall slowly.' },
      { question:'How are the roads in winter?', questionTranslated:'Роҳҳо дар зимистон чӣ гунаанд?', options:['Dusty','Muddy','Often icy'], correctIndex:2, explanation:'the roads are often icy.' },
      { question:'What does each season have?', questionTranslated:'Ҳар фасл чӣ дорад?', options:['Its own beauty','No change','The same weather'], correctIndex:0, explanation:'Each season has its own beauty.' },
    ],
  },
  review: {
    passage: 'My village is a beautiful place surrounded by nature. When I was a child, life used to be very different. We didn\'t use to have cars or computers. In summer we used to swim in the clean river and climb the green hills. The air was fresh and there was no pollution. My grandfather used to tell us stories under the stars. Sadly, things have changed. Now there is more rubbish and the river is not as clean as before. But people are learning to protect the environment. We recycle more carefully and plant new trees every spring. I believe that if we act wisely, nature will stay beautiful for our children too.',
    passageTranslated: 'Деҳаи ман ҷои зебост, ки бо табиат иҳота шудааст. Вақте ман кӯдак будам, ҳаёт хеле дигар буд. Мо мошин ё компютер надоштем. Дар тобистон мо дар дарёи тоза шино мекардем ва ба теппаҳои сабз мебаромадем. Ҳаво тоза буд ва ифлосӣ набуд. Бобоям дар зери ситораҳо ба мо ҳикоя нақл мекард. Мутаассифона, чизҳо тағйир ёфтанд. Акнун ахлот бештар аст ва дарё мисли пеш тоза нест. Вале одамон меомӯзанд, ки муҳити зистро ҳифз кунанд. Мо бодиққаттар коркарди дубора мекунем ва ҳар баҳор дарахтони нав мешинонем. Ман боварӣ дорам, ки агар оқилона амал кунем, табиат барои фарзандони мо низ зебо мемонад.',
    questions: [
      { question:'What didn\'t they use to have?', questionTranslated:'Онҳо чӣ надоштанд?', options:['Water','Food','Cars or computers'], correctIndex:2, explanation:"didn't use to have cars or computers." },
      { question:'What did they use to do in summer?', questionTranslated:'Онҳо дар тобистон чӣ мекарданд?', options:['Work','Swim and climb hills','Watch TV'], correctIndex:1, explanation:'swim in the river and climb the green hills.' },
      { question:'How has the river changed?', questionTranslated:'Дарё чӣ тавр тағйир ёфт?', options:['It is not as clean as before','It disappeared','It is bigger'], correctIndex:0, explanation:'the river is not as clean as before.' },
      { question:'What do people do every spring?', questionTranslated:'Одамон ҳар баҳор чӣ мекунанд?', options:['Plant new trees','Cut trees','Nothing'], correctIndex:0, explanation:'plant new trees every spring.' },
      { question:'What does the writer believe?', questionTranslated:'Нависанда ба чӣ боварӣ дорад?', options:['Nothing can help','Nature will stay beautiful if we act wisely','It is too late'], correctIndex:1, explanation:'if we act wisely, nature will stay beautiful.' },
    ],
  },
  exam: {
    passage: 'The Earth is our only home, but people do not always treat it kindly. In the past, nature used to be cleaner and wilder. There used to be more forests, more animals, and less pollution. Today, factories and cars fill the air with smoke, and rubbish covers many beautiful places. The climate is changing quickly, and this is dangerous for plants, animals, and people. However, there is still hope. If everyone acts carefully, we can protect our planet. We should recycle our waste, use less plastic, and save energy. We must teach our children to love nature. The future of the Earth depends on the choices we make today.',
    passageTranslated: 'Замин хонаи ягонаи мост, вале одамон ҳамеша бо он меҳрубонона рафтор намекунанд. Дар гузашта табиат тозатар ва ваҳшитар буд. Ҷангалҳо бештар, ҳайвонот бештар ва ифлосӣ камтар буд. Имрӯз корхонаҳо ва мошинҳо ҳаворо бо дуд пур мекунанд ва ахлот бисёр ҷойҳои зеборо мепӯшонад. Иқлим зуд тағйир ёфта истодааст ва ин барои наботот, ҳайвонот ва одамон хатарнок аст. Аммо ҳанӯз умед ҳаст. Агар ҳама бодиққат амал кунанд, мо метавонем сайёраамонро ҳифз кунем. Мо бояд партовҳоямонро коркарди дубора кунем, пластики камтар истифода барем ва энергия сарфа кунем. Мо бояд ба фарзандонамон дӯст доштани табиатро омӯзем. Ояндаи Замин аз интихобҳое, ки мо имрӯз мекунем, вобаста аст.',
    questions: [
      { question:'How did nature use to be?', questionTranslated:'Табиат пеш чӣ гуна буд?', options:['The same','Dirtier','Cleaner and wilder'], correctIndex:2, explanation:'nature used to be cleaner and wilder.' },
      { question:'What fills the air today?', questionTranslated:'Имрӯз ҳаворо чӣ пур мекунад?', options:['Rain','Smoke from factories and cars','Fresh air'], correctIndex:1, explanation:'factories and cars fill the air with smoke.' },
      { question:'Why is the changing climate dangerous?', questionTranslated:'Чаро тағйири иқлим хатарнок аст?', options:['For plants,animals and people','For cars','For phones'], correctIndex:0, explanation:'dangerous for plants, animals, and people.' },
      { question:'What should we do?', questionTranslated:'Мо чӣ бояд кунем?', options:['Buy more','Recycle,'Nothing',use less plastic,save energy'], correctIndex:1, explanation:'recycle our waste, use less plastic, and save energy.' },
      { question:'What does the future depend on?', questionTranslated:'Оянда аз чӣ вобаста аст?', options:['The weather','The choices we make today','Luck'], correctIndex:1, explanation:'depends on the choices we make today.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 11 тайёр.');
