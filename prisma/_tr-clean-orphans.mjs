// Ҷузъҳои ЯТИМ-и курси туркӣ — он чи ба ҳеҷ дарс пайваст нест.
//
// Инҳо аз таҳрири мазмун мемонанд (мавзӯи грамматика иваз шуд, матн аз нав
// навишта шуд) ва ба хонанда намоён нестанд, вале дар панели админ ва дар ҳар
// ҳисоб «партови» мешаванд ва аудити курсро ифлос мекунанд.
//
//   node prisma/_tr-clean-orphans.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const APPLY = process.argv.includes('--apply');

const topics = await q(
  `SELECT id, "order", title FROM "GrammarTopic" g WHERE g."courseId"=$1
     AND NOT EXISTS (SELECT 1 FROM "Lesson" l WHERE l."grammarTopicId"=g.id) ORDER BY "order"`, [COURSE]);
const dialogues = await q(
  `SELECT id, title FROM "Dialogue" d WHERE d."courseId"=$1
     AND NOT EXISTS (SELECT 1 FROM "Lesson" l WHERE l."dialogueId"=d.id)`, [COURSE]);
const comps = await q(
  `SELECT id, title FROM "ComprehensionExercise" c WHERE c."courseId"=$1
     AND NOT EXISTS (SELECT 1 FROM "Lesson" l WHERE l."comprehensionId"=c.id)`, [COURSE]);

for (const t of topics) console.log(`  грамматика: #${t.order} ${t.title}`);
for (const d of dialogues) console.log(`  муколама: ${d.title}`);
for (const c of comps) console.log(`  матн: ${c.title}`);
const total = topics.length + dialogues.length + comps.length;
if (!total) { console.log('✓ ҷузъи ятим нест'); process.exit(0); }
if (!APPLY) { console.log(`\n${total} ҷузъи ятим · (нақша) --apply барои ҳазф`); process.exit(0); }

// Зернависҳо ба `onDelete: Cascade` пайвастанд — қоида/мисол/машқ/сатр/савол
// худашон мераванд.
if (topics.length) await q(`DELETE FROM "GrammarTopic" WHERE id = ANY($1)`, [topics.map(t => t.id)]);
if (dialogues.length) await q(`DELETE FROM "Dialogue" WHERE id = ANY($1)`, [dialogues.map(d => d.id)]);
if (comps.length) await q(`DELETE FROM "ComprehensionExercise" WHERE id = ANY($1)`, [comps.map(c => c.id)]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${total} ҷузъи ятим ҳазф шуд`);
