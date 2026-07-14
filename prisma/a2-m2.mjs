import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 1, title: 'Module 2: Describing And Comparing', titleTranslated: 'Модули 2: Тасвир ва Муқоиса',
  emoji: '👤', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Appearance', tt: 'Дарси 1: Зоҳир', emoji: '🧍', words: [
      W('Cute','/kjuːt/','кют','Ширин / зебоча','🥰','The baby is very cute.','Кӯдак хеле ширин аст.','adjective'),
      W('Slim','/slɪm/','слим','Лоғар / борик','🧍‍♀️','She is tall and slim.','Ӯ қадбаланд ва лоғар аст.','adjective'),
      W('Bald','/bɔːld/','болд','Кал','👨‍🦲','My uncle is bald.','Тағоям кал аст.','adjective'),
      W('Curly','/ˈkɜːli/','кёрли','Ҷингила','👩‍🦱','She has curly hair.','Ӯ мӯи ҷингила дорад.','adjective'),
      W('Wavy','/ˈweɪvi/','вейви','Мавҷнок (мӯй)','💇','He has wavy hair.','Ӯ мӯи мавҷнок дорад.','adjective'),
      W('Handsome','/ˈhænsəm/','ҳэнсем','Хушрӯй (мард)','🤵','He is a handsome man.','Ӯ марди хушрӯй аст.','adjective'),
      W('Pretty','/ˈprɪti/','прити','Зебо (зан)','👩','She is a pretty girl.','Ӯ духтари зебо аст.','adjective'),
      W('Beard','/bɪəd/','бирд','Риш','🧔','My grandfather has a grey beard.','Бобоям риши хокистарӣ дорад.','noun'),
      W('Moustache','/məˈstɑːʃ/','местааш','Мӯйлаб','👨','He has a black moustache.','Ӯ мӯйлаби сиёҳ дорад.','noun'),
      W('Blonde','/blɒnd/','блонд','Мӯймалла','👱','Her sister is blonde.','Хоҳараш мӯймалла аст.','adjective'),
    ]},
    { title: 'Lesson 2: Personality', tt: 'Дарси 2: Хислат', emoji: '😊', words: [
      W('Friendly','/ˈfrendli/','френдли','Дӯстона','🤗','Our neighbours are friendly.','Ҳамсоягони мо дӯстонаанд.','adjective'),
      W('Honest','/ˈɒnɪst/','онест','Ростқавл','🙂','He is an honest man.','Ӯ марди ростқавл аст.','adjective'),
      W('Lazy','/ˈleɪzi/','лейзи','Танбал','😴','Don\'t be lazy!','Танбал набош!','adjective'),
      W('Hardworking','/ˌhɑːdˈwɜːkɪŋ/','ҳардуоркинг','Меҳнатдӯст','💪','She is a hardworking student.','Ӯ донишҷӯи меҳнатдӯст аст.','adjective'),
      W('Shy','/ʃaɪ/','шай','Шармгин','😳','My little brother is shy.','Бародари хурдам шармгин аст.','adjective'),
      W('Brave','/breɪv/','брейв','Далер','🦁','The firefighter was very brave.','Оташнишон хеле далер буд.','adjective'),
      W('Generous','/ˈdʒenərəs/','ҷенерес','Саховатманд','🎁','He is generous with his friends.','Ӯ бо дӯстонаш саховатманд аст.','adjective'),
      W('Polite','/pəˈlaɪt/','полайт','Боадаб','🙇','Always be polite to elders.','Ба калонсолон ҳамеша боадаб бош.','adjective'),
      W('Rude','/ruːd/','руд','Дағал / бетарбия','😠','That was a rude answer.','Ин ҷавоби дағал буд.','adjective'),
      W('Clever','/ˈklevə/','клевер','Боақл / зирак','🧠','She is a clever girl.','Ӯ духтари зирак аст.','adjective'),
    ]},
    { title: 'Lesson 3: Describing Things', tt: 'Дарси 3: Тасвири ашё', emoji: '🔍', words: [
      W('Modern','/ˈmɒdən/','модерн','Муосир','🏢','They live in a modern house.','Онҳо дар хонаи муосир зиндагӣ мекунанд.','adjective'),
      W('Old-fashioned','/ˌəʊldˈfæʃənd/','олд-фэшенд','Кӯҳна / аз мӯд рафта','📻','His clothes are old-fashioned.','Либосҳои ӯ аз мӯд рафтаанд.','adjective'),
      W('Popular','/ˈpɒpjələ/','попюлер','Машҳур','🌟','This song is very popular.','Ин суруд хеле машҳур аст.','adjective'),
      W('Dangerous','/ˈdeɪndʒərəs/','дейнҷерес','Хатарнок','⚠️','Fast driving is dangerous.','Ронандагии тез хатарнок аст.','adjective'),
      W('Useful','/ˈjuːsfʊl/','юсфул','Муфид','🛠️','This app is very useful.','Ин барнома хеле муфид аст.','adjective'),
      W('Useless','/ˈjuːsləs/','юслес','Бефоида','🚯','The old phone is useless now.','Телефони кӯҳна ҳоло бефоида аст.','adjective'),
      W('Huge','/hjuːdʒ/','ҳюҷ','Бузург / азим','🐘','They have a huge garden.','Онҳо боғи азим доранд.','adjective'),
      W('Tiny','/ˈtaɪni/','тайни','Хеле хурд','🐜','It was a tiny room.','Ин ҳуҷраи хеле хурд буд.','adjective'),
      W('Wide','/waɪd/','уайд','Васеъ','↔️','The river is very wide.','Дарё хеле васеъ аст.','adjective'),
      W('Narrow','/ˈnærəʊ/','нэроу','Танг','🚶','It is a narrow street.','Ин кӯчаи танг аст.','adjective'),
    ]},
    { title: 'Lesson 4: Qualities', tt: 'Дарси 4: Сифатҳо', emoji: '⭐', words: [
      W('Fresh','/freʃ/','фреш','Тару тоза','🥬','I like fresh vegetables.','Ман сабзавоти тару тозаро дӯст медорам.','adjective'),
      W('Dry','/draɪ/','драй','Хушк','🏜️','The weather is hot and dry.','Обу ҳаво гарм ва хушк аст.','adjective'),
      W('Wet','/wet/','уэт','Тар / нам','💧','My clothes are wet.','Либосҳоям тар шудаанд.','adjective'),
      W('Soft','/sɒft/','софт','Нарм','🧸','The pillow is very soft.','Болишт хеле нарм аст.','adjective'),
      W('Sharp','/ʃɑːp/','шарп','Тез (корд)','🔪','Be careful, the knife is sharp.','Эҳтиёт шав, корд тез аст.','adjective'),
      W('Smooth','/smuːð/','смуз','Ҳамвор','🛣️','The road is smooth.','Роҳ ҳамвор аст.','adjective'),
      W('Shiny','/ˈʃaɪni/','шайни','Дурахшон','✨','His new car is shiny.','Мошини нави ӯ дурахшон аст.','adjective'),
      W('Loud','/laʊd/','лауд','Баланд (овоз)','🔊','The music was too loud.','Мусиқӣ хеле баланд буд.','adjective'),
      W('Quiet','/ˈkwaɪət/','квайет','Ором / хомӯш','🤫','Please be quiet in the library.','Лутфан дар китобхона ором бош.','adjective'),
      W('Empty','/ˈempti/','эмпти','Холӣ','📭','The box is empty.','Қуттӣ холӣ аст.','adjective'),
    ]},
    { title: 'Lesson 5: People Around Us', tt: 'Дарси 5: Одамони атроф', emoji: '👥', words: [
      W('Neighbour','/ˈneɪbə/','нейбер','Ҳамсоя','🏘️','My neighbour is a doctor.','Ҳамсояи ман духтур аст.','noun'),
      W('Colleague','/ˈkɒliːɡ/','колиг','Ҳамкор','💼','She is my colleague at work.','Ӯ дар кор ҳамкори ман аст.','noun'),
      W('Stranger','/ˈstreɪndʒə/','стрейнҷер','Бегона','🚶','Don\'t talk to strangers.','Бо бегонаҳо гап назан.','noun'),
      W('Guest','/ɡest/','гест','Меҳмон','🎉','We had guests last night.','Дишаб мо меҳмон доштем.','noun'),
      W('Couple','/ˈkʌpəl/','капл','Ҷуфт / зану шавҳар','💑','They are a happy couple.','Онҳо ҷуфти хушбахтанд.','noun'),
      W('Boss','/bɒs/','бос','Сардор','👔','My boss is very kind.','Сардори ман хеле меҳрубон аст.','noun'),
      W('Owner','/ˈəʊnə/','оунер','Соҳиб','🔑','He is the owner of the shop.','Ӯ соҳиби мағоза аст.','noun'),
      W('Twin','/twɪn/','туин','Дугоник','👯','My cousins are twins.','Ҷиянҳоям дугоникҳо ҳастанд.','noun'),
      W('Member','/ˈmembə/','мембер','Аъзо','🪪','She is a member of the club.','Ӯ аъзои маҳфил аст.','noun'),
      W('Champion','/ˈtʃæmpiən/','чэмпиен','Қаҳрамон / чемпион','🏆','He is the champion of the school.','Ӯ қаҳрамони мактаб аст.','noun'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Comparative Adjectives', lessonTitleTg: 'Дарси 6: Грамматика — Сифати муқоисавӣ',
      title: 'Comparative Adjectives', titleTranslated: 'Сифати муқоисавӣ (муқоиса)', emoji: '⚖️',
      explanation:
`Барои **муқоисаи ду чиз** сифати муқоисавӣ бо **than** истифода мешавад:
- Сифати кӯтоҳ (1 ҳиҷо) + **-er**: tall → **taller**, old → **older**, big → **bigger** (ҳамсадои дукарата)
- Ҳамсадо + y → **ier**: happy → **happier**, easy → **easier**
- Сифати дароз (2+ ҳиҷо) → **more** + сифат: modern → **more modern**, expensive → **more expensive**
- Истисно: good → **better**, bad → **worse**

Мисол: *My brother is taller than me. This car is more expensive than that one.*`,
      rules: [
        { pattern: 'кӯтоҳ + er + than', note: 'taller than, older than, bigger than' },
        { pattern: 'y → ier', note: 'happier, easier, prettier' },
        { pattern: 'more + сифати дароз', note: 'more modern, more comfortable' },
        { pattern: 'good→better, bad→worse', note: 'истиснои муҳим' },
      ],
      examples: [
        { sentence: 'My brother is taller than me.', translation: 'Бародарам аз ман қадбаландтар аст.', highlight: 'taller than' },
        { sentence: 'This book is more interesting than that one.', translation: 'Ин китоб аз он ҷолибтар аст.', highlight: 'more interesting' },
        { sentence: 'Today is hotter than yesterday.', translation: 'Имрӯз аз дирӯз гармтар аст.', highlight: 'hotter' },
        { sentence: 'Her bag is better than mine.', translation: 'Кифи ӯ аз кифи ман беҳтар аст.', highlight: 'better' },
        { sentence: 'Cars are faster than bikes.', translation: 'Мошинҳо аз велосипедҳо тезтаранд.', highlight: 'faster than' },
      ],
      exercises: [
        { type:'choose', prompt:'My sister is ___ (tall) than me.', promptTranslated:'Хоҳарам аз ман қадбаландтар аст.', options:['taller','more tall','tallest','tall'], answer:'taller', explanation:'Сифати кӯтоҳ → -er.' },
        { type:'choose', prompt:'This phone is ___ (expensive) than that one.', promptTranslated:'Ин телефон аз он гаронтар аст.', options:['more expensive','expensiver','expensivest','expensive'], answer:'more expensive', explanation:'Сифати дароз → more.' },
        { type:'choose', prompt:'Today is ___ (good) than yesterday.', promptTranslated:'Имрӯз аз дирӯз беҳтар аст.', options:['better','gooder','more good','best'], answer:'better', explanation:'good → better (истисно).' },
        { type:'fill_blank', prompt:'A train is ___ (fast) than a bus.', promptTranslated:'Қатора аз автобус тезтар аст.', answer:'faster', explanation:'fast → faster.' },
        { type:'fill_blank', prompt:'She is ___ (happy) than before. (comparative)', promptTranslated:'Ӯ аз пеш хушбахттар аст.', answer:'happier', explanation:'happy → happier (y→ier).' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ин кӯча аз он танг­тар аст.', options:['is','This','narrower','street','than','that','one'], answer:'This street is narrower than that one.', explanation:'... narrower than ...' },
        { type:'transform', prompt:'Муқоисавӣ созед: big → ...', promptTranslated:'Шакли муқоисавӣ.', answer:'bigger', explanation:'big → bigger (ҳамсадои дукарата).' },
        { type:'transform', prompt:'Ислоҳ кунед: He is more tall than me.', promptTranslated:'Шакл ғалат.', answer:'He is taller than me.', explanation:'tall кӯтоҳ → taller, на more tall.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Superlative Adjectives', lessonTitleTg: 'Дарси 7: Грамматика — Сифати олӣ',
      title: 'Superlative Adjectives', titleTranslated: 'Сифати олӣ (аз ҳама...)', emoji: '🥇',
      explanation:
`Барои нишон додани **«аз ҳама...»** (як чиз дар байни ҳама) сифати олӣ бо **the** истифода мешавад:
- Кӯтоҳ + **-est**: tall → **the tallest**, big → **the biggest**
- y → **iest**: happy → **the happiest**
- Дароз → **the most** + сифат: **the most expensive**, **the most beautiful**
- Истисно: good → **the best**, bad → **the worst**

Мисол: *He is the tallest boy in the class. This is the best day of my life.*`,
      rules: [
        { pattern: 'the + кӯтоҳ + est', note: 'the tallest, the oldest, the biggest' },
        { pattern: 'the + y→iest', note: 'the happiest, the easiest' },
        { pattern: 'the most + дароз', note: 'the most expensive, the most modern' },
        { pattern: 'the best / the worst', note: 'good/bad — истисно' },
      ],
      examples: [
        { sentence: 'He is the tallest boy in the class.', translation: 'Ӯ дар синф аз ҳама қадбаландтарин писар аст.', highlight: 'the tallest' },
        { sentence: 'This is the most expensive car here.', translation: 'Ин дар ин ҷо аз ҳама гаронтарин мошин аст.', highlight: 'the most expensive' },
        { sentence: 'It was the best day of my life.', translation: 'Ин беҳтарин рӯзи умрам буд.', highlight: 'the best' },
        { sentence: 'February is the shortest month.', translation: 'Феврал кӯтоҳтарин моҳ аст.', highlight: 'the shortest' },
        { sentence: 'She is the happiest person I know.', translation: 'Ӯ хушбахттарин шахсест, ки ман медонам.', highlight: 'the happiest' },
      ],
      exercises: [
        { type:'choose', prompt:'He is ___ (tall) boy in the class.', promptTranslated:'Ӯ дар синф аз ҳама қадбаландтарин писар аст.', options:['the tallest','the most tall','taller','the taller'], answer:'the tallest', explanation:'Кӯтоҳ → the + est.' },
        { type:'choose', prompt:'This is ___ (beautiful) place in the city.', promptTranslated:'Ин зеботарин ҷои шаҳр аст.', options:['the most beautiful','the beautifulest','more beautiful','beautifulest'], answer:'the most beautiful', explanation:'Дароз → the most.' },
        { type:'choose', prompt:'It was ___ (bad) film ever.', promptTranslated:'Ин бадтарин филм буд.', options:['the worst','the baddest','worse','the most bad'], answer:'the worst', explanation:'bad → the worst.' },
        { type:'fill_blank', prompt:'Everest is ___ (high) mountain in the world.', promptTranslated:'Эверест баландтарин кӯҳи ҷаҳон аст.', answer:'the highest', explanation:'high → the highest.' },
        { type:'fill_blank', prompt:'This is ___ (good) day of my life.', promptTranslated:'Ин беҳтарин рӯзи умрам аст.', answer:'the best', explanation:'good → the best.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ӯ зирактарин донишҷӯ аст.', options:['She','the','is','cleverest','student'], answer:'She is the cleverest student.', explanation:'She + is + the cleverest + student.' },
        { type:'transform', prompt:'Сифати олӣ созед: big → ...', promptTranslated:'Шакли олӣ.', answer:'the biggest', explanation:'big → the biggest.' },
        { type:'transform', prompt:'Ислоҳ кунед: It is most cold day.', promptTranslated:'Шакл ғалат.', answer:'It is the coldest day.', explanation:'cold кӯтоҳ → the coldest.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — My Two Brothers', lessonTitleTg: 'Дарси 8: Шунавоӣ — Ду бародари ман',
    title: 'My Two Brothers', titleTranslated: 'Ду бародари ман', emoji: '👬',
    passage: 'I have two brothers, Aziz and Farrukh. Aziz is older than Farrukh. He is tall and hardworking. Farrukh is shorter, but he is the funniest person in our family. Aziz is more serious than Farrukh. They are both kind and friendly. I think Farrukh is the cleverest, but Aziz is the strongest. I love them both.',
    passageTranslated: 'Ман ду бародар дорам — Азиз ва Фаррух. Азиз аз Фаррух калонтар аст. Ӯ қадбаланд ва меҳнатдӯст аст. Фаррух пасттар аст, вале ӯ хандаовартарин шахс дар оилаи мост. Азиз аз Фаррух ҷиддитар аст. Ҳарду меҳрубон ва дӯстонаанд. Ба фикрам, Фаррух зирактарин аст, вале Азиз пурқувваттарин. Ман ҳардуро дӯст медорам.',
    questions: [
      { question:'Who is older?', questionTranslated:'Кӣ калонтар аст?', options:['Farrukh','Aziz','The same age'], correctIndex:1, explanation:'Aziz is older than Farrukh.' },
      { question:'Who is the funniest?', questionTranslated:'Кӣ хандаовартарин аст?', options:['Aziz','Farrukh','The writer'], correctIndex:1, explanation:'Farrukh ... the funniest person.' },
      { question:'Who is more serious?', questionTranslated:'Кӣ ҷиддитар аст?', options:['Farrukh','Aziz','Both'], correctIndex:1, explanation:'Aziz is more serious.' },
      { question:'Who is the cleverest?', questionTranslated:'Кӣ зирактарин аст?', options:['Aziz','Farrukh','Neither'], correctIndex:1, explanation:'Farrukh is the cleverest.' },
      { question:'Who is the strongest?', questionTranslated:'Кӣ пурқувваттарин аст?', options:['Aziz','Farrukh','Both'], correctIndex:0, explanation:'Aziz is the strongest.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Which One Is Better?', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Кадомаш беҳтар аст?',
    title: 'Which One Is Better?', titleTranslated: 'Кадомаш беҳтар аст?', emoji: '🛍️',
    scenario: 'Ду дӯст ду мошинро муқоиса мекунанд ва беҳтаринро интихоб мекунанд.',
    lines: [
      { speaker:'Dilnoza', text:'Look at these two phones. Which one do you like?', translation:'Ба ин ду телефон нигоҳ кун. Кадомаш ба ту маъқул аст?', isUser:false },
      { speaker:'You', text:'The black one is more modern than the white one.', translation:'Сиёҳаш аз сафедаш муосиртар аст.', isUser:true },
      { speaker:'Dilnoza', text:'Yes, but it is also more expensive.', translation:'Ҳа, вале он гаронтар ҳам аст.', isUser:false },
      { speaker:'You', text:'The white one is cheaper and has a better camera.', translation:'Сафедаш арзонтар аст ва камераи беҳтар дорад.', isUser:true },
      { speaker:'Dilnoza', text:'So which is the best choice?', translation:'Пас кадомаш беҳтарин интихоб аст?', isUser:false },
      { speaker:'You', text:'I think the white one is the best for you.', translation:'Ба фикрам, сафедаш барои ту беҳтарин аст.', isUser:true },
      { speaker:'Dilnoza', text:'You are right. It is cheaper and lighter.', translation:'Ҳақ ба ҷониби туст. Он арзонтар ва сабуктар аст.', isUser:false },
      { speaker:'You', text:'Great choice! Let\'s buy it.', translation:'Интихоби олӣ! Биё онро харем.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — My Best Friend', lessonTitleTg: 'Дарси 10: Хониш — Дӯсти беҳтарини ман',
    title: 'My Best Friend', titleTranslated: 'Дӯсти беҳтарини ман', emoji: '🤝',
    passage: 'My best friend is Sardor. He is taller than me and a bit older. He has short black hair and a friendly smile. Sardor is the cleverest boy in our class, but he is never rude. He is more patient than me and always helps others. His family is bigger than mine — he has four brothers. I think he is the kindest person I know.',
    passageTranslated: 'Дӯсти беҳтарини ман Сардор аст. Ӯ аз ман қадбаландтар ва каме калонтар аст. Ӯ мӯи кӯтоҳи сиёҳ ва табассуми дӯстона дорад. Сардор дар синфи мо зирактарин писар аст, вале ҳеҷ гоҳ дағал нест. Ӯ аз ман сабртар аст ва ҳамеша ба дигарон кӯмак мекунад. Оилаи ӯ аз оилаи ман калонтар аст — ӯ чор бародар дорад. Ба фикрам, ӯ меҳрубонтарин шахсест, ки ман медонам.',
    questions: [
      { question:'How is Sardor compared to the writer?', questionTranslated:'Сардор нисбат ба нависанда чӣ гуна аст?', options:['Shorter and younger','Taller and older','The same'], correctIndex:1, explanation:'taller than me and a bit older.' },
      { question:'How clever is Sardor?', questionTranslated:'Сардор чӣ қадар зирак аст?', options:['Average','Not clever','The cleverest in the class'], correctIndex:2, explanation:'the cleverest boy in our class.' },
      { question:'Is Sardor rude?', questionTranslated:'Сардор дағал аст?', options:['Yes, often','Never','Sometimes'], correctIndex:1, explanation:'he is never rude.' },
      { question:'How many brothers does he have?', questionTranslated:'Ӯ чанд бародар дорад?', options:['Two','Three','Four'], correctIndex:2, explanation:'he has four brothers.' },
    ],
  },
  review: {
    passage: 'Anvar and Bek are friends. Anvar is taller and older, but Bek is stronger. Anvar has a modern car; Bek has an older one. Anvar\'s car is faster, but Bek\'s car is more comfortable. On Sunday they went to the mountains. The road was narrow and dangerous, so they drove slowly. It was the best trip of the summer.',
    passageTranslated: 'Анвар ва Бек дӯстанд. Анвар қадбаландтар ва калонтар аст, вале Бек пурқувваттар аст. Анвар мошини муосир дорад; Бек мошини кӯҳнатар дорад. Мошини Анвар тезтар аст, вале мошини Бек бароҳаттар аст. Рӯзи якшанбе онҳо ба кӯҳҳо рафтанд. Роҳ танг ва хатарнок буд, бинобар ин оҳиста ронданд. Ин беҳтарин сафари тобистон буд.',
    questions: [
      { question:'Who is taller?', questionTranslated:'Кӣ қадбаландтар аст?', options:['Same','Anvar','Bek'], correctIndex:1, explanation:'Anvar is taller and older.' },
      { question:'Who is stronger?', questionTranslated:'Кӣ пурқувваттар аст?', options:['Anvar','Bek','Same'], correctIndex:1, explanation:'Bek is stronger.' },
      { question:'Whose car is more comfortable?', questionTranslated:'Мошини кӣ бароҳаттар аст?', options:["Anvar's","Bek's","Neither"], correctIndex:1, explanation:"Bek's car is more comfortable." },
      { question:'How was the road?', questionTranslated:'Роҳ чӣ гуна буд?', options:['Wide and safe','Narrow and dangerous','Smooth'], correctIndex:1, explanation:'narrow and dangerous.' },
      { question:'How was the trip?', questionTranslated:'Сафар чӣ гуна буд?', options:['The worst','Boring','The best of the summer'], correctIndex:2, explanation:'the best trip of the summer.' },
    ],
  },
  exam: {
    passage: 'Malika has two sisters. Zarina is the oldest and the tallest. She is hardworking and honest. Nigina is younger and shorter, but she is the funniest and the most generous. Malika is quieter than her sisters. Their house is small but comfortable. Malika says her sisters are the best friends in the world, and she is the luckiest girl to have them.',
    passageTranslated: 'Малика ду хоҳар дорад. Зарина калонтарин ва қадбаландтарин аст. Ӯ меҳнатдӯст ва ростқавл аст. Нигина хурдтар ва пасттар аст, вале ӯ хандаовартарин ва саховатмандтарин аст. Малика аз хоҳаронаш оромтар аст. Хонаи онҳо хурд, вале бароҳат аст. Малика мегӯяд, ки хоҳаронаш беҳтарин дӯстони ҷаҳонанд ва ӯ хушбахттарин духтарест, ки онҳоро дорад.',
    questions: [
      { question:'Who is the oldest?', questionTranslated:'Кӣ калонтарин аст?', options:['Malika','Zarina','Nigina'], correctIndex:1, explanation:'Zarina is the oldest.' },
      { question:'Who is the funniest?', questionTranslated:'Кӣ хандаовартарин аст?', options:['Zarina','Nigina','Malika'], correctIndex:1, explanation:'Nigina ... the funniest.' },
      { question:'How is Malika compared to her sisters?', questionTranslated:'Малика нисбат ба хоҳаронаш чӣ гуна аст?', options:['Louder','Quieter','Taller'], correctIndex:1, explanation:'Malika is quieter.' },
      { question:'How is their house?', questionTranslated:'Хонаи онҳо чӣ гуна аст?', options:['Big and modern','Small but comfortable','Old and cold'], correctIndex:1, explanation:'small but comfortable.' },
      { question:'How does Malika feel?', questionTranslated:'Малика чӣ ҳис мекунад?', options:['Bored','Lonely','The luckiest girl'], correctIndex:2, explanation:'the luckiest girl to have them.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 2 тайёр.');
