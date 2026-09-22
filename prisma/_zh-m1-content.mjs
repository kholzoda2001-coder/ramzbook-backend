export const MODULE = {
  order: 0,
  title: 'Tanışma (Greetings)',
  titleTranslated: 'Саломпурсӣ',
  emoji: '👋',
};

export const VOCAB = [
  {
    title: 'Temel Kelimeler', titleTranslated: 'Калимаҳои асосӣ', emoji: '👋',
    words: [
      { word: '你好', translation: 'Салом', emoji: '👋', ipa: '/nǐ hǎo/' },
      { word: '谢谢', translation: 'Раҳмат (Ташаккур)', emoji: '🙏', ipa: '/xiè xiè/' },
      { word: '再见', translation: 'Хайр (То дидор)', emoji: '👋', ipa: '/zài jiàn/' },
      { word: '对不起', translation: 'Узр мехоҳам', emoji: '😔', ipa: '/duì bu qǐ/' },
      { word: '没关系', translation: 'Ҳеҷ гап не', emoji: '👍', ipa: '/méi guān xi/' },
    ],
  },
  {
    title: 'Şahıs Zamirleri', titleTranslated: 'Ҷонишинҳои шахсӣ', emoji: '🧑',
    words: [
      { word: '我', translation: 'Ман', emoji: '🙋', ipa: '/wǒ/' },
      { word: '你', translation: 'Ту', emoji: '👉', ipa: '/nǐ/' },
      { word: '他', translation: 'Вай (барои мард)', emoji: '👨', ipa: '/tā/' },
      { word: '她', translation: 'Вай (барои зан)', emoji: '👩', ipa: '/tā/' },
      { word: '们', translation: 'Пасванди ҷамъ (Мо, Шумо...)', emoji: '👥', ipa: '/men/' },
    ],
  },
  {
    title: 'Tanışma', titleTranslated: 'Шиносоӣ', emoji: '🤝',
    words: [
      { word: '叫', translation: 'Ном доштан', emoji: '🗣️', ipa: '/jiào/' },
      { word: '什么', translation: 'Чӣ', emoji: '❓', ipa: '/shén me/' },
      { word: '名字', translation: 'Ном', emoji: '📛', ipa: '/míng zi/' },
      { word: '好', translation: 'Хуб', emoji: '👍', ipa: '/hǎo/' },
      { word: '很', translation: 'Хеле / Бисёр', emoji: '⭐', ipa: '/hěn/' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Cümle Yapısı (Şahıslar)', lessonTitleTranslated: 'Сохтори ҷумла (Шахсҳо)',
    skillType: 'grammar', xpReward: 20, emoji: '👤',
    title: 'Şahıs Zamirleri', titleTranslated: 'Ҷонишинҳои шахсӣ',
    explanation:
`Дар забони хитоӣ ҷонишинҳои шахсӣ хеле соддаанд ва ҳеҷ гоҳ тағйир намеёбанд:
- **我 (Wǒ)** - Ман
- **你 (Nǐ)** - Ту
- **他 (Tā)** - Вай (мард)
- **她 (Tā)** - Вай (зан)

Барои сохтани шакли ҷамъ (Мо, Шумо, Онҳо) танҳо пасванди **们 (men)**-ро илова мекунем:
- 我 + 们 = **我们 (Wǒmen)** (Мо)
- 你 + 们 = **你们 (Nǐmen)** (Шумо)
- 他 + 们 = **他们 (Tāmen)** (Онҳо - мардҳо)
- 她 + 们 = **她们 (Tāmen)** (Онҳо - занҳо)

**Калимаи Салом (你好):**
Дар хитоӣ "Салом" аз ду қисм иборат аст:
你 (Ту) + 好 (Хуб) = 你好 (Nǐ hǎo). Маънои аслиаш "Ту хуб ҳастӣ?" аст.`,
    rules: [
      { pattern: 'Zamir + 们 (men)', note: 'Wǒmen (Мо), Nǐmen (Шумо)' },
      { pattern: '你 + 好', note: 'Nǐ hǎo (Салом)' },
    ],
    examples: [
      { sentence: '你好！', translation: 'Салом!', highlight: '你好' },
      { sentence: '我们很好。', translation: 'Мо хеле хуб ҳастем.', highlight: '我们' },
      { sentence: '你们好！', translation: 'Салом ба ҳамаатон (Шумоён)!', highlight: '你们' },
    ],
    exercises: [
      { prompt: '___好！ (Салом!)', promptTranslated: '___好！ (Салом!)', answer: '你', options: ['你', '我', '他'], explanation: 'Салом = 你好 (Nǐ hǎo).' },
      { prompt: '___们很好。 (Мо хеле хуб ҳастем.)', promptTranslated: '___们很好。 (Мо хеле хуб ҳастем.)', answer: '我', options: ['我', '你', '他'], explanation: 'Мо = 我们 (Wǒmen).' },
      { prompt: '___好！ (Салом ба шумоён!)', promptTranslated: '___好！ (Салом ба шумоён!)', answer: '你们', options: ['你们', '我们', '他们'], explanation: 'Шумоён = 你们 (Nǐmen).' },
    ],
  },
  {
    lessonTitle: 'İsim Sorma', lessonTitleTranslated: 'Пурсидани ном',
    skillType: 'grammar', xpReward: 20, emoji: '📛',
    title: 'Senin adın ne?', titleTranslated: 'Номи ту чист?',
    explanation:
`Дар забони хитоӣ барои гуфтани номи худ феъли **叫 (jiào)** истифода мешавад, ки маънояш "Ном доштан" ё "Фарёд кардан" аст.

Барои гуфтани ном:
- **我叫... (Wǒ jiào...)** - Номи ман... аст.
Масалан: 我叫 Ali. (Номи ман Алӣ аст.)

Барои пурсидани ном аз калимаҳои **什么 (shénme - чӣ)** ва **名字 (míngzi - ном)** истифода мебарем.
Сохтори ҷумла: Ту + Ном доштан + Чӣ + Ном?
- **你叫什么名字？ (Nǐ jiào shénme míngzi?)** - Номи ту чист?`,
    rules: [
      { pattern: '我 + 叫 + Исм', note: 'Wǒ jiào Ali (Номи ман Алӣ аст)' },
      { pattern: '你叫什么名字？', note: 'Nǐ jiào shénme míngzi? (Номи ту чист?)' },
    ],
    examples: [
      { sentence: '你叫什么名字？', translation: 'Номи ту чист?', highlight: '什么名字' },
      { sentence: '我叫 Anisa。', translation: 'Номи ман Аниса аст.', highlight: '我叫' },
      { sentence: '他叫 Timur。', translation: 'Номи вай Тимур аст.', highlight: '他叫' },
    ],
    exercises: [
      { prompt: '___叫 Ali。 (Номи ман Алӣ аст.)', promptTranslated: '___叫 Ali。 (Номи ман Алӣ аст.)', answer: '我', options: ['我', '你', '他'], explanation: 'Ман = 我 (Wǒ).' },
      { prompt: '你叫___名字？ (Номи ту чист?)', promptTranslated: '你叫___名字？ (Номи ту чист?)', answer: '什么', options: ['什么', '好', '很'], explanation: 'Чӣ = 什么 (shénme).' },
      { prompt: '她___ Amina。 (Номи вай Амина аст.)', promptTranslated: '她___ Amina。 (Номи вай Амина аст.)', answer: '叫', options: ['叫', '好', '名字'], explanation: 'Ном доштан = 叫 (jiào).' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Okuma: Merhaba', lessonTitleTranslated: 'Хондан: Салом',
    skillType: 'reading', xpReward: 30,
    kind: 'reading', emoji: '📖',
    title: 'Kendini Tanıtma', titleTranslated: 'Муаррифии худ',
    passage: '你好！我叫 Ali。你叫什么名字？他叫 Timur。我们很好。谢谢！',
    passageTranslated: 'Салом! Номи ман Алӣ аст. Номи ту чист? Номи вай Тимур аст. Мо хеле хуб ҳастем. Раҳмат!',
    questions: [
      { question: 'Ali\'nin arkadaşının adı ne?', questionTranslated: 'Номи дӯсти Алӣ чист?', options: ['Timur', 'Ali', 'Bilinmiyor'], correctIndex: 0, explanation: 'Дар матн: 他叫 Timur (Номи вай Тимур аст).' },
      { question: 'Onlar nasıllar?', questionTranslated: 'Ҳоли онҳо чӣ гуна аст?', options: ['Çok iyiler', 'Kötüler', 'Hastalar'], correctIndex: 0, explanation: 'Дар матн: 我们很好 (Мо хеле хуб ҳастем).' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: 'Dinleme: Selam', lessonTitleTranslated: 'Гӯшкунӣ: Салом',
    skillType: 'listening', xpReward: 30,
    kind: 'audio', emoji: '🎧',
    title: 'Teşekkür ve Özür', titleTranslated: 'Ташаккур ва Узр',
    passage: '对不起！没关系。谢谢！不客气。再见！',
    passageTranslated: 'Узр мехоҳам! Ҳеҷ гап не. Раҳмат! Намеарзад (Хуш омадед). Хайр!',
    questions: [
      { question: 'Kişi neden özür diliyor?', questionTranslated: 'Аввал кадом калима гуфта мешавад?', options: ['对不起 (Узр мехоҳам)', '谢谢 (Раҳмат)', '再见 (Хайр)'], correctIndex: 0, explanation: 'Дар матн аввал: 对不起.' },
      { question: 'Teşekkür edene ne cevap verilir?', questionTranslated: 'Ба калимаи "Узр мехоҳам" чӣ ҷавоб дода мешавад?', options: ['没关系 (Ҳеҷ гап не)', '再见 (Хайр)', '你好 (Салом)'], correctIndex: 0, explanation: 'Дар матн ба "对不起" ҷавоб "没关系" дода шудааст.' },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Konuşma Pratiği', lessonTitleTranslated: 'Машқи гуфтугӯ',
  title: 'Tanışma', titleTranslated: 'Шиносоӣ',
  scenario: 'İki kişi ilk defa karşılaşıyor.', emoji: '🗣️',
  lines: [
    { speaker: 'Ali', text: '你好！', translation: 'Салом!' },
    { speaker: 'Anisa', text: '你好！', translation: 'Салом!' },
    { speaker: 'Ali', text: '你叫什么名字？', translation: 'Номи ту чист?' },
    { speaker: 'Anisa', text: '我叫 Anisa。你叫什么名字？', translation: 'Номи ман Аниса. Номи ту чист?' },
    { speaker: 'Ali', text: '我叫 Ali。再见！', translation: 'Номи ман Алӣ. Хайр!' },
    { speaker: 'Anisa', text: '再见！', translation: 'Хайр!' },
  ],
};

export const WRITING = {
  title: 'Yazma Pratiği', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['你好', '我', '叫', '名字', '谢谢', '再见'],
};

export const ORDER = [
  'vocab:Temel Kelimeler',
  'vocab:Şahıs Zamirleri',
  'vocab:Tanışma',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
];
