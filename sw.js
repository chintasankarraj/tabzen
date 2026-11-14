/**
 * TabZen Progressive Web App Service Worker
 * Strategy:
 * - HTML Navigations: Network-First with Cache Fallback (prevents stale HTML blocking updates while guaranteeing full offline loading).
 * - Static Assets (CSS, JS, Icons, Manifest): Stale-While-Revalidate (instant 0ms loading + seamless background cache updates).
 */

const CACHE_NAME = 'tabzen-cache-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/audio-engine.js',
  './js/visualizer.js',
  './js/breathing-engine.js',
  './js/app.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable-icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png'
];

// Pre-cache critical core application shell during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Purge obsolete cache stores on activation and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event router
self.addEventListener('fetch', (event) => {
  // Only process GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle HTTP/HTTPS protocols
  if (!url.protocol.startsWith('http')) return;

  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    // 1. Navigation Requests: Network-First with Cache Fallback
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
              cache.put('./index.html', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fall back to cached app shell when offline
          return caches.match('./index.html').then((fallback) => {
            return fallback || caches.match(event.request);
          });
        })
    );
    return;
  }

  // 2. Static Assets: Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, cache failure handled by return below
        });

      // Return cached asset immediately if available; otherwise await network
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Graceful offline fallback for failed requests
      if (isNavigation) {
        return caches.match('./index.html');
      }
    })
  );
});
