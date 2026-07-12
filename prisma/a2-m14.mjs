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
      lessonTitle: 'Lesson 7: Grammar — Second Conditional', lessonTitleTg: 'Дарси 7: Грамматика — Шарти дуюм',
      title: 'Second Conditional', titleTranslated: 'Шарти дуюм — тасаввурӣ (агар...мебудам)', emoji: '💭',
      explanation:
`**Шарти дуюм** барои вазъияти **тасаввурӣ ё ғайривоқеӣ** дар ҳозира/оянда:
**If + past simple, ... would + феъли асосӣ**
- *If I **were** rich, I **would** travel the world.* (Агар бой мебудам, сафар мекардам — вале нестам)
- *If I **had** more time, I **would** help you.*

Диққат: барои "be" аксаран **were** барои ҳама шахсон (If I **were** you...). *would* ≈ "мекардам". Фарқ аз шарти якум: якум = имконпазир (will); дуюм = хаёлӣ/ғайривоқеӣ (would).`,
      rules: [
        { pattern: 'If + past simple, would + феъл', note: 'If I had money, I would buy it.' },
        { pattern: 'were барои ҳама (be)', note: 'If I were you, I would rest.' },
        { pattern: 'вазъияти ғайривоқеӣ/хаёлӣ', note: 'If I won the lottery...' },
        { pattern: 'фарқ аз first: would на will', note: 'дуюм = хаёлӣ' },
      ],
      examples: [
        { sentence: 'If I were rich, I would travel a lot.', translation: 'Агар бой мебудам, бисёр сафар мекардам.', highlight: 'were ... would travel' },
        { sentence: 'If I had time, I would help you.', translation: 'Агар вақт медоштам, ба ту кӯмак мекардам.', highlight: 'had ... would help' },
        { sentence: 'If I were you, I would apologise.', translation: 'Агар ман ҷои ту мебудам, узр мехостам.', highlight: 'were you' },
        { sentence: 'What would you do if you won a million?', translation: 'Агар як миллион мебурдӣ, чӣ мекардӣ?', highlight: 'would you do if' },
        { sentence: 'If she studied more, she would pass.', translation: 'Агар ӯ бештар мехонд, месупорид.', highlight: 'studied ... would pass' },
      ],
      exercises: [
        { type:'choose', prompt:'If I ___ rich, I would help others.', promptTranslated:'Агар бой мебудам, ба дигарон кӯмак мекардам.', options:['were','am','will be','be'], answer:'were', explanation:'шарти дуюм → past (were).' },
        { type:'choose', prompt:'If I had money, I ___ buy a house.', promptTranslated:'Агар пул медоштам, хона мехаридам.', options:['would','will','am','did'], answer:'would', explanation:'натиҷа → would + феъл.' },
        { type:'choose', prompt:'If I ___ you, I would rest.', promptTranslated:'Агар ҷои ту мебудам, дам мегирифтам.', options:['were','am','was being','will be'], answer:'were', explanation:'If I were you.' },
        { type:'choose', prompt:'She would travel if she ___ more time.', promptTranslated:'Агар вақти бештар медошт, сафар мекард.', options:['had','has','will have','have'], answer:'had', explanation:'If + past (had).' },
        { type:'fill_blank', prompt:'If I won the lottery, I ___ (buy) a car.', promptTranslated:'Агар лотереяро мебурдам, мошин мехаридам.', answer:'would buy', explanation:'would + buy.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Агар вақт медоштам, сафар мекардам.', options:['If','had','I','time','would','I','travel'], answer:'If I had time I would travel.', explanation:'If I had time, I would travel.' },
        { type:'transform', prompt:'Ислоҳ кунед: If I would be rich, I would travel.', promptTranslated:'дар if — past, на would.', answer:'If I were rich, I would travel.', explanation:'If I were (past), would дар натиҷа.' },
        { type:'transform', prompt:'Ислоҳ кунед: If I was you, I would go.', promptTranslated:'бо were.', answer:'If I were you, I would go.', explanation:'If I were you (шарти дуюм).' },
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
      { question:'What did the volunteers do?', questionTranslated:'Ихтиёриён чӣ карданд?', options:['Cleaned streets and parks','Built houses','Sold food'], correctIndex:0, explanation:'cleaned the streets and parks.' },
      { question:'What did they teach people about?', questionTranslated:'Онҳо ба одамон дар бораи чӣ омӯзонданд?', options:['Recycling','Cooking','Driving'], correctIndex:0, explanation:'a campaign to teach people about recycling.' },
      { question:'Who supported the project?', questionTranslated:'Лоиҳаро кӣ дастгирӣ кард?', options:['The government','A company','No one'], correctIndex:0, explanation:'The government supported the project.' },
      { question:'What is the message of the story?', questionTranslated:'Паёми ҳикоя чист?', options:['Together citizens can improve their community','Money solves everything','One person can do nothing'], correctIndex:0, explanation:'if citizens work together, they can improve their community.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — If I Could Change One Thing', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Агар як чизро тағйир медодам',
    title: 'If I Could Change One Thing', titleTranslated: 'Агар як чизро тағйир медодам', emoji: '💭',
    scenario: 'Ду дӯст дар бораи он ки агар қудрат медоштанд, дар ҷомеа чиро тағйир медоданд, сӯҳбат мекунанд.',
    lines: [
      { speaker:'Dilshod', text:'If you could change one thing in the world, what would it be?', translation:'Агар як чизро дар ҷаҳон тағйир дода метавонистӣ, он чӣ мебуд?', isUser:false },
      { speaker:'You', text:'If I had the power, I would give every child an education.', translation:'Агар қудрат медоштам, ба ҳар кӯдак маълумот медодам.', isUser:true },
      { speaker:'Dilshod', text:'That is a great idea. Education is a basic right.', translation:'Ин фикри олист. Маориф ҳуқуқи асосӣ аст.', isUser:false },
      { speaker:'You', text:'What about you? What would you do?', translation:'Ту чӣ? Ту чӣ мекардӣ?', isUser:true },
      { speaker:'Dilshod', text:'If I were a leader, I would protect the environment.', translation:'Агар роҳбар мебудам, муҳити зистро ҳифз мекардам.', isUser:false },
      { speaker:'You', text:'We could start small, in our own community.', translation:'Мо метавонем аз хурд, дар ҷамоаи худамон оғоз кунем.', isUser:true },
      { speaker:'Dilshod', text:'Exactly. If everyone helped, the world would be better.', translation:'Маҳз ҳамин. Агар ҳама кӯмак мекарданд, ҷаҳон беҳтар мебуд.', isUser:false },
      { speaker:'You', text:'Then let\'s be the change we want to see.', translation:'Пас биё ҳамон тағйире бошем, ки мехоҳем бинем.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — The Power Of One Person', lessonTitleTg: 'Дарси 10: Хониш — Қудрати як нафар',
    title: 'The Power Of One Person', titleTranslated: 'Қудрати як нафар', emoji: '✊',
    passage: 'Many people think that one person cannot change society. They believe that if you are not powerful or wealthy, you cannot make a difference. But history shows that this is not true. A single citizen with a strong idea can start a movement. If a person volunteers, helps a neighbour, or joins a good campaign, they make their community a little better. Small actions add up. If everyone gave a little time to charity, society would improve quickly. Great changes often begin with one brave voice. So if you want a better world, do not wait for others. Start with yourself, in your own street, today.',
    passageTranslated: 'Бисёр одамон фикр мекунанд, ки як нафар наметавонад ҷомеаро тағйир диҳад. Онҳо боварӣ доранд, ки агар пурқувват ё сарватманд набошӣ, наметавонӣ таъсир расонӣ. Вале таърих нишон медиҳад, ки ин рост нест. Як шаҳрванди танҳо бо фикри қавӣ метавонад ҳаракатеро оғоз кунад. Агар шахс ихтиёрӣ кор кунад, ба ҳамсоя кӯмак кунад ё ба маъракаи хуб ҳамроҳ шавад, ҷамоаашро каме беҳтар мекунад. Амалҳои хурд ҷамъ мешаванд. Агар ҳама каме вақт ба хайрия медоданд, ҷомеа зуд беҳтар мешуд. Тағйиротҳои бузург аксаран аз як овози далер оғоз мешаванд. Пас агар ҷаҳони беҳтар мехоҳӣ, ба дигарон интизор нашав. Аз худат, дар кӯчаи худат, имрӯз оғоз кун.',
    questions: [
      { question:'What do many people wrongly believe?', questionTranslated:'Бисёр одамон нодуруст чӣ бовар мекунанд?', options:['One person cannot change society','Everyone is powerful','Society is perfect'], correctIndex:0, explanation:'one person cannot change society.' },
      { question:'What can a single citizen start?', questionTranslated:'Як шаҳрванд чиро оғоз карда метавонад?', options:['A movement','A war','Nothing'], correctIndex:0, explanation:'can start a movement.' },
      { question:'What would happen if everyone gave time to charity?', questionTranslated:'Агар ҳама вақт ба хайрия медоданд, чӣ мешуд?', options:['Society would improve quickly','Nothing','Society would get worse'], correctIndex:0, explanation:'society would improve quickly.' },
      { question:'How do great changes often begin?', questionTranslated:'Тағйироти бузург аксаран чӣ тавр оғоз мешаванд?', options:['With one brave voice','With money','With governments only'], correctIndex:0, explanation:'begin with one brave voice.' },
      { question:'What is the final advice?', questionTranslated:'Маслиҳати ниҳоӣ чист?', options:['Start with yourself today','Wait for others','Do nothing'], correctIndex:0, explanation:'Start with yourself, in your own street, today.' },
    ],
  },
  review: {
    passage: 'Every society faces problems, but it also has the power to solve them. In a healthy community, citizens know their rights and their duties. They obey fair laws, respect each other\'s culture, and take part in public life. When there is an election, good citizens vote. When there is a problem, they do not only complain; they look for solutions. If people ignore their community, problems grow. But if they work together, share the truth, and support good causes, the whole nation becomes stronger. A country is not just its government or its borders; it is its people. If the people are active and kind, the future of the society is bright.',
    passageTranslated: 'Ҳар ҷомеа бо мушкилот рӯ ба рӯ мешавад, вале қудрати ҳалли онҳоро низ дорад. Дар ҷамоаи солим, шаҳрвандон ҳуқуқ ва вазифаҳои худро медонанд. Онҳо ба қонунҳои одилона итоат мекунанд, фарҳанги якдигарро эҳтиром мекунанд ва дар ҳаёти ҷамъиятӣ иштирок мекунанд. Вақте интихобот мешавад, шаҳрвандони хуб овоз медиҳанд. Вақте мушкил ҳаст, онҳо танҳо шикоят намекунанд; роҳи ҳал ҷустуҷӯ мекунанд. Агар одамон ба ҷамоаашон беэътиноӣ кунанд, мушкилот меафзоянд. Вале агар онҳо якҷоя кор кунанд, ҳақиқатро мубодила кунанд ва корҳои хайрро дастгирӣ кунанд, тамоми миллат қавитар мешавад. Кишвар танҳо ҳукумат ё сарҳадҳояш нест; он мардумаш аст. Агар мардум фаъол ва меҳрубон бошанд, ояндаи ҷомеа равшан аст.',
    questions: [
      { question:'What do citizens in a healthy community know?', questionTranslated:'Шаҳрвандони ҷамоаи солим чиро медонанд?', options:['Their rights and duties','Only their rights','Nothing'], correctIndex:0, explanation:'citizens know their rights and their duties.' },
      { question:'What do good citizens do at an election?', questionTranslated:'Шаҳрвандони хуб ҳангоми интихобот чӣ мекунанд?', options:['They vote','They leave','They complain'], correctIndex:0, explanation:'good citizens vote.' },
      { question:'What happens if people ignore their community?', questionTranslated:'Агар одамон ба ҷамоа беэътиноӣ кунанд, чӣ мешавад?', options:['Problems grow','Problems disappear','Nothing changes'], correctIndex:0, explanation:'If people ignore their community, problems grow.' },
      { question:'What is a country, really?', questionTranslated:'Кишвар дар асл чист?', options:['Its people','Only its government','Only its borders'], correctIndex:0, explanation:'A country is ... its people.' },
      { question:'When is the future bright?', questionTranslated:'Оянда кай равшан аст?', options:['If people are active and kind','If people are rich','If people are quiet'], correctIndex:0, explanation:'If the people are active and kind.' },
    ],
  },
  exam: {
    passage: 'We live in a connected world where news travels in seconds. Every day, television, newspapers, and the internet give us thousands of stories. This is powerful, but it also brings a challenge: how do we know what is true? Not everything we read is a fact; some of it is just rumour or advertisement. A good citizen learns to think carefully. If you read a shocking headline, check the facts before you share it. If everyone shared false stories, society would become confused and divided. But if people value the truth, support honest media, and respect different opinions, the community stays strong. Knowledge is a kind of freedom. In the modern world, the ability to find the truth is one of the most important skills a person can have.',
    passageTranslated: 'Мо дар ҷаҳони пайваст зиндагӣ мекунем, ки дар он хабар дар сонияҳо паҳн мешавад. Ҳар рӯз телевизион, рӯзномаҳо ва интернет ба мо ҳазорон ҳикоя медиҳанд. Ин пурқувват аст, вале душворӣ низ меорад: мо чӣ тавр медонем, ки чӣ рост аст? На ҳама чизе, ки мехонем, далел аст; баъзеаш танҳо овоза ё реклама аст. Шаҳрванди хуб меомӯзад, ки бодиққат фикр кунад. Агар сарлавҳаи даҳшатнокро хонӣ, пеш аз мубодила далелҳоро тафтиш кун. Агар ҳама ҳикояҳои бардурӯғро мубодила мекарданд, ҷомеа саросема ва тақсим мешуд. Вале агар одамон ба ҳақиқат арзиш диҳанд, расонаҳои ростқавлро дастгирӣ кунанд ва ақидаҳои гуногунро эҳтиром кунанд, ҷамоа қавӣ мемонад. Дониш як навъи озодӣ аст. Дар ҷаҳони муосир, қобилияти ёфтани ҳақиқат яке аз муҳимтарин малакаҳоест, ки инсон дошта метавонад.',
    questions: [
      { question:'What challenge does fast news bring?', questionTranslated:'Хабари зуд кадом душвориро меорад?', options:['Knowing what is true','No electricity','Too few stories'], correctIndex:0, explanation:'how do we know what is true?' },
      { question:'What is not everything we read?', questionTranslated:'На ҳама чизи хондаамон чист?', options:['A fact','A lie','A book'], correctIndex:0, explanation:'Not everything we read is a fact.' },
      { question:'What should you do with a shocking headline?', questionTranslated:'Бо сарлавҳаи даҳшатнок чӣ бояд кунӣ?', options:['Check the facts before sharing','Share it fast','Believe it'], correctIndex:0, explanation:'check the facts before you share it.' },
      { question:'What would happen if everyone shared false stories?', questionTranslated:'Агар ҳама ҳикояи бардурӯғ паҳн мекарданд, чӣ мешуд?', options:['Society would become confused and divided','Nothing','Society would improve'], correctIndex:0, explanation:'society would become confused and divided.' },
      { question:'What is one of the most important modern skills?', questionTranslated:'Яке аз муҳимтарин малакаҳои муосир чист?', options:['The ability to find the truth','Watching TV','Fast typing'], correctIndex:0, explanation:'the ability to find the truth.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 14 тайёр.');
