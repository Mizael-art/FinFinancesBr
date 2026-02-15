/**
 * FinFinance PWA — Service Worker
 * Cache de todos os arquivos para funcionamento offline
 */

const CACHE_NAME = 'finfinance-v2.0.0';
const ASSETS = [
  '',
  'index.html',
  'style.css',
  'themes.css',
  'mobile.css',
  'app.js',
  'app-v2.js',
  'db.js',
  'manifest.json',
  'assets/logo.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalação — cachear assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativação — limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — servir do cache, senão buscar rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('index.html'))
  );
});
