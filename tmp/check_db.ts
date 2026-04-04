import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      modules: { include: { pages: true } },
      bookChapters: { include: { vocabularyItems: true } },
    }
  });
  console.dir(products, { depth: null });
  await prisma.$disconnect();
}
main();
