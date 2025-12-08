const CACHE_NAME = 'aidebate-audio-cache-v3-nuclear';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Aggressively cache audio files (mp3, wav, m4a)
    if (url.pathname.match(/\.(mp3|wav|m4a)$/) || event.request.destination === 'audio') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        // Cache valid responses
                        if (networkResponse.ok && networkResponse.type === 'basic') {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
    }
});
