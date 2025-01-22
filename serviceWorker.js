const assets = [
  "/",
  "/index.html",
  "/config.js",
  "leaflet.css",
  "/css/donmaps-style.css",
  "/src/Chart.min.js",
  "/src/leaflet.js",
  "/mapInit.js",
  "/images/24.png",
  "/images/crosshairs.svg",
  "/images/edit-icon.png",
  "/images/fullscreen.png",
  "/images/layers.png",
  "/images/layers-2x.png",
  "/images/loader.gif",
  "/images/location.png",
  "/images/location.svg",
  "/images/marker-end-icon-2x.png",
  "/images/marker-icon.png",
  "/images/marker-icon-1.png",
  "/images/marker-icon-2.png",
  "/images/marker-shadow.png",
  "/images/marker-start-icon-2x.png",
  "/images/marker-via-icon-2x.png",
  "/images/pin-icon-end.png",
  "/images/pin-icon-start.png",
  "/images/pin-shadow.png",
  "/images/routing-icon.png",
  "/images/routing_icon.png",
  "/images/search-icon.png",
  "/images/search-icon-mobile.png",
  "/images/track.odg",
  "/images/upload-icon.odg",
  "/images/view-refresh.png",
]

const putInCache = async (request, response) => {
  const cache = await caches.open("maps-v1");
  await cache.put(request, response);
};

const cacheFirst = async ({ request, fallbackUrl }) => {
  // First try to get the resource from the cache.
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // If the response was not found in the cache,
  // try to get the resource from the network.
  try {
    const responseFromNetwork = await fetch(request);
    // If the network request succeeded, clone the response:
    // - put one copy in the cache, for the next time
    // - return the original to the app
    // Cloning is needed because a response can only be consumed once.
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    // If the network request failed,
    // get the fallback response from the cache.
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // When even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object.
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      fallbackUrl: "/index.html",
    }),
  );
});



// self.addEventListener("install", installEvent => {
//   installEvent.waitUntil(
//     caches.open(staticMaps).then(cache => {
//       cache.addAll(assets)
//     })
//   )
// })

// self.addEventListener("fetch", fetchEvent => {
//   fetchEvent.respondWith(
//     caches.match(fetchEvent.request).then(res => {
//       return res || fetch(fetchEvent.request)
//     })
//   )
// })
