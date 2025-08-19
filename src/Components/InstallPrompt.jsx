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
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white rounded-2xl p-4 shadow-lg flex flex-col gap-2 animate-bounce">
      <p className="text-lg font-bold">Install Flywheel</p>
      <p className="text-sm">
        Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span>
      </p>
      <button
        className="bg-white text-green-600 font-bold rounded-xl py-2 mt-2"
        onClick={() => setShow(false)}
      >
        Got it
      </button>
    </div>
  );
}
