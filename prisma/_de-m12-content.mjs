export const MODULE = {
  order: 11,
  title: 'Natur, Wetter und Gefühle',
  titleTranslated: 'Табиат, Обу ҳаво ва Эҳсосот',
  icon: '🌳',
  color: 'bg-green-600'
};

export const ORDER = [
  'vocab:Wetter und Jahreszeiten (Обу ҳаво ва Фаслҳо)',
  'vocab:Mehr Wetter',
  'vocab:Natur und Tiere (Табиат ва Ҳайвонот)',
  'vocab:Mehr Tiere',
  'grammar:0',
  'vocab:Gefühle (Эҳсосот)',
  'vocab:Mehr Gefühle',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue:0',
  'writing:0',
  'comprehension:review',
  'comprehension:test',
];

export const VOCAB = [
  {
    title: 'Wetter und Jahreszeiten (Обу ҳаво ва Фаслҳо)',
    words: [
      { word: 'das Wetter', existing: true, translation: 'обу ҳаво', ipa: '/ˈvɛtɐ/', emoji: '🌤️', example: 'Das Wetter ist heute schön.', exampleTrans: 'Обу ҳаво имрӯз зебо аст.' },
      { word: 'die Sonne', existing: true, translation: 'офтоб', ipa: '/ˈzɔnə/', emoji: '☀️', example: 'Die Sonne scheint.', exampleTrans: 'Офтоб медурахшад.' },
      { word: 'der Regen', existing: true, translation: 'борон', ipa: '/ˈʁeːɡən/', emoji: '🌧️', example: 'Der Regen ist kalt.', exampleTrans: 'Борон хунук аст.' },
      { word: 'der Schnee', existing: true, translation: 'барф', ipa: '/ʃneː/', emoji: '❄️', example: 'Ich liebe den Schnee.', exampleTrans: 'Ман барфро дӯст медорам.' },
      { word: 'der Frühling', existing: true, translation: 'баҳор', ipa: '/ˈfʁyːlɪŋ/', emoji: '🌸', example: 'Im Frühling ist es warm.', exampleTrans: 'Дар баҳор ҳаво гарм аст.' },
      { word: 'der Sommer', existing: true, translation: 'тобистон', ipa: '/ˈzɔmɐ/', emoji: '🏖️', example: 'Der Sommer ist heiß.', exampleTrans: 'Тобистон гарм аст.' },
      { word: 'der Herbst', existing: true, translation: 'тирамоҳ', ipa: '/hɛʁpst/', emoji: '🍂', example: 'Im Herbst fallen die Blätter.', exampleTrans: 'Дар тирамоҳ баргҳо мерезанд.' },
      { word: 'der Winter', existing: true, translation: 'зимистон', ipa: '/ˈvɪntɐ/', emoji: '⛄', example: 'Im Winter schneit es.', exampleTrans: 'Дар зимистон барф меборад.' }
    ]
  },
  {
    title: 'Natur und Tiere (Табиат ва Ҳайвонот)',
    words: [
      { word: 'die Natur', existing: true, translation: 'табиат', ipa: '/naˈtuːɐ̯/', emoji: '🌲', example: 'Die Natur ist wunderschön.', exampleTrans: 'Табиат бисёр зебо аст.' },
      { word: 'der Baum', existing: true, translation: 'дарахт', ipa: '/baʊ̯m/', emoji: '🌳', example: 'Das ist ein großer Baum.', exampleTrans: 'Ин як дарахти калон аст.' },
      { word: 'die Blume', existing: true, translation: 'гул', ipa: '/ˈbluːmə/', emoji: '🌷', example: 'Ich kaufe eine rote Blume.', exampleTrans: 'Ман як гули сурх мехарам.' },
      { word: 'das Tier', existing: true, translation: 'ҳайвон', ipa: '/tiːɐ̯/', emoji: '🐾', example: 'Welches Tier magst du?', exampleTrans: 'Кадом ҳайвонро ту дӯст медорӣ?' },
      { word: 'der Hund', existing: true, translation: 'саг', ipa: '/hʊnt/', emoji: '🐶', example: 'Der Hund bellt laut.', exampleTrans: 'Саг баланд аккос мезанад.' },
      { word: 'die Katze', existing: true, translation: 'гурба', ipa: '/ˈkat͡sə/', emoji: '🐱', example: 'Die Katze schläft auf dem Sofa.', exampleTrans: 'Гурба дар болои диван хоб аст.' },
      { word: 'der Vogel', existing: true, translation: 'парранда', ipa: '/ˈfoːɡəl/', emoji: '🐦', example: 'Der Vogel singt am Morgen.', exampleTrans: 'Парранда саҳар мехонад.' },
    ]
  },
  {
    title: 'Gefühle (Эҳсосот)',
    words: [
      { word: 'das Gefühl', existing: true, translation: 'эҳсос', ipa: '/ɡəˈfyːl/', emoji: '❤️', example: 'Das ist ein gutes Gefühl.', exampleTrans: 'Ин як эҳсоси хуб аст.' },
      { word: 'glücklich', existing: true, translation: 'хушбахт', ipa: '/ˈɡlʏklɪç/', emoji: '😊', example: 'Ich bin heute sehr glücklich.', exampleTrans: 'Ман имрӯз хеле хушбахтам.' },
      { word: 'traurig', existing: true, translation: 'ғамгин', ipa: '/ˈtʁaʊ̯ʁɪç/', emoji: '😢', example: 'Warum bist du traurig?', exampleTrans: 'Чаро ту ғамгин ҳастӣ?' },
      { word: 'wütend', existing: true, translation: 'хашмгин', ipa: '/ˈvyːtənt/', emoji: '😠', example: 'Der Lehrer ist wütend.', exampleTrans: 'Муаллим хашмгин аст.' },
      { word: 'überrascht', existing: true, translation: 'ҳайрон', ipa: '/yːbɐˈʁaʃt/', emoji: '😲', example: 'Sie war sehr überrascht.', exampleTrans: 'Вай хеле ҳайрон шуда буд.' },
      { word: 'die Angst', existing: true, translation: 'тарс', ipa: '/aŋst/', emoji: '😨', example: 'Ich habe Angst vor Spinnen.', exampleTrans: 'Ман аз тортанакҳо тарс дорам.' },
      { word: 'lustig', existing: true, translation: 'хандовар', ipa: '/ˈlʊstɪç/', emoji: '😂', example: 'Der Film war sehr lustig.', exampleTrans: 'Филм хеле хандовар буд.' },
      { word: 'langweilig', existing: true, translation: 'дилгиркунанда', ipa: '/ˈlaŋˌvaɪ̯lɪç/', emoji: '🥱', example: 'Das Buch ist langweilig.', exampleTrans: 'Китоб дилгиркунанда аст.' }
    ]
  },
  {
    title: 'Mehr Wetter',
    words: [
      { word: 'der Wind', translation: 'шамол', emoji: '💨', ipa: '/deːɐ̯ vɪnt/',
        example: 'Der Wind ist stark.', exampleTrans: 'Шамол сахт аст.' },
      { word: 'die Wolke', translation: 'абр', emoji: '☁️', ipa: '/diː ˈvɔlkə/',
        example: 'Die Wolke ist groß.', exampleTrans: 'Абр калон аст.' },
      { word: 'das Gewitter', translation: 'раъду барқ', emoji: '⛈️', ipa: '/das ɡəˈvɪtɐ/',
        example: 'Am Abend gibt es ein Gewitter.', exampleTrans: 'Бегоҳ раъду барқ мешавад.' },
      { word: 'der Nebel', translation: 'туман', emoji: '🌫️', ipa: '/deːɐ̯ ˈneːbəl/',
        example: 'Am Morgen ist Nebel.', exampleTrans: 'Саҳар туман аст.' },
      { word: 'das Eis', translation: 'ях', emoji: '🧊', ipa: '/das aɪ̯s/',
        example: 'Im Winter gibt es Eis.', exampleTrans: 'Дар зимистон ях мешавад.' },
      { word: 'der Himmel', translation: 'осмон', emoji: '🌤️', ipa: '/deːɐ̯ ˈhɪməl/',
        example: 'Der Himmel ist blau.', exampleTrans: 'Осмон кабуд аст.' },
    ],
  },
  {
    title: 'Mehr Tiere',
    words: [
      { word: 'das Pferd', translation: 'асп', emoji: '🐴', ipa: '/das pfeːɐ̯t/',
        example: 'Das Pferd ist schnell.', exampleTrans: 'Асп тез аст.' },
      { word: 'die Kuh', translation: 'гов', emoji: '🐄', ipa: '/diː kuː/',
        example: 'Die Kuh gibt Milch.', exampleTrans: 'Гов шир медиҳад.' },
      { word: 'das Schaf', translation: 'гӯсфанд', emoji: '🐑', ipa: '/das ʃaːf/',
        example: 'Das Schaf ist weiß.', exampleTrans: 'Гӯсфанд сафед аст.' },
      { word: 'die Maus', translation: 'муш', emoji: '🐭', ipa: '/diː maʊ̯s/',
        example: 'Die Maus ist klein.', exampleTrans: 'Муш хурд аст.' },
      { word: 'der Bär', translation: 'хирс', emoji: '🐻', ipa: '/deːɐ̯ bɛːɐ̯/',
        example: 'Der Bär lebt im Wald.', exampleTrans: 'Хирс дар ҷангал зиндагӣ мекунад.' },
      { word: 'der Löwe', translation: 'шер', emoji: '🦁', ipa: '/deːɐ̯ ˈløːvə/',
        example: 'Der Löwe ist stark.', exampleTrans: 'Шер пурзӯр аст.' },
    ],
  },
  {
    title: 'Mehr Gefühle',
    words: [
      { word: 'froh', translation: 'шод', emoji: '😀', ipa: '/fʁoː/',
        example: 'Ich bin froh.', exampleTrans: 'Ман шодам.' },
      { word: 'nervös', translation: 'асабӣ', emoji: '😬', ipa: '/nɛʁˈvøːs/',
        example: 'Vor der Prüfung bin ich nervös.', exampleTrans: 'Пеш аз имтиҳон ман асабӣ мешавам.' },
      { word: 'zufrieden', translation: 'қаноатманд', emoji: '🙂', ipa: '/t͡suˈfʁiːdən/',
        example: 'Der Chef ist zufrieden.', exampleTrans: 'Сардор қаноатманд аст.' },
      { word: 'stolz', translation: 'ифтихорманд', emoji: '🦚', ipa: '/ʃtɔlt͡s/',
        example: 'Meine Mutter ist stolz.', exampleTrans: 'Модарам ифтихорманд аст.' },
      { word: 'einsam', translation: 'танҳо', emoji: '😔', ipa: '/ˈaɪ̯nzaːm/',
        example: 'Am Abend ist er einsam.', exampleTrans: 'Бегоҳ ӯ танҳо мешавад.' },
      { word: 'aufgeregt', translation: 'ҳаяҷонзада', emoji: '😲', ipa: '/ˈaʊ̯fɡəˌʁeːkt/',
        example: 'Die Kinder sind aufgeregt.', exampleTrans: 'Кӯдакон ҳаяҷонзадаанд.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Perfekt mit haben (Замони гузашта)',
    lessonTitleTranslated: 'Замони гузашта бо «haben»',
    emoji: '⏪',
    title: 'Perfekt: Замони гузашта бо "haben"',
    explanation:
`Барои гуфтани коре, ки ГУЗАШТААСТ, олмонӣ замони **Perfekt**-ро истифода мебарад. Он аз **ду** қисм иборат аст:

> **haben** (тағйирёбанда) + **Partizip II** (бетағйир, дар ОХИР)

- Ich **habe** Musik **gehört**. (Ман мусиқӣ гӯш кардам.)
- Du **hast** viel **gearbeitet**. (Ту бисёр кор кардӣ.)
- Er **hat** einen Baum **gesehen**. (Ӯ як дарахтро дид.)

**Тасрифи haben:** ich habe · du hast · er/sie/es hat · wir haben · ihr habt · sie/Sie haben

**Partizip II чӣ тавр сохта мешавад:**
- Феълҳои муқаррарӣ: **ge-** + реша + **-t** → hören → **ge**hör**t**, machen → **ge**mach**t**
- Феълҳои номунтазам: **ge-** + реша + **-en** (бо тағйири садонок) → sehen → **ge**seh**en**, essen → **ge**gess**en**

**Доми асосии тоҷик:** мо мегӯем «ман мусиқӣ гӯш кардам» — феъл дар мобайн. Дар олмонӣ қисми маънодор (gehört) ба ОХИРИ ҷумла меравад ва то он ҷо маълум нест, ки чӣ шуд. Ҷумла ҳамеша то ОХИР гӯш карда мешавад.

Аксарияти феълҳо маҳз **haben** мегиранд.`,
    rules: [
      { pattern: 'haben + Partizip II (охир)', note: 'Ich habe … gehört. Partizip ҳамеша дар охири ҷумла.' },
      { pattern: 'Муқаррарӣ: ge + реша + t', note: 'machen → gemacht · hören → gehört · kaufen → gekauft.' },
      { pattern: 'Номунтазам: ge + реша + en', note: 'sehen → gesehen · essen → gegessen · trinken → getrunken.' },
      { pattern: 'haben тағйир меёбад', note: 'ich habe, du hast, er hat, wir/sie/Sie haben, ihr habt.' },
    ],
    examples: [
      { sentence: 'Ich habe Musik gehört.', translation: 'Ман мусиқӣ гӯш кардам.', highlight: 'habe ... gehört' },
      { sentence: 'Du hast viel gearbeitet.', translation: 'Ту бисёр кор кардӣ.', highlight: 'hast ... gearbeitet' },
      { sentence: 'Er hat einen Baum gesehen.', translation: 'Ӯ як дарахтро дид.', highlight: 'hat ... gesehen' },
      { sentence: 'Wir haben ein Picknick gemacht.', translation: 'Мо пикник доштем.', highlight: 'haben ... gemacht' },
      { sentence: 'Sie hat Tee getrunken.', translation: 'Вай чой нӯшид.', highlight: 'hat ... getrunken' },
      { sentence: 'Die Sonne hat geschienen.', translation: 'Офтоб медурахшид.', highlight: 'hat geschienen' },
    ],
    exercises: [
      { prompt: 'Ich ___ Musik gehört.', promptTranslated: 'Ман мусиқӣ гӯш кардам.', options: ['habe', 'bin', 'hat', 'hast'], answer: 'habe', explanation: 'Барои «ich» — habe.' },
      { prompt: 'Du ___ viel gearbeitet.', promptTranslated: 'Ту бисёр кор кардӣ.', options: ['hast', 'habe', 'hat', 'bist'], answer: 'hast', explanation: 'Барои «du» — hast.' },
      { prompt: 'machen → Partizip II?', promptTranslated: 'Шакли Partizip II-и «machen» кадом аст?', options: ['gemacht', 'gemachen', 'machte', 'gemache'], answer: 'gemacht', explanation: 'Феъли муқаррарӣ: ge + mach + t.' },
      { prompt: 'sehen → Partizip II?', promptTranslated: 'Шакли Partizip II-и «sehen» кадом аст?', options: ['gesehen', 'geseht', 'gesiehen', 'sah'], answer: 'gesehen', explanation: 'Феъли номунтазам: ge + seh + en.' },
      { prompt: 'Wir ___ ein Picknick gemacht.', promptTranslated: 'Мо пикник доштем.', options: ['haben', 'sind', 'hat', 'habt'], answer: 'haben', explanation: 'Барои «wir» — haben.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', options: ['Ich habe Tee getrunken.', 'Ich habe getrunken Tee.', 'Ich getrunken habe Tee.', 'Ich habe Tee trinken.'], answer: 'Ich habe Tee getrunken.', explanation: 'Partizip II ҳамеша дар ОХИРИ ҷумла меистад.' },
    ],
  },
  {
    lessonTitle: 'Perfekt mit sein (Феълҳои ҳаракат)',
    lessonTitleTranslated: 'Замони гузашта бо «sein»',
    emoji: '🚶',
    title: 'Perfekt: Замони гузашта бо "sein"',
    explanation:
`Як гурӯҳи хурди феълҳо дар Perfekt на **haben**, балки **sein** мегиранд. Инҳо феълҳои **ҲАРАКАТ** ва **ТАҒЙИРИ ҳолат** ҳастанд:

- gehen (рафтан) → Ich **bin** nach Hause **gegangen**.
- fahren (савора рафтан) → Sie **ist** in den Park **gefahren**.
- kommen (омадан) → Wir **sind** spät **gekommen**.
- laufen (давидан) → Der Hund **ist** **gelaufen**.
- bleiben (мондан) ва sein (будан) ҳам ба ин гурӯҳ дохиланд.

**Тасрифи sein:** ich bin · du bist · er/sie/es ist · wir sind · ihr seid · sie/Sie sind

**Чӣ тавр фарқ кардан:** агар феъл ҷои А-ро ба ҷои Б иваз кунад — **sein**. Агар не — **haben**.

| ҳаракат ҳаст → sein | ҳаракат нест → haben |
|---|---|
| Ich **bin** gefahren. | Ich **habe** gearbeitet. |
| Er **ist** gekommen. | Er **hat** gegessen. |

**Доми тоҷик:** дар тоҷикӣ ҳарду як хел сохта мешавад — «рафтам», «кор кардам». Дар олмонӣ бошад, интихоби нодурусти ёридиҳанда фавран хато ҳис мешавад: ❌ *Ich habe gegangen.* → ✅ **Ich bin gegangen.**`,
    rules: [
      { pattern: 'sein + Partizip II', note: 'Ich bin gegangen. Partizip боз дар охири ҷумла.' },
      { pattern: 'Феълҳои ҲАРАКАТ → sein', note: 'gehen, fahren, kommen, laufen, fliegen.' },
      { pattern: 'bleiben ва sein ҳам → sein', note: 'Ich bin zu Hause geblieben. Ich bin krank gewesen.' },
      { pattern: 'Боқӣ ҳама → haben', note: 'Агар ҷои худро иваз накунад — haben.' },
    ],
    examples: [
      { sentence: 'Ich bin nach Hause gegangen.', translation: 'Ман ба хона рафтам.', highlight: 'bin ... gegangen' },
      { sentence: 'Sie ist in den Park gefahren.', translation: 'Вай ба боғ рафт.', highlight: 'ist ... gefahren' },
      { sentence: 'Wir sind spät gekommen.', translation: 'Мо дер омадем.', highlight: 'sind ... gekommen' },
      { sentence: 'Der Hund ist im Wald gelaufen.', translation: 'Саг дар ҷангал давид.', highlight: 'ist ... gelaufen' },
      { sentence: 'Ich bin zu Hause geblieben.', translation: 'Ман дар хона мондам.', highlight: 'bin ... geblieben' },
      { sentence: 'Das Flugzeug ist schnell geflogen.', translation: 'Ҳавопаймо тез парвоз кард.', highlight: 'ist ... geflogen' },
    ],
    exercises: [
      { prompt: 'Ich ___ nach Hause gegangen.', promptTranslated: 'Ман ба хона рафтам.', options: ['bin', 'habe', 'ist', 'bist'], answer: 'bin', explanation: 'gehen феъли ҳаракат аст → sein; барои «ich» — bin.' },
      { prompt: 'Sie ___ in den Park gefahren.', promptTranslated: 'Вай ба боғ рафт.', options: ['ist', 'hat', 'bin', 'sind'], answer: 'ist', explanation: 'fahren = ҳаракат → sein; барои «sie» — ist.' },
      { prompt: 'Wir ___ spät gekommen.', promptTranslated: 'Мо дер омадем.', options: ['sind', 'haben', 'ist', 'seid'], answer: 'sind', explanation: 'kommen = ҳаракат → sein; барои «wir» — sind.' },
      { prompt: 'Ich ___ Musik gehört.', promptTranslated: 'Ман мусиқӣ гӯш кардам.', options: ['habe', 'bin', 'ist', 'hast'], answer: 'habe', explanation: 'hören ҳаракат НЕСТ → haben.' },
      { prompt: 'Der Hund ___ im Wald gelaufen.', promptTranslated: 'Саг дар ҷангал давид.', options: ['ist', 'hat', 'bin', 'sind'], answer: 'ist', explanation: 'laufen = ҳаракат → sein.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', options: ['Ich bin nach Hause gefahren.', 'Ich habe nach Hause gefahren.', 'Ich bin nach Hause fahren.', 'Ich habe nach Hause fahre.'], answer: 'Ich bin nach Hause gefahren.', explanation: 'fahren феъли ҳаракат аст → sein + gefahren.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    skillType: 'reading',
    xpReward: 20,
    kind: 'text',
    emoji: '📖',
    lessonTitle: 'Ein Ausflug',
    lessonTitleTranslated: 'Саёҳат',
    title: 'Ein Ausflug in die Natur',
    titleTranslated: 'Саёҳат ба табиат',
    passage: 'Letztes Wochenende war das Wetter sehr schön. Die Sonne hat geschienen und es war warm. Meine Familie und ich sind in den Wald gefahren. Wir haben große Bäume und schöne Blumen gesehen. Mein Hund ist im Wald gelaufen und war sehr glücklich. Wir haben ein Picknick gemacht und leckeres Essen gegessen. Am Nachmittag sind wir wieder nach Hause gefahren. Ich war am Abend sehr müde, aber es war ein toller Tag.',
    passageTranslated: 'Истироҳати гузашта обу ҳаво хеле зебо буд. Офтоб медурахшид ва ҳаво гарм буд. Оилаи ман ва ман ба ҷангал рафтем. Мо дарахтони калон ва гулҳои зеборо дидем. Саги ман дар ҷангал давид ва хеле хушбахт буд. Мо пикник кардем ва хӯроки бомазза хӯрдем. Баъд аз нисфирӯзӣ мо дубора ба хона рафтем. Ман бегоҳ хеле хаста будам, аммо ин ин як рӯзи олӣ буд.',
    questions: [
      {
        question: 'Wie war das Wetter am Wochenende?',
        questionTranslated: 'Обу ҳаво дар рӯзҳои истироҳат чӣ гуна буд?',
        options: ['Es hat geregnet.', 'Es war schön und warm.', 'Es hat geschneit.'],
        answer: 'Es war schön und warm.'
      },
      {
        question: 'Wohin ist die Familie gefahren?',
        questionTranslated: 'Оила ба куҷо рафт?',
        options: ['In die Stadt.', 'In den Wald.', 'Ans Meer.'],
        answer: 'In den Wald.'
      },
      {
        question: 'Was hat die Familie gemacht?',
        questionTranslated: 'Оила чӣ кор кард?',
        options: ['Sie haben ein Picknick gemacht.', 'Sie haben ferngesehen.', 'Sie haben eingekauft.'],
        answer: 'Sie haben ein Picknick gemacht.'
      },
      {
        question: 'Wer war sehr glücklich?',
        questionTranslated: 'Кӣ хеле хушбахт буд?',
        options: ['Die Katze.', 'Der Hund.', 'Der Vogel.'],
        answer: 'Der Hund.'
      },
      {
        question: 'Wie hat sich die Person am Abend gefühlt?',
        questionTranslated: 'Шахс бегоҳ худро чӣ гуна ҳис кард?',
        options: ['Sie war wütend.', 'Sie war traurig.', 'Sie war müde.'],
        answer: 'Sie war müde.'
      }
    ]
  },
  {
    slot: 'listening',
    skillType: 'listening',
    xpReward: 20,
    kind: 'audio',
    emoji: '🎧',
    lessonTitle: 'Wetterbericht',
    lessonTitleTranslated: 'Маълумот дар бораи обу ҳаво',
    title: 'Das Wetter für morgen',
    titleTranslated: 'Обу ҳаво барои фардо',
    passage: 'Guten Morgen! Hier ist das Wetter für morgen. Im Norden regnet es viel und es ist kalt. Bringen Sie einen Regenschirm mit! Im Süden scheint die Sonne und es ist sehr warm, perfekt für einen Ausflug. Im Westen gibt es starken Wind und im Osten schneit es ein bisschen am Abend. Bitte fahren Sie vorsichtig!',
    passageTranslated: 'Субҳ ба хайр! Ин маълумот дар бораи обу ҳаво барои фардост. Дар шимол борони зиёд меборад ва хунук аст. Бо худ чатр гиред! Дар ҷануб офтоб медурахшад ва ҳаво хеле гарм аст, ки барои саёҳат беҳтарин аст. Дар ғарб шамоли сахт мевазад ва дар шарқ бегоҳӣ каме барф меборад. Лутфан, боэҳтиёт мошин ронед!',
    questions: [
      {
        question: 'Wie ist das Wetter im Norden?',
        questionTranslated: 'Обу ҳаво дар шимол чӣ гуна аст?',
        options: ['Es regnet und ist kalt.', 'Es schneit.', 'Die Sonne scheint.'],
        answer: 'Es regnet und ist kalt.'
      },
      {
        question: 'Wo scheint die Sonne?',
        questionTranslated: 'Офтоб дар куҷо медурахшад?',
        options: ['Im Westen.', 'Im Süden.', 'Im Osten.'],
        answer: 'Im Süden.'
      },
      {
        question: 'Was passiert im Westen?',
        questionTranslated: 'Дар ғарб чӣ мешавад?',
        options: ['Es ist sehr warm.', 'Es schneit.', 'Es gibt starken Wind.'],
        answer: 'Es gibt starken Wind.'
      },
      {
        question: 'Wann schneit es im Osten?',
        questionTranslated: 'Дар шарқ кай барф меборад?',
        options: ['Am Morgen.', 'Am Nachmittag.', 'Am Abend.'],
        answer: 'Am Abend.'
      }
    ]
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Das Perfekt', titleTranslated: 'Такрор: Замони гузашта',
    passage: 'Im Perfekt brauchst du zwei Teile: "haben" oder "sein" und das Partizip. Die meisten Verben nehmen haben: Ich habe Musik gehört. Verben der Bewegung nehmen sein: Ich bin nach Hause gefahren. Das Partizip steht immer am Ende vom Satz.',
    passageTranslated: 'Дар Perfekt ба ту ду қисм лозим аст: «haben» ё «sein» ва сифати феълӣ (Partizip). Аксари феълҳо «haben» мегиранд: Ich habe Musik gehört. Феълҳои ҲАРАКАТ «sein» мегиранд: Ich bin nach Hause gefahren. Partizip ҳамеша дар ОХИРИ ҷумла меистад.',
    questions: [
      { question: 'Welches Verb nehmen Verben der Bewegung im Perfekt?', questionTranslated: 'Феълҳои ҳаракат дар Perfekt кадом феълро мегиранд?', options: ['sein', 'haben', 'werden'], correctIndex: 0, explanation: 'Матн: Verben der Bewegung nehmen sein.' },
      { question: 'Wo steht das Partizip im Satz?', questionTranslated: 'Partizip дар ҷумла дар куҷо меистад?', options: ['Am Ende', 'Am Anfang', 'Nach dem Subjekt'], correctIndex: 0, explanation: 'Матн: Das Partizip steht immer am Ende vom Satz.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Saras Wochenende', titleTranslated: 'Истироҳати Сара',
    passage: 'Am Wochenende war das Wetter schön. Die Sonne hat geschienen und es war warm. Sara ist mit dem Hund in den Park gegangen. Dort hat sie viele Bäume und Blumen gesehen. Ein Vogel hat laut gesungen. Sara war sehr glücklich. Am Abend hat es geregnet und Sara ist nach Hause gefahren. Sie war müde, aber nicht traurig.',
    passageTranslated: 'Дар рӯзҳои истироҳат обу ҳаво хуб буд. Офтоб медурахшид ва гарм буд. Сара бо саг ба боғ рафт. Дар он ҷо ӯ бисёр дарахтону гулҳоро дид. Як парранда баланд суруд хонд. Сара хеле хушбахт буд. Бегоҳ борон борид ва Сара ба хона рафт. Ӯ хаста буд, вале ғамгин не.',
    questions: [
      { question: 'Wie war das Wetter am Wochenende?', questionTranslated: 'Дар рӯзҳои истироҳат обу ҳаво чӣ гуна буд?', options: ['Schön und warm', 'Kalt', 'Es hat geschneit'], correctIndex: 0, explanation: 'Матн: Am Wochenende war das Wetter schön … es war warm.' },
      { question: 'Mit wem ist Sara in den Park gegangen?', questionTranslated: 'Сара бо кӣ ба боғ рафт?', options: ['Mit dem Hund', 'Mit der Katze', 'Mit dem Vogel'], correctIndex: 0, explanation: 'Матн: Sara ist mit dem Hund in den Park gegangen.' },
      { question: 'Was hat Sara im Park gesehen?', questionTranslated: 'Сара дар боғ чӣ дид?', options: ['Bäume und Blumen', 'Nur Schnee', 'Nur Autos'], correctIndex: 0, explanation: 'Матн: Dort hat sie viele Bäume und Blumen gesehen.' },
      { question: 'Was hat der Vogel gemacht?', questionTranslated: 'Парранда чӣ кор кард?', options: ['Er hat laut gesungen', 'Er hat geschlafen', 'Er ist gefahren'], correctIndex: 0, explanation: 'Матн: Ein Vogel hat laut gesungen.' },
      { question: 'Wie war Sara im Park?', questionTranslated: 'Сара дар боғ чӣ ҳол дошт?', options: ['Glücklich', 'Traurig', 'Wütend'], correctIndex: 0, explanation: 'Матн: Sara war sehr glücklich.' },
      { question: 'Was ist am Abend passiert?', questionTranslated: 'Бегоҳ чӣ шуд?', options: ['Es hat geregnet', 'Es hat geschneit', 'Die Sonne hat geschienen'], correctIndex: 0, explanation: 'Матн: Am Abend hat es geregnet.' },
      { question: 'Wie ist der Abend für Sara zu Ende gegangen?', questionTranslated: 'Бегоҳии Сара чӣ гуна тамом шуд?', options: ['Sie ist nach Hause gefahren', 'Sie ist im Park geblieben', 'Sie ist ins Restaurant gegangen'], correctIndex: 0, explanation: 'Матн: Sara ist nach Hause gefahren.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich bin nach Hause gefahren.', 'Ich habe nach Hause gefahren.', 'Ich bin nach Hause fahren.'], correctIndex: 0, explanation: '"fahren" феъли ҳаракат аст → бо "sein" ва Partizip "gefahren".' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Wie war das Wochenende? (Истироҳат чӣ гуна гузашт?)',
  lessonTitleTranslated: 'Истироҳати ту чӣ гуна гузашт?',
  title: 'Ein Gespräch über das Wochenende',
  titleTranslated: 'Сӯҳбат дар бораи истироҳат',
  emoji: '🗣️',
  lines: [
    { speaker: 'Anna', text: 'Hallo Lukas! Wie war dein Wochenende?', translation: 'Салом Лукас! Истироҳати ту чӣ гуна гузашт?' },
    { speaker: 'Lukas', text: 'Hallo Anna! Es war toll. Ich bin ans Meer gefahren.', translation: 'Салом Анна! Олӣ буд. Ман ба назди баҳр рафтам.' },
    { speaker: 'Anna', text: 'Oh, wie schön! Wie war das Wetter dort?', translation: 'Оҳ, чӣ зебо! Обу ҳаво он ҷо чӣ гуна буд?' },
    { speaker: 'Lukas', text: 'Das Wetter war fantastisch. Die Sonne hat geschienen und es war sehr warm.', translation: 'Обу ҳаво афсонавӣ буд. Офтоб медурахшид ва ҳаво хеле гарм буд.' },
    { speaker: 'Anna', text: 'Was hast du gemacht?', translation: 'Ту чӣ кор кардӣ?' },
    { speaker: 'Lukas', text: 'Ich habe im Wasser gespielt und Pizza gegessen. Und du?', translation: 'Ман дар об бозӣ кардам ва питса хӯрдам. Ва ту?' },
    { speaker: 'Anna', text: 'Ich bin zu Hause geblieben. Es hat geregnet.', translation: 'Ман дар хона мондам. Борон меборид.' },
    { speaker: 'Lukas', text: 'Oh, das ist schade. Warst du traurig?', translation: 'Оҳ, афсӯс. Ту ғамгин будӣ?' },
    { speaker: 'Anna', text: 'Nein, es war sehr gemütlich. Ich habe ein Buch gelesen.', translation: 'Не, хеле роҳат буд. Ман як китоб хондам.' },
    { speaker: 'Lukas', text: 'Das klingt auch gut!', translation: 'Ин ҳам хуб садо медиҳад!' }
  ]
};

export const WRITING = {
  title: 'Schreiben üben',
  titleTranslated: 'Машқи навиштан',
  emoji: '✍️',
  copyOf: [
    'das Wetter',
    'die Natur',
    'das Gefühl',
    'der Sommer',
    'der Regen',
    'der Hund',
    'glücklich',
    'traurig'
  ]
};
