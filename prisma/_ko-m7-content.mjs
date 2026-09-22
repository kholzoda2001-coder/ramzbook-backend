export const MODULE = {
  order: 6,
  title: '쇼핑과 돈',
  titleTranslated: 'Харид ва пул',
  emoji: '🛒',
  canDoStatement: 'Шумо метавонед дар бораи пул, хариди чизҳо, пурсидани нарх, ва истифодаи рақамҳои кореягӣ озодона гап занед.',
};

export const KNOWN_FROM = [
  './_ko-m1-content.mjs',
  './_ko-m2-content.mjs',
  './_ko-m3-content.mjs',
  './_ko-m4-content.mjs',
  './_ko-m5-content.mjs',
  './_ko-m6-content.mjs',
];

export const EXTRA_KNOWN = [
  '이거', '저거', '그거', '아주', '조금', '원', '마리', '번', '살', '마세요', '주세요',
  '어때요', '괜찮아요', '좋아요', '싫어요', '맛있어요', '맛없어요', '재미있어요', '재미없어요',
  '어디', '무엇', '누구', '언제', '왜', '어떻게', '무슨', '어느', '몇',
  '입니다', '입니까', '습니다', '습니까', '아/어요',
  '을/를', '이/가', '은/는', '에', '에서', '도', '만', '하고', '과/와', '의',
  '안', '못', '지 않다', '지 못하다',
  '그리고', '그래서', '그러나', '하지만', '그러면', '그럼',
  '진짜', '정말', '너무', '많이', '조금', '약간', '별로', '전혀', '다', '모두',
  '빨간색', '파란색', '까만색', '하얀색', '노란색', '초록색', '보라색', '분홍색', '주황색', '갈색', '회색',
  '사과를', '수박을', '커피를', '빵을', '우유를', '바지를', '치마를', '구두를', '운동화를', '옷을', '책을', '가방을', '모자를', '안경을', '시계를', '신발을',
  '샀어요', '팔았어요', '비쌌어요', '쌌어요', '깎았어요', '환불했어요', '줬어요', '입었어요', '신었어요', '썼어요', '벗었어요', '컸어요', '작았어요', '맞았어요',
  '사요', '팔아요', '비싸요', '싸요', '깎아 주세요', '환불해 주세요', '줘요', '입어요', '신어요', '써요', '벗어요', '커요', '작아요', '맞아요',
  '사과', '수박', '물', '커피', '콜라', '주스', '맥주', '소주', '차', '우유', '빵', '밥', '국', '반찬', '고기', '생선', '야채', '과일', '계란',
  '하나와', '오만', '사만', '오천', '만원', '계산할게요', '감사합니다', '여기', '있어요', '조금만', '네', '알겠습니다', '봐요', '가세요', '가요', '현금으로', '옷가게에서', '빵집에서', '먹었어요', '으로', '내요', '계산할게요', '받으세요', '시장에서', '옷을', '가게에서', '이', '가방은', '물건이', '조금만', '깎아', '환불해', '좀', '백화점에', '우유를', '사람이', '많아요', '신발가게가', '어디에', '새', '예뻐요', '티셔츠를', '겨울', '코트가', '편해요', '운동화를', '코트를', '벌', '모자', '만났어요', '한', '두', '세', '네', '마셨어요', '영수증을', '사세요', '거스름돈을', '두개', '갔어요', '백화점에서', '개를', '신발가게에서', '쇼핑이', '재미있었어요', '어디에서', '색이에요', '몰라요', '편의점에서', '병과', '서점에서', '권과', '사전', '권을', '받았어요', '무엇을', '카드로', '권'
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
  '수진': { husband: '마이클', mother: '사라', father: '알리', brother: '민수' },
  '민수': { sister: '수진', mother: '사라', father: '알리' },
};

