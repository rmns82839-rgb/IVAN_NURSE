/**
 * SERVICE WORKER - IVÁN NURSE PWA
 * Optimizado para carga rápida y funcionamiento offline
 */

const CACHE_NAME = 'ivan-nurse-cache-v2'; // Cambia el v2 si haces cambios grandes en el futuro
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './logo.png',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 1. INSTALACIÓN: Guarda los archivos esenciales en la memoria del celular
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Instalando archivos en caché...');
        return cache.addAll(assets);
      })
      .then(() => self.skipWaiting()) // Fuerza a la app a usar el nuevo SW de inmediato
  );
});

// 2. ACTIVACIÓN: Borra versiones viejas del caché para no ocupar espacio de más
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// 3. ESTRATEGIA DE CARGA: Intenta cargar de internet, si falla (offline), usa la caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
