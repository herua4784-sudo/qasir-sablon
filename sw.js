// Service worker Qasir Sablon Gelas
// Tugas: menyimpan file aplikasi di HP supaya bisa dibuka tanpa internet.
// Kalau Anda mengubah index.html, naikkan angka versi di bawah (v1 -> v2)
// supaya HP mengambil file yang baru.
const CACHE = 'qasir-sablon-v24';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

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

// Ambil dari HP dulu (cepat, tetap jalan saat sinyal jelek), lalu perbarui diam-diam bila online.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const tersimpan = await cache.match(e.request, { ignoreSearch: true });
      const dariJaringan = fetch(e.request)
        .then((res) => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => null);
      return tersimpan || (await dariJaringan) || cache.match('./index.html');
    })
  );
});
