export const MODULE = {
  order: 10,
  title: 'Körper und Gesundheit',
  titleTranslated: 'Бадан ва Саломатӣ',
  icon: '🏥',
  color: 'bg-teal-600'
};

export const ORDER = [
  'vocab:Körperteile (Қисмҳои бадан) 1',
  'vocab:Körperteile (Қисмҳои бадан) 2',
  'grammar:0',
  'vocab:Krankheiten (Бемориҳо)',
  'vocab:Beim Arzt (Дар духтурхона)',
  'vocab:In der Apotheke',
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
    title: 'Körperteile (Қисмҳои бадан) 1',
    words: [
      { word: 'der Körper', existing: true, translation: 'бадан / ҷисм', emoji: '🧍', ipa: '/ˈkœʁpɐ/', example: 'Sport ist gut für den Körper.', exampleTrans: 'Варзиш барои бадан муфид аст.' },
      { word: 'der Kopf', existing: true, translation: 'сар', emoji: '👤', ipa: '/kɔpf/', example: 'Mein Kopf tut weh.', exampleTrans: 'Сарам дард мекунад.' },
      { word: 'das Gesicht', existing: true, translation: 'рӯй', emoji: '🧑', ipa: '/ɡəˈzɪçt/', example: 'Wasche dein Gesicht.', exampleTrans: 'Рӯятро шӯй.' },
      { word: 'das Auge', existing: true, translation: 'чашм', emoji: '👁️', ipa: '/ˈaʊ̯ɡə/', example: 'Er hat blaue Augen.', exampleTrans: 'Ӯ чашмони кабуд дорад.' },
      { word: 'das Ohr', existing: true, translation: 'гӯш', emoji: '👂', ipa: '/oːɐ̯/', example: 'Ich habe Schmerzen im Ohr.', exampleTrans: 'Ман дар гӯшам дард дорам.' },
      { word: 'die Nase', existing: true, translation: 'бинӣ', emoji: '👃', ipa: '/ˈnaːzə/', example: 'Die Nase läuft.', exampleTrans: 'Бинии ман меравад.' },
      { word: 'der Mund', existing: true, translation: 'даҳон', emoji: '👄', ipa: '/mʊnt/', example: 'Öffnen Sie bitte den Mund.', exampleTrans: 'Лутфан даҳонатонро кушоед.' },
      { word: 'der Zahn', existing: true, translation: 'дандон', emoji: '🦷', ipa: '/t͡saːn/', example: 'Ich putze meine Zähne.', exampleTrans: 'Ман дандонҳоямро мешӯям.' }
    ]
  },
  {
    title: 'Körperteile (Қисмҳои бадан) 2',
    words: [
      { word: 'der Hals', existing: true, translation: 'гардан / гулӯ', emoji: '🧣', ipa: '/hals/', example: 'Mein Hals tut weh.', exampleTrans: 'Гулӯям дард мекунад.' },
      { word: 'der Rücken', existing: true, translation: 'пушт', emoji: '🔙', ipa: '/ˈʁʏkən/', example: 'Ich habe Rückenschmerzen.', exampleTrans: 'Ман дарди пушт дорам.' },
      { word: 'der Bauch', existing: true, translation: 'шикам', emoji: '🤰', ipa: '/baʊ̯x/', example: 'Der Bauch ist voll.', exampleTrans: 'Шикам пур аст.' },
      { word: 'der Arm', existing: true, translation: 'даст (аз китф то панҷа)', emoji: '💪', ipa: '/aʁm/', example: 'Mein rechter Arm tut weh.', exampleTrans: 'Дасти рости ман дард мекунад.' },
      { word: 'die Hand', existing: true, translation: 'панҷаи даст', emoji: '🖐️', ipa: '/hant/', example: 'Gib mir deine Hand.', exampleTrans: 'Дастатро ба ман деҳ.' },
      { word: 'der Finger', existing: true, translation: 'ангушт', emoji: '☝️', ipa: '/ˈfɪŋɐ/', example: 'Ich habe zehn Finger.', exampleTrans: 'Ман даҳ ангушт дорам.' },
      { word: 'das Bein', existing: true, translation: 'пой (аз рон то буҷилак)', emoji: '🦵', ipa: '/baɪ̯n/', example: 'Sie hat lange Beine.', exampleTrans: 'Вай пойҳои дароз дорад.' },
      { word: 'der Fuß', existing: true, translation: 'қафаси пой', emoji: '🦶', ipa: '/fuːs/', example: 'Mein Fuß ist kalt.', exampleTrans: 'Пойи ман хунук аст.' }
    ]
  },
  {
    title: 'Krankheiten (Бемориҳо)',
    words: [
      { word: 'krank', existing: true, translation: 'бемор', emoji: '🤒', ipa: '/kʁaŋk/', example: 'Ich bin heute krank.', exampleTrans: 'Ман имрӯз беморам.' },
      { word: 'gesund', existing: true, translation: 'солим', emoji: '🍎', ipa: '/ɡəˈzʊnt/', example: 'Obst ist gesund.', exampleTrans: 'Мева солим аст.' },
      { word: 'die Gesundheit', existing: true, translation: 'саломатӣ', emoji: '❤️', ipa: '/ɡəˈzʊnthaɪ̯t/', example: 'Gesundheit ist das Wichtigste.', exampleTrans: 'Саломатӣ муҳимтарин чиз аст.' },
      { word: 'die Schmerzen', existing: true, translation: 'дард', emoji: '💥', ipa: '/ˈʃmɛʁt͡sən/', example: 'Ich habe starke Schmerzen.', exampleTrans: 'Ман дарди сахт дорам.' },
      { word: 'das Fieber', existing: true, translation: 'таб / ҳарорат', emoji: '🌡️', ipa: '/ˈfiːbɐ/', example: 'Das Kind hat hohes Fieber.', exampleTrans: 'Кӯдак таби баланд дорад.' },
      { word: 'der Husten', existing: true, translation: 'сулфа', emoji: '🤧', ipa: '/ˈhuːstən/', example: 'Ich habe Husten und Schnupfen.', exampleTrans: 'Ман сулфа ва зуком дорам.' },
      { word: 'der Schnupfen', existing: true, translation: 'зуком / хунукзанӣ', emoji: '🤧', ipa: '/ˈʃnʊpfən/', example: 'Er hat einen starken Schnupfen.', exampleTrans: 'Ӯ зукоми сахт дорад.' },
      { word: 'wehtun', existing: true, translation: 'дард кардан', emoji: '🤕', ipa: '/ˈveːtuːn/', example: 'Wo tut es weh?', exampleTrans: 'Куҷо дард мекунад?' }
    ]
  },
  {
    title: 'Beim Arzt (Дар духтурхона)',
    words: [
      { word: 'der Arzt', existing: true, translation: 'духтур (мард)', emoji: '👨‍⚕️', ipa: '/aʁt͡st/', example: 'Sie müssen zum Arzt gehen.', exampleTrans: 'Шумо бояд ба назди духтур равед.' },
      { word: 'die Ärztin', existing: true, translation: 'духтур (зан)', emoji: '👩‍⚕️', ipa: '/ˈɛʁt͡stɪn/', example: 'Die Ärztin untersucht das Kind.', exampleTrans: 'Духтур кӯдакро муоина мекунад.' },
      { word: 'die Apotheke', existing: true, translation: 'дорухона', emoji: '🏪', ipa: '/apoˈteːkə/', example: 'Ich hole das Rezept in der Apotheke.', exampleTrans: 'Ман доруномаро аз дорухона мегирам.' },
      { word: 'das Medikament', existing: true, translation: 'дору', emoji: '💊', ipa: '/medikaˈmɛnt/', example: 'Sie müssen das Medikament nehmen.', exampleTrans: 'Шумо бояд доруро қабул кунед.' },
      { word: 'die Tablette', existing: true, translation: 'ҳаб (таблетка)', emoji: '⚪', ipa: '/taˈblɛtə/', example: 'Nehmen Sie zwei Tabletten täglich.', exampleTrans: 'Ҳар рӯз ду ҳабро қабул кунед.' },
      { word: 'der Termin', existing: true, translation: 'қабул / вохӯрӣ', emoji: '📅', ipa: '/tɛʁˈmiːn/', example: 'Ich habe einen Termin um 10 Uhr.', exampleTrans: 'Ман соати 10 вохӯрӣ дорам.' },
      { word: 'müde', existing: true, translation: 'хаста', emoji: '🥱', ipa: '/ˈmyːdə/', example: 'Ich bin sehr müde.', exampleTrans: 'Ман хеле хастаам.' },
      { word: 'Gute Besserung', existing: true, translation: 'Шифои комил', emoji: '💐', ipa: '/ˈɡuːtə ˈbɛsəʁʊŋ/', example: 'Ich wünsche dir gute Besserung!', exampleTrans: 'Ба ту шифои комил мехоҳам!' }
    ]
  },
  {
    title: 'In der Apotheke',
    words: [
      { word: 'die Grippe', translation: 'грипп', emoji: '🤒', ipa: '/diː ˈɡʁɪpə/',
        example: 'Ich habe Grippe.', exampleTrans: 'Ман грипп дорам.' },
      { word: 'die Allergie', translation: 'аллергия', emoji: '🤧', ipa: '/diː alɛʁˈɡiː/',
        example: 'Er hat eine Allergie.', exampleTrans: 'Ӯ аллергия дорад.' },
      { word: 'das Rezept', translation: 'дорунома', emoji: '🧾', ipa: '/das ʁeˈt͡sɛpt/',
        example: 'Der Arzt schreibt ein Rezept.', exampleTrans: 'Духтур дорунома менависад.' },
      { word: 'die Spritze', translation: 'сӯзандору', emoji: '💉', ipa: '/diː ˈʃpʁɪt͡sə/',
        example: 'Die Spritze tut nicht weh.', exampleTrans: 'Сӯзандору дард намекунад.' },
      { word: 'das Pflaster', translation: 'пластир', emoji: '🩹', ipa: '/das ˈpflastɐ/',
        example: 'Ich brauche ein Pflaster.', exampleTrans: 'Ба ман пластир лозим аст.' },
      { word: 'der Verband', translation: 'бинт', emoji: '🩺', ipa: '/deːɐ̯ fɛɐ̯ˈbant/',
        example: 'Der Verband ist sauber.', exampleTrans: 'Бинт тоза аст.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Modalverben: sollen & dürfen (Бояд ва Мумкин)',
    lessonTitleTranslated: 'Феълҳои модалии "sollen" (бояд/тавсия) ва "dürfen" (мумкин/иҷозат)',
    emoji: '💊',
    title: 'sollen und dürfen',
    explanation:
`Дар назди духтур ду феъли модалӣ аз ҳама зиёд шунида мешавад: **sollen** (маслиҳат/супориш) ва **dürfen** (иҷозат).

**sollen — «бояд», маслиҳати касе:**
ich soll · du sollst · er/sie/es soll · wir sollen · ihr sollt · sie/Sie sollen

- Der Arzt sagt, ich **soll** im Bett bleiben. (Духтур мегӯяд, ман бояд дар бистар бимонам.)

**dürfen — «мумкин аст», иҷозат:**
ich darf · du darfst · er/sie/es darf · wir dürfen · ihr dürft · sie/Sie dürfen

- **Darf** ich Sport machen? (Мумкин аст ман варзиш кунам?)
- Sie **dürfen** heute **nicht** arbeiten. (Имрӯз кор кардан мумкин нест.)

**Қоидаи асосии ҷумла:** феъли модалӣ дар ҷои ДУЮМ меистад, ва феъли дуюм дар шакли луғавӣ ба ОХИРИ ҷумла меравад:

> Du **sollst** viel Tee **trinken**.
> Ich **darf** heute nicht **arbeiten**.

**Доми тоҷик:** мо мегӯем «ман бояд нӯшам» — ҳарду феъл дар як ҷо. Дар олмонӣ онҳо ҷудо меистанд: яке дуюм, дигаре охир.`,
    rules: [
      { pattern: 'sollen = маслиҳат', note: 'ich soll, du sollst, er soll, wir/sie/Sie sollen, ihr sollt.' },
      { pattern: 'dürfen = иҷозат', note: 'ich darf, du darfst, er darf, wir/sie/Sie dürfen, ihr dürft.' },
      { pattern: 'dürfen + nicht = манъ', note: 'Sie dürfen hier nicht rauchen — мумкин нест.' },
      { pattern: 'Феъли дуюм — дар ОХИР', note: 'Du sollst viel Tee trinken. Шакли луғавӣ (Infinitiv) дар охир меистад.' },
    ],
    examples: [
      { sentence: 'Du sollst viel Tee trinken.', translation: 'Ту бояд чойи зиёд нӯшӣ.', highlight: 'sollst ... trinken' },
      { sentence: 'Er soll im Bett bleiben.', translation: 'Ӯ бояд дар бистар бимонад.', highlight: 'soll ... bleiben' },
      { sentence: 'Darf ich Sport machen?', translation: 'Мумкин аст ман варзиш кунам?', highlight: 'Darf ich' },
      { sentence: 'Sie dürfen heute nicht arbeiten.', translation: 'Имрӯз кор кардан мумкин нест.', highlight: 'dürfen ... nicht' },
      { sentence: 'Ich soll die Tablette zweimal nehmen.', translation: 'Ман бояд ҳабро ду маротиба гирам.', highlight: 'soll ... nehmen' },
      { sentence: 'Darf ich hier warten?', translation: 'Мумкин аст ман дар ин ҷо интизор шавам?', highlight: 'Darf' },
    ],
    exercises: [
      { prompt: 'Der Arzt sagt, ich ___ im Bett bleiben. (sollen)', promptTranslated: 'Духтур мегӯяд, ки ман бояд дар бистар бимонам.', options: ['soll', 'sollst', 'sollen', 'sollt'], answer: 'soll', explanation: 'Барои «ich» — soll.' },
      { prompt: 'Du ___ nicht so viel Kaffee trinken. (sollen)', promptTranslated: 'Ту набояд ин қадар қаҳваи зиёд нӯшӣ.', options: ['sollst', 'soll', 'sollen', 'sollt'], answer: 'sollst', explanation: 'Барои «du» — sollst.' },
      { prompt: '___ ich die Tablette jetzt nehmen? (dürfen)', promptTranslated: 'Мумкин аст ман ҳабро ҳозир гирам?', options: ['Darf', 'Darfst', 'Dürfen', 'Dürft'], answer: 'Darf', explanation: 'Барои «ich» — darf.' },
      { prompt: 'Kinder ___ hier nicht spielen. (dürfen)', promptTranslated: 'Кӯдакон дар ин ҷо бозӣ карда наметавонанд.', options: ['dürfen', 'darf', 'darfst', 'dürft'], answer: 'dürfen', explanation: '«Kinder» ҷамъ аст → dürfen.' },
      { prompt: 'Sie ___ viel Wasser trinken. (sollen, Sie)', promptTranslated: 'Шумо бояд оби зиёд нӯшед.', options: ['sollen', 'soll', 'sollst', 'sollt'], answer: 'sollen', explanation: 'Барои «Sie» — sollen.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', options: ['Du sollst viel Tee trinken.', 'Du sollst trinken viel Tee.', 'Du trinken sollst viel Tee.', 'Du sollst viel Tee trinkst.'], answer: 'Du sollst viel Tee trinken.', explanation: 'Феъли модалӣ — ҷои дуюм, Infinitiv — охири ҷумла.' },
    ],
  },
  {
    lessonTitle: 'Imperativ (Шакли фармоишӣ)',
    lessonTitleTranslated: 'Шакли фармоишӣ бо «du» ва «Sie»',
    emoji: '❗',
    title: 'Imperativ: du und Sie',
    explanation:
`Дар олмонӣ фармон/маслиҳат ду шакл дорад — вобаста ба он ки бо **ту** ё бо **Шумо** гап мезанӣ.

**Шакли Sie (боадабона, бо нотаниш ва духтур):** феъл + Sie

- **Nehmen Sie** die Tablette! (Ҳабро гиред!)
- **Trinken Sie** viel Tee! (Чойи зиёд нӯшед!)

**Шакли du (бо дӯст, бо хешовандон):** феъли «du» БЕ «-st» ва БЕ «du»

| du-шакл | Imperativ |
|---|---|
| du nimm**st** | **Nimm!** |
| du trink**st** | **Trink!** |
| du geh**st** | **Geh!** |
| du schläf**st** | **Schlaf!** |

Яъне: аз шакли «du» танҳо **-st** бурида мешавад.

**Доми тоҷик:** мо дар фармон ҳам ҷонишинро мегӯем — «ту бихӯр». Дар олмонӣ шакли du ҷонишинро НАМЕГИРАД: ❌ *Du nimm!* → ✅ **Nimm!**

Барои нармтар кардан калимаи **bitte** гузошта мешавад: Nehmen Sie **bitte** Platz.`,
    rules: [
      { pattern: 'Sie-шакл: феъл + Sie', note: 'Nehmen Sie! Trinken Sie! — феъл ба ҷои якум мебарояд.' },
      { pattern: 'du-шакл: феъли du бе -st', note: 'du trinkst → Trink! · du gehst → Geh!' },
      { pattern: 'Дар du-шакл ҷонишин НЕСТ', note: '❌ Du nimm! · ✅ Nimm!' },
      { pattern: 'bitte = нармӣ', note: 'Trinken Sie bitte viel Tee!' },
    ],
    examples: [
      { sentence: 'Nehmen Sie die Tablette!', translation: 'Ҳабро гиред!', highlight: 'Nehmen Sie' },
      { sentence: 'Trinken Sie viel Tee!', translation: 'Чойи зиёд нӯшед!', highlight: 'Trinken Sie' },
      { sentence: 'Trink viel Wasser!', translation: 'Оби зиёд нӯш!', highlight: 'Trink' },
      { sentence: 'Geh zum Arzt!', translation: 'Ба назди духтур рав!', highlight: 'Geh' },
      { sentence: 'Schlaf gut!', translation: 'Хуб хоб кун!', highlight: 'Schlaf' },
      { sentence: 'Bleiben Sie bitte im Bett!', translation: 'Лутфан дар бистар монед!', highlight: 'Bleiben Sie' },
    ],
    exercises: [
      { prompt: '___ Sie die Tablette! (nehmen)', promptTranslated: 'Ҳабро гиред!', options: ['Nehmen', 'Nimm', 'Nehmt', 'Nimmst'], answer: 'Nehmen', explanation: 'Шакли Sie: феъли пурра + Sie.' },
      { prompt: '___ viel Tee! (trinken, du)', promptTranslated: 'Чойи зиёд нӯш!', options: ['Trink', 'Trinkst', 'Trinken', 'Du trink'], answer: 'Trink', explanation: 'du trinkst → -st бурида мешавад → Trink!' },
      { prompt: '___ zum Arzt! (gehen, du)', promptTranslated: 'Ба назди духтур рав!', options: ['Geh', 'Gehst', 'Gehen', 'Gehe du'], answer: 'Geh', explanation: 'du gehst → Geh!' },
      { prompt: '___ Sie bitte im Bett! (bleiben)', promptTranslated: 'Лутфан дар бистар монед!', options: ['Bleiben', 'Bleib', 'Bleibst', 'Bleibt'], answer: 'Bleiben', explanation: 'Шакли Sie: Bleiben Sie.' },
      { prompt: 'Кадом фармони «du» ДУРУСТ аст?', promptTranslated: 'Шакли дурусти «du»-ро интихоб кунед.', options: ['Schlaf gut!', 'Du schlaf gut!', 'Schläfst gut!', 'Schlafen gut!'], answer: 'Schlaf gut!', explanation: 'Шакли du ҷонишин намегирад ва -st надорад.' },
      { prompt: 'Калимаи ___ фармонро нармтар мекунад.', promptTranslated: 'Кадом калима фармонро боадабтар мекунад?', options: ['bitte', 'nicht', 'sehr', 'auch'], answer: 'bitte', explanation: 'bitte = лутфан.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Wie geht es dir?', lessonTitleTranslated: 'Грамматика: Ҳолат чӣ тавр аст?',
    title: 'Dativ: mir, dir, ihm', titleTranslated: 'Dativ: mir, dir, ihm — «ба ман, ба ту»',
    emoji: '🤝',
    explanation:
`Баъзе ҷумлаҳо ҷонишинро на дар шакли «киро», балки дар шакли «**БА кӣ**» талаб мекунанд. Ин **Dativ** аст.

| кӣ | ба кӣ (Dativ) |
|---|---|
| ich | **mir** (ба ман) |
| du | **dir** (ба ту) |
| er / es | **ihm** (ба ӯ — мард) |
| sie | **ihr** (ба вай — зан) |
| wir | **uns** (ба мо) |
| ihr | **euch** (ба шумо) |
| sie / Sie | **ihnen / Ihnen** (ба онҳо / ба Шумо) |

**Аз ҳама ҷумлаи маъмули олмонӣ маҳз ҳамин шаклро мегирад:**
- Wie geht es **dir**? (Аҳволат чӣ тавр?) — **Mir** geht es gut.
- Wie geht es **Ihnen**? — боадабона, бо нотаниш.

**Дар назди духтур:**
- **Mir** tut der Kopf weh. (Сари ман дард мекунад.)
- Was fehlt **Ihnen**? (Шуморо чӣ мезанад?)
- Der Arzt hilft **mir**. (Духтур ба ман кӯмак мекунад.)

**Доми асосӣ:** ду шакли ҷонишинро омехта накунед:
> **mich** = маро (объект) · **mir** = ба ман (гиранда)
> Er versteht **mich**. (Ӯ маро мефаҳмад.)
> Er hilft **mir**. (Ӯ ба ман кӯмак мекунад.)

Феълҳои **helfen** (кӯмак кардан), **gehen** (дар ибораи Wie geht es …), **wehtun** (дард кардан) ҳамеша Dativ мегиранд — ҳамроҳи феъл аз ёд карда шаванд.`,
    rules: [
      { pattern: 'ich → mir · du → dir', note: 'Wie geht es dir? — Mir geht es gut.' },
      { pattern: 'er → ihm · sie → ihr', note: 'Ich helfe ihm. Ich helfe ihr.' },
      { pattern: 'Sie → Ihnen (боадабона)', note: 'Wie geht es Ihnen? Was fehlt Ihnen?' },
      { pattern: 'mich ≠ mir', note: 'mich = маро · mir = ба ман. helfen ҳамеша mir мегирад.' },
    ],
    examples: [
      { sentence: 'Wie geht es dir?', translation: 'Аҳволат чӣ тавр?', highlight: 'dir' },
      { sentence: 'Mir geht es gut.', translation: 'Аҳволи ман хуб аст.', highlight: 'Mir' },
      { sentence: 'Wie geht es Ihnen?', translation: 'Аҳволи Шумо чӣ тавр?', highlight: 'Ihnen' },
      { sentence: 'Mir tut der Kopf weh.', translation: 'Сари ман дард мекунад.', highlight: 'Mir' },
      { sentence: 'Der Arzt hilft mir.', translation: 'Духтур ба ман кӯмак мекунад.', highlight: 'mir' },
      { sentence: 'Was fehlt Ihnen?', translation: 'Шуморо чӣ мезанад?', highlight: 'Ihnen' },
    ],
    exercises: [
      { prompt: 'Wie geht es ___? (ба ту)', promptTranslated: 'Аҳволат чӣ тавр?', answer: 'dir', options: ['dir', 'dich', 'du', 'dein'], explanation: '«Wie geht es …» ҳамеша Dativ мегирад → dir.' },
      { prompt: '___ geht es gut. (ба ман)', promptTranslated: 'Аҳволи ман хуб аст.', answer: 'Mir', options: ['Mir', 'Mich', 'Ich', 'Mein'], explanation: 'Dativ: mir.' },
      { prompt: 'Wie geht es ___? (боадабона)', promptTranslated: 'Аҳволи Шумо чӣ тавр?', answer: 'Ihnen', options: ['Ihnen', 'Sie', 'Ihr', 'Euch'], explanation: 'Шакли боадабона: Ihnen.' },
      { prompt: 'Der Arzt hilft ___. (ба ман)', promptTranslated: 'Духтур ба ман кӯмак мекунад.', answer: 'mir', options: ['mir', 'mich', 'ich', 'mein'], explanation: 'helfen ҳамеша Dativ мегирад.' },
      { prompt: 'Er versteht ___. (маро)', promptTranslated: 'Ӯ маро мефаҳмад.', answer: 'mich', options: ['mich', 'mir', 'ich', 'mein'], explanation: 'verstehen объект мегирад → mich.' },
      { prompt: '___ tut der Hals weh. (ба ман)', promptTranslated: 'Гулӯи ман дард мекунад.', answer: 'Mir', options: ['Mir', 'Mich', 'Ich', 'Meine'], explanation: 'wehtun Dativ мегирад → mir.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    skillType: 'reading',
    xpReward: 20,
    kind: 'text',
    emoji: '🤒',
    lessonTitle: 'Beim Arzt',
    lessonTitleTranslated: 'Дар назди духтур',
    title: 'Beim Arzt',
    titleTranslated: 'Дар назди духтур',
    passage: 'Herr Müller ist krank. Er hat starke Kopfschmerzen und Schnupfen. Er geht zum Arzt. Der Arzt sagt: "Sie haben Fieber. Sie sollen im Bett bleiben und viel Tee trinken. Hier ist ein Rezept. Nehmen Sie die Tabletten zweimal am Tag." Herr Müller geht in die Apotheke und kauft das Medikament.',
    passageTranslated: 'Ҷаноби Мюллер бемор аст. Ӯ дарди сари сахт ва зуком дорад. Ӯ ба назди духтур меравад. Духтур мегӯяд: "Шумо таб доред. Шумо бояд дар бистар бимонед ва чойи зиёд нӯшед. Ин ҷо дорунома ҳаст. Ҳабҳоро дар як рӯз ду маротиба қабул кунед." Ҷаноби Мюллер ба дорухона меравад ва доруро мехарад.',
    questions: [
      {
        question: 'Was hat Herr Müller?',
        questionTranslated: 'Ҷаноби Мюллер чӣ дорад?',
        options: ['Kopfschmerzen und Schnupfen', 'Bauchschmerzen', 'Halsschmerzen', 'Zahnschmerzen'],
        answer: 'Kopfschmerzen und Schnupfen'
      },
      {
        question: 'Wo geht er hin?',
        questionTranslated: 'Ӯ ба куҷо меравад?',
        options: ['Zum Arzt', 'Zur Schule', 'Ins Restaurant', 'In den Park'],
        answer: 'Zum Arzt'
      },
      {
        question: 'Was sagt der Arzt?',
        questionTranslated: 'Духтур чӣ мегӯяд?',
        options: ['Er soll im Bett bleiben.', 'Er soll Sport machen.', 'Er soll arbeiten.', 'Er soll einkaufen gehen.'],
        answer: 'Er soll im Bett bleiben.'
      },
      {
        question: 'Wie oft soll er die Tabletten nehmen?',
        questionTranslated: 'Ӯ бояд ҳабҳоро чанд маротиба қабул кунад?',
        options: ['Zweimal am Tag', 'Dreimal am Tag', 'Einmal am Tag', 'Nie'],
        answer: 'Zweimal am Tag'
      },
      {
        question: 'Wo kauft er das Medikament?',
        questionTranslated: 'Ӯ доруро аз куҷо мехарад?',
        options: ['In der Apotheke', 'Im Supermarkt', 'Auf dem Markt', 'Im Krankenhaus'],
        answer: 'In der Apotheke'
      }
    ]
  },
  {
    slot: 'listening',
    skillType: 'listening',
    xpReward: 20,
    kind: 'audio',
    emoji: '🤧',
    lessonTitle: 'Krankmeldung',
    lessonTitleTranslated: 'Огоҳии беморӣ',
    title: 'Krankmeldung',
    titleTranslated: 'Огоҳии беморӣ',
    passage: 'Hallo Chef, hier ist Anna. Ich bin heute leider krank. Mein Hals tut weh und ich habe Fieber. Ich kann nicht zur Arbeit kommen. Ich habe um 10 Uhr einen Termin beim Arzt. Morgen rufe ich wieder an. Tut mir leid!',
    passageTranslated: 'Салом роҳбар, ин ҷо Анна аст. Ман мутаассифона имрӯз беморам. Гулӯям дард мекунад ва ман таб дорам. Ман ба кор омада наметавонам. Ман соати 10 дар назди духтур қабул дорам. Пагоҳ боз занг мезанам. Бубахшед!',
    questions: [
      {
        question: 'Wer ruft an?',
        questionTranslated: 'Кӣ занг мезанад?',
        options: ['Anna', 'Der Chef', 'Der Arzt', 'Die Apothekerin'],
        answer: 'Anna'
      },
      {
        question: 'Was tut Anna weh?',
        questionTranslated: 'Ба Анна чӣ дард мекунад?',
        options: ['Der Hals', 'Der Kopf', 'Der Bauch', 'Das Ohr'],
        answer: 'Der Hals'
      },
      {
        question: 'Warum kann sie nicht zur Arbeit kommen?',
        questionTranslated: 'Чаро вай ба кор омада наметавонад?',
        options: ['Sie ist krank und hat Fieber.', 'Sie hat Urlaub.', 'Sie ist müde.', 'Sie muss einkaufen.'],
        answer: 'Sie ist krank und hat Fieber.'
      },
      {
        question: 'Wann hat sie einen Termin beim Arzt?',
        questionTranslated: 'Вай кай дар назди духтур қабул дорад?',
        options: ['Um 10 Uhr', 'Um 9 Uhr', 'Um 11 Uhr', 'Am Nachmittag'],
        answer: 'Um 10 Uhr'
      }
    ]
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Beim Arzt', titleTranslated: 'Такрор: Дар назди духтур',
    passage: 'Beim Arzt hörst du oft "sollen" und "dürfen". "Sollen" ist ein Rat: Sie sollen heute im Bett bleiben. "Dürfen" ist eine Erlaubnis: Sie dürfen heute nicht arbeiten. Der Arzt sagt auch den Imperativ: Nehmen Sie die Tablette! Trinken Sie viel Tee!',
    passageTranslated: 'Дар назди духтур ту аксар вақт «sollen» ва «dürfen»-ро мешунавӣ. «Sollen» маслиҳат аст: Имрӯз дар бистар монед. «Dürfen» иҷозат аст: Имрӯз кор кардан мумкин нест. Духтур инчунин Imperativ мегӯяд: Ҳабро гиред! Чойи зиёд нӯшед!',
    questions: [
      { question: 'Was bedeutet "Sie sollen im Bett bleiben"?', questionTranslated: '«Sie sollen im Bett bleiben» чӣ маъно дорад?', options: ['Ein Rat vom Arzt', 'Eine Frage', 'Ein Name'], correctIndex: 0, explanation: 'Матн: "Sollen" ist ein Rat.' },
      { question: '"Nehmen Sie die Tablette!" — welche Form ist das?', questionTranslated: '«Nehmen Sie die Tablette!» кадом шакл аст?', options: ['Der Imperativ', 'Das Perfekt', 'Die Frage'], correctIndex: 0, explanation: 'Матн: Der Arzt sagt auch den Imperativ.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Lena ist krank', titleTranslated: 'Лена бемор аст',
    passage: 'Lena ist krank. Ihr Kopf tut weh und sie hat Fieber. Sie hat auch Husten. Lena macht einen Termin und geht zur Ärztin. Die Ärztin sagt: "Sie haben Fieber. Sie sollen heute nicht arbeiten. Trinken Sie viel Tee und nehmen Sie diese Tablette." Lena geht in die Apotheke und kauft das Medikament. Am Abend ist sie sehr müde. Morgen ist sie wieder gesund.',
    passageTranslated: 'Лена бемор аст. Сараш дард мекунад ва таб дорад. Ӯ инчунин сулфа дорад. Лена қабул таъин мекунад ва ба назди духтур (зан) меравад. Духтур мегӯяд: «Шумо таб доред. Имрӯз кор накунед. Чойи зиёд нӯшед ва ин ҳабро гиред.» Лена ба дорухона меравад ва дору мехарад. Бегоҳ ӯ хеле хаста аст. Пагоҳ ӯ боз солим мешавад.',
    questions: [
      { question: 'Wie geht es Lena?', questionTranslated: 'Ҳоли Лена чӣ гуна аст?', options: ['Sie ist krank', 'Sie ist gesund', 'Sie arbeitet'], correctIndex: 0, explanation: 'Матн: Lena ist krank.' },
      { question: 'Was tut Lena weh?', questionTranslated: 'Кадом ҷои Лена дард мекунад?', options: ['Der Kopf', 'Der Bauch', 'Der Rücken'], correctIndex: 0, explanation: 'Матн: Ihr Kopf tut weh.' },
      { question: 'Was hat Lena noch?', questionTranslated: 'Лена боз чӣ дорад?', options: ['Fieber und Husten', 'Nur Schnupfen', 'Nur Zahnschmerzen'], correctIndex: 0, explanation: 'Матн: sie hat Fieber. Sie hat auch Husten.' },
      { question: 'Zu wem geht Lena?', questionTranslated: 'Лена ба назди кӣ меравад?', options: ['Zur Ärztin', 'Zum Lehrer', 'In die Schule'], correctIndex: 0, explanation: 'Матн: geht zur Ärztin — духтури ЗАН.' },
      { question: 'Was soll Lena heute nicht machen?', questionTranslated: 'Лена имрӯз чӣ кор накунад?', options: ['Arbeiten', 'Trinken', 'Schlafen'], correctIndex: 0, explanation: 'Матн: Sie sollen heute nicht arbeiten.' },
      { question: 'Was soll Lena trinken?', questionTranslated: 'Лена чӣ нӯшад?', options: ['Viel Tee', 'Kaffee', 'Milch'], correctIndex: 0, explanation: 'Матн: Trinken Sie viel Tee.' },
      { question: 'Wo kauft Lena das Medikament?', questionTranslated: 'Лена доруро дар куҷо мехарад?', options: ['In der Apotheke', 'Im Restaurant', 'Im Museum'], correctIndex: 0, explanation: 'Матн: Lena geht in die Apotheke.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Mein Kopf tut weh.', 'Mein Kopf weh tut.', 'Mein Kopf tut wehen.'], correctIndex: 0, explanation: '"wehtun" дар ҷумла ҷудо мешавад: tut … weh.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Beim Arzt (Дар назди духтур)',
  lessonTitleTranslated: 'Дар назди духтур',
  title: 'Beim Arzt (Дар назди духтур)',
  titleTranslated: 'Дар назди духтур',
  emoji: '🗣️',
  lines: [
    { speaker: 'Arzt', text: 'Guten Morgen! Was fehlt Ihnen?', translation: 'Субҳ ба хайр! Шумо чӣ шикоят доред?' },
    { speaker: 'Patient', text: 'Guten Morgen. Ich fühle mich nicht gut. Mein Kopf tut weh.', translation: 'Субҳ ба хайр. Ман худро хуб ҳис намекунам. Сарам дард мекунад.' },
    { speaker: 'Arzt', text: 'Haben Sie auch Fieber?', translation: 'Шумо инчунин таб доред?' },
    { speaker: 'Patient', text: 'Ja, ein bisschen. Und ich bin sehr müde.', translation: 'Бале, каме. Ва ман хеле хастаам.' },
    { speaker: 'Arzt', text: 'Ich verschreibe Ihnen Tabletten. Nehmen Sie eine Tablette am Morgen.', translation: 'Ман ба шумо ҳабҳо менависам. Як ҳабро саҳар қабул кунед.' },
    { speaker: 'Patient', text: 'Darf ich zur Arbeit gehen?', translation: 'Оё ман метавонам ба кор равам?' },
    { speaker: 'Arzt', text: 'Nein, Sie sollen drei Tage im Bett bleiben.', translation: 'Не, шумо бояд се рӯз дар бистар бимонед.' },
    { speaker: 'Patient', text: 'Okay, danke Herr Doktor.', translation: 'Хуб, ташаккур ҷаноби духтур.' },
    { speaker: 'Arzt', text: 'Gute Besserung!', translation: 'Шифои комил!' }
  ]
};

export const WRITING = {
  title: 'Schreiben üben',
  titleTranslated: 'Машқи навиштан',
  emoji: '✍️',
  copyOf: [
    'der Körper',
    'der Kopf',
    'das Auge',
    'die Nase',
    'der Mund',
    'krank',
    'gesund',
    'der Arzt'
  ]
};
