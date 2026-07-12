import { W, buildModule, refreshExisting, bumpVersion, done } from './a2-module-builder.mjs';

const M = {
  order: 12, title: 'Module 13: Money And Services', titleTranslated: 'Модули 13: Пул ва Хидматҳо',
  emoji: '💰', color: '#3B82F6',
  vocab: [
    { title: 'Lesson 1: Money', tt: 'Дарси 1: Пул', emoji: '💵', words: [
      W('Payment','/ˈpeɪmənt/','пеймент','Пардохт','💳','The payment was successful.','Пардохт муваффақ буд.','noun'),
      W('Cheque','/tʃek/','чек','Чек (бонкӣ)','🏦','He wrote a cheque.','Ӯ чек навишт.','noun'),
      W('Banknote','/ˈbæŋknəʊt/','бэнкноут','Пули коғазӣ','💶','This banknote is old.','Ин пули коғазӣ кӯҳна аст.','noun'),
      W('Purse','/pɜːs/','пёрс','Ҳамёни занона','👛','My purse is empty.','Ҳамёни ман холӣ аст.','noun'),
      W('Invoice','/ˈɪnvɔɪs/','инвойс','Фактура / ҳисобнома','🧾','Please send the invoice.','Лутфан фактураро фиристед.','noun'),
      W('Discount','/ˈdɪskaʊnt/','дискаунт','Тахфиф / арзонӣ','🏷️','They gave me a discount.','Онҳо ба ман тахфиф доданд.','noun'),
      W('Budget','/ˈbʌdʒɪt/','баҷет','Буҷа','📊','We have a small budget.','Мо буҷаи хурд дорем.','noun'),
      W('Currency','/ˈkʌrənsi/','каренси','Асъор / пул','💱','What currency do they use?','Онҳо кадом асъорро истифода мебаранд?','noun'),
      W('Wage','/weɪdʒ/','вейҷ','Музди корӣ','💰','The daily wage is fair.','Музди рӯзона одилона аст.','noun'),
      W('Worth','/wɜːθ/','вёрс','Арзиш дошта','💎','This ring is worth a lot.','Ин ангуштарин арзиши зиёд дорад.','adjective'),
    ]},
    { title: 'Lesson 2: Spending And Saving', tt: 'Дарси 2: Харҷ ва Пасандоз', emoji: '🏦', words: [
      W('Afford','/əˈfɔːd/','афорд','Аз ӯҳда баромадан (харид)','💸','I can\'t afford a new car.','Ман мошини навро харида наметавонам.','verb'),
      W('Owe','/əʊ/','оу','Қарздор будан','📉','You owe me ten somoni.','Ту ба ман даҳ сомонӣ қарздорӣ.','verb'),
      W('Borrow','/ˈbɒrəʊ/','бороу','Қарз гирифтан','🤲','Can I borrow your pen?','Метавонам ручкаатро қарз гирам?','verb'),
      W('Lend','/lend/','ленд','Қарз додан','🫴','She lent me some money.','Ӯ ба ман каме пул қарз дод.','verb'),
      W('Debt','/det/','дет','Қарз','⛓️','He is in debt.','Ӯ қарздор аст.','noun'),
      W('Tip','/tɪp/','тип','Чойпулӣ','🪙','We left a tip for the waiter.','Мо ба пешхизмат чойпулӣ мондем.','noun'),
      W('Fee','/fiː/','фи','Ҳаққи хизмат / пардохт','🧾','The entrance fee is small.','Ҳаққи вуруд кам аст.','noun'),
      W('Loan','/ləʊn/','лоун','Қарз (аз бонк)','🏦','They took a loan for the house.','Онҳо барои хона қарз гирифтанд.','noun'),
      W('Savings','/ˈseɪvɪŋz/','сейвингз','Пасандоз','🐖','I use my savings for travel.','Ман пасандозамро барои сафар истифода мебарам.','noun'),
      W('Wealthy','/ˈwelθi/','велси','Сарватманд / бой','🤑','Her family is wealthy.','Оилаи ӯ сарватманд аст.','adjective'),
    ]},
    { title: 'Lesson 3: At The Shop', tt: 'Дарси 3: Дар мағоза', emoji: '🛒', words: [
      W('Bargain','/ˈbɑːɡɪn/','баргин','Чизи арзон / савдо','🤝','This coat was a real bargain.','Ин пальто воқеан арзон буд.','noun'),
      W('Offer','/ˈɒfə/','офер','Таклиф / аксия','🔖','There is a special offer today.','Имрӯз таклифи махсус ҳаст.','noun'),
      W('Brand','/brænd/','брэнд','Тамға / бренд','®️','I like this brand of tea.','Ман ин бренди чойро дӯст медорам.','noun'),
      W('Queue','/kjuː/','кю','Навбат','🚶','There is a long queue.','Навбати дароз ҳаст.','noun'),
      W('Trolley','/ˈtrɒli/','троли','Аробачаи харид','🛒','Put it in the trolley.','Онро ба аробача мон.','noun'),
      W('Label','/ˈleɪbl/','лейбл','Тамға / нархнома','🏷️','Check the price on the label.','Нархро дар тамға бин.','noun'),
      W('Counter','/ˈkaʊntə/','каунтер','Пештахта','🧑‍💼','Pay at the counter over there.','Дар пештахтаи он ҷо пардохт кун.','noun'),
      W('Voucher','/ˈvaʊtʃə/','ваучер','Ваучер / купон','🎟️','I have a gift voucher.','Ман ваучери тӯҳфа дорам.','noun'),
      W('Secondhand','/ˌsekəndˈhænd/','секондҳэнд','Дасти дуюм / истифодашуда','🔁','I bought a secondhand bike.','Ман велосипеди дасти дуюм харидам.','adjective'),
      W('Refund','/ˈriːfʌnd/','рифанд','Баргардонидани пул','💵','They gave me a refund.','Онҳо пуламро баргардонданд.','noun'),
    ]},
    { title: 'Lesson 4: Services', tt: 'Дарси 4: Хидматҳо', emoji: '🛎️', words: [
      W('Order','/ˈɔːdə/','ордер','Фармоиш додан','📝','I want to order a pizza.','Ман мехоҳам пицца фармоиш диҳам.','verb'),
      W('Cancel','/ˈkænsl/','кэнсл','Бекор кардан','❌','I had to cancel the booking.','Ман маҷбур шудам фармоишро бекор кунам.','verb'),
      W('Complain','/kəmˈpleɪn/','комплейн','Шикоят кардан','😠','She complained about the food.','Ӯ аз хӯрок шикоят кард.','verb'),
      W('Guarantee','/ˌɡærənˈtiː/','гаранти','Кафолат','🛡️','The phone has a one-year guarantee.','Телефон кафолати яксола дорад.','noun'),
      W('Deposit','/dɪˈpɒzɪt/','депозит','Пешпардохт / амонат','🏧','You must pay a deposit.','Ту бояд пешпардохт кунӣ.','noun'),
      W('Withdraw','/wɪðˈdrɔː/','виздро','Пул гирифтан (аз бонк)','🏧','I need to withdraw some cash.','Ба ман каме пули нақд гирифтан лозим аст.','verb'),
      W('Transfer','/trænsˈfɜː/','трансфёр','Гузаронидан (пул)','🔄','Please transfer the money.','Лутфан пулро гузарон.','verb'),
      W('Exchange','/ɪksˈtʃeɪndʒ/','иксчейнҷ','Иваз кардан / мубодила','💱','Where can I exchange money?','Дар куҷо пул иваз карда метавонам?','verb'),
      W('Bill','/bɪl/','бил','Ҳисоб / чек (ресторан)','🧾','Can we have the bill, please?','Метавонем ҳисобро гирем?','noun'),
      W('Service','/ˈsɜːvɪs/','сёрвис','Хизматрасонӣ','🛎️','The service here is excellent.','Хизматрасонии ин ҷо аъло аст.','noun'),
    ]},
    { title: 'Lesson 5: Describing Value', tt: 'Дарси 5: Тавсифи арзиш', emoji: '💎', words: [
      W('Valuable','/ˈvæljuəbl/','валюебл','Пурарзиш / қиматбаҳо','💍','This is a valuable painting.','Ин расми пурарзиш аст.','adjective'),
      W('Luxury','/ˈlʌkʃəri/','лакшери','Боҳашамат / роҳат','🛥️','They stayed in a luxury hotel.','Онҳо дар меҳмонхонаи боҳашамат монданд.','adjective'),
      W('Affordable','/əˈfɔːdəbl/','афордебл','Дастрас (аз рӯи нарх)','👍','The prices are affordable.','Нархҳо дастрасанд.','adjective'),
      W('Reasonable','/ˈriːznəbl/','ризнебл','Мӯътадил / муносиб (нарх)','⚖️','The price is reasonable.','Нарх муносиб аст.','adjective'),
      W('Priceless','/ˈpraɪsləs/','прайслес','Бебаҳо','🏆','Family time is priceless.','Вақт бо оила бебаҳо аст.','adjective'),
      W('Worthless','/ˈwɜːθləs/','вёрслес','Беарзиш','🗑️','The old ticket is worthless now.','Чиптаи кӯҳна ҳоло беарзиш аст.','adjective'),
      W('Genuine','/ˈdʒenjuɪn/','ҷенюин','Аслӣ / ҳақиқӣ','✅','Is this a genuine watch?','Ин соати аслист?','adjective'),
      W('Fake','/feɪk/','фейк','Қалбакӣ / сохта','❌','Be careful of fake money.','Аз пули қалбакӣ эҳтиёт шав.','adjective'),
      W('Broke','/brəʊk/','броук','Бепул (муваққатан)','😅','I am broke until payday.','Ман то рӯзи маош бепулам.','adjective'),
      W('Costly','/ˈkɒstli/','костли','Гарон / пурхарҷ','💸','Repairs can be costly.','Таъмир метавонад пурхарҷ бошад.','adjective'),
    ]},
  ],
  grammar: [
    {
      lessonTitle: 'Lesson 6: Grammar — could (Ability & Requests)', lessonTitleTg: 'Дарси 6: Грамматика — could (қобилият ва хоҳиш)',
      title: 'could', titleTranslated: 'could — қобилияти гузашта ва хоҳиши боадабона', emoji: '🙏',
      explanation:
`**could** якчанд маъно дорад:
- **Қобилияти гузашта** (шакли гузаштаи can): *When I was young, I **could** run fast.* (Пеш метавонистам)
- **Хоҳиши боадабона:** ***Could** you help me, please?* (аз can боадабтар)
- **Пешниҳод/имкон:** *We **could** go to the cinema.* (Мо метавонем ба кино равем)

**could + феъли асосӣ** (бе to, бе -s). Манфӣ: **couldn't** (гузашта: наметавонистам).`,
      rules: [
        { pattern: 'could + феъли асосӣ', note: 'I could swim at five.' },
        { pattern: 'қобилияти гузашта = could', note: 'gузаштаи can' },
        { pattern: 'Could you...? — боадабона', note: 'Could you open the door?' },
        { pattern: "couldn't = наметавонист", note: "I couldn't sleep last night." },
      ],
      examples: [
        { sentence: 'When I was six, I could ride a bike.', translation: 'Вақте ман шашсола будам, велосипед ронда метавонистам.', highlight: 'could ride' },
        { sentence: 'Could you help me carry this?', translation: 'Метавонед ба ман инро бардоштан кӯмак кунед?', highlight: 'Could you' },
        { sentence: "I couldn't find my wallet.", translation: 'Ман ҳамёнамро ёфта натавонистам.', highlight: "couldn't find" },
        { sentence: 'We could pay by card if you like.', translation: 'Агар хоҳед, мо бо корт пардохта метавонем.', highlight: 'could pay' },
        { sentence: 'She could read when she was four.', translation: 'Ӯ дар чорсолагӣ хонда метавонист.', highlight: 'could read' },
      ],
      exercises: [
        { type:'choose', prompt:'When I was young, I ___ climb trees.', promptTranslated:'Вақте ҷавон будам, ба дарахтон баромада метавонистам.', options:['could','can','could to','am able'], answer:'could', explanation:'қобилияти гузашта → could.' },
        { type:'choose', prompt:'___ you pass me the salt, please?', promptTranslated:'Метавонед намакро диҳед?', options:['Could','Did','Was','Do'], answer:'Could', explanation:'хоҳиши боадабона → Could you.' },
        { type:'choose', prompt:'I ___ sleep last night, it was too hot.', promptTranslated:'Дишаб хоба рафта натавонистам.', options:["couldn't",'can','could','didn\'t could'], answer:"couldn't", explanation:'манфии гузашта → couldn\'t.' },
        { type:'choose', prompt:'She could ___ when she was four.', promptTranslated:'Ӯ дар чорсолагӣ хонда метавонист.', options:['read','reads','to read','reading'], answer:'read', explanation:'could + феъли асосӣ.' },
        { type:'fill_blank', prompt:'___ I have the bill, please? (боадабона)', promptTranslated:'Метавонам ҳисобро гирам?', answer:'Could', explanation:'Could I ...? — боадабона.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ту дар кӯдакӣ шино карда метавонистӣ?', options:['Could','swim','you','a','as','child'], answer:'Could you swim as a child?', explanation:'Could you swim as a child?' },
        { type:'transform', prompt:'Ба гузашта гардонед: I can drive.', promptTranslated:'қобилияти гузашта.', answer:'I could drive.', explanation:'can → could.' },
        { type:'transform', prompt:'Боадабтар созед: Help me.', promptTranslated:'бо Could you.', answer:'Could you help me?', explanation:'Could you + феъл.' },
      ],
    },
    {
      lessonTitle: 'Lesson 7: Grammar — would like / would rather', lessonTitleTg: 'Дарси 7: Грамматика — would like / would rather',
      title: 'would like / would rather', titleTranslated: 'would like (хоҳиш) / would rather (бартарӣ)', emoji: '🙂',
      explanation:
`- **would like (to)** = хоҳиши боадабона (аз "want" боадабтар): *I **would like** a coffee. She **would like to** travel.*
  Кӯтоҳ: **I'd like, he'd like**. Савол: *Would you like...?*
- **would rather** = бартарӣ додан (беҳтар мебинам): *I **would rather** stay home.* (аз рафтан беҳтар мебинам)
  Баъди would rather феъл **бе to** меояд: *I'd rather **walk** than drive.*`,
      rules: [
        { pattern: "would like + исм / to + феъл", note: "I'd like a tea. I'd like to go." },
        { pattern: 'Would you like...? — таклиф', note: 'Would you like some cake?' },
        { pattern: 'would rather + феъл (бе to)', note: "I'd rather stay." },
        { pattern: 'would rather ... than ...', note: 'I\'d rather walk than run.' },
      ],
      examples: [
        { sentence: 'I would like a cup of tea, please.', translation: 'Ман як пиёла чой мехоҳам.', highlight: 'would like' },
        { sentence: 'Would you like to come with us?', translation: 'Мехоҳед бо мо биёед?', highlight: 'Would you like' },
        { sentence: "I'd rather stay at home tonight.", translation: 'Ман имшаб дар хона монданро беҳтар мебинам.', highlight: "'d rather stay" },
        { sentence: "She'd like to learn Spanish.", translation: 'Ӯ мехоҳад испаниро омӯзад.', highlight: "'d like to learn" },
        { sentence: "I'd rather walk than take the bus.", translation: 'Ман пиёда рафтанро аз автобус беҳтар мебинам.', highlight: "rather walk than" },
      ],
      exercises: [
        { type:'choose', prompt:'I would ___ a glass of water.', promptTranslated:'Ман як стакан об мехоҳам.', options:['like','want','rather','to like'], answer:'like', explanation:'would like + исм.' },
        { type:'choose', prompt:'___ you like some coffee?', promptTranslated:'Каме қаҳва мехоҳед?', options:['Would','Do','Are','Will'], answer:'Would', explanation:'таклиф → Would you like.' },
        { type:'choose', prompt:'I would like ___ a new phone.', promptTranslated:'Ман мехоҳам телефони нав харам.', options:['to buy','buy','buying','bought'], answer:'to buy', explanation:'would like to + феъл.' },
        { type:'choose', prompt:'I\'d rather ___ at home.', promptTranslated:'Ман дар хона монданро беҳтар мебинам.', options:['stay','to stay','staying','stayed'], answer:'stay', explanation:'would rather + феъл бе to.' },
        { type:'fill_blank', prompt:'She would ___ to visit Paris. (хоҳиш)', promptTranslated:'Ӯ мехоҳад Парижро бинад.', answer:'like', explanation:'would like to.' },
        { type:'reorder', prompt:'Ҷумларо сохт кунед:', promptTranslated:'Ман чой нӯшиданро аз қаҳва беҳтар мебинам.', options:['I\'d','tea','rather','than','drink','coffee'], answer:"I'd rather drink tea than coffee.", explanation:"I'd rather drink tea than coffee." },
        { type:'transform', prompt:'Боадабтар созед: I want a sandwich.', promptTranslated:'бо would like.', answer:'I would like a sandwich.', explanation:'want → would like.' },
        { type:'transform', prompt:'Ислоҳ кунед: I would rather to stay.', promptTranslated:'would rather бе to.', answer:'I would rather stay.', explanation:'would rather + феъл бе to.' },
      ],
    },
  ],
  listening: {
    lessonTitle: 'Lesson 8: Listening — At the Bank', lessonTitleTg: 'Дарси 8: Шунавоӣ — Дар бонк',
    title: 'At the Bank', titleTranslated: 'Дар бонк', emoji: '🏦',
    passage: 'Farhod goes to the bank to sort out some money problems. He would like to withdraw some cash and also transfer money to his brother. The clerk is very polite. "Could you show me your passport, please?" she asks. Farhod also wants to open a savings account. The clerk explains that there is a small fee, but no monthly cost. Farhod is careful with his budget, so he asks many questions. "Could I get a bank card too?" he asks. "Of course," says the clerk. In the end, Farhod is happy because the service was quick and the staff were friendly.',
    passageTranslated: 'Фарҳод ба бонк меравад, то якчанд масъалаи пулиро ҳал кунад. Ӯ мехоҳад каме пули нақд гирад ва инчунин ба бародараш пул гузаронад. Корманд хеле боадаб аст. «Метавонед шиносномаатонро нишон диҳед?» мепурсад ӯ. Фарҳод инчунин мехоҳад ҳисоби пасандоз кушояд. Корманд шарҳ медиҳад, ки ҳаққи хизмати хурд ҳаст, вале хароҷоти моҳона нест. Фарҳод бо буҷааш эҳтиёткор аст, бинобар ин саволҳои зиёд медиҳад. «Метавонам корти бонкӣ ҳам гирам?» мепурсад ӯ. «Албатта», мегӯяд корманд. Дар охир Фарҳод хушҳол аст, зеро хизматрасонӣ зуд ва кормандон дӯстона буданд.',
    questions: [
      { question:'Why does Farhod go to the bank?', questionTranslated:'Чаро Фарҳод ба бонк меравад?', options:['To sort out money problems','To get a job','To meet a friend'], correctIndex:0, explanation:'to sort out some money problems.' },
      { question:'What does he want to do first?', questionTranslated:'Ӯ аввал чӣ кор кардан мехоҳад?', options:['Withdraw cash and transfer money','Buy a car','Complain'], correctIndex:0, explanation:'withdraw some cash and also transfer money.' },
      { question:'What does the clerk ask for?', questionTranslated:'Корманд чиро мепурсад?', options:['His passport','His car','His phone'], correctIndex:0, explanation:'Could you show me your passport?' },
      { question:'What kind of account does he open?', questionTranslated:'Ӯ кадом ҳисобро мекушояд?', options:['A savings account','A business account','No account'], correctIndex:0, explanation:'open a savings account.' },
      { question:'Why is Farhod happy?', questionTranslated:'Чаро Фарҳод хушҳол аст?', options:['The service was quick and staff friendly','It was free','He got a loan'], correctIndex:0, explanation:'the service was quick and the staff were friendly.' },
    ],
  },
  dialogue: {
    lessonTitle: 'Lesson 9: Speaking — Shopping For Clothes', lessonTitleTg: 'Дарси 9: Гуфтугӯ — Хариди либос',
    title: 'Shopping For Clothes', titleTranslated: 'Хариди либос', emoji: '🛍️',
    scenario: 'Харидор дар мағозаи либос бо фурӯшанда сӯҳбат мекунад ва нарху тахфифро мепурсад.',
    lines: [
      { speaker:'Assistant', text:'Hello! Can I help you?', translation:'Салом! Кӯмак кунам?', isUser:false },
      { speaker:'You', text:'Yes, I would like to try on this jacket.', translation:'Бале, ман мехоҳам ин курткаро пӯшида бинам.', isUser:true },
      { speaker:'Assistant', text:'Of course. It is on sale, with a 20% discount.', translation:'Албатта. Он дар фурӯши арзон бо тахфифи 20% аст.', isUser:false },
      { speaker:'You', text:'Great! Could you tell me the final price?', translation:'Аъло! Метавонед нархи ниҳоиро гӯед?', isUser:true },
      { speaker:'Assistant', text:'It is now 160 somoni instead of 200.', translation:'Ҳоло ба ҷои 200, 160 сомонӣ аст.', isUser:false },
      { speaker:'You', text:'That is reasonable. Could I pay by card?', translation:'Ин муносиб аст. Метавонам бо корт пардохт кунам?', isUser:true },
      { speaker:'Assistant', text:'Yes, and keep the receipt for a refund if needed.', translation:'Бале, ва чекро барои баргардонидан нигоҳ доред.', isUser:false },
      { speaker:'You', text:'Thank you. I would rather take it now.', translation:'Ташаккур. Ман беҳтар мебинам ҳозир гирам.', isUser:true },
    ],
  },
  reading: {
    lessonTitle: 'Lesson 10: Reading — Being Careful With Money', lessonTitleTg: 'Дарси 10: Хониш — Эҳтиёткорӣ бо пул',
    title: 'Being Careful With Money', titleTranslated: 'Эҳтиёткорӣ бо пул', emoji: '💰',
    passage: 'Managing money well is an important life skill. Some people spend everything they earn and have no savings, while others plan a budget carefully. A good idea is to save a small amount each month. You should never borrow more than you can afford to pay back, because debt can grow quickly. When you shop, look for a bargain or a discount, but be careful: a cheap product is not always good value. Sometimes it is better to buy one valuable thing than many worthless ones. If you want to be free from money worries, spend less than you earn and keep some savings for the future.',
    passageTranslated: 'Идораи хуби пул малакаи муҳими ҳаётӣ аст. Баъзе одамон ҳар чизеро, ки кор мекунанд, харҷ мекунанд ва пасандоз надоранд, дар ҳоле ки дигарон буҷаро бодиққат ба нақша мегиранд. Фикри хуб ин аст, ки ҳар моҳ маблағи ками пасандоз кунӣ. Ту ҳеҷ гоҳ набояд бештар аз он ки баргардонида метавонӣ, қарз гирӣ, зеро қарз зуд калон мешавад. Ҳангоми харид, чизи арзон ё тахфиф ҷустуҷӯ кун, вале эҳтиёт шав: маҳсули арзон ҳамеша арзиши хуб надорад. Баъзан беҳтар аст, ки як чизи пурарзишро харӣ, назар ба бисёр чизҳои беарзиш. Агар мехоҳӣ аз ташвишҳои пулӣ озод бошӣ, камтар аз даромадат харҷ кун ва барои оянда каме пасандоз нигоҳ дор.',
    questions: [
      { question:'What is a good idea with money?', questionTranslated:'Бо пул фикри хуб чист?', options:['Save a small amount each month','Spend everything','Never work'], correctIndex:0, explanation:'save a small amount each month.' },
      { question:'Why shouldn\'t you borrow too much?', questionTranslated:'Чаро набояд бисёр қарз гирӣ?', options:['Debt can grow quickly','It is illegal','Banks are closed'], correctIndex:0, explanation:'debt can grow quickly.' },
      { question:'Is a cheap product always good value?', questionTranslated:'Маҳсули арзон ҳамеша арзиши хуб дорад?', options:['No, not always','Yes, always','Only in sales'], correctIndex:0, explanation:'a cheap product is not always good value.' },
      { question:'What is sometimes better?', questionTranslated:'Баъзан чӣ беҳтар аст?', options:['Buy one valuable thing','Buy many cheap things','Buy nothing'], correctIndex:0, explanation:'better to buy one valuable thing.' },
      { question:'How can you be free from money worries?', questionTranslated:'Чӣ тавр аз ташвиши пулӣ озод шудан мумкин?', options:['Spend less than you earn and save','Borrow more','Spend everything'], correctIndex:0, explanation:'spend less than you earn and keep some savings.' },
    ],
  },
  review: {
    passage: 'Malika wanted to buy a laptop for her studies. She looked in many shops to find a bargain. In one shop, the price was 4000 somoni, which she could not afford. She would rather wait than borrow money and go into debt. A week later, she found the same laptop on sale with a big discount. It was now affordable, so she was very happy. She paid part in cash and part by card. The shop gave her a receipt and a two-year guarantee. Malika learned an important lesson: if you are patient and careful with your budget, you can find good value and avoid money problems.',
    passageTranslated: 'Малика мехост барои таҳсилаш ноутбук харад. Ӯ дар бисёр мағозаҳо чизи арзон ҷустуҷӯ кард. Дар як мағоза нарх 4000 сомонӣ буд, ки ӯ аз ӯҳдааш намебаромад. Ӯ беҳтар медид, ки интизор шавад, назар ба он ки пул қарз гирад ва қарздор шавад. Пас аз як ҳафта, ӯ ҳамон ноутбукро дар фурӯши арзон бо тахфифи калон ёфт. Он ҳоло дастрас буд, бинобар ин ӯ хеле хушҳол шуд. Ӯ як қисмро бо пули нақд ва як қисмро бо корт пардохт. Мағоза ба ӯ чек ва кафолати дусола дод. Малика дарси муҳим омӯхт: агар босабр ва бо буҷаат эҳтиёткор бошӣ, метавонӣ арзиши хуб ёбӣ ва аз мушкилоти пулӣ дурӣ ҷӯӣ.',
    questions: [
      { question:'What did Malika want to buy?', questionTranslated:'Малика чӣ харидан мехост?', options:['A laptop','A car','A phone'], correctIndex:0, explanation:'wanted to buy a laptop.' },
      { question:'Why couldn\'t she buy it at first?', questionTranslated:'Чаро аввал харида натавонист?', options:['She could not afford it','It was sold out','It was fake'], correctIndex:0, explanation:'which she could not afford.' },
      { question:'What did she prefer to do?', questionTranslated:'Ӯ чӣ карданро беҳтар дид?', options:['Wait rather than borrow','Borrow money','Give up'], correctIndex:0, explanation:'She would rather wait than borrow money.' },
      { question:'What did the shop give her?', questionTranslated:'Мағоза ба ӯ чӣ дод?', options:['A receipt and a guarantee','A free gift','Nothing'], correctIndex:0, explanation:'a receipt and a two-year guarantee.' },
      { question:'What lesson did she learn?', questionTranslated:'Ӯ кадом дарсро омӯхт?', options:['Be patient and careful with money','Spend fast','Borrow a lot'], correctIndex:0, explanation:'if you are patient and careful with your budget.' },
    ],
  },
  exam: {
    passage: 'Money is an important part of life, but knowing how to use it wisely is a skill that takes time to learn. Young people especially should understand some basic rules. First, always keep a budget so you know how much you can spend. Second, try to save regularly; even a small amount grows over time. Third, be a smart shopper: compare prices, look for discounts, and do not buy things you do not need. It is often better to wait for a sale than to pay full price. You should also be careful with loans and credit, because debt can become a heavy burden. If people learn these habits early, they will have fewer money worries and more freedom in the future.',
    passageTranslated: 'Пул қисми муҳими ҳаёт аст, вале донистани оқилона истифода бурдани он малакаест, ки барои омӯхтанаш вақт лозим аст. Махсусан ҷавонон бояд якчанд қоидаи асосиро фаҳманд. Аввал, ҳамеша буҷа нигоҳ дор, то донӣ, ки чӣ қадар харҷ карда метавонӣ. Дуюм, кӯшиш кун мунтазам пасандоз кунӣ; ҳатто маблағи кам бо мурури вақт калон мешавад. Сеюм, харидори доно бош: нархҳоро муқоиса кун, тахфиф ҷӯй ва чизҳоеро, ки лозим надорӣ, нахар. Аксаран беҳтар аст, ки интизори фурӯши арзон шавӣ, назар ба он ки нархи пурраро пардозӣ. Ту инчунин бо қарзҳо эҳтиёткор бош, зеро қарз метавонад бори вазнин шавад. Агар одамон ин одатҳоро барвақт омӯзанд, дар оянда ташвишҳои пулии камтар ва озодии бештар хоҳанд дошт.',
    questions: [
      { question:'Why keep a budget?', questionTranslated:'Чаро буҷа нигоҳ дорем?', options:['To know how much you can spend','To look rich','To pay more'], correctIndex:0, explanation:'keep a budget so you know how much you can spend.' },
      { question:'What happens to small savings over time?', questionTranslated:'Пасандози кам бо вақт чӣ мешавад?', options:['It grows','It disappears','It stays the same'], correctIndex:0, explanation:'even a small amount grows over time.' },
      { question:'What does a smart shopper do?', questionTranslated:'Харидори доно чӣ мекунад?', options:['Compares prices and looks for discounts','Buys everything','Never shops'], correctIndex:0, explanation:'compare prices, look for discounts.' },
      { question:'Why be careful with loans?', questionTranslated:'Чаро бо қарз эҳтиёткор бошем?', options:['Debt can become a heavy burden','Loans are illegal','Banks are bad'], correctIndex:0, explanation:'debt can become a heavy burden.' },
      { question:'What is the benefit of good habits?', questionTranslated:'Фоидаи одатҳои хуб чист?', options:['Fewer money worries and more freedom','More debt','Less money'], correctIndex:0, explanation:'fewer money worries and more freedom in the future.' },
    ],
  },
};

await buildModule(M);
await refreshExisting();
await bumpVersion();
await done();
console.log('✅ Модули 13 тайёр.');
