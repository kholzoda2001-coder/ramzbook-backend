import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
for(const g of await sql`SELECT "titleTranslated" tt,explanation ex FROM "GrammarTopic" WHERE id IN ('cmsswh7pb00313z7ua4oxjzuq','cmsswhdjl00433z7u67cbmea2')`){
  const blocks = g.ex.split('\n').filter(l=>l.trimStart().startsWith('⚡'));
  console.log(`«${g.tt}» → ${blocks.length} блоки ⚡:`);
  for(const b of blocks) console.log(`    ${b.replace(/\*\*/g,'').slice(0,72)}…`);
}
