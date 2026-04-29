const CACHE='horgasz-naplo-pro-v1';
const CORE=['./','index.html','style.css','app.js','data.js','manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{})));
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
