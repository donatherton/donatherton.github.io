const ASSET_CACHE = 'weather-v1';
const assets = [
  "/weather-app/",
  "/weather-app/index.html",
  "/weather-app/index.js",
  "/weather-app/hourly.html",
  "/weather-app/hourly.js",
  "/weather-app/5-days.html",
  "/weather-app/5-days.js",
  "/weather-app/leaflet.js",
  "/weather-app/leaflet.css",
  "/weather-app/radar.html",
  "/weather-app/PNG/01d.png",
  "/weather-app/PNG/01n.png",
  "/weather-app/PNG/02d.png",
  "/weather-app/PNG/02n.png",
  "/weather-app/PNG/03d.png",
  "/weather-app/PNG/03n.png",
  "/weather-app/PNG/04d.png",
  "/weather-app/PNG/04n.png",
  "/weather-app/PNG/09d.png",
  "/weather-app/PNG/09n.png",
  "/weather-app/PNG/10d.png",
  "/weather-app/PNG/10n.png",
  "/weather-app/PNG/11d.png",
  "/weather-app/PNG/11n.png",
  "/weather-app/PNG/13d.png",
  "/weather-app/PNG/13n.png",
  "/weather-app/PNG/50d.png",
  "/weather-app/PNG/50n.png",
  "/weather-app/css/owfont-regular.css",
  "/weather-app/css/owfont-regular.min.css",
  "/weather-app/fonts/owfont-regular.eot",
  "/weather-app/fonts/owfont-regular.otf",
  "/weather-app/fonts/owfont-regular.svg",
  "/weather-app/fonts/owfont-regular.ttf",
  "/weather-app/fonts/owfont-regular.woff",
]

self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing');
  event.waitUntil(
    caches.open(ASSET_CACHE)
    .then(cache => cache.addAll(assets))
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})
