import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const [me] = await sql`SELECT id, email FROM "User" WHERE email = ${'kholzoda2001@gmail.com'} LIMIT 1`;
if (!me) { console.error('корбар ёфт нашуд'); process.exit(1); }
const token = jwt.sign(
  { userId: me.id, tokenType: 'access' },
  env.JWT_SECRET,
  { subject: me.id, expiresIn: '2h', issuer: 'ramz-api', audience: 'ramz-mobile' },
);
console.log(token);
