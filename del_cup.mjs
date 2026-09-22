import { connect } from './prisma/_ru-fix-lib.mjs';
async function run() {
  const sql = connect();
  const res = await sql`DELETE FROM "Word" WHERE word = '컵'`;
  console.log('Deleted 컵:', res);
  process.exit(0);
}
run();
