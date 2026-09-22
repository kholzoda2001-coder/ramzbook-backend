// Мазмуни Модули 6-и олмонӣ (A1) — «Essen und Trinken». (Тартиби 5 дар база)
//
// Танҳо МАЪЛУМОТ — мантиқ дар `_de-module-build.mjs`.
// `correctIndex: 0` дар ҳама ҷо — билд ҷои ҷавобро худаш паҳн мекунад.

export const MODULE = {
  order: 5,
  title: 'Essen und Trinken',
  titleTranslated: 'Хӯрок ва нӯшокиҳо',
  emoji: '🍽️',
};

export const VOCAB = [
  {
    title: 'Frühstück', titleTranslated: 'Наҳорӣ', emoji: '🥐',
    words: [
      { word: 'das Brot', existing: true, translation: 'нон', emoji: '🍞', ipa: '/das bʁoːt/',
        example: 'Ich esse ein Brot.', exampleTrans: 'Ман як нон мехӯрам.' },
      { word: 'die Butter', existing: true, translation: 'равған (маска)', emoji: '🧈', ipa: '/diː ˈbʊtɐ/',
        example: 'Die Butter ist frisch.', exampleTrans: 'Маска тару тоза аст.' },
      { word: 'der Käse', existing: true, translation: 'панир', emoji: '🧀', ipa: '/deːɐ̯ ˈkɛːzə/',
        example: 'Er mag keinen Käse.', exampleTrans: 'Ӯ панирро дӯст намедорад.' },
      { word: 'die Marmelade', existing: true, translation: 'мураббо', emoji: '🍯', ipa: '/diː maʁməˈlaːdə/',
        example: 'Brot mit Marmelade ist lecker.', exampleTrans: 'Нон бо мураббо бомазза аст.' },
      { word: 'das Ei', existing: true, translation: 'тухм', emoji: '🥚', ipa: '/das aɪ̯/',
        example: 'Ich koche ein Ei.', exampleTrans: 'Ман як тухм мепазам.' },
      { word: 'das Frühstück', existing: true, existing: true },
    ],
  },
  {
    title: 'Obst', titleTranslated: 'Меваҳо', emoji: '🍎',
    words: [
      { word: 'der Apfel', existing: true, translation: 'себ', emoji: '🍎', ipa: '/deːɐ̯ ˈap͡fəl/',
        example: 'Der Apfel ist rot.', exampleTrans: 'Себ сурх аст.' },
      { word: 'die Banane', existing: true, translation: 'банан', emoji: '🍌', ipa: '/diː baˈnaːnə/',
        example: 'Affen essen Bananen.', exampleTrans: 'Маймунҳо банан мехӯранд.' },
      { word: 'die Orange', existing: true, translation: 'афлесун', emoji: '🍊', ipa: '/diː oˈʁaŋʒə/',
        example: 'Die Orange ist süß.', exampleTrans: 'Афлесун ширин аст.' },
      { word: 'die Erdbeere', existing: true, translation: 'қулфинай', emoji: '🍓', ipa: '/diː ˈeːɐ̯tbeːʁə/',
        example: 'Ich liebe Erdbeeren.', exampleTrans: 'Ман қулфинайро дӯст медорам.' },
      { word: 'die Traube', existing: true, translation: 'ангур', emoji: '🍇', ipa: '/diː ˈtʁaʊ̯bə/',
        example: 'Die Trauben sind grün.', exampleTrans: 'Ангурҳо сабзанд.' },
      { word: 'das Obst', existing: true, translation: 'мева', emoji: '🍉', ipa: '/das oːpst/',
        example: 'Obst ist sehr gesund.', exampleTrans: 'Мева хеле фоиданок аст.' },
    ],
  },
  {
    title: 'Gemüse', titleTranslated: 'Сабзавот', emoji: '🥕',
    words: [
      { word: 'die Tomate', existing: true, translation: 'помидор', emoji: '🍅', ipa: '/diː toˈmaːtə/',
        example: 'Die Tomate ist rot.', exampleTrans: 'Помидор сурх аст.' },
      { word: 'die Kartoffel', existing: true, translation: 'картошка', emoji: '🥔', ipa: '/diː kaʁˈtɔfəl/',
        example: 'Wir kochen Kartoffeln.', exampleTrans: 'Мо картошка мепазем.' },
      { word: 'die Zwiebel', existing: true, translation: 'пиёз', emoji: '🧅', ipa: '/diː ˈt͡sviːbəl/',
        example: 'Ich brauche eine Zwiebel.', exampleTrans: 'Ба ман пиёз лозим аст.' },
      { word: 'der Salat', existing: true, translation: 'хӯриши сабзавотӣ', emoji: '🥗', ipa: '/deːɐ̯ zaˈlaːt/',
        example: 'Der Salat schmeckt gut.', exampleTrans: 'Хӯриш хуб аст.' },
      { word: 'die Karotte', existing: true, translation: 'сабзӣ', emoji: '🥕', ipa: '/diː kaˈʁɔtə/',
        example: 'Hasen mögen Karotten.', exampleTrans: 'Хирсчаҳо сабзиро дӯст медоранд.' },
      { word: 'das Gemüse', existing: true, translation: 'сабзавот', emoji: '🥦', ipa: '/das ɡəˈmyːzə/',
        example: 'Essen Sie viel Gemüse!', exampleTrans: 'Бисёр сабзавот хӯред!' },
    ],
  },
  {
    title: 'Fleisch und Fisch', titleTranslated: 'Гӯшт ва моҳӣ', emoji: '🥩',
    words: [
      { word: 'das Fleisch', existing: true, translation: 'гӯшт', emoji: '🥩', ipa: '/das flaɪ̯ʃ/',
        example: 'Er isst kein Fleisch.', exampleTrans: 'Ӯ гӯшт намехӯрад.' },
      { word: 'das Hähnchen', existing: true, translation: 'мурғ', emoji: '🍗', ipa: '/das ˈhɛːnçən/',
        example: 'Wir essen Hähnchen mit Reis.', exampleTrans: 'Мо мурғро бо биринҷ мехӯрем.' },
      { word: 'die Wurst', existing: true, translation: 'ҳасиб', emoji: '🌭', ipa: '/diː vʊʁst/',
        example: 'Die Wurst ist lecker.', exampleTrans: 'Ҳасиб бомазза аст.' },
      { word: 'der Fisch', existing: true, translation: 'моҳӣ', emoji: '🐟', ipa: '/deːɐ̯ fɪʃ/',
        example: 'Der Fisch schwimmt im Wasser.', exampleTrans: 'Моҳӣ дар об шино мекунад.' },
      { word: 'das Mittagessen', existing: true, existing: true },
      { word: 'das Abendessen', existing: true, existing: true },
    ],
  },
  {
    title: 'Getränke', titleTranslated: 'Нӯшокиҳо', emoji: '☕',
    words: [
      { word: 'das Wasser', existing: true, translation: 'об', emoji: '💧', ipa: '/das ˈvasɐ/',
        example: 'Ich trinke viel Wasser.', exampleTrans: 'Ман бисёр об менӯшам.' },
      { word: 'der Kaffee', existing: true, translation: 'қаҳва', emoji: '☕', ipa: '/deːɐ̯ ˈkafe/',
        example: 'Der Kaffee ist heiß.', exampleTrans: 'Қаҳва гарм аст.' },
      { word: 'der Tee', existing: true, translation: 'чой', emoji: '🍵', ipa: '/deːɐ̯ teː/',
        example: 'Ich möchte einen Tee.', exampleTrans: 'Ман як чой мехоҳам.' },
      { word: 'der Saft', existing: true, translation: 'шарбат (сок)', emoji: '🧃', ipa: '/deːɐ̯ zaft/',
        example: 'Trinkst du gern Saft?', exampleTrans: 'Ту шарбат нӯшиданро дӯст медорӣ?' },
      { word: 'die Milch', existing: true, translation: 'шир', emoji: '🥛', ipa: '/diː mɪlç/',
        example: 'Die Katze trinkt Milch.', exampleTrans: 'Гурба шир менӯшад.' },
      { word: 'das Getränk', existing: true, translation: 'нӯшокӣ', emoji: '🍹', ipa: '/das ɡəˈtʁɛŋk/',
        example: 'Wasser ist mein Lieblingsgetränk.', exampleTrans: 'Об нӯшокии дӯстдоштаи ман аст.' },
    ],
  },
  {
    title: 'Im Restaurant', titleTranslated: 'Дар тарабхона', emoji: '🍽️',
    words: [
      { word: 'das Restaurant', existing: true, translation: 'тарабхона', emoji: '🏨', ipa: '/das ʁɛstoˈʁaŋ/',
        example: 'Wir essen im Restaurant.', exampleTrans: 'Мо дар тарабхона мехӯрем.' },
      { word: 'die Speisekarte', existing: true, translation: 'мено (меню)', emoji: '📖', ipa: '/diː ˈʃpaɪ̯zəˌkaʁtə/',
        example: 'Ich lese die Speisekarte.', exampleTrans: 'Ман меноро мехонам.' },
      { word: 'bestellen', existing: true, translation: 'фармоиш додан', emoji: '🛎️', ipa: '/bəˈʃtɛlən/',
        example: 'Was möchten Sie bestellen?', exampleTrans: 'Шумо чӣ фармоиш додан мехоҳед?' },
      { word: 'die Rechnung', existing: true, translation: 'ҳисоб (чек)', emoji: '🧾', ipa: '/diː ˈʁɛçnʊŋ/',
        example: 'Die Rechnung, bitte.', exampleTrans: 'Ҳисобро биёред, лутфан.' },
      { word: 'lecker', existing: true, translation: 'бомазза', emoji: '😋', ipa: '/ˈlɛkɐ/',
        example: 'Das Essen ist sehr lecker.', exampleTrans: 'Хӯрок хеле бомазза аст.' },
    ],
  },
  {
    title: 'Gedeck', titleTranslated: 'Асбобҳои хӯрокхӯрӣ', emoji: '🍴',
    words: [
      { word: 'der Teller', existing: true, translation: 'коса (тарелка)', emoji: '🍽️', ipa: '/deːɐ̯ ˈtɛlɐ/',
        example: 'Der Teller ist leer.', exampleTrans: 'Тарелка холӣ аст.' },
      { word: 'das Glas', existing: true, translation: 'истакон (стакан)', emoji: '🥃', ipa: '/das ɡlaːs/',
        example: 'Ein Glas Wasser, bitte.', exampleTrans: 'Як стакан об, лутфан.' },
      { word: 'die Tasse', existing: true, translation: 'пиёла (чашка)', emoji: '☕', ipa: '/diː ˈtasə/',
        example: 'Ich trinke eine Tasse Tee.', exampleTrans: 'Ман як пиёла чой менӯшам.' },
      { word: 'das Messer', existing: true, translation: 'корд', emoji: '🔪', ipa: '/das ˈmɛsɐ/',
        example: 'Ich brauche ein Messer.', exampleTrans: 'Ба ман корд лозим аст.' },
      { word: 'die Gabel', existing: true, translation: 'чангол', emoji: '🍴', ipa: '/diː ˈɡaːbəl/',
        example: 'Wo ist die Gabel?', exampleTrans: 'Чангол куҷост?' },
      { word: 'der Löffel', existing: true, translation: 'қошуқ', emoji: '🥄', ipa: '/deːɐ̯ ˈlœfəl/',
        example: 'Ich esse Suppe mit dem Löffel.', exampleTrans: 'Ман шӯрборо бо қошуқ мехӯрам.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: Möchten', lessonTitleTranslated: 'Грамматика: Möchten (мехоҳам)',
    title: 'Ich möchte ... — Орзу ва хоҳиш', titleTranslated: 'Ich möchte ... — Орзу ва хоҳиш',
    emoji: '💭',
    explanation:
`Дар олмонӣ барои хушмуомилагӣ изҳор кардани хоҳиш аз феъли **möchten** (мехостам / мехоҳам) истифода мебаранд. Ин махсусан дар тарабхона ё ҳангоми харид хеле муҳим аст.

Тасрифи феъли **möchten**:
- ich **möchte** (ман мехоҳам)
- du **möchtest** (ту мехоҳӣ)
- er/sie/es **möchte** (ӯ мехоҳад)
- wir **möchten** (мо мехоҳем)
- ihr **möchtet** (шумо мехоҳед)
- sie/Sie **möchten** (онҳо/Шумо мехоҳед)

Аҳамият диҳед, ки шакли **ich** ва **er/sie/es** айнан якхелаанд: *ich möchte, er möchte*.

**Мислҳо:**
- Ich möchte einen Kaffee. (Ман як қаҳва мехостам.)
- Was möchten Sie trinken? (Шумо чӣ нӯшидан мехоҳед?)
- Möchtet ihr Pizza essen? (Шумо питса хӯрдан мехоҳед?)`,
    rules: [
      { pattern: 'ich / er / sie / es möchte', note: 'Шакли ман ва ӯ дар ин феъл якхела аст.' },
      { pattern: 'du möchtest', note: 'Барои ту.' },
      { pattern: 'wir / sie / Sie möchten', note: 'Барои ҷамъ ва шакли эҳтиромона.' },
      { pattern: 'ihr möchtet', note: 'Барои шумо (ҷамъи ғайрирасмӣ).' },
    ],
    examples: [
      { sentence: 'Ich möchte einen Tee, bitte.', translation: 'Ман як чой мехостам, лутфан.', highlight: 'möchte' },
      { sentence: 'Was möchtest du essen?', translation: 'Ту чӣ хӯрдан мехоҳӣ?', highlight: 'möchtest' },
      { sentence: 'Er möchte kein Fleisch essen.', translation: 'Ӯ гӯшт хӯрдан намехоҳад.', highlight: 'möchte' },
      { sentence: 'Wir möchten bezahlen.', translation: 'Мо пардохт кардан мехостем.', highlight: 'möchten' },
      { sentence: 'Was möchten Sie bestellen?', translation: 'Шумо чӣ фармоиш додан мехоҳед?', highlight: 'möchten' },
    ],
    exercises: [
      { prompt: 'Ich ___ einen Kaffee.', promptTranslated: 'Ман як қаҳва мехоҳам.', answer: 'möchte', options: ['möchte', 'möchtest', 'möchten', 'möchtet'], explanation: 'Барои ich шакли möchte меояд.' },
      { prompt: 'Was ___ du trinken?', promptTranslated: 'Ту чӣ нӯшидан мехоҳӣ?', answer: 'möchtest', options: ['möchtest', 'möchte', 'möchten', 'möchtet'], explanation: 'Барои du шакли möchtest меояд.' },
      { prompt: 'Maria ___ einen Apfel essen.', promptTranslated: 'Мария як себ хӯрдан мехоҳад.', answer: 'möchte', options: ['möchte', 'möchtest', 'möchten', 'möchtet'], explanation: 'Maria (sie - ӯ) шакли möchte мегирад.' },
      { prompt: 'Wir ___ bezahlen, bitte.', promptTranslated: 'Мо пардохт кардан мехостем, лутфан.', answer: 'möchten', options: ['möchten', 'möchte', 'möchtest', 'möchtet'], explanation: 'Барои wir шакли möchten меояд.' },
      { prompt: 'Was ___ Sie, Herr Müller?', promptTranslated: 'Шумо чӣ мехоҳед, ҷаноби Мюллер?', answer: 'möchten', options: ['möchten', 'möchte', 'möchtest', 'möchtet'], explanation: 'Барои Sie (Шумо - эҳтиромона) шакли möchten меояд.' },
      { prompt: '___ ihr Pizza essen?', promptTranslated: 'Шумо питса хӯрдан мехоҳед?', answer: 'Möchtet', options: ['Möchtet', 'Möchten', 'Möchtest', 'Möchte'], explanation: 'Барои ihr (шумо - ғайрирасмӣ ҷамъ) шакли möchtet меояд.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Akkusativ', lessonTitleTranslated: 'Грамматика: Падежи Аккузатив',
    title: 'Akkusativ — Объект (Падежи айбдоркунанда)', titleTranslated: 'Akkusativ — Объект (Кӣ/Чӣ-ро?)',
    emoji: '🎯',
    explanation:
`Дар олмонӣ вақте ки мо ягон корро нисбат ба ягон чиз иҷро мекунем (масалан мехӯрем, мебинем, мехарем), он чиз дар падежи **Akkusativ (айбдоркунанда)** меистад.
Хушбахтона, Akkusativ танҳо ба калимаҳои **мардона (der)** таъсир мекунад! Артиклҳои занона, миёна ва ҷамъ тағйир намеёбанд.

Артиклҳои муайян:
- der → **den** (Ich esse **den** Apfel.)
- die → die (Ich esse die Banane.)
- das → das (Ich esse das Brot.)
- die (ҷамъ) → die (Ich esse die Äpfel.)

Артиклҳои номуайян:
- ein → **einen** (Ich esse **einen** Apfel.)
- eine → eine (Ich esse eine Banane.)
- ein → ein (Ich esse ein Brot.)
- (ҷамъ надорад)

Феълҳое ки ҳамеша Akkusativ талаб мекунанд:
**essen** (хӯрдан), **trinken** (нӯшидан), **brauchen** (эҳтиёҷ доштан), **haben** (доштан), **möchten** (хостан).

Мисол: 
Der Kaffee ist gut. (Қаҳва хуб аст. - Номинатив)
Ich trinke **den** Kaffee. (Ман қаҳва**ро** менӯшам. - Аккузатив)`,
    rules: [
      { pattern: 'der → den', note: 'Артикли муайяни мардона дар Аккузатив den мешавад.' },
      { pattern: 'ein → einen', note: 'Артикли номуайяни мардона дар Аккузатив einen мешавад.' },
      { pattern: 'die / das', note: 'Артиклҳои занона (die) ва миёна (das) тағйир намеёбанд.' },
      { pattern: 'eine / ein', note: 'Барои занона (eine) ва миёна (ein) тағйир намеёбанд.' },
    ],
    examples: [
      { sentence: 'Ich brauche einen Löffel.', translation: 'Ба ман як қошуқ (der Löffel) лозим аст.', highlight: 'einen' },
      { sentence: 'Wir trinken den Saft.', translation: 'Мо шарбатро (der Saft) менӯшем.', highlight: 'den' },
      { sentence: 'Er isst eine Banane.', translation: 'Ӯ як банан (die Banane) мехӯрад.', highlight: 'eine' },
      { sentence: 'Ich möchte ein Wasser.', translation: 'Ман як об (das Wasser) мехоҳам.', highlight: 'ein' },
      { sentence: 'Sie haben einen Hund.', translation: 'Онҳо як саг (der Hund) доранд.', highlight: 'einen' },
    ],
    exercises: [
      { prompt: 'Ich esse ___ Apfel (der).', promptTranslated: 'Ман як себ мехӯрам.', answer: 'einen', options: ['einen', 'ein', 'eine', 'einem'], explanation: 'Apfel мардона (der) аст. Дар Аккузатив einen мешавад.' },
      { prompt: 'Wir trinken ___ Wasser (das).', promptTranslated: 'Мо об менӯшем.', answer: 'das', options: ['das', 'den', 'die', 'dem'], explanation: 'Wasser миёна (das) аст. Дар Аккузатив тағйир намеёбад.' },
      { prompt: 'Er möchte ___ Banane (die).', promptTranslated: 'Ӯ як банан мехоҳад.', answer: 'eine', options: ['eine', 'ein', 'einen', 'einer'], explanation: 'Banane занона (die) аст. Дар Аккузатив тағйир намеёбад.' },
      { prompt: 'Brauchst du ___ Löffel (der)?', promptTranslated: 'Ба ту як қошуқ лозим аст?', answer: 'einen', options: ['einen', 'ein', 'eine', 'einer'], explanation: 'Löffel мардона (der) аст. Дар Аккузатив einen мешавад.' },
      { prompt: 'Ich lese ___ Speisekarte (die).', promptTranslated: 'Ман меноро мехонам.', answer: 'die', options: ['die', 'den', 'das', 'der'], explanation: 'Speisekarte занона (die) аст. Дар Аккузатив тағйир намеёбад.' },
      { prompt: 'Sie bestellt ___ Tee (der).', promptTranslated: 'Ӯ як чой фармоиш медиҳад.', answer: 'einen', options: ['einen', 'ein', 'eine', 'eines'], explanation: 'Tee мардона (der) аст. Дар Аккузатив einen мешавад.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Ich esse gern Fisch', lessonTitleTranslated: 'Грамматика: Ман моҳиро бо майл мехӯрам',
    title: 'gern und lieber', titleTranslated: 'gern ва lieber — хуш доштан',
    emoji: '😋',
    explanation:
`Дар олмонӣ барои «хуш доштан» феъли алоҳида лозим нест — танҳо калимаи хурди **gern** илова мешавад.

> феъл + **gern** = коре бо майл кардан

- Ich esse **gern** Fisch. (Ман моҳиро бо майл мехӯрам / моҳиро дӯст медорам.)
- Sie trinkt **gern** Tee.
- Wir lernen **gern** Deutsch.

**Инкор — nicht gern:**
- Ich esse **nicht gern** Fleisch. (Ман гӯштро дӯст намедорам.)

**Муқоиса — lieber (бештар дӯст доштан):**
- Ich trinke gern Tee, aber ich trinke **lieber** Kaffee. (…вале қаҳваро бештар дӯст медорам.)

**Ҷои gern дар ҷумла:** баъди феъл ва одатан ПЕШ аз объект.

> Ich trinke **gern** Milch. ✅
> ~~Ich gern trinke Milch.~~ ❌

**Доми тоҷик:** мо мегӯем «ман чой нӯшиданро дӯст медорам» — ду феъл. Дар олмонӣ ЯК феъл бас аст: *Ich trinke gern Tee.* Ҳеҷ гоҳ «lieben» (дӯст доштан) барои хӯрок ва машғулият гуфта намешавад — «lieben» танҳо барои одам аст.`,
    rules: [
      { pattern: 'феъл + gern', note: 'Ich esse gern Fisch = моҳиро дӯст медорам.' },
      { pattern: 'nicht gern = дӯст надоштан', note: 'Ich esse nicht gern Fleisch.' },
      { pattern: 'lieber = бештар', note: 'Ich trinke lieber Kaffee.' },
      { pattern: 'gern баъди феъл меистад', note: 'Ich trinke gern Tee — на «Ich gern trinke».' },
    ],
    examples: [
      { sentence: 'Ich esse gern Fisch.', translation: 'Ман моҳиро дӯст медорам.', highlight: 'gern' },
      { sentence: 'Sie trinkt gern Tee.', translation: 'Вай чойро дӯст медорад.', highlight: 'gern' },
      { sentence: 'Ich esse nicht gern Fleisch.', translation: 'Ман гӯштро дӯст намедорам.', highlight: 'nicht gern' },
      { sentence: 'Wir trinken lieber Kaffee.', translation: 'Мо қаҳваро бештар дӯст медорем.', highlight: 'lieber' },
      { sentence: 'Was isst du gern?', translation: 'Ту чиро бо майл мехӯрӣ?', highlight: 'gern' },
      { sentence: 'Er trinkt gern Milch.', translation: 'Ӯ ширро дӯст медорад.', highlight: 'gern' },
    ],
    exercises: [
      { prompt: 'Ich esse ___ Fisch.', promptTranslated: 'Ман моҳиро дӯст медорам.', answer: 'gern', options: ['gern', 'lieber', 'nicht', 'sehr'], explanation: 'gern = бо майл.' },
      { prompt: 'Ich esse ___ Fleisch. (дӯст намедорам)', promptTranslated: 'Ман гӯштро дӯст намедорам.', answer: 'nicht gern', options: ['nicht gern', 'gern nicht', 'kein gern', 'gern'], explanation: 'Инкор: nicht gern.' },
      { prompt: 'Tee ist gut, aber ich trinke ___ Kaffee.', promptTranslated: 'Чой хуб аст, вале ман қаҳваро бештар дӯст медорам.', answer: 'lieber', options: ['lieber', 'gern', 'nicht', 'auch'], explanation: 'lieber = бештар дӯст доштан.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Ich trinke gern Milch.', options: ['Ich trinke gern Milch.', 'Ich gern trinke Milch.', 'Gern ich trinke Milch.', 'Ich trinke Milch gern nicht.'], explanation: 'gern баъди феъл меистад.' },
      { prompt: 'Was ___ du gern?', promptTranslated: 'Ту чиро бо майл мехӯрӣ?', answer: 'isst', options: ['isst', 'esse', 'essen', 'esst'], explanation: 'Барои «du» — isst.' },
      { prompt: 'Sie ___ gern Tee. (вай)', promptTranslated: 'Вай чойро дӯст медорад.', answer: 'trinkt', options: ['trinkt', 'trinke', 'trinkst', 'trinken'], explanation: 'Барои «sie» (вай) — trinkt.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Im Café', lessonTitleTranslated: 'Дар қаҳвахона',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '☕',
    title: 'Im Café', titleTranslated: 'Дар қаҳвахона',
    passage: 'Es ist Nachmittag. Anna und Lukas sind im Café. Lukas hat Durst und bestellt einen Kaffee und ein Wasser. Anna hat Hunger. Sie möchte ein Stück Kuchen und einen Tee. Die Rechnung ist 15 Euro. Lukas bezahlt.',
    passageTranslated: 'Баъдизуҳр аст. Анна ва Лукас дар қаҳвахона ҳастанд. Лукас ташна аст ва як қаҳва ва як об фармоиш медиҳад. Анна гурусна аст. Ӯ як пора торт ва як чой мехоҳад. Ҳисоб 15 евро аст. Лукас пардохт мекунад.',
    questions: [
      { question: 'Wo sind Anna und Lukas?', questionTranslated: 'Анна ва Лукас дар куҷоянд?', options: ['Im Café', 'Im Restaurant', 'Zu Hause'], correctIndex: 0, explanation: 'Матн: Anna und Lukas sind im Café.' },
      { question: 'Was bestellt Lukas?', questionTranslated: 'Лукас чӣ фармоиш медиҳад?', options: ['Kaffee und Wasser', 'Tee und Kuchen', 'Brot und Wasser'], correctIndex: 0, explanation: 'Матн: Lukas bestellt einen Kaffee und ein Wasser.' },
      { question: 'Wer hat Hunger?', questionTranslated: 'Кӣ гурусна аст?', options: ['Anna', 'Lukas', 'Beide'], correctIndex: 0, explanation: 'Матн: Anna hat Hunger.' },
      { question: 'Wer bezahlt die Rechnung?', questionTranslated: 'Кӣ ҳисобро пардохт мекунад?', options: ['Lukas', 'Anna', 'Niemand'], correctIndex: 0, explanation: 'Матн: Lukas bezahlt.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Im Restaurant', lessonTitleTranslated: 'Шунавоӣ: Дар тарабхона',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Im Restaurant', titleTranslated: 'Шунавоӣ: Дар тарабхона',
    passage: 'Kellner: Guten Abend! Was möchten Sie bestellen?\nFrau: Ich nehme das Hähnchen mit Kartoffeln und einen Orangensaft.\nKellner: Und für Sie, der Herr?\nMann: Ich esse Fisch mit Salat. Und ich trinke ein Wasser.\nKellner: Gerne. Kommt sofort.',
    passageTranslated: 'Пешхидмат: Шоми нек! Шумо чӣ фармоиш додан мехоҳед?\nЗан: Ман мурғ бо картошка ва як шарбати афлесун мегирам.\nПешхидмат: Ва барои шумо, ҷаноб?\nМард: Ман моҳӣ бо хӯриш мехӯрам. Ва ман як об менӯшам.\nПешхидмат: Бо камоли майл. Ҳозир меорем.',
    questions: [
      { question: 'Was isst die Frau?', questionTranslated: 'Зан чӣ мехӯрад?', options: ['Hähnchen mit Kartoffeln', 'Fisch mit Salat', 'Obst'], correctIndex: 0, explanation: 'Матн: Ich nehme das Hähnchen mit Kartoffeln.' },
      { question: 'Was trinkt der Mann?', questionTranslated: 'Мард чӣ менӯшад?', options: ['Wasser', 'Orangensaft', 'Kaffee'], correctIndex: 0, explanation: 'Матн: Und ich trinke ein Wasser.' },
      { question: 'Was isst der Mann?', questionTranslated: 'Мард чӣ мехӯрад?', options: ['Fisch mit Salat', 'Hähnchen', 'Brot'], correctIndex: 0, explanation: 'Матн: Ich esse Fisch mit Salat.' },
      { question: 'Wann passiert das?', questionTranslated: 'Ин кай рӯй медиҳад?', options: ['Am Abend', 'Am Morgen', 'Am Nachmittag'], correctIndex: 0, explanation: 'Матн: Guten Abend!' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: Essen und Trinken', titleTranslated: 'Такрор: Хӯрок ва нӯшокиҳо',
    passage: 'Für Höflichkeit sagen wir: "Ich möchte". Ich möchte einen Kaffee. Das Wort "Kaffee" ist "der Kaffee", im Akkusativ wird es zu "den Kaffee" oder "einen Kaffee". Das Wasser (das) und die Milch (die) ändern sich im Akkusativ nicht.',
    passageTranslated: 'Барои хушмуомилагӣ мо мегӯем: "Ich möchte" (ман мехостам). Ман як қаҳва мехостам. Калимаи "Kaffee" мардона аст (der Kaffee), дар Аккузатив он "den Kaffee" ё "einen Kaffee" мешавад. "das Wasser" ва "die Milch" дар Аккузатив тағйир намеёбанд.',
    questions: [
      { question: 'Wie sagt man höflich "ман мехоҳам"?', questionTranslated: 'Бо хушмуомилагӣ "ман мехоҳам" чист?', options: ['Ich möchte', 'Ich brauche', 'Ich esse'], correctIndex: 0, explanation: 'Матн: Für Höflichkeit sagen wir: "Ich möchte".' },
      { question: 'Welcher Artikel ändert sich im Akkusativ?', questionTranslated: 'Кадом артикл дар Аккузатив тағйир меёбад?', options: ['der', 'die', 'das'], correctIndex: 0, explanation: 'Танҳо артиклҳои мардона (der) тағйир меёбанд.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Der Einkauf', titleTranslated: 'Харид',
    passage: 'Morgen ist Sonntag. Herr Schmidt kauft Essen für das Frühstück und das Mittagessen ein. Er braucht Brot, Butter, Käse und Eier. Für das Mittagessen kauft er Fleisch, Kartoffeln und Tomaten. Seine Kinder trinken gerne Saft. Er kauft Apfelsaft. Er bezahlt an der Kasse.',
    passageTranslated: 'Фардо рӯзи якшанбе аст. Ҷаноби Шмидт барои наҳорӣ ва хӯроки нисфирӯзӣ хӯрокворӣ мехарад. Ба ӯ нон, маска, панир ва тухм лозим аст. Барои хӯроки нисфирӯзӣ ӯ гӯшт, картошка ва помидор мехарад. Кӯдакони ӯ шарбат нӯшиданро дӯст медоранд. Ӯ шарбати себ мехарад. Ӯ дар хазина пардохт мекунад.',
    questions: [
      { question: 'Welcher Tag ist morgen?', questionTranslated: 'Фардо кадом рӯз аст?', options: ['Sonntag', 'Montag', 'Samstag'], correctIndex: 0, explanation: 'Матн: Morgen ist Sonntag.' },
      { question: 'Was kauft er für das Frühstück?', questionTranslated: 'Барои наҳорӣ ӯ чӣ мехарад?', options: ['Brot, Butter, Käse, Eier', 'Fleisch und Tomaten', 'Kaffee und Wasser'], correctIndex: 0, explanation: 'Матн: Er braucht Brot, Butter, Käse und Eier.' },
      { question: 'Was kauft er für das Mittagessen?', questionTranslated: 'Барои хӯроки нисфирӯзӣ ӯ чӣ мехарад?', options: ['Fleisch, Kartoffeln, Tomaten', 'Brot und Käse', 'Fisch und Salat'], correctIndex: 0, explanation: 'Матн: Für das Mittagessen kauft er Fleisch, Kartoffeln und Tomaten.' },
      { question: 'Was trinken die Kinder gern?', questionTranslated: 'Кӯдакон чиро дӯст медоранд?', options: ['Saft', 'Wasser', 'Milch'], correctIndex: 0, explanation: 'Матн: Seine Kinder trinken gerne Saft.' },
      { question: 'Welcher Artikel steht vor "Kaffee" (der Kaffee) im Satz: Ich trinke ___ Kaffee?', questionTranslated: 'Дар ин ҷумла кадом артикл меояд: Ich trinke ___ Kaffee?', options: ['einen', 'ein', 'eine'], correctIndex: 0, explanation: 'Kaffee мардона (der) аст. Дар Аккузатив einen мешавад.' },
      { question: 'Wie sagt man "мо мехоҳем"?', questionTranslated: '"мо мехоҳем" чӣ гуна аст?', options: ['wir möchten', 'wir möchte', 'wir möchtet'], correctIndex: 0, explanation: 'Феъли möchte барои wir ҳамчун möchten меояд.' },
      { question: 'Welcher Artikel passt zu Wasser?', questionTranslated: 'Ба калимаи об кадом артикл мувофиқ аст?', options: ['das', 'die', 'der'], correctIndex: 0, explanation: 'Олмонӣ: das Wasser.' },
      { question: 'Was bedeutet "die Rechnung"?', questionTranslated: '"die Rechnung" чӣ маъно дорад?', options: ['ҳисоб (чек)', 'мено', 'тарабхона'], correctIndex: 0, explanation: 'die Rechnung = ҳисоб.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: Im Restaurant', lessonTitleTranslated: 'Муколама: Дар тарабхона',
  title: 'Essen bestellen', titleTranslated: 'Фармоиши хӯрок',
  scenario: 'Ein Paar bestellt Essen im Restaurant.', emoji: '🗣️',
  lines: [
    { speaker: 'Kellner', text: 'Guten Abend! Was möchten Sie trinken?', translation: 'Шоми нек! Шумо чӣ нӯшидан мехоҳед?' },
    { speaker: 'Gast 1', text: 'Ich nehme ein Wasser, bitte.', translation: 'Ман як об мегирам, лутфан.' },
    { speaker: 'Gast 2', text: 'Und ich möchte einen Kaffee.', translation: 'Ва ман як қаҳва мехостам.' },
    { speaker: 'Kellner', text: 'Gerne. Und zum Essen?', translation: 'Бо камоли майл. Ва барои хӯрдан?' },
    { speaker: 'Gast 1', text: 'Ich esse den Fisch mit Salat.', translation: 'Ман моҳиро бо хӯриш мехӯрам.' },
    { speaker: 'Gast 2', text: 'Ich möchte das Hähnchen mit Kartoffeln.', translation: 'Ман мурғро бо картошка мехостам.' },
    { speaker: 'Kellner', text: 'Sehr gut. Guten Appetit!', translation: 'Хеле хуб. Иштиҳои нек!' },
    { speaker: 'Gast 1', text: 'Danke!', translation: 'Ташаккур!' },
    { speaker: 'Gast 2', text: 'Wir möchten dann bezahlen, bitte.', translation: 'Мо баъдтар пардохт кардан мехостем, лутфан.' },
    { speaker: 'Kellner', text: 'Zusammen oder getrennt?', translation: 'Якҷоя ё ҷудогона?' },
    { speaker: 'Gast 2', text: 'Zusammen. Hier, bitte.', translation: 'Якҷоя. Ин ҷо (пул), марҳамат.' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['das Brot', 'das Wasser', 'der Apfel', 'das Fleisch', 'bestellen', 'die Rechnung', 'der Teller', 'der Kaffee'],
};

export const ORDER = [
  'vocab:Frühstück',
  'vocab:Obst',
  'vocab:Gemüse',
  'vocab:Fleisch und Fisch',
  'vocab:Getränke',
  'vocab:Im Restaurant',
  'vocab:Gedeck',
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
