import { COINS_PER_USD, SOLES_PER_USD } from '@/lib/config';

export type CanjeStatus =
  | 'pending_review'
  | 'waiting_correction'
  | 'approved'
  | 'rejected';

export type CanjeGameId = 'free_fire' | 'mlbb' | 'pubg' | 'cod_mobile';

export const CANJE_GAMES: Array<{ id: CanjeGameId; label: string; icon: string }> = [
  { id: 'free_fire', label: 'Free Fire', icon: '🔥' },
  { id: 'mlbb', label: 'Mobile Legends', icon: '⚔️' },
  { id: 'pubg', label: 'PUBG Mobile', icon: '🎯' },
  { id: 'cod_mobile', label: 'COD Mobile', icon: '🔫' },
];

export const CANJE_REWARDS: Array<{ id: string; label: string; coinCost: number; keyCost: number; usdValue: number }> = [
  { id: 'diamonds_100', label: '100 Diamantes', coinCost: 10000, keyCost: 5, usdValue: 1.0 },
  { id: 'diamonds_310', label: '310 Diamantes', coinCost: 25000, keyCost: 10, usdValue: 3.0 },
  { id: 'diamonds_520', label: '520 Diamantes', coinCost: 40000, keyCost: 15, usdValue: 5.0 },
  { id: 'diamonds_1060', label: '1060 Diamantes', coinCost: 75000, keyCost: 25, usdValue: 10.0 },
];

export const CORRECTION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface CanjeRequest {
  id: string;
  userId: string;
  userName: string;
  gameId: CanjeGameId;
  selectedReward: string;
  coinCost: number;
  keyCost: number;
  estimatedUsdValue: number;
  status: CanjeStatus;
  createdAt: number; // epoch ms
  queuePosition: number;
  playerID: string;
  nickname: string;
  correctionDeadline?: number | null; // epoch ms when waiting_correction
  approvedAt?: number | null;
  rejectedAt?: number | null;
  rejectReason?: string;
}

export function getRewardById(id: string) {
  return CANJE_REWARDS.find((r) => r.id === id);
}

export function coinsToUsd(coins: number): number {
  return coins / COINS_PER_USD;
}

export function coinsToSoles(coins: number): number {
  return (coins / COINS_PER_USD) * SOLES_PER_USD;
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  }
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function isCorrectionExpired(deadline: number | null | undefined): boolean {
  if (!deadline) return false;
  return Date.now() >= deadline;
}

export function getDayKey(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDayLabel(epochMs: number): string {
  const d = new Date(epochMs);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
