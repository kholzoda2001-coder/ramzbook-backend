import { q } from './db.mjs';
const tables = ['Language','Course','Module','Lesson','Word','GrammarTopic','GrammarRule','GrammarExample','GrammarExercise','ComprehensionExercise','ComprehensionQuestion','Dialogue','DialogueLine','Phrase','PhraseCollection'];
for (const t of tables) {
  const cols = await q(`select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position`, [t]);
  console.log(`\n== ${t} ==`);
  console.log(cols.map(c => `${c.column_name}:${c.data_type}${c.is_nullable==='YES'?'?':''}`).join(', '));
}
