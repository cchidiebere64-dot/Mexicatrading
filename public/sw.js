self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("mexica-cache").then(cache => {
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
