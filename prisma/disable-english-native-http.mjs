// Англисиро аз рӯйхати забони МОДАРӢ бармегардонад (баръакси
// enable-english-native-http.mjs).
//
// Кай лозим мешавад: парчами `canBeNative` дар БАЗА аст, пас он ФАВРАН ба
// ҳамаи аппҳои аллакай насбшуда мерасад — ҳатто ба билди кӯҳна, ки ҳанӯз
// тарҷумаи пурраи англисӣ ва ислоҳи LanguageProvider.setNative-ро надорад.
// То релизи нав дар Play/App Store паҳн нашавад, инро хомӯш нигоҳ доштан
// бехатартар аст.
//
//   node prisma/disable-english-native-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

await sql.query(`UPDATE "Language" SET "canBeNative" = false WHERE code = 'en'`);

const [r] = await sql.query(
  `SELECT code, "canBeNative", "canBeTarget", "isActive" FROM "Language" WHERE code = 'en'`);
console.log(`en: canBeNative=${r.canBeNative} canBeTarget=${r.canBeTarget} isActive=${r.isActive}`);
console.log(r.canBeNative ? '❌ ҳанӯз фаъол аст' : '✅ англисӣ дигар забони модарӣ нест');
