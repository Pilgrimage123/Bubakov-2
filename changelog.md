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

## 2026-10-04 — Dotykové ovládání: Zajištění viditelnosti na všech typech displejů
- Kontejner dotykového ovládání `.touch-controls-container` i celá obrazovka `body` byly ukotveny přímo k dynamickému viewportu (`position: fixed; inset: 0; 100dvh`), čímž se eliminovalo přepadávání tlačítek pod spodní lištu prohlížeče na mobilním Safari a Chrome.
- V `index.html` byl přidán parametr `viewport-fit=cover` pro spolehlivou podporu proměnných bezpečných zón `env(safe-area-inset-*)`.
- Spodní pozice joysticku i tlačítka schopnosti nyní explicitně započítává spodní systémové gesto/lištu (`env(safe-area-inset-bottom)`) a má garantovanou minimální bezpečnou vzdálenost od okraje.
- Přidána plná podpora orientace na šířku (landscape na mobilech s výškou < 500 px) i pro velmi úzké telefony (<= 380 px), kde jsou prvky proporcionálně zmenšeny a posunuty od výřezů/kamer (`safe-area-inset-left / right`).
- Dynamické přesouvání základny joysticku v `TouchControls.tsx` nyní respektuje `visualViewport` a nikdy nedovolí posunout tlačítko do spodní systémové zóny.



