const CACHE_NAME = 'basictech-v2'
const STATIC_CACHE = 'basictech-static-v2'
const DYNAMIC_CACHE = 'basictech-dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
]

const API_CACHE_DURATION = 5 * 60 * 1000

const imageCache = async (request) => {
  if (request.destination === 'image') {
    const cachedResponse = caches.match(request)
    if (cachedResponse) return cachedResponse
    
    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open('basictech-images')
        cache.put(request, response.clone())
      }
      return response
    } catch {
      return new Response('', { status: 408 })
    }
  }
  return fetch(request)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      self.skipWaiting()
    ])
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('basictech-'))
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiCacheStrategy(request))
    return
  }

  if (request.destination === 'image') {
    event.respondWith(imageCache(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request))
    return
  }

  event.respondWith(cacheFirst(request))
})

async function apiCacheStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => {
      if (cachedResponse) return cachedResponse
      return new Response(JSON.stringify({ error: 'Sin conexión' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 408
      })
    })

  return cachedResponse || fetchPromise
}

async function navigationStrategy(request) {
  const cache = await caches.open(STATIC_CACHE)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cachedResponse = await cache.match('/')
    if (cachedResponse) return cachedResponse
    
    return new Response(getOfflineHTML(), {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    })
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Recurso no disponible offline', { status: 408 })
  }
}

function getOfflineHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión - BasicTechShop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #1e293b; margin-bottom: 8px; font-size: 24px; }
    p { color: #64748b; margin-bottom: 24px; }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Sin conexión</h1>
    <p>Parece que perdiste la conexión. Verifica tu internet e intenta de nuevo.</p>
    <button onclick="window.location.reload()">Reintentar</button>
  </div>
</body>
</html>`
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ],
    tag: data.tag || 'basictech-notification',
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'BasicTechShop', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'close') return
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        return clients.openWindow(urlToOpen)
      })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart())
  }
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncCart() {
  console.log('Syncing cart...')
}

async function syncOrders() {
  console.log('Syncing orders...')
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    const { urls } = event.data
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => cache.addAll(urls))
    )
  }
})
