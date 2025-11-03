// Service Worker para Sistema de Gestión de NAPs
// Versión del cache - incrementar cuando se actualice el SW
const CACHE_VERSION = 'nap-management-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Páginas principales
  '/login',
  '/dashboard',
  '/offline.html'
];

// URLs de API que se pueden cachear
const CACHEABLE_API_ROUTES = [
  '/api/naps',
  '/api/auth/profile'
];

// Tiempo de vida del cache de API (5 minutos)
const API_CACHE_DURATION = 5 * 60 * 1000;

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error during installation:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName.includes('nap-management') && cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Tomar control de todas las pestañas
        return self.clients.claim();
      })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar peticiones HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estrategia para diferentes tipos de recursos
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Verificar si es un recurso estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/static/') || 
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg');
}

// Verificar si es una petición de API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Verificar si es una petición de navegación
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Manejar recursos estáticos (Cache First)
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error handling static asset:', error);
    // Intentar servir desde cache como fallback
    return caches.match(request);
  }
}

// Manejar peticiones de API (Network First con cache temporal)
async function handleAPIRequest(request) {
  try {
    // Intentar petición de red primero
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      // Cachear solo peticiones GET exitosas
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Agregar timestamp para expiración
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...Object.fromEntries(responseToCache.headers.entries()),
          'sw-cached-at': Date.now().toString()
        }
      });
      
      cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache');
    
    // Si falla la red, intentar servir desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Verificar si el cache no ha expirado
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt && (Date.now() - parseInt(cachedAt)) < API_CACHE_DURATION) {
        return cachedResponse;
      }
    }
    
    // Si no hay cache válido, devolver error offline
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión', 
        message: 'No se pudo conectar al servidor y no hay datos en cache' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejar peticiones de navegación (Network First con fallback offline)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache');
    
    // Intentar servir desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback final - página básica offline
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Sin Conexión - NAP Management</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0; background: #f8f9fa;
            }
            .offline-container {
              text-align: center; padding: 40px; background: white;
              border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #dc3545; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            button {
              background: #667eea; color: white; border: none;
              padding: 12px 24px; border-radius: 6px; cursor: pointer;
              font-size: 16px; margin-top: 20px;
            }
            button:hover { background: #5a67d8; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1>Sin Conexión</h1>
            <p>No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Manejar otras peticiones dinámicas (Network First)
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Manejar notificaciones push (opcional)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nuevo NAP registrado',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'nap-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'Ver NAP'
        },
        {
          action: 'dismiss',
          title: 'Descartar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'NAP Management', options)
    );
  } catch (error) {
    console.error('[SW] Error handling push notification:', error);
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

console.log('[SW] Service Worker loaded successfully');