// B1 vocabulary, batch 4: one more lesson per module, to close the remaining
// gap to the CEFR B1 range.
//
// After batches 1–3 the three levels together hold 1869 unique words; B1 asks
// for roughly 2000–2500. Each module gets a seventh vocabulary lesson on a
// theme none of its existing six covers. Lists are written long (15–16 words)
// on purpose: the duplicate guard rejected a quarter of batch 1, so starting
// above target is what lands each lesson near twelve.

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

const LESSONS = [
  { mo: 0, title: 'Sightseeing and Culture', titleTr: 'Тамошо ва фарҳанг', emoji: '🗺', words: [
    W('Tourist', 'Сайёҳ', 'The old town is full of tourists.', 'Шаҳри кӯҳна пур аз сайёҳон аст.', '/ˈtʊərɪst/', 'noun', '📸'),
    W('Guide', 'Роҳбалад', 'Our guide spoke three languages.', 'Роҳбаладӣ мо се забон медонист.', '/ɡaɪd/', 'noun', '🧭'),
    W('Souvenir', 'Тӯҳфаи ёдгорӣ', 'I bought a souvenir for my sister.', 'Ман барои хоҳарам тӯҳфаи ёдгорӣ харидам.', '/ˌsuːvəˈnɪə/', 'noun', '🎁'),
    W('Itinerary', 'Нақшаи сафар', 'The itinerary includes three cities.', 'Нақшаи сафар се шаҳрро дар бар мегирад.', '/aɪˈtɪnərəri/', 'noun', '📋'),
    W('Excursion', 'Экскурсия', 'We booked a day excursion.', 'Мо экскурсияи якрӯзаро фармоиш додем.', '/ɪkˈskɜːʃn/', 'noun', '🚌'),
    W('Monument', 'Ёдгорӣ', 'The monument was built in 1890.', 'Ёдгорӣ соли 1890 сохта шудааст.', '/ˈmɒnjumənt/', 'noun', '🗿'),
    W('Gallery', 'Нигористон', 'The gallery is free on Sundays.', 'Нигористон рӯзи якшанбе ройгон аст.', '/ˈɡæləri/', 'noun', '🖼'),
    W('Exhibition', 'Намоишгоҳ', 'There is an exhibition of old photos.', 'Намоишгоҳи аксҳои кӯҳна ҳаст.', '/ˌeksɪˈbɪʃn/', 'noun', '🏛'),
    W('Admission', 'Ҳаққи даромад', 'Admission costs five dollars.', 'Ҳаққи даромад панҷ доллар аст.', '/ədˈmɪʃn/', 'noun', '🎫'),
    W('Resort', 'Истироҳатгоҳ', 'They stayed at a mountain resort.', 'Онҳо дар истироҳатгоҳи кӯҳӣ монданд.', '/rɪˈzɔːt/', 'noun', '🏖'),
    W('Scenery', 'Манзара', 'The scenery along the road was beautiful.', 'Манзараи канори роҳ зебо буд.', '/ˈsiːnəri/', 'noun', '🏞'),
    W('Wander', 'Гаштан', 'We wandered through the market.', 'Мо дар бозор гаштем.', '/ˈwɒndə/', 'verb', '🚶'),
    W('Crowd', 'Мардум / издиҳом', 'A huge crowd gathered in the square.', 'Дар майдон издиҳоми калон ҷамъ шуд.', '/kraʊd/', 'noun', '👥'),
    W('Local', 'Маҳаллӣ', 'We ate at a local restaurant.', 'Мо дар тарабхонаи маҳаллӣ хӯрок хӯрдем.', '/ˈləʊkl/', 'adjective', '📍'),
    W('Abroad', 'Хориҷа', 'He has never travelled abroad.', 'Ӯ ҳеҷ гоҳ ба хориҷа нарафтааст.', '/əˈbrɔːd/', 'adverb', '🌍'),
  ]},
  { mo: 1, title: 'Applying for a Job', titleTr: 'Ариза барои кор', emoji: '📄', words: [
    W('CV', 'Тарҷумаи ҳол (CV)', 'Send your CV by email.', 'CV-и худро бо почта фиристед.', '/ˌsiː ˈviː/', 'noun', '📄'),
    W('Vacancy', 'Ҷои холии корӣ', 'There is a vacancy in the sales team.', 'Дар дастаи фурӯш ҷои холӣ ҳаст.', '/ˈveɪkənsi/', 'noun', '🪑'),
    W('Candidate', 'Номзад', 'Five candidates were interviewed.', 'Панҷ номзад мусоҳиба шуданд.', '/ˈkændɪdət/', 'noun', '🙋'),
    W('Reference', 'Тавсиянома', 'My old boss wrote me a reference.', 'Сардори кӯҳнаам ба ман тавсиянома навишт.', '/ˈrefrəns/', 'noun', '✉️'),
    W('Recruit', 'Ба кор гирифтан', 'They recruit new staff every spring.', 'Онҳо ҳар баҳор корманди нав мегиранд.', '/rɪˈkruːt/', 'verb', '🤝'),
    W('Negotiate', 'Гуфтушунид кардан', 'You can negotiate the salary.', 'Шумо маошро гуфтушунид карда метавонед.', '/nɪˈɡəʊʃieɪt/', 'verb', '💬'),
    W('Probation', 'Давраи санҷишӣ', 'The first three months are probation.', 'Се моҳи аввал давраи санҷишӣ аст.', '/prəˈbeɪʃn/', 'noun', '⏳'),
    W('Promotion', 'Пешравии хизматӣ', 'She got a promotion after two years.', 'Ӯ баъди ду сол пешравӣ гирифт.', '/prəˈməʊʃn/', 'noun', '📈'),
    W('Resign', 'Аз кор рафтан', 'He resigned last week.', 'Ӯ ҳафтаи гузашта аз кор рафт.', '/rɪˈzaɪn/', 'verb', '🚪'),
    W('Notice', 'Огоҳии пешакӣ', 'You must give one month\'s notice.', 'Шумо бояд як моҳ пеш огоҳ кунед.', '/ˈnəʊtɪs/', 'noun', '📅'),
    W('Shift work', 'Кори навбатӣ', 'Nurses often do shift work.', 'Ҳамширагон аксар кори навбатӣ мекунанд.', '/ˈʃɪft wɜːk/', 'noun', '🕗'),
    W('Colleague', 'Ҳамкор', 'My colleagues are very helpful.', 'Ҳамкорони ман хеле ёрирасонанд.', '/ˈkɒliːɡ/', 'noun', '👔'),
    W('Employer', 'Корфармо', 'A good employer listens to staff.', 'Корфармои хуб ба кормандон гӯш медиҳад.', '/ɪmˈplɔɪə/', 'noun', '🏢'),
    W('Apply', 'Ариза додан', 'I applied for three jobs.', 'Ман ба се ҷои корӣ ариза додам.', '/əˈplaɪ/', 'verb', '✍️'),
    W('Position', 'Вазифа (корӣ)', 'She holds a senior position.', 'Ӯ вазифаи баландро ишғол мекунад.', '/pəˈzɪʃn/', 'noun', '🪧'),
  ]},
  { mo: 2, title: 'Going Out and Events', titleTr: 'Баромадан ва чорабиниҳо', emoji: '🎫', words: [
    W('Venue', 'Ҷои чорабинӣ', 'The venue holds two thousand people.', 'Ҷои чорабинӣ ду ҳазор нафарро мегирад.', '/ˈvenjuː/', 'noun', '🏟'),
    W('Performance', 'Намоиш / иҷро', 'The evening performance starts at eight.', 'Намоиши бегоҳӣ соати ҳашт сар мешавад.', '/pəˈfɔːməns/', 'noun', '🎭'),
    W('Rehearsal', 'Машқи пешакӣ', 'The band had a long rehearsal.', 'Гурӯҳ машқи дарозе дошт.', '/rɪˈhɜːsl/', 'noun', '🎸'),
    W('Applause', 'Кафкӯбӣ', 'The applause lasted five minutes.', 'Кафкӯбӣ панҷ дақиқа давом кард.', '/əˈplɔːz/', 'noun', '👏'),
    W('Interval', 'Танаффус', 'We had a drink in the interval.', 'Мо дар танаффус нӯшокӣ хӯрдем.', '/ˈɪntəvl/', 'noun', '⏸'),
    W('Cast', 'Ҳайати ҳунармандон', 'The cast came on stage at the end.', 'Ҳайати ҳунармандон дар охир ба саҳна баромаданд.', '/kɑːst/', 'noun', '🎬'),
    W('Script', 'Сенария', 'The script was written by a young author.', 'Сенария аз ҷониби муаллифи ҷавон навишта шуд.', '/skrɪpt/', 'noun', '📜'),
    W('Sold out', 'Пурра фурӯхташуда', 'The concert was sold out in an hour.', 'Консерт дар як соат пурра фурӯхта шуд.', '/ˌsəʊld ˈaʊt/', 'adjective', '🚫'),
    W('Row', 'Қатор (ҷойҳо)', 'We sat in the front row.', 'Мо дар қатори пеш нишастем.', '/rəʊ/', 'noun', '💺'),
    W('Book in advance', 'Пешакӣ фармоиш додан', 'You should book in advance.', 'Шумо бояд пешакӣ фармоиш диҳед.', '/bʊk ɪn ədˈvɑːns/', 'verb', '📆'),
    W('Enjoyable', 'Лаззатбахш', 'It was a very enjoyable evening.', 'Ин шоми хеле лаззатбахш буд.', '/ɪnˈdʒɔɪəbl/', 'adjective', '😊'),
    W('Boring', 'Дилгиркунанда', 'The second half was boring.', 'Нимаи дуюм дилгиркунанда буд.', '/ˈbɔːrɪŋ/', 'adjective', '😐'),
    W('Impressive', 'Таъсирбахш', 'The lighting was impressive.', 'Равшанидиҳӣ таъсирбахш буд.', '/ɪmˈpresɪv/', 'adjective', '🤩'),
    W('Atmosphere', 'Фазо / муҳит', 'The atmosphere in the hall was great.', 'Фазои толор олӣ буд.', '/ˈætməsfɪə/', 'noun', '✨'),
    W('Celebrate', 'Ҷашн гирифтан', 'We celebrated her birthday at a café.', 'Мо зодрӯзи ӯро дар қаҳвахона ҷашн гирифтем.', '/ˈselɪbreɪt/', 'verb', '🎉'),
  ]},
  { mo: 3, title: 'Energy and Resources', titleTr: 'Энергия ва захираҳо', emoji: '⚡', words: [
    W('Coal', 'Ангишт', 'Coal was the main fuel a century ago.', 'Як аср пеш ангишт сӯзишвории асосӣ буд.', '/kəʊl/', 'noun', '🪨'),
    W('Oil', 'Нафт', 'Oil prices affect everything.', 'Нархи нафт ба ҳама чиз таъсир мекунад.', '/ɔɪl/', 'noun', '🛢'),
    W('Solar power', 'Энергияи офтобӣ', 'Solar power is cheap in sunny countries.', 'Энергияи офтобӣ дар кишварҳои офтобӣ арзон аст.', '/ˈsəʊlə paʊə/', 'noun', '☀️'),
    W('Wind power', 'Энергияи бодӣ', 'Wind power works well near the coast.', 'Энергияи бодӣ дар назди соҳил хуб кор мекунад.', '/ˈwɪnd paʊə/', 'noun', '🌬'),
    W('Nuclear', 'Ҳастаӣ', 'Nuclear energy produces no smoke.', 'Энергияи ҳастаӣ дуд намедиҳад.', '/ˈnjuːkliə/', 'adjective', '☢️'),
    W('Resource', 'Захира', 'Water is our most precious resource.', 'Об гаронбаҳотарин захираи мост.', '/rɪˈzɔːs/', 'noun', '💧'),
    W('Supply', 'Таъминот', 'The village has a clean water supply.', 'Деҳа таъминоти оби тоза дорад.', '/səˈplaɪ/', 'noun', '🚰'),
    W('Consume', 'Истеъмол кардан', 'Cities consume huge amounts of energy.', 'Шаҳрҳо миқдори азими энергия истеъмол мекунанд.', '/kənˈsjuːm/', 'verb', '🔌'),
    W('Generate', 'Тавлид кардан', 'The dam generates electricity.', 'Сарбанд барқ тавлид мекунад.', '/ˈdʒenəreɪt/', 'verb', '⚡'),
    W('Efficient', 'Босамар', 'LED bulbs are very efficient.', 'Лампаҳои LED хеле босамаранд.', '/ɪˈfɪʃnt/', 'adjective', '💡'),
    W('Shortage', 'Камбудӣ', 'There was a fuel shortage last winter.', 'Зимистони гузашта камбудии сӯзишворӣ буд.', '/ˈʃɔːtɪdʒ/', 'noun', '📉'),
    W('Alternative', 'Алтернативӣ', 'We need alternative sources of energy.', 'Ба мо манбаъҳои алтернативии энергия лозиманд.', '/ɔːlˈtɜːnətɪv/', 'adjective', '🔄'),
    W('Reduce', 'Кам кардан', 'Reduce your electricity use at night.', 'Шабона истифодаи барқро кам кунед.', '/rɪˈdjuːs/', 'verb', '⬇️'),
    W('Solar panel', 'Панели офтобӣ', 'They installed solar panels on the roof.', 'Онҳо дар бом панели офтобӣ насб карданд.', '/ˈsəʊlə ˈpænl/', 'noun', '🔆'),
    W('Power station', 'Нерӯгоҳ', 'The power station supplies the whole region.', 'Нерӯгоҳ тамоми минтақаро таъмин мекунад.', '/ˈpaʊə ˌsteɪʃn/', 'noun', '🏭'),
  ]},
  { mo: 4, title: 'At the Doctor', titleTr: 'Дар назди духтур', emoji: '🩺', words: [
    W('Symptom', 'Аломати беморӣ', 'Fever is a common symptom.', 'Таб аломати маъмулист.', '/ˈsɪmptəm/', 'noun', '🌡'),
    W('Diagnosis', 'Ташхис', 'The diagnosis took two days.', 'Ташхис ду рӯз тӯл кашид.', '/ˌdaɪəɡˈnəʊsɪs/', 'noun', '🔬'),
    W('Painkiller', 'Доруи дардшикан', 'Take a painkiller if it hurts.', 'Агар дард кунад, доруи дардшикан гиред.', '/ˈpeɪnkɪlə/', 'noun', '💊'),
    W('Injection', 'Сӯзандору', 'The nurse gave me an injection.', 'Ҳамшира ба ман сӯзандору кард.', '/ɪnˈdʒekʃn/', 'noun', '💉'),
    W('Operation', 'Ҷарроҳӣ', 'He had an operation on his knee.', 'Ба зонуи ӯ ҷарроҳӣ карданд.', '/ˌɒpəˈreɪʃn/', 'noun', '🏥'),
    W('Recover', 'Сиҳат шудан', 'She recovered after a week.', 'Ӯ баъди як ҳафта сиҳат шуд.', '/rɪˈkʌvə/', 'verb', '💚'),
    W('Infection', 'Сироят', 'The wound became infected.', 'Захм сироят кард.', '/ɪnˈfekʃn/', 'noun', '🦠'),
    W('Specialist', 'Мутахассис', 'The doctor sent me to a specialist.', 'Духтур маро ба мутахассис фиристод.', '/ˈspeʃəlɪst/', 'noun', '👨‍⚕️'),
    W('Emergency room', 'Шӯъбаи таъҷилӣ', 'We went straight to the emergency room.', 'Мо рост ба шӯъбаи таъҷилӣ рафтем.', '/ɪˈmɜːdʒənsi ruːm/', 'noun', '🚑'),
    W('Blood test', 'Таҳлили хун', 'The blood test showed nothing serious.', 'Таҳлили хун чизи ҷиддӣ нишон надод.', '/ˈblʌd test/', 'noun', '🩸'),
    W('Vaccine', 'Ваксина', 'The vaccine protects against flu.', 'Ваксина аз зуком муҳофизат мекунад.', '/ˈvæksiːn/', 'noun', '💉'),
    W('Dose', 'Миқдори дору', 'Do not take more than one dose.', 'Аз як миқдор зиёд нагиред.', '/dəʊs/', 'noun', '🥄'),
    W('Side effect', 'Таъсири иловагӣ', 'This medicine has few side effects.', 'Ин дору таъсири иловагии кам дорад.', '/ˈsaɪd ɪfekt/', 'noun', '⚠️'),
    W('Cure', 'Табобат кардан', 'There is still no cure for it.', 'То ҳол барои он табобат нест.', '/kjʊə/', 'noun', '🌿'),
    W('Chemist', 'Дорухона', 'Buy it at the chemist on the corner.', 'Онро аз дорухонаи гӯша харед.', '/ˈkemɪst/', 'noun', '🏪'),
  ]},
  { mo: 5, title: 'Computers and Files', titleTr: 'Компютер ва файлҳо', emoji: '💻', words: [
    W('File', 'Файл', 'Save the file before you close it.', 'Пеш аз пӯшидан файлро нигоҳ доред.', '/faɪl/', 'noun', '📄'),
    W('Spreadsheet', 'Ҷадвали электронӣ', 'She keeps the budget in a spreadsheet.', 'Ӯ буҷаро дар ҷадвали электронӣ нигоҳ медорад.', '/ˈspredʃiːt/', 'noun', '📊'),
    W('Keyboard', 'Клавиатура', 'My keyboard is not working.', 'Клавиатураи ман кор намекунад.', '/ˈkiːbɔːd/', 'noun', '⌨️'),
    W('Printer', 'Чопгар', 'The printer is out of paper.', 'Дар чопгар коғаз тамом шуд.', '/ˈprɪntə/', 'noun', '🖨'),
    W('Scan', 'Сканер кардан', 'Scan the document and send it.', 'Ҳуҷҷатро сканер кунед ва фиристед.', '/skæn/', 'verb', '📠'),
    W('Attachment', 'Замима', 'I forgot to add the attachment.', 'Ман замимаро илова кардан фаромӯш кардам.', '/əˈtætʃmənt/', 'noun', '📎'),
    W('Software', 'Нармафзор', 'The software needs an update.', 'Нармафзор ба навсозӣ ниёз дорад.', '/ˈsɒftweə/', 'noun', '💿'),
    W('Hardware', 'Сахтафзор', 'The hardware is five years old.', 'Сахтафзор панҷсола аст.', '/ˈhɑːdweə/', 'noun', '🖥'),
    W('Password protect', 'Бо рамз ҳифз кардан', 'Password protect the folder.', 'Ҷузвдонро бо рамз ҳифз кунед.', '/ˈpɑːswɜːd prəˈtekt/', 'verb', '🔐'),
    W('Shortcut', 'Миёнбур', 'This keyboard shortcut saves time.', 'Ин миёнбури клавиатура вақтро сарфа мекунад.', '/ˈʃɔːtkʌt/', 'noun', '⚡'),
    W('Rename', 'Номро иваз кардан', 'Rename the file before sending.', 'Пеш аз фиристодан номи файлро иваз кунед.', '/ˌriːˈneɪm/', 'verb', '✏️'),
    W('Restore', 'Барқарор кардан', 'You can restore deleted files.', 'Шумо файлҳои несткардаро барқарор карда метавонед.', '/rɪˈstɔː/', 'verb', '↩️'),
    W('Compatible', 'Мувофиқ', 'This app is not compatible with my phone.', 'Ин барнома ба телефони ман мувофиқ нест.', '/kəmˈpætəbl/', 'adjective', '🔗'),
    W('Cloud', 'Абр (нигоҳдорӣ)', 'Everything is saved in the cloud.', 'Ҳама чиз дар абр нигоҳ дошта мешавад.', '/klaʊd/', 'noun', '☁️'),
    W('Charge up', 'Заряд кардан', 'Charge up your laptop before the trip.', 'Пеш аз сафар ноутбукро заряд кунед.', '/tʃɑːdʒ ʌp/', 'verb', '🔋'),
  ]},
  { mo: 6, title: 'Banking and Payment', titleTr: 'Бонк ва пардохт', emoji: '🏦', words: [
    W('Transfer', 'Интиқол додан', 'I transferred the money yesterday.', 'Ман пулро дирӯз интиқол додам.', '/trænsˈfɜː/', 'verb', '🔁'),
    W('Withdraw', 'Пул гирифтан', 'You can withdraw cash at the machine.', 'Шумо аз дастгоҳ пул гирифта метавонед.', '/wɪðˈdrɔː/', 'verb', '🏧'),
    W('Statement', 'Ҳисоботи бонкӣ', 'Check your bank statement each month.', 'Ҳармоҳ ҳисоботи бонкии худро санҷед.', '/ˈsteɪtmənt/', 'noun', '📃'),
    W('Interest', 'Фоиз (бонкӣ)', 'The account pays two percent interest.', 'Ҳисоб ду фоиз медиҳад.', '/ˈɪntrəst/', 'noun', '📈'),
    W('Mortgage', 'Қарзи манзил', 'They took a mortgage for the house.', 'Онҳо барои хона қарзи манзил гирифтанд.', '/ˈmɔːɡɪdʒ/', 'noun', '🏠'),
    W('Transaction', 'Амалиёти пулӣ', 'Every transaction appears in the app.', 'Ҳар амалиёт дар барнома пайдо мешавад.', '/trænˈzækʃn/', 'noun', '💳'),
    W('Balance', 'Бақия (дар ҳисоб)', 'Check your balance before you pay.', 'Пеш аз пардохт бақияи худро санҷед.', '/ˈbæləns/', 'noun', '⚖️'),
    W('Overdraft', 'Аз ҳисоб зиёд гирифтан', 'Avoid using your overdraft.', 'Аз истифодаи овердрафт дурӣ ҷӯед.', '/ˈəʊvədrɑːft/', 'noun', '📉'),
    W('Exchange', 'Иваз кардан (асъор)', 'Where can I exchange money?', 'Дар куҷо пул иваз карда метавонам?', '/ɪksˈtʃeɪndʒ/', 'verb', '💱'),
    W('Cashless', 'Бе пули нақд', 'Many shops are now cashless.', 'Бисёр мағозаҳо ҳоло бе пули нақданд.', '/ˈkæʃləs/', 'adjective', '📱'),
    W('Signature', 'Имзо', 'Put your signature at the bottom.', 'Дар поён имзои худро гузоред.', '/ˈsɪɡnətʃə/', 'noun', '✍️'),
    W('Branch', 'Филиал', 'The nearest branch is closed today.', 'Филиали наздиктарин имрӯз пӯшида аст.', '/brɑːntʃ/', 'noun', '🏢'),
    W('Bill', 'Ҳисоб (пардохт)', 'I pay my bills online.', 'Ман ҳисобҳоямро онлайн мепардозам.', '/bɪl/', 'noun', '🧾'),
    W('Charge', 'Ҳақ ситондан', 'The bank charges a small fee.', 'Бонк ҳаққи хурд меситонад.', '/tʃɑːdʒ/', 'verb', '💵'),
    W('Secure', 'Бехатар', 'Make sure the website is secure.', 'Боварӣ ҳосил кунед, ки вебсайт бехатар аст.', '/sɪˈkjʊə/', 'adjective', '🔒'),
  ]},
  { mo: 7, title: 'Emotions and Reactions', titleTr: 'Ҳиссиёт ва вокуниш', emoji: '😮', words: [
    W('Delighted', 'Хеле шод', 'She was delighted with the news.', 'Ӯ аз хабар хеле шод шуд.', '/dɪˈlaɪtɪd/', 'adjective', '😍'),
    W('Annoyed', 'Дилгир / асабонӣ', 'I was annoyed by the noise.', 'Ман аз садо дилгир шудам.', '/əˈnɔɪd/', 'adjective', '😤'),
    W('Frustrated', 'Дилшикаста', 'He felt frustrated with the slow progress.', 'Ӯ аз пешрафти суст дилшикаста шуд.', '/frʌˈstreɪtɪd/', 'adjective', '😣'),
    W('Jealous', 'Ҳасадбар', 'Do not be jealous of others.', 'Ба дигарон ҳасад набаред.', '/ˈdʒeləs/', 'adjective', '💚'),
    W('Embarrassed', 'Шармсор', 'I felt embarrassed about my mistake.', 'Ман аз хатоям шармсор шудам.', '/ɪmˈbærəst/', 'adjective', '😳'),
    W('Relieved', 'Осуда', 'She was relieved to hear the result.', 'Ӯ баъди шунидани натиҷа осуда шуд.', '/rɪˈliːvd/', 'adjective', '😌'),
    W('Nervous', 'Асабонӣ / ҳаяҷонӣ', 'I always feel nervous before an exam.', 'Ман ҳамеша пеш аз имтиҳон ҳаяҷонӣ мешавам.', '/ˈnɜːvəs/', 'adjective', '😬'),
    W('Furious', 'Хеле хашмгин', 'My father was furious about the damage.', 'Падарам аз зарар хеле хашмгин шуд.', '/ˈfjʊəriəs/', 'adjective', '😡'),
    W('Satisfied', 'Қаноатманд', 'The customer was satisfied with the service.', 'Мизоҷ аз хизматрасонӣ қаноатманд буд.', '/ˈsætɪsfaɪd/', 'adjective', '🙂'),
    W('Upset', 'Ғамгин / хафа', 'She was upset after the argument.', 'Ӯ баъди ҷанҷол хафа шуд.', '/ʌpˈset/', 'adjective', '😢'),
    W('Excited', 'Шӯҳманд', 'The children were excited about the trip.', 'Кӯдакон аз сафар шӯҳманд буданд.', '/ɪkˈsaɪtɪd/', 'adjective', '🤩'),
    W('Guilty', 'Гунаҳкор', 'He felt guilty about forgetting her birthday.', 'Ӯ аз фаромӯш кардани зодрӯзаш худро гунаҳкор ҳис кард.', '/ˈɡɪlti/', 'adjective', '😔'),
    W('Amazed', 'Ҳайрон', 'We were amazed by the view.', 'Мо аз манзара ҳайрон шудем.', '/əˈmeɪzd/', 'adjective', '😲'),
    W('Sympathy', 'Ҳамдардӣ', 'She showed great sympathy.', 'Ӯ ҳамдардии бузург нишон дод.', '/ˈsɪmpəθi/', 'noun', '🤲'),
    W('Mood swing', 'Тағйири кайфият', 'Tiredness can cause mood swings.', 'Хастагӣ метавонад тағйири кайфият орад.', '/ˈmuːd swɪŋ/', 'noun', '🎭'),
  ]},
  { mo: 8, title: 'Restaurants and Service', titleTr: 'Тарабхона ва хизматрасонӣ', emoji: '🍽', words: [
    W('Waiter', 'Пешхизмат', 'The waiter brought the menu.', 'Пешхизмат менюро овард.', '/ˈweɪtə/', 'noun', '🤵'),
    W('Starter', 'Хӯроки аввал', 'I ordered soup as a starter.', 'Ман ҳамчун хӯроки аввал шӯрбо фармоиш додам.', '/ˈstɑːtə/', 'noun', '🥣'),
    W('Main course', 'Хӯроки асосӣ', 'The main course was excellent.', 'Хӯроки асосӣ олӣ буд.', '/ˈmeɪn kɔːs/', 'noun', '🍛'),
    W('Dessert', 'Ширинӣ', 'We had ice cream for dessert.', 'Мо барои ширинӣ яхмос хӯрдем.', '/dɪˈzɜːt/', 'noun', '🍨'),
    W('Side dish', 'Хӯроки иловагӣ', 'Salad comes as a side dish.', 'Салат ҳамчун хӯроки иловагӣ меояд.', '/ˈsaɪd dɪʃ/', 'noun', '🥗'),
    W('Service charge', 'Ҳаққи хизматрасонӣ', 'A service charge is included.', 'Ҳаққи хизматрасонӣ дохил аст.', '/ˈsɜːvɪs tʃɑːdʒ/', 'noun', '🧾'),
    W('Complaint', 'Шикоят', 'The manager listened to the complaint.', 'Мудир ба шикоят гӯш дод.', '/kəmˈpleɪnt/', 'noun', '📣'),
    W('Order', 'Фармоиш додан', 'Are you ready to order?', 'Барои фармоиш тайёред?', '/ˈɔːdə/', 'verb', '📝'),
    W('Book a table', 'Миз фармоиш додан', 'I booked a table for four.', 'Ман барои чор нафар миз фармоиш додам.', '/bʊk ə ˈteɪbl/', 'verb', '🪑'),
    W('Bill please', 'Ҳисобро лутфан', 'Could we have the bill, please?', 'Ҳисобро лутфан оварда метавонед?', '/bɪl pliːz/', 'phrase', '💳'),
    W('Portion size', 'Андозаи ҳисса', 'The portion size was generous.', 'Андозаи ҳисса калон буд.', '/ˈpɔːʃn saɪz/', 'noun', '🍽'),
    W('Overcooked', 'Аз ҳад пухта', 'The meat was overcooked.', 'Гӯшт аз ҳад пухта буд.', '/ˌəʊvəˈkʊkt/', 'adjective', '🔥'),
    W('Undercooked', 'Нимхом', 'The chicken was undercooked.', 'Гӯшти мурғ нимхом буд.', '/ˌʌndəˈkʊkt/', 'adjective', '🍗'),
    W('Delicious', 'Болаззат', 'Everything was absolutely delicious.', 'Ҳама чиз хеле болаззат буд.', '/dɪˈlɪʃəs/', 'adjective', '😋'),
    W('Recommendation', 'Тавсия', 'What is your recommendation?', 'Тавсияи шумо чист?', '/ˌrekəmenˈdeɪʃn/', 'noun', '👍'),
  ]},
  { mo: 9, title: 'Space and the Planet', titleTr: 'Кайҳон ва сайёра', emoji: '🪐', words: [
    W('Telescope', 'Телескоп', 'He looked at Mars through a telescope.', 'Ӯ ба Миррих аз телескоп нигоҳ кард.', '/ˈtelɪskəʊp/', 'noun', '🔭'),
    W('Planet', 'Сайёра', 'Jupiter is the largest planet.', 'Муштарӣ бузургтарин сайёра аст.', '/ˈplænɪt/', 'noun', '🪐'),
    W('Comet', 'Ситораи думдор', 'A comet passed close to Earth.', 'Ситораи думдор ба Замин наздик гузашт.', '/ˈkɒmɪt/', 'noun', '☄️'),
    W('Solar system', 'Системаи офтобӣ', 'Our solar system has eight planets.', 'Системаи офтобии мо ҳашт сайёра дорад.', '/ˈsəʊlə ˈsɪstəm/', 'noun', '🌞'),
    W('Atmosphere', 'Атмосфера', 'The atmosphere protects us from radiation.', 'Атмосфера моро аз шуоъ ҳифз мекунад.', '/ˈætməsfɪə/', 'noun', '🌫'),
    W('Launch', 'Партоб кардан', 'They launched the satellite in May.', 'Онҳо моҳворро дар май партоб карданд.', '/lɔːntʃ/', 'verb', '🚀'),
    W('Mission', 'Миссия', 'The mission lasted six months.', 'Миссия шаш моҳ давом кард.', '/ˈmɪʃn/', 'noun', '🛰'),
    W('Explore', 'Тадқиқ кардан', 'Robots explore the surface of Mars.', 'Роботҳо сатҳи Миррихро тадқиқ мекунанд.', '/ɪkˈsplɔː/', 'verb', '🔎'),
    W('Surface', 'Сатҳ', 'The surface of the moon is dusty.', 'Сатҳи Моҳ хокдор аст.', '/ˈsɜːfɪs/', 'noun', '🌕'),
    W('Distance', 'Масофа', 'The distance is measured in light years.', 'Масофа бо соли рӯшноӣ чен мешавад.', '/ˈdɪstəns/', 'noun', '📏'),
    W('Discover', 'Кашф кардан', 'They discovered a new planet.', 'Онҳо сайёраи навро кашф карданд.', '/dɪˈskʌvə/', 'verb', '💡'),
    W('Weightless', 'Бевазн', 'Astronauts are weightless in orbit.', 'Кайҳоннавардон дар мадор бевазнанд.', '/ˈweɪtləs/', 'adjective', '🧑‍🚀'),
    W('Signal', 'Сигнал', 'The signal took ten minutes to arrive.', 'Сигнал даҳ дақиқа роҳ рафт.', '/ˈsɪɡnəl/', 'noun', '📶'),
    W('Sample', 'Намуна', 'They brought back rock samples.', 'Онҳо намунаи сангро оварданд.', '/ˈsɑːmpl/', 'noun', '🪨'),
    W('Orbit', 'Мадор', 'The station orbits the Earth.', 'Истгоҳ дар мадори Замин ҳаракат мекунад.', '/ˈɔːbɪt/', 'noun', '🔄'),
  ]},
  { mo: 10, title: 'Law and Order', titleTr: 'Қонун ва тартибот', emoji: '⚖️', words: [
    W('Crime', 'Ҷиноят', 'Crime has fallen in this area.', 'Дар ин минтақа ҷиноят кам шудааст.', '/kraɪm/', 'noun', '🚨'),
    W('Criminal', 'Ҷинояткор', 'The criminal was arrested at night.', 'Ҷинояткор шабона дастгир шуд.', '/ˈkrɪmɪnl/', 'noun', '👮'),
    W('Court', 'Суд', 'The case went to court.', 'Парванда ба суд рафт.', '/kɔːt/', 'noun', '🏛'),
    W('Judge', 'Судя', 'The judge listened to both sides.', 'Судя ба ҳар ду тараф гӯш дод.', '/dʒʌdʒ/', 'noun', '👨‍⚖️'),
    W('Lawyer', 'Ҳуқуқшинос', 'She hired a good lawyer.', 'Ӯ ҳуқуқшиноси хуб гирифт.', '/ˈlɔɪə/', 'noun', '💼'),
    W('Witness', 'Шоҳид', 'A witness saw the whole thing.', 'Шоҳид ҳама чизро дид.', '/ˈwɪtnəs/', 'noun', '👁'),
    W('Guilty', 'Гунаҳкор (ҳуқуқӣ)', 'The court found him guilty.', 'Суд ӯро гунаҳкор донист.', '/ˈɡɪlti/', 'adjective', '⚖️'),
    W('Innocent', 'Бегуноҳ', 'Everyone is innocent until proven guilty.', 'Ҳар кас то исботи гуноҳ бегуноҳ аст.', '/ˈɪnəsnt/', 'adjective', '🕊'),
    W('Punishment', 'Ҷазо', 'The punishment seemed too harsh.', 'Ҷазо хеле сахт менамуд.', '/ˈpʌnɪʃmənt/', 'noun', '⛓'),
    W('Fine', 'Ҷарима', 'He paid a fine for speeding.', 'Ӯ барои суръати зиёд ҷарима дод.', '/faɪn/', 'noun', '💸'),
    W('Legal', 'Қонунӣ', 'It is legal to park here.', 'Дар ин ҷо таваққуф қонунӣ аст.', '/ˈliːɡl/', 'adjective', '✅'),
    W('Illegal', 'Ғайриқонунӣ', 'Downloading that film is illegal.', 'Боргирии он филм ғайриқонунӣ аст.', '/ɪˈliːɡl/', 'adjective', '🚫'),
    W('Investigate', 'Тафтиш кардан', 'Police are investigating the case.', 'Полис парвандаро тафтиш мекунад.', '/ɪnˈvestɪɡeɪt/', 'verb', '🔍'),
    W('Suspect', 'Гумонбар', 'The suspect was released.', 'Гумонбар озод карда шуд.', '/ˈsʌspekt/', 'noun', '🕵️'),
    W('Justice', 'Адолат', 'They demanded justice for the family.', 'Онҳо барои оила адолат талаб карданд.', '/ˈdʒʌstɪs/', 'noun', '⚖️'),
  ]},
  { mo: 11, title: 'Managing Your Time', titleTr: 'Идораи вақт', emoji: '⏱', words: [
    W('Prioritise', 'Аввалият додан', 'Prioritise the most urgent tasks.', 'Ба вазифаҳои таъҷилӣ аввалият диҳед.', '/praɪˈɒrətaɪz/', 'verb', '🥇'),
    W('Procrastinate', 'Кор ба таъхир андохтан', 'I always procrastinate before an exam.', 'Ман ҳамеша пеш аз имтиҳон корро ба таъхир меандозам.', '/prəʊˈkræstɪneɪt/', 'verb', '🐢'),
    W('Postpone', 'Ба баъд гузоштан', 'They postponed the meeting.', 'Онҳо ҷаласаро ба баъд гузоштанд.', '/pəˈspəʊn/', 'verb', '📆'),
    W('On time', 'Сари вақт', 'The train arrived on time.', 'Поезд сари вақт омад.', '/ɒn taɪm/', 'adverb', '⏰'),
    W('Multitask', 'Якчанд кор якҷоя', 'Trying to multitask slows you down.', 'Кӯшиши якчанд кор якҷоя шуморо суст мекунад.', '/ˌmʌltiˈtɑːsk/', 'verb', '🔀'),
    W('Urgent', 'Таъҷилӣ', 'This email is urgent.', 'Ин мактуб таъҷилист.', '/ˈɜːdʒənt/', 'adjective', '❗'),
    W('Schedule', 'Ҷадвал', 'My schedule is full this week.', 'Ин ҳафта ҷадвали ман пур аст.', '/ˈʃedjuːl/', 'noun', '🗓'),
    W('Estimate', 'Тахмин кардан', 'Estimate how long it will take.', 'Тахмин кунед, ки чӣ қадар вақт мегирад.', '/ˈestɪmeɪt/', 'verb', '📐'),
    W('Overload', 'Сарбории аз ҳад', 'Do not overload your day.', 'Рӯзи худро аз ҳад бор накунед.', '/ˌəʊvəˈləʊd/', 'verb', '📚'),
    W('Break', 'Танаффус', 'Take a short break every hour.', 'Ҳар соат танаффуси кӯтоҳ гиред.', '/breɪk/', 'noun', '☕'),
    W('Efficient use', 'Истифодаи босамар', 'This is an efficient use of time.', 'Ин истифодаи босамари вақт аст.', '/ɪˈfɪʃnt juːs/', 'noun', '⚡'),
    W('Set aside', 'Ҷудо кардан (вақт)', 'Set aside an hour for reading.', 'Барои хондан як соат ҷудо кунед.', '/set əˈsaɪd/', 'verb', '⏳'),
    W('Run out of', 'Тамом шудан', 'We ran out of time.', 'Вақти мо тамом шуд.', '/rʌn aʊt ɒv/', 'verb', '🏃'),
    W('Punctuality', 'Сари вақт будан', 'Punctuality matters in this company.', 'Дар ин ширкат сари вақт будан муҳим аст.', '/ˌpʌŋktʃuˈæləti/', 'noun', '⏱'),
    W('Workload', 'Ҳаҷми кор', 'His workload increased this month.', 'Ҳаҷми кори ӯ ин моҳ зиёд шуд.', '/ˈwɜːkləʊd/', 'noun', '📦'),
  ]},
];

const mods = (await api('/modules?courseId=' + B1)).modules.sort((a, b) => a.order - b.order);
const existing = new Set();
for (const m of mods) for (const l of (await api('/lessons?moduleId=' + m.id)).lessons) {
  if (!l._count.words) continue;
  for (const w of (await api('/words?lessonId=' + l.id)).words) existing.add(w.word.toLowerCase().trim());
}
console.log('калимаи мавҷуда:', existing.size);

let added = 0;
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
