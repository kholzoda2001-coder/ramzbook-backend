const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const groups = await p.user.groupBy({
    by: ['country'],
    _count: { id: true },
  });
  console.log('Country distribution:', JSON.stringify(groups, null, 2));

  const total = await p.user.count();
  const nullCount = await p.user.count({ where: { country: null } });
  console.log(`Total users: ${total}, Without country: ${nullCount}`);
}

main().finally(() => p.$disconnect());
