import fs from 'node:fs';

const levelUnlocksContent = fs.readFileSync('src/data/levelUnlocks.ts', 'utf8');
const hunterUnlocksContent = fs.readFileSync('src/data/hunterUnlocks.ts', 'utf8');
const grandfatherContent = fs.readFileSync('src/data/grandfatherItems.ts', 'utf8');
const trophiesContent = fs.readFileSync('src/data/trophies.ts', 'utf8');

console.log('--- Level Unlocks ---');
const lBlocks = levelUnlocksContent.split(/\n\t(\d):\s*\{/);
for (let i = 1; i < lBlocks.length; i += 2) {
  const lvlId = lBlocks[i];
  const b = lBlocks[i+1];
  const realName = b.match(/realName:\s*"([^"]+)"/)?.[1];
  console.log(`Lvl unlock ${lvlId}: ${realName}`);
}

console.log('--- Hunter Unlocks ---');
const hKeys = ['wanderer', 'shepherd', 'korenarka', 'watchman', 'sexton', 'granny'];
for (const h of hKeys) {
  const reg = new RegExp(`${h}:\\s*\\{[\\s\\S]*?realName:\\s*"([^"]+)"[\\s\\S]*?realTitle:\\s*"([^"]+)"`);
  const m = hunterUnlocksContent.match(reg);
  console.log(`Hunter ${h}: ${m?.[1]} | ${m?.[2]}`);
}

console.log('--- Grandfather Items ---');
const gMatches = [...grandfatherContent.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*description:\s*'([^']+)'/g)];
console.log(`Grandfather items count: ${gMatches.length}`);
gMatches.slice(0, 5).forEach(m => console.log(`  ${m[1]}: ${m[2]} - ${m[4]}`));

console.log('--- Trophies ---');
const tMatches = [...trophiesContent.matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*desc:\s*"([^"]+)"/g)];
console.log(`Trophies count: ${tMatches.length}`);
tMatches.slice(0, 5).forEach(m => console.log(`  ${m[1]}: ${m[2]} - ${m[3]}`));