export const VOCAB = [
  {
    title: '돈과 결제', titleTranslated: 'Пул ва пардохт', emoji: '💳',
    words: [
      { word: '돈', translation: 'пул', emoji: '💵', pos: 'noun', ipa: '/ton/', example: '돈이 없어요.', exampleTrans: 'Пул надорам.' },
      { word: '현금', translation: 'пули нақд', emoji: '💶', pos: 'noun', ipa: '/hjʌn.ɡɯm/', example: '현금으로 내요.', exampleTrans: 'Бо пули нақд месупорам.' },
      { word: '카드', translation: 'корти бонкӣ', emoji: '💳', pos: 'noun', ipa: '/kʰa.dɯ/', example: '카드로 계산할게요.', exampleTrans: 'Бо корт ҳисоб мекунам.' },
      { word: '가격', translation: 'нарх', emoji: '🏷️', pos: 'noun', ipa: '/ka.ɡjʌk/', example: '가격이 얼마예요?', exampleTrans: 'Нархаш чанд аст?' },
      { word: '영수증', translation: 'расид (чек)', emoji: '🧾', pos: 'noun', ipa: '/jʌŋ.su.dʑɯŋ/', example: '영수증 주세요.', exampleTrans: 'Расидро диҳед.' },
      { word: '거스름돈', translation: 'бақия (сдача)', emoji: '🪙', pos: 'noun', ipa: '/kʌ.sɯ.ɾɯm.ton/', example: '거스름돈 받으세요.', exampleTrans: 'Бақияро гиред.' },
      { word: '얼마', translation: 'чанд пул', emoji: '❓', pos: 'noun', ipa: '/ʌl.ma/', example: '이거 얼마예요?', exampleTrans: 'Ин чанд пул аст?' },
    ],
  },
  {
    title: '물건 사기', titleTranslated: 'Харид кардан', emoji: '🛍️',
    words: [
      { word: '사요', translation: 'харидан', emoji: '🛒', pos: 'verb', ipa: '/sa.da/', example: '시장에서 옷을 사요.', exampleTrans: 'Аз бозор либос мехарам.', highlight: '사요' },
      { word: '팔아요', translation: 'фурӯхтан', emoji: '🤝', pos: 'verb', ipa: '/pʰal.da/', example: '가게에서 사과를 팔아요.', exampleTrans: 'Дар мағоза себ мефурӯшанд.', highlight: '팔아요' },
      { word: '비싸요', translation: 'қиммат', emoji: '💎', pos: 'adj', ipa: '/pi.s͈a.da/', example: '이 가방은 너무 비싸요.', exampleTrans: 'Ин ҷузвдон хеле қиммат аст.', highlight: '비싸요' },
      { word: '싸요', translation: 'арзон', emoji: '📉', pos: 'adj', ipa: '/s͈a.da/', example: '시장은 물건이 싸요.', exampleTrans: 'Дар бозор молҳо арзон мебошанд.', highlight: '싸요' },
      { word: '깎아 주세요', translation: 'арзон кардан', emoji: '✂️', pos: 'verb', ipa: '/k͈ak.t͈a/', example: '조금만 깎아 주세요.', exampleTrans: 'Илтимос каме арзон кунед.', highlight: '깎아' },
      { word: '환불해 주세요', translation: 'пас додан (возврат)', emoji: '🔄', pos: 'verb', ipa: '/hwan.bul.ha.da/', example: '이거 환불해 주세요.', exampleTrans: 'Инро пас гиред.', highlight: '환불해' },
      { word: '주세요', translation: 'додан', emoji: '🤲', pos: 'verb', ipa: '/tɕu.da/', example: '물 좀 주세요.', exampleTrans: 'Каме об диҳед.', highlight: '주세요' },
    ],
  },
  {
    title: '상점', titleTranslated: 'Мағозаҳо', emoji: '🏪',
    words: [
      { word: '백화점', translation: 'маркази савдо', emoji: '🏢', pos: 'noun', ipa: '/pɛ.kʰwa.dʑʌm/', example: '백화점에 가요.', exampleTrans: 'Ба маркази савдо меравам.' },
      { word: '편의점', translation: 'мағозаи шабонарӯзӣ', emoji: '🏪', pos: 'noun', ipa: '/pʰjʌ.ni.dʑʌm/', example: '편의점에서 우유를 사요.', exampleTrans: 'Аз мағозаи шабонарӯзӣ шир мехарам.' },
      { word: '시장', translation: 'бозор', emoji: '⛺', pos: 'noun', ipa: '/ɕi.dʑaŋ/', example: '시장에 사람이 많아요.', exampleTrans: 'Дар бозор одам бисёр аст.' },
      { word: '옷가게', translation: 'мағозаи либос', emoji: '👗', pos: 'noun', ipa: '/ot.k͈a.ɡe/', example: '옷가게에서 바지를 사요.', exampleTrans: 'Аз мағозаи либос шим мехарам.' },
      { word: '신발가게', translation: 'мағозаи пойафзол', emoji: '👟', pos: 'noun', ipa: '/ɕin.bal.k͈a.ɡe/', example: '신발가게가 어디에 있어요?', exampleTrans: 'Мағозаи пойафзол дар куҷост?' },
      { word: '서점', translation: 'китобфурӯшӣ', emoji: '📚', pos: 'noun', ipa: '/sʌ.dʑʌm/', example: '서점에서 책을 사요.', exampleTrans: 'Аз китобфурӯшӣ китоб мехарам.' },
      { word: '빵집', translation: 'нонвойхона', emoji: '🍞', pos: 'noun', ipa: '/p͈aŋ.tɕip/', example: '빵집에서 빵을 먹어요.', exampleTrans: 'Дар нонвойхона нон мехӯрам.' },
    ],
  },
  {
    title: '옷 1', titleTranslated: 'Либос 1', emoji: '👕',
    words: [
      { word: '옷', translation: 'либос', emoji: '👕', pos: 'noun', ipa: '/ot/', example: '새 옷을 샀어요.', exampleTrans: 'Либоси нав харидам.' },
      { word: '바지', translation: 'шим', emoji: '👖', pos: 'noun', ipa: '/pa.dʑi/', example: '파란색 바지예요.', exampleTrans: 'Шими кабуд аст.' },
      { word: '치마', translation: 'доман', emoji: '👗', pos: 'noun', ipa: '/tɕʰi.ma/', example: '치마가 예뻐요.', exampleTrans: 'Доман зебост.' },
      { word: '티셔츠', translation: 'футболка', emoji: '👕', pos: 'noun', ipa: '/tʰi.ɕjʌ.tɕʰɯ/', example: '하얀색 티셔츠를 샀어요.', exampleTrans: 'Футболкаи сафед харидам.' },
      { word: '코트', translation: 'палто', emoji: '🧥', pos: 'noun', ipa: '/kʰo.tʰɯ/', example: '겨울 코트가 비싸요.', exampleTrans: 'Палтои зимистона қиммат аст.' },
      { word: '구두', translation: 'пойафзоли расмӣ', emoji: '👞', pos: 'noun', ipa: '/ku.du/', example: '까만색 구두를 신었어요.', exampleTrans: 'Пойафзоли сиёҳ пӯшидам.' },
      { word: '운동화', translation: 'кроссовка', emoji: '👟', pos: 'noun', ipa: '/un.doŋ.hwa/', example: '운동화가 아주 편해요.', exampleTrans: 'Кроссовка хеле бароҳат аст.' },
    ],
  },
  {
    title: '옷 2 (동사)', titleTranslated: 'Либос 2 (Феълҳо)', emoji: '🧥',
    words: [
      { word: '입어요', translation: 'пӯшидан (либос)', emoji: '👔', pos: 'verb', ipa: '/ip.t͈a/', example: '옷을 입어요.', exampleTrans: 'Либос мепӯшам.', highlight: '입어요' },
      { word: '신어요', translation: 'пӯшидан (пойафзол)', emoji: '🧦', pos: 'verb', ipa: '/ɕin.t͈a/', example: '운동화를 신어요.', exampleTrans: 'Кроссовка мепӯшам.', highlight: '신어요' },
      { word: '써요', translation: 'пӯшидан (кулоҳ / айнак)', emoji: '🧢', pos: 'verb', ipa: '/s͈ɯ.da/', example: '모자를 써요.', exampleTrans: 'Кулоҳ мепӯшам.', highlight: '써요' },
      { word: '벗어요', translation: 'кашидан', emoji: '🧥', pos: 'verb', ipa: '/pʌt.t͈a/', example: '코트를 벗어요.', exampleTrans: 'Палторо мекашам.', highlight: '벗어요' },
      { word: '커요', translation: 'калон', emoji: '🐘', pos: 'adj', ipa: '/kʰɯ.da/', example: '구두가 너무 커요.', exampleTrans: 'Пойафзол хеле калон аст.', highlight: '커요' },
      { word: '작아요', translation: 'хурд', emoji: '🐁', pos: 'adj', ipa: '/tɕak.t͈a/', example: '바지가 작아요.', exampleTrans: 'Шим хурд аст.', highlight: '작아요' },
      { word: '맞아요', translation: 'мувофиқ будан', emoji: '✅', pos: 'verb', ipa: '/mat.t͈a/', example: '옷이 잘 맞아요.', exampleTrans: 'Либос хуб мувофиқ аст.', highlight: '맞아요' },
    ],
  },
  {
    title: '고유어 숫자 1', titleTranslated: 'Рақамҳои аслӣ 1', emoji: '1️⃣',
    words: [
      { word: '하나', translation: 'як', emoji: '1️⃣', pos: 'noun', ipa: '/ha.na/', example: '사과 하나 주세요.', exampleTrans: 'Як себ диҳед.' },
      { word: '둘', translation: 'ду', emoji: '2️⃣', pos: 'noun', ipa: '/tul/', example: '커피 둘 주세요.', exampleTrans: 'Ду қаҳва диҳед.' },
      { word: '셋', translation: 'се', emoji: '3️⃣', pos: 'noun', ipa: '/set/', example: '빵 셋 샀어요.', exampleTrans: 'Се нон харидам.' },
      { word: '넷', translation: 'чор', emoji: '4️⃣', pos: 'noun', ipa: '/net/', example: '맥주 넷 주세요.', exampleTrans: 'Чор пиво диҳед.' },
      { word: '다섯', translation: 'панҷ', emoji: '5️⃣', pos: 'noun', ipa: '/ta.sʌt/', example: '수박 다섯 개예요.', exampleTrans: 'Панҷ дона тарбуз аст.' },
      { word: '여섯', translation: 'шаш', emoji: '6️⃣', pos: 'noun', ipa: '/jʌ.sʌt/', example: '바지 여섯 벌 샀어요.', exampleTrans: 'Шаш шим харидам.' },
      { word: '일곱', translation: 'ҳафт', emoji: '7️⃣', pos: 'noun', ipa: '/il.ɡop/', example: '모자 일곱 개 있어요.', exampleTrans: 'Ҳафт кулоҳ дорам.' },
    ],
  },
  {
    title: '고유어 숫자 2 & 양사', titleTranslated: 'Рақамҳо 2 ва ҳисобкунакҳо', emoji: '🔢',
    words: [
      { word: '여덟', translation: 'ҳашт', emoji: '8️⃣', pos: 'noun', ipa: '/jʌ.dʌl/', example: '우유 여덟 병 주세요.', exampleTrans: 'Ҳашт шиша шир диҳед.' },
      { word: '아홉', translation: 'нуҳ', emoji: '9️⃣', pos: 'noun', ipa: '/a.hop/', example: '친구 아홉 명 만났어요.', exampleTrans: 'Бо нуҳ дӯстам вохӯрдам.' },
      { word: '열', translation: 'даҳ', emoji: '🔟', pos: 'noun', ipa: '/jʌl/', example: '사과 열 개 샀어요.', exampleTrans: 'Даҳ дона себ харидам.' },
      { word: '개', translation: 'дона (барои чизҳо)', emoji: '📦', pos: 'noun', ipa: '/kɛ/', example: '이거 한 개 주세요.', exampleTrans: 'Аз ин як дона диҳед.' },
      { word: '명', translation: 'нафар (барои одамон)', emoji: '👥', pos: 'noun', ipa: '/mjʌŋ/', example: '사람이 세 명 있어요.', exampleTrans: 'Се нафар одам ҳаст.' },
      { word: '잔', translation: 'пиёла (барои нӯшокиҳо)', emoji: '☕', pos: 'noun', ipa: '/tɕan/', example: '커피 두 잔 마셨어요.', exampleTrans: 'Ду пиёла қаҳва нӯшидам.' },
      { word: '병', translation: 'шиша (барои моеъ)', emoji: '🍾', pos: 'noun', ipa: '/pjʌŋ/', example: '물 한 병 샀어요.', exampleTrans: 'Як шиша об харидам.' },
    ],
  },
];


