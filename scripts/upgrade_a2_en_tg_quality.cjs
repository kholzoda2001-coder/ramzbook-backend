const fs = require('fs');
const path = require('path');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(__dirname, '..', '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const line = raw.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL is missing');
  process.env.DATABASE_URL = line.slice('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
}

loadDatabaseUrl();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pos(word) {
  const w = word.toLowerCase().replace(/[?.!]/g, '').trim();
  if (/\s/.test(w)) return 'phrase';
  if (/^(quickly|slowly|carefully|quietly|loudly|usually|often|sometimes|rarely|never|already|yet|ago|before|later|soon|almost|especially|probably)$/.test(w)) return 'adverb';
  if (/^(better|worse|best|worst|busy|free|available|comfortable|expensive|cheap|delicious|terrible|worried|excited|bored|tired|safe|dangerous|polite|rude|modern|traditional|local|foreign|possible|impossible|necessary|important|healthy|ill|sore|broken|crowded|empty|full|ready|late|early)$/.test(w)) return 'adjective';
  if (/^(book|arrive|leave|return|repair|compare|choose|decide|explain|invite|accept|refuse|agree|disagree|borrow|lend|save|spend|earn|cost|order|reserve|cancel|complain|advise|improve|prepare|practice|remember|forget|believe|hope|plan|promise|prefer|suggest|recommend|download|upload|search|connect|print|sign|fill|change|miss|catch|check|pay|rent|move|visit|travel|stay|hurt|rest|exercise)$/.test(w)) return 'verb';
  if (/^(because|so|when|if|although|but|and|or|than)$/.test(w)) return 'conjunction';
  if (/^(across|along|through|towards|into|out|onto|off|past|over|during|until|since|for)$/.test(w)) return 'preposition';
  return 'noun';
}

function ipa(word) {
  const key = word.toLowerCase();
  const known = {
    because: '/bɪˈkɔːz/', although: '/ɔːlˈðoʊ/', through: '/θruː/', towards: '/təˈwɔːrdz/',
    enough: '/ɪˈnʌf/', comfortable: '/ˈkʌmftəbəl/', expensive: '/ɪkˈspensɪv/',
    appointment: '/əˈpɔɪntmənt/', medicine: '/ˈmedɪsən/', receipt: '/rɪˈsiːt/',
    luggage: '/ˈlʌɡɪdʒ/', journey: '/ˈdʒɜːrni/', neighbor: '/ˈneɪbər/',
    weather: '/ˈweðər/', compare: '/kəmˈper/', recommend: '/ˌrekəˈmend/',
    probably: '/ˈprɑːbəbli/', already: '/ɔːlˈredi/', promise: '/ˈprɑːmɪs/',
  };
  if (known[key]) return known[key];
  return `/${key.replace(/[^a-z ]/g, '').replace(/\s+/g, ' ')}/`;
}

function exampleFor(word, translation, part) {
  if (part === 'verb') {
    return {
      example: `I need to ${word} today.`,
      exampleTrans: `Ман бояд имрӯз ${translation}.`,
    };
  }
  if (part === 'adjective') {
    return {
      example: `It is ${word}.`,
      exampleTrans: `Ин ${translation} аст.`,
    };
  }
  if (part === 'adverb') {
    return {
      example: `Please do it ${word}.`,
      exampleTrans: `Лутфан инро ${translation} анҷом диҳед.`,
    };
  }
  if (part === 'preposition' || part === 'conjunction') {
    return {
      example: `Use "${word}" in a short sentence.`,
      exampleTrans: `"${translation}"-ро дар ҷумлаи кӯтоҳ истифода баред.`,
    };
  }
  if (part === 'phrase') {
    return { example: word, exampleTrans: translation };
  }
  return {
    example: `I need the ${word}.`,
    exampleTrans: `Ба ман ${translation} лозим аст.`,
  };
}

