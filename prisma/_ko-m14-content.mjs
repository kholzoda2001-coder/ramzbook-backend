export const MODULE = {
  order: 13,
  title: '약속과 전화',
  titleTranslated: 'Мулоқот ва зангҳои телефонӣ',
  emoji: '📱',
  canDoStatement: 'Шумо метавонед вақти вохӯриро таъин кунед, бо телефон суҳбат кунед ва сабабу узрҳоро баён намоед.',
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
  './_ko-m12-content.mjs',
  './_ko-m13-content.mjs',
];

export const EXTRA_KNOWN = [
  '왔어요', '핸드폰을', '통화해요', '문자를', '보내요', '친구에게', '전화를', '메시지를', '시간을', '친구를', '약속을', '내일로', '전화할게요', '도착했어요', '늦어서', '받아서', '출장을', '약을', '밥을', '만날까요', '어디에서', '누구하고', '영화를', '볼까요', '갈까요', '무엇을', '먹을까요', '어디로', '점심을', '을까요', '까요', '아요', '어요', '만납시다', '불고기를', '먹읍시다', '봅시다', '공원에서', '운동합시다', '읍시다', 'ㅂ시다', '시다', '도서관에서', '공부합시다', '바빠서', '와서', '머리가', '아파서', '바', '빠서', '뻐서', '쁘서', '파서', '아서', '지만', '피곤해서', '집에서', '쉽니다', '해서', '하여서', '하서', '씨와', '있습니다', '서울역에서', '만날', '겁니다', '볼', '좋아합니다', '재미있을', '누구와', '서울역', '할', '거예요', '쇼핑을', '산책을', '공부를', '알리에요', '많아서', '가족을', '만나서', '가서', '있어서', '아', '미룰까요', '그때', '언제로', '미뤘어요', '달', '요일에', '친구와', '있었습니다', '갔습니다', '오지', '않았습니다', '걸었습니다', '받지', '중이었습니다', '후에', '했습니다', '막혀서', '늦는다고', '있었어요', '갔어요', '처음에', '받았어요', '중이어서', '없어서', '자고', '늦었어요', '몰라서', '길을', '잃어서', '돼요', '명동에서', '명동에', '맛있는',
  // Words used in previous modules or needed as filler
  '이거', '저거', '그거', '아주', '조금', '원', '마리', '번', '살', '마세요', '주세요',
  '어때요', '괜찮아요', '좋아요', '싫어요', '맛있어요', '맛없어요', '재미있어요', '재미없어요',
  '어디', '무엇', '누구', '언제', '왜', '어떻게', '무슨', '어느', '몇',
  '입니다', '입니까', '습니다', '습니까', '아/어요',
  '을/를', '이/가', '은/는', '에', '에서', '도', '만', '하고', '과/와', '의', '으로', '로',
  '안', '못', '지 않다', '지 못하다', '그리고', '그래서', '그러나', '하지만', '그러면', '그럼',
  '진짜', '정말', '너무', '많이', '약간', '별로', '전혀', '다', '모두',
  '사과를', '커피를', '빵을', '우유를', '옷을', '책을', '물을', '가방이', '책상이', '침대가', '냉장고가',
  '사요', '팔아요', '비싸요', '싸요',
  '사과', '수박', '물', '커피', '우유', '빵', '밥', '국', '반찬', '고기', '생선', '야채', '과일', '계란',
  '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
  '개', '명', '잔', '병', '인분', '층', '있어요', '없어요', '한', '두', '세', '네',
  '저는', '씨', '이에요', '예요', '해요', '했어요', '하세요',
  '같이', '때문에', '매일', '항상', '가끔', '자주', '보통', '오늘', '어제', '내일', '지금',
  '먹어요', '마셔요', '봐요', '가요', '와요',
  '먹을래요', '마실래요', '갈래요', '할래요',
  '학교에', '식당에', '집에', '방에',
  
  '봄', '여름', '가을', '겨울', '계절', '더워요', '추워요',
  '날씨', '맑아요', '흐려요', '비가', '비', '눈이', '눈', '바람이', '바람', '구름',
  '불어요', '따뜻해요', '시원해요', '쌀쌀해요', '우산',
  '바다', '산', '나무', '꽃', '하늘',
  '산책해요', '등산해요', '수영해요', '여행해요', '구경해요', '놀아요', '쉬어요',
  '주말에', '방학', '휴가', '이번', '다음', '작년', '내년',
  '기분', '아름다워요', '즐거워요', '피곤해요', '바빠요', '아파요', '찍어요',
  '고', '할 거예요', '갈 거예요', '볼 거예요', '될 거예요', '먹을 거예요',
  
  '취미', '음악', '영화', '노래', '그림', '독서', '게임',
  '들어요', '불러요', '그려요', '쳐요', '만들어요', '배워요', '가르쳐요',
  '운동', '축구', '농구', '야구', '배구', '수영', '태권도',
  '영화관', '미술관', '공', '피아노', '기타', '운동화', '스키',
  '춤', '춰요', '이겨요', '져요', '좋아해요', '싫어해요', '잘해요',
  '어려워요', '쉬워요', '무거워요', '가벼워요', '힘들어요', '멋있어요', '귀여워요',
  '주로', '혼자', '함께', '가장', '제일', '일찍', '늦게',

  '버스', '지하철', '택시', '기차', '비행기', '자전거', '배',
  '역', '정류장', '공항', '터미널', '표', '길', '지도',
  '타요', '내려요', '갈아타요', '걸어요', '출발해요', '도착해요', '막혀요',
  '여행', '사진', '카메라', '여권', '호텔', '짐', '외국',
  '시간', '걸려요', '가까워요', '멀어요', '빨라요', '느려요', '얼마나',
  '오른쪽', '왼쪽', '똑바로', '근처', '여기', '거기', '저기',
  '싶어요', '먹고 싶어요', '가고 싶어요', '보고 싶어요', '사고 싶어요', '쉬고 싶어요', '타고 싶어요'
];