export const GRAMMAR = [
  {
    lessonTitle: '문법: 주세요', lessonTitleTranslated: 'Грамматика: 사과 주세요',
    title: '명사 + 주세요', titleTranslated: 'Исм + 주세요',
    emoji: '🤲',
    explanation: 'Калимаи 주세요 (илтимос диҳед) барои хоҳиш кардан ё харидани чизе истифода мешавад. Он пас аз исм меояд.',
    rules: [
      { pattern: 'Исм + 주세요', note: '사과 주세요, 물 주세요.' },
      { pattern: 'Исм + (을/를) 주세요', note: '사과를 주세요 (расмӣ).' },
    ],
    examples: [
      { sentence: '사과 주세요.', translation: 'Илтимос себ диҳед.', highlight: '주세요' },
      { sentence: '물 좀 주세요.', translation: 'Илтимос каме об диҳед.', highlight: '주세요' },
      { sentence: '영수증을 주세요.', translation: 'Илтимос расидро диҳед.', highlight: '주세요' },
      { sentence: '이거 주세요.', translation: 'Илтимос инро диҳед.', highlight: '주세요' },
    ],
    exercises: [
      { prompt: '우유 ___.', promptTranslated: 'Илтимос шир диҳед.', answer: '주세요', options: ['주세요', '사요', '팔아요', '봐요'], explanation: 'Дар ин ҷо 주세요 дуруст аст.' },
      { prompt: '이거 ___.', promptTranslated: 'Илтимос инро диҳед.', answer: '주세요', options: ['주세요', '사세요', '가세요', '주스'], explanation: 'Дар ин ҷо 주세요 лозим аст.' },
      { prompt: '거스름돈을 ___.', promptTranslated: 'Илтимос бақияро диҳед.', answer: '주세요', options: ['주세요', '가요', '사요', '팔아요'], explanation: 'Дар ин ҷо 주세요 дуруст аст.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Илтимос каме об диҳед.', answer: '물 좀 주세요.', options: ['주세요', '좀', '물'], explanation: '물 좀 주세요 дуруст аст.' },
    ],
  },
  {
    lessonTitle: '문법: 숫자와 양사', lessonTitleTranslated: 'Грамматика: 사과 두 개',
    title: '명사 + 숫자 + 양사', titleTranslated: 'Исм + Рақам + Ҳисобкунак',
    emoji: '🔢',
    explanation: 'Ҳангоми ҳисоб кардани ашё дар кореягӣ, аввал худи чиз, баъд Рақам ва дар охир калимаи Ҳисобкунак (дона, нафар ва ғайра) меояд. Рақамҳои 하나, 둘, 셋, 넷 пеш аз ҳисобкунакҳо ба 한, 두, 세, 네 табдил меёбанд.',
    rules: [
      { pattern: 'Исм + 한, 두, 세, 네 + 개', note: '사과 한 개 (Як дона себ), 빵 두 개 (Ду дона нон).' },
      { pattern: 'Исм + 잔, 명, 병, 권', note: '사람 세 명 (Се нафар одам), 커피 네 잔 (Чор пиёла қаҳва).' },
    ],
    examples: [
      { sentence: '사과 두 개 주세요.', translation: 'Илтимос ду дона себ диҳед.', highlight: '두 개' },
      { sentence: '커피 세 잔 마셨어요.', translation: 'Се пиёла қаҳва нӯшидам.', highlight: '세 잔' },
      { sentence: '친구 네 명 만났어요.', translation: 'Бо чор дӯстам вохӯрдам.', highlight: '네 명' },
      { sentence: '물 한 병 샀어요.', translation: 'Як шиша об харидам.', highlight: '한 병' },
      { sentence: '빵 다섯 개 먹었어요.', translation: 'Панҷ дона нон хӯрдам.', highlight: '다섯 개' },
    ],
    exercises: [
      { prompt: '사과 ___ 개 주세요.', promptTranslated: 'Илтимос ду дона себ диҳед.', answer: '두', options: ['두', '둘', '두개', '이'], explanation: 'Рақами 둘 ба 두 табдил меёбад.' },
      { prompt: '커피 세 ___ 주세요.', promptTranslated: 'Илтимос се пиёла қаҳва диҳед.', answer: '잔', options: ['잔', '개', '명', '병'], explanation: 'Барои қаҳва 단어 잔 дуруст аст.' },
      { prompt: '친구 네 ___ 만났어요.', promptTranslated: 'Бо чор дӯстам вохӯрдам.', answer: '명', options: ['명', '잔', '개', '병'], explanation: 'Барои одамон 단어 명 лозим аст.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Илтимос ду дона себ диҳед.', answer: '사과 두 개 주세요.', options: ['주세요', '개', '두', '사과'], explanation: '사과 두 개 주세요 дуруст аст.' },
    ],
  },
];


