// Мазмуни Модули 3-и олмонӣ (A1) — «Zahlen und Alter».
//
// Грамматикаи ин модул маҳз он ҷоест, ки хонандаи тоҷик бештар хато мекунад:
// дар олмонӣ рақами дуҷоя БАРЪАКС хонда мешавад (21 = einundzwanzig =
// «як-ва-бист»), ва синну сол бо феъли `sein` гуфта мешавад, на «доштан».
//
// Танҳо МАЪЛУМОТ — мантиқ дар `_de-module-build.mjs`.
// `correctIndex: 0` дар ҳама ҷо — билд ҷои ҷавобро худаш паҳн мекунад.

export const MODULE = {
  order: 2,
  title: 'Zahlen und Alter',
  titleTranslated: 'Рақамҳо ва синну сол',
  emoji: '🔢',
};

export const VOCAB = [
  {
    title: 'Zahlen 0–5', titleTranslated: 'Рақамҳо 0–5', emoji: '🔢',
    words: [
      { word: 'null', translation: 'сифр', emoji: '0️⃣', ipa: '/nʊl/',
        example: 'Meine Nummer beginnt mit null.', exampleTrans: 'Рақами ман бо сифр сар мешавад.' },
      { word: 'eins', existing: true },
      { word: 'zwei', existing: true },
      { word: 'drei', existing: true },
      { word: 'vier', existing: true },
      { word: 'fünf', existing: true },
    ],
  },
  {
    title: 'Zahlen 6–10', titleTranslated: 'Рақамҳо 6–10', emoji: '🖐️',
    words: [
      { word: 'sechs', existing: true },
      { word: 'sieben', existing: true },
      { word: 'acht', existing: true },
      { word: 'neun', existing: true },
      { word: 'zehn', existing: true },
    ],
  },
  {
    title: 'Zahlen 11–20', titleTranslated: 'Рақамҳо 11–20', emoji: '🔟',
    words: [
      { word: 'elf', existing: true },
      { word: 'zwölf', existing: true },
      { word: 'dreizehn', translation: 'сездаҳ', emoji: '1️⃣3️⃣', ipa: '/ˈdʁaɪ̯t͡seːn/',
        example: 'Mein Bruder ist dreizehn Jahre alt.', exampleTrans: 'Бародарам сездаҳсола аст.' },
      { word: 'vierzehn', translation: 'чордаҳ', emoji: '1️⃣4️⃣', ipa: '/ˈfɪʁt͡seːn/',
        example: 'Sie ist vierzehn Jahre alt.', exampleTrans: 'Ӯ чордаҳсола аст.' },
      { word: 'fünfzehn', translation: 'понздаҳ', emoji: '1️⃣5️⃣', ipa: '/ˈfʏnft͡seːn/',
        example: 'Der Bus kommt um fünfzehn Uhr.', exampleTrans: 'Автобус соати понздаҳ меояд.' },
      { word: 'zwanzig', existing: true },
    ],
  },
  {
    title: 'Die Zehner', titleTranslated: 'Даҳиҳо', emoji: '🔢',
    words: [
      { word: 'dreißig', existing: true },
      { word: 'vierzig', existing: true },
      { word: 'fünfzig', existing: true },
      { word: 'sechzig', existing: true },
      { word: 'siebzig', existing: true },
      { word: 'achtzig', existing: true },
      { word: 'neunzig', translation: 'навад', emoji: '9️⃣', ipa: '/ˈnɔʏ̯nt͡sɪç/',
        example: 'Mein Großvater ist neunzig Jahre alt.', exampleTrans: 'Бобоям навадсола аст.' },
    ],
  },
  {
    title: 'Große Zahlen', titleTranslated: 'Рақамҳои калон', emoji: '💯',
    words: [
      { word: 'hundert', existing: true },
      { word: 'tausend', translation: 'ҳазор', emoji: '🔢', ipa: '/ˈtaʊ̯zənt/',
        example: 'Das Auto kostet tausend Euro.', exampleTrans: 'Мошин ҳазор евро меарзад.' },
      { word: 'die Zahl', translation: 'адад', emoji: '🔣', ipa: '/diː t͡saːl/',
        example: 'Schreib die Zahl an die Tafel.', exampleTrans: 'Ададро ба тахта навис.' },
      { word: 'die Nummer', translation: 'рақам', emoji: '#️⃣', ipa: '/diː ˈnʊmɐ/',
        example: 'Wie ist deine Nummer?', exampleTrans: 'Рақами ту чанд аст?' },
    ],
  },
  {
    title: 'Wie alt bist du?', titleTranslated: 'Чандсола ҳастӣ?', emoji: '🎂',
    words: [
      { word: 'das Alter', translation: 'синну сол', emoji: '📅', ipa: '/das ˈaltɐ/',
        example: 'Sein Alter ist zwanzig.', exampleTrans: 'Синни ӯ бист аст.' },
      { word: 'das Jahr', translation: 'сол', emoji: '🗓️', ipa: '/das jaːɐ̯/',
        example: 'Ein Jahr hat zwölf Monate.', exampleTrans: 'Як сол дувоздаҳ моҳ дорад.' },
      { word: 'der Geburtstag', translation: 'зодрӯз', emoji: '🎂', ipa: '/deːɐ̯ ɡəˈbuːɐ̯t͡staːk/',
        example: 'Heute ist mein Geburtstag.', exampleTrans: 'Имрӯз зодрӯзи ман аст.' },
      { word: 'geboren', translation: 'таваллудшуда', emoji: '👶', ipa: '/ɡəˈboːʁən/',
        example: 'Ich bin in Duschanbe geboren.', exampleTrans: 'Ман дар Душанбе таваллуд шудаам.' },
      { word: 'Wie alt bist du', translation: 'Чандсола ҳастӣ?', emoji: '❓', ipa: '/viː alt bɪst duː/',
        example: 'Hallo! Wie alt bist du?', exampleTrans: 'Салом! Чандсола ҳастӣ?' },
    ],
  },
  {
    title: 'Zahlen im Alltag', titleTranslated: 'Рақамҳо дар ҳаёт', emoji: '📱',
    words: [
      { word: 'die Uhr', translation: 'соат', emoji: '🕐', ipa: '/diː uːɐ̯/',
        example: 'Die Uhr zeigt acht.', exampleTrans: 'Соат ҳаштро нишон медиҳад.' },
      { word: 'das Telefon', translation: 'телефон', emoji: '📞', ipa: '/das ˈteːləfoːn/',
        example: 'Das Telefon ist neu.', exampleTrans: 'Телефон нав аст.' },
      { word: 'die Telefonnummer', translation: 'рақами телефон', emoji: '📱', ipa: '/diː teləˈfoːnnʊmɐ/',
        example: 'Wie ist deine Telefonnummer?', exampleTrans: 'Рақами телефони ту чанд аст?' },
      { word: 'die Adresse', translation: 'суроға', emoji: '🏠', ipa: '/diː aˈdʁɛsə/',
        example: 'Meine Adresse ist einfach.', exampleTrans: 'Суроғаи ман содда аст.' },
      { word: 'die Hausnummer', translation: 'рақами хона', emoji: '🚪', ipa: '/diː ˈhaʊ̯snʊmɐ/',
        example: 'Meine Hausnummer ist zwölf.', exampleTrans: 'Рақами хонаи ман дувоздаҳ аст.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Zahlen ab 21', lessonTitleTranslated: 'Грамматика: рақамҳо аз 21',
    title: 'Zahlen ab 21: einundzwanzig', titleTranslated: 'Рақамҳо аз 21: тартиби баръакс',
    emoji: '🔢',
    explanation:
`Дар олмонӣ рақами дуҷоя аз 21 сар карда **баръакс** хонда мешавад: аввал ЯКҲО, баъд ДАҲҲО.

- 21 = **einundzwanzig** = «як-ва-бист»
- 34 = **vierunddreißig** = «чор-ва-си»
- 67 = **siebenundsechzig** = «ҳафт-ва-шаст»

Формула: **якҳо + und + даҳҳо**, ва ҳама ЯКҶОЯ, бе фосила навишта мешавад.

Дар тоҷикӣ мо мегӯем «бисту як» — аввал бист, баъд як. Дар олмонӣ комилан баръакс. Маҳз ҳамин ҷо навомӯз бештар хато мекунад: рақами аввалро мешунавад ва онро даҳҳо мегирад.

**Диққат:** дар 21, 31, 41… «eins» бандаки «-s»-ро гум мекунад: **ein**undzwanzig, на «einsundzwanzig».

Аз сад боло ҳамин қоида давом мекунад: 101 = **hunderteins**, 234 = **zweihundertvierunddreißig**.`,
    rules: [
      { pattern: 'якҳо + und + даҳҳо', note: '21 = einundzwanzig (як-ва-бист), 45 = fünfundvierzig.' },
      { pattern: 'Ҳама якҷоя навишта мешавад', note: 'vierunddreißig — як калима, бе фосила ва бе дефис.' },
      { pattern: 'eins → ein', note: '21 = einundzwanzig, на «einsundzwanzig». Танҳо дар ин ҳолат «-s» меафтад.' },
      { pattern: 'Аз сад боло', note: '101 = hunderteins, 234 = zweihundertvierunddreißig.' },
    ],
    examples: [
      { sentence: 'Ich bin einundzwanzig Jahre alt.', translation: 'Ман бисту яксола ҳастам.', highlight: 'einundzwanzig' },
      { sentence: 'Meine Mutter ist neunundvierzig.', translation: 'Модарам чилу нӯҳсола аст.', highlight: 'neunundvierzig' },
      { sentence: 'Das Buch kostet siebenundzwanzig Euro.', translation: 'Китоб бисту ҳафт евро меарзад.', highlight: 'siebenundzwanzig' },
      { sentence: 'Er ist sechsundsechzig Jahre alt.', translation: 'Ӯ шасту шашсола аст.', highlight: 'sechsundsechzig' },
      { sentence: 'Die Schule hat dreihundert Schüler.', translation: 'Мактаб сесад талаба дорад.', highlight: 'dreihundert' },
      { sentence: 'Meine Hausnummer ist zweiunddreißig.', translation: 'Рақами хонаи ман сию ду аст.', highlight: 'zweiunddreißig' },
    ],
    exercises: [
      { prompt: '21 = ___', promptTranslated: 'Бисту як.', answer: 'einundzwanzig', options: ['einundzwanzig', 'einsundzwanzig', 'zwanzigundeins', 'zwanzigeins'], explanation: 'Аввал якҳо, баъд даҳҳо; «eins» бандаки -s-ро гум мекунад.' },
      { prompt: '34 = ___', promptTranslated: 'Сию чор.', answer: 'vierunddreißig', options: ['vierunddreißig', 'dreiundvierzig', 'dreißigvier', 'vierzigdrei'], explanation: '4 + und + 30 = vierunddreißig.' },
      { prompt: 'einundzwanzig = ___', promptTranslated: 'Ин рақам чанд аст?', answer: '21', options: ['21', '12', '20', '31'], explanation: 'ein (1) + und + zwanzig (20) = 21.' },
      { prompt: '45 = ___', promptTranslated: 'Чилу панҷ.', answer: 'fünfundvierzig', options: ['fünfundvierzig', 'vierundfünfzig', 'vierzigfünf', 'fünfzigvier'], explanation: '5 + und + 40.' },
      { prompt: 'zweiundvierzig = ___', promptTranslated: 'Ин рақам чанд аст?', answer: '42', options: ['42', '24', '22', '44'], explanation: 'zwei (2) + und + vierzig (40) = 42.' },
      { prompt: '67 = ___', promptTranslated: 'Шасту ҳафт.', answer: 'siebenundsechzig', options: ['siebenundsechzig', 'sechsundsiebzig', 'sechzigsieben', 'siebzigsechs'], explanation: '7 + und + 60.' },
      { prompt: '101 = ___', promptTranslated: 'Саду як.', answer: 'hunderteins', options: ['hunderteins', 'einshundert', 'hundertund eins', 'einhundert'], explanation: 'Баъди «hundert» рақами хурд меояд.' },
      { prompt: 'Ich bin ___ Jahre alt. (33)', promptTranslated: 'Ман сию сесола ҳастам.', answer: 'dreiunddreißig', options: ['dreiunddreißig', 'dreißigdrei', 'dreiunddreizehn', 'dreizehndrei'], explanation: '3 + und + 30 = dreiunddreißig.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Fragen mit Zahlen', lessonTitleTranslated: 'Грамматика: саволҳо бо рақам',
    title: 'Wie alt? Wie viele? Wie viel kostet?', titleTranslated: 'Wie alt? Wie viele? Wie viel kostet?',
    emoji: '❓',
    explanation:
`Се саволи асосии рақамӣ:

- **Wie alt bist du?** — Чандсола ҳастӣ? → **Ich bin zwanzig Jahre alt.**
- **Wie viele Brüder hast du?** — Чанд бародар дорӣ? → **Ich habe zwei Brüder.**
- **Wie viel kostet das?** — Ин чанд меарзад? → **Das kostet zehn Euro.**

**Хатои маъмултарин:** дар олмонӣ синну сол бо феъли **sein** гуфта мешавад, на бо «доштан».

Ich **bin** 20 Jahre alt. (айнан: «ман 20-сола ҲАСТАМ»)

Дар тоҷикӣ мо мегӯем «ман 20 сол дорам» — агар инро мустақим тарҷума кунед («ich habe 20 Jahre»), олмонӣ хато мешавад.

**viele ё viel?**
- **wie viele** — барои чизҳои ШУМУРДАНӢ: wie viele Kinder, wie viele Bücher
- **wie viel** — барои ношумурданиҳо ва нарх: wie viel kostet, wie viel Geld`,
    rules: [
      { pattern: 'Wie alt + sein', note: 'Ich bin 20 Jahre alt. Ҳеҷ гоҳ «ich habe 20 Jahre».' },
      { pattern: 'wie viele + шумурданӣ', note: 'Wie viele Brüder hast du? — Ҷавоб бо haben.' },
      { pattern: 'wie viel + нарх', note: 'Wie viel kostet das? — Das kostet zehn Euro.' },
      { pattern: '«Jahre alt» ҳамроҳ меояд', note: 'Ich bin zwanzig Jahre alt — «Jahre alt» гум намешавад.' },
    ],
    examples: [
      { sentence: 'Wie alt bist du?', translation: 'Чандсола ҳастӣ?', highlight: 'Wie alt' },
      { sentence: 'Ich bin zwanzig Jahre alt.', translation: 'Ман бистсола ҳастам.', highlight: 'bin' },
      { sentence: 'Wie viele Brüder hast du?', translation: 'Чанд бародар дорӣ?', highlight: 'Wie viele' },
      { sentence: 'Wie viel kostet das Buch?', translation: 'Ин китоб чанд меарзад?', highlight: 'Wie viel' },
      { sentence: 'Das kostet fünfzehn Euro.', translation: 'Ин понздаҳ евро меарзад.', highlight: 'kostet' },
    ],
    exercises: [
      { prompt: 'Ich ___ zwanzig Jahre alt.', promptTranslated: 'Ман бистсола ҳастам.', answer: 'bin', options: ['bin', 'habe', 'ist', 'hat'], explanation: 'Синну сол бо sein: ich bin … Jahre alt.' },
      { prompt: '___ alt bist du?', promptTranslated: 'Чандсола ҳастӣ?', answer: 'Wie', options: ['Wie', 'Was', 'Wer', 'Wo'], explanation: 'Wie alt …? — саволи синну сол.' },
      { prompt: '___ Brüder hast du?', promptTranslated: 'Чанд бародар дорӣ?', answer: 'Wie viele', options: ['Wie viele', 'Wie viel', 'Wie alt', 'Wie'], explanation: 'Bruder шумурданист → wie viele.' },
      { prompt: '___ kostet das Buch?', promptTranslated: 'Китоб чанд меарзад?', answer: 'Wie viel', options: ['Wie viel', 'Wie viele', 'Wie alt', 'Wer'], explanation: 'Барои нарх ҳамеша wie viel.' },
      { prompt: 'Er ___ dreißig Jahre alt.', promptTranslated: 'Ӯ сисола аст.', answer: 'ist', options: ['ist', 'hat', 'bin', 'sind'], explanation: 'er + sein → ist.' },
      { prompt: 'Ich ___ zwei Schwestern.', promptTranslated: 'Ман ду хоҳар дорам.', answer: 'habe', options: ['habe', 'bin', 'ist', 'hat'], explanation: 'Ин ҷо «доштан» — haben.' },
      { prompt: 'Das ___ zehn Euro.', promptTranslated: 'Ин даҳ евро меарзад.', answer: 'kostet', options: ['kostet', 'ist alt', 'hat', 'bin'], explanation: 'kosten = арзидан.' },
      { prompt: 'Wie alt ___ deine Mutter?', promptTranslated: 'Модарат чандсола аст?', answer: 'ist', options: ['ist', 'hat', 'bist', 'bin'], explanation: 'deine Mutter → sie → ist.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Wie alt sind sie?', lessonTitleTranslated: 'Онҳо чандсоланд?',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Wie alt sind sie?', titleTranslated: 'Онҳо чандсоланд?',
    passage: 'Ich heiße Lena und ich bin fünfzehn Jahre alt. Mein Bruder ist dreizehn. Meine Mutter ist neununddreißig Jahre alt. Mein Großvater ist neunzig. Er hat heute Geburtstag.',
    passageTranslated: 'Номи ман Лена аст ва ман понздаҳсола ҳастам. Бародарам сездаҳсола аст. Модарам сию нӯҳсола аст. Бобоям навадсола аст. Имрӯз зодрӯзи ӯст.',
    questions: [
      { question: 'Wie alt ist Lena?', questionTranslated: 'Лена чандсола аст?', options: ['Fünfzehn', 'Dreizehn', 'Neunzig'], correctIndex: 0, explanation: 'Матн: ich bin fünfzehn Jahre alt.' },
      { question: 'Wie alt ist der Bruder?', questionTranslated: 'Бародар чандсола аст?', options: ['Dreizehn', 'Fünfzehn', 'Neununddreißig'], correctIndex: 0, explanation: 'Матн: Mein Bruder ist dreizehn.' },
      { question: 'Wer hat heute Geburtstag?', questionTranslated: 'Имрӯз зодрӯзи кӣ аст?', options: ['Der Großvater', 'Die Mutter', 'Lena'], correctIndex: 0, explanation: 'Матн: Er hat heute Geburtstag.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Die Telefonnummer', lessonTitleTranslated: 'Шунавоӣ: Рақами телефон',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Die Telefonnummer', titleTranslated: 'Шунавоӣ: Рақами телефон',
    passage: 'Guten Tag! Ich heiße Tom. Meine Telefonnummer ist null, vier, sieben, zwei. Meine Hausnummer ist zwölf. Ich bin achtundzwanzig Jahre alt.',
    passageTranslated: 'Рӯзи нек! Номи ман Том аст. Рақами телефони ман сифр, чор, ҳафт, ду аст. Рақами хонаи ман дувоздаҳ аст. Ман бисту ҳаштсола ҳастам.',
    questions: [
      { question: 'Wie beginnt die Telefonnummer?', questionTranslated: 'Рақами телефон бо чӣ сар мешавад?', options: ['Mit null', 'Mit vier', 'Mit zwölf'], correctIndex: 0, explanation: 'Матн: null, vier, sieben, zwei.' },
      { question: 'Wie ist die Hausnummer?', questionTranslated: 'Рақами хона чанд аст?', options: ['Zwölf', 'Zwei', 'Sieben'], correctIndex: 0, explanation: 'Матн: Meine Hausnummer ist zwölf.' },
      { question: 'Wie alt ist Tom?', questionTranslated: 'Том чандсола аст?', options: ['Achtundzwanzig', 'Zwölf', 'Zweiundacht'], correctIndex: 0, explanation: 'Матн: Ich bin achtundzwanzig Jahre alt.' },
      { question: 'Wie heißt er?', questionTranslated: 'Номи ӯ чист?', options: ['Tom', 'Tim', 'Tobias'], correctIndex: 0, explanation: 'Матн: Ich heiße Tom.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Zahlen', titleTranslated: 'Такрор: рақамҳо',
    passage: 'Wir wiederholen die Zahlen! Nach zwanzig kommt einundzwanzig. Zuerst die Eins, dann und, dann die Zwanzig. Hundert und eins ist hunderteins. Das Alter sagt man mit sein: Ich bin zehn Jahre alt.',
    passageTranslated: 'Биёед рақамҳоро такрор кунем! Баъди бист einundzwanzig меояд. Аввал як, баъд und, баъд бист. Саду як hunderteins мешавад. Синну солро бо sein мегӯянд: ман даҳсола ҳастам.',
    questions: [
      { question: 'Was kommt nach zwanzig?', questionTranslated: 'Баъди бист чӣ меояд?', options: ['Einundzwanzig', 'Zwanzigeins', 'Zwanzigundein'], correctIndex: 0, explanation: 'Матн: Nach zwanzig kommt einundzwanzig.' },
      { question: 'Mit welchem Verb sagt man das Alter?', questionTranslated: 'Синну солро бо кадом феъл мегӯянд?', options: ['sein', 'haben', 'kosten'], correctIndex: 0, explanation: 'Матн: Das Alter sagt man mit sein.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Im Geschäft', titleTranslated: 'Дар мағоза',
    passage: 'Anna ist im Geschäft. Sie kauft ein Buch. Das Buch kostet vierzehn Euro. Sie hat zwanzig Euro. Anna ist siebzehn Jahre alt. Ihre Telefonnummer ist null, drei, acht.',
    passageTranslated: 'Анна дар мағоза аст. Ӯ як китоб мехарад. Китоб чордаҳ евро меарзад. Ӯ бист евро дорад. Анна ҳабдаҳсола аст. Рақами телефони ӯ сифр, се, ҳашт аст.',
    questions: [
      { question: 'Was kauft Anna?', questionTranslated: 'Анна чӣ мехарад?', options: ['Ein Buch', 'Ein Telefon', 'Eine Uhr'], correctIndex: 0, explanation: 'Матн: Sie kauft ein Buch.' },
      { question: 'Wie viel kostet das Buch?', questionTranslated: 'Китоб чанд меарзад?', options: ['Vierzehn Euro', 'Zwanzig Euro', 'Siebzehn Euro'], correctIndex: 0, explanation: 'Матн: Das Buch kostet vierzehn Euro.' },
      { question: 'Wie viel Geld hat Anna?', questionTranslated: 'Анна чанд пул дорад?', options: ['Zwanzig Euro', 'Vierzehn Euro', 'Acht Euro'], correctIndex: 0, explanation: 'Матн: Sie hat zwanzig Euro.' },
      { question: 'Wie alt ist Anna?', questionTranslated: 'Анна чандсола аст?', options: ['Siebzehn', 'Vierzehn', 'Zwanzig'], correctIndex: 0, explanation: 'Матн: Anna ist siebzehn Jahre alt.' },
      { question: 'Womit beginnt ihre Telefonnummer?', questionTranslated: 'Рақами телефони ӯ бо чӣ сар мешавад?', options: ['Mit null', 'Mit drei', 'Mit acht'], correctIndex: 0, explanation: 'Матн: null, drei, acht.' },
      { question: '«Wie viel kostet das?» — was bedeutet das?', questionTranslated: '«Wie viel kostet das?» чӣ маъно дорад?', options: ['Ин чанд меарзад?', 'Ин чандсола аст?', 'Ин чанд дона аст?'], correctIndex: 0, explanation: 'kosten = арзидан.' },
      { question: '«einundzwanzig» — welche Zahl?', questionTranslated: '«einundzwanzig» кадом рақам аст?', options: ['21', '12', '20'], correctIndex: 0, explanation: 'ein + und + zwanzig = 21.' },
      { question: 'Wie sagt man das Alter?', questionTranslated: 'Синну солро чӣ гуна мегӯянд?', options: ['Ich bin zehn Jahre alt', 'Ich habe zehn Jahre', 'Ich kostet zehn Jahre'], correctIndex: 0, explanation: 'Синну сол ҳамеша бо sein.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: im Geschäft', lessonTitleTranslated: 'Муколама: дар мағоза',
  title: 'Gespräch im Geschäft', titleTranslated: 'Муколама дар мағоза',
  scenario: 'Ein Kunde fragt nach dem Preis und gibt seine Nummer.', emoji: '🗣️',
  lines: [
    { speaker: 'Person A', text: 'Guten Tag! Wie viel kostet das Buch?', translation: 'Рӯзи нек! Китоб чанд меарзад?' },
    { speaker: 'Person B', text: 'Es kostet vierzehn Euro.', translation: 'Он чордаҳ евро меарзад.' },
    { speaker: 'Person A', text: 'Gut, ich nehme es.', translation: 'Хуб, ман онро мегирам.' },
    { speaker: 'Person B', text: 'Wie ist Ihre Telefonnummer?', translation: 'Рақами телефони Шумо чанд аст?' },
    { speaker: 'Person A', text: 'Null, drei, acht, zwei.', translation: 'Сифр, се, ҳашт, ду.' },
    { speaker: 'Person B', text: 'Und wie ist Ihre Hausnummer?', translation: 'Ва рақами хонаи Шумо чанд аст?' },
    { speaker: 'Person A', text: 'Meine Hausnummer ist zwölf.', translation: 'Рақами хонаи ман дувоздаҳ аст.' },
    { speaker: 'Person B', text: 'Danke schön! Auf Wiedersehen.', translation: 'Бисёр ташаккур! То дидор.' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['null', 'zehn', 'zwanzig', 'hundert', 'die Zahl', 'das Jahr', 'die Uhr', 'die Nummer'],
};

export const ORDER = [
  'vocab:Zahlen 0–5',
  'vocab:Zahlen 6–10',
  'vocab:Zahlen 11–20',
  'vocab:Die Zehner',
  'vocab:Große Zahlen',
  'vocab:Wie alt bist du?',
  'vocab:Zahlen im Alltag',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
