const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeAlphabetUnit() {
  const modules = await prisma.module.findMany();
  
  const alphabetModules = modules.filter(m => m.title.toLowerCase().includes('alphabet'));
  
  if (alphabetModules.length === 0) {
    console.log('No alphabet modules found in DB.');
  } else {
    for (const m of alphabetModules) {
      console.log(`Deleting module: ${m.title}`);
      await prisma.module.delete({ where: { id: m.id } });
    }
    console.log('Deleted alphabet modules from DB.');
  }
}

removeAlphabetUnit().finally(() => prisma.$disconnect());
