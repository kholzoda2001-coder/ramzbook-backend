// Сатрҳои «Натиҷаи бахш» (canDoStatement) барои курси АНГЛИСӢ A1 (en→tg).
//
// ЧӢ МЕКУНАД
// ─────────
// Ба ҳар яке аз 12 модули курси en→tg A1 як ҷумлаи тоҷикӣ менависад, ки дар
// харита зери сарлавҳаи бахш нишон дода мешавад:
//
//   «Пас аз ин бахш дар бораи оила ва хешовандони худ нақл карда метавонед.»
//
// Ин аз `CefrDescriptor` ФАРҚ мекунад: он ба тамоми САТҲ (A1) ва як маҳорат
// (хондан/шунидан/…) тааллуқ дорад ва бо забони «Ман метавонам…» навишта
// шудааст. Ин ҷо баръакс — як БАХШ, як натиҷаи мушаххас, бо муроҷиати «шумо».
//
// ЧАРО ДРАЙВЕРИ HTTP, НА PRISMA
// ─────────────────────────────
// Аз баъзе шабакаҳо (аз ҷумла мошини кории ҷорӣ) порти TCP:5432-и Neon БАСТА
// аст ва `PrismaClient` бо `P1001` меафтад. `@neondatabase/serverless` бо
// HTTPS кор мекунад ва мерасад. Ҳамон сабабе, ки `*-http.mjs`-и дигар доранд.
//
// БЕХАТАРӢ
// ────────
// • Пешфарз ХУШК аст — бе `--apply` чизе НАВИШТА НАМЕШАВАД, танҳо нишон медиҳад.
// • Модул бо ТАРТИБ (`order`) пайдо мешавад, на бо унвон: унвонҳои модулҳои
//   5–12 префикси «Модули N:» доранд ва тағйирёбандаанд.
// • Модуле, ки аллакай матн дорад, пешфарз даст намехӯрад (--force барои
//   бознависӣ).
//
// Иҷро:
//   cd backend
//   node prisma/seed-can-do-en-a1-http.mjs            # хушк
//   node prisma/seed-can-do-en-a1-http.mjs --apply    # менависад

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');

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

// Калид = `order`-и модул (0-асос). Матн аз мазмуни ВОҚЕИИ ҳар модул навишта
// шудааст — луғат ва грамматикаи он, на аз унвони умумӣ.
const CAN_DO = {
  0: 'Пас аз ин бахш салом дода, худро муаррифӣ карда ва номи ҳамсӯҳбатро пурсида метавонед.',
  1: 'Пас аз ин бахш синну сол, касб, шаҳр ва забони худро гуфта метавонед.',
  2: 'Пас аз ин бахш дар бораи оила ва хешовандони худ нақл карда метавонед.',
  3: 'Пас аз ин бахш то сад шумурда, вақт, рӯзи ҳафта ва моҳро гуфта метавонед.',
  4: 'Пас аз ин бахш рӯзи ҳаррӯзаи худро нақл карда ва аз корҳои дигарон пурсида метавонед.',
  5: 'Пас аз ин бахш дар тарабхона хӯрок фармоиш дода ва хӯроки дӯстдоштаи худро гуфта метавонед.',
  6: 'Пас аз ин бахш хонаи худро тасвир карда ва гуфта метавонед, ки чӣ дар куҷост.',
  7: 'Пас аз ин бахш дар мағоза харид карда, нарх пурсида ва пул супорида метавонед.',
  8: 'Пас аз ин бахш роҳро пурсида ва ба каси дигар роҳи ҷойеро нишон дода метавонед.',
  9: 'Пас аз ин бахш либос ва рангро номбар карда ва гуфта метавонед, ки кӣ чӣ пӯшидааст.',
  10: 'Пас аз ин бахш ба духтур гуфта метавонед, ки куҷоятон дард мекунад ва дар дорухона дору пурсида метавонед.',
  11: 'Пас аз ин бахш дар бораи обу ҳаво, ҳайвонот ва ҳиссиёти худ гап зада метавонед.',
};

async function main() {
  const courses = await sql`
    SELECT c.id, c.level
    FROM "Course" c
    JOIN "Language" t ON t.id = c."targetLanguageId"
    JOIN "Language" n ON n.id = c."nativeLanguageId"
    WHERE t.code = 'en' AND n.code = 'tg' AND c.level = 'A1'
  `;
  if (courses.length !== 1) {
    throw new Error(`Интизори 1 курси en→tg A1 будам, ${courses.length} ёфтам.`);
  }
  const courseId = courses[0].id;

  const modules = await sql`
    SELECT id, "order", "titleTranslated", "canDoStatement"
    FROM "Module"
    WHERE "courseId" = ${courseId} AND "isActive" = true
    ORDER BY "order" ASC
  `;
  console.log(`Курс ${courseId}: ${modules.length} модул\n`);

  let written = 0;
  let skipped = 0;
  for (const m of modules) {
    const text = CAN_DO[m.order];
    if (!text) {
      console.log(`  · order=${m.order} «${m.titleTranslated}» — матн навишта нашудааст, гузашт`);
      skipped++;
      continue;
    }
    if (m.canDoStatement && !FORCE) {
      console.log(`  = order=${m.order} аллакай матн дорад, гузашт (--force барои бознависӣ)`);
      skipped++;
      continue;
    }
    console.log(`  ${APPLY ? '✓' : '→'} order=${m.order} «${m.titleTranslated}»`);
    console.log(`      ${text}`);
    if (APPLY) {
      await sql`UPDATE "Module" SET "canDoStatement" = ${text} WHERE id = ${m.id}`;
    }
    written++;
  }

  console.log(
    `\n${APPLY ? 'Навишта шуд' : 'ХУШК — чизе навишта нашуд'}: ${written}, гузашт: ${skipped}`,
  );
  if (!APPLY) console.log('Барои навиштан: node prisma/seed-can-do-en-a1-http.mjs --apply');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
