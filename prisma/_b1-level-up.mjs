// Такмили B1 то сатҳи байналмилалӣ:
//  A) +1 машқ ба 2 мавзӯи маҷҳули M1 (5→6)
//  B) +1 reorder ба 16 мавзӯи M4-M11 (гуногунии навъҳо)
//  C) ҳар имтиҳон 5→10 савол (append, ҷавобҳо дар мавқеъҳои гуногун)
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';
const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function imp(type, parentId, items) {
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fetch(`${ORIGIN}/api/admin/import`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify({ type, parentId, mode: 'append', items }) });
      if (r.ok) return true;
      if (r.status >= 500) { await sleep(1500); continue; }
      console.log('❌', type, parentId, r.status, (await r.text()).slice(0, 90)); return false;
    } catch (e) { if (a === 4) { console.log('❌', parentId, e.message); return false; } await sleep(1500); }
  }
}
const q = (question, questionTranslated, options, correctIndex, explanation) => ({ question, questionTranslated, options, correctIndex, explanation });
const reo = (answer, tiles, tg) => ({ type: 'reorder', prompt: 'Калимаҳоро ба тартиб гузоред', promptTranslated: tg, answer, options: tiles, explanation: answer });

// ── A) ду мавзӯи маҷҳули M1 ──
const passiveAdd = [
  ['cmrl4dd7m0086v2wxwljfex79', [{ type: 'choose', prompt: 'Rice ___ grown in many Asian countries.', promptTranslated: 'Биринҷ дар бисёр кишварҳои Осиё парвариш карда мешавад.', answer: 'is', options: ['are', 'is', 'was', 'be'], explanation: 'Rice — танҳо → is + V3.' }]],
  ['cmrl4de59008pv2wx885elpen', [{ type: 'choose', prompt: 'These houses ___ built fifty years ago.', promptTranslated: 'Ин хонаҳо панҷоҳ сол пеш сохта шуда буданд.', answer: 'were', options: ['was', 'are', 'were', 'is'], explanation: 'Ҷамъ + гузашта → were + V3.' }]],
];

// ── B) reorder ба 16 мавзӯи M4-M11 ──
const reorders = [
  ['cmrl4uqzc002jr7wjp8thn3e2', reo('She has been learning English for two years.', ['for', 'She', 'English', 'has', 'two', 'been', 'years', 'learning'], 'Ҷумлаи Present Perfect Continuous созед')],
  ['cmrl4urxq0031r7wjd57eqk1x', reo('The train had left before we arrived.', ['before', 'The', 'had', 'we', 'train', 'arrived', 'left'], 'Ҷумлаи Past Perfect созед')],
  ['cmrl55edo0081r7wjg3tnw4tz', reo('I am going to visit my uncle tomorrow.', ['visit', 'I', 'to', 'my', 'am', 'tomorrow', 'going', 'uncle'], 'Ҷумлаи be going to созед')],
  ['cmrl55fbj008kr7wjgc47r98g', reo('He must be very tired today.', ['very', 'He', 'be', 'today', 'must', 'tired'], 'Ҷумлаи тахминӣ (must) созед')],
  ['cmrl5di1b002j10bjirx8na90', reo('If I had known, I would have called you.', ['I', 'If', 'had', 'would', 'known', 'I', 'called', 'have', 'you'], 'Ҷумлаи шартии сеюм созед')],
  ['cmrl5dizn003110bjufrg9aw1', reo('I wish I had more free time.', ['I', 'more', 'wish', 'had', 'I', 'time', 'free'], 'Ҷумлаи wish созед')],
  ['cmrl5l0c0002jl9pgx086r1m5', reo('She asked me where I lived.', ['me', 'She', 'where', 'asked', 'lived', 'I'], 'Саволи нақлшуда созед')],
  ['cmrl5l1fe0032l9pgi82eo5vw', reo("You like tea, don't you?", ['tea', 'You', "don't", 'like', 'you'], 'Question tag созед')],
  ['cmrl5rg0g002jztco6536r85d', reo('I enjoy cooking dinner for my family.', ['cooking', 'I', 'for', 'enjoy', 'family', 'dinner', 'my'], 'Ҷумла бо gerund созед')],
  ['cmrl5rh0b0032ztcoymlq9b8d', reo('She had her hair cut yesterday.', ['her', 'She', 'cut', 'had', 'yesterday', 'hair'], 'Сохтори каузативӣ созед')],
  ['cmrl5xv810082ztcoako5ejyf', reo('The results have been published online.', ['been', 'The', 'have', 'online', 'results', 'published'], 'Ҷумлаи мафъули Present Perfect созед')],
  ['cmrl5xw6z008lztcos9cgl53i', reo('It was such a beautiful day.', ['such', 'It', 'a', 'was', 'day', 'beautiful'], 'Ҷумла бо such созед')],
  ['cmrl656n500dnztcogip8auia', reo('My father, who is a doctor, works hard.', ['who', 'My', 'a', 'father', 'works', 'is', 'hard', 'doctor'], 'Ҷумлаи пайрави тавзеҳӣ созед')],
  ['cmrl657kq00e5ztcocyancetz', reo('You should have told me earlier.', ['have', 'You', 'me', 'should', 'earlier', 'told'], 'Ҷумлаи should have созед')],
  ['cmrl6hdga002ja991i6jdc6nn', reo('If I had studied, I would be a doctor now.', ['had', 'If', 'I', 'would', 'studied', 'I', 'now', 'be', 'a', 'doctor'], 'Ҷумлаи шартии омехта созед')],
  ['cmrl6hegl0031a99196sxjo2r', reo('She decided to take up yoga.', ['to', 'She', 'up', 'decided', 'yoga', 'take'], 'Ҷумла бо феъли таркибӣ созед')],
];

