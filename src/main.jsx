import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./MainLayout/MainLayout";

import { registerSW } from 'virtual:pwa-register';

// ✅ Register service worker for PWA using vite-plugin-pwa
if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainLayout />
  </StrictMode>
);
