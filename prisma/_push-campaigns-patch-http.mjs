/**
 * Кампанияҳои push-и АЛЛАКАЙ мавҷударо ба меъёрҳои нав меорад.
 *
 * ЧАРО скрипти алоҳида: `lib/pushDefaults.ts` танҳо вақте seed мекунад, ки
 * ҷадвал ХОЛӢ бошад (то кампанияи несткардаи админ зинда нашавад). Дар продакшн
 * ҳашт сатр аллакай ҳаст, пас тағйирот дар код ба онҳо намерасад.
 *
 * Се ислоҳ:
 *  1. `maxInactiveDays = 2` ба занҷири рӯзона — то корбари ғайрифаъол дар як
 *     рӯз 3 push (19:00 + 20:00 win-back + 21:30) нагирад;
 *  2. `countdownToHour = 29` ба огоҳиҳои қавӣ — силсила дар 00:00 UTC =
 *     05:00 Душанбе месӯзад, на дар нимишаби маҳаллӣ; 24 матнро дурӯғ мекард;
 *  3. `langs = 'tg,uz,en'` ба кампанияи тоҷикӣ — вагарна корбари uz/en ҳеҷ
 *     ёдрасони рӯзона намегирад.
 *
 * Идемпотент аст: такрор кардан чизе вайрон намекунад.
 * Иҷро: node prisma/_push-campaigns-patch-http.mjs
 * (драйвери HTTP, чун аз ин мошин Prisma ба Neon намерасад — порти 5432 баста)
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

const show = async (label) => {
  const rows = await sql`
    select name, hour, minute, langs, "studiedToday", "minStreak",
           "minInactiveDays", "maxInactiveDays", "countdownToHour"
    from "PushCampaign" order by priority asc`;
  console.log(`\n── ${label} ──`);
  for (const r of rows) {
    console.log(
      `${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')} · ${r.name}` +
        `\n     langs=${r.langs ?? '—'} studiedToday=${r.studiedToday ?? '—'}` +
        ` streak≥${r.minStreak ?? '—'} inactive=${r.minInactiveDays ?? '—'}..${r.maxInactiveDays ?? '—'}` +
        ` countdown→${r.countdownToHour ?? '—'}`,
    );
  }
};

await show('ПЕШ');

// 1 + 3. Занҷири рӯзона (соатҳои 19:00 ва 21:30) — ғайрифаъолон ба win-back мераванд.
const daily = await sql`
  update "PushCampaign"
  set "maxInactiveDays" = 2
  where "studiedToday" = 'no' and "minInactiveDays" is null and "maxInactiveDays" is null
  returning name`;
console.log(`\n[1] maxInactiveDays=2 → ${daily.length} кампания`);

// 2. Дедлайни ВОҚЕИИ силсила (00:00 UTC = 05:00 Душанбе).
const cd = await sql`
  update "PushCampaign"
  set "countdownToHour" = 29
  where "countdownToHour" = 24
  returning name`;
console.log(`[2] countdownToHour=29 → ${cd.length} кампания`);

// 3. Забонҳои бе кампанияи худӣ ба кампанияи тоҷикӣ ҳамроҳ мешаванд
//    (`pickText` барои uz ба тоҷикӣ бармегардад).
const lang = await sql`
  update "PushCampaign"
  set langs = 'tg,uz,en'
  where langs = 'tg'
  returning name`;
console.log(`[3] langs='tg,uz,en' → ${lang.length} кампания`);

await show('БАЪД');
