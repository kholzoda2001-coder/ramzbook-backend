import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const book = await prisma.book.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      modules: {
        include: {
          pages: true
        }
      }
    }
  });

  console.dir(book, { depth: null });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
