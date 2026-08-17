// Дар муколамаҳои арабӣ сатрҳои гӯяндаи ДУЮМро «сатри ман» мекунад.
//
// Чаро: дар машқи гап задан (DialogueRolePlayScreen) микрофон танҳо дар
// сатрҳои `isUser` мебарояд — барнома сатри ҳамсуҳбатро худаш мехонад ва
// сатри «ман»-ро аз хонанда мепурсад. Панҷ муколамаи арабӣ ягон сатри `isUser`
// надоштанд, пас хонанда танҳо гӯш мекард ва ҳеҷ гоҳ гап намезад. Дар англисӣ
// ва русӣ чунин муколама нест — ҳама гӯяндаи дуюмро «ман» мекунанд.
//
//   node prisma/_ar-dialogue-isuser.mjs --dry
//   node prisma/_ar-dialogue-isuser.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';

const bad = await q(`SELECT d.id, d."titleTranslated" t FROM "Dialogue" d
  WHERE d."courseId"='${COURSE}'
    AND NOT EXISTS (SELECT 1 FROM "DialogueLine" x WHERE x."dialogueId"=d.id AND x."isUser"=true)
  ORDER BY d."order"`);
console.log(`муколамаҳои бе сатри «ман»: ${bad.length}`);

let changed = 0;
for (const d of bad) {
  const lines = await q(`SELECT id, "order", speaker FROM "DialogueLine" WHERE "dialogueId"='${d.id}' ORDER BY "order"`);
  const speakers = [...new Set(lines.map(l => l.speaker))];
  if (speakers.length !== 2) { console.log(`  ⚠ «${d.t}»: ${speakers.length} гӯянда — дастӣ дида шавад`); continue; }
  // Гӯяндаи ДУЮМ (он ки аввал гап намезанад) — «ман»; ҳамин тартиб дар
  // англисӣ, русӣ ва муколамаҳои дурусти арабӣ истифода шудааст.
  const me = speakers[1];
  const mine = lines.filter(l => l.speaker === me);
  console.log(`  «${d.t}»: ${lines.length} сатр · «ман» = ${me} → ${mine.length} сатр`);
  if (!DRY) {
    for (const l of mine) await q(`UPDATE "DialogueLine" SET "isUser"=true WHERE id=$1`, [l.id]);
  }
  changed += mine.length;
}

if (!DRY && changed) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('content_version ламс шуд.');
}
console.log(DRY ? `\n[--dry] ${changed} сатр «ман» МЕШУД.` : `\n${changed} сатр «ман» шуд.`);

// Худсанҷӣ
const left = await q(`SELECT COUNT(*)::int n FROM "Dialogue" d WHERE d."courseId"='${COURSE}'
  AND NOT EXISTS (SELECT 1 FROM "DialogueLine" x WHERE x."dialogueId"=d.id AND x."isUser"=true)`);
console.log(`ҳоло бе сатри «ман»: ${left[0].n} муколама`);
