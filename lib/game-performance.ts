export interface Poolable {
  active: boolean;
  reset(): void;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, prealloc = 30) {
    this.factory = factory;
    for (let i = 0; i < prealloc; i++) {
      const obj = factory();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  acquire(): T {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        const obj = this.pool[i];
        obj.active = true;
        obj.reset();
        return obj;
      }
    }
    const obj = this.factory();
    obj.active = true;
    obj.reset();
    this.pool.push(obj);
    return obj;
  }

  release(obj: T) {
    obj.active = false;
  }

  releaseAll() {
    for (const obj of this.pool) obj.active = false;
  }

  getActive(): T[] {
    return this.pool.filter((o) => o.active);
  }

  get activeCount(): number {
    return this.pool.filter((o) => o.active).length;
  }
}

export type QualityLevel = 'low' | 'medium' | 'high';

const PERF_KEY = 'garrdash_performance_tier';

function getManualTier(): QualityLevel | null {
  try {
    const v = localStorage.getItem(PERF_KEY);
    if (v === 'low' || v === 'medium' || v === 'high') return v;
  } catch {}
  return null;
}

export class FPSMonitor {
  private frames: number[] = [];
  private windowSize: number;
  private lastCheck: number = 0;
  public current: number = 60;
  public quality: QualityLevel = 'high';
  public particleMultiplier: number = 1;
  public maxFps: number = 60;
  private stableFrames: number = 0;
  public manualOverride: boolean = false;

  constructor(windowSize = 60) {
    this.windowSize = windowSize;
    this.lastCheck = performance.now();
    const manual = getManualTier();
    if (manual) { this.applyManualTier(manual); }
  }

  private applyManualTier(tier: QualityLevel) {
    this.manualOverride = true;
    this.quality = tier;
    if (tier === 'low') { this.particleMultiplier = 0; this.maxFps = 30; }
    else if (tier === 'medium') { this.particleMultiplier = 0.5; this.maxFps = 60; }
    else { this.particleMultiplier = 1; this.maxFps = 60; }
  }

  refreshManualTier() {
    const manual = getManualTier();
    if (manual) this.applyManualTier(manual);
  }

  tick(now: number): void {
    this.frames.push(now);
    while (this.frames.length > 0 && now - this.frames[0] > 1000) {
      this.frames.shift();
    }

    if (this.manualOverride) return;

    if (now - this.lastCheck >= 1000) {
      this.current = this.frames.length;
      this.lastCheck = now;

      if (this.current < 45) {
        this.quality = 'low';
        this.particleMultiplier = 0.3;
        this.maxFps = 30;
        this.stableFrames = 0;
      } else if (this.current < 55) {
        this.quality = 'medium';
        this.particleMultiplier = 0.6;
        this.maxFps = 60;
        this.stableFrames = 0;
      } else {
        this.stableFrames++;
        if (this.stableFrames > 3) {
          this.quality = 'high';
          this.particleMultiplier = 1;
          this.maxFps = 60;
        }
      }
    }
  }

  shouldRenderFrame(now: number, lastFrame: number): boolean {
    if (this.maxFps >= 60) return true;
    const minInterval = 1000 / this.maxFps;
    return now - lastFrame >= minInterval;
  }

  get particleCount(): number {
    return this.quality === 'low' ? 0 : this.quality === 'medium' ? 1 : 1;
  }

  scaleParticleCount(base: number): number {
    return Math.max(0, Math.floor(base * this.particleMultiplier));
  }

  get shouldGlow(): boolean {
    return this.quality === 'high';
  }

  get shouldBulletGlow(): boolean {
    return this.quality === 'medium' || this.quality === 'high';
  }

  get maxKillParticles(): number {
    if (this.quality === 'low') return 0;
    if (this.quality === 'medium') return 5;
    return 20;
  }
}

export function getPoolSize(base: number): number {
  const tier = (typeof window !== 'undefined' && window.localStorage.getItem('garrdash_perf_tier')) || 'high';
  if (tier === 'low') return Math.max(8, Math.floor(base * 0.4));
  if (tier === 'medium') return Math.max(12, Math.floor(base * 0.7));
  return base;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
