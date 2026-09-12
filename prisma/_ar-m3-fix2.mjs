// `أَبُوهَا` — шакли «панҷ исм» (الأسماء الخمسة): пеш аз пасванд ба أب
// ҳарфи و меафзояд. Ин мавзӯи B1 аст; хонандаи A1 танҳо `الأَب`-ро дидааст
// ва ин шаклро калимаи ДИГАР меҳисобад.
//
// Ҳал: ҷумла бо сохти `عِنْدَ`-и худи ҳамин модул (Д7) навишта мешавад —
// ҳам дуруст, ҳам аз мазмуни омӯхташуда.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [c.id]);
const ls = await sql.query(`SELECT "comprehensionId" ci FROM "Lesson" WHERE "moduleId"=$1 AND "comprehensionId" IS NOT NULL`, [m.id]);
const ids = ls.map(x => x.ci);
const P = 'مَرْحَباً! هَذِهِ صَدِيقَتِي سَارَة. عِنْدَهَا أُسْرَةٌ كَبِيرَةٌ. '
        + 'عِنْدَهَا أُمٌّ مُعَلِّمَةٌ وَأَبٌ طَبِيبٌ. عِنْدَهَا أَخٌ وَاحِد. '
        + 'أَخُوهَا طَوِيلٌ وَقَوِيّ.';
const T = 'Салом! Ин дӯсти ман Сара аст. Ӯ оилаи калон дорад. '
        + 'Модараш муаллима ва падараш духтур аст. Ӯ як бародар дорад. '
        + 'Бародараш қадбаланд ва қувватманд аст.';
const r = await sql.query(
  `UPDATE "ComprehensionExercise" SET passage=$2, "passageTranslated"=$3
    WHERE id=ANY($1) AND "titleTranslated"='Шунавоӣ: Оилаи дӯстам' RETURNING id`, [ids, P, T]);
console.log(`${r.length ? '✓' : '·'} матни шунавоӣ бе «أَبُوهَا» навишта шуд (${r.length})`);
