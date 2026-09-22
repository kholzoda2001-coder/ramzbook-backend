// Мазмуни Модули 8-и олмонӣ (A1) — «Kleidung und Einkaufen» (order: 7).
//
// Грамматикаи ин модул:
// 1. Феълҳои марбут ба харид (kaufen, kosten, brauchen, tragen).
// 2. Akkusativ барои ашёи харид (Ich kaufe *einen* Pullover).
// 3. Саволҳои харид (Was kostet das? Wie viel kostet das? Welche Größe?).

export const MODULE = {
  order: 7,
  title: 'Kleidung und Einkaufen',
  titleTranslated: 'Либос ва харид',
  emoji: '🛍️',
};

export const VOCAB = [
  {
    title: 'Kleidung (Oberteil)', titleTranslated: 'Либос (болопӯш)', emoji: '👕',
    words: [
      { word: 'die Kleidung', existing: true, translation: 'либос', emoji: '👗', ipa: '/diː ˈklaɪ̯dʊŋ/',
        example: 'Ich kaufe neue Kleidung.', exampleTrans: 'Ман либоси нав мехарам.' },
      { word: 'das T-Shirt', existing: true, translation: 'майка (футболка)', emoji: '👕', ipa: '/das ˈtiːʃœʁt/',
        example: 'Das T-Shirt ist bequem.', exampleTrans: 'Майка бароҳат аст.' },
      { word: 'das Hemd', existing: true, translation: 'курта (мардона)', emoji: '👔', ipa: '/das hɛmt/',
        example: 'Er trägt ein weißes Hemd.', exampleTrans: 'Ӯ куртаи сафед мепӯшад.' },
      { word: 'der Pullover', existing: true, translation: 'свитер', emoji: '🧶', ipa: '/deːɐ̯ pʊˈloːvɐ/',
        example: 'Der Pullover ist sehr warm.', exampleTrans: 'Свитер хеле гарм аст.' },
      { word: 'die Jacke', existing: true, translation: 'куртача (куртка)', emoji: '🧥', ipa: '/diː ˈjakə/',
        example: 'Ich brauche eine Winterjacke.', exampleTrans: 'Ба ман куртачаи зимистона лозим аст.' },
      { word: 'das Kleid', existing: true, translation: 'курта (занона)', emoji: '👗', ipa: '/das klaɪ̯t/',
        example: 'Sie trägt ein rotes Kleid.', exampleTrans: 'Ӯ куртаи занонаи сурх мепӯшад.' },
    ],
  },
  {
    title: 'Kleidung (Unterteil)', titleTranslated: 'Либос (поёнпӯш ва пойафзол)', emoji: '👖',
    words: [
      { word: 'die Hose', existing: true, translation: 'шим', emoji: '👖', ipa: '/diː ˈhoːzə/',
        example: 'Die Hose ist zu lang.', exampleTrans: 'Шим аз ҳад дароз аст.' },
      { word: 'die Jeans', existing: true, translation: 'ҷинс', emoji: '👖', ipa: '/diː d͡ʒiːns/',
        example: 'Ich mag diese Jeans.', exampleTrans: 'Ба ман ин ҷинс маъқул аст.' },
      { word: 'der Rock', existing: true, translation: 'доман', emoji: '👗', ipa: '/deːɐ̯ ʁɔk/',
        example: 'Der Rock ist sehr kurz.', exampleTrans: 'Доман хеле кӯтоҳ аст.' },
      { word: 'der Schuh', existing: true, translation: 'пойафзол', emoji: '👞', ipa: '/deːɐ̯ ʃuː/',
        example: 'Meine Schuhe sind neu.', exampleTrans: 'Пойафзолҳои ман наванд.' },
      { word: 'der Stiefel', existing: true, translation: 'мӯза', emoji: '👢', ipa: '/deːɐ̯ ˈʃtiːfəl/',
        example: 'Die Stiefel sind teuer.', exampleTrans: 'Мӯзаҳо қимматанд.' },
      { word: 'die Socke', existing: true, translation: 'ҷӯроб', emoji: '🧦', ipa: '/diː ˈzɔkə/',
        example: 'Ich brauche warme Socken.', exampleTrans: 'Ба ман ҷӯробҳои гарм лозиманд.' },
    ],
  },
  {
    title: 'Accessoires', titleTranslated: 'Ашёҳои иловагӣ (Аксессуарҳо)', emoji: '🎒',
    words: [
      { word: 'die Tasche', existing: true, translation: 'сумка (халта)', emoji: '👜', ipa: '/diː ˈtaʃə/',
        example: 'Das ist meine Tasche.', exampleTrans: 'Ин сумкаи ман аст.' },
      { word: 'die Brille', existing: true, translation: 'айнак', emoji: '👓', ipa: '/diː ˈbʁɪlə/',
        example: 'Wo ist meine Brille?', exampleTrans: 'Айнаки ман куҷост?' },
      { word: 'der Hut', existing: true, translation: 'кулоҳ (шляпа)', emoji: '🎩', ipa: '/deːɐ̯ huːt/',
        example: 'Der Hut ist schwarz.', exampleTrans: 'Кулоҳ сиёҳ аст.' },
      { word: 'die Mütze', existing: true, translation: 'кулоҳ (шапка)', emoji: '🧢', ipa: '/diː ˈmʏt͡sə/',
        example: 'Im Winter trage ich eine Mütze.', exampleTrans: 'Дар зимистон ман шапка мепӯшам.' },
      { word: 'der Schal', existing: true, translation: 'шарф', emoji: '🧣', ipa: '/deːɐ̯ ʃaːl/',
        example: 'Der Schal ist aus Wolle.', exampleTrans: 'Шарф аз пашм аст.' },
      { word: 'der Gürtel', existing: true, translation: 'камарбанд', emoji: '🥋', ipa: '/deːɐ̯ ˈɡʏʁtəl/',
        example: 'Ich brauche einen Gürtel.', exampleTrans: 'Ба ман камарбанд лозим аст.' },
    ],
  },
  {
    title: 'Einkaufen', titleTranslated: 'Харид', emoji: '🛒',
    words: [
      { word: 'das Geschäft', existing: true, translation: 'мағоза', emoji: '🏪', ipa: '/das ɡəˈʃɛft/',
        example: 'Das Geschäft ist groß.', exampleTrans: 'Мағоза калон аст.' },
      { word: 'kaufen', existing: true, translation: 'харидан', emoji: '🛍️', ipa: '/ˈkaʊ̯fən/',
        example: 'Ich kaufe eine Jacke.', exampleTrans: 'Ман як куртача мехарам.' },
      { word: 'kosten', existing: true, translation: 'арзиш доштан', emoji: '🏷️', ipa: '/ˈkɔstən/',
        example: 'Was kostet das Hemd?', exampleTrans: 'Курта чанд пул аст?' },
      { word: 'brauchen', existing: true, translation: 'эҳтиёҷ доштан', emoji: '🙏', ipa: '/ˈbʁaʊ̯xən/',
        example: 'Ich brauche neue Schuhe.', exampleTrans: 'Ба ман пойафзолҳои нав лозим аст.' },
      { word: 'tragen', existing: true, translation: 'пӯшидан (ба бар кардан)', emoji: '👚', ipa: '/ˈtʁaːɡən/',
        example: 'Er trägt eine Brille.', exampleTrans: 'Ӯ айнак мепӯшад.' },
      { word: 'die Größe', existing: true, translation: 'андоза (размер)', emoji: '📏', ipa: '/diː ˈɡʁøːsə/',
        example: 'Haben Sie Größe 38?', exampleTrans: 'Шумо андозаи 38 доред?' },
    ],
  },
  {
    title: 'Geld und Preise', titleTranslated: 'Пул ва нархҳо', emoji: '💶',
    words: [
      { word: 'das Geld', existing: true, translation: 'пул', emoji: '💵', ipa: '/das ɡɛlt/',
        example: 'Ich habe kein Geld.', exampleTrans: 'Ман пул надорам.' },
      { word: 'der Preis', existing: true, translation: 'нарх', emoji: '💲', ipa: '/deːɐ̯ pʁaɪ̯s/',
        example: 'Der Preis ist gut.', exampleTrans: 'Нарх хуб аст.' },
      { word: 'teuer', existing: true, translation: 'қиммат', emoji: '💎', ipa: '/ˈtɔɪ̯ɐ/',
        example: 'Das Kleid ist sehr teuer.', exampleTrans: 'Курта хеле қиммат аст.' },
      { word: 'billig', existing: true, translation: 'арзон', emoji: '🏷️', ipa: '/ˈbɪlɪç/',
        example: 'Die Socken sind billig.', exampleTrans: 'Ҷӯробҳо арзонанд.' },
      { word: 'bezahlen', existing: true, existing: true },
      { word: 'die Kasse', existing: true, translation: 'касса', emoji: '🧾', ipa: '/diː ˈkasə/',
        example: 'Zahlen Sie bitte an der Kasse.', exampleTrans: 'Лутфан дар касса пардохт кунед.' },
    ],
  },
  {
    title: 'Adjektive für Kleidung', titleTranslated: 'Сифатҳо барои либос', emoji: '👗',
    words: [
      { word: 'eng', existing: true, translation: 'танг', emoji: '🤏', ipa: '/ɛŋ/',
        example: 'Die Hose ist zu eng.', exampleTrans: 'Шим аз ҳад танг аст.' },
      { word: 'weit', existing: true, translation: 'васеъ', emoji: '👐', ipa: '/vaɪ̯t/',
        example: 'Das T-Shirt ist zu weit.', exampleTrans: 'Майка аз ҳад васеъ аст.' },
      { word: 'bequem', existing: true, translation: 'қулай', emoji: '🛋️', ipa: '/bəˈkveːm/',
        example: 'Die Schuhe sind sehr bequem.', exampleTrans: 'Пойафзолҳо хеле бароҳатанд.' },
      { word: 'schick', existing: true, translation: 'зебо (моднӣ)', emoji: '✨', ipa: '/ʃɪk/',
        example: 'Der Hut ist sehr schick.', exampleTrans: 'Кулоҳ хеле зебо аст.' },
      { word: 'kurz', existing: true, existing: true },
      { word: 'lang', existing: true, existing: true },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Was kostet das?', lessonTitleTranslated: 'Грамматика: Ин чанд пул аст?',
    title: 'Preise fragen — kosten', titleTranslated: 'Пурсидани нарх — kosten',
    emoji: '💶',
    explanation:
`Барои пурсидани нарх дар забони олмонӣ мо феъли **kosten** (арзиш доштан)-ро истифода мебарем.

**Барои як чиз (танҳо):**
- Was **kostet** das Hemd? (Курта чанд пул аст?)
- Wie viel **kostet** die Hose? (Шим чӣ қадар арзиш дорад?)
- Es **kostet** 20 Euro. (Он 20 евро арзиш дорад.)

**Барои чанд чиз (ҷамъ):**
- Was **kosten** die Schuhe? (Пойафзолҳо чанд пуланд?)
- Wie viel **kosten** die Socken?
- Sie **kosten** 50 Euro. (Онҳо 50 евро арзиш доранд.)

Таваҷҷӯҳ кунед: барои ҷамъ мо *kosten* (бо **-en**) ва барои танҳо *kostet* (бо **-et**) мегӯем.`,
    rules: [
      { pattern: 'Was kostet + [як чиз]', note: 'Was kostet der Pullover? (барои як чиз -et)' },
      { pattern: 'Was kosten + [чанд чиз]', note: 'Was kosten die Schuhe? (барои ҷамъ -en)' },
      { pattern: 'Wie viel kostet...?', note: 'Маънояш айнан ҳамон «Was kostet» аст (Чӣ қадар арзиш дорад).' },
      { pattern: 'Ҷавоб', note: 'Es kostet 10 Euro. (Он 10 евро аст) ё Sie kosten 20 Euro. (Онҳо 20 евро ҳастанд)' },
    ],
    examples: [
      { sentence: 'Was kostet die Tasche?', translation: 'Сумка чанд пул аст?', highlight: 'kostet' },
      { sentence: 'Wie viel kosten die Schuhe?', translation: 'Пойафзолҳо чӣ қадар арзиш доранд?', highlight: 'kosten' },
      { sentence: 'Es kostet 15 Euro.', translation: 'Он 15 евро аст.', highlight: 'kostet' },
      { sentence: 'Die Jeans ist sehr teuer.', translation: 'Ҷинс хеле қиммат аст.', highlight: 'teuer' },
      { sentence: 'Ist das billig?', translation: 'Оё ин арзон аст?', highlight: 'billig' },
    ],
    exercises: [
      { prompt: 'Was ___ das T-Shirt?', promptTranslated: 'Майка чанд пул аст?', answer: 'kostet', options: ['kostet', 'kosten', 'koste', 'kostest'], explanation: 'T-Shirt танҳо аст → kostet.' },
      { prompt: 'Wie viel ___ die Schuhe?', promptTranslated: 'Пойафзолҳо чӣ қадар арзиш доранд?', answer: 'kosten', options: ['kosten', 'kostet', 'kostest', 'kaufen'], explanation: 'Schuhe ҷамъ аст → kosten.' },
      { prompt: 'Es ___ 50 Euro.', promptTranslated: 'Он 50 евро арзиш дорад.', answer: 'kostet', options: ['kostet', 'kosten', 'bin', 'ist'], explanation: 'Es (он) → kostet.' },
      { prompt: 'Die Socken sind sehr ___. (қиммат)', promptTranslated: 'Ҷӯробҳо хеле қимматанд.', answer: 'teuer', options: ['teuer', 'billig', 'groß', 'schick'], explanation: 'teuer = қиммат.' },
      { prompt: 'Was ___ der Hut?', promptTranslated: 'Кулоҳ чанд пул аст?', answer: 'kostet', options: ['kostet', 'kosten', 'kostest', 'kaufen'], explanation: 'Hut танҳо аст → kostet.' },
      { prompt: 'Der Preis ist sehr ___. (арзон)', promptTranslated: 'Нарх хеле арзон аст.', answer: 'billig', options: ['billig', 'teuer', 'kalt', 'weit'], explanation: 'billig = арзон.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Akkusativ üben', lessonTitleTranslated: 'Грамматика: Машқи Akkusativ',
    title: 'Ich brauche einen... (Akkusativ)', titleTranslated: 'Ich brauche einen... (Падежи айбдоркунанда)',
    emoji: '🎯',
    explanation:
`Дар Модули 6 мо дидем, ки баъди феъли *haben* (доштан) артиклҳои мардона (der, ein, mein) ба **den, einen, meinen** табдил меёбанд.

Ин қоида барои феълҳои марбут ба харид низ сад фоиз амал мекунад! Феълҳои **kaufen** (харидан) ва **brauchen** (эҳтиёҷ доштан) ҳамеша *Akkusativ* талаб мекунанд:

**Барои мардона (der → den, einen):**
- der Pullover → Ich brauche **einen** Pullover. (Ман ба як свитер эҳтиёҷ дорам.)
- der Gürtel → Ich kaufe **den** Gürtel. (Ман ҳамон камарбандро мехарам.)

**Барои занона (die → die, eine) ва миёна (das → das, ein) ҲЕҶ ЧИЗ ТАҒЙИР НАМЕЁБАД:**
- die Jacke → Ich kaufe **eine** Jacke.
- das Hemd → Ich brauche **ein** Hemd.

Пас танҳо ба калимаҳои мардона (der) диққат диҳед!`,
    rules: [
      { pattern: 'kaufen / brauchen + einen (барои der)', note: 'Ich kaufe einen Hut. (der Hut)' },
      { pattern: 'kaufen / brauchen + eine (барои die)', note: 'Ich kaufe eine Hose. (die Hose)' },
      { pattern: 'kaufen / brauchen + ein (барои das)', note: 'Ich kaufe ein Kleid. (das Kleid)' },
      { pattern: 'kaufen / brauchen + keine артикл (барои ҷамъ)', note: 'Ich brauche Schuhe. (Ба ман пойафзол лозим аст.)' },
    ],
    examples: [
      { sentence: 'Ich kaufe einen Pullover.', translation: 'Ман як свитер мехарам.', highlight: 'einen' },
      { sentence: 'Wir brauchen ein Auto.', translation: 'Ба мо як мошин лозим аст.', highlight: 'ein' },
      { sentence: 'Sie kauft eine Tasche.', translation: 'Ӯ як сумка мехарад.', highlight: 'eine' },
      { sentence: 'Brauchst du einen Gürtel?', translation: 'Оё ба ту камарбанд лозим аст?', highlight: 'einen' },
      { sentence: 'Ich habe das Geld.', translation: 'Ман пулро дорам.', highlight: 'das' },
    ],
    exercises: [
      { prompt: 'Ich kaufe ___ Schal. (der Schal)', promptTranslated: 'Ман як шарф мехарам.', answer: 'einen', options: ['einen', 'ein', 'eine', 'einem'], explanation: 'der Schal мардона аст → einen.' },
      { prompt: 'Wir brauchen ___ Hemd. (das Hemd)', promptTranslated: 'Ба мо як курта лозим аст.', answer: 'ein', options: ['ein', 'einen', 'eine', 'eines'], explanation: 'das Hemd миёна аст → бетағйир мемонад (ein).' },
      { prompt: 'Sie kauft ___ Jacke. (die Jacke)', promptTranslated: 'Ӯ як куртача мехарад.', answer: 'eine', options: ['eine', 'ein', 'einen', 'einer'], explanation: 'die Jacke занона аст → eine.' },
      { prompt: 'Ich brauche ___ Rock. (der Rock)', promptTranslated: 'Ба ман як доман лозим аст.', answer: 'einen', options: ['einen', 'ein', 'eine', 'einer'], explanation: 'der Rock мардона аст → einen.' },
      { prompt: 'Kaufst du ___ T-Shirt? (das T-Shirt)', promptTranslated: 'Оё ту як майка мехарӣ?', answer: 'ein', options: ['ein', 'eine', 'einen', 'eines'], explanation: 'das T-Shirt миёна аст → ein.' },
      { prompt: 'Ich bezahle ___ Pullover. (der Pullover)', promptTranslated: 'Ман пули свитерро медиҳам.', answer: 'den', options: ['den', 'der', 'das', 'die'], explanation: 'der Pullover мардона аст → den.' },
      { prompt: 'Er braucht ___ Schuhe. (Plural)', promptTranslated: 'Ба ӯ пойафзол лозим аст.', answer: 'neue', options: ['neue', 'ein', 'einen', 'eine'], explanation: 'Schuhe ҷамъ аст, артикли номуайян (ein) намегирад.' },
      { prompt: 'Ich kaufe ___ Socken. (Plural)', promptTranslated: 'Ман ҷӯроб мехарам.', answer: 'warme', options: ['warme', 'eine', 'einen', 'ein'], explanation: 'Барои ҷамъ ein/eine/einen истифода намешавад.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Ich nehme ihn', lessonTitleTranslated: 'Грамматика: Ман онро мегирам',
    title: 'Personalpronomen im Akkusativ: mich, dich, ihn', titleTranslated: 'Ҷонишин дар Akkusativ: mich, dich, ihn',
    emoji: '🙋',
    explanation:
`Вақте калимаро такрор кардан намехоҳем, ба ҷои он **ҷонишин** мегузорем. Вале ҷонишин дар нақши ОБЪЕКТ шакли дигар мегирад.

| кӣ (Nominativ) | киро (Akkusativ) |
|---|---|
| ich | **mich** (маро) |
| du | **dich** (туро) |
| er | **ihn** (ӯро / онро — мардона) |
| sie | **sie** (вайро / онро — занона) |
| es | **es** (онро — миёна) |
| wir | **uns** (моро) |
| ihr | **euch** (шуморо) |
| sie / Sie | **sie / Sie** (онҳоро / Шуморо) |

**Дар мағоза ин ҳар рӯз лозим мешавад:**
- Der Pullover ist schön. Ich nehme **ihn**. (Свитер зебо аст. Ман ОНРО мегирам.)
- Die Jacke ist teuer. Ich kaufe **sie** nicht.
- Das Hemd ist billig. Ich nehme **es**.

**Доми асосии тоҷик:** дар тоҷикӣ ҳамаи ашё «он» аст — «онро мегирам». Дар олмонӣ бошад ҷонишин ба ҶИНСИ калима вобаста аст:
> der Pullover → **ihn** · die Jacke → **sie** · das Hemd → **es**

Яъне аввал ҷинси калимаро донистан лозим, баъд ҷонишинро интихоб кардан.

**Дар бораи одам:**
- Ich verstehe **dich**. (Ман туро мефаҳмам.)
- Verstehst du **mich**? (Ту маро мефаҳмӣ?)`,
    rules: [
      { pattern: 'ich → mich · du → dich', note: 'Ich verstehe dich. Verstehst du mich?' },
      { pattern: 'der → ihn', note: 'Der Rock ist schön. Ich nehme ihn.' },
      { pattern: 'die → sie · das → es', note: 'Die Hose → sie · Das Kleid → es.' },
      { pattern: 'wir → uns · Sie → Sie', note: 'Er sieht uns. Ich verstehe Sie.' },
    ],
    examples: [
      { sentence: 'Der Pullover ist schön. Ich nehme ihn.', translation: 'Свитер зебо аст. Ман онро мегирам.', highlight: 'ihn' },
      { sentence: 'Die Jacke ist teuer. Ich kaufe sie nicht.', translation: 'Куртача қиммат аст. Ман онро намехарам.', highlight: 'sie' },
      { sentence: 'Das Hemd ist billig. Ich nehme es.', translation: 'Курта арзон аст. Ман онро мегирам.', highlight: 'es' },
      { sentence: 'Verstehst du mich?', translation: 'Ту маро мефаҳмӣ?', highlight: 'mich' },
      { sentence: 'Ich verstehe dich gut.', translation: 'Ман туро хуб мефаҳмам.', highlight: 'dich' },
      { sentence: 'Die Schuhe sind neu. Ich kaufe sie.', translation: 'Пойафзолҳо наванд. Ман онҳоро мехарам.', highlight: 'sie' },
    ],
    exercises: [
      { prompt: 'Der Rock ist schön. Ich nehme ___.', promptTranslated: 'Доман зебо аст. Ман онро мегирам.', answer: 'ihn', options: ['ihn', 'sie', 'es', 'ihm'], explanation: 'der Rock → ihn.' },
      { prompt: 'Die Hose ist teuer. Ich kaufe ___ nicht.', promptTranslated: 'Шим қиммат аст. Ман онро намехарам.', answer: 'sie', options: ['sie', 'ihn', 'es', 'ihr'], explanation: 'die Hose → sie.' },
      { prompt: 'Das Kleid ist schick. Ich nehme ___.', promptTranslated: 'Куртаи занона зебо аст. Ман онро мегирам.', answer: 'es', options: ['es', 'ihn', 'sie', 'ihm'], explanation: 'das Kleid → es.' },
      { prompt: 'Verstehst du ___? (маро)', promptTranslated: 'Ту маро мефаҳмӣ?', answer: 'mich', options: ['mich', 'dich', 'ihn', 'uns'], explanation: 'ich → mich.' },
      { prompt: 'Ich verstehe ___ gut. (туро)', promptTranslated: 'Ман туро хуб мефаҳмам.', answer: 'dich', options: ['dich', 'mich', 'sie', 'euch'], explanation: 'du → dich.' },
      { prompt: 'Der Schal ist warm. Ich kaufe ___.', promptTranslated: 'Шарф гарм аст. Ман онро мехарам.', answer: 'ihn', options: ['ihn', 'es', 'sie', 'ihm'], explanation: 'der Schal → ihn.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Im Geschäft', lessonTitleTranslated: 'Дар мағоза',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Im Kleidergeschäft', titleTranslated: 'Дар мағозаи либос',
    passage: 'Frau Müller ist im Geschäft. Sie braucht eine neue Jacke für den Winter. Die blaue Jacke ist sehr schick, aber sie kostet 200 Euro. Das ist zu teuer! Die schwarze Jacke kostet nur 80 Euro. Sie ist billig und warm. Frau Müller kauft die schwarze Jacke.',
    passageTranslated: 'Хонум Мюллер дар мағоза аст. Ба ӯ барои зимистон як куртачаи нав лозим аст. Куртачаи кабуд хеле зебо аст, вале он 200 евро арзиш дорад. Ин аз ҳад қиммат аст! Куртачаи сиёҳ танҳо 80 евро арзиш дорад. Он арзон ва гарм аст. Хонум Мюллер куртачаи сиёҳро мехарад.',
    questions: [
      { question: 'Wo ist Frau Müller?', questionTranslated: 'Хонум Мюллер куҷост?', options: ['Im Geschäft', 'Zu Hause', 'Im Auto'], correctIndex: 0, explanation: 'Матн: Frau Müller ist im Geschäft.' },
      { question: 'Was braucht sie?', questionTranslated: 'Ба ӯ чӣ лозим аст?', options: ['Eine Jacke', 'Eine Hose', 'Einen Schal'], correctIndex: 0, explanation: 'Матн: Sie braucht eine neue Jacke.' },
      { question: 'Wie viel kostet die blaue Jacke?', questionTranslated: 'Куртачаи кабуд чанд пул аст?', options: ['200 Euro', '80 Euro', '100 Euro'], correctIndex: 0, explanation: 'Матн: sie kostet 200 Euro.' },
      { question: 'Welche Jacke kauft Frau Müller?', questionTranslated: 'Хонум Мюллер кадом куртачаро мехарад?', options: ['Die schwarze Jacke', 'Die blaue Jacke', 'Die weiße Jacke'], correctIndex: 0, explanation: 'Матн: Frau Müller kauft die schwarze Jacke.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Ein neues Hemd', lessonTitleTranslated: 'Шунавоӣ: Куртаи нав',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Ein neues Hemd', titleTranslated: 'Шунавоӣ: Куртаи нав',
    passage: 'Entschuldigung, ich brauche ein Hemd. Welche Größe haben Sie? Ich habe Größe L. Hier ist ein weißes Hemd. Es ist sehr schick. Was kostet das Hemd? Es kostet 40 Euro. Gut, ich kaufe es.',
    passageTranslated: 'Мебахшед, ба ман як курта (мардона) лозим аст. Шумо кадом андозаро доред? Ман андозаи L дорам. Ин ҷо як куртаи сафед ҳаст. Он хеле зебо аст. Курта чанд пул аст? Он 40 евро арзиш дорад. Хуб, ман онро мехарам.',
    questions: [
      { question: 'Was braucht der Mann?', questionTranslated: 'Ба мард чӣ лозим аст?', options: ['Ein Hemd', 'Einen Pullover', 'Eine Hose'], correctIndex: 0, explanation: 'Матн: ich brauche ein Hemd.' },
      { question: 'Welche Größe hat der Mann?', questionTranslated: 'Мард кадом андоза дорад?', options: ['Größe L', 'Größe M', 'Größe S'], correctIndex: 0, explanation: 'Матн: Ich habe Größe L.' },
      { question: 'Welche Farbe hat das Hemd?', questionTranslated: 'Курта кадом ранг дорад?', options: ['Weiß', 'Blau', 'Schwarz'], correctIndex: 0, explanation: 'Матн: Hier ist ein weißes Hemd.' },
      { question: 'Wie viel kostet das Hemd?', questionTranslated: 'Курта чанд пул аст?', options: ['40 Euro', '50 Euro', '100 Euro'], correctIndex: 0, explanation: 'Матн: Es kostet 40 Euro.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Einkaufen', titleTranslated: 'Такрор: Харид',
    passage: 'Wenn wir einkaufen, brauchen wir oft den Akkusativ. Verben wie "kaufen" und "brauchen" ändern den männlichen Artikel: aus "der" wird "den", aus "ein" wird "einen". Zum Beispiel: Ich kaufe einen Pullover. Aber für neutrale und weibliche Wörter ändert sich nichts: Ich kaufe ein Kleid und eine Jacke.',
    passageTranslated: 'Вақте мо харид мекунем, ба мо аксар вақт падежи Akkusativ лозим мешавад. Феълҳои ба мисли "kaufen" ва "brauchen" артикли мардонаро тағйир медиҳанд: "der" ба "den" табдил меёбад, "ein" ба "einen". Масалан: Ман як свитер мехарам. Вале барои калимаҳои миёна ва занона ҳеҷ чиз тағйир намеёбад: Ман як курта (das) ва як куртача (die) мехарам.',
    questions: [
      { question: 'Wie ändert "kaufen" den männlichen Artikel "ein"?', questionTranslated: 'Феъли "kaufen" артикли мардонаи "ein"-ро чӣ гуна тағйир медиҳад?', options: ['Zu "einen"', 'Zu "eine"', 'Es ändert sich nicht'], correctIndex: 0, explanation: 'Матн: aus "ein" wird "einen".' },
      { question: 'Ändert sich der Artikel für "das Kleid" (neutral)?', questionTranslated: 'Оё артикл барои "das Kleid" (миёна) тағйир меёбад?', options: ['Nein, es bleibt "ein"', 'Ja, zu "einen"', 'Ja, zu "eine"'], correctIndex: 0, explanation: 'Матн: für neutrale und weibliche Wörter ändert sich nichts (ein Kleid).' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Winterkleidung', titleTranslated: 'Либоси зимистона',
    passage: 'Es ist kalt. Lukas ist im Geschäft. Er braucht warme Kleidung. Er kauft einen Pullover, eine Jacke und Stiefel. Der Pullover ist grau und kostet 50 Euro. Die Jacke ist schwarz und kostet 120 Euro. Die Stiefel sind sehr teuer, sie kosten 150 Euro. Lukas bezahlt an der Kasse.',
    passageTranslated: 'Хунук аст. Лукас дар мағоза аст. Ба ӯ либоси гарм лозим аст. Ӯ як свитер, як куртача ва мӯза мехарад. Свитер хокистарӣ аст ва 50 евро арзиш дорад. Куртача сиёҳ аст ва 120 евро арзиш дорад. Мӯзаҳо хеле қимматанд, онҳо 150 евро арзиш доранд. Лукас дар касса пардохт мекунад.',
    questions: [
      { question: 'Wo ist Lukas?', questionTranslated: 'Лукас куҷост?', options: ['Im Geschäft', 'Zu Hause', 'Im Auto'], correctIndex: 0, explanation: 'Матн: Lukas ist im Geschäft.' },
      { question: 'Was braucht Lukas?', questionTranslated: 'Ба Лукас чӣ лозим аст?', options: ['Warme Kleidung', 'Ein T-Shirt', 'Eine Sonnenbrille'], correctIndex: 0, explanation: 'Матн: Er braucht warme Kleidung.' },
      { question: 'Was kauft Lukas nicht?', questionTranslated: 'Лукас кадомашро НАМЕХАРАД?', options: ['Einen Hut', 'Einen Pullover', 'Eine Jacke'], correctIndex: 0, explanation: 'Ӯ свитер, куртача ва мӯза мехарад. Кулоҳ (Hut) намехарад.' },
      { question: 'Wie viel kostet die Jacke?', questionTranslated: 'Куртача чанд пул аст?', options: ['120 Euro', '50 Euro', '150 Euro'], correctIndex: 0, explanation: 'Матн: Die Jacke ist schwarz und kostet 120 Euro.' },
      { question: 'Wie sind die Stiefel?', questionTranslated: 'Мӯзаҳо чӣ гунаанд?', options: ['Sehr teuer', 'Billig', 'Neu'], correctIndex: 0, explanation: 'Матн: Die Stiefel sind sehr teuer.' },
      { question: 'Wo bezahlt Lukas?', questionTranslated: 'Лукас дар куҷо пардохт мекунад?', options: ['An der Kasse', 'Im Garten', 'Auf dem Balkon'], correctIndex: 0, explanation: 'Матн: Lukas bezahlt an der Kasse.' },
      { question: 'Welcher Satz ist richtig?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich brauche einen Pullover.', 'Ich brauche ein Pullover.', 'Ich brauche eine Pullover.'], correctIndex: 0, explanation: 'der Pullover мардона аст → Akkusativ: einen Pullover.' },
      { question: 'Welcher Satz ist richtig (für "die Jacke")?', questionTranslated: 'Кадом ҷумла дуруст аст?', options: ['Ich kaufe eine Jacke.', 'Ich kaufe einen Jacke.', 'Ich kaufe ein Jacke.'], correctIndex: 0, explanation: 'die Jacke занона аст → eine.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Im Bekleidungsgeschäft', lessonTitleTranslated: 'Муколама: Дар мағозаи либосфурӯшӣ',
  title: 'Im Bekleidungsgeschäft', titleTranslated: 'Дар мағозаи либосфурӯшӣ',
  scenario: 'Eine Kundin spricht mit einem Verkäufer.', emoji: '🗣️',
  lines: [
    { speaker: 'Verkäufer', text: 'Guten Tag. Kann ich Ihnen helfen?', translation: 'Рӯз ба хайр. Оё ман метавонам ба шумо кумак кунам?' },
    { speaker: 'Kundin', text: 'Ja, ich brauche eine Hose.', translation: 'Бале, ба ман як шим лозим аст.' },
    { speaker: 'Verkäufer', text: 'Welche Größe haben Sie?', translation: 'Шумо кадом андозаро доред?' },
    { speaker: 'Kundin', text: 'Ich habe Größe 40.', translation: 'Ман андозаи 40 дорам.' },
    { speaker: 'Verkäufer', text: 'Hier ist eine schwarze Hose. Wie finden Sie die?', translation: 'Ин ҷо як шими сиёҳ ҳаст. Он ба шумо чӣ гуна менамояд?' },
    { speaker: 'Kundin', text: 'Sie ist sehr schick. Was kostet sie?', translation: 'Он хеле зебо аст. Он чанд пул аст?' },
    { speaker: 'Verkäufer', text: 'Die Hose kostet 60 Euro.', translation: 'Шим 60 евро арзиш дорад.' },
    { speaker: 'Kundin', text: 'Gut, ich kaufe sie. Ich bezahle an der Kasse.', translation: 'Хуб, ман онро мехарам. Ман дар касса пардохт мекунам.' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['das T-Shirt', 'das Geschäft', 'kaufen', 'teuer', 'bezahlen', 'die Hose', 'der Schuh', 'die Größe'],
};

export const ORDER = [
  'vocab:Kleidung (Oberteil)',
  'vocab:Kleidung (Unterteil)',
  'vocab:Accessoires',
  'vocab:Einkaufen',
  'vocab:Geld und Preise',
  'vocab:Adjektive für Kleidung',
  'grammar:0',
  'grammar:1',
  'grammar:2',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
