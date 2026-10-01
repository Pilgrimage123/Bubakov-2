import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

console.log('Building clean unminified assets with Vite...');
// Always build unminified so that the code in the standalone file has full variable names and comments
execSync('npx vite build --minify false', { cwd: rootDir, stdio: 'inherit' });

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Collect all original source files from the project for AI models (Claude) & developers
function collectSourceFiles(dir, baseDir = rootDir) {
  const result = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        Object.assign(result, collectSourceFiles(fullPath, baseDir));
      }
    } else if (entry.isFile()) {
      if (/\.(tsx?|jsx?|css|html|json|md)$/i.test(entry.name) && !relPath.startsWith('dist/') && !relPath.startsWith('public/')) {
        result[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
  }
  return result;
}

const sourceTree = collectSourceFiles(path.resolve(rootDir, 'src'));
sourceTree['DESIGN_PRINCIPLES.md'] = fs.readFileSync(path.resolve(rootDir, 'DESIGN_PRINCIPLES.md'), 'utf-8');
sourceTree['package.json'] = fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8');
sourceTree['index.html'] = fs.readFileSync(path.resolve(rootDir, 'index.html'), 'utf-8');

console.log(`Collected ${Object.keys(sourceTree).length} original pristine source files.`);

// 2. Collect CSS from dist/assets
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

// 3. Collect JS from dist/assets (built with minify: false)
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

// Safely escape premature script closings
const safeJs = combinedJs.replace(/<\/script/gi, () => '<\\/script');
const safeSourcesJson = JSON.stringify(sourceTree, null, 2).replace(/<\/script/gi, () => '<\\/script');

const gameDocComment = `<!--
=============================================================================
BUBÁKOV – ANIMOVANÁ LADOVSKÁ EDICE (KOMPLETNÍ OFFLINE HRA A ZDROJOVÝ BALÍK)
Josef Lada Roguelike Survival Game
=============================================================================
TENTO SOUBOR JE 100% KOMPLETNÍM BALÍKEM OBSAHUJÍCÍM:
1. PŘÍMO SPOUSTITELNOU OFFLINE HRU (žádná instalace, internet ani server).
2. NEMINIFIKOVANÝ, ČISTÝ A ČITELNÝ BĚHOVÝ KÓD (s plnými názvy proměnných).
3. KOMPLETNÍ PŮVODNÍ ZDROJOVÉ KÓDY (TypeScript, React, CSS) pro AI (Claude) i vývojáře.
4. DETAILNÍHO PRŮVODCE ÚPRAVAMI A ARCHITEKTUROU HRY.

-----------------------------------------------------------------------------
PŘÍRUČKA PRO AI MODELY (CLAUDE, GPT) A VÝVOJÁŘE K ÚPRAVÁM HRY
-----------------------------------------------------------------------------
Tento soubor je optimalizován tak, aby na něm mohl okamžitě pracovat Claude,
libovolný AI asistent nebo lidský vývojář v jakémkoliv textovém editoru (VS Code,
Sublime, Notepad++).

JAK JE HRA ARCHITEKTONICKY STRUKTUROVÁNA:
- Canvas 2D Renderer (Ladovský styl):
  Vykresluje svět, lovce, monstra, doškové chalupy, sníh a podzimní listí.
  Charakteristické rysy: silné tušové kontury (#1c1815), noční akvarely,
  kreslené stíny na zemi a lidové klobouky/kabátce.
  Hledej v kódu: 'drawLadaHunter', 'drawLadaEnemy', 'drawLadaEnvironment'.

- Zbraně a munice (11 lidových zbraní):
  Buchty s povidly, Hůl poutníka, Vidle na hnůj, Sudlice, Cep husitský,
  Koření báby, Sněhová koule, Posvícenský koláč, Bramborový prak,
  Roj divokých včel, Svěcená voda.
  Hledej v kódu: 'WEAPONS', 'WEAPON_UNLOCKS', 'fireWeapon', 'updateProjectiles'.

- Výpravy a úrovně (6 ladovských úrovní):
  Hrusická náves a rybník (1), Starý hřbitov a Hrusický hvozd (2),
  Ladovská zima na Melechově (3), Staré hamry a Čertův mlýn (4),
  Pustá Hláska a Zlenické podhradí (5), Dračí sluj pod Melechovskou skálou (6).
  Hledej v kódu: 'GAME_LEVELS', 'LEVEL_ORDER', 'levelProgress'.

- Bestiář a nepřátelé (42 lidových monster a velcí bossové pro všech 6 úrovní):
  Rarášek, Rybniční žabka, Vodníček, Polednice, Hastrman, Čert s vidlemi,
  Bludička, Meluzína, Noční můra, Půlnoční Hejkal, Kostlivec, Černý pes,
  Ohnivý kohout, Divoženka, Skalní obr, Zbojník z hamrů, Jiskřivec, Ohnivý pes,
  Bílá paní, Zbrojnoš, Prokletý Mlynář, Bezhlavý rytíř, Prokletý Sněhulák,
  Tříhlavý líný Drak a další.
  Hledej v kódu: 'ENEMIES', 'ENEMY_POINTS', 'spawnEnemy', 'updateEnemies'.

- Herní smyčka a fyzika:
  Vzdálenosti, kolize střel s nepřáteli, sběr dukátů a kvasnic, poškození,
  zkušenostní úrovně a vývojové stromy.
  Hledej v kódu: 'updateGame', 'checkCollisions', 'collectExperience'.

- Zvukový syntezátor (Web Audio API):
  Procedurální venkovské zvuky (housle, basa, píšťala, dudy, harmonika, rány).
  Ke hraní zvuků nepotřebuje externí MP3/WAV soubory!
  Hledej v kódu: 'sound.', 'createOscillator', 'initAudio'.

- Vesnice Bubákov a strom vylepšení:
  Hospoda U Černého kocoura, chalupy, kovárna, bylinkářství, kaplička.
  Hledej v kódu: 'VILLAGE_BUILDINGS', 'VillageView'.

KDE NAJÍT PŮVODNÍ ZDROJOVÉ SOUBORY (ORIGINAL TYPESCRIPT SOURCES):
- Všechny soubory projektu (App.tsx, ladaRenderer.ts, types.ts, audio.ts,
  všechny data soubory v src/data/) jsou uloženy v JSON formátu níže ve značce:
  <script id="bubakov-source-tree" type="application/json">
- V konzoli prohlížeče lze kdykoliv zavolat:
  window.BUBAKOV.exportSources() -> stáhne kompletní balík původních zdrojáků!
- Kód je také přímo přístupný v objektu 'window.BUBAKOV.sources'.

JAK HRU SPUSTIT Z TOHOTO SOUBORU:
Pokud má tento soubor příponu .txt, přejmenujte jej na .html (např. bubakov.html)
a otevřete dvojklikem v prohlížeči (Chrome, Firefox, Edge, Safari).
Běží ihned a bez internetu!
=============================================================================
-->`;

// Construct pristine standalone HTML directly
const finalHtml = `<!doctype html>
${gameDocComment}
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Bubákov – Animovaná ladovská edice (Kompletní hra & Zdrojový kód)</title>
    <meta name="description" content="Přežijte noc ve světě venkovského děsu. Hra inspirovaná ilustracemi Josefa Lady se všemi zdrojovými kódy pro úpravy." />
    <meta property="og:title" content="Bubákov – Animovaná ladovská edice" />
    <meta property="og:description" content="Přežijte noc ve světě venkovského děsu. Hra inspirovaná ilustracemi Josefa Lady kompletně v češtině." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <style>
${combinedCss}
    </style>
  </head>
  <body>
    <div id="root"></div>

    <!-- PŮVODNÍ STRUKTUROVANÉ ZDROJOVÉ KÓDY PRO AI (CLAUDE) A VÝVOJÁŘE -->
    <script id="bubakov-source-tree" type="application/json">
${safeSourcesJson}
    </script>

    <!-- NÁSTROJE PRO EXPORT A INSPEKCI ZDROJOVÝCH KÓDŮ -->
    <script>
      (function() {
        try {
          const raw = document.getElementById('bubakov-source-tree').textContent;
          window.BUBAKOV_SOURCES = JSON.parse(raw);
          window.BUBAKOV = {
            sources: window.BUBAKOV_SOURCES,
            exportSources: function() {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.BUBAKOV_SOURCES, null, 2));
              const dlAnchor = document.createElement('a');
              dlAnchor.setAttribute("href", dataStr);
              dlAnchor.setAttribute("download", "bubakov_original_source_code.json");
              document.body.appendChild(dlAnchor);
              dlAnchor.click();
              dlAnchor.remove();
              console.log("✅ Původní zdrojové kódy Bubákova úspěšně exportovány!");
            },
            help: function() {
              console.log("%c🏰 BUBÁKOV – LADOVSKÁ EDICE: VÝVOJÁŘSKÁ KONZOLE", "font-size:16px;color:#d9a036;font-weight:bold;");
              console.log("K dispozici jsou tyto vývojářské nástroje:");
              console.log("- window.BUBAKOV.sources : Strom všech původních TypeScript/React souborů");
              console.log("- window.BUBAKOV.exportSources() : Stáhne všechny zdrojáky jako JSON balík");
              console.log("Kód hry je v tomto souboru neminifikovaný – lze v něm vyhledávat a přímo jej upravovat.");
            }
          };
          console.log("%c🏰 BUBÁKOV: Kompletní offline hra i zdrojové kódy načteny! Zadejte BUBAKOV.help() pro nápovědu.", "font-size:13px;color:#22c55e;font-weight:bold;");
        } catch(e) {
          console.warn("Chyba inicializace BUBAKOV_SOURCES:", e);
        }
      })();
    </script>

    <!-- SPUSTITELNÝ NEMINIFIKOVANÝ KÓD HRY S PLNOU ČITELNOSTÍ -->
    <script>
${safeJs}
    </script>
  </body>
</html>`;

function assertStandaloneOffline(html) {
  const externalResourcePattern = /(?:href|src)=["']https?:\/\/|@import[^;]*https?:\/\/|url\\(\\s*["']?https?:\\/\\//i;
  if (externalResourcePattern.test(html)) {
    throw new Error('FATAL: Standalone bundle contains an external network resource. Offline contract requires all runtime assets to be self-contained.');
  }
}

assertStandaloneOffline(finalHtml);

const finalSize = Buffer.byteLength(finalHtml, 'utf-8');
if (finalSize < 200000) {
  throw new Error(`FATAL: Standalone bundle size is only ${finalSize} bytes (< 200 KB)! Standalone file MUST be totally complete!`);
}
if (!finalHtml.includes('id="root"') || !finalHtml.includes('<!doctype html>')) {
  throw new Error('FATAL: Standalone bundle is missing essential HTML structure!');
}

// Write to both public/ and dist/
const standaloneHtmlPathInPublic = path.resolve(publicDir, 'bubakov_hra_ladovska_edice.html');
const standaloneHtmlPathInDist = path.resolve(distDir, 'bubakov_hra_ladovska_edice.html');
const standaloneTxtPathInPublic = path.resolve(publicDir, 'bubakov_hra_ladovska_edice.txt');
const standaloneTxtPathInDist = path.resolve(distDir, 'bubakov_hra_ladovska_edice.txt');

fs.writeFileSync(standaloneHtmlPathInPublic, finalHtml, 'utf-8');
fs.writeFileSync(standaloneHtmlPathInDist, finalHtml, 'utf-8');
fs.writeFileSync(standaloneTxtPathInPublic, finalHtml, 'utf-8');
fs.writeFileSync(standaloneTxtPathInDist, finalHtml, 'utf-8');

console.log(`\n======================================================`);
console.log(`🎉 Standalone complete game & source package generated!`);
console.log(`Size: ${(finalSize / 1024).toFixed(1)} KB`);
console.log(`Saved to:`);
console.log(` - ${standaloneHtmlPathInPublic}`);
console.log(` - ${standaloneTxtPathInPublic}`);
console.log(` - ${standaloneHtmlPathInDist}`);
console.log(` - ${standaloneTxtPathInDist}`);
console.log(`======================================================\n`);
