// ─────────────────────────────────────────────────────────────────────────────
// CEFR A1 English-for-Tajik grammar curriculum (P0 audit fix, Phase 2).
// Every topic carries: explanation (Tajik markdown), 4-6 examples, 6-10 exercises
// mixing all five pedagogical types:
//   choose      → Multiple Choice / Match
//   fill_blank  → Fill In The Blank
//   reorder     → Sentence Building
//   transform   → Error Correction
// `match`  = existing GrammarTopic.title to overwrite (else a new topic is created)
// `link`   = { moduleOrder, lessonTitle, lessonTitleTranslated } → reuse-or-create a
//            grammar lesson in that module, placed right after the vocabulary block.
// ─────────────────────────────────────────────────────────────────────────────

export const TOPICS = [
  // 1 ── Subject Pronouns ─────────────────────────────────────────────────────
  {
    key: 'subject-pronouns',
    title: 'Subject Pronouns',
    titleTranslated: 'Ҷонишинҳои фоилӣ',
    emoji: '🧑',
    explanation:
`Ҷонишинҳои фоилӣ ба ҷои номи шахс ё ашё меоянд ва дар аввали ҷумла фоил мешаванд.

- **I** — ман
- **You** — ту / шумо
- **He** — ӯ (мард)
- **She** — ӯ (зан)
- **It** — он (ашё/ҳайвон)
- **We** — мо
- **They** — онҳо

Дар забони англисӣ фоил ҳатмист — ҷумла бе ҷонишин (ё ном) дуруст намешавад.`,
    rules: [
      { pattern: 'I / You / He / She / It / We / They + феъл', note: 'Ҳар ҷумла бо фоил оғоз меёбад.' },
      { pattern: 'He = мард, She = зан, It = ашё/ҳайвон', note: 'Барои одам He/She, барои чиз It.' },
      { pattern: 'We = ман + дигарон, They = онҳо', note: 'We гӯянда дохил аст, They не.' },
    ],
    examples: [
      { sentence: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'I' },
      { sentence: 'She is my sister.', translation: 'Ӯ хоҳари ман аст.', highlight: 'She' },
      { sentence: 'It is a book.', translation: 'Он китоб аст.', highlight: 'It' },
      { sentence: 'We are friends.', translation: 'Мо дӯст ҳастем.', highlight: 'We' },
      { sentence: 'They are teachers.', translation: 'Онҳо муаллим ҳастанд.', highlight: 'They' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ am a doctor.', promptTranslated: 'Ман духтур ҳастам.', options: ['I','He','We','They'], answer: 'I', explanation: 'Бо "am" ҳамеша I меояд.' },
      { type: 'choose', prompt: 'Ali is a boy. ___ is my friend.', promptTranslated: 'Барои мард кадом ҷонишин?', options: ['She','He','It','They'], answer: 'He', explanation: 'Алӣ мард аст → He.' },
      { type: 'choose', prompt: 'Sara is a girl. ___ is happy.', promptTranslated: 'Барои зан кадом ҷонишин?', options: ['He','It','She','We'], answer: 'She', explanation: 'Сара зан аст → She.' },
      { type: 'fill_blank', prompt: 'This is a cat. ___ is small.', promptTranslated: 'Барои ҳайвон/ашё.', answer: 'It', explanation: 'Ашё ва ҳайвон → It.' },
      { type: 'fill_blank', prompt: 'My brother and I are here. ___ are students.', promptTranslated: 'Ман ва бародарам = ?', answer: 'We', explanation: 'Ман + дигарон → We.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Онҳо муаллим ҳастанд.', options: ['are','They','teachers'], answer: 'They are teachers.', explanation: 'Фоил → феъл → исм.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Am a student.', promptTranslated: 'Фоил намерасад.', answer: 'I am a student.', explanation: 'Бе фоил намешавад — I илова кунед.' },
      { type: 'choose', prompt: 'Мувофиқ кунед: "зан" = ?', promptTranslated: 'Тарҷумаи дуруст.', options: ['She','He','It','You'], answer: 'She', explanation: 'зан → She.' },
    ],
    link: { moduleOrder: 0, lessonTitle: 'Grammar: Subject Pronouns', lessonTitleTranslated: 'Грамматика: Ҷонишинҳои фоилӣ' },
  },

  // 2 ── Verb To Be ───────────────────────────────────────────────────────────
  {
    key: 'verb-to-be',
    match: 'I am / You are',
    title: 'Verb To Be (am / is / are)',
    titleTranslated: 'Феъли To Be (am / is / are)',
    emoji: '🔗',
    explanation:
`Феъли **to be** (будан) се шакл дорад ва аз фоил вобаста аст:

- **I am** — ман ҳастам
- **He / She / It is** — ӯ/он аст
- **You / We / They are** — ту/мо/онҳо ҳастед/ҳастем/ҳастанд

Шакли инкорӣ: **am not / is not (isn't) / are not (aren't)**.
Дар англисӣ to be ҳатмист: «I am Ali», на «I Ali».`,
    rules: [
      { pattern: 'I + am', note: 'Бо I ҳамеша am.' },
      { pattern: 'He / She / It + is', note: 'Барои сеюм шахси танҳо is.' },
      { pattern: 'You / We / They + are', note: 'Барои ҷамъ ва you ҳамеша are.' },
      { pattern: 'Инкор: is not = isn’t, are not = aren’t', note: 'Барои инкор not илова мешавад.' },
    ],
    examples: [
      { sentence: 'I am Ali.', translation: 'Ман Алӣ ҳастам.', highlight: 'am' },
      { sentence: 'You are my friend.', translation: 'Ту дӯсти ман ҳастӣ.', highlight: 'are' },
      { sentence: 'He is a teacher.', translation: 'Ӯ муаллим аст.', highlight: 'is' },
      { sentence: 'We are happy.', translation: 'Мо хушбахт ҳастем.', highlight: 'are' },
      { sentence: 'She is not at home.', translation: 'Ӯ дар хона нест.', highlight: 'is not' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ a student.', promptTranslated: 'Ман донишҷӯ ҳастам.', options: ['am','is','are','be'], answer: 'am', explanation: 'Бо I → am.' },
      { type: 'choose', prompt: 'She ___ my sister.', promptTranslated: 'Ӯ хоҳари ман аст.', options: ['am','are','is','be'], answer: 'is', explanation: 'Бо She → is.' },
      { type: 'choose', prompt: 'They ___ teachers.', promptTranslated: 'Онҳо муаллим ҳастанд.', options: ['is','am','are','be'], answer: 'are', explanation: 'Бо They → are.' },
      { type: 'fill_blank', prompt: 'You ___ my friend.', promptTranslated: 'Ту дӯсти ман ҳастӣ.', answer: 'are', explanation: 'Бо You → are.' },
      { type: 'fill_blank', prompt: 'It ___ a book.', promptTranslated: 'Он китоб аст.', answer: 'is', explanation: 'Бо It → is.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ман муаллим ҳастам.', options: ['am','I','a','teacher'], answer: 'I am a teacher.', explanation: 'I + am + a + teacher.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: He are a doctor.', promptTranslated: 'Шакли to be ғалат.', answer: 'He is a doctor.', explanation: 'Бо He → is, на are.' },
      { type: 'transform', prompt: 'Инкор кунед: I am tired.', promptTranslated: 'Ба инкор гузаронед.', answer: 'I am not tired.', explanation: 'not пас аз am.' },
    ],
    link: { moduleOrder: 0, lessonTitle: 'Grammar: Verb To Be', lessonTitleTranslated: 'Грамматика: Феъли To Be' },
  },

  // 3 ── A / An / The ─────────────────────────────────────────────────────────
  {
    key: 'articles',
    title: 'A / An / The',
    titleTranslated: 'Артиклҳо: A / An / The',
    emoji: '📰',
    explanation:
`Артикл пеш аз исм меояд:

- **a** — пеш аз исми ҳамсадоӣ: a book, a car
- **an** — пеш аз исми садоноки (a, e, i, o, u): an apple, an egg
- **the** — барои чизи муайян ё аллакай зикршуда: the sun, the book (ҳамон китоб)

A/an танҳо бо исми танҳои шумурдашаванда меоянд.`,
    rules: [
      { pattern: 'a + ҳамсадо (a dog, a house)', note: 'Барои овози ҳамсадо.' },
      { pattern: 'an + садонок (an apple, an hour)', note: 'Барои овози садонок.' },
      { pattern: 'the + исми муайян', note: 'Вақте ҳарду тараф медонанд кадомаш.' },
    ],
    examples: [
      { sentence: 'I have a car.', translation: 'Ман мошин дорам.', highlight: 'a' },
      { sentence: 'She eats an apple.', translation: 'Ӯ себ мехӯрад.', highlight: 'an' },
      { sentence: 'The sun is hot.', translation: 'Офтоб гарм аст.', highlight: 'The' },
      { sentence: 'It is an egg.', translation: 'Он тухм аст.', highlight: 'an' },
      { sentence: 'Open the door, please.', translation: 'Лутфан дарро кушоед.', highlight: 'the' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have ___ book.', promptTranslated: 'book бо ҳамсадо.', options: ['a','an','the','-'], answer: 'a', explanation: 'book бо ҳамсадо → a.' },
      { type: 'choose', prompt: 'She has ___ orange.', promptTranslated: 'orange бо садонок.', options: ['a','an','the','-'], answer: 'an', explanation: 'orange бо садонок → an.' },
      { type: 'choose', prompt: '___ moon is beautiful.', promptTranslated: 'Чизи ягона ва муайян.', options: ['A','An','The','-'], answer: 'The', explanation: 'Моҳ ягона аст → the.' },
      { type: 'fill_blank', prompt: 'It is ___ egg.', promptTranslated: 'egg бо садонок.', answer: 'an', explanation: 'egg бо садонок → an.' },
      { type: 'fill_blank', prompt: 'He is ___ teacher.', promptTranslated: 'teacher бо ҳамсадо.', answer: 'a', explanation: 'teacher → a.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ман себ дорам.', options: ['an','I','apple','have'], answer: 'I have an apple.', explanation: 'an apple — садонок.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I see a elephant.', promptTranslated: 'Артикл ғалат.', answer: 'I see an elephant.', explanation: 'elephant бо садонок → an.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: She has an dog.', promptTranslated: 'Артикл ғалат.', answer: 'She has a dog.', explanation: 'dog бо ҳамсадо → a.' },
    ],
    link: { moduleOrder: 1, lessonTitle: 'Grammar: A / An / The', lessonTitleTranslated: 'Грамматика: Артиклҳо' },
  },

  // 4 ── Question Words ───────────────────────────────────────────────────────
  {
    key: 'question-words',
    title: 'Question Words',
    titleTranslated: 'Калимаҳои саволӣ',
    emoji: '❓',
    explanation:
`Калимаҳои саволӣ дар аввали савол меоянд:

- **What** — чӣ
- **Who** — кӣ
- **Where** — куҷо
- **When** — кай
- **How** — чӣ гуна / чӣ хел
- **How old** — чандсола
- **How many** — чанд то

Намуна: **What is your name?** — Номи ту чист?`,
    rules: [
      { pattern: 'Question word + is/are + … ?', note: 'Калимаи саволӣ → to be → бақия.' },
      { pattern: 'What = чӣ, Who = кӣ, Where = куҷо', note: 'Се саволи бунёдӣ.' },
      { pattern: 'How old are you? = Чандсолаӣ?', note: 'Барои синну сол How old.' },
    ],
    examples: [
      { sentence: 'What is your name?', translation: 'Номи ту чист?', highlight: 'What' },
      { sentence: 'Where are you from?', translation: 'Ту аз куҷоӣ?', highlight: 'Where' },
      { sentence: 'Who is that man?', translation: 'Он мард кист?', highlight: 'Who' },
      { sentence: 'How old are you?', translation: 'Ту чандсолаӣ?', highlight: 'How old' },
      { sentence: 'When is the lesson?', translation: 'Дарс кай аст?', highlight: 'When' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is your name?', promptTranslated: 'Номи ту чист?', options: ['What','Where','Who','When'], answer: 'What', explanation: 'Барои ном → What.' },
      { type: 'choose', prompt: '___ are you from?', promptTranslated: 'Ту аз куҷоӣ?', options: ['Who','Where','What','How'], answer: 'Where', explanation: 'Барои ҷой → Where.' },
      { type: 'choose', prompt: '___ is that woman?', promptTranslated: 'Он зан кист?', options: ['What','Where','Who','When'], answer: 'Who', explanation: 'Барои шахс → Who.' },
      { type: 'fill_blank', prompt: '___ old are you?', promptTranslated: 'Ту чандсолаӣ?', answer: 'How', explanation: 'How old → синну сол.' },
      { type: 'fill_blank', prompt: '___ is the party? — On Friday.', promptTranslated: 'Базм кай аст?', answer: 'When', explanation: 'Барои вақт → When.' },
      { type: 'reorder', prompt: 'Саволро сохт кунед:', promptTranslated: 'Ту аз куҷоӣ?', options: ['are','Where','from','you'], answer: 'Where are you from?', explanation: 'Where + are + you + from.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Where is your name?', promptTranslated: 'Калимаи саволӣ ғалат.', answer: 'What is your name?', explanation: 'Барои ном → What, на Where.' },
      { type: 'choose', prompt: 'Мувофиқ кунед: "куҷо" = ?', promptTranslated: 'Тарҷума.', options: ['Where','What','When','Who'], answer: 'Where', explanation: 'куҷо → Where.' },
    ],
    link: { moduleOrder: 1, lessonTitle: 'Grammar: Question Words', lessonTitleTranslated: 'Грамматика: Калимаҳои саволӣ' },
  },

  // 5 ── Plural Nouns ─────────────────────────────────────────────────────────
  {
    key: 'plural-nouns',
    title: 'Plural Nouns',
    titleTranslated: 'Исми ҷамъ',
    emoji: '🔢',
    explanation:
`Барои ҷамъи исм одатан **-s** илова мешавад:

- book → book**s**, car → car**s**
- Пас аз -s, -sh, -ch, -x → **-es**: box → box**es**, watch → watch**es**
- Пас аз ҳамсадо + y → y ба **-ies**: city → cit**ies**

Истиснолар: man → **men**, woman → **women**, child → **children**.`,
    rules: [
      { pattern: 'исм + s', note: 'Шакли маъмулии ҷамъ.' },
      { pattern: '-s/-sh/-ch/-x + es', note: 'box → boxes, brush → brushes.' },
      { pattern: 'ҳамсадо + y → ies', note: 'city → cities.' },
      { pattern: 'Истисно: man→men, child→children', note: 'Шаклҳои ноқоидавӣ.' },
    ],
    examples: [
      { sentence: 'I have two books.', translation: 'Ман ду китоб дорам.', highlight: 'books' },
      { sentence: 'There are three boxes.', translation: 'Се қуттӣ ҳаст.', highlight: 'boxes' },
      { sentence: 'Big cities are busy.', translation: 'Шаҳрҳои калон серодаманд.', highlight: 'cities' },
      { sentence: 'Two men are here.', translation: 'Ду мард ин ҷо ҳастанд.', highlight: 'men' },
      { sentence: 'The children play.', translation: 'Кӯдакон бозӣ мекунанд.', highlight: 'children' },
    ],
    exercises: [
      { type: 'choose', prompt: 'one book → two ___', promptTranslated: 'Ҷамъи book.', options: ['books','bookes','bookies','book'], answer: 'books', explanation: 'book + s.' },
      { type: 'choose', prompt: 'one box → two ___', promptTranslated: 'Ҷамъи box.', options: ['boxs','boxes','boxies','box'], answer: 'boxes', explanation: '-x → es.' },
      { type: 'choose', prompt: 'one city → two ___', promptTranslated: 'Ҷамъи city.', options: ['citys','cityes','cities','city'], answer: 'cities', explanation: 'y → ies.' },
      { type: 'fill_blank', prompt: 'one man → two ___', promptTranslated: 'Ҷамъи man.', answer: 'men', explanation: 'Истисно: man → men.' },
      { type: 'fill_blank', prompt: 'one child → three ___', promptTranslated: 'Ҷамъи child.', answer: 'children', explanation: 'Истисно: child → children.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ман се себ дорам.', options: ['three','I','apples','have'], answer: 'I have three apples.', explanation: 'apple → apples.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I have two boxs.', promptTranslated: 'Шакли ҷамъ ғалат.', answer: 'I have two boxes.', explanation: '-x → es.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Three childs play.', promptTranslated: 'Шакли ҷамъ ғалат.', answer: 'Three children play.', explanation: 'child → children.' },
    ],
    link: { moduleOrder: 2, lessonTitle: 'Grammar: Plural Nouns', lessonTitleTranslated: 'Грамматика: Исми ҷамъ' },
  },

  // 6 ── Possessive Adjectives ────────────────────────────────────────────────
  {
    key: 'possessive-adjectives',
    title: 'Possessive Adjectives',
    titleTranslated: 'Сифатҳои соҳибӣ',
    emoji: '👪',
    explanation:
`Сифатҳои соҳибӣ нишон медиҳанд, ки чиз аз они кист:

- **my** — аз они ман
- **your** — аз они ту/шумо
- **his** — аз они ӯ (мард)
- **her** — аз они ӯ (зан)
- **its** — аз они он
- **our** — аз они мо
- **their** — аз они онҳо

Пеш аз исм меоянд: **my brother**, **her name**.`,
    rules: [
      { pattern: 'my / your / his / her / its / our / their + исм', note: 'Пеш аз исм меоянд.' },
      { pattern: 'his = мард, her = зан', note: 'Аз ҷинси соҳиб вобаста.' },
    ],
    examples: [
      { sentence: 'This is my brother.', translation: 'Ин бародари ман аст.', highlight: 'my' },
      { sentence: 'Her name is Sara.', translation: 'Номи ӯ Сара аст.', highlight: 'Her' },
      { sentence: 'His car is red.', translation: 'Мошини ӯ сурх аст.', highlight: 'His' },
      { sentence: 'Our house is big.', translation: 'Хонаи мо калон аст.', highlight: 'Our' },
      { sentence: 'Their children are here.', translation: 'Кӯдакони онҳо ин ҷоянд.', highlight: 'Their' },
    ],
    exercises: [
      { type: 'choose', prompt: 'This is ___ book. (аз они ман)', promptTranslated: 'Китоби ман.', options: ['my','your','his','her'], answer: 'my', explanation: 'аз они ман → my.' },
      { type: 'choose', prompt: 'Sara is happy. ___ name is Sara.', promptTranslated: 'Барои зан.', options: ['his','her','its','their'], answer: 'her', explanation: 'Сара зан → her.' },
      { type: 'choose', prompt: 'Ali has a car. ___ car is new.', promptTranslated: 'Барои мард.', options: ['her','his','our','its'], answer: 'his', explanation: 'Алӣ мард → his.' },
      { type: 'fill_blank', prompt: 'We love ___ city. (аз они мо)', promptTranslated: 'Шаҳри мо.', answer: 'our', explanation: 'аз они мо → our.' },
      { type: 'fill_blank', prompt: 'They have a dog. ___ dog is big.', promptTranslated: 'Аз они онҳо.', answer: 'Their', explanation: 'аз они онҳо → their.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ин хоҳари ман аст.', options: ['my','This','sister','is'], answer: 'This is my sister.', explanation: 'my + sister.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Her name is Ali. (Алӣ мард аст)', promptTranslated: 'Сифати соҳибӣ ғалат.', answer: 'His name is Ali.', explanation: 'Мард → his.' },
      { type: 'choose', prompt: 'Мувофиқ кунед: "аз они ту" = ?', promptTranslated: 'Тарҷума.', options: ['your','my','our','their'], answer: 'your', explanation: 'аз они ту → your.' },
    ],
    link: { moduleOrder: 2, lessonTitle: 'Grammar: Possessive Adjectives', lessonTitleTranslated: 'Грамматика: Сифатҳои соҳибӣ' },
  },

  // 7 ── Have Got / Has Got ───────────────────────────────────────────────────
  {
    key: 'have-got',
    title: 'Have Got / Has Got',
    titleTranslated: 'Have got / Has got (доштан)',
    emoji: '🎒',
    explanation:
`Барои доштан мо **have got / has got** истифода мебарем:

- **I / You / We / They → have got**
- **He / She / It → has got**

Инкор: **haven’t got / hasn’t got**.
Намуна: **I have got a sister.** — Ман як хоҳар дорам.`,
    rules: [
      { pattern: 'I/You/We/They + have got', note: 'Барои аксар фоилҳо have got.' },
      { pattern: 'He/She/It + has got', note: 'Барои сеюм шахси танҳо has got.' },
      { pattern: 'Инкор: haven’t/hasn’t got', note: 'not илова мешавад.' },
    ],
    examples: [
      { sentence: 'I have got a brother.', translation: 'Ман як бародар дорам.', highlight: 'have got' },
      { sentence: 'She has got two cats.', translation: 'Ӯ ду гурба дорад.', highlight: 'has got' },
      { sentence: 'We have got a big house.', translation: 'Мо хонаи калон дорем.', highlight: 'have got' },
      { sentence: 'He has not got a car.', translation: 'Ӯ мошин надорад.', highlight: 'has not got' },
      { sentence: 'They have got three children.', translation: 'Онҳо се фарзанд доранд.', highlight: 'have got' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ a sister.', promptTranslated: 'Ман хоҳар дорам.', options: ['have got','has got','am got','got'], answer: 'have got', explanation: 'Бо I → have got.' },
      { type: 'choose', prompt: 'She ___ a new phone.', promptTranslated: 'Ӯ телефони нав дорад.', options: ['have got','has got','are got','got'], answer: 'has got', explanation: 'Бо She → has got.' },
      { type: 'choose', prompt: 'They ___ two dogs.', promptTranslated: 'Онҳо ду саг доранд.', options: ['has got','have got','is got','got'], answer: 'have got', explanation: 'Бо They → have got.' },
      { type: 'fill_blank', prompt: 'He ___ got a bike.', promptTranslated: 'Ӯ велосипед дорад.', answer: 'has', explanation: 'Бо He → has got.' },
      { type: 'fill_blank', prompt: 'We ___ got a garden.', promptTranslated: 'Мо боғ дорем.', answer: 'have', explanation: 'Бо We → have got.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ман як бародар дорам.', options: ['got','I','a','brother','have'], answer: 'I have got a brother.', explanation: 'I + have got + a + brother.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: She have got a cat.', promptTranslated: 'Шакл ғалат.', answer: 'She has got a cat.', explanation: 'Бо She → has got.' },
      { type: 'transform', prompt: 'Инкор кунед: I have got a car.', promptTranslated: 'Ба инкор гузаронед.', answer: 'I have not got a car.', explanation: 'not пас аз have.' },
    ],
    link: { moduleOrder: 2, lessonTitle: 'Grammar: Have Got / Has Got', lessonTitleTranslated: 'Грамматика: Have got / Has got' },
  },

  // 8 ── Basic Past Reference (Was / Were) ────────────────────────────────────
  {
    key: 'was-were',
    title: 'Basic Past Reference (Was / Were)',
    titleTranslated: 'Гузаштаи содда: Was / Were',
    emoji: '🕰️',
    explanation:
`**Was / Were** шакли гузаштаи феъли *to be* аст (будам/буд/будем):

- **I / He / She / It → was**
- **You / We / They → were**

Намуна: **I was at home yesterday.** — Ман дирӯз дар хона будам.
Инкор: **was not (wasn’t) / were not (weren’t)**.`,
    rules: [
      { pattern: 'I/He/She/It + was', note: 'Гузаштаи am/is.' },
      { pattern: 'You/We/They + were', note: 'Гузаштаи are.' },
      { pattern: 'yesterday, last week → гузашта', note: 'Калимаҳои вақти гузашта.' },
    ],
    examples: [
      { sentence: 'I was at school yesterday.', translation: 'Ман дирӯз дар мактаб будам.', highlight: 'was' },
      { sentence: 'She was happy.', translation: 'Ӯ хушбахт буд.', highlight: 'was' },
      { sentence: 'They were at home.', translation: 'Онҳо дар хона буданд.', highlight: 'were' },
      { sentence: 'We were friends.', translation: 'Мо дӯст будем.', highlight: 'were' },
      { sentence: 'It was cold.', translation: 'Ҳаво хунук буд.', highlight: 'was' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ at home yesterday.', promptTranslated: 'Ман дирӯз дар хона будам.', options: ['was','were','am','is'], answer: 'was', explanation: 'Бо I → was.' },
      { type: 'choose', prompt: 'They ___ at the park.', promptTranslated: 'Онҳо дар боғ буданд.', options: ['was','were','are','is'], answer: 'were', explanation: 'Бо They → were.' },
      { type: 'choose', prompt: 'She ___ tired.', promptTranslated: 'Ӯ монда буд.', options: ['were','was','are','am'], answer: 'was', explanation: 'Бо She → was.' },
      { type: 'fill_blank', prompt: 'We ___ happy.', promptTranslated: 'Мо хушбахт будем.', answer: 'were', explanation: 'Бо We → were.' },
      { type: 'fill_blank', prompt: 'It ___ hot yesterday.', promptTranslated: 'Дирӯз гарм буд.', answer: 'was', explanation: 'Бо It → was.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Онҳо дар хона буданд.', options: ['were','They','home','at'], answer: 'They were at home.', explanation: 'They + were + at + home.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I were happy.', promptTranslated: 'Шакл ғалат.', answer: 'I was happy.', explanation: 'Бо I → was.' },
      { type: 'transform', prompt: 'Ба гузашта гузаронед: She is at school.', promptTranslated: 'Ҳозира → гузашта.', answer: 'She was at school.', explanation: 'is → was.' },
    ],
    link: { moduleOrder: 3, lessonTitle: 'Grammar: Was / Were', lessonTitleTranslated: 'Грамматика: Was / Were' },
  },

  // 9 ── Present Simple (base) ────────────────────────────────────────────────
  {
    key: 'present-simple',
    match: 'Present Simple (I, You, We, They)',
    title: 'Present Simple (I, You, We, They)',
    titleTranslated: 'Замони ҳозираи содда (I, You, We, They)',
    emoji: '🔁',
    explanation:
`Замони ҳозираи содда амали ҳаррӯза ё ҳақиқатро ифода мекунад.
Бо **I, You, We, They** феъл дар шакли асосӣ меояд (бе тағйир):

- I **work** every day. — Ман ҳар рӯз кор мекунам.
- They **play** football. — Онҳо футбол бозӣ мекунанд.

Инкор: **do not (don’t) + феъл**. Савол: **Do you …?**`,
    rules: [
      { pattern: 'I/You/We/They + feʼli асосӣ', note: 'Бе илова: I work, they play.' },
      { pattern: 'Инкор: don’t + феъл', note: 'I don’t work.' },
      { pattern: 'Савол: Do + фоил + феъл?', note: 'Do you work?' },
    ],
    examples: [
      { sentence: 'I work every day.', translation: 'Ман ҳар рӯз кор мекунам.', highlight: 'work' },
      { sentence: 'You play football.', translation: 'Ту футбол бозӣ мекунӣ.', highlight: 'play' },
      { sentence: 'We live in Dushanbe.', translation: 'Мо дар Душанбе зиндагӣ мекунем.', highlight: 'live' },
      { sentence: 'They like tea.', translation: 'Онҳо чойро дӯст медоранд.', highlight: 'like' },
      { sentence: 'I do not eat meat.', translation: 'Ман гӯшт намехӯрам.', highlight: 'do not' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ every day.', promptTranslated: 'Ман ҳар рӯз кор мекунам.', options: ['work','works','working','am work'], answer: 'work', explanation: 'Бо I → шакли асосӣ.' },
      { type: 'choose', prompt: 'They ___ in Khujand.', promptTranslated: 'Онҳо дар Хуҷанд зиндагӣ мекунанд.', options: ['lives','live','living','to live'], answer: 'live', explanation: 'Бо They → шакли асосӣ.' },
      { type: 'fill_blank', prompt: 'We ___ tea. (like)', promptTranslated: 'Мо чойро дӯст медорем.', answer: 'like', explanation: 'Бо We → like.' },
      { type: 'fill_blank', prompt: 'You ___ football. (play)', promptTranslated: 'Ту футбол бозӣ мекунӣ.', answer: 'play', explanation: 'Бо You → play.' },
      { type: 'choose', prompt: 'Савол: ___ you like coffee?', promptTranslated: 'Оё қаҳваро дӯст медорӣ?', options: ['Do','Does','Are','Is'], answer: 'Do', explanation: 'Бо you → Do.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Онҳо чой менӯшанд.', options: ['drink','They','tea'], answer: 'They drink tea.', explanation: 'They + drink + tea.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I works every day.', promptTranslated: 'Шакли феъл ғалат.', answer: 'I work every day.', explanation: 'Бо I → work (бе s).' },
      { type: 'transform', prompt: 'Инкор кунед: They play football.', promptTranslated: 'Ба инкор гузаронед.', answer: 'They do not play football.', explanation: 'don’t + феъл.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 10 ── Present Simple (He, She, It) ────────────────────────────────────────
  {
    key: 'present-simple-3rd',
    match: 'Present Simple (He, She, It)',
    title: 'Present Simple (He, She, It)',
    titleTranslated: 'Замони ҳозираи содда (He, She, It)',
    emoji: '🧩',
    explanation:
`Бо **He, She, It** ба охири феъл **-s** (ё **-es**) илова мешавад:

- He **works**. — Ӯ кор мекунад.
- She **plays**. — Ӯ бозӣ мекунад.
- It **goes**. (пас аз -o, -s, -sh, -ch → -es)

Инкор: **does not (doesn’t) + феъли асосӣ**. Савол: **Does he …?**`,
    rules: [
      { pattern: 'He/She/It + феъл + s', note: 'works, plays, reads.' },
      { pattern: '-o/-s/-sh/-ch → es', note: 'go → goes, watch → watches.' },
      { pattern: 'Инкор: doesn’t + феъли асосӣ', note: 'She doesn’t work.' },
    ],
    examples: [
      { sentence: 'He works in an office.', translation: 'Ӯ дар идора кор мекунад.', highlight: 'works' },
      { sentence: 'She plays the guitar.', translation: 'Ӯ гитара менавозад.', highlight: 'plays' },
      { sentence: 'It goes fast.', translation: 'Он зуд меравад.', highlight: 'goes' },
      { sentence: 'My father watches TV.', translation: 'Падарам телевизор тамошо мекунад.', highlight: 'watches' },
      { sentence: 'She does not eat fish.', translation: 'Ӯ моҳӣ намехӯрад.', highlight: 'does not' },
    ],
    exercises: [
      { type: 'choose', prompt: 'He ___ in a bank.', promptTranslated: 'Ӯ дар бонк кор мекунад.', options: ['work','works','working','is work'], answer: 'works', explanation: 'Бо He → work + s.' },
      { type: 'choose', prompt: 'She ___ to school.', promptTranslated: 'Ӯ ба мактаб меравад.', options: ['go','gos','goes','going'], answer: 'goes', explanation: 'go → goes (-es).' },
      { type: 'fill_blank', prompt: 'My mother ___ TV. (watch)', promptTranslated: 'Модарам телевизор тамошо мекунад.', answer: 'watches', explanation: 'watch → watches.' },
      { type: 'fill_blank', prompt: 'He ___ tea. (like)', promptTranslated: 'Ӯ чойро дӯст медорад.', answer: 'likes', explanation: 'like → likes.' },
      { type: 'choose', prompt: 'Савол: ___ she like coffee?', promptTranslated: 'Оё ӯ қаҳваро дӯст медорад?', options: ['Do','Does','Is','Are'], answer: 'Does', explanation: 'Бо she → Does.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ӯ дар идора кор мекунад.', options: ['works','He','an','in','office'], answer: 'He works in an office.', explanation: 'He + works + in + an + office.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: She go to school.', promptTranslated: 'Шакли феъл ғалат.', answer: 'She goes to school.', explanation: 'Бо She → goes.' },
      { type: 'transform', prompt: 'Инкор кунед: He works on Sunday.', promptTranslated: 'Ба инкор гузаронед.', answer: 'He does not work on Sunday.', explanation: 'doesn’t + феъли асосӣ.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 11 ── Do / Does Questions ─────────────────────────────────────────────────
  {
    key: 'do-does',
    title: 'Do / Does Questions',
    titleTranslated: 'Саволҳо бо Do / Does',
    emoji: '🙋',
    explanation:
`Барои савол дар замони ҳозираи содда **Do / Does**-ро дар аввал мегузорем:

- **Do** + I/you/we/they + феъл? → **Do you like tea?**
- **Does** + he/she/it + феъл? → **Does she work?**

Пас аз Does феъл **бе -s** меояд. Ҷавоби кӯтоҳ: **Yes, I do. / No, she doesn’t.**`,
    rules: [
      { pattern: 'Do + you/we/they + феъл ?', note: 'Do you play?' },
      { pattern: 'Does + he/she/it + феъл ?', note: 'Does he play? (феъл бе s).' },
      { pattern: 'Ҷавоб: Yes, … do/does. / No, … don’t/doesn’t.', note: 'Ҷавоби кӯтоҳ.' },
    ],
    examples: [
      { sentence: 'Do you like coffee?', translation: 'Ту қаҳваро дӯст медорӣ?', highlight: 'Do' },
      { sentence: 'Does he work here?', translation: 'Ӯ ин ҷо кор мекунад?', highlight: 'Does' },
      { sentence: 'Do they speak English?', translation: 'Онҳо англисӣ гап мезананд?', highlight: 'Do' },
      { sentence: 'Does she live in Dushanbe?', translation: 'Ӯ дар Душанбе зиндагӣ мекунад?', highlight: 'Does' },
      { sentence: 'Yes, I do.', translation: 'Бале, мекунам.', highlight: 'do' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ you like tea?', promptTranslated: 'Ту чойро дӯст медорӣ?', options: ['Do','Does','Are','Is'], answer: 'Do', explanation: 'Бо you → Do.' },
      { type: 'choose', prompt: '___ he play football?', promptTranslated: 'Ӯ футбол бозӣ мекунад?', options: ['Do','Does','Is','Are'], answer: 'Does', explanation: 'Бо he → Does.' },
      { type: 'choose', prompt: 'Does she ___ here?', promptTranslated: 'Феъл пас аз Does.', options: ['works','work','working','worked'], answer: 'work', explanation: 'Пас аз Does феъл бе s.' },
      { type: 'fill_blank', prompt: '___ they speak Tajik?', promptTranslated: 'Онҳо тоҷикӣ гап мезананд?', answer: 'Do', explanation: 'Бо they → Do.' },
      { type: 'fill_blank', prompt: '___ it work?', promptTranslated: 'Он кор мекунад?', answer: 'Does', explanation: 'Бо it → Does.' },
      { type: 'reorder', prompt: 'Саволро сохт кунед:', promptTranslated: 'Ту қаҳваро дӯст медорӣ?', options: ['Do','like','you','coffee'], answer: 'Do you like coffee?', explanation: 'Do + you + like + coffee.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Does she works?', promptTranslated: 'Феъл нодуруст.', answer: 'Does she work?', explanation: 'Пас аз Does → work (бе s).' },
      { type: 'transform', prompt: 'Ба савол гузаронед: You like tea.', promptTranslated: 'Хабарӣ → саволӣ.', answer: 'Do you like tea?', explanation: 'Do-ро дар аввал гузоред.' },
    ],
    link: { moduleOrder: 4, lessonTitle: 'Grammar: Do / Does Questions', lessonTitleTranslated: 'Грамматика: Саволҳо бо Do / Does' },
  },

  // 12 ── Can / Can't ─────────────────────────────────────────────────────────
  {
    key: 'can',
    title: "Can / Can't",
    titleTranslated: 'Can / Can’t (тавонистан)',
    emoji: '💪',
    explanation:
`**Can** қобилият ё имкониятро нишон медиҳад (тавонистан).
Пас аз can феъл **бе to ва бе -s** меояд, барои ҳама фоилҳо як хел:

- I **can** swim. — Ман шино карда метавонам.
- She **can** dance. — Ӯ рақс карда метавонад.

Инкор: **cannot / can’t**. Савол: **Can you …?**`,
    rules: [
      { pattern: 'фоил + can + феъли асосӣ', note: 'I can read, she can read (бе s).' },
      { pattern: 'Инкор: can’t + феъл', note: 'I can’t swim.' },
      { pattern: 'Савол: Can + фоил + феъл ?', note: 'Can you help?' },
    ],
    examples: [
      { sentence: 'I can swim.', translation: 'Ман шино карда метавонам.', highlight: 'can' },
      { sentence: 'She can speak English.', translation: 'Ӯ англисӣ гап зада метавонад.', highlight: 'can' },
      { sentence: 'We can help you.', translation: 'Мо ба ту кӯмак карда метавонем.', highlight: 'can' },
      { sentence: "He can't drive.", translation: 'Ӯ ронандагӣ карда наметавонад.', highlight: "can't" },
      { sentence: 'Can you cook?', translation: 'Ту пухта метавонӣ?', highlight: 'Can' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ swim.', promptTranslated: 'Ман шино карда метавонам.', options: ['can','cans','am can','to can'], answer: 'can', explanation: 'can барои ҳама як хел.' },
      { type: 'choose', prompt: 'She can ___ English.', promptTranslated: 'Феъл пас аз can.', options: ['speaks','speak','speaking','to speak'], answer: 'speak', explanation: 'Пас аз can феъли асосӣ.' },
      { type: 'fill_blank', prompt: 'We ___ help you. (тавонистан)', promptTranslated: 'Мо кӯмак карда метавонем.', answer: 'can', explanation: 'can + help.' },
      { type: 'fill_blank', prompt: "He ___ drive. (наметавонад)", promptTranslated: 'Ӯ ронандагӣ карда наметавонад.', answer: "can't", explanation: 'Инкор → can’t.' },
      { type: 'choose', prompt: '___ you cook?', promptTranslated: 'Ту пухта метавонӣ?', options: ['Can','Do','Are','Is'], answer: 'Can', explanation: 'Савол бо Can.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ӯ рақс карда метавонад.', options: ['can','She','dance'], answer: 'She can dance.', explanation: 'She + can + dance.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: She can dances.', promptTranslated: 'Феъл пас аз can.', answer: 'She can dance.', explanation: 'Пас аз can → dance (бе s).' },
      { type: 'transform', prompt: 'Инкор кунед: I can swim.', promptTranslated: 'Ба инкор гузаронед.', answer: "I can't swim.", explanation: 'can → can’t.' },
    ],
    link: { moduleOrder: 4, lessonTitle: "Grammar: Can / Can't", lessonTitleTranslated: 'Грамматика: Can / Can’t' },
  },

  // 13 ── Some / Any ──────────────────────────────────────────────────────────
  {
    key: 'some-any',
    match: 'Countable, Uncountable, Some & Any',
    title: 'Some / Any',
    titleTranslated: 'Some / Any (каме / ягон)',
    emoji: '🍞',
    explanation:
`**Some** ва **Any** барои миқдори номуайян истифода мешаванд:

- **some** — дар ҷумлаи тасдиқӣ: I have **some** bread.
- **any** — дар савол ва инкор: Do you have **any** water? / I don’t have **any** money.

Бо исмҳои шумориданашаванда (water, bread) ва ҷамъ (apples) кор мекунанд.`,
    rules: [
      { pattern: 'Тасдиқ: some', note: 'I have some apples.' },
      { pattern: 'Савол / Инкор: any', note: 'Do you have any milk? / I don’t have any.' },
    ],
    examples: [
      { sentence: 'I have some bread.', translation: 'Ман каме нон дорам.', highlight: 'some' },
      { sentence: 'Do you have any water?', translation: 'Ту ягон об дорӣ?', highlight: 'any' },
      { sentence: "There isn't any milk.", translation: 'Ҳеҷ шир нест.', highlight: 'any' },
      { sentence: 'She buys some apples.', translation: 'Ӯ якчанд себ мехарад.', highlight: 'some' },
      { sentence: 'We need some rice.', translation: 'Мо каме биринҷ лозим дорем.', highlight: 'some' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have ___ bread.', promptTranslated: 'Тасдиқӣ.', options: ['some','any','a','an'], answer: 'some', explanation: 'Тасдиқ → some.' },
      { type: 'choose', prompt: 'Do you have ___ water?', promptTranslated: 'Саволӣ.', options: ['some','any','a','the'], answer: 'any', explanation: 'Савол → any.' },
      { type: 'choose', prompt: "There isn't ___ milk.", promptTranslated: 'Инкорӣ.', options: ['some','any','a','an'], answer: 'any', explanation: 'Инкор → any.' },
      { type: 'fill_blank', prompt: 'She buys ___ apples. (тасдиқ)', promptTranslated: 'Ӯ якчанд себ мехарад.', answer: 'some', explanation: 'Тасдиқ → some.' },
      { type: 'fill_blank', prompt: 'Is there ___ tea? (савол)', promptTranslated: 'Ягон чой ҳаст?', answer: 'any', explanation: 'Савол → any.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ман каме нон дорам.', options: ['some','I','bread','have'], answer: 'I have some bread.', explanation: 'I + have + some + bread.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I don’t have some money.', promptTranslated: 'Инкор → any.', answer: "I don't have any money.", explanation: 'Дар инкор → any.' },
      { type: 'transform', prompt: 'Ба савол гузаронед: You have some sugar.', promptTranslated: 'Тасдиқ → савол.', answer: 'Do you have any sugar?', explanation: 'Дар савол → any.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 14 ── How Much / How Many ────────────────────────────────────────────────
  {
    key: 'how-much-many',
    title: 'How Much / How Many',
    titleTranslated: 'How much / How many (чӣ қадар / чанд то)',
    emoji: '🧮',
    explanation:
`Барои пурсидани миқдор:

- **How many** + исми ҷамъ (шумурдашаванда): How many **apples**?
- **How much** + исми шумориданашаванда: How much **water**? / How much is it? (нарх)

Намуна: **How much is this shirt?** — Ин курта чанд пул аст?`,
    rules: [
      { pattern: 'How many + исми ҷамъ ?', note: 'How many books?' },
      { pattern: 'How much + исми шумориданашаванда ?', note: 'How much milk?' },
      { pattern: 'How much is …? = нарх', note: 'How much is it?' },
    ],
    examples: [
      { sentence: 'How many books do you have?', translation: 'Ту чанд китоб дорӣ?', highlight: 'How many' },
      { sentence: 'How much water is there?', translation: 'Чӣ қадар об ҳаст?', highlight: 'How much' },
      { sentence: 'How much is this shirt?', translation: 'Ин курта чанд пул аст?', highlight: 'How much' },
      { sentence: 'How many people are here?', translation: 'Ин ҷо чанд нафар ҳаст?', highlight: 'How many' },
      { sentence: 'How much rice do we need?', translation: 'Мо чӣ қадар биринҷ лозим дорем?', highlight: 'How much' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ apples do you have?', promptTranslated: 'apples — ҷамъ.', options: ['How much','How many','How','What'], answer: 'How many', explanation: 'Ҷамъ → how many.' },
      { type: 'choose', prompt: '___ water is there?', promptTranslated: 'water — шумориданашаванда.', options: ['How many','How much','How','Who'], answer: 'How much', explanation: 'Шумориданашаванда → how much.' },
      { type: 'choose', prompt: '___ is this hat? — Ten somoni.', promptTranslated: 'Нарх.', options: ['How many','How much','What','Where'], answer: 'How much', explanation: 'Нарх → how much.' },
      { type: 'fill_blank', prompt: 'How ___ students are in the class?', promptTranslated: 'students — ҷамъ.', answer: 'many', explanation: 'Ҷамъ → many.' },
      { type: 'fill_blank', prompt: 'How ___ sugar do you want?', promptTranslated: 'sugar — шумориданашаванда.', answer: 'much', explanation: 'Шумориданашаванда → much.' },
      { type: 'reorder', prompt: 'Саволро сохт кунед:', promptTranslated: 'Ту чанд китоб дорӣ?', options: ['many','How','books','do','you','have'], answer: 'How many books do you have?', explanation: 'How many + books + do you have.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: How much apples?', promptTranslated: 'apples ҷамъ аст.', answer: 'How many apples?', explanation: 'Ҷамъ → how many.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: How many milk?', promptTranslated: 'milk шумориданашаванда.', answer: 'How much milk?', explanation: 'Шумориданашаванда → how much.' },
    ],
    link: { moduleOrder: 7, lessonTitle: 'Grammar: How Much / How Many', lessonTitleTranslated: 'Грамматика: How much / How many' },
  },

  // 15 ── There Is / There Are ───────────────────────────────────────────────
  {
    key: 'there-is-are',
    match: 'There Is / There Are',
    title: 'There Is / There Are',
    titleTranslated: 'There is / There are (ҳаст / вуҷуд дорад)',
    emoji: '📍',
    explanation:
`Барои нишон додани мавҷудияти чизе дар ҷое:

- **There is** + исми танҳо: There **is** a bed in my room.
- **There are** + исми ҷамъ: There **are** two chairs.

Инкор: **There isn’t / There aren’t**. Савол: **Is there …? / Are there …?**`,
    rules: [
      { pattern: 'There is + исми танҳо', note: 'There is a book.' },
      { pattern: 'There are + исми ҷамъ', note: 'There are three books.' },
      { pattern: 'Савол: Is/Are there …?', note: 'Is there a bank near here?' },
    ],
    examples: [
      { sentence: 'There is a bed in my room.', translation: 'Дар ҳуҷраи ман як бистар ҳаст.', highlight: 'There is' },
      { sentence: 'There are two chairs.', translation: 'Ду курсӣ ҳаст.', highlight: 'There are' },
      { sentence: "There isn't a TV here.", translation: 'Ин ҷо телевизор нест.', highlight: "There isn't" },
      { sentence: 'Are there any shops?', translation: 'Ягон мағоза ҳаст?', highlight: 'Are there' },
      { sentence: 'There is a park near my house.', translation: 'Наздики хонаам боғ ҳаст.', highlight: 'There is' },
    ],
    exercises: [
      { type: 'choose', prompt: 'There ___ a book on the table.', promptTranslated: 'book — танҳо.', options: ['is','are','am','be'], answer: 'is', explanation: 'Танҳо → there is.' },
      { type: 'choose', prompt: 'There ___ three windows.', promptTranslated: 'windows — ҷамъ.', options: ['is','are','am','be'], answer: 'are', explanation: 'Ҷамъ → there are.' },
      { type: 'fill_blank', prompt: 'There ___ a cat in the garden.', promptTranslated: 'cat — танҳо.', answer: 'is', explanation: 'Танҳо → is.' },
      { type: 'fill_blank', prompt: 'There ___ two beds in the room.', promptTranslated: 'beds — ҷамъ.', answer: 'are', explanation: 'Ҷамъ → are.' },
      { type: 'choose', prompt: '___ there a bank near here?', promptTranslated: 'Савол, bank танҳо.', options: ['Is','Are','Do','Am'], answer: 'Is', explanation: 'Танҳо → Is there.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ду курсӣ ҳаст.', options: ['are','There','two','chairs'], answer: 'There are two chairs.', explanation: 'There are + two + chairs.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: There are a book.', promptTranslated: 'book танҳо аст.', answer: 'There is a book.', explanation: 'Танҳо → there is.' },
      { type: 'transform', prompt: 'Инкор кунед: There is a TV.', promptTranslated: 'Ба инкор гузаронед.', answer: "There isn't a TV.", explanation: 'is → isn’t.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 16 ── This / That / These / Those ────────────────────────────────────────
  {
    key: 'this-that',
    match: 'This, That, These, Those & How Much/Many',
    title: 'This / That / These / Those',
    titleTranslated: 'This / That / These / Those (ин / он)',
    emoji: '👉',
    explanation:
`Ин калимаҳо ба чиз ишора мекунанд:

- **this** — ин (наздик, танҳо): This is my book.
- **that** — он (дур, танҳо): That is a car.
- **these** — инҳо (наздик, ҷамъ): These are my shoes.
- **those** — онҳо (дур, ҷамъ): Those are birds.`,
    rules: [
      { pattern: 'this (наздик, танҳо) / these (наздик, ҷамъ)', note: 'this book → these books.' },
      { pattern: 'that (дур, танҳо) / those (дур, ҷамъ)', note: 'that car → those cars.' },
    ],
    examples: [
      { sentence: 'This is my book.', translation: 'Ин китоби ман аст.', highlight: 'This' },
      { sentence: 'That is a big house.', translation: 'Он хонаи калон аст.', highlight: 'That' },
      { sentence: 'These shoes are nice.', translation: 'Ин пойафзолҳо хубанд.', highlight: 'These' },
      { sentence: 'Those birds are small.', translation: 'Он паррандаҳо хурданд.', highlight: 'Those' },
      { sentence: 'This apple is red.', translation: 'Ин себ сурх аст.', highlight: 'This' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is my pen. (наздик, танҳо)', promptTranslated: 'Ин қалами ман аст.', options: ['This','That','These','Those'], answer: 'This', explanation: 'Наздик + танҳо → this.' },
      { type: 'choose', prompt: '___ are my friends. (наздик, ҷамъ)', promptTranslated: 'Инҳо дӯстони мананд.', options: ['This','That','These','Those'], answer: 'These', explanation: 'Наздик + ҷамъ → these.' },
      { type: 'choose', prompt: '___ is a car over there. (дур)', promptTranslated: 'Он мошин аст.', options: ['This','These','That','Those'], answer: 'That', explanation: 'Дур + танҳо → that.' },
      { type: 'fill_blank', prompt: '___ books over there are old. (дур, ҷамъ)', promptTranslated: 'Он китобҳо куҳнаанд.', answer: 'Those', explanation: 'Дур + ҷамъ → those.' },
      { type: 'fill_blank', prompt: '___ shoes here are new. (наздик, ҷамъ)', promptTranslated: 'Ин пойафзолҳо наванд.', answer: 'These', explanation: 'Наздик + ҷамъ → these.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ин китоби ман аст.', options: ['is','This','book','my'], answer: 'This is my book.', explanation: 'This + is + my + book.' },
      { type: 'transform', prompt: 'Ба ҷамъ гузаронед: This is a shoe.', promptTranslated: 'Танҳо → ҷамъ.', answer: 'These are shoes.', explanation: 'this → these, is → are.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: These is my pen.', promptTranslated: 'Шакл ғалат.', answer: 'This is my pen.', explanation: 'Танҳо → this is.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 17 ── Prepositions Of Place ──────────────────────────────────────────────
  {
    key: 'prepositions-place',
    title: 'Prepositions Of Place',
    titleTranslated: 'Пешояндҳои ҷой',
    emoji: '🧭',
    explanation:
`Пешояндҳои ҷой нишон медиҳанд, ки чиз дар куҷост:

- **in** — дар дохили: in the box
- **on** — болои: on the table
- **under** — зери: under the bed
- **next to** — паҳлӯи: next to the door
- **behind** — пушти / **in front of** — пеши

Намуна: **The cat is under the table.**`,
    rules: [
      { pattern: 'in = дохил, on = боло, under = зер', note: 'Се пешоянди асосӣ.' },
      { pattern: 'next to = паҳлӯ, behind = пушт, in front of = пеш', note: 'Ҷойҳои нисбӣ.' },
    ],
    examples: [
      { sentence: 'The book is on the table.', translation: 'Китоб болои миз аст.', highlight: 'on' },
      { sentence: 'The cat is under the bed.', translation: 'Гурба зери кат аст.', highlight: 'under' },
      { sentence: 'The keys are in the bag.', translation: 'Калидҳо дар халта ҳастанд.', highlight: 'in' },
      { sentence: 'The shop is next to the bank.', translation: 'Мағоза паҳлӯи бонк аст.', highlight: 'next to' },
      { sentence: 'The car is in front of the house.', translation: 'Мошин пеши хона аст.', highlight: 'in front of' },
    ],
    exercises: [
      { type: 'choose', prompt: 'The book is ___ the table.', promptTranslated: 'болои миз.', options: ['on','in','under','behind'], answer: 'on', explanation: 'боло → on.' },
      { type: 'choose', prompt: 'The cat is ___ the bed.', promptTranslated: 'зери кат.', options: ['on','in','under','next to'], answer: 'under', explanation: 'зер → under.' },
      { type: 'choose', prompt: 'The keys are ___ the bag.', promptTranslated: 'дохили халта.', options: ['on','in','under','behind'], answer: 'in', explanation: 'дохил → in.' },
      { type: 'fill_blank', prompt: 'The shop is ___ to the bank. (паҳлӯ)', promptTranslated: 'паҳлӯи бонк.', answer: 'next', explanation: 'паҳлӯ → next to.' },
      { type: 'fill_blank', prompt: 'The pen is ___ the box. (дохил)', promptTranslated: 'дохили қуттӣ.', answer: 'in', explanation: 'дохил → in.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Гурба зери миз аст.', options: ['is','The','cat','under','table','the'], answer: 'The cat is under the table.', explanation: 'The cat + is + under + the table.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: The book is in the table.', promptTranslated: 'Пешоянд ғалат.', answer: 'The book is on the table.', explanation: 'болои сатҳ → on.' },
      { type: 'choose', prompt: 'Мувофиқ кунед: "зери" = ?', promptTranslated: 'Тарҷума.', options: ['under','on','in','behind'], answer: 'under', explanation: 'зери → under.' },
    ],
    link: { moduleOrder: 6, lessonTitle: 'Grammar: Prepositions Of Place', lessonTitleTranslated: 'Грамматика: Пешояндҳои ҷой' },
  },

  // 18 ── Imperatives (Giving Directions) ────────────────────────────────────
  {
    key: 'imperatives',
    match: 'Where Is...? & Giving Directions',
    title: 'Imperatives (Giving Directions)',
    titleTranslated: 'Феъли амрӣ (нишон додани роҳ)',
    emoji: '➡️',
    explanation:
`Феъли амрӣ барои фармон ё нишон додани роҳ истифода мешавад — бо феъли асосӣ оғоз меёбад (бе фоил):

- **Go** straight. — Рост рав.
- **Turn** left / right. — Ба чап / рост гард.
- **Stop** here. — Ин ҷо ист.

Инкор: **Don’t** + феъл → **Don’t go!** (Нарав!).`,
    rules: [
      { pattern: 'Феъли асосӣ дар аввал (бе фоил)', note: 'Go! Stop! Turn left!' },
      { pattern: 'Инкор: Don’t + феъл', note: "Don't run!" },
      { pattern: 'Where is …? = пурсидани ҷой', note: 'Where is the bank?' },
    ],
    examples: [
      { sentence: 'Go straight.', translation: 'Рост рав.', highlight: 'Go' },
      { sentence: 'Turn left at the corner.', translation: 'Дар гӯша ба чап гард.', highlight: 'Turn' },
      { sentence: 'Where is the hospital?', translation: 'Беморхона дар куҷост?', highlight: 'Where is' },
      { sentence: "Don't turn right.", translation: 'Ба рост нагард.', highlight: "Don't" },
      { sentence: 'Stop here, please.', translation: 'Лутфан ин ҷо ист.', highlight: 'Stop' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ straight, then turn left.', promptTranslated: 'Рост рав.', options: ['Go','You go','Going','To go'], answer: 'Go', explanation: 'Амрӣ бо феъли асосӣ.' },
      { type: 'choose', prompt: '___ left at the bank.', promptTranslated: 'Ба чап гард.', options: ['Turn','Turns','Turning','You turn'], answer: 'Turn', explanation: 'Амрӣ → Turn.' },
      { type: 'fill_blank', prompt: '___ here, please. (ист)', promptTranslated: 'Ин ҷо ист.', answer: 'Stop', explanation: 'Амрӣ → Stop.' },
      { type: 'fill_blank', prompt: '___ is the bank? (куҷо)', promptTranslated: 'Бонк дар куҷост?', answer: 'Where', explanation: 'Пурсиши ҷой → Where.' },
      { type: 'choose', prompt: 'Инкор: ___ run!', promptTranslated: 'Надав!', options: ["Don't",'No','Not','Never'], answer: "Don't", explanation: 'Инкори амрӣ → Don’t.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Дар гӯша ба чап гард.', options: ['Turn','the','left','at','corner'], answer: 'Turn left at the corner.', explanation: 'Turn + left + at + the corner.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: You go straight.', promptTranslated: 'Амрӣ бе фоил.', answer: 'Go straight.', explanation: 'Фоилро гиред.' },
      { type: 'transform', prompt: 'Инкор кунед: Turn right.', promptTranslated: 'Ба инкор гузаронед.', answer: "Don't turn right.", explanation: "Don't + феъл." },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // 19 ── Present Continuous ─────────────────────────────────────────────────
  {
    key: 'present-continuous',
    match: 'Clothes And Colors',
    title: 'Present Continuous (am / is / are + -ing)',
    titleTranslated: 'Замони ҳозираи давомдор (am/is/are + -ing)',
    emoji: '🏃',
    explanation:
`Замони ҳозираи давомдор амали ҳозиразамон (ҳоло рухдиҳанда)-ро ифода мекунад:
**to be (am/is/are) + феъл + -ing**

- I **am wearing** a red shirt. — Ман куртаи сурх пӯшидаам.
- She **is reading**. — Ӯ хонда истодааст.
- They **are playing**. — Онҳо бозӣ карда истодаанд.`,
    rules: [
      { pattern: 'am/is/are + феъл + ing', note: 'I am working, she is working.' },
      { pattern: 'wearing = пӯшида истода', note: 'I am wearing a hat.' },
      { pattern: 'Савол: Is/Are + фоил + …ing ?', note: 'Are you working?' },
    ],
    examples: [
      { sentence: 'I am wearing a blue shirt.', translation: 'Ман куртаи кабуд пӯшидаам.', highlight: 'am wearing' },
      { sentence: 'She is wearing a red dress.', translation: 'Ӯ куртаи сурх пӯшидааст.', highlight: 'is wearing' },
      { sentence: 'They are playing football.', translation: 'Онҳо футбол бозӣ карда истодаанд.', highlight: 'are playing' },
      { sentence: 'He is reading a book.', translation: 'Ӯ китоб хонда истодааст.', highlight: 'is reading' },
      { sentence: 'We are eating now.', translation: 'Мо ҳозир хӯрок хӯрда истодаем.', highlight: 'are eating' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ a hat.', promptTranslated: 'Ман кулоҳ пӯшидаам.', options: ['am wearing','is wearing','are wearing','wear'], answer: 'am wearing', explanation: 'Бо I → am + -ing.' },
      { type: 'choose', prompt: 'She ___ a book.', promptTranslated: 'Ӯ китоб хонда истодааст.', options: ['am reading','is reading','are reading','read'], answer: 'is reading', explanation: 'Бо She → is + -ing.' },
      { type: 'choose', prompt: 'They ___ football.', promptTranslated: 'Онҳо бозӣ карда истодаанд.', options: ['is playing','am playing','are playing','plays'], answer: 'are playing', explanation: 'Бо They → are + -ing.' },
      { type: 'fill_blank', prompt: 'He is ___ a blue coat. (wear)', promptTranslated: 'Ӯ пальтои кабуд пӯшидааст.', answer: 'wearing', explanation: 'wear → wearing.' },
      { type: 'fill_blank', prompt: 'We ___ eating now. (am/is/are)', promptTranslated: 'Мо ҳозир хӯрок хӯрда истодаем.', answer: 'are', explanation: 'Бо We → are.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Ӯ куртаи сурх пӯшидааст.', options: ['is','She','a','wearing','dress','red'], answer: 'She is wearing a red dress.', explanation: 'She + is wearing + a red dress.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: She wearing a hat.', promptTranslated: 'to be намерасад.', answer: 'She is wearing a hat.', explanation: 'is илова кунед.' },
      { type: 'transform', prompt: 'Ба савол гузаронед: You are working.', promptTranslated: 'Хабарӣ → саволӣ.', answer: 'Are you working?', explanation: 'are-ро дар аввал гузоред.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },

  // ── Supplementary existing topics (fill so none stays empty) ───────────────
  {
    key: 'introducing-yourself',
    match: 'Introducing Yourself',
    title: 'Introducing Yourself',
    titleTranslated: 'Муаррифии худ',
    emoji: '🙋‍♂️',
    explanation:
`Барои муаррифии худ ду роҳи асосӣ ҳаст:
1. **My name is …** — Номи ман … аст
2. **I am …** — Ман … ҳастам

Намуна: **Hello, I am Ali. My name is Ali.**`,
    rules: [
      { pattern: 'My name is + ном', note: 'My name is Sara.' },
      { pattern: 'I am + ном', note: 'I am Sara.' },
    ],
    examples: [
      { sentence: 'My name is Ali.', translation: 'Номи ман Алӣ аст.', highlight: 'My name is' },
      { sentence: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'I am' },
      { sentence: 'I am from Tajikistan.', translation: 'Ман аз Тоҷикистон ҳастам.', highlight: 'I am' },
      { sentence: 'Nice to meet you.', translation: 'Аз шиносоӣ шодам.', highlight: 'Nice' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ name is Sara.', promptTranslated: 'Номи ман Сара аст.', options: ['My','I','Me','Mine'], answer: 'My', explanation: 'My name is …' },
      { type: 'choose', prompt: 'I ___ a teacher.', promptTranslated: 'Ман муаллим ҳастам.', options: ['am','is','are','be'], answer: 'am', explanation: 'Бо I → am.' },
      { type: 'fill_blank', prompt: 'My ___ is Karim.', promptTranslated: 'Номи ман Карим аст.', answer: 'name', explanation: 'My name is …' },
      { type: 'fill_blank', prompt: 'I am ___ Dushanbe.', promptTranslated: 'Ман аз Душанбе ҳастам.', answer: 'from', explanation: 'I am from + ҷой.' },
      { type: 'reorder', prompt: 'Ҷумларо сохт кунед:', promptTranslated: 'Номи ман Алӣ аст.', options: ['name','My','Ali','is'], answer: 'My name is Ali.', explanation: 'My + name + is + Ali.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: I name is Ali.', promptTranslated: 'Шакл ғалат.', answer: 'My name is Ali.', explanation: 'My name is …' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },
  {
    key: 'asking-names',
    match: 'Asking Names',
    title: 'Asking Names',
    titleTranslated: 'Пурсидани ном',
    emoji: '❔',
    explanation:
`Барои пурсидани номи каси дигар:
**What is your name?** — Номи ту чист?
Ҷавоб: **My name is …** ё **I am …**`,
    rules: [
      { pattern: 'What is your name?', note: 'Пурсидани ном.' },
      { pattern: 'Ҷавоб: My name is … / I am …', note: 'Ду роҳи ҷавоб.' },
    ],
    examples: [
      { sentence: 'What is your name?', translation: 'Номи ту чист?', highlight: 'What' },
      { sentence: 'My name is Sara.', translation: 'Номи ман Сара аст.', highlight: 'My name is' },
      { sentence: "What's his name?", translation: 'Номи ӯ чист?', highlight: "What's" },
      { sentence: 'Her name is Anna.', translation: 'Номи ӯ Анна аст.', highlight: 'Her name' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is your name?', promptTranslated: 'Номи ту чист?', options: ['What','Where','Who','How'], answer: 'What', explanation: 'Барои ном → What.' },
      { type: 'choose', prompt: 'Ҷавоб: ___ name is Ali.', promptTranslated: 'Номи ман Алӣ аст.', options: ['My','I','Your','He'], answer: 'My', explanation: 'My name is …' },
      { type: 'fill_blank', prompt: 'What is ___ name? (аз они ту)', promptTranslated: 'Номи ту чист?', answer: 'your', explanation: 'your name.' },
      { type: 'fill_blank', prompt: '___ is your name? — Sara.', promptTranslated: 'Калимаи саволӣ.', answer: 'What', explanation: 'Барои ном → What.' },
      { type: 'reorder', prompt: 'Саволро сохт кунед:', promptTranslated: 'Номи ту чист?', options: ['is','What','name','your'], answer: 'What is your name?', explanation: 'What + is + your + name.' },
      { type: 'transform', prompt: 'Ислоҳ кунед: Who is your name?', promptTranslated: 'Калимаи саволӣ ғалат.', answer: 'What is your name?', explanation: 'Барои ном → What.' },
    ],
    link: { reuseExistingLessonForMatch: true },
  },
];
