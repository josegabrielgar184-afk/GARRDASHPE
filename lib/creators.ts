// Creator Program — types, validation, and constants

export type CreatorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type Platform = 'tiktok' | 'youtube' | 'both';

export interface CreatorApplication {
  id: string;
  uid: string;
  channelName: string;
  platform: Platform;
  profileUrl: string;
  videoUrl: string;
  requestedCode: string;
  status: CreatorStatus;
  createdAt: number;
  reviewedAt?: number | null;
  reviewedBy?: string | null;
  rejectReason?: string;
}

export interface CreatorCode {
  code: string;
  uid: string;
  channelName: string;
  platform: Platform;
  status: 'active' | 'suspended';
  createdAt: number;
  approvedAt: number;
  totalReferrals: number;
  pendingQualification: number;
  qualified: number;
  qualifiedThisMonth: number;
  coinsEarned: number;
}

export interface ReferralRecord {
  id: string;
  code: string;
  creatorUid: string;
  referredUid: string;
  status: 'pendingQualification' | 'qualified';
  playerRewardPaid: boolean;
  creatorRewardPaid: boolean;
  qualifiedAt?: number | null;
  createdAt: number;
  playTimeMin: number;
  activeDays: string[];
}

// --- Validation ---

export const CODE_MIN_LENGTH = 4;
export const CODE_MAX_LENGTH = 16;
export const PLAYER_REFERRAL_REWARD = 50;
export const CREATOR_REFERRAL_REWARD = 50;
export const QUALIFY_MIN_MINUTES = 10;
export const QUALIFY_MIN_DAYS = 2;

const BANNED_WORDS = [
  'PUTA', 'CACA', 'MIERDA', 'PENDEJO', 'IDIOT', 'STUPID', 'NIGGA', 'NIGGER',
  'FUCK', 'SHIT', 'BITCH', 'ASSHOLE', 'PENE', 'VAGINA', 'CULO',
];

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_MAX_LENGTH);
}

export function isValidCode(input: string): { ok: boolean; error?: string } {
  const code = normalizeCode(input);
  if (code.length < CODE_MIN_LENGTH) return { ok: false, error: `Minimo ${CODE_MIN_LENGTH} caracteres` };
  if (code.length > CODE_MAX_LENGTH) return { ok: false, error: `Maximo ${CODE_MAX_LENGTH} caracteres` };
  if (!/^[A-Z0-9]+$/.test(code)) return { ok: false, error: 'Solo letras y numeros' };
  for (const word of BANNED_WORDS) {
    if (code.includes(word)) return { ok: false, error: 'Codigo no permitido' };
  }
  return { ok: true };
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getMonthKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getDayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
