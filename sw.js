
const CACHE_NAME = 'inspeccion-visual-v1';

const ARCHIVOS_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ARCHIVOS_CACHE);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((nombresCache) => {
                return Promise.all(
                    nombresCache.map((nombre) => {
                        if (nombre !== CACHE_NAME) {
                            return caches.delete(nombre);
                        }
                    })
                );
            })
    );
});

// Estrategia Cache First
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((respuestaCache) => {
                if (respuestaCache) {
                    return respuestaCache;
                }

                return fetch(event.request)
                    .then((respuestaRed) => {
                        if (!respuestaRed || respuestaRed.status !== 200) {
                            return respuestaRed;
                        }

                        return caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, respuestaRed.clone());
                                return respuestaRed;
                            });
                    });
            })
    );
});
