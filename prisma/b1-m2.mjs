import { W, buildModule, refreshExisting, bumpVersion, done } from './b1-module-builder.mjs';

const M = {
  order: 2, title: 'Module 2: Education and Work', titleTranslated: 'Модули 2: Таҳсилот ва Кор',
  emoji: '💼', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: University Life', tt: 'Дарси 1: Ҳаёти донишҷӯӣ', emoji: '🎓', words: [
      W('Degree','/dɪˈɡriː/','дигрӣ','Дараҷаи илмӣ / диплом','📜','She has a master\'s degree in economics.','Ӯ дараҷаи магистрӣ дар соҳаи иқтисод дорад.','noun'),
      W('Scholarship','/ˈskɒləʃɪp/','сколаршип','Стипендия','💰','He won a scholarship to study abroad.','Ӯ барои таҳсил дар хориҷа стипендия ба даст овард.','noun'),
      W('Assignment','/əˈsaɪnmənt/','асайнмэнт','Супориш / вазифа','📝','I have to finish my assignment by Friday.','Ман бояд супоришамро то рӯзи ҷумъа тамом кунам.','noun'),
      W('Graduate','/ˈɡrædʒueɪt/','грэҷуэйт','Хатм кардан / хатмкунанда','🎓','He will graduate from university next year.','Ӯ соли оянда донишгоҳро хатм мекунад.','verb'),
      W('Lecture','/ˈlektʃə(r)/','лекча','Лексия / маърӯза','👨‍🏫','The professor gave an interesting lecture.','Профессор лексияи шавқовар хонд.','noun'),
      W('Tuition','/tjuˈɪʃn/','тюишн','Пули таҳсил','💸','The tuition fee is very high here.','Пули таҳсил дар ин ҷо хеле баланд аст.','noun'),
      W('Curriculum','/kəˈrɪkjələm/','кэрикюлэм','Барномаи таълимӣ','📚','Coding is part of the school curriculum.','Барномасозӣ қисми барномаи таълимӣ аст.','noun'),
      W('Knowledge','/ˈnɒlɪdʒ/','нолиҷ','Дониш','🧠','Reading books improves your knowledge.','Хондани китобҳо дониши шуморо беҳтар мекунад.','noun'),
      W('Skill','/skɪl/','скил','Маҳорат','🛠️','Communication is an important skill.','Муошират маҳорати муҳим аст.','noun'),
      W('Goal','/ɡəʊl/','гоул','Мақсад / ҳадаф','🎯','My goal is to graduate with high marks.','Мақсади ман бо баҳоҳои баланд хатм кардан аст.','noun'),
    ]},
    { title: 'Lesson 2: Finding a Job', tt: 'Дарси 2: Ёфтани кор', emoji: '🔍', words: [
      W('Experience','/ɪkˈspɪəriəns/','икспириэнс','Таҷриба','📈','Do you have any experience in sales?','Оё шумо ягон таҷриба дар фурӯш доред?','noun'),
      W('Qualification','/ˌkwɒlɪfɪˈkeɪʃn/','кволификейшн','Ихтисос / тахассус','🏅','What are your qualifications for this job?','Тахассуси шумо барои ин кор чист?','noun'),
      W('Interview','/ˈɪntəvjuː/','интэрвю','Мусоҳиба','🤝','I have a job interview tomorrow.','Ман пагоҳ мусоҳибаи корӣ дорам.','noun'),
      W('Application','/ˌæplɪˈkeɪʃn/','эпликейшн','Ариза / дархост','📄','Please send your application by email.','Лутфан аризаи худро тавассути почтаи электронӣ фиристед.','noun'),
      W('Apply','/əˈplaɪ/','эплай','Ариза додан','✍️','I decided to apply for the position.','Ман қарор додам, ки барои вазифа ариза диҳам.','verb'),
      W('Hire','/ˈhaɪə(r)/','ҳайа','Ба кор гирифтан','🤝','They want to hire an experienced manager.','Онҳо мехоҳанд мудири ботаҷрибаро ба кор гиранд.','verb'),
      W('Unemployed','/ˌʌnɪmˈplɔɪd/','анимплойд','Бекор (бе ҷои кор)','🤷','He has been unemployed for six months.','Ӯ шаш моҳ боз бекор аст.','adjective'),
      W('Opportunity','/ˌɒpəˈtjuːnəti/','опортюнити','Имконият','🚪','This is a great opportunity to learn.','Ин имконияти олӣ барои омӯхтан аст.','noun'),
      W('Successful','/səkˈsesfl/','сэксэсфул','Муваффақ','🌟','The interview was very successful.','Мусоҳиба хеле муваффақ буд.','adjective'),
      W('Earn','/ɜːn/','эрн','Пул кор кардан','💵','How much do you earn in your new job?','Дар кори наватон чӣ қадар пул кор мекунед?','verb'),
    ]},
    { title: 'Lesson 3: At the Workplace', tt: 'Дарси 3: Дар ҷои кор', emoji: '🏢', words: [
      W('Promotion','/prəˈməʊʃn/','промоушн','Баландшавии мансаб','📈','She got a promotion after working hard.','Ӯ баъд аз меҳнати сахт мансабаш баланд шуд.','noun'),
      W('Salary','/ˈsæləri/','сэлэри','Маош / музди меҳнат','💰','They offered him a very good salary.','Онҳо ба ӯ маоши хеле хуб пешниҳод карданд.','noun'),
      W('Colleague','/ˈkɒliːɡ/','колиг','Ҳамкор','🧑‍💼','My colleagues are very supportive.','Ҳамкорони ман хеле дастгирикунандаанд.','noun'),
      W('Employee','/ɪmˈplɔɪiː/','имплой-и','Коргар / корманд','👷','The company has over 500 employees.','Ширкат зиёда аз 500 корманд дорад.','noun'),
      W('Employer','/ɪmˈplɔɪə(r)/','имплой-а','Корфармо','👔','Her employer gave her an extra week of holiday.','Корфармои ӯ як ҳафтаи иловагии рухсатӣ дод.','noun'),
      W('Manage','/ˈmænɪdʒ/','мэниҷ','Идора кардан','📋','It is hard to manage a large team.','Идора кардани дастаи калон душвор аст.','verb'),
      W('Responsibility','/rɪˌspɒnsəˈbɪləti/','риспонсибилити','Масъулият','⚖️','It is the manager\'s responsibility to train staff.','Омӯзонидани кормандон масъулияти мудир аст.','noun'),
      W('Deadline','/ˈdedlaɪn/','дедлайн','Мӯҳлати ниҳоӣ','⏰','We must finish before the deadline.','Мо бояд пеш аз мӯҳлати ниҳоӣ тамом кунем.','noun'),
      W('Pressure','/ˈpreʃə(r)/','преша','Фишор','💥','She handles pressure very well.','Ӯ бо фишор хеле хуб мубориза мебарад.','noun'),
      W('Challenging','/ˈtʃælɪndʒɪŋ/','чэлинҷинг','Душвор ва талабгор','🧗','Teaching is a challenging profession.','Омӯзгорӣ касби душвор аст.','adjective'),
    ]},
    { title: 'Lesson 4: Work Phrasal Verbs', tt: 'Дарси 4: Феълҳои таркибии кор', emoji: '💼', words: [
      W('Take over','/teɪk ˈəʊvə/','тейк оувэ','Масъулиятро ба ӯҳда гирифтан','🤝','She will take over the project next week.','Ӯ ҳафтаи оянда лоиҳаро ба ӯҳда мегирад.','verb'),
      W('Give up','/ɡɪv ʌp/','гив ап','Таслим шудан / даст кашидан','🏳️','Never give up on your dreams.','Ҳеҷ гоҳ аз орзуҳои худ даст накашед.','verb'),
      W('Turn down','/tɜːn daʊn/','тёрн даун','Рад кардан (пешниҳодро)','❌','He turned down the job offer.','Ӯ пешниҳоди корро рад кард.','verb'),
      W('Look forward to','/lʊk ˈfɔːwəd tu/','лук форвед ту','Бесаброна интизор шудан','🤩','I look forward to hearing from you.','Ман интизори посухи шумо ҳастам.','verb'),
      W('Fill in','/fɪl ɪn/','фил ин','Пур кардан (варақаро)','📝','Please fill in this application form.','Лутфан ин варақаи аризаро пур кунед.','verb'),
      W('Carry out','/ˈkæri aʊt/','кэри аут','Иҷро кардан (вазифаро)','✅','We need to carry out some tests.','Мо бояд баъзе санҷишҳоро иҷро кунем.','verb'),
      W('Sort out','/sɔːt aʊt/','сорт аут','Ҳал кардан (мушкилро)','🔧','I will sort out the problem immediately.','Ман мушкилро фавран ҳал мекунам.','verb'),
      W('Fire','/ˈfaɪə(r)/','файа','Аз кор пеш кардан','🚪','He was fired for being late.','Ӯро барои дер мондан аз кор пеш карданд.','verb'),
      W('Resign','/rɪˈzaɪn/','ризайн','Истеъфо додан','👋','The manager decided to resign.','Мудир қарор дод, ки истеъфо диҳад.','verb'),
      W('Retire','/rɪˈtaɪə(r)/','ритайа','Ба нафақа баромадан','👴','My grandfather will retire next month.','Бобои ман моҳи оянда ба нафақа мебарояд.','verb'),
    ]}
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 5: Grammar — Passive Voice (Present)', lessonTitleTg: 'Дарси 5: Грамматика — Сиғаи маҷҳул (Ҳозира)',
      title: 'Passive Voice (Present Simple)', titleTranslated: 'Сиғаи маҷҳул (Замони ҳозираи оддӣ)', emoji: '🏗️',
      explanation:
