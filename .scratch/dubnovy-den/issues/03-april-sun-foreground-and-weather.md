# 03: Aprílové sluníčko v popředí a proměnlivé počasí

**What to build:** A procedural fairytale April Sun (Aprílové sluníčko) watches over the hunter during the 5-minute daytime run in Stage 3. It features a playful, mischievous personality (wearing a wildflower wreath of dandelions and pussy-willows, winking teasingly, sticking out its tongue with an "Apríl!" grin, and laughing through sunshowers with a rainbow halo). Pre-rendered offscreen canvases blend smoothly with zero allocation in the canvas rendering pipeline, accompanied by gentle drifting flower petals and dandelion tufts.

**Blocked by:** 01: Definice kraje, tempo a progrese (Dubnový den)

**Status:** closed

- [x] 7 distinct April daytime visual keyframes implemented (Sunrise, Morning, April Mischief, Warm Noon, Sunshower & Rainbow, Early Evening, Walpurgis Sunset).
- [x] Hardware-accelerated keyframe blending in `arenaRenderer.ts` executes without runtime Bezier or gradient allocations.
- [x] Weather system supports drifting petals and dandelion seed particles during Stage 3.
- [x] Foreground sun respects center-screen player deadzone and camera parallax.
- [x] Unit tests verify keyframe time-mapping, particle lifetimes, and rendering stability.
