import { execSync } from 'child_process';

async function main() {
  const scripts = ['b1-m2.mjs', 'b1-m3.mjs', 'b1-m4.mjs'];
  for (const s of scripts) {
    let success = false;
    for (let i = 0; i < 50; i++) {
      try {
        console.log(`\n▶️ Running ${s} (Attempt ${i + 1}/50)...`);
        execSync(`node backend/prisma/${s}`, { stdio: 'inherit' });
        success = true;
        console.log(`✅ ${s} finished successfully.`);
        break;
      } catch (err) {
        console.log(`⏳ Database might be sleeping or pool is busy. Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    if (!success) {
      console.error(`❌ Failed to run ${s} after 50 attempts.`);
      process.exit(1);
    }
    console.log(`💤 Waiting 5 seconds before the next module...`);
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log(`🎉 All modules inserted!`);
}

main();