const vocabLessons = [
  {
    module: 'The Past 1 (was / were)',
    title: 'Past time expressions',
    titleTranslated: 'Ибораҳои вақти гузашта',
    words: [
      ['yesterday', 'дирӯз'], ['last night', 'шаби гузашта'], ['last week', 'ҳафтаи гузашта'],
      ['last month', 'моҳи гузашта'], ['last year', 'соли гузашта'], ['two days ago', 'ду рӯз пеш'],
      ['a week ago', 'як ҳафта пеш'], ['in 2020', 'дар соли 2020'], ['before', 'пештар'],
      ['after', 'баъд аз'], ['then', 'баъд'], ['finally', 'ниҳоят'],
    ],
  },
  {
    module: 'The Past 2 (irregular)',
    title: 'Irregular verbs in real life',
    titleTranslated: 'Феълҳои бесистема дар ҳаёти воқеӣ',
    words: [
      ['bought', 'харид'], ['brought', 'овард'], ['caught', 'гирифт'], ['taught', 'дарс дод'],
      ['thought', 'фикр кард'], ['found', 'ёфт'], ['lost', 'гум кард'], ['left', 'рафт/тарк кард'],
      ['met', 'вохӯрд'], ['paid', 'пардохт кард'], ['sent', 'фиристод'], ['spent', 'сарф кард'],
      ['wrote', 'навишт'], ['read', 'хонд'],
    ],
  },
  {
    module: 'Comparisons',
    title: 'Opinions and preferences',
    titleTranslated: 'Андешаҳо ва афзалиятҳо',
    words: [
      ['prefer', 'афзал донистан'], ['opinion', 'андеша'], ['reason', 'сабаб'], ['choice', 'интихоб'],
      ['better', 'беҳтар'], ['worse', 'бадтар'], ['best', 'беҳтарин'], ['worst', 'бадтарин'],
      ['similar', 'монанд'], ['different', 'фарқкунанда'], ['than', 'нисбат ба'], ['as', 'мисли'],
      ['more', 'бештар'], ['less', 'камтар'],
    ],
  },
  {
    module: 'The Future',
    title: 'Plans and arrangements',
    titleTranslated: 'Нақшаҳо ва қарорҳо',
    words: [
      ['plan', 'нақша кашидан'], ['promise', 'ваъда додан'], ['hope', 'умед доштан'],
      ['probably', 'эҳтимол'], ['maybe', 'шояд'], ['soon', 'ба зудӣ'], ['later', 'баъдтар'],
      ['tomorrow morning', 'субҳи пагоҳ'], ['next weekend', 'охири ҳафтаи оянда'],
      ['arrangement', 'созиш/нақша'], ['meeting', 'вохӯрӣ'], ['appointment', 'қабули вақт'],
      ['calendar', 'тақвим'], ['deadline', 'мӯҳлат'],
    ],
  },
  {
    module: 'Food & Quantity',
    title: 'Cooking and quantities',
    titleTranslated: 'Пухтупаз ва миқдорҳо',
    words: [
      ['ingredient', 'маҳсулоти таркибӣ'], ['recipe', 'дастури пухтупаз'], ['oil', 'равған'],
      ['flour', 'орд'], ['salt', 'намак'], ['sugar', 'шакар'], ['pepper', 'мурч'],
      ['a slice of', 'як бурида'], ['a piece of', 'як порча'], ['a bottle of', 'як шиша'],
      ['a kilo of', 'як кило'], ['enough', 'кофӣ'], ['too much', 'хеле зиёд'], ['too many', 'хеле зиёд'],
    ],
  },
  {
    module: 'Health',
    title: 'Health problems and advice',
    titleTranslated: 'Мушкилоти саломатӣ ва маслиҳат',
    words: [
      ['headache', 'дарди сар'], ['stomachache', 'дарди шикам'], ['sore throat', 'дарди гулӯ'],
      ['temperature', 'таб'], ['medicine', 'дорӯ'], ['pharmacy', 'дорухона'], ['appointment', 'вақти қабул'],
      ['patient', 'бемор'], ['doctor', 'духтур'], ['nurse', 'ҳамшира'], ['rest', 'истироҳат кардан'],
      ['exercise', 'машқ кардан'], ['healthy', 'солим'], ['ill', 'бемор'],
    ],
  },
  {
    module: 'Travel',
    title: 'Travel services',
    titleTranslated: 'Хизматрасониҳои сафар',
    words: [
      ['passport', 'шиноснома'], ['ticket office', 'кассаи билет'], ['platform', 'платформа'],
      ['gate', 'дарвозаи парвоз'], ['luggage', 'бор'], ['suitcase', 'ҷомадон'], ['reservation', 'фармоиш'],
      ['single room', 'ҳуҷраи якнафара'], ['double room', 'ҳуҷраи дунафара'], ['reception', 'қабулгоҳ'],
      ['check in', 'сабти воридшавӣ'], ['check out', 'сабти баромад'], ['delay', 'таъхир'], ['journey', 'сафар'],
    ],
  },
  {
    module: 'Work & Routine',
    title: 'Work tasks and communication',
    titleTranslated: 'Вазифаҳои корӣ ва муошират',
    words: [
      ['task', 'вазифа'], ['project', 'лоиҳа'], ['schedule', 'ҷадвал'], ['colleague', 'ҳамкор'],
      ['boss', 'сардор'], ['customer', 'муштарӣ'], ['message', 'паём'], ['email', 'почтаи электронӣ'],
      ['report', 'ҳисобот'], ['meeting', 'ҷаласа'], ['break', 'танаффус'], ['salary', 'маош'],
      ['earn', 'пул кор кардан'], ['improve', 'беҳтар кардан'],
    ],
  },
  {
    module: 'Weather & Contact',
    title: 'Weather, messages and contact',
    titleTranslated: 'Обу ҳаво, паёмҳо ва алоқа',
    words: [
      ['forecast', 'пешгӯии обу ҳаво'], ['storm', 'тӯфон'], ['fog', 'туман'], ['degree', 'дараҷа'],
      ['temperature', 'ҳарорат'], ['message', 'паём'], ['call back', 'занг задан баъдтар'],
      ['voicemail', 'паёми овозӣ'], ['contact', 'тамос'], ['address', 'суроға'], ['postcard', 'открытка'],
      ['online', 'онлайн'], ['offline', 'офлайн'], ['connect', 'пайваст шудан'],
    ],
  },
  {
    module: 'Writing & Listening',
    title: 'Useful linking words',
    titleTranslated: 'Калимаҳои пайвасткунандаи муҳим',
    words: [
      ['because', 'чунки'], ['so', 'бинобар ин'], ['when', 'вақте ки'], ['if', 'агар'],
      ['although', 'гарчанде'], ['also', 'инчунин'], ['first', 'аввал'], ['next', 'баъд'],
      ['finally', 'ниҳоят'], ['for example', 'масалан'], ['in my opinion', 'ба фикри ман'],
      ['I think that', 'ман фикр мекунам, ки'], ['I agree', 'ман розӣ ҳастам'], ['I disagree', 'ман розӣ нестам'],
    ],
  },
  {
    module: 'A2 Review',
    title: 'A2 exam useful phrases',
    titleTranslated: 'Ибораҳои муҳим барои имтиҳони A2',
    words: [
      ['Could you repeat that?', 'Метавонед онро такрор кунед?'], ['I am not sure.', 'Ман мутмаин нестам.'],
      ['Let me think.', 'Иҷозат диҳед фикр кунам.'], ['In my free time', 'Дар вақти холии ман'],
      ['I would like to', 'Ман мехоҳам'], ['The problem is', 'Мушкил ин аст'],
      ['I agree with you.', 'Ман бо шумо розӣ ҳастам.'], ['I prefer this one.', 'Ман ҳаминро афзал медонам.'],
      ['It depends.', 'Ин вобаста аст.'], ['That sounds good.', 'Ин хуб садо медиҳад.'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Devices and online life',
    titleTranslated: 'Дастгоҳҳо ва ҳаёти онлайн',
    words: [
      ['device', 'дастгоҳ'], ['screen', 'экран'], ['keyboard', 'клавиатура'], ['password', 'рамз'],
      ['account', 'ҳисоб'], ['website', 'сомона'], ['application', 'барнома'], ['notification', 'огоҳӣ'],
      ['charger', 'пуркунандаи барқ'], ['battery', 'батарея'], ['wifi', 'вай-фай'], ['signal', 'сигнал'],
      ['download', 'боргирӣ кардан'], ['upload', 'боргузорӣ кардан'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Media and entertainment',
    titleTranslated: 'Расона ва фароғат',
    words: [
      ['news', 'хабарҳо'], ['article', 'мақола'], ['headline', 'сарлавҳа'], ['channel', 'канал'],
      ['episode', 'қисм'], ['series', 'силсилафилм'], ['documentary', 'филми ҳуҷҷатӣ'], ['advertisement', 'таблиғ'],
      ['review', 'тақриз'], ['viewer', 'тамошобин'], ['audience', 'шунавандагон/тамошобинон'], ['concert', 'консерт'],
      ['exhibition', 'намоишгоҳ'], ['festival', 'фестивал'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Services and complaints',
    titleTranslated: 'Хизматрасонӣ ва шикоят',
    words: [
      ['service', 'хизматрасонӣ'], ['complaint', 'шикоят'], ['receipt', 'чек'], ['refund', 'баргардонидани пул'],
      ['exchange', 'иваз кардан'], ['guarantee', 'кафолат'], ['broken', 'шикаста'], ['missing', 'намерасад'],
      ['available', 'дастрас'], ['repair', 'таъмир кардан'], ['manager', 'мудир'], ['queue', 'навбат'],
      ['form', 'варақа'], ['signature', 'имзо'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Money and banking',
    titleTranslated: 'Пул ва бонк',
    words: [
      ['cash', 'пули нақд'], ['card', 'корт'], ['bank account', 'ҳисоби бонкӣ'], ['transfer', 'интиқол'],
      ['price', 'нарх'], ['discount', 'тахфиф'], ['bill', 'ҳисоб'], ['fee', 'пардохт/ҳақ'],
      ['save money', 'пул ҷамъ кардан'], ['spend money', 'пул сарф кардан'], ['borrow', 'қарз гирифтан'], ['lend', 'қарз додан'],
      ['expensive', 'қимат'], ['cheap', 'арзон'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Community places',
    titleTranslated: 'Ҷойҳои ҷомеа',
    words: [
      ['neighborhood', 'маҳалла'], ['community', 'ҷомеа'], ['town hall', 'бинои шаҳрдорӣ'], ['police station', 'шуъбаи милиса'],
      ['post office', 'почта'], ['sports center', 'маркази варзишӣ'], ['playground', 'майдончаи бозӣ'], ['market', 'бозор'],
      ['square', 'майдон'], ['bridge', 'пул'], ['traffic light', 'чароғак'], ['crosswalk', 'гузаргоҳи пиёдагард'],
      ['entrance', 'даромадгоҳ'], ['exit', 'баромадгоҳ'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Household problems',
    titleTranslated: 'Мушкилоти хона',
    words: [
      ['rent', 'иҷора'], ['landlord', 'соҳиби хона'], ['neighbor', 'ҳамсоя'], ['noise', 'садо/ғавғо'],
      ['heating', 'гармидиҳӣ'], ['electricity', 'барқ'], ['water bill', 'ҳисоби об'], ['repairman', 'таъмиргар'],
      ['leak', 'обравӣ'], ['key', 'калид'], ['lock', 'қулф'], ['balcony', 'айвон'],
      ['garage', 'гараж'], ['garden', 'боғча'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Life experiences',
    titleTranslated: 'Таҷрибаҳои зиндагӣ',
    words: [
      ['experience', 'таҷриба'], ['memory', 'хотира'], ['adventure', 'саргузашт'], ['event', 'ҳодиса'],
      ['accident', 'ҳодисаи нохуш'], ['surprise', 'ногаҳонӣ'], ['mistake', 'хато'], ['success', 'муваффақият'],
      ['decision', 'қарор'], ['chance', 'имконият'], ['goal', 'ҳадаф'], ['skill', 'маҳорат'],
      ['improvement', 'беҳбудӣ'], ['achievement', 'дастовард'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Story sequence words',
    titleTranslated: 'Калимаҳои пайдарпаии ҳикоя',
    words: [
      ['at first', 'дар аввал'], ['after that', 'баъд аз он'], ['suddenly', 'ногаҳон'], ['while', 'дар ҳоле ки'],
      ['during', 'дар давоми'], ['until', 'то вақте ки'], ['as soon as', 'ҳамин ки'], ['in the end', 'дар охир'],
      ['luckily', 'хушбахтона'], ['unfortunately', 'мутаассифона'], ['almost', 'қариб'], ['especially', 'махсусан'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Learning and exams',
    titleTranslated: 'Омӯзиш ва имтиҳонҳо',
    words: [
      ['subject', 'фан'], ['exam', 'имтиҳон'], ['mark', 'баҳо'], ['result', 'натиҷа'],
      ['certificate', 'сертификат'], ['course', 'курс'], ['training', 'омӯзиш'], ['practice', 'машқ кардан'],
      ['revise', 'такрор кардан'], ['pass an exam', 'имтиҳон супоридан'], ['fail an exam', 'аз имтиҳон нагузаштан'],
      ['improve', 'беҳтар кардан'], ['mistake', 'хато'], ['progress', 'пешрафт'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Work skills',
    titleTranslated: 'Маҳоратҳои корӣ',
    words: [
      ['experience', 'таҷриба'], ['interview', 'мусоҳиба'], ['application form', 'варақаи ариза'], ['CV', 'резюме'],
      ['part-time job', 'кори нимрӯза'], ['full-time job', 'кори пурра'], ['position', 'вазифа'], ['responsibility', 'масъулият'],
      ['team', 'даста'], ['training course', 'курси омӯзишӣ'], ['problem solving', 'ҳалли мушкилот'], ['communication', 'муошират'],
    ],
  },
  {
    module: 'The Past 1 (was / were)',
    title: 'Past places and events',
    titleTranslated: 'Ҷойҳо ва ҳодисаҳои гузашта',
    words: [
      ['ceremony', 'маросим'], ['wedding', 'тӯй'], ['birthday party', 'ҷашни зодрӯз'], ['trip', 'сафар'],
      ['picnic', 'сайругашт'], ['visit', 'дидор'], ['guest', 'меҳмон'], ['host', 'мизбон'],
      ['invitation', 'даъватнома'], ['memory', 'хотира'], ['photo album', 'албоми акс'], ['souvenir', 'тӯҳфаи хотиравӣ'],
    ],
  },
  {
    module: 'The Past 2 (irregular)',
    title: 'More irregular verbs',
    titleTranslated: 'Феълҳои бесистемаи бештар',
    words: [
      ['began', 'оғоз кард'], ['broke', 'шикаст'], ['chose', 'интихоб кард'], ['drove', 'ронд'],
      ['fell', 'афтод'], ['felt', 'ҳис кард'], ['forgot', 'фаромӯш кард'], ['grew', 'калон шуд/парвариш ёфт'],
      ['heard', 'шунид'], ['kept', 'нигоҳ дошт'], ['knew', 'медонист'], ['ran', 'давид'],
      ['sold', 'фурӯхт'], ['won', 'ғолиб шуд'],
    ],
  },
  {
    module: 'Comparisons',
    title: 'Describing products',
    titleTranslated: 'Тавсифи маҳсулот',
    words: [
      ['quality', 'сифат'], ['size', 'андоза'], ['weight', 'вазн'], ['material', 'мавод'],
      ['design', 'тарҳ'], ['brand', 'бренд'], ['model', 'модел'], ['feature', 'хусусият'],
      ['comfortable', 'бароҳат'], ['useful', 'фоиданок'], ['popular', 'машҳур'], ['reliable', 'боэътимод'],
      ['simple', 'содда'], ['complicated', 'мураккаб'],
    ],
  },
  {
    module: 'The Future',
    title: 'Future goals and promises',
    titleTranslated: 'Ҳадафҳо ва ваъдаҳои оянда',
    words: [
      ['goal', 'ҳадаф'], ['dream', 'орзу'], ['promise', 'ваъда'], ['decision', 'қарор'],
      ['opportunity', 'имконият'], ['risk', 'хатар'], ['chance', 'шанс'], ['success', 'муваффақият'],
      ['failure', 'нокомӣ'], ['prepare', 'тайёр шудан'], ['improve', 'беҳтар кардан'], ['continue', 'идома додан'],
      ['try again', 'дубора кӯшиш кардан'], ['give up', 'таслим шудан'],
    ],
  },
  {
    module: 'Food & Quantity',
    title: 'Restaurant problems',
    titleTranslated: 'Мушкилот дар тарабхона',
    words: [
      ['menu', 'меню'], ['starter', 'пешхӯрок'], ['main course', 'хӯроки асосӣ'], ['dessert', 'ширинӣ'],
      ['bill', 'ҳисоб'], ['tip', 'чойпулӣ'], ['service charge', 'ҳаққи хизмат'], ['reservation', 'фармоиш'],
      ['table for two', 'миз барои ду нафар'], ['vegetarian', 'гиёҳхӯр'], ['allergy', 'аллергия'], ['spicy', 'тунд'],
      ['raw', 'хом'], ['overcooked', 'аз ҳад пухта'],
    ],
  },
  {
    module: 'Health',
    title: 'At the pharmacy',
    titleTranslated: 'Дар дорухона',
    words: [
      ['painkiller', 'дорӯи дард'], ['cough syrup', 'шарбати сулфа'], ['bandage', 'бинт'], ['vitamin', 'витамин'],
      ['prescription', 'дорухат'], ['dose', 'воя'], ['twice a day', 'ду бор дар як рӯз'], ['side effect', 'таъсири иловагӣ'],
      ['allergic', 'аллергиядор'], ['blood pressure', 'фишори хун'], ['clinic', 'клиника'], ['emergency', 'ҳолати фавқулода'],
    ],
  },
  {
    module: 'Travel',
    title: 'Transport problems',
    titleTranslated: 'Мушкилоти нақлиёт',
    words: [
      ['traffic jam', 'тамбашавии роҳ'], ['miss the bus', 'аз автобус мондан'], ['catch the train', 'ба қатор расидан'],
      ['platform number', 'рақами платформа'], ['departure', 'рафтан'], ['arrival', 'расидан'], ['boarding pass', 'корти саворшавӣ'],
      ['customs', 'гумрук'], ['security check', 'санҷиши амният'], ['lost luggage', 'бори гумшуда'], ['tourist information', 'маълумоти сайёҳӣ'],
      ['map', 'харита'], ['guidebook', 'роҳнамо'],
    ],
  },
  {
    module: 'Work & Routine',
    title: 'Office and daily tasks',
    titleTranslated: 'Офис ва вазифаҳои ҳаррӯза',
    words: [
      ['printer', 'принтер'], ['document', 'ҳуҷҷат'], ['file', 'файл'], ['folder', 'папка'],
      ['copy', 'нусха'], ['print', 'чоп кардан'], ['scan', 'скан кардан'], ['sign', 'имзо кардан'],
      ['fill in', 'пур кардан'], ['deadline', 'мӯҳлат'], ['daily task', 'вазифаи ҳаррӯза'], ['weekly report', 'ҳисоботи ҳафтаина'],
      ['customer service', 'хизматрасонӣ ба муштарӣ'], ['teamwork', 'кори дастаҷамъӣ'],
    ],
  },
  {
    module: 'Weather & Contact',
    title: 'Contact details and messages',
    titleTranslated: 'Маълумоти тамос ва паёмҳо',
    words: [
      ['phone number', 'рақами телефон'], ['email address', 'суроғаи email'], ['postcode', 'индекси почта'], ['username', 'номи корбар'],
      ['profile', 'профил'], ['send a message', 'паём фиристодан'], ['reply', 'ҷавоб додан'], ['forward', 'равон кардан'],
      ['attachment', 'замима'], ['link', 'пайванд'], ['update', 'навсозӣ'], ['delete', 'нест кардан'],
    ],
  },
  {
    module: 'Writing & Listening',
    title: 'Email and message structure',
    titleTranslated: 'Сохтори email ва паём',
    words: [
      ['subject line', 'сатри мавзӯъ'], ['greeting', 'саломнома'], ['opening sentence', 'ҷумлаи оғоз'], ['main point', 'нуқтаи асосӣ'],
      ['request', 'дархост'], ['reason', 'сабаб'], ['closing sentence', 'ҷумлаи анҷом'], ['signature', 'имзо'],
      ['formal', 'расмӣ'], ['informal', 'ғайрирасмӣ'], ['polite', 'боодобона'], ['clear', 'равшан'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Online safety',
    titleTranslated: 'Амнияти онлайн',
    words: [
      ['privacy', 'махфият'], ['safe password', 'рамзи бехатар'], ['log in', 'ворид шудан'], ['log out', 'баромадан'],
      ['security', 'амният'], ['scam', 'фиреб'], ['warning', 'огоҳӣ'], ['personal information', 'маълумоти шахсӣ'],
      ['share', 'мубодила кардан'], ['block', 'маҳкам кардан'], ['report a problem', 'мушкилиро хабар додан'], ['settings', 'танзимот'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Reviews and recommendations',
    titleTranslated: 'Тақризҳо ва тавсияҳо',
    words: [
      ['recommend', 'тавсия додан'], ['rating', 'баҳогузорӣ'], ['comment', 'шарҳ'], ['advantage', 'бартарӣ'],
      ['disadvantage', 'камбудӣ'], ['compare', 'муқоиса кардан'], ['opinion', 'андеша'], ['useful feature', 'хусусияти фоиданок'],
      ['easy to use', 'истифодааш осон'], ['hard to understand', 'фаҳмиданаш душвор'], ['works well', 'хуб кор мекунад'], ['does not work', 'кор намекунад'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Official forms',
    titleTranslated: 'Варақаҳои расмӣ',
    words: [
      ['first name', 'ном'], ['last name', 'насаб'], ['date of birth', 'санаи таваллуд'], ['nationality', 'миллат/шаҳрвандӣ'],
      ['occupation', 'касб'], ['marital status', 'ҳолати оилавӣ'], ['address', 'суроға'], ['emergency contact', 'тамоси фавқулода'],
      ['signature', 'имзо'], ['required field', 'майдони ҳатмӣ'], ['optional', 'ихтиёрӣ'], ['submit', 'ирсол кардан'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Community rules',
    titleTranslated: 'Қоидаҳои ҷомеа',
    words: [
      ['rule', 'қоида'], ['permission', 'иҷозат'], ['allowed', 'иҷозат дода шудааст'], ['not allowed', 'манъ аст'],
      ['quiet hours', 'соатҳои оромӣ'], ['public transport', 'нақлиёти ҷамъиятӣ'], ['recycling', 'коркарди дубора'], ['rubbish bin', 'қуттии партов'],
      ['public library', 'китобхонаи ҷамъиятӣ'], ['community center', 'маркази ҷомеа'], ['volunteer', 'ихтиёрӣ'], ['local event', 'чорабинии маҳаллӣ'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Giving directions in town',
    titleTranslated: 'Роҳ нишон додан дар шаҳр',
    words: [
      ['go straight ahead', 'рост равед'], ['turn left', 'ба чап гардед'], ['turn right', 'ба рост гардед'], ['cross the road', 'аз роҳ гузаред'],
      ['at the corner', 'дар кунҷ'], ['opposite the bank', 'рӯ ба рӯи бонк'], ['next to the pharmacy', 'назди дорухона'], ['behind the school', 'паси мактаб'],
      ['in front of the hotel', 'дар пеши меҳмонхона'], ['near the station', 'назди истгоҳ'], ['far from here', 'аз ин ҷо дур'], ['five minutes on foot', 'панҷ дақиқа пиёда'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Feelings in stories',
    titleTranslated: 'Ҳиссиёт дар ҳикояҳо',
    words: [
      ['surprised', 'ҳайрон'], ['nervous', 'асабонӣ'], ['relieved', 'осуда'], ['disappointed', 'ноумед'],
      ['proud', 'ифтихорманд'], ['confused', 'сардаргум'], ['embarrassed', 'шарманда'], ['lonely', 'танҳо'],
      ['calm', 'ором'], ['worried', 'нигарон'], ['excited', 'ҳаяҷонзада'], ['pleased', 'хурсанд'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Narrating accidents and surprises',
    titleTranslated: 'Нақли ҳодиса ва ногаҳонӣ',
    words: [
      ['happen', 'рӯй додан'], ['drop', 'афтондан'], ['damage', 'зарар расондан'], ['discover', 'кашф кардан'],
      ['realize', 'дарк кардан'], ['notice', 'пай бурдан'], ['escape', 'гурехтан'], ['rescue', 'наҷот додан'],
      ['apologize', 'узр пурсидан'], ['explain', 'фаҳмондан'], ['describe', 'тавсиф кардан'], ['continue', 'идома додан'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Study habits',
    titleTranslated: 'Одати омӯзиш',
    words: [
      ['take notes', 'қайд кардан'], ['memorize', 'аз ёд кардан'], ['review', 'такрор кардан'], ['practice aloud', 'бо овоз машқ кардан'],
      ['ask for help', 'кӯмак пурсидан'], ['make progress', 'пешрафт кардан'], ['make a mistake', 'хато кардан'], ['correct a mistake', 'хатогиро ислоҳ кардан'],
      ['study plan', 'нақшаи омӯзиш'], ['learning goal', 'ҳадафи омӯзиш'], ['use a dictionary', 'луғат истифода бурдан'], ['check pronunciation', 'талаффузро санҷидан'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Professional communication',
    titleTranslated: 'Муоширати касбӣ',
    words: [
      ['Could you clarify?', 'Метавонед равшантар фаҳмонед?'], ['I have a question about...', 'Ман дар бораи ... савол дорам'],
      ['Let me explain.', 'Иҷозат диҳед фаҳмонам.'], ['I will send it today.', 'Ман онро имрӯз мефиристам.'],
      ['Please find attached...', 'Лутфан замимаро бинед...'], ['Thank you for your time.', 'Барои вақтатон ташаккур.'],
      ['I look forward to your reply.', 'Ҷавоби шуморо интизорам.'], ['Could we meet tomorrow?', 'Метавонем пагоҳ вохӯрем?'],
    ],
  },
  {
    module: 'The Past 1 (was / were)',
    title: 'Childhood and memories',
    titleTranslated: 'Кӯдакӣ ва хотираҳо',
    words: [
      ['childhood', 'кӯдакӣ'], ['primary school', 'мактаби ибтидоӣ'], ['classmate', 'ҳамсинф'], ['favorite toy', 'бозичаи дӯстдошта'],
      ['cartoon', 'мультфилм'], ['playground', 'майдончаи бозӣ'], ['summer camp', 'лагери тобистона'], ['village', 'деҳа'],
      ['remember', 'ба ёд овардан'], ['forget', 'фаромӯш кардан'], ['move house', 'хона кӯчидан'], ['grow up', 'калон шудан'],
    ],
  },
  {
    module: 'The Past 2 (irregular)',
    title: 'Past mistakes and solutions',
    titleTranslated: 'Хатоҳои гузашта ва ҳалли онҳо',
    words: [
      ['mistake', 'хато'], ['solution', 'ҳал'], ['problem', 'мушкил'], ['answer', 'ҷавоб'],
      ['apology', 'узр'], ['excuse', 'баҳона'], ['truth', 'ҳақиқат'], ['lie', 'дурӯғ'],
      ['fix', 'ислоҳ кардан'], ['solve', 'ҳал кардан'], ['check again', 'дубора санҷидан'], ['learn from', 'аз ... омӯхтан'],
    ],
  },
  {
    module: 'Comparisons',
    title: 'City and countryside',
    titleTranslated: 'Шаҳр ва деҳот',
    words: [
      ['countryside', 'деҳот'], ['city center', 'маркази шаҳр'], ['suburb', 'атрофи шаҳр'], ['traffic', 'ҳаракати роҳ'],
      ['pollution', 'ифлосшавӣ'], ['fresh air', 'ҳавои тоза'], ['quiet place', 'ҷои ором'], ['busy street', 'кӯчаи серодам'],
      ['safer', 'бехатартар'], ['noisier', 'пурғавғотар'], ['more peaceful', 'оромтар'], ['more convenient', 'қулайтар'],
    ],
  },
  {
    module: 'The Future',
    title: 'Predictions and possibilities',
    titleTranslated: 'Пешгӯӣ ва эҳтимолият',
    words: [
      ['prediction', 'пешгӯӣ'], ['possibility', 'эҳтимолият'], ['maybe', 'шояд'], ['certainly', 'албатта'],
      ['probably not', 'эҳтимол не'], ['I expect', 'ман интизорам'], ['I guess', 'ман тахмин мекунам'], ['future job', 'кори оянда'],
      ['change', 'тағйирот'], ['become', 'шудан'], ['technology', 'технология'], ['environment', 'муҳити зист'],
    ],
  },
  {
    module: 'Food & Quantity',
    title: 'Shopping for food',
    titleTranslated: 'Хариди маҳсулоти хӯрока',
    words: [
      ['shopping list', 'рӯйхати харид'], ['basket', 'сабад'], ['trolley', 'аробача'], ['cashier', 'хазинадор'],
      ['fresh vegetables', 'сабзавоти тару тоза'], ['frozen food', 'хӯроки яхкардашуда'], ['dairy products', 'маҳсулоти ширӣ'], ['meat section', 'шуъбаи гӯшт'],
      ['total price', 'нархи умумӣ'], ['pay by card', 'бо корт пардохт кардан'], ['special offer', 'пешниҳоди махсус'], ['out of stock', 'тамом шудааст'],
    ],
  },
  {
    module: 'Health',
    title: 'Healthy lifestyle',
    titleTranslated: 'Тарзи ҳаёти солим',
    words: [
      ['balanced diet', 'ғизои мутавозин'], ['physical activity', 'фаъолияти ҷисмонӣ'], ['sleep well', 'хуб хобидан'], ['drink enough water', 'об кофӣ нӯшидан'],
      ['avoid stress', 'аз стресс дурӣ кардан'], ['take a break', 'танаффус гирифтан'], ['mental health', 'солимии равонӣ'], ['habit', 'одат'],
      ['routine', 'реҷа'], ['energy', 'нерӯ'], ['treatment', 'табобат'], ['recover', 'шифо ёфтан'],
    ],
  },
  {
    module: 'Travel',
    title: 'Tourism and sightseeing',
    titleTranslated: 'Сайёҳӣ ва тамошои ҷойҳо',
    words: [
      ['sightseeing', 'тамошои ҷойҳо'], ['tour guide', 'роҳбалад'], ['guided tour', 'саёҳати роҳбаладдор'], ['entrance ticket', 'чиптаи даромад'],
      ['historical place', 'ҷои таърихӣ'], ['old town', 'шаҳри қадима'], ['viewpoint', 'нуқтаи тамошо'], ['take photos', 'акс гирифтан'],
      ['souvenir shop', 'мағозаи тӯҳфаҳо'], ['local culture', 'фарҳанги маҳаллӣ'], ['traditional food', 'хӯроки анъанавӣ'], ['tourist attraction', 'ҷои ҷолиби сайёҳӣ'],
    ],
  },
  {
    module: 'Work & Routine',
    title: 'Workplace behavior',
    titleTranslated: 'Рафтор дар ҷои кор',
    words: [
      ['be on time', 'сари вақт будан'], ['be late', 'дер мондан'], ['take responsibility', 'масъулият гирифтан'], ['help a colleague', 'ба ҳамкор кӯмак кардан'],
      ['ask politely', 'боодобона пурсидан'], ['explain clearly', 'равшан фаҳмондан'], ['make a phone call', 'занг задан'], ['arrange a meeting', 'ҷаласа ташкил кардан'],
      ['solve a problem', 'мушкилро ҳал кардан'], ['work under pressure', 'зери фишор кор кардан'], ['finish a task', 'вазифаро тамом кардан'], ['start a project', 'лоиҳаро оғоз кардан'],
    ],
  },
  {
    module: 'Weather & Contact',
    title: 'Emergencies and contact',
    titleTranslated: 'Ҳолатҳои фавқулода ва тамос',
    words: [
      ['emergency number', 'рақами фавқулода'], ['call the police', 'ба милиса занг задан'], ['call an ambulance', 'ёрии таъҷилиро даъват кардан'], ['fire station', 'истгоҳи оташнишонӣ'],
      ['danger', 'хатар'], ['safe place', 'ҷои бехатар'], ['warning message', 'паёми огоҳӣ'], ['lost person', 'шахси гумшуда'],
      ['ask for help', 'кӯмак пурсидан'], ['give your address', 'суроғаатонро додан'], ['stay calm', 'ором мондан'], ['follow instructions', 'дастурҳоро иҷро кардан'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Learning with technology',
    titleTranslated: 'Омӯзиш бо технология',
    words: [
      ['online lesson', 'дарси онлайн'], ['video call', 'занги видеоӣ'], ['microphone', 'микрофон'], ['speaker', 'баландгӯяк'],
      ['camera', 'камера'], ['recording', 'сабт'], ['subtitle', 'зернавис'], ['translation tool', 'абзори тарҷума'],
      ['digital notebook', 'дафтари рақамӣ'], ['quiz result', 'натиҷаи тест'], ['learning app', 'барномаи омӯзишӣ'], ['daily reminder', 'ёдраскунии ҳаррӯза'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Customer support',
    titleTranslated: 'Дастгирии муштарӣ',
    words: [
      ['support team', 'дастаи дастгирӣ'], ['case number', 'рақами муроҷиат'], ['describe the issue', 'мушкилро тавсиф кардан'], ['provide details', 'маълумот додан'],
      ['wait for a reply', 'ҷавобро интизор шудан'], ['technical problem', 'мушкили техникӣ'], ['delivery problem', 'мушкили расонидан'], ['payment problem', 'мушкили пардохт'],
      ['confirm', 'тасдиқ кардан'], ['cancel', 'бекор кардан'], ['replace', 'иваз кардан'], ['apologize', 'узр пурсидан'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Neighbors and local life',
    titleTranslated: 'Ҳамсояҳо ва ҳаёти маҳаллӣ',
    words: [
      ['upstairs neighbor', 'ҳамсояи боло'], ['downstairs neighbor', 'ҳамсояи поён'], ['shared entrance', 'даромадгоҳи умумӣ'], ['parking space', 'ҷои мошин'],
      ['building manager', 'мудири бино'], ['monthly rent', 'иҷораи моҳона'], ['repair request', 'дархости таъмир'], ['community meeting', 'ҷаласаи маҳалла'],
      ['friendly', 'дӯстона'], ['helpful', 'ёрирасон'], ['noisy', 'пурғавғо'], ['respectful', 'боэҳтиром'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Achievements and challenges',
    titleTranslated: 'Дастовардҳо ва мушкилот',
    words: [
      ['challenge', 'мушкилӣ/чолиш'], ['achievement', 'дастовард'], ['competition', 'мусобиқа'], ['winner', 'ғолиб'],
      ['prize', 'ҷоиза'], ['certificate', 'сертификат'], ['try hard', 'сахт кӯшиш кардан'], ['make an effort', 'саъй кардан'],
      ['be proud of', 'ифтихор кардан'], ['be afraid of', 'тарсидан аз'], ['deal with', 'сарукор доштан'], ['overcome', 'пас сар кардан'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Classroom interaction',
    titleTranslated: 'Муошират дар синф',
    words: [
      ['Could you explain it again?', 'Метавонед онро боз фаҳмонед?'], ['I do not understand this part.', 'Ман ин қисмро намефаҳмам.'],
      ['Can you give an example?', 'Метавонед мисол диҳед?'], ['How do you spell it?', 'Он чӣ тавр навишта мешавад?'],
      ['What does this word mean?', 'Ин калима чӣ маъно дорад?'], ['Please speak more slowly.', 'Лутфан оҳистатар гап занед.'],
      ['I finished the exercise.', 'Ман машқро тамом кардам.'], ['I made a mistake.', 'Ман хато кардам.'],
    ],
  },
  {
    module: 'A2 Review',
    title: 'A2 high-frequency connectors',
    titleTranslated: 'Пайвандакҳои серистифодаи A2',
    words: [
      ['however', 'аммо/бо вуҷуди ин'], ['therefore', 'бинобар ин'], ['while', 'дар ҳоле ки'], ['as soon as', 'ҳамин ки'],
      ['before that', 'пеш аз он'], ['afterwards', 'баъд аз он'], ['on the other hand', 'аз тарафи дигар'], ['for this reason', 'аз ин сабаб'],
      ['in addition', 'илова бар ин'], ['for instance', 'масалан'], ['to sum up', 'хулоса'], ['as a result', 'дар натиҷа'],
    ],
  },
  {
    module: 'A2 Review',
    title: 'A2 survival phrases',
    titleTranslated: 'Ибораҳои зарурии A2',
    words: [
      ['Could you say that another way?', 'Метавонед онро ба тарзи дигар гӯед?'],
      ['I mean that...', 'Ман дар назар дорам, ки...'],
      ['What I want to say is...', 'Он чизе ки гуфтан мехоҳам, ин аст...'],
      ['I am looking for...', 'Ман ...-ро ҷустуҷӯ дорам'],
      ['I have been here before.', 'Ман пештар ин ҷо будам.'],
      ['This is my first time here.', 'Ин бори аввал аст, ки ман ин ҷо ҳастам.'],
      ['I need more information.', 'Ба ман маълумоти бештар лозим аст.'],
      ['Could you write it down?', 'Метавонед онро нависед?'],
      ['I will think about it.', 'Ман дар ин бора фикр мекунам.'],
      ['That is a good point.', 'Ин фикри хуб аст.'],
      ['I am not ready yet.', 'Ман ҳоло тайёр нестам.'],
      ['Let us check it together.', 'Биёед онро якҷоя санҷем.'],
    ],
  },
  {
    module: 'Writing & Listening',
    title: 'A2 writing sentence frames',
    titleTranslated: 'Қолабҳои ҷумла барои навиштани A2',
    words: [
      ['I am writing to ask about...', 'Ман менависам, то дар бораи ... пурсам'],
      ['I am sorry for the inconvenience.', 'Барои нороҳатӣ узр мехоҳам.'],
      ['Could you please confirm...', 'Метавонед лутфан тасдиқ кунед...'],
      ['The main reason is...', 'Сабаби асосӣ ин аст...'],
      ['Another important point is...', 'Нуқтаи муҳими дигар ин аст...'],
      ['I would be grateful if...', 'Ман сипосгузор мешавам, агар...'],
      ['Please let me know soon.', 'Лутфан зудтар хабар диҳед.'],
      ['Thank you in advance.', 'Пешакӣ ташаккур.'],
      ['I hope to hear from you soon.', 'Умедворам, ки зуд аз шумо ҷавоб мегирам.'],
      ['Kind regards', 'Бо эҳтиром'],
    ],
  },
  {
    module: 'Speaking & Fluency',
    title: 'Fluency fillers and repair',
    titleTranslated: 'Ибораҳои равонӣ ва ислоҳи гуфтор',
    words: [
      ['Well, let me think.', 'Хуб, иҷозат диҳед фикр кунам.'],
      ['How can I say this?', 'Инро чӣ тавр гӯям?'],
      ['Sorry, I made a mistake.', 'Бубахшед, ман хато кардам.'],
      ['I will say it again.', 'Ман онро боз мегӯям.'],
      ['The word I need is...', 'Калимае ки ба ман лозим аст...'],
      ['It is similar to...', 'Он ба ... монанд аст'],
      ['For example...', 'Масалан...'],
      ['In short...', 'Кӯтоҳаш...'],
      ['That is all.', 'Ҳамин.'],
      ['Do you understand what I mean?', 'Шумо мефаҳмед, ки ман чиро дар назар дорам?'],
    ],
  },
  {
    module: 'Speaking & Fluency',
    title: 'A2 discussion phrases',
    titleTranslated: 'Ибораҳои муҳокимаи A2',
    words: [
      ['I agree because...', 'Ман розӣ ҳастам, чунки...'],
      ['I disagree because...', 'Ман розӣ нестам, чунки...'],
      ['In my experience...', 'Аз таҷрибаи ман...'],
      ['That happened to me once.', 'Ин як бор бо ман рӯй дода буд.'],
      ['The best choice is...', 'Беҳтарин интихоб ин аст...'],
      ['It is cheaper but less comfortable.', 'Ин арзонтар аст, аммо камтар бароҳат аст.'],
      ['It depends on the situation.', 'Ин ба вазъият вобаста аст.'],
      ['I would choose this one.', 'Ман ҳаминро интихоб мекардам.'],
      ['Can you give me an example?', 'Метавонед ба ман мисол диҳед?'],
      ['What do you think?', 'Шумо чӣ фикр доред?'],
    ],
  },
  {
    module: 'Speaking & Fluency',
    title: 'Clarifying and checking understanding',
    titleTranslated: 'Равшан кардан ва санҷидани фаҳмиш',
    words: [
      ['Do you mean...?', 'Шумо ...-ро дар назар доред?'],
      ['Can I check one thing?', 'Метавонам як чизро санҷам?'],
      ['So, the problem is...', 'Пас, мушкил ин аст...'],
      ['Let me make sure I understand.', 'Иҷозат диҳед боварӣ ҳосил кунам, ки фаҳмидам.'],
      ['Could you explain the last part?', 'Метавонед қисми охирро фаҳмонед?'],
      ['Now I understand.', 'Ҳоло фаҳмидам.'],
    ],
  },
];

const moduleSpecs = [
  ['Technology & Media', 'Технология ва расона', '💻', 11],
  ['Services & Problems', 'Хизматрасонӣ ва мушкилот', '🛠️', 12],
  ['Home & Community', 'Хона ва ҷомеа', '🏘️', 13],
  ['Stories & Experiences', 'Ҳикояҳо ва таҷрибаҳо', '📘', 14],
  ['Education & Skills', 'Таҳсил ва маҳоратҳо', '🎓', 15],
  ['Speaking & Fluency', 'Гуфтор ва равонӣ', '🎙️', 16],
];

const grammarAdditions = {
  'Past Simple of "to be" (was / were)': [
    ['fill_blank', 'Complete: I ___ at home yesterday.', 'was', 'was ё were-ро нависед.', null, 'Бо I дар гузашта was меояд.'],
    ['transform', 'Make it negative: They were late.', 'They were not late', 'Ҷумларо манфӣ кунед.', null, 'not баъд аз were меояд.'],
    ['reorder', 'Put the words in order: at school / was / She', 'She was at school', 'Калимаҳоро бо тартиби дуруст нависед.', null, 'Subject + was/were + place.'],
  ],
  'Past Simple (regular verbs)': [
    ['fill_blank', 'Complete: I ___ TV last night. (watch)', 'watched', 'Феълро ба гузашта гардонед.', null, 'Феълҳои regular одатан -ed мегиранд.'],
    ['transform', 'Make it negative: We visited the museum.', 'We did not visit the museum', 'Ҷумларо манфӣ кунед.', null, 'Дар past simple: did not + base verb.'],
  ],
  'Past Simple (irregular verbs)': [
    ['fill_blank', 'Complete: She ___ a new bag yesterday. (buy)', 'bought', 'Феъли бесистемаро нависед.', null, 'buy -> bought.'],
    ['fill_blank', 'Complete: We ___ our teacher in town. (meet)', 'met', 'Феъли бесистемаро нависед.', null, 'meet -> met.'],
  ],
  'Past questions & negatives (did)': [
    ['fill_blank', 'Complete: ___ you go to work yesterday?', 'Did', 'Калимаи саволиро нависед.', null, 'Саволи гузашта бо Did оғоз мешавад.'],
    ['transform', 'Make a question: You watched the film.', 'Did you watch the film?', 'Ҷумларо саволӣ кунед.', null, 'Did + subject + base verb.'],
  ],
  'Comparatives': [
    ['fill_blank', 'Complete: This phone is ___ than that phone. (cheap)', 'cheaper', 'Сифати муқоисавиро нависед.', null, 'cheap -> cheaper.'],
    ['fill_blank', 'Complete: English is ___ interesting than math.', 'more', 'more ё -er-ро нависед.', null, 'Барои сифатҳои дароз: more + adjective.'],
  ],
  'Superlatives': [
    ['fill_blank', 'Complete: This is the ___ day of the week. (busy)', 'busiest', 'Шакли superlative-ро нависед.', null, 'busy -> busiest.'],
    ['fill_blank', 'Complete: It is the ___ expensive hotel.', 'most', 'most ё -est-ро нависед.', null, 'Барои сифатҳои дароз: the most + adjective.'],
  ],
  'Future: be going to': [
    ['fill_blank', 'Complete: I am ___ visit my grandmother.', 'going to', 'Шакли дурустро нависед.', null, 'be going to барои нақша истифода мешавад.'],
    ['transform', 'Make it negative: She is going to travel.', 'She is not going to travel', 'Ҷумларо манфӣ кунед.', null, 'not баъд аз is меояд.'],
  ],
  'Future: will': [
    ['fill_blank', 'Complete: I think it ___ rain tomorrow.', 'will', 'will-ро истифода баред.', null, 'will барои пешгӯӣ ва қарорҳои зуд истифода мешавад.'],
    ['transform', 'Make a question: You will call me.', 'Will you call me?', 'Ҷумларо саволӣ кунед.', null, 'Will + subject + verb.'],
  ],
  'Countable / Uncountable, some / any': [
    ['fill_blank', 'Complete: There is ___ milk in the fridge.', 'some', 'some ё any-ро нависед.', null, 'Дар ҷумлаи мусбат some истифода мешавад.'],
    ['fill_blank', 'Complete: Are there ___ apples?', 'any', 'some ё any-ро нависед.', null, 'Дар савол аксар вақт any истифода мешавад.'],
  ],
  'Much / many / a lot of': [
    ['fill_blank', 'Complete: How ___ money do you have?', 'much', 'much ё many-ро нависед.', null, 'Money uncountable аст, much лозим.'],
    ['fill_blank', 'Complete: How ___ students are there?', 'many', 'much ё many-ро нависед.', null, 'Students countable plural аст, many лозим.'],
  ],
  'Should / shouldn\'t (advice)': [
    ['fill_blank', 'Complete: You ___ see a doctor.', 'should', 'Маслиҳати дурустро нависед.', null, 'should барои маслиҳат аст.'],
    ['transform', 'Make it negative: You should eat fast food.', 'You should not eat fast food', 'Ҷумларо манфӣ кунед.', null, 'should not = shouldn’t.'],
  ],
  'Have to / must (obligation)': [
    ['fill_blank', 'Complete: I ___ to wear a uniform.', 'have', 'have ё has-ро нависед.', null, 'Бо I: have to.'],
    ['fill_blank', 'Complete: She ___ to arrive early.', 'has', 'have ё has-ро нависед.', null, 'Бо she: has to.'],
  ],
  'Present Perfect (intro)': [
    ['fill_blank', 'Complete: I have ___ this film. (see)', 'seen', 'Past participle-ро нависед.', null, 'see -> seen.'],
    ['fill_blank', 'Complete: She has ___ to London. (be)', 'been', 'Past participle-ро нависед.', null, 'be -> been.'],
  ],
  'Too / enough': [
    ['fill_blank', 'Complete: This bag is ___ heavy.', 'too', 'too ё enough-ро нависед.', null, 'too + adjective = аз ҳад зиёд.'],
    ['fill_blank', 'Complete: The room is big ___.', 'enough', 'too ё enough-ро нависед.', null, 'adjective + enough.'],
  ],
};

const newGrammarTopics = [
  {
    module: 'Writing & Listening',
    title: 'Linking ideas: because, so, although',
    titleTranslated: 'Пайваст кардани фикрҳо: because, so, although',
    explanation: 'Дар A2 донишҷӯ бояд ҷумлаҳои кӯтоҳро пайваст кунад ва сабаб, натиҷа ё муқоиса гӯяд.',
    rules: [
      ['because + reason', 'because сабабро нишон медиҳад.'],
      ['so + result', 'so натиҷаро нишон медиҳад.'],
      ['although + contrast', 'although муқобилият ё фарқро нишон медиҳад.'],
    ],
    examples: [
      ['I stayed at home because I was tired.', 'Ман дар хона мондам, чунки хаста будам.', 'because'],
      ['It was raining, so we took a taxi.', 'Борон меборид, бинобар ин мо таксӣ гирифтем.', 'so'],
      ['Although it was cold, we went out.', 'Гарчанде ҳаво хунук буд, мо берун рафтем.', 'Although'],
    ],
    exercises: [
      ['fill_blank', 'Complete: I was hungry, ___ I made a sandwich.', 'so', 'Калимаи пайвасткунандаро нависед.', null, 'so натиҷаро нишон медиҳад.'],
      ['fill_blank', 'Complete: I went to bed early ___ I was tired.', 'because', 'Калимаи пайвасткунандаро нависед.', null, 'because сабабро нишон медиҳад.'],
      ['transform', 'Join with because: I stayed home. I was ill.', 'I stayed home because I was ill', 'Ду ҷумларо бо because пайваст кунед.', null, 'because пеш аз сабаб меояд.'],
    ],
  },
  {
    module: 'The Future',
    title: 'First conditional',
    titleTranslated: 'Шарти якум (if + present, will)',
    explanation: 'First conditional барои вазъияти эҳтимолии оянда истифода мешавад.',
    rules: [
      ['If + present simple, will + verb', 'If it rains, I will stay home.'],
      ['Will can come first', 'I will call you if I arrive early.'],
    ],
    examples: [
      ['If I finish work early, I will call you.', 'Агар корро барвақт тамом кунам, ба ту занг мезанам.', 'If'],
      ['We will go out if the weather is good.', 'Агар ҳаво хуб бошад, мо берун меравем.', 'if'],
    ],
    exercises: [
      ['fill_blank', 'Complete: If it rains, we ___ stay home.', 'will', 'will-ро нависед.', null, 'Дар қисми натиҷа will меояд.'],
      ['fill_blank', 'Complete: If she ___ time, she will visit us. (have)', 'has', 'Феълро дар present simple нависед.', null, 'Баъд аз if present simple меояд.'],
    ],
  },
  {
    module: 'Comparisons',
    title: 'Object pronouns',
    titleTranslated: 'Ҷонишинҳои объектӣ',
    explanation: 'Object pronouns баъд аз феъл ё preposition меоянд: me, you, him, her, it, us, them.',
    rules: [
      ['I -> me, he -> him, she -> her', 'Ин шаклҳо баъд аз феъл истифода мешаванд.'],
      ['Call me / help him / visit them', 'Ҷонишин объект аст, на subject.'],
    ],
    examples: [
      ['Please call me later.', 'Лутфан баъдтар ба ман занг занед.', 'me'],
      ['I helped him yesterday.', 'Ман дирӯз ба ӯ кӯмак кардам.', 'him'],
      ['We visited them last week.', 'Мо ҳафтаи гузашта ба назди онҳо рафтем.', 'them'],
    ],
    exercises: [
      ['fill_blank', 'Complete: Ali is my friend. I know ___.', 'him', 'Ҷонишини объектиро нависед.', null, 'Ali -> him.'],
      ['fill_blank', 'Complete: This is my sister. Please help ___.', 'her', 'Ҷонишини объектиро нависед.', null, 'sister -> her.'],
    ],
  },
  {
    module: 'Travel',
    title: 'Prepositions of movement',
    titleTranslated: 'Пешояндҳои ҳаракат',
    explanation: 'Барои тавсифи ҳаракат дар шаҳр ва сафар: across, along, through, into, out of, past.',
    rules: [
      ['go across the street', 'аз кӯча гузаштан'],
      ['walk along the river', 'қад-қади дарё рафтан'],
      ['go into / out of a building', 'ба дохил / аз дохил баромадан'],
    ],
    examples: [
      ['Walk across the street.', 'Аз кӯча гузаред.', 'across'],
      ['Go past the bank.', 'Аз назди бонк гузаред.', 'past'],
      ['The train goes through the tunnel.', 'Қатор аз нақб мегузарад.', 'through'],
    ],
    exercises: [
      ['fill_blank', 'Complete: Go ___ the bridge.', 'across', 'Пешоянди ҳаракатро нависед.', null, 'across = аз болои/аз тарафи дигар гузаштан.'],
      ['fill_blank', 'Complete: Walk ___ the park.', 'through', 'Пешоянди ҳаракатро нависед.', null, 'through = аз дохили чизе гузаштан.'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Present perfect: ever and never',
    titleTranslated: 'Present perfect: ever ва never',
    explanation: 'Дар A2 present perfect барои таҷрибаи зиндагӣ истифода мешавад: Have you ever...? I have never...',
    rules: [
      ['Have/Has + subject + ever + past participle?', 'Барои пурсидани таҷриба.'],
      ['Subject + have/has + never + past participle', 'Барои гуфтани “ҳеҷ гоҳ”.'],
    ],
    examples: [
      ['Have you ever stayed in a hotel?', 'Оё шумо ягон бор дар меҳмонхона мондаед?', 'ever'],
      ['I have never lost my passport.', 'Ман ҳеҷ гоҳ шиносномаамро гум накардаам.', 'never'],
    ],
    exercises: [
      ['fill_blank', 'Complete: Have you ___ visited Khujand?', 'ever', 'ever ё never-ро нависед.', null, 'Дар савол ever меояд.'],
      ['fill_blank', 'Complete: I have ___ tried this food.', 'never', 'ever ё never-ро нависед.', null, 'Дар ҷумлаи манфии таҷриба never меояд.'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Gerunds after like, enjoy and hate',
    titleTranslated: 'Gerund баъд аз like, enjoy ва hate',
    explanation: 'Баъд аз like/enjoy/hate одатан verb + ing меояд: I enjoy reading.',
    rules: [
      ['enjoy + verb-ing', 'I enjoy learning English.'],
      ['like / hate + verb-ing', 'I like cooking. I hate waiting.'],
    ],
    examples: [
      ['I enjoy learning new words.', 'Ман омӯзиши калимаҳои навро дӯст медорам.', 'learning'],
      ['She hates waiting in a queue.', 'Ӯ дар навбат истоданро дӯст намедорад.', 'waiting'],
    ],
    exercises: [
      ['fill_blank', 'Complete: I enjoy ___ English. (learn)', 'learning', 'Шакли -ing-ро нависед.', null, 'Баъд аз enjoy gerund меояд.'],
      ['fill_blank', 'Complete: He hates ___ early. (wake up)', 'waking up', 'Шакли -ing-ро нависед.', null, 'wake up -> waking up.'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Infinitive of purpose',
    titleTranslated: 'Infinitive барои мақсад',
    explanation: 'to + verb барои гуфтани мақсад истифода мешавад: I went to the shop to buy bread.',
    rules: [
      ['to + verb = purpose', 'I called to ask a question.'],
      ['Use base verb after to', 'to buy, to learn, to help.'],
    ],
    examples: [
      ['I went to the bank to open an account.', 'Ман ба бонк рафтам, то ҳисоб кушоям.', 'to open'],
      ['She called to complain about the service.', 'Ӯ занг зад, то аз хизматрасонӣ шикоят кунад.', 'to complain'],
    ],
    exercises: [
      ['fill_blank', 'Complete: I went to the shop ___ buy milk.', 'to', 'to-ро нависед.', null, 'to + verb мақсадро нишон медиҳад.'],
      ['reorder', 'Put the words in order: to ask / called / I / a question', 'I called to ask a question', 'Калимаҳоро бо тартиби дуруст нависед.', null, 'Subject + verb + to + verb.'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Relative clauses: who, which, that',
    titleTranslated: 'Ҷумлаҳои нисбӣ: who, which, that',
    explanation: 'Дар A2 донишҷӯ метавонад одам ё чизро бо ҷумлаи кӯтоҳ шарҳ диҳад.',
    rules: [
      ['who for people', 'A teacher is a person who helps students.'],
      ['which/that for things', 'This is an app that teaches English.'],
    ],
    examples: [
      ['A nurse is a person who helps patients.', 'Ҳамшира шахсест, ки ба беморон кӯмак мекунад.', 'who'],
      ['This is the website that I use every day.', 'Ин сомонаест, ки ман ҳар рӯз истифода мебарам.', 'that'],
    ],
    exercises: [
      ['fill_blank', 'Complete: A doctor is a person ___ helps patients.', 'who', 'who ё which-ро нависед.', null, 'Барои одам who истифода мешавад.'],
      ['fill_blank', 'Complete: This is the phone ___ I bought yesterday.', 'that', 'that-ро нависед.', null, 'that барои чизҳо низ истифода мешавад.'],
    ],
  },
  {
    module: 'Services & Problems',
    title: 'Polite requests: could and would',
    titleTranslated: 'Дархостҳои одобнок: could ва would',
    explanation: 'Дар A2 донишҷӯ бояд дархостро бо шакли одобнок гӯяд: Could you...? Would you like...?',
    rules: [
      ['Could you + verb?', 'Could you help me?'],
      ['Would you like + noun/to verb?', 'Would you like some tea?'],
    ],
    examples: [
      ['Could you repeat that, please?', 'Метавонед онро такрор кунед?', 'Could'],
      ['Would you like to sit here?', 'Мехоҳед ин ҷо нишинед?', 'Would'],
    ],
    exercises: [
      ['fill_blank', 'Complete: ___ you help me, please?', 'Could', 'Could ё Do-ро нависед.', null, 'Could шакли одобнок аст.'],
      ['transform', 'Make it polite: Help me.', 'Could you help me?', 'Ҷумларо одобнок кунед.', null, 'Could you...?'],
    ],
  },
  {
    module: 'Home & Community',
    title: 'Permission: can, may, be allowed to',
    titleTranslated: 'Иҷозат: can, may, be allowed to',
    explanation: 'Барои пурсидани иҷозат can/may ва барои қоидаҳо be allowed to истифода мешавад.',
    rules: [
      ['Can I...? / May I...?', 'Пурсидани иҷозат.'],
      ['be allowed to', 'Гуфтани он чизе ки иҷозат аст.'],
    ],
    examples: [
      ['Can I use the library computer?', 'Метавонам компютери китобхонаро истифода барам?', 'Can'],
      ['You are not allowed to smoke here.', 'Ин ҷо сигор кашидан иҷозат нест.', 'allowed'],
    ],
    exercises: [
      ['fill_blank', 'Complete: ___ I open the window?', 'Can', 'Can ё Have-ро нависед.', null, 'Can I...? барои иҷозат.'],
      ['fill_blank', 'Complete: You are not ___ to park here.', 'allowed', 'Калимаи дурустро нависед.', null, 'not allowed to = манъ аст.'],
    ],
  },
  {
    module: 'Stories & Experiences',
    title: 'Past continuous',
    titleTranslated: 'Замони гузаштаи давомдор',
    explanation: 'Past continuous барои амале истифода мешавад, ки дар як вақти гузашта давом дошт.',
    rules: [
      ['was/were + verb-ing', 'I was walking home.'],
      ['Past continuous + when + past simple', 'I was cooking when he called.'],
    ],
    examples: [
      ['I was studying when my friend called.', 'Ман дарс мехондам, вақте дӯстам занг зад.', 'was studying'],
      ['They were waiting at the station.', 'Онҳо дар истгоҳ интизор буданд.', 'were waiting'],
    ],
    exercises: [
      ['fill_blank', 'Complete: I was ___ TV when you called. (watch)', 'watching', 'Шакли -ing-ро нависед.', null, 'was + watching.'],
      ['fill_blank', 'Complete: They ___ waiting for the bus.', 'were', 'was ё were-ро нависед.', null, 'Бо they: were.'],
    ],
  },
  {
    module: 'Education & Skills',
    title: 'Reported speech intro',
    titleTranslated: 'Reported speech - муқаддима',
    explanation: 'Дар A2 reported speech танҳо дар шакли оддӣ лозим мешавад: He said that..., She told me that...',
    rules: [
      ['said that + sentence', 'He said that he was busy.'],
      ['told me that + sentence', 'She told me that the class was online.'],
    ],
    examples: [
      ['He said that he was tired.', 'Ӯ гуфт, ки хаста буд.', 'said'],
      ['She told me that the meeting was at ten.', 'Ӯ ба ман гуфт, ки ҷаласа соати даҳ буд.', 'told'],
    ],
    exercises: [
      ['fill_blank', 'Complete: He ___ that he was busy.', 'said', 'said ё told-ро нависед.', null, 'said that...'],
      ['fill_blank', 'Complete: She ___ me that the lesson was online.', 'told', 'said ё told-ро нависед.', null, 'told me that...'],
    ],
  },
  {
    module: 'Technology & Media',
    title: 'Basic phrasal verbs',
    titleTranslated: 'Phrasal verbs-и асосӣ',
    explanation: 'Дар A2 чанд phrasal verb-и маъмул лозим аст: turn on, turn off, look for, find out, fill in.',
    rules: [
      ['turn on/off', 'дастгоҳро фаъол/хомӯш кардан'],
      ['look for / find out / fill in', 'ҷустуҷӯ кардан / фаҳмидан / пур кардан'],
    ],
    examples: [
      ['Please turn off your phone.', 'Лутфан телефонатонро хомӯш кунед.', 'turn off'],
      ['I need to fill in this form.', 'Ман бояд ин варақаро пур кунам.', 'fill in'],
    ],
    exercises: [
      ['fill_blank', 'Complete: Please turn ___ the computer.', 'on', 'on ё in-ро нависед.', null, 'turn on = фаъол кардан.'],
      ['fill_blank', 'Complete: I am looking ___ my keys.', 'for', 'for ё at-ро нависед.', null, 'look for = ҷустуҷӯ кардан.'],
    ],
  },
  {
    module: 'Food & Quantity',
    title: 'Adjectives ending -ed and -ing',
    titleTranslated: 'Сифатҳои -ed ва -ing',
    explanation: 'boring = чиз дилгиркунанда аст; bored = шахс дилгир шудааст. Ин фарқ дар A2 муҳим аст.',
    rules: [
      ['-ing describes the thing', 'The film is boring.'],
      ['-ed describes the feeling', 'I am bored.'],
    ],
    examples: [
      ['The lesson was interesting.', 'Дарс ҷолиб буд.', 'interesting'],
      ['I was interested in the lesson.', 'Ман ба дарс шавқманд будам.', 'interested'],
    ],
    exercises: [
      ['fill_blank', 'Complete: The story is ___. (interest)', 'interesting', 'Шакли дурустро нависед.', null, 'Чизро тавсиф мекунад: -ing.'],
      ['fill_blank', 'Complete: I am ___ in English. (interest)', 'interested', 'Шакли дурустро нависед.', null, 'Ҳисси шахс: -ed.'],
    ],
  },
];

const phraseCollections = [
  {
    title: 'Making plans',
    titleTranslated: 'Нақша кардан',
    category: 'plans',
    phrases: [
      ['Are you free on Saturday?', 'Шанбе вақт доред?', 'free on Saturday', 'Барои даъват кардан.'],
      ['Would you like to come with us?', 'Мехоҳед бо мо биёед?', 'would like', 'Шакли одобнок.'],
      ['That sounds great.', 'Ин бисёр хуб садо медиҳад.', '', 'Қабули пешниҳод.'],
      ['Sorry, I am busy.', 'Бубахшед, ман банд ҳастам.', '', 'Рад кардани пешниҳод.'],
      ['Let us meet at six.', 'Биёед соати шаш вохӯрем.', '', 'Пешниҳоди вақт.'],
      ['I will call you later.', 'Ман баъдтар ба шумо занг мезанам.', '', 'Ваъда/қарор.'],
    ],
  },
  {
    title: 'Solving problems',
    titleTranslated: 'Ҳалли мушкилот',
    category: 'problems',
    phrases: [
      ['There is a problem with my room.', 'Бо ҳуҷраи ман мушкил ҳаст.', '', 'Дар меҳмонхона.'],
      ['The internet does not work.', 'Интернет кор намекунад.', '', 'Мушкили техникӣ.'],
      ['Could you help me, please?', 'Метавонед ба ман кӯмак кунед?', '', 'Дархости одобнок.'],
      ['I would like to change this.', 'Ман мехоҳам инро иваз кунам.', '', 'Дар мағоза.'],
      ['Can I get a refund?', 'Метавонам пуламро баргардонам?', '', 'Баргардонидани мол.'],
    ],
  },
  {
    title: 'Giving opinions',
    titleTranslated: 'Баён кардани андеша',
    category: 'opinions',
    phrases: [
      ['In my opinion, it is useful.', 'Ба фикри ман, ин фоиданок аст.', '', 'Андешаи шахсӣ.'],
      ['I agree with you.', 'Ман бо шумо розӣ ҳастам.', '', 'Розигӣ.'],
      ['I do not agree.', 'Ман розӣ нестам.', '', 'Норозигӣ.'],
      ['I prefer the cheaper one.', 'Ман арзонтарашро афзал медонам.', '', 'Интихоб.'],
      ['It is better than the old one.', 'Ин аз кӯҳнааш беҳтар аст.', '', 'Муқоиса.'],
    ],
  },
  {
    title: 'Appointments and formal requests',
    titleTranslated: 'Қабул ва дархостҳои расмӣ',
    category: 'appointments',
    phrases: [
      ['I would like to make an appointment.', 'Ман мехоҳам вақти қабул гирам.', '', 'Дар духтур/идора.'],
      ['Is Tuesday morning available?', 'Субҳи сешанбе дастрас аст?', '', 'Пурсидани вақт.'],
      ['Could you send me the details?', 'Метавонед маълумотро ба ман фиристед?', '', 'Дархости расмӣ.'],
      ['I need to change the time.', 'Ман бояд вақтро иваз кунам.', '', 'Иваз кардани вақт.'],
      ['Thank you for your help.', 'Барои кӯмакатон ташаккур.', '', 'Анҷоми одобнок.'],
    ],
  },
];

const dialogues = [
  {
    title: 'Checking in at a hotel',
    titleTranslated: 'Сабти воридшавӣ дар меҳмонхона',
    scenario: 'Меҳмон ба қабулгоҳ меравад ва ҳуҷраашро мегирад.',
    lines: [
      ['Receptionist', 'Good evening. Do you have a reservation?', 'Шоми хуш. Шумо фармоиш доред?', false],
      ['Guest', 'Yes, I booked a single room for two nights.', 'Бале, ман ҳуҷраи якнафара барои ду шаб фармоиш додам.', true],
      ['Receptionist', 'May I see your passport, please?', 'Метавонам шиносномаи шуморо бинам?', false],
      ['Guest', 'Of course. Here it is.', 'Албатта. Марҳамат.', true],
      ['Receptionist', 'Your room is on the second floor.', 'Ҳуҷраи шумо дар ошёнаи дуюм аст.', false],
      ['Guest', 'Thank you. What time is breakfast?', 'Ташаккур. Наҳорӣ соати чанд аст?', true],
    ],
  },
  {
    title: 'At the doctor',
    titleTranslated: 'Назди духтур',
    scenario: 'Бемор нишонаҳои худро ба духтур мефаҳмонад.',
    lines: [
      ['Doctor', 'What is the problem?', 'Мушкил чист?', false],
      ['Patient', 'I have a headache and a sore throat.', 'Сарам ва гулӯям дард мекунад.', true],
      ['Doctor', 'How long have you felt like this?', 'Чанд вақт боз чунин ҳис мекунед?', false],
      ['Patient', 'Since yesterday morning.', 'Аз субҳи дирӯз.', true],
      ['Doctor', 'You should rest and drink warm tea.', 'Шумо бояд истироҳат кунед ва чойи гарм нӯшед.', false],
    ],
  },
  {
    title: 'Returning an item',
    titleTranslated: 'Баргардонидани мол',
    scenario: 'Харидор мехоҳад молро иваз ё баргардонад.',
    lines: [
      ['Customer', 'Excuse me, I bought this yesterday.', 'Бубахшед, ман инро дирӯз харидам.', true],
      ['Assistant', 'What is wrong with it?', 'Бо он чӣ мушкил аст?', false],
      ['Customer', 'It is too small. Can I change it?', 'Ин хеле хурд аст. Метавонам иваз кунам?', true],
      ['Assistant', 'Do you have the receipt?', 'Шумо чек доред?', false],
      ['Customer', 'Yes, here it is.', 'Бале, марҳамат.', true],
    ],
  },
  {
    title: 'A job interview',
    titleTranslated: 'Мусоҳибаи корӣ',
    scenario: 'Довталаб дар бораи таҷриба ва вақти корӣ ҷавоб медиҳад.',
    lines: [
      ['Manager', 'Why would you like this job?', 'Чаро шумо ин корро мехоҳед?', false],
      ['Applicant', 'I want to improve my skills and work with people.', 'Ман мехоҳам маҳоратҳоямро беҳтар кунам ва бо одамон кор кунам.', true],
      ['Manager', 'Have you ever worked in a shop?', 'Оё шумо ягон бор дар мағоза кор кардаед?', false],
      ['Applicant', 'Yes, I worked part-time last summer.', 'Бале, тобистони гузашта нимрӯза кор кардам.', true],
      ['Manager', 'When can you start?', 'Кай метавонед оғоз кунед?', false],
      ['Applicant', 'I can start next Monday.', 'Ман метавонам душанбеи оянда оғоз кунам.', true],
    ],
  },
  {
    title: 'Fixing the internet',
    titleTranslated: 'Таъмири интернет',
    scenario: 'Муштарӣ ба хизматрасонӣ занг мезанад, чун интернет кор намекунад.',
    lines: [
      ['Agent', 'How can I help you?', 'Чӣ тавр кӯмак карда метавонам?', false],
      ['Customer', 'My internet has not worked since yesterday.', 'Интернети ман аз дирӯз кор намекунад.', true],
      ['Agent', 'Have you restarted the router?', 'Шумо роутерро аз нав фаъол кардед?', false],
      ['Customer', 'Yes, but the signal is still weak.', 'Бале, аммо сигнал ҳоло ҳам суст аст.', true],
      ['Agent', 'A technician will visit you tomorrow.', 'Техник пагоҳ ба назди шумо меояд.', false],
    ],
  },
  {
    title: 'Opening a bank account',
    titleTranslated: 'Кушодани ҳисоби бонкӣ',
    scenario: 'Шахс дар бонк варақа пур мекунад ва дар бораи корт мепурсад.',
    lines: [
      ['Clerk', 'Good morning. How can I help you?', 'Субҳ ба хайр. Чӣ тавр кӯмак кунам?', false],
      ['Customer', 'I would like to open a bank account.', 'Ман мехоҳам ҳисоби бонкӣ кушоям.', true],
      ['Clerk', 'Please fill in this form.', 'Лутфан ин варақаро пур кунед.', false],
      ['Customer', 'Do I need to show my passport?', 'Оё бояд шиносномаамро нишон диҳам?', true],
      ['Clerk', 'Yes, and you will receive your card next week.', 'Бале, ва шумо корти худро ҳафтаи оянда мегиред.', false],
    ],
  },
  {
    title: 'Asking for permission',
    titleTranslated: 'Пурсидани иҷозат',
    scenario: 'Донишҷӯ дар китобхона аз корманд иҷозат мепурсад.',
    lines: [
      ['Student', 'Excuse me, can I use this computer?', 'Бубахшед, метавонам ин компютерро истифода барам?', true],
      ['Librarian', 'Yes, but you must log in first.', 'Бале, аммо аввал бояд ворид шавед.', false],
      ['Student', 'May I print two pages?', 'Метавонам ду саҳифа чоп кунам?', true],
      ['Librarian', 'Of course. It costs one somoni.', 'Албатта. Ин як сомонӣ мешавад.', false],
      ['Student', 'Thank you for your help.', 'Барои кӯмакатон ташаккур.', true],
    ],
  },
  {
    title: 'Talking about an accident',
    titleTranslated: 'Суҳбат дар бораи ҳодиса',
    scenario: 'Дӯстҳо дар бораи ҳодисаи хурд гап мезананд.',
    lines: [
      ['Friend', 'What happened yesterday?', 'Дирӯз чӣ шуд?', false],
      ['You', 'I was walking home when I dropped my phone.', 'Ман ба хона мерафтам, вақте телефонамро афтондам.', true],
      ['Friend', 'Oh no! Was it broken?', 'Оҳ не! Он шикаст?', false],
      ['You', 'The screen was broken, but it still worked.', 'Экран шикаст, аммо он ҳоло ҳам кор мекард.', true],
      ['Friend', 'You should take it to a repair shop.', 'Бояд онро ба таъмиргоҳ барӣ.', false],
    ],
  },
  {
    title: 'Discussing a film',
    titleTranslated: 'Муҳокимаи филм',
    scenario: 'Ду нафар дар бораи филм андеша медиҳанд.',
    lines: [
      ['Amina', 'Did you like the film?', 'Филм ба ту маъқул шуд?', false],
      ['Bek', 'Yes, it was more interesting than I expected.', 'Бале, аз он чи интизор будам ҷолибтар буд.', true],
      ['Amina', 'What was the best part?', 'Беҳтарин қисми он чӣ буд?', false],
      ['Bek', 'The ending was surprising.', 'Анҷомаш ногаҳонӣ буд.', true],
      ['Amina', 'I agree. I would recommend it.', 'Ман розӣ ҳастам. Ман онро тавсия медодам.', false],
    ],
  },
  {
    title: 'Planning a study schedule',
    titleTranslated: 'Нақшаи омӯзиш',
    scenario: 'Ду донишҷӯ нақшаи тайёрӣ ба имтиҳон месозанд.',
    lines: [
      ['Student A', 'The exam is next Friday.', 'Имтиҳон ҷумъаи оянда аст.', false],
      ['Student B', 'We should revise grammar every evening.', 'Мо бояд ҳар шом грамматикаро такрор кунем.', true],
      ['Student A', 'Good idea. I will practice speaking on Monday.', 'Фикри хуб. Ман рӯзи душанбе гуфторро машқ мекунам.', false],
      ['Student B', 'If we study together, we will improve faster.', 'Агар якҷоя омӯзем, тезтар беҳтар мешавем.', true],
    ],
  },
];

const comprehensions = [
  {
    kind: 'reading',
    title: 'A weekend trip',
    titleTranslated: 'Сафари охири ҳафта',
    passage: 'Last weekend, Saida travelled to Khujand with her cousins. They left Dushanbe early in the morning and arrived in the afternoon. The hotel was small but comfortable. On Sunday, they visited a museum, bought postcards and tried local food. Saida wants to go there again next year.',
    passageTranslated: 'Охири ҳафтаи гузашта Саида бо амакбачаҳои худ ба Хуҷанд сафар кард. Онҳо субҳ барвақт аз Душанбе баромаданд ва баъд аз нисфирӯзӣ расиданд. Меҳмонхона хурд, аммо роҳат буд. Рӯзи якшанбе онҳо осорхона диданд, открытка хариданд ва хӯроки маҳаллиро чашиданд. Саида мехоҳад соли оянда боз ба он ҷо равад.',
    questions: [
      ['Where did Saida travel?', ['Khujand', 'London', 'Moscow', 'Kulob'], 0, 'Матн мегӯяд, ки ӯ ба Khujand сафар кард.'],
      ['Who did she travel with?', ['Her cousins', 'Her teacher', 'Her boss', 'Her doctor'], 0, 'with her cousins.'],
      ['What was the hotel like?', ['Small but comfortable', 'Big and expensive', 'Old and dirty', 'Closed'], 0, 'small but comfortable.'],
      ['What did they buy?', ['Postcards', 'Shoes', 'Medicine', 'Tickets'], 0, 'They bought postcards.'],
      ['When does she want to go again?', ['Next year', 'Tomorrow', 'Next week', 'Never'], 0, 'next year.'],
    ],
  },
  {
    kind: 'listening',
    title: 'A phone message',
    titleTranslated: 'Паёми телефонӣ',
    passage: 'Hi, this is Daniel. I cannot come to the meeting at three because my train is delayed. I will arrive at about four fifteen. Please start without me. I will call you when I get to the office.',
    passageTranslated: 'Салом, ин Даниэл аст. Ман ба ҷаласаи соати се омада наметавонам, чунки қаторам дер мекунад. Ман тақрибан соати чор понздаҳ мерасам. Лутфан бе ман оғоз кунед. Вақте ба офис расам, занг мезанам.',
    questions: [
      ['Why is Daniel late?', ['His train is delayed', 'He is ill', 'He lost his phone', 'He is at home'], 0, 'His train is delayed.'],
      ['What time will he arrive?', ['About 4:15', 'At 3:00', 'At 2:45', 'At 5:30'], 0, 'about four fifteen.'],
      ['What should they do?', ['Start without him', 'Cancel the meeting', 'Wait at the station', 'Go home'], 0, 'Please start without me.'],
      ['When will he call?', ['When he gets to the office', 'Before lunch', 'Tonight', 'Tomorrow'], 0, 'when I get to the office.'],
    ],
  },
  {
    kind: 'reading',
    title: 'Choosing a course',
    titleTranslated: 'Интихоби курс',
    passage: 'Murod wants to improve his English because he needs it for work. He looked at two courses. The first course is cheaper, but it is far from his home. The second course is more expensive, but the teacher is very experienced and the lessons are online. Murod chose the second course because it is more convenient.',
    passageTranslated: 'Мурод мехоҳад англисии худро беҳтар кунад, чунки барои кор лозим аст. Ӯ ду курсро дид. Курси аввал арзонтар аст, аммо аз хонааш дур аст. Курси дуюм қиматтар аст, аммо муаллим хеле таҷрибадор аст ва дарсҳо онлайнанд. Мурод курси дуюмро интихоб кард, чунки он қулайтар аст.',
    questions: [
      ['Why does Murod need English?', ['For work', 'For sport', 'For cooking', 'For music'], 0, 'He needs it for work.'],
      ['What is true about the first course?', ['It is cheaper', 'It is online', 'It is the best', 'It is near his home'], 0, 'The first course is cheaper.'],
      ['Why did he choose the second course?', ['It is more convenient', 'It is free', 'It is shorter', 'It is in the morning'], 0, 'because it is more convenient.'],
    ],
  },
  {
    kind: 'reading',
    title: 'An online problem',
    titleTranslated: 'Мушкили онлайн',
    passage: 'Nargis bought a phone online because it was cheaper than in the shop. When it arrived, the charger was missing and the screen was broken. She wrote a polite complaint and sent photos of the problem. The company answered the next day and promised to send a new phone.',
    passageTranslated: 'Наргис телефонро онлайн харид, чунки он аз мағоза арзонтар буд. Вақте омад, пуркунандаи барқ намерасид ва экран шикаста буд. Ӯ шикояти одобнок навишт ва аксҳои мушкилро фиристод. Ширкат рӯзи дигар ҷавоб дод ва ваъда дод, ки телефони нав мефиристад.',
    questions: [
      ['Why did Nargis buy the phone online?', ['It was cheaper', 'It was bigger', 'It was old', 'It was free'], 0, 'It was cheaper than in the shop.'],
      ['What was missing?', ['The charger', 'The phone', 'The box', 'The receipt'], 0, 'The charger was missing.'],
      ['What was broken?', ['The screen', 'The keyboard', 'The website', 'The camera'], 0, 'The screen was broken.'],
      ['What did she send?', ['Photos', 'Money', 'A passport', 'A ticket'], 0, 'She sent photos of the problem.'],
      ['What did the company promise?', ['To send a new phone', 'To close the shop', 'To call the police', 'To send a book'], 0, 'promised to send a new phone.'],
    ],
  },
  {
    kind: 'listening',
    title: 'A course announcement',
    titleTranslated: 'Эълони курс',
    passage: 'Attention, students. Tomorrow’s English class will start at ten thirty, not at nine. Please bring your course book and your homework. The speaking test will be next Thursday. If you have any questions, send an email to your teacher today.',
    passageTranslated: 'Диққат, донишҷӯён. Дарси англисии пагоҳ соати даҳу сӣ оғоз мешавад, на соати нӯҳ. Лутфан китоби курс ва вазифаи хонагиро биёред. Санҷиши гуфтор панҷшанбеи оянда мешавад. Агар савол дошта бошед, имрӯз ба муаллим email фиристед.',
    questions: [
      ['What time will the class start?', ['10:30', '9:00', '8:30', '12:00'], 0, 'ten thirty.'],
      ['What should students bring?', ['Course book and homework', 'Passport and ticket', 'Food and water', 'Phone and charger'], 0, 'course book and homework.'],
      ['When is the speaking test?', ['Next Thursday', 'Tomorrow', 'Today', 'Next Monday'], 0, 'next Thursday.'],
      ['How can students ask questions?', ['By email', 'By postcard', 'By taxi', 'By radio'], 0, 'send an email.'],
    ],
  },
  {
    kind: 'reading',
    title: 'A new community center',
    titleTranslated: 'Маркази нави ҷомеа',
    passage: 'A new community center opened in our neighborhood last month. It has a small library, a sports room and free English classes twice a week. Children are allowed to use the computers after school, but they must not eat in the computer room. Many local people say the center is useful because it gives young people a safe place to study.',
    passageTranslated: 'Моҳи гузашта дар маҳаллаи мо маркази нави ҷомеа кушода шуд. Он китобхонаи хурд, ҳуҷраи варзиш ва дарсҳои ройгони англисӣ ду бор дар як ҳафта дорад. Кӯдакон баъд аз мактаб метавонанд компютерҳоро истифода баранд, аммо дар ҳуҷраи компютер хӯрок хӯрдан манъ аст. Бисёр одамони маҳаллӣ мегӯянд, ки марказ фоиданок аст, чунки ба ҷавонон ҷои бехатар барои таҳсил медиҳад.',
    questions: [
      ['When did the center open?', ['Last month', 'Yesterday', 'Last year', 'Tomorrow'], 0, 'last month.'],
      ['How often are English classes?', ['Twice a week', 'Every day', 'Once a month', 'Never'], 0, 'twice a week.'],
      ['What must children not do?', ['Eat in the computer room', 'Study English', 'Use computers', 'Read books'], 0, 'must not eat in the computer room.'],
      ['Why is the center useful?', ['It gives young people a safe place to study', 'It sells cheap phones', 'It has a hotel', 'It is far away'], 0, 'safe place to study.'],
    ],
  },
  {
    kind: 'reading',
    title: 'A restaurant review',
    titleTranslated: 'Тақризи тарабхона',
    passage: 'I visited Green Garden Restaurant with my family on Friday. The restaurant was busier than usual, so we waited fifteen minutes for a table. The soup was too salty, but the main course was delicious and the service was polite. It was not the cheapest restaurant in town, but I would go there again because the food was fresh.',
    passageTranslated: 'Ман рӯзи ҷумъа бо оилаам ба тарабхонаи Green Garden рафтам. Тарабхона аз одат серодамтар буд, бинобар ин мо понздаҳ дақиқа барои миз интизор шудем. Шӯрбо аз ҳад шӯр буд, аммо хӯроки асосӣ лазиз буд ва хизматрасонӣ боодобона буд. Ин арзонтарин тарабхонаи шаҳр набуд, аммо ман боз ба он ҷо мерафтам, чунки хӯрок тару тоза буд.',
    questions: [
      ['Why did they wait?', ['The restaurant was busy', 'They were late', 'The food was cold', 'It was closed'], 0, 'busier than usual.'],
      ['What was wrong with the soup?', ['It was too salty', 'It was too cold', 'It was too sweet', 'It was missing'], 0, 'too salty.'],
      ['What was good?', ['The main course and service', 'The bill', 'The queue', 'The weather'], 0, 'main course was delicious and service was polite.'],
      ['Why would the writer go again?', ['The food was fresh', 'It was the cheapest', 'It was empty', 'It was near school'], 0, 'because the food was fresh.'],
    ],
  },
  {
    kind: 'listening',
    title: 'Weather and travel warning',
    titleTranslated: 'Огоҳии ҳаво ва сафар',
    passage: 'This is a travel warning for Saturday morning. Heavy snow is expected in the mountains, and some roads may be closed. If you are going to travel, check the weather forecast before you leave. Drivers should take warm clothes, water and a phone charger. The next update will be at seven o’clock.',
    passageTranslated: 'Ин огоҳии сафар барои субҳи шанбе аст. Дар кӯҳҳо барфи сахт интизор аст ва баъзе роҳҳо мумкин аст баста шаванд. Агар шумо сафар карданӣ бошед, пеш аз баромадан пешгӯии ҳаворо санҷед. Ронандагон бояд либоси гарм, об ва пуркунандаи телефон гиранд. Навсозии навбатӣ соати ҳафт мешавад.',
    questions: [
      ['When is the warning for?', ['Saturday morning', 'Friday evening', 'Sunday night', 'Monday'], 0, 'Saturday morning.'],
      ['What weather is expected?', ['Heavy snow', 'Hot sun', 'Fog only', 'No rain'], 0, 'Heavy snow.'],
      ['What should drivers take?', ['Warm clothes, water and a charger', 'A passport only', 'A book and pen', 'A ticket'], 0, 'warm clothes, water and a phone charger.'],
      ['When is the next update?', ['At seven o’clock', 'At ten thirty', 'At noon', 'Tomorrow morning'], 0, 'at seven o’clock.'],
    ],
  },
  {
    kind: 'reading',
    title: 'Preparing for an exam',
    titleTranslated: 'Тайёрӣ ба имтиҳон',
    passage: 'Dilshod failed his English test last year because he did not practise listening. This year he has made a study plan. He reviews vocabulary every morning, listens to short messages on his phone and speaks with a friend twice a week. Although he still makes mistakes, he feels more confident than before.',
    passageTranslated: 'Дилшод соли гузашта аз имтиҳони англисӣ нагузашт, чунки шунавоиро машқ накард. Имсол ӯ нақшаи омӯзиш сохт. Ӯ ҳар саҳар луғатро такрор мекунад, дар телефонаш паёмҳои кӯтоҳ мешунавад ва ду бор дар як ҳафта бо дӯсташ гап мезанад. Гарчанде ҳоло ҳам хато мекунад, ӯ нисбат ба пеш боварии бештар дорад.',
    questions: [
      ['Why did Dilshod fail last year?', ['He did not practise listening', 'He was ill', 'He lost his book', 'He was late'], 0, 'because he did not practise listening.'],
      ['What does he review every morning?', ['Vocabulary', 'Weather', 'Tickets', 'Food'], 0, 'reviews vocabulary every morning.'],
      ['How often does he speak with a friend?', ['Twice a week', 'Every day', 'Once a month', 'Never'], 0, 'twice a week.'],
      ['How does he feel now?', ['More confident', 'More worried', 'Angry', 'Bored'], 0, 'more confident than before.'],
    ],
  },
  {
    kind: 'reading',
    title: 'A short work email',
    titleTranslated: 'Email-и кӯтоҳи корӣ',
    passage: 'Dear Mr. Karimov, I am writing about tomorrow’s meeting. I am sorry, but I will arrive twenty minutes late because I have a doctor’s appointment. I have attached the report to this email. Please let me know if you need anything else. Best regards, Farida.',
    passageTranslated: 'Муҳтарам ҷаноби Каримов, ман дар бораи ҷаласаи пагоҳ менависам. Бубахшед, аммо ман бист дақиқа дер меоям, чунки вақти қабули духтур дорам. Ман ҳисоботро ба ин email замима кардам. Лутфан хабар диҳед, агар чизи дигар лозим бошад. Бо эҳтиром, Фарида.',
    questions: [
      ['What is the email about?', ['Tomorrow’s meeting', 'A restaurant', 'A holiday', 'A new phone'], 0, 'about tomorrow’s meeting.'],
      ['Why will Farida be late?', ['She has a doctor’s appointment', 'Her train is delayed', 'She lost her phone', 'She is on holiday'], 0, 'doctor’s appointment.'],
      ['What has she attached?', ['The report', 'A photo', 'A ticket', 'A receipt'], 0, 'the report.'],
      ['Who is the email to?', ['Mr. Karimov', 'Dilshod', 'Saida', 'A customer'], 0, 'Dear Mr. Karimov.'],
    ],
  },
];

const descriptors = [
  ['overall', 'Ман метавонам дар вазъиятҳои оддии ҳаррӯза бо ҷумлаҳои кӯтоҳ муошират кунам.'],
  ['overall', 'Ман метавонам дар бораи гузашта, нақшаҳои оянда, кор, сафар ва саломатӣ маълумоти оддӣ диҳам.'],
  ['listening', 'Ман метавонам паёмҳо ва эълонҳои кӯтоҳи равшанро дар бораи вақт, сафар, кор ва харид бифаҳмам.'],
  ['listening', 'Ман метавонам маънои умумии гуфтугӯи кӯтоҳро, агар оҳиста ва равшан бошад, фаҳмам.'],
  ['reading', 'Ман метавонам матнҳои кӯтоҳи ҳаррӯза, email, эълон, меню ва дастурҳои соддаро фаҳмам.'],
  ['reading', 'Ман метавонам маълумоти асосиро аз матни кӯтоҳ пайдо кунам.'],
  ['speaking', 'Ман метавонам дар бораи оила, кор, таҳсил, сафар ва таҷрибаи гузашта бо ҷумлаҳои содда гап занам.'],
  ['speaking', 'Ман метавонам пешниҳод кунам, розӣ ё норозӣ шавам ва сабаби оддӣ диҳам.'],
  ['writing', 'Ман метавонам email ё паёми кӯтоҳ нависам ва дар он сабаб, нақша ё дархостро шарҳ диҳам.'],
  ['writing', 'Ман метавонам бо because, so, when ва if ҷумлаҳои соддаро пайваст кунам.'],
];

async function getCourse() {
  const [target, native] = await Promise.all([
    prisma.language.findUnique({ where: { code: 'en' } }),
    prisma.language.findUnique({ where: { code: 'tg' } }),
  ]);
  if (!target || !native) throw new Error('English or Tajik language is missing');
  const course = await prisma.course.findFirst({
    where: { targetLanguageId: target.id, nativeLanguageId: native.id, level: 'A2' },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A2 English->Tajik course is missing');
  return { course, target, native };
}

async function loadCourse(courseId) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
}

async function ensureModules(course) {
  let count = 0;
  for (const [title, titleTranslated, emoji, order] of moduleSpecs) {
    const existing = await prisma.module.findFirst({ where: { courseId: course.id, title } });
    if (!existing) {
      await prisma.module.create({
        data: {
          courseId: course.id,
          title,
          titleTranslated,
          emoji,
          color: '#14B8A6',
          order,
          isActive: true,
        },
      });
      count++;
    } else {
      await prisma.module.update({
        where: { id: existing.id },
        data: { titleTranslated, emoji, order, isActive: true },
      });
    }
  }
  return count;
}

async function ensureLesson(moduleId, spec) {
  let lesson = await prisma.lesson.findFirst({ where: { moduleId, title: spec.title } });
  if (!lesson) {
    const last = await prisma.lesson.findFirst({ where: { moduleId }, orderBy: { order: 'desc' }, select: { order: true } });
    lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: spec.title,
        titleTranslated: spec.titleTranslated,
        type: spec.type ?? 'vocab',
        cefrLevel: 'A2',
        skillType: spec.skillType ?? 'vocab',
        emoji: spec.emoji ?? '📚',
        xpReward: spec.xpReward ?? 70,
        duration: spec.duration ?? 6,
        order: spec.order ?? ((last?.order ?? -1) + 1),
        isActive: true,
      },
    });
  } else {
    lesson = await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        titleTranslated: spec.titleTranslated,
        cefrLevel: 'A2',
        skillType: spec.skillType ?? lesson.skillType,
        isActive: true,
      },
    });
  }
  return lesson;
}

async function addVocab(course) {
  const modules = new Map(course.modules.map((m) => [m.title, m]));
  let created = 0;
  let updated = 0;
  const ops = [];
  for (const spec of vocabLessons) {
    const module = modules.get(spec.module);
    if (!module) continue;
    const lesson = await ensureLesson(module.id, spec);
    for (let i = 0; i < spec.words.length; i++) {
      const [word, translation] = spec.words[i];
      const partOfSpeech = pos(word);
      const ex = exampleFor(word, translation, partOfSpeech);
      const existing = await prisma.word.findFirst({ where: { lessonId: lesson.id, word } });
      const data = {
        translation,
        ipa: ipa(word),
        emoji: partOfSpeech === 'verb' ? '⚙️' : partOfSpeech === 'adjective' ? '✨' : '🔹',
        example: ex.example,
        exampleTrans: ex.exampleTrans,
        partOfSpeech,
        frequencyRank: 1200 + created + updated + i,
        difficulty: 2,
        order: i,
      };
      if (existing) {
        ops.push(() => prisma.word.update({ where: { id: existing.id }, data }));
        updated++;
      } else {
        ops.push(() => prisma.word.create({ data: { lessonId: lesson.id, word, ...data } }));
        created++;
      }
    }
  }
  for (let i = 0; i < ops.length; i += 25) {
    await Promise.all(ops.slice(i, i + 25).map((fn) => fn()));
  }
  return { created, updated };
}

async function fillExistingWordMetadata(course) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  let count = 0;
  const ops = [];
  for (const lesson of lessons) {
    for (const word of lesson.words) {
      const partOfSpeech = word.partOfSpeech || pos(word.word);
      const ex = exampleFor(word.word, word.translation, partOfSpeech);
      const data = {};
      if (!word.partOfSpeech) data.partOfSpeech = partOfSpeech;
      if (!word.ipa) data.ipa = ipa(word.word);
      if (!word.example) data.example = ex.example;
      if (!word.exampleTrans) data.exampleTrans = ex.exampleTrans;
      if (!word.frequencyRank) data.frequencyRank = 1000 + count;
      if (Object.keys(data).length) {
        ops.push(() => prisma.word.update({ where: { id: word.id }, data }));
        count++;
      }
    }
  }
  for (let i = 0; i < ops.length; i += 25) {
    await Promise.all(ops.slice(i, i + 25).map((fn) => fn()));
  }
  return count;
}

async function ensureExercise(topicId, spec) {
  const [type, prompt, answer, promptTranslated, options, explanation] = spec;
  const existing = await prisma.grammarExercise.findFirst({ where: { topicId, prompt } });
  if (existing) {
    await prisma.grammarExercise.update({
      where: { id: existing.id },
      data: { type, answer, promptTranslated, explanation, ...(options ? { options } : {}) },
    });
    return false;
  }
  const last = await prisma.grammarExercise.findFirst({ where: { topicId }, orderBy: { order: 'desc' }, select: { order: true } });
  await prisma.grammarExercise.create({
    data: { topicId, type, prompt, answer, promptTranslated, options: options || undefined, explanation, order: (last?.order ?? 0) + 1 },
  });
  return true;
}

async function addGrammar(course) {
  let created = 0;
  const topics = await prisma.grammarTopic.findMany({ where: { courseId: course.id } });
  for (const topic of topics) {
    const specs = grammarAdditions[topic.title];
    if (!specs) continue;
    for (const spec of specs) if (await ensureExercise(topic.id, spec)) created++;
  }

  const modules = new Map(course.modules.map((m) => [m.title, m]));
  for (const spec of newGrammarTopics) {
    let topic = await prisma.grammarTopic.findFirst({ where: { courseId: course.id, title: spec.title } });
    if (!topic) {
      topic = await prisma.grammarTopic.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A2',
          title: spec.title,
          titleTranslated: spec.titleTranslated,
          explanation: spec.explanation,
          emoji: '🧩',
          order: 850,
          isActive: true,
        },
      });
    } else {
      topic = await prisma.grammarTopic.update({
        where: { id: topic.id },
        data: { titleTranslated: spec.titleTranslated, explanation: spec.explanation, cefrLevel: 'A2', isActive: true },
      });
    }
    for (let i = 0; i < spec.rules.length; i++) {
      const [pattern, note] = spec.rules[i];
      const existing = await prisma.grammarRule.findFirst({ where: { topicId: topic.id, pattern } });
      if (!existing) await prisma.grammarRule.create({ data: { topicId: topic.id, pattern, note, order: i } });
    }
    for (let i = 0; i < spec.examples.length; i++) {
      const [sentence, translation, highlight] = spec.examples[i];
      const existing = await prisma.grammarExample.findFirst({ where: { topicId: topic.id, sentence } });
      if (!existing) await prisma.grammarExample.create({ data: { topicId: topic.id, sentence, translation, highlight, order: i } });
    }
    for (const ex of spec.exercises) if (await ensureExercise(topic.id, ex)) created++;

    const module = modules.get(spec.module);
    if (module) {
      const lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, grammarTopicId: topic.id } });
      if (!lesson) {
        const last = await prisma.lesson.findFirst({ where: { moduleId: module.id }, orderBy: { order: 'desc' }, select: { order: true } });
        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: spec.title,
            titleTranslated: spec.titleTranslated,
            type: 'vocab',
            cefrLevel: 'A2',
            skillType: 'grammar',
            emoji: '🧩',
            xpReward: 80,
            duration: 7,
            order: (last?.order ?? -1) + 1,
            grammarTopicId: topic.id,
            isActive: true,
          },
        });
      }
    }
  }
  return created;
}

async function addPhrases(course) {
  let count = 0;
  for (const spec of phraseCollections) {
    let col = await prisma.phraseCollection.findFirst({ where: { courseId: course.id, title: spec.title } });
    if (!col) {
      col = await prisma.phraseCollection.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A2',
          category: spec.category,
          title: spec.title,
          titleTranslated: spec.titleTranslated,
          emoji: '💬',
          order: 800 + count,
          isActive: true,
        },
      });
    }
    for (let i = 0; i < spec.phrases.length; i++) {
      const [text, translation, literal, note] = spec.phrases[i];
      const existing = await prisma.phrase.findFirst({ where: { collectionId: col.id, text } });
      if (!existing) {
        await prisma.phrase.create({ data: { collectionId: col.id, text, translation, literal, note, order: i } });
        count++;
      }
    }
  }
  return count;
}

async function addDialogues(course) {
  let count = 0;
  for (const spec of dialogues) {
    let dialogue = await prisma.dialogue.findFirst({ where: { courseId: course.id, title: spec.title } });
    if (!dialogue) {
      dialogue = await prisma.dialogue.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A2',
          title: spec.title,
          titleTranslated: spec.titleTranslated,
          scenario: spec.scenario,
          emoji: '🎙️',
          order: 800 + count,
          isActive: true,
        },
      });
    }
    await prisma.dialogueLine.deleteMany({ where: { dialogueId: dialogue.id } });
    for (let i = 0; i < spec.lines.length; i++) {
      const [speaker, text, translation, isUser] = spec.lines[i];
      await prisma.dialogueLine.create({ data: { dialogueId: dialogue.id, speaker, text, translation, isUser, order: i } });
    }
    count++;
  }
  return count;
}

async function addComprehensions(course) {
  let count = 0;
  for (const spec of comprehensions) {
    let comp = await prisma.comprehensionExercise.findFirst({ where: { courseId: course.id, title: spec.title } });
    if (!comp) {
      comp = await prisma.comprehensionExercise.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A2',
          kind: spec.kind,
          title: spec.title,
          titleTranslated: spec.titleTranslated,
          passage: spec.passage,
          passageTranslated: spec.passageTranslated,
          emoji: spec.kind === 'listening' ? '🎧' : '📖',
          order: 800 + count,
          isActive: true,
        },
      });
    } else {
      comp = await prisma.comprehensionExercise.update({
        where: { id: comp.id },
        data: { kind: spec.kind, titleTranslated: spec.titleTranslated, passage: spec.passage, passageTranslated: spec.passageTranslated, cefrLevel: 'A2', isActive: true },
      });
    }
    await prisma.comprehensionQuestion.deleteMany({ where: { exerciseId: comp.id } });
    for (let i = 0; i < spec.questions.length; i++) {
      const [question, options, correctIndex, explanation] = spec.questions[i];
      await prisma.comprehensionQuestion.create({ data: { exerciseId: comp.id, question, questionTranslated: '', options, correctIndex, explanation, order: i } });
    }
    count++;
  }
  return count;
}

async function addDescriptors(course, target, native) {
  let count = 0;
  for (let i = 0; i < descriptors.length; i++) {
    const [skill, canDo] = descriptors[i];
    const existing = await prisma.cefrDescriptor.findFirst({
      where: { targetLanguageId: target.id, nativeLanguageId: native.id, cefrLevel: 'A2', skill, canDo },
    });
    if (!existing) {
      await prisma.cefrDescriptor.create({
        data: { targetLanguageId: target.id, nativeLanguageId: native.id, cefrLevel: 'A2', skill, canDo, order: i },
      });
      count++;
    }
  }
  return count;
}

async function linkFinalExamLessons(course) {
  const module = course.modules.find((m) => m.title === 'A2 Review');
  if (!module) return 0;
  const reading = await prisma.comprehensionExercise.findFirst({ where: { courseId: course.id, title: 'Choosing a course' } });
  const listening = await prisma.comprehensionExercise.findFirst({ where: { courseId: course.id, title: 'A phone message' } });
  const specs = [
    { title: 'A2 Reading Exam', titleTranslated: 'Имтиҳони A2: Хониш', skillType: 'reading', comprehensionId: reading?.id, order: 3, emoji: '📖' },
    { title: 'A2 Listening Exam', titleTranslated: 'Имтиҳони A2: Шунидан', skillType: 'listening', comprehensionId: listening?.id, order: 4, emoji: '🎧' },
    { title: 'A2 Writing Exam', titleTranslated: 'Имтиҳони A2: Навиштан', skillType: 'writing', order: 5, emoji: '✍️' },
    { title: 'A2 Speaking Exam', titleTranslated: 'Имтиҳони A2: Гуфтор', skillType: 'speaking', order: 6, emoji: '🎙️' },
    { title: 'A2 Final Mastery Test', titleTranslated: 'Имтиҳони ниҳоии A2', skillType: 'review', order: 7, emoji: '🏁' },
  ];
  let count = 0;
  for (const spec of specs) {
    let lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: spec.title } });
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: spec.title,
          titleTranslated: spec.titleTranslated,
          type: spec.skillType === 'review' ? 'quiz' : 'vocab',
          cefrLevel: 'A2',
          skillType: spec.skillType,
          emoji: spec.emoji,
          xpReward: spec.skillType === 'review' ? 180 : 130,
          duration: 8,
          order: spec.order,
          comprehensionId: spec.comprehensionId ?? null,
          isActive: true,
        },
      });
      count++;
    } else {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { titleTranslated: spec.titleTranslated, skillType: spec.skillType, cefrLevel: 'A2', order: spec.order, comprehensionId: spec.comprehensionId ?? lesson.comprehensionId, isActive: true },
      });
    }
  }
  return count;
}

const examWordSets = {
  'A2 Writing Exam': [
    ['Dear teacher, I cannot come to class today.', 'Муаллими муҳтарам, ман имрӯз ба дарс омада наметавонам.'],
    ['Could we change the appointment?', 'Оё метавонем вақти қабулро иваз кунем?'],
    ['I am writing because I have a problem.', 'Ман менависам, чунки мушкил дорам.'],
    ['Thank you for your help.', 'Барои кӯмакатон ташаккур.'],
    ['Best regards', 'Бо эҳтиром'],
    ['I would like to ask a question.', 'Ман мехоҳам як савол диҳам.'],
  ],
  'A2 Speaking Exam': [
    ['In my free time, I like reading.', 'Дар вақти холӣ ман китобхониро дӯст медорам.'],
    ['Last weekend, I visited my family.', 'Охири ҳафтаи гузашта ман ба назди оилаам рафтам.'],
    ['Next year, I am going to travel.', 'Соли оянда ман сафар карданӣ ҳастам.'],
    ['I prefer online lessons because they are convenient.', 'Ман дарсҳои онлайнро афзал медонам, чунки онҳо қулайанд.'],
    ['I have never been to London.', 'Ман ҳеҷ гоҳ ба Лондон нарафтаам.'],
    ['You should rest and drink water.', 'Шумо бояд истироҳат кунед ва об нӯшед.'],
  ],
  'A2 Final Mastery Test': [
    ['I bought this phone yesterday.', 'Ман ин телефонро дирӯз харидам.'],
    ['Have you ever stayed in a hotel?', 'Оё шумо ягон бор дар меҳмонхона мондаед?'],
    ['If it rains, we will stay home.', 'Агар борон борад, мо дар хона мемонем.'],
    ['This course is more useful than the old one.', 'Ин курс аз курси кӯҳна фоиданоктар аст.'],
    ['I called to make an appointment.', 'Ман занг задам, то вақти қабул гирам.'],
    ['Although I was tired, I finished my homework.', 'Гарчанде хаста будам, вазифаи хонагиро тамом кардам.'],
    ['Could you send me the details?', 'Метавонед маълумотро ба ман фиристед?'],
    ['The internet has not worked since yesterday.', 'Интернет аз дирӯз кор намекунад.'],
  ],
};

async function addExamWords(course) {
  const module = course.modules.find((m) => m.title === 'A2 Review');
  if (!module) return 0;
  let count = 0;
  for (const [lessonTitle, words] of Object.entries(examWordSets)) {
    const lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: lessonTitle } });
    if (!lesson) continue;
    for (let i = 0; i < words.length; i++) {
      const [word, translation] = words[i];
      const existing = await prisma.word.findFirst({ where: { lessonId: lesson.id, word } });
      const partOfSpeech = 'phrase';
      const data = {
        translation,
        ipa: ipa(word),
        emoji: '🎯',
        example: word,
        exampleTrans: translation,
        partOfSpeech,
        difficulty: 3,
        frequencyRank: 1800 + i,
        order: i,
      };
      if (!existing) {
        await prisma.word.create({ data: { lessonId: lesson.id, word, ...data } });
        count++;
      } else {
        await prisma.word.update({ where: { id: existing.id }, data });
      }
    }
  }
  return count;
}

async function ensureComponentLesson(module, spec) {
  let lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: spec.title } });
  const data = {
    titleTranslated: spec.titleTranslated,
    cefrLevel: 'A2',
    skillType: spec.skillType,
    emoji: spec.emoji,
    xpReward: spec.xpReward ?? 90,
    duration: spec.duration ?? 7,
    isActive: true,
    grammarTopicId: null,
    phraseCollectionId: spec.phraseCollectionId ?? null,
    dialogueId: spec.dialogueId ?? null,
    comprehensionId: spec.comprehensionId ?? null,
  };
  if (!lesson) {
    const last = await prisma.lesson.findFirst({ where: { moduleId: module.id }, orderBy: { order: 'desc' }, select: { order: true } });
    await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: spec.title,
        type: 'vocab',
        order: (last?.order ?? -1) + 1,
        ...data,
      },
    });
    return true;
  }
  await prisma.lesson.update({ where: { id: lesson.id }, data });
  return false;
}

async function linkComponentLessons(course) {
  const modules = new Map(course.modules.map((m) => [m.title, m]));
  let count = 0;
  const phraseByTitle = new Map((await prisma.phraseCollection.findMany({ where: { courseId: course.id } })).map((p) => [p.title, p]));
  const dialogueByTitle = new Map((await prisma.dialogue.findMany({ where: { courseId: course.id } })).map((d) => [d.title, d]));
  const compByTitle = new Map((await prisma.comprehensionExercise.findMany({ where: { courseId: course.id } })).map((c) => [c.title, c]));

  const links = [
    ['The Future', { title: 'Speak: Making plans', titleTranslated: 'Гуфтор: Нақша кардан', skillType: 'speaking', emoji: '💬', phraseCollectionId: phraseByTitle.get('Making plans')?.id }],
    ['Services & Problems', { title: 'Speak: Solving problems', titleTranslated: 'Гуфтор: Ҳалли мушкилот', skillType: 'speaking', emoji: '💬', phraseCollectionId: phraseByTitle.get('Solving problems')?.id }],
    ['Comparisons', { title: 'Speak: Giving opinions', titleTranslated: 'Гуфтор: Баён кардани андеша', skillType: 'speaking', emoji: '💬', phraseCollectionId: phraseByTitle.get('Giving opinions')?.id }],
    ['Health', { title: 'Speak: Appointments', titleTranslated: 'Гуфтор: Қабул ва дархостҳо', skillType: 'speaking', emoji: '💬', phraseCollectionId: phraseByTitle.get('Appointments and formal requests')?.id }],

    ['Travel', { title: 'Dialogue: Hotel check-in', titleTranslated: 'Муколама: Воридшавӣ ба меҳмонхона', skillType: 'listening', emoji: '🎙️', dialogueId: dialogueByTitle.get('Checking in at a hotel')?.id }],
    ['Health', { title: 'Dialogue: At the doctor', titleTranslated: 'Муколама: Назди духтур', skillType: 'listening', emoji: '🎙️', dialogueId: dialogueByTitle.get('At the doctor')?.id }],
    ['Services & Problems', { title: 'Dialogue: Returning an item', titleTranslated: 'Муколама: Баргардонидани мол', skillType: 'listening', emoji: '🎙️', dialogueId: dialogueByTitle.get('Returning an item')?.id }],
    ['Education & Skills', { title: 'Dialogue: Job interview', titleTranslated: 'Муколама: Мусоҳибаи корӣ', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('A job interview')?.id }],
    ['Technology & Media', { title: 'Dialogue: Fixing the internet', titleTranslated: 'Муколама: Таъмири интернет', skillType: 'listening', emoji: '🎙️', dialogueId: dialogueByTitle.get('Fixing the internet')?.id }],
    ['Services & Problems', { title: 'Dialogue: Opening a bank account', titleTranslated: 'Муколама: Кушодани ҳисоби бонкӣ', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('Opening a bank account')?.id }],
    ['Home & Community', { title: 'Dialogue: Asking for permission', titleTranslated: 'Муколама: Пурсидани иҷозат', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('Asking for permission')?.id }],
    ['Stories & Experiences', { title: 'Dialogue: Talking about an accident', titleTranslated: 'Муколама: Суҳбат дар бораи ҳодиса', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('Talking about an accident')?.id }],
    ['Technology & Media', { title: 'Dialogue: Discussing a film', titleTranslated: 'Муколама: Муҳокимаи филм', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('Discussing a film')?.id }],
    ['Education & Skills', { title: 'Dialogue: Study schedule', titleTranslated: 'Муколама: Нақшаи омӯзиш', skillType: 'speaking', emoji: '🎙️', dialogueId: dialogueByTitle.get('Planning a study schedule')?.id }],

    ['Travel', { title: 'Reading: A weekend trip', titleTranslated: 'Хониш: Сафари охири ҳафта', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('A weekend trip')?.id }],
    ['Technology & Media', { title: 'Reading: An online problem', titleTranslated: 'Хониш: Мушкили онлайн', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('An online problem')?.id }],
    ['Education & Skills', { title: 'Listening: Course announcement', titleTranslated: 'Шунавоӣ: Эълони курс', skillType: 'listening', emoji: '🎧', comprehensionId: compByTitle.get('A course announcement')?.id }],
    ['Home & Community', { title: 'Reading: Community center', titleTranslated: 'Хониш: Маркази ҷомеа', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('A new community center')?.id }],
    ['Food & Quantity', { title: 'Reading: Restaurant review', titleTranslated: 'Хониш: Тақризи тарабхона', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('A restaurant review')?.id }],
    ['Weather & Contact', { title: 'Listening: Weather warning', titleTranslated: 'Шунавоӣ: Огоҳии ҳаво', skillType: 'listening', emoji: '🎧', comprehensionId: compByTitle.get('Weather and travel warning')?.id }],
    ['Education & Skills', { title: 'Reading: Exam preparation', titleTranslated: 'Хониш: Тайёрӣ ба имтиҳон', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('Preparing for an exam')?.id }],
    ['Work & Routine', { title: 'Reading: Work email', titleTranslated: 'Хониш: Email-и корӣ', skillType: 'reading', emoji: '📖', comprehensionId: compByTitle.get('A short work email')?.id }],
  ];

  for (const [moduleTitle, spec] of links) {
    const module = modules.get(moduleTitle);
    if (!module) continue;
    if (!spec.phraseCollectionId && !spec.dialogueId && !spec.comprehensionId) continue;
    if (await ensureComponentLesson(module, spec)) count++;
  }
  return count;
}

async function audit(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { include: { lessons: { include: { words: true } } } },
      grammarTopics: { include: { exercises: true } },
      phraseCollections: { include: { phrases: true } },
      dialogues: { include: { lines: true } },
      comprehensions: { include: { questions: true } },
    },
  });
  const lessons = course.modules.flatMap((m) => m.lessons);
  const words = lessons.flatMap((l) => l.words);
  const bySkill = lessons.reduce((acc, l) => {
    acc[l.skillType] = (acc[l.skillType] || 0) + 1;
    return acc;
  }, {});
  const grammarTypes = course.grammarTopics.flatMap((t) => t.exercises).reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});
  return {
    modules: course.modules.length,
    lessons: lessons.length,
    words: words.length,
    wordsMissingPos: words.filter((w) => !w.partOfSpeech).length,
    wordsMissingIpa: words.filter((w) => !w.ipa).length,
    wordsMissingExample: words.filter((w) => !w.example || !w.exampleTrans).length,
    grammarTopics: course.grammarTopics.length,
    grammarExercises: course.grammarTopics.reduce((s, t) => s + t.exercises.length, 0),
    grammarTypes,
    phraseCollections: course.phraseCollections.length,
    phrases: course.phraseCollections.reduce((s, c) => s + c.phrases.length, 0),
    dialogues: course.dialogues.length,
    dialogueLines: course.dialogues.reduce((s, d) => s + d.lines.length, 0),
    comprehensions: course.comprehensions.length,
    comprehensionQuestions: course.comprehensions.reduce((s, c) => s + c.questions.length, 0),
    bySkill,
  };
}

async function main() {
  const initial = await getCourse();
  let { course, target, native } = initial;
  const modulesCreated = await ensureModules(course);
  course = await loadCourse(course.id);
  const existingMetadata = await fillExistingWordMetadata(course);
  const vocab = await addVocab(course);
  course = await loadCourse(course.id);
  const grammarCreated = await addGrammar(course);
  const phrases = await addPhrases(course);
  const dialogueCount = await addDialogues(course);
  const comprehensionCount = await addComprehensions(course);
  const descriptorCount = await addDescriptors(course, target, native);
  course = await loadCourse(course.id);
  const componentLessons = await linkComponentLessons(course);
  const finalLessons = await linkFinalExamLessons(course);
  course = await loadCourse(course.id);
  const examWords = await addExamWords(course);
  const stats = await audit(course.id);
  console.log(JSON.stringify({
    ok: true,
    modulesCreated,
    existingMetadata,
    vocab,
    grammarCreated,
    phrases,
    dialogueCount,
    comprehensionCount,
    descriptorCount,
    componentLessons,
    finalLessons,
    examWords,
    stats,
  }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
