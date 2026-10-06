'use client';

export interface ControlLayout {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export type ControlScreenId = 'campaign' | 'vicio' | 'space';

const STORAGE_KEY = 'garrdash_control_layouts_v2';
const DEFAULT_OPACITY = 0.85;

export const DEFAULT_LAYOUTS: Record<ControlScreenId, Record<string, ControlLayout>> = {
  campaign: {
    nuclear: { x: 0.85, y: 0.75, size: 64, opacity: DEFAULT_OPACITY },
  },
  vicio: {
    nuclear: { x: 0.85, y: 0.75, size: 64, opacity: DEFAULT_OPACITY },
  },
  space: {
    nuclear: { x: 0.85, y: 0.75, size: 64, opacity: DEFAULT_OPACITY },
  },
};

export const CONTROL_LABELS: Record<ControlScreenId, Record<string, string>> = {
  campaign: { nuclear: 'Bomba Nuclear' },
  vicio: { nuclear: 'Bomba Nuclear' },
  space: { nuclear: 'Bomba Nuclear' },
};

export const SCREEN_LABELS: Record<ControlScreenId, string> = {
  campaign: 'Campana',
  vicio: 'Camino del Vicio',
  space: 'GarrFly / Espacio',
};

export function loadControlLayouts(): Record<ControlScreenId, Record<string, ControlLayout>> {
  if (typeof window === 'undefined') return DEFAULT_LAYOUTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUTS;
    const parsed = JSON.parse(raw);
    const merged: Record<ControlScreenId, Record<string, ControlLayout>> = { ...DEFAULT_LAYOUTS };
    for (const screenId of Object.keys(DEFAULT_LAYOUTS) as ControlScreenId[]) {
      if (parsed[screenId]) {
        merged[screenId] = { ...DEFAULT_LAYOUTS[screenId], ...parsed[screenId] };
      }
    }
    return merged;
  } catch {
    return DEFAULT_LAYOUTS;
  }
}

export function saveControlLayouts(layouts: Record<ControlScreenId, Record<string, ControlLayout>>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {}
}

export function resetControlLayouts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function clampLayout(layout: ControlLayout, controlSize: number): ControlLayout {
  const halfW = controlSize / 2 / window.innerWidth;
  const halfH = controlSize / 2 / window.innerHeight;
  return {
    x: Math.max(halfW, Math.min(1 - halfW, layout.x)),
    y: Math.max(halfH, Math.min(1 - halfH, layout.y)),
    size: Math.max(48, Math.min(200, layout.size)),
    opacity: Math.max(0.3, Math.min(1, layout.opacity)),
  };
}
