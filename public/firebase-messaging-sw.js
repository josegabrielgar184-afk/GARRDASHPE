// Firebase Cloud Messaging Service Worker - GarrDash
// Intercepts background push notifications even when the app is closed

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
  authDomain: "garrdash.firebaseapp.com",
  projectId: "garrdash",
  storageBucket: "garrdash.firebasestorage.app",
  messagingSenderId: "913250323167",
  appId: "1:913250323167:web:9a04296cfb1566de51f76a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages when app is closed or in background
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'GarrDash';
  const notificationBody = payload.notification?.body || payload.data?.body || '';

  const notificationOptions = {
    body: notificationBody,
    icon: '/ic_launcher_foreground.webp',
    badge: '/ic_launcher_foreground.webp',
    tag: 'garrdash-canje',
    requireInteraction: true,
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
