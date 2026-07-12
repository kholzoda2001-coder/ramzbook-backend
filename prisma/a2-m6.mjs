import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 5, title: 'Module 6: In The City And Directions', titleTranslated: 'Модули 6: Дар шаҳр ва Самтҳо',
  emoji: '🏙️', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Places In Town', tt: 'Дарси 1: Ҷойҳо дар шаҳр', emoji: '🏢', words: [
      W('Town hall','/taʊn hɔːl/','таун ҳол','Шаҳрдорӣ','🏛️','The town hall is in the centre.','Шаҳрдорӣ дар марказ аст.','noun'),
      W('Salon','/ˈsælɒn/','салон','Салони мӯй','💇','She works at a hair salon.','Ӯ дар салони мӯй кор мекунад.','noun'),
      W('Grocer','/ˈɡrəʊsə/','гроусер','Бақкол','🥫','The grocer sells fresh fruit.','Бақкол меваи тару тоза мефурӯшад.','noun'),
      W('Bookshop','/ˈbʊkʃɒp/','букшоп','Мағозаи китоб','📖','I found it in the bookshop.','Ман онро дар мағозаи китоб ёфтам.','noun'),
      W('Car park','/kɑː pɑːk/','кар парк','Таваққуфгоҳ','🅿️','Leave the car in the car park.','Мошинро дар таваққуфгоҳ мон.','noun'),
      W('Square','/skweə/','сквеа','Майдон','🟦','We met in the main square.','Мо дар майдони марказӣ вохӯрдем.','noun'),
      W('Gallery','/ˈɡæləri/','гэлери','Нигористон','🖼️','The art gallery is free today.','Нигористони санъат имрӯз ройгон аст.','noun'),
      W('Kiosk','/ˈkiːɒsk/','киоск','Дӯконча / киоск','🏪','I bought a paper at the kiosk.','Ман аз киоск рӯзнома харидам.','noun'),
      W('Chemist','/ˈkemɪst/','кемист','Дорухона / аптека','⚗️','The chemist is on the corner.','Аптека дар кунҷ аст.','noun'),
      W('Petrol station','/ˈpetrəl steɪʃən/','петрол стейшн','Нуқтаи бензин','⛽','Stop at the petrol station.','Дар нуқтаи бензин истед.','noun'),
    ]},
    { title: 'Lesson 2: Buildings And Sights', tt: 'Дарси 2: Биноҳо ва Ҷойҳои дидан', emoji: '🏛️', words: [
      W('Bridge','/brɪdʒ/','бриҷ','Пул','🌉','We walked across the bridge.','Мо аз болои пул гузаштем.','noun'),
      W('Tower','/ˈtaʊə/','тауер','Манора','🗼','The tower is very tall.','Манора хеле баланд аст.','noun'),
      W('Palace','/ˈpæləs/','пэлес','Қаср','🏰','The old palace is beautiful.','Қасри кӯҳна зебо аст.','noun'),
      W('Skyscraper','/ˈskaɪskreɪpə/','скайскрейпер','Осмонбӯс','🏙️','New York has many skyscrapers.','Ню-Йорк осмонбӯсҳои зиёд дорад.','noun'),
      W('Monument','/ˈmɒnjumənt/','монюмент','Ёдгорӣ / муҷассама','🗿','There is a war monument here.','Дар ин ҷо ёдгории ҷанг ҳаст.','noun'),
      W('Fountain','/ˈfaʊntɪn/','фаунтин','Фаввора','⛲','Children play near the fountain.','Кӯдакон наздики фаввора бозӣ мекунанд.','noun'),
      W('Statue','/ˈstætʃuː/','статю','Ҳайкал','🗿','There is a statue in the park.','Дар боғ ҳайкал ҳаст.','noun'),
      W('Factory','/ˈfæktəri/','фэктери','Корхона / завод','🏭','My father works in a factory.','Падарам дар корхона кор мекунад.','noun'),
      W('Castle','/ˈkɑːsl/','касл','Қалъа','🏯','The castle is very old.','Қалъа хеле кӯҳна аст.','noun'),
      W('Harbour','/ˈhɑːbə/','ҳарбер','Бандар','⚓','Boats stay in the harbour.','Заврақҳо дар бандар меистанд.','noun'),
    ]},
    { title: 'Lesson 3: Directions', tt: 'Дарси 3: Самтҳо', emoji: '🧭', words: [
      W('Crossing','/ˈkrɒsɪŋ/','кросинг','Гузаргоҳ','🚸','Use the crossing to cross.','Барои гузаштан аз гузаргоҳ истифода бар.','noun'),
      W('Cross','/krɒs/','крос','Гузаштан (аз роҳ)','🚸','Cross the road carefully.','Аз роҳ бодиққат гузар.','verb'),
      W('Follow','/ˈfɒləʊ/','фолоу','Пайравӣ кардан','👣','Follow this street.','Ин кӯчаро пайравӣ кун.','verb'),
      W('Continue','/kənˈtɪnjuː/','кäнтиню','Идома додан','➡️','Continue to the end.','То охир идома деҳ.','verb'),
      W('Signpost','/ˈsaɪnpəʊst/','сайнпоуст','Тахтаи роҳнамо','🪧','The signpost shows the way.','Тахтаи роҳнамо роҳро нишон медиҳад.','noun'),
      W('Distance','/ˈdɪstəns/','дистенс','Масофа','📏','What is the distance to the city?','Масофа то шаҳр чанд аст?','noun'),
      W('Roundabout','/ˈraʊndəbaʊt/','раундэбаут','Чорраҳаи давра','🔄','Take the second exit at the roundabout.','Дар давра баромади дуюмро гир.','noun'),
      W('Traffic lights','/ˈtræfɪk laɪts/','трэфик лайтс','Чароғаки роҳнамо','🚦','Stop at the traffic lights.','Дар назди чароғак истед.','noun'),
      W('Pavement','/ˈpeɪvmənt/','пейвмент','Пиёдагард','🚶','Walk on the pavement.','Дар пиёдагард роҳ рав.','noun'),
      W('Junction','/ˈdʒʌŋkʃən/','ҷанкшн','Чорроҳа','✖️','Turn right at the junction.','Дар чорроҳа ба рост гард.','noun'),
    ]},
    { title: 'Lesson 4: Position Words', tt: 'Дарси 4: Калимаҳои ҷойгиршавӣ', emoji: '📍', words: [
      W('Opposite','/ˈɒpəzɪt/','опозит','Рӯ ба рӯ','↔️','The shop is opposite the bank.','Мағоза рӯ ба рӯи бонк аст.','preposition'),
      W('Towards','/təˈwɔːdz/','товордз','Ба сӯи','➡️','He walked towards the door.','Ӯ ба сӯи дар қадам зад.','preposition'),
      W('Beside','/bɪˈsaɪd/','бисайд','Дар паҳлӯи','↔️','Sit beside me.','Дар паҳлӯи ман нишин.','preposition'),
      W('Across','/əˈkrɒs/','акрос','Аз он тарафи','🚶','The park is across the street.','Боғ дар он тарафи кӯча аст.','preposition'),
      W('Along','/əˈlɒŋ/','алонг','Дар қад-қади','🛣️','Walk along the river.','Дар қад-қади дарё роҳ рав.','preposition'),
      W('Around','/əˈraʊnd/','араунд','Гирди / атрофи','🔵','There are trees around the square.','Гирди майдон дарахтон ҳастанд.','preposition'),
      W('Through','/θruː/','сру','Аз миёни','🚇','The road goes through the tunnel.','Роҳ аз миёни нақб мегузарад.','preposition'),
      W('Beyond','/bɪˈjɒnd/','бийонд','Он тарафтар','🔭','The hills are beyond the river.','Теппаҳо он тарафтари дарё ҳастанд.','preposition'),
      W('Underneath','/ˌʌndəˈniːθ/','андернис','Дар зери','⬇️','The cat sat underneath the car.','Гурба дар зери мошин нишаст.','preposition'),
      W('Alongside','/əˌlɒŋˈsaɪd/','алонгсайд','Дар паҳлӯи / қад-қади','↔️','A path runs alongside the road.','Пайроҳа дар қад-қади роҳ мегузарад.','preposition'),
    ]},
    { title: 'Lesson 5: City Transport', tt: 'Дарси 5: Нақлиёти шаҳрӣ', emoji: '🚕', words: [
      W('Underground','/ˈʌndəɡraʊnd/','андерграунд','Метро','🚇','I take the underground to work.','Ман бо метро ба кор меравам.','noun'),
      W('Tram','/træm/','трэм','Трамвай','🚋','The tram is cheap and fast.','Трамвай арзон ва тез аст.','noun'),
      W('Fare','/feə/','феа','Нархи роҳ','💵','The bus fare is two somoni.','Нархи роҳи автобус ду сомонӣ аст.','noun'),
      W('Route','/ruːt/','рут','Масир / роҳ','🗺️','This is the fastest route.','Ин тезтарин масир аст.','noun'),
      W('Traffic','/ˈtræfɪk/','трэфик','Ҳаракати нақлиёт','🚗','There is a lot of traffic today.','Имрӯз ҳаракати нақлиёт зиёд аст.','noun'),
      W('Driver','/ˈdraɪvə/','драйвер','Ронанда','🧑‍✈️','The taxi driver was kind.','Ронандаи такси меҳрубон буд.','noun'),
      W('Passengers','/ˈpæsɪndʒəz/','пэсинҷерз','Мусофирон','👥','The bus was full of passengers.','Автобус пур аз мусофирон буд.','noun'),
      W('Ticket machine','/ˈtɪkɪt məˈʃiːn/','тикет машин','Дастгоҳи чипта','🎫','Buy a ticket from the machine.','Аз дастгоҳ чипта хар.','noun'),
      W('Rush hour','/ˈrʌʃ aʊə/','раш ауер','Соати серодам','⏰','Avoid travelling at rush hour.','Дар соати серодам сафар накун.','noun'),
      W('Motorway','/ˈməʊtəweɪ/','мотервей','Роҳи калон / автомагистраль','🛣️','We drove on the motorway.','Мо дар роҳи калон рондем.','noun'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Prepositions of Place', lessonTitleTg: 'Дарси 6: Грамматика — Пешояндҳои ҷой',
      title: 'Prepositions of Place', titleTranslated: 'Пешояндҳои ҷой (дар куҷо)', emoji: '📍',
      explanation:
`Пешояндҳои ҷой нишон медиҳанд, ки чиз **дар куҷост**:
- **in** — дар дохили: *in the box, in the city*
- **on** — дар рӯи: *on the table, on the corner*
- **at** — дар нуқта: *at the bus stop, at home*
- **next to / beside** — дар паҳлӯи | **between** — дар байни ду чиз
- **opposite** — рӯ ба рӯ | **behind** — дар қафо | **in front of** — дар пеш
- **near** — наздик | **under** — дар зер | **above/over** — дар боло

Мисол: *The bank is **next to** the library, **opposite** the park.*`,
      rules: [
        { pattern: 'in / on / at', note: 'in a city, on a street, at a place' },
        { pattern: 'next to, between, opposite', note: 'мавқеи нисбӣ' },
        { pattern: 'behind, in front of, near', note: 'қафо, пеш, наздик' },
        { pattern: 'under / above', note: 'зер / боло' },
      ],
      examples: [
        { sentence: 'The cat is under the table.', translation: 'Гурба дар зери миз аст.', highlight: 'under' },
        { sentence: 'The shop is next to the bank.', translation: 'Мағоза дар паҳлӯи бонк аст.', highlight: 'next to' },
        { sentence: 'There is a fountain in front of the palace.', translation: 'Дар пеши қаср фаввора ҳаст.', highlight: 'in front of' },
        { sentence: 'The pharmacy is between the cafe and the library.', translation: 'Дорухона дар байни қаҳвахона ва китобхона аст.', highlight: 'between' },
        { sentence: 'My house is opposite the school.', translation: 'Хонаи ман рӯ ба рӯи мактаб аст.', highlight: 'opposite' },
      ],
      exercises: [
        { type:'choose', prompt:'The book is ___ the table.', promptTranslated:'Китоб дар рӯи миз аст.', options:['on','in','at','of'], answer:'on', explanation:'дар рӯи → on.' },
        { type:'choose', prompt:'She is waiting ___ the bus stop.', promptTranslated:'Ӯ дар истгоҳ мунтазир аст.', options:['at','in','on','under'], answer:'at', explanation:'дар нуқта → at.' },
        { type:'choose', prompt:'The park is ___ the two towers.', promptTranslated:'Боғ дар байни ду манора аст.', options:['between','on','in','under'], answer:'between', explanation:'дар байни ду → between.' },
        { type:'choose', prompt:'The car is ___ the house (қафо).', promptTranslated:'Мошин дар қафои хона аст.', options:['behind','on','at','in'], answer:'behind', explanation:'қафо → behind.' },
        { type:'fill_blank', prompt:'The keys are ___ the drawer (дохил).', promptTranslated:'Калидҳо дар дохили ҷевон ҳастанд.', answer:'in', explanation:'дохил → in.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Мағоза рӯ ба рӯи бонк аст.', options:['The','is','shop','the','opposite','bank'], answer:'The shop is opposite the bank.', explanation:'... opposite the bank.' },
        { type:'transform', prompt:'Ислоҳ кунед: I am in the bus stop.', promptTranslated:'bus stop нуқта аст.', answer:'I am at the bus stop.', explanation:'at the bus stop.' },
        { type:'transform', prompt:'Ислоҳ кунед: The picture is in the wall.', promptTranslated:'рӯи девор.', answer:'The picture is on the wall.', explanation:'on the wall.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Giving Directions', lessonTitleTg: 'Дарси 7: Грамматика — Додани самт',
      title: 'Giving Directions (Imperatives)', titleTranslated: 'Додани самт (фармоиш)', emoji: '🧭',
      explanation:
`Барои **самт додан** феъли фармоишӣ (imperative) истифода мешавад — феъли асосӣ бе subject:
- **Go** straight ahead. (Рост пеш рав)
- **Turn** left / **Turn** right. (Ба чап/рост гард)
- **Take** the first/second turning. (Каҷии якум/дуюмро гир)
- **Cross** the road. **Follow** the street. **Go past** the bank.

Пешояндҳои ҳаракат: **along** (қад-қад), **across** (аз он тараф), **through** (аз миён), **up/down** (боло/поён).
Манфӣ: **Don't** turn here.`,
      rules: [
        { pattern: 'феъли фармоишӣ (бе subject)', note: 'Go, Turn, Take, Cross, Follow' },
        { pattern: 'turn left / right', note: 'ба чап / рост' },
        { pattern: 'go straight / past / along', note: 'ҳаракат' },
        { pattern: "манфӣ: Don't + феъл", note: "Don't cross here." },
      ],
      examples: [
        { sentence: 'Go straight and turn left at the corner.', translation: 'Рост рав ва дар кунҷ ба чап гард.', highlight: 'Go straight' },
        { sentence: 'Take the second turning on the right.', translation: 'Каҷии дуюмро аз тарафи рост гир.', highlight: 'Take the second' },
        { sentence: 'Cross the bridge and follow the road.', translation: 'Аз пул гузар ва роҳро пайравӣ кун.', highlight: 'Cross the bridge' },
        { sentence: 'Go past the mosque, it is on your right.', translation: 'Аз назди масҷид гузар, он аз тарафи рости туст.', highlight: 'Go past' },
        { sentence: "Don't turn here, it is one way.", translation: 'Ин ҷо нагард, ин роҳи яктарафа аст.', highlight: "Don't turn" },
      ],
      exercises: [
        { type:'choose', prompt:'___ left at the traffic lights.', promptTranslated:'Дар чароғак ба чап гард.', options:['Turn','Turning','Turned','To turn'], answer:'Turn', explanation:'фармоишӣ → Turn.' },
        { type:'choose', prompt:'Go ___ ahead to the square.', promptTranslated:'Рост ба пеш то майдон рав.', options:['straight','strait','direct','front'], answer:'straight', explanation:'go straight ahead.' },
        { type:'choose', prompt:'___ the first turning on the right.', promptTranslated:'Каҷии якумро аз рост гир.', options:['Take','Get','Make','Do'], answer:'Take', explanation:'Take the turning.' },
        { type:'choose', prompt:'Walk ___ the river to the bridge.', promptTranslated:'Дар қад-қади дарё то пул рав.', options:['along','on','in','at'], answer:'along', explanation:'along the river.' },
        { type:'fill_blank', prompt:'___ the road at the crossing. (гузаштан, фармоишӣ)', promptTranslated:'Дар гузаргоҳ аз роҳ гузар.', answer:'Cross', explanation:'Cross the road.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Дар кунҷ ба рост гард.', options:['Turn','the','right','at','corner'], answer:'Turn right at the corner.', explanation:'Turn right at the corner.' },
        { type:'transform', prompt:'Манфӣ созед: Turn here.', promptTranslated:'ба манфӣ (фармоишӣ).', answer:"Don't turn here.", explanation:"Don't + феъл." },
        { type:'transform', prompt:'Ислоҳ кунед: You go straight ahead.', promptTranslated:'фармоишӣ бе subject.', answer:'Go straight ahead.', explanation:'imperative subject намегирад.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — How Do I Get There?', lessonTitleTg: 'Дарси 8: Шунавоӣ — Чӣ хел ба он ҷо равам?',
    title: 'How Do I Get There?', titleTranslated: 'Чӣ хел ба он ҷо равам?', emoji: '🗺️',
    passage: 'A tourist wants to find the museum. A local man helps him. "Go straight along this street," he says. "Then cross the bridge over the river. At the traffic lights, turn right. Walk past the library and the bank. The museum is opposite a big fountain, next to the old tower. It is about ten minutes on foot. Don\'t take the bus, it is faster to walk." The tourist says thank you and follows the directions. He finds the museum easily.',
    passageTranslated: 'Як сайёҳ мехоҳад осорхонаро ёбад. Марди маҳаллӣ ба ӯ кӯмак мекунад. «Дар қад-қади ин кӯча рост рав», мегӯяд ӯ. «Баъд аз пули болои дарё гузар. Дар чароғак ба рост гард. Аз назди китобхона ва бонк гузар. Осорхона рӯ ба рӯи фаввораи калон, дар паҳлӯи манораи кӯҳна аст. Тақрибан даҳ дақиқа пиёда аст. Автобус нагир, пиёда рафтан тезтар аст.» Сайёҳ ташаккур мегӯяд ва самтҳоро пайравӣ мекунад. Ӯ осорхонаро ба осонӣ меёбад.',
    questions: [
      { question:'What is the tourist looking for?', questionTranslated:'Сайёҳ чиро меҷӯяд?', options:['The museum','The station','A hotel'], correctIndex:0, explanation:'wants to find the museum.' },
      { question:'What must he cross?', questionTranslated:'Ӯ аз чӣ бояд гузарад?', options:['A square','The bridge','A tunnel'], correctIndex:1, explanation:'cross the bridge.' },
      { question:'Where does he turn right?', questionTranslated:'Ӯ дар куҷо ба рост мегардад?', options:['At the traffic lights','At the bank','At the tower'], correctIndex:0, explanation:'At the traffic lights, turn right.' },
      { question:'What is the museum opposite?', questionTranslated:'Осорхона рӯ ба рӯи чӣ аст?', options:['A big fountain','A school','A market'], correctIndex:0, explanation:'opposite a big fountain.' },
      { question:'What does the man say about the bus?', questionTranslated:'Мард дар бораи автобус чӣ мегӯяд?', options:["Don't take it, walking is faster",'Take it','It is cheap'], correctIndex:0, explanation:"Don't take the bus." },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Excuse Me, Where Is...?', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Бубахшед, дар куҷост...?',
    title: 'Excuse Me, Where Is...?', titleTranslated: 'Бубахшед, дар куҷост...?', emoji: '🙋',
    scenario: 'Сайёҳ дар кӯча аз аҳолӣ роҳи истгоҳро мепурсад.',
    lines: [
      { speaker:'Tourist', text:'Excuse me, where is the train station?', translation:'Бубахшед, истгоҳи қатора дар куҷост?', isUser:false },
      { speaker:'You', text:'Go straight along this street for two minutes.', translation:'Ду дақиқа дар қад-қади ин кӯча рост рав.', isUser:true },
      { speaker:'Tourist', text:'And then?', translation:'Ва баъд?', isUser:false },
      { speaker:'You', text:'Turn left at the traffic lights, near the bank.', translation:'Дар чароғак, наздики бонк, ба чап гард.', isUser:true },
      { speaker:'Tourist', text:'Is it far from here?', translation:'Аз ин ҷо дур аст?', isUser:false },
      { speaker:'You', text:'No, it is opposite the big square.', translation:'Не, он рӯ ба рӯи майдони калон аст.', isUser:true },
      { speaker:'Tourist', text:'Thank you so much for your help!', translation:'Барои кӯмакатон бисёр ташаккур!', isUser:false },
      { speaker:'You', text:'You are welcome. Have a nice day!', translation:'Хоҳиш мекунам. Рӯзи хуш!', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — My Neighbourhood', lessonTitleTg: 'Дарси 10: Хониш — Маҳаллаи ман',
    title: 'My Neighbourhood', titleTranslated: 'Маҳаллаи ман', emoji: '🏘️',
    passage: 'I live in a busy neighbourhood in the centre of the city. My flat is on the third floor of a building opposite a small park. Near my home there are many useful places. The bakery is next to the pharmacy, and the library is across the street. There is a bus stop just in front of my building, so it is easy to travel. At rush hour there is a lot of traffic, so I usually walk. My favourite place is the old square with its beautiful fountain. In the evening people sit around it and children play. I love living here.',
    passageTranslated: 'Ман дар маҳаллаи серодами маркази шаҳр зиндагӣ мекунам. Ҳуҷраи ман дар ошёнаи сеюми биное рӯ ба рӯи боғи хурд аст. Наздики хонаам ҷойҳои муфиди зиёд ҳастанд. Нонвойхона дар паҳлӯи дорухона ва китобхона дар он тарафи кӯча аст. Дар пеши бинои ман истгоҳи автобус ҳаст, бинобар ин сафар кардан осон аст. Дар соати серодам ҳаракати нақлиёт зиёд аст, бинобар ин ман одатан пиёда меравам. Ҷои дӯстдоштаи ман майдони кӯҳна бо фаввораи зебояш аст. Шом одамон гирди он менишинанд ва кӯдакон бозӣ мекунанд. Ман зиндагӣ дар ин ҷоро дӯст медорам.',
    questions: [
      { question:'Where is the writer\'s flat?', questionTranslated:'Ҳуҷраи нависанда дар куҷост?', options:['Opposite a small park','Near the airport','Behind a factory'], correctIndex:0, explanation:'opposite a small park.' },
      { question:'What is next to the pharmacy?', questionTranslated:'Дар паҳлӯи дорухона чӣ ҳаст?', options:['The bakery','The bank','The library'], correctIndex:0, explanation:'The bakery is next to the pharmacy.' },
      { question:'What is in front of the building?', questionTranslated:'Дар пеши бино чӣ ҳаст?', options:['A bus stop','A bridge','A statue'], correctIndex:0, explanation:'a bus stop just in front.' },
      { question:'Why does the writer usually walk?', questionTranslated:'Чаро нависанда одатан пиёда меравад?', options:['A lot of traffic at rush hour','No buses','It is free'], correctIndex:0, explanation:'a lot of traffic, so I walk.' },
      { question:'What is the writer\'s favourite place?', questionTranslated:'Ҷои дӯстдоштаи нависанда чист?', options:['The old square with the fountain','The library','The bus stop'], correctIndex:0, explanation:'the old square with its fountain.' },
    ],
  },
  review: {
    passage: 'Bahrom is new in the city and often gets lost. Today he wants to go to the stadium for a football match. He asks a woman for directions. She tells him to go straight, cross the big junction, and continue along the main road. The stadium is behind the shopping centre, next to a petrol station. Bahrom takes the tram because the stadium is far. During rush hour the traffic is terrible, but the tram has its own route. He arrives on time and enjoys the game. Now he knows his way around the city much better.',
    passageTranslated: 'Баҳром дар шаҳр нав аст ва аксаран гум мешавад. Имрӯз ӯ мехоҳад ба варзишгоҳ барои бозии футбол равад. Ӯ аз як зан самтро мепурсад. Зан ба ӯ мегӯяд, ки рост равад, аз чорроҳаи калон гузарад ва дар қад-қади роҳи асосӣ идома диҳад. Варзишгоҳ дар қафои маркази савдо, дар паҳлӯи нуқтаи бензин аст. Баҳром трамвайро мегирад, зеро варзишгоҳ дур аст. Дар соати серодам ҳаракати нақлиёт бад аст, вале трамвай масири худро дорад. Ӯ саривақт мерасад ва аз бозӣ лаззат мебарад. Акнун ӯ роҳи шаҳрро хеле беҳтар медонад.',
    questions: [
      { question:'Where does Bahrom want to go?', questionTranslated:'Баҳром ба куҷо рафтан мехоҳад?', options:['The stadium','The museum','The airport'], correctIndex:0, explanation:'go to the stadium.' },
      { question:'Where is the stadium?', questionTranslated:'Варзишгоҳ дар куҷост?', options:['Behind the shopping centre','In the square','Near the river'], correctIndex:0, explanation:'behind the shopping centre.' },
      { question:'Why does he take the tram?', questionTranslated:'Чаро ӯ трамвайро мегирад?', options:['The stadium is far','It is free','He likes trams'], correctIndex:0, explanation:'the stadium is far.' },
      { question:'How is the traffic at rush hour?', questionTranslated:'Ҳаракати нақлиёт дар соати серодам чӣ гуна аст?', options:['Terrible','Empty','Fast'], correctIndex:0, explanation:'the traffic is terrible.' },
      { question:'Does Bahrom arrive on time?', questionTranslated:'Баҳром саривақт мерасад?', options:['Yes','No','He is late'], correctIndex:0, explanation:'He arrives on time.' },
    ],
  },
  exam: {
    passage: 'The old part of our city is a wonderful place for a walk. Start at the main square, where there is a tall statue and a fountain. Walk along the narrow street past the bakery and the bookshop. Turn left at the corner and cross the small bridge. On your right you will see a beautiful mosque, and opposite it, a historic palace. Continue straight until you reach the museum. It is between the library and an old tower. There is little traffic here because cars cannot enter. It is the most peaceful and beautiful area in the whole city.',
    passageTranslated: 'Қисми кӯҳнаи шаҳри мо ҷои аҷоиб барои сайр аст. Аз майдони марказӣ оғоз кун, ки дар он ҷо ҳайкали баланд ва фаввора ҳаст. Дар қад-қади кӯчаи танг аз назди нонвойхона ва мағозаи китоб гузар. Дар кунҷ ба чап гард ва аз пули хурд гузар. Аз тарафи рост масҷиди зеборо мебинӣ ва рӯ ба рӯи он қасри таърихиро. Рост идома деҳ, то ба осорхона расӣ. Он дар байни китобхона ва манораи кӯҳна аст. Дар ин ҷо ҳаракати нақлиёт кам аст, зеро мошинҳо ворид шуда наметавонанд. Ин осоиштатарин ва зеботарин ноҳияи тамоми шаҳр аст.',
    questions: [
      { question:'Where does the walk start?', questionTranslated:'Сайр аз куҷо оғоз мешавад?', options:['The main square','The museum','The bridge'], correctIndex:0, explanation:'Start at the main square.' },
      { question:'What do you pass on the narrow street?', questionTranslated:'Дар кӯчаи танг аз назди чӣ мегузарӣ?', options:['The bakery and bookshop','A stadium','A factory'], correctIndex:0, explanation:'past the bakery and the bookshop.' },
      { question:'What is opposite the mosque?', questionTranslated:'Рӯ ба рӯи масҷид чӣ аст?', options:['A historic palace','A bank','A park'], correctIndex:0, explanation:'opposite it, a historic palace.' },
      { question:'Where is the museum?', questionTranslated:'Осорхона дар куҷост?', options:['Between the library and an old tower','On the square','Behind the mosque'], correctIndex:0, explanation:'between the library and an old tower.' },
      { question:'Why is there little traffic?', questionTranslated:'Чаро ҳаракати нақлиёт кам аст?', options:['Cars cannot enter','It is night','No roads'], correctIndex:0, explanation:'cars cannot enter.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 6 тайёр.');
