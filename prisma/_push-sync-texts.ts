/**
 * Матни кампанияҳои ЗИНДАРО аз `lib/pushDefaults.ts` синхрон мекунад.
 *
 * ЧАРО: `ensureDefaultCampaigns` танҳо вақте seed мекунад, ки ҷадвал ХОЛӢ
 * бошад, пас ислоҳи матн дар код ба сатрҳои мавҷуда намерасад. Ва матнро дастӣ
 * дар ду ҷо нусхабардорӣ кардан хатои имло меорад — бинобар ин ҳамон объекти
 * `DEFAULT_CAMPAIGNS` import мешавад.
 *
 * Танҳо `texts`-ро мениависад. Ҷадвал, сегмент ва танзимоти дигар даст
 * намехӯранд — админ метавонад онҳоро дар панел иваз карда бошад.
 *
 * Иҷро:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/_push-sync-texts.ts
 * (драйвери HTTP, чун Prisma аз ин мошин ба Neon намерасад — порти 5432 баста)
 */
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { DEFAULT_CAMPAIGNS } from '../lib/pushDefaults';

const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env: Record<string, string> = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const sql = neon(env.DATABASE_URL);

(async () => {
  let updated = 0;
  for (const c of DEFAULT_CAMPAIGNS) {
    const rows = await sql`
      update "PushCampaign"
      set texts = ${JSON.stringify(c.texts)}::jsonb, "updatedAt" = now()
      where name = ${c.name}
      returning name`;
    if (rows.length > 0) {
      updated++;
      const tg = (c.texts as any).tg ?? Object.values(c.texts)[0];
      console.log(`✅ ${c.name}\n     «${tg.title}»\n     ${tg.body}`);
    } else {
      console.log(`⏭  ${c.name} — дар база нест (несткарда ё номаш иваз шуда)`);
    }
  }
  console.log(`\n${updated} аз ${DEFAULT_CAMPAIGNS.length} кампания нав шуд.`);
})();
