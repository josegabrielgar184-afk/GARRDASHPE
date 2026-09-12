'use client';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const VAPID_KEY = 'BLxzZGTQ7x3zq8m4tKQp8s5j2vN6bRf0aH1cDgYeXw=';

export async function requestNotificationPermissionAndToken(userId: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    if (token && userId) {
      await updateDoc(doc(db, 'usuarios', userId), { fcmToken: token }).catch(() => {});
    }

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'GarrDash';
      const body = payload.notification?.body || '';
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/ic_launcher_foreground.webp' });
      }
    });

    return token;
  } catch {
    return null;
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
  } catch {
    // Silently fail if SW registration is not supported
  }
}
