// B1 vocabulary, batch 2: top up the thin lessons from batch 1, then add two
// new lessons to modules 7–12.
//
// Batch 1 planned 144 words and inserted 106 — the duplicate guard rejected 38
// because B1 already taught them under a different lesson title (M6 in
// particular already had privacy, virus, firewall, log in/out and more). That
// left some lessons with as few as four words, which reads as unfinished, so
// they are topped back up to twelve here with words checked against the full
// 585-word list.

const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const BASE = 'https://admin.ramz.tj/api/admin';
const B1 = 'cmrjtyqkb0001nzwfu2pobutk';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method, headers: { 'Content-Type': 'application/json', 'x-admin-api-key': KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(d)}`);
  return d;
}
const W = (word, translation, example, exampleTrans, ipa, partOfSpeech, emoji) =>
  ({ word, translation, example, exampleTrans, ipa, partOfSpeech, emoji });

// ── words appended to lessons created in batch 1 ──
const TOPUPS = [
  { lessonId: 'cmsdmko93001kbaerpu4smzut', label: 'M2 Skills and Qualities', words: [
    W('Hardworking', 'Меҳнатдӯст', 'She is a hardworking student.', 'Ӯ донишҷӯи меҳнатдӯст аст.', '/ˌhɑːdˈwɜːkɪŋ/', 'adjective', '💪'),
    W('Honest', 'Ростқавл', 'An honest employee is valuable.', 'Корманди ростқавл қиматбаҳо аст.', '/ˈɒnɪst/', 'adjective', '🤍'),
    W('Responsible', 'Масъулиятшинос', 'He is responsible for the budget.', 'Ӯ барои буҷа масъул аст.', '/rɪˈspɒnsəbl/', 'adjective', '📌'),
  ]},
  { lessonId: 'cmsdmkx3j0030baer8jvt2wam', label: 'M4 Protecting Nature', words: [
    W('Compost', 'Компост', 'We make compost from food waste.', 'Мо аз партови хӯрок компост месозем.', '/ˈkɒmpɒst/', 'noun', '🌿'),
    W('Deforestation', 'Буридани ҷангал', 'Deforestation destroys animal habitats.', 'Буридани ҷангал макони ҳайвонотро нобуд мекунад.', '/ˌdiːˌfɒrɪˈsteɪʃn/', 'noun', '🪓'),
    W('Erosion', 'Фарсоиши хок', 'Erosion washes away the soil.', 'Фарсоиш хокро мешӯяд.', '/ɪˈrəʊʒn/', 'noun', '🏔'),
    W('Ecosystem', 'Экосистема', 'The ecosystem is very fragile.', 'Экосистема хеле нозук аст.', '/ˈiːkəʊsɪstəm/', 'noun', '🌎'),
    W('Fragile', 'Нозук', 'Coral reefs are fragile.', 'Марҷонҳо нозуканд.', '/ˈfrædʒaɪl/', 'adjective', '🪸'),
  ]},
  { lessonId: 'cmsdmkzdw003abaerl2ya2z9x', label: 'M5 The Body and Fitness', words: [
    W('Pulse', 'Набз', 'The nurse checked my pulse.', 'Ҳамшира набзи маро санҷид.', '/pʌls/', 'noun', '💗'),
    W('Sweat', 'Арақ кардан', 'You sweat a lot when you run.', 'Ҳангоми давидан бисёр арақ мекунед.', '/swet/', 'verb', '💦'),
    W('Jog', 'Оҳиста давидан', 'I jog in the park every morning.', 'Ман ҳар субҳ дар боғ оҳиста медавам.', '/dʒɒɡ/', 'verb', '🏃'),
    W('Gym', 'Толори варзишӣ', 'He goes to the gym after work.', 'Ӯ баъди кор ба толори варзишӣ меравад.', '/dʒɪm/', 'noun', '🏋️'),
  ]},
  { lessonId: 'cmsdml1e4003lbaerplmbob68', label: 'M5 Mental Health', words: [
    W('Panic', 'Ваҳм кардан', 'Try not to panic in an emergency.', 'Дар ҳолати фавқулодда кӯшиш кунед ваҳм накунед.', '/ˈpænɪk/', 'verb', '😱'),
    W('Depressed', 'Афсурда', 'He felt depressed after the news.', 'Ӯ баъди хабар худро афсурда ҳис кард.', '/dɪˈprest/', 'adjective', '🌧'),
    W('Therapy', 'Терапия', 'Therapy helped her a great deal.', 'Терапия ба ӯ хеле кӯмак кард.', '/ˈθerəpi/', 'noun', '🛋'),
    W('Grateful', 'Миннатдор', 'Be grateful for small things.', 'Барои чизҳои хурд миннатдор бошед.', '/ˈɡreɪtfl/', 'adjective', '🙏'),
  ]},
  { lessonId: 'cmsdml3ex003wbaerf4uh878p', label: 'M6 Using Devices', words: [
    W('Wireless', 'Бесим', 'It is a wireless keyboard.', 'Ин клавиатураи бесим аст.', '/ˈwaɪələs/', 'adjective', '📶'),
    W('Portable', 'Сайёр', 'A portable charger is very useful.', 'Заряддиҳандаи сайёр хеле фоидаовар аст.', '/ˈpɔːtəbl/', 'adjective', '🎒'),
    W('Sync', 'Ҳамоҳанг кардан', 'Sync your files across devices.', 'Файлҳоятонро дар дастгоҳҳо ҳамоҳанг кунед.', '/sɪŋk/', 'verb', '🔁'),
    W('Volume', 'Баландии овоз', 'Turn down the volume, please.', 'Лутфан овозро паст кунед.', '/ˈvɒljuːm/', 'noun', '🔊'),
    W('Brightness', 'Равшанӣ', 'Reduce the screen brightness at night.', 'Шабона равшании экранро кам кунед.', '/ˈbraɪtnəs/', 'noun', '☀️'),
  ]},
  { lessonId: 'cmsdml5bs0046baerfu19qd0l', label: 'M6 Online Life', words: [
    W('Browse', 'Варақ задан', 'I browse the news every morning.', 'Ман ҳар субҳ хабарҳоро варақ мезанам.', '/braʊz/', 'verb', '🖱'),
    W('Bookmark', 'Хатчӯб', 'Bookmark this page for later.', 'Ин саҳифаро барои баъд хатчӯб кунед.', '/ˈbʊkmɑːk/', 'noun', '🔖'),
    W('Pop-up', 'Равзанаи ногаҳонӣ', 'Close the pop-up advert.', 'Равзанаи ногаҳонии рекламаро пӯшед.', '/ˈpɒp ʌp/', 'noun', '🪟'),
    W('Feed', 'Лента (навигариҳо)', 'My feed is full of adverts.', 'Лентаи ман пур аз реклама аст.', '/fiːd/', 'noun', '📜'),
    W('Follower', 'Пайрав', 'She has thousands of followers.', 'Ӯ ҳазорон пайрав дорад.', '/ˈfɒləʊə/', 'noun', '👣'),
    W('Block', 'Манъ кардан', 'You can block that user.', 'Шумо он корбарро манъ карда метавонед.', '/blɒk/', 'verb', '⛔'),
    W('Anonymous', 'Номаълум', 'The comment was anonymous.', 'Шарҳ номаълум буд.', '/əˈnɒnɪməs/', 'adjective', '🕵️'),
    W('Verify', 'Тасдиқ кардан', 'Verify your email address.', 'Суроғаи почтаи худро тасдиқ кунед.', '/ˈverɪfaɪ/', 'verb', '✅'),
  ]},
];

// ── new lessons for modules 7–12 ──
const LESSONS = [
  { mo: 6, title: 'Prices and Value', titleTr: 'Нарх ва арзиш', emoji: '🏷', words: [
    W('Affordable', 'Аз рӯи нарх дастрас', 'The flat is affordable for a family.', 'Ин манзил барои оила аз рӯи нарх дастрас аст.', '/əˈfɔːdəbl/', 'adjective', '👍'),
    W('Overpriced', 'Аз ҳад гарон', 'That restaurant is overpriced.', 'Он тарабхона аз ҳад гарон аст.', '/ˌəʊvəˈpraɪst/', 'adjective', '📈'),
    W('Second-hand', 'Дасти дуюм', 'I bought a second-hand car.', 'Ман мошини дасти дуюм харидам.', '/ˌsekənd ˈhænd/', 'adjective', '🚗'),
    W('Auction', 'Музояда', 'The painting was sold at auction.', 'Расм дар музояда фурӯхта шуд.', '/ˈɔːkʃn/', 'noun', '🔨'),
    W('Instalment', 'Пардохти қисм-қисм', 'You can pay in monthly instalments.', 'Шумо метавонед ҳармоҳа қисм-қисм пардохт кунед.', '/ɪnˈstɔːlmənt/', 'noun', '📆'),
    W('Warranty', 'Кафолатнома', 'The phone has a two-year warranty.', 'Телефон кафолатномаи дусола дорад.', '/ˈwɒrənti/', 'noun', '🛡'),
    W('Haggle', 'Чана задан', 'You can haggle at the market.', 'Дар бозор чана задан мумкин аст.', '/ˈhæɡl/', 'verb', '🤝'),
    W('Retail', 'Савдои чакана', 'She works in retail.', 'Ӯ дар савдои чакана кор мекунад.', '/ˈriːteɪl/', 'noun', '🏬'),
    W('Wholesale', 'Савдои яклухт', 'Wholesale prices are much lower.', 'Нархҳои яклухт хеле пасттаранд.', '/ˈhəʊlseɪl/', 'noun', '📦'),
    W('Currency', 'Асъор', 'Which currency do you accept?', 'Кадом асъорро қабул мекунед?', '/ˈkʌrənsi/', 'noun', '💱'),
    W('Purchase', 'Харид', 'Keep the receipt after your purchase.', 'Баъди харид расидро нигоҳ доред.', '/ˈpɜːtʃəs/', 'noun', '🧾'),
    W('Queue', 'Навбат', 'There was a long queue at the till.', 'Дар назди хазина навбати дароз буд.', '/kjuː/', 'noun', '🚶'),
  ]},
  { mo: 6, title: 'Work and Income', titleTr: 'Кор ва даромад', emoji: '💼', words: [
    W('Pension', 'Нафақа', 'He receives a monthly pension.', 'Ӯ ҳармоҳа нафақа мегирад.', '/ˈpenʃn/', 'noun', '👴'),
    W('Bonus', 'Мукофот', 'All the staff got a bonus.', 'Ҳамаи кормандон мукофот гирифтанд.', '/ˈbəʊnəs/', 'noun', '🎁'),
    W('Overtime', 'Кори изофа', 'She works overtime every week.', 'Ӯ ҳар ҳафта изофа кор мекунад.', '/ˈəʊvətaɪm/', 'noun', '⏰'),
    W('Self-employed', 'Худишғол', 'My brother is self-employed.', 'Бародари ман худишғол аст.', '/ˌself ɪmˈplɔɪd/', 'adjective', '🧑‍💻'),
    W('Invest', 'Сармоягузорӣ кардан', 'They invest in property.', 'Онҳо ба амволи ғайриманқул сармоя мегузоранд.', '/ɪnˈvest/', 'verb', '📊'),
    W('Profit', 'Фоида', 'The company made a large profit.', 'Ширкат фоидаи калон гирифт.', '/ˈprɒfɪt/', 'noun', '📈'),
    W('Loss', 'Зарар', 'The business made a loss last year.', 'Тиҷорат соли гузашта зарар дид.', '/lɒs/', 'noun', '📉'),
    W('Afford', 'Тавонистани харид', 'I cannot afford a new car.', 'Ман мошини нав харида наметавонам.', '/əˈfɔːd/', 'verb', '💸'),
    W('Owe', 'Қарздор будан', 'I owe him some money.', 'Ман ба ӯ каме қарздорам.', '/əʊ/', 'verb', '🧮'),
    W('Lend', 'Қарз додан', 'Can you lend me your pen?', 'Қаламатонро ба ман қарз дода метавонед?', '/lend/', 'verb', '🤲'),
    W('Borrow', 'Қарз гирифтан', 'I borrowed a book from the library.', 'Ман аз китобхона китоб қарз гирифтам.', '/ˈbɒrəʊ/', 'verb', '📚'),
    W('Earn', 'Даромад кардан', 'She earns a good salary.', 'Ӯ маоши хуб мегирад.', '/ɜːn/', 'verb', '💵'),
  ]},

  { mo: 7, title: 'Family and Friends', titleTr: 'Оила ва дӯстон', emoji: '👨‍👩‍👧', words: [
    W('Relative', 'Хеш', 'All our relatives came to the wedding.', 'Ҳамаи хешони мо ба тӯй омаданд.', '/ˈrelətɪv/', 'noun', '👪'),
    W('Sibling', 'Хоҳар ё бародар', 'Do you have any siblings?', 'Хоҳар ё бародар доред?', '/ˈsɪblɪŋ/', 'noun', '🧒'),
    W('Engaged', 'Номзад', 'They got engaged last month.', 'Онҳо моҳи гузашта номзад шуданд.', '/ɪnˈɡeɪdʒd/', 'adjective', '💍'),
    W('Wedding', 'Тӯй', 'The wedding was in the garden.', 'Тӯй дар боғ буд.', '/ˈwedɪŋ/', 'noun', '💒'),
    W('Anniversary', 'Солгард', 'It is their tenth anniversary.', 'Ин солгарди даҳуми онҳост.', '/ˌænɪˈvɜːsəri/', 'noun', '🎉'),
    W('Get on with', 'Хуб муомила кардан', 'I get on well with my neighbours.', 'Ман бо ҳамсоягонам хуб муомила мекунам.', '/ɡet ɒn wɪð/', 'verb', '🤝'),
    W('Fall out', 'Ҷанҷол кардан', 'They fell out over money.', 'Онҳо бар сари пул ҷанҷол карданд.', '/fɔːl aʊt/', 'verb', '⚡'),
    W('Make up', 'Оштӣ шудан', 'They argued but soon made up.', 'Онҳо ҷанҷол карданд, вале зуд оштӣ шуданд.', '/meɪk ʌp/', 'verb', '🕊'),
    W('Close', 'Наздик (муносибат)', 'We are a very close family.', 'Мо оилаи хеле наздикем.', '/kləʊs/', 'adjective', '❤️'),
    W('Company', 'Ҳамнишинӣ', 'I enjoy her company.', 'Ҳамнишинии ӯ ба ман маъқул аст.', '/ˈkʌmpəni/', 'noun', '👫'),
    W('Reunion', 'Вохӯрии дубора', 'We had a family reunion in summer.', 'Мо дар тобистон вохӯрии оилавӣ доштем.', '/riːˈjuːniən/', 'noun', '🎊'),
    W('Bond', 'Робитаи қавӣ', 'There is a strong bond between them.', 'Байни онҳо робитаи қавӣ ҳаст.', '/bɒnd/', 'noun', '🔗'),
  ]},
  { mo: 7, title: 'Describing People', titleTr: 'Тасвири одамон', emoji: '🙂', words: [
    W('Generous', 'Саховатманд', 'He is generous with his time.', 'Ӯ бо вақташ саховатманд аст.', '/ˈdʒenərəs/', 'adjective', '🎁'),
    W('Selfish', 'Худхоҳ', 'Do not be selfish with your toys.', 'Бо бозичаҳоят худхоҳ набош.', '/ˈselfɪʃ/', 'adjective', '🙅'),
    W('Cheerful', 'Хушрӯ', 'She is always cheerful in the morning.', 'Ӯ саҳарҳо ҳамеша хушрӯ аст.', '/ˈtʃɪəfl/', 'adjective', '😄'),
    W('Shy', 'Шармгин', 'He was shy as a child.', 'Ӯ дар кӯдакӣ шармгин буд.', '/ʃaɪ/', 'adjective', '😳'),
    W('Sociable', 'Ҷамъиятпазир', 'My sister is very sociable.', 'Хоҳари ман хеле ҷамъиятпазир аст.', '/ˈsəʊʃəbl/', 'adjective', '🗣'),
    W('Stubborn', 'Якрав', 'He is too stubborn to apologise.', 'Ӯ барои узр хостан хеле якрав аст.', '/ˈstʌbən/', 'adjective', '🐏'),
    W('Sensitive', 'Ҳассос', 'She is sensitive to criticism.', 'Ӯ ба танқид ҳассос аст.', '/ˈsensətɪv/', 'adjective', '🌸'),
    W('Reserved', 'Хомӯштабиат', 'He is reserved with strangers.', 'Ӯ бо бегонагон хомӯштабиат аст.', '/rɪˈzɜːvd/', 'adjective', '🤐'),
    W('Rude', 'Дағал', 'It is rude to interrupt.', 'Гапи касро буридан дағалӣ аст.', '/ruːd/', 'adjective', '😤'),
    W('Polite', 'Боадаб', 'Always be polite to customers.', 'Ҳамеша бо мизоҷон боадаб бошед.', '/pəˈlaɪt/', 'adjective', '🎩'),
    W('Trustworthy', 'Боварибахш', 'A trustworthy friend is rare.', 'Дӯсти боварибахш кам аст.', '/ˈtrʌstwɜːði/', 'adjective', '🔐'),
    W('Modest', 'Хоксор', 'He is modest about his success.', 'Ӯ дар бораи муваффақияташ хоксор аст.', '/ˈmɒdɪst/', 'adjective', '🌾'),
  ]},

  { mo: 8, title: 'Diet and Nutrition', titleTr: 'Парҳез ва ғизо', emoji: '🥗', words: [
    W('Protein', 'Сафеда', 'Fish is a good source of protein.', 'Моҳӣ манбаи хуби сафеда аст.', '/ˈprəʊtiːn/', 'noun', '🍳'),
    W('Vitamin', 'Витамин', 'Oranges are full of vitamin C.', 'Афлесун пур аз витамини С аст.', '/ˈvɪtəmɪn/', 'noun', '💊'),
    W('Fibre', 'Нахи ғизоӣ', 'Vegetables contain a lot of fibre.', 'Сабзавот нахи ғизоии зиёд дорад.', '/ˈfaɪbə/', 'noun', '🥬'),
    W('Calorie', 'Калория', 'This meal has 500 calories.', 'Ин хӯрок 500 калория дорад.', '/ˈkæləri/', 'noun', '🔢'),
    W('Portion', 'Ҳисса', 'Eat smaller portions in the evening.', 'Бегоҳӣ ҳиссаи хурдтар бихӯред.', '/ˈpɔːʃn/', 'noun', '🍽'),
    W('Balanced', 'Мутавозин', 'A balanced diet keeps you healthy.', 'Парҳези мутавозин шуморо солим нигоҳ медорад.', '/ˈbælənst/', 'adjective', '⚖️'),
    W('Processed', 'Коркардшуда', 'Try to avoid processed food.', 'Кӯшиш кунед аз хӯроки коркардшуда дурӣ ҷӯед.', '/ˈprəʊsest/', 'adjective', '🏭'),
    W('Additive', 'Иловаи хӯрокворӣ', 'This drink contains no additives.', 'Ин нӯшокӣ илова надорад.', '/ˈædətɪv/', 'noun', '🧪'),
    W('Allergy', 'Аллергия', 'She has a nut allergy.', 'Ӯ ба чормағз аллергия дорад.', '/ˈælədʒi/', 'noun', '⚠️'),
    W('Digest', 'Ҳазм кардан', 'Fatty food is hard to digest.', 'Хӯроки равғанӣ душвор ҳазм мешавад.', '/daɪˈdʒest/', 'verb', '🌀'),
    W('Appetite', 'Иштиҳо', 'I have no appetite today.', 'Ман имрӯз иштиҳо надорам.', '/ˈæpɪtaɪt/', 'noun', '😋'),
    W('Snack on', 'Газак хӯрдан', 'I snack on fruit between meals.', 'Ман байни хӯрокҳо мева газак мехӯрам.', '/snæk ɒn/', 'verb', '🍏'),
  ]},
  { mo: 8, title: 'In the Kitchen', titleTr: 'Дар ошхона', emoji: '🍳', words: [
    W('Recipe', 'Дастури пухтупаз', 'Follow the recipe carefully.', 'Дастури пухтупазро бодиққат риоя кунед.', '/ˈresəpi/', 'noun', '📖'),
    W('Saucepan', 'Дегча', 'Boil the rice in a saucepan.', 'Биринҷро дар дегча ҷӯшонед.', '/ˈsɔːspən/', 'noun', '🍲'),
    W('Chop', 'Майда кардан', 'Chop the onions finely.', 'Пиёзро майда кунед.', '/tʃɒp/', 'verb', '🔪'),
    W('Peel', 'Пӯст кандан', 'Peel the potatoes first.', 'Аввал картошкаро пӯст кунед.', '/piːl/', 'verb', '🥔'),
    W('Pour', 'Рехтан', 'Pour the milk into the bowl.', 'Ширро ба коса резед.', '/pɔː/', 'verb', '🥛'),
    W('Stir', 'Ҳам задан', 'Stir the soup slowly.', 'Шӯрборо оҳиста ҳам занед.', '/stɜː/', 'verb', '🥄'),
    W('Boil', 'Ҷӯшонидан', 'Boil the water for five minutes.', 'Обро панҷ дақиқа ҷӯшонед.', '/bɔɪl/', 'verb', '♨️'),
    W('Bake', 'Дар танӯр пухтан', 'Bake the bread for an hour.', 'Нонро як соат дар танӯр пазед.', '/beɪk/', 'verb', '🍞'),
    W('Serve', 'Пешниҳод кардан', 'Serve the dish while it is hot.', 'Хӯрокро гарм пешниҳод кунед.', '/sɜːv/', 'verb', '🍽'),
    W('Taste', 'Чашидан', 'Taste the sauce before adding salt.', 'Пеш аз намак андохтан соусро бичашед.', '/teɪst/', 'verb', '👅'),
    W('Oven', 'Танӯр', 'Put the tray in the oven.', 'Тобаро ба танӯр гузоред.', '/ˈʌvn/', 'noun', '🔥'),
    W('Fridge', 'Яхдон', 'Keep the milk in the fridge.', 'Ширро дар яхдон нигоҳ доред.', '/frɪdʒ/', 'noun', '🧊'),
  ]},

  { mo: 9, title: 'Research and Experiments', titleTr: 'Тадқиқот ва таҷриба', emoji: '🔬', words: [
    W('Sample', 'Намуна', 'They tested a sample of water.', 'Онҳо намунаи обро санҷиданд.', '/ˈsɑːmpl/', 'noun', '🧪'),
    W('Data', 'Маълумот', 'The data shows a clear pattern.', 'Маълумот намунаи равшан нишон медиҳад.', '/ˈdeɪtə/', 'noun', '📊'),
    W('Result', 'Натиҷа', 'The results surprised the team.', 'Натиҷаҳо дастаро ба ҳайрат оварданд.', '/rɪˈzʌlt/', 'noun', '📋'),
    W('Accurate', 'Дақиқ', 'The measurement must be accurate.', 'Ченкунӣ бояд дақиқ бошад.', '/ˈækjərət/', 'adjective', '🎯'),
    W('Estimate', 'Тахмин кардан', 'Scientists estimate the age of the rock.', 'Олимон синни сангро тахмин мекунанд.', '/ˈestɪmeɪt/', 'verb', '📐'),
    W('Compare', 'Муқоиса кардан', 'Compare the two results.', 'Ду натиҷаро муқоиса кунед.', '/kəmˈpeə/', 'verb', '⚖️'),
    W('Repeat', 'Такрор кардан', 'Repeat the experiment three times.', 'Таҷрибаро се бор такрор кунед.', '/rɪˈpiːt/', 'verb', '🔁'),
    W('Record', 'Сабт кардан', 'Record every change you observe.', 'Ҳар тағйиротеро, ки мебинед, сабт кунед.', '/rɪˈkɔːd/', 'verb', '📝'),
    W('Assume', 'Фарз кардан', 'Do not assume the answer is correct.', 'Фарз накунед, ки ҷавоб дуруст аст.', '/əˈsjuːm/', 'verb', '🤔'),
    W('Reliable', 'Боэътимод', 'We need reliable evidence.', 'Ба мо далели боэътимод лозим аст.', '/rɪˈlaɪəbl/', 'adjective', '🔒'),
    W('Trial', 'Санҷиш', 'The new drug is in clinical trials.', 'Доруи нав дар санҷиши клиникӣ аст.', '/ˈtraɪəl/', 'noun', '⚗️'),
    W('Funding', 'Маблағгузорӣ', 'The project needs more funding.', 'Лоиҳа ба маблағгузории бештар ниёз дорад.', '/ˈfʌndɪŋ/', 'noun', '💰'),
  ]},
  { mo: 9, title: 'Technology and Innovation', titleTr: 'Технология ва навоварӣ', emoji: '🤖', words: [
    W('Device', 'Дастгоҳ', 'This device measures air quality.', 'Ин дастгоҳ сифати ҳаворо чен мекунад.', '/dɪˈvaɪs/', 'noun', '📟'),
    W('Engine', 'Муҳаррик', 'The engine runs on electricity.', 'Муҳаррик бо барқ кор мекунад.', '/ˈendʒɪn/', 'noun', '⚙️'),
    W('Efficient', 'Босамар', 'Electric cars are more efficient.', 'Мошинҳои барқӣ босамартаранд.', '/ɪˈfɪʃnt/', 'adjective', '⚡'),
    W('Automatic', 'Худкор', 'The doors are automatic.', 'Дарҳо худкоранд.', '/ˌɔːtəˈmætɪk/', 'adjective', '🚪'),
    W('Artificial', 'Сунъӣ', 'Artificial light is not the same as sunlight.', 'Нури сунъӣ мисли нури офтоб нест.', '/ˌɑːtɪˈfɪʃl/', 'adjective', '💡'),
    W('Replace', 'Иваз кардан', 'Machines may replace some jobs.', 'Мошинҳо шояд баъзе корҳоро иваз кунанд.', '/rɪˈpleɪs/', 'verb', '🔄'),
    W('Improve', 'Беҳтар кардан', 'New software improves accuracy.', 'Барномаи нав дақиқиро беҳтар мекунад.', '/ɪmˈpruːv/', 'verb', '📈'),
    W('Design', 'Тарҳрезӣ кардан', 'Engineers design safer bridges.', 'Муҳандисон пулҳои бехатартар тарҳрезӣ мекунанд.', '/dɪˈzaɪn/', 'verb', '📐'),
    W('Sensor', 'Ҳассосак', 'The sensor detects movement.', 'Ҳассосак ҳаракатро мефаҳмад.', '/ˈsensə/', 'noun', '📡'),
    W('Robot', 'Робот', 'Robots build most of the cars.', 'Роботҳо аксари мошинҳоро месозанд.', '/ˈrəʊbɒt/', 'noun', '🤖'),
    W('Prototype', 'Намунаи аввал', 'They built a working prototype.', 'Онҳо намунаи аввали кориро сохтанд.', '/ˈprəʊtətaɪp/', 'noun', '🛠'),
    W('Patent', 'Патент', 'The company filed a patent.', 'Ширкат патент супорид.', '/ˈpætnt/', 'noun', '📜'),
  ]},

  { mo: 10, title: 'Community and Change', titleTr: 'Ҷамоа ва тағйирот', emoji: '🏘', words: [
    W('Volunteer', 'Ихтиёрӣ кор кардан', 'She volunteers at the local school.', 'Ӯ дар мактаби маҳаллӣ ихтиёрӣ кор мекунад.', '/ˌvɒlənˈtɪə/', 'verb', '🙋'),
    W('Charity', 'Хайрия', 'The charity helps homeless people.', 'Хайрия ба бехонумонон кӯмак мекунад.', '/ˈtʃærəti/', 'noun', '❤️'),
    W('Campaign', 'Маърака', 'They started a campaign for clean water.', 'Онҳо маъракаи оби тозаро оғоз карданд.', '/kæmˈpeɪn/', 'noun', '📣'),
    W('Protest', 'Эътироз', 'Thousands joined the protest.', 'Ҳазорон нафар ба эътироз ҳамроҳ шуданд.', '/ˈprəʊtest/', 'noun', '✊'),
    W('Support', 'Дастгирӣ кардан', 'Local people supported the plan.', 'Мардуми маҳаллӣ нақшаро дастгирӣ карданд.', '/səˈpɔːt/', 'verb', '🤝'),
    W('Improve', 'Беҳтар кардан', 'The council improved the park.', 'Шӯро боғро беҳтар кард.', '/ɪmˈpruːv/', 'verb', '🌳'),
    W('Facility', 'Иншоот', 'The town has good sports facilities.', 'Шаҳрак иншооти хуби варзишӣ дорад.', '/fəˈsɪləti/', 'noun', '🏟'),
    W('Resident', 'Сокин', 'Residents complained about the noise.', 'Сокинон аз садо шикоят карданд.', '/ˈrezɪdənt/', 'noun', '🏠'),
    W('Council', 'Шӯро', 'The city council made a decision.', 'Шӯрои шаҳр қарор қабул кард.', '/ˈkaʊnsl/', 'noun', '🏛'),
    W('Public', 'Ҷамъиятӣ', 'Public transport is cheap here.', 'Нақлиёти ҷамъиятӣ дар ин ҷо арзон аст.', '/ˈpʌblɪk/', 'adjective', '🚌'),
    W('Generation', 'Насл', 'The younger generation thinks differently.', 'Насли ҷавон дигар хел фикр мекунад.', '/ˌdʒenəˈreɪʃn/', 'noun', '👶'),
    W('Tradition', 'Анъана', 'This tradition is hundreds of years old.', 'Ин анъана садҳо сол дорад.', '/trəˈdɪʃn/', 'noun', '🎎'),
  ]},
  { mo: 10, title: 'Media and Opinion', titleTr: 'Расона ва афкор', emoji: '🗞', words: [
    W('Opinion', 'Ақида', 'Everyone has a different opinion.', 'Ҳар кас ақидаи гуногун дорад.', '/əˈpɪnjən/', 'noun', '💭'),
    W('Argue', 'Баҳс кардан', 'They argue about politics.', 'Онҳо дар бораи сиёсат баҳс мекунанд.', '/ˈɑːɡjuː/', 'verb', '🗣'),
    W('Agree', 'Розӣ шудан', 'I agree with her point.', 'Ман бо фикри ӯ розӣ ҳастам.', '/əˈɡriː/', 'verb', '👍'),
    W('Disagree', 'Розӣ набудан', 'We disagree about the solution.', 'Мо дар бораи роҳи ҳал розӣ нестем.', '/ˌdɪsəˈɡriː/', 'verb', '👎'),
    W('Debate', 'Мунозира', 'The debate lasted two hours.', 'Мунозира ду соат давом кард.', '/dɪˈbeɪt/', 'noun', '⚖️'),
    W('Survey', 'Пурсиш', 'A survey showed most people agree.', 'Пурсиш нишон дод, ки аксарият розӣ ҳастанд.', '/ˈsɜːveɪ/', 'noun', '📋'),
    W('Statistic', 'Омор', 'The statistics are surprising.', 'Омор ҳайратангез аст.', '/stəˈtɪstɪk/', 'noun', '📊'),
    W('Claim', 'Даъво кардан', 'The article claims prices will fall.', 'Мақола даъво мекунад, ки нархҳо паст мешаванд.', '/kleɪm/', 'verb', '📣'),
    W('Prove', 'Исбот кардан', 'They could not prove the story.', 'Онҳо ҳикояро исбот карда натавонистанд.', '/pruːv/', 'verb', '🔍'),
    W('Rumour', 'Овоза', 'It was only a rumour.', 'Ин танҳо овоза буд.', '/ˈruːmə/', 'noun', '🌬'),
    W('Criticise', 'Танқид кардан', 'Some people criticised the decision.', 'Баъзе одамон қарорро танқид карданд.', '/ˈkrɪtɪsaɪz/', 'verb', '✏️'),
    W('Persuade', 'Бовар кунонидан', 'The advert persuaded many buyers.', 'Реклама бисёр харидоронро бовар кунонд.', '/pəˈsweɪd/', 'verb', '🎯'),
  ]},

  { mo: 11, title: 'Learning and Habits', titleTr: 'Омӯзиш ва одатҳо', emoji: '🌱', words: [
    W('Routine', 'Тартиби ҳаррӯза', 'A morning routine helps me focus.', 'Тартиби субҳона ба ман кӯмак мекунад тамаркуз кунам.', '/ruːˈtiːn/', 'noun', '🔄'),
    W('Habit', 'Одат', 'Reading is a good habit.', 'Хондан одати хуб аст.', '/ˈhæbɪt/', 'noun', '📚'),
    W('Consistent', 'Пайваста', 'Be consistent, even for ten minutes.', 'Пайваста бошед, ҳатто даҳ дақиқа.', '/kənˈsɪstənt/', 'adjective', '📆'),
    W('Progress', 'Пешрафт', 'Progress is slow but real.', 'Пешрафт суст, вале воқеӣ аст.', '/ˈprəʊɡres/', 'noun', '📈'),
    W('Practice', 'Машқ', 'Practice makes a real difference.', 'Машқ фарқи воқеӣ мекунад.', '/ˈpræktɪs/', 'noun', '🎯'),
    W('Mistake', 'Хато', 'Learn from every mistake.', 'Аз ҳар хато омӯзед.', '/mɪˈsteɪk/', 'noun', '❌'),
    W('Review', 'Такрор кардан', 'Review your notes every week.', 'Ҳар ҳафта қайдҳоятонро такрор кунед.', '/rɪˈvjuː/', 'verb', '🔁'),
    W('Concentrate', 'Тамаркуз кардан', 'I cannot concentrate with the TV on.', 'Бо телевизори фурӯзон тамаркуз карда наметавонам.', '/ˈkɒnsntreɪt/', 'verb', '🧠'),
    W('Distraction', 'Парешонӣ', 'Your phone is the biggest distraction.', 'Телефони шумо бузургтарин сабаби парешонист.', '/dɪˈstrækʃn/', 'noun', '📵'),
    W('Deadline', 'Мӯҳлат', 'Set yourself a clear deadline.', 'Барои худ мӯҳлати равшан гузоред.', '/ˈdedlaɪn/', 'noun', '⏳'),
    W('Reward', 'Мукофот', 'Give yourself a small reward.', 'Ба худ мукофоти хурд диҳед.', '/rɪˈwɔːd/', 'noun', '🍫'),
    W('Give up', 'Даст кашидан', 'Do not give up after one failure.', 'Баъди як нокомӣ даст накашед.', '/ɡɪv ʌp/', 'verb', '🚫'),
  ]},
  { mo: 11, title: 'Success and Failure', titleTr: 'Муваффақият ва нокомӣ', emoji: '🏆', words: [
    W('Achieve', 'Ноил шудан', 'She achieved all her goals.', 'Ӯ ба ҳамаи ҳадафҳояш ноил шуд.', '/əˈtʃiːv/', 'verb', '🎯'),
    W('Succeed', 'Муваффақ шудан', 'He succeeded after many attempts.', 'Ӯ баъди кӯшишҳои зиёд муваффақ шуд.', '/səkˈsiːd/', 'verb', '🏅'),
    W('Attempt', 'Кӯшиш', 'It worked on the third attempt.', 'Он дар кӯшиши сеюм натиҷа дод.', '/əˈtempt/', 'noun', '🔁'),
    W('Ambition', 'Ҳадафи бузург', 'Her ambition is to become a doctor.', 'Ҳадафи бузурги ӯ духтур шудан аст.', '/æmˈbɪʃn/', 'noun', '🚀'),
    W('Opportunity', 'Имконият', 'Do not miss this opportunity.', 'Ин имкониятро аз даст надиҳед.', '/ˌɒpəˈtjuːnəti/', 'noun', '🚪'),
    W('Risk', 'Таваккал', 'Starting a business is a risk.', 'Оғози тиҷорат таваккал аст.', '/rɪsk/', 'noun', '🎲'),
    W('Regret', 'Пушаймонӣ', 'My only regret is starting late.', 'Ягона пушаймонии ман дер оғоз кардан аст.', '/rɪˈɡret/', 'noun', '😔'),
    W('Disappointed', 'Ноумед', 'He was disappointed with the result.', 'Ӯ аз натиҷа ноумед шуд.', '/ˌdɪsəˈpɔɪntɪd/', 'adjective', '😞'),
    W('Proud', 'Ифтихорманд', 'I am proud of my students.', 'Ман аз донишҷӯёнам ифтихор мекунам.', '/praʊd/', 'adjective', '🌟'),
    W('Encourage', 'Рӯҳбаланд кардан', 'Good teachers encourage everyone.', 'Муаллимони хуб ҳамаро рӯҳбаланд мекунанд.', '/ɪnˈkʌrɪdʒ/', 'verb', '💪'),
    W('Realistic', 'Воқеъбин', 'Set realistic goals for yourself.', 'Барои худ ҳадафҳои воқеъбинона гузоред.', '/ˌrɪəˈlɪstɪk/', 'adjective', '🎚'),
    W('Deserve', 'Сазовор будан', 'You deserve this success.', 'Шумо ба ин муваффақият сазоворед.', '/dɪˈzɜːv/', 'verb', '🏆'),
  ]},
];

// ── existing words ──
const mods = (await api('/modules?courseId=' + B1)).modules.sort((a, b) => a.order - b.order);
const existing = new Set();
for (const m of mods) for (const l of (await api('/lessons?moduleId=' + m.id)).lessons) {
  if (!l._count.words) continue;
  for (const w of (await api('/words?lessonId=' + l.id)).words) existing.add(w.word.toLowerCase().trim());
}
console.log('калимаи мавҷуда:', existing.size);

let added = 0;
// 1) top-ups (append, so mode is NOT replace)
for (const t of TOPUPS) {
  const have = (await api('/words?lessonId=' + t.lessonId)).words;
  const fresh = t.words.filter(w => !existing.has(w.word.toLowerCase().trim()));
  fresh.forEach(w => existing.add(w.word.toLowerCase().trim()));
  if (!fresh.length) { console.log(`  – ${t.label}: чизи нав нест`); continue; }
  await api('/words/bulk', 'POST', { lessonId: t.lessonId, mode: 'replace', words: [...have.map(w => ({ word: w.word, translation: w.translation, example: w.example, exampleTrans: w.exampleTrans, ipa: w.ipa, partOfSpeech: w.partOfSpeech, emoji: w.emoji })), ...fresh] });
  added += fresh.length;
  console.log(`  ✓ ${t.label}: +${fresh.length} → ${have.length + fresh.length} калима`);
}

// 2) new lessons
for (const spec of LESSONS) {
  const mod = mods[spec.mo];
  const lessons = (await api('/lessons?moduleId=' + mod.id)).lessons.sort((a, b) => a.order - b.order);
  if (lessons.some(l => l.title.includes(spec.title))) { console.log(`M${spec.mo + 1} "${spec.title}": аллакай ҳаст`); continue; }
  const fresh = spec.words.filter(w => !existing.has(w.word.toLowerCase().trim()));
  fresh.forEach(w => existing.add(w.word.toLowerCase().trim()));

  const lastVocab = [...lessons].reverse().find(l => l.skillType === 'vocab');
  const at = lastVocab.order + 1;
  for (const l of lessons.filter(l => l.order >= at).sort((a, b) => b.order - a.order)) {
    await api('/lessons/' + l.id, 'PUT', { order: l.order + 1 });
  }
  const created = await api('/lessons', 'POST', {
    moduleId: mod.id, title: `Lesson: ${spec.title}`, titleTranslated: spec.titleTr,
    type: 'vocab', skillType: 'vocab', cefrLevel: 'B1', emoji: spec.emoji,
    xpReward: 15, duration: 5, order: at, isPremium: false,
  });
  await api('/words/bulk', 'POST', { lessonId: created.lesson.id, mode: 'replace', words: fresh });
  added += fresh.length;
  console.log(`  ✓ M${spec.mo + 1} "${spec.title}" — ${fresh.length} калима`);
}

console.log(`\n✅ ${added} калимаи нав. Ҷамъи ягонаи B1: ${existing.size}`);
