export const MODULE = {
  order: 11,
  title: '취미와 운동',
  titleTranslated: 'Ҳоббӣ ва Варзиш',
  emoji: '⚽',
  canDoStatement: 'Шумо метавонед дар бораи маҳфилҳо (ҳоббӣ), варзиш, қобилиятҳо ва он чизе, ки дӯст медоред, озодона суҳбат кунед.',
};

export const KNOWN_FROM = [
  './_ko-m1-content.mjs',
  './_ko-m2-content.mjs',
  './_ko-m3-content.mjs',
  './_ko-m4-content.mjs',
  './_ko-m5-content.mjs',
  './_ko-m6-content.mjs',
  './_ko-m7-content.mjs',
  './_ko-m8-content.mjs',
  './_ko-m9-content.mjs',
  './_ko-m10-content.mjs',
  './_ko-m11-content.mjs',
];

export const EXTRA_KNOWN = [
  '음악을', '영화를', '노래를', '그림을', '게임을', '피아노를', '한국어를', '영어를', '운동을', '축구를', '농구를', '야구를', '배구를', '수영을', '태권도를', '할', '수', '미술관에서', '공을', '기타를', '편해요', '스키를', '춤을', '듣고', '경기에서', '등산은', '선수가', '친구와', '여름을', '겨울을', '를', '을', '매운', '음식을', '먹을', '갈', '하ㄹ', '아요', '읽을', '어요', '배울', '배우를', '배우할', '배우수', '축구와', '주말마다', '친구들과', '공원에서', '거예요', '요리', '무엇을', '못해요', '보는', '것을', '씨는요', '집에서', '피아노나', '어디에서', '어렵지만', '공부를', '밥을', '즐거울', '공부는', '쉽고', '어렵고', '지루해요', '도서관에서', '듣는', '것입니다', '자전거를', '타고', '놀', '듣기', '치기', '하기', '타기', '들을', '아',
  '이거', '저거', '그거', '아주', '조금', '원', '마리', '번', '살', '마세요', '주세요',
  '어때요', '괜찮아요', '좋아요', '싫어요', '맛있어요', '맛없어요', '재미있어요', '재미없어요',
  '어디', '무엇', '누구', '언제', '왜', '어떻게', '무슨', '어느', '몇',
  '입니다', '입니까', '습니다', '습니까', '아/어요',
  '을/를', '이/가', '은/는', '에', '에서', '도', '만', '하고', '과/와', '의', '으로', '로',
  '안', '못', '지 않다', '지 못하다',
  '그리고', '그래서', '그러나', '하지만', '그러면', '그럼',
  '진짜', '정말', '너무', '많이', '조금', '약간', '별로', '전혀', '다', '모두',
  '사과를', '커피를', '빵을', '우유를', '옷을', '책을', '물을', '가방이', '책상이', '침대가', '냉장고가',
  '사요', '팔아요', '비싸요', '싸요',
  '사과', '수박', '물', '커피', '우유', '빵', '밥', '국', '반찬', '고기', '생선', '야채', '과일', '계란',
  '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
  '개', '명', '잔', '병', '인분', '층',
  '있어요', '없어요', '한', '두', '세', '네',
  '저는', '씨', '이에요', '예요', '해요', '했어요', '하세요',
  '같이', '때문에', '매일', '항상', '가끔', '자주', '보통', '오늘', '어제', '내일', '지금',
  '먹어요', '마셔요', '봐요', '가요', '와요',
  '먹을래요', '마실래요', '갈래요', '할래요',
  '학교에', '식당에', '집에', '방에',
  
  // From M11 (Weather & Future)
  '봄', '여름', '가을', '겨울', '계절', '더워요', '추워요',
  '날씨', '맑아요', '흐려요', '비가', '비', '눈이', '눈', '바람이', '바람', '구름',
  '불어요', '따뜻해요', '시원해요', '쌀쌀해요', '우산',
  '바다', '산', '나무', '꽃', '하늘',
  '산책해요', '등산해요', '수영해요', '여행해요', '구경해요', '놀아요', '쉬어요',
  '주말에', '방학', '휴가', '이번', '다음', '작년', '내년',
  '기분', '아름다워요', '즐거워요', '피곤해요', '바빠요', '아파요', '찍어요',
  '고', '할 거예요', '갈 거예요', '볼 거예요', '될 거예요', '먹을 거예요'
];

