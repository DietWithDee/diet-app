/**
 * Utility to detect whether the user is viewing the site inside an in-app browser
 * (e.g. Instagram, Facebook, TikTok, Twitter/X, Snapchat, WhatsApp, LinkedIn, or native webview).
 */
export const isInAppBrowser = () => {
  if (typeof window === "undefined" || !navigator.userAgent) return false;
  
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";

  // Specific well-known in-app browsers
  const inAppPatterns = /Instagram|FBAN|FBAV|FB_IAB|FB4A|TikTok|musical_ly|ByteLocale|Twitter|TwitterAndroid|Snapchat|Line\/|Pinterest|WhatsApp|LinkedInApp|GSA|MicroMessenger/i;
  if (inAppPatterns.test(ua)) return true;

  // iOS In-App Webview (UIWebView / WKWebView inside apps like Instagram/FB):
  // iOS devices use WebKit, but standalone Safari contains "Safari" and mobile safari tokens.
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua);
  const isWebKit = /AppleWebKit/i.test(ua);
  if (isIos && isWebKit && !isSafari) return true;

  // Android Webview (; wv or Version/X.X)
  if (/Android.*wv/i.test(ua) || (ua.includes("Android") && ua.includes("Version/"))) {
    return true;
  }

  return false;
};
