import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.module.findMany({where: {order: 5}}).then(res => {
  if (res.length > 0) {
    console.log('Exists: ' + res.length);
    prisma.module.deleteMany({where: {order: 5}}).then(() => {
      console.log('Deleted successfully.');
      prisma.$disconnect();
    });
  } else {
    console.log('Not found');
    prisma.$disconnect();
  }
});
