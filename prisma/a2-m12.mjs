import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 11, title: 'Module 12: Feelings And Dreams', titleTranslated: 'Модули 12: Ҳиссиёт ва Орзуҳо',
  emoji: '🌟', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Feelings And States', tt: 'Дарси 1: Ҳиссиёт ва Ҳолатҳо', emoji: '😊', words: [
      W('Glad','/ɡlæd/','глад','Хурсанд / шод','🙂','I am glad to see you.','Ман аз дидани ту хурсандам.','adjective'),
      W('Sorry','/ˈsɒri/','сори','Пушаймон / узрхоҳ','😔','I am sorry for the mistake.','Ман барои хатогӣ узр мепурсам.','adjective'),
      W('Afraid','/əˈfreɪd/','афрейд','Тарсида','😨','She is afraid of spiders.','Ӯ аз тортанакҳо метарсад.','adjective'),
      W('Scared','/skeəd/','скеард','Тарсида','😱','He was scared of the dark.','Ӯ аз торикӣ тарсида буд.','adjective'),
      W('Angry','/ˈæŋɡri/','ангри','Хашмгин','😡','My boss was very angry.','Сардорам хеле хашмгин буд.','adjective'),
      W('Surprised','/səˈpraɪzd/','сепрайзд','Ҳайрон','😲','I was surprised by the news.','Ман аз хабар ҳайрон шудам.','adjective'),
      W('Sleepy','/ˈsliːpi/','слипи','Хоббиёлуд','🥱','The baby is sleepy.','Кӯдак хоббиёлуд аст.','adjective'),
      W('Thirsty','/ˈθɜːsti/','сёсти','Ташна','💧','I am very thirsty.','Ман хеле ташнаам.','adjective'),
      W('Hungry','/ˈhʌŋɡri/','ҳангри','Гурусна','🍔','We are hungry.','Мо гуруснаем.','adjective'),
      W('Lazy','/ˈleɪzi/','лейзи','Танбал','🛋️','Don\'t be lazy.','Танбал набош.','adjective'),
    ]},
    { title: 'Lesson 2: More Feelings', tt: 'Дарси 2: Ҳиссиёти бештар', emoji: '😲', words: [
      W('Ill','/ɪl/','ил','Бемор','🤒','He is ill today.','Ӯ имрӯз бемор аст.','adjective'),
      W('Sick','/sɪk/','сик','Бемор / касал','🤢','I feel sick.','Ман худро бемор ҳис мекунам.','adjective'),
      W('Well','/wel/','вел','Сиҳат / хуб','💪','She is not well.','Ӯ сиҳат нест.','adjective'),
      W('Crazy','/ˈkreɪzi/','крейзи','Девона / аҷиб','🤪','That is a crazy idea!','Ин фикри девонавор аст!','adjective'),
      W('Funny','/ˈfʌni/','фани','Хандаовар','😂','He told a funny story.','Ӯ ҳикояи хандаовар гуфт.','adjective'),
      W('Sad','/sæd/','сад','Ғамгин','😢','The film made me sad.','Филм маро ғамгин кард.','adjective'),
      W('Happy','/ˈhæpi/','ҳапи','Хушбахт','😄','I am happy for you.','Ман барои ту хушбахтам.','adjective'),
      W('Tired','/ˈtaɪəd/','тайерд','Хаста','😫','I am tired after work.','Ман баъди кор хастаам.','adjective'),
      W('Cheerful','/ˈtʃɪəfʊl/','чирфул','Хушрӯҳия','😁','She has a cheerful smile.','Ӯ табассуми хушрӯҳия дорад.','adjective'),
      W('Hopeful','/ˈhəʊpfʊl/','ҳоупфул','Умедвор','🌈','We are hopeful about the future.','Мо нисбат ба оянда умедворем.','adjective'),
    ]},
    { title: 'Lesson 3: Dreams And Ambitions', tt: 'Дарси 3: Орзуҳо ва Ниятҳо', emoji: '🎯', words: [
      W('Purpose','/ˈpɜːpəs/','пёрпес','Мақсад / ҳадаф','🎯','Everyone needs a purpose in life.','Ҳар кас дар ҳаёт мақсад лозим дорад.','noun'),
      W('Goal','/ɡəʊl/','гоул','Ҳадаф / мақсад','🥅','Her goal is to become a doctor.','Ҳадафи ӯ духтур шудан аст.','noun'),
      W('Ambition','/æmˈbɪʃən/','амбишн','Орзу / ҳадафи бузург','🚀','He has big ambitions.','Ӯ ниятҳои бузург дорад.','noun'),
      W('Wish','/wɪʃ/','виш','Хоҳиш / орзу','⭐','I wish for good health.','Ман саломатии хуб орзу мекунам.','noun'),
      W('Success','/səkˈses/','саксес','Муваффақият','🏆','Hard work brings success.','Меҳнати сахт муваффақият меорад.','noun'),
      W('Achieve','/əˈtʃiːv/','ачив','Ба даст овардан','✅','You can achieve your goals.','Ту метавонӣ ба ҳадафҳоят расӣ.','verb'),
      W('Imagine','/ɪˈmædʒɪn/','имаҷин','Тасаввур кардан','💡','Imagine a better world.','Ҷаҳони беҳтарро тасаввур кун.','verb'),
      W('Future','/ˈfjuːtʃə/','фючер','Оянда','🔮','I think about my future a lot.','Ман дар бораи ояндаам зиёд фикр мекунам.','noun'),
      W('Motivation','/ˌməʊtɪˈveɪʃən/','мотивейшн','Ангеза / рағбат','🔥','Success needs motivation.','Муваффақият ангеза мехоҳад.','noun'),
      W('Determined','/dɪˈtɜːmɪnd/','дитёрминд','Устувор / қатъӣ','💪','She is determined to win.','Ӯ барои ғалаба қатъӣ аст.','adjective'),
    ]},
    { title: 'Lesson 4: Life Events', tt: 'Дарси 4: Воқеаҳои ҳаёт', emoji: '🎉', words: [
      W('Wedding','/ˈwedɪŋ/','вединг','Тӯй / арӯсӣ','💒','We went to a big wedding.','Мо ба тӯи калон рафтем.','noun'),
      W('Birth','/bɜːθ/','бёрс','Таваллуд','👶','The birth of a child is a joy.','Таваллуди кӯдак шодист.','noun'),
      W('Graduation','/ˌɡrædʒuˈeɪʃən/','градюейшн','Хатми таҳсил','🎓','Her graduation is in June.','Хатми таҳсили ӯ дар моҳи июн аст.','noun'),
      W('Chance','/tʃɑːns/','чанс','Имконият / фурсат','🎲','Give me one more chance.','Ба ман боз як фурсат деҳ.','noun'),
      W('Opportunity','/ˌɒpəˈtjuːnəti/','опортюнити','Имконият','🚪','This job is a great opportunity.','Ин кор имконияти бузург аст.','noun'),
      W('Decision','/dɪˈsɪʒən/','дисижн','Қарор','🤔','It was a hard decision.','Ин қарори душвор буд.','noun'),
      W('Experience','/ɪkˈspɪəriəns/','икспириенс','Таҷриба','🌟','Travel gives you experience.','Сафар ба ту таҷриба медиҳад.','noun'),
      W('Ceremony','/ˈserəməni/','серемони','Маросим','🎗️','The wedding ceremony was lovely.','Маросими тӯй зебо буд.','noun'),
      W('Celebrate','/ˈselɪbreɪt/','селебрейт','Ҷашн гирифтан','🎊','We celebrate the new year.','Мо соли навро ҷашн мегирем.','verb'),
      W('Achievement','/əˈtʃiːvmənt/','ачивмент','Дастовард','🏅','Winning was a great achievement.','Ғалаба дастоварди бузург буд.','noun'),
    ]},
    { title: 'Lesson 5: Character', tt: 'Дарси 5: Хислат', emoji: '🧭', words: [
      W('Humble','/ˈhʌmbl/','ҳамбл','Фурӯтан / хоксор','🙏','He is famous but humble.','Ӯ машҳур, вале хоксор аст.','adjective'),
      W('Wise','/waɪz/','вайз','Оқил / хирадманд','🦉','My grandfather is a wise man.','Бобоям марди хирадманд аст.','adjective'),
      W('Loyal','/ˈlɔɪəl/','лойал','Содиқ / вафодор','🤝','A dog is a loyal friend.','Саг дӯсти вафодор аст.','adjective'),
      W('Positive','/ˈpɒzətɪv/','позитив','Мусбат / хушбин','➕','Try to think positive.','Кӯшиш кун мусбат фикр кунӣ.','adjective'),
      W('Negative','/ˈneɡətɪv/','негатив','Манфӣ / бадбин','➖','Don\'t be so negative.','Ин қадар манфӣ набош.','adjective'),
      W('Sensible','/ˈsensəbl/','сенсибл','Оқилона / боақл','🧠','That was a sensible decision.','Ин қарори оқилона буд.','adjective'),
      W('Thoughtful','/ˈθɔːtfʊl/','сотфул','Мулоҳизакор / ғамхор','💭','It was a thoughtful gift.','Ин тӯҳфаи ғамхорона буд.','adjective'),
      W('Optimistic','/ˌɒptɪˈmɪstɪk/','оптимистик','Хушбин','🌞','She is optimistic about life.','Ӯ нисбат ба ҳаёт хушбин аст.','adjective'),
      W('Selfish','/ˈselfɪʃ/','селфиш','Худпараст','🙅','A selfish person thinks only of himself.','Одами худпараст танҳо ба худ фикр мекунад.','adjective'),
      W('Kind-hearted','/ˌkaɪndˈhɑːtɪd/','кайнд-ҳартид','Меҳрубондил','💗','She is a kind-hearted woman.','Ӯ зани меҳрубондил аст.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — First Conditional', lessonTitleTg: 'Дарси 6: Грамматика — Шарти якум',
      title: 'First Conditional (if + will)', titleTranslated: 'Шарти якум — if + present, will', emoji: '🔀',
      explanation:
`**Шарти якум** барои натиҷаи **эҳтимолии оянда** дар асоси шарт:
**If + present simple, ... will + феъли асосӣ**
- *If it **rains**, we **will stay** home.* (Агар борон борад, мо дар хона мемонем)
- *If you **study**, you **will pass** the exam.*

Диққат: дар қисми **if** феъли **ҳозира** меояд (не will!): *If it will rain* ғалат аст.
Тартибро иваз кардан мумкин: *We will stay home **if it rains**.* (бе вергул)`,
      rules: [
        { pattern: 'If + present, ... will + феъл', note: 'If you run, you will be tired.' },
        { pattern: 'дар if — will намеояд', note: 'If it rains (не «if it will rain»)' },
        { pattern: "манфӣ: won't / don't", note: "If you don't hurry, you will be late." },
        { pattern: 'тартиб иваз мешавад', note: 'You will pass if you study.' },
      ],
      examples: [
        { sentence: 'If it rains, we will stay at home.', translation: 'Агар борон борад, мо дар хона мемонем.', highlight: 'If it rains' },
        { sentence: 'If you study hard, you will pass.', translation: 'Агар бо ҷидд хонӣ, месупорӣ.', highlight: 'will pass' },
        { sentence: "If you don't sleep, you will feel tired.", translation: 'Агар нахобӣ, худро хаста ҳис мекунӣ.', highlight: "don't sleep" },
        { sentence: 'She will be happy if you call her.', translation: 'Агар ба ӯ занг занӣ, ӯ хушҳол мешавад.', highlight: 'if you call' },
        { sentence: 'If we hurry, we will catch the bus.', translation: 'Агар шитоб кунем, ба автобус мерасем.', highlight: 'will catch' },
      ],
      exercises: [
        { type:'choose', prompt:'If it ___, we will stay home.', promptTranslated:'Агар борон борад, дар хона мемонем.', options:['rains','will rain','rained','rain'], answer:'rains', explanation:'дар if — present simple.' },
        { type:'choose', prompt:'If you study, you ___ pass.', promptTranslated:'Агар хонӣ, месупорӣ.', options:['will','would','are','do'], answer:'will', explanation:'натиҷа → will + феъл.' },
        { type:'choose', prompt:'If you don\'t hurry, you ___ late.', promptTranslated:'Агар шитоб накунӣ, дер мемонӣ.', options:['will be','are','were','will'], answer:'will be', explanation:'will be late.' },
        { type:'choose', prompt:'She will help if you ___ her.', promptTranslated:'Агар аз ӯ пурсӣ, кӯмак мекунад.', options:['ask','will ask','asked','asks'], answer:'ask', explanation:'дар if — present (you ask).' },
        { type:'fill_blank', prompt:'If you heat ice, it ___ (melt).', promptTranslated:'Агар яхро гарм кунӣ, об мешавад.', answer:'will melt', explanation:'натиҷа → will melt.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Агар машқ кунӣ, беҳтар мешавӣ.', options:['If','practise','you','will','you','improve'], answer:'If you practise you will improve.', explanation:'If you practise, you will improve.' },
        { type:'transform', prompt:'Ислоҳ кунед: If it will rain, I will stay.', promptTranslated:'дар if — present.', answer:'If it rains, I will stay.', explanation:'If it rains (бе will).' },
        { type:'transform', prompt:'Ислоҳ кунед: If you run, you are win.', promptTranslated:'натиҷа → will.', answer:'If you run, you will win.', explanation:'you will win.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Linking Words', lessonTitleTg: 'Дарси 7: Грамматика — Калимаҳои пайвасткунанда',
      title: 'because / so / but / although', titleTranslated: 'because / so / but / although', emoji: '🔗',
      explanation:
`Калимаҳои пайвасткунанда ду фикрро мепайванданд:
- **because** (зеро / чунки) — сабаб: *I stayed home **because** it rained.*
- **so** (бинобар ин) — натиҷа: *It rained, **so** I stayed home.*
- **but** (вале / аммо) — муқобилият: *I was tired, **but** I finished the work.*
- **although** (гарчанде / ҳарчанд) — муқобилияти қавӣ: ***Although** it rained, we went out.*

Диққат: **because** + сабаб, **so** + натиҷа — онҳо баръакси ҳамдигаранд.`,
      rules: [
        { pattern: 'because + сабаб', note: 'I was late because I missed the bus.' },
        { pattern: 'so + натиҷа', note: 'I missed the bus, so I was late.' },
        { pattern: 'but — муқобилият', note: 'It was hard, but I did it.' },
        { pattern: 'although — гарчанде', note: 'Although he was tired, he worked.' },
      ],
      examples: [
        { sentence: 'I was happy because I passed the exam.', translation: 'Ман хушҳол будам, зеро имтиҳонро супоридам.', highlight: 'because' },
        { sentence: 'It was late, so we went home.', translation: 'Дер шуда буд, бинобар ин ба хона рафтем.', highlight: 'so' },
        { sentence: 'She was tired, but she kept working.', translation: 'Ӯ хаста буд, вале кор карданро идома дод.', highlight: 'but' },
        { sentence: 'Although it was cold, we went for a walk.', translation: 'Гарчанде ки хунук буд, мо ба сайр рафтем.', highlight: 'Although' },
        { sentence: 'He was nervous because it was his first day.', translation: 'Ӯ ба ташвиш буд, зеро рӯзи аввалаш буд.', highlight: 'because' },
      ],
      exercises: [
        { type:'choose', prompt:'I stayed home ___ it was raining.', promptTranslated:'Ман дар хона мондам, зеро борон меборид.', options:['because','so','but','although'], answer:'because', explanation:'сабаб → because.' },
        { type:'choose', prompt:'It was raining, ___ I stayed home.', promptTranslated:'Борон меборид, бинобар ин дар хона мондам.', options:['so','because','but','although'], answer:'so', explanation:'натиҷа → so.' },
        { type:'choose', prompt:'He was tired, ___ he finished the work.', promptTranslated:'Ӯ хаста буд, вале корро тамом кард.', options:['but','so','because','and'], answer:'but', explanation:'муқобилият → but.' },
        { type:'choose', prompt:'___ she was ill, she went to school.', promptTranslated:'Гарчанде ки бемор буд, ба мактаб рафт.', options:['Although','Because','So','But'], answer:'Although', explanation:'гарчанде → although.' },
        { type:'fill_blank', prompt:'I was hungry, ___ I made a sandwich.', promptTranslated:'Ман гурусна будам, бинобар ин сэндвич сохтам.', answer:'so', explanation:'натиҷа → so.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман хурсанд будам, зеро ту омадӣ.', options:['I','happy','was','because','came','you'], answer:'I was happy because you came.', explanation:'I was happy because you came.' },
        { type:'transform', prompt:'Бо "so" нависед: It was hot. I opened the window.', promptTranslated:'ду ҷумларо пайванд кун.', answer:'It was hot, so I opened the window.', explanation:'натиҷа → so.' },
        { type:'transform', prompt:'Бо "because" нависед: I opened the window. It was hot.', promptTranslated:'сабабро нишон деҳ.', answer:'I opened the window because it was hot.', explanation:'сабаб → because.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — My Big Dream', lessonTitleTg: 'Дарси 8: Шунавоӣ — Орзуи бузурги ман',
    title: 'My Big Dream', titleTranslated: 'Орзуи бузурги ман', emoji: '🌟',
    passage: 'My name is Shirin and I have a big dream. I want to become a doctor because I love helping people. It is not easy, and sometimes I feel nervous about the future. But I am a determined and hopeful person. My teacher says that if I work hard, I will achieve my goal. I study every day, although it is difficult. When I feel stressed, my mother tells me to stay calm and positive. I am grateful for my family\'s support. If I become a doctor, I will be very proud, and I will help sick people in my village. I believe that dreams come true if we never give up.',
    passageTranslated: 'Номи ман Ширин аст ва ман орзуи бузург дорам. Ман мехоҳам духтур шавам, зеро кӯмак ба одамонро дӯст медорам. Ин осон нест ва баъзан ман дар бораи оянда ба ташвиш мешавам. Вале ман шахси устувор ва умедворам. Муаллимам мегӯяд, ки агар бо ҷидд кор кунам, ба ҳадафам мерасам. Ман ҳар рӯз мехонам, гарчанде душвор аст. Вақте асабӣ мешавам, модарам мегӯяд ором ва мусбат бошам. Ман барои дастгирии оилаам миннатдорам. Агар духтур шавам, хеле ифтихор мекунам ва ба беморони деҳаам кӯмак мерасонам. Ман боварӣ дорам, ки орзуҳо амалӣ мешаванд, агар ҳеҷ гоҳ даст накашем.',
    questions: [
      { question:'What is Shirin\'s dream?', questionTranslated:'Орзуи Ширин чист?', options:['To become a doctor','To be rich','To travel'], correctIndex:0, explanation:'I want to become a doctor.' },
      { question:'Why does she want this job?', questionTranslated:'Чаро ӯ ин корро мехоҳад?', options:['It is easy','For money','She loves helping people'], correctIndex:2, explanation:'because I love helping people.' },
      { question:'What does her teacher say?', questionTranslated:'Муаллимаш чӣ мегӯяд?', options:['She will achieve her goal','If she works hard','She should give up','It is impossible'], correctIndex:1, explanation:'if I work hard, I will achieve my goal.' },
      { question:'What does her mother tell her?', questionTranslated:'Модараш ба ӯ чӣ мегӯяд?', options:['Stay calm and positive','Stop studying','Sleep more'], correctIndex:0, explanation:'stay calm and positive.' },
      { question:'When do dreams come true?', questionTranslated:'Орзуҳо кай амалӣ мешаванд?', options:['Never','If we never give up','Only with luck'], correctIndex:1, explanation:'dreams come true if we never give up.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Talking About The Future', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Дар бораи оянда',
    title: 'Talking About The Future', titleTranslated: 'Дар бораи оянда', emoji: '💬',
    scenario: 'Ду дӯст дар бораи орзу ва нақшаҳои ояндаи худ сӯҳбат мекунанд.',
    lines: [
      { speaker:'Jamila', text:'What do you want to do after school?', translation:'Баъди мактаб чӣ кор кардан мехоҳӣ?', isUser:false },
      { speaker:'You', text:'My dream is to study engineering at university.', translation:'Орзуи ман дар донишгоҳ омӯхтани муҳандисӣ аст.', isUser:true },
      { speaker:'Jamila', text:'That is a great goal! Are you nervous?', translation:'Ин ҳадафи олист! Ба ташвиш ҳастӣ?', isUser:false },
      { speaker:'You', text:'A little, but I am confident and determined.', translation:'Каме, вале ман худбовар ва устуворам.', isUser:true },
      { speaker:'Jamila', text:'If you study hard, you will succeed.', translation:'Агар бо ҷидд хонӣ, муваффақ мешавӣ.', isUser:false },
      { speaker:'You', text:'Thank you. What about you? What is your dream?', translation:'Ташаккур. Ту чӣ? Орзуи ту чист?', isUser:true },
      { speaker:'Jamila', text:'I want to be a teacher because I love children.', translation:'Ман мехоҳам муаллим шавам, зеро кӯдаконро дӯст медорам.', isUser:false },
      { speaker:'You', text:'I am sure you will be a wonderful teacher!', translation:'Боварӣ дорам, ки муаллими аҷоиб мешавӣ!', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — Never Give Up', lessonTitleTg: 'Дарси 10: Хониш — Ҳеҷ гоҳ даст накаш',
    title: 'Never Give Up', titleTranslated: 'Ҳеҷ гоҳ даст накаш', emoji: '💪',
    passage: 'Anvar grew up in a small village and dreamed of becoming an artist. His family was poor, so he could not buy expensive paints. But Anvar was determined and never gave up. He used to draw with simple pencils on old paper. Although many people said art was not a real job, he continued to practise every day. When he was eighteen, he entered a national competition. He felt very nervous, but he was also hopeful. To his surprise, he won first prize! Now Anvar is a famous artist. He says, "If you believe in your dream and work hard, you will achieve it. Difficulties make us stronger."',
    passageTranslated: 'Анвар дар деҳаи хурд ба воя расид ва орзуи рассом шуданро дошт. Оилаи ӯ камбағал буд, бинобар ин ӯ рангҳои гаронро харида наметавонист. Вале Анвар устувор буд ва ҳеҷ гоҳ даст накашид. Ӯ бо қаламҳои оддӣ дар коғази кӯҳна расм мекашид. Гарчанде бисёр одамон мегуфтанд, ки санъат кори воқеӣ нест, ӯ ҳар рӯз машқро идома медод. Вақте ӯ ҳаждаҳсола буд, ба озмуни ҷумҳуриявӣ ворид шуд. Ӯ хеле ба ташвиш буд, вале инчунин умедвор буд. Ба ҳайрати ӯ, ӯ ҷои аввалро гирифт! Акнун Анвар рассоми машҳур аст. Ӯ мегӯяд: «Агар ба орзуят бовар кунӣ ва бо ҷидд кор кунӣ, ба он мерасӣ. Мушкилот моро қавитар мекунанд.»',
    questions: [
      { question:'What was Anvar\'s dream?', questionTranslated:'Орзуи Анвар чӣ буд?', options:['To travel','To become an artist','To be a doctor'], correctIndex:1, explanation:'dreamed of becoming an artist.' },
      { question:'Why couldn\'t he buy expensive paints?', questionTranslated:'Чаро ӯ рангҳои гаронро харида наметавонист?', options:['His family was poor','No shops','He was lazy'], correctIndex:0, explanation:'His family was poor.' },
      { question:'What did he use to draw with?', questionTranslated:'Ӯ бо чӣ расм мекашид?', options:['Expensive paints','Simple pencils','A computer'], correctIndex:1, explanation:'draw with simple pencils.' },
      { question:'What happened at the competition?', questionTranslated:'Дар озмун чӣ шуд?', options:['He won first prize','He did not go','He lost'], correctIndex:0, explanation:'he won first prize!' },
      { question:'What is his advice?', questionTranslated:'Маслиҳати ӯ чист?', options:['Wait for luck','Give up','Believe in your dream and work hard'], correctIndex:2, explanation:'If you believe in your dream and work hard, you will achieve it.' },
    ],
  },
  review: {
    passage: 'Life is full of feelings and important choices. Some days we feel happy and confident, and other days we feel nervous or upset. That is normal. The important thing is to stay positive and never lose hope. If we have a dream, we must work hard to achieve it. Success does not come easily; it needs patience, courage, and a strong will. When we fail, we should not feel disappointed for long, because every mistake teaches us something. Good friends and a kind family help us stay strong. Although life can be difficult, it is also beautiful and full of opportunities. If we believe in ourselves, we will find a way.',
    passageTranslated: 'Ҳаёт пур аз ҳиссиёт ва интихобҳои муҳим аст. Баъзе рӯзҳо мо худро хушҳол ва худбовар ҳис мекунем ва рӯзҳои дигар худро ба ташвиш ё хафа. Ин муқаррарӣ аст. Муҳим ин аст, ки мусбат бимонем ва ҳеҷ гоҳ умедро гум накунем. Агар орзу дошта бошем, бояд барои расидан ба он бо ҷидд кор кунем. Муваффақият ба осонӣ намеояд; он сабр, далерӣ ва иродаи қавӣ мехоҳад. Вақте ноком мешавем, набояд дер ноумед бошем, зеро ҳар хато ба мо чизе меомӯзад. Дӯстони хуб ва оилаи меҳрубон ба мо кӯмак мекунанд, ки қавӣ бимонем. Гарчанде ҳаёт душвор буда метавонад, он инчунин зебо ва пур аз имконият аст. Агар ба худамон бовар кунем, роҳ меёбем.',
    questions: [
      { question:'What should we do when we feel nervous or upset?', questionTranslated:'Вақте ба ташвиш ё хафа мешавем, чӣ кунем?', options:['Stay in bed','Give up','Stay positive and never lose hope'], correctIndex:2, explanation:'stay positive and never lose hope.' },
      { question:'What does success need?', questionTranslated:'Муваффақият чӣ мехоҳад?', options:['Patience, courage, and strong will','Only luck','Only money','Nothing'], correctIndex:0, explanation:'patience, courage, and a strong will.' },
      { question:'What does every mistake do?', questionTranslated:'Ҳар хато чӣ мекунад?', options:['Means nothing','Teaches us something','Ends everything'], correctIndex:1, explanation:'every mistake teaches us something.' },
      { question:'Who helps us stay strong?', questionTranslated:'Кӣ ба мо кӯмак мекунад қавӣ бимонем?', options:['No one','Good friends and a kind family','Only teachers'], correctIndex:1, explanation:'Good friends and a kind family.' },
      { question:'What will happen if we believe in ourselves?', questionTranslated:'Агар ба худамон бовар кунем, чӣ мешавад?', options:['We will fail','We will find a way','Nothing'], correctIndex:1, explanation:'If we believe in ourselves, we will find a way.' },
    ],
  },
  exam: {
    passage: 'Everyone has dreams, but not everyone reaches them. The difference is often not talent or money, but attitude. People who succeed usually share some qualities. First, they are determined: they set a clear goal and work towards it every day. Second, they are patient, because big dreams take time. Third, they stay positive, even when things go wrong. If they fail, they do not give up; they learn and try again. They are also grateful for help from others and never forget their friends and family. Although the road to success is hard, these people believe in themselves. Remember: if you have a dream and the courage to follow it, one day you will make it real.',
    passageTranslated: 'Ҳар кас орзу дорад, вале на ҳама ба он мерасад. Фарқ аксаран на истеъдод ё пул, балки муносибат аст. Одамоне, ки муваффақ мешаванд, одатан якчанд сифати муштарак доранд. Аввал, онҳо устуворанд: ҳадафи равшан мегузоранд ва ҳар рӯз ба сӯи он кор мекунанд. Дуюм, онҳо босабранд, зеро орзуҳои бузург вақт мехоҳанд. Сеюм, онҳо мусбат мемонанд, ҳатто вақте корҳо бад мешаванд. Агар ноком шаванд, даст намекашанд; меомӯзанд ва боз кӯшиш мекунанд. Онҳо инчунин барои кӯмаки дигарон миннатдоранд ва ҳеҷ гоҳ дӯстону оилаашонро фаромӯш намекунанд. Гарчанде роҳи муваффақият душвор аст, ин одамон ба худашон бовар доранд. Дар хотир дор: агар орзу ва далерии пайравии онро дошта бошӣ, рӯзе онро воқеӣ мекунӣ.',
    questions: [
      { question:'What is the difference between people who succeed and others?', questionTranslated:'Фарқи одамони муваффақ аз дигарон чист?', options:['Only talent','Only money','Attitude'], correctIndex:2, explanation:'the difference is often not talent or money, but attitude.' },
      { question:'What do determined people do?', questionTranslated:'Одамони устувор чӣ мекунанд?', options:['Set a clear goal and work daily','Wait for luck','Do nothing'], correctIndex:0, explanation:'they set a clear goal and work towards it every day.' },
      { question:'Why are they patient?', questionTranslated:'Чаро онҳо босабранд?', options:['They have no plan','They are lazy','Big dreams take time'], correctIndex:2, explanation:'big dreams take time.' },
      { question:'What do they do when they fail?', questionTranslated:'Вақте ноком мешаванд, чӣ мекунанд?', options:['Blame others','Give up','Learn and try again'], correctIndex:2, explanation:'they learn and try again.' },
      { question:'What is the final message?', questionTranslated:'Паёми ниҳоӣ чист?', options:['Dreams are useless','You will make it real','With a dream and courage','Only luck matters'], correctIndex:2, explanation:'if you have a dream and the courage to follow it, one day you will make it real.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 12 тайёр.');
