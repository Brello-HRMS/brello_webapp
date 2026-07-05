// Brello service worker — handles Web Push notifications

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Brello', body: event.data.text() };
  }

  const title = payload.title ?? 'Brello';
  const options = {
    body: payload.body ?? payload.message ?? '',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: payload.data ?? {},
    tag: payload.tag ?? 'brello-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url === url && 'focus' in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      }),
  );
});
