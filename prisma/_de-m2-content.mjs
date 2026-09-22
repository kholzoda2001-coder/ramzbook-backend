// Мазмуни Модули 2-и олмонӣ (A1) — «Die Familie».
//
// Сохтор ҳамон 15-дарса аст, вале МАЗМУН комилан аз худи олмонӣ бармеояд, на
// тарҷумаи модули дигар: грамматикаи ин ҷо `der/die/das` ва `mein/dein` аст —
// маҳз он чизе ки хонандаи тоҷик ҳангоми гуфтани «падари ман» лозим дорад ва
// дар забони модариаш умуман вуҷуд надорад (ҷинси грамматикӣ).
//
// Танҳо МАЪЛУМОТ — мантиқ дар `_de-module-build.mjs`.

export const MODULE = {
  order: 1,
  title: 'Die Familie',
  titleTranslated: 'Оила',
  emoji: '👨‍👩‍👧‍👦',
};

export const VOCAB = [
  {
    title: 'Die Familie', titleTranslated: 'Оила', emoji: '👨‍👩‍👧‍👦',
    words: [
      { word: 'die Familie', existing: true, existing: true },
      { word: 'der Vater', existing: true, existing: true },
      { word: 'die Mutter', existing: true, existing: true },
      { word: 'das Kind', existing: true, existing: true },
      { word: 'die Eltern', existing: true, translation: 'волидайн', emoji: '👪', ipa: '/diː ˈɛltɐn/',
        example: 'Meine Eltern sind zu Hause.', exampleTrans: 'Волидайни ман дар хонаанд.' },
      { word: 'die Geschwister', existing: true, translation: 'бародару хоҳарон', emoji: '👫', ipa: '/diː ɡəˈʃvɪstɐ/',
        example: 'Ich habe zwei Geschwister.', exampleTrans: 'Ман ду бародару хоҳар дорам.' },
    ],
  },
  {
    title: 'Bruder und Schwester', titleTranslated: 'Бародар ва хоҳар', emoji: '👦',
    words: [
      { word: 'der Bruder', existing: true, existing: true },
      { word: 'die Schwester', existing: true, existing: true },
      { word: 'der Sohn', existing: true, translation: 'писар', emoji: '🧒', ipa: '/deːɐ̯ zoːn/',
        example: 'Sein Sohn ist fünf Jahre alt.', exampleTrans: 'Писари ӯ панҷсола аст.' },
      { word: 'die Tochter', existing: true, translation: 'духтар', emoji: '👧', ipa: '/diː ˈtɔxtɐ/',
        example: 'Ihre Tochter geht zur Schule.', exampleTrans: 'Духтари ӯ ба мактаб меравад.' },
    ],
  },
  {
    title: 'Großeltern', titleTranslated: 'Бобою бибӣ', emoji: '👴',
    words: [
      { word: 'die Großmutter', existing: true, existing: true },
      { word: 'der Großvater', existing: true, existing: true },
      { word: 'die Großeltern', existing: true, translation: 'бобою бибӣ', emoji: '👵', ipa: '/diː ˈɡʁoːsʔɛltɐn/',
        example: 'Meine Großeltern wohnen im Dorf.', exampleTrans: 'Бобою бибиям дар деҳа зиндагӣ мекунанд.' },
      { word: 'das Enkelkind', existing: true, translation: 'набера', emoji: '👶', ipa: '/das ˈʔɛŋkəlkɪnt/',
        example: 'Das Enkelkind spielt im Garten.', exampleTrans: 'Набера дар боғ бозӣ мекунад.' },
    ],
  },
  {
    title: 'Verwandte', titleTranslated: 'Хешовандон', emoji: '🧔',
    words: [
      { word: 'der Onkel', existing: true, existing: true },
      { word: 'die Tante', existing: true, existing: true },
      { word: 'der Cousin', existing: true, translation: 'ҷиян (писар)', emoji: '👨', ipa: '/deːɐ̯ kuˈzɛː/',
        example: 'Mein Cousin heißt Ali.', exampleTrans: 'Номи ҷиянам Алӣ аст.' },
      { word: 'die Cousine', existing: true, translation: 'ҷиян (духтар)', emoji: '👩', ipa: '/diː kuˈziːnə/',
        example: 'Meine Cousine ist Studentin.', exampleTrans: 'Ҷиянам донишҷӯ аст.' },
    ],
  },
  {
    title: 'Personalpronomen', titleTranslated: 'Ҷонишинҳои шахсӣ', emoji: '👤',
    words: [
      { word: 'ich', existing: true, existing: true },
      { word: 'du', existing: true, existing: true },
      { word: 'er', existing: true, existing: true },
      { word: 'sie', existing: true, existing: true },
      { word: 'es', existing: true, existing: true },
      { word: 'wir', existing: true, existing: true },
      { word: 'ihr', existing: true, existing: true },
      { word: 'Sie', existing: true, existing: true },
    ],
  },
  {
    title: 'Familie beschreiben', titleTranslated: 'Тавсифи оила', emoji: '💍',
    words: [
      { word: 'verheiratet', existing: true, translation: 'оиладор', emoji: '💍', ipa: '/fɛɐ̯ˈhaɪ̯ʁaːtət/',
        example: 'Mein Bruder ist verheiratet.', exampleTrans: 'Бародарам оиладор аст.' },
      { word: 'ledig', existing: true, translation: 'муҷаррад', emoji: '🙋', ipa: '/ˈleːdɪç/',
        example: 'Meine Schwester ist noch ledig.', exampleTrans: 'Хоҳарам ҳанӯз муҷаррад аст.' },
      { word: 'die Person', existing: true, translation: 'шахс', emoji: '🧍', ipa: '/diː pɛʁˈzoːn/',
        example: 'Diese Person ist sehr nett.', exampleTrans: 'Ин шахс хеле меҳрубон аст.' },
      { word: 'die Leute', existing: true, translation: 'мардум', emoji: '👥', ipa: '/diː ˈlɔʏ̯tə/',
        example: 'Die Leute sind sehr nett.', exampleTrans: 'Мардум хеле меҳрубонанд.' },
      { word: 'zusammen', existing: true, translation: 'якҷоя', emoji: '🤝', ipa: '/tsuˈzamən/',
        example: 'Wir wohnen zusammen.', exampleTrans: 'Мо якҷоя зиндагӣ мекунем.' },
    ],
  },
  {
    title: 'Über die Familie sprechen', titleTranslated: 'Дар бораи оила сухан гуфтан', emoji: '💬',
    words: [
      { word: 'Ich habe einen Bruder', existing: true, translation: 'Ман як бародар дорам', emoji: '👨‍👦',
        ipa: '/ɪç ˈhaːbə ˈaɪ̯nən ˈbʁuːdɐ/',
        example: 'Ich habe einen Bruder und eine Schwester.', exampleTrans: 'Ман як бародар ва як хоҳар дорам.' },
      { word: 'Ich habe keine Geschwister', existing: true, translation: 'Ман бародару хоҳар надорам', emoji: '🚫',
        ipa: '/ɪç ˈhaːbə ˈkaɪ̯nə ɡəˈʃvɪstɐ/',
        example: 'Ich habe keine Geschwister. Ich bin allein.', exampleTrans: 'Ман бародару хоҳар надорам. Ман танҳо ҳастам.' },
      { word: 'Meine Familie ist groß', existing: true, translation: 'Оилаи ман калон аст', emoji: '👨‍👩‍👧‍👦',
        ipa: '/ˈmaɪ̯nə faˈmiːliə ɪst ɡʁoːs/',
        example: 'Meine Familie ist groß und laut.', exampleTrans: 'Оилаи ман калон ва пурғавғо аст.' },
      { word: 'Wie viele Geschwister hast du', existing: true, translation: 'Чанд бародару хоҳар дорӣ?', emoji: '❓',
        ipa: '/viː ˈfiːlə ɡəˈʃvɪstɐ hast duː/',
        example: 'Wie viele Geschwister hast du?', exampleTrans: 'Чанд бародару хоҳар дорӣ?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: der, die, das', lessonTitleTranslated: 'Грамматика: der, die, das',
    title: 'Die Artikel: der, die, das', titleTranslated: 'Артиклҳо: der, die, das',
    emoji: '🏷️',
    explanation:
`Дар олмонӣ ҲАР исм артикли худро дорад ва он қисми калима аст. Онро якҷоя бо калима аз ёд кардан лозим: на «Vater», балки «**der** Vater».

- **der** — ҷинси мардона: der Vater, der Bruder, der Onkel, der Sohn
- **die** — ҷинси занона: die Mutter, die Schwester, die Tante, die Tochter
- **das** — ҷинси миёна: das Kind, das Mädchen

Дар тоҷикӣ ҷинси грамматикӣ тамоман нест, барои ҳамин ин чиз нав аст ва зеҳн онро худаш «ҳис» намекунад — танҳо аз ёд кардан кӯмак мекунад.

**Чаро ин муҳим аст?** Артикл нишон медиҳад, ки калима бо кадом ҷонишин иваз мешавад:

- der Vater → **er**
- die Mutter → **sie**
- das Kind → **es**

**Ҳушдор:** ҷинс аз маънои калима бармеояд гуфтан хатост. **das** Mädchen (духтарбача) ҷинси МИЁНА дорад, на занона. Сабабаш бандаки «-chen» аст: ҳар калимаи «-chen» ҳамеша das мегирад.

**Ҷамъ:** дар ҷамъ артикли ҳамаи ҷинсҳо **die** мешавад: die Eltern, die Kinder, die Geschwister.`,
    rules: [
      { pattern: 'der → мардона', note: 'der Vater, der Bruder, der Onkel, der Sohn.' },
      { pattern: 'die → занона', note: 'die Mutter, die Schwester, die Tante, die Tochter.' },
      { pattern: 'das → миёна', note: 'das Kind, das Mädchen. Ҳар калимаи бо «-chen» — das.' },
      { pattern: 'Ҷамъ → ҳамеша die', note: 'die Eltern, die Kinder, die Großeltern, die Geschwister.' },
    ],
    examples: [
      { sentence: 'Der Vater ist zu Hause.', translation: 'Падар дар хона аст.', highlight: 'Der' },
      { sentence: 'Die Mutter kocht.', translation: 'Модар хӯрок мепазад.', highlight: 'Die' },
      { sentence: 'Das Kind spielt.', translation: 'Кӯдак бозӣ мекунад.', highlight: 'Das' },
      { sentence: 'Der Bruder ist klein.', translation: 'Бародар хурд аст.', highlight: 'Der' },
      { sentence: 'Die Eltern sind hier.', translation: 'Волидайн ин ҷоянд.', highlight: 'Die' },
      { sentence: 'Das Mädchen heißt Lena.', translation: 'Номи духтарбача Лена аст.', highlight: 'Das' },
    ],
    exercises: [
      { prompt: '___ Vater ist Lehrer.', promptTranslated: 'Падар муаллим аст.', answer: 'Der', options: ['Der', 'Die', 'Das', 'Den'], explanation: 'Vater мардона аст → der.' },
      { prompt: '___ Mutter ist Ärztin.', promptTranslated: 'Модар духтур аст.', answer: 'Die', options: ['Die', 'Der', 'Das', 'Den'], explanation: 'Mutter занона аст → die.' },
      { prompt: '___ Kind spielt im Garten.', promptTranslated: 'Кӯдак дар боғ бозӣ мекунад.', answer: 'Das', options: ['Das', 'Der', 'Die', 'Den'], explanation: 'Kind ҷинси миёна дорад → das.' },
      { prompt: '___ Schwester ist jung.', promptTranslated: 'Хоҳар ҷавон аст.', answer: 'Die', options: ['Die', 'Der', 'Das', 'Dem'], explanation: 'Schwester занона аст → die.' },
      { prompt: '___ Bruder heißt Ali.', promptTranslated: 'Номи бародар Алӣ аст.', answer: 'Der', options: ['Der', 'Die', 'Das', 'Dem'], explanation: 'Bruder мардона аст → der.' },
      { prompt: '___ Mädchen ist klein.', promptTranslated: 'Духтарбача хурд аст.', answer: 'Das', options: ['Das', 'Die', 'Der', 'Den'], explanation: '«-chen» ҳамеша das мегирад — ҳатто барои духтарбача.' },
      { prompt: '___ Eltern sind zu Hause.', promptTranslated: 'Волидайн дар хонаанд.', answer: 'Die', options: ['Die', 'Der', 'Das', 'Dem'], explanation: 'Ҷамъ ҳамеша die.' },
      { prompt: 'Der Vater ist hier. ___ ist Lehrer.', promptTranslated: 'Падар ин ҷост. Ӯ муаллим аст.', answer: 'Er', options: ['Er', 'Sie', 'Es', 'Wir'], explanation: 'der → er.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: mein und dein', lessonTitleTranslated: 'Грамматика: mein ва dein',
    title: 'Possessivartikel: mein, dein', titleTranslated: 'Ҷонишинҳои соҳибӣ: mein, dein',
    emoji: '🫱',
    explanation:
`«Падари ман», «хоҳари ту» — дар олмонӣ ин бо **mein** ва **dein** сохта мешавад. Онҳо ба ҷои артикл меистанд ва ба ҷинси исм мувофиқ мешаванд:

- der Vater → **mein** Vater (падари ман)
- das Kind → **mein** Kind (кӯдаки ман)
- die Mutter → **meine** Mutter (модари ман)
- die Eltern (ҷамъ) → **meine** Eltern (волидайни ман)

Қоида содда аст: бо **der** ва **das** — **mein**; бо **die** ва ҷамъ — **meine** (бандаки -e).

**dein** (аз они ту) айнан ҳамин қоидаро дорад: dein Bruder, deine Schwester.

Дар муроҷиати расмӣ **Ihr** истифода мешавад ва ҳамеша бо ҳарфи калон навишта мешавад: Ihr Name, Ihre Familie.

Диққат кунед: дар тоҷикӣ мо мегӯем «падар-**ам**» — бандак дар охири калима. Дар олмонӣ баръакс, калимаи алоҳида ПЕШ аз исм меистад.`,
    rules: [
      { pattern: 'der / das → mein', note: 'mein Vater, mein Kind — бе бандак.' },
      { pattern: 'die / ҷамъ → meine', note: 'meine Mutter, meine Eltern — бо бандаки -e.' },
      { pattern: 'dein ҳамон қоида', note: 'dein Bruder, deine Schwester.' },
      { pattern: 'Расмӣ → Ihr / Ihre', note: 'Ihr Name, Ihre Familie — ҳамеша бо ҳарфи калон.' },
    ],
    examples: [
      { sentence: 'Das ist mein Vater.', translation: 'Ин падари ман аст.', highlight: 'mein' },
      { sentence: 'Das ist meine Mutter.', translation: 'Ин модари ман аст.', highlight: 'meine' },
      { sentence: 'Mein Kind ist klein.', translation: 'Кӯдаки ман хурд аст.', highlight: 'Mein' },
      { sentence: 'Meine Eltern sind hier.', translation: 'Волидайни ман ин ҷоянд.', highlight: 'Meine' },
      { sentence: 'Wie heißt deine Schwester?', translation: 'Номи хоҳари ту чист?', highlight: 'deine' },
    ],
    exercises: [
      { prompt: 'Das ist ___ Vater.', promptTranslated: 'Ин падари ман аст.', answer: 'mein', options: ['mein', 'meine', 'dein', 'deine'], explanation: 'der Vater → mein, бе -e.' },
      { prompt: 'Das ist ___ Mutter.', promptTranslated: 'Ин модари ман аст.', answer: 'meine', options: ['meine', 'mein', 'deine', 'dein'], explanation: 'die Mutter → meine, бо -e.' },
      { prompt: '___ Kind ist klein.', promptTranslated: 'Кӯдаки ман хурд аст.', answer: 'Mein', options: ['Mein', 'Meine', 'Dein', 'Deine'], explanation: 'das Kind → mein.' },
      { prompt: '___ Eltern sind zu Hause.', promptTranslated: 'Волидайни ман дар хонаанд.', answer: 'Meine', options: ['Meine', 'Mein', 'Dein', 'Deins'], explanation: 'Ҷамъ → meine.' },
      { prompt: 'Wie heißt ___ Bruder?', promptTranslated: 'Номи бародари ту чист?', answer: 'dein', options: ['dein', 'deine', 'mein', 'meine'], explanation: 'der Bruder → dein.' },
      { prompt: 'Wie heißt ___ Schwester?', promptTranslated: 'Номи хоҳари ту чист?', answer: 'deine', options: ['deine', 'dein', 'meine', 'mein'], explanation: 'die Schwester → deine.' },
      { prompt: '___ Großeltern sind alt.', promptTranslated: 'Бобою бибии ман пиранд.', answer: 'Meine', options: ['Meine', 'Mein', 'Deine', 'Dein'], explanation: 'Ҷамъ → meine.' },
      { prompt: 'Das ist ___ Onkel.', promptTranslated: 'Ин амаки ман аст.', answer: 'mein', options: ['mein', 'meine', 'deine', 'Ihre'], explanation: 'der Onkel → mein.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Das Verb im Präsens', lessonTitleTranslated: 'Грамматика: Феъл дар замони ҳозира',
    title: 'Präsens: regelmäßige Verben und haben', titleTranslated: 'Замони ҳозира: феъли муқаррарӣ ва haben',
    emoji: '🔤',
    explanation:
`Дар олмонӣ феъл вобаста ба шахс **бандак** мегирад. Реша бетағйир мемонад, танҳо охираш иваз мешавад.

**wohnen (зиндагӣ кардан):**

| шахс | феъл |
|---|---|
| ich | wohn**e** |
| du | wohn**st** |
| er / sie / es | wohn**t** |
| wir | wohn**en** |
| ihr | wohn**t** |
| sie / Sie | wohn**en** |

Ҳамин панҷ бандак (**-e, -st, -t, -en, -t, -en**) барои ҳазорҳо феъли муқаррарӣ кор мекунад: lernen, machen, kaufen, spielen, arbeiten.

**haben (доштан) — номунтазам, аз ёд карда шавад:**
ich **habe** · du **hast** · er/sie/es **hat** · wir **haben** · ihr **habt** · sie/Sie **haben**

- Ich **habe** einen Bruder. (Ман як бародар дорам.)
- **Hast** du Kinder? (Ту фарзанд дорӣ?)

**Доми тоҷик:** дар тоҷикӣ ҷонишинро партофтан мумкин аст — «меравам». Дар олмонӣ ҷонишин ҲАМЕША лозим аст: ❌ *Wohne in Duschanbe.* → ✅ **Ich wohne** in Duschanbe.`,
    rules: [
      { pattern: 'ich -e · du -st · er -t', note: 'ich wohne, du wohnst, er wohnt.' },
      { pattern: 'wir -en · ihr -t · sie/Sie -en', note: 'wir wohnen, ihr wohnt, sie wohnen.' },
      { pattern: 'haben номунтазам аст', note: 'ich habe, du hast, er hat — аз ёд карда шавад.' },
      { pattern: 'Ҷонишин ҳамеша меистад', note: 'Дар олмонӣ ҷумла бе ich/du/er намешавад.' },
    ],
    examples: [
      { sentence: 'Ich wohne in Duschanbe.', translation: 'Ман дар Душанбе зиндагӣ мекунам.', highlight: 'wohne' },
      { sentence: 'Du lernst Deutsch.', translation: 'Ту олмониро меомӯзӣ.', highlight: 'lernst' },
      { sentence: 'Er macht das gut.', translation: 'Ӯ инро хуб мекунад.', highlight: 'macht' },
      { sentence: 'Wir lernen zusammen.', translation: 'Мо якҷоя меомӯзем.', highlight: 'lernen' },
      { sentence: 'Ich habe einen Bruder.', translation: 'Ман як бародар дорам.', highlight: 'habe' },
      { sentence: 'Hast du Kinder?', translation: 'Ту фарзанд дорӣ?', highlight: 'Hast' },
    ],
    exercises: [
      { prompt: 'Ich ___ in Duschanbe. (wohnen)', promptTranslated: 'Ман дар Душанбе зиндагӣ мекунам.', answer: 'wohne', options: ['wohne', 'wohnst', 'wohnt', 'wohnen'], explanation: 'ich → -e.' },
      { prompt: 'Du ___ Deutsch. (lernen)', promptTranslated: 'Ту олмониро меомӯзӣ.', answer: 'lernst', options: ['lernst', 'lerne', 'lernt', 'lernen'], explanation: 'du → -st.' },
      { prompt: 'Er ___ das gut. (machen)', promptTranslated: 'Ӯ инро хуб мекунад.', answer: 'macht', options: ['macht', 'mache', 'machst', 'machen'], explanation: 'er → -t.' },
      { prompt: 'Wir ___ zusammen. (lernen)', promptTranslated: 'Мо якҷоя меомӯзем.', answer: 'lernen', options: ['lernen', 'lernt', 'lerne', 'lernst'], explanation: 'wir → -en.' },
      { prompt: 'Ich ___ einen Bruder. (haben)', promptTranslated: 'Ман як бародар дорам.', answer: 'habe', options: ['habe', 'hast', 'hat', 'haben'], explanation: 'ich habe.' },
      { prompt: '___ du Kinder? (haben)', promptTranslated: 'Ту фарзанд дорӣ?', answer: 'Hast', options: ['Hast', 'Habe', 'Hat', 'Haben'], explanation: 'du hast.' },
      { prompt: 'Sie ___ zwei Kinder. (haben, вай)', promptTranslated: 'Вай ду фарзанд дорад.', answer: 'hat', options: ['hat', 'habe', 'hast', 'habt'], explanation: 'sie (вай) → hat.' },
      { prompt: 'Кадом ҷумла ДУРУСТ аст?', promptTranslated: 'Ҷумлаи дурустро интихоб кунед.', answer: 'Ich wohne in Duschanbe.', options: ['Ich wohne in Duschanbe.', 'Wohne in Duschanbe.', 'Ich wohnst in Duschanbe.', 'Ich wohnen in Duschanbe.'], explanation: 'Ҷонишин лозим аст ва барои ich бандаки -e.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Meine Familie', lessonTitleTranslated: 'Оилаи ман',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Meine Familie', titleTranslated: 'Оилаи ман',
    passage: 'Hallo! Ich heiße Lena. Meine Familie ist groß. Mein Vater heißt Karim. Er ist Lehrer. Meine Mutter heißt Anna. Ich habe einen Bruder und eine Schwester.',
    passageTranslated: 'Салом! Номи ман Лена аст. Оилаи ман калон аст. Номи падарам Карим аст. Ӯ муаллим аст. Номи модарам Анна аст. Ман як бародар ва як хоҳар дорам.',
    questions: [
      { question: 'Wie heißt der Vater?', questionTranslated: 'Номи падар чист?', options: ['Karim', 'Anna', 'Lena'], correctIndex: 0, explanation: 'Матн: Mein Vater heißt Karim.' },
      { question: 'Wie viele Geschwister hat Lena?', questionTranslated: 'Лена чанд бародару хоҳар дорад?', options: ['Zwei', 'Eins', 'Drei'], correctIndex: 0, explanation: 'Як бародар ва як хоҳар — ҳамагӣ ду.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Toms Familie', lessonTitleTranslated: 'Шунавоӣ: Оилаи Том',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Toms Familie', titleTranslated: 'Шунавоӣ: Оилаи Том',
    passage: 'Ich heiße Tom. Ich habe keine Geschwister. Meine Eltern sind Lehrer. Meine Großmutter wohnt bei uns. Wir sind vier Personen. Wir wohnen zusammen.',
    passageTranslated: 'Номи ман Том аст. Ман бародару хоҳар надорам. Волидайни ман муаллиманд. Модаркалонам бо мо зиндагӣ мекунад. Мо чор нафарем. Мо якҷоя зиндагӣ мекунем.',
    questions: [
      { question: 'Wie heißt er?', questionTranslated: 'Номи ӯ чист?', options: ['Tom', 'Karim', 'Ali'], correctIndex: 0, explanation: 'Матн: Ich heiße Tom.' },
      { question: 'Hat Tom Geschwister?', questionTranslated: 'Том бародару хоҳар дорад?', options: ['Nein', 'Ja, zwei', 'Ja, eins'], correctIndex: 0, explanation: 'Матн: Ich habe keine Geschwister.' },
      { question: 'Wer wohnt bei ihnen?', questionTranslated: 'Кӣ бо онҳо зиндагӣ мекунад?', options: ['Die Großmutter', 'Der Großvater', 'Der Onkel'], correctIndex: 0, explanation: 'Матн: Meine Großmutter wohnt bei uns.' },
      { question: 'Wie viele Personen sind sie?', questionTranslated: 'Онҳо чанд нафаранд?', options: ['Vier', 'Drei', 'Fünf'], correctIndex: 0, explanation: 'Матн: Wir sind vier Personen.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Wiederholung: die Familie', titleTranslated: 'Такрор: оила',
    passage: 'Wir wiederholen! Der Vater und die Mutter sind die Eltern. Der Bruder und die Schwester sind die Geschwister. Das Kind von meinem Sohn ist mein Enkelkind.',
    passageTranslated: 'Биёед такрор кунем! Падар ва модар — волидайн ҳастанд. Бародар ва хоҳар — бародару хоҳарон ҳастанд. Фарзанди писарам набераи ман аст.',
    questions: [
      { question: 'Wer sind die Eltern?', questionTranslated: 'Волидайн киҳоянд?', options: ['Der Vater und die Mutter', 'Der Bruder und die Schwester', 'Der Onkel und die Tante'], correctIndex: 0, explanation: 'Матн: Der Vater und die Mutter sind die Eltern.' },
      { question: 'Welcher Artikel gehört zu «Kind»?', questionTranslated: '«Kind» кадом артикл дорад?', options: ['das', 'der', 'die'], correctIndex: 0, explanation: 'das Kind — ҷинси миёна.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Die Familie Müller', titleTranslated: 'Оилаи Мюллер',
    passage: 'Das ist die Familie Müller. Der Vater heißt Peter. Die Mutter heißt Eva. Sie haben zwei Kinder: einen Sohn und eine Tochter. Der Sohn heißt Max. Die Tochter heißt Mia. Die Großeltern wohnen zusammen mit ihnen.',
    passageTranslated: 'Ин оилаи Мюллер аст. Номи падар Петер аст. Номи модар Эва аст. Онҳо ду фарзанд доранд: як писар ва як духтар. Номи писар Макс аст. Номи духтар Миа аст. Бобою бибӣ якҷоя бо онҳо зиндагӣ мекунанд.',
    questions: [
      { question: 'Wie heißt der Vater?', questionTranslated: 'Номи падар чист?', options: ['Peter', 'Max', 'Eva'], correctIndex: 0, explanation: 'Матн: Der Vater heißt Peter.' },
      { question: 'Wie heißt die Mutter?', questionTranslated: 'Номи модар чист?', options: ['Eva', 'Mia', 'Anna'], correctIndex: 0, explanation: 'Матн: Die Mutter heißt Eva.' },
      { question: 'Wie viele Kinder haben sie?', questionTranslated: 'Онҳо чанд фарзанд доранд?', options: ['Zwei', 'Eins', 'Drei'], correctIndex: 0, explanation: 'Матн: Sie haben zwei Kinder.' },
      { question: 'Wer ist Max?', questionTranslated: 'Макс кист?', options: ['Der Sohn', 'Der Vater', 'Der Großvater'], correctIndex: 0, explanation: 'Матн: Der Sohn heißt Max.' },
      { question: 'Wer ist Mia?', questionTranslated: 'Миа кист?', options: ['Die Tochter', 'Die Mutter', 'Die Tante'], correctIndex: 0, explanation: 'Матн: Die Tochter heißt Mia.' },
      { question: 'Wer wohnt zusammen mit der Familie?', questionTranslated: 'Кӣ бо оила якҷоя зиндагӣ мекунад?', options: ['Die Großeltern', 'Der Onkel', 'Die Cousine'], correctIndex: 0, explanation: 'Матн: Die Großeltern wohnen zusammen mit ihnen.' },
      { question: 'Welcher Artikel gehört zu «Tochter»?', questionTranslated: '«Tochter» кадом артикл дорад?', options: ['die', 'der', 'das'], correctIndex: 0, explanation: 'die Tochter — занона.' },
      { question: '«Meine Eltern» — was bedeutet das?', questionTranslated: '«Meine Eltern» чӣ маъно дорад?', options: ['волидайни ман', 'бародарони ман', 'фарзандони ман'], correctIndex: 0, explanation: 'die Eltern = волидайн.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Gespräch: über die Familie', lessonTitleTranslated: 'Муколама: дар бораи оила',
  title: 'Gespräch über die Familie', titleTranslated: 'Муколама дар бораи оила',
  scenario: 'Zwei Freunde sprechen über ihre Familien.', emoji: '🗣️',
  lines: [
    { speaker: 'Person A', text: 'Hast du Geschwister?', translation: 'Ту бародару хоҳар дорӣ?' },
    { speaker: 'Person B', text: 'Ja, ich habe einen Bruder.', translation: 'Бале, ман як бародар дорам.' },
    { speaker: 'Person A', text: 'Wie heißt dein Bruder?', translation: 'Номи бародарат чист?' },
    { speaker: 'Person B', text: 'Er heißt Max.', translation: 'Номи ӯ Макс аст.' },
    { speaker: 'Person A', text: 'Ist deine Familie groß?', translation: 'Оилаат калон аст?' },
    { speaker: 'Person B', text: 'Ja, wir sind fünf Personen.', translation: 'Бале, мо панҷ нафарем.' },
    { speaker: 'Person A', text: 'Wohnt ihr zusammen?', translation: 'Шумо якҷоя зиндагӣ мекунед?' },
    { speaker: 'Person B', text: 'Ja, mit meinen Großeltern.', translation: 'Бале, бо бобою бибиям.' },
  ],
};

export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['die Familie', 'der Vater', 'die Mutter', 'das Kind', 'der Bruder', 'die Schwester', 'die Eltern', 'zusammen'],
};

export const ORDER = [
  'vocab:Die Familie',
  'vocab:Bruder und Schwester',
  'vocab:Großeltern',
  'vocab:Verwandte',
  'vocab:Personalpronomen',
  'vocab:Familie beschreiben',
  'vocab:Über die Familie sprechen',
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
