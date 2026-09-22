export const MODULE = {
  order: 10,
  title: '날씨와 계절',
  titleTranslated: 'Обу ҳаво ва Фаслҳо',
  emoji: '⛅',
  canDoStatement: 'Шумо метавонед дар бораи обу ҳаво, фаслҳои сол ва нақшаҳои ояндаи худ дар истироҳат гуфтугӯ кунед.',
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
];

export const EXTRA_KNOWN = [
  '왔어요', '밤에는', '눈사람을', '차가워요', '떠요', '길어요', '예뻐요', '파랗다', '공원에서', '바다에서', '친구와', '시장을', '친구하고', '집에서', '바다로', '갔어요', '다시', '여행이', '요즘', '머리가', '사진을', '맑고', '오고', '덥고', '밥을', '먹고', '고', '아/어서', '지만', '여행하고', '올', '거예요', '등산할', '수영할', '불고기를', '먹을', '가ㄹ', '을', '아요', '어요', '하ㄹ', '있습니다', '따뜻하고', '덥습니다', '사람들은', '수영합니다', '시원하고', '맑습니다', '등산을', '합니다', '춥습니다', '무엇을', '등산', '수영', '공부', '쇼핑', '겨울에는', '할', '갈', '씨는요', '더워서', '아', '좋네요', '재미있게', '놀고', '산책', '찍을', '주부터', '부산에', '부산은', '수영하고', '맛있는', '고기와', '생선을', '좋을', '언제부터', '부산에서', '등산하고', '영화관에', '부산', '나빠요', '옵니다', '쌀쌀합니다', '나가지', '않을', '쉴', '읽고', '맑을', '산책할', '불고', '있을', '읽을', '친구를', '만날', '여행할',
  
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
  '같이', '때문에', '매일', '항상', '가끔', '자주', '보통', '오늘', '어제', '내일',
  '먹어요', '마셔요', '봐요', '가요', '와요',
  '먹을래요', '마실래요', '갈래요', '할래요',
  '학교에', '식당에', '집에', '방에',
  '학교', '식당', '집', '어디에',
  
  // From M10
  '앞쪽', '앞에', '위에', '아래에', '뒤에', '옆에', '안에', '밖에', 
  '제', '컴퓨터', '고양이', '펜이', '약국이', '은행이', '병원이', '고양이가',
  '우체국이', '도서관에서', '일층으로', '이층으로', '안으로', '밖으로', '길을', '역에서',
  '버스를', '지하철을', '기차가', '빨라요', '하늘에', '자전거를',
  '마트에서', '카페에서', '서점에서', '오른쪽으로', '가세요', '오세요'
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
    title: '계절', titleTranslated: 'Фаслҳо', emoji: '🌸',
    words: [
      { word: '봄', translation: 'баҳор', emoji: '🌸', pos: 'noun', ipa: '/pom/', example: '봄이 왔어요.', exampleTrans: 'Баҳор омад.' },
      { word: '여름', translation: 'тобистон', emoji: '☀️', pos: 'noun', ipa: '/jʌ.ɾɯm/', example: '여름은 더워요.', exampleTrans: 'Тобистон гарм аст.' },
      { word: '가을', translation: 'тирамоҳ', emoji: '🍁', pos: 'noun', ipa: '/ka.ɯl/', example: '가을이 좋아요.', exampleTrans: 'Тирамоҳ хуб аст.' },
      { word: '겨울', translation: 'зимистон', emoji: '❄️', pos: 'noun', ipa: '/kjʌ.ul/', example: '겨울은 추워요.', exampleTrans: 'Зимистон хунук аст.' },
      { word: '계절', translation: 'фасл', emoji: '📅', pos: 'noun', ipa: '/kje.dʑʌl/', example: '무슨 계절이에요?', exampleTrans: 'Кадом фасл аст?' },
      { word: '더워요', translation: 'гарм аст', emoji: '🥵', pos: 'adj', ipa: '/tʌ.wʌ.jo/', example: '오늘 날씨가 더워요.', exampleTrans: 'Имрӯз обу ҳаво гарм аст.', highlight: '더워요' },
      { word: '추워요', translation: 'хунук аст', emoji: '🥶', pos: 'adj', ipa: '/tɕʰu.wʌ.jo/', example: '밖이 너무 추워요.', exampleTrans: 'Берун хеле хунук аст.', highlight: '추워요' },
    ],
  },
  {
    title: '날씨', titleTranslated: 'Обу ҳаво', emoji: '☁️',
    words: [
      { word: '날씨', translation: 'обу ҳаво', emoji: '⛅', pos: 'noun', ipa: '/nal.s͈i/', example: '오늘 날씨가 어때요?', exampleTrans: 'Имрӯз обу ҳаво чӣ гуна аст?' },
      { word: '맑아요', translation: 'соф / беабр', emoji: '🌞', pos: 'adj', ipa: '/mal.ɡa.jo/', example: '하늘이 맑아요.', exampleTrans: 'Осмон соф аст.', highlight: '맑아요' },
      { word: '흐려요', translation: 'абрнок аст', emoji: '☁️', pos: 'adj', ipa: '/hɯ.ɾjʌ.jo/', example: '날씨가 흐려요.', exampleTrans: 'Обу ҳаво абрнок аст.', highlight: '흐려요' },
      { word: '비', translation: 'борон', emoji: '🌧️', pos: 'noun', ipa: '/pi/', example: '비가 와요.', exampleTrans: 'Борон меборад.' },
      { word: '눈', translation: 'барф (ё чашм)', emoji: '🌨️', pos: 'noun', ipa: '/nun/', example: '눈이 많이 와요.', exampleTrans: 'Барф бисёр меборад.' },
      { word: '바람', translation: 'шамол', emoji: '🌬️', pos: 'noun', ipa: '/pa.ɾam/', example: '바람이 불어요.', exampleTrans: 'Шамол мевазад.' },
      { word: '구름', translation: 'абр', emoji: '☁️', pos: 'noun', ipa: '/ku.ɾɯm/', example: '구름이 많아요.', exampleTrans: 'Абр бисёр аст.' },
    ],
  },
  {
    title: '날씨 표현', titleTranslated: 'Ибораҳои обу ҳаво', emoji: '☂️',
    words: [
      { word: '불어요', translation: 'мевазад', emoji: '🌬️', pos: 'verb', ipa: '/pu.ɾʌ.jo/', example: '바람이 불어요.', exampleTrans: 'Шамол мевазад.', highlight: '불어요' },
      { word: '따뜻해요', translation: 'гармча (форам)', emoji: '🌷', pos: 'adj', ipa: '/t͈a.t͈ɯ.tʰɛ.jo/', example: '봄은 따뜻해요.', exampleTrans: 'Баҳор гарму форам аст.', highlight: '따뜻해요' },
      { word: '시원해요', translation: 'салқин (форам)', emoji: '🍃', pos: 'adj', ipa: '/ɕi.wʌ.nɛ.jo/', example: '가을은 시원해요.', exampleTrans: 'Тирамоҳ салқин аст.', highlight: '시원해요' },
      { word: '쌀쌀해요', translation: 'сард / каме хунук', emoji: '🍂', pos: 'adj', ipa: '/s͈al.s͈a.ɾɛ.jo/', example: '밤에는 쌀쌀해요.', exampleTrans: 'Дар шаб сард аст.', highlight: '쌀쌀해요' },
      { word: '우산', translation: 'чатр', emoji: '☂️', pos: 'noun', ipa: '/u.san/', example: '우산이 있어요?', exampleTrans: 'Чатр доред?' },
      { word: '눈사람', translation: 'одами барфӣ', emoji: '⛄', pos: 'noun', ipa: '/nun.sa.ɾam/', example: '눈사람을 만들어요.', exampleTrans: 'Одами барфӣ месозем.' },
      { word: '얼음', translation: 'ях', emoji: '🧊', pos: 'noun', ipa: '/ʌ.ɾɯm/', example: '얼음이 차가워요.', exampleTrans: 'Ях хунук аст.' },
    ],
  },
  {
    title: '자연', titleTranslated: 'Табиат', emoji: '🌲',
    words: [
      { word: '해', translation: 'офтоб', emoji: '☀️', pos: 'noun', ipa: '/hɛ/', example: '해가 떠요.', exampleTrans: 'Офтоб мебарояд.' },
      { word: '바다', translation: 'баҳр', emoji: '🌊', pos: 'noun', ipa: '/pa.da/', example: '바다에 가요.', exampleTrans: 'Ба баҳр меравам.' },
      { word: '산', translation: 'кӯҳ', emoji: '⛰️', pos: 'noun', ipa: '/san/', example: '산이 아름다워요.', exampleTrans: 'Кӯҳ зебо аст.' },
      { word: '강', translation: 'дарё', emoji: '🏞️', pos: 'noun', ipa: '/kaŋ/', example: '강이 길어요.', exampleTrans: 'Дарё дароз аст.' },
      { word: '나무', translation: 'дарахт', emoji: '🌳', pos: 'noun', ipa: '/na.mu/', example: '나무가 커요.', exampleTrans: 'Дарахт калон аст.' },
      { word: '꽃', translation: 'гул', emoji: '🌻', pos: 'noun', ipa: '/k͈ot/', example: '꽃이 예뻐요.', exampleTrans: 'Гул зебо аст.' },
      { word: '하늘', translation: 'осмон', emoji: '🌌', pos: 'noun', ipa: '/ha.nɯl/', example: '하늘이 파랗다.', exampleTrans: 'Осмон кабуд аст.' },
    ],
  },
  {
    title: '야외 활동', titleTranslated: 'Машғулиятҳои берунӣ', emoji: '🏕️',
    words: [
      { word: '산책해요', translation: 'сайр мекунам (пиёда)', emoji: '🚶', pos: 'verb', ipa: '/san.tɕʰɛ.kʰɛ.jo/', example: '공원에서 산책해요.', exampleTrans: 'Дар парк сайр мекунам.', highlight: '산책해요' },
      { word: '등산해요', translation: 'кӯҳнавардӣ мекунам', emoji: '🧗', pos: 'verb', ipa: '/tɯŋ.sa.nɛ.jo/', example: '주말에 등산해요.', exampleTrans: 'Дар охири ҳафта ба кӯҳ мебароям.', highlight: '등산해요' },
      { word: '수영해요', translation: 'шиноварӣ мекунам', emoji: '🏊', pos: 'verb', ipa: '/su.jʌ.ŋɛ.jo/', example: '바다에서 수영해요.', exampleTrans: 'Дар баҳр шиноварӣ мекунам.', highlight: '수영해요' },
      { word: '여행해요', translation: 'саёҳат мекунам', emoji: '🧳', pos: 'verb', ipa: '/jʌ.hɛ.ŋɛ.jo/', example: '친구와 여행해요.', exampleTrans: 'Бо дӯстам саёҳат мекунам.', highlight: '여행해요' },
      { word: '구경해요', translation: 'тамошо мекунам', emoji: '👀', pos: 'verb', ipa: '/ku.ɡjʌ.ŋɛ.jo/', example: '시장을 구경해요.', exampleTrans: 'Бозорро тамошо мекунам.', highlight: '구경해요' },
      { word: '놀아요', translation: 'бозӣ мекунам / вақтхӯшӣ', emoji: '🎮', pos: 'verb', ipa: '/no.ɾa.jo/', example: '친구하고 놀아요.', exampleTrans: 'Бо дӯстам бозӣ мекунам.', highlight: '놀아요' },
      { word: '쉬어요', translation: 'истироҳат мекунам', emoji: '🛋️', pos: 'verb', ipa: '/ɕwi.ʌ.jo/', example: '집에서 쉬어요.', exampleTrans: 'Дар хона истироҳат мекунам.', highlight: '쉬어요' },
    ],
  },
  {
    title: '시간과 휴가', titleTranslated: 'Вақт ва Таътил', emoji: '📆',
    words: [
      { word: '주말', translation: 'охири ҳафта (шанбе-якшанбе)', emoji: '📅', pos: 'noun', ipa: '/tɕu.mal/', example: '주말에 뭐 해요?', exampleTrans: 'Дар охири ҳафта чӣ кор мекунед?' },
      { word: '방학', translation: 'таътили мактаб', emoji: '🏫', pos: 'noun', ipa: '/paŋ.hak/', example: '여름 방학이 길어요.', exampleTrans: 'Таътили тобистона дароз аст.' },
      { word: '휴가', translation: 'рухсатии корӣ', emoji: '🏖️', pos: 'noun', ipa: '/hju.ɡa/', example: '휴가에 바다로 가요.', exampleTrans: 'Дар рухсатӣ ба баҳр меравам.' },
      { word: '이번', translation: 'ин (дафъа)', emoji: '👇', pos: 'noun', ipa: '/i.bʌn/', example: '이번 주말에 만나요.', exampleTrans: 'Дар ин охири ҳафта вомехӯрем.' },
      { word: '다음', translation: 'навбатӣ / оянда', emoji: '⏭️', pos: 'noun', ipa: '/ta.ɯm/', example: '다음 주에 만나요.', exampleTrans: 'Дар ҳафтаи оянда вомехӯрем.' },
      { word: '작년', translation: 'соли гузашта', emoji: '⏪', pos: 'noun', ipa: '/tɕaŋ.njʌn/', example: '작년에 한국에 갔어요.', exampleTrans: 'Соли гузашта ба Корея рафтам.' },
      { word: '내년', translation: 'соли оянда', emoji: '⏩', pos: 'noun', ipa: '/nɛ.njʌn/', example: '내년에 다시 만나요.', exampleTrans: 'Соли оянда боз вомехӯрем.' },
    ],
  },
  {
    title: '감정과 상태', titleTranslated: 'Кайфият ва Ҳолат', emoji: '😊',
    words: [
      { word: '기분', translation: 'кайфият', emoji: '😊', pos: 'noun', ipa: '/ki.bun/', example: '오늘 기분이 어때요?', exampleTrans: 'Имрӯз кайфиятатон чӣ гуна аст?' },
      { word: '아름다워요', translation: 'зебо аст (барои манзара/табиат)', emoji: '🌸', pos: 'adj', ipa: '/a.ɾɯm.da.wʌ.jo/', example: '꽃이 정말 아름다워요.', exampleTrans: 'Гул воқеан зебо аст.', highlight: '아름다워요' },
      { word: '즐거워요', translation: 'шавқовар / хурсандибахш', emoji: '😁', pos: 'adj', ipa: '/tɕɯl.ɡʌ.wʌ.jo/', example: '여행이 즐거워요.', exampleTrans: 'Саёҳат шавқовар аст.', highlight: '즐거워요' },
      { word: '피곤해요', translation: 'монда шудам / хастаам', emoji: '😩', pos: 'adj', ipa: '/pʰi.ɡo.nɛ.jo/', example: '오늘 너무 피곤해요.', exampleTrans: 'Имрӯз хеле хастаам.', highlight: '피곤해요' },
      { word: '바빠요', translation: 'банд ҳастам', emoji: '🏃', pos: 'adj', ipa: '/pa.p͈a.jo/', example: '요즘 바빠요.', exampleTrans: 'Ин рӯзҳо банд ҳастам.', highlight: '바빠요' },
      { word: '아파요', translation: 'бемор ҳастам / дард мекунад', emoji: '🤕', pos: 'adj', ipa: '/a.pʰa.jo/', example: '머리가 아파요.', exampleTrans: 'Сарам дард мекунад.', highlight: '아파요' },
      { word: '찍어요', translation: 'расм гирифтан (사진을 찍다)', emoji: '📷', pos: 'verb', ipa: '/t͈ɕi.ɡʌ.jo/', example: '사진을 찍어요.', exampleTrans: 'Расм мегирам.', highlight: '찍어요' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: '문법: -고', lessonTitleTranslated: 'Грамматика: -у / ва (пайвандак)',
    title: '동사/형용사 + 고', titleTranslated: 'Феъл/Сифат + 고 (ва)',
    emoji: '🔗',
    explanation: 'Барои пайваст кардани ду ҷумла ё амал пайвандаки 고 (ва / у) 수 바 기 다 고 아 나 고 조 비가 오고 바람이 불어요 (Борон меборад ва шамол мевазад). 비 다 시 기 다 고 유.',
    rules: [
      { pattern: 'Феъл/Сифат (бе 다) + 고', note: '크다 -> 크고 (калон ва...)' },
      { pattern: '가다 -> 가고', note: '가고 와요 (меравам ва меоям).' },
    ],
    examples: [
      { sentence: '날씨가 맑고 따뜻해요.', translation: 'Обу ҳаво соф ва гармча аст.', highlight: '맑고' },
      { sentence: '비가 오고 바람이 불어요.', translation: 'Борон меборад ва шамол мевазад.', highlight: '오고' },
      { sentence: '여름은 덥고 겨울은 추워요.', translation: 'Тобистон гарм аст ва зимистон хунук аст.', highlight: '덥고' },
      { sentence: '밥을 먹고 학교에 가요.', translation: 'Хӯрок мехӯрам ва ба мактаб меравам.', highlight: '먹고' },
    ],
    exercises: [
      { prompt: '날씨가 맑___ 따뜻해요.', promptTranslated: 'Обу ҳаво соф ва гармча аст.', answer: '고', options: ['고', '아/어서', '에', '에서'], explanation: 'Барои пайваст кардан 부 고 수 "맑고".' },
      { prompt: '비가 오___ 바람이 불어요.', promptTranslated: 'Борон меборад ва шамол мевазад.', answer: '고', options: ['고', '지만', '도', '로'], explanation: 'О 오 + 고 = 오고.' },
      { prompt: '여름은 덥___ 겨울은 추워요.', promptTranslated: 'Тобистон гарм аст ва зимистон хунук аст.', answer: '고', options: ['고', '에', '은', '는'], explanation: 'Д 덥 + 고 = 덥고.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Саёҳат мекунам ва расм мегирам.', answer: '여행하고 사진을 찍어요', options: ['찍어요', '사진을', '여행하고'], explanation: '여행하다 -> 여행하고 사진을 찍어요 дуруст аст.' },
    ],
  },
  {
    lessonTitle: '문법: -(으)ㄹ 거예요', lessonTitleTranslated: 'Грамматика: Замони оянда',
    title: '동사 + -(으)ㄹ 거예요', titleTranslated: 'Феъл + -(으)ㄹ 거예요 (хоҳам ...)',
    emoji: '미',
    explanation: 'Барои ифодаи нақшаҳо дар оянда 소 -(으)ㄹ 거예요 미 Ба. 주말에 뭐 할 거예요? (Дар охири ҳафта чӣ кор хоҳед кард?) -> 산에 갈 거예요 (Ба кӯҳ хоҳам рафт).',
    rules: [
      { pattern: 'Садонок + ㄹ 거예요', note: '가다 -> 갈 거예요 (Хоҳам рафт)' },
      { pattern: 'Ҳамсадо + 을 거예요', note: '먹다 -> 먹을 거예요 (Хоҳам хӯрд)' },
    ],
    examples: [
      { sentence: '내일 비가 올 거예요.', translation: 'Фардо борон хоҳад борид.', highlight: '올 거예요' },
      { sentence: '주말에 등산할 거예요.', translation: 'Дар охири ҳафта кӯҳнавардӣ хоҳам кард.', highlight: '등산할 거예요' },
      { sentence: '우리는 바다에서 수영할 거예요.', translation: 'Мо дар баҳр шиноварӣ хоҳем кард.', highlight: '수영할 거예요' },
      { sentence: '저녁에 불고기를 먹을 거예요.', translation: 'Дар бегоҳ пулгоги хоҳам хӯрд.', highlight: '먹을 거예요' },
    ],
    exercises: [
      { prompt: '내일 학교에 가___.', promptTranslated: 'Фардо ба мактаб хоҳам рафт.', answer: 'ㄹ 거예요', options: ['ㄹ 거예요', '을 거예요', '고', '아요'], explanation: '가 бо садонок 인 지 ㄹ 거예요 소 -> 갈 거예요.' },
      { prompt: '저녁에 밥을 먹___.', promptTranslated: 'Дар бегоҳ хӯрок хоҳам хӯрд.', answer: '을 거예요', options: ['을 거예요', 'ㄹ 거예요', '고', '어요'], explanation: '먹 бо ҳамсадо (ㄱ) 인 지 을 거예요 소 -> 먹을 거예요.' },
      { prompt: '이번 주말에 뭐 하___?', promptTranslated: 'Дар ин охири ҳафта чӣ кор хоҳед кард?', answer: 'ㄹ 거예요', options: ['ㄹ 거예요', '을 거예요', '어요', '고'], explanation: '하 + ㄹ 거예요 -> 할 거예요?' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Фардо борон хоҳад борид.', answer: '내일 비가 올 거예요', options: ['비가', '올', '거예요', '내일'], explanation: '내일 비가 올 거예요 дуруст аст.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '한국의 사계절', titleTranslated: 'Чор фасли Корея',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '한국은 봄, 여름, 가을, 겨울이 있습니다. 봄은 따뜻하고 아주 아름다워요. 여름은 비가 많이 오고 아주 덥습니다. 사람들은 바다에서 수영합니다. 가을은 날씨가 시원하고 하늘이 맑습니다. 사람들은 등산을 많이 합니다. 겨울은 눈이 오고 춥습니다.',
    passageTranslated: 'Корея баҳор, тобистон, тирамоҳ ва зимистон дорад. Баҳор гарму форам аст ва хеле зебо аст. Тобистон борони зиёд меборад ва хеле гарм аст. Одамон дар баҳр шиноварӣ мекунанд. Тирамоҳ обу ҳаво салқин аст ва осмон соф аст. Одамон бисёр кӯҳнавардӣ мекунанд. Зимистон барф меборад ва хунук аст.',
    questions: [
      { question: '여름 날씨는 어때요?', questionTranslated: 'Обу ҳавои тобистон чӣ гуна аст?', answer: '비가 오고 더워요.', options: ['비가 오고 더워요.', '눈이 오고 추워요.', '따뜻하고 맑아요.', '시원하고 비가 안 와요.'], explanation: 'Дар матн 여름은 비가 많이 오고 아주 덥습니다 나вишта шудааст.' },
      { question: '사람들은 가을에 무엇을 많이 해요?', questionTranslated: 'Одамон дар тирамоҳ чиро бисёр мекунанд?', answer: '등산', options: ['등산', '수영', '공부', '쇼핑'], explanation: 'Дар матн 가을에 사람들은 등산을 많이 합니다 나вишта шудааст.' },
      { question: '겨울에는 무엇이 와요?', questionTranslated: 'Дар зимистон чӣ меборад?', answer: '눈', options: ['눈', '비', '꽃', '바람'], explanation: 'Дар матн 겨울은 눈이 오고 춥습니다 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '주말 계획', titleTranslated: 'Нақшаҳои охири ҳафта',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '안나: 민수 씨, 이번 주말에 뭐 할 거예요? \n민수: 저는 산에 갈 거예요. 등산할 거예요. 안나 씨는요? \n안나: 저는 바다에 갈 거예요. 날씨가 더워서 수영할 거예요. \n민수: 아, 좋네요! 재미있게 놀고 오세요.',
    passageTranslated: 'Анна: Минсу, дар ин охири ҳафта чӣ кор хоҳед кард? \nМинсу: Ман ба кӯҳ хоҳам рафт. Кӯҳнавардӣ хоҳам кард. Шумо чӣ Анна? \nАнна: Ман ба баҳр хоҳам рафт. Обу ҳаво гарм аст, барои ҳамин шиноварӣ хоҳам кард. \nМинсу: Оҳ, нағз ку! Рафта нағз бозӣ карда биёед.',
    questions: [
      { question: '민수 씨는 주말에 어디에 갈 거예요?', questionTranslated: 'Минсу дар охири ҳафта ба куҷо хоҳад рафт?', answer: '산', options: ['산', '바다', '학교', '병원'], explanation: 'Дар матн 저는 산에 갈 거예요 나вишта шудааст.' },
      { question: '안나 씨는 바다에서 무엇을 할 거예요?', questionTranslated: 'Анна дар баҳр чӣ кор хоҳад кард?', answer: '수영', options: ['수영', '등산', '산책', '사진을 찍을 거예요'], explanation: 'Дар матн 수영할 거예요 나вишта шудааст.' },
      { question: '날씨가 어때요?', questionTranslated: 'Обу ҳаво чӣ гуна аст?', answer: '더워요', options: ['더워요', '추워요', '비가 와요', '눈이 와요'], explanation: 'Дар матн 날씨가 더워서 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '휴가 계획', titleTranslated: 'Нақшаи рухсатӣ',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '다음 주부터 제 여름 휴가입니다. 저는 친구하고 부산에 갈 거예요. 부산은 바다가 아주 아름다워요. 우리는 바다에서 수영하고 맛있는 고기와 생선을 먹을 거예요. 사진도 많이 찍을 거예요. 정말 좋을 거예요!',
    passageTranslated: 'Аз ҳафтаи оянда рухсатии тобистонаи ман сар мешавад. Ман бо дӯстам ба Пусан хоҳам рафт. Баҳри Пусан хеле зебо аст. Мо дар баҳр шиноварӣ мекунем ва гӯшту моҳии болаззат хоҳем хӯрд. Расм ҳам бисёр хоҳем гирифт. Воқеан хуб хоҳад шуд!',
    questions: [
      { question: '언제부터 휴가예요?', questionTranslated: 'Аз кай рухсатӣ сар мешавад?', answer: '다음 주', options: ['다음 주', '이번 주', '내년', '작년'], explanation: 'Дар матн 다음 주부터 나вишта шудааст.' },
      { question: '부산에서 무엇을 할 거예요?', questionTranslated: 'Дар Пусан чӣ кор хоҳанд кард?', answer: '수영하고 사진을 찍어요.', options: ['수영하고 사진을 찍어요.', '등산하고 공부해요.', '집에서 쉬어요.', '영화관에 가요.'], explanation: 'Дар матн 수영하고... 사진도 많이 찍을 거예요 나вишта шудааст.' },
      { question: '부산 바다는 어때요?', questionTranslated: 'Баҳри Пусан чӣ гуна аст?', answer: '아름다워요.', options: ['아름다워요.', '추워요.', '나빠요.', '비싸요.'], explanation: 'Дар матн 부산은 바다가 아주 아름다워요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 11 시험', titleTranslated: 'Имтиҳони Модули 11',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '오늘은 비가 많이 옵니다. 그래서 날씨가 조금 쌀쌀합니다. 저는 오늘 밖에 나가지 않을 거예요. 집에서 쉴 거예요. 집에서 책을 읽고 밥을 먹을 거예요. 내일은 날씨가 맑을 거예요. 내일 공원에서 산책할 거예요.',
    passageTranslated: 'Имрӯз борони зиёд меборад. Барои ҳамин обу ҳаво каме сард аст. Ман имрӯз ба берун нахоҳам баромад. Дар хона истироҳат хоҳам кард. Дар хона китоб мехонам ва хӯрок хоҳам хӯрд. Фардо обу ҳаво соф хоҳад шуд. Фардо дар парк сайр хоҳам кард.',
    questions: [
      { question: '오늘 날씨가 어때요?', questionTranslated: 'Имрӯз обу ҳаво чӣ гуна аст?', answer: '비가 오고 쌀쌀해요.', options: ['비가 오고 쌀쌀해요.', '맑고 따뜻해요.', '눈이 오고 추워요.', '바람이 불고 더워요.'], explanation: 'Дар матн 비가 많이 옵니다. 그래서 날씨가 조금 쌀쌀합니다 나вишта шудааст.' },
      { question: '오늘은 어디에 있을 거예요?', questionTranslated: 'Имрӯз дар куҷо хоҳад буд?', answer: '집', options: ['집', '공원', '학교', '바다'], explanation: 'Дар матн 집에서 쉴 거예요 나вишта шудааст.' },
      { question: '집에서 무엇을 할 거예요?', questionTranslated: 'Дар хона чӣ кор хоҳад кард?', answer: '책을 읽을 거예요.', options: ['책을 읽을 거예요.', '수영할 거예요.', '사진을 찍을 거예요.', '친구를 만날 거예요.'], explanation: 'Дар матн 집에서 책을 읽고 나вишта шудааст.' },
      { question: '내일은 무엇을 할 거예요?', questionTranslated: 'Фардо чӣ кор хоҳад кард?', answer: '공원에서 산책할 거예요.', options: ['공원에서 산책할 거예요.', '등산할 거예요.', '여행할 거예요.', '집에서 쉴 거예요.'], explanation: 'Дар матн 내일 공원에서 산책할 거예요 나вишта шудааст.' },
    ],
  },
];

export const DIALOGUE = {
    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '날씨 이야기', titleTranslated: 'Суҳбат дар бораи обу ҳаво',
    lines: [
      { speaker: '마이클', isUser: true, text: '수진 씨, 밖은 날씨가 어때요?', translation: 'Суҷин, дар берун обу ҳаво чӣ гуна аст?' },
      { speaker: '수진', text: '비가 오고 바람이 불어요. 조금 쌀쌀해요.', translation: 'Борон меборад ва шамол мевазад. Каме сард аст.' },
      { speaker: '마이클', isUser: true, text: '아, 우산이 없어요.', translation: 'Оҳ, чатр надорам.' },
      { speaker: '수진', text: '제 우산이 있어요. 같이 가요.', translation: 'Ман чатр дорам. Якҷоя меравем.' },
      { speaker: '마이클', isUser: true, text: '정말 고마워요. 내일도 비가 올 거예요?', translation: 'Воқеан ташаккур. Фардо ҳам борон хоҳад борид?' },
      { speaker: '수진', text: '아니요, 내일은 비가 안 오고 맑을 거예요.', translation: 'Не, фардо борон намеборад ва соф хоҳад шуд.' },
    ],
};

export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['봄', '여름', '가을', '겨울', '맑아요', '비', '구름', '수영해요'],
};

export const ORDER = [
  'vocab:계절',
  'vocab:날씨',
  'vocab:날씨 표현',
  'vocab:자연',
  'vocab:야외 활동',
  'vocab:시간과 휴가',
  'vocab:감정과 상태',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
