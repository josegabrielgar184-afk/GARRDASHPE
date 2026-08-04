'use client';

import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_IDS = [1001, 1002, 1003];

const MESSAGES = [
  '¡Entra al juego y consigue tus diamantes para próximos eventos!',
  '¡Tu escuadrón te espera! Entra y gana monedas ahora',
  '¡No pierdas tu racha diaria! Entra al juego y desbloquea nuevas recompensas',
];

export async function setupDailyNotifications() {
  try {
    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative = Capacitor?.isNativePlatform?.() ?? false;
    if (!isNative) return;

    const permResult = await LocalNotifications.checkPermissions();
    if (permResult.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') return;
    }

    // Cancel any existing scheduled notifications with our IDs
    await LocalNotifications.cancel({ notifications: NOTIFICATION_IDS.map((id) => ({ id })) });

    const notifications = NOTIFICATION_IDS.map((id, i) => {
      const scheduledTime = new Date();
      scheduledTime.setHours(9 + i * 4, 0, 0, 0);
      if (scheduledTime.getTime() <= Date.now()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      return {
        id,
        title: 'GarrDash',
        body: MESSAGES[i],
        schedule: {
          at: scheduledTime,
          repeats: true,
          every: 'day' as const,
        },
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
      };
    });

    await LocalNotifications.schedule({ notifications });
  } catch {
    // Silently fail on web or if plugin not available
  }
}

export async function cancelAllNotifications() {
  try {
    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative = Capacitor?.isNativePlatform?.() ?? false;
    if (!isNative) return;
    await LocalNotifications.cancel({ notifications: NOTIFICATION_IDS.map((id) => ({ id })) });
  } catch {
    // Silently fail
  }
}
