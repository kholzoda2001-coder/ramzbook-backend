const fs = require('fs');
const file = 'app/admin/products/new/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace \` with `
content = content.replace(/\\`/g, '`');

// Replace \$ with $
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
console.log("Fixed backticks and dollar signs!");
