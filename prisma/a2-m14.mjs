import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 13, title: 'Module 14: Society And The World', titleTranslated: 'Модули 14: Ҷомеа ва Ҷаҳон',
  emoji: '🌍', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Society And Community', tt: 'Дарси 1: Ҷомеа ва Маҳалла', emoji: '🏛️', words: [
      W('Community','/kəˈmjuːnəti/','комюнити','Ҷамоа / маҳалла','🏘️','Our community is friendly.','Ҷамоаи мо дӯстона аст.','noun'),
      W('Society','/səˈsaɪəti/','сосайети','Ҷомеа','🌐','Education helps society.','Маориф ба ҷомеа кӯмак мекунад.','noun'),
      W('Citizen','/ˈsɪtɪzn/','ситизн','Шаҳрванд','🪪','Every citizen has rights.','Ҳар шаҳрванд ҳуқуқ дорад.','noun'),
      W('Government','/ˈɡʌvənmənt/','гавернмент','Ҳукумат','🏛️','The government made a new law.','Ҳукумат қонуни нав қабул кард.','noun'),
      W('Law','/lɔː/','ло','Қонун','⚖️','We must obey the law.','Мо бояд ба қонун итоат кунем.','noun'),
      W('Justice','/ˈdʒʌstɪs/','ҷастис','Адолат','⚖️','People want peace and justice.','Одамон сулҳ ва адолат мехоҳанд.','noun'),
      W('Freedom','/ˈfriːdəm/','фридем','Озодӣ','🕊️','Everyone wants freedom.','Ҳама озодӣ мехоҳанд.','noun'),
      W('Population','/ˌpɒpjəˈleɪʃn/','попюлейшн','Аҳолӣ','👥','The city has a big population.','Шаҳр аҳолии зиёд дорад.','noun'),
      W('Culture','/ˈkʌltʃə/','калчер','Фарҳанг','🎭','I love Tajik culture.','Ман фарҳанги тоҷикро дӯст медорам.','noun'),
      W('Duty','/ˈdjuːti/','дюти','Вазифа / ӯҳдадорӣ','📋','Voting is a duty.','Овоздиҳӣ вазифа аст.','noun'),
    ]},
    { title: 'Lesson 2: News And Media', tt: 'Дарси 2: Хабар ва Расонаҳо', emoji: '📰', words: [
      W('Article','/ˈɑːtɪkl/','артикл','Мақола','📄','I read an interesting article.','Ман мақолаи ҷолиб хондам.','noun'),
      W('Headline','/ˈhedlaɪn/','ҳедлайн','Сарлавҳа','🗞️','The headline was shocking.','Сарлавҳа даҳшатнок буд.','noun'),
      W('Channel','/ˈtʃænl/','чэнл','Шабака (ТВ)','📺','Change the channel, please.','Лутфан шабакаро иваз кун.','noun'),
      W('Broadcast','/ˈbrɔːdkɑːst/','бродкаст','Пахш кардан (эфир)','📡','They broadcast the match live.','Онҳо бозиро мустақим пахш карданд.','verb'),
      W('Advertisement','/ədˈvɜːtɪsmənt/','адвёртисмент','Реклама','📢','I saw the advertisement online.','Ман рекламаро онлайн дидам.','noun'),
      W('Announcement','/əˈnaʊnsmənt/','анаунсмент','Эълон','📣','There was an important announcement.','Эълони муҳим буд.','noun'),
      W('Reporter','/rɪˈpɔːtə/','рипортер','Хабарнигор','🎤','The reporter asked many questions.','Хабарнигор саволҳои зиёд дод.','noun'),
      W('Fact','/fækt/','фэкт','Далел / факт','✔️','Check the facts before you share.','Пеш аз мубодила далелҳоро тафтиш кун.','noun'),
      W('Rumour','/ˈruːmə/','румер','Овоза / миш-миш','🗣️','It is only a rumour.','Ин танҳо овоза аст.','noun'),
      W('Truth','/truːθ/','трус','Ҳақиқат','💡','Always tell the truth.','Ҳамеша ҳақиқатро гӯй.','noun'),
    ]},
    { title: 'Lesson 3: The World', tt: 'Дарси 3: Ҷаҳон', emoji: '🌎', words: [
      W('Nation','/ˈneɪʃn/','нейшн','Миллат / халқ','🏳️','Every nation has its history.','Ҳар миллат таърихи худро дорад.','noun'),
      W('Border','/ˈbɔːdə/','бордер','Сарҳад','🛂','They crossed the border.','Онҳо аз сарҳад гузаштанд.','noun'),
      W('Continent','/ˈkɒntɪnənt/','континент','Қитъа','🗺️','Asia is a large continent.','Осиё қитъаи калон аст.','noun'),
      W('Region','/ˈriːdʒən/','риҷен','Минтақа / ноҳия','📍','This region is very green.','Ин минтақа хеле сабз аст.','noun'),
      W('Native','/ˈneɪtɪv/','нейтив','Бумӣ / зодгоҳӣ','🏡','Tajik is my native language.','Тоҷикӣ забони модарии ман аст.','adjective'),
      W('Immigrant','/ˈɪmɪɡrənt/','имигрант','Муҳоҷир','🧳','Many immigrants live here.','Бисёр муҳоҷирон ин ҷо зиндагӣ мекунанд.','noun'),
      W('Tradition','/trəˈdɪʃn/','традишн','Анъана','🎎','We keep our old traditions.','Мо анъанаҳои кӯҳнаамонро нигоҳ медорем.','noun'),
      W('Custom','/ˈkʌstəm/','кастем','Урфу одат','🎏','It is a local custom.','Ин урфу одати маҳаллӣ аст.','noun'),
      W('Heritage','/ˈherɪtɪdʒ/','ҳеритиҷ','Мерос (фарҳангӣ)','🏛️','The old city is world heritage.','Шаҳри кӯҳна мероси ҷаҳонист.','noun'),
      W('Capital','/ˈkæpɪtl/','кэпитл','Пойтахт','🏙️','Dushanbe is the capital.','Душанбе пойтахт аст.','noun'),
    ]},
    { title: 'Lesson 4: Taking Part', tt: 'Дарси 4: Иштирок', emoji: '✊', words: [
      W('Vote','/vəʊt/','воут','Овоз додан','🗳️','Adults can vote in elections.','Калонсолон дар интихобот овоз дода метавонанд.','verb'),
      W('Election','/ɪˈlekʃn/','илекшн','Интихобот','🗳️','The election is next month.','Интихобот моҳи оянда аст.','noun'),
      W('Protest','/prəˈtest/','протест','Эътироз кардан','📢','People protested peacefully.','Одамон осоишта эътироз карданд.','verb'),
      W('Volunteer','/ˌvɒlənˈtɪə/','волунтир','Ихтиёрӣ / доброволец','🙋','She works as a volunteer.','Ӯ ҳамчун ихтиёрӣ кор мекунад.','noun'),
      W('Charity','/ˈtʃærəti/','чэрити','Хайрия','❤️','They gave money to charity.','Онҳо ба хайрия пул доданд.','noun'),
      W('Donate','/dəʊˈneɪt/','донейт','Ҳадя / эҳсон кардан','🎁','You can donate old clothes.','Ту метавонӣ либоси кӯҳнаро эҳсон кунӣ.','verb'),
      W('Support','/səˈpɔːt/','сапорт','Дастгирӣ кардан','🤝','We support each other.','Мо ҳамдигарро дастгирӣ мекунем.','verb'),
      W('Campaign','/kæmˈpeɪn/','кэмпейн','Маърака / кампания','📣','It is a health campaign.','Ин маъракаи саломатӣ аст.','noun'),
      W('Issue','/ˈɪʃuː/','ишу','Масъала / мушкил','⚠️','Pollution is a big issue.','Ифлосшавӣ масъалаи калон аст.','noun'),
      W('Solve','/sɒlv/','солв','Ҳал кардан','🧩','We must solve this problem.','Мо бояд ин мушкилро ҳал кунем.','verb'),
    ]},
    { title: 'Lesson 5: Describing Society', tt: 'Дарси 5: Тавсифи ҷомеа', emoji: '⚖️', words: [
      W('Equal','/ˈiːkwəl/','иквал','Баробар','🟰','All people are equal.','Ҳама одамон баробаранд.','adjective'),
      W('Fair','/feə/','феа','Одилона / инсофона','⚖️','The rules must be fair.','Қоидаҳо бояд одилона бошанд.','adjective'),
      W('Public','/ˈpʌblɪk/','паблик','Ҷамъиятӣ / умумӣ','🏛️','This is a public park.','Ин боғи ҷамъиятист.','adjective'),
      W('Private','/ˈpraɪvət/','прайвет','Хусусӣ / шахсӣ','🔒','That is private property.','Ин моликияти хусусист.','adjective'),
      W('Global','/ˈɡləʊbl/','глобал','Ҷаҳонӣ / глобалӣ','🌍','Climate change is a global problem.','Тағйири иқлим мушкили ҷаҳонист.','adjective'),
      W('National','/ˈnæʃnəl/','нэшнл','Миллӣ','🏳️','Today is a national holiday.','Имрӯз иди миллист.','adjective'),
      W('Powerful','/ˈpaʊəfʊl/','пауерфул','Пурқувват / бонуфуз','💪','It is a powerful country.','Ин кишвари бонуфуз аст.','adjective'),
      W('Independent','/ˌɪndɪˈpendənt/','индипендент','Мустақил','🎌','Tajikistan is an independent nation.','Тоҷикистон миллати мустақил аст.','adjective'),
      W('Democratic','/ˌdeməˈkrætɪk/','демократик','Демократӣ','🗳️','They live in a democratic country.','Онҳо дар кишвари демократӣ зиндагӣ мекунанд.','adjective'),
      W('Diverse','/daɪˈvɜːs/','дайвёрс','Гуногун / рангоранг','🌈','Our city is very diverse.','Шаҳри мо хеле рангоранг аст.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Zero Conditional', lessonTitleTg: 'Дарси 6: Грамматика — Шарти сифрӣ',
      title: 'Zero Conditional', titleTranslated: 'Шарти сифрӣ — ҳақиқати умумӣ', emoji: '🔬',
      explanation:
`**Шарти сифрӣ** барои **ҳақиқатҳои умумӣ** ва натиҷаҳое, ки ҳамеша рост меоянд:
**If + present simple, ... present simple**
- *If you **heat** ice, it **melts**.* (Агар яхро гарм кунӣ, об мешавад — ҳамеша)
- *If it **rains**, the ground **gets** wet.*
- *Plants **die** if they **don't get** water.*

Дар ин ҷо **if** ≈ **when** (ҳар вақт). Фарқ аз шарти якум: сифрӣ = ҳамеша рост; якум = натиҷаи мушаххаси оянда (will).`,
      rules: [
        { pattern: 'If + present, present', note: 'If you mix blue and yellow, you get green.' },
        { pattern: 'ҳақиқати умумӣ / илмӣ', note: 'Water boils if you heat it to 100°.' },
        { pattern: 'if ≈ when (ҳар вақт)', note: 'If/When I am tired, I sleep.' },
        { pattern: 'фарқ аз first: бе will', note: 'сифрӣ = ҳамеша, first = оянда' },
      ],
      examples: [
        { sentence: 'If you heat water, it boils.', translation: 'Агар обро гарм кунӣ, меҷӯшад.', highlight: 'boils' },
        { sentence: 'Ice melts if the sun shines on it.', translation: 'Агар офтоб ба ях тобад, об мешавад.', highlight: 'melts if' },
        { sentence: 'If people drop litter, the city gets dirty.', translation: 'Агар одамон ахлот партоянд, шаҳр ифлос мешавад.', highlight: 'gets dirty' },
        { sentence: 'Plants die if they get no water.', translation: 'Растаниҳо агар об нагиранд, мемиранд.', highlight: 'die if' },
        { sentence: 'If you mix red and white, you get pink.', translation: 'Агар сурху сафедро омехта кунӣ, гулобӣ мешавад.', highlight: 'you get' },
      ],
      exercises: [
        { type:'choose', prompt:'If you heat ice, it ___.', promptTranslated:'Агар яхро гарм кунӣ, об мешавад.', options:['melts','will melt','melted','melt'], answer:'melts', explanation:'шарти сифрӣ → present simple.' },
        { type:'choose', prompt:'Plants die if they ___ water.', promptTranslated:'Растаниҳо агар об нагиранд, мемиранд.', options:["don't get","won't get",'didn\'t get','not get'], answer:"don't get", explanation:'present simple дар ҳар ду қисм.' },
        { type:'choose', prompt:'If it ___, the ground gets wet.', promptTranslated:'Агар борон борад, замин тар мешавад.', options:['rains','will rain','rained','rain'], answer:'rains', explanation:'If + present.' },
        { type:'choose', prompt:'Water boils if you ___ it enough.', promptTranslated:'Об агар кофӣ гарм кунӣ, меҷӯшад.', options:['heat','will heat','heated','heating'], answer:'heat', explanation:'present simple.' },
        { type:'fill_blank', prompt:'If you press this button, the machine ___ (start).', promptTranslated:'Агар ин тугмаро пахш кунӣ, дастгоҳ ба кор медарояд.', answer:'starts', explanation:'натиҷа → present (starts).' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Агар шакарро гарм кунӣ, об мешавад.', options:['If','heat','you','sugar','it','melts'], answer:'If you heat sugar it melts.', explanation:'If you heat sugar, it melts.' },
        { type:'transform', prompt:'Ислоҳ кунед: If you heat ice, it will melt always.', promptTranslated:'ҳақиқати умумӣ → present.', answer:'If you heat ice, it melts.', explanation:'шарти сифрӣ бе will.' },
        { type:'transform', prompt:'Пур кунед: If you don\'t sleep, you ___ tired.', promptTranslated:'натиҷаи умумӣ.', answer:'feel', explanation:'you feel tired (present).' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Past Continuous', lessonTitleTg: 'Дарси 7: Грамматика — Замони гузаштаи давомдор',
      title: 'Past Continuous', titleTranslated: 'Замони гузаштаи давомдор (was/were + V-ing)', emoji: '⏳',
      explanation:
`**Замони гузаштаи давомдор (Past Continuous)** барои амалҳое истифода мешавад, ки дар як вақти мушаххас дар гузашта **давом доштанд**.
**was / were + феъл-ing**
- *I **was watching** TV at 8 o'clock.* (Ман соати 8 телевизор тамошо мекардам)
- *They **were playing** football.* (Онҳо футбол бозӣ мекарданд)

Аксар вақт бо **Past Simple** барои нишон додани амале, ки амали давомдорро қатъ кард, истифода мешавад:
- *I **was reading** a book when the phone **rang**.* (Ман китоб мехондам, ки телефон занг зад)`,
      rules: [
        { pattern: 'was / were + V-ing', note: 'I was working.' },
        { pattern: 'were: you/we/they. was: I/he/she/it', note: 'He was reading. We were walking.' },
        { pattern: 'when + past simple', note: 'амали кӯтоҳе, ки қатъ кард' },
        { pattern: 'while + past continuous', note: 'амали давомдор' },
      ],
      examples: [
        { sentence: 'I was watching TV at 8 pm.', translation: 'Ман соати 8 бегоҳ телевизор тамошо мекардам.', highlight: 'was watching' },
        { sentence: 'They were playing outside.', translation: 'Онҳо дар берун бозӣ мекарданд.', highlight: 'were playing' },
        { sentence: 'She was reading when I called.', translation: 'Вақте ман занг задам, ӯ мехонд.', highlight: 'was reading ... called' },
        { sentence: 'While we were walking, it started to rain.', translation: 'Ҳангоме ки мо қадам мезадем, борон боридан гирифт.', highlight: 'were walking' },
        { sentence: 'What were you doing at 9 o\'clock?', translation: 'Соати 9 шумо чӣ кор мекардед?', highlight: 'were you doing' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ watching TV at 8 o\'clock.', promptTranslated:'Ман соати 8 телевизор тамошо мекардам.', options:['was','were','am','did'], answer:'was', explanation:'I -> was.' },
        { type:'choose', prompt:'They ___ playing football yesterday.', promptTranslated:'Онҳо дирӯз футбол бозӣ мекарданд.', options:['were','was','are','did'], answer:'were', explanation:'They -> were.' },
        { type:'choose', prompt:'I was reading when he ___.', promptTranslated:'Ман мехондам, ки ӯ омад.', options:['arrived','arriving','was arrive','arrive'], answer:'arrived', explanation:'when + past simple (амали қатъкунанда).' },
        { type:'fill_blank', prompt:'She ___ (read) a book when I called.', promptTranslated:'Вақте ман занг задам, ӯ китоб мехонд.', answer:'was reading', explanation:'past continuous -> was reading.' },
        { type:'fill_blank', prompt:'While we ___ (walk), it started to rain.', promptTranslated:'Ҳангоме ки мо қадам мезадем, борон борид.', answer:'were walking', explanation:'while + past continuous -> were walking.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман соати 8 телевизор тамошо мекардам.', options:['I','watching','TV','was','at 8'], answer:'I was watching TV at 8.', explanation:'I was watching TV at 8.' },
        { type:'transform', prompt:'Ислоҳ кунед: We was walking in the park.', promptTranslated:'were барои we.', answer:'We were walking in the park.', explanation:'We -> were.' },
        { type:'transform', prompt:'Ба давомдор гузаронед: I watched TV at 8.', promptTranslated:'past continuous кунед.', answer:'I was watching TV at 8.', explanation:'I was watching...' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — A Volunteer Project', lessonTitleTg: 'Дарси 8: Шунавоӣ — Лоиҳаи ихтиёриён',
    title: 'A Volunteer Project', titleTranslated: 'Лоиҳаи ихтиёриён', emoji: '🙋',
    passage: 'Last summer, a group of young citizens started a community project. Their region had a big problem with rubbish, so they decided to solve it. Every weekend, dozens of volunteers cleaned the streets and parks. They also started a campaign to teach people about recycling. "If everyone helps a little, we can change our city," said the leader. A local newspaper wrote an article about them, and soon more people joined. The government supported the project and gave them equipment. Now the city is much cleaner. The story shows that if citizens work together, they can improve their community.',
    passageTranslated: 'Тобистони гузашта, як гурӯҳ шаҳрвандони ҷавон лоиҳаи ҷамоатӣ оғоз карданд. Минтақаи онҳо бо ахлот мушкили калон дошт, бинобар ин онҳо қарор доданд онро ҳал кунанд. Ҳар рӯзи истироҳат, даҳҳо ихтиёрӣ кӯчаҳо ва боғҳоро тоза мекарданд. Онҳо инчунин маърака оғоз карданд, то ба одамон дар бораи коркарди дубора омӯзанд. «Агар ҳар кас каме кӯмак кунад, мо метавонем шаҳрамонро тағйир диҳем», гуфт роҳбар. Рӯзномаи маҳаллӣ дар бораи онҳо мақола навишт ва ба зудӣ одамони бештар ҳамроҳ шуданд. Ҳукумат лоиҳаро дастгирӣ кард ва ба онҳо таҷҳизот дод. Ҳоло шаҳр хеле тозатар аст. Ҳикоя нишон медиҳад, ки агар шаҳрвандон якҷоя кор кунанд, метавонанд ҷамоаашонро беҳтар кунанд.',
    questions: [
      { question:'What problem did the region have?', questionTranslated:'Минтақа кадом мушкилро дошт?', options:['A big rubbish problem','No water','Too many cars'], correctIndex:0, explanation:'a big problem with rubbish.' },
      { question:'What did the volunteers do?', questionTranslated:'Ихтиёриён чӣ карданд?', options:['Cleaned streets and parks','Sold food','Built houses'], correctIndex:0, explanation:'cleaned the streets and parks.' },
      { question:'What did they teach people about?', questionTranslated:'Онҳо ба одамон дар бораи чӣ омӯзонданд?', options:['Recycling','Cooking','Driving'], correctIndex:0, explanation:'a campaign to teach people about recycling.' },
      { question:'Who supported the project?', questionTranslated:'Лоиҳаро кӣ дастгирӣ кард?', options:['The government','A company','No one'], correctIndex:0, explanation:'The government supported the project.' },
      { question:'What is the message of the story?', questionTranslated:'Паёми ҳикоя чист?', options:['Together citizens can improve their community','One person can do nothing','Money solves everything'], correctIndex:0, explanation:'if citizens work together, they can improve their community.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — What Were You Doing?', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Шумо чӣ кор мекардед?',
    title: 'What Were You Doing?', titleTranslated: 'Шумо чӣ кор мекардед?', emoji: '💬',
    scenario: 'Ду дӯст дар бораи ҳодисаи дирӯза сӯҳбат мекунанд.',
    lines: [
      { speaker:'Dilshod', text:'What were you doing yesterday at 5 o\'clock?', translation:'Ту дирӯз соати 5 чӣ кор мекардӣ?', isUser:false },
      { speaker:'You', text:'I was watching the news on TV. Why?', translation:'Ман дар телевизор хабар тамошо мекардам. Чаро?', isUser:true },
      { speaker:'Dilshod', text:'There was a big protest in the city centre.', translation:'Дар маркази шаҳр эътирози калон буд.', isUser:false },
      { speaker:'You', text:'Really? I didn\'t know. Were people protesting peacefully?', translation:'Дар ҳақиқат? Ман намедонистам. Одамон осоишта эътироз мекарданд?', isUser:true },
      { speaker:'Dilshod', text:'Yes, they were holding signs when the mayor arrived.', translation:'Бале, онҳо шиорҳо доштанд, вақте ки шаҳрдор омад.', isUser:false },
      { speaker:'You', text:'What happened then?', translation:'Баъд чӣ шуд?', isUser:true },
      { speaker:'Dilshod', text:'He listened to them. The government promised to help.', translation:'Ӯ ба онҳо гӯш дод. Ҳукумат ваъда дод, ки кӯмак мекунад.', isUser:false },
      { speaker:'You', text:'That is good news for our community.', translation:'Ин хабари хуб барои ҷамоаи мо аст.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — The Power Of One Person', lessonTitleTg: 'Дарси 10: Хониш — Қудрати як нафар',
    title: 'The Power Of One Person', titleTranslated: 'Қудрати як нафар', emoji: '✊',
    passage: 'Many people think that one person cannot change society. They believe that if you are not powerful or wealthy, you cannot make a difference. But history shows that this is not true. A single citizen with a strong idea can start a movement. If a person volunteers, helps a neighbour, or joins a good campaign, they make their community a little better. Small actions add up. When everyone gives a little time to charity, society improves quickly. Great changes often begin with one brave voice. So if you want a better world, do not wait for others. Start with yourself, in your own street, today.',
    passageTranslated: 'Бисёр одамон фикр мекунанд, ки як нафар наметавонад ҷомеаро тағйир диҳад. Онҳо боварӣ доранд, ки агар пурқувват ё сарватманд набошӣ, наметавонӣ таъсир расонӣ. Вале таърих нишон медиҳад, ки ин рост нест. Як шаҳрванди танҳо бо фикри қавӣ метавонад ҳаракатеро оғоз кунад. Агар шахс ихтиёрӣ кор кунад, ба ҳамсоя кӯмак кунад ё ба маъракаи хуб ҳамроҳ шавад, ҷамоаашро каме беҳтар мекунад. Амалҳои хурд ҷамъ мешаванд. Вақте ки ҳама каме вақт ба хайрия медиҳанд, ҷомеа зуд беҳтар мешавад. Тағйиротҳои бузург аксаран аз як овози далер оғоз мешаванд. Пас агар ҷаҳони беҳтар мехоҳӣ, ба дигарон интизор нашав. Аз худат, дар кӯчаи худат, имрӯз оғоз кун.',
    questions: [
      { question:'What do many people wrongly believe?', questionTranslated:'Бисёр одамон нодуруст чӣ бовар мекунанд?', options:['One person cannot change society','Society is perfect','Everyone is powerful'], correctIndex:0, explanation:'one person cannot change society.' },
      { question:'What can a single citizen start?', questionTranslated:'Як шаҳрванд чиро оғоз карда метавонад?', options:['A movement','Nothing','A war'], correctIndex:0, explanation:'can start a movement.' },
      { question:'What happens when everyone gives time to charity?', questionTranslated:'Вақте ҳама вақт ба хайрия медиҳанд, чӣ мешавад?', options:['Nothing','Society improves quickly','Society gets worse'], correctIndex:1, explanation:'society improves quickly.' },
      { question:'How do great changes often begin?', questionTranslated:'Тағйироти бузург аксаран чӣ тавр оғоз мешаванд?', options:['With money','With one brave voice','With governments only'], correctIndex:1, explanation:'begin with one brave voice.' },
      { question:'What is the final advice?', questionTranslated:'Маслиҳати ниҳоӣ чист?', options:['Start with yourself today','Do nothing','Wait for others'], correctIndex:0, explanation:'Start with yourself, in your own street, today.' },
    ],
  },
  review: {
    passage: 'Every society faces problems, but it also has the power to solve them. In a healthy community, citizens know their rights and their duties. They obey fair laws, respect each other\'s culture, and take part in public life. When there is an election, good citizens vote. When there is a problem, they do not only complain; they look for solutions. If people ignore their community, problems grow. But if they work together, share the truth, and support good causes, the whole nation becomes stronger. A country is not just its government or its borders; it is its people. If the people are active and kind, the future of the society is bright.',
    passageTranslated: 'Ҳар ҷомеа бо мушкилот рӯ ба рӯ мешавад, вале қудрати ҳалли онҳоро низ дорад. Дар ҷамоаи солим, шаҳрвандон ҳуқуқ ва вазифаҳои худро медонанд. Онҳо ба қонунҳои одилона итоат мекунанд, фарҳанги якдигарро эҳтиром мекунанд ва дар ҳаёти ҷамъиятӣ иштирок мекунанд. Вақте интихобот мешавад, шаҳрвандони хуб овоз медиҳанд. Вақте мушкил ҳаст, онҳо танҳо шикоят намекунанд; роҳи ҳал ҷустуҷӯ мекунанд. Агар одамон ба ҷамоаашон беэътиноӣ кунанд, мушкилот меафзоянд. Вале агар онҳо якҷоя кор кунанд, ҳақиқатро мубодила кунанд ва корҳои хайрро дастгирӣ кунанд, тамоми миллат қавитар мешавад. Кишвар танҳо ҳукумат ё сарҳадҳояш нест; он мардумаш аст. Агар мардум фаъол ва меҳрубон бошанд, ояндаи ҷомеа равшан аст.',
    questions: [
      { question:'What do citizens in a healthy community know?', questionTranslated:'Шаҳрвандони ҷамоаи солим чиро медонанд?', options:['Their rights and duties','Nothing','Only their rights'], correctIndex:0, explanation:'citizens know their rights and their duties.' },
      { question:'What do good citizens do at an election?', questionTranslated:'Шаҳрвандони хуб ҳангоми интихобот чӣ мекунанд?', options:['They leave','They vote','They complain'], correctIndex:1, explanation:'good citizens vote.' },
      { question:'What happens if people ignore their community?', questionTranslated:'Агар одамон ба ҷамоа беэътиноӣ кунанд, чӣ мешавад?', options:['Problems disappear','Nothing changes','Problems grow'], correctIndex:2, explanation:'If people ignore their community, problems grow.' },
      { question:'What is a country, really?', questionTranslated:'Кишвар дар асл чист?', options:['Only its government','Its people','Only its borders'], correctIndex:1, explanation:'A country is ... its people.' },
      { question:'When is the future bright?', questionTranslated:'Оянда кай равшан аст?', options:['If people are quiet','If people are rich','If people are active and kind'], correctIndex:2, explanation:'If the people are active and kind.' },
    ],
  },
  exam: {
    passage: 'We live in a connected world where news travels in seconds. Every day, television, newspapers, and the internet give us thousands of stories. This is powerful, but it also brings a challenge: how do we know what is true? Not everything we read is a fact; some of it is just rumour or advertisement. A good citizen learns to think carefully. If you read a shocking headline, check the facts before you share it. When everyone shares false stories, society becomes confused and divided. But if people value the truth, support honest media, and respect different opinions, the community stays strong. Knowledge is a kind of freedom. In the modern world, the ability to find the truth is one of the most important skills a person can have.',
    passageTranslated: 'Мо дар ҷаҳони пайваст зиндагӣ мекунем, ки дар он хабар дар сонияҳо паҳн мешавад. Ҳар рӯз телевизион, рӯзномаҳо ва интернет ба мо ҳазорон ҳикоя медиҳанд. Ин пурқувват аст, вале душворӣ низ меорад: мо чӣ тавр медонем, ки чӣ рост аст? На ҳама чизе, ки мехонем, далел аст; баъзеаш танҳо овоза ё реклама аст. Шаҳрванди хуб меомӯзад, ки бодиққат фикр кунад. Агар сарлавҳаи даҳшатнокро хонӣ, пеш аз мубодила далелҳоро тафтиш кун. Вақте ки ҳама ҳикояҳои бардурӯғро мубодила мекунанд, ҷомеа саросема ва тақсим мешавад. Вале агар одамон ба ҳақиқат арзиш диҳанд, расонаҳои ростқавлро дастгирӣ кунанд ва ақидаҳои гуногунро эҳтиром кунанд, ҷамоа қавӣ мемонад. Дониш як навъи озодӣ аст. Дар ҷаҳони муосир, қобилияти ёфтани ҳақиқат яке аз муҳимтарин малакаҳоест, ки инсон дошта метавонад.',
    questions: [
      { question:'What challenge does fast news bring?', questionTranslated:'Хабари зуд кадом душвориро меорад?', options:['Knowing what is true','Too few stories','No electricity'], correctIndex:0, explanation:'how do we know what is true?' },
      { question:'What is not everything we read?', questionTranslated:'На ҳама чизи хондаамон чист?', options:['A lie','A book','A fact'], correctIndex:2, explanation:'Not everything we read is a fact.' },
      { question:'What should you do with a shocking headline?', questionTranslated:'Бо сарлавҳаи даҳшатнок чӣ бояд кунӣ?', options:['Share it fast','Check the facts before sharing','Believe it'], correctIndex:1, explanation:'check the facts before you share it.' },
      { question:'What happens when everyone shares false stories?', questionTranslated:'Вақте ҳама ҳикояи бардурӯғ паҳн мекунанд, чӣ мешавад?', options:['Nothing','Society becomes confused and divided','Society improves'], correctIndex:1, explanation:'society becomes confused and divided.' },
      { question:'What is one of the most important modern skills?', questionTranslated:'Яке аз муҳимтарин малакаҳои муосир чист?', options:['Fast typing','Watching TV','The ability to find the truth'], correctIndex:2, explanation:'the ability to find the truth.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 14 тайёр.');
