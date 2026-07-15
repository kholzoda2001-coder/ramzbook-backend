// B1 comprehension-ро ба сатҳи CEFR B1 мебарорад: ҳар матн 6 савол —
// ғоя(gist) + тафсил + хулосабарорӣ(inference) + маънои калима + мақсад/муносибат.
// mode:'replace' тавассути /api/admin/import.
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';
const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// q(question, tg, options[], correctIndex, explanation)
const q = (question, questionTranslated, options, correctIndex, explanation) => ({ question, questionTranslated, options, correctIndex, explanation });

const SETS = {
  // ── M0 listening: A Nightmare Journey ──
  'cmrl4avq0003ov2wxmb9effj9': [
    q('What is the main idea of the story?', 'Ғояи асосии ҳикоя чист?', ['A difficult journey that ended well','A relaxing holiday in Paris','How to book a cheap flight','A guard who lost a purse'], 0, 'gist — сафари вазнин, вале хушанҷом.'),
    q('Why did Sarah miss her flight?', 'Чаро Сара ба парвозаш дер монд?', ['Because of a traffic jam','Because she woke up late','Because her car broke down','Because she lost her ticket'], 0, 'тафсил: “a huge traffic jam”.'),
    q('How did Sarah most likely feel at the check-in desk?', 'Сара дар назди мизи қайд эҳтимол чӣ ҳис кард?', ['Upset and stressed','Calm and happy','Bored','Proud'], 0, 'inference: парвозро аз даст дод → ноумед.'),
    q('In the text, "exhausted" is closest in meaning to:', 'Дар матн “exhausted” ба кадом маъно наздик аст?', ['Very tired','Very angry','Very hungry','Very late'], 0, 'vocab-in-context: exhausted = хеле хаста.'),
    q('Why was Sarah still positive at the end?', 'Чаро Сара дар охир ҳанӯз рӯҳияи хуб дошт?', ['She was looking forward to her holiday','She got her money back','She caught an earlier flight','She met a friend'], 0, 'inference: “looking forward to her holiday”.'),
    q('What does the story suggest about travelling?', 'Ҳикоя дар бораи сафар чиро ишора мекунад?', ['Problems can happen but things may still work out','Travelling is always easy','You should never fly','Airports are safe places'], 0, 'inference/attitude.'),
  ],
  // ── M0 reading: The Importance of Complaining ──
  'cmrl4axd9004cv2wx9fvvyxpq': [
    q('What is the writer’s main purpose?', 'Мақсади асосии нависанда чист?', ['To encourage people to complain politely','To criticise airline staff','To sell plane tickets','To describe a hotel'], 0, 'purpose: тарғиби шикояти хушмуомила.'),
    q('What percentage of complaining passengers got a refund or free ticket?', 'Чанд фоизи мусофирони шикояткунанда пул ё чиптаи ройгон гирифтанд?', ['60%','16%','100%','6%'], 0, 'тафсил: “60% of passengers”.'),
    q('Why do many people stay quiet about problems?', 'Чаро бисёр одамон дар бораи мушкилот хомӯш мемонанд?', ['They don’t want to cause a problem','They enjoy bad service','They have no time','They are not allowed to speak'], 0, 'inference: “don’t want to cause a problem”.'),
    q('In the text, "evidence" is closest in meaning to:', 'Дар матн “evidence” ба кадом маъно наздик аст?', ['Proof or facts','A loud voice','A free gift','An apology'], 0, 'vocab-in-context: evidence = далел.'),
    q('According to the writer, why shouldn’t you shout at the staff?', 'Ба гуфти нависанда, чаро набояд ба кормандон дод занед?', ['They are usually just doing their jobs','They never listen','They will call the police','They are the owners'], 0, 'inference: “just doing their jobs”.'),
    q('What extra benefit does complaining bring, according to the text?', 'Ба гуфти матн, шикоят кадом фоидаи иловагӣ меорад?', ['It helps the company improve for future customers','It makes tickets cheaper','It gives you a new job','It stops all delays'], 0, 'inference: “help the company improve”.'),
  ],
  // ── M1 listening: The First Job Interview ──
  'cmrl4dgeu0098v2wxik2krrq2': [
    q('What is the passage mainly about?', 'Матн асосан дар бораи чист?', ['A graduate’s first job interview','A university lecture','A bank robbery','A holiday plan'], 0, 'gist.'),
    q('How did Mark prepare for the interview?', 'Марк чӣ гуна ба мусоҳиба омода шуд?', ['By reading about the company and practising answers','By buying a new suit','By calling the manager','By doing nothing'], 0, 'тафсил.'),
    q('Although Mark lacked experience, why did he do well?', 'Гарчанде Марк таҷриба надошт, чаро хуб баромад кард?', ['He spoke confidently','He knew the manager','He was very lucky','He had a long CV'], 0, 'inference: “spoke confidently”.'),
    q('In the text, "thrilled" is closest in meaning to:', 'Дар матн “thrilled” ба кадом маъно наздик аст?', ['Very excited and happy','Very tired','Very nervous','Very angry'], 0, 'vocab-in-context.'),
    q('Why was the job important to Mark?', 'Чаро ин кор барои Марк муҳим буд?', ['It was a chance to start his career','It was near his home','It paid very little','It was only temporary'], 0, 'inference: “start his career”.'),
    q('What can we infer about Mark’s character?', 'Дар бораи хислати Марк чӣ хулоса баровардан мумкин аст?', ['He is hard-working and determined','He is lazy','He dislikes work','He is dishonest'], 0, 'inference.'),
  ],
  // ── M1 reading: The Modern Workplace ──
  'cmrl4di6c009vv2wxxlugjfjc': [
    q('What is the best title for this text?', 'Барои ин матн беҳтарин сарлавҳа кадом аст?', ['How work has changed in recent years','The history of offices','How to get a promotion','Why offices are closing'], 0, 'gist/title.'),
    q('What accelerated the shift to remote work?', 'Гузаришро ба кори фосилавӣ чӣ тезонд?', ['Global events','Higher salaries','New laptops','Longer holidays'], 0, 'тафсил.'),
    q('What does the writer suggest about productivity?', 'Нависанда дар бораи маҳсулнокӣ чиро ишора мекунад?', ['It does not depend on a fixed location','It is falling everywhere','It needs a big office','It is impossible at home'], 0, 'inference.'),
    q('In the text, "blurred" is closest in meaning to:', 'Дар матн “blurred” ба кадом маъно наздик аст?', ['Less clear / mixed together','Completely separate','Very strict','Brightly coloured'], 0, 'vocab-in-context.'),
    q('Why are open-plan offices being redesigned?', 'Чаро офисҳои кушода аз нав тарҳрезӣ мешаванд?', ['To include quiet zones for well-being','To fit more desks','To save electricity','To remove computers'], 0, 'inference: диққат ба некӯаҳволӣ.'),
    q('What new challenge does the modern professional face?', 'Мутахассиси муосир бо кадом душвории нав рӯ ба рӯ мешавад?', ['The work–life boundary has become blurred','There are no computers','Offices are too quiet','There is no teamwork'], 0, 'тафсил/inference.'),
  ],
  // ── M2 listening: The Fake News Story ──
  'cmrl4dwd500etv2wx5zkx88j6': [
    q('What is the main message of the story?', 'Паёми асосии ҳикоя чист?', ['Do not believe everything you read online','Actors always retire early','News websites never make mistakes','Social media is useless'], 0, 'gist/message.'),
    q('What did the headline claim?', 'Сарлавҳа чӣ иддао кард?', ['The actor was retiring forever','The actor was getting married','The actor was ill','The actor had moved abroad'], 0, 'тафсил.'),
    q('How did fans react to the article?', 'Мухлисон ба мақола чӣ гуна вокуниш нишон доданд?', ['They were sad and shared it','They laughed','They ignored it','They were angry at fans'], 0, 'тафсил/inference.'),
    q('In the text, "fake" is closest in meaning to:', 'Дар матн “fake” ба кадом маъно наздик аст?', ['Not real / false','Very old','Expensive','Popular'], 0, 'vocab-in-context.'),
    q('Why did the actor upload a video?', 'Чаро актёр видео ҷойгир кард?', ['To tell fans the news was not true','To announce his retirement','To sell tickets','To thank the journalist'], 0, 'inference/purpose.'),
    q('What does the actor’s advice suggest?', 'Маслиҳати актёр чиро ишора мекунад?', ['We should check facts before believing news','We should never use the internet','Fans should stop watching films','Journalists are always right'], 0, 'inference.'),
  ],
  // ── M2 reading: The Impact of Streaming ──
  'cmrl4dxkg00fgv2wxugcivgcs': [
    q('What is the text mainly about?', 'Матн асосан дар бораи чист?', ['How streaming has changed entertainment','How to make a film','The history of cinemas','How to become a musician'], 0, 'gist.'),
    q('Why is streaming convenient for the audience?', 'Чаро стриминг барои тамошобинон қулай аст?', ['They can watch anywhere on their devices','It is always free','It has no adverts','It pays artists well'], 0, 'тафсил.'),
    q('What problem do many artists complain about?', 'Бисёр ҳунармандон аз кадом мушкилӣ шикоят мекунанд?', ['Streaming services do not pay them fairly','Their songs are too long','Nobody listens to music','Cinemas are closing'], 0, 'тафсил/inference.'),
    q('In the text, "struggling" is closest in meaning to:', 'Дар матн “struggling” ба кадом маъно наздик аст?', ['Finding it difficult','Succeeding easily','Closing forever','Growing quickly'], 0, 'vocab-in-context.'),
    q('What is the writer’s overall attitude to streaming?', 'Муносибати умумии нависанда ба стриминг чӣ гуна аст?', ['It has both benefits and problems','It is completely bad','It is perfect','It will soon disappear'], 0, 'attitude/inference (balanced).'),
    q('What does "here to stay" suggest about streaming?', '“Here to stay” дар бораи стриминг чиро ишора мекунад?', ['It will continue in the future','It will end next year','It is illegal','It is a secret'], 0, 'vocab/inference.'),
  ],
  // ── M3 listening: The Rainforest Rescue ──
  'cmrl4ef6z00kev2wx6evk76ta': [
    q('What is the story mainly about?', 'Ҳикоя асосан дар бораи чист?', ['A quick rescue that saved wildlife from a fire','A holiday in the Amazon','How to study insects','A helicopter accident'], 0, 'gist.'),
    q('How did the team leader call for help?', 'Роҳбари даста чӣ гуна кӯмак ҷеғ зад?', ['Using a satellite phone','By shouting','By sending a letter','By lighting a fire'], 0, 'тафсил.'),
    q('What would have happened without the fast response?', 'Бе вокуниши зуд чӣ мешуд?', ['The disaster would have been much worse','Nothing would change','The fire would stop itself','The insects would grow'], 0, 'inference (3rd conditional in text).'),
    q('In the text, "endangered" is closest in meaning to:', 'Дар матн “endangered” ба кадом маъно наздик аст?', ['At risk of dying out','Very common','Extremely large','Recently discovered'], 0, 'vocab-in-context.'),
    q('Why does the writer mention global warming?', 'Чаро нависанда гармшавии глобалиро зикр мекунад?', ['To explain why such fires happen more often','To praise the weather','To sell satellite phones','To describe the insects'], 0, 'purpose/inference.'),
    q('What can we infer about the scientists?', 'Дар бораи олимон чӣ хулоса баровардан мумкин аст?', ['They acted responsibly in an emergency','They started the fire','They ignored the smoke','They were careless'], 0, 'inference.'),
  ],
  // ── M3 reading: The Plastic Problem ──
  'cmrl4egix00l1v2wx9a78h3nc': [
    q('What is the main idea of the text?', 'Ғояи асосии матн чист?', ['Plastic pollution is a serious problem that needs action','Plastic is cheap and useful','Oceans are always clean','Animals like eating plastic'], 0, 'gist.'),
    q('Why do marine animals eat plastic?', 'Чаро ҳайвоноти баҳрӣ пластикро мехӯранд?', ['They mistake it for food','They enjoy the taste','They are told to','It is healthy'], 0, 'тафсил.'),
    q('What does the text say about how long plastic lasts?', 'Матн дар бораи чанд вақт мондани пластик чӣ мегӯяд?', ['It can take hundreds of years to break down','It disappears in a week','It never changes shape','It melts in the sun'], 0, 'тафсил.'),
    q('In the text, "alternatives" is closest in meaning to:', 'Дар матн “alternatives” ба кадом маъно наздик аст?', ['Other options you can use instead','Expensive machines','Ocean animals','Types of plastic'], 0, 'vocab-in-context.'),
    q('What does the writer suggest small steps are not enough for?', 'Нависанда мегӯяд қадамҳои хурд барои чӣ кофӣ нестанд?', ['Unless global companies change their packaging','Unless people stop recycling','Unless we buy more plastic','Unless the sun gets hotter'], 0, 'inference.'),
    q('What is the writer’s main purpose?', 'Мақсади асосии нависанда чист?', ['To warn readers and encourage action','To entertain readers','To sell paper bags','To describe turtles'], 0, 'purpose.'),
  ],
  // ── M4 listening: A Visit to the Doctor ──
  'cmrl4uswn003jr7wjylzht95f': [
    q('What is the main point of the story?', 'Нуктаи асосии ҳикоя чист?', ['A tired man had a minor illness and recovered','A man broke his leg','A doctor was ill','A man lost his job'], 0, 'gist.'),
    q('What were Omar’s symptoms?', 'Аломатҳои Умар кадомҳо буданд?', ['A sore throat, cough and slight fever','A broken arm','A headache only','A rash'], 0, 'тафсил.'),
    q('Why had Omar been worried before the visit?', 'Чаро Умар пеш аз ташриф нигарон буд?', ['He thought it might be something serious','He had no money','He disliked doctors','He had missed work'], 0, 'inference.'),
    q('In the text, "relieved" is closest in meaning to:', 'Дар матн “relieved” ба кадом маъно наздик аст?', ['Glad that a worry has gone','Very sick','Very tired','Angry'], 0, 'vocab-in-context.'),
    q('What lifestyle advice did the doctor give?', 'Духтур кадом маслиҳати тарзи ҳаёт дод?', ['Eat a balanced diet and avoid stress','Work harder','Travel more','Drink coffee'], 0, 'тафсил/inference.'),
    q('What does the story suggest about rest?', 'Ҳикоя дар бораи истироҳат чиро ишора мекунад?', ['Rest can help the body recover','Rest is a waste of time','Rest makes you weaker','Rest causes illness'], 0, 'inference.'),
  ],
  // ── M4 reading: Why Sleep Matters ──
  'cmrl4utzx0047r7wj31zj1au3': [
    q('What is the text mainly about?', 'Матн асосан дар бораи чист?', ['Why sleep is important and how to sleep better','How to stay awake all night','The best time to eat','Why screens are useful'], 0, 'gist.'),
    q('What happens in the body during sleep?', 'Ҳангоми хоб дар ҷисм чӣ рӯй медиҳад?', ['It repairs itself and the brain stores information','It stops completely','It uses more energy','It grows taller'], 0, 'тафсил.'),
    q('What does poor sleep lead to over time?', 'Хоби бад бо мурури замон ба чӣ оварда мерасонад?', ['More stress and health problems','Better memory','More energy','Nothing at all'], 0, 'тафсил/inference.'),
    q('In the text, "concentrate" is closest in meaning to:', 'Дар матн “concentrate” ба кадом маъно наздик аст?', ['Focus your attention','Fall asleep','Feel happy','Eat well'], 0, 'vocab-in-context.'),
    q('Why does the writer list simple habits?', 'Чаро нависанда одатҳои соддаро номбар мекунад?', ['To show how people can improve their sleep','To fill space','To sell beds','To describe a dream'], 0, 'purpose.'),
    q('What is the writer’s attitude towards sleep?', 'Муносибати нависанда ба хоб чӣ гуна аст?', ['It is essential for good health','It is a waste of time','It is only for children','It is unimportant'], 0, 'attitude.'),
  ],
  // ── M5 listening: A New Phone ──
  'cmrl55gbl0093r7wjxo59upat': [
    q('What is the story mainly about?', 'Ҳикоя асосан дар бораи чист?', ['Buying a new smartphone carefully','Losing a phone','Fixing a broken phone','Selling an old phone'], 0, 'gist.'),
    q('How did Dilnoza pay for the expensive phone?', 'Дилноза телефони гаронро чӣ гуна пардохт кард?', ['In instalments','All at once','With a gift card','She did not buy it'], 0, 'тафсил.'),
    q('Why did the assistant make a backup?', 'Чаро фурӯшанда нусхаи эҳтиётӣ сохт?', ['So that nothing would be lost','To sell more phones','Because she asked to pay less','To test the phone'], 0, 'inference/purpose.'),
    q('In the text, "features" is closest in meaning to:', 'Дар матн “features” ба кадом маъно наздик аст?', ['The special qualities of the phone','The price of the phone','The colour only','The shop assistant'], 0, 'vocab-in-context.'),
    q('What can we infer about Dilnoza?', 'Дар бораи Дилноза чӣ хулоса баровардан мумкин аст?', ['She is careful and patient with money','She wastes money','She dislikes technology','She never saves'], 0, 'inference (saved for months).'),
    q('How did Dilnoza feel about her purchase?', 'Дилноза дар бораи хариди худ чӣ ҳис кард?', ['Very happy','Disappointed','Worried','Bored'], 0, 'тафсил.'),
  ],
  // ── M5 reading: Life Online ──
  'cmrl55hja009rr7wjybig73vc': [
    q('What is the best title for this text?', 'Барои ин матн беҳтарин сарлавҳа кадом аст?', ['The benefits and risks of a connected life','How to build a phone','The history of the internet','Why phones are cheap'], 0, 'gist/title.'),
    q('What can a single video do today?', 'Имрӯз як видео чӣ карда метавонад?', ['Go viral and be seen by millions','Cook a meal','Repair a computer','Print money'], 0, 'тафсил.'),
    q('What problem does the connected life bring?', 'Ҳаёти пайваст кадом мушкилиро меорад?', ['Worries about privacy and health','Free electricity','More sleep','Cheaper phones'], 0, 'тафсил/inference.'),
    q('In the text, "instantly" is closest in meaning to:', 'Дар матн “instantly” ба кадом маъно наздик аст?', ['Immediately, without delay','Slowly','Rarely','Secretly'], 0, 'vocab-in-context.'),
    q('What does the writer think the future challenge is?', 'Нависанда фикр мекунад, ки душвории оянда чист?', ['Enjoying technology while protecting health and privacy','Buying more devices','Deleting the internet','Working less'], 0, 'inference.'),
    q('What is the writer’s overall view of technology?', 'Нигоҳи умумии нависанда ба технология чӣ гуна аст?', ['It is useful but must be used wisely','It is completely harmful','It is perfect','It is boring'], 0, 'attitude.'),
  ],
  // ── M6 listening: A Shopping Mistake ──
  'cmrl5dk5a003k10bj780gpm0w': [
    q('What lesson does Karim learn?', 'Карим кадом дарсро меомӯзад?', ['Check reviews and compare prices before buying','Always buy the cheapest item','Never buy online','Repair everything yourself'], 0, 'gist/moral.'),
    q('Why did Karim buy the laptop immediately?', 'Чаро Карим лаптопро фавран харид?', ['It had a very low price','It was a famous brand','A friend told him to','It was free'], 0, 'тафсил.'),
    q('Why couldn’t he get a refund?', 'Чаро ӯ пулро баргардонида натавонист?', ['The warranty did not cover the problem','He lost the receipt','The shop had closed','He waited too long'], 0, 'тафсил/inference.'),
    q('In the text, "disappointed" is closest in meaning to:', 'Дар матн “disappointed” ба кадом маъно наздик аст?', ['Unhappy because something was not as good as expected','Very excited','Extremely tired','Very rich'], 0, 'vocab-in-context.'),
    q('What would have happened if he had read the reviews?', 'Агар ӯ шарҳҳоро мехонд, чӣ мешуд?', ['He would not have wasted his money','He would have bought two','Nothing would change','He would have paid more'], 0, 'inference (3rd conditional).'),
    q('What does Karim’s story warn against?', 'Ҳикояи Карим аз чӣ огоҳ мекунад?', ['Making quick decisions without checking','Saving money','Using a laptop for study','Asking for a refund'], 0, 'inference.'),
  ],
  // ── M6 reading: Smart Ways to Save Money ──
  'cmrl5dlft004810bj5j2afeuz': [
    q('What is the text mainly about?', 'Матн асосан дар бораи чист?', ['Simple habits that help you save money','How to become rich quickly','Where to buy a house','Why banks are bad'], 0, 'gist.'),
    q('What is the first step to saving money?', 'Қадами аввали сарфаи пул чист?', ['Making a budget','Buying a new phone','Getting a loan','Spending more'], 0, 'тафсил.'),
    q('Why does paying with cash help you spend less?', 'Чаро пардохт бо нақд ба камтар харҷ кардан кӯмак мекунад?', ['People spend more when they can’t see the money leaving','Cash is prettier','Cards are illegal','Cash gives cashback'], 0, 'inference/reason.'),
    q('In the text, "build up" is closest in meaning to:', 'Дар матн “build up” ба кадом маъно наздик аст?', ['Increase gradually','Spend quickly','Lose slowly','Hide completely'], 0, 'vocab-in-context (phrasal).'),
    q('What does the writer suggest about subscriptions?', 'Нависанда дар бораи обунаҳо чиро пешниҳод мекунад?', ['Avoid paying for ones you never use','Buy as many as possible','They are always free','They save the most money'], 0, 'inference.'),
    q('What quality does saving money require, according to the text?', 'Ба гуфти матн, сарфаи пул кадом сифатро талаб мекунад?', ['Patience and good habits','Good luck only','A high salary','A credit card'], 0, 'тафсил.'),
  ],
  // ── M7 listening: An Old Friend ──
  'cmrl5l2e4003ll9pgzsog564k': [
    q('What is the main message of the story?', 'Паёми асосии ҳикоя чист?', ['It is never too late to forgive a friend','Never trust old friends','Weddings are boring','Arguments last forever'], 0, 'gist/message.'),
    q('Why did the two friends stop talking?', 'Чаро ду дӯст гап заданро бас карданд?', ['They had a serious argument','They moved to other cities','They got new friends','They were too busy'], 0, 'тафсил.'),
    q('How did both friends feel when they first met again?', 'Ҳарду дӯст ҳангоми аввалин вохӯрии дубора чӣ ҳис карданд?', ['Nervous','Angry','Bored','Proud'], 0, 'тафсил/inference.'),
    q('In the text, "bond" is closest in meaning to:', 'Дар матн “bond” ба кадом маъно наздик аст?', ['A close connection between people','A type of money','A written letter','A wedding gift'], 0, 'vocab-in-context.'),
    q('What did Sabina wish she had done?', 'Сабина орзу мекард, ки чӣ мекард?', ['Apologised sooner','Moved abroad','Found a new friend','Stayed silent'], 0, 'inference (wish + past perfect).'),
    q('What does Sabina finally realise?', 'Сабина дар охир чиро дарк мекунад?', ['A strong friendship is worth saving','Friends are not important','She should never marry','Weddings are a waste of time'], 0, 'inference.'),
  ],
  // ── M7 reading: What Makes a Good Friend ──
  'cmrl5l3oy0049l9pgcryk8rwf': [
    q('What is the main idea of the text?', 'Ғояи асосии матн чист?', ['What qualities make someone a good friend','How to make money from friends','Why social media is bad','How to win an argument'], 0, 'gist.'),
    q('Which qualities are said to be the most important?', 'Кадом сифатҳо муҳимтарин ҳисобида мешаванд?', ['Trust and loyalty','Money and fame','Height and looks','Speed and strength'], 0, 'тафсил.'),
    q('Why do some people with many online contacts feel lonely?', 'Чаро баъзе одамони дорои контактҳои зиёди онлайн худро танҳо ҳис мекунанд?', ['Those relationships are not deep','They have no phone','They post too much','They have no internet'], 0, 'inference.'),
    q('In the text, "sincere" is closest in meaning to:', 'Дар матн “sincere” ба кадом маъно наздик аст?', ['Honest and genuine','Very rich','Very funny','Very tall'], 0, 'vocab-in-context.'),
    q('What does the writer value more: many contacts or few real friends?', 'Нависанда чиро бештар қадр мекунад: контактҳои зиёд ё чанд дӯсти воқеӣ?', ['A few sincere friends','Many acquaintances','No friends','Only online friends'], 0, 'attitude/inference.'),
    q('What is the writer’s purpose in this text?', 'Мақсади нависанда дар ин матн чист?', ['To explain what real friendship means','To sell a product','To tell a funny joke','To describe a city'], 0, 'purpose.'),
  ],
  // ── M8 listening: A Cooking Class ──
  'cmrl5ri0i003kztcos24dc2rn': [
    q('What is the passage mainly about?', 'Матн асосан дар бораи чист?', ['Learning to cook at a class','Opening a restaurant','A cooking competition','Buying a new oven'], 0, 'gist.'),
    q('According to the teacher, what does good cooking start with?', 'Ба гуфти муаллима, ошпазии хуб аз чӣ оғоз мешавад?', ['Fresh ingredients and patience','Expensive pans','A big kitchen','Lots of money'], 0, 'тафсил.'),
    q('Why did Farrukh find baking bread the most difficult?', 'Чаро Фаррух нонпазиро душвортарин ёфт?', ['The dough needs long kneading','There was no flour','The oven was broken','Bread is expensive'], 0, 'inference/reason.'),
    q('In the text, "seasoning" is closest in meaning to:', 'Дар матн “seasoning” ба кадом маъно наздик аст?', ['Salt, spices and flavourings','Cooking oil','A type of bread','A kitchen tool'], 0, 'vocab-in-context.'),
    q('What does Farrukh believe about homemade food?', 'Фаррух дар бораи хӯроки хонагӣ чӣ бовар дорад?', ['It tastes better than a takeaway','It is too expensive','It takes no time','It is unhealthy'], 0, 'тафсил.'),
    q('What can we infer about Farrukh now?', 'Дар бораи Фаррух ҳоло чӣ хулоса баровардан мумкин аст?', ['He enjoys cooking and does it regularly','He never cooks','He dislikes his family','He gave up cooking'], 0, 'inference.'),
  ],
  // ── M8 reading: The Slow Food Movement ──
  'cmrl5rj3y0048ztcowj342gxb': [
    q('What is the main idea of the text?', 'Ғояи асосии матн чист?', ['Taking time to cook fresh food has many benefits','Fast food is the best choice','Cooking is a waste of time','Restaurants are always better'], 0, 'gist.'),
    q('Where did the slow food movement begin?', 'Ҳаракати «хӯроки оҳиста» дар куҷо оғоз ёфт?', ['In Italy','In France','In Tajikistan','In America'], 0, 'тафсил.'),
    q('Why do supporters say cooking at home is good?', 'Чаро ҷонибдорон мегӯянд пухтан дар хона хуб аст?', ['It is healthier and brings families together','It is always cheaper only','It takes no effort','It uses more salt'], 0, 'inference.'),
    q('In the text, "rely on" is closest in meaning to:', 'Дар матн “rely on” ба кадом маъно наздик аст?', ['Depend on','Cook with','Pay for','Throw away'], 0, 'vocab-in-context (phrasal).'),
    q('What disadvantage of slow food does the writer admit?', 'Нависанда кадом камбудии «хӯроки оҳиста»-ро эътироф мекунад?', ['It takes longer to prepare','It tastes bad','It is unhealthy','It has no ingredients'], 0, 'inference/balance.'),
    q('What is the writer’s attitude to slow food?', 'Муносибати нависанда ба «хӯроки оҳиста» чӣ гуна аст?', ['Mostly positive, worth the extra effort','Completely negative','Uninterested','Confused'], 0, 'attitude.'),
  ],
  // ── M9 listening: The Science Fair ──
  'cmrl5xx960095ztcoxnb9tu2l': [
    q('What is the story mainly about?', 'Ҳикоя асосан дар бораи чист?', ['A winning school science project','A car accident','A newspaper company','A university lecture'], 0, 'gist.'),
    q('Why did the team’s project win first prize?', 'Чаро лоиҳаи даста ҷои якумро гирифт?', ['The idea was very clever','It was the cheapest','It was the biggest','They were lucky'], 0, 'inference/reason.'),
    q('What did the judges say about the future of science?', 'Доварон дар бораи ояндаи илм чӣ гуфтанд?', ['It looked bright','It looked poor','It had ended','It was unimportant'], 0, 'тафсил.'),
    q('In the text, "proud" is closest in meaning to:', 'Дар матн “proud” ба кадом маъно наздик аст?', ['Pleased about an achievement','Very tired','Very shy','Very angry'], 0, 'vocab-in-context.'),
    q('What did the fair make Malika decide?', 'Намоишгоҳ Маликаро ба кадом қарор овард?', ['To study engineering at university','To leave school','To become a singer','To stop studying'], 0, 'inference.'),
    q('What does Malika now believe?', 'Малика ҳоло ба чӣ бовар дорад?', ['Young people can help solve big world problems','Science is useless','Only adults can invent things','Prizes are unimportant'], 0, 'inference/attitude.'),
  ],
  // ── M9 reading: The Future of Energy ──
  'cmrl5xydn009tztcolup9tk2n': [
    q('What is the text mainly about?', 'Матн асосан дар бораи чист?', ['Moving from dirty fuels to clean energy','Why coal is the best fuel','How to build a car','The history of electricity'], 0, 'gist.'),
    q('Why can’t we keep using coal, oil and gas forever?', 'Чаро мо наметавонем абадӣ ангишту нафту газро истифода барем?', ['They cause pollution and will run out','They are too cheap','They are too clean','They are illegal'], 0, 'inference/reason.'),
    q('How are electric cars different from petrol cars?', 'Мошинҳои барқӣ аз мошинҳои бензинӣ чӣ фарқ доранд?', ['They are charged, not filled with petrol','They use more oil','They cannot move','They need coal'], 0, 'тафсил.'),
    q('In the text, "renewable" is closest in meaning to:', 'Дар матн “renewable” ба кадом маъно наздик аст?', ['Able to be used again and never runs out','Very expensive','Very dirty','Very old'], 0, 'vocab-in-context.'),
    q('What condition does the writer give for a cleaner planet?', 'Нависанда барои сайёраи тозатар кадом шартро мегузорад?', ['If we act quickly enough','If we build more factories','If we use more petrol','If we do nothing'], 0, 'inference (1st conditional).'),
    q('What is the writer’s attitude to the future of energy?', 'Муносибати нависанда ба ояндаи энергия чӣ гуна аст?', ['Hopeful but aware of the challenge','Completely negative','Uninterested','Frightened'], 0, 'attitude.'),
  ],
  // ── M10 listening: A Traditional Wedding ──
  'cmrl658lw00eoztcoverci43b': [
    q('What is the main idea of the story?', 'Ғояи асосии ҳикоя чист?', ['Traditions are an important part of identity','Weddings are too long','City life is better','Folk songs are boring'], 0, 'gist.'),
    q('Why had Aziz never seen such customs before?', 'Чаро Азиз ҳеҷ гоҳ чунин расмҳоро надида буд?', ['He had grown up in the city','He was too young','He was ill','He lived abroad'], 0, 'тафсил/inference.'),
    q('What did the older women do at the wedding?', 'Занони калонсол дар тӯй чӣ карданд?', ['Sang folk songs passed down for generations','Cooked all day','Danced alone','Stayed silent'], 0, 'тафсил.'),
    q('In the text, "heritage" is closest in meaning to:', 'Дар матн “heritage” ба кадом маъно наздик аст?', ['Traditions passed down from the past','A type of food','A modern city','A wedding gift'], 0, 'vocab-in-context.'),
    q('What did Aziz feel he should have done?', 'Азиз ҳис кард, ки чӣ бояд мекард?', ['Visited the village more often','Studied harder','Moved to the city','Stayed home'], 0, 'inference (should have).'),
    q('What is Aziz’s attitude to cultural traditions now?', 'Муносибати Азиз ба анъанаҳои фарҳангӣ ҳоло чӣ гуна аст?', ['He values them and wants to protect them','He finds them boring','He wants to forget them','He does not care'], 0, 'attitude.'),
  ],
  // ── M10 reading: A Changing Society ──
  'cmrl659to00fcztcorumbgn7u': [
    q('What is the text mainly about?', 'Матн асосан дар бораи чист?', ['How society has changed over a hundred years','Why cities are bad','How to farm the land','The history of one family'], 0, 'gist.'),
    q('How has family life changed today?', 'Ҳаёти оилавӣ имрӯз чӣ гуна тағйир ёфтааст?', ['Households have become smaller','Families have become larger','Families have disappeared','Nothing has changed'], 0, 'тафсил.'),
    q('What does the text say about women’s rights?', 'Матн дар бораи ҳуқуқи занон чӣ мегӯяд?', ['Women now study and work in every profession','Women cannot work','Women only farm','Nothing has changed for women'], 0, 'тафсил/inference.'),
    q('In the text, "diversity" is closest in meaning to:', 'Дар матн “diversity” ба кадом маъно наздик аст?', ['A variety of different people and ideas','A single culture','A type of law','A large city'], 0, 'vocab-in-context.'),
    q('According to experts, what makes a healthy society?', 'Ба гуфти коршиносон, чӣ ҷомеаи солимро месозад?', ['Respecting diversity and treating everyone equally','Having only one religion','Having no cities','Never changing'], 0, 'inference.'),
    q('What stays the same despite all the changes?', 'Бо вуҷуди ҳама тағйирот чӣ бетағйир мемонад?', ['People still value traditions, family and identity','People stop working','Cities disappear','Technology is banned'], 0, 'тафсил.'),
  ],
  // ── M11 listening: Never Give Up ──
  'cmrl6hfil003ka991dqga3ock': [
    q('What is the main message of the story?', 'Паёми асосии ҳикоя чист?', ['Determination and patience lead to success','Natural talent is all you need','Failing once means you should stop','Exams are unfair'], 0, 'gist/message.'),
    q('What happened to Nilufar at her first exam?', 'Дар имтиҳони аввали Нилуфар чӣ шуд?', ['She failed it','She passed easily','She missed it','She was late'], 0, 'тафсил.'),
    q('What did her mentor tell her to do?', 'Устодаш ба ӯ чӣ гуфт?', ['Not to give up','To change careers','To rest for a year','To move away'], 0, 'тафсил.'),
    q('In the text, "setback" is closest in meaning to:', 'Дар матн “setback” ба кадом маъно наздик аст?', ['A problem that delays progress','A great success','A type of exam','A new friend'], 0, 'vocab-in-context.'),
    q('What would have happened if she had given up?', 'Агар вай даст мекашид, чӣ мешуд?', ['She would not be a medical student today','She would be richer','Nothing would change','She would be a teacher'], 0, 'inference (mixed conditional).'),
    q('What does Nilufar’s story teach younger students?', 'Ҳикояи Нилуфар ба донишҷӯёни ҷавонтар чӣ меомӯзонад?', ['Every obstacle is a chance to grow','Talent matters most','You should give up quickly','Exams are impossible'], 0, 'inference.'),
  ],
  // ── M11 reading: Lifelong Learning ──
  'cmrl6hgp30048a991gxf025rq': [
    q('What is the best title / main idea of the text?', 'Барои ин матн беҳтарин сарлавҳа/ғоя кадом аст?', ['Learning should continue throughout life','School is a waste of time','Only universities teach useful skills','Learning ends at eighteen'], 0, 'gist/title.'),
    q('Why may today’s skills become out of date?', 'Чаро маҳоратҳои имрӯза метавонанд кӯҳна шаванд?', ['The world changes very quickly','People forget them','Schools close','Books disappear'], 0, 'inference/reason.'),
    q('What is given as a simple example of lifelong learning?', 'Ҳамчун намунаи соддаи омӯзиши якумрӣ чӣ дода шудааст?', ['Taking an online course or reading books','Sleeping more','Buying a car','Watching TV all day'], 0, 'тафсил.'),
    q('In the text, "adaptable" is closest in meaning to:', 'Дар матн “adaptable” ба кадом маъно наздик аст?', ['Able to change and cope with new situations','Very rich','Very tired','Very strict'], 0, 'vocab-in-context.'),
    q('What is said to be the most important thing for learning?', 'Гуфта мешавад, ки муҳимтарин чиз барои омӯзиш чист?', ['Curiosity and a positive attitude','A lot of money','A university degree','Free time only'], 0, 'тафсил.'),
    q('Why does the writer quote a famous saying at the end?', 'Чаро нависанда дар охир мақоли машҳурро иқтибос меорад?', ['To stress that we should keep learning all our lives','To sell a book','To change the topic','To describe a school'], 0, 'purpose/inference.'),
  ],
};

// ── push (POST /api/admin/import, mode:replace) ──
let ok = 0, fail = 0, miss = 0;
for (const [compId, items] of Object.entries(SETS)) {
  if (!items || items.length < 5) { miss++; continue; }
  let done = false;
  for (let a = 0; a < 5 && !done; a++) {
    try {
      const r = await fetch(`${ORIGIN}/api/admin/import`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify({ type: 'comprehension_questions', parentId: compId, mode: 'replace', items }) });
      if (r.ok) { ok++; done = true; }
      else if (r.status >= 500) { await sleep(1500); }
      else { console.log('❌', compId, r.status, (await r.text()).slice(0, 90)); fail++; break; }
    } catch (e) { if (a === 4) { fail++; console.log('❌', compId, e.message); } await sleep(1500); }
  }
}
console.log(`✅ Такмил: ${ok} comprehension | Ноком: ${fail} | Холӣ: ${miss} (аз ${Object.keys(SETS).length})`);
