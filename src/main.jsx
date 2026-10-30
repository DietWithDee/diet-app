import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./MainLayout/MainLayout";

import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainLayout />
  </StrictMode>,
);

// ✅ Register service worker for PWA only in production builds.
// In local dev, proactively unregister any lingering service workers and clear caches
// so stale chunks and multiple instances of React / Firebase never clash.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const register = () => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm("New content available. Reload?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register);
  } else {
    register();
  }
} else if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
}
