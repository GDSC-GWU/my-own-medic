const CACHE_NAME = 'mom-medical-cache-v1';
const urlsToCache = [
  '/',
  '/home.html',
  '/css/styles.css',
  '/css/mobile.css',
  '/js/scripts.js',
  '/js/chat.js',
  '/assets/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});