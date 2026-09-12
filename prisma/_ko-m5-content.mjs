// TOPIK I · 1급 · Модули 5 — «시간과 하루» (Вақт ва рӯзи ҳаррӯза).
//
// МАНБАЪҲО (санҷида 2026-09-12):
//   • Sejong Korean 1 (НИИЛ/King Sejong Institute), боби 2 «일상생활»: -아요/어요, 에 가다;
//     луғат 일하다, 자다, 공부하다, 전화하다, 운동하다; «지금 뭐 해요?».
//   • Sejong Korean 1, боби 8 «시간»: 에 (вақт), ○시 ○분; 오전/오후/아침/점심/저녁;
//     «지금 몇 시예요?» — «다섯 시 오 분이에요». Соат — рақами КОРЕЯГӢ (세 시),
//     дақиқа — рақами ХИТОИЮ КОРЕЯГӢ (삼십 분).
//   • Стандарти байналмилалии NIKL (국제 통용 한국어 표준 교육과정): 1급 = 735 калима,
//     45 қолаби грамматика; мавзӯи 1급 — ҳаёти ҳаррӯза (일상생활).
// Ҳаҷм мисли M5-и en/ru/ar «Корҳои рӯзмарра» (15–16 дарс, 38–49 калима) + вақт, ки
// дар en/ru дар M4 буд, дар мо дар M5 (M4-и мо — рақам ва харид).
//
// Танҳо МАЪЛУМОТ — сохтан: `_ko-module-build.mjs`.
//
// ҚОИДАҲОИ ҚАТЪӢ (`_ko-coverage.mjs`, пеш аз навиштан):
//   1. Ҳар ҷумла танҳо аз калимаҳои M1–M5 ва номҳо.
//   2. Қаҳрамонҳо ва оилаҳо собит (`CHARACTERS`, `FAMILY` — айнан мисли M3–M4).
// ⚠️ 을/를 (M8) НЕСТ: дар гуфтугӯ пасванди объект одатан меафтад (빵 먹어요, 커피 마셔요) —
//    ҳамон тавре ки M4 «빵 사요» дошт. 에서 (M7), 안 (M8), 하고 (M10) — НЕСТ.
// ⚠️ 에 танҳо БАЪДИ дарси грамматикаи 에 (ORDER) дар мисолҳо меояд.
// Грамматика байни луғат, ҳеҷ гоҳ паси ҳам (аудити M3).

export const MODULE = {
  order: 4,
  title: '시간과 하루',
  titleTranslated: 'Вақт ва рӯзи ҳаррӯза',
  emoji: '⏰',
  canDoStatement: 'Пас аз ин бахш то даҳ бо рақамҳои кореягӣ шумурда, вақтро пурсида ва гуфта («몇 시예요?» — «세 시 반이에요»), рӯзи худро нақл карда («일곱 시에 일어나요») ва дар бораи корҳои ҳаррӯза пурсида метавонед.',
};

export const KNOWN_FROM = ['./_ko-m1-content.mjs', './_ko-m2-content.mjs', './_ko-m3-content.mjs', './_ko-m4-content.mjs'];

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

// Дар грамматика омӯзонда мешаванд, на дар луғат:
//   • шакли кӯтоҳи рақам пеш аз 시: 한 두 세 (네 = «бале» аллакай маълум) · 11–12: 열한 열두;
//   • шакли луғатии феъл (-다) — дарси «-아요/어요» аз ҳамин шакл сар мешавад;
//   • намунаҳои ХАТОИ сарф — ТАНҲО ҳамчун варианти нодуруст дар машқҳои ҳамон дарс
//     (мисли «goed»-и англисӣ), ҳеҷ гоҳ дар ҷумла.
export const EXTRA_KNOWN = ['무슨', '뜻이에요', '무엇에', '대한', '글이에요', '이', '가', '은', '는', '의', '그', '에',
  '한', '두', '세', '열한', '열두',
  '가다', '오다', '먹다', '마시다', '공부하다', '일하다', '보다', '자다', '만나다', '일어나다', '읽다', '씻다', '쉬다',
  '가어요', '가해요', '먹아요', '먹요', '공부하요', '공부하어요', '오어요', '와어요'];

