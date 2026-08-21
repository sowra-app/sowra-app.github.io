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
/* ====== استقبال الإشعارات ====== */
self.addEventListener('push', function(event){
  let d={title:'صورة من بلدي',body:'',url:'/'};
  try{ if(event.data) d=Object.assign(d,event.data.json()); }catch(e){
    try{ d.body=event.data?event.data.text():''; }catch(_){}
  }
  event.waitUntil(
    self.registration.showNotification(d.title,{
      body:d.body,
      icon:'icon-192.png',
      badge:'icon-192.png',
      dir:'rtl',
      lang:'ar',
      tag:d.tag||'sowra',
      renotify:true,
      data:{url:d.url||'/'},
      vibrate:[60,40,60]
    })
  );
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)||'/';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      for(const c of list){
        if('focus' in c){ c.navigate(url); return c.focus(); }
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});
