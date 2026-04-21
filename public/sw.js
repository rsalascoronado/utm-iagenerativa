/* UTM Encuesta Dashboard — Service Worker
 * Estrategias:
 *  - Precache de assets básicos al instalar.
 *  - Navegación HTML: network-first con fallback a caché.
 *  - Assets estáticos (JS/CSS/imágenes/fuentes): stale-while-revalidate.
 *  - Server function `generateInsights`: caché dedicada con fallback JSON estructurado.
 *  - Resto: pasa por la red.
 */
const VERSION = "utm-pwa-v2";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const INSIGHTS_CACHE = `${VERSION}-insights`;
const OFFLINE_URL = "/";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(url) {
  return /\.(?:js|mjs|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp|ico)$/i.test(
    url.pathname,
  );
}

function isInsightsRequest(url) {
  // TanStack server function URL contains the function id; match by name.
  return /generateInsights/i.test(url.pathname + url.search);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(OFFLINE_URL);
    if (fallback) return fallback;
    return new Response("Sin conexión", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

/**
 * Fallback estructurado para la server function de hallazgos.
 * 1) Intenta red.
 * 2) Si falla, devuelve la última respuesta cacheada para esa población.
 * 3) Si no hay caché, devuelve un JSON con flag `offline: true` que el cliente
 *    puede detectar y combinar con el respaldo en localStorage.
 */
async function insightsHandler(request) {
  const cache = await caches.open(INSIGHTS_CACHE);

  // Identifica la población a partir del cuerpo (POST) para usar como cache key.
  let population = "default";
  try {
    const cloned = request.clone();
    const body = await cloned.json().catch(() => null);
    const pop = body?.data?.population;
    if (pop === "estudiantes" || pop === "docentes") population = pop;
  } catch {
    /* noop */
  }
  const cacheKey = new Request(
    `${self.location.origin}/__insights-cache/${population}`,
    { method: "GET" },
  );

  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      // Guardamos clon como GET para poder recuperarlo independientemente del POST original.
      const body = await fresh.clone().text();
      cache.put(
        cacheKey,
        new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-UTM-Cached-At": new Date().toISOString(),
          },
        }),
      );
    }
    return fresh;
  } catch {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedAt = cached.headers.get("X-UTM-Cached-At") || "";
      const text = await cached.text();
      return new Response(text, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-UTM-Offline-Cache": "1",
          "X-UTM-Cached-At": cachedAt,
        },
      });
    }
    return new Response(
      JSON.stringify({
        offline: true,
        error:
          "Sin conexión y sin análisis previo guardado para esta población.",
        population,
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-UTM-Offline-Cache": "1",
        },
      },
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Server function de hallazgos: handler dedicado (POST permitido)
  if (isInsightsRequest(url)) {
    event.respondWith(insightsHandler(request));
    return;
  }

  if (request.method !== "GET") return;

  // Otras server functions: pasar por red sin tocar caché
  if (url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/_server")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
});
