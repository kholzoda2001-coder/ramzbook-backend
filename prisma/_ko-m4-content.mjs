// TOPIK I · 1급 · Модули 4 — «숫자와 물건 사기» (Рақамҳо ва харид).
//
// Ҳаҷм мисли M4-и en/ru «Рақамҳо ва вақт» (17 дарс, 53 калима); вақт/рӯз/моҳ дар
// нақшаи мо M5–M6 аст. Меъёри 1급: рақамҳои 일·이·삼 (нарх, телефон), 이/그/저, 주세요
// (Sejong 1, 4과 «물건 사기»). Зинаи GROWING: ҷойи холӣ ва диктант (аудио) пайдо мешаванд.
//
// Танҳо МАЪЛУМОТ — сохтан: `_ko-module-build.mjs`. Хониши рақамҳо: `_ko-tajik.mjs`
// (칠십 «чхилшшип», 십육 «шимнюк»).
//
// ҚОИДАҲОИ ҚАТЪӢ (`_ko-coverage.mjs`, пеш аз навиштан):
//   1. Ҳар ҷумла танҳо аз калимаҳои M1–M4 ва номҳо; рақами мураккаб (삼천) — агар ҳар
//      ҳиҷояш омӯхта бошад.
//   2. Қаҳрамонҳо ва оилаҳо собит (`CHARACTERS`, `FAMILY` — айнан мисли M3).
// ⚠️ 을/를 (M8), 에/에서 (M7), 와/과/하고 (M10), рақамҳои 하나·둘 ва 개/잔/병 (M5) — НЕСТ.
// Грамматика байни луғат (аудити M3).

export const MODULE = {
  order: 3,
  title: '숫자와 물건 사기',
  titleTranslated: 'Рақамҳо ва харид',
  emoji: '🛒',
  canDoStatement: 'Пас аз ин бахш рақамҳоро то 100 000 гуфта, нархро пурсида («얼마예요?»), чизро бо «… 주세요» харида ва рақами телефони худро гуфта метавонед.',
};

export const KNOWN_FROM = ['./_ko-m1-content.mjs', './_ko-m2-content.mjs', './_ko-m3-content.mjs'];

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

export const FAMILY = {
  '알리': { 아버지: { job: '운전기사' }, 어머니: { job: '선생님' }, 할머니: {}, 누나: { job: '회사원' }, 남동생: { job: '학생' } },
  '민수': { 아버지: { job: '회사원' }, 어머니: { job: '주부' }, 형: { job: '경찰' }, 여동생: { job: '학생' }, 강아지: {} },
  '유키': { 오빠: { job: '요리사' }, 언니: { job: '가수' }, 고양이: {} },
  '사라': { 남편: { job: '의사' }, 아들: { job: '학생' }, 딸: {} },
  '카림': { 아버지: { job: '농부' }, 어머니: { job: '주부' } },
};

