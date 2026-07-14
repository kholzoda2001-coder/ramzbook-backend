import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 2, title: 'Module 3: Daily Life And Routines', titleTranslated: 'Модули 3: Ҳаёти ҳаррӯза ва Одатҳо',
  emoji: '⏰', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Morning Routine', tt: 'Дарси 1: Тартиби субҳ', emoji: '🌅', words: [
      W('Alarm','/əˈlɑːm/','аларм','Занги ҳушдор (соат)','⏰','My alarm rings at six.','Занги ман соати шаш зада мешавад.','noun'),
      W('Get dressed','/ɡet drest/','гет дресд','Либос пӯшидан','👕','I get dressed after breakfast.','Ман баъди наҳорӣ либос мепӯшам.','verb'),
      W('Comb','/kəʊm/','коум','Шона (кардан)','💇','She combs her hair.','Ӯ мӯяшро шона мекунад.','verb'),
      W('Shave','/ʃeɪv/','шейв','Риш тарошидан','🪒','He shaves every morning.','Ӯ ҳар субҳ риш метарошад.','verb'),
      W('Towel','/ˈtaʊəl/','тауел','Сачоқ','🧻','Give me a clean towel.','Ба ман сачоқи тоза деҳ.','noun'),
      W('Toothbrush','/ˈtuːθbrʌʃ/','тусбраш','Чӯткаи дандон','🪥','My toothbrush is blue.','Чӯткаи дандони ман кабуд аст.','noun'),
      W('Soap','/səʊp/','соуп','Собун','🧼','Wash your hands with soap.','Дастҳоятро бо собун бишӯй.','noun'),
      W('Shampoo','/ʃæmˈpuː/','шампу','Шампун','🧴','I wash my hair with shampoo.','Ман мӯямро бо шампун мешӯям.','noun'),
      W('Iron','/ˈaɪən/','айен','Дарзмол кардан','👔','I iron my shirt.','Ман курткаамро дарзмол мекунам.','verb'),
      W('Ready','/ˈredi/','реди','Тайёр','✅','I am ready for work.','Ман барои кор тайёрам.','adjective'),
    ]},
    { title: 'Lesson 2: Housework', tt: 'Дарси 2: Кори хона', emoji: '🧹', words: [
      W('Housework','/ˈhaʊswɜːk/','ҳаусуёрк','Кори хона','🏠','I do the housework on Sunday.','Ман рӯзи якшанбе кори хонаро мекунам.','noun'),
      W('Tidy','/ˈtaɪdi/','тайди','Тартиб додан / озода','🧺','Please tidy your room.','Лутфан ҳуҷраатро тартиб деҳ.','verb'),
      W('Sweep','/swiːp/','свип','Рӯбидан','🧹','He sweeps the floor.','Ӯ полро мерӯбад.','verb'),
      W('Dust','/dʌst/','даст','Чанг гирифтан','🌫️','I dust the shelves.','Ман чанги рафҳоро мегирам.','verb'),
      W('Laundry','/ˈlɔːndri/','лондри','Ҷомашӯӣ','🧺','She does the laundry.','Ӯ ҷомашӯӣ мекунад.','noun'),
      W('Vacuum','/ˈvækjuːm/','вакюм','Чангкашак кашидан','🧹','I vacuum the carpet.','Ман қолинро чангкашак мекашам.','verb'),
      W('Bin','/bɪn/','бин','Сатили ахлот','🗑️','Put it in the bin.','Онро ба сатили ахлот парто.','noun'),
      W('Mop','/mɒp/','моп','Пол шустан','🧽','He mops the kitchen.','Ӯ полҳои ошхонаро мешӯяд.','verb'),
      W('Chore','/tʃɔː/','чор','Кори рӯзгор','📋','Washing dishes is my chore.','Зарфшӯӣ кори рӯзгори ман аст.','noun'),
      W('Mess','/mes/','мес','Бесару сомонӣ','🌀','Your room is a mess.','Ҳуҷраи ту бесару сомон аст.','noun'),
    ]},
    { title: 'Lesson 3: Frequency And Time', tt: 'Дарси 3: Такрор ва Вақт', emoji: '⏳', words: [
      W('Usually','/ˈjuːʒuəli/','южуали','Одатан','🔁','I usually get up early.','Ман одатан барвақт мехезам.','adverb'),
      W('Often','/ˈɒfən/','офен','Аксаран','🔂','We often eat together.','Мо аксаран якҷоя хӯрок мехӯрем.','adverb'),
      W('Sometimes','/ˈsʌmtaɪmz/','самтаймз','Баъзан','🎲','Sometimes I walk to work.','Баъзан ман пиёда ба кор меравам.','adverb'),
      W('Rarely','/ˈreəli/','рэали','Кам-кам','🌙','He rarely watches TV.','Ӯ кам-кам телевизор мебинад.','adverb'),
      W('Occasionally','/əˈkeɪʒənəli/','окейжнали','Гоҳ-гоҳ','⏱️','I occasionally eat out.','Ман гоҳ-гоҳ дар берун хӯрок мехӯрам.','adverb'),
      W('Twice','/twaɪs/','твайс','Ду маротиба','2️⃣','She calls me twice a day.','Ӯ рӯзе ду бор ба ман занг мезанад.','adverb'),
      W('Daily','/ˈdeɪli/','дейли','Ҳаррӯза','📅','I read the news daily.','Ман ҳаррӯза хабарҳоро мехонам.','adjective'),
      W('Weekly','/ˈwiːkli/','викли','Ҳарҳафтаина','🗓️','We have a weekly meeting.','Мо ҷаласаи ҳарҳафтаина дорем.','adjective'),
      W('Schedule','/ˈʃedjuːl/','шедюл','Ҷадвал','📆','My schedule is very busy.','Ҷадвали ман хеле банд аст.','noun'),
      W('Routine','/ruːˈtiːn/','рутин','Тартиби ҳаррӯза','🔄','A good routine helps me.','Тартиби хуб ба ман кӯмак мекунад.','noun'),
    ]},
    { title: 'Lesson 4: Free Time And Evening', tt: 'Дарси 4: Вақти холӣ ва Шом', emoji: '🌆', words: [
      W('Relax','/rɪˈlæks/','рилакс','Истироҳат кардан','😌','I relax after work.','Ман баъди кор истироҳат мекунам.','verb'),
      W('Sunset','/ˈsʌnset/','сансет','Ғуруби офтоб','🌇','We watched the sunset.','Мо ғуруби офтобро тамошо кардем.','noun'),
      W('Nap','/næp/','нэп','Хоби кӯтоҳ','😴','He takes a short nap.','Ӯ хоби кӯтоҳ мекунад.','noun'),
      W('Chat','/tʃæt/','чэт','Сӯҳбат кардан','💬','We chat every evening.','Мо ҳар шом сӯҳбат мекунем.','verb'),
      W('Spare time','/speə taɪm/','спеа тайм','Вақти холӣ','🕰️','In my spare time I draw.','Дар вақти холӣ ман расм мекашам.','noun'),
      W('Series','/ˈsɪəriːz/','сириз','Сериал','📺','I watch a new series.','Ман сериали нав тамошо мекунам.','noun'),
      W('Diary','/ˈdaɪəri/','дайери','Рӯзнома','📔','She writes in her diary.','Ӯ дар рӯзномааш менависад.','noun'),
      W('Candle','/ˈkændl/','кэндл','Шам','🕯️','We light a candle.','Мо шам мешӯронем.','noun'),
      W('Blanket','/ˈblæŋkɪt/','блэнкет','Кӯрпа','🛏️','It is cold, take a blanket.','Ҳаво хунук аст, кӯрпа гир.','noun'),
      W('Evening walk','/ˈiːvnɪŋ wɔːk/','ивнинг уок','Сайри шом','🚶','We enjoy an evening walk.','Мо аз сайри шом лаззат мебарем.','noun'),
    ]},
    { title: 'Lesson 5: Habits And Health', tt: 'Дарси 5: Одатҳо ва Саломатӣ', emoji: '💪', words: [
      W('Habit','/ˈhæbɪt/','ҳэбит','Одат','🔁','Reading is a good habit.','Хондан одати хуб аст.','noun'),
      W('Jog','/dʒɒɡ/','ҷог','Оҳиста давидан','🏃','I jog in the park.','Ман дар боғ оҳиста медавам.','verb'),
      W('Stretch','/stretʃ/','стреч','Дароз кашидан (машқ)','🤸','Stretch before you run.','Пеш аз давидан дароз каш.','verb'),
      W('Vitamin','/ˈvɪtəmɪn/','витамин','Витамин','💊','Oranges have vitamin C.','Афлесун витамини С дорад.','noun'),
      W('Skip','/skɪp/','скип','Партофтан (нахӯрдан)','⏭️','Don\'t skip breakfast.','Наҳориро напарто.','verb'),
      W('Regular','/ˈreɡjələ/','регюлер','Мунтазам','📏','I keep a regular sleep time.','Ман вақти хоби мунтазам дорам.','adjective'),
      W('Energy','/ˈenədʒi/','энерҷи','Қувва / энергия','⚡','Sport gives me energy.','Варзиш ба ман қувва медиҳад.','noun'),
      W('Asleep','/əˈsliːp/','аслип','Дар хоб / хобида','💤','The baby is asleep.','Кӯдак дар хоб аст.','adjective'),
      W('Awake','/əˈweɪk/','ауейк','Бедор','👀','I was awake all night.','Ман тамоми шаб бедор будам.','adjective'),
      W('Fit','/fɪt/','фит','Солим / варзида','🏋️','Exercise keeps you fit.','Машқ туро солим нигоҳ медорад.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Adverbs of Frequency', lessonTitleTg: 'Дарси 6: Грамматика — Зарфҳои такрор',
      title: 'Adverbs of Frequency', titleTranslated: 'Зарфҳои такрор (чанд маротиба)', emoji: '🔁',
      explanation:
`Зарфҳои такрор нишон медиҳанд, ки амал **чанд маротиба** рӯй медиҳад:
**always** (ҳамеша) → **usually** (одатан) → **often** (аксаран) → **sometimes** (баъзан) → **rarely** (кам-кам) → **never** (ҳеҷ гоҳ).

**Ҷойгиршавӣ:**
- Пеш аз феъли асосӣ: *I **always** drink tea. She **often** reads.*
- Баъд аз феъли **be**: *He **is** always late. They **are** never tired.*

Мисол: *I usually get up at seven. He is never late for work.*`,
      rules: [
        { pattern: 'зарф + феъли асосӣ', note: 'I always walk. She often cooks.' },
        { pattern: 'be + зарф', note: 'He is usually busy. They are never rude.' },
        { pattern: 'дараҷа', note: 'always > usually > often > sometimes > rarely > never' },
        { pattern: 'never = манфӣ', note: 'бо феъли мусбат: I never smoke (на don\'t)' },
      ],
      examples: [
        { sentence: 'I always brush my teeth in the morning.', translation: 'Ман субҳ ҳамеша дандонҳоямро мешӯям.', highlight: 'always' },
        { sentence: 'She usually walks to school.', translation: 'Ӯ одатан пиёда ба мактаб меравад.', highlight: 'usually' },
        { sentence: 'We often eat dinner together.', translation: 'Мо аксаран шом якҷоя хӯрок мехӯрем.', highlight: 'often' },
        { sentence: 'He is never late.', translation: 'Ӯ ҳеҷ гоҳ дер намемонад.', highlight: 'is never' },
        { sentence: 'They rarely watch TV.', translation: 'Онҳо кам-кам телевизор мебинанд.', highlight: 'rarely' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ drink coffee in the morning. (ҳамеша)', promptTranslated:'Ман субҳ ҳамеша қаҳва менӯшам.', options:['always','am always','always am','the always'], answer:'always', explanation:'Зарф пеш аз феъли асосӣ.' },
        { type:'choose', prompt:'She ___ late for class. (ҳеҷ гоҳ)', promptTranslated:'Ӯ ҳеҷ гоҳ ба дарс дер намемонад.', options:['is never','never is','is not never','never'], answer:'is never', explanation:'Баъд аз феъли be → is never.' },
        { type:'choose', prompt:'We ___ go to the cinema. (баъзан)', promptTranslated:'Мо баъзан ба кино меравем.', options:['sometimes','are sometimes','sometimes are','the sometimes'], answer:'sometimes', explanation:'Зарф пеш аз феъли асосӣ go.' },
        { type:'fill_blank', prompt:'He ___ (often) plays football.', promptTranslated:'Ӯ аксаран футбол бозӣ мекунад.', answer:'often', explanation:'often пеш аз феъли асосӣ.' },
        { type:'fill_blank', prompt:'They are ___ (usually) at home in the evening.', promptTranslated:'Онҳо шом одатан дар хонаанд.', answer:'usually', explanation:'Баъд аз are → usually.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман одатан барвақт мехезам.', options:['I','get','usually','up','early'], answer:'I usually get up early.', explanation:'I + usually + get up + early.' },
        { type:'transform', prompt:'Ислоҳ кунед: She always is happy.', promptTranslated:'Ҷойи зарф ғалат аст.', answer:'She is always happy.', explanation:'Баъд аз be → is always.' },
        { type:'transform', prompt:'Ислоҳ кунед: I don\'t never eat meat.', promptTranslated:'never худаш манфӣ аст.', answer:'I never eat meat.', explanation:'never бо феъли мусбат меояд.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — How Often & Time Expressions', lessonTitleTg: 'Дарси 7: Грамматика — Чанд бор ва Ибораҳои вақт',
      title: 'How Often? & Frequency Expressions', titleTranslated: 'Чанд бор? ва ибораҳои такрор', emoji: '📊',
      explanation:
`Барои пурсидани **чанд маротиба** савол бо **How often...?** сохта мешавад:
*How often do you exercise? — **Three times a week**.*

**Ибораҳои такрор** (дар охири ҷумла):
- **once a day** (рӯзе як бор), **twice a week** (ҳафтае ду бор), **three times a month**
- **every day / every morning / every Sunday** (ҳар рӯз / ҳар субҳ / ҳар якшанбе)

Мисол: *I go to the gym twice a week. She calls her mother every day.*`,
      rules: [
        { pattern: 'How often + do/does + ...?', note: 'How often do you read?' },
        { pattern: 'once / twice / ... times + a + вақт', note: 'once a day, twice a week' },
        { pattern: 'every + вақт', note: 'every day, every morning, every Monday' },
        { pattern: 'ҷойгоҳ', note: 'ибораи вақт одатан дар охири ҷумла' },
      ],
      examples: [
        { sentence: 'How often do you play sports?', translation: 'Ту чанд бор варзиш мекунӣ?', highlight: 'How often' },
        { sentence: 'I clean my room once a week.', translation: 'Ман ҳафтае як бор ҳуҷраамро тоза мекунам.', highlight: 'once a week' },
        { sentence: 'She goes shopping twice a month.', translation: 'Ӯ моҳе ду бор ба харид меравад.', highlight: 'twice a month' },
        { sentence: 'We visit our grandparents every Sunday.', translation: 'Мо ҳар якшанбе ба назди бобою бибиямон меравем.', highlight: 'every Sunday' },
        { sentence: 'He checks his email three times a day.', translation: 'Ӯ рӯзе се бор почтаашро месанҷад.', highlight: 'three times a day' },
      ],
      exercises: [
        { type:'choose', prompt:'___ do you go to the gym?', promptTranslated:'Ту чанд бор ба варзишгоҳ меравӣ?', options:['How often','How many','How long','How much'], answer:'How often', explanation:'How often = чанд бор.' },
        { type:'choose', prompt:'I brush my teeth ___ a day.', promptTranslated:'Ман рӯзе ду бор дандон мешӯям.', options:['twice','two','second','double'], answer:'twice', explanation:'twice a day = рӯзе ду бор.' },
        { type:'choose', prompt:'She reads a book ___ month.', promptTranslated:'Ӯ ҳар моҳ як китоб мехонад.', options:['every','all','each of','any'], answer:'every', explanation:'every month = ҳар моҳ.' },
        { type:'fill_blank', prompt:'I water the plants ___ (1x) a day.', promptTranslated:'Ман рӯзе як бор гулҳоро об медиҳам.', answer:'once', explanation:'once = як маротиба.' },
        { type:'fill_blank', prompt:'How ___ do you call your family?', promptTranslated:'Ту чанд бор ба оилаат занг мезанӣ?', answer:'often', explanation:'How often ...?' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман ҳафтае се бор машқ мекунам.', options:['I','three','a','exercise','times','week'], answer:'I exercise three times a week.', explanation:'... three times a week.' },
        { type:'transform', prompt:'Ба савол гардонед: You go there once a week.', promptTranslated:'Савол бо How often.', answer:'How often do you go there?', explanation:'How often do you ...?' },
        { type:'transform', prompt:'Ислоҳ кунед: I go to school every days.', promptTranslated:'every бо исми танҳо меояд.', answer:'I go to school every day.', explanation:'every day (на every days).' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — A Busy Day', lessonTitleTg: 'Дарси 8: Шунавоӣ — Рӯзи серкор',
    title: 'A Busy Day', titleTranslated: 'Рӯзи серкор', emoji: '🏃',
    passage: 'Karim has a busy routine. He always wakes up at six and usually jogs in the park. After a shower, he gets dressed and has breakfast. He goes to work by bus every morning. Karim rarely eats lunch outside; he often brings food from home. In the evening he relaxes and sometimes watches a series. He goes to bed at eleven and always reads for ten minutes before sleep.',
    passageTranslated: 'Карим тартиби серкор дорад. Ӯ ҳамеша соати шаш мехезад ва одатан дар боғ оҳиста медавад. Баъди душ ӯ либос мепӯшад ва наҳорӣ мекунад. Ӯ ҳар субҳ бо автобус ба кор меравад. Карим кам-кам дар берун хӯроки нисфирӯзӣ мехӯрад; ӯ аксаран аз хона хӯрок меорад. Шом ӯ истироҳат мекунад ва баъзан сериал тамошо мекунад. Ӯ соати ёздаҳ мехобад ва пеш аз хоб ҳамеша даҳ дақиқа мехонад.',
    questions: [
      { question:'When does Karim wake up?', questionTranslated:'Карим кай мехезад?', options:['At six','At seven','At eleven'], correctIndex:0, explanation:'He always wakes up at six.' },
      { question:'What does he usually do in the morning?', questionTranslated:'Ӯ одатан субҳ чӣ мекунад?', options:['Watches TV','Jogs in the park','Sleeps'], correctIndex:1, explanation:'usually jogs in the park.' },
      { question:'How does he go to work?', questionTranslated:'Ӯ чӣ хел ба кор меравад?', options:['By car','By bus','On foot'], correctIndex:1, explanation:'by bus every morning.' },
      { question:'Does he often eat lunch outside?', questionTranslated:'Ӯ аксаран берун хӯроки нисфирӯзӣ мехӯрад?', options:['Yes, always','No, rarely','Every day'], correctIndex:1, explanation:'He rarely eats lunch outside.' },
      { question:'What does he do before sleep?', questionTranslated:'Ӯ пеш аз хоб чӣ мекунад?', options:['Reads for ten minutes','Cooks','Jogs'], correctIndex:0, explanation:'always reads for ten minutes.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — What Time Do You...?', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Соати чанд...?',
    title: 'What Time Do You...?', titleTranslated: 'Соати чанд ту...?', emoji: '🕐',
    scenario: 'Ду ҳамкурс дар бораи тартиби ҳаррӯзаи худ сӯҳбат мекунанд.',
    lines: [
      { speaker:'Sabina', text:'What time do you usually get up?', translation:'Ту одатан соати чанд мехезӣ?', isUser:false },
      { speaker:'You', text:'I usually get up at half past six.', translation:'Ман одатан соати шашу ним мехезам.', isUser:true },
      { speaker:'Sabina', text:'How often do you exercise?', translation:'Ту чанд бор машқ мекунӣ?', isUser:false },
      { speaker:'You', text:'I jog three times a week.', translation:'Ман ҳафтае се бор оҳиста медавам.', isUser:true },
      { speaker:'Sabina', text:'Do you ever cook in the morning?', translation:'Ту ягон вақт субҳ хӯрок мепазӣ?', isUser:false },
      { speaker:'You', text:'Sometimes, but I usually just make tea.', translation:'Баъзан, вале одатан танҳо чой дам мекунам.', isUser:true },
      { speaker:'Sabina', text:'What do you do in your spare time?', translation:'Дар вақти холӣ чӣ мекунӣ?', isUser:false },
      { speaker:'You', text:'I relax and read. I rarely watch TV.', translation:'Ман истироҳат мекунам ва мехонам. Кам-кам телевизор мебинам.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — My Weekend Routine', lessonTitleTg: 'Дарси 10: Хониш — Тартиби рӯзҳои истироҳати ман',
    title: 'My Weekend Routine', titleTranslated: 'Тартиби рӯзҳои истироҳати ман', emoji: '🌞',
    passage: 'On weekdays I am very busy, but weekends are different. On Saturday I usually sleep late and wake up at nine. First, I do the housework: I tidy my room, vacuum the floor, and do the laundry. In the afternoon I often meet my friends. We sometimes go for an evening walk in the park. On Sunday I rarely go out. I stay home, rest, and prepare for the new week. This routine keeps me calm and happy.',
    passageTranslated: 'Дар рӯзҳои корӣ ман хеле банд ҳастам, вале рӯзҳои истироҳат дигаранд. Рӯзи шанбе ман одатан дер мехобам ва соати нӯҳ мехезам. Аввал ман кори хонаро мекунам: ҳуҷрамро тартиб медиҳам, полро чангкашак мекашам ва ҷомашӯӣ мекунам. Баъдиаззӯҳр ман аксаран бо дӯстонам вомехӯрам. Мо баъзан ба сайри шом дар боғ меравем. Рӯзи якшанбе ман кам-кам берун мебароям. Дар хона мемонам, дам мегирам ва барои ҳафтаи нав тайёрӣ мебинам. Ин тартиб маро ором ва хушбахт нигоҳ медорад.',
    questions: [
      { question:'When does the writer wake up on Saturday?', questionTranslated:'Нависанда рӯзи шанбе кай мехезад?', options:['At six','At nine','At noon'], correctIndex:1, explanation:'wake up at nine.' },
      { question:'What does the writer do first?', questionTranslated:'Нависанда аввал чӣ мекунад?', options:['Meets friends','Does the housework','Goes shopping'], correctIndex:1, explanation:'First, I do the housework.' },
      { question:'What do they sometimes do?', questionTranslated:'Онҳо баъзан чӣ мекунанд?', options:['Play football','Go for an evening walk','Cook together'], correctIndex:1, explanation:'sometimes go for an evening walk.' },
      { question:'What does the writer do on Sunday?', questionTranslated:'Нависанда рӯзи якшанбе чӣ мекунад?', options:['Goes out a lot','Stays home and rests','Works'], correctIndex:1, explanation:'I stay home, rest.' },
    ],
  },
  review: {
    passage: 'Nodira has a simple daily routine. She always gets up early and usually does some stretches. She has breakfast at seven and goes to work at eight. Nodira often walks to the office because it is good exercise. She rarely eats fast food. In the evening she tidies the house and sometimes calls her sister. Twice a week she goes to an English class. She never goes to bed late, so she always feels fresh in the morning.',
    passageTranslated: 'Нодира тартиби ҳаррӯзаи содда дорад. Ӯ ҳамеша барвақт мехезад ва одатан каме машқ мекунад. Ӯ соати ҳафт наҳорӣ мекунад ва соати ҳашт ба кор меравад. Нодира аксаран пиёда ба идора меравад, зеро ин машқи хуб аст. Ӯ кам-кам хӯроки тез мехӯрад. Шом ӯ хонаро тартиб медиҳад ва баъзан ба хоҳараш занг мезанад. Ҳафтае ду бор ӯ ба дарси англисӣ меравад. Ӯ ҳеҷ гоҳ дер намехобад, бинобар ин ҳамеша субҳ худро тару тоза ҳис мекунад.',
    questions: [
      { question:'When does Nodira get up?', questionTranslated:'Нодира кай мехезад?', options:['At noon','Early','Late'], correctIndex:1, explanation:'always gets up early.' },
      { question:'How does she often go to work?', questionTranslated:'Ӯ аксаран чӣ хел ба кор меравад?', options:['By bus','On foot','By car'], correctIndex:1, explanation:'often walks to the office.' },
      { question:'How often does she go to English class?', questionTranslated:'Ӯ чанд бор ба дарси англисӣ меравад?', options:['Once a week','Twice a week','Every day'], correctIndex:1, explanation:'Twice a week.' },
      { question:'Does she eat fast food often?', questionTranslated:'Ӯ аксаран хӯроки тез мехӯрад?', options:['Yes','No, rarely','Every day'], correctIndex:1, explanation:'She rarely eats fast food.' },
      { question:'Why does she feel fresh?', questionTranslated:'Чаро ӯ худро тару тоза ҳис мекунад?', options:['She never goes to bed late','She sleeps all day','She drinks coffee'], correctIndex:0, explanation:'never goes to bed late.' },
    ],
  },
  exam: {
    passage: 'Two brothers, Jamshed and Sam, have very different routines. Jamshed is an early bird. He always wakes up at five, jogs daily, and never skips breakfast. His day is organised and he follows a strict schedule. Sam is the opposite. He usually gets up late and often stays awake until midnight. He rarely exercises and sometimes forgets to eat lunch. Their mother says Jamshed has healthier habits, but Sam is happier with his free routine. Both agree that a good balance is the best choice.',
    passageTranslated: 'Ду бародар — Ҷамшед ва Сэм — тартиботи хеле гуногун доранд. Ҷамшед барвақтхез аст. Ӯ ҳамеша соати панҷ мехезад, ҳаррӯза медавад ва ҳеҷ гоҳ наҳориро намепартояд. Рӯзи ӯ муназзам аст ва ӯ ҷадвали қатъиро риоя мекунад. Сэм баръакс аст. Ӯ одатан дер мехезад ва аксаран то нисфи шаб бедор мемонад. Ӯ кам-кам машқ мекунад ва баъзан хӯроки нисфирӯзиро фаромӯш мекунад. Модарашон мегӯяд, ки Ҷамшед одатҳои солимтар дорад, вале Сэм бо тартиби озодаш хушбахттар аст. Ҳарду розӣ ҳастанд, ки тавозуни хуб беҳтарин интихоб аст.',
    questions: [
      { question:'What time does Jamshed wake up?', questionTranslated:'Ҷамшед соати чанд мехезад?', options:['At late','At five','At midnight'], correctIndex:1, explanation:'always wakes up at five.' },
      { question:'How often does Jamshed jog?', questionTranslated:'Ҷамшед чанд бор медавад?', options:['Rarely','Daily','Never'], correctIndex:1, explanation:'jogs daily.' },
      { question:'What does Sam often do?', questionTranslated:'Сэм аксаран чӣ мекунад?', options:['Stays awake until midnight','Wakes up early','Exercises'], correctIndex:0, explanation:'often stays awake until midnight.' },
      { question:'Who has healthier habits?', questionTranslated:'Кӣ одатҳои солимтар дорад?', options:['Sam','Jamshed','Neither'], correctIndex:1, explanation:'Jamshed has healthier habits.' },
      { question:'What is the best choice?', questionTranslated:'Беҳтарин интихоб чист?', options:['A good balance','Sleeping late','No routine'], correctIndex:0, explanation:'a good balance is the best choice.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 3 тайёр.');
