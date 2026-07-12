import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 9, title: 'Module 10: Technology And Communication', titleTranslated: 'Модули 10: Технология ва Алоқа',
  emoji: '📱', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Devices', tt: 'Дарси 1: Дастгоҳҳо', emoji: '💻', words: [
      W('Laptop','/ˈlæptɒp/','лэптоп','Ноутбук','💻','I work on my laptop.','Ман дар ноутбукам кор мекунам.','noun'),
      W('Screen','/skriːn/','скрин','Экран','📺','The screen is very bright.','Экран хеле равшан аст.','noun'),
      W('Keyboard','/ˈkiːbɔːd/','кибод','Клавиатура','⌨️','This keyboard is new.','Ин клавиатура нав аст.','noun'),
      W('Charger','/ˈtʃɑːdʒə/','чарҷер','Заряддиҳанда','🔌','Where is my phone charger?','Заряддиҳандаи телефонам куҷост?','noun'),
      W('Battery','/ˈbætəri/','бэтери','Батарея / аккумулятор','🔋','My battery is low.','Батареяи ман кам аст.','noun'),
      W('Headphones','/ˈhedfəʊnz/','ҳедфоунз','Гӯшмонак','🎧','I listen with headphones.','Ман бо гӯшмонак гӯш мекунам.','noun'),
      W('Speaker','/ˈspiːkə/','спикер','Баландгӯяк','🔊','The speaker is very loud.','Баландгӯяк хеле баланд аст.','noun'),
      W('Webcam','/ˈwebkæm/','вебкам','Вебкамера','📹','Turn on your webcam.','Вебкамераатро фаъол кун.','noun'),
      W('Device','/dɪˈvaɪs/','дивайс','Дастгоҳ','📲','This device is very fast.','Ин дастгоҳ хеле тез аст.','noun'),
      W('Cable','/ˈkeɪbl/','кейбл','Сим / кабел','🔗','Connect the cable here.','Кабелро ин ҷо васл кун.','noun'),
    ]},
    { title: 'Lesson 2: The Internet', tt: 'Дарси 2: Интернет', emoji: '🌐', words: [
      W('Website','/ˈwebsaɪt/','вебсайт','Вебсайт','🌐','This website is useful.','Ин вебсайт муфид аст.','noun'),
      W('App','/æp/','эп','Барнома / аппликатсия','📱','I use a weather app.','Ман барномаи обу ҳаворо истифода мебарам.','noun'),
      W('Download','/ˌdaʊnˈləʊd/','даунлоуд','Боргирӣ кардан','⬇️','Download the file here.','Файлро ин ҷо боргирӣ кун.','verb'),
      W('Upload','/ˌʌpˈləʊd/','аплоуд','Боркунӣ кардан','⬆️','She uploaded a photo.','Ӯ аксро бор кард.','verb'),
      W('Password','/ˈpɑːswɜːd/','пасворд','Рамз / калидвожа','🔑','Enter your password.','Рамзатро ворид кун.','noun'),
      W('Account','/əˈkaʊnt/','акаунт','Ҳисоб / аккаунт','👤','I created a new account.','Ман ҳисоби нав сохтам.','noun'),
      W('Browser','/ˈbraʊzə/','браузер','Браузер','🧭','Open your internet browser.','Браузери интернетатро кушо.','noun'),
      W('Wifi','/ˈwaɪfaɪ/','вайфай','Вайфай / интернети бесим','📶','Is there free wifi here?','Ин ҷо вайфайи ройгон ҳаст?','noun'),
      W('Link','/lɪŋk/','линк','Пайванд / ҳавола','🔗','Click on this link.','Ба ин пайванд зер кун.','noun'),
      W('Network','/ˈnetwɜːk/','нетворк','Шабака','🕸️','The network is slow today.','Шабака имрӯз суст аст.','noun'),
    ]},
    { title: 'Lesson 3: Communication', tt: 'Дарси 3: Муошират', emoji: '💬', words: [
      W('Message','/ˈmesɪdʒ/','месиҷ','Паём','✉️','I sent you a message.','Ман ба ту паём фиристодам.','noun'),
      W('Notification','/ˌnəʊtɪfɪˈkeɪʃən/','нотификейшн','Огоҳинома','🔔','I got a new notification.','Ба ман огоҳиномаи нав омад.','noun'),
      W('Social media','/ˈsəʊʃl ˈmiːdiə/','сошл медиа','Шабакаҳои иҷтимоӣ','📲','She spends hours on social media.','Ӯ соатҳо дар шабакаҳои иҷтимоӣ вақт мегузаронад.','noun'),
      W('Post','/pəʊst/','поуст','Навишта / пост','📝','He wrote a funny post.','Ӯ пости хандаовар навишт.','noun'),
      W('Share','/ʃeə/','шеа','Мубодила / шарик кардан','↗️','Please share this video.','Лутфан ин видеоро мубодила кун.','verb'),
      W('Comment','/ˈkɒment/','комент','Шарҳ / изҳори назар','💭','Leave a comment below.','Дар поён шарҳ гузор.','noun'),
      W('Contact','/ˈkɒntækt/','контакт','Тамос / алоқа','📇','Save my number in your contacts.','Рақами маро дар тамосҳоят захира кун.','noun'),
      W('Video call','/ˈvɪdiəʊ kɔːl/','видео кол','Занги видеоӣ','📞','We had a video call yesterday.','Дирӯз мо занги видеоӣ доштем.','noun'),
      W('Emoji','/ɪˈməʊdʒi/','имоҷи','Эмоҷӣ / нишонача','😀','She sent a smiling emoji.','Ӯ эмоҷии хандон фиристод.','noun'),
      W('Group','/ɡruːp/','груп','Гурӯҳ (чат)','👥','We have a family group chat.','Мо чати гурӯҳии оилавӣ дорем.','noun'),
    ]},
    { title: 'Lesson 4: Tech Actions', tt: 'Дарси 4: Амалҳои технологӣ', emoji: '⚙️', words: [
      W('Save','/seɪv/','сейв','Захира кардан','💾','Don\'t forget to save the file.','Захира кардани файлро фаромӯш накун.','verb'),
      W('Delete','/dɪˈliːt/','дилит','Нест кардан / нобуд','🗑️','Delete the old photos.','Аксҳои кӯҳнаро нест кун.','verb'),
      W('Install','/ɪnˈstɔːl/','инстол','Насб кардан','📥','Install the app first.','Аввал барномаро насб кун.','verb'),
      W('Update','/ˌʌpˈdeɪt/','апдейт','Навсозӣ кардан','🔄','Please update the software.','Лутфан нармафзорро навсозӣ кун.','verb'),
      W('Connect','/kəˈnekt/','конект','Пайваст кардан','🔗','Connect to the wifi.','Ба вайфай пайваст шав.','verb'),
      W('Charge','/tʃɑːdʒ/','чарҷ','Заряд кардан','🔋','I need to charge my phone.','Ба ман заряд кардани телефон лозим аст.','verb'),
      W('Search','/sɜːtʃ/','сёрч','Ҷустуҷӯ кардан','🔎','Search for the answer online.','Ҷавобро дар интернет ҷустуҷӯ кун.','verb'),
      W('Press','/pres/','прес','Пахш кардан','👆','Press the green button.','Тугмаи сабзро пахш кун.','verb'),
      W('Scroll','/skrəʊl/','скролл','Варақгардонӣ кардан','📜','Scroll down to see more.','Барои дидани бештар поён рав.','verb'),
      W('Block','/blɒk/','блок','Баста / манъ кардан','🚫','You can block that number.','Ту метавонӣ он рақамро баста кунӣ.','verb'),
    ]},
    { title: 'Lesson 5: Describing Technology', tt: 'Дарси 5: Тавсифи технология', emoji: '🚀', words: [
      W('Digital','/ˈdɪdʒɪtl/','диҷитал','Рақамӣ','🔢','We live in a digital world.','Мо дар ҷаҳони рақамӣ зиндагӣ мекунем.','adjective'),
      W('Online','/ˌɒnˈlaɪn/','онлайн','Онлайн / дар интернет','🌐','I bought it online.','Ман онро онлайн харидам.','adjective'),
      W('Wireless','/ˈwaɪələs/','вайерлес','Бесим','📡','This is a wireless mouse.','Ин мушаки бесим аст.','adjective'),
      W('Smart','/smɑːt/','смарт','Ҳушманд','🧠','I have a smart watch.','Ман соати ҳушманд дорам.','adjective'),
      W('Latest','/ˈleɪtɪst/','лейтест','Навтарин','🆕','This is the latest model.','Ин навтарин намуна аст.','adjective'),
      W('Handy','/ˈhændi/','ҳэнди','Қулай / дастрас','👍','A smartphone is very handy.','Смартфон хеле қулай аст.','adjective'),
      W('Slow','/sləʊ/','слоу','Суст / оҳиста','🐢','My internet is slow.','Интернети ман суст аст.','adjective'),
      W('Advanced','/ədˈvɑːnst/','адванст','Пешрафта','🚀','This is advanced technology.','Ин технологияи пешрафта аст.','adjective'),
      W('Virtual','/ˈvɜːtʃuəl/','вёрчуал','Виртуалӣ / маҷозӣ','🕶️','We had a virtual meeting.','Мо ҷаласаи виртуалӣ доштем.','adjective'),
      W('Screen time','/ˈskriːn taɪm/','скрин тайм','Вақти экран','⏳','Too much screen time is bad.','Вақти зиёди экран бад аст.','noun'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Present Continuous', lessonTitleTg: 'Дарси 6: Грамматика — Present Continuous',
      title: 'Present Continuous (now)', titleTranslated: 'Present Continuous — ҳозир (am/is/are + -ing)', emoji: '⏳',
      explanation:
`**Present Continuous** барои амале, ки **ҳозир, дар ҳамин лаҳза** рӯй дода истодааст:
**am / is / are + феъл + -ing**
- *I **am using** my phone.* (Ман ҳоло телефонамро истифода мебарам)
- *She **is texting** a friend.* | *They **are watching** a video.*

Манфӣ: *He **is not** working.* | Савол: *What **are** you **doing**?*

**Фарқ бо Present Simple:** Present Simple = одат/ҳамеша (*I use my phone every day*), Present Continuous = ҳозир (*I am using it now*).`,
      rules: [
        { pattern: 'am/is/are + V-ing', note: 'I am typing. She is calling.' },
        { pattern: 'манфӣ: be + not + V-ing', note: 'They are not playing.' },
        { pattern: 'савол: be + subject + V-ing?', note: 'Are you working?' },
        { pattern: 'now / at the moment', note: 'калимаҳои ишора ба ҳозир' },
      ],
      examples: [
        { sentence: 'I am charging my phone now.', translation: 'Ман ҳоло телефонамро заряд карда истодаам.', highlight: 'am charging' },
        { sentence: 'She is watching a video.', translation: 'Ӯ видео тамошо карда истодааст.', highlight: 'is watching' },
        { sentence: 'They are not listening to me.', translation: 'Онҳо ба ман гӯш карда истода нестанд.', highlight: 'are not listening' },
        { sentence: 'What are you doing?', translation: 'Ту чӣ кор карда истодаӣ?', highlight: 'are you doing' },
        { sentence: 'He is downloading a big file.', translation: 'Ӯ файли калонро боргирӣ карда истодааст.', highlight: 'is downloading' },
      ],
      exercises: [
        { type:'choose', prompt:'I ___ using my laptop now.', promptTranslated:'Ман ҳоло ноутбукамро истифода бурда истодаам.', options:['am','is','are','be'], answer:'am', explanation:'I → am + V-ing.' },
        { type:'choose', prompt:'She is ___ a message.', promptTranslated:'Ӯ паём навишта истодааст.', options:['writing','write','writes','wrote'], answer:'writing', explanation:'be + V-ing.' },
        { type:'choose', prompt:'They ___ watching a film.', promptTranslated:'Онҳо филм тамошо карда истодаанд.', options:['are','is','am','be'], answer:'are', explanation:'They → are.' },
        { type:'choose', prompt:'What ___ you doing?', promptTranslated:'Ту чӣ кор карда истодаӣ?', options:['are','is','am','do'], answer:'are', explanation:'савол: are you doing.' },
        { type:'fill_blank', prompt:'He ___ (charge) his phone right now.', promptTranslated:'Ӯ ҳоло телефонашро заряд карда истодааст.', answer:'is charging', explanation:'is + charging.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман ҳоло мусиқӣ гӯш карда истодаам.', options:['I','listening','am','to','music','now'], answer:'I am listening to music now.', explanation:'I am listening to music now.' },
        { type:'transform', prompt:'Манфӣ созед: She is working.', promptTranslated:'ба манфӣ.', answer:'She is not working.', explanation:'be + not + V-ing.' },
        { type:'transform', prompt:'Ислоҳ кунед: They is playing a game.', promptTranslated:'They → are.', answer:'They are playing a game.', explanation:'They are playing.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — Phrasal Verbs', lessonTitleTg: 'Дарси 7: Грамматика — Феълҳои таркибӣ',
      title: 'Common Phrasal Verbs', titleTranslated: 'Феълҳои таркибӣ (turn on, log in...)', emoji: '🔗',
      explanation:
`**Феъли таркибӣ** = феъл + зарф/пешоянд, ки маънои нав медиҳад. Дар технология хеле маъмуланд:
- **turn on / turn off** — фаъол/хомӯш кардан: *Turn on the TV.*
- **log in / log out** — ворид/баромадан: *Log in to your account.*
- **plug in** — ба барқ пайваст кардан | **set up** — насб/танзим кардан
- **look up** — ҷустуҷӯ кардан (маълумот): *Look up the word online.*
- **charge up** — заряд кардан

Баъзеашон ҷудошаванда: *Turn **the TV** on* ё *Turn on **the TV*** — ҳарду дуруст.`,
      rules: [
        { pattern: 'turn on / turn off', note: 'фаъол / хомӯш кардан' },
        { pattern: 'log in / log out', note: 'ворид / баромадан' },
        { pattern: 'set up / plug in', note: 'танзим / пайваст кардан' },
        { pattern: 'look up', note: 'ҷустуҷӯи маълумот' },
      ],
      examples: [
        { sentence: 'Please turn off your phone.', translation: 'Лутфан телефонатро хомӯш кун.', highlight: 'turn off' },
        { sentence: 'I need to log in to my account.', translation: 'Ба ман ба ҳисобам ворид шудан лозим аст.', highlight: 'log in' },
        { sentence: 'Can you set up the printer?', translation: 'Ту метавонӣ принтерро танзим кунӣ?', highlight: 'set up' },
        { sentence: 'Look up the address on the map.', translation: 'Суроғаро дар харита ҷустуҷӯ кун.', highlight: 'Look up' },
        { sentence: 'Plug in the charger, the battery is low.', translation: 'Заряддиҳандаро васл кун, батарея кам аст.', highlight: 'Plug in' },
      ],
      exercises: [
        { type:'choose', prompt:'Please ___ the lights when you leave.', promptTranslated:'Ҳангоми рафтан чароғҳоро хомӯш кун.', options:['turn off','turn','off turn','close'], answer:'turn off', explanation:'turn off = хомӯш кардан.' },
        { type:'choose', prompt:'You have to ___ to see your messages.', promptTranslated:'Барои дидани паёмҳо бояд ворид шавӣ.', options:['log in','log','in log','enter in'], answer:'log in', explanation:'log in = ворид шудан.' },
        { type:'choose', prompt:'I will ___ the word in the dictionary.', promptTranslated:'Ман калимаро дар луғат ҷустуҷӯ мекунам.', options:['look up','look','up look','see up'], answer:'look up', explanation:'look up = ҷустуҷӯ.' },
        { type:'choose', prompt:'Can you ___ the new computer?', promptTranslated:'Ту метавонӣ компютери навро танзим кунӣ?', options:['set up','set','up set','make up'], answer:'set up', explanation:'set up = танзим кардан.' },
        { type:'fill_blank', prompt:'___ ___ the TV, I want to watch the news. (фаъол кардан)', promptTranslated:'Телевизорро фаъол кун.', answer:'Turn on', explanation:'Turn on = фаъол кардан.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Заряддиҳандаро васл кун, лутфан.', options:['Plug','the','in','charger','please'], answer:'Plug in the charger please.', explanation:'Plug in the charger.' },
        { type:'transform', prompt:'Маънои муқобил: turn on → ...', promptTranslated:'муқобили turn on.', answer:'turn off', explanation:'turn on ↔ turn off.' },
        { type:'transform', prompt:'Маънои муқобил: log in → ...', promptTranslated:'муқобили log in.', answer:'log out', explanation:'log in ↔ log out.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — A Technology Problem', lessonTitleTg: 'Дарси 8: Шунавоӣ — Мушкили технологӣ',
    title: 'A Technology Problem', titleTranslated: 'Мушкили технологӣ', emoji: '🛠️',
    passage: 'Aziza is trying to join an online class, but she has a problem. "My laptop is not working well," she says. "The screen is on, but the wifi is very slow." Her brother helps her. "First, turn off the laptop and turn it on again," he says. "Then log in to the class website with your password." Aziza does this, but it still does not connect. "Your battery is low," her brother says. "Plug in the charger." Finally, it works. Aziza can see her teacher and classmates on the screen. "Thank you!" she says. "Technology is great when it works!"',
    passageTranslated: 'Азиза кӯшиш мекунад, ки ба дарси онлайн ҳамроҳ шавад, вале мушкил дорад. «Ноутбукам хуб кор намекунад», мегӯяд ӯ. «Экран фаъол аст, вале вайфай хеле суст аст.» Бародараш ба ӯ кӯмак мекунад. «Аввал ноутбукро хомӯш кун ва боз фаъол кун», мегӯяд ӯ. «Баъд бо рамзат ба вебсайти дарс ворид шав.» Азиза ин корро мекунад, вале ҳанӯз пайваст намешавад. «Батареяат кам аст», мегӯяд бародараш. «Заряддиҳандаро васл кун.» Ниҳоят, кор мекунад. Азиза муаллим ва ҳамсинфонашро дар экран мебинад. «Ташаккур!» мегӯяд ӯ. «Технология вақте кор мекунад, олӣ аст!»',
    questions: [
      { question:'What is Aziza trying to do?', questionTranslated:'Азиза чӣ кор кардан мехоҳад?', options:['Join an online class','Buy a laptop','Play a game'], correctIndex:0, explanation:'trying to join an online class.' },
      { question:'What is the first problem?', questionTranslated:'Мушкили аввал чист?', options:['The wifi is very slow','No screen','No sound'], correctIndex:0, explanation:'the wifi is very slow.' },
      { question:'What does her brother say to do first?', questionTranslated:'Бародараш мегӯяд аввал чӣ кунад?', options:['Turn it off and on again','Buy a new one','Call the teacher'], correctIndex:0, explanation:'turn off the laptop and turn it on again.' },
      { question:'Why does it not connect?', questionTranslated:'Чаро пайваст намешавад?', options:['The battery is low','No password','No wifi'], correctIndex:0, explanation:'Your battery is low.' },
      { question:'What does she do at the end?', questionTranslated:'Ӯ дар охир чӣ мекунад?', options:['Sees teacher and classmates','Turns off the laptop','Goes to school'], correctIndex:0, explanation:'can see her teacher and classmates.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Helping With A Phone', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Кӯмак бо телефон',
    title: 'Helping With A Phone', titleTranslated: 'Кӯмак бо телефон', emoji: '📱',
    scenario: 'Набера ба бобояш ёд медиҳад, ки чӣ тавр аз барномаи нав истифода барад.',
    lines: [
      { speaker:'Grandpa', text:'I want to send a message, but I don\'t know how.', translation:'Мехоҳам паём фиристам, вале намедонам чӣ тавр.', isUser:false },
      { speaker:'You', text:'It is easy. First, open the app and press the green button.', translation:'Осон аст. Аввал барномаро кушо ва тугмаи сабзро пахш кун.', isUser:true },
      { speaker:'Grandpa', text:'Okay, I am pressing it now. What next?', translation:'Хуб, ҳоло пахш карда истодаам. Баъд чӣ?', isUser:false },
      { speaker:'You', text:'Now type your message and press send.', translation:'Ҳоло паёматро навис ва фиристодро пахш кун.', isUser:true },
      { speaker:'Grandpa', text:'Can I add one of those small pictures?', translation:'Метавонам яке аз он расмҳои хурдро илова кунам?', isUser:false },
      { speaker:'You', text:'Yes, those are emojis. Choose one and tap it.', translation:'Бале, онҳо эмоҷӣ ном доранд. Якеро интихоб кун ва зер кун.', isUser:true },
      { speaker:'Grandpa', text:'Wonderful! It is working. Thank you!', translation:'Аҷоиб! Кор мекунад. Ташаккур!', isUser:false },
      { speaker:'You', text:'You are welcome. Technology is easy with practice.', translation:'Хоҳиш мекунам. Технология бо машқ осон мешавад.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — Life With Smartphones', lessonTitleTg: 'Дарси 10: Хониш — Ҳаёт бо смартфонҳо',
    title: 'Life With Smartphones', titleTranslated: 'Ҳаёт бо смартфонҳо', emoji: '📱',
    passage: 'Smartphones have changed our lives completely. Today, most people are using their phones for almost everything. We are sending messages, taking photos, watching videos, and paying for things online. A smartphone is like a small computer in your pocket. It has many useful apps and connects us to friends far away. However, there are also problems. Many people spend too much time online and too little time with real people. Doctors say that too much screen time is bad for our eyes and our sleep. Technology is a wonderful tool, but we must use it carefully and not become its slave.',
    passageTranslated: 'Смартфонҳо ҳаёти моро комилан тағйир доданд. Имрӯз аксари одамон телефонҳояшонро тақрибан барои ҳама чиз истифода бурда истодаанд. Мо паём фиристода истодаем, акс гирифта истодаем, видео тамошо карда истодаем ва барои чизҳо онлайн пардохт карда истодаем. Смартфон мисли компютери хурд дар ҷайби туст. Он барномаҳои муфиди зиёд дорад ва моро бо дӯстони дурдаст пайваст мекунад. Аммо мушкилот низ ҳастанд. Бисёр одамон вақти зиёдро дар интернет ва вақти хеле камро бо одамони воқеӣ мегузаронанд. Духтурон мегӯянд, ки вақти зиёди экран барои чашм ва хоби мо бад аст. Технология воситаи аҷоиб аст, вале мо бояд онро бодиққат истифода барем ва ғуломи он нашавем.',
    questions: [
      { question:'What are most people using their phones for?', questionTranslated:'Аксари одамон телефонҳоро барои чӣ истифода мебаранд?', options:['Almost everything','Only calls','Only games'], correctIndex:0, explanation:'using their phones for almost everything.' },
      { question:'A smartphone is like what?', questionTranslated:'Смартфон ба чӣ монанд аст?', options:['A small computer','A television','A book'], correctIndex:0, explanation:'like a small computer in your pocket.' },
      { question:'What is one problem?', questionTranslated:'Як мушкил чист?', options:['Too much time online','No apps','No wifi'], correctIndex:0, explanation:'spend too much time online.' },
      { question:'What is bad for our eyes and sleep?', questionTranslated:'Чӣ барои чашм ва хоб бад аст?', options:['Too much screen time','Reading books','Walking'], correctIndex:0, explanation:'too much screen time is bad.' },
      { question:'How must we use technology?', questionTranslated:'Мо технологияро чӣ тавр истифода барем?', options:['Carefully','All day','Never'], correctIndex:0, explanation:'we must use it carefully.' },
    ],
  },
  review: {
    passage: 'Bahodur works from home as a web designer. Right now, he is sitting at his desk and working on his laptop. He is designing a new website for a client. His phone is charging next to him, and he is listening to music with his headphones. Bahodur loves technology because it lets him work from anywhere. However, he has a rule: after six o\'clock, he turns off his computer and puts his phone away. In the evening he does not go online at all. "Screen time is useful for work," he says, "but real life is more important. I don\'t want technology to control me."',
    passageTranslated: 'Баҳодур дар хона ҳамчун тарроҳи веб кор мекунад. Ҳоло ӯ дар мизаш нишаста, дар ноутбукаш кор карда истодааст. Ӯ барои муштарӣ вебсайти нав тарроҳӣ карда истодааст. Телефонаш дар паҳлӯяш заряд шуда истодааст ва ӯ бо гӯшмонакаш мусиқӣ гӯш карда истодааст. Баҳодур технологияро дӯст медорад, зеро он ба ӯ имкон медиҳад аз ҳар ҷо кор кунад. Аммо ӯ як қоида дорад: баъди соати шаш, ӯ компютерашро хомӯш мекунад ва телефонашро дур мегузорад. Шом ӯ тамоман ба интернет намебарояд. «Вақти экран барои кор муфид аст», мегӯяд ӯ, «вале ҳаёти воқеӣ муҳимтар аст. Ман намехоҳам технология маро идора кунад.»',
    questions: [
      { question:'What is Bahodur\'s job?', questionTranslated:'Кори Баҳодур чист?', options:['A web designer','A teacher','A driver'], correctIndex:0, explanation:'works from home as a web designer.' },
      { question:'What is he doing right now?', questionTranslated:'Ӯ ҳоло чӣ кор карда истодааст?', options:['Designing a website','Sleeping','Cooking'], correctIndex:0, explanation:'designing a new website.' },
      { question:'What is his rule after six o\'clock?', questionTranslated:'Қоидаи ӯ баъди соати шаш чист?', options:['Turn off the computer','Work more','Buy a phone'], correctIndex:0, explanation:'he turns off his computer.' },
      { question:'Does he go online in the evening?', questionTranslated:'Ӯ шом ба интернет мебарояд?', options:['No, not at all','Yes, always','Only a little'], correctIndex:0, explanation:'he does not go online at all.' },
      { question:'What does he think is more important?', questionTranslated:'Ба фикри ӯ чӣ муҳимтар аст?', options:['Real life','Screen time','Money'], correctIndex:0, explanation:'real life is more important.' },
    ],
  },
  exam: {
    passage: 'Technology is a big part of modern life, especially for young people. These days, students are using computers and phones to study, to talk to friends, and to have fun. The internet is an amazing place to learn: you can look up any information, download books, or watch lessons online. Social media helps us stay in contact with people all over the world. But we must also be careful. We should not believe everything we read online, and we shouldn\'t share private information with strangers. It is also important to turn off our devices sometimes and enjoy the real world. Technology should help us live better, not take over our lives.',
    passageTranslated: 'Технология қисми калони ҳаёти муосир, махсусан барои ҷавонон аст. Ин рӯзҳо донишҷӯён компютеру телефонҳоро барои таҳсил, сӯҳбат бо дӯстон ва фароғат истифода бурда истодаанд. Интернет ҷои аҷоиб барои омӯзиш аст: ту метавонӣ ҳар маълумотро ҷустуҷӯ кунӣ, китобҳо боргирӣ кунӣ ё дарсҳоро онлайн тамошо кунӣ. Шабакаҳои иҷтимоӣ ба мо кӯмак мекунанд, ки бо одамони тамоми ҷаҳон дар тамос бошем. Вале мо бояд эҳтиёткор ҳам бошем. Мо набояд ба ҳар чизе, ки дар интернет мехонем, бовар кунем ва набояд маълумоти шахсиро бо бегонаҳо мубодила кунем. Инчунин муҳим аст, ки баъзан дастгоҳҳоямонро хомӯш кунем ва аз ҷаҳони воқеӣ лаззат барем. Технология бояд ба мо кӯмак кунад, ки беҳтар зиндагӣ кунем, на ин ки ҳаёти моро гирад.',
    questions: [
      { question:'What are students using computers and phones for?', questionTranslated:'Донишҷӯён компютеру телефонҳоро барои чӣ истифода мебаранд?', options:['Study, talk to friends, have fun','Only games','Only calls'], correctIndex:0, explanation:'to study, to talk to friends, and to have fun.' },
      { question:'What can you do on the internet?', questionTranslated:'Дар интернет чӣ кор карда метавонӣ?', options:['Look up information and download books','Nothing useful','Only chat'], correctIndex:0, explanation:'look up any information, download books.' },
      { question:'What shouldn\'t we share with strangers?', questionTranslated:'Мо бо бегонаҳо чиро набояд мубодила кунем?', options:['Private information','Photos of nature','Our hobbies'], correctIndex:0, explanation:"shouldn't share private information with strangers." },
      { question:'What is important to do sometimes?', questionTranslated:'Баъзан чӣ кор кардан муҳим аст?', options:['Turn off our devices','Buy new phones','Stay online'], correctIndex:0, explanation:'turn off our devices sometimes.' },
      { question:'What should technology do?', questionTranslated:'Технология бояд чӣ кунад?', options:['Help us live better','Control our lives','Waste our time'], correctIndex:0, explanation:'help us live better, not take over our lives.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 10 тайёр.');
