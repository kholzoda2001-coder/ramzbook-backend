// B1: the seven grammar points the course was missing.
//
// The audit checked the 24 existing topics against the CEFR B1 grammar
// inventory. Everything heavy was there — all four conditionals, the full
// passive, reported speech, relative clauses, modals of deduction. What was
// missing were points that look small but block real B1 use:
//   • Present Perfect vs Past Simple — the single most common B1 error
//   • although / despite / however — needed the moment a learner writes a
//     paragraph with two contrasting ideas
//   • so that / in order to / as soon as / until — purpose and time clauses
//   • indirect questions — the polite register B1 is expected to handle
//   • used to / would, advanced comparatives, quantifiers — met briefly at A2,
//     never given a topic of their own
//
// Each goes into the module where it belongs by theme, as a THIRD grammar
// lesson placed straight after the existing two. Every topic gets 5 examples
// (the existing B1 topics have only 3–4 — fewer than A1 and A2, which is
// backwards for the level), 3 rules and 8 exercises.

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

const TOPICS = [
  {
    mo: 0, emoji: '⏳',
    title: 'Present Perfect vs Past Simple',
    titleTranslated: 'Present Perfect ё Past Simple?',
    lesson: 'Lesson 7: Present Perfect vs Past Simple',
    lessonTr: 'Дарси 7: Present Perfect ё Past Simple',
    explanation:
      'Ин ду замон бештар аз ҳама омехта мешаванд.\n\n' +
      '**Present Perfect** (have/has + V3) — вақт МУҲИМ НЕСТ, натиҷа муҳим аст:\n' +
      'I **have visited** Turkey. (кай — гуфта намешавад)\n\n' +
      '**Past Simple** (V2) — вақти МУАЙЯНИ гузашта:\n' +
      'I **visited** Turkey last summer.\n\n' +
      '**Қоидаи тиллоӣ:** агар вақти муайян гуфта шавад (yesterday, last week, in 2019, two days ago) — ҳатман Past Simple.',
    examples: [
      ['I have visited Turkey three times.', 'Ман се бор ба Туркия рафтаам.', 'have visited'],
      ['I visited Turkey last summer.', 'Ман тобистони гузашта ба Туркия рафтам.', 'visited'],
      ['Have you ever missed a flight?', 'Ҳеҷ гоҳ ба ҳавопаймо дер мондаӣ?', 'Have you ever'],
      ['She lost her passport yesterday.', 'Ӯ дирӯз шиносномаашро гум кард.', 'lost'],
      ['We have just arrived at the hotel.', 'Мо ҳозиракак ба меҳмонхона расидем.', 'have just arrived'],
    ],
    rules: [
      ['have/has + V3 — вақт номаълум ё натиҷа муҳим', 'Ишорагарҳо: ever, never, just, already, yet, so far.'],
      ['V2 — вақти муайяни гузашта', 'Ишорагарҳо: yesterday, last week, in 2019, two days ago.'],
      ['Бо вақти муайян Present Perfect НАМЕШАВАД', '✗ I have seen him yesterday → ✓ I saw him yesterday.'],
    ],
    exercises: [
      ['choose', 'I ___ my luggage last night.', 'Вақти муайян ҳаст.', 'lost', ['have lost', 'lost', 'had lost', 'lose'], '«last night» → Past Simple.'],
      ['choose', '___ you ever ___ to Dubai?', 'Таҷрибаи умрӣ.', 'Have … been', ['Did … go', 'Have … been', 'Have … went', 'Did … been'], 'ever → Present Perfect + V3.'],
      ['choose', 'She ___ booked her ticket.', 'already бо кадом замон?', 'has already', ['already', 'has already', 'did already', 'was already'], 'already → Present Perfect.'],
      ['fill_blank', 'We ___ just arrived at the airport.', 'just → Present Perfect.', 'have', null, 'have just arrived.'],
      ['fill_blank', 'They ___ to Italy in 2020.', 'Соли муайян ҳаст (travel).', 'travelled', null, 'in 2020 → Past Simple.'],
      ['transform', 'Ислоҳ кунед: I have seen him yesterday.', 'Вақти муайян ҳаст.', 'I saw him yesterday.', null, 'yesterday → Past Simple.'],
      ['transform', 'Ислоҳ кунед: Did you ever visit Paris?', 'Таҷрибаи умрӣ.', 'Have you ever visited Paris?', null, 'ever → Present Perfect.'],
      ['reorder', 'Ҷумларо созед:', 'Ман ҳеҷ гоҳ ба ҳавопаймо дер намондаам.', 'I have never missed a flight.', ['never', 'I', 'have', 'a', 'flight', 'missed'], 'never → Present Perfect.'],
    ],
  },
  {
    mo: 1, emoji: '🔗',
    title: 'Linking Words: although, despite, however',
    titleTranslated: 'Пайвандакҳо: although, despite, however',
    lesson: 'Lesson 7: Linking Words',
    lessonTr: 'Дарси 7: Пайвандакҳо',
    explanation:
      'Барои пайваст кардани ду фикри муқобил:\n\n' +
      '**although / even though** + ҶУМЛА (фоил + феъл):\n' +
      '**Although** he was tired, he finished the report.\n\n' +
      '**despite / in spite of** + ИСМ ё феъл бо **-ing** (ҷумла НЕ):\n' +
      '**Despite** the noise, she kept working.\n\n' +
      '**however** = вале | **therefore** = бинобар ин — байни ду ҷумлаи алоҳида, бо вергул.',
    examples: [
      ['Although he was tired, he finished the report.', 'Гарчанде монда буд, ҳисоботро тамом кард.', 'Although'],
      ['Despite the noise, she kept working.', 'Бо вуҷуди садо, ӯ кор карданро давом дод.', 'Despite'],
      ['He studied hard; however, he failed the exam.', 'Ӯ сахт хонд; вале аз имтиҳон нагузашт.', 'however'],
      ['The salary is low. Therefore, many people leave.', 'Маош паст аст. Бинобар ин бисёриҳо мераванд.', 'Therefore'],
      ['In spite of having no degree, she got the job.', 'Бо вуҷуди диплом надоштан, ӯ корро гирифт.', 'In spite of'],
    ],
    rules: [
      ['although / even though + ҷумлаи пурра', 'Although it was raining, we went out.'],
      ['despite / in spite of + исм ё -ing', '✗ Despite he was tired → ✓ Despite being tired.'],
      ['however = вале, therefore = бинобар ин', 'Байни ду ҷумла, аксар баъди нуқта ё нуқтавергул.'],
    ],
    exercises: [
      ['choose', '___ the rain, we went out.', 'Баъди он исм меояд.', 'Despite', ['Although', 'Despite', 'However', 'Therefore'], 'Пеш аз исм → Despite.'],
      ['choose', '___ it was raining, we went out.', 'Баъди он ҷумла меояд.', 'Although', ['Despite', 'Although', 'However', 'In spite of'], 'Пеш аз ҷумла → Although.'],
      ['choose', 'He was late. ___, he apologised.', 'Фикри муқобил.', 'However', ['Although', 'Despite', 'However', 'Because'], 'Байни ду ҷумла → However.'],
      ['fill_blank', '___ working hard, she did not pass.', 'Баъди он феъли -ing аст.', 'Despite', null, 'Despite + -ing.'],
      ['fill_blank', 'The office was closed. ___, we went home.', 'Натиҷа.', 'Therefore', null, 'Therefore = бинобар ин.'],
      ['transform', 'Ислоҳ кунед: Despite he was tired, he worked.', 'Despite бо ҷумла намеояд.', 'Despite being tired, he worked.', null, 'Despite + -ing.'],
      ['transform', 'Бо although нависед: In spite of the cost, they bought it.', 'Ба ҷумла гардонед.', 'Although it was expensive, they bought it.', null, 'although + ҷумла.'],
      ['reorder', 'Ҷумларо созед:', 'Гарчанде кор душвор буд, ба ӯ маъқул шуд.', 'Although the job was hard, she enjoyed it.', ['hard', 'Although', 'the', 'job', 'was', 'she', 'enjoyed', 'it'], 'Although + ҷумла, баъд ҷумлаи асосӣ.'],
    ],
  },
  {
    mo: 3, emoji: '🎯',
    title: 'Purpose and Time Clauses',
    titleTranslated: 'Ҷумлаи мақсад ва вақт',
    lesson: 'Lesson 7: Purpose and Time Clauses',
    lessonTr: 'Дарси 7: Ҷумлаи мақсад ва вақт',
    explanation:
      '**Мақсад — барои чӣ?**\n' +
      '**so that** + ҷумла: We recycle **so that** less rubbish goes to landfill.\n' +
      '**in order to** + масдар: They planted trees **in order to** protect the soil.\n\n' +
      '**Вақт — кай?**\n' +
      '**as soon as** (ҳамин ки), **until** (то он вақт ки), **by the time** (то он даме ки).\n\n' +
      '⚠️ **Қоидаи муҳим:** баъди ин пайвандакҳо замони ОЯНДА гузошта НАМЕШАВАД:\n' +
      '✗ when I **will** arrive → ✓ when I **arrive**',
    examples: [
      ['We recycle so that less rubbish goes to landfill.', 'Мо коркард мекунем, то партов камтар шавад.', 'so that'],
      ['They planted trees in order to protect the soil.', 'Онҳо дарахт шинонданд, то хокро ҳифз кунанд.', 'in order to'],
      ['As soon as the sun rises, the panels start working.', 'Ҳамин ки офтоб мебарояд, панелҳо кор мекунанд.', 'As soon as'],
      ['Wait until the water is clean.', 'То он даме ки об тоза шавад, интизор шав.', 'until'],
      ['By the time we act, it may be too late.', 'То он даме ки амал кунем, шояд дер шавад.', 'By the time'],
    ],
    rules: [
      ['so that + ҷумла | in order to + масдар', 'so that we can save water / in order to save water.'],
      ['Баъди as soon as, until, when, by the time — замони оянда НЕ', '✓ when I arrive  ✗ when I will arrive.'],
      ['until = то он вақт ки | by the time = то он даме ки', 'Wait until… / By the time you finish…'],
    ],
    exercises: [
      ['choose', 'We save water ___ future generations can use it.', 'Баъди он ҷумла меояд.', 'so that', ['so that', 'in order to', 'until', 'despite'], 'so that + ҷумла.'],
      ['choose', 'He works hard ___ support his family.', 'Баъди он масдар меояд.', 'in order to', ['so that', 'in order to', 'as soon as', 'until'], 'in order to + масдар.'],
      ['choose', 'I will call you as soon as I ___.', 'Баъди as soon as оянда намешавад.', 'arrive', ['will arrive', 'arrive', 'arrived', 'am arriving'], 'Замони ҳозира истифода мешавад.'],
      ['fill_blank', 'Wait ___ the rain stops.', 'То он вақт ки…', 'until', null, 'until = то он вақт ки.'],
      ['fill_blank', '___ the time we arrived, the meeting had ended.', 'То он даме ки…', 'By', null, 'By the time.'],
      ['transform', 'Ислоҳ кунед: I will phone you when I will get home.', 'Баъди when оянда намешавад.', 'I will phone you when I get home.', null, 'when + Present Simple.'],
      ['transform', 'Бо in order to нависед: They stopped the car so that they could rest.', 'Ба масдар гардонед.', 'They stopped the car in order to rest.', null, 'in order to + масдар.'],
      ['reorder', 'Ҷумларо созед:', 'Мо чароғро хомӯш мекунем, то энергия сарфа шавад.', 'We turn off the lights so that we save energy.', ['so', 'that', 'we', 'save', 'energy', 'We', 'turn', 'off', 'the', 'lights'], 'Ҷумлаи асосӣ + so that + ҷумла.'],
    ],
  },
  {
    mo: 6, emoji: '⚖️',
    title: 'Comparatives: much, as…as, the least',
    titleTranslated: 'Муқоисаи амиқ: much, as…as, the least',
    lesson: 'Lesson 7: Advanced Comparatives',
    lessonTr: 'Дарси 7: Муқоисаи амиқ',
    explanation:
      '**Қувват додан:** much / far / a lot + сифати муқоисавӣ\n' +
      'This phone is **far more expensive** than that one.\n\n' +
      '**Баробарӣ:** as + сифат + as | **камтар:** not as + сифат + as\n' +
      'It is **not as cheap as** I expected.\n\n' +
      '**Камтарин:** the least (муқобили the most)\n' +
      'This is **the least expensive** option.\n\n' +
      '**Ҳарду афзоянда:** the more … the more\n' +
      '**The more** you save, **the safer** you feel.',
    examples: [
      ['This phone is far more expensive than that one.', 'Ин телефон аз он хеле қиматтар аст.', 'far more expensive'],
      ['It is not as cheap as I expected.', 'Он он қадар арзон нест, ки интизор доштам.', 'not as cheap as'],
      ['This is the least expensive option.', 'Ин арзонтарин интихоб аст.', 'the least expensive'],
      ['The more you save, the safer you feel.', 'Ҳар қадар бештар пасандоз кунӣ, ҳамон қадар осударо ҳис мекунӣ.', 'The more'],
      ['Prices are much higher than last year.', 'Нархҳо аз соли гузашта хеле баландтаранд.', 'much higher'],
    ],
    rules: [
      ['much / far / a lot + сифати муқоисавӣ', '✓ much cheaper  ✗ very cheaper.'],
      ['as + сифат + as = баробар | not as … as = камтар', 'as cheap as / not as cheap as.'],
      ['the least = камтарин', 'the most expensive ↔ the least expensive.'],
    ],
    exercises: [
      ['choose', 'This shop is ___ cheaper than that one.', 'Қувват додани муқоиса.', 'much', ['very', 'much', 'so', 'too'], 'Бо сифати муқоисавӣ → much, на very.'],
      ['choose', "It isn't ___ expensive ___ I thought.", 'Баробарӣ дар инкор.', 'as … as', ['so … as', 'as … as', 'more … than', 'the … most'], 'not as + сифат + as.'],
      ['choose', 'This is the ___ expensive item in the shop.', 'Камтарин.', 'least', ['less', 'least', 'lesser', 'little'], 'the least = камтарин.'],
      ['fill_blank', 'The more you compare, the ___ the price. (good)', 'Шакли муқоисавии good.', 'better', null, 'good → better.'],
      ['fill_blank', 'Gold is ___ more expensive than silver.', 'Қувват додан.', 'far', null, 'far more expensive.'],
      ['transform', 'Ислоҳ кунед: This is more cheaper than that.', 'Ду бор муқоиса нашавад.', 'This is much cheaper than that.', null, '✗ more cheaper → ✓ much cheaper.'],
      ['transform', 'Бо not as … as нависед: The blue coat is cheaper than the red one.', 'Ҷои сифатҳоро иваз кунед.', 'The red coat is not as cheap as the blue one.', null, 'Сурх арзон нест, мисли кабуд.'],
      ['reorder', 'Ҷумларо созед:', 'Ин халта аз они ман хеле қиматтар аст.', 'This bag is far more expensive than mine.', ['far', 'This', 'bag', 'is', 'more', 'expensive', 'than', 'mine'], 'far + more + сифат + than.'],
    ],
  },
  {
    mo: 7, emoji: '🙋',
    title: 'Indirect and Polite Questions',
    titleTranslated: 'Саволи ғайримустақим ва боадабона',
    lesson: 'Lesson 7: Indirect Questions',
    lessonTr: 'Дарси 7: Саволи боадабона',
    explanation:
      'Барои боадабона пурсидан савол дар дохили ҷумлаи дигар ҷой мегирад:\n\n' +
      'Where is the station? → **Could you tell me where the station is?**\n\n' +
      '⚠️ **Ду тағйири муҳим:**\n' +
      '1. Тартиби калима ХАБАРӢ мешавад: where the station **is** (на «is the station»).\n' +
      '2. **do / does / did** партофта мешавад: ✗ where **does** he live → ✓ where he **lives**.\n\n' +
      'Барои саволи ҳа/не — **if** ё **whether**: Do you know **if** the shop is open?',
    examples: [
      ['Could you tell me where the station is?', 'Мебахшед, истгоҳ дар куҷост?', 'where the station is'],
      ['Do you know if the shop is open?', 'Намедонед, мағоза кушода аст?', 'if the shop is open'],
      ['I wonder what time the film starts.', 'Ҷолиб аст, филм соати чанд сар мешавад.', 'what time the film starts'],
      ['Can you tell me how much this costs?', 'Гуфта метавонед, ин чанд пул аст?', 'how much this costs'],
      ['Do you know whether she called?', 'Намедонед, ӯ занг зад?', 'whether she called'],
    ],
    rules: [
      ['Тартиб хабарӣ мешавад', '✗ where is the station → ✓ where the station is.'],
      ['do / does / did партофта мешавад', '✗ where does he live → ✓ where he lives.'],
      ['Саволи ҳа/не → if ё whether', 'Do you know if it is open?'],
    ],
    exercises: [
      ['choose', 'Could you tell me where ___?', 'Тартиби хабарӣ.', 'the bank is', ['is the bank', 'the bank is', 'does the bank', 'the bank does'], 'Дар саволи ғайримустақим тартиб хабарӣ мешавад.'],
      ['choose', 'Do you know ___ he is coming?', 'Саволи ҳа/не.', 'if', ['what', 'if', 'where', 'that'], 'Барои ҳа/не → if.'],
      ['choose', 'I wonder what time ___.', 'Тартиби хабарӣ.', 'the train leaves', ['does the train leave', 'the train leaves', 'the train leave', 'leaves the train'], 'Бе does, тартиб хабарӣ.'],
      ['fill_blank', 'Can you tell me how much this ___? (cost)', 'Шахси сеюми танҳо.', 'costs', null, 'this costs.'],
      ['fill_blank', 'Do you know ___ the museum is open on Sunday?', 'Саволи ҳа/не.', 'if', null, 'if ё whether.'],
      ['transform', 'Ба саволи боадабона гардонед: Where does he live?', 'Бо Could you tell me…', 'Could you tell me where he lives?', null, 'does партофта, тартиб хабарӣ.'],
      ['transform', 'Ислоҳ кунед: Do you know where is the station?', 'Тартиб ғалат.', 'Do you know where the station is?', null, 'where the station is.'],
      ['reorder', 'Ҷумларо созед:', 'Гуфта метавонед, мағоза кай кушода мешавад?', 'Could you tell me when the shop opens?', ['when', 'Could', 'you', 'tell', 'me', 'the', 'shop', 'opens'], 'Could you tell me + when + тартиби хабарӣ.'],
    ],
  },
  {
    mo: 8, emoji: '🥄',
    title: 'Quantifiers: a few, a little, plenty of',
    titleTranslated: 'Миқдорсанҷҳо: a few, a little, plenty of',
    lesson: 'Lesson 7: Quantifiers',
    lessonTr: 'Дарси 7: Миқдорсанҷҳо',
    explanation:
      '**a few** + шумурдашаванда: a few apples, a few eggs\n' +
      '**a little** + шумурда намешавад: a little sugar, a little water\n\n' +
      '**plenty of** = хеле зиёд (бо ҳарду): plenty of rice, plenty of apples\n' +
      '**hardly any** = қариб нест: There is **hardly any** milk.\n\n' +
      '**too much** (шумурда намешавад) / **too many** (шумурдашаванда) = аз ҳад зиёд\n' +
      '**enough** = кофӣ — пеш аз исм меояд: **enough** sugar.',
    examples: [
      ['There are a few apples left.', 'Чанд себ мондааст.', 'a few'],
      ['We have a little sugar.', 'Мо каме шакар дорем.', 'a little'],
      ['There is plenty of rice.', 'Биринҷ хеле зиёд аст.', 'plenty of'],
      ['There is hardly any milk.', 'Шир қариб нест.', 'hardly any'],
      ['You added too much salt.', 'Ту аз ҳад зиёд намак андохтӣ.', 'too much'],
    ],
    rules: [
      ['a few + шумурдашаванда | a little + шумурда намешавад', 'a few eggs / a little water.'],
      ['too many + шумурдашаванда | too much + шумурда намешавад', 'too many people / too much sugar.'],
      ['plenty of = хеле зиёд | hardly any = қариб нест', 'Бо ҳарду навъи исм кор мекунанд.'],
    ],
    exercises: [
      ['choose', 'There are ___ tomatoes in the fridge.', 'Помидор шумурда мешавад.', 'a few', ['a little', 'a few', 'much', 'hardly'], 'Шумурдашаванда → a few.'],
      ['choose', 'Add ___ salt to the soup.', 'Намак шумурда намешавад.', 'a little', ['a few', 'a little', 'many', 'few'], 'Шумурда намешавад → a little.'],
      ['choose', 'There is ___ any bread left.', 'Қариб нест.', 'hardly', ['hardly', 'plenty', 'too', 'enough'], 'hardly any = қариб нест.'],
      ['fill_blank', 'We have ___ of time — no need to hurry.', 'Хеле зиёд.', 'plenty', null, 'plenty of time.'],
      ['fill_blank', 'You put too ___ sugar in the tea.', 'Шакар шумурда намешавад.', 'much', null, 'too much sugar.'],
      ['transform', 'Ислоҳ кунед: I have a few money.', 'Пул шумурда намешавад.', 'I have a little money.', null, 'money → a little.'],
      ['transform', 'Ислоҳ кунед: There are too much people here.', 'Одамон шумурда мешаванд.', 'There are too many people here.', null, 'people → too many.'],
      ['reorder', 'Ҷумларо созед:', 'Дар шиша қариб шир нест.', 'There is hardly any milk in the bottle.', ['hardly', 'There', 'is', 'any', 'milk', 'in', 'the', 'bottle'], 'hardly any + исм.'],
    ],
  },
  {
    mo: 10, emoji: '🕰️',
    title: 'used to / would (Past Habits)',
    titleTranslated: 'used to / would — одати гузашта',
    lesson: 'Lesson 7: used to and would',
    lessonTr: 'Дарси 7: used to ва would',
    explanation:
      '**used to** + масдар — одат ё ҲОЛАТИ гузашта, ки ҳоло нест:\n' +
      'People **used to** write letters by hand.\n' +
      'There **used to be** a market here.\n\n' +
      '**would** + масдар — танҳо АМАЛИ такроршаванда (ҳолат НЕ):\n' +
      'My grandfather **would** tell us stories every evening.\n\n' +
      '⚠️ ✗ I **would be** shy → ✓ I **used to be** shy (be = ҳолат).\n\n' +
      'Инкор ва савол бе -d: **didn\'t use to** / **Did you use to…?**',
    examples: [
      ['People used to write letters by hand.', 'Одамон пештар мактубро бо даст менавиштанд.', 'used to'],
      ['My grandfather would tell us stories every evening.', 'Бобоям ҳар бегоҳ ба мо ҳикоя мегуфт.', 'would'],
      ['There used to be a market here.', 'Пештар ин ҷо бозор буд.', 'used to be'],
      ["We didn't use to have mobile phones.", 'Мо пештар телефони мобилӣ надоштем.', "didn't use to"],
      ['Did you use to play this game?', 'Ту пештар ин бозиро мекардӣ?', 'Did you use to'],
    ],
    rules: [
      ['used to + масдар — одат ё ҳолати гузашта', 'Ҳоло дигар нест: I used to live there.'],
      ['would — танҳо амали такроршаванда, ҳолат НЕ', '✗ I would be a student → ✓ I used to be a student.'],
      ["Инкор/савол бе -d", "✗ didn't used to → ✓ didn't use to."],
    ],
    exercises: [
      ['choose', 'There ___ a cinema here.', 'Ҳолати гузашта.', 'used to be', ['would be', 'used to be', 'was used to', 'use to be'], 'be = ҳолат → used to be.'],
      ['choose', 'Every summer we ___ visit our grandparents.', 'Амали такроршаванда.', 'would', ['used', 'would', 'did', 'were'], 'Амали такрорӣ → would.'],
      ['choose', 'I ___ like coffee, but now I love it.', 'Инкори одати гузашта.', "didn't use to", ["didn't used to", "didn't use to", "don't use to", "wasn't use to"], 'Инкор бе -d.'],
      ['fill_blank', 'People ___ to travel by horse.', 'Одати гузашта (use).', 'used', null, 'used to travel.'],
      ['fill_blank', '___ you use to live here?', 'Саволи одати гузашта.', 'Did', null, 'Did you use to…?'],
      ['transform', 'Ислоҳ кунед: I would be very shy as a child.', 'be = ҳолат аст.', 'I used to be very shy as a child.', null, 'Бо ҳолат would намешавад.'],
      ['transform', "Ислоҳ кунед: She didn't used to smoke.", 'Дар инкор -d намемонад.', "She didn't use to smoke.", null, "didn't use to."],
      ['reorder', 'Ҷумларо созед:', 'Модарам пештар ҳар субҳ нон мепухт.', 'My mother used to make bread every morning.', ['used', 'to', 'My', 'mother', 'make', 'bread', 'every', 'morning'], 'used to + масдар.'],
    ],
  },
];

