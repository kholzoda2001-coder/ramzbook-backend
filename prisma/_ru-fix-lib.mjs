// Абзорҳои муштарак барои скриптҳои ислоҳи курси РУСӢ (Фазаи 1).
//
// Чаро драйвери HTTP, на Prisma: аз мошини корӣ порти TCP 5432 ба Neon баста
// аст (`P1001`), вале HTTPS кор мекунад. Ниг. [[ramz-db-scripts-local]].
//
// ДУ ДОМИ драйвери HTTP, ки ин ҷо ҳал шудаанд:
//   1) `UPDATE` массиви ХОЛӢ бармегардонад — `rowCount` НЕСТ. Пас ҳар скрипт
//      шумораро бо SELECT-и ҷудогона (before/after) месанҷад, на аз натиҷа.
//   2) Ҳар скрипт ИДЕМПОТЕНТ аст: дубора иҷро кардан ҳеҷ чизро дигар намекунад
//      ва «0 тағйирот» мегӯяд, на хато.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

export const RU = 'cmpqk40yz00009rhl1uazdfi3'; // Language.code = 'ru'
export const TG = 'cmpk1cr9o0000bo0h1mheyoad'; // Language.code = 'tg'
export const COURSE_RU_A1 = 'cmq95o7ic0001qsy5l76202bw';

export function connect() {
  const env = Object.fromEntries(
    readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL дар .env ёфт нашуд');
  return neon(env.DATABASE_URL);
}

/** `--apply` = навиштан. Бе он — танҳо намоиш (dry-run), ҳеҷ навиштан нест. */
export const APPLY = process.argv.includes('--apply');

export function banner(title) {
  console.log('\n' + '═'.repeat(72));
  console.log(`  ${title}`);
  console.log(`  Реҷа: ${APPLY ? '🔴 APPLY (ба база навишта мешавад)' : '🟢 DRY-RUN (танҳо намоиш)'}`);
  console.log('═'.repeat(72) + '\n');
}

export function done(changed, note = '') {
  console.log('\n' + '─'.repeat(72));
  if (!APPLY) {
    console.log(`  DRY-RUN: ${changed} тағйирот ТАЙЁР аст. Барои иҷро: --apply`);
  } else {
    console.log(`  ✅ Иҷро шуд: ${changed} тағйирот.`);
  }
  if (note) console.log(`  ${note}`);
  console.log('─'.repeat(72) + '\n');
}
