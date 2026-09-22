import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const BASE = 'https://admin.ramz.tj';
const CHECK_ONLY = process.argv.includes('--check');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const L = [
  ['A', 'a', '/a/', 'а', 'vowel'],
  ['B', 'b', '/bɛ/', 'бэ', 'consonant'],
  ['C', 'c', '/dʒɛ/', 'ҷэ', 'consonant'],
  ['Ç', 'ç', '/tʃɛ/', 'чэ', 'consonant'],
  ['D', 'd', '/dɛ/', 'дэ', 'consonant'],
  ['E', 'e', '/ɛ/', 'э', 'vowel'],
  ['F', 'f', '/fɛ/', 'фэ', 'consonant'],
  ['G', 'g', '/ɟɛ/', 'гэ', 'consonant'],
  ['Ğ', 'ğ', '/ju.mu.ʃak ɟɛ/', 'юмушак гэ', 'consonant'],
  ['H', 'h', '/hɛ/', 'ҳэ', 'consonant'],
  ['I', 'ı', '/ɯ/', 'и-и сахт (ы)', 'vowel'],
  ['İ', 'i', '/i/', 'и', 'vowel'],
  ['J', 'j', '/ʒɛ/', 'жэ', 'consonant'],
  ['K', 'k', '/cɛ/', 'кэ', 'consonant'],
  ['L', 'l', '/lɛ/', 'лэ', 'consonant'],
  ['M', 'm', '/mɛ/', 'мэ', 'consonant'],
  ['N', 'n', '/nɛ/', 'нэ', 'consonant'],
  ['O', 'o', '/o/', 'о', 'vowel'],
  ['Ö', 'ö', '/œ/', 'о-и нарм', 'vowel'],
  ['P', 'p', '/pɛ/', 'пэ', 'consonant'],
  ['R', 'r', '/ɾɛ/', 'рэ', 'consonant'],
  ['S', 's', '/sɛ/', 'сэ', 'consonant'],
  ['Ş', 'ş', '/ʃɛ/', 'шэ', 'consonant'],
  ['T', 't', '/tɛ/', 'тэ', 'consonant'],
  ['U', 'u', '/u/', 'у', 'vowel'],
  ['Ü', 'ü', '/y/', 'у-и нарм', 'vowel'],
  ['V', 'v', '/vɛ/', 'вэ', 'consonant'],
  ['Y', 'y', '/jɛ/', 'йэ', 'consonant'],
  ['Z', 'z', '/zɛ/', 'зэ', 'consonant'],
];

async function run() {
  const sql = neon(env.DATABASE_URL);
  
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const tgLang = await sql`SELECT id FROM "Language" WHERE code='tg'`;
  if (!trLang.length || !tgLang.length) throw new Error("Languages not found");
  
  const TR = trLang[0].id;
  const TG = tgLang[0].id;
  
  // Wipe existing alphabet to be safe
  await sql`DELETE FROM "AlphabetLetter" WHERE "targetLanguageId"=${TR} AND "nativeLanguageId"=${TG}`;
  
  let ok = 0;
  for (const [up, low, ipa, tgTrans, cat] of L) {
    if (!CHECK_ONLY) {
      await sql`INSERT INTO "AlphabetLetter" ("id", "targetLanguageId", "nativeLanguageId", "uppercase", "lowercase", "ipa", "tajikTranscription", "category") 
      VALUES (gen_random_uuid()::text, ${TR}, ${TG}, ${up}, ${low}, ${ipa}, ${tgTrans}, ${cat})`;
      ok++;
    } else {
      console.log(`✓ ${up} ${low} [${cat}] -> ${ipa} / ${tgTrans}`);
    }
  }
  
  if (!CHECK_ONLY) {
    console.log(`Inserted ${ok} letters.`);
    await sql`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version','"1"',NOW()) ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`;
  }
}
run().catch(console.error);
