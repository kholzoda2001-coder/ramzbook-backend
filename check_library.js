const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.libraryItem.findMany({
    select: {
      title: true,
      type: true,
      targetLang: true,
      nativeLang: true,
    }
  });
  console.log("Library items:", items);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
