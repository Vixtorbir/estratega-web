// El nombre cambia con cada build, porque los ficheros llevan un hash: así el navegador detecta la versión nueva.
const cacheName = "estratega-0.1.0-4c094569fd939a6a741d4c3b5abb6d5b.wasm.unityweb";
const buildFiles = [
  "Build/6b4a13954f3875c8f10a7f19ad21855c.loader.js",
  "Build/67582b5366df4165fb78212f4ce7dab7.framework.js.unityweb",
  "Build/a5d8854d63ae9f468f3b52afa8edd288.data.unityweb",
  "Build/4c094569fd939a6a741d4c3b5abb6d5b.wasm.unityweb",
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
