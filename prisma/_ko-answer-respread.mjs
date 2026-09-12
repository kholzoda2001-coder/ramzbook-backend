// Ҷойи ҷавоби дурусти саволҳои матн дар ҲАМАИ модулҳои кореягӣ — бе қолаб.
//
// Аудити M5 (2026-09-12) нишон дод, ки имтиҳон «2,1,0,2,1,0,0,1» буд — пораи давраи 3
// ду бор паси ҳам; персонаи «алгоритм» онро ёфт ва саволҳои 4–6-ро бе хондан ҷавоб дод.
// Санҷиши нав (`periodicRun` дар `_ko-module-build.mjs` ва `_ko-module-verify.mjs`) дар
// модулҳои ФАЪОЛ низ ду имтиҳон ёфт: M1 «카림의 자기소개» (2,0,2,0,…) ва M3 «사라 씨의
// 가족» (…,2,0,2,0,…).
//
// Ин скрипт танҳо ТАРТИБИ вариантҳоро иваз мекунад (матн, тарҷума ва аудио — не): ҷавоби
// дуруст ба мавқеи нав мегузарад, дигарон тартиби нисбии худро нигоҳ медоранд. Ҳамон
// алгоритми билдер (тухмӣ = номи матн), пас билди ояндаи ҳамон модул ҳамин натиҷаро медиҳад.
//
//   node prisma/_ko-answer-respread.mjs           # нақша
//   node prisma/_ko-answer-respread.mjs --apply   # навиштан + contentVersion
import { connect, APPLY } from './_ru-fix-lib.mjs';

const COURSE = 'cmtkb6vgg001lmgnbunb';
const sql = connect();

function periodicRun(t) {
  for (const p of [2, 3]) {
    for (let s = 0; s + 2 * p <= t.length; s++) {
      if (new Set(t.slice(s, s + p)).size < 2) continue;
      if (t.slice(s, s + p).every((v, k) => v === t[s + p + k])) return true;
    }
  }
  return false;
}
const bad = (t, lengths) =>
  t.every((v, i) => v === i % lengths[i]) ||
  t.some((v, i) => i >= 2 && v === t[i - 1] && v === t[i - 2]) ||
  (t.length > 1 && new Set(t).size === 1) ||
  periodicRun(t);

// Айнан `spreadAnswers`-и `_ko-module-build.mjs`.
function spreadAnswers(lengths, seed) {
  let x = 2166136261;
  for (const ch of seed) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619) >>> 0; }
  x = x || 1;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  let last = lengths.map((n, i) => i % n);
  for (let attempt = 0; attempt < 200; attempt++) {
    const out = lengths.map((n, i) => i % n);
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    const t = out.map((v, i) => v % lengths[i]);
    if (!bad(t, lengths)) return t;
    last = t;
  }
  return last;
}

const exs = await sql`
  SELECT DISTINCT c.id, c.title, l."moduleId" mid, m."order" mo
  FROM "ComprehensionExercise" c JOIN "Lesson" l ON l."comprehensionId" = c.id
  JOIN "Module" m ON m.id = l."moduleId" WHERE c."courseId" = ${COURSE} ORDER BY m."order", c.title`;
const writes = [], mods = new Set();
for (const e of exs) {
  const qs = await sql`SELECT id, options, "correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId" = ${e.id} ORDER BY "order", id`;
  const lengths = qs.map((q) => q.options.length);
  const now = qs.map((q) => q.ci);
  if (qs.length < 2 || !bad(now, lengths)) continue;
  const target = spreadAnswers(lengths, e.title);
  if (bad(target, lengths)) { console.log(`✗ M${e.mo + 1} «${e.title}»: тартиби бе қолаб ёфт нашуд`); continue; }
  console.log(`M${e.mo + 1} «${e.title}»: ${now.join(',')} → ${target.join(',')}`);
  for (const [i, q] of qs.entries()) {
    const right = q.options[q.ci];
    const rest = q.options.filter((_, k) => k !== q.ci);
    rest.splice(target[i], 0, right);
    if (rest[target[i]] !== right || rest.length !== q.options.length) throw new Error(`«${e.title}» Q${i + 1}: ҷойивазкунӣ хато`);
    writes.push(sql`UPDATE "ComprehensionQuestion" SET options = ${JSON.stringify(rest)}::jsonb, "correctIndex" = ${target[i]}
      WHERE id = ${q.id} AND "correctIndex" = ${q.ci}`);
  }
  mods.add(e.mid);
}
if (!writes.length) { console.log('Ҳама бе қолаб — тағйир нест.'); process.exit(0); }
if (!APPLY) { console.log(`\n(нақша) ${writes.length} савол дар ${mods.size} модул · --apply`); process.exit(0); }
await sql.transaction(writes);
// SQL-и мустақим `lib/contentVersion.ts`-ро давр мезанад → версияи бахш ва глобалӣ дастӣ.
const mv = await sql`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE id = ANY(${[...mods]}) RETURNING "order", "contentVersion"`;
await sql`UPDATE "AppSetting" SET "updatedAt" = now() WHERE key = 'content_version'`;
console.log(`✅ ${writes.length} савол · ${mv.map((m) => `M${m.order + 1} cv ${m.contentVersion}`).join(', ')}`);
