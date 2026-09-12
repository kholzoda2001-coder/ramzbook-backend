// TOPIK I · 1급 · Модули 2 — «나라와 직업» (Кишвар ва касб).
//
// Нақша: `Korean_TOPIK1_M2_Plan.md` (тасдиқи корбар 2026-09-11). Сохтор айнан мисли
// M1 ва M2-и en/ru: 7 луғат → 2 грамматика → хониш → шунавоӣ → муколама →
// навиштан → такрор → имтиҳон. Меъёри 1급: миллат, забон, касб (Sejong 1, 자기소개).
//
// Танҳо МАЪЛУМОТ — сохтан: `_ko-module-build.mjs`. Хониши тоҷикӣ аз `_ko-tajik.mjs`.
//
// ДУ ҚОИДАИ ҚАТЪӢ, ки билд пеш аз навиштан месанҷад (`_ko-coverage.mjs`):
//   1. Ҳар ҷумла танҳо аз калимаҳои M1 + M2 + номҳо сохта мешавад (калимаи
//      наомӯхта нест — хатои M1: 의사 бе омӯзиш).
//   2. Кишвар ва касби ҳар қаҳрамон дар ҳама ҷо як аст (`CHARACTERS`) — хатои M1:
//      Карим гоҳ муаллим, гоҳ донишҷӯ.

export const MODULE = {
  order: 1,
  title: '나라와 직업',
  titleTranslated: 'Кишвар ва касб',
  emoji: '🌏',
  canDoStatement: 'Пас аз ин бахш кишвар, забон ва касби худро гуфта, аз дигарон пурсида ва бо «не, … нест» ҷавоб дода метавонед.',
};

// Модулҳои пешина — калимаҳояшон «омӯхташуда» ҳисоб мешаванд.
export const KNOWN_FROM = ['./_ko-m1-content.mjs'];

// Қаҳрамонҳо — дар тамоми курс собит (ниг. нақша §2).
export const CHARACTERS = {
  '알리': { country: '타지키스탄', job: '학생' },
  '카림': { country: '타지키스탄', job: '학생' },
  '사라': { country: '한국', job: '선생님' },
  '민수': { country: '한국', job: '학생' },
  '안나': { country: '러시아', job: '의사' },
  '유키': { country: '일본', job: '간호사' },
  '왕밍': { country: '중국', job: '요리사' },
  '마이클': { country: '미국', job: '회사원' },
};
export const NAMES = Object.keys(CHARACTERS);

