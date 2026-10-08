import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../firebaseConfig";

const STORAGE_KEY = "dwd_anniversary_banner_dismissed";

export default function AnniversarySurveyBanner() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
      logEvent(analytics, "anniversary_banner_dismiss", {
        location: "plans_page",
      });
    } catch {
      // ignore
    }
  };

  const handleSurveyClick = () => {
    try {
      logEvent(analytics, "anniversary_banner_click", {
        location: "plans_page",
        target: "/survey",
      });
    } catch {
      // ignore
    }
    navigate("/survey");
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-emerald-800 text-white px-4 sm:px-5 py-3 rounded-xl shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Banner Message */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-base">🎉</span>
          <p className="leading-snug truncate sm:overflow-visible sm:whitespace-normal">
            <span className="font-bold">Celebrating 1 Year!</span>{" "}
            <span className="text-emerald-100">Take our 2-min survey to get 20% off any diet plan.</span>
          </p>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSurveyClick}
            className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Take Survey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close banner"
            className="text-emerald-200 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
