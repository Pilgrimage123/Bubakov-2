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