const mods = (await api('/modules?courseId=' + B1)).modules.sort((a, b) => a.order - b.order);
let made = 0;

for (const t of TOPICS) {
  const mod = mods[t.mo];
  const lessons = (await api('/lessons?moduleId=' + mod.id)).lessons.sort((a, b) => a.order - b.order);
  if (lessons.some(l => l.title === t.lesson)) { console.log(`M${t.mo + 1}: аллакай ҳаст, гузашт`); continue; }

  // 1. topic + children
  const topic = (await api('/grammar', 'POST', {
    courseId: B1, title: t.title, titleTranslated: t.titleTranslated,
    cefrLevel: 'B1', emoji: t.emoji, order: 30 + t.mo, explanation: t.explanation,
  })).topic;
  for (let i = 0; i < t.examples.length; i++) {
    const [sentence, translation, highlight] = t.examples[i];
    await api('/grammar/examples', 'POST', { topicId: topic.id, order: i, sentence, translation, highlight });
  }
  for (let i = 0; i < t.rules.length; i++) {
    const [pattern, note] = t.rules[i];
    await api('/grammar/rules', 'POST', { topicId: topic.id, order: i, pattern, note });
  }
  for (let i = 0; i < t.exercises.length; i++) {
    const [type, prompt, promptTranslated, answer, options, explanation] = t.exercises[i];
    await api('/grammar/exercises', 'POST', { topicId: topic.id, order: i, type, prompt, promptTranslated, answer, options, explanation });
  }

  // 2. insert the lesson after the last existing grammar lesson
  const lastGrammar = [...lessons].reverse().find(l => l.skillType === 'grammar');
  const at = lastGrammar.order + 1;
  for (const l of lessons.filter(l => l.order >= at).sort((a, b) => b.order - a.order)) {
    await api('/lessons/' + l.id, 'PUT', { order: l.order + 1 });
  }
  await api('/lessons', 'POST', {
    moduleId: mod.id, title: t.lesson, titleTranslated: t.lessonTr,
    type: 'grammar', skillType: 'grammar', cefrLevel: 'B1', emoji: t.emoji,
    xpReward: 20, duration: 5, order: at, isPremium: false,
    linkType: 'grammar', linkId: topic.id,
  });
  made++;
  console.log(`  ✓ M${t.mo + 1}: ${t.title} — 5 мисол, 3 қоида, 8 машқ (дарси ${at})`);
}
console.log(`\n✅ ${made} мавзӯи нави грамматика илова шуд.`);
