/// <reference lib="webworker" />

const CACHE_NAME = 'sacrament-ledger-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/index.css',
    '/src/styles/design-system.css',
];

const self = globalThis as unknown as ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') return;

    // No cachear peticiones a la API de CouchDB/PouchDB (ya tienen su propia persistencia)
    const url = new URL(event.request.url);
    if (url.port === '5984' || url.pathname.includes('/_')) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Cachear nuevos assets del app shell
                if (fetchResponse.status === 200) {
                    const responseClone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return fetchResponse;
            });
        }).catch(() => {
            // Fallback offline para navegación
            if (event.request.mode === 'navigate') {
                return caches.match('/');
            }
            return new Response('Offline content unavailable', { status: 503 });
        }) as Promise<Response>
    );
});
