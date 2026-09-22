export const MODULE = {
  order: 8,
  title: '음식과 요리',
  titleTranslated: 'Хӯрок ва Пухтупаз',
  emoji: '🍳',
  canDoStatement: 'Шумо метавонед дар тарабхона хӯрок фармоиш диҳед, таъми онро тасвир кунед ва дар бораи таомҳои кореягӣ гап занед.',
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
  '사과를', '커피를', '빵을', '우유를', '옷을', '책을', '물을',
  '사요', '팔아요', '비싸요', '싸요',
  '사과', '수박', '물', '커피', '우유', '빵', '밥', '국', '반찬', '고기', '생선', '야채', '과일', '계란',
  '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
  '개', '명', '잔', '병', '인분',
  '있어요', '없어요', '한', '두', '세', '네',
  '저는', '씨', '이에요', '예요', '해요', '했어요', '하세요',
  '같이', '때문에', '매일', '항상', '가끔', '자주', '보통', '오늘', '어제', '내일',
  '먹어요', '마셔요', '봐요', '가요', '와요', '해요',
  '먹을래요', '마실래요', '갈래요', '할래요', '안', '못',
  '음식을', '요리를', '비빔밥을', '김치를', '고기를', '맛이',
  '배가', '목이', '짜서', '매워서', '맛있어서', '배불러서', '어요', '아요', '친구와', '갔어요', '많았어요', '불고기를', '주문했어요', '매운', '좋아해서', '김치찌개를', '달고', '맛있었어요', '매웠어요', '디저트는', '먹었어요', '무엇을', '싸서', '달아서', '고파서', '맛없어서', '씨는요', '시원한', '냉면을', '몰라요', '엄마가', '부엌에서', '저녁을', '돼지고기와', '양파를', '썰고', '마늘을', '넣어서', '냄새가', '누가', '엄마', '아빠', '소고기와', '닭고기와', '생선과', '불러요', '목말라요', '아파요', '메뉴를', '줬어요', '떡볶이를', '마셨어요', '달았어요', '짰어요', '셨어요', '주문할게요', '드릴까요', '맵게', '해주세요', '마실', '것은', '알겠습니다', '조금만', '기다려', '아침을', '점심에', '식당에', '종업원을', '식당을', '과일이', '사과가', '포크로', '물을', '고기를', '밥을', '파를', '닭고기를', '파가', '소금을', '간식을', '시켰어요', '여름에', '점심으로', '김밥을', '음식이', '밥그릇', '깨졌어요', '넣어요', '바빠서', '채식주의자', '좀', '불러서', '더', '볼래요', '을래요', 'ㄹ래요', '마시ㄹ래요', '가ㄹ래요', '디저트를', '디저트', '비빔밥이', '물컵을'
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
    title: '식사', titleTranslated: 'Хӯрок (Вақти хӯрок)', emoji: '🍽️',
    words: [
      { word: '식사', translation: 'хӯрок (наҳорӣ/нисфирӯзӣ/шом)', emoji: '🍽️', pos: 'noun', ipa: '/ɕik.s͈a/', example: '식사 하세요.', exampleTrans: 'Хӯрок хӯред.' },
      { word: '아침', translation: 'наҳорӣ / пагоҳӣ', emoji: '🌅', pos: 'noun', ipa: '/a.tɕʰim/', example: '아침을 먹어요.', exampleTrans: 'Наҳорӣ мехӯрам.' },
      { word: '점심', translation: 'хӯроки нисфирӯзӣ', emoji: '☀️', pos: 'noun', ipa: '/tɕʌm.ɕim/', example: '점심에 만나요.', exampleTrans: 'Нисфирӯзӣ вомехӯрем.' },
      { word: '저녁', translation: 'хӯроки шом / бегоҳ', emoji: '🌙', pos: 'noun', ipa: '/tɕʌ.njʌk/', example: '저녁을 요리해요.', exampleTrans: 'Хӯроки шом мепазам.' },
      { word: '간식', translation: 'газак (перекус)', emoji: '🍪', pos: 'noun', ipa: '/kan.ɕik/', example: '간식을 먹어요.', exampleTrans: 'Газак мехӯрам.' },
      { word: '배고파요', translation: 'гурусна будан', emoji: '🤤', pos: 'adj', ipa: '/pɛ.ɡo.pʰa.jo/', example: '너무 배고파요.', exampleTrans: 'Хеле гуруснаам.', highlight: '배고파요' },
      { word: '배불러요', translation: 'сер будан', emoji: '😋', pos: 'adj', ipa: '/pɛ.bul.lʌ.jo/', example: '정말 배불러요.', exampleTrans: 'Воқеан сер ҳастам.', highlight: '배불러요' },
    ],
  },
  {
    title: '한국 음식', titleTranslated: 'Хӯрокҳои кореягӣ', emoji: '🥘',
    words: [
      { word: '불고기', translation: 'пулгоги (гӯшти гови бирён)', emoji: '🥩', pos: 'noun', ipa: '/pul.ɡo.ɡi/', example: '불고기가 맛있어요.', exampleTrans: 'Пулгоги бомазза аст.' },
      { word: '비빔밥', translation: 'пибимпап (биринҷ бо сабзавот)', emoji: '🍚', pos: 'noun', ipa: '/pi.bim.p͈ap/', example: '비빔밥을 먹을래요?', exampleTrans: 'Пибимпап мехӯред?' },
      { word: '김치', translation: 'кимчӣ', emoji: '🥬', pos: 'noun', ipa: '/kim.tɕʰi/', example: '김치는 매워요.', exampleTrans: 'Кимчӣ тунд аст.' },
      { word: '김치찌개', translation: 'шӯрбои кимчӣ', emoji: '🍲', pos: 'noun', ipa: '/kim.tɕʰi.t͈ɕi.ɡɛ/', example: '김치찌개를 시켰어요.', exampleTrans: 'Шӯрбои кимчӣ фармоиш додам.' },
      { word: '냉면', translation: 'угроҳои хунук (ненгмён)', emoji: '🍜', pos: 'noun', ipa: '/nɛŋ.mjʌn/', example: '여름에 냉면을 먹어요.', exampleTrans: 'Дар тобистон ненгмён мехӯрем.' },
      { word: '떡볶이', translation: 'токпоки (хӯроки тунд)', emoji: '🌶️', pos: 'noun', ipa: '/t͈ʌk.p͈o.k͈i/', example: '떡볶이를 좋아해요.', exampleTrans: 'Токпокиро дӯст медорам.' },
      { word: '김밥', translation: 'кимпап (ролли кореягӣ)', emoji: '🍣', pos: 'noun', ipa: '/kim.p͈ap/', example: '점심으로 김밥을 먹어요.', exampleTrans: 'Барои нисфирӯзӣ кимпап мехӯрам.' },
    ],
  },
  {
    title: '식당', titleTranslated: 'Тарабхона', emoji: '🏪',
    words: [
      { word: '식당', translation: 'ошхона / тарабхона', emoji: '🍽️', pos: 'noun', ipa: '/ɕik.t͈aŋ/', example: '식당에 가요.', exampleTrans: 'Ба тарабхона меравем.' },
      { word: '메뉴', translation: 'меню (феҳристи хӯрок)', emoji: '📋', pos: 'noun', ipa: '/me.nju/', example: '메뉴 주세요.', exampleTrans: 'Менюро диҳед.' },
      { word: '주문해요', translation: 'фармоиш додан', emoji: '🛎️', pos: 'verb', ipa: '/tɕu.mun.hɛ.jo/', example: '음식을 주문해요.', exampleTrans: 'Хӯрок фармоиш медиҳам.', highlight: '주문해요' },
      { word: '종업원', translation: 'пешхизмат', emoji: '💁', pos: 'noun', ipa: '/tɕoŋ.ʌ.bwʌn/', example: '종업원을 불러요.', exampleTrans: 'Пешхизматро ҷеғ мезанам.' },
      { word: '손님', translation: 'мизоҷ / меҳмон', emoji: '👤', pos: 'noun', ipa: '/son.nim/', example: '손님이 많아요.', exampleTrans: 'Мизоҷ бисёр аст.' },
      { word: '자리', translation: 'ҷой', emoji: '🪑', pos: 'noun', ipa: '/tɕa.ɾi/', example: '자리가 없어요.', exampleTrans: 'Ҷой нест.' },
      { word: '예약해요', translation: 'ҷойбандӣ (брон) кардан', emoji: '📅', pos: 'verb', ipa: '/je.ja.kʰɛ.jo/', example: '식당을 예약해요.', exampleTrans: 'Тарабхонаро брон мекунам.', highlight: '예약해요' },
    ],
  },
  {
    title: '맛', titleTranslated: 'Таъм / Маза', emoji: '👅',
    words: [
      { word: '매워요', translation: 'тунд / тез', emoji: '🌶️', pos: 'adj', ipa: '/mɛ.wʌ.jo/', example: '김치가 매워요.', exampleTrans: 'Кимчӣ тунд аст.', highlight: '매워요' },
      { word: '달아요', translation: 'ширин', emoji: '🍬', pos: 'adj', ipa: '/ta.ɾa.jo/', example: '과일이 달아요.', exampleTrans: 'Мева ширин аст.', highlight: '달아요' },
      { word: '짜요', translation: 'шӯр', emoji: '🧂', pos: 'adj', ipa: '/t͈ɕa.jo/', example: '국이 너무 짜요.', exampleTrans: 'Шӯрбо хеле шӯр аст.', highlight: '짜요' },
      { word: '셔요', translation: 'туруш', emoji: '🍋', pos: 'adj', ipa: '/ɕjʌ.jo/', example: '사과가 셔요.', exampleTrans: 'Себ туруш аст.', highlight: '셔요' },
      { word: '써요', translation: 'талх', emoji: '☕', pos: 'adj', ipa: '/s͈ʌ.jo/', example: '커피가 써요.', exampleTrans: 'Қаҳва талх аст.', highlight: '써요' },
      { word: '싱거워요', translation: 'бемаза / камнамак', emoji: '💧', pos: 'adj', ipa: '/ɕiŋ.ɡʌ.wʌ.jo/', example: '음식이 싱거워요.', exampleTrans: 'Хӯрок бемаза аст.', highlight: '싱거워요' },
      { word: '뜨거워요', translation: 'гарм / сӯзон', emoji: '🔥', pos: 'adj', ipa: '/t͈ɯ.ɡʌ.wʌ.jo/', example: '국이 뜨거워요.', exampleTrans: 'Шӯрбо сӯзон аст.', highlight: '뜨거워요' },
    ],
  },
  {
    title: '식기', titleTranslated: 'Асбоби хӯрокхӯрӣ', emoji: '🍴',
    words: [
      { word: '숟가락', translation: 'қошуқ', emoji: '🥄', pos: 'noun', ipa: '/sut.k͈a.ɾak/', example: '숟가락 주세요.', exampleTrans: 'Қошуқро диҳед.' },
      { word: '젓가락', translation: 'чӯбчаҳо (палочки)', emoji: '🥢', pos: 'noun', ipa: '/tɕʌt.k͈a.ɾak/', example: '젓가락이 없어요.', exampleTrans: 'Чӯбчаҳо нест.' },
      { word: '수저', translation: 'қошуқ ва чӯбчаҳо', emoji: '🍽️', pos: 'noun', ipa: '/su.dʑʌ/', example: '수저 여기 있어요.', exampleTrans: 'Қошуқу чӯбчаҳо ин ҷост.' },
      { word: '그릇', translation: 'коса', emoji: '🥣', pos: 'noun', ipa: '/kɯ.ɾɯt/', example: '밥그릇 주세요.', exampleTrans: 'Косаи биринҷро диҳед.' },
      { word: '접시', translation: 'табақ', emoji: '🍽️', pos: 'noun', ipa: '/tɕʌp.ɕi/', example: '접시가 깨졌어요.', exampleTrans: 'Табақ шикаст.' },
      { word: '물컵', translation: 'истакони об', emoji: '🥤', pos: 'noun', ipa: '/mul.kʰʌp/', example: '물컵을 주세요.', exampleTrans: 'Истакони обро диҳед.' },
      { word: '포크', translation: 'чангол (вилка)', emoji: '🍴', pos: 'noun', ipa: '/pʰo.kʰɯ/', example: '포크로 먹어요.', exampleTrans: 'Бо чангол мехӯрам.' },
    ],
  },
  {
    title: '요리 동사', titleTranslated: 'Феълҳои пухтупаз', emoji: '👨‍🍳',
    words: [
      { word: '요리해요', translation: 'пухтан / хӯрок тайёр кардан', emoji: '🍳', pos: 'verb', ipa: '/jo.ɾi.hɛ.jo/', example: '저녁을 요리해요.', exampleTrans: 'Хӯроки шом мепазам.', highlight: '요리해요' },
      { word: '끓여요', translation: 'ҷӯшондан', emoji: '♨️', pos: 'verb', ipa: '/k͈ɯ.ɾjʌ.jo/', example: '물을 끓여요.', exampleTrans: 'Обро меҷӯшонам.', highlight: '끓여요' },
      { word: '구워요', translation: 'бирён кардан (гӯшт)', emoji: '🔥', pos: 'verb', ipa: '/ku.wʌ.jo/', example: '고기를 구워요.', exampleTrans: 'Гӯштро бирён мекунам.', highlight: '구워요' },
      { word: '볶아요', translation: 'бирён кардан (дар равған)', emoji: '🍳', pos: 'verb', ipa: '/po.k͈a.jo/', example: '밥을 볶아요.', exampleTrans: 'Биринҷро бирён мекунам.', highlight: '볶아요' },
      { word: '썰어요', translation: 'реза кардан', emoji: '🔪', pos: 'verb', ipa: '/s͈ʌ.ɾʌ.jo/', example: '파를 썰어요.', exampleTrans: 'Пиёзро реза мекунам.', highlight: '썰어요' },
      { word: '섞어요', translation: 'омехта кардан', emoji: '🥣', pos: 'verb', ipa: '/sʌ.k͈ʌ.jo/', example: '비빔밥을 섞어요.', exampleTrans: 'Пибимпапро омехта мекунам.', highlight: '섞어요' },
      { word: '만들어요', translation: 'сохтан / омода кардан', emoji: '🛠️', pos: 'verb', ipa: '/man.dɯ.ɾʌ.jo/', example: '빵을 만들어요.', exampleTrans: 'Нон мепазам.', highlight: '만들어요' },
    ],
  },
  {
    title: '식재료', titleTranslated: 'Масолеҳ (Компонентҳо)', emoji: '🥦',
    words: [
      { word: '소고기', translation: 'гӯшти гов', emoji: '🥩', pos: 'noun', ipa: '/so.ɡo.ɡi/', example: '소고기 비싸요.', exampleTrans: 'Гӯшти гов қиммат аст.' },
      { word: '돼지고기', translation: 'гӯшти хук', emoji: '🥓', pos: 'noun', ipa: '/twɛ.dʑi.ɡo.ɡi/', example: '돼지고기 맛있어요.', exampleTrans: 'Гӯшти хук бомазза аст.' },
      { word: '닭고기', translation: 'гӯшти мурғ', emoji: '🍗', pos: 'noun', ipa: '/tal.k͈o.ɡi/', example: '닭고기를 요리해요.', exampleTrans: 'Гӯшти мурғ мепазам.' },
      { word: '양파', translation: 'пиёзи сар', emoji: '🧅', pos: 'noun', ipa: '/jaŋ.pʰa/', example: '양파를 썰어요.', exampleTrans: 'Пиёзро реза мекунам.' },
      { word: '마늘', translation: 'сирпиёз', emoji: '🧄', pos: 'noun', ipa: '/ma.nɯl/', example: '마늘을 넣어요.', exampleTrans: 'Сирпиёз меандозам.' },
      { word: '파', translation: 'пиёзи кабуд', emoji: '🌱', pos: 'noun', ipa: '/pʰa/', example: '파가 매워요.', exampleTrans: 'Пиёзи кабуд тунд аст.' },
      { word: '소금', translation: 'намак', emoji: '🧂', pos: 'noun', ipa: '/so.ɡɯm/', example: '소금을 주세요.', exampleTrans: 'Намакро диҳед.' },
    ],
  },
];


