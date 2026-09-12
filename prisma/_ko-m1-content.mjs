// TOPIK I · 1급 · Модули 1 — «인사와 소개» (Салом ва шиносоӣ).
//
// Сохтор АЙНАН мисли модули 1-и англисӣ/олмонӣ/арабӣ: 7 дарси луғат →
// 2 грамматика → хониш → шунавоӣ → муколама → навиштан → такрор → имтиҳон.
// Меъёри расмии 1급: худшиносонӣ, салом, муомилаи хуб (NIIED).
//
// Танҳо МАЪЛУМОТ — сохтан: `_ko-module-build.mjs`. Хониши тоҷикӣ (`ipaTajik`)
// аз `_ko-tajik.mjs` худкор мебарояд — ин ҷо навишта НАМЕШАВАД, то ҳама ҷо
// якхела бошад. `pos` = ҳиссаи нутқ (барнома расмро танҳо ба исм нишон медиҳад).
//
// Грамматикаи модул танҳо шакли расмии 입니다 аст; 이에요/예요 дар Модули 2.
// Ибораҳои тайёр («이름이 뭐예요?») ҳамчун ибора омӯхта мешаванд.

export const MODULE = {
  order: 0,
  title: '인사와 소개',
  titleTranslated: 'Салом ва шиносоӣ',
  emoji: '👋',
  canDoStatement: 'Пас аз ин бахш салом дода, худро муаррифӣ карда ва номи касро пурсида метавонед.',
};

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
// Санҷиши `_ko-coverage.mjs` (2026-09-11): ҳар ҷумла танҳо аз калимаҳои ҲАМИН модул ва
// номҳои M1; қаҳрамонҳо собит (ҳамон ҷадвали M2). `KNOWN_FROM = []` — модули пешина нест.
export const KNOWN_FROM = [];
export const CHARACTERS = {
  '알리': { country: '타지키스탄', job: '학생' },
  '카림': { country: '타지키스탄', job: '학생' },
  '사라': { country: '한국', job: '선생님' },
  '민수': { country: '한국', job: '학생' },
};
export const NAMES = Object.keys(CHARACTERS);
export const EXTRA_KNOWN = ['무슨', '뜻입니까', '이', '가', '은', '는'];

