#!/usr/bin/env bash
set -euo pipefail

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cat > "$TMP_DIR/v1.patch" <<'PATCH_V1'
*** Begin Patch
*** Update File: src/game/engineState.ts
@@
  player: any;
  enemies: any[];
+  livingEnemies: any[];
  projectiles: any[];
@@
    player: null,
    enemies: [],
+    livingEnemies: [],
    projectiles: [],
*** Update File: src/App.tsx
@@
 class DamageText {
@@
 }
+
+/**
+ * Fixed-size spatial hash used by the combat collision system.
+ *
+ * Before this optimization every projectile/slash checked every enemy,
+ * producing O(projectiles * enemies) collision work. The grid narrows each
+ * query to nearby cells while the original precise distance/arc tests remain
+ * unchanged.
+ */
+class EnemySpatialGrid {
+  private readonly cellSize = 128;
  private readonly cells = new Map<string, any[]>();
  private readonly result: any[] = [];

  clear() {
    this.cells.clear();
  }

  private key(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  insert(enemy: any) {
    if (enemy.isDefeated || enemy.dead) return;
    const key = this.key(enemy.x, enemy.y);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(enemy);
  }

  rebuild(enemies: any[]) {
    this.clear();
    for (const enemy of enemies) this.insert(enemy);
  }

  queryCircle(x: number, y: number, radius: number): any[] {
    // Reuse one scratch array so collision queries do not allocate.
    this.result.length = 0;

    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let gy = minY; gy <= maxY; gy += 1) {
      for (let gx = minX; gx <= maxX; gx += 1) {
        const cell = this.cells.get(`${gx},${gy}`);
        if (!cell) continue;
        for (const enemy of cell) this.result.push(enemy);
      }
    }

    return this.result;
  }
}
@@
 export default function App() {
   const canvasRef = useRef<HTMLCanvasElement | null>(null);
+  const enemyGridRef = useRef<EnemySpatialGrid | null>(null);
+  if (!enemyGridRef.current) enemyGridRef.current = new EnemySpatialGrid();
@@
       // Helper methods for weapon scripts
       distTo(e: any) {
         return Math.hypot(e.x - this.x, e.y - this.y);
       },
       getLivingEnemies() {
-        return engineRef.current.enemies.filter((e) => !e.isDefeated);
+        return engineRef.current.livingEnemies;
      },
      spawnProjectile(proj: any) {
        engineRef.current.projectiles.push({
          ...proj,
          vx: Math.cos(proj.angle) * proj.speed,
          vy: Math.sin(proj.angle) * proj.speed,
          hitList: [],
+          hitSet: new Set<any>(),
          dead: false,
        });
      },
      spawnMeleeSlash(slash: any) {
        engineRef.current.slashes.push({
          ...slash,
          hitList: [],
+          hitSet: new Set<any>(),
          dead: false,
        });
      },
      spawnAreaImpact(impact: any) {
-        const enemies = engineRef.current.enemies;
+        const enemies = enemyGridRef.current?.queryCircle(
+          impact.x,
+          impact.y,
+          impact.radius + 64
+        ) || [];
        for (const e of enemies) {
          if (!e.isDefeated && Math.hypot(e.x - impact.x, e.y - impact.y) <= impact.radius + e.radius) {
            e.takeDamage(impact.dmg, impact.type, (e.x - impact.x) * 4, (e.y - impact.y) * 4);
@@
      if ((gameState === 'playing' || gameState === 'fleeing') && engineRef.current.player && engineRef.current.cutscene && gameState === 'playing') {
@@
        if (player) {
+          // Refresh the living-enemy cache once per frame. Weapon helpers,
+          // homing projectiles and boss targeting can then reuse it without
+          // allocating a new filtered array for every call.
+          engine.livingEnemies.length = 0;
+          for (const enemy of engine.enemies) {
+            if (!enemy.isDefeated && !enemy.dead) engine.livingEnemies.push(enemy);
+          }
+          enemyGridRef.current?.rebuild(engine.enemies);
+
          // Time & Day/Night phase tracking
@@
            // Player movement
+            // Boss mechanics and spawning may have added enemies since the
+            // frame-start cache. Rebuild once after spawning and reuse it for
+            // passive auras, weapon targeting and collision queries.
+            engine.livingEnemies.length = 0;
+            for (const enemy of engine.enemies) {
+              if (!enemy.isDefeated && !enemy.dead) engine.livingEnemies.push(enemy);
+            }
+            enemyGridRef.current?.rebuild(engine.enemies);
+
            let mx = 0;
@@
            // Update Projectiles
            for (const p of engine.projectiles) {
@@
            // Homing bees
            if (p.homing) {
              const living = player.getLivingEnemies();
@@
                }
              }
            }
-            for (const e of engine.enemies) {
+            // Only inspect enemies in nearby spatial-grid cells. The exact
+            // circle collision below remains the authoritative hit test.
+            const candidates = enemyGridRef.current?.queryCircle(
+              p.x,
+              p.y,
+              p.radius + 64
+            ) || [];
+            for (const e of candidates) {
              if (e.isDefeated) continue;
-              if (!p.hitList.includes(e) && Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
+              if (!p.hitSet?.has(e) && Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
                p.hitList.push(e);
+                p.hitSet?.add(e);
@@
                  // Bouncing poppy cake
                  if (p.bounces && p.bounces > 0) {
                    p.bounces--;
-                    const living = player.getLivingEnemies().filter((x: any) => x !== e);
+                    const living = engine.livingEnemies;
                    if (living.length > 0) {
-                      const next = living[0];
+                      let next = living[0];
+                      if (next === e && living.length > 1) next = living[1];
                      const bAng = Math.atan2(next.y - p.y, next.x - p.x);
                      p.vx = Math.cos(bAng) * p.speed;
                      p.vy = Math.sin(bAng) * p.speed;
                      p.hitList = [];
+                      p.hitSet?.clear();
                      break;
@@
-          engine.projectiles = engine.projectiles.filter((p) => !p.dead);
+          // Compact in place to avoid allocating a new array every frame.
+          {
+            let write = 0;
+            for (let read = 0; read < engine.projectiles.length; read += 1) {
+              const projectile = engine.projectiles[read];
+              if (!projectile.dead) engine.projectiles[write++] = projectile;
+            }
+            engine.projectiles.length = write;
+          }
          // Update Melee Slashes
          for (const s of engine.slashes) {
@@
-            for (const e of engine.enemies) {
+            const candidates = enemyGridRef.current?.queryCircle(
+              s.x,
+              s.y,
+              s.reach + 64
+            ) || [];
+            for (const e of candidates) {
              if (e.isDefeated) continue;
-              if (!s.hitList.includes(e) && Math.hypot(s.x - e.x, s.y - e.y) <= s.reach + e.radius) {
+              if (!s.hitSet?.has(e) && Math.hypot(s.x - e.x, s.y - e.y) <= s.reach + e.radius) {
                const ang = Math.atan2(e.y - s.y, e.x - s.x);
                let diff = Math.abs(ang - s.angle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;
                if (diff <= s.arc / 2) {
                  s.hitList.push(e);
+                  s.hitSet?.add(e);
                  e.takeDamage(s.dmg, s.type, Math.cos(s.angle) * 260, Math.sin(s.angle) * 260);
                  if (s.soaked) e.soak();
                }
              }
            }
          }
-          engine.slashes = engine.slashes.filter((s) => !s.dead);
+          {
+            let write = 0;
+            for (let read = 0; read < engine.slashes.length; read += 1) {
+              const slash = engine.slashes[read];
+              if (!slash.dead) engine.slashes[write++] = slash;
+            }
+            engine.slashes.length = write;
+          }
@@
-          engine.enemies = engine.enemies.filter((e) => !e.dead);
+          {
+            let write = 0;
+            for (let read = 0; read < engine.enemies.length; read += 1) {
+              const enemy = engine.enemies[read];
+              if (!enemy.dead) engine.enemies[write++] = enemy;
+            }
+            engine.enemies.length = write;
+          }
@@
-          engine.drops = engine.drops.filter((d) => !d.dead);
+          {
+            let write = 0;
+            for (let read = 0; read < engine.drops.length; read += 1) {
+              const drop = engine.drops[read];
+              if (!drop.dead) engine.drops[write++] = drop;
+            }
+            engine.drops.length = write;
+          }
@@
-          engine.texts = engine.texts.filter((t) => t.life > 0);
+          {
+            let write = 0;
+            for (let read = 0; read < engine.texts.length; read += 1) {
+              const text = engine.texts[read];
+              if (text.life > 0) engine.texts[write++] = text;
+            }
+            engine.texts.length = write;
+          }
*** End Patch

PATCH_V1

cat > "$TMP_DIR/v3.patch" <<'PATCH_V3'
*** Begin Patch
*** Update File: src/App.tsx
@@
  const saveMeta = (updated: MetaProgression) => {
    metaRef.current = updated;
    setMeta(updated);
    try {
      localStorage.setItem('bubakov_meta', JSON.stringify(updated));
    } catch {}
  };
+
+  // Kill-heavy runs must not synchronously serialize the whole progression
+  // object on every kill. UI state remains current through metaRef/setMeta;
+  // persistence is coalesced into one write per frame.
+  const pendingMetaSaveRef = useRef<MetaProgression | null>(null);
+  const metaSaveRafRef = useRef<number | null>(null);
+  const queueMetaSave = (updated: MetaProgression) => {
+    metaRef.current = updated;
+    setMeta(updated);
+    pendingMetaSaveRef.current = updated;
+    if (metaSaveRafRef.current !== null) return;
+    metaSaveRafRef.current = requestAnimationFrame(() => {
+      metaSaveRafRef.current = null;
+      const pending = pendingMetaSaveRef.current;
+      if (!pending) return;
+      pendingMetaSaveRef.current = null;
+      try {
+        localStorage.setItem('bubakov_meta', JSON.stringify(pending));
+      } catch {}
+    });
+  };
@@
-         sound.hit();
+         sound.combatHit();
@@
-          saveMeta(nextMeta);
+          queueMetaSave(nextMeta);

          engineRef.current.kills += 1;
-          setRunStats((s) => ({ ...s, kills: engineRef.current.kills }));
+          // Kill count is already available to the game loop. HUD sync below
+          // publishes it at a fixed cadence instead of forcing a React render
+          // for every individual kill.
*** End Patch

PATCH_V3

cat > "$TMP_DIR/v4.patch" <<'PATCH_V4'
*** Update File: src/App.tsx
@@
  const queueMetaSave = (updated: MetaProgression) => {
    metaRef.current = updated;
-    setMeta(updated);
    pendingMetaSaveRef.current = updated;
    if (metaSaveRafRef.current !== null) return;
    metaSaveRafRef.current = requestAnimationFrame(() => {
      metaSaveRafRef.current = null;
      const pending = pendingMetaSaveRef.current;
      if (!pending) return;
      pendingMetaSaveRef.current = null;
+      setMeta(pending);
      try {
        localStorage.setItem('bubakov_meta', JSON.stringify(pending));
      } catch {}
*** End Patch

PATCH_V4

cat > "$TMP_DIR/v2.py" <<'PY_V2'
from pathlib import Path

ROOT = Path(".")
APP = ROOT / "src" / "App.tsx"
AUDIO = ROOT / "src" / "audio.ts"
STATE = ROOT / "src" / "game" / "engineState.ts"

def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(
            f"{path}: expected exactly 1 match, found {count}.\n"
            f"Refusing to continue so the source cannot be partially patched."
        )
    path.write_text(text.replace(old, new), encoding="utf-8")

replace_once(
    AUDIO,
    """  public hit() {
    this.playTone(120, 'sawtooth', 0.1, 0.25);
  }
""",
    """  public hit() {
    this.playTone(120, 'sawtooth', 0.1, 0.25);
  }

  public combatHit(minInterval = 0.08) {
    const now = performance.now();
    if (now - this.lastCombatHitAt < minInterval) return;
    this.lastCombatHitAt = now;
    this.hit();
  }
""",
)

replace_once(
    AUDIO,
    """export class SoundManager {
""",
    """export class SoundManager {
  private lastCombatHitAt = -Infinity;
""",
)

replace_once(
    STATE,
    """  player: any;
  enemies: any[];
""",
    """  player: any;
  enemies: any[];
  renderBuffer: any[];
""",
)

replace_once(
    STATE,
    """    player: null,
    enemies: [],
""",
    """    player: null,
    enemies: [],
    renderBuffer: [],
""",
)

replace_once(
    APP,
    """            // Night Watchman passive holy aura
            if (player.type === 'watchman') {
              for (const e of engine.enemies) {
""",
    """            // Night Watchman passive holy aura
            if (player.type === 'watchman') {
              const candidates = enemyGridRef.current?.queryCircle(player.x, player.y, 85 + 128) || [];
              for (const e of candidates {
""",
)

replace_once(
    APP,
    """              const auraReach = 135 + hromnickaWp.level * 15;
              for (const e of engine.enemies) {
""",
    """              const auraReach = 135 + hromnickaWp.level * 15;
              const candidates = enemyGridRef.current?.queryCircle(player.x, player.y, auraReach + 128) || [];
              for (const e of candidates) {
""",
)

replace_once(
    APP,
    """                engine.lightningStrike = { x: strikeX, y: strikeY, time: 0.45 };
                // Burn enemies in blast radius
                for (const e of engine.enemies) {
""",
    """                engine.lightningStrike = { x: strikeX, y: strikeY, time: 0.45 };
                // Burn only nearby enemies. The precise radius test is retained.
                const strikeCandidates = enemyGridRef.current?.queryCircle(strikeX, strikeY, 220 + 128) || [];
                for (const e of strikeCandidates) {
""",
)

replace_once(
    APP,
    """                const hurtDmg = e.damage * dt * (1 - player.damageReduction);
                player.hp -= hurtDmg;
                sound.hit();
                if (player.hp <= 0) {
""",
    """                const hurtDmg = e.damage * dt * (1 - player.damageReduction);
                player.hp -= hurtDmg;
                sound.combatHit();
                if (player.hp <= 0) {
""",
)

replace_once(
    APP,
    """            if (engine.lastStatsSync >= 0.05) {
""",
    """            // The simulation is frame-accurate; React only needs to refresh
            // the HUD at a human-visible cadence.
            if (engine.lastStatsSync >= 0.1) {
""",
)

replace_once(
    APP,
    """        // Draw Decor
        for (const dec of engine.decor) {
          dec.draw(ctx, curLvl.season, curLvl.theme);
        }
        // Draw Drops
        for (const d of engine.drops) {
""",
    """        // Draw Decor
        for (const dec of engine.decor) {
          if (
            dec.x < cam.x - 220 ||
            dec.x > cam.x + canvas.width + 220 ||
            dec.y < cam.y - 220 ||
            dec.y > cam.y + canvas.height + 220
          ) continue;
          dec.draw(ctx, curLvl.season, curLvl.theme);
        }
        // Draw Drops
        for (const d of engine.drops) {
          if (
            d.x < cam.x - 100 ||
            d.x > cam.x + canvas.width + 100 ||
            d.y < cam.y - 100 ||
            d.y > cam.y + canvas.height + 100
          ) continue;
""",
)

replace_once(
    APP,
    """        const drawables = player ? [player, ...engine.enemies] : [...engine.enemies];
        drawables.sort((a, b) => a.y - b.y);
""",
    """        const drawables = engine.renderBuffer;
        drawables.length = 0;
        if (player) drawables.push(player);
        for (const enemy of engine.enemies) {
          if (
            enemy.x >= cam.x - 180 &&
            enemy.x <= cam.x + canvas.width + 180 &&
            enemy.y >= cam.y - 180 &&
            enemy.y <= cam.y + canvas.height + 180
          ) {
            drawables.push(enemy);
          }
        }
        drawables.sort((a, b) => a.y - b.y);
""",
)

replace_once(
    APP,
    """        // Draw Projectiles
        for (const p of engine.projectiles) {
          ctx.save();
""",
    """        // Draw Projectiles
        for (const p of engine.projectiles) {
          if (
            p.x < cam.x - 100 ||
            p.x > cam.x + canvas.width + 100 ||
            p.y < cam.y - 100 ||
            p.y > cam.y + canvas.height + 100
          ) continue;
          ctx.save();
""",
)

print("Performance pass v2 applied successfully.")

PY_V2

echo "[1/4] Applying performance patch v1..."
git apply "$TMP_DIR/v1.patch"

echo "[2/4] Applying performance pass v2..."
python3 "$TMP_DIR/v2.py"

echo "[3/4] Applying performance pass v3..."
git apply "$TMP_DIR/v3.patch"

echo "[4/4] Applying performance pass v4..."
git apply "$TMP_DIR/v4.patch"

echo "Performance passes v1-v4 applied successfully."
echo "Run: npm run build"
