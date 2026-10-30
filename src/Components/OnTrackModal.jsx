import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import ontrackImg from '../assets/OntrackIMG.jpg';
import playstoreIcon from '../assets/playstore.webp';
import appleIcon from '../assets/apple.webp';

export const ONTRACK_ANDROID_URL =
  'https://play.google.com/store/apps/details?id=com.ontrack.app';
export const ONTRACK_IOS_URL =
  'https://apps.apple.com/us/app/ontrack-ai-diabetes-manager/id6797802105';

export default function OnTrackModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl border border-emerald-100/80 overflow-hidden"
          >
            {/* Thin accent */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            {/* Header */}
            <div className="px-6 pt-7 pb-2 text-center relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>

              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border border-emerald-100/80 shadow-sm bg-white p-0.5">
                <img
                  src={ontrackImg}
                  alt="OnTrack App"
                  className="w-full h-full object-cover object-center rounded-xl"
                />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                OnTrack App
              </h3>
              <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                Official Diabetes Tracking Partner
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Log blood sugar levels, track low-glycemic meals, and pair with DietWithDee’s guide for the best diabetes health transformation.
              </p>
            </div>

            {/* Options */}
            <div className="px-6 pt-3 pb-6 space-y-3">
              {/* Android — active */}
              <a
                href={ONTRACK_ANDROID_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all shadow-xs"
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
                  className="text-emerald-500 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </a>

              {/* iPhone — active link */}
              <a
                href={ONTRACK_IOS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform p-1.5">
                  <img
                    src={appleIcon}
                    alt="Apple App Store"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Available on App Store
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Download for iPhone
                  </h4>
                </div>
                <ExternalLink
                  size={15}
                  className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </a>

              {/* Dismiss */}
              <button
                type="button"
                onClick={onClose}
                className="w-full pt-1 text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