`Passive Voice (Сиғаи маҷҳул) вақте истифода мешавад, ки барои мо худи амал (чӣ шуд?) аз иҷрокунандаи он (кӣ кард?) муҳимтар аст. Дар ин ҳолат, объект (чизе ки ба он амал равона шудааст) ба ҷои аввал меояд.

Сохтор дар Present Simple: **am/is/are + V3 (Past Participle)**

Мисол:
* Active: *They make cars in Germany.* (Онҳо дар Олмон мошин месозанд).
* Passive: *Cars **are made** in Germany.* (Мошинҳо дар Олмон сохта мешаванд).

* Active: *Someone cleans the office every day.* (Касе ҳар рӯз идораро тоза мекунад).
* Passive: *The office **is cleaned** every day.* (Идора ҳар рӯз тоза карда мешавад).

Агар мо хоҳем иҷрокунандаро нишон диҳем, аз пешвандки **by** истифода мебарем:
* *This app **is used** by millions of people.* (Ин барнома аз ҷониби миллионҳо одамон истифода мешавад).`,
      rules: [
        { pattern: 'am/is/are + V3', note: 'The room is cleaned every day.' },
        { pattern: 'am/is/are + not + V3', note: 'These phones are not made in China.' },
        { pattern: 'Am/Is/Are + Subject + V3?', note: 'Is English spoken here?' },
      ],
      examples: [
        { sentence: 'Millions of emails are sent every minute.', translation: 'Дар як дақиқа миллионҳо мактубҳои электронӣ фиристода мешаванд.', highlight: 'are sent' },
        { sentence: 'The meeting is held in the main conference room.', translation: 'Маҷлис дар толори асосии конфронс баргузор мегардад.', highlight: 'is held' },
        { sentence: 'Is this software used by many companies?', translation: 'Оё ин нармафзор аз ҷониби бисёр ширкатҳо истифода мешавад?', highlight: 'Is ... used' },
        { sentence: 'Employees are not allowed to smoke inside.', translation: 'Ба кормандон иҷозати сигоркашӣ дар дохил дода намешавад.', highlight: 'are not allowed' },
      ],
      exercises: [
        { type:'choose', prompt:'English ___ in many countries around the world.', promptTranslated:'Забони англисӣ дар бисёр кишварҳои ҷаҳон гап зада мешавад.', options:['is spoken','speaks','is speak','are spoken'], answer:'is spoken', explanation:'Забон худаш гап намезанад, балки "гап зада мешавад", бинобар ин is spoken.' },
        { type:'choose', prompt:'These computers ___ in Taiwan.', promptTranslated:'Ин компютерҳо дар Тайван сохта мешаванд.', options:['are made','made','is made','make'], answer:'are made', explanation:'Компютерҳо (ҷамъ) -> are made.' },
        { type:'fill_blank', prompt:'The office ___ (тоза карда мешавад) every evening.', promptTranslated:'Идора ҳар шом тоза карда мешавад.', answer:'is cleaned', explanation:'Идора якто аст -> is + V3 (cleaned).' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Миллионҳо мактубҳо ҳар рӯз фиристода мешаванд.', options:['Millions of','are','sent','every day','emails'], answer:'Millions of emails are sent every day.', explanation:'Millions of emails are sent every day.' },
        { type:'transform', prompt:'Ба Passive табдил диҳед: They pay the salary on Friday.', promptTranslated:'Маош рӯзи ҷумъа пардохт карда мешавад.', answer:'The salary is paid on Friday.', explanation:'The salary is paid on Friday.' },
      ],
    },
    {
      lessonTitle: 'Lesson 6: Grammar — Passive Voice (Past)', lessonTitleTg: 'Дарси 6: Грамматика — Сиғаи маҷҳул (Гузашта)',
      title: 'Passive Voice (Past Simple)', titleTranslated: 'Сиғаи маҷҳул (Замони гузаштаи оддӣ)', emoji: '🏛️',
      explanation:
`Барои сохтани Passive дар замони гузашта (Past Simple), мо ба ҷои am/is/are аз **was/were** истифода мебарем. V3 (Past Participle) бетағйир мемонад.

Сохтор дар Past Simple: **was/were + V3 (Past Participle)**

Мисолҳо:
* Active: *Shakespeare wrote Hamlet.* (Шекспир Ҳамлетро навишт).
* Passive: *Hamlet **was written** by Shakespeare.* (Ҳамлет аз ҷониби Шекспир навишта шуд).

* Active: *They didn't invite me to the party.* (Онҳо маро ба базм даъват накарданд).
* Passive: *I **was not invited** to the party.* (Ман ба базм даъват карда нашудам).

* Active: *When did they build this bridge?* (Онҳо ин пулро кай сохтанд?).
* Passive: *When **was this bridge built**?* (Ин пул кай сохта шуд?).`,
      rules: [
        { pattern: 'was/were + V3', note: 'The letter was sent yesterday.' },
        { pattern: 'was/were + not + V3', note: 'The documents were not signed.' },
        { pattern: 'Was/Were + Subject + V3?', note: 'Was the window broken by the boys?' },
      ],
      examples: [
        { sentence: 'My car was stolen last night.', translation: 'Мошини ман шаби гузашта дуздида шуд.', highlight: 'was stolen' },
        { sentence: 'The pyramids were built thousands of years ago.', translation: 'Аҳромҳо ҳазорҳо сол пеш сохта шуда буданд.', highlight: 'were built' },
        { sentence: 'Where was this photo taken?', translation: 'Ин акс дар куҷо гирифта шудааст?', highlight: 'was ... taken' },
        { sentence: 'The thief was caught by the police.', translation: 'Дуздида аз ҷониби полис дастгир карда шуд.', highlight: 'was caught' },
      ],
      exercises: [
        { type:'choose', prompt:'Harry Potter ___ by J.K. Rowling.', promptTranslated:'Гарри Поттер аз ҷониби Ҷ.К. Роулинг навишта шудааст.', options:['was written','wrote','is written','writes'], answer:'was written', explanation:'Дар гузашта навишта шудааст -> was written.' },
        { type:'choose', prompt:'We ___ to the manager\'s office yesterday.', promptTranslated:'Дирӯз мо ба идораи мудир даъват карда шудем.', options:['were invited','was invited','invited','are invited'], answer:'were invited', explanation:'We (ҷамъ) + гузашта -> were invited.' },
        { type:'fill_blank', prompt:'The bridge ___ (сохта шуд) in 1990.', promptTranslated:'Пул соли 1990 сохта шуд.', answer:'was built', explanation:'Пул якто аст ва дар гузашта сохта шудааст -> was built.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ин мошинҳо дар куҷо сохта шудаанд?', options:['Where','these cars','were','made','?'], answer:'Where were these cars made?', explanation:'Where were these cars made?' },
        { type:'transform', prompt:'Ба Passive табдил диҳед: Somebody stole my wallet.', promptTranslated:'Ҳамёни ман дуздида шуд.', answer:'My wallet was stolen.', explanation:'My wallet was stolen.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 7: Listening — The First Interview', lessonTitleTg: 'Дарси 7: Шунавоӣ — Аввалин Мусоҳиба',
    title: 'The First Job Interview', titleTranslated: 'Аввалин Мусоҳибаи Корӣ', emoji: '🎧',
    passage: 'Mark had just graduated from university with a degree in economics. He was looking for his first job and had applied to several companies. Finally, he received an email inviting him for an interview at a large bank. The interview was scheduled for Monday morning. Mark was very nervous. He prepared by reading about the company and practicing his answers. When he arrived, he was introduced to the manager. The manager asked him about his skills, his education, and his goals for the future. Although Mark did not have much experience, he spoke confidently. A few days later, he was offered the job. He was thrilled because it was a great opportunity to start his career.',
    passageTranslated: 'Марк навакак донишгоҳро бо дараҷаи иқтисод хатм карда буд. Ӯ дар ҷустуҷӯи кори аввалини худ буд ва ба чанд ширкат ариза дода буд. Ниҳоят, ӯ мактуби электроние гирифт, ки ӯро ба мусоҳиба дар як бонки калон даъват мекард. Мусоҳиба барои субҳи рӯзи душанбе ба нақша гирифта шуда буд. Марк хеле хавотир буд. Ӯ бо хондан дар бораи ширкат ва машқ кардани ҷавобҳои худ омодагӣ дид. Вақте ки ӯ расид, ӯро ба мудир шинос карданд. Мудир аз ӯ дар бораи маҳоратҳо, таҳсилот ва ҳадафҳои ояндааш пурсид. Гарчанде ки Марк таҷрибаи зиёд надошт, вале бо боварӣ гап зад. Пас аз чанд рӯз, ба ӯ кор пешниҳод карда шуд. Ӯ ба ваҷд омад, зеро ин як имконияти олӣ барои оғози фаъолияти ӯ буд.',
    questions: [
      { question:'What degree did Mark graduate with?', questionTranslated:'Марк бо кадом дараҷа хатм кард?', options:['Economics','Engineering','Medicine'], correctIndex:0, explanation:'graduated from university with a degree in economics.' },
      { question:'Where was the interview?', questionTranslated:'Мусоҳиба дар куҷо буд?', options:['At a school','At a large bank','At a hospital'], correctIndex:1, explanation:'at a large bank.' },
      { question:'How did Mark prepare for the interview?', questionTranslated:'Марк чӣ гуна ба мусоҳиба омода шуд?', options:['He slept all day','He read about the company','He bought a new suit'], correctIndex:1, explanation:'reading about the company and practicing his answers.' },
      { question:'Did Mark have a lot of experience?', questionTranslated:'Оё Марк таҷрибаи зиёд дошт?', options:['Yes, ten years','No, he did not have much experience','He was already a manager'], correctIndex:1, explanation:'Although Mark did not have much experience...' },
      { question:'What happened a few days later?', questionTranslated:'Пас аз чанд рӯз чӣ шуд?', options:['He was offered the job','He failed the interview','He was fired'], correctIndex:0, explanation:'A few days later, he was offered the job.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 8: Speaking — A Job Interview', lessonTitleTg: 'Дарси 8: Гуфтугӯ — Мусоҳибаи Корӣ',
    title: 'A Job Interview', titleTranslated: 'Мусоҳибаи Корӣ', emoji: '🤝',
    scenario: 'Шумо дар мусоҳибаи корӣ қарор доред. Мудир аз шумо дар бораи таҷриба ва ҳадафҳоятон мепурсад.',
    lines: [
      { speaker:'Manager', text:'Good morning. Please take a seat. Can you tell me a little about your previous experience?', translation:'Субҳ ба хайр. Лутфан нишинед. Оё метавонед дар бораи таҷрибаи гузаштаатон каме нақл кунед?', isUser:false },
      { speaker:'You', text:'Good morning. Thank you. I have been working in marketing for three years.', translation:'Субҳ ба хайр. Ташаккур. Ман се сол боз дар бахши маркетинг кор мекунам.', isUser:true },
      { speaker:'Manager', text:'That sounds impressive. Why do you want to work for our company?', translation:'Ин аъло садо медиҳад. Чаро шумо мехоҳед дар ширкати мо кор кунед?', isUser:false },
      { speaker:'You', text:'Your company is known for its innovation. I am looking for a challenging environment.', translation:'Ширкати шумо бо навовариҳояш маълум аст. Ман дар ҷустуҷӯи муҳити душвор ва шавқовар ҳастам.', isUser:true },
      { speaker:'Manager', text:'What do you consider to be your greatest strength?', translation:'Шумо бузургтарин нуқтаи қавии худро чӣ меҳисобед?', isUser:false },
      { speaker:'You', text:'I am highly organized and I work well under pressure.', translation:'Ман хеле бонизом ҳастам ва зери фишор хуб кор мекунам.', isUser:true },
      { speaker:'Manager', text:'That is good to hear. Deadlines are very important in this role.', translation:'Шунидани ин хуб аст. Мӯҳлатҳои ниҳоӣ дар ин вазифа хеле муҳиманд.', isUser:false },
      { speaker:'You', text:'I understand. In my previous job, deadlines were always met by my team.', translation:'Мефаҳмам. Дар кори қаблии ман, мӯҳлатҳои ниҳоӣ ҳамеша аз ҷониби дастаи ман риоя мешуданд.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 9: Reading — The Modern Workplace', lessonTitleTg: 'Дарси 9: Хониш — Муҳити кории муосир',
    title: 'The Modern Workplace', titleTranslated: 'Муҳити кории муосир', emoji: '🏢',
    passage: 'The modern workplace has changed significantly over the last decade. In the past, employees were expected to work strictly from nine to five in a traditional office. Today, flexible working hours and remote work are offered by many forward-thinking companies. This shift was accelerated by global events, which proved that productivity is not tied to a specific location. Furthermore, the focus has shifted towards employee well-being and mental health. Open-plan offices are being redesigned to include quiet zones, and regular breaks are encouraged. Teamwork and collaboration are highly valued, but managers also understand the importance of independent tasks. Technology plays a crucial role; video conferences and instant messaging apps are used daily to keep everyone connected. As a result, the boundary between work and personal life has become somewhat blurred, presenting a new challenge for modern professionals.',
    passageTranslated: 'Муҳити кории муосир дар давоми даҳсолаи охир ба таври назаррас тағйир ёфтааст. Дар гузашта интизор мерафт, ки коргарон ба таври қатъӣ аз нӯҳ то панҷ дар идораи анъанавӣ кор кунанд. Имрӯз соатҳои кории тағйирпазир ва кори фосилавӣ аз ҷониби бисёре аз ширкатҳои пешрафта пешниҳод карда мешаванд. Ин тағйирот тавассути рӯйдодҳои ҷаҳонӣ суръат гирифт, ки собит кард, ки маҳсулнокӣ ба макони мушаххас вобаста нест. Илова бар ин, тамаркуз ба некӯаҳволӣ ва солимии равонии коргарон равона шудааст. Идораҳои нақшаашон кушода аз нав тарҳрезӣ мешаванд, то минтақаҳои оромро дар бар гиранд ва танаффусҳои мунтазам ташвиқ карда мешаванд. Кори дастаҷамъӣ ва ҳамкорӣ хеле қадр карда мешавад, аммо роҳбарон инчунин аҳамияти вазифаҳои мустақилро мефаҳманд. Технология нақши муҳим мебозад; конфронсҳои видеоӣ ва барномаҳои паёмрасонии фаврӣ ҳамарӯза барои пайваст нигоҳ доштани ҳама истифода мешаванд. Дар натиҷа, сарҳад байни кору ҳаёти шахсӣ то андозае норавшан шудааст, ки ин як мушкилоти нав барои мутахассисони муосир мебошад.',
    questions: [
      { question:'How were employees expected to work in the past?', questionTranslated:'Дар гузашта интизор мерафт, ки коргарон чӣ гуна кор кунанд?', options:['From nine to five in an office','From home all the time','Flexible hours only'], correctIndex:0, explanation:'strictly from nine to five in a traditional office.' },
      { question:'What are many companies offering today?', questionTranslated:'Имрӯз бисёр ширкатҳо чӣ пешниҳод мекунанд?', options:['Lower salaries','Flexible working hours and remote work','Only night shifts'], correctIndex:1, explanation:'flexible working hours and remote work are offered by many forward-thinking companies.' },
      { question:'What are open-plan offices including now?', questionTranslated:'Идораҳои муосири нақшаашон кушода ҳоло чиро дар бар мегиранд?', options:['Quiet zones','More desks','Larger kitchens'], correctIndex:0, explanation:'redesigned to include quiet zones.' },
      { question:'What plays a crucial role in modern work?', questionTranslated:'Дар кори муосир чӣ нақши муҳим мебозад?', options:['Technology','Coffee','Paper'], correctIndex:0, explanation:'Technology plays a crucial role.' },
      { question:'What has become blurred as a result?', questionTranslated:'Дар натиҷа чӣ норавшан шудааст?', options:['The vision of managers','The boundary between work and personal life','Computer screens'], correctIndex:1, explanation:'the boundary between work and personal life has become somewhat blurred.' },
    ],
  },
  review: {
    passage: 'When entering the professional world, having a good degree is just the beginning. During an interview, managers look for skills like communication and the ability to work under pressure. Many young people face challenges when they start their first job, but they shouldn\'t give up easily. In modern offices, a lot of tasks are done using computers, and emails are sent every minute. If you work hard, you might be offered a promotion or a higher salary. However, balancing work and personal life is essential. Remember, success is not achieved overnight; it requires patience, hard work, and continuous learning.',
    passageTranslated: 'Ҳангоми ворид шудан ба ҷаҳони касбӣ, доштани дараҷаи хуб танҳо оғоз аст. Ҳангоми мусоҳиба, мудирон маҳоратҳоеро ба мисли муошират ва қобилияти кор кардан зери фишор меҷӯянд. Бисёр ҷавонон ҳангоми оғози кори аввалини худ бо мушкилот рӯбарӯ мешаванд, аммо онҳо набояд ба осонӣ таслим шаванд. Дар идораҳои муосир, бисёр вазифаҳо бо истифодаи компютерҳо иҷро карда мешаванд ва мактубҳои электронӣ ҳар дақиқа фиристода мешаванд. Агар шумо сахт кор кунед, ба шумо метавонад баландшавии мансаб ё маоши баландтар пешниҳод карда шавад. Бо вуҷуди ин, мувозинати кор ва ҳаёти шахсӣ муҳим аст. Дар хотир доред, ки муваффақият дар як шаб ба даст намеояд; он сабр, меҳнати сахт ва омӯзиши пайвастаро талаб мекунад.',
    questions: [
      { question:'What do managers look for during an interview?', questionTranslated:'Ҳангоми мусоҳиба мудирон чиро меҷӯянд?', options:['Only a degree','Skills like communication','A lot of money'], correctIndex:1, explanation:'managers look for skills like communication.' },
      { question:'What should young people NOT do when facing challenges?', questionTranslated:'Ҷавонон ҳангоми рӯбарӯ шудан бо мушкилот бояд чӣ кор НАКУНАНД?', options:['Ask for help','Work harder','Give up easily'], correctIndex:2, explanation:'they shouldn\'t give up easily.' },
      { question:'How are many tasks done in modern offices?', questionTranslated:'Дар идораҳои муосир бисёр вазифаҳо чӣ гуна иҷро карда мешаванд?', options:['By hand','Using computers','By the manager'], correctIndex:1, explanation:'a lot of tasks are done using computers.' },
      { question:'What might you be offered if you work hard?', questionTranslated:'Агар шумо сахт кор кунед, ба шумо чӣ пешниҳод карда шуда метавонад?', options:['A promotion or higher salary','Less work','A longer holiday'], correctIndex:0, explanation:'you might be offered a promotion or a higher salary.' },
      { question:'What does success require?', questionTranslated:'Муваффақият чиро талаб мекунад?', options:['Only luck','Patience, hard work, and continuous learning','A rich family'], correctIndex:1, explanation:'it requires patience, hard work, and continuous learning.' },
    ],
  },
  exam: {
    passage: 'To succeed in today\'s competitive job market, education and practical experience are both vital. Universities provide a strong foundation of knowledge, but practical skills are often learned on the job. When writing an application, it is important to highlight your strengths. During an interview, confidence is key. Once hired, employees are expected to meet deadlines and take on responsibilities. Sometimes, new staff are trained by experienced colleagues. In many global companies, meetings are held in English, making language skills extremely valuable. Ultimately, those who look forward to challenges and adapt quickly are the ones who build the most successful careers.',
    passageTranslated: 'Барои муваффақ шудан дар бозори рақобатпазири кории имрӯза, таҳсилот ва таҷрибаи амалӣ ҳарду ҳаётан муҳиманд. Донишгоҳҳо заминаи мустаҳками донишро фароҳам меоранд, аммо малакаҳои амалӣ аксар вақт дар ҷараёни кор омӯхта мешаванд. Ҳангоми навиштани ариза, муҳим аст, ки нуқтаҳои қавии худро қайд кунед. Ҳангоми мусоҳиба, боварӣ калидӣ аст. Пас аз ба кор гирифтан, аз кормандон интизор меравад, ки мӯҳлатҳои ниҳоиро риоя кунанд ва масъулиятро ба дӯш гиранд. Баъзан кормандони нав аз ҷониби ҳамкорони ботаҷриба омӯзонида мешаванд. Дар бисёр ширкатҳои ҷаҳонӣ, вохӯриҳо бо забони англисӣ гузаронида мешаванд, ки ин малакаҳои забонро бениҳоят арзишманд месозад. Дар ниҳоят, онҳое, ки мушкилотро бесаброна интизор мешаванд ва зуд мутобиқ мешаванд, ҳамонҳоянд, ки фаъолияти муваффақтаринро месозанд.',
    questions: [
      { question:'What are both vital in today\'s job market?', questionTranslated:'Дар бозори кории имрӯза кадом ду чиз ҳаётан муҳим аст?', options:['Education and practical experience','Money and luck','A car and a house'], correctIndex:0, explanation:'education and practical experience are both vital.' },
      { question:'Where are practical skills often learned?', questionTranslated:'Малакаҳои амалӣ аксар вақт дар куҷо омӯхта мешаванд?', options:['At university','On the job','At home'], correctIndex:1, explanation:'practical skills are often learned on the job.' },
      { question:'What is key during an interview?', questionTranslated:'Ҳангоми мусоҳиба чӣ калидӣ аст?', options:['Confidence','Wearing expensive clothes','Speaking quietly'], correctIndex:0, explanation:'During an interview, confidence is key.' },
      { question:'Who trains new staff sometimes?', questionTranslated:'Баъзан кормандони навро кӣ меомӯзонад?', options:['The university','Experienced colleagues','The customers'], correctIndex:1, explanation:'new staff are trained by experienced colleagues.' },
      { question:'Why are language skills valuable in global companies?', questionTranslated:'Чаро малакаҳои забон дар ширкатҳои ҷаҳонӣ арзишманданд?', options:['Because meetings are held in English','To read menus','To travel on holiday'], correctIndex:0, explanation:'meetings are held in English, making language skills extremely valuable.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 2 (B1) тайёр.');
