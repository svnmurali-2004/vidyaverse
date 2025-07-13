"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Manual service worker registration as fallback
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
          
          // Check for updates
          registration.addEventListener("updatefound", () => {
            console.log("Service Worker update found");
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New content is available; please refresh.");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Service Worker message:", event.data);
      });

      // Workbox registration (if available)
      if (window.workbox !== undefined) {
        const wb = window.workbox;
        
        wb.addEventListener("installed", (event) => {
          console.log("Workbox Service Worker installed:", event);
        });

        wb.addEventListener("controlling", (event) => {
          console.log("Workbox Service Worker controlling:", event);
        });

        wb.addEventListener("activated", (event) => {
          console.log("Workbox Service Worker activated:", event);
        });

        wb.register();
      }
    }
  }, []);

  return null;
}
