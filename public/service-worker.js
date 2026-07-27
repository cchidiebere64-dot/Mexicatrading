// service-worker.js
// Caches the offline page and serves it when the network fails.

// ⚠️ Bump this version whenever offline.html or logo.png changes,
// otherwise browsers keep serving the previously cached copy.
const CACHE_NAME = "mexicatrading-v2";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  "/offline.html",
  "/logo.png",
];

/* ── Install: cache the offline page ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* ── Activate: drop old caches ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never touch anything that isn't a plain GET
  if (request.method !== "GET") return;

  // Never cache or intercept API traffic — a stale balance or a replayed
  // transaction response would be worse than an error.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Page navigations: try the network, fall back to the offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return (
          cached ||
          new Response(
            "<h1>You're offline</h1><p>Please check your connection.</p>",
            { headers: { "Content-Type": "text/html" }, status: 503 }
          )
        );
      })
    );
    return;
  }

  // Static assets: network first, cache as fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || Response.error();
    })
  );
});
