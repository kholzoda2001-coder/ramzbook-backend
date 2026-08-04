// B1 vocabulary, batch 3: bring every new lesson up to twelve words.
//
// Batches 1 and 2 created 24 lessons, but the duplicate guard thinned some of
// them — "Prices and Value" landed with six words, which reads as unfinished
// next to the module's original ten-word lessons. This tops each one back up.
// Every candidate is checked against the whole B1 list before it is inserted,
// so the guard still applies.

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

const TOPUPS = [
  { id: 'cmsdmkg6c000fbaer1m5ca32n', label: 'M1 Travel Documents and Money', words: [
    W('Fare', 'Нархи роҳ', 'The train fare has gone up.', 'Нархи роҳи поезд боло рафт.', '/feə/', 'noun', '🎫'),
    W('Fine', 'Ҷарима', 'You will pay a fine if you lose the ticket.', 'Агар чиптаро гум кунед, ҷарима медиҳед.', '/faɪn/', 'noun', '⚠️'),
  ]},
  { id: 'cmsdmkj40000tbaertehbtiaf', label: 'M1 Describing a Journey', words: [
    W('Bumpy', 'Ноҳамвор', 'The road to the village was bumpy.', 'Роҳ то деҳа ноҳамвор буд.', '/ˈbʌmpi/', 'adjective', '🚙'),
    W('Overnight', 'Шабона', 'We took an overnight train.', 'Мо бо поезди шабона рафтем.', '/ˌəʊvəˈnaɪt/', 'adjective', '🌙'),
  ]},
  { id: 'cmsdmkloj0017baer5do9hvln', label: 'M2 Studying and Exams', words: [
    W('Tutor', 'Устоди хусусӣ', 'She has a maths tutor.', 'Ӯ устоди хусусии математика дорад.', '/ˈtjuːtə/', 'noun', '👩‍🏫'),
    W('Deadline extension', 'Дароз кардани мӯҳлат', 'He asked for a deadline extension.', 'Ӯ дароз кардани мӯҳлатро хоҳиш кард.', '/ˈdedlaɪn ɪkˈstenʃn/', 'noun', '📆'),
    W('Cheat', 'Фиреб кардан', 'Never cheat in an exam.', 'Ҳеҷ гоҳ дар имтиҳон фиреб накунед.', '/tʃiːt/', 'verb', '🚫'),
  ]},
  { id: 'cmsdmkqiy001wbaerimgzdeug', label: 'M3 Books and Reading', words: [
    W('Paperback', 'Китоби муқоваи нарм', 'I prefer a paperback to a screen.', 'Ман китоби муқоваи нармро аз экран бартар медонам.', '/ˈpeɪpəbæk/', 'noun', '📗'),
    W('Sequel', 'Идома (китоб/филм)', 'The sequel was better than the first book.', 'Идома аз китоби якум беҳтар буд.', '/ˈsiːkwəl/', 'noun', '2️⃣'),
    W('Gripping', 'Ҷолиби диққат', 'It is a gripping story.', 'Ин ҳикояи ҷолиби диққат аст.', '/ˈɡrɪpɪŋ/', 'adjective', '😲'),
  ]},
  { id: 'cmsdmkspy0029baer78rq1ojq', label: 'M3 Talking about Media', words: [
    W('Channel', 'Шабака (ТВ)', 'Which channel is the match on?', 'Бозӣ дар кадом шабака аст?', '/ˈtʃænl/', 'noun', '📺'),
    W('Advert', 'Реклама', 'The advert appears before every video.', 'Реклама пеш аз ҳар видео пайдо мешавад.', '/ˈædvɜːt/', 'noun', '📢'),
    W('Live', 'Мустақим (пахш)', 'The concert was shown live.', 'Консерт мустақим нишон дода шуд.', '/laɪv/', 'adjective', '🔴'),
  ]},
  { id: 'cmsdmkuv4002mbaer43hph7ei', label: 'M4 Weather and Climate', words: [
    W('Mild', 'Мулоим (обу ҳаво)', 'The winter was unusually mild.', 'Зимистон ғайриоддӣ мулоим буд.', '/maɪld/', 'adjective', '🌤'),
    W('Frost', 'Шабнами ях', 'There was frost on the grass.', 'Дар алаф шабнами ях буд.', '/frɒst/', 'noun', '❄️'),
  ]},
  { id: 'cmsdml1e4003lbaerplmbob68', label: 'M5 Mental Health', words: [
    W('Insomnia', 'Бехобӣ', 'Stress can cause insomnia.', 'Стресс метавонад бехобӣ орад.', '/ɪnˈsɒmniə/', 'noun', '🌃'),
    W('Wellbeing', 'Некӯаҳволӣ', 'Sleep affects your wellbeing.', 'Хоб ба некӯаҳволии шумо таъсир мекунад.', '/ˈwelbiːɪŋ/', 'noun', '🌿'),
  ]},
  { id: 'cmsdofahu002614cded05yfvl', label: 'M7 Prices and Value', words: [
    W('Refundable', 'Баргардонидашаванда', 'The ticket is not refundable.', 'Чипта баргардонида намешавад.', '/rɪˈfʌndəbl/', 'adjective', '↩️'),
    W('Bargain hunter', 'Ҷӯяндаи арзонӣ', 'She is a real bargain hunter.', 'Ӯ ҷӯяндаи ҳақиқии арзонӣ аст.', '/ˈbɑːɡɪn ˌhʌntə/', 'noun', '🔍'),
    W('Cost-effective', 'Аз ҷиҳати нарх фоиданок', 'Buying in bulk is cost-effective.', 'Яклухт харидан фоиданок аст.', '/ˌkɒst ɪˈfektɪv/', 'adjective', '📉'),
    W('Luxury', 'Молҳои гаронбаҳо', 'A new car is a luxury for them.', 'Мошини нав барои онҳо чизи гаронбаҳост.', '/ˈlʌkʃəri/', 'noun', '💎'),
    W('Essential', 'Зарурӣ', 'Food and rent are essential costs.', 'Хӯрок ва иҷора хароҷоти зарурианд.', '/ɪˈsenʃl/', 'adjective', '📌'),
    W('Rip-off', 'Фиреби нархӣ', 'Twenty dollars for a coffee is a rip-off.', 'Бист доллар барои қаҳва фиреб аст.', '/ˈrɪp ɒf/', 'noun', '😠'),
  ]},
  { id: 'cmsdofcqd002f14cd3c4ik55i', label: 'M7 Work and Income', words: [
    W('Debt', 'Қарз', 'He is trying to pay off his debt.', 'Ӯ кӯшиш мекунад қарзашро пардохт кунад.', '/det/', 'noun', '⛓'),
    W('Budget', 'Буҷа', 'Make a monthly budget.', 'Буҷаи ҳармоҳа созед.', '/ˈbʌdʒɪt/', 'noun', '📊'),
    W('Expense', 'Хароҷот', 'Travel expenses are paid by the company.', 'Хароҷоти сафарро ширкат мепардозад.', '/ɪkˈspens/', 'noun', '🧾'),
    W('Income tax', 'Андози даромад', 'Everyone pays income tax.', 'Ҳама андози даромад мепардозанд.', '/ˈɪnkʌm tæks/', 'noun', '🏛'),
    W('Savings account', 'Ҳисоби пасандоз', 'Open a savings account early.', 'Барвақт ҳисоби пасандоз кушоед.', '/ˈseɪvɪŋz əˌkaʊnt/', 'noun', '🏦'),
  ]},
  { id: 'cmsdofesz002p14cd99zads03', label: 'M8 Family and Friends', words: [
    W('Trust', 'Бовар кардан', 'I trust him completely.', 'Ман ба ӯ комилан бовар мекунам.', '/trʌst/', 'verb', '🤝'),
    W('Argument', 'Ҷанҷол', 'They had a short argument.', 'Онҳо ҷанҷоли кӯтоҳ доштанд.', '/ˈɑːɡjumənt/', 'noun', '⚡'),
    W('Apologise', 'Узр хостан', 'He apologised the next day.', 'Ӯ рӯзи дигар узр хост.', '/əˈpɒlədʒaɪz/', 'verb', '🙇'),
  ]},
  { id: 'cmsdofh4m003114cdhh3bispe', label: 'M8 Describing People', words: [
    W('Loyal', 'Содиқ', 'She is a loyal friend.', 'Ӯ дӯсти содиқ аст.', '/ˈlɔɪəl/', 'adjective', '🛡'),
    W('Talkative', 'Гапдон', 'My brother is very talkative.', 'Бародари ман хеле гапдон аст.', '/ˈtɔːkətɪv/', 'adjective', '💬'),
  ]},
  { id: 'cmsdofjaz003e14cdd4g3d4w8', label: 'M9 Diet and Nutrition', words: [
    W('Sugar-free', 'Бе шакар', 'This drink is sugar-free.', 'Ин нӯшокӣ бе шакар аст.', '/ˈʃʊɡə friː/', 'adjective', '🚫'),
    W('Wholegrain', 'Ғаллаи пурра', 'Wholegrain bread is healthier.', 'Нони ғаллаи пурра солимтар аст.', '/ˈhəʊlɡreɪn/', 'adjective', '🌾'),
    W('Dairy', 'Маҳсулоти ширӣ', 'She avoids dairy products.', 'Ӯ аз маҳсулоти ширӣ дурӣ меҷӯяд.', '/ˈdeəri/', 'noun', '🥛'),
    W('Overeat', 'Аз ҳад зиёд хӯрдан', 'Do not overeat in the evening.', 'Бегоҳӣ аз ҳад зиёд нахӯред.', '/ˌəʊvərˈiːt/', 'verb', '🍽'),
  ]},
  { id: 'cmsdofnao004414cd4sqppoid', label: 'M10 Research and Experiments', words: [
    W('Method', 'Усул', 'They used a new method.', 'Онҳо усули навро истифода бурданд.', '/ˈmeθəd/', 'noun', '🧭'),
    W('Approach', 'Муносибат / равиш', 'This approach saved a lot of time.', 'Ин равиш вақти зиёдро сарфа кард.', '/əˈprəʊtʃ/', 'noun', '🛤'),
    W('Significant', 'Назаррас', 'The difference was significant.', 'Фарқият назаррас буд.', '/sɪɡˈnɪfɪkənt/', 'adjective', '📌'),
  ]},
  { id: 'cmsdofp7t004g14cdsse8kcy2', label: 'M10 Technology and Innovation', words: [
    W('Advanced', 'Пешрафта', 'This is advanced technology.', 'Ин технологияи пешрафта аст.', '/ədˈvɑːnst/', 'adjective', '🚀'),
    W('Reliable', 'Боэътимод', 'The system must be reliable.', 'Система бояд боэътимод бошад.', '/rɪˈlaɪəbl/', 'adjective', '🔒'),
    W('Upgrade', 'Такмил додан', 'We upgraded all the computers.', 'Мо ҳамаи компютерҳоро такмил додем.', '/ˈʌpɡreɪd/', 'verb', '⬆️'),
  ]},
  { id: 'cmsdofrgv004s14cd2071q4h1', label: 'M11 Community and Change', words: [
    W('Fundraise', 'Маблағ ҷамъ кардан', 'They fundraise for the hospital.', 'Онҳо барои беморхона маблағ ҷамъ мекунанд.', '/ˈfʌndreɪz/', 'verb', '💰'),
    W('Awareness', 'Огоҳӣ', 'The campaign raised awareness.', 'Маърака огоҳиро баланд бардошт.', '/əˈweənəs/', 'noun', '💡'),
    W('Inequality', 'Нобаробарӣ', 'Inequality is still a problem.', 'Нобаробарӣ ҳанӯз мушкил аст.', '/ˌɪnɪˈkwɒləti/', 'noun', '⚖️'),
  ]},
  { id: 'cmsdoftmr005414cda5e3cxg4', label: 'M11 Media and Opinion', words: [
    W('Headline', 'Сарлавҳа', 'The headline was misleading.', 'Сарлавҳа гумроҳкунанда буд.', '/ˈhedlaɪn/', 'noun', '🗞'),
    W('Viewpoint', 'Нуқтаи назар', 'Consider the other viewpoint.', 'Нуқтаи назари дигарро ба назар гиред.', '/ˈvjuːpɔɪnt/', 'noun', '👁'),
  ]},
  { id: 'cmsdofw55005i14cd2idbr8bc', label: 'M12 Learning and Habits', words: [
    W('Motivation', 'Ангеза', 'Motivation comes and goes.', 'Ангеза меояд ва меравад.', '/ˌməʊtɪˈveɪʃn/', 'noun', '🔥'),
    W('Goal', 'Ҳадаф', 'Write your goal on paper.', 'Ҳадафатонро дар коғаз нависед.', '/ɡəʊl/', 'noun', '🎯'),
    W('Note down', 'Қайд кардан', 'Note down every new word.', 'Ҳар калимаи навро қайд кунед.', '/nəʊt daʊn/', 'verb', '📝'),
    W('Keep up', 'Идома додан', 'Keep up the good work.', 'Кори хубро идома диҳед.', '/kiːp ʌp/', 'verb', '💪'),
    W('Look up', 'Ҷустуҷӯ кардан (дар луғат)', 'Look up the word in a dictionary.', 'Калимаро дар луғат ҷустуҷӯ кунед.', '/lʊk ʌp/', 'verb', '🔍'),
  ]},
  { id: 'cmsdofxzi005s14cd7d3yowws', label: 'M12 Success and Failure', words: [
    W('Persist', 'Собитқадам будан', 'Persist even when it is hard.', 'Ҳатто вақте душвор аст, собитқадам бошед.', '/pəˈsɪst/', 'verb', '🧗'),
    W('Setback', 'Нокомии муваққатӣ', 'Every project has setbacks.', 'Ҳар лоиҳа нокомии муваққатӣ дорад.', '/ˈsetbæk/', 'noun', '↩️'),
  ]},
];

