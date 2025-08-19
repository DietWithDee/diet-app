self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const CACHE_STATIC = "static-v1";
const STATIC_ASSETS = ["/", "/index.html"]; // add more built assets if you want precache

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // App shell routing for navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Stale-while-revalidate for scripts/styles/workers
  if (["script", "style", "worker"].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const net = fetch(request).then((res) => {
          cache.put(request, res.clone());
          return res;
        });
        const cached = await cache.match(request);
        return cached || net;
      })
    );
    return;
  }

  // Cache-first for images
  if (request.destination === "image") {
    event.respondWith(
      caches.open("images-v1").then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        cache.put(request, res.clone());
        return res;
      })
    );
  }
});
