// ============================================================
//  Service Worker — オフライン再生用のキャッシュ
//  アセットを更新したら CACHE_VERSION を上げてください。
// ============================================================
const CACHE_VERSION = 'puzzle-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/data/puzzles.js',
  './js/config/difficulties.js',
  './js/views/home.js',
  './js/views/difficulty.js',
  './js/views/puzzle.js',
  './js/ui/celebrate.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './images/disneysea-night-mickey.jpg',
  './images/disneysea-25th-castle.jpg',
  './images/disneysea-mermaid-lagoon.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // 個別に addAll。1つ失敗しても致命的にしない。
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// キャッシュ優先 + ネットワークフォールバック（GET のみ）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
