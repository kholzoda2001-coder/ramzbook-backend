// Мазмуни Модули 1-и олмонӣ (A1) — «Begrüßung und einfache Kommunikation».
//
// Сохтор АЙНАН аз модули 1-и англисӣ гирифта шудааст («Hello and Basic
// Communication»): 6-7 дарси луғат → 2 дарси грамматика → хониш → шунавоӣ →
// муколама → навиштан → такрор → имтиҳон.
//
// Танҳо МАЪЛУМОТ — мантиқи сохтан дар `_de-m1-build.mjs`.
//
// `existing: true` = ин калима аллакай дар курс ҳаст (аудио ва хониши тоҷикиро
// дорад); скрипт онро танҳо ба дарси нав мекӯчонад, аз нав намесозад.

export const MODULE = {
  order: 0,
  title: 'Begrüßung und einfache Kommunikation',
  titleTranslated: 'Саломпурсӣ ва муоширати ибтидоӣ',
  emoji: '👋',
};

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
export const VOCAB = [
  {
    title: 'Begrüßung', titleTranslated: 'Салом ва хайрбод', emoji: '👋',
    words: [
      { word: 'Hallo', existing: true },
      { word: 'Willkommen', existing: true },
      { word: 'Auf Wiedersehen', existing: true },
      { word: 'Tschüss', existing: true },
      { word: 'Ja', existing: true },
      { word: 'Nein', existing: true },
    ],
  },
  {
    title: 'Höfliche Wörter', titleTranslated: 'Муомилаи хуб', emoji: '🙏',
    words: [
      { word: 'Bitte', existing: true },
      { word: 'Danke', existing: true },
      { word: 'Entschuldigung', existing: true },
      { word: 'Gern geschehen', translation: 'Хоҳиш мекунам', emoji: '😊',
        ipa: '/ɡɛʁn ɡəˈʃeːən/',
        example: 'Danke! — Gern geschehen.', exampleTrans: 'Ташаккур! — Хоҳиш мекунам.' },
      { word: 'Alles klar', translation: 'Хуб / Майлаш', emoji: '👌',
        ipa: '/ˈaləs klaːɐ̯/',
        example: 'Alles klar, bis morgen!', exampleTrans: 'Хуб, то фардо!' },
    ],
  },
  {
    title: 'Sich vorstellen', titleTranslated: 'Муаррифӣ', emoji: '🤝',
    words: [
      { word: 'ich bin', translation: 'ман … ҳастам', emoji: '👤', ipa: '/ɪç bɪn/',
        example: 'Ich bin Ali.', exampleTrans: 'Ман Алӣ ҳастам.' },
      { word: 'mein', translation: 'ман (аз они ман)', emoji: '🫱', ipa: '/maɪ̯n/',
        example: 'Das ist mein Buch.', exampleTrans: 'Ин китоби ман аст.' },
      { word: 'der Name', translation: 'ном', emoji: '📛', ipa: '/deːɐ̯ ˈnaːmə/',
        example: 'Mein Name ist Karim.', exampleTrans: 'Номи ман Карим аст.' },
      { word: 'ist', translation: 'аст', emoji: '🟰', ipa: '/ɪst/',
        example: 'Das ist ein Buch.', exampleTrans: 'Ин китоб аст.' },
      { word: 'Freut mich', translation: 'Аз шиносоӣ шодам', emoji: '😊', ipa: '/fʁɔʏ̯t mɪç/',
        example: 'Freut mich, Herr Müller!', exampleTrans: 'Аз шиносоӣ шодам, ҷаноби Мюллер!' },
    ],
  },
  {
    title: 'Nach dem Namen fragen', titleTranslated: 'Пурсидани ном', emoji: '❓',
    words: [
      { word: 'Wie heißt du', translation: 'Номи ту чист?', emoji: '❓', ipa: '/viː haɪ̯st duː/',
        example: 'Hallo! Wie heißt du?', exampleTrans: 'Салом! Номи ту чист?' },
      { word: 'Wie heißen Sie', translation: 'Номи Шумо чист? (расмӣ)', emoji: '🎩', ipa: '/viː ˈhaɪ̯sən ziː/',
        example: 'Guten Tag! Wie heißen Sie?', exampleTrans: 'Рӯзи нек! Номи Шумо чист?' },
      { word: 'Ich heiße', translation: 'номи ман … аст', emoji: '📛', ipa: '/ɪç ˈhaɪ̯sə/',
        example: 'Ich heiße Sara.', exampleTrans: 'Номи ман Сара аст.' },
      { word: 'dein', translation: 'ту (аз они ту)', emoji: '👉', ipa: '/daɪ̯n/',
        example: 'Wie ist dein Name?', exampleTrans: 'Номи ту чист?' },
      { word: 'Wer ist das', translation: 'Ин кист?', emoji: '❔', ipa: '/veːɐ̯ ɪst das/',
        example: 'Wer ist das? Das ist mein Freund.', exampleTrans: 'Ин кист? Ин дӯсти ман аст.' },
    ],
  },
  {
    title: 'Menschen', titleTranslated: 'Одамон', emoji: '👨‍👩‍👦',
    words: [
      { word: 'der Mann', translation: 'мард', emoji: '👨', ipa: '/deːɐ̯ man/',
        example: 'Der Mann ist Lehrer.', exampleTrans: 'Он мард муаллим аст.' },
      { word: 'die Frau', translation: 'зан', emoji: '👩', ipa: '/diː fʁaʊ̯/',
        example: 'Die Frau ist Ärztin.', exampleTrans: 'Он зан духтур аст.' },
      { word: 'der Freund', translation: 'дӯст', emoji: '🤝', ipa: '/deːɐ̯ fʁɔʏ̯nt/',
        example: 'Er ist mein Freund.', exampleTrans: 'Ӯ дӯсти ман аст.' },
      { word: 'der Junge', translation: 'писарбача', emoji: '👦', ipa: '/deːɐ̯ ˈjʊŋə/',
        example: 'Der Junge ist klein.', exampleTrans: 'Писарбача хурд аст.' },
      { word: 'das Mädchen', translation: 'духтарбача', emoji: '👧', ipa: '/das ˈmɛːtçən/',
        example: 'Das Mädchen heißt Lena.', exampleTrans: 'Номи духтарбача Лена аст.' },
    ],
  },
  {
    title: 'Tageszeiten', titleTranslated: 'Вақтҳои рӯз', emoji: '🕐',
    words: [
      { word: 'Guten Morgen', existing: true },
      { word: 'Guten Tag', existing: true },
      { word: 'Guten Abend', existing: true },
      { word: 'Gute Nacht', existing: true },
    ],
  },
  {
    title: 'Wie geht es dir?', titleTranslated: 'Чӣ ҳол доред?', emoji: '🙂',
    words: [
      { word: 'Wie geht es dir', existing: true },
      { word: 'Wie geht es Ihnen', existing: true },
      { word: 'Gut, danke', existing: true },
      { word: 'Sehr gut', translation: 'Хеле хуб', emoji: '⭐', ipa: '/zeːɐ̯ ɡuːt/',
        example: 'Mir geht es sehr gut.', exampleTrans: 'Ҳоли ман хеле хуб аст.' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
// Шарҳ markdown қабул мекунад (варақаи грамматика онро рендер мекунад) —
// фарқ аз қоидаҳои алифбо, ки матни оддӣ доранд.
export const GRAMMAR = [
  {
    lessonTitle: 'Grammatik: das Verb sein', lessonTitleTranslated: 'Грамматика: феъли sein',
    title: 'Das Verb sein (bin / bist / ist)', titleTranslated: 'Феъли sein (bin / bist / ist)',
    emoji: '🔗',
    explanation:
`Дар тоҷикӣ мегӯем «ман ҳастам», «ту ҳастӣ», «ӯ аст». Дар олмонӣ ба ҷои инҳо феъли **sein** меояд. Ӯ барои ҳар шахс шакли худро дорад:

- **ich** (ман) → **bin**
- **du** (ту) → **bist**
- **er / sie / es** (ӯ / он) → **ist**
- **wir** (мо) → **sind**
- **ihr** (шумо — ба чанд нафари шинос) → **seid**
- **sie / Sie** (онҳо / Шумо-и расмӣ) → **sind**

**er, sie, es чӣ фарқ доранд?** Дар тоҷикӣ ҳамааш «ӯ/он» аст, вале олмонӣ фарқ мекунад:

- **er** = ӯ — барои мард ва исмҳои **der**: der Mann → **er**
- **sie** = ӯ — барои зан ва исмҳои **die**: die Frau → **sie**
- **es** = он — барои исмҳои **das**: das Kind → **es**

Дар олмонӣ sein ҲАТМИСТ: мегӯем «**Ich bin** Ali», на «Ich Ali».

Инкор бо **nicht**: Ich bin **nicht** müde. (Ман монда нестам.)`,
    rules: [
      { pattern: 'ich + bin', note: 'Бо ich ҳамеша bin: Ich bin Ali.' },
      { pattern: 'du + bist', note: 'Бо du ҳамеша bist: Du bist mein Freund.' },
      { pattern: 'er / sie / es → ist', note: 'er = мард, sie = зан, es = ашё ё кӯдак. Ҳар сеаш бо ist.' },
      { pattern: 'wir / sie / Sie → sind,  ihr → seid', note: 'Барои ҷамъ sind; танҳо ihr шакли алоҳидаи seid дорад.' },
    ],
    examples: [
      { sentence: 'Ich bin Ali.', translation: 'Ман Алӣ ҳастам.', highlight: 'bin' },
      { sentence: 'Du bist mein Freund.', translation: 'Ту дӯсти ман ҳастӣ.', highlight: 'bist' },
      { sentence: 'Er ist Lehrer.', translation: 'Ӯ муаллим аст.', highlight: 'ist' },
      { sentence: 'Sie ist meine Mutter.', translation: 'Ӯ модари ман аст.', highlight: 'ist' },
      { sentence: 'Wir sind Studenten.', translation: 'Мо донишҷӯ ҳастем.', highlight: 'sind' },
      { sentence: 'Ich bin nicht müde.', translation: 'Ман монда нестам.', highlight: 'nicht' },
    ],
    exercises: [
      { prompt: 'Ich ___ Ali.', promptTranslated: 'Ман Алӣ ҳастам.', answer: 'bin', options: ['bin', 'bist', 'ist', 'sind'], explanation: 'Бо ich → bin.' },
      { prompt: 'Du ___ mein Freund.', promptTranslated: 'Ту дӯсти ман ҳастӣ.', answer: 'bist', options: ['bin', 'bist', 'ist', 'seid'], explanation: 'Бо du → bist.' },
      { prompt: 'Er ___ Lehrer.', promptTranslated: 'Ӯ муаллим аст.', answer: 'ist', options: ['bin', 'bist', 'ist', 'sind'], explanation: 'Бо er → ist.' },
      { prompt: 'Sie ___ meine Mutter.', promptTranslated: 'Ӯ модари ман аст.', answer: 'ist', options: ['ist', 'bin', 'sind', 'bist'], explanation: 'sie (як зан) → ist.' },
      { prompt: 'Wir ___ Studenten.', promptTranslated: 'Мо донишҷӯ ҳастем.', answer: 'sind', options: ['bin', 'ist', 'sind', 'seid'], explanation: 'Бо wir → sind.' },
      { prompt: 'Ihr ___ meine Freunde.', promptTranslated: 'Шумо дӯстони ман ҳастед.', answer: 'seid', options: ['seid', 'sind', 'bist', 'ist'], explanation: 'Бо ihr → seid.' },
      { prompt: 'Das ___ mein Buch.', promptTranslated: 'Ин китоби ман аст.', answer: 'ist', options: ['ist', 'bin', 'bist', 'sind'], explanation: 'das → ist.' },
      { prompt: 'Ich ___ nicht müde.', promptTranslated: 'Ман монда нестам.', answer: 'bin', options: ['bin', 'ist', 'bist', 'sind'], explanation: 'Инкор ҳам бо ҳамон шакл: ich → bin nicht.' },
    ],
  },
  {
    lessonTitle: 'Grammatik: Personalpronomen', lessonTitleTranslated: 'Грамматика: ҷонишинҳои шахсӣ',
    title: 'Personalpronomen', titleTranslated: 'Ҷонишинҳои шахсӣ',
    emoji: '👥',
    explanation:
`Ҷонишини шахсӣ ба ҷои ном меистад: ба ҷои «Ali» мегӯем «er».

- **ich** = ман
- **du** = ту (ба дӯст, ба кӯдак)
- **er** = ӯ (мард)
- **sie** = ӯ (зан)
- **es** = он (кӯдак ва исмҳои **das**)
- **wir** = мо
- **ihr** = шумо (ба чанд нафари шинос)
- **sie** = онҳо
- **Sie** = Шумо (расмӣ, ҲАМЕША бо ҳарфи калон)

**du ё Sie?** Ба дӯст, ҳамсол ва кӯдак — **du**. Ба шахси нотанишо, ба калонсол, дар кор — **Sie**. Дар олмонӣ ин фарқ хеле муҳим аст: «du» ба ҷои «Sie» бетарбиятӣ ҳисоб мешавад.

**sie ё Sie?** Танҳо ҳарфи калон онҳоро фарқ мекунад: **sie** = ӯ/онҳо, **Sie** = Шумо-и расмӣ.`,
    rules: [
      { pattern: 'ich, du, er, sie, es', note: 'Ҷонишинҳои шахси танҳо.' },
      { pattern: 'wir, ihr, sie / Sie', note: 'wir = мо, ihr = шумо (ғайрирасмӣ), sie = онҳо, Sie = Шумо (расмӣ).' },
      { pattern: 'du ↔ Sie', note: 'du ба дӯст ва кӯдак; Sie ба шахси нотанишо, калонсол ва дар кор.' },
    ],
    examples: [
      { sentence: 'Ich bin Student.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'Ich' },
      { sentence: 'Du bist nett.', translation: 'Ту меҳрубон ҳастӣ.', highlight: 'Du' },
      { sentence: 'Er heißt Karim.', translation: 'Номи ӯ Карим аст.', highlight: 'Er' },
      { sentence: 'Wir sind Freunde.', translation: 'Мо дӯст ҳастем.', highlight: 'Wir' },
      { sentence: 'Wie heißen Sie?', translation: 'Номи Шумо чист?', highlight: 'Sie' },
    ],
    exercises: [
      { prompt: '___ bin Lehrer.', promptTranslated: 'Ман муаллим ҳастам.', answer: 'Ich', options: ['Ich', 'Du', 'Er', 'Wir'], explanation: 'Бо bin танҳо ich меояд.' },
      { prompt: '___ bist mein Freund.', promptTranslated: 'Ту дӯсти ман ҳастӣ.', answer: 'Du', options: ['Du', 'Ich', 'Sie', 'Ihr'], explanation: 'Бо bist танҳо du меояд.' },
      { prompt: 'Das ist Karim. ___ ist mein Bruder.', promptTranslated: 'Ин Карим аст. Ӯ бародари ман аст.', answer: 'Er', options: ['Er', 'Sie', 'Es', 'Ihr'], explanation: 'Карим мард аст → er.' },
      { prompt: 'Das ist Anna. ___ ist meine Schwester.', promptTranslated: 'Ин Анна аст. Ӯ хоҳари ман аст.', answer: 'Sie', options: ['Sie', 'Er', 'Es', 'Wir'], explanation: 'Анна зан аст → sie.' },
      { prompt: '___ sind Studenten.', promptTranslated: 'Мо донишҷӯ ҳастем.', answer: 'Wir', options: ['Wir', 'Ich', 'Du', 'Er'], explanation: 'Бо sind ва маънои «мо» → wir.' },
      { prompt: 'Das Kind ist klein. ___ heißt Lena.', promptTranslated: 'Кӯдак хурд аст. Номи ӯ Лена аст.', answer: 'Es', options: ['Es', 'Er', 'Sie', 'Wir'], explanation: '«das Kind» исми das аст → es.' },
      { prompt: '___ seid meine Freunde.', promptTranslated: 'Шумо дӯстони ман ҳастед.', answer: 'Ihr', options: ['Ihr', 'Wir', 'Sie', 'Du'], explanation: 'Бо seid танҳо ihr меояд.' },
      { prompt: 'Zum Lehrer sagt man: Wie heißen ___?', promptTranslated: 'Ба муаллим чӣ мегӯем: Номи Шумо чист?', answer: 'Sie', options: ['Sie', 'du', 'ihr', 'es'], explanation: 'Ба шахси калонсол ва нотанишо — Sie бо ҳарфи калон.' },
    ],
  },
];

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Begrüßungen bauen', lessonTitleTranslated: 'Сохтани ҷумлаҳои шиносоӣ',
    skillType: 'reading', xpReward: 20,
    kind: 'reading', emoji: '📖',
    title: 'Begrüßungen bauen', titleTranslated: 'Сохтани ҷумлаҳои шиносоӣ',
    passage: 'Hallo! Ich heiße Ali. Ich bin Student. Das ist mein Freund. Er heißt Karim. Er ist Lehrer. Guten Morgen, Karim!',
    passageTranslated: 'Салом! Номи ман Алӣ аст. Ман донишҷӯ ҳастам. Ин дӯсти ман аст. Номи ӯ Карим аст. Ӯ муаллим аст. Субҳ ба хайр, Карим!',
    questions: [
      { question: 'Wie heißt sein Freund?', questionTranslated: 'Номи дӯсти ӯ чист?', options: ['Karim', 'Umar', 'Ali'], correctIndex: 0, explanation: 'Матн: Er heißt Karim.' },
      { question: 'Wer ist Karim?', questionTranslated: 'Карим кист?', options: ['Student', 'Lehrer', 'Arzt'], correctIndex: 1, explanation: 'Матн: Er ist Lehrer.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Hören: Menschen treffen', lessonTitleTranslated: 'Шунавоӣ: Шиносоӣ',
    skillType: 'listening', xpReward: 20,
    kind: 'listening', emoji: '👂',
    title: 'Hören: Menschen treffen', titleTranslated: 'Шунавоӣ: Шиносоӣ',
    passage: 'Hallo! Ich heiße Anna. Ich bin Lehrerin. Guten Morgen! Das ist mein Freund Tom. Er ist Student. Freut mich. Auf Wiedersehen!',
    passageTranslated: 'Салом! Номи ман Анна аст. Ман муаллима ҳастам. Субҳ ба хайр! Ин дӯсти ман Том аст. Ӯ донишҷӯ аст. Аз шиносоӣ шодам. То дидор!',
    questions: [
      { question: 'Wie heißt sie?', questionTranslated: 'Номи ӯ чист?', options: ['Anna', 'Tom', 'Sara'], correctIndex: 0, explanation: 'Матн: Ich heiße Anna.' },
      { question: 'Was ist Anna von Beruf?', questionTranslated: 'Анна аз рӯи касб кӣ аст?', options: ['Lehrerin', 'Studentin', 'Ärztin'], correctIndex: 0, explanation: 'Матн: Ich bin Lehrerin.' },
      { question: 'Wer ist Tom?', questionTranslated: 'Том кист?', options: ['Ihr Freund', 'Ihr Bruder', 'Ihr Vater'], correctIndex: 0, explanation: 'Матн: Das ist mein Freund Tom.' },
      { question: 'Was sagt sie am Ende?', questionTranslated: 'Дар охир чӣ мегӯяд?', options: ['Auf Wiedersehen', 'Guten Tag', 'Danke'], correctIndex: 0, explanation: 'Матн бо «Auf Wiedersehen!» тамом мешавад.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: 'Wiederholung', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Begrüßung und Vorstellung', titleTranslated: 'Салом ва шиносоӣ',
    passage: 'Wir wiederholen! Guten Morgen! Ich heiße Ali. Ich bin Student. Das ist mein Freund Karim. Er ist Lehrer. Danke und auf Wiedersehen!',
    passageTranslated: 'Биёед такрор кунем! Субҳ ба хайр! Номи ман Алӣ аст. Ман донишҷӯ ҳастам. Ин дӯсти ман Карим аст. Ӯ муаллим аст. Ташаккур ва то дидор!',
    questions: [
      { question: 'Wer ist Karim?', questionTranslated: 'Карим кист?', options: ['Lehrer', 'Arzt', 'Student'], correctIndex: 0, explanation: 'Матн: Er ist Lehrer.' },
      { question: 'Was sagt Ali am Ende?', questionTranslated: 'Алӣ дар охир чӣ мегӯяд?', options: ['Danke und auf Wiedersehen', 'Guten Abend', 'Wie geht es dir'], correctIndex: 0, explanation: 'Матн бо «Danke und auf Wiedersehen!» тамом мешавад.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: 'Abschlussprüfung', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🏆',
    title: 'Ali und seine Freundin', titleTranslated: 'Алӣ ва дӯсти ӯ',
    passage: 'Hallo! Ich heiße Ali. Ich bin ein Junge. Das ist meine Freundin Sara. Sie ist ein Mädchen. Guten Morgen, Herr Lehrer!',
    passageTranslated: 'Салом! Номи ман Алӣ аст. Ман писарбача ҳастам. Ин дӯсти ман Сара аст. Ӯ духтарбача аст. Субҳ ба хайр, ҷаноби муаллим!',
    questions: [
      { question: 'Wie heißt der Junge?', questionTranslated: 'Номи писарбача чист?', options: ['Ali', 'Karim', 'Sara'], correctIndex: 0, explanation: 'Матн: Ich heiße Ali.' },
      { question: 'Wie heißt das Mädchen?', questionTranslated: 'Номи духтарбача чист?', options: ['Sara', 'Anna', 'Lena'], correctIndex: 0, explanation: 'Матн: meine Freundin Sara.' },
      { question: 'Ist Ali ein Junge oder ein Mädchen?', questionTranslated: 'Алӣ писарбача аст ё духтарбача?', options: ['Ein Junge', 'Ein Mädchen', 'Ein Mann'], correctIndex: 0, explanation: 'Матн: Ich bin ein Junge.' },
      { question: 'Wer ist Sara?', questionTranslated: 'Сара кист?', options: ['Seine Freundin', 'Seine Mutter', 'Seine Schwester'], correctIndex: 0, explanation: 'Матн: meine Freundin Sara.' },
      { question: 'Was sagt Ali am Anfang?', questionTranslated: 'Алӣ дар аввал чӣ мегӯяд?', options: ['Hallo', 'Tschüss', 'Danke'], correctIndex: 0, explanation: 'Матн бо «Hallo!» сар мешавад.' },
      { question: 'Was sagt Ali zum Lehrer?', questionTranslated: 'Алӣ ба муаллим чӣ мегӯяд?', options: ['Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen'], correctIndex: 0, explanation: 'Матн: Guten Morgen, Herr Lehrer!' },
      { question: '«Mädchen» — was bedeutet das?', questionTranslated: '«Mädchen» чӣ маъно дорад?', options: ['духтарбача', 'писарбача', 'зан'], correctIndex: 0, explanation: 'das Mädchen = духтарбача.' },
      { question: '«Ich heiße …» — was bedeutet das?', questionTranslated: '«Ich heiße …» чӣ маъно дорад?', options: ['номи ман … аст', 'ман … дорам', 'ман … мебинам'], correctIndex: 0, explanation: 'Ich heiße Ali = Номи ман Алӣ аст.' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
export const DIALOGUE = {
  lessonTitle: 'Gespräch üben', lessonTitleTranslated: 'Муколама ва амалия',
  title: 'Gespräch üben', titleTranslated: 'Муколама ва амалия',
  scenario: 'Einfache Begrüßung und Vorstellung.', emoji: '🗣️',
  lines: [
    { speaker: 'Person A', text: 'Hallo.', translation: 'Салом.' },
    { speaker: 'Person B', text: 'Hallo.', translation: 'Салом.' },
    { speaker: 'Person A', text: 'Wie geht es dir?', translation: 'Чӣ ҳол дорӣ?' },
    { speaker: 'Person B', text: 'Gut, danke.', translation: 'Хуб, ташаккур.' },
    { speaker: 'Person A', text: 'Wie heißt du?', translation: 'Номи ту чист?' },
    { speaker: 'Person B', text: 'Ich heiße Ali.', translation: 'Номи ман Алӣ аст.' },
    { speaker: 'Person A', text: 'Freut mich.', translation: 'Аз шиносоӣ шодам.' },
    { speaker: 'Person B', text: 'Freut mich auch.', translation: 'Ман ҳам аз шиносоӣ шодам.' },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
// Мисли англисӣ, ин дарс калимаҳои ҲАМИН модулро такрор мекунад — такрори
// қасдан, на хато. Барои ҳамин калимаҳо нусхаи алоҳида мегиранд.
export const WRITING = {
  title: 'Schreiben üben', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['Hallo', 'Ja', 'Bitte', 'Danke', 'ist', 'der Name', 'der Mann', 'Ich heiße'],
};

// Тартиби дарсҳо дар модул — айнан мисли англисӣ.
export const ORDER = [
  'vocab:Begrüßung',
  'vocab:Höfliche Wörter',
  'vocab:Sich vorstellen',
  'vocab:Nach dem Namen fragen',
  'vocab:Menschen',
  'vocab:Tageszeiten',
  'vocab:Wie geht es dir?',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
