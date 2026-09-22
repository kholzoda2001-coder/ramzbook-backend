export const MODULE = {
  order: 9,
  title: '위치와 방향',
  titleTranslated: 'Ҷойҳо ва Самтҳо',
  emoji: '📍',
  canDoStatement: 'Шумо метавонед ҷойгиршавии ашёҳоро тасвир кунед, самтҳоро фаҳмонед ва роҳро ба забони кореягӣ пурсед.',
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
];

export const EXTRA_KNOWN = [
  '앞', '역', '역은', '차',
  
  '약이', '창문을', '열어요', '저쪽으로',
  
  '위에', '아래에', '앞에', '뒤에', '옆에', '안에', '밖에', '제', '컴퓨터', '고양이', '펜이', '약국이', '은행이', '병원이', '고양이가', '우체국이', '도서관에서', '일층으로', '이층으로', '안으로', '밖으로', '길을', '역에서', '버스를', '지하철을', '기차가', '빨라요', '하늘에', '자전거를', '마트에서', '카페에서', '서점에서', '이곳은', '침대와', '컴퓨터와', '어디를', '찾아요', '약국에서', '오른쪽으로', '뒤로', '어디로', '가세요', '오세요', '동네는', '편의점과', '멀어요', '친구와', '갔어요', '안에는', '많았어요', '과일과', '샀어요', '나왔어요', '있어서', '택시를', '탔어요', '무엇을', '물과', '옷과', '고기와', '걸어갔어요', '병원이요', '보이세요', '보여요', '아', '천만에요', '없었어요', '몰라요', '이쪽으로', '저기요', '실례합니다', '서울', '다음',
  
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
  '먹어요', '마셔요', '봐요', '가요', '와요', '해요',
  '먹을래요', '마실래요', '갈래요', '할래요',
  '학교에', '식당에', '집에', '방에',
  '학교', '식당', '집', '어디에'
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
    title: '위치', titleTranslated: 'Ҷойгиршавӣ (Мавқеъ)', emoji: '📦',
    words: [
      { word: '위', translation: 'боло', emoji: '⬆️', pos: 'noun', ipa: '/wi/', example: '책상 위에 있어요.', exampleTrans: 'Дар болои миз аст.' },
      { word: '아래', translation: 'поён', emoji: '⬇️', pos: 'noun', ipa: '/a.ɾɛ/', example: '의자 아래에 있어요.', exampleTrans: 'Дар поёни курсӣ аст.' },
      { word: '앞쪽', translation: 'пеш', emoji: '⬆️', pos: 'noun', ipa: '/ap.t͈ɕok/', example: '학교 앞쪽에 있어요.', exampleTrans: 'Дар пеши мактаб аст.' },
      { word: '뒤', translation: 'қафо', emoji: '⬇️', pos: 'noun', ipa: '/twi/', example: '집 뒤에 가요.', exampleTrans: 'Ба қафои хона меравам.' },
      { word: '옆', translation: 'паҳлӯ / қатор', emoji: '↔️', pos: 'noun', ipa: '/jʌp/', example: '식당 옆에 있어요.', exampleTrans: 'Дар паҳлӯи тарабхона аст.' },
      { word: '안', translation: 'дарун', emoji: '📦', pos: 'noun', ipa: '/an/', example: '가방 안에 있어요.', exampleTrans: 'Дар даруни сумка аст.' },
      { word: '밖', translation: 'берун', emoji: '🌳', pos: 'noun', ipa: '/pak/', example: '집 밖에 없어요.', exampleTrans: 'Дар беруни хона нест.' },
    ],
  },
  {
    title: '장소 1', titleTranslated: 'Ҷойҳо 1', emoji: '🏥',
    words: [
      { word: '공원', translation: 'парк / боғ', emoji: '🌲', pos: 'noun', ipa: '/koŋ.wʌn/', example: '공원에 가요.', exampleTrans: 'Ба парк меравам.' },
      { word: '병원', translation: 'беморхона', emoji: '🏥', pos: 'noun', ipa: '/pjʌŋ.wʌn/', example: '병원 옆에 약국이 있어요.', exampleTrans: 'Дар паҳлӯи беморхона дорухона ҳаст.' },
      { word: '약국', translation: 'дорухона', emoji: '💊', pos: 'noun', ipa: '/jak.k͈uk/', example: '약국에 약이 있어요.', exampleTrans: 'Дар дорухона дору ҳаст.' },
      { word: '은행', translation: 'бонк', emoji: '🏦', pos: 'noun', ipa: '/ɯn.hɛŋ/', example: '은행에 돈이 있어요.', exampleTrans: 'Дар бонк пул ҳаст.' },
      { word: '우체국', translation: 'почта', emoji: '📮', pos: 'noun', ipa: '/u.tɕʰe.ɡuk/', example: '우체국이 어디에 있어요?', exampleTrans: 'Почта дар куҷост?' },
      { word: '도서관', translation: 'китобхона', emoji: '📚', pos: 'noun', ipa: '/to.sʌ.ɡwan/', example: '도서관에서 책을 읽어요.', exampleTrans: 'Дар китобхона китоб мехонам.' },
      { word: '화장실', translation: 'ҳоҷатхона', emoji: '🚻', pos: 'noun', ipa: '/hwa.dʑaŋ.ɕil/', example: '화장실이 어디예요?', exampleTrans: 'Ҳоҷатхона куҷост?' },
    ],
  },
  {
    title: '방과 가구', titleTranslated: 'Ҳуҷра ва Мебел', emoji: '🛏️',
    words: [
      { word: '방', translation: 'ҳуҷра (хона)', emoji: '🚪', pos: 'noun', ipa: '/paŋ/', example: '제 방이에요.', exampleTrans: 'Ин ҳуҷраи ман аст.' },
      { word: '책상', translation: 'мизи корӣ', emoji: '🖥️', pos: 'noun', ipa: '/tɕʰɛk.s͈aŋ/', example: '책상 위에 펜이 있어요.', exampleTrans: 'Дар болои миз ручка ҳаст.' },
      { word: '의자', translation: 'курсӣ', emoji: '🪑', pos: 'noun', ipa: '/ɯi.dʑa/', example: '의자 아래에 고양이가 있어요.', exampleTrans: 'Дар поёни курсӣ гурба ҳаст.' },
      { word: '침대', translation: 'кат / бистар', emoji: '🛏️', pos: 'noun', ipa: '/tɕʰim.dɛ/', example: '침대 옆에 책상이 있어요.', exampleTrans: 'Дар паҳлӯи кат миз ҳаст.' },
      { word: '옷장', translation: 'ҷевони либос', emoji: '🧥', pos: 'noun', ipa: '/ot.t͈ɕaŋ/', example: '옷장 안에 옷이 많아요.', exampleTrans: 'Дар даруни ҷевон либос бисёр аст.' },
      { word: '창문', translation: 'тиреза', emoji: '🪟', pos: 'noun', ipa: '/tɕʰaŋ.mun/', example: '창문을 열어요.', exampleTrans: 'Тирезаро мекушоям.' },
      { word: '냉장고', translation: 'яхдон', emoji: '🧊', pos: 'noun', ipa: '/nɛŋ.dʑaŋ.ɡo/', example: '냉장고 안에 물이 있어요.', exampleTrans: 'Дар даруни яхдон об ҳаст.' },
    ],
  },
  {
    title: '방향', titleTranslated: 'Самтҳо', emoji: '🧭',
    words: [
      { word: '오른쪽', translation: 'тарафи рост', emoji: '➡️', pos: 'noun', ipa: '/o.ɾɯn.t͈ɕok/', example: '오른쪽으로 가세요.', exampleTrans: 'Ба тарафи рост равед.' },
      { word: '왼쪽', translation: 'тарафи чап', emoji: '⬅️', pos: 'noun', ipa: '/wen.t͈ɕok/', example: '왼쪽에 은행이 있어요.', exampleTrans: 'Дар тарафи чап бонк ҳаст.' },
      { word: '똑바로', translation: 'рост ба пеш', emoji: '⬆️', pos: 'adv', ipa: '/t͈ok.p͈a.ɾo/', example: '똑바로 가세요.', exampleTrans: 'Рост ба пеш равед.' },
      { word: '이쪽', translation: 'ин тараф', emoji: '👇', pos: 'noun', ipa: '/i.t͈ɕok/', example: '이쪽으로 오세요.', exampleTrans: 'Ба ин тараф биёед.' },
      { word: '저쪽', translation: 'он тараф (дур)', emoji: '👆', pos: 'noun', ipa: '/tɕʌ.t͈ɕok/', example: '저쪽으로 가세요.', exampleTrans: 'Ба он тараф равед.' },
      { word: '그쪽', translation: 'он тараф (наздик ба шунаванда)', emoji: '👉', pos: 'noun', ipa: '/kɯ.t͈ɕok/', example: '그쪽에 화장실이 있어요.', exampleTrans: 'Дар он тараф ҳоҷатхона ҳаст.' },
      { word: '길', translation: 'роҳ', emoji: '🛣️', pos: 'noun', ipa: '/kil/', example: '이 길이 맞아요?', exampleTrans: 'Ин роҳ дуруст аст?' },
    ],
  },
  {
    title: '방향 동사', titleTranslated: 'Феълҳои самт', emoji: '🚶',
    words: [
      { word: '올라가요', translation: 'боло рафтан', emoji: '🧗', pos: 'verb', ipa: '/ol.la.ɡa.jo/', example: '이층으로 올라가요.', exampleTrans: 'Ба ошёнаи дуюм боло меравам.', highlight: '올라가요' },
      { word: '내려가요', translation: 'поён рафтан', emoji: '📉', pos: 'verb', ipa: '/nɛ.ɾjʌ.ɡa.jo/', example: '일층으로 내려가요.', exampleTrans: 'Ба ошёнаи якум поён меравам.', highlight: '내려가요' },
      { word: '들어가요', translation: 'даромадан (ба дарун)', emoji: '🚶', pos: 'verb', ipa: '/tɯ.ɾʌ.ɡa.jo/', example: '방 안으로 들어가요.', exampleTrans: 'Ба даруни ҳуҷра медароям.', highlight: '들어가요' },
      { word: '나가요', translation: 'баромадан (ба берун)', emoji: '🏃', pos: 'verb', ipa: '/na.ɡa.jo/', example: '밖으로 나가요.', exampleTrans: 'Ба берун мебароям.', highlight: '나가요' },
      { word: '건너가요', translation: 'убур кардан / гузаштан', emoji: '🚶‍♂️', pos: 'verb', ipa: '/kʌn.nʌ.ɡa.jo/', example: '길을 건너가요.', exampleTrans: 'Аз роҳ мегузарам.', highlight: '건너가요' },
      { word: '타요', translation: 'савор шудан', emoji: '🚕', pos: 'verb', ipa: '/tʰa.jo/', example: '버스를 타요.', exampleTrans: 'Ба автобус савор мешавам.', highlight: '타요' },
      { word: '내려요', translation: 'фаромадан (аз нақлиёт)', emoji: '🚷', pos: 'verb', ipa: '/nɛ.ɾjʌ.jo/', example: '다음 역에서 내려요.', exampleTrans: 'Дар истгоҳи навбатӣ мефароям.', highlight: '내려요' },
    ],
  },
  {
    title: '교통', titleTranslated: 'Нақлиёт (Транспорт)', emoji: '🚌',
    words: [
      { word: '버스', translation: 'автобус', emoji: '🚌', pos: 'noun', ipa: '/pʌ.sɯ/', example: '버스가 와요.', exampleTrans: 'Автобус меояд.' },
      { word: '지하철', translation: 'метро', emoji: '🚇', pos: 'noun', ipa: '/tɕi.ha.tɕʰʌl/', example: '지하철을 타요.', exampleTrans: 'Ба метро савор мешавам.' },
      { word: '택시', translation: 'таксӣ', emoji: '🚕', pos: 'noun', ipa: '/tʰɛk.ɕi/', example: '택시가 비싸요.', exampleTrans: 'Таксӣ қиммат аст.' },
      { word: '기차', translation: 'поезд', emoji: '🚆', pos: 'noun', ipa: '/ki.tɕʰa/', example: '기차가 빨라요.', exampleTrans: 'Поезд тез аст.' },
      { word: '비행기', translation: 'тайёра', emoji: '✈️', pos: 'noun', ipa: '/pi.hɛŋ.ɡi/', example: '비행기가 하늘에 있어요.', exampleTrans: 'Тайёра дар осмон аст.' },
      { word: '자전거', translation: 'дучарха (велосипед)', emoji: '🚲', pos: 'noun', ipa: '/tɕa.dʑʌn.ɡʌ/', example: '자전거를 타요.', exampleTrans: 'Ба дучарха савор мешавам.' },
      { word: '자동차', translation: 'мошин (автомобил)', emoji: '🚗', pos: 'noun', ipa: '/tɕa.doŋ.tɕʰa/', example: '자동차가 많아요.', exampleTrans: 'Мошин бисёр аст.' },
    ],
  },
  {
    title: '장소 2', titleTranslated: 'Ҷойҳо 2', emoji: '🚏',
    words: [
      { word: '정류장', translation: 'истгоҳ (барои автобус)', emoji: '🚏', pos: 'noun', ipa: '/tɕʌŋ.nju.dʑaŋ/', example: '버스 정류장에 있어요.', exampleTrans: 'Дар истгоҳи автобус ҳастам.' },
      { word: '지하철역', translation: 'истгоҳ (барои метро)', emoji: '🚉', pos: 'noun', ipa: '/tɕi.ha.tɕʰʌ.ɾjʌk/', example: '지하철역이 어디예요?', exampleTrans: 'Истгоҳи метро куҷост?' },
      { word: '공항', translation: 'фурудгоҳ', emoji: '🛫', pos: 'noun', ipa: '/koŋ.haŋ/', example: '비행기가 공항에 있어요.', exampleTrans: 'Тайёра дар фурудгоҳ аст.' },
      { word: '편의점', translation: 'мағозаи 24-соата', emoji: '🏪', pos: 'noun', ipa: '/pʰjʌ.ni.dʑʌm/', example: '편의점에 가요.', exampleTrans: 'Ба мағозаи 24-соата меравам.' },
      { word: '마트', translation: 'супермаркет / бозор', emoji: '🛒', pos: 'noun', ipa: '/ma.tʰɯ/', example: '마트에서 사과를 사요.', exampleTrans: 'Аз супермаркет себ мехарам.' },
      { word: '카페', translation: 'қаҳвахона', emoji: '☕', pos: 'noun', ipa: '/kʰa.pʰe/', example: '카페에서 커피를 마셔요.', exampleTrans: 'Дар қаҳвахона қаҳва менӯшам.' },
      { word: '서점', translation: 'китобфурӯшӣ', emoji: '📖', pos: 'noun', ipa: '/sʌ.dʑʌm/', example: '서점에서 책을 사요.', exampleTrans: 'Аз китобфурӯшӣ китоб мехарам.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: '문법: -에 있다/없다', lessonTitleTranslated: 'Грамматика: Дар [ҷой] ҳаст/нест',
    title: '명사 + 에 있다/없다', titleTranslated: 'Исм + 에 있다/없다',
    emoji: '📍',
    explanation: 'Барои гуфтани он ки чизе дар куҷо ҷойгир аст, ба калимаи ҷой 내 -에 화 한 (에 있다) 고 보 고 미 시 아 고 아 하 아 에 시 에 아 고 미. "가방 안에 있어요" = "Дар даруни сумка аст".',
    rules: [
      { pattern: 'Ҷой + 에 + 있다', note: '책상 위에 있어요. (Дар болои миз ҳаст).' },
      { pattern: 'Ҷой + 에 + 없다', note: '방 안에 없어요. (Дар даруни ҳуҷра нест).' },
    ],
    examples: [
      { sentence: '가방 안에 책이 있어요.', translation: 'Дар даруни сумка китоб ҳаст.', highlight: '안에 책이 있어요' },
      { sentence: '학교 앞에 병원이 있어요.', translation: 'Дар пеши мактаб беморхона ҳаст.', highlight: '앞에 병원이 있어요' },
      { sentence: '냉장고 안에 사과가 없어요.', translation: 'Дар даруни яхдон себ нест.', highlight: '안에 사과가 없어요' },
      { sentence: '우체국 옆에 은행이 있어요.', translation: 'Дар паҳлӯи почта бонк ҳаст.', highlight: '옆에 은행이 있어요' },
    ],
    exercises: [
      { prompt: '책상 ___ 펜이 있어요.', promptTranslated: 'Дар болои миз ручка ҳаст.', answer: '위에', options: ['위에', '아래에', '뒤에', '밖에'], explanation: 'Боло 피 -위 대, 보 "위에".' },
      { prompt: '학교 ___ 식당이 없어요.', promptTranslated: 'Дар даруни мактаб тарабхона нест.', answer: '안에', options: ['안에', '앞에', '위에', '밖에'], explanation: 'Дарун 조 -안 대, 바 "안에".' },
      { prompt: '의자 ___ 고양이가 있어요.', promptTranslated: 'Дар поёни курсӣ гурба ҳаст.', answer: '아래에', options: ['아래에', '위에', '앞에', '옆에'], explanation: 'Поён 조 -아래 대, 바 "아래에".' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Бонк дар паҳлӯи почта аст.', answer: '은행이 우체국 옆에 있어요', options: ['있어요', '우체국', '옆에', '은행이'], explanation: '은행이 우체국 옆에 있어요 дуруст аст.' },
    ],
  },
  {
    lessonTitle: '문법: -(으)로 가다', lessonTitleTranslated: 'Грамматика: Ба тарафи... рафтан',
    title: '장소/방향 + (으)로 가다/오다', titleTranslated: 'Ҷой/Самт + (으)로 가다/오다',
    emoji: '🚶',
    explanation: 'Пасванди 으 -(으)로 유 가다 여 미 서 하 노 서 가 보 바 이. Агар калима бо ҳамсадо 타мом 수 "으로", бо садонок 대 "로" 화.',
    rules: [
      { pattern: 'Садонок / ㄹ + 로 가다', note: '뒤로 가세요. (Ба қафо равед).' },
      { pattern: 'Ҳамсадо + 으로 가다', note: '오른쪽으로 가세요. (Ба тарафи рост равед).' },
    ],
    examples: [
      { sentence: '오른쪽으로 가세요.', translation: 'Ба тарафи рост равед.', highlight: '오른쪽으로' },
      { sentence: '이쪽으로 오세요.', translation: 'Ба ин тараф биёед.', highlight: '이쪽으로' },
      { sentence: '이층으로 올라가요.', translation: 'Ба ошёнаи дуюм боло равед.', highlight: '이층으로' },
      { sentence: '방 안으로 들어가요.', translation: 'Ба даруни ҳуҷра дароед.', highlight: '안으로' },
    ],
    exercises: [
      { prompt: '오른쪽___ 가세요.', promptTranslated: 'Ба тарафи рост равед.', answer: '으로', options: ['으로', '로', '에', '에서'], explanation: '오른쪽 бо ҳамсадо (ㄱ) 타мом 시, 지 으로 소.' },
      { prompt: '뒤___ 가세요.', promptTranslated: 'Ба қафо равед.', answer: '로', options: ['로', '으로', '에', '도'], explanation: '뒤 бо садонок (ㅟ) 타мом 시, 지 로 소.' },
      { prompt: '방 안___ 들어가요.', promptTranslated: 'Ба даруни ҳуҷра медароям.', answer: '으로', options: ['으로', '로', '에', '도'], explanation: '안 бо ҳамсадо (ㄴ) 타мом 시.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Лутфан ба ин тараф биёед.', answer: '이쪽으로 오세요', options: ['오세요', '이쪽으로'], explanation: '이쪽으로 오세요 дуруст аст.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '내 방', titleTranslated: 'Ҳуҷраи ман',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '이곳은 제 방이에요. 방 안에 침대와 책상이 있어요. 책상 위에 컴퓨터와 책이 있어요. 책상 옆에 옷장이 있어요. 옷장 안에 옷이 많아요. 의자 아래에 제 고양이가 있어요.',
    passageTranslated: 'Ин ҳуҷраи ман аст. Дар даруни ҳуҷра кат ва миз ҳаст. Дар болои миз компютер ва китоб ҳаст. Дар паҳлӯи миз ҷевони либос ҳаст. Дар даруни ҷевон либоси зиёд ҳаст. Дар поёни курсӣ гурбаи ман ҳаст.',
    questions: [
      { question: '책상 위에 무엇이 있어요?', questionTranslated: 'Дар болои миз чӣ ҳаст?', answer: '컴퓨터와 책', options: ['컴퓨터와 책', '옷', '고양이', '가방'], explanation: 'Дар матн 책상 위에 컴퓨터와 책이 있어요 навишта шудааст.' },
      { question: '옷장이 어디에 있어요?', questionTranslated: 'Ҷевони либос дар куҷост?', answer: '책상 옆에', options: ['책상 옆에', '침대 위에', '의자 아래에', '방 밖에'], explanation: 'Дар матн 책상 옆에 옷장이 있어요 나вишта шудааст.' },
      { question: '의자 아래에 무엇이 있어요?', questionTranslated: 'Дар поёни курсӣ чӣ ҳаст?', answer: '고양이', options: ['고양이', '옷', '컴퓨터', '가방'], explanation: 'Дар матн 의자 아래에 제 고양이가 있어요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '길 찾기', titleTranslated: 'Ёфтани роҳ',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '수진: 저기요, 우체국이 어디에 있어요? \n민수: 똑바로 가세요. 그리고 약국에서 오른쪽으로 가세요. \n수진: 약국 옆에 우체국이 있어요? \n민수: 네, 약국 옆에 있어요. 은행 앞에 있어요.',
    passageTranslated: 'Суҷин: Мебахшед, почта дар куҷост? \nМинсу: Рост ба пеш равед. Ва аз дорухона ба тарафи рост равед. \nСуҷин: Почта дар паҳлӯи дорухона аст? \nМинсу: Бале, дар паҳлӯи дорухона аст. Дар пеши бонк аст.',
    questions: [
      { question: '수진 씨는 어디를 찾아요?', questionTranslated: 'Суҷин куҷоро меҷӯяд?', answer: '우체국', options: ['우체국', '은행', '약국', '공원'], explanation: 'Дар матн 우체국이 어디에 있어요 나вишта шудааст.' },
      { question: '약국에서 어디로 가요?', questionTranslated: 'Аз дорухона ба кадом тараф меравад?', answer: '오른쪽', options: ['오른쪽', '왼쪽', '뒤', '똑바로'], explanation: 'Дар матн 약국에서 오른쪽으로 가세요 나вишта шудааст.' },
      { question: '우체국은 어디에 있어요?', questionTranslated: 'Почта дар куҷост?', answer: '약국 옆, 은행 앞', options: ['약국 옆, 은행 앞', '약국 앞, 은행 옆', '은행 안', '병원 뒤'], explanation: 'Дар матн 약국 옆에 있어요. 은행 앞에 있어요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '우리 동네', titleTranslated: 'Маҳаллаи мо',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '우리 동네는 아주 좋아요. 집 앞에 공원이 있어요. 저는 매일 공원에 가요. 공원 옆에 편의점과 도서관이 있어요. 버스 정류장은 도서관 앞에 있어요. 지하철 역은 조금 멀어요.',
    passageTranslated: 'Маҳаллаи мо хеле хуб аст. Дар пеши хона парк ҳаст. Ман ҳар рӯз ба парк меравам. Дар паҳлӯи парк мағозаи 24-соата ва китобхона ҳаст. Истгоҳи автобус дар пеши китобхона аст. Истгоҳи метро каме дур аст.',
    questions: [
      { question: '집 앞에 무엇이 있어요?', questionTranslated: 'Дар пеши хона чӣ ҳаст?', answer: '공원', options: ['공원', '도서관', '편의점', '지하철 역'], explanation: 'Дар матн 집 앞에 공원이 있어요 나вишта шудааст.' },
      { question: '편의점은 어디에 있어요?', questionTranslated: 'Мағозаи 24-соата дар куҷост?', answer: '공원 옆', options: ['공원 옆', '도서관 앞', '지하철 역 옆', '집 안'], explanation: 'Дар матн 공원 옆에 편의점과 도서관이 있어요 나вишта шудааст.' },
      { question: '버스 정류장은 어디에 있어요?', questionTranslated: 'Истгоҳи автобус дар куҷост?', answer: '도서관 앞', options: ['도서관 앞', '공원 옆', '집 뒤', '지하철 역 앞'], explanation: 'Дар матн 버스 정류장은 도서관 앞에 있어요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 10 시험', titleTranslated: 'Имтиҳони Модули 10',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '어제 친구와 마트에 갔어요. 마트는 지하철 역 옆에 있어요. 마트 안에는 사람이 아주 많았어요. 우리는 마트에서 과일과 우유를 샀어요. 그리고 마트 밖으로 나왔어요. 마트 앞에 택시가 있어서 택시를 탔어요.',
    passageTranslated: 'Дирӯз бо дӯстам ба супермаркет рафтам. Супермаркет дар паҳлӯи истгоҳи метро аст. Дар даруни супермаркет одамон хеле зиёд буданд. Мо аз супермаркет мева ва шир харидем. Баъд ба беруни супермаркет баромадем. Дар пеши супермаркет таксӣ буд, бинобар ин ба таксӣ савор шудем.',
    questions: [
      { question: '마트는 어디에 있어요?', questionTranslated: 'Супермаркет дар куҷост?', answer: '지하철 역 옆', options: ['지하철 역 옆', '지하철 역 안', '공원 뒤', '버스 정류장 앞'], explanation: 'Дар матн 지하철 역 옆에 있어요 나вишта шудааст.' },
      { question: '마트 안에 사람이 많았어요?', questionTranslated: 'Дар даруни супермаркет одам бисёр буд?', answer: '네, 아주 많았어요.', options: ['네, 아주 많았어요.', '아니요, 없었어요.', '아니요, 별로 없었어요.', '몰라요.'], explanation: 'Дар матн 마트 안에는 사람이 아주 많았어요 나вишта шудааст.' },
      { question: '무엇을 샀어요?', questionTranslated: 'Чӣ хариданд?', answer: '과일과 우유', options: ['과일과 우유', '물과 커피', '옷과 가방', '고기와 생선'], explanation: 'Дар матн 과일과 우유를 샀어요 나вишта шудааст.' },
      { question: '어떻게 집에 갔어요?', questionTranslated: 'Чӣ тавр ба хона рафтанд?', answer: '택시를 탔어요.', options: ['택시를 탔어요.', '지하철을 탔어요.', '버스를 탔어요.', '걸어갔어요.'], explanation: 'Дар матн 마트 앞에 택시가 있어서 택시를 탔어요 나вишта шудааст.' },
    ],
  },
];

export const DIALOGUE = {
    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '길 묻기', titleTranslated: 'Роҳ пурсидан',
    lines: [
      { speaker: '마이클', isUser: true, text: '실례합니다. 서울 병원이 어디에 있어요?', translation: 'Мебахшед. Беморхонаи Сеул дар куҷост?' },
      { speaker: '수진', text: '서울 병원이요? 저기 약국 보이세요?', translation: 'Беморхонаи Сеул? Он ҷо дорухонаро мебинед?' },
      { speaker: '마이클', isUser: true, text: '네, 보여요.', translation: 'Бале, мебинам.' },
      { speaker: '수진', text: '약국에서 오른쪽으로 가세요. 약국 옆에 병원이 있어요.', translation: 'Аз дорухона ба тарафи рост равед. Дар паҳлӯи дорухона беморхона аст.' },
      { speaker: '마이클', isUser: true, text: '아, 네! 감사합니다.', translation: 'Аа, фаҳмо! Ташаккур.' },
      { speaker: '수진', text: '천만에요.', translation: 'Намеарзад.' },
    ],
};

export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['위', '아래', '오른쪽', '왼쪽', '공원', '병원', '지하철', '버스'],
};

export const ORDER = [
  'vocab:위치',
  'vocab:장소 1',
  'vocab:방과 가구',
  'vocab:방향',
  'vocab:방향 동사',
  'vocab:교통',
  'vocab:장소 2',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