// ── Дарсҳои луғат ───────────────────────────────────────────────────────────
export const VOCAB = [
  {
    title: '고유어 숫자 1', titleTranslated: 'Рақамҳои кореягӣ 1–5', emoji: '🖐️',
    words: [
      { word: '하나', translation: 'як (шумориш)', emoji: '☝️', pos: 'numeral', ipa: '/ha.na/',
        example: '하나, 둘, 셋!', exampleTrans: 'Як, ду, се!' },
      { word: '둘', translation: 'ду (шумориш)', emoji: '✌️', pos: 'numeral', ipa: '/tul/',
        example: '하나, 둘! 하나, 둘!', exampleTrans: 'Як, ду! Як, ду!' },
      { word: '셋', translation: 'се (шумориш)', emoji: '🤟', pos: 'numeral', ipa: '/set̚/',
        example: '하나, 둘, 셋! 사진!', exampleTrans: 'Як, ду, се! Акс!' },
      { word: '넷', translation: 'чор (шумориш)', emoji: '🍀', pos: 'numeral', ipa: '/net̚/',
        example: '둘, 셋, 넷!', exampleTrans: 'Ду, се, чор!' },
      { word: '다섯', translation: 'панҷ (шумориш)', emoji: '🖐️', pos: 'numeral', ipa: '/ta.sʌt̚/',
        example: '하나, 둘, 셋, 넷, 다섯!', exampleTrans: 'Як, ду, се, чор, панҷ!' },
    ],
  },
  {
    title: '고유어 숫자 2', titleTranslated: 'Рақамҳои кореягӣ 6–10', emoji: '👐',
    words: [
      { word: '여섯', translation: 'шаш (шумориш)', emoji: '🎲', pos: 'numeral', ipa: '/jʌ.sʌt̚/',
        example: '다섯, 여섯, 일곱!', exampleTrans: 'Панҷ, шаш, ҳафт!' },
      { word: '일곱', translation: 'ҳафт (шумориш)', emoji: '🌈', pos: 'numeral', ipa: '/il.gop̚/',
        example: '여섯, 일곱, 여덟!', exampleTrans: 'Шаш, ҳафт, ҳашт!' },
      { word: '여덟', translation: 'ҳашт (шумориш)', emoji: '🐙', pos: 'numeral', ipa: '/jʌ.dʌl/',
        example: '일곱, 여덟, 아홉!', exampleTrans: 'Ҳафт, ҳашт, нӯҳ!' },
      { word: '아홉', translation: 'нӯҳ (шумориш)', emoji: '⚾', pos: 'numeral', ipa: '/a.hop̚/',
        example: '여덟, 아홉, 열!', exampleTrans: 'Ҳашт, нӯҳ, даҳ!' },
      { word: '열', translation: 'даҳ (шумориш)', emoji: '👐', pos: 'numeral', ipa: '/jʌl/',
        example: '여섯, 일곱, 여덟, 아홉, 열!', exampleTrans: 'Шаш, ҳафт, ҳашт, нӯҳ, даҳ!' },
    ],
  },
  {
    title: '시간', titleTranslated: 'Соат ва дақиқа', emoji: '🕒',
    words: [
      { word: '시', translation: '… соат (вақт: 세 시)', emoji: '🕒', pos: 'noun', ipa: '/ɕi/',
        example: '지금 세 시예요.', exampleTrans: 'Ҳозир соат се аст.' },
      { word: '분', translation: 'дақиқа', emoji: '⏱️', pos: 'noun', ipa: '/pun/',
        example: '지금 세 시 십 분이에요.', exampleTrans: 'Ҳозир соати се-ю даҳ дақиқа аст.' },
      { word: '반', translation: 'ним (30 дақиқа)', emoji: '🌓', pos: 'noun', ipa: '/pan/',
        example: '지금 두 시 반이에요.', exampleTrans: 'Ҳозир соат дуюним аст.' },
      { word: '몇', translation: 'чанд (?)', emoji: '❓', pos: 'numeral', ipa: '/mjʌt̚/',
        example: '지금 몇 시예요?', exampleTrans: 'Ҳозир соат чанд аст?' },
      { word: '지금', translation: 'ҳозир', emoji: '👉', pos: 'adverb', ipa: '/tɕi.gɯm/',
        example: '지금 몇 시예요? — 한 시예요.', exampleTrans: 'Ҳозир соат чанд аст? — Соат як.' },
      { word: '시간', translation: 'вақт', emoji: '⏳', pos: 'noun', ipa: '/ɕi.gan/',
        example: '시간 있어요? — 네, 있어요.', exampleTrans: 'Вақт доред? — Бале, дорам.' },
    ],
  },
  {
    title: '하루', titleTranslated: 'Қисмҳои рӯз', emoji: '🌅',
    words: [
      { word: '아침', translation: 'субҳ; наҳорӣ', emoji: '🌅', pos: 'noun', ipa: '/a.tɕʰim/',
        example: '지금 아침 일곱 시예요.', exampleTrans: 'Ҳозир соати ҳафти субҳ аст.' },
      { word: '점심', translation: 'нисфирӯзӣ; хӯроки пешин', emoji: '🍱', pos: 'noun', ipa: '/tɕʌm.ɕim/',
        example: '지금 점심 열두 시예요.', exampleTrans: 'Ҳозир нисфирӯзӣ, соати дувоздаҳ аст.' },
      { word: '저녁', translation: 'бегоҳ; хӯроки шом', emoji: '🌆', pos: 'noun', ipa: '/tɕʌ.njʌk̚/',
        example: '지금 저녁 여덟 시예요.', exampleTrans: 'Ҳозир соати ҳашти бегоҳ аст.' },
      { word: '밤', translation: 'шаб', emoji: '🌙', pos: 'noun', ipa: '/pam/',
        example: '지금 밤 열한 시예요.', exampleTrans: 'Ҳозир соати ёздаҳи шаб аст.' },
      { word: '오전', translation: 'пеш аз нисфирӯзӣ (AM)', emoji: '🌤️', pos: 'noun', ipa: '/o.dʑʌn/',
        example: '지금 오전 아홉 시 반이에요.', exampleTrans: 'Ҳозир соати нӯҳуними пагоҳӣ аст.' },
      { word: '오후', translation: 'баъд аз нисфирӯзӣ (PM)', emoji: '🌇', pos: 'noun', ipa: '/o.hu/',
        example: '지금 오후 세 시 십 분이에요.', exampleTrans: 'Ҳозир соати се-ю даҳ дақиқаи рӯз аст.' },
    ],
  },
  {
    title: '아침 일과', titleTranslated: 'Корҳои субҳ', emoji: '🪥',
    words: [
      { word: '일어나요', translation: 'аз хоб мехезам', emoji: '⏰', pos: 'verb', ipa: '/i.rʌ.na.jo/',
        example: '지금 일어나요? — 네, 일어나요.', exampleTrans: 'Ҳозир мехезед? — Бале, мехезам.' },
      { word: '씻어요', translation: 'мешӯям (дасту рӯй)', emoji: '🧼', pos: 'verb', ipa: '/ɕi.sʌ.jo/',
        example: '저는 지금 씻어요.', exampleTrans: 'Ман ҳозир дасту рӯй мешӯям.' },
      { word: '먹어요', translation: 'мехӯрам', emoji: '🍽️', pos: 'verb', ipa: '/mʌ.gʌ.jo/',
        example: '저는 빵 먹어요.', exampleTrans: 'Ман нон мехӯрам.' },
      { word: '마셔요', translation: 'менӯшам', emoji: '🥤', pos: 'verb', ipa: '/ma.ɕʌ.jo/',
        example: '유키 씨는 우유 마셔요.', exampleTrans: 'Юки шир менӯшад.' },
      { word: '가요', translation: 'меравам', emoji: '🚶', pos: 'verb', ipa: '/ka.jo/',
        example: '지금 가요? — 네, 가요.', exampleTrans: 'Ҳозир меравед? — Бале, меравам.' },
      { word: '밥', translation: 'хӯрок; биринҷи пухта', emoji: '🍚', pos: 'noun', ipa: '/pap̚/',
        example: '밥 먹어요? — 네, 먹어요.', exampleTrans: 'Хӯрок мехӯред? — Бале, мехӯрам.' },
    ],
  },
  {
    title: '일과 공부', titleTranslated: 'Кор ва таҳсил', emoji: '💼',
    words: [
      { word: '일해요', translation: 'кор мекунам', emoji: '💼', pos: 'verb', ipa: '/i.re.jo/',
        example: '마이클 씨는 지금 일해요.', exampleTrans: 'Майкл ҳозир кор мекунад.' },
      { word: '공부해요', translation: 'дарс мехонам', emoji: '📚', pos: 'verb', ipa: '/koŋ.bu.he.jo/',
        example: '저는 한국어 공부해요.', exampleTrans: 'Ман забони кореягӣ меомӯзам.' },
      { word: '와요', translation: 'меоям', emoji: '↩️', pos: 'verb', ipa: '/wa.jo/',
        example: '민수 씨는 지금 와요.', exampleTrans: 'Минсу ҳозир меояд.' },
      { word: '쉬어요', translation: 'дам мегирам', emoji: '🛋️', pos: 'verb', ipa: '/ɕɥi.ʌ.jo/',
        example: '할머니는 지금 쉬어요.', exampleTrans: 'Бибӣ ҳозир дам мегирад.' },
      { word: '전화해요', translation: 'занг мезанам', emoji: '📱', pos: 'verb', ipa: '/tɕʌ.nwa.he.jo/',
        example: '지금 전화해요? — 네, 전화해요.', exampleTrans: 'Ҳозир занг мезанед? — Бале, занг мезанам.' },
      { word: '수업', translation: 'дарс (машғулот)', emoji: '📝', pos: 'noun', ipa: '/su.ʌp̚/',
        example: '수업은 아홉 시예요.', exampleTrans: 'Дарс соати нӯҳ аст.' },
    ],
  },
  {
    title: '저녁 일과', titleTranslated: 'Корҳои шом', emoji: '🌙',
    words: [
      { word: '자요', translation: 'хоб мекунам', emoji: '😴', pos: 'verb', ipa: '/tɕa.jo/',
        example: '저는 밤 열한 시에 자요.', exampleTrans: 'Ман соати ёздаҳи шаб хоб мекунам.' },
      { word: '봐요', translation: 'мебинам, тамошо мекунам', emoji: '👀', pos: 'verb', ipa: '/pwa.jo/',
        example: '저녁에 텔레비전 봐요.', exampleTrans: 'Бегоҳ телевизор тамошо мекунам.' },
      { word: '읽어요', translation: 'мехонам (китоб)', emoji: '📖', pos: 'verb', ipa: '/il.gʌ.jo/',
        example: '저는 밤에 책 읽어요.', exampleTrans: 'Ман шаб китоб мехонам.' },
      { word: '만나요', translation: 'вомехӯрам', emoji: '🤝', pos: 'verb', ipa: '/man.na.jo/',
        example: '저녁에 친구 만나요.', exampleTrans: 'Бегоҳ бо дӯстам вомехӯрам.' },
      { word: '운동해요', translation: 'варзиш мекунам', emoji: '🏋️', pos: 'verb', ipa: '/un.doŋ.he.jo/',
        example: '저는 저녁에 운동해요.', exampleTrans: 'Ман бегоҳ варзиш мекунам.' },
      { word: '텔레비전', translation: 'телевизор', emoji: '📺', pos: 'noun', ipa: '/tʰel.le.bi.dʑʌn/',
        example: '텔레비전 봐요? — 아니요, 책 읽어요.', exampleTrans: 'Телевизор тамошо мекунед? — Не, китоб мехонам.' },
    ],
  },
  {
    title: '얼마나 자주', titleTranslated: 'Чанд вақт як бор', emoji: '🔁',
    words: [
      { word: '매일', translation: 'ҳар рӯз', emoji: '📅', pos: 'adverb', ipa: '/me.il/',
        example: '저는 매일 한국어 공부해요.', exampleTrans: 'Ман ҳар рӯз забони кореягӣ меомӯзам.' },
      { word: '항상', translation: 'ҳамеша', emoji: '♾️', pos: 'adverb', ipa: '/haŋ.saŋ/',
        example: '안나 씨는 항상 일곱 시에 일어나요.', exampleTrans: 'Анна ҳамеша соати ҳафт аз хоб мехезад.' },
      { word: '자주', translation: 'зуд-зуд', emoji: '🔁', pos: 'adverb', ipa: '/tɕa.dʑu/',
        example: '민수 씨는 자주 운동해요.', exampleTrans: 'Минсу зуд-зуд варзиш мекунад.' },
      { word: '가끔', translation: 'гоҳ-гоҳ', emoji: '🌦️', pos: 'adverb', ipa: '/ka.k͈ɯm/',
        example: '저는 가끔 커피 마셔요.', exampleTrans: 'Ман гоҳ-гоҳ қаҳва менӯшам.' },
      { word: '보통', translation: 'одатан', emoji: '⚖️', pos: 'adverb', ipa: '/po.tʰoŋ/',
        example: '보통 몇 시에 자요?', exampleTrans: 'Одатан соати чанд хоб мекунед?' },
    ],
  },
  {
    title: '일상 표현', titleTranslated: 'Ибораҳои рӯзмарра', emoji: '💬',
    words: [
      { word: '뭐 해요', translation: 'Чӣ кор мекунед?', emoji: '🤔', pos: 'phrase', ipa: '/mwʌ he.jo/',
        example: '지금 뭐 해요? — 공부해요.', exampleTrans: 'Ҳозир чӣ кор мекунед? — Дарс мехонам.' },
      { word: '일찍', translation: 'барвақт', emoji: '🐓', pos: 'adverb', ipa: '/il.t͈ɕik̚/',
        example: '저는 매일 일찍 일어나요.', exampleTrans: 'Ман ҳар рӯз барвақт аз хоб мехезам.' },
      { word: '늦게', translation: 'дер', emoji: '🦉', pos: 'adverb', ipa: '/nɯt̚.k͈e/',
        example: '민수 씨는 늦게 자요.', exampleTrans: 'Минсу дер хоб мекунад.' },
      { word: '빨리', translation: 'зуд, тез', emoji: '💨', pos: 'adverb', ipa: '/p͈al.li/',
        example: '빨리 학교에 가요!', exampleTrans: 'Зуд ба мактаб равед!' },
      { word: '끝나요', translation: 'тамом мешавад', emoji: '🏁', pos: 'verb', ipa: '/k͈ɯn.na.jo/',
        example: '수업은 세 시에 끝나요.', exampleTrans: 'Дарс соати се тамом мешавад.' },
      { word: '공원', translation: 'боғ (парк)', emoji: '🌳', pos: 'noun', ipa: '/koŋ.wʌn/',
        example: '저녁에 가끔 공원에 가요.', exampleTrans: 'Бегоҳ гоҳ-гоҳ ба боғ меравам.' },
    ],
  },
];

