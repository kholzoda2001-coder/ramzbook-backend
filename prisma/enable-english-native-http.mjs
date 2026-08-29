// Англисиро ҳамчун забони МОДАРӢ (= забони интерфейс) фаъол мекунад.
//
// Чаро: дар RAMZ «забони модарӣ» ва «забони интерфейс» як чизанд
// (LocaleProvider дар frontend/lib/l10n/app_localizations.dart). Экрани
// онбординг ва варақаи интихоби забон дар профил рӯйхати худро аз
// GET /api/mobile/languages/native мегиранд, ки танҳо забонҳои
// `isActive && canBeNative`-ро бармегардонад. Барои `en` парчами canBeNative
// хомӯш буд, бинобар ин strings_en.dart дар апп мавҷуд буду ба он гузаштан
// ғайриимкон.
//
// Prisma аз ин мошин ба Neon намерасад (порти 5432 баста), пас драйвери
// HTTP-и Neon истифода мешавад — ниг. [[ramz-db-scripts-local]].
//
//   node prisma/enable-english-native-http.mjs --dry
//   node prisma/enable-english-native-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const DRY = process.argv.includes('--dry');

const show = async (label) => {
  const [r] = await sql.query(
    `SELECT code, name, "nativeName", flag, "canBeNative", "canBeTarget", "isActive", "order"
       FROM "Language" WHERE code = 'en'`);
  if (!r) { console.log(`${label}: сатри en ЁФТ НАШУД`); return null; }
  console.log(`${label}: name=${r.name} nativeName=${r.nativeName} flag=${r.flag} canBeNative=${r.canBeNative} canBeTarget=${r.canBeTarget} isActive=${r.isActive} order=${r.order}`);
  return r;
};

const before = await show('ПЕШ ');
if (!before) process.exit(1);

if (DRY) {
  console.log('\n--dry: ҳеҷ чиз навишта нашуд.');
  process.exit(0);
}

// Танҳо ҳамин як парчам. `nativeName`, `flag` ва `isActive` аллакай дурустанд,
// ва ба `order` даст намерасем: ҳамон як майдон рӯйхати забони ҲАДАФро низ
// мураттаб мекунад, ки дар он англисӣ бояд якум монад.
await sql.query(
  `UPDATE "Language" SET "canBeNative" = true WHERE code = 'en'`);

// Драйвери HTTP барои UPDATE массиви холӣ бармегардонад (rowCount нест) —
// натиҷа бо хониши дубора санҷида мешавад, на аз худи UPDATE.
const after = await show('БАЪД');
console.log(after?.canBeNative ? '\n✅ англисӣ ҳоло забони модарӣ/интерфейс шуда метавонад' : '\n❌ тағйир ба амал наомад');
