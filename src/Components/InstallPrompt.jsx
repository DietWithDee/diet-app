import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.navigator.standalone;

    // Show only on iOS Safari and not already installed
    if (isIos && !isInStandalone) {
      const lastDismissed = localStorage.getItem("installPromptLastDismissed");
      const count = parseInt(localStorage.getItem("installPromptCount") || "0");

      if (!lastDismissed) {
        // Never dismissed before, show after delay
        setTimeout(() => setShow(true), 12000);
      } else {
        const lastTime = parseInt(lastDismissed);
        const now = Date.now();
        const daysSince = (now - lastTime) / (1000 * 60 * 60 * 24);

        // Define intervals based on dismissal count
        let waitDays = 3; // 1st dismissal: wait 3 days
        if (count === 2) waitDays = 7; // 2nd dismissal: wait 1 week
        if (count >= 3) waitDays = 14; // 3+ dismissals: wait 2 weeks

        if (daysSince >= waitDays) {
          setTimeout(() => setShow(true), 12000);
        }
      }
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    const currentCount = parseInt(localStorage.getItem("installPromptCount") || "0");
    localStorage.setItem("installPromptCount", (currentCount + 1).toString());
    localStorage.setItem("installPromptLastDismissed", Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[340px] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/30 bg-white/80 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:bg-black/40">
        {/* Subtle Background Accent */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/10 blur-2xl"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100 p-1">
                <img src="/LOGO.png" alt="DietWithDee Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">Install DietWithDee</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Use as a regular app for better health</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Step 1: Share Icon */}
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white shadow-sm flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11.5H5C3.89543 11.5 3 12.3954 3 13.5V19.5C3 20.6046 3.89543 21.5 5 21.5H19C20.1046 21.5 21 20.6046 21 19.5V13.5C21 12.3954 20.1046 11.5 19 11.5H16" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-700 dark:text-gray-200">
                Tap the <span className="font-bold text-[#007AFF]">Share</span> button in Safari.
              </p>
            </div>

            {/* Step 2: Add to Home Screen */}
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white shadow-sm flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M12 9V15M3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-700 dark:text-gray-200">
                Choose <span className="font-bold">"Add to Home Screen"</span>.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-5 w-full py-3 bg-green-600 text-white text-[15px] font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all duration-200"
          >
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  );
}
