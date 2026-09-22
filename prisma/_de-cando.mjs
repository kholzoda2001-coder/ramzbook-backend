// «Пас аз ин бахш чӣ карда метавонӣ» — `Module.canDoStatement` барои ҳар 15
// бахши олмонӣ, ва дескрипторҳои CEFR-и сатҳи A1 (`CefrDescriptor`).
//
// Аввалӣ дар харитаи роҳ зери сарлавҳаи бахш намоён мешавад ва ба хонанда
// мегӯяд, ки ин бахш маҳз чӣ имкон медиҳад. Дуюмӣ ваъдаи ТАМОМИ сатҳ аст ва
// аз рӯи чор маҳорат ҷудо шудааст — айнан мисли англисӣ.
//
//   node prisma/_de-cando.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdhwb5q00021z597df2767m';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const APPLY = process.argv.includes('--apply');

const CAN_DO = {
  0: 'Пас аз ин бахш салом дода, худатонро муаррифӣ карда ва аз номи шахси дигар пурсида метавонед.',
  1: 'Пас аз ин бахш дар бораи оилаи худ нақл карда, аъзои онро номбар карда метавонед.',
  2: 'Пас аз ин бахш рақамҳоро гуфта, синну сол ва рақами телефонро пурсида метавонед.',
  3: 'Пас аз ин бахш ранг ва хусусияти ашёро тавсиф карда метавонед.',
  4: 'Пас аз ин бахш рӯзи ҳафта, моҳ ва санаро гуфта метавонед.',
  5: 'Пас аз ин бахш дар ресторан хӯрок фармоиш дода ва завқи худро гуфта метавонед.',
  6: 'Пас аз ин бахш манзили худро тавсиф карда ва гуфта метавонед, ки дар он чӣ ҳаст.',
  7: 'Пас аз ин бахш дар мағоза либос интихоб карда, андоза ва нархро пурсида метавонед.',
  8: 'Пас аз ин бахш роҳро пурсида, самтро фаҳмонда ва бо нақлиёт сафар карда метавонед.',
  9: 'Пас аз ин бахш реҷаи рӯзи худро нақл карда ва соатро гуфта метавонед.',
  10: 'Пас аз ин бахш дар назди духтур дардатонро гуфта ва маслиҳати ӯро фаҳмида метавонед.',
  11: 'Пас аз ин бахш дар бораи обу ҳаво, табиат ва эҳсосоти худ сӯҳбат карда метавонед.',
  12: 'Пас аз ин бахш касби худро гуфта ва дар бораи ҷои кори худ нақл карда метавонед.',
  13: 'Пас аз ин бахш дӯстонро даъват карда ва дар бораи вақти холии худ сӯҳбат карда метавонед.',
  14: 'Пас аз ин бахш сафарро ба нақша гирифта, дар меҳмонхона ҳуҷра гирифта ва дар бораи рухсатии гузашта нақл карда метавонед.',
};

const DESCRIPTORS = [
  ['overall', 'Дар сатҳи A1 хонанда калима ва ҷумлаҳои хеле соддаи олмониро мефаҳмад ва истифода мебарад: салом додан, худро муаррифӣ кардан, рақам ва вақт гуфтан, дар мағоза ва назди духтур гап задан.'],
  ['listening', 'Метавонад калима, рақам ва ибораҳои шиносро, агар оҳиста ва равшан гуфта шаванд, бишнавад ва шиносад — масалан нарх, соат ва суроға.'],
  ['speaking', 'Метавонад бо ҷумлаҳои кӯтоҳ салом диҳад, худро муаррифӣ кунад, касб ва оилаашро номбар кунад, хӯрок фармоиш диҳад ва роҳ пурсад.'],
  ['reading', 'Метавонад эълон, рӯйхат ва матни кӯтоҳи A1-ро хонад: меню, ҷадвали вақт, кортпочта ва хабари кӯтоҳ.'],
  ['writing', 'Метавонад ҷумлаҳои содда нависад: муаррифии худ, кортпочта аз сафар ва хабари кӯтоҳ ба дӯст.'],
];

const mods = await q(`SELECT id, "order", title, "canDoStatement" FROM "Module" WHERE "courseId"=$1 ORDER BY "order"`, [COURSE]);
const missing = mods.filter(m => CAN_DO[m.order] === undefined);
if (missing.length) { console.error('Барои ин бахшҳо матн нест:', missing.map(m => m.order).join(', ')); process.exit(1); }

console.log(`бахшҳо: ${mods.length} · бе матн: ${mods.filter(m => !m.canDoStatement).length}`);
const [cef] = await q(`SELECT count(*)::int n FROM "CefrDescriptor" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 AND "cefrLevel"='A1'`, [DE, TG]);
console.log(`дескриптори CEFR (de→tg, A1): ${cef.n}`);
if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(0); }

for (const m of mods) {
  await q(`UPDATE "Module" SET "canDoStatement"=$1 WHERE id=$2`, [CAN_DO[m.order], m.id]);
}
console.log(`✓ ${mods.length} бахш матни «чӣ карда метавонед» гирифт`);

for (const [i, [skill, canDo]] of DESCRIPTORS.entries()) {
  await q(
    `INSERT INTO "CefrDescriptor" (id, "targetLanguageId", "nativeLanguageId", "cefrLevel", skill, "canDo", "order", "createdAt")
     SELECT gen_random_uuid()::text, $1, $2, 'A1', $3, $4, $5, NOW()
     WHERE NOT EXISTS (SELECT 1 FROM "CefrDescriptor" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 AND "cefrLevel"='A1' AND skill=$3)`,
    [DE, TG, skill, canDo, i]);
}
const [after] = await q(`SELECT count(*)::int n FROM "CefrDescriptor" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 AND "cefrLevel"='A1'`, [DE, TG]);
console.log(`✓ дескриптори CEFR: ${after.n}`);

await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
