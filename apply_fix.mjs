import fs from 'fs';
const text = fs.readFileSync('prisma/_de-m12-content.mjs', 'utf8');

// The python script changed promptTranslated to be identical to prompt in GRAMMAR exercises.
// Let's manually replace them since there are only 8 exercises.
let fixed = text;

// Fix COMPREHENSIONS (find `export const COMPREHENSIONS = [` and replace till `export const DIALOGUE = {`)
const comps = fs.readFileSync('fix_c.mjs', 'utf8');
fixed = fixed.replace(/export const COMPREHENSIONS = \[\s*\{[\s\S]*?(?=export const DIALOGUE = \{)/, comps + '\n\n');

// Write back
fs.writeFileSync('prisma/_de-m12-content.mjs', fixed);
