import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { saveEmailToFirestore } from "../../firebaseUtils";
import { isValidEmail } from "../../utils/validation";
import { Mail, BookOpen, Calendar, ArrowLeft, CheckCircle, Heart, Loader2, User, Users, RefreshCw } from "lucide-react";
import logo from "../../assets/LOGO.webp";

export default function Subscribe() {
    const navigate = useNavigate();
    const [subType, setSubType] = useState("self"); // self | friend
    const [email, setEmail] = useState("");
    const [referrerName, setReferrerName] = useState("");
    const [friendName, setFriendName] = useState("");
    const [friendEmail, setFriendEmail] = useState("");
    
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Set page title for SEO and check local subscription status
    useEffect(() => {
        document.title = "Subscribe to Newsletter | DietWithDee";
        if (localStorage.getItem("newsletterPopupSubscribed") === "true") {
            setStatus("success");
            setIsAlreadySubscribed(true);
        }
    }, []);

    const handleSubscribe = async (e) => {
        if (e) e.preventDefault();
        
        if (subType === "self") {
            const trimmed = email.trim().toLowerCase();
            if (!trimmed || !isValidEmail(trimmed)) {
                setStatus("error");
                setErrorMsg("Please enter a valid email address.");
                return;
            }

            setStatus("loading");
            try {
                const result = await saveEmailToFirestore(trimmed);
                localStorage.setItem("newsletterPopupSubscribed", "true");
                if (result && result.exists) {
                    setIsAlreadySubscribed(true);
                } else {
                    setIsAlreadySubscribed(false);
                }
                setStatus("success");
            } catch (error) {
                console.error("Subscription error:", error);
                setStatus("error");
                setErrorMsg("Something went wrong. Please try again later.");
            }
        } else {
            const trimmedFriendEmail = friendEmail.trim().toLowerCase();
            const trimmedReferrer = referrerName.trim();
            const trimmedFriendName = friendName.trim();

            if (!trimmedFriendEmail || !isValidEmail(trimmedFriendEmail)) {
                setStatus("error");
                setErrorMsg("Please enter a valid email address for your friend.");
                return;
            }
            if (!trimmedReferrer) {
                setStatus("error");
                setErrorMsg("Please enter your name.");
                return;
            }
            if (!trimmedFriendName) {
                setStatus("error");
                setErrorMsg("Please enter your friend's name.");
                return;
            }

            setStatus("loading");
            try {
                const result = await saveEmailToFirestore(trimmedFriendEmail, {
                    isFriendReferral: true,
                    referredBy: trimmedReferrer,
                    recipientName: trimmedFriendName
                });
                if (result && result.exists) {
                    setIsAlreadySubscribed(true);
                } else {
                    setIsAlreadySubscribed(false);
                }
                setStatus("success");
            } catch (error) {
                console.error("Friend subscription error:", error);
                setStatus("error");
                setErrorMsg("Something went wrong. Please try again later.");
            }
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setIsAlreadySubscribed(false);
        setEmail("");
        setFriendEmail("");
        setFriendName("");
    };

    return (
        <>
            <Helmet>
                <title>Subscribe to Newsletter | DietWithDee</title>
                <meta name="description" content="Subscribe to DietWithDee's newsletter for healthy recipes, wellness insights, and exclusive diet tips straight to your inbox." />
                <meta property="og:title" content="Subscribe to Newsletter | DietWithDee" />
                <meta property="og:description" content="Get healthy recipes, wellness insights, and exclusive diet tips straight to your inbox." />
                <meta property="og:type" content="website" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden font-inter">
                {/* Decorative background blobs */}
                <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-green-200/30 blur-3xl"></div>
                <div className="absolute -left-12 -bottom-12 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"></div>

                <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-green-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10">
                    
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 p-8 md:p-10 text-center relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)]"></div>
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-white/20 relative z-10 transition-transform hover:scale-105 duration-300">
                            <img src={logo} alt="DietWithDee Logo" className="h-20 w-auto object-contain" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight relative z-10 font-inter">
                            Join the Newsletter
                        </h1>
                        <p className="text-green-100 text-sm md:text-base mt-2 relative z-10 font-medium opacity-90">
                            Get curated wellness & nutrition advice directly from Dee
                        </p>
                    </div>

                    <div className="p-8 md:p-10">
                        {status !== "success" ? (
                            <form onSubmit={handleSubscribe} className="space-y-6">
                                <div className="text-center md:text-left">
                                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2 justify-center md:justify-start">
                                        <Mail className="text-green-600 w-6 h-6" /> Stay in the Loop!
                                    </h2>
                                    <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
                                        Subscribe to receive healthy recipes, wellness updates, and science-backed diet tips straight to your inbox.
                                    </p>
                                </div>

                                {/* Subscription Type Tabs */}
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/30">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubType("self");
                                            setStatus("idle");
                                        }}
                                        className={`py-3.5 text-[14px] md:text-[15px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            subType === "self"
                                                ? "bg-white text-green-700 shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <User size={18} /> For Myself
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubType("friend");
                                            setStatus("idle");
                                        }}
                                        className={`py-3.5 text-[14px] md:text-[15px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            subType === "friend"
                                                ? "bg-white text-green-700 shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <Users size={18} /> For a Friend
                                    </button>
                                </div>

                                {/* Dynamic Input Fields */}
                                <div className="space-y-5">
                                    {subType === "self" ? (
                                        <div className="space-y-2">
                                            <label className="text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block px-1">
                                                Your Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setStatus("idle");
                                                }}
                                                placeholder="Enter your best email address"
                                                disabled={status === "loading"}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 font-medium"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block px-1">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={referrerName}
                                                    onChange={(e) => {
                                                        setReferrerName(e.target.value);
                                                        setStatus("idle");
                                                    }}
                                                    placeholder="What's your name?"
                                                    disabled={status === "loading"}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 font-medium"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block px-1">
                                                        Friend's Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={friendName}
                                                        onChange={(e) => {
                                                            setFriendName(e.target.value);
                                                            setStatus("idle");
                                                        }}
                                                        placeholder="Friend's first name"
                                                        disabled={status === "loading"}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 font-medium"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block px-1">
                                                        Friend's Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={friendEmail}
                                                        onChange={(e) => {
                                                            setFriendEmail(e.target.value);
                                                            setStatus("idle");
                                                        }}
                                                        placeholder="friend@example.com"
                                                        disabled={status === "loading"}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status === "error" && (
                                        <p className="text-sm text-red-500 font-semibold px-1 animate-in fade-in slide-in-from-top-1">
                                            {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full py-4.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-green-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-[16px]"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Subscribing...
                                            </>
                                        ) : (
                                            subType === "self" ? "Subscribe Now" : "Send Invite"
                                        )}
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-center">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-sm md:text-[15px] text-gray-500 hover:text-green-600 transition-colors font-semibold"
                                    >
                                        <ArrowLeft size={16} /> Back to homepage
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-500">
                                {/* Success confirmation */}
                                <div className="text-center space-y-3">
                                    <div className="w-18 h-18 bg-green-100 rounded-2xl flex items-center justify-center mx-auto text-green-600 border border-green-200 shadow-sm">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
                                        {isAlreadySubscribed 
                                            ? "You're Already Subscribed! 💚" 
                                            : subType === "self" 
                                                ? "You're Subscribed! 🎉" 
                                                : "Friend Subscribed! 🎁"}
                                    </h2>
                                    <p className="text-gray-600 text-[14px] md:text-[15px] leading-relaxed max-w-md mx-auto">
                                        {isAlreadySubscribed
                                            ? "It looks like this email is already registered on our list! You are fully set up to receive wellness & diet tips directly."
                                            : subType === "self" 
                                                ? "Check your email for a welcome message. Make sure to check your Promotions/Spam folder and drag us to Primary so you never miss an update."
                                                : `We've added ${friendName} to the list. A welcome email has been sent to them! Thank you for sharing the wellness journey.`}
                                    </p>
                                </div>

                                {/* Next Steps options */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                                        What would you like to do next?
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <Link
                                            to="/blog"
                                            className="group flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-green-50/70 hover:border-green-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-gray-100 group-hover:border-green-200 transition-colors flex-shrink-0">
                                                <BookOpen size={26} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-extrabold text-[16px] md:text-lg text-gray-900 group-hover:text-green-800 transition-colors">
                                                    Read the Blog
                                                </h4>
                                                <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
                                                    Explore delicious recipes and scientific nutrition insights.
                                                </p>
                                            </div>
                                        </Link>

                                        <Link
                                            to="/contactus"
                                            className="group flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-green-50/70 hover:border-green-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-gray-100 group-hover:border-green-200 transition-colors flex-shrink-0">
                                                <Calendar size={26} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-extrabold text-[16px] md:text-lg text-gray-900 group-hover:text-green-800 transition-colors">
                                                    Book a Consultation
                                                </h4>
                                                <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
                                                    Schedule a 1-on-1 session with Dee for a tailored plan.
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-4 border-t border-gray-100">
                                    <button
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-green-700 hover:text-green-800 transition-colors py-2 px-4 rounded-xl bg-green-50 hover:bg-green-100/80 cursor-pointer"
                                    >
                                        <RefreshCw size={14} /> Subscribe someone else
                                    </button>
                                    
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-sm md:text-[15px] text-gray-500 hover:text-green-600 transition-colors font-semibold"
                                    >
                                        <ArrowLeft size={16} /> Return to Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer attribution */}
                    <div className="bg-gray-50/50 py-4 px-8 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1 font-semibold">
                            Made with <Heart size={10} className="text-red-400 fill-red-400" /> by Diet With Dee
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}
