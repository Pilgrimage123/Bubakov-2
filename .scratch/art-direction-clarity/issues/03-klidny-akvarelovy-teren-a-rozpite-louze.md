# 03: Klidný akvarelový terén a bezkonturové rozpité stopy na podlaze

**What to build:** Vykreslování povrchových louží a zrádného terénu v souladu s pravidlem 60% klidné podlahy podle ADR 0045. Veškeré stopy na zemi (rozlité pivo, bahno, louže povidel po poražených běsích, ledové louže tajících sněhuláků) se vykreslují jako poloprůhledné akvarelové lazury (max. 35 % krytí) s měkkými okraji a nulovou černou konturou. Tím je zaručeno, že zem nestrhává pozornost a letící projektily i kořist jsou nad ní dokonale zřetelné.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Upravit renderování terénních anomálií a louží v `src/render/renderWorldHazards.ts` na bezkonturové akvarelové rozpíjení.
- [x] Omezit maximální opacitu louží (povidla, pivo, bláto, ledová voda) na strop 0,35.
- [x] Vyloučit jakoukoliv černou tušovou linku (`stroke`, `strokeStyle = '#000'`) u všech povrchových stop ležících na úrovni podlahy.
- [x] Zkontrolovat přehlednost střel letících přes husté shluky louží v herní aréně.
- [x] Ověřit unit testy zón zrádného terénu a environmentálních efektů.
