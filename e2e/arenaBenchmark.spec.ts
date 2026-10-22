import { test, expect, Page } from '@playwright/test';

async function runBenchmarkForProfile(page: Page, profile: 'balanced' | 'fidelity' | 'performance') {
  // Open benchmark mode with auto-stress bot
  await page.goto(`/?benchmark=1&profile=${profile}`);

  // Wait for game canvas to mount and render
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 15000 });
  await canvas.click();

  // Wait until game loop finishes cold start and is actively delivering frames
  await page.waitForFunction(() => {
    const perf = (window as any).__BUBAKOV_PERF__;
    return perf && perf.profiler && perf.profiler.fps >= 40;
  }, { timeout: 20000 });

  // Reset profiler so metrics isolate purely the active arena gameplay
  await page.evaluate(() => {
    (window as any).__BUBAKOV_PERF__?.profiler?.reset();
  });

  // Run active combat benchmark for 5 seconds in focused window
  for (let i = 0; i < 5; i++) {
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyA');
  }

  // Retrieve real metrics collected by FrameProfiler in Chromium
  const metrics = await page.evaluate(() => {
    const perf = (window as any).__BUBAKOV_PERF__;
    if (!perf) return null;
    return {
      summary: perf.getMetricsSummary(),
      engine: perf.getEngineState(),
      timings: perf.profiler.smoothed,
    };
  });

  expect(metrics).not.toBeNull();
  const { summary, engine, timings } = metrics!;

  // Print professional benchmark report to stdout
  console.log('\n======================================================================');
  console.log(` BUBÁKOV REAL CHROMIUM CANVAS BENCHMARK — [${profile.toUpperCase()}]`);
  console.log('======================================================================');
  console.log(` Active Entities in Arena:`);
  console.log(`   - Enemies:      ${engine.enemies}`);
  console.log(`   - Projectiles:  ${engine.projectiles}`);
  console.log(`   - Particles:    ${engine.particles}`);
  console.log(`   - Drops:        ${engine.drops}`);
  console.log('----------------------------------------------------------------------');
  console.log(` Delivered Frame Performance:`);
  console.log(`   - Sampled frames:   ${summary.sampleCount}`);
  console.log(`   - Mean FPS:         ${summary.meanFps} FPS`);
  console.log(`   - Min FPS:          ${summary.minFps} FPS`);
  console.log(`   - p50 frame time:   ${summary.p50DeltaMs} ms`);
  console.log(`   - p95 frame time:   ${summary.p95DeltaMs} ms (target: < 25.0 ms for smooth play)`);
  console.log(`   - Max frame delta:  ${summary.maxDeltaMs} ms`);
  console.log(`   - Dropped (<30 FPS): ${summary.droppedFrames} frames (${((summary.droppedFrames / summary.sampleCount) * 100).toFixed(1)} %)`);
  console.log(`   - Stutter (<20 FPS): ${summary.stutterFrames} frames (${((summary.stutterFrames / summary.sampleCount) * 100).toFixed(1)} %)`);
  console.log('----------------------------------------------------------------------');
  console.log(` Pure CPU Frame Work Time:`);
  console.log(`   - CPU Work Average: ${summary.cpuWorkAvgMs} ms`);
  console.log(`   - CPU Work p95:     ${summary.cpuWorkP95Ms} ms`);
  console.log(`   - Simulation:       ${timings.simulation.toFixed(1)} ms`);
  console.log(`   - World (Entities): ${timings.world.toFixed(1)} ms`);
  console.log(`   - Lighting:         ${timings.lighting.toFixed(1)} ms`);
  console.log(`   - Overlays:         ${timings.overlays.toFixed(1)} ms`);
  console.log('======================================================================\n');

  // Assert that real browser is actually executing frames and maintaining playable performance
  expect(summary.sampleCount).toBeGreaterThanOrEqual(120);
  // p95 frame delivery time must remain within playable threshold (< 33.3ms = 30+ FPS)
  expect(summary.p95DeltaMs).toBeLessThan(33.3);
  // Stutter frames (< 20 FPS) should be less than 5% of total frames
  expect(summary.stutterFrames).toBeLessThanOrEqual(Math.ceil(summary.sampleCount * 0.05));

  return summary;
}

test.describe('Arena Headless Real-Rendering Performance Benchmark (Option 1)', () => {
  test('measures real delivered FPS and frame budgets in Balanced profile', async ({ page }) => {
    await runBenchmarkForProfile(page, 'balanced');
  });

  test('measures real delivered FPS and frame budgets in Fidelity (full visual effects) profile', async ({ page }) => {
    await runBenchmarkForProfile(page, 'fidelity');
  });
});
