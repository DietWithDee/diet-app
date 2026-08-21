import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Smartphone,
  ExternalLink,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import SEO from "../../Components/SEO";
import { plans } from "../../utils/plansData";
import ontrackImg from "../../assets/OntrackIMG.jpg";
import appleIcon from "../../assets/apple.webp";
import playstoreIcon from "../../assets/playstore.webp";

// Live Android URL for OnTrack App
const ONTRACK_ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.ontrack.app";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnTrackModal, setShowOnTrackModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const plan = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const planId = searchParams.get("plan");
    if (!planId) return null;
    return plans.find((p) => p.id === planId);
  }, [location.search]);

  const isDiabetesPlan = plan?.id === "blood-sugar-balance";

  return (
    <>
      <SEO
        title={plan ? `Checkout: ${plan.title}` : "Checkout Initialized"}
        description="Your secure checkout has been opened in a new tab. Please complete your payment to download your custom diet guide."
        noindex
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/30 py-16 sm:py-24 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-emerald-100/80 overflow-hidden"
          >
            {/* ── Thin emerald accent line ── */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            {/* ── Main content ── */}
            <div className="px-6 sm:px-10 pt-10 pb-8 flex flex-col items-center text-center">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                  delay: 0.15,
                }}
                className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-6"
              >
                <Check className="text-emerald-600" size={30} strokeWidth={3} />
              </motion.div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                Checkout Initialized
              </h1>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                We&apos;ve opened the secure Paystack gateway in a new tab.
                Complete your payment there.
              </p>

              {/* ── Plan summary row ── */}
              {plan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="w-full mt-8 flex items-center gap-4 text-left border border-gray-100 rounded-2xl p-4"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-100/60 bg-emerald-50/40">
                    <img
                      src={plan.img}
                      alt={plan.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate leading-tight">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {plan.Subtitle}
                    </p>
                  </div>
                  <span className="text-lg font-black text-slate-900 shrink-0">
                    {plan.price}
                  </span>
                </motion.div>
              )}

              {/* ── Steps ── */}
              <div className="w-full mt-8 text-left space-y-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  What happens next
                </p>

                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      1
                    </span>
                    <span>
                      <strong className="text-slate-800">Complete payment</strong> on the Paystack tab that just opened.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      2
                    </span>
                    <span>
                      <strong className="text-slate-800">Download your PDF</strong> from the Paystack confirmation screen.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      3
                    </span>
                    <span>
                      <strong className="text-slate-800">Check your email</strong> — Paystack sends a receipt with your download link.
                    </span>
                  </li>
                </ol>
              </div>

              {/* ── Divider ── */}
              <div className="w-full h-px bg-gray-100 my-6" />

              {/* ── CTAs ── */}
              <div className="w-full space-y-3">
                {isDiabetesPlan ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowOnTrackModal(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:brightness-105 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone size={17} />
                      Download OnTrack App
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/plans")}
                      className="w-full py-3 text-sm text-gray-500 font-semibold hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      Back to Plans
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/plans")}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:brightness-105 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      Back to Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/my-journey")}
                      className="w-full py-3 text-sm text-gray-500 font-semibold hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} className="text-emerald-500" />
                      Explore My Journey Portal
                      <ArrowRight size={14} className="text-gray-400" />
                    </button>
                  </>
                )}
              </div>

              {/* ── OnTrack companion suggestion (diabetes only) ── */}
              {isDiabetesPlan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full mt-6 pt-5 border-t border-gray-100 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-emerald-100/80 shadow-xs bg-white">
                      <img
                        src={ontrackImg}
                        alt="OnTrack App"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 leading-tight">
                        Recommended companion app
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        OnTrack × DietWithDee — track blood sugar &amp; pair with your guide.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOnTrackModal(true)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                    >
                      Get&nbsp;→
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Help footer ── */}
              <div className="w-full mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <HelpCircle size={12} className="text-gray-300" />
                  Need help?{" "}
                  <a
                    href="mailto:dietwdee@gmail.com"
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    dietwdee@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  ONTRACK DOWNLOAD MODAL                        */}
      {/* ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showOnTrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnTrackModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Thin accent */}
              <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

              {/* Header */}
              <div className="px-6 pt-7 pb-1 text-center relative">
                <button
                  type="button"
                  onClick={() => setShowOnTrackModal(false)}
                  className="absolute top-5 right-5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={15} />
                </button>

                <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 border border-emerald-100/80 shadow-xs bg-white">
                  <img
                    src={ontrackImg}
                    alt="OnTrack App"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Get OnTrack App
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Choose your platform
                </p>
              </div>

              {/* Options */}
              <div className="px-6 pt-5 pb-6 space-y-3">
                {/* Android — active */}
                <a
                  href={ONTRACK_ANDROID_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform p-2">
                    <img
                      src={playstoreIcon}
                      alt="Google Play Store"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Available Now
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Download for Android
                    </h4>
                  </div>
                  <ExternalLink
                    size={15}
                    className="text-emerald-400 group-hover:text-emerald-600 transition-colors shrink-0"
                  />
                </a>

                {/* iPhone — blurred / coming soon */}
                <div className="relative rounded-2xl border border-gray-100 p-3.5 overflow-hidden select-none cursor-not-allowed">
                  <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      iOS — Coming Soon
                    </span>
                  </div>

                  <div className="flex items-center gap-3 filter blur-[1px] opacity-50">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 p-1.5">
                      <img
                        src={appleIcon}
                        alt="Apple App Store"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-bold text-slate-900">
                        Download for iPhone
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={() => setShowOnTrackModal(false)}
                  className="w-full pt-2 text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
