import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
console.table(await sql.query(`SELECT
  count(*) total,
  count(*) FILTER (WHERE name LIKE 'Test User%') test_user,
  count(*) FILTER (WHERE name LIKE '%@%') email_as_name,
  count(*) FILTER (WHERE email LIKE '%@cloudtestlabaccounts.com') cloudtestlab
  FROM "User"`));
