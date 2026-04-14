const STATIC_CACHE = 'stocklocal-static-v4';
const DYNAMIC_CACHE = 'stocklocal-dynamic-v4';

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

const EMPTY_JSON_RESPONSE = new Response(JSON.stringify([]), {
  headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request, fallbackResponse = null) {
  try {
    const response = await fetch(request);

    if (response && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }

    throw new Error('Respuesta de red no válida');
  } catch (error) {
    const cached = await caches.match(request);
    return cached || fallbackResponse;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkFetch;
  return networkResponse || caches.match('/offline.html');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // No interceptar peticiones externas como InfinityFree
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, caches.match('/offline.html')));
    return;
  }

  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/');
      }

      return null;
    })
  );
});
