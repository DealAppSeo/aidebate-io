const CACHE_NAME = 'aidebate-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: cache-first for audio, network-first for API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache-first for audio files (huge speed boost)
    if (url.pathname.includes('/audio/') || url.pathname.includes('/storage/') || url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;

                return fetch(event.request).then((response) => {
                    // Check for valid response
                    if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                        return response;
                    }

                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                    return response;
                });
            })
        );
        return;
    }

    // Network-first for API calls
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Stale-while-revalidate for pages
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const fetchPromise = fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                    return response;
                });
                return cached || fetchPromise;
            })
        );
    }
});
