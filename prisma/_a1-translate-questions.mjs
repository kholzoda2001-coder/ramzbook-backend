// Ба 41 саволи comprehension-и A1 тарҷумаи тоҷикӣ илова мекунад (questionTranslated).
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';
const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const un = JSON.parse(readFileSync('tmp/a1-untranslated-q.json', 'utf8'));

const MAP = {
  'what day is today?': 'Имрӯз кадом рӯз аст?',
  'what time is it?': 'Соат чанд аст?',
  'in which month is the birthday?': 'Зодрӯз дар кадом моҳ аст?',
  'what time does he wake up?': 'Ӯ соати чанд бедор мешавад?',
  'what does he do after breakfast?': 'Ӯ баъди наҳорӣ чӣ мекунад?',
  'what do i eat in the morning?': 'Ман субҳ чӣ мехӯрам?',
  'what do i eat for lunch?': 'Ман дар хӯроки нисфирӯзӣ чӣ мехӯрам?',
  'where is the book?': 'Китоб дар куҷост?',
  'where is the bag?': 'Халта дар куҷост?',
  'where do i go?': 'Ман ба куҷо меравам?',
  'what do i want to buy?': 'Ман чӣ харидан мехоҳам?',
  'what am i looking for?': 'Ман чиро меҷӯям?',
  'where is it?': 'Он дар куҷост?',
  'what is the man wearing?': 'Мард чӣ пӯшидааст?',
  'what color is the dress?': 'Курта чӣ ранг дорад?',
};

function translate(q) {
  const t = q.trim();
  let m;
  if ((m = t.match(/^Translate\s+'(.+?)':?$/i))) return `«${m[1]}»-ро тарҷума кунед:`;
  if ((m = t.match(/^What is\s+'(.+?)'\s+in English\?$/i))) return `«${m[1]}» бо англисӣ чӣ мешавад?`;
  if ((m = t.match(/^Choose the correct verb for\s+'(.+?)':?$/i))) return `Феъли дурустро барои «${m[1]}» интихоб кунед:`;
  if ((m = t.match(/^Choose correct:?\s*(.*)$/i))) return `Дурустро интихоб кунед: ${m[1]}`;
  return MAP[t.toLowerCase()] || null;
}

let ok = 0, fail = 0, skip = 0;
for (const item of un) {
  const tr = translate(item.q);
  if (!tr) { skip++; console.log('⏭️ бе тарҷума монд:', item.q); continue; }
  let done = false;
  for (let a = 0; a < 4 && !done; a++) {
    try {
      const r = await fetch(`${ORIGIN}/api/admin/comprehensions/questions/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify({ questionTranslated: tr }) });
      if (r.ok) { ok++; done = true; }
      else if (r.status >= 500) await sleep(1200);
      else { fail++; console.log('❌', item.id, r.status); break; }
    } catch { await sleep(1200); }
  }
  if (!done && !fail) fail++;
}
console.log(`✅ Тарҷума илова шуд: ${ok} | ноком: ${fail} | монд: ${skip}`);
