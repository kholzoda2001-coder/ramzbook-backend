// Мазмуни Модули 5-и олмонӣ (A1) — «Zeit und Tagesablauf».
//
// Ду доми вазнини ин мавзӯъ барои хонандаи тоҷик:
//   1. `halb neun` = 8:30, на 9:30 — олмонӣ соати ОЯНДАро мегӯяд.
//   2. `am / um / im` — дар тоҷикӣ ҳамааш «дар» аст: дар душанбе, дар соати ҳашт,
//      дар январ. Дар олмонӣ се пешоянди гуногун.
//
// Танҳо МАЪЛУМОТ — мантиқ дар `_de-module-build.mjs`.
// `correctIndex: 0` дар ҳама ҷо — билд ҷои ҷавобро худаш паҳн мекунад.

export const MODULE = {
  order: 4,
  title: 'Zeit und Tagesablauf',
  titleTranslated: 'Вақт ва рӯзи ҳаррӯза',
  emoji: '🕐',
};

export const VOCAB = [
  {
    title: 'Wochentage 1', titleTranslated: 'Рӯзҳои ҳафта 1', emoji: '📅',
    words: [
      { word: 'Montag', existing: true },
      { word: 'Dienstag', existing: true },
      { word: 'Mittwoch', existing: true },
      { word: 'Donnerstag', existing: true },
    ],
  },
  {
    title: 'Wochentage 2', titleTranslated: 'Рӯзҳои ҳафта 2', emoji: '🗓️',
    words: [
      { word: 'Freitag', existing: true },
      { word: 'Samstag', existing: true },
      { word: 'Sonntag', existing: true },
      { word: 'die Woche', translation: 'ҳафта', emoji: '📆', ipa: '/diː ˈvɔxə/',
        example: 'Eine Woche hat sieben Tage.', exampleTrans: 'Як ҳафта ҳафт рӯз дорад.' },
      { word: 'das Wochenende', translation: 'охири ҳафта', emoji: '🎉', ipa: '/das ˈvɔxənʔɛndə/',
        example: 'Am Wochenende schlafe ich lange.', exampleTrans: 'Охири ҳафта ман дер мехобам.' },
    ],
  },
  {
    title: 'Tageszeiten', titleTranslated: 'Қисмҳои рӯз', emoji: '🌅',
    words: [
      { word: 'der Morgen', existing: true },
      { word: 'der Mittag', existing: true },
      { word: 'der Nachmittag', translation: 'баъдизуҳр', emoji: '🌤️', ipa: '/deːɐ̯ ˈnaːxmɪtaːk/',
        example: 'Am Nachmittag lerne ich Deutsch.', exampleTrans: 'Баъдизуҳр ман олмонӣ меомӯзам.' },
      { word: 'der Abend', existing: true },
      { word: 'die Nacht', existing: true },
      { word: 'der Tag', translation: 'рӯз', emoji: '☀️', ipa: '/deːɐ̯ taːk/',
        example: 'Der Tag ist lang.', exampleTrans: 'Рӯз дароз аст.' },
    ],
  },
  {
    title: 'Heute und morgen', titleTranslated: 'Имрӯз ва фардо', emoji: '⏳',
    words: [
      { word: 'heute', existing: true },
      { word: 'morgen', existing: true },
      { word: 'gestern', existing: true },
      { word: 'jetzt', existing: true },
      { word: 'später', translation: 'баъдтар', emoji: '⏰', ipa: '/ˈʃpɛːtɐ/',
        example: 'Wir sprechen später.', exampleTrans: 'Мо баъдтар гап мезанем.' },
    ],
  },
  {
    title: 'Monate 1', titleTranslated: 'Моҳҳо 1', emoji: '❄️',
    words: [
      { word: 'Januar', existing: true },
      { word: 'Februar', existing: true },
      { word: 'März', existing: true },
      { word: 'April', existing: true },
      { word: 'Mai', existing: true },
      { word: 'Juni', existing: true },
    ],
  },
  {
    title: 'Monate 2', titleTranslated: 'Моҳҳо 2', emoji: '🍂',
    words: [
      { word: 'Juli', existing: true },
      { word: 'August', existing: true },
      { word: 'September', existing: true },
      { word: 'Oktober', existing: true },
      { word: 'November', existing: true },
      { word: 'Dezember', existing: true },
    ],
  },
  {
    title: 'Mahlzeiten und Uhrzeit', titleTranslated: 'Хӯрок ва соат', emoji: '🍽️',
    words: [
      { word: 'das Frühstück', translation: 'наҳорӣ', emoji: '🥐', ipa: '/das ˈfʁyːʃtʏk/',
        example: 'Das Frühstück ist um acht.', exampleTrans: 'Наҳорӣ соати ҳашт аст.' },
      { word: 'das Mittagessen', translation: 'хӯроки нисфирӯзӣ', emoji: '🍲', ipa: '/das ˈmɪtaːkʔɛsən/',
        example: 'Das Mittagessen ist sehr gut.', exampleTrans: 'Хӯроки нисфирӯзӣ хеле хуб аст.' },
      { word: 'das Abendessen', translation: 'хӯроки шом', emoji: '🍽️', ipa: '/das ˈaːbəntʔɛsən/',
        example: 'Wir essen das Abendessen zusammen.', exampleTrans: 'Мо хӯроки шомро якҷоя мехӯрем.' },
      { word: 'die Zeit', translation: 'вақт', emoji: '⌛', ipa: '/diː t͡saɪ̯t/',
        example: 'Ich habe keine Zeit.', exampleTrans: 'Ман вақт надорам.' },
      { word: 'Wie spät ist es', translation: 'Соат чанд аст?', emoji: '❓', ipa: '/viː ʃpɛːt ɪst ɛs/',
        example: 'Entschuldigung, wie spät ist es?', exampleTrans: 'Бубахшед, соат чанд аст?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: die Uhrzeit', lessonTitleTranslated: 'Грамматика: соат',
    title: 'Wie spät ist es? — die Uhrzeit', titleTranslated: 'Соат чанд аст? — вақти соат',
    emoji: '🕐',
    explanation:
`Соатро дар олмонӣ бо **Es ist …** мегӯянд:

- 8:00 → **Es ist acht Uhr.**
- 8:15 → **Es ist Viertel nach acht.** (чоряк БАЪДИ ҳашт)
- 8:45 → **Es ist Viertel vor neun.** (чоряк ПЕШ аз нӯҳ)

**Доми асосӣ — halb!**

8:30 → **Es ist halb neun.** — на «halb acht»!

Олмонӣ ҳангоми «нисф» соати ОЯНДАро мегӯяд: нисфи роҳ ба сӯи НӮҲ. Дар тоҷикӣ мо мегӯем «ҳашту ним» — аз соати гузашта. Ин ҷо навомӯз қариб ҳамеша як соат хато мекунад.

- 7:30 = halb **acht**
- 12:30 = halb **eins**

Барои саволи вақт: **Wie spät ist es?** ё **Wie viel Uhr ist es?**

Дар нутқи расмӣ рақами оддӣ ҳам мегӯянд: **Es ist acht Uhr dreißig.**`,
    rules: [
      { pattern: 'Es ist … Uhr', note: 'Es ist acht Uhr. — соати комил.' },
      { pattern: 'halb + соати ОЯНДА', note: '8:30 = halb neun. Ҳамеша як соат пеш аз он ки шумо интизоред.' },
      { pattern: 'Viertel nach / Viertel vor', note: '8:15 = Viertel nach acht; 8:45 = Viertel vor neun.' },
      { pattern: 'Савол', note: 'Wie spät ist es? ё Wie viel Uhr ist es?' },
    ],
    examples: [
      { sentence: 'Es ist acht Uhr.', translation: 'Соат ҳашт аст.', highlight: 'acht Uhr' },
      { sentence: 'Es ist halb neun.', translation: 'Соат ҳашту ним аст.', highlight: 'halb neun' },
      { sentence: 'Es ist Viertel nach acht.', translation: 'Соат ҳашту понздаҳ аст.', highlight: 'Viertel nach' },
      { sentence: 'Es ist Viertel vor neun.', translation: 'Соат ба нӯҳ понздаҳ монд.', highlight: 'Viertel vor' },
      { sentence: 'Wie spät ist es?', translation: 'Соат чанд аст?', highlight: 'Wie spät' },
      { sentence: 'Das Frühstück ist um sieben Uhr.', translation: 'Наҳорӣ соати ҳафт аст.', highlight: 'um' },
    ],
    exercises: [
      { prompt: '8:30 = Es ist ___.', promptTranslated: 'Соат ҳашту ним аст.', answer: 'halb neun', options: ['halb neun', 'halb acht', 'acht halb', 'neun halb'], explanation: 'halb соати ОЯНДАро мегирад: 8:30 = halb neun.' },
      { prompt: '7:30 = Es ist ___.', promptTranslated: 'Соат ҳафту ним аст.', answer: 'halb acht', options: ['halb acht', 'halb sieben', 'sieben halb', 'halb neun'], explanation: '7:30 → нисфи роҳ ба ҳашт.' },
      { prompt: '8:00 = Es ist ___.', promptTranslated: 'Соат ҳашт аст.', answer: 'acht Uhr', options: ['acht Uhr', 'halb acht', 'Uhr acht', 'acht Zeit'], explanation: 'Соати комил: … Uhr.' },
      { prompt: '8:15 = Es ist ___ acht.', promptTranslated: 'Соат ҳашту понздаҳ аст.', answer: 'Viertel nach', options: ['Viertel nach', 'Viertel vor', 'halb', 'nach Viertel'], explanation: 'nach = баъд аз.' },
      { prompt: '8:45 = Es ist ___ neun.', promptTranslated: 'Ба нӯҳ понздаҳ монд.', answer: 'Viertel vor', options: ['Viertel vor', 'Viertel nach', 'halb', 'vor Viertel'], explanation: 'vor = пеш аз.' },
      { prompt: '___ spät ist es?', promptTranslated: 'Соат чанд аст?', answer: 'Wie', options: ['Wie', 'Was', 'Wann', 'Wo'], explanation: 'Wie spät ist es? — саволи вақт.' },
      { prompt: '12:30 = Es ist ___.', promptTranslated: 'Соат дувоздаҳу ним аст.', answer: 'halb eins', options: ['halb eins', 'halb zwölf', 'halb dreizehn', 'zwölf halb'], explanation: 'Баъди 12 соати оянда «eins» аст.' },
      { prompt: 'Es ___ neun Uhr.', promptTranslated: 'Соат нӯҳ аст.', answer: 'ist', options: ['ist', 'sind', 'hat', 'bin'], explanation: 'Вақт ҳамеша бо «Es ist».' },
    ],
  },
  {
    lessonTitle: 'Grammatik: am, um, im', lessonTitleTranslated: 'Грамматика: am, um, im',
    title: 'am, um, im — Zeitpräpositionen', titleTranslated: 'am, um, im — пешояндҳои вақт',
    emoji: '📅',
    explanation:
`Дар тоҷикӣ мо ҳама вақт як калимаи «дар» мегӯем: **дар** душанбе, **дар** соати ҳашт, **дар** январ. Дар олмонӣ се пешоянди ГУНОГУН аст ва онҳоро омехта кардан мумкин нест:

- **am** + рӯз ва қисми рӯз → **am** Montag, **am** Morgen, **am** Wochenende
- **um** + соат → **um** acht Uhr, **um** halb neun
- **im** + моҳ ва фасл → **im** Januar, **im** Sommer

Роҳи осони дар ёд нигоҳ доштан:

- рӯз → **am**
- соат → **um**
- моҳ → **im**

**Истиснои муҳим:** бо «die Nacht» пешоянди **in der** меояд: **in der** Nacht.

Ва бо heute, morgen, gestern, jetzt ҲЕҶ пешоянд намеояд: **Heute** lerne ich. (на «am heute»)`,
    rules: [
      { pattern: 'am + рӯз', note: 'am Montag, am Sonntag, am Morgen, am Wochenende.' },
      { pattern: 'um + соат', note: 'um acht Uhr, um halb neun.' },
      { pattern: 'im + моҳ', note: 'im Januar, im Mai, im Dezember.' },
      { pattern: 'Бе пешоянд', note: 'heute, morgen, gestern, jetzt — ҳеҷ гоҳ пешоянд намегиранд.' },
    ],
    examples: [
      { sentence: 'Am Montag arbeite ich.', translation: 'Рӯзи душанбе ман кор мекунам.', highlight: 'Am' },
      { sentence: 'Um acht Uhr ist das Frühstück.', translation: 'Соати ҳашт наҳорӣ аст.', highlight: 'Um' },
      { sentence: 'Im Januar ist es kalt.', translation: 'Дар январ хунук аст.', highlight: 'Im' },
      { sentence: 'Am Wochenende schlafe ich lange.', translation: 'Охири ҳафта ман дер мехобам.', highlight: 'Am' },
      { sentence: 'Heute lerne ich Deutsch.', translation: 'Имрӯз ман олмонӣ меомӯзам.', highlight: 'Heute' },
    ],
    exercises: [
      { prompt: '___ Montag arbeite ich.', promptTranslated: 'Рӯзи душанбе ман кор мекунам.', answer: 'Am', options: ['Am', 'Um', 'Im', 'In'], explanation: 'Рӯз → am.' },
      { prompt: '___ acht Uhr beginnt die Schule.', promptTranslated: 'Соати ҳашт мактаб сар мешавад.', answer: 'Um', options: ['Um', 'Am', 'Im', 'An'], explanation: 'Соат → um.' },
      { prompt: '___ Dezember ist es kalt.', promptTranslated: 'Дар декабр хунук аст.', answer: 'Im', options: ['Im', 'Am', 'Um', 'In'], explanation: 'Моҳ → im.' },
      { prompt: '___ Wochenende bin ich zu Hause.', promptTranslated: 'Охири ҳафта ман дар хонаам.', answer: 'Am', options: ['Am', 'Um', 'Im', 'In'], explanation: 'Wochenende ҳамчун рӯз → am.' },
      { prompt: '___ Morgen trinke ich Tee.', promptTranslated: 'Субҳ ман чой менӯшам.', answer: 'Am', options: ['Am', 'Um', 'Im', 'In'], explanation: 'Қисми рӯз → am.' },
      { prompt: '___ Mai ist es warm.', promptTranslated: 'Дар май гарм аст.', answer: 'Im', options: ['Im', 'Am', 'Um', 'An'], explanation: 'Моҳ → im.' },
      { prompt: '___ halb neun esse ich.', promptTranslated: 'Соати ҳашту ним ман мехӯрам.', answer: 'Um', options: ['Um', 'Am', 'Im', 'In'], explanation: 'Вақти дақиқ → um.' },
      { prompt: '___ lerne ich Deutsch.', promptTranslated: 'Имрӯз ман олмонӣ меомӯзам.', answer: 'Heute', options: ['Heute', 'Am heute', 'Im heute', 'Um heute'], explanation: 'heute бе пешоянд меояд.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Toms Woche', lessonTitleTranslated: 'Ҳафтаи Том',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Toms Woche', titleTranslated: 'Ҳафтаи Том',
    passage: 'Am Montag arbeitet Tom. Das Frühstück ist um sieben Uhr. Am Mittwoch lernt er Deutsch. Am Wochenende schläft er lange. Im Juli hat er Ferien.',
    passageTranslated: 'Рӯзи душанбе Том кор мекунад. Наҳорӣ соати ҳафт аст. Рӯзи чоршанбе ӯ олмонӣ меомӯзад. Охири ҳафта ӯ дер мехобад. Дар июл ӯ таътил дорад.',
    questions: [
      { question: 'Wann arbeitet Tom?', questionTranslated: 'Том кай кор мекунад?', options: ['Am Montag', 'Am Mittwoch', 'Am Wochenende'], correctIndex: 0, explanation: 'Матн: Am Montag arbeitet Tom.' },
      { question: 'Wann ist das Frühstück?', questionTranslated: 'Наҳорӣ кай аст?', options: ['Um sieben Uhr', 'Um acht Uhr', 'Am Mittwoch'], correctIndex: 0, explanation: 'Матн: um sieben Uhr.' },
      { question: 'Wann hat er Ferien?', questionTranslated: 'Ӯ кай таътил дорад?', options: ['Im Juli', 'Im Januar', 'Am Sonntag'], correctIndex: 0, explanation: 'Матн: Im Juli hat er Ferien.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Wie spät ist es?', lessonTitleTranslated: 'Шунавоӣ: Соат чанд аст?',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Wie spät ist es?', titleTranslated: 'Шунавоӣ: Соат чанд аст?',
    passage: 'Guten Morgen! Es ist halb neun. Um zehn Uhr habe ich Deutsch. Das Mittagessen ist um eins. Am Abend gehe ich nach Hause.',
    passageTranslated: 'Субҳ ба хайр! Соат ҳашту ним аст. Соати даҳ ман дарси олмонӣ дорам. Хӯроки нисфирӯзӣ соати як аст. Бегоҳ ман ба хона меравам.',
    questions: [
      { question: 'Wie spät ist es?', questionTranslated: 'Соат чанд аст?', options: ['Halb neun', 'Halb acht', 'Zehn Uhr'], correctIndex: 0, explanation: 'Матн: Es ist halb neun.' },
      { question: 'Wann ist Deutsch?', questionTranslated: 'Дарси олмонӣ кай аст?', options: ['Um zehn Uhr', 'Um eins', 'Am Abend'], correctIndex: 0, explanation: 'Матн: Um zehn Uhr habe ich Deutsch.' },
      { question: 'Wann ist das Mittagessen?', questionTranslated: 'Хӯроки нисфирӯзӣ кай аст?', options: ['Um eins', 'Um zehn', 'Am Morgen'], correctIndex: 0, explanation: 'Матн: Das Mittagessen ist um eins.' },
      { question: 'Was macht er am Abend?', questionTranslated: 'Ӯ бегоҳ чӣ мекунад?', options: ['Er geht nach Hause', 'Er lernt Deutsch', 'Er isst'], correctIndex: 0, explanation: 'Матн: Am Abend gehe ich nach Hause.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Zeit', titleTranslated: 'Такрор: вақт',
    passage: 'Wir wiederholen! Halb neun ist acht Uhr dreißig, nicht neun Uhr dreißig. Für einen Tag sagt man am, für eine Uhrzeit um, für einen Monat im.',
    passageTranslated: 'Биёед такрор кунем! Halb neun ҳашту ним аст, на нӯҳу ним. Барои рӯз am мегӯянд, барои соат um, барои моҳ im.',
    questions: [
      { question: 'Was bedeutet halb neun?', questionTranslated: '«Halb neun» чанд аст?', options: ['8:30', '9:30', '9:00'], correctIndex: 0, explanation: 'Матн: Halb neun ist acht Uhr dreißig.' },
      { question: 'Welches Wort passt zu einem Monat?', questionTranslated: 'Барои моҳ кадом калима меояд?', options: ['im', 'am', 'um'], correctIndex: 0, explanation: 'Матн: für einen Monat im.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Ein Tag von Anna', titleTranslated: 'Як рӯзи Анна',
    passage: 'Anna steht um halb sieben auf. Das Frühstück ist um sieben Uhr. Am Vormittag arbeitet sie. Das Mittagessen ist um halb eins. Am Abend liest sie ein Buch. Am Sonntag arbeitet sie nicht.',
    passageTranslated: 'Анна соати шашу ним бедор мешавад. Наҳорӣ соати ҳафт аст. Пеш аз нисфирӯзӣ ӯ кор мекунад. Хӯроки нисфирӯзӣ соати дувоздаҳу ним аст. Бегоҳ ӯ китоб мехонад. Рӯзи якшанбе ӯ кор намекунад.',
    questions: [
      { question: 'Wann steht Anna auf?', questionTranslated: 'Анна кай бедор мешавад?', options: ['Um halb sieben', 'Um sieben Uhr', 'Um halb eins'], correctIndex: 0, explanation: 'Матн: Anna steht um halb sieben auf.' },
      { question: 'Wie spät ist halb sieben?', questionTranslated: '«Halb sieben» чанд аст?', options: ['6:30', '7:30', '7:00'], correctIndex: 0, explanation: 'halb соати ояндаро мегирад: halb sieben = 6:30.' },
      { question: 'Wann ist das Frühstück?', questionTranslated: 'Наҳорӣ кай аст?', options: ['Um sieben Uhr', 'Um halb sieben', 'Am Abend'], correctIndex: 0, explanation: 'Матн: Das Frühstück ist um sieben Uhr.' },
      { question: 'Wann ist das Mittagessen?', questionTranslated: 'Хӯроки нисфирӯзӣ кай аст?', options: ['Um halb eins', 'Um eins', 'Um halb sieben'], correctIndex: 0, explanation: 'Матн: um halb eins.' },
      { question: 'Was macht sie am Abend?', questionTranslated: 'Ӯ бегоҳ чӣ мекунад?', options: ['Sie liest ein Buch', 'Sie arbeitet', 'Sie schläft'], correctIndex: 0, explanation: 'Матн: Am Abend liest sie ein Buch.' },
      { question: 'Wann arbeitet sie nicht?', questionTranslated: 'Ӯ кай кор намекунад?', options: ['Am Sonntag', 'Am Montag', 'Am Abend'], correctIndex: 0, explanation: 'Матн: Am Sonntag arbeitet sie nicht.' },
      { question: 'Welches Wort passt zu einer Uhrzeit?', questionTranslated: 'Барои соат кадом калима меояд?', options: ['um', 'am', 'im'], correctIndex: 0, explanation: 'um acht Uhr.' },
      { question: '«die Woche» — was bedeutet das?', questionTranslated: '«die Woche» чӣ маъно дорад?', options: ['ҳафта', 'моҳ', 'сол'], correctIndex: 0, explanation: 'die Woche = ҳафта.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Wann treffen wir uns?', lessonTitleTranslated: 'Муколама: Кай вомехӯрем?',
  title: 'Gespräch über die Zeit', titleTranslated: 'Муколама дар бораи вақт',
  scenario: 'Zwei Freunde verabreden sich für das Wochenende.', emoji: '🗣️',
  lines: [
    { speaker: 'Person A', text: 'Wann treffen wir uns?', translation: 'Кай вомехӯрем?' },
    { speaker: 'Person B', text: 'Am Samstag, um drei Uhr.', translation: 'Рӯзи шанбе, соати се.' },
    { speaker: 'Person A', text: 'Um drei habe ich keine Zeit.', translation: 'Соати се ман вақт надорам.' },
    { speaker: 'Person B', text: 'Dann um halb fünf?', translation: 'Пас соати чору ним?' },
    { speaker: 'Person A', text: 'Ja, das ist gut.', translation: 'Бале, ин хуб аст.' },
    { speaker: 'Person B', text: 'Wie spät ist es jetzt?', translation: 'Ҳозир соат чанд аст?' },
    { speaker: 'Person A', text: 'Es ist Viertel nach zwei.', translation: 'Соат дую понздаҳ аст.' },
    { speaker: 'Person B', text: 'Gut, bis Samstag!', translation: 'Хуб, то шанбе!' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['Montag', 'Sonntag', 'die Woche', 'der Tag', 'heute', 'später', 'die Zeit', 'das Frühstück'],
};

export const ORDER = [
  'vocab:Wochentage 1',
  'vocab:Wochentage 2',
  'vocab:Tageszeiten',
  'vocab:Heute und morgen',
  'vocab:Monate 1',
  'vocab:Monate 2',
  'vocab:Mahlzeiten und Uhrzeit',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
