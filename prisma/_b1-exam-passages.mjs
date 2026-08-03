// B1 final exams, modules 5–12: give each one a real reading passage.
//
// Modules 1–4 test reading comprehension AND language. Modules 5–12 had no
// passage at all — their "passage" field held an instruction line ("This exam
// reviews Module 5…") and all ten questions were gap-fills. So two thirds of
// the B1 exams never tested reading, which is half of what a B1 certificate
// actually certifies.
//
// Each module now gets a ~130-word passage on its own theme, written with that
// module's vocabulary and grammar, and carrying a point of view so that
// inference questions are possible at all. The first five questions become
// 1 gist + 2 inference + 1 vocabulary-in-context + 1 detail — the same shape as
// modules 1–4. The last five language questions are left untouched, so the exam
// stays ten questions and the 80% pass mark still means the same thing.

const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const BASE = 'https://admin.ramz.tj/api/admin';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method, headers: { 'Content-Type': 'application/json', 'x-admin-api-key': KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(d)}`);
  return d;
}

const EXAMS = [
  {
    id: 'cmrl4ux090059r7wj68idml0p', module: 'M5 Health and Lifestyle',
    passage: "For years, doctors have been telling us the same thing: there is no magic pill for good health. By the time most people decide to change their lifestyle, they have already ignored the warning signs for months. Someone who has been sleeping badly and eating poorly cannot expect a single prescription to fix everything. What actually works is far less dramatic. Walking for thirty minutes a day, cutting down on sugar, and going to bed at a regular hour all sound too simple to matter, yet study after study proves otherwise. The hardest part is not knowing what to do — almost everyone knows. The hard part is doing it on the days when nobody is watching and nothing feels urgent.",
    passageTranslated: 'Солҳост, ки духтурон як чизро мегӯянд: барои саломатӣ доруи мӯъҷизавӣ нест. То он даме ки одам тарзи ҳаёташро иваз кардан хоҳад, ӯ аллакай моҳҳо аломатҳои огоҳиро нодида гирифтааст. Он чи воқеан кор мекунад, содда аст: рӯзе сӣ дақиқа қадам задан, шакарро кам кардан, дар вақти муайян хобидан. Мушкил донистан нест — қариб ҳама медонанд. Мушкил иҷро кардан аст, вақте ки ҳеҷ кас намебинад ва ҳеҷ чиз таъҷилӣ нест.',
    questions: [
      { question: 'What is the main point of the text?', questionTranslated: 'Фикри асосии матн чист?',
        options: ['Modern medicine has failed to cure common illnesses', 'Good health comes from small habits repeated daily', 'Doctors disagree about what a healthy lifestyle is'],
        correctIndex: 1, explanation: 'Матн мегӯяд, ки одатҳои хурди ҳаррӯза кор мекунанд, на як чораи калон.' },
      { question: "Why does the writer say there is 'no magic pill'?", questionTranslated: 'Чаро муаллиф мегӯяд «доруи мӯъҷизавӣ нест»?',
        options: ['To warn that medicine is often dangerous', 'To argue that patients should avoid doctors', 'To stress that health cannot be fixed instantly'],
        correctIndex: 2, explanation: 'Ин ибора нишон медиҳад, ки натиҷа якбора намеояд.' },
      { question: 'What does the writer suggest is the real difficulty?', questionTranslated: 'Ба назари муаллиф, мушкилии аслӣ чист?',
        options: ['Finding reliable health information', 'Paying for treatment', 'Keeping good habits when nothing feels urgent'],
        correctIndex: 2, explanation: '«The hard part is doing it… when nothing feels urgent».' },
      { question: "In the text, 'dramatic' is closest in meaning to:", questionTranslated: 'Дар матн «dramatic» ба кадом маъно наздик аст?',
        options: ['striking and sudden', 'expensive', 'medical'],
        correctIndex: 0, explanation: 'Dramatic = якбора ва назаррас.' },
      { question: 'Which simple habit does the writer give as an example?', questionTranslated: 'Муаллиф кадом одати соддаро мисол меорад?',
        options: ['Taking vitamins every morning', 'Walking for thirty minutes a day', 'Visiting a doctor every month'],
        correctIndex: 1, explanation: 'Дар матн: «Walking for thirty minutes a day».' },
    ],
  },
  {
    id: 'cmrl55k6600atr7wjcgz9jwva', module: 'M6 Technology and Communication',
    passage: "Ten years ago most people kept their photographs in albums and their money in a wallet. Today both live on a device that fits in a pocket. That is convenient, but it also means one lost phone can do real damage. Security experts say a weak password must be the most common mistake they see. If somebody can guess your password in a few seconds, no amount of expensive technology will protect your account. Their advice is not complicated: use a long password, turn on two-step verification, and think twice before you download an unknown app. Technology is going to keep changing, but the habits that keep us safe online have stayed remarkably simple.",
    passageTranslated: 'Даҳ сол пеш одамон аксҳоро дар албом ва пулро дар ҳамён нигоҳ медоштанд. Имрӯз ҳарду дар як дастгоҳи ҷайбӣ ҷой доранд. Ин бароҳат аст, вале як телефони гумшуда метавонад зарари воқеӣ расонад. Мутахассисон мегӯянд, ки рамзи суст маъмултарин хатост. Маслиҳаташон содда аст: рамзи дароз, тасдиқи дуқадама ва эҳтиёт ҳангоми боргирии барномаи ношинос.',
    questions: [
      { question: "What is the writer's main purpose?", questionTranslated: 'Мақсади асосии муаллиф чист?',
        options: ['To explain how phones store photographs', 'To encourage safer habits online', 'To compare old and new technology prices'],
        correctIndex: 1, explanation: 'Тамоми матн ба амнияти онлайн даъват мекунад.' },
      { question: 'Why does the writer mention albums and wallets?', questionTranslated: 'Чаро муаллиф албом ва ҳамёнро ёдовар мешавад?',
        options: ['To show how much we now trust a single device', 'To argue that old methods were safer', 'To explain why people stopped printing photos'],
        correctIndex: 0, explanation: 'Муқоиса нишон медиҳад, ки ҳама чиз ба як дастгоҳ кӯчид.' },
      { question: 'What does the writer suggest about expensive technology?', questionTranslated: 'Муаллиф дар бораи технологияи гарон чӣ мегӯяд?',
        options: ['It is the best protection available', 'It cannot make up for a weak password', 'It is only needed by large companies'],
        correctIndex: 1, explanation: '«No amount of expensive technology will protect your account».' },
      { question: "In the text, 'remarkably' is closest in meaning to:", questionTranslated: 'Дар матн «remarkably» ба кадом маъно наздик аст?',
        options: ['surprisingly', 'slowly', 'rarely'],
        correctIndex: 0, explanation: 'Remarkably = ба таври ҳайратангез.' },
      { question: 'What do security experts call the most common mistake?', questionTranslated: 'Мутахассисон маъмултарин хаторо чӣ меноманд?',
        options: ['Downloading too many apps', 'Losing the phone itself', 'Using a weak password'],
        correctIndex: 2, explanation: '«A weak password must be the most common mistake».' },
    ],
  },
  {
    id: 'cmrl5do1l005a10bj2cebauso', module: 'M7 Money and Shopping',
    passage: "Ask anyone about money and you will hear the same regret: 'I wish I had started saving earlier.' If people had put aside even a small amount each month in their twenties, they would have a comfortable cushion by forty. But saving is not really about mathematics. Shops are designed to make spending feel effortless, and a card makes money invisible in a way that cash never did. Financial advisers suggest one simple test before any large purchase: wait a week. Most of the things we desperately wanted on Monday look far less necessary by the following Monday. Nobody becomes wealthy by earning alone — the habit of keeping some of what you earn matters just as much.",
    passageTranslated: 'Аз ҳар кас дар бораи пул пурсед — як пушаймониро мешунавед: «Кош барвақттар пасандоз мекардам». Вале пасандоз кардан масъалаи ҳисоб нест. Мағозаҳо тавре сохта шудаанд, ки харҷ кардан осон ҳис шавад, ва корт пулро нонамоён мекунад. Маслиҳатчиён як санҷиши содда пешниҳод мекунанд: пеш аз хариди калон як ҳафта интизор шавед. Ҳеҷ кас танҳо бо даромад сарватманд намешавад — нигоҳ доштани як қисми он ҳам ҳамон қадар муҳим аст.',
    questions: [
      { question: 'What is the main idea of the text?', questionTranslated: 'Фикри асосии матн чист?',
        options: ['Saving depends more on habit than on income', 'Shops charge unfairly high prices', 'Cards are safer to use than cash'],
        correctIndex: 0, explanation: 'Матн мегӯяд, ки одат муҳимтар аз миқдори даромад аст.' },
      { question: 'Why does the writer say a card makes money invisible?', questionTranslated: 'Чаро муаллиф мегӯяд, ки корт пулро нонамоён мекунад?',
        options: ['To explain why paying by card is faster', 'To show why spending feels easier than it should', 'To advise readers to cancel their cards'],
        correctIndex: 1, explanation: 'Вақте пулро намебинед, харҷ кардан осонтар ҳис мешавад.' },
      { question: "What is the purpose of the 'wait a week' test?", questionTranslated: 'Мақсади санҷиши «як ҳафта интизор шав» чист?',
        options: ['To find a lower price somewhere else', 'To save up enough money first', 'To let a strong desire fade'],
        correctIndex: 2, explanation: '«Look far less necessary by the following Monday».' },
      { question: "In the text, 'cushion' is closest in meaning to:", questionTranslated: 'Дар матн «cushion» ба кадом маъно наздик аст?',
        options: ['a soft seat', 'a savings reserve', 'a monthly bill'],
        correctIndex: 1, explanation: 'Дар ин ҷо cushion = захираи пул барои рӯзи мабодо.' },
      { question: 'What does the writer say about earning alone?', questionTranslated: 'Муаллиф дар бораи танҳо даромад доштан чӣ мегӯяд?',
        options: ['It is enough to become wealthy', 'It matters less than luck', 'It does not make anyone wealthy by itself'],
        correctIndex: 2, explanation: '«Nobody becomes wealthy by earning alone».' },
    ],
  },
  {
    id: 'cmrl5l6cn005bl9pg9hep5ksj', module: 'M8 Relationships and Feelings',
    passage: "A friend once asked me what made a friendship last. I told her it was not shared interests, and it was certainly not living nearby. What lasts is the willingness to repair things after an argument. Everybody falls out sometimes; the difference is that some people apologise while others wait to be forgiven. Psychologists who study long friendships report the same finding: the strongest relationships are not the ones without conflict, but the ones where both people keep showing up afterwards. That takes honesty, and it takes a certain humility, because admitting you were wrong is uncomfortable. Yet almost nobody regrets doing it. What people regret is the friendship they let go quietly, without ever saying anything at all.",
    passageTranslated: 'Дӯстам як бор пурсид, ки чӣ дӯстиро пойдор мекунад. Гуфтам: на манфиати муштарак ва на наздик зиндагӣ кардан. Он чи пойдор мекунад — омодагӣ ба барқарор кардани муносибат баъди ҷанҷол аст. Равоншиносон ҳамин хулосаро доранд: мустаҳкамтарин муносибат он нест, ки ҷанҷол надорад, балки он аст, ки ҳарду баъд аз ҷанҷол бармегарданд. Одамон аз узр хостан пушаймон намешаванд — онҳо аз дӯстие пушаймон мешаванд, ки хомӯшона гум карданд.',
    questions: [
      { question: 'What is the text mainly about?', questionTranslated: 'Матн асосан дар бораи чист?',
        options: ['Why friendships end suddenly', 'What keeps a friendship alive over time', 'How to make new friends quickly'],
        correctIndex: 1, explanation: 'Матн сабаби пойдории дӯстиро мефаҳмонад.' },
      { question: 'What does the writer suggest about conflict in a friendship?', questionTranslated: 'Муаллиф дар бораи ҷанҷол дар дӯстӣ чӣ мегӯяд?',
        options: ['It should always be avoided', 'It destroys most friendships', 'It is normal and can be repaired'],
        correctIndex: 2, explanation: '«Not the ones without conflict, but the ones where both people keep showing up».' },
      { question: 'What do people regret, according to the writer?', questionTranslated: 'Ба гуфти муаллиф, одамон аз чӣ пушаймон мешаванд?',
        options: ['Apologising too often', 'Letting a friendship fade in silence', 'Sharing too many interests'],
        correctIndex: 1, explanation: '«The friendship they let go quietly».' },
      { question: "In the text, 'humility' is closest in meaning to:", questionTranslated: 'Дар матн «humility» ба кадом маъно наздик аст?',
        options: ['not thinking too highly of yourself', 'great self-confidence', 'deep sadness'],
        correctIndex: 0, explanation: 'Humility = фурӯтанӣ.' },
      { question: 'What do psychologists say about the strongest relationships?', questionTranslated: 'Равоншиносон дар бораи мустаҳкамтарин муносибатҳо чӣ мегӯянд?',
        options: ['They have no conflict at all', 'Both people continue after a conflict', 'They are between people who live close by'],
        correctIndex: 1, explanation: '«Both people keep showing up afterwards».' },
    ],
  },
  {
    id: 'cmrl5rlvy005aztco164zrg7v', module: 'M9 Food and Cooking',
    passage: "Learning to cook is one of the few skills that pays you back every single day. People often say they have no time, and yet many of them spend longer waiting for a delivery than a simple meal would take to prepare. Cooking at home is usually cheaper, almost always fresher, and it puts you in control of what you eat. You decide how much salt goes in, and you decide whether the vegetables are still crisp. There is also something else, harder to measure: having friends round and getting the table ready turns an ordinary evening into an occasion. You do not need expensive equipment or complicated recipes. You need to start with three dishes you can make well.",
    passageTranslated: 'Пухтупаз аз он чанд малакаест, ки ҳар рӯз ба шумо баргардонида мешавад. Одамон мегӯянд вақт надоранд, вале бисёре аз онҳо дар интизори расонидани хӯрок бештар аз пухтани як хӯроки содда вақт сарф мекунанд. Дар хона пухтан арзонтар ва тозатар аст, ва шумо назорат доред. Чизи дигаре ҳам ҳаст: даъвати дӯстон ва тайёр кардани миз шоми оддиро ба ҷашн табдил медиҳад. Асбоби гарон лозим нест — аз се хӯроке ки хуб мепазед, сар кунед.',
    questions: [
      { question: "What is the writer's main purpose?", questionTranslated: 'Мақсади асосии муаллиф чист?',
        options: ['To persuade readers to cook at home', 'To compare restaurant prices', 'To explain how to grow vegetables'],
        correctIndex: 0, explanation: 'Матн хонандаро ба пухтупази хонагӣ даъват мекунад.' },
      { question: 'Why does the writer mention waiting for a delivery?', questionTranslated: 'Чаро муаллиф аз интизории расонидани хӯрок ёдовар мешавад?',
        options: ["To show that 'no time' is often not the real reason", 'To recommend a faster delivery service', 'To explain why deliveries cost so much'],
        correctIndex: 0, explanation: 'Ин узри «вақт надорам»-ро рад мекунад.' },
      { question: "What does the writer mean by 'something else, harder to measure'?", questionTranslated: '«Чизи дигар, ки ченкарданаш душвор» чист?',
        options: ['The cost of the ingredients', 'The pleasure of eating together', 'The nutritional value of the food'],
        correctIndex: 1, explanation: 'Ҷумлаи баъдӣ дар бораи даъвати дӯстон аст.' },
      { question: "In the text, 'crisp' is closest in meaning to:", questionTranslated: 'Дар матн «crisp» ба кадом маъно наздик аст?',
        options: ['firm and fresh', 'boiled very soft', 'strongly flavoured'],
        correctIndex: 0, explanation: 'Crisp = тару тоза ва сахт.' },
      { question: 'What does the writer advise a beginner to start with?', questionTranslated: 'Муаллиф ба навомӯз чӣ маслиҳат медиҳад?',
        options: ['Expensive equipment', 'Complicated recipes', 'Three dishes they can make well'],
        correctIndex: 2, explanation: '«Start with three dishes you can make well».' },
    ],
  },
  {
    id: 'cmrl5y13a00avztco8ps23l48', module: 'M10 Science and the Future',
    passage: "Every generation believes it is living through the most important moment in science, and every generation has been partly right. Diseases that had killed millions were brought under control by vaccines. Journeys that once took months are now completed in hours. Today experiments are being carried out that may allow doctors to repair damaged organs rather than replace them. But progress has never been automatic. Discoveries are made by people who are curious enough to ask an obvious question and stubborn enough to keep asking it after the first ten failures. The tools have changed enormously over the centuries. The habit of mind behind them has hardly changed at all.",
    passageTranslated: 'Ҳар насл боварӣ дорад, ки дар муҳимтарин лаҳзаи илм зиндагӣ мекунад — ва ҳар насл қисман ҳақ буд. Бемориҳое ки миллионҳоро мекуштанд, бо ваксина мағлуб шуданд. Имрӯз таҷрибаҳое мераванд, ки шояд ба духтурон имкон диҳанд узви вайроншударо таъмир кунанд, на иваз. Вале пешрафт ҳеҷ гоҳ худкор набуд. Кашфиёт аз они касонест, ки саволи оддӣ медиҳанд ва баъди даҳ нокомии аввал онро такрор мекунанд. Асбобҳо сахт тағйир ёфтанд — тарзи фикр қариб не.',
    questions: [
      { question: 'What is the main idea of the text?', questionTranslated: 'Фикри асосии матн чист?',
        options: ['Science has stopped making progress', 'Progress depends on a way of thinking, not only on tools', 'Modern research has become too expensive'],
        correctIndex: 1, explanation: 'Ҷумлаи охир: асбобҳо иваз шуданд, тарзи фикр не.' },
      { question: "Why does the writer mention 'the first ten failures'?", questionTranslated: 'Чаро муаллиф «даҳ нокомии аввал»-ро ёдовар мешавад?',
        options: ['To show that discovery needs persistence', 'To warn that most experiments are useless', 'To explain why research costs so much'],
        correctIndex: 0, explanation: 'Ин собитқадамиро нишон медиҳад.' },
      { question: 'What does the writer suggest about earlier generations?', questionTranslated: 'Муаллиф дар бораи наслҳои пешин чӣ мегӯяд?',
        options: ['They were wrong about their own importance', 'They were also right in their own way', 'They understood science better than we do'],
        correctIndex: 1, explanation: '«Every generation has been partly right».' },
      { question: "In the text, 'stubborn' is closest in meaning to:", questionTranslated: 'Дар матн «stubborn» ба кадом маъно наздик аст?',
        options: ['refusing to give up', 'highly educated', 'working very quickly'],
        correctIndex: 0, explanation: 'Stubborn = собитқадам, аз роҳи худ нагаштан.' },
      { question: 'What may doctors be able to do in the future?', questionTranslated: 'Духтурон дар оянда чӣ карда метавонанд?',
        options: ['Travel to other planets', 'Cure every disease with one vaccine', 'Repair damaged organs instead of replacing them'],
        correctIndex: 2, explanation: '«Repair damaged organs rather than replace them».' },
    ],
  },
  {
    id: 'cmrl65cu300geztco5ndtncex', module: 'M11 Society and Culture',
    passage: "My grandmother, who never travelled further than the next province, used to say that you learn most about your own country by leaving it. I did not understand her until I lived abroad. Suddenly the things I had assumed were normal — how loudly people talk, when they eat, how directly they say no — turned out to be choices my culture had made, not laws of nature. That realisation should have made me less certain about everything, and it did. But it also made me far more curious and much slower to judge. Societies that treat difference as a threat rarely grow. The ones that treat it as information about the world usually do.",
    passageTranslated: 'Бибиям, ки ҳеҷ гоҳ дуртар аз вилояти ҳамсоя нарафта буд, мегуфт: дар бораи кишвари худ бештар аз ҳама вақте мефаҳмӣ, ки аз он берун бароӣ. Инро танҳо баъди дар хориҷа зиндагӣ кардан фаҳмидам. Он чи ман «оддӣ» мепиндоштам — чӣ қадар баланд гап задан, кай хӯрок хӯрдан — интихоби фарҳанги ман буд, на қонуни табиат. Ҷомеаҳое ки фарқиятро таҳдид меҳисобанд, кам рушд мекунанд; онҳое ки онро маълумот меҳисобанд — рушд мекунанд.',
    questions: [
      { question: 'What is the text mainly about?', questionTranslated: 'Матн асосан дар бораи чист?',
        options: ['How living abroad changes the way you see your own culture', "Why the writer's grandmother never travelled", 'Which country has the best traditions'],
        correctIndex: 0, explanation: 'Тамоми матн дар бораи ҳамин тағйири нигоҳ аст.' },
      { question: 'What did the writer realise about their own habits?', questionTranslated: 'Муаллиф дар бораи одатҳои худ чӣ фаҳмид?',
        options: ['They were laws of nature', 'They were cultural choices', 'They were mistakes to correct'],
        correctIndex: 1, explanation: '«Choices my culture had made, not laws of nature».' },
      { question: 'What does the writer suggest about societies that fear difference?', questionTranslated: 'Муаллиф дар бораи ҷомеаҳое ки аз фарқият метарсанд, чӣ мегӯяд?',
        options: ['They protect their traditions best', 'They tend not to develop', 'They are usually the largest'],
        correctIndex: 1, explanation: '«Societies that treat difference as a threat rarely grow».' },
      { question: "In the text, 'assumed' is closest in meaning to:", questionTranslated: 'Дар матн «assumed» ба кадом маъно наздик аст?',
        options: ['took for granted', 'carefully proved', 'strongly disliked'],
        correctIndex: 0, explanation: 'Assumed = бе санҷиш чунин пиндоштан.' },
      { question: 'What did the grandmother use to say?', questionTranslated: 'Бибӣ чӣ мегуфт?',
        options: ['That travelling is a waste of money', 'That you learn about your country by leaving it', 'That every culture is really the same'],
        correctIndex: 1, explanation: 'Ин айнан ҷумлаи аввали матн аст.' },
    ],
  },
  {
    id: 'cmrl6hjj0005aa9919v82975q', module: 'M12 Personal Development',
    passage: "If I had understood at twenty what I understand now, I would be a more patient person today. Back then I gave up on anything I could not do well immediately, because I thought talent showed up early or not at all. In fact, almost everyone who is good at something spent a long, unglamorous period being bad at it first, and simply carried on. Progress is rarely visible from one day to the next, which is exactly why so many people stop. They are not failing; they are in the part that does not look like success yet. If you are learning something now and it feels slow, that is not evidence against you. It is what learning has always felt like from the inside.",
    passageTranslated: 'Агар дар бисту солагӣ он чиро ки ҳоло медонам мефаҳмидам, имрӯз одами сабртар мебудам. Он вақт ҳар чизеро, ки якбора хуб карда наметавонистам, партофта мерафтам, чунки гумон мекардам истеъдод фавран пайдо мешавад. Дар асл, қариб ҳар кас пеш аз он ки дар коре моҳир шавад, муддати дароз дар он бад буд ва танҳо давом дод. Пешрафт рӯз ба рӯз дида намешавад — маҳз барои ҳамин бисёриҳо бас мекунанд. Онҳо ноком нестанд; онҳо дар қисмате ҳастанд, ки ҳанӯз ба муваффақият монанд нест.',
    questions: [
      { question: "What is the writer's main message?", questionTranslated: 'Паёми асосии муаллиф чист?',
        options: ['Talent decides who will succeed', 'Slow progress is a normal part of learning', 'Learning should be stopped when it feels hard'],
        correctIndex: 1, explanation: 'Матн мегӯяд: сустии пешрафт нишони нокомӣ нест.' },
      { question: 'Why did the writer give things up at twenty?', questionTranslated: 'Чаро муаллиф дар бисту солагӣ корҳоро мепартофт?',
        options: ['Because there was no time', 'Because nobody encouraged them', 'Because they believed talent shows immediately'],
        correctIndex: 2, explanation: '«I thought talent showed up early or not at all».' },
      { question: "What does the writer mean by 'the part that does not look like success yet'?", questionTranslated: '«Қисмате ки ҳанӯз ба муваффақият монанд нест» чист?',
        options: ['A stage of real progress that feels like failure', 'A period of complete failure', 'The right moment to give up'],
        correctIndex: 0, explanation: '«They are not failing» — пешрафт ҳаст, вале дида намешавад.' },
      { question: "In the text, 'unglamorous' is closest in meaning to:", questionTranslated: 'Дар матн «unglamorous» ба кадом маъно наздик аст?',
        options: ['not exciting or impressive', 'extremely difficult', 'very short'],
        correctIndex: 0, explanation: 'Unglamorous = бе ҷило, ноҷолиб.' },
      { question: 'What does the writer say about people who stop?', questionTranslated: 'Муаллиф дар бораи касоне ки бас мекунанд, чӣ мегӯяд?',
        options: ['They are genuinely failing', 'They lack the necessary talent', 'They are not failing, only in a slow stage'],
        correctIndex: 2, explanation: '«They are not failing; they are in the part that…».' },
    ],
  },
];

let passages = 0, qs = 0;
for (const e of EXAMS) {
  const c = (await api('/comprehensions/' + e.id)).comprehension;
  await api('/comprehensions/' + e.id, 'PUT', { passage: e.passage, passageTranslated: e.passageTranslated });
  passages++;
  for (let i = 0; i < e.questions.length; i++) {
    await api('/comprehensions/questions/' + c.questions[i].id, 'PUT', e.questions[i]);
    qs++;
  }
  console.log(`  ✓ ${e.module} — матн (${e.passage.split(/\s+/).length} калима) + 5 савол`);
}
console.log(`\n✅ ${passages} матн ва ${qs} савол навишта шуд.`);
