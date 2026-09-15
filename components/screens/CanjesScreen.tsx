export type CanjeGameId = 'free_fire' | 'roblox' | 'clash_royale' | 'efootball';

export interface CanjeGame {
  id: CanjeGameId;
  label: string;
}

export interface CanjeReward {
  id: string;
  label: string;
  coinCost: number;
  keyCost: number;
}

export const CANJE_GAMES: CanjeGame[] = [
  { id: 'free_fire', label: 'Free Fire' },
  { id: 'roblox', label: 'Roblox' },
  { id: 'clash_royale', label: 'Clash Royale' },
  { id: 'efootball', label: 'eFootball' },
];

export const CANJE_REWARDS: CanjeReward[] = [
  { id: '100_dm', label: '100 Diamantes', coinCost: 20000, keyCost: 1 },
  { id: '310_dm', label: '310 Diamantes', coinCost: 40000, keyCost: 2 },
  { id: '520_dm', label: '520 Diamantes', coinCost: 80000, keyCost: 3 },
  { id: '1060_dm', label: '1060 Diamantes', coinCost: 160000, keyCost: 5 },
];

export function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes} min`;
  return 'Hace un momento';
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
