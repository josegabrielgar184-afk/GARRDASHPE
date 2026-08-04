'use client';

let wakeLock: WakeLockSentinel | null = null;

export async function acquireWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock?.addEventListener('release', () => {
        wakeLock = null;
      });
    }
  } catch {
    // Wake Lock not supported or denied
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch {
    // Already released
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null;
}

// Re-acquire wake lock when page becomes visible again
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLock === null) {
      acquireWakeLock();
    }
  });
}
