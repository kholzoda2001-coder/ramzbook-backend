const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log("CATEGORIES:");
  console.dir(categories);

  const products = await prisma.product.findMany({
    select: { id: true, title: true, category: true, categoryId: true }
  });
  console.log("\nPRODUCTS:");
  console.dir(products);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
