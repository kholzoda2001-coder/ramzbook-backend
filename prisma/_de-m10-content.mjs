export const MODULE = {
  order: 9,
  title: 'Tagesablauf und Uhrzeit',
  titleTranslated: 'Реҷаи рӯз ва Вақт',
  icon: '⏰',
  color: 'bg-indigo-600'
};

export const ORDER = [
  'vocab:Tageszeiten (Вақтҳои рӯз)',
  'vocab:Uhrzeit (Соат ва Вақт)',
  'vocab:Alltagsaktivitäten (Корҳои ҳаррӯза)',
  'grammar:0',
  'vocab:Häufigkeit (Такроршавӣ)',
  'vocab:Noch mehr Alltag',
  'grammar:1',
  'grammar:2',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue:0',
  'writing:0',
  'comprehension:review',
  'comprehension:test',
];

export const VOCAB = [
  {
    title: 'Tageszeiten (Вақтҳои рӯз)',
    words: [
      { word: 'der Morgen', existing: true, translation: 'саҳар (субҳ)', emoji: '🌅', ipa: '/deːɐ̯ ˈmɔʁɡən/', example: 'Am Morgen trinke ich Kaffee.', exampleTrans: 'Саҳар ман қаҳва менӯшам.' },
      { word: 'der Vormittag', existing: true, translation: 'пеш аз зуҳр', emoji: '🕙', ipa: '/ˈfoːɐ̯mɪˌtaːk/', example: 'Ich lerne am Vormittag.', exampleTrans: 'Ман пеш аз зуҳр меомӯзам.' },
      { word: 'der Mittag', existing: true, translation: 'нисфирӯзӣ', emoji: '🕛', ipa: '/ˈmɪtaːk/', example: 'Wir essen am Mittag.', exampleTrans: 'Мо нисфирӯзӣ хӯрок мехӯрем.' },
      { word: 'der Nachmittag', existing: true, translation: 'баъд аз зуҳр', emoji: '🕒', ipa: '/ˈnaːxmɪˌtaːk/', example: 'Am Nachmittag treffe ich Freunde.', exampleTrans: 'Баъд аз зуҳр ман бо дӯстон вомехӯрам.' },
      { word: 'der Abend', existing: true, translation: 'бегоҳ (шом)', emoji: '🌆', ipa: '/ˈaːbənt/', example: 'Der Abend ist schön.', exampleTrans: 'Бегоҳӣ зебо аст.' },
      { word: 'die Nacht', existing: true, translation: 'шаб', emoji: '🌃', ipa: '/naxt/', example: 'In der Nacht schlafe ich.', exampleTrans: 'Шабона ман хоб мекунам.' }
    ]
  },
  {
    title: 'Uhrzeit (Соат ва Вақт)',
    words: [
      { word: 'die Uhr', existing: true, translation: 'соат', emoji: '⌚', ipa: '/uːɐ̯/', example: 'Es ist acht Uhr.', exampleTrans: 'Соат ҳашт аст.' },
      { word: 'Viertel nach', existing: true, translation: 'чоряк гузашт', emoji: '🕟', ipa: '/ˈfɪʁtəl naːx/', example: 'Es ist Viertel nach zehn.', exampleTrans: 'Аз даҳ чоряк гузашт.' },
      { word: 'halb', existing: true, translation: 'ним (30 дақиқа)', emoji: '🕧', ipa: '/halp/', example: 'Es ist halb drei.', exampleTrans: 'Соат дую ним аст.' },
      { word: 'Viertel vor', existing: true, translation: 'чоряк мондааст', emoji: '🕢', ipa: '/ˈfɪʁtəl foːɐ̯/', example: 'Es ist Viertel vor acht.', exampleTrans: 'Ба ҳашт чоряк мондааст.' },
      { word: 'die Minute', existing: true, translation: 'дақиқа', emoji: '⏱️', ipa: '/miˈnuːtə/', example: 'Eine Stunde hat 60 Minuten.', exampleTrans: 'Як соат 60 дақиқа дорад.' },
      { word: 'spät', existing: true, translation: 'дер', pos: 'adverb', emoji: '🏃', ipa: '/ʃpɛːt/', example: 'Es ist schon spät.', exampleTrans: 'Аллакай дер шуд.' }
    ]
  },
  {
    title: 'Alltagsaktivitäten (Корҳои ҳаррӯза)',
    words: [
      { word: 'aufwachen', existing: true, translation: 'бедор шудан', pos: 'verb', emoji: '🥱', ipa: '/ˈaʊ̯fˌvaxən/', example: 'Ich wache um sechs Uhr auf.', exampleTrans: 'Ман соати шаш бедор мешавам.' },
      { word: 'aufstehen', existing: true, translation: 'аз хоб хестан', pos: 'verb', emoji: '🛏️', ipa: '/ˈaʊ̯fˌʃteːən/', example: 'Wann stehst du auf?', exampleTrans: 'Ту кай аз хоб мехезӣ?' },
      { word: 'duschen', existing: true, translation: 'душ қабул кардан', pos: 'verb', emoji: '🚿', ipa: '/ˈduːʃən/', example: 'Ich dusche jeden Tag.', exampleTrans: 'Ман ҳар рӯз душ қабул мекунам.' },
      { word: 'arbeiten', existing: true, translation: 'кор кардан', pos: 'verb', emoji: '💼', ipa: '/ˈaʁbaɪ̯tən/', example: 'Ich arbeite im Büro.', exampleTrans: 'Ман дар идора кор мекунам.' },
      { word: 'schlafen', existing: true, translation: 'хоб кардан', pos: 'verb', emoji: '💤', ipa: '/ˈʃlaːfən/', example: 'Ich schlafe acht Stunden.', exampleTrans: 'Ман ҳашт соат хоб мекунам.' },
      { word: 'fernsehen', existing: true, translation: 'телевизор тамошо кардан', pos: 'verb', emoji: '📺', ipa: '/ˈfɛʁnˌzeːən/', example: 'Wir sehen am Abend fern.', exampleTrans: 'Мо бегоҳӣ телевизор тамошо мекунем.' }
    ]
  },
  {
    title: 'Häufigkeit (Такроршавӣ)',
    words: [
      { word: 'immer', existing: true, translation: 'ҳамеша', pos: 'adverb', emoji: '🔄', ipa: '/ˈɪmɐ/', example: 'Ich trinke immer Wasser.', exampleTrans: 'Ман ҳамеша об менӯшам.' },
      { word: 'oft', existing: true, translation: 'тез-тез', pos: 'adverb', emoji: '🔁', ipa: '/ɔft/', example: 'Er spielt oft Fußball.', exampleTrans: 'Ӯ тез-тез футбол бозӣ мекунад.' },
      { word: 'manchmal', existing: true, translation: 'баъзан', pos: 'adverb', emoji: '🤷', ipa: '/ˈmançmaːl/', example: 'Manchmal lese ich ein Buch.', exampleTrans: 'Баъзан ман китоб мехонам.' },
      { word: 'selten', existing: true, translation: 'кам (кам ҳолатҳо)', pos: 'adverb', emoji: '📉', ipa: '/ˈzɛltən/', example: 'Ich esse selten Fastfood.', exampleTrans: 'Ман кам хӯроки тезтайёр мехӯрам.' },
      { word: 'nie', existing: true, translation: 'ҳеҷ гоҳ', pos: 'adverb', emoji: '❌', ipa: '/niː/', example: 'Ich rauche nie.', exampleTrans: 'Ман ҳеҷ гоҳ тамоку намекашам.' },
      { word: 'jeden Tag', existing: true, translation: 'ҳар рӯз', pos: 'phrase', emoji: '📅', ipa: '/ˈjeːdən taːk/', example: 'Ich lerne jeden Tag Deutsch.', exampleTrans: 'Ман ҳар рӯз немисӣ меомӯзам.' }
    ]
  },
  {
    title: 'Noch mehr Alltag',
    words: [
      { word: 'frühstücken', translation: 'наҳорӣ кардан', emoji: '🥣', ipa: '/ˈfʁyːʃtʏkən/',
        example: 'Ich frühstücke um sieben.', exampleTrans: 'Ман соати ҳафт наҳорӣ мекунам.' },
      { word: 'aufräumen', translation: 'тартиб додан', emoji: '🧹', ipa: '/ˈaʊ̯fˌʁɔɪ̯mən/',
        example: 'Ich räume mein Zimmer auf.', exampleTrans: 'Ман ҳуҷраамро тартиб медиҳам.' },
      { word: 'einkaufen', translation: 'харид кардан', emoji: '🛍️', ipa: '/ˈaɪ̯nˌkaʊ̯fən/',
        example: 'Am Samstag kaufe ich ein.', exampleTrans: 'Рӯзи шанбе ман харид мекунам.' },
      { word: 'anrufen', translation: 'занг задан', emoji: '📱', ipa: '/ˈanˌʁuːfən/',
        example: 'Ich rufe meine Mutter an.', exampleTrans: 'Ман ба модарам занг мезанам.' },
      { word: 'zurückkommen', translation: 'баргаштан', emoji: '🔙', ipa: '/t͡suˈʁʏkˌkɔmən/',
        example: 'Er kommt um acht zurück.', exampleTrans: 'Ӯ соати ҳашт бармегардад.' },
      { word: 'enden', translation: 'тамом шудан', emoji: '🏁', ipa: '/ˈɛndən/',
        example: 'Die Arbeit endet um fünf.', exampleTrans: 'Кор соати панҷ тамом мешавад.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Trennbare Verben (Феълҳои ҷудошаванда)',
    lessonTitleTranslated: 'Феълҳои ҷудошаванда',
    emoji: '✂️',
    title: 'Trennbare Verben',
    explanation:
`Дар олмонӣ як гурӯҳ феълҳо **ду қисм** доранд: як пешванди хурд (auf-, an-, fern-, ein-, aus-) ва худи феъл.

Дар луғат онҳо якҷоя навишта мешаванд — **auf**stehen, **fern**sehen, **auf**wachen. Вале дар ҶУМЛА қисми хурд ҷудо шуда, ба **ОХИРИ ҷумла** меравад:

- aufstehen → Ich **stehe** um sieben Uhr **auf**.
- fernsehen → Er **sieht** am Abend **fern**.
- aufwachen → Wann **wachst** du **auf**?

**Чаро ин барои тоҷик душвор аст:** дар тоҷикӣ ҳар феъл як бутун аст — «аз хоб хестан» ҳеҷ гоҳ ду пора намешавад. Дар олмонӣ бошад, ҷумла то охир гӯш карда мешавад, чунки маҳз калимаи охирин маънои феълро тамом мекунад: «Ich stehe …» ҳанӯз маълум нест — *stehe auf* (мехезам) ё танҳо *stehe* (меистам).

**Қоидаи ҷой:** феъли асосӣ ҳамеша дар ҷои ДУЮМ, пешванд дар ОХИР.`,
    rules: [
      { pattern: 'aufstehen → Ich stehe … auf', note: 'Пешванд аз феъл ҷудо шуда, ба охири ҷумла меравад.' },
      { pattern: 'Феъл — ҷои 2, пешванд — охир', note: 'Er sieht am Abend fern. Дар мобайн вақт ва ҷой меистад.' },
      { pattern: 'Дар савол ҳам ҳамин тавр', note: 'Wann stehst du auf? — «auf» боз дар охир.' },
      { pattern: 'Феълҳои модули мо', note: 'aufwachen (бедор шудан), aufstehen (аз хоб хестан), fernsehen (телевизор дидан).' },
    ],
    examples: [
      { sentence: 'Ich stehe um sieben Uhr auf.', translation: 'Ман соати ҳафт аз хоб мехезам.', highlight: 'stehe ... auf' },
      { sentence: 'Am Abend sieht er fern.', translation: 'Бегоҳ ӯ телевизор тамошо мекунад.', highlight: 'sieht ... fern' },
      { sentence: 'Wann wachst du auf?', translation: 'Ту кай бедор мешавӣ?', highlight: 'wachst ... auf' },
      { sentence: 'Wir stehen jeden Tag früh auf.', translation: 'Мо ҳар рӯз барвақт мехезем.', highlight: 'stehen ... auf' },
      { sentence: 'Sie sieht nach dem Essen fern.', translation: 'Вай баъди хӯрок телевизор тамошо мекунад.', highlight: 'fern' },
      { sentence: 'Ich wache um sechs Uhr auf.', translation: 'Ман соати шаш бедор мешавам.', highlight: 'wache ... auf' },
    ],
    exercises: [
      { prompt: 'Ich ___ um 6 Uhr ___ . (aufstehen)', promptTranslated: 'Ман соати 6 аз хоб мехезам.', options: ['stehe auf', 'auf stehe', 'aufstehe', 'stehst auf'], answer: 'stehe auf', explanation: 'Пешванди «auf» ба охири ҷумла меравад.' },
      { prompt: 'Er ___ am Abend ___ . (fernsehen)', promptTranslated: 'Ӯ бегоҳ телевизор тамошо мекунад.', options: ['sieht fern', 'fern sieht', 'sehe fern', 'fernsieht'], answer: 'sieht fern', explanation: 'Барои «er» — sieht, ва «fern» дар охир.' },
      { prompt: 'Wann ___ du ___ ? (aufwachen)', promptTranslated: 'Ту кай бедор мешавӣ?', options: ['wachst auf', 'auf wachst', 'wachst aufen', 'wache auf'], answer: 'wachst auf', explanation: 'Барои «du» — wachst, «auf» дар охир.' },
      { prompt: 'Wir ___ jeden Tag früh ___ . (aufstehen)', promptTranslated: 'Мо ҳар рӯз барвақт мехезем.', options: ['stehen auf', 'auf stehen', 'aufstehen', 'steht auf'], answer: 'stehen auf', explanation: 'Барои «wir» — stehen, «auf» дар охир.' },
      { prompt: 'Ich ___ um zehn Uhr ___ . (fernsehen)', promptTranslated: 'Ман соати даҳ телевизор тамошо мекунам.', options: ['sehe fern', 'fern sehe', 'fernsehe', 'siehst fern'], answer: 'sehe fern', explanation: 'Барои «ich» — sehe, «fern» дар охир.' },
      { prompt: 'Дар кадом ҷумла пешванд ДУРУСТ истодааст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', options: ['Ich stehe um acht Uhr auf.', 'Ich aufstehe um acht Uhr.', 'Ich auf stehe um acht Uhr.', 'Ich stehe auf um acht Uhr.'], answer: 'Ich stehe um acht Uhr auf.', explanation: 'Феъл — ҷои дуюм, пешванд — ОХИРИ ҷумла.' },
    ],
  },
  {
    lessonTitle: 'Wie oft? (Такроршавӣ)',
    lessonTitleTranslated: 'Чанд маротиба? — зарфҳои такрор',
    emoji: '🔁',
    title: 'Wie oft? — immer, oft, manchmal, selten, nie',
    explanation:
`Барои гуфтани он ки коре **чанд маротиба** рӯй медиҳад, зарфҳои зерин истифода мешаванд — аз ҳама зиёд то ҳеҷ:

- **immer** — ҳамеша (100%)
- **oft** — тез-тез
- **manchmal** — баъзан
- **selten** — кам
- **nie** — ҳеҷ гоҳ (0%)

**Ҷои ин калимаҳо дар ҷумла:** баъди феъл.

- Ich **stehe immer** früh auf. (Ман ҳамеша барвақт мехезам.)
- Er **arbeitet oft** am Abend.
- Wir **sehen manchmal** fern.

**Доми муҳим — «nie» инкорро ду бор намегирад.** Дар тоҷикӣ мо мегӯем «ҳеҷ гоҳ НАмеравам» — ду инкор. Дар олмонӣ танҳо ЯК инкор мешавад:

- ✅ Ich gehe **nie** ins Kino.
- ❌ Ich gehe nie **nicht** ins Kino.

Саволи он: **Wie oft …?** — Wie oft arbeitest du? (Ту чанд маротиба кор мекунӣ?)`,
    rules: [
      { pattern: 'immer > oft > manchmal > selten > nie', note: 'Аз ҳамеша то ҳеҷ гоҳ — ҳамин тартиб.' },
      { pattern: 'Субъект + феъл + зарф', note: 'Ich stehe immer früh auf — зарф баъди феъл меистад.' },
      { pattern: 'nie бе nicht', note: 'Дар олмонӣ ЯК инкор бас аст: Ich sehe nie fern.' },
      { pattern: 'Wie oft …?', note: 'Саволи такроршавӣ: Wie oft gehst du in den Park?' },
    ],
    examples: [
      { sentence: 'Ich stehe immer früh auf.', translation: 'Ман ҳамеша барвақт мехезам.', highlight: 'immer' },
      { sentence: 'Er arbeitet oft am Abend.', translation: 'Ӯ тез-тез бегоҳ кор мекунад.', highlight: 'oft' },
      { sentence: 'Wir sehen manchmal fern.', translation: 'Мо баъзан телевизор тамошо мекунем.', highlight: 'manchmal' },
      { sentence: 'Sie schläft selten am Nachmittag.', translation: 'Вай кам баъд аз зуҳр хоб мекунад.', highlight: 'selten' },
      { sentence: 'Ich bin nie spät.', translation: 'Ман ҳеҷ гоҳ дер намекунам.', highlight: 'nie' },
      { sentence: 'Wie oft duschst du?', translation: 'Ту чанд маротиба душ мегирӣ?', highlight: 'Wie oft' },
    ],
    exercises: [
      { prompt: 'Ich stehe ___ um sechs Uhr auf. (100%)', promptTranslated: 'Ман ҳамеша соати шаш мехезам.', answer: 'immer', options: ['immer', 'nie', 'selten', 'manchmal'], explanation: 'immer = ҳамеша (100%).' },
      { prompt: 'Er arbeitet ___ am Wochenende. (0%)', promptTranslated: 'Ӯ ҳеҷ гоҳ рӯзи истироҳат кор намекунад.', answer: 'nie', options: ['nie', 'immer', 'oft', 'manchmal'], explanation: 'nie = ҳеҷ гоҳ (0%).' },
      { prompt: 'Wir sehen ___ fern. (баъзан)', promptTranslated: 'Мо баъзан телевизор тамошо мекунем.', answer: 'manchmal', options: ['manchmal', 'immer', 'nie', 'selten'], explanation: 'manchmal = баъзан.' },
      { prompt: '___ oft gehst du in den Park?', promptTranslated: 'Ту чанд маротиба ба боғ меравӣ?', answer: 'Wie', options: ['Wie', 'Was', 'Wo', 'Wann'], explanation: 'Саволи такроршавӣ: Wie oft …?' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Ich sehe nie fern.', options: ['Ich sehe nie fern.', 'Ich sehe nie nicht fern.', 'Ich nie sehe fern.', 'Ich nicht sehe nie fern.'], explanation: 'Дар олмонӣ ЯК инкор: nie бе nicht, ва зарф баъди феъл.' },
      { prompt: 'Sie schläft ___ am Tag. (кам)', promptTranslated: 'Вай кам дар рӯз хоб мекунад.', answer: 'selten', options: ['selten', 'oft', 'immer', 'nie'], explanation: 'selten = кам.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Ich kann und ich muss', lessonTitleTranslated: 'Грамматика: Метавонам ва бояд',
    title: 'Modalverben: können und müssen', titleTranslated: 'Феълҳои модалӣ: können ва müssen',
    emoji: '💪',
    explanation:
`Ду феъли модалии аз ҳама зарурӣ дар А1:

**können — тавонистан (қобилият / имкон):**
ich **kann** · du **kannst** · er/sie/es **kann** · wir **können** · ihr **könnt** · sie/Sie **können**

- Ich **kann** um sieben Uhr **aufstehen**. (Ман соати ҳафт хеста метавонам.)
- **Kannst** du Deutsch **sprechen**?

**müssen — бояд (зарурат):**
ich **muss** · du **musst** · er/sie/es **muss** · wir **müssen** · ihr **müsst** · sie/Sie **müssen**

- Ich **muss** am Morgen **arbeiten**. (Ман субҳ бояд кор кунам.)
- Wir **müssen** früh **aufstehen**.

**Ду доми калон:**

**1. ich ва er шакли ЯКХЕЛА доранд** — ich kann / er kann, ich muss / er muss. Дар дигар феълҳо ин тавр нест (ich wohne / er wohnt).

**2. Феъли дуюм ҳамеша ба ОХИР меравад ва дар шакли луғавӣ мемонад:**
> Ich **muss** am Morgen **arbeiten**. ✅
> ~~Ich muss arbeite am Morgen.~~ ❌

Дар тоҷикӣ мо мегӯем «ман бояд кор кунам» — ҳарду феъл паҳлӯи ҳам. Дар олмонӣ яке дуюм, дигаре охир меистад.

**Инкор:** Ich **kann nicht** kommen. · Ich **muss nicht** arbeiten (лозим нест).`,
    rules: [
      { pattern: 'können = тавонистан', note: 'ich kann, du kannst, er kann, wir/sie können, ihr könnt.' },
      { pattern: 'müssen = бояд', note: 'ich muss, du musst, er muss, wir/sie müssen, ihr müsst.' },
      { pattern: 'ich ва er — шакли якхела', note: 'ich kann / er kann · ich muss / er muss.' },
      { pattern: 'Феъли дуюм — дар ОХИР', note: 'Ich muss am Morgen arbeiten. Шакли луғавӣ (Infinitiv).' },
    ],
    examples: [
      { sentence: 'Ich kann um sieben Uhr aufstehen.', translation: 'Ман соати ҳафт хеста метавонам.', highlight: 'kann ... aufstehen' },
      { sentence: 'Kannst du Deutsch sprechen?', translation: 'Ту олмонӣ гап зада метавонӣ?', highlight: 'Kannst' },
      { sentence: 'Ich muss am Morgen arbeiten.', translation: 'Ман субҳ бояд кор кунам.', highlight: 'muss ... arbeiten' },
      { sentence: 'Wir müssen früh aufstehen.', translation: 'Мо бояд барвақт хезем.', highlight: 'müssen ... aufstehen' },
      { sentence: 'Er kann heute nicht kommen.', translation: 'Ӯ имрӯз омада наметавонад.', highlight: 'kann ... nicht' },
      { sentence: 'Musst du jeden Tag arbeiten?', translation: 'Ту бояд ҳар рӯз кор кунӣ?', highlight: 'Musst' },
    ],
    exercises: [
      { prompt: 'Ich ___ um sieben Uhr aufstehen. (können)', promptTranslated: 'Ман соати ҳафт хеста метавонам.', answer: 'kann', options: ['kann', 'kannst', 'können', 'könnt'], explanation: 'Барои «ich» — kann.' },
      { prompt: '___ du Deutsch sprechen? (können)', promptTranslated: 'Ту олмонӣ гап зада метавонӣ?', answer: 'Kannst', options: ['Kannst', 'Kann', 'Können', 'Könnt'], explanation: 'Барои «du» — kannst.' },
      { prompt: 'Ich ___ am Morgen arbeiten. (müssen)', promptTranslated: 'Ман субҳ бояд кор кунам.', answer: 'muss', options: ['muss', 'musst', 'müssen', 'müsst'], explanation: 'Барои «ich» — muss.' },
      { prompt: 'Wir ___ früh aufstehen. (müssen)', promptTranslated: 'Мо бояд барвақт хезем.', answer: 'müssen', options: ['müssen', 'muss', 'musst', 'müsst'], explanation: 'Барои «wir» — müssen.' },
      { prompt: 'Er ___ heute nicht kommen. (können)', promptTranslated: 'Ӯ имрӯз омада наметавонад.', answer: 'kann', options: ['kann', 'kannst', 'können', 'könnt'], explanation: 'Барои «er» — kann (мисли ich).' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Ich muss am Morgen arbeiten.', options: ['Ich muss am Morgen arbeiten.', 'Ich muss arbeite am Morgen.', 'Ich arbeiten muss am Morgen.', 'Ich muss am Morgen arbeite.'], explanation: 'Феъли модалӣ — ҷои дуюм, Infinitiv — ОХИР.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Mein Tagesablauf', lessonTitleTranslated: 'Реҷаи рӯзи ман',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: 'Mein Tagesablauf', titleTranslated: 'Реҷаи рӯзи ман',
    passage: 'Mein Name ist Lukas. Ich stehe jeden Tag um halb sieben auf. Zuerst dusche ich und dann frühstücke ich. Um acht Uhr fahre ich zur Arbeit. Ich arbeite von neun bis fünf Uhr. Am Mittag esse ich mit meinen Kollegen. Um sechs Uhr abends komme ich nach Hause. Oft koche ich das Abendessen selbst. Danach sehe ich fern oder lese ein Buch. Ich gehe immer um elf Uhr schlafen.',
    passageTranslated: 'Номи ман Лукас аст. Ман ҳар рӯз соати шашу ним аз хоб мехезам. Аввал ман душ қабул мекунам ва баъд наҳорӣ мекунам. Соати ҳашт ман ба кор меравам. Ман аз соати нӯҳ то панҷ кор мекунам. Нисфирӯзӣ ман бо ҳамкоронам хӯрок мехӯрам. Соати шаши бегоҳ ман ба хона меоям. Тез-тез ман худам хӯроки шом мепазам. Баъд аз он ман телевизор тамошо мекунам ё китоб мехонам. Ман ҳамеша соати ёздаҳ хоб мекунам.',
    questions: [
      {
        question: 'Wann steht Lukas auf?',
        questionTranslated: 'Лукас кай аз хоб мехезад?',
        options: ['Um sechs Uhr', 'Um halb sieben', 'Um sieben Uhr', 'Um acht Uhr'],
        correctIndex: 1,
        explanation: 'Дар матн омадааст: "Ich stehe jeden Tag um halb sieben auf." (Соати 6:30).'
      },
      {
        question: 'Was macht Lukas zuerst?',
        questionTranslated: 'Лукас аввал чӣ кор мекунад?',
        options: ['Er frühstückt', 'Er arbeitet', 'Er duscht', 'Er sieht fern'],
        correctIndex: 2,
        explanation: 'Дар матн омадааст: "Zuerst dusche ich..." (Аввал душ қабул мекунам).'
      },
      {
        question: 'Bis wann arbeitet er?',
        questionTranslated: 'Ӯ то кай кор мекунад?',
        options: ['Bis vier Uhr', 'Bis fünf Uhr', 'Bis sechs Uhr', 'Bis Mittag'],
        correctIndex: 1,
        explanation: 'Дар матн: "Ich arbeite von neun bis fünf Uhr." (То соати 5 кор мекунад).'
      },
      {
        question: 'Was macht er nach dem Abendessen?',
        questionTranslated: 'Ӯ баъд аз хӯроки шом чӣ кор мекунад?',
        options: ['Er geht spazieren', 'Er arbeitet', 'Er sieht fern oder liest', 'Er geht einkaufen'],
        correctIndex: 2,
        explanation: 'Ӯ мегӯяд: "Danach sehe ich fern oder lese ein Buch."'
      },
      {
        question: 'Wann geht Lukas schlafen?',
        questionTranslated: 'Лукас кай хоб мекунад?',
        options: ['Um zehn Uhr', 'Um halb elf', 'Um elf Uhr', 'Um Mitternacht'],
        correctIndex: 2,
        explanation: 'Дар охири матн омадааст: "Ich gehe immer um elf Uhr schlafen." (Соати 11 хоб мекунад).'
      }
    ]
  },
  {
    slot: 'listening',
    lessonTitle: 'Am Wochenende', lessonTitleTranslated: 'Дар охири ҳафта',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: 'Hören: Am Wochenende', titleTranslated: 'Шунидан: Дар охири ҳафта',
    passage: 'Hallo, ich bin Julia. Am Wochenende stehe ich spät auf, meistens erst um zehn Uhr. Am Samstagvormittag mache ich Sport oder gehe einkaufen. Am Nachmittag treffe ich oft meine Freunde. Wir gehen zusammen spazieren oder trinken Kaffee in einem Café. Am Sonntag habe ich Zeit für meine Familie. Wir kochen zusammen und spielen Spiele. Ich liebe das Wochenende!',
    passageTranslated: 'Салом, ман Юлия ҳастам. Дар охири ҳафта ман дер аз хоб мехезам, одатан соати даҳ. Пеш аз зуҳри рӯзи Шанбе ман варзиш мекунам ё ба харид меравам. Баъд аз зуҳр ман тез-тез бо дӯстонам вомехӯрам. Мо якҷоя сайр мекунем ё дар қаҳвахона қаҳва менӯшем. Рӯзи Якшанбе ман барои оилаам вақт дорам. Мо якҷоя хӯрок мепазем ва бозӣ мекунем. Ман охири ҳафтаро дӯст медорам!',
    questions: [
      {
        question: 'Wann steht Julia am Wochenende auf?',
        questionTranslated: 'Юлия дар охири ҳафта кай аз хоб мехезад?',
        options: ['Früh, um acht Uhr', 'Spät, um zehn Uhr', 'Um neun Uhr', 'Um elf Uhr'],
        correctIndex: 1,
        explanation: 'Вай мегӯяд: "...meistens erst um zehn Uhr." (Одатан соати даҳ).'
      },
      {
        question: 'Was macht sie am Samstagvormittag?',
        questionTranslated: 'Вай пеш аз зуҳри Шанбе чӣ кор мекунад?',
        options: ['Sie schläft', 'Sie arbeitet', 'Sie macht Sport oder geht einkaufen', 'Sie sieht fern'],
        correctIndex: 2,
        explanation: 'Вай мегӯяд: "Am Samstagvormittag mache ich Sport oder gehe einkaufen."'
      },
      {
        question: 'Mit wem trinkt sie Kaffee?',
        questionTranslated: 'Вай бо кӣ қаҳва менӯшад?',
        options: ['Mit ihrer Familie', 'Mit ihren Freunden', 'Mit Kollegen', 'Allein'],
        correctIndex: 1,
        explanation: 'Вай дӯстонашро вомехӯрад ва бо онҳо қаҳва менӯшад: "Wir gehen zusammen... trinken Kaffee".'
      },
      {
        question: 'Was macht sie am Sonntag?',
        questionTranslated: 'Рӯзи Якшанбе вай чӣ кор мекунад?',
        options: ['Sie geht ins Büro', 'Sie trifft Freunde', 'Sie verbringt Zeit mit der Familie', 'Sie reist'],
        correctIndex: 2,
        explanation: 'Вай мегӯяд: "Am Sonntag habe ich Zeit für meine Familie."'
      }
    ]
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Der Tagesablauf', titleTranslated: 'Такрор: Реҷаи рӯз',
    passage: 'Trennbare Verben haben zwei Teile. Im Satz geht der kleine Teil ans Ende: aufstehen wird zu "Ich stehe um sieben Uhr auf". fernsehen wird zu "Ich sehe am Abend fern". Für die Häufigkeit nimmst du immer, oft, manchmal, selten oder nie. Diese Wörter stehen nach dem Verb: Ich stehe immer früh auf. Und "nie" braucht kein "nicht".',
    passageTranslated: 'Феълҳои ҷудошаванда ду қисм доранд. Дар ҷумла қисми хурд ба ОХИР меравад: aufstehen → «Ich stehe um sieben Uhr auf». fernsehen → «Ich sehe am Abend fern». Барои такроршавӣ immer, oft, manchmal, selten ё nie гирифта мешавад. Ин калимаҳо БАЪДИ феъл меистанд: Ich stehe immer früh auf. Ва «nie» ба «nicht» эҳтиёҷ надорад.',
    questions: [
      { question: 'Wo steht der kleine Teil von "aufstehen" im Satz?', questionTranslated: 'Қисми хурди «aufstehen» дар ҷумла дар куҷо меистад?', options: ['Am Ende', 'Am Anfang', 'Nach dem Subjekt'], correctIndex: 0, explanation: 'Матн: Im Satz geht der kleine Teil ans Ende.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich sehe nie fern.', 'Ich sehe nie nicht fern.', 'Ich nie sehe fern.'], correctIndex: 0, explanation: 'Матн: "nie" braucht kein "nicht" — ва зарф баъди феъл меистад.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Der Tag von Markus', titleTranslated: 'Рӯзи Маркус',
    passage: 'Markus wacht jeden Tag um sechs Uhr auf. Er steht um Viertel nach sechs auf und duscht. Am Vormittag arbeitet er. Am Mittag isst er im Restaurant. Am Nachmittag geht er oft in den Park. Am Abend sieht er fern. Er schläft immer um halb elf. Markus ist nie spät.',
    passageTranslated: 'Маркус ҳар рӯз соати шаш бедор мешавад. Ӯ дар соати шашу понздаҳ аз хоб мехезад ва душ мегирад. Пеш аз зуҳр ӯ кор мекунад. Нисфирӯзӣ дар ресторан хӯрок мехӯрад. Баъд аз зуҳр ӯ тез-тез ба боғ меравад. Бегоҳ телевизор тамошо мекунад. Ӯ ҳамеша дар соати даҳу ним хоб мекунад. Маркус ҳеҷ гоҳ дер намекунад.',
    questions: [
      { question: 'Wann wacht Markus auf?', questionTranslated: 'Маркус кай бедор мешавад?', options: ['Um sechs Uhr', 'Um sieben Uhr', 'Um acht Uhr'], correctIndex: 0, explanation: 'Матн: Markus wacht jeden Tag um sechs Uhr auf.' },
      { question: 'Was macht Markus um Viertel nach sechs?', questionTranslated: 'Маркус дар соати шашу понздаҳ чӣ мекунад?', options: ['Er steht auf', 'Er schläft', 'Er arbeitet'], correctIndex: 0, explanation: 'Матн: Er steht um Viertel nach sechs auf.' },
      { question: 'Wann arbeitet Markus?', questionTranslated: 'Маркус кай кор мекунад?', options: ['Am Vormittag', 'Am Abend', 'In der Nacht'], correctIndex: 0, explanation: 'Матн: Am Vormittag arbeitet er.' },
      { question: 'Wo isst Markus am Mittag?', questionTranslated: 'Маркус нисфирӯзӣ дар куҷо хӯрок мехӯрад?', options: ['Im Restaurant', 'Im Park', 'Im Hotel'], correctIndex: 0, explanation: 'Матн: Am Mittag isst er im Restaurant.' },
      { question: 'Wie oft geht er am Nachmittag in den Park?', questionTranslated: 'Ӯ баъд аз зуҳр чанд маротиба ба боғ меравад?', options: ['Oft', 'Nie', 'Selten'], correctIndex: 0, explanation: 'Матн: Am Nachmittag geht er oft in den Park.' },
      { question: 'Was macht Markus am Abend?', questionTranslated: 'Маркус бегоҳ чӣ мекунад?', options: ['Er sieht fern', 'Er duscht', 'Er arbeitet'], correctIndex: 0, explanation: 'Матн: Am Abend sieht er fern.' },
      { question: 'Wann schläft Markus?', questionTranslated: 'Маркус кай хоб мекунад?', options: ['Um halb elf', 'Um elf Uhr', 'Um zehn Uhr'], correctIndex: 0, explanation: 'Матн: Er schläft immer um halb elf (10:30).' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich stehe um sieben Uhr auf.', 'Ich aufstehe um sieben Uhr.', 'Ich auf stehe um sieben Uhr.'], correctIndex: 0, explanation: 'Феъли ҷудошаванда: "auf" ба охири ҷумла меравад.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Verabredung (Вохӯрӣ таъин кардан)',
  lessonTitleTranslated: 'Вохӯрӣ таъин кардан',
  emoji: '🗣️',
  title: 'Verabredung', titleTranslated: 'Вохӯрӣ таъин кардан',
  scenario: 'Мартин ва Анна мехоҳанд бегоҳӣ вохӯранд ва дар бораи вақт маслиҳат мекунанд.',
  lines: [
    { speaker: 'Martin', text: 'Hallo Anna, hast du heute Abend Zeit?', translation: 'Салом Анна, имшаб вақт дорӣ?', voice: 'de-DE-ConradNeural' },
    { speaker: 'Anna', text: 'Hallo Martin. Ja, ich habe Zeit. Was wollen wir machen?', translation: 'Салом Мартин. Бале, ман вақт дорам. Чӣ кор кардан мехоҳем?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Martin', text: 'Wollen wir ins Kino gehen? Der Film beginnt um halb acht.', translation: 'Ба кинотеатр равем? Филм соати ҳафту ним сар мешавад.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Anna', text: 'Halb acht ist ein bisschen zu früh. Ich arbeite bis sechs Uhr.', translation: 'Ҳафту ним каме барвақт аст. Ман то соати шаш кор мекунам.', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Martin', text: 'Okay. Wie spät passt es dir?', translation: 'Майлаш. Кадом вақт барои ту мувофиқ аст?', voice: 'de-DE-ConradNeural' },
    { speaker: 'Anna', text: 'Vielleicht um acht Uhr?', translation: 'Шояд соати ҳашт?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Martin', text: 'Acht Uhr ist super. Wir können uns vor dem Kino treffen.', translation: 'Соати ҳашт зӯр аст. Мо метавонем дар назди кинотеатр вохӯрем.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Anna', text: 'Perfekt. Bis später!', translation: 'Олӣ. То баъд!', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Martin', text: 'Bis später, Anna!', translation: 'То баъд, Анна!', voice: 'de-DE-ConradNeural' }
  ]
};

export const WRITING = {
  title: 'Schreiben üben',
  titleTranslated: 'Машқи навиштан',
  emoji: '✍️',
  copyOf: [
    'der Morgen',
    'der Abend',
    'die Uhr',
    'halb',
    'aufstehen',
    'arbeiten',
    'immer',
    'oft'
  ]
};
