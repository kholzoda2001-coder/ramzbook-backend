import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const courses = await p.course.findMany({ select: { id: true, level: true, order: true, title: true } });
console.log(JSON.stringify(courses, null, 2));

// Fix: A1=1, A2=2, B1=3
for (const c of courses) {
  let newOrder = c.order;
  if (c.level === 'A1') newOrder = 1;
  else if (c.level === 'A2') newOrder = 2;
  else if (c.level === 'B1') newOrder = 3;
  else if (c.level === 'B2') newOrder = 4;
  else if (c.level === 'C1') newOrder = 5;
  else if (c.level === 'C2') newOrder = 6;

  if (newOrder !== c.order) {
    await p.course.update({ where: { id: c.id }, data: { order: newOrder } });
    console.log(`✅ ${c.level} order updated: ${c.order} -> ${newOrder}`);
  } else {
    console.log(`✓ ${c.level} order OK: ${c.order}`);
  }
}

await p.$disconnect();
console.log('Done!');
