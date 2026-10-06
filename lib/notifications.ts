'use client';

import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_IDS = [1001];

const MESSAGES = [
  'Tu racha diaria te espera en GarrDash. Entra y mantén el progreso vivo.',
  'Tienes llaves sin usar en la Campaña. Avanza un nivel más hoy.',
  'La ruleta tiene un giro gratis para ti. ¡Pruébala antes de que se reinicie!',
  'Sube en los rankings de Arcade hoy. Cada partida cuenta.',
  'Sigue de cerca tu progreso en el Camino del Vicio. ¿Cuánto aguantas?',
  'Tus monedas acumuladas pueden canjearse. Revisa las recompensas disponibles.',
  'Una partida rápida en Arcade te acerca a tu próximo canje.',
  'No pierdas tu racha. Entra a GarrDash y juega una partida hoy.',
  'El Camino del Vicio te desafía. ¿Listo para superar tu mejor tiempo?',
  'Revisa los rankings: hay jugadores que estás a punto de superar.',
  'Tus llaves de Campaña te esperan. Úsalas para desbloquear el siguiente nivel.',
  'La ruleta gratis diaria está disponible. ¡Gírala y prueba tu suerte!',
];

function pickMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

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

    await LocalNotifications.cancel({ notifications: NOTIFICATION_IDS.map((id) => ({ id })) });

    const scheduledTime = new Date();
    scheduledTime.setHours(12, 0, 0, 0);
    if (scheduledTime.getTime() <= Date.now()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_IDS[0],
        title: 'GarrDash',
        body: pickMessage(),
        schedule: {
          at: scheduledTime,
          repeats: true,
          every: 'day' as const,
        },
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
      }],
    });
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
