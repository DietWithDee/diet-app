import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.navigator.standalone;

    if (isIos && !isInStandalone) {
      setTimeout(() => setShow(true), 14000); // delay for better UX
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-2xl shadow-lg text-center z-50">
      <p className="text-lg font-semibold"> Install DietWithDee</p>
      <p className="text-sm mt-1">
        Tap <span className="font-bold">Share</span> (⬆) then{" "}
        <span className="font-bold">"Add to Home Screen"</span>.
      </p>
      <button
        onClick={() => setShowPrompt(false)}
        className="mt-3 px-4 py-2 bg-white text-green-600 font-bold rounded-xl"
      >
        Got it
      </button>
      </div>
  );
}
