import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 3, title: 'Module 4: Food And Cooking', titleTranslated: 'Модули 4: Хӯрок ва Пухтупаз',
  emoji: '🍳', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: In the Kitchen', tt: 'Дарси 1: Дар ошхона', emoji: '🍽️', words: [
      W('Fridge','/frɪdʒ/','фриҷ','Яхдон','🧊','Put the milk in the fridge.','Ширро ба яхдон мон.','noun'),
      W('Oven','/ˈʌvən/','авен','Танӯр / духовка','🔥','The bread is in the oven.','Нон дар танӯр аст.','noun'),
      W('Stove','/stəʊv/','стоув','Оташдон / плита','🍳','She cooks on the stove.','Ӯ дар плита хӯрок мепазад.','noun'),
      W('Kettle','/ˈketl/','кетл','Чойник (барқӣ)','🫖','Boil the kettle for tea.','Чойникро барои чой ҷӯшон.','noun'),
      W('Saucepan','/ˈsɔːspən/','соспэн','Дегча','🥘','Heat the soup in a saucepan.','Шӯрборо дар дегча гарм кун.','noun'),
      W('Frying pan','/ˈfraɪɪŋ pæn/','фрайинг пэн','Тоба','🍳','Fry the eggs in the pan.','Тухмро дар тоба бирён кун.','noun'),
      W('Bowl','/bəʊl/','боул','Коса','🥣','I ate a bowl of soup.','Ман як коса шӯрбо хӯрдам.','noun'),
      W('Jug','/dʒʌɡ/','ҷаг','Кӯза / кувшин','🏺','Fill the jug with water.','Кӯзаро бо об пур кун.','noun'),
      W('Tray','/treɪ/','трей','Табақ / поднос','🍱','She carried a tray of food.','Ӯ табақи хӯрокро бардошт.','noun'),
      W('Recipe','/ˈresəpi/','ресепи','Дастур (хӯрок)','📜','This is my grandmother\'s recipe.','Ин дастури бибиям аст.','noun'),
    ]},
    { title: 'Lesson 2: Cooking Verbs', tt: 'Дарси 2: Феълҳои пухтупаз', emoji: '👨‍🍳', words: [
      W('Boil','/bɔɪl/','бойл','Ҷӯшондан','💧','Boil the water first.','Аввал обро ҷӯшон.','verb'),
      W('Fry','/fraɪ/','фрай','Бирён кардан','🍳','Fry the onions in oil.','Пиёзро дар равған бирён кун.','verb'),
      W('Bake','/beɪk/','бейк','Пухтан (дар танӯр)','🍰','My mother bakes bread.','Модарам нон мепазад.','verb'),
      W('Roast','/rəʊst/','роуст','Бирён кардан (гӯшт)','🍗','We roast a chicken on Sunday.','Мо рӯзи якшанбе мурғ бирён мекунем.','verb'),
      W('Chop','/tʃɒp/','чоп','Майда кардан','🔪','Chop the vegetables.','Сабзавотро майда кун.','verb'),
      W('Peel','/piːl/','пил','Пӯст кандан','🥔','Peel the potatoes.','Картошкаро пӯст кан.','verb'),
      W('Slice','/slaɪs/','слайс','Бурида кардан (борик)','🍅','Slice the tomato.','Помидорро борик бур.','verb'),
      W('Stir','/stɜː/','стёр','Ҳам задан','🥄','Stir the soup slowly.','Шӯрборо оҳиста ҳам зан.','verb'),
      W('Pour','/pɔː/','пор','Рехтан','🫗','Pour the milk into the cup.','Ширро ба пиёла рез.','verb'),
      W('Taste','/teɪst/','тейст','Чашидан','😋','Taste the sauce, please.','Лутфан қайларо бичаш.','verb'),
    ]},
    { title: 'Lesson 3: Ingredients', tt: 'Дарси 3: Масолеҳ', emoji: '🧂', words: [
      W('Flour','/ˈflaʊə/','флауер','Орд','🌾','You need flour for bread.','Барои нон орд лозим аст.','noun'),
      W('Oil','/ɔɪl/','ойл','Равған','🫒','Add some oil to the pan.','Каме равған ба тоба илова кун.','noun'),
      W('Yeast','/jiːst/','йист','Хамиртуруш','🍞','Bread needs yeast to rise.','Нон барои варам хамиртуруш лозим дорад.','noun'),
      W('Sauce','/sɔːs/','сос','Қайла / соус','🥫','This sauce is delicious.','Ин қайла бомаза аст.','noun'),
      W('Ginger','/ˈdʒɪndʒə/','ҷинҷер','Занҷабил','🫚','Ginger tea is good for colds.','Чойи занҷабил барои шамолхӯрӣ хуб аст.','noun'),
      W('Spice','/spaɪs/','спайс','Хушбӯй / ادويه','🌿','Indian food has many spices.','Хӯроки ҳиндӣ хушбӯиҳои зиёд дорад.','noun'),
      W('Honey','/ˈhʌni/','ҳани','Асал','🍯','I like tea with honey.','Ман чойро бо асал дӯст медорам.','noun'),
      W('Dough','/dəʊ/','доу','Хамир','🥟','She makes dough for bread.','Ӯ барои нон хамир мекунад.','noun'),
      W('Herb','/hɜːb/','ҳёрб','Сабзаи хушбӯй','🌿','Fresh herbs make food tasty.','Сабзаи тару тоза хӯрокро бомаза мекунад.','noun'),
      W('Vinegar','/ˈvɪnɪɡə/','винигер','Сирко','🍶','Put vinegar in the salad.','Ба салат сирко андоз.','noun'),
    ]},
    { title: 'Lesson 4: Quantities And Containers', tt: 'Дарси 4: Миқдор ва Зарфҳо', emoji: '⚖️', words: [
      W('Carton','/ˈkɑːtən/','картон','Қуттии картонӣ','📦','A carton of milk.','Як қуттӣ шир.','noun'),
      W('Packet','/ˈpækɪt/','пэкет','Баста','📦','I bought a packet of rice.','Ман як бастаи биринҷ харидам.','noun'),
      W('Piece','/piːs/','пис','Порча / як бӯлак','🍰','Give me a piece of cake.','Ба ман як порча торт деҳ.','noun'),
      W('Bunch','/bʌntʃ/','банч','Даста','🍇','A bunch of grapes.','Як дастаи ангур.','noun'),
      W('Loaf','/ləʊf/','лоуф','Як кулча нон','🍞','I need a loaf of bread.','Ба ман як кулча нон лозим аст.','noun'),
      W('Jar','/dʒɑː/','ҷар','Банка / зарфи шишагӣ','🫙','A jar of honey.','Як банкаи асал.','noun'),
      W('Litre','/ˈliːtə/','литр','Литр','🧴','A litre of oil.','Як литр равған.','noun'),
      W('Half','/hɑːf/','ҳаф','Ним','½','Half a litre of milk.','Ним литр шир.','noun'),
      W('Dozen','/ˈdʌzən/','дазен','Дувоздаҳто','🥚','A dozen eggs.','Дувоздаҳто тухм.','noun'),
      W('Spoonful','/ˈspuːnfʊl/','спунфул','Як қошуқ (пур)','🥄','Add a spoonful of sugar.','Як қошуқ шакар илова кун.','noun'),
    ]},
    { title: 'Lesson 5: Taste And Meals', tt: 'Дарси 5: Таъм ва Хӯрокҳо', emoji: '😋', words: [
      W('Delicious','/dɪˈlɪʃəs/','дилишес','Болаззат','🤤','The soup is delicious.','Шӯрбо болаззат аст.','adjective'),
      W('Tasty','/ˈteɪsti/','тейсти','Бомаза','😋','This cake is very tasty.','Ин торт хеле бомаза аст.','adjective'),
      W('Sour','/ˈsaʊə/','сауер','Турш','🍋','The lemon is very sour.','Лимӯ хеле турш аст.','adjective'),
      W('Bitter','/ˈbɪtə/','битер','Талх','☕','Black coffee is bitter.','Қаҳваи сиёҳ талх аст.','adjective'),
      W('Spicy','/ˈspaɪsi/','спайси','Тунд','🌶️','I love spicy food.','Ман хӯроки тундро дӯст медорам.','adjective'),
      W('Salty','/ˈsɔːlti/','солти','Шӯр','🧂','The soup is too salty.','Шӯрбо хеле шӯр аст.','adjective'),
      W('Ripe','/raɪp/','райп','Пухта (мева)','🍌','The bananas are ripe now.','Бананҳо ҳоло пухтаанд.','adjective'),
      W('Starter','/ˈstɑːtə/','стартер','Хӯроки аввал / закуска','🥗','We had soup as a starter.','Мо ҳамчун хӯроки аввал шӯрбо хӯрдем.','noun'),
      W('Dessert','/dɪˈzɜːt/','дизёрт','Ширинӣ (баъди хӯрок)','🍨','We had ice cream for dessert.','Мо барои ширинӣ яхмос хӯрдем.','noun'),
      W('Dish','/dɪʃ/','диш','Таом (хӯрок)','🍛','Osh is a famous dish.','Ош таоми машҳур аст.','noun'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — Countable & Uncountable', lessonTitleTg: 'Дарси 6: Грамматика — Ҳисобшаванда ва Ҳисобнашаванда',
      title: 'Countable & Uncountable Nouns', titleTranslated: 'Исмҳои ҳисобшаванда ва ҳисобнашаванда', emoji: '🔢',
      explanation:
`Дар англисӣ исмҳо ду навъ мешаванд:
- **Ҳисобшаванда (countable):** метавон шумурд — *an apple, two eggs, three cups*. Шакли ҷамъ доранд.
- **Ҳисобнашаванда (uncountable):** намешавад шумурд — *water, rice, sugar, bread, milk*. Шакли ҷамъ **надоранд** (не «waters»).

**a / an** танҳо бо ҳисобшавандаи танҳо: *an egg, a bottle*.
**some** — ҳам бо ҷамъи ҳисобшаванда, ҳам бо ҳисобнашаванда (дар ҷумлаи **мусбат**): *some apples, some water*.
**any** — дар ҷумлаи **манфӣ** ва **савол**: *I don't have any milk. Is there any bread?*`,
      rules: [
        { pattern: 'a/an + ҳисобшавандаи танҳо', note: 'an apple, a spoon (не «a water»)' },
        { pattern: 'some + мусбат', note: 'some rice, some eggs' },
        { pattern: 'any + манфӣ/савол', note: "not any sugar, any apples?" },
        { pattern: 'ҳисобнашаванда = ҳамеша танҳо', note: 'water, bread, money (не «breads»)' },
      ],
      examples: [
        { sentence: 'There is some milk in the fridge.', translation: 'Дар яхдон каме шир ҳаст.', highlight: 'some milk' },
        { sentence: 'I need an egg and some flour.', translation: 'Ба ман як тухм ва каме орд лозим аст.', highlight: 'an egg' },
        { sentence: "We don't have any sugar.", translation: 'Мо шакар надорем.', highlight: 'any sugar' },
        { sentence: 'Is there any bread?', translation: 'Нон ҳаст?', highlight: 'any bread' },
        { sentence: 'She bought some apples.', translation: 'Ӯ якчанд себ харид.', highlight: 'some apples' },
      ],
      exercises: [
        { type:'choose', prompt:'I need ___ egg for the cake.', promptTranslated:'Ба ман барои торт як тухм лозим аст.', options:['an','a','some','any'], answer:'an', explanation:'egg — ҳисобшавандаи танҳо, бо садонок → an.' },
        { type:'choose', prompt:'There is ___ water in the bottle.', promptTranslated:'Дар шиша каме об ҳаст.', options:['some','a','an','many'], answer:'some', explanation:'water ҳисобнашаванда, ҷумлаи мусбат → some.' },
        { type:'choose', prompt:"We don't have ___ milk.", promptTranslated:'Мо шир надорем.', options:['any','some','a','an'], answer:'any', explanation:'Ҷумлаи манфӣ → any.' },
        { type:'choose', prompt:'Is there ___ sugar in my tea?', promptTranslated:'Дар чойи ман шакар ҳаст?', options:['any','a','an','a lot'], answer:'any', explanation:'Савол → any.' },
        { type:'fill_blank', prompt:'She bought ___ (мусбат) tomatoes.', promptTranslated:'Ӯ якчанд помидор харид.', answer:'some', explanation:'Ҷамъи ҳисобшаванда, мусбат → some.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Дар яхдон каме нон ҳаст.', options:['There','some','is','bread','the','in','fridge'], answer:'There is some bread in the fridge.', explanation:'There is some bread ...' },
        { type:'transform', prompt:'Ислоҳ кунед: I have a rice.', promptTranslated:'rice ҳисобнашаванда аст.', answer:'I have some rice.', explanation:'rice ҳисобнашаванда → a намешавад, some.' },
        { type:'transform', prompt:'Манфӣ созед: We have some cheese.', promptTranslated:'ба манфӣ.', answer:"We don't have any cheese.", explanation:'манфӣ → any.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — How Much & How Many', lessonTitleTg: 'Дарси 7: Грамматика — How Much ва How Many',
      title: 'much / many / a lot of', titleTranslated: 'much / many / a lot of (миқдор)', emoji: '📏',
      explanation:
`Барои миқдор:
- **many** + исми **ҳисобшаванда** (ҷамъ): *many books, many people*.
- **much** + исми **ҳисобнашаванда**: *much water, much time*. (Асосан дар савол/манфӣ)
- **a lot of / lots of** — бо ҳар ду навъ (мусбат): *a lot of friends, a lot of money*.

Савол: **How many** + ҳисобшаванда? *How many eggs?* | **How much** + ҳисобнашаванда? *How much sugar?*`,
      rules: [
        { pattern: 'many + ҳисобшаванда', note: 'many apples, many students' },
        { pattern: 'much + ҳисобнашаванда', note: 'much water, much money' },
        { pattern: 'a lot of + ҳар ду', note: 'a lot of books, a lot of milk' },
        { pattern: 'How many? / How much?', note: 'How many eggs? How much rice?' },
      ],
      examples: [
        { sentence: 'How many eggs do we need?', translation: 'Ба мо чанд тухм лозим аст?', highlight: 'How many' },
        { sentence: 'How much sugar do you want?', translation: 'Ту чӣ қадар шакар мехоҳӣ?', highlight: 'How much' },
        { sentence: "There isn't much milk left.", translation: 'Шири зиёд намондааст.', highlight: 'much milk' },
        { sentence: 'She has a lot of friends.', translation: 'Ӯ дӯстони зиёд дорад.', highlight: 'a lot of' },
        { sentence: 'There are many apples in the box.', translation: 'Дар қуттӣ себи зиёд ҳаст.', highlight: 'many apples' },
      ],
      exercises: [
        { type:'choose', prompt:'How ___ eggs do you need?', promptTranslated:'Ба ту чанд тухм лозим аст?', options:['many','much','lot','a lot'], answer:'many', explanation:'eggs ҳисобшаванда → many.' },
        { type:'choose', prompt:'How ___ water is in the jug?', promptTranslated:'Дар кӯза чӣ қадар об аст?', options:['much','many','lot','a lot of'], answer:'much', explanation:'water ҳисобнашаванда → much.' },
        { type:'choose', prompt:"There aren't ___ apples left.", promptTranslated:'Себи зиёд намондааст.', options:['many','much','a lot','some of'], answer:'many', explanation:'apples ҳисобшаванда → many.' },
        { type:'choose', prompt:'She drinks ___ coffee every day.', promptTranslated:'Ӯ ҳар рӯз қаҳваи зиёд менӯшад.', options:['a lot of','many','how much','an'], answer:'a lot of', explanation:'мусбат → a lot of.' },
        { type:'fill_blank', prompt:'How ___ money do you have?', promptTranslated:'Ту чӣ қадар пул дорӣ?', answer:'much', explanation:'money ҳисобнашаванда → much.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Онҳо дӯстони зиёд доранд.', options:['They','a','have','of','lot','friends'], answer:'They have a lot of friends.', explanation:'... a lot of friends.' },
        { type:'transform', prompt:'Ислоҳ кунед: How much apples?', promptTranslated:'apples ҳисобшаванда.', answer:'How many apples?', explanation:'ҳисобшаванда → How many.' },
        { type:'transform', prompt:'Ислоҳ кунед: I have many money.', promptTranslated:'money ҳисобнашаванда.', answer:'I have a lot of money.', explanation:'мусбат + ҳисобнашаванда → a lot of.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — Making Soup', lessonTitleTg: 'Дарси 8: Шунавоӣ — Пухтани шӯрбо',
    title: 'Making Soup', titleTranslated: 'Пухтани шӯрбо', emoji: '🍲',
    passage: 'Today I am making vegetable soup. First, I peel and chop some potatoes, carrots, and one onion. Then I pour some oil into a big saucepan and fry the onion. I add the vegetables and some water. I boil everything for twenty minutes. Finally, I add salt, pepper, and a spoonful of butter. I stir the soup and taste it. It is delicious! There is enough soup for the whole family.',
    passageTranslated: 'Имрӯз ман шӯрбои сабзавотӣ мепазам. Аввал ман якчанд картошка, сабзӣ ва як пиёзро пӯст канда, майда мекунам. Баъд каме равған ба дегчаи калон мерезам ва пиёзро бирён мекунам. Сабзавот ва каме об илова мекунам. Ҳамаро бист дақиқа меҷӯшонам. Дар охир намак, мурч ва як қошуқ маска илова мекунам. Шӯрборо ҳам зада, мечашам. Он болаззат аст! Барои тамоми оила шӯрбо кофӣ аст.',
    questions: [
      { question:'What is the person making?', questionTranslated:'Ин шахс чӣ мепазад?', options:['Cake','Vegetable soup','Bread'], correctIndex:1, explanation:'making vegetable soup.' },
      { question:'What do they do with the onion?', questionTranslated:'Бо пиёз чӣ мекунанд?', options:['Boil it','Fry it','Bake it'], correctIndex:1, explanation:'fry the onion.' },
      { question:'How long do they boil everything?', questionTranslated:'Ҳамаро чанд дақиқа меҷӯшонанд?', options:['Ten minutes','Twenty minutes','One hour'], correctIndex:1, explanation:'boil everything for twenty minutes.' },
      { question:'What do they add at the end?', questionTranslated:'Дар охир чӣ илова мекунанд?', options:['Sugar and honey','Salt, pepper and butter','Flour'], correctIndex:1, explanation:'salt, pepper, and a spoonful of butter.' },
      { question:'How does the soup taste?', questionTranslated:'Шӯрбо чӣ таъм дорад?', options:['Bitter','Delicious','Too salty'], correctIndex:1, explanation:'It is delicious!' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — At the Market', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Дар бозор',
    title: 'At the Market', titleTranslated: 'Дар бозор', emoji: '🛒',
    scenario: 'Харидор дар бозор аз фурӯшанда мева ва масолеҳ мехарад.',
    lines: [
      { speaker:'Seller', text:'Hello! How can I help you?', translation:'Салом! Чӣ гуна кӯмак кунам?', isUser:false },
      { speaker:'You', text:'I need some apples. How much are they?', translation:'Ба ман якчанд себ лозим аст. Нархашон чанд аст?', isUser:true },
      { speaker:'Seller', text:'Ten somoni a kilo. How many do you want?', translation:'Килояш даҳ сомонӣ. Чанд кило мехоҳед?', isUser:false },
      { speaker:'You', text:'Two kilos, please. Do you have any honey?', translation:'Ду кило, лутфан. Асал доред?', isUser:true },
      { speaker:'Seller', text:'Yes, a jar of honey is fifteen somoni.', translation:'Бале, як банка асал понздаҳ сомонӣ аст.', isUser:false },
      { speaker:'You', text:'I\'ll take one jar. How much is everything?', translation:'Як банка мегирам. Ҳамааш чанд шуд?', isUser:true },
      { speaker:'Seller', text:'That is thirty-five somoni in total.', translation:'Дар маҷмӯъ сию панҷ сомонӣ.', isUser:false },
      { speaker:'You', text:'Here you are. Thank you very much!', translation:'Мана, гиред. Ташаккури зиёд!', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — My Favourite Dish', lessonTitleTg: 'Дарси 10: Хониш — Хӯроки дӯстдоштаи ман',
    title: 'My Favourite Dish', titleTranslated: 'Хӯроки дӯстдоштаи ман', emoji: '🍛',
    passage: 'My favourite dish is osh, the national food of Tajikistan. My mother cooks it every weekend. She needs rice, meat, carrots, oil, and some spices. First, she fries the meat and onions in a big pot. Then she adds a lot of carrots and some water. She does not use much salt. The rice goes in last. It takes about two hours. When the osh is ready, the whole family sits together. It is always delicious, and there is enough for everyone. I think it is the tastiest meal in the world.',
    passageTranslated: 'Хӯроки дӯстдоштаи ман ош аст — таоми миллии Тоҷикистон. Модарам онро ҳар рӯзи истироҳат мепазад. Ба ӯ биринҷ, гӯшт, сабзӣ, равған ва каме хушбӯӣ лозим аст. Аввал ӯ гӯшт ва пиёзро дар дегча бирён мекунад. Баъд сабзии зиёд ва каме об илова мекунад. Ӯ намаки зиёд истифода намебарад. Биринҷ дар охир андохта мешавад. Тақрибан ду соат вақт мегирад. Вақте ош тайёр шуд, тамоми оила якҷоя менишинад. Он ҳамеша болаззат аст ва барои ҳама кофӣ мешавад. Ба фикрам, ин бомазатарин таоми ҷаҳон аст.',
    questions: [
      { question:'What is the writer\'s favourite dish?', questionTranslated:'Хӯроки дӯстдоштаи нависанда чист?', options:['Soup','Osh','Cake'], correctIndex:1, explanation:'My favourite dish is osh.' },
      { question:'Who cooks it?', questionTranslated:'Онро кӣ мепазад?', options:['His mother','His sister','He'], correctIndex:0, explanation:'My mother cooks it.' },
      { question:'Does she use much salt?', questionTranslated:'Ӯ намаки зиёд истифода мебарад?', options:['Yes, a lot','No, not much','Only salt'], correctIndex:1, explanation:'She does not use much salt.' },
      { question:'How long does it take?', questionTranslated:'Чанд вақт мегирад?', options:['All day','Twenty minutes','Two hours'], correctIndex:2, explanation:'It takes about two hours.' },
      { question:'What does the writer think of osh?', questionTranslated:'Нависанда дар бораи ош чӣ фикр мекунад?', options:['It is boring','The tastiest meal','Too salty'], correctIndex:1, explanation:'the tastiest meal in the world.' },
    ],
  },
  review: {
    passage: 'Farida loves cooking. On Friday she goes to the market and buys a lot of fresh vegetables, a packet of rice, and a bottle of oil. She does not buy much meat because it is expensive. At home, she peels and chops the vegetables. She fries some onions and boils the rice. She uses many spices but not much salt. Her kitchen smells wonderful. Her family says her food is always delicious. For dessert, she makes a cake with flour, eggs, and honey.',
    passageTranslated: 'Фарида пухтупазро дӯст медорад. Рӯзи ҷумъа ӯ ба бозор рафта, сабзавоти тару тозаи зиёд, як бастаи биринҷ ва як шиша равған мехарад. Ӯ гӯшти зиёд намехарад, зеро он гарон аст. Дар хона ӯ сабзавотро пӯст канда, майда мекунад. Каме пиёз бирён мекунад ва биринҷро меҷӯшонад. Ӯ хушбӯиҳои зиёд, вале намаки кам истифода мебарад. Ошхонаи ӯ бӯи аҷоиб медиҳад. Оилаи ӯ мегӯяд, ки хӯроки ӯ ҳамеша болаззат аст. Барои ширинӣ ӯ бо орд, тухм ва асал торт мепазад.',
    questions: [
      { question:'What does Farida buy a lot of?', questionTranslated:'Фарида чиро зиёд мехарад?', options:['Meat','Fresh vegetables','Honey'], correctIndex:1, explanation:'a lot of fresh vegetables.' },
      { question:'Why doesn\'t she buy much meat?', questionTranslated:'Чаро ӯ гӯшти зиёд намехарад?', options:['No meat','It is expensive','She hates it'], correctIndex:1, explanation:'because it is expensive.' },
      { question:'How much salt does she use?', questionTranslated:'Ӯ чӣ қадар намак истифода мебарад?', options:['A lot','Not much','None'], correctIndex:1, explanation:'not much salt.' },
      { question:'What does she make for dessert?', questionTranslated:'Барои ширинӣ чӣ мепазад?', options:['Soup','A cake','Bread'], correctIndex:1, explanation:'she makes a cake.' },
      { question:'What does she put in the cake?', questionTranslated:'Ба торт чӣ меандозад?', options:[eggs and honey','Rice and oil','Flour,'Meat'], correctIndex:2, explanation:'flour, eggs, and honey.' },
    ],
  },
  exam: {
    passage: 'Two friends, Omad and Rustam, opened a small restaurant. Omad is the cook. Every morning he buys fresh food: some meat, a lot of vegetables, and many eggs. He never uses much oil because he wants healthy food. Rustam serves the guests. The most popular dish is their soup, and the tastiest dessert is honey cake. Many people come every day, so the friends are very busy. They say the secret is simple: fresh food, good recipes, and a lot of love. Their restaurant is now the best in the town.',
    passageTranslated: 'Ду дӯст — Омад ва Рустам — тарабхонаи хурд кушоданд. Омад ошпаз аст. Ҳар субҳ ӯ хӯроки тару тоза мехарад: каме гӯшт, сабзавоти зиёд ва тухмҳои бисёр. Ӯ ҳеҷ гоҳ равғани зиёд истифода намебарад, зеро хӯроки солим мехоҳад. Рустам ба меҳмонон хизмат мекунад. Машҳуртарин хӯрок шӯрбои онҳост ва бомазатарин ширинӣ торти асал аст. Ҳар рӯз одамони зиёд меоянд, бинобар ин дӯстон хеле банданд. Онҳо мегӯянд, ки роз содда аст: хӯроки тару тоза, дастурҳои хуб ва меҳри зиёд. Тарабхонаи онҳо акнун беҳтарин дар шаҳр аст.',
    questions: [
      { question:'Who is the cook?', questionTranslated:'Ошпаз кӣ аст?', options:['Rustam','Both','Omad'], correctIndex:2, explanation:'Omad is the cook.' },
      { question:'How much oil does he use?', questionTranslated:'Ӯ чӣ қадар равған истифода мебарад?', options:['A lot','Not much','None'], correctIndex:1, explanation:'never uses much oil.' },
      { question:'What is the most popular dish?', questionTranslated:'Машҳуртарин хӯрок чист?', options:['Their soup','Honey cake','Rice'], correctIndex:0, explanation:'the most popular dish is their soup.' },
      { question:'What is the tastiest dessert?', questionTranslated:'Бомазатарин ширинӣ чист?', options:['Ice cream','Honey cake','Fruit'], correctIndex:1, explanation:'the tastiest dessert is honey cake.' },
      { question:'What is their secret?', questionTranslated:'Рози онҳо чист?', options:['Cheap food','Fresh food, good recipes and love','Fast service'], correctIndex:1, explanation:'fresh food, good recipes, and a lot of love.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 4 тайёр.');
