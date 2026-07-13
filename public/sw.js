const CACHE = 'fitred-v3';
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
