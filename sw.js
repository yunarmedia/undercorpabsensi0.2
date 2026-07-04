const CACHE_NAME = 'undercorp-hris-v2';
// Hanya simpan file tampilan dasar
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './179386_2.png'
];

// Instalasi Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Memaksa SW baru langsung aktif
});

// Menghapus cache versi lama jika ada pembaruan
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// Mengatur lalu lintas jaringan
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // PENGAMAN UTAMA: Abaikan cache untuk Firebase, Cloud Firestore, dan Google API
    // Ini memastikan data absensi dan kasbon tetap real-time dan tidak error!
    if (url.includes('firestore.googleapis.com') || url.includes('firebase') || url.includes('google.com')) {
        return; 
    }

    // Untuk file tampilan (HTML/Gambar), ambil dari cache dulu agar cepat
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        }).catch(() => {
            // Abaikan error jika offline
        })
    );
});