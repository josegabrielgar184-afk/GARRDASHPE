'use client';

export type PerformanceTier = 'low' | 'medium' | 'high';

const PERF_KEY = 'garrdash_performance_tier';

export function getPerformanceTier(): PerformanceTier {
  try {
    const v = localStorage.getItem(PERF_KEY);
    if (v === 'low' || v === 'medium' || v === 'high') return v;
  } catch {}
  return 'high';
}

export function setPerformanceTier(tier: PerformanceTier): void {
  try {
    localStorage.setItem(PERF_KEY, tier);
    window.dispatchEvent(new CustomEvent('performance-tier-change', { detail: tier }));
  } catch {}
}

export function shouldRenderParticles(): boolean {
  return getPerformanceTier() !== 'low';
}

export function shouldRenderGlow(): boolean {
  return getPerformanceTier() === 'high';
}

export function shouldRenderShadows(): boolean {
  return getPerformanceTier() === 'high';
}

export function getParticleLimit(): number {
  const tier = getPerformanceTier();
  if (tier === 'low') return 0;
  if (tier === 'medium') return 15;
  return 60;
}

export function getRenderScale(): number {
  const tier = getPerformanceTier();
  if (tier === 'low') return 0.6;
  if (tier === 'medium') return 0.8;
  return 1;
}

export function shouldReduceMotion(): boolean {
  return getPerformanceTier() === 'low';
}

export function getTargetFPS(): number {
  const tier = getPerformanceTier();
  if (tier === 'low') return 30;
  if (tier === 'medium') return 45;
  return 60;
}

export function shouldSimplifySprites(): boolean {
  return getPerformanceTier() === 'low';
}

export function getMaxStars(): number {
  const tier = getPerformanceTier();
  if (tier === 'low') return 40;
  if (tier === 'medium') return 70;
  return 100;
}

export function getNebulaCount(): number {
  const tier = getPerformanceTier();
  if (tier === 'low') return 0;
  if (tier === 'medium') return 1;
  return 3;
}
