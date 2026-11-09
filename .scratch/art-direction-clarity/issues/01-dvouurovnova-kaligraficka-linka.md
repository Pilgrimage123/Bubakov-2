# 01: Dvouúrovňová kaligrafická linka a ochrana siluet hordy před černou kaší

**What to build:** Dvouúrovňový hierarchický systém tušových kontur na 2D plátně podle ADR 0045. Lovec a jeho projektily mají trvale nejtlustší linku 3,5 px s jemným bílým kontrastním lemem. Strašidla v chumlu mají sytou vnější konturu (2,5–3 px), zatímco jejich vnitřní anatomické linky jsou zredukovány na 1px vlasovou perokresbu. Tím je zaručeno, že ani při shluku 300 strašidel nedojde ke slévání do nečitelného tmavého fleku („černé kaše“) a lovec zůstává dokonale čitelný.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Upravit základní vykreslovací štětce v `src/render/ladaRenderer.ts` pro podporu odstupňované tloušťky kontury (3,5 px lovec, 2,5–3 px vnější silueta strašidel, 1 px vnitřní detaily).
- [x] Doplnit bílý kontrastní podkres (0,75–1 px světlý lem) pod hlavní konturu lovce pro zajištění čitelnosti vůči temným běsům i nočnímu pozadí.
- [x] V procedurálním renderování shluků strašidel zajistit potlačení vnitřních silných linek při překryvu sousedících entit.
- [x] Ověřit v herní aréně a animačním testeru, že v davu 300 strašidel zůstávají siluety zřetelné a nedochází k vizuálnímu šumu.
- [x] Zajistit, že testy vizuálu a renderovacích rutin procházejí bez chyb.
