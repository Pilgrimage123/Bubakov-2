# 04: Noční konturová inverze v kvašové tmě mimo dosvit Petrolejky

**What to build:** Adaptivní konturová inverze pro noční výpravy podle ADR 0003 a ADR 0046. V nočních fázích (např. Dubnová noc, Lednová noc, Listopadová mlha) si entity v kuželu světla Petrolejky a oken roubenek ponechávají sytě černou ladovskou linku. Jakmile se strašidla ocitnou v hluboké tmě mimo světelnou zónu, jejich černá kontura se plynule změní na 1,5px křídově bílou linku na modročerném kartonu.

**Blocked by:** 01: Dvouúrovňová kaligrafická linka a ochrana siluet hordy před černou kaší

**Status:** closed

- [x] V `src/render/arenaRenderer.ts` a `src/render/storybookLightingRenderer.ts` integrovat detekci stavu osvětlení entit vůči Petrolejce a stacionárním světlům.
- [x] V `src/render/ladaRenderer.ts` implementovat křídově bílou konturovou paletu (1,5 px bílá/světle krémová linka) aplikovanou na strašidla v neosvětlených zónách.
- [x] Zajistit plynulý přechod kontury (černá ↔ křídová) při vstupu strašidla do kuželu světla bez problikávání.
- [x] Ověřit čitelnost nočních výprav na tmavém indigovém kvašovém pozadí.
- [x] Zkontrolovat testy nočního osvětlení a Stínové záštity.
