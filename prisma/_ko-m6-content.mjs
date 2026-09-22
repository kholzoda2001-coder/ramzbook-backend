// TOPIK I · 1급 · Модули 6 — «날짜와 요일»
export const MODULE = {
  order: 5,
  title: '날짜와 요일',
  titleTranslated: 'Сана ва рӯзҳои ҳафта',
  emoji: '📅',
  canDoStatement: 'Пас аз ин бахш шумо метавонед рӯзҳои ҳафта ва моҳҳоро бигӯед, дар бораи нақшаҳои имрӯз ё фардо сӯҳбат кунед, ва инчунин бо истифода аз замони гузашта нақл кунед, ки дирӯз ё ҳафтаи гузашта чӣ кор кардед.',
};

export const KNOWN_FROM = [
  './_ko-m1-content.mjs',
  './_ko-m2-content.mjs',
  './_ko-m3-content.mjs',
  './_ko-m4-content.mjs',
  './_ko-m5-content.mjs',
];

export const CHARACTERS = {
  '알리': { country: '타지키스탄', job: '학생', gender: 'm' },
  '카림': { country: '타지키스탄', job: '학생', gender: 'm' },
  '사라': { country: '한국', job: '선생님', gender: 'f' },
  '민수': { country: '한국', job: '학생', gender: 'm' },
  '안나': { country: '러시아', job: '의사', gender: 'f' },
  '유키': { 가요: '일본', job: '간호사', gender: 'f' },
  '왕밍': { country: '중국', job: '요리사', gender: 'm' },
  '마이클': { country: '미국', job: '회사원', gender: 'm' },
};
export const NAMES = Object.keys(CHARACTERS);

export const FAMILY = {
  '알리': { 아버지: { job: '운전기사' }, 어머니: { job: '선생님' } },
  '민수': { 아버지: { job: '회사원' }, 어머니: { job: '주부' } },
  '유키': { 오빠: { job: '요리사' }, 언니: { job: '가수' } },
  '사라': { 남편: { job: '의사' }, 아들: { job: '학생' } },
  '카림': { 아버지: { job: '농부' }, 어머니: { job: '주부' } },
};

export const EXTRA_KNOWN = [
  '어제', '오늘', '내일', '주말', '에', '월요일', '일요일',
  '았어요', '었어요', '했어요', '갔어요', '왔어요', '먹었어요', '마셨어요', '공부했어요', '일했어요',
  '봤어요', '잤어요', '만났어요', '일어났어요', '읽었어요', '씻었어요', '쉬었어요', '가치', '같이',
  '유월', '시월', '무슨', '며칠', '언제', '년', '월', '일', '이번 주', '지난 주', '다음 주',
  '공원에서', '산책해요', '여행해요', '친구하고', '요일이에요', '친구를', '여행했어요', '집에서',
  '텔레비전을', '밥을', '산책했어요', '보았어요', '어디에', '무엇을', '음식을', '빵을', '과일을',
  '십', '일이에요', '이십', '요일에', '친구들은', '글은', '대한', '글입니까', '활동', '나이',
  '음식', '빈칸에', '들어갈', '알맞은', '말을', '고르십시오', '산책할', '거예요', '산책', '봅니다',
  '씨는요', '그리고', '아주', '재미있었어요', '좋아해요',
  '영화', '수박', '바다에', '더워요', '추워요', '눈이', '안', '이천이십육', '년이에요', '달은',
  '영화는', '책은', '책이', '책을', '수영해요', '영화를', '보다', '사과를',
  '식당에서', '그래서', '친구들이', '씨하고', '재미있게', '파티를', '여행을', '다시', '주말에는', '쉴',
  '일월', '이월', '삼월', '사월', '오월', '칠월', '팔월', '구월', '십일월', '십이월'
];

