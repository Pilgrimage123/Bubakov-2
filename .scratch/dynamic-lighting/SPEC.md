# Specifikace: Dynamické ladovské osvětlení (Dynamic Folk Lighting)

## Problem Statement

Ve hře *Bubákov* plyne čas výpravy přes 6 denních fází od Poledne do Úsvitu. V současnosti je však příchod noci a půlnoční hodiny reprezentován pouze plochým ztmavením celé obrazovky (`ambientTint`). Noc postrádá atmosféru tísně a folklórního šerosvitu. Lovec, jeho lucerna, posvátná Hromnička i světélkující strašidla (Bludičky) nesvítí do okolní temnoty, což oslabuje jedinečnou vizuální identitu ladovského světa a upozaďuje tematickou sílu Ponocného a světelných mechanik.

## Solution

Zavést **Ladovský šerosvitný systém osvětlení** (Stylized Folk 2D Lighting):
1. **Headless světelný model**: `GameEngine` autonomně kalkuluje aktivní světelné zdroje na bojišti (Lucerna lovce, Hromnička, Bludičky, letící ohnivé střely, blesky Svatého Eliáše a vesnická stavení).
2. **Ladovská maska šerosvitu**: Canvas vykresluje noční temnotu přes odlehčenou vyrovnávací masku s diskrétními soustřednými prstenci (cel-lit), které zachovávají čistotu Ladových inkoustových kontur namísto rozmazaného bloomu.
3. **Folklórní synergie**:
   - **Ponocný**: disponuje přirozeně větším a stabilnějším kuželem lucerny (+25 % dosah svitu).
   - **Hromnička**: prozařuje okolní tmu teplým světlem, v němž nečisté síly trpí odpuzováním a poškozením.
   - **Bludičky**: fungují jako pohyblivá světla v bažinách s vlastním namodralým svitem.
   - **Svítící oči ve tmě**: bubáci v temnotě mimo dosah lucerny mají viditelné pouze stylizované inkoustové oči, dokud nevstoupí do světla.
4. **Optimalizace a přístupnost**: Možnost přepnutí v nastavení na zjednodušený režim pro slabší zařízení (`performanceMode`).

## User Stories

1. Jako lovec chci, aby v nočních fázích (*Hluboká noc*, *Půlnoční hodina*) byla herní plocha ponořena do ladovského šerosvitu s osvětleným kruhem kolem mé postavy, abych cítil atmosféru noční výpravy.
2. Jako lovec hrající za *Ponocného* chci mít výchozí větší dosah a jas lucerny, aby má postava naplňovala svou folklórní roli nočního strážce.
3. Jako lovec chci, aby aktivní zbraň *Hromnička* viditelně rozháněla temnotu svým požehnaným plamenem.
4. Jako lovec chci, aby *Bludičky* v noci samy vyzařovaly studené namodralé světlo, abych je v temnotě rozeznal na dálku.
5. Jako lovec chci v dálce v temnotě vidět svítící oči blížících se bubáků, abych mohl včas reagovat na jejich směr příchodu (*Přepadení*).
6. Jako lovec chci, aby se při rozednění (*Kuropění & Úsvit*) temnota okamžitě rozplynula do zlatavého ranního jasu.
7. Jako hráč chci, aby vzácné odhozené předměty (Voňavé perníčky, Kovářská podkova, Truhly) jemně světélkovaly a neztrácely se v temnotě.
8. Jako hráč na mobilním zařízení či slabším notebooku chci mít možnost zapnout plynulý výkonnostní režim v nastavení bez poklesu FPS pod 60.

## Implementation Decisions

- **Datový model světel**: Typ `LightSource` v `src/types.ts` specifikující `{ id, x, y, radius, color, intensity, flickerSpeed, pulseAmount, shape }`.
- **Query v GameEngine**: Metoda `getVisibleLightSources(viewLeft, viewTop, viewRight, viewBottom)` v `src/game/engine.ts` a `src/game/lighting.ts`.
- **Offscreen Canvas Buffer**: Vykreslování masky tmy do offscreen canvasu o polovičním rozlišení (např. 0.5x) s operací `globalCompositeOperation = 'destination-out'`.
- **Ladovské prstence (Cel-lighting)**: Namísto fotorealistických gradientů se používají 2 až 3 diskrétní soustředné prstence se stylovým podáním.
- **Renderovací modul**: Samostatný soubor `src/render/lightingRenderer.ts` pro čistou separaci vykreslovacího švu.
- **Konfigurace a perzistence**: Příznak `dynamicLightingEnabled` v `MetaProgression` s přepínačem v nastavení / testovacím okně.

## Testing Decisions

- Testy ověřují generování světel v `GameEngine` ve Vitest bez závislosti na DOM/Canvas.
- Testování správné kalkulace dosahu světla pro Ponocného vs ostatní lovce.
- Testování světelné intenzity v jednotlivých fázích dne (Poledne = 0 darkness, Půlnoc = max darkness, Úsvit = 0 darkness).
- Ověření, že výkonnostní režim potlačí náročné renderování masky.

## Out of Scope

- 2D stínové polygony a raycasting překážek (příliš náročné pro Canvas 2D).
- WebGL shadery a normálové mapy textur.
