// ============================================================
//  Service Worker — オフライン対応 + 更新の反映
//  方針:
//   - アプリのコード(HTML/JS/CSS/manifest)は「network-first」。
//     オンラインなら常に最新を取得し、更新がすぐ反映される。
//     オフライン時のみキャッシュにフォールバック。
//   - 画像・アイコンは「cache-first」（容量が大きく変化が少ない）。
//  アセットを更新したら CACHE_VERSION を上げてください。
// ============================================================
const CACHE_VERSION = 'puzzle-v3';

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

function cacheable(res) {
  return res && res.status === 200 && res.type === 'basic';
}

// 画像・アイコン向け: キャッシュ優先（無ければ取得してキャッシュ）
function cacheFirst(req) {
  return caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((res) => {
      if (cacheable(res)) {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
      }
      return res;
    });
  });
}

// アプリのコード向け: ネットワーク優先（取得できたら最新をキャッシュ更新、
// オフライン時のみキャッシュへフォールバック）
function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      if (cacheable(res)) {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
      }
      return res;
    })
    .catch(() =>
      caches.match(req).then((cached) => cached || caches.match('./index.html'))
    );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 別オリジンは素通し

  // 画像は cache-first、それ以外(ページ/JS/CSS/manifest)は network-first
  const isImage = req.destination === 'image' || /\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname);
  event.respondWith(isImage ? cacheFirst(req) : networkFirst(req));
});
