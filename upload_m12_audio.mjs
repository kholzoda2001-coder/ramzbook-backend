import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const WORK = 'tmp/de-m12-audio';
const items = JSON.parse(readFileSync(`${WORK}/items.json`, 'utf8'));
const TABLE = { word: 'Word', example: 'GrammarExample', line: 'DialogueLine', passage: 'ComprehensionExercise' };

import { SignJWT } from 'jose';

async function main() {
  const token = await new SignJWT({ username: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  let ok = 0;
  for (const j of items) {
    try {
      const buf = readFileSync(`${WORK}/${j.id}.mp3`);
      const { url } = await put(`de_m12_${j.id}.mp3`, buf, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
        contentType: 'audio/mpeg'
      });
      const body = { url };
      if (!body.url) {
        console.log(`❌ ${j.text.slice(0, 30)}: No url in response`);
        continue;
      }
      
      // Determine kind from DB by looking up the ID in all tables since we don't have j.kind saved in items.json
      // Wait, j.kind is NOT in items.json! Let's check which table has the ID.
      let found = false;
      for (const table of Object.values(TABLE)) {
         const res = await sql(`UPDATE "${table}" SET "audioUrl"='${body.url}' WHERE id='${j.id}' RETURNING id`);
         if (res.length > 0) {
            found = true;
            break;
         }
      }
      if (found) {
        ok++;
        console.log(`✅ Uploaded ${ok}/${items.length}: ${j.text.slice(0, 30)}`);
      } else {
        console.log(`❌ ${j.id} not found in any table for: ${j.text.slice(0, 30)}`);
      }
    } catch (e) {
      console.log(`❌ Error processing ${j.id}: ${e.message}`);
    }
  }
  console.log(`Done! ${ok}/${items.length} uploaded.`);
}
main();
