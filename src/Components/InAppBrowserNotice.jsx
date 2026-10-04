import React, { useState, useEffect } from "react";
import { ExternalLink, X, Smartphone } from "lucide-react";
import { isInAppBrowser } from "../utils/inAppBrowser";

/**
 * Detects if the user is viewing inside an in-app browser (Instagram, TikTok, Facebook, Twitter, etc.)
 * Provides Android users a 1-tap browser breakout intent, and iOS users clear visual guidance to tap "•••" -> "Open in browser".
 */
export default function InAppBrowserNotice() {
  const [isInApp, setIsInApp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = typeof window !== "undefined" ? window.location.search : "";
    const forceInApp = search.includes("inapp=true") || search.includes("inapp=ios") || search.includes("inapp=android");
    const forceApple = search.includes("inapp=ios");
    const forceAndroid = search.includes("inapp=android");

    // Check if dismissed in this session (bypassed if test query param is present)
    if (!forceInApp) {
      try {
        if (sessionStorage.getItem("dwd_dismiss_inapp_notice") === "true") {
          return;
        }
      } catch (e) {
        // ignore storage access errors
      }
    }

    if (isInAppBrowser() || forceInApp) {
      setIsInApp(true);
      const ua = navigator.userAgent || "";
      const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
      setIsApple(forceApple || (!forceAndroid && isIosDevice));
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("dwd_dismiss_inapp_notice", "true");
      window.dispatchEvent(new Event("dwd_inapp_dismissed"));
    } catch (e) {
      // ignore
    }
  };

  const handleOpenExternal = () => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;
    const cleanUrl = currentUrl.replace(/^https?:\/\//, "");

    if (isApple) {
      // iOS blocks arbitrary JS redirects to Safari from within WKWebView.
      // We instruct the user to use the native top/bottom menu.
      alert(
        "To open in browser:\n\n1. Tap the three dots (•••) or share icon in the top right or bottom corner.\n2. Tap 'Open in browser' or 'Open in Safari'."
      );
    } else {
      // Android: 1-tap breakout via Android Chrome intent
      const chromeIntent = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
      // Generic fallback for Samsung Internet, Firefox, Brave, etc.
      const genericIntent = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;

      try {
        window.location.href = chromeIntent;
      } catch (err) {
        window.location.href = genericIntent;
      }

      // Fallback after 800ms if Chrome is not installed
      setTimeout(() => {
        window.location.href = genericIntent;
      }, 800);
    }
  };

  if (!isInApp || isDismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-[#F6841F] to-amber-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 shadow-md transition-all border-t border-white/20">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          <Smartphone size={17} className="text-amber-100 flex-shrink-0 animate-bounce" />
          <p className="leading-snug text-white font-medium text-[11px] sm:text-xs md:text-sm">
            {isApple ? (
              <span>
                <strong className="font-bold underline decoration-amber-200">Tip for iPhone:</strong> Tap{" "}
                <span className="bg-amber-700/60 px-1.5 py-0.5 rounded font-bold font-mono text-[10px] sm:text-xs">•••</span> at top-right & select{" "}
                <strong>"Open in browser"</strong> for checkout, downloads, and to install the app.
              </span>
            ) : (
              <span>
                <strong className="font-bold">Browsing inside an app?</strong> Tap{" "}
                <span className="underline decoration-amber-200 font-bold">Open in browser</span> (or tap{" "}
                <span className="bg-amber-700/60 px-1.5 py-0.5 rounded font-bold font-mono text-[10px] sm:text-xs">⋮</span> at top-right) for checkout and downloads.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleOpenExternal}
            className="bg-white text-amber-900 font-bold px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs hover:bg-amber-50 transition-all shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Open in browser</span>
            <ExternalLink size={12} />
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss in-app browser notice"
            className="p-1 text-amber-100 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders an invisible document flow spacer when InAppBrowserNotice is active
 * so page content (headings, heroes) is never covered by the expanded fixed header.
 */
export function InAppBrowserSpacer() {
  const [isInApp, setIsInApp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = window.location.search || "";
    const forceInApp = search.includes("inapp=true") || search.includes("inapp=ios");

    if (!forceInApp) {
      try {
        if (sessionStorage.getItem("dwd_dismiss_inapp_notice") === "true") return;
      } catch (e) {}
    }

    if (isInAppBrowser() || forceInApp) {
      setIsInApp(true);
    }

    const onDismiss = () => setIsDismissed(true);
    window.addEventListener("dwd_inapp_dismissed", onDismiss);
    return () => window.removeEventListener("dwd_inapp_dismissed", onDismiss);
  }, []);

  if (!isInApp || isDismissed) return null;

  return <div className="h-14 sm:h-12 w-full transition-all" aria-hidden="true" />;
}