export const VOCAB = [
  {
    title: '인사', titleTranslated: 'Салом ва хайрбод', emoji: '👋',
    words: [
      { word: '안녕하세요', translation: 'Салом', emoji: '👋', pos: 'interjection', ipa: '/an.njʌŋ.ha.se.jo/',
        example: '안녕하세요, 선생님!', exampleTrans: 'Салом, муаллим!' },
      { word: '안녕히 가세요', translation: 'Хайр (ба касе ки меравад)', emoji: '🚶', pos: 'phrase', ipa: '/an.njʌŋ.hi ka.se.jo/',
        example: '안녕히 가세요, 선생님!', exampleTrans: 'Хайр, муаллим! (шумо меравед)' },
      { word: '안녕히 계세요', translation: 'Хайр (ба касе ки мемонад)', emoji: '🏠', pos: 'phrase', ipa: '/an.njʌŋ.hi ke.se.jo/',
        example: '안녕히 계세요, 민수 씨!', exampleTrans: 'Хайр, Минсу! (ман меравам)' },
      { word: '네', translation: 'Бале', emoji: '✅', pos: 'interjection', ipa: '/ne/',
        example: '네, 저는 학생입니다.', exampleTrans: 'Бале, ман донишҷӯ ҳастам. (네 = «бале», на «не»!)' },
      { word: '아니요', translation: 'Не', emoji: '❌', pos: 'interjection', ipa: '/a.ni.jo/',
        example: '아니요, 괜찮아요.', exampleTrans: 'Не, ҳоҷат нест.' },
    ],
  },
  {
    title: '예의 바른 말', titleTranslated: 'Муомилаи хуб', emoji: '🙏',
    words: [
      { word: '감사합니다', translation: 'Ташаккур', emoji: '🙏', pos: 'phrase', ipa: '/kam.sa.ham.ni.da/',
        example: '민수 씨, 감사합니다!', exampleTrans: 'Минсу, ташаккур!' },
      { word: '고맙습니다', translation: 'Раҳмат', emoji: '😊', pos: 'phrase', ipa: '/ko.map̚.s͈ɯm.ni.da/',
        example: '선생님, 고맙습니다!', exampleTrans: 'Муаллим, раҳмат!' },
      { word: '죄송합니다', translation: 'Бубахшед (гунаҳкорам)', emoji: '🙇', pos: 'phrase', ipa: '/tɕwe.soŋ.ham.ni.da/',
        example: '죄송합니다, 선생님.', exampleTrans: 'Бубахшед, муаллим.' },
      { word: '실례합니다', translation: 'Узр мехоҳам (барои пурсидан)', emoji: '🙋', pos: 'phrase', ipa: '/ɕil.le.ham.ni.da/',
        example: '실례합니다, 이름이 뭐예요?', exampleTrans: 'Узр мехоҳам, номатон чист?' },
      { word: '괜찮아요', translation: 'Ҳеҷ гап не', emoji: '👌', pos: 'phrase', ipa: '/kwen.tɕʰa.na.jo/',
        example: '괜찮아요? — 네, 괜찮아요.', exampleTrans: 'Хубед? — Бале, ҳеҷ гап не.' },
    ],
  },
  {
    title: '자기소개', titleTranslated: 'Муаррифӣ', emoji: '🙋',
    words: [
      { word: '저', translation: 'ман (эҳтиромона)', emoji: '🧑', pos: 'pronoun', ipa: '/tɕʌ/',
        example: '저는 타지키스탄 사람입니다.', exampleTrans: 'Ман тоҷикистонӣ ҳастам.' },
      { word: '제', translation: '…-и ман', emoji: '👉', pos: 'pronoun', ipa: '/tɕe/',
        example: '제 친구는 한국 사람입니다.', exampleTrans: 'Дӯсти ман кореягӣ аст.' },
      { word: '이름', translation: 'ном', emoji: '📛', pos: 'noun', ipa: '/i.ɾɯm/',
        example: '제 이름은 사라입니다.', exampleTrans: 'Номи ман Сара аст.' },
      { word: '입니다', translation: 'аст / ҳастам', emoji: '🟰', pos: 'verb', ipa: '/im.ni.da/',
        example: '카림 씨는 학생입니다.', exampleTrans: 'Карим донишҷӯ аст.' },
      { word: '반갑습니다', translation: 'Аз шиносоӣ шодам', emoji: '🤝', pos: 'phrase', ipa: '/pan.gap̚.s͈ɯm.ni.da/',
        example: '저는 알리입니다. 반갑습니다.', exampleTrans: 'Ман Алӣ ҳастам. Аз шиносоӣ шодам.' },
    ],
  },
  {
    title: '이름 묻기', titleTranslated: 'Пурсидани ном', emoji: '❓',
    words: [
      { word: '이름이 뭐예요?', translation: 'Номатон чист?', emoji: '❓', pos: 'phrase', ipa: '/i.ɾɯ.mi mwʌ.e.jo/',
        example: '안녕하세요! 이름이 뭐예요?', exampleTrans: 'Салом! Номатон чист?' },
      { word: '누구', translation: 'кӣ', emoji: '❔', pos: 'pronoun', ipa: '/nu.gu/',
        example: '민수 씨는 누구입니까?', exampleTrans: 'Минсу кист?' },
      { word: '무엇', translation: 'чӣ', emoji: '🔍', pos: 'pronoun', ipa: '/mu.ʌt̚/',
        example: '이름이 무엇입니까?', exampleTrans: 'Номатон чист?' },
      { word: '씨', translation: 'ҷаноб / хонум (пас аз ном)', emoji: '🧑‍💼', pos: 'noun', ipa: '/ɕ͈i/',
        example: '민수 씨, 안녕하세요!', exampleTrans: 'Салом, Минсу!' },
      { word: '네, 맞아요', translation: 'Бале, дуруст', emoji: '✔️', pos: 'phrase', ipa: '/ne ma.dʑa.jo/',
        example: '알리 씨예요? — 네, 맞아요.', exampleTrans: 'Шумо Алӣ ҳастед? — Бале, дуруст.' },
    ],
  },
  {
    title: '사람', titleTranslated: 'Одамон', emoji: '👥',
    words: [
      { word: '사람', translation: 'одам', emoji: '🧍', pos: 'noun', ipa: '/sa.ɾam/',
        example: '사라 씨는 한국 사람입니다.', exampleTrans: 'Сара кореягӣ аст.' },
      { word: '남자', translation: 'мард', emoji: '👨', pos: 'noun', ipa: '/nam.dʑa/',
        example: '민수 씨는 남자입니다.', exampleTrans: 'Минсу мард аст.' },
      { word: '여자', translation: 'зан', emoji: '👩', pos: 'noun', ipa: '/jʌ.dʑa/',
        example: '사라 씨는 여자입니다.', exampleTrans: 'Сара зан аст.' },
      { word: '친구', translation: 'дӯст', emoji: '🫂', pos: 'noun', ipa: '/tɕʰin.gu/',
        example: '카림은 제 친구입니다.', exampleTrans: 'Карим дӯсти ман аст.' },
      { word: '선생님', translation: 'муаллим', emoji: '👩‍🏫', pos: 'noun', ipa: '/sʌn.seŋ.nim/',
        example: '제 선생님은 한국 사람입니다.', exampleTrans: 'Муаллими ман кореягӣ аст.' },
      { word: '학생', translation: 'донишҷӯ', emoji: '🧑‍🎓', pos: 'noun', ipa: '/hak̚.s͈eŋ/',
        example: '저는 한국어 학생입니다.', exampleTrans: 'Ман донишҷӯи забони кореягӣ ҳастам.' },
    ],
  },
  {
    title: '안부', titleTranslated: 'Аҳволпурсӣ', emoji: '🙂',
    words: [
      { word: '잘 지내요', translation: 'Хуб ҳастам', emoji: '🙂', pos: 'phrase', ipa: '/tɕal tɕi.ne.jo/',
        example: '네, 잘 지내요.', exampleTrans: 'Бале, хуб ҳастам.' },
      { word: '잘 지냈어요?', translation: 'Чӣ хел будед?', emoji: '🤗', pos: 'phrase', ipa: '/tɕal tɕi.ne.s͈ʌ.jo/',
        example: '오랜만이에요! 잘 지냈어요?', exampleTrans: 'Кайҳо боз надида будам! Чӣ хел будед?' },
      { word: '좋아요', translation: 'Хуб аст', emoji: '👍', pos: 'phrase', ipa: '/tɕo.a.jo/',
        example: '한국어가 좋아요!', exampleTrans: 'Забони кореягӣ хуб аст!' },
      { word: '오랜만이에요', translation: 'Кайҳо боз надида будам', emoji: '⏳', pos: 'phrase', ipa: '/o.ɾen.ma.ni.e.jo/',
        example: '오랜만이에요, 민수 씨!', exampleTrans: 'Кайҳо боз надида будам, Минсу!' },
    ],
  },
  {
    title: '나라', titleTranslated: 'Кишварҳо', emoji: '🌍',
    words: [
      { word: '나라', translation: 'кишвар', emoji: '🌍', pos: 'noun', ipa: '/na.ɾa/',
        example: '타지키스탄은 제 나라입니다.', exampleTrans: 'Тоҷикистон кишвари ман аст.' },
      { word: '한국', translation: 'Корея', emoji: '🇰🇷', pos: 'noun', ipa: '/han.guk̚/',
        example: '민수 씨는 한국 사람입니다.', exampleTrans: 'Минсу кореягӣ аст.' },
      { word: '한국어', translation: 'забони кореягӣ', emoji: '🗣️', pos: 'noun', ipa: '/han.gu.gʌ/',
        example: '사라 씨는 한국어 선생님입니다.', exampleTrans: 'Сара муаллими забони кореягӣ аст.' },
      { word: '타지키스탄', translation: 'Тоҷикистон', emoji: '🇹🇯', pos: 'noun', ipa: '/tʰa.dʑi.kʰi.sɯ.tʰan/',
        example: '카림 씨는 타지키스탄 사람입니다.', exampleTrans: 'Карим тоҷикистонӣ аст.' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
export const GRAMMAR = [
  {
    lessonTitle: '문법: -입니다', lessonTitleTranslated: 'Грамматика: -입니다 («аст / ҳастам»)',
    title: '명사 + 입니다 / 입니까?', titleTranslated: 'Исм + 입니다 («аст») ва 입니까? (савол)',
    emoji: '🔗',
    explanation:
`Хабари хуш: дар кореягӣ тартиби ҷумла мисли тоҷикист — **феъл дар охир** меояд.

- Тоҷикӣ: Ман донишҷӯ **ҳастам**.
- Кореягӣ: 저는 학생**입니다**. (чонын ҳакссэнгимнида)

**입니다** = «аст / ҳастам / ҳастед». Он **бевосита ба исм** часпида мешавад, бе фосила:

- 학생 + 입니다 → **학생입니다** (донишҷӯ ҳастам)
- 선생님 + 입니다 → **선생님입니다** (муаллим аст)

**입니다** барои ҳамаи шахсҳо якхела аст — «ман», «ӯ», «Шумо»: шакл иваз намешавад.

**Савол:** ба ҷои 입니다 → **입니까?**

- 학생**입니까**? — Донишҷӯ ҳастед?
- 네, 학생**입니다**. — Бале, донишҷӯ ҳастам.

입니다 шакли **расмӣ ва боэҳтиром** аст: бо муаллим, дар кор, бо шахси ношинос. Шакли гуфтугӯии 이에요/예요 дар Модули 2 меояд.`,
    rules: [
      { pattern: 'Исм + 입니다', note: 'Бевосита, бе фосила: 학생입니다. Барои ҳамаи шахсҳо якхела.' },
      { pattern: 'Исм + 입니까?', note: 'Шакли савол: 학생입니까? — Донишҷӯ ҳастед?' },
      { pattern: 'Фоил + … + 입니다', note: 'Феъл ҳамеша дар охир — мисли тоҷикӣ.' },
    ],
    examples: [
      { sentence: '저는 알리입니다.', translation: 'Ман Алӣ ҳастам.', highlight: '입니다' },
      { sentence: '저는 학생입니다.', translation: 'Ман донишҷӯ ҳастам.', highlight: '입니다' },
      { sentence: '사라는 선생님입니다.', translation: 'Сара муаллим аст.', highlight: '입니다' },
      { sentence: '학생입니까?', translation: 'Донишҷӯ ҳастед?', highlight: '입니까' },
      { sentence: '네, 학생입니다.', translation: 'Бале, донишҷӯ ҳастам.', highlight: '입니다' },
    ],
    exercises: [
      { prompt: '저는 알리___.', promptTranslated: 'Ман Алӣ ҳастам.', answer: '입니다', options: ['입니다', '입니까', '는', '은'], explanation: 'Ҷумлаи хабарӣ → 입니다.' },
      { prompt: '학생___?', promptTranslated: 'Донишҷӯ ҳастед?', answer: '입니까', options: ['입니다', '입니까', '은', '는'], explanation: 'Савол → 입니까?' },
      { prompt: '사라는 선생님___.', promptTranslated: 'Сара муаллим аст.', answer: '입니다', options: ['입니까', '는', '입니다', '은'], explanation: 'Барои «ӯ» ҳам ҳамон 입니다.' },
      { prompt: '네, 저는 학생___.', promptTranslated: 'Бале, ман донишҷӯ ҳастам.', answer: '입니다', options: ['은', '입니까', '는', '입니다'], explanation: 'Ҷавоб ҷумлаи хабарист → 입니다.' },
      { prompt: '카림은 학생___.', promptTranslated: 'Карим донишҷӯ аст.', answer: '입니다', options: ['입니다', '는', '입니까', '은'], explanation: '학생 + 입니다 = 학생입니다.' },
      { prompt: '친구___?', promptTranslated: 'Ӯ дӯсти шумост?', answer: '입니까', options: ['는', '입니까', '입니다', '은'], explanation: 'Аломати савол → 입니까?' },
      // «Ҷумларо созед» — мисли en/ru/ar. Маҳз тартиби калимаро месанҷад: феъл дар охир.
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Номи ман Алӣ аст.', answer: '제 이름은 알리입니다.', options: ['알리입니다', '제', '이름은'], explanation: '입니다 ҳамеша дар охир: 제 이름은 알리입니다.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ман тоҷикистонӣ ҳастам.', answer: '저는 타지키스탄 사람입니다.', options: ['사람입니다', '저는', '타지키스탄'], explanation: 'Фоил → исм → 입니다: 저는 타지키스탄 사람입니다.' },
    ],
  },
  {
    lessonTitle: '문법: 은/는', lessonTitleTranslated: 'Грамматика: 은/는 (нишонаи мавзӯъ)',
    title: '은 / 는 — 주제 조사', titleTranslated: '은 / 는 — нишонаи мавзӯъ',
    emoji: '🏷️',
    explanation:
`**은/는** баъди исм меояд ва мегӯяд: «сухан **дар бораи ҳамин** аст».

- **저는** 학생입니다. — (Дар бораи ман бошад,) ман донишҷӯ ҳастам.
- **카림은** 학생입니다. — (Дар бораи Карим бошад,) ӯ донишҷӯ аст.

Дар тоҷикӣ ҳамтои ин нишона нест — мо онро бо тартиби калимаҳо мефаҳмонем. Дар кореягӣ бе он ҷумла нопурра садо медиҳад.

**Кадомашро гузорем?** Ба ҳарфи охири исм нигоҳ кунед:

- Исм бо **ҳамсадо** (патчхим) тамом шавад → **은**: 이름**은**, 카림**은**, 선생님**은**
- Исм бо **садонок** тамом шавад → **는**: 저**는**, 사라**는**, 친구**는**

Маслиҳат: агар блоки охир дар таг ҳарф дошта бошад (이**름**, 카**림**) — **은**; агар надошта бошад (**저**, 사**라**) — **는**.`,
    rules: [
      { pattern: 'Исм (бо ҳамсадо) + 은', note: '이름은, 카림은, 선생님은 — блоки охир дар таг ҳарф дорад.' },
      { pattern: 'Исм (бо садонок) + 는', note: '저는, 사라는, 친구는 — блоки охир дар таг ҳарф надорад.' },
      { pattern: 'Мавзӯъ + 은/는 + … + 입니다', note: 'Қолаби асосии муаррифӣ: 저는 알리입니다.' },
    ],
    examples: [
      { sentence: '저는 학생입니다.', translation: 'Ман донишҷӯ ҳастам.', highlight: '는' },
      { sentence: '제 이름은 사라입니다.', translation: 'Номи ман Сара аст.', highlight: '은' },
      { sentence: '카림은 학생입니다.', translation: 'Карим донишҷӯ аст.', highlight: '은' },
      { sentence: '사라는 선생님입니다.', translation: 'Сара муаллим аст.', highlight: '는' },
      { sentence: '민수는 제 친구입니다.', translation: 'Минсу дӯсти ман аст.', highlight: '는' },
    ],
    exercises: [
      { prompt: '저___ 학생입니다.', promptTranslated: 'Ман донишҷӯ ҳастам.', answer: '는', options: ['은', '는', '입니다', '입니까'], explanation: '저 бо садонок тамом мешавад → 는.' },
      { prompt: '제 이름___ 알리입니다.', promptTranslated: 'Номи ман Алӣ аст.', answer: '은', options: ['는', '입니까', '은', '입니다'], explanation: '이름 бо ㅁ тамом мешавад → 은.' },
      { prompt: '카림___ 학생입니다.', promptTranslated: 'Карим донишҷӯ аст.', answer: '은', options: ['은', '는', '입니까', '입니다'], explanation: '카림 бо ㅁ тамом мешавад → 은.' },
      { prompt: '사라___ 선생님입니다.', promptTranslated: 'Сара муаллим аст.', answer: '는', options: ['입니다', '은', '는', '입니까'], explanation: '사라 бо садонок тамом мешавад → 는.' },
      { prompt: '민수___ 제 친구입니다.', promptTranslated: 'Минсу дӯсти ман аст.', answer: '는', options: ['은', '입니까', '입니다', '는'], explanation: '민수 бо садонок тамом мешавад → 는.' },
      { prompt: '선생님___ 한국 사람입니다.', promptTranslated: 'Муаллим кореягӣ аст.', answer: '은', options: ['는', '은', '입니다', '입니까'], explanation: '선생님 бо ㅁ тамом мешавад → 은.' },
      { prompt: '친구___ 타지키스탄 사람입니다.', promptTranslated: 'Дӯстам тоҷикистонӣ аст.', answer: '는', options: ['입니까', '는', '은', '입니다'], explanation: '친구 бо садонок тамом мешавад → 는.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Минсу кореягӣ аст.', answer: '민수는 한국 사람입니다.', options: ['한국', '사람입니다', '민수는'], explanation: 'Мавзӯъ бо 는 дар аввал, 입니다 дар охир: 민수는 한국 사람입니다.' },
    ],
  },
];

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
// Саволҳо бо шакли саволҳои TOPIK I (мазмуни матн, ҷавоби мувофиқ).
export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: '읽기: 자기소개', lessonTitleTranslated: 'Хониш: Муаррифӣ',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: '자기소개', titleTranslated: 'Муаррифӣ',
    passage: '안녕하세요. 제 이름은 알리입니다. 저는 타지키스탄 사람입니다. 저는 학생입니다. 제 친구는 민수입니다. 민수는 한국 사람입니다.',
    passageTranslated: 'Салом. Номи ман Алӣ аст. Ман тоҷикистонӣ ҳастам. Ман донишҷӯ ҳастам. Дӯсти ман Минсу аст. Минсу кореягӣ аст.',
    questions: [
      { question: '알리는 한국 사람입니까?', questionTranslated: 'Алӣ кореягӣ аст?', options: ['아니요, 타지키스탄 사람입니다', '네, 한국 사람입니다', '아니요, 선생님입니다'], correctIndex: 0, explanation: 'Матн: 저는 타지키스탄 사람입니다.' },
      { question: '민수는 누구입니까?', questionTranslated: 'Минсу кист?', options: ['알리 씨 친구', '알리 씨 선생님', '타지키스탄 사람'], correctIndex: 0, explanation: 'Матн: 제 친구는 민수입니다.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: '듣기: 처음 만났어요', lessonTitleTranslated: 'Шунавоӣ: Шиносоӣ',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: '처음 만났어요', titleTranslated: 'Шиносоӣ',
    passage: '안녕하세요. 저는 사라입니다. 저는 선생님입니다. 반갑습니다. 제 학생 이름은 카림입니다. 카림은 타지키스탄 사람입니다. 안녕히 계세요!',
    passageTranslated: 'Салом. Ман Сара ҳастам. Ман муаллим ҳастам. Аз шиносоӣ шодам. Номи шогирди ман Карим аст. Карим тоҷикистонӣ аст. Хайр!',
    questions: [
      { question: '여자 이름은 무엇입니까?', questionTranslated: 'Номи зан чист?', options: ['사라', '카림', '민수'], correctIndex: 0, explanation: 'Матн: 저는 사라입니다.' },
      { question: '사라는 누구입니까?', questionTranslated: 'Сара кист?', options: ['선생님', '학생', '친구'], correctIndex: 0, explanation: 'Матн: 저는 선생님입니다.' },
      { question: '카림은 누구입니까?', questionTranslated: 'Карим кист?', options: ['사라 씨 학생', '사라 씨 선생님', '사라 씨 친구'], correctIndex: 0, explanation: 'Матн: 제 학생 이름은 카림입니다.' },
      { question: '카림은 타지키스탄 사람입니까?', questionTranslated: 'Карим тоҷикистонӣ аст?', options: ['네, 타지키스탄 사람입니다', '아니요, 한국 사람입니다', '아니요, 선생님입니다'], correctIndex: 0, explanation: 'Матн: 카림은 타지키스탄 사람입니다.' },
    ],
  },
  {
    slot: 'review',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30, kind: 'reading', emoji: '🔄',
    title: '인사와 소개 복습', titleTranslated: 'Такрор: салом ва шиносоӣ',
    passage: '안녕하세요! 저는 알리입니다. 저는 한국어 학생입니다. 민수는 제 친구입니다. 민수는 한국 사람입니다. 감사합니다. 안녕히 가세요!',
    passageTranslated: 'Салом! Ман Алӣ ҳастам. Ман донишҷӯи забони кореягӣ ҳастам. Минсу дӯсти ман аст. Минсу кореягӣ аст. Ташаккур. Хайр!',
    questions: [
      { question: '알리는 한국어 학생입니까?', questionTranslated: 'Алӣ донишҷӯи забони кореягӣ аст?', options: ['네, 한국어 학생입니다', '아니요, 한국어 선생님입니다', '아니요, 한국 사람입니다'], correctIndex: 0, explanation: 'Матн: 저는 한국어 학생입니다.' },
      { question: '민수는 타지키스탄 사람입니까?', questionTranslated: 'Минсу тоҷикистонӣ аст?', options: ['아니요, 한국 사람입니다', '네, 타지키스탄 사람입니다', '아니요, 선생님입니다'], correctIndex: 0, explanation: 'Матн: 민수는 한국 사람입니다.' },
    ],
  },
  {
    slot: 'test',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони модул',
    skillType: 'test', xpReward: 50, kind: 'reading', emoji: '🏆',
    title: '카림의 자기소개', titleTranslated: 'Муаррифии Карим',
    passage: '안녕하세요. 제 이름은 카림입니다. 저는 타지키스탄 사람입니다. 저는 한국어 학생입니다. 제 선생님은 한국 사람입니다. 선생님 이름은 사라입니다. 제 친구 이름은 알리입니다. 알리는 학생입니다. 반갑습니다!',
    passageTranslated: 'Салом. Номи ман Карим аст. Ман тоҷикистонӣ ҳастам. Ман донишҷӯи забони кореягӣ ҳастам. Муаллими ман кореягӣ аст. Номи муаллим Сара аст. Номи дӯстам Алӣ аст. Алӣ донишҷӯ аст. Аз шиносоӣ шодам!',
    questions: [
      { question: '카림은 한국 사람입니까?', questionTranslated: 'Карим кореягӣ аст?', options: ['아니요, 타지키스탄 사람입니다', '네, 한국 사람입니다', '아니요, 선생님입니다'], correctIndex: 0, explanation: 'Матн: 저는 타지키스탄 사람입니다.' },
      { question: '카림은 누구입니까?', questionTranslated: 'Карим кист?', options: ['한국어 학생', '한국어 선생님', '사라 씨 선생님'], correctIndex: 0, explanation: 'Матн: 저는 한국어 학생입니다.' },
      { question: '선생님은 한국 사람입니까?', questionTranslated: 'Муаллим кореягӣ аст?', options: ['네, 한국 사람입니다', '아니요, 타지키스탄 사람입니다', '아니요, 학생입니다'], correctIndex: 0, explanation: 'Матн: 제 선생님은 한국 사람입니다.' },
      { question: '선생님 이름은 무엇입니까?', questionTranslated: 'Номи муаллим чист?', options: ['사라', '민수', '카림'], correctIndex: 0, explanation: 'Матн: 선생님 이름은 사라입니다.' },
      { question: '알리는 학생입니까?', questionTranslated: 'Алӣ донишҷӯ аст?', options: ['네, 학생입니다', '아니요, 선생님입니다', '아니요, 한국 사람입니다'], correctIndex: 0, explanation: 'Матн: 알리는 학생입니다.' },
      { question: '«친구» — 무슨 뜻입니까?', questionTranslated: '«친구» чӣ маъно дорад?', options: ['дӯст', 'муаллим', 'донишҷӯ'], correctIndex: 0, explanation: '친구 = дӯст.' },
      { question: '«반갑습니다» — 무슨 뜻입니까?', questionTranslated: '«반갑습니다» чӣ маъно дорад?', options: ['Аз шиносоӣ шодам', 'Ташаккур', 'Бубахшед'], correctIndex: 0, explanation: '반갑습니다 = Аз шиносоӣ шодам.' },
      { question: '«안녕하세요» — 무슨 뜻입니까?', questionTranslated: '«안녕하세요» чӣ маъно дорад?', options: ['Салом', 'Хайр', 'Ташаккур'], correctIndex: 0, explanation: '안녕하세요 = Салом.' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
// Сатрҳои B-ро хонанда мегӯяд (`isUser`).
export const DIALOGUE = {
  lessonTitle: '말하기: 처음 만났을 때', lessonTitleTranslated: 'Муколама ва амалия',
  title: '처음 만났을 때', titleTranslated: 'Вохӯрии аввал',
  scenario: 'Шумо бори аввал бо ҳамсинфи кореягиатон Минсу шинос мешавед.', emoji: '🗣️',
  lines: [
    { speaker: '민수', text: '안녕하세요.', translation: 'Салом.' },
    { speaker: '알리', text: '안녕하세요.', translation: 'Салом.', isUser: true },
    { speaker: '민수', text: '이름이 뭐예요?', translation: 'Номатон чист?' },
    { speaker: '알리', text: '제 이름은 알리입니다.', translation: 'Номи ман Алӣ аст.', isUser: true },
    { speaker: '민수', text: '저는 민수입니다. 반갑습니다.', translation: 'Ман Минсу ҳастам. Аз шиносоӣ шодам.' },
    { speaker: '알리', text: '저도 반갑습니다.', translation: 'Ман ҳам шодам.', isUser: true },
    { speaker: '민수', text: '알리 씨는 학생입니까?', translation: 'Алӣ, шумо донишҷӯ ҳастед?' },
    { speaker: '알리', text: '네, 저는 학생입니다.', translation: 'Бале, ман донишҷӯ ҳастам.', isUser: true },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
// Калимаҳои ҲАМИН модулро такрор мекунад (мисли англисӣ). Клавиатура барои
// кореягӣ блокро аз ҲАРФҲО месозад: ㅎ+ㅏ+ㄱ → 학 (frontend/lib/utils/hangul_compose.dart).
export const WRITING = {
  title: '쓰기 연습', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['네', '아니요', '저', '이름', '사람', '친구', '학생', '한국'],
};

export const ORDER = [
  'vocab:인사',
  'vocab:예의 바른 말',
  'vocab:자기소개',
  'vocab:이름 묻기',
  'vocab:사람',
  'vocab:안부',
  'vocab:나라',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
