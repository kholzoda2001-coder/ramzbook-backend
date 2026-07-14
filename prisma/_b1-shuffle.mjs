// Ҷавобҳои comprehension-и B1-ро детерминӣ бетартиб мекунад (то ҳамеша дар A набошанд).
import { readFileSync } from 'fs';
import { SignJWT } from 'jose';

const ORIGIN = 'https://admin.ramz.tj';
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const mob = async (p) => { const r = await fetch(ORIGIN + '/api/mobile' + p); if (!r.ok) throw new Error(p); return r.json(); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function put(id, body) {
  for (let a = 0; a < 5; a++) {
    try { const r = await fetch(`${ORIGIN}/api/admin/comprehensions/questions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify(body) }); if (r.ok) return true; if (r.status >= 500) { await sleep(1500); continue; } console.log('❌', id, r.status); return false; } catch { await sleep(1500); }
  }
  return false;
}
// ҷавоби дурустро ба мавқеи targetPos мегузорад, дигаронро дар атроф пур мекунад
function placeCorrectAt(opts, correctIdx, targetPos) {
  const correct = opts[correctIdx];
  const others = opts.filter((_, i) => i !== correctIdx);
  const out = new Array(opts.length);
  out[targetPos] = correct;
  let k = 0;
  for (let i = 0; i < out.length; i++) if (i !== targetPos) out[i] = others[k++];
  return out;
}

const nat = (await mob('/languages/native')).languages; const tg = nat.find((l) => l.code === 'tg');
const tgt = (await mob('/languages/target?nativeLanguageId=' + tg.id)).languages; const en = tgt.find((l) => l.code === 'en');
const cs = (await mob(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`)).courses;
const b1 = cs.find((c) => c.level === 'B1');

let changed = 0, skipped = 0, fail = 0;
for (const m of b1.modules) {
  for (const st of m.lessons) {
    const L = await mob('/lessons/' + st.id); const c = (L.lesson || L).component;
    if (!c || c.type !== 'comprehension' || !c.questions) continue;
    c.questions.forEach; let qi = 0;
    for (const q of c.questions) {
      const opts = q.options || [];
      if (opts.length < 2 || q.correctIndex == null) { skipped++; qi++; continue; }
      const targetPos = qi % opts.length;                 // 0,1,2,3,0,… дар дохили ҳар comprehension
      const newOpts = placeCorrectAt(opts, q.correctIndex, targetPos);
      if (targetPos === q.correctIndex) { skipped++; qi++; continue; }
      if (await put(q.id, { options: newOpts, correctIndex: targetPos })) changed++; else fail++;
      qi++;
    }
  }
}
console.log(`✅ Бетартиб: ${changed} савол | бетағйир: ${skipped} | ноком: ${fail}`);
