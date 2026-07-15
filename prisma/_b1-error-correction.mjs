// Ба ҳар 24 мавзӯи грамматикаи B1 як машқи «Ислоҳи хато» илова мекунад.
// Ҳар ҷумла ЯК калимаи нодуруст дорад (шумораи калима бетағйир) — то frontend
// (тап-калима + навиштани ислоҳ) дуруст кор кунад. --test: танҳо якто.
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';
const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ec = (wrong, correct, explanation) => ({ type: 'error_correction', prompt: wrong, promptTranslated: 'Калимаи нодурустро ёбед ва ислоҳ кунед', answer: correct, explanation });

// topicId → машқи error_correction (ҷумлаи хато → ҷумлаи дуруст)
const ITEMS = {
  'cmrl4atnr002kv2wxbnpqdwsc': ec('I have already finish my homework.', 'I have already finished my homework.', 'have + already + past participle: finished.'),
  'cmrl4autc0035v2wxjg04wqsy': ec('While I was cook, the phone rang.', 'While I was cooking, the phone rang.', 'was + V-ing: cooking.'),
  'cmrl4dd7m0086v2wxwljfex79': ec('English is speak in many countries.', 'English is spoken in many countries.', 'Passive: is + past participle (spoken).'),
  'cmrl4de59008pv2wx885elpen': ec('The house was build in 1990.', 'The house was built in 1990.', 'Passive гузашта: was + built.'),
  'cmrl4dtzx00dpv2wx7b3ch7qr': ec('The man which lives next door is a doctor.', 'The man who lives next door is a doctor.', 'Одам → who, на which.'),
  'cmrl4dva100e9v2wx1xaeugtu': ec('She said that she is tired.', 'She said that she was tired.', 'Reported speech: is → was.'),
  'cmrl4ed8j00jav2wxnglqcda5': ec('If it rains, we will stayed at home.', 'If it rains, we will stay at home.', 'will + V (бе -ed): stay.'),
  'cmrl4ee7o00juv2wxiu4xt9dr': ec('If I was rich, I would travel the world.', 'If I were rich, I would travel the world.', '2nd conditional: If I were.'),
  'cmrl4uqzc002jr7wjp8thn3e2': ec('She has been work here for five years.', 'She has been working here for five years.', 'has been + V-ing: working.'),
  'cmrl4urxq0031r7wjd57eqk1x': ec('When we arrived, the film has already started.', 'When we arrived, the film had already started.', 'Past Perfect: had, на has.'),
  'cmrl55edo0081r7wjg3tnw4tz': ec('I am going to visited my aunt tomorrow.', 'I am going to visit my aunt tomorrow.', 'going to + V (бе -ed): visit.'),
  'cmrl55fbj008kr7wjgc47r98g': ec('He must being very tired today.', 'He must be very tired today.', 'must + be (бе -ing).'),
  'cmrl5di1b002j10bjirx8na90': ec('If I had known, I would have call you.', 'If I had known, I would have called you.', '3rd conditional: would have + called.'),
  'cmrl5dizn003110bjufrg9aw1': ec('I wish I have more free time.', 'I wish I had more free time.', 'wish + Past Simple: had.'),
  'cmrl5l0c0002jl9pgx086r1m5': ec('He asked me where I live.', 'He asked me where I lived.', 'Reported question: live → lived.'),
  'cmrl5l1fe0032l9pgi82eo5vw': ec("You are a student, isn't you?", "You are a student, aren't you?", 'Tag: are → aren\'t you.'),
  'cmrl5rg0g002jztco6536r85d': ec('I am interested in learn English.', 'I am interested in learning English.', 'Баъди пешоянд → V-ing: learning.'),
  'cmrl5rh0b0032ztcoymlq9b8d': ec('I had my hair cutted yesterday.', 'I had my hair cut yesterday.', 'Causative: have + object + past participle (cut).'),
  'cmrl5xv810082ztcoako5ejyf': ec('A new planet has been discover.', 'A new planet has been discovered.', 'Passive: has been + discovered.'),
  'cmrl5xw6z008lztcos9cgl53i': ec('It was so a nice day.', 'It was such a nice day.', 'such + a + сифат + исм.'),
  'cmrl656n500dnztcogip8auia': ec('My father, that is a doctor, works hard.', 'My father, who is a doctor, works hard.', 'Non-defining: who, на that.'),
  'cmrl657kq00e5ztcocyancetz': ec('You should have tell me earlier.', 'You should have told me earlier.', 'should have + past participle: told.'),
  'cmrl6hdga002ja991i6jdc6nn': ec('If I had studied, I would being a doctor now.', 'If I had studied, I would be a doctor now.', 'Mixed: would + be.'),
  'cmrl6hegl0031a99196sxjo2r': ec('She took on yoga last year.', 'She took up yoga last year.', 'take up = машғулиятро сар кардан.'),
};

// санҷиши шумораи калима (ҳатман баробар)
for (const [id, it] of Object.entries(ITEMS)) {
  const a = it.prompt.trim().split(/\s+/).length, b = it.answer.trim().split(/\s+/).length;
  if (a !== b) console.log(`⚠️ ${id}: калима нобаробар (${a} vs ${b}) — "${it.prompt}"`);
}

async function imp(parentId, items) {
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fetch(`${ORIGIN}/api/admin/import`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify({ type: 'grammar_exercises', parentId, mode: 'append', items }) });
      if (r.ok) return true;
      if (r.status >= 500) { await sleep(1500); continue; }
      console.log('❌', parentId, r.status, (await r.text()).slice(0, 90)); return false;
    } catch (e) { if (a === 4) { console.log('❌', parentId, e.message); return false; } await sleep(1500); }
  }
}

const entries = Object.entries(ITEMS);
const list = process.argv[2] === '--test'
  ? entries.slice(0, 1)
  : process.argv[2] === '--rest'
    ? entries.slice(1)
    : entries;
let ok = 0, fail = 0;
for (const [id, it] of list) (await imp(id, [it])) ? ok++ : fail++;
console.log(`✅ Илова: ${ok} | Ноком: ${fail}`);

// тасдиқ: оё навъ error_correction сабт шуд ё ба fill_blank табдил ёфт?
if (list.length) {
  const [tid] = list[0];
  const t = await (await fetch(`${ORIGIN}/api/mobile/grammar/${tid}`)).json();
  const exs = (t.exercises || t.topic?.exercises || []);
  const ecOnes = exs.filter(e => e.type === 'error_correction');
  console.log(`Санҷиш: мавзӯи аввал ${ecOnes.length} машқи error_correction дорад (агар 0 бошад — backend ҳанӯз деплой нашуд).`);
}
