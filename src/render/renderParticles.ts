/**
 * Batched Particles Renderer (Dávkové vykreslování částic)
 * 
 * Draws combat particles with frustum culling, zero-allocation color + alpha-tier
 * bucketing, and compound path batching (single beginPath + fill per color/alpha tier).
 * 
 * ADR 0017, ADR 0020
 */

import { COLORS } from '../constants';

export interface CameraViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  viewLeft: number;
  viewTop: number;
  viewRight: number;
  viewBottom: number;
  zoom?: number;
}

function isParticleInView(x: number, y: number, radius: number, cam: CameraViewport): boolean {
  return (
    x + radius >= cam.viewLeft &&
    x - radius <= cam.viewRight &&
    y + radius >= cam.viewTop &&
    y - radius <= cam.viewBottom
  );
}

const INITIAL_BUCKET_CAPACITY = 512;
const INITIAL_COLOR_BUCKETS = 32;

export interface ParticleColorBucket {
  color: string;
  active: boolean;
  counts: Int32Array;
  tiers: [Float32Array, Float32Array, Float32Array, Float32Array];
}

function createParticleColorBucket(color = ''): ParticleColorBucket {
  return {
    color,
    active: false,
    counts: new Int32Array(4),
    tiers: [
      new Float32Array(INITIAL_BUCKET_CAPACITY * 3),
      new Float32Array(INITIAL_BUCKET_CAPACITY * 3),
      new Float32Array(INITIAL_BUCKET_CAPACITY * 3),
      new Float32Array(INITIAL_BUCKET_CAPACITY * 3),
    ],
  };
}

export class ParticleBatchRenderer {
  private readonly bucketPool: ParticleColorBucket[] = [];
  private readonly frameColorMap = new Map<string, ParticleColorBucket>();
  private readonly activeBuckets: ParticleColorBucket[] = [];
  private activeBucketCount = 0;

  constructor(initialBuckets = INITIAL_COLOR_BUCKETS) {
    for (let i = 0; i < initialBuckets; i++) {
      const bucket = createParticleColorBucket();
      this.bucketPool.push(bucket);
      this.activeBuckets.push(bucket);
    }
  }

  public get poolCapacity(): number {
    return this.bucketPool.length;
  }

  private acquireBucket(color: string): ParticleColorBucket {
    let bucket: ParticleColorBucket;
    if (this.activeBucketCount < this.bucketPool.length) {
      bucket = this.bucketPool[this.activeBucketCount];
      this.activeBuckets[this.activeBucketCount] = bucket;
    } else {
      bucket = createParticleColorBucket();
      this.bucketPool.push(bucket);
      this.activeBuckets.push(bucket);
    }
    this.activeBucketCount++;
    bucket.color = color;
    bucket.active = true;
    this.frameColorMap.set(color, bucket);
    return bucket;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    particles: any[],
    camera: CameraViewport
  ): number {
    if (!particles || particles.length === 0) return 0;

    let rendered = 0;

    // Pass 1: Frustum cull and bucket visible particles by color and quantized alpha tier (0..3)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p || (p.life ?? 0) <= 0) continue;
      if (!isParticleInView(p.x, p.y, p.size || 6, camera)) continue;

      rendered++;
      const rawAlpha = Math.max(0, Math.min(1, (p.life || 0) * 2.5));
      const tier = rawAlpha <= 0.3125 ? 0 : rawAlpha <= 0.625 ? 1 : rawAlpha <= 0.875 ? 2 : 3;
      const color = p.color || COLORS.white;

      let bucket = this.frameColorMap.get(color);
      if (!bucket) {
        bucket = this.acquireBucket(color);
      }

      const idx = bucket.counts[tier];
      let buf = bucket.tiers[tier];
      const offset = idx * 3;
      if (offset + 3 > buf.length) {
        const grown = new Float32Array(buf.length * 2);
        grown.set(buf);
        buf = grown;
        bucket.tiers[tier] = grown;
      }

      buf[offset] = p.x;
      buf[offset + 1] = p.y;
      buf[offset + 2] = p.size || 3;
      bucket.counts[tier] = idx + 1;
    }

    if (rendered === 0) return 0;

    // Pass 2: Compound path draw per (color, alphaTier) bucket
    for (let b = 0; b < this.activeBucketCount; b++) {
      const bucket = this.activeBuckets[b];
      ctx.fillStyle = bucket.color;

      for (let t = 0; t < 4; t++) {
        const count = bucket.counts[t];
        if (count === 0) continue;

        ctx.globalAlpha = (t + 1) * 0.25;
        ctx.beginPath();
        const buf = bucket.tiers[t];
        const len = count * 3;
        for (let j = 0; j < len; j += 3) {
          const px = buf[j];
          const py = buf[j + 1];
          const pr = buf[j + 2];
          ctx.moveTo(px + pr, py);
          ctx.arc(px, py, pr, 0, Math.PI * 2);
        }
        ctx.fill();
        bucket.counts[t] = 0;
      }

      this.activeBuckets[b] = undefined as unknown as ParticleColorBucket;
      bucket.active = false;
    }

    this.frameColorMap.clear();
    this.activeBucketCount = 0;
    ctx.globalAlpha = 1.0;

    return rendered;
  }
}

export const defaultParticleBatchRenderer = new ParticleBatchRenderer();

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: any[],
  camera: CameraViewport,
  batchRenderer: ParticleBatchRenderer = defaultParticleBatchRenderer
): number {
  return batchRenderer.render(ctx, particles, camera);
}
