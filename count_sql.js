const fs = require('fs');
const p = 'c:/Users/ASUS1/AppData/Local/Temp/eb254d27-1fcf-415a-925f-5a29b6404bbb_u286694518_ebook.20260618063522.sql.gz.bbb/u286694518_ebook.sql';
const txt = fs.readFileSync(p, 'utf8');

const courseMatch = txt.match(/INSERT INTO `Course` VALUES (.*);/);
if (courseMatch) {
  const rows = courseMatch[1].split('),(');
  console.log('Courses count:', rows.length);
}

const moduleMatch = txt.match(/INSERT INTO `Module` VALUES (.*);/);
if (moduleMatch) {
  const rows = moduleMatch[1].split('),(');
  console.log('Modules count:', rows.length);
}
