// Модули 15-и олмонӣ (тартиби 14) — «Reisen und Urlaub».
//
// Мавзӯи ҳатмии A1: сафар, меҳмонхона, кишвар ва табиат; грамматика —
// замони гузаштаи sein/haben (war/hatte) ва «Wo? — in + Dativ».
export const MODULE = {
  order: 14,
  title: 'Reisen und Urlaub',
  titleTranslated: 'Сафар ва рухсатӣ',
  icon: '✈️',
  color: 'bg-sky-600',
};

export const ORDER = [
  'vocab:Die Reise',
  'vocab:Unterwegs',
  'vocab:Im Hotel',
  'vocab:Länder und Sprachen',
  'vocab:Am Meer und in den Bergen',
  'vocab:Im Urlaub',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];

export const VOCAB = [
  {
    title: 'Die Reise',
    words: [
      { word: 'die Reise', translation: 'сафар', emoji: '🧳', ipa: '/diː ˈʁaɪ̯zə/',
        example: 'Die Reise war lang.', exampleTrans: 'Сафар дароз буд.' },
      { word: 'das Ticket', translation: 'чиптаи сафар', emoji: '🎫', ipa: '/das ˈtɪkɛt/',
        example: 'Ich kaufe ein Ticket.', exampleTrans: 'Ман як чипта мехарам.' },
      { word: 'der Koffer', translation: 'ҷомадон', emoji: '🧳', ipa: '/deːɐ̯ ˈkɔfɐ/',
        example: 'Mein Koffer ist schwer.', exampleTrans: 'Ҷомадони ман вазнин аст.' },
      { word: 'der Pass', translation: 'шиноснома', emoji: '🛂', ipa: '/deːɐ̯ pas/',
        example: 'Wo ist mein Pass?', exampleTrans: 'Шинoсномаи ман куҷост?' },
      { word: 'das Visum', translation: 'раводид (виза)', emoji: '📑', ipa: '/das ˈviːzʊm/',
        example: 'Ich brauche ein Visum.', exampleTrans: 'Ба ман раводид лозим аст.' },
      { word: 'die Fahrkarte', translation: 'чиптаи поезд', emoji: '🚆', ipa: '/diː ˈfaːɐ̯ˌkaʁtə/',
        example: 'Die Fahrkarte kostet zwanzig Euro.', exampleTrans: 'Чиптаи поезд бист евро арзиш дорад.' },
      { word: 'der Platz', translation: 'ҷой (нишаст)', emoji: '💺', ipa: '/deːɐ̯ plat͡s/',
        example: 'Ist der Platz frei?', exampleTrans: 'Ин ҷой холӣ аст?' },
      { word: 'das Gepäck', translation: 'бор (юк)', emoji: '🎒', ipa: '/das ɡəˈpɛk/',
        example: 'Mein Gepäck ist im Zug.', exampleTrans: 'Бори ман дар поезд аст.' },
    ],
  },
  {
    title: 'Unterwegs',
    words: [
      { word: 'die Ankunft', translation: 'расидан (омад)', emoji: '🛬', ipa: '/diː ˈanˌkʊnft/',
        example: 'Die Ankunft ist um acht Uhr.', exampleTrans: 'Расидан соати ҳашт аст.' },
      { word: 'die Abfahrt', translation: 'ҳаракат (рафтан)', emoji: '🚏', ipa: '/diː ˈapˌfaːɐ̯t/',
        example: 'Die Abfahrt ist um sechs.', exampleTrans: 'Ҳаракат соати шаш аст.' },
      { word: 'der Bahnsteig', translation: 'перрон', emoji: '🚉', ipa: '/deːɐ̯ ˈbaːnʃtaɪ̯k/',
        example: 'Der Zug ist auf Bahnsteig zwei.', exampleTrans: 'Поезд дар перрони дуюм аст.' },
      { word: 'die Haltestelle', translation: 'истгоҳ', emoji: '🚌', ipa: '/diː ˈhaltəˌʃtɛlə/',
        example: 'Die Haltestelle ist dort.', exampleTrans: 'Истгоҳ он ҷост.' },
      { word: 'die Fahrt', translation: 'роҳи сафар', emoji: '🛣️', ipa: '/diː faːɐ̯t/',
        example: 'Die Fahrt dauert zwei Stunden.', exampleTrans: 'Роҳи сафар ду соат давом мекунад.' },
      { word: 'die Grenze', translation: 'сарҳад', emoji: '🚧', ipa: '/diː ˈɡʁɛnt͡sə/',
        example: 'Die Grenze ist weit.', exampleTrans: 'Сарҳад дур аст.' },
      { word: 'der Tourist', translation: 'сайёҳ', emoji: '📸', ipa: '/deːɐ̯ tuˈʁɪst/',
        example: 'Der Tourist fotografiert viel.', exampleTrans: 'Сайёҳ бисёр сурат мегирад.' },
      { word: 'warten', translation: 'интизор шудан', emoji: '⏳', ipa: '/ˈvaʁtən/',
        example: 'Wir warten auf den Zug.', exampleTrans: 'Мо поездро интизорем.' },
    ],
  },
  {
    title: 'Im Hotel',
    words: [
      { word: 'das Einzelzimmer', translation: 'ҳуҷраи якнафара', emoji: '🛏️', ipa: '/das ˈaɪ̯nt͡səlˌt͡sɪmɐ/',
        example: 'Ich möchte ein Einzelzimmer.', exampleTrans: 'Ман ҳуҷраи якнафара мехоҳам.' },
      { word: 'das Doppelzimmer', translation: 'ҳуҷраи дунафара', emoji: '🛌', ipa: '/das ˈdɔpəlˌt͡sɪmɐ/',
        example: 'Das Doppelzimmer ist groß.', exampleTrans: 'Ҳуҷраи дунафара калон аст.' },
      { word: 'die Rezeption', translation: 'қабулгоҳ', emoji: '🛎️', ipa: '/diː ʁet͡sɛpˈt͡si̯oːn/',
        example: 'Die Rezeption ist unten.', exampleTrans: 'Қабулгоҳ дар поён аст.' },
      { word: 'buchen', translation: 'брон кардан', emoji: '📝', ipa: '/ˈbuːxən/',
        example: 'Ich buche ein Zimmer.', exampleTrans: 'Ман як ҳуҷра фармоиш медиҳам.' },
      { word: 'reservieren', translation: 'банд кардан', emoji: '📌', ipa: '/ʁezɛʁˈviːʁən/',
        example: 'Wir reservieren einen Tisch.', exampleTrans: 'Мо як мизро банд мекунем.' },
      { word: 'bleiben', translation: 'мондан', emoji: '🏨', ipa: '/ˈblaɪ̯bən/',
        example: 'Wir bleiben drei Tage.', exampleTrans: 'Мо се рӯз мемонем.' },
      { word: 'die Dusche', translation: 'душ', emoji: '🚿', ipa: '/diː ˈduːʃə/',
        example: 'Das Zimmer hat eine Dusche.', exampleTrans: 'Ҳуҷра душ дорад.' },
      { word: 'die Aussicht', translation: 'манзара', emoji: '🌅', ipa: '/diː ˈaʊ̯sˌzɪçt/',
        example: 'Die Aussicht ist wunderbar.', exampleTrans: 'Манзара аҷиб аст.' },
    ],
  },
  {
    title: 'Länder und Sprachen',
    words: [
      { word: 'das Land', translation: 'кишвар', emoji: '🗺️', ipa: '/das lant/',
        example: 'Deutschland ist ein schönes Land.', exampleTrans: 'Германия кишвари зебо аст.' },
      { word: 'die Hauptstadt', translation: 'пойтахт', emoji: '🏛️', ipa: '/diː ˈhaʊ̯ptˌʃtat/',
        example: 'Berlin ist die Hauptstadt.', exampleTrans: 'Берлин пойтахт аст.' },
      { word: 'die Sprache', translation: 'забон', emoji: '💬', ipa: '/diː ˈʃpʁaːxə/',
        example: 'Deutsch ist eine schöne Sprache.', exampleTrans: 'Олмонӣ забони зебост.' },
      { word: 'die Welt', translation: 'ҷаҳон', emoji: '🌐', ipa: '/diː vɛlt/',
        example: 'Die Welt ist groß.', exampleTrans: 'Ҷаҳон бузург аст.' },
      { word: 'das Ausland', translation: 'хориҷа', emoji: '🛫', ipa: '/das ˈaʊ̯slant/',
        example: 'Er arbeitet im Ausland.', exampleTrans: 'Ӯ дар хориҷа кор мекунад.' },
      { word: 'die Heimat', translation: 'ватан', emoji: '🏡', ipa: '/diː ˈhaɪ̯maːt/',
        example: 'Tadschikistan ist meine Heimat.', exampleTrans: 'Тоҷикистон ватани ман аст.' },
      { word: 'die Kultur', translation: 'фарҳанг', emoji: '🎎', ipa: '/diː kʊlˈtuːɐ̯/',
        example: 'Die Kultur ist interessant.', exampleTrans: 'Фарҳанг ҷолиб аст.' },
      { word: 'die Reisegruppe', translation: 'гурӯҳи сайёҳон', emoji: '👥', ipa: '/diː ˈʁaɪ̯zəˌɡʁʊpə/',
        example: 'Die Reisegruppe ist klein.', exampleTrans: 'Гурӯҳи сайёҳон хурд аст.' },
    ],
  },
  {
    title: 'Am Meer und in den Bergen',
    words: [
      { word: 'das Meer', translation: 'баҳр', emoji: '🌊', ipa: '/das meːɐ̯/',
        example: 'Das Meer ist blau.', exampleTrans: 'Баҳр кабуд аст.' },
      { word: 'der Berg', translation: 'кӯҳ', emoji: '⛰️', ipa: '/deːɐ̯ bɛʁk/',
        example: 'Der Berg ist sehr hoch.', exampleTrans: 'Кӯҳ хеле баланд аст.' },
      { word: 'der See', translation: 'кӯл', emoji: '🏞️', ipa: '/deːɐ̯ zeː/',
        example: 'Wir schwimmen im See.', exampleTrans: 'Мо дар кӯл шино мекунем.' },
      { word: 'der Strand', translation: 'соҳил', emoji: '🏖️', ipa: '/deːɐ̯ ʃtʁant/',
        example: 'Der Strand ist sauber.', exampleTrans: 'Соҳил тоза аст.' },
      { word: 'der Wald', translation: 'ҷангал', emoji: '🌲', ipa: '/deːɐ̯ valt/',
        example: 'Im Wald ist es ruhig.', exampleTrans: 'Дар ҷангал ором аст.' },
      { word: 'die Insel', translation: 'ҷазира', emoji: '🏝️', ipa: '/diː ˈɪnzəl/',
        example: 'Die Insel ist klein.', exampleTrans: 'Ҷазира хурд аст.' },
      { word: 'der Fluss', translation: 'дарё', emoji: '🏞️', ipa: '/deːɐ̯ flʊs/',
        example: 'Der Fluss ist lang.', exampleTrans: 'Дарё дароз аст.' },
      { word: 'hoch', translation: 'баланд', emoji: '⬆️', ipa: '/hoːx/',
        example: 'Der Berg ist hoch.', exampleTrans: 'Кӯҳ баланд аст.' },
    ],
  },
  {
    title: 'Im Urlaub',
    words: [
      { word: 'fliegen', translation: 'парвоз кардан', emoji: '🛩️', ipa: '/ˈfliːɡən/',
        example: 'Wir fliegen nach Berlin.', exampleTrans: 'Мо ба Берлин парвоз мекунем.' },
      { word: 'ankommen', translation: 'расидан', emoji: '📍', ipa: '/ˈanˌkɔmən/',
        example: 'Wir kommen um acht an.', exampleTrans: 'Мо соати ҳашт мерасем.' },
      { word: 'abfahren', translation: 'ҳаракат кардан', emoji: '🚂', ipa: '/ˈapˌfaːʁən/',
        example: 'Der Zug fährt um sechs ab.', exampleTrans: 'Поезд соати шаш ҳаракат мекунад.' },
      { word: 'packen', translation: 'ҷомадон бастан', emoji: '📦', ipa: '/ˈpakən/',
        example: 'Ich packe meinen Koffer.', exampleTrans: 'Ман ҷомадонамро мебандам.' },
      { word: 'besichtigen', translation: 'тамошо кардан', emoji: '🏯', ipa: '/bəˈzɪçtɪɡən/',
        example: 'Wir besichtigen das Museum.', exampleTrans: 'Мо осорхонаро тамошо мекунем.' },
      { word: 'mieten', translation: 'иҷора гирифтан', emoji: '🔑', ipa: '/ˈmiːtən/',
        example: 'Wir mieten ein Auto.', exampleTrans: 'Мо мошин иҷора мегирем.' },
      { word: 'dauern', translation: 'давом кардан', emoji: '⏱️', ipa: '/ˈdaʊ̯ɐn/',
        example: 'Die Fahrt dauert lange.', exampleTrans: 'Роҳ дер давом мекунад.' },
      { word: 'die Postkarte', translation: 'кортпочта', emoji: '📮', ipa: '/diː ˈpɔstˌkaʁtə/',
        example: 'Ich schreibe eine Postkarte.', exampleTrans: 'Ман як кортпочта менависам.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Es war schön', lessonTitleTranslated: 'Грамматика: Зебо буд',
    title: 'Präteritum: war und hatte', titleTranslated: 'Замони гузашта: war ва hatte',
    emoji: '⏮️',
    explanation:
`Дар бораи гузашта олмонӣ одатан **Perfekt** мегӯяд (Ich habe … gemacht). Вале ду феъл истиснои доимӣ доранд — **sein** ва **haben**. Онҳо ҳамеша дар шакли кӯтоҳи **Präteritum** меоянд.

**sein → war (буд):**
ich **war** · du **warst** · er/sie/es **war** · wir **waren** · ihr **wart** · sie/Sie **waren**

- Der Urlaub **war** schön. (Рухсатӣ зебо буд.)
- Wir **waren** am Meer. (Мо дар соҳили баҳр будем.)

**haben → hatte (дошт):**
ich **hatte** · du **hattest** · er/sie/es **hatte** · wir **hatten** · ihr **hattet** · sie/Sie **hatten**

- Ich **hatte** kein Ticket. (Ман чипта надоштам.)
- **Hattest** du Urlaub?

**Чаро ин муҳим аст:** «Ich bin gewesen» ва «Ich habe gehabt» аз ҷиҳати грамматика дуруст, вале ҳеҷ кас чунин намегӯяд. Олмонӣ дар ин ду феъл ҳамеша **war** ва **hatte** мегӯяд.

**Диққат — ich ва er боз якхелаанд:** ich war / er war · ich hatte / er hatte.

**Саволи маъмул баъди сафар:**
- **Wie war** dein Urlaub? — Er **war** wunderbar!`,
    rules: [
      { pattern: 'sein → war', note: 'ich/er war · du warst · wir/sie waren · ihr wart.' },
      { pattern: 'haben → hatte', note: 'ich/er hatte · du hattest · wir/sie hatten · ihr hattet.' },
      { pattern: 'ich ва er якхела', note: 'ich war / er war · ich hatte / er hatte.' },
      { pattern: 'Perfekt барои инҳо гуфта намешавад', note: '«Ich bin gewesen» дуруст, вале зинда нест — war бигӯед.' },
    ],
    examples: [
      { sentence: 'Der Urlaub war schön.', translation: 'Рухсатӣ зебо буд.', highlight: 'war' },
      { sentence: 'Wir waren am Meer.', translation: 'Мо дар соҳили баҳр будем.', highlight: 'waren' },
      { sentence: 'Wie war deine Reise?', translation: 'Сафари ту чӣ гуна буд?', highlight: 'war' },
      { sentence: 'Ich hatte kein Ticket.', translation: 'Ман чипта надоштам.', highlight: 'hatte' },
      { sentence: 'Hattest du Urlaub im Juli?', translation: 'Ту дар моҳи июл рухсатӣ доштӣ?', highlight: 'Hattest' },
      { sentence: 'Das Hotel war sehr gut.', translation: 'Меҳмонхона хеле хуб буд.', highlight: 'war' },
    ],
    exercises: [
      { prompt: 'Der Urlaub ___ schön. (sein, гузашта)', promptTranslated: 'Рухсатӣ зебо буд.', answer: 'war', options: ['war', 'warst', 'waren', 'wart'], explanation: 'der Urlaub → war.' },
      { prompt: 'Wir ___ am Meer. (sein, гузашта)', promptTranslated: 'Мо дар соҳили баҳр будем.', answer: 'waren', options: ['waren', 'war', 'warst', 'wart'], explanation: 'wir → waren.' },
      { prompt: 'Ich ___ kein Ticket. (haben, гузашта)', promptTranslated: 'Ман чипта надоштам.', answer: 'hatte', options: ['hatte', 'hattest', 'hatten', 'hattet'], explanation: 'ich → hatte.' },
      { prompt: '___ du Urlaub? (haben, гузашта)', promptTranslated: 'Ту рухсатӣ доштӣ?', answer: 'Hattest', options: ['Hattest', 'Hatte', 'Hatten', 'Hattet'], explanation: 'du → hattest.' },
      { prompt: 'Wie ___ deine Reise? (sein, гузашта)', promptTranslated: 'Сафари ту чӣ гуна буд?', answer: 'war', options: ['war', 'warst', 'waren', 'ist'], explanation: 'deine Reise → war.' },
      { prompt: 'Кадомашро олмонӣ ЗИНДА мегӯяд?', promptTranslated: 'Кадом ҷумларо олмонҳо воқеан мегӯянд?', answer: 'Ich war in Berlin.', options: ['Ich war in Berlin.', 'Ich bin in Berlin gewesen.', 'Ich habe in Berlin gewesen.', 'Ich bin in Berlin war.'], explanation: 'Барои sein ҳамеша war гуфта мешавад.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Wo warst du?', lessonTitleTranslated: 'Грамматика: Ту дар куҷо будӣ?',
    title: 'Wo? — in + Dativ und Ländernamen', titleTranslated: 'Дар куҷо? — in + Dativ ва номи кишварҳо',
    emoji: '📍',
    explanation:
`Саволи **Wo?** (дар куҷо?) ҳаракат надорад ва **Dativ** мегирад.

| ҷинс | Wo? (Dativ) | кӯтоҳшуда |
|---|---|---|
| der Wald | in **dem** Wald | **im** Wald |
| das Hotel | in **dem** Hotel | **im** Hotel |
| die Stadt | in **der** Stadt | — |

- Ich bin **im** Hotel. (Ман дар меҳмонхона ҳастам.)
- Wir sind **in der** Stadt.
- Die Kinder spielen **am** Strand. (an dem = **am**)

**Номи кишварҳо — қоидаи алоҳида:**

| савол | шакл | мисол |
|---|---|---|
| Wo? (дар куҷо) | **in** | Ich bin **in** Deutschland. |
| Wohin? (ба куҷо) | **nach** | Ich fliege **nach** Deutschland. |
| Woher? (аз куҷо) | **aus** | Ich komme **aus** Tadschikistan. |

Аксари кишварҳо артикл надоранд, бинобар ин ҳамагӣ ҳамин се калима — in / nach / aus — кифоя аст.

**Истисно:** чанд кишвар артикл доранд ва он гоҳ шакл дигар мешавад:
> **die** Schweiz → Ich fahre **in die** Schweiz. Ich bin **in der** Schweiz.
> **die** Türkei → Ich fliege **in die** Türkei.

**Доми тоҷик:** дар тоҷикӣ ҳамааш «ба/дар Олмон» аст. Дар олмонӣ бошад ҳаракат ва ҷойгиршавӣ ду калимаи гуногун мегиранд: **nach** Deutschland (рафтан) ↔ **in** Deutschland (будан).`,
    rules: [
      { pattern: 'Wo? → in + Dativ', note: 'im Hotel, im Wald, in der Stadt.' },
      { pattern: 'in dem → im · an dem → am', note: 'im Hotel, am Strand, am Meer.' },
      { pattern: 'Кишвар: nach (ба) ↔ in (дар)', note: 'Ich fliege nach Deutschland. Ich bin in Deutschland.' },
      { pattern: 'Истисно: die Schweiz, die Türkei', note: 'in die Schweiz (ба) · in der Schweiz (дар).' },
    ],
    examples: [
      { sentence: 'Ich bin im Hotel.', translation: 'Ман дар меҳмонхона ҳастам.', highlight: 'im' },
      { sentence: 'Wir sind in der Stadt.', translation: 'Мо дар шаҳр ҳастем.', highlight: 'in der' },
      { sentence: 'Die Kinder spielen am Strand.', translation: 'Кӯдакон дар соҳил бозӣ мекунанд.', highlight: 'am' },
      { sentence: 'Ich fliege nach Deutschland.', translation: 'Ман ба Германия парвоз мекунам.', highlight: 'nach' },
      { sentence: 'Ich bin in Deutschland.', translation: 'Ман дар Германия ҳастам.', highlight: 'in' },
      { sentence: 'Ich komme aus Tadschikistan.', translation: 'Ман аз Тоҷикистон ҳастам.', highlight: 'aus' },
    ],
    exercises: [
      { prompt: 'Ich bin ___ Hotel. (das Hotel, дар куҷо)', promptTranslated: 'Ман дар меҳмонхона ҳастам.', answer: 'im', options: ['im', 'ins', 'in den', 'in die'], explanation: 'Бе ҳаракат → Dativ: in dem = im.' },
      { prompt: 'Wir sind ___ Stadt. (die Stadt)', promptTranslated: 'Мо дар шаҳр ҳастем.', answer: 'in der', options: ['in der', 'in die', 'im', 'in den'], explanation: 'die Stadt → Dativ: in der Stadt.' },
      { prompt: 'Ich fliege ___ Deutschland.', promptTranslated: 'Ман ба Германия парвоз мекунам.', answer: 'nach', options: ['nach', 'in', 'aus', 'zu'], explanation: 'Ба кишвар → nach.' },
      { prompt: 'Ich bin ___ Deutschland.', promptTranslated: 'Ман дар Германия ҳастам.', answer: 'in', options: ['in', 'nach', 'aus', 'im'], explanation: 'Дар кишвар → in.' },
      { prompt: 'Ich komme ___ Tadschikistan.', promptTranslated: 'Ман аз Тоҷикистон ҳастам.', answer: 'aus', options: ['aus', 'nach', 'in', 'von'], explanation: 'Аз кишвар → aus.' },
      { prompt: 'Die Kinder spielen ___ Strand. (der Strand)', promptTranslated: 'Кӯдакон дар соҳил бозӣ мекунанд.', answer: 'am', options: ['am', 'ans', 'an die', 'an der'], explanation: 'an dem = am (бе ҳаракат).' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Lesen: Urlaub am Meer', lessonTitleTranslated: 'Хониш: Рухсатӣ дар соҳили баҳр',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Eine Reise ans Meer', titleTranslated: 'Сафар ба соҳили баҳр',
    passage: 'Im Juli hatte Familie Weber Urlaub. Sie packten die Koffer und fuhren mit dem Zug ans Meer. Die Fahrt dauerte fünf Stunden. Das Hotel war klein, aber sehr schön. Das Zimmer hatte eine Dusche und eine gute Aussicht. Am Morgen gingen alle an den Strand. Das Wasser war warm und die Kinder schwammen viel. Am Abend besichtigten sie die Stadt. Der Urlaub war wunderbar.',
    passageTranslated: 'Дар моҳи июл оилаи Вебер рухсатӣ дошт. Онҳо ҷомадонҳоро бастанд ва бо поезд ба соҳили баҳр рафтанд. Роҳ панҷ соат давом кард. Меҳмонхона хурд, вале хеле зебо буд. Ҳуҷра душ ва манзараи хуб дошт. Саҳар ҳама ба соҳил рафтанд. Об гарм буд ва кӯдакон бисёр шино карданд. Бегоҳ онҳо шаҳрро тамошо карданд. Рухсатӣ аҷиб буд.',
    questions: [
      { question: 'Wann hatte die Familie Urlaub?', questionTranslated: 'Оила кай рухсатӣ дошт?', options: ['Im Juli', 'Im Januar', 'Im Mai'], correctIndex: 0, explanation: 'Матн: Im Juli hatte Familie Weber Urlaub.' },
      { question: 'Womit fuhren sie ans Meer?', questionTranslated: 'Онҳо бо чӣ ба соҳили баҳр рафтанд?', options: ['Mit dem Zug', 'Mit dem Auto', 'Mit dem Flugzeug'], correctIndex: 0, explanation: 'Матн: fuhren mit dem Zug ans Meer.' },
      { question: 'Wie war das Hotel?', questionTranslated: 'Меҳмонхона чӣ гуна буд?', options: ['Klein, aber sehr schön', 'Groß und teuer', 'Alt und schmutzig'], correctIndex: 0, explanation: 'Матн: Das Hotel war klein, aber sehr schön.' },
      { question: 'Was machten die Kinder am Strand?', questionTranslated: 'Кӯдакон дар соҳил чӣ карданд?', options: ['Sie schwammen viel', 'Sie schliefen', 'Sie lasen Bücher'], correctIndex: 0, explanation: 'Матн: die Kinder schwammen viel.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: An der Rezeption', lessonTitleTranslated: 'Шунавоӣ: Дар қабулгоҳ',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: An der Rezeption', titleTranslated: 'Шунавоӣ: Дар қабулгоҳ',
    passage: 'Guten Abend! Haben Sie ein Zimmer frei? Ja, wir haben ein Einzelzimmer. Wie lange bleiben Sie? Drei Nächte. Was kostet das Zimmer? Sechzig Euro pro Nacht. Hat das Zimmer eine Dusche? Ja, natürlich. Gut, ich nehme es.',
    passageTranslated: 'Шоми хуш! Шумо ҳуҷраи холӣ доред? Бале, мо як ҳуҷраи якнафара дорем. Шумо чанд вақт мемонед? Се шаб. Ҳуҷра чанд пул аст? Шаст евро барои як шаб. Ҳуҷра душ дорад? Бале, албатта. Хуб, ман онро мегирам.',
    questions: [
      { question: 'Welches Zimmer hat das Hotel frei?', questionTranslated: 'Меҳмонхона кадом ҳуҷраи холӣ дорад?', options: ['Ein Einzelzimmer', 'Ein Doppelzimmer', 'Kein Zimmer'], correctIndex: 0, explanation: 'Матн: wir haben ein Einzelzimmer.' },
      { question: 'Wie lange bleibt der Gast?', questionTranslated: 'Меҳмон чанд вақт мемонад?', options: ['Drei Nächte', 'Eine Nacht', 'Eine Woche'], correctIndex: 0, explanation: 'Матн: Drei Nächte.' },
      { question: 'Was kostet das Zimmer pro Nacht?', questionTranslated: 'Ҳуҷра барои як шаб чанд пул аст?', options: ['Sechzig Euro', 'Sechs Euro', 'Sechzehn Euro'], correctIndex: 0, explanation: 'Матн: Sechzig Euro pro Nacht.' },
      { question: 'Hat das Zimmer eine Dusche?', questionTranslated: 'Ҳуҷра душ дорад?', options: ['Ja', 'Nein', 'Das sagt der Text nicht'], correctIndex: 0, explanation: 'Матн: Ja, natürlich.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: war, hatte und wo', titleTranslated: 'Такрор: war, hatte ва wo',
    passage: 'Für die Vergangenheit von sein und haben sagst du immer war und hatte: Der Urlaub war schön. Ich hatte kein Ticket. Bei der Frage Wo? nimmst du in plus Dativ: Ich bin im Hotel, in der Stadt, am Strand. Bei Ländern ist es einfach: nach Deutschland für die Bewegung, in Deutschland ohne Bewegung und aus Tadschikistan für die Herkunft.',
    passageTranslated: 'Барои замони гузаштаи sein ва haben ҳамеша war ва hatte гуфта мешавад: Der Urlaub war schön. Ich hatte kein Ticket. Дар саволи Wo? in ва Dativ гирифта мешавад: Ich bin im Hotel, in der Stadt, am Strand. Бо кишварҳо осон аст: nach Deutschland барои ҳаракат, in Deutschland бе ҳаракат ва aus Tadschikistan барои пайдоиш.',
    questions: [
      { question: 'Wie sagt man die Vergangenheit von "sein"?', questionTranslated: 'Замони гузаштаи «sein» чӣ гуна аст?', options: ['war', 'hatte', 'gewesen'], correctIndex: 0, explanation: 'Матн: sagst du immer war und hatte.' },
      { question: 'Welches Wort nimmst du für die Bewegung zu einem Land?', questionTranslated: 'Барои ҳаракат ба кишвар кадом калима гирифта мешавад?', options: ['nach', 'in', 'aus'], correctIndex: 0, explanation: 'Матн: nach Deutschland für die Bewegung.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Eine Postkarte aus Berlin', titleTranslated: 'Кортпочта аз Берлин',
    passage: 'Liebe Mama! Ich bin jetzt in Berlin. Die Reise war lang, aber sehr interessant. Ich bin mit dem Flugzeug geflogen. Am Flughafen hatte ich ein Problem: mein Koffer war nicht da! Aber am Abend kam er an. Mein Hotel ist klein und die Rezeption ist immer offen. Heute habe ich das Museum besichtigt und viele Fotos gemacht. Morgen fahre ich mit dem Zug an einen See. Das Wetter ist warm. Deine Sara.',
    passageTranslated: 'Модари азиз! Ман ҳоло дар Берлин ҳастам. Сафар дароз, вале хеле ҷолиб буд. Ман бо ҳавопаймо парвоз кардам. Дар фурудгоҳ ман мушкилӣ доштам: ҷомадони ман набуд! Вале бегоҳ он расид. Меҳмонхонаи ман хурд аст ва қабулгоҳ ҳамеша кушода аст. Имрӯз ман осорхонаро тамошо кардам ва бисёр сурат гирифтам. Пагоҳ ман бо поезд ба як кӯл меравам. Обу ҳаво гарм аст. Сараи ту.',
    questions: [
      { question: 'Wo ist Sara jetzt?', questionTranslated: 'Сара ҳоло дар куҷост?', options: ['In Berlin', 'Am Meer', 'Zu Hause'], correctIndex: 0, explanation: 'Матн: Ich bin jetzt in Berlin.' },
      { question: 'Wie war die Reise?', questionTranslated: 'Сафар чӣ гуна буд?', options: ['Lang, aber interessant', 'Kurz und langweilig', 'Sehr teuer'], correctIndex: 0, explanation: 'Матн: Die Reise war lang, aber sehr interessant.' },
      { question: 'Womit ist Sara gereist?', questionTranslated: 'Сара бо чӣ сафар кард?', options: ['Mit dem Flugzeug', 'Mit dem Zug', 'Mit dem Bus'], correctIndex: 0, explanation: 'Матн: Ich bin mit dem Flugzeug geflogen.' },
      { question: 'Welches Problem hatte Sara am Flughafen?', questionTranslated: 'Сара дар фурудгоҳ кадом мушкилӣ дошт?', options: ['Der Koffer war nicht da', 'Sie hatte kein Ticket', 'Das Flugzeug war weg'], correctIndex: 0, explanation: 'Матн: mein Koffer war nicht da.' },
      { question: 'Was hat Sara heute gemacht?', questionTranslated: 'Сара имрӯз чӣ кард?', options: ['Das Museum besichtigt', 'Im See geschwommen', 'Einen Koffer gekauft'], correctIndex: 0, explanation: 'Матн: Heute habe ich das Museum besichtigt.' },
      { question: 'Wohin fährt Sara morgen?', questionTranslated: 'Сара пагоҳ ба куҷо меравад?', options: ['An einen See', 'Nach Hause', 'An das Meer'], correctIndex: 0, explanation: 'Матн: Morgen fahre ich mit dem Zug an einen See.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Der Urlaub war schön.', 'Der Urlaub ist gewesen schön.', 'Der Urlaub hatte schön.'], correctIndex: 0, explanation: 'Барои sein дар гузашта — war.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich fliege nach Deutschland.', 'Ich fliege in Deutschland.', 'Ich fliege aus Deutschland an.'], correctIndex: 0, explanation: 'Ҳаракат ба кишвар → nach.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Im Hotel', lessonTitleTranslated: 'Муколама: Дар меҳмонхона',
  title: 'Im Hotel', titleTranslated: 'Дар меҳмонхона',
  scenario: 'Меҳмон дар қабулгоҳи меҳмонхона ҳуҷра мегирад.',
  emoji: '🗣️',
  lines: [
    { speaker: 'Rezeption', text: 'Guten Abend! Kann ich Ihnen helfen?', translation: 'Шоми хуш! Ман метавонам ба Шумо кӯмак кунам?', isUser: false },
    { speaker: 'Ich', text: 'Guten Abend. Haben Sie ein Zimmer frei?', translation: 'Шоми хуш. Шумо ҳуҷраи холӣ доред?', isUser: true },
    { speaker: 'Rezeption', text: 'Ja. Ein Einzelzimmer oder ein Doppelzimmer?', translation: 'Бале. Ҳуҷраи якнафара ё дунафара?', isUser: false },
    { speaker: 'Ich', text: 'Ein Einzelzimmer, bitte.', translation: 'Лутфан, ҳуҷраи якнафара.', isUser: true },
    { speaker: 'Rezeption', text: 'Wie lange bleiben Sie?', translation: 'Шумо чанд вақт мемонед?', isUser: false },
    { speaker: 'Ich', text: 'Drei Nächte. Was kostet das Zimmer?', translation: 'Се шаб. Ҳуҷра чанд пул аст?', isUser: true },
    { speaker: 'Rezeption', text: 'Sechzig Euro pro Nacht, mit Frühstück.', translation: 'Шаст евро барои як шаб, бо наҳорӣ.', isUser: false },
    { speaker: 'Ich', text: 'Hat das Zimmer eine Dusche?', translation: 'Ҳуҷра душ дорад?', isUser: true },
    { speaker: 'Rezeption', text: 'Ja, und die Aussicht ist wunderbar.', translation: 'Бале, ва манзара аҷиб аст.', isUser: false },
    { speaker: 'Ich', text: 'Sehr gut. Ich nehme das Zimmer.', translation: 'Хеле хуб. Ман ин ҳуҷраро мегирам.', isUser: true },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['die Reise', 'der Koffer', 'das Meer', 'der Berg', 'das Land', 'fliegen', 'buchen', 'der Strand'],
};
