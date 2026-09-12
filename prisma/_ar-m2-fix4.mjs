// Пасди чорум — ҷузъиёти охирин, ки танҳо бо чашм дида мешаванд.
//
//   • 🏙 ва 🏙️ ду сатри ГУНОГУНАНД (variation selector), вале дар экран
//     АЙНАН як хел менамоянд — аудит инро намебинад, чашм мебинад.
//   • `مِن` бе сукун буд, дар ҳоле ки Модули 1 `مَنْ`-ро бо сукун меомӯзонад.
//     Сукун талаффузро иваз намекунад → аудио бехатар.
//   • Ду мисол ҳанӯз ҳаракати нопурра ва як калимаи ношинос (`إِنَّهُ`) доштанд.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=1`, [c.id]);
const ls = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [m.id]);
const lids = ls.map(x => x.id);
const upd = async (label, text, params) => {
  const r = await sql.query(text + ' RETURNING id', params);
  console.log(`${r.length ? '✓' : '·'} ${label} (${r.length})`);
};
await upd('لَنْدَن: 🏙️ → 🌉 (аз مَدِينَة 🏙 фарқ кунад)',
  `UPDATE "Word" SET emoji='🌉' WHERE "lessonId"=ANY($1) AND word='لَنْدَن'`, [lids]);
await upd('مِن → مِنْ (сукуни пурра)',
  `UPDATE "Word" SET word='مِنْ', example='أَنَا مِنْ طَاجِيكِسْتَان.' WHERE "lessonId"=ANY($1) AND word='مِن'`, [lids]);
await upd('أَمْرِيكَا: ҳаракати пурра',
  `UPDATE "Word" SET example='هُوَ يَعِيشُ فِي أَمْرِيكَا.' WHERE "lessonId"=ANY($1) AND word='أَمْرِيكَا'`, [lids]);
await upd('إِنْجِلْتِرَا: ҳаракати пурра',
  `UPDATE "Word" SET example='هِيَ مِنْ إِنْجِلْتِرَا.' WHERE "lessonId"=ANY($1) AND word='إِنْجِلْتِرَا'`, [lids]);
await upd('مَكَان: «إِنَّهُ» бароварда, «нағз» → «зебо»',
  `UPDATE "Word" SET example='هَذَا مَكَانٌ جَمِيلٌ.', "exampleTrans"='Ин ҷои зебо аст.' WHERE "lessonId"=ANY($1) AND word='مَكَان'`, [lids]);
await upd('الإِمَارَات: ҳаракати пурра',
  `UPDATE "Word" SET example='أَعْمَلُ فِي الإِمَارَات.' WHERE "lessonId"=ANY($1) AND word='الإِمَارَات'`, [lids]);