// 그 (+ исм) дар грамматикаи «이/그/저» омӯзонда мешавад, на дар луғат (이 = рақами 2 ва 저 = «ман»
// аллакай маълуманд). Ҳамаи ҷумлаҳои 그 + исм ПАС аз ҳамон дарс меоянд (ORDER).
export const EXTRA_KNOWN = ['무슨', '뜻이에요', '무엇에', '대한', '글이에요', '이', '가', '은', '는', '의', '그'];

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
export const VOCAB = [
  {
    title: '숫자 1', titleTranslated: 'Рақамҳо 1–5', emoji: '1️⃣',
    words: [
      { word: '일', translation: 'як (1)', emoji: '1️⃣', pos: 'numeral', ipa: '/il/',
        example: '일, 이, 삼, 사, 오!', exampleTrans: 'Як, ду, се, чор, панҷ!' },
      { word: '이', translation: 'ду (2)', emoji: '2️⃣', pos: 'numeral', ipa: '/i/',
        example: '이, 사, 육, 팔!', exampleTrans: 'Ду, чор, шаш, ҳашт!' },
      { word: '삼', translation: 'се (3)', emoji: '3️⃣', pos: 'numeral', ipa: '/sam/',
        example: '빵은 삼 소모니예요.', exampleTrans: 'Нон се сомонӣ аст.' },
      { word: '사', translation: 'чор (4)', emoji: '4️⃣', pos: 'numeral', ipa: '/sa/',
        example: '차는 사 소모니예요.', exampleTrans: 'Чой чор сомонӣ аст.' },
      { word: '오', translation: 'панҷ (5)', emoji: '5️⃣', pos: 'numeral', ipa: '/o/',
        example: '우유는 오 소모니예요.', exampleTrans: 'Шир панҷ сомонӣ аст.' },
    ],
  },
  {
    title: '숫자 2', titleTranslated: 'Рақамҳо 6–10', emoji: '🔟',
    words: [
      { word: '육', translation: 'шаш (6)', emoji: '6️⃣', pos: 'numeral', ipa: '/juk̚/',
        example: '육, 칠, 팔, 구, 십!', exampleTrans: 'Шаш, ҳафт, ҳашт, нӯҳ, даҳ!' },
      { word: '칠', translation: 'ҳафт (7)', emoji: '7️⃣', pos: 'numeral', ipa: '/tɕʰil/',
        example: '책은 칠 소모니예요.', exampleTrans: 'Китоб ҳафт сомонӣ аст.' },
      { word: '팔', translation: 'ҳашт (8)', emoji: '8️⃣', pos: 'numeral', ipa: '/pʰal/',
        example: '우산은 팔 소모니예요.', exampleTrans: 'Чатр ҳашт сомонӣ аст.' },
      { word: '구', translation: 'нӯҳ (9)', emoji: '9️⃣', pos: 'numeral', ipa: '/ku/',
        example: '구 소모니예요? — 네, 구 소모니예요.', exampleTrans: 'Нӯҳ сомонӣ аст? — Бале, нӯҳ сомонӣ.' },
      { word: '십', translation: 'даҳ (10)', emoji: '🔟', pos: 'numeral', ipa: '/ɕip̚/',
        example: '옷은 십 소모니예요.', exampleTrans: 'Либос даҳ сомонӣ аст.' },
    ],
  },
  {
    title: '큰 숫자', titleTranslated: 'Рақамҳои калон', emoji: '💯',
    words: [
      { word: '백', translation: 'сад (100)', emoji: '💯', pos: 'numeral', ipa: '/pek̚/',
        example: '백 원이에요? — 네, 백 원이에요.', exampleTrans: 'Сад вон аст? — Бале, сад вон.' },
      { word: '천', translation: 'ҳазор (1 000)', emoji: '🧮', pos: 'numeral', ipa: '/tɕʰʌn/',
        example: '사과는 천 원이에요.', exampleTrans: 'Себ ҳазор вон аст.' },
      { word: '만', translation: 'даҳ ҳазор (10 000)', emoji: '📊', pos: 'numeral', ipa: '/man/',
        example: '옷은 만 원이에요.', exampleTrans: 'Либос даҳ ҳазор вон аст.' },
      { word: '공', translation: 'сифр (дар рақами телефон)', emoji: '0️⃣', pos: 'numeral', ipa: '/koŋ/',
        example: '공, 일, 공!', exampleTrans: 'Сифр, як, сифр!' },
      { word: '번호', translation: 'рақам (№)', emoji: '#️⃣', pos: 'noun', ipa: '/pʌn.ho/',
        example: '카드 번호 뭐예요?', exampleTrans: 'Рақами корт чист?' },
    ],
  },
  {
    title: '돈', titleTranslated: 'Пул ва нарх', emoji: '💵',
    words: [
      { word: '돈', translation: 'пул', emoji: '💵', pos: 'noun', ipa: '/ton/',
        example: '저는 돈 없어요.', exampleTrans: 'Ман пул надорам.' },
      { word: '원', translation: 'вон (пули Корея)', emoji: '💴', pos: 'noun', ipa: '/wʌn/',
        example: '오백 원 있어요?', exampleTrans: 'Панҷсад вон доред?' },
      { word: '소모니', translation: 'сомонӣ (пули Тоҷикистон)', emoji: '🪙', pos: 'noun', ipa: '/so.mo.ni/',
        example: '타지키스탄 돈은 소모니, 한국 돈은 원.', exampleTrans: 'Пули Тоҷикистон — сомонӣ, пули Корея — вон.' },
      { word: '얼마예요', translation: 'Чанд пул аст?', emoji: '🏷️', pos: 'phrase', ipa: '/ʌl.ma.e.jo/',
        example: '이거 얼마예요? — 천 원이에요.', exampleTrans: 'Ин чанд пул аст? — Ҳазор вон.' },
      { word: '비싸요', translation: 'қимат аст', emoji: '💎', pos: 'adjective', ipa: '/pi.s͈a.jo/',
        example: '비싸요? — 아니요, 싸요!', exampleTrans: 'Қимат аст? — Не, арзон!' },
      { word: '싸요', translation: 'арзон аст', emoji: '📉', pos: 'adjective', ipa: '/s͈a.jo/',
        example: '천 원이에요? 싸요!', exampleTrans: 'Ҳазор вон? Арзон аст!' },
    ],
  },
  {
    title: '가게', titleTranslated: 'Мағозаҳо', emoji: '🏪',
    words: [
      { word: '가게', translation: 'мағоза', emoji: '🏪', pos: 'noun', ipa: '/ka.ge/',
        example: '가게 이름이 뭐예요?', exampleTrans: 'Номи мағоза чист?' },
      { word: '시장', translation: 'бозор', emoji: '🥬', pos: 'noun', ipa: '/ɕi.dʑaŋ/',
        example: '시장 사과는 싸요.', exampleTrans: 'Себи бозор арзон аст.' },
      { word: '마트', translation: 'супермаркет', emoji: '🛒', pos: 'noun', ipa: '/ma.tʰɯ/',
        example: '마트 커피는 비싸요?', exampleTrans: 'Қаҳваи супермаркет қимат аст?' },
      { word: '편의점', translation: 'дӯкони шабонарӯзӣ', emoji: '🏬', pos: 'noun', ipa: '/pʰjʌ.ni.dʑʌm/',
        example: '편의점 커피는 싸요.', exampleTrans: 'Қаҳваи дӯкони шабонарӯзӣ арзон аст.' },
      { word: '빵집', translation: 'нонвойхона', emoji: '🥐', pos: 'noun', ipa: '/p͈aŋ.dʑip̚/',
        example: '빵집 커피도 있어요?', exampleTrans: 'Нонвойхона қаҳва ҳам дорад?' },
      { word: '카드', translation: 'корт (бонкӣ)', emoji: '💳', pos: 'noun', ipa: '/kʰa.dɯ/',
        example: '카드 있어요? — 네, 있어요.', exampleTrans: 'Корт доред? — Бале, дорам.' },
    ],
  },
  {
    title: '이거, 그거, 저거', titleTranslated: 'Ин, ҳамон, ана он', emoji: '👇',
    words: [
      { word: '이거', translation: 'ин (чиз)', emoji: '👇', pos: 'pronoun', ipa: '/i.gʌ/',
        example: '이거 주세요. 감사합니다.', exampleTrans: 'Инро диҳед. Ташаккур.' },
      { word: '그거', translation: 'ҳамон (назди шумо)', emoji: '🫵', pos: 'pronoun', ipa: '/kɯ.gʌ/',
        example: '그거 얼마예요? — 이거요? 만 원이에요.', exampleTrans: 'Он (дар дасти шумо) чанд пул аст? — Ин? Даҳ ҳазор вон.' },
      { word: '저거', translation: 'ана он (дуртар)', emoji: '🔭', pos: 'pronoun', ipa: '/tɕʌ.gʌ/',
        example: '저거 뭐예요? — 우산이에요.', exampleTrans: 'Ана он чист? — Чатр аст.' },
      { word: '여기', translation: 'ин ҷо', emoji: '📍', pos: 'pronoun', ipa: '/jʌ.gi/',
        example: '여기 우유 있어요?', exampleTrans: 'Ин ҷо шир ҳаст?' },
      { word: '거기', translation: 'ҳамон ҷо', emoji: '🧭', pos: 'pronoun', ipa: '/kʌ.gi/',
        example: '거기 빵집 있어요?', exampleTrans: 'Ҳамон ҷо нонвойхона ҳаст?' },
      { word: '저기', translation: 'ана он ҷо', emoji: '🌄', pos: 'pronoun', ipa: '/tɕʌ.gi/',
        example: '저기 편의점 있어요.', exampleTrans: 'Ана он ҷо дӯкони шабонарӯзӣ ҳаст.' },
    ],
  },
  {
    title: '음식', titleTranslated: 'Хӯрок ва нӯшокӣ', emoji: '☕',
    words: [
      { word: '물', translation: 'об', emoji: '💧', pos: 'noun', ipa: '/mul/',
        example: '여기 물 주세요.', exampleTrans: 'Лутфан, ба ин ҷо об диҳед.' },
      { word: '커피', translation: 'қаҳва', emoji: '☕', pos: 'noun', ipa: '/kʰʌ.pʰi/',
        example: '커피 있어요? — 네, 있어요.', exampleTrans: 'Қаҳва доред? — Бале, дорем.' },
      { word: '차', translation: 'чой', emoji: '🍵', pos: 'noun', ipa: '/tɕʰa/',
        example: '차 주세요. — 네, 여기 있어요.', exampleTrans: 'Чой диҳед. — Бале, марҳамат.' },
      { word: '빵', translation: 'нон', emoji: '🍞', pos: 'noun', ipa: '/p͈aŋ/',
        example: '빵 있어요? — 아니요, 없어요.', exampleTrans: 'Нон доред? — Не, надорем.' },
      { word: '우유', translation: 'шир', emoji: '🥛', pos: 'noun', ipa: '/u.ju/',
        example: '저는 우유 사요.', exampleTrans: 'Ман шир мехарам.' },
      { word: '사과', translation: 'себ', emoji: '🍎', pos: 'noun', ipa: '/sa.gwa/',
        example: '이 사과 얼마예요?', exampleTrans: 'Ин себ чанд пул аст?' },
    ],
  },
  {
    title: '물건', titleTranslated: 'Чизҳо', emoji: '👜',
    words: [
      { word: '가방', translation: 'сумка', emoji: '👜', pos: 'noun', ipa: '/ka.baŋ/',
        example: '저 가방 얼마예요?', exampleTrans: 'Ана он сумка чанд пул аст?' },
      { word: '책', translation: 'китоб', emoji: '📕', pos: 'noun', ipa: '/tɕʰek̚/',
        example: '한국어 책 있어요?', exampleTrans: 'Китоби забони кореягӣ доред?' },
      { word: '옷', translation: 'либос', emoji: '👕', pos: 'noun', ipa: '/ot̚/',
        example: '옷 사요? — 네, 사요.', exampleTrans: 'Либос мехаред? — Бале, мехарам.' },
      { word: '신발', translation: 'пойафзол', emoji: '👟', pos: 'noun', ipa: '/ɕin.bal/',
        example: '이 신발 비싸요?', exampleTrans: 'Ин пойафзол қимат аст?' },
      { word: '우산', translation: 'чатр', emoji: '☂️', pos: 'noun', ipa: '/u.san/',
        example: '우산 있어요? — 네, 여기 있어요.', exampleTrans: 'Чатр доред? — Бале, марҳамат.' },
      { word: '시계', translation: 'соат', emoji: '⌚', pos: 'noun', ipa: '/ɕi.ge/',
        example: '저 시계 비싸요.', exampleTrans: 'Ана он соат қимат аст.' },
    ],
  },
  {
    title: '가게에서', titleTranslated: 'Дар мағоза', emoji: '🛍️',
    words: [
      { word: '주세요', translation: '… диҳед (лутфан)', emoji: '🤲', pos: 'verb', ipa: '/tɕu.se.jo/',
        example: '커피 주세요. 빵도 주세요.', exampleTrans: 'Қаҳва диҳед. Нон ҳам диҳед.' },
      { word: '사요', translation: 'мехарам', emoji: '🛍️', pos: 'verb', ipa: '/sa.jo/',
        example: '빵 사요? — 네, 사요.', exampleTrans: 'Нон мехаред? — Бале, мехарам.' },
      { word: '어서 오세요', translation: 'Хуш омадед!', emoji: '🚪', pos: 'phrase', ipa: '/ʌ.sʌ o.se.jo/',
        example: '어서 오세요!', exampleTrans: 'Хуш омадед!' },
      { word: '여기 있어요', translation: 'Марҳамат (ана)', emoji: '🫴', pos: 'phrase', ipa: '/jʌ.gi i.s͈ʌ.jo/',
        example: '여기 있어요. — 감사합니다.', exampleTrans: 'Марҳамат. — Ташаккур.' },
      { word: '전화번호', translation: 'рақами телефон', emoji: '📞', pos: 'noun', ipa: '/tɕʌ.nwa.bʌn.ho/',
        example: '전화번호 뭐예요? — 공일공 오칠팔구 일이삼사예요.', exampleTrans: 'Рақами телефон чанд аст? — 010-5789-1234.' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
export const GRAMMAR = [
  {
    lessonTitle: '문법: 숫자', lessonTitleTranslated: 'Грамматика: рақамҳои 일·이·삼',
    title: '한자어 숫자 (일, 이, 삼…)', titleTranslated: 'Рақамҳои 일, 이, 삼… (нарх ва телефон)',
    emoji: '🔢',
    explanation:
`Кореягӣ **ду силсилаи рақам** дорад. Ҳоло аввалинашро меомӯзем — **일, 이, 삼…** Он барои **нарх, пул ва рақами телефон** аст. (Силсилаи дуюм — 하나, 둘… — дар Модули 5.)

**Рақамҳои калон аз хурдҳо сохта мешаванд**, мисли тоҷикии «се сад»:

- 이십 = 2 × 10 = 20 · 삼십오 = 3 × 10 + 5 = 35
- 오백 = 500 · 삼천 = 3 000 · 이만 = 20 000

**Диққат:** 100, 1 000 ва 10 000 бе 일 гуфта мешаванд — **백**, **천**, **만**.

**만 = 10 000.** Кореягиҳо пули калонро бо **даҳ ҳазор** мешуморанд: 이만 원 = 20 000 вон, 삼만 원 = 30 000 вон.

**Нарх:** рақам + **원**: 천 원, 오천 원, 만 원.
**Рақами телефон:** рақам ба рақам, 0 = **공**: 공일공 = 010.

Хониш: 칠십 «чхилшшип», 팔십 «пхалшшип» (пас аз ㄹ ҳарфи ㅅ сахт мешавад); 십육 «шимнюк» (пеш аз 육 «н» пайдо мешавад).`,
    rules: [
      { pattern: '10 × рақам + рақам', note: '이십 = 20, 삼십오 = 35.' },
      { pattern: '100 = 백, 1 000 = 천, 10 000 = 만', note: 'Бе 일: 백, 천, 만. 20 000 = 이만.' },
      { pattern: 'Рақам + 원', note: 'Нарх: 오천 원 — 5 000 вон.' },
    ],
    examples: [
      { sentence: '커피는 삼천 원이에요.', translation: 'Қаҳва се ҳазор вон аст.', highlight: '삼천' },
      { sentence: '가방은 이만 원이에요.', translation: 'Сумка бист ҳазор вон аст.', highlight: '이만' },
      { sentence: '제 전화번호는 공일공 오칠팔구 일이삼사예요.', translation: 'Рақами телефони ман 010-5789-1234 аст.', highlight: '공일공' },
      { sentence: '물은 오백 원이에요.', translation: 'Об панҷсад вон аст.', highlight: '오백' },
      { sentence: '신발은 삼만 오천 원이에요.', translation: 'Пойафзол 35 000 вон аст.', highlight: '삼만 오천' },
    ],
    exercises: [
      { prompt: '20 = ___', promptTranslated: 'Бист', answer: '이십', options: ['이십', '십이', '이백', '이천'], explanation: '20 = 2 × 10 → 이십 (십이 = 12).' },
      { prompt: '100 = ___', promptTranslated: 'Сад', answer: '백', options: ['백', '천', '만', '십'], explanation: '100 = 백 (бе 일).' },
      { prompt: '10 000 = ___', promptTranslated: 'Даҳ ҳазор', answer: '만', options: ['만', '천', '십만', '백'], explanation: '10 000 = 만 (бе 일). 십만 = 100 000.' },
      { prompt: '35 = ___', promptTranslated: 'Сию панҷ', answer: '삼십오', options: ['삼십오', '오십삼', '삼백오', '삼오'], explanation: '35 = 3 × 10 + 5 → 삼십오.' },
      { prompt: '가방은 ___ 원이에요.', promptTranslated: 'Сумка 5 000 вон аст.', answer: '오천', options: ['오천', '오백', '오만', '오십'], explanation: '5 000 = 5 × 1 000 → 오천.' },
      { prompt: '전화번호: 공일공 = ___', promptTranslated: 'Рақами телефон: 공일공', answer: '010', options: ['010', '101', '100', '001'], explanation: '공 = 0, 일 = 1 → 공일공 = 010.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Қаҳва се ҳазор вон аст.', answer: '커피는 삼천 원이에요.', options: ['원이에요', '커피는', '삼천'], explanation: 'Чиз (은/는) → рақам → 원이에요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Пойафзол сӣ ҳазор вон аст.', answer: '신발은 삼만 원이에요.', options: ['삼만', '신발은', '원이에요'], explanation: '30 000 = 삼만 → 신발은 삼만 원이에요.' },
    ],
  },
  {
    lessonTitle: '문법: 이/그/저', lessonTitleTranslated: 'Грамматика: 이 / 그 / 저 — «ин», «ҳамон», «ана он»',
    title: '이 / 그 / 저 + 명사', titleTranslated: 'Ин / ҳамон / ана он + исм',
    emoji: '👉',
    explanation:
`Тоҷикӣ ду калима дорад — «ин» ва «он». Кореягӣ **се** дорад:

- **이** — ин (назди **ман**): 이 가방 — ин сумка
- **그** — ҳамон (назди **шумо**): 그 책 — ҳамон китоб (дар дасти шумо)
- **저** — ана он (**дур** аз ҳардуи мо): 저 가게 — ана он мағоза

Бе исм — «ин чиз» — дар гуфтугӯ: **이거**, **그거**, **저거**.

Ҷой: **여기** (ин ҷо), **거기** (ҳамон ҷо), **저기** (ана он ҷо).

Агар касе дар бораи чизи дар дасташ пурсад — «이거 뭐예요?» — ҷавоб бо **그거** аст: «그거 사과예요» (он дар дасти ӯст, на дар дасти шумо).

⚠️ **이** ҳам ду маъно дорад: рақами **2** (이천 원 = 2 000 вон) ва **«ин»** (이 가방 = ин сумка). Пеш аз 십/백/천/만 — рақам; пеш аз исм — «ин».

⚠️ **저** ду маъно дорад: **저는** = «ман» (Модули 1), **저 가게** = «ана он мағоза». Пас аз «ман» 는/도 меояд, пас аз «ана он» — исм.`,
    rules: [
      { pattern: '이 / 그 / 저 + исм', note: '이 가방 · 그 책 · 저 가게.' },
      { pattern: '이거 / 그거 / 저거', note: '«Ин чиз / ҳамон / ана он» — бе исм.' },
      { pattern: '여기 / 거기 / 저기', note: 'Ин ҷо · ҳамон ҷо · ана он ҷо.' },
    ],
    examples: [
      { sentence: '이 가방은 만 원이에요.', translation: 'Ин сумка даҳ ҳазор вон аст.', highlight: '이' },
      { sentence: '그 책은 한국어 책이에요.', translation: 'Ҳамон китоб китоби забони кореягӣ аст.', highlight: '그' },
      { sentence: '저 가게는 빵집이에요.', translation: 'Ана он мағоза нонвойхона аст.', highlight: '저' },
      { sentence: '이거 얼마예요?', translation: 'Ин чанд пул аст?', highlight: '이거' },
      { sentence: '저기가 시장이에요.', translation: 'Ана он ҷо бозор аст.', highlight: '저기' },
    ],
    exercises: [
      { prompt: '___ 가방은 비싸요.', promptTranslated: 'Ин сумка (дар дасти ман) қимат аст.', answer: '이', options: ['이', '그', '저', '여기'], explanation: 'Назди ман → 이.' },
      { prompt: '___ 책은 얼마예요?', promptTranslated: 'Ҳамон китоб (дар дасти шумо) чанд пул аст?', answer: '그', options: ['이', '그', '저', '거기'], explanation: 'Назди шумо → 그.' },
      { prompt: '___ 가게는 편의점이에요.', promptTranslated: 'Ана он мағоза (дуртар) дӯкони шабонарӯзӣ аст.', answer: '저', options: ['저', '이', '그', '저기'], explanation: 'Дур аз ҳардуи мо → 저.' },
      { prompt: '___ 주세요.', promptTranslated: 'Инро диҳед.', answer: '이거', options: ['이거', '이', '여기', '그'], explanation: 'Бе исм «инро» → 이거.' },
      { prompt: '___가 시장이에요.', promptTranslated: 'Ана он ҷо бозор аст.', answer: '저기', options: ['저기', '저거', '저', '여기'], explanation: 'Ҷой, дур → 저기.' },
      { prompt: '이거 뭐예요? — ___ 사과예요.', promptTranslated: 'Ин чист? — Он (дар дасти шумо) себ аст.', answer: '그거', options: ['그거', '이거', '저거', '여기'], explanation: 'Чиз дар дасти пурсанда аст → 그거.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ин сумка чанд пул аст?', answer: '이 가방은 얼마예요?', options: ['얼마예요', '가방은', '이'], explanation: '이 пеш аз исм: 이 가방은 얼마예요?' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ана он мағоза арзон аст.', answer: '저 가게는 싸요.', options: ['싸요', '가게는', '저'], explanation: '저 пеш аз исм: 저 가게는 싸요.' },
    ],
  },
  {
    lessonTitle: '문법: 주세요', lessonTitleTranslated: 'Грамматика: … 주세요, 얼마예요?, … 있어요?',
    title: '명사 + 주세요', titleTranslated: 'Исм + 주세요 («… диҳед») · 얼마예요? · … 있어요?',
    emoji: '🤲',
    explanation:
`Дар мағоза се ибора кифоя аст:

- **… 주세요.** — … диҳед (лутфан): 물 주세요. — Об диҳед. 이거 주세요. — Инро диҳед.
- **얼마예요?** — Чанд пул аст?: 이거 얼마예요? — 천 원이에요.
- **… 있어요?** — … доред? (Модули 3): 우유 있어요? — 네, 있어요. / 아니요, 없어요.

**주세요** боэҳтиром аст — дар мағоза, тарабхона ва бо калонсолон ҳамин шаклро гӯед.

Фурӯшанда мегӯяд: **어서 오세요!** — Хуш омадед! Ва ҳангоми додан: **여기 있어요.** — Марҳамат.`,
    rules: [
      { pattern: 'Исм + 주세요', note: 'Лутфан диҳед: 커피 주세요.' },
      { pattern: '… 얼마예요?', note: 'Нарх: 이거 얼마예요?' },
      { pattern: '… 있어요? / 없어요', note: 'Доред? — 네, 있어요 / 아니요, 없어요.' },
    ],
    examples: [
      { sentence: '물 주세요.', translation: 'Об диҳед.', highlight: '주세요' },
      { sentence: '이거 얼마예요? — 천 원이에요.', translation: 'Ин чанд пул аст? — Ҳазор вон.', highlight: '얼마예요' },
      { sentence: '우유 있어요? — 아니요, 없어요.', translation: 'Шир доред? — Не, надорем.', highlight: '있어요' },
      { sentence: '어서 오세요!', translation: 'Хуш омадед!', highlight: '어서 오세요' },
      { sentence: '여기 있어요. — 감사합니다.', translation: 'Марҳамат. — Ташаккур.', highlight: '여기 있어요' },
    ],
    exercises: [
      { prompt: '커피 ___.', promptTranslated: 'Қаҳва диҳед.', answer: '주세요', options: ['주세요', '있어요', '얼마예요', '없어요'], explanation: '«… диҳед» → 주세요.' },
      { prompt: '이거 ___? — 삼천 원이에요.', promptTranslated: 'Ин чанд пул аст? — Се ҳазор вон.', answer: '얼마예요', options: ['얼마예요', '주세요', '뭐예요', '있어요'], explanation: 'Ҷавоб нарх аст → савол 얼마예요?' },
      { prompt: '우유 ___? — 네, 있어요.', promptTranslated: 'Шир доред? — Бале, дорем.', answer: '있어요', options: ['있어요', '주세요', '얼마예요', '뭐예요'], explanation: '«… доред?» → 있어요?' },
      { prompt: '___! — 안녕하세요.', promptTranslated: 'Хуш омадед! — Салом.', answer: '어서 오세요', options: ['어서 오세요', '여기 있어요', '주세요', '감사합니다'], explanation: 'Фурӯшанда харидорро пешвоз мегирад → 어서 오세요.' },
      { prompt: '___. — 감사합니다.', promptTranslated: 'Марҳамат (ана). — Ташаккур.', answer: '여기 있어요', options: ['여기 있어요', '어서 오세요', '얼마예요', '주세요'], explanation: 'Ҳангоми додани чиз → 여기 있어요.' },
      { prompt: '사과 있어요? — 아니요, ___.', promptTranslated: 'Себ доред? — Не, надорем.', answer: '없어요', options: ['없어요', '있어요', '주세요', '아니에요'], explanation: '«Надорем» → 없어요 (на 아니에요).' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ин чатр чанд пул аст?', answer: '이 우산 얼마예요?', options: ['얼마예요', '우산', '이'], explanation: '이 + исм + 얼마예요?' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Қаҳваи дӯкони шабонарӯзӣ арзон аст.', answer: '편의점 커피는 싸요.', options: ['싸요', '커피는', '편의점'], explanation: 'Ҷой пеш аз чиз: 편의점 커피는 싸요.' },
    ],
  },
];

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
export const COMPREHENSIONS = [
  {
    slot: 'reading', speaker: '민수',
    lessonTitle: '읽기: 민수 씨의 쇼핑', lessonTitleTranslated: 'Хониш: Минсу харид мекунад',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: '민수 씨의 쇼핑', titleTranslated: 'Минсу харид мекунад',
    passage: '안녕하세요. 저는 민수예요. 여기는 시장이에요. 시장은 싸요. 이 가방은 만 원이에요. 싸요! 저 신발은 오만 원이에요. 비싸요. 저는 가방 사요. 사과도 사요. 사과는 삼천 원이에요.',
    passageTranslated: 'Салом. Ман Минсу ҳастам. Ин ҷо бозор аст. Бозор арзон аст. Ин сумка даҳ ҳазор вон аст. Арзон! Ана он пойафзол панҷоҳ ҳазор вон аст. Қимат. Ман сумка мехарам. Себ ҳам мехарам. Себ се ҳазор вон аст.',
    questions: [
      { question: '가방은 얼마예요?', questionTranslated: 'Сумка чанд пул аст?', options: ['만 원', '오만 원', '삼천 원'], correctIndex: 0, explanation: 'Матн: 이 가방은 만 원이에요.' },
      { question: '신발은 싸요?', questionTranslated: 'Пойафзол арзон аст?', options: ['아니요, 비싸요', '네, 싸요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 저 신발은 오만 원이에요. 비싸요.' },
      { question: '민수 씨는 사과도 사요?', questionTranslated: 'Минсу себ ҳам мехарад?', options: ['네, 사요', '아니요, 신발 사요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 사과도 사요.' },
    ],
  },
  {
    slot: 'listening',
    lessonTitle: '듣기: 편의점', lessonTitleTranslated: 'Шунавоӣ: Дар дӯкони шабонарӯзӣ',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: '편의점에서', titleTranslated: 'Дар дӯкони шабонарӯзӣ',
    passage: '어서 오세요! 여기는 편의점이에요. 물은 오백 원이에요. 커피는 이천 원이에요. 빵은 천오백 원이에요. 우유는 없어요. 죄송합니다. 감사합니다!',
    passageTranslated: 'Хуш омадед! Ин ҷо дӯкони шабонарӯзӣ аст. Об панҷсад вон аст. Қаҳва ду ҳазор вон аст. Нон ҳазору панҷсад вон аст. Шир надорем. Бубахшед. Ташаккур!',
    questions: [
      { question: '물은 얼마예요?', questionTranslated: 'Об чанд пул аст?', options: ['오백 원', '이천 원', '천오백 원'], correctIndex: 0, explanation: 'Матн: 물은 오백 원이에요.' },
      { question: '커피는 얼마예요?', questionTranslated: 'Қаҳва чанд пул аст?', options: ['이천 원', '오백 원', '이만 원'], correctIndex: 0, explanation: 'Матн: 커피는 이천 원이에요.' },
      { question: '우유 있어요?', questionTranslated: 'Шир ҳаст?', options: ['아니요, 없어요', '네, 있어요', '네, 천 원이에요'], correctIndex: 0, explanation: 'Матн: 우유는 없어요.' },
      { question: '빵은 천오백 원이에요?', questionTranslated: 'Нон ҳазору панҷсад вон аст?', options: ['네, 천오백 원이에요', '아니요, 오백 원이에요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 빵은 천오백 원이에요.' },
    ],
  },
  {
    slot: 'review', speaker: '카림',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30, kind: 'reading', emoji: '🔄',
    title: '숫자와 물건 사기 복습', titleTranslated: 'Такрор: рақамҳо ва харид',
    passage: '안녕하세요. 저는 카림이에요. 제 전화번호는 공구삼 일이삼 사오육칠이에요. 시장 사과는 싸요. 사과는 천 원이에요. 우유는 이천 원이에요. 저는 사과 사요. 타지키스탄 돈은 소모니예요. 한국 돈은 원이에요.',
    passageTranslated: 'Салом. Ман Карим ҳастам. Рақами телефони ман 093-123-4567 аст. Себи бозор арзон аст. Себ ҳазор вон аст. Шир ду ҳазор вон аст. Ман себ мехарам. Пули Тоҷикистон сомонӣ аст. Пули Корея вон аст.',
    questions: [
      { question: '카림 씨 전화번호는 뭐예요?', questionTranslated: 'Рақами телефони Карим чанд аст?', options: ['공구삼 일이삼 사오육칠', '공일공 오칠팔구 일이삼사', '공구삼 사오육칠 일이삼'], correctIndex: 0, explanation: 'Матн: 제 전화번호는 공구삼 일이삼 사오육칠이에요.' },
      { question: '사과는 얼마예요?', questionTranslated: 'Себ чанд пул аст?', options: ['천 원', '이천 원', '만 원'], correctIndex: 0, explanation: 'Матн: 사과는 천 원이에요.' },
      { question: '우유는 얼마예요?', questionTranslated: 'Шир чанд пул аст?', options: ['이천 원이에요', '천 원이에요', '오백 원이에요'], correctIndex: 0, explanation: 'Матн: 우유는 이천 원이에요.' },
      { question: '타지키스탄 돈은 원이에요?', questionTranslated: 'Пули Тоҷикистон вон аст?', options: ['아니요, 소모니예요', '네, 원이에요', '아니요, 카드예요'], correctIndex: 0, explanation: 'Матн: 타지키스탄 돈은 소모니예요.' },
      { question: '«비싸요» — 무슨 뜻이에요?', questionTranslated: '«비싸요» чӣ маъно дорад?', options: ['қимат аст', 'арзон аст', 'пул надорам'], correctIndex: 0, explanation: '비싸요 = қимат аст.' },
      { question: '«만» — 무슨 뜻이에요?', questionTranslated: '«만» чӣ маъно дорад?', options: ['10 000', '1 000', '100'], correctIndex: 0, explanation: '만 = 10 000.' },
    ],
  },
  {
    slot: 'test', speaker: '안나',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони модул',
    skillType: 'test', xpReward: 50, kind: 'reading', emoji: '🏆',
    title: '안나 씨의 쇼핑', titleTranslated: 'Анна харид мекунад',
    passage: '안녕하세요. 저는 안나예요. 여기는 옷 가게예요. 이 옷은 삼만 원이에요. 비싸요. 이 신발은 이만 원이에요. 저 가방은 만 원이에요. 싸요! 저는 가방 사요. 카드 있어요. 감사합니다!',
    passageTranslated: 'Салом. Ман Анна ҳастам. Ин ҷо мағозаи либос аст. Ин либос сӣ ҳазор вон аст. Қимат. Ин пойафзол бист ҳазор вон аст. Ана он сумка даҳ ҳазор вон аст. Арзон! Ман сумка мехарам. Корт дорам. Ташаккур!',
    questions: [
      { question: '옷은 얼마예요?', questionTranslated: 'Либос чанд пул аст?', options: ['삼만 원', '이만 원', '만 원'], correctIndex: 0, explanation: 'Матн: 이 옷은 삼만 원이에요.' },
      { question: '신발은 얼마예요?', questionTranslated: 'Пойафзол чанд пул аст?', options: ['이만 원', '삼만 원', '만 원'], correctIndex: 0, explanation: 'Матн: 이 신발은 이만 원이에요.' },
      { question: '가방은 비싸요?', questionTranslated: 'Сумка қимат аст?', options: ['아니요, 싸요', '네, 비싸요', '아니요, 없어요'], correctIndex: 0, explanation: 'Матн: 저 가방은 만 원이에요. 싸요!' },
      { question: '안나 씨는 가방 사요?', questionTranslated: 'Анна сумка мехарад?', options: ['네, 사요', '아니요, 옷 사요', '아니요, 신발 사요'], correctIndex: 0, explanation: 'Матн: 저는 가방 사요.' },
      { question: '무엇에 대한 글이에요?', questionTranslated: 'Матн дар бораи чист?', options: ['Анна дар мағоза харид мекунад', 'Оилаи Анна', 'Анна дар беморхона'], correctIndex: 0, explanation: 'Анна нархҳоро мегӯяд ва сумка мехарад.' },
      { question: '«30 000 원» — ?', questionTranslated: '30 000 вон бо кореягӣ чӣ тавр аст?', options: ['삼만 원', '삼천 원', '삼십 원'], correctIndex: 0, explanation: '30 000 = 3 × 10 000 → 삼만.' },
      { question: '«싸요» — 무슨 뜻이에요?', questionTranslated: '«싸요» чӣ маъно дорад?', options: ['арзон аст', 'қимат аст', 'мехарам'], correctIndex: 0, explanation: '싸요 = арзон аст.' },
      { question: '«이거 ___? — 천 원이에요.»', questionTranslated: 'Ба ҷои ___ чӣ меояд?', options: ['얼마예요', '주세요', '있어요'], correctIndex: 0, explanation: 'Ҷавоб нарх аст → 얼마예요?' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
// Сатрҳои Алӣ-ро хонанда мегӯяд (`isUser`). 점원 = фурӯшанда (дар сенария шарҳ дода мешавад).
export const DIALOGUE = {
  lessonTitle: '말하기: 빵집에서', lessonTitleTranslated: 'Муколама ва амалия',
  title: '빵집에서', titleTranslated: 'Дар нонвойхона',
  scenario: 'Шумо дар нонвойхона нон ва қаҳва мехаред. Фурӯшанда (점원) шуморо пешвоз мегирад.', emoji: '🗣️',
  lines: [
    { speaker: '점원', text: '어서 오세요!', translation: 'Хуш омадед!' },
    { speaker: '알리', text: '안녕하세요. 이 빵 얼마예요?', translation: 'Салом. Ин нон чанд пул аст?', isUser: true },
    { speaker: '점원', text: '그 빵은 천오백 원이에요.', translation: 'Он нон ҳазору панҷсад вон аст.' },
    { speaker: '알리', text: '커피 있어요?', translation: 'Қаҳва доред?', isUser: true },
    { speaker: '점원', text: '네, 있어요. 커피는 삼천 원이에요.', translation: 'Бале, дорем. Қаҳва се ҳазор вон аст.' },
    { speaker: '알리', text: '빵 주세요. 커피도 주세요.', translation: 'Нон диҳед. Қаҳва ҳам диҳед.', isUser: true },
    { speaker: '점원', text: '사천오백 원이에요.', translation: 'Чор ҳазору панҷсад вон мешавад.' },
    { speaker: '알리', text: '카드 여기 있어요.', translation: 'Ана корт, марҳамат.', isUser: true },
    { speaker: '점원', text: '감사합니다. 안녕히 가세요!', translation: 'Ташаккур. Хайр!' },
    { speaker: '알리', text: '안녕히 계세요!', translation: 'Хайр!', isUser: true },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
export const WRITING = {
  title: '쓰기 연습 4', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['삼', '오', '백', '천', '만', '돈', '빵', '우유'],
};

export const ORDER = [
  'vocab:숫자 1',
  'vocab:숫자 2',
  'vocab:큰 숫자',
  'grammar:0',            // рақамҳо — баъди ҳамаи калимаҳои рақам
  'vocab:돈',
  'vocab:가게',
  'vocab:이거, 그거, 저거',
  'grammar:1',            // 이/그/저 — фавран баъди 이거/그거/저거
  'vocab:음식',
  'vocab:물건',
  'vocab:가게에서',
  'grammar:2',            // 주세요 — баъди ибораҳои мағоза
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
