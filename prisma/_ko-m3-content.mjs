// TOPIK I · 1급 · Модули 3 — «가족» (Оила).
//
// Сохтор мисли M3-и en (16 дарс: 7 луғат → 3 грамматика → хониш → шунавоӣ →
// муколама → навиштан → такрор → имтиҳон), ҳаҷм мисли en/ru M3 (36) ва ar (39).
// Меъёри 1급: 가족 호칭 (형/오빠/누나/언니…), N이/가 있어요/없어요 (Sejong: «의자가 있어요»).
//
// Танҳо МАЪЛУМОТ — сохтан: `_ko-module-build.mjs`. Хониши тоҷикӣ аз `_ko-tajik.mjs`
// (의-и соҳибӣ = «э»: 알리의 «аллиэ»).
//
// ҚОИДАҲОИ ҚАТЪӢ, ки билд пеш аз навиштан месанҷад (`_ko-coverage.mjs`):
//   1. Ҳар ҷумла танҳо аз калимаҳои M1 + M2 + M3 ва номҳо (калимаи наомӯхта нест).
//   2. Кишвар ва касби қаҳрамонҳо собит (`CHARACTERS`).
//   3. Оила собит (`FAMILY`): «… 누나가 있어요» бояд дар ҷадвал бошад; ва ҶИНСИ ГӮЯНДА —
//      형/누나-ро танҳо писар мегӯяд, 오빠/언니-ро танҳо духтар.
// ⚠️ Ишоратӣ (이/그/저 + исм) то M4 НЕСТ; 와/과/하고 («ва») то M10 нест — ҷумлаҳои алоҳида.

export const MODULE = {
  order: 2,
  title: '가족',
  titleTranslated: 'Оила',
  emoji: '👨‍👩‍👧',
  canDoStatement: 'Пас аз ин бахш дар бораи оилаи худ гуфта, пурсида метавонед, ки кӣ бародару хоҳар дорад, ва калимаи дурусти «бародар/хоҳари калонӣ»-ро (писар ё духтар мегӯяд) интихоб мекунед.',
};

export const KNOWN_FROM = ['./_ko-m1-content.mjs', './_ko-m2-content.mjs'];

// Қаҳрамонҳо — дар тамоми курс собит; `gender` барои 형/오빠/누나/언니.
export const CHARACTERS = {
  '알리': { country: '타지키스탄', job: '학생', gender: 'm' },
  '카림': { country: '타지키스탄', job: '학생', gender: 'm' },
  '사라': { country: '한국', job: '선생님', gender: 'f' },
  '민수': { country: '한국', job: '학생', gender: 'm' },
  '안나': { country: '러시아', job: '의사', gender: 'f' },
  '유키': { country: '일본', job: '간호사', gender: 'f' },
  '왕밍': { country: '중국', job: '요리사', gender: 'm' },
  '마이클': { country: '미국', job: '회사원', gender: 'm' },
};
export const NAMES = Object.keys(CHARACTERS);

// Оилаҳо — дар тамоми курс собит. Хеши номбаршуда БОЯД дар ин ҷо бошад.
export const FAMILY = {
  '알리': { 아버지: { job: '운전기사' }, 어머니: { job: '선생님' }, 할머니: {}, 누나: { job: '회사원' }, 남동생: { job: '학생' } },
  '민수': { 아버지: { job: '회사원' }, 어머니: { job: '주부' }, 형: { job: '경찰' }, 여동생: { job: '학생' }, 강아지: {} },
  '유키': { 오빠: { job: '요리사' }, 언니: { job: '가수' }, 고양이: {} },
  '사라': { 남편: { job: '의사' }, 아들: { job: '학생' }, 딸: {} },
  '카림': { 아버지: { job: '농부' }, 어머니: { job: '주부' } },
};

