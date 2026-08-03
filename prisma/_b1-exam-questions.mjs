// B1 final exams, modules 1–4: replace the five passage questions.
//
// The exams already carry a real B1 passage, but every question after it asked
// the learner to find a sentence and copy it back ("What happens to the phone
// in the example?"). At B1 an exam is supposed to check whether the reader
// understood — the writer's purpose, what a detail is doing there, what a word
// means in context — not whether they can scan. The reading and listening
// lessons already work this way (64% / 57% higher-order); the exam did not (2%).
//
// Each set is now: 1 gist + 2 inference + 1 vocabulary-in-context + 1 detail.
// One literal detail question is kept on purpose — locating a fact is a real
// reading skill and a B1 paper always includes some. The five language
// questions after these are untouched.
//
// Correct answers are spread across positions: an earlier pass on this course
// put every answer at index 0, which teaches the learner to tap the first
// option instead of reading.

const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const BASE = 'https://admin.ramz.tj/api/admin';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-api-key': KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(d)}`);
  return d;
}

const SETS = {
  // ── M1: travel problems ──
  cmrl4b16g005ev2wxstvkc32i: [
    { question: "What is the writer's main purpose in this text?",
      questionTranslated: 'Мақсади асосии муаллиф чист?',
      options: ['To warn people not to travel by plane', 'To advise travellers how to handle problems', 'To explain how airlines calculate delays'],
      correctIndex: 1, explanation: 'Тамоми матн маслиҳат медиҳад, ки ҳангоми мушкилӣ чӣ кор кунед.' },
    { question: 'Why does the writer mention the phone battery dying?',
      questionTranslated: 'Чаро муаллиф аз батареяи холишудаи телефон ёдовар мешавад?',
      options: ['To show how small problems add up during a delay', 'To advise readers to buy a better phone', 'To explain why airports have no chargers'],
      correctIndex: 0, explanation: 'Ин мисоли дуюми мушкилии хурд аст, ки ба таъхир зам мешавад.' },
    { question: 'What does the writer suggest about getting angry?',
      questionTranslated: 'Муаллиф дар бораи асабонӣ шудан чӣ мегӯяд?',
      options: ['It usually gets you a refund faster', 'It is what most experts recommend', 'It does not help you solve the problem'],
      correctIndex: 2, explanation: '«Instead of getting angry, you should use the time wisely».' },
    { question: "In the text, 'sensible' is closest in meaning to:",
      questionTranslated: 'Дар матн «sensible» ба кадом маъно наздик аст?',
      options: ['very wealthy', 'thinking clearly', 'always lucky'],
      correctIndex: 1, explanation: 'Sensible = оқилона фикр мекунад.' },
    { question: 'What can you ask for after a very long delay?',
      questionTranslated: 'Баъди таъхири хеле дароз чӣ талаб карда метавонед?',
      options: ['A new passport', 'A free seat upgrade', 'A food voucher or a refund'],
      correctIndex: 2, explanation: 'Дар матн айнан: «a food voucher or a refund».' },
  ],
  // ── M2: education and work ──
  cmrl4dl1400axv2wxc8yjmbz4: [
    { question: 'What is the best title for this text?',
      questionTranslated: 'Беҳтарин сарлавҳа барои ин матн кадом аст?',
      options: ['Why universities are no longer useful', 'How to write a perfect application', 'What it takes to build a career today'],
      correctIndex: 2, explanation: 'Матн дар бораи ҳамаи он чизест, ки барои касб лозим аст.' },
    { question: 'What does the writer suggest about a university degree?',
      questionTranslated: 'Муаллиф дар бораи дипломи донишгоҳ чӣ мегӯяд?',
      options: ['It is a starting point, but not enough on its own', 'It is the only thing employers look at', 'It is no longer worth having'],
      correctIndex: 0, explanation: '«Universities provide a strong foundation… but practical skills are learned on the job».' },
    { question: 'Why does the writer mention that meetings are held in English?',
      questionTranslated: 'Чаро муаллиф мегӯяд, ки ҷаласаҳо ба англисӣ мегузаранд?',
      options: ['To explain why global companies are larger', 'To show why language skills matter for a career', 'To argue that other languages are useless'],
      correctIndex: 1, explanation: 'Ин ҷумла собит мекунад, ки донистани забон арзиши касбӣ дорад.' },
    { question: "In the text, 'vital' is closest in meaning to:",
      questionTranslated: 'Дар матн «vital» ба кадом маъно наздик аст?',
      options: ['very important', 'very expensive', 'very rare'],
      correctIndex: 0, explanation: 'Vital = хеле муҳим, зарурӣ.' },
    { question: 'Who sometimes trains new staff?',
      questionTranslated: 'Кормандони навро баъзан кӣ таълим медиҳад?',
      options: ['University teachers', 'The customers', 'Experienced colleagues'],
      correctIndex: 2, explanation: '«New staff are trained by experienced colleagues».' },
  ],
  // ── M3: media history ──
  cmrl4e0ni00giv2wxq7o6snz6: [
    { question: 'What is the text mainly about?',
      questionTranslated: 'Матн асосан дар бораи чист?',
      options: ['Why Shakespeare is still popular', 'How media has developed over time', 'How to become a journalist'],
      correctIndex: 1, explanation: 'Матн аз театр то давраи рақамӣ роҳи расонаро тасвир мекунад.' },
    { question: 'Why does the writer mention Shakespeare?',
      questionTranslated: 'Чаро муаллиф Шекспирро ёдовар мешавад?',
      options: ['To show how old the tradition of entertainment is', 'To argue that plays are better than films', 'To explain who invented the theatre'],
      correctIndex: 0, explanation: 'Ӯ нуқтаи оғози таърих аст — «centuries ago».' },
    { question: 'What does the writer suggest is the downside of media today?',
      questionTranslated: 'Ба назари муаллиф, ҷиҳати манфии расонаи имрӯза чист?',
      options: ['Content has become too expensive', 'Older forms of media have all disappeared', 'Having endless choice makes deciding harder'],
      correctIndex: 2, explanation: '«It also makes it harder to choose what to watch or read».' },
    { question: "In the text, 'abundance' is closest in meaning to:",
      questionTranslated: 'Дар матн «abundance» ба кадом маъно наздик аст?',
      options: ['a very large amount', 'a serious shortage', 'a fair price'],
      correctIndex: 0, explanation: 'Abundance = фаровонӣ, миқдори хеле зиёд.' },
    { question: 'What did early cinema lack?',
      questionTranslated: 'Кинои аввалин чӣ надошт?',
      options: ['Actors', 'Sound', 'An audience'],
      correctIndex: 1, explanation: '«Moving pictures, even when they had no sound».' },
  ],
  // ── M4: environment ──
  cmrl4ejj700m3v2wxof9x78d7: [
    { question: "What is the writer's main purpose?",
      questionTranslated: 'Мақсади асосии муаллиф чист?',
      options: ['To describe how solar panels are built', 'To urge people to act on climate change now', 'To explain why rivers become dirty'],
      correctIndex: 1, explanation: '«We must act now» — тамоми матн даъват аст.' },
    { question: 'Why does the writer begin by asking us to imagine a clean world?',
      questionTranslated: 'Чаро муаллиф матнро бо тасаввури ҷаҳони тоза оғоз мекунад?',
      options: ['To show what is still possible if we act', 'To claim the problem is already solved', 'To describe a place that really exists'],
      correctIndex: 0, explanation: '«This vision can become a reality if…» — тасаввур ҳамчун ҳадаф.' },
    { question: 'What does the writer suggest about small local actions?',
      questionTranslated: 'Муаллиф дар бораи амалҳои хурди маҳаллӣ чӣ мегӯяд?',
      options: ['They are mostly a waste of time', 'They matter more than government policy', 'Together they would have a huge global effect'],
      correctIndex: 2, explanation: '«If every community cleaned up… the global impact would be massive».' },
    { question: "In the text, 'thrive' is closest in meaning to:",
      questionTranslated: 'Дар матн «thrive» ба кадом маъно наздик аст?',
      options: ['slowly disappear', 'live and grow well', 'become dangerous'],
      correctIndex: 1, explanation: 'Thrive = хуб зиндагӣ кардан ва инкишоф ёфтан.' },
    { question: 'What creates the pollution that damages the atmosphere?',
      questionTranslated: 'Кадом чиз ифлосиеро ба вуҷуд меорад, ки атмосфераро вайрон мекунад?',
      options: ['Burning fossil fuels', 'Planting new forests', 'Cleaning local rivers'],
      correctIndex: 0, explanation: '«The continued burning of fossil fuels creates pollution».' },
  ],
};

let n = 0;
for (const [compId, questions] of Object.entries(SETS)) {
  const c = (await api('/comprehensions/' + compId)).comprehension;
  console.log(`\n${c.title} (${c.questions.length} савол)`);
  for (let i = 0; i < questions.length; i++) {
    await api('/comprehensions/questions/' + c.questions[i].id, 'PUT', questions[i]);
    n++;
    console.log(`  ✓ q${i}: ${questions[i].question}`);
  }
}
console.log(`\n✅ ${n} саволи имтиҳон нав шуд.`);
