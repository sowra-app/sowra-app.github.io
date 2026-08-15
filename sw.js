const CACHE='sowra-v1';
const ASSETS=[
  './','./index.html','./style.css','./app.js','./places.js','./capture.js',
  './photos.js','./week.js','./upload.js','./auth.js','./admin.js','./main.js',
  './supabase.js','./leaflet.js','./leaflet.css',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const u=e.request.url;
  // لا تخزّن طلبات القاعدة أو الصور
  if(u.includes('supabase.co')||u.includes('tile.openstreetmap'))return;
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request))
  );
});