const mods = (await api('/modules?courseId=' + B1)).modules;
const existing = new Set();
for (const m of mods) for (const l of (await api('/lessons?moduleId=' + m.id)).lessons) {
  if (!l._count.words) continue;
  for (const w of (await api('/words?lessonId=' + l.id)).words) existing.add(w.word.toLowerCase().trim());
}
console.log('калимаи мавҷуда:', existing.size);

let added = 0;
for (const t of TOPUPS) {
  const have = (await api('/words?lessonId=' + t.id)).words;
  const fresh = t.words.filter(w => !existing.has(w.word.toLowerCase().trim()));
  fresh.forEach(w => existing.add(w.word.toLowerCase().trim()));
  if (!fresh.length) { console.log(`  – ${t.label}: чизи нав нест`); continue; }
  await api('/words/bulk', 'POST', {
    lessonId: t.id, mode: 'replace',
    words: [...have.map(w => ({ word: w.word, translation: w.translation, example: w.example, exampleTrans: w.exampleTrans, ipa: w.ipa, partOfSpeech: w.partOfSpeech, emoji: w.emoji })), ...fresh],
  });
  added += fresh.length;
  console.log(`  ✓ ${t.label}: +${fresh.length} → ${have.length + fresh.length}`);
}
console.log(`\n✅ ${added} калимаи нав. Ҷамъи ягонаи B1: ${existing.size}`);
