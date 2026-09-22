// Модули 13-и олмонӣ (тартиби 12) — «Beruf und Arbeit».
//
// Мавзӯи ҳатмии A1 (Goethe Start Deutsch 1): касб, ҷои кор, «Was sind Sie von
// Beruf?». То ин ҷо курс мавзӯи кор умуман надошт.
export const MODULE = {
  order: 12,
  title: 'Beruf und Arbeit',
  titleTranslated: 'Касб ва кор',
  icon: '💼',
  color: 'bg-slate-600',
};

export const ORDER = [
  'vocab:Berufe 1',
  'vocab:Berufe 2',
  'vocab:Am Arbeitsplatz',
  'vocab:Tätigkeiten',
  'vocab:Arbeitszeit',
  'vocab:Mehr Verben',
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
    title: 'Berufe 1',
    words: [
      { word: 'der Lehrer', translation: 'муаллим (мард)', emoji: '👨‍🏫', ipa: '/deːɐ̯ ˈleːʁɐ/',
        example: 'Mein Vater ist Lehrer.', exampleTrans: 'Падари ман муаллим аст.' },
      { word: 'die Lehrerin', translation: 'муаллима (зан)', emoji: '👩‍🏫', ipa: '/diː ˈleːʁəʁɪn/',
        example: 'Die Lehrerin ist sehr gut.', exampleTrans: 'Муаллима хеле хуб аст.' },
      { word: 'der Student', translation: 'донишҷӯ (мард)', emoji: '👨‍🎓', ipa: '/deːɐ̯ ʃtuˈdɛnt/',
        example: 'Er ist Student.', exampleTrans: 'Ӯ донишҷӯ аст.' },
      { word: 'die Studentin', translation: 'донишҷӯ (зан)', emoji: '👩‍🎓', ipa: '/diː ʃtuˈdɛntɪn/',
        example: 'Sie ist Studentin.', exampleTrans: 'Вай донишҷӯ аст.' },
      { word: 'der Verkäufer', translation: 'фурӯшанда (мард)', emoji: '🧑‍💼', ipa: '/deːɐ̯ fɛɐ̯ˈkɔɪ̯fɐ/',
        example: 'Der Verkäufer ist freundlich.', exampleTrans: 'Фурӯшанда меҳрубон аст.' },
      { word: 'die Verkäuferin', translation: 'фурӯшанда (зан)', emoji: '💁‍♀️', ipa: '/diː fɛɐ̯ˈkɔɪ̯fəʁɪn/',
        example: 'Die Verkäuferin arbeitet hier.', exampleTrans: 'Фурӯшанда дар ин ҷо кор мекунад.' },
      { word: 'der Koch', translation: 'ошпаз (мард)', emoji: '👨‍🍳', ipa: '/deːɐ̯ kɔx/',
        example: 'Der Koch macht das Essen.', exampleTrans: 'Ошпаз хӯрок мепазад.' },
      { word: 'die Köchin', translation: 'ошпаз (зан)', emoji: '👩‍🍳', ipa: '/diː ˈkœçɪn/',
        example: 'Meine Mutter ist Köchin.', exampleTrans: 'Модари ман ошпаз аст.' },
    ],
  },
  {
    title: 'Berufe 2',
    words: [
      { word: 'der Fahrer', translation: 'ронанда', emoji: '🚗', ipa: '/deːɐ̯ ˈfaːʁɐ/',
        example: 'Der Fahrer wartet vor dem Haus.', exampleTrans: 'Ронанда дар назди хона интизор аст.' },
      { word: 'der Polizist', translation: 'милиса', emoji: '👮', ipa: '/deːɐ̯ poliˈt͡sɪst/',
        example: 'Der Polizist hilft uns.', exampleTrans: 'Милиса ба мо кӯмак мекунад.' },
      { word: 'der Bäcker', translation: 'нонпаз', emoji: '🥖', ipa: '/deːɐ̯ ˈbɛkɐ/',
        example: 'Der Bäcker steht früh auf.', exampleTrans: 'Нонпаз барвақт мехезад.' },
      { word: 'der Kellner', translation: 'пешхизмат', emoji: '🤵', ipa: '/deːɐ̯ ˈkɛlnɐ/',
        example: 'Der Kellner bringt die Speisekarte.', exampleTrans: 'Пешхизмат менюро меорад.' },
      { word: 'der Ingenieur', translation: 'муҳандис', emoji: '👷', ipa: '/deːɐ̯ ɪnʒeˈnjøːɐ̯/',
        example: 'Mein Bruder ist Ingenieur.', exampleTrans: 'Бародари ман муҳандис аст.' },
      { word: 'die Krankenschwester', translation: 'ҳамшираи шафқат', emoji: '👩‍⚕️', ipa: '/diː ˈkʁaŋkənˌʃvɛstɐ/',
        example: 'Die Krankenschwester ist im Krankenhaus.', exampleTrans: 'Ҳамшираи шафқат дар беморхона аст.' },
      { word: 'der Chef', translation: 'сардор', emoji: '🧔', ipa: '/deːɐ̯ ʃɛf/',
        example: 'Der Chef kommt um neun Uhr.', exampleTrans: 'Сардор соати нӯҳ меояд.' },
      { word: 'der Kollege', translation: 'ҳамкор', emoji: '🧑‍🤝‍🧑', ipa: '/deːɐ̯ kɔˈleːɡə/',
        example: 'Mein Kollege ist nett.', exampleTrans: 'Ҳамкори ман хушмуомила аст.' },
    ],
  },
  {
    title: 'Am Arbeitsplatz',
    words: [
      { word: 'die Arbeit', translation: 'кор', emoji: '💼', ipa: '/diː ˈaʁbaɪ̯t/',
        example: 'Die Arbeit beginnt um acht.', exampleTrans: 'Кор соати ҳашт оғоз мешавад.' },
      { word: 'das Büro', translation: 'идора (офис)', emoji: '🏢', ipa: '/das byˈʁoː/',
        example: 'Ich arbeite im Büro.', exampleTrans: 'Ман дар идора кор мекунам.' },
      { word: 'die Firma', translation: 'ширкат', emoji: '🏭', ipa: '/diː ˈfɪʁma/',
        example: 'Die Firma ist groß.', exampleTrans: 'Ширкат калон аст.' },
      { word: 'der Computer', translation: 'компютер', emoji: '💻', ipa: '/deːɐ̯ kɔmˈpjuːtɐ/',
        example: 'Der Computer ist neu.', exampleTrans: 'Компютер нав аст.' },
      { word: 'der Schreibtisch', translation: 'мизи корӣ', emoji: '🗄️', ipa: '/deːɐ̯ ˈʃʁaɪ̯pˌtɪʃ/',
        example: 'Mein Schreibtisch ist sauber.', exampleTrans: 'Мизи кории ман тоза аст.' },
      { word: 'der Stift', translation: 'қалам', emoji: '🖊️', ipa: '/deːɐ̯ ʃtɪft/',
        example: 'Wo ist mein Stift?', exampleTrans: 'Қалами ман куҷост?' },
      { word: 'das Papier', translation: 'коғаз', emoji: '📄', ipa: '/das paˈpiːɐ̯/',
        example: 'Ich brauche Papier.', exampleTrans: 'Ба ман коғаз лозим аст.' },
      { word: 'die Fabrik', translation: 'завод', emoji: '🏗️', ipa: '/diː faˈbʁiːk/',
        example: 'Er arbeitet in der Fabrik.', exampleTrans: 'Ӯ дар завод кор мекунад.' },
    ],
  },
  {
    title: 'Tätigkeiten',
    words: [
      { word: 'verdienen', translation: 'даромад доштан', emoji: '💰', ipa: '/fɛɐ̯ˈdiːnən/',
        example: 'Ich verdiene genug.', exampleTrans: 'Ман даромади кофӣ дорам.' },
      { word: 'beginnen', translation: 'оғоз кардан', emoji: '▶️', ipa: '/bəˈɡɪnən/',
        example: 'Wir beginnen um acht Uhr.', exampleTrans: 'Мо соати ҳашт оғоз мекунем.' },
      { word: 'schreiben', translation: 'навиштан', emoji: '✍️', ipa: '/ˈʃʁaɪ̯bən/',
        example: 'Ich schreibe einen Brief.', exampleTrans: 'Ман як нома менависам.' },
      { word: 'lesen', translation: 'хондан', emoji: '📖', ipa: '/ˈleːzən/',
        example: 'Er liest die Zeitung.', exampleTrans: 'Ӯ рӯзнома мехонад.' },
      { word: 'helfen', translation: 'кӯмак кардан', emoji: '🤝', ipa: '/ˈhɛlfən/',
        example: 'Ich helfe dem Kollegen.', exampleTrans: 'Ман ба ҳамкор кӯмак мекунам.' },
      { word: 'fragen', translation: 'пурсидан', emoji: '❓', ipa: '/ˈfʁaːɡən/',
        example: 'Ich frage den Chef.', exampleTrans: 'Ман аз сардор мепурсам.' },
      { word: 'antworten', translation: 'ҷавоб додан', emoji: '💬', ipa: '/ˈantvɔʁtən/',
        example: 'Er antwortet schnell.', exampleTrans: 'Ӯ зуд ҷавоб медиҳад.' },
      { word: 'suchen', translation: 'ҷустуҷӯ кардан', emoji: '🔎', ipa: '/ˈzuːxən/',
        example: 'Ich suche Arbeit.', exampleTrans: 'Ман кор меҷӯям.' },
    ],
  },
  {
    title: 'Arbeitszeit',
    words: [
      { word: 'der Beruf', translation: 'касб', emoji: '🧑‍🔧', ipa: '/deːɐ̯ bəˈʁuːf/',
        example: 'Was sind Sie von Beruf?', exampleTrans: 'Касби Шумо чист?' },
      { word: 'die Stunde', translation: 'соат (муддат)', emoji: '⏳', ipa: '/diː ˈʃtʊndə/',
        example: 'Ich arbeite acht Stunden.', exampleTrans: 'Ман ҳашт соат кор мекунам.' },
      { word: 'die Pause', translation: 'танаффус', emoji: '☕', ipa: '/diː ˈpaʊ̯zə/',
        example: 'Die Pause ist um zwölf.', exampleTrans: 'Танаффус соати дувоздаҳ аст.' },
      { word: 'der Urlaub', translation: 'рухсатӣ', emoji: '🏖️', ipa: '/deːɐ̯ ˈuːɐ̯laʊ̯p/',
        example: 'Im Juli habe ich Urlaub.', exampleTrans: 'Дар моҳи июл ман рухсатӣ дорам.' },
      { word: 'pünktlich', translation: 'сари вақт', emoji: '⏰', ipa: '/ˈpʏŋktlɪç/',
        example: 'Der Chef ist immer pünktlich.', exampleTrans: 'Сардор ҳамеша сари вақт меояд.' },
      { word: 'fleißig', translation: 'меҳнатдӯст', emoji: '🐝', ipa: '/ˈflaɪ̯sɪç/',
        example: 'Sie ist sehr fleißig.', exampleTrans: 'Вай хеле меҳнатдӯст аст.' },
      { word: 'schwer', translation: 'вазнин (душвор)', emoji: '🪨', ipa: '/ʃveːɐ̯/',
        example: 'Die Arbeit ist schwer.', exampleTrans: 'Кор вазнин аст.' },
      { word: 'leicht', translation: 'сабук (осон)', emoji: '🪶', ipa: '/laɪ̯çt/',
        example: 'Die Aufgabe ist leicht.', exampleTrans: 'Вазифа осон аст.' },
    ],
  },
  {
    title: 'Mehr Verben',
    words: [
      { word: 'telefonieren', translation: 'телефон кардан', emoji: '📞', ipa: '/telefoˈniːʁən/',
        example: 'Ich telefoniere mit dem Chef.', exampleTrans: 'Ман бо сардор телефон мекунам.' },
      { word: 'verkaufen', translation: 'фурӯхтан', emoji: '🏷️', ipa: '/fɛɐ̯ˈkaʊ̯fən/',
        example: 'Wir verkaufen Brot.', exampleTrans: 'Мо нон мефурӯшем.' },
      { word: 'kochen', translation: 'пухтан', emoji: '🍲', ipa: '/ˈkɔxən/',
        example: 'Der Koch kocht Suppe.', exampleTrans: 'Ошпаз шӯрбо мепазад.' },
      { word: 'bringen', translation: 'овардан', emoji: '📦', ipa: '/ˈbʁɪŋən/',
        example: 'Der Kellner bringt den Tee.', exampleTrans: 'Пешхизмат чой меорад.' },
      { word: 'anfangen', translation: 'сар кардан', emoji: '🚦', ipa: '/ˈanˌfaŋən/',
        example: 'Wir fangen um acht an.', exampleTrans: 'Мо соати ҳашт сар мекунем.' },
      { word: 'aufhören', translation: 'бас кардан', emoji: '🛑', ipa: '/ˈaʊ̯fˌhøːʁən/',
        example: 'Ich höre um fünf auf.', exampleTrans: 'Ман соати панҷ бас мекунам.' },
      { word: 'lernen', translation: 'омӯхтан', emoji: '📚', ipa: '/ˈlɛʁnən/',
        example: 'Ich lerne Deutsch.', exampleTrans: 'Ман олмониро меомӯзам.' },
      { word: 'machen', translation: 'кардан', emoji: '🛠️', ipa: '/ˈmaxən/',
        example: 'Was machst du?', exampleTrans: 'Ту чӣ кор мекунӣ?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Ich bin Lehrer', lessonTitleTranslated: 'Грамматика: Ман муаллимам',
    title: 'Berufe ohne Artikel: Ich bin Lehrer', titleTranslated: 'Касб бе артикл: Ich bin Lehrer',
    emoji: '🧑‍🏫',
    explanation:
`Барои гуфтани касб олмонӣ як қоидаи ғайричашмдошт дорад: баъди феъли **sein** номи касб **БЕ АРТИКЛ** меистад.

> Ich bin **Lehrer**. ✅
> ~~Ich bin ein Lehrer.~~ ❌

- Sie ist **Ärztin**. (Вай духтур аст.)
- Er ist **Student**.
- Wir sind **Verkäufer**.

**Шакли занона — бандаки -in:**

| мард | зан |
|---|---|
| der Lehrer | die Lehrer**in** |
| der Student | die Student**in** |
| der Verkäufer | die Verkäufer**in** |
| der Koch | die K**ö**ch**in** |

Баъзан садонок умлаут мегирад: Koch → K**ö**chin, Arzt → **Ä**rztin.

**Саволи касб ду хел мешавад:**
- **Was sind Sie von Beruf?** (боадабона)
- **Was machst du beruflich?** (бо дӯст)

**Доми тоҷик:** дар тоҷикӣ мо мегӯем «ман ЯК муаллимам»? — не, вале аз русӣ/англисӣ одат мешавад, ки «a teacher» гуфта шавад. Дар олмонӣ маҳз ҳамин «ein» хато аст.

Артикл танҳо вақте пайдо мешавад, ки сифат илова шавад: Er ist **ein guter** Lehrer.`,
    rules: [
      { pattern: 'sein + касб БЕ артикл', note: 'Ich bin Lehrer. Sie ist Ärztin.' },
      { pattern: 'Занона: + -in', note: 'der Lehrer → die Lehrerin · der Student → die Studentin.' },
      { pattern: 'Баъзан умлаут', note: 'der Koch → die Köchin · der Arzt → die Ärztin.' },
      { pattern: 'Was sind Sie von Beruf?', note: 'Саволи стандартии касб.' },
    ],
    examples: [
      { sentence: 'Ich bin Lehrer.', translation: 'Ман муаллимам.', highlight: 'Lehrer' },
      { sentence: 'Sie ist Ärztin.', translation: 'Вай духтур аст.', highlight: 'Ärztin' },
      { sentence: 'Was sind Sie von Beruf?', translation: 'Касби Шумо чист?', highlight: 'Beruf' },
      { sentence: 'Mein Bruder ist Ingenieur.', translation: 'Бародари ман муҳандис аст.', highlight: 'Ingenieur' },
      { sentence: 'Meine Mutter ist Köchin.', translation: 'Модари ман ошпаз аст.', highlight: 'Köchin' },
      { sentence: 'Er ist ein guter Lehrer.', translation: 'Ӯ муаллими хуб аст.', highlight: 'ein guter' },
    ],
    exercises: [
      { prompt: 'Ich bin ___. (муаллим)', promptTranslated: 'Ман муаллимам.', answer: 'Lehrer', options: ['Lehrer', 'ein Lehrer', 'der Lehrer', 'eine Lehrer'], explanation: 'Баъди sein касб бе артикл меистад.' },
      { prompt: 'Sie ist ___. (духтури зан)', promptTranslated: 'Вай духтур аст.', answer: 'Ärztin', options: ['Ärztin', 'Arzt', 'eine Arzt', 'der Arzt'], explanation: 'Шакли занона: die Ärztin.' },
      { prompt: 'der Student → die ___', promptTranslated: 'Шакли занонаи «Student».', answer: 'Studentin', options: ['Studentin', 'Studentine', 'Studenterin', 'Studente'], explanation: 'Бандаки занона: -in.' },
      { prompt: 'der Koch → die ___', promptTranslated: 'Шакли занонаи «Koch».', answer: 'Köchin', options: ['Köchin', 'Kochin', 'Köcherin', 'Kochine'], explanation: 'Умлаут + -in: Köchin.' },
      { prompt: 'Was ___ Sie von Beruf?', promptTranslated: 'Касби Шумо чист?', answer: 'sind', options: ['sind', 'ist', 'bist', 'bin'], explanation: 'Барои «Sie» — sind.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Er ist Verkäufer.', options: ['Er ist Verkäufer.', 'Er ist ein Verkäufer.', 'Er ist der Verkäufer von Beruf.', 'Er ist eine Verkäufer.'], explanation: 'Касб баъди sein бе артикл.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Das Verb an Position 2', lessonTitleTranslated: 'Грамматика: Феъл дар ҷои дуюм',
    title: 'Satzstellung: Das Verb an Position 2', titleTranslated: 'Тартиби калима: феъл дар ҷои ДУЮМ',
    emoji: '2️⃣',
    explanation:
`Ин қоидаи аз ҳама муҳими ҷумлаи олмонӣ: **феъли тасрифшуда ҳамеша дар ҷои ДУЮМ меистад** — новобаста аз он ки дар ҷои якум чӣ аст.

| 1 | 2 (феъл) | боқӣ |
|---|---|---|
| Ich | **arbeite** | im Büro. |
| Heute | **arbeite** | ich im Büro. |
| Im Büro | **arbeite** | ich heute. |

Дидед? Вақте ҷумла бо «Heute» сар мешавад, **ich** ба ҷои сеюм мегузарад — вале феъл боз дар ҷои дуюм мемонад. Ин «ҷойивазкунӣ» ном дорад.

**Доми асосии тоҷик:** дар тоҷикӣ феъл дар ОХИР меистад — «Ман имрӯз дар идора кор мекунам». Агар ҷумларо калима ба калима тарҷума кунем, хато мешавад:
> ❌ Ich heute im Büro arbeite.
> ✅ Ich **arbeite** heute im Büro.

**Дар савол бо калимаи саволӣ феъл боз дуюм аст:**
- Wann **beginnt** die Arbeit?
- Wo **arbeitest** du?

**Дар саволи Ja/Nein феъл ба ҷои ЯКУМ мебарояд:**
- **Arbeitest** du heute? — Ja.`,
    rules: [
      { pattern: 'Феъл = ҷои 2', note: 'Ich arbeite im Büro. Heute arbeite ich im Büro.' },
      { pattern: 'Оғози дигар → субъект ҷо иваз мекунад', note: 'Heute **arbeite ich** — на «heute ich arbeite».' },
      { pattern: 'W-савол: феъл боз дуюм', note: 'Wo arbeitest du? Wann beginnt die Arbeit?' },
      { pattern: 'Ja/Nein-савол: феъл якум', note: 'Arbeitest du heute?' },
    ],
    examples: [
      { sentence: 'Ich arbeite im Büro.', translation: 'Ман дар идора кор мекунам.', highlight: 'arbeite' },
      { sentence: 'Heute arbeite ich im Büro.', translation: 'Имрӯз ман дар идора кор мекунам.', highlight: 'arbeite ich' },
      { sentence: 'Um acht Uhr beginnt die Arbeit.', translation: 'Соати ҳашт кор оғоз мешавад.', highlight: 'beginnt' },
      { sentence: 'Wo arbeitest du?', translation: 'Ту дар куҷо кор мекунӣ?', highlight: 'arbeitest' },
      { sentence: 'Arbeitest du heute?', translation: 'Ту имрӯз кор мекунӣ?', highlight: 'Arbeitest' },
      { sentence: 'Im Juli habe ich Urlaub.', translation: 'Дар моҳи июл ман рухсатӣ дорам.', highlight: 'habe ich' },
    ],
    exercises: [
      { prompt: 'Heute ___ ich im Büro.', promptTranslated: 'Имрӯз ман дар идора кор мекунам.', answer: 'arbeite', options: ['arbeite', 'arbeitet', 'arbeiten', 'arbeitest'], explanation: 'Феъл дар ҷои дуюм, баъд ich.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Heute arbeite ich im Büro.', options: ['Heute arbeite ich im Büro.', 'Heute ich arbeite im Büro.', 'Heute im Büro ich arbeite.', 'Ich heute arbeite im Büro.'], explanation: 'Феъл ҳамеша ҷои дуюм.' },
      { prompt: 'Um acht Uhr ___ die Arbeit.', promptTranslated: 'Соати ҳашт кор оғоз мешавад.', answer: 'beginnt', options: ['beginnt', 'beginne', 'beginnen', 'beginnst'], explanation: 'die Arbeit → beginnt, ва он дар ҷои дуюм.' },
      { prompt: 'Wo ___ du?', promptTranslated: 'Ту дар куҷо кор мекунӣ?', answer: 'arbeitest', options: ['arbeitest', 'arbeite', 'arbeitet', 'arbeiten'], explanation: 'Дар W-савол феъл боз дуюм: Wo arbeitest du?' },
      { prompt: '___ du heute? (савол бо ҷавоби ҳа/не)', promptTranslated: 'Ту имрӯз кор мекунӣ?', answer: 'Arbeitest', options: ['Arbeitest', 'Du arbeitest', 'Arbeite', 'Arbeiten'], explanation: 'Дар саволи Ja/Nein феъл ба ҷои ЯКУМ мебарояд.' },
      { prompt: 'Im Juli ___ ich Urlaub.', promptTranslated: 'Дар моҳи июл ман рухсатӣ дорам.', answer: 'habe', options: ['habe', 'hat', 'haben', 'hast'], explanation: 'Феъл дуюм, баъд ich: Im Juli habe ich …' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Lesen: Meine Arbeit', lessonTitleTranslated: 'Хониш: Кори ман',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Ein Tag im Büro', titleTranslated: 'Як рӯз дар идора',
    passage: 'Martin ist Ingenieur. Er arbeitet in einer Firma in Berlin. Die Arbeit beginnt um acht Uhr. Martin hat einen Computer und einen großen Schreibtisch. Um zwölf Uhr macht er eine Pause und isst mit seinen Kollegen. Am Nachmittag telefoniert er viel. Um fünf Uhr hört er auf. Die Arbeit ist manchmal schwer, aber Martin ist sehr fleißig.',
    passageTranslated: 'Мартин муҳандис аст. Ӯ дар як ширкат дар Берлин кор мекунад. Кор соати ҳашт оғоз мешавад. Мартин як компютер ва мизи кории калон дорад. Соати дувоздаҳ ӯ танаффус мекунад ва бо ҳамкоронаш хӯрок мехӯрад. Баъд аз зуҳр ӯ бисёр телефон мекунад. Соати панҷ ӯ бас мекунад. Кор баъзан вазнин аст, вале Мартин хеле меҳнатдӯст аст.',
    questions: [
      { question: 'Was ist Martin von Beruf?', questionTranslated: 'Касби Мартин чист?', options: ['Ingenieur', 'Lehrer', 'Koch'], correctIndex: 0, explanation: 'Матн: Martin ist Ingenieur.' },
      { question: 'Wann beginnt die Arbeit?', questionTranslated: 'Кор кай оғоз мешавад?', options: ['Um acht Uhr', 'Um neun Uhr', 'Um zwölf Uhr'], correctIndex: 0, explanation: 'Матн: Die Arbeit beginnt um acht Uhr.' },
      { question: 'Was macht Martin um zwölf Uhr?', questionTranslated: 'Мартин соати дувоздаҳ чӣ мекунад?', options: ['Eine Pause', 'Er telefoniert', 'Er geht nach Hause'], correctIndex: 0, explanation: 'Матн: Um zwölf Uhr macht er eine Pause.' },
      { question: 'Wie ist Martin?', questionTranslated: 'Мартин чӣ гуна аст?', options: ['Sehr fleißig', 'Sehr müde', 'Sehr langsam'], correctIndex: 0, explanation: 'Матн: Martin ist sehr fleißig.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Was sind Sie von Beruf?', lessonTitleTranslated: 'Шунавоӣ: Касби Шумо чист?',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Was sind Sie von Beruf?', titleTranslated: 'Шунавоӣ: Касби Шумо чист?',
    passage: 'Guten Tag! Was sind Sie von Beruf? Ich bin Verkäuferin. Ich arbeite in einem Geschäft in der Stadt. Und Sie? Ich bin Bäcker. Ich stehe jeden Tag um vier Uhr auf. Das ist sehr früh! Ja, aber die Arbeit ist schön.',
    passageTranslated: 'Салом! Касби Шумо чист? Ман фурӯшанда (зан) ҳастам. Ман дар як мағоза дар шаҳр кор мекунам. Ва Шумо? Ман нонпаз ҳастам. Ман ҳар рӯз соати чор мехезам. Ин хеле барвақт аст! Бале, вале кор зебо аст.',
    questions: [
      { question: 'Was ist die Frau von Beruf?', questionTranslated: 'Касби зан чист?', options: ['Verkäuferin', 'Lehrerin', 'Köchin'], correctIndex: 0, explanation: 'Матн: Ich bin Verkäuferin.' },
      { question: 'Wo arbeitet die Frau?', questionTranslated: 'Зан дар куҷо кор мекунад?', options: ['In einem Geschäft', 'In einer Fabrik', 'Im Büro'], correctIndex: 0, explanation: 'Матн: Ich arbeite in einem Geschäft.' },
      { question: 'Was ist der Mann von Beruf?', questionTranslated: 'Касби мард чист?', options: ['Bäcker', 'Fahrer', 'Kellner'], correctIndex: 0, explanation: 'Матн: Ich bin Bäcker.' },
      { question: 'Wann steht der Mann auf?', questionTranslated: 'Мард кай мехезад?', options: ['Um vier Uhr', 'Um acht Uhr', 'Um sechs Uhr'], correctIndex: 0, explanation: 'Матн: Ich stehe jeden Tag um vier Uhr auf.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Beruf und Satzstellung', titleTranslated: 'Такрор: Касб ва тартиби калима',
    passage: 'Nach dem Verb "sein" steht der Beruf ohne Artikel: Ich bin Lehrer. Für Frauen nimmst du die Endung -in: die Lehrerin, die Studentin, die Köchin. Und denk an die Satzstellung: Das Verb steht immer an Position 2. Heute arbeite ich im Büro. Aber in der Ja-Nein-Frage steht das Verb an Position 1: Arbeitest du heute?',
    passageTranslated: 'Баъди феъли «sein» касб бе артикл меистад: Ich bin Lehrer. Барои занон бандаки -in гирифта мешавад: die Lehrerin, die Studentin, die Köchin. Ва тартиби калимаро дар хотир дор: феъл ҳамеша дар ҷои 2 меистад. Heute arbeite ich im Büro. Вале дар саволи ҳа/не феъл дар ҷои 1 меистад: Arbeitest du heute?',
    questions: [
      { question: 'Wie sagt man den Beruf nach "sein"?', questionTranslated: 'Касб баъди «sein» чӣ гуна гуфта мешавад?', options: ['Ohne Artikel', 'Mit "ein"', 'Mit "der"'], correctIndex: 0, explanation: 'Матн: Nach dem Verb "sein" steht der Beruf ohne Artikel.' },
      { question: 'An welcher Position steht das Verb im Aussagesatz?', questionTranslated: 'Дар ҷумлаи хабарӣ феъл дар кадом ҷо меистад?', options: ['An Position 2', 'An Position 1', 'Am Ende'], correctIndex: 0, explanation: 'Матн: Das Verb steht immer an Position 2.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Die Familie und die Arbeit', titleTranslated: 'Оила ва кор',
    passage: 'Familie Klein arbeitet viel. Der Vater ist Fahrer. Er fährt jeden Tag mit dem Bus durch die Stadt. Die Mutter ist Lehrerin in einer Schule. Sie ist sehr fleißig und immer pünktlich. Der Sohn ist Student. Er lernt viel und arbeitet am Wochenende in einem Restaurant. Dort ist er Kellner und bringt das Essen. Im Juli hat die Familie Urlaub. Dann fahren alle zusammen ans Meer.',
    passageTranslated: 'Оилаи Клайн бисёр кор мекунад. Падар ронанда аст. Ӯ ҳар рӯз бо автобус аз шаҳр мегузарад. Модар дар як мактаб муаллима аст. Вай хеле меҳнатдӯст ва ҳамеша сари вақт аст. Писар донишҷӯ аст. Ӯ бисёр меомӯзад ва рӯзи истироҳат дар як ресторан кор мекунад. Дар он ҷо ӯ пешхизмат аст ва хӯрок меорад. Дар моҳи июл оила рухсатӣ дорад. Он гоҳ ҳама якҷоя ба соҳили баҳр мераванд.',
    questions: [
      { question: 'Was ist der Vater von Beruf?', questionTranslated: 'Касби падар чист?', options: ['Fahrer', 'Kellner', 'Lehrer'], correctIndex: 0, explanation: 'Матн: Der Vater ist Fahrer.' },
      { question: 'Wo arbeitet die Mutter?', questionTranslated: 'Модар дар куҷо кор мекунад?', options: ['In einer Schule', 'In einem Büro', 'In einer Fabrik'], correctIndex: 0, explanation: 'Матн: Die Mutter ist Lehrerin in einer Schule.' },
      { question: 'Wie ist die Mutter?', questionTranslated: 'Модар чӣ гуна аст?', options: ['Fleißig und pünktlich', 'Müde und langsam', 'Krank'], correctIndex: 0, explanation: 'Матн: Sie ist sehr fleißig und immer pünktlich.' },
      { question: 'Was macht der Sohn am Wochenende?', questionTranslated: 'Писар рӯзи истироҳат чӣ мекунад?', options: ['Er arbeitet im Restaurant', 'Er schläft', 'Er fährt Bus'], correctIndex: 0, explanation: 'Матн: arbeitet am Wochenende in einem Restaurant.' },
      { question: 'Was macht der Sohn im Restaurant?', questionTranslated: 'Писар дар ресторан чӣ кор мекунад?', options: ['Er bringt das Essen', 'Er kocht', 'Er verkauft Brot'], correctIndex: 0, explanation: 'Матн: Dort ist er Kellner und bringt das Essen.' },
      { question: 'Wann hat die Familie Urlaub?', questionTranslated: 'Оила кай рухсатӣ дорад?', options: ['Im Juli', 'Im Januar', 'Im September'], correctIndex: 0, explanation: 'Матн: Im Juli hat die Familie Urlaub.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich bin Lehrer.', 'Ich bin ein Lehrer.', 'Ich bin der Lehrer von Beruf.'], correctIndex: 0, explanation: 'Касб баъди sein бе артикл меистад.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Heute arbeite ich viel.', 'Heute ich arbeite viel.', 'Heute viel ich arbeite.'], correctIndex: 0, explanation: 'Феъл ҳамеша дар ҷои дуюм меистад.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Was machst du beruflich?', lessonTitleTranslated: 'Муколама: Ту чӣ кор мекунӣ?',
  title: 'Was machst du beruflich?', titleTranslated: 'Ту чӣ кор мекунӣ?',
  scenario: 'Ду ҳамсоя дар назди хона вомехӯранд ва дар бораи кори худ сӯҳбат мекунанд.',
  emoji: '🗣️',
  lines: [
    { speaker: 'Anna', text: 'Guten Tag! Was machst du beruflich?', translation: 'Салом! Ту чӣ кор мекунӣ?', isUser: false },
    { speaker: 'Ich', text: 'Ich bin Lehrer. Und du?', translation: 'Ман муаллимам. Ва ту?', isUser: true },
    { speaker: 'Anna', text: 'Ich bin Verkäuferin in einem Geschäft.', translation: 'Ман дар як мағоза фурӯшанда ҳастам.', isUser: false },
    { speaker: 'Ich', text: 'Wann beginnt deine Arbeit?', translation: 'Кори ту кай оғоз мешавад?', isUser: true },
    { speaker: 'Anna', text: 'Um neun Uhr. Ich arbeite acht Stunden.', translation: 'Соати нӯҳ. Ман ҳашт соат кор мекунам.', isUser: false },
    { speaker: 'Ich', text: 'Ist die Arbeit schwer?', translation: 'Кор вазнин аст?', isUser: true },
    { speaker: 'Anna', text: 'Manchmal. Aber meine Kollegen sind nett.', translation: 'Баъзан. Вале ҳамкорони ман хушмуомилаанд.', isUser: false },
    { speaker: 'Ich', text: 'Hast du im Sommer Urlaub?', translation: 'Ту дар тобистон рухсатӣ дорӣ?', isUser: true },
    { speaker: 'Anna', text: 'Ja, im Juli. Dann fahre ich ans Meer.', translation: 'Бале, дар моҳи июл. Он гоҳ ман ба соҳили баҳр меравам.', isUser: false },
    { speaker: 'Ich', text: 'Das ist schön. Schönen Tag noch!', translation: 'Ин зебо аст. Рӯзи хуш!', isUser: true },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['der Lehrer', 'die Arbeit', 'das Büro', 'der Beruf', 'der Chef', 'die Pause', 'schreiben', 'verkaufen'],
};
