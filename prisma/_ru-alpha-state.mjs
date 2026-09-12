// Ҳолати алифбои русӣ (ru → tg): ҳарфҳо, транскрипсия, аудио → tmp/ru-alpha.json
import { writeFileSync } from 'fs';
import { connect, RU, TG } from './_ru-fix-lib.mjs';
const sql = connect();
const rows = await sql`SELECT id,uppercase u,lowercase l,ipa,"tajikTranscription" tt,category c,"audioUrl" au,"order" o
  FROM "AlphabetLetter" WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
writeFileSync('../../tmp/ru-alpha.json', JSON.stringify(rows, null, 1));
writeFileSync('../../tmp/ru-alpha-now.json', JSON.stringify(rows.map((r) => ({ label: `${r.u} (${r.tt})`, src: r.au })), null, 1));
console.log(`навишта шуд: ${rows.length} ҳарф`);
