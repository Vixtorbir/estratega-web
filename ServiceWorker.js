// El nombre cambia con cada build, porque los ficheros llevan un hash: así el navegador detecta la versión nueva.
const cacheName = "estratega-0.1.0-8cd0c7d4bbb6f093c125859d63f2f000.wasm.unityweb";
const buildFiles = [
  "Build/db5f7f9531f3e3c4cdb79da658454716.loader.js",
  "Build/be7c1a33e6bad5505e804df8cb5da0f9.framework.js.unityweb",
  "Build/b391fc287edf4d51fb0b171117c8c827.data.unityweb",
  "Build/8cd0c7d4bbb6f093c125859d63f2f000.wasm.unityweb",
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
