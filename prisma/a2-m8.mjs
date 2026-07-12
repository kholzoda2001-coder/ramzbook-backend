import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 7, title: 'Module 8: Health And The Body', titleTranslated: 'Модули 8: Саломатӣ ва Бадан',
  emoji: '🩺', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Parts Of The Body', tt: 'Дарси 1: Узвҳои бадан', emoji: '🦵', words: [
      W('Shoulder','/ˈʃəʊldə/','шоулдер','Китф','💪','My shoulder hurts.','Китфам дард мекунад.','noun'),
      W('Knee','/niː/','ни','Зону','🦵','He hurt his knee playing football.','Ӯ ҳангоми футбол зонуяшро захмӣ кард.','noun'),
      W('Ankle','/ˈæŋkl/','энкл','Тағоҷ / банди пой','🦶','She twisted her ankle.','Ӯ банди пояшро тоб дод.','noun'),
      W('Elbow','/ˈelbəʊ/','элбоу','Оринҷ','💪','Rest your elbow on the table.','Оринҷатро ба миз такя деҳ.','noun'),
      W('Wrist','/rɪst/','рист','Банди даст','⌚','My wrist is weak.','Банди дастам заиф аст.','noun'),
      W('Chest','/tʃest/','чест','Сина','🫁','He has a pain in his chest.','Ӯ дар синааш дард дорад.','noun'),
      W('Throat','/θrəʊt/','срот','Гулӯ','🗣️','I have a sore throat.','Гулӯям дард мекунад.','noun'),
      W('Chin','/tʃɪn/','чин','Манаҳ / занах','😐','He has a scar on his chin.','Ӯ дар манаҳаш ҷароҳат дорад.','noun'),
      W('Forehead','/ˈfɔːhed/','форҳед','Пешонӣ','🧑','Her forehead is hot.','Пешониаш гарм аст.','noun'),
      W('Skin','/skɪn/','скин','Пӯст','🖐️','Sun cream protects your skin.','Кремаи офтоб пӯстро муҳофизат мекунад.','noun'),
    ]},
    { title: 'Lesson 2: Illnesses And Symptoms', tt: 'Дарси 2: Бемориҳо ва Аломатҳо', emoji: '🤒', words: [
      W('Migraine','/ˈmiːɡreɪn/','мигрейн','Мигрен (дарди сахти сар)','🤕','She often gets migraines.','Ӯ аксаран мигрен мегирад.','noun'),
      W('Temperature','/ˈtemprətʃə/','темперечер','Ҳарорат (таб)','🌡️','The child has a high temperature.','Кӯдак ҳарорати баланд дорад.','noun'),
      W('Cramp','/kræmp/','крэмп','Гирифтани мушак','😖','I got a cramp in my leg.','Мушаки пойям гирифт.','noun'),
      W('Sneeze','/sniːz/','сниз','Атса задан','🤧','I sneeze when there is dust.','Вақте чанг ҳаст, ман атса мезанам.','verb'),
      W('Ache','/eɪk/','эйк','Дард (дарди муттасил)','😣','I have an ache in my back.','Ман дар пуштам дард дорам.','noun'),
      W('Injury','/ˈɪndʒəri/','инҷери','Ҷароҳат / зарар','🩹','It is a small injury.','Ин ҷароҳати хурд аст.','noun'),
      W('Dizzy','/ˈdɪzi/','дизи','Сарчархзананда','😵','I feel dizzy today.','Имрӯз сарам чарх мезанад.','adjective'),
      W('Bruise','/bruːz/','бруз','Кабудшавӣ / лат','🟣','He has a bruise on his leg.','Ӯ дар пояш кабудӣ дорад.','noun'),
      W('Wound','/wuːnd/','вунд','Захм / ҷароҳат','🩸','Clean the wound carefully.','Захмро бодиққат тоза кун.','noun'),
      W('Flu','/fluː/','флу','Зуком / грипп','🤧','She is in bed with the flu.','Ӯ бо зуком дар бистар аст.','noun'),
    ]},
    { title: 'Lesson 3: At The Doctor', tt: 'Дарси 3: Дар назди духтур', emoji: '💊', words: [
      W('Dose','/dəʊs/','доус','Миқдори дору','💊','Take the right dose of medicine.','Миқдори дурусти доруро гир.','noun'),
      W('Sling','/slɪŋ/','слинг','Бандаки даст','🦾','His broken arm is in a sling.','Дасти шикастаи ӯ дар бандак аст.','noun'),
      W('Ointment','/ˈɔɪntmənt/','ойнтмент','Марҳам','🧴','Put ointment on the burn.','Ба сӯхтагӣ марҳам мон.','noun'),
      W('Injection','/ɪnˈdʒekʃən/','инҷекшн','Сӯзандору / укол','💉','The nurse gave him an injection.','Ҳамшира ба ӯ укол зад.','noun'),
      W('Treatment','/ˈtriːtmənt/','тритмент','Табобат','🏥','The treatment takes two weeks.','Табобат ду ҳафта тӯл мекашад.','noun'),
      W('Surgeon','/ˈsɜːdʒən/','сёрҷен','Ҷарроҳ','🔪','The surgeon did the operation.','Ҷарроҳ ҷарроҳиро гузаронд.','noun'),
      W('Checkup','/ˈtʃekʌp/','чекап','Муоинаи тиббӣ','🩺','I have a checkup every year.','Ман ҳар сол муоинаи тиббӣ дорам.','noun'),
      W('Recover','/rɪˈkʌvə/','рикавер','Сиҳат шудан','💪','He will recover soon.','Ӯ ба зудӣ сиҳат мешавад.','verb'),
      W('Cure','/kjʊə/','кюр','Шифо додан / табобат','✨','This medicine can cure the illness.','Ин дору метавонад бемориро шифо диҳад.','verb'),
      W('Ward','/wɔːd/','ворд','Палата (беморхона)','🏥','He is in the children\'s ward.','Ӯ дар палатаи кӯдакон аст.','noun'),
    ]},
    { title: 'Lesson 4: Healthy Living', tt: 'Дарси 4: Зиндагии солим', emoji: '🥗', words: [
      W('Diet','/ˈdaɪət/','дайет','Парҳез / ғизо','🥗','A healthy diet is important.','Парҳези солим муҳим аст.','noun'),
      W('Nutrition','/njuːˈtrɪʃən/','нютришн','Ғизохӯрӣ / ғизо','🍎','Good nutrition gives energy.','Ғизои хуб қувва медиҳад.','noun'),
      W('Weight','/weɪt/','вейт','Вазн','⚖️','He wants to lose weight.','Ӯ мехоҳад вазн кам кунад.','noun'),
      W('Muscle','/ˈmʌsl/','масл','Мушак','💪','Exercise makes muscles strong.','Машқ мушакҳоро қавӣ мекунад.','noun'),
      W('Breathe','/briːð/','брид','Нафас кашидан','🌬️','Breathe slowly and relax.','Оҳиста нафас каш ва ором шав.','verb'),
      W('Refreshed','/rɪˈfreʃt/','рифрешт','Тароват ёфта','🌿','I feel refreshed after a nap.','Баъди хоби кӯтоҳ ман тароват меёбам.','adjective'),
      W('Fitness','/ˈfɪtnəs/','фитнес','Тандурустӣ','🏋️','Fitness improves your health.','Тандурустӣ саломатиро беҳтар мекунад.','noun'),
      W('Strength','/streŋθ/','стренгс','Қувва / нерӯ','💥','Sport builds strength.','Варзиш қувва меафзояд.','noun'),
      W('Wellbeing','/ˈwelbiːɪŋ/','велбиинг','Некӯаҳволӣ','🌿','Sport is good for your wellbeing.','Варзиш барои некӯаҳволӣ хуб аст.','noun'),
      W('Stress','/stres/','стрес','Стресс / фишор','😫','Too much stress is bad.','Стресси зиёд бад аст.','noun'),
    ]},
    { title: 'Lesson 5: Describing Health', tt: 'Дарси 5: Тавсифи саломатӣ', emoji: '🩹', words: [
      W('Painful','/ˈpeɪnfʊl/','пейнфул','Дардовар','😖','The injection was painful.','Укол дардовар буд.','adjective'),
      W('Serious','/ˈsɪəriəs/','сириес','Ҷиддӣ','⚠️','It is not a serious illness.','Ин бемории ҷиддӣ нест.','adjective'),
      W('Unhealthy','/ʌnˈhelθi/','анҳелси','Носолим','🍔','Fast food is unhealthy.','Хӯроки тез носолим аст.','adjective'),
      W('Sore','/sɔː/','сор','Дардманд / варамида','🤕','My legs are sore after running.','Пойҳоям баъди давидан дардманданд.','adjective'),
      W('Feverish','/ˈfiːvərɪʃ/','фивериш','Табдор','🥵','He feels feverish and tired.','Ӯ табдор ва хаста ҳис мекунад.','adjective'),
      W('Exhausted','/ɪɡˈzɔːstɪd/','игзостид','Бемадор / хаста','😩','She was exhausted after work.','Ӯ баъди кор бемадор буд.','adjective'),
      W('Unwell','/ʌnˈwel/','анвел','Бемор / бетоб','🤢','He looks unwell today.','Ӯ имрӯз бетоб менамояд.','adjective'),
      W('Energetic','/ˌenəˈdʒetɪk/','энерҷетик','Пурқувва / боғайрат','⚡','After sleep I feel energetic.','Баъди хоб ман худро пурқувва ҳис мекунам.','adjective'),
      W('Sensitive','/ˈsensətɪv/','сенситив','Ҳассос','🌡️','My skin is very sensitive.','Пӯсти ман хеле ҳассос аст.','adjective'),
      W('Contagious','/kənˈteɪdʒəs/','контейҷес','Сироятӣ / гузаранда','🦠','The flu is contagious.','Зуком сироятӣ аст.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — should / shouldn\'t (Advice)', lessonTitleTg: 'Дарси 6: Грамматика — should / shouldn\'t (маслиҳат)',
      title: 'should / shouldn\'t', titleTranslated: 'should / shouldn\'t (маслиҳат)', emoji: '💡',
      explanation:
`Барои **маслиҳат** (чӣ кор кардан хуб аст) **should** истифода мешавад:
**should / shouldn't + феъли асосӣ** (барои ҳама шахсон яксон, бе -s)
- *You **should** drink water.* (Ту бояд об нӯшӣ — маслиҳат)
- *You **shouldn't** eat too much sugar.* (Ту набояд шакари зиёд хӯрӣ)

Савол: *What **should** I do?* | ***Should** I see a doctor?*
Диққат: баъди should феъл бе **to** ва бе **-s** меояд (не «should to go», не «should goes»).`,
      rules: [
        { pattern: 'should + феъли асосӣ', note: 'You should rest. (бе to, бе -s)' },
        { pattern: "shouldn't = should not", note: "You shouldn't smoke." },
        { pattern: 'савол: Should + subject + феъл?', note: 'Should I call a doctor?' },
        { pattern: 'истифода', note: 'маслиҳат, тавсия' },
      ],
      examples: [
        { sentence: 'You should see a doctor.', translation: 'Ту бояд ба духтур муроҷиат кунӣ.', highlight: 'should see' },
        { sentence: "You shouldn't eat before bed.", translation: 'Ту набояд пеш аз хоб хӯрок хӯрӣ.', highlight: "shouldn't eat" },
        { sentence: 'She should drink more water.', translation: 'Ӯ бояд оби бештар нӯшад.', highlight: 'should drink' },
        { sentence: 'What should I do for a headache?', translation: 'Барои дарди сар ман чӣ кор кунам?', highlight: 'should I do' },
        { sentence: "You shouldn't work when you are ill.", translation: 'Вақте бемор ҳастӣ, набояд кор кунӣ.', highlight: "shouldn't work" },
      ],
      exercises: [
        { type:'choose', prompt:'You ___ drink more water.', promptTranslated:'Ту бояд оби бештар нӯшӣ.', options:['should','shoulds','should to','are should'], answer:'should', explanation:'should + феъли асосӣ.' },
        { type:'choose', prompt:'You ___ smoke, it is bad for you.', promptTranslated:'Ту набояд тамоку кашӣ.', options:["shouldn't",'should','not should','should not to'], answer:"shouldn't", explanation:"манфӣ → shouldn't." },
        { type:'choose', prompt:'She should ___ a doctor.', promptTranslated:'Ӯ бояд ба духтур равад.', options:['see','sees','to see','saw'], answer:'see', explanation:'баъди should феъли асосӣ.' },
        { type:'fill_blank', prompt:'You ___ (should) rest when you are tired.', promptTranslated:'Вақте хастаӣ, бояд дам гирӣ.', answer:'should', explanation:'маслиҳат → should.' },
        { type:'fill_blank', prompt:'He shouldn\'t ___ (eat) so much salt.', promptTranslated:'Ӯ набояд намаки зиёд хӯрад.', answer:'eat', explanation:"shouldn't + феъли асосӣ." },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ту бояд бештар машқ кунӣ.', options:['You','more','should','exercise'], answer:'You should exercise more.', explanation:'You should exercise more.' },
        { type:'transform', prompt:'Ислоҳ кунед: You should to sleep more.', promptTranslated:'баъди should бе to.', answer:'You should sleep more.', explanation:'should + феъли асосӣ бе to.' },
        { type:'transform', prompt:'Маслиҳати манфӣ: (you / eat / fast food)', promptTranslated:'бо shouldn\'t.', answer:"You shouldn't eat fast food.", explanation:"shouldn't + феъл." },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — must / have to / mustn\'t', lessonTitleTg: 'Дарси 7: Грамматика — must / have to / mustn\'t',
      title: 'must / have to / mustn\'t', titleTranslated: 'must / have to (ӯҳдадорӣ)', emoji: '❗',
      explanation:
`Барои **ӯҳдадорӣ ва зарурат**:
- **must** + феъл — ӯҳдадории қавӣ (аксаран қоида ё эҳсоси дохилӣ): *You **must** take this medicine.*
- **have to / has to** + феъл — зарурат (аксаран аз берун): *I **have to** see a doctor. She **has to** work.*
- **mustn't** — манъ аст (nagunjoish): *You **mustn't** smoke here.*
- **don't have to** — лозим нест (ихтиёрӣ): *You **don't have to** come.*

Диққат: **mustn't** (манъ) ва **don't have to** (лозим нест) маънои гуногун доранд!`,
      rules: [
        { pattern: 'must + феъл — ӯҳдадории қавӣ', note: 'You must rest.' },
        { pattern: 'have to / has to — зарурат', note: 'I have to go. He has to work.' },
        { pattern: "mustn't — манъ", note: "You mustn't be late." },
        { pattern: "don't have to — лозим нест", note: "You don't have to pay." },
      ],
      examples: [
        { sentence: 'You must take your medicine every day.', translation: 'Ту бояд ҳар рӯз доруятро гирӣ.', highlight: 'must take' },
        { sentence: 'I have to see the doctor tomorrow.', translation: 'Ман фардо бояд ба духтур равам.', highlight: 'have to see' },
        { sentence: 'She has to stay in bed.', translation: 'Ӯ бояд дар бистар монад.', highlight: 'has to stay' },
        { sentence: "You mustn't drink this, it is dangerous.", translation: 'Ту инро нанӯш, хатарнок аст.', highlight: "mustn't drink" },
        { sentence: "You don't have to come if you are ill.", translation: 'Агар бемор бошӣ, омаданат лозим нест.', highlight: "don't have to" },
      ],
      exercises: [
        { type:'choose', prompt:'You ___ take this medicine, it is important.', promptTranslated:'Ту бояд ин доруро гирӣ.', options:['must','musts','must to','are must'], answer:'must', explanation:'must + феъли асосӣ.' },
        { type:'choose', prompt:'She ___ work on Saturday.', promptTranslated:'Ӯ рӯзи шанбе бояд кор кунад.', options:['has to','have to','must to','haves to'], answer:'has to', explanation:'She → has to.' },
        { type:'choose', prompt:'You ___ smoke in the hospital. (манъ)', promptTranslated:'Дар беморхона тамоку кашидан манъ аст.', options:["mustn't","don't have to",'must','have to'], answer:"mustn't", explanation:'манъ → mustn\'t.' },
        { type:'choose', prompt:'It is free. You ___ pay.', promptTranslated:'Ройгон аст. Пул додан лозим нест.', options:["don't have to","mustn't",'must','have to'], answer:"don't have to", explanation:'лозим нест → don\'t have to.' },
        { type:'fill_blank', prompt:'I ___ (have to) go to work early today.', promptTranslated:'Имрӯз ман бояд барвақт ба кор равам.', answer:'have to', explanation:'зарурат → have to.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ту бояд дар бистар монӣ.', options:['You','stay','must','bed','in'], answer:'You must stay in bed.', explanation:'You must stay in bed.' },
        { type:'transform', prompt:'Ислоҳ кунед: She have to rest.', promptTranslated:'She → has to.', answer:'She has to rest.', explanation:'has to.' },
        { type:'transform', prompt:'Манъ созед: (you / touch / this)', promptTranslated:'бо mustn\'t.', answer:"You mustn't touch this.", explanation:"mustn't + феъл." },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — At the Doctor\'s', lessonTitleTg: 'Дарси 8: Шунавоӣ — Дар назди духтур',
    title: 'At the Doctor\'s', titleTranslated: 'Дар назди духтур', emoji: '🩺',
    passage: 'Sabina does not feel well. She has a headache, a high fever, and a sore throat. She goes to see the doctor. The doctor checks her and says she has the flu. "You must rest and drink a lot of water," he says. "You should stay in bed for a few days. You mustn\'t go to work, because the flu is contagious." He gives her a prescription for some pills. "You don\'t have to take an injection," he says. "The pills are enough. You will recover in about a week." Sabina thanks the doctor and goes home to rest.',
    passageTranslated: 'Сабина худро хуб ҳис намекунад. Ӯ дарди сар, таби баланд ва гулударди дорад. Ӯ ба назди духтур меравад. Духтур ӯро муоина мекунад ва мегӯяд, ки ӯ зуком дорад. «Ту бояд дам гирӣ ва оби зиёд нӯшӣ», мегӯяд ӯ. «Ту бояд чанд рӯз дар бистар монӣ. Набояд ба кор равӣ, зеро зуком сироятӣ аст.» Ӯ ба вай доруномаи чанд ҳаб медиҳад. «Ба ту укол лозим нест», мегӯяд ӯ. «Ҳабҳо кофӣ ҳастанд. Ту тақрибан дар як ҳафта сиҳат мешавӣ.» Сабина ба духтур ташаккур мегӯяд ва барои дам гирифтан ба хона меравад.',
    questions: [
      { question:'What are Sabina\'s symptoms?', questionTranslated:'Аломатҳои Сабина кадомҳоянд?', options:['Headache, fever, sore throat','Only a cough','A broken leg'], correctIndex:0, explanation:'a headache, a high fever, and a sore throat.' },
      { question:'What illness does she have?', questionTranslated:'Ӯ кадом бемориро дорад?', options:['The flu','A cold only','Nothing'], correctIndex:0, explanation:'she has the flu.' },
      { question:'What must she not do?', questionTranslated:'Ӯ чиро набояд кунад?', options:['Go to work','Drink water','Rest'], correctIndex:0, explanation:"You mustn't go to work." },
      { question:'Does she have to take an injection?', questionTranslated:'Ба ӯ укол лозим аст?', options:['No, the pills are enough','Yes','Every day'], correctIndex:0, explanation:"You don't have to take an injection." },
      { question:'When will she recover?', questionTranslated:'Ӯ кай сиҳат мешавад?', options:['In about a week','In a month','Never'], correctIndex:0, explanation:'recover in about a week.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Giving Health Advice', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Маслиҳати саломатӣ',
    title: 'Giving Health Advice', titleTranslated: 'Маслиҳати саломатӣ', emoji: '💬',
    scenario: 'Дӯст ба дӯсти беморшудааш маслиҳат медиҳад.',
    lines: [
      { speaker:'Olim', text:'I feel terrible. I have a bad headache.', translation:'Ман худро бад ҳис мекунам. Дарди сари сахт дорам.', isUser:false },
      { speaker:'You', text:'You should drink some water and rest.', translation:'Ту бояд каме об нӯшӣ ва дам гирӣ.', isUser:true },
      { speaker:'Olim', text:'I also have a fever, I think.', translation:'Ба фикрам, ман таб ҳам дорам.', isUser:false },
      { speaker:'You', text:'Then you must see a doctor. It could be the flu.', translation:'Пас ту бояд ба духтур равӣ. Шояд зуком бошад.', isUser:true },
      { speaker:'Olim', text:'Do I have to stay at home?', translation:'Ман бояд дар хона монам?', isUser:false },
      { speaker:'You', text:'Yes, you shouldn\'t go to work today.', translation:'Бале, ту имрӯз набояд ба кор равӣ.', isUser:true },
      { speaker:'Olim', text:'Okay. Thank you for the advice.', translation:'Хуб. Барои маслиҳат ташаккур.', isUser:false },
      { speaker:'You', text:'Get well soon! Take care of yourself.', translation:'Зуд сиҳат шав! Худатро нигоҳ дор.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — A Healthy Life', lessonTitleTg: 'Дарси 10: Хониш — Зиндагии солим',
    title: 'A Healthy Life', titleTranslated: 'Зиндагии солим', emoji: '🥗',
    passage: 'Everyone wants to be healthy, but many people have unhealthy habits. Doctors say we should follow some simple rules. First, you should eat a good diet with fresh fruit and vegetables. You shouldn\'t eat too much fast food or sugar. Second, you must exercise regularly to keep your muscles strong. Third, good sleep is very important; you should sleep about eight hours a night. You mustn\'t forget to relax, because stress is bad for your health. You don\'t have to run a marathon — even a short walk every day helps. If you follow this advice, you will feel stronger and happier.',
    passageTranslated: 'Ҳама мехоҳанд солим бошанд, вале бисёр одамон одатҳои носолим доранд. Духтурон мегӯянд, ки мо бояд якчанд қоидаи соддаро риоя кунем. Аввал, ту бояд парҳези хуб бо меваю сабзавоти тару тоза дошта бошӣ. Набояд хӯроки тез ё шакари зиёд хӯрӣ. Дуюм, ту бояд мунтазам машқ кунӣ, то мушакҳоят қавӣ монанд. Сеюм, хоби хуб хеле муҳим аст; ту бояд шабе тақрибан ҳашт соат хоб равӣ. Набояд фаромӯш кунӣ, ки ором шавӣ, зеро стресс барои саломатӣ бад аст. Ба ту лозим нест, ки марафон давӣ — ҳатто сайри кӯтоҳи ҳаррӯза кӯмак мекунад. Агар ин маслиҳатро риоя кунӣ, худро қавитар ва хушбахттар ҳис мекунӣ.',
    questions: [
      { question:'What should you eat?', questionTranslated:'Ту бояд чӣ хӯрӣ?', options:['Fresh fruit and vegetables','Only fast food','A lot of sugar'], correctIndex:0, explanation:'a good diet with fresh fruit and vegetables.' },
      { question:'Why must you exercise?', questionTranslated:'Чаро ту бояд машқ кунӣ?', options:['To keep muscles strong','To sleep less','To earn money'], correctIndex:0, explanation:'exercise regularly to keep your muscles strong.' },
      { question:'How long should you sleep?', questionTranslated:'Ту бояд чанд соат хоб равӣ?', options:['About eight hours','Two hours','All day'], correctIndex:0, explanation:'sleep about eight hours a night.' },
      { question:'Why mustn\'t you forget to relax?', questionTranslated:'Чаро набояд фаромӯш кунӣ, ки ором шавӣ?', options:['Stress is bad for health','It is boring','It is expensive'], correctIndex:0, explanation:'stress is bad for your health.' },
      { question:'Do you have to run a marathon?', questionTranslated:'Ту бояд марафон давӣ?', options:['No, a short walk helps','Yes','Every day'], correctIndex:0, explanation:"You don't have to run a marathon." },
    ],
  },
  review: {
    passage: 'Karim broke his ankle while playing football. He felt a lot of pain and could not walk. His friends called an ambulance. At the hospital, the doctor said it was not a serious injury, but Karim has to wear a bandage for three weeks. "You mustn\'t play sport during this time," the doctor said. "You should rest your leg and you must come back next week." Karim was sad because he loves football. But the doctor told him he will recover completely. Now Karim knows that he should always warm up before a game and shouldn\'t play on a wet field.',
    passageTranslated: 'Карим ҳангоми футболбозӣ банди пояшро шикаст. Ӯ дарди зиёд ҳис кард ва роҳ рафта наметавонист. Дӯстонаш ёрии таъҷилӣ даъват карданд. Дар беморхона духтур гуфт, ки ин ҷароҳати ҷиддӣ нест, вале Карим бояд се ҳафта бандина пӯшад. «Ту дар ин муддат набояд варзиш кунӣ», гуфт духтур. «Ту бояд пойятро дам диҳӣ ва бояд ҳафтаи оянда баргардӣ.» Карим ғамгин буд, зеро футболро дӯст медорад. Вале духтур ба ӯ гуфт, ки ӯ пурра сиҳат мешавад. Акнун Карим медонад, ки бояд ҳамеша пеш аз бозӣ гарм кунад ва набояд дар майдони тар бозӣ кунад.',
    questions: [
      { question:'What did Karim break?', questionTranslated:'Карим чиро шикаст?', options:['His ankle','His arm','His nose'], correctIndex:0, explanation:'broke his ankle.' },
      { question:'What does he have to wear?', questionTranslated:'Ӯ чӣ бояд пӯшад?', options:['A bandage','A hat','Glasses'], correctIndex:0, explanation:'wear a bandage for three weeks.' },
      { question:'What mustn\'t he do?', questionTranslated:'Ӯ чиро набояд кунад?', options:['Play sport','Rest','Sleep'], correctIndex:0, explanation:"You mustn't play sport." },
      { question:'Will he recover?', questionTranslated:'Ӯ сиҳат мешавад?', options:['Yes, completely','No','Never'], correctIndex:0, explanation:'he will recover completely.' },
      { question:'What should he do before a game now?', questionTranslated:'Ӯ ҳоло пеш аз бозӣ чӣ бояд кунад?', options:['Warm up','Eat a lot','Sleep'], correctIndex:0, explanation:'should always warm up before a game.' },
    ],
  },
  exam: {
    passage: 'Modern life is often unhealthy. Many people sit all day, eat badly, and feel stressed. Doctors give simple advice for a better life. You should move more: you don\'t have to go to a gym, but you must be active every day. You should eat fresh food and drink plenty of water. You shouldn\'t skip breakfast, because it gives you energy. Sleep is also very important, so you mustn\'t stay up too late. Finally, you should find time to relax and see friends, because good relationships keep the mind healthy. Health is not luck; it is the result of good daily habits.',
    passageTranslated: 'Ҳаёти муосир аксаран носолим аст. Бисёр одамон тамоми рӯз менишинанд, бад мехӯранд ва стресс ҳис мекунанд. Духтурон барои ҳаёти беҳтар маслиҳати содда медиҳанд. Ту бояд бештар ҳаракат кунӣ: ба варзишгоҳ рафтан лозим нест, вале бояд ҳар рӯз фаъол бошӣ. Ту бояд хӯроки тару тоза хӯрӣ ва оби фаровон нӯшӣ. Набояд наҳориро гузаронӣ, зеро он ба ту қувва медиҳад. Хоб низ хеле муҳим аст, бинобар ин набояд то дер бедор монӣ. Ниҳоят, ту бояд барои истироҳат ва дидори дӯстон вақт ёбӣ, зеро муносибатҳои хуб ақлро солим нигоҳ медоранд. Саломатӣ бахт нест; он натиҷаи одатҳои хуби ҳаррӯза аст.',
    questions: [
      { question:'Why is modern life often unhealthy?', questionTranslated:'Чаро ҳаёти муосир аксаран носолим аст?', options:['People sit, eat badly, feel stressed','People sleep too much','People walk too much'], correctIndex:0, explanation:'sit all day, eat badly, and feel stressed.' },
      { question:'Do you have to go to a gym?', questionTranslated:'Ту бояд ба варзишгоҳ равӣ?', options:['No, but be active daily','Yes','Never move'], correctIndex:0, explanation:"you don't have to go to a gym, but you must be active." },
      { question:'Why shouldn\'t you skip breakfast?', questionTranslated:'Чаро набояд наҳориро гузаронӣ?', options:['It gives you energy','It is cheap','It is fast'], correctIndex:0, explanation:'it gives you energy.' },
      { question:'What mustn\'t you do?', questionTranslated:'Ту чиро набояд кунӣ?', options:['Stay up too late','Eat fresh food','Relax'], correctIndex:0, explanation:"you mustn't stay up too late." },
      { question:'What is health the result of?', questionTranslated:'Саломатӣ натиҷаи чист?', options:['Good daily habits','Luck','Money'], correctIndex:0, explanation:'the result of good daily habits.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 8 тайёр.');
