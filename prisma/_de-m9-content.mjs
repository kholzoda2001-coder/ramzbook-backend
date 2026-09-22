export const MODULE = {
  order: 8,
  title: 'Orte und Wegbeschreibung',
  titleTranslated: 'Самтҳо ва шаҳр',
  icon: '📍',
  color: 'bg-indigo-500'
};

export const VOCAB = [
  {
    title: 'Orte in der Stadt (Ҷойҳои шаҳр)',
    words: [
      { word: 'die Stadt', existing: true, translation: 'шаҳр', emoji: '🏙️', ipa: '/diː ʃtat/',
        example: 'Ich wohne in der Stadt.', exampleTrans: 'Ман дар шаҳр зиндагӣ мекунам.' },
      { word: 'der Bahnhof', existing: true, translation: 'вокзал', emoji: '🚉', ipa: '/deːɐ̯ ˈbaːnhoːf/',
        example: 'Der Bahnhof ist dort.', exampleTrans: 'Вокзал он ҷост.' },
      { word: 'der Flughafen', existing: true, translation: 'фурудгоҳ', emoji: '✈️', ipa: '/ˈfluːkˌhaːfən/',
        example: 'Wie komme ich zum Flughafen?', exampleTrans: 'Чӣ гуна ман ба фурудгоҳ равам?' },
      { word: 'das Hotel', existing: true, translation: 'меҳмонхона', emoji: '🏨', ipa: '/hoˈtɛl/',
        example: 'Das Hotel ist sehr schön.', exampleTrans: 'Меҳмонхона хеле зебост.' },
      { word: 'das Krankenhaus', existing: true, translation: 'беморхона', emoji: '🏥', ipa: '/ˈkʁaŋkənˌhaʊ̯s/',
        example: 'Er arbeitet im Krankenhaus.', exampleTrans: 'Ӯ дар беморхона кор мекунад.' },
      { word: 'die Post', existing: true, translation: 'почта', emoji: '📮', ipa: '/diː pɔst/',
        example: 'Wo ist die Post?', exampleTrans: 'Почта куҷост?' },
    ]
  },
  {
    title: 'Öffentliche Plätze (Ҷойҳои ҷамъиятӣ)',
    words: [
      { word: 'die Bank', existing: true, translation: 'бонк', emoji: '🏦', ipa: '/diː baŋk/',
        example: 'Ich gehe zur Bank.', exampleTrans: 'Ман ба бонк меравам.' },
      { word: 'die Schule', existing: true, translation: 'мактаб', emoji: '🏫', ipa: '/diː ˈʃuːlə/',
        example: 'Die Schule ist geschlossen.', exampleTrans: 'Мактаб баста аст.' },
      { word: 'das Museum', existing: true, translation: 'осорхона', emoji: '🏛️', ipa: '/muˈzeːʊm/',
        example: 'Das Museum ist alt.', exampleTrans: 'Осорхона кӯҳна аст.' },
      { word: 'der Park', existing: true, translation: 'боғ (парк)', emoji: '🌳', ipa: '/deːɐ̯ paʁk/',
        example: 'Wir spazieren im Park.', exampleTrans: 'Мо дар боғ сайругашт мекунем.' },
    ]
  },
  {
    title: 'Verkehrsmittel (Нақлиёт)',
    words: [
      { word: 'das Auto', existing: true, translation: 'мошин', emoji: '🚗', ipa: '/ˈaʊ̯to/',
        example: 'Ich fahre mit dem Auto.', exampleTrans: 'Ман бо мошин меравам.' },
      { word: 'der Bus', existing: true, translation: 'автобус', emoji: '🚌', ipa: '/deːɐ̯ bʊs/',
        example: 'Der Bus kommt bald.', exampleTrans: 'Автобус ба зудӣ меояд.' },
      { word: 'der Zug', existing: true, translation: 'поезд', emoji: '🚆', ipa: '/deːɐ̯ t͡suːk/',
        example: 'Der Zug fährt schnell.', exampleTrans: 'Поезд тез меравад.' },
      { word: 'das Fahrrad', existing: true, translation: 'дучарха', emoji: '🚲', ipa: '/ˈfaːʁaːt/',
        example: 'Er fährt gern Fahrrad.', exampleTrans: 'Ӯ дучарха савор шуданро дӯст медорад.' },
      { word: 'die U-Bahn', existing: true, translation: 'метро', emoji: '🚇', ipa: '/ˈuːbaːn/',
        example: 'Die U-Bahn ist praktisch.', exampleTrans: 'Метро қулай аст.' },
      { word: 'das Flugzeug', existing: true, translation: 'ҳавопаймо', emoji: '🛩️', ipa: '/ˈfluːkˌt͡sɔɪ̯k/',
        example: 'Das Flugzeug fliegt hoch.', exampleTrans: 'Ҳавопаймо баланд мепарад.' },
    ]
  },
  {
    title: 'Wegbeschreibung (Самтҳо ва роҳ)',
    words: [
      { word: 'die Straße', existing: true, translation: 'кӯча', emoji: '🛣️', ipa: '/diː ˈʃtʁaːsə/',
        example: 'Die Straße ist lang.', exampleTrans: 'Кӯча дароз аст.' },
      { word: 'der Weg', existing: true, translation: 'роҳ', emoji: '🛤️', ipa: '/deːɐ̯ veːk/',
        example: 'Ich kenne den Weg nicht.', exampleTrans: 'Ман роҳро намедонам.' },
      { word: 'rechts', existing: true, translation: 'ба рост', emoji: '➡️', ipa: '/ʁɛçt͡s/',
        example: 'Gehen Sie nach rechts.', exampleTrans: 'Ба тарафи рост равед.' },
      { word: 'links', existing: true, translation: 'ба чап', emoji: '⬅️', ipa: '/lɪŋks/',
        example: 'Biegen Sie links ab.', exampleTrans: 'Ба тарафи чап гардед.' },
      { word: 'geradeaus', existing: true, translation: 'рост ба пеш', emoji: '⬆️', ipa: '/ɡəˌʁaːdəˈʔaʊ̯s/',
        example: 'Gehen Sie geradeaus.', exampleTrans: 'Рост ба пеш равед.' },
      { word: 'die Ecke', existing: true, translation: 'кунҷ (гӯша)', emoji: '📐', ipa: '/diː ˈɛkə/',
        example: 'Die Bank ist an der Ecke.', exampleTrans: 'Бонк дар кунҷи кӯча аст.' },
    ]
  },
  {
    title: 'Ortsangaben (Макон ва ҷойгиршавӣ)',
    words: [
      { word: 'neben', existing: true, translation: 'дар паҳлӯи', emoji: '🧍🧍', ipa: '/ˈneːbən/',
        example: 'Das Hotel ist neben dem Park.', exampleTrans: 'Меҳмонхона дар паҳлӯи боғ аст.' },
      { word: 'gegenüber', existing: true, translation: 'дар рӯ ба рӯи', emoji: '↔️', ipa: '/ɡeːɡənˈʔyːbɐ/',
        example: 'Die Post ist gegenüber der Bank.', exampleTrans: 'Почта дар рӯ ба рӯи бонк аст.' },
      { word: 'in der Nähe', existing: true, translation: 'дар наздикии', emoji: '📍', ipa: '/ɪn deːɐ̯ ˈnɛːə/',
        example: 'Ist hier ein Supermarkt in der Nähe?', exampleTrans: 'Дар ин наздикиҳо супермаркет ҳаст?' },
      { word: 'nah', existing: true, translation: 'наздик', emoji: '👁️', ipa: '/naː/',
        example: 'Mein Haus ist sehr nah.', exampleTrans: 'Хонаи ман хеле наздик аст.' },
      { word: 'abbiegen', existing: true, translation: 'гаштан', emoji: '↪️', ipa: '/ˈapˌbiːɡən/',
        example: 'Sie müssen hier abbiegen.', exampleTrans: 'Шумо бояд аз ин ҷо гардед.' },
    ]
  },
  {
    title: 'Gebäude in der Stadt',
    words: [
      { word: 'die Brücke', translation: 'купрук', emoji: '🌉', ipa: '/diː ˈbʁʏkə/',
        example: 'Die Brücke ist alt.', exampleTrans: 'Купрук кӯҳна аст.' },
      { word: 'die Kirche', translation: 'калисо', emoji: '⛪', ipa: '/diː ˈkɪʁçə/',
        example: 'Die Kirche ist in der Stadt.', exampleTrans: 'Калисо дар шаҳр аст.' },
      { word: 'die Bibliothek', translation: 'китобхона', emoji: '📚', ipa: '/diː biblioˈteːk/',
        example: 'Ich lerne in der Bibliothek.', exampleTrans: 'Ман дар китобхона меомӯзам.' },
      { word: 'das Rathaus', translation: 'шаҳрдорӣ', emoji: '🏛️', ipa: '/das ˈʁaːtˌhaʊ̯s/',
        example: 'Das Rathaus ist groß.', exampleTrans: 'Шаҳрдорӣ калон аст.' },
      { word: 'die Tankstelle', translation: 'нуқтаи сӯзишворӣ', emoji: '⛽', ipa: '/diː ˈtaŋkˌʃtɛlə/',
        example: 'Die Tankstelle ist an der Straße.', exampleTrans: 'Нуқтаи сӯзишворӣ дар канори кӯча аст.' },
      { word: 'der Supermarkt', translation: 'супермаркет', emoji: '🛒', ipa: '/deːɐ̯ ˈzuːpɐˌmaʁkt/',
        example: 'Der Supermarkt ist nah.', exampleTrans: 'Супермаркет наздик аст.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Wegbeschreibung (Imperativ)',
    lessonTitleTranslated: 'Самтҳо ва роҳ',
    emoji: '🗣️',
    title: 'Wegbeschreibung (Imperativ)',
    explanation:
`Вақте роҳро мефаҳмонанд, дар олмонӣ шакли **фармоишӣ (Imperativ)** бо «Sie» кор фармуда мешавад — ин шакли боадабона аст, ки бо шахси нотаниш гап мезананд.

**Чӣ тавр сохта мешавад:** феъл + **Sie**

- gehen → **Gehen Sie** geradeaus! (Рост ба пеш равед!)
- fahren → **Fahren Sie** nach links! (Ба чап равед!)
- nehmen → **Nehmen Sie** den Bus! (Автобусро гиред!)

**Доми аввал — ҷои феъл.** Дар ҷумлаи оддӣ феъл ДУЮМ меистад («Sie gehen geradeaus»), вале дар Imperativ феъл ба ҶОИ ЯКУМ мебарояд ва «Sie» баъди он меояд.

**Доми дуюм — феъли ҷудошаванда.** *abbiegen* (гаштан) ду қисм дорад ва қисми хурд ба ОХИР меравад:

- **Biegen** Sie an der Ecke rechts **ab**! (Дар кунҷ ба рост гардед!)

Барои самт пеш аз rechts/links калимаи **nach** гузошта мешавад: nach rechts, nach links. Вале бо «geradeaus» ҳеҷ пешоянд лозим нест.`,
    rules: [
      { pattern: 'Феъл + Sie + …', note: 'Феъл ба ҷои ЯКУМ мебарояд: Gehen Sie geradeaus!' },
      { pattern: 'nach + rechts / links', note: 'Барои самт: Gehen Sie nach rechts. Вале geradeaus бе пешоянд меистад.' },
      { pattern: 'Biegen Sie … ab', note: 'abbiegen ҷудошаванда аст — «ab» ба охири ҷумла меравад.' },
      { pattern: 'zu + Dativ (zum / zur)', note: 'Ба куҷо: zum Bahnhof (der/das), zur Post (die).' },
    ],
    examples: [
      { sentence: 'Gehen Sie geradeaus.', translation: 'Рост ба пеш равед.', highlight: 'Gehen' },
      { sentence: 'Gehen Sie nach links.', translation: 'Ба тарафи чап равед.', highlight: 'nach' },
      { sentence: 'Biegen Sie rechts ab.', translation: 'Ба тарафи рост гардед.', highlight: 'ab' },
      { sentence: 'Gehen Sie zur Bank.', translation: 'Ба сӯи бонк равед.', highlight: 'zur' },
      { sentence: 'Nehmen Sie den Bus.', translation: 'Автобусро гиред.', highlight: 'Nehmen' },
      { sentence: 'Die Post ist neben der Bank.', translation: 'Почта дар паҳлӯи бонк аст.', highlight: 'neben' },
    ],
    exercises: [
      { prompt: '___ Sie geradeaus.', promptTranslated: 'Рост ба пеш равед.', answer: 'Gehen', options: ['Gehen', 'Geht', 'Gehst', 'Gehe'], explanation: 'Барои Sie шакли пурраи феъл: Gehen.' },
      { prompt: 'Gehen Sie ___ links.', promptTranslated: 'Ба тарафи чап равед.', answer: 'nach', options: ['nach', 'zu', 'in', 'an'], explanation: 'Барои самт: nach links.' },
      { prompt: 'Biegen Sie rechts ___.', promptTranslated: 'Ба тарафи рост гардед.', answer: 'ab', options: ['ab', 'an', 'auf', 'aus'], explanation: 'abbiegen — қисми «ab» ба охир меравад.' },
      { prompt: '___ Sie den Bus!', promptTranslated: 'Автобусро гиред!', answer: 'Nehmen', options: ['Nehmen', 'Nimmst', 'Nehme', 'Nimm'], explanation: 'Шакли Sie: Nehmen Sie.' },
      { prompt: 'Gehen Sie ___ Bahnhof.', promptTranslated: 'Ба сӯи вокзал равед.', answer: 'zum', options: ['zum', 'zur', 'zu', 'zun'], explanation: 'der Bahnhof → zu dem = zum.' },
      { prompt: 'Gehen Sie ___ Post.', promptTranslated: 'Ба сӯи почта равед.', answer: 'zur', options: ['zur', 'zum', 'zu', 'zür'], explanation: 'die Post → zu der = zur.' },
      { prompt: 'Der Park ist ___ der Schule.', promptTranslated: 'Боғ дар паҳлӯи мактаб аст.', answer: 'neben', options: ['neben', 'nach', 'nah', 'weit'], explanation: 'neben = дар паҳлӯи.' },
      { prompt: 'Wo ___ der Bahnhof?', promptTranslated: 'Вокзал куҷост?', answer: 'ist', options: ['ist', 'sind', 'bist', 'bin'], explanation: 'der Bahnhof танҳо аст → ist.' },
    ],
  },
  {
    lessonTitle: 'Mit Verkehrsmitteln (mit dem...)',
    lessonTitleTranslated: 'Бо нақлиёт',
    emoji: '🚌',
    title: 'Mit Verkehrsmitteln (mit dem...)',
    explanation:
`Барои гуфтани он ки бо КАДОМ нақлиёт мерави, пешоянди **mit** гирифта мешавад, ва баъди «mit» артикл ҳамеша ба падежи **Dativ** мегузарад.

| ҷинси калима | артикли оддӣ | баъди mit |
|---|---|---|
| мардона | **der** Bus | mit **dem** Bus |
| миёна | **das** Auto | mit **dem** Auto |
| занона | **die** U-Bahn | mit **der** U-Bahn |

**Он чи тоҷик ҳамеша хато мекунад:** дар тоҷикӣ мо танҳо «бо» мегӯем ва калима тағйир намеёбад — «бо автобус», «бо метро». Дар олмонӣ калима худаш бетағйир мемонад, вале АРТИКЛ иваз мешавад: der → dem, das → dem, die → der.

Феъли ҳаракат одатан **fahren** аст (бо нақлиёт рафтан), на *gehen* (пиёда рафтан):

- Ich **fahre** mit dem Bus. (Ман бо автобус меравам.)
- Ich **gehe** zu Fuß. (Ман пиёда меравам.)`,
    rules: [
      { pattern: 'mit + Dativ', note: 'Пешоянди mit ҳамеша Dativ-ро талаб мекунад.' },
      { pattern: 'mit dem + der/das', note: 'der Bus → mit dem Bus · das Auto → mit dem Auto.' },
      { pattern: 'mit der + die', note: 'die U-Bahn → mit der U-Bahn.' },
      { pattern: 'fahren ≠ gehen', note: 'Бо нақлиёт — fahren. Пиёда — gehen.' },
    ],
    examples: [
      { sentence: 'Ich fahre mit dem Auto.', translation: 'Ман бо мошин меравам.', highlight: 'dem' },
      { sentence: 'Wir fahren mit dem Zug.', translation: 'Мо бо поезд меравем.', highlight: 'dem' },
      { sentence: 'Er fährt mit der U-Bahn.', translation: 'Ӯ бо метро меравад.', highlight: 'der' },
      { sentence: 'Kommst du mit dem Bus?', translation: 'Ту бо автобус меоӣ?', highlight: 'dem' },
      { sentence: 'Sie fährt mit dem Fahrrad zur Schule.', translation: 'Вай бо дучарха ба мактаб меравад.', highlight: 'dem Fahrrad' },
      { sentence: 'Das Flugzeug ist sehr schnell.', translation: 'Ҳавопаймо хеле тез аст.', highlight: 'Das Flugzeug' },
    ],
    exercises: [
      { prompt: 'Ich fahre mit ___ Auto.', promptTranslated: 'Ман бо мошин меравам.', answer: 'dem', options: ['dem', 'der', 'den', 'das'], explanation: 'das Auto → mit dem Auto.' },
      { prompt: 'Sie kommt mit ___ U-Bahn.', promptTranslated: 'Вай бо метро меояд.', answer: 'der', options: ['der', 'dem', 'das', 'den'], explanation: 'die U-Bahn → mit der U-Bahn.' },
      { prompt: 'Er fährt mit ___ Bus.', promptTranslated: 'Ӯ бо автобус меравад.', answer: 'dem', options: ['dem', 'der', 'den', 'die'], explanation: 'der Bus → mit dem Bus.' },
      { prompt: 'Wir fahren mit ___ Zug nach Berlin.', promptTranslated: 'Мо бо поезд ба Берлин меравем.', answer: 'dem', options: ['dem', 'der', 'das', 'den'], explanation: 'der Zug → mit dem Zug.' },
      { prompt: 'Ich fahre mit ___ Fahrrad.', promptTranslated: 'Ман бо дучарха меравам.', answer: 'dem', options: ['dem', 'der', 'die', 'den'], explanation: 'das Fahrrad → mit dem Fahrrad.' },
      { prompt: 'Ich ___ mit dem Bus zur Arbeit.', promptTranslated: 'Ман бо автобус ба кор меравам.', answer: 'fahre', options: ['fahre', 'gehe', 'fährt', 'gehst'], explanation: 'Бо нақлиёт — fahren; барои ich — fahre.' },
      { prompt: 'Der Park ist nah. Ich ___ zu Fuß.', promptTranslated: 'Боғ наздик аст. Ман пиёда меравам.', answer: 'gehe', options: ['gehe', 'fahre', 'fährt', 'gehst'], explanation: 'Пиёда — gehen.' },
      { prompt: 'Wie kommst du zum Flughafen? — ___ dem Taxi.', promptTranslated: 'Ту чӣ гуна ба фурудгоҳ меоӣ? — Бо такси.', answer: 'Mit', options: ['Mit', 'Nach', 'Zu', 'In'], explanation: 'Барои нақлиёт: mit + Dativ.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Den Weg finden', lessonTitleTranslated: 'Роҳро ёфтан',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Entschuldigung, wo ist der Bahnhof?',
    titleTranslated: 'Мебахшед, вокзал куҷост?',
    passage: `
Anna: Entschuldigung, können Sie mir helfen? Wo ist der Bahnhof?
Herr Müller: Der Bahnhof? Das ist nicht weit von hier.
Anna: Kann ich zu Fuß gehen, oder brauche ich einen Bus?
Herr Müller: Sie können zu Fuß gehen. Es dauert nur zehn Minuten.
Anna: Wie ist der Weg?
Herr Müller: Gehen Sie hier geradeaus. An der Apotheke biegen Sie rechts ab. Dann sehen Sie ein großes Hotel. Der Bahnhof ist direkt neben dem Hotel.
Anna: Also, hier geradeaus, an der Apotheke rechts und dann neben dem Hotel.
Herr Müller: Genau! Gegenüber vom Bahnhof ist auch ein schöner Park.
Anna: Vielen Dank für Ihre Hilfe!
Herr Müller: Bitte sehr. Einen schönen Tag noch!
    `.trim(),
    passageTranslated: 'Анна: Мебахшед, метавонед ба ман кумак кунед? Вокзал куҷост?\nҶаноби Мюллер: Вокзал? Вай аз ин ҷо дур нест.\nАнна: Ман метавонам пиёда равам ё ба автобус ниёз дорам?\nҶаноби Мюллер: Шумо метавонед пиёда равед. Ин танҳо даҳ дақиқа вақт мегирад.\nАнна: Роҳ чӣ гуна аст?\nҶаноби Мюллер: Аз ин ҷо рост равед. Дар назди дорухона ба тарафи рост гардед. Баъд шумо як меҳмонхонаи калонро мебинед. Вокзал маҳз дар паҳлӯи меҳмонхона аст.\nАнна: Яъне, аз ин ҷо рост, дар дорухона ба рост ва баъд дар паҳлӯи меҳмонхона.\nҶаноби Мюллер: Маҳз! Дар рӯ ба рӯи вокзал инчунин як боғи зебо ҳаст.\nАнна: Барои кумакатон ташаккури зиёд!\nҶаноби Мюллер: Марҳамат. Рӯзи хуш!',
    questions: [
      { question: 'Was sucht Anna?', questionTranslated: 'Анна чиро меҷӯяд?', options: ['Den Bahnhof.', 'Das Hotel.', 'Den Park.'], correctIndex: 0, explanation: 'Анна дар аввал мепурсад: Wo ist der Bahnhof?' },
      { question: 'Ist der Bahnhof weit von hier?', questionTranslated: 'Оё вокзал аз ин ҷо дур аст?', options: ['Ja, er ist sehr weit.', 'Nein, er ist nicht weit.', 'Er ist in einer anderen Stadt.'], correctIndex: 1, explanation: 'Herr Müller мегӯяд: Das ist nicht weit von hier.' },
      { question: 'Braucht Anna einen Bus?', questionTranslated: 'Оё Анна ба автобус ниёз дорад?', options: ['Ja, sie muss den Bus nehmen.', 'Nein, sie kann zu Fuß gehen.', 'Sie braucht ein Auto.'], correctIndex: 1, explanation: 'Sie können zu Fuß gehen.' },
      { question: 'Wo muss Anna abbiegen?', questionTranslated: 'Анна дар куҷо бояд гардад?', options: ['An der Apotheke.', 'Am Park.', 'Am Bahnhof.'], correctIndex: 0, explanation: 'An der Apotheke biegen Sie rechts ab.' },
      { question: 'Wo ist der Bahnhof?', questionTranslated: 'Вокзал дар куҷост?', options: ['Hinter dem Hotel.', 'Neben dem Hotel.', 'Unter dem Hotel.'], correctIndex: 1, explanation: 'Der Bahnhof ist direkt neben dem Hotel.' },
    ]
  },
  {
    slot: 'listening',
    lessonTitle: 'Verkehrsmittel', lessonTitleTranslated: 'Нақлиёт',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '🎧',
    title: 'Hören: Mit dem Fahrrad oder mit der U-Bahn?',
    titleTranslated: 'Бо дучарха ё бо метро?',
    passage: 'Heute besuche ich ein Museum. Es ist nicht sehr nah. Normalerweise fahre ich mit der U-Bahn. Die U-Bahn ist schnell und praktisch. Aber heute ist das Wetter schön. Die Sonne scheint. Deshalb fahre ich mit dem Fahrrad. Ich fahre durch den Park. Das dauert 20 Minuten, aber es macht Spaß.',
    passageTranslated: 'Имрӯз ман ба осорхона меравам. Он чандон наздик нест. Одатан ман бо метро меравам. Метро тез ва қулай аст. Аммо имрӯз обу ҳаво хуб аст. Офтоб медурахшад. Бинобар ин ман бо дучарха меравам. Ман аз дарун боғ мегузарам. Ин 20 дақиқа вақт мегирад, аммо шавқовар аст.',
    questions: [
      { question: 'Wo möchte die Person hin?', questionTranslated: 'Шахс ба куҷо рафтан мехоҳад?', options: ['Zur Schule.', 'Zur Bank.', 'Zum Museum.'], correctIndex: 2, explanation: 'Heute besuche ich ein Museum.' },
      { question: 'Wie fährt die Person normalerweise?', questionTranslated: 'Шахс одатан чӣ гуна сафар мекунад?', options: ['Mit der U-Bahn.', 'Mit dem Bus.', 'Mit dem Auto.'], correctIndex: 0, explanation: 'Normalerweise fahre ich mit der U-Bahn.' },
      { question: 'Warum fährt die Person heute mit dem Fahrrad?', questionTranslated: 'Чаро шахс имрӯз бо дучарха меравад?', options: ['Weil das Wetter schön ist.', 'Weil die U-Bahn kaputt ist.', 'Weil sie kein Geld hat.'], correctIndex: 0, explanation: 'Aber heute ist das Wetter schön. Deshalb fahre ich mit dem Fahrrad.' },
      { question: 'Wie lange dauert die Fahrt mit dem Fahrrad?', questionTranslated: 'Сафар бо дучарха чӣ қадар вақт мегирад?', options: ['10 Minuten.', '20 Minuten.', '30 Minuten.'], correctIndex: 1, explanation: 'Das dauert 20 Minuten.' },
    ]
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Der Weg', titleTranslated: 'Такрор: Роҳ ва самт',
    passage: 'Wenn du den Weg erklärst, brauchst du den Imperativ: Gehen Sie geradeaus! Biegen Sie an der Ecke rechts ab! Für Verkehrsmittel nimmst du "mit" plus Dativ: mit dem Bus, mit dem Auto, mit dem Fahrrad, aber mit der U-Bahn. Die Bank ist neben der Post, und das Hotel ist gegenüber vom Bahnhof.',
    passageTranslated: 'Вақте роҳро мефаҳмонӣ, ба ту Imperativ лозим аст: Рост равед! Дар кунҷ ба рост гардед! Барои нақлиёт «mit» ва Dativ гирифта мешавад: mit dem Bus, mit dem Auto, mit dem Fahrrad, вале mit der U-Bahn. Бонк дар паҳлӯи почта аст ва меҳмонхона дар рӯ ба рӯи вокзал.',
    questions: [
      { question: 'Welche Form benutzt man für den Weg?', questionTranslated: 'Барои фаҳмондани роҳ кадом шакл истифода мешавад?', options: ['Den Imperativ', 'Das Perfekt', 'Die Frage'], correctIndex: 0, explanation: 'Матн: Wenn du den Weg erklärst, brauchst du den Imperativ.' },
      { question: 'Wie sagt man es richtig?', questionTranslated: 'Кадомаш дуруст аст?', options: ['mit der U-Bahn', 'mit dem U-Bahn', 'mit die U-Bahn'], correctIndex: 0, explanation: 'die U-Bahn занона аст → дар Dativ "der U-Bahn".' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Anna sucht den Bahnhof', titleTranslated: 'Анна вокзалро меҷӯяд',
    passage: 'Anna ist im Hotel. Sie fragt einen Mann: "Entschuldigung, wo ist der Bahnhof?" Der Mann sagt: "Gehen Sie geradeaus und biegen Sie an der Ecke links ab. Der Bahnhof ist neben der Post." Anna fragt: "Ist das weit?" Der Mann sagt: "Nein, es ist nah." Anna geht geradeaus und findet den Bahnhof. Dann fährt sie mit dem Zug in die Stadt. Das Museum ist dort gegenüber vom Park.',
    passageTranslated: 'Анна дар меҳмонхона аст. Ӯ аз як мард мепурсад: «Мебахшед, вокзал куҷост?» Мард мегӯяд: «Рост равед ва дар кунҷ ба чап гардед. Вокзал дар паҳлӯи почта аст.» Анна мепурсад: «Ин дур аст?» Мард мегӯяд: «Не, наздик аст.» Анна рост меравад ва вокзалро меёбад. Баъд ӯ бо поезд ба шаҳр меравад. Осорхона дар он ҷо дар рӯ ба рӯи боғ аст.',
    questions: [
      { question: 'Wo ist Anna am Anfang?', questionTranslated: 'Анна дар аввал куҷост?', options: ['Im Hotel', 'Im Park', 'Im Museum'], correctIndex: 0, explanation: 'Матн: Anna ist im Hotel.' },
      { question: 'Was sucht Anna?', questionTranslated: 'Анна чиро меҷӯяд?', options: ['Den Bahnhof', 'Die Schule', 'Die Bank'], correctIndex: 0, explanation: 'Матн: wo ist der Bahnhof?' },
      { question: 'Wohin soll Anna an der Ecke abbiegen?', questionTranslated: 'Анна дар кунҷ ба кадом тараф гардад?', options: ['Nach links', 'Nach rechts', 'Geradeaus'], correctIndex: 0, explanation: 'Матн: biegen Sie an der Ecke links ab.' },
      { question: 'Was ist neben dem Bahnhof?', questionTranslated: 'Дар паҳлӯи вокзал чӣ ҳаст?', options: ['Die Post', 'Das Hotel', 'Der Park'], correctIndex: 0, explanation: 'Матн: Der Bahnhof ist neben der Post.' },
      { question: 'Ist der Weg weit?', questionTranslated: 'Роҳ дур аст?', options: ['Nein, er ist nah', 'Ja, er ist weit', 'Der Mann sagt es nicht'], correctIndex: 0, explanation: 'Матн: Nein, es ist nah.' },
      { question: 'Womit fährt Anna in die Stadt?', questionTranslated: 'Анна бо чӣ ба шаҳр меравад?', options: ['Mit dem Zug', 'Mit dem Bus', 'Mit dem Fahrrad'], correctIndex: 0, explanation: 'Матн: Dann fährt sie mit dem Zug in die Stadt.' },
      { question: 'Wo ist das Museum?', questionTranslated: 'Осорхона куҷост?', options: ['Gegenüber vom Park', 'Neben der Bank', 'In der Schule'], correctIndex: 0, explanation: 'Матн: Das Museum ist dort gegenüber vom Park.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich fahre mit dem Bus.', 'Ich fahre mit der Bus.', 'Ich fahre mit den Bus.'], correctIndex: 0, explanation: 'der Bus мардона аст → дар Dativ "dem Bus".' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Nach dem Weg fragen', lessonTitleTranslated: 'Пурсидани роҳ',
  emoji: '🗣️',
  title: 'Nach dem Weg fragen', titleTranslated: 'Пурсидани роҳ',
  scenario: 'Eine Frau fragt einen Mann nach dem Weg.',
  lines: [
    { speaker: 'Frau', text: 'Entschuldigung, gibt es hier einen Supermarkt in der Nähe?', translation: 'Мебахшед, дар ин наздикиҳо ягон супермаркет ҳаст?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Mann', text: 'Ja, es gibt einen Supermarkt in der Goethestraße.', translation: 'Бале, дар кӯчаи Гёте як супермаркет ҳаст.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Frau', text: 'Ist das weit von hier?', translation: 'Оё ин аз ин ҷо дур аст?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Mann', text: 'Nein, nur fünf Minuten zu Fuß.', translation: 'Не, танҳо панҷ дақиқа пиёда.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Frau', text: 'Können Sie mir bitte den Weg beschreiben?', translation: 'Метавонед роҳро ба ман фаҳмонед?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Mann', text: 'Natürlich. Gehen Sie hier geradeaus und biegen Sie an der Bank links ab.', translation: 'Албатта. Аз ин ҷо рост равед ва дар назди бонк ба тарафи чап гардед.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Frau', text: 'Geradeaus und dann links?', translation: 'Рост ба пеш ва баъд ба чап?', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Mann', text: 'Richtig. Der Supermarkt ist direkt neben der Post.', translation: 'Дуруст. Супермаркет маҳз дар паҳлӯи почта аст.', voice: 'de-DE-ConradNeural' },
    { speaker: 'Frau', text: 'Vielen Dank!', translation: 'Ташаккури зиёд!', voice: 'de-DE-KatjaNeural' },
    { speaker: 'Mann', text: 'Gerne! Auf Wiedersehen.', translation: 'Марҳамат! Хайр.', voice: 'de-DE-ConradNeural' }
  ]
};

export const WRITING = {
  title: 'Schreiben üben',
  titleTranslated: 'Машқи навиштан',
  emoji: '✍️',
  copyOf: ['die Stadt', 'der Bahnhof', 'das Hotel', 'das Auto', 'der Weg', 'rechts', 'links', 'geradeaus']
};

export const ORDER = [
  'vocab:Orte in der Stadt (Ҷойҳои шаҳр)',
  'vocab:Öffentliche Plätze (Ҷойҳои ҷамъиятӣ)',
  'vocab:Verkehrsmittel (Нақлиёт)',
  'vocab:Wegbeschreibung (Самтҳо ва роҳ)',
  'vocab:Ortsangaben (Макон ва ҷойгиршавӣ)',
  'vocab:Gebäude in der Stadt',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue:0',
  'writing:0',
  'comprehension:review',
  'comprehension:test',
];