export const VOCAB = [
  {
    title: '요일', titleTranslated: 'Рӯзҳои ҳафта', emoji: '📅',
    words: [
      { word: '월요일', translation: 'Душанбе', emoji: '🌙', pos: 'noun', ipa: '/wʌ.ɾjo.il/', example: '오늘은 월요일이에요.', exampleTrans: 'Имрӯз душанбе аст.' },
      { word: '화요일', translation: 'Сешанбе', emoji: '🔥', pos: 'noun', ipa: '/hwa.jo.il/', example: '내일은 화요일이에요.', exampleTrans: 'Фардо сешанбе аст.' },
      { word: '수요일', translation: 'Чоршанбе', emoji: '💧', pos: 'noun', ipa: '/su.jo.il/', example: '수요일에 한국어 공부해요.', exampleTrans: 'Рӯзи чоршанбе кореягӣ меомӯзам.' },
      { word: '목요일', translation: 'Панҷшанбе', emoji: '🌳', pos: 'noun', ipa: '/mo.gjo.il/', example: '목요일에 만나요.', exampleTrans: 'Рӯзи панҷшанбе вомехӯрем.' },
      { word: '금요일', translation: 'Ҷумъа', emoji: '🪙', pos: 'noun', ipa: '/kɯ.mjo.il/', example: '금요일 저녁에 영화 봐요.', exampleTrans: 'Бегоҳи ҷумъа филм тамошо мекунам.' },
      { word: '토요일', translation: 'Шанбе', emoji: '🪨', pos: 'noun', ipa: '/tʰo.jo.il/', example: '토요일에 친구 만나요.', exampleTrans: 'Шанбе бо дӯстам вомехӯрам.' },
      { word: '일요일', translation: 'Якшанбе', emoji: '☀️', pos: 'noun', ipa: '/i.ɾjo.il/', example: '일요일에 쉬어요.', exampleTrans: 'Якшанбе дам мегирам.' },
    ],
  },
  {
    title: '월 1', titleTranslated: 'Моҳҳо (1–6)', emoji: '🌸',
    words: [
      { word: '일월', translation: 'январ', emoji: '❄️', pos: 'noun', ipa: '/i.ɾwʌl/', example: '지금은 일월이에요.', exampleTrans: 'Ҳозир январ аст.' },
      { word: '이월', translation: 'феврал', emoji: '🌨️', pos: 'noun', ipa: '/i.wʌl/', example: '이월에 학교에 가요.', exampleTrans: 'Дар моҳи феврал ба мактаб меравам.' },
      { word: '삼월', translation: 'март', emoji: '🌱', pos: 'noun', ipa: '/sa.mwʌl/', example: '삼월에 친구 만나요.', exampleTrans: 'Дар моҳи март бо дӯстам вомехӯрам.' },
      { word: '사월', translation: 'апрел', emoji: '🌸', pos: 'noun', ipa: '/sa.wʌl/', example: '사월에 한국에 가요.', exampleTrans: 'Дар моҳи апрел ба Корея меравам.' },
      { word: '오월', translation: 'май', emoji: '🌷', pos: 'noun', ipa: '/o.wʌl/', example: '오월에 여행해요.', exampleTrans: 'Дар моҳи май сафар мекунам.' },
      { word: '유월', translation: 'июн', emoji: '🌞', pos: 'noun', ipa: '/ju.wʌl/', example: '유월에 수박 먹어요.', exampleTrans: 'Дар моҳи июн тарбуз мехӯрам.' },
    ],
  },
  {
    title: '월 2', titleTranslated: 'Моҳҳо (7–12)', emoji: '🍁',
    words: [
      { word: '칠월', translation: 'июл', emoji: '🏖️', pos: 'noun', ipa: '/tɕʰi.ɾwʌl/', example: '칠월에 바다에 가요.', exampleTrans: 'Дар моҳи июл ба баҳр меравам.' },
      { word: '팔월', translation: 'август', emoji: '🍉', pos: 'noun', ipa: '/pʰa.ɾwʌl/', example: '팔월은 아주 더워요.', exampleTrans: 'Август хеле гарм аст.' },
      { word: '구월', translation: 'сентябр', emoji: '🍂', pos: 'noun', ipa: '/ku.wʌl/', example: '구월에 학교에 가요.', exampleTrans: 'Дар моҳи сентябр ба мактаб меравам.' },
      { word: '시월', translation: 'октябр', emoji: '🍁', pos: 'noun', ipa: '/ɕi.wʌl/', example: '시월에 산책해요.', exampleTrans: 'Дар моҳи октябр сайр мекунам.' },
      { word: '십일월', translation: 'ноябр', emoji: '🧥', pos: 'noun', ipa: '/ɕi.bi.ɾwʌl/', example: '십일월에 추워요.', exampleTrans: 'Ноябр хунук аст.' },
      { word: '십이월', translation: 'декабр', emoji: '🧣', pos: 'noun', ipa: '/ɕi.bi.wʌl/', example: '십이월에 눈이 와요.', exampleTrans: 'Дар моҳи декабр барф меборад.' },
    ],
  },
  {
    title: '시간 표현 1', titleTranslated: 'Ифодаи вақт 1', emoji: '📆',
    words: [
      { word: '오늘', translation: 'имрӯз', emoji: '📅', pos: 'noun', ipa: '/o.nɯl/', example: '오늘 학교에 안 가요.', exampleTrans: 'Имрӯз ба мактаб намеравам.' },
      { word: '내일', translation: 'фардо', emoji: '🔜', pos: 'noun', ipa: '/ne.il/', example: '내일 뭐 해요?', exampleTrans: 'Фардо чӣ кор мекунед?' },
      { word: '어제', translation: 'дирӯз', emoji: '🔙', pos: 'noun', ipa: '/ʌ.dʑe/', example: '어제 영화 봤어요.', exampleTrans: 'Дирӯз филм тамошо кардам.' },
      { word: '이번 주', translation: 'ин ҳафта', emoji: '📍', pos: 'noun', ipa: '/i.bʌn tɕu/', example: '이번 주에 여행해요.', exampleTrans: 'Ин ҳафта сафар мекунам.' },
      { word: '다음 주', translation: 'ҳафтаи оянда', emoji: '➡️', pos: 'noun', ipa: '/ta.ɯm tɕu/', example: '다음 주에 만나요.', exampleTrans: 'Ҳафтаи оянда вомехӯрем.' },
      { word: '지난 주', translation: 'ҳафтаи гузашта', emoji: '⬅️', pos: 'noun', ipa: '/tɕi.nan tɕu/', example: '지난 주에 일했어요.', exampleTrans: 'Ҳафтаи гузашта кор кардам.' },
      { word: '주말', translation: 'истироҳат', emoji: '🛋️', pos: 'noun', ipa: '/tɕu.mal/', example: '주말에 쉬어요.', exampleTrans: 'Дар рӯзҳои истироҳат дам мегирам.' },
    ],
  },
  {
    title: '시간 표현 2', titleTranslated: 'Ифодаи вақт 2', emoji: '🗓️',
    words: [
      { word: '년', translation: 'сол', emoji: '🗓️', pos: 'noun', ipa: '/njʌn/', example: '이천이십육 년이에요.', exampleTrans: 'Соли 2026 аст.' },
      { word: '월', translation: 'моҳ (муддат)', emoji: '🌙', pos: 'noun', ipa: '/wʌl/', example: '이번 달은 구월이에요.', exampleTrans: 'Ин моҳ сентябр аст.' },
      { word: '일', translation: 'рӯз, сана', emoji: '🌞', pos: 'noun', ipa: '/il/', example: '오늘은 십 일이에요.', exampleTrans: 'Имрӯз санаи 10-ум аст.' },
      { word: '올해', translation: 'имсол', emoji: '🎯', pos: 'noun', ipa: '/o.ɾe/', example: '올해 한국에 가요.', exampleTrans: 'Имсол ба Корея меравам.' },
      { word: '내년', translation: 'соли оянда', emoji: '⏭️', pos: 'noun', ipa: '/ne.njʌn/', example: '내년에 대학교에 가요.', exampleTrans: 'Соли оянда ба донишгоҳ меравам.' },
      { word: '작년', translation: 'соли гузашта', emoji: '⏮️', pos: 'noun', ipa: '/tɕaŋ.njʌn/', example: '작년에 한국어 공부했어요.', exampleTrans: 'Соли гузашта кореягӣ омӯхтам.' },
      { word: '생일', translation: 'зодрӯз', emoji: '🎂', pos: 'noun', ipa: '/seŋ.il/', example: '오늘 제 생일이에요.', exampleTrans: 'Имрӯз зодрӯзи ман аст.' },
    ],
  },
  {
    title: '주말 활동', titleTranslated: 'Машғулиятҳо', emoji: '🛋️',
    words: [
      { word: '산책해요', translation: 'сайр мекунам', emoji: '🚶', pos: 'verb', ipa: '/san.tɕʰe.kʰe.jo/', example: '공원에서 산책해요.', exampleTrans: 'Дар боғ сайр мекунам.' },
      { word: '여행해요', translation: 'сафар мекунам', emoji: '🧳', pos: 'verb', ipa: '/jʌ.heŋ.he.jo/', example: '저는 한국에 여행해요.', exampleTrans: 'Ман ба Корея сафар мекунам.' },
      { word: '영화', translation: 'филм', emoji: '🎬', pos: 'noun', ipa: '/jʌŋ.hwa/', example: '어제 영화 봤어요.', exampleTrans: 'Дирӯз филм тамошо кардам.' },
      { word: '책', translation: 'китоб', emoji: '📖', pos: 'noun', ipa: '/tɕʰek̚/', example: '저는 매일 책 읽어요.', exampleTrans: 'Ман ҳар рӯз китоб мехонам.' },
      { word: '같이', translation: 'якҷоя, бо ҳам (качхи)', emoji: '🤝', pos: 'adverb', ipa: '/ka.tɕʰi/', example: '친구하고 같이 밥 먹어요.', exampleTrans: 'Бо дӯстам якҷоя хӯрок мехӯрам.' },
      { word: '수영해요', translation: 'шино мекунам', emoji: '🏊', pos: 'verb', ipa: '/su.jʌŋ.he.jo/', example: '주말에 수영해요.', exampleTrans: 'Рӯзи истироҳат шино мекунам.' },
    ],
  },
  {
    title: '묻고 답하기', titleTranslated: 'Савол ва ҷавоб', emoji: '❓',
    words: [
      { word: '언제', translation: 'кай', emoji: '❓', pos: 'adverb', ipa: '/ʌn.dʑe/', example: '언제 한국에 가요?', exampleTrans: 'Кай ба Корея меравед?' },
      { word: '무슨', translation: 'кадом, чӣ гуна', emoji: '🤷', pos: 'adverb', ipa: '/mu.sɯn/', example: '오늘 무슨 요일이에요?', exampleTrans: 'Имрӯз кадом рӯзи ҳафта аст?' },
      { word: '며칠', translation: 'чандум, кадом сана', emoji: '📆', pos: 'noun', ipa: '/mjʌ.tɕʰil/', example: '오늘 며칠이에요?', exampleTrans: 'Имрӯз чандум (кадом сана) аст?' },
      { word: '파티', translation: 'базм', emoji: '🎉', pos: 'noun', ipa: '/pʰa.tʰi/', example: '내일 생일 파티 해요.', exampleTrans: 'Фардо базми зодрӯз мекунам.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: '문법: 시간에 에', lessonTitleTranslated: 'Грамматика: 월요일에 가요',
    title: '명사(시간) + 에', titleTranslated: 'Исм (вақт) + 에',
    emoji: '🕒',
    explanation: 'Барои ифодаи вақт ё рӯз ба калима ҳиссачаи 에 илова карда мешавад. (Масалан: 주말에, 월요일에). Аммо ба калимаҳои 오늘, 내일, 어제, 언제 ҳиссачаи 에 илова намешавад.',
    rules: [
      { pattern: 'Вақт + 에', note: '주말에, 월요일에, 5월에.' },
      { pattern: 'Истисноҳо (БЕ 에)', note: '오늘, 내일, 어제, 언제.' },
    ],
    examples: [
      { sentence: '월요일에 학교에 가요.', translation: 'Рӯзи душанбе ба мактаб меравам.', highlight: '월요일에' },
      { sentence: '주말에 공원에서 산책해요.', translation: 'Дар рӯзҳои истироҳат дар боғ сайр мекунам.', highlight: '주말에' },
      { sentence: '오늘 영화를 봐요.', translation: 'Имрӯз филм тамошо мекунам.', highlight: '오늘' },
      { sentence: '제 생일은 언제예요?', translation: 'Зодрӯзи ман кай аст?', highlight: '언제' },
    ],
    exercises: [
      { prompt: '___에 한국어 공부해요.', promptTranslated: 'Рӯзи ҷумъа кореягӣ меомӯзам.', answer: '금요일', options: ['금요일', '오늘', '어제', '내일'], explanation: 'Дар ин ҷо 금요일 дуруст аст.' },
      { prompt: '___ 쉬어요.', promptTranslated: 'Имрӯз дам мегирам.', answer: '오늘', options: ['오늘', '오늘에', '주말', '월요일에'], explanation: 'Ба калимаи 오늘 ҳиссачаи 에 илова намешавад.' },
      { prompt: '___ 학교에 가요.', promptTranslated: 'Рӯзи душанбе ба мактаб меравам.', answer: '월요일에', options: ['월요일에', '월요일', '오늘에', '내일에'], explanation: 'Ба калимаи 월요일 ҳиссачаи 에 лозим аст.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Рӯзи душанбе ба мактаб меравам.', answer: '월요일에 학교에 가요.', options: ['가요', '월요일에', '학교에'], explanation: '월요일에 학교에 가요 дуруст аст.' },
    ],
  },
  {
    lessonTitle: '문법: 과거형 -았/었/했어요', lessonTitleTranslated: 'Грамматика: 어제 공부했어요',
    title: '동사/형용사 + 았/었/했어요', titleTranslated: 'Замони гузашта: -았/었/했어요',
    emoji: '🔙',
    explanation: 'Замони гузашта: а/о + 았어요 (갔어요, 봤어요). Дигар + 었어요 (먹었어요). 하다 + 했어요 (공부했어요).',
    rules: [
      { pattern: '아, 오 + 았어요', note: '가다 -> 갔어요, 보다 -> 봤어요' },
      { pattern: 'Дигар + 었어요', note: '먹다 -> 먹었어요, 읽다 -> 읽었어요' },
      { pattern: '하다 -> 했어요', note: '공부하다 -> 공부했어요' },
    ],
    examples: [
      { sentence: '어제 공원에서 산책했어요.', translation: 'Дирӯз дар боғ сайр кардам.', highlight: '산책했어요' },
      { sentence: '주말에 영화를 봤어요.', translation: 'Рӯзҳои истироҳат филм тамошо кардам.', highlight: '봤어요' },
      { sentence: '어제 친구를 만났어요.', translation: 'Дирӯз бо дӯстам вохӯрдам.', highlight: '만났어요' },
      { sentence: '아침에 빵을 먹었어요.', translation: 'Дар наҳорӣ нон хӯрдам.', highlight: '먹었어요' },
      { sentence: '일요일에 집에서 쉬었어요.', translation: 'Рӯзи якшанбе дар хона дам гирифтам.', highlight: '쉬었어요' },
    ],
    exercises: [
      { prompt: '어제 공원에서 ___.', promptTranslated: 'Дирӯз дар боғ сайр кардам.', answer: '산책했어요', options: ['산책했어요', '산책해요', '산책', '가요'], explanation: 'Дар ин ҷо феъли 산책했어요 лозим аст.' },
      { prompt: '어제 영화를 ___.', promptTranslated: 'Дирӯз филм тамошо кардам.', answer: '봤어요', options: ['봤어요', '봐요', '보다', '먹었어요'], explanation: '보다 -> 보 + 았어요 = 봤어요.' },
      { prompt: '주말에 책을 ___.', promptTranslated: 'Рӯзҳои истироҳат китоб хондам.', answer: '읽었어요', options: ['읽었어요', '읽어요', '봤어요', '잤어요'], explanation: '읽다 -> 읽었어요.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Дирӯз ӯ себро хӯрд.', answer: '어제 사과를 먹었어요.', options: ['먹었어요', '어제', '사과를'], explanation: '어제 사과를 먹었어요.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading', speaker: '마이클', skillType: 'reading', xpReward: 20, kind: 'reading',
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш: 마이클의 주말',
    title: '마이클의 주말', titleTranslated: 'Рӯзҳои истироҳати Майкл',
    emoji: '📖',
    passage: '저는 미국 사람이에요. 지금 회사원이에요. 저는 어제 친구 생일 파티에 갔어요. 생일 파티는 식당에서 했어요. 친구하고 같이 한국 음식을 먹었어요. 아주 재미있었어요. 오늘은 일요일이에요. 오늘은 회사에 안 가요. 집에서 쉬어요. 내일은 월요일이에요. 내일 회사에 가요.',
    passageTranslated: 'Ман амрикоӣ ҳастам. Ҳоло корманди ширкат ҳастам. Дирӯз ба базми зодрӯзи дӯстам рафтам. Базми зодрӯз дар тарабхона буд. Бо дӯстам якҷоя хӯроки кореягӣ хӯрдам. Хеле ҷолиб буд. Имрӯз якшанбе аст. Имрӯз ба кор намеравам. Дар хона дам мегирам. Фардо душанбе аст. Фардо ба кор меравам.',
    questions: [
      { question: '마이클 씨는 어제 어디에 갔어요?', questionTranslated: 'Майкл дирӯз ба куҷо рафт?', answer: '생일 파티에 갔어요.', options: ['생일 파티에 갔어요.', '회사에 갔어요.', '병원에 갔어요.', '학교에 갔어요.'] },
      { question: '마이클 씨는 어제 무엇을 먹었어요?', questionTranslated: 'Майкл дирӯз чӣ хӯрд?', answer: '한국 음식을 먹었어요.', options: ['한국 음식을 먹었어요.', '미국 음식을 먹었어요.', '빵을 먹었어요.', '과일을 먹었어요.'] },
      { question: '오늘은 무슨 요일이에요?', questionTranslated: 'Имрӯз кадом рӯзи ҳафта аст?', answer: '일요일이에요.', options: ['일요일이에요.', '토요일이에요.', '월요일이에요.', '금요일이에요.'] },
    ],
  },
  {
    slot: 'listening', speaker: '사라', skillType: 'listening', xpReward: 20, kind: 'listening',
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунавоӣ: 안나의 생일',
    title: '안나의 생일', titleTranslated: 'Зодрӯзи Анна',
    emoji: '🎧',
    passage: '안나 씨 생일은 오월 십 일이에요. 이번 주 금요일이에요. 그래서 금요일에 친구들이 안나 씨 집에 와요. 친구들은 안나 씨하고 같이 밥을 먹어요. 재미있게 생일 파티를 해요.',
    passageTranslated: 'Зодрӯзи Анна 10 май аст. Ҷумъаи ҳамин ҳафта аст. Бинобар ин, рӯзи ҷумъа дӯстон ба хонаи Анна меоянд. Дӯстон бо Анна якҷоя хӯрок мехӯранд. Онҳо бо шавқ базми зодрӯз мекунанд.',
    questions: [
      { question: '안나 씨 생일은 언제예요?', questionTranslated: 'Зодрӯзи Анна кай аст?', answer: '오월 십 일이에요.', options: ['오월 십 일이에요.', '오월 이십 일이에요.', '유월 십 일이에요.', '칠월 십 일이에요.'] },
      { question: '안나 씨 생일 파티는 무슨 요일에 해요?', questionTranslated: 'Базми зодрӯзи Анна дар кадом рӯзи ҳафта мешавад?', answer: '금요일이에요.', options: ['금요일이에요.', '토요일이에요.', '일요일이에요.', '월요일이에요.'] },
      { question: '친구들은 어디에 와요?', questionTranslated: 'Дӯстон ба куҷо меоянд?', answer: '안나 씨 집에 와요.', options: ['안나 씨 집에 와요.', '식당에 와요.', '공원에 와요.', '학교에 와요.'] },
    ],
  },
  {
    slot: 'review', speaker: '알리', skillType: 'review', xpReward: 20, kind: 'reading',
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '복습 퀴즈', titleTranslated: 'Санҷиши такрорӣ',
    emoji: '🔄',
    passage: '마이클 씨는 어제 친구하고 영화를 봤어요. 오늘은 공원에서 산책해요. 내일은 집에서 쉬어요.',
    passageTranslated: 'Майкл дирӯз бо дӯсташ филм тамошо кард. Имрӯз дар боғ сайр мекунад. Фардо дар хона дам мегирад.',
    questions: [
      { question: '어제 무엇을 했어요?', questionTranslated: 'Дирӯз чӣ кор кард?', answer: '영화를 봤어요.', options: ['영화를 봤어요.', '산책해요.', '쉬어요.', '학교에 가요.'] },
      { question: '오늘 무엇을 해요?', questionTranslated: 'Имрӯз чӣ кор мекунад?', answer: '산책해요.', options: ['산책해요.', '영화를 봤어요.', '쉬어요.', '일해요.'] },
      { question: '내일 어디에 있어요?', questionTranslated: 'Фардо дар куҷо мешавад?', answer: '집에 있어요.', options: ['집에 있어요.', '공원에 있어요.', '회사에 있어요.', '식당에 있어요.'] },
    ],
  },
  {
    slot: 'test', speaker: '유키', skillType: 'test', xpReward: 30, kind: 'reading',
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳони Модули 6',
    title: '모듈 6 시험', titleTranslated: 'Имтиҳони Модул',
    emoji: '🎓',
    passage: '저는 지난 주말에 한국에 여행을 갔어요. 일요일에 공원에서 산책했어요. 월요일에 다시 집에 왔어요. 아주 재미있었어요. 다음 주말에는 집에서 쉴 거예요.',
    passageTranslated: 'Ман рӯзҳои истироҳати гузашта ба Корея сафар кардам. Якшанбе дар боғ сайр кардам. Душанбе боз ба хона омадам. Хеле ҷолиб буд. Рӯзҳои истироҳати оянда дар хона дам мегирам.',
    questions: [
      { question: '이 글은 무엇에 대한 글입니까?', questionTranslated: 'Ин матн дар бораи чист?', answer: '주말 활동', options: ['주말 활동', '직업', '나이', '음식'] },
      { question: '언제 집에 왔어요?', questionTranslated: 'Кай ба хона омад?', answer: '월요일에 왔어요.', options: ['월요일에 왔어요.', '일요일에 왔어요.', '화요일에 왔어요.', '주말에 왔어요.'] },
      { question: '빈칸에 들어갈 알맞은 말을 고르십시오. "저는 내일 영화를 ___. "', questionTranslated: 'Варианти дурустро интихоб кунед.', answer: '봐요', options: ['봐요', '봤어요', '보았어요', '봅니다'] },
      { question: '빈칸에 들어갈 알맞은 말을 고르십시오. "저는 어제 공원에서 ___. "', questionTranslated: 'Варианти дурустро интихоб кунед.', answer: '산책했어요', options: ['산책했어요', '산책해요', '산책할 거예요', '산책'] },
    ],
  },
];

export const DIALOGUE = {
  lessonTitle: '말하기', lessonTitleTranslated: 'Муколама: 주말 활동',
  title: '주말 활동', titleTranslated: 'Машғулиятҳои рӯзи истироҳат',
  emoji: '🗣️',
  situation: 'Алӣ ва Минсу сӯҳбат мекунанд.',
  lines: [
    { speaker: '알리', text: '민수 씨, 주말에 뭐 했어요?', translation: 'Минсу, рӯзи истироҳат чӣ кор кардед?', audioPath: null, isUser: true },
    { speaker: '민수', text: '저는 공원에서 산책했어요. 알리 씨는요?', translation: 'Ман дар боғ сайр кардам. Алӣ, шумо чӣ?', audioPath: null, isUser: false },
    { speaker: '알리', text: '저는 집에서 쉬었어요. 그리고 영화를 봤어요.', translation: 'Ман дар хона дам гирифтам. Ва филм тамошо кардам.', audioPath: null, isUser: true },
    { speaker: '민수', text: '무슨 영화를 봤어요?', translation: 'Кадом филмро тамошо кардед?', audioPath: null, isUser: false },
    { speaker: '알리', text: '한국 영화를 봤어요. 아주 재미있었어요.', translation: 'Филми кореягӣ тамошо кардам. Хеле ҷолиб буд.', audioPath: null, isUser: true },
    { speaker: '민수', text: '그래요? 저도 한국 영화를 좋아해요.', translation: 'Ҳамин тавр? Ман ҳам филмҳои кореягиро нағз мебинам.', audioPath: null, isUser: false },
  ],
};

export const WRITING = {
  lessonTitle: '쓰기', lessonTitleTranslated: 'Навиштан',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['월요일', '오늘', '내일', '어제', '주말', '생일', '수영해요', '같이'],
};

export const ORDER = [
  'vocab:요일',
  'vocab:월 1',
  'vocab:월 2',
  'vocab:시간 표현 1',
  'vocab:시간 표현 2',
  'vocab:주말 활동',
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
