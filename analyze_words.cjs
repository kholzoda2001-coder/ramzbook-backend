const fs = require('fs');
const content = fs.readFileSync('scripts/seed_a1_en_tg.cjs', 'utf8');

// Split by lessons
const lessonBlocks = content.split('skillType:');
const results = [];

for (let i = 1; i < lessonBlocks.length; i++) {
  const block = lessonBlocks[i];
  // Get title
  const titleMatch = block.match(/title:\s*'([^']+)'/);
  const title = titleMatch ? titleMatch[1] : 'Unknown-' + i;
  // Count word entries
  const wordCount = (block.match(/\{ word:/g) || []).length;
  if (wordCount > 0) {
    const warn = wordCount > 10 ? '⚠️ ЗИЁД' : wordCount < 5 ? '⚡ КАМ' : '✅ OK';
    results.push({ title, wordCount, warn });
  }
}

console.log('\n=== ШУМОРАИ КАЛИМА ДАР ҲАР ДАРС ===\n');
results.forEach(r => {
  const bar = '█'.repeat(r.wordCount);
  console.log(r.wordCount + '  ' + r.warn + '  ' + bar + '  ' + r.title);
});

const counts = results.map(r => r.wordCount);
console.log('\n=== ОМОР ===');
console.log('Дарсҳои умумӣ:', results.length);
console.log('Максимум калима:', Math.max(...counts));
console.log('Минимум калима:', Math.min(...counts));
console.log('Миёна:', (counts.reduce((a,b)=>a+b,0)/counts.length).toFixed(1));
console.log('>10 калима (зиёд):', counts.filter(x => x > 10).length, 'дарс');
console.log('8-10 калима (қабул):', counts.filter(x => x >= 8 && x <= 10).length, 'дарс');
console.log('5-7 калима (беҳтарин):', counts.filter(x => x >= 5 && x < 8).length, 'дарс');
console.log('<5 калима (кам):', counts.filter(x => x < 5).length, 'дарс');
