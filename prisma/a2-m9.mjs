import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 8, title: 'Module 9: Hobbies And Free Time', titleTranslated: 'Модули 9: Ҳобиҳо ва Вақти холӣ',
  emoji: '🎨', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Hobbies And Pastimes', tt: 'Дарси 1: Ҳобиҳо ва Машғулиятҳо', emoji: '🎯', words: [
      W('Painting','/ˈpeɪntɪŋ/','пейнтинг','Рассомӣ / нақшакашӣ','🖌️','Painting is my favourite hobby.','Рассомӣ ҳобии дӯстдоштаи ман аст.','noun'),
      W('Drawing','/ˈdrɔːɪŋ/','дроинг','Расмкашӣ','✏️','He is good at drawing.','Ӯ дар расмкашӣ моҳир аст.','noun'),
      W('Photography','/fəˈtɒɡrəfi/','фотографи','Аксбардорӣ','📷','I love photography.','Ман аксбардориро дӯст медорам.','noun'),
      W('Gardening','/ˈɡɑːdnɪŋ/','гарднинг','Боғдорӣ','🌱','My grandmother enjoys gardening.','Бибиям аз боғдорӣ лаззат мебарад.','noun'),
      W('Fishing','/ˈfɪʃɪŋ/','фишинг','Моҳидорӣ','🎣','We go fishing on Sundays.','Мо рӯзҳои якшанбе ба моҳидорӣ меравем.','noun'),
      W('Knitting','/ˈnɪtɪŋ/','нитинг','Бофандагӣ','🧶','She likes knitting warm socks.','Ӯ бофтани ҷӯробҳои гармро дӯст медорад.','noun'),
      W('Collecting','/kəˈlektɪŋ/','колектинг','Ҷамъоварӣ','🪙','Collecting coins is interesting.','Ҷамъоварии тангаҳо ҷолиб аст.','noun'),
      W('Chess','/tʃes/','чес','Шоҳмот','♟️','My father plays chess well.','Падарам шоҳмотро хуб бозӣ мекунад.','noun'),
      W('Cycling','/ˈsaɪklɪŋ/','сайклинг','Велосипедронӣ','🚴','Cycling keeps me fit.','Велосипедронӣ маро солим нигоҳ медорад.','noun'),
      W('Cooking','/ˈkʊkɪŋ/','кукинг','Пухтупаз','🍳','She is interested in cooking.','Ӯ ба пухтупаз шавқ дорад.','noun'),
    ]},
    { title: 'Lesson 2: Sports', tt: 'Дарси 2: Варзишҳо', emoji: '⚽', words: [
      W('Basketball','/ˈbɑːskɪtbɔːl/','баскетбол','Баскетбол','🏀','They play basketball after school.','Онҳо баъди мактаб баскетбол бозӣ мекунанд.','noun'),
      W('Volleyball','/ˈvɒlibɔːl/','волейбол','Волейбол','🏐','Volleyball is popular in summer.','Волейбол дар тобистон машҳур аст.','noun'),
      W('Boxing','/ˈbɒksɪŋ/','боксинг','Мушобозӣ / бокс','🥊','Boxing is a hard sport.','Бокс варзиши душвор аст.','noun'),
      W('Skiing','/ˈskiːɪŋ/','скиинг','Лижаронӣ','⛷️','We go skiing in winter.','Мо дар зимистон ба лижаронӣ меравем.','noun'),
      W('Skating','/ˈskeɪtɪŋ/','скейтинг','Яхмолакбозӣ','⛸️','Ice skating is fun.','Яхмолакбозӣ шавқовар аст.','noun'),
      W('Climbing','/ˈklaɪmɪŋ/','клаймбинг','Кӯҳнавардӣ','🧗','Rock climbing is exciting.','Кӯҳнавардӣ ҳаяҷоновар аст.','noun'),
      W('Wrestling','/ˈreslɪŋ/','реслинг','Гӯштингирӣ','🤼','Wrestling is a traditional sport.','Гӯштингирӣ варзиши анъанавӣ аст.','noun'),
      W('Gymnastics','/dʒɪmˈnæstɪks/','ҷимнастикс','Гимнастика','🤸','She trains in gymnastics.','Ӯ дар гимнастика машқ мекунад.','noun'),
      W('Referee','/ˌrefəˈriː/','рефери','Ҳакам / довар','🧑‍⚖️','The referee stopped the game.','Ҳакам бозиро боздошт.','noun'),
      W('Coach','/kəʊtʃ/','коуч','Мураббӣ','📣','The coach trains the players.','Мураббӣ бозигаронро машқ медиҳад.','noun'),
    ]},
    { title: 'Lesson 3: Music And Arts', tt: 'Дарси 3: Мусиқӣ ва Санъат', emoji: '🎵', words: [
      W('Guitar','/ɡɪˈtɑː/','гитар','Гитара','🎸','He plays the guitar.','Ӯ гитара менавозад.','noun'),
      W('Piano','/piˈænəʊ/','пиано','Фортепиано','🎹','She learns the piano.','Ӯ фортепианоро меомӯзад.','noun'),
      W('Drums','/drʌmz/','драмз','Барабанҳо','🥁','My brother plays the drums.','Бародарам барабан менавозад.','noun'),
      W('Violin','/ˌvaɪəˈlɪn/','вайолин','Скрипка','🎻','The violin has a beautiful sound.','Скрипка садои зебо дорад.','noun'),
      W('Concert','/ˈkɒnsət/','консерт','Консерт','🎤','We went to a rock concert.','Мо ба консерти рок рафтем.','noun'),
      W('Theatre','/ˈθɪətə/','сиатер','Театр','🎭','The play is at the theatre.','Намоиш дар театр аст.','noun'),
      W('Instrument','/ˈɪnstrəmənt/','инструмент','Асбоби мусиқӣ','🎼','Can you play an instrument?','Ту асбоби мусиқӣ навохта метавонӣ?','noun'),
      W('Choir','/ˈkwaɪə/','квайер','Хор / сарояндагон','🎶','She sings in a choir.','Ӯ дар хор месарояд.','noun'),
      W('Audience','/ˈɔːdiəns/','одиенс','Тамошобинон','👏','The audience clapped loudly.','Тамошобинон баланд карсак заданд.','noun'),
      W('Stage','/steɪdʒ/','стейҷ','Саҳна','🎬','The singer came onto the stage.','Сароянда ба саҳна баромад.','noun'),
    ]},
    { title: 'Lesson 4: Games And Media', tt: 'Дарси 4: Бозиҳо ва Медиа', emoji: '🎮', words: [
      W('Puzzle','/ˈpʌzl/','пазл','Ҷумбоқ / муаммо','🧩','This puzzle is difficult.','Ин муаммо душвор аст.','noun'),
      W('Cards','/kɑːdz/','кардз','Қартаҳо','🃏','We play cards in the evening.','Мо шом қарта бозӣ мекунем.','noun'),
      W('Comedy','/ˈkɒmədi/','комеди','Мазҳака / комедия','😂','I love watching comedy.','Ман тамошои комедияро дӯст медорам.','noun'),
      W('Cartoon','/kɑːˈtuːn/','картун','Мультфилм','📺','Children love cartoons.','Кӯдакон мультфилмҳоро дӯст медоранд.','noun'),
      W('Novel','/ˈnɒvl/','новел','Роман','📕','She is reading a long novel.','Ӯ романи дарозро мехонад.','noun'),
      W('Magazine','/ˌmæɡəˈziːn/','магазин','Маҷалла','📰','I buy a sports magazine.','Ман маҷаллаи варзишӣ мехарам.','noun'),
      W('Podcast','/ˈpɒdkɑːst/','подкаст','Подкаст','🎧','He listens to a podcast.','Ӯ подкаст гӯш мекунад.','noun'),
      W('Festival','/ˈfestɪvl/','фестивал','Ҷашнвора / фестивал','🎉','The music festival is in July.','Фестивали мусиқӣ дар моҳи июл аст.','noun'),
      W('Hobby','/ˈhɒbi/','ҳоби','Ҳобӣ / машғулият','🎯','What is your favourite hobby?','Ҳобии дӯстдоштаи ту чист?','noun'),
      W('Fan','/fæn/','фэн','Мухлис / тарафдор','📣','He is a big football fan.','Ӯ мухлиси калони футбол аст.','noun'),
    ]},
    { title: 'Lesson 5: Interests And Feelings', tt: 'Дарси 5: Шавқу ҳиссиёт', emoji: '😍', words: [
      W('Enjoy','/ɪnˈdʒɔɪ/','инҷой','Лаззат бурдан','😊','I enjoy playing music.','Ман аз навохтани мусиқӣ лаззат мебарам.','verb'),
      W('Prefer','/prɪˈfɜː/','прифёр','Бартарӣ додан','👍','I prefer reading to watching TV.','Ман хонданро аз телевизор бартарӣ медиҳам.','verb'),
      W('Practise','/ˈpræktɪs/','практис','Машқ кардан','🔁','You must practise every day.','Ту бояд ҳар рӯз машқ кунӣ.','verb'),
      W('Join','/dʒɔɪn/','ҷойн','Ҳамроҳ шудан','🤝','I want to join a chess club.','Ман мехоҳам ба маҳфили шоҳмот ҳамроҳ шавам.','verb'),
      W('Exciting','/ɪkˈsaɪtɪŋ/','иксайтинг','Ҳаяҷоновар','🤩','The game was very exciting.','Бозӣ хеле ҳаяҷоновар буд.','adjective'),
      W('Boring','/ˈbɔːrɪŋ/','боринг','Дилгиркунанда','🥱','This film is boring.','Ин филм дилгиркунанда аст.','adjective'),
      W('Keen','/kiːn/','кин','Шавқманд','🔥','She is keen on tennis.','Ӯ ба теннис шавқманд аст.','adjective'),
      W('Talented','/ˈtæləntɪd/','талентид','Боистеъдод','🌟','He is a talented musician.','Ӯ навозандаи боистеъдод аст.','adjective'),
      W('Amateur','/ˈæmətə/','аматер','Ҳаваскор','🎨','I am an amateur painter.','Ман рассоми ҳаваскор ҳастам.','noun'),
      W('Curious','/ˈkjʊəriəs/','кюриес','Кунҷков','🔍','She is curious about art.','Ӯ ба санъат кунҷков аст.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Gerunds (verb + -ing)', lessonTitleTg: 'Дарси 6: Грамматика — Gerund (феъл + -ing)',
      title: 'Verbs + Gerund', titleTranslated: 'Феълҳо + -ing (like doing)', emoji: '🎨',
      explanation:
`Баъзе феълҳо баъди худ феъли дигарро дар шакли **-ing** (gerund) мегиранд.
Пас аз: **like, love, enjoy, hate, don't mind, prefer, finish, start, stop**:
- *I **enjoy reading**.* (Ман аз хондан лаззат мебарам)
- *She **loves dancing**.*
- *They **finished playing**.*

Gerund инчунин ҳамчун **subject** меояд: ***Swimming** is good for health.*
Диққат: *I enjoy **to read*** ғалат аст → *I enjoy **reading**.*`,
      rules: [
        { pattern: 'like/love/enjoy/hate + V-ing', note: 'I enjoy cooking.' },
        { pattern: 'finish/start/stop + V-ing', note: 'She stopped smoking.' },
        { pattern: 'V-ing ҳамчун subject', note: 'Running is healthy.' },
        { pattern: 'prefer + V-ing', note: 'I prefer walking.' },
      ],
      examples: [
        { sentence: 'I enjoy playing the guitar.', translation: 'Ман аз навохтани гитара лаззат мебарам.', highlight: 'enjoy playing' },
        { sentence: 'She loves dancing.', translation: 'Ӯ рақсиданро дӯст медорад.', highlight: 'loves dancing' },
        { sentence: 'They hate waiting in a queue.', translation: 'Онҳо дар навбат интизор шуданро бад мебинанд.', highlight: 'hate waiting' },
        { sentence: 'Swimming is good exercise.', translation: 'Шиноварӣ машқи хуб аст.', highlight: 'Swimming' },
        { sentence: 'He finished doing his homework.', translation: 'Ӯ кардани вазифаашро тамом кард.', highlight: 'finished doing' },
      ],
      exercises: [
        { type:'choose', prompt:'I enjoy ___ football.', promptTranslated:'Ман аз футболбозӣ лаззат мебарам.', options:['playing','play','to play','plays'], answer:'playing', explanation:'enjoy + V-ing.' },
        { type:'choose', prompt:'She loves ___ books.', promptTranslated:'Ӯ хонданро дӯст медорад.', options:['reading','read','to read','reads'], answer:'reading', explanation:'love + V-ing.' },
        { type:'choose', prompt:'___ is good for your health.', promptTranslated:'Давидан барои саломатӣ хуб аст.', options:['Running','Run','To run','Runs'], answer:'Running', explanation:'gerund ҳамчун subject.' },
        { type:'choose', prompt:'They finished ___ the room.', promptTranslated:'Онҳо тоза кардани ҳуҷраро тамом карданд.', options:['cleaning','clean','to clean','cleans'], answer:'cleaning', explanation:'finish + V-ing.' },
        { type:'fill_blank', prompt:'He doesn\'t mind ___ (wait).', promptTranslated:'Ӯ интизор шуданро бад намебинад.', answer:'waiting', explanation:"don't mind + V-ing." },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман аз аксбардорӣ лаззат мебарам.', options:['I','photography','enjoy'], answer:'I enjoy photography.', explanation:'I enjoy photography.' },
        { type:'transform', prompt:'Ислоҳ кунед: I like to swimming.', promptTranslated:'like + V-ing (ё to swim).', answer:'I like swimming.', explanation:'like swimming.' },
        { type:'transform', prompt:'Ислоҳ кунед: She enjoys to dance.', promptTranslated:'enjoy + V-ing.', answer:'She enjoys dancing.', explanation:'enjoy dancing.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Infinitives (verb + to)', lessonTitleTg: 'Дарси 7: Грамматика — Infinitive (феъл + to)',
      title: 'Verbs + Infinitive (to + verb)', titleTranslated: 'Феълҳо + to (want to do)', emoji: '🎯',
      explanation:
`Баъзе феълҳо баъди худ **to + феъл** (infinitive) мегиранд.
Пас аз: **want, need, would like, hope, decide, plan, learn, try, promise**:
- *I **want to learn** the guitar.* (Ман мехоҳам гитараро омӯзам)
- *She **decided to join** a club.*
- *They **hope to win** the match.*

Диққат: *I want **playing*** ғалат аст → *I want **to play**.*
Феълҳои **like, love, hate** ҳам бо **-ing** ва ҳам бо **to** кор мекунанд.`,
      rules: [
        { pattern: 'want/need/would like + to + феъл', note: 'I want to go.' },
        { pattern: 'decide/plan/hope + to + феъл', note: 'She decided to stay.' },
        { pattern: 'learn/try/promise + to + феъл', note: 'He learned to swim.' },
        { pattern: 'like/love ± to ё -ing', note: 'I like to read / reading.' },
      ],
      examples: [
        { sentence: 'I want to learn the piano.', translation: 'Ман мехоҳам фортепианоро омӯзам.', highlight: 'want to learn' },
        { sentence: 'She decided to join the team.', translation: 'Ӯ қарор дод, ки ба даста ҳамроҳ шавад.', highlight: 'decided to join' },
        { sentence: 'They hope to win the game.', translation: 'Онҳо умед доранд, ки бозиро баранд.', highlight: 'hope to win' },
        { sentence: 'He is trying to play better.', translation: 'Ӯ кӯшиш мекунад, ки беҳтар бозӣ кунад.', highlight: 'trying to play' },
        { sentence: 'We would like to see the concert.', translation: 'Мо мехоҳем консертро бинем.', highlight: 'would like to see' },
      ],
      exercises: [
        { type:'choose', prompt:'I want ___ the guitar.', promptTranslated:'Ман мехоҳам гитараро омӯзам.', options:['to learn','learning','learn','learns'], answer:'to learn', explanation:'want + to + феъл.' },
        { type:'choose', prompt:'She decided ___ a chess club.', promptTranslated:'Ӯ қарор дод, ки ба маҳфили шоҳмот ҳамроҳ шавад.', options:['to join','joining','join','joins'], answer:'to join', explanation:'decide + to.' },
        { type:'choose', prompt:'They hope ___ the match.', promptTranslated:'Онҳо умед доранд, ки бозиро баранд.', options:['to win','winning','win','wins'], answer:'to win', explanation:'hope + to.' },
        { type:'choose', prompt:'He is learning ___ .', promptTranslated:'Ӯ шиноварӣ карданро меомӯзад.', options:['to swim','swimming','swim','swims'], answer:'to swim', explanation:'learn + to.' },
        { type:'fill_blank', prompt:'I need ___ (practise) more.', promptTranslated:'Ба ман бештар машқ кардан лозим аст.', answer:'to practise', explanation:'need + to.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман мехоҳам ба маҳфил ҳамроҳ шавам.', options:['I','to','want','the','join','club'], answer:'I want to join the club.', explanation:'I want to join the club.' },
        { type:'transform', prompt:'Ислоҳ кунед: I want playing tennis.', promptTranslated:'want + to.', answer:'I want to play tennis.', explanation:'want to play.' },
        { type:'transform', prompt:'Ислоҳ кунед: She hopes winning.', promptTranslated:'hope + to.', answer:'She hopes to win.', explanation:'hope to win.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — My Free Time', lessonTitleTg: 'Дарси 8: Шунавоӣ — Вақти холии ман',
    title: 'My Free Time', titleTranslated: 'Вақти холии ман', emoji: '🎨',
    passage: 'Hi, I am Farhod. In my free time I love doing many things. I really enjoy playing the guitar and I practise every evening. At weekends I like going cycling with my friends. I am also keen on photography, so I often take my camera to the mountains. My sister prefers reading and painting; she is very talented. This year I decided to join a music club because I want to learn the piano too. I think having a hobby is important because it makes life more exciting and helps you relax.',
    passageTranslated: 'Салом, ман Фарҳод. Дар вақти холӣ ман бисёр корҳоро дӯст медорам. Ман аз навохтани гитара воқеан лаззат мебарам ва ҳар шом машқ мекунам. Дар рӯзҳои истироҳат ман бо дӯстонам велосипедрониро дӯст медорам. Ман ба аксбардорӣ низ шавқманд ҳастам, бинобар ин аксаран камераамро ба кӯҳҳо мебарам. Хоҳарам хондан ва рассомиро бартарӣ медиҳад; ӯ хеле боистеъдод аст. Имсол ман қарор додам, ки ба маҳфили мусиқӣ ҳамроҳ шавам, зеро мехоҳам фортепианоро низ омӯзам. Ба фикрам, доштани ҳобӣ муҳим аст, зеро он ҳаётро ҳаяҷоновартар мекунад ва ба ором шудан кӯмак мерасонад.',
    questions: [
      { question:'What does Farhod practise every evening?', questionTranslated:'Фарҳод ҳар шом чиро машқ мекунад?', options:['The guitar','The piano','Football'], correctIndex:0, explanation:'playing the guitar and I practise every evening.' },
      { question:'What does he do at weekends?', questionTranslated:'Ӯ дар рӯзҳои истироҳат чӣ мекунад?', options:['Goes cycling','Sleeps','Works'], correctIndex:0, explanation:'like going cycling with my friends.' },
      { question:'What is he keen on?', questionTranslated:'Ӯ ба чӣ шавқманд аст?', options:['Photography','Cooking','Fishing'], correctIndex:0, explanation:'keen on photography.' },
      { question:'What does his sister prefer?', questionTranslated:'Хоҳараш чиро бартарӣ медиҳад?', options:['Reading and painting','Boxing','Skiing'], correctIndex:0, explanation:'prefers reading and painting.' },
      { question:'Why did he join a music club?', questionTranslated:'Чаро ӯ ба маҳфили мусиқӣ ҳамроҳ шуд?', options:['He wants to learn the piano','To make friends','To earn money'], correctIndex:0, explanation:'because I want to learn the piano too.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — What Do You Like Doing?', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Чӣ кор карданро дӯст медорӣ?',
    title: 'What Do You Like Doing?', titleTranslated: 'Чӣ кор карданро дӯст медорӣ?', emoji: '💬',
    scenario: 'Ду дӯст дар бораи ҳобӣ ва вақти холии якдигар сӯҳбат мекунанд.',
    lines: [
      { speaker:'Madina', text:'What do you like doing in your free time?', translation:'Дар вақти холӣ чӣ кор карданро дӯст медорӣ?', isUser:false },
      { speaker:'You', text:'I enjoy painting and playing chess.', translation:'Ман рассомӣ ва шоҳмотбозиро дӯст медорам.', isUser:true },
      { speaker:'Madina', text:'Really? I love chess too! Do you play often?', translation:'Ҷиддӣ? Ман ҳам шоҳмотро дӯст медорам! Аксаран бозӣ мекунӣ?', isUser:false },
      { speaker:'You', text:'Yes, but I want to practise more.', translation:'Бале, вале мехоҳам бештар машқ кунам.', isUser:true },
      { speaker:'Madina', text:'Would you like to join our chess club?', translation:'Мехоҳӣ ба маҳфили шоҳмоти мо ҳамроҳ шавӣ?', isUser:false },
      { speaker:'You', text:'That sounds great! When do you meet?', translation:'Ин олӣ садо медиҳад! Кай ҷамъ мешавед?', isUser:true },
      { speaker:'Madina', text:'Every Saturday afternoon at the library.', translation:'Ҳар шанбе баъдиаззӯҳр дар китобхона.', isUser:false },
      { speaker:'You', text:'Perfect. I would love to come.', translation:'Олӣ. Ман бо камоли майл меоям.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — A Family Of Hobbies', lessonTitleTg: 'Дарси 10: Хониш — Оилаи пур аз ҳобӣ',
    title: 'A Family Of Hobbies', titleTranslated: 'Оилаи пур аз ҳобӣ', emoji: '👨‍👩‍👧‍👦',
    passage: 'The Nazarov family has many different hobbies. The father loves fishing and often goes to the river at the weekend. The mother enjoys gardening and knitting; she likes making warm clothes for the family. Their son, Bek, is keen on sport. He plays basketball and hopes to become a professional player. Their daughter, Lola, is very creative. She enjoys drawing and wants to learn photography. In the evening, the whole family likes playing cards or watching a film together. They believe that hobbies bring the family closer and make everyone happier.',
    passageTranslated: 'Оилаи Назаров ҳобиҳои гуногуни зиёд дорад. Падар моҳидориро дӯст медорад ва аксаран дар рӯзҳои истироҳат ба дарё меравад. Модар аз боғдорӣ ва бофандагӣ лаззат мебарад; ӯ барои оила либоси гарм сохтанро дӯст медорад. Писари онҳо, Бек, ба варзиш шавқманд аст. Ӯ баскетбол бозӣ мекунад ва умед дорад, ки бозигари касбӣ шавад. Духтари онҳо, Лола, хеле эҷодкор аст. Ӯ расмкаширо дӯст медорад ва мехоҳад аксбардориро омӯзад. Шом тамоми оила қартабозӣ ё якҷоя тамошои филмро дӯст медорад. Онҳо боварӣ доранд, ки ҳобиҳо оиларо наздиктар мекунанд ва ҳамаро хушбахттар месозанд.',
    questions: [
      { question:'What does the father love?', questionTranslated:'Падар чиро дӯст медорад?', options:['Fishing','Painting','Boxing'], correctIndex:0, explanation:'The father loves fishing.' },
      { question:'What does the mother enjoy?', questionTranslated:'Модар аз чӣ лаззат мебарад?', options:['Gardening and knitting','Skiing','Cycling'], correctIndex:0, explanation:'enjoys gardening and knitting.' },
      { question:'What does Bek hope to become?', questionTranslated:'Бек умед дорад кӣ шавад?', options:['A professional player','A doctor','A painter'], correctIndex:0, explanation:'hopes to become a professional player.' },
      { question:'What does Lola want to learn?', questionTranslated:'Лола чиро омӯхтан мехоҳад?', options:['Photography','Cooking','Chess'], correctIndex:0, explanation:'wants to learn photography.' },
      { question:'What do hobbies do for the family?', questionTranslated:'Ҳобиҳо барои оила чӣ мекунанд?', options:['Bring them closer','Cost money','Waste time'], correctIndex:0, explanation:'hobbies bring the family closer.' },
    ],
  },
  review: {
    passage: 'Sitora is a university student who loves being busy. During the week she studies hard, but in her free time she enjoys many activities. She started learning the violin two years ago and now plays in a small orchestra. She also likes writing short stories and hopes to publish a book one day. At the weekend she prefers spending time outside: she goes climbing or cycling with her friends. Sitora hates staying at home and doing nothing. "Life is short," she says, "so I want to try everything." Her friends admire her energy and her many talents.',
    passageTranslated: 'Ситора донишҷӯест, ки серкор буданро дӯст медорад. Дар давоми ҳафта ӯ бо ҷидду ҷаҳд таҳсил мекунад, вале дар вақти холӣ аз бисёр машғулиятҳо лаззат мебарад. Ӯ ду сол пеш омӯхтани скрипкаро оғоз кард ва ҳоло дар оркестри хурд менавозад. Ӯ инчунин навиштани ҳикояҳои кӯтоҳро дӯст медорад ва умед дорад, ки рӯзе китоб нашр кунад. Дар рӯзҳои истироҳат ӯ вақтро дар берун гузаронданро бартарӣ медиҳад: бо дӯстонаш ба кӯҳнавардӣ ё велосипедронӣ меравад. Ситора дар хона монда, бекор нишастанро бад мебинад. «Умр кӯтоҳ аст», мегӯяд ӯ, «бинобар ин мехоҳам ҳама чизро санҷам.» Дӯстонаш ба ғайрат ва истеъдодҳои зиёди ӯ қоил мешаванд.',
    questions: [
      { question:'When did Sitora start the violin?', questionTranslated:'Ситора скрипкаро кай оғоз кард?', options:['Two years ago','Last week','As a child'], correctIndex:0, explanation:'started learning the violin two years ago.' },
      { question:'What does she hope to do one day?', questionTranslated:'Ӯ умед дорад рӯзе чӣ кунад?', options:['Publish a book','Buy a house','Win a race'], correctIndex:0, explanation:'hopes to publish a book one day.' },
      { question:'What does she prefer at the weekend?', questionTranslated:'Ӯ дар рӯзҳои истироҳат чиро бартарӣ медиҳад?', options:['Spending time outside','Sleeping','Watching TV'], correctIndex:0, explanation:'prefers spending time outside.' },
      { question:'What does she hate?', questionTranslated:'Ӯ чиро бад мебинад?', options:['Staying at home doing nothing','Studying','Sport'], correctIndex:0, explanation:'hates staying at home and doing nothing.' },
      { question:'Why does she want to try everything?', questionTranslated:'Чаро ӯ мехоҳад ҳама чизро санҷад?', options:['Life is short','She is rich','She is bored'], correctIndex:0, explanation:'Life is short.' },
    ],
  },
  exam: {
    passage: 'Hobbies are more than just a way to pass the time. Doctors and teachers say that having a hobby is very good for people. First, hobbies help us relax and forget about stress. Someone who enjoys painting or gardening can feel calm and happy. Second, hobbies help us learn new skills. A person who decides to learn a musical instrument also improves their memory. Third, many hobbies help us make new friends, because we meet people who like doing the same things. It does not matter if you prefer reading quietly or playing team sports. The important thing is to find something you love and to keep doing it.',
    passageTranslated: 'Ҳобиҳо бештар аз танҳо як роҳи гузаронидани вақт ҳастанд. Духтурон ва муаллимон мегӯянд, ки доштани ҳобӣ барои одамон хеле хуб аст. Аввал, ҳобиҳо ба мо кӯмак мекунанд, ки ором шавем ва дар бораи стресс фаромӯш кунем. Касе, ки аз рассомӣ ё боғдорӣ лаззат мебарад, метавонад ором ва хушбахт бошад. Дуюм, ҳобиҳо ба мо кӯмак мекунанд, ки малакаҳои нав омӯзем. Шахсе, ки қарор мекунад асбоби мусиқӣ омӯзад, хотираашро низ беҳтар мекунад. Сеюм, бисёр ҳобиҳо ба мо кӯмак мекунанд, ки дӯстони нав пайдо кунем, зеро мо бо одамоне вомехӯрем, ки ҳамон корҳоро дӯст медоранд. Фарқ надорад, ки ту хомӯшона хонданро бартарӣ медиҳӣ ё варзиши дастаӣ. Муҳим ин аст, ки чизеро, ки дӯст медорӣ, ёбӣ ва онро идома диҳӣ.',
    questions: [
      { question:'How do hobbies help with stress?', questionTranslated:'Ҳобиҳо чӣ тавр бо стресс кӯмак мекунанд?', options:['They help us relax','They cost money','They make us tired'], correctIndex:0, explanation:'hobbies help us relax and forget about stress.' },
      { question:'What does learning an instrument improve?', questionTranslated:'Омӯхтани асбоби мусиқӣ чиро беҳтар мекунад?', options:['Memory','Weight','Height'], correctIndex:0, explanation:'also improves their memory.' },
      { question:'Why do hobbies help us make friends?', questionTranslated:'Чаро ҳобиҳо ба дӯстёбӣ кӯмак мекунанд?', options:['We meet people with the same interests','They are expensive','They are boring'], correctIndex:0, explanation:'we meet people who like doing the same things.' },
      { question:'Does it matter which hobby you choose?', questionTranslated:'Кадом ҳобиро интихоб кардан аҳамият дорад?', options:['No, quiet or active is fine','Yes, only sport','Yes, only reading'], correctIndex:0, explanation:'It does not matter if you prefer reading or team sports.' },
      { question:'What is the important thing?', questionTranslated:'Чизи муҳим чист?', options:['Find something you love and keep doing it','Earn money','Be the best'], correctIndex:0, explanation:'find something you love and to keep doing it.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 9 тайёр.');