export const GRAMMAR = [
  {
    lessonTitle: '문법: 안 / 못', lessonTitleTranslated: 'Грамматика: 안 / 못 (Инкор)',
    title: '안 / 못 + 동사', titleTranslated: '안 / 못 + Феъл',
    emoji: '🚫',
    explanation: 'Барои сохтани ҷумлаи инкорӣ 모 안 (на-) ё 모 못 (наметавонам) пеш аз феъл гузошта мешавад. 모 안 барои хоҳиш надоштан (намекунам) ва 모 못 барои натавонистан истифода мешавад.',
    rules: [
      { pattern: '안 + Феъл', note: '안 먹어요 (намехӯрам - чунки намехоҳам).' },
      { pattern: '못 + Феъл', note: '못 먹어요 (намехӯрам - чунки аллергия дорам ё наметавонам).' },
    ],
    examples: [
      { sentence: '고기를 안 먹어요.', translation: 'Гӯштро намехӯрам.', highlight: '안 먹어요' },
      { sentence: '매운 음식을 못 먹어요.', translation: 'Хӯроки тундро хӯрда наметавонам.', highlight: '못 먹어요' },
      { sentence: '오늘 학교에 안 가요.', translation: 'Имрӯз ба мактаб намеравам.', highlight: '안 가요' },
      { sentence: '너무 바빠서 못 가요.', translation: 'Хеле банд ҳастам, бинобар ин рафта наметавонам.', highlight: '못 가요' },
    ],
    exercises: [
      { prompt: '저는 채식주의자(гиёҳхӯр)예요. 고기를 ___ 먹어요.', promptTranslated: 'Ман гиёҳхӯрам. Гӯшт намехӯрам.', answer: '안', options: ['안', '못', '잘', '다'], explanation: 'Агар хоҳиши шахсӣ бошад, 안 истифода мешавад.' },
      { prompt: '매운 음식을 ___ 먹어요. 배가 아파요.', promptTranslated: 'Хӯроки тундро хӯрда наметавонам. Шикамам дард мекунад.', answer: '못', options: ['못', '안', '좀', '도'], explanation: 'Агар қобилият набошад, 못 истифода мешавад.' },
      { prompt: '배가 불러서 더 ___ 먹어요.', promptTranslated: 'Серам, аз ин рӯ дигар хӯрда наметавонам.', answer: '못', options: ['못', '안', '잘', '안요'], explanation: 'Барои натавонистан 단어 못 истифода мешавад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Ман гӯштро намехӯрам.', answer: '저는 고기를 안 먹어요.', options: ['먹어요', '안', '고기를', '저는'], explanation: '저는 고기를 안 먹어요 дуруст аст.' },
    ],
  },
  {
    lessonTitle: '문법: -(으)ㄹ래요', lessonTitleTranslated: 'Грамматика: Мехоҳед...?',
    title: '동사 + (으)ㄹ래요', titleTranslated: 'Феъл + (으)ㄹ래요',
    emoji: '🤔',
    explanation: 'Пасванди -(으)ㄹ래요 барои пешниҳод кардан ё пурсидани хоҳиши касе ("Мехоҳед...?") истифода мешавад. Агар решаи феъл бо ҳамсадо тамом шавад, -을래요 ва агар бо садонок, -ㄹ래요 меояд.',
    rules: [
      { pattern: 'Садонок + ㄹ래요', note: '가다 -> 갈래요? (Мехоҳед равед?)' },
      { pattern: 'Ҳамсадо + 을래요', note: '먹다 -> 먹을래요? (Мехоҳед хӯред?)' },
    ],
    examples: [
      { sentence: '비빔밥 먹을래요?', translation: 'Пибимпап мехӯред?', highlight: '먹을래요' },
      { sentence: '커피 마실래요?', translation: 'Қаҳва менӯшед?', highlight: '마실래요' },
      { sentence: '같이 영화 볼래요?', translation: 'Якҷо филм мебинем?', highlight: '볼래요' },
      { sentence: '저는 냉면 먹을래요.', translation: 'Ман ненгмён мехӯрам.', highlight: '먹을래요' },
    ],
    exercises: [
      { prompt: '뭐 먹___?', promptTranslated: 'Чӣ хӯрдан мехоҳед?', answer: '을래요', options: ['을래요', 'ㄹ래요', '아요', '어요'], explanation: 'Решаи 먹 бо ҳамсадо 타мом мешавад, 전 을래요 가 대.' },
      { prompt: '커피 마시___?', promptTranslated: 'Қаҳва нӯшидан мехоҳед?', answer: 'ㄹ래요', options: ['ㄹ래요', '을래요', '아요', '어요'], explanation: 'Решаи 마시 бо садонок 타мом мешавад, 전 ㄹ래요 가 대.' },
      { prompt: '같이 집에 가___?', promptTranslated: 'Якҷо ба хона рафтан мехоҳед?', answer: 'ㄹ래요', options: ['ㄹ래요', '을래요', '어요', '아요'], explanation: 'Решаи 가 бо садонок 타мом мешавад.' },
      { type: 'reorder', prompt: 'Ҷумлаи дурустро тартиб диҳед:', promptTranslated: 'Пибимпап мехӯред?', answer: '비빔밥 먹을래요?', options: ['먹을래요', '비빔밥'], explanation: '비빔밥 먹을래요 дуруст аст.' },
    ],
  },
];


