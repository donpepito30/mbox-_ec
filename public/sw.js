// StreamShield Service Worker - PWA Offline Shell
const CACHE_NAME = 'streamshield-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[StreamShield SW] Advertencia al precachear recursos locales:', err);
      });
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar métodos no GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // REGLA CRÍTICA: NO interceptar ni almacenar en caché orígenes externos
  // Bajo ninguna circunstancia se cachean transmisiones o marcos externos
  if (url.origin !== self.location.origin) {
    return;
  }

  // Las peticiones al endpoint de diagnóstico /api/check-embed deben ir siempre a la red
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            embeddable: false,
            reason: 'Offline: No es posible contactar la API de verificación sin conexión.'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Estrategia Cache First con respaldo de red para el App Shell local
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Si el usuario navega sin conexión, servir el cascarón index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });
    })
  );
});
