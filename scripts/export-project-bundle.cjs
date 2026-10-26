const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const defaultOutDir = path.join(process.env.HOME || process.env.USERPROFILE || rootDir, 'Documents');
const outputPath = process.argv[2] || path.join(defaultOutDir, 'cely_bubakov.txt');

const configFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'eslint.config.js',
  'GLOSSARY.md'
];

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeRelPath(absPath) {
  return path.relative(rootDir, absPath).replace(/\\/g, '/');
}

// Doc files
const docFiles = [
  ...getFilesRecursively(path.join(rootDir, 'docs', 'adr')),
  ...getFilesRecursively(path.join(rootDir, 'docs', 'specs'))
]
  .filter(f => f.endsWith('.md'))
  .map(normalizeRelPath);

// Src files
const devModals = new Set([
  'src/components/AnimationTesterModal.tsx',
  'src/components/TestModeModal.tsx',
  'src/components/SettingsDevModal.tsx',
  'src/components/KronikaChanges.tsx'
]);

const srcFiles = getFilesRecursively(path.join(rootDir, 'src'))
  .map(normalizeRelPath)
  .filter(rel => {
    if (rel.startsWith('src/i18n/locales/')) return false;
    if (devModals.has(rel)) return false;
    if (rel.endsWith('.test.ts') || rel.endsWith('.test.tsx')) return false;
    return true;
  });

// Performance verification tests
const perfTests = [
  'tests/zeroAllocationRender.test.ts',
  'tests/arenaRenderer.test.ts',
  'tests/chunkCache.test.ts',
  'tests/glyphAtlas.test.ts',
  'tests/downscaledLighting.test.ts'
];

const selectedFiles = [
  ...configFiles,
  ...docFiles,
  ...srcFiles,
  ...perfTests
];

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let count = 0;
const stream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

for (const relPath of selectedFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    stream.write(`\n====================\nSOUBOR: ${relPath}\n====================\n\n`);
    const content = fs.readFileSync(fullPath, 'utf8');
    stream.write(content);
    if (!content.endsWith('\n')) {
      stream.write('\n');
    }
    count++;
  }
}

stream.end(() => {
  const stat = fs.statSync(outputPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`Export dokoncen: ${outputPath}`);
  console.log(`Zahrnuto souboru: ${count}`);
  console.log(`Velikost: ${sizeMb} MB (${stat.size} bajtu)`);
});
