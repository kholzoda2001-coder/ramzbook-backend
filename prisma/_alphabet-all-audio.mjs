// Ҳамаи алифбоҳо дар продакшн: ҳар ҷуфти забон, шумораи ҳарф, аудио дорад/не.
import { writeFileSync } from 'fs';
import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const rows = await sql`SELECT t.code tc, n.code nc, t."isActive"::text ta, a.uppercase u, a."audioUrl" au
  FROM "AlphabetLetter" a JOIN "Language" t ON t.id=a."targetLanguageId" JOIN "Language" n ON n.id=a."nativeLanguageId"
  ORDER BY t.code, n.code, a."order"`;
writeFileSync('../../tmp/alphabet-all.json', JSON.stringify(rows));
console.log('ҳарфҳо дар база:', rows.length);
