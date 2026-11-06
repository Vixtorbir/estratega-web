// El nombre cambia con cada build, porque los ficheros llevan un hash: así el navegador detecta la versión nueva.
const cacheName = "estratega-0.1.0-be1ad51f0bb6df50dcd8ad6e510bfc1c.wasm.unityweb";
const buildFiles = [
  "Build/84e72c174cd8782a2afc047998121693.loader.js",
  "Build/e5fcec2978ab1df5ff8503bbc0930277.framework.js.unityweb",
  "Build/81e0b8cdc8db973a147c8dd7cdf34155.data.unityweb",
  "Build/be1ad51f0bb6df50dcd8ad6e510bfc1c.wasm.unityweb",
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
