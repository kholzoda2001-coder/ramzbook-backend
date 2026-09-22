// Модули 14-и олмонӣ (тартиби 13) — «Freizeit und Hobbys».
//
// Мавзӯи ҳатмии A1: вақти холӣ, варзиш, мусиқӣ, даъват ба меҳмонӣ.
export const MODULE = {
  order: 13,
  title: 'Freizeit und Hobbys',
  titleTranslated: 'Вақти холӣ ва завқҳо',
  icon: '⚽',
  color: 'bg-emerald-600',
};

export const ORDER = [
  'vocab:Hobbys und Freizeit',
  'vocab:Sport',
  'vocab:Freizeit-Verben',
  'vocab:Musik und Film',
  'vocab:Mit Freunden',
  'vocab:Wie war es?',
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
    title: 'Hobbys und Freizeit',
    words: [
      { word: 'das Hobby', translation: 'машғулияти дӯстдошта', emoji: '🎯', ipa: '/das ˈhɔbi/',
        example: 'Mein Hobby ist Musik.', exampleTrans: 'Машғулияти дӯстдоштаи ман мусиқӣ аст.' },
      { word: 'die Freizeit', translation: 'вақти холӣ', emoji: '🕰️', ipa: '/diː ˈfʁaɪ̯t͡saɪ̯t/',
        example: 'In der Freizeit lese ich.', exampleTrans: 'Дар вақти холӣ ман мехонам.' },
      { word: 'der Sport', translation: 'варзиш', emoji: '🏃', ipa: '/deːɐ̯ ʃpɔʁt/',
        example: 'Sport ist gesund.', exampleTrans: 'Варзиш барои саломатӣ фоида дорад.' },
      { word: 'die Musik', translation: 'мусиқӣ', emoji: '🎵', ipa: '/diː muˈziːk/',
        example: 'Ich höre gern Musik.', exampleTrans: 'Ман мусиқиро бо майл гӯш мекунам.' },
      { word: 'das Kino', translation: 'кинотеатр', emoji: '🎬', ipa: '/das ˈkiːno/',
        example: 'Wir gehen ins Kino.', exampleTrans: 'Мо ба кинотеатр меравем.' },
      { word: 'das Theater', translation: 'театр', emoji: '🎭', ipa: '/das teˈaːtɐ/',
        example: 'Das Theater ist in der Stadt.', exampleTrans: 'Театр дар шаҳр аст.' },
      { word: 'das Konzert', translation: 'консерт', emoji: '🎤', ipa: '/das kɔnˈt͡sɛʁt/',
        example: 'Das Konzert beginnt um acht.', exampleTrans: 'Консерт соати ҳашт оғоз мешавад.' },
      { word: 'das Spiel', translation: 'бозӣ', emoji: '🎲', ipa: '/das ʃpiːl/',
        example: 'Das Spiel war spannend.', exampleTrans: 'Бозӣ шавқовар буд.' },
    ],
  },
  {
    title: 'Sport',
    words: [
      { word: 'der Fußball', translation: 'футбол', emoji: '⚽', ipa: '/deːɐ̯ ˈfuːsbal/',
        example: 'Er spielt gern Fußball.', exampleTrans: 'Ӯ футболро бо майл бозӣ мекунад.' },
      { word: 'das Tennis', translation: 'теннис', emoji: '🎾', ipa: '/das ˈtɛnɪs/',
        example: 'Tennis ist nicht leicht.', exampleTrans: 'Теннис осон нест.' },
      { word: 'der Ball', translation: 'тӯб', emoji: '🏀', ipa: '/deːɐ̯ bal/',
        example: 'Der Ball ist rot.', exampleTrans: 'Тӯб сурх аст.' },
      { word: 'das Schwimmbad', translation: 'ҳавзи шиноварӣ', emoji: '🏊', ipa: '/das ˈʃvɪmbaːt/',
        example: 'Im Sommer gehe ich ins Schwimmbad.', exampleTrans: 'Дар тобистон ман ба ҳавз меравам.' },
      { word: 'das Stadion', translation: 'варзишгоҳ', emoji: '🏟️', ipa: '/das ˈʃtaːdi̯ɔn/',
        example: 'Das Stadion ist groß.', exampleTrans: 'Варзишгоҳ калон аст.' },
      { word: 'der Spieler', translation: 'бозигар', emoji: '🧑‍🦱', ipa: '/deːɐ̯ ˈʃpiːlɐ/',
        example: 'Der Spieler ist schnell.', exampleTrans: 'Бозигар тез аст.' },
      { word: 'gewinnen', translation: 'ғолиб шудан', emoji: '🏆', ipa: '/ɡəˈvɪnən/',
        example: 'Wir gewinnen das Spiel.', exampleTrans: 'Мо дар бозӣ ғолиб мешавем.' },
      { word: 'verlieren', translation: 'бохтан', emoji: '😞', ipa: '/fɛɐ̯ˈliːʁən/',
        example: 'Manchmal verlieren wir.', exampleTrans: 'Баъзан мо мебозем.' },
    ],
  },
  {
    title: 'Freizeit-Verben',
    words: [
      { word: 'spielen', translation: 'бозӣ кардан', emoji: '🎮', ipa: '/ˈʃpiːlən/',
        example: 'Ich spiele Fußball.', exampleTrans: 'Ман футбол бозӣ мекунам.' },
      { word: 'schwimmen', translation: 'шино кардан', emoji: '🏊‍♂️', ipa: '/ˈʃvɪmən/',
        example: 'Er schwimmt sehr gut.', exampleTrans: 'Ӯ хеле хуб шино мекунад.' },
      { word: 'tanzen', translation: 'рақс кардан', emoji: '💃', ipa: '/ˈtant͡sən/',
        example: 'Wir tanzen auf der Party.', exampleTrans: 'Мо дар шабнишинӣ рақс мекунем.' },
      { word: 'singen', translation: 'суруд хондан', emoji: '🎙️', ipa: '/ˈzɪŋən/',
        example: 'Sie singt schön.', exampleTrans: 'Вай зебо суруд мехонад.' },
      { word: 'malen', translation: 'расм кашидан', emoji: '🎨', ipa: '/ˈmaːlən/',
        example: 'Das Kind malt ein Haus.', exampleTrans: 'Кӯдак хона мекашад.' },
      { word: 'reisen', translation: 'сафар кардан', emoji: '🧳', ipa: '/ˈʁaɪ̯zən/',
        example: 'Ich reise gern.', exampleTrans: 'Ман сафарро дӯст медорам.' },
      { word: 'wandern', translation: 'пиёдагардӣ кардан', emoji: '🥾', ipa: '/ˈvandɐn/',
        example: 'Am Wochenende wandern wir.', exampleTrans: 'Рӯзи истироҳат мо пиёдагардӣ мекунем.' },
      { word: 'fotografieren', translation: 'сурат гирифтан', emoji: '📷', ipa: '/fotoɡʁaˈfiːʁən/',
        example: 'Er fotografiert die Blumen.', exampleTrans: 'Ӯ гулҳоро сурат мегирад.' },
    ],
  },
  {
    title: 'Musik und Film',
    words: [
      { word: 'das Lied', translation: 'суруд', emoji: '🎶', ipa: '/das liːt/',
        example: 'Das Lied ist schön.', exampleTrans: 'Суруд зебо аст.' },
      { word: 'der Film', translation: 'филм', emoji: '🎞️', ipa: '/deːɐ̯ fɪlm/',
        example: 'Der Film war lang.', exampleTrans: 'Филм дароз буд.' },
      { word: 'die Gitarre', translation: 'гитара', emoji: '🎸', ipa: '/diː ɡiˈtaʁə/',
        example: 'Ich spiele Gitarre.', exampleTrans: 'Ман гитара менавозам.' },
      { word: 'das Klavier', translation: 'фортепиано', emoji: '🎹', ipa: '/das klaˈviːɐ̯/',
        example: 'Sie spielt Klavier.', exampleTrans: 'Вай фортепиано менавозад.' },
      { word: 'der Sänger', translation: 'сароянда (мард)', emoji: '🧑‍🎤', ipa: '/deːɐ̯ ˈzɛŋɐ/',
        example: 'Der Sänger ist bekannt.', exampleTrans: 'Сароянда машҳур аст.' },
      { word: 'die Sängerin', translation: 'сароянда (зан)', emoji: '👩‍🎤', ipa: '/diː ˈzɛŋəʁɪn/',
        example: 'Die Sängerin singt ein Lied.', exampleTrans: 'Сароянда суруде мехонад.' },
      { word: 'der Schauspieler', translation: 'ҳунарпеша', emoji: '🎥', ipa: '/deːɐ̯ ˈʃaʊ̯ˌʃpiːlɐ/',
        example: 'Der Schauspieler ist gut.', exampleTrans: 'Ҳунарпеша хуб аст.' },
      { word: 'die Karte', translation: 'чипта', emoji: '🎟️', ipa: '/diː ˈkaʁtə/',
        example: 'Die Karte kostet zehn Euro.', exampleTrans: 'Чипта даҳ евро арзиш дорад.' },
    ],
  },
  {
    title: 'Mit Freunden',
    words: [
      { word: 'die Freundin', translation: 'дугона (дӯсти зан)', emoji: '👩', ipa: '/diː ˈfʁɔɪ̯ndɪn/',
        example: 'Meine Freundin kommt heute.', exampleTrans: 'Дугонаи ман имрӯз меояд.' },
      { word: 'der Gast', translation: 'меҳмон', emoji: '🧍', ipa: '/deːɐ̯ ɡast/',
        example: 'Der Gast trinkt Tee.', exampleTrans: 'Меҳмон чой менӯшад.' },
      { word: 'die Party', translation: 'шабнишинӣ', emoji: '🎉', ipa: '/diː ˈpaʁti/',
        example: 'Die Party ist am Samstag.', exampleTrans: 'Шабнишинӣ рӯзи шанбе аст.' },
      { word: 'die Einladung', translation: 'даъватнома', emoji: '💌', ipa: '/diː ˈaɪ̯nˌlaːdʊŋ/',
        example: 'Danke für die Einladung!', exampleTrans: 'Барои даъват раҳмат!' },
      { word: 'der Ausflug', translation: 'сайр (экскурсия)', emoji: '🚙', ipa: '/deːɐ̯ ˈaʊ̯sfluːk/',
        example: 'Wir machen einen Ausflug.', exampleTrans: 'Мо ба сайр мебароем.' },
      { word: 'das Picknick', translation: 'пикник', emoji: '🧺', ipa: '/das ˈpɪknɪk/',
        example: 'Das Picknick war schön.', exampleTrans: 'Пикник зебо буд.' },
      { word: 'besuchen', translation: 'дидан рафтан', emoji: '🚪', ipa: '/bəˈzuːxən/',
        example: 'Ich besuche meine Oma.', exampleTrans: 'Ман ба назди бибиям меравам.' },
      { word: 'einladen', translation: 'даъват кардан', emoji: '🤗', ipa: '/ˈaɪ̯nˌlaːdən/',
        example: 'Ich lade dich ein.', exampleTrans: 'Ман туро даъват мекунам.' },
    ],
  },
  {
    title: 'Wie war es?',
    words: [
      { word: 'interessant', translation: 'ҷолиб', emoji: '🤔', ipa: '/ɪntəʁɛˈsant/',
        example: 'Der Film war interessant.', exampleTrans: 'Филм ҷолиб буд.' },
      { word: 'spannend', translation: 'шавқовар', emoji: '😮', ipa: '/ˈʃpanənt/',
        example: 'Das Spiel war spannend.', exampleTrans: 'Бозӣ шавқовар буд.' },
      { word: 'toll', translation: 'олӣ', emoji: '👍', ipa: '/tɔl/',
        example: 'Das Konzert war toll.', exampleTrans: 'Консерт олӣ буд.' },
      { word: 'wunderbar', translation: 'аҷиб (хеле зебо)', emoji: '✨', ipa: '/ˈvʊndɐbaːɐ̯/',
        example: 'Der Tag war wunderbar.', exampleTrans: 'Рӯз аҷиб буд.' },
      { word: 'gemeinsam', translation: 'муштарак', emoji: '🤲', ipa: '/ɡəˈmaɪ̯nzaːm/',
        example: 'Wir singen gemeinsam.', exampleTrans: 'Мо якҷоя суруд мехонем.' },
      { word: 'draußen', translation: 'дар берун', emoji: '🌳', ipa: '/ˈdʁaʊ̯sən/',
        example: 'Die Kinder spielen draußen.', exampleTrans: 'Кӯдакон дар берун бозӣ мекунанд.' },
      { word: 'das Glück', translation: 'бахт', emoji: '🍀', ipa: '/das ɡlʏk/',
        example: 'Viel Glück!', exampleTrans: 'Барори кор!' },
      { word: 'die Lust', translation: 'хоҳиш (майл)', emoji: '😊', ipa: '/diː lʊst/',
        example: 'Hast du Lust?', exampleTrans: 'Хоҳиш дорӣ?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Ich will spielen', lessonTitleTranslated: 'Грамматика: Ман бозӣ кардан мехоҳам',
    title: 'Modalverb wollen', titleTranslated: 'Феъли модалии wollen — хостан',
    emoji: '💭',
    explanation:
`**wollen** = хостан, нияти қавӣ доштан.

ich **will** · du **willst** · er/sie/es **will** · wir **wollen** · ihr **wollt** · sie/Sie **wollen**

- Ich **will** Fußball **spielen**. (Ман футбол бозӣ кардан мехоҳам.)
- **Willst** du ins Kino **gehen**?
- Wir **wollen** am Samstag **tanzen**.

**Мисли ҳамаи феълҳои модалӣ:** феъли дуюм дар шакли луғавӣ ба ОХИРИ ҷумла меравад ва **ich** бо **er** шакли якхела дорад (ich will / er will).

**wollen ё möchte?** Ҳарду «мехоҳам» тарҷума мешаванд, вале:

| | маъно | оҳанг |
|---|---|---|
| **möchte** | хоҳиши боадабона | нарм, дар мағоза ва ресторан |
| **wollen** | нияти қатъӣ | қавӣ, дар нақшаи шахсӣ |

- Ich **möchte** einen Tee. (Ба ман як чой диҳед — боадабона.)
- Ich **will** Deutsch lernen. (Ман қарор додаам, ки олмонӣ омӯзам.)

Дар мағоза ҳамеша **möchte** гуфта мешавад — «Ich will einen Kaffee» дағал садо медиҳад.`,
    rules: [
      { pattern: 'ich will · du willst · er will', note: 'ich ва er шакли якхела доранд.' },
      { pattern: 'wir/sie/Sie wollen · ihr wollt', note: 'Шаклҳои ҷамъ.' },
      { pattern: 'Феъли дуюм — дар ОХИР', note: 'Ich will Fußball spielen.' },
      { pattern: 'möchte нармтар аст', note: 'Дар мағоза möchte, дар нақша wollen.' },
    ],
    examples: [
      { sentence: 'Ich will Fußball spielen.', translation: 'Ман футбол бозӣ кардан мехоҳам.', highlight: 'will ... spielen' },
      { sentence: 'Willst du ins Kino gehen?', translation: 'Ту ба кинотеатр рафтан мехоҳӣ?', highlight: 'Willst' },
      { sentence: 'Wir wollen am Samstag tanzen.', translation: 'Мо рӯзи шанбе рақс кардан мехоҳем.', highlight: 'wollen ... tanzen' },
      { sentence: 'Er will Gitarre lernen.', translation: 'Ӯ гитараро омӯхтан мехоҳад.', highlight: 'will ... lernen' },
      { sentence: 'Ich möchte eine Karte, bitte.', translation: 'Лутфан, ба ман як чипта диҳед.', highlight: 'möchte' },
      { sentence: 'Was willst du am Wochenende machen?', translation: 'Ту рӯзи истироҳат чӣ кор кардан мехоҳӣ?', highlight: 'willst' },
    ],
    exercises: [
      { prompt: 'Ich ___ Fußball spielen. (wollen)', promptTranslated: 'Ман футбол бозӣ кардан мехоҳам.', answer: 'will', options: ['will', 'willst', 'wollen', 'wollt'], explanation: 'Барои «ich» — will.' },
      { prompt: '___ du ins Kino gehen? (wollen)', promptTranslated: 'Ту ба кинотеатр рафтан мехоҳӣ?', answer: 'Willst', options: ['Willst', 'Will', 'Wollen', 'Wollt'], explanation: 'Барои «du» — willst.' },
      { prompt: 'Wir ___ am Samstag tanzen. (wollen)', promptTranslated: 'Мо рӯзи шанбе рақс кардан мехоҳем.', answer: 'wollen', options: ['wollen', 'will', 'willst', 'wollt'], explanation: 'Барои «wir» — wollen.' },
      { prompt: 'Er ___ Gitarre lernen. (wollen)', promptTranslated: 'Ӯ гитараро омӯхтан мехоҳад.', answer: 'will', options: ['will', 'willst', 'wollen', 'wollt'], explanation: 'Барои «er» — will, мисли ich.' },
      { prompt: 'Дар ресторан кадомаш БОАДАБТАР аст?', promptTranslated: 'Дар ресторан кадом ҷумла боадабтар аст?', answer: 'Ich möchte einen Tee.', options: ['Ich möchte einen Tee.', 'Ich will einen Tee.', 'Ich will Tee haben.', 'Ich wolle einen Tee.'], explanation: 'möchte шакли нарм ва боадабона аст.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Ich will Deutsch lernen.', options: ['Ich will Deutsch lernen.', 'Ich will lernen Deutsch.', 'Ich will Deutsch lerne.', 'Ich lernen will Deutsch.'], explanation: 'Infinitiv дар охири ҷумла меистад.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Wohin gehst du?', lessonTitleTranslated: 'Грамматика: Ту ба куҷо меравӣ?',
    title: 'Wohin? — in + Akkusativ', titleTranslated: 'Ба куҷо? — in + Akkusativ',
    emoji: '➡️',
    explanation:
`Саволи **Wohin?** (ба куҷо?) дар бораи ҲАРАКАТ аст. Ҷавоб бо пешоянди **in** ва падежи **Akkusativ** дода мешавад.

| ҷинс | ба куҷо (Akkusativ) | кӯтоҳшуда |
|---|---|---|
| der Park | in **den** Park | — |
| das Kino | in **das** Kino | **ins** Kino |
| die Stadt | in **die** Stadt | — |

- Ich gehe **ins** Kino. (Ман ба кинотеатр меравам.)
- Wir gehen **in den** Park.
- Sie geht **in die** Stadt.

**Ду шакли кӯтоҳ, ки ҳама мегӯянд:**
> in das → **ins** (ins Kino, ins Theater, ins Schwimmbad)
> zu dem → **zum** · zu der → **zur**

**Фарқи Wo? ва Wohin?**

| савол | маъно | падеж | мисол |
|---|---|---|---|
| **Wo?** | дар куҷо (бе ҳаракат) | Dativ | Ich bin **im** Kino. |
| **Wohin?** | ба куҷо (бо ҳаракат) | Akkusativ | Ich gehe **ins** Kino. |

**Доми тоҷик:** дар тоҷикӣ ҳарду «дар/ба кино» аст ва калима тағйир намеёбад. Дар олмонӣ маҳз ҳамин фарқ маънои ҷумларо дигар мекунад: *im Kino* = ман он ҷо ҳастам, *ins Kino* = ман он ҷо рафта истодаам.`,
    rules: [
      { pattern: 'Wohin? → in + Akkusativ', note: 'Ich gehe in den Park.' },
      { pattern: 'in das → ins', note: 'ins Kino, ins Theater, ins Schwimmbad.' },
      { pattern: 'Wo? → in + Dativ', note: 'Ich bin im Kino (in dem = im).' },
      { pattern: 'Ҳаракат ҳаст → Akkusativ', note: 'Агар ҷо иваз шавад — Akkusativ; агар не — Dativ.' },
    ],
    examples: [
      { sentence: 'Ich gehe ins Kino.', translation: 'Ман ба кинотеатр меравам.', highlight: 'ins' },
      { sentence: 'Wir gehen in den Park.', translation: 'Мо ба боғ меравем.', highlight: 'in den' },
      { sentence: 'Sie geht in die Stadt.', translation: 'Вай ба шаҳр меравад.', highlight: 'in die' },
      { sentence: 'Wohin gehst du?', translation: 'Ту ба куҷо меравӣ?', highlight: 'Wohin' },
      { sentence: 'Ich bin im Kino.', translation: 'Ман дар кинотеатр ҳастам.', highlight: 'im' },
      { sentence: 'Am Sonntag gehen wir ins Schwimmbad.', translation: 'Рӯзи якшанбе мо ба ҳавз меравем.', highlight: 'ins' },
    ],
    exercises: [
      { prompt: 'Ich gehe ___ Kino. (das Kino)', promptTranslated: 'Ман ба кинотеатр меравам.', answer: 'ins', options: ['ins', 'im', 'in der', 'in den'], explanation: 'in das → ins (ҳаракат).' },
      { prompt: 'Wir gehen ___ Park. (der Park)', promptTranslated: 'Мо ба боғ меравем.', answer: 'in den', options: ['in den', 'in dem', 'ins', 'in die'], explanation: 'der Park → Akkusativ: in den Park.' },
      { prompt: 'Sie geht ___ Stadt. (die Stadt)', promptTranslated: 'Вай ба шаҳр меравад.', answer: 'in die', options: ['in die', 'in der', 'ins', 'in den'], explanation: 'die Stadt → Akkusativ: in die Stadt.' },
      { prompt: '___ gehst du?', promptTranslated: 'Ту ба куҷо меравӣ?', answer: 'Wohin', options: ['Wohin', 'Wo', 'Woher', 'Wann'], explanation: 'Wohin = ба куҷо (бо ҳаракат).' },
      { prompt: 'Ich bin ___ Kino. (ман он ҷо ҳастам)', promptTranslated: 'Ман дар кинотеатр ҳастам.', answer: 'im', options: ['im', 'ins', 'in den', 'in die'], explanation: 'Бе ҳаракат → Dativ: im Kino.' },
      { prompt: 'Am Sonntag gehen wir ___ Schwimmbad.', promptTranslated: 'Рӯзи якшанбе мо ба ҳавз меравем.', answer: 'ins', options: ['ins', 'im', 'in der', 'in den'], explanation: 'das Schwimmbad + ҳаракат → ins.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Lesen: Mein Hobby', lessonTitleTranslated: 'Хониш: Машғулияти ман',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Sandras Freizeit', titleTranslated: 'Вақти холии Сандра',
    passage: 'Sandra hat viele Hobbys. Am Montag spielt sie Tennis. Am Mittwoch geht sie ins Schwimmbad, denn sie schwimmt sehr gern. Am Freitag spielt sie Gitarre und singt. Sie hat auch eine Freundin, Maria. Zusammen gehen sie oft ins Kino. Filme sind für Sandra sehr interessant. Am Sonntag macht die Familie einen Ausflug. Dann fotografiert Sandra die Blumen und die Bäume.',
    passageTranslated: 'Сандра машғулиятҳои зиёд дорад. Рӯзи душанбе ӯ теннис бозӣ мекунад. Рӯзи чоршанбе ба ҳавз меравад, чунки шиноро хеле дӯст медорад. Рӯзи ҷумъа гитара менавозад ва суруд мехонад. Ӯ инчунин як дугона дорад — Мария. Онҳо якҷоя тез-тез ба кинотеатр мераванд. Филмҳо барои Сандра хеле ҷолибанд. Рӯзи якшанбе оила ба сайр мебарояд. Он гоҳ Сандра гулу дарахтонро сурат мегирад.',
    questions: [
      { question: 'Was macht Sandra am Montag?', questionTranslated: 'Сандра рӯзи душанбе чӣ мекунад?', options: ['Sie spielt Tennis', 'Sie singt', 'Sie fotografiert'], correctIndex: 0, explanation: 'Матн: Am Montag spielt sie Tennis.' },
      { question: 'Wohin geht Sandra am Mittwoch?', questionTranslated: 'Сандра рӯзи чоршанбе ба куҷо меравад?', options: ['Ins Schwimmbad', 'Ins Kino', 'Ins Theater'], correctIndex: 0, explanation: 'Матн: Am Mittwoch geht sie ins Schwimmbad.' },
      { question: 'Was macht Sandra mit Maria?', questionTranslated: 'Сандра бо Мария чӣ мекунад?', options: ['Sie gehen ins Kino', 'Sie spielen Fußball', 'Sie wandern'], correctIndex: 0, explanation: 'Матн: Zusammen gehen sie oft ins Kino.' },
      { question: 'Was macht Sandra am Sonntag?', questionTranslated: 'Сандра рӯзи якшанбе чӣ мекунад?', options: ['Einen Ausflug mit der Familie', 'Sie arbeitet', 'Sie spielt Klavier'], correctIndex: 0, explanation: 'Матн: Am Sonntag macht die Familie einen Ausflug.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Hast du Lust?', lessonTitleTranslated: 'Шунавоӣ: Хоҳиш дорӣ?',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Hast du Lust?', titleTranslated: 'Шунавоӣ: Хоҳиш дорӣ?',
    passage: 'Hallo Tim! Hast du am Samstag Zeit? Ja, warum? Ich will ins Konzert gehen. Die Karten kosten fünfzehn Euro. Das ist nicht teuer. Wann beginnt das Konzert? Um acht Uhr am Abend. Gut, ich komme gern mit.',
    passageTranslated: 'Салом Тим! Ту рӯзи шанбе вақт дорӣ? Бале, чаро? Ман ба консерт рафтан мехоҳам. Чиптаҳо понздаҳ евро арзиш доранд. Ин қиммат нест. Консерт кай оғоз мешавад? Соати ҳашти бегоҳ. Хуб, ман бо майл меоям.',
    questions: [
      { question: 'Wohin will die Person gehen?', questionTranslated: 'Шахс ба куҷо рафтан мехоҳад?', options: ['Ins Konzert', 'Ins Kino', 'Ins Stadion'], correctIndex: 0, explanation: 'Матн: Ich will ins Konzert gehen.' },
      { question: 'Wann ist das Konzert?', questionTranslated: 'Консерт кай аст?', options: ['Am Samstag', 'Am Sonntag', 'Am Montag'], correctIndex: 0, explanation: 'Матн: Hast du am Samstag Zeit?' },
      { question: 'Was kosten die Karten?', questionTranslated: 'Чиптаҳо чанд пул мебошанд?', options: ['Fünfzehn Euro', 'Fünfzig Euro', 'Fünf Euro'], correctIndex: 0, explanation: 'Матн: Die Karten kosten fünfzehn Euro.' },
      { question: 'Wann beginnt das Konzert?', questionTranslated: 'Консерт кай оғоз мешавад?', options: ['Um acht Uhr', 'Um sechs Uhr', 'Um zehn Uhr'], correctIndex: 0, explanation: 'Матн: Um acht Uhr am Abend.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: wollen und wohin', titleTranslated: 'Такрор: wollen ва wohin',
    passage: 'Mit "wollen" sagst du deinen Plan: Ich will Fußball spielen. Das zweite Verb steht am Ende. In einem Geschäft oder Restaurant ist "möchte" höflicher. Und bei der Frage "Wohin?" nimmst du in plus Akkusativ: Ich gehe ins Kino, in den Park, in die Stadt. Aber bei "Wo?" ohne Bewegung sagst du: Ich bin im Kino.',
    passageTranslated: 'Бо «wollen» нақшаи худро мегӯӣ: Ich will Fußball spielen. Феъли дуюм дар охир меистад. Дар мағоза ё ресторан «möchte» боадабтар аст. Ва дар саволи «Wohin?» in ва Akkusativ гирифта мешавад: Ich gehe ins Kino, in den Park, in die Stadt. Вале дар «Wo?» бе ҳаракат мегӯӣ: Ich bin im Kino.',
    questions: [
      { question: 'Wo steht das zweite Verb nach "wollen"?', questionTranslated: 'Феъли дуюм баъди «wollen» дар куҷо меистад?', options: ['Am Ende', 'Am Anfang', 'Nach dem Subjekt'], correctIndex: 0, explanation: 'Матн: Das zweite Verb steht am Ende.' },
      { question: 'Welcher Satz zeigt Bewegung?', questionTranslated: 'Кадом ҷумла ҲАРАКАТро нишон медиҳад?', options: ['Ich gehe ins Kino.', 'Ich bin im Kino.', 'Das Kino ist groß.'], correctIndex: 0, explanation: '«ins Kino» = Akkusativ, яъне ҳаракат.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Ein Wochenende mit Freunden', titleTranslated: 'Як истироҳат бо дӯстон',
    passage: 'Am Samstag hat Lukas eine Party. Er lädt seine Freunde ein. Anna bringt Musik und alle tanzen. Später spielen sie ein Spiel. Das Spiel ist sehr lustig. Am Sonntag wollen sie einen Ausflug machen. Sie fahren mit dem Bus in den Wald und machen ein Picknick. Draußen ist es warm und die Sonne scheint. Lukas fotografiert seine Freunde. Der Tag ist wunderbar und alle sind glücklich.',
    passageTranslated: 'Рӯзи шанбе Лукас шабнишинӣ дорад. Ӯ дӯстонашро даъват мекунад. Анна мусиқӣ меорад ва ҳама рақс мекунанд. Баъдтар онҳо як бозӣ мекунанд. Бозӣ хеле хандовар аст. Рӯзи якшанбе онҳо ба сайр баромадан мехоҳанд. Онҳо бо автобус ба ҷангал мераванд ва пикник мекунанд. Дар берун гарм аст ва офтоб медурахшад. Лукас дӯстонашро сурат мегирад. Рӯз аҷиб аст ва ҳама хушбахтанд.',
    questions: [
      { question: 'Was hat Lukas am Samstag?', questionTranslated: 'Лукас рӯзи шанбе чӣ дорад?', options: ['Eine Party', 'Ein Konzert', 'Ein Spiel im Stadion'], correctIndex: 0, explanation: 'Матн: Am Samstag hat Lukas eine Party.' },
      { question: 'Was bringt Anna?', questionTranslated: 'Анна чӣ меорад?', options: ['Musik', 'Karten', 'Einen Ball'], correctIndex: 0, explanation: 'Матн: Anna bringt Musik.' },
      { question: 'Wie ist das Spiel?', questionTranslated: 'Бозӣ чӣ гуна аст?', options: ['Sehr lustig', 'Langweilig', 'Schwer'], correctIndex: 0, explanation: 'Матн: Das Spiel ist sehr lustig.' },
      { question: 'Was wollen sie am Sonntag machen?', questionTranslated: 'Онҳо рӯзи якшанбе чӣ кардан мехоҳанд?', options: ['Einen Ausflug', 'Eine Party', 'Ins Kino gehen'], correctIndex: 0, explanation: 'Матн: Am Sonntag wollen sie einen Ausflug machen.' },
      { question: 'Womit fahren sie in den Wald?', questionTranslated: 'Онҳо бо чӣ ба ҷангал мераванд?', options: ['Mit dem Bus', 'Mit dem Zug', 'Mit dem Fahrrad'], correctIndex: 0, explanation: 'Матн: Sie fahren mit dem Bus in den Wald.' },
      { question: 'Wie ist das Wetter?', questionTranslated: 'Обу ҳаво чӣ гуна аст?', options: ['Warm und sonnig', 'Kalt', 'Es regnet'], correctIndex: 0, explanation: 'Матн: Draußen ist es warm und die Sonne scheint.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich will Fußball spielen.', 'Ich will spielen Fußball.', 'Ich will Fußball spiele.'], correctIndex: 0, explanation: 'Феъли дуюм дар охири ҷумла меистад.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Wir gehen in den Park.', 'Wir gehen in dem Park.', 'Wir gehen im den Park.'], correctIndex: 0, explanation: 'Ҳаракат → Akkusativ: in den Park.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Hast du Lust?', lessonTitleTranslated: 'Муколама: Хоҳиш дорӣ?',
  title: 'Hast du Lust?', titleTranslated: 'Хоҳиш дорӣ?',
  scenario: 'Ду дӯст нақшаи рӯзи истироҳатро мебанданд.',
  emoji: '🗣️',
  lines: [
    { speaker: 'Tim', text: 'Hallo! Was machst du am Wochenende?', translation: 'Салом! Ту рӯзи истироҳат чӣ мекунӣ?', isUser: false },
    { speaker: 'Ich', text: 'Noch nichts. Hast du eine Idee?', translation: 'Ҳанӯз ҳеҷ чиз. Ту фикре дорӣ?', isUser: true },
    { speaker: 'Tim', text: 'Ich will ins Kino gehen. Hast du Lust?', translation: 'Ман ба кинотеатр рафтан мехоҳам. Хоҳиш дорӣ?', isUser: false },
    { speaker: 'Ich', text: 'Ja, gern! Was ist der Film?', translation: 'Бале, бо майл! Филм чӣ аст?', isUser: true },
    { speaker: 'Tim', text: 'Er ist neu und sehr spannend.', translation: 'Он нав ва хеле шавқовар аст.', isUser: false },
    { speaker: 'Ich', text: 'Was kostet die Karte?', translation: 'Чипта чанд пул аст?', isUser: true },
    { speaker: 'Tim', text: 'Zehn Euro. Das ist nicht teuer.', translation: 'Даҳ евро. Ин қиммат нест.', isUser: false },
    { speaker: 'Ich', text: 'Wann beginnt der Film?', translation: 'Филм кай оғоз мешавад?', isUser: true },
    { speaker: 'Tim', text: 'Um sieben Uhr. Wir treffen uns um halb sieben.', translation: 'Соати ҳафт. Мо соати шашуним вомехӯрем.', isUser: false },
    { speaker: 'Ich', text: 'Super, bis Samstag!', translation: 'Олӣ, то шанбе!', isUser: true },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['das Hobby', 'der Sport', 'die Musik', 'das Kino', 'spielen', 'singen', 'der Film', 'die Party'],
};
