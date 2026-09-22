import { connect, COURSE_DE_A1 } from './prisma/_de-fix-lib.mjs';

const sql = connect();
await sql`DELETE FROM "Module" WHERE "courseId"=${COURSE_DE_A1} AND "order"=11`;
console.log('Deleted Module 12');
process.exit(0);
