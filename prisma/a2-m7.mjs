import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 6, title: 'Module 7: Work And Jobs', titleTranslated: 'Модули 7: Кор ва Касбҳо',
  emoji: '💼', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Jobs And Professions', tt: 'Дарси 1: Касбу ҳунарҳо', emoji: '👷', words: [
      W('Engineer','/ˌendʒɪˈnɪə/','инҷинир','Муҳандис','🛠️','My brother is an engineer.','Бародарам муҳандис аст.','noun'),
      W('Lawyer','/ˈlɔːjə/','лойер','Ҳуқуқшинос / адвокат','⚖️','She works as a lawyer.','Ӯ ҳамчун ҳуқуқшинос кор мекунад.','noun'),
      W('Accountant','/əˈkaʊntənt/','акаунтент','Муҳосиб','🧮','The accountant checks the money.','Муҳосиб пулро тафтиш мекунад.','noun'),
      W('Journalist','/ˈdʒɜːnəlɪst/','ҷёрналист','Рӯзноманигор','🎙️','A journalist writes the news.','Рӯзноманигор хабарҳоро менависад.','noun'),
      W('Architect','/ˈɑːkɪtekt/','аркитект','Меъмор','📐','The architect designs buildings.','Меъмор биноҳоро тарҳрезӣ мекунад.','noun'),
      W('Electrician','/ɪˌlekˈtrɪʃən/','электришн','Барқчӣ','💡','Call an electrician for the lights.','Барои чароғҳо барқчиро даъват кун.','noun'),
      W('Plumber','/ˈplʌmə/','пламер','Сантехник','🔧','The plumber fixed the pipe.','Сантехник қубурро таъмир кард.','noun'),
      W('Manager','/ˈmænɪdʒə/','менеҷер','Мудир / роҳбар','👔','The manager leads the team.','Мудир дастаро роҳбарӣ мекунад.','noun'),
      W('Waiter','/ˈweɪtə/','вейтер','Пешхизмат','🍽️','The waiter brought the menu.','Пешхизмат менюро овард.','noun'),
      W('Chef','/ʃef/','шеф','Ошпаз (сарошпаз)','👨‍🍳','The chef cooks amazing food.','Сарошпаз хӯроки аҷоиб мепазад.','noun'),
    ]},
    { title: 'Lesson 2: At Work', tt: 'Дарси 2: Дар ҷои кор', emoji: '🏢', words: [
      W('Company','/ˈkʌmpəni/','кампани','Ширкат','🏢','She works for a big company.','Ӯ дар ширкати калон кор мекунад.','noun'),
      W('Firm','/fɜːm/','фёрм','Фирма','🏬','It is a small law firm.','Ин фирмаи хурди ҳуқуқӣ аст.','noun'),
      W('Meeting','/ˈmiːtɪŋ/','митинг','Ҷаласа / вохӯрӣ','📋','We have a meeting at ten.','Мо соати даҳ ҷаласа дорем.','noun'),
      W('Interview','/ˈɪntəvjuː/','интервю','Мусоҳиба','🗣️','I have a job interview today.','Ман имрӯз мусоҳибаи корӣ дорам.','noun'),
      W('Staff','/stɑːf/','стаф','Кормандон','👥','The staff are very friendly.','Кормандон хеле дӯстонаанд.','noun'),
      W('Salary','/ˈsæləri/','салари','Маош','💰','He earns a good salary.','Ӯ маоши хуб мегирад.','noun'),
      W('Contract','/ˈkɒntrækt/','контракт','Шартнома','📄','I signed a one-year contract.','Ман шартномаи яксола имзо кардам.','noun'),
      W('Shift','/ʃɪft/','шифт','Баст / навбат (корӣ)','🕗','She works the night shift.','Ӯ дар басти шабона кор мекунад.','noun'),
      W('Deadline','/ˈdedlaɪn/','дедлайн','Мӯҳлат','⏰','The deadline is on Friday.','Мӯҳлат рӯзи ҷумъа аст.','noun'),
      W('Employee','/ɪmˈplɔɪiː/','имплойи','Корманд','🧑‍💼','The company has fifty employees.','Ширкат панҷоҳ корманд дорад.','noun'),
    ]},
    { title: 'Lesson 3: Work Actions', tt: 'Дарси 3: Амалҳои корӣ', emoji: '⚙️', words: [
      W('Apply','/əˈplaɪ/','аплай','Ариза додан / муроҷиат','✍️','I want to apply for the job.','Ман мехоҳам барои кор ариза диҳам.','verb'),
      W('Employ','/ɪmˈplɔɪ/','имплой','Ба кор гирифтан','🧑‍💼','The company employs 200 people.','Ширкат 200 нафарро ба кор гирифтааст.','verb'),
      W('Hire','/ˈhaɪə/','ҳайер','Киро / ба кор қабул кардан','🤝','They hired a new manager.','Онҳо мудири нав ба кор қабул карданд.','verb'),
      W('Earn','/ɜːn/','ёрн','Кор карда пул ёфтан','💵','How much do you earn?','Ту чӣ қадар пул кор мекунӣ?','verb'),
      W('Manage','/ˈmænɪdʒ/','менеҷ','Идора кардан','📊','She manages a big team.','Ӯ дастаи калонро идора мекунад.','verb'),
      W('Organise','/ˈɔːɡənaɪz/','органайз','Ташкил кардан','🗂️','I organise the meetings.','Ман ҷаласаҳоро ташкил мекунам.','verb'),
      W('Deliver','/dɪˈlɪvə/','деливер','Расонидан','📦','They deliver the goods on time.','Онҳо молро саривақт мерасонанд.','verb'),
      W('Repair','/rɪˈpeə/','рипеа','Таъмир кардан','🔧','He can repair any machine.','Ӯ ҳар мошинро таъмир карда метавонад.','verb'),
      W('Design','/dɪˈzaɪn/','дизайн','Тарҳрезӣ кардан','🎨','She designs websites.','Ӯ вебсайтҳоро тарҳрезӣ мекунад.','verb'),
      W('Promote','/prəˈməʊt/','промоут','Ба мансаб таъин кардан','⬆️','They promoted her to manager.','Онҳо ӯро ба мудир таъин карданд.','verb'),
    ]},
    { title: 'Lesson 4: Job Qualities', tt: 'Дарси 4: Сифатҳои корӣ', emoji: '⭐', words: [
      W('Experienced','/ɪkˈspɪəriənst/','икспириенст','Ботаҷриба','🎖️','We need an experienced worker.','Ба мо коргари ботаҷриба лозим аст.','adjective'),
      W('Skilled','/skɪld/','скилд','Моҳир / устод','🛠️','He is a skilled mechanic.','Ӯ механики моҳир аст.','adjective'),
      W('Reliable','/rɪˈlaɪəbl/','рилайебл','Боэътимод','✅','She is a reliable employee.','Ӯ корманди боэътимод аст.','adjective'),
      W('Creative','/kriˈeɪtɪv/','криэйтив','Эҷодкор','💡','A designer must be creative.','Дизайнер бояд эҷодкор бошад.','adjective'),
      W('Ambitious','/æmˈbɪʃəs/','амбишес','Ормонманд / соҳибмақсад','🚀','He is young and ambitious.','Ӯ ҷавон ва соҳибмақсад аст.','adjective'),
      W('Professional','/prəˈfeʃənl/','профешнл','Касбӣ / профессионалӣ','🎓','Her work is very professional.','Кори ӯ хеле касбӣ аст.','adjective'),
      W('Part-time','/ˌpɑːtˈtaɪm/','парт-тайм','Нопурра (кор)','🕐','I have a part-time job.','Ман кори нопурра дорам.','adjective'),
      W('Full-time','/ˌfʊlˈtaɪm/','фул-тайм','Пурра (кор)','🕘','She has a full-time job.','Ӯ кори пурра дорад.','adjective'),
      W('Stressful','/ˈstresfʊl/','стресфул','Пурташвиш','😰','His job is very stressful.','Кори ӯ хеле пурташвиш аст.','adjective'),
      W('Rewarding','/rɪˈwɔːdɪŋ/','ривординг','Қаноатбахш','🌟','Teaching is a rewarding job.','Муаллимӣ кори қаноатбахш аст.','adjective'),
    ]},
    { title: 'Lesson 5: Office And Career', tt: 'Дарси 5: Идора ва Касб', emoji: '🗂️', words: [
      W('Report','/rɪˈpɔːt/','рипорт','Ҳисобот','📑','I wrote a long report.','Ман ҳисоботи дароз навиштам.','noun'),
      W('Document','/ˈdɒkjumənt/','докюмент','Ҳуҷҷат','📃','Please sign this document.','Лутфан ин ҳуҷҷатро имзо кун.','noun'),
      W('Printer','/ˈprɪntə/','принтер','Чопгар / принтер','🖨️','The printer is out of ink.','Принтер сиёҳӣ надорад.','noun'),
      W('Presentation','/ˌprezənˈteɪʃən/','презентейшн','Пешниҳод / презентатсия','📊','She gave a great presentation.','Ӯ презентатсияи олӣ дод.','noun'),
      W('Task','/tɑːsk/','таск','Вазифа','✔️','This task is difficult.','Ин вазифа душвор аст.','noun'),
      W('Project','/ˈprɒdʒekt/','проҷект','Лоиҳа','📁','We finished the project.','Мо лоиҳаро ба анҷом расондем.','noun'),
      W('Client','/ˈklaɪənt/','клайент','Муштарӣ','🧑','The client is happy with us.','Муштарӣ аз мо розӣ аст.','noun'),
      W('Income','/ˈɪnkʌm/','инкам','Даромад','💷','Her monthly income is good.','Даромади моҳонаи ӯ хуб аст.','noun'),
      W('Team','/tiːm/','тим','Даста','👨‍👩‍👧','Our team works well together.','Дастаи мо хуб якҷоя кор мекунад.','noun'),
      W('Career','/kəˈrɪə/','карир','Касб / роҳи касбӣ','📈','She has a successful career.','Ӯ касби муваффақ дорад.','noun'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Present Perfect (Experience)', lessonTitleTg: 'Дарси 6: Грамматика — Present Perfect (таҷриба)',
      title: 'Present Perfect: have/has + V3', titleTranslated: 'Present Perfect — таҷриба (ever/never)', emoji: '✅',
      explanation:
`**Present Perfect** барои амале, ки дар гузашта рӯй дод, вале **вақташ муҳим нест** ё **таҷриба**-и зиндагӣ аст:
**have / has + феъли сеюм (past participle)**
- Феъли дуруст: work → **worked**, visit → **visited**
- Феъли нодуруст: go → **gone/been**, see → **seen**, do → **done**, eat → **eaten**, be → **been**

Бо **ever** (ягон вақт) ва **never** (ҳеҷ гоҳ):
- *Have you **ever** worked abroad?* — *No, I have **never** worked abroad.*
- *She **has visited** many countries.*`,
      rules: [
        { pattern: 'have/has + past participle (V3)', note: 'I have worked, She has gone' },
        { pattern: 'ever дар савол', note: 'Have you ever been to London?' },
        { pattern: 'never = таҷрибаи манфӣ', note: 'I have never eaten sushi.' },
        { pattern: 'феълҳои нодуруст', note: 'go→gone, see→seen, do→done, eat→eaten' },
      ],
      examples: [
        { sentence: 'I have visited three countries.', translation: 'Ман се кишварро дидаам.', highlight: 'have visited' },
        { sentence: 'She has worked here for years.', translation: 'Ӯ солҳо боз дар ин ҷо кор кардааст.', highlight: 'has worked' },
        { sentence: 'Have you ever met a famous person?', translation: 'Ту ягон вақт шахси машҳурро дидаӣ?', highlight: 'Have you ever' },
        { sentence: 'He has never eaten Thai food.', translation: 'Ӯ ҳеҷ гоҳ хӯроки тайландӣ нахӯрдааст.', highlight: 'has never eaten' },
        { sentence: 'They have done a great job.', translation: 'Онҳо кори олӣ кардаанд.', highlight: 'have done' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ visited London twice.', promptTranslated:'Ман Лондонро ду бор дидаам.', options:['have','has','am','did'], answer:'have', explanation:'I → have + V3.' },
        { type:'choose', prompt:'She ___ worked here since 2020.', promptTranslated:'Ӯ аз соли 2020 дар ин ҷо кор мекунад.', options:['has','have','is','was'], answer:'has', explanation:'She → has + V3.' },
        { type:'choose', prompt:'Have you ever ___ abroad?', promptTranslated:'Ту ягон вақт ба хориҷ рафтаӣ?', options:['been','be','was','are'], answer:'been', explanation:'been = past participle of be/go.' },
        { type:'choose', prompt:'He has ___ eaten sushi.', promptTranslated:'Ӯ ҳеҷ гоҳ суши нахӯрдааст.', options:['never','ever','not never','no'], answer:'never', explanation:'never + V3.' },
        { type:'fill_blank', prompt:'They have ___ (do) their homework.', promptTranslated:'Онҳо вазифаашонро кардаанд.', answer:'done', explanation:'do → done.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман ҳеҷ гоҳ ба Париж нарафтаам.', options:['I','never','have','to','been','Paris'], answer:'I have never been to Paris.', explanation:'I have never been to Paris.' },
        { type:'transform', prompt:'Савол созед: You have seen this film.', promptTranslated:'ба савол.', answer:'Have you seen this film?', explanation:'Have-ро ба аввал.' },
        { type:'transform', prompt:'Ислоҳ кунед: She have finished the report.', promptTranslated:'She → has.', answer:'She has finished the report.', explanation:'She → has.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — already / yet / just / for / since', lessonTitleTg: 'Дарси 7: Грамматика — already / yet / just / for / since',
      title: 'Present Perfect: already, yet, just, for, since', titleTranslated: 'already / yet / just / for / since', emoji: '⏳',
      explanation:
`Калимаҳое, ки бо Present Perfect меоянд:
- **already** (аллакай) — дар ҷумлаи мусбат: *I have **already** eaten.*
- **yet** (ҳанӯз) — дар савол ва манфӣ, дар охир: *Have you finished **yet**? / Not **yet**.*
- **just** (навакак) — амали ба наздикӣ шуда: *He has **just** left.*
- **for** (муддат) + давра: *for two years, for a week*
- **since** (аз замони) + нуқтаи вақт: *since 2020, since Monday*`,
      rules: [
        { pattern: 'already — мусбат (пеш аз V3)', note: 'I have already done it.' },
        { pattern: 'yet — савол/манфӣ (охир)', note: "Have you finished yet? Not yet." },
        { pattern: 'just — навакак', note: 'She has just arrived.' },
        { pattern: 'for + муддат / since + нуқта', note: 'for 3 years / since 2019' },
      ],
      examples: [
        { sentence: 'I have already sent the email.', translation: 'Ман аллакай почтаро фиристодам.', highlight: 'already' },
        { sentence: 'Have you finished the report yet?', translation: 'Ту ҳисоботро ҳанӯз тамом кардӣ?', highlight: 'yet' },
        { sentence: 'The manager has just called.', translation: 'Мудир навакак занг зад.', highlight: 'just' },
        { sentence: 'She has worked here for five years.', translation: 'Ӯ панҷ сол боз дар ин ҷо кор мекунад.', highlight: 'for five years' },
        { sentence: 'I have known him since 2015.', translation: 'Ман ӯро аз соли 2015 мешиносам.', highlight: 'since 2015' },
      ],
      exercises: [
        { type:'choose', prompt:'I have ___ finished my work. (аллакай)', promptTranslated:'Ман аллакай кори худро тамом кардам.', options:['already','yet','since','for'], answer:'already', explanation:'мусбат → already.' },
        { type:'choose', prompt:'Have you eaten ___?', promptTranslated:'Ту ҳанӯз хӯрдӣ?', options:['yet','already','since','just'], answer:'yet', explanation:'савол → yet.' },
        { type:'choose', prompt:'He has ___ arrived, he is at the door.', promptTranslated:'Ӯ навакак расид, дар назди дар аст.', options:['just','yet','for','since'], answer:'just', explanation:'навакак → just.' },
        { type:'choose', prompt:'I have lived here ___ ten years.', promptTranslated:'Ман даҳ сол боз дар ин ҷо зиндагӣ мекунам.', options:['for','since','yet','already'], answer:'for', explanation:'муддат → for.' },
        { type:'fill_blank', prompt:'She has worked here ___ 2018.', promptTranslated:'Ӯ аз соли 2018 дар ин ҷо кор мекунад.', answer:'since', explanation:'нуқтаи вақт → since.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман аллакай онро дидаам.', options:['I','already','have','it','seen'], answer:'I have already seen it.', explanation:'I have already seen it.' },
        { type:'transform', prompt:'Ислоҳ кунед: I have finished yet.', promptTranslated:'мусбат → already.', answer:'I have already finished.', explanation:'yet танҳо савол/манфӣ.' },
        { type:'transform', prompt:'Ислоҳ кунед: I have worked here since five years.', promptTranslated:'муддат → for.', answer:'I have worked here for five years.', explanation:'for + муддат.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — A Job Interview', lessonTitleTg: 'Дарси 8: Шунавоӣ — Мусоҳибаи корӣ',
    title: 'A Job Interview', titleTranslated: 'Мусоҳибаи корӣ', emoji: '🗣️',
    passage: 'Farrukh has an interview for a manager job. The interviewer asks him many questions. "Have you ever worked as a manager?" she asks. "Yes, I have managed a small team for three years," Farrukh answers. "I have already led two big projects." The interviewer is happy. She says the company needs a reliable and experienced person. The salary is good and the job is full-time. Farrukh has just finished his answers. "We will call you soon," she says. He hopes he has got the job.',
    passageTranslated: 'Фаррух барои кори мудирӣ мусоҳиба дорад. Мусоҳибагир ба ӯ саволҳои зиёд медиҳад. «Шумо ягон вақт ҳамчун мудир кор кардаед?» мепурсад ӯ. «Бале, ман се сол боз дастаи хурдро идора кардаам», ҷавоб медиҳад Фаррух. «Ман аллакай ду лоиҳаи калонро роҳбарӣ кардаам.» Мусоҳибагир хушҳол аст. Ӯ мегӯяд, ки ширкат ба шахси боэътимод ва ботаҷриба ниёз дорад. Маош хуб ва кор пурра аст. Фаррух навакак ҷавобҳояшро тамом кард. «Мо ба шумо ба зудӣ занг мезанем», мегӯяд ӯ. Ӯ умедвор аст, ки корро гирифтааст.',
    questions: [
      { question:'What job is the interview for?', questionTranslated:'Мусоҳиба барои кадом кор аст?', options:['A manager','A waiter','A driver'], correctIndex:0, explanation:'an interview for a manager job.' },
      { question:'How long has Farrukh managed a team?', questionTranslated:'Фаррух чанд сол дастаро идора кардааст?', options:['Three years','One year','Ten years'], correctIndex:0, explanation:'managed a small team for three years.' },
      { question:'What has he already led?', questionTranslated:'Ӯ аллакай чиро роҳбарӣ кардааст?', options:['Two big projects','A shop','A school'], correctIndex:0, explanation:'already led two big projects.' },
      { question:'What kind of person does the company need?', questionTranslated:'Ширкат ба чӣ гуна шахс ниёз дорад?', options:['Reliable and experienced','Young and cheap','Part-time'], correctIndex:0, explanation:'a reliable and experienced person.' },
      { question:'Is the job full-time or part-time?', questionTranslated:'Кор пурра аст ё нопурра?', options:['Full-time','Part-time','Night shift'], correctIndex:0, explanation:'the job is full-time.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Talking About Your Job', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Дар бораи кори худ',
    title: 'Talking About Your Job', titleTranslated: 'Дар бораи кори худ', emoji: '💬',
    scenario: 'Ду шинос дар бораи кору касби якдигар сӯҳбат мекунанд.',
    lines: [
      { speaker:'Zarina', text:'What do you do for a living?', translation:'Ту бо чӣ кор рӯзгор мегузаронӣ?', isUser:false },
      { speaker:'You', text:'I am an engineer. I work for a building company.', translation:'Ман муҳандисам. Дар ширкати сохтмонӣ кор мекунам.', isUser:true },
      { speaker:'Zarina', text:'Interesting! How long have you worked there?', translation:'Ҷолиб! Чанд вақт боз дар он ҷо кор мекунӣ?', isUser:false },
      { speaker:'You', text:'I have worked there for four years.', translation:'Ман чор сол боз дар он ҷо кор мекунам.', isUser:true },
      { speaker:'Zarina', text:'Do you like it?', translation:'Ба ту маъқул аст?', isUser:false },
      { speaker:'You', text:'Yes, it is stressful but very rewarding.', translation:'Бале, пурташвиш аст, вале хеле қаноатбахш.', isUser:true },
      { speaker:'Zarina', text:'Have you ever thought about your own business?', translation:'Ту ягон вақт дар бораи бизнеси худ фикр кардаӣ?', isUser:false },
      { speaker:'You', text:'Yes, one day I want to start my own firm.', translation:'Бале, рӯзе мехоҳам фирмаи худро кушоям.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — From Waiter to Chef', lessonTitleTg: 'Дарси 10: Хониш — Аз пешхизмат то сарошпаз',
    title: 'From Waiter to Chef', titleTranslated: 'Аз пешхизмат то сарошпаз', emoji: '👨‍🍳',
    passage: 'Daler has always loved cooking. Ten years ago he started as a waiter in a small restaurant. He earned a low salary, but he learned a lot. He has worked hard and never given up. After two years, the manager saw his talent and gave him a job in the kitchen. Daler has since become a skilled and creative chef. He has already won two cooking prizes. Now he manages his own team of five people. "I have learned that hard work is the key to success," he says. His dream is to open his own restaurant, and he is sure he will.',
    passageTranslated: 'Далер ҳамеша пухтупазро дӯст медошт. Даҳ сол пеш ӯ ҳамчун пешхизмат дар тарабхонаи хурд оғоз кард. Ӯ маоши кам мегирифт, вале бисёр чиз меомӯхт. Ӯ бо ҷидду ҷаҳд кор кардааст ва ҳеҷ гоҳ даст накашидааст. Пас аз ду сол, мудир истеъдоди ӯро дид ва ба ӯ дар ошхона кор дод. Далер аз он вақт сарошпази моҳир ва эҷодкор шудааст. Ӯ аллакай ду ҷоизаи пухтупазро гирифтааст. Акнун ӯ дастаи худро аз панҷ нафар идора мекунад. «Ман фаҳмидам, ки меҳнати сахт калиди муваффақият аст», мегӯяд ӯ. Орзуи ӯ кушодани тарабхонаи худаш аст ва ӯ боварӣ дорад, ки мекунад.',
    questions: [
      { question:'How did Daler start?', questionTranslated:'Далер чӣ хел оғоз кард?', options:['As a waiter','As a manager','As a chef'], correctIndex:0, explanation:'started as a waiter.' },
      { question:'What has he never done?', questionTranslated:'Ӯ ҳеҷ гоҳ чӣ накардааст?', options:['Given up','Worked hard','Cooked'], correctIndex:0, explanation:'never given up.' },
      { question:'What has he already won?', questionTranslated:'Ӯ аллакай чиро гирифтааст?', options:['Two cooking prizes','A car','A house'], correctIndex:0, explanation:'already won two cooking prizes.' },
      { question:'How many people does he manage now?', questionTranslated:'Ӯ ҳоло чанд нафарро идора мекунад?', options:['Five','Two','Ten'], correctIndex:0, explanation:'his own team of five people.' },
      { question:'What is his dream?', questionTranslated:'Орзуи ӯ чист?', options:['To open his own restaurant','To retire','To travel'], correctIndex:0, explanation:'to open his own restaurant.' },
    ],
  },
  review: {
    passage: 'Nargis is a young journalist. She has worked for a newspaper for three years. She loves her job because it is creative and never boring. She has already interviewed many interesting people, including doctors, artists, and even a famous singer. Her job is sometimes stressful because she has strict deadlines. She has just finished a big report about young workers in the city. Her manager is very happy with her. "You are reliable and hardworking," he said. Nargis has never missed a deadline. She hopes she will become the chief editor one day.',
    passageTranslated: 'Наргис рӯзноманигори ҷавон аст. Ӯ се сол боз дар як рӯзнома кор мекунад. Ӯ кори худро дӯст медорад, зеро он эҷодкорона ва ҳеҷ гоҳ дилгиркунанда нест. Ӯ аллакай бо одамони ҷолиби зиёд — духтурон, рассомон ва ҳатто сарояндаи машҳур — мусоҳиба кардааст. Кори ӯ баъзан пурташвиш аст, зеро ӯ мӯҳлатҳои қатъӣ дорад. Ӯ навакак ҳисоботи калонро дар бораи коргарони ҷавони шаҳр тамом кард. Мудираш аз ӯ хеле розӣ аст. «Ту боэътимод ва меҳнатдӯст ҳастӣ», гуфт ӯ. Наргис ҳеҷ гоҳ мӯҳлатро гузаронда надодааст. Ӯ умедвор аст, ки рӯзе саруҳаррир мешавад.',
    questions: [
      { question:'What is Nargis?', questionTranslated:'Наргис кист?', options:['A journalist','A lawyer','A chef'], correctIndex:0, explanation:'a young journalist.' },
      { question:'How long has she worked there?', questionTranslated:'Ӯ чанд вақт дар он ҷо кор кардааст?', options:['Three years','One year','Ten years'], correctIndex:0, explanation:'for three years.' },
      { question:'Who has she already interviewed?', questionTranslated:'Ӯ аллакай бо кӣ мусоҳиба кардааст?', options:['Many interesting people','No one','Only friends'], correctIndex:0, explanation:'interviewed many interesting people.' },
      { question:'Why is her job sometimes stressful?', questionTranslated:'Чаро кори ӯ баъзан пурташвиш аст?', options:['Strict deadlines','Low salary','Long journeys'], correctIndex:0, explanation:'strict deadlines.' },
      { question:'What has she never done?', questionTranslated:'Ӯ ҳеҷ гоҳ чӣ накардааст?', options:['Missed a deadline','Written a report','Worked hard'], correctIndex:0, explanation:'never missed a deadline.' },
    ],
  },
  exam: {
    passage: 'Rustam and Karim are brothers with very different careers. Rustam is an accountant. He has worked for the same big company for eight years. He has a good salary and a full-time contract, but his job is sometimes boring. Karim is an electrician. He has never had a permanent job; instead, he works for different clients. His work is hard but he is his own boss. Both brothers are skilled and reliable. Rustam has just been promoted to senior accountant, and Karim has recently started his own small business. They have both learned that success needs patience, hard work, and a little luck.',
    passageTranslated: 'Рустам ва Карим бародаронанд бо касбҳои хеле гуногун. Рустам муҳосиб аст. Ӯ ҳашт сол боз дар ҳамон ширкати калон кор мекунад. Ӯ маоши хуб ва шартномаи пурра дорад, вале кораш баъзан дилгиркунанда аст. Карим барқчӣ аст. Ӯ ҳеҷ гоҳ кори доимӣ надоштааст; ба ҷои он, барои муштариёни гуногун кор мекунад. Кори ӯ вазнин аст, вале ӯ сардори худаш аст. Ҳарду бародар моҳир ва боэътимоданд. Рустам навакак ба муҳосиби калон таъин шуд ва Карим ба наздикӣ бизнеси хурди худро оғоз кард. Ҳарду фаҳмиданд, ки муваффақият сабр, меҳнати сахт ва каме бахтро талаб мекунад.',
    questions: [
      { question:'What is Rustam\'s job?', questionTranslated:'Кори Рустам чист?', options:['An accountant','An electrician','A chef'], correctIndex:0, explanation:'Rustam is an accountant.' },
      { question:'How long has Rustam worked there?', questionTranslated:'Рустам чанд сол дар он ҷо кор кардааст?', options:['Eight years','Two years','One year'], correctIndex:0, explanation:'for eight years.' },
      { question:'What has Karim never had?', questionTranslated:'Карим ҳеҷ гоҳ чӣ надоштааст?', options:['A permanent job','A client','A skill'], correctIndex:0, explanation:'never had a permanent job.' },
      { question:'What has just happened to Rustam?', questionTranslated:'Бо Рустам навакак чӣ шуд?', options:['He was promoted','He was fired','He retired'], correctIndex:0, explanation:'has just been promoted.' },
      { question:'What does success need?', questionTranslated:'Муваффақият чӣ талаб мекунад?', options:['Patience, hard work and luck','Only money','Only luck'], correctIndex:0, explanation:'patience, hard work, and a little luck.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 7 тайёр.');
