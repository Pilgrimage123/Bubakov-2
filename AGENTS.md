# Agent Instructions

## Agent skills

### Issue tracker

GitHub Issues via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.

### Project export & bundle

Clean code bundle for performance analysis and audits. Excludes binaries, lockfiles, changelogs, dev modals, and generic unit tests, exporting to `Documents/cely_bubakov.txt` via `scripts/export-project-bundle.ps1`. See `docs/agents/project-bundle.md`.

### Asset management & public directory guardrails

Never store temporary raster images, concept art, or Google AI Studio prototyping outputs in `public/assets/` or `public/assets/aistudio/`. All in-game character and boss graphics must be authentic vector SVGs (Smart SVG components or Ladovské canvas procedural routines) or canonical icons in `public/images/`. Any prototype images from external tools must never be committed to `public/` or shipped with Vite builds.

### Zásady vykreslování bossů a strašidel v bojové aréně (Canvas 2D)

1. **Mobilní bojový postoj (žádné židle ani pivo v aréně)**: Nepřátelé a bossové v bojové aréně nikdy nesedí na židli/štokrleti a nepijí pivo z korbelů, pokud to výslovně nevyžaduje jejich specifická bojová mechanika (např. *Masopustní Bakchus*). Z hospodské scény (`LadaCoverScene.tsx`) se do arény přenáší výtvarná úroveň (živá okulární mimika, vrstvený lidový oděv, záplaty, lemování, pihy), nikoliv sedící či připíjející pózy od stolu.
2. **Anatomický úchop zbraní a žádné levitující překryvy (`drawOverlayVfx`)**: Zbraně bossů (dubový kyj obra, pekelný trojzubec čerta, vrbový proutek hastrmana, pomlázka a lucerna bubáka) musí být vykresleny přímo uvnitř procedurální rutiny postavy a pevně sevřeny článkovanými pažemi (`rameno -> loket -> zápěstí`) s vykreslenou dlaní, palcem a 4 prsty. Nikdy nepoužívej duplicitní levitující zbraně nebo šipkové tvary v `drawOverlayVfx` (`src/render/ladaRenderer.ts`), které nejsou propojeny s rukama postavy.
3. **Integrované přirozené zbraně (Barbuchova žihadla)**: Pokud postava útočí částí vlastního těla (např. *Strachem nacpaný Barbucha*), drápy (`černá žihadla`) musí plynule vyrůstat přímo z článkovaných prstů jejích dlaní a při fázi `strike` z konečků prstů vystřelovat vpřed jako létající bodce se stopami rychlosti.
4. **Korektní rozlišení `idle` vs. `walk` (`vx`)**: Pohybový resolver (`resolveShowcaseMotion`) musí rozlišovat klidový postoj (`vx === 0`, jemné dýchání bez kmitání nohou) a chůzi (`vx !== 0`, plný krokový cyklus), a to i v `AnimationTesterModal.tsx` (kde `enemyProxy.vx` musí odpovídat zvolenému stavu).
5. **Bezalokační 60FPS kontrakt**: Všechny procedurální rutiny na Canvasu 2D musí dodržet `createLinearGradient = 0`, `createRadialGradient = 0`, `shadowBlur = 0`, vyvážený počet `ctx.save()` / `ctx.restore()` a horizontální překlápění výhradně přes `ctx.scale(dir, 1)` (`sy > 0` při `vx < 0`).

