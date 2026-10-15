const CACHE='mtf-v3';
const SHELL=['./','index.html','config.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','atkinson-hyperlegible-latin-400-normal.woff2','atkinson-hyperlegible-latin-700-normal.woff2','atkinson-hyperlegible-latin-400-italic.woff2','barlow-condensed-latin-600-normal.woff2','barlow-condensed-latin-700-normal.woff2','barlow-condensed-latin-800-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* the page and config.js are always checked online first, and the browser is told not to reuse them without asking again */
const nocache=res=>{const h=new Headers(res.headers);h.set('Cache-Control','no-cache');return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h})};
const fresh=(r,key)=>fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(key||r,c))}return nocache(res)}).catch(()=>caches.match(key||r));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==self.location.origin)return;   /* the class leaderboard always goes straight to the network */
  if(r.mode==='navigate'){e.respondWith(fresh(r,'index.html'));return}
  if(u.pathname.endsWith('/config.js')){e.respondWith(fresh(r));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})));
});
