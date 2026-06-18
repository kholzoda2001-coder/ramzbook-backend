// seed_english_b1_fill.js — пур кардани 27 дарси ХОЛИИ англисии B1
const https = require('https');
const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const COURSE = 'cmptwmtt90001ik413zh4773p';

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({ hostname: 'admin.ramz.tj', path: p, method,
      headers: { 'x-admin-api-key': KEY, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}) } }, res => {
      let d = Buffer.alloc(0); res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e){ resolve(d.toString('utf8')); } });
    });
    req.on('error', reject); if (payload) req.write(payload); req.end();
  });
}

const C = {
  'Гузаштаи давомдор': [
    {w:'was/were + -ing',t:'сохти гузаштаи давомдор',e:'🔧',ex:'I was cooking when you called.',exT:'Вақте занг задӣ, ман мепухтам.'},
    {w:'I was working all morning.',t:'Тамоми субҳ кор карда истода будам.',e:'💼',ex:'I was working all morning.',exT:'Тамоми субҳ кор карда истода будам.'},
    {w:'They were waiting for the bus.',t:'Мунтазири автобус буданд.',e:'🚏',ex:'They were waiting for the bus.',exT:'Онҳо мунтазири автобус буданд.'},
    {w:'What were you doing at 8?',t:'Соати 8 чӣ кор мекардӣ?',e:'❓',ex:'What were you doing at 8?',exT:'Соати 8 чӣ кор карда истода будӣ?'},
    {w:'She was reading while I cooked.',t:'Вай мехонд, вақте ман мепухтам.',e:'📖',ex:'She was reading while I cooked.',exT:'Вай мехонд, вақте ман мепухтам.'},
    {w:'background action',t:'амали заминавӣ',e:'🎬',ex:'background action',exT:'амали давомдори заминавӣ'},
    {w:'It was getting dark.',t:'Торик шуда истода буд.',e:'🌆',ex:'It was getting dark.',exT:'Торик шуда истода буд.'},
    {w:'We were having dinner.',t:'Мо хӯроки шом мехӯрдем.',e:'🍽️',ex:'We were having dinner.',exT:'Мо хӯроки шом мехӯрда истода будем.'},
  ],
  'When / While': [
    {w:'when (амали кӯтоҳ)',t:'вақте ки',e:'⏰',ex:'When she arrived, I was sleeping.',exT:'Вақте вай расид, ман хоб будам.'},
    {w:'while (амали дароз)',t:'дар ҳоле ки',e:'⏳',ex:'While I was sleeping, she arrived.',exT:'Дар ҳоле ки хоб будам, вай расид.'},
    {w:'when + past simple',t:'вақте + гузаштаи содда',e:'🔧',ex:'when the phone rang',exT:'вақте телефон занг зад'},
    {w:'while + past continuous',t:'дар ҳоле ки + давомдор',e:'🔧',ex:'while I was cooking',exT:'дар ҳоле ки мепухтам'},
    {w:'I was reading when he came.',t:'Вақте ӯ омад, ман мехондам.',e:'📖',ex:'I was reading when he came.',exT:'Вақте ӯ омад, ман мехондам.'},
    {w:'While we talked, it rained.',t:'Вақте гап мезадем, борон борид.',e:'🌧️',ex:'While we talked, it rained.',exT:'Дар ҳоле ки гап мезадем, борон борид.'},
    {w:'as',t:'ҳамчун / вақте',e:'🔗',ex:'as I left',exT:'вақте ки рафтам'},
    {w:'at that moment',t:'дар он лаҳза',e:'⏱️',ex:'at that moment',exT:'дар он лаҳза'},
  ],
  'Хониш: Сафари фаромӯшнашаванда': [
    {w:'Last year I traveled to Turkey.',t:'Соли гузашта ба Туркия сафар кардам.',e:'🇹🇷',ex:'Last year I traveled to Turkey.',exT:'Соли гузашта ба Туркия сафар кардам.'},
    {w:'It was an amazing experience.',t:'Таҷрибаи аҷоиб буд.',e:'🌟',ex:'It was an amazing experience.',exT:'Таҷрибаи аҷоиб буд.'},
    {w:'While I was walking, I met a family.',t:'Вақте қадам мезадам, бо як оила вохӯрдам.',e:'👨‍👩‍👧',ex:'While I was walking in Istanbul, I met a local family.',exT:'Вақте дар Истанбул қадам мезадам, бо оилаи маҳаллӣ вохӯрдам.'},
    {w:'They invited me for dinner.',t:'Маро ба хӯроки шом даъват карданд.',e:'🍽️',ex:'They invited me for dinner.',exT:'Маро ба хӯроки шом даъват карданд.'},
    {w:'The food was delicious.',t:'Хӯрок болаззат буд.',e:'😋',ex:'The food was delicious.',exT:'Хӯрок болаззат буд.'},
    {w:'We talked for hours.',t:'Соатҳо гап задем.',e:'🗣️',ex:'We talked for hours.',exT:'Соатҳо гап задем.'},
    {w:'I will never forget that day.',t:'Он рӯзро ҳеҷ гоҳ фаромӯш намекунам.',e:'💭',ex:'I will never forget that day.',exT:'Он рӯзро ҳеҷ гоҳ фаромӯш намекунам.'},
    {w:'Travel changes you.',t:'Сафар туро тағйир медиҳад.',e:'✈️',ex:'Travel changes you.',exT:'Сафар туро тағйир медиҳад.'},
  ],
  'Ҳозираи комили давомдор': [
    {w:'have/has been + -ing',t:'сохти present perfect continuous',e:'🔧',ex:'I have been working.',exT:'Ман кор карда истодаам.'},
    {w:'I have been studying for two hours.',t:'Ду соат боз дарс мехонам.',e:'📚',ex:'I have been studying for two hours.',exT:'Ду соат боз дарс хонда истодаам.'},
    {w:'She has been waiting since morning.',t:'Аз субҳ боз интизор аст.',e:'⏳',ex:'She has been waiting since morning.',exT:'Вай аз субҳ боз интизор аст.'},
    {w:'How long have you been here?',t:'Чанд вақт боз ин ҷоӣ?',e:'❓',ex:'How long have you been here?',exT:'Чанд вақт боз ин ҷоӣ?'},
    {w:'for / since',t:'муддат / аз',e:'⏱️',ex:'for an hour / since 9',exT:'як соат боз / аз соати 9'},
    {w:'It has been raining all day.',t:'Тамоми рӯз борон борида истодааст.',e:'🌧️',ex:'It has been raining all day.',exT:'Тамоми рӯз борон борида истодааст.'},
    {w:'They have been living here for years.',t:'Солҳо боз ин ҷо зиндагӣ мекунанд.',e:'🏠',ex:'They have been living here for years.',exT:'Солҳо боз ин ҷо зиндагӣ мекунанд.'},
    {w:'recent activity',t:'фаъолияти наздик/давомдор',e:'🔄',ex:'recent activity',exT:'фаъолияти наздику давомдор'},
  ],
  'Just / Already / Yet': [
    {w:'just',t:'навакак',e:'⚡',ex:'I have just finished.',exT:'Навакак тамом кардам.'},
    {w:'already',t:'аллакай',e:'✅',ex:'She has already left.',exT:'Вай аллакай рафт.'},
    {w:'yet (савол/инкор)',t:'ҳанӯз',e:'⏳',ex:'Have you finished yet?',exT:'Ҳанӯз тамом кардӣ?'},
    {w:'not yet',t:'ҳанӯз не',e:'🚫',ex:"I haven't eaten yet.",exT:'Ман ҳанӯз нахӯрдаам.'},
    {w:'I have just arrived.',t:'Навакак расидам.',e:'🚶',ex:'I have just arrived.',exT:'Навакак расидам.'},
    {w:'He has already seen it.',t:'Вай аллакай дидааст.',e:'👁️',ex:'He has already seen it.',exT:'Вай аллакай дидааст.'},
    {w:'Are we there yet?',t:'Расидем?',e:'❓',ex:'Are we there yet?',exT:'Ҳоло расидем?'},
    {w:'still',t:'ҳанӯз ҳам',e:'🔁',ex:"I still don't know.",exT:'Ман ҳанӯз ҳам намедонам.'},
  ],
  'Used to': [
    {w:'used to',t:'пештар … мекард',e:'⏮️',ex:'I used to play football.',exT:'Пештар футбол бозӣ мекардам.'},
    {w:'I used to live in a village.',t:'Пештар дар деҳа зиндагӣ мекардам.',e:'🏡',ex:'I used to live in a village.',exT:'Пештар дар деҳа зиндагӣ мекардам.'},
    {w:'She used to smoke.',t:'Вай пештар тамоку мекашид.',e:'🚬',ex:'She used to smoke.',exT:'Вай пештар тамоку мекашид.'},
    {w:"didn't use to",t:'пештар намекард',e:'🚫',ex:"I didn't use to like tea.",exT:'Пештар чойро дӯст намедоштам.'},
    {w:'Did you use to…?',t:'пештар … мекардӣ?',e:'❓',ex:'Did you use to study here?',exT:'Пештар ин ҷо мехондӣ?'},
    {w:'past habit',t:'одати гузашта',e:'🔄',ex:'a past habit',exT:'одати гузашта'},
    {w:'We used to be friends.',t:'Мо пештар дӯст будем.',e:'👥',ex:'We used to be friends.',exT:'Мо пештар дӯст будем.'},
    {w:'things that changed',t:'чизҳое ки тағйир ёфтанд',e:'🔀',ex:'things that changed',exT:'чизҳое ки тағйир ёфтанд'},
  ],
  'Шарти якум': [
    {w:'If + present, will',t:'сохти шарти якум',e:'🔧',ex:'If it rains, I will stay home.',exT:'Агар борон борад, дар хона мемонам.'},
    {w:'If you study, you will pass.',t:'Агар хонӣ, мегузарӣ.',e:'📚',ex:'If you study, you will pass.',exT:'Агар хонӣ, мегузарӣ.'},
    {w:'real future condition',t:'шарти воқеии оянда',e:'✅',ex:'a real condition',exT:'шарти имконпазир'},
    {w:'unless',t:'агар … на',e:'⚠️',ex:"Unless you hurry, you'll be late.",exT:'Агар шитоб накунӣ, дер мекунӣ.'},
    {w:'I will call you if I have time.',t:'Агар вақт дошта бошам, занг мезанам.',e:'📞',ex:'I will call you if I have time.',exT:'Агар вақт дошта бошам, занг мезанам.'},
    {w:'What will you do if…?',t:'Агар … чӣ мекунӣ?',e:'❓',ex:'What will you do if it rains?',exT:'Агар борон борад, чӣ мекунӣ?'},
    {w:'as soon as',t:'ҳамин ки',e:'⚡',ex:'as soon as I arrive',exT:'ҳамин ки расам'},
    {w:'When I finish, I will rest.',t:'Вақте тамом кунам, истироҳат мекунам.',e:'😌',ex:'When I finish, I will rest.',exT:'Вақте тамом кунам, истироҳат мекунам.'},
  ],
  'Шарти дуюм': [
    {w:'If + past, would',t:'сохти шарти дуюм',e:'🔧',ex:'If I had money, I would travel.',exT:'Агар пул мебуд, сафар мекардам.'},
    {w:'imaginary / unreal',t:'хаёлӣ / ғайривоқеӣ',e:'💭',ex:'an unreal situation',exT:'вазъи ғайривоқеӣ'},
    {w:'If I were you, I would…',t:'Агар ҷои ту мебудам, …',e:'🔄',ex:'If I were you, I would rest.',exT:'Агар ҷои ту мебудам, истироҳат мекардам.'},
    {w:'I would buy a car if I were rich.',t:'Агар бой мебудам, мошин мехаридам.',e:'🚗',ex:'I would buy a car if I were rich.',exT:'Агар бой мебудам, мошин мехаридам.'},
    {w:'What would you do if…?',t:'Агар … чӣ мекардӣ?',e:'❓',ex:'What would you do if you won?',exT:'Агар бурдӣ, чӣ мекардӣ?'},
    {w:'would',t:'мекард (шартӣ)',e:'🔮',ex:'I would go.',exT:'Ман мерафтам.'},
    {w:'If she knew, she would help.',t:'Агар медонист, кӯмак мекард.',e:'🤝',ex:'If she knew, she would help.',exT:'Агар медонист, кӯмак мекард.'},
    {w:'dreams',t:'орзуҳо',e:'⭐',ex:'dreams and wishes',exT:'орзую хоҳишҳо'},
  ],
  'Ҷумлаҳои нисбӣ': [
    {w:'who',t:'ки (одам)',e:'👤',ex:'the woman who works here',exT:'занеро ки ин ҷо кор мекунад'},
    {w:'which',t:'ки (ашё)',e:'📦',ex:'the book which I bought',exT:'китобе ки харидам'},
    {w:'that',t:'ки',e:'🔗',ex:'the house that we saw',exT:'хонае ки дидем'},
    {w:'whose',t:'ки азони он',e:'❓',ex:'the man whose son is a doctor',exT:'марде ки писараш духтур'},
    {w:'where',t:'ки дар он ҷо',e:'📍',ex:'the place where we met',exT:'ҷое ки вохӯрдем'},
    {w:'defining clause',t:'ҷумлаи муайянкунанда',e:'🎯',ex:'a defining clause',exT:'ҷумлаи муайянкунанда'},
    {w:'The teacher who helped us.',t:'Муаллиме ки ба мо кӯмак кард.',e:'👩‍🏫',ex:'The teacher who helped us.',exT:'Муаллиме ки ба мо кӯмак кард.'},
    {w:'non-defining (, which …)',t:'ҷумлаи иловагӣ (бо вергул)',e:'➕',ex:'My car, which is old, broke down.',exT:'Мошини ман, ки кӯҳна аст, вайрон шуд.'},
  ],
  'As … as': [
    {w:'as … as',t:'ба андозаи …',e:'⚖️',ex:'He is as tall as me.',exT:'Вай ба андозаи ман баланд.'},
    {w:'as big as',t:'ба андозаи калон',e:'📏',ex:'as big as a house',exT:'ба андозаи хона калон'},
    {w:'not as … as',t:'на ба андозаи',e:'🚫',ex:"It's not as cold as yesterday.",exT:'Ин ба андозаи дирӯз хунук нест.'},
    {w:'as soon as possible',t:'ҳарчи зудтар',e:'⚡',ex:'as soon as possible',exT:'ҳарчи зудтар'},
    {w:'as much as',t:'ба қадри',e:'💧',ex:'as much as you want',exT:'ба қадри хоҳишат'},
    {w:'the same as',t:'баробар бо / ҳамчун',e:'🟰',ex:'the same as mine',exT:'ҳамчун азони ман'},
    {w:'as good as',t:'ба қадри хуб',e:'👍',ex:'as good as new',exT:'ба қадри нав хуб'},
    {w:'comparison of equality',t:'муқоисаи баробарӣ',e:'⚖️',ex:'comparison of equality',exT:'муқоисаи баробарӣ'},
  ],
  'Мафъул (ҳозира)': [
    {w:'is/are + past participle',t:'сохти мафъули ҳозира',e:'🔧',ex:'English is spoken here.',exT:'Ин ҷо англисӣ гап зада мешавад.'},
    {w:'The room is cleaned every day.',t:'Ҳуҷра ҳаррӯза тоза карда мешавад.',e:'🧹',ex:'The room is cleaned every day.',exT:'Ҳуҷра ҳаррӯза тоза карда мешавад.'},
    {w:'It is made in China.',t:'Дар Чин сохта мешавад.',e:'🏭',ex:'It is made in China.',exT:'Дар Чин сохта мешавад.'},
    {w:'by',t:'аз тарафи',e:'👉',ex:'The book is written by him.',exT:'Китоб аз тарафи ӯ навишта шудааст.'},
    {w:'passive voice',t:'феъли мафъул',e:'📝',ex:'passive voice',exT:'феъли мафъул'},
    {w:'Tea is grown in India.',t:'Чой дар Ҳиндустон парвариш меёбад.',e:'🍵',ex:'Tea is grown in India.',exT:'Чой дар Ҳиндустон парвариш меёбад.'},
    {w:'Cars are sold here.',t:'Мошинҳо ин ҷо фурӯхта мешаванд.',e:'🚗',ex:'Cars are sold here.',exT:'Мошинҳо ин ҷо фурӯхта мешаванд.'},
    {w:'is used',t:'истифода мешавад',e:'⚙️',ex:'It is used every day.',exT:'Он ҳаррӯза истифода мешавад.'},
  ],
  'Мафъул (гузашта)': [
    {w:'was/were + past participle',t:'сохти мафъули гузашта',e:'🔧',ex:'The house was built in 2000.',exT:'Хона соли 2000 сохта шуд.'},
    {w:'It was made by hand.',t:'Бо даст сохта шуд.',e:'✋',ex:'It was made by hand.',exT:'Бо даст сохта шуд.'},
    {w:'The letter was sent yesterday.',t:'Нома дирӯз фиристода шуд.',e:'✉️',ex:'The letter was sent yesterday.',exT:'Нома дирӯз фиристода шуд.'},
    {w:'They were invited.',t:'Онҳо даъват карда шуданд.',e:'🎉',ex:'They were invited.',exT:'Онҳо даъват карда шуданд.'},
    {w:'was discovered',t:'кашф карда шуд',e:'🔍',ex:'America was discovered in 1492.',exT:'Амрико соли 1492 кашф шуд.'},
    {w:'The window was broken.',t:'Тиреза шикаста шуд.',e:'🪟',ex:'The window was broken.',exT:'Тиреза шикаста шуд.'},
    {w:'was built',t:'сохта шуд',e:'🏗️',ex:'It was built long ago.',exT:'Кайҳо сохта шуд.'},
    {w:'past passive',t:'мафъули гузашта',e:'📝',ex:'past passive',exT:'мафъули гузашта'},
  ],
  'Хониш: Технология дар ҳаёти ман': [
    {w:'Technology is part of my life.',t:'Технология қисми ҳаёти ман аст.',e:'📱',ex:'Technology is part of my life.',exT:'Технология қисми ҳаёти ман аст.'},
    {w:'I use my phone every day.',t:'Ҳаррӯза телефонамро истифода мебарам.',e:'📲',ex:'I use my phone every day.',exT:'Ҳаррӯза телефонамро истифода мебарам.'},
    {w:'Many things are done online now.',t:'Ҳоло бисёр кор онлайн анҷом дода мешавад.',e:'💻',ex:'Many things are done online now.',exT:'Ҳоло бисёр кор онлайн анҷом дода мешавад.'},
    {w:'I have been learning online for a year.',t:'Як сол боз онлайн меомӯзам.',e:'🎓',ex:'I have been learning online for a year.',exT:'Як сол боз онлайн меомӯзам.'},
    {w:'The internet is used by everyone.',t:'Интернетро ҳама истифода мебаранд.',e:'🌐',ex:'The internet is used by everyone.',exT:'Интернетро ҳама истифода мебаранд.'},
    {w:'But we should be careful.',t:'Вале бояд эҳтиёткор бошем.',e:'⚠️',ex:'But we should be careful.',exT:'Вале бояд эҳтиёткор бошем.'},
    {w:'Too much screen time is bad.',t:'Вақти зиёд дар экран зарар аст.',e:'📵',ex:'Too much screen time is bad.',exT:'Вақти зиёд дар назди экран зарар аст.'},
    {w:'Balance is important.',t:'Мувозинат муҳим аст.',e:'⚖️',ex:'Balance is important.',exT:'Мувозинат муҳим аст.'},
  ],
  'Нақли қавл': [
    {w:'He said (that)…',t:'Вай гуфт ки…',e:'💬',ex:'He said that he was busy.',exT:'Вай гуфт ки серкор аст.'},
    {w:'She told me…',t:'Вай ба ман гуфт…',e:'👉',ex:'She told me the news.',exT:'Вай ба ман хабарро гуфт.'},
    {w:'present → past',t:'тағйири замон',e:'🔄',ex:'am → was, will → would',exT:'ҳозира ба гузашта мегузарад'},
    {w:'"I am tired" → He said he was tired.',t:'мустақим → нақлӣ',e:'📝',ex:'He said he was tired.',exT:'Вай гуфт ки хаста аст.'},
    {w:'He said he would come.',t:'Гуфт ки меояд.',e:'🚶',ex:'He said he would come.',exT:'Вай гуфт ки меояд.'},
    {w:'asked',t:'пурсид',e:'❓',ex:'She asked where I lived.',exT:'Вай пурсид ки ман куҷо зиндагӣ мекунам.'},
    {w:'told me to…',t:'фармуд ки…',e:'☝️',ex:'He told me to wait.',exT:'Вай фармуд ки интизор шавам.'},
    {w:'direct vs reported',t:'мустақим ва нақлӣ',e:'🔀',ex:'direct vs reported speech',exT:'нутқи мустақим ва нақлӣ'},
  ],
  'Саволчаҳои иловагӣ': [
    {w:"isn't it?",t:'ҳамин тавр не? (бо is)',e:'❓',ex:"It's cold, isn't it?",exT:'Хунук аст, ҳамин тавр не?'},
    {w:"don't you?",t:'ҳамин тавр не? (бо do)',e:'❓',ex:'You like tea, don\'t you?',exT:'Чой дӯст медорӣ, ҳамин тавр не?'},
    {w:"aren't you?",t:'ҳамин тавр не? (бо are)',e:'❓',ex:"You are ready, aren't you?",exT:'Тайёрӣ, ҳамин тавр не?'},
    {w:"didn't he?",t:'ҳамин тавр не? (гузашта)',e:'❓',ex:"He came, didn't he?",exT:'Вай омад, ҳамин тавр не?'},
    {w:'positive → negative tag',t:'мусбат → саволчаи манфӣ',e:'🔄',ex:'You can, can\'t you?',exT:'Метавонӣ, ҳамин тавр не?'},
    {w:"can't you?",t:'ҳамин тавр не? (бо can)',e:'❓',ex:"You can swim, can't you?",exT:'Шино карда метавонӣ, не?'},
    {w:"won't you?",t:'ҳамин тавр не? (бо will)',e:'❓',ex:"You'll help, won't you?",exT:'Кӯмак мекунӣ, ҳамин тавр не?'},
    {w:'confirmation',t:'тасдиқ хостан',e:'✔️',ex:'asking for confirmation',exT:'тасдиқ хостан'},
  ],
  'Баёни фикр': [
    {w:'In my opinion…',t:'Ба фикри ман…',e:'💭',ex:'In my opinion, it is good.',exT:'Ба фикри ман, хуб аст.'},
    {w:'I believe (that)…',t:'Ман бовар дорам ки…',e:'🙏',ex:'I believe that it is true.',exT:'Ман бовар дорам ки рост аст.'},
    {w:'It seems to me…',t:'Ба назарам…',e:'👀',ex:'It seems to me you are right.',exT:'Ба назарам ту ҳақ ҳастӣ.'},
    {w:"I'm not sure, but…",t:'Боварӣ надорам, вале…',e:'🤔',ex:"I'm not sure, but maybe.",exT:'Боварӣ надорам, вале шояд.'},
    {w:'On the other hand…',t:'Аз тарафи дигар…',e:'🔄',ex:'On the other hand, it is hard.',exT:'Аз тарафи дигар, душвор аст.'},
    {w:'I completely agree.',t:'Комилан розӣ.',e:'✅',ex:'I completely agree.',exT:'Ман комилан розӣ.'},
    {w:'I see your point, but…',t:'Фикратро мефаҳмам, вале…',e:'💡',ex:'I see your point, but I disagree.',exT:'Фикратро мефаҳмам, вале розӣ нестам.'},
    {w:"That's a good point.",t:'Нуктаи хуб.',e:'👍',ex:"That's a good point.",exT:'Нуктаи хуб.'},
  ],
  'Пурсидани маслиҳат': [
    {w:'What should I do?',t:'Чӣ кор кунам?',e:'🤔',ex:'What should I do?',exT:'Чӣ кор кунам?'},
    {w:'What would you do?',t:'Ту чӣ мекардӣ?',e:'❓',ex:'What would you do?',exT:'Ту дар ҷои ман чӣ мекардӣ?'},
    {w:'Do you have any advice?',t:'Маслиҳате доред?',e:'🗣️',ex:'Do you have any advice?',exT:'Маслиҳате доред?'},
    {w:'If I were you, I would…',t:'Агар ҷои ту мебудам…',e:'🔄',ex:'If I were you, I would wait.',exT:'Агар ҷои ту мебудам, интизор мешудам.'},
    {w:'You should…',t:'Бояд…',e:'☝️',ex:'You should rest.',exT:'Бояд истироҳат кунӣ.'},
    {w:"Why don't you…?",t:'Чаро … намекунӣ?',e:'💡',ex:"Why don't you try?",exT:'Чаро кӯшиш намекунӣ?'},
    {w:'It might be a good idea to…',t:'Шояд хуб бошад ки…',e:'🤷',ex:'It might be a good idea to call.',exT:'Шояд хуб бошад ки занг занӣ.'},
    {w:'Have you thought about…?',t:'Дар бораи … фикр кардӣ?',e:'💭',ex:'Have you thought about it?',exT:'Дар бораи он фикр кардӣ?'},
  ],
  'Gerund / Infinitive': [
    {w:'enjoy + -ing',t:'лаззат бурдан',e:'😊',ex:'I enjoy reading.',exT:'Ман аз хониш лаззат мебарам.'},
    {w:'want + to',t:'хостан',e:'🎯',ex:'I want to go.',exT:'Ман рафтан мехоҳам.'},
    {w:'decide to',t:'қарор додан',e:'💡',ex:'I decided to leave.',exT:'Ман қарор додам ки равам.'},
    {w:'avoid + -ing',t:'худдорӣ кардан',e:'🚫',ex:'Avoid eating late.',exT:'Аз дер хӯрдан худдорӣ кун.'},
    {w:'would like to',t:'мехоҳам',e:'🙋',ex:'I would like to help.',exT:'Ман кӯмак кардан мехоҳам.'},
    {w:'stop + -ing',t:'бас кардан',e:'🛑',ex:'Stop talking.',exT:'Гапро бас кун.'},
    {w:'promise to',t:'ваъда додан',e:'🤝',ex:'He promised to come.',exT:'Вай ваъда дод ки меояд.'},
    {w:'finish + -ing',t:'тамом кардан',e:'🏁',ex:'I finished working.',exT:'Ман корро тамом кардам.'},
  ],
  "Тахмин (must/might/can't)": [
    {w:'must be',t:'бояд … бошад (боварӣ)',e:'💯',ex:'He must be tired.',exT:'Вай бояд хаста бошад.'},
    {w:'might be',t:'шояд … бошад',e:'🤷',ex:'She might be at home.',exT:'Вай шояд дар хона бошад.'},
    {w:"can't be",t:'наметавонад … бошад',e:'🚫',ex:"It can't be true.",exT:'Ин наметавонад рост бошад.'},
    {w:'could be',t:'мумкин аст',e:'❓',ex:'He could be right.',exT:'Вай мумкин аст ҳақ бошад.'},
    {w:"I'm sure",t:'боварӣ дорам',e:'✅',ex:"I'm sure he is home.",exT:'Боварӣ дорам ки вай дар хона.'},
    {w:'maybe',t:'шояд',e:'🤔',ex:'Maybe she is busy.',exT:'Шояд вай серкор бошад.'},
    {w:'probably',t:'эҳтимол',e:'📊',ex:'He is probably at work.',exT:'Эҳтимол вай дар кор аст.'},
    {w:'deduction',t:'хулоса баровардан',e:'🔍',ex:'making a deduction',exT:'хулоса баровардан'},
  ],
  'Пешниҳод кардан': [
    {w:"Let's…",t:'Биё …',e:'🙌',ex:"Let's go out.",exT:'Биё берун равем.'},
    {w:'How about + -ing?',t:'… чӣ хел?',e:'🤔',ex:'How about going to the cinema?',exT:'Ба кино рафтан чӣ хел?'},
    {w:"Why don't we…?",t:'Чаро … накунем?',e:'💡',ex:"Why don't we eat out?",exT:'Чаро берун нахӯрем?'},
    {w:'We could…',t:'Мо метавонистем …',e:'🔄',ex:'We could meet tomorrow.',exT:'Мо метавонистем фардо вохӯрем.'},
    {w:'Shall we…?',t:'… кунем?',e:'❓',ex:'Shall we begin?',exT:'Сар кунем?'},
    {w:'I suggest…',t:'Пешниҳод мекунам …',e:'🗣️',ex:'I suggest a break.',exT:'Истироҳатро пешниҳод мекунам.'},
    {w:'That sounds good.',t:'Хуб менамояд.',e:'👍',ex:'That sounds good.',exT:'Хуб менамояд.'},
    {w:'Maybe we should…',t:'Шояд бояд …',e:'🤷',ex:'Maybe we should wait.',exT:'Шояд бояд интизор шавем.'},
  ],
  'Даъват': [
    {w:'Would you like to…?',t:'мехоҳед …?',e:'🎉',ex:'Would you like to come?',exT:'Омадан мехоҳед?'},
    {w:'Do you want to come?',t:'Омадан мехоҳӣ?',e:'🙋',ex:'Do you want to come?',exT:'Омадан мехоҳӣ?'},
    {w:'Are you free on…?',t:'… озодӣ?',e:'📅',ex:'Are you free on Friday?',exT:'Ҷумъа озодӣ?'},
    {w:"I'd love to.",t:'Бо ҷону дил.',e:'❤️',ex:"I'd love to.",exT:'Бо ҷону дил меоям.'},
    {w:"Sorry, I can't.",t:'Бубахш, наметавонам.',e:'🙏',ex:"Sorry, I can't.",exT:'Бубахш, наметавонам.'},
    {w:'Maybe another time.',t:'Шояд дафъаи дигар.',e:'🔄',ex:'Maybe another time.',exT:'Шояд дафъаи дигар.'},
    {w:'Let me check.',t:'Бигзор санҷам.',e:'🤔',ex:'Let me check my calendar.',exT:'Бигзор тақвимамро санҷам.'},
    {w:'See you there.',t:'Он ҷо мебинем.',e:'👋',ex:'See you there.',exT:'Он ҷо мебинем.'},
  ],
  'Ибораҳои корӣ': [
    {w:'a meeting',t:'маҷлис',e:'🤝',ex:'I have a meeting.',exT:'Ман маҷлис дорам.'},
    {w:'a deadline',t:'мӯҳлат',e:'⏰',ex:'a tight deadline',exT:'мӯҳлати зич'},
    {w:'a colleague',t:'ҳамкор',e:'👥',ex:'my colleague',exT:'ҳамкори ман'},
    {w:'a salary',t:'маош',e:'💵',ex:'a good salary',exT:'маоши хуб'},
    {w:'to apply for a job',t:'ариза додан',e:'📝',ex:'I applied for a job.',exT:'Ман ариза додам.'},
    {w:'a CV / resume',t:'тарҷумаи ҳол',e:'📄',ex:'Send your CV.',exT:'Тарҷумаи ҳолатонро фиристед.'},
    {w:'full-time / part-time',t:'пурра / нопурра',e:'⏳',ex:'a full-time job',exT:'кори пурравақта'},
    {w:'to get promoted',t:'мансаб гирифтан',e:'📈',ex:'She got promoted.',exT:'Вай мансаб гирифт.'},
  ],
  'Мусоҳибаи корӣ': [
    {w:'Tell me about your experience.',t:'Дар бораи таҷрибаатон гӯед.',e:'🗣️',ex:'Tell me about your experience.',exT:'Дар бораи таҷрибаатон гӯед.'},
    {w:'What are your strengths?',t:'Қувваҳоятон чист?',e:'💪',ex:'What are your strengths?',exT:'Қувваҳоятон чист?'},
    {w:'What are your weaknesses?',t:'Камбудиҳоятон чист?',e:'🤔',ex:'What are your weaknesses?',exT:'Камбудиҳоятон чист?'},
    {w:"I'm a team player.",t:'Ман дастагӣ кор мекунам.',e:'👥',ex:"I'm a team player.",exT:'Ман дар даста хуб кор мекунам.'},
    {w:'I work well under pressure.',t:'Зери фишор хуб кор мекунам.',e:'🔥',ex:'I work well under pressure.',exT:'Зери фишор хуб кор мекунам.'},
    {w:'Where do you see yourself in 5 years?',t:'Баъди 5 сол худро куҷо мебинед?',e:'🔮',ex:'Where do you see yourself in 5 years?',exT:'Баъди 5 сол худро куҷо мебинед?'},
    {w:'Do you have any questions?',t:'Саволе доред?',e:'❓',ex:'Do you have any questions?',exT:'Саволе доред?'},
    {w:'What is the salary?',t:'Маош чанд аст?',e:'💵',ex:'What is the salary?',exT:'Маош чанд аст?'},
  ],
  'Хониш: Кори ман': [
    {w:'I work as a software developer.',t:'Ман барномасоз кор мекунам.',e:'💻',ex:'I work as a software developer.',exT:'Ман ҳамчун барномасоз кор мекунам.'},
    {w:'I have been doing this for three years.',t:'Се сол боз ин корро мекунам.',e:'📅',ex:'I have been doing this for three years.',exT:'Се сол боз ин корро мекунам.'},
    {w:'I work in a team of five.',t:'Дар дастаи панҷнафара кор мекунам.',e:'👥',ex:'I work in a team of five.',exT:'Дар дастаи панҷнафара кор мекунам.'},
    {w:'We have a meeting every morning.',t:'Ҳар субҳ маҷлис дорем.',e:'🤝',ex:'We have a meeting every morning.',exT:'Ҳар субҳ маҷлис дорем.'},
    {w:'My job is challenging but rewarding.',t:'Корам душвор вале қаноатбахш.',e:'💪',ex:'My job is challenging but rewarding.',exT:'Корам душвор вале қаноатбахш аст.'},
    {w:'I can work from home.',t:'Аз хона кор карда метавонам.',e:'🏠',ex:'I can work from home.',exT:'Аз хона кор карда метавонам.'},
    {w:'I enjoy solving problems.',t:'Аз ҳалли мушкилот лаззат мебарам.',e:'🧩',ex:'I enjoy solving problems.',exT:'Аз ҳалли мушкилот лаззат мебарам.'},
    {w:"I'm happy with my career.",t:'Аз касбам розӣ.',e:'😊',ex:"I'm happy with my career.",exT:'Аз касбам розӣ.'},
  ],
  'Ибораҳои сафар': [
    {w:'to book a flight',t:'парвоз банд кардан',e:'✈️',ex:'I booked a flight.',exT:'Ман парвоз банд кардам.'},
    {w:'a boarding pass',t:'талони савор',e:'🎫',ex:'Show your boarding pass.',exT:'Талони саворатонро нишон диҳед.'},
    {w:'to check in',t:'бақайдгирӣ',e:'🛄',ex:'check in for the flight',exT:'барои парвоз бақайдгирӣ'},
    {w:'a delay',t:'таъхир',e:'⏰',ex:'a two-hour delay',exT:'таъхири дусоата'},
    {w:'a connection',t:'пайвасти парвоз',e:'🔁',ex:'a connecting flight',exT:'парвози пайвастшаванда'},
    {w:'travel insurance',t:'суғуртаи сафар',e:'🛡️',ex:'travel insurance',exT:'суғуртаи сафар'},
    {w:'a return ticket',t:'чиптаи рафту баргашт',e:'🎟️',ex:'a return ticket',exT:'чиптаи рафту баргашт'},
    {w:'Have a safe trip!',t:'Сафари бехатар!',e:'🙏',ex:'Have a safe trip!',exT:'Сафари бехатар!'},
  ],
  'Шикоят кардан': [
    {w:'I have a complaint.',t:'Ман шикоят дорам.',e:'😠',ex:'I have a complaint.',exT:'Ман шикоят дорам.'},
    {w:"This isn't what I ordered.",t:'Ин чизе нест ки фармудам.',e:'🍽️',ex:"This isn't what I ordered.",exT:'Ин чизе нест ки фармудам.'},
    {w:'The room is dirty.',t:'Ҳуҷра ифлос аст.',e:'🛏️',ex:'The room is dirty.',exT:'Ҳуҷра ифлос аст.'},
    {w:"I'd like to speak to the manager.",t:'Бо мудир гап задан мехоҳам.',e:'🗣️',ex:"I'd like to speak to the manager.",exT:'Бо мудир гап задан мехоҳам.'},
    {w:'Can I have a refund?',t:'Пуламро баргардонед?',e:'💵',ex:'Can I have a refund?',exT:'Пуламро баргардонед?'},
    {w:'This is not acceptable.',t:'Ин қобили қабул нест.',e:'🚫',ex:'This is not acceptable.',exT:'Ин қобили қабул нест.'},
    {w:"I'm not satisfied.",t:'Ман розӣ нестам.',e:'😞',ex:"I'm not satisfied.",exT:'Ман розӣ нестам.'},
    {w:'Could you fix this?',t:'Инро ислоҳ карда метавонед?',e:'🔧',ex:'Could you fix this?',exT:'Инро ислоҳ карда метавонед?'},
  ],
  'Миқдор (too much/many)': [
    {w:'too much',t:'аз ҳад зиёд (ноҳисобӣ)',e:'💧',ex:'too much salt',exT:'намаки аз ҳад зиёд'},
    {w:'too many',t:'аз ҳад зиёд (ҳисобӣ)',e:'🔢',ex:'too many people',exT:'одамони аз ҳад зиёд'},
    {w:'not enough',t:'нокифоя',e:'🚫',ex:'not enough chairs',exT:'курсии нокифоя'},
    {w:'a lot of',t:'бисёр',e:'➕',ex:'a lot of work',exT:'кори бисёр'},
    {w:'a little / a few',t:'каме / якчанд',e:'🤏',ex:'a little time, a few friends',exT:'каме вақт, якчанд дӯст'},
    {w:'plenty of',t:'фаровон',e:'💰',ex:'plenty of money',exT:'пули фаровон'},
    {w:'How much / How many',t:'чанд (ноҳисобӣ / ҳисобӣ)',e:'❓',ex:'How much? How many?',exT:'Чанд? Чанд то?'},
    {w:'enough',t:'кофӣ',e:'✅',ex:'enough food',exT:'хӯроки кофӣ'},
  ],
};