export const COMPREHENSIONS = [
  {
    lessonTitle: '읽기', lessonTitleTranslated: 'Хониш',
    title: '한국 식당에서', titleTranslated: 'Дар тарабхонаи кореягӣ',
    slot: 'reading', skillType: 'reading', kind: 'reading',
    passage: '저는 오늘 친구와 같이 한국 식당에 갔어요. 식당에 손님이 많았어요. 저는 불고기를 주문했어요. 친구는 매운 음식을 좋아해서 김치찌개를 주문했어요. 불고기는 달고 아주 맛있었어요. 김치찌개는 조금 매웠어요. 우리는 배불러서 디저트는 안 먹었어요.',
    passageTranslated: 'Ман имрӯз бо дӯстам ба тарабхонаи кореягӣ рафтам. Дар тарабхона мизоҷон бисёр буданд. Ман пулгоги фармоиш додам. Дӯстам хӯроки тундро дӯст медорад, барои ҳамин шӯрбои кимчӣ фармоиш дод. Пулгоги ширин ва хеле бомазза буд. Шӯрбои кимчӣ каме тунд буд. Мо сер шудем, барои ҳамин ширинӣ нахӯрдем.',
    questions: [
      { question: '저는 무엇을 주문했어요?', questionTranslated: 'Ман чӣ фармоиш додам?', answer: '불고기', options: ['불고기', '김치찌개', '비빔밥', '냉면'], explanation: 'Дар матн 저는 불고기를 주문했어요 навишта шудааст.' },
      { question: '친구는 왜 김치찌개를 주문했어요?', questionTranslated: 'Чаро дӯстам шӯрбои кимчӣ фармоиш дод?', answer: '매운 음식을 좋아해서', options: ['매운 음식을 좋아해서', '싸서', '달아서', '배가 고파서'], explanation: 'Дар матн 매운 음식을 좋아해서 김치찌개를 주문했어요 навишта шудааст.' },
      { question: '디저트를 먹었어요?', questionTranslated: 'Ширинӣ хӯрданд?', answer: '아니요, 배불러서 안 먹었어요.', options: ['아니요, 배불러서 안 먹었어요.', '네, 먹었어요.', '아니요, 맛없어서 안 먹었어요.', '네, 아주 많이 먹었어요.'], explanation: 'Дар матн 배불러서 디저트는 안 먹었어요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '듣기', lessonTitleTranslated: 'Шунидорӣ',
    title: '메뉴 정하기', titleTranslated: 'Интихоби меню',
    slot: 'listening', skillType: 'listening', kind: 'listening',
    passage: '수진 씨, 점심에 뭐 먹을래요? 저는 고기를 안 먹어요. 그래서 비빔밥을 먹을래요. 민수 씨는요? 저는 시원한 냉면을 먹을래요.',
    passageTranslated: 'Суҷин, нисфирӯзӣ чӣ мехӯред? Ман гӯшт намехӯрам. Барои ҳамин пибимпап мехӯрам. Шумо чӣ, Минсу? Ман ненгмёни хунук мехӯрам.',
    questions: [
      { question: '수진 씨는 고기를 먹어요?', questionTranslated: 'Суҷин гӯшт мехӯрад?', answer: '아니요, 안 먹어요.', options: ['아니요, 안 먹어요.', '네, 매일 먹어요.', '네, 좋아해요.', '몰라요.'], explanation: 'Дар матн 고기를 안 먹어요 나вишта шудааст.' },
      { question: '수진 씨는 무엇을 먹을래요?', questionTranslated: 'Суҷин чӣ хӯрдан мехоҳад?', answer: '비빔밥', options: ['비빔밥', '냉면', '불고기', '김밥'], explanation: 'Дар матн 비빔밥을 먹을래요 навишта шудааст.' },
      { question: '민수 씨는 무엇을 먹을래요?', questionTranslated: 'Минсу чӣ хӯрдан мехоҳад?', answer: '냉면', options: ['냉면', '비빔밥', '불고기', '김치찌개'], explanation: 'Дар матн 시원한 냉면을 먹을래요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '복습', lessonTitleTranslated: 'Такрор',
    title: '복습 퀴즈', titleTranslated: 'Викторинаи такрорӣ',
    slot: 'review', skillType: 'review', kind: 'reading',
    passage: '엄마가 부엌에서 저녁을 요리해요. 돼지고기와 양파를 썰고, 마늘을 넣어서 볶아요. 냄새가 아주 좋아요. 저는 너무 배고파요.',
    passageTranslated: 'Модарам дар ошхона хӯроки шом мепазад. Гӯшти хук ва пиёзро реза карда, сирпиёз меандозад ва бирён мекунад. Бӯяш хеле хуб аст. Ман хеле гуруснаам.',
    questions: [
      { question: '누가 요리해요?', questionTranslated: 'Кӣ хӯрок мепазад?', answer: '엄마', options: ['엄마', '아빠', '동생', '언니'], explanation: 'Дар матн 엄마가 나вишта шудааст.' },
      { question: '무엇을 썰어요?', questionTranslated: 'Чиро реза мекунад?', answer: '돼지고기와 양파', options: ['돼지고기와 양파', '소고기와 파', '닭고기와 마늘', '생선과 소금'], explanation: 'Дар матн 돼지고기와 양파를 썰고 나вишта шудааст.' },
      { question: '배가 불러요?', questionTranslated: 'Сер аст?', answer: '아니요, 배고파요.', options: ['아니요, 배고파요.', '네, 배불러요.', '아니요, 목말라요.', '아니요, 아파요.'], explanation: 'Дар матн 너무 배고파요 나вишта шудааст.' },
    ],
  },
  {
    lessonTitle: '시험', lessonTitleTranslated: 'Имтиҳон',
    title: '모듈 9 시험', titleTranslated: 'Имтиҳони Модули 9',
    slot: 'test', skillType: 'test', kind: 'reading',
    passage: '어제 저녁에 식당에 갔어요. 종업원이 메뉴를 줬어요. 저는 떡볶이를 주문했어요. 떡볶이는 아주 매웠어요. 그래서 물을 많이 마셨어요. 너무 매워서 다 못 먹었어요.',
    passageTranslated: 'Шаби гузашта ба тарабхона рафтам. Пешхизмат меню дод. Ман токпоки фармоиш додам. Токпоки хеле тунд буд. Барои ҳамин оби зиёд нӯшидам. Аз сабаби хеле тунд буданаш, ҳамаашро хӯрда натавонистам.',
    questions: [
      { question: '어디에 갔어요?', questionTranslated: 'Ба куҷо рафт?', answer: '식당', options: ['식당', '시장', '백화점', '학교'], explanation: 'Дар матн 식당에 갔어요 навишта шудааст.' },
      { question: '누가 메뉴를 줬어요?', questionTranslated: 'Кӣ меню дод?', answer: '종업원', options: ['종업원', '손님', '친구', '선생님'], explanation: 'Дар матн 종업원이 메뉴를 줬어요 나вишта шудааст.' },
      { question: '떡볶이가 달았어요?', questionTranslated: 'Токпоки ширин буд?', answer: '아니요, 매웠어요.', options: ['아니요, 매웠어요.', '네, 달았어요.', '아니요, 짰어요.', '네, 셨어요.'], explanation: 'Дар матн 아주 매웠어요 나вишта шудааст.' },
      { question: '떡볶이를 다 먹었어요?', questionTranslated: 'Токпокиро пурра хӯрд?', answer: '아니요, 못 먹었어요.', options: ['아니요, 못 먹었어요.', '네, 다 먹었어요.', '아니요, 안 먹었어요.', '몰라요.'], explanation: 'Дар матн 너무 매워서 다 못 먹었어요 나вишта шудааст.' },
    ],
  },
];

export const DIALOGUE = {
    lessonTitle: '말하기', lessonTitleTranslated: 'Гуфтугӯ',
    title: '식당에서 주문하기', titleTranslated: 'Фармоиш дар тарабхона',
    lines: [
      { speaker: '수진', isUser: true, text: '저기요, 주문할게요.', translation: 'Мебахшед, ман фармоиш медиҳам.' },
      { speaker: '종업원', text: '네, 손님. 뭐 드릴까요?', translation: 'Бале, мизоҷ. Чӣ биёрам?' },
      { speaker: '수진', isUser: true, text: '비빔밥 하나 주세요. 안 맵게 해주세요.', translation: 'Як пибимпап диҳед. Илтимос бе тундӣ (на тез) омода кунед.' },
      { speaker: '종업원', text: '네, 비빔밥 하나요. 마실 것은 뭐 드릴까요?', translation: 'Бале, як пибимпап. Барои нӯшидан чӣ биёрам?' },
      { speaker: '수진', isUser: true, text: '시원한 물 한 잔 주세요. 감사합니다.', translation: 'Як пиёла оби хунук диҳед. Ташаккур.' },
      { speaker: '종업원', text: '알겠습니다. 조금만 기다려 주세요.', translation: 'Фаҳмо. Илтимос каме интизор шавед.' },
    ],
};


export const WRITING = {
  lessonTitle: '단어 쓰기', lessonTitleTranslated: 'Навиштани калимаҳо',
  title: '단어 쓰기', titleTranslated: 'Навиштани калимаҳо',
  emoji: '✍️',
  copyOf: ['아침', '식당', '주문해요', '배고파요', '요리해요', '매워요', '달아요', '소고기'],
};

export const ORDER = [
  'vocab:식사',
  'vocab:한국 음식',
  'vocab:식당',
  'vocab:맛',
  'vocab:식기',
  'vocab:요리 동사',
  'vocab:식재료',
  'grammar:0',
  'grammar:1',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
