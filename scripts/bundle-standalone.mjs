import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

if (!fs.existsSync(distDir) || !fs.existsSync(path.resolve(distDir, 'index.html'))) {
  console.log('Running vite build first...');
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Collect all CSS from dist/assets
let combinedCss = '';
const assetsDir = path.resolve(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  for (const file of assetFiles) {
    if (file.endsWith('.css')) {
      const filePath = path.resolve(assetsDir, file);
      console.log(`Found CSS asset: ${file}`);
      combinedCss += fs.readFileSync(filePath, 'utf-8') + '\n';
    }
  }
}

// Collect all JS from dist/assets
let combinedJs = '';
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  for (const file of assetFiles) {
    if (file.endsWith('.js')) {
      const filePath = path.resolve(assetsDir, file);
      console.log(`Found JS asset: ${file}`);
      combinedJs += fs.readFileSync(filePath, 'utf-8') + '\n';
    }
  }
}

// Escape any premature closing script tags in JS safely without regex substitution bugs
const safeJs = combinedJs.replace(/<\/script/gi, () => '<\\/script');

const gameDocComment = `<!--
=============================================================================
BUBÁKOV – ANIMOVANÁ LADOVSKÁ EDICE (KOMPLETNÍ OFFLINE HRA)
Josef Lada Roguelike Survival Game

Tento soubor obsahuje celou, 100% samostatnou a spustitelnou hru:
- Kompletní herní smyčka a fyzika
- Všichni 4 venkovští lovci (Poutník, Pasáček, Bába kořenářka, Ponocný)
- 32 lidových monster a velcí bossové (Pekelný Čert, Půlnoční Hejkal, Skalní obr)
- Kompletní arzenál zbraní a vylepšení
- Zvukový syntezátor (Web Audio API)
- Grafický kreslící engine ve stylu Josefa Lady (HTML5 Canvas 2D)
- Vesnice Bubákov, Bestiář a Síň slávy

JAK SPUSTIT TENTO SOUBOR:
Pokud má tento soubor příponu .txt, jednoduše jej přejmenujte na .html (např. bubakov.html)
a otevřete v libovolném moderním webovém prohlížeči (Chrome, Firefox, Edge, Safari).
Ke hraní NENÍ potřeba žádné internetové připojení ani žádný server!
=============================================================================
-->`;

// Construct pristine standalone HTML directly without any risky string.replace calls
const finalHtml = `<!doctype html>
${gameDocComment}
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Bubákov – Animovaná ladovská edice</title>
    <meta name="description" content="Přežijte noc ve světě venkovského děsu. Hra inspirovaná ilustracemi Josefa Lady kompletně v češtině." />
    <meta property="og:title" content="Bubákov – Animovaná ladovská edice" />
    <meta property="og:description" content="Přežijte noc ve světě venkovského děsu. Hra inspirovaná ilustracemi Josefa Lady kompletně v češtině." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Eczar:wght@500;700;800;900&display=swap" rel="stylesheet">
    <style>
${combinedCss}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${safeJs}
    </script>
  </body>
</html>`;

// Write to both public/ and dist/
const standaloneHtmlPathInPublic = path.resolve(publicDir, 'bubakov_hra_ladovska_edice.html');
const standaloneHtmlPathInDist = path.resolve(distDir, 'bubakov_hra_ladovska_edice.html');
const standaloneTxtPathInPublic = path.resolve(publicDir, 'bubakov_hra_ladovska_edice.txt');
const standaloneTxtPathInDist = path.resolve(distDir, 'bubakov_hra_ladovska_edice.txt');

fs.writeFileSync(standaloneHtmlPathInPublic, finalHtml, 'utf-8');
fs.writeFileSync(standaloneHtmlPathInDist, finalHtml, 'utf-8');
fs.writeFileSync(standaloneTxtPathInPublic, finalHtml, 'utf-8');
fs.writeFileSync(standaloneTxtPathInDist, finalHtml, 'utf-8');

console.log(`Standalone game bundled successfully!`);
console.log(`Size: ${(Buffer.byteLength(finalHtml, 'utf-8') / 1024).toFixed(1)} KB`);
console.log(`Saved to:`);
console.log(` - ${standaloneHtmlPathInPublic}`);
console.log(` - ${standaloneTxtPathInPublic}`);
console.log(` - ${standaloneHtmlPathInDist}`);
console.log(` - ${standaloneTxtPathInDist}`);
