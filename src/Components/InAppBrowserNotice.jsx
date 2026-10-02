import React, { useState, useEffect } from "react";
import { ExternalLink, X, Smartphone, AlertTriangle } from "lucide-react";

/**
 * Detects if the user is viewing inside an in-app browser (Instagram, TikTok, Facebook, Twitter, etc.)
 * Provides Android users a 1-tap Chrome breakout intent, and iOS users clear visual guidance to tap "•••" -> "Open in Safari".
 */
export default function InAppBrowserNotice() {
  const [isInApp, setIsInApp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.userAgent) return;

    // Check if dismissed in this session
    try {
      if (sessionStorage.getItem("dwd_dismiss_inapp_notice") === "true") {
        return;
      }
    } catch (e) {
      // ignore storage access errors
    }

    const ua = navigator.userAgent || navigator.vendor || window.opera || "";
    const inAppPatterns = /Instagram|FBAN|FBAV|TikTok|musical_ly|ByteLocale|Twitter|Snapchat|Line\/|Pinterest/i;
    const detectedInApp = inAppPatterns.test(ua);

    if (detectedInApp) {
      setIsInApp(true);
      setIsApple(/iPhone|iPad|iPod/i.test(ua));
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("dwd_dismiss_inapp_notice", "true");
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
      // We instruct the user to use the top/bottom menu.
      alert(
        "To open in Safari:\n\n1. Tap the three dots (•••) or share icon in the top right or bottom corner.\n2. Tap 'Open in Safari' or 'Open in External Browser'."
      );
    } else {
      // Android: launch Chrome or default browser via intent scheme
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
      window.location.href = intentUrl;

      // Fallback after 1 second if Chrome is not installed
      setTimeout(() => {
        const genericIntent = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
        window.location.href = genericIntent;
      }, 1000);
    }
  };

  if (!isInApp || isDismissed) return null;

  return (
    <div className="bg-amber-500 text-white text-xs sm:text-sm px-4 py-2.5 shadow-md sticky top-0 z-50 transition-all border-b border-amber-600/30">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Smartphone size={18} className="text-amber-100 flex-shrink-0 animate-bounce" />
          <p className="leading-snug text-white font-medium">
            {isApple ? (
              <span>
                <strong className="font-bold underline decoration-amber-200">Tip for iPhone:</strong> Tap{" "}
                <span className="bg-amber-600/60 px-1.5 py-0.5 rounded font-bold font-mono">•••</span> at top-right & select{" "}
                <strong>"Open in Safari"</strong> for smooth Mobile Money checkout & PDF downloads.
              </span>
            ) : (
              <span>
                <strong className="font-bold">Browsing inside an app?</strong> Switch to Google Chrome for smooth Paystack Mobile Money payments and instant downloads.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isApple && (
            <button
              onClick={handleOpenExternal}
              className="bg-white text-amber-900 font-bold px-3 py-1 rounded-lg text-xs hover:bg-amber-50 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Open in Chrome</span>
              <ExternalLink size={12} />
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss in-app browser notice"
            className="p-1 text-amber-200 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