export const CHARACTERS = {
  '마이클': { country: '미국', job: '학생', gender: 'm' },
  '안나': { country: '러시아', job: '선생님', gender: 'f' },
  '사라': { country: '영국', job: '의사', gender: 'f' },
  '알리': { country: '이집트', job: '학생', gender: 'm' },
  '유키': { country: '일본', job: '요리사', gender: 'f' },
  '수진': { country: '한국', 고향: '부산', job: '회사원', gender: 'f' },
  '민수': { country: '한국', job: '경찰관', gender: 'm' },
};
export const NAMES = Object.keys(CHARACTERS);

export const FAMILY = {
  '수진': { 남편: '마이클', 어머니: '사라', 아버지: '알리', 오빠: '민수' },
  '민수': { 여동생: '수진', 어머니: '사라', 아버지: '알리' },
};

export const VOCAB = [
  {
    title: '전화 1', titleTranslated: 'Телефон 1', emoji: '📱',
    words: [
      { word: '전화', translation: 'телефон', emoji: '☎️', pos: 'noun', ipa: '/tɕʌn.ɦwa/', example: '전화가 왔어요.', exampleTrans: 'Занг омад.' },
      { word: '핸드폰', translation: 'телефони мобилӣ', emoji: '📱', pos: 'noun', ipa: '/hɛn.dɯ.pʰon/', example: '핸드폰을 사요.', exampleTrans: 'Телефони мобилӣ мехарам.' },
      { word: '번호', translation: 'рақам', emoji: '🔢', pos: 'noun', ipa: '/pʌn.ɦo/', example: '전화번호가 뭐예요?', exampleTrans: 'Рақами телефони шумо чанд аст?' },
      { word: '통화', translation: 'гуфтугӯи телефонӣ / тамос', emoji: '🗣️', pos: 'noun', ipa: '/tʰoŋ.ɦwa/', example: '지금 통화해요.', exampleTrans: 'Ҳозир бо телефон суҳбат мекунам.' },
      { word: '문자', translation: 'паёмак / паём', emoji: '✉️', pos: 'noun', ipa: '/mun.tɕa/', example: '문자를 보내요.', exampleTrans: 'Паёмак мефиристам.' },
      { word: '전화해요', translation: 'занг задан / телефон кардан', emoji: '📞', pos: 'verb', ipa: '/tɕʌn.ɦwa.hɛ.jo/', example: '친구에게 전화해요.', exampleTrans: 'Ба дӯстам занг мезанам.', highlight: '전화해요' },
      { word: '걸어요', translation: 'занг задан / рақам чиндан', emoji: '📱', pos: 'verb', ipa: '/kʌ.ɾʌ.jo/', example: '전화를 걸어요.', exampleTrans: 'Занг мезанам.', highlight: '걸어요' },
    ],
  },
  {
    title: '전화 2', titleTranslated: 'Телефон 2', emoji: '☎️',
    words: [
      { word: '받아요', translation: 'ҷавоб додан / гирифтан', emoji: '📥', pos: 'verb', ipa: '/pa.da.jo/', example: '전화를 받아요.', exampleTrans: 'Ба телефон ҷавоб медиҳам.', highlight: '받아요' },
      { word: '끊어요', translation: 'қатъ кардан / гушакро мондан', emoji: '📵', pos: 'verb', ipa: '/k͈ɯ.nʌ.jo/', example: '전화를 끊어요.', exampleTrans: 'Телефонро қатъ мекунам.', highlight: '끊어요' },
      { word: '바꿔요', translation: 'додан (ба каси дигар) / иваз кардан', emoji: '🔄', pos: 'verb', ipa: '/pa.k͈wʌ.jo/', example: '전화를 바꿔요.', exampleTrans: 'Телефонро ба каси дигар медиҳам.', highlight: '바꿔요' },
      { word: '남겨요', translation: 'гузоштан (паём)', emoji: '📝', pos: 'verb', ipa: '/nam.ɡjʌ.jo/', example: '메시지를 남겨요.', exampleTrans: 'Паём мегузорам.', highlight: '남겨요' },
      { word: '연락해요', translation: 'тамос гирифтан', emoji: '🤝', pos: 'verb', ipa: '/jʌl.lak.hɛ.jo/', example: '나중에 연락해요.', exampleTrans: 'Баъдтар тамос мегирам.', highlight: '연락해요' },
      { word: '여보세요', translation: 'алло (дар телефон)', emoji: '🗣️', pos: 'adv', ipa: '/jʌ.bo.se.jo/', example: '여보세요? 수진 씨?', exampleTrans: 'Алло? Суҷин?' },
      { word: '통화 중', translation: 'хат банд / дар ҳоли гуфтугӯ', emoji: '⏳', pos: 'noun', ipa: '/tʰoŋ.ɦwa tɕuŋ/', example: '지금 통화 중이에요.', exampleTrans: 'Ҳозир хат банд аст.' },
    ],
  },
  {
    title: '약속 1', titleTranslated: 'Вохӯрӣ 1', emoji: '📅',
    words: [
      { word: '약속', translation: 'вохӯрӣ / ваъда', emoji: '🤝', pos: 'noun', ipa: '/jak.s͈ok/', example: '오늘 약속이 있어요.', exampleTrans: 'Имрӯз вохӯрӣ дорам.' },
      { word: '시간', translation: 'вақт', emoji: '⌚', pos: 'noun', ipa: '/ɕi.ɡan/', example: '약속 시간이 언제예요?', exampleTrans: 'Вақти вохӯрӣ кай аст?' },
      { word: '장소', translation: 'ҷой / макон', emoji: '📍', pos: 'noun', ipa: '/tɕaŋ.so/', example: '약속 장소가 어디예요?', exampleTrans: 'Ҷойи вохӯрӣ дар куҷост?' },
      { word: '정해요', translation: 'муайян кардан / таъин кардан', emoji: '✅', pos: 'verb', ipa: '/tɕʌŋ.hɛ.jo/', example: '시간을 정해요.', exampleTrans: 'Вақтро муайян мекунам.', highlight: '정해요' },
      { word: '만나요', translation: 'вохӯрдан', emoji: '👫', pos: 'verb', ipa: '/man.na.jo/', example: '친구를 만나요.', exampleTrans: 'Бо дӯстам вомехӯрам.', highlight: '만나요' },
      { word: '기다려요', translation: 'интизор шудан', emoji: '⏳', pos: 'verb', ipa: '/ki.da.ɾjʌ.jo/', example: '친구를 기다려요.', exampleTrans: 'Дӯстамро интизор мешавам.', highlight: '기다려요' },
      { word: '늦어요', translation: 'дер кардан', emoji: '🏃', pos: 'verb', ipa: '/nɯ.dʑʌ.jo/', example: '약속에 늦어요.', exampleTrans: 'Ба вохӯрӣ дер мекунам.', highlight: '늦어요' },
    ],
  },
  {
    title: '약속 2', titleTranslated: 'Вохӯрӣ 2', emoji: '🔄',
    words: [
      { word: '취소해요', translation: 'бекор кардан', emoji: '❌', pos: 'verb', ipa: '/tɕʰwi.so.hɛ.jo/', example: '약속을 취소해요.', exampleTrans: 'Вохӯриро бекор мекунам.', highlight: '취소해요' },
      { word: '미뤄요', translation: 'ба таъхир андохтан', emoji: '⏭️', pos: 'verb', ipa: '/mi.ɾwʌ.jo/', example: '약속을 내일로 미뤄요.', exampleTrans: 'Вохӯриро ба фардо ба таъхир меандозам.', highlight: '미뤄요' },
      { word: '지켜요', translation: 'вафо кардан (ба ваъда) / риоя кардан', emoji: '🛡️', pos: 'verb', ipa: '/tɕi.kʰjʌ.jo/', example: '약속을 잘 지켜요.', exampleTrans: 'Ба ваъдаи худ хуб вафо мекунам.', highlight: '지켜요' },
      { word: '바빠요', translation: 'банд будан', emoji: '🏃', pos: 'adj', ipa: '/pa.p͈a.jo/', example: '오늘 아주 바빠요.', exampleTrans: 'Имрӯз хеле банд ҳастам.', highlight: '바빠요' },
      { word: '시간이 있어요', translation: 'вақт доштан', emoji: '✅', pos: 'verb', ipa: '/ɕi.ɡa.ni i.s͈ʌ.jo/', example: '주말에 시간이 있어요.', exampleTrans: 'Дар охири ҳафта вақт дорам.', highlight: '시간이 있어요' },
      { word: '시간이 없어요', translation: 'вақт надоштан', emoji: '❌', pos: 'verb', ipa: '/ɕi.ɡa.ni ʌp.s͈ʌ.jo/', example: '지금 시간이 없어요.', exampleTrans: 'Ҳозир вақт надорам.', highlight: '시간이 없어요' },
      { word: '약속이 있어요', translation: 'вохӯрӣ доштан', emoji: '🤝', pos: 'verb', ipa: '/jak.s͈o.ɡi i.s͈ʌ.jo/', example: '내일 약속이 있어요.', exampleTrans: 'Фардо вохӯрӣ дорам.', highlight: '약속이 있어요' },
    ],
  },
  {
    title: '시간 표현', titleTranslated: 'Ибораҳои замонӣ', emoji: '⏰',
    words: [
      { word: '주말', translation: 'охири ҳафта', emoji: '🎉', pos: 'noun', ipa: '/tɕu.mal/', example: '주말에 만나요.', exampleTrans: 'Дар охири ҳафта вомехӯрем.' },
      { word: '평일', translation: 'рӯзҳои корӣ', emoji: '💼', pos: 'noun', ipa: '/pʰjʌŋ.il/', example: '평일에 일해요.', exampleTrans: 'Дар рӯзҳои корӣ кор мекунам.' },
      { word: '이번 주', translation: 'ин ҳафта', emoji: '📅', pos: 'noun', ipa: '/i.bʌn tɕu/', example: '이번 주 토요일', exampleTrans: 'шанбеи ин ҳафта' },
      { word: '다음 주', translation: 'ҳафтаи оянда', emoji: '⏭️', pos: 'noun', ipa: '/ta.ɯm tɕu/', example: '다음 주에 만나요.', exampleTrans: 'Ҳафтаи оянда вомехӯрем.' },
      { word: '이따가', translation: 'каме баъд (имрӯз)', emoji: '⏳', pos: 'adv', ipa: '/i.t͈a.ɡa/', example: '이따가 전화할게요.', exampleTrans: 'Каме баъдтар занг мезанам.' },
      { word: '나중에', translation: 'баъдтар (дар оянда)', emoji: '🔜', pos: 'adv', ipa: '/na.dʑuŋ.e/', example: '나중에 만나요.', exampleTrans: 'Баъдтар вомехӯрем.' },
      { word: '벌써', translation: 'аллакай', emoji: '😲', pos: 'adv', ipa: '/pʌl.s͈ʌ/', example: '벌써 도착했어요?', exampleTrans: 'Аллакай расидед?' },
    ],
  },
  {
    title: '이유와 사과', titleTranslated: 'Сабабҳо ва узрхоҳӣ', emoji: '🙏',
    words: [
      { word: '미안해요', translation: 'узр хостан / бубахшед', emoji: '🙏', pos: 'verb', ipa: '/mi.an.ɦɛ.jo/', example: '늦어서 미안해요.', exampleTrans: 'Бубахшед, ки дер кардам.', highlight: '미안해요' },
      { word: '죄송해요', translation: 'маъзарат мехоҳам (расмӣ)', emoji: '🙇', pos: 'verb', ipa: '/tɕwe.soŋ.ɦɛ.jo/', example: '전화를 못 받아서 죄송해요.', exampleTrans: 'Маъзарат мехоҳам, ки ба телефон ҷавоб дода натавонистам.', highlight: '죄송해요' },
      { word: '일', translation: 'кор / масъала', emoji: '💼', pos: 'noun', ipa: '/il/', example: '일이 많아요.', exampleTrans: 'Корам бисёр аст.' },
      { word: '회의', translation: 'ҷаласа / маҷлис', emoji: '👥', pos: 'noun', ipa: '/hwe.i/', example: '지금 회의 중이에요.', exampleTrans: 'Ҳозир дар маҷлис ҳастам.' },
      { word: '손님', translation: 'меҳмон / муштарӣ', emoji: '🤝', pos: 'noun', ipa: '/son.nim/', example: '손님이 왔어요.', exampleTrans: 'Меҳмон омад.' },
      { word: '출장', translation: 'сафари хидматӣ', emoji: '✈️', pos: 'noun', ipa: '/tɕʰul.t͈ɕaŋ/', example: '내일 출장을 가요.', exampleTrans: 'Фардо ба сафари хидматӣ меравам.' },
      { word: '약', translation: 'дору', emoji: '💊', pos: 'noun', ipa: '/jak/', example: '약을 먹어요.', exampleTrans: 'Дору мехӯрам.' },
    ],
  },
  {
    title: '제안과 질문', titleTranslated: 'Пешниҳодҳо ва саволҳо', emoji: '❓',
    words: [
      { word: '어때요', translation: 'чӣ тавр аст?', emoji: '❓', pos: 'adv', ipa: '/ʌ.t͈ɛ.jo/', example: '이 옷이 어때요?', exampleTrans: 'Ин либос чӣ тавр аст?' },
      { word: '같이', translation: 'якҷоя', emoji: '👫', pos: 'adv', ipa: '/ka.tɕʰi/', example: '같이 밥을 먹어요.', exampleTrans: 'Якҷоя хӯрок мехӯрем.' },
      { word: '언제', translation: 'кай', emoji: '⏰', pos: 'adv', ipa: '/ʌn.dʑe/', example: '언제 만날까요', exampleTrans: 'Кай вохӯрем?' },
      { word: '어디', translation: 'дар куҷо', emoji: '📍', pos: 'adv', ipa: '/ʌ.di/', example: '어디에서 만날까요', exampleTrans: 'Дар куҷо вохӯрем?' },
      { word: '누구', translation: 'кӣ', emoji: '👤', pos: 'adv', ipa: '/nu.ɡu/', example: '누구하고 가요?', exampleTrans: 'Бо кӣ меравед?' },
      { word: '무슨', translation: 'кадом / чӣ гуна', emoji: '❓', pos: 'adv', ipa: '/mu.sɯn/', example: '무슨 영화를 볼까요?', exampleTrans: 'Кадом филмро тамошо кунем?' },
      { word: '어떻게', translation: 'чӣ тавр', emoji: '🤔', pos: 'adv', ipa: '/ʌ.t͈ʌ.kʰe/', example: '어떻게 갈까요?', exampleTrans: 'Чӣ тавр меравем?' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: '문법: (으)ㄹ까요?', lessonTitleTranslated: 'Грамматика: ...кунем?',
    title: '동사 + (으)ㄹ까요?', titleTranslated: 'Феъл + ...кунем?',
    emoji: '🤔',
    explanation: 'Ин қолаби грамматикӣ барои пешниҳод кардан ё пурсидани фикру назари шунаванда истифода мешавад.',
    rules: [
      { pattern: 'Садонок ё ㄹ + ㄹ까요?', note: 'Садонок ё ҳарфи «р» + ин бандак' },
      { pattern: 'Ҳамсадо + 을까요?', note: 'Ҳамсадо + ин бандак' },
    ],
    examples: [
      { sentence: '언제 만날까요?', translation: 'Кай вохӯрем?', highlight: '만날까요' },
      { sentence: '무엇을 먹을까요?', translation: 'Чӣ бихӯрем?', highlight: '먹을까요' },
      { sentence: '영화를 볼까요?', translation: 'Филм тамошо кунем?', highlight: '볼까요' },
      { sentence: '어디로 갈까요?', translation: 'Ба куҷо равем?', highlight: '갈까요' },
    ],
    exercises: [
      { prompt: '우리 같이 점심을 먹___?', promptTranslated: 'Якҷоя хӯроки нисфирӯзӣ бихӯрем?', answer: '을까요', options: ['을까요', '까요', '아요', '어요'], explanation: 'Решаи феъл бо ҳамсадо ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '내일 만날___?', promptTranslated: 'Фардо вохӯрем?', answer: '까요', options: ['까요', '을까요', '어요', '다'], explanation: 'Решаи феъл бо ҳарфи «р» ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '무슨 영화를 볼___?', promptTranslated: 'Кадом филмро тамошо кунем?', answer: '까요', options: ['까요', '을까요', '어요', '고'], explanation: 'Решаи феъл бо ҳарфи «р» ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Фардо дар куҷо вохӯрем?', answer: '내일 어디에서 만날까요', options: ['만날까요', '어디에서', '내일'], explanation: 'Ин тартиби дурусти ҷумла аст.' },
    ],
  },
  {
    lessonTitle: '문법: (으)ㅂ시다', lessonTitleTranslated: 'Грамматика: Биёед ...кунем',
    title: '동사 + (으)ㅂ시다', titleTranslated: 'Феъл + Биёед ...кунем',
    emoji: '👫',
    explanation: 'Ин қолаби грамматикӣ барои пешниҳоди иҷрои коре якҷоя бо шунаванда истифода мешавад.',
    rules: [
      { pattern: 'Садонок ё ㄹ + ㅂ시다', note: 'Садонок ё ҳарфи «р» + ин бандак' },
      { pattern: 'Ҳамсадо + 읍시다', note: 'Ҳамсадо + ин бандак' },
    ],
    examples: [
      { sentence: '내일 만납시다.', translation: 'Биёед, фардо вохӯрем.', highlight: '만납시다' },
      { sentence: '불고기를 먹읍시다.', translation: 'Биёед, пулгогӣ бихӯрем.', highlight: '먹읍시다' },
      { sentence: '같이 영화를 봅시다.', translation: 'Биёед, якҷоя филм тамошо кунем.', highlight: '봅시다' },
      { sentence: '공원에서 운동합시다.', translation: 'Биёед, дар боғ варзиш кунем.', highlight: '운동합시다' },
    ],
    exercises: [
      { prompt: '같이 밥을 먹___.', promptTranslated: 'Биёед, якҷоя хӯрок бихӯрем.', answer: '읍시다', options: ['읍시다', 'ㅂ시다', '을까요', '어요'], explanation: 'Решаи феъл бо ҳамсадо ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '내일 만납___.', promptTranslated: 'Биёед, фардо вохӯрем.', answer: '시다', options: ['시다', '읍시다', '까요', '고'], explanation: 'Решаи феъл бо садонок ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '도서관에서 공부합___.', promptTranslated: 'Биёед, дар китобхона дарс хонем.', answer: '시다', options: ['시다', '읍시다', '고', '아요'], explanation: 'Решаи феъл бо садонок ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Биёед, якҷоя филм тамошо кунем.', answer: '우리 같이 영화를 봅시다', options: ['영화를', '봅시다', '같이', '우리'], explanation: 'Ин тартиби дурусти ҷумла аст.' },
    ],
  },
  {
    lessonTitle: '문법: 아/어서', lessonTitleTranslated: 'Грамматика: Чунки / Барои ҳамин',
    title: '동사/형용사 + 아/어서', titleTranslated: 'Феъл/Сифат + Чунки',
    emoji: '➡️',
    explanation: 'Ин сохтори грамматикӣ барои баён кардани сабаб ё далели амал ё ҳолат дар ҷумлаи минбаъда истифода мешавад.',
    rules: [
      { pattern: 'Садонокҳои 아 ё 오 + 아서', note: 'Садонокҳои «а» ё «о» + ин бандак' },
      { pattern: 'Дигар садонокҳо + 어서', note: 'Дигар садонокҳо + ин бандак' },
      { pattern: '하다 -> 해서', note: 'Феълҳои бо «ҳада» тамомшаванда ба ин шакл табдил меёбанд' },
    ],
    examples: [
      { sentence: '바빠서 못 가요.', translation: 'Банд ҳастам, бинобар ин рафта наметавонам.', highlight: '바빠서' },
      { sentence: '비가 와서 집에 있어요.', translation: 'Борон меборад, бинобар ин дар хона ҳастам.', highlight: '와서' },
      { sentence: '머리가 아파서 쉬어요.', translation: 'Сарам дард мекунад, барои ҳамин истироҳат мекунам.', highlight: '아파서' },
      { sentence: '늦어서 미안해요.', translation: 'Бубахшед, ки дер кардам.', highlight: '늦어서' },
    ],
    exercises: [
      { prompt: '오늘은 바___ 못 만나요.', promptTranslated: 'Имрӯз банд ҳастам, бинобар ин вохӯрда наметавонам.', answer: '빠서', options: ['빠서', '뻐서', '쁘서', '파서'], explanation: 'Сифат бо садоноки «а» ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '약속에 늦___ 죄송해요.', promptTranslated: 'Бубахшед, ки ба вохӯрӣ дер кардам.', answer: '어서', options: ['어서', '아서', '고', '지만'], explanation: 'Феъл бо садоноке ба ҷуз «а/о» ба охир мерасад, бинобар ин ин бандак истифода мешавад.' },
      { prompt: '피곤___ 집에서 쉽니다.', promptTranslated: 'Хаста шудам, бинобар ин дар хона истироҳат мекунам.', answer: '해서', options: ['해서', '하여서', '하고', '하서'], explanation: 'Феълҳое, ки бо «ҳада» тамом мешаванд, ба ин шакл иваз мешаванд.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Борон меборад, бинобар ин роҳ банд аст.', answer: '비가 와서 길이 막혀요', options: ['와서', '막혀요', '비가', '길이'], explanation: 'Ин тартиби дурусти ҷумла аст.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '주말 약속', titleTranslated: 'Вохӯрии охири ҳафта',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '저는 이번 주말에 안나 씨와 약속이 있습니다. 우리는 토요일 오후 한 시에 서울역에서 만날 겁니다. 같이 점심을 먹고 영화를 볼 겁니다. 저는 한국 영화를 아주 좋아합니다. 그래서 한국 영화를 볼 겁니다. 영화가 재미있을 겁니다.',
    passageTranslated: 'Ман ин охири ҳафта бо Анна вохӯрӣ дорам. Мо рӯзи шанбе соати 13:00 дар истгоҳи Сеул вомехӯрем. Якҷоя хӯроки нисфирӯзӣ мехӯрем ва филм тамошо мекунем. Ман филмҳои кореягиро хеле дӯст медорам. Бинобар ин, мо филми кореягӣ тамошо мекунем. Филм шавқовар хоҳад буд.',
    questions: [
      { question: '이 사람은 이번 주말에 누구와 약속이 있어요?', questionTranslated: 'Ин шахс ин охири ҳафта бо кӣ вохӯрӣ дорад?', answer: '안나', options: ['안나', '마이클', '수진', '알리'], explanation: 'Дар матн гуфта шудааст, ки ӯ бо Анна вохӯрӣ дорад.' },
      { question: '두 사람은 어디에서 만나요?', questionTranslated: 'Ҳар ду нафар дар куҷо вомехӯранд?', answer: '서울역', options: ['서울역', '영화관', '식당', '집'], explanation: 'Дар матн гуфта шудааст, ки онҳо дар истгоҳи Сеул вомехӯранд.' },
      { question: '두 사람은 무엇을 할 거예요?', questionTranslated: 'Ҳар ду нафар чӣ кор хоҳанд кард?', answer: '점심을 먹고 영화를 봐요.', options: ['점심을 먹고 영화를 봐요.', '쇼핑을 하고 커피를 마셔요.', '공원에서 산책을 해요.', '도서관에서 공부를 해요.'], explanation: 'Дар матн гуфта шудааст, ки онҳо хӯроки нисфирӯзӣ мехӯранд ва филм тамошо мекунанд.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '전화 통화', titleTranslated: 'Гуфтугӯи телефонӣ',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '알리: 여보세요. 수진 씨, 저 알리에요. \n수진: 네, 알리 씨. 무슨 일이에요? \n알리: 우리 내일 만날까요? 같이 밥을 먹읍시다. \n수진: 미안해요. 내일은 회사에 일이 많아서 바빠요. \n알리: 그럼 이번 주말은 어때요? \n수진: 주말은 괜찮아요. 토요일에 만납시다.',
    passageTranslated: 'Алӣ: Алло. Суҷин, ин манам, Алӣ. / Суҷин: Бале, Алӣ. Чӣ гап буд? / Алӣ: Фардо вохӯрем? Биёед якҷоя хӯрок бихӯрем. / Суҷин: Бубахшед. Фардо дар ширкат корам зиёд аст, бинобар ин бандам. / Алӣ: Пас, охири ин ҳафта чӣ тавр аст? / Суҷин: Охири ҳафта хуб аст. Рӯзи шанбе вомехӯрем.',
    questions: [
      { question: '수진 씨는 내일 왜 바빠요?', questionTranslated: 'Чаро Суҷин фардо банд аст?', answer: '회사에 일이 많아서', options: ['회사에 일이 많아서', '가족을 만나서', '아파서', '출장을 가서'], explanation: 'Дар матн гуфта шудааст, ки ӯ дар ширкат кори зиёд дорад.' },
      { question: '두 사람은 언제 만날 거예요?', questionTranslated: 'Ҳар ду нафар кай вомехӯранд?', answer: '토요일', options: ['토요일', '내일', '일요일', '오늘'], explanation: 'Дар матн гуфта шудааст, ки онҳо рӯзи шанбе вомехӯранд.' },
      { question: '두 사람은 만나서 무엇을 할 거예요?', questionTranslated: 'Онҳо ҳангоми вохӯрӣ чӣ кор хоҳанд кард?', answer: '밥을 먹어요', options: ['밥을 먹어요', '영화를 봐요', '쇼핑을 해요', '커피를 마셔요'], explanation: 'Дар матн гуфта шудааст, ки онҳо хӯрок мехӯранд.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '약속 취소', titleTranslated: 'Бекор кардани вохӯрӣ',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '마이클: 민수 씨, 미안해요. 제가 오늘 회의가 있어서 약속에 못 가요. \n민수: 아, 그래요? 많이 바빠요? \n마이클: 네, 일이 너무 많아서 시간이 없어요. 약속을 다음 주로 미룰까요? \n민수: 네, 좋아요. 다음 주 금요일 어때요? \n마이클: 금요일 좋아요. 그때 만납시다.',
    passageTranslated: 'Майкл: Минсу, бубахшед. Ман имрӯз маҷлис дорам, бинобар ин ба вохӯрӣ рафта наметавонам. / Минсу: Оҳ, дар ҳақиқат? Хеле бандед? / Майкл: Бале, корам хеле зиёд аст ва вақт надорам. Вохӯриро ба ҳафтаи оянда ба таъхир андозем? / Минсу: Бале, хуб аст. Рӯзи ҷумъаи оянда чӣ тавр аст? / Майкл: Рӯзи ҷумъа хуб аст. Пас, он гоҳ вомехӯрем.',
    questions: [
      { question: '마이클 씨는 오늘 왜 약속에 못 가요?', questionTranslated: 'Чаро Майкл имрӯз ба вохӯрӣ рафта наметавонад?', answer: '회의가 있어서', options: ['회의가 있어서', '머리가 아파서', '출장을 가서', '비가 와서'], explanation: 'Дар матн гуфта шудааст, ки ӯ маҷлис дорад.' },
      { question: '두 사람은 약속을 언제로 미뤘어요?', questionTranslated: 'Онҳо вохӯриро ба кай ба таъхир андохтанд?', answer: '다음 주', options: ['다음 주', '이번 주말', '내일', '다음 달'], explanation: 'Дар матн гуфта шудааст, ки онҳо вохӯриро ба ҳафтаи оянда гузарониданд.' },
      { question: '두 사람은 다음 주 무슨 요일에 만나요?', questionTranslated: 'Онҳо ҳафтаи оянда кадом рӯзи ҳафта вомехӯранд?', answer: '금요일', options: ['금요일', '월요일', '수요일', '토요일'], explanation: 'Дар матн гуфта шудааст, ки онҳо рӯзи ҷумъа вомехӯранд.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 14 시험', titleTranslated: 'Имтиҳони Модули 14',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '저는 오늘 친구와 약속이 있었습니다. 그래서 식당에 갔습니다. 하지만 친구가 오지 않았습니다. 친구에게 전화를 걸었습니다. 친구가 전화를 받지 않았습니다. 통화 중이었습니다. 십 분 후에 친구가 전화를 했습니다. 친구가 차가 많이 막혀서 늦는다고 했습니다.',
    passageTranslated: 'Ман имрӯз бо дӯстам вохӯрӣ доштам. Бинобар ин ба тарабхона рафтам. Аммо дӯстам наомад. Ба дӯстам занг задам. Дӯстам ба телефон ҷавоб надод. Телефон банд буд. Баъди даҳ дақиқа дӯстам занг зад. Дӯстам гуфт, ки аз сабаби роҳбандии сахт дер кардааст.',
    questions: [
      { question: '이 사람은 오늘 누구와 약속이 있었어요?', questionTranslated: 'Ин шахс имрӯз бо кӣ вохӯрӣ дошт?', answer: '친구', options: ['친구', '선생님', '동생', '손님'], explanation: 'Дар матн гуфта шудааст, ки ӯ бо дӯсташ вохӯрӣ дошт.' },
      { question: '이 사람은 어디에 갔어요?', questionTranslated: 'Ин шахс ба куҷо рафт?', answer: '식당', options: ['식당', '영화관', '공원', '학교'], explanation: 'Дар матн гуфта шудааст, ки ӯ ба тарабхона рафт.' },
      { question: '친구가 처음에 왜 전화를 안 받았어요?', questionTranslated: 'Чаро дӯсташ дар аввал ба телефон ҷавоб надод?', answer: '통화 중이어서', options: ['통화 중이어서', '핸드폰이 없어서', '자고 있어서', '회의 중이어서'], explanation: 'Дар матн гуфта шудааст, ки хатти телефон банд буд.' },
      { question: '친구가 왜 늦었어요?', questionTranslated: 'Чаро дӯсташ дер кард?', answer: '차가 많이 막혀서', options: ['차가 많이 막혀서', '시간을 몰라서', '아파서', '길을 잃어서'], explanation: 'Дар матн гуфта шудааст, ки роҳбандӣ хеле сахт буд.' },
    ],
  },
];

export const DIALOGUE = {
    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '시간 정하기', titleTranslated: 'Муайян кардани вақт',
    lines: [
      { speaker: '마이클', isUser: true, text: '수진 씨, 우리 언제 만날까요?', translation: 'Суҷин, кай вохӯрем?' },
      { speaker: '수진', text: '이번 주 금요일 저녁 어때요?', translation: 'Бегоҳии рӯзи ҷумъаи ин ҳафта чӣ тавр аст?' },
      { speaker: '마이클', isUser: true, text: '금요일은 제가 바빠서 안 돼요. 토요일은 어때요?', translation: 'Рӯзи ҷумъа бандам, наметавонам. Рӯзи шанбе чӣ тавр аст?' },
      { speaker: '수진', text: '토요일은 괜찮아요. 어디에서 만날까요?', translation: 'Рӯзи шанбе хуб аст. Дар куҷо вохӯрем?' },
      { speaker: '마이클', isUser: true, text: '명동에서 만납시다. 명동에 맛있는 식당이 있어요.', translation: 'Биёед дар Мёндон вохӯрем. Дар Мёндон тарабхонаи болаззат ҳаст.' },
      { speaker: '수진', text: '좋아요. 토요일에 명동에서 만납시다.', translation: 'Хуб. Рӯзи шанбе дар Мёндон вомехӯрем.' },
    ],
};

export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['약속', '전화', '핸드폰', '취소해요', '미안해요', '회의', '바빠요', '시간'],
};

export const ORDER = [
  'vocab:전화 1',
  'vocab:전화 2',
  'vocab:약속 1',
  'vocab:약속 2',
  'vocab:시간 표현',
  'vocab:이유와 사과',
  'vocab:제안과 질문',
  'grammar:0',
  'grammar:1',
  'grammar:2',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
