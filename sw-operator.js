// Service worker halaman Operator - terpisah dari service worker aplikasi utama (sw.js),
// dan sengaja hanya mencakup operator.html sendiri (lihat scope saat registrasi di operator.html)
// supaya tidak bentrok / tertimpa oleh cache aplikasi utama.
// Operator.html sendiri sudah punya penyimpanan data terakhir + antrean lewat localStorage,
// jadi service worker ini cukup menyimpan file HALAMANNYA saja supaya bisa dibuka tanpa internet.
const CACHE = 'qasir-operator-v1';
const FILES = ['./operator.html', './manifest-operator.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const tersimpan = await cache.match(e.request, { ignoreSearch: true });
      const dariJaringan = fetch(e.request)
        .then((res) => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => null);
      return tersimpan || (await dariJaringan) || cache.match('./operator.html');
    })
  );
});
