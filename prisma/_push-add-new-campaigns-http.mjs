/**
 * Ду кампанияи НАВРО илова мекунад — ҷои ёдрасонҳои маҳаллии 102 (дӯст) ва
 * 103 (гарави алмос).
 *
 * ⚠️ ТАНҲО БАЪДИ DEPLOY иҷро кунед: сутунҳои `friendStreak`/`wager` дар вақти
 * билди Vercel сохта мешаванд (`prisma db push`).
 *
 * ЧАРО скрипт, на `ensureDefaultCampaigns`: он қасдан танҳо вақте кор мекунад,
 * ки ҷадвал ХОЛӢ бошад — вагарна кампанияи несткардаи админ ҳар бор зинда
 * мешуд. Пас иловаи кампанияи нав ба базаи мавҷуда кори якдафъаина аст.
 *
 * Идемпотент: агар кампания бо ҳамин ном бошад, аз нав намесозад.
 * Иҷро: node prisma/_push-add-new-campaigns-http.mjs
 */
import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';

const envText = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const sql = neon(env.DATABASE_URL);

const NEW = [
  {
    name: 'Силсила бо дӯст 19:30',
    hour: 19, minute: 30, priority: 15,
    studiedToday: 'no', friendStreak: 'yes', maxInactiveDays: 2,
    countdownToHour: 29, route: 'lesson', cooldownHours: 20,
    texts: {
      tg: { title: 'Дӯстат интизор аст 🤝', body: 'Силсилаи ҷуфтиатон имрӯз меғурад. {countdown} монд — «{lesson}».' },
      ru: { title: 'Друг тебя ждёт 🤝', body: 'Ваш общий стрик сегодня оборвётся. Осталось {countdown} — «{lesson}».' },
      en: { title: 'Your friend is waiting 🤝', body: 'Your joint streak breaks today. {countdown} left — "{lesson}".' },
    },
  },
  {
    name: 'Гарави алмос 20:15',
    hour: 20, minute: 15, priority: 25,
    studiedToday: 'no', wager: 'yes', maxInactiveDays: 2,
    countdownToHour: 29, route: 'lesson', cooldownHours: 20,
    texts: {
      tg: { title: '💎 Гаравҳоят дар хатар', body: '{name}, имрӯз нахондаӣ — {countdown} монд. Як дарс ва алмосҳоят маҳфузанд.' },
      ru: { title: '💎 Твоя ставка под угрозой', body: '{name}, сегодня ты не занимался — осталось {countdown}. Один урок, и кристаллы твои.' },
      en: { title: '💎 Your wager is at risk', body: "{name}, you haven't studied today — {countdown} left. One lesson keeps your gems." },
    },
  },
];

for (const c of NEW) {
  const [{ n }] = await sql`select count(*)::int as n from "PushCampaign" where name = ${c.name}`;
  if (n > 0) {
    console.log(`⏭  «${c.name}» аллакай ҳаст`);
    continue;
  }
  await sql`
    insert into "PushCampaign"
      (id, name, kind, "isActive", hour, minute, "tzOffsetMin",
       "studiedToday", "friendStreak", wager, "maxInactiveDays",
       texts, route, "countdownToHour", priority, "cooldownHours", "updatedAt")
    values
      (${'c' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)},
       ${c.name}, 'scheduled', true, ${c.hour}, ${c.minute}, 300,
       ${c.studiedToday ?? null}, ${c.friendStreak ?? null}, ${c.wager ?? null}, ${c.maxInactiveDays ?? null},
       ${JSON.stringify(c.texts)}::jsonb, ${c.route}, ${c.countdownToHour}, ${c.priority}, ${c.cooldownHours}, now())`;
  console.log(`✅ «${c.name}» сохта шуд`);
}

const rows = await sql`select name, hour, minute, "friendStreak", wager from "PushCampaign" order by hour, minute`;
console.log(`\nҲамагӣ ${rows.length} кампания:`);
for (const r of rows) {
  console.log(`  ${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')} · ${r.name}` +
    (r.friendStreak ? ' [дӯст]' : '') + (r.wager ? ' [гарав]' : ''));
}