async function run() {
  console.log('🇬🇧 Пур кардани дарсҳои холии АНГЛИСӢ B1\n');
  const mods = await api('GET', '/api/admin/modules?courseId=' + COURSE);
  const allLessons = [];
  for (const m of (mods.modules || mods)) {
    const les = await api('GET', '/api/admin/lessons?moduleId=' + m.id);
    for (const l of (les.lessons || les)) allLessons.push(l);
  }
  let ok = 0, totalW = 0, notFound = [];
  for (const l of allLessons) {
    if (l.type === 'quiz') continue;
    const w = await api('GET', '/api/admin/words?lessonId=' + l.id);
    const n = Array.isArray(w.words || w) ? (w.words || w).length : 0;
    if (n > 0) continue;
    const title = (l.titleTranslated || l.title || '').trim();
    const words = C[title];
    if (!words) { notFound.push(title); continue; }
    const r = await api('POST', '/api/admin/words/bulk', {
      lessonId: l.id, mode: 'replace',
      words: words.map((x, i) => ({ word: x.w, translation: x.t, emoji: x.e,
        ipa: x.ipa || undefined, example: x.ex, exampleTrans: x.exT, difficulty: 3, order: i })),
    });
    if (r.error) { console.log('  ❌ ' + title + ': ' + JSON.stringify(r).slice(0,80)); continue; }
    ok++; totalW += (r.count ?? words.length);
    console.log('  ✅ ' + title.slice(0,40).padEnd(42) + ' — ' + (r.count ?? words.length));
  }
  console.log('\n✅ ' + ok + ' дарс пур шуд, ' + totalW + ' калима.');
  if (notFound.length) console.log('⚠️  Бе мундариҷа монд (' + notFound.length + '):\n   ' + notFound.join('\n   '));
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
