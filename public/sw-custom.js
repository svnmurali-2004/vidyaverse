// Custom service worker enhancements
// This extends the next-pwa generated service worker

const CACHE_NAME = "vidyaverse-v1";
const OFFLINE_URL = "/offline";

// Add specific resources to cache
const STATIC_CACHE_URLS = [
  "/",
  "/student/dashboard",
  "/student/courses",
  "/student/profile",
  "/offline",
  "/manifest.json",
];

// Install event - cache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip for chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === "document") {
          return caches.match(OFFLINE_URL);
        }

        // For other resources, return a generic offline response
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any background sync tasks here
      console.log("Background sync triggered")
    );
  }
});

// Push notification handling
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
      actions: [
        {
          action: "explore",
          title: "View Course",
          icon: "/icons/icon-192x192.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icons/icon-192x192.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    // Open the app to a specific course or dashboard
    event.waitUntil(clients.openWindow("/student/dashboard"));
  }
});
