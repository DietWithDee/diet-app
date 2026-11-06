import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ShieldCheck,
  Download,
  Eye,
  ZoomIn,
  X,
  FileText,
  Sparkles,
  Share2,
  ChevronRight,
  Target,
  BookOpen
} from "lucide-react";
import SEO from "../../Components/SEO";
import { plans } from "../../utils/plansData";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../firebaseConfig";
import ScrollToTop from "../../utils/ScrollToTop";

export default function PlanPreview() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [activeScreenshot, setActiveScreenshot] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Find plan by ID (supporting alias fallback)
  const plan =
    plans.find(
      (p) =>
        p.id === planId ||
        (planId === "fasting-and-food" && p.id === "fasting-guide")
    ) || plans[0];

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-3">Plan Not Found</h2>
        <p className="text-stone-600 mb-6">The requested nutrition plan does not exist or has moved.</p>
        <button
          onClick={() => navigate("/plans")}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Return to Plans
        </button>
      </div>
    );
  }

  const handleBuyClick = () => {
    try {
      logEvent(analytics, "begin_checkout", {
        currency: "GHS",
        items: [
          {
            item_id: plan.id,
            item_name: plan.title,
            item_category: "Diet Plan Preview",
            price: parseFloat(plan.price.replace(/[^0-9.]/g, "")),
            quantity: 1,
          },
        ],
      });
    } catch (err) {
      console.warn("Analytics logging failed:", err);
    }
    window.open(plan.Url, "_blank", "noopener,noreferrer");
    navigate(`/checkout-success?plan=${plan.id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${plan.title} Preview | Diet With Dee`,
          text: `Check out the preview of ${plan.title} (${plan.Subtitle}) by Diet With Dee!`,
          url: url,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") console.warn("Share failed:", err);
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (copyErr) {
      console.warn("Clipboard failed:", copyErr);
    }
  };

  return (
    <>
      <ScrollToTop />
      <SEO
        title={`${plan.title} — Plan Preview & Details | Diet With Dee`}
        description={`Explore the full preview of ${plan.title}: ${plan.Subtitle}. Peek inside the guide with sample meal layouts, portion rules, and local grocery shopping tips.`}
        image={plan.previewCover || plan.img}
        url={`/plans/${plan.id}`}
      />

      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100 text-stone-900 pt-24 pb-28 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-700 bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full border border-stone-200/80 shadow-sm transition-all group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to all plans</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-2 rounded-full border border-stone-200/80 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? "Link Copied!" : "Share"}</span>
            </button>
          </div>

          {/* Hero Section: Cover Image & Main Plan Details */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-stone-200/80 shadow-xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Plan Cover Art (Using exclusive cover image from Downloads) */}
              <div className="md:col-span-5 relative group">
                <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-stone-100 ${plan.coverAspect || 'aspect-[10/9]'} bg-stone-100`}>
                  <img
                    src={plan.previewCover || plan.img}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 pointer-events-none" />
                  
                  {/* Floating Badges over Cover */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dietitian Formulated</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Synopsis, Price & CTA */}
              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-3">
                  {plan.isNew && (
                    <span className="text-[11px] font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
                      NEW RELEASE
                    </span>
                  )}
                  {plan.tags?.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight mb-2">
                  {plan.title}
                </h1>
                
                <p className="text-base sm:text-lg font-medium text-emerald-700 mb-4">
                  {plan.Subtitle}
                </p>

                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  {plan.synopsis}
                </p>

                {/* Price & Primary Buy Button */}
                <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        One-time purchase
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium mt-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Instant digital PDF download after payment</span>
                    </p>
                  </div>

                  <button
                    onClick={handleBuyClick}
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-orange-200 transition-all active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Buy Now — {plan.price}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Local Ghanaian Foods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No Expensive Exotic Ingredients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mobile & Print Ready PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lifetime Access</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Section: Look Inside The Guide (Screenshots) */}
          <div className="mb-14">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Sample Pages
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 mb-2">
                Look Inside the Guide
              </h2>
              <p className="text-sm sm:text-base text-stone-600">
                Here are actual pages extracted directly from the {plan.title} PDF so you know the exact layout, structure, and detail you are getting. Tap any page to zoom in.
              </p>
            </div>

            {/* 2-Column Responsive Screenshot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {plan.previewScreenshots?.map((screenshot, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveScreenshot(screenshot)}
                  className="group bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 mb-4 aspect-[1/1.414]">
                    <img
                      src={screenshot.src}
                      alt={screenshot.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full">
                        Click to Expand Page
                      </span>
                    </div>

                    {/* Page Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sample Page {idx + 1}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                      {screenshot.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 leading-snug">
                      {screenshot.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Who This Plan Is For & What You Get */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-14">
            
            {/* Who It's For */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Who This Plan Is For</h3>
                  <p className="text-xs text-stone-500">Designed for real daily routines</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-stone-700">
                {plan.whoIsItFor?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Get in the PDF */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">What’s Inside the PDF</h3>
                  <p className="text-xs text-stone-500">Everything delivered immediately</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-stone-700">
                {plan.whatYouGet?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Conversion Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                Get Started Today
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2">
                Ready to transform with {plan.title}?
              </h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Unlock instant, lifetime access to the complete PDF guide. Safe, seamless payment powered by Paystack.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={handleBuyClick}
                className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-orange-300 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Buy Now — {plan.price}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Floating Sticky Mobile Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 px-4 py-3 sm:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="truncate">
          <p className="text-xs font-bold text-stone-900 truncate">{plan.title}</p>
          <p className="text-sm font-black text-emerald-700">{plan.price}</p>
        </div>
        <button
          onClick={handleBuyClick}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
        >
          Buy Now
        </button>
      </div>

      {/* Lightbox / Zoom Modal for Screenshots */}
      <AnimatePresence>
        {activeScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveScreenshot(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[92vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-900/90 text-white">
                <div>
                  <h4 className="text-sm font-bold truncate">{activeScreenshot.title}</h4>
                  <p className="text-xs text-stone-400 truncate">{activeScreenshot.caption}</p>
                </div>
                <button
                  onClick={() => setActiveScreenshot(null)}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Image Display */}
              <div className="overflow-y-auto p-4 flex items-center justify-center bg-stone-950">
                <img
                  src={activeScreenshot.src}
                  alt={activeScreenshot.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              </div>

              {/* Modal Footer CTA */}
              <div className="px-5 py-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span>Diet With Dee Official PDF Preview</span>
                <button
                  onClick={handleBuyClick}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-xl text-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  Buy Complete Guide ({plan.price})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

