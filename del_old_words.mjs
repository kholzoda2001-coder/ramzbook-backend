import { connect } from './prisma/_ru-fix-lib.mjs';
async function run() {
  const sql = connect();
  const res = await sql`DELETE FROM "Word" WHERE word IN ('앞', '차', '역')`;
  console.log('Deleted old words:', res);
  process.exit(0);
}
run();
