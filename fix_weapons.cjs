const fs = require('fs');
let content = fs.readFileSync('src/data/weapons.ts', 'utf8');
content = content.replace(/const count = Math\.max\(1, (.*?) \+ stats\.projectileCount\);/g, 'const count = Math.max(1, Math.round(($1 + stats.projectileCount) * (stats.projectileCountMult || 1)));');
fs.writeFileSync('src/data/weapons.ts', content);
