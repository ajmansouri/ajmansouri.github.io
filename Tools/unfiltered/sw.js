const CACHE = "unfiltered";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-icon.svg",
  "./pwa-icon-192.png",
  "./pwa-icon-512.png",
  "./apple-touch-icon.png",
];
const BUILT_ASSET_PATTERN = /(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g;

async function precacheAppShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(CORE);

  const response = await fetch("./");
  if (!response.ok) throw new Error(`Could not cache the app shell (${response.status}).`);
  const html = await response.text();
  const assets = [...html.matchAll(BUILT_ASSET_PATTERN)].map((match) => match[1]);
  if (assets.length) await cache.addAll(assets);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put("./", response.clone());
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        const cachedPage = await caches.match(request) || await caches.match("./");
        if (cachedPage) return cachedPage;
        throw new Error("The app shell is not cached yet. Open Photo Layout Studio online once before using it offline.");
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
