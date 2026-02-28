import React, { useEffect, useState } from "react";
import { saveEmailToFirestore } from "../firebaseUtils";
import { isValidEmail } from "../utils/validation";

const LS_KEY_DISMISSED = "newsletterPopupLastDismissed";
const LS_KEY_COUNT = "newsletterPopupCount";
const LS_KEY_SUBSCRIBED = "newsletterPopupSubscribed";

export default function NewsletterPopup() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | error | exists
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        // Already subscribed via popup — never show again
        if (localStorage.getItem(LS_KEY_SUBSCRIBED) === "true") return;

        const lastDismissed = localStorage.getItem(LS_KEY_DISMISSED);
        const count = parseInt(localStorage.getItem(LS_KEY_COUNT) || "0");

        if (!lastDismissed) {
            setTimeout(() => setShow(true), 8000);
        } else {
            const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            let waitDays = 3;
            if (count === 2) waitDays = 7;
            if (count >= 3) waitDays = 14;

            if (daysSince >= waitDays) {
                setTimeout(() => setShow(true), 5000);
            }
        }
    }, []);

    const handleDismiss = () => {
        setShow(false);
        const currentCount = parseInt(localStorage.getItem(LS_KEY_COUNT) || "0");
        localStorage.setItem(LS_KEY_COUNT, (currentCount + 1).toString());
        localStorage.setItem(LS_KEY_DISMISSED, Date.now().toString());
    };

    const handleSubscribe = async () => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !isValidEmail(trimmed)) {
            setStatus("error");
            setErrorMsg("Please enter a valid email.");
            return;
        }

        setStatus("loading");
        try {
            const result = await saveEmailToFirestore(trimmed);
            if (result && result.exists) {
                setStatus("exists");
            } else {
                setStatus("success");
                localStorage.setItem(LS_KEY_SUBSCRIBED, "true");
                setTimeout(() => setShow(false), 3000);
            }
        } catch {
            setStatus("error");
            setErrorMsg("Something went wrong. Try again later.");
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleDismiss}></div>
            <div className="relative w-full max-w-[380px] overflow-hidden rounded-[1.5rem] border border-white/30 bg-white/95 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-700 ease-out">
                {/* Decorative blobs */}
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-500/10 blur-2xl"></div>
                <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-emerald-400/10 blur-xl"></div>

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-gray-900 leading-tight">Stay in the loop!</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Get nutrition tips straight to your inbox</p>
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

                    {/* Success State */}
                    {status === "success" ? (
                        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-200 mt-2">
                            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-[14px] text-green-800 font-semibold">You're subscribed! 🎉</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-[13px] text-gray-600 mb-4">
                                Subscribe to our newsletter for healthy recipes, wellness insights, and exclusive diet tips.
                            </p>

                            {/* Input + Button */}
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                                    placeholder="Enter your email"
                                    disabled={status === "loading"}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={status === "loading"}
                                    className="px-5 py-3 bg-green-600 text-white text-[14px] font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 hover:bg-green-700 flex-shrink-0"
                                >
                                    {status === "loading" ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    ) : "Join"}
                                </button>
                            </div>

                            {/* Feedback Messages */}
                            {status === "error" && (
                                <p className="text-[12px] text-red-500 mt-2 font-medium">{errorMsg}</p>
                            )}
                            {status === "exists" && (
                                <p className="text-[12px] text-amber-600 mt-2 font-medium">You're already subscribed! 💚</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
