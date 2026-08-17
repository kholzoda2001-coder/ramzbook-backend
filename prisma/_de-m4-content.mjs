// Мазмуни Модули 4-и олмонӣ (A1) — «Farben und Eigenschaften».
//
// Грамматикаи ин модул: сифат баъди феъли `sein` ҲЕҶ ГОҲ тағйир намеёбад
// (Das Auto ist rot / Die Blumen sind rot) — дар тоҷикӣ ҳам сифат бетағйир
// аст, пас ин ҷо олмонӣ ОСОН аст ва инро бояд гуфт; вале ҳамон сифат пеш аз
// исм бандак мегирад, ва хонанда бояд донад, ки ин ду ҳолати ҷудост.
// Дуюм: `nicht` сифатро инкор мекунад, вале барои исм `kein` меояд.
//
// Танҳо МАЪЛУМОТ — мантиқ дар `_de-module-build.mjs`.
// `correctIndex: 0` дар ҳама ҷо — билд ҷои ҷавобро худаш паҳн мекунад.

export const MODULE = {
  order: 3,
  title: 'Farben und Eigenschaften',
  titleTranslated: 'Рангҳо ва аломатҳо',
  emoji: '🎨',
};

export const VOCAB = [
  {
    title: 'Grundfarben', titleTranslated: 'Рангҳои асосӣ', emoji: '🎨',
    words: [
      { word: 'rot', existing: true },
      { word: 'blau', existing: true },
      { word: 'grün', existing: true },
      { word: 'gelb', existing: true },
      { word: 'weiß', existing: true },
      { word: 'schwarz', existing: true },
    ],
  },
  {
    title: 'Weitere Farben', titleTranslated: 'Рангҳои дигар', emoji: '🌈',
    words: [
      { word: 'orange', existing: true },
      { word: 'lila', existing: true },
      { word: 'rosa', existing: true },
      { word: 'braun', existing: true },
      { word: 'grau', translation: 'хокистарӣ', emoji: '⬜', ipa: '/ɡʁaʊ̯/',
        example: 'Der Himmel ist heute grau.', exampleTrans: 'Осмон имрӯз хокистарӣ аст.' },
    ],
  },
  {
    title: 'Groß oder klein?', titleTranslated: 'Калон ё хурд?', emoji: '📏',
    words: [
      { word: 'groß', existing: true },
      { word: 'klein', existing: true },
      { word: 'lang', existing: true },
      { word: 'kurz', existing: true },
      { word: 'dick', translation: 'ғафс', emoji: '🧱', ipa: '/dɪk/',
        example: 'Das Buch ist sehr dick.', exampleTrans: 'Китоб хеле ғафс аст.' },
      { word: 'dünn', translation: 'борик', emoji: '📄', ipa: '/dʏn/',
        example: 'Das Papier ist dünn.', exampleTrans: 'Коғаз борик аст.' },
    ],
  },
  {
    title: 'Gut oder schlecht?', titleTranslated: 'Хуб ё бад?', emoji: '👍',
    words: [
      { word: 'gut', existing: true },
      { word: 'schlecht', existing: true },
      { word: 'schön', existing: true },
      { word: 'neu', existing: true },
      { word: 'alt', existing: true },
    ],
  },
  {
    title: 'Warm oder kalt?', titleTranslated: 'Гарм ё хунук?', emoji: '🌡️',
    words: [
      { word: 'warm', existing: true },
      { word: 'kalt', translation: 'хунук', emoji: '❄️', ipa: '/kalt/',
        example: 'Das Wasser ist kalt.', exampleTrans: 'Об хунук аст.' },
      { word: 'heiß', translation: 'доғ', emoji: '🔥', ipa: '/haɪ̯s/',
        example: 'Der Tee ist zu heiß.', exampleTrans: 'Чой аз ҳад доғ аст.' },
      { word: 'sauber', translation: 'тоза', emoji: '✨', ipa: '/ˈzaʊ̯bɐ/',
        example: 'Mein Zimmer ist sauber.', exampleTrans: 'Ҳуҷраи ман тоза аст.' },
      { word: 'schmutzig', translation: 'ифлос', emoji: '🧼', ipa: '/ˈʃmʊt͡sɪç/',
        example: 'Das Auto ist schmutzig.', exampleTrans: 'Мошин ифлос аст.' },
    ],
  },
  {
    title: 'Dinge beschreiben', titleTranslated: 'Тавсифи ашё', emoji: '📦',
    words: [
      { word: 'das Auto', translation: 'мошин', emoji: '🚗', ipa: '/das ˈaʊ̯to/',
        example: 'Das Auto ist rot.', exampleTrans: 'Мошин сурх аст.' },
      { word: 'der Tisch', translation: 'миз', emoji: '🪑', ipa: '/deːɐ̯ tɪʃ/',
        example: 'Der Tisch ist groß.', exampleTrans: 'Миз калон аст.' },
      { word: 'der Stuhl', translation: 'курсӣ', emoji: '💺', ipa: '/deːɐ̯ ʃtuːl/',
        example: 'Der Stuhl ist neu.', exampleTrans: 'Курсӣ нав аст.' },
      { word: 'die Blume', translation: 'гул', emoji: '🌸', ipa: '/diː ˈbluːmə/',
        example: 'Die Blume ist gelb.', exampleTrans: 'Гул зард аст.' },
      { word: 'das Buch', translation: 'китоб', emoji: '📕', ipa: '/das buːx/',
        example: 'Das Buch ist alt.', exampleTrans: 'Китоб кӯҳна аст.' },
    ],
  },
  {
    title: 'Welche Farbe?', titleTranslated: 'Кадом ранг?', emoji: '❓',
    words: [
      { word: 'die Farbe', translation: 'ранг', emoji: '🎨', ipa: '/diː ˈfaʁbə/',
        example: 'Blau ist meine Farbe.', exampleTrans: 'Кабуд ранги ман аст.' },
      { word: 'hell', translation: 'равшан', emoji: '☀️', ipa: '/hɛl/',
        example: 'Das Zimmer ist hell.', exampleTrans: 'Ҳуҷра равшан аст.' },
      { word: 'dunkel', translation: 'торик', emoji: '🌑', ipa: '/ˈdʊŋkəl/',
        example: 'Draußen ist es dunkel.', exampleTrans: 'Берун торик аст.' },
      { word: 'Welche Farbe hat das', translation: 'Ин кадом ранг дорад?', emoji: '❓',
        ipa: '/ˈvɛlçə ˈfaʁbə hat das/',
        example: 'Welche Farbe hat das Auto?', exampleTrans: 'Мошин кадом ранг дорад?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Adjektive mit sein', lessonTitleTranslated: 'Грамматика: сифат бо sein',
    title: 'Adjektive mit sein — ohne Endung', titleTranslated: 'Сифат бо sein — бе бандак',
    emoji: '🎨',
    explanation:
`Вақте сифат баъди феъли **sein** меояд, он ҲЕҶ ГОҲ тағйир намеёбад — на аз рӯи ҷинс, на аз рӯи шумора:

- Das Auto ist **rot**.
- Die Blume ist **rot**.
- Die Bücher sind **rot**.

Ин барои шумо осон аст: дар тоҷикӣ ҳам сифат бетағйир мемонад («мошини сурх», «гули сурх»).

Формула: **исм + ist/sind + сифат**

- ist — барои як чиз: Der Tisch **ist** groß.
- sind — барои чанд чиз: Die Tische **sind** groß.

**Вале эҳтиёт шавед:** ҳамон сифат агар ПЕШ аз исм истад, бандак мегирад:

- Das Auto ist rot. → das **rote** Auto
- Die Blume ist schön. → die **schöne** Blume

Дар ин модул мо танҳо ҳолати аввалро (баъди sein) меомӯзем — он осон ва серистеъмол аст. Ҳолати дуюмро баъдтар мегирем.`,
    rules: [
      { pattern: 'исм + ist + сифат', note: 'Das Auto ist rot. Сифат бандак намегирад.' },
      { pattern: 'Ҷамъ → sind, сифат боз бетағйир', note: 'Die Bücher sind neu.' },
      { pattern: 'Ҷинс фарқ намекунад', note: 'Der Tisch ist groß. Die Blume ist groß. Das Buch ist groß.' },
      { pattern: 'Пеш аз исм бандак меояд', note: 'das rote Auto — инро дар сатҳи баъдӣ меомӯзем.' },
    ],
    examples: [
      { sentence: 'Das Auto ist rot.', translation: 'Мошин сурх аст.', highlight: 'rot' },
      { sentence: 'Die Blume ist gelb.', translation: 'Гул зард аст.', highlight: 'gelb' },
      { sentence: 'Der Tisch ist groß.', translation: 'Миз калон аст.', highlight: 'groß' },
      { sentence: 'Die Bücher sind neu.', translation: 'Китобҳо наванд.', highlight: 'sind' },
      { sentence: 'Mein Zimmer ist sauber.', translation: 'Ҳуҷраи ман тоза аст.', highlight: 'sauber' },
      { sentence: 'Der Tee ist heiß.', translation: 'Чой доғ аст.', highlight: 'heiß' },
    ],
    exercises: [
      { prompt: 'Das Auto ___ rot.', promptTranslated: 'Мошин сурх аст.', answer: 'ist', options: ['ist', 'sind', 'bin', 'bist'], explanation: 'Як чиз → ist.' },
      { prompt: 'Die Bücher ___ neu.', promptTranslated: 'Китобҳо наванд.', answer: 'sind', options: ['sind', 'ist', 'bin', 'seid'], explanation: 'Ҷамъ → sind.' },
      { prompt: 'Die Blume ist ___.', promptTranslated: 'Гул зард аст.', answer: 'gelb', options: ['gelb', 'gelbe', 'gelben', 'gelber'], explanation: 'Баъди sein сифат бандак намегирад.' },
      { prompt: 'Der Tisch ist ___.', promptTranslated: 'Миз калон аст.', answer: 'groß', options: ['groß', 'große', 'großer', 'großen'], explanation: 'Баъди ist ҳамеша шакли соддаи сифат.' },
      { prompt: 'Das Wasser ist ___.', promptTranslated: 'Об хунук аст.', answer: 'kalt', options: ['kalt', 'kalte', 'kalten', 'kalter'], explanation: 'Бе бандак.' },
      { prompt: 'Mein Zimmer ___ hell.', promptTranslated: 'Ҳуҷраи ман равшан аст.', answer: 'ist', options: ['ist', 'sind', 'bist', 'bin'], explanation: 'Zimmer як чиз аст → ist.' },
      { prompt: 'Die Stühle ___ alt.', promptTranslated: 'Курсиҳо кӯҳнаанд.', answer: 'sind', options: ['sind', 'ist', 'bin', 'bist'], explanation: 'Ҷамъ → sind.' },
      { prompt: 'Das Auto ist ___.', promptTranslated: 'Мошин ифлос аст.', answer: 'schmutzig', options: ['schmutzig', 'schmutzige', 'schmutziger', 'schmutzigen'], explanation: 'Баъди sein — шакли содда.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: nicht und sehr', lessonTitleTranslated: 'Грамматика: nicht ва sehr',
    title: 'nicht und sehr', titleTranslated: 'nicht ва sehr',
    emoji: '❌',
    explanation:
`**nicht** сифатро инкор мекунад ва ҳамеша ПЕШ аз он меистад:

- Das Auto ist **nicht** neu. (Мошин нав НЕСТ.)
- Die Blume ist **nicht** rot.

**sehr** сифатро қавӣ мекунад ва ҳам пеш аз он меистад:

- Das Buch ist **sehr** dick. (Китоб ХЕЛЕ ғафс аст.)
- Der Tee ist **sehr** heiß.

**Фарқи муҳим: nicht ё kein?**

- Барои СИФАТ ҳамеша **nicht**: Das ist **nicht** groß.
- Барои ИСМ **kein**: Das ist **kein** Auto. (Ин мошин нест.)

Хонандаи тоҷик ин ҷо бештар хато мекунад, чунки дар тоҷикӣ ҳарду ҳолат бо як калимаи «нест» ифода мешавад.`,
    rules: [
      { pattern: 'nicht + сифат', note: 'Das Auto ist nicht neu. nicht пеш аз сифат.' },
      { pattern: 'sehr + сифат', note: 'Das Buch ist sehr dick.' },
      { pattern: 'kein + исм', note: 'Das ist kein Auto — барои исм kein, на nicht.' },
      { pattern: 'Тартиб', note: 'исм + ist + nicht/sehr + сифат.' },
    ],
    examples: [
      { sentence: 'Das Auto ist nicht neu.', translation: 'Мошин нав нест.', highlight: 'nicht' },
      { sentence: 'Die Blume ist sehr schön.', translation: 'Гул хеле зебо аст.', highlight: 'sehr' },
      { sentence: 'Das Zimmer ist nicht dunkel.', translation: 'Ҳуҷра торик нест.', highlight: 'nicht' },
      { sentence: 'Der Tee ist sehr heiß.', translation: 'Чой хеле доғ аст.', highlight: 'sehr' },
      { sentence: 'Das ist kein Auto.', translation: 'Ин мошин нест.', highlight: 'kein' },
    ],
    exercises: [
      { prompt: 'Das Auto ist ___ neu.', promptTranslated: 'Мошин нав нест.', answer: 'nicht', options: ['nicht', 'kein', 'keine', 'nein'], explanation: 'Пеш аз СИФАТ ҳамеша nicht.' },
      { prompt: 'Die Blume ist ___ schön.', promptTranslated: 'Гул хеле зебо аст.', answer: 'sehr', options: ['sehr', 'nicht', 'kein', 'viel'], explanation: 'sehr = хеле.' },
      { prompt: 'Das ist ___ Auto.', promptTranslated: 'Ин мошин нест.', answer: 'kein', options: ['kein', 'nicht', 'keine', 'nein'], explanation: 'Пеш аз ИСМ kein.' },
      { prompt: 'Der Tisch ist ___ groß.', promptTranslated: 'Миз калон нест.', answer: 'nicht', options: ['nicht', 'kein', 'keine', 'nein'], explanation: 'groß сифат аст → nicht.' },
      { prompt: 'Das Buch ist ___ dick.', promptTranslated: 'Китоб хеле ғафс аст.', answer: 'sehr', options: ['sehr', 'nicht', 'kein', 'gut'], explanation: 'sehr сифатро қавӣ мекунад.' },
      { prompt: 'Das Zimmer ist ___ sauber.', promptTranslated: 'Ҳуҷра тоза нест.', answer: 'nicht', options: ['nicht', 'kein', 'keine', 'nein'], explanation: 'sauber сифат аст → nicht.' },
      { prompt: 'Das ist ___ Blume.', promptTranslated: 'Ин гул нест.', answer: 'keine', options: ['keine', 'kein', 'nicht', 'nein'], explanation: 'die Blume занона аст → keine.' },
      { prompt: 'Der Stuhl ist ___ alt.', promptTranslated: 'Курсӣ хеле кӯҳна аст.', answer: 'sehr', options: ['sehr', 'kein', 'keine', 'nicht'], explanation: 'sehr = хеле.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Mein Zimmer', lessonTitleTranslated: 'Ҳуҷраи ман',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Mein Zimmer', titleTranslated: 'Ҳуҷраи ман',
    passage: 'Das ist mein Zimmer. Es ist klein, aber hell. Der Tisch ist braun und der Stuhl ist schwarz. Auf dem Tisch ist eine Blume. Sie ist gelb. Mein Buch ist alt, aber sehr gut.',
    passageTranslated: 'Ин ҳуҷраи ман аст. Он хурд, вале равшан аст. Миз қаҳваранг ва курсӣ сиёҳ аст. Дар болои миз як гул ҳаст. Он зард аст. Китоби ман кӯҳна, вале хеле хуб аст.',
    questions: [
      { question: 'Wie ist das Zimmer?', questionTranslated: 'Ҳуҷра чӣ гуна аст?', options: ['Klein und hell', 'Groß und dunkel', 'Groß und hell'], correctIndex: 0, explanation: 'Матн: Es ist klein, aber hell.' },
      { question: 'Welche Farbe hat der Tisch?', questionTranslated: 'Миз кадом ранг дорад?', options: ['Braun', 'Schwarz', 'Gelb'], correctIndex: 0, explanation: 'Матн: Der Tisch ist braun.' },
      { question: 'Welche Farbe hat die Blume?', questionTranslated: 'Гул кадом ранг дорад?', options: ['Gelb', 'Rot', 'Braun'], correctIndex: 0, explanation: 'Матн: Sie ist gelb.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Annas Auto', lessonTitleTranslated: 'Шунавоӣ: Мошини Анна',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Annas Auto', titleTranslated: 'Шунавоӣ: Мошини Анна',
    passage: 'Hallo, ich heiße Anna. Mein Auto ist blau. Es ist nicht neu, aber sehr gut. Es ist auch sauber. Meine Lieblingsfarbe ist grün.',
    passageTranslated: 'Салом, номи ман Анна аст. Мошини ман кабуд аст. Он нав нест, вале хеле хуб аст. Он инчунин тоза аст. Ранги дӯстдоштаи ман сабз аст.',
    questions: [
      { question: 'Welche Farbe hat das Auto?', questionTranslated: 'Мошин кадом ранг дорад?', options: ['Blau', 'Grün', 'Rot'], correctIndex: 0, explanation: 'Матн: Mein Auto ist blau.' },
      { question: 'Ist das Auto neu?', questionTranslated: 'Мошин нав аст?', options: ['Nein', 'Ja', 'Es ist rot'], correctIndex: 0, explanation: 'Матн: Es ist nicht neu.' },
      { question: 'Wie ist das Auto?', questionTranslated: 'Мошин чӣ гуна аст?', options: ['Sauber', 'Schmutzig', 'Klein'], correctIndex: 0, explanation: 'Матн: Es ist auch sauber.' },
      { question: 'Was ist ihre Lieblingsfarbe?', questionTranslated: 'Ранги дӯстдоштаи ӯ кадом аст?', options: ['Grün', 'Blau', 'Gelb'], correctIndex: 0, explanation: 'Матн: Meine Lieblingsfarbe ist grün.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Farben', titleTranslated: 'Такрор: рангҳо',
    passage: 'Wir wiederholen! Nach sein bleibt das Adjektiv immer gleich: Das Auto ist rot, die Blume ist rot, die Bücher sind rot. Für ein Adjektiv sagt man nicht, für ein Nomen kein.',
    passageTranslated: 'Биёед такрор кунем! Баъди sein сифат ҳамеша якхела мемонад: мошин сурх аст, гул сурх аст, китобҳо сурханд. Барои сифат nicht мегӯянд, барои исм kein.',
    questions: [
      { question: 'Ändert sich das Adjektiv nach sein?', questionTranslated: 'Баъди sein сифат тағйир меёбад?', options: ['Nein, nie', 'Ja, immer', 'Nur im Plural'], correctIndex: 0, explanation: 'Матн: bleibt das Adjektiv immer gleich.' },
      { question: 'Was sagt man für ein Nomen?', questionTranslated: 'Барои исм чӣ мегӯянд?', options: ['kein', 'nicht', 'sehr'], correctIndex: 0, explanation: 'Матн: für ein Nomen kein.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Toms Zimmer', titleTranslated: 'Ҳуҷраи Том',
    passage: 'Tom hat ein großes Zimmer. Der Tisch ist weiß und der Stuhl ist grau. Sein Auto ist klein und rot. Das Buch auf dem Tisch ist dick. Das Zimmer ist nicht dunkel, es ist sehr hell.',
    passageTranslated: 'Том ҳуҷраи калон дорад. Миз сафед ва курсӣ хокистарӣ аст. Мошини ӯ хурд ва сурх аст. Китоби болои миз ғафс аст. Ҳуҷра торик нест, он хеле равшан аст.',
    questions: [
      { question: 'Welche Farbe hat der Tisch?', questionTranslated: 'Миз кадом ранг дорад?', options: ['Weiß', 'Grau', 'Rot'], correctIndex: 0, explanation: 'Матн: Der Tisch ist weiß.' },
      { question: 'Welche Farbe hat der Stuhl?', questionTranslated: 'Курсӣ кадом ранг дорад?', options: ['Grau', 'Weiß', 'Rot'], correctIndex: 0, explanation: 'Матн: der Stuhl ist grau.' },
      { question: 'Wie ist das Auto?', questionTranslated: 'Мошин чӣ гуна аст?', options: ['Klein und rot', 'Groß und rot', 'Klein und weiß'], correctIndex: 0, explanation: 'Матн: Sein Auto ist klein und rot.' },
      { question: 'Wie ist das Buch?', questionTranslated: 'Китоб чӣ гуна аст?', options: ['Dick', 'Dünn', 'Neu'], correctIndex: 0, explanation: 'Матн: Das Buch ist dick.' },
      { question: 'Ist das Zimmer dunkel?', questionTranslated: 'Ҳуҷра торик аст?', options: ['Nein, es ist hell', 'Ja, sehr dunkel', 'Ja, ein bisschen'], correctIndex: 0, explanation: 'Матн: Das Zimmer ist nicht dunkel, es ist sehr hell.' },
      { question: '«Das Auto ist nicht neu» — was bedeutet das?', questionTranslated: 'Ин чӣ маъно дорад?', options: ['Мошин нав нест', 'Мошин нав аст', 'Мошин сурх аст'], correctIndex: 0, explanation: 'nicht = не.' },
      { question: 'Welches Wort passt zu einem Nomen?', questionTranslated: 'Кадом калима ба исм мувофиқ аст?', options: ['kein', 'nicht', 'sehr'], correctIndex: 0, explanation: 'kein Auto, вале nicht groß.' },
      { question: '«sehr» — was bedeutet das?', questionTranslated: '«sehr» чӣ маъно дорад?', options: ['хеле', 'не', 'ҳам'], correctIndex: 0, explanation: 'sehr = хеле.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Welche Farbe?', lessonTitleTranslated: 'Муколама: Кадом ранг?',
  title: 'Gespräch über Farben', titleTranslated: 'Муколама дар бораи рангҳо',
  scenario: 'Zwei Freunde sprechen über ein Auto und Farben.', emoji: '🗣️',
  lines: [
    { speaker: 'Person A', text: 'Ist das dein Auto?', translation: 'Ин мошини ту аст?' },
    { speaker: 'Person B', text: 'Ja, das ist mein Auto.', translation: 'Бале, ин мошини ман аст.' },
    { speaker: 'Person A', text: 'Welche Farbe hat es?', translation: 'Он кадом ранг дорад?' },
    { speaker: 'Person B', text: 'Es ist blau.', translation: 'Он кабуд аст.' },
    { speaker: 'Person A', text: 'Ist es neu?', translation: 'Он нав аст?' },
    { speaker: 'Person B', text: 'Nein, es ist nicht neu.', translation: 'Не, он нав нест.' },
    { speaker: 'Person A', text: 'Aber es ist sehr sauber!', translation: 'Вале он хеле тоза аст!' },
    { speaker: 'Person B', text: 'Danke schön!', translation: 'Бисёр ташаккур!' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['rot', 'blau', 'grün', 'grau', 'kalt', 'das Auto', 'die Farbe', 'hell'],
};

export const ORDER = [
  'vocab:Grundfarben',
  'vocab:Weitere Farben',
  'vocab:Groß oder klein?',
  'vocab:Gut oder schlecht?',
  'vocab:Warm oder kalt?',
  'vocab:Dinge beschreiben',
  'vocab:Welche Farbe?',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
