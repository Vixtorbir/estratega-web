// El nombre cambia con cada build, porque los ficheros llevan un hash: así el navegador detecta la versión nueva.
const cacheName = "estratega-0.1.0-e137ef7af4d9307d984a60b36fcaccbe.wasm.unityweb";
const buildFiles = [
  "Build/708311a26b25d1f307e2375c426627e5.loader.js",
  "Build/70dee16053c5b63a839d559a41c1bd6a.framework.js.unityweb",
  "Build/adcada9a360a218b3d6699c456161609.data.unityweb",
  "Build/e137ef7af4d9307d984a60b36fcaccbe.wasm.unityweb",
  "TemplateData/style.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => cache.addAll(buildFiles))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== cacheName).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // La página siempre se pide a la red si hay conexión, para enterarse de las versiones nuevas.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put("index.html", copy));
          return response;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // El resto lleva hash en el nombre o no cambia: primero la caché, así se gastan menos datos.
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
