import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 4, title: 'Module 5: Travel And Holidays', titleTranslated: 'Модули 5: Сафар ва Таътил',
  emoji: '✈️', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Trips And Journeys', tt: 'Дарси 1: Сафарҳо', emoji: '🧳', words: [
      W('Journey','/ˈdʒɜːni/','ҷёрни','Сафар (роҳ)','🛣️','The journey took five hours.','Сафар панҷ соат тӯл кашид.','noun'),
      W('Tour','/tʊə/','тур','Тур / экскурсия','🚍','We joined a city tour.','Мо ба туре шаҳр ҳамроҳ шудем.','noun'),
      W('Flight','/flaɪt/','флайт','Парвоз','🛫','My flight is at noon.','Парвози ман нисфирӯзӣ аст.','noun'),
      W('Passport','/ˈpɑːspɔːt/','паспорт','Шиноснома (хориҷӣ)','🛂','Show me your passport.','Шиносномаатро нишон деҳ.','noun'),
      W('Luggage','/ˈlʌɡɪdʒ/','лагиҷ','Бору бағоҷ','🧳','My luggage is heavy.','Бори ман вазнин аст.','noun'),
      W('Suitcase','/ˈsuːtkeɪs/','суткейс','Ҷомадон','💼','Pack your suitcase tonight.','Ҷомадонатро имшаб ҷамъ кун.','noun'),
      W('Handbag','/ˈhændbæɡ/','ҳэндбэг','Сумка (дастӣ)','👜','She lost her handbag.','Ӯ сумкаашро гум кард.','noun'),
      W('Tourist','/ˈtʊərɪst/','турист','Сайёҳ','📸','Many tourists visit the city.','Сайёҳони зиёд ба шаҳр меоянд.','noun'),
      W('Abroad','/əˈbrɔːd/','аброд','Хориҷ (ба хориҷа)','🌍','They travel abroad every year.','Онҳо ҳар сол ба хориҷ сафар мекунанд.','adverb'),
      W('Visa','/ˈviːzə/','виза','Раводид','📄','I need a visa for that country.','Барои он кишвар ба ман раводид лозим аст.','noun'),
    ]},
    { title: 'Lesson 2: At the Airport', tt: 'Дарси 2: Дар фурудгоҳ', emoji: '🛫', words: [
      W('Departure','/dɪˈpɑːtʃə/','дипарчер','Парвоз/ҳаракат (рафтан)','🛫','The departure is delayed.','Парвоз таъхир шуд.','noun'),
      W('Arrival','/əˈraɪvəl/','арайвл','Расидан (омадан)','🛬','What time is the arrival?','Расидан соати чанд аст?','noun'),
      W('Gate','/ɡeɪt/','гейт','Дарвоза (баромадгоҳ)','🚪','Go to gate number ten.','Ба дарвозаи рақами даҳ равед.','noun'),
      W('Delay','/dɪˈleɪ/','дилей','Таъхир','⏳','There is a long delay.','Таъхири дароз ҳаст.','noun'),
      W('Terminal','/ˈtɜːmɪnl/','тёрминал','Терминал (фурудгоҳ)','🏢','Go to terminal two.','Ба терминали ду равед.','noun'),
      W('Passenger','/ˈpæsɪndʒə/','пэсинҷер','Мусофир','🧑','Every passenger has a seat.','Ҳар мусофир ҷой дорад.','noun'),
      W('Luggage claim','/ˈlʌɡɪdʒ kleɪm/','лагиҷ клейм','Гирифтани бор','🧳','Meet me at luggage claim.','Дар ҷои гирифтани бор мунтазир бош.','noun'),
      W('Customs','/ˈkʌstəmz/','кастемз','Гумрук','🛃','We passed through customs.','Мо аз гумрук гузаштем.','noun'),
      W('Boarding pass','/ˈbɔːdɪŋ pɑːs/','бординг пас','Чиптаи савоӣ','🎟️','Keep your boarding pass safe.','Чиптаи савоиатро эҳтиёт кун.','noun'),
      W('Crew','/kruː/','кру','Экипаж / ходимон','👩‍✈️','The crew is very friendly.','Экипаж хеле дӯстона аст.','noun'),
    ]},
    { title: 'Lesson 3: Accommodation', tt: 'Дарси 3: Ҷои истиқомат', emoji: '🏨', words: [
      W('Booking','/ˈbʊkɪŋ/','букинг','Фармоиш / банд кардан','📖','I made a booking online.','Ман онлайн фармоиш додам.','noun'),
      W('Reception','/rɪˈsepʃən/','рисепшн','Қабулгоҳ','🛎️','Ask at the reception.','Дар қабулгоҳ пурс.','noun'),
      W('Reserve','/rɪˈzɜːv/','ризёрв','Банд кардан','✅','I want to reserve a room.','Ман мехоҳам ҳуҷра банд кунам.','verb'),
      W('Stay','/steɪ/','стей','Мондан / истиқомат','🛏️','We stay for three nights.','Мо се шаб мемонем.','verb'),
      W('View','/vjuː/','вю','Манзара','🏞️','The room has a sea view.','Ҳуҷра манзараи баҳр дорад.','noun'),
      W('Nearby','/ˌnɪəˈbaɪ/','нирбай','Наздик / дар наздикӣ','📍','There is a shop nearby.','Дар наздикӣ мағоза ҳаст.','adjective'),
      W('Floor','/flɔː/','флор','Ошёна','🏢','Our room is on the third floor.','Ҳуҷраи мо дар ошёнаи сеюм аст.','noun'),
      W('Lift','/lɪft/','лифт','Лифт','🛗','Take the lift to the top.','Бо лифт ба боло баро.','noun'),
      W('Pillow','/ˈpɪləʊ/','пилоу','Болишт','🛌','The pillow is soft.','Болишт нарм аст.','noun'),
      W('Cosy','/ˈkəʊzi/','козӣ','Гарму нарм / бароҳат','🛋️','The room is small but cosy.','Ҳуҷра хурд, вале гарму нарм аст.','adjective'),
    ]},
    { title: 'Lesson 4: Holiday Activities', tt: 'Дарси 4: Машғулиятҳои таътил', emoji: '🏖️', words: [
      W('Sightseeing','/ˈsaɪtsiːɪŋ/','сайтсиинг','Тамошои ҷойҳо','🗺️','We went sightseeing all day.','Мо тамоми рӯз тамошои ҷойҳо кардем.','noun'),
      W('Sunbathe','/ˈsʌnbeɪð/','санбейз','Офтобхӯрӣ кардан','🌞','She likes to sunbathe.','Ӯ офтобхӯриро дӯст медорад.','verb'),
      W('Souvenir','/ˌsuːvəˈnɪə/','сувенир','Тӯҳфаи ёдгорӣ','🎁','I bought a souvenir.','Ман тӯҳфаи ёдгорӣ харидам.','noun'),
      W('Explore','/ɪkˈsplɔː/','иксплор','Кашф кардан / гаштан','🧭','We explored the old town.','Мо шаҳри кӯҳнаро гаштем.','verb'),
      W('Hike','/haɪk/','ҳайк','Пиёдагардӣ (кӯҳ)','🥾','We went for a long hike.','Мо ба пиёдагардии дароз рафтем.','noun'),
      W('Camp','/kæmp/','кэмп','Хайма задан / лагер','⛺','We camp near the river.','Мо дар назди дарё хайма мезанем.','verb'),
      W('Guide','/ɡaɪd/','гайд','Роҳбалад','🧑‍🏫','The guide showed us the museum.','Роҳбалад ба мо осорхонаро нишон дод.','noun'),
      W('Postcard','/ˈpəʊstkɑːd/','поусткард','Открытка','💌','I sent a postcard home.','Ман ба хона открытка фиристодам.','noun'),
      W('Dive','/daɪv/','дайв','Ғӯтта задан','🤿','They dive in the clear sea.','Онҳо дар баҳри соф ғӯтта мезананд.','verb'),
      W('Relaxing','/rɪˈlæksɪŋ/','рилаксинг','Оромбахш','🧘','The beach is very relaxing.','Соҳил хеле оромбахш аст.','adjective'),
    ]},
    { title: 'Lesson 5: Describing Places', tt: 'Дарси 5: Тасвири ҷойҳо', emoji: '🌆', words: [
      W('Foreign','/ˈfɒrən/','форен','Хориҷӣ','🌐','I love foreign cultures.','Ман фарҳангҳои хориҷиро дӯст медорам.','adjective'),
      W('Crowded','/ˈkraʊdɪd/','краудид','Серодам','👥','The market was crowded.','Бозор серодам буд.','adjective'),
      W('Peaceful','/ˈpiːsfʊl/','писфул','Ором / осоишта','🕊️','The village is peaceful.','Деҳа осоишта аст.','adjective'),
      W('Amazing','/əˈmeɪzɪŋ/','амейзинг','Ҳайратангез','🤩','The view was amazing.','Манзара ҳайратангез буд.','adjective'),
      W('Historic','/hɪˈstɒrɪk/','ҳисторик','Таърихӣ','🏛️','We visited a historic castle.','Мо қалъаи таърихиро дидем.','adjective'),
      W('Local','/ˈləʊkl/','локл','Маҳаллӣ','🏘️','We ate local food.','Мо хӯроки маҳаллӣ хӯрдем.','adjective'),
      W('Faraway','/ˌfɑːrəˈweɪ/','фаравей','Дурдаст','🏝️','They live in a faraway place.','Онҳо дар ҷои дурдаст зиндагӣ мекунанд.','adjective'),
      W('Sunny','/ˈsʌni/','сани','Офтобӣ','☀️','It was a sunny day.','Рӯзи офтобӣ буд.','adjective'),
      W('Noisy','/ˈnɔɪzi/','нойзи','Пурғавғо','📢','The street is very noisy.','Кӯча хеле пурғавғо аст.','adjective'),
      W('Wonderful','/ˈwʌndəfʊl/','вандефул','Аҷоиб / олӣ','🌟','We had a wonderful holiday.','Мо таътили олӣ доштем.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Be Going To (Plans)', lessonTitleTg: 'Дарси 6: Грамматика — Be Going To (нақшаҳо)',
      title: 'Future: be going to', titleTranslated: 'Оянда: be going to (нақша)', emoji: '📅',
      explanation:
`Барои **нақшаҳо ва ниятҳои оянда** сохти **be going to** истифода мешавад:
**am/is/are + going to + феъли асосӣ**
- *I **am going to** travel next summer.* (Ман тобистони оянда сафар мекунам — нақша дорам)
- *She **is going to** visit her aunt.*
- *They **are going to** buy tickets.*

Манфӣ: *I **am not going to** stay.* | Савол: *Are you going to come?*
Инчунин барои **пешбинӣ бо далел**: *Look at the clouds! It **is going to** rain.*`,
      rules: [
        { pattern: 'am/is/are + going to + феъл', note: 'I am going to sleep. He is going to work.' },
        { pattern: 'манфӣ: be + not + going to', note: 'She is not going to come.' },
        { pattern: 'савол: Be + subject + going to?', note: 'Are you going to travel?' },
        { pattern: 'истифода', note: 'нақша, ният, пешбинии асоснок' },
      ],
      examples: [
        { sentence: 'I am going to visit Dushanbe next month.', translation: 'Ман моҳи оянда ба Душанбе меравам.', highlight: 'am going to' },
        { sentence: 'They are going to stay in a hotel.', translation: 'Онҳо дар меҳмонхона мемонанд.', highlight: 'are going to' },
        { sentence: 'She is not going to fly today.', translation: 'Ӯ имрӯз парвоз намекунад.', highlight: 'is not going to' },
        { sentence: 'Are you going to book a ticket?', translation: 'Ту чипта банд мекунӣ?', highlight: 'Are you going to' },
        { sentence: 'Look! It is going to rain.', translation: 'Нигоҳ кун! Борон меборад.', highlight: 'is going to' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ going to travel next week.', promptTranslated:'Ман ҳафтаи оянда сафар мекунам.', options:['am','is','are','be'], answer:'am', explanation:'I → am going to.' },
        { type:'choose', prompt:'She is going to ___ a hotel.', promptTranslated:'Ӯ меҳмонхона банд мекунад.', options:['book','books','booking','booked'], answer:'book', explanation:'going to + феъли асосӣ (book).' },
        { type:'choose', prompt:'They ___ going to fly tomorrow.', promptTranslated:'Онҳо фардо парвоз мекунанд.', options:['are','is','am','be'], answer:'are', explanation:'They → are going to.' },
        { type:'fill_blank', prompt:'We ___ going to visit the museum. (be)', promptTranslated:'Мо ба осорхона меравем.', answer:'are', explanation:'We → are.' },
        { type:'fill_blank', prompt:'He is going to ___ (buy) a souvenir.', promptTranslated:'Ӯ тӯҳфаи ёдгорӣ мехарад.', answer:'buy', explanation:'going to + buy.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман нақша дорам, ки хориҷ сафар кунам.', options:['I','going','am','to','abroad','travel'], answer:'I am going to travel abroad.', explanation:'I am going to travel abroad.' },
        { type:'transform', prompt:'Манфӣ созед: She is going to come.', promptTranslated:'ба манфӣ.', answer:'She is not going to come.', explanation:'be + not + going to.' },
        { type:'transform', prompt:'Савол созед: They are going to stay.', promptTranslated:'ба савол.', answer:'Are they going to stay?', explanation:'Be-ро ба аввал бор.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Will (Predictions & Decisions)', lessonTitleTg: 'Дарси 7: Грамматика — Will (пешбинӣ ва қарор)',
      title: 'Future: will', titleTranslated: 'Оянда: will (пешбинӣ/қарор)', emoji: '🔮',
      explanation:
`**will + феъли асосӣ** барои:
- **Пешбинӣ:** *I think it **will** be sunny tomorrow.*
- **Қарори фаврӣ:** *I'm tired. I **will** go to bed.*
- **Ваъда:** *I **will** call you later.*

Шакл барои ҳама шахсон яксон: I/you/he/she/we/they **will** go.
Манфӣ: **won't** (will not) — *It **won't** rain.*
Савол: *Will you help me?*`,
      rules: [
        { pattern: 'will + феъли асосӣ', note: 'барои ҳама шахсон яксон' },
        { pattern: "манфӣ: won't", note: "will not = won't" },
        { pattern: 'савол: Will + subject + феъл?', note: 'Will you come?' },
        { pattern: 'истифода', note: 'пешбинӣ, қарори фаврӣ, ваъда' },
      ],
      examples: [
        { sentence: 'I think it will rain tomorrow.', translation: 'Ба фикрам, фардо борон меборад.', highlight: 'will rain' },
        { sentence: 'She will be a great teacher.', translation: 'Ӯ муаллими бузург мешавад.', highlight: 'will be' },
        { sentence: "Don't worry, I will help you.", translation: 'Хавотир нашав, ман ба ту кӯмак мекунам.', highlight: 'will help' },
        { sentence: "They won't come to the party.", translation: 'Онҳо ба ҷашн намеоянд.', highlight: "won't come" },
        { sentence: 'Will you call me tonight?', translation: 'Имшаб ба ман занг мезанӣ?', highlight: 'Will you' },
      ],
      exercises: [
        { type:'choose', prompt:'I think she ___ pass the exam.', promptTranslated:'Ба фикрам, ӯ имтиҳонро месупорад.', options:['will','wills','is will','going'], answer:'will', explanation:'will + феъли асосӣ.' },
        { type:'choose', prompt:'It ___ rain, the sky is clear.', promptTranslated:'Борон намеборад, осмон соф аст.', options:["won't",'will','not will','will not to'], answer:"won't", explanation:"манфӣ → won't." },
        { type:'choose', prompt:'The phone is ringing. I ___ answer it.', promptTranslated:'Телефон занг мезанад. Ман ҷавоб медиҳам.', options:['will','am going','would','will to'], answer:'will', explanation:'қарори фаврӣ → will.' },
        { type:'fill_blank', prompt:'I promise I ___ (call) you.', promptTranslated:'Ваъда медиҳам, ки ба ту занг мезанам.', answer:'will call', explanation:'ваъда → will call.' },
        { type:'fill_blank', prompt:'They ___ (not / be) late.', promptTranslated:'Онҳо дер намемонанд.', answer:"won't be", explanation:"won't be." },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман ба ту баъдтар кӯмак мекунам.', options:['I','you','will','help','later'], answer:'I will help you later.', explanation:'I will help you later.' },
        { type:'transform', prompt:'Савол созед: You will come.', promptTranslated:'ба савол.', answer:'Will you come?', explanation:'Will-ро ба аввал.' },
        { type:'transform', prompt:'Манфӣ созед: It will snow.', promptTranslated:'ба манфӣ.', answer:"It won't snow.", explanation:"will not = won't." },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — Holiday Plans', lessonTitleTg: 'Дарси 8: Шунавоӣ — Нақшаҳои таътил',
    title: 'Holiday Plans', titleTranslated: 'Нақшаҳои таътил', emoji: '🗺️',
    passage: 'Next month my family is going to travel to Turkey. We are going to fly from Dushanbe. My father already booked the flight and the hotel. The hotel is near the beach and has a wonderful view. We are going to sunbathe, explore the old city, and buy souvenirs. My sister thinks the weather will be sunny and hot. I hope our flight will not be delayed. I am sure it will be an amazing holiday.',
    passageTranslated: 'Моҳи оянда оилаи ман ба Туркия сафар мекунад. Мо аз Душанбе парвоз мекунем. Падарам аллакай парвоз ва меҳмонхонаро банд кардааст. Меҳмонхона наздики соҳил аст ва манзараи аҷоиб дорад. Мо офтобхӯрӣ мекунем, шаҳри кӯҳнаро мегардем ва тӯҳфаҳои ёдгорӣ мехарем. Хоҳарам фикр мекунад, ки ҳаво офтобӣ ва гарм мешавад. Умедворам, ки парвози мо таъхир намешавад. Боварӣ дорам, ки ин таътили аҷоиб мешавад.',
    questions: [
      { question:'Where is the family going?', questionTranslated:'Оила ба куҷо меравад?', options:['Russia','Dubai','Turkey'], correctIndex:2, explanation:'going to travel to Turkey.' },
      { question:'Who booked the flight?', questionTranslated:'Парвозро кӣ банд кард?', options:['He','His father','His sister'], correctIndex:1, explanation:'My father already booked.' },
      { question:'What is near the hotel?', questionTranslated:'Наздики меҳмонхона чӣ ҳаст?', options:['A mountain','The beach','An airport'], correctIndex:1, explanation:'near the beach.' },
      { question:'What does the sister think about the weather?', questionTranslated:'Хоҳараш дар бораи ҳаво чӣ фикр мекунад?', options:['It will rain','It will be sunny and hot','It will be cold'], correctIndex:1, explanation:'the weather will be sunny and hot.' },
      { question:'What does the writer hope?', questionTranslated:'Нависанда чӣ умед дорад?', options:['The trip is short','The hotel is cheap','The flight will not be delayed'], correctIndex:2, explanation:'our flight will not be delayed.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Booking a Room', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Банд кардани ҳуҷра',
    title: 'Booking a Room', titleTranslated: 'Банд кардани ҳуҷра', emoji: '🛎️',
    scenario: 'Меҳмон дар қабулгоҳи меҳмонхона ҳуҷра банд мекунад.',
    lines: [
      { speaker:'Receptionist', text:'Good evening. How can I help you?', translation:'Шоми хуш. Чӣ гуна кӯмак кунам?', isUser:false },
      { speaker:'You', text:'Hello. I would like to reserve a room, please.', translation:'Салом. Ман мехоҳам як ҳуҷра банд кунам.', isUser:true },
      { speaker:'Receptionist', text:'For how many nights are you going to stay?', translation:'Барои чанд шаб мемонед?', isUser:false },
      { speaker:'You', text:'For three nights. Does the room have a view?', translation:'Барои се шаб. Ҳуҷра манзара дорад?', isUser:true },
      { speaker:'Receptionist', text:'Yes, it has a nice sea view on the fourth floor.', translation:'Бале, дар ошёнаи чорум манзараи зебои баҳр дорад.', isUser:false },
      { speaker:'You', text:'Great. Is breakfast included?', translation:'Аъло. Наҳорӣ дохил аст?', isUser:true },
      { speaker:'Receptionist', text:'Yes, and there is a lift near the reception.', translation:'Бале, ва наздики қабулгоҳ лифт ҳаст.', isUser:false },
      { speaker:'You', text:'Perfect. I will take the room. Thank you!', translation:'Олӣ. Ман ҳуҷраро мегирам. Ташаккур!', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — A Trip to the Mountains', lessonTitleTg: 'Дарси 10: Хониш — Сафар ба кӯҳҳо',
    title: 'A Trip to the Mountains', titleTranslated: 'Сафар ба кӯҳҳо', emoji: '🏔️',
    passage: 'Last year my friends and I made a plan. We were going to spend a weekend in the mountains of Tajikistan. We packed our backpacks with warm clothes and food. The journey was long but beautiful. When we arrived, we put up our camp near a peaceful lake. The place was faraway and quiet, with no noisy cars. In the evening we made a fire and looked at the stars. The next morning we explored the area and took many photos. It was a wonderful adventure, and we are going to go there again next summer.',
    passageTranslated: 'Соли гузашта ману дӯстонам нақша кашидем. Мо мехостем як рӯзи истироҳатро дар кӯҳҳои Тоҷикистон гузаронем. Мо рюкзакҳоямонро бо либоси гарм ва хӯрок ҷамъ кардем. Сафар дароз, вале зебо буд. Вақте расидем, дар назди кӯли осоишта хайма задем. Ҷой дурдаст ва ором буд, бе мошинҳои пурғавғо. Шом мо оташ афрӯхтем ва ба ситораҳо нигоҳ кардем. Субҳи дигар мо ноҳияро гаштем ва аксҳои зиёд гирифтем. Ин саргузашти аҷоиб буд ва мо тобистони оянда боз ба он ҷо меравем.',
    questions: [
      { question:'Where did they go?', questionTranslated:'Онҳо ба куҷо рафтанд?', options:['To the sea','To the mountains','To a city'], correctIndex:1, explanation:'a weekend in the mountains.' },
      { question:'What did they pack?', questionTranslated:'Онҳо чӣ ҷамъ карданд?', options:['Only phones','Books','Warm clothes and food'], correctIndex:2, explanation:'warm clothes and food.' },
      { question:'How was the place?', questionTranslated:'Ҷой чӣ гуна буд?', options:['Crowded and noisy','Faraway and quiet','Hot and busy'], correctIndex:1, explanation:'faraway and quiet.' },
      { question:'What did they do in the evening?', questionTranslated:'Онҳо шом чӣ карданд?', options:['Made a fire','Went shopping','Slept early'], correctIndex:0, explanation:'we made a fire.' },
      { question:'What is their future plan?', questionTranslated:'Нақшаи ояндаи онҳо чист?', options:['Go there again next summer','Never return','Move there'], correctIndex:0, explanation:'going to go there again next summer.' },
    ],
  },
  review: {
    passage: 'Malika is going to travel to London next week. It is her first trip abroad, so she is a little nervous. She has already got her passport and visa. She is going to fly on Monday morning. Her friend told her that London will be cold and rainy, so she is going to pack a warm coat. In London she is going to visit famous historic places and take a lot of photos. She thinks she will love the city. She is not going to buy expensive things, only a few small souvenirs for her family.',
    passageTranslated: 'Малика ҳафтаи оянда ба Лондон сафар мекунад. Ин аввалин сафари ӯ ба хориҷ аст, бинобар ин ӯ каме ба ташвиш аст. Ӯ аллакай шиноснома ва раводидашро гирифтааст. Ӯ рӯзи душанбе субҳ парвоз мекунад. Дӯсташ ба ӯ гуфт, ки Лондон хунук ва боронӣ мешавад, бинобар ин ӯ пальтои гарм мегирад. Дар Лондон ӯ ҷойҳои машҳури таърихиро мебинад ва аксҳои зиёд мегирад. Ӯ фикр мекунад, ки шаҳрро дӯст медорад. Ӯ чизҳои гарон намехарад, танҳо якчанд тӯҳфаи хурд барои оилааш.',
    questions: [
      { question:'Where is Malika going?', questionTranslated:'Малика ба куҷо меравад?', options:['Paris','London','Dubai'], correctIndex:1, explanation:'going to travel to London.' },
      { question:'What has she already got?', questionTranslated:'Ӯ аллакай чӣ гирифтааст?', options:['Her passport and visa','A hotel job','A new car'], correctIndex:0, explanation:'already got her passport and visa.' },
      { question:'Why is she going to pack a warm coat?', questionTranslated:'Чаро ӯ пальтои гарм мегирад?', options:['London will be cold and rainy','She is cold','It is winter here'], correctIndex:0, explanation:'London will be cold and rainy.' },
      { question:'What is she going to buy?', questionTranslated:'Ӯ чӣ мехарад?', options:['Expensive things','A few small souvenirs','Nothing'], correctIndex:1, explanation:'only a few small souvenirs.' },
      { question:'How does she feel?', questionTranslated:'Ӯ чӣ ҳис мекунад?', options:['Angry','A little nervous','Very bored'], correctIndex:1, explanation:'she is a little nervous.' },
    ],
  },
  exam: {
    passage: 'The Karimov family is planning a summer holiday. Mr Karimov is going to take two weeks off work. They are not going to fly this year; instead, they are going to drive to the countryside. Mrs Karimova thinks the fresh air will be good for the children. They are going to stay in a small house near a river. The children are excited because they are going to swim, fish, and camp. "It will be a simple but happy holiday," says Mr Karimov. "We will spend time together, and that is the most important thing."',
    passageTranslated: 'Оилаи Каримов таътили тобистонаро ба нақша мегирад. Ҷаноби Каримов ду ҳафта аз кор рухсатӣ мегирад. Онҳо имсол парвоз намекунанд; ба ҷои он, ба деҳот мошин меронанд. Хонум Каримова фикр мекунад, ки ҳавои тоза барои кӯдакон хуб мешавад. Онҳо дар хонаи хурди назди дарё мемонанд. Кӯдакон шоданд, зеро онҳо шино мекунанд, моҳӣ мегиранд ва хайма мезананд. «Ин таътили содда, вале хушбахтона мешавад», мегӯяд ҷаноби Каримов. «Мо якҷоя вақт мегузаронем ва ин муҳимтарин чиз аст.»',
    questions: [
      { question:'How are they going to travel?', questionTranslated:'Онҳо чӣ хел сафар мекунанд?', options:['By plane','By car','By train'], correctIndex:1, explanation:'going to drive to the countryside.' },
      { question:'Where will they stay?', questionTranslated:'Онҳо дар куҷо мемонанд?', options:['A hotel','A small house near a river','A tent in a city'], correctIndex:1, explanation:'a small house near a river.' },
      { question:'Why are the children excited?', questionTranslated:'Чаро кӯдакон шоданд?', options:[fish and camp','They will fly','They will shop','They will swim], correctIndex:3, explanation:'going to swim, fish, and camp.' },
      { question:'What does Mrs Karimova think?', questionTranslated:'Хонум Каримова чӣ фикр мекунад?', options:['It will rain','The trip is too long','The fresh air will be good'], correctIndex:2, explanation:'the fresh air will be good for the children.' },
      { question:'What is the most important thing?', questionTranslated:'Муҳимтарин чиз чист?', options:['Seeing the sea','Spending time together','Saving money'], correctIndex:1, explanation:'We will spend time together.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 5 тайёр.');
