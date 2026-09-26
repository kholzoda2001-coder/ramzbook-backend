// «Гуфтори рӯз» дар базаи ЗИНДА (26.09.2026).
//
// `ensureDefaultCampaigns` танҳо дар базаи ХОЛӢ кор мекунад, пас дар продакшн
// кампанияи нав худ ба худ пайдо намешавад. Ин скрипт:
//   1. кампанияи «Гуфтори рӯз 19:00»-ро месозад (агар набошад);
//   2. ба ёдрасонҳои нарми 19:00 `speaking = 'no'` мегузорад — то хонандаи
//      гуфтор ду паёми 19:00 нагирад (лимити 2/рӯз огоҳии 22:00-ро мехӯрд).
//
//   node --dns-result-order=ipv4first prisma/_push-speaking-daily.mjs          # танҳо нишон медиҳад
//   node --dns-result-order=ipv4first prisma/_push-speaking-daily.mjs --apply  # иҷро мекунад
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);
const sql = neon(env.DATABASE_URL);
const apply = process.argv.includes('--apply');

const NAME = 'Гуфтори рӯз 19:00';
const TEXTS = {
  tg: {
    title: '🗣 {name}, имрӯз инро бигӯед',
    body: '«{phrase}» ({phrase_tr}) — 3 дақиқа гуфтор, ва ин ибора аз они шумост.',
  },
  ru: {
    title: '🗣 {name}, скажи сегодня вслух',
    body: '«{phrase}» ({phrase_tr}) — 3 минуты разговора, и эта фраза твоя.',
  },
  en: {
    title: '🗣 {name}, say this today',
    body: '“{phrase}” ({phrase_tr}) — three minutes of speaking and it is yours.',
  },
};

const rows = await sql.query(
  `SELECT id, name, hour, minute, langs, "studiedToday", speaking, "isActive", priority, route
     FROM "PushCampaign" ORDER BY hour, minute, priority`,
);
console.log('Кампанияҳо:');
for (const r of rows) {
  console.log(`  ${r.isActive ? '●' : '○'} ${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')}  p${r.priority}  ${r.name}  langs=${r.langs ?? '*'} studied=${r.studiedToday ?? '*'} speaking=${r.speaking ?? '*'} → ${r.route}`);
}

const softs = rows.filter((r) => r.name.startsWith('Ёдрасони нарм 19:00'));
const exists = rows.some((r) => r.name === NAME);
const [{ n: speakers }] = await sql.query(
  `SELECT COUNT(DISTINCT u.id)::int AS n FROM "User" u
     JOIN "SpeakingProgress" sp ON sp."userId" = u.id
    WHERE u."pushEnabled" = true
      AND EXISTS (SELECT 1 FROM "DeviceToken" d WHERE d."userId" = u.id)
      AND sp."completedAt" >= NOW() - INTERVAL '30 days'`,
);
console.log(`\nХонандагони гуфтор бо push (30 рӯз): ${speakers}`);
console.log(`Ёдрасонҳои нарми 19:00: ${softs.length} · «${NAME}» ${exists ? 'ҲАСТ' : 'нест'}`);

if (!apply) {
  console.log('\n(танҳо нишон дода шуд — барои иҷро: --apply)');
  process.exit(0);
}

if (!exists) {
  const id = 'c' + randomBytes(12).toString('hex');
  await sql.query(
    `INSERT INTO "PushCampaign"
       (id, name, kind, "isActive", hour, minute, "tzOffsetMin", "studiedToday", "maxInactiveDays",
        speaking, texts, route, priority, "cooldownHours", "createdAt", "updatedAt")
     VALUES ($1,$2,'scheduled',true,19,0,300,'no',2,'yes',$3::jsonb,'speaking',9,20,NOW(),NOW())`,
    [id, NAME, JSON.stringify(TEXTS)],
  );
  console.log(`+ сохта шуд: ${NAME} (${id})`);
}
for (const s of softs) {
  if (s.speaking === 'no') continue;
  await sql.query(`UPDATE "PushCampaign" SET speaking = 'no', "updatedAt" = NOW() WHERE id = $1`, [s.id]);
  console.log(`~ ${s.name}: speaking = no`);
}
console.log('Тайёр.');
