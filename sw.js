// Pligter service worker: gør appen installérbar og viser sidste version offline.
// Data hentes altid live fra Supabase (caches ikke).
const CACHE = "pligter-v1";
const SKAL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SKAL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const kopi = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, kopi)); return res; })
      .catch(() => caches.match(e.request))
  );
});
