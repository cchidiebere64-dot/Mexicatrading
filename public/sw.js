const CACHE_NAME = "mexicatrading-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/logo.png"
];

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate (clear old caches completely)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch (NO blocking of updated assets)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
