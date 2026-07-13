import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { saveEmailToFirestore } from "../../firebaseUtils";
import { isValidEmail } from "../../utils/validation";
import { Mail, BookOpen, Calendar, ArrowLeft, CheckCircle, Heart, Loader2, User, Users } from "lucide-react";
import logo from "../../assets/LOGO.webp";

export default function Subscribe() {
    const navigate = useNavigate();
    const [subType, setSubType] = useState("self"); // self | friend
    const [email, setEmail] = useState("");
    const [referrerName, setReferrerName] = useState("");
    const [friendName, setFriendName] = useState("");
    const [friendEmail, setFriendEmail] = useState("");
    
    const [status, setStatus] = useState("idle"); // idle | loading | success | error | exists
    const [errorMsg, setErrorMsg] = useState("");

    // Set page title for SEO
    useEffect(() => {
        document.title = "Subscribe to Newsletter | DietWithDee";
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
                if (result && result.exists) {
                    setStatus("exists");
                } else {
                    setStatus("success");
                    // Save subscription state locally
                    localStorage.setItem("newsletterPopupSubscribed", "true");
                }
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
                    setStatus("exists");
                } else {
                    setStatus("success");
                }
            } catch (error) {
                console.error("Friend subscription error:", error);
                setStatus("error");
                setErrorMsg("Something went wrong. Please try again later.");
            }
        }
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

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-green-200/40 blur-3xl"></div>
                <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl"></div>

                <div className="w-full max-w-lg bg-white/85 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-green-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10">
                    
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-center relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]"></div>
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-white/20 relative z-10 transition-transform hover:scale-105 duration-300">
                            <img src={logo} alt="DietWithDee Logo" className="h-16 w-auto object-contain" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight relative z-10">
                            Join the Newsletter
                        </h1>
                        <p className="text-green-50 text-sm mt-2 relative z-10">
                            Get curated wellness & nutrition advice directly from Dee
                        </p>
                    </div>

                    <div className="p-8">
                        {status !== "success" ? (
                            <form onSubmit={handleSubscribe} className="space-y-6">
                                <div className="text-center md:text-left">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 justify-center md:justify-start">
                                        <Mail className="text-green-600 w-5 h-5" /> Stay in the Loop!
                                    </h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Subscribe to receive healthy recipes, wellness updates, and science-backed diet tips straight to your inbox.
                                    </p>
                                </div>

                                {/* Subscription Type Tabs */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200/50">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubType("self");
                                            setStatus("idle");
                                        }}
                                        className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            subType === "self"
                                                ? "bg-white text-green-700 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <User size={16} /> For Myself
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubType("friend");
                                            setStatus("idle");
                                        }}
                                        className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            subType === "friend"
                                                ? "bg-white text-green-700 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <Users size={16} /> For a Friend
                                    </button>
                                </div>

                                {/* Dynamic Input Fields */}
                                <div className="space-y-4">
                                    {subType === "self" ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
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
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
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
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
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
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
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
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status === "error" && (
                                        <p className="text-sm text-red-500 font-medium px-1 animate-in fade-in slide-in-from-top-1">
                                            {errorMsg}
                                        </p>
                                    )}

                                    {status === "exists" && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-700 font-medium animate-in fade-in">
                                            {subType === "self" 
                                                ? "You are already subscribed to our newsletter! 💚" 
                                                : "Your friend is already subscribed to our newsletter! 💚"}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-[15px]"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Subscribing...
                                            </>
                                        ) : (
                                            subType === "self" ? "Subscribe Now" : "Send Subscription Invite"
                                        )}
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-center">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors font-medium"
                                    >
                                        <ArrowLeft size={16} /> Back to homepage
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-500">
                                {/* Success confirmation */}
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto text-green-600 border border-green-200 shadow-sm">
                                        <CheckCircle size={36} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-800">
                                        {subType === "self" ? "You're Subscribed! 🎉" : "Friend Subscribed! 🎁"}
                                    </h2>
                                    <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                                        {subType === "self" 
                                            ? "Check your email for a welcome message. Make sure to check your Promotions/Spam folder and drag us to Primary so you never miss an update."
                                            : `We've added ${friendName} to the newsletter list. A welcome email has been sent to them! Thank you for sharing the wellness journey.`}
                                    </p>
                                </div>

                                {/* Next Steps options */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                                        What would you like to do next?
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        <Link
                                            to="/blog"
                                            className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-gray-100 group-hover:border-green-200 transition-colors">
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-800 group-hover:text-green-800 transition-colors">
                                                    Read the Blog
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Explore delicious recipes and scientific nutrition insights.
                                                </p>
                                            </div>
                                        </Link>

                                        <Link
                                            to="/contactus"
                                            className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-gray-100 group-hover:border-green-200 transition-colors">
                                                <Calendar size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-800 group-hover:text-green-800 transition-colors">
                                                    Book a Consultation
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Schedule a 1-on-1 session with Dee for a tailored plan.
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-center">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors font-medium"
                                    >
                                        <ArrowLeft size={16} /> Return to Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer attribution */}
                    <div className="bg-gray-50/50 py-4 px-8 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1 font-medium">
                            Made with <Heart size={10} className="text-red-400 fill-red-400" /> by Diet With Dee
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}
