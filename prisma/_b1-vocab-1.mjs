// B1 vocabulary, batch 1 (modules 1–6): two new vocab lessons per module.
//
// B1 taught 479 unique words, of which 56 already appeared at A1 or A2 — so
// only 423 were genuinely new, and the three levels together reached 1661.
// CEFR puts a B1 learner at roughly 2000–2500 words, so the level was the one
// place where this course fell short of the standard it otherwise meets.
//
// Each module keeps its four existing lessons of ten and gains two of twelve,
// chosen to extend the theme rather than repeat it: M1 already covers the
// airport, so the new pairs are documents/money and describing a journey.
// Every entry carries the same seven fields the rest of the course has
// (translation, example, example translation, IPA, part of speech, emoji), so
// nothing downgrades: the generated drills — cloze, build, dictate — all need
// the example sentence, and the word card needs the IPA.
//
// The script refuses to insert a word that already exists anywhere in B1.

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

// [word, tajik, example, exampleTrans, ipa, partOfSpeech, emoji]
const LESSONS = [
  { mo: 0, title: 'Travel Documents and Money', titleTr: 'Ҳуҷҷат ва пул дар сафар', emoji: '🛂', words: [
    ['Visa', 'Раводид', 'You need a visa to enter that country.', 'Барои воридшавӣ ба он кишвар раводид лозим аст.', '/ˈviːzə/', 'noun', '🛂'],
    ['Insurance', 'Суғурта', 'Travel insurance covers medical costs.', 'Суғуртаи сафар хароҷоти тиббиро мепӯшонад.', '/ɪnˈʃʊərəns/', 'noun', '📋'],
    ['Exchange rate', 'Қурби асъор', 'The exchange rate is good today.', 'Имрӯз қурби асъор хуб аст.', '/ɪksˈtʃeɪndʒ reɪt/', 'noun', '💱'],
    ['Border control', 'Назорати сарҳадӣ', 'We waited an hour at border control.', 'Мо дар назорати сарҳадӣ як соат интизор шудем.', '/ˈbɔːdə kənˈtrəʊl/', 'noun', '🛃'],
    ['Stamp', 'Мӯҳр', 'The officer put a stamp in my passport.', 'Корманд ба шиносномаи ман мӯҳр гузошт.', '/stæmp/', 'noun', '🔖'],
    ['Declare', 'Эълон кардан (дар гумрук)', 'Do you have anything to declare?', 'Чизе барои эълон доред?', '/dɪˈkleə/', 'verb', '📢'],
    ['Valid', 'Эътибордор', 'Your ticket is valid for one month.', 'Чиптаи шумо як моҳ эътибор дорад.', '/ˈvælɪd/', 'adjective', '✅'],
    ['Expire', 'Мӯҳлаташ тамом шудан', 'My passport expires next year.', 'Мӯҳлати шиносномаи ман соли оянда тамом мешавад.', '/ɪkˈspaɪə/', 'verb', '⌛'],
    ['Voucher', 'Ваучер', 'The airline gave us a meal voucher.', 'Ширкати ҳавоӣ ба мо ваучери хӯрок дод.', '/ˈvaʊtʃə/', 'noun', '🎟'],
    ['Proof', 'Далел / тасдиқ', 'Keep the receipt as proof of payment.', 'Расидро ҳамчун далели пардохт нигоҳ доред.', '/pruːf/', 'noun', '📄'],
    ['Compensation', 'Ҷуброн', 'Passengers can claim compensation for long delays.', 'Мусофирон барои таъхири дароз ҷуброн талаб карда метавонанд.', '/ˌkɒmpenˈseɪʃn/', 'noun', '💰'],
    ['Charge', 'Ҳақ гирифтан', 'They charge extra for heavy luggage.', 'Барои бори вазнин ҳақи иловагӣ мегиранд.', '/tʃɑːdʒ/', 'verb', '💳'],
  ]},
  { mo: 0, title: 'Describing a Journey', titleTr: 'Тасвири сафар', emoji: '🧭', words: [
    ['Departure lounge', 'Толори интизорӣ', 'We waited in the departure lounge.', 'Мо дар толори интизорӣ мунтазир шудем.', '/dɪˈpɑːtʃə laʊndʒ/', 'noun', '🪑'],
    ['Aisle', 'Гузаргоҳ', 'I prefer an aisle seat.', 'Ман ҷои назди гузаргоҳро бартар медонам.', '/aɪl/', 'noun', '🚶'],
    ['Window seat', 'Ҷои назди тиреза', 'She booked a window seat.', 'Ӯ ҷои назди тирезаро фармоиш дод.', '/ˈwɪndəʊ siːt/', 'noun', '🪟'],
    ['Landing', 'Фуруд', 'The landing was very smooth.', 'Фуруд хеле ором буд.', '/ˈlændɪŋ/', 'noun', '🛬'],
    ['Take-off', 'Парвоз (аз замин)', 'Take-off was delayed by fog.', 'Парвоз аз сабаби туман ба таъхир афтод.', '/ˈteɪk ɒf/', 'noun', '🛫'],
    ['Turbulence', 'Ларзиш дар ҳаво', 'There was some turbulence over the mountains.', 'Дар болои кӯҳҳо каме ларзиш буд.', '/ˈtɜːbjələns/', 'noun', '🌀'],
    ['Crowded', 'Сераҳолӣ / пур', 'The train was crowded this morning.', 'Имрӯз саҳар поезд пур буд.', '/ˈkraʊdɪd/', 'adjective', '👥'],
    ['Smooth', 'Ҳамвор / ором', 'We had a smooth journey.', 'Сафари мо ором гузашт.', '/smuːð/', 'adjective', '🛣'],
    ['Exhausting', 'Хастакунанда', 'It was an exhausting trip.', 'Ин сафари хастакунанда буд.', '/ɪɡˈzɔːstɪŋ/', 'adjective', '😩'],
    ['Scenic', 'Манзарадор', 'We took the scenic route.', 'Мо роҳи манзарадорро интихоб кардем.', '/ˈsiːnɪk/', 'adjective', '🏞'],
    ['Detour', 'Роҳи каҷ', 'We made a detour to see the lake.', 'Мо барои дидани кӯл роҳи каҷ рафтем.', '/ˈdiːtʊə/', 'noun', '↩️'],
    ['Stopover', 'Таваққуф дар роҳ', 'We had a stopover in Dubai.', 'Мо дар Дубай таваққуф доштем.', '/ˈstɒpəʊvə/', 'noun', '⏸'],
  ]},

  { mo: 1, title: 'Studying and Exams', titleTr: 'Таҳсил ва имтиҳон', emoji: '📚', words: [
    ['Revise', 'Такрор кардан', 'I need to revise for the exam.', 'Ман бояд барои имтиҳон такрор кунам.', '/rɪˈvaɪz/', 'verb', '📖'],
    ['Coursework', 'Кори курсӣ', 'We submit our coursework in May.', 'Мо кори курсиро дар май месупорем.', '/ˈkɔːswɜːk/', 'noun', '📝'],
    ['Essay', 'Иншо', 'She wrote a long essay on history.', 'Ӯ дар бораи таърих иншои дароз навишт.', '/ˈeseɪ/', 'noun', '✍️'],
    ['Lecture', 'Маърӯза', 'The lecture starts at nine.', 'Маърӯза соати нӯҳ сар мешавад.', '/ˈlektʃə/', 'noun', '🎓'],
    ['Seminar', 'Семинар', 'We discussed the topic in a seminar.', 'Мо мавзӯъро дар семинар муҳокима кардем.', '/ˈsemɪnɑː/', 'noun', '💬'],
    ['Term', 'Семестр', 'The new term begins in September.', 'Семестри нав дар сентябр сар мешавад.', '/tɜːm/', 'noun', '📅'],
    ['Scholarship', 'Стипендия', 'He won a scholarship to study abroad.', 'Ӯ барои таҳсил дар хориҷа стипендия гирифт.', '/ˈskɒləʃɪp/', 'noun', '🏅'],
    ['Grade', 'Баҳо', 'She got the highest grade in the class.', 'Ӯ дар синф баландтарин баҳоро гирифт.', '/ɡreɪd/', 'noun', '💯'],
    ['Attend', 'Иштирок кардан', 'You must attend every lesson.', 'Шумо бояд дар ҳар дарс иштирок кунед.', '/əˈtend/', 'verb', '🙋'],
    ['Fail', 'Нагузаштан', 'He failed the driving test twice.', 'Ӯ ду бор аз имтиҳони ронандагӣ нагузашт.', '/feɪl/', 'verb', '❌'],
    ['Pass', 'Гузаштан', 'I passed all my exams.', 'Ман аз ҳамаи имтиҳонҳо гузаштам.', '/pɑːs/', 'verb', '✔️'],
    ['Certificate', 'Шаҳодатнома', 'You receive a certificate at the end.', 'Дар охир шаҳодатнома мегиред.', '/səˈtɪfɪkət/', 'noun', '📜'],
  ]},
  { mo: 1, title: 'Skills and Qualities', titleTr: 'Малака ва сифатҳо', emoji: '⭐', words: [
    ['Reliable', 'Боэътимод', 'She is a reliable worker.', 'Ӯ корманди боэътимод аст.', '/rɪˈlaɪəbl/', 'adjective', '🤝'],
    ['Punctual', 'Сари вақт', 'He is always punctual.', 'Ӯ ҳамеша сари вақт меояд.', '/ˈpʌŋktʃuəl/', 'adjective', '⏰'],
    ['Organised', 'Муташаккил', 'A good manager must be organised.', 'Мудири хуб бояд муташаккил бошад.', '/ˈɔːɡənaɪzd/', 'adjective', '🗂'],
    ['Flexible', 'Мутобиқшаванда', 'You need to be flexible in this job.', 'Дар ин кор бояд мутобиқшаванда бошед.', '/ˈfleksəbl/', 'adjective', '🤸'],
    ['Creative', 'Эҷодкор', 'They want creative people.', 'Онҳо одамони эҷодкор мехоҳанд.', '/kriˈeɪtɪv/', 'adjective', '🎨'],
    ['Efficient', 'Босамар', 'This is a more efficient method.', 'Ин усули босамартар аст.', '/ɪˈfɪʃnt/', 'adjective', '⚡'],
    ['Ambitious', 'Ҳадафманд', 'He is a very ambitious young man.', 'Ӯ ҷавони хеле ҳадафманд аст.', '/æmˈbɪʃəs/', 'adjective', '🚀'],
    ['Patient', 'Босабр', 'Teachers have to be patient.', 'Муаллимон бояд босабр бошанд.', '/ˈpeɪʃnt/', 'adjective', '🧘'],
    ['Teamwork', 'Кори дастҷамъӣ', 'Teamwork is essential in this company.', 'Дар ин ширкат кори дастҷамъӣ зарур аст.', '/ˈtiːmwɜːk/', 'noun', '👥'],
    ['Leadership', 'Роҳбарӣ', 'She has strong leadership skills.', 'Ӯ малакаи қавии роҳбарӣ дорад.', '/ˈliːdəʃɪp/', 'noun', '🧭'],
    ['Confident', 'Боэътимод ба худ', 'Try to sound confident in the interview.', 'Дар мусоҳиба кӯшиш кунед боэътимод бошед.', '/ˈkɒnfɪdənt/', 'adjective', '😎'],
    ['Motivated', 'Ҳавасманд', 'We are looking for motivated staff.', 'Мо кормандони ҳавасманд меҷӯем.', '/ˈməʊtɪveɪtɪd/', 'adjective', '🔥'],
  ]},

  { mo: 2, title: 'Books and Reading', titleTr: 'Китоб ва хониш', emoji: '📕', words: [
    ['Novel', 'Роман', 'I am reading an interesting novel.', 'Ман романи ҷолиб мехонам.', '/ˈnɒvl/', 'noun', '📕'],
    ['Author', 'Муаллиф', 'Who is the author of this book?', 'Муаллифи ин китоб кист?', '/ˈɔːθə/', 'noun', '✍️'],
    ['Chapter', 'Боб', 'The first chapter is very long.', 'Боби якум хеле дароз аст.', '/ˈtʃæptə/', 'noun', '📑'],
    ['Plot', 'Сюжет', 'The plot of the film was confusing.', 'Сюжети филм печида буд.', '/plɒt/', 'noun', '🧩'],
    ['Fiction', 'Адабиёти бадеӣ', 'She only reads fiction.', 'Ӯ танҳо адабиёти бадеӣ мехонад.', '/ˈfɪkʃn/', 'noun', '📚'],
    ['Publish', 'Нашр кардан', 'The book was published last year.', 'Китоб соли гузашта нашр шуд.', '/ˈpʌblɪʃ/', 'verb', '🖨'],
    ['Bestseller', 'Китоби серхаридор', 'It became a bestseller in a month.', 'Он дар як моҳ серхаридор шуд.', '/ˌbestˈselə/', 'noun', '🏆'],
    ['Translate', 'Тарҷума кардан', 'The novel was translated into ten languages.', 'Роман ба даҳ забон тарҷума шуд.', '/trænzˈleɪt/', 'verb', '🌐'],
    ['Poetry', 'Шеър', 'He writes poetry in his free time.', 'Ӯ дар вақти холӣ шеър менависад.', '/ˈpəʊətri/', 'noun', '🖋'],
    ['Biography', 'Тарҷумаи ҳол', 'I enjoy reading biographies.', 'Ман хондани тарҷумаи ҳолро дӯст медорам.', '/baɪˈɒɡrəfi/', 'noun', '👤'],
    ['Summary', 'Хулоса', 'Write a short summary of the story.', 'Хулосаи кӯтоҳи ҳикояро нависед.', '/ˈsʌməri/', 'noun', '📋'],
    ['Recommend', 'Тавсия додан', 'I recommend this book to everyone.', 'Ман ин китобро ба ҳама тавсия медиҳам.', '/ˌrekəˈmend/', 'verb', '👍'],
  ]},
  { mo: 2, title: 'Talking about Media', titleTr: 'Сухан дар бораи расона', emoji: '📡', words: [
    ['Broadcast', 'Пахш кардан', 'The match was broadcast live.', 'Бозӣ бевосита пахш шуд.', '/ˈbrɔːdkɑːst/', 'verb', '📡'],
    ['Episode', 'Қисм / серия', 'The last episode was the best.', 'Қисми охирин беҳтарин буд.', '/ˈepɪsəʊd/', 'noun', '🎬'],
    ['Subtitle', 'Зернавис', 'I watch films with subtitles.', 'Ман филмҳоро бо зернавис тамошо мекунам.', '/ˈsʌbtaɪtl/', 'noun', '💬'],
    ['Documentary', 'Филми ҳуҷҷатӣ', 'We watched a documentary about the ocean.', 'Мо филми ҳуҷҷатӣ дар бораи уқёнус дидем.', '/ˌdɒkjuˈmentri/', 'noun', '🎥'],
    ['Presenter', 'Пешбаранда', 'The presenter asked good questions.', 'Пешбаранда саволҳои хуб дод.', '/prɪˈzentə/', 'noun', '🎤'],
    ['Viewer', 'Тамошобин', 'Millions of viewers watched the final.', 'Миллионҳо тамошобин финалро диданд.', '/ˈvjuːə/', 'noun', '👀'],
    ['Censorship', 'Сензура', 'Censorship limits what people can read.', 'Сензура он чиро ки одамон хонда метавонанд маҳдуд мекунад.', '/ˈsensəʃɪp/', 'noun', '🚫'],
    ['Bias', 'Ҷонибдорӣ', 'The report showed clear bias.', 'Ҳисобот ҷонибдории равшан нишон дод.', '/ˈbaɪəs/', 'noun', '⚖️'],
    ['Source', 'Манбаъ', 'Always check the source of the news.', 'Ҳамеша манбаи хабарро санҷед.', '/sɔːs/', 'noun', '🔍'],
    ['Coverage', 'Инъикос', 'The event got wide coverage.', 'Чорабинӣ инъикоси васеъ гирифт.', '/ˈkʌvərɪdʒ/', 'noun', '📰'],
    ['Influence', 'Таъсир', 'Media has a strong influence on opinion.', 'Расона ба афкор таъсири қавӣ дорад.', '/ˈɪnfluəns/', 'noun', '💫'],
    ['Entertaining', 'Шавқовар', 'The show was very entertaining.', 'Намоиш хеле шавқовар буд.', '/ˌentəˈteɪnɪŋ/', 'adjective', '🎭'],
  ]},

  { mo: 3, title: 'Weather and Climate', titleTr: 'Обу ҳаво ва иқлим', emoji: '🌦', words: [
    ['Forecast', 'Пешгӯӣ', 'The forecast says it will rain.', 'Пешгӯӣ мегӯяд, ки борон меборад.', '/ˈfɔːkɑːst/', 'noun', '📊'],
    ['Humid', 'Намнок', 'The air is very humid today.', 'Имрӯз ҳаво хеле намнок аст.', '/ˈhjuːmɪd/', 'adjective', '💧'],
    ['Drought', 'Хушксолӣ', 'The drought destroyed the crops.', 'Хушксолӣ ҳосилро нобуд кард.', '/draʊt/', 'noun', '🏜'],
    ['Heatwave', 'Мавҷи гармӣ', 'A heatwave hit the country in July.', 'Дар июл мавҷи гармӣ ба кишвар омад.', '/ˈhiːtweɪv/', 'noun', '🔥'],
    ['Storm', 'Тӯфон', 'A storm damaged several houses.', 'Тӯфон ба чанд хона зарар расонд.', '/stɔːm/', 'noun', '⛈'],
    ['Freeze', 'Ях бастан', 'The lake freezes every winter.', 'Кӯл ҳар зимистон ях мебандад.', '/friːz/', 'verb', '🧊'],
    ['Melt', 'Об шудан', 'The ice is melting faster than before.', 'Ях назар ба пештар тезтар об мешавад.', '/melt/', 'verb', '💦'],
    ['Greenhouse gas', 'Гази гулхонаӣ', 'Greenhouse gases trap heat.', 'Газҳои гулхонаӣ гармиро нигоҳ медоранд.', '/ˈɡriːnhaʊs ɡæs/', 'noun', '🏭'],
    ['Emission', 'Партови газ', 'We must reduce carbon emissions.', 'Мо бояд партови карбонро кам кунем.', '/ɪˈmɪʃn/', 'noun', '💨'],
    ['Renewable', 'Барқароршаванда', 'Solar power is renewable.', 'Энергияи офтобӣ барқароршаванда аст.', '/rɪˈnjuːəbl/', 'adjective', '♻️'],
    ['Sustainable', 'Устувор', 'We need a sustainable way of living.', 'Ба мо тарзи зиндагии устувор лозим аст.', '/səˈsteɪnəbl/', 'adjective', '🌱'],
    ['Conservation', 'Ҳифзи табиат', 'Conservation protects rare species.', 'Ҳифзи табиат навъҳои нодирро муҳофизат мекунад.', '/ˌkɒnsəˈveɪʃn/', 'noun', '🌳'],
  ]},
  { mo: 3, title: 'Protecting Nature', titleTr: 'Ҳифзи табиат', emoji: '🌍', words: [
    ['Habitat', 'Зист / макон', 'The forest is a habitat for many birds.', 'Ҷангал макони бисёр паррандагон аст.', '/ˈhæbɪtæt/', 'noun', '🏕'],
    ['Species', 'Навъ', 'This species is endangered.', 'Ин навъ дар хатар аст.', '/ˈspiːʃiːz/', 'noun', '🦋'],
    ['Extinct', 'Нобудшуда', 'Many animals have become extinct.', 'Бисёр ҳайвонот нобуд шудаанд.', '/ɪkˈstɪŋkt/', 'adjective', '🦕'],
    ['Wildlife', 'Ҳайвоноти ваҳшӣ', 'Wildlife needs our protection.', 'Ҳайвоноти ваҳшӣ ба ҳифзи мо ниёз доранд.', '/ˈwaɪldlaɪf/', 'noun', '🦌'],
    ['Litter', 'Партов', 'Do not drop litter in the park.', 'Дар боғ партов напартоед.', '/ˈlɪtə/', 'noun', '🗑'],
    ['Landfill', 'Партовгоҳ', 'Most rubbish ends up in a landfill.', 'Аксари партов ба партовгоҳ меравад.', '/ˈlændfɪl/', 'noun', '🚮'],
    ['Waste', 'Исроф кардан', 'We waste too much water.', 'Мо аз ҳад зиёд об исроф мекунем.', '/weɪst/', 'verb', '🚰'],
    ['Reserve', 'Мамнӯъгоҳ', 'The area became a nature reserve.', 'Ин минтақа мамнӯъгоҳи табиӣ шуд.', '/rɪˈzɜːv/', 'noun', '🏞'],
    ['Preserve', 'Ҳифз кардан', 'We must preserve the forest.', 'Мо бояд ҷангалро ҳифз кунем.', '/prɪˈzɜːv/', 'verb', '🛡'],
    ['Damage', 'Зарар расондан', 'Pollution damages the soil.', 'Ифлосшавӣ ба хок зарар мерасонад.', '/ˈdæmɪdʒ/', 'verb', '⚠️'],
    ['Threat', 'Таҳдид', 'Climate change is a serious threat.', 'Тағйири иқлим таҳдиди ҷиддист.', '/θret/', 'noun', '❗'],
    ['Restore', 'Барқарор кардан', 'They are restoring the wetlands.', 'Онҳо ботлоқзорро барқарор мекунанд.', '/rɪˈstɔː/', 'verb', '🔄'],
  ]},

  { mo: 4, title: 'The Body and Fitness', titleTr: 'Бадан ва тандурустӣ', emoji: '🏃', words: [
    ['Joint', 'Буғум', 'My joints hurt in cold weather.', 'Дар ҳавои хунук буғумҳоям дард мекунанд.', '/dʒɔɪnt/', 'noun', '🦴'],
    ['Bone', 'Устухон', 'He broke a bone in his arm.', 'Ӯ дар дасташ устухон шикаст.', '/bəʊn/', 'noun', '🦴'],
    ['Breathe', 'Нафас кашидан', 'Breathe deeply and relax.', 'Чуқур нафас кашед ва ором шавед.', '/briːð/', 'verb', '😮‍💨'],
    ['Heartbeat', 'Задани дил', 'Exercise raises your heartbeat.', 'Машқ задани дилро тезтар мекунад.', '/ˈhɑːtbiːt/', 'noun', '💓'],
    ['Stretch', 'Дароз кардан', 'Stretch your legs before you run.', 'Пеш аз давидан пойҳоятонро дароз кунед.', '/stretʃ/', 'verb', '🤸'],
    ['Workout', 'Машқи варзишӣ', 'I do a workout three times a week.', 'Ман ҳафтае се бор машқ мекунам.', '/ˈwɜːkaʊt/', 'noun', '🏋️'],
    ['Endurance', 'Тобоварӣ', 'Running builds endurance.', 'Давидан тобовариро зиёд мекунад.', '/ɪnˈdjʊərəns/', 'noun', '⏱'],
    ['Flexibility', 'Нармии бадан', 'Yoga improves flexibility.', 'Йога нармии баданро беҳтар мекунад.', '/ˌfleksəˈbɪləti/', 'noun', '🧘'],
    ['Posture', 'Ҳолати бадан', 'Sitting all day ruins your posture.', 'Тамоми рӯз нишастан ҳолати баданро вайрон мекунад.', '/ˈpɒstʃə/', 'noun', '🧍'],
    ['Warm up', 'Гарм кардан', 'Always warm up before exercise.', 'Пеш аз машқ ҳамеша баданро гарм кунед.', '/wɔːm ʌp/', 'verb', '🔥'],
    ['Stamina', 'Тавоноӣ', 'Swimming increases stamina.', 'Шиноварӣ тавоноиро зиёд мекунад.', '/ˈstæmɪnə/', 'noun', '💪'],
    ['Balance', 'Мувозинат', 'Good balance prevents falls.', 'Мувозинати хуб аз афтидан нигоҳ медорад.', '/ˈbæləns/', 'noun', '⚖️'],
  ]},
  { mo: 4, title: 'Mental Health', titleTr: 'Саломатии равонӣ', emoji: '🧠', words: [
    ['Mood', 'Кайфият', 'Exercise improves your mood.', 'Машқ кайфиятро беҳтар мекунад.', '/muːd/', 'noun', '🙂'],
    ['Calm', 'Ором', 'Deep breathing keeps you calm.', 'Нафаси чуқур шуморо ором нигоҳ медорад.', '/kɑːm/', 'adjective', '😌'],
    ['Overwhelmed', 'Зери фишор', 'She felt overwhelmed by work.', 'Ӯ аз кор худро зери фишор ҳис кард.', '/ˌəʊvəˈwelmd/', 'adjective', '😰'],
    ['Burnout', 'Хастагии шадид', 'Long hours can lead to burnout.', 'Соатҳои дароз ба хастагии шадид оварда мерасонад.', '/ˈbɜːnaʊt/', 'noun', '🕯'],
    ['Cope', 'Тоб овардан', 'He cannot cope with the pressure.', 'Ӯ ба фишор тоб оварда наметавонад.', '/kəʊp/', 'verb', '🛟'],
    ['Support', 'Дастгирӣ', 'Family support makes a big difference.', 'Дастгирии оила фарқи калон мекунад.', '/səˈpɔːt/', 'noun', '🤗'],
    ['Counsellor', 'Мушовир', 'Talking to a counsellor helped her.', 'Сӯҳбат бо мушовир ба ӯ кӯмак кард.', '/ˈkaʊnsələ/', 'noun', '🗣'],
    ['Mindfulness', 'Огоҳии зеҳнӣ', 'Mindfulness reduces stress.', 'Огоҳии зеҳнӣ стрессро кам мекунад.', '/ˈmaɪndflnəs/', 'noun', '🧘‍♀️'],
    ['Relaxation', 'Оромӣ', 'Music is a form of relaxation.', 'Мусиқӣ як навъи оромӣ аст.', '/ˌriːlækˈseɪʃn/', 'noun', '🎵'],
    ['Confidence', 'Эътимод ба худ', 'Small successes build confidence.', 'Муваффақиятҳои хурд эътимод ба худро месозанд.', '/ˈkɒnfɪdəns/', 'noun', '✨'],
    ['Loneliness', 'Танҳоӣ', 'Loneliness can affect your health.', 'Танҳоӣ метавонад ба саломатӣ таъсир кунад.', '/ˈləʊnlinəs/', 'noun', '🌙'],
    ['Self-esteem', 'Худбоварӣ', 'Praise improves a child\'s self-esteem.', 'Таҳсин худбоварии кӯдакро беҳтар мекунад.', '/ˌself ɪˈstiːm/', 'noun', '🪞'],
  ]},

  { mo: 5, title: 'Using Devices', titleTr: 'Истифодаи дастгоҳҳо', emoji: '📲', words: [
    ['Charger', 'Заряддиҳанда', 'I forgot my phone charger at home.', 'Ман заряддиҳандаи телефонро дар хона фаромӯш кардам.', '/ˈtʃɑːdʒə/', 'noun', '🔌'],
    ['Touchscreen', 'Экрани ламсӣ', 'The touchscreen stopped working.', 'Экрани ламсӣ аз кор монд.', '/ˈtʌtʃskriːn/', 'noun', '📱'],
    ['Update', 'Навсозӣ', 'Install the latest update.', 'Навсозии охиринро насб кунед.', '/ˈʌpdeɪt/', 'noun', '🔄'],
    ['Install', 'Насб кардан', 'Install the app from the store.', 'Барномаро аз мағоза насб кунед.', '/ɪnˈstɔːl/', 'verb', '⬇️'],
    ['Delete', 'Нест кардан', 'Delete the old files.', 'Файлҳои кӯҳнаро нест кунед.', '/dɪˈliːt/', 'verb', '🗑'],
    ['Backup', 'Нусхаи эҳтиётӣ', 'Make a backup of your photos.', 'Аз аксҳоятон нусхаи эҳтиётӣ созед.', '/ˈbækʌp/', 'noun', '💾'],
    ['Crash', 'Аз кор мондан', 'My laptop crashed this morning.', 'Ноутбуки ман имрӯз саҳар аз кор монд.', '/kræʃ/', 'verb', '💥'],
    ['Battery life', 'Умри батарея', 'This phone has good battery life.', 'Ин телефон умри батареяи хуб дорад.', '/ˈbætri laɪf/', 'noun', '🔋'],
    ['Settings', 'Танзимот', 'You can change it in the settings.', 'Инро дар танзимот иваз карда метавонед.', '/ˈsetɪŋz/', 'noun', '⚙️'],
    ['Folder', 'Ҷузвдон', 'Save the file in this folder.', 'Файлро дар ин ҷузвдон нигоҳ доред.', '/ˈfəʊldə/', 'noun', '📁'],
    ['Upload', 'Боргузорӣ кардан', 'Upload the photo to the site.', 'Аксро ба сайт боргузорӣ кунед.', '/ˌʌpˈləʊd/', 'verb', '⬆️'],
    ['Download', 'Боргирӣ кардан', 'Download the file first.', 'Аввал файлро боргирӣ кунед.', '/ˌdaʊnˈləʊd/', 'verb', '⬇️'],
  ]},
  { mo: 5, title: 'Online Life', titleTr: 'Ҳаёти онлайн', emoji: '🌐', words: [
    ['Privacy', 'Махфият', 'Protect your privacy online.', 'Махфияти худро дар интернет ҳифз кунед.', '/ˈprɪvəsi/', 'noun', '🔒'],
    ['Scam', 'Фиреб', 'That email was a scam.', 'Он мактуб фиреб буд.', '/skæm/', 'noun', '🎣'],
    ['Virus', 'Вирус', 'A virus damaged my computer.', 'Вирус ба компютери ман зарар расонд.', '/ˈvaɪrəs/', 'noun', '🦠'],
    ['Firewall', 'Девори муҳофизатӣ', 'A firewall blocks attacks.', 'Девори муҳофизатӣ ҳамларо бозмедорад.', '/ˈfaɪəwɔːl/', 'noun', '🧱'],
    ['Username', 'Номи корбар', 'Choose a username you will remember.', 'Номи корбареро интихоб кунед, ки дар ёд доред.', '/ˈjuːzəneɪm/', 'noun', '🆔'],
    ['Log in', 'Ворид шудан', 'Log in with your email address.', 'Бо почтаи электронии худ ворид шавед.', '/lɒɡ ɪn/', 'verb', '🔑'],
    ['Log out', 'Баромадан', 'Always log out on a shared computer.', 'Дар компютери умумӣ ҳамеша бароед.', '/lɒɡ aʊt/', 'verb', '🚪'],
    ['Search engine', 'Мошини ҷустуҷӯ', 'Use a search engine to find it.', 'Барои ёфтани он мошини ҷустуҷӯро истифода баред.', '/sɜːtʃ ˈendʒɪn/', 'noun', '🔎'],
    ['Streaming', 'Пахши мустақим', 'Streaming uses a lot of data.', 'Пахши мустақим маълумоти зиёд сарф мекунад.', '/ˈstriːmɪŋ/', 'noun', '📺'],
    ['Subscribe', 'Обуна шудан', 'Subscribe to the channel for updates.', 'Барои навигариҳо ба шабака обуна шавед.', '/səbˈskraɪb/', 'verb', '🔔'],
    ['Trending', 'Дар авҷ', 'This topic is trending today.', 'Ин мавзӯъ имрӯз дар авҷ аст.', '/ˈtrendɪŋ/', 'adjective', '📈'],
    ['Misleading', 'Гумроҳкунанда', 'The headline was misleading.', 'Сарлавҳа гумроҳкунанда буд.', '/ˌmɪsˈliːdɪŋ/', 'adjective', '🚧'],
  ]},
];

