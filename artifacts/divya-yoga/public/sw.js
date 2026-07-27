const CACHE_NAME = 'divya-yoga-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './prototype.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return new Response(
              '<!doctype html><html lang="en"><meta charset="utf-8"><title>Divya Yoga is offline</title><body style="margin:0;background:#F4EDE1;color:#4A5A33;font:16px Inter, sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center"><main><h1>You are offline</h1><p>Reconnect to open Archana’s Divya Yoga Studio.</p></main></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            );
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
    }),
  );
});