export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '백화점 쇼핑', titleTranslated: 'Харид дар маркази савдо',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '저는 오늘 백화점에 갔어요. 백화점에서 옷을 샀어요. 까만색 바지 하나와 하얀색 티셔츠 두 개를 샀어요. 그리고 신발가게에서 운동화도 샀어요. 운동화가 아주 편해요. 쇼핑이 정말 재미있었어요.',
    passageTranslated: 'Ман имрӯз ба маркази савдо рафтам. Дар маркази савдо либос харидам. Як шими сиёҳ ва ду футболкаи сафед харидам. Ва дар мағозаи пойафзол кроссовка низ харидам. Кроссовка хеле бароҳат аст. Харид кардан хеле шавқовар буд.',
    questions: [
      { question: '어디에서 옷을 샀어요?', questionTranslated: 'Аз куҷо либос харид?', answer: '백화점', options: ['백화점', '시장', '서점', '편의점'], explanation: 'Дар матн 백화점에서 옷을 샀어요 навишта шудааст.' },
      { question: '바지는 무슨 색이에요?', questionTranslated: 'Шим чӣ ранг аст?', answer: '까만색', options: ['까만색', '하얀색', '파란색', '빨간색'], explanation: 'Дар матн 까만색 바지 하나 나вишта шудааст.' },
      { question: '티셔츠를 몇 개 샀어요?', questionTranslated: 'Чанд дона футболка харид?', answer: '두 개', options: ['한 개', '두 개', '세 개', '네 개'], explanation: 'Дар матн 하얀색 티셔츠 두 개 навишта шудааст.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '시장에서', titleTranslated: 'Дар бозор',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '사과 다섯 개 주세요. 그리고 수박도 하나 주세요. 수박은 얼마예요? 만 원이에요. 수박이 아주 싸요.',
    passageTranslated: 'Илтимос панҷ дона себ диҳед. Ва як тарбуз ҳам диҳед. Тарбуз чанд пул аст? Даҳ ҳазор вон аст. Тарбуз хеле арзон аст.',
    questions: [
      { question: '사과를 몇 개 사요?', questionTranslated: 'Чанд дона себ мехарад?', answer: '다섯 개', options: ['다섯 개', '두 개', '네 개', '세 개'], explanation: 'Дар матн 사과 다섯 개 주세요 나вишта шудааст.' },
      { question: '수박은 얼마예요?', questionTranslated: 'Тарбуз чанд пул аст?', answer: '만 원', options: ['만 원', '오천 원', '천 원', '백 원'], explanation: 'Дар матн 만 원이에요 나вишта шудааст.' },
      { question: '수박이 비싸요?', questionTranslated: 'Тарбуз қиммат аст?', answer: '아니요, 싸요.', options: ['아니요, 싸요.', '네, 비싸요.', '몰라요.', '아주 비싸요.'], explanation: 'Дар матн 아주 싸요 гуфта мешавад.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '복습 퀴즈', titleTranslated: 'Викторинаи такрорӣ',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '편의점에서 우유 두 병과 빵 세 개를 샀어요. 우유가 아주 맛있어요.',
    passageTranslated: 'Аз мағозаи шабонарӯзӣ ду шиша шир ва се дона нон харидам. Шир хеле бомазза аст.',
    questions: [
      { question: '어디에서 샀어요?', questionTranslated: 'Аз куҷо харид?', answer: '편의점', options: ['편의점', '서점', '빵집', '백화점'], explanation: 'Дар матн 편의점에서 나вишта шудааст.' },
      { question: '우유를 몇 병 샀어요?', questionTranslated: 'Чанд шиша шир харид?', answer: '두 병', options: ['한 병', '두 병', '세 병', '네 병'], explanation: 'Дар матн 우유 두 병을 샀어요 гуфта мешавад.' },
      { question: '빵을 몇 개 샀어요?', questionTranslated: 'Чанд дона нон харид?', answer: '세 개', options: ['두 개', '세 개', '네 개', '다섯 개'], explanation: 'Дар матн 빵 세 개를 샀어요 гуфта мешавад.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 7 시험', titleTranslated: 'Имтиҳони Модули 7',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '저는 오늘 서점에 갔어요. 서점에서 한국어 책 한 권과 사전 한 권을 샀어요. 책이 조금 비쌌어요. 거스름돈을 받았어요.',
    passageTranslated: 'Ман имрӯз ба китобфурӯшӣ рафтам. Дар китобфурӯшӣ як ҷилд китоби кореягӣ ва як ҷилд луғат харидам. Китоб каме қиммат буд. Бақияро гирифтам.',
    questions: [
      { question: '어디에 갔어요?', questionTranslated: 'Ба куҷо рафт?', answer: '서점', options: ['서점', '옷가게', '편의점', '시장'], explanation: 'Дар матн 서점에 갔어요 омадааст.' },
      { question: '한국어 책을 몇 권 샀어요?', questionTranslated: 'Чанд ҷилд китоби кореягӣ харид?', answer: '한 권', options: ['한 권', '두 권', '세 권', '네 권'], explanation: 'Дар матн 책 한 권을 샀어요 навишта шудааст.' },
      { question: '책이 쌌어요?', questionTranslated: 'Китоб арзон буд?', answer: '아니요, 비쌌어요.', options: ['아니요, 비쌌어요.', '네, 쌌어요.', '아주 쌌어요.', '아니요, 안 샀어요.'], explanation: 'Дар матн 조금 비쌌어요 гуфта мешавад.' },
      { question: '무엇을 받았어요?', questionTranslated: 'Чӣ гирифт?', answer: '거스름돈', options: ['거스름돈', '영수증', '카드', '가방'], explanation: 'Дар матн 거스름돈을 받았어요 гуфта мешавад.' },
    ],
  },
];

export const DIALOGUE = {

    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '옷가게에서', titleTranslated: 'Дар мағозаи либос',
    lines: [
      { speaker: '수진', isUser: true, text: '안녕하세요. 이 바지 얼마예요?', translation: 'Салом. Ин шим чанд пул аст?' },
      { speaker: '민수', text: '오만 원이에요.', translation: 'Панҷоҳ ҳазор вон аст.' },
      { speaker: '수진', isUser: true, text: '너무 비싸요. 조금만 깎아 주세요.', translation: 'Хеле қиммат аст. Илтимос каме арзон кунед.' },
      { speaker: '민수', text: '네, 알겠습니다. 사만 오천 원 주세요.', translation: 'Хуб, фаҳмидам. Чиллу панҷ ҳазор вон диҳед.' },
      { speaker: '수진', isUser: true, text: '여기 카드로 계산할게요.', translation: 'Ин ҷо, бо корт ҳисоб мекунам.' },
      { speaker: '민수', text: '네, 감사합니다. 영수증 여기 있어요.', translation: 'Бале, ташаккур. Расид ин ҷост.' },
    ],
};


export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['돈', '가격', '카드', '영수증', '사요', '팔아요', '백화점', '치마'],
};

export const ORDER = [
  'vocab:돈과 결제',
  'vocab:물건 사기',
  'vocab:상점',
  'vocab:옷 1',
  'vocab:옷 2 (동사)',
  'vocab:고유어 숫자 1',
  'vocab:고유어 숫자 2 & 양사',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