// ── Грамматика ──────────────────────────────────────────────────────────────
export const GRAMMAR = [
  {
    lessonTitle: '문법: 고유어 숫자와 시간', lessonTitleTranslated: 'Грамматика: вақтро гуфтан — 세 시 삼십 분',
    title: '고유어 숫자 + 시, 한자어 숫자 + 분', titleTranslated: 'Соат бо рақами кореягӣ, дақиқа бо рақами 일·이·삼',
    emoji: '🕒',
    explanation:
`Дар Модули 4 рақамҳои **일, 이, 삼…** -ро омӯхтед (нарх, телефон). Ҳоло силсилаи дуюм — рақамҳои **худи кореягӣ**: 하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열.

**Вақтро бо ҲАР ДУ силсила мегӯянд:**

- **Соат** — рақами кореягӣ + **시**: 한 시, 두 시, 세 시 … 열두 시
- **Дақиқа** — рақами 일·이·삼 + **분**: 오 분, 십 분, 삼십 분

세 시 삼십 분 = соати 3:30 · 여덟 시 십오 분 = 8:15

**Пеш аз 시 чор рақам кӯтоҳ мешаванд:**
하나 → **한** · 둘 → **두** · 셋 → **세** · 넷 → **네** (ва 11 → **열한**, 12 → **열두**).
Панҷ то даҳ бетағйир: 다섯 시, 여섯 시, 열 시.

**30 дақиқа** = **반** (ним): 두 시 반 — дуюним.

Савол: **지금 몇 시예요?** — Ҳозир соат чанд аст?
Ҷавоб: **세 시예요.** / **세 시 반이에요.**

Пеш аз соат метавон қисми рӯзро гуфт: **오전** 아홉 시 (9-и пагоҳӣ), **오후** 세 시 (3-и рӯз), **밤** 열한 시.

⚠️ «네 시» = соати **чор**. 네 ҳамчун «бале» ҳам ҳаст — пеш аз 시 он ҳамеша рақам аст.`,
    rules: [
      { pattern: 'Рақами кореягӣ + 시', note: '한 시, 두 시, 세 시, 네 시 … 열두 시.' },
      { pattern: 'Рақами 일·이·삼 + 분', note: 'Дақиқа: 오 분, 십 분, 삼십 분.' },
      { pattern: '하나→한, 둘→두, 셋→세, 넷→네', note: 'Пеш аз 시 кӯтоҳ мешаванд. 30 дақиқа = 반.' },
    ],
    examples: [
      { sentence: '지금 몇 시예요? — 한 시예요.', translation: 'Ҳозир соат чанд аст? — Соат як.', highlight: '몇 시' },
      { sentence: '지금 세 시 십오 분이에요.', translation: 'Ҳозир соати се-ю понздаҳ дақиқа аст.', highlight: '세 시 십오 분' },
      { sentence: '지금 두 시 반이에요.', translation: 'Ҳозир соат дуюним аст.', highlight: '두 시 반' },
      { sentence: '지금 오전 열 시예요.', translation: 'Ҳозир соати даҳи пагоҳӣ аст.', highlight: '오전 열 시' },
      { sentence: '지금 밤 열두 시 오 분이에요.', translation: 'Ҳозир соати дувоздаҳу панҷ дақиқаи шаб аст.', highlight: '열두 시 오 분' },
    ],
    exercises: [
      { prompt: '지금 ___ 시예요.', promptTranslated: 'Ҳозир соат як аст (1:00).', answer: '한', options: ['한', '하나', '일', '열'], explanation: '하나 пеш аз 시 кӯтоҳ мешавад → 한 시.' },
      { prompt: '지금 ___ 시예요.', promptTranslated: 'Ҳозир соат ду аст (2:00).', answer: '두', options: ['두', '둘', '이', '세'], explanation: 'Соат бо рақами кореягӣ: 둘 → 두 시 (이 시 нодуруст).' },
      { prompt: '지금 네 시 ___이에요.', promptTranslated: 'Ҳозир соат чоруним аст (4:30).', answer: '반', options: ['반', '분', '시', '몇'], explanation: '30 дақиқа = 반 → 네 시 반.' },
      { prompt: '지금 ___ 시 십 분이에요.', promptTranslated: 'Ҳозир соати панҷу даҳ дақиқа аст (5:10).', answer: '다섯', options: ['다섯', '오', '여섯', '넷'], explanation: 'Соат — рақами кореягӣ: 다섯 시 (오 시 нодуруст).' },
      { prompt: '지금 ___ 시예요? — 세 시예요.', promptTranslated: 'Ҳозир соат чанд аст? — Соат се.', answer: '몇', options: ['몇', '뭐', '누구', '무엇'], explanation: '«Соат чанд?» → 몇 시예요?' },
      { prompt: '지금 열두 시 ___ 분이에요.', promptTranslated: 'Ҳозир соати дувоздаҳу панҷ дақиқа аст (12:05).', answer: '오', options: ['오', '다섯', '여섯', '육'], explanation: 'Дақиқа — рақами 일·이·삼: 오 분 (다섯 분 нодуруст).' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ҳозир соат чанд аст?', answer: '지금 몇 시예요?', options: ['시예요', '몇', '지금'], explanation: '지금 + 몇 시예요?' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ҳозир соати ҳафти субҳ аст.', answer: '지금 아침 일곱 시예요.', options: ['시예요', '일곱', '아침', '지금'], explanation: 'Қисми рӯз пеш аз соат: 아침 일곱 시.' },
    ],
  },
  {
    lessonTitle: '문법: -아요/어요', lessonTitleTranslated: 'Грамматика: феъли замони ҳозира -아요 / -어요 / 해요',
    title: '동사 + 아요/어요 (현재)', titleTranslated: 'Замони ҳозира: -아요 / -어요 / 해요',
    emoji: '🔄',
    explanation:
`Феъли кореягӣ дар луғат бо **-다** тамом мешавад: 가**다** (рафтан), 먹**다** (хӯрдан), 공부하**다** (дарс хондан).

Барои гуфтугӯи боэҳтироми ҳаррӯза **-다**-ро партоед ва илова кунед:

- садоноки охир **ㅏ** ё **ㅗ** → **-아요**: 가다 → **가요**, 자다 → **자요**, 만나다 → **만나요**, 오다 → **와요** (오+아 = 와), 보다 → **봐요**
- дигар садонокҳо → **-어요**: 먹다 → **먹어요**, 읽다 → **읽어요**, 쉬다 → **쉬어요**, 마시다 → **마셔요** (시+어 = 셔)
- **하다** → **해요**: 일하다 → **일해요**, 공부하다 → **공부해요**

**Як шакл барои ҳама:** 저는 가요 (ман меравам), 알리 씨는 가요 (Алӣ меравад), 우리는 가요 (мо меравем). Дар тоҷикӣ «меравам / меравад / меравем» — дар кореягӣ ҳамааш **가요**.

**Савол ҳамон шакл аст, танҳо оҳанг боло мешавад:** 가요? — 네, 가요. (Дар забони англисӣ do/does лозим, дар кореягӣ не.)

**Феъл ҳамеша дар охир**, мисли тоҷикӣ: 저는 빵 먹어요 — Ман нон мехӯрам.

Дар гуфтугӯ пасванди объект одатан гуфта намешавад: **빵 먹어요**, **커피 마셔요**. Шакли пурраи он (을/를) — дар Модули 8.`,
    rules: [
      { pattern: 'ㅏ, ㅗ + -아요', note: '가다 → 가요 · 오다 → 와요 · 보다 → 봐요.' },
      { pattern: 'Дигар садонокҳо + -어요', note: '먹다 → 먹어요 · 마시다 → 마셔요.' },
      { pattern: '하다 → 해요', note: '공부하다 → 공부해요 · 일하다 → 일해요.' },
    ],
    examples: [
      { sentence: '저는 커피 마셔요.', translation: 'Ман қаҳва менӯшам.', highlight: '마셔요' },
      { sentence: '알리 씨는 한국어 공부해요.', translation: 'Алӣ забони кореягӣ меомӯзад.', highlight: '공부해요' },
      { sentence: '안나 씨는 지금 일어나요.', translation: 'Анна ҳозир аз хоб мехезад.', highlight: '일어나요' },
      { sentence: '저는 밥 먹어요.', translation: 'Ман хӯрок мехӯрам.', highlight: '먹어요' },
      { sentence: '지금 가요? — 네, 가요.', translation: 'Ҳозир меравед? — Бале, меравам.', highlight: '가요' },
    ],
    exercises: [
      { prompt: '가다 → ___', promptTranslated: 'Рафтан → меравам', answer: '가요', options: ['가요', '가어요', '가해요'], explanation: 'Садоноки ㅏ → -아요: 가 + 아요 = 가요.' },
      { prompt: '먹다 → ___', promptTranslated: 'Хӯрдан → мехӯрам', answer: '먹어요', options: ['먹어요', '먹아요', '먹요'], explanation: 'Садоноки ㅓ (먹) → -어요: 먹어요.' },
      { prompt: '공부하다 → ___', promptTranslated: 'Дарс хондан → дарс мехонам', answer: '공부해요', options: ['공부해요', '공부하요', '공부하어요'], explanation: '하다 → 해요: 공부해요.' },
      { prompt: '오다 → ___', promptTranslated: 'Омадан → меоям', answer: '와요', options: ['와요', '오어요', '와어요'], explanation: 'ㅗ → -아요, ва 오 + 아 = 와 → 와요.' },
      { prompt: '저는 커피 ___.', promptTranslated: 'Ман қаҳва менӯшам.', answer: '마셔요', options: ['마셔요', '먹어요', '자요', '가요'], explanation: 'Нӯшидан — 마시다 → 마셔요.' },
      { prompt: '민수 씨, 지금 ___? — 네, 가요.', promptTranslated: 'Минсу, ҳозир меравед? — Бале, меравам.', answer: '가요', options: ['가요', '와요', '자요', '먹어요'], explanation: 'Савол ҳамон шакл аст: 가요? — 가요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ман забони кореягӣ меомӯзам.', answer: '저는 한국어 공부해요.', options: ['공부해요', '한국어', '저는'], explanation: 'Феъл дар охир: 저는 한국어 공부해요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Юки шир менӯшад.', answer: '유키 씨는 우유 마셔요.', options: ['마셔요', '우유', '씨는', '유키'], explanation: 'Кӣ → чӣ → феъл: 유키 씨는 우유 마셔요.' },
    ],
  },
  {
    lessonTitle: '문법: 에', lessonTitleTranslated: 'Грамматика: пасванди 에 — «соати ҳафт», «ба мактаб»',
    title: '명사 + 에 (시간, 장소)', titleTranslated: 'Пасванди 에: вақт ва самт',
    emoji: '📍',
    explanation:
`**에** пас аз калима меояд (дар тоҷикӣ «дар», «ба» пеш аз калима меоянд).

**1. Вақт + 에** — «дар» / «соати …»:
- 일곱 시**에** 일어나요. — Соати ҳафт аз хоб мехезам.
- 아침**에**, 저녁**에**, 밤**에** — субҳ, бегоҳ, шаб

**2. Ҷой + 에 + 가요 / 와요** — «ба …»:
- 학교**에** 가요. — Ба мактаб меравам.
- 집**에** 와요. — Ба хона меоям.

Ҳардуро якҷоя: 여덟 시**에** 학교**에** 가요. — Соати ҳашт ба мактаб меравам.

⚠️ **지금** ва **매일** бе 에: 지금 가요 (на «지금에»), 매일 공부해요.`,
    rules: [
      { pattern: 'Вақт + 에', note: '일곱 시에 · 아침에 · 저녁에 · 밤에.' },
      { pattern: 'Ҷой + 에 가요 / 와요', note: '학교에 가요 · 집에 와요.' },
      { pattern: '지금, 매일 — бе 에', note: '지금 가요 · 매일 공부해요.' },
    ],
    examples: [
      { sentence: '저는 일곱 시에 일어나요.', translation: 'Ман соати ҳафт аз хоб мехезам.', highlight: '시에' },
      { sentence: '알리 씨는 여덟 시에 학교에 가요.', translation: 'Алӣ соати ҳашт ба мактаб меравад.', highlight: '학교에' },
      { sentence: '저녁에 집에 와요.', translation: 'Бегоҳ ба хона меоям.', highlight: '집에' },
      { sentence: '마이클 씨는 아홉 시에 회사에 가요.', translation: 'Майкл соати нӯҳ ба ширкат меравад.', highlight: '회사에' },
      { sentence: '보통 몇 시에 자요?', translation: 'Одатан соати чанд хоб мекунед?', highlight: '몇 시에' },
    ],
    exercises: [
      { prompt: '일곱 시___ 일어나요.', promptTranslated: 'Соати ҳафт аз хоб мехезам.', answer: '에', options: ['에', '는', '가', '의'], explanation: 'Вақт + 에: 일곱 시에.' },
      { prompt: '저는 학교___ 가요.', promptTranslated: 'Ман ба мактаб меравам.', answer: '에', options: ['에', '는', '도', '의'], explanation: 'Ҷой + 에 가요: 학교에 가요.' },
      { prompt: '___ 공부해요.', promptTranslated: 'Ҳозир дарс мехонам.', answer: '지금', options: ['지금', '지금에', '아침'], explanation: '지금 бе 에 меояд.' },
      { prompt: '안나 씨는 ___ 가요.', promptTranslated: 'Анна ба беморхона меравад.', answer: '병원에', options: ['병원에', '병원', '병원은', '병원이'], explanation: 'Ҷой + 에 가요: 병원에 가요.' },
      { prompt: '저녁___ 텔레비전 봐요.', promptTranslated: 'Бегоҳ телевизор тамошо мекунам.', answer: '에', options: ['에', '이', '은', '도'], explanation: 'Қисми рӯз + 에: 저녁에.' },
      { prompt: '밤 열한 시에 ___.', promptTranslated: 'Шаб соати ёздаҳ хоб мекунам.', answer: '자요', options: ['자요', '와요', '일어나요', '먹어요'], explanation: 'Хоб кардан — 자다 → 자요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Соати ҳашт ба мактаб меравам.', answer: '여덟 시에 학교에 가요.', options: ['가요', '학교에', '시에', '여덟'], explanation: 'Вақт → ҷой → феъл: 여덟 시에 학교에 가요.' },
      { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Бегоҳ ба хона меоям.', answer: '저녁에 집에 와요.', options: ['와요', '집에', '저녁에'], explanation: 'Вақт → ҷой → феъл.' },
    ],
  },
];

// Мавзӯи чорум — зарфҳои басомад: ҳар се курси дигар (en/ru/ar M5) онро ҳамчун
// ДАРСИ ГРАММАТИКА доранд (Adverbs of frequency · Наречия частотности · ظروف التكرار).
GRAMMAR.push({
  lessonTitle: '문법: 빈도 부사', lessonTitleTranslated: 'Грамматика: «ҳамеша», «одатан», «гоҳ-гоҳ»',
  title: '빈도 부사 (항상, 보통, 자주, 가끔)', titleTranslated: 'Чанд вақт як бор: 항상 · 매일 · 보통 · 자주 · 가끔',
  emoji: '🔁',
  explanation:
`Ин калимаҳо мегӯянд, ки кор **чанд вақт як бор** мешавад:

- **항상** — ҳамеша
- **매일** — ҳар рӯз
- **보통** — одатан
- **자주** — зуд-зуд
- **가끔** — гоҳ-гоҳ

**Ҷояш — пеш аз феъл** (одатан пас аз «кӣ»), мисли тоҷикӣ:
저는 **항상** 일찍 일어나요. — Ман **ҳамеша** барвақт мехезам.
민수 씨는 **자주** 운동해요. — Минсу **зуд-зуд** варзиш мекунад.

**Бо вақт:** калимаи басомад пеш аз вақт меояд — 저는 **보통** 일곱 시에 일어나요.

**Савол:** **보통** 몇 시에 자요? — Одатан соати чанд хоб мекунед?

⚠️ Феъл ҳамеша **дар охир** мемонад: «저는 운동해요 자주» нодуруст аст.`,
  rules: [
    { pattern: 'Кӣ + 항상/보통/자주/가끔 + феъл', note: '저는 자주 운동해요.' },
    { pattern: '항상 › 매일 › 보통 › 자주 › 가끔', note: 'Аз «ҳамеша» то «гоҳ-гоҳ».' },
    { pattern: 'Басомад + вақт + феъл', note: '보통 일곱 시에 일어나요.' },
  ],
  examples: [
    { sentence: '저는 항상 일찍 일어나요.', translation: 'Ман ҳамеша барвақт аз хоб мехезам.', highlight: '항상' },
    { sentence: '민수 씨는 보통 열두 시에 자요.', translation: 'Минсу одатан соати дувоздаҳ хоб мекунад.', highlight: '보통' },
    { sentence: '안나 씨는 자주 커피 마셔요.', translation: 'Анна зуд-зуд қаҳва менӯшад.', highlight: '자주' },
    { sentence: '저는 가끔 공원에 가요.', translation: 'Ман гоҳ-гоҳ ба боғ меравам.', highlight: '가끔' },
    { sentence: '카림 씨는 매일 한국어 공부해요.', translation: 'Карим ҳар рӯз забони кореягӣ меомӯзад.', highlight: '매일' },
  ],
  exercises: [
    { prompt: '저는 ___ 일곱 시에 일어나요.', promptTranslated: 'Ман ҳамеша соати ҳафт аз хоб мехезам.', answer: '항상', options: ['항상', '가끔', '자주', '보통'], explanation: '«Ҳамеша» → 항상.' },
    { prompt: '___ 운동해요.', promptTranslated: 'Гоҳ-гоҳ варзиш мекунам.', answer: '가끔', options: ['가끔', '항상', '매일', '보통'], explanation: '«Гоҳ-гоҳ» → 가끔.' },
    { prompt: '저는 ___ 커피 마셔요.', promptTranslated: 'Ман зуд-зуд қаҳва менӯшам.', answer: '자주', options: ['자주', '가끔', '항상', '지금'], explanation: '«Зуд-зуд» → 자주.' },
    { prompt: '___ 몇 시에 자요?', promptTranslated: 'Одатан соати чанд хоб мекунед?', answer: '보통', options: ['보통', '항상', '자주', '매일'], explanation: '«Одатан» → 보통.' },
    { prompt: '저는 ___ 한국어 공부해요.', promptTranslated: 'Ман ҳар рӯз забони кореягӣ меомӯзам.', answer: '매일', options: ['매일', '가끔', '보통', '지금'], explanation: '«Ҳар рӯз» → 매일.' },
    { prompt: '___', promptTranslated: 'Ҷумлаи дурустро интихоб кунед: «Ман зуд-зуд варзиш мекунам».', answer: '저는 자주 운동해요.', options: ['저는 자주 운동해요.', '저는 운동해요 자주.', '운동해요 저는 자주.'], explanation: 'Басомад пеш аз феъл, феъл дар охир: 저는 자주 운동해요.' },
    { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Ман ҳамеша барвақт аз хоб мехезам.', answer: '저는 항상 일찍 일어나요.', options: ['일어나요', '일찍', '항상', '저는'], explanation: 'Кӣ → басомад → чӣ тавр → феъл.' },
    { type: 'reorder', prompt: 'Ҷумларо созед:', promptTranslated: 'Минсу одатан соати дувоздаҳ хоб мекунад.', answer: '민수 씨는 보통 열두 시에 자요.', options: ['자요', '시에', '열두', '보통', '씨는', '민수'], explanation: 'Кӣ → басомад → вақт → феъл.' },
  ],
});

// ── Матнҳо (хониш, шунавоӣ, такрор, имтиҳон) ────────────────────────────────
export const COMPREHENSIONS = [
  {
    slot: 'reading', speaker: '알리',
    lessonTitle: '읽기: 알리 씨의 하루', lessonTitleTranslated: 'Хониш: Рӯзи Алӣ',
    skillType: 'reading', xpReward: 20, kind: 'reading', emoji: '📖',
    title: '알리 씨의 하루', titleTranslated: 'Рӯзи Алӣ',
    passage: '안녕하세요. 저는 알리예요. 저는 매일 여섯 시에 일어나요. 아침에 빵 먹어요. 우유도 마셔요. 여덟 시에 학교에 가요. 수업은 아홉 시예요. 수업은 오후 세 시에 끝나요. 저녁에 한국어 공부해요. 밤 열한 시에 자요.',
    passageTranslated: 'Салом. Ман Алӣ ҳастам. Ман ҳар рӯз соати шаш аз хоб мехезам. Субҳ нон мехӯрам. Шир ҳам менӯшам. Соати ҳашт ба мактаб меравам. Дарс соати нӯҳ аст. Дарс соати сеи рӯз тамом мешавад. Бегоҳ забони кореягӣ меомӯзам. Шаб соати ёздаҳ хоб мекунам.',
    questions: [
      { question: '알리 씨는 몇 시에 일어나요?', questionTranslated: 'Алӣ соати чанд аз хоб мехезад?', options: ['여섯 시에 일어나요', '일곱 시에 일어나요', '여덟 시에 일어나요'], correctIndex: 0, explanation: 'Матн: 저는 매일 여섯 시에 일어나요.' },
      { question: '알리 씨는 아침에 뭐 먹어요?', questionTranslated: 'Алӣ субҳ чӣ мехӯрад?', options: ['빵 먹어요', '밥 먹어요', '사과 먹어요'], correctIndex: 0, explanation: 'Матн: 아침에 빵 먹어요.' },
      { question: '수업은 몇 시에 끝나요?', questionTranslated: 'Дарс соати чанд тамом мешавад?', options: ['오후 세 시에 끝나요', '아홉 시에 끝나요', '밤 열한 시에 끝나요'], correctIndex: 0, explanation: 'Матн: 수업은 오후 세 시에 끝나요.' },
    ],
  },
  {
    slot: 'listening', speaker: '민수',
    lessonTitle: '듣기: 민수 씨의 하루', lessonTitleTranslated: 'Шунавоӣ: Рӯзи Минсу',
    skillType: 'listening', xpReward: 20, kind: 'listening', emoji: '🎧',
    title: '민수 씨의 하루', titleTranslated: 'Рӯзи Минсу',
    passage: '안녕하세요. 저는 민수예요. 저는 보통 일곱 시 반에 일어나요. 아침에 밥 먹어요. 커피도 마셔요. 아홉 시에 대학교에 가요. 저녁에 친구 만나요. 가끔 공원에 가요. 밤 열두 시에 자요.',
    passageTranslated: 'Салом. Ман Минсу ҳастам. Ман одатан соати ҳафтуним аз хоб мехезам. Субҳ хӯрок мехӯрам. Қаҳва ҳам менӯшам. Соати нӯҳ ба донишгоҳ меравам. Бегоҳ бо дӯстам вомехӯрам. Гоҳ-гоҳ ба боғ меравам. Шаб соати дувоздаҳ хоб мекунам.',
    questions: [
      { question: '민수 씨는 몇 시에 일어나요?', questionTranslated: 'Минсу соати чанд аз хоб мехезад?', options: ['일곱 시 반에 일어나요', '일곱 시에 일어나요', '여섯 시 반에 일어나요'], correctIndex: 0, explanation: 'Матн: 저는 보통 일곱 시 반에 일어나요.' },
      { question: '민수 씨는 아침에 밥 먹어요?', questionTranslated: 'Минсу субҳ хӯрок мехӯрад?', options: ['네, 먹어요', '아니요, 빵 먹어요', '아니요, 사과 먹어요'], correctIndex: 0, explanation: 'Матн: 아침에 밥 먹어요.' },
      { question: '민수 씨는 저녁에 뭐 해요?', questionTranslated: 'Минсу бегоҳ чӣ кор мекунад?', options: ['친구 만나요', '한국어 공부해요', '운동해요'], correctIndex: 0, explanation: 'Матн: 저녁에 친구 만나요.' },
      { question: '민수 씨는 몇 시에 자요?', questionTranslated: 'Минсу соати чанд хоб мекунад?', options: ['열두 시에 자요', '열한 시에 자요', '열 시에 자요'], correctIndex: 0, explanation: 'Матн: 밤 열두 시에 자요.' },
    ],
  },
  {
    slot: 'review', speaker: '카림',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрори модул',
    skillType: 'review', xpReward: 30, kind: 'reading', emoji: '🔄',
    title: '시간과 하루 복습', titleTranslated: 'Такрор: вақт ва рӯзи ҳаррӯза',
    passage: '안녕하세요. 저는 카림이에요. 저는 학생이에요. 저는 매일 한국어 공부해요. 아침 여섯 시 반에 일어나요. 오전에 대학교에 가요. 점심에 밥 먹어요. 오후에 쉬어요. 저녁에 가끔 운동해요. 저는 일찍 자요. 밤 열 시에 자요.',
    passageTranslated: 'Салом. Ман Карим ҳастам. Ман донишҷӯ ҳастам. Ман ҳар рӯз забони кореягӣ меомӯзам. Субҳ соати шашуним аз хоб мехезам. Пеш аз нисфирӯзӣ ба донишгоҳ меравам. Нисфирӯзӣ хӯрок мехӯрам. Баъд аз нисфирӯзӣ дам мегирам. Бегоҳ гоҳ-гоҳ варзиш мекунам. Ман барвақт хоб мекунам. Шаб соати даҳ хоб мекунам.',
    questions: [
      { question: '카림 씨는 몇 시에 일어나요?', questionTranslated: 'Карим соати чанд аз хоб мехезад?', options: ['여섯 시 반에 일어나요', '여섯 시에 일어나요', '일곱 시 반에 일어나요'], correctIndex: 0, explanation: 'Матн: 아침 여섯 시 반에 일어나요.' },
      { question: '카림 씨는 오후에 뭐 해요?', questionTranslated: 'Карим баъд аз нисфирӯзӣ чӣ кор мекунад?', options: ['쉬어요', '일해요', '공부해요'], correctIndex: 0, explanation: 'Матн: 오후에 쉬어요.' },
      { question: '카림 씨는 매일 운동해요?', questionTranslated: 'Карим ҳар рӯз варзиш мекунад?', options: ['아니요, 가끔 운동해요', '네, 매일 운동해요', '네, 항상 운동해요'], correctIndex: 0, explanation: 'Матн: 저녁에 가끔 운동해요.' },
      { question: '카림 씨는 매일 한국어 공부해요?', questionTranslated: 'Карим ҳар рӯз забони кореягӣ меомӯзад?', options: ['네, 매일 공부해요', '아니요, 가끔 공부해요', '아니요, 운동해요'], correctIndex: 0, explanation: 'Матн: 저는 매일 한국어 공부해요.' },
      { question: '«일어나요» — 무슨 뜻이에요?', questionTranslated: '«일어나요» чӣ маъно дорад?', options: ['аз хоб мехезам', 'хоб мекунам', 'мехӯрам'], correctIndex: 0, explanation: '일어나요 = аз хоб мехезам.' },
      { question: '«반» — 무슨 뜻이에요?', questionTranslated: '«반» чӣ маъно дорад?', options: ['ним (30 дақиқа)', 'дақиқа', 'соат'], correctIndex: 0, explanation: '반 = ним: 여섯 시 반 — шашуним.' },
    ],
  },
  {
    slot: 'test', speaker: '안나',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони модул',
    skillType: 'test', xpReward: 50, kind: 'reading', emoji: '🏆',
    title: '안나 씨의 하루', titleTranslated: 'Рӯзи Анна',
    passage: '안녕하세요. 저는 안나예요. 저는 의사예요. 저는 항상 일찍 일어나요. 다섯 시 반에 일어나요. 아침에 커피 마셔요. 일곱 시에 병원에 가요. 저는 매일 일해요. 저녁 여덟 시에 집에 와요. 저녁에 책 읽어요. 텔레비전은 가끔 봐요. 밤 열한 시에 자요.',
    passageTranslated: 'Салом. Ман Анна ҳастам. Ман духтур ҳастам. Ман ҳамеша барвақт аз хоб мехезам. Соати панҷуним мехезам. Субҳ қаҳва менӯшам. Соати ҳафт ба беморхона меравам. Ман ҳар рӯз кор мекунам. Соати ҳашти бегоҳ ба хона меоям. Бегоҳ китоб мехонам. Телевизорро гоҳ-гоҳ тамошо мекунам. Шаб соати ёздаҳ хоб мекунам.',
    questions: [
      { question: '안나 씨는 몇 시에 일어나요?', questionTranslated: 'Анна соати чанд аз хоб мехезад?', options: ['다섯 시 반에 일어나요', '여섯 시 반에 일어나요', '다섯 시에 일어나요'], correctIndex: 0, explanation: 'Матн: 다섯 시 반에 일어나요.' },
      { question: '안나 씨는 몇 시에 병원에 가요?', questionTranslated: 'Анна соати чанд ба беморхона меравад?', options: ['일곱 시에 가요', '여덟 시에 가요', '아홉 시에 가요'], correctIndex: 0, explanation: 'Матн: 일곱 시에 병원에 가요.' },
      { question: '안나 씨는 늦게 일어나요?', questionTranslated: 'Анна дер аз хоб мехезад?', options: ['아니요, 일찍 일어나요', '네, 늦게 일어나요', '네, 열 시에 일어나요'], correctIndex: 0, explanation: 'Матн: 저는 항상 일찍 일어나요.' },
      { question: '안나 씨는 매일 일해요?', questionTranslated: 'Анна ҳар рӯз кор мекунад?', options: ['네, 매일 일해요', '아니요, 가끔 일해요', '아니요, 쉬어요'], correctIndex: 0, explanation: 'Матн: 저는 매일 일해요.' },
      { question: '안나 씨는 텔레비전 자주 봐요?', questionTranslated: 'Анна телевизорро зуд-зуд тамошо мекунад?', options: ['아니요, 가끔 봐요', '네, 매일 봐요', '네, 항상 봐요'], correctIndex: 0, explanation: 'Матн: 텔레비전은 가끔 봐요.' },
      { question: '무엇에 대한 글이에요?', questionTranslated: 'Матн дар бораи чист?', options: ['Рӯзи ҳаррӯзаи Анна', 'Оилаи Анна', 'Анна дар мағоза'], correctIndex: 0, explanation: 'Анна мегӯяд, ки кай мехезад, кор мекунад ва хоб мекунад.' },
      { question: '«8:30» — ?', questionTranslated: 'Соати 8:30 бо кореягӣ чӣ тавр аст?', options: ['여덟 시 반', '팔 시 반', '여덟 시 삼 분'], correctIndex: 0, explanation: 'Соат — рақами кореягӣ (여덟 시), 30 дақиқа — 반.' },
      { question: '«보통» — 무슨 뜻이에요?', questionTranslated: '«보통» чӣ маъно дорад?', options: ['одатан', 'ҳамеша', 'гоҳ-гоҳ'], correctIndex: 0, explanation: '보통 = одатан.' },
    ],
  },
];

// ── Муколама ────────────────────────────────────────────────────────────────
// Сатрҳои Алӣ-ро хонанда мегӯяд (`isUser`).
export const DIALOGUE = {
  lessonTitle: '말하기: 같이 공부해요', lessonTitleTranslated: 'Муколама ва амалия',
  title: '같이 공부해요', titleTranslated: 'Биёед якҷоя дарс хонем',
  scenario: 'Минсу мепурсад, ки шумо чӣ кор мекунед. Шумо дар бораи вақти дарси худ мегӯед ва бо ӯ вақти вохӯриро муайян мекунед.', emoji: '🗣️',
  lines: [
    { speaker: '민수', text: '알리 씨, 지금 뭐 해요?', translation: 'Алӣ, ҳозир чӣ кор мекунед?' },
    { speaker: '알리', text: '한국어 공부해요.', translation: 'Забони кореягӣ мехонам.', isUser: true },
    { speaker: '민수', text: '보통 몇 시에 공부해요?', translation: 'Одатан соати чанд дарс мехонед?' },
    { speaker: '알리', text: '저녁 여덟 시에 공부해요.', translation: 'Соати ҳашти бегоҳ дарс мехонам.', isUser: true },
    { speaker: '민수', text: '저도 저녁에 공부해요. 같이 공부해요!', translation: 'Ман ҳам бегоҳ дарс мехонам. Биёед якҷоя хонем!' },
    { speaker: '알리', text: '좋아요! 몇 시에 만나요?', translation: 'Хуб! Соати чанд вомехӯрем?', isUser: true },
    { speaker: '민수', text: '일곱 시 반에 만나요.', translation: 'Соати ҳафтуним вомехӯрем.' },
    { speaker: '알리', text: '민수 씨 집에 가요?', translation: 'Ба хонаи шумо биёям?', isUser: true },
    { speaker: '민수', text: '네, 우리 집에 와요.', translation: 'Бале, ба хонаи мо биёед.' },
    { speaker: '알리', text: '네! 일곱 시 반에 가요.', translation: 'Хуб! Соати ҳафтуним меоям.', isUser: true },
  ],
};

// ── Дарси навиштан ──────────────────────────────────────────────────────────
export const WRITING = {
  title: '쓰기 연습 5', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['하나', '다섯', '열', '시', '분', '아침', '밥', '자요'],
};

export const ORDER = [
  'vocab:고유어 숫자 1',
  'vocab:고유어 숫자 2',
  'vocab:시간',
  'grammar:0',            // вақт — баъди рақамҳои кореягӣ ва 시/분/반
  'vocab:하루',
  'vocab:아침 일과',
  'grammar:1',            // -아요/어요 — баъди аввалин феълҳо
  'vocab:일과 공부',
  'grammar:2',            // 에 — пеш аз мисолҳои «… 시에», «… 에 가요»
  'vocab:저녁 일과',
  'vocab:얼마나 자주',
  'grammar:3',            // басомад — фавран баъди калимаҳои 항상/자주/가끔
  'vocab:일상 표현',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
