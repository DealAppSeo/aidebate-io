const CACHE_NAME = 'aidebate-audio-v1';
const AUDIO_CACHE = 'aidebate-audio-files';

// Cache audio files on fetch
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache audio files from Supabase storage
    if (url.pathname.includes('/storage/') &&
        (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav'))) {
        event.respondWith(
            caches.open(AUDIO_CACHE).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) {
                    return cached; // Return cached audio instantly
                }

                const response = await fetch(event.request);
                if (response.ok) {
                    cache.put(event.request, response.clone());
                }
                return response;
            })
        );
    }
});

// Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== AUDIO_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
});
