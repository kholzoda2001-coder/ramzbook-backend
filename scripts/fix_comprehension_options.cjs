/**
 * Fix comprehension question options that were double-encoded by JSON.stringify()
 * Runs against the production Hostinger DB.
 */
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const p = new PrismaClient();

const fixes = [
  { id: 'cmps2gfly0011e9tf9orff0r1', options: ['London', 'Dushanbe', 'Moscow', 'Tashkent'] },
  { id: 'cmps2gfly0012e9tfd7m4zgms', options: ['Teacher', 'Engineer', 'Doctor', 'Driver'] },
  { id: 'cmps2gfly0013e9tf6q30x1pp', options: ['Sara', 'Lola', 'Rustam', 'Karim'] },
  { id: 'cmps2gfly0014e9tfkemz2lhh', options: ['Two', 'Three', 'Four', 'Five'] },
  { id: 'cmps2gfly0015e9tfzxj4irwp', options: ['Ten', 'Twelve', 'Fifteen', 'Twenty'] },
];

async function main() {
  console.log('🔧 Fixing comprehension question options...');
  for (const fix of fixes) {
    await p.comprehensionQuestion.update({
      where: { id: fix.id },
      data: { options: fix.options },
    });
    console.log(`  ✅ ${fix.id} → [${fix.options.join(', ')}]`);
  }
  console.log('✅ All comprehension question options fixed.');
}

main().catch(console.error).finally(() => p.$disconnect());
