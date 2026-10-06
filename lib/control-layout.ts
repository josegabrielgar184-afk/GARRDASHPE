'use client';

export interface ControlLayout {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export type ControlScreenId =
  | 'campaign'
  | 'vicio'
  | 'space'
  | 'maze'
  | 'garrfly'
  | 'zrunner'
  | 'garrblade';

export type ControlIconType = 'nuclear' | 'up' | 'down' | 'left' | 'right' | 'jump';

const STORAGE_KEY = 'garrdash_control_layouts_v3';
const OLD_STORAGE_KEY = 'garrdash_control_layouts_v2';
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
  maze: {
    up:    { x: 0.5,  y: 0.82, size: 56, opacity: DEFAULT_OPACITY },
    left:  { x: 0.35, y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
    down:  { x: 0.5,  y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
    right: { x: 0.65, y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
  },
  garrfly: {
    up:    { x: 0.5,  y: 0.82, size: 56, opacity: DEFAULT_OPACITY },
    left:  { x: 0.35, y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
    down:  { x: 0.5,  y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
    right: { x: 0.65, y: 0.91, size: 56, opacity: DEFAULT_OPACITY },
  },
  zrunner: {
    left:  { x: 0.2,  y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
    jump:  { x: 0.5,  y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
    right: { x: 0.8,  y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
  },
  garrblade: {
    left:  { x: 0.15, y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
    right: { x: 0.3,  y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
    down:  { x: 0.7,  y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
    jump:  { x: 0.85, y: 0.88, size: 56, opacity: DEFAULT_OPACITY },
  },
};

export const CONTROL_LABELS: Record<ControlScreenId, Record<string, string>> = {
  campaign: { nuclear: 'Bomba Nuclear' },
  vicio: { nuclear: 'Bomba Nuclear' },
  space: { nuclear: 'Bomba Nuclear' },
  maze:    { up: 'Arriba', left: 'Izquierda', down: 'Abajo', right: 'Derecha' },
  garrfly: { up: 'Arriba', left: 'Izquierda', down: 'Abajo', right: 'Derecha' },
  zrunner: { left: 'Izquierda', jump: 'Saltar', right: 'Derecha' },
  garrblade: { left: 'Izquierda', right: 'Derecha', down: 'Bajar', jump: 'Subir / Saltar' },
};

export const CONTROL_ICONS: Record<string, ControlIconType> = {
  nuclear: 'nuclear',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  jump: 'jump',
};

export const SCREEN_LABELS: Record<ControlScreenId, string> = {
  campaign: 'Campana',
  vicio: 'Camino del Vicio',
  space: 'GarrFly / Espacio',
  maze: 'Laberinto Neon',
  garrfly: 'Culebrita Neon',
  zrunner: 'Z-Runner',
  garrblade: 'GarrBlade',
};

function isValidLayout(val: unknown): val is ControlLayout {
  if (typeof val !== 'object' || val === null) return false;
  const v = val as Record<string, unknown>;
  return typeof v.x === 'number' && typeof v.y === 'number'
    && typeof v.size === 'number' && typeof v.opacity === 'number'
    && v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1
    && v.size >= 20 && v.size <= 300
    && v.opacity >= 0.1 && v.opacity <= 1;
}

function sanitizeLayout(saved: unknown, fallback: ControlLayout): ControlLayout {
  if (!isValidLayout(saved)) return { ...fallback };
  const s = saved as ControlLayout;
  return {
    x: Math.max(0.01, Math.min(0.99, s.x)),
    y: Math.max(0.01, Math.min(0.99, s.y)),
    size: Math.max(40, Math.min(200, s.size)),
    opacity: Math.max(0.3, Math.min(1, s.opacity)),
  };
}

function mergeScreen(
  defaults: Record<string, ControlLayout>,
  saved: Record<string, unknown> | undefined,
): Record<string, ControlLayout> {
  const result: Record<string, ControlLayout> = {};
  for (const ctrlId of Object.keys(defaults)) {
    const savedCtrl = saved?.[ctrlId];
    result[ctrlId] = sanitizeLayout(savedCtrl, defaults[ctrlId]);
  }
  return result;
}

export function loadControlLayouts(): Record<ControlScreenId, Record<string, ControlLayout>> {
  if (typeof window === 'undefined') return DEFAULT_LAYOUTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
      ?? localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUTS;
    const parsed = JSON.parse(raw);
    const merged: Record<ControlScreenId, Record<string, ControlLayout>> = {} as Record<ControlScreenId, Record<string, ControlLayout>>;
    for (const screenId of Object.keys(DEFAULT_LAYOUTS) as ControlScreenId[]) {
      merged[screenId] = mergeScreen(
        DEFAULT_LAYOUTS[screenId],
        typeof parsed[screenId] === 'object' && parsed[screenId] !== null ? parsed[screenId] : undefined,
      );
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
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {}
}

export function resetControlLayouts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {}
}

export function clampLayout(layout: ControlLayout, controlSize: number): ControlLayout {
  const halfW = controlSize / 2 / window.innerWidth;
  const halfH = controlSize / 2 / window.innerHeight;
  return {
    x: Math.max(halfW, Math.min(1 - halfW, layout.x)),
    y: Math.max(halfH, Math.min(1 - halfH, layout.y)),
    size: Math.max(40, Math.min(200, layout.size)),
    opacity: Math.max(0.3, Math.min(1, layout.opacity)),
  };
}

export function getFirstControlId(screenId: ControlScreenId): string {
  const keys = Object.keys(DEFAULT_LAYOUTS[screenId]);
  return keys[0] ?? 'nuclear';
}
