# Changelog

## 2026-10-02 — Performance optimization
- Enemy spatial hash for projectile/melee broad-phase collision queries.
- Per-frame living-enemy snapshot to reduce repeated array filtering.
- Squared-distance collision checks in hot paths.
- Reused living-enemy snapshot for projectile retargeting.
- Viewport culling for enemies and projectiles.
- Added in-place dead-entity cleanup helper.

## 2026-10-02 — Extended performance optimization
- Replaced the string-key enemy broad phase with a reusable numeric spatial hash and retained query buffers.
- Added allocation-free in-place cleanup for projectiles, slashes, enemies, drops and floating texts.
- Added a frame-time clamp to prevent expensive simulation bursts after stalled frames.
- Centralized squared-distance and viewport checks in reusable performance helpers.
- Kept the existing living-enemy snapshot and viewport culling from the previous pass.

## 2026-10-03 — Combat HUD: Kuráž
- Přidán horní ukazatel Kuráže zobrazující aktuální a maximální HP lovce.
- XP ukazatel dostal vlastní identifikátor pro spolehlivé cílení CSS.
- Herní animační smyčka nyní reaguje i na změnu obrazovky výběru lovce (menuScreen).
- Na menších displejích jsou horní HP/XP lišty kompaktnější.


## 2026-10-03 — Combat HUD: 22% viewport
- Sloučen a zpřesněn horní HUD tak, aby byl pevně omezen na maximálně 22 % dynamické výšky viewportu včetně safe-area offsetu.
- Na mobilech odstraněn konflikt se starým `top: 55px`; HUD nyní začíná u horní safe-area a používá stejný 22% limit.
- Sjednocena mobilní pravidla Kuráže, XP a statistik bez duplicitních `@media` bloků.
- Zmenšeny mobilní HP/XP lišty, statistický řádek a boss bar; HUD je oříznutý, aby vizuálně nepřetékal mimo vyhrazený prostor.
- Boss bar wrapper dostal vlastní výškový limit a desktopová výška boss HP lišty byla snížena z 26 na 22 px.

## 2026-10-03 — Dotykové ovládání: Odstranění duplicitní lišty schopnosti
- Na dotykových displejích a při aktivním dotykovém ovládání byla z bojové arény odstraněna spodní lišta „Speciální schopnost“.
- Pro aktivaci i přehled o stavu a odpočtu schopnosti plně dostačuje vyhrazené kruhové akční tlačítko vpravo dole, čímž se uvolnil prostor arény.

## 2026-10-03 — Přeměna Svatovítského balzámu na Jitrnici
- Svatovítský balzám byl nahrazen tradiční českou zabijačkovou jitrnicí se špejlemi na obou koncích podle folklorní předlohy.
- Vytvořen nový detailní ladovský renderer `drawJitrnice` s přírodním střívkem, viditelným kořením s majoránkou, leskem vařeného střívka a zašpejlovanými konci.
- Přidán nový vektorový komponent `JitrniceIcon` a SVG grafika `public/images/jitrnice.svg`.
- Aktualizovány truhly s odměnami, výherní válec i texty dropů v aréně i herním plánu.

## 2026-10-03 — Dotykové ovládání: Zvýšení pozice joysticku a speciální schopnosti
- Tlačítko virtuálního joysticku a tlačítko speciální schopnosti byly na dotykovém displeji posunuty o 10 % výšky obrazovky výše (`bottom: calc(... + 10vh / 10dvh)`).
- Upravena a rozšířena i dotyková zóna pro plynulé a pohodlné ovládání palci bez nechtěného přejíždění přes systémové ovládací lišty telefonu.


