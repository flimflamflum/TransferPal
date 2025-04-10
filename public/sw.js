// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "transferpal-offline"

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/offline", "/", "/icons/icon-192x192.png", "/icons/icon-512x512.png"])),
  )
})

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If request was successful, add result to cache
        event.waitUntil(updateCache(event.request, response.clone()))
        return response
      })
      .catch((error) => {
        // If network request failed, try to get it from cache
        return fromCache(event.request).catch(() => {
          // If both fail, show a generic fallback:
          if (event.request.url.indexOf("/api/") === -1) {
            return caches.match("/offline")
          }

          // If we were trying to fetch an API request, return a simple JSON response
          return new Response(
            JSON.stringify({
              error: "You are offline and this resource is not available offline.",
            }),
            {
              headers: { "Content-Type": "application/json" },
              status: 503,
            },
          )
        })
      }),
  )
})

function fromCache(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) => {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match")
      }
      return matching
    }),
  )
}

function updateCache(request, response) {
  // Don't cache API requests or non-successful responses
  if (request.url.indexOf("/api/") !== -1 || !response || response.status !== 200) {
    return Promise.resolve()
  }

  return caches.open(CACHE).then((cache) => cache.put(request, response))
}

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener("refreshOffline", () => {
  const offlinePageRequest = new Request("/offline")

  return fetch(offlinePageRequest).then((response) =>
    caches.open(CACHE).then((cache) => cache.put(offlinePageRequest, response)),
  )
})

// Listen to Push events
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = JSON.parse(event.data.text())

    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: {
        url: data.url || "/",
      },
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url))
})