// ── C) имтиҳонҳо: +5 саволи омехта (ҷавобҳо дар мавқеъҳои гуногун!) ──
const EXAMS = {
  // M0 Travel
  'cmrl4b16g005ev2wxstvkc32i': [
    q('Have you booked the hotel ___?', 'Оё меҳмонхонаро аллакай банд кардӣ?', ['already', 'just', 'yet', 'ever'], 2, 'Дар савол — yet дар охир.'),
    q('While we ___ to the airport, it started to rain.', 'Ҳангоме ки мо ба фурудгоҳ мерафтем, борон сар шуд.', ['were driving', 'drove', 'drive', 'had driven'], 0, 'Замина → Past Continuous.'),
    q('The place where you wait to get on the plane is the ___.', 'Ҷое ки барои савор шудан интизор мешавед — ин…', ['terminal', 'customs', 'gate', 'security'], 2, 'gate = дарвозаи саворшавӣ.'),
    q('She ___ her suitcase when the taxi arrived.', 'Вақте такси омад, вай ҷомадонашро ҷамъ мекард.', ['packed', 'was packing', 'packs', 'has packed'], 1, 'Амали давомдор + ҳодиса → Past Continuous.'),
    q('If your flight is cancelled, you can ask for a ___.', 'Агар парвозатон бекор шавад, метавонед … пурсед.', ['receipt', 'delay', 'passenger', 'refund'], 3, 'refund = баргаштани пул.'),
  ],
  // M1 Education and Work
  'cmrl4dl1400axv2wxc8yjmbz4': [
    q('English ___ spoken in many countries.', 'Англисӣ дар бисёр кишварҳо гуфта мешавад.', ['are', 'is', 'was', 'be'], 1, 'Passive ҳозира: is + spoken.'),
    q('The company ___ founded in 1990.', 'Ширкат соли 1990 таъсис ёфта буд.', ['was', 'is', 'were', 'has'], 0, 'Passive гузашта: was founded.'),
    q('When you want a job, you ___ for it.', 'Вақте кор мехоҳед, ба он … медиҳед.', ['ask', 'look up', 'apply', 'employ'], 2, 'apply for a job = ариза додан.'),
    q('The reports ___ checked by the manager every week.', 'Ҳисоботҳо ҳар ҳафта аз ҷониби мудир тафтиш мешаванд.', ['is', 'be', 'was', 'are'], 3, 'Ҷамъ, ҳозира → are checked.'),
    q('Where ___ these phones made?', 'Ин телефонҳо дар куҷо истеҳсол мешаванд?', ['are', 'is', 'do', 'was'], 0, 'Саволи passive: Where are … made?'),
  ],
  // M2 Entertainment and Media
  'cmrl4e0ni00giv2wxq7o6snz6': [
    q('The actor ___ starred in that film is very famous.', 'Актёре ки дар он филм нақш бозид, хеле машҳур аст.', ['which', 'who', 'where', 'what'], 1, 'Одам → who.'),
    q('She said that she ___ tired.', 'Вай гуфт, ки хаста аст.', ['is', 'be', 'was', 'were'], 2, 'Reported speech: is → was.'),
    q('The cinema ___ we first met has closed.', 'Кинотеатре ки мо бори аввал вохӯрдем, баста шуд.', ['where', 'who', 'which', 'when'], 0, 'Ҷой → where.'),
    q('He told me he ___ the article the day before.', 'Ӯ гуфт, ки мақоларо як рӯз пеш хонда буд.', ['reads', 'has read', 'read', 'had read'], 3, 'Reported: past → past perfect.'),
    q('A story that is not true but spreads online is called ___ news.', 'Хабари бардурӯғе ки дар интернет паҳн мешавад — ин…', ['viral', 'fake', 'breaking', 'live'], 1, 'fake news = хабари қалбакӣ.'),
  ],
  // M3 Environment and Nature
  'cmrl4ejj700m3v2wxof9x78d7': [
    q('If we recycle more, we ___ less rubbish.', 'Агар бештар коркард кунем, партови камтар истеҳсол мекунем.', ['will produce', 'would produce', 'produced', 'produce'], 0, '1st conditional: will + V.'),
    q('If I ___ rich, I would plant a million trees.', 'Агар сарватманд мебудам, як миллион дарахт мешинондам.', ['am', 'was being', 'were', 'will be'], 2, '2nd conditional: If I were.'),
    q('Animals that may disappear forever are ___ species.', 'Ҳайвоноте ки метавонанд абадан нест шаванд — намудҳои…', ['dangerous', 'endangered', 'wild', 'rare'], 1, 'endangered = зери хатар.'),
    q('Unless we act now, the ice ___ melting.', 'Агар ҳозир амал накунем, ях об шуданро идома медиҳад.', ['would keep', 'kept', 'keeps', 'will keep'], 3, 'Unless + present → will.'),
    q('If people stopped using plastic bags, the oceans ___ cleaner.', 'Агар одамон халтаҳои пластикиро бас мекарданд, уқёнусҳо тозатар мешуданд.', ['would be', 'will be', 'are', 'were'], 0, '2nd conditional: would be.'),
  ],
  // M4 Health and Lifestyle
  'cmrl4ux090059r7wj68idml0p': [
    q('She ___ been feeling ill for a week.', 'Вай як ҳафта боз худро бемор ҳис карда истодааст.', ['have', 'is', 'has', 'was'], 2, 'She → has been feeling.'),
    q('By the time the doctor arrived, the pain ___ stopped.', 'То омадани духтур дард қатъ шуда буд.', ['had', 'has', 'have', 'was'], 0, 'Past Perfect: had stopped.'),
    q('A written order from a doctor for medicine is a ___.', 'Фармони хаттии духтур барои дору — ин…', ['recipe', 'prescription', 'receipt', 'remedy'], 1, 'prescription = дорунома.'),
    q('How long ___ you been waiting here?', 'Шумо чанд вақт боз ин ҷо интизоред?', ['are', 'did', 'was', 'have'], 3, 'Present Perfect Continuous: have you been waiting.'),
    q('A sign of illness, like a cough or fever, is a ___.', 'Нишонаи беморӣ, мисли сулфа ё табларза — ин…', ['symptom', 'treatment', 'vaccine', 'diagnosis'], 0, 'symptom = аломати беморӣ.'),
  ],
  // M5 Technology
  'cmrl55k6600atr7wjcgz9jwva': [
    q('Look at those black clouds — it ___ rain.', 'Ба он абрҳои сиёҳ нигар — борон меборад.', ['will', 'is going to', 'would', 'must'], 1, 'Далели аён → going to.'),
    q('The lights are off. They ___ be at home.', 'Чароғҳо хомӯшанд. Онҳо наметавонанд дар хона бошанд.', ["can't", 'must', 'might', 'should'], 0, 'Номумкин → can\'t.'),
    q('A copy of your files kept for safety is a ___.', 'Нусхаи файлҳо барои бехатарӣ — ин…', ['virus', 'spam', 'backup', 'signal'], 2, 'backup = нусхаи эҳтиётӣ.'),
    q('I ___ Anna at six — we arranged it yesterday.', 'Ман соати шаш бо Анна вомехӯрам — дирӯз мувофиқа кардем.', ['will meet', 'must meet', 'meet', 'am meeting'], 3, 'Вохӯрии муайяншуда → Present Continuous.'),
    q("His car is outside, so he ___ be at work.", 'Мошинаш дар берун аст, пас ӯ бояд дар кор бошад.', ['must', "can't", 'would', 'will'], 0, 'Тахмини қавӣ → must.'),
  ],
  // M6 Money and Shopping
  'cmrl5do1l005a10bj2cebauso': [
    q('If I had checked the price first, I ___ have paid less.', 'Агар аввал нархро месанҷидам, камтар пардохт мекардам.', ['will', 'would', 'can', 'must'], 1, '3rd conditional: would have paid.'),
    q('I wish I ___ more about investing money.', 'Кош ман дар бораи сармоягузорӣ бештар медонистам.', ['know', 'have known', 'knew', 'will know'], 2, 'wish + Past Simple.'),
    q('The extra money a bank charges you for a loan is ___.', 'Пули иловагие ки бонк барои қарз мегирад — ин…', ['interest', 'profit', 'tax', 'balance'], 0, 'interest = фоизи бонкӣ.'),
    q('If they had saved money, they ___ have gone bankrupt.', 'Агар пул сарфа мекарданд, муфлис намешуданд.', ['would', 'will not', 'should', "wouldn't"], 3, 'Манфӣ: wouldn\'t have gone.'),
    q('To argue about the price at a market is to ___.', 'Дар бозор сари нарх баҳс кардан — ин…', ['refund', 'haggle', 'invest', 'purchase'], 1, 'haggle = чакчак кардани нарх.'),
  ],
  // M7 Relationships
  'cmrl5l6cn005bl9pg9hep5ksj': [
    q('He asked me where I ___.', 'Ӯ пурсид, ки ман куҷо кор мекунам.', ['work', 'worked', 'am working', 'works'], 1, 'Reported question → worked.'),
    q("She's your best friend, ___ she?", 'Вай дугонаи беҳтарини туст, ҳамин тавр не?', ["isn't", 'is', "doesn't", 'was'], 0, 'Мусбат → tag манфӣ.'),
    q('The teacher told us ___ quiet during the test.', 'Муаллим гуфт, ки дар вақти санҷиш ором бошем.', ['be', 'being', 'to be', 'been'], 2, 'told + to + V.'),
    q("You didn't call him yesterday, ___ you?", 'Ту дирӯз ба ӯ занг назадӣ, ҳамин тавр не?', ["didn't", "don't", 'do', 'did'], 3, 'Манфӣ → tag мусбат: did you.'),
    q('To stop being angry with someone is to ___ them.', 'Дигар аз касе хашмгин набудан — ин ӯро…', ['forgive', 'betray', 'envy', 'gossip'], 0, 'forgive = бахшидан.'),
  ],
  // M8 Food and Cooking
  'cmrl5rlvy005aztco164zrg7v': [
    q('I really enjoy ___ new dishes at the weekend.', 'Ман дар рӯзҳои истироҳат пухтани таомҳои навро дӯст медорам.', ['to cook', 'cook', 'cooking', 'cooked'], 2, 'enjoy + V-ing.'),
    q('We decided ___ a takeaway instead of cooking.', 'Мо қарор додем, ки ба ҷои пухтан хӯроки хонабар фармоем.', ['to order', 'ordering', 'order', 'ordered'], 0, 'decide + to + V.'),
    q('She had her old oven ___ last week.', 'Вай ҳафтаи гузашта танӯри кӯҳнаашро таъмир кунонд.', ['repair', 'repairing', 'to repair', 'repaired'], 3, 'have + object + V3.'),
    q('The food left after a meal is called ___.', 'Хӯроки баъд аз таом мондагӣ — ин…', ['ingredients', 'leftovers', 'portions', 'starters'], 1, 'leftovers = боқимонда.'),
    q('He is very good at ___ traditional bread.', 'Ӯ дар пухтани нони анъанавӣ хеле моҳир аст.', ['bake', 'to bake', 'baking', 'baked'], 2, 'preposition + V-ing.'),
  ],
  // M9 Science
  'cmrl5y13a00avztco8ps23l48': [
    q('A new species ___ been discovered in the ocean.', 'Дар уқёнус намуди нав кашф шудааст.', ['has', 'have', 'is', 'was'], 0, 'has been discovered.'),
    q('It was ___ an interesting experiment that everyone talked about it.', 'Ин чунин озмоиши ҷолиб буд, ки ҳама дар борааш гап мезаданд.', ['so', 'too', 'such', 'enough'], 2, 'such + a + сифат + исм.'),
    q('The samples must ___ kept in a cold place.', 'Намунаҳо бояд дар ҷои хунук нигоҳ дошта шаванд.', ['being', 'be', 'been', 'to be'], 1, 'must + be + V3.'),
    q('A scientific idea that must be tested is a ___.', 'Ғояи илмие ки бояд санҷида шавад — ин…', ['conclusion', 'formula', 'evidence', 'hypothesis'], 3, 'hypothesis = фарзия.'),
    q('The new satellite ___ be launched next month.', 'Моҳвораи нав моҳи оянда ба кор андохта мешавад.', ['will', 'has', 'is', 'was'], 0, 'Future passive: will be launched.'),
  ],
  // M10 Society and Culture
  'cmrl65cu300geztco5ndtncex': [
    q('My uncle, ___ lives in London, is visiting us next week.', 'Тағоям, ки дар Лондон зиндагӣ мекунад, ҳафтаи оянда меояд.', ['which', 'who', 'that', 'where'], 1, 'Одам, тавзеҳӣ → who.'),
    q('You ___ have told me the meeting was cancelled — I waited an hour!', 'Ту бояд мегуфтӣ, ки вохӯрӣ бекор шуд — ман як соат интизор шудам!', ['should', 'must', "can't", 'might'], 0, 'Интиқод → should have.'),
    q('The floor is wet. Someone ___ have spilled water.', 'Фарш тар аст. Касе бояд об рехта бошад.', ['should', "can't", 'must', 'would'], 2, 'Тахмини қавии гузашта → must have.'),
    q('Treating people unfairly because of their group is ___.', 'Муомилаи ноодилона бо одамон аз рӯи гурӯҳашон — ин…', ['diversity', 'tolerance', 'equality', 'discrimination'], 3, 'discrimination = табъиз.'),
    q('Samarkand, ___ my grandmother was born, is a beautiful city.', 'Самарқанд, ки бибиям дар он таваллуд шудааст, шаҳри зебост.', ['where', 'which', 'who', 'that'], 0, 'Ҷой → where.'),
  ],
  // M11 Personal Development
  'cmrl6hjj0005aa9919v82975q': [
    q('If I had learned English earlier, I ___ fluent now.', 'Агар англисиро барвақттар меомӯхтам, ҳоло озод гап мезадам.', ['will be', 'would be', 'would have been', 'am'], 1, 'Mixed conditional: would be (ҳозира).'),
    q("Don't give ___ — you are almost at your goal!", 'Даст накаш — ту қариб ба ҳадаф расидӣ!', ['up', 'off', 'out', 'in'], 0, 'give up = даст кашидан.'),
    q('We should not put ___ this decision any longer.', 'Мо набояд ин қарорро дигар ба таъхир андозем.', ['up', 'on', 'off', 'away'], 2, 'put off = ба таъхир андохтан.'),
    q('An experienced person who guides you in your career is a ___.', 'Шахси ботаҷрибае ки шуморо дар касб роҳнамоӣ мекунад — ин…', ['colleague', 'mentor', 'candidate', 'freelancer'], 1, 'mentor = устод/роҳнамо.'),
    q("If he weren't so lazy, he ___ have finished the project already.", 'Агар ӯ ин қадар танбал намебуд, лоиҳаро аллакай тамом мекард.', ['will', 'must', 'can', 'would'], 3, 'Mixed: would have finished (гузашта).'),
  ],
};

// ── иҷро ──
let ok = 0, fail = 0;
for (const [topicId, items] of passiveAdd) (await imp('grammar_exercises', topicId, items)) ? ok++ : fail++;
for (const [topicId, ex] of reorders) (await imp('grammar_exercises', topicId, [ex])) ? ok++ : fail++;
for (const [compId, items] of Object.entries(EXAMS)) (await imp('comprehension_questions', compId, items)) ? ok++ : fail++;
console.log(`✅ Муваффақ: ${ok} | Ноком: ${fail} (2 passive + 16 reorder + 12 имтиҳон = 30 амал)`);
