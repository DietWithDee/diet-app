import React from "react";

/**
 * A generic social media redirect confirmation popup.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the popup is visible
 * @param {Function} props.onClose - Function to close the popup
 * @param {Function} props.onConfirm - Function to proceed with the redirect
 * @param {string} props.platformName - Name of the social media platform (e.g., "Instagram")
 * @param {React.ReactNode} props.icon - Lucide icon component or SVG
 * @param {string} props.colorClass - Tailwind CSS classes for the icon's background gradient
 */
export default function SocialRedirectPopup({ isOpen, onClose, onConfirm, platformName, icon, colorClass }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={onClose}
            ></div>
            <div className="relative w-full max-w-[340px] overflow-hidden rounded-[1.5rem] border border-white/20 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500 ease-out">
                {/* Decorative gradients */}
                <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-3xl ${colorClass.split(' ')[0]}`}></div>
                <div className={`absolute -left-8 -bottom-8 h-28 w-28 rounded-full opacity-10 blur-3xl ${colorClass.split(' ')[0]}`}></div>

                <div className="relative p-6">
                    {/* Icon & Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`h-14 w-14 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg shadow-black/10`}>
                            <div className="text-white">
                                {icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{platformName} Redirect</h3>
                        <p className="text-gray-600 leading-relaxed text-[13px]">
                            You are about to leave this website to visit our {platformName} page. Would you like to proceed?
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-3 bg-gradient-to-r ${colorClass} text-white font-bold rounded-xl shadow-lg shadow-black/5 hover:opacity-90 active:scale-[0.98] transition-all duration-200 text-sm`}
                        >
                            Yes, Proceed
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm"
                        >
                            Back to Browsing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