// Калимаҳои ДАСТУРИ савол (TOPIK), ки ҳамроҳи тарҷумаи тоҷикӣ меоянд, ва нишонаҳо.
export const EXTRA_KNOWN = ['무슨', '뜻이에요', '무엇에', '대한', '글이에요', '아', '이', '가', '은', '는'];

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
export const VOCAB = [
  {
    title: '여러 나라', titleTranslated: 'Кишварҳои ҷаҳон', emoji: '🌏',
    words: [
      { word: '미국', translation: 'Амрико', emoji: '🇺🇸', pos: 'noun', ipa: '/mi.guk̚/',
        example: '마이클 씨는 미국 사람이에요.', exampleTrans: 'Майкл амрикоӣ аст.' },
      { word: '중국', translation: 'Чин', emoji: '🇨🇳', pos: 'noun', ipa: '/tɕuŋ.guk̚/',
        example: '왕밍 씨는 중국 사람이에요.', exampleTrans: 'Ван Минг чинӣ аст.' },
      { word: '일본', translation: 'Ҷопон', emoji: '🇯🇵', pos: 'noun', ipa: '/il.bon/',
        example: '유키 씨는 일본 사람이에요.', exampleTrans: 'Юки ҷопонӣ аст.' },
      { word: '러시아', translation: 'Русия', emoji: '🇷🇺', pos: 'noun', ipa: '/ɾʌ.ɕi.a/',
        example: '안나 씨는 러시아 사람이에요.', exampleTrans: 'Анна аз Русия аст.' },
      { word: '영국', translation: 'Англия', emoji: '🇬🇧', pos: 'noun', ipa: '/jʌŋ.guk̚/',
        example: '영국 사람이에요? — 아니요, 미국 사람이에요.', exampleTrans: 'Англис ҳастед? — Не, амрикоӣ ҳастам.' },
      { word: '우즈베키스탄', translation: 'Ӯзбекистон', emoji: '🇺🇿', pos: 'noun', ipa: '/u.dʑɯ.be.kʰi.sɯ.tʰan/',
        example: '제 친구는 우즈베키스탄 사람이에요.', exampleTrans: 'Дӯсти ман аз Ӯзбекистон аст.' },
      { word: '카자흐스탄', translation: 'Қазоқистон', emoji: '🇰🇿', pos: 'noun', ipa: '/kʰa.dʑa.hɯ.sɯ.tʰan/',
        example: '카자흐스탄 사람이에요? — 네, 카자흐스탄 사람이에요.', exampleTrans: 'Аз Қазоқистон ҳастед? — Бале, аз Қазоқистон.' },
    ],
  },
  {
    title: '도시와 외국', titleTranslated: 'Шаҳр ва хориҷа', emoji: '🏙️',
    words: [
      { word: '서울', translation: 'Сеул', emoji: '🏙️', pos: 'noun', ipa: '/sʌ.ul/',
        example: '서울은 한국 도시예요.', exampleTrans: 'Сеул шаҳри Корея аст.' },
      { word: '두샨베', translation: 'Душанбе', emoji: '🏔️', pos: 'noun', ipa: '/tu.ɕan.be/',
        example: '저는 두샨베 사람이에요.', exampleTrans: 'Ман аз Душанбе ҳастам.' },
      { word: '도시', translation: 'шаҳр', emoji: '🌆', pos: 'noun', ipa: '/to.ɕi/',
        example: '두샨베는 타지키스탄 도시예요.', exampleTrans: 'Душанбе шаҳри Тоҷикистон аст.' },
      { word: '외국', translation: 'хориҷа', emoji: '✈️', pos: 'noun', ipa: '/we.guk̚/',
        example: '미국은 외국이에요.', exampleTrans: 'Амрико кишвари хориҷӣ аст.' },
      { word: '외국인', translation: 'хориҷӣ (одам)', emoji: '🧳', pos: 'noun', ipa: '/we.gu.gin/',
        example: '마이클 씨는 외국인이에요.', exampleTrans: 'Майкл хориҷӣ аст.' },
      { word: '어느', translation: 'кадом', emoji: '👆', pos: 'determiner', ipa: '/ʌ.nɯ/',
        example: '어느 도시 사람이에요?', exampleTrans: 'Аз кадом шаҳр ҳастед?' },
    ],
  },
  {
    title: '언어', titleTranslated: 'Забонҳо', emoji: '💬',
    words: [
      { word: '외국어', translation: 'забони хориҷӣ', emoji: '💬', pos: 'noun', ipa: '/we.gu.gʌ/',
        example: '영어는 외국어예요.', exampleTrans: 'Англисӣ забони хориҷӣ аст.' },
      { word: '영어', translation: 'англисӣ', emoji: '🔤', pos: 'noun', ipa: '/jʌŋ.ʌ/',
        example: '마이클은 영어 이름이에요.', exampleTrans: '«Майкл» номи англисӣ аст.' },
      { word: '중국어', translation: 'чинӣ', emoji: '🀄', pos: 'noun', ipa: '/tɕuŋ.gu.gʌ/',
        example: '왕밍 씨는 중국어 선생님이 아니에요. 요리사예요.', exampleTrans: 'Ван Минг муаллими забони чинӣ нест. Ошпаз аст.' },
      { word: '일본어', translation: 'ҷопонӣ', emoji: '🗾', pos: 'noun', ipa: '/il.bo.nʌ/',
        example: '유키 씨는 일본어 선생님이 아니에요. 간호사예요.', exampleTrans: 'Юки муаллими забони ҷопонӣ нест. Ҳамшира аст.' },
      { word: '러시아어', translation: 'русӣ', emoji: '🪆', pos: 'noun', ipa: '/ɾʌ.ɕi.a.ʌ/',
        example: '저는 러시아어 학생이에요.', exampleTrans: 'Ман донишҷӯи забони русӣ ҳастам.' },
      { word: '타지크어', translation: 'тоҷикӣ', emoji: '📝', pos: 'noun', ipa: '/tʰa.dʑi.kʰɯ.ʌ/',
        example: '알리는 타지크어 이름이에요.', exampleTrans: '«Алӣ» номи тоҷикӣ аст.' },
    ],
  },
  {
    title: '직업 1', titleTranslated: 'Касбҳо (1)', emoji: '💼',
    words: [
      { word: '직업', translation: 'касб', emoji: '🛠️', pos: 'noun', ipa: '/tɕi.gʌp̚/',
        example: '제 직업은 회사원이에요.', exampleTrans: 'Касби ман корманди ширкат аст.' },
      { word: '회사원', translation: 'корманди ширкат', emoji: '💼', pos: 'noun', ipa: '/hwe.sa.wʌn/',
        example: '마이클 씨는 회사원이에요.', exampleTrans: 'Майкл корманди ширкат аст.' },
      { word: '의사', translation: 'духтур', emoji: '🩺', pos: 'noun', ipa: '/ɯi.sa/',
        example: '안나 씨는 의사예요.', exampleTrans: 'Анна духтур аст.' },
      { word: '간호사', translation: 'ҳамшира', emoji: '💉', pos: 'noun', ipa: '/kan.ho.sa/',
        example: '유키 씨는 간호사예요.', exampleTrans: 'Юки ҳамшира аст.' },
      { word: '경찰', translation: 'милиса (полис)', emoji: '👮', pos: 'noun', ipa: '/kjʌŋ.tɕʰal/',
        example: '제 친구는 경찰이에요.', exampleTrans: 'Дӯсти ман милиса аст.' },
      { word: '요리사', translation: 'ошпаз', emoji: '🧑‍🍳', pos: 'noun', ipa: '/jo.ɾi.sa/',
        example: '왕밍 씨는 요리사예요.', exampleTrans: 'Ван Минг ошпаз аст.' },
      { word: '운전기사', translation: 'ронанда', emoji: '🚕', pos: 'noun', ipa: '/un.dʑʌn.gi.sa/',
        example: '운전기사예요? — 네, 운전기사예요.', exampleTrans: 'Ронанда ҳастед? — Бале, ронанда.' },
    ],
  },
  {
    title: '직업 2', titleTranslated: 'Касбҳо (2)', emoji: '🎤',
    words: [
      { word: '가수', translation: 'сароянда', emoji: '🎤', pos: 'noun', ipa: '/ka.su/',
        example: '한국 가수예요.', exampleTrans: 'Сарояндаи кореягӣ аст.' },
      { word: '배우', translation: 'ҳунарпеша', emoji: '🎬', pos: 'noun', ipa: '/pe.u/',
        example: '배우예요? — 아니요, 가수예요.', exampleTrans: 'Ҳунарпеша ҳастед? — Не, сароянда ҳастам.' },
      { word: '기자', translation: 'хабарнигор', emoji: '📰', pos: 'noun', ipa: '/ki.dʑa/',
        example: '저는 기자가 아니에요.', exampleTrans: 'Ман хабарнигор нестам.' },
      { word: '은행원', translation: 'корманди бонк', emoji: '🏧', pos: 'noun', ipa: '/ɯn.heŋ.wʌn/',
        example: '은행원이에요? — 아니요, 회사원이에요.', exampleTrans: 'Корманди бонк ҳастед? — Не, корманди ширкат ҳастам.' },
      { word: '주부', translation: 'хонабону', emoji: '🧺', pos: 'noun', ipa: '/tɕu.bu/',
        example: '주부예요? — 네, 주부예요.', exampleTrans: 'Хонабону ҳастед? — Бале, хонабону.' },
      { word: '농부', translation: 'деҳқон', emoji: '🧑‍🌾', pos: 'noun', ipa: '/noŋ.bu/',
        example: '카림 씨는 농부가 아니에요. 학생이에요.', exampleTrans: 'Карим деҳқон нест. Донишҷӯ аст.' },
    ],
  },
  {
    title: '일하는 곳', titleTranslated: 'Ҷои кор', emoji: '🏥',
    words: [
      { word: '회사', translation: 'ширкат', emoji: '🏢', pos: 'noun', ipa: '/hwe.sa/',
        example: '한국 회사예요.', exampleTrans: 'Ширкати кореягӣ аст.' },
      { word: '병원', translation: 'беморхона', emoji: '🏥', pos: 'noun', ipa: '/pjʌŋ.wʌn/',
        example: '병원이에요? — 네, 병원이에요.', exampleTrans: 'Беморхона аст? — Бале, беморхона.' },
      { word: '은행', translation: 'бонк', emoji: '🏦', pos: 'noun', ipa: '/ɯn.heŋ/',
        example: '은행이 아니에요. 병원이에요.', exampleTrans: 'Бонк нест. Беморхона аст.' },
      { word: '식당', translation: 'тарабхона', emoji: '🍽️', pos: 'noun', ipa: '/ɕik̚.t͈aŋ/',
        example: '한국 식당이에요.', exampleTrans: 'Тарабхонаи кореягӣ аст.' },
      { word: '학교', translation: 'мактаб', emoji: '🏫', pos: 'noun', ipa: '/hak̚.k͈jo/',
        example: '학교예요? — 아니요, 대학교예요.', exampleTrans: 'Мактаб аст? — Не, донишгоҳ аст.' },
      { word: '대학교', translation: 'донишгоҳ', emoji: '🎓', pos: 'noun', ipa: '/te.hak̚.k͈jo/',
        example: '저는 대학교 학생이에요.', exampleTrans: 'Ман донишҷӯи донишгоҳ ҳастам.' },
    ],
  },
  {
    title: '묻고 답하기', titleTranslated: 'Савол ва ҷавоб', emoji: '🤔',
    words: [
      { word: '직업이 뭐예요?', translation: 'Касбатон чист?', emoji: '🤔', pos: 'phrase', ipa: '/tɕi.gʌ.bi mwʌ.e.jo/',
        example: '안나 씨, 직업이 뭐예요? — 의사예요.', exampleTrans: 'Анна, касбатон чист? — Духтур.' },
      { word: '어느 나라 사람이에요?', translation: 'Шумо аз кадом кишвар ҳастед?', emoji: '🌐', pos: 'phrase', ipa: '/ʌ.nɯ na.ɾa sa.ɾa.mi.e.jo/',
        example: '유키 씨는 어느 나라 사람이에요?', exampleTrans: 'Юки аз кадом кишвар аст?' },
      { word: '아니에요', translation: '… нест', emoji: '🙅', pos: 'verb', ipa: '/a.ni.e.jo/',
        example: '아니요, 학생이 아니에요.', exampleTrans: 'Не, донишҷӯ нестам.' },
      { word: '그래요?', translation: 'Ҳамин тавр?', emoji: '😮', pos: 'phrase', ipa: '/kɯ.ɾe.jo/',
        example: '저는 의사예요. — 그래요?', exampleTrans: 'Ман духтур ҳастам. — Ҳамин тавр?' },
      { word: '저도', translation: 'ман ҳам', emoji: '➕', pos: 'pronoun', ipa: '/tɕʌ.do/',
        example: '저도 학생이에요.', exampleTrans: 'Ман ҳам донишҷӯ ҳастам.' },
      { word: '반가워요', translation: 'Шодам! (гуфтугӯӣ)', emoji: '😄', pos: 'phrase', ipa: '/pan.ga.wʌ.jo/',
        example: '반가워요, 유키 씨!', exampleTrans: 'Шодам, Юки!' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
export const GRAMMAR = [
  {
    lessonTitle: '문법: 이에요/예요', lessonTitleTranslated: 'Грамматика: 이에요/예요 («…аст»)',
    title: '명사 + 이에요/예요', titleTranslated: 'Исм + 이에요/예요 («…аст», шакли ҳаррӯза)',
    emoji: '🧩',
    explanation:
`Дар Модули 1 **입니다**-ро омӯхтед — шакли **расмӣ**. Дар гуфтугӯи ҳаррӯза кореягиҳо бештар **이에요/예요** мегӯянд. Маъно ҳамон аст: «…аст / …ҳастам».

- 저는 학생**입니다**. — расмӣ
- 저는 학생**이에요**. — ҳаррӯза, боэҳтиром

**Кадомашро гузорем?** Ҳамон қоидаи 은/는 — ба ҳиҷои охир нигоҳ кунед:

- Ҳиҷои охир дар таг ҳарф дорад → **이에요**: 학생**이에요**, 회사원**이에요**
- Ҳиҷои охир таг надорад → **예요**: 의사**예요**, 가수**예요**

**Савол** — ҳамон шакл, танҳо овозро дар охир боло баред:

- 학생**이에요**? — Донишҷӯ ҳастед?
- 네, 학생**이에요**. — Бале, донишҷӯ ҳастам.

Хониш: 예 пас аз садонок «э» садо медиҳад — 의사예요 «ыйсаэё».`,
    rules: [
      { pattern: 'Исм (бо ҳамсадо) + 이에요', note: '학생이에요, 회사원이에요 — блоки охир дар таг ҳарф дорад.' },
      { pattern: 'Исм (бо садонок) + 예요', note: '의사예요, 가수예요 — блоки охир таг надорад.' },
      { pattern: '… 이에요/예요?', note: 'Савол: ҳамон шакл бо оҳанги боло — 학생이에요?' },
    ],
    examples: [
      { sentence: '저는 학생이에요.', translation: 'Ман донишҷӯ ҳастам.', highlight: '이에요' },
      { sentence: '안나 씨는 의사예요.', translation: 'Анна духтур аст.', highlight: '예요' },
      { sentence: '마이클 씨는 미국 사람이에요.', translation: 'Майкл амрикоӣ аст.', highlight: '이에요' },
      { sentence: '직업이 뭐예요?', translation: 'Касбатон чист?', highlight: '예요' },
      { sentence: '왕밍 씨는 요리사예요.', translation: 'Ван Минг ошпаз аст.', highlight: '예요' },
    ],
    exercises: [
      { prompt: '저는 회사원___.', promptTranslated: 'Ман корманди ширкат ҳастам.', answer: '이에요', options: ['이에요', '예요', '는', '은'], explanation: '회사원 бо ㄴ тамом мешавад → 이에요.' },
      { prompt: '유키 씨는 간호사___.', promptTranslated: 'Юки ҳамшира аст.', answer: '예요', options: ['예요', '이에요', '은', '는'], explanation: '간호사 бо садонок тамом мешавад → 예요.' },
      { prompt: '왕밍 씨는 중국 사람___.', promptTranslated: 'Ван Минг чинӣ аст.', answer: '이에요', options: ['예요', '이에요', '는', '은'], explanation: '사람 бо ㅁ тамом мешавад → 이에요.' },
      { prompt: '안나 씨는 의사___.', promptTranslated: 'Анна духтур аст.', answer: '예요', options: ['이에요', '은', '예요', '는'], explanation: '의사 бо садонок тамом мешавад → 예요.' },
      { prompt: '학생___?', promptTranslated: 'Донишҷӯ ҳастед?', answer: '이에요', options: ['이에요', '예요', '은', '는'], explanation: 'Савол ҳам ҳамон шакл: 학생 + 이에요?' },
      { prompt: '제 친구는 가수___.', promptTranslated: 'Дӯсти ман сароянда аст.', answer: '예요', options: ['예요', '이에요', '은', '는'], explanation: '가수 бо садонок тамом мешавад → 예요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Майкл амрикоӣ аст.', answer: '마이클 씨는 미국 사람이에요.', options: ['사람이에요', '마이클', '씨는', '미국'], explanation: '이에요 ҳамеша дар охир: 마이클 씨는 미국 사람이에요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Касби ман ошпаз аст.', answer: '제 직업은 요리사예요.', options: ['요리사예요', '제', '직업은'], explanation: 'Мавзӯъ (제 직업은) дар аввал, 예요 дар охир.' },
    ],
  },
  {
    lessonTitle: '문법: 이/가 아니에요', lessonTitleTranslated: 'Грамматика: 이/가 아니에요 («…нест»)',
    title: '명사 + 이/가 아니에요', titleTranslated: 'Исм + 이/가 아니에요 («…нест»)',
    emoji: '🚫',
    explanation:
`**아니에요** = «нест / нестам». Пеш аз он исм бо **이** ё **가** меояд:

- Ҳиҷои охир дар таг ҳарф дорад → **이 아니에요**: 학생**이 아니에요**
- Ҳиҷои охир таг надорад → **가 아니에요**: 의사**가 아니에요**

Боз ҳамон қоидаи таг — мисли 은/는 ва 이에요/예요.

Ҷавоби пурра ба савол:

- 의사예요? — **아니요**, 의사**가 아니에요**. 간호사예요.
- (Духтур ҳастед? — Не, духтур нестам. Ҳамшира ҳастам.)

Диққат: **아니요** = «не» (ҷавоб), **아니에요** = «… нест» (охири ҷумла). Ҳарду дар як ҷавоб меоянд.

이/가 дар Модули 3 ҳамчун нишонаи фоил боз меояд; ҳоло онро танҳо дар ҳамин қолаб омӯзед.`,
    rules: [
      { pattern: 'Исм (бо ҳамсадо) + 이 아니에요', note: '학생이 아니에요, 한국 사람이 아니에요.' },
      { pattern: 'Исм (бо садонок) + 가 아니에요', note: '의사가 아니에요, 가수가 아니에요.' },
      { pattern: '아니요, … 이/가 아니에요. … 이에요/예요.', note: 'Ҷавоби пурра: «не, … нест; … аст».' },
    ],
    examples: [
      { sentence: '저는 의사가 아니에요.', translation: 'Ман духтур нестам.', highlight: '가 아니에요' },
      { sentence: '유키 씨는 의사가 아니에요. 간호사예요.', translation: 'Юки духтур нест. Ҳамшира аст.', highlight: '가 아니에요' },
      { sentence: '마이클 씨는 영국 사람이 아니에요.', translation: 'Майкл англис нест.', highlight: '이 아니에요' },
      { sentence: '회사원이에요? — 아니요, 회사원이 아니에요.', translation: 'Корманди ширкат ҳастед? — Не, корманди ширкат нестам.', highlight: '이 아니에요' },
      { sentence: '저는 한국 사람이 아니에요.', translation: 'Ман кореягӣ нестам.', highlight: '이 아니에요' },
    ],
    exercises: [
      { prompt: '저는 의사___ 아니에요.', promptTranslated: 'Ман духтур нестам.', answer: '가', options: ['가', '이', '는', '은'], explanation: '의사 бо садонок тамом мешавад → 가 아니에요.' },
      { prompt: '카림 씨는 선생님___ 아니에요.', promptTranslated: 'Карим муаллим нест.', answer: '이', options: ['이', '가', '은', '는'], explanation: '선생님 бо ㅁ тамом мешавад → 이 아니에요.' },
      { prompt: '왕밍 씨는 일본 사람___ 아니에요.', promptTranslated: 'Ван Минг ҷопонӣ нест.', answer: '이', options: ['가', '이', '는', '은'], explanation: '사람 бо ㅁ тамом мешавад → 이 아니에요.' },
      { prompt: '안나 씨는 간호사가 ___. 의사예요.', promptTranslated: 'Анна ҳамшира нест. Духтур аст.', answer: '아니에요', options: ['아니에요', '이에요', '예요', '아니요'], explanation: 'Инкор дар охири ҷумла → 아니에요.' },
      { prompt: '의사예요? — ___, 의사가 아니에요.', promptTranslated: 'Духтур ҳастед? — Не, духтур нестам.', answer: '아니요', options: ['아니요', '아니에요', '네', '예요'], explanation: '«Не» дар аввали ҷавоб → 아니요.' },
      { prompt: '마이클 씨는 가수___ 아니에요. 회사원이에요.', promptTranslated: 'Майкл сароянда нест. Корманди ширкат аст.', answer: '가', options: ['이', '가', '은', '는'], explanation: '가수 бо садонок тамом мешавад → 가 아니에요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ман кореягӣ нестам.', answer: '저는 한국 사람이 아니에요.', options: ['사람이', '아니에요', '저는', '한국'], explanation: '아니에요 ҳамеша дар охир: 저는 한국 사람이 아니에요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Юки духтур нест.', answer: '유키 씨는 의사가 아니에요.', options: ['의사가', '유키', '아니에요', '씨는'], explanation: 'Исм + 가, баъд 아니에요: 유키 씨는 의사가 아니에요.' },
    ],
  },
];

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
// `speaker` — кӣ «저»-ро мегӯяд (барои санҷиши қаҳрамонҳо).
export const COMPREHENSIONS = [
  {
    slot: 'reading', speaker: '안나',
    lessonTitle: '읽기: 안나 씨', lessonTitleTranslated: 'Хониш: Анна',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: '안나 씨의 자기소개', titleTranslated: 'Муаррифии Анна',
    passage: '안녕하세요. 저는 안나예요. 러시아 사람이에요. 제 직업은 의사예요. 제 친구 이름은 유키예요. 유키 씨는 일본 사람이에요. 유키 씨는 의사가 아니에요. 간호사예요.',
    passageTranslated: 'Салом. Ман Анна ҳастам. Аз Русия ҳастам. Касби ман духтур аст. Номи дӯстам Юки аст. Юки ҷопонӣ аст. Юки духтур нест. Ҳамшира аст.',
    questions: [
      { question: '안나 씨는 어느 나라 사람이에요?', questionTranslated: 'Анна аз кадом кишвар аст?', options: ['러시아 사람', '일본 사람', '한국 사람'], correctIndex: 0, explanation: 'Матн: 러시아 사람이에요.' },
      // Ҷавоби саволҳои ҳа/не ҳам «네», ҳам «아니요» — вагарна «ҳеҷ гоҳ 네-ро назан» қолаб мешуд (аудит).
      { question: '유키 씨는 간호사예요?', questionTranslated: 'Юки ҳамшира аст?', options: ['네, 간호사예요', '아니요, 의사예요', '아니요, 요리사예요'], correctIndex: 0, explanation: 'Матн: 유키 씨는 … 간호사예요.' },
      { question: '유키 씨는 어느 나라 사람이에요?', questionTranslated: 'Юки аз кадом кишвар аст?', options: ['일본 사람', '중국 사람', '러시아 사람'], correctIndex: 0, explanation: 'Матн: 유키 씨는 일본 사람이에요.' },
    ],
  },
  {
    slot: 'listening', speaker: '왕밍',
    lessonTitle: '듣기: 왕밍 씨', lessonTitleTranslated: 'Шунавоӣ: Ван Минг',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: '왕밍 씨의 자기소개', titleTranslated: 'Ван Минг худро муаррифӣ мекунад',
    passage: '안녕하세요. 저는 왕밍이에요. 중국 사람이에요. 저는 학생이 아니에요. 요리사예요. 한국 식당 요리사예요. 제 친구는 마이클 씨예요. 마이클 씨는 미국 사람이에요. 회사원이에요. 반가워요!',
    passageTranslated: 'Салом. Ман Ван Минг ҳастам. Чинӣ ҳастам. Ман донишҷӯ нестам. Ошпаз ҳастам. Ошпази тарабхонаи кореягӣ ҳастам. Дӯсти ман Майкл аст. Майкл амрикоӣ аст. Корманди ширкат аст. Шодам!',
    questions: [
      { question: '남자는 어느 나라 사람이에요?', questionTranslated: 'Мард аз кадом кишвар аст?', options: ['중국 사람', '일본 사람', '미국 사람'], correctIndex: 0, explanation: 'Матн: 중국 사람이에요.' },
      { question: '왕밍 씨는 학생이에요?', questionTranslated: 'Ван Минг донишҷӯ аст?', options: ['아니요, 요리사예요', '네, 학생이에요', '아니요, 의사예요'], correctIndex: 0, explanation: 'Матн: 저는 학생이 아니에요. 요리사예요.' },
      { question: '마이클 씨는 어느 나라 사람이에요?', questionTranslated: 'Майкл аз кадом кишвар аст?', options: ['미국 사람', '영국 사람', '중국 사람'], correctIndex: 0, explanation: 'Матн: 마이클 씨는 미국 사람이에요.' },
      { question: '마이클 씨는 요리사예요?', questionTranslated: 'Майкл ошпаз аст?', options: ['아니요, 회사원이에요', '네, 요리사예요', '아니요, 기자예요'], correctIndex: 0, explanation: 'Матн: 회사원이에요.' },
    ],
  },
  {
    slot: 'review', speaker: '민수',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30, kind: 'reading', emoji: '🔄',
    title: '나라와 직업 복습', titleTranslated: 'Такрор: кишвар ва касб',
    passage: '안녕하세요. 저는 민수예요. 한국 사람이에요. 학생이에요. 알리 씨는 제 친구예요. 알리 씨는 타지키스탄 사람이에요. 안나 씨는 러시아 사람이에요. 의사예요. 유키 씨는 일본 사람이에요. 간호사예요. 감사합니다.',
    passageTranslated: 'Салом. Ман Минсу ҳастам. Кореягӣ ҳастам. Донишҷӯ ҳастам. Алӣ дӯсти ман аст. Алӣ тоҷикистонӣ аст. Анна аз Русия аст. Духтур аст. Юки ҷопонӣ аст. Ҳамшира аст. Ташаккур.',
    questions: [
      { question: '민수 씨는 어느 나라 사람이에요?', questionTranslated: 'Минсу аз кадом кишвар аст?', options: ['한국 사람', '일본 사람', '타지키스탄 사람'], correctIndex: 0, explanation: 'Матн: 한국 사람이에요.' },
      { question: '알리 씨는 누구예요?', questionTranslated: 'Алӣ кист?', options: ['민수 씨 친구', '민수 씨 선생님', '의사'], correctIndex: 0, explanation: 'Матн: 알리 씨는 제 친구예요.' },
      { question: '안나 씨는 의사예요?', questionTranslated: 'Анна духтур аст?', options: ['네, 의사예요', '아니요, 간호사예요', '아니요, 학생이에요'], correctIndex: 0, explanation: 'Матн: 안나 씨는 … 의사예요.' },
      { question: '유키 씨는 어느 나라 사람이에요?', questionTranslated: 'Юки аз кадом кишвар аст?', options: ['일본 사람', '러시아 사람', '한국 사람'], correctIndex: 0, explanation: 'Матн: 유키 씨는 일본 사람이에요.' },
      { question: '«의사» — 무슨 뜻이에요?', questionTranslated: '«의사» чӣ маъно дорад?', options: ['духтур', 'ҳамшира', 'ошпаз'], correctIndex: 0, explanation: '의사 = духтур.' },
      { question: '«외국인» — 무슨 뜻이에요?', questionTranslated: '«외국인» чӣ маъно дорад?', options: ['хориҷӣ (одам)', 'кишвар', 'шаҳр'], correctIndex: 0, explanation: '외국인 = одами хориҷӣ.' },
    ],
  },
  {
    slot: 'test', speaker: '마이클',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони модул',
    skillType: 'test', xpReward: 50, kind: 'reading', emoji: '🏆',
    title: '마이클 씨의 자기소개', titleTranslated: 'Муаррифии Майкл',
    passage: '안녕하세요. 제 이름은 마이클이에요. 저는 미국 사람이에요. 영국 사람이 아니에요. 제 직업은 회사원이에요. 선생님이 아니에요. 제 친구 이름은 왕밍이에요. 왕밍 씨는 중국 사람이에요. 요리사예요. 반가워요!',
    passageTranslated: 'Салом. Номи ман Майкл аст. Ман амрикоӣ ҳастам. Англис нестам. Касби ман корманди ширкат аст. Муаллим нестам. Номи дӯстам Ван Минг аст. Ван Минг чинӣ аст. Ошпаз аст. Шодам!',
    questions: [
      { question: '마이클 씨는 어느 나라 사람이에요?', questionTranslated: 'Майкл аз кадом кишвар аст?', options: ['미국 사람', '영국 사람', '중국 사람'], correctIndex: 0, explanation: 'Матн: 저는 미국 사람이에요. 영국 사람이 아니에요.' },
      { question: '마이클 씨는 선생님이에요?', questionTranslated: 'Майкл муаллим аст?', options: ['아니요, 회사원이에요', '네, 선생님이에요', '아니요, 요리사예요'], correctIndex: 0, explanation: 'Матн: 제 직업은 회사원이에요. 선생님이 아니에요.' },
      { question: '왕밍 씨는 누구예요?', questionTranslated: 'Ван Минг кист?', options: ['마이클 씨 친구', '마이클 씨 선생님', '마이클 씨 학생'], correctIndex: 0, explanation: 'Матн: 제 친구 이름은 왕밍이에요.' },
      { question: '왕밍 씨는 요리사예요?', questionTranslated: 'Ван Минг ошпаз аст?', options: ['네, 요리사예요', '아니요, 의사예요', '아니요, 회사원이에요'], correctIndex: 0, explanation: 'Матн: 왕밍 씨는 … 요리사예요.' },
      { question: '무엇에 대한 글이에요?', questionTranslated: 'Матн дар бораи чист?', options: ['Кишвар ва касби Майкл', 'Шаҳри Сеул', 'Беморхона ва бонк'], correctIndex: 0, explanation: 'Майкл кишвар ва касби худ ва дӯсташро мегӯяд.' },
      { question: '«회사원» — 무슨 뜻이에요?', questionTranslated: '«회사원» чӣ маъно дорад?', options: ['корманди ширкат', 'корманди бонк', 'ронанда'], correctIndex: 0, explanation: '회사원 = корманди ширкат.' },
      { question: '«반가워요» — 무슨 뜻이에요?', questionTranslated: '«반가워요» чӣ маъно дорад?', options: ['Шодам!', 'Ташаккур', 'Бубахшед'], correctIndex: 0, explanation: '반가워요 = Шодам (аз шиносоӣ).' },
      { question: '«영국 사람___ 아니에요» — ___?', questionTranslated: 'Ба ҷои ___ чӣ меояд?', options: ['이', '가', '은'], correctIndex: 0, explanation: '사람 бо ㅁ тамом мешавад → 이 아니에요.' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
// Сатрҳои Алӣ-ро хонанда мегӯяд (`isUser`).
export const DIALOGUE = {
  lessonTitle: '말하기: 어느 나라 사람이에요?', lessonTitleTranslated: 'Муколама ва амалия',
  title: '어느 나라 사람이에요?', titleTranslated: 'Аз кадом кишвар ҳастед?',
  scenario: 'Дар курси забони кореягӣ дар Душанбе бо ҳамсинфи нав — Анна шинос мешавед.', emoji: '🗣️',
  lines: [
    { speaker: '안나', text: '안녕하세요. 저는 안나예요.', translation: 'Салом. Ман Анна ҳастам.' },
    { speaker: '알리', text: '안녕하세요. 저는 알리예요. 반가워요.', translation: 'Салом. Ман Алӣ ҳастам. Шодам.', isUser: true },
    { speaker: '안나', text: '저도 반가워요. 알리 씨는 어느 나라 사람이에요?', translation: 'Ман ҳам шодам. Алӣ, шумо аз кадом кишвар ҳастед?' },
    { speaker: '알리', text: '저는 타지키스탄 사람이에요. 두샨베 사람이에요.', translation: 'Ман тоҷикистонӣ ҳастам. Аз Душанбе.', isUser: true },
    { speaker: '안나', text: '그래요? 저는 러시아 사람이에요.', translation: 'Ҳамин тавр? Ман аз Русия ҳастам.' },
    { speaker: '알리', text: '안나 씨는 학생이에요?', translation: 'Анна, шумо донишҷӯ ҳастед?', isUser: true },
    { speaker: '안나', text: '아니요, 학생이 아니에요. 의사예요.', translation: 'Не, донишҷӯ нестам. Духтур ҳастам.' },
    { speaker: '알리', text: '아, 의사예요?', translation: 'А, духтур ҳастед?', isUser: true },
    { speaker: '안나', text: '네. 알리 씨는 직업이 뭐예요?', translation: 'Бале. Алӣ, касбатон чист?' },
    { speaker: '알리', text: '저는 대학교 학생이에요.', translation: 'Ман донишҷӯи донишгоҳ ҳастам.', isUser: true },
    { speaker: '안나', text: '제 친구 유키 씨는 간호사예요. 일본 사람이에요.', translation: 'Дӯсти ман Юки ҳамшира аст. Ҷопонӣ аст.' },
    { speaker: '알리', text: '그래요? 안나 씨, 감사합니다!', translation: 'Ҳамин тавр? Анна, ташаккур!', isUser: true },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
// Калимаҳои ду-ҳиҷоии ҲАМИН модул: клавиатура блокро аз ҲАРФҲО месозад
// (ㅇ+ㅣ+ㄹ → 일, ㅂ+ㅗ+ㄴ → 본), ниг. `frontend/lib/utils/hangul_compose.dart`.
export const WRITING = {
  title: '쓰기 연습 2', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['미국', '중국', '일본', '의사', '가수', '회사', '병원', '학교'],
};

export const ORDER = [
  'vocab:여러 나라',
  'vocab:도시와 외국',
  'vocab:언어',
  'vocab:직업 1',
  'vocab:직업 2',
  'vocab:일하는 곳',
  'vocab:묻고 답하기',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
