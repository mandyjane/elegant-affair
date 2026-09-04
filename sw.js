/* Elegant Affair — service worker (Stage 1)
 *
 * Job: make the app launch instantly and work with no network, without ever serving a
 * stale build forever. It caches the app shell only — the HTML document, the manifest and
 * the icons. It NEVER touches your data: guests, budget, seating and photos live in
 * localStorage and IndexedDB, which are owned by the page and invisible to this file.
 * Clearing the cache below cannot delete a single guest.
 *
 * Strategy: stale-while-revalidate for the document. The cached copy is served straight
 * away (fast, and works offline), while a fresh copy is fetched in the background and
 * written to the cache for next time. Trade-off, stated plainly: after you push an update
 * you will still see the OLD build on that first launch, and the NEW one on the launch
 * after. That is the price of instant, offline-guaranteed startup on a 3.7 MB file — the
 * alternative (network-first) would re-download the whole app on every single launch,
 * which is slow on mobile data and fails outright when offline.
 *
 * To force an immediate update: bump CACHE_VERSION below. The activate handler deletes
 * every cache that isn't the current one, so the next launch refetches from the network.
 */

const CACHE_VERSION = 'ea-v168';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  // Cache the shell, but do not let one failed sub-resource abort the whole install —
  // a missing icon should not leave the app with no offline copy of itself.
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Only ever handle same-origin GETs. Anything cross-origin (Supabase, from Stage 2
  // onward) must pass straight through untouched — caching an API response here would be
  // a data-correctness bug, not a performance win.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only http(s). A blob: url parses with this same origin, and the website preview frames
  // are blob documents — the worker must not attempt to cache or serve those.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });

    const network = fetch(req).then(res => {
      // Opaque/error responses must not overwrite a good cached copy.
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    if (cached) { event.waitUntil(network); return cached; }

    const fresh = await network;
    if (fresh) return fresh;

    // Offline, uncached, and it's a navigation → hand back the app shell so a deep link
    // or a cold start still opens the planner rather than the browser's error page.
    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html') || await cache.match('./');
      if (shell) return shell;
    }
    return new Response('Offline and not cached.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  })());
});