// ── existing B1 words, so nothing is inserted twice ──
const mods = (await api('/modules?courseId=' + B1)).modules.sort((a, b) => a.order - b.order);
const existing = new Set();
for (const m of mods) {
  for (const l of (await api('/lessons?moduleId=' + m.id)).lessons) {
    if (!l._count.words) continue;
    for (const w of (await api('/words?lessonId=' + l.id)).words) existing.add(w.word.toLowerCase().trim());
  }
}
console.log('калимаи мавҷудаи B1:', existing.size);

let added = 0, skipped = [];
for (const spec of LESSONS) {
  const mod = mods[spec.mo];
  const lessons = (await api('/lessons?moduleId=' + mod.id)).lessons.sort((a, b) => a.order - b.order);
  if (lessons.some(l => l.title.includes(spec.title))) { console.log(`M${spec.mo + 1} "${spec.title}": аллакай ҳаст`); continue; }

  const fresh = spec.words.filter(w => {
    if (existing.has(w[0].toLowerCase().trim())) { skipped.push(`M${spec.mo + 1}:${w[0]}`); return false; }
    existing.add(w[0].toLowerCase().trim());
    return true;
  });

  // insert straight after the last vocab lesson
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
  await api('/words/bulk', 'POST', {
    lessonId: created.lesson.id, mode: 'replace',
    words: fresh.map(([word, translation, example, exampleTrans, ipa, partOfSpeech, emoji]) =>
      ({ word, translation, example, exampleTrans, ipa, partOfSpeech, emoji })),
  });
  added += fresh.length;
  console.log(`  ✓ M${spec.mo + 1} "${spec.title}" — ${fresh.length} калима (дарси ${at})`);
}

console.log(`\n✅ ${added} калимаи нав илова шуд.`);
if (skipped.length) console.log(`такрорӣ буданд, партофта шуд (${skipped.length}): ${skipped.join(', ')}`);
