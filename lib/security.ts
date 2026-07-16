'use client';

export const MAX_COINS_PER_GAME = 50;

export function detectEmulator(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const emulatorIndicators = [
    'sdk_gphone', 'google_sdk', 'emulator', 'android sdk built for x86',
    'bluestacks', 'ldplayer', 'noxplayer', 'memu', 'genymotion', 'waydroid',
  'x86_64', 'generic_x86',
  ];
  for (const indicator of emulatorIndicators) {
    if (ua.includes(indicator)) return true;
  }
  // Check for emulator-like screen dimensions
  if (window.screen.width === 1080 && window.screen.height === 1920 && navigator.hardwareConcurrency === 4) {
    return false;
  }
  // Check for missing device features
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
    return true;
  }
  return false;
}

export function detectVPN(): boolean {
  if (typeof navigator === 'undefined') return false;
  // WebRTC IP leak detection (simplified)
  try {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && connection.type === 'vpn') return true;
  } catch {}
  // Check for known VPN browser extensions
  try {
    if ((navigator as any).plugins && (navigator as any).plugins.length === 0 && navigator.userAgent.includes('Chrome')) {
      // Some VPNs strip plugins - not definitive
    }
  } catch {}
  // Timezone mismatch check
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    if (tz === 'America/New_York' && offset === 0) return true;
    if (tz === 'Europe/London' && offset === -300) return true;
  } catch {}
  return false;
}

export function detectMemoryManipulation(): boolean {
  if (typeof window === 'undefined') return false;
  // Check for GameGuardian, Lucky Patcher, etc. via known patterns
  try {
    const ua = navigator.userAgent.toLowerCase();
    const hackTools = ['gameguardian', 'lucky patcher', 'xposed', 'frida', 'magisk', 'substrate'];
    for (const tool of hackTools) {
      if (ua.includes(tool)) return true;
    }
  } catch {}
  // Check for debugger/devtools open (simplified)
  try {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      // DevTools might be open - not definitive, so don't block
    }
  } catch {}
  return false;
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown';
  let id = localStorage.getItem('deviceId');
  if (!id) {
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    id = `dev_${random}${timestamp}`;
    localStorage.setItem('deviceId', id);
  }
  return id;
}

export function validateCoinGain(coins: number): { ok: boolean; suspicious: boolean } {
  if (coins < 0) return { ok: false, suspicious: true };
  if (coins > MAX_COINS_PER_GAME) return { ok: false, suspicious: true };
  return { ok: true, suspicious: false };
}
