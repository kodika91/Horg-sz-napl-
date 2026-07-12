// sw.js — KapásPont offline Service Worker
const KILL = false;
const VERSION = 'kp-sw-v19-canonical-catch-model-v8';
const RUNTIME = 'kp-runtime-' + VERSION;
const SHELL = 'kp-shell-' + VERSION;
const PRECACHE = ['./', './index.html'];

self.addEventListener('install', e => {
  if (KILL) { self.skipWaiting(); return; }
  e.waitUntil(
    caches.open(SHELL)
      .then(c => Promise.allSettled(PRECACHE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    if (KILL) {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith('kp-')).map(k => caches.delete(k)));
      await self.registration.unregister();
      const cs = await self.clients.matchAll();
      cs.forEach(c => { try { c.navigate(c.url); } catch (_) {} });
      return;
    }
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith('kp-') && k.indexOf(VERSION) === -1)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
    const cs = await self.clients.matchAll();
    cs.forEach(c => { try { c.navigate(c.url); } catch (_) {} });
  })());
});

self.addEventListener('fetch', e => {
  if (KILL) return;
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  e.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      try {
        const sameOrigin = url.origin === self.location.origin;
        const isRaw = url.hostname === 'raw.githubusercontent.com';
        if ((sameOrigin || isRaw) && fresh.ok) {
          const copy = fresh.clone();
          const cache = await caches.open(RUNTIME);
          cache.put(req, copy);
        }
      } catch (_) {}
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const idx = await caches.match('./index.html') || await caches.match('./');
        if (idx) return idx;
      }
      throw err;
    }
  })());
});
