const CACHE = 'kilo-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      try {
        const fresh = await fetch(e.request);
        if (fresh.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, fresh.clone());
        return fresh;
      } catch {
        const hit = await cache.match(e.request, { ignoreSearch: true });
        return hit || (await cache.match('/'));
      }
    })
  );
});

// Web Push: muestra la notificación del recordatorio de entrenar
self.addEventListener('push', e => {
  let data = { title: 'Kilo', body: 'Hora de entrenar.' };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list =>
    list.length ? list[0].focus() : clients.openWindow('/')
  ));
});