export const CHARACTERS = {
  '마이클': { country: '미국', job: '학생', gender: 'm' },
  '안나': { country: '러시아', job: '선생님', gender: 'f' },
  '사라': { country: '영국', job: '의사', gender: 'f' },
  '알리': { country: '이집트', job: '학생', gender: 'm' },
  '유키': { country: '일본', job: '요리사', gender: 'f' },
  '수진': { country: '한국', job: '회사원', gender: 'f' },
  '민수': { country: '한국', job: '경찰관', gender: 'm' },
};
export const NAMES = Object.keys(CHARACTERS);

export const FAMILY = {
  '수진': { 남편: '마이클', 어머니: '사라', 아버지: '알리', 오빠: '민수' },
  '민수': { 여동생: '수진', 어머니: '사라', 아버지: '알리' },
};

export const VOCAB = [
  {
    title: '취미 1', titleTranslated: 'Ҳоббӣ 1', emoji: '🎨',
    words: [
      { word: '취미', translation: 'ҳоббӣ', emoji: '🧩', pos: 'noun', ipa: '/tɕʰwi.mi/', example: '취미가 뭐예요?', exampleTrans: 'Ҳоббии шумо чист?' },
      { word: '음악', translation: 'мусиқӣ', emoji: '🎵', pos: 'noun', ipa: '/ɯ.mak/', example: '음악을 들어요.', exampleTrans: 'Мусиқӣ мешунавам.' },
      { word: '영화', translation: 'кино / филм', emoji: '🎬', pos: 'noun', ipa: '/jʌŋ.hwa/', example: '영화를 봐요.', exampleTrans: 'Кино тамошо мекунам.' },
      { word: '노래', translation: 'суруд', emoji: '🎤', pos: 'noun', ipa: '/no.ɾɛ/', example: '노래를 불러요.', exampleTrans: 'Суруд месароям.' },
      { word: '그림', translation: 'тасвир / расм', emoji: '🖼️', pos: 'noun', ipa: '/kɯ.ɾim/', example: '그림을 그려요.', exampleTrans: 'Расм мекашам.' },
      { word: '독서', translation: 'мутолиа / китобхонӣ', emoji: '📖', pos: 'noun', ipa: '/tok.s͈ʌ/', example: '제 취미는 독서예요.', exampleTrans: 'Ҳоббии ман мутолиа аст.' },
      { word: '게임', translation: 'бозӣ', emoji: '🎮', pos: 'noun', ipa: '/ke.im/', example: '게임을 해요.', exampleTrans: 'Бозӣ мекунам.' },
    ],
  },
  {
    title: '취미 동사', titleTranslated: 'Феълҳои Ҳоббӣ', emoji: '🏃',
    words: [
      { word: '들어요', translation: 'мешунавам', emoji: '🎧', pos: 'verb', ipa: '/tɯ.ɾʌ.jo/', example: '음악을 들어요.', exampleTrans: 'Мусиқӣ мешунавам.', highlight: '들어요' },
      { word: '불러요', translation: 'месароям (суруд)', emoji: '🗣️', pos: 'verb', ipa: '/pul.lʌ.jo/', example: '노래를 불러요.', exampleTrans: 'Суруд месароям.', highlight: '불러요' },
      { word: '그려요', translation: 'мекашам (расм)', emoji: '🖌️', pos: 'verb', ipa: '/kɯ.ɾjʌ.jo/', example: '그림을 그려요.', exampleTrans: 'Расм мекашам.', highlight: '그려요' },
      { word: '쳐요', translation: 'менавозам (пианино)', emoji: '🎹', pos: 'verb', ipa: '/tɕʰjʌ.jo/', example: '피아노를 쳐요.', exampleTrans: 'Пианино менавозам.', highlight: '쳐요' },
      { word: '만들어요', translation: 'месозам / тайёр мекунам', emoji: '🛠️', pos: 'verb', ipa: '/man.dɯ.ɾʌ.jo/', example: '빵을 만들어요.', exampleTrans: 'Нон тайёр мекунам.', highlight: '만들어요' },
      { word: '배워요', translation: 'меомӯзам', emoji: '📝', pos: 'verb', ipa: '/pɛ.wʌ.jo/', example: '한국어를 배워요.', exampleTrans: 'Забони кореягиро меомӯзам.', highlight: '배워요' },
      { word: '가르쳐요', translation: 'меомӯзонам / дарс медиҳам', emoji: '👨‍🏫', pos: 'verb', ipa: '/ka.ɾɯ.tɕʰjʌ.jo/', example: '영어를 가르쳐요.', exampleTrans: 'Англисиро дарс медиҳам.', highlight: '가르쳐요' },
    ],
  },
  {
    title: '스포츠', titleTranslated: 'Варзиш', emoji: '⚽',
    words: [
      { word: '운동', translation: 'варзиш', emoji: '🏋️', pos: 'noun', ipa: '/un.doŋ/', example: '매일 운동을 해요.', exampleTrans: 'Ҳар рӯз варзиш мекунам.' },
      { word: '축구', translation: 'футбол', emoji: '⚽', pos: 'noun', ipa: '/tɕʰuk.k͈u/', example: '축구를 좋아해요.', exampleTrans: 'Футболро дӯст медорам.' },
      { word: '농구', translation: 'баскетбол', emoji: '🏀', pos: 'noun', ipa: '/noŋ.ɡu/', example: '농구를 잘해요.', exampleTrans: 'Баскетболро хуб бозӣ мекунам.' },
      { word: '야구', translation: 'бейс볼', emoji: '⚾', pos: 'noun', ipa: '/ja.ɡu/', example: '야구를 봐요.', exampleTrans: 'Бейсболро тамошо мекунам.' },
      { word: '배구', translation: 'волейбол', emoji: '🏐', pos: 'noun', ipa: '/pɛ.ɡu/', example: '배구를 해요.', exampleTrans: 'Волейбол бозӣ мекунам.' },
      { word: '수영', translation: 'шиноварӣ', emoji: '🏊', pos: 'noun', ipa: '/su.jʌŋ/', example: '수영을 배워요.', exampleTrans: 'Шиновариро меомӯзам.' },
      { word: '태권도', translation: 'тхэквондо', emoji: '🥋', pos: 'noun', ipa: '/tʰɛ.k͈wʌn.do/', example: '태권도를 할 수 있어요.', exampleTrans: 'Тхэквондо карда метавонам.' },
    ],
  },
  {
    title: '여가 장소와 물건', titleTranslated: 'Ҷойҳо ва Ашёҳои Истироҳатӣ', emoji: '🎟️',
    words: [
      { word: '영화관', translation: 'кинотеатр', emoji: '🍿', pos: 'noun', ipa: '/jʌŋ.hwa.ɡwan/', example: '영화관에 가요.', exampleTrans: 'Ба кинотеатр меравам.' },
      { word: '미술관', translation: 'осорхонаи рассомӣ', emoji: '🖼️', pos: 'noun', ipa: '/mi.sul.ɡwan/', example: '미술관에서 그림을 봐요.', exampleTrans: 'Дар осорхона расмҳоро тамошо мекунам.' },
      { word: '공', translation: 'тӯб', emoji: '🏐', pos: 'noun', ipa: '/koŋ/', example: '공을 사요.', exampleTrans: 'Тӯб мехарам.' },
      { word: '피아노', translation: 'пианино', emoji: '🎹', pos: 'noun', ipa: '/pʰi.a.no/', example: '피아노를 쳐요.', exampleTrans: 'Пианино менавозам.' },
      { word: '기타', translation: 'гитара', emoji: '🎸', pos: 'noun', ipa: '/ki.tʰa/', example: '기타를 쳐요.', exampleTrans: 'Гитара менавозам.' },
      { word: '운동화', translation: 'пойафзоли варзишӣ', emoji: '👟', pos: 'noun', ipa: '/un.doŋ.hwa/', example: '운동화가 편해요.', exampleTrans: 'Кроссовка бароҳат аст.' },
      { word: '스키', translation: 'лыжа', emoji: '🎿', pos: 'noun', ipa: '/sɯ.kʰi/', example: '겨울에 스키를 타요.', exampleTrans: 'Дар зимистон лыжа меронам.' },
    ],
  },
  {
    title: '능력과 선호', titleTranslated: 'Қобилият ва Таваҷҷӯҳ', emoji: '👍',
    words: [
      { word: '춤', translation: 'рақс', emoji: '💃', pos: 'noun', ipa: '/tɕʰum/', example: '춤을 좋아해요.', exampleTrans: 'Рақсро дӯст медорам.' },
      { word: '춰요', translation: 'рақс мекунам (춤을 춰요)', emoji: '🕺', pos: 'verb', ipa: '/tɕʰwʌ.jo/', example: '음악을 듣고 춤을 춰요.', exampleTrans: 'Мусиқӣ гӯш карда рақс мекунам.', highlight: '춰요' },
      { word: '이겨요', translation: 'ғолиб мешавам / мебарам', emoji: '🏆', pos: 'verb', ipa: '/i.ɡjʌ.jo/', example: '축구 경기에서 이겨요.', exampleTrans: 'Дар мусобиқаи футбол ғолиб мешавам.', highlight: '이겨요' },
      { word: '져요', translation: 'мағлуб мешавам / мебозам', emoji: '😞', pos: 'verb', ipa: '/tɕjʌ.jo/', example: '야구 경기에서 져요.', exampleTrans: 'Дар мусобиқаи бейс볼 мағлуб мешавам.', highlight: '져요' },
      { word: '좋아해요', translation: 'дӯст медорам', emoji: '❤️', pos: 'verb', ipa: '/tɕo.a.hɛ.jo/', example: '저는 음악을 좋아해요.', exampleTrans: 'Ман мусиқиро дӯст медорам.', highlight: '좋아해요' },
      { word: '싫어해요', translation: 'бад мебинам / намеписандам', emoji: '👎', pos: 'verb', ipa: '/ɕi.ɾʌ.hɛ.jo/', example: '운동을 싫어해요.', exampleTrans: 'Варзишро бад мебинам.', highlight: '싫어해요' },
      { word: '잘해요', translation: 'хуб иҷро мекунам', emoji: '👏', pos: 'verb', ipa: '/tɕa.ɾɛ.jo/', example: '한국어를 잘해요.', exampleTrans: 'Кореягиро хуб медонам.', highlight: '잘해요' },
    ],
  },
  {
    title: '상태 형용사', titleTranslated: 'Сифатҳои Ҳолат', emoji: '🏋️',
    words: [
      { word: '어려워요', translation: 'душвор аст', emoji: '🧩', pos: 'adj', ipa: '/ʌ.ɾjʌ.wʌ.jo/', example: '한국어는 어려워요.', exampleTrans: 'Кореягӣ душвор аст.', highlight: '어려워요' },
      { word: '쉬워요', translation: 'осон аст', emoji: '✅', pos: 'adj', ipa: '/ɕwi.wʌ.jo/', example: '이 책은 쉬워요.', exampleTrans: 'Ин китоб осон аст.', highlight: '쉬워요' },
      { word: '무거워요', translation: 'вазнин аст', emoji: '🐘', pos: 'adj', ipa: '/mu.ɡʌ.wʌ.jo/', example: '가방이 무거워요.', exampleTrans: 'Сумка вазнин аст.', highlight: '무거워요' },
      { word: '가벼워요', translation: 'сабук аст', emoji: '🎈', pos: 'adj', ipa: '/ka.bjʌ.wʌ.jo/', example: '가방이 가벼워요.', exampleTrans: 'Сумка сабук аст.', highlight: '가벼워요' },
      { word: '힘들어요', translation: 'мушкил/хастакунанда аст', emoji: '😓', pos: 'adj', ipa: '/him.dɯ.ɾʌ.jo/', example: '등산은 힘들어요.', exampleTrans: 'Кӯҳнавардӣ хастакунанда аст.', highlight: '힘들어요' },
      { word: '멋있어요', translation: 'ҷолиб/хушқад аст', emoji: '😎', pos: 'adj', ipa: '/mʌ.ɕi.s͈ʌ.jo/', example: '축구 선수가 멋있어요.', exampleTrans: 'Варзишгари футбол хушқад аст.', highlight: '멋있어요' },
      { word: '귀여워요', translation: 'ширин / зебо (cute)', emoji: '🥺', pos: 'adj', ipa: '/kwi.jʌ.wʌ.jo/', example: '고양이가 귀여워요.', exampleTrans: 'Гурба ширин аст.', highlight: '귀여워요' },
    ],
  },
  {
    title: '빈도와 정도', titleTranslated: 'Басомад ва Дараҷа', emoji: '📊',
    words: [
      { word: '주로', translation: 'асосан', emoji: '📈', pos: 'adv', ipa: '/tɕu.ɾo/', example: '주로 주말에 쉬어요.', exampleTrans: 'Асосан дар охири ҳафта истироҳат мекунам.' },
      { word: '혼자', translation: 'танҳо', emoji: '👤', pos: 'adv', ipa: '/hon.dʑa/', example: '혼자 영화를 봐요.', exampleTrans: 'Танҳо кино тамошо мекунам.' },
      { word: '함께', translation: 'якҷоя', emoji: '👥', pos: 'adv', ipa: '/ham.k͈e/', example: '친구와 함께 가요.', exampleTrans: 'Бо дӯстам якҷоя меравам.' },
      { word: '가장', translation: 'аз ҳама (the most)', emoji: '🥇', pos: 'adv', ipa: '/ka.dʑaŋ/', example: '여름을 가장 좋아해요.', exampleTrans: 'Тобистонро аз ҳама бештар дӯст медорам.' },
      { word: '제일', translation: 'аз ҳама (№1)', emoji: '1️⃣', pos: 'adv', ipa: '/tɕe.il/', example: '수영이 제일 재미있어요.', exampleTrans: 'Шиноварӣ аз ҳама шавқовар аст.' },
      { word: '일찍', translation: 'барвақт', emoji: '🌅', pos: 'adv', ipa: '/il.t͈ɕik/', example: '아침에 일찍 일어나요.', exampleTrans: 'Дар саҳар барвақт мехезам.' },
      { word: '늦게', translation: 'дер', emoji: '🌙', pos: 'adv', ipa: '/nɯt.k͈e/', example: '밤에 늦게 자요.', exampleTrans: 'Дар шаб дер хоб мекунам.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: '문법: 을/를 좋아하다', lessonTitleTranslated: 'Грамматика: Дӯст доштан',
    title: '명사 + 을/를 좋아하다/싫어하다', titleTranslated: 'Исм + дӯст доштан/бад дидан',
    emoji: '❤️',
    explanation: 'Дар забони кореягӣ калима барои «хуб» пасванди мубтадоро қабул мекунад. Аммо калима барои «дӯст доштан» пасванди пуркунандаро талаб мекунад. Масалан: «Себ хуб аст» ба маънои «Ман себро дӯст медорам» табдил меёбад.',
    rules: [
      { pattern: '좋다 (Хуб будан)', note: 'Обу ҳаво хуб аст.' },
      { pattern: '좋아하다 (Дӯст доштан)', note: 'Ман шиновариро дӯст медорам.' },
    ],
    examples: [
      { sentence: '저는 축구를 좋아해요.', translation: 'Ман футболро дӯст медорам.', highlight: '축구를 좋아해요' },
      { sentence: '우리는 겨울을 싫어해요.', translation: 'Мо зимистонро бад мебинем.', highlight: '겨울을 싫어해요' },
      { sentence: '음악이 좋아요.', translation: 'Мусиқӣ хуб аст.', highlight: '음악이 좋아요' },
      { sentence: '음악을 좋아해요.', translation: 'Ман мусиқиро дӯст медорам.', highlight: '음악을 좋아해요' },
    ],
    exercises: [
      { prompt: '저는 영화___ 좋아해요.', promptTranslated: 'Ман киноро дӯст медорам.', answer: '를', options: ['를', '가', '는', '에'], explanation: 'Феъли «дӯст доштан» пасванди пуркунандаро талаб мекунад.' },
      { prompt: '운동___ 싫어해요.', promptTranslated: 'Ман варзишро бад мебинам.', answer: '을', options: ['을', '이', '는', '에'], explanation: 'Феъли «бад дидан» пасванди пуркунандаро талаб мекунад.' },
      { prompt: '이 사과___ 좋아요.', promptTranslated: 'Ин себ хуб аст.', answer: '가', options: ['가', '를', '는', '도'], explanation: 'Сифати «хуб» пасванди мубтадоро талаб мекунад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Ман мусиқиро дӯст медорам.', answer: '저는 음악을 좋아해요', options: ['음악을', '저는', '좋아해요'], explanation: 'Ин сохтори дурусти ҷумла аст.' },
    ],
  },
  {
    lessonTitle: '문법: -(으)ㄹ 수 있다', lessonTitleTranslated: 'Грамматика: Тавонистан',
    title: '동사 + -(으)ㄹ 수 있다/없다', titleTranslated: 'Феъл + Тавонистан / Натавонистан',
    emoji: '💪',
    explanation: 'Барои ифодаи қобилият ё имконият, ин сохтори грамматикиро ба феълҳо ҳамроҳ кунед.',
    rules: [
      { pattern: 'Садонок + ㄹ 수 있다', note: 'Баъди садонок ин пасванд илова мешавад (Рафта метавонам).' },
      { pattern: 'Ҳамсадо + 을 수 없다', note: 'Баъди ҳамсадо ин пасванд илова мешавад (Хӯрда наметавонам).' },
    ],
    examples: [
      { sentence: '수영을 할 수 있어요.', translation: 'Ман шиноварӣ карда метавонам.', highlight: '할 수 있어요' },
      { sentence: '저는 피아노를 칠 수 없어요.', translation: 'Ман пианино навохта наметавонам.', highlight: '칠 수 없어요' },
      { sentence: '매운 음식을 먹을 수 있어요?', translation: 'Шумо хӯроки тунд хӯрда метавонед?', highlight: '먹을 수 있어요' },
      { sentence: '오늘은 학교에 갈 수 없어요.', translation: 'Ман имрӯз ба мактаб рафта наметавонам.', highlight: '갈 수 없어요' },
    ],
    exercises: [
      { prompt: '수영을 하___.', promptTranslated: 'Ман шиноварӣ карда метавонам.', answer: 'ㄹ 수 있어요', options: ['ㄹ 수 있어요', '을 수 있어요', '고', '아요'], explanation: 'Решаи феъл бо садонок ба охир мерасад.' },
      { prompt: '책을 읽___.', promptTranslated: 'Ман китобро хонда наметавонам.', answer: '을 수 없어요', options: ['을 수 없어요', 'ㄹ 수 없어요', '고', '어요'], explanation: 'Решаи феъл бо ҳамсадо ба охир мерасад.' },
      { prompt: '저는 한국어를 ___.', promptTranslated: 'Ман метавонам забони кореягиро омӯзам.', answer: '배울 수 있어요', options: ['배울 수 있어요', '배우를 수 있어요', '배우할 수 있어요', '배우수 있어요'], explanation: 'Решаи феъл бо садонок ба охир мерасад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Ман тхэквондо карда метавонам.', answer: '태권도를 할 수 있어요', options: ['태권도를', '수', '할', '있어요'], explanation: 'Ин сохтори дурусти ҷумла аст.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '나의 취미', titleTranslated: 'Ҳоббии ман',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '제 취미는 운동입니다. 저는 축구와 농구를 가장 좋아해요. 주말마다 친구들과 함께 공원에 가요. 공원에서 축구를 해요. 저는 축구를 아주 잘해요. 하지만 수영은 할 수 없어요. 내년 여름에 수영을 배울 거예요.',
    passageTranslated: 'Ҳоббии ман варзиш аст. Ман футбол ва баскетболро аз ҳама бештар дӯст медорам. Ҳар охири ҳафта бо дӯстонам ба боғ меравам. Мо дар боғ футбол бозӣ мекунем. Ман футболро хеле хуб бозӣ мекунам. Аммо шиноварӣ карда наметавонам. Тобистони оянда шиновариро меомӯзам.',
    questions: [
      { question: '이 사람의 취미는 무엇이에요?', questionTranslated: 'Ҳоббии ин шахс чист?', answer: '운동', options: ['운동', '독서', '요리', '음악'], explanation: 'Дар матн гуфта шудааст, ки ҳоббии ӯ варзиш аст.' },
      { question: '주말에 친구들과 어디에 가요?', questionTranslated: 'Ӯ дар охири ҳафта бо дӯстонаш ба куҷо меравад?', answer: '공원', options: ['공원', '영화관', '미술관', '바다'], explanation: 'Дар матн гуфта шудааст, ки ӯ ба боғ меравад.' },
      { question: '이 사람은 무엇을 못해요?', questionTranslated: 'Ин шахс чиро карда наметавонад?', answer: '수영', options: ['수영', '축구', '농구', '야구'], explanation: 'Дар матн гуфта шудааст, ки ӯ шиноварӣ карда наметавонад.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '무슨 운동을 좋아해요?', titleTranslated: 'Кадом варзишро дӯст медоред?',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '수진: 마이클 씨는 취미가 뭐예요? \n마이클: 저는 영화 보는 것을 좋아해요. 주로 주말에 영화관에 가요. 수진 씨는요? \n수진: 저는 음악을 좋아해요. 혼자 집에서 음악을 들어요. \n마이클: 피아노나 기타를 칠 수 있어요? \n수진: 네, 피아노를 칠 수 있어요. 하지만 기타는 어려워요.',
    passageTranslated: 'Суҷин: Майкл, ҳоббии шумо чист? \nМайкл: Ман тамошои киноро дӯст медорам. Одатан дар охири ҳафта ба кинотеатр меравам. Шумо чӣ, Суҷин? \nСуҷин: Ман мусиқиро дӯст медорам. Дар хона танҳо мусиқӣ мешунавам. \nМайкл: Шумо метавонед пианино ё гитара навозед? \nСуҷин: Бале, ман метавонам пианино навозам. Аммо гитара душвор аст.',
    questions: [
      { question: '마이클 씨의 취미는 뭐예요?', questionTranslated: 'Ҳоббии Майкл чист?', answer: '영화', options: ['영화', '음악', '운동', '독서'], explanation: 'Дар матн гуфта шудааст, ки ӯ тамошои киноро дӯст медорад.' },
      { question: '수진 씨는 어디에서 음악을 들어요?', questionTranslated: 'Суҷин дар куҷо мусиқӣ мешунавад?', answer: '집', options: ['집', '영화관', '미술관', '공원'], explanation: 'Дар матн гуфта шудааст, ки ӯ дар хона мусиқӣ мешунавад.' },
      { question: '수진 씨는 피아노를 칠 수 있어요?', questionTranslated: 'Оё Суҷин метавонад пианино навозад?', answer: '네, 칠 수 있어요.', options: ['네, 칠 수 있어요.', '아니요, 못 쳐요.', '피아노를 싫어해요.', '기타를 칠 수 있어요.'], explanation: 'Дар матн гуфта шудааст, ки ӯ метавонад пианино навозад.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '나의 주말', titleTranslated: 'Охири ҳафтаи ман',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '저는 매일 한국어를 공부해요. 한국어는 조금 어렵지만 재미있어요. 이번 주말에는 공부를 안 할 거예요. 주말에 친구와 함께 영화관에 갈 거예요. 우리는 영화를 보고 밥을 먹을 거예요. 주말이 아주 즐거울 거예요.',
    passageTranslated: 'Ман ҳар рӯз забони кореягиро меомӯзам. Забони кореягӣ каме душвор аст, аммо шавқовар аст. Дар ин охири ҳафта дарс намехонам. Дар ин охири ҳафта бо дӯстам ба кинотеатр меравам. Мо кино тамошо мекунем ва хӯрок мехӯрем. Охири ҳафта хеле шавқовар хоҳад буд.',
    questions: [
      { question: '한국어 공부는 어때요?', questionTranslated: 'Омӯзиши забони кореягӣ чӣ гуна аст?', answer: '어렵지만 재미있어요.', options: ['어렵지만 재미있어요.', '쉽고 재미있어요.', '어렵고 지루해요.', '재미없어요.'], explanation: 'Дар матн гуфта шудааст, ки он душвор аст, аммо шавқовар аст.' },
      { question: '이번 주말에 공부를 할 거예요?', questionTranslated: 'Оё дар ин охири ҳафта дарс мехонед?', answer: '아니요', options: ['아니요', '네', '매일 해요', '항상 해요'], explanation: 'Дар матн гуфта шудааст, ки ӯ дарс намехонад.' },
      { question: '친구와 함께 무엇을 할 거예요?', questionTranslated: 'Шумо бо дӯстатон чӣ кор хоҳед кард?', answer: '영화를 보고 밥을 먹어요.', options: ['영화를 보고 밥을 먹어요.', '수영을 하고 놀아요.', '도서관에서 공부해요.', '집에서 쉬어요.'], explanation: 'Дар матн гуфта шудааст, ки онҳо кино тамошо мекунанд ва хӯрок мехӯранд.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 12 시험', titleTranslated: 'Имтиҳони Модули 12',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '제 취미는 음악을 듣는 것입니다. 저는 항상 노래를 들어요. 저는 피아노도 칠 수 있어요. 하지만 기타는 칠 수 없어요. 제 동생은 운동을 아주 좋아해요. 매일 축구와 수영을 해요. 내일 우리 가족은 함께 공원에 갈 거예요. 공원에서 자전거를 타고 놀 거예요.',
    passageTranslated: 'Ҳоббии ман шунидани мусиқӣ аст. Ман ҳамеша суруд мешунавам. Ман ҳамчунин метавонам пианино навозам. Аммо гитара навохта наметавонам. Додарам варзишро хеле дӯст медорад. Ӯ ҳар рӯз футбол бозӣ мекунад ва шиноварӣ мекунад. Фардо оилаи мо якҷоя ба боғ меравад. Мо дар боғ дучарха савор мешавем ва бозӣ мекунем.',
    questions: [
      { question: '이 사람의 취미는 뭐예요?', questionTranslated: 'Ҳоббии ин шахс чист?', answer: '음악 듣기', options: ['음악 듣기', '피아노 치기', '축구 하기', '자전거 타기'], explanation: 'Дар матн гуфта шудааст, ки ҳоббии ӯ шунидани мусиқӣ аст.' },
      { question: '동생은 무엇을 좋아해요?', questionTranslated: 'Додар чиро дӯст медорад?', answer: '운동', options: ['운동', '음악', '독서', '영화'], explanation: 'Дар матн гуфта шудааст, ки ӯ варзишро дӯст медорад.' },
      { question: '가족은 내일 어디에 갈 거예요?', questionTranslated: 'Фардо оила ба куҷо меравад?', answer: '공원', options: ['공원', '바다', '미술관', '영화관'], explanation: 'Дар матн гуфта шудааст, ки онҳо ба боғ мераванд.' },
      { question: '공원에서 무엇을 할 거예요?', questionTranslated: 'Онҳо дар боғ чӣ кор хоҳанд кард?', answer: '자전거를 타고 놀 거예요.', options: ['자전거를 타고 놀 거예요.', '축구를 할 거예요.', '수영을 할 거예요.', '음악을 들을 거예요.'], explanation: 'Дар матн гуфта шудааст, ки онҳо дучарха савор мешаванд.' },
    ],
  },
];

export const DIALOGUE = {
    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '여가 시간', titleTranslated: 'Вақти холӣ',
    lines: [
      { speaker: '마이클', isUser: true, text: '수진 씨, 주말에 보통 뭐 해요?', translation: 'Суҷин, одатан дар охири ҳафта чӣ кор мекунед?' },
      { speaker: '수진', text: '저는 영화관에 가요. 영화를 좋아해요.', translation: 'Ман ба кинотеатр меравам. Киноро дӯст медорам.' },
      { speaker: '마이클', isUser: true, text: '무슨 영화를 좋아해요?', translation: 'Кадом намуди киноро дӯст медоред?' },
      { speaker: '수진', text: '저는 한국 영화를 좋아해요. 마이클 씨는 취미가 뭐예요?', translation: 'Ман кинои кореягиро дӯст медорам. Майкл, ҳоббии шумо чист?' },
      { speaker: '마이클', isUser: true, text: '제 취미는 운동이에요. 축구를 아주 좋아해요.', translation: 'Ҳоббии ман варзиш аст. Футболро хеле дӯст медорам.' },
      { speaker: '수진', text: '아, 그래요? 저는 운동을 잘 못해요. 조금 힘들어요.', translation: 'Оҳ, дар ҳақиқат? Ман варзишро хуб наметавонам. Каме душвор аст.' },
    ],
};

export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['취미', '음악', '영화', '운동', '축구', '수영', '공', '주로'],
};

export const ORDER = [
  'vocab:취미 1',
  'vocab:취미 동사',
  'vocab:스포츠',
  'vocab:여가 장소와 물건',
  'vocab:능력과 선호',
  'vocab:상태 형용사',
  'vocab:빈도와 정도',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