// Калимаҳои ДАСТУРИ савол (TOPIK), ки ҳамроҳи тарҷумаи тоҷикӣ меоянд, ва нишонаҳо.
export const EXTRA_KNOWN = ['무슨', '뜻이에요', '무엇에', '대한', '글이에요', '이', '가', '은', '는', '의'];

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
export const VOCAB = [
  {
    title: '가족', titleTranslated: 'Оила', emoji: '👨‍👩‍👧',
    words: [
      { word: '가족', translation: 'оила', emoji: '👨‍👩‍👧‍👦', pos: 'noun', ipa: '/ka.dʑok̚/',
        example: '우리 가족이에요.', exampleTrans: 'Оилаи мо.' },
      { word: '아버지', translation: 'падар', emoji: '👨‍🍼', pos: 'noun', ipa: '/a.bʌ.dʑi/',
        example: '알리 씨 아버지는 운전기사예요.', exampleTrans: 'Падари Алӣ ронанда аст.' },
      { word: '어머니', translation: 'модар', emoji: '🤱', pos: 'noun', ipa: '/ʌ.mʌ.ni/',
        example: '알리 씨 어머니는 선생님이에요.', exampleTrans: 'Модари Алӣ муаллим аст.' },
      { word: '부모님', translation: 'волидон (падару модар)', emoji: '👨‍👩‍👦', pos: 'noun', ipa: '/pu.mo.nim/',
        example: '민수 씨 부모님은 한국 사람이에요.', exampleTrans: 'Волидони Минсу кореягӣ ҳастанд.' },
      { word: '우리', translation: 'мо, …-и мо', emoji: '🫶', pos: 'pronoun', ipa: '/u.ɾi/',
        example: '우리 선생님은 사라 씨예요.', exampleTrans: 'Муаллими мо Сара аст.' },
      { word: '사진', translation: 'акс', emoji: '📷', pos: 'noun', ipa: '/sa.dʑin/',
        example: '가족 사진이에요.', exampleTrans: 'Акси оилавӣ аст.' },
    ],
  },
  {
    title: '형과 누나', titleTranslated: 'Бародару хоҳар (писар мегӯяд)', emoji: '👦',
    words: [
      { word: '형', translation: 'бародари калонӣ (писар мегӯяд)', emoji: '👱‍♂️', pos: 'noun', ipa: '/hjʌŋ/',
        example: '민수 씨 형은 경찰이에요.', exampleTrans: 'Бародари калонии Минсу милиса аст.' },
      { word: '누나', translation: 'хоҳари калонӣ (писар мегӯяд)', emoji: '👱‍♀️', pos: 'noun', ipa: '/nu.na/',
        example: '알리 씨 누나는 회사원이에요.', exampleTrans: 'Хоҳари калонии Алӣ корманди ширкат аст.' },
      { word: '남동생', translation: 'бародари хурдӣ', emoji: '👦', pos: 'noun', ipa: '/nam.doŋ.seŋ/',
        example: '알리 씨 남동생은 학생이에요.', exampleTrans: 'Бародари хурдии Алӣ донишҷӯ аст.' },
      { word: '여동생', translation: 'хоҳари хурдӣ', emoji: '👧', pos: 'noun', ipa: '/jʌ.doŋ.seŋ/',
        example: '민수 씨 여동생은 학생이에요.', exampleTrans: 'Хоҳари хурдии Минсу донишҷӯ аст.' },
      { word: '동생', translation: 'бародар ё хоҳари хурдӣ', emoji: '🧒', pos: 'noun', ipa: '/toŋ.seŋ/',
        example: '동생이 있어요?', exampleTrans: 'Бародар ё хоҳари хурдӣ доред?' },
    ],
  },
  {
    title: '오빠와 언니', titleTranslated: 'Бародару хоҳар (духтар мегӯяд) ва бобою бибӣ', emoji: '👧',
    words: [
      { word: '오빠', translation: 'бародари калонӣ (духтар мегӯяд)', emoji: '🧔', pos: 'noun', ipa: '/o.p͈a/',
        example: '유키 씨 오빠는 요리사예요.', exampleTrans: 'Бародари калонии Юки ошпаз аст.' },
      { word: '언니', translation: 'хоҳари калонӣ (духтар мегӯяд)', emoji: '👩‍🦰', pos: 'noun', ipa: '/ʌn.ni/',
        example: '유키 씨 언니는 가수예요.', exampleTrans: 'Хоҳари калонии Юки сароянда аст.' },
      { word: '형제', translation: 'бародару хоҳар', emoji: '👬', pos: 'noun', ipa: '/hjʌŋ.dʑe/',
        example: '카림 씨는 형제가 없어요.', exampleTrans: 'Карим бародару хоҳар надорад.' },
      { word: '할아버지', translation: 'бобо', emoji: '👴', pos: 'noun', ipa: '/ha.ɾa.bʌ.dʑi/',
        example: '할아버지가 계세요?', exampleTrans: 'Бобо доред?' },
      { word: '할머니', translation: 'бибӣ', emoji: '👵', pos: 'noun', ipa: '/hal.mʌ.ni/',
        example: '알리 씨는 할머니가 계세요.', exampleTrans: 'Алӣ бибӣ дорад.' },
    ],
  },
  {
    title: '남편과 아이', titleTranslated: 'Зану шавҳар ва фарзандон', emoji: '👶',
    words: [
      { word: '남편', translation: 'шавҳар', emoji: '🤵', pos: 'noun', ipa: '/nam.pʰjʌn/',
        example: '사라 씨 남편은 의사예요.', exampleTrans: 'Шавҳари Сара духтур аст.' },
      { word: '아내', translation: 'ҳамсар (зан)', emoji: '👰', pos: 'noun', ipa: '/a.ne/',
        example: '아내예요? — 네, 제 아내예요.', exampleTrans: 'Ҳамсаратон аст? — Бале, ҳамсари ман.' },
      { word: '아들', translation: 'писар (фарзанд)', emoji: '👨‍👦', pos: 'noun', ipa: '/a.dɯl/',
        example: '사라 씨 아들은 학생이에요.', exampleTrans: 'Писари Сара донишҷӯ аст.' },
      { word: '딸', translation: 'духтар (фарзанд)', emoji: '👩‍👧', pos: 'noun', ipa: '/t͈al/',
        example: '사라 씨는 딸이 있어요.', exampleTrans: 'Сара духтар дорад.' },
      { word: '아이', translation: 'кӯдак (фарзанд)', emoji: '🧸', pos: 'noun', ipa: '/a.i/',
        example: '아이가 있어요?', exampleTrans: 'Фарзанд доред?' },
      { word: '아기', translation: 'кӯдаки навзод', emoji: '👶', pos: 'noun', ipa: '/a.gi/',
        example: '아기가 있어요? — 아니요, 없어요.', exampleTrans: 'Кӯдаки навзод доред? — Не, надорам.' },
    ],
  },
  {
    title: '있어요, 없어요', titleTranslated: 'Доштан ва ҳайвоноти хонагӣ', emoji: '🐶',
    words: [
      { word: '있어요', translation: 'дорам, ҳаст', emoji: '📦', pos: 'verb', ipa: '/i.s͈ʌ.jo/',
        example: '알리 씨는 누나가 있어요.', exampleTrans: 'Алӣ хоҳари калонӣ дорад.' },
      { word: '없어요', translation: 'надорам, нест', emoji: '🫙', pos: 'verb', ipa: '/ʌp̚.s͈ʌ.jo/',
        example: '민수 씨는 누나가 없어요.', exampleTrans: 'Минсу хоҳари калонӣ надорад.' },
      { word: '집', translation: 'хона', emoji: '🏡', pos: 'noun', ipa: '/tɕip̚/',
        example: '우리 집이에요.', exampleTrans: 'Хонаи мо.' },
      { word: '강아지', translation: 'сагбача', emoji: '🐶', pos: 'noun', ipa: '/kaŋ.a.dʑi/',
        example: '민수 씨는 강아지가 있어요.', exampleTrans: 'Минсу сагбача дорад.' },
      { word: '고양이', translation: 'гурба', emoji: '🐱', pos: 'noun', ipa: '/ko.jaŋ.i/',
        example: '유키 씨는 고양이가 있어요.', exampleTrans: 'Юки гурба дорад.' },
    ],
  },
  {
    title: '친척', titleTranslated: 'Хешовандон', emoji: '🌳',
    words: [
      { word: '삼촌', translation: 'амак', emoji: '👨‍🦲', pos: 'noun', ipa: '/sam.tɕʰon/',
        example: '삼촌은 아버지 형제예요.', exampleTrans: 'Амак бародари падар аст.' },
      { word: '외삼촌', translation: 'тағо', emoji: '👨‍🦳', pos: 'noun', ipa: '/we.sam.tɕʰon/',
        example: '외삼촌은 어머니 형제예요.', exampleTrans: 'Тағо бародари модар аст.' },
      { word: '고모', translation: 'амма', emoji: '👩‍🦳', pos: 'noun', ipa: '/ko.mo/',
        // 형제 = асосан «бародарон» — амма/холаро 형제 намегӯянд (амак/тағо — метавонанд).
        example: '고모가 있어요? — 네, 있어요.', exampleTrans: 'Амма доред? — Бале, дорам.' },
      { word: '이모', translation: 'хола', emoji: '👩‍🦱', pos: 'noun', ipa: '/i.mo/',
        example: '이모가 계세요?', exampleTrans: 'Хола доред? (계세요 — эҳтиромона, барои калонсолон)' },
      { word: '친척', translation: 'хешовандон', emoji: '🌳', pos: 'noun', ipa: '/tɕʰin.tɕʰʌk̚/',
        example: '친척이 많아요.', exampleTrans: 'Хешовандон бисёранд.' },
    ],
  },
  {
    title: '같이 살아요', titleTranslated: 'Якҷоя ва танҳо', emoji: '🏘️',
    words: [
      { word: '모두', translation: 'ҳама', emoji: '🙌', pos: 'adverb', ipa: '/mo.du/',
        example: '모두 제 가족이에요.', exampleTrans: 'Ҳамаашон оилаи ман ҳастанд.' },
      { word: '같이', translation: 'якҷоя', emoji: '👭', pos: 'adverb', ipa: '/ka.tɕʰi/',
        example: '할머니도 같이 살아요.', exampleTrans: 'Бибӣ ҳам бо мо зиндагӣ мекунад.' },
      { word: '혼자', translation: 'танҳо', emoji: '🙍', pos: 'adverb', ipa: '/hon.dʑa/',
        example: '저는 혼자 살아요.', exampleTrans: 'Ман танҳо зиндагӣ мекунам.' },
      { word: '살아요', translation: 'зиндагӣ мекунам', emoji: '🏘️', pos: 'verb', ipa: '/sa.ɾa.jo/',
        example: '우리 가족은 같이 살아요.', exampleTrans: 'Оилаи мо якҷоя зиндагӣ мекунад.' },
      { word: '많아요', translation: 'бисёр аст', emoji: '📈', pos: 'adjective', ipa: '/ma.na.jo/',
        example: '알리 씨는 가족이 많아요.', exampleTrans: 'Оилаи Алӣ калон аст.' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
export const GRAMMAR = [
  {
    lessonTitle: '문법: 이/가 있어요/없어요', lessonTitleTranslated: 'Грамматика: 이/가 있어요 / 없어요 («дорам / надорам»)',
    title: '명사 + 이/가 있어요 / 없어요', titleTranslated: 'Исм + 이/가 있어요 / 없어요 («… дорам / … надорам»)',
    emoji: '📦',
    explanation:
`Барои «доштан» кореягӣ феъли алоҳида надорад. Мегӯянд: «… **ҳаст**» ё «… **нест**»:

- 누나**가 있어요**. — Хоҳари калонӣ дорам. (айнан: хоҳари калонӣ ҳаст)
- 형**이 없어요**. — Бародари калонӣ надорам. (айнан: … нест)

Исм нишонаи **이/가** мегирад — боз ҳамон қоидаи таг:

- Ҳиҷои охир дар таг ҳарф дорад → **이**: 형**이**, 동생**이**, 딸**이**
- Таг надорад → **가**: 누나**가**, 오빠**가**, 아기**가**

Кӣ дорад — бо **은/는** дар аввал: 저**는** 누나가 있어요. — Ман хоҳари калонӣ дорам.

**Савол:** 형제가 있어요? — Бародару хоҳар доред? → 네, 있어요. / 아니요, 없어요.

Барои калонсолон (падару модар, бобою бибӣ) эҳтиромона **계세요** мегӯянд — ҳамон 계세요-и «안녕히 계세요»: 할머니가 계세요.`,
    rules: [
      { pattern: 'Исм + 이/가 있어요', note: '… дорам / … ҳаст: 누나가 있어요, 형이 있어요.' },
      { pattern: 'Исм + 이/가 없어요', note: '… надорам / … нест: 형제가 없어요.' },
      { pattern: 'Калонсолон: … 이/가 계세요', note: 'Эҳтиромона: 할머니가 계세요.' },
    ],
    examples: [
      { sentence: '알리 씨는 누나가 있어요.', translation: 'Алӣ хоҳари калонӣ дорад.', highlight: '가 있어요' },
      { sentence: '민수 씨는 형이 있어요.', translation: 'Минсу бародари калонӣ дорад.', highlight: '이 있어요' },
      { sentence: '카림 씨는 형제가 없어요.', translation: 'Карим бародару хоҳар надорад.', highlight: '가 없어요' },
      { sentence: '형제가 있어요? — 네, 있어요.', translation: 'Бародару хоҳар доред? — Бале, дорам.', highlight: '있어요' },
      { sentence: '알리 씨는 할머니가 계세요.', translation: 'Алӣ бибӣ дорад.', highlight: '계세요' },
    ],
    exercises: [
      { prompt: '저는 누나___ 있어요.', promptTranslated: 'Ман хоҳари калонӣ дорам.', answer: '가', options: ['가', '이', '는', '의'], explanation: '누나 бо садонок тамом мешавад → 가.' },
      { prompt: '민수 씨는 형___ 있어요.', promptTranslated: 'Минсу бародари калонӣ дорад.', answer: '이', options: ['이', '가', '은', '의'], explanation: '형 бо ㅇ тамом мешавад → 이.' },
      { prompt: '카림 씨는 형제가 ___.', promptTranslated: 'Карим бародару хоҳар надорад.', answer: '없어요', options: ['없어요', '있어요', '아니에요', '이에요'], explanation: '«Надорад» → 없어요.' },
      { prompt: '유키 씨는 고양이___ 있어요.', promptTranslated: 'Юки гурба дорад.', answer: '가', options: ['가', '이', '은', '의'], explanation: '고양이 бо садонок тамом мешавад → 가.' },
      { prompt: '동생이 있어요? — 아니요, ___.', promptTranslated: 'Бародар ё хоҳари хурдӣ доред? — Не, надорам.', answer: '없어요', options: ['없어요', '있어요', '아니에요', '네'], explanation: '«Не, надорам» → 아니요, 없어요.' },
      { prompt: '사라 씨는 딸___ 있어요.', promptTranslated: 'Сара духтар дорад.', answer: '이', options: ['이', '가', '는', '의'], explanation: '딸 бо ㄹ тамом мешавад → 이.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Минсу сагбача дорад.', answer: '민수 씨는 강아지가 있어요.', options: ['강아지가', '민수', '있어요', '씨는'], explanation: 'Кӣ дорад (은/는) → чӣ (이/가) → 있어요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ман бародару хоҳар надорам.', answer: '저는 형제가 없어요.', options: ['없어요', '저는', '형제가'], explanation: '없어요 ҳамеша дар охир: 저는 형제가 없어요.' },
    ],
  },
  {
    lessonTitle: '문법: 의', lessonTitleTranslated: 'Грамматика: 의 — «…-и …» (соҳибӣ)',
    title: '명사 + 의 + 명사', titleTranslated: 'Исм + 의 + исм (соҳибӣ: «хоҳари Алӣ»)',
    emoji: '🔗',
    explanation:
`Дар тоҷикӣ «хоҳари **Алӣ**» — аввал чиз, баъд соҳиб. Дар кореягӣ **баръакс**: аввал соҳиб, баъд чиз, ва байнашон **의**:

- 알리**의** 누나 — хоҳари калонии Алӣ
- 선생님**의** 딸 — духтари муаллим

Хониш: 의-и соҳибӣ «**э**» гуфта мешавад — 알리의 «аллиэ», 선생님의 «сонсэнгнимэ».

Дар гуфтугӯ **의** бисёр вақт меафтад: 알리 씨 누나 = 알리 씨의 누나. Ҳарду дуруст.

**제** («…-и ман», Модули 1) худаш кӯтоҳшудаи **저의** аст: 저의 형 = 제 형.

**우리** («мо») — кореягиҳо дар бораи оила ва хона «ман» не, «**мо**» мегӯянд: **우리** 어머니, **우리** 집.`,
    rules: [
      { pattern: 'Соҳиб + 의 + чиз', note: '알리의 누나 — хоҳари калонии Алӣ. 의 = «э».' },
      { pattern: '저의 = 제', note: '저의 형 → 제 형 (кӯтоҳ; бештар ҳамин).' },
      { pattern: '우리 + оила / хона', note: '우리 어머니, 우리 집 — «модари мо», «хонаи мо».' },
    ],
    examples: [
      { sentence: '알리의 누나는 회사원이에요.', translation: 'Хоҳари калонии Алӣ корманди ширкат аст.', highlight: '의' },
      { sentence: '사라 씨의 딸이에요.', translation: 'Духтари Сара аст.', highlight: '의' },
      { sentence: '민수 씨의 형은 경찰이에요.', translation: 'Бародари калонии Минсу милиса аст.', highlight: '의' },
      { sentence: '유키 씨의 오빠는 요리사예요.', translation: 'Бародари калонии Юки ошпаз аст.', highlight: '의' },
      { sentence: '우리 집이에요.', translation: 'Хонаи мо.', highlight: '우리' },
    ],
    exercises: [
      { prompt: '알리___ 남동생은 학생이에요.', promptTranslated: 'Бародари хурдии Алӣ донишҷӯ аст.', answer: '의', options: ['의', '는', '이', '가'], explanation: 'Соҳибӣ → 의 (알리의 = «аллиэ»).' },
      { prompt: '민수 씨의 여동생___ 학생이에요.', promptTranslated: 'Хоҳари хурдии Минсу донишҷӯ аст.', answer: '은', options: ['은', '는', '의', '이'], explanation: '여동생 бо ㅇ тамом мешавад → 은.' },
      { prompt: '저의 형 = ___ 형', promptTranslated: 'Бародари калонии ман', answer: '제', options: ['제', '저', '우리', '의'], explanation: '저의 кӯтоҳ мешавад → 제.' },
      { prompt: '사라 씨___ 아들은 학생이에요.', promptTranslated: 'Писари Сара донишҷӯ аст.', answer: '의', options: ['의', '는', '가', '도'], explanation: 'Соҳибӣ → 의.' },
      { prompt: '___ 집이에요.', promptTranslated: 'Хонаи мо.', answer: '우리', options: ['우리', '저', '저는', '의'], explanation: '«…-и мо» → 우리.' },
      { prompt: '유키 씨의 언니는 ___예요.', promptTranslated: 'Хоҳари калонии Юки сароянда аст.', answer: '가수', options: ['가수', '요리사', '의사', '배우'], explanation: 'Хоҳари калонии Юки — сароянда.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Хоҳари калонии Алӣ корманди ширкат аст.', answer: '알리 씨의 누나는 회사원이에요.', options: ['씨의', '누나는', '알리', '회사원이에요'], explanation: 'Соҳиб (알리 씨의) → чиз (누나는) → 이에요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Акси оилаи мо.', answer: '우리 가족 사진이에요.', options: ['사진이에요', '가족', '우리'], explanation: 'Соҳиб пеш аз чиз: 우리 → 가족 → 사진이에요.' },
    ],
  },
  {
    lessonTitle: '문법: 형·오빠·누나·언니', lessonTitleTranslated: 'Грамматика: бародару хоҳари калонӣ — кӣ мегӯяд?',
    title: '형 / 오빠 / 누나 / 언니', titleTranslated: 'Бародару хоҳари калонӣ: писар ё духтар мегӯяд',
    emoji: '👫',
    explanation:
`Дар кореягӣ калимаи «бародари калонӣ» ва «хоҳари калонӣ» аз он вобаста аст, ки **кӣ мегӯяд** — писар ё духтар:

- **Писар мегӯяд:** бародари калонӣ — **형**, хоҳари калонӣ — **누나**
- **Духтар мегӯяд:** бародари калонӣ — **오빠**, хоҳари калонӣ — **언니**

Намуна:

- Алӣ (писар): 누나가 있어요. — Хоҳари калонӣ дорам.
- Юки (духтар): 오빠가 있어요. — Бародари калонӣ дорам.

Хурдиҳо барои ҳама якхела: **남동생** (бародари хурдӣ), **여동생** (хоҳари хурдӣ) ё умуман **동생**.

Кореягиҳо ба дӯстони аз худ калонтар ҳам ҳамин калимаҳоро мегӯянд: духтар ба ҷавони калонтар — 오빠, писар ба дӯсти калонтар — 형.`,
    rules: [
      { pattern: 'Писар: 형 / 누나', note: 'Бародари калонӣ — 형, хоҳари калонӣ — 누나.' },
      { pattern: 'Духтар: 오빠 / 언니', note: 'Бародари калонӣ — 오빠, хоҳари калонӣ — 언니.' },
      { pattern: 'Хурдӣ: 남동생 / 여동생 / 동생', note: 'Барои ҳама якхела.' },
    ],
    examples: [
      { sentence: '유키 씨 언니는 가수예요.', translation: 'Хоҳари калонии Юки сароянда аст.', highlight: '언니' },
      { sentence: '민수 씨 형은 경찰이에요.', translation: 'Бародари калонии Минсу милиса аст.', highlight: '형' },
      { sentence: '알리 씨 누나는 회사원이에요.', translation: 'Хоҳари калонии Алӣ корманди ширкат аст.', highlight: '누나' },
      { sentence: '유키 씨는 오빠가 있어요.', translation: 'Юки бародари калонӣ дорад.', highlight: '오빠' },
      { sentence: '민수 씨는 여동생이 있어요.', translation: 'Минсу хоҳари хурдӣ дорад.', highlight: '여동생' },
    ],
    exercises: [
      { prompt: '알리: "저는 ___ 있어요."', promptTranslated: 'Алӣ (писар): «Ман хоҳари калонӣ дорам.»', answer: '누나가', options: ['누나가', '언니가', '오빠가', '형이'], explanation: 'Алӣ писар аст → хоҳари калонӣ = 누나.' },
      { prompt: '유키: "저는 ___ 있어요."', promptTranslated: 'Юки (духтар): «Ман бародари калонӣ дорам.»', answer: '오빠가', options: ['형이', '오빠가', '누나가', '언니가'], explanation: 'Юки духтар аст → бародари калонӣ = 오빠.' },
      { prompt: '민수: "저는 ___ 있어요."', promptTranslated: 'Минсу (писар): «Ман бародари калонӣ дорам.»', answer: '형이', options: ['오빠가', '형이', '언니가', '누나가'], explanation: 'Минсу писар аст → бародари калонӣ = 형.' },
      // Ҳар машқ ҷумлаи ХУДРО дорад (аудит: ду машқ бо ҳамон матни кореягӣ ва ҷавоби гуногун).
      { prompt: '유키: "___ 가수예요."', promptTranslated: 'Юки (духтар): «Хоҳари калониам сароянда аст.»', answer: '언니는', options: ['누나는', '언니는', '형은', '오빠는'], explanation: 'Юки духтар аст → хоҳари калонӣ = 언니. Хоҳари калонии Юки — сароянда.' },
      { prompt: '알리: "___ 학생이에요."', promptTranslated: 'Алӣ: «Бародари хурдиам донишҷӯ аст.»', answer: '남동생은', options: ['남동생은', '여동생은', '오빠는', '언니는'], explanation: 'Бародари хурдӣ барои ҳама — 남동생.' },
      { prompt: '민수: "___ 경찰이에요."', promptTranslated: 'Минсу (писар): «Бародари калониам милиса аст.»', answer: '형은', options: ['오빠는', '형은', '누나는', '남동생은'], explanation: 'Минсу писар аст → бародари калонӣ = 형. 형-и Минсу — милиса.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Юки бародари калонӣ дорад.', answer: '유키 씨는 오빠가 있어요.', options: ['오빠가', '유키', '있어요', '씨는'], explanation: 'Юки духтар аст → 오빠.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Алӣ хоҳари калонӣ дорад.', answer: '알리 씨는 누나가 있어요.', options: ['누나가', '씨는', '알리', '있어요'], explanation: 'Алӣ писар аст → 누나.' },
    ],
  },
];

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
// `speaker` — кӣ «저/제/우리»-ро мегӯяд (барои санҷиши қаҳрамонҳо ва оила).
export const COMPREHENSIONS = [
  {
    slot: 'reading', speaker: '알리',
    lessonTitle: '읽기: 우리 가족', lessonTitleTranslated: 'Хониш: Оилаи Алӣ',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: '알리 씨의 가족', titleTranslated: 'Оилаи Алӣ',
    passage: '안녕하세요. 저는 알리예요. 우리 가족 사진이에요. 우리 아버지는 운전기사예요. 우리 어머니는 선생님이에요. 저는 누나가 있어요. 누나는 회사원이에요. 남동생도 있어요. 남동생은 학생이에요. 할머니도 같이 살아요.',
    passageTranslated: 'Салом. Ман Алӣ ҳастам. Ин акси оилаи мо аст. Падарам ронанда аст. Модарам муаллим аст. Ман хоҳари калонӣ дорам. Хоҳарам корманди ширкат аст. Бародари хурдӣ ҳам дорам. Бародари хурдиам донишҷӯ аст. Бибиам ҳам бо мо зиндагӣ мекунад.',
    questions: [
      { question: '알리 씨 아버지는 선생님이에요?', questionTranslated: 'Падари Алӣ муаллим аст?', options: ['아니요, 운전기사예요', '네, 선생님이에요', '아니요, 의사예요'], correctIndex: 0, explanation: 'Матн: 우리 아버지는 운전기사예요.' },
      { question: '알리 씨는 누나가 있어요?', questionTranslated: 'Алӣ хоҳари калонӣ дорад?', options: ['네, 있어요', '아니요, 없어요', '아니요, 형이 있어요'], correctIndex: 0, explanation: 'Матн: 저는 누나가 있어요.' },
      { question: '할머니도 같이 살아요?', questionTranslated: 'Бибӣ ҳам якҷоя зиндагӣ мекунад?', options: ['네, 같이 살아요', '아니요, 혼자 살아요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 할머니도 같이 살아요.' },
    ],
  },
  {
    slot: 'listening', speaker: '유키',
    lessonTitle: '듣기: 유키 씨의 가족', lessonTitleTranslated: 'Шунавоӣ: Оилаи Юки',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: '유키 씨의 가족', titleTranslated: 'Оилаи Юки',
    passage: '안녕하세요. 저는 유키예요. 일본 사람이에요. 제 가족은 모두 일본 사람이에요. 저는 오빠가 있어요. 오빠는 요리사예요. 언니도 있어요. 언니는 가수예요. 저는 남동생이 없어요. 고양이가 있어요. 반가워요!',
    passageTranslated: 'Салом. Ман Юки ҳастам. Ҷопонӣ ҳастам. Ҳамаи оилаи ман ҷопонӣ ҳастанд. Ман бародари калонӣ дорам. Бародарам ошпаз аст. Хоҳари калонӣ ҳам дорам. Хоҳарам сароянда аст. Ман бародари хурдӣ надорам. Гурба дорам. Шодам!',
    questions: [
      { question: '유키 씨는 오빠가 있어요?', questionTranslated: 'Юки бародари калонӣ дорад?', options: ['네, 있어요', '아니요, 없어요', '아니요, 형이 있어요'], correctIndex: 0, explanation: 'Матн: 저는 오빠가 있어요.' },
      { question: '유키 씨 언니는 가수예요?', questionTranslated: 'Хоҳари калонии Юки сароянда аст?', options: ['네, 가수예요', '아니요, 요리사예요', '아니요, 의사예요'], correctIndex: 0, explanation: 'Матн: 언니는 가수예요.' },
      { question: '유키 씨는 남동생이 있어요?', questionTranslated: 'Юки бародари хурдӣ дорад?', options: ['아니요, 없어요', '네, 있어요', '네, 여동생이 있어요'], correctIndex: 0, explanation: 'Матн: 저는 남동생이 없어요.' },
      { question: '유키 씨는 강아지가 있어요?', questionTranslated: 'Юки сагбача дорад?', options: ['아니요, 고양이가 있어요', '네, 강아지가 있어요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 고양이가 있어요.' },
    ],
  },
  {
    slot: 'review', speaker: '민수',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30, kind: 'reading', emoji: '🔄',
    title: '가족 복습', titleTranslated: 'Такрор: оила',
    passage: '안녕하세요. 저는 민수예요. 우리 가족은 모두 한국 사람이에요. 우리 아버지는 회사원이에요. 우리 어머니는 주부예요. 저는 형이 있어요. 형은 경찰이에요. 여동생도 있어요. 여동생은 학생이에요. 강아지도 있어요.',
    passageTranslated: 'Салом. Ман Минсу ҳастам. Ҳамаи оилаи мо кореягӣ ҳастанд. Падарам корманди ширкат аст. Модарам хонабону аст. Ман бародари калонӣ дорам. Бародарам милиса аст. Хоҳари хурдӣ ҳам дорам. Хоҳарам донишҷӯ аст. Сагбача ҳам дорем.',
    questions: [
      { question: '민수 씨 아버지는 경찰이에요?', questionTranslated: 'Падари Минсу милиса аст?', options: ['아니요, 회사원이에요', '네, 경찰이에요', '아니요, 의사예요'], correctIndex: 0, explanation: 'Матн: 우리 아버지는 회사원이에요.' },
      { question: '민수 씨는 형이 있어요?', questionTranslated: 'Минсу бародари калонӣ дорад?', options: ['네, 있어요', '아니요, 없어요', '아니요, 오빠가 있어요'], correctIndex: 0, explanation: 'Матн: 저는 형이 있어요.' },
      { question: '민수 씨 형은 경찰이에요?', questionTranslated: 'Бародари калонии Минсу милиса аст?', options: ['네, 경찰이에요', '아니요, 학생이에요', '아니요, 요리사예요'], correctIndex: 0, explanation: 'Матн: 형은 경찰이에요.' },
      { question: '민수 씨는 누나가 있어요?', questionTranslated: 'Минсу хоҳари калонӣ дорад?', options: ['아니요, 여동생이 있어요', '네, 누나가 있어요', '네, 언니가 있어요'], correctIndex: 0, explanation: 'Матн: 여동생도 있어요.' },
      { question: '«할머니» — 무슨 뜻이에요?', questionTranslated: '«할머니» чӣ маъно дорад?', options: ['бибӣ', 'бобо', 'модар'], correctIndex: 0, explanation: '할머니 = бибӣ.' },
      { question: '«형제» — 무슨 뜻이에요?', questionTranslated: '«형제» чӣ маъно дорад?', options: ['бародару хоҳар', 'падару модар', 'хешовандон'], correctIndex: 0, explanation: '형제 = бародару хоҳар.' },
    ],
  },
  {
    slot: 'test', speaker: '사라',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони модул',
    skillType: 'test', xpReward: 50, kind: 'reading', emoji: '🏆',
    title: '사라 씨의 가족', titleTranslated: 'Оилаи Сара',
    passage: '안녕하세요. 저는 사라예요. 한국 사람이에요. 저는 선생님이에요. 제 남편은 의사예요. 우리는 아이가 있어요. 아들은 학생이에요. 딸은 아기예요. 우리 가족은 모두 같이 살아요. 반갑습니다!',
    passageTranslated: 'Салом. Ман Сара ҳастам. Кореягӣ ҳастам. Ман муаллим ҳастам. Шавҳарам духтур аст. Мо фарзанд дорем. Писарам донишҷӯ аст. Духтарам кӯдаки навзод аст. Ҳамаи оилаи мо якҷоя зиндагӣ мекунем. Аз шиносоӣ шодам!',
    questions: [
      { question: '사라 씨 남편은 의사예요?', questionTranslated: 'Шавҳари Сара духтур аст?', options: ['네, 의사예요', '아니요, 선생님이에요', '아니요, 경찰이에요'], correctIndex: 0, explanation: 'Матн: 제 남편은 의사예요.' },
      { question: '사라 씨는 아들이 있어요?', questionTranslated: 'Сара писар дорад?', options: ['네, 있어요', '아니요, 없어요', '아니요, 여동생이 있어요'], correctIndex: 0, explanation: 'Матн: 아들은 학생이에요.' },
      { question: '사라 씨 아들은 선생님이에요?', questionTranslated: 'Писари Сара муаллим аст?', options: ['아니요, 학생이에요', '네, 선생님이에요', '아니요, 의사예요'], correctIndex: 0, explanation: 'Матн: 아들은 학생이에요.' },
      { question: '사라 씨 딸은 학생이에요?', questionTranslated: 'Духтари Сара донишҷӯ аст?', options: ['아니요, 아기예요', '네, 학생이에요', '아니요, 가수예요'], correctIndex: 0, explanation: 'Матн: 딸은 아기예요.' },
      { question: '무엇에 대한 글이에요?', questionTranslated: 'Матн дар бораи чист?', options: ['Оилаи Сара', 'Мактаби Сара', 'Хонаи Минсу'], correctIndex: 0, explanation: 'Сара дар бораи шавҳар ва фарзандонаш мегӯяд.' },
      { question: '«남편» — 무슨 뜻이에요?', questionTranslated: '«남편» чӣ маъно дорад?', options: ['шавҳар', 'бародар', 'писар'], correctIndex: 0, explanation: '남편 = шавҳар.' },
      { question: '«형» — ?', questionTranslated: 'Калимаи «형»-ро кӣ мегӯяд ва барои кӣ?', options: ['Писар — барои бародари калонӣ', 'Духтар — барои бародари калонӣ', 'Ҳама — барои бародари хурдӣ'], correctIndex: 0, explanation: '형 — бародари калонӣ, писар мегӯяд (духтар мегӯяд 오빠).' },
      { question: '«누나___ 있어요» — ___?', questionTranslated: 'Ба ҷои ___ чӣ меояд?', options: ['가', '이', '의'], correctIndex: 0, explanation: '누나 бо садонок тамом мешавад → 가.' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
// Сатрҳои Алӣ-ро хонанда мегӯяд (`isUser`).
export const DIALOGUE = {
  lessonTitle: '말하기: 가족 사진', lessonTitleTranslated: 'Муколама ва амалия',
  title: '가족 사진', titleTranslated: 'Акси оилавӣ',
  scenario: 'Бо ҳамсинфатон Юки аксҳои оилаи худро нишон медиҳед.', emoji: '🗣️',
  lines: [
    { speaker: '유키', text: '알리 씨, 가족 사진이에요?', translation: 'Алӣ, ин акси оилаатон аст?' },
    { speaker: '알리', text: '네, 우리 가족이에요.', translation: 'Бале, оилаи мо.', isUser: true },
    { speaker: '유키', text: '형제가 있어요?', translation: 'Бародару хоҳар доред?' },
    { speaker: '알리', text: '네, 누나가 있어요. 남동생도 있어요.', translation: 'Бале, хоҳари калонӣ дорам. Бародари хурдӣ ҳам дорам.', isUser: true },
    { speaker: '유키', text: '알리 씨 누나는 회사원이에요?', translation: 'Хоҳари калонии Алӣ корманди ширкат аст?' },
    { speaker: '알리', text: '네, 회사원이에요. 유키 씨는 형제가 있어요?', translation: 'Бале, корманди ширкат аст. Юки, шумо бародару хоҳар доред?', isUser: true },
    { speaker: '유키', text: '네, 오빠가 있어요. 언니도 있어요.', translation: 'Бале, бародари калонӣ дорам. Хоҳари калонӣ ҳам дорам.' },
    { speaker: '알리', text: '유키 씨 오빠는 직업이 뭐예요?', translation: 'Бародари калонии шумо чӣ кор мекунад?', isUser: true },
    { speaker: '유키', text: '요리사예요. 고양이도 있어요!', translation: 'Ошпаз аст. Гурба ҳам дорем!' },
    { speaker: '알리', text: '그래요? 저는 고양이가 없어요.', translation: 'Ҳамин тавр? Ман гурба надорам.', isUser: true },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
// Калимаҳои кӯтоҳи ҲАМИН модул; клавиатура блокро аз ҲАРФҲО месозад (hangul_compose.dart).
export const WRITING = {
  title: '쓰기 연습 3', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['가족', '아버지', '어머니', '누나', '언니', '동생', '아들', '집'],
};

export const ORDER = [
  'vocab:가족',
  'vocab:형과 누나',
  'vocab:오빠와 언니',
  'vocab:남편과 아이',
  'vocab:있어요, 없어요',
  // Грамматика БАЙНИ луғат, на се дарс паси ҳам (аудит: «девори грамматика») — мисли ar M3.
  'grammar:0',            // 이/가 있어요 — фавран баъди калимаҳои 있어요/없어요
  'vocab:친척',
  'grammar:2',            // 형/오빠/누나/언니
  'vocab:같이 살아요',
  'grammar:1',            // 의
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
