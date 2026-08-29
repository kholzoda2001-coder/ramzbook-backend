import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
const raw = fs.readFileSync(envPath, 'utf8');
let url = null;
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (t.startsWith('#')) continue;
  const m = t.match(/^DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/);
  if (m) url = m[1];
}
if (!url) throw new Error('DATABASE_URL not found');
export const sql = neon(url);
export const q = (text, params = []) => sql.query(text, params);
