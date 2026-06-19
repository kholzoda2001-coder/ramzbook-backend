const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.language.findMany()
  .then(ls => console.log(ls))
  .finally(() => p.$disconnect());
