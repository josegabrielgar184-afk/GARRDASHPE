'use client';

export interface ControlLayout {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export type ControlScreenId = 'zombie' | 'space' | 'survival';

const STORAGE_KEY = 'garrdash_control_layouts';
const DEFAULT_OPACITY = 0.85;

export const DEFAULT_LAYOUTS: Record<ControlScreenId, Record<string, ControlLayout>> = {
  zombie: {
    move: { x: 0.5, y: 0.88, size: 120, opacity: DEFAULT_OPACITY },
  },
  space: {
    move: { x: 0.5, y: 0.85, size: 140, opacity: DEFAULT_OPACITY },
  },
  survival: {
    move: { x: 0.5, y: 0.88, size: 120, opacity: DEFAULT_OPACITY },
  },
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
  const halfSize = controlSize / 2 / window.innerWidth;
  const halfSizeY = controlSize / 2 / window.innerHeight;
  return {
    x: Math.max(halfSize, Math.min(1 - halfSize, layout.x)),
    y: Math.max(halfSizeY, Math.min(1 - halfSizeY, layout.y)),
    size: Math.max(60, Math.min(200, layout.size)),
    opacity: Math.max(0.3, Math.min(1, layout.opacity)),
  };
}
