// service-worker.js
// Caches the offline page and serves it when network fails

const CACHE_NAME = "mexicatrading-v1";
const OFFLINE_URL = "/offline.html";

// Files to cache for offline use
const PRECACHE_URLS = [
  "/offline.html",
  "/logo.png",
];

// Install: cache the offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: intercept network requests
// If the request fails (no network), show the custom offline page
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for navigation (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Network failed → return cached offline page
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // For other requests (images, scripts, etc), try network first, then cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
