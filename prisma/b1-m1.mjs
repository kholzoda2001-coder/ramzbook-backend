import { W, buildModule, refreshExisting, bumpVersion, done } from './b1-module-builder.mjs';

export const M = {
  order: 1, title: 'Module 1: Travel and Problem Solving', titleTranslated: 'Модули 1: Сафар ва Ҳалли мушкилот',
  emoji: '✈️', color: '#10B981',
  vocab: [
    { title: 'Lesson 1: At the Airport', tt: 'Дарси 1: Дар фурудгоҳ', emoji: '🛫', words: [
      W('Flight','/flaɪt/','флайт','Парвоз','✈️','My flight was delayed by two hours.','Парвози ман ду соат ба таъхир афтод.','noun'),
      W('Luggage','/ˈlʌɡɪdʒ/','лагиҷ','Бағоҷ / бор','🧳','We have too much luggage.','Мо бағоҷи аз ҳад зиёд дорем.','noun'),
      W('Passenger','/ˈpæsɪndʒə/','пасинҷер','Мусофир','🧑‍🤝‍🧑','The passengers are waiting to board.','Мусофирон барои савор шудан интизоранд.','noun'),
      W('Boarding pass','/ˈbɔːdɪŋ pɑːs/','бординг пас','Чиптаи саворшавӣ','🎫','Please show your boarding pass.','Лутфан чиптаи саворшавиро нишон диҳед.','noun'),
      W('Delay','/dɪˈleɪ/','дилей','Таъхир / дермонӣ','⏱️','There is a delay because of the weather.','Бо сабаби обу ҳаво таъхир шудааст.','noun'),
      W('Security','/sɪˈkjʊərəti/','сикюрити','Амният','👮','It takes time to go through security.','Гузаштан аз амният вақт мегирад.','noun'),
      W('Customs','/ˈkʌstəmz/','кастемз','Гумрук','🛃','They checked my bag at customs.','Дар гумрук халтаи маро тафтиш карданд.','noun'),
      W('Terminal','/ˈtɜːmɪnl/','тёрминл','Терминал','🏢','The plane leaves from terminal 2.','Ҳавопаймо аз терминали 2 парвоз мекунад.','noun'),
      W('Gate','/ɡeɪt/','гейт','Дарвозаи баромад','🚪','Go straight to gate number five.','Рост ба дарвозаи рақами панҷ равед.','noun'),
      W('Depart','/dɪˈpɑːt/','дипарт','Парвоз кардан / рафтан','🛫','The train departs at noon.','Поезд нисфирӯзӣ меравад.','verb'),
    ]},
    { title: 'Lesson 2: Accommodation', tt: 'Дарси 2: Ҷои зист', emoji: '🏨', words: [
      W('Accommodation','/əˌkɒməˈdeɪʃn/','акомадейшн','Ҷои зист','🏠','It is hard to find cheap accommodation.','Ёфтани ҷои зисти арзон душвор аст.','noun'),
      W('Book','/bʊk/','бук','Банд кардан (брон)','📅','I booked a double room online.','Ман як ҳуҷраи дунафараро онлайн банд кардам.','verb'),
      W('Reception','/rɪˈsepʃn/','рисепшн','Қабулгоҳ','🛎️','Leave the keys at reception.','Калидҳоро дар қабулгоҳ гузоред.','noun'),
      W('Available','/əˈveɪləbl/','авейлебл','Дастрас / холӣ','✅','Are there any rooms available?','Оё ягон ҳуҷраи холӣ ҳаст?','adjective'),
      W('Include','/ɪnˈkluːd/','инклуд','Дар бар гирифтан','➕','Does the price include breakfast?','Оё нарх наҳориро дар бар мегирад?','verb'),
      W('Cancel','/ˈkænsl/','кансл','Бекор кардан','❌','I had to cancel my reservation.','Ман маҷбур шудам фармоишамро бекор кунам.','verb'),
      W('Confirm','/kənˈfɜːm/','конфёрм','Тасдиқ кардан','✔️','Please confirm your booking.','Лутфан банди худро тасдиқ кунед.','verb'),
      W('Guest','/ɡest/','гест','Меҳмон','🛌','The hotel has over two hundred guests.','Меҳмонхона зиёда аз дусад меҳмон дорад.','noun'),
      W('Facilities','/fəˈsɪlətiz/','фасилитиз','Шароитҳо / иншоот','🏊','The hotel has great sports facilities.','Меҳмонхона шароитҳои олии варзишӣ дорад.','noun'),
      W('Complain','/kəmˈpleɪn/','комплейн','Шикоят кардан','🗣️','We complained about the noise.','Мо аз садо шикоят кардем.','verb'),
    ]},
    { title: 'Lesson 3: Transport Problems', tt: 'Дарси 3: Мушкилоти нақлиёт', emoji: '⚠️', words: [
      W('Break down','/breɪk daʊn/','брек даун','Вайрон шудан (нақлиёт)','🚗','Our car broke down on the highway.','Мошини мо дар шоҳроҳ вайрон шуд.','verb'),
      W('Miss','/mɪs/','мис','Дер мондан (аз нақлиёт)','🏃','Hurry up, or you will miss the train.','Шитоб кун, вагарна аз поезд дер мемонӣ.','verb'),
      W('Traffic jam','/ˈtræfɪk dʒæm/','трафик ҷам','Тамбашавии роҳ','🚕','We were stuck in a huge traffic jam.','Мо дар тамбашавии калон мондем.','noun'),
      W('Accident','/ˈæksɪdənt/','аксидент','Авария / садама','💥','There was a bad accident on the road.','Дар роҳ садамаи бад шуд.','noun'),
      W('Get lost','/ɡet lɒst/','гет лост','Гум шудан','🗺️','We got lost in the old city.','Мо дар шаҳри кӯҳна гум шудем.','verb'),
      W('Direction','/dəˈrekʃn/','дирекшн','Самт','➡️','Can you give me directions to the bank?','Шумо метавонед ба ман самти бонкро нишон диҳед?','noun'),
      W('Vehicle','/ˈviːəkl/','виекл','Воситаи нақлиёт','🚐','You must park your vehicle here.','Шумо бояд нақлиёти худро дар ин ҷо гузоред.','noun'),
      W('Repair','/rɪˈpeə/','рипеа','Таъмир кардан','🔧','It took two days to repair the car.','Таъмири мошин ду рӯз вақт гирифт.','verb'),
      W('Refund','/ˈriːfʌnd/','рифанд','Баргардонидани пул','💵','I asked for a refund for the tickets.','Ман баргардонидани пули чиптаҳоро талаб кардам.','noun'),
      W('Apologise','/əˈpɒlədʒaɪz/','аполедҷайз','Узр пурсидан','🙏','The manager apologised for the mistake.','Мудир барои хатогӣ узр пурсид.','verb'),
    ]},
    { title: 'Lesson 4: Travel Phrasal Verbs', tt: 'Дарси 4: Феълҳои таркибии сафар', emoji: '🛫', words: [
      W('Set off','/set ɒf/','сет оф','Ба роҳ баромадан','🎒','We need to set off early tomorrow.','Мо бояд фардо барвақт ба роҳ бароем.','verb'),
      W('Take off','/teɪk ɒf/','тейк оф','Парвоз кардан (аз замин кандан)','✈️','The plane took off on time.','Ҳавопаймо сари вақт парвоз кард.','verb'),
      W('Check in','/tʃek ɪn/','чек ин','Ба қайд гирифтан','🏨','We checked in at the hotel at 3 PM.','Мо соати 3-и рӯз дар меҳмонхона ба қайд гирифтем.','verb'),
      W('Check out','/tʃek aʊt/','чек аут','Аз қайд баромадан (рафтан)','🚪','Guests must check out before 11 AM.','Меҳмонон бояд пеш аз соати 11 аз қайд бароянд.','verb'),
      W('Look forward to','/lʊk ˈfɔːwəd tu/','лук форвед ту','Бесаброна интизор шудан','🤩','I am looking forward to my holiday.','Ман бесаброна рухсатиамро интизор ҳастам.','verb'),
      W('Pick up','/pɪk ʌp/','пик ап','Омада гирифтан (бо мошин)','🚗','My brother will pick me up from the station.','Бародарам маро аз истгоҳ мегирад.','verb'),
      W('Drop off','/drɒp ɒf/','дроп оф','Фровардан (аз мошин)','🚖','Can you drop me off near the bank?','Шумо метавонед маро дар назди бонк фароред?','verb'),
      W('Get on','/ɡet ɒn/','гет он','Савор шудан (ба автобус/поезд)','🚌','We got on the wrong bus.','Мо ба автобуси нодуруст савор шудем.','verb'),
      W('Get off','/ɡet ɒf/','гет оф','Фаромадан (аз автобус/поезд)','🚶','We need to get off at the next stop.','Мо бояд дар истгоҳи оянда фароем.','verb'),
      W('Hurry up','/ˈhʌri ʌp/','ҳари ап','Шитоб кардан','🏃','Hurry up, or we will be late!','Шитоб кунед, вагарна мо дер мемонем!','verb'),
    ]}
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 5: Grammar — Present Perfect + already/yet/just', lessonTitleTg: 'Дарси 5: Грамматика — Present Perfect бо already/yet/just',
      title: 'Present Perfect: already, yet, just', titleTranslated: 'Present Perfect: already, yet, just', emoji: '✅',
      explanation:
`Дар сатҳи B1 мо Present Perfect-ро на танҳо барои таҷриба, балки барои амалҳое истифода мебарем, ки ба наздикӣ тамом шудаанд ё интизоранд.
Калимаҳои махсус:
1. **Just (навакак):** Барои амале, ки чанд лаҳза пеш тамом шуд. Дар мобайн меояд.
* *I have **just** arrived at the airport.* (Ман навакак ба фурудгоҳ расидам).
2. **Already (аллакай):** Барои амале, ки пеш аз вақти интизоршуда тамом шуд. Дар мобайн меояд.
* *We have **already** booked the hotel.* (Мо аллакай меҳмонхонаро банд кардем).
3. **Yet (ҳанӯз):** Барои амале, ки то ҳол нашудааст, вале интизор меравад. Танҳо дар ҷумлаҳои **манфӣ** ва **саволӣ** ва дар **охири ҷумла** меояд.
* *Have you packed your bag **yet**?* (Шумо ҳанӯз борхалтаатонро ҷамъ кардед?)
* *I haven't printed my boarding pass **yet**.* (Ман ҳанӯз чиптамро чоп накардаам).`,
      rules: [
        { pattern: 'have/has + just + V3', note: 'I have just finished.' },
        { pattern: 'have/has + already + V3', note: 'He has already left.' },
        { pattern: 'haven\'t/hasn\'t + V3 ... yet', note: 'They haven\'t arrived yet.' },
        { pattern: 'Have you + V3 ... yet?', note: 'Have you seen it yet?' },
      ],
      examples: [
        { sentence: 'I have already bought the tickets.', translation: 'Ман аллакай чиптаҳоро харидаам.', highlight: 'already bought' },
        { sentence: 'The plane has just landed.', translation: 'Ҳавопаймо навакак нишаст.', highlight: 'has just landed' },
        { sentence: 'Have they announced our flight yet?', translation: 'Оё онҳо ҳанӯз парвози моро эълон кардаанд?', highlight: 'yet' },
        { sentence: 'I haven\'t found my passport yet.', translation: 'Ман ҳанӯз шиносномаамро наёфтаам.', highlight: 'haven\'t found ... yet' },
      ],
      exercises: [
        { type:'choose', prompt:'I have ___ finished my packing. I did it five minutes ago.', promptTranslated:'Ман навакак ҷамъкуниро тамом кардам. Панҷ дақиқа пеш.', options:['just','already','yet','ever'], answer:'just', explanation:'"just" барои амале, ки навакак тамом шуд.' },
        { type:'choose', prompt:'Don\'t buy bread. I have ___ bought some.', promptTranslated:'Нон нахар. Ман аллакай харидаам.', options:['already','yet','just','never'], answer:'already', explanation:'"already" маънои аллакайро дорад.' },
        { type:'choose', prompt:'Have you talked to the manager ___?', promptTranslated:'Оё шумо ҳанӯз бо мудир сӯҳбат кардед?', options:['yet','already','just','never'], answer:'yet', explanation:'Дар савол одатан "yet" дар охир меояд.' },
        { type:'fill_blank', prompt:'I haven\'t called the hotel ___ (ҳанӯз).', promptTranslated:'Ман ҳанӯз ба меҳмонхона занг назадаам.', answer:'yet', explanation:'Дар охири ҷумлаи манфӣ "yet" истифода мешавад.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман навакак чиптаи саворшавиро гирифтам.', options:['I','just','have','my boarding pass','got'], answer:'I have just got my boarding pass.', explanation:'I have just got my boarding pass.' },
        { type:'transform', prompt:'Ислоҳ кунед: I didn\'t see him yet.', promptTranslated:'Бо yet Present Perfect меояд.', answer:'I haven\'t seen him yet.', explanation:'I haven\'t seen him yet.' },
      ],
    },
    {
      lessonTitle: 'Lesson 6: Grammar — Past Continuous vs Past Simple', lessonTitleTg: 'Дарси 6: Грамматика — Past Continuous ё Past Simple',
      title: 'Past Continuous vs Past Simple', titleTranslated: 'Гузаштаи давомдор ё Гузаштаи оддӣ', emoji: '⏳',
      explanation:
`Дар сатҳи B1 мо ин ду замонро дар як ҷумла барои нақл кардани ҳикояҳо фаъолона истифода мебарем.
1. **Past Continuous (was/were + V-ing):** Барои нишон додани манзара ё амале, ки дар ҷараён буд (Background action).
2. **Past Simple (V2):** Барои амали кӯтоҳе, ки ногаҳон рӯй дод ва амали давомдорро қатъ кард.

Калимаҳои пайвасткунанда:
* **when (вақте ки):** Одатан пеш аз Past Simple меояд. *I was sleeping **when** the phone rang.*
* **while (ҳангоме ки):** Одатан пеш аз Past Continuous меояд. ***While** I was sleeping, the phone rang.*`,
      rules: [
        { pattern: 'Past Cont. + when + Past Simple', note: 'We were driving when the car broke down.' },
        { pattern: 'While + Past Cont. + Past Simple', note: 'While we were driving, it started to rain.' },
      ],
      examples: [
        { sentence: 'While I was waiting at the airport, I met an old friend.', translation: 'Ҳангоме ки ман дар фурудгоҳ интизор будам, дӯсти кӯҳнаамро вохӯрдам.', highlight: 'was waiting ... met' },
        { sentence: 'We were sleeping when the alarm rang.', translation: 'Мо хоб будем, вақте ки ҳушдор занг зад.', highlight: 'were sleeping ... rang' },
        { sentence: 'What were you doing when the accident happened?', translation: 'Вақте садама шуд, шумо чӣ кор мекардед?', highlight: 'were you doing ... happened' },
        { sentence: 'She lost her passport while she was travelling.', translation: 'Ӯ ҳангоми сафар кардан шиносномаашро гум кард.', highlight: 'lost ... was travelling' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ a book when the lights went out.', promptTranslated:'Вақте барқ хомӯш шуд, ман китоб мехондам.', options:['was reading','read','am reading','reading'], answer:'was reading', explanation:'Амали давомдор дар гузашта: was reading.' },
        { type:'choose', prompt:'While we ___ to the airport, our car broke down.', promptTranslated:'Ҳангоме ки ба фурудгоҳ мерафтем, мошини мо вайрон шуд.', options:['were driving','drove','are driving','drive'], answer:'were driving', explanation:'While + Past Continuous.' },
        { type:'choose', prompt:'He was walking in the park ___ he found a wallet.', promptTranslated:'Ӯ дар боғ сайр мекард, вақте ки ҳамёнро ёфт.', options:['when','while','so','because'], answer:'when', explanation:'when + Past Simple (found).' },
        { type:'fill_blank', prompt:'I was watching TV when my friend ___ (arrive).', promptTranslated:'Вақте дӯстам омад, ман телевизор тамошо мекардам.', answer:'arrived', explanation:'Амали кӯтоҳи қатъкунанда: arrived (Past Simple).' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Мо хоб будем, вақте ки телефон занг зад.', options:['We','sleeping','were','when','the phone','rang'], answer:'We were sleeping when the phone rang.', explanation:'We were sleeping when the phone rang.' },
        { type:'transform', prompt:'Бо "While" нависед: I was eating. He called me.', promptTranslated:'Ин ду ҷумларо пайваст кунед.', answer:'While I was eating, he called me.', explanation:'While + past continuous, past simple.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 7: Listening — A Nightmare Journey', lessonTitleTg: 'Дарси 7: Шунавоӣ — Сафари даҳшатнок',
    title: 'A Nightmare Journey', titleTranslated: 'Сафари даҳшатнок', emoji: '😱',
    passage: 'Last month, Sarah had a terrible journey to Paris. She had already booked her flight and packed her luggage, so she set off early. While she was driving to the airport, there was a huge traffic jam. She finally arrived, but when she got to the desk, the assistant said: "I am sorry, but you have missed your flight." She had to buy another ticket. Then, while she was waiting in the terminal, she realised her purse was missing! She was looking for it everywhere when a security guard found it and gave it back to her. Although her journey started terribly, she finally arrived in Paris. She was exhausted, but she was looking forward to her holiday.',
    passageTranslated: 'Моҳи гузашта Сара ба Париж сафари даҳшатноке дошт. Ӯ аллакай парвозашро банд карда ва бағоҷашро ҷамъ карда буд, бинобар ин барвақт ба роҳ баромад. Ҳангоме ки ӯ ба фурудгоҳ мерафт, тамбашавии калони роҳ ба амал омад. Ӯ ниҳоят расид, вале вақте ба мизи қабул омад, ёвар гуфт: "Узр, вале шумо аз парвоз дер мондед." Ӯ маҷбур шуд чиптаи дигар харад. Сипас, ҳангоме ки дар терминал интизор буд, дарк кард, ки ҳамёнаш нест! Ӯ онро дар ҳама ҷо меҷуст, ки як посбони амният онро ёфт ва ба ӯ баргардонд. Гарчанде сафари ӯ даҳшатнок оғоз ёфт, ӯ ниҳоят ба Париж расид. Ӯ сахт хаста буд, вале рухсатиашро бесаброна интизор буд.',
    questions: [
      { question:'Why did Sarah miss her flight?', questionTranslated:'Чаро Сара аз парвоз дер монд?', options:['She woke up late','There was a traffic jam','She forgot her passport'], correctIndex:1, explanation:'While she was driving to the airport, there was a huge traffic jam.' },
      { question:'What did she have to do?', questionTranslated:'Ӯ маҷбур шуд чӣ кор кунад?', options:['Buy another ticket','Go back home','Take a train'], correctIndex:0, explanation:'She had to buy another ticket.' },
      { question:'What happened while she was waiting in the terminal?', questionTranslated:'Ҳангоми интизорӣ дар терминал чӣ шуд?', options:['She met a friend','She missed another flight','She realised her purse was missing'], correctIndex:2, explanation:'she realised her purse was missing!' },
      { question:'Who found her purse?', questionTranslated:'Ҳамёнашро кӣ ёфт?', options:['A passenger','A security guard','The assistant'], correctIndex:1, explanation:'a security guard found it.' },
      { question:'How did she feel at the end of the journey?', questionTranslated:'Дар охири сафар ӯ чӣ ҳис кард?', options:['Exhausted but looking forward to her holiday','Angry and sad','She wanted to go home'], correctIndex:0, explanation:'She was exhausted, but she was looking forward to her holiday.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 8: Speaking — Complaining about Lost Luggage', lessonTitleTg: 'Дарси 8: Гуфтугӯ — Шикоят аз бағоҷи гумшуда',
    title: 'Complaining about Lost Luggage', titleTranslated: 'Шикоят аз бағоҷи гумшуда', emoji: '🧳',
    scenario: 'Шумо ба фурудгоҳ расидед, аммо ҷомадони худро ёфта натавонистед. Шумо ба корманди фурудгоҳ муроҷиат мекунед.',
    lines: [
      { speaker:'Assistant', text:'Good afternoon. How can I help you?', translation:'Нимаи рӯз ба хайр. Чӣ гуна кӯмак карда метавонам?', isUser:false },
      { speaker:'You', text:'Hello. I have just arrived from London, but my luggage is missing.', translation:'Салом. Ман навакак аз Лондон расидам, вале бағоҷи ман нест.', isUser:true },
      { speaker:'Assistant', text:'I am very sorry to hear that. Can I see your boarding pass, please?', translation:'Аз шунидани ин бисёр мебахшед. Метавонам чиптаи саворшавии шуморо бинам?', isUser:false },
      { speaker:'You', text:'Yes, here it is. I have already waited for an hour at the baggage reclaim.', translation:'Бале, марҳамат. Ман аллакай як соат дар ҷои гирифтани бағоҷ интизор шудам.', isUser:true },
      { speaker:'Assistant', text:'Could you describe your bag?', translation:'Оё шумо метавонед халтаи худро тасвир кунед?', isUser:false },
      { speaker:'You', text:'It is a large, blue suitcase with a red strap.', translation:'Он ҷомадони калони кабуд бо тасмаи сурх аст.', isUser:true },
      { speaker:'Assistant', text:'Okay, I will check the system. Ah, it seems it was left in London. It will arrive on the next flight.', translation:'Хуб, ман системаро тафтиш мекунам. Оҳ, ба назар мерасад, ки он дар Лондон мондааст. Он бо парвози оянда меояд.', isUser:false },
      { speaker:'You', text:'That is frustrating. Will you deliver it to my hotel?', translation:'Ин ноумедкунанда аст. Оё шумо онро ба меҳмонхонаи ман мерасонед?', isUser:true },
      { speaker:'Assistant', text:'Yes, of course. Please write down your accommodation details here.', translation:'Бале, албатта. Лутфан маълумоти ҷои зистатонро дар ин ҷо нависед.', isUser:false },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 9: Reading — The Importance of Complaining', lessonTitleTg: 'Дарси 9: Хониш — Аҳамияти шикоят кардан',
    title: 'The Importance of Complaining', titleTranslated: 'Аҳамияти шикоят кардан', emoji: '🗣️',
    passage: 'Many people hate complaining. When a flight is delayed, or a hotel room is dirty, they often stay quiet because they don\'t want to cause a problem. However, consumer experts say that complaining politely is very important. If a company does not know about a problem, they cannot fix it. Last year, a survey showed that 60% of passengers who complained about a significant delay received a refund or a free ticket. When you complain, it is essential to stay calm and provide evidence. Do not shout at the staff; they are usually just doing their jobs. Write an email or ask to speak to the manager. By speaking up, you not only solve your own problem, but you also help the company improve its services for future guests.',
    passageTranslated: 'Бисёр одамон шикоят карданро бад мебинанд. Вақте парвоз таъхир меёбад ё ҳуҷраи меҳмонхона ифлос аст, онҳо аксаран хомӯш мемонанд, зеро намехоҳанд мушкил эҷод кунанд. Бо вуҷуди ин, коршиносони истеъмолкунандагон мегӯянд, ки хушмуомилона шикоят кардан хеле муҳим аст. Агар ширкат дар бораи мушкил надонад, онро ислоҳ карда наметавонад. Соли гузашта, як пурсиш нишон дод, ки 60%-и мусофироне, ки аз таъхири назаррас шикоят карданд, баргардонидани пул ё чиптаи ройгон гирифтанд. Вақте шумо шикоят мекунед, муҳим аст, ки ором бимонед ва далел пешниҳод кунед. Ба кормандон дод назанед; онҳо одатан танҳо кори худро мекунанд. Почтаи электронӣ нависед ё хоҳиш кунед, ки бо мудир сӯҳбат кунед. Бо изҳори назар, шумо на танҳо мушкилоти худро ҳал мекунед, балки ба ширкат барои беҳтар кардани хидматрасониаш барои меҳмонони оянда низ кӯмак мерасонед.',
    questions: [
      { question:'Why do many people stay quiet when there is a problem?', questionTranslated:'Чаро бисёр одамон ҳангоми пайдо шудани мушкил хомӯш мемонанд?', options:['They don\'t want to cause a problem','They are lazy','They enjoy the problem'], correctIndex:0, explanation:'because they don\'t want to cause a problem.' },
      { question:'What do consumer experts say about complaining?', questionTranslated:'Коршиносон дар бораи шикоят кардан чӣ мегӯянд?', options:['It is very bad','It is very important to do it politely','You should shout'], correctIndex:1, explanation:'say that complaining politely is very important.' },
      { question:'What did 60% of passengers receive after complaining?', questionTranslated:'60%-и мусофирон баъди шикоят чӣ гирифтанд?', options:['Nothing','An apology','A refund or a free ticket'], correctIndex:2, explanation:'received a refund or a free ticket.' },
      { question:'How should you complain?', questionTranslated:'Шумо чӣ гуна бояд шикоят кунед?', options:['Stay calm and provide evidence','Shout at the staff','Break things'], correctIndex:0, explanation:'it is essential to stay calm and provide evidence.' },
      { question:'Who else benefits when you complain?', questionTranslated:'Вақте шумо шикоят мекунед, боз кӣ фоида мебинад?', options:['Only you','The staff','Future guests'], correctIndex:2, explanation:'you also help the company improve its services for future guests.' },
    ],
  },
  review: {
    passage: 'When travelling abroad, preparation is everything. Before you set off, you should always check your accommodation and confirm your flight. Sometimes, unexpected things happen. For example, while you are waiting at the terminal, your flight might be delayed due to bad weather. In these situations, you shouldn\'t get angry. If your luggage is lost or your hotel room is dirty, you have the right to complain. However, it is always better to speak politely to the reception or security staff. They will usually try their best to repair the situation or offer a refund. Good communication can turn a travel disaster into a manageable problem. So, pack your bags carefully, stay positive, and look forward to your journey.',
    passageTranslated: 'Ҳангоми сафар ба хориҷа, омодагӣ ҳама чиз аст. Пеш аз он ки ба роҳ бароед, шумо ҳамеша бояд ҷои зисти худро тафтиш кунед ва парвозатонро тасдиқ кунед. Баъзан, чизҳои ғайричашмдошт рӯй медиҳанд. Масалан, ҳангоме ки шумо дар терминал интизор ҳастед, парвози шумо метавонад бо сабаби обу ҳавои бад ба таъхир афтад. Дар ин ҳолатҳо, шумо набояд хашмгин шавед. Агар бағоҷатон гум шавад ё ҳуҷраи меҳмонхонаатон ифлос бошад, шумо ҳуқуқ доред шикоят кунед. Бо вуҷуди ин, ҳамеша беҳтар аст, ки бо кормандони қабулгоҳ ё амният хушмуомилона гап занед. Онҳо одатан кӯшиш мекунанд, ки вазъро ислоҳ кунанд ё пулро баргардонанд. Муоширати хуб метавонад фалокати сафарро ба мушкили идорашаванда табдил диҳад. Пас, ҷомадонҳои худро бодиққат ҷамъ кунед, мусбат бимонед ва бесаброна интизори сафаратон шавед.',
    questions: [
      { question:'What should you do before you set off?', questionTranslated:'Пеш аз ба роҳ баромадан бояд чӣ кор кунед?', options:['Sleep a lot','Check accommodation and confirm the flight','Buy a lot of clothes'], correctIndex:1, explanation:'check your accommodation and confirm your flight.' },
      { question:'Why might a flight be delayed?', questionTranslated:'Чаро парвоз метавонад ба таъхир афтад?', options:['Because of bad weather','Because the plane is small','Because passengers are late'], correctIndex:0, explanation:'due to bad weather.' },
      { question:'How should you complain if your luggage is lost?', questionTranslated:'Агар бағоҷ гум шавад, чӣ гуна бояд шикоят кунед?', options:['Angrily','Politely','Quietly'], correctIndex:1, explanation:'it is always better to speak politely.' },
      { question:'What can staff offer if there is a problem?', questionTranslated:'Агар мушкил шавад, кормандон чӣ пешниҳод карда метавонанд?', options:['A repair or a refund','A fight','Nothing'], correctIndex:0, explanation:'repair the situation or offer a refund.' },
      { question:'What can turn a disaster into a manageable problem?', questionTranslated:'Чӣ метавонад фалокатро ба мушкили идорашаванда табдил диҳад?', options:['Good communication','Money','Luck'], correctIndex:0, explanation:'Good communication can turn a travel disaster into a manageable problem.' },
    ],
  },
  exam: {
    passage: 'Travelling is an exciting experience, but it also tests your patience. Imagine this: you have just arrived at the airport terminal, and you see on the screen that your flight has a three-hour delay. While you are waiting, your phone battery dies, and you have no charger. These situations are common, and how you react to them is very important. Experts suggest that instead of getting angry, you should use the time wisely. Read a book, walk around the shops, or talk to other passengers. If an airline is responsible for a very long delay, you can politely ask the assistant for a food voucher or a refund. Remember, travel problems happen to everyone. A sensible traveller stays calm and solves the problem step by step.',
    passageTranslated: 'Саёҳат таҷрибаи ҳаяҷоновар аст, вале он инчунин сабри шуморо месанҷад. Инро тасаввур кунед: шумо навакак ба терминали фурудгоҳ расидед ва дар экран мебинед, ки парвозатон се соат таъхир дорад. Ҳангоме ки шумо интизор ҳастед, батареяи телефони шумо мемурад ва шумо пуркунанда надоред. Ин ҳолатҳо маъмуланд ва чӣ гуна аксуламал кардани шумо ба онҳо хеле муҳим аст. Коршиносон пешниҳод мекунанд, ки ба ҷои хашмгин шудан, шумо бояд вақтро оқилона истифода баред. Китоб хонед, дар гирди мағозаҳо сайр кунед ё бо дигар мусофирон сӯҳбат кунед. Агар ширкати ҳавопаймоӣ барои таъхири хеле дароз масъул бошад, шумо метавонед хушмуомилона аз ёвар ваучери хӯрок ё баргардонидани пулро хоҳиш кунед. Дар хотир доред, ки мушкилоти сафар бо ҳама рӯй медиҳанд. Саёҳаткунандаи оқилона ором мемонад ва мушкилро қадам ба қадам ҳал мекунад.',
    questions: [
      { question:'What does travelling test?', questionTranslated:'Саёҳат чиро месанҷад?', options:['Your patience','Your money','Your health'], correctIndex:0, explanation:'it also tests your patience.' },
      { question:'What happens to the phone in the example?', questionTranslated:'Дар мисол бо телефон чӣ мешавад?', options:['It gets lost','The battery dies','It breaks'], correctIndex:1, explanation:'your phone battery dies.' },
      { question:'What should you do instead of getting angry?', questionTranslated:'Ба ҷои хашмгин шудан шумо бояд чӣ кор кунед?', options:['Go home','Shout at the staff','Use the time wisely'], correctIndex:2, explanation:'use the time wisely.' },
      { question:'What can you ask for if there is a long delay?', questionTranslated:'Агар таъхири дароз шавад, чӣ хоҳиш карда метавонед?', options:['A new plane','A food voucher or a refund','A free holiday'], correctIndex:1, explanation:'ask the assistant for a food voucher or a refund.' },
      { question:'How does a sensible traveller solve a problem?', questionTranslated:'Саёҳаткунандаи оқилона мушкилро чӣ гуна ҳал мекунад?', options:['Quickly','Step by step','By complaining'], correctIndex:1, explanation:'solves the problem step by step.' },
    ],
  },
};
