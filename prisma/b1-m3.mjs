import { W, buildModule, refreshExisting, bumpVersion, done } from './b1-module-builder.mjs';

export const M = {
  order: 3, title: 'Module 3: Entertainment and Media', titleTranslated: 'Модули 3: Вақтхушӣ ва ВАО',
  emoji: '🍿', color: '#F59E0B',
  vocab: [
    { title: 'Lesson 1: Film and Cinema', tt: 'Дарси 1: Филм ва кино', emoji: '🎬', words: [
      W('Audience','/ˈɔːdiəns/','одиэнс','Тамошобинон / шунавандагон','👥','The audience clapped at the end of the film.','Тамошобинон дар охири филм кафкӯбӣ карданд.','noun'),
      W('Character','/ˈkærəktə(r)/','кэрэктэ','Қаҳрамон / персонаж','🦸','The main character is very brave.','Қаҳрамони асосӣ хеле ҷасур аст.','noun'),
      W('Director','/dəˈrektə(r)/','директэ','Коргардон (режиссёр)','🎬','The director won an award for this movie.','Коргардон барои ин филм ҷоиза гирифт.','noun'),
      W('Review','/rɪˈvjuː/','ривю','Барраси / тақриз','⭐','The film got excellent reviews online.','Филм дар интернет баррасиҳои аъло гирифт.','noun'),
      W('Screen','/skriːn/','скрин','Экран','🖥️','I prefer watching films on a big screen.','Ман тамошои филмро дар экрани калон дӯст медорам.','noun'),
      W('Subtitle','/ˈsʌbtaɪtl/','сабтайтл','Субтитр / зернавис','🔤','I watch French films with English subtitles.','Ман филмҳои фаронсавиро бо зернависи англисӣ тамошо мекунам.','noun'),
      W('Plot','/plɒt/','плот','Сюжет / мазмуни асосӣ','📖','The plot of the story is very confusing.','Сюжети ҳикоя хеле печида аст.','noun'),
      W('Scene','/siːn/','син','Саҳна','🎭','The final scene made me cry.','Саҳнаи охирин маро ба гиря овард.','noun'),
      W('Soundtrack','/ˈsaʊndtræk/','саундтрэк','Саундтрек (мусиқии филм)','🎵','I love the soundtrack of this movie.','Ман саундтреки ин филмро дӯст медорам.','noun'),
      W('Entertain','/ˌentəˈteɪn/','энтэртейн','Вақтхушӣ кардан / хушҳол кардан','🎪','The clowns entertained the children.','Масхарабозҳо кӯдаконро хушҳол карданд.','verb'),
    ]},
    { title: 'Lesson 2: Music and Art', tt: 'Дарси 2: Мусиқӣ ва санъат', emoji: '🎨', words: [
      W('Exhibition','/ˌeksɪˈbɪʃn/','эксибишн','Намоишгоҳ','🖼️','We went to an art exhibition yesterday.','Мо дирӯз ба намоишгоҳи санъат рафтем.','noun'),
      W('Performance','/pəˈfɔːməns/','пэформэнс','Намоиш / иҷро','🎭','The band\'s live performance was amazing.','Иҷрои зиндаи гурӯҳ аҷиб буд.','noun'),
      W('Instrument','/ˈɪnstrəmənt/','инстрэмэнт','Асбоб (мусиқӣ)','🎸','Can you play any musical instrument?','Оё шумо метавонед ягон асбоби мусиқиро навозед?','noun'),
      W('Gallery','/ˈɡæləri/','гэлэри','Галерея','🏛️','They sell beautiful paintings in this gallery.','Онҳо дар ин галерея расмҳои зебо мефурӯшанд.','noun'),
      W('Sculpture','/ˈskʌlptʃə(r)/','скалпчэ','Муҷассама','🗿','There is a famous sculpture in the park.','Дар боғ муҷассамаи машҳур вуҷуд дорад.','noun'),
      W('Composer','/kəmˈpəʊzə(r)/','кэмпоузэ','Оҳангсоз (композитор)','🎼','Mozart is a classical composer.','Моцарт оҳангсози классикӣ аст.','noun'),
      W('Rhythm','/ˈrɪðəm/','ризэм','Ритм','🥁','I like the rhythm of this song.','Ба ман ритми ин суруд маъқул аст.','noun'),
      W('Talented','/ˈtæləntɪd/','тэлэнтид','Истеъдоддор','🌟','She is a very talented singer.','Ӯ сарояндаи хеле боистеъдод аст.','adjective'),
      W('Record','/ˈrekɔːd/','рекод','Сабт / пластинка','📀','He has a huge collection of old records.','Ӯ маҷмӯаи калони сабтҳои кӯҳна дорад.','noun'),
      W('Stage','/steɪdʒ/','стейҷ','Саҳна (театр)','🎙️','The actors walked onto the stage.','Ҳунарпешагон ба саҳна баромаданд.','noun'),
    ]},
    { title: 'Lesson 3: News and Internet', tt: 'Дарси 3: Ахбор ва интернет', emoji: '📰', words: [
      W('Headline','/ˈhedlaɪn/','ҳедлайн','Сарлавҳа','🗞️','Did you read the headlines today?','Шумо имрӯз сарлавҳаҳоро хондед?','noun'),
      W('Journalist','/ˈdʒɜːnəlɪst/','ҷёрнэлист','Журналист','🎤','The journalist interviewed the president.','Журналист бо президент мусоҳиба кард.','noun'),
      W('Publish','/ˈpʌblɪʃ/','паблиш','Нашр кардан','📚','Her new book will be published next month.','Китоби нави ӯ моҳи оянда нашр мешавад.','verb'),
      W('Article','/ˈɑːtɪkl/','атикл','Мақола','📄','I read an interesting article about space.','Ман мақолаи шавқоваре дар бораи кайҳон хондам.','noun'),
      W('Broadcast','/ˈbrɔːdkɑːst/','бродкаст','Пахш кардан (радио/ТВ)','📡','The match was broadcast live on TV.','Бозӣ дар телевизион зинда пахш шуд.','verb'),
      W('Upload','/ˌʌpˈləʊd/','аплоуд','Бор кардан (ба интернет)','☁️','He uploaded a new video to YouTube.','Ӯ видеои нав ба Ютуб бор кард.','verb'),
      W('Download','/ˌdaʊnˈləʊd/','даунлоуд','Фаровардан (аз интернет)','⬇️','You can download the app for free.','Шумо метавонед барномаро ройгон фароред.','verb'),
      W('Subscribe','/səbˈskraɪb/','сэбскрайб','Обуна шудан','🔔','Don\'t forget to subscribe to my channel.','Фаромӯш накунед, ки ба канали ман обуна шавед.','verb'),
      W('Fake','/feɪk/','фейк','Қалбакӣ / дурӯғ','🤥','Be careful of fake news on social media.','Аз ахбори қалбакӣ дар шабакаҳои иҷтимоӣ эҳтиёт бошед.','adjective'),
      W('Update','/ˌʌpˈdeɪt/','апдейт','Навсозӣ кардан','🔄','You need to update your password.','Шумо бояд пароли худро навсозӣ кунед.','verb'),
    ]},
    { title: 'Lesson 4: Media Phrasal Verbs', tt: 'Дарси 4: Феълҳои таркибии ВАО', emoji: '📱', words: [
      W('Turn on','/tɜːn ɒn/','тёрн он','Даргирондан / фаъол кардан','🔌','Can you turn on the radio?','Метавонед радиоро даргиронед?','verb'),
      W('Turn off','/tɜːn ɒf/','тёрн оф','Хомӯш кардан','🛑','Please turn off your phone in the cinema.','Лутфан телефони худро дар кинотеатр хомӯш кунед.','verb'),
      W('Log in','/lɒɡ ɪn/','лог ин','Ворид шудан (ба система)','🔑','You must log in to read the article.','Барои хондани мақола шумо бояд ворид шавед.','verb'),
      W('Log out','/lɒɡ aʊt/','лог аут','Баромадан (аз система)','🚪','Don\'t forget to log out of your account.','Фаромӯш накунед, ки аз ҳисоби худ бароед.','verb'),
      W('Scroll down','/skrəʊl daʊn/','скроул даун','Ба поён ҳаракат кардан (дар экран)','🖱️','Scroll down to see the comments.','Барои дидани шарҳҳо ба поён ҳаракат кунед.','verb'),
      W('Print out','/prɪnt aʊt/','принт аут','Чоп карда баровардан','🖨️','I need to print out my ticket.','Ман бояд чиптаамро чоп кунам.','verb'),
      W('Come out','/kʌm aʊt/','кам аут','Баромадан / нашр шудан','📅','When does her new movie come out?','Филми нави ӯ кай мебарояд?','verb'),
      W('Bring out','/brɪŋ aʊt/','бринг аут','Баровардан / истеҳсол кардан','📦','They will bring out a new phone soon.','Онҳо ба қарибӣ телефони навро мебароранд.','verb'),
      W('Find out','/faɪnd aʊt/','файнд аут','Фаҳмидан / пайдо кардан','💡','I want to find out more about this topic.','Ман мехоҳам дар бораи ин мавзӯъ бештар фаҳмам.','verb'),
      W('Sign up','/saɪn ʌp/','сайн ап','Қайд кардан / аъзо шудан','📝','You can sign up for the newsletter here.','Шумо метавонед дар ин ҷо барои хабарнома номнавис шавед.','verb'),
    ]}
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 5: Grammar — Relative Clauses (who, which, that)', lessonTitleTg: 'Дарси 5: Грамматика — Ҷумлаҳои пайрав (who, which, that)',
      title: 'Relative Clauses (who, which, that, where)', titleTranslated: 'Ҷумлаҳои пайрав (who, which, that, where)', emoji: '🔗',
      explanation:
`Ҷумлаҳои пайрав (Relative Clauses) ба мо кӯмак мекунанд, ки дар бораи шахс ё чиз маълумоти иловагӣ диҳем, бе он ки ҷумлаи навро сар кунем. Мо калимаҳои зеринро истифода мебарем:
1. **Who (ки):** Барои **одамон** истифода мешавад.
* *The man **who** directed the movie is famous.* (Марде, ки филмро коргардонӣ кард, машҳур аст).
2. **Which (ки):** Барои **чизҳо** ва **ҳайвонҳо** истифода мешавад.
* *The book **which** I read was amazing.* (Китобе, ки ман хондам, аҷиб буд).
3. **That (ки):** Метавонад **who** ё **which**-ро дар ҷумлаҳои муқаррарӣ иваз кунад (ҳам барои одамон ва ҳам чизҳо).
* *The movie **that** we watched was scary.* (Филме, ки мо тамошо кардем, даҳшатнок буд).
4. **Where (ки дар он ҷо):** Барои **ҷойҳо** истифода мешавад.
* *This is the cinema **where** we first met.* (Ин кинотеатрест, ки мо бори аввал вохӯрдем).

**Эзоҳ:** Агар *who/which/that* мубтадо (subject)-и ҷумлаи пайрав набошад, шумо метавонед онро партоед.
* *The film (which) I watched...* (Филме, ки ман тамошо кардам...)`,
      rules: [
        { pattern: 'Person + who/that', note: 'A journalist is someone who writes news.' },
        { pattern: 'Thing + which/that', note: 'This is the app which I downloaded.' },
        { pattern: 'Place + where', note: 'The gallery where we saw the painting.' },
      ],
      examples: [
        { sentence: 'The actor who played the hero is very young.', translation: 'Ҳунарпешае, ки нақши қаҳрамонро бозид, хеле ҷавон аст.', highlight: 'who' },
        { sentence: 'I liked the song which was playing on the radio.', translation: 'Ба ман суруде, ки дар радио пахш мешуд, маъқул шуд.', highlight: 'which' },
        { sentence: 'That is the website where I read the news.', translation: 'Он ҳамон вебсайтест, ки ман дар он ахбор мехонам.', highlight: 'where' },
        { sentence: 'She is the girl that won the competition.', translation: 'Ӯ ҳамон духтарест, ки дар озмун ғолиб омад.', highlight: 'that' },
      ],
      exercises: [
        { type:'choose', prompt:'This is the book ___ I bought yesterday.', promptTranslated:'Ин китобест, ки ман дирӯз харидам.', options:['which','who','where','when'], answer:'which', explanation:'Китоб (чиз) -> which ё that.' },
        { type:'choose', prompt:'Do you know the man ___ is talking to Sarah?', promptTranslated:'Оё шумо мардеро, ки бо Сара сӯҳбат дорад, мешиносед?', options:['who','which','where','whose'], answer:'who', explanation:'Мард (одам) -> who ё that.' },
        { type:'choose', prompt:'The restaurant ___ we had dinner was very expensive.', promptTranslated:'Тарабхонае, ки мо дар он хӯроки шом хӯрдем, хеле қиммат буд.', options:['where','which','who','that'], answer:'where', explanation:'Тарабхона (ҷой) + дар он ҷо амал шуд -> where.' },
        { type:'fill_blank', prompt:'The phone ___ (ки) is on the table is mine.', promptTranslated:'Телефоне, ки дар рӯи миз аст, аз ман аст.', answer:'which', explanation:'Телефон (чиз) -> which ё that.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ин духтарест, ки ба ман кумак кард.', options:['This is','the girl','who','helped','me'], answer:'This is the girl who helped me.', explanation:'This is the girl who helped me.' },
        { type:'transform', prompt:'Якҷоя кунед: I saw a movie. It was very funny. (Истифода баред: which)', promptTranslated:'Ман филмеро дидам, ки хеле хандаовар буд.', answer:'I saw a movie which was very funny.', explanation:'I saw a movie which was very funny.' },
      ],
    },
    {
      lessonTitle: 'Lesson 6: Grammar — Reported Speech (Statements)', lessonTitleTg: 'Дарси 6: Грамматика — Нутқи ғайримустақим (Хабарӣ)',
      title: 'Reported Speech (Statements)', titleTranslated: 'Нутқи ғайримустақим (Ҷумлаҳои хабарӣ)', emoji: '🗣️',
      explanation:
`Вақте мо гапи каси дигарро ба каси сеюм мерасонем, мо аз Нутқи ғайримустақим (Reported Speech) истифода мебарем. Дар ин ҳолат замони феълҳо як қадам ба ақиб (ба гузашта) меравад.

**Қоидаи асосӣ: Present -> Past**
1. **Present Simple -> Past Simple:**
* Direct: "I **like** films." (Ман филмҳоро дӯст медорам).
* Reported: He said (that) he **liked** films. (Ӯ гуфт, ки филмҳоро дӯст медорад).
2. **Present Continuous -> Past Continuous:**
* Direct: "I **am reading** an article." (Ман мақола хонда истодаам).
* Reported: She said she **was reading** an article.
3. **Present Perfect -> Past Perfect:**
* Direct: "I **have seen** it." (Ман онро дидаам).
* Reported: He said he **had seen** it.
4. **Will -> Would:**
* Direct: "I **will upload** the video." (Ман видеоро бор мекунам).
* Reported: They said they **would upload** the video.

Шумо метавонед **said** (гуфт) ё **told me** (ба ман гуфт)-ро истифода баред:
* He said (that)...
* He told me (that)... (Баъди tell ҳатман шахс меояд!)`,
      rules: [
        { pattern: 'Present -> Past', note: 'I am happy -> He said he was happy.' },
        { pattern: 'will -> would', note: 'I will go -> She said she would go.' },
        { pattern: 'said vs told', note: 'He said he liked it. / He told ME he liked it.' },
      ],
      examples: [
        { sentence: 'She said she wanted to be a journalist.', translation: 'Ӯ гуфт, ки журналист шудан мехоҳад.', highlight: 'said she wanted' },
        { sentence: 'He told me he was watching a movie.', translation: 'Ӯ ба ман гуфт, ки филм тамошо карда истодааст.', highlight: 'told me he was watching' },
        { sentence: 'They said they had already bought the tickets.', translation: 'Онҳо гуфтанд, ки аллакай чиптаҳоро харидаанд.', highlight: 'said they had' },
        { sentence: 'John said he would call me later.', translation: 'Ҷон гуфт, ки дертар ба ман занг мезанад.', highlight: 'would call' },
      ],
      exercises: [
        { type:'choose', prompt:'"I am tired." -> He said he ___ tired.', promptTranslated:'Ӯ гуфт, ки хаста аст.', options:['was','is','am','were'], answer:'was', explanation:'am -> was (як қадам ба гузашта).' },
        { type:'choose', prompt:'"I will help you." -> She said she ___ help me.', promptTranslated:'Ӯ гуфт, ки ба ман кӯмак хоҳад кард.', options:['would','will','can','should'], answer:'would', explanation:'will -> would дар нутқи ғайримустақим.' },
        { type:'choose', prompt:'He ___ me that he liked the movie.', promptTranslated:'Ӯ ба ман гуфт, ки филм ба ӯ маъқул аст.', options:['told','said','talked','spoke'], answer:'told', explanation:'Баъди tell (told) шахс меояд: told me.' },
        { type:'fill_blank', prompt:'"I play tennis." -> He said that he ___ (бозӣ мекард) tennis.', promptTranslated:'Ӯ гуфт, ки теннис бозӣ мекунад.', answer:'played', explanation:'play -> played.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Онҳо гуфтанд, ки меоянд.', options:['They','said','they','would','come'], answer:'They said they would come.', explanation:'They said they would come.' },
        { type:'transform', prompt:'Ба Reported Speech табдил диҳед: "I can swim." (He said...)', promptTranslated:'Ӯ гуфт, ки шино карда метавонад.', answer:'He said he could swim.', explanation:'can -> could.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 7: Listening — The Fake News', lessonTitleTg: 'Дарси 7: Шунавоӣ — Ахбори Қалбакӣ',
    title: 'The Fake News Story', titleTranslated: 'Ҳикояи Ахбори Қалбакӣ', emoji: '📻',
    passage: 'Yesterday, a journalist published a shocking article about a famous actor. The headline said that the actor was retiring from cinema forever. Within hours, millions of people had read the article online and shared it on social media. Fans were crying and leaving sad comments. However, later that evening, the actor uploaded a video to his official page. He said that he was not retiring. In fact, he told his fans that he was preparing for a new movie which would come out next year. He explained that the article was completely fake news. He asked his followers not to believe everything they read on the internet. After the video was broadcast, the news website deleted the article and apologised.',
    passageTranslated: 'Дирӯз як журналист мақолаи ҳайратоваре дар бораи як ҳунарпешаи машҳур нашр кард. Сарлавҳа мегуфт, ки ҳунарпеша то абад аз кино ба нафақа мебарояд. Дар давоми чанд соат миллионҳо нафар мақоларо онлайн хонданд ва онро дар шабакаҳои иҷтимоӣ мубодила карданд. Мухлисон гиря мекарданд ва шарҳҳои ғамангез мегузоштанд. Бо вуҷуди ин, дертар худи ҳамон бегоҳ ҳунарпеша ба саҳифаи расмии худ видео бор кард. Ӯ гуфт, ки ба нафақа намебарояд. Дар асл, ӯ ба мухлисонаш гуфт, ки ба филми наве омодагӣ мебинад, ки соли оянда мебарояд. Ӯ фаҳмонд, ки мақола комилан ахбори қалбакӣ буд. Ӯ аз пайравонаш хоҳиш кард, ки ба ҳар чизе ки дар интернет мехонанд, бовар накунанд. Пас аз пахш шудани видео, вебсайти ахбор мақоларо нест кард ва узр пурсид.',
    questions: [
      { question:'What did the headline say?', questionTranslated:'Сарлавҳа чӣ мегуфт?', options:['The actor was retiring forever','The actor won an award','The actor died'], correctIndex:0, explanation:'The headline said that the actor was retiring from cinema forever.' },
      { question:'How did fans react at first?', correctIndex:2, questionTranslated:'Мухлисон дар аввал чӣ гуна аксуламал нишон доданд?', options:['They were happy','They did not care','They were crying and leaving sad comments'], explanation:'Fans were crying and leaving sad comments.' },
      { question:'What did the actor do that evening?', correctIndex:1, questionTranslated:'Он бегоҳ ҳунарпеша чӣ кор кард?', options:['He went to sleep','He uploaded a video to his page','He called the police'], explanation:'the actor uploaded a video to his official page.' },
      { question:'What was the actor actually doing?', correctIndex:0, questionTranslated:'Ҳунарпеша дар асл чӣ кор мекард?', options:['Preparing for a new movie','Retiring','Writing a book'], explanation:'he was preparing for a new movie.' },
      { question:'What did the news website do after the video?', correctIndex:2, questionTranslated:'Пас аз видео вебсайти ахбор чӣ кор кард?', options:['Ignored it','Wrote another fake article','Deleted the article and apologised'], explanation:'the news website deleted the article and apologised.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 8: Speaking — Discussing a Movie', lessonTitleTg: 'Дарси 8: Гуфтугӯ — Муҳокимаи Филм',
    title: 'Discussing a Movie', titleTranslated: 'Муҳокимаи Филм', emoji: '🎬',
    scenario: 'Шумо ва дӯстатон навакак аз кинотеатр баромадед ва филмро муҳокима карда истодаед.',
    lines: [
      { speaker:'Friend', text:'Well, what did you think of the movie?', translation:'Хуб, дар бораи филм чӣ фикр дорӣ?', isUser:false },
      { speaker:'You', text:'To be honest, I was a bit disappointed. The plot was very confusing.', translation:'Росташро гӯям, ман каме ноумед шудам. Сюжет хеле печида буд.', isUser:true },
      { speaker:'Friend', text:'Really? I loved it! The special effects on the big screen were amazing.', translation:'Дар ҳақиқат? Ба ман хеле маъқул шуд! Эффектҳои махсус дар экрани калон аҷиб буданд.', isUser:false },
      { speaker:'You', text:'Yes, the visuals were good, but the main character was boring.', translation:'Бале, визуалҳо хуб буданд, аммо қаҳрамони асосӣ дилгиркунанда буд.', isUser:true },
      { speaker:'Friend', text:'I disagree. The actor who played the hero gave a great performance.', translation:'Ман розӣ нестам. Ҳунарпешае, ки қаҳрамонро бозид, иҷрои олӣ нишон дод.', isUser:false },
      { speaker:'You', text:'Maybe, but the ending was terrible. It made no sense.', translation:'Шояд, аммо охираш даҳшатнок буд. Он ҳеҷ маъно надошт.', isUser:true },
      { speaker:'Friend', text:'I read an online review which said there will be a part two.', translation:'Ман баррасии онлайниеро хондам, ки мегуфт қисми дуюм хоҳад буд.', isUser:false },
      { speaker:'You', text:'Well, I definitely won\'t buy a ticket for the next one.', translation:'Хуб, ман ҳатман барои ояндааш чипта намехарам.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 9: Reading — The Impact of Streaming', lessonTitleTg: 'Дарси 9: Хониш — Таъсири Стриминг',
    title: 'The Impact of Streaming', titleTranslated: 'Таъсири Стриминг', emoji: '📺',
    passage: 'In the past, if you wanted to watch a movie, you had to go to the cinema or buy a DVD. If you wanted to listen to music, you bought a CD or a record. Today, the entertainment industry has been completely changed by streaming services. Platforms like Netflix and Spotify allow users to access millions of songs and thousands of movies instantly. This is very convenient for the audience, who can watch their favourite shows anywhere on their smartphones or tablets. However, this change is not positive for everyone. Many artists complain that streaming services do not pay them fairly. A musician whose song is played a million times might only earn a few hundred dollars. In addition, cinemas are struggling to attract viewers, as many people prefer the comfort of their own homes. Despite these challenges, streaming is here to stay, and the way we consume media will continue to evolve.',
    passageTranslated: 'Дар гузашта, агар шумо мехостед филм тамошо кунед, бояд ба кинотеатр мерафтед ё DVD мехаридед. Агар мусиқӣ гӯш кардан мехостед, CD ё пластинка мехаридед. Имрӯз, саноати вақтхушӣ тавассути хидматҳои стримингӣ (пахши мустақим) комилан тағйир ёфтааст. Платформаҳо ба монанди Netflix ва Spotify ба корбарон имкон медиҳанд, ки ба миллионҳо сурудҳо ва ҳазорҳо филмҳо фавран дастрасӣ пайдо кунанд. Ин барои тамошобинон хеле қулай аст, ки метавонанд намоишҳои дӯстдоштаи худро дар ҳама ҷо дар смартфонҳо ё планшетҳои худ тамошо кунанд. Бо вуҷуди ин, ин тағйирот барои ҳама мусбат нест. Бисёре аз ҳунармандон шикоят мекунанд, ки хидматҳои стримингӣ ба онҳо одилона пул пардохт намекунанд. Мусиқинавозе, ки сурудаш як миллион маротиба садо медиҳад, метавонад танҳо чандсад доллар ба даст орад. Илова бар ин, кинотеатрҳо барои ҷалби тамошобинон мубориза мебаранд, зеро бисёр одамон бароҳатии хонаҳои худро афзалтар медонанд. Сарфи назар аз ин мушкилот, стриминг боқӣ мемонад ва тарзи истеъмоли ВАО аз ҷониби мо таҳаввулотро идома хоҳад дод.',
    questions: [
      { question:'How did people watch movies in the past?', correctIndex:0, questionTranslated:'Дар гузашта одамон филмҳоро чӣ гуна тамошо мекарданд?', options:['By going to the cinema or buying a DVD','By streaming them online','On their phones'], explanation:'In the past... you had to go to the cinema or buy a DVD.' },
      { question:'What do streaming platforms allow users to do?', correctIndex:1, questionTranslated:'Платформаҳои стримингӣ ба корбарон чӣ имкон медиҳанд?', options:['Make movies easily','Access media instantly','Meet famous actors'], explanation:'allow users to access millions of songs and thousands of movies instantly.' },
      { question:'Why are streaming services convenient?', correctIndex:2, questionTranslated:'Чаро хидматҳои стримингӣ қулай ҳастанд?', options:['They are always free','They have no ads','You can watch anywhere on smartphones'], explanation:'who can watch their favourite shows anywhere on their smartphones.' },
      { question:'Why do many artists complain?', correctIndex:0, questionTranslated:'Чаро бисёр ҳунармандон шикоят мекунанд?', options:['They are not paid fairly','They don\'t like technology','No one listens to them'], explanation:'Many artists complain that streaming services do not pay them fairly.' },
      { question:'What is happening to cinemas?', correctIndex:1, questionTranslated:'Бо кинотеатрҳо чӣ рӯй дода истодааст?', options:['They are making more money','They are struggling to attract viewers','They are closing tomorrow'], explanation:'cinemas are struggling to attract viewers.' },
    ],
  },
  review: {
    passage: 'Media and entertainment are huge parts of our daily lives. Whether we are reading the headlines online, downloading a podcast, or watching a film at the cinema, we are constantly consuming information. Technology has made it easier to follow our favourite characters and actors. When a new movie comes out, we can instantly read reviews and decide if we want to see it. However, we must also be careful. The internet is full of fake news, and a sensational headline might not be true. As critical thinkers, we should always verify the facts before we share an article. Enjoy the entertainment, but stay smart about the media you consume.',
    passageTranslated: 'ВАО ва вақтхушӣ қисмҳои бузурги ҳаёти ҳаррӯзаи мо мебошанд. Новобаста аз он ки мо сарлавҳаҳоро онлайн мехонем, подкаст мефарорем ё дар кинотеатр филм тамошо мекунем, мо пайваста маълумотро истеъмол мекунем. Технология пайгирӣ кардани қаҳрамонҳо ва ҳунарпешаҳои дӯстдоштаи моро осонтар кардааст. Вақте ки филми нав мебарояд, мо метавонем фавран баррасиҳоро хонем ва қарор диҳем, ки оё мо мехоҳем онро бубинем. Бо вуҷуди ин, мо инчунин бояд эҳтиёткор бошем. Интернет пур аз ахбори қалбакӣ аст ва сарлавҳаи ҳангомавӣ метавонад дуруст набошад. Ҳамчун мутафаккирони интиқодӣ, мо ҳамеша бояд далелҳоро пеш аз мубодилаи мақола тафтиш кунем. Аз вақтхушӣ лаззат баред, аммо нисбат ба ВАО-е, ки истеъмол мекунед, зирак бошед.',
    questions: [
      { question:'What do we constantly do every day?', correctIndex:0, questionTranslated:'Мо ҳар рӯз пайваста чӣ кор мекунанд?', options:['Consume information','Write articles','Sing songs'], explanation:'we are constantly consuming information.' },
      { question:'How does technology help us with movies?', correctIndex:1, questionTranslated:'Технология ба мо бо филмҳо чӣ гуна кӯмак мекунад?', options:['It makes the tickets cheaper','We can instantly read reviews','It makes the screens bigger'], explanation:'we can instantly read reviews and decide if we want to see it.' },
      { question:'What danger exists on the internet?', correctIndex:2, questionTranslated:'Дар интернет кадом хатар вуҷуд дорад?', options:['Too many ads','Computer viruses','Fake news'], explanation:'The internet is full of fake news.' },
      { question:'What should we do before sharing an article?', correctIndex:1, questionTranslated:'Пеш аз мубодилаи мақола мо бояд чӣ кор кунем?', options:['Ask a friend','Verify the facts','Pay money'], explanation:'we should always verify the facts before we share an article.' },
      { question:'What is the main advice of the text?', correctIndex:0, questionTranslated:'Маслиҳати асосии матн чист?', options:['Enjoy entertainment but stay smart','Never use the internet','Only watch comedies'], explanation:'Enjoy the entertainment, but stay smart about the media you consume.' },
    ],
  },
  exam: {
    passage: 'The history of art and entertainment shows how human creativity evolves. Centuries ago, people gathered in theatres to watch plays written by famous playwrights like Shakespeare. Later, the invention of photography and cinema brought a revolution. Audiences were amazed by moving pictures, even when they had no sound. Soon after, the radio allowed people to listen to live broadcasts, music, and news in their own homes. Today, the digital age has merged all these forms of media. We can watch a live performance, listen to a soundtrack, or read an article on a single device. A journalist told a reporter recently that "content is everywhere." This abundance of media means that we have endless choices, but it also makes it harder to choose what to watch or read.',
    passageTranslated: 'Таърихи санъат ва вақтхушӣ нишон медиҳад, ки чӣ гуна эҷодиёти инсон таҳаввул меёбад. Асрҳо пеш, одамон дар театрҳо ҷамъ меомаданд, то намоишномаҳои навиштаи драманависони машҳур ба монанди Шекспирро тамошо кунанд. Баъдтар ихтирои аксбардорӣ ва кино инқилобе овард. Тамошобинон аз тасвирҳои ҳаракаткунанда, ҳатто вақте ки онҳо садо надоштанд, дар ҳайрат монданд. Каме пас, радио ба одамон имкон дод, ки пахши мустақим, мусиқӣ ва ахборро дар хонаҳои худ гӯш кунанд. Имрӯз, асри рақамӣ ҳамаи ин шаклҳои ВАО-ро муттаҳид кардааст. Мо метавонем иҷрои зиндаро тамошо кунем, саундтрекро гӯш кунем ё мақоларо дар як дастгоҳ хонем. Як рӯзноманигор ба наздикӣ ба хабарнигор гуфт, ки "мундариҷа дар ҳама ҷост." Ин фаровонии ВАО маънои онро дорад, ки мо интихобҳои беохир дорем, аммо он инчунин интихоб кардани чиро тамошо кардан ё хонданро душвортар мекунад.',
    questions: [
      { question:'Where did people watch plays centuries ago?', correctIndex:1, questionTranslated:'Асрҳо пеш одамон намоишномаҳоро дар куҷо тамошо мекарданд?', options:['On television','In theatres','On the internet'], explanation:'people gathered in theatres to watch plays.' },
      { question:'What amazed audiences about early cinema?', correctIndex:0, questionTranslated:'Дар кинои аввалин тамошобинон аз чӣ ба ҳайрат меомаданд?', options:['Moving pictures without sound','The cheap tickets','The colourful posters'], explanation:'Audiences were amazed by moving pictures, even when they had no sound.' },
      { question:'What did the radio allow people to do?', correctIndex:2, questionTranslated:'Радио ба одамон имкон дод, ки чӣ кор кунанд?', options:['Watch movies','Talk to friends','Listen to live broadcasts at home'], explanation:'the radio allowed people to listen to live broadcasts... in their own homes.' },
      { question:'What has the digital age done to media?', correctIndex:0, questionTranslated:'Асри рақамӣ бо ВАО чӣ кард?', options:['Merged all forms into a single device','Destroyed the media','Made it more expensive'], explanation:'the digital age has merged all these forms of media... on a single device.' },
      { question:'What is the problem with having endless choices?', correctIndex:1, questionTranslated:'Бо доштани интихобҳои беохир чӣ мушкил вуҷуд дорад?', options:['It costs too much money','It makes it harder to choose what to watch','It breaks the internet'], explanation:'it also makes it harder to choose what to watch or read.' },
    ],
  },
};